import datetime

from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.db.models import Q
from django.db.models.expressions import RawSQL
from django.utils import timezone

from configs.const import ON_SCHEDULE_TYPE, ADD_SCHEDULE, USE, MEMBER_RESERVE_PROHIBITION_ON, LECTURE_TYPE_ONE_TO_ONE, \
    STATE_CD_IN_PROGRESS, STATE_CD_ABSENCE, AUTH_TYPE_VIEW, AUTH_TYPE_WAIT, AUTH_TYPE_DELETE, \
    MEMBER_RESERVE_PROHIBITION_OFF
from login.models import CommonCdTb
from schedule.models import ScheduleTb, RepeatScheduleTb, HolidayTb
from trainer.models import ClassTb, ClassMemberTicketTb, SettingTb, TicketLectureTb
from .models import MemberTicketTb


def func_get_holiday_schedule(context):

    holiday = HolidayTb.objects.filter(use=USE)
    context['holiday'] = holiday

    return context


def func_get_trainee_on_schedule(context, class_id, user_id, start_date, end_date):
    schedule_list = []
    all_schedule_check = 0
    now = timezone.now()
    next_schedule = ''
    query_lecture_current_member_num \
        = "select count(*) from SCHEDULE_TB as B where B.GROUP_SCHEDULE_ID = `SCHEDULE_TB`.`GROUP_SCHEDULE_ID`"
    if start_date is None and end_date is None:
        all_schedule_check = 1

    if all_schedule_check == 0:
        schedule_data = ScheduleTb.objects.select_related(
            'member_ticket_tb__member', 'lecture_tb'
        ).filter(class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE,
                 start_dt__gte=start_date, start_dt__lt=end_date,
                 member_ticket_tb__member_id=user_id,
                 member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW,
                 member_ticket_tb__use=USE, use=USE
                 ).annotate(lecture_current_member_num=RawSQL('IFNULL(('+query_lecture_current_member_num+' ), 1)', [])
                            ).order_by('start_dt')
        idx1 = 0
        idx2 = 1
        member_ticket_id = None
        for schedule_info in schedule_data:
            if member_ticket_id != schedule_info.member_ticket_tb_id:
                member_ticket_id = schedule_info.member_ticket_tb_id
                idx1 += 1
                idx2 = 1
            schedule_info.idx = str(idx1)+'-'+str(idx2)
            schedule_info.note = schedule_info.note.replace('\n', '<br/>')
            schedule_list.append(schedule_info)
            idx2 += 1

            if now <= schedule_info.start_dt:
                if next_schedule == '':
                    next_schedule = schedule_info.start_dt
                else:
                    if next_schedule > schedule_info.start_dt:
                        next_schedule = schedule_info.start_dt
    else:
        class_member_ticket_list = ClassMemberTicketTb.objects.select_related(
            'member_ticket_tb__member'
        ).filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__member_id=user_id,
                 member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW,
                 member_ticket_tb__use=USE, use=USE
                 ).order_by('member_ticket_tb__start_date', 'member_ticket_tb__reg_dt')

        idx1 = 0
        for class_member_ticket_info in class_member_ticket_list:

            idx1 += 1
            idx2 = 1
            schedule_data = ScheduleTb.objects.select_related(
                'member_ticket_tb__member', 'lecture_tb'
            ).filter(class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE,
                     member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW,
                     member_ticket_tb__member_id=user_id,
                     member_ticket_tb_id=class_member_ticket_info.member_ticket_tb_id, use=USE).order_by('start_dt')

            for schedule_info in schedule_data:
                schedule_info.idx = str(idx1) + '-' + str(idx2)
                schedule_info.note = schedule_info.note.replace('\n', '<br/>')
                schedule_list.append(schedule_info)
                idx2 += 1

                if now <= schedule_info.start_dt:
                    if next_schedule == '':
                        next_schedule = schedule_info.start_dt
                    else:
                        if next_schedule > schedule_info.start_dt:
                            next_schedule = schedule_info.start_dt

    context['schedule_data'] = schedule_list
    context['next_schedule'] = next_schedule
    return context


def func_get_trainee_lecture_schedule(context, user_id, class_id, start_date, end_date):
    # 내가 속한 그룹 일정 조회
    query = "select count(*) from SCHEDULE_TB as B where B.GROUP_SCHEDULE_ID = `SCHEDULE_TB`.`ID`" \
            "AND B.STATE_CD !=\'PC\' AND B.USE=1"
    query_member_auth_cd \
        = "select count(`LECTURE_TB_ID`) from GROUP_LECTURE_TB as B" \
          " where B.USE=1 and B.GROUP_TB_ID = `SCHEDULE_TB`.`GROUP_TB_ID`" \
          " and (select `STATE_CD` from LECTURE_TB as D WHERE D.ID=B.LECTURE_TB_ID)=\'IP\'" \
          " and (select `MEMBER_AUTH_CD` from LECTURE_TB as C WHERE C.ID = B.LECTURE_TB_ID" \
          " and C.MEMBER_ID= "+str(user_id)+")=\'VIEW\'"

    lecture_schedule_data = ScheduleTb.objects.select_related(
        'lecture_tb').filter(class_tb_id=class_id, lecture_tb__isnull=False, member_ticket_tb__isnull=True,
                             en_dis_type=ON_SCHEDULE_TYPE, start_dt__gte=start_date,
                             start_dt__lt=end_date, use=USE
                             ).annotate(lecture_current_member_num=RawSQL(query, []),
                                        lecture_check=RawSQL('IFNULL(('+query_member_auth_cd+' ), 0)', [])
                                        ).filter(lecture_check__gt=0).order_by('start_dt')
    for lecture_schedule_info in lecture_schedule_data:
        lecture_schedule_info.note = lecture_schedule_info.note.replace('\n', '<br/>')
    context['lecture_schedule_data'] = lecture_schedule_data

    return context


def func_get_trainee_off_schedule(context, class_id, start_date, end_date):
    # off_schedule_list = []

    # off 스케쥴 전달
    schedule_data = ScheduleTb.objects.filter(
        class_tb_id=class_id, start_dt__gte=start_date,
        start_dt__lt=end_date, use=USE).exclude(state_cd=STATE_CD_ABSENCE).order_by('start_dt')

    for schedule_info in schedule_data:
        schedule_info.note = schedule_info.note.replace('\n', '<br/>')
    context['off_schedule_data'] = schedule_data

    return context


def func_get_trainee_on_repeat_schedule(context, user_id, class_id):
    # repeat_schedule_list = []
    pt_repeat_schedule_data = RepeatScheduleTb.objects.select_related(
        'member_ticket_tb'
    ).filter(class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE, member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
             member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__member_id=user_id,
             member_ticket_tb__use=USE).order_by('member_ticket_tb__start_date')

    context['repeat_schedule_data'] = pt_repeat_schedule_data

    return context


def func_get_class_member_ticket_count(context, class_id, user_id):
    error = None
    if class_id is None or class_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    member_ticket_reg_count_sum = 0
    member_ticket_rem_count_sum = 0
    member_ticket_avail_count_sum = 0
    member_ticket_flag = False
    class_member_ticket_list = None
    ticket_data = []

    if error is None:
        # 강사에 해당하는 강좌 정보 불러오기

        class_member_ticket_list = ClassMemberTicketTb.objects.select_related(
            'member_ticket_tb__ticket_tb'
        ).filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__member_id=user_id,
                 member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS, member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW,
                 member_ticket_tb__use=USE, use=USE).order_by('member_ticket_tb__start_date')

    if error is None:
        # 강사 클래스의 반복일정 불러오기
        for class_member_ticket_info in class_member_ticket_list:
            member_ticket_info = class_member_ticket_info.member_ticket_tb
            # 자유형 문제
            ticket_single_lecture_count = TicketLectureTb.objects.filter(
                class_tb_id=class_id, lecture_tb__lecture_type_cd=LECTURE_TYPE_ONE_TO_ONE,
                ticket_tb_id=member_ticket_info.ticket_tb_id, ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
                lecture_tb__state_cd=STATE_CD_IN_PROGRESS, use=USE).count()

            if ticket_single_lecture_count > 0:
                member_ticket_reg_count_sum += member_ticket_info.member_ticket_reg_count
                member_ticket_rem_count_sum += member_ticket_info.member_ticket_rem_count
                member_ticket_avail_count_sum += member_ticket_info.member_ticket_avail_count

    if member_ticket_reg_count_sum > 0:
        member_ticket_flag = True

    context['ticket_data'] = ticket_data
    context['member_ticket_flag'] = member_ticket_flag
    context['member_ticket_reg_count'] = member_ticket_reg_count_sum
    context['member_ticket_finish_count'] = member_ticket_reg_count_sum - member_ticket_rem_count_sum
    context['member_ticket_avail_count'] = member_ticket_avail_count_sum
    return context


def func_get_member_ticket_list(context, class_id, member_id, auth_cd):
    error = None
    context['error'] = None
    member_ticket_counts = 0
    output_member_ticket_list = []

    if class_id is None or class_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if member_id is None or member_id == '':
        error = '회원 정보를 불러오지 못했습니다.'

    if auth_cd is None or auth_cd == '':
        auth_cd = AUTH_TYPE_VIEW
    auth_cd_list = auth_cd.split('/')

    if error is None:
        member_ticket_list = ClassMemberTicketTb.objects.select_related(
            'member_ticket_tb__ticket_tb'
        ).filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__member_id=member_id,
                 member_ticket_tb__use=USE, use=USE).order_by('-member_ticket_tb__start_date',
                                                              '-member_ticket_tb__reg_dt')

        for member_ticket_info in member_ticket_list:
            member_ticket_info_data = None
            for auth_cd_info in auth_cd_list:
                try:
                    member_ticket_info_data = MemberTicketTb.objects.select_related(
                        'member_ticket_tb', 'member').get(member_auth_cd=auth_cd_info, member_id=member_id,
                                                          member_ticket_id=member_ticket_info.member_ticket_tb_id)
                except ObjectDoesNotExist:
                    member_ticket_info_data = None

                if member_ticket_info_data is not None:
                    break

            if member_ticket_info_data is not None:
                member_ticket_info_data.start_date \
                    = str(member_ticket_info_data.start_date)
                member_ticket_info_data.end_date \
                    = str(member_ticket_info_data.end_date)
                member_ticket_info_data.mod_dt = str(member_ticket_info_data.mod_dt)
                member_ticket_info_data.reg_dt = str(member_ticket_info_data.reg_dt)
                try:
                    member_ticket_info_data.auth_cd_name =\
                        CommonCdTb.objects.get(common_cd=member_ticket_info_data.member_auth_cd)
                except ObjectDoesNotExist:
                    member_ticket_info_data.auth_cd_name = ''
                try:
                    member_ticket_info_data.state_cd_name = \
                        CommonCdTb.objects.get(common_cd=member_ticket_info_data.state_cd)
                except ObjectDoesNotExist:
                    member_ticket_info_data.state_cd_name = ''

                member_ticket_counts += 1

                member_ticket_info_data.lecture_name = member_ticket_info.ticket_tb.name
                # member_ticket_info_data.lecture_type_cd = member_ticket_info.member_ticket_tb.ticket_tb.ticket_type_cd
                # try:
                #     member_ticket_info_data.lecture_type_cd_name = \
                #         CommonCdTb.objects.get(common_cd=member_ticket_info.member_ticket_tb.ticket_tb.ticket_type_cd
                #                                ).common_cd_nm
                # except ObjectDoesNotExist:
                #     member_ticket_info_data.lecture_type_cd_name = ''
                member_ticket_info_data.lecture_note = member_ticket_info.ticket_tb.note
                member_ticket_info_data.lecture_state_cd = member_ticket_info.ticket_tb.state_cd

                output_member_ticket_list.append(member_ticket_info_data)

    context['member_ticket_data'] = output_member_ticket_list

    if error is not None:
        context['error'] = error

    return context


def func_get_member_ticket_connection_list(context, class_id, member_id, auth_cd):
    error = None
    context['error'] = None
    member_ticket_counts = 0
    output_member_ticket_list = []

    if class_id is None or class_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if member_id is None or member_id == '':
        error = '회원 정보를 불러오지 못했습니다.'

    if auth_cd is None or auth_cd == '':
        auth_cd = AUTH_TYPE_VIEW
    auth_cd_list = auth_cd.split('/')

    if error is None:
        member_ticket_list = ClassMemberTicketTb.objects.select_related(
            'member_ticket_tb__ticket_tb').filter(class_tb_id=class_id, member_ticket_tb__member_id=member_id,
                                                  use=USE).order_by('-member_ticket_tb__start_date')

        for member_ticket_info in member_ticket_list:
            member_ticket_info_data = None
            for auth_cd_info in auth_cd_list:
                try:
                    member_ticket_info_data = MemberTicketTb.objects.select_related(
                        'member_ticket_tb', 'member').get(member_auth_cd=auth_cd_info, member_id=member_id,
                                                          member_ticket_id=member_ticket_info.member_ticket_tb_id)
                except ObjectDoesNotExist:
                    member_ticket_info_data = None

                if member_ticket_info_data is not None:
                    break

            if member_ticket_info_data is not None:
                member_ticket_info_data.start_date \
                    = str(member_ticket_info_data.start_date)
                member_ticket_info_data.end_date \
                    = str(member_ticket_info_data.end_date)
                member_ticket_info_data.mod_dt = str(member_ticket_info_data.mod_dt)
                member_ticket_info_data.reg_dt = str(member_ticket_info_data.reg_dt)
                try:
                    member_ticket_info_data.auth_cd_name = CommonCdTb.objects.get(
                        common_cd=member_ticket_info_data.member_auth_cd)
                except ObjectDoesNotExist:
                    member_ticket_info_data.auth_cd_name = ''
                try:
                    member_ticket_info_data.state_cd_name = \
                        CommonCdTb.objects.get(common_cd=member_ticket_info_data.state_cd)
                except ObjectDoesNotExist:
                    member_ticket_info_data.state_cd_name = ''

                member_ticket_counts += 1

                member_ticket_info_data.lecture_name = member_ticket_info_data.ticket_tb.name
                member_ticket_info_data.lecture_note = member_ticket_info_data.ticket_tb.note
                member_ticket_info_data.lecture_state_cd = member_ticket_info_data.ticket_tb.state_cd
                try:
                    state_cd_nm = CommonCdTb.objects.get(
                        common_cd=member_ticket_info_data.ticket_tb.state_cd)
                    member_ticket_info_data.lecture_state_cd_nm = state_cd_nm.common_cd_nm
                except ObjectDoesNotExist:
                    error = '회원 정보를 불러오지 못했습니다.'

                output_member_ticket_list.append(member_ticket_info_data)

    context['member_ticket_data'] = output_member_ticket_list

    if error is not None:
        context['error'] = error

    return context


def func_get_class_list(context, member_id):

    error = None

    query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `CLASS_TB`.`SUBJECT_CD`"

    class_member_ticket_data = ClassMemberTicketTb.objects.select_related(
        'class_tb', 'member_ticket_tb').filter(
        member_ticket_tb__member_id=member_id,
        use=USE).annotate(class_type_name=RawSQL(query_type_cd, [])
                          ).exclude(member_ticket_tb__member_auth_cd=AUTH_TYPE_DELETE).order_by('class_tb_id')

    class_list = []
    # wait_class_list = []
    if len(class_member_ticket_data) > 0:
        for class_member_ticket_info in class_member_ticket_data:
            class_id = class_member_ticket_info.class_tb_id
            input_class_info = None

            for class_info in class_list:
                if str(class_info.class_tb_id) == str(class_id):
                    input_class_info = class_info
                    break

            if input_class_info is None:
                input_class_info = class_member_ticket_info
                input_class_info.np_member_ticket_counts = 0
                input_class_info.member_ticket_counts = 0
                input_class_info.member_ticket_rem_count = 0
                if class_member_ticket_info.class_tb.subject_detail_nm is not None\
                        and class_member_ticket_info.class_tb.subject_detail_nm != '':
                    input_class_info.class_type_name = class_member_ticket_info.class_tb.subject_detail_nm

                input_class_info.class_member_ticket_data = []
                class_list.append(input_class_info)

            if input_class_info.member_ticket_tb.member_auth_cd == AUTH_TYPE_WAIT:
                input_class_info.np_member_ticket_counts += 1
                input_class_info.class_member_ticket_data.append(class_member_ticket_info.member_ticket_tb)
            if input_class_info.member_ticket_tb.member_auth_cd == AUTH_TYPE_VIEW:
                input_class_info.member_ticket_counts += 1
                input_class_info.member_ticket_rem_count \
                    += class_member_ticket_info.member_ticket_tb.member_ticket_rem_count

    context['class_data'] = class_list
    if error is not None:
        context['error'] = error

    return context


def func_get_class_list_only_view(context, member_id):

    error = None
    query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `CLASS_TB`.`SUBJECT_CD`"

    class_member_ticket_data = ClassMemberTicketTb.objects.select_related(
        'class_tb', 'member_ticket_tb').filter(auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW,
                                               member_ticket_tb__member_id=member_id, member_ticket_tb__use=USE,
                                               use=USE).annotate(class_type_name=RawSQL(query_type_cd, [])
                                                                 ).order_by('class_tb_id')
    class_list = []
    # wait_class_list = []
    if len(class_member_ticket_data) > 0:
        for class_member_ticket_info in class_member_ticket_data:
            class_id = class_member_ticket_info.class_tb_id
            input_class_info = None

            for class_info in class_list:
                if str(class_info.class_tb_id) == str(class_id):
                    input_class_info = class_info
                    break

            if input_class_info is None:
                input_class_info = class_member_ticket_info
                input_class_info.np_member_ticket_counts = 0
                input_class_info.member_ticket_counts = 0
                input_class_info.member_ticket_rem_count = 0
                if class_member_ticket_info.class_tb.subject_detail_nm is not None\
                        and class_member_ticket_info.class_tb.subject_detail_nm != '':
                    input_class_info.class_type_name = class_member_ticket_info.class_tb.subject_detail_nm

                input_class_info.class_member_ticket_data = []
                class_list.append(input_class_info)

            if class_member_ticket_info.member_ticket_tb.member_auth_cd == AUTH_TYPE_WAIT:
                input_class_info.np_member_ticket_counts += 1
                input_class_info.class_member_ticket_data.append(class_member_ticket_info.member_ticket_tb)
            if class_member_ticket_info.member_ticket_tb.member_auth_cd == AUTH_TYPE_VIEW:
                input_class_info.member_ticket_counts += 1
                input_class_info.member_ticket_rem_count \
                    += class_member_ticket_info.member_ticket_tb.member_ticket_rem_count

    context['class_data'] = class_list
    if error is not None:
        context['error'] = error

    return context


def func_get_trainee_next_schedule_by_class_id(context, class_id, user_id):

    now = timezone.now()
    next_schedule_info = ''
    next_schedule_data = ScheduleTb.objects.filter(class_tb=class_id, member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW,
                                                   member_ticket_tb__member_id=user_id,
                                                   en_dis_type=ON_SCHEDULE_TYPE,
                                                   start_dt__gte=now,
                                                   use=USE).order_by('start_dt')

    if len(next_schedule_data) > 0:
        next_schedule_info = next_schedule_data[0]

    context['next_schedule_info'] = next_schedule_info

    return context


def func_get_trainee_select_schedule(context, class_id, user_id, select_date):

    # query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as C where C.COMMON_CD = `GROUP_TB`.`GROUP_TYPE_CD`"
    error = None
    start_dt = None
    end_dt = None
    try:
        start_dt = datetime.datetime.strptime(select_date + ' 00:00', '%Y-%m-%d %H:%M')
    except ValueError:
        error = '등록 값에 문제가 있습니다.'
    except IntegrityError:
        error = '등록 값에 문제가 있습니다.'
    except TypeError:
        error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        end_dt = start_dt + datetime.timedelta(hours=23, minutes=59)

    schedule_data = ScheduleTb.objects.filter(
        class_tb=class_id, member_ticket_tb__member_id=user_id, member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW,
        member_ticket_tb__use=USE, en_dis_type=ON_SCHEDULE_TYPE, start_dt__gte=start_dt,
        start_dt__lte=end_dt, use=USE).order_by('start_dt')

    context['schedule_data'] = schedule_data

    return context


def func_get_trainee_ing_member_ticket_list(context, class_id, user_id):

    member_ticket_list = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__member',
        'member_ticket_tb__ticket_tb'
    ).filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__member_id=user_id,
             member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
             member_ticket_tb__ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
             member_ticket_tb__use=USE, member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW, use=USE
             ).order_by('-member_ticket_tb__end_date', 'member_ticket_tb__reg_dt')

    for member_ticket_info in member_ticket_list:
        member_ticket_info_ticket_tb = member_ticket_info.member_ticket_tb.ticket_tb
        member_ticket_info.ticket_lecture_data = TicketLectureTb.objects.filter(
            ticket_tb_id=member_ticket_info_ticket_tb.ticket_id, ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
            lecture_tb__state_cd=STATE_CD_IN_PROGRESS, use=USE)

    context['ing_member_ticket_data'] = member_ticket_list
    return context


def func_get_trainee_ticket_list(context, class_id, user_id):

    query_status = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `LECTURE_TB`.`STATE_CD`"

    member_ticket_list = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__member',
        'member_ticket_tb__ticket_tb'
    ).filter(class_tb_id=class_id, member_ticket_tb__member_id=user_id, auth_cd=AUTH_TYPE_VIEW,
             member_ticket_tb__use=USE, member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW, use=USE
             ).annotate(status=RawSQL(query_status, [])).order_by('member_ticket_tb__state_cd',
                                                                  '-member_ticket_tb__start_date',
                                                                  '-member_ticket_tb__reg_dt')
    ticket_list = []
    for member_ticket_info in member_ticket_list:
        member_ticket_info_ticket_tb = member_ticket_info.member_ticket_tb.ticket_tb
        test = True

        for ticket_info in ticket_list:
            if ticket_info.member_ticket_tb.ticket_tb.ticket_id == member_ticket_info_ticket_tb.ticket_id:
                if member_ticket_info.member_ticket_tb.state_cd == STATE_CD_IN_PROGRESS:
                    ticket_info.member_ticket_tb.state_cd = STATE_CD_IN_PROGRESS
                    ticket_info.status = member_ticket_info.status
                test = False

        if test is True:
            ticket_list.append(member_ticket_info)

    context['ing_ticket_data'] = ticket_list
    return context


# 검사후 괜찮다면 개인 레슨은  예약 허용 시간대 + 강사 업무시간 + 예약 가능 시간 ~  예약 호용 시간대 + 강사 업무 시간
# 그룹 레슨의 경우 오픈된 수업중 예약 허용 시간대 + 강사 업무시간 + 예약 가능 시간 ~  예약 호용 시간대 + 강사 업무 시간
def func_get_trainee_reserve_schedule_list(context, class_id, user_id, lecture_id, select_date):
    error = None
    # 3. 예약 가능 시간 고려
    # 5. 수업 오픈 고려 (1:1인경우 예약된 시간 전부 안되도록, 그룹인 경우 자신이 속한 시간 제외한 수업)
    # 6.
    # datetime_now = timezone.now()
    # today = datetime.datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
    # now_time = datetime.datetime.strptime(datetime_now.strftime('%H:%M'), '%H:%M')
    class_info = None
    start_dt = None
    end_dt = None
    schedule_data = None

    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        error = func_check_select_date_reserve_setting(class_id, class_info.member_id, select_date)

    if error is None:
        # 근접 예약 취소/등록 시간 : 구버전 호환 + 시간 단위
        # lt_res_enable_cancel_time_legacy = 0
        # 강사 업무 시간 : 구버전 호환
        lt_work_time_legacy = '00:00-23:59'
        # 근접 예약 등록 시간 : 구버전 호환 위해 default -1 + 분 단위
        # lt_res_enable_time = -1
        # 강사 업무 시간
        lt_work_time_avail = ['', '', '', '', '', '', '']

        setting_data = SettingTb.objects.filter(member_id=class_info.member_id,
                                                class_tb_id=class_info.class_id,
                                                use=USE).exclude(Q(setting_type_cd='LT_RES_01') |
                                                                 Q(setting_type_cd='LT_RES_03') |
                                                                 Q(setting_type_cd='LT_RES_05') |
                                                                 Q(setting_type_cd='LT_RES_CANCEL_TIME'))
        for setting_info in setting_data:
            # if setting_info.setting_type_cd == 'LT_RES_02':
            #     lt_res_enable_cancel_time_legacy = int(setting_info.setting_info)
            if setting_info.setting_type_cd == 'LT_RES_04':
                lt_work_time_legacy = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_WORK_SUN_TIME_AVAIL':
                lt_work_time_avail[0] = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_WORK_MON_TIME_AVAIL':
                lt_work_time_avail[1] = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_WORK_TUE_TIME_AVAIL':
                lt_work_time_avail[2] = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_WORK_WED_TIME_AVAIL':
                lt_work_time_avail[3] = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_WORK_THS_TIME_AVAIL':
                lt_work_time_avail[4] = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_WORK_FRI_TIME_AVAIL':
                lt_work_time_avail[5] = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_WORK_SAT_TIME_AVAIL':
                lt_work_time_avail[6] = setting_info.setting_info
            # if setting_info.setting_type_cd == 'LT_RES_ENABLE_TIME':
            #     lt_res_enable_time = int(setting_info.setting_info)
            # if setting_info.setting_type_cd == 'LT_RES_MEMBER_TIME_DURATION':
            #     lt_res_member_time_duration = int(setting_info.setting_info)
            # if setting_info.setting_type_cd == 'LT_RES_MEMBER_START_TIME':
            #     lt_res_member_start_time = setting_info.setting_info

        # 근접 예약 등록 가능 시간 구버전 호환 + 시간 -> 분
        # if lt_res_enable_time == -1:
            # lt_res_enable_time = lt_res_enable_cancel_time_legacy * 60
        # 강사 업무 시간 구버전 호환
        if lt_work_time_avail[0] == '':
            lt_work_time_avail[0] = lt_work_time_legacy
        if lt_work_time_avail[1] == '':
            lt_work_time_avail[1] = lt_work_time_legacy
        if lt_work_time_avail[2] == '':
            lt_work_time_avail[2] = lt_work_time_legacy
        if lt_work_time_avail[3] == '':
            lt_work_time_avail[3] = lt_work_time_legacy
        if lt_work_time_avail[4] == '':
            lt_work_time_avail[4] = lt_work_time_legacy
        if lt_work_time_avail[5] == '':
            lt_work_time_avail[5] = lt_work_time_legacy
        if lt_work_time_avail[6] == '':
            lt_work_time_avail[6] = lt_work_time_legacy

        # 선택한 일자의 강사 업무 시간 확인
        # work_avail_start_time = datetime.datetime.strptime(
        #     lt_work_time_avail[int(select_date.strftime('%w'))].split('-')[0], '%H:%M')
        # work_avail_end_time = datetime.datetime.strptime(
        #     lt_work_time_avail[int(select_date.strftime('%w'))].split('-')[1], '%H:%M')

        # 근접 예약 등록 가능 시간 셋팅
        # reserve_prohibition_time = lt_res_enable_time

        # 근접 예약 등록 가능 시간이 일 단위를 넘는 경우
        # if reserve_prohibition_time >= 24*60:
        #     reserve_prohibition_date = int(reserve_prohibition_time/60/24)

        # 근접 예약 시간 확인
        # reserve_disable_time = datetime_now + datetime.timedelta(minutes=reserve_prohibition_time)

        # 시작 시각
        # if lt_res_member_start_time == 'A-0':
        #     test = '매시각 0분 마다'
        # elif lt_res_member_start_time == 'A-30':
        #     test = '매시각 30분 마다'
        # elif lt_res_member_start_time == 'E-30':
        #     test = '30분 마다'

        # 진행 시간 (분단위)
        # lt_res_member_time_duration = lt_res_member_time_duration * class_info.class_hour

    try:
        start_dt = datetime.datetime.strptime(select_date + ' 00:00', '%Y-%m-%d %H:%M')
        end_dt = start_dt + datetime.timedelta(hours=23, minutes=59)
    except ValueError:
        error = '등록 값에 문제가 있습니다.'
    except IntegrityError:
        error = '등록 값에 문제가 있습니다.'
    except TypeError:
        error = '등록 값의 형태에 문제가 있습니다.'

    # 1:1 수업인 경우
    if error is None:
        if lecture_id is None or lecture_id == '':
            # test = 'test'
            schedule_data = ScheduleTb.objects.filter(class_tb=class_id, en_dis_type=ON_SCHEDULE_TYPE,
                                                      start_dt__gte=start_dt, start_dt__lte=end_dt,
                                                      member_ticket_tb__member_id=user_id, use=USE).order_by('start_dt')

    # 그룹 수업인 경우
    # else:
    #     test = 'test'

    context['schedule_data'] = schedule_data

    return context


def func_check_select_date_reserve_setting(class_id, trainer_id, select_date):
    error = None
    datetime_now = timezone.now()
    today = datetime.datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
    now_time = datetime.datetime.strptime(datetime_now.strftime('%H:%M'), '%H:%M')

    # default 값
    # 예약 허용 시간대
    reserve_avail_time = '00:00-23:59'
    # 예약 정지 여부
    reserve_stop = MEMBER_RESERVE_PROHIBITION_OFF
    # 예약 가능 일자
    reserve_avail_date = 7
    reserve_avail_end_date = today
    reserve_avail_start_time = None
    reserve_avail_end_time = None
    reserve_avail_time_split = None

    try:
        select_date = datetime.datetime.strptime(select_date + ' 00:00', '%Y-%m-%d %H:%M')
    except ValueError:
        error = '등록 값에 문제가 있습니다.'
    except IntegrityError:
        error = '등록 값에 문제가 있습니다.'
    except TypeError:
        error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        setting_data = SettingTb.objects.filter(Q(setting_type_cd='LT_RES_01') |
                                                Q(setting_type_cd='LT_RES_03') |
                                                Q(setting_type_cd='LT_RES_05'),
                                                member_id=trainer_id,
                                                class_tb_id=class_id, use=USE)

        for setting_info in setting_data:
            if setting_info.setting_type_cd == 'LT_RES_01':
                reserve_avail_time = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_RES_03':
                reserve_stop = int(setting_info.setting_info)
            if setting_info.setting_type_cd == 'LT_RES_05':
                reserve_avail_date = int(setting_info.setting_info)
        # 예약 가능 일자 확인
        reserve_avail_end_date = today + datetime.timedelta(days=reserve_avail_date)

        # 예약 가능 시간 확인
        reserve_avail_time_split = reserve_avail_time.split('-')
        reserve_avail_start_time_temp = reserve_avail_time_split[0]
        reserve_avail_end_time_temp = reserve_avail_time_split[1]
        if reserve_avail_start_time_temp == '24:00' or reserve_avail_start_time_temp == '24:0':
            reserve_avail_start_time_temp = '23:59'
        if reserve_avail_end_time_temp == '24:00' or reserve_avail_start_time_temp == '24:0':
            reserve_avail_end_time_temp = '23:59'

        reserve_avail_start_time = datetime.datetime.strptime(reserve_avail_start_time_temp, '%H:%M')
        reserve_avail_end_time = datetime.datetime.strptime(reserve_avail_end_time_temp, '%H:%M')

    # 예약 정지 상태 확인
    if reserve_stop == MEMBER_RESERVE_PROHIBITION_ON:
        error = '강사님이 예약 기능을 일시 정지하셨습니다.<br/>강사님께 직접 문의해주세요.'

    # 예약 가능 일자 확인
    if error is None:
        if select_date >= reserve_avail_end_date:
            error = '오늘 기준 최대 +'+str(reserve_avail_date)+'일 까지 예약 등록/취소가 가능합니다.'
        elif select_date < today:
            error = '과거 일정은 예약 등록/취소가 불가능합니다.'

    # 예약 가능 시간대 확인
    if error is None:
        if reserve_avail_start_time <= reserve_avail_end_time:
            if now_time < reserve_avail_start_time:
                error = '일정 등록/취소 가능 시간은 ' + reserve_avail_time_split[0] + '~' + reserve_avail_time_split[1] + ' 입니다.'
            if now_time > reserve_avail_end_time:
                error = '일정 등록/취소 가능 시간은 ' + reserve_avail_time_split[0] + '~' + reserve_avail_time_split[1] + ' 입니다.'
        else:
            if reserve_avail_start_time > now_time > reserve_avail_end_time:
                error = '일정 등록/취소 가능 시간은 ' + reserve_avail_time_split[0] + '~' + reserve_avail_time_split[1] + ' 입니다.'

    return error


def func_check_select_time_reserve_setting(class_id, trainer_id, start_date, end_date, add_del_type):
    error = None
    datetime_now = timezone.now()
    add_del_start_time = datetime.datetime.strptime(start_date.strftime('%H:%M'), '%H:%M')
    add_del_end_time = datetime.datetime.strptime(end_date.strftime('%H:%M'), '%H:%M')
    reserve_prohibition_date = 0
    error_comment = ''
    work_avail_start_time = None
    work_avail_end_time = None
    reserve_disable_time = None

    if error is None:
        # 근접 예약 취소/등록 시간 : 구버전 호환 + 시간 단위
        lt_res_enable_cancel_time_legacy = 0
        # 강사 업무 시간 : 구버전 호환
        lt_work_time_legacy = '00:00-23:59'
        # 근접 예약 취소 시간 : 구버전 호환 위해 default -1 + 분 단위
        lt_res_cancel_time = -1
        # 근접 예약 등록 시간 : 구버전 호환 위해 default -1 + 분 단위
        lt_res_enable_time = -1
        # 강사 업무 시간
        lt_work_time_avail = ['', '', '', '', '', '', '']

        setting_data = SettingTb.objects.filter(member_id=trainer_id,
                                                class_tb_id=class_id,
                                                use=USE).exclude(Q(setting_type_cd='LT_RES_01') |
                                                                 Q(setting_type_cd='LT_RES_03') |
                                                                 Q(setting_type_cd='LT_RES_05'))

        for setting_info in setting_data:
            if setting_info.setting_type_cd == 'LT_RES_02':
                lt_res_enable_cancel_time_legacy = int(setting_info.setting_info)
            if setting_info.setting_type_cd == 'LT_RES_04':
                lt_work_time_legacy = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_WORK_SUN_TIME_AVAIL':
                lt_work_time_avail[0] = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_WORK_MON_TIME_AVAIL':
                lt_work_time_avail[1] = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_WORK_TUE_TIME_AVAIL':
                lt_work_time_avail[2] = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_WORK_WED_TIME_AVAIL':
                lt_work_time_avail[3] = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_WORK_THS_TIME_AVAIL':
                lt_work_time_avail[4] = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_WORK_FRI_TIME_AVAIL':
                lt_work_time_avail[5] = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_WORK_SAT_TIME_AVAIL':
                lt_work_time_avail[6] = setting_info.setting_info
            if setting_info.setting_type_cd == 'LT_RES_CANCEL_TIME':
                lt_res_cancel_time = int(setting_info.setting_info)
            if setting_info.setting_type_cd == 'LT_RES_ENABLE_TIME':
                lt_res_enable_time = int(setting_info.setting_info)

        # 근접 예약 등록 가능 시간 구버전 호환 + 시간 -> 분
        if lt_res_enable_time == -1:
            lt_res_enable_time = lt_res_enable_cancel_time_legacy * 60
        # 근접 예약 취소 가능 시간 구버전 호환 + 시간 -> 분
        if lt_res_cancel_time == -1:
            lt_res_cancel_time = lt_res_enable_cancel_time_legacy*60

        # 강사 업무 시간 구버전 호환
        if lt_work_time_avail[0] == '':
            lt_work_time_avail[0] = lt_work_time_legacy
        if lt_work_time_avail[1] == '':
            lt_work_time_avail[1] = lt_work_time_legacy
        if lt_work_time_avail[2] == '':
            lt_work_time_avail[2] = lt_work_time_legacy
        if lt_work_time_avail[3] == '':
            lt_work_time_avail[3] = lt_work_time_legacy
        if lt_work_time_avail[4] == '':
            lt_work_time_avail[4] = lt_work_time_legacy
        if lt_work_time_avail[5] == '':
            lt_work_time_avail[5] = lt_work_time_legacy
        if lt_work_time_avail[6] == '':
            lt_work_time_avail[6] = lt_work_time_legacy

        # 선택한 일자의 강사 업무 시간 확인
        start_time_temp = lt_work_time_avail[int(start_date.strftime('%w'))].split('-')[0]
        end_time_temp = lt_work_time_avail[int(start_date.strftime('%w'))].split('-')[1]
        if start_time_temp == '24:00' or start_time_temp == '24:0':
            start_time_temp = '23:59'
        if end_time_temp == '24:00' or end_time_temp == '24:0':
            end_time_temp = '23:59'

        work_avail_start_time = datetime.datetime.strptime(start_time_temp, '%H:%M')
        work_avail_end_time = datetime.datetime.strptime(end_time_temp, '%H:%M')

        # 근접 예약 등록 가능 시간 셋팅
        if add_del_type == ADD_SCHEDULE:
            reserve_prohibition_time = lt_res_enable_time
        else:
            reserve_prohibition_time = lt_res_cancel_time

        # 근접 예약 등록 가능 시간이 일 단위를 넘는 경우
        if reserve_prohibition_time >= 24*60:
            reserve_prohibition_date = int(reserve_prohibition_time/60/24)

        # 근접 예약 시간 확인
        reserve_disable_time = datetime_now + datetime.timedelta(minutes=reserve_prohibition_time)

        # 근접 예약 시간에 따른 error 코멘트
        if reserve_prohibition_date > 0:
            error_comment = '수업 시작 '+str(reserve_prohibition_date)+'일 전까지 예약'
        else:
            error_comment = '수업 시작 '+str(int(reserve_prohibition_time/60))+'시간 전까지 예약'

    # 강사 업무 시간 확인
    if error is None:
        if add_del_start_time < work_avail_start_time:
            error = '예약/취소 가능 시간이 아닙니다.'

        if add_del_end_time > work_avail_end_time:
            error = '예약/취소 가능 시간이 아닙니다.'

    # 근접 예약 시간 확인
    if error is None:
        if start_date < timezone.now():
            error = '이미 지난 일정 입니다.'
        else:
            if start_date < reserve_disable_time:
                if add_del_type == ADD_SCHEDULE:
                    error = error_comment+' 등록이 가능합니다.'
                else:
                    error = error_comment+' 취소가 가능합니다.'

    return error
