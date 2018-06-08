import copy

from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.db import transaction
from django.utils import timezone

from configs.const import ON_SCHEDULE_TYPE
from login.models import MemberTb, LogTb, CommonCdTb
from schedule.models import ClassLectureTb, ClassTb, GroupLectureTb, MemberLectureTb, GroupTb, LectureTb, ScheduleTb, \
    SettingTb, RepeatScheduleTb


def func_get_class_member_id_list(class_id):
    all_member = []
    class_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                       auth_cd='VIEW',
                                                       lecture_tb__use=1, use=1).order_by('lecture_tb__member__name').values('lecture_tb__member').distinct()

    for class_lecture_info in class_lecture_data:
        all_member.append(class_lecture_info['lecture_tb__member'])

    return all_member


def func_get_member_ing_list(class_id, user_id):

    member_list = []

    all_member = func_get_class_member_id_list(class_id)

    for member_info in all_member:

        try:
            member_data = MemberTb.objects.get(member_id=member_info)
        except ObjectDoesNotExist:
            error = None
        if member_data.user.is_active:
            member_data.is_active = True
        else:
            if str(member_data.reg_info) == str(user_id):
                member_data.is_active = False
            else:
                member_data.is_active = True

        lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                     lecture_tb__member_id=member_data.member_id,
                                                     auth_cd='VIEW',
                                                     lecture_tb__use=1,
                                                     use=1)
        lecture_count = lecture_list.filter(lecture_tb__state_cd='IP').count()

        if lecture_count > 0:

            member_data.rj_lecture_counts = 0
            member_data.np_lecture_counts = 0

            member_data.lecture_reg_count_yet = 0
            member_data.lecture_rem_count_yet = 0
            member_data.lecture_avail_count_yet = 0

            member_data.lecture_counts = len(lecture_list)
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
            # member_data.lecture_available_id = ''

            lecture_count = 0

            for lecture_info_data in lecture_list:
                lecture_info = lecture_info_data.lecture_tb

                if lecture_info_data.auth_cd == 'DELETE':
                    member_data.rj_lecture_counts += 1
                if lecture_info_data.auth_cd == 'WAIT':
                    member_data.np_lecture_counts += 1

                group_check = 0
                try:
                    GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_id, use=1)
                except ObjectDoesNotExist:
                    group_check = 1

                if group_check == 0:
                    if member_data.group_info == '':
                        member_data.group_info = '그룹'
                    else:
                        if '그룹' in member_data.group_info:
                            member_data.group_info = member_data.group_info
                        else:
                            member_data.group_info += '/그룹'
                else:
                    if member_data.group_info == '':
                        member_data.group_info = '1:1'
                    else:
                        if '1:1' in member_data.group_info:
                            member_data.group_info = member_data.group_info
                        else:
                            member_data.group_info = '1:1/' + member_data.group_info

                lecture_count += MemberLectureTb.objects.filter(member_id=member_data.member_id,
                                                                lecture_tb=lecture_info.lecture_id,
                                                                auth_cd='VIEW', lecture_tb__use=1,
                                                                use=1).count()

                if lecture_info.use != 0:
                    if lecture_info.state_cd == 'IP':
                        if group_check == 0:
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
                        member_data.end_date = lecture_info.end_date
                        # if member_data.lecture_available_id == '':
                        #     if lecture_info.lecture_avail_count > 0:
                        #         member_data.lecture_available_id = lecture_info.lecture_id

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
            if member_data.reg_info is None or str(member_data.reg_info) != str(user_id):
                if lecture_count == 0:
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

            if member_data.birthday_dt is None or member_data.birthday_dt == '':
                member_data.birthday_dt = ''
            else:
                member_data.birthday_dt = str(member_data.birthday_dt)
            member_list.append(member_data)

    return member_list


def func_get_member_end_list(class_id, user_id):

    member_list = []

    all_member = func_get_class_member_id_list(class_id)

    for member_info in all_member:

        try:
            member_data = MemberTb.objects.get(member_id=member_info)
        except ObjectDoesNotExist:
            error = None
        if member_data.user.is_active:
            member_data.is_active = True
        else:
            if str(member_data.reg_info) == str(user_id):
                member_data.is_active = False
            else:
                member_data.is_active = True

        lecture_finish_check = 0
        # 강좌에 해당하는 수강/회원 정보 가져오기

        lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                     lecture_tb__member_id=member_data.member_id,
                                                     auth_cd='VIEW',
                                                     lecture_tb__use=1,
                                                     use=1)
        lecture_count = lecture_list.filter(lecture_tb__state_cd='IP').count()

        if lecture_count == 0 and len(lecture_list) > 0:
            lecture_finish_check = 1

        if lecture_finish_check > 0:
            member_data.rj_lecture_counts = 0
            member_data.np_lecture_counts = 0

            member_data.lecture_reg_count_yet = 0
            member_data.lecture_rem_count_yet = 0
            member_data.lecture_avail_count_yet = 0

            member_data.lecture_counts = len(lecture_list)
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
            # member_data.lecture_available_id = ''
            lecture_finish_count = 0

            for lecture_info_data in lecture_list:
                lecture_info = lecture_info_data.lecture_tb
                if lecture_info_data.auth_cd == 'DELETE':
                    member_data.rj_lecture_counts += 1
                if lecture_info_data.auth_cd == 'WAIT':
                    member_data.np_lecture_counts += 1

                group_check = 0
                try:
                    GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_id, use=1)
                except ObjectDoesNotExist:
                    group_check = 1

                if group_check == 0:
                    if member_data.group_info == '':
                        member_data.group_info = '그룹'
                    else:
                        if '그룹' in member_data.group_info:
                            member_data.group_info = member_data.group_info
                        else:
                            member_data.group_info += '/그룹'
                else:
                    if member_data.group_info == '':
                        member_data.group_info = '1:1'
                    else:
                        if '1:1' in member_data.group_info:
                            member_data.group_info = member_data.group_info
                        else:
                            member_data.group_info = '1:1/' + member_data.group_info

                lecture_finish_count += MemberLectureTb.objects.filter(member_id=member_data.member_id,
                                                                       lecture_tb=lecture_info.lecture_id,
                                                                       auth_cd='VIEW', lecture_tb__use=1,
                                                                       use=1).count()

                if lecture_info.use != 0:
                    if group_check == 0:
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
                    member_data.end_date = lecture_info.end_date

                    # if member_data.lecture_available_id == '':
                    #     if lecture_info.lecture_avail_count > 0:
                    #         member_data.lecture_available_id = lecture_info.lecture_id
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

            if member_data.reg_info is None or str(member_data.reg_info) != str(user_id):
                if lecture_finish_count == 0:
                    member_data.sex = ''
                    member_data.birthday_dt = ''
                    if member_data.phone is None:
                        member_data.phone = ''
                    else:
                        member_data.phone = '***-****-' + member_data.phone[7:]
                    member_data.user.email = ''

            if member_data.phone is None:
                member_data.phone = ''
            member_data.start_date = str(member_data.start_date)
            member_data.end_date = str(member_data.end_date)
            member_data.mod_dt = str(member_data.mod_dt)
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
        lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                     auth_cd='VIEW',
                                                     lecture_tb__member_id=member_id,
                                                     lecture_tb__use='1', use=1).order_by('-lecture_tb__start_date', '-lecture_tb__reg_dt')

    if error is None:
        # 강사 클래스의 반복일정 불러오기
        if len(lecture_list) > 0:
            idx = len(lecture_list)+1
            for lecture_list_info in lecture_list:
                lecture_info = lecture_list_info.lecture_tb
                idx -= 1
                # try:
                #     MemberLectureTb.objects.get(auth_cd='VIEW', member_id=member_id,
                #                                 lecture_tb=lecture_info.lecture_id)
                # except ObjectDoesNotExist:
                #     error = '수강정보를 불러오지 못했습니다.'

                if error is None:
                    pt_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                 en_dis_type=ON_SCHEDULE_TYPE).order_by('-start_dt')

                    if pt_schedule_data is not None and len(pt_schedule_data) > 0:
                        idx2 = len(pt_schedule_data)+1
                        for pt_schedule_info in pt_schedule_data:
                            idx2 -= 1
                            pt_schedule_info.start_dt = str(pt_schedule_info.start_dt)
                            pt_schedule_info.end_dt = str(pt_schedule_info.end_dt)
                            pt_schedule_info.mod_dt = str(pt_schedule_info.mod_dt)
                            pt_schedule_info.reg_dt = str(pt_schedule_info.reg_dt)
                            pt_schedule_info.idx = str(idx)+'-'+str(idx2)

                            if pt_schedule_info.note is None:
                                pt_schedule_info.note = ''
                            # 끝난 스케쥴인지 확인
                            if pt_schedule_info.state_cd == 'PE':
                                pt_schedule_info.finish_check = 1
                            else:
                                pt_schedule_info.finish_check = 0
                            pt_schedule_list.append(pt_schedule_info)
                else:
                    error = None
    context['pt_schedule_data'] = pt_schedule_list

    if error is None:
        context['error'] = error

    return context


def func_add_lecture_info(user_id, user_last_name, user_first_name, class_id, group_id, counts, price, start_date, end_date, contents, member_id):

    error = None
    lecture_info = None
    if group_id != '' and group_id is not None:
        try:
            group_info = GroupTb.objects.get(group_id=group_id)
        except ObjectDoesNotExist:
            error = '그룹 정보를 불러오지 못했습니다.'

        if error is None:
            group_counter = GroupLectureTb.objects.filter(group_tb_id=group_id, use=1).count()
            if group_info.group_type_cd == 'NORMAL':
                if group_counter >= group_info.member_num:
                    error = '그룹 허용 인원을 초과했습니다.'

    if error is None:
        try:
            with transaction.atomic():

                state_cd = 'IP'

                lecture_info = LectureTb(member_id=member_id,
                                         lecture_reg_count=counts, lecture_rem_count=counts,
                                         lecture_avail_count=counts, price=price, option_cd='DC',
                                         state_cd=state_cd,
                                         start_date=start_date, end_date=end_date,
                                         note=contents,
                                         mod_dt=timezone.now(),
                                         reg_dt=timezone.now(), use=1)
                lecture_info.save()

                member_lecture_info = MemberLectureTb(member_id=member_id, lecture_tb_id=lecture_info.lecture_id,
                                                      auth_cd='DELETE', mod_member_id=user_id,
                                                      reg_dt=timezone.now(), mod_dt=timezone.now(),
                                                      use=1)
                member_lecture_info.save()
                class_lecture_info = ClassLectureTb(class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                                                    auth_cd='VIEW', mod_member_id=user_id,
                                                    reg_dt=timezone.now(), mod_dt=timezone.now(),
                                                    use=1)
                class_lecture_info.save()

                if group_id != '' and group_id is not None:
                    group_info = GroupLectureTb(group_tb_id=group_id, lecture_tb_id=lecture_info.lecture_id, use=1)
                    group_info.save()

        except ValueError as e:
            error = '오류가 발생했습니다. 다시 시도해주세요.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'

    if error is None:
        member_name = ''
        try:
            user_info = MemberTb.objects.get(member_id=user_id)
            member_name = user_info.name
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

        log_data = LogTb(log_type='LB01', auth_member_id=user_id, from_member_name=user_last_name+user_first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='등록',
                         reg_dt=timezone.now(), use=1)

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
            class_lecture_info = ClassLectureTb.objects.get(class_tb_id=class_id, lecture_tb_id=lecture_id)
            # lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            user = User.objects.get(id=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

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
        group_data = None
        schedule_data = None
        schedule_data_finish = None
        repeat_schedule_data = None
        member_lecture_list = None
        group_data = GroupLectureTb.objects.filter(lecture_tb_id=lecture_id, use=1)
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
                                                                              use=1).count()
                        group_data_end_size = GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                                                                            use=1).exclude(lecture_tb__state_cd='IP').count()
                        group_info_data = group_info.group_tb
                        # try:
                        #     group_info_data = GroupTb.objects.get(group_id=group_info.group_tb_id)
                        # except ObjectDoesNotExist:
                        #     error = '그룹 정보를 불러오지 못했습니다.'
                        if error is None:
                            if group_data_total_size == group_data_end_size:
                                group_info_data.state_cd = 'PE'
                                group_info_data.save()
                            else:
                                group_info_data.state_cd = 'IP'
                                group_info_data.save()
                        else:
                            error = None
            else:
                if len(group_data) > 0:
                    group_data.update(mod_dt=timezone.now(), use=0)
                schedule_data.update(mod_dt=timezone.now(), use=0)
                schedule_data_finish.update(mod_dt=timezone.now(), use=0)
                class_lecture_info.auth_cd = 'DELETE'
                # lecture_info.use = 0
                # lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
                class_lecture_info.mod_dt = timezone.now()
                # if lecture_info.state_cd == 'IP':
                #    lecture_info.state_cd = 'PE'
                class_lecture_info.save()
                if lecture_info.state_cd == 'IP':
                    lecture_info.state_cd = 'PE'
                    lecture_info.mod_dt = timezone.now()
                    lecture_info.save()

                if len(group_data) > 0:
                    for group_info in group_data:
                        group_data_total_size = GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                                                                              use=1).count()
                        group_data_end_size = GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                                                                            use=1).exclude(lecture_tb__state_cd='IP').count()
                        group_info_data = group_info.group_tb
                        # try:
                        #     group_info_data = GroupTb.objects.get(group_id=group_info.group_tb_id)
                        # except ObjectDoesNotExist:
                        #     error = '그룹 정보를 불러오지 못했습니다.'
                        if error is None:
                            if group_data_total_size == group_data_end_size:
                                group_info_data.state_cd = 'PE'
                                group_info_data.save()
                            else:
                                group_info_data.state_cd = 'IP'
                                group_info_data.save()
                        else:
                            error = None
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
                    group_data_total_size = GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id, use=1).count()
                    group_data_end_size = GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                                                                        use=1).exclude(lecture_tb__state_cd='IP').count()

                    if group_data_total_size == group_data_end_size:
                        try:
                            group_info_data = group_info.group_tb
                            group_info_data.state_cd = 'PE'
                            group_info_data.save()
                        except ObjectDoesNotExist:
                            error = None

            if member.reg_info is not None:
                if str(member.reg_info) == str(user_id):
                    member_lecture_list_confirm = MemberLectureTb.objects.filter(member_id=user.id).count()
                    if member_lecture_list_confirm == 0:
                        member.delete()
                        user.delete()
    return error


def func_get_trainer_setting_list(context, user_id, class_id):

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_01', use=1)
        lt_res_01 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_01 = '00:00-23:59'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_02', use=1)
        lt_res_02 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_02 = '0'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_03', use=1)
        lt_res_03 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_03 = '0'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_04', use=1)
        lt_res_04 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_04 = '00:00-23:59'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_05', use=1)
        lt_res_05 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_05 = '14'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_LAN_01', use=1)
        lt_lan_01 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_lan_01 = 'KOR'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_PUS_01', use=1)
        lt_pus_data = setting_data.setting_info.split('/')
        lt_pus_01 = lt_pus_data[0]
        lt_pus_02 = lt_pus_data[1]
    except ObjectDoesNotExist:
        lt_pus_01 = ''
        lt_pus_02 = ''

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_PUS_02', use=1)
        lt_pus_03 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_pus_03 = ''

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_PUS_03', use=1)
        lt_pus_04 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_pus_04 = ''

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_PUS_04', use=1)
        lt_pus_data = setting_data.setting_info.split('/')
        lt_pus_05 = lt_pus_data[0]
        lt_pus_06 = lt_pus_data[1]
    except ObjectDoesNotExist:
        lt_pus_05 = ''
        lt_pus_06 = ''

    context['lt_res_01'] = lt_res_01
    context['lt_res_02'] = lt_res_02
    context['lt_res_03'] = lt_res_03
    context['lt_res_04'] = lt_res_04
    context['lt_res_05'] = lt_res_05
    context['lt_lan_01'] = lt_lan_01

    context['lt_pus_01'] = lt_pus_01
    context['lt_pus_02'] = lt_pus_02
    context['lt_pus_03'] = lt_pus_03
    context['lt_pus_04'] = lt_pus_04
    context['lt_pus_05'] = lt_pus_05
    context['lt_pus_06'] = lt_pus_06

    return context


def func_get_lecture_list(context, class_id, member_id):
    error = None
    class_data = None
    context['error'] = None
    lecture_counts = 0
    np_lecture_counts = 0
    if class_id is None or class_id == '':
        error = '강사 정보를 불러오지 못했습니다.'

    if member_id is None or member_id == '':
        error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_data = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_data.trainer_info = MemberTb.objects.get(member_id=class_data.member_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_data.class_type_name = CommonCdTb.objects.get(common_cd=class_data.subject_cd)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__member_id=member_id,
                                                     lecture_tb__use=1, auth_cd='VIEW').order_by('-lecture_tb__start_date', '-lecture_tb__reg_dt')

        for lecture_info_data in lecture_data:
            lecture_info = lecture_info_data.lecture_tb
            lecture_info.start_date = str(lecture_info.start_date)
            lecture_info.end_date = str(lecture_info.end_date)
            lecture_info.mod_dt = str(lecture_info.mod_dt)
            lecture_info.reg_dt = str(lecture_info.reg_dt)

            lecture_info.group_name = '1:1'
            lecture_info.group_type_cd = ''
            lecture_info.group_member_num = ''
            lecture_info.group_state_cd = ''
            lecture_info.group_state_cd_nm = ''
            lecture_info.group_note = ''
            group_check = 0
            group_info = None

            lecture_info.lecture_finish_count = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                          lecture_tb_id=lecture_info.lecture_id,
                                                                          state_cd='PE').count()

            try:
                group_info = GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_id, use=1)
            except ObjectDoesNotExist:
                group_check = 1

            if group_check == 0:
                lecture_info.group_name = group_info.group_tb.name
                lecture_info.group_type_cd = group_info.group_tb.group_type_cd
                lecture_info.group_member_num = group_info.group_tb.member_num
                lecture_info.group_note = group_info.group_tb.note
                lecture_info.group_state_cd = group_info.group_tb.state_cd
                try:
                    state_cd_nm = CommonCdTb.objects.get(common_cd=group_info.group_tb.state_cd)
                    lecture_info.group_state_cd_nm = state_cd_nm.common_cd_nm
                except ObjectDoesNotExist:
                    error = '그룹 정보를 불러오지 못했습니다.'

            try:
                lecture_info.state_cd_name = CommonCdTb.objects.get(common_cd=lecture_info.state_cd)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'
            try:
                lecture_test = MemberLectureTb.objects.get(lecture_tb__lecture_id=lecture_info.lecture_id)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'

            lecture_info.auth_cd = lecture_test.auth_cd

            try:
                lecture_info.auth_cd_name = CommonCdTb.objects.get(common_cd=lecture_info.auth_cd)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'

            if lecture_info.auth_cd == 'WAIT':
                np_lecture_counts += 1
            lecture_counts += 1

            if '\r\n' in lecture_info.note:
                lecture_info.note = lecture_info.note.replace('\r\n', ' ')

    class_data.lecture_counts = lecture_counts
    class_data.np_lecture_counts = np_lecture_counts
    context['class_data'] = class_data
    context['lecture_data'] = lecture_data

    # print(error)
    if error is not None:
        context['error'] = error

    return context

