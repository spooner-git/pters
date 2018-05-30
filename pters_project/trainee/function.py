from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone

from login.models import MemberTb, HolidayTb, CommonCdTb
from schedule.models import ClassTb, MemberLectureTb, ClassLectureTb, ScheduleTb, RepeatScheduleTb, GroupLectureTb


def func_get_trainee_all_schedule_data(context, user_id, class_id, start_date, end_date):
    error = None

    context['lecture_info'] = None
    context['error'] = None
    off_schedule_start_datetime = []
    off_schedule_end_datetime = []
    pt_schedule_id = []
    pt_schedule_lecture_id = []
    pt_schedule_start_datetime = []
    pt_schedule_end_datetime = []
    pt_schedule_member_name = []
    pt_schedule_finish_check = []
    pt_schedule_note = []
    pt_schedule_idx = []
    pt_schedule_group_id = []

    pt_repeat_schedule_id = []
    pt_repeat_schedule_type = []
    pt_repeat_schedule_week_info = []
    pt_repeat_schedule_start_date = []
    pt_repeat_schedule_end_date = []
    pt_repeat_schedule_start_time = []
    pt_repeat_schedule_time_duration = []

    group_schedule_id = []
    group_schedule_start_datetime = []
    group_schedule_end_datetime = []
    group_schedule_finish_check = []
    group_schedule_note = []
    group_schedule_group_id = []
    group_schedule_name = []
    group_schedule_max_member_num = []
    group_schedule_current_member_num = []
    group_list = None
    class_info = None
    if class_id is None or class_id == '':
        error = '강사 정보를 불러오지 못했습니다.'

    # 내가 속한 일정 조회

    if error is None:
        idx = 0
        member_lecture_data = MemberLectureTb.objects.filter(auth_cd='VIEW', member_id=user_id).order_by('lecture_tb__start_date')

        for member_lecture_info in member_lecture_data:
            idx += 1
            schedule_data = ScheduleTb.objects.get(class_tb_id=class_id, en_dis_type='1',
                                                   lecture_tb_id=member_lecture_info,
                                                   start_dt__gte=start_date, end_dt__lt=end_date).order_by('start_dt')
            idx2 = 0

            for schedule_info in schedule_data:
                idx2 += 1
                # lecture schedule id 셋팅
                pt_schedule_id.append(schedule_info.schedule_id)
                # lecture schedule 에 해당하는 lecture id 셋팅
                pt_schedule_lecture_id.append(schedule_info.lecture_tb_id)
                pt_schedule_start_datetime.append(str(schedule_info.start_dt))
                pt_schedule_end_datetime.append(str(schedule_info.end_dt))
                pt_schedule_idx.append(str(idx)+'-'+str(idx))
                pt_schedule_group_id.append(schedule_info.group_tb_id)
                if schedule_info.note is None:
                    pt_schedule_note.append('')
                else:
                    pt_schedule_note.append(schedule_info.note)
                # 끝난 스케쥴인지 확인
                if schedule_info.state_cd == 'PE':
                    pt_schedule_finish_check.append(1)
                else:
                    pt_schedule_finish_check.append(0)

            pt_repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=member_lecture_info.lecture_tb_id,
                                                                      en_dis_type='1')
            if pt_repeat_schedule_data is not None:
                for pt_repeat_schedule_info in pt_repeat_schedule_data:
                    pt_repeat_schedule_id.append(pt_repeat_schedule_info.repeat_schedule_id)
                    pt_repeat_schedule_type.append(pt_repeat_schedule_info.repeat_type_cd)
                    pt_repeat_schedule_week_info.append(pt_repeat_schedule_info.week_info)
                    pt_repeat_schedule_start_date.append(str(pt_repeat_schedule_info.start_date))
                    pt_repeat_schedule_end_date.append(str(pt_repeat_schedule_info.end_date))
                    pt_repeat_schedule_start_time.append(pt_repeat_schedule_info.start_time)
                    pt_repeat_schedule_time_duration.append(pt_repeat_schedule_info.time_duration)

    # 내가 속한 그룹 일정 조회
    if error is None:
        group_list = func_get_trainee_group_ing_list(class_id, user_id)

        for group_info in group_list:
            group_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                            group_tb_id=group_info.group_tb.group_id,
                                                            lecture_tb__isnull=True,
                                                            en_dis_type='1',
                                                            start_dt__gte=start_date,
                                                            start_dt__lt=end_date).order_by('start_dt')

            for group_schedule_info in group_schedule_data:
                # lecture schedule id 셋팅
                group_schedule_id.append(group_schedule_info.schedule_id)
                group_schedule_start_datetime.append(str(group_schedule_info.start_dt))
                group_schedule_end_datetime.append(str(group_schedule_info.end_dt))
                if group_schedule_info.group_tb is not None and group_schedule_info.group_tb != '':
                    schedule_current_member_num = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                            group_tb_id=group_schedule_info.group_tb.group_id,
                                                                            lecture_tb__isnull=False,
                                                                            start_dt=group_schedule_info.start_dt,
                                                                            end_dt=group_schedule_info.end_dt).count()
                    group_schedule_group_id.append(group_schedule_info.group_tb.group_id)
                    group_schedule_name.append(group_schedule_info.group_tb.name)
                    group_schedule_max_member_num.append(group_schedule_info.group_tb.member_num)
                    group_schedule_current_member_num.append(schedule_current_member_num)

                if group_schedule_info.note is None:
                    group_schedule_note.append('')
                else:
                    group_schedule_note.append(group_schedule_info.note)
                # 끝난 스케쥴인지 확인
                if group_schedule_info.state_cd == 'PE':
                    group_schedule_finish_check.append(1)
                else:
                    group_schedule_finish_check.append(0)

    # off 스케쥴 전달
    if error is None:
        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                  start_dt__gte=start_date,
                                                  end_dt__lt=end_date).order_by('-lecture_tb__start_date','start_dt')

        for schedule_info in schedule_data:
            if schedule_info.group_tb is None or schedule_info.group_tb == '':
                # on 스케쥴
                if schedule_info.en_dis_type == '1':
                    if schedule_info.lecture_tb.member_id != user_id:
                        off_schedule_start_datetime.append(str(schedule_info.start_dt))
                        off_schedule_end_datetime.append(str(schedule_info.end_dt))
                else:
                # off 스케쥴
                    off_schedule_start_datetime.append(str(schedule_info.start_dt))
                    off_schedule_end_datetime.append(str(schedule_info.end_dt))

            else:
                # 그룹 스케쥴
                group_check = 0
                for group_info in group_list:
                    if schedule_info.group_tb_id != group_info.group_tb.group_id:
                        group_check = 1

                if group_check == 0:
                    off_schedule_start_datetime.append(str(schedule_info.start_dt))
                    off_schedule_end_datetime.append(str(schedule_info.end_dt))

    holiday = HolidayTb.objects.filter(use=1)

    if error is not None:
        context['error'] = error

    context['off_schedule_start_datetime'] = off_schedule_start_datetime
    context['off_schedule_end_datetime'] = off_schedule_end_datetime

    context['pt_schedule_id'] = pt_schedule_id
    context['pt_schedule_lecture_id'] = pt_schedule_lecture_id
    context['pt_schedule_member_name'] = pt_schedule_member_name
    context['pt_schedule_start_datetime'] = pt_schedule_start_datetime
    context['pt_schedule_end_datetime'] = pt_schedule_end_datetime
    context['pt_schedule_finish_check'] = pt_schedule_finish_check
    context['pt_schedule_note'] = pt_schedule_note
    context['pt_schedule_idx'] = pt_schedule_idx

    context['pt_repeat_schedule_id_data'] = pt_repeat_schedule_id
    context['pt_repeat_schedule_type_data'] = pt_repeat_schedule_type
    context['pt_repeat_schedule_week_info_data'] = pt_repeat_schedule_week_info
    context['pt_repeat_schedule_start_date_data'] = pt_repeat_schedule_start_date
    context['pt_repeat_schedule_end_date_data'] = pt_repeat_schedule_end_date
    context['pt_repeat_schedule_start_time_data'] = pt_repeat_schedule_start_time
    context['pt_repeat_schedule_time_duration_data'] = pt_repeat_schedule_time_duration

    context['group_schedule_id'] = group_schedule_id
    context['group_schedule_start_datetime'] = group_schedule_start_datetime
    context['group_schedule_end_datetime'] = group_schedule_end_datetime
    context['group_schedule_group_id'] = group_schedule_group_id
    context['group_schedule_name'] = group_schedule_name
    context['group_schedule_max_member_num'] = group_schedule_max_member_num
    context['group_schedule_current_member_num'] = group_schedule_current_member_num
    context['group_schedule_note'] = group_schedule_note
    context['group_schedule_finish_check'] = group_schedule_finish_check

    context['holiday'] = holiday

    return context


def func_get_trainee_group_ing_list(class_id, user_id):
    group_list = []
    lecture_data = MemberLectureTb.objects.filter(member_id=user_id,
                                                  lecture_tb__state_cd='IP',
                                                  auth_cd='VIEW',
                                                  use=1).order_by('-lecture_tb__start_date')

    for lecture_info in lecture_data:
        group_lecture_check = 0
        try:
            group_lecture_info = GroupLectureTb.objects.get(group_tb__class_tb_id=class_id,
                                                            lecture_tb_id=lecture_info.lecture_tb_id, use=1)
        except ObjectDoesNotExist:
            group_lecture_check = 1

        if group_lecture_check == 0:
            check = 0

            try:
                state_cd_nm = CommonCdTb.objects.get(common_cd=group_lecture_info.group_tb.state_cd)
                group_lecture_info.group_tb.state_cd_nm = state_cd_nm.common_cd_nm
            except ObjectDoesNotExist:
                error = '그룹 정보를 불러오지 못했습니다.'

            if len(group_list) == 0:
                group_list.append(group_lecture_info)

            for group_info in group_list:

                if group_info.group_tb_id == group_lecture_info.group_tb_id:
                    check = 1
            if check == 0:
                group_list.append(group_lecture_info)

    return group_list
