import datetime

import logging
from django.db.models import Q
from django.db.models.expressions import RawSQL
from django.utils import timezone
from django.shortcuts import render

# Create your views here.
from configs.const import USE, OFF_SCHEDULE_TYPE, UN_USE, AUTO_CANCEL_ON, AUTO_ABSENCE_ON, AUTO_FINISH_ON, \
    ON_SCHEDULE_TYPE, AUTO_FINISH_OFF, STATE_CD_NOT_PROGRESS, STATE_CD_FINISH, STATE_CD_ABSENCE, STATE_CD_IN_PROGRESS
from payment.models import BillingInfoTb, PaymentInfoTb
from schedule.functions import func_send_push_trainer, func_send_push_trainee, func_refresh_member_ticket_count
from schedule.models import RepeatScheduleTb, ScheduleTb, DeleteScheduleTb
from trainer.functions import func_update_lecture_member_fix_status_cd
from trainer.models import ClassMemberTicketTb

logger = logging.getLogger(__name__)


def func_update_finish_member_ticket_data():
    now = timezone.now()

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
        member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS, member_ticket_tb__use=USE, class_tb_id='127',
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

    billing_data = BillingInfoTb.objects.filter(class_tb_id='127', next_payment_date__lt=today, use=USE)

    payment_data = PaymentInfoTb.objects.filter(Q(status='paid') | Q(status='reserve'), class_tb_id='127',
                                                start_date__lte=today, end_date__gte=today,
                                                use=USE).order_by('product_tb_id', '-end_date')

    if len(payment_data) == 0:
        for billing_info in billing_data:
            billing_info.state_cd = 'END'
            # billing_info.use = UN_USE
            billing_info.save()


# 수업 알림 push 처리
def send_push_alarm_logic(request):

    from configs.celery import update_celery_status
    update_celery_status()

    alarm_dt = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:00')
    # 개인 수업 일정
    query_common_cd = "SELECT COMMON_CD_NM FROM COMMON_CD_TB WHERE COMMON_CD=`CLASS_TB`.`SUBJECT_CD`"
    schedule_data = ScheduleTb.objects.select_related(
        'class_tb', 'lecture_tb',
        'member_ticket_tb__member'
    ).filter(alarm_dt=alarm_dt, class_tb_id='127',
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
        push_title = class_type_name+' - 수업 알림'
        push_message = push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1] + '~'\
                       + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]\
                       + ' ' + minute_message + '전 입니다.'
        if schedule_info.lecture_tb is None:

            func_send_push_trainer(member_ticket_tb_id, push_title,
                                   ' [개인 레슨] '+push_message)
            func_send_push_trainee(class_tb_id, class_type_name+' - 수업 알림',
                                   ' [개인 레슨] '+push_message)

        else:
            # 그룹 수업 일정
            if schedule_info.lecture_schedule_id is None:
                func_send_push_trainee(class_tb_id, push_title,
                                       ' [' + schedule_info.lecture_tb.name + '] '+push_message)
            # 그룹의 회원 수업 일정
            else:
                func_send_push_trainer(member_ticket_tb_id, push_title,
                                       ' [' + schedule_info.lecture_tb.name + '] '+push_message)

    return render(request, 'ajax/task_error_info.html')


# 지난 일정 처리
def update_finish_schedule_data_logic(request):
    now = timezone.now()

    query_setting_schedule_auto_finish = "SELECT A.SETTING_INFO FROM SETTING_TB as A" \
                                         " WHERE A.CLASS_TB_ID=`SCHEDULE_TB`.`CLASS_TB_ID`" \
                                         " AND A.SETTING_TYPE_CD = \'LT_SCHEDULE_AUTO_FINISH\'" \
                                         " AND A.USE=1"
    not_finish_schedule_data = ScheduleTb.objects.select_related(
        'member_ticket_tb'
    ).filter(Q(class_tb_id='127')|Q(class_tb_id='1956'), state_cd=STATE_CD_NOT_PROGRESS,
             en_dis_type=ON_SCHEDULE_TYPE, end_dt__lte=now, use=USE
             ).annotate(schedule_auto_finish=RawSQL(query_setting_schedule_auto_finish,
                                                    [])).exclude(schedule_auto_finish=AUTO_FINISH_OFF)
    for not_finish_schedule_info in not_finish_schedule_data:
        lecture_tb = not_finish_schedule_info.lecture_tb
        lecture_tb_id = None
        member_ticket_tb = not_finish_schedule_info.member_ticket_tb
        member_ticket_tb_id = None
        repeat_schedule_tb = not_finish_schedule_info.repeat_schedule_tb
        repeat_schedule_tb_id = None

        if member_ticket_tb is not None and member_ticket_tb != '':
            member_ticket_tb_id = not_finish_schedule_info.member_ticket_tb_id
        if lecture_tb is not None and lecture_tb != '':
            lecture_tb_id = not_finish_schedule_info.lecture_tb_id
        if repeat_schedule_tb is not None and repeat_schedule_tb != '':
            repeat_schedule_tb_id = not_finish_schedule_info.repeat_schedule_tb_id

        if str(not_finish_schedule_info.schedule_auto_finish) == str(AUTO_FINISH_ON):
            not_finish_schedule_info.state_cd = STATE_CD_FINISH
            not_finish_schedule_info.save()
        elif str(not_finish_schedule_info.schedule_auto_finish) == str(AUTO_ABSENCE_ON):
            not_finish_schedule_info.state_cd = STATE_CD_ABSENCE
            not_finish_schedule_info.save()
        elif str(not_finish_schedule_info.schedule_auto_finish) == str(AUTO_CANCEL_ON):
            finish_lecture_member_schedule_count = 0
            if lecture_tb_id is not None and lecture_tb_id != '':
                if member_ticket_tb_id is None or member_ticket_tb_id == '':
                    finish_lecture_member_schedule_count = ScheduleTb.objects.filter(
                        lecture_schedule_id=not_finish_schedule_info.schedule_id,
                        use=USE).exclude(state_cd=STATE_CD_NOT_PROGRESS).count()
            if finish_lecture_member_schedule_count == 0:
                delete_schedule_info = DeleteScheduleTb(
                    schedule_id=not_finish_schedule_info.schedule_id, class_tb_id=not_finish_schedule_info.class_tb_id,
                    lecture_tb_id=lecture_tb_id,
                    member_ticket_tb_id=member_ticket_tb_id,
                    lecture_schedule_id=not_finish_schedule_info.lecture_schedule_id,
                    delete_repeat_schedule_tb=repeat_schedule_tb_id,
                    start_dt=not_finish_schedule_info.start_dt, end_dt=not_finish_schedule_info.end_dt,
                    permission_state_cd=not_finish_schedule_info.permission_state_cd,
                    state_cd=not_finish_schedule_info.state_cd, note=not_finish_schedule_info.note,
                    en_dis_type=not_finish_schedule_info.en_dis_type, member_note=not_finish_schedule_info.member_note,
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
