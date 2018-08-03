import datetime

from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.db import transaction
from django.db.models.expressions import RawSQL

from configs.const import ON_SCHEDULE_TYPE, USE, UN_USE, AUTO_FINISH_OFF, AUTO_FINISH_ON

from login.models import MemberTb, LogTb, CommonCdTb
from schedule.models import ScheduleTb, RepeatScheduleTb
from trainee.models import LectureTb, MemberLectureTb
from .models import ClassLectureTb, GroupLectureTb, GroupTb, ClassTb, SettingTb


def func_get_class_member_id_list(class_id):
    all_member = []

    class_lecture_data = ClassLectureTb.objects.select_related(
        'lecture_tb__member__user').filter(class_tb_id=class_id, auth_cd='VIEW',
                                           lecture_tb__use=USE, use=USE
                                           ).order_by('lecture_tb__member__name')
    member_id = None
    for class_lecture_info in class_lecture_data:
        if member_id is None:
            member_id = class_lecture_info.lecture_tb.member_id
            all_member.append(class_lecture_info.lecture_tb.member)
        else:
            if member_id != class_lecture_info.lecture_tb.member_id:
                member_id = class_lecture_info.lecture_tb.member_id
                all_member.append(class_lecture_info.lecture_tb.member)

    return all_member


def func_get_class_member_ing_list(class_id):
    all_member = []
    class_lecture_data = ClassLectureTb.objects.select_related('lecture_tb__member__user'
                                                               ).filter(class_tb_id=class_id, auth_cd='VIEW',
                                                                        lecture_tb__state_cd='IP',
                                                                        lecture_tb__use=USE,
                                                                        use=USE).order_by('lecture_tb__member__name')
    member_id = None
    for class_lecture_info in class_lecture_data:
        if member_id is None:
            member_id = class_lecture_info.lecture_tb.member_id
            all_member.append(class_lecture_info.lecture_tb.member)
        else:
            if member_id != class_lecture_info.lecture_tb.member_id:
                member_id = class_lecture_info.lecture_tb.member_id
                all_member.append(class_lecture_info.lecture_tb.member)

    return all_member


def func_get_class_member_end_list(class_id):
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
        'lecture_tb__member__user').filter(class_tb_id=class_id, auth_cd='VIEW',
                                           lecture_tb__use=USE, use=USE
                                           ).exclude(lecture_tb__state_cd='IP'
                                                     ).annotate(ip_lecture_count=RawSQL(query_ip_lecture_count, []),
                                                                ).order_by('lecture_tb__member__name')
    # class_lecture_data = class_lecture_data.values('lecture_tb__member').distinct()
    # class_lecture_data = class_lecture_data.values('lecture_tb__member').distinct()
    member_id = None
    for class_lecture_info in class_lecture_data:
        if class_lecture_info.ip_lecture_count == 0:
            if member_id is None:
                member_id = class_lecture_info.lecture_tb.member_id
                all_member.append(class_lecture_info.lecture_tb.member)
            else:
                if member_id != class_lecture_info.lecture_tb.member_id:
                    member_id = class_lecture_info.lecture_tb.member_id
                    all_member.append(class_lecture_info.lecture_tb.member)

    return all_member


def func_get_member_ing_list(class_id, user_id):

    member_list = []

    all_member = func_get_class_member_ing_list(class_id)

    query_group_type_cd = "select GROUP_TYPE_CD from GROUP_TB WHERE ID = " \
                          "(select GROUP_TB_ID from GROUP_LECTURE_TB as B " \
                          "where B.LECTURE_TB_ID = `CLASS_LECTURE_TB`.`LECTURE_TB_ID` AND " \
                          "(select A.USE from LECTURE_TB as A where A.ID=B.LECTURE_TB_ID)=1 and B.USE=1)"
    query_lecture_count = "select count(*) from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID =" \
                          " `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and" \
                          "(select A.USE from LECTURE_TB as A where A.ID=B.LECTURE_TB_ID)=1 and B.USE=1"

    all_lecture_list = ClassLectureTb.objects.select_related(
        'lecture_tb').filter(class_tb_id=class_id, auth_cd='VIEW',
                             lecture_tb__use=USE, use=USE).annotate(group_check=RawSQL(query_group_type_cd, []),
                                                                    lecture_count=RawSQL(query_lecture_count, []))
    for member_data in all_member:

        if member_data.user.is_active:
            member_data.is_active = True
        else:
            if str(member_data.reg_info) == str(user_id):
                member_data.is_active = False
            else:
                member_data.is_active = True

        member_data.rj_lecture_counts = 0
        member_data.np_lecture_counts = 0

        member_data.lecture_reg_count_yet = 0
        member_data.lecture_rem_count_yet = 0
        member_data.lecture_avail_count_yet = 0

        member_data.lecture_reg_count = 0
        member_data.lecture_rem_count = 0
        member_data.lecture_avail_count = 0
        member_data.lesson_reg_count = 0
        member_data.lesson_rem_count = 0
        member_data.lesson_avail_count = 0
        member_data.group_reg_count = 0
        member_data.group_rem_count = 0
        member_data.group_avail_count = 0

        member_data.start_date = None
        member_data.end_date = None
        member_data.mod_dt = None
        member_data.group_info = ''
        class_lecture_count = 0
        lecture_count = 0

        for lecture_info_data in all_lecture_list:
            lecture_info = lecture_info_data.lecture_tb
            if str(lecture_info.member_id) == str(member_data.member_id):

                class_lecture_count += 1

                if lecture_info_data.auth_cd == 'DELETE':
                    member_data.rj_lecture_counts += 1
                if lecture_info_data.auth_cd == 'WAIT':
                    member_data.np_lecture_counts += 1

                if lecture_info_data.group_check == 'NORMAL':
                    group_check = 1
                elif lecture_info_data.group_check == 'EMPTY':
                    group_check = 2
                else:
                    group_check = 0

                if lecture_info.use != UN_USE:
                    if lecture_info.state_cd == 'IP':
                        if group_check == 0:
                            if member_data.group_info == '':
                                member_data.group_info = '1:1'
                            else:
                                if '1:1' not in member_data.group_info:
                                    member_data.group_info = '1:1/' + member_data.group_info
                        elif group_check == 1:
                            if member_data.group_info == '':
                                member_data.group_info = '그룹'
                            else:
                                if '그룹' in member_data.group_info:
                                    member_data.group_info = member_data.group_info
                                elif '클래스' in member_data.group_info:
                                    if '1:1' in member_data.group_info:
                                        member_data.group_info = '1:1/그룹/클래스'
                                    else:
                                        member_data.group_info = '그룹/클래스'
                                else:
                                    member_data.group_info += '/그룹'
                        else:
                            if member_data.group_info == '':
                                member_data.group_info = '클래스'
                            else:
                                if '클래스' not in member_data.group_info:
                                    member_data.group_info += '/클래스'

                lecture_count += lecture_info_data.lecture_count

                if lecture_info.use == USE:
                    if lecture_info.state_cd == 'IP':
                        if group_check != 0:
                            member_data.group_reg_count += lecture_info.lecture_reg_count
                            member_data.group_rem_count += lecture_info.lecture_rem_count
                            member_data.group_avail_count += lecture_info.lecture_avail_count
                        else:
                            member_data.lesson_reg_count += lecture_info.lecture_reg_count
                            member_data.lesson_rem_count += lecture_info.lecture_rem_count
                            member_data.lesson_avail_count += lecture_info.lecture_avail_count
                        member_data.lecture_reg_count += lecture_info.lecture_reg_count
                        member_data.lecture_rem_count += lecture_info.lecture_rem_count
                        member_data.lecture_avail_count += lecture_info.lecture_avail_count

                        if member_data.start_date is None or member_data.start_date == '':
                            member_data.start_date = lecture_info.start_date
                        else:
                            if member_data.start_date > lecture_info.start_date:
                                member_data.start_date = lecture_info.start_date

                        if member_data.end_date is None or member_data.end_date == '':
                            member_data.end_date = lecture_info.end_date
                        else:
                            if member_data.end_date < lecture_info.end_date:
                                member_data.end_date = lecture_info.end_date

                    if member_data.mod_dt is None or member_data.mod_dt == '':
                        member_data.mod_dt = lecture_info.mod_dt
                    else:
                        if member_data.mod_dt > lecture_info.mod_dt:
                            member_data.mod_dt = lecture_info.mod_dt

                    member_data.lecture_id = lecture_info.lecture_id

        member_data.lecture_counts = class_lecture_count

        if member_data.reg_info is None or str(member_data.reg_info) != str(user_id):
            if lecture_count == 0:
                member_data.sex = ''
                member_data.birthday_dt = ''
                if member_data.phone is member_data.phone == '':
                    member_data.phone = ''
                else:
                    member_data.phone = '***-****-' + member_data.phone[7:]
                member_data.user.email = ''

        member_data.start_date = str(member_data.start_date)
        member_data.end_date = str(member_data.end_date)
        member_data.mod_dt = str(member_data.mod_dt)

        if member_data.phone is None:
            member_data.phone = ''
        if member_data.sex is None:
            member_data.sex = ''
        if member_data.birthday_dt is None or member_data.birthday_dt == '':
            member_data.birthday_dt = ''
        else:
            member_data.birthday_dt = str(member_data.birthday_dt)

        member_list.append(member_data)

    return member_list


def func_get_member_end_list(class_id, user_id):

    member_list = []

    all_member = func_get_class_member_end_list(class_id)

    query_group_type_cd = "select GROUP_TYPE_CD from GROUP_TB WHERE ID = " \
                          "(select GROUP_TB_ID from GROUP_LECTURE_TB as B " \
                          "where B.LECTURE_TB_ID = `CLASS_LECTURE_TB`.`LECTURE_TB_ID` AND " \
                          "(select A.USE from LECTURE_TB as A where A.ID=B.LECTURE_TB_ID)=1 and B.USE=1)"
    query_lecture_count = "select count(*) from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID =" \
                          " `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and" \
                          "(select A.USE from LECTURE_TB as A where A.ID=B.LECTURE_TB_ID)=1 and B.USE=1"

    all_lecture_list = ClassLectureTb.objects.select_related(
        'lecture_tb').filter(class_tb_id=class_id, auth_cd='VIEW',
                             lecture_tb__use=USE, use=USE).annotate(group_check=RawSQL(query_group_type_cd, []),
                                                                    lecture_count=RawSQL(query_lecture_count, []))
    for member_data in all_member:

        if member_data.user.is_active:
            member_data.is_active = True
        else:
            if str(member_data.reg_info) == str(user_id):
                member_data.is_active = False
            else:
                member_data.is_active = True

        member_data.rj_lecture_counts = 0
        member_data.np_lecture_counts = 0

        member_data.lecture_reg_count_yet = 0
        member_data.lecture_rem_count_yet = 0
        member_data.lecture_avail_count_yet = 0

        member_data.lecture_reg_count = 0
        member_data.lecture_rem_count = 0
        member_data.lecture_avail_count = 0
        member_data.lesson_reg_count = 0
        member_data.lesson_rem_count = 0
        member_data.lesson_avail_count = 0
        member_data.group_reg_count = 0
        member_data.group_rem_count = 0
        member_data.group_avail_count = 0

        member_data.start_date = None
        member_data.end_date = None
        member_data.mod_dt = None
        member_data.group_info = ''
        class_lecture_count = 0
        lecture_finish_count = 0

        for lecture_info_data in all_lecture_list:
            lecture_info = lecture_info_data.lecture_tb
            if str(lecture_info.member_id) == str(member_data.member_id):

                class_lecture_count += 1
                if lecture_info_data.auth_cd == 'DELETE':
                    member_data.rj_lecture_counts += 1
                if lecture_info_data.auth_cd == 'WAIT':
                    member_data.np_lecture_counts += 1

                if lecture_info_data.group_check == 'NORMAL':
                    group_check = 1
                elif lecture_info_data.group_check == 'EMPTY':
                    group_check = 2
                else:
                    group_check = 0

                if group_check == 0:
                    if member_data.group_info == '':
                        member_data.group_info = '1:1'
                    else:
                        if '1:1' in member_data.group_info:
                            member_data.group_info = member_data.group_info
                        else:
                            member_data.group_info = '1:1/' + member_data.group_info
                elif group_check == 1:
                    if member_data.group_info == '':
                        member_data.group_info = '그룹'
                    else:
                        if '그룹' in member_data.group_info:
                            member_data.group_info = member_data.group_info
                        elif '클래스' in member_data.group_info:
                            if '1:1' in member_data.group_info:
                                member_data.group_info = '1:1/그룹/클래스'
                            else:
                                member_data.group_info = '그룹/클래스'
                        else:
                            member_data.group_info += '/그룹'
                else:
                    if member_data.group_info == '':
                        member_data.group_info = '클래스'
                    else:
                        if '클래스' in member_data.group_info:
                            member_data.group_info = member_data.group_info
                        else:
                            member_data.group_info += '/클래스'

                lecture_finish_count += lecture_info_data.lecture_count

                if lecture_info.use == USE:
                    if group_check != 0:
                        member_data.group_reg_count += lecture_info.lecture_reg_count
                        member_data.group_rem_count += lecture_info.lecture_rem_count
                        member_data.group_avail_count += lecture_info.lecture_avail_count
                    else:
                        member_data.lesson_reg_count += lecture_info.lecture_reg_count
                        member_data.lesson_rem_count += lecture_info.lecture_rem_count
                        member_data.lesson_avail_count += lecture_info.lecture_avail_count
                    member_data.lecture_reg_count += lecture_info.lecture_reg_count
                    member_data.lecture_rem_count += lecture_info.lecture_rem_count
                    member_data.lecture_avail_count += lecture_info.lecture_avail_count

                    if member_data.start_date is None or member_data.start_date == '':
                        member_data.start_date = lecture_info.start_date
                    else:
                        if member_data.start_date > lecture_info.start_date:
                            member_data.start_date = lecture_info.start_date
                            # if lecture_info.lecture_avail_count > 0:
                            #     member_data.lecture_available_id = lecture_info.lecture_id

                    if member_data.end_date is None or member_data.end_date == '':
                        member_data.end_date = lecture_info.end_date
                    else:
                        if member_data.end_date < lecture_info.end_date:
                            member_data.end_date = lecture_info.end_date

                    if member_data.mod_dt is None or member_data.mod_dt == '':
                        member_data.mod_dt = lecture_info.mod_dt
                    else:
                        if member_data.mod_dt > lecture_info.mod_dt:
                            member_data.mod_dt = lecture_info.mod_dt

                    member_data.lecture_id = lecture_info.lecture_id

        member_data.lecture_counts = class_lecture_count
        if member_data.reg_info is None or str(member_data.reg_info) != str(user_id):
            if lecture_finish_count == 0:
                member_data.sex = ''
                member_data.birthday_dt = ''
                if member_data.phone is None:
                    member_data.phone = ''
                else:
                    member_data.phone = '***-****-' + member_data.phone[7:]
                member_data.user.email = ''

        member_data.start_date = str(member_data.start_date)
        member_data.end_date = str(member_data.end_date)
        member_data.mod_dt = str(member_data.mod_dt)
        if member_data.phone is None:
            member_data.phone = ''
        if member_data.sex is None:
            member_data.sex = ''
        if member_data.birthday_dt is None or member_data.birthday_dt == '':
            member_data.birthday_dt = ''
        else:
            member_data.birthday_dt = str(member_data.birthday_dt)
        member_list.append(member_data)

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
                                                                 en_dis_type=ON_SCHEDULE_TYPE).order_by('-start_dt')

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


def func_add_lecture_info(user_id, user_last_name, user_first_name, class_id, group_id, counts, price,
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

    if group_id != '' and group_id is not None:
        try:
            group_info = GroupTb.objects.get(group_id=group_id)
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'

        if error is None:
            group_counter = GroupLectureTb.objects.filter(group_tb_id=group_id, use=USE).count()
            if group_info.group_type_cd == 'NORMAL':
                if group_counter >= group_info.member_num:
                    error = '그룹 정원을 초과했습니다.'
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
                                         lecture_reg_count=counts, lecture_rem_count=lecture_rem_count,
                                         lecture_avail_count=lecture_rem_count, price=price, option_cd='DC',
                                         state_cd=state_cd,
                                         start_date=start_date, end_date=end_date,
                                         note=contents, use=USE)
                lecture_info.save()
                auth_cd = 'DELETE'
                if group_id != '' and group_id is not None:
                    auth_cd = 'WAIT'

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

                if group_id != '' and group_id is not None:
                    group_info = GroupLectureTb(group_tb_id=group_id, lecture_tb_id=lecture_info.lecture_id, use=USE)
                    group_info.save()

        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:
        member_name = ''
        try:
            user_info = MemberTb.objects.get(member_id=member_id)
            member_name = user_info.name
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

        log_data = LogTb(log_type='LB01', auth_member_id=user_id, from_member_name=user_last_name+user_first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='등록', use=USE)

        log_data.save()

    return error


def func_delete_lecture_info(user_id, class_id, lecture_id, member_id):
    error = None
    class_lecture_info = None
    lecture_info = None
    user = None
    member = None

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
        # print(member.name+'test1:'+str(lecture_id))
        # lecture_info = class_lecture_info.lecture_tb
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'
    if error is None:
        # group_data = None
        # schedule_data = None
        # schedule_data_finish = None
        # repeat_schedule_data = None
        # member_lecture_list = None
        group_data = GroupLectureTb.objects.filter(lecture_tb_id=lecture_id, use=USE)
        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_id,
                                                  state_cd='NP')
        schedule_data_finish = ScheduleTb.objects.filter(lecture_tb_id=lecture_id,
                                                         state_cd='PE')
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

                if len(group_data) > 0:
                    for group_info in group_data:
                        group_data_total_size = GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                                                                              use=USE).count()
                        group_data_end_size = \
                            GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                                                          use=USE).exclude(lecture_tb__state_cd='IP').count()
                        group_info_data = group_info.group_tb
                        # try:
                        #     group_info_data = GroupTb.objects.get(group_id=group_info.group_tb_id)
                        # except ObjectDoesNotExist:
                        #     error = '그룹 정보를 불러오지 못했습니다.'
                        if group_info_data.use == USE:
                            if group_data_total_size == group_data_end_size:
                                group_info_data.state_cd = 'PE'
                                group_info_data.save()
                            else:
                                group_info_data.state_cd = 'IP'
                                group_info_data.save()
            else:
                if len(group_data) > 0:
                    group_data.update(use=UN_USE)
                schedule_data.update(use=UN_USE)
                schedule_data_finish.update(use=UN_USE)
                class_lecture_info.auth_cd = 'DELETE'
                # lecture_info.use = 0
                # lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
                # if lecture_info.state_cd == 'IP':
                #    lecture_info.state_cd = 'PE'
                class_lecture_info.save()
                if lecture_info.state_cd == 'IP':
                    lecture_info.state_cd = 'PE'
                    lecture_info.lecture_avail_count = 0
                    lecture_info.lecture_rem_count = 0
                    lecture_info.save()

                if len(group_data) > 0:
                    for group_info in group_data:
                        group_data_total_size = GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                                                                              use=USE).count()
                        group_data_end_size = \
                            GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                                                          use=USE).exclude(lecture_tb__state_cd='IP').count()
                        group_info_data = group_info.group_tb
                        # try:
                        #     group_info_data = GroupTb.objects.get(group_id=group_info.group_tb_id)
                        # except ObjectDoesNotExist:
                        #     error = '그룹 정보를 불러오지 못했습니다.'
                        if group_info_data.use == USE:
                            if group_data_total_size == group_data_end_size:
                                group_info_data.state_cd = 'PE'
                                group_info_data.save()
                            else:
                                group_info_data.state_cd = 'IP'
                                group_info_data.save()
        else:
            class_lecture_info.delete()
            member_lecture_list.delete()
            schedule_data.delete()
            schedule_data_finish.delete()
            repeat_schedule_data.delete()
            lecture_info.delete()
            # 회원의 수강정보가 더이상 없는경우

            if len(group_data) > 0:
                for group_info in group_data:
                    group_data_total_size = GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                                                                          use=USE).count()
                    group_data_end_size = \
                        GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                                                      use=USE).exclude(lecture_tb__state_cd='IP').count()

                    group_info_data = group_info.group_tb
                    if group_info_data.use == USE:
                        if group_data_total_size == group_data_end_size:
                            group_info_data.state_cd = 'PE'
                            group_info_data.save()

            if member.reg_info is not None:
                if str(member.reg_info) == str(user_id):
                    member_lecture_list_confirm = MemberLectureTb.objects.filter(member_id=user.id).count()
                    if member_lecture_list_confirm == 0:
                        member.delete()
                        user.delete()
    return error


def func_get_trainer_setting_list(context, user_id, class_id):
    lt_res_01 = '00:00-23:59'
    lt_res_02 = 0
    lt_res_03 = '0'
    lt_res_04 = '00:00-23:59'
    lt_res_05 = '14'
    lt_res_cancel_time = lt_res_02*60
    lt_res_enable_time = lt_res_02*60
    lt_res_member_time_duration = 1
    lt_res_member_start_time = 'A-0'
    lt_schedule_auto_finish = AUTO_FINISH_OFF
    lt_lecture_auto_finish = AUTO_FINISH_OFF
    lt_lan_01 = 'KOR'
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

    context['lt_res_01'] = lt_res_01
    context['lt_res_02'] = lt_res_02
    context['lt_res_03'] = lt_res_03
    context['lt_res_04'] = lt_res_04
    context['lt_res_05'] = lt_res_05
    context['lt_lan_01'] = lt_lan_01
    context['lt_res_enable_time'] = lt_res_enable_time
    context['lt_res_cancel_time'] = lt_res_cancel_time
    context['lt_res_member_time_duration'] = lt_res_member_time_duration
    context['lt_res_member_start_time'] = lt_res_member_start_time
    context['lt_schedule_auto_finish'] = lt_schedule_auto_finish
    context['lt_lecture_auto_finish'] = lt_lecture_auto_finish

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
        lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__member_id=member_id,
                                                     lecture_tb__use=USE,
                                                     auth_cd='VIEW').order_by('-lecture_tb__start_date',
                                                                              '-lecture_tb__reg_dt')

        for lecture_info_data in lecture_data:
            lecture_info = lecture_info_data.lecture_tb
            # lecture_info.start_date = str(lecture_info.start_date)
            # lecture_info.end_date = str(lecture_info.end_date)
            # lecture_info.mod_dt = str(lecture_info.mod_dt)
            # lecture_info.reg_dt = str(lecture_info.reg_dt)

            lecture_info.group_name = '1:1 레슨'
            lecture_info.group_type_cd = ''
            lecture_info.group_member_num = ''
            lecture_info.group_state_cd = ''
            lecture_info.group_state_cd_nm = ''
            lecture_info.group_note = ''
            # group_check = 0
            # group_info = None
            lecture_test = None

            lecture_info.lecture_finish_count = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                          lecture_tb_id=lecture_info.lecture_id,
                                                                          state_cd='PE').count()

            # try:
            #     group_info = GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_id, use=USE)
            # except ObjectDoesNotExist:
            #     group_check = 1
            group_check = lecture_info_data.get_group_lecture_check()
            group_info = lecture_info_data.get_group_lecture_info()
            if group_check != 0:
                if group_check == 1:
                    lecture_info.group_name = '[그룹] ' + group_info.group_tb.name
                else:
                    lecture_info.group_name = '[클래스] ' + group_info.group_tb.name
                lecture_info.group_type_cd = group_info.group_tb.group_type_cd
                lecture_info.group_member_num = group_info.group_tb.member_num
                lecture_info.group_note = group_info.group_tb.note
                lecture_info.group_state_cd = group_info.group_tb.state_cd
                try:
                    state_cd_nm = CommonCdTb.objects.get(common_cd=group_info.group_tb.state_cd)
                    lecture_info.group_state_cd_nm = state_cd_nm.common_cd_nm
                except ObjectDoesNotExist:
                    error = '오류가 발생했습니다.'

            try:
                lecture_test = MemberLectureTb.objects.get(lecture_tb__lecture_id=lecture_info.lecture_id)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'

            lecture_info.auth_cd = lecture_test.auth_cd
            lecture_info.auth_cd_name = lecture_test.get_auth_cd_name()

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

