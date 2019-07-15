import datetime
import json
import httplib2
import collections

from django.core.exceptions import ObjectDoesNotExist
from django.db import InternalError
from django.db import transaction
from django.db.models import Q
from django.db.models.expressions import RawSQL
from django.utils import timezone

from configs import settings
from configs.const import REPEAT_TYPE_2WEAK, ON_SCHEDULE_TYPE, OFF_SCHEDULE_TYPE, USE, UN_USE, \
    SCHEDULE_DUPLICATION_DISABLE, ING_MEMBER_FALSE, ING_MEMBER_TRUE

from login.models import LogTb, PushInfoTb
from trainer.models import MemberClassTb, LectureMemberTicketTb, ClassMemberTicketTb, LectureTb
from trainee.models import MemberTicketTb, MemberMemberTicketTb
from trainer.functions import func_get_class_member_ing_list
from .models import ScheduleTb, RepeatScheduleTb, DeleteScheduleTb, DeleteRepeatScheduleTb


# 1:1 Lecture Id 조회
def func_get_member_ticket_id(class_id, member_id):

    member_ticket_id = None
    # 강좌에 해당하는 수강/회원 정보 가져오기
    class_member_ticket_data = ClassMemberTicketTb.objects.filter(class_tb_id=class_id,
                                                             class_tb__use=USE,
                                                             auth_cd='VIEW',
                                                             member_ticket_tb__member_id=member_id,
                                                             member_ticket_tb__state_cd='IP',
                                                             member_ticket_tb__member_ticket_avail_count__gt=0,
                                                             member_ticket_tb__use=USE).order_by('member_ticket_tb__start_date',
                                                                                           'member_ticket_tb__reg_dt')

    for class_member_ticket_info in class_member_ticket_data:
        try:
            LectureMemberTicketTb.objects.get(lecture_tb__state_cd='IP', lecture_tb__lecture_type_cd='ONE_TO_ONE',
                                       member_ticket_tb_id=class_member_ticket_info.member_ticket_tb.member_ticket_id,
                                       use=USE)
            member_ticket_id = class_member_ticket_info.member_ticket_tb.member_ticket_id
            break
        except ObjectDoesNotExist:
            member_ticket_id = None

    return member_ticket_id


# 그룹 Lecture Id 조회
def func_get_lecture_member_ticket_id(lecture_id, member_id):

    member_ticket_id = None

    lecture_member_ticket_data = LectureMemberTicketTb.objects.select_related(
        'lecture_tb', 'member_ticket_tb').filter(lecture_tb_id=lecture_id, lecture_tb__state_cd='IP',
                                         lecture_tb__use=USE,
                                         member_ticket_tb__member_id=member_id,
                                         member_ticket_tb__state_cd='IP',
                                         member_ticket_tb__member_ticket_avail_count__gt=0,
                                         member_ticket_tb__use=USE,
                                         use=USE).order_by('member_ticket_tb__start_date', 'member_ticket_tb__reg_dt')

    if len(lecture_member_ticket_data) > 0:
        member_ticket_id = lecture_member_ticket_data[0].member_ticket_tb.member_ticket_id

    return member_ticket_id


# 수강정보 - 횟수관련 update
def func_refresh_member_ticket_count(class_id, member_ticket_id):
    error = None
    member_ticket_info = None
    check_member_ticket_state_cd = ''
    schedule_data = None

    if member_ticket_id is None or member_ticket_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            member_ticket_info = MemberTicketTb.objects.select_related('ticket_tb').get(member_ticket_id=member_ticket_id,
                                                                                        use=USE)
            check_member_ticket_state_cd = member_ticket_info.state_cd
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id, member_ticket_tb_id=member_ticket_id, use=USE)
        if member_ticket_info.member_ticket_reg_count >= len(schedule_data):
            member_ticket_info.member_ticket_avail_count = member_ticket_info.member_ticket_reg_count\
                                               - len(schedule_data)
            member_ticket_info.save()
        else:
            error = '오류가 발생했습니다.'

    if error is None:
        end_schedule_counter = schedule_data.filter(Q(state_cd='PE') | Q(state_cd='PC'), class_tb_id=class_id,
                                                    use=USE).count()
        if member_ticket_info.member_ticket_reg_count >= end_schedule_counter:
            member_ticket_info.member_ticket_rem_count = member_ticket_info.member_ticket_reg_count\
                                               - end_schedule_counter
            if member_ticket_info.member_ticket_rem_count == 0:
                member_ticket_info.state_cd = 'PE'
            # elif member_ticket_info.member_ticket_rem_count > 0:
            #     if member_ticket_info.state_cd != 'RF':
            #         if member_ticket_info.ticket_tb.state_cd == 'IP':
            #             member_ticket_info.state_cd = 'IP'

            if member_ticket_info.state_cd == 'PE':
                member_ticket_info.member_ticket_rem_count = 0

                member_ticket_info.save()
        else:
            error = '오류가 발생했습니다.'

    if error is None:
        if member_ticket_info.state_cd != check_member_ticket_state_cd:
            if member_ticket_info.state_cd == 'PE' or member_ticket_info.state_cd == 'RF':
                lecture_member_ticket_data = LectureMemberTicketTb.objects.filter(member_ticket_tb_id=member_ticket_info.member_ticket_id,
                                                                           use=USE)
                lecture_member_ticket_data.update(fix_state_cd='')

    return error


# 수강정보 - 횟수관련 update
def func_refresh_member_ticket_count_for_delete(class_id, member_ticket_id, auth_member_num):
    error = None
    member_ticket_info = None
    check_member_ticket_state_cd = ''
    ing_member_check = ING_MEMBER_FALSE
    check_info = None
    schedule_data = None
    if member_ticket_id is None or member_ticket_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None and check_info is None:
        try:
            member_ticket_info = MemberTicketTb.objects.select_related('ticket_tb').get(member_ticket_id=member_ticket_id,
                                                                                    use=USE)
            check_member_ticket_state_cd = member_ticket_info.state_cd
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        class_member_ticket_data = ClassMemberTicketTb.objects.select_related(
            'member_ticket_tb__member').filter(class_tb_id=class_id,
                                         member_ticket_tb__member_id=member_ticket_info.member_id,
                                         member_ticket_tb__use=USE, auth_cd='VIEW',
                                         use=USE)
        if class_member_ticket_data.filter(member_ticket_tb__state_cd='IP').count() > 0:
            ing_member_check = ING_MEMBER_TRUE

    if error is None:
        if ing_member_check == ING_MEMBER_FALSE:
            ing_member_count = len(func_get_class_member_ing_list(class_id, ''))
            if ing_member_count + 1 > int(auth_member_num):
                check_info = '회원 진행중 변경 불가'

    if error is None and check_info is None:
        schedule_data = ScheduleTb.objects.filter(member_ticket_tb_id=member_ticket_id, use=USE)
        if member_ticket_info.member_ticket_reg_count >= len(schedule_data):
            member_ticket_info.member_ticket_avail_count = member_ticket_info.member_ticket_reg_count - len(schedule_data)
            member_ticket_info.save()
        else:
            error = '오류가 발생했습니다.'

    if error is None and check_info is None:
        end_schedule_counter = schedule_data.filter(Q(state_cd='PE') | Q(state_cd='PC'), use=USE).count()
        if member_ticket_info.member_ticket_reg_count >= end_schedule_counter:
            member_ticket_info.member_ticket_rem_count = member_ticket_info.member_ticket_reg_count - end_schedule_counter
            if member_ticket_info.member_ticket_rem_count == 0:
                member_ticket_info.state_cd = 'PE'
            elif member_ticket_info.member_ticket_rem_count == 1:
                if member_ticket_info.state_cd != 'RF':
                    if member_ticket_info.ticket_tb.state_cd == 'IP':
                        member_ticket_info.state_cd = 'IP'

            if member_ticket_info.state_cd == 'PE':
                member_ticket_info.member_ticket_rem_count = 0

            member_ticket_info.save()
        else:
            error = '오류가 발생했습니다.'

    if error is None and check_info is None:
        if member_ticket_info.state_cd != check_member_ticket_state_cd:
            if member_ticket_info.state_cd == 'PE' or member_ticket_info.state_cd == 'RF':
                lecture_member_ticket_data = LectureMemberTicketTb.objects.filter(member_ticket_tb_id=member_ticket_info.member_ticket_id, use=USE)
                lecture_member_ticket_data.update(fix_state_cd='')

    return error


# 그룹정보 update
def func_refresh_lecture_status(lecture_id, lecture_schedule_id, lecture_repeat_schedule_id):
    # 그룹 스케쥴 종료 및 그룹 반복 일정 종료
    if lecture_schedule_id is not None and lecture_schedule_id != '':
        try:
            lecture_schedule_info = ScheduleTb.objects.get(schedule_id=lecture_schedule_id,
                                                         use=USE)
        except ObjectDoesNotExist:
            lecture_schedule_info = None
        lecture_schedule_total_count = ScheduleTb.objects.filter(lecture_schedule_id=lecture_schedule_id, use=USE).count()
        lecture_schedule_end_count = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'),
                                                             lecture_schedule_id=lecture_schedule_id,
                                                             lecture_tb_id=lecture_id,
                                                             use=USE).count()

        if lecture_schedule_info is not None:
            if lecture_schedule_total_count == lecture_schedule_end_count:
                if lecture_schedule_info.state_cd != 'PE':
                    lecture_schedule_info.state_cd = 'PE'
                    lecture_schedule_info.save()

    # 그룹 반복 일정 종료
    if lecture_repeat_schedule_id is not None and lecture_repeat_schedule_id != '':
        try:
            lecture_repeat_schedule_info = RepeatScheduleTb.objects.get(repeat_schedule_id=lecture_repeat_schedule_id)
        except ObjectDoesNotExist:
            lecture_repeat_schedule_info = None

        lecture_repeat_schedule_total_count = \
            RepeatScheduleTb.objects.filter(lecture_schedule_id=lecture_repeat_schedule_id).count()
        lecture_repeat_schedule_end_count = RepeatScheduleTb.objects.filter(lecture_schedule_id=lecture_repeat_schedule_id,
                                                                          state_cd='PE').count()
        if lecture_repeat_schedule_info is not None:
            if lecture_repeat_schedule_total_count == lecture_repeat_schedule_end_count:
                lecture_repeat_schedule_info.state_cd = 'PE'
                lecture_repeat_schedule_info.save()


# 일정 등록
def func_add_schedule(class_id, member_ticket_id, repeat_schedule_id,
                      lecture_id, lecture_schedule_id,
                      start_datetime, end_datetime,
                      note, en_dis_type, user_id, permission_state_cd, state_cd, duplication_enable_flag):
    error = None
    context = {'error': None, 'schedule_id': ''}
    if member_ticket_id == '':
        member_ticket_id = None
    if lecture_id == '':
        lecture_id = None
    if lecture_schedule_id == '':
        lecture_schedule_id = None
    if repeat_schedule_id == '':
        repeat_schedule_id = None

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
                                           reg_member_id=user_id)
            add_schedule_info.save()

            if member_ticket_id is not None:
                error = func_refresh_member_ticket_count(class_id, member_ticket_id)

            if error is None:
                error = func_date_check(class_id, add_schedule_info.schedule_id,
                                        str(start_datetime).split(' ')[0], start_datetime, end_datetime,
                                        duplication_enable_flag)
                if error is not None:
                    error += ' 일정이 중복되었습니다.'

            context['schedule_id'] = add_schedule_info.schedule_id
    except TypeError:
        error = '일정 추가중 오류가 발생했습니다.'
    except ValueError:
        error = '일정 추가중 오류가 발생했습니다.'
    context['error'] = error

    return context


# 일정 등록
def func_add_repeat_schedule(class_id, member_ticket_id, lecture_id, lecture_schedule_id, repeat_type,
                             week_type, start_date, end_date, start_time, end_time, time_duration, en_dis_type,
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
                                                    time_duration=time_duration,
                                                    state_cd='NP', en_dis_type=en_dis_type,
                                                    reg_member_id=user_id)

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

    try:
        with transaction.atomic():
            delete_schedule_info = DeleteScheduleTb(schedule_id=schedule_info.schedule_id,
                                                    class_tb_id=schedule_info.class_tb_id,
                                                    lecture_tb_id=schedule_info.lecture_tb_id,
                                                    member_ticket_tb_id=schedule_info.member_ticket_tb_id,
                                                    lecture_schedule_id=schedule_info.lecture_schedule_id,
                                                    delete_repeat_schedule_tb=schedule_info.repeat_schedule_tb_id,
                                                    start_dt=schedule_info.start_dt, end_dt=schedule_info.end_dt,
                                                    permission_state_cd=schedule_info.permission_state_cd,
                                                    state_cd=schedule_info.state_cd, note=schedule_info.note,
                                                    en_dis_type=schedule_info.en_dis_type,
                                                    member_note=schedule_info.member_note,
                                                    reg_member_id=schedule_info.reg_member_id,
                                                    del_member_id=user_id,
                                                    reg_dt=schedule_info.reg_dt, mod_dt=timezone.now(), use=UN_USE)

            delete_schedule_info.save()
            schedule_info.delete()

            if delete_schedule_info.en_dis_type == ON_SCHEDULE_TYPE:
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
        repeat_schedule_finish_count = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'),
                                                                 repeat_schedule_tb_id=repeat_schedule_id).count()
        if repeat_schedule_count == 0:
            repeat_schedule_result = func_delete_repeat_schedule(repeat_schedule_id)
            error = repeat_schedule_result['error']
        else:
            if repeat_schedule_count == repeat_schedule_finish_count:
                repeat_schedule_info.state_cd = 'PE'
            else:
                repeat_schedule_info.state_cd = 'IP'
            if repeat_schedule_finish_count == 0:
                repeat_schedule_info.state_cd = 'NP'
            repeat_schedule_info.save()

    return error


# 그룹일정 등록전 그룹에 허용 가능 인원 확인
def func_check_lecture_available_member_before(class_id, lecture_id, lecture_schedule_id):
    error = None
    lecture_info = None

    try:
        lecture_info = LectureTb.objects.get(lecture_id=lecture_id)

    except ObjectDoesNotExist:
        error = '오류가 발생했습니다.'

    schedule_counter = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                 lecture_schedule_id=lecture_schedule_id,
                                                 use=USE).exclude(state_cd='PC').count()
    if schedule_counter > lecture_info.member_num:
        error = '정원을 초과했습니다.'

    return error


# 그룹일정 등록후 그룹에 허용 가능 인원 확인
def func_check_lecture_available_member_after(class_id, lecture_id, lecture_schedule_id):
    error = None
    lecture_info = None

    try:
        lecture_info = LectureTb.objects.get(lecture_id=lecture_id)

    except ObjectDoesNotExist:
        error = '오류가 발생했습니다.'

    schedule_counter = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                 lecture_schedule_id=lecture_schedule_id,
                                                 use=USE).exclude(state_cd='PC').count()
    if schedule_counter > lecture_info.member_num:
        error = '정원을 초과했습니다.'

    return error


# 일정 중복 체크
def func_date_check(class_id, schedule_id, pt_schedule_date, add_start_dt, add_end_dt, duplication_enable_flag):
    error = None
    if int(duplication_enable_flag) == SCHEDULE_DUPLICATION_DISABLE:
        seven_days_ago = add_start_dt - datetime.timedelta(days=1)
        seven_days_after = add_end_dt + datetime.timedelta(days=1)

        schedule_data = ScheduleTb.objects.filter(~Q(state_cd='PC'), class_tb_id=class_id,
                                                  start_dt__gte=seven_days_ago, end_dt__lte=seven_days_after,
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


# 강좌에 해당하는 회원들 스케쥴 알람 업데이트
def func_update_member_schedule_alarm(class_id):
    member_member_ticket_data = ClassMemberTicketTb.objects.filter(class_tb_id=class_id, member_ticket_tb__state_cd='IP',
                                                        member_ticket_tb__use=USE,
                                                        auth_cd='VIEW',
                                                        use=USE)
    for member_member_ticket_data_info in member_member_ticket_data:
        member_member_ticket_info = member_member_ticket_data_info.member_ticket_tb
        member_member_ticket_info.schedule_check = 1
        member_member_ticket_info.save()


# 로그정보 쓰기
def func_save_log_data(start_date, end_date, class_id, member_ticket_id, user_name, member_name,
                       en_dis_type, log_type, request):

    # 일정 등록
    log_type_name = ''
    log_type_detail = ''

    if log_type == 'LS01':
        log_type_name = '수업'
        log_type_detail = '예약 완료'

    if log_type == 'LS02':
        log_type_name = '수업'
        log_type_detail = '예약 취소'

    if log_type == 'LS03':
        log_type_name = '예약'
        log_type_detail = '참석'
    if log_type == 'LR01':
        log_type_name = '반복 일정'
        log_type_detail = '등록'
    if log_type == 'LR02':
        log_type_name = '반복 일정'
        log_type_detail = '취소'

    if en_dis_type == ON_SCHEDULE_TYPE:
        log_data = LogTb(log_type=log_type, auth_member_id=request.user.id,
                         from_member_name=user_name, to_member_name=member_name,
                         class_tb_id=class_id, member_ticket_tb_id=member_ticket_id,
                         log_info='1:1'+log_type_name, log_how=log_type_detail,
                         log_detail=str(start_date) + '/' + str(end_date), use=USE)
        log_data.save()
    elif en_dis_type == OFF_SCHEDULE_TYPE:
        log_data = LogTb(log_type=log_type, auth_member_id=request.user.id,
                         from_member_name=user_name,
                         class_tb_id=class_id,
                         log_info='OFF ', log_how=log_type_detail,
                         log_detail=str(start_date) + '/' + str(end_date), use=USE)
        log_data.save()
    else:
        log_data = LogTb(log_type=log_type, auth_member_id=request.user.id,
                         from_member_name=user_name, to_member_name=member_name,
                         class_tb_id=class_id, member_ticket_tb_id=member_ticket_id,
                         log_info='[그룹]'+log_type_name, log_how=log_type_detail,
                         log_detail=str(start_date) + '/' + str(end_date), use=USE)
        log_data.save()


# 그룹 스케쥴 등록 가능 여부 확인
def func_check_lecture_schedule_enable(lecture_id):

    error = None
    lecture_info = None
    try:
        lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
    except ObjectDoesNotExist:
        error = '오류가 발생했습니다.'

    if lecture_info.lecture_type_cd == 'NORMAL':
        lecture_member_ticket_data_count = LectureMemberTicketTb.objects.filter(lecture_tb_id=lecture_id,
                                                                 lecture_tb__use=USE,
                                                                 member_ticket_tb__state_cd='IP',
                                                                 member_ticket_tb__member_ticket_avail_count__gt=0,
                                                                 member_ticket_tb__use=USE,
                                                                 use=USE).count()

        if lecture_member_ticket_data_count == 0:
            error = '그룹 회원들의 예약 가능 횟수가 없습니다.'

    return error


def func_get_lecture_member_list(lecture_id):
    member_list = []
    lecture_member_ticket_data = LectureMemberTicketTb.objects.filter(lecture_tb_id=lecture_id,
                                                       # lecture_tb__lecture_type_cd='NORMAL',
                                                       lecture_tb__use=USE,
                                                       member_ticket_tb__state_cd='IP',
                                                       member_ticket_tb__use=USE,
                                                       fix_state_cd='FIX',
                                                       use=USE)

    for lecture_member_ticket_info in lecture_member_ticket_data:
        if len(member_list) == 0:
            member_list.append(lecture_member_ticket_info.member_ticket_tb.member)
        check_info = 0
        for member_info in member_list:
            if lecture_member_ticket_info.member_ticket_tb.member.member_id == member_info.member_id:
                check_info = 1

        if check_info == 0:
            member_list.append(lecture_member_ticket_info.member_ticket_tb.member)

    return member_list


def func_get_available_lecture_member_list(lecture_id):
    member_list = []
    lecture_member_ticket_data = LectureMemberTicketTb.objects.filter(lecture_tb_id=lecture_id,
                                                       # lecture_tb__lecture_type_cd='NORMAL',
                                                       lecture_tb__use=USE,
                                                       member_ticket_tb__state_cd='IP',
                                                       member_ticket_tb__use=USE,
                                                       member_ticket_tb__member_ticket_avail_count__gt=0,
                                                       fix_state_cd='FIX',
                                                       use=USE)

    for lecture_member_ticket_info in lecture_member_ticket_data:
        if len(member_list) == 0:
            member_list.append(lecture_member_ticket_info.member_ticket_tb.member)
        check_info = 0
        for member_info in member_list:
            if str(lecture_member_ticket_info.member_ticket_tb.member.member_id) == str(member_info.member_id):
                check_info = 1

        if check_info == 0:
            member_list.append(lecture_member_ticket_info.member_ticket_tb.member)

    return member_list


# 그룹회원중 예약 가능하지 않은 회원들의 리스트
def func_get_not_available_lecture_member_list(lecture_id):
    member_list = []
    lecture_member_ticket_data = LectureMemberTicketTb.objects.filter(Q(member_ticket_tb__member_ticket_avail_count=0) | ~Q(fix_state_cd='FIX'),
                                                       lecture_tb_id=lecture_id,
                                                       # lecture_tb__lecture_type_cd='NORMAL',
                                                       lecture_tb__use=USE,
                                                       member_ticket_tb__use=USE,
                                                       use=USE)

    for lecture_member_ticket_info in lecture_member_ticket_data:
        if len(member_list) == 0:
            member_list.append(lecture_member_ticket_info.member_ticket_tb.member)
        check_info = 0
        for member_info in member_list:
            if lecture_member_ticket_info.member_ticket_tb.member.member_id == member_info.member_id:
                check_info = 1

        if check_info == 0:
            member_list.append(lecture_member_ticket_info.member_ticket_tb.member)

    return member_list


# 강사 -> 회원 push 메시지 전달
def func_send_push_trainer(member_ticket_id, title, message):
    error = None
    push_server_id = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')
    if member_ticket_id is not None and member_ticket_id != '':
        # member_member_ticket_data = MemberMemberTicketTb.objects.filter(member_ticket_tb_id=member_ticket_id, use=USE)
        # for class_member_ticket_info in member_member_ticket_data:
        member_ticket_info = MemberMemberTicketTb.objects.filter(member_ticket_tb_id=member_ticket_id,
                                                      auth_cd='VIEW', use=USE)
        for member_ticket_info in member_ticket_info:
            token_data = PushInfoTb.objects.filter(member_id=member_ticket_info.member.member_id)
            for token_info in token_data:
                if token_info.device_id != 'pc':
                    token_info.badge_counter += 1
                    token_info.save()
                instance_id = token_info.token
                badge_counter = token_info.badge_counter
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


# 회원 -> 강사 push 메시지 전달
def func_send_push_trainee(class_id, title, message):
    push_server_id = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')
    error = None
    if class_id is not None and class_id != '':

        member_class_data = MemberClassTb.objects.filter(class_tb_id=class_id, auth_cd='VIEW', use=USE)

        for member_class_info in member_class_data:

            token_data = PushInfoTb.objects.filter(member_id=member_class_info.member.member_id)
            for token_info in token_data:
                if token_info.device_id != 'pc':
                    token_info.badge_counter += 1
                    token_info.save()
                instance_id = token_info.token
                badge_counter = token_info.badge_counter
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


def func_get_trainer_schedule_all(class_id, start_date, end_date):
    query = "select count(B.ID) from SCHEDULE_TB as B where B.GROUP_SCHEDULE_ID = `SCHEDULE_TB`.`ID` " \
            "AND B.STATE_CD != \'PC\' AND B.USE=1"

    schedule_data = ScheduleTb.objects.select_related(
        'member_ticket_tb__member',
        'lecture_tb').filter(class_tb=class_id, start_dt__gte=start_date, start_dt__lt=end_date,
                           lecture_schedule_id__isnull=True,
                           use=USE).annotate(lecture_current_member_num=RawSQL(query,
                                                                             [])).order_by('start_dt', 'reg_dt')

    ordered_schedule_dict = collections.OrderedDict()
    temp_schedule_date = None
    date_schedule_list = []
    for schedule_info in schedule_data:
        # 날짜별로 모아주기 위해서 날짜 분리
        schedule_start_date = str(schedule_info.start_dt).split(' ')
        schedule_end_date = str(schedule_info.end_dt).split(' ')
        schedule_start_time = schedule_start_date[1].split(':')
        schedule_end_time = schedule_end_date[1].split(':')
        schedule_type = schedule_info.en_dis_type
        # 새로운 날짜로 넘어간 경우 array 비워주고 값 셋팅
        if temp_schedule_date != schedule_start_date[0]:
            temp_schedule_date = schedule_start_date[0]
            date_schedule_list = []
        # array 에 값을 추가후 dictionary 에 추가
        try:
            member_name = schedule_info.member_ticket_tb.member.name
        except AttributeError:
            member_name = ''

        try:
            lecture_id = schedule_info.lecture_tb.lecture_id
            lecture_name = schedule_info.lecture_tb.name
            lecture_max_member_num = schedule_info.lecture_tb.member_num
            lecture_current_member_num = schedule_info.lecture_current_member_num
            schedule_type = 2
        except AttributeError:
            lecture_id = ''
            lecture_name = ''
            lecture_max_member_num = ''
            lecture_current_member_num = ''

        date_schedule_list.append({'schedule_id': schedule_info.schedule_id,
                                   'start_time': schedule_start_time[0]+':'+schedule_start_time[1],
                                   'end_time': schedule_end_time[0]+':'+schedule_end_time[1],
                                   'state_cd': schedule_info.state_cd,
                                   'schedule_type': schedule_type,
                                   'note': schedule_info.note,
                                   'member_name': member_name,
                                   'lecture_id': lecture_id,
                                   'lecture_name': lecture_name,
                                   'lecture_max_member_num': lecture_max_member_num,
                                   'lecture_current_member_num': lecture_current_member_num})

        ordered_schedule_dict[schedule_start_date[0]] = date_schedule_list

    return ordered_schedule_dict


def func_get_trainer_attend_schedule(context, class_id, start_date, end_date, now):
    func_get_trainer_attend_on_schedule(context, class_id, start_date, end_date, now)
    func_get_trainer_attend_lecture_schedule(context, class_id, start_date, end_date, now, '')
    return context


def func_get_trainer_attend_on_schedule(context, class_id, start_date, end_date, now):
    # PT 스케쥴 정보 셋팅
    context['pt_schedule_data'] = ScheduleTb.objects.select_related('member_ticket_tb__member'
                                                                    ).filter(Q(start_dt__lte=now,
                                                                               end_dt__gte=now) |
                                                                             Q(start_dt__gte=now,
                                                                               start_dt__lte=start_date) |
                                                                             Q(end_dt__gte=end_date,
                                                                               end_dt__lte=now),
                                                                             member_ticket_tb__isnull=False,
                                                                             member_ticket_tb__use=USE,
                                                                             class_tb=class_id,
                                                                             en_dis_type=ON_SCHEDULE_TYPE,
                                                                             state_cd='NP',
                                                                             use=USE).order_by('start_dt', 'reg_dt')


def func_get_trainer_attend_lecture_schedule(context, class_id, start_date, end_date, now, lecture_id):
    query = "select count(B.ID) from SCHEDULE_TB as B where B.GROUP_SCHEDULE_ID = `SCHEDULE_TB`.`ID` " \
            "AND B.STATE_CD != \'PC\' AND B.USE=1"
    finish_member_query = "select count(B.ID) from SCHEDULE_TB as B where B.GROUP_SCHEDULE_ID = `SCHEDULE_TB`.`ID` " \
                          "AND B.STATE_CD = \'PE\' AND B.USE=1"
    query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as C where C.COMMON_CD = `GROUP_TB`.`GROUP_TYPE_CD`"
    lecture_schedule_data = ScheduleTb.objects.select_related('lecture_tb').filter(Q(start_dt__lte=now,
                                                                                 end_dt__gte=now) |
                                                                               Q(start_dt__gte=now,
                                                                                 start_dt__lte=start_date) |
                                                                               Q(end_dt__gte=end_date,
                                                                                 end_dt__lte=now),
                                                                               lecture_tb__isnull=False,
                                                                               member_ticket_tb__isnull=True,
                                                                               class_tb=class_id,
                                                                               en_dis_type=ON_SCHEDULE_TYPE, use=USE)
    if lecture_id is None or lecture_id == '':
        lecture_schedule_data = lecture_schedule_data.annotate(lecture_current_member_num=RawSQL(query, []),
                                                           lecture_current_finish_member_num=RawSQL(finish_member_query,
                                                                                                  []),
                                                           lecture_type_cd_name=RawSQL(query_type_cd,
                                                                                     [])).order_by('start_dt')

    else:
        lecture_schedule_data = lecture_schedule_data.filter(
            lecture_tb_id=lecture_id).annotate(lecture_current_member_num=RawSQL(query, []),
                                           lecture_current_finish_member_num=RawSQL(finish_member_query, []),
                                           lecture_type_cd_name=RawSQL(query_type_cd, [])).order_by('start_dt')

    context['lecture_schedule_data'] = lecture_schedule_data


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
