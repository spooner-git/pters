# from django.db import models

# Create your models here.
from django.core.exceptions import ObjectDoesNotExist
from django.db import models

from configs.const import LECTURE_TYPE_ONE_TO_ONE, BOARD_TYPE_CD_NOTICE, TO_MEMBER_BOARD_TYPE_CD_TRAINEE, \
    OWN_TYPE_OWNER, STATE_CD_IN_PROGRESS
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


# 지점 정보
class ClassTb(TimeStampedModel):
    class_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE)  # Field name made lowercase.
    center_tb = models.ForeignKey(CenterTb, on_delete=models.SET_NULL, blank=True, null=True)
    subject_cd = models.CharField('지점 코드', db_column='SUBJECT_CD', max_length=10, blank=True, default='')
    subject_detail_nm = models.CharField('지점명', db_column='SUBJECT_DETAIL_NM', max_length=20, blank=True, default='')
    start_date = models.DateField('시작일', db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField('종료일', db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    class_hour = models.IntegerField('지점지점 시간', db_column='CLASS_HOUR', blank=True, null=True)  # Field name made lowercase.
    start_hour_unit = models.IntegerField('지점지점 시간 단위', db_column='START_HOUR_UNIT', blank=True, null=True)
    class_member_num = models.IntegerField('지점지점 회원수', db_column='CLASS_MEMBER_NUM', default=1)
    state_cd = models.CharField('상태', db_column='STATE_CD', max_length=10, blank=True, default='')
    schedule_check = models.IntegerField(db_column='SCHEDULE_CHECK', default=1)

    class Meta:
        managed = False
        db_table = 'CLASS_TB'
        verbose_name = '지점'
        verbose_name_plural = '지점'

    def __str__(self):
        program_name = self.subject_cd.__str__()
        program_detail_name = self.subject_detail_nm.__str__()
        if program_detail_name is not None and program_detail_name != '':
            program_name = program_detail_name
        return self.member.__str__()+'/'+program_name+'(지점)'

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

    def get_subject_type_name(self):
        try:
            subject_type_name = CommonCdTb.objects.get(common_cd=self.subject_cd).common_cd_nm
        except ObjectDoesNotExist:
            subject_type_name = ''

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


# 강사 <-> 강사 지점 연결 정보
class MemberClassTb(TimeStampedModel):
    member_class_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.CASCADE, null=True)
    auth_cd = models.CharField('권한 코드', db_column='AUTH_CD', max_length=20, blank=True,
                               default='')  # Field name made lowercase.
    own_cd = models.CharField('권한 코드', db_column='OWN_CD', max_length=20, blank=True,
                              default=OWN_TYPE_OWNER)  # Field name made lowercase.
    mod_member_id = models.CharField('최종수정 회원 ID', db_column='MOD_MEMBER_ID', max_length=20, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'MEMBER_CLASS_TB'
        verbose_name = '강사->지점 연결 정보'
        verbose_name_plural = '강사->지점 연결 정보'


# 강사 지점 <-> 수강권 연결 정보
class ClassMemberTicketTb(TimeStampedModel):
    class_member_ticket_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.CASCADE, null=True)
    member_ticket_tb = models.ForeignKey(MemberTicketTb, verbose_name='수강권', db_column='lecture_tb_id',
                                         on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    auth_cd = models.CharField('권한 코드', db_column='AUTH_CD', max_length=20, blank=True, default='')
    mod_member_id = models.CharField('최종수정 회원 ID', db_column='MOD_MEMBER_ID', max_length=20, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'CLASS_LECTURE_TB'
        verbose_name = '지점->수강권 연결 정보'
        verbose_name_plural = '지점->수강권 연결 정보'

    def get_auth_cd_name(self):

        try:
            auth_cd_name = CommonCdTb.objects.get(common_cd=self.auth_cd).common_cd_nm
        except ObjectDoesNotExist:
            auth_cd_name = ''
        return auth_cd_name


# 공유 지점 권한 정보
class ProgramAuthTb(TimeStampedModel):
    product_function_auth_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    function_auth_tb = models.ForeignKey(FunctionAuthTb, verbose_name='기능', on_delete=models.CASCADE, null=True)
    auth_type_cd = models.CharField('권한', db_column='AUTH_TYPE_CD', max_length=45, blank=True, null=True)
    enable_flag = models.IntegerField('가능 유무', db_column='ENABLE_FLAG', default=1)

    class Meta:
        managed = False
        db_table = 'PROGRAM_AUTH_TB'
        verbose_name = '공유 지점 권한'
        verbose_name_plural = '공유 지점 권한'


class ProgramNoticeTb(models.Model):
    program_notice_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    notice_type_cd = models.CharField('공지 종류', db_column='NOTICE_TYPE_CD', max_length=20,
                                      blank=True, default=BOARD_TYPE_CD_NOTICE)
    title = models.CharField('제목', db_column='TITLE', max_length=45, blank=True, null=True)
    contents = models.CharField('내용', db_column='CONTENTS', max_length=3000, blank=True, null=True)
    to_member_type_cd = models.CharField('공지 대상', db_column='TO_MEMBER_TYPE_CD', max_length=20,
                                         blank=True, null=True, default=TO_MEMBER_BOARD_TYPE_CD_TRAINEE)
    hits = models.BigIntegerField('조회수', db_column='HITS', default=0)  # Field name made lowercase.
    reg_dt = models.DateTimeField('최초등록 시각', db_column='REG_DT', blank=True, null=True, auto_now_add=True)
    mod_dt = models.DateTimeField('최종수정 시각', db_column='MOD_DT', blank=True, null=True, auto_now_add=True)
    use = models.IntegerField('공개 여부', db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PROGRAM_NOTICE_TB'
        verbose_name = '지점 공지'
        verbose_name_plural = '지점 공지'

    def __str__(self):
        return self.class_tb.__str__()+'-'+self.title.__str__()


# 수업 정보
class LectureTb(TimeStampedModel):
    lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.CASCADE, blank=True, null=True)
    name = models.CharField('수업명', db_column='NAME', max_length=255, blank=True, null=True, default='')
    note = models.CharField('설명', db_column='NOTE', max_length=1000, blank=True, null=True, default='')
    ing_color_cd = models.CharField('진행중 색상', db_column='ING_COLOR_CD', max_length=20, default='#ffd3d9')
    end_color_cd = models.CharField('종료 색상', db_column='END_COLOR_CD', max_length=20, default='#d2d1cf')
    ing_font_color_cd = models.CharField('진행중 폰트 색상', db_column='ING_FONT_COLOR_CD', max_length=20, default='#282828')
    end_font_color_cd = models.CharField('종료 폰트 색상', db_column='END_FONT_COLOR_CD', max_length=20, default='#282828')
    state_cd = models.CharField('상태', db_column='STATE_CD', max_length=10, blank=True, null=True)
    member_num = models.IntegerField('정원', db_column='MEMBER_NUM', default=2)  # Field name made lowercase.
    # member_num_view_flag = models.IntegerField(db_column='MEMBER_NUM_VIEW_FLAG', default=LECTURE_MEMBER_NUM_VIEW_ENABLE)
    lecture_type_cd = models.CharField('수업 종류', db_column='GROUP_TYPE_CD', max_length=20, blank=True, null=True,
                                       default=LECTURE_TYPE_ONE_TO_ONE)
    lecture_minute = models.IntegerField(db_column='GROUP_MINUTE', default=60)  # Field name made lowercase.
    start_time = models.CharField('수업 시작 시각', db_column='START_TIME', max_length=20, blank=True,
                                  default='A-0')
    main_trainer = models.ForeignKey(MemberTb, verbose_name='담당 강사', on_delete=models.SET_NULL, related_name='MAIN_TRAINER_ID', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'GROUP_TB'
        verbose_name = '수업'
        verbose_name_plural = '수업'

    def __str__(self):
        return self.class_tb.__str__()+'-'+self.name.__str__()+'(수업)'

    def get_state_cd_name(self):
        try:
            state_cd_name = CommonCdTb.objects.get(common_cd=self.state_cd).common_cd_nm
        except ObjectDoesNotExist:
            state_cd_name = ''

        return state_cd_name


# 수강권 정보
class TicketTb(TimeStampedModel):
    ticket_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.CASCADE, blank=True, null=True)
    name = models.CharField('수강권명', db_column='NAME', max_length=255, blank=True, null=True, default='')
    note = models.CharField('설명', db_column='NOTE', max_length=1000, blank=True, null=True, default='')
    ticket_type_cd = models.CharField('수강권 종류', db_column='PACKAGE_TYPE_CD', max_length=20, blank=True, null=True, default='')
    effective_days = models.IntegerField('기본 유효기간', db_column='EFFECTIVE_DAYS', default=0)
    price = models.IntegerField('기본 가격', db_column='PRICE', default=0)
    reg_count = models.IntegerField('기본 등록횟수', db_column='REG_COUNT', default=0)
    month_schedule_enable = models.IntegerField('월간 최대 등록가능 횟수', db_column='MONTH_SCHEDULE_ENABLE', default=99999)
    week_schedule_enable = models.IntegerField('주간 최대 등록가능 횟수', db_column='WEEK_SCHEDULE_ENABLE', default=99999)
    day_schedule_enable = models.IntegerField('일간 최대 등록가능 횟수', db_column='DAY_SCHEDULE_ENABLE', default=99999)
    state_cd = models.CharField('상태', db_column='STATE_CD', max_length=10, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'PACKAGE_TB'
        verbose_name = '수강권'
        verbose_name_plural = '수강권'

    def __str__(self):
        return self.class_tb.__str__()+'-'+self.name.__str__()+'(수강권)'


# 수강권 <-> 수업 연결 설정
class TicketLectureTb(TimeStampedModel):
    ticket_lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.CASCADE, blank=True, null=True)
    ticket_tb = models.ForeignKey(TicketTb, verbose_name='수강권', on_delete=models.CASCADE, db_column='package_tb_id',
                                  blank=True, null=True)
    lecture_tb = models.ForeignKey(LectureTb, verbose_name='수업', on_delete=models.CASCADE, db_column='group_tb_id',
                                   blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'PACKAGE_GROUP_TB'
        verbose_name = '수강권->수업 연결 정보'
        verbose_name_plural = '수강권->수업 연결 정보'


# 수업 <-> 회원 연결 설정 (고정 회원)
class LectureMemberTb(TimeStampedModel):
    lecture_member_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.CASCADE, db_column='class_tb_id', blank=True, null=True)
    lecture_tb = models.ForeignKey(LectureTb, verbose_name='수업', on_delete=models.CASCADE, db_column='group_tb_id', blank=True,
                                   null=True)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, db_column='member_id', blank=True, null=True)
    fix_state_cd = models.CharField('고정', db_column='FIX_STATE_CD', max_length=20, blank=True, null=True, default='FIX')

    class Meta:
        managed = False
        db_table = 'GROUP_MEMBER_TB'
        verbose_name = '수업-고정회원 목록'
        verbose_name_plural = '수업-고정회원 목록'


class SettingTb(TimeStampedModel):
    setting_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.CASCADE, blank=True,
                                 null=True)  # Field name made lowercase.
    member_ticket_tb = models.ForeignKey(MemberTicketTb, verbose_name='수강권', on_delete=models.CASCADE,
                                         db_column='lecture_tb_id', blank=True, null=True)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    setting_type_cd = models.CharField('설정 타입', db_column='SETTING_TYPE_CD', max_length=10, default='')
    setting_info = models.CharField('설정값', db_column='SETTING_INFO', max_length=255, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'SETTING_TB'
        verbose_name = '설정'
        verbose_name_plural = '설정'


class ScheduleClosedTb(TimeStampedModel):
    schedule_closed_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    start_date = models.DateField('시작일', db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField('종료일', db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    week_info = models.CharField('반복 요일', db_column='WEEK_INFO', max_length=100, blank=True, default='')
    title = models.CharField('제목', db_column='TITLE', max_length=200, blank=True, default='')
    contents = models.CharField('내용', db_column='CONTENTS', max_length=3000, blank=True, default='')
    is_member_view = models.IntegerField('사유 공개 여부', db_column='IS_MEMBER_VIEW', default=0)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SCHEDULE_CLOSED_TB'
        verbose_name = '불가 일정 요약'
        verbose_name_plural = '불가 일정 요약'


class ScheduleClosedDayTb(TimeStampedModel):
    schedule_closed_day_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    schedule_closed_tb = models.ForeignKey(ScheduleClosedTb, verbose_name='불가 일정 요약 ID', on_delete=models.CASCADE,
                                           null=True)
    closed_date = models.DateField('휴무일', db_column='CLOSED_DATE', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'SCHEDULE_CLOSED_DAY_TB'
        verbose_name = '불가 일정 상세'
        verbose_name_plural = '불가 일정 상세'


# ################################################## 아직 사용 안함 ###################################################
class ProgramGroupTb(TimeStampedModel):
    program_group_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    name = models.CharField(db_column='NAME', max_length=255, blank=True, null=True)
    note = models.CharField(db_column='NOTE', max_length=1000, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'PROGRAM_GROUP_TB'


class ProgramGroupMemberTb(TimeStampedModel):
    program_group_member_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    program_group_tb = models.ForeignKey(ProgramGroupTb, on_delete=models.CASCADE, null=True)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)

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
    anonymous_available = models.IntegerField(db_column='ANONYMOUS_AVAILABLE',
                                              default=0)  # Field name made lowercase.
    important_flag = models.IntegerField(db_column='IMPORTANT_FLAG', default=0)  # Field name made lowercase.
    auth_type_cd = models.CharField(db_column='AUTH_TYPE_CD', max_length=45, blank=True, null=True)
    push_status = models.IntegerField(db_column='PUSH_STATUS', default=0)  # Field name made lowercase.
    order = models.IntegerField(db_column='ORDER', default=1)  # Field name made lowercase.
    name = models.CharField(db_column='NAME', max_length=100, blank=True, null=True)
    note = models.CharField(db_column='NOTE', max_length=1000, blank=True, null=True)

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
    to_program_group_tb = models.ForeignKey(ProgramGroupTb, on_delete=models.CASCADE,
                                            null=True)  # Field name made lowercase.
    to_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, related_name='TO_MEMBER_ID', null=True)
    order = models.IntegerField(db_column='ORDER', default=1)  # Field name made lowercase.
    important_flag = models.IntegerField(db_column='IMPORTANT_FLAG', default=0)  # Field name made lowercase.
    title = models.CharField(db_column='TITLE', max_length=200, blank=True, null=True)
    contents = models.CharField(db_column='CONTENTS', max_length=3000, blank=True, null=True)
    auth_type_cd = models.CharField(db_column='AUTH_TYPE_CD', max_length=45, blank=True, null=True)
    popup_flag = models.IntegerField(db_column='POPUP_FLAG', default=0)  # Field name made lowercase.
    hits = models.BigIntegerField(db_column='HITS', default=0)  # Field name made lowercase.
    get = models.BigIntegerField(db_column='GET', default=0)  # Field name made lowercase.

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

    class Meta:
        managed = False
        db_table = 'PROGRAM_BOARD_COMMENT_TB'


class ShopTb(TimeStampedModel):
    shop_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='회원', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    name = models.CharField('상품명', db_column='NAME', max_length=45, blank=True, null=True)
    price = models.IntegerField('가격', db_column='PRICE', default=0)
    note = models.CharField('설명', db_column='NOTE', max_length=200, blank=True, null=True)
    state_cd = models.CharField('상태', db_column='STATE_CD', max_length=10, blank=True, default=STATE_CD_IN_PROGRESS)

    class Meta:
        managed = False
        db_table = 'SHOP_TB'


# #######################################  이제 사용 안함  ##################################################
# 수강권 0원 입력 버그 표시 (이제 사용 안함)
class BugMemberTicketPriceTb(TimeStampedModel):
    bug_member_ticket_price_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    bug_check = models.IntegerField(db_column='BUG_CHECK', default=1)

    class Meta:
        managed = False
        db_table = 'BUG_MEMBER_TICKET_PRICE_TB'


# 수업 <-> 수강권 연결 설정 (이제 사용 안함)
class LectureMemberTicketTb(TimeStampedModel):
    lecture_member_ticket_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, db_column='group_tb_id', blank=True, null=True)
    member_ticket_tb = models.ForeignKey(MemberTicketTb, on_delete=models.CASCADE, db_column='lecture_tb_id',
                                         blank=True, null=True)
    fix_state_cd = models.CharField(db_column='FIX_STATE_CD', max_length=20, blank=True, null=True, default='')

    class Meta:
        managed = False
        db_table = 'GROUP_LECTURE_TB'


# 배경화면 설정 (이제 사용 안함)
class BackgroundImgTb(TimeStampedModel):
    background_img_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)
    background_img_type_cd = models.CharField(db_column='BACKGROUND_IMG_TYPE_CD', max_length=45, blank=True, default='')
    url = models.CharField(db_column='URL', max_length=500, blank=True, default='')  # Field name made lowercase.
    reg_info = models.ForeignKey(MemberTb, on_delete=models.CASCADE, related_name='REG_INFO', null=True)

    class Meta:
        managed = False
        db_table = 'BACKGROUND_IMG_TB'

