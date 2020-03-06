import collections
import datetime
import json

import boto3
import httplib2
from awscli.errorhandler import ClientError
from django.core.exceptions import ObjectDoesNotExist
from django.db import InternalError
from django.db import transaction
from django.db.models import Q
from django.db.models.expressions import RawSQL
from django.utils import timezone

from configs import settings
from configs.const import REPEAT_TYPE_2WEAK, ON_SCHEDULE_TYPE, USE, UN_USE, SCHEDULE_DUPLICATION_DISABLE, \
    STATE_CD_ABSENCE, STATE_CD_FINISH, STATE_CD_IN_PROGRESS, STATE_CD_NOT_PROGRESS, LECTURE_TYPE_ONE_TO_ONE, \
    AUTH_TYPE_VIEW, GROUP_SCHEDULE, OFF_SCHEDULE, FROM_TRAINEE_LESSON_ALARM_ON, TO_SHARED_TRAINER_LESSON_ALARM_OFF, \
    TO_SHARED_TRAINER_LESSON_ALARM_ON, PERMISSION_STATE_CD_WAIT, \
    PERMISSION_STATE_CD_APPROVE, TO_ALL_TRAINEE, TO_ING_TRAINEE, TO_END_TRAINEE, GROUP_TRAINEE, GROUP_TRAINER
from configs.settings import DEBUG
from login.models import PushInfoTb
from trainee.models import MemberTicketTb
from trainer.functions import func_update_lecture_member_fix_status_cd, func_get_member_ing_list, \
    func_get_member_end_list
from trainer.models import MemberClassTb, ClassMemberTicketTb, LectureTb, TicketLectureTb, SettingTb
from .models import ScheduleTb, RepeatScheduleTb, DeleteScheduleTb, DeleteRepeatScheduleTb, HolidayTb, DailyRecordTb, \
    ScheduleAlarmTb

if DEBUG is False:
    from tasks.tasks import task_send_fire_base_push_multi, \
        task_send_fire_base_push_multi_without_badge


def func_get_holiday_schedule(start_date, end_date):

    holiday_data = HolidayTb.objects.filter(holiday_dt__gte=start_date, holiday_dt__lt=end_date,use=USE)

    # 그룹 수업에 속한 회원들의 일정은 제외하고 불러온다.
    ordered_schedule_dict = collections.OrderedDict()
    for holiday_info in holiday_data:
        # array 에 값을 추가후 dictionary 에 추가
        ordered_schedule_dict[holiday_info.holiday_dt] = {'holiday_dt': holiday_info.holiday_dt,
                                                          'holiday_name': holiday_info.holiday_name}

    return ordered_schedule_dict


# 1:1 member_ticket id 조회 - 자유형 문제
def func_get_member_ticket_id(class_id, member_id):
    today = datetime.date.today()
    member_ticket_id = None
    # 강좌에 해당하는 수강/회원 정보 가져오기
    class_member_ticket_data = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb').filter(class_tb_id=class_id, class_tb__use=USE,  auth_cd=AUTH_TYPE_VIEW,
                                   member_ticket_tb__member_id=member_id,
                                   member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
                                   member_ticket_tb__member_ticket_avail_count__gt=0,
                                   # member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW,
                                   # member_ticket_tb__end_date__gte=today,
                                   member_ticket_tb__use=USE).order_by('member_ticket_tb__start_date',
                                                                       'member_ticket_tb__reg_dt')

    for class_member_ticket_info in class_member_ticket_data:
        ticket_single_lecture_count = TicketLectureTb.objects.filter(
            ticket_tb_id=class_member_ticket_info.member_ticket_tb.ticket_tb_id,
            ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
            lecture_tb__state_cd=STATE_CD_IN_PROGRESS, lecture_tb__lecture_type_cd=LECTURE_TYPE_ONE_TO_ONE,
            use=USE).count()
        if ticket_single_lecture_count > 0:
            member_ticket_id = class_member_ticket_info.member_ticket_tb_id
            break

    return member_ticket_id


# 1:1 member_ticket id 조회 - 자유형 문제
def func_get_member_ticket_one_to_one_lecture_info(class_id, member_ticket_id):
    today = datetime.date.today()
    lecture_info = None
    # 강좌에 해당하는 수강/회원 정보 가져오기
    class_member_ticket_data = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb').filter(class_tb_id=class_id, class_tb__use=USE,  auth_cd=AUTH_TYPE_VIEW,
                                   member_ticket_tb_id=member_ticket_id,
                                   member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
                                   member_ticket_tb__member_ticket_avail_count__gt=0,
                                   member_ticket_tb__use=USE).order_by('member_ticket_tb__start_date',
                                                                       'member_ticket_tb__reg_dt')

    for class_member_ticket_info in class_member_ticket_data:
        try:
            ticket_single_lecture = TicketLectureTb.objects.filter(
                ticket_tb_id=class_member_ticket_info.member_ticket_tb.ticket_tb_id,
                ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
                lecture_tb__state_cd=STATE_CD_IN_PROGRESS, lecture_tb__lecture_type_cd=LECTURE_TYPE_ONE_TO_ONE,
                use=USE).earliest('reg_dt')
            lecture_info = ticket_single_lecture.lecture_tb
            break
        except ObjectDoesNotExist:
            lecture_info = None

    return lecture_info


# 그룹 Lecture Id 조회
def func_get_lecture_member_ticket_id(class_id, lecture_id, member_id):

    member_ticket_id = None
    error = None
    class_member_ticket_data = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb').filter(class_tb_id=class_id, class_tb__use=USE,  auth_cd=AUTH_TYPE_VIEW,
                                   member_ticket_tb__member_id=member_id,
                                   member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
                                   member_ticket_tb__member_ticket_avail_count__gt=0,
                                   member_ticket_tb__use=USE).order_by('member_ticket_tb__start_date',
                                                                       'member_ticket_tb__reg_dt')

    for class_member_ticket_info in class_member_ticket_data:
        ticket_lecture_count = TicketLectureTb.objects.filter(
            ticket_tb_id=class_member_ticket_info.member_ticket_tb.ticket_tb_id,
            ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
            lecture_tb__state_cd=STATE_CD_IN_PROGRESS, lecture_tb_id=lecture_id, use=USE).count()

        if ticket_lecture_count > 0:
            member_ticket_id = class_member_ticket_info.member_ticket_tb.member_ticket_id
            break

    if len(class_member_ticket_data) == 0:
        error = '예약 가능 횟수를 확인해주세요.'

    return {'error': error, 'member_ticket_id': member_ticket_id}


# 그룹 Lecture Id 조회
def func_get_lecture_member_ticket_id_from_trainee(class_id, lecture_id, member_id):

    today = datetime.date.today()
    member_ticket_id = None
    error = None
    class_member_ticket_data = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb').filter(class_tb_id=class_id, class_tb__use=USE,  auth_cd=AUTH_TYPE_VIEW,
                                   member_ticket_tb__member_id=member_id,
                                   member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
                                   member_ticket_tb__member_ticket_avail_count__gt=0,
                                   member_ticket_tb__use=USE).order_by('member_ticket_tb__start_date',
                                                                       'member_ticket_tb__reg_dt')

    for class_member_ticket_info in class_member_ticket_data:
        if class_member_ticket_info.member_ticket_tb.end_date >= today:
            ticket_lecture_count = TicketLectureTb.objects.filter(
                ticket_tb_id=class_member_ticket_info.member_ticket_tb.ticket_tb_id,
                ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
                lecture_tb__state_cd=STATE_CD_IN_PROGRESS, lecture_tb_id=lecture_id, use=USE).count()

            if ticket_lecture_count > 0:
                member_ticket_id = class_member_ticket_info.member_ticket_tb.member_ticket_id
                break

    if len(class_member_ticket_data) == 0:
        error = '예약 가능 횟수를 확인해주세요.'

    if len(class_member_ticket_data) > 0 and member_ticket_id is None:
        error = '수강 종료일 이후의 일정은 등록이 불가능합니다.'

    return {'error': error, 'member_ticket_id': member_ticket_id}


# 수강정보 - 횟수관련 update
def func_refresh_member_ticket_count(class_id, member_ticket_id):
    error = None
    member_ticket_info = None
    check_member_ticket_state_cd = ''

    if member_ticket_id is None or member_ticket_id == '':
        error = '수강정보를 불러오지 못했습니다.[0]'

    if error is None:
        try:
            member_ticket_info = MemberTicketTb.objects.get(member_ticket_id=member_ticket_id, use=USE)
            check_member_ticket_state_cd = member_ticket_info.state_cd
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.[1]'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id, member_ticket_tb_id=member_ticket_id,
                                                  use=USE)
        if member_ticket_info.member_ticket_reg_count >= len(schedule_data):
            member_ticket_info.member_ticket_avail_count = member_ticket_info.member_ticket_reg_count\
                                                           - len(schedule_data)
        else:
            error = '오류가 발생했습니다.[0]'

        end_schedule_counter = schedule_data.filter(Q(state_cd=STATE_CD_FINISH) | Q(state_cd=STATE_CD_ABSENCE),
                                                    class_tb_id=class_id,
                                                    use=USE).count()

        if member_ticket_info.member_ticket_reg_count >= end_schedule_counter:
            member_ticket_info.member_ticket_rem_count = member_ticket_info.member_ticket_reg_count\
                                                         - end_schedule_counter
            if member_ticket_info.member_ticket_rem_count == 0:
                member_ticket_info.state_cd = STATE_CD_FINISH

            if member_ticket_info.state_cd == STATE_CD_FINISH:
                member_ticket_info.member_ticket_rem_count = 0

        else:
            error = '오류가 발생했습니다.[1]'

    if error is None:
        member_ticket_info.save()

    if error is None:
        # if member_ticket_info.state_cd != check_member_ticket_state_cd:
        #     if member_ticket_info.state_cd == STATE_CD_FINISH or member_ticket_info.state_cd == 'RF':
        func_update_lecture_member_fix_status_cd(class_id, member_ticket_info.member_id)

    return error


# 그룹정보 update
def func_refresh_lecture_status(lecture_id, lecture_schedule_id, lecture_repeat_schedule_id):
    # 그룹 스케쥴 종료 및 그룹 반복 일정 종료
    if lecture_schedule_id is not None and lecture_schedule_id != '':
        try:
            lecture_schedule_info = ScheduleTb.objects.get(schedule_id=lecture_schedule_id, use=USE)
        except ObjectDoesNotExist:
            lecture_schedule_info = None
        lecture_schedule_total_count = ScheduleTb.objects.filter(lecture_schedule_id=lecture_schedule_id,
                                                                 permission_state_cd=PERMISSION_STATE_CD_APPROVE,
                                                                 use=USE).count()
        lecture_schedule_end_count = ScheduleTb.objects.filter(Q(state_cd=STATE_CD_FINISH)
                                                               | Q(state_cd=STATE_CD_ABSENCE),
                                                               permission_state_cd=PERMISSION_STATE_CD_APPROVE,
                                                               lecture_schedule_id=lecture_schedule_id,
                                                               lecture_tb_id=lecture_id, use=USE).count()

        if lecture_schedule_info is not None:
            # if lecture_schedule_info.lecture_tb.member_num <= lecture_schedule_end_count:
            if lecture_schedule_total_count == lecture_schedule_end_count:
                if lecture_schedule_info.state_cd != STATE_CD_FINISH:
                    lecture_schedule_info.state_cd = STATE_CD_FINISH
                    lecture_schedule_info.save()
            else:
                if lecture_schedule_info.state_cd == STATE_CD_FINISH:
                    lecture_schedule_info.state_cd = STATE_CD_NOT_PROGRESS
                    lecture_schedule_info.save()

    # 그룹 반복 일정 종료
    if lecture_repeat_schedule_id is not None and lecture_repeat_schedule_id != '':
        try:
            lecture_repeat_schedule_info = RepeatScheduleTb.objects.get(repeat_schedule_id=lecture_repeat_schedule_id)
        except ObjectDoesNotExist:
            lecture_repeat_schedule_info = None

        lecture_repeat_schedule_total_count = \
            RepeatScheduleTb.objects.filter(lecture_schedule_id=lecture_repeat_schedule_id).count()
        lecture_repeat_schedule_end_count = RepeatScheduleTb.objects.filter(
            lecture_schedule_id=lecture_repeat_schedule_id, state_cd=STATE_CD_FINISH).count()
        if lecture_repeat_schedule_info is not None:
            if lecture_repeat_schedule_total_count == lecture_repeat_schedule_end_count:
                lecture_repeat_schedule_info.state_cd = STATE_CD_FINISH
                lecture_repeat_schedule_info.save()


# 일정 등록
def func_add_schedule(class_id, member_ticket_id, repeat_schedule_id,
                      lecture_info, lecture_schedule_id, start_datetime, end_datetime,
                      note, en_dis_type, user_id, permission_state_cd, state_cd, duplication_enable_flag):
    error = None
    context = {'error': None, 'schedule_id': ''}
    if member_ticket_id == '':
        member_ticket_id = None
    # if lecture_id == '':
    lecture_id = None
    if lecture_schedule_id == '':
        lecture_schedule_id = None
    if repeat_schedule_id == '':
        repeat_schedule_id = None

    max_mem_count = 1
    ing_color_cd = ''
    end_color_cd = ''
    ing_font_color_cd = ''
    end_font_color_cd = ''
    alarm_setting_data = None

    if lecture_info is not None and lecture_info.lecture_type_cd != LECTURE_TYPE_ONE_TO_ONE:

        if lecture_schedule_id is not None:
            error = func_check_lecture_available_member_before(class_id, lecture_info, lecture_schedule_id,
                                                               permission_state_cd)

    if lecture_info is not None:
        lecture_id = lecture_info.lecture_id
        max_mem_count = lecture_info.member_num
        ing_color_cd = lecture_info.ing_color_cd
        end_color_cd = lecture_info.end_color_cd
        ing_font_color_cd = lecture_info.ing_font_color_cd
        end_font_color_cd = lecture_info.end_font_color_cd

        if lecture_info.lecture_type_cd == LECTURE_TYPE_ONE_TO_ONE:
            # lecture_info = None
            # lecture_id = None
            lecture_schedule_id = None

    if str(en_dis_type) == str(OFF_SCHEDULE):
        ing_color_cd = '#d2d1cf'
        end_color_cd = '#d2d1cf'
        ing_font_color_cd = '#3b3b3b'
        end_font_color_cd = '#3b3b3b'
    else:
        alarm_setting_data = func_get_program_alarm_data(class_id)

    if error is None:
        try:
            with transaction.atomic():
                add_schedule_info = ScheduleTb(class_tb_id=class_id,
                                               member_ticket_tb_id=member_ticket_id,
                                               lecture_tb_id=lecture_id,
                                               lecture_schedule_id=lecture_schedule_id,
                                               repeat_schedule_tb_id=repeat_schedule_id,
                                               start_dt=start_datetime, end_dt=end_datetime,
                                               state_cd=state_cd, permission_state_cd=permission_state_cd,
                                               note=note, member_note='', en_dis_type=en_dis_type,
                                               max_mem_count=max_mem_count,
                                               ing_color_cd=ing_color_cd, end_color_cd=end_color_cd,
                                               ing_font_color_cd=ing_font_color_cd, end_font_color_cd=end_font_color_cd,
                                               # Test 용
                                               # alarm_dt=start_datetime-datetime.timedelta(minutes=5),
                                               reg_member_id=user_id,
                                               mod_member_id=user_id)
                add_schedule_info.save()
                schedule_id = add_schedule_info.schedule_id

                if str(en_dis_type) != str(OFF_SCHEDULE):
                    for alarm_setting_info in alarm_setting_data:
                        if member_ticket_id is not None:
                            if lecture_schedule_id is None:
                                # 1:1 수업
                                if add_schedule_info.member_ticket_tb.member_id != alarm_setting_info.member_id:
                                    if alarm_setting_info.user_group == GROUP_TRAINEE:
                                        continue
                            else:
                                # 그룹 수업 - 회원 포함
                                if add_schedule_info.member_ticket_tb.member_id != alarm_setting_info.member_id:
                                    if alarm_setting_info.user_group == GROUP_TRAINER:
                                        continue
                        # 그룹 수업 껍데기
                        else:
                            if alarm_setting_info.user_group == GROUP_TRAINEE:
                                continue

                        setting_schedule_alarm_minute = alarm_setting_info.setting_info
                        alarm_dt = start_datetime - datetime.timedelta(minutes=int(setting_schedule_alarm_minute))
                        schedule_alarm_info = ScheduleAlarmTb(class_tb_id=class_id,
                                                              schedule_tb_id=schedule_id,
                                                              alarm_dt=alarm_dt,
                                                              member_id=alarm_setting_info.member_id,
                                                              alarm_minute=setting_schedule_alarm_minute,
                                                              use=USE)
                        schedule_alarm_info.save()

                if lecture_info is not None:
                    if lecture_schedule_id is not None:
                        error = func_check_lecture_available_member_after(class_id, lecture_info, lecture_schedule_id,
                                                                          permission_state_cd)
                if error is None:
                    error = func_date_check(class_id, schedule_id,
                                            str(start_datetime).split(' ')[0], start_datetime, end_datetime,
                                            duplication_enable_flag)
                    if error is not None:
                        error = ' 일정이 중복되었습니다.'

                context['schedule_id'] = schedule_id

        except TypeError:
            error = '일정 추가중 오류가 발생했습니다.'
        except ValueError:
            error = '일정 추가중 오류가 발생했습니다.'

    if error is None and member_ticket_id is not None:
        error = func_refresh_member_ticket_count(class_id, member_ticket_id)

    context['error'] = error

    return context


# 일정 등록
def func_add_schedule_update(class_id, member_ticket_id, repeat_schedule_id,
                             lecture_info, lecture_schedule_id,
                             start_datetime, end_datetime,
                             note, en_dis_type, user_id, permission_state_cd, state_cd, duplication_enable_flag):
    error = None
    context = {'error': None, 'schedule_id': ''}
    if member_ticket_id == '':
        member_ticket_id = None
    # if lecture_id == '':
    lecture_id = None
    if lecture_schedule_id == '':
        lecture_schedule_id = None
    if repeat_schedule_id == '':
        repeat_schedule_id = None
    alarm_setting_data = None
    max_mem_count = 1
    ing_color_cd = ''
    end_color_cd = ''
    ing_font_color_cd = ''
    end_font_color_cd = ''

    if lecture_info is not None:
        lecture_id = lecture_info.lecture_id
        max_mem_count = lecture_info.member_num
        ing_color_cd = lecture_info.ing_color_cd
        end_color_cd = lecture_info.end_color_cd
        ing_font_color_cd = lecture_info.ing_font_color_cd
        end_font_color_cd = lecture_info.end_font_color_cd

        if lecture_info.lecture_type_cd == LECTURE_TYPE_ONE_TO_ONE:
            # lecture_info = None
            # lecture_id = None
            lecture_schedule_id = None

    if str(en_dis_type) == str(OFF_SCHEDULE):
        ing_color_cd = '#d2d1cf'
        end_color_cd = '#d2d1cf'
        ing_font_color_cd = '#3b3b3b'
        end_font_color_cd = '#3b3b3b'
    else:
        alarm_setting_data = func_get_program_alarm_data(class_id)

    if error is None:
        try:
            with transaction.atomic():
                add_schedule_info = ScheduleTb(class_tb_id=class_id,
                                               member_ticket_tb_id=member_ticket_id,
                                               lecture_tb_id=lecture_id,
                                               lecture_schedule_id=lecture_schedule_id,
                                               repeat_schedule_tb_id=repeat_schedule_id,
                                               start_dt=start_datetime, end_dt=end_datetime,
                                               state_cd=state_cd, permission_state_cd=permission_state_cd,
                                               note=note, member_note='', en_dis_type=en_dis_type,
                                               max_mem_count=max_mem_count,
                                               ing_color_cd=ing_color_cd, end_color_cd=end_color_cd,
                                               ing_font_color_cd=ing_font_color_cd, end_font_color_cd=end_font_color_cd,
                                               # Test 용
                                               # alarm_dt=start_datetime-datetime.timedelta(minutes=5),
                                               reg_member_id=user_id,
                                               mod_member_id=user_id)
                add_schedule_info.save()
                schedule_id = add_schedule_info.schedule_id
                if str(en_dis_type) != str(OFF_SCHEDULE):
                    for alarm_setting_info in alarm_setting_data:
                        # 그룹 수업 - 회원 포함
                        if add_schedule_info.member_ticket_tb.member_id != alarm_setting_info.member_id:
                            if alarm_setting_info.user_group == GROUP_TRAINEE:
                                continue

                        setting_schedule_alarm_minute = alarm_setting_info.setting_info
                        alarm_dt = start_datetime - datetime.timedelta(minutes=int(setting_schedule_alarm_minute))
                        # try:
                        #     schedule_alarm_info = ScheduleAlarmTb.objects.get(schedule_tb_id=schedule_id,
                        #                                                       alarm_dt=alarm_dt)
                        #     if not str(user_id) in schedule_alarm_info.member_ids:
                        #         schedule_alarm_info.member_ids += ','+str(alarm_setting_info.member_id)
                        #         schedule_alarm_info.save()
                        # except ObjectDoesNotExist:
                        schedule_alarm_info = ScheduleAlarmTb(class_tb_id=class_id,
                                                              schedule_tb_id=schedule_id,
                                                              alarm_dt=alarm_dt,
                                                              member_id=alarm_setting_info.member_id,
                                                              alarm_minute=setting_schedule_alarm_minute,
                                                              use=USE)
                        schedule_alarm_info.save()
                        # add_schedule_info.schedule_alarm_tb_id = schedule_alarm_info.schedule_alarm_id
                        # add_schedule_info.save()

                if error is None:
                    error = func_date_check(class_id, add_schedule_info.schedule_id,
                                            str(start_datetime).split(' ')[0], start_datetime, end_datetime,
                                            duplication_enable_flag)
                    if error is not None:
                        error = ' 일정이 중복되었습니다.'

                context['schedule_id'] = add_schedule_info.schedule_id

        except TypeError:
            error = '일정 추가중 오류가 발생했습니다.'
        except ValueError:
            error = '일정 추가중 오류가 발생했습니다.'

    if error is None and member_ticket_id is not None:
        error = func_refresh_member_ticket_count(class_id, member_ticket_id)

    context['error'] = error

    return context


# 일정 등록
def func_add_repeat_schedule(class_id, member_ticket_id, lecture_id, lecture_schedule_id, repeat_type,
                             week_type, start_date, end_date, start_time, end_time, en_dis_type,
                             user_id):
    error = None
    context = {'error': None, 'schedule_info': None}

    if member_ticket_id == '':
        member_ticket_id = None
    try:
        with transaction.atomic():
            repeat_schedule_info = RepeatScheduleTb(class_tb_id=class_id, member_ticket_tb_id=member_ticket_id,
                                                    lecture_tb_id=lecture_id, lecture_schedule_id=lecture_schedule_id,
                                                    repeat_type_cd=repeat_type,
                                                    week_info=week_type,
                                                    start_date=start_date,
                                                    end_date=end_date,
                                                    start_time=start_time,
                                                    end_time=end_time,
                                                    state_cd=STATE_CD_NOT_PROGRESS, en_dis_type=en_dis_type,
                                                    reg_member_id=user_id,
                                                    mod_member_id=user_id)

            repeat_schedule_info.save()
            context['schedule_info'] = repeat_schedule_info
    except TypeError:
        error = '등록 값에 문제가 있습니다.'
    except ValueError:
        error = '등록 값에 문제가 있습니다.'
    context['error'] = error

    return context


# 일정 취소
def func_delete_schedule(class_id, schedule_id,  user_id):
    error = None
    context = {'error': None, 'schedule_id': ''}
    schedule_info = None

    if schedule_id is None or schedule_id == '':
        error = '일정 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            with transaction.atomic():
                delete_schedule_info = DeleteScheduleTb(schedule_id=schedule_info.schedule_id,
                                                        class_tb_id=schedule_info.class_tb_id,
                                                        lecture_tb_id=schedule_info.lecture_tb_id,
                                                        member_ticket_tb_id=schedule_info.member_ticket_tb_id,
                                                        lecture_schedule_id=schedule_info.lecture_schedule_id,
                                                        delete_repeat_schedule_tb=schedule_info.repeat_schedule_tb_id,
                                                        daily_record_tb_id=schedule_info.daily_record_tb_id,
                                                        start_dt=schedule_info.start_dt, end_dt=schedule_info.end_dt,
                                                        permission_state_cd=schedule_info.permission_state_cd,
                                                        state_cd=schedule_info.state_cd, note=schedule_info.note,
                                                        en_dis_type=schedule_info.en_dis_type,
                                                        member_note=schedule_info.member_note,
                                                        reg_member=schedule_info.reg_member,
                                                        del_member=user_id,
                                                        reg_dt=schedule_info.reg_dt, mod_dt=timezone.now(), use=UN_USE)

                delete_schedule_info.save()
                daily_record_info = DailyRecordTb.objects.filter(schedule_tb_id=schedule_id)
                daily_record_info.delete()
                func_delete_daily_record_content_image_logic(
                    'https://s3.ap-northeast-2.amazonaws.com/pters-image-master/daily-record/'
                    + str(user_id) + '_' + str(class_id) + '/' + str(schedule_id)+'/')

                schedule_info.delete()

                if str(delete_schedule_info.en_dis_type) == str(ON_SCHEDULE_TYPE):
                    if delete_schedule_info.member_ticket_tb is not None:
                        error = func_refresh_member_ticket_count(class_id, delete_schedule_info.member_ticket_tb_id)
                        if error is not None:
                            raise InternalError()

                    repeat_schedule_id = delete_schedule_info.delete_repeat_schedule_tb
                    if repeat_schedule_id is not None and repeat_schedule_id != '':
                        error = func_update_repeat_schedule(repeat_schedule_id)
                        if error is not None:
                            raise InternalError()
                context['schedule_id'] = delete_schedule_info.delete_schedule_id

        except TypeError:
            error = '일정 취소중 오류가 발생했습니다.[0]'
        except ValueError:
            error = '일정 취소중 오류가 발생했습니다.[1]'
        except InternalError:
            error = error

    context['error'] = error

    return context


# 반복 일정 삭제
def func_delete_repeat_schedule(repeat_schedule_id):
    error = None
    context = {'error': None, 'schedule_info': ''}
    repeat_schedule_info = None

    if repeat_schedule_id is None or repeat_schedule_id == '':
        error = '반복 일정 정보를 불러오지 못했습니다.'

    if error is None:

        try:
            repeat_schedule_info = RepeatScheduleTb.objects.get(repeat_schedule_id=repeat_schedule_id)
        except ObjectDoesNotExist:
            error = '반복 일정 정보를 불러오지 못했습니다.'
    if error is None:
        try:
            with transaction.atomic():
                delete_repeat_schedule = DeleteRepeatScheduleTb(
                    repeat_schedule_id=repeat_schedule_info.repeat_schedule_id,
                    class_tb_id=repeat_schedule_info.class_tb_id,
                    member_ticket_tb_id=repeat_schedule_info.member_ticket_tb_id,
                    lecture_tb_id=repeat_schedule_info.lecture_tb_id,
                    lecture_schedule_id=repeat_schedule_info.lecture_schedule_id,
                    repeat_type_cd=repeat_schedule_info.repeat_type_cd,
                    week_info=repeat_schedule_info.week_info,
                    start_date=repeat_schedule_info.start_date,
                    end_date=repeat_schedule_info.end_date,
                    start_time=repeat_schedule_info.start_time,
                    time_duration=repeat_schedule_info.time_duration,
                    state_cd=repeat_schedule_info.state_cd, en_dis_type=repeat_schedule_info.en_dis_type,
                    reg_member_id=repeat_schedule_info.reg_member_id,
                    reg_dt=repeat_schedule_info.reg_dt, mod_dt=timezone.now(), use=UN_USE)

                delete_repeat_schedule.save()
                repeat_schedule_info.delete()
                context['schedule_info'] = delete_repeat_schedule
        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
    context['error'] = error

    return context


def func_update_repeat_schedule(repeat_schedule_id):
    error = None
    repeat_schedule_info = None
    if repeat_schedule_id is None or repeat_schedule_id == '':
        error = '반복 일정 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            repeat_schedule_info = RepeatScheduleTb.objects.get(repeat_schedule_id=repeat_schedule_id)
        except ObjectDoesNotExist:
            error = '반복 일정 정보를 불러오지 못했습니다.'

    if error is None:
        repeat_schedule_count = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id).count()
        repeat_schedule_finish_count = ScheduleTb.objects.filter(Q(state_cd=STATE_CD_FINISH)
                                                                 | Q(state_cd=STATE_CD_ABSENCE),
                                                                 repeat_schedule_tb_id=repeat_schedule_id).count()
        if repeat_schedule_count == 0:
            repeat_schedule_result = func_delete_repeat_schedule(repeat_schedule_id)
            error = repeat_schedule_result['error']
        else:
            if repeat_schedule_count == repeat_schedule_finish_count:
                repeat_schedule_info.state_cd = STATE_CD_FINISH
            else:
                repeat_schedule_info.state_cd = STATE_CD_IN_PROGRESS
            if repeat_schedule_finish_count == 0:
                repeat_schedule_info.state_cd = STATE_CD_NOT_PROGRESS
            repeat_schedule_info.save()

    return error


# 그룹일정 등록전 그룹에 허용 가능 인원 확인
def func_check_lecture_available_member_before(class_id, lecture_info, lecture_schedule_id, permission_state_cd):
    error = None
    # lecture_info = None
    # try:
    #     lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
    # except ObjectDoesNotExist:
    #     error = '오류가 발생했습니다.'

    try:
        setting_info = SettingTb.objects.get(class_tb_id=class_id,
                                             setting_type_cd='LT_RES_PUBLIC_CLASS_WAIT_MEMBER_NUM', use=USE)
        setting_member_public_class_wait_member_num = int(setting_info.setting_info)
    except ObjectDoesNotExist:
        setting_member_public_class_wait_member_num = 0

    schedule_wait_counter = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                      lecture_schedule_id=lecture_schedule_id,
                                                      permission_state_cd=PERMISSION_STATE_CD_WAIT,
                                                      use=USE).count()
    schedule_approve_counter = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                         lecture_schedule_id=lecture_schedule_id,
                                                         permission_state_cd=PERMISSION_STATE_CD_APPROVE,
                                                         use=USE).exclude(state_cd=STATE_CD_ABSENCE).count()
    if permission_state_cd == PERMISSION_STATE_CD_APPROVE:
        if schedule_approve_counter >= lecture_info.member_num:
            error = '정원을 초과했습니다.'
    else:
        if schedule_wait_counter >= setting_member_public_class_wait_member_num:
            error = '대기 예약 정원을 초과했습니다.'

    return error


# 그룹일정 등록후 그룹에 허용 가능 인원 확인
def func_check_lecture_available_member_after(class_id, lecture_info, lecture_schedule_id, permission_state_cd):
    error = None
    # lecture_info = None
    # try:
    #     lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
    #
    # except ObjectDoesNotExist:
    #     error = '오류가 발생했습니다.'
    try:
        setting_info = SettingTb.objects.get(class_tb_id=class_id,
                                             setting_type_cd='LT_RES_PUBLIC_CLASS_WAIT_MEMBER_NUM', use=USE)
        setting_member_public_class_wait_member_num = int(setting_info.setting_info)
    except ObjectDoesNotExist:
        setting_member_public_class_wait_member_num = 0

    schedule_wait_counter = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                      lecture_schedule_id=lecture_schedule_id,
                                                      permission_state_cd=PERMISSION_STATE_CD_WAIT,
                                                      use=USE).count()
    schedule_approve_counter = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                         lecture_schedule_id=lecture_schedule_id,
                                                         permission_state_cd=PERMISSION_STATE_CD_APPROVE,
                                                         use=USE).exclude(state_cd=STATE_CD_ABSENCE).count()
    if permission_state_cd == PERMISSION_STATE_CD_APPROVE:
        if schedule_approve_counter > lecture_info.member_num:
            error = '정원을 초과했습니다.'
    else:
        if schedule_wait_counter > setting_member_public_class_wait_member_num:
            error = '대기 예약 정원을 초과했습니다.'

    return error


# 일정 중복 체크
def func_date_check(class_id, schedule_id, pt_schedule_date, add_start_dt, add_end_dt, duplication_enable_flag):
    error = None
    if int(duplication_enable_flag) == SCHEDULE_DUPLICATION_DISABLE:
        one_days_ago = add_start_dt - datetime.timedelta(days=1)
        one_days_after = add_end_dt + datetime.timedelta(days=1)

        schedule_data = ScheduleTb.objects.filter(~Q(state_cd=STATE_CD_ABSENCE), class_tb_id=class_id,
                                                  start_dt__gte=one_days_ago, end_dt__lte=one_days_after,
                                                  use=USE).exclude(schedule_id=schedule_id)

        for schedule_info in schedule_data:
            if schedule_info.start_dt >= add_start_dt:
                if schedule_info.start_dt < add_end_dt:
                    error = str(pt_schedule_date)
            if schedule_info.end_dt > add_start_dt:
                if schedule_info.end_dt < add_end_dt:
                    error = str(pt_schedule_date)
            if schedule_info.start_dt <= add_start_dt:
                if schedule_info.end_dt >= add_end_dt:
                    error = str(pt_schedule_date)
            if error is not None:
                break

    return error


# # 강사 -> 회원 push 메시지 전달
def func_send_push_trainer(member_ticket_id, title, message):
    error = None
    if member_ticket_id is not None and member_ticket_id != '':
        registration_ids = []
        multi_badge_counter = -1
        member_ticket_data = MemberTicketTb.objects.select_related(
            'member').filter(member_ticket_id=member_ticket_id, member_auth_cd=AUTH_TYPE_VIEW, use=USE)

        token_data = PushInfoTb.objects.filter(use=USE)

        for member_ticket_info in member_ticket_data:
            # token_data = PushInfoTb.objects.filter(member_id=member_ticket_info.member_id, use=USE)
            for token_info in token_data:
                if str(token_info.member_id) == str(member_ticket_info.member_id):
                    if token_info.device_id != 'pc':
                        token_info.badge_counter += 1
                        token_info.save()
                    instance_id = token_info.token

                    if multi_badge_counter == -1:
                        multi_badge_counter = token_info.badge_counter
                    if multi_badge_counter > token_info.badge_counter:
                        multi_badge_counter = token_info.badge_counter
                    badge_counter = token_info.badge_counter

                    registration_ids.append(instance_id)
                    #     error = send_fire_base_push(instance_id, title, message, badge_counter)

        check_async = False
        if DEBUG is False:
            check_async = True
        if len(registration_ids) > 0:
            if check_async:
                error = task_send_fire_base_push_multi.delay(registration_ids, title, message, multi_badge_counter)
            else:
                error = send_fire_base_push_multi(registration_ids, title, message, multi_badge_counter)

    return error


# 회원 -> 강사 push 메시지 전달
def func_send_push_trainee(class_id, title, message):
    error = None
    if class_id is not None and class_id != '':
        registration_ids = []
        multi_badge_counter = -1
        member_class_data = MemberClassTb.objects.select_related('class_tb',
                                                                 'member').filter(class_tb_id=class_id,
                                                                                  auth_cd=AUTH_TYPE_VIEW, use=USE)
        try:
            setting_data = SettingTb.objects.get(class_tb_id=class_id,
                                                 setting_type_cd='LT_PUS_TO_SHARED_TRAINER_LESSON_ALARM')
            lt_pus_to_shared_trainer_lesson_alarm = int(setting_data.setting_info)
        except ObjectDoesNotExist:
            lt_pus_to_shared_trainer_lesson_alarm = TO_SHARED_TRAINER_LESSON_ALARM_OFF

        token_data = PushInfoTb.objects.select_related('member').filter(use=USE)

        for member_class_info in member_class_data:
            push_check = False
            if str(member_class_info.class_tb.member_id) != str(member_class_info.member_id):
                if str(lt_pus_to_shared_trainer_lesson_alarm) == str(TO_SHARED_TRAINER_LESSON_ALARM_ON):
                    push_check = True
            else:
                push_check = True

            if push_check:
                try:
                    setting_data = SettingTb.objects.get(member_id=member_class_info.member_id, class_tb_id=class_id,
                                                         setting_type_cd='LT_PUS_FROM_TRAINEE_LESSON_ALARM')
                    lt_pus_from_trainee_lesson_alarm = int(setting_data.setting_info)
                except ObjectDoesNotExist:
                    lt_pus_from_trainee_lesson_alarm = FROM_TRAINEE_LESSON_ALARM_ON

                if str(lt_pus_from_trainee_lesson_alarm) == str(FROM_TRAINEE_LESSON_ALARM_ON):
                    # token_data = PushInfoTb.objects.filter(member_id=member_class_info.member_id, use=USE)
                    for token_info in token_data:
                        # print(str(token_info['member_id'])+':'+str(member_class_info.member_id))

                        if str(token_info.member_id) == str(member_class_info.member_id):
                            if token_info.device_id != 'pc':
                                token_info.badge_counter += 1
                                token_info.save()
                            instance_id = token_info.token
                            if multi_badge_counter == -1:
                                multi_badge_counter = token_info.badge_counter
                            if multi_badge_counter > token_info.badge_counter:
                                multi_badge_counter = token_info.badge_counter
                            badge_counter = token_info.badge_counter
                            # if DEBUG is False:
                            #     check_async = True
                                # from configs.celery import CELERY_WORKING
                                # try:
                                #     if CELERY_WORKING:
                                #         check_async = True
                                #     else:
                                #         check_async = False
                                # except OperationalError:
                                #     check_async = False

                            # if check_async:
                            #     error = task_send_fire_base_push.delay(instance_id, title, message, badge_counter)
                            # else:
                            registration_ids.append(instance_id)
                                # error = send_fire_base_push(instance_id, title, message, badge_counter)
        # if len(registration_ids) > 0:
        #     error = send_fire_base_push_multi(registration_ids, title, message, multi_badge_counter)

        check_async = False
        if DEBUG is False:
            check_async = True
        if len(registration_ids) > 0:
            if check_async:
                error = task_send_fire_base_push_multi.delay(registration_ids, title, message, multi_badge_counter)
            else:
                error = send_fire_base_push_multi(registration_ids, title, message, multi_badge_counter)
    return error


# 강사 -> 강사 push 메시지 전달
def func_send_push_trainer_trainer(class_id, title, message, member_id):
    error = None
    if class_id is not None and class_id != '':
        registration_ids = []
        multi_badge_counter = -1

        member_class_data = MemberClassTb.objects.select_related('member').filter(class_tb_id=class_id,
                                                                                  auth_cd=AUTH_TYPE_VIEW, use=USE)
        token_data = PushInfoTb.objects.filter(use=USE)

        for member_class_info in member_class_data:
            if str(member_id) != str(member_class_info.member_id):
                try:
                    setting_data = SettingTb.objects.get(member_id=member_class_info.member_id, class_tb_id=class_id,
                                                         setting_type_cd='LT_PUS_FROM_TRAINEE_LESSON_ALARM')
                    lt_pus_from_trainee_lesson_alarm = int(setting_data.setting_info)
                except ObjectDoesNotExist:
                    lt_pus_from_trainee_lesson_alarm = FROM_TRAINEE_LESSON_ALARM_ON

                if str(lt_pus_from_trainee_lesson_alarm) == str(FROM_TRAINEE_LESSON_ALARM_ON):

                    # token_data = PushInfoTb.objects.filter(member_id=member_class_info.member_id, use=USE)
                    for token_info in token_data:
                        if str(token_info.member_id) == str(member_class_info.member_id):
                            if token_info.device_id != 'pc':
                                token_info.badge_counter += 1
                                token_info.save()
                            instance_id = token_info.token
                            if multi_badge_counter == -1:
                                multi_badge_counter = token_info.badge_counter
                            if multi_badge_counter > token_info.badge_counter:
                                multi_badge_counter = token_info.badge_counter
                            badge_counter = token_info.badge_counter
                            # if DEBUG is False:
                            #     check_async = True
                                # from configs.celery import CELERY_WORKING
                                # try:
                                #     if CELERY_WORKING:
                                #         check_async = True
                                #     else:
                                #         check_async = False
                                # except OperationalError:
                                #     check_async = False

                            # if check_async:
                            #     error = task_send_fire_base_push.delay(instance_id, title, message, badge_counter)
                            # else:
                            registration_ids.append(instance_id)
                                # error = send_fire_base_push(instance_id, title, message, badge_counter)

        # if len(registration_ids) > 0:
        #     error = send_fire_base_push_multi(registration_ids, title, message, multi_badge_counter)

        check_async = False
        if DEBUG is False:
            check_async = True
        if len(registration_ids) > 0:
            if check_async:
                error = task_send_fire_base_push_multi.delay(registration_ids, title, message, multi_badge_counter)
            else:
                error = send_fire_base_push_multi(registration_ids, title, message, multi_badge_counter)
    return error


# # 강사 -> 회원 공지 push 메시지 전달
def func_send_push_notice(to_member_type_cd, class_id, title, message):
    error = None
    registration_ids = []
    member_data = []
    token_data = PushInfoTb.objects.filter(use=USE)

    if to_member_type_cd == TO_ALL_TRAINEE:
        member_data = func_get_member_ing_list(class_id, None, '')
        member_data += func_get_member_end_list(class_id, None, '')
    elif to_member_type_cd == TO_ING_TRAINEE:
        member_data = func_get_member_ing_list(class_id, None, '')
    elif to_member_type_cd == TO_END_TRAINEE:
        member_data = func_get_member_end_list(class_id, None, '')

    for member_info in member_data:
        for token_info in token_data:
            if str(token_info.member_id) == str(member_info['member_id']):
                if token_info.device_id != 'pc':
                    token_info.badge_counter += 1
                    token_info.save()
                instance_id = token_info.token

                registration_ids.append(instance_id)

    check_async = False
    if DEBUG is False:
        check_async = True
    if len(registration_ids) > 0:
        if check_async:
            error = task_send_fire_base_push_multi_without_badge.delay(registration_ids, title, message)
        else:
            error = send_fire_base_push_multi_without_badge(registration_ids, title, message)

    return error


def send_fire_base_push(instance_id, title, message, badge_counter):
    push_server_id = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')
    error = None
    data = {
        'to': instance_id,
        'notification': {
            'title': title,
            'body': message,
            'badge': badge_counter,
            'sound': 'default'
        }
    }
    body = json.dumps(data)
    h = httplib2.Http()

    resp, content = h.request("https://fcm.googleapis.com/fcm/send", method="POST", body=body,
                              headers={'Content-Type': 'application/json;',
                                       'Authorization': 'key=' + push_server_id})

    if resp['status'] != '200':
        error = '오류가 발생했습니다.'
    return error


def send_fire_base_push_multi(registration_ids, title, message, badge_counter):
    push_server_id = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')
    error = None
    data = {
        'registration_ids': registration_ids,
        'notification': {
            'title': title,
            'body': message,
            'badge': badge_counter,
            'sound': 'default'
        }
    }
    body = json.dumps(data)
    h = httplib2.Http()

    resp, content = h.request("https://fcm.googleapis.com/fcm/send", method="POST", body=body,
                              headers={'Content-Type': 'application/json;',
                                       'Authorization': 'key=' + push_server_id})

    if resp['status'] != '200':
        error = '오류가 발생했습니다.'
    return error


def send_fire_base_push_multi_without_badge(registration_ids, title, message):
    push_server_id = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')
    error = None
    data = {
        'registration_ids': registration_ids,
        'notification': {
            'title': title,
            'body': message,
            'sound': 'default'
        }
    }
    body = json.dumps(data)
    h = httplib2.Http()

    resp, content = h.request("https://fcm.googleapis.com/fcm/send", method="POST", body=body,
                              headers={'Content-Type': 'application/json;',
                                       'Authorization': 'key=' + push_server_id})

    if resp['status'] != '200':
        error = '오류가 발생했습니다.'
    return error


def func_get_trainer_schedule_all(class_id, start_date, end_date):
    # 수업에 해당되는 회원의 숫자 불러오기
    query = "select count(B."+ScheduleTb._meta.get_field('schedule_id').column+") from "+ScheduleTb._meta.db_table +\
            " as B where B."+ScheduleTb._meta.get_field('lecture_schedule_id').column+" =`"+ScheduleTb._meta.db_table +\
            "`.`"+ScheduleTb._meta.get_field('schedule_id').column+"` " \
            " AND B."+ScheduleTb._meta.get_field('state_cd').column+" != \'PC\'" \
            " AND B."+ScheduleTb._meta.get_field('permission_state_cd').column+" = \'AP\'" \
            " AND B."+ScheduleTb._meta.get_field('use').column+"="+str(USE)

    query_wait = "select count(B."+ScheduleTb._meta.get_field('schedule_id').column+") from "+ScheduleTb._meta.db_table +\
                 " as B where B."+ScheduleTb._meta.get_field('lecture_schedule_id').column+" =`"+ScheduleTb._meta.db_table +\
                 "`.`"+ScheduleTb._meta.get_field('schedule_id').column+"` " \
                 " AND B."+ScheduleTb._meta.get_field('permission_state_cd').column+" = \'WP\'" \
                 " AND B."+ScheduleTb._meta.get_field('use').column+"="+str(USE)

    # 그룹 수업에 속한 회원들의 일정은 제외하고 불러온다.
    schedule_data = ScheduleTb.objects.select_related(
        'member_ticket_tb__member', 'reg_member', 'mod_member',
        'lecture_tb').filter(class_tb=class_id, start_dt__gte=start_date, start_dt__lt=end_date,
                             lecture_schedule_id__isnull=True,
                             use=USE).annotate(lecture_current_member_num=RawSQL(query, []),
                                               lecture_wait_member_num=RawSQL(query_wait, [])).order_by('start_dt',
                                                                                                        'reg_dt')

    ordered_schedule_dict = collections.OrderedDict()
    temp_schedule_date = None
    date_schedule_list = []
    for schedule_info in schedule_data:
        # 날짜별로 모아주기 위해서 날짜 분리
        schedule_start_date_split = str(schedule_info.start_dt).split(' ')
        schedule_end_date_split = str(schedule_info.end_dt).split(' ')
        schedule_start_time_split = schedule_start_date_split[1].split(':')
        schedule_end_time_split = schedule_end_date_split[1].split(':')

        # 날짜 셋팅
        schedule_start_date = schedule_start_date_split[0]
        schedule_start_time = schedule_start_time_split[0]+':'+schedule_start_time_split[1]
        schedule_end_time = schedule_end_time_split[0]+':'+schedule_end_time_split[1]
        if schedule_end_time == '00:00':
            schedule_end_time = '24:00'
        # 일정 구분 (0:OFF, 1:개인, 2:그룹)
        schedule_type = schedule_info.en_dis_type

        # 새로운 날짜로 넘어간 경우 array 비워주고 값 셋팅
        if temp_schedule_date != schedule_start_date:
            temp_schedule_date = schedule_start_date
            date_schedule_list = []

        # 개인 수업 일정인 경우 정보 추가, 개인 수업이 아닌 경우 빈값
        try:
            member_name = schedule_info.member_ticket_tb.member.name
        except AttributeError:
            member_name = ''

        # 수업 일정인 경우 정보 추가, 수업이 아닌 경우 빈값
        try:
            lecture_id = schedule_info.lecture_tb_id
            lecture_name = schedule_info.lecture_tb.name
            lecture_current_member_num = schedule_info.lecture_current_member_num
            lecture_wait_member_num = schedule_info.lecture_wait_member_num
            if schedule_info.lecture_tb.lecture_type_cd != LECTURE_TYPE_ONE_TO_ONE:
                schedule_type = GROUP_SCHEDULE
        except AttributeError:
            lecture_id = ''
            lecture_name = ''
            lecture_current_member_num = ''
            lecture_wait_member_num = ''
        mod_member_id = ''
        mod_member_name = ''
        if schedule_info.mod_member is not None and schedule_info.mod_member != '':
            mod_member_id = schedule_info.mod_member_id
            mod_member_name = schedule_info.mod_member.name
        # array 에 값을 추가후 dictionary 에 추가
        date_schedule_list.append({'schedule_id': str(schedule_info.schedule_id),
                                   'start_time': schedule_start_time,
                                   'end_time': schedule_end_time,
                                   'state_cd': schedule_info.state_cd,
                                   'permission_state_cd': schedule_info.permission_state_cd,
                                   'schedule_type': schedule_type,
                                   'note': schedule_info.note,
                                   'reg_member_id': str(schedule_info.reg_member_id),
                                   'reg_member_name': schedule_info.reg_member.name,
                                   'mod_member_id': str(mod_member_id),
                                   'mod_member_name': mod_member_name,
                                   'mod_dt': str(schedule_info.mod_dt),
                                   'reg_dt': str(schedule_info.reg_dt),
                                   'member_name': member_name,
                                   'daily_record_id': schedule_info.daily_record_tb_id,
                                   'lecture_id': str(lecture_id),
                                   'lecture_name': lecture_name,
                                   'lecture_ing_color_cd': schedule_info.ing_color_cd,
                                   'lecture_ing_font_color_cd': schedule_info.ing_font_color_cd,
                                   'lecture_end_color_cd': schedule_info.end_color_cd,
                                   'lecture_end_font_color_cd': schedule_info.end_font_color_cd,
                                   'lecture_max_member_num': schedule_info.max_mem_count,
                                   'lecture_current_member_num': lecture_current_member_num,
                                   'lecture_wait_member_num': lecture_wait_member_num})

        ordered_schedule_dict[schedule_start_date] = date_schedule_list

    return ordered_schedule_dict


def func_get_trainer_schedule_info(class_id, schedule_id):
    # 수업에 해당되는 회원의 숫자 불러오기
    query = "select count(B." + ScheduleTb._meta.get_field(
        'schedule_id').column + ") from " + ScheduleTb._meta.db_table + \
            " as B where B." + ScheduleTb._meta.get_field(
        'lecture_schedule_id').column + " =`" + ScheduleTb._meta.db_table + \
            "`.`" + ScheduleTb._meta.get_field('schedule_id').column + "` " \
                                                                       " AND B." + ScheduleTb._meta.get_field(
        'state_cd').column + " != \'PC\'" \
                             " AND B." + ScheduleTb._meta.get_field('use').column + "=" + str(USE)

    schedule_data = ScheduleTb.objects.select_related(
        'member_ticket_tb__member', 'reg_member', 'mod_member',
        'lecture_tb').filter(class_tb=class_id, schedule_id=schedule_id,
                             use=USE).annotate(lecture_current_member_num=RawSQL(query,
                                                                                 [])).order_by('start_dt', 'reg_dt')

    try:
        lecture_one_to_one = LectureTb.objects.filter(class_tb_id=class_id,
                                                      lecture_type_cd=LECTURE_TYPE_ONE_TO_ONE,
                                                      state_cd='IP', use=USE).earliest('reg_dt')
        # if len(lecture_one_to_one_data) > 0:
        #     lecture_one_to_one = lecture_one_to_one_data[0]
        # else:
        #     lecture_one_to_one = None
    except ObjectDoesNotExist:
        lecture_one_to_one = None

    date_schedule_list = []
    for schedule_info in schedule_data:

        # 날짜별로 모아주기 위해서 날짜 분리
        schedule_start_date_split = str(schedule_info.start_dt).split(' ')
        schedule_end_date_split = str(schedule_info.end_dt).split(' ')
        schedule_start_time_split = schedule_start_date_split[1].split(':')
        schedule_end_time_split = schedule_end_date_split[1].split(':')

        # 날짜 셋팅
        schedule_start_time = schedule_start_time_split[0] + ':' + schedule_start_time_split[1]
        schedule_end_time = schedule_end_time_split[0] + ':' + schedule_end_time_split[1]
        if schedule_end_time == '00:00':
            schedule_end_time = '24:00'
        # 일정 구분 (0:OFF, 1:개인, 2:그룹)
        schedule_type = schedule_info.en_dis_type

        # 개인 수업 일정인 경우 정보 추가, 개인 수업이 아닌 경우 빈값
        try:
            member_name = schedule_info.member_ticket_tb.member.name
            member_id = schedule_info.member_ticket_tb.member.member_id
            member_profile_url = schedule_info.member_ticket_tb.member.profile_url
            if member_profile_url is None or member_profile_url == '':
                member_profile_url = '/static/common/icon/icon_account.png'
        except AttributeError:
            member_name = ''
            member_id = ''
            member_profile_url = '/static/common/icon/icon_account.png'

        # 수업 일정인 경우 정보 추가, 수업이 아닌 경우 빈값
        try:
            lecture_id = schedule_info.lecture_tb.lecture_id
            lecture_name = schedule_info.lecture_tb.name
            lecture_current_member_num = schedule_info.lecture_current_member_num
            if schedule_info.lecture_tb.lecture_type_cd != LECTURE_TYPE_ONE_TO_ONE:
                schedule_type = GROUP_SCHEDULE
        except AttributeError:
            lecture_id = ''
            lecture_name = ''
            lecture_current_member_num = ''
            if lecture_one_to_one is not None:
                if str(schedule_type) == str(OFF_SCHEDULE):
                    lecture_id = ''
                    lecture_name = 'OFF'
                    lecture_current_member_num = 0
                else:
                    lecture_id = lecture_one_to_one.lecture_id
                    lecture_name = lecture_one_to_one.name
                    lecture_current_member_num = 1

        lecture_schedule_list = []
        lecture_member_schedule_data = ScheduleTb.objects.select_related(
            'member_ticket_tb__member', 'reg_member').filter(class_tb_id=class_id, lecture_schedule_id=schedule_id,
                                                             use=USE).order_by('start_dt')

        for lecture_member_schedule_info in lecture_member_schedule_data:
            lecture_member_profile_url = lecture_member_schedule_info.member_ticket_tb.member.profile_url
            if lecture_member_profile_url is None or lecture_member_profile_url == '':
                lecture_member_profile_url = '/static/common/icon/icon_account.png'

            mod_member_id = ''
            mod_member_name = ''
            if lecture_member_schedule_info.mod_member is not None and lecture_member_schedule_info.mod_member != '':
                mod_member_id = lecture_member_schedule_info.mod_member_id
                mod_member_name = lecture_member_schedule_info.mod_member.name
            lecture_schedule_info = {'schedule_id': str(lecture_member_schedule_info.schedule_id),
                                     'member_id': str(lecture_member_schedule_info.member_ticket_tb.member.member_id),
                                     'member_name': lecture_member_schedule_info.member_ticket_tb.member.name,
                                     'member_profile_url': lecture_member_profile_url,
                                     'member_ticket_id':
                                         str(lecture_member_schedule_info.member_ticket_tb.member_ticket_id),
                                     'schedule_type': GROUP_SCHEDULE,
                                     'start_dt': str(lecture_member_schedule_info.start_dt),
                                     'end_dt': str(lecture_member_schedule_info.end_dt),
                                     'state_cd': lecture_member_schedule_info.state_cd,
                                     'permission_state_cd': lecture_member_schedule_info.permission_state_cd,
                                     'note': lecture_member_schedule_info.note,
                                     'reg_member_id': str(lecture_member_schedule_info.reg_member_id),
                                     'reg_member_name': lecture_member_schedule_info.reg_member.name,
                                     'mod_member_id': str(mod_member_id),
                                     'mod_member_name': mod_member_name,
                                     'mod_dt': str(lecture_member_schedule_info.mod_dt),
                                     'reg_dt': str(lecture_member_schedule_info.reg_dt),
                                     'daily_record_id': lecture_member_schedule_info.daily_record_tb_id
                                     }
            lecture_schedule_list.append(lecture_schedule_info)

        mod_member_id = ''
        mod_member_name = ''
        if schedule_info.mod_member is not None and schedule_info.mod_member != '':
            mod_member_id = schedule_info.mod_member_id
            mod_member_name = schedule_info.mod_member.name
        # array 에 값을 추가후 dictionary 에 추가
        date_schedule_list.append({'schedule_id': str(schedule_info.schedule_id),
                                   'start_time': schedule_start_time,
                                   'end_time': schedule_end_time,
                                   'state_cd': schedule_info.state_cd,
                                   'permission_state_cd': schedule_info.permission_state_cd,
                                   'schedule_type': schedule_type,
                                   'note': schedule_info.note,
                                   'reg_member_id': str(schedule_info.reg_member_id),
                                   'reg_member_name': schedule_info.reg_member.name,
                                   'mod_member_id': str(mod_member_id),
                                   'mod_member_name': mod_member_name,
                                   'mod_dt': str(schedule_info.mod_dt),
                                   'reg_dt': str(schedule_info.reg_dt),
                                   'member_name': member_name,
                                   'member_id': member_id,
                                   'member_profile_url': member_profile_url,
                                   'daily_record_id': schedule_info.daily_record_tb_id,
                                   'lecture_id': str(lecture_id),
                                   'lecture_name': lecture_name,
                                   'lecture_ing_color_cd': schedule_info.ing_color_cd,
                                   'lecture_ing_font_color_cd': schedule_info.ing_font_color_cd,
                                   'lecture_end_color_cd': schedule_info.end_color_cd,
                                   'lecture_end_font_color_cd': schedule_info.end_font_color_cd,
                                   'lecture_max_member_num': schedule_info.max_mem_count,
                                   'lecture_current_member_num': lecture_current_member_num,
                                   'lecture_schedule_data': lecture_schedule_list})
    return date_schedule_list


def func_get_member_schedule_all_by_member_ticket(class_id, member_id, page):
    ordered_schedule_dict = collections.OrderedDict()
    # 회원의 일정중 강사가 볼수 있는 수강정보의 일정을 불러오기 위한 query
    query_auth = "select " + ClassMemberTicketTb._meta.get_field('auth_cd').column + \
                 " from " + ClassMemberTicketTb._meta.db_table + \
                 " as B where B." + ClassMemberTicketTb._meta.get_field('member_ticket_tb').column + " = " \
                 "`" + ScheduleTb._meta.db_table + "`.`" + \
                 ScheduleTb._meta.get_field('member_ticket_tb').column + \
                 "` and B.CLASS_TB_ID = " + str(class_id) + \
                 " and B." + ClassMemberTicketTb._meta.get_field('use').column + "=" + str(USE)

    member_schedule_data = ScheduleTb.objects.select_related(
        'member_ticket_tb__member', 'reg_member', 'mod_member','member_ticket_tb__ticket_tb',
        'lecture_tb').filter(
        class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE, use=USE, member_ticket_tb__member_id=member_id,
        member_ticket_tb__use=USE).annotate(auth_cd=RawSQL(query_auth,
                                                           [])).filter(auth_cd=AUTH_TYPE_VIEW).order_by(
        '-member_ticket_tb__start_date', '-member_ticket_tb__end_date', '-member_ticket_tb__reg_dt', 'start_dt')
    # paginator = Paginator(member_schedule_data, MEMBER_SCHEDULE_PAGINATION_COUNTER)
    # try:
    #     member_schedule_data = paginator.page(page)
    # except EmptyPage:
    #     member_schedule_data = []
    # schedule_idx = paginator.count
    schedule_list = []
    temp_member_ticket_id = None
    for member_schedule_info in member_schedule_data:
        member_ticket_tb = member_schedule_info.member_ticket_tb
        member_ticket_id = str(member_ticket_tb.member_ticket_id)
        lecture_info = member_schedule_info.lecture_tb
        schedule_type = member_schedule_info.en_dis_type

        # 수강권에 따른 일정 정보 전달을 위해 초기화
        if temp_member_ticket_id != member_ticket_id:
            temp_member_ticket_id = member_ticket_id
            schedule_list = []

        # 그룹 수업인 경우 그룹 정보 할당
        try:
            lecture_id = lecture_info.lecture_id
            lecture_name = lecture_info.name
            lecture_max_member_num = lecture_info.member_num
            if lecture_info.lecture_type_cd != LECTURE_TYPE_ONE_TO_ONE:
                schedule_type = GROUP_SCHEDULE
        except AttributeError:
            lecture_id = ''
            lecture_name = '개인수업'
            lecture_max_member_num = '1'

        end_dt_time = str(member_schedule_info.end_dt).split(' ')[1]
        if end_dt_time == '00:00:00':
            end_dt_time = '24:00'

        end_dt = str(member_schedule_info.start_dt).split(' ')[0] + ' ' + end_dt_time

        mod_member_id = ''
        mod_member_name = ''
        if member_schedule_info.mod_member is not None and member_schedule_info.mod_member != '':
            mod_member_id = member_schedule_info.mod_member_id
            mod_member_name = member_schedule_info.mod_member.name
        # 일정 정보를 추가하고 수강권에 할당
        schedule_info = {'schedule_id': str(member_schedule_info.schedule_id),
                         'lecture_id': str(lecture_id),
                         'lecture_name': lecture_name,
                         'lecture_max_member_num': lecture_max_member_num,
                         'schedule_type': schedule_type,
                         'start_dt': str(member_schedule_info.start_dt),
                         'end_dt': str(end_dt),
                         'state_cd': member_schedule_info.state_cd,
                         'permission_state_cd': member_schedule_info.permission_state_cd,
                         'note': member_schedule_info.note,
                         'reg_member_id': str(member_schedule_info.reg_member_id),
                         'reg_member_name': member_schedule_info.reg_member.name,
                         'mod_member_id': str(mod_member_id),
                         'mod_member_name': mod_member_name,
                         'mod_dt': str(member_schedule_info.mod_dt),
                         'reg_dt': str(member_schedule_info.reg_dt),
                         'daily_record_id': member_schedule_info.daily_record_tb_id
                         }
        schedule_list.append(schedule_info)
        ordered_schedule_dict[member_ticket_id] = {'schedule_data': schedule_list,
                                                   'member_ticket_id': str(member_ticket_tb.member_ticket_id),
                                                   'member_ticket_name': member_ticket_tb.ticket_tb.name,
                                                   'member_ticket_state_cd': member_ticket_tb.state_cd,
                                                   'member_ticket_reg_count': member_ticket_tb.member_ticket_reg_count,
                                                   'member_ticket_rem_count': member_ticket_tb.member_ticket_rem_count,
                                                   'member_ticket_avail_count': member_ticket_tb.member_ticket_avail_count,
                                                   'member_ticket_start_date': str(member_ticket_tb.start_date),
                                                   'member_ticket_end_date': str(member_ticket_tb.end_date),
                                                   'member_ticket_price': member_ticket_tb.price,
                                                   'member_ticket_refund_date': str(member_ticket_tb.refund_date),
                                                   'member_ticket_refund_price': member_ticket_tb.refund_price,
                                                   'member_ticket_note': str(member_ticket_tb.note),
                                                   'member_ticket_reg_dt': str(member_ticket_tb.reg_dt)
                                                   }
        # schedule_idx -= 1

    return ordered_schedule_dict


def func_get_member_schedule_all_by_schedule_dt(class_id, member_id, page):
    # ordered_schedule_dict = collections.OrderedDict()
    # 회원의 일정중 강사가 볼수 있는 수강정보의 일정을 불러오기 위한 query
    query_auth = "select " + ClassMemberTicketTb._meta.get_field('auth_cd').column + \
                 " from " + ClassMemberTicketTb._meta.db_table + \
                 " as B where B." + ClassMemberTicketTb._meta.get_field('member_ticket_tb').column + " = " \
                 "`" + ScheduleTb._meta.db_table + "`.`" + \
                 ScheduleTb._meta.get_field('member_ticket_tb').column + \
                 "` and B.CLASS_TB_ID = " + str(class_id) + \
                 " and B." + ClassMemberTicketTb._meta.get_field('use').column + "=" + str(USE)

    member_schedule_data = ScheduleTb.objects.select_related(
        'member_ticket_tb__member', 'reg_member', 'member_ticket_tb__ticket_tb',
        'lecture_tb').filter(
        class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE, use=USE, member_ticket_tb__member_id=member_id,
        member_ticket_tb__use=USE).annotate(auth_cd=RawSQL(query_auth,
                                                           [])).filter(auth_cd=AUTH_TYPE_VIEW).order_by('start_dt',
                                                                                                        'reg_dt')
    # paginator = Paginator(member_schedule_data, MEMBER_SCHEDULE_PAGINATION_COUNTER)
    # try:
    #     member_schedule_data = paginator.page(page)
    # except EmptyPage:
    #     member_schedule_data = []
    # schedule_idx = paginator.count
    schedule_list = []
    temp_member_ticket_id = None
    for member_schedule_info in member_schedule_data:
        member_ticket_tb = member_schedule_info.member_ticket_tb
        member_ticket_id = str(member_ticket_tb.member_ticket_id)
        lecture_info = member_schedule_info.lecture_tb
        schedule_type = member_schedule_info.en_dis_type

        # 수강권에 따른 일정 정보 전달을 위해 초기화
        if temp_member_ticket_id != member_ticket_id:
            temp_member_ticket_id = member_ticket_id

        # 그룹 수업인 경우 그룹 정보 할당
        try:
            lecture_id = lecture_info.lecture_id
            lecture_name = lecture_info.name
            lecture_max_member_num = lecture_info.member_num
            if lecture_info.lecture_type_cd != LECTURE_TYPE_ONE_TO_ONE:
                schedule_type = GROUP_SCHEDULE
        except AttributeError:
            lecture_id = ''
            lecture_name = '개인수업'
            lecture_max_member_num = '1'

        end_dt_time = str(member_schedule_info.end_dt).split(' ')[1]
        if end_dt_time == '00:00:00':
            end_dt_time = '24:00'

        mod_member_id = ''
        mod_member_name = ''
        if member_schedule_info.mod_member is not None and member_schedule_info.mod_member != '':
            mod_member_id = member_schedule_info.mod_member_id
            mod_member_name = member_schedule_info.mod_member.name
        end_dt = str(member_schedule_info.start_dt).split(' ')[0] + ' ' + end_dt_time
        # 일정 정보를 추가하고 수강권에 할당
        schedule_info = {
                         # 'schedule_idx': str(schedule_idx),
                         'schedule_id': str(member_schedule_info.schedule_id),
                         'lecture_id': str(lecture_id),
                         'lecture_name': lecture_name,
                         'lecture_max_member_num': lecture_max_member_num,
                         'schedule_type': schedule_type,
                         'start_dt': str(member_schedule_info.start_dt),
                         'end_dt': str(end_dt),
                         'state_cd': member_schedule_info.state_cd,
                         'permission_state_cd': member_schedule_info.permission_state_cd,
                         'note': member_schedule_info.note,
                         'reg_member_id': str(member_schedule_info.reg_member_id),
                         'reg_member_name': member_schedule_info.reg_member.name,
                         'mod_member_id': str(mod_member_id),
                         'mod_member_name': mod_member_name,
                         'mod_dt': str(member_schedule_info.mod_dt),
                         'reg_dt': str(member_schedule_info.reg_dt),
                         'daily_record_id': member_schedule_info.daily_record_tb_id,
                         'member_ticket_id': str(member_ticket_tb.member_ticket_id),
                         'member_ticket_name': member_ticket_tb.ticket_tb.name,
                         'member_ticket_state_cd': member_ticket_tb.state_cd,
                         'member_ticket_reg_count': member_ticket_tb.member_ticket_reg_count,
                         'member_ticket_rem_count': member_ticket_tb.member_ticket_rem_count,
                         'member_ticket_avail_count': member_ticket_tb.member_ticket_avail_count,
                         'member_ticket_start_date': str(member_ticket_tb.start_date),
                         'member_ticket_end_date': str(member_ticket_tb.end_date),
                         'member_ticket_price': member_ticket_tb.price,
                         'member_ticket_refund_date': str(member_ticket_tb.refund_date),
                         'member_ticket_refund_price': member_ticket_tb.refund_price,
                         'member_ticket_note': str(member_ticket_tb.note)
                         }
        schedule_list.append(schedule_info)
        # schedule_idx -= 1
        # ordered_schedule_dict[member_ticket_id] = schedule_list
    return schedule_list


def func_get_permission_wait_schedule_all(class_id, page):
    # ordered_schedule_dict = collections.OrderedDict()
    # 회원의 일정중 강사가 볼수 있는 수강정보의 일정을 불러오기 위한 query
    query_auth = "select " + ClassMemberTicketTb._meta.get_field('auth_cd').column + \
                 " from " + ClassMemberTicketTb._meta.db_table + \
                 " as B where B." + ClassMemberTicketTb._meta.get_field('member_ticket_tb').column + " = " \
                 "`" + ScheduleTb._meta.db_table + "`.`" + \
                 ScheduleTb._meta.get_field('member_ticket_tb').column + \
                 "` and B.CLASS_TB_ID = " + str(class_id) + \
                 " and B." + ClassMemberTicketTb._meta.get_field('use').column + "=" + str(USE)

    member_schedule_data = ScheduleTb.objects.select_related(
        'member_ticket_tb__member', 'reg_member', 'member_ticket_tb__ticket_tb',
        'lecture_tb').filter(
        class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE, permission_state_cd=PERMISSION_STATE_CD_WAIT,
        use=USE).annotate(auth_cd=RawSQL(query_auth, [])).filter(auth_cd=AUTH_TYPE_VIEW).order_by('start_dt',
                                                                                                  'reg_dt')
    # paginator = Paginator(member_schedule_data, MEMBER_SCHEDULE_PAGINATION_COUNTER)
    # try:
    #     member_schedule_data = paginator.page(page)
    # except EmptyPage:
    #     member_schedule_data = []
    # schedule_idx = paginator.count

    # try:
    #     one_to_one_lecture = LectureTb.objects.get(class_tb_id=class_id, lecture_type_cd=LECTURE_TYPE_ONE_TO_ONE,
    #                                                use=USE)
    #     lecture_one_to_one_color_cd = one_to_one_lecture.ing_color_cd
    # except ObjectDoesNotExist:
    #     lecture_one_to_one_color_cd = ''

    try:
        one_to_one_lecture = LectureTb.objects.filter(class_tb_id=class_id, lecture_type_cd=LECTURE_TYPE_ONE_TO_ONE,
                                                      use=USE).earliest('reg_dt')
        lecture_one_to_one_color_cd = one_to_one_lecture.ing_color_cd
    except ObjectDoesNotExist:
        lecture_one_to_one_color_cd = ''

    schedule_list = []
    for member_schedule_info in member_schedule_data:
        lecture_info = member_schedule_info.lecture_tb
        schedule_type = member_schedule_info.en_dis_type

        # 그룹 수업인 경우 그룹 정보 할당
        try:
            lecture_id = lecture_info.lecture_id
            lecture_name = lecture_info.name
            lecture_max_member_num = lecture_info.member_num
            lecture_ing_color_cd = lecture_info.ing_color_cd
            if lecture_info.lecture_type_cd != LECTURE_TYPE_ONE_TO_ONE:
                schedule_type = GROUP_SCHEDULE
        except AttributeError:
            lecture_id = ''
            lecture_name = '개인수업'
            lecture_max_member_num = '1'
            lecture_ing_color_cd = lecture_one_to_one_color_cd

        member_name = ''
        if member_schedule_info.member_ticket_tb is not None and member_schedule_info.member_ticket_tb != '':
            member_name = member_schedule_info.member_ticket_tb.member.name
        member_schedule_info_start_dt_split = str(member_schedule_info.start_dt).split(' ')
        schedule_date = member_schedule_info_start_dt_split[0]
        schedule_time = member_schedule_info_start_dt_split[1]
        end_dt_time = str(member_schedule_info.end_dt).split(' ')[1]
        if end_dt_time == '00:00:00':
            end_dt_time = '24:00'
        schedule_time += '~'+end_dt_time

        mod_member_id = ''
        mod_member_name = ''
        if member_schedule_info.mod_member is not None and member_schedule_info.mod_member != '':
            mod_member_id = member_schedule_info.mod_member_id
            mod_member_name = member_schedule_info.mod_member.name
        # 일정 정보를 추가하고 수강권에 할당
        schedule_info = {
                         # 'schedule_idx': str(schedule_idx),
                         'schedule_id': str(member_schedule_info.schedule_id),
                         'lecture_id': str(lecture_id),
                         'lecture_name': lecture_name,
                         'lecture_max_member_num': lecture_max_member_num,
                         'lecture_ing_color_cd': lecture_ing_color_cd,
                         'member_name': member_name,
                         'schedule_type': schedule_type,
                         'schedule_date': schedule_date,
                         'schedule_time': schedule_time,
                         'state_cd': member_schedule_info.state_cd,
                         'permission_state_cd': member_schedule_info.permission_state_cd,
                         'note': member_schedule_info.note,
                         'reg_member_id': str(member_schedule_info.reg_member_id),
                         'reg_member_name': member_schedule_info.reg_member.name,
                         'mod_member_id': str(mod_member_id),
                         'mod_member_name': mod_member_name,
                         'mod_dt': str(member_schedule_info.mod_dt),
                         'reg_dt': str(member_schedule_info.reg_dt),
                         }
        schedule_list.append(schedule_info)
        # schedule_idx -= 1
        # ordered_schedule_dict[member_ticket_id] = schedule_list
    return schedule_list


def func_get_member_schedule_all_by_monthly(class_id, member_id, page):
    monthly_schedule_data_dict = collections.OrderedDict()
    # 회원의 일정중 강사가 볼수 있는 수강정보의 일정을 불러오기 위한 query
    query_auth = "select " + ClassMemberTicketTb._meta.get_field('auth_cd').column + \
                 " from " + ClassMemberTicketTb._meta.db_table + \
                 " as B where B." + ClassMemberTicketTb._meta.get_field('member_ticket_tb').column + " = " \
                 "`" + ScheduleTb._meta.db_table + "`.`" + \
                 ScheduleTb._meta.get_field('member_ticket_tb').column + \
                 "` and B.CLASS_TB_ID = " + str(class_id) + \
                 " and B." + ClassMemberTicketTb._meta.get_field('use').column + "=" + str(USE)

    member_schedule_data = ScheduleTb.objects.select_related(
        'member_ticket_tb__member', 'reg_member', 'member_ticket_tb__ticket_tb',
        'lecture_tb').filter(
        class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE, use=USE, member_ticket_tb__member_id=member_id,
        member_ticket_tb__use=USE).annotate(auth_cd=RawSQL(query_auth,
                                                           [])).filter(auth_cd=AUTH_TYPE_VIEW).order_by('start_dt',
                                                                                                        'reg_dt')
    # paginator = Paginator(member_schedule_data, MEMBER_SCHEDULE_PAGINATION_COUNTER)
    # try:
    #     member_schedule_data = paginator.page(page)
    # except EmptyPage:
    #     member_schedule_data = []
    # schedule_idx = paginator.count
    # schedule_list = []
    temp_member_ticket_id = None
    for member_schedule_info in member_schedule_data:
        member_ticket_tb = member_schedule_info.member_ticket_tb
        member_ticket_id = str(member_ticket_tb.member_ticket_id)
        lecture_info = member_schedule_info.lecture_tb
        schedule_type = member_schedule_info.en_dis_type

        # 수강권에 따른 일정 정보 전달을 위해 초기화
        if temp_member_ticket_id != member_ticket_id:
            temp_member_ticket_id = member_ticket_id

        # 그룹 수업인 경우 그룹 정보 할당
        try:
            lecture_id = lecture_info.lecture_id
            lecture_name = lecture_info.name
            lecture_max_member_num = lecture_info.member_num
            if lecture_info.lecture_type_cd != LECTURE_TYPE_ONE_TO_ONE:
                schedule_type = GROUP_SCHEDULE
        except AttributeError:
            lecture_id = ''
            lecture_name = '개인수업'
            lecture_max_member_num = '1'

        end_dt_time = str(member_schedule_info.end_dt).split(' ')[1]
        if end_dt_time == '00:00:00':
            end_dt_time = '24:00'

        end_dt = str(member_schedule_info.start_dt).split(' ')[0] + ' ' + end_dt_time
        member_schedule_start_dt_split = str(member_schedule_info.start_dt).split('-')
        month_num = member_schedule_start_dt_split[0] + '-' + member_schedule_start_dt_split[1]

        mod_member_id = ''
        mod_member_name = ''
        if member_schedule_info.mod_member is not None and member_schedule_info.mod_member != '':
            mod_member_id = member_schedule_info.mod_member_id
            mod_member_name = member_schedule_info.mod_member.name
        # 일정 정보를 추가하고 수강권에 할당
        schedule_info = {
                         # 'schedule_idx': str(schedule_idx),
                         'schedule_id': str(member_schedule_info.schedule_id),
                         'lecture_id': str(lecture_id),
                         'lecture_name': lecture_name,
                         'lecture_max_member_num': lecture_max_member_num,
                         'schedule_type': schedule_type,
                         'start_dt': str(member_schedule_info.start_dt),
                         'end_dt': str(end_dt),
                         'state_cd': member_schedule_info.state_cd,
                         'permission_state_cd': member_schedule_info.permission_state_cd,
                         'note': member_schedule_info.note,
                         'reg_member_id': str(member_schedule_info.reg_member_id),
                         'reg_member_name': member_schedule_info.reg_member.name,
                         'mod_member_id': str(mod_member_id),
                         'mod_member_name': mod_member_name,
                         'mod_dt': str(member_schedule_info.mod_dt),
                         'reg_dt': str(member_schedule_info.reg_dt),
                         'daily_record_id': member_schedule_info.daily_record_tb_id,
                         'member_ticket_id': str(member_ticket_tb.member_ticket_id),
                         'member_ticket_name': member_ticket_tb.ticket_tb.name,
                         'member_ticket_state_cd': member_ticket_tb.state_cd,
                         'member_ticket_reg_count': member_ticket_tb.member_ticket_reg_count,
                         'member_ticket_rem_count': member_ticket_tb.member_ticket_rem_count,
                         'member_ticket_avail_count': member_ticket_tb.member_ticket_avail_count,
                         'member_ticket_start_date': str(member_ticket_tb.start_date),
                         'member_ticket_end_date': str(member_ticket_tb.end_date),
                         'member_ticket_price': member_ticket_tb.price,
                         'member_ticket_refund_date': str(member_ticket_tb.refund_date),
                         'member_ticket_refund_price': member_ticket_tb.refund_price,
                         'member_ticket_note': str(member_ticket_tb.note),
                         'month_num': month_num
                         }
        # schedule_idx -= 1
        try:
            monthly_schedule_data_dict[month_num]
        except KeyError:
            monthly_schedule_data_dict[month_num] = {'schedule_data': [],
                                                     'month_num': month_num}
        monthly_schedule_data_dict[month_num]['schedule_data'].append(schedule_info)

    return monthly_schedule_data_dict


def func_get_lecture_schedule_all(class_id, lecture_id):
    lecture_schedule_list = []

    # 수업의 회원수 체크를 위한 query
    query = "select count(B."+ScheduleTb._meta.get_field('schedule_id').column+") from " + \
            ScheduleTb._meta.db_table+" as B where B." + \
            ScheduleTb._meta.get_field('lecture_schedule_id').column + \
            " = `"+ScheduleTb._meta.db_table+"`.`"+ScheduleTb._meta.get_field('schedule_id').column+"` " \
            "AND B."+ScheduleTb._meta.get_field('state_cd').column+" != \'PC\' AND B." + \
            ScheduleTb._meta.get_field('use').column+"="+str(USE)

    schedule_data = ScheduleTb.objects.select_related(
        'member_ticket_tb__member', 'reg_member',
        'lecture_tb').filter(class_tb=class_id, lecture_tb_id=lecture_id, lecture_schedule_id__isnull=True,
                             use=USE).annotate(lecture_current_member_num=RawSQL(query,
                                                                                 [])).order_by('start_dt',
                                                                                               'reg_dt')

    for schedule_info in schedule_data:
        schedule_type = schedule_info.en_dis_type
        # 수업 정보 셋팅
        try:
            lecture_id = schedule_info.lecture_tb.lecture_id
            lecture_name = schedule_info.lecture_tb.name
            lecture_max_member_num = schedule_info.lecture_tb.member_num
            lecture_current_member_num = schedule_info.lecture_current_member_num
            if schedule_info.lecture_tb.lecture_type_cd != LECTURE_TYPE_ONE_TO_ONE:
                schedule_type = GROUP_SCHEDULE
        except AttributeError:
            lecture_id = ''
            lecture_name = ''
            lecture_max_member_num = ''
            lecture_current_member_num = ''
        end_dt_time = str(schedule_info.end_dt).split(' ')[1]
        if end_dt_time == '00:00:00':
            end_dt_time = '24:00'
        end_dt = str(schedule_info.start_dt).split(' ')[0] + ' ' + end_dt_time

        mod_member_id = ''
        mod_member_name = ''
        if schedule_info.mod_member is not None and schedule_info.mod_member != '':
            mod_member_id = schedule_info.mod_member_id
            mod_member_name = schedule_info.mod_member.name

        lecture_schedule_list.append({'schedule_id': str(schedule_info.schedule_id),
                                      'start_dt': str(schedule_info.start_dt),
                                      'end_dt': str(end_dt),
                                      'state_cd': schedule_info.state_cd,
                                      'permission_state_cd': schedule_info.permission_state_cd,
                                      'schedule_type': schedule_type,
                                      'note': schedule_info.note,
                                      'reg_member_id': str(schedule_info.reg_member_id),
                                      'reg_member_name': schedule_info.reg_member.name,
                                      'mod_member_id': str(mod_member_id),
                                      'mod_member_name': mod_member_name,
                                      'mod_dt': str(schedule_info.mod_dt),
                                      'reg_dt': str(schedule_info.reg_dt),
                                      'daily_record_id': schedule_info.daily_record_tb_id,
                                      'lecture_id': str(lecture_id),
                                      'lecture_name': lecture_name,
                                      'lecture_max_member_num': lecture_max_member_num,
                                      'lecture_current_member_num': lecture_current_member_num})

    return lecture_schedule_list


def func_get_trainer_attend_schedule(context, class_id, start_date, end_date, now):
    # func_get_trainer_attend_on_schedule(context, class_id, start_date, end_date, now)
    # func_get_trainer_attend_lecture_schedule(context, class_id, start_date, end_date, now, '')

    query = "select count(B.ID) from SCHEDULE_TB as B where B.GROUP_SCHEDULE_ID = `SCHEDULE_TB`.`ID` " \
            "AND B.STATE_CD = \'AP\' AND B.USE=1"
    finish_member_query = "select count(B.ID) from SCHEDULE_TB as B where B.GROUP_SCHEDULE_ID = `SCHEDULE_TB`.`ID` " \
                          "AND B.STATE_CD = \'PE\' AND B.USE=1"

    context['attend_schedule_data'] = ScheduleTb.objects.select_related(
        'member_ticket_tb__member', 'lecture_tb').filter(Q(start_dt__lte=now, end_dt__gte=now)
                                                         | Q(start_dt__gte=now, start_dt__lte=start_date)
                                                         | Q(end_dt__gte=end_date, end_dt__lte=now),
                                                         class_tb=class_id,
                                                         en_dis_type=ON_SCHEDULE_TYPE,
                                                         state_cd=STATE_CD_NOT_PROGRESS,
                                                         use=USE).order_by('start_dt', 'reg_dt').annotate(
        lecture_current_member_num=RawSQL(query, []),
        lecture_current_finish_member_num=RawSQL(finish_member_query, []))

    return context


def func_get_repeat_schedule_date_list(repeat_type, week_type, repeat_schedule_start_date, repeat_schedule_end_date):
    week_info = ['SUN', 'MON', 'TUE', 'WED', 'THS', 'FRI', 'SAT']
    repeat_week_type_data = []
    repeat_schedule_date_list = []

    temp_data = week_type.split('/')
    for week_type_info in temp_data:
        for idx, week_info_detail in enumerate(week_info):
            if week_info_detail == week_type_info:
                repeat_week_type_data.append(idx)
                break
    repeat_week_type_data.sort()
    # 반복 일정 처음 날짜 설정
    check_date = repeat_schedule_start_date
    idx = 0
    # 반복 일정 종료 날짜 보다 크면 종료
    while check_date <= repeat_schedule_end_date:

        # 반복 일정 등록해야하는 첫번째 요일 검색 -> 자신보다 뒤에있는 요일중에 가장 가까운것
        week_idx = -1
        for week_type_info in repeat_week_type_data:
            if week_type_info >= int(check_date.strftime('%w')):
                week_idx = week_type_info
                break
        # 가장 가까운 요일이 뒤에 없다면 다음주중에 가장 가까운 요일 선택 +7 or +14 더하기
        if week_idx == -1:
            week_idx = repeat_week_type_data[0]
            if repeat_type == REPEAT_TYPE_2WEAK:
                week_idx += 14
            else:
                week_idx += 7

        # 가야하는 요일에서 현재 요일 빼기 -> 더해야 하는 날짜 계산
        week_idx -= int(check_date.strftime('%w'))

        # 요일 계산된 값을 더하기
        check_date = check_date + datetime.timedelta(days=week_idx)

        # 날짜 계산을 했는데 일정 넘어가면 멈추기
        if check_date > repeat_schedule_end_date:
            break
        # 반복 일정 추가
        repeat_schedule_date_list.append(check_date)
        # 날짜값 입력후 날짜 증가
        check_date = check_date + datetime.timedelta(days=1)

        # 날짜값 입력후 날짜 증가했는데 일요일이고 격주인경우 일주일 더하기
        if int(check_date.strftime('%w')) == 0:
            if repeat_type == REPEAT_TYPE_2WEAK:
                check_date = check_date + datetime.timedelta(days=7)
        idx += 1
        if idx > 365:
            break
    return repeat_schedule_date_list


def func_upload_daily_record_content_image_logic(file, file_name, user_id, class_id, schedule_id):

    # project_id = request.POST.get('project_id', '')
    # image = request.POST.get('upload_file', '')
    # context = {'error': None}
    bucket_name = getattr(settings, "PTERS_AWS_S3_BUCKET_NAME", '')

    s3 = boto3.resource('s3', aws_access_key_id=getattr(settings, "PTERS_AWS_ACCESS_KEY_ID", ''),
                        aws_secret_access_key=getattr(settings, "PTERS_AWS_SECRET_ACCESS_KEY", ''))
    bucket = s3.Bucket(bucket_name)
    exists = True
    img_url = None

    try:
        s3.meta.client.head_bucket(Bucket=getattr(settings, "PTERS_AWS_S3_BUCKET_NAME", ''))
    except ClientError as e:
        # If a client error is thrown, then check that it was a 404 error.
        # If it was a 404 error, then the bucket does not exist.
        error_code = int(e.response['Error']['Code'])
        if error_code == 404:
            exists = False

    if exists is True:
        content = file.read()
        s3_img_url = 'daily-record/'+str(user_id)+'_'+str(class_id)+'/'+str(schedule_id)+'/'+file_name
        bucket.put_object(Key=s3_img_url, Body=content, ContentType=file.content_type, ACL='public-read')
        img_url = 'https://s3.ap-northeast-2.amazonaws.com/'+bucket_name+'/'+s3_img_url

    return img_url


def func_delete_daily_record_content_image_logic(file_name):

    # project_id = request.POST.get('project_id', '')
    # image = request.POST.get('upload_file', '')
    # context = {'error': None}
    # print(str(file_name))
    bucket_name = getattr(settings, "PTERS_AWS_S3_BUCKET_NAME", '')
    s3 = boto3.resource('s3', aws_access_key_id=getattr(settings, "PTERS_AWS_ACCESS_KEY_ID", ''),
                        aws_secret_access_key=getattr(settings, "PTERS_AWS_SECRET_ACCESS_KEY", ''))
    bucket = s3.Bucket(bucket_name)
    exists = True
    error_code = None

    try:
        s3.meta.client.head_bucket(Bucket=getattr(settings, "PTERS_AWS_S3_BUCKET_NAME", ''))
    except ClientError as e:
        # If a client error is thrown, then check that it was a 404 error.
        # If it was a 404 error, then the bucket does not exist.
        error_code = int(e.response['Error']['Code'])
        if error_code == 404:
            exists = False

    if exists is True:
        # image_format, image_str = content.split(';base64,')
        # ext = image_format.split('/')[-1]
        # data = ContentFile(base64.b64decode(image_str), name='temp.' + ext)
        file_name_split = file_name.split('https://s3.ap-northeast-2.amazonaws.com/pters-image-master/')
        if len(file_name_split) >= 2:
            s3_img_url = file_name.split('https://s3.ap-northeast-2.amazonaws.com/pters-image-master/')[1]
            bucket.objects.filter(Prefix=s3_img_url).delete()

            # if s3_img_url in '.jpg' or s3_img_url in '.png':
            #     objects_to_delete = [{'Key': s3_img_url}]
            #     try:
            #         bucket.delete_objects(
            #             Delete={
            #                 'Objects': objects_to_delete
            #             })
            #     except ClientError:
            #         error_code = '이미지 삭제중 오류가 발생했습니다.'
            # else:
            #     for key in bucket.list(prefix=s3_img_url):
            #         objects_to_delete = [{'Key': key}]
            #         try:
            #             bucket.delete_objects(
            #                 Delete={
            #                     'Objects': objects_to_delete
            #                 })
            #         except ClientError:
            #             error_code = '이미지 삭제중 오류가 발생했습니다.'
        else:
            error_code = None
    return error_code


def func_get_program_alarm_data(class_id):
    query_user_group = "SELECT group_id FROM auth_user_groups WHERE user_id=`SETTING_TB`.`MEMBER_ID`"
    setting_data = SettingTb.objects.select_related(
        'member__user').filter(class_tb_id=class_id,
                               setting_type_cd='LT_PUSH_SCHEDULE_ALARM_MINUTE').exclude(
        setting_info='-1').annotate(user_group=RawSQL(query_user_group, []))

    return setting_data
