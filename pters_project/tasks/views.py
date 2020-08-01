import datetime
import json

import logging

import httplib2
from django.db.models import Q
from django.db.models.expressions import RawSQL
from django.http import JsonResponse
from django.utils import timezone
from django.shortcuts import render

# Create your views here.
from django.views import View

from configs import settings
from configs.settings import DEBUG
from configs.const import USE, OFF_SCHEDULE_TYPE, UN_USE, AUTO_CANCEL_ON, AUTO_ABSENCE_ON, AUTO_FINISH_ON, \
    ON_SCHEDULE_TYPE, AUTO_FINISH_OFF, STATE_CD_NOT_PROGRESS, STATE_CD_FINISH, STATE_CD_ABSENCE, STATE_CD_IN_PROGRESS, \
    PERMISSION_STATE_CD_WAIT, PERMISSION_STATE_CD_APPROVE, STATE_CD_HOLDING
from login.models import PushInfoTb
from payment.models import BillingInfoTb, PaymentInfoTb
from schedule.functions import func_send_push_trainer, func_send_push_trainee, func_refresh_member_ticket_count
from schedule.models import RepeatScheduleTb, ScheduleTb, DeleteScheduleTb, ScheduleAlarmTb
from trainee.models import MemberClosedDateHistoryTb, MemberTicketTb
from trainer.functions import func_update_lecture_member_fix_status_cd
from trainer.models import ClassMemberTicketTb, SettingTb

if DEBUG is False:
    from tasks.tasks import task_send_aws_lambda_for_push_alarm

logger = logging.getLogger(__name__)


def func_update_finish_member_ticket_data():
    now = timezone.now()
    today = datetime.date.today()
    yesterday = today - datetime.timedelta(days=1)

    # 일시정지 반영
    holding_data = MemberClosedDateHistoryTb.objects.filter(start_date__lte=today, reason_type_cd='HD',
                                                            end_date__gte=yesterday, use=USE).order_by('start_date')

    for holding_info in holding_data:
        member_ticket_tb = holding_info.member_ticket_tb
        if holding_info.start_date <= today <= holding_info.end_date:
            # holding 기간에 속한 경우 일시정지 처리
            member_ticket_tb.state_cd = STATE_CD_HOLDING

        elif today > holding_info.end_date:
            # holding 기간이 지난 경우 재개 처리
            if member_ticket_tb.state_cd == STATE_CD_HOLDING:
                member_ticket_tb.state_cd = STATE_CD_IN_PROGRESS

        member_ticket_tb.save()
    # token_data = PushInfoTb.objects.filter(member_id=member_id, last_login__lte=now-90일, use=USE)
    # token_data.delete()

    query_setting_ticket_auto_finish = "SELECT A.SETTING_INFO FROM SETTING_TB AS A" \
                                       " WHERE A.CLASS_TB_ID=`CLASS_LECTURE_TB`.`CLASS_TB_ID`" \
                                       " AND A.SETTING_TYPE_CD = \'LT_LECTURE_AUTO_FINISH\' " \
                                       " AND A.USE=1"
    # 지난 수강권 처리
    class_member_ticket_data = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__ticket_tb').filter(
        auth_cd='VIEW', member_ticket_tb__end_date__lt=datetime.date.today(),
        member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS, member_ticket_tb__use=USE,
        use=USE).annotate(setting_ticket_auto_finish=RawSQL(query_setting_ticket_auto_finish,
                                                            [])).filter(setting_ticket_auto_finish=USE)

    for class_member_ticket_info in class_member_ticket_data:
        member_ticket_info = class_member_ticket_info.member_ticket_tb
        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_member_ticket_info.class_tb_id,
                                                  member_ticket_tb_id=member_ticket_info.member_ticket_id,
                                                  end_dt__lte=now,
                                                  use=USE).exclude(Q(state_cd=STATE_CD_FINISH)
                                                                   | Q(state_cd=STATE_CD_ABSENCE))
        schedule_data_delete = ScheduleTb.objects.filter(
            member_ticket_tb_id=member_ticket_info.member_ticket_id, end_dt__gt=now,
            use=USE).exclude(Q(state_cd=STATE_CD_FINISH) | Q(state_cd=STATE_CD_ABSENCE))
        repeat_schedule_data = RepeatScheduleTb.objects.filter(
            member_ticket_tb_id=member_ticket_info.member_ticket_id)
        if len(schedule_data) > 0:
            schedule_data.update(state_cd=STATE_CD_FINISH)
        if len(schedule_data_delete) > 0:
            schedule_data_delete.delete()
        if len(repeat_schedule_data) > 0:
            repeat_schedule_data.delete()
        member_ticket_info.member_ticket_avail_count = 0
        member_ticket_info.member_ticket_rem_count = 0
        member_ticket_info.state_cd = STATE_CD_FINISH
        member_ticket_info.save()

        if member_ticket_info is not None and member_ticket_info != '':
            func_update_lecture_member_fix_status_cd(class_member_ticket_info.class_tb_id, member_ticket_info.member_id)


def func_update_finish_pass_data():
    today = datetime.date.today()

    billing_data = BillingInfoTb.objects.filter(next_payment_date__lt=today, use=USE)

    payment_data = PaymentInfoTb.objects.filter(Q(status='paid') | Q(status='reserve'),
                                                start_date__lte=today, end_date__gte=today,
                                                use=USE).order_by('product_tb_id', '-end_date')

    if len(payment_data) == 0:
        for billing_info in billing_data:
            billing_info.state_cd = 'END'
            # billing_info.use = UN_USE
            billing_info.save()


# 일정 알림 push 처리
def send_push_alarm_logic(request):

    from configs.celery import update_celery_status
    update_celery_status()

    alarm_dt = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:00')
    # 개인 수업 일정
    query_common_cd = "SELECT COMMON_CD_NM FROM COMMON_CD_TB WHERE COMMON_CD=`CLASS_TB`.`SUBJECT_CD`"
    schedule_data = ScheduleTb.objects.select_related(
        'class_tb', 'lecture_tb',
        'member_ticket_tb__member'
    ).filter(alarm_dt=alarm_dt,
             use=USE).annotate(class_type_name=RawSQL(query_common_cd, [])).exclude(en_dis_type=OFF_SCHEDULE_TYPE)

    for schedule_info in schedule_data:
        schedule_delta_seconds = (schedule_info.start_dt-schedule_info.alarm_dt).seconds
        minute_message = str(int(schedule_delta_seconds/60)) + '분'
        class_type_name = schedule_info.class_type_name
        if schedule_info.class_type_name is None or schedule_info.class_type_name == '':
            class_type_name = schedule_info.class_tb.subject_detail_nm

        push_info_schedule_start_date = str(schedule_info.start_dt).split(':')
        push_info_schedule_end_date = str(schedule_info.end_dt).split(' ')[1].split(':')

        # 개인 수업 일정
        class_tb_id = schedule_info.class_tb_id
        member_ticket_tb_id = schedule_info.member_ticket_tb_id
        push_title = class_type_name+' - 일정 알림'
        push_message = push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1] + '~'\
                       + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]\
                       + ' ' + minute_message + '전 입니다.'
        if schedule_info.lecture_tb is None:

            func_send_push_trainer(class_tb_id, member_ticket_tb_id, push_title,
                                   ' [개인] 수업 '+push_message)
            func_send_push_trainee(class_tb_id, class_type_name+' - 일정 알림',
                                   ' [개인] 수업 '+push_message)

        else:
            # 그룹 수업 일정
            if schedule_info.lecture_schedule_id is None:
                func_send_push_trainee(class_tb_id, push_title,
                                       ' [' + schedule_info.lecture_tb.name + '] '+push_message)
            # 그룹의 회원 수업 일정
            else:
                func_send_push_trainer(class_tb_id, member_ticket_tb_id, push_title,
                                       ' [' + schedule_info.lecture_tb.name + '] '+push_message)

    return render(request, 'ajax/task_error_info.html')


# 지난 일정 처리
def update_finish_schedule_data_logic(request):
    now = timezone.now()
    class_id = request.session.get('class_id', '')
    setting_schedule_auto_finish = request.session.get('setting_schedule_auto_finish', AUTO_FINISH_OFF)
    setting_member_wait_schedule_auto_cancel_time \
        = request.session.get('setting_member_wait_schedule_auto_cancel_time', 0)
    if class_id is not None and class_id != '':
        if str(setting_schedule_auto_finish) != str(AUTO_FINISH_OFF):
            not_finish_schedule_data = ScheduleTb.objects.select_related(
                'member_ticket_tb'
            ).filter(class_tb_id=class_id, state_cd=STATE_CD_NOT_PROGRESS,
                     en_dis_type=ON_SCHEDULE_TYPE, end_dt__lte=now, use=USE
                     )
            for not_finish_schedule_info in not_finish_schedule_data:
                lecture_tb = not_finish_schedule_info.lecture_tb
                lecture_tb_id = None
                member_ticket_tb = not_finish_schedule_info.member_ticket_tb
                member_ticket_tb_id = None
                repeat_schedule_tb = not_finish_schedule_info.repeat_schedule_tb
                repeat_schedule_tb_id = None
                permission_state_cd = not_finish_schedule_info.permission_state_cd

                if member_ticket_tb is not None and member_ticket_tb != '':
                    member_ticket_tb_id = not_finish_schedule_info.member_ticket_tb_id
                if lecture_tb is not None and lecture_tb != '':
                    lecture_tb_id = not_finish_schedule_info.lecture_tb_id
                if repeat_schedule_tb is not None and repeat_schedule_tb != '':
                    repeat_schedule_tb_id = not_finish_schedule_info.repeat_schedule_tb_id
                if permission_state_cd == PERMISSION_STATE_CD_APPROVE:
                    if str(setting_schedule_auto_finish) == str(AUTO_FINISH_ON):
                        not_finish_schedule_info.state_cd = STATE_CD_FINISH
                        not_finish_schedule_info.save()
                    elif str(setting_schedule_auto_finish) == str(AUTO_ABSENCE_ON):
                        not_finish_schedule_info.state_cd = STATE_CD_ABSENCE
                        not_finish_schedule_info.save()
                    elif str(setting_schedule_auto_finish) == str(AUTO_CANCEL_ON):
                        finish_lecture_member_schedule_count = 0
                        if lecture_tb_id is not None and lecture_tb_id != '':
                            if member_ticket_tb_id is None or member_ticket_tb_id == '':
                                finish_lecture_member_schedule_count = ScheduleTb.objects.filter(
                                    lecture_schedule_id=not_finish_schedule_info.schedule_id,
                                    use=USE).exclude(state_cd=STATE_CD_NOT_PROGRESS).count()

                        if finish_lecture_member_schedule_count == 0:
                            delete_schedule_info = DeleteScheduleTb(
                                schedule_id=not_finish_schedule_info.schedule_id,
                                class_tb_id=not_finish_schedule_info.class_tb_id,
                                lecture_tb_id=lecture_tb_id,
                                member_ticket_tb_id=member_ticket_tb_id,
                                lecture_schedule_id=not_finish_schedule_info.lecture_schedule_id,
                                delete_repeat_schedule_tb=repeat_schedule_tb_id,
                                start_dt=not_finish_schedule_info.start_dt, end_dt=not_finish_schedule_info.end_dt,
                                permission_state_cd=not_finish_schedule_info.permission_state_cd,
                                state_cd=not_finish_schedule_info.state_cd, note=not_finish_schedule_info.note,
                                en_dis_type=not_finish_schedule_info.en_dis_type,
                                member_note=not_finish_schedule_info.member_note,
                                reg_member_id=not_finish_schedule_info.reg_member_id, del_member='auto',
                                reg_dt=not_finish_schedule_info.reg_dt, mod_dt=timezone.now(),
                                use=UN_USE)
                            delete_schedule_info.save()
                            not_finish_schedule_info.delete()
                        # member_ticket_tb_id = delete_schedule_info.member_ticket_tb_id
                    if member_ticket_tb_id is not None:
                        func_refresh_member_ticket_count(not_finish_schedule_info.class_tb_id, member_ticket_tb_id)
                else:
                    delete_schedule_info = DeleteScheduleTb(
                        schedule_id=not_finish_schedule_info.schedule_id,
                        class_tb_id=not_finish_schedule_info.class_tb_id,
                        lecture_tb_id=lecture_tb_id,
                        member_ticket_tb_id=member_ticket_tb_id,
                        lecture_schedule_id=not_finish_schedule_info.lecture_schedule_id,
                        delete_repeat_schedule_tb=repeat_schedule_tb_id,
                        start_dt=not_finish_schedule_info.start_dt, end_dt=not_finish_schedule_info.end_dt,
                        permission_state_cd=not_finish_schedule_info.permission_state_cd,
                        state_cd=not_finish_schedule_info.state_cd, note=not_finish_schedule_info.note,
                        en_dis_type=not_finish_schedule_info.en_dis_type,
                        member_note=not_finish_schedule_info.member_note,
                        reg_member_id=not_finish_schedule_info.reg_member_id, del_member='auto',
                        reg_dt=not_finish_schedule_info.reg_dt, mod_dt=timezone.now(),
                        use=UN_USE)
                    delete_schedule_info.save()
                    not_finish_schedule_info.delete()
                    # member_ticket_tb_id = delete_schedule_info.member_ticket_tb_id
                    if member_ticket_tb_id is not None:
                        func_refresh_member_ticket_count(not_finish_schedule_info.class_tb_id, member_ticket_tb_id)

    end_time = timezone.now()
    logger.info('finish_schedule_data_time'+str(end_time-now))
    return render(request, 'ajax/task_error_info.html')


# 지난 수강권 지난 pass 처리
def update_daily_data_logic(request):
    func_update_finish_member_ticket_data()
    func_update_finish_pass_data()

    return render(request, 'ajax/task_error_info.html')


class SendAllSchedulePushAlarmDataView(View):

    def get(self, request):
        # start_time = timezone.now()
        error = None
        now = timezone.now()
        alarm_dt = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:00')

        # 알람 관련된 데이터 가져오기
        query_common_cd = "SELECT COMMON_CD_NM FROM COMMON_CD_TB WHERE COMMON_CD=`CLASS_TB`.`SUBJECT_CD`"
        alarm_schedule_data = ScheduleAlarmTb.objects.select_related(
            'class_tb__member', 'schedule_tb__lecture_tb',
            'schedule_tb__member_ticket_tb__member').filter(alarm_dt=alarm_dt,
                                                            schedule_tb__permission_state_cd=PERMISSION_STATE_CD_APPROVE,
                                                            use=USE).annotate(class_type_name=RawSQL(query_common_cd,
                                                                                                     []))
        # schedule 정보에서 push_alarm_data json 타입으로 변경 및 member_id 추출
        schedule_list = []
        # 보내야 하는 회원의 token 가져오기
        token_data = PushInfoTb.objects.filter(use=USE).values('member_id', 'token', 'badge_counter')

        push_alarm_list = {}

        for alarm_schedule_info in alarm_schedule_data:
            registration_ids = []
            schedule_info = alarm_schedule_info.schedule_tb
            alarm_minute = alarm_schedule_info.alarm_minute
            class_type_name = alarm_schedule_info.class_type_name
            if schedule_info.class_tb.subject_detail_nm != '':
                class_type_name = schedule_info.class_tb.subject_detail_nm
            alarm_title = class_type_name + ' - 일정 '

            log_info_schedule_start_date = str(schedule_info.start_dt).split(' ')[1].split(':')
            log_info_schedule_end_date = str(schedule_info.end_dt).split(' ')[1].split(':')
            log_info_schedule_start_date = log_info_schedule_start_date[0] + ':' + log_info_schedule_start_date[1]
            log_info_schedule_end_date = log_info_schedule_end_date[0] + ':' + log_info_schedule_end_date[1]

            alarm_message = log_info_schedule_start_date + '~' + log_info_schedule_end_date + ' '
            if str(schedule_info.en_dis_type) != OFF_SCHEDULE_TYPE:
                if schedule_info.lecture_tb is not None\
                        and schedule_info.lecture_tb != '':
                    alarm_message += '[' + schedule_info.lecture_tb.name + '] '

                if schedule_info.member_ticket_tb is not None\
                        and schedule_info.member_ticket_tb != '':
                    alarm_message += schedule_info.member_ticket_tb.member.name + ' 회원님 '

                if alarm_minute == 0:
                    alarm_title += '시작 알림'
                elif alarm_minute < 60:
                    alarm_title += str(alarm_minute) + '분 전 알림'
                elif alarm_minute < 1440:
                    alarm_title += str(int(alarm_minute/60)) + '시간 전 알림'
                else:
                    alarm_title += str(int(alarm_minute/60)) + '일 전 알림'
                alarm_message += '일정'

            for token_info in token_data:
                if str(alarm_schedule_info.member_id) == str(token_info['member_id']):
                    registration_ids.append(token_info['token'])

            try:
                push_alarm_list[alarm_schedule_info.class_tb_id]

            except KeyError:
                push_alarm_list[alarm_schedule_info.class_tb_id] = {
                    'registration_ids': [],
                    'title': alarm_title,
                    'message': alarm_message

                }
            push_alarm_list[alarm_schedule_info.class_tb_id]['registration_ids'] += registration_ids

        # 우선 현재 시간 지난 대기 일정 조회후 다 지우고 메시지 날리기
        # 지점에 설정된 대기 취소 시간 목록 불러오기
        not_finish_wait_schedule_time = now + datetime.timedelta(minutes=1440)

        query_common_cd = "SELECT COMMON_CD_NM FROM COMMON_CD_TB WHERE COMMON_CD=`CLASS_TB`.`SUBJECT_CD`"
        query_wait_cancel_setting = "SELECT SETTING_INFO FROM SETTING_TB" \
                                    " WHERE CLASS_TB_ID=`SCHEDULE_TB`.`CLASS_TB_ID`" \
                                    " and SETTING_TYPE_CD='LT_RES_WAIT_SCHEDULE_AUTO_CANCEL_TIME'"

        not_finish_wait_schedule_data = ScheduleTb.objects.select_related('class_tb', 'lecture_tb',
                                                                          'member_ticket_tb__member').filter(
            permission_state_cd=PERMISSION_STATE_CD_WAIT, en_dis_type=ON_SCHEDULE_TYPE,
            start_dt__lte=not_finish_wait_schedule_time,
            use=USE).annotate(wait_cancel_setting=RawSQL('IFNULL(('+query_wait_cancel_setting+' ), 0)', []),
                              class_type_name=RawSQL(query_common_cd, []))

        not_finish_registration_ids = []
        for not_finish_wait_schedule_info in not_finish_wait_schedule_data:
            check_time = now + datetime.timedelta(minutes=int(not_finish_wait_schedule_info.wait_cancel_setting))
            if not_finish_wait_schedule_info.start_dt <= check_time:
                for token_info in token_data:
                    if str(not_finish_wait_schedule_info.member_ticket_tb.member_id) == str(token_info['member_id']):
                        not_finish_registration_ids.append(token_info['token'])

                class_type_name = not_finish_wait_schedule_info.class_type_name
                if not_finish_wait_schedule_info.class_tb.subject_detail_nm != '':
                    class_type_name = not_finish_wait_schedule_info.class_tb.subject_detail_nm
                cancel_title = class_type_name + ' - 대기 예약 취소 알림'

                log_info_schedule_start_date = str(not_finish_wait_schedule_info.start_dt).split(' ')[1].split(':')
                log_info_schedule_end_date = str(not_finish_wait_schedule_info.end_dt).split(' ')[1].split(':')
                log_info_schedule_start_date = log_info_schedule_start_date[0] + ':' + log_info_schedule_start_date[1]
                log_info_schedule_end_date = log_info_schedule_end_date[0] + ':' + log_info_schedule_end_date[1]
                cancel_message = log_info_schedule_start_date + '~' + log_info_schedule_end_date + ' '

                if not_finish_wait_schedule_info.lecture_tb is not None\
                        and not_finish_wait_schedule_info.lecture_tb != '':
                    cancel_message += '[' + not_finish_wait_schedule_info.lecture_tb.name + '] '
                #
                # if not_finish_wait_schedule_info.member_ticket_tb is not None\
                #         and not_finish_wait_schedule_info.member_ticket_tb != '':
                #     cancel_message += not_finish_wait_schedule_info.member_ticket_tb.member.name + ' 회원님 '

                # cancel_message += '일정'

                try:
                    push_alarm_list['cancel_'+str(not_finish_wait_schedule_info.class_tb_id)]

                except KeyError:
                    push_alarm_list['cancel_'+str(not_finish_wait_schedule_info.class_tb_id)] = {
                        'registration_ids': [],
                        'title': cancel_title,
                        'message': cancel_message

                    }
                push_alarm_list['cancel_'+str(not_finish_wait_schedule_info.class_tb_id)]['registration_ids']\
                    += not_finish_registration_ids

                not_finish_wait_schedule_info_class_id = not_finish_wait_schedule_info.class_tb_id
                not_finish_wait_schedule_info_member_ticket_tb_id = None
                if not_finish_wait_schedule_info.member_ticket_tb is not None and not_finish_wait_schedule_info.member_ticket_tb != '':
                    not_finish_wait_schedule_info_member_ticket_tb_id = not_finish_wait_schedule_info.member_ticket_tb_id

                not_finish_wait_schedule_info.delete()
                if not_finish_wait_schedule_info_member_ticket_tb_id is not None:
                    func_refresh_member_ticket_count(not_finish_wait_schedule_info_class_id,
                                                     not_finish_wait_schedule_info_member_ticket_tb_id)

        for push_alarm_info in push_alarm_list:
            if len(push_alarm_list[push_alarm_info]['registration_ids']) > 0:
                schedule_info = {
                    'registration_ids': push_alarm_list[push_alarm_info]['registration_ids'],
                    'title': push_alarm_list[push_alarm_info]['title'],
                    'message': push_alarm_list[push_alarm_info]['message']
                }
                schedule_list.append(schedule_info)

        check_async = False
        if DEBUG is False:
            check_async = True
        if len(schedule_list) > 0:
            if check_async:
                task_send_aws_lambda_for_push_alarm.delay({'alarm_schedule': list(schedule_list)})
            else:
                error = send_aws_lambda_for_push_alarm({'alarm_schedule': list(schedule_list)})

        # print(str(timezone.now()-start_time))
        # print(str(schedule_data))
        if error is not None:
            logger.error('[push task 에러]'+str(error))
        return JsonResponse({'alarm_schedule': list(schedule_list)})


class TestView(View):

    def get(self, request):
        # start_time = timezone.now()
        error = None
        now = timezone.now()
        member_ticket_list = ClassMemberTicketTb.objects.filter(use=USE)
        for member_ticket_info in member_ticket_list:

            class_id_test = member_ticket_info.class_tb_id
            member_ticket_id_test = None
            member_ticket_tb = member_ticket_info.member_ticket_tb
            if member_ticket_tb is not None and member_ticket_tb != '':
                member_ticket_id_test = member_ticket_info.member_ticket_tb_id

            if member_ticket_id_test is not None:
                func_refresh_member_ticket_count(class_id_test, member_ticket_id_test)

        # print(str(timezone.now()-start_time))
        # print(str(schedule_data))
        return JsonResponse({'alarm_schedule': ''})


def send_aws_lambda_for_push_alarm(data):
    error = None
    pters_aws_push_api_key = getattr(settings, "PTERS_AWS_PUSH_API_KEY", '')
    body = json.dumps(data)
    h = httplib2.Http()
    resp, content = h.request("https://3icgiwnj76.execute-api.ap-northeast-2.amazonaws.com/pters_alarm_200303/pters_schedule_push_alarm",
                              method="POST", body=body,
                              headers={'Content-Type': 'application/json;',
                                       'x-api-key': pters_aws_push_api_key})

    if resp['status'] != '200':
        error = '오류가 발생했습니다.'
    return error


class SendWaitScheduleCancelPushAlarmDataView(View):

    def get(self, request):
        now = timezone.now()
        query_setting_wait_schedule_auto_finish = "SELECT A.SETTING_INFO FROM SETTING_TB AS A" \
                                                  " WHERE A.CLASS_TB_ID=`SCHEDULE_TB`.`CLASS_TB_ID`" \
                                                  " AND A.SETTING_TYPE_CD = \'LT_RES_WAIT_SCHEDULE_AUTO_CANCEL_TIME\' " \
                                                  " AND A.USE=1"
        # 지난 수강권 처리
        # class_member_ticket_data = ClassMemberTicketTb.objects.select_related(
        #     'member_ticket_tb__ticket_tb').filter(
        #     auth_cd='VIEW', member_ticket_tb__end_date__lt=datetime.date.today(),
        #     member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS, member_ticket_tb__use=USE,
        #     use=USE).annotate(setting_ticket_auto_finish=RawSQL(query_setting_ticket_auto_finish,
        #                                                         [])).filter(setting_ticket_auto_finish=USE)

        # now += datetime.timedelta(minutes=int(setting_member_wait_schedule_auto_cancel_time))

        # except TypeError:
        #     now -= datetime.timedelta(minutes=int(setting_member_wait_schedule_auto_cancel_time))
        # not_finish_wait_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
        #                                                           permission_state_cd=PERMISSION_STATE_CD_WAIT,
        #                                                           en_dis_type=ON_SCHEDULE_TYPE, start_dt__lte=now,
        #                                                           use=USE)
        # not_finish_wait_schedule_data.delete()
        # logger.error('[push task 에러]'+error)
        return JsonResponse()
