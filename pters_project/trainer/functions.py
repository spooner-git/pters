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


def func_get_class_member_id_list(class_id):
    all_member = []

    class_lecture_data = ClassLectureTb.objects.select_related(
        'lecture_tb__member__user').filter(class_tb_id=class_id, auth_cd='VIEW',
                                           lecture_tb__use=USE,
                                           use=USE
                                           ).order_by('lecture_tb__member__name')
    for class_lecture_info in class_lecture_data:
        check_member = None
        member_id = class_lecture_info.lecture_tb.member_id

        for member_info in all_member:
            if str(member_info.member_id) == str(member_id):
                check_member = member_info

        if check_member is None:
            all_member.append(class_lecture_info.lecture_tb.member)

    return all_member


def func_get_class_member_ing_list(class_id, keyword):
    # all_member = []
    class_lecture_data = ClassLectureTb.objects.select_related(
        'lecture_tb__member').filter(Q(lecture_tb__member__name__contains=keyword) |
                                     Q(lecture_tb__member__user__username__contains=keyword),
                                     class_tb_id=class_id, auth_cd='VIEW',
                                     lecture_tb__state_cd='IP', lecture_tb__use=USE,
                                     lecture_tb__member__use=USE,
                                     use=USE).values('lecture_tb__member_id').order_by('lecture_tb__member').distinct()
    # for class_lecture_info in class_lecture_data:
    #     check_member = None
    #     print(str(class_lecture_info))
    #     member_id = class_lecture_info
        # member_id = class_lecture_info.lecture_tb.member_id
        # for member_info in all_member:
        #     if str(member_info.member_id) == str(member_id):
        #         check_member = member_info
        #
        # if check_member is None:
            # all_member.append(class_lecture_info.lecture_tb.member)

        # if member_id is None:
        #     member_id = class_lecture_info.lecture_tb.member_id
        #     all_member.append(class_lecture_info.lecture_tb.member)
        # else:
        #     if member_id != class_lecture_info.lecture_tb.member_id:
        #         member_id = class_lecture_info.lecture_tb.member_idnginx
        #         all_member.append(class_lecture_info.lecture_tb.member)

    # return all_member
    return class_lecture_data


def func_get_class_member_end_list(class_id, keyword):
    all_member = []
    #
    query_ip_lecture_count = "select count(*) from LECTURE_TB AS B WHERE B.STATE_CD = \'IP\' " \
                             "and B.MEMBER_ID=" \
                             "(select C.MEMBER_ID from LECTURE_TB as C " \
                             "where C.ID = `CLASS_LECTURE_TB`.`LECTURE_TB_ID`) and B.USE=1 " \
                             "and (select count(*) from CLASS_LECTURE_TB as D " \
                             "where D.CLASS_TB_ID=`CLASS_LECTURE_TB`.`CLASS_TB_ID`" \
                             "and D.LECTURE_TB_ID=B.ID " \
                             "and D.AUTH_CD=\'VIEW\') > 0 "
    class_lecture_data = ClassLectureTb.objects.select_related(
        'lecture_tb__member__user').filter(Q(lecture_tb__member__name__contains=keyword)|
                                           Q(lecture_tb__member__user__username__contains=keyword),
                                           class_tb_id=class_id, auth_cd='VIEW',
                                           lecture_tb__use=USE, lecture_tb__member__use=USE,
                                           use=USE
                                           ).exclude(lecture_tb__state_cd='IP'
                                                     ).annotate(ip_lecture_count=RawSQL(query_ip_lecture_count, [])
                                                                ).filter(ip_lecture_count=0).values('lecture_tb__member_id').order_by('lecture_tb__member').distinct()
    # class_lecture_data = class_lecture_data.values('lecture_tb__member').distinct()
    # class_lecture_data = class_lecture_data.values('lecture_tb__member').distinct()
    # member_id = None
    # for class_lecture_info in class_lecture_data:
    #     if class_lecture_info.ip_lecture_count == 0:
    #         check_member = None
    #         member_id = class_lecture_info.lecture_tb.member_id
    #
    #         for member_info in all_member:
    #             if str(member_info.member_id) == str(member_id):
    #                 check_member = member_info
    #
    #         if check_member is None:
    #             all_member.append(class_lecture_info.lecture_tb.member)

    return class_lecture_data


def func_get_class_member_one_to_one_end_list(class_id):
    all_member = []
    #
    query_ip_lecture_count = "select count(*) from LECTURE_TB AS B WHERE B.STATE_CD = \'IP\' " \
                             "and (select count(*) from GROUP_LECTURE_TB as A " \
                             "where A.LECTURE_TB_ID = B.ID and A.USE=1) = 0 " \
                             "and B.MEMBER_ID=" \
                             "(select C.MEMBER_ID from LECTURE_TB as C " \
                             "where C.ID = `CLASS_LECTURE_TB`.`LECTURE_TB_ID`) and B.USE=1 " \
                             "and (select count(*) from CLASS_LECTURE_TB as D " \
                             "where D.CLASS_TB_ID=`CLASS_LECTURE_TB`.`CLASS_TB_ID`" \
                             "and D.LECTURE_TB_ID=B.ID " \
                             "and D.AUTH_CD=\'VIEW\') > 0 "
    class_lecture_data = ClassLectureTb.objects.select_related(
        'lecture_tb__member__user').filter(class_tb_id=class_id, auth_cd='VIEW',
                                           lecture_tb__use=USE, lecture_tb__member__use=USE, use=USE
                                           ).exclude(lecture_tb__state_cd='IP'
                                                     ).annotate(ip_lecture_count=RawSQL(query_ip_lecture_count, [])
                                                                ).order_by('lecture_tb__member__name')
    # class_lecture_data = class_lecture_data.values('lecture_tb__member').distinct()
    # class_lecture_data = class_lecture_data.values('lecture_tb__member').distinct()
    member_id = None
    for class_lecture_info in class_lecture_data:
        if class_lecture_info.ip_lecture_count == 0:
            check_member = None
            member_id = class_lecture_info.lecture_tb.member_id

            for member_info in all_member:
                if str(member_info.member_id) == str(member_id):
                    check_member = member_info

            if check_member is None:
                all_member.append(class_lecture_info.lecture_tb.member)
    return all_member


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



def func_get_trainee_schedule_list(context, class_id, member_id):

    error = None

    lecture_list = None
    pt_schedule_list = []

    # 수강 정보 불러 오기
    if error is None:
        lecture_list = ClassLectureTb.objects.select_related('lecture_tb').filter(class_tb_id=class_id, auth_cd='VIEW',
                                                                                  lecture_tb__member_id=member_id,
                                                                                  lecture_tb__use=USE,
                                                                                  use=USE
                                                                                  ).order_by('-lecture_tb__start_date',
                                                                                             '-lecture_tb__reg_dt')

    if error is None:
        # 강사 클래스의 반복일정 불러오기
        if len(lecture_list) > 0:
            idx = len(lecture_list)+1
            for lecture_list_info in lecture_list:
                lecture_info = lecture_list_info.lecture_tb
                idx -= 1

                if error is None:
                    pt_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                 en_dis_type=ON_SCHEDULE_TYPE,
                                                                 use=USE).order_by('-start_dt')

                    if pt_schedule_data is not None and len(pt_schedule_data) > 0:
                        idx2 = len(pt_schedule_data)+1
                        for pt_schedule_info in pt_schedule_data:
                            idx2 -= 1
                            pt_schedule_info.idx = str(idx)+'-'+str(idx2)

                            pt_schedule_list.append(pt_schedule_info)
                else:
                    error = None
    context['pt_schedule_data'] = pt_schedule_list

    if error is None:
        context['error'] = error

    return context


def func_add_lecture_info(user_id, user_last_name, user_first_name, class_id, package_id, counts, price,
                          start_date, end_date, contents, member_id, setting_lecture_auto_finish):

    error = None
    lecture_info = None
    group_info = None
    state_cd = 'IP'
    lecture_rem_count = counts
    if price is None or price == '':
        error = '금액 정보를 입력해주세요.'

    if error is None:
        if counts is None or counts == '':
            error = '등록 횟수 입력해주세요.'

    # if group_id != '' and group_id is not None:
    #     try:
    #         group_info = GroupTb.objects.get(group_id=group_id)
    #     except ObjectDoesNotExist:
    #         error = '오류가 발생했습니다.'
    #
    #     if error is None:
    #         group_counter = GroupLectureTb.objects.filter(group_tb_id=group_id, use=USE).count()
    #         if group_info.group_type_cd == 'NORMAL':
    #             if group_counter >= group_info.member_num:
    #                 error = '그룹 정원을 초과했습니다.'
    if error is None:
        if setting_lecture_auto_finish == AUTO_FINISH_ON:
            end_date = datetime.datetime.strptime(end_date, '%Y-%m-%d').date()
            if end_date < datetime.date.today():
                state_cd = 'PE'
                lecture_rem_count = 0

    if error is None:
        try:
            with transaction.atomic():
                lecture_info = LectureTb(member_id=member_id,
                                         package_tb_id=package_id,
                                         lecture_reg_count=counts, lecture_rem_count=lecture_rem_count,
                                         lecture_avail_count=lecture_rem_count, price=price, option_cd='DC',
                                         state_cd=state_cd,
                                         start_date=start_date, end_date=end_date,
                                         note=contents, use=USE)
                lecture_info.save()
                # auth_cd = 'DELETE'
                auth_cd = 'WAIT'
                # if package_id != '' and package_id is not None:
                #     auth_cd = 'WAIT'

                member_lecture_counts = MemberLectureTb.objects.filter(member_id=member_id, mod_member_id=user_id,
                                                                       auth_cd='VIEW', use=USE).count()
                if member_lecture_counts > 0:
                    auth_cd = 'VIEW'

                member_lecture_info = MemberLectureTb(member_id=member_id, lecture_tb_id=lecture_info.lecture_id,
                                                      auth_cd=auth_cd, mod_member_id=user_id, use=USE)

                member_lecture_info.save()
                class_lecture_info = ClassLectureTb(class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                                                    auth_cd='VIEW', mod_member_id=user_id, use=USE)
                class_lecture_info.save()

                if package_id != '' and package_id is not None:

                    query_class_count = "select count(*) from CLASS_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                                        "`GROUP_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and " \
                                        " B.USE=1"

                    # error_count = 0
                    package_group_data = PackageGroupTb.objects.select_related(
                        'group_tb').filter(package_tb_id=package_id, use=USE)
                    for package_group_info in package_group_data:
                        # if package_group_info.group_tb.group_type_cd == 'NORMAL':
                        #     if package_group_info.group_tb.ing_group_member_num >= package_group_info.group_tb.member_num:
                        #
                        #         group_lecture_counter = GroupLectureTb.objects.filter(
                        #             group_tb_id=package_group_info.group_tb_id, lecture_tb__state_cd='IP',
                        #             lecture_tb__member_id=member_id,
                        #             lecture_tb__use=USE,
                        #             use=USE).annotate(class_count=RawSQL(query_class_count,
                        #                                                  [])).filter(class_count__gte=1).count()
                        #         if group_lecture_counter == 0:
                        #             error = package_group_info.group_tb.name
                        #             error_count += 1
                        group_lecture_counter = GroupLectureTb.objects.filter(
                            group_tb_id=package_group_info.group_tb_id, lecture_tb__member_id=member_id,
                            lecture_tb__state_cd='IP', lecture_tb__use=USE, fix_state_cd='FIX',
                            use=USE).annotate(class_count=RawSQL(query_class_count,
                                                                 [])).filter(class_count__gte=1).count()
                        if group_lecture_counter > 0:
                            fix_state_cd = 'FIX'
                        else:
                            fix_state_cd = ''
                        group_lecture_info = GroupLectureTb(group_tb_id=package_group_info.group_tb_id,
                                                            lecture_tb_id=lecture_info.lecture_id,
                                                            fix_state_cd=fix_state_cd, use=USE)
                        group_lecture_info.save()

                    # if error_count == 1:
                    #     error += ' 그룹의 정원을 초과했습니다.'
                    # elif error_count > 1:
                    #     error = '해당 패키지의 ' + str(error_count) + '개의 그룹 정원을 초과했습니다.'
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

    if error is None:
        lecture_info.package_tb.ing_package_member_num = len(func_get_ing_package_member_list(class_id, package_id))
        lecture_info.package_tb.end_package_member_num = len(func_get_end_package_member_list(class_id, package_id))
        lecture_info.package_tb.save()

        package_group_data = PackageGroupTb.objects.select_related('group_tb').filter(package_tb_id=package_id, use=USE)
        for package_group_info in package_group_data:
            package_group_info.group_tb.ing_group_member_num = len(func_get_ing_group_member_list(class_id,
                                                                                                  package_group_info.group_tb_id,
                                                                                                  user_id))
            package_group_info.group_tb.end_group_member_num = len(func_get_end_group_member_list(class_id,
                                                                                                  package_group_info.group_tb_id,
                                                                                                  user_id))
            package_group_info.group_tb.save()

        member_name = ''
        try:
            user_info = MemberTb.objects.get(member_id=member_id)
            member_name = user_info.name
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

    return error


def func_delete_lecture_info(user_id, class_id, lecture_id, member_id):
    error = None
    class_lecture_info = None
    lecture_info = None
    user = None
    member = None
    group_id_list = []

    if error is None:
        try:
            class_lecture_info = ClassLectureTb.objects.get(class_tb_id=class_id, lecture_tb_id=lecture_id, use=USE)
            # lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
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
        # lecture_info = class_lecture_info.lecture_tb
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        package_tb = lecture_info.package_tb
        # group_data = None
        # schedule_data = None
        # schedule_data_finish = None
        # repeat_schedule_data = None
        # member_lecture_list = None
        group_data = GroupLectureTb.objects.filter(lecture_tb_id=lecture_id, use=USE)
        group_data.update(fix_state_cd='')
        # for group_info in group_data:
        #     group_id_list.append(group_info.group_tb_id)

        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_id,
                                                  state_cd='NP')
        schedule_data_finish = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'), lecture_tb_id=lecture_id)
        repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_id)
        # schedule_data.delete()
        # repeat_schedule_data.delete()
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
                # lecture_info.use = 0
                # lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
                # if lecture_info.state_cd == 'IP':
                #    lecture_info.state_cd = 'PE'
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

        if package_tb is not None:

            package_tb.ing_package_member_num = len(func_get_ing_package_member_list(class_id, package_tb.package_id))
            package_tb.end_package_member_num = len(func_get_end_package_member_list(class_id, package_tb.package_id))
            package_tb.save()

            package_group_data = PackageGroupTb.objects.filter(package_tb_id=package_tb.package_id, use=USE)
            for package_group_info in package_group_data:
                package_group_info.group_tb.ing_group_member_num = len(func_get_ing_group_member_list(class_id,
                                                                                     package_group_info.group_tb_id, user_id))
                package_group_info.group_tb.end_group_member_num = len(func_get_end_group_member_list(class_id,
                                                                                     package_group_info.group_tb_id, user_id))
                package_group_info.group_tb.save()

    return error


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


def func_get_lecture_list(context, class_id, member_id):
    error = None
    class_data = None
    context['error'] = None
    lecture_counts = 0
    np_lecture_counts = 0
    lecture_data = None
    if class_id is None or class_id == '':
        error = '오류가 발생했습니다.'

    if member_id is None or member_id == '':
        error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_data = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'

    if error is None:
        try:
            class_data.trainer_info = MemberTb.objects.get(member_id=class_data.member_id)
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'

    if error is None:

        # query_group_type_cd = "select GROUP_TYPE_CD from GROUP_TB WHERE ID = " \
        #                       "(select GROUP_TB_ID from GROUP_LECTURE_TB as B " \
        #                       "where B.LECTURE_TB_ID = `CLASS_LECTURE_TB`.`LECTURE_TB_ID` AND " \
        #                       "(select A.USE from LECTURE_TB as A where A.ID=B.LECTURE_TB_ID)=1 and B.USE=1)"
        # query_lecture_count = "select count(*) from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID =" \
        #                       " `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and" \
        #                       "(select A.USE from LECTURE_TB as A where A.ID=B.LECTURE_TB_ID)=1 and B.USE=1"
        query_schedule_count = "select count(*) from SCHEDULE_TB as B where B.CLASS_TB_ID =" \
                               "`CLASS_LECTURE_TB`.`CLASS_TB_ID` and B.LECTURE_TB_ID =" \
                               "`CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.STATE_CD=\'PE\' and " \
                               "B.USE=1"
        query_member_auth = "select AUTH_CD from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                            "`CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.MEMBER_ID = '" + str(member_id) + \
                            "' and B.USE=1"

        lecture_data = ClassLectureTb.objects.select_related(
            'lecture_tb__package_tb').filter(class_tb_id=class_id, auth_cd='VIEW', lecture_tb__member_id=member_id,
                                             lecture_tb__use=USE,
                                             use=USE).annotate(lecture_finish_count=RawSQL(query_schedule_count, []),
                                                               member_auth=RawSQL(query_member_auth, []),
                                                               ).order_by('-lecture_tb__start_date',
                                                                          '-lecture_tb__reg_dt')
        # lecture_data = ClassLectureTb.objects.select_related('lecture_tb').filter(class_tb_id=class_id,
        #                                                                           lecture_tb__member_id=member_id,
        #                                                                           lecture_tb__use=USE,
        #                                                                           auth_cd='VIEW'
        #                                                                           ).order_by('-lecture_tb__start_date',
        #                                                                                      '-lecture_tb__reg_dt')

        for lecture_info_data in lecture_data:
            lecture_info = lecture_info_data.lecture_tb
            lecture_info.group_name = '1:1 레슨'
            lecture_info.group_type_cd = ''
            lecture_info.group_member_num = ''
            lecture_info.group_state_cd = ''
            lecture_info.group_state_cd_nm = ''
            lecture_info.group_note = lecture_info.package_tb.note
            lecture_info.group_state_cd = lecture_info.package_tb.state_cd
            try:
                auth_cd_name = CommonCdTb.objects.get(common_cd=lecture_info_data.member_auth).common_cd_nm
            except ObjectDoesNotExist:
                auth_cd_name = ''
            lecture_info.auth_cd = lecture_info_data.member_auth
            lecture_info.auth_cd_name = auth_cd_name

            if lecture_info.auth_cd == 'WAIT':
                np_lecture_counts += 1
            lecture_counts += 1

            if '\r\n' in lecture_info.note:
                lecture_info.note = lecture_info.note.replace('\r\n', ' ')

    class_data.lecture_counts = lecture_counts
    class_data.np_lecture_counts = np_lecture_counts
    context['class_data'] = class_data
    context['lecture_data'] = lecture_data

    if error is not None:
        context['error'] = error

    return context


def func_get_ing_group_member_list_count(class_id, group_id):
    member_data = []
    query_class_count = "select count(*) from CLASS_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                        "`GROUP_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and " \
                        "(select A.USE from LECTURE_TB as A where A.ID=B.LECTURE_TB_ID)=1 and B.USE=1"
    query_member_auth = "select AUTH_CD from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                        "`GROUP_LECTURE_TB`.`LECTURE_TB_ID` and " \
                        "B.USE=1"
    # query_fix_state_cd_nm = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = " \
    #                         "`GROUP_LECTURE_TB`.`FIX_STATE_CD`"

    lecture_list = GroupLectureTb.objects.select_related(
        'lecture_tb__member').filter(group_tb__class_tb_id=class_id,
                                     group_tb_id=group_id, group_tb__state_cd='IP',
                                     lecture_tb__state_cd='IP', lecture_tb__use=USE,
                                     use=USE).annotate(class_count=RawSQL(query_class_count, []),
                                                       # fix_state_cd_nm=RawSQL(query_fix_state_cd_nm, []),
                                                       member_auth=RawSQL(query_member_auth,
                                                                          [])).filter(class_count__gte=1)

    for lecture_info in lecture_list:
        error = None
        member_info = lecture_info.lecture_tb.member_id
        if error is None:
            check_add_flag = 0
            for member_test in member_data:
                if str(member_test) == str(member_info):
                    check_add_flag = 1
            if check_add_flag == 0:
                member_data.append(member_info)
    return member_data


def func_get_end_group_member_list_count(class_id, group_id):
    member_data = []
    query_class_count = "select count(*) from CLASS_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                        "`GROUP_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and " \
                        "B.USE=1"
    query_member_auth = "select AUTH_CD from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                        "`GROUP_LECTURE_TB`.`LECTURE_TB_ID` and " \
                        "B.USE=1"
    #
    # query_fix_state_cd_nm = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = " \
    #                         "`GROUP_LECTURE_TB`.`FIX_STATE_CD`"
    lecture_list = GroupLectureTb.objects.select_related(
        'lecture_tb__member').filter(group_tb__class_tb_id=class_id,
                                     group_tb_id=group_id,
                                     lecture_tb__use=USE,
                                     use=USE).exclude(lecture_tb__state_cd='IP'
                                                      ).annotate(class_count=RawSQL(query_class_count, []),
                                                                 # fix_state_cd_nm=RawSQL(query_fix_state_cd_nm, []),
                                                                 member_auth=RawSQL(query_member_auth,
                                                                                    [])).filter(class_count__gte=1)

    for lecture_info in lecture_list:
        error = None
        member_info = lecture_info.lecture_tb.member
        group_lecture_test = GroupLectureTb.objects.select_related(
            'lecture_tb__member').filter(group_tb_id=group_id,
                                         lecture_tb__member_id=lecture_info.lecture_tb.member_id,
                                         lecture_tb__state_cd='IP',
                                         lecture_tb__use=USE,
                                         use=USE).count()
        if group_lecture_test > 0:
            error = '진행중인 항목 있음'
        if error is None:
            check_add_flag = 0
            for member_test in member_data:
                if str(member_test.member_id) == str(member_info.member_id):
                    check_add_flag = 1

            if check_add_flag == 0:
                member_data.append(member_info)

    return member_data


def func_get_ing_group_member_list(class_id, group_id, user_id):
    member_data = []
    query_class_count = "select count(*) from CLASS_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                        "`GROUP_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and " \
                        "(select A.USE from LECTURE_TB as A where A.ID=B.LECTURE_TB_ID)=1 and B.USE=1"
    query_member_auth = "select AUTH_CD from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                        "`GROUP_LECTURE_TB`.`LECTURE_TB_ID` and " \
                        "B.USE=1"
    # query_fix_state_cd_nm = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = " \
    #                         "`GROUP_LECTURE_TB`.`FIX_STATE_CD`"

    lecture_list = GroupLectureTb.objects.select_related(
        'lecture_tb__member').filter(group_tb__class_tb_id=class_id, group_tb_id=group_id, group_tb__state_cd='IP',
                                     lecture_tb__state_cd='IP', lecture_tb__use=USE,
                                     use=USE).annotate(class_count=RawSQL(query_class_count, []),
                                                       # fix_state_cd_nm=RawSQL(query_fix_state_cd_nm, []),
                                                       member_auth=RawSQL(query_member_auth,
                                                                          [])).filter(class_count__gte=1).order_by('lecture_tb__member__name')

    for lecture_info in lecture_list:
        # member_info = lecture_info.lecture_tb
        error = None
        member_info = lecture_info.lecture_tb.member
        member_info.auth_cd = lecture_info.member_auth
        # member_info = lecture_info.lecture_tb.member
        # try:
        #     member_info = MemberLectureTb.objects.select_related('lecture_tb', 'member').get(
        #         lecture_tb_id=lecture_info.lecture_tb_id, lecture_tb__use=USE, use=USE)
        # except ObjectDoesNotExist:
        #     error = '회원 정보를 불러오지 못했습니다.'
        # class_lecture_test = ClassLectureTb.objects.filter(class_tb_id=class_id,
        #                                                    lecture_tb_id=lecture_info.lecture_tb_id,
        #                                                    auth_cd='VIEW', use=USE).count()
        # if class_lecture_test == 0:
        #     error = '내가 볼수 없는 회원'group_lecture_id
        if error is None:
            member_info.lecture_tb = lecture_info.lecture_tb

            if member_info.sex is None:
                member_info.sex = ''
            if member_info.birthday_dt is None or member_info.birthday_dt == '':
                member_info.birthday_dt = ''
            else:
                member_info.birthday_dt = str(member_info.birthday_dt)

            if member_info.reg_info is None or str(member_info.reg_info) != str(user_id):
                if member_info.auth_cd != 'VIEW':
                    member_info.sex = ''
                    member_info.birthday_dt = ''
                    if member_info.phone is None:
                        member_info.phone = ''
                    else:
                        member_info.phone = '***-****-' + member_info.phone[7:]

            if member_info.phone is None:
                member_info.phone = ''

            check_add_flag = 0
            for member_test in member_data:
                if str(member_test.member_id) == str(member_info.member_id):

                    if member_test.lecture_tb.lecture_available_id == '':
                        if lecture_info.lecture_tb.lecture_avail_count > 0:
                            member_test.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id

                    if datetime.datetime.strptime(member_test.lecture_tb.start_date, '%Y-%m-%d').date() is None \
                            or member_test.lecture_tb.start_date == '':
                        member_test.lecture_tb.start_date = str(lecture_info.lecture_tb.start_date)
                        if lecture_info.lecture_tb.lecture_avail_count > 0:
                            member_test.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.start_date, '%Y-%m-%d').date() \
                                > lecture_info.lecture_tb.start_date:
                            member_test.lecture_tb.start_date = str(lecture_info.lecture_tb.start_date)
                            if lecture_info.lecture_tb.lecture_avail_count > 0:
                                member_test.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id
                    if datetime.datetime.strptime(member_test.lecture_tb.end_date, '%Y-%m-%d').date() is None \
                            or member_test.lecture_tb.end_date == '':
                        member_test.lecture_tb.end_date = str(lecture_info.lecture_tb.end_date)
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.end_date, '%Y-%m-%d').date() \
                                < lecture_info.lecture_tb.end_date:
                            member_test.lecture_tb.end_date = str(lecture_info.lecture_tb.end_date)
                    if datetime.datetime.strptime(member_test.lecture_tb.mod_dt.split('.')[0],
                                                  '%Y-%m-%d %H:%M:%S') is None or member_test.lecture_tb.mod_dt == '':
                        member_test.lecture_tb.mod_dt = str(lecture_info.lecture_tb.mod_dt)
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.mod_dt.split('.')[0],
                                                      '%Y-%m-%d %H:%M:%S') > lecture_info.lecture_tb.mod_dt:
                            member_test.lecture_tb.mod_dt = str(lecture_info.lecture_tb.mod_dt)

                    if datetime.datetime.strptime(member_test.lecture_tb.reg_dt.split('.')[0],
                                                  '%Y-%m-%d %H:%M:%S') is None or member_test.lecture_tb.reg_dt == '':
                        member_test.lecture_tb.reg_dt = str(lecture_info.lecture_tb.reg_dt)
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.reg_dt.split('.')[0],
                                                      '%Y-%m-%d %H:%M:%S') > lecture_info.lecture_tb.reg_dt:
                            member_test.lecture_tb.reg_dt = str(lecture_info.lecture_tb.reg_dt)
                    member_test.lecture_tb.lecture_reg_count += lecture_info.lecture_tb.lecture_reg_count
                    member_test.lecture_tb.lecture_rem_count += lecture_info.lecture_tb.lecture_rem_count
                    member_test.lecture_tb.lecture_avail_count += lecture_info.lecture_tb.lecture_avail_count
                    if member_test.fix_state_cd == '':
                        member_info.fix_state_cd = lecture_info.fix_state_cd
                        if member_info.fix_state_cd != '' and member_info.fix_state_cd is not None:
                            try:
                                member_test.fix_state_cd_nm = \
                                    CommonCdTb.objects.get(common_cd=member_info.fix_state_cd, use=USE).common_cd_nm
                            except ObjectDoesNotExist:
                                member_test.fix_state_cd_nm = ''

                    check_add_flag = 1

            if check_add_flag == 0:
                member_info.fix_state_cd = lecture_info.fix_state_cd
                if member_info.fix_state_cd != '' and member_info.fix_state_cd is not None:
                    try:
                        member_info.fix_state_cd_nm = \
                            CommonCdTb.objects.get(common_cd=member_info.fix_state_cd, use=USE).common_cd_nm
                    except ObjectDoesNotExist:
                        member_info.fix_state_cd_nm = ''
                else:
                    member_info.fix_state_cd = ''
                member_info.lecture_tb.start_date = str(lecture_info.lecture_tb.start_date)
                member_info.lecture_tb.end_date = str(lecture_info.lecture_tb.end_date)
                member_info.lecture_tb.mod_dt = str(lecture_info.lecture_tb.mod_dt).split('.')[0]
                member_info.lecture_tb.reg_dt = str(lecture_info.lecture_tb.reg_dt).split('.')[0]

                member_info.lecture_tb.lecture_reg_count = lecture_info.lecture_tb.lecture_reg_count
                member_info.lecture_tb.lecture_rem_count = lecture_info.lecture_tb.lecture_rem_count
                member_info.lecture_tb.lecture_avail_count = lecture_info.lecture_tb.lecture_avail_count
                member_info.lecture_tb.lecture_available_id = ''
                if lecture_info.lecture_tb.lecture_avail_count > 0:
                    member_info.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id

                member_data.append(member_info)
    return member_data


def func_get_end_group_member_list(class_id, group_id, user_id):
    member_data = []
    query_class_count = "select count(*) from CLASS_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                        "`GROUP_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and " \
                        "B.USE=1"
    query_member_auth = "select AUTH_CD from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                        "`GROUP_LECTURE_TB`.`LECTURE_TB_ID` and " \
                        "B.USE=1"
    #
    # query_fix_state_cd_nm = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = " \
    #                         "`GROUP_LECTURE_TB`.`FIX_STATE_CD`"
    lecture_list = GroupLectureTb.objects.select_related(
        'lecture_tb__member').filter(group_tb__class_tb_id=class_id, group_tb_id=group_id,
                                     lecture_tb__use=USE,
                                     use=USE).exclude(lecture_tb__state_cd='IP'
                                                      ).annotate(class_count=RawSQL(query_class_count, []),
                                                                 # fix_state_cd_nm=RawSQL(query_fix_state_cd_nm, []),
                                                                 member_auth=RawSQL(query_member_auth,
                                                                                    [])).filter(class_count__gte=1).order_by('lecture_tb__member__name')

    for lecture_info in lecture_list:
        # member_info = lecture_info.lecture_tb
        error = None
        member_info = lecture_info.lecture_tb.member
        member_info.auth_cd = lecture_info.member_auth
        # try:
        #     member_info = MemberLectureTb.objects.select_related('lecture_tb', 'member').get(
        #         lecture_tb_id=lecture_info.lecture_tb_id, lecture_tb__use=USE, use=USE)
        # except ObjectDoesNotExist:
        #     error = '회원 정보를 불러오지 못했습니다.'
        group_lecture_test = GroupLectureTb.objects.select_related(
            'lecture_tb__member').filter(group_tb_id=group_id,
                                         lecture_tb__member_id=lecture_info.lecture_tb.member_id,
                                         lecture_tb__state_cd='IP',
                                         lecture_tb__use=USE,
                                         use=USE).count()
        # class_lecture_test = ClassLectureTb.objects.filter(class_tb_id=class_id,
        #                                                    lecture_tb_id=lecture_info.lecture_tb_id,
        #                                                    auth_cd='VIEW', use=USE).count()
        # if group_lecture_test > 0 or class_lecture_test == 0:
        if group_lecture_test > 0:
            error = '진행중인 항목 있음'

        if error is None:

            member_info.lecture_tb = lecture_info.lecture_tb
            member_info.fix_state_cd = lecture_info.fix_state_cd
            if member_info.fix_state_cd != '' and member_info.fix_state_cd is not None:
                try:
                    member_info.fix_state_cd_nm = \
                        CommonCdTb.objects.get(common_cd=member_info.fix_state_cd, use=USE).common_cd_nm
                except ObjectDoesNotExist:
                    member_info.fix_state_cd_nm = ''
            else:
                member_info.fix_state_cd = ''

            if member_info.sex is None:
                member_info.sex = ''
            if member_info.birthday_dt is None or member_info.birthday_dt == '':
                member_info.birthday_dt = ''
            else:
                member_info.birthday_dt = str(member_info.birthday_dt)

            if member_info.reg_info is None or str(member_info.reg_info) != str(user_id):
                if member_info.auth_cd != 'VIEW':
                    member_info.sex = ''
                    member_info.birthday_dt = ''
                    if member_info.phone is None:
                        member_info.phone = ''
                    else:
                        member_info.phone = '***-****-' + member_info.phone[7:]

            if member_info.phone is None:
                member_info.phone = ''

            check_add_flag = 0
            for member_test in member_data:
                if str(member_test.member_id) == str(member_info.member_id):

                    if member_test.lecture_tb.lecture_available_id == '':
                        if lecture_info.lecture_tb.lecture_avail_count > 0:
                            member_test.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id

                    if datetime.datetime.strptime(member_test.lecture_tb.start_date, '%Y-%m-%d').date() is None \
                            or member_test.lecture_tb.start_date == '':
                        member_test.lecture_tb.start_date = str(lecture_info.lecture_tb.start_date)
                        if lecture_info.lecture_tb.lecture_avail_count > 0:
                            member_test.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.start_date, '%Y-%m-%d').date() \
                                > lecture_info.lecture_tb.start_date:
                            member_test.lecture_tb.start_date = str(lecture_info.lecture_tb.start_date)
                            if lecture_info.lecture_tb.lecture_avail_count > 0:
                                member_test.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id
                    if datetime.datetime.strptime(member_test.lecture_tb.end_date, '%Y-%m-%d').date() is None \
                            or member_test.lecture_tb.end_date == '':
                        member_test.lecture_tb.end_date = str(lecture_info.lecture_tb.end_date)
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.end_date, '%Y-%m-%d').date() \
                                < lecture_info.lecture_tb.end_date:
                            member_test.lecture_tb.end_date = str(lecture_info.lecture_tb.end_date)
                    if datetime.datetime.strptime(member_test.lecture_tb.mod_dt.split('.')[0],
                                                  '%Y-%m-%d %H:%M:%S') is None or member_test.lecture_tb.mod_dt == '':
                        member_test.lecture_tb.mod_dt = str(lecture_info.lecture_tb.mod_dt)
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.mod_dt.split('.')[0],
                                                      '%Y-%m-%d %H:%M:%S') > lecture_info.lecture_tb.mod_dt:
                            member_test.lecture_tb.mod_dt = str(lecture_info.lecture_tb.mod_dt)

                    if datetime.datetime.strptime(member_test.lecture_tb.reg_dt.split('.')[0],
                                                  '%Y-%m-%d %H:%M:%S') is None or member_test.lecture_tb.reg_dt == '':
                        member_test.lecture_tb.reg_dt = str(lecture_info.lecture_tb.reg_dt)
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.reg_dt.split('.')[0],
                                                      '%Y-%m-%d %H:%M:%S') > lecture_info.lecture_tb.reg_dt:
                            member_test.lecture_tb.reg_dt = str(lecture_info.lecture_tb.reg_dt)
                    member_test.lecture_tb.lecture_reg_count += lecture_info.lecture_tb.lecture_reg_count
                    member_test.lecture_tb.lecture_rem_count += lecture_info.lecture_tb.lecture_rem_count
                    member_test.lecture_tb.lecture_avail_count += lecture_info.lecture_tb.lecture_avail_count
                    check_add_flag = 1

            if check_add_flag == 0:
                member_info.lecture_tb.start_date = str(lecture_info.lecture_tb.start_date)
                member_info.lecture_tb.end_date = str(lecture_info.lecture_tb.end_date)
                member_info.lecture_tb.mod_dt = str(lecture_info.lecture_tb.mod_dt).split('.')[0]
                member_info.lecture_tb.reg_dt = str(lecture_info.lecture_tb.reg_dt).split('.')[0]

                member_info.lecture_tb.lecture_reg_count = lecture_info.lecture_tb.lecture_reg_count
                member_info.lecture_tb.lecture_rem_count = lecture_info.lecture_tb.lecture_rem_count
                member_info.lecture_tb.lecture_avail_count = lecture_info.lecture_tb.lecture_avail_count
                member_info.lecture_tb.lecture_available_id = ''
                if lecture_info.lecture_tb.lecture_avail_count > 0:
                    member_info.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id

                member_data.append(member_info)

    return member_data


def func_get_ing_package_member_list(class_id, package_id):
    member_data = []
    class_lecture_list = ClassLectureTb.objects.select_related(
        'lecture_tb__member', 'lecture_tb__package_tb').filter(class_tb_id=class_id,
                                                               lecture_tb__package_tb_id=package_id,
                                                               lecture_tb__state_cd='IP',
                                                               auth_cd='VIEW', use=USE)
    for class_lecture_info in class_lecture_list:
        error = None
        if error is None:
            member_info = class_lecture_info.lecture_tb.member_id
            check_add_flag = 0
            for member_test in member_data:
                if str(member_test) == str(member_info):
                    check_add_flag = 1

            if check_add_flag == 0:
                member_data.append(member_info)

    return member_data


def func_get_end_package_member_list(class_id, package_id):
    member_data = []
    class_lecture_list = ClassLectureTb.objects.select_related(
        'lecture_tb__member', 'lecture_tb__package_tb').filter(class_tb_id=class_id,
                                                               lecture_tb__package_tb_id=package_id,
                                                               auth_cd='VIEW',
                                                               use=USE).exclude(lecture_tb__state_cd='IP')

    for class_lecture_info in class_lecture_list:
        error = None
        group_lecture_test = LectureTb.objects.select_related(
            'member').filter(package_tb_id=package_id, member_id=class_lecture_info.lecture_tb.member_id,
                             state_cd='IP', use=USE).count()
        if group_lecture_test > 0:
            error = '진행중인 항목 있음'

        if error is None:
            member_info = class_lecture_info.lecture_tb.member_id
            check_add_flag = 0
            for member_test in member_data:
                if str(member_test) == str(member_info):
                    check_add_flag = 1

            if check_add_flag == 0:
                member_data.append(member_info)

    return member_data


def func_get_ing_package_in_member_list(class_id, package_id, user_id):
    member_data = []

    query_member_auth = "select AUTH_CD from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                        "`CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.USE=1"

    lecture_list = ClassLectureTb.objects.select_related(
        'lecture_tb__member').filter(class_tb_id=class_id, auth_cd='VIEW',
                                     lecture_tb__package_tb_id=package_id,
                                     lecture_tb__state_cd='IP', lecture_tb__use=USE,
                                     use=USE).annotate(member_auth=RawSQL(query_member_auth, [])).order_by('lecture_tb__member__name')

    for lecture_info in lecture_list:
        error = None
        member_info = lecture_info.lecture_tb.member
        member_info.auth_cd = lecture_info.member_auth
        if error is None:
            member_info.lecture_tb = lecture_info.lecture_tb
            if member_info.sex is None:
                member_info.sex = ''
            if member_info.birthday_dt is None or member_info.birthday_dt == '':
                member_info.birthday_dt = ''
            else:
                member_info.birthday_dt = str(member_info.birthday_dt)

            if member_info.reg_info is None or str(member_info.reg_info) != str(user_id):
                if member_info.auth_cd != 'VIEW':
                    member_info.sex = ''
                    member_info.birthday_dt = ''
                    if member_info.phone is None:
                        member_info.phone = ''
                    else:
                        member_info.phone = '***-****-' + member_info.phone[7:]

            if member_info.phone is None:
                member_info.phone = ''

            check_add_flag = 0
            for member_test in member_data:
                if member_test.user.id == member_info.member_id:

                    if member_test.lecture_tb.lecture_available_id == '':
                        if lecture_info.lecture_tb.lecture_avail_count > 0:
                            member_test.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id

                    if datetime.datetime.strptime(member_test.lecture_tb.start_date,
                                                  '%Y-%m-%d').date() is None or member_test.lecture_tb.start_date == '':
                        member_test.lecture_tb.start_date = str(lecture_info.lecture_tb.start_date)
                        if lecture_info.lecture_tb.lecture_avail_count > 0:
                            member_test.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.start_date,
                                                      '%Y-%m-%d').date() > lecture_info.lecture_tb.start_date:
                            member_test.lecture_tb.start_date = str(lecture_info.lecture_tb.start_date)
                            if lecture_info.lecture_tb.lecture_avail_count > 0:
                                member_test.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id
                    if datetime.datetime.strptime(member_test.lecture_tb.end_date,
                                                  '%Y-%m-%d').date() is None or member_test.lecture_tb.end_date == '':
                        member_test.lecture_tb.end_date = str(lecture_info.lecture_tb.end_date)
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.end_date.split('.')[0],
                                                      '%Y-%m-%d').date() < lecture_info.lecture_tb.end_date:
                            member_test.lecture_tb.end_date = str(lecture_info.lecture_tb.end_date)
                    if datetime.datetime.strptime(member_test.lecture_tb.mod_dt.split('.')[0],
                                                  '%Y-%m-%d %H:%M:%S') is None or member_test.lecture_tb.mod_dt == '':
                        member_test.lecture_tb.mod_dt = str(lecture_info.lecture_tb.mod_dt)
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.mod_dt.split('.')[0],
                                                      '%Y-%m-%d %H:%M:%S') > lecture_info.lecture_tb.mod_dt:
                            member_test.lecture_tb.mod_dt = str(lecture_info.lecture_tb.mod_dt)

                    if datetime.datetime.strptime(member_test.lecture_tb.reg_dt.split('.')[0],
                                                  '%Y-%m-%d %H:%M:%S') is None or member_test.lecture_tb.reg_dt == '':
                        member_test.lecture_tb.reg_dt = str(lecture_info.lecture_tb.reg_dt)
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.reg_dt.split('.')[0],
                                                      '%Y-%m-%d %H:%M:%S') > lecture_info.lecture_tb.reg_dt:
                            member_test.lecture_tb.reg_dt = str(lecture_info.lecture_tb.reg_dt)
                    member_test.lecture_tb.lecture_reg_count += lecture_info.lecture_tb.lecture_reg_count
                    member_test.lecture_tb.lecture_rem_count += lecture_info.lecture_tb.lecture_rem_count
                    member_test.lecture_tb.lecture_avail_count += lecture_info.lecture_tb.lecture_avail_count
                    check_add_flag = 1

            if check_add_flag == 0:
                member_info.lecture_tb.start_date = str(lecture_info.lecture_tb.start_date)
                member_info.lecture_tb.end_date = str(lecture_info.lecture_tb.end_date)
                member_info.lecture_tb.mod_dt = str(lecture_info.lecture_tb.mod_dt).split('.')[0]
                member_info.lecture_tb.reg_dt = str(lecture_info.lecture_tb.reg_dt).split('.')[0]

                member_info.lecture_tb.lecture_reg_count = lecture_info.lecture_tb.lecture_reg_count
                member_info.lecture_tb.lecture_rem_count = lecture_info.lecture_tb.lecture_rem_count
                member_info.lecture_tb.lecture_avail_count = lecture_info.lecture_tb.lecture_avail_count
                member_info.lecture_tb.lecture_available_id = ''
                if lecture_info.lecture_tb.lecture_avail_count > 0:
                    member_info.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id

                member_data.append(member_info)
    return member_data


def func_get_end_package_in_member_list(class_id, package_id, user_id):
    member_data = []

    query_member_auth = "select AUTH_CD from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                        "`CLASS_LECTURE_TB`.`LECTURE_TB_ID` and " \
                        "B.USE=1"

    lecture_list = ClassLectureTb.objects.select_related(
        'lecture_tb__member').filter(class_tb_id=class_id, auth_cd='VIEW',
                                     lecture_tb__package_tb_id=package_id, lecture_tb__use=USE,
                                     use=USE).exclude(lecture_tb__state_cd='IP'
                                                      ).annotate(member_auth=RawSQL(query_member_auth, [])).order_by('lecture_tb__member__name')

    for lecture_info in lecture_list:
        # member_info = lecture_info.lecture_tb
        error = None
        member_info = lecture_info.lecture_tb.member
        member_info.auth_cd = lecture_info.member_auth
        package_lecture_test = ClassLectureTb.objects.select_related(
            'lecture_tb__member').filter(lecture_tb__package_tb_id=package_id,
                                         lecture_tb__member_id=lecture_info.lecture_tb.member_id,
                                         lecture_tb__state_cd='IP',
                                         lecture_tb__use=USE,
                                         use=USE).count()
        if package_lecture_test > 0:
            error = '진행중인 항목 있음'

        if error is None:

            member_info.lecture_tb = lecture_info.lecture_tb
            if member_info.sex is None:
                member_info.sex = ''
            if member_info.birthday_dt is None or member_info.birthday_dt == '':
                member_info.birthday_dt = ''
            else:
                member_info.birthday_dt = str(member_info.birthday_dt)

            if member_info.reg_info is None or str(member_info.reg_info) != str(user_id):
                if member_info.auth_cd != 'VIEW':
                    member_info.sex = ''
                    member_info.birthday_dt = ''
                    if member_info.phone is None:
                        member_info.phone = ''
                    else:
                        member_info.phone = '***-****-' + member_info.phone[7:]

            if member_info.phone is None:
                member_info.phone = ''

            check_add_flag = 0
            for member_test in member_data:
                if member_test.user.id == member_info.member_id:

                    if member_test.lecture_tb.lecture_available_id == '':
                        if lecture_info.lecture_tb.lecture_avail_count > 0:
                            member_test.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id

                    if datetime.datetime.strptime(member_test.lecture_tb.start_date, '%Y-%m-%d').date() is None \
                            or member_test.lecture_tb.start_date == '':
                        member_test.lecture_tb.start_date = str(lecture_info.lecture_tb.start_date)
                        if lecture_info.lecture_tb.lecture_avail_count > 0:
                            member_test.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.start_date, '%Y-%m-%d').date() \
                                > lecture_info.lecture_tb.start_date:
                            member_test.lecture_tb.start_date = str(lecture_info.lecture_tb.start_date)
                            if lecture_info.lecture_tb.lecture_avail_count > 0:
                                member_test.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id
                    if datetime.datetime.strptime(member_test.lecture_tb.end_date, '%Y-%m-%d').date() is None \
                            or member_test.lecture_tb.end_date == '':
                        member_test.lecture_tb.end_date = str(lecture_info.lecture_tb.end_date)
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.end_date, '%Y-%m-%d').date() \
                                < lecture_info.lecture_tb.end_date:
                            member_test.lecture_tb.end_date = str(lecture_info.lecture_tb.end_date)
                    if datetime.datetime.strptime(member_test.lecture_tb.mod_dt.split('.')[0],
                                                  '%Y-%m-%d %H:%M:%S') is None or member_test.lecture_tb.mod_dt == '':
                        member_test.lecture_tb.mod_dt = str(lecture_info.lecture_tb.mod_dt)
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.mod_dt.split('.')[0],
                                                      '%Y-%m-%d %H:%M:%S') > lecture_info.lecture_tb.mod_dt:
                            member_test.lecture_tb.mod_dt = str(lecture_info.lecture_tb.mod_dt)

                    if datetime.datetime.strptime(member_test.lecture_tb.reg_dt.split('.')[0],
                                                  '%Y-%m-%d %H:%M:%S') is None or member_test.lecture_tb.reg_dt == '':
                        member_test.lecture_tb.reg_dt = str(lecture_info.lecture_tb.reg_dt)
                    else:
                        if datetime.datetime.strptime(member_test.lecture_tb.reg_dt.split('.')[0],
                                                      '%Y-%m-%d %H:%M:%S') > lecture_info.lecture_tb.reg_dt:
                            member_test.lecture_tb.reg_dt = str(lecture_info.lecture_tb.reg_dt)
                    member_test.lecture_tb.lecture_reg_count += lecture_info.lecture_tb.lecture_reg_count
                    member_test.lecture_tb.lecture_rem_count += lecture_info.lecture_tb.lecture_rem_count
                    member_test.lecture_tb.lecture_avail_count += lecture_info.lecture_tb.lecture_avail_count
                    check_add_flag = 1

            if check_add_flag == 0:
                member_info.lecture_tb.start_date = str(lecture_info.lecture_tb.start_date)
                member_info.lecture_tb.end_date = str(lecture_info.lecture_tb.end_date)
                member_info.lecture_tb.mod_dt = str(lecture_info.lecture_tb.mod_dt).split('.')[0]
                member_info.lecture_tb.reg_dt = str(lecture_info.lecture_tb.reg_dt).split('.')[0]

                member_info.lecture_tb.lecture_reg_count = lecture_info.lecture_tb.lecture_reg_count
                member_info.lecture_tb.lecture_rem_count = lecture_info.lecture_tb.lecture_rem_count
                member_info.lecture_tb.lecture_avail_count = lecture_info.lecture_tb.lecture_avail_count
                member_info.lecture_tb.lecture_available_id = ''
                if lecture_info.lecture_tb.lecture_avail_count > 0:
                    member_info.lecture_tb.lecture_available_id = lecture_info.lecture_tb.lecture_id

                member_data.append(member_info)

    return member_data
