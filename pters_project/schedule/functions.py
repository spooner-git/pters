from django.core.exceptions import ObjectDoesNotExist

from schedule.models import GroupLectureTb, ClassLectureTb


# 1:1 Lecture Id 조회
def func_get_lecture_id_test(class_id, member_id):

    lecture_id = None
    # 강좌에 해당하는 수강/회원 정보 가져오기
    lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                 lecture_tb__member_id=member_id,
                                                 lecture_tb__state_cd='IP',
                                                 lecture_tb__lecture_avail_count__gt=0,
                                                 lecture_tb__use=1).order_by('lecture_tb__start_date')

    for lecture_info in lecture_data:
        try:
            GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_tb.lecture_id)
        except ObjectDoesNotExist:
            lecture_id = lecture_info.lecture_tb.lecture_id

        if lecture_id is not None:
            break

    return lecture_id


# 그룹 Lecture Id 조회
def func_get_group_lecture_id_test():

    lecture_id = None

    start_date = None

    group_lecture_data = GroupLectureTb.objects.filter(group_tb_id=group_id, lecture_tb__member_id=member_id, use=1)
    for group_lecture_info in group_lecture_data:
        lecture_info = group_lecture_info.lecture_tb

        if lecture_id == '':
            if lecture_info.lecture_avail_count > 0:
                lecture_id = lecture_info.lecture_id

        if start_date is None or start_date == '':
            start_date = lecture_info.start_date
        else:
            if start_date > lecture_info.start_date:
                start_date = lecture_info.start_date
                if lecture_info.lecture_avail_count > 0:
                    lecture_id = lecture_info.lecture_id
    return lecture_id
