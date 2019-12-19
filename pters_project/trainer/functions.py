import collections
import datetime

import boto3
from awscli.errorhandler import ClientError
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.db.models import Q
from django.db.models.expressions import RawSQL

from configs.const import USE, UN_USE, AUTO_FINISH_OFF, FROM_TRAINEE_LESSON_ALARM_ON, \
    TO_TRAINEE_LESSON_ALARM_OFF, AUTH_TYPE_VIEW, AUTH_TYPE_WAIT, STATE_CD_IN_PROGRESS, STATE_CD_FINISH,\
    STATE_CD_ABSENCE, AUTH_TYPE_DELETE, STATE_CD_NOT_PROGRESS, SHOW, CALENDAR_TIME_SELECTOR_BASIC, \
    LECTURE_TYPE_ONE_TO_ONE, ING_MEMBER_TRUE, ING_MEMBER_FALSE

from login.models import MemberTb
from schedule.models import ScheduleTb, RepeatScheduleTb
from trainee.models import MemberTicketTb
from .models import ClassMemberTicketTb, LectureTb, SettingTb, TicketLectureTb, TicketTb, LectureMemberTb, MemberClassTb
from configs import settings

# 전체 회원 id 정보 가져오기
def func_get_class_member_id_list(class_id):
    class_member_ticket_data = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__member__user'
    ).filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__use=USE,
             use=USE).values('member_ticket_tb__member_id').order_by('member_ticket_tb__member_id').distinct()

    return class_member_ticket_data


# 진행중 회원 id 정보 가져오기
def func_get_class_member_ing_list(class_id, keyword):
    # all_member = []
    class_member_ticket_data = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__member'
    ).filter(Q(member_ticket_tb__member__name__contains=keyword) |
             Q(member_ticket_tb__member__user__username__contains=keyword),
             class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
             member_ticket_tb__use=USE, member_ticket_tb__member__use=USE,
             use=USE).values('member_ticket_tb__member_id').order_by('member_ticket_tb__member_id').distinct()

    return class_member_ticket_data


# 종료된 회원 id 정보 가져오기
def func_get_class_member_end_list(class_id, keyword):
    query_ip_member_ticket_count = "select count(*) from LECTURE_TB AS B WHERE B.STATE_CD = \'IP\' " \
                                   "and B.MEMBER_ID=" \
                                   "(select C.MEMBER_ID from LECTURE_TB as C " \
                                   "where C.ID = `CLASS_LECTURE_TB`.`LECTURE_TB_ID`) and B.USE=1 " \
                                   "and (select count(*) from CLASS_LECTURE_TB as D " \
                                   "where D.CLASS_TB_ID=`CLASS_LECTURE_TB`.`CLASS_TB_ID`" \
                                   "and D.LECTURE_TB_ID=B.ID " \
                                   "and D.AUTH_CD=\'VIEW\') > 0 "
    class_member_ticket_data = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__member__user'
    ).filter(Q(member_ticket_tb__member__name__contains=keyword) |
             Q(member_ticket_tb__member__user__username__contains=keyword),
             class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW,
             member_ticket_tb__use=USE, member_ticket_tb__member__use=USE,
             use=USE
             ).exclude(member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS
                       ).annotate(ip_lecture_count=RawSQL(query_ip_member_ticket_count, [])
                                  ).filter(ip_lecture_count=0
                                           ).values('member_ticket_tb__member_id'
                                                    ).order_by('member_ticket_tb__member_id').distinct()

    return class_member_ticket_data


# 진행중 회원 리스트 가져오기
def func_get_member_ing_list(class_id, user_id, keyword):

    all_member_ticket_list = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__ticket_tb',
        'member_ticket_tb__member__user'
    ).filter(Q(member_ticket_tb__member__name__contains=keyword) |
             Q(member_ticket_tb__member__user__username__contains=keyword),
             class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
             member_ticket_tb__use=USE, use=USE).order_by('member_ticket_tb__member_id', 'member_ticket_tb__end_date')

    return func_get_member_from_member_ticket_list(all_member_ticket_list, None, user_id)


# 종료된 회원 리스트 가져오기
def func_get_member_end_list(class_id, user_id, keyword):

    query_ip_member_ticket_count = "select count(*) from LECTURE_TB as C where C.MEMBER_ID" \
                                   " =(select B.MEMBER_ID from LECTURE_TB as B where B.ID =" \
                                   " `CLASS_LECTURE_TB`.`LECTURE_TB_ID`)" \
                                   " and " + str(class_id) +\
                                   " = (select D.CLASS_TB_ID from CLASS_LECTURE_TB as D" \
                                   " where D.LECTURE_TB_ID=C.ID and D.CLASS_TB_ID=" + str(class_id) + ")" \
                                   " and C.STATE_CD=\'IP\' and C.USE=1"

    all_member_ticket_list = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__ticket_tb',
        'member_ticket_tb__member__user').filter(
        ~Q(member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS),
        Q(member_ticket_tb__member__name__contains=keyword) |
        Q(member_ticket_tb__member__user__username__contains=keyword),
        class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__use=USE,
        use=USE).annotate(member_ticket_ip_count=RawSQL(query_ip_member_ticket_count, [])
                          ).filter(member_ticket_ip_count=0).order_by('member_ticket_tb__member_id',
                                                                      'member_ticket_tb__end_date')

    return func_get_member_from_member_ticket_list(all_member_ticket_list, None, user_id)


# 진행중 회원 여부 확인
def func_get_member_ing_check(class_id, member_id):

    all_member_ticket_list = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__ticket_tb',
        'member_ticket_tb__member__user'
    ).filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__member_id=member_id,
             member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
             member_ticket_tb__use=USE, use=USE).order_by('member_ticket_tb__member_id', 'member_ticket_tb__end_date')

    return len(all_member_ticket_list)


# 회원 리스트 가져오기
def func_get_member_from_member_ticket_list(all_member_ticket_list, lecture_id, user_id):
    ordered_member_dict = collections.OrderedDict()
    temp_member_id = None
    member_ticket_reg_count = 0
    member_ticket_rem_count = 0
    member_ticket_avail_count = 0
    start_date = None
    end_date = None
    lecture_member_data = None

    if lecture_id is not None:
        lecture_member_data = LectureMemberTb.objects.filter(lecture_tb_id=lecture_id, use=USE)

    if all_member_ticket_list is not None:
        for all_member_ticket_info in all_member_ticket_list:
            member_ticket_info = all_member_ticket_info.member_ticket_tb
            member_info = member_ticket_info.member
            member_id = str(member_info.member_id)
            fix_state_cd = ''

            if temp_member_id != member_id:
                temp_member_id = member_id
                member_ticket_reg_count = 0
                member_ticket_rem_count = 0
                member_ticket_avail_count = 0
                start_date = None
                end_date = None
            member_ticket_reg_count += member_ticket_info.member_ticket_reg_count
            member_ticket_rem_count += member_ticket_info.member_ticket_rem_count
            member_ticket_avail_count += member_ticket_info.member_ticket_avail_count
            if member_info.reg_info is None or str(member_info.reg_info) != str(user_id):
                if member_ticket_info.member_auth_cd != AUTH_TYPE_VIEW:
                    member_info.sex = ''
                    member_info.birthday_dt = ''
                    if member_info.phone is None or member_info.phone == '':
                        member_info.phone = ''
                    else:
                        member_info.phone = '***-****-' + member_info.phone[7:]
                    member_info.user.email = ''
                    member_info.profile_url = '/static/common/icon/icon_account.png'
            if member_info.profile_url is None or member_info.profile_url == '':
                member_info.profile_url = '/static/common/icon/icon_account.png'
            if start_date is None:
                start_date = member_ticket_info.start_date
            else:
                if start_date > member_ticket_info.start_date:
                    start_date = member_ticket_info.start_date
            if end_date is None:
                end_date = member_ticket_info.end_date
            else:
                if end_date < member_ticket_info.end_date:
                    end_date = member_ticket_info.end_date

            if lecture_member_data is not None:
                for lecture_member_info in lecture_member_data:
                    if str(lecture_member_info.member_id) == member_id:
                        fix_state_cd = lecture_member_info.fix_state_cd

            member_data = {'member_id': member_id,
                           'member_user_id': member_info.user.username,
                           'member_name': member_info.name,
                           'member_phone': str(member_info.phone),
                           'member_email': str(member_info.user.email),
                           'member_sex': str(member_info.sex),
                           'member_profile_url': member_info.profile_url,
                           'member_birthday_dt': str(member_info.birthday_dt),
                           'member_ticket_reg_count': member_ticket_reg_count,
                           'member_ticket_rem_count': member_ticket_rem_count,
                           'member_ticket_avail_count': member_ticket_avail_count,
                           'member_fix_state_cd': fix_state_cd,
                           'start_date': str(start_date),
                           'end_date': str(end_date)}

            ordered_member_dict[member_id] = member_data

    member_list = []
    for member_id in ordered_member_dict:
        member_list.append(ordered_member_dict[member_id])

    return member_list


def func_get_trainer_info(class_id, member_id):
    member_info = {}
    error = None
    member = None

    try:
        member = MemberTb.objects.get(member_id=member_id)
    except ObjectDoesNotExist:
        error = '회원 ID를 확인해 주세요.'

    if error is None:
        auth_cd = func_check_trainer_connection_info(class_id, member_id)
        # 연결이 안되어 있는 경우 회원 정보 표시 안함
        if str(auth_cd) != str(AUTH_TYPE_VIEW):
            member.sex = ''
            member.birthday_dt = ''
            if member.phone is None or member.phone == '':
                member.phone = ''
            else:
                member.phone = '*******' + member.phone[7:]
            member.user.email = ''
            member.profile_url = '/static/common/icon/icon_account.png'
        if member.profile_url is None or member.profile_url == '':
            member.profile_url = '/static/common/icon/icon_account.png'

        member_info = {'member_id': str(member.member_id),
                       'member_user_id': member.user.username,
                       'member_name': member.name,
                       'member_phone': str(member.phone),
                       'member_email': str(member.user.email),
                       'member_sex': str(member.sex),
                       'member_birthday_dt': str(member.birthday_dt),
                       'member_profile_url': member.profile_url,
                       'auth_cd': auth_cd
                       }

    return {'member_info': member_info, 'error': error}


def func_get_member_info(class_id, user_id, member_id):
    member_info = {}
    error = None
    member = None

    try:
        member = MemberTb.objects.get(member_id=member_id)
    except ObjectDoesNotExist:
        error = '회원 ID를 확인해 주세요.'

    if error is None:
        connection_check = func_check_member_connection_info(class_id, member_id)
        if member.reg_info is None or str(member.reg_info) != str(user_id):
            # 연결이 안되어 있는 경우 회원 정보 표시 안함
            if connection_check != 2:
                member.sex = ''
                member.birthday_dt = ''
                if member.phone is None or member.phone == '':
                    member.phone = ''
                else:
                    member.phone = '*******' + member.phone[7:]
                member.user.email = ''
                member.profile_url = '/static/common/icon/icon_account.png'
        if member.profile_url is None or member.profile_url == '':
            member.profile_url = '/static/common/icon/icon_account.png'

        ing_member_check = func_get_member_ing_check(class_id, member_id)
        if ing_member_check > 0:
            ing_member_check = ING_MEMBER_TRUE
        else:
            ing_member_check = ING_MEMBER_FALSE

        member_info = {'member_id': str(member.member_id),
                       'member_user_id': member.user.username,
                       'member_name': member.name,
                       'member_phone': str(member.phone),
                       'member_email': str(member.user.email),
                       'member_sex': str(member.sex),
                       'member_birthday_dt': str(member.birthday_dt),
                       'member_connection_check': connection_check,
                       'member_is_active': str(member.user.is_active),
                       'member_profile_url': member.profile_url,
                       'ing_member_check': ing_member_check
                       }

    return {'member_info': member_info, 'error': error}


def func_check_member_connection_info(class_id, member_id):
    connection_check = 0

    view_lecture_count = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__member').filter(class_tb_id=class_id,
                                           member_ticket_tb__member_id=member_id,
                                           member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW,
                                           member_ticket_tb__use=USE, auth_cd=AUTH_TYPE_VIEW,
                                           use=USE).count()
    wait_lecture_count = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__member').filter(class_tb_id=class_id,
                                           member_ticket_tb__member_id=member_id,
                                           member_ticket_tb__member_auth_cd=AUTH_TYPE_WAIT,
                                           member_ticket_tb__use=USE, auth_cd=AUTH_TYPE_VIEW,
                                           use=USE).count()
    if view_lecture_count > 0:
        connection_check = 2
    else:
        if wait_lecture_count > 0:
            connection_check = 1

    return connection_check


def func_check_trainer_connection_info(class_id, trainer_id):
    connection_check = AUTH_TYPE_DELETE

    view_lecture_count = MemberClassTb.objects.select_related(
        'class_tb', 'member').filter(class_tb_id=class_id, member_id=trainer_id, auth_cd=AUTH_TYPE_VIEW,
                                     use=USE).count()
    wait_lecture_count = MemberClassTb.objects.select_related(
        'class_tb', 'member').filter(class_tb_id=class_id, member_id=trainer_id, auth_cd=AUTH_TYPE_WAIT,
                                     use=USE).count()
    if view_lecture_count > 0:
        connection_check = AUTH_TYPE_VIEW
    else:
        if wait_lecture_count > 0:
            connection_check = AUTH_TYPE_WAIT

    return connection_check


# 회원의 수업정보 리스트 불러오기
def func_get_member_lecture_list(class_id, member_id):
    member_lecture_list = collections.OrderedDict()
    member_ticket_data = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__ticket_tb').filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW,
                                              member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
                                              member_ticket_tb__member_id=member_id,
                                              member_ticket_tb__use=USE,
                                              use=USE).order_by('-member_ticket_tb__start_date',
                                                                '-member_ticket_tb__reg_dt')

    if len(member_ticket_data) > 0:
        query_ticket_list = Q()

        for member_ticket_info in member_ticket_data:
            ticket_info = member_ticket_info.member_ticket_tb.ticket_tb
            query_ticket_list |= Q(ticket_tb_id=ticket_info.ticket_id)
        ticket_lecture_data = TicketLectureTb.objects.select_related(
            'lecture_tb').filter(query_ticket_list, class_tb_id=class_id, lecture_tb__state_cd=STATE_CD_IN_PROGRESS,
                                 use=USE)

        for ticket_lecture_info in ticket_lecture_data:
            lecture_tb = ticket_lecture_info.lecture_tb
            lecture_info = {'lecture_id': str(lecture_tb.lecture_id),
                            'lecture_name': lecture_tb.name,
                            'lecture_note': lecture_tb.note,
                            'lecture_max_num': lecture_tb.member_num,
                            'lecture_minute': lecture_tb.lecture_minute
                            }
            member_lecture_list[str(lecture_tb.lecture_id)] = lecture_info

    return member_lecture_list


# 회원의 수강정보 불러오기
def func_get_member_ticket_info(class_id, member_ticket_id):
    member_ticket_list = collections.OrderedDict()

    ticket_data = TicketTb.objects.filter(class_tb_id=class_id, use=USE).order_by('ticket_id')
    ticket_lecture_data = TicketLectureTb.objects.select_related(
        'ticket_tb', 'lecture_tb').filter(class_tb_id=class_id, ticket_tb__use=USE,
                                          use=USE).order_by('ticket_tb_id', 'lecture_tb__state_cd', 'lecture_tb_id')

    ticket_data_dict = {}
    for ticket_lecture_info in ticket_lecture_data:
        ticket_tb = ticket_lecture_info.ticket_tb
        lecture_tb = ticket_lecture_info.lecture_tb
        ticket_id = str(ticket_tb.ticket_id)
        try:
            ticket_data_dict[ticket_id]
        except KeyError:
            ticket_data_dict[ticket_id] = {'ticket_lecture_list': [],
                                           'ticket_lecture_state_cd_list': [],
                                           'ticket_lecture_id_list': [],
                                           'ticket_lecture_ing_color_cd_list': [],
                                           'ticket_lecture_ing_font_color_cd_list': [],
                                           'ticket_lecture_end_color_cd_list': [],
                                           'ticket_lecture_end_font_color_cd_list': []}
        if lecture_tb.use == USE:
            ticket_data_dict[ticket_id]['ticket_lecture_list'].append(lecture_tb.name)
            ticket_data_dict[ticket_id]['ticket_lecture_state_cd_list'].append(lecture_tb.state_cd)
            ticket_data_dict[ticket_id]['ticket_lecture_id_list'].append(lecture_tb.lecture_id)
            ticket_data_dict[ticket_id]['ticket_lecture_ing_color_cd_list'].append(lecture_tb.ing_color_cd)
            ticket_data_dict[ticket_id]['ticket_lecture_ing_font_color_cd_list'].append(lecture_tb.ing_font_color_cd)
            ticket_data_dict[ticket_id]['ticket_lecture_end_color_cd_list'].append(lecture_tb.end_color_cd)
            ticket_data_dict[ticket_id]['ticket_lecture_end_font_color_cd_list'].append(lecture_tb.end_font_color_cd)

    if len(ticket_data) != len(ticket_data_dict):
        for ticket_info in ticket_data:
            ticket_id = str(ticket_info.ticket_id)
            try:
                ticket_data_dict[ticket_id]
            except KeyError:
                ticket_data_dict[ticket_id] = {'ticket_lecture_list': [],
                                               'ticket_lecture_state_cd_list': [],
                                               'ticket_lecture_id_list': [],
                                               'ticket_lecture_ing_color_cd_list': [],
                                               'ticket_lecture_ing_font_color_cd_list': [],
                                               'ticket_lecture_end_color_cd_list': [],
                                               'ticket_lecture_end_font_color_cd_list': []}

    member_ticket_data = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__ticket_tb').filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW,
                                              member_ticket_tb_id=member_ticket_id,
                                              member_ticket_tb__use=USE,
                                              member_ticket_tb__ticket_tb__use=USE,
                                              use=USE).order_by('-member_ticket_tb__start_date',
                                                                '-member_ticket_tb__reg_dt')
    for member_ticket_info in member_ticket_data:
        member_ticket_tb = member_ticket_info.member_ticket_tb
        ticket_tb = member_ticket_tb.ticket_tb
        if '\r\n' in member_ticket_tb.note:
            member_ticket_tb.note = member_ticket_tb.note.replace('\r\n', ' ')
        ticket_id = str(ticket_tb.ticket_id)
        member_ticket_info = {'member_ticket_id': str(member_ticket_tb.member_ticket_id),
                              'member_ticket_name': ticket_tb.name,
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
                              'member_ticket_month_schedule_enable': str(member_ticket_tb.ticket_tb.month_schedule_enable),
                              'member_ticket_week_schedule_enable': str(member_ticket_tb.ticket_tb.week_schedule_enable),
                              'member_ticket_day_schedule_enable': str(member_ticket_tb.ticket_tb.day_schedule_enable),
                              'ticket_id': ticket_id,
                              'ticket_effective_days': ticket_tb.effective_days,
                              'ticket_state_cd': ticket_tb.state_cd,
                              'ticket_lecture_list':
                                  ticket_data_dict[ticket_id]['ticket_lecture_list'],
                              'ticket_lecture_state_cd_list':
                                  ticket_data_dict[ticket_id]['ticket_lecture_state_cd_list'],
                              'ticket_lecture_id_list':
                                  ticket_data_dict[ticket_id]['ticket_lecture_id_list'],
                              'ticket_lecture_ing_color_cd_list':
                                  ticket_data_dict[ticket_id]['ticket_lecture_ing_color_cd_list'],
                              'ticket_lecture_ing_font_color_cd_list':
                                  ticket_data_dict[ticket_id]['ticket_lecture_ing_font_color_cd_list'],
                              'ticket_lecture_end_color_cd_list':
                                  ticket_data_dict[ticket_id]['ticket_lecture_end_color_cd_list'],
                              'ticket_lecture_end_font_color_cd_list':
                                  ticket_data_dict[ticket_id]['ticket_lecture_end_font_color_cd_list']
                              }
        member_ticket_list[str(member_ticket_tb.member_ticket_id)] = member_ticket_info
    return member_ticket_list


# 회원의 수강정보 리스트 불러오기
def func_get_member_ticket_list(class_id, member_id):
    member_ticket_list = collections.OrderedDict()

    ticket_data = TicketTb.objects.filter(class_tb_id=class_id, use=USE).order_by('ticket_id')
    ticket_lecture_data = TicketLectureTb.objects.select_related(
        'ticket_tb', 'lecture_tb').filter(class_tb_id=class_id, ticket_tb__use=USE,
                                          use=USE).order_by('ticket_tb_id', 'lecture_tb__state_cd', 'lecture_tb_id')

    ticket_data_dict = {}
    for ticket_lecture_info in ticket_lecture_data:
        ticket_tb = ticket_lecture_info.ticket_tb
        lecture_tb = ticket_lecture_info.lecture_tb
        ticket_id = str(ticket_tb.ticket_id)
        try:
            ticket_data_dict[ticket_id]
        except KeyError:
            ticket_data_dict[ticket_id] = {'ticket_lecture_list': [],
                                           'ticket_lecture_state_cd_list': [],
                                           'ticket_lecture_id_list': [],
                                           'ticket_lecture_ing_color_cd_list': [],
                                           'ticket_lecture_ing_font_color_cd_list': [],
                                           'ticket_lecture_end_color_cd_list': [],
                                           'ticket_lecture_end_font_color_cd_list': []}
        if lecture_tb.use == USE:
            ticket_data_dict[ticket_id]['ticket_lecture_list'].append(lecture_tb.name)
            ticket_data_dict[ticket_id]['ticket_lecture_state_cd_list'].append(lecture_tb.state_cd)
            ticket_data_dict[ticket_id]['ticket_lecture_id_list'].append(lecture_tb.lecture_id)
            ticket_data_dict[ticket_id]['ticket_lecture_ing_color_cd_list'].append(lecture_tb.ing_color_cd)
            ticket_data_dict[ticket_id]['ticket_lecture_ing_font_color_cd_list'].append(lecture_tb.ing_font_color_cd)
            ticket_data_dict[ticket_id]['ticket_lecture_end_color_cd_list'].append(lecture_tb.end_color_cd)
            ticket_data_dict[ticket_id]['ticket_lecture_end_font_color_cd_list'].append(lecture_tb.end_font_color_cd)

    if len(ticket_data) != len(ticket_data_dict):
        for ticket_info in ticket_data:
            ticket_id = str(ticket_info.ticket_id)
            try:
                ticket_data_dict[ticket_id]
            except KeyError:
                ticket_data_dict[ticket_id] = {'ticket_lecture_list': [],
                                               'ticket_lecture_state_cd_list': [],
                                               'ticket_lecture_id_list': [],
                                               'ticket_lecture_ing_color_cd_list': [],
                                               'ticket_lecture_ing_font_color_cd_list': [],
                                               'ticket_lecture_end_color_cd_list': [],
                                               'ticket_lecture_end_font_color_cd_list': []}

    member_ticket_data = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__ticket_tb').filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW,
                                              member_ticket_tb__member_id=member_id,
                                              member_ticket_tb__use=USE,
                                              member_ticket_tb__ticket_tb__use=USE,
                                              use=USE).order_by('-member_ticket_tb__start_date',
                                                                '-member_ticket_tb__reg_dt')
    for member_ticket_info in member_ticket_data:
        member_ticket_tb = member_ticket_info.member_ticket_tb
        ticket_tb = member_ticket_tb.ticket_tb
        if '\r\n' in member_ticket_tb.note:
            member_ticket_tb.note = member_ticket_tb.note.replace('\r\n', ' ')
        ticket_id = str(ticket_tb.ticket_id)
        member_ticket_info = {'member_ticket_id': str(member_ticket_tb.member_ticket_id),
                              'member_ticket_name': ticket_tb.name,
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
                              'member_ticket_reg_dt': str(member_ticket_tb.reg_dt),
                              'member_ticket_month_schedule_enable': str(member_ticket_tb.ticket_tb.month_schedule_enable),
                              'member_ticket_week_schedule_enable': str(member_ticket_tb.ticket_tb.week_schedule_enable),
                              'member_ticket_day_schedule_enable': str(member_ticket_tb.ticket_tb.day_schedule_enable),
                              'ticket_id': ticket_id,
                              'ticket_effective_days': ticket_tb.effective_days,
                              'ticket_state_cd': ticket_tb.state_cd,
                              'ticket_lecture_list':
                                  ticket_data_dict[ticket_id]['ticket_lecture_list'],
                              'ticket_lecture_state_cd_list':
                                  ticket_data_dict[ticket_id]['ticket_lecture_state_cd_list'],
                              'ticket_lecture_id_list':
                                  ticket_data_dict[ticket_id]['ticket_lecture_id_list'],
                              'ticket_lecture_ing_color_cd_list':
                                  ticket_data_dict[ticket_id]['ticket_lecture_ing_color_cd_list'],
                              'ticket_lecture_ing_font_color_cd_list':
                                  ticket_data_dict[ticket_id]['ticket_lecture_ing_font_color_cd_list'],
                              'ticket_lecture_end_color_cd_list':
                                  ticket_data_dict[ticket_id]['ticket_lecture_end_color_cd_list'],
                              'ticket_lecture_end_font_color_cd_list':
                                  ticket_data_dict[ticket_id]['ticket_lecture_end_font_color_cd_list']
                              }
        member_ticket_list[str(member_ticket_tb.member_ticket_id)] = member_ticket_info
    return member_ticket_list


# 회원의 수강권 추가하기
def func_add_member_ticket_info(user_id, class_id, ticket_id, counts, price,
                                start_date, end_date, contents, member_id):
    error = None
    member = None
    try:
        member = MemberTb.objects.get(member_id=member_id)
    except ObjectDoesNotExist:
        error = '회원 정보를 불러오지 못했습니다.'

    try:
        with transaction.atomic():

            auth_cd = AUTH_TYPE_WAIT

            if not member.user.is_active and str(member.reg_info) == str(user_id):
                auth_cd = AUTH_TYPE_VIEW

            member_ticket_counts = ClassMemberTicketTb.objects.select_related(
                'member_ticket_tb__member').filter(class_tb_id=class_id, member_ticket_tb__member_id=member_id,
                                                   member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW, use=USE).count()
            if member_ticket_counts > 0:
                auth_cd = AUTH_TYPE_VIEW

            member_ticket_info = MemberTicketTb(member_id=member_id, ticket_tb_id=ticket_id,
                                                member_ticket_reg_count=counts, member_ticket_rem_count=counts,
                                                member_ticket_avail_count=counts, price=price, option_cd='DC',
                                                state_cd=STATE_CD_IN_PROGRESS, start_date=start_date, end_date=end_date,
                                                note=contents, member_auth_cd=auth_cd, use=USE)
            member_ticket_info.save()

            class_member_ticket_info = ClassMemberTicketTb(class_tb_id=class_id,
                                                           member_ticket_tb_id=member_ticket_info.member_ticket_id,
                                                           auth_cd=AUTH_TYPE_VIEW, mod_member_id=user_id, use=USE)
            class_member_ticket_info.save()

            if error is not None:
                raise InternalError

    except ValueError:
        error = '등록 값에 문제가 있습니다.[1]'
    except IntegrityError:
        error = '등록 값에 문제가 있습니다.[2]'
    except TypeError:
        error = '등록 값에 문제가 있습니다.[3]'
    except ValidationError:
        error = '등록 값에 문제가 있습니다.[4]'
    except InternalError:
        error = error

    return error


# 회원의 수강권 삭제하기
def func_delete_member_ticket_info(user_id, class_id, member_ticket_id):
    error = None
    class_member_ticket_info = None
    try:
        class_member_ticket_info = ClassMemberTicketTb.objects.select_related(
            'member_ticket_tb__member').get(class_tb_id=class_id, member_ticket_tb_id=member_ticket_id,
                                            auth_cd=AUTH_TYPE_VIEW, use=USE)
    except ObjectDoesNotExist:
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id, member_ticket_tb_id=member_ticket_id,
                                                  state_cd=STATE_CD_NOT_PROGRESS, use=USE)
        schedule_data_finish = ScheduleTb.objects.filter(Q(state_cd=STATE_CD_FINISH) | Q(state_cd=STATE_CD_ABSENCE),
                                                         class_tb_id=class_id,
                                                         member_ticket_tb_id=member_ticket_id, use=USE)
        repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                               member_ticket_tb_id=member_ticket_id)

        try:
            with transaction.atomic():
                # 등록된 일정 정리
                if len(schedule_data) > 0:
                    # 예약된 일정 삭제
                    schedule_data.delete()
                if len(repeat_schedule_data) > 0:
                    # 완료된 일정 비활성화
                    schedule_data_finish.update(use=UN_USE)
                if len(repeat_schedule_data) > 0:
                    # 반복일정 삭제
                    repeat_schedule_data.delete()

                # 강사에게 더이상 안보이도록
                class_member_ticket_info.auth_cd = AUTH_TYPE_DELETE
                class_member_ticket_info.mod_member_id = user_id
                class_member_ticket_info.save()
                member_ticket_info = class_member_ticket_info.member_ticket_tb
                if member_ticket_info.state_cd == STATE_CD_IN_PROGRESS:
                    member_ticket_info.member_ticket_avail_count = 0
                    member_ticket_info.state_cd = STATE_CD_FINISH
                    member_ticket_info.save()

        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    return error


# 강사의 셋팅 정보 가져오기
def func_get_trainer_setting_list(context, user_id, class_id, class_hour):
    today = datetime.date.today()
    lt_res_01 = '00:00-24:00'
    lt_res_02 = 0
    lt_res_03 = '0'
    lt_res_04 = '00:00-24:00'
    lt_work_sun_time_avail = '00:00-24:00'
    lt_work_mon_time_avail = '00:00-24:00'
    lt_work_tue_time_avail = '00:00-24:00'
    lt_work_wed_time_avail = '00:00-24:00'
    lt_work_ths_time_avail = '00:00-24:00'
    lt_work_fri_time_avail = '00:00-24:00'
    lt_work_sat_time_avail = '00:00-24:00'
    lt_res_05 = '7'
    lt_res_cancel_time = -1
    lt_res_enable_time = -1
    lt_res_member_start_time = 'A-0'
    lt_schedule_auto_finish = AUTO_FINISH_OFF
    lt_member_ticket_auto_finish = AUTO_FINISH_OFF
    lt_lan_01 = 'KOR'
    lt_pus_to_trainee_lesson_alarm = TO_TRAINEE_LESSON_ALARM_OFF
    lt_pus_from_trainee_lesson_alarm = FROM_TRAINEE_LESSON_ALARM_ON
    setting_admin_password = '0000'
    setting_attend_class_prev_display_time = 0
    setting_attend_class_after_display_time = 0
    avail_date_list = []
    setting_week_start_date = 'SUN'
    setting_holiday_hide = SHOW
    setting_data = SettingTb.objects.filter(class_tb_id=class_id, use=USE)
    setting_calendar_basic_select_time = 60
    setting_calendar_time_selector_type = CALENDAR_TIME_SELECTOR_BASIC
    setting_trainer_statistics_lock = UN_USE
    setting_trainer_attend_mode_out_lock = UN_USE

    for setting_info in setting_data:
        if setting_info.setting_type_cd == 'LT_RES_01':
            lt_res_01 = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_RES_03':
            lt_res_03 = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_RES_04':
            lt_res_04 = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_WORK_SUN_TIME_AVAIL':
            lt_work_sun_time_avail = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_WORK_MON_TIME_AVAIL':
            lt_work_mon_time_avail = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_WORK_TUE_TIME_AVAIL':
            lt_work_tue_time_avail = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_WORK_WED_TIME_AVAIL':
            lt_work_wed_time_avail = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_WORK_THS_TIME_AVAIL':
            lt_work_ths_time_avail = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_WORK_FRI_TIME_AVAIL':
            lt_work_fri_time_avail = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_WORK_SAT_TIME_AVAIL':
            lt_work_sat_time_avail = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_RES_05':
            lt_res_05 = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_RES_CANCEL_TIME':
            lt_res_cancel_time = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_RES_ENABLE_TIME':
            lt_res_enable_time = int(setting_info.setting_info)
        # if setting_info.setting_type_cd == 'LT_RES_MEMBER_TIME_DURATION':
        #     lt_res_member_time_duration = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_RES_MEMBER_START_TIME':
            lt_res_member_start_time = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_SCHEDULE_AUTO_FINISH':
            lt_schedule_auto_finish = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_LECTURE_AUTO_FINISH':
            lt_member_ticket_auto_finish = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_LAN_01':
            lt_lan_01 = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_PUS_TO_TRAINEE_LESSON_ALARM':
            lt_pus_to_trainee_lesson_alarm = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_PUS_FROM_TRAINEE_LESSON_ALARM':
            lt_pus_from_trainee_lesson_alarm = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_ADMIN_PASSWORD':
            setting_admin_password = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_ATTEND_CLASS_PREV_DISPLAY_TIME':
            setting_attend_class_prev_display_time = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_ATTEND_CLASS_AFTER_DISPLAY_TIME':
            setting_attend_class_after_display_time = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_WEEK_START_DATE':
            setting_week_start_date = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_HOLIDAY_HIDE':
            setting_holiday_hide = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_CALENDAR_BASIC_SETTING_TIME':
            setting_calendar_basic_select_time = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_CALENDAR_TIME_SELECTOR_TYPE':
            setting_calendar_time_selector_type = setting_info.setting_info
        if setting_info.setting_type_cd == 'STATISTICS_LOCK':
            setting_trainer_statistics_lock = setting_info.setting_info
        if setting_info.setting_type_cd == 'ATTEND_MODE_OUT_LOCK':
            setting_trainer_attend_mode_out_lock = setting_info.setting_info
    try:
        lecture_info = LectureTb.objects.get(class_tb_id=class_id, lecture_type_cd=LECTURE_TYPE_ONE_TO_ONE, use=USE)
        one_to_one_lecture_time_duration = lecture_info.lecture_minute
    except ObjectDoesNotExist:
        one_to_one_lecture_time_duration = 60

    if lt_res_cancel_time == -1:
        lt_res_cancel_time = lt_res_02*60
    if lt_res_enable_time == -1:
        lt_res_enable_time = lt_res_02*60
    if lt_work_sun_time_avail == '':
        lt_work_sun_time_avail = lt_res_04
    if lt_work_mon_time_avail == '':
        lt_work_mon_time_avail = lt_res_04
    if lt_work_tue_time_avail == '':
        lt_work_tue_time_avail = lt_res_04
    if lt_work_wed_time_avail == '':
        lt_work_wed_time_avail = lt_res_04
    if lt_work_ths_time_avail == '':
        lt_work_ths_time_avail = lt_res_04
    if lt_work_fri_time_avail == '':
        lt_work_fri_time_avail = lt_res_04
    if lt_work_sat_time_avail == '':
        lt_work_sat_time_avail = lt_res_04

    reserve_date_available = int(lt_res_05)
    for i in range(0, reserve_date_available):
        avail_date_list.append(str(today + datetime.timedelta(days=i)))

    # if lt_res_member_time_duration < 10:
    #     lt_res_member_time_duration *= int(class_hour)

    context['avail_date_data'] = avail_date_list
    context['setting_member_reserve_time_available'] = lt_res_01
    context['setting_member_reserve_prohibition'] = lt_res_03
    # context['lt_res_04'] = lt_res_04
    context['setting_trainer_work_sun_time_avail'] = lt_work_sun_time_avail
    context['setting_trainer_work_mon_time_avail'] = lt_work_mon_time_avail
    context['setting_trainer_work_tue_time_avail'] = lt_work_tue_time_avail
    context['setting_trainer_work_wed_time_avail'] = lt_work_wed_time_avail
    context['setting_trainer_work_ths_time_avail'] = lt_work_ths_time_avail
    context['setting_trainer_work_fri_time_avail'] = lt_work_fri_time_avail
    context['setting_trainer_work_sat_time_avail'] = lt_work_sat_time_avail
    context['setting_member_reserve_date_available'] = lt_res_05
    context['setting_member_reserve_enable_time'] = lt_res_enable_time
    context['setting_member_reserve_cancel_time'] = lt_res_cancel_time
    # context['setting_member_time_duration'] = one_to_one_lecture_time_duration
    context['one_to_one_lecture_time_duration'] = one_to_one_lecture_time_duration
    context['setting_member_start_time'] = lt_res_member_start_time
    context['setting_schedule_auto_finish'] = lt_schedule_auto_finish
    context['setting_member_ticket_auto_finish'] = lt_member_ticket_auto_finish
    context['setting_to_trainee_lesson_alarm'] = lt_pus_to_trainee_lesson_alarm
    context['setting_from_trainee_lesson_alarm'] = lt_pus_from_trainee_lesson_alarm
    context['setting_admin_password'] = setting_admin_password
    context['setting_language'] = lt_lan_01
    context['setting_attend_class_prev_display_time'] = setting_attend_class_prev_display_time
    context['setting_attend_class_after_display_time'] = setting_attend_class_after_display_time
    context['setting_week_start_date'] = setting_week_start_date
    context['setting_holiday_hide'] = setting_holiday_hide
    context['setting_calendar_basic_select_time'] = setting_calendar_basic_select_time
    context['setting_calendar_time_selector_type'] = setting_calendar_time_selector_type
    context['setting_trainer_statistics_lock'] = setting_trainer_statistics_lock
    context['setting_trainer_attend_mode_out_lock'] = setting_trainer_attend_mode_out_lock
    return context


def func_get_ticket_info(class_id, ticket_id, user_id):
    ticket_lecture_data = TicketLectureTb.objects.select_related(
        'ticket_tb', 'lecture_tb').filter(ticket_tb_id=ticket_id,
                                          ticket_tb__state_cd=STATE_CD_IN_PROGRESS, ticket_tb__use=USE,
                                          use=USE).order_by('ticket_tb_id', 'lecture_tb__state_cd', 'lecture_tb_id')

    ticket_lecture_list = []
    ticket_lecture_state_cd_list = []
    ticket_lecture_id_list = []
    ticket_lecture_ing_color_cd_list = []
    ticket_lecture_ing_font_color_cd_list = []
    ticket_lecture_end_color_cd_list = []
    ticket_lecture_end_font_color_cd_list = []
    ticket_tb = None
    all_member_ticket_list = None
    ticket_member_num_name = 'ticket_ing_member_num'
    for ticket_lecture_info in ticket_lecture_data:
        ticket_tb = ticket_lecture_info.ticket_tb
        lecture_tb = ticket_lecture_info.lecture_tb
        if lecture_tb.use == USE:
            ticket_lecture_list.append(lecture_tb.name)
            ticket_lecture_state_cd_list.append(lecture_tb.state_cd)
            ticket_lecture_id_list.append(str(lecture_tb.lecture_id))
            ticket_lecture_ing_color_cd_list.append(lecture_tb.ing_color_cd)
            ticket_lecture_ing_font_color_cd_list.append(lecture_tb.ing_font_color_cd)
            ticket_lecture_end_color_cd_list.append(lecture_tb.end_color_cd)
            ticket_lecture_end_font_color_cd_list.append(lecture_tb.end_font_color_cd)

    if ticket_tb is None:
        try:
            ticket_tb = TicketTb.objects.get(ticket_id=ticket_id, use=USE)
        except ObjectDoesNotExist:
            ticket_tb = None

    if ticket_tb.state_cd == STATE_CD_IN_PROGRESS:
        all_member_ticket_list = ClassMemberTicketTb.objects.select_related(
            'member_ticket_tb__ticket_tb',
            'member_ticket_tb__member__user'
        ).filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__ticket_tb_id=ticket_id,
                 member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS, member_ticket_tb__use=USE,
                 use=USE).order_by('member_ticket_tb__member_id',
                                   'member_ticket_tb__end_date')
        ticket_member_num_name = 'ticket_ing_member_num'
    elif ticket_tb.state_cd == STATE_CD_FINISH:

        query_member_ticket_ip_count = "select count(*) from LECTURE_TB as C where C.MEMBER_ID" \
                                       "=(select B.MEMBER_ID from LECTURE_TB as B where B.ID =" \
                                       " `CLASS_LECTURE_TB`.`LECTURE_TB_ID`)" \
                                       " and " + str(class_id) + \
                                       " = (select D.CLASS_TB_ID from CLASS_LECTURE_TB as D" \
                                       " where D.LECTURE_TB_ID=C.ID and D.CLASS_TB_ID=" + str(class_id) + ")" \
                                       " and C.STATE_CD=\'IP\' and C.PACKAGE_TB_ID=" + str(ticket_id) + " and C.USE=1"

        all_member_ticket_list = ClassMemberTicketTb.objects.select_related(
            'member_ticket_tb__ticket_tb',
            'member_ticket_tb__member__user'
        ).filter(~Q(member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS), class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW,
                 member_ticket_tb__ticket_tb_id=ticket_id, member_ticket_tb__use=USE,
                 use=USE).annotate(member_ticket_ip_count=RawSQL(query_member_ticket_ip_count, [])
                                   ).filter(member_ticket_ip_count=0).order_by('member_ticket_tb__member_id',
                                                                               'member_ticket_tb__end_date')
        ticket_member_num_name = 'ticket_end_member_num'
    member_list = func_get_member_from_member_ticket_list(all_member_ticket_list, None, user_id)
    if ticket_tb is not None:
        ticket_info = {'ticket_id': str(ticket_id),
                       'ticket_name': ticket_tb.name,
                       'ticket_note': ticket_tb.note,
                       'ticket_state_cd': ticket_tb.state_cd,
                       'ticket_effective_days': ticket_tb.effective_days,
                       'ticket_price': ticket_tb.price,
                       'ticket_month_schedule_enable': ticket_tb.month_schedule_enable,
                       'ticket_week_schedule_enable': ticket_tb.week_schedule_enable,
                       'ticket_day_schedule_enable': ticket_tb.day_schedule_enable,
                       'ticket_reg_count': ticket_tb.reg_count,
                       'ticket_reg_dt': str(ticket_tb.reg_dt),
                       'ticket_mod_dt': str(ticket_tb.mod_dt),
                       'ticket_lecture_list': ticket_lecture_list,
                       'ticket_lecture_state_cd_list': ticket_lecture_state_cd_list,
                       'ticket_lecture_id_list': ticket_lecture_id_list,
                       'ticket_lecture_ing_color_cd_list': ticket_lecture_ing_color_cd_list,
                       'ticket_lecture_ing_font_color_cd_list': ticket_lecture_ing_font_color_cd_list,
                       'ticket_lecture_end_color_cd_list': ticket_lecture_end_color_cd_list,
                       'ticket_lecture_end_font_color_cd_list': ticket_lecture_end_font_color_cd_list,
                       ticket_member_num_name: len(member_list),
                       'ticket_member_list': member_list}
    else:
        ticket_info = None

    return ticket_info


def func_get_lecture_info(class_id, lecture_id, user_id):
    lecture_ticket_data = TicketLectureTb.objects.select_related(
        'ticket_tb', 'lecture_tb').filter(class_tb_id=class_id, lecture_tb_id=lecture_id,
                                          lecture_tb__state_cd=STATE_CD_IN_PROGRESS, lecture_tb__use=USE,
                                          use=USE).order_by('lecture_tb_id', 'ticket_tb_id')

    query_ticket_list = Q()
    lecture_ticket_list = []
    lecture_ticket_state_cd_list = []
    lecture_ticket_id_list = []
    ticket_in_progress_count = 0

    lecture_tb = None
    all_member_ticket_list = None

    for lecture_ticket_info in lecture_ticket_data:
        lecture_tb = lecture_ticket_info.lecture_tb
        ticket_tb = lecture_ticket_info.ticket_tb
        if ticket_tb.state_cd == STATE_CD_IN_PROGRESS and ticket_tb.use == USE:
            query_ticket_list |= Q(member_ticket_tb__ticket_tb_id=lecture_ticket_info.ticket_tb_id)
            ticket_in_progress_count += 1
        if ticket_tb.use == USE:
            lecture_ticket_list.append(ticket_tb.name)
            lecture_ticket_state_cd_list.append(ticket_tb.state_cd)
            lecture_ticket_id_list.append(str(ticket_tb.ticket_id))

    if ticket_in_progress_count == 0:
        try:
            lecture_tb = LectureTb.objects.get(class_tb_id=class_id, lecture_id=lecture_id)
        except ObjectDoesNotExist:
            lecture_tb = None
    else:
        if lecture_tb.state_cd == STATE_CD_IN_PROGRESS:
            # 수업에 속한 수강권을 가지고 있는 회원들을 가지고 오기 위한 작업
            all_member_ticket_list = ClassMemberTicketTb.objects.select_related(
                'member_ticket_tb__ticket_tb',
                'member_ticket_tb__member').filter(
                query_ticket_list, class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW,
                member_ticket_tb__ticket_tb__state_cd=STATE_CD_IN_PROGRESS, member_ticket_tb__ticket_tb__use=USE,
                member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS, member_ticket_tb__use=USE,
                use=USE).order_by('member_ticket_tb__member_id', 'member_ticket_tb__end_date')

    member_list = func_get_member_from_member_ticket_list(all_member_ticket_list, lecture_id, user_id)

    if lecture_tb is not None:
        lecture_info = {'lecture_id': str(lecture_id), 'lecture_name': lecture_tb.name, 'lecture_note': lecture_tb.note,
                        'lecture_state_cd': lecture_tb.state_cd, 'lecture_max_num': lecture_tb.member_num,
                        'lecture_reg_dt': str(lecture_tb.reg_dt), 'lecture_mod_dt': str(lecture_tb.mod_dt),
                        'lecture_ticket_list': lecture_ticket_list,
                        'lecture_ticket_state_cd_list': lecture_ticket_state_cd_list,
                        'lecture_ticket_id_list': lecture_ticket_id_list,
                        'lecture_ing_member_num': len(member_list),
                        'lecture_ing_color_cd': lecture_tb.ing_color_cd,
                        'lecture_ing_font_color_cd': lecture_tb.ing_font_color_cd,
                        'lecture_end_color_cd': lecture_tb.end_color_cd,
                        'lecture_end_font_color_cd': lecture_tb.end_font_color_cd,
                        'lecture_type_cd': lecture_tb.lecture_type_cd,
                        'lecture_minute': lecture_tb.lecture_minute,
                        'lecture_member_list': member_list}
    else:
        lecture_info = None
    return lecture_info


def func_update_lecture_member_fix_status_cd(class_id, member_id):
    error = None
    member_lecture_list = func_get_member_lecture_list(class_id, member_id)
    member_lecture_fix_data = LectureMemberTb.objects.filter(class_tb_id=class_id,
                                                             member_id=member_id,
                                                             fix_state_cd='FIX', use=USE)

    for member_lecture_fix_info in member_lecture_fix_data:
        try:
            member_lecture_list[member_lecture_fix_info.lecture_tb_id]
        except KeyError:
            member_lecture_fix_info.delete()
    return error


def update_user_setting_data(user_id, setting_type_cd_data, setting_info_data):

    error = None
    try:
        with transaction.atomic():

            for idx, setting_type_cd_info in enumerate(setting_type_cd_data):
                try:
                    setting_data = SettingTb.objects.get(member_id=user_id,
                                                         setting_type_cd=setting_type_cd_info)
                except ObjectDoesNotExist:
                    setting_data = SettingTb(member_id=user_id, setting_type_cd=setting_type_cd_info, use=USE)

                setting_data.setting_info = setting_info_data[idx]
                setting_data.save()

    except ValueError:
        error = '등록 값에 문제가 있습니다.'
    except IntegrityError:
        error = '등록 값에 문제가 있습니다.'
    except TypeError:
        error = '등록 값에 문제가 있습니다.'
    except ValidationError:
        error = '등록 값에 문제가 있습니다.'
    except InternalError:
        error = '등록 값에 문제가 있습니다.'

    return error


def update_program_setting_data(class_id, setting_type_cd_data, setting_info_data):

    error = None
    try:
        with transaction.atomic():

            for idx, setting_type_cd_info in enumerate(setting_type_cd_data):
                try:
                    setting_data = SettingTb.objects.get(class_tb_id=class_id,
                                                         setting_type_cd=setting_type_cd_info)
                except ObjectDoesNotExist:
                    setting_data = SettingTb(class_tb_id=class_id, setting_type_cd=setting_type_cd_info, use=USE)

                setting_data.setting_info = setting_info_data[idx]
                setting_data.save()

    except ValueError:
        error = '등록 값에 문제가 있습니다.'
    except IntegrityError:
        error = '등록 값에 문제가 있습니다.'
    except TypeError:
        error = '등록 값에 문제가 있습니다.'
    except ValidationError:
        error = '등록 값에 문제가 있습니다.'
    except InternalError:
        error = '등록 값에 문제가 있습니다.'

    return error
