import datetime

from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.db.models import Q
from django.db.models.expressions import RawSQL
from django.db.models.functions import Coalesce
from django.utils import timezone

from configs.const import ON_SCHEDULE_TYPE, ADD_SCHEDULE, USE, TO_TRAINEE_LESSON_ALARM_OFF, FROM_TRAINEE_LESSON_ALARM_ON, \
    AUTO_FINISH_OFF

from login.models import CommonCdTb
from schedule.models import ScheduleTb, RepeatScheduleTb, HolidayTb
from trainer.models import ClassTb, ClassLectureTb, GroupLectureTb, SettingTb, PackageGroupTb
from .models import MemberLectureTb


def func_get_holiday_schedule(context, start_date, end_date):

    # holiday = HolidayTb.objects.filter(holiday_dt__gte=start_date, holiday_dt__lt=end_date, use=USE)
    holiday = HolidayTb.objects.filter(use=USE)
    context['holiday'] = holiday

    return context


def func_get_trainee_on_schedule(context, class_id, user_id, start_date, end_date):
    pt_schedule_list = []
    all_schedule_check = 0
    now = timezone.now()
    next_schedule = ''
    query_group_current_member_num \
        = "select count(*) from SCHEDULE_TB as B where B.GROUP_SCHEDULE_ID = `SCHEDULE_TB`.`GROUP_SCHEDULE_ID`"
    query_group_type_cd_name \
        = "select `COMMON_CD_NM` from COMMON_CD_TB as C where C.COMMON_CD = `GROUP_TB`.`GROUP_TYPE_CD`"
    query_member_auth_cd \
        = "select `AUTH_CD` from MEMBER_LECTURE_TB as D" \
          " where D.LECTURE_TB_ID = `SCHEDULE_TB`.`LECTURE_TB_ID` and D.MEMBER_ID = "+str(user_id)
    if start_date is None and end_date is None:
        all_schedule_check = 1

    if all_schedule_check == 0:
        schedule_data = ScheduleTb.objects.select_related(
            'lecture_tb__member', 'group_tb'
        ).filter(class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE,
                 start_dt__gte=start_date, start_dt__lt=end_date,
                 lecture_tb__use=USE
                 ).annotate(group_type_cd_name=RawSQL('IFNULL(( '+query_group_type_cd_name+' ), \'1:1 레슨\')', []),
                            group_current_member_num=RawSQL('IFNULL(('+query_group_current_member_num+' ), 1)', []),
                            member_auth_cd=RawSQL(query_member_auth_cd, [])
                            ).filter(member_auth_cd='VIEW').order_by('start_dt')
        idx1 = 0
        idx2 = 1
        lecture_id = None
        for schedule_info in schedule_data:
            if lecture_id != schedule_info.lecture_tb_id:
                lecture_id = schedule_info.lecture_tb_id
                idx1 += 1
                idx2 = 1
            schedule_info.idx = str(idx1)+'-'+str(idx2)
            pt_schedule_list.append(schedule_info)
            idx2 += 1

            if now <= schedule_info.start_dt:
                if next_schedule == '':
                    next_schedule = schedule_info.start_dt
                else:
                    if next_schedule > schedule_info.start_dt:
                        next_schedule = schedule_info.start_dt
    else:
        query_member_auth_cd \
            = "select `AUTH_CD` from MEMBER_LECTURE_TB as D" \
              " where D.LECTURE_TB_ID = `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and D.MEMBER_ID = " + str(user_id)
        lecture_list = ClassLectureTb.objects.select_related(
            'lecture_tb__member').filter(class_tb_id=class_id,
                                         lecture_tb__member_id=user_id,
                                         lecture_tb__use=USE
                                         ).annotate(member_auth_cd=RawSQL(query_member_auth_cd, [])
                                                    ).filter(member_auth_cd='VIEW').order_by('lecture_tb__start_date',
                                                                                             'lecture_tb__reg_dt')

        idx1 = 0
        for lecture_info in lecture_list:

            idx1 += 1
            idx2 = 1
            schedule_data = ScheduleTb.objects.select_related('lecture_tb__member', 'group_tb'
                                                              ).filter(class_tb_id=class_id,
                                                                       en_dis_type=ON_SCHEDULE_TYPE,
                                                                       lecture_tb_id=lecture_info.lecture_tb_id
                                                                       ).order_by('start_dt')
            for schedule_info in schedule_data:
                schedule_info.idx = str(idx1) + '-' + str(idx2)
                pt_schedule_list.append(schedule_info)
                idx2 += 1

                if now <= schedule_info.start_dt:
                    if next_schedule == '':
                        next_schedule = schedule_info.start_dt
                    else:
                        if next_schedule > schedule_info.start_dt:
                            next_schedule = schedule_info.start_dt

    context['pt_schedule_data'] = pt_schedule_list
    context['next_schedule'] = next_schedule
    return context


def func_get_trainee_group_schedule(context, user_id, class_id, start_date, end_date):
    # 내가 속한 그룹 일정 조회
    query = "select count(*) from SCHEDULE_TB as B where B.GROUP_SCHEDULE_ID = `SCHEDULE_TB`.`ID`" \
            "AND B.STATE_CD !=\'PC\' AND B.USE=1"
    query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `GROUP_TB`.`GROUP_TYPE_CD`"
    query_member_auth_cd \
        = "select count(`LECTURE_TB_ID`) from GROUP_LECTURE_TB as B" \
          " where B.USE=1 and B.GROUP_TB_ID = `SCHEDULE_TB`.`GROUP_TB_ID`" \
          " and (select `STATE_CD` from LECTURE_TB as D WHERE D.ID=B.LECTURE_TB_ID)=\'IP\'" \
          " and (select `AUTH_CD` from MEMBER_LECTURE_TB as C WHERE C.LECTURE_TB_ID = B.LECTURE_TB_ID" \
          " and C.MEMBER_ID= "+str(user_id)+")=\'VIEW\'"

    group_schedule_data = ScheduleTb.objects.select_related(
        'group_tb').filter(class_tb_id=class_id, group_tb__isnull=False,
                           lecture_tb__isnull=True, en_dis_type=ON_SCHEDULE_TYPE,
                           start_dt__gte=start_date,
                           start_dt__lt=end_date
                           ).annotate(group_current_member_num=RawSQL(query, []),
                                      group_type_cd_name=RawSQL(query_type_cd, []),
                                      group_check=RawSQL('IFNULL(('+query_member_auth_cd+' ), 0)', [])
                                      ).filter(group_check__gt=0).order_by('start_dt')

    context['group_schedule_data'] = group_schedule_data

    return context


def func_get_trainee_off_schedule(context, class_id, start_date, end_date):
    # off_schedule_list = []

    # off 스케쥴 전달
    schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                              start_dt__gte=start_date,
                                              start_dt__lt=end_date).exclude(state_cd='PC').order_by('start_dt')

    context['off_schedule_data'] = schedule_data

    return context


def func_get_trainee_on_repeat_schedule(context, user_id, class_id):
    # repeat_schedule_list = []
    query_member_auth_cd \
        = "select `AUTH_CD` from MEMBER_LECTURE_TB as D" \
          " where D.LECTURE_TB_ID = `REPEAT_SCHEDULE_TB`.`LECTURE_TB_ID` and D.MEMBER_ID = "+str(user_id)

    pt_repeat_schedule_data \
        = RepeatScheduleTb.objects.select_related('lecture_tb'
                                                  ).filter(class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE,
                                                           lecture_tb__state_cd='IP',
                                                           lecture_tb__use=USE
                                                           ).annotate(member_auth_cd=RawSQL(query_member_auth_cd, [])
                                                                      ).filter(member_auth_cd='VIEW'
                                                                               ).order_by('lecture_tb__start_date')

    context['repeat_schedule_data'] = pt_repeat_schedule_data

    return context


def func_get_trainee_group_ing_list(class_id, user_id):
    group_list = []
    lecture_data = MemberLectureTb.objects.filter(member_id=user_id,
                                                  lecture_tb__state_cd='IP',
                                                  auth_cd='VIEW',
                                                  use=USE).order_by('-lecture_tb__start_date')

    for lecture_info in lecture_data:
        group_lecture_check = 0
        try:
            group_lecture_info = GroupLectureTb.objects.get(group_tb__state_cd='IP',
                                                            group_tb__class_tb_id=class_id,
                                                            group_tb__use=USE,
                                                            lecture_tb_id=lecture_info.lecture_tb_id, use=USE)
        except ObjectDoesNotExist:
            group_lecture_check = 1

        if group_lecture_check == 0:
            check = 0

            try:
                state_cd_nm = CommonCdTb.objects.get(common_cd=group_lecture_info.group_tb.state_cd)
            except ObjectDoesNotExist:
                state_cd_nm = None

            if state_cd_nm is not None:
                group_lecture_info.group_tb.state_cd_nm = state_cd_nm.common_cd_nm

            if len(group_list) == 0:
                group_list.append(group_lecture_info)

            for group_info in group_list:

                if group_info.group_tb_id == group_lecture_info.group_tb_id:
                    check = 1
            if check == 0:
                group_list.append(group_lecture_info)

    return group_list


def func_get_trainee_lecture_ing_list(class_id, user_id):
    group_list = []
    lecture_data = MemberLectureTb.objects.filter(member_id=user_id,
                                                  lecture_tb__state_cd='IP',
                                                  auth_cd='VIEW',
                                                  use=USE).order_by('-lecture_tb__start_date')

    for lecture_info in lecture_data:
        group_lecture_check = 0
        try:
            group_lecture_info = GroupLectureTb.objects.get(group_tb__state_cd='IP', group_tb__use=USE,
                                                            group_tb__class_tb_id=class_id,
                                                            lecture_tb_id=lecture_info.lecture_tb_id, use=USE)
        except ObjectDoesNotExist:
            group_lecture_check = 1

        if group_lecture_check == 0:
            check = 0

            try:
                state_cd_nm = CommonCdTb.objects.get(common_cd=group_lecture_info.group_tb.state_cd)
            except ObjectDoesNotExist:
                state_cd_nm = None

            if state_cd_nm is not None:
                group_lecture_info.group_tb.state_cd_nm = state_cd_nm.common_cd_nm

            if len(group_list) == 0:
                group_list.append(group_lecture_info)

            for group_info in group_list:

                if group_info.group_tb_id == group_lecture_info.group_tb_id:
                    check = 1
            if check == 0:
                group_list.append(group_lecture_info)

    return group_list


def func_get_class_lecture_count(context, class_id, user_id):
    error = None
    if class_id is None or class_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    lecture_reg_count_sum = 0
    lecture_rem_count_sum = 0
    lecture_avail_count_sum = 0
    group_lecture_reg_count_sum = 0
    group_lecture_rem_count_sum = 0
    group_lecture_avail_count_sum = 0
    class_lecture_reg_count_sum = 0
    class_lecture_rem_count_sum = 0
    class_lecture_avail_count_sum = 0
    lecture_flag = False
    group_lecture_flag = False
    class_lecture_flag = False
    lecture_list = None
    package_data = []

    if error is None:
        # 강사에 해당하는 강좌 정보 불러오기

        query_lecture_count = "select count(*) from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID =" \
                              " `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and" \
                              "(select A.USE from LECTURE_TB as A where A.ID=B.LECTURE_TB_ID)=1 and B.USE=1"

        lecture_list = ClassLectureTb.objects.select_related(
            'lecture_tb__package_tb').filter(class_tb_id=class_id, lecture_tb__member_id=user_id,
                                             lecture_tb__state_cd='IP',
                                             lecture_tb__use=USE).annotate(lecture_count=RawSQL(query_lecture_count, [])
                                                                           ).order_by('lecture_tb__start_date')

    if error is None:
        # 강사 클래스의 반복일정 불러오기
        for lecture_list_info in lecture_list:
            lecture_info = lecture_list_info.lecture_tb

            if lecture_list_info.lecture_count > 0:

                try:
                    lecture_info.package_tb.package_type_cd_name = \
                        CommonCdTb.objects.get(common_cd=lecture_info.package_tb.package_type_cd).common_cd_nm
                except ObjectDoesNotExist:
                    lecture_info.package_tb.package_type_cd_name = ''

                if len(package_data) == 0:
                    package_data.append(lecture_info)
                else:
                    check_flag = 0
                    for package_info in package_data:
                        if package_info.package_tb.package_id == lecture_info.package_tb.package_id:
                            package_info.lecture_reg_count += lecture_info.lecture_reg_count
                            package_info.lecture_rem_count += lecture_info.lecture_rem_count
                            package_info.lecture_avail_count += lecture_info.lecture_avail_count
                        else:
                            check_flag = 1
                    if check_flag == 1:
                        package_data.append(lecture_info)

                group_lecture_data = GroupLectureTb.objects.select_related(
                    'group_tb').filter(group_tb__state_cd='IP', group_tb__use=USE,
                                       lecture_tb_id=lecture_info.lecture_id, use=USE)
                # group_lecture_check = 0
                for group_lecture_info in group_lecture_data:
                    if group_lecture_info.group_tb.group_type_cd == 'NORMAL':
                        group_check = 1
                    elif group_lecture_info.group_tb.group_type_cd == 'EMPTY':
                        group_check = 2
                    else:
                        group_check = 0

                    if group_check == 0:
                        if lecture_info.state_cd == 'IP':
                            lecture_reg_count_sum += lecture_info.lecture_reg_count
                            lecture_rem_count_sum += lecture_info.lecture_rem_count
                            lecture_avail_count_sum += lecture_info.lecture_avail_count
                    else:
                        if lecture_info.state_cd == 'IP':
                            if group_check == 2:
                                class_lecture_reg_count_sum += lecture_info.lecture_reg_count
                                class_lecture_rem_count_sum += lecture_info.lecture_rem_count
                                class_lecture_avail_count_sum += lecture_info.lecture_avail_count
                            else:
                                group_lecture_reg_count_sum += lecture_info.lecture_reg_count
                                group_lecture_rem_count_sum += lecture_info.lecture_rem_count
                                group_lecture_avail_count_sum += lecture_info.lecture_avail_count

    if lecture_reg_count_sum > 0:
        lecture_flag = True
    if group_lecture_reg_count_sum > 0:
        group_lecture_flag = True
    if class_lecture_reg_count_sum > 0:
        class_lecture_flag = True

    context['package_data'] = package_data
    context['lecture_flag'] = lecture_flag
    context['lecture_reg_count'] = lecture_reg_count_sum
    context['lecture_finish_count'] = lecture_reg_count_sum - lecture_rem_count_sum
    context['lecture_avail_count'] = lecture_avail_count_sum
    context['group_lecture_flag'] = group_lecture_flag
    context['class_lecture_flag'] = class_lecture_flag
    context['group_lecture_reg_count'] = group_lecture_reg_count_sum
    context['group_lecture_finish_count'] = group_lecture_reg_count_sum - group_lecture_rem_count_sum
    context['group_lecture_avail_count'] = group_lecture_avail_count_sum
    context['class_lecture_reg_count'] = class_lecture_reg_count_sum
    context['class_lecture_finish_count'] = class_lecture_reg_count_sum - class_lecture_rem_count_sum
    context['class_lecture_avail_count'] = class_lecture_avail_count_sum

    return context


def func_get_lecture_list(context, class_id, member_id, auth_cd):
    error = None
    context['error'] = None
    lecture_counts = 0
    output_lecture_list = []

    if class_id is None or class_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if member_id is None or member_id == '':
        error = '회원 정보를 불러오지 못했습니다.'

    if auth_cd is None or auth_cd == '':
        auth_cd = 'VIEW'
    auth_cd_list = auth_cd.split('/')

    if error is None:
        lecture_list = ClassLectureTb.objects.select_related(
            'lecture_tb__package_tb').filter(class_tb_id=class_id, lecture_tb__member_id=member_id,
                                             lecture_tb__use=USE).order_by('-lecture_tb__start_date',
                                                                           '-lecture_tb__reg_dt')

        for lecture_info in lecture_list:
            lecture_info_data = None
            for auth_cd_info in auth_cd_list:
                try:
                    lecture_info_data = MemberLectureTb.objects.select_related(
                        'lecture_tb', 'member').get(auth_cd=auth_cd_info, member_id=member_id,
                                                    lecture_tb=lecture_info.lecture_tb_id)
                except ObjectDoesNotExist:
                    lecture_info_data = None

                if lecture_info_data is not None:
                    break

            if lecture_info_data is not None:
                lecture_info_data.lecture_tb.start_date = str(lecture_info_data.lecture_tb.start_date)
                lecture_info_data.lecture_tb.end_date = str(lecture_info_data.lecture_tb.end_date)
                lecture_info_data.lecture_tb.mod_dt = str(lecture_info_data.lecture_tb.mod_dt)
                lecture_info_data.lecture_tb.reg_dt = str(lecture_info_data.lecture_tb.reg_dt)
                try:
                    lecture_info_data.auth_cd_name =\
                        CommonCdTb.objects.get(common_cd=lecture_info_data.auth_cd)
                except ObjectDoesNotExist:
                    lecture_info_data.auth_cd_name = ''
                try:
                    lecture_info_data.lecture_tb.state_cd_name = \
                        CommonCdTb.objects.get(common_cd=lecture_info_data.lecture_tb.state_cd)
                except ObjectDoesNotExist:
                    lecture_info_data.lecture_tb.state_cd_name = ''

                lecture_counts += 1

                group_info = None
                group_check = 0
                # try:
                #     group_info = GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_tb_id)
                # except ObjectDoesNotExist:
                #     group_check = 1
                # group_data = GroupLectureTb.objects.filter(lecture_tb_id=lecture_info.lecture_tb_id,
                #                                            package_tb__isnull=True)
                # if len(group_data) > 0:
                #     group_info = group_data[0]
                # else:
                #     group_check = 1
                #
                # if group_check == 0:
                #     lecture_info_data.group_name = group_info.group_tb.name
                #     lecture_info_data.group_type_cd = group_info.group_tb.group_type_cd
                #     lecture_info_data.group_type_cd_name = group_info.group_tb.get_group_type_cd_name()
                #     lecture_info_data.group_member_num = group_info.group_tb.member_num
                #     lecture_info_data.group_note = group_info.group_tb.note
                #     lecture_info_data.group_state_cd = group_info.group_tb.state_cd
                #     lecture_info_data.group_state_cd_name = group_info.group_tb.get_state_cd_name()
                    # try:
                    #     state_cd_nm = CommonCdTb.objects.get(common_cd=group_info.group_tb.state_cd)
                    #     lecture_info_data.group_state_cd_nm = state_cd_nm.common_cd_nm
                    # except ObjectDoesNotExist:
                    #     error = '그룹 정보를 불러오지 못했습니다.'
                lecture_info_data.group_name = lecture_info.lecture_tb.package_tb.name
                lecture_info_data.group_type_cd = lecture_info.lecture_tb.package_tb.package_type_cd
                # lecture_info_data.group_type_cd_name = group_info.group_tb.get_group_type_cd_name()
                try:
                    lecture_info_data.group_type_cd_name = \
                        CommonCdTb.objects.get(common_cd=lecture_info.lecture_tb.package_tb.package_type_cd).common_cd_nm
                except ObjectDoesNotExist:
                    lecture_info_data.group_type_cd_name = ''
                if lecture_info.lecture_tb.package_tb.package_group_num == 1:
                    try:
                        package_group_info = PackageGroupTb.objects.get(
                            package_tb_id=lecture_info.lecture_tb.package_tb_id,
                            group_tb__state_cd='IP', use=USE)
                        lecture_info_data.group_member_num = package_group_info.group_tb.member_num
                    except MultipleObjectsReturned:
                        lecture_info_data.group_member_num = 'x'
                    except ObjectDoesNotExist:
                        lecture_info_data.group_member_num = 'x'
                else:
                    lecture_info_data.group_member_num = 'x'
                lecture_info_data.group_note = lecture_info.lecture_tb.package_tb.note
                lecture_info_data.group_state_cd = lecture_info.lecture_tb.package_tb.state_cd
                # try:
                #     lecture_info_data.group_state_cd_name = \
                #         CommonCdTb.objects.get(common_cd=lecture_info.lecture_tb.package_tb.state_cd).common_cd_nm
                # except ObjectDoesNotExist:
                #     lecture_info_data.group_state_cd_name = ''

                output_lecture_list.append(lecture_info_data)

    context['lecture_data'] = output_lecture_list

    if error is not None:
        context['error'] = error

    return context


def func_get_lecture_connection_list(context, class_id, member_id, auth_cd):
    error = None
    context['error'] = None
    lecture_counts = 0
    output_lecture_list = []

    if class_id is None or class_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if member_id is None or member_id == '':
        error = '회원 정보를 불러오지 못했습니다.'

    if auth_cd is None or auth_cd == '':
        auth_cd = 'VIEW'
    auth_cd_list = auth_cd.split('/')

    if error is None:
        lecture_list = ClassLectureTb.objects.select_related(
            'lecture_tb__package_tb').filter(class_tb_id=class_id, lecture_tb__member_id=member_id,
                                             use=USE).order_by('-lecture_tb__start_date')

        for lecture_info in lecture_list:
            lecture_info_data = None
            for auth_cd_info in auth_cd_list:
                try:
                    lecture_info_data = MemberLectureTb.objects.select_related(
                        'lecture_tb', 'member').get(auth_cd=auth_cd_info, member_id=member_id,
                                                    lecture_tb=lecture_info.lecture_tb_id)
                except ObjectDoesNotExist:
                    lecture_info_data = None

                if lecture_info_data is not None:
                    break

            if lecture_info_data is not None:
                lecture_info_data.lecture_tb.start_date = str(lecture_info_data.lecture_tb.start_date)
                lecture_info_data.lecture_tb.end_date = str(lecture_info_data.lecture_tb.end_date)
                lecture_info_data.lecture_tb.mod_dt = str(lecture_info_data.lecture_tb.mod_dt)
                lecture_info_data.lecture_tb.reg_dt = str(lecture_info_data.lecture_tb.reg_dt)
                try:
                    lecture_info_data.auth_cd_name = CommonCdTb.objects.get(common_cd=lecture_info_data.auth_cd)
                except ObjectDoesNotExist:
                    lecture_info_data.auth_cd_name = ''
                try:
                    lecture_info_data.lecture_tb.state_cd_name = \
                        CommonCdTb.objects.get(common_cd=lecture_info_data.lecture_tb.state_cd)
                except ObjectDoesNotExist:
                    lecture_info_data.lecture_tb.state_cd_name = ''

                lecture_counts += 1

                # group_info = None
                # group_check = 0
                # try:
                #     group_info = GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_tb_id, use=USE)
                # except ObjectDoesNotExist:
                #     group_check = 1

                # if group_check == 0:
                lecture_info_data.group_name = lecture_info_data.lecture_tb.package_tb.name
                lecture_info_data.group_type_cd = lecture_info_data.lecture_tb.package_tb.group_type_cd
                # lecture_info_data.group_member_num = lecture_info_data.lecture_tb.package_tb.member_num
                lecture_info_data.group_note = lecture_info_data.lecture_tb.package_tb.note
                lecture_info_data.group_state_cd = lecture_info_data.lecture_tb.package_tb.state_cd
                try:
                    state_cd_nm = CommonCdTb.objects.get(common_cd=lecture_info_data.lecture_tb.package_tb.state_cd)
                    lecture_info_data.group_state_cd_nm = state_cd_nm.common_cd_nm
                except ObjectDoesNotExist:
                    error = '회원 정보를 불러오지 못했습니다.'

                output_lecture_list.append(lecture_info_data)

    context['lecture_data'] = output_lecture_list

    if error is not None:
        context['error'] = error

    return context


def func_get_class_list(context, member_id):

    error = None

    query_member_auth_cd \
        = "select `AUTH_CD` from MEMBER_LECTURE_TB as D" \
          " where D.LECTURE_TB_ID = `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and D.MEMBER_ID = "+str(member_id)

    query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `CLASS_TB`.`SUBJECT_CD`"

    class_lecture_data = ClassLectureTb.objects.select_related(
        'class_tb', 'lecture_tb').filter(
        lecture_tb__member_id=member_id, use=USE).annotate(member_auth_cd=RawSQL(query_member_auth_cd, []),
                                                           class_type_name=RawSQL(query_type_cd, [])
                                                           ).exclude(member_auth_cd='DELETE').order_by('class_tb_id')

    class_list = []
    if len(class_lecture_data) > 0:
        for class_lecture_info in class_lecture_data:
            class_id = class_lecture_info.class_tb_id
            input_class_info = None

            for class_info in class_list:
                if str(class_info.class_tb_id) == str(class_id):
                    input_class_info = class_info
                    break

            if input_class_info is None:
                input_class_info = class_lecture_info
                input_class_info.np_lecture_counts = 0
                input_class_info.lecture_counts = 0
                input_class_info.lecture_rem_count = 0
                if class_lecture_info.class_tb.subject_detail_nm is not None\
                        and class_lecture_info.class_tb.subject_detail_nm != '':
                    input_class_info.class_type_name = class_lecture_info.class_tb.subject_detail_nm
                class_list.append(input_class_info)

            if input_class_info.member_auth_cd == 'WAIT':
                input_class_info.np_lecture_counts += 1
            if input_class_info.member_auth_cd == 'VIEW':
                input_class_info.lecture_counts += 1
                input_class_info.lecture_rem_count += class_lecture_info.lecture_tb.lecture_rem_count

    context['class_data'] = class_list

    if error is not None:
        context['error'] = error

    return context


def func_check_schedule_setting(class_id, start_date, end_date, add_del_type):
    error = None
    disable_time = timezone.now()
    now_time = datetime.datetime.strptime(disable_time.strftime('%H:%M'), '%H:%M')
    add_del_start_time = datetime.datetime.strptime(start_date.strftime('%H:%M'), '%H:%M')
    add_del_end_time = datetime.datetime.strptime(end_date.strftime('%H:%M'), '%H:%M')
    today = datetime.datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
    reserve_avail_date = 0
    class_info = None
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '수강정보를 불러오지 못했습니다.'
    if error is None:

        lt_res_01 = '00:00-23:59'
        lt_res_02 = 0
        lt_res_03 = '0'
        lt_res_04 = '00:00-23:59'
        lt_res_05 = 7
        lt_res_cancel_time = -1
        lt_res_enable_time = -1
        lt_work_time_avail = ['', '', '', '', '', '', '']
        setting_data = SettingTb.objects.filter(member_id=class_info.member_id, class_tb_id=class_id, use=USE)

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
            if setting_info.setting_type_cd == 'LT_RES_05':
                lt_res_05 = int(setting_info.setting_info)
            if setting_info.setting_type_cd == 'LT_RES_CANCEL_TIME':
                lt_res_cancel_time = int(setting_info.setting_info)
            if setting_info.setting_type_cd == 'LT_RES_ENABLE_TIME':
                lt_res_enable_time = int(setting_info.setting_info)
        if lt_res_cancel_time == -1:
            lt_res_cancel_time = lt_res_02*60
        if lt_res_enable_time == -1:
            lt_res_enable_time = lt_res_02*60
        if lt_work_time_avail[0] == '':
            lt_work_time_avail[0] = lt_res_04
        if lt_work_time_avail[1] == '':
            lt_work_time_avail[1] = lt_res_04
        if lt_work_time_avail[2] == '':
            lt_work_time_avail[2] = lt_res_04
        if lt_work_time_avail[3] == '':
            lt_work_time_avail[3] = lt_res_04
        if lt_work_time_avail[4] == '':
            lt_work_time_avail[4] = lt_res_04
        if lt_work_time_avail[5] == '':
            lt_work_time_avail[5] = lt_res_04
        if lt_work_time_avail[6] == '':
            lt_work_time_avail[6] = lt_res_04

        reserve_avail_start_time = datetime.datetime.strptime(lt_res_01.split('-')[0], '%H:%M')
        reserve_avail_end_time = datetime.datetime.strptime(lt_res_01.split('-')[1], '%H:%M')

        work_avail_start_time = datetime.datetime.strptime(lt_work_time_avail[int(start_date.strftime('%w'))].split('-')[0],
                                                           '%H:%M')
        work_avail_end_time = datetime.datetime.strptime(lt_work_time_avail[int(start_date.strftime('%w'))].split('-')[1],
                                                         '%H:%M')
        today + datetime.timedelta(hours=reserve_avail_date)

        reserve_stop = lt_res_03
        reserve_avail_date = lt_res_05
        if add_del_type == ADD_SCHEDULE:
            reserve_prohibition_time = lt_res_enable_time
        else:
            reserve_prohibition_time = lt_res_cancel_time

        if reserve_prohibition_time >= 24*60:
            reserve_prohibition_time = 0
        disable_time = disable_time + datetime.timedelta(minutes=reserve_prohibition_time)

        if reserve_stop == '1':
            if add_del_type == ADD_SCHEDULE:
                error = '현재 예약 등록 정지 상태입니다.'
            else:
                error = '현재 예약 취소 정지 상태입니다.'

        if error is None:
            if reserve_avail_start_time <= reserve_avail_end_time:
                if now_time < reserve_avail_start_time:
                    if add_del_type == ADD_SCHEDULE:
                        error = '현재 예약 등록 가능 시간이 아닙니다.'
                    else:
                        error = '현재 예약 취소 가능 시간이 아닙니다.'
                if now_time > reserve_avail_end_time:
                    if add_del_type == ADD_SCHEDULE:
                        error = '현재 예약 등록 가능 시간이 아닙니다.'
                    else:
                        error = '현재 예약 취소 가능 시간이 아닙니다.'
            else:
                if reserve_avail_start_time > now_time > reserve_avail_end_time:
                    if add_del_type == ADD_SCHEDULE:
                        error = '현재 예약 등록 가능 시간이 아닙니다.'
                    else:
                        error = '현재 예약 취소 가능 시간이 아닙니다.'

        if error is None:
            if add_del_start_time < work_avail_start_time:
                if add_del_type == ADD_SCHEDULE:
                    error = '강사 업무시간이 아닙니다.'
                # else:
                #     error = '예약 취소가 불가능합니다.'

            if add_del_end_time > work_avail_end_time:
                if add_del_type == ADD_SCHEDULE:
                    error = '강사 업무시간이 아닙니다.'
                # else:
                #     error = '예약 취소가 불가능합니다.'

    avail_end_date = today + datetime.timedelta(days=reserve_avail_date)

    if error is None:
        if start_date >= avail_end_date:
            if add_del_type == ADD_SCHEDULE:
                error = '예약 등록이 불가능합니다.'
            else:
                error = '예약 취소가 불가능합니다.'
    if error is None:
        if start_date < disable_time:
            if add_del_type == ADD_SCHEDULE:
                error = '예약 등록이 불가능합니다.'
            else:
                error = '예약 취소가 불가능합니다.'

    return error


def func_get_trainee_next_schedule_by_class_id(context, class_id, user_id):

    now = timezone.now()
    next_schedule_info = ''
    next_schedule_data = ScheduleTb.objects.filter(class_tb=class_id,
                                                   lecture_tb__member_id=user_id,
                                                   en_dis_type=ON_SCHEDULE_TYPE,
                                                   start_dt__gte=now, use=USE).order_by('start_dt')

    if len(next_schedule_data) > 0:
        next_schedule_info = next_schedule_data[0]
        try:
            group_type_name = CommonCdTb.objects.get(common_cd=next_schedule_info.group_tb.group_type_cd)
            group_name = next_schedule_info.group_tb.name
        except ObjectDoesNotExist:
            group_type_name = '개인'
            group_name = '1:1 레슨'
        except AttributeError:
            group_type_name = '개인'
            group_name = '1:1 레슨'
        next_schedule_info.group_name = group_name
        next_schedule_info.group_type_name = group_type_name

    context['next_schedule_info'] = next_schedule_info

    return context


def func_get_trainee_select_schedule(context, class_id, user_id, date):

    # query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as C where C.COMMON_CD = `GROUP_TB`.`GROUP_TYPE_CD`"
    schedule_data = ScheduleTb.objects.filter(
        class_tb=class_id, lecture_tb__member_id=user_id, en_dis_type=ON_SCHEDULE_TYPE,
        start_dt__gte=date, end_dt__lte=date, use=USE).order_by('start_dt')

    for schedule_info in schedule_data:
        try:
            group_type_name = CommonCdTb.objects.get(common_cd=schedule_info.group_tb.group_type_cd)
            group_name = schedule_info.group_tb.name
        except ObjectDoesNotExist:
            group_type_name = '개인'
            group_name = '1:1 레슨'
        except AttributeError:
            group_type_name = '개인'
            group_name = '1:1 레슨'
        schedule_info.group_name = group_name
        schedule_info.group_type_name = group_type_name

    context['schedule_data'] = schedule_data

    return context
