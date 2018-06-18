import datetime
import json
import httplib2
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.utils import timezone

from configs import settings
from configs.const import REPEAT_TYPE_2WEAK, ON_SCHEDULE_TYPE, OFF_SCHEDULE_TYPE, USE, UN_USE
from login.models import LogTb, PushInfoTb, CommonCdTb
from schedule.models import GroupLectureTb, ClassLectureTb, LectureTb, ScheduleTb, GroupTb, MemberLectureTb, \
    MemberClassTb, ClassTb, RepeatScheduleTb, DeleteScheduleTb, DeleteRepeatScheduleTb


# 1:1 Lecture Id 조회
def func_get_lecture_id(class_id, member_id):

    lecture_id = None
    # 강좌에 해당하는 수강/회원 정보 가져오기
    lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                 class_tb__use=USE,
                                                 lecture_tb__member_id=member_id,
                                                 lecture_tb__state_cd='IP',
                                                 lecture_tb__lecture_avail_count__gt=0,
                                                 lecture_tb__use=USE).order_by('lecture_tb__start_date', 'lecture_tb__reg_dt')

    for lecture_info in lecture_data:
        try:
            GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_tb.lecture_id, use=USE)
        except ObjectDoesNotExist:
            lecture_id = lecture_info.lecture_tb.lecture_id
            break

    return lecture_id


# 그룹 Lecture Id 조회
def func_get_group_lecture_id(group_id, member_id):

    lecture_id = None

    group_lecture_data = GroupLectureTb.objects.filter(group_tb_id=group_id,
                                                       group_tb__use=USE,
                                                       lecture_tb__member_id=member_id,
                                                       lecture_tb__state_cd='IP',
                                                       lecture_tb__lecture_avail_count__gt=0,
                                                       lecture_tb__use=USE,
                                                       use=USE).order_by('lecture_tb__start_date', 'lecture_tb__reg_dt')

    if len(group_lecture_data) > 0:
        lecture_id = group_lecture_data[0].lecture_tb.lecture_id

    return lecture_id


# 수강정보 - 횟수관련 update
def func_refresh_lecture_count(lecture_id):
    error = None
    lecture_info = None
    if lecture_id is None or lecture_id == '':
        error = '회원 수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id, use=USE)

        except ObjectDoesNotExist:
            error = '회원 수강정보를 불러오지 못했습니다.'

    if error is None:
        reg_schedule_counter = ScheduleTb.objects.filter(lecture_tb_id=lecture_id).count()
        if lecture_info.lecture_reg_count >= reg_schedule_counter:
            lecture_info.lecture_avail_count = lecture_info.lecture_reg_count\
                                               - reg_schedule_counter
            lecture_info.mod_dt = timezone.now()
            lecture_info.save()
        else:
            error = '오류가 발생했습니다.'

    if error is None:
        end_schedule_counter = ScheduleTb.objects.filter(lecture_tb_id=lecture_id, state_cd='PE').count()
        if lecture_info.lecture_reg_count >= end_schedule_counter:
            lecture_info.lecture_rem_count = lecture_info.lecture_reg_count\
                                               - end_schedule_counter
            if lecture_info.lecture_rem_count == 0:
                lecture_info.state_cd = 'PE'
            else:
                lecture_info.state_cd = 'IP'
            lecture_info.mod_dt = timezone.now()
            lecture_info.save()
        else:
            error = '오류가 발생했습니다.'

    return error


# 그룹정보 update
def func_refresh_group_status(group_id, group_schedule_id, group_repeat_schedule_id):
    # 그룹 스케쥴 종료 및 그룹 반복일정 종료
    if group_schedule_id is not None and group_schedule_id != '':
        try:
            group_schedule_info = ScheduleTb.objects.get(schedule_id=group_schedule_id,
                                                         use=USE)
        except ObjectDoesNotExist:
            group_schedule_info = None
        group_schedule_total_count = ScheduleTb.objects.filter(group_schedule_id=group_schedule_id, use=USE).count()
        group_schedule_end_count = ScheduleTb.objects.filter(group_schedule_id=group_schedule_id, state_cd='PE',
                                                             use=USE).count()

        if group_schedule_info is not None:
            if group_schedule_total_count == group_schedule_end_count:
                if group_schedule_info.state_cd != 'PE':
                    group_schedule_info.state_cd = 'PE'
                    group_schedule_info.save()

    # 그룹 반복일정 종료
    if group_repeat_schedule_id is not None and group_repeat_schedule_id != '':
        try:
            group_repeat_schedule_info = RepeatScheduleTb.objects.get(repeat_schedule_id=group_repeat_schedule_id)
        except ObjectDoesNotExist:
            group_repeat_schedule_info = None

        group_repeat_schedule_total_count = RepeatScheduleTb.objects.filter(group_schedule_id=group_repeat_schedule_id).count()
        group_repeat_schedule_end_count = RepeatScheduleTb.objects.filter(group_schedule_id=group_repeat_schedule_id,
                                                                          state_cd='PE').count()
        if group_repeat_schedule_info is not None:
            if group_repeat_schedule_total_count == group_repeat_schedule_end_count:
                group_repeat_schedule_info.state_cd = 'PE'
                group_repeat_schedule_info.save()

    # 그룹 종료 처리
    if group_id is not None and group_id != '':
        try:
            group_info = GroupTb.objects.get(group_id=group_id, use=USE)
        except ObjectDoesNotExist:
            group_info = None
        if group_info is not None:
            if group_info.group_type_cd == 'NORMAL':
                group_lecture_total_count = GroupLectureTb.objects.filter(group_tb_id=group_id,
                                                                          lecture_tb__use=USE,
                                                                          use=USE).count()
                group_lecture_end_count = GroupLectureTb.objects.filter(group_tb_id=group_id,
                                                                        lecture_tb__use=USE,
                                                                        use=USE).exclude(lecture_tb__state_cd='IP').count()
                if group_info is not None:
                    if group_lecture_total_count == group_lecture_end_count:
                        group_info.state_cd = 'PE'
                        group_info.save()
                    else:
                        group_info.state_cd = 'IP'
                        group_info.save()


# 일정 등록
def func_add_schedule(class_id, lecture_id, repeat_schedule_id,
                      group_id, group_schedule_id,
                      start_datetime, end_datetime,
                      note, en_dis_type, user_id):
    error = None
    context = {'error': None, 'schedule_id': ''}

    if lecture_id == '':
        lecture_id = None
    if group_id == '':
        group_id = None
    if group_schedule_id == '':
        group_schedule_id = None
    if repeat_schedule_id == '':
        repeat_schedule_id = None
    try:
        with transaction.atomic():
            add_schedule_info = ScheduleTb(class_tb_id=class_id,
                                           lecture_tb_id=lecture_id,
                                           group_tb_id=group_id,
                                           group_schedule_id=group_schedule_id,
                                           repeat_schedule_tb_id=repeat_schedule_id,
                                           start_dt=start_datetime, end_dt=end_datetime,
                                           state_cd='NP', permission_state_cd='AP',
                                           note=note, member_note='', en_dis_type=en_dis_type,
                                           reg_member_id=user_id,
                                           reg_dt=timezone.now(), mod_dt=timezone.now())
            add_schedule_info.save()
            context['schedule_id'] = add_schedule_info.schedule_id
    except TypeError:
        error = '등록 값의 형태에 문제가 있습니다.'
    except ValueError:
        error = '등록 값에 문제가 있습니다.'
    context['error'] = error

    return context


# 일정 등록
def func_add_repeat_schedule(class_id, lecture_id, group_id, group_schedule_id, repeat_type,
                             week_type, start_date, end_date, start_time, end_time, time_duration, en_dis_type,
                             user_id):
    error = None
    context = {'error': None, 'schedule_info': None}

    if lecture_id == '':
        lecture_id = None
    try:
        with transaction.atomic():
            repeat_schedule_info = RepeatScheduleTb(class_tb_id=class_id, lecture_tb_id=lecture_id,
                                                    group_tb_id=group_id, group_schedule_id=group_schedule_id,
                                                    repeat_type_cd=repeat_type,
                                                    week_info=week_type,
                                                    start_date=start_date,
                                                    end_date=end_date,
                                                    start_time=start_time,
                                                    end_time=end_time,
                                                    time_duration=time_duration,
                                                    state_cd='NP', en_dis_type=en_dis_type,
                                                    reg_member_id=user_id,
                                                    reg_dt=timezone.now(), mod_dt=timezone.now())

            repeat_schedule_info.save()
            context['schedule_info'] = repeat_schedule_info
    except TypeError:
        error = '등록 값의 형태에 문제가 있습니다.'
    except ValueError:
        error = '등록 값에 문제가 있습니다.'
    context['error'] = error

    return context


# 일정 삭제
def func_delete_schedule(schedule_id,  user_id):
    error = None
    context = {'error': None, 'schedule_id': ''}

    if schedule_id is None or schedule_id == '':
        error = '스케쥴 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보를 불러오지 못했습니다.'

    try:
        with transaction.atomic():
            delete_schedule_info = DeleteScheduleTb(schedule_id=schedule_info.schedule_id,
                                                    class_tb_id=schedule_info.class_tb_id,
                                                    group_tb_id=schedule_info.group_tb_id,
                                                    lecture_tb_id=schedule_info.lecture_tb_id,
                                                    group_schedule_id=schedule_info.group_schedule_id,
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
            context['schedule_id'] = delete_schedule_info.delete_schedule_id
    except TypeError:
        error = '등록 값의 형태에 문제가 있습니다.'
    except ValueError:
        error = '등록 값에 문제가 있습니다.'
    context['error'] = error
    return context


# 반복 일정 삭제
def func_delete_repeat_schedule(repeat_schedule_id):
    error = None
    context = {'error': None, 'schedule_info': ''}

    if repeat_schedule_id is None or repeat_schedule_id == '':
        error = '반복일정 정보를 불러오지 못했습니다.'

    if error is None:

        try:
            repeat_schedule_info = RepeatScheduleTb.objects.get(repeat_schedule_id=repeat_schedule_id)
        except ObjectDoesNotExist:
            error = '반복일정 정보를 불러오지 못했습니다.'

    try:
        with transaction.atomic():
            delete_repeat_schedule = DeleteRepeatScheduleTb(
                repeat_schedule_id=repeat_schedule_info.repeat_schedule_id,
                class_tb_id=repeat_schedule_info.class_tb_id,
                lecture_tb_id=repeat_schedule_info.lecture_tb_id,
                group_tb_id=repeat_schedule_info.group_tb_id,
                group_schedule_id=repeat_schedule_info.group_schedule_id,
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
        error = '등록 값의 형태에 문제가 있습니다.'
    except ValueError:
        error = '등록 값에 문제가 있습니다.'
    context['error'] = error

    return context


def func_update_repeat_schedule(repeat_schedule_id):
    error = None

    if repeat_schedule_id is None or repeat_schedule_id == '':
        error = '반복일정 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            repeat_schedule_info = RepeatScheduleTb.objects.get(repeat_schedule_id=repeat_schedule_id)
        except ObjectDoesNotExist:
            error = '반복일정 정보를 불러오지 못했습니다.'

    if error is None:
        repeat_schedule_count = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id).count()
        repeat_schedule_finish_count = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id,
                                                                 state_cd='PE').count()
        if repeat_schedule_count == 0:
            repeat_schedule_result = func_delete_repeat_schedule(repeat_schedule_id)
            error = repeat_schedule_result['error']
        else:
            if repeat_schedule_finish_count == 0:
                repeat_schedule_info.state_cd = 'NP'
                repeat_schedule_info.save()

    return error


# 그룹일정 등록전 그룹에 허용 가능 인원 확인
def func_check_group_available_member_before(class_id, group_id, group_schedule_id):
    error = None
    group_info = None

    try:
        group_info = GroupTb.objects.get(group_id=group_id)

    except ObjectDoesNotExist:
        error = '그룹 정보를 불러오지 못했습니다.'

    schedule_counter = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                 group_schedule_id=group_schedule_id, use=USE).count()
    if schedule_counter == group_info.member_num:
        error = '그룹 정원을 초과했습니다.'

    return error


# 그룹일정 등록후 그룹에 허용 가능 인원 확인
def func_check_group_available_member_after(class_id, group_id, group_schedule_id):
    error = None
    group_info = None

    try:
        group_info = GroupTb.objects.get(group_id=group_id)

    except ObjectDoesNotExist:
        error = '그룹 정보를 불러오지 못했습니다.'

    schedule_counter = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                 group_schedule_id=group_schedule_id, use=USE).count()
    if schedule_counter > group_info.member_num:
        error = '그룹 정원을 초과했습니다.'

    return error


# 일정 중복 체크
def func_date_check(class_id, schedule_id, pt_schedule_date, add_start_dt, add_end_dt):
    error = None

    seven_days_ago = add_start_dt - datetime.timedelta(days=2)
    seven_days_after = add_end_dt + datetime.timedelta(days=2)
    schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
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
    member_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__state_cd='IP',
                                                        lecture_tb__use=USE, use=USE)
    for member_lecture_data_info in member_lecture_data:
        member_lecture_info = member_lecture_data_info.lecture_tb
        member_lecture_info.schedule_check = 1
        member_lecture_info.save()


# 로그정보 쓰기
def func_save_log_data(start_date, end_date, class_id, lecture_id, user_name, member_name, en_dis_type, log_type, request):

    # 일정 등록
    log_type_name = ''
    log_type_detail = ''

    if log_type == 'LS01':
        log_type_name = '일정'
        log_type_detail = '등록'

    if log_type == 'LS02':
        log_type_name = '일정'
        log_type_detail = '삭제'

    if log_type == 'LS03':
        log_type_name = '일정'
        log_type_detail = '완료'
    if log_type == 'LR01':
        log_type_name = '반복 일정'
        log_type_detail = '등록'

    if log_type == 'LR02':
        log_type_name = '반복 일정'
        log_type_detail = '삭제'

    if en_dis_type == ON_SCHEDULE_TYPE:
        log_data = LogTb(log_type=log_type, auth_member_id=request.user.id,
                         from_member_name=user_name, to_member_name=member_name,
                         class_tb_id=class_id, lecture_tb_id=lecture_id,
                         log_info='1:1 레슨 '+log_type_name, log_how=log_type_detail,
                         log_detail=str(start_date) + '/' + str(end_date),
                         reg_dt=timezone.now(), use=USE)
        log_data.save()
    else:
        log_data = LogTb(log_type=log_type, auth_member_id=request.user.id,
                         from_member_name=user_name,
                         class_tb_id=class_id,
                         log_info='OFF '+log_type_name, log_how=log_type_detail,
                         log_detail=str(start_date) + '/' + str(end_date),
                         reg_dt=timezone.now(), use=USE)
        log_data.save()


# 그룹 스케쥴 등록 가능 여부 확인
def func_check_group_schedule_enable(group_id):

    error = None
    try:
        group_info = GroupTb.objects.get(group_id=group_id)
    except ObjectDoesNotExist:
        error = '그룹 정보를 불러오지 못했습니다.'

    if group_info.group_type_cd == 'NORMAL':
        group_lecture_data_count = GroupLectureTb.objects.filter(group_tb_id=group_id,
                                                                 group_tb__use=USE,
                                                                 lecture_tb__state_cd='IP',
                                                                 lecture_tb__lecture_avail_count__gt=0,
                                                                 lecture_tb__use=USE,
                                                                 use=USE).count()

        if group_lecture_data_count == 0:
            error = '그룹에 해당하는 회원들의 예약 가능 횟수가 없습니다.'

    return error


def func_get_group_member_list(group_id):
    member_list = []
    group_lecture_data = GroupLectureTb.objects.filter(group_tb_id=group_id,
                                                       group_tb__group_type_cd='NORMAL',
                                                       group_tb__use=USE,
                                                       lecture_tb__state_cd='IP',
                                                       lecture_tb__use=USE,
                                                       use=USE)

    for group_lecture_info in group_lecture_data:
        if len(member_list) == 0:
            member_list.append(group_lecture_info.lecture_tb.member)
        check_info = 0
        for member_info in member_list:
            if group_lecture_info.lecture_tb.member.member_id == member_info.member_id:
                check_info = 1

        if check_info == 0:
            member_list.append(group_lecture_info.lecture_tb.member)

    return member_list


def func_get_available_group_member_list(group_id):
    member_list = []
    group_lecture_data = GroupLectureTb.objects.filter(group_tb_id=group_id,
                                                       group_tb__group_type_cd='NORMAL',
                                                       group_tb__use=USE,
                                                       lecture_tb__state_cd='IP',
                                                       lecture_tb__use=USE,
                                                       lecture_tb__lecture_avail_count__gt=0,
                                                       use=USE)

    for group_lecture_info in group_lecture_data:
        if len(member_list) == 0:
            member_list.append(group_lecture_info.lecture_tb.member)
        check_info = 0
        for member_info in member_list:
            if group_lecture_info.lecture_tb.member.member_id == member_info.member_id:
                check_info = 1

        if check_info == 0:
            member_list.append(group_lecture_info.lecture_tb.member)

    return member_list


# 그룹회원중 예약 가능하지 않은 회원들의 리스트
def func_get_not_available_group_member_list(group_id):
    member_list = []
    group_lecture_data = GroupLectureTb.objects.filter(group_tb_id=group_id,
                                                       group_tb__group_type_cd='NORMAL',
                                                       group_tb__use=USE,
                                                       lecture_tb__lecture_avail_count=0,
                                                       lecture_tb__use=USE,
                                                       use=USE)

    for group_lecture_info in group_lecture_data:
        if len(member_list) == 0:
            member_list.append(group_lecture_info.lecture_tb.member)
        check_info = 0
        for member_info in member_list:
            if group_lecture_info.lecture_tb.member.member_id == member_info.member_id:
                check_info = 1

        if check_info == 0:
            member_list.append(group_lecture_info.lecture_tb.member)

    return member_list


# 강사 -> 회원 push 메시지 전달
def func_send_push_trainer(lecture_id, title, message):
    push_server_id = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')
    if lecture_id is not None and lecture_id != '':
        # member_lecture_data = MemberLectureTb.objects.filter(lecture_tb_id=lecture_id, use=USE)
        # for class_lecture_info in member_lecture_data:
        lecture_info = MemberLectureTb.objects.filter(lecture_tb_id=lecture_id,
                                                      auth_cd='VIEW', use=USE)
        for lecture_info in lecture_info:
            token_data = PushInfoTb.objects.filter(member_id=lecture_info.member.member_id)
            for token_info in token_data:
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


# 회원 -> 강사 push 메시지 전달
def func_send_push_trainee(class_id, title, message):
    push_server_id = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')
    if class_id is not None and class_id != '':

        member_class_data = MemberClassTb.objects.filter(class_tb_id=class_id, auth_cd='VIEW', use=USE)

        for member_class_info in member_class_data:

            token_data = PushInfoTb.objects.filter(member_id=member_class_info.member.member_id)
            for token_info in token_data:
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


def func_get_trainer_schedule(context, class_id, start_date, end_date):

    error = None
    class_info = None
    # 강사 정보 가져오기
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강좌 정보를 불러오지 못했습니다.'
    func_get_trainer_on_schedule(context, class_id, start_date, end_date)
    func_get_trainer_off_schedule(context, class_id, start_date, end_date)
    func_get_trainer_group_schedule(context, class_id, start_date, end_date, None)

    if error is None:
        class_info.schedule_check = 0
        class_info.save()

    return context


def func_get_trainer_on_schedule(context, class_id, start_date, end_date):
    pt_schedule_data = []
    # PT 일정 조회
    # 강사에 해당하는 강좌 정보 불러오기
    lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, auth_cd='VIEW', use=USE)

    for lecture_datum_info in lecture_data:
        lecture_datum = lecture_datum_info.lecture_tb
        # 강좌별로 연결된 PT 스케쥴 가져오기
        lecture_datum.pt_schedule_data = ScheduleTb.objects.filter(class_tb=class_id,
                                                                   lecture_tb=lecture_datum.lecture_id,
                                                                   en_dis_type=ON_SCHEDULE_TYPE,
                                                                   start_dt__gte=start_date,
                                                                   start_dt__lt=end_date, use=USE).order_by('start_dt')
        # PT 스케쥴 정보 셋팅
        idx = 0
        for pt_schedule_info in lecture_datum.pt_schedule_data:
            # lecture schedule id 셋팅
            idx += 1
            pt_schedule_info.member_name = lecture_datum.member.name
            pt_schedule_info.member_id = lecture_datum.member.member_id
            pt_schedule_info.start_dt = str(pt_schedule_info.start_dt)
            pt_schedule_info.end_dt = str(pt_schedule_info.end_dt)
            pt_schedule_info.idx = idx
            if pt_schedule_info.note is None:
                pt_schedule_info.note = ''
            if pt_schedule_info.state_cd == 'PE':
                pt_schedule_info.finish_check = 1
            else:
                pt_schedule_info.finish_check = 0
            pt_schedule_data.append(pt_schedule_info)

    context['pt_schedule_data'] = pt_schedule_data


def func_get_trainer_group_schedule(context, class_id, start_date, end_date, group_id):
    group_schedule_list = []
    # 강좌별로 연결된 그룹 스케쥴 가져오기
    if group_id is None or group_id == '':
        group_schedule_data = ScheduleTb.objects.filter(class_tb=class_id,
                                                        group_tb__isnull=False,
                                                        lecture_tb__isnull=True,
                                                        en_dis_type=ON_SCHEDULE_TYPE,
                                                        start_dt__gte=start_date,
                                                        start_dt__lt=end_date, use=USE).order_by('start_dt')
    else:
        group_schedule_data = ScheduleTb.objects.filter(class_tb=class_id,
                                                        group_tb=group_id,
                                                        lecture_tb__isnull=True,
                                                        en_dis_type=ON_SCHEDULE_TYPE,
                                                        start_dt__gte=start_date,
                                                        start_dt__lt=end_date, use=USE).order_by('start_dt')

    idx = 0
    for group_schedule_info in group_schedule_data:
        # lecture schedule id 셋팅
        idx += 1
        group_schedule_info = group_schedule_info
        if group_schedule_info.group_tb is not None and group_schedule_info.group_tb != '':
            schedule_current_member_num = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                    group_tb_id=group_schedule_info.group_tb.group_id,
                                                                    lecture_tb__isnull=False,
                                                                    group_schedule_id=group_schedule_info.schedule_id,
                                                                    use=USE).count()
            group_schedule_info.current_member_num = schedule_current_member_num

        group_schedule_info.start_dt = str(group_schedule_info.start_dt)
        group_schedule_info.end_dt = str(group_schedule_info.end_dt)
        if group_schedule_info.note is None:
            group_schedule_info.note = ''
        # 끝난 스케쥴인지 확인
        if group_schedule_info.state_cd == 'PE':
            group_schedule_info.finish_check = 1
        else:
            group_schedule_info.finish_check = 0
        group_schedule_list.append(group_schedule_info)

    context['group_schedule_data'] = group_schedule_list


def func_get_trainer_off_schedule(context, class_id, start_date, end_date):

    off_schedule_list = []

    # OFF 일정 조회
    off_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                  en_dis_type=OFF_SCHEDULE_TYPE, start_dt__gte=start_date,
                                                  start_dt__lt=end_date)
    for off_schedule_datum in off_schedule_data:
        off_schedule_info = off_schedule_datum
        off_schedule_info.start_dt = (str(off_schedule_info.start_dt))
        off_schedule_info.end_dt = (str(off_schedule_info.end_dt))
        if off_schedule_info.note is None:
            off_schedule_info.note = ''
        off_schedule_list.append(off_schedule_info)
    context['off_schedule_data'] = off_schedule_list


def func_get_trainer_off_repeat_schedule(context, class_id):
    error = None
    off_repeat_schedule_list = []

    # 강사 클래스의 반복일정 불러오기
    off_repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                               en_dis_type=OFF_SCHEDULE_TYPE)

    for off_repeat_schedule_info in off_repeat_schedule_data:
        off_repeat_schedule_info.start_date = str(off_repeat_schedule_info.start_date)
        off_repeat_schedule_info.end_date = str(off_repeat_schedule_info.end_date)
        try:
            state_cd_name = CommonCdTb.objects.get(common_cd=off_repeat_schedule_info.state_cd)
        except ObjectDoesNotExist:
            error = '반복일정 정보를 불러오지 못했습니다.'
        if error is None:
            off_repeat_schedule_info.state_cd_nm = state_cd_name.common_cd_nm
        off_repeat_schedule_list.append(off_repeat_schedule_info)

    context['off_repeat_schedule_data'] = off_repeat_schedule_list

    return error


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

    # 반복일정 처음 날짜 설정
    check_date = repeat_schedule_start_date

    # 반복일정 종료 날짜 보다 크면 종료
    while check_date <= repeat_schedule_end_date:

        # 반복일정 등록해야하는 첫번째 요일 검색 -> 자신보다 뒤에있는 요일중에 가장 가까운것
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
        # 반복일정 추가
        repeat_schedule_date_list.append(check_date)
        # 날짜값 입력후 날짜 증가
        check_date = check_date + datetime.timedelta(days=1)

        # 날짜값 입력후 날짜 증가했는데 일요일이고 격주인경우 일주일 더하기
        if int(check_date.strftime('%w')) == 0:
            if repeat_type == REPEAT_TYPE_2WEAK:
                check_date = check_date + datetime.timedelta(days=7)

    return repeat_schedule_date_list

