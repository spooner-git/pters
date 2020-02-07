# from django.db import models

# Create your models here.
from django.core.exceptions import ObjectDoesNotExist
from django.db import models

from configs.const import LECTURE_TYPE_ONE_TO_ONE, BOARD_TYPE_CD_NOTICE, TO_MEMBER_BOARD_TYPE_CD_TRAINEE
from configs.models import TimeStampedModel
from login.models import MemberTb, CommonCdTb
from payment.models import FunctionAuthTb
from trainee.models import MemberTicketTb


# 센터 <-> 강사 정보
class CenterTb(TimeStampedModel):
    center_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    center_name = models.CharField(db_column='CENTER_NAME', max_length=20, blank=True, null=True)
    address = models.CharField(db_column='ADDRESS', max_length=255, blank=True, null=True)  # Field name made lowercase.
    center_type_cd = models.CharField(db_column='CENTER_TYPE_CD', max_length=20, blank=True, null=True)
    center_img_url = models.CharField(db_column='CENTER_IMG_URL', max_length=255, blank=True, null=True)
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CENTER_TB'

    def __str__(self):
        return self.center_name.__str__()+'_center'


# 센터 <-> 강사 연결 정보
class CenterTrainerTb(TimeStampedModel):
    center_trainer_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    center = models.ForeignKey(CenterTb, on_delete=models.CASCADE)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CENTER_TRAINER_TB'


# 회사 정보
class CompanyTb(TimeStampedModel):
    company_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    name = models.CharField(db_column='NAME', max_length=20, blank=True, default='')  # Field name made lowercase.
    phone = models.CharField(db_column='PHONE', max_length=20, blank=True, default='')  # Field name made lowercase.
    address = models.CharField(db_column='ADDRESS', max_length=100, blank=True, default='')
    info = models.CharField(db_column='INFO', max_length=255, blank=True, default='')  # Field name made lowercase.
    img_url = models.CharField(db_column='IMG_URL', max_length=255, blank=True, default='')
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'COMPANY_TB'


# 프로그램 정보
class ClassTb(TimeStampedModel):
    class_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    center_tb = models.ForeignKey(CenterTb, on_delete=models.SET_NULL, blank=True, null=True)
    subject_cd = models.CharField(db_column='SUBJECT_CD', max_length=10, blank=True, default='')
    subject_detail_nm = models.CharField(db_column='SUBJECT_DETAIL_NM', max_length=20, blank=True, default='')
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    class_hour = models.IntegerField(db_column='CLASS_HOUR', blank=True, null=True)  # Field name made lowercase.
    start_hour_unit = models.IntegerField(db_column='START_HOUR_UNIT', blank=True, null=True)
    class_member_num = models.IntegerField(db_column='CLASS_MEMBER_NUM', default=1)
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, default='')
    schedule_check = models.IntegerField(db_column='SCHEDULE_CHECK', default=1)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CLASS_TB'

    def __str__(self):
        return self.member.__str__()+'_class'

    def get_upper_class_type_cd(self):
        try:
            group_cd = CommonCdTb.objects.get(common_cd=self.subject_cd).group_cd
        except ObjectDoesNotExist:
            group_cd = ''

        return group_cd

    def get_upper_class_type_cd_name(self):
        try:
            group_cd_nm = CommonCdTb.objects.get(common_cd=self.subject_cd).group_cd_nm
        except ObjectDoesNotExist:
            group_cd_nm = ''

        return group_cd_nm

    def get_class_type_cd_name(self):
        try:
            subject_type_name = CommonCdTb.objects.get(common_cd=self.subject_cd).common_cd_nm
        except ObjectDoesNotExist:
            subject_type_name = ''

        if self.subject_detail_nm is not None and self.subject_detail_nm != '':
            subject_type_name = self.subject_detail_nm

        return subject_type_name

    def get_state_cd_name(self):
        try:
            state_cd_name = CommonCdTb.objects.get(common_cd=self.state_cd).common_cd_nm
        except ObjectDoesNotExist:
            state_cd_name = ''

        return state_cd_name

    def get_center_name(self):
        if self.center_tb_id is not None and self.center_tb_id != '':
            center_name = self.center_tb.center_name
        else:
            center_name = ''

        return center_name


# 강사 <-> 강사 프로그램 연결 정보
class MemberClassTb(TimeStampedModel):
    member_class_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)
    auth_cd = models.CharField(db_column='AUTH_CD', max_length=20, blank=True,
                               default='')  # Field name made lowercase.
    mod_member_id = models.CharField(db_column='MOD_MEMBER_ID', max_length=20, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MEMBER_CLASS_TB'


# 강사 프로그램 <-> 회원 수강권 연결 정보
class ClassMemberTicketTb(TimeStampedModel):
    class_member_ticket_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)
    member_ticket_tb = models.ForeignKey(MemberTicketTb, db_column='lecture_tb_id',
                                         on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    auth_cd = models.CharField(db_column='AUTH_CD', max_length=20, blank=True, default='')  # Field name made lowercase.
    mod_member_id = models.CharField(db_column='MOD_MEMBER_ID', max_length=20, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CLASS_LECTURE_TB'

    def get_auth_cd_name(self):

        try:
            auth_cd_name = CommonCdTb.objects.get(common_cd=self.auth_cd).common_cd_nm
        except ObjectDoesNotExist:
            auth_cd_name = ''
        return auth_cd_name


# 수업 정보
class LectureTb(TimeStampedModel):
    lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, blank=True, null=True)
    ing_color_cd = models.CharField(db_column='ING_COLOR_CD', max_length=20, default='#ffd3d9')
    end_color_cd = models.CharField(db_column='END_COLOR_CD', max_length=20, default='#d2d1cf')
    ing_font_color_cd = models.CharField(db_column='ING_FONT_COLOR_CD', max_length=20, default='#282828')
    end_font_color_cd = models.CharField(db_column='END_FONT_COLOR_CD', max_length=20, default='#282828')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)
    member_num = models.IntegerField(db_column='MEMBER_NUM', default=2)  # Field name made lowercase.
    # member_num_view_flag = models.IntegerField(db_column='MEMBER_NUM_VIEW_FLAG', default=LECTURE_MEMBER_NUM_VIEW_ENABLE)
    lecture_type_cd = models.CharField(db_column='GROUP_TYPE_CD', max_length=20, blank=True, null=True,
                                       default=LECTURE_TYPE_ONE_TO_ONE)
    name = models.CharField(db_column='NAME', max_length=255, blank=True, null=True, default='')
    note = models.CharField(db_column='NOTE', max_length=1000, blank=True, null=True, default='')
    lecture_minute = models.IntegerField(db_column='GROUP_MINUTE', default=60)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'GROUP_TB'

    def __str__(self):
        return self.name.__str__()+'_lecture'

    def get_state_cd_name(self):
        try:
            state_cd_name = CommonCdTb.objects.get(common_cd=self.state_cd).common_cd_nm
        except ObjectDoesNotExist:
            state_cd_name = ''

        return state_cd_name


# 수강권 정보
class TicketTb(TimeStampedModel):
    ticket_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, blank=True, null=True)
    name = models.CharField(db_column='NAME', max_length=255, blank=True, null=True, default='')
    ticket_type_cd = models.CharField(db_column='PACKAGE_TYPE_CD', max_length=20, blank=True, null=True, default='')
    effective_days = models.IntegerField(db_column='EFFECTIVE_DAYS', default=0)
    price = models.IntegerField(db_column='PRICE', default=0)
    month_schedule_enable = models.IntegerField(db_column='MONTH_SCHEDULE_ENABLE', default=99999)
    week_schedule_enable = models.IntegerField(db_column='WEEK_SCHEDULE_ENABLE', default=99999)
    day_schedule_enable = models.IntegerField(db_column='DAY_SCHEDULE_ENABLE', default=99999)
    reg_count = models.IntegerField(db_column='REG_COUNT', default=0)
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)
    note = models.CharField(db_column='NOTE', max_length=1000, blank=True, null=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PACKAGE_TB'

    def __str__(self):
        return self.name.__str__()+'_ticket'


# 수업 <-> 회원 수강권 연결 설정 (이제 사용 안함)
class LectureMemberTicketTb(TimeStampedModel):
    lecture_member_ticket_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, db_column='group_tb_id', blank=True, null=True)
    member_ticket_tb = models.ForeignKey(MemberTicketTb, on_delete=models.CASCADE, db_column='lecture_tb_id',
                                         blank=True, null=True)
    fix_state_cd = models.CharField(db_column='FIX_STATE_CD', max_length=20, blank=True, null=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'GROUP_LECTURE_TB'


# 수업 <-> 회원 연결 설정 (고정 회원)
class LectureMemberTb(TimeStampedModel):
    lecture_member_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, db_column='class_tb_id', blank=True, null=True)
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, db_column='group_tb_id', blank=True,
                                   null=True)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, db_column='member_id', blank=True, null=True)
    fix_state_cd = models.CharField(db_column='FIX_STATE_CD', max_length=20, blank=True, null=True, default='FIX')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'GROUP_MEMBER_TB'


# 수강권 <-> 수업 연결 설정
class TicketLectureTb(TimeStampedModel):
    ticket_lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, blank=True, null=True)
    ticket_tb = models.ForeignKey(TicketTb, on_delete=models.CASCADE, db_column='package_tb_id', blank=True, null=True)
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, db_column='group_tb_id', blank=True, null=True)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PACKAGE_GROUP_TB'


class BackgroundImgTb(TimeStampedModel):
    background_img_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)
    background_img_type_cd = models.CharField(db_column='BACKGROUND_IMG_TYPE_CD', max_length=45, blank=True, default='')
    url = models.CharField(db_column='URL', max_length=500, blank=True, default='')  # Field name made lowercase.
    reg_info = models.ForeignKey(MemberTb, on_delete=models.CASCADE, related_name='REG_INFO', null=True)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'BACKGROUND_IMG_TB'


class SettingTb(TimeStampedModel):
    setting_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, blank=True, null=True)  # Field name made lowercase.
    member_ticket_tb = models.ForeignKey(MemberTicketTb, on_delete=models.CASCADE, db_column='lecture_tb_id',
                                         blank=True, null=True)
    setting_type_cd = models.CharField(db_column='SETTING_TYPE_CD', max_length=10, default='')
    setting_info = models.CharField(db_column='SETTING_INFO', max_length=255, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SETTING_TB'


class ProgramAuthTb(TimeStampedModel):
    product_function_auth_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    function_auth_tb = models.ForeignKey(FunctionAuthTb, on_delete=models.CASCADE, null=True)
    auth_type_cd = models.CharField(db_column='AUTH_TYPE_CD', max_length=45, blank=True, null=True)
    enable_flag = models.IntegerField(db_column='ENABLE_FLAG', default=1)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PROGRAM_AUTH_TB'


class ProgramGroupTb(TimeStampedModel):
    program_group_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    name = models.CharField(db_column='NAME', max_length=255, blank=True, null=True)
    note = models.CharField(db_column='NOTE', max_length=1000, blank=True, null=True)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PROGRAM_GROUP_TB'


class ProgramGroupMemberTb(TimeStampedModel):
    program_group_member_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    program_group_tb = models.ForeignKey(ProgramGroupTb, on_delete=models.CASCADE, null=True)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)
    use = models.IntegerField(db_column='USE', default=1)

    class Meta:
        managed = False
        db_table = 'PROGRAM_GROUP_MEMBER_TB'


class ProgramBoardTb(TimeStampedModel):
    program_board_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    board_type_cd = models.CharField(db_column='BOARD_TYPE_CD', max_length=45, blank=True, null=True)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    to_member_type_cd = models.CharField(db_column='TO_MEMBER_TYPE_CD', max_length=45, blank=True, null=True)
    comment_available = models.IntegerField(db_column='COMMENT_AVAILABLE', default=1)  # Field name made lowercase.
    anonymous_available = models.IntegerField(db_column='ANONYMOUS_AVAILABLE', default=0)  # Field name made lowercase.
    important_flag = models.IntegerField(db_column='IMPORTANT_FLAG', default=0)  # Field name made lowercase.
    auth_type_cd = models.CharField(db_column='AUTH_TYPE_CD', max_length=45, blank=True, null=True)
    push_status = models.IntegerField(db_column='PUSH_STATUS', default=0)  # Field name made lowercase.
    order = models.IntegerField(db_column='ORDER', default=1)  # Field name made lowercase.
    name = models.CharField(db_column='NAME', max_length=100, blank=True, null=True)
    note = models.CharField(db_column='NOTE', max_length=1000, blank=True, null=True)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PROGRAM_BOARD_TB'


class ProgramBoardPostTb(TimeStampedModel):
    program_board_post_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    program_board_tb = models.ForeignKey(ProgramBoardTb, on_delete=models.CASCADE, null=True)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    comment_available = models.IntegerField(db_column='COMMENT_AVAILABLE', default=1)  # Field name made lowercase.
    upper_post_tb_id = models.CharField(db_column='UPPER_POST_ID', max_length=45, blank=True, null=True)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    to_member_type_cd = models.CharField(db_column='TO_MEMBER_TYPE_CD', max_length=45, blank=True, null=True)
    to_program_group_tb = models.ForeignKey(ProgramGroupTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    to_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, related_name='TO_MEMBER_ID', null=True)
    order = models.IntegerField(db_column='ORDER', default=1)  # Field name made lowercase.
    important_flag = models.IntegerField(db_column='IMPORTANT_FLAG', default=0)  # Field name made lowercase.
    title = models.CharField(db_column='TITLE', max_length=200, blank=True, null=True)
    contents = models.CharField(db_column='CONTENTS', max_length=3000, blank=True, null=True)
    auth_type_cd = models.CharField(db_column='AUTH_TYPE_CD', max_length=45, blank=True, null=True)
    popup_flag = models.IntegerField(db_column='POPUP_FLAG', default=0)  # Field name made lowercase.
    hits = models.BigIntegerField(db_column='HITS', default=0)  # Field name made lowercase.
    get = models.BigIntegerField(db_column='GET', default=0)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PROGRAM_BOARD_POST_TB'


class ProgramBoardCommentTb(TimeStampedModel):
    program_board_comment_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    program_board_post_tb = models.ForeignKey(ProgramBoardPostTb, on_delete=models.CASCADE, null=True)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    upper_comment_tb_id = models.CharField(db_column='UPPER_COMMENT_ID', max_length=45, blank=True, null=True)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    auth_type_cd = models.CharField(db_column='AUTH_TYPE_CD', max_length=45, blank=True, null=True)
    pin_status = models.IntegerField(db_column='PIN_STATUS', default=0)  # Field name made lowercase.
    title = models.CharField(db_column='TITLE', max_length=100, blank=True, null=True)
    comment = models.CharField(db_column='COMMENT', max_length=1000, blank=True, null=True)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PROGRAM_BOARD_COMMENT_TB'


class ProgramNoticeTb(models.Model):
    program_notice_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    notice_type_cd = models.CharField(db_column='NOTICE_TYPE_CD', max_length=20,
                                      blank=True, default=BOARD_TYPE_CD_NOTICE)
    title = models.CharField(db_column='TITLE', max_length=45, blank=True, null=True)
    contents = models.CharField(db_column='CONTENTS', max_length=3000, blank=True, null=True)
    to_member_type_cd = models.CharField(db_column='TO_MEMBER_TYPE_CD', max_length=20,
                                         blank=True, null=True, default=TO_MEMBER_BOARD_TYPE_CD_TRAINEE)
    hits = models.BigIntegerField(db_column='HITS', default=0)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True, auto_now_add=True)
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True, auto_now_add=True)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PROGRAM_NOTICE_TB'

