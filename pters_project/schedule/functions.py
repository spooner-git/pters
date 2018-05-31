import datetime
import json
import urllib

import httplib2
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.utils import timezone
from httplib2 import Http

from configs import settings
from login.models import LogTb, PushInfoTb
from schedule.models import GroupLectureTb, ClassLectureTb, LectureTb, ScheduleTb, GroupTb, MemberLectureTb, \
    MemberClassTb, ClassTb


# 1:1 Lecture Id 조회
def func_get_lecture_id(class_id, member_id):

    lecture_id = None
    # 강좌에 해당하는 수강/회원 정보 가져오기
    lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                 class_tb__use=1,
                                                 lecture_tb__member_id=member_id,
                                                 lecture_tb__state_cd='IP',
                                                 lecture_tb__lecture_avail_count__gt=0,
                                                 lecture_tb__use=1).order_by('lecture_tb__start_date', 'lecture_tb__reg_dt')

    for lecture_info in lecture_data:
        try:
            GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_tb.lecture_id, use=1)
        except ObjectDoesNotExist:
            lecture_id = lecture_info.lecture_tb.lecture_id
            break

    return lecture_id


# 그룹 Lecture Id 조회
def func_get_group_lecture_id(group_id, member_id):

    lecture_id = None

    group_lecture_data = GroupLectureTb.objects.filter(group_tb_id=group_id,
                                                       group_tb__use=1,
                                                       lecture_tb__member_id=member_id,
                                                       lecture_tb__state_cd='IP',
                                                       lecture_tb__lecture_avail_count__gt=0,
                                                       lecture_tb__use=1,
                                                       use=1).order_by('lecture_tb__start_date', 'lecture_tb__reg_dt')

    if len(group_lecture_data) > 0:
        lecture_id = group_lecture_data[0].lecture_tb.lecture_id

    return lecture_id


# 수강정보 - 횟수관련 update
def func_refresh_lecture_count(lecture_id):
    error = None

    if lecture_id is None or lecture_id == '':
        error = '회원 수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id, use=1)

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


def func_check_group_available_member_before(class_id, group_id, group_schedule_id):
    error = None
    group_info = None

    try:
        group_info = GroupTb.objects.get(group_id=group_id)

    except ObjectDoesNotExist:
        error = '그룹 정보를 불러오지 못했습니다.'

    schedule_counter = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                 group_schedule_id=group_schedule_id, use=1).count()
    if schedule_counter == group_info.member_num:
        error = '그룹 허용 인원이 초과되었습니다.'

    return error


def func_check_group_available_member_after(class_id, group_id, group_schedule_id):
    error = None
    group_info = None

    try:
        group_info = GroupTb.objects.get(group_id=group_id)

    except ObjectDoesNotExist:
        error = '그룹 정보를 불러오지 못했습니다.'

    schedule_counter = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                 group_schedule_id=group_schedule_id, use=1).count()
    if schedule_counter > group_info.member_num:
        error = '그룹 허용 인원이 초과되었습니다.'

    return error


# 일정 중복 체크
def func_date_check(class_id, schedule_id, pt_schedule_date, add_start_dt, add_end_dt):
    error = None

    seven_days_ago = add_start_dt - datetime.timedelta(days=2)
    seven_days_after = add_end_dt + datetime.timedelta(days=2)
    schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                              start_dt__gte=seven_days_ago, end_dt__lte=seven_days_after,
                                              use=1).exclude(schedule_id=schedule_id)

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
                                                        lecture_tb__use=1, use=1)
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

    if en_dis_type == '1':
        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                         from_member_name=user_name, to_member_name=member_name,
                         class_tb_id=class_id, lecture_tb_id=lecture_id,
                         log_info='1:1 레슨 '+log_type_name, log_how=log_type_detail,
                         log_detail=str(start_date) + '/' + str(end_date),
                         reg_dt=timezone.now(), use=1)
        log_data.save()
    else:
        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                         from_member_name=user_name,
                         class_tb_id=class_id,
                         log_info='OFF '+log_type_name, log_how=log_type_detail,
                         log_detail=str(start_date) + '/' + str(end_date),
                         reg_dt=timezone.now(), use=1)
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
                                                                 group_tb__use=1,
                                                                 lecture_tb__state_cd='IP',
                                                                 lecture_tb__lecture_avail_count__gt=0,
                                                                 lecture_tb__use=1,
                                                                 use=1).count()

        if group_lecture_data_count == 0:
            error = '그룹에 해당하는 회원들의 예약 가능 횟수가 없습니다.'

    return error


def func_get_group_member_list(group_id):
    member_list = []
    group_lecture_data = GroupLectureTb.objects.filter(group_tb_id=group_id,
                                                       group_tb__group_type_cd='NORMAL',
                                                       group_tb__use=1,
                                                       lecture_tb__state_cd='IP',
                                                       lecture_tb__use=1,
                                                       use=1)

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
                                                       group_tb__use=1,
                                                       lecture_tb__state_cd='IP',
                                                       lecture_tb__use=1,
                                                       lecture_tb__lecture_avail_count__gt=0,
                                                       use=1)

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


def func_get_not_available_group_member_list(group_id):
    member_list = []
    group_lecture_data = GroupLectureTb.objects.filter(group_tb_id=group_id,
                                                       group_tb__group_type_cd='NORMAL',
                                                       group_tb__use=1,
                                                       lecture_tb__lecture_avail_count=0,
                                                       lecture_tb__use=1,
                                                       use=1)

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


def func_send_push_trainer(lecture_id, title, message):
    push_data = []
    if lecture_id is not None and lecture_id != '':
        member_lecture_data = MemberLectureTb.objects.filter(lecture_tb_id=lecture_id, use=1)
        for class_lecture_info in member_lecture_data:
            lecture_info = MemberLectureTb.objects.filter(lecture_tb_id=class_lecture_info.lecture_tb_id,
                                                          auth_cd='VIEW', use=1)
            for lecture_info in lecture_info:
                token_data = PushInfoTb.objects.filter(member_id=lecture_info.member.member_id)
                for token_info in token_data:
                    token_info.badge_counter += 1
                    token_info.save()
                    push_data.append(token_info)

    push_server_id = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')

    for push_info in push_data:

        instance_id = push_info.token
        badge_counter = push_info.badge_counter
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
                                  headers={'Content-Type': 'application/json;', 'Authorization': 'key=' + push_server_id})


def func_send_push_trainee(class_id, title, message):
    push_data = []
    if class_id is not None and class_id != '':

        member_class_data = MemberClassTb.objects.filter(class_tb_id=class_id,auth_cd='VIEW', use=1)

        for member_class_info in member_class_data:

            token_data = PushInfoTb.objects.filter(member_id=member_class_info.member.member_id)
            for token_info in token_data:
                token_info.badge_counter += 1
                token_info.save()
                push_data.append(token_info)

    push_server_id = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')

    for push_info in push_data:

        instance_id = push_info.token
        badge_counter = push_info.badge_counter
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
                                  headers={'Content-Type': 'application/json;', 'Authorization': 'key=' + push_server_id})


def func_get_trainer_schedule(context, class_id, start_date, end_date):

    error = None
    class_info = None
    off_schedule_id = []
    off_schedule_start_datetime = []
    off_schedule_end_datetime = []
    off_schedule_note = []

    pt_schedule_id = []
    pt_schedule_lecture_id = []
    pt_schedule_start_datetime = []
    pt_schedule_end_datetime = []
    pt_schedule_member_name = []
    pt_schedule_member_id = []
    pt_schedule_finish_check = []
    pt_schedule_note = []
    pt_schedule_idx = []
    group_schedule_id = []
    group_schedule_start_datetime = []
    group_schedule_end_datetime = []
    group_schedule_finish_check = []
    group_schedule_note = []
    group_schedule_group_id = []
    group_schedule_name = []
    group_schedule_max_member_num = []
    group_schedule_current_member_num = []

    # 강사 정보 가져오기
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강좌 정보를 불러오지 못했습니다.'

    # OFF 일정 조회
    if error is None:
        off_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                      en_dis_type='0', start_dt__gte=start_date,
                                                      start_dt__lt=end_date)
        for off_schedule_datum in off_schedule_data:
            off_schedule_id.append(off_schedule_datum.schedule_id)
            off_schedule_start_datetime.append(str(off_schedule_datum.start_dt))
            off_schedule_end_datetime.append(str(off_schedule_datum.end_dt))
            if off_schedule_datum.note is None:
                off_schedule_note.append('')
            else:
                off_schedule_note.append(off_schedule_datum.note)

    # PT 일정 조회
    if error is None:
        # 강사에 해당하는 강좌 정보 불러오기
        lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, auth_cd='VIEW', use=1)

        for lecture_datum_info in lecture_data:
            lecture_datum = lecture_datum_info.lecture_tb
            # 강좌별로 연결되어있는 회원 리스트 불러오기

            if error is None:
                # 강좌별로 연결된 PT 스케쥴 가져오기
                lecture_datum.pt_schedule_data = ScheduleTb.objects.filter(class_tb=class_id,
                                                                           lecture_tb=lecture_datum.lecture_id,
                                                                           en_dis_type='1',
                                                                           start_dt__gte=start_date,
                                                                           start_dt__lt=end_date, use=1).order_by('start_dt')
                # PT 스케쥴 정보 셋팅
                idx = 0
                for pt_schedule_datum in lecture_datum.pt_schedule_data:
                    # lecture schedule id 셋팅
                    idx += 1
                    pt_schedule_id.append(pt_schedule_datum.schedule_id)
                    # lecture schedule 에 해당하는 lecture id 셋팅
                    pt_schedule_lecture_id.append(lecture_datum.lecture_id)
                    pt_schedule_member_name.append(lecture_datum.member.name)
                    pt_schedule_member_id.append(lecture_datum.member.member_id)
                    pt_schedule_start_datetime.append(str(pt_schedule_datum.start_dt))
                    pt_schedule_end_datetime.append(str(pt_schedule_datum.end_dt))
                    pt_schedule_idx.append(idx)

                    if pt_schedule_datum.note is None:
                        pt_schedule_note.append('')
                    else:
                        pt_schedule_note.append(pt_schedule_datum.note)
                    # 끝난 스케쥴인지 확인
                    if pt_schedule_datum.state_cd == 'PE':
                        pt_schedule_finish_check.append(1)
                    else:
                        pt_schedule_finish_check.append(0)

    if error is None:
        # 강좌별로 연결된 그룹 스케쥴 가져오기
        pt_schedule_data = ScheduleTb.objects.filter(class_tb=class_id,
                                                     group_tb__isnull=False,
                                                     lecture_tb__isnull=True,
                                                     en_dis_type='1',
                                                     start_dt__gte=start_date,
                                                     start_dt__lt=end_date, use=1).order_by('start_dt')

        idx = 0
        for pt_schedule_datum in pt_schedule_data:
            # lecture schedule id 셋팅
            idx += 1
            group_schedule_id.append(pt_schedule_datum.schedule_id)
            group_schedule_start_datetime.append(str(pt_schedule_datum.start_dt))
            group_schedule_end_datetime.append(str(pt_schedule_datum.end_dt))
            if pt_schedule_datum.group_tb is not None and pt_schedule_datum.group_tb != '':
                schedule_current_member_num = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                        group_tb_id=pt_schedule_datum.group_tb.group_id,
                                                                        lecture_tb__isnull=False,
                                                                        start_dt=pt_schedule_datum.start_dt,
                                                                        end_dt=pt_schedule_datum.end_dt,
                                                                        use=1).count()
                group_schedule_group_id.append(pt_schedule_datum.group_tb.group_id)
                group_schedule_name.append(pt_schedule_datum.group_tb.name)
                group_schedule_max_member_num.append(pt_schedule_datum.group_tb.member_num)
                group_schedule_current_member_num.append(schedule_current_member_num)

            if pt_schedule_datum.note is None:
                group_schedule_note.append('')
            else:
                group_schedule_note.append(pt_schedule_datum.note)
            # 끝난 스케쥴인지 확인
            if pt_schedule_datum.state_cd == 'PE':
                group_schedule_finish_check.append(1)
            else:
                group_schedule_finish_check.append(0)

    if error is None:
        class_info.schedule_check = 0
        class_info.save()

    context['off_schedule_id'] = off_schedule_id
    context['off_schedule_start_datetime'] = off_schedule_start_datetime
    context['off_schedule_end_datetime'] = off_schedule_end_datetime
    context['off_schedule_note'] = off_schedule_note
    context['pt_schedule_id'] = pt_schedule_id
    context['pt_schedule_lecture_id'] = pt_schedule_lecture_id
    context['pt_schedule_member_name'] = pt_schedule_member_name
    context['pt_schedule_member_id'] = pt_schedule_member_id

    context['pt_schedule_start_datetime'] = pt_schedule_start_datetime
    context['pt_schedule_end_datetime'] = pt_schedule_end_datetime
    context['pt_schedule_finish_check'] = pt_schedule_finish_check
    context['pt_schedule_note'] = pt_schedule_note
    context['pt_schedule_idx'] = pt_schedule_idx
    context['group_schedule_id'] = group_schedule_id
    context['group_schedule_start_datetime'] = group_schedule_start_datetime
    context['group_schedule_end_datetime'] = group_schedule_end_datetime
    context['group_schedule_group_id'] = group_schedule_group_id
    context['group_schedule_name'] = group_schedule_name
    context['group_schedule_max_member_num'] = group_schedule_max_member_num
    context['group_schedule_current_member_num'] = group_schedule_current_member_num
    context['group_schedule_note'] = group_schedule_note
    context['group_schedule_finish_check'] = group_schedule_finish_check

    return context
