import datetime
import collections

from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.db.models import Q
from django.db.models.expressions import RawSQL
from django.utils import timezone

from configs.const import ON_SCHEDULE_TYPE, USE, UN_USE, AUTO_FINISH_OFF, AUTO_FINISH_ON, FROM_TRAINEE_LESSON_ALARM_ON, \
    TO_TRAINEE_LESSON_ALARM_OFF

from login.models import MemberTb, LogTb, CommonCdTb
from schedule.models import ScheduleTb, RepeatScheduleTb
from trainee.models import LectureTb, MemberLectureTb
from .models import ClassLectureTb, GroupLectureTb, GroupTb, ClassTb, SettingTb, PackageGroupTb


# 전체 회원 id 정보 가져오기
def func_get_class_member_id_list(class_id):
    class_lecture_data = ClassLectureTb.objects.select_related(
        'lecture_tb__member__user').filter(class_tb_id=class_id, auth_cd='VIEW',
                                           lecture_tb__use=USE,
                                           use=USE
                                           ).values('lecture_tb__member_id').order_by('lecture_tb__member').distinct()
    return class_lecture_data


# 진행중 회원 id 정보 가져오기
def func_get_class_member_ing_list(class_id, keyword):
    # all_member = []
    class_lecture_data = ClassLectureTb.objects.select_related(
        'lecture_tb__member').filter(Q(lecture_tb__member__name__contains=keyword) |
                                     Q(lecture_tb__member__user__username__contains=keyword),
                                     class_tb_id=class_id, auth_cd='VIEW',
                                     lecture_tb__state_cd='IP', lecture_tb__use=USE,
                                     lecture_tb__member__use=USE,
                                     use=USE).values('lecture_tb__member_id').order_by('lecture_tb__member').distinct()

    return class_lecture_data


# 종료된 회원 id 정보 가져오기
def func_get_class_member_end_list(class_id, keyword):
    query_ip_lecture_count = "select count(*) from LECTURE_TB AS B WHERE B.STATE_CD = \'IP\' " \
                             "and B.MEMBER_ID=" \
                             "(select C.MEMBER_ID from LECTURE_TB as C " \
                             "where C.ID = `CLASS_LECTURE_TB`.`LECTURE_TB_ID`) and B.USE=1 " \
                             "and (select count(*) from CLASS_LECTURE_TB as D " \
                             "where D.CLASS_TB_ID=`CLASS_LECTURE_TB`.`CLASS_TB_ID`" \
                             "and D.LECTURE_TB_ID=B.ID " \
                             "and D.AUTH_CD=\'VIEW\') > 0 "
    class_lecture_data = ClassLectureTb.objects.select_related(
        'lecture_tb__member__user'
    ).filter(Q(lecture_tb__member__name__contains=keyword)|
             Q(lecture_tb__member__user__username__contains=keyword),
             class_tb_id=class_id, auth_cd='VIEW',
             lecture_tb__use=USE, lecture_tb__member__use=USE,
             use=USE
             ).exclude(lecture_tb__state_cd='IP'
                       ).annotate(ip_lecture_count=RawSQL(query_ip_lecture_count, [])
                                  ).filter(ip_lecture_count=0
                                           ).values('lecture_tb__member_id').order_by('lecture_tb__member').distinct()

    return class_lecture_data


# 진행중 회원 리스트 가져오기
def func_get_member_ing_list(class_id, user_id, keyword):

    query_lecture_count = "select count(*) from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID =" \
                          " `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and" \
                          " B.USE=1"

    all_lecture_list = ClassLectureTb.objects.select_related(
        'lecture_tb__package_tb',
        'lecture_tb__member__user').filter(Q(lecture_tb__member__name__contains=keyword) |
                                           Q(lecture_tb__member__user__username__contains=keyword),
                                           class_tb_id=class_id, auth_cd='VIEW',
                                           lecture_tb__state_cd='IP',
                                           lecture_tb__use=USE,
                                           use=USE).annotate(lecture_count=RawSQL(query_lecture_count,
                                                                                  [])).order_by('lecture_tb__member_id',
                                                                                                'lecture_tb__end_date')
    return func_get_member_from_lecture_list(all_lecture_list, user_id)


# 종료된 회원 리스트 가져오기
def func_get_member_end_list(class_id, user_id, keyword):

    query_lecture_count = "select count(*) from MEMBER_LECTURE_TB as A where A.LECTURE_TB_ID =" \
                          " `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and A.AUTH_CD=\'VIEW\' and" \
                          " A.USE=1"
    query_lecture_ip_count = "select count(*) from LECTURE_TB as C where C.MEMBER_ID" \
                             "=(select B.MEMBER_ID from LECTURE_TB as B where B.ID =" \
                             " `CLASS_LECTURE_TB`.`LECTURE_TB_ID`)" \
                             " and " + class_id +\
                             " = (select D.CLASS_TB_ID from CLASS_LECTURE_TB as D" \
                             " where D.LECTURE_TB_ID=C.ID and D.CLASS_TB_ID=" + class_id + ")"\
                             " and C.STATE_CD=\'IP\' and C.USE=1"

    all_lecture_list = ClassLectureTb.objects.select_related(
        'lecture_tb__package_tb',
        'lecture_tb__member__user').filter(~Q(lecture_tb__state_cd='IP'),
                                           Q(lecture_tb__member__name__contains=keyword) |
                                           Q(lecture_tb__member__user__username__contains=keyword),
                                           class_tb_id=class_id, auth_cd='VIEW', lecture_tb__use=USE,
                                           use=USE).annotate(lecture_count=RawSQL(query_lecture_count, []),
                                                             lecture_ip_count=RawSQL(query_lecture_ip_count, [])
                                                             ).filter(lecture_ip_count=0).order_by('lecture_tb__member_id',
                                                                                                   'lecture_tb__end_date')

    return func_get_member_from_lecture_list(all_lecture_list, user_id)


# 회원 리스트 가져오기
def func_get_member_from_lecture_list(all_lecture_list, user_id):
    ordered_member_dict = collections.OrderedDict()
    temp_member_id = None
    lecture_reg_count = 0
    lecture_rem_count = 0
    lecture_avail_count = 0
    start_date = None
    end_date = None

    for lecture_info_data in all_lecture_list:
        lecture_info = lecture_info_data.lecture_tb
        member_info = lecture_info.member
        member_id = str(member_info.member_id)
        if temp_member_id != member_id:
            temp_member_id = member_id
            lecture_reg_count = 0
            lecture_rem_count = 0
            lecture_avail_count = 0
            start_date = None
            end_date = None
        lecture_reg_count += lecture_info.lecture_reg_count
        lecture_rem_count += lecture_info.lecture_rem_count
        lecture_avail_count += lecture_info.lecture_avail_count
        if member_info.reg_info is None or str(member_info.reg_info) != str(user_id):
            if lecture_info_data.lecture_count == 0:
                member_info.sex = ''
                member_info.birthday_dt = ''
                if member_info.phone is None or member_info.phone == '':
                    member_info.phone = ''
                else:
                    member_info.phone = '***-****-' + member_info.phone[7:]
                member_info.user.email = ''

        if start_date is None:
            start_date = lecture_info.start_date
        else:
            if start_date > lecture_info.start_date:
                start_date = lecture_info.start_date
        if end_date is None:
            end_date = lecture_info.end_date
        else:
            if end_date < lecture_info.end_date:
                end_date = lecture_info.end_date

        member_data = {'member_id': member_id,
                       'member_user_id': member_info.user.username,
                       'member_name': member_info.name,
                       'member_phone': member_info.phone,
                       'member_email': member_info.user.email,
                       'member_sex': member_info.sex,
                       'member_birthday_dt': member_info.birthday_dt,
                       'lecture_reg_count': lecture_reg_count,
                       'lecture_rem_count': lecture_rem_count,
                       'lecture_avail_count': lecture_avail_count,
                       'start_date': start_date,
                       'end_date': end_date}

        ordered_member_dict[member_id] = member_data

    member_list = []
    for member_id in ordered_member_dict:
        member_list.append(ordered_member_dict[member_id])

    return member_list


def func_get_member_info(class_id, user_id, member_id):
    member_info = {}
    error = None

    try:
        member = MemberTb.objects.get(member_id=member_id)
    except ObjectDoesNotExist:
        error = '회원 ID를 확인해 주세요.'

    if error is None:
        connection_check = func_check_member_connection_info(class_id, member.member_id)
        if member.reg_info is None or str(member.reg_info) != str(user_id):
            # 연결이 안되어 있는 경우 회원 정보 표시 안함
            if not connection_check:
                member.sex = ''
                member.birthday_dt = ''
                if member.phone is None or member.phone == '':
                    member.phone = ''
                else:
                    member.phone = '***-****-' + member.phone[7:]
                member.user.email = ''

        member_info = {'member_id': member.member_id,
                       'member_name': member.name,
                       'member_phone': member.phone,
                       'member_email': member.user.email,
                       'member_sex': member.sex,
                       'member_birthday_dt': member.birthday_dt,
                       'member_connection_check': connection_check
                       }

    return {'member_info': member_info, 'error': error}


def func_check_member_connection_info(class_id, member_id):
    connection_check = False

    query_member_auth = "select AUTH_CD from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                        "`CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.MEMBER_ID = '" + str(member_id) + \
                        "' and B.USE=1"

    lecture_count = ClassLectureTb.objects.select_related(
        'lecture_tb__member').filter(class_tb_id=class_id,
                                     lecture_tb__member_id=member_id,
                                     lecture_tb__use=USE, auth_cd='VIEW',
                                     use=USE).annotate(member_auth=RawSQL(query_member_auth,
                                                                          [])).filter(member_auth='VIEW').count()
    if lecture_count > 0:
        connection_check = True

    return connection_check


# 회원의 수강권 추가하기
def func_add_lecture_info(user_id, class_id, package_id, counts, price,
                          start_date, end_date, contents, member_id):
    error = None

    try:
        with transaction.atomic():

            auth_cd = 'WAIT'
            member_lecture_counts = ClassLectureTb.objects.select_related(
                'lecture_tb__member').filter(class_tb_id=class_id, lecture_tb__member_id=member_id,
                                             lecture_tb__member_auth_cd='VIEW', use=USE).count()
            if member_lecture_counts > 0:
                auth_cd = 'VIEW'

            lecture_info = LectureTb(member_id=member_id,
                                     package_tb_id=package_id,
                                     lecture_reg_count=counts, lecture_rem_count=counts,
                                     lecture_avail_count=counts, price=price, option_cd='DC',
                                     state_cd='IP',
                                     start_date=start_date, end_date=end_date,
                                     note=contents, member_auth_cd=auth_cd, use=USE)
            lecture_info.save()

            class_lecture_info = ClassLectureTb(class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                                                auth_cd='VIEW', mod_member_id=user_id, use=USE)
            class_lecture_info.save()

            # 고정 회원 등록 확인 필요

            # query_class_count = "select count(*) from CLASS_LECTURE_TB as B where B.LECTURE_TB_ID = " \
            #                     "`GROUP_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and " \
            #                     " B.USE=1"
            #
            # package_group_data = PackageGroupTb.objects.select_related(
            #     'group_tb').filter(package_tb_id=package_id, use=USE)
            # for package_group_info in package_group_data:
            #     group_lecture_counter = GroupLectureTb.objects.filter(
            #         group_tb_id=package_group_info.group_tb_id, lecture_tb__member_id=member_id,
            #         lecture_tb__state_cd='IP', lecture_tb__use=USE, fix_state_cd='FIX',
            #         use=USE).annotate(class_count=RawSQL(query_class_count,
            #                                              [])).filter(class_count__gte=1).count()
            #     if group_lecture_counter > 0:
            #         fix_state_cd = 'FIX'
            #     else:
            #         fix_state_cd = ''
            #     group_lecture_info = GroupLectureTb(group_tb_id=package_group_info.group_tb_id,
            #                                         lecture_tb_id=lecture_info.lecture_id,
            #                                         fix_state_cd=fix_state_cd, use=USE)
            #     group_lecture_info.save()

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
def func_delete_lecture_info(user_id, class_id, lecture_id, member_id):
    error = None
    class_lecture_info = None
    lecture_info = None
    user = None
    member = None

    if error is None:
        try:
            class_lecture_info = ClassLectureTb.objects.get(class_tb_id=class_id, lecture_tb_id=lecture_id, use=USE)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            user = User.objects.get(id=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    if error is None:
        try:
            member = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        package_tb = lecture_info.package_tb
        group_data = GroupLectureTb.objects.filter(lecture_tb_id=lecture_id, use=USE)
        group_data.update(fix_state_cd='')

        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_id,
                                                  state_cd='NP')
        schedule_data_finish = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'), lecture_tb_id=lecture_id)
        repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_id)
        member_lecture_list = MemberLectureTb.objects.filter(lecture_tb_id=lecture_id).exclude(auth_cd='VIEW')
        if user.is_active:
            if len(member_lecture_list) > 0:
                class_lecture_info.delete()
                member_lecture_list.delete()
                schedule_data.delete()
                schedule_data_finish.delete()
                repeat_schedule_data.delete()
                lecture_info.delete()

            else:
                if len(group_data) > 0:
                    group_data.update(use=UN_USE)
                schedule_data.delete()
                schedule_data_finish.update(use=UN_USE)
                class_lecture_info.auth_cd = 'DELETE'
                class_lecture_info.save()
                if lecture_info.lecture_rem_count == lecture_info.lecture_reg_count:
                    lecture_info.delete()
                else:
                    if lecture_info.state_cd == 'IP':
                        lecture_info.state_cd = 'PE'
                        lecture_info.lecture_avail_count = 0
                        lecture_info.lecture_rem_count = 0
                        # 굳이 UN_USE로 바꿀 필요 없을듯
                        # lecture_info.use = UN_USE
                        lecture_info.save()

        else:
            class_lecture_info.delete()
            member_lecture_list.delete()
            schedule_data.delete()
            schedule_data_finish.delete()
            repeat_schedule_data.delete()
            lecture_info.delete()
            # 회원의 수강정보가 더이상 없는경우

            if member.reg_info is not None:
                if str(member.reg_info) == str(user_id):
                    member_lecture_list_confirm = MemberLectureTb.objects.filter(member_id=user.id).count()
                    if member_lecture_list_confirm == 0:
                        member.delete()
                        user.delete()

    return error


# 강사의 셋팅 정보 가져오기
def func_get_trainer_setting_list(context, user_id, class_id):
    today = datetime.date.today()
    lt_res_01 = '00:00-23:59'
    lt_res_02 = 0
    lt_res_03 = '0'
    lt_res_04 = '00:00-23:59'
    lt_work_sun_time_avail = ''
    lt_work_mon_time_avail = ''
    lt_work_tue_time_avail = ''
    lt_work_wed_time_avail = ''
    lt_work_ths_time_avail = ''
    lt_work_fri_time_avail = ''
    lt_work_sat_time_avail = ''
    lt_res_05 = '7'
    lt_res_cancel_time = -1
    lt_res_enable_time = -1
    lt_res_member_time_duration = 1
    lt_res_member_start_time = 'A-0'
    lt_schedule_auto_finish = AUTO_FINISH_OFF
    lt_lecture_auto_finish = AUTO_FINISH_OFF
    lt_lan_01 = 'KOR'
    lt_pus_to_trainee_lesson_alarm = TO_TRAINEE_LESSON_ALARM_OFF
    lt_pus_from_trainee_lesson_alarm = FROM_TRAINEE_LESSON_ALARM_ON
    setting_admin_password = '0000'
    avail_date_list = []
    setting_data = SettingTb.objects.filter(member_id=user_id, class_tb_id=class_id, use=USE)

    for setting_info in setting_data:
        if setting_info.setting_type_cd == 'LT_RES_01':
            lt_res_01 = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_RES_02':
            lt_res_02 = int(setting_info.setting_info)
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
        if setting_info.setting_type_cd == 'LT_RES_MEMBER_TIME_DURATION':
            lt_res_member_time_duration = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_RES_MEMBER_START_TIME':
            lt_res_member_start_time = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_SCHEDULE_AUTO_FINISH':
            lt_schedule_auto_finish = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_LECTURE_AUTO_FINISH':
            lt_lecture_auto_finish = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_LAN_01':
            lt_lan_01 = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_PUS_TO_TRAINEE_LESSON_ALARM':
            lt_pus_to_trainee_lesson_alarm = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_PUS_FROM_TRAINEE_LESSON_ALARM':
            lt_pus_from_trainee_lesson_alarm = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_ADMIN_PASSWORD':
            setting_admin_password = setting_info.setting_info

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

    context['avail_date_data'] = avail_date_list
    context['lt_res_01'] = lt_res_01
    context['lt_res_02'] = lt_res_02
    context['lt_res_03'] = lt_res_03
    context['lt_res_04'] = lt_res_04
    context['lt_work_sun_time_avail'] = lt_work_sun_time_avail
    context['lt_work_mon_time_avail'] = lt_work_mon_time_avail
    context['lt_work_tue_time_avail'] = lt_work_tue_time_avail
    context['lt_work_wed_time_avail'] = lt_work_wed_time_avail
    context['lt_work_ths_time_avail'] = lt_work_ths_time_avail
    context['lt_work_fri_time_avail'] = lt_work_fri_time_avail
    context['lt_work_sat_time_avail'] = lt_work_sat_time_avail
    context['lt_res_05'] = lt_res_05
    context['lt_lan_01'] = lt_lan_01
    context['lt_res_enable_time'] = lt_res_enable_time
    context['lt_res_cancel_time'] = lt_res_cancel_time
    context['lt_res_member_time_duration'] = lt_res_member_time_duration
    context['lt_res_member_start_time'] = lt_res_member_start_time
    context['lt_schedule_auto_finish'] = lt_schedule_auto_finish
    context['lt_lecture_auto_finish'] = lt_lecture_auto_finish
    context['lt_pus_to_trainee_lesson_alarm'] = lt_pus_to_trainee_lesson_alarm
    context['lt_pus_from_trainee_lesson_alarm'] = lt_pus_from_trainee_lesson_alarm
    context['setting_admin_password'] = setting_admin_password

    return context
