from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.utils import timezone
import datetime

from configs.const import ON_SCHEDULE_TYPE, ADD_SCHEDULE, USE
from login.models import HolidayTb, CommonCdTb
from schedule.models import ClassTb, MemberLectureTb, ClassLectureTb, ScheduleTb, RepeatScheduleTb, GroupLectureTb, \
    SettingTb


def func_get_holiday_schedule(context):

    holiday = HolidayTb.objects.filter(use=USE)
    context['holiday'] = holiday

    return context


def func_get_trainee_on_schedule(context, class_id, user_id, start_date, end_date):
    member_lecture_list = []
    pt_schedule_list = []
    all_schedule_check = 0

    if start_date is None and end_date is None:
        all_schedule_check = 1

    lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                 lecture_tb__member_id=user_id,
                                                 use=USE).order_by('-lecture_tb__start_date', '-lecture_tb__reg_dt')
    for lecture_info in lecture_list:
        try:
            member_lecture = MemberLectureTb.objects.get(auth_cd='VIEW', member_id=user_id,
                                                         lecture_tb_id=lecture_info.lecture_tb_id)
        except ObjectDoesNotExist:
            member_lecture = None
        if member_lecture is not None:
            member_lecture_list.append(member_lecture)

    idx = len(member_lecture_list)+1
    for member_lecture_info in member_lecture_list:
        member_lecture_info.lecture_tb.schedule_check = 0
        member_lecture_info.save()
        idx -= 1
        if all_schedule_check == 0:
            schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE,
                                                      lecture_tb_id=member_lecture_info.lecture_tb_id,
                                                      start_dt__gte=start_date,
                                                      end_dt__lt=end_date).order_by('start_dt')
        else:
            schedule_data = \
                ScheduleTb.objects.filter(class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE,
                                          lecture_tb_id=member_lecture_info.lecture_tb_id).order_by('-start_dt')

        idx2 = len(schedule_data)+1

        for schedule_info in schedule_data:
            idx2 -= 1
            schedule_info.idx = str(idx)+'-'+str(idx2)
            pt_schedule_list.append(schedule_info)

    context['pt_schedule_data'] = pt_schedule_list

    return context


def func_get_trainee_group_schedule(context, user_id, class_id, start_date, end_date):
    group_schedule_list = []
    # 내가 속한 그룹 일정 조회
    group_list = func_get_trainee_group_ing_list(class_id, user_id)
    group_schedule_data = None

    for group_info in group_list:
        if group_schedule_data is None:
            group_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                            group_tb_id=group_info.group_tb.group_id,
                                                            lecture_tb__isnull=True,
                                                            en_dis_type=ON_SCHEDULE_TYPE,
                                                            start_dt__gte=start_date,
                                                            start_dt__lt=end_date).order_by('start_dt')
        else:
            group_schedule_data |= ScheduleTb.objects.filter(class_tb_id=class_id,
                                                             group_tb_id=group_info.group_tb.group_id,
                                                             lecture_tb__isnull=True,
                                                             en_dis_type=ON_SCHEDULE_TYPE,
                                                             start_dt__gte=start_date,
                                                             start_dt__lt=end_date).order_by('start_dt')

        # for group_schedule_info in group_schedule_data:
            # lecture schedule id 셋팅

            # group_schedule_info.start_dt = str(group_schedule_info.start_dt)
            # group_schedule_info.end_dt = str(group_schedule_info.end_dt)
            #
            # if group_schedule_info.group_tb is not None and group_schedule_info.group_tb != '':
            #     schedule_current_member_num = \
            #         ScheduleTb.objects.filter(class_tb_id=class_id,
            #                                   group_tb_id=group_schedule_info.group_tb.group_id,
            #                                   lecture_tb__isnull=False,
            #                                   group_schedule_id=group_schedule_info.schedule_id).count()
            #     group_schedule_info.current_member_num = schedule_current_member_num
            #
            # if group_schedule_info.note is None:
            #     group_schedule_info.note = ''
            # 끝난 스케쥴인지 확인
            # if group_schedule_info.state_cd == 'PE':
            #     group_schedule_info.finish_check = 1
            # else:
            #     group_schedule_info.finish_check = 0
            # group_schedule_list.append(group_schedule_info)
    context['group_schedule_data'] = group_schedule_data

    return context


def func_get_trainee_off_schedule(context, class_id, start_date, end_date):
    # off_schedule_list = []

    # off 스케쥴 전달
    schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                              start_dt__gte=start_date,
                                              end_dt__lt=end_date).order_by('start_dt')

    # for schedule_info in schedule_data:
    #     schedule_info.start_dt = str(schedule_info.start_dt)
    #     schedule_info.end_dt = str(schedule_info.end_dt)
    #     off_schedule_list.append(schedule_info)

    context['off_schedule_data'] = schedule_data

    return context


def func_get_trainee_on_repeat_schedule(context, user_id, class_id):
    # repeat_schedule_list = []
    pt_repeat_schedule_data = None
    member_lecture_data = MemberLectureTb.objects.filter(auth_cd='VIEW',
                                                         member_id=user_id).order_by('lecture_tb__start_date')

    for member_lecture_info in member_lecture_data:
        if pt_repeat_schedule_data is None:
            pt_repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                      lecture_tb_id=member_lecture_info.lecture_tb_id,
                                                                      en_dis_type=ON_SCHEDULE_TYPE)
        else:
            pt_repeat_schedule_data |= RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                       lecture_tb_id=member_lecture_info.lecture_tb_id,
                                                                       en_dis_type=ON_SCHEDULE_TYPE)
    # 강사 클래스의 반복일정 불러오기
    #     for pt_repeat_schedule_info in pt_repeat_schedule_data:
            # pt_repeat_schedule_info.start_date = str(pt_repeat_schedule_info.start_date)
            # pt_repeat_schedule_info.end_date = str(pt_repeat_schedule_info.end_date)
            # repeat_schedule_list.append(pt_repeat_schedule_info)

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
            group_lecture_info = GroupLectureTb.objects.get(group_tb__class_tb_id=class_id,
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
            group_lecture_info = GroupLectureTb.objects.get(group_tb__class_tb_id=class_id,
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
        error = '강사 정보를 불러오지 못했습니다.'

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

    if error is None:
        # 강사에 해당하는 강좌 정보 불러오기
        lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                     lecture_tb__member_id=user_id, use=USE).order_by('lecture_tb')

    if error is None:
        # 강사 클래스의 반복일정 불러오기
        if len(lecture_list) > 0:
            for idx, lecture_list_info in enumerate(lecture_list):
                lecture_info = lecture_list_info.lecture_tb
                try:
                    MemberLectureTb.objects.get(auth_cd='VIEW', member_id=user_id,
                                                lecture_tb=lecture_info.lecture_id, use=USE)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'

                if error is None:

                    # group_lecture_check = 0
                    group_lecture_info = None
                    try:
                        group_lecture_info = GroupLectureTb.objects.get(group_tb__class_tb_id=class_id,
                                                                        lecture_tb_id=lecture_info.lecture_id, use=USE)
                    except ObjectDoesNotExist:
                        group_lecture_info = None

                    if group_lecture_info is None:
                        if lecture_info.state_cd == 'IP':
                            lecture_reg_count_sum += lecture_info.lecture_reg_count
                            lecture_rem_count_sum += lecture_info.lecture_rem_count
                            lecture_avail_count_sum += lecture_info.lecture_avail_count
                    else:
                        if lecture_info.state_cd == 'IP':
                            if group_lecture_info.group_tb.group_type_cd == 'EMPTY':
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
        error = '강사 정보를 불러오지 못했습니다.'

    if member_id is None or member_id == '':
        error = '회원 정보를 불러오지 못했습니다.'

    if auth_cd is None or auth_cd == '':
        auth_cd = 'VIEW'
    auth_cd_list = auth_cd.split('/')

    if error is None:
        lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                     lecture_tb__member_id=member_id,
                                                     use=USE).order_by('-lecture_tb__start_date', '-lecture_tb__reg_dt')

        for lecture_info in lecture_list:
            lecture_info_data = None
            for auth_cd_info in auth_cd_list:
                try:
                    lecture_info_data = MemberLectureTb.objects.get(auth_cd=auth_cd_info,
                                                                    member_id=member_id,
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

                group_info = None
                group_check = 0
                try:
                    group_info = GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_tb_id)
                except ObjectDoesNotExist:
                    group_check = 1
                if group_check == 0:
                    lecture_info_data.group_name = group_info.group_tb.name
                    lecture_info_data.group_type_cd = group_info.group_tb.group_type_cd
                    lecture_info_data.group_type_cd_name = group_info.group_tb.get_group_type_cd_name()
                    lecture_info_data.group_member_num = group_info.group_tb.member_num
                    lecture_info_data.group_note = group_info.group_tb.note
                    lecture_info_data.group_state_cd = group_info.group_tb.state_cd
                    lecture_info_data.group_state_cd_name = group_info.group_tb.get_state_cd_name()
                    # try:
                    #     state_cd_nm = CommonCdTb.objects.get(common_cd=group_info.group_tb.state_cd)
                    #     lecture_info_data.group_state_cd_nm = state_cd_nm.common_cd_nm
                    # except ObjectDoesNotExist:
                    #     error = '그룹 정보를 불러오지 못했습니다.'

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
        error = '강사 정보를 불러오지 못했습니다.'

    if member_id is None or member_id == '':
        error = '회원 정보를 불러오지 못했습니다.'

    if auth_cd is None or auth_cd == '':
        auth_cd = 'VIEW'
    auth_cd_list = auth_cd.split('/')

    if error is None:
        lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                     lecture_tb__member_id=member_id,
                                                     use=USE).order_by('-lecture_tb__start_date')

        for lecture_info in lecture_list:
            lecture_info_data = None
            for auth_cd_info in auth_cd_list:
                try:
                    lecture_info_data = MemberLectureTb.objects.get(auth_cd=auth_cd_info,
                                                                    member_id=member_id,
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

                group_info = None
                group_check = 0
                try:
                    group_info = GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_tb_id, use=USE)
                except ObjectDoesNotExist:
                    group_check = 1
                if group_check == 0:
                    lecture_info_data.group_name = group_info.group_tb.name
                    lecture_info_data.group_type_cd = group_info.group_tb.group_type_cd
                    lecture_info_data.group_member_num = group_info.group_tb.member_num
                    lecture_info_data.group_note = group_info.group_tb.note
                    lecture_info_data.group_state_cd = group_info.group_tb.state_cd
                    try:
                        state_cd_nm = CommonCdTb.objects.get(common_cd=group_info.group_tb.state_cd)
                        lecture_info_data.group_state_cd_nm = state_cd_nm.common_cd_nm
                    except ObjectDoesNotExist:
                        error = '그룹 정보를 불러오지 못했습니다.'

                output_lecture_list.append(lecture_info_data)

    context['lecture_data'] = output_lecture_list

    if error is not None:
        context['error'] = error

    return context


def func_get_class_list(context, member_id):

    error = None
    class_lecture_data = ClassLectureTb.objects.filter(lecture_tb__member_id=member_id,
                                                       use=USE).order_by('class_tb_id').distinct()

    # class_lecture_data = class_lecture_data.values('class_tb')
    class_list = []
    if len(class_lecture_data) > 0:
        for class_lecture_info in class_lecture_data:

            pt_type_name = None
            if error is None:
                try:
                    pt_type_name = CommonCdTb.objects.get(common_cd=class_lecture_info.class_tb.subject_cd)
                except ObjectDoesNotExist:
                    error = '강좌 정보를 불러오지 못했습니다.'

            lecture_list_data = ClassLectureTb.objects.filter(class_tb_id=class_lecture_info.class_tb_id,
                                                              lecture_tb__member_id=member_id)

            class_lecture_info.np_lecture_counts = 0
            class_lecture_info.lecture_counts = 0

            for lecture_list_info in lecture_list_data:
                member_lecture_data = None
                try:
                    member_lecture_data = MemberLectureTb.objects.get(~Q(auth_cd='DELETE'), member_id=member_id,
                                                                      lecture_tb_id=lecture_list_info.lecture_tb_id)
                except ObjectDoesNotExist:
                    error = '수강 정보를 불러오지 못했습니다.'

                if error is None:
                    class_lecture_info.lecture_counts += 1
                    if member_lecture_data.auth_cd == 'WAIT':
                        class_lecture_info.np_lecture_counts += 1
                else:
                    error = None

            if error is None and class_lecture_info.lecture_counts > 0:
                class_lecture_info.class_type_name = pt_type_name.common_cd_nm

                if class_lecture_info.class_tb.subject_detail_nm is not None\
                        and class_lecture_info.class_tb.subject_detail_nm != '':
                    class_lecture_info.class_type_name = class_lecture_info.class_tb.subject_detail_nm

                check = 0
                for check_class_list_item in class_list:
                    if check_class_list_item.class_tb_id == class_lecture_info.class_tb_id:
                        check = 1

                if check == 0:
                    class_list.append(class_lecture_info)

    context['class_data'] = class_list

    if error is not None:
        context['error'] = error

    return context


def func_check_schedule_setting(class_id, start_date, add_del_type):
    error = None
    disable_time = timezone.now()
    now_time = datetime.datetime.strptime(disable_time.strftime('%H:%M'), '%H:%M')
    today = datetime.datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
    reserve_avail_date = 0
    class_info = None
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강좌 정보를 불러오지 못했습니다.'
    if error is None:
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id,
                                                      setting_type_cd='LT_RES_01', use=USE)
            lt_res_01 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_01 = '00:00-23:59'

        reserve_avail_start_time = datetime.datetime.strptime(lt_res_01.split('-')[0], '%H:%M')
        reserve_avail_end_time = datetime.datetime.strptime(lt_res_01.split('-')[1], '%H:%M')
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id,
                                                      setting_type_cd='LT_RES_02', use=USE)
            lt_res_02 = int(setting_data_info.setting_info)
        except ObjectDoesNotExist:
            lt_res_02 = 0
        # reserve_prohibition_time = lt_res_02
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id,
                                                      setting_type_cd='LT_RES_03', use=USE)
            lt_res_03 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_03 = '0'

        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id,
                                                      setting_type_cd='LT_RES_05', use=USE)
            lt_res_05 = int(setting_data_info.setting_info)
        except ObjectDoesNotExist:
            lt_res_05 = 14

        try:
            setting_data = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id,
                                                 setting_type_cd='LT_RES_CANCEL_TIME')
            lt_res_cancel_time = int(setting_data.setting_info)
        except ObjectDoesNotExist:
            lt_res_cancel_time = lt_res_02*60
        try:
            setting_data = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id,
                                                 setting_type_cd='LT_RES_ENABLE_TIME')
            lt_res_enable_time = int(setting_data.setting_info)
        except ObjectDoesNotExist:
            lt_res_enable_time = lt_res_02*60

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
                error = '현재 예약 등록이 불가능합니다.'
            else:
                error = '현재 예약 취소가 불가능합니다.1'

        if error is None:
            if now_time < reserve_avail_start_time:
                if add_del_type == ADD_SCHEDULE:
                    error = '현재 예약 등록이 불가능합니다.'
                else:
                    error = '현재 예약 취소가 불가능합니다.2'
            if now_time > reserve_avail_end_time:
                if add_del_type == ADD_SCHEDULE:
                    error = '현재 예약 등록이 불가능합니다.'
                else:
                    error = '현재 예약 취소가 불가능합니다.3'

    avail_end_date = today + datetime.timedelta(days=reserve_avail_date)

    if error is None:
        if start_date >= avail_end_date:
            if add_del_type == ADD_SCHEDULE:
                error = '현재 예약 등록이 불가능합니다.'
            else:
                error = '현재 예약 취소가 불가능합니다.4'
    if error is None:
        if start_date < disable_time:
            if add_del_type == ADD_SCHEDULE:
                error = '현재 예약 등록이 불가능합니다.'
            else:
                error = '현재 예약 취소가 불가능합니다.5'

    return error
