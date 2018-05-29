from schedule.models import ClassLectureTb


def func_get_class_member_list(class_id):
    all_member = []
    class_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                       auth_cd='VIEW',
                                                       lecture_tb__use=1, use=1).order_by('lecture_tb__member__name')
    for class_lecture_info in class_lecture_data:

        if len(all_member) == 0:
            all_member.append(class_lecture_info.lecture_tb.member)
        check_info = 0

        for all_member_info in all_member:
            if class_lecture_info.lecture_tb.member.member_id == all_member_info.member_id:
                check_info = 1

        if check_info == 0:
            all_member.append(class_lecture_info.lecture_tb.member)

    return all_member
