# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.core.exceptions import ObjectDoesNotExist
from django.db import models

from configs.models import TimeStampedModel
from configs.const import USE, SCHEDULE_NOT_FINISH, SCHEDULE_FINISH, SCHEDULE_ABSENCE
from login.models import MemberTb, CommonCdTb
from trainee.models import MemberTicketTb
from trainer.models import ClassTb, LectureTb


class RepeatScheduleTb(TimeStampedModel):
    repeat_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.SET_NULL, null=True)  # Field name made lowercase.
    member_ticket_tb = models.ForeignKey(MemberTicketTb, verbose_name='수강권', on_delete=models.SET_NULL, db_column='lecture_tb_id',
                                         null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, verbose_name='수업', on_delete=models.SET_NULL, db_column='group_tb_id',
                                   null=True)  # Field name made lowercase.
    lecture_schedule_id = models.IntegerField('상위 반복일정 ID', db_column='GROUP_SCHEDULE_ID', blank=True, null=True, default='')
    repeat_type_cd = models.CharField('반복 빈도', db_column='REPEAT_TYPE_CD', max_length=10, blank=True, default='')
    week_info = models.CharField('반복 요일', db_column='WEEK_INFO', max_length=100, blank=True, default='')
    start_date = models.DateField('시작일', db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField('종료일', db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    start_time = models.CharField('시작 시각', db_column='START_TIME', max_length=20, blank=True, default='')
    end_time = models.CharField('종료 시각', db_column='END_TIME', max_length=20, blank=True, default='')
    state_cd = models.CharField('진행 상태', db_column='STATE_CD', max_length=10, blank=True, null=True, default='')
    en_dis_type = models.CharField('일정 타입', db_column='EN_DIS_TYPE', max_length=10, blank=True, null=True, default='')
    extension_flag = models.IntegerField('자동 연장', db_column='EXTENSION_FLAG', default=0)
    reg_member = models.ForeignKey(MemberTb, verbose_name='최초등록 회원', on_delete=models.CASCADE, null=True)
    mod_member = models.ForeignKey(MemberTb, verbose_name='최종수정 회원', on_delete=models.CASCADE, related_name='MOD_MEMBER_ID', null=True)

    time_duration = models.CharField(db_column='TIME_DURATION', max_length=20, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'REPEAT_SCHEDULE_TB'
        verbose_name = '반복일정'
        verbose_name_plural = '반복일정'

    def __str__(self):
        return self.repeat_schedule_id.__str__()

    def get_lecture_name(self):

        if self.lecture_tb_id is not None and self.lecture_tb_id != '':
            lecture_name = self.lecture_tb.name
        else:
            lecture_name = ''

        return lecture_name

    def get_state_cd_name(self):
        try:
            state_cd_name = CommonCdTb.objects.get(common_cd=self.state_cd).common_cd_nm
        except ObjectDoesNotExist:
            state_cd_name = ''

        return state_cd_name


class ScheduleTb(TimeStampedModel):
    schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    member_ticket_tb = models.ForeignKey(MemberTicketTb, verbose_name='수강권', on_delete=models.CASCADE, db_column='lecture_tb_id', null=True)
    lecture_tb = models.ForeignKey(LectureTb, verbose_name='수업', on_delete=models.CASCADE, db_column='group_tb_id',
                                   null=True)  # Field name made lowercase.
    lecture_schedule_id = models.IntegerField('상위 일정 ID', db_column='GROUP_SCHEDULE_ID', blank=True, null=True, default='')
    repeat_schedule_tb = models.ForeignKey(RepeatScheduleTb, verbose_name='반복일정', on_delete=models.SET_DEFAULT, null=True, default='')
    daily_record_tb = models.ForeignKey('schedule.DailyRecordTb', verbose_name='일지', on_delete=models.SET_NULL, null=True, default='')
    schedule_alarm_tb = models.ForeignKey('schedule.ScheduleAlarmTb', verbose_name='PUSH 알람', on_delete=models.SET_NULL, null=True, default='')
    start_dt = models.DateTimeField('시작 일시', db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
    end_dt = models.DateTimeField('종료 일시', db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField('진행 상태', db_column='STATE_CD', max_length=10, blank=True, default='NP')
    permission_state_cd = models.CharField('승인 상태', db_column='PERMISSION_STATE_CD', max_length=10, blank=True, default='AP')
    max_mem_count = models.IntegerField('정원', db_column='MAX_MEM_COUNT', default=1)
    note = models.CharField('강사 메모(회원 공유)', db_column='NOTE', max_length=500, blank=True, default='')
    private_note = models.CharField('강사 메모(회원 공유x)', db_column='PRIVATE_NOTE', max_length=500, blank=True, default='')
    member_note = models.CharField('회원 메모', db_column='MEMBER_NOTE', max_length=500, blank=True, default='')
    en_dis_type = models.CharField('일정 타입', db_column='EN_DIS_TYPE', max_length=10, blank=True, default='')
    ing_color_cd = models.CharField('진행중 색상', db_column='ING_COLOR_CD', max_length=20, default='#ffd3d9')
    end_color_cd = models.CharField('종료 색상', db_column='END_COLOR_CD', max_length=20, default='#d2d1cf')
    ing_font_color_cd = models.CharField('진행중 폰트 색상', db_column='ING_FONT_COLOR_CD', max_length=20, default='#282828')
    end_font_color_cd = models.CharField('종료 폰트 색상', db_column='END_FONT_COLOR_CD', max_length=20, default='#282828')
    push_alarm_data = models.TextField('PUSH 알림', db_column='PUSH_ALARM_DATA')
    extension_flag = models.IntegerField('자동 연장', db_column='EXTENSION_FLAG', default=0)
    reg_member = models.ForeignKey(MemberTb, verbose_name='최초등록 회원', on_delete=models.CASCADE, null=True)
    mod_member = models.ForeignKey(MemberTb, verbose_name='최종수정 회원', on_delete=models.CASCADE, related_name='LAST_MOD_MEMBER_ID', null=True)

    sign_data_url = models.CharField(db_column='SIGN_DATA_URL', max_length=255, blank=True, default='')
    alarm_dt = models.DateTimeField(db_column='ALARM_DT', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SCHEDULE_TB'
        verbose_name = '일정'
        verbose_name_plural = '일정'

    def __str__(self):
        return self.schedule_id.__str__()

    def finish_check(self):
        if self.state_cd == 'PE':
            return SCHEDULE_FINISH
        elif self.state_cd == 'PC':
            return SCHEDULE_ABSENCE
        else:
            return SCHEDULE_NOT_FINISH

    def get_lecture_name(self):

        if self.lecture_tb_id is not None and self.lecture_tb_id != '':
            lecture_name = self.lecture_tb.name
        else:
            lecture_name = ''

        return lecture_name


class DeleteScheduleTb(models.Model):
    delete_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    schedule_id = models.IntegerField(db_column='SCHEDULE_ID', null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    member_ticket_tb = models.ForeignKey(MemberTicketTb, verbose_name='수강권', on_delete=models.CASCADE, db_column='lecture_tb_id',
                                         null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, verbose_name='수업', on_delete=models.CASCADE, db_column='group_tb_id', null=True)
    lecture_schedule_id = models.IntegerField('상위 일정 ID', db_column='GROUP_SCHEDULE_ID', blank=True, null=True, default='')
    delete_repeat_schedule_tb = models.IntegerField('반복일정 ID', db_column='DELETE_REPEAT_SCHEDULE_TB_ID',
                                                    blank=True, null=True, default='')
    daily_record_tb = models.ForeignKey('schedule.DailyRecordTb', verbose_name='일지', on_delete=models.CASCADE, db_column='daily_record_tb_id', null=True)
    start_dt = models.DateTimeField('시작 일시', db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
    end_dt = models.DateTimeField('종료 일시', db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField('진행 상태', db_column='STATE_CD', max_length=10, blank=True, default='')
    permission_state_cd = models.CharField('승인 상태', db_column='PERMISSION_STATE_CD', max_length=10, blank=True, default='')
    note = models.CharField('강사 메모', db_column='NOTE', max_length=255, blank=True, default='')
    member_note = models.CharField('회원 메모', db_column='MEMBER_NOTE', max_length=255, blank=True, default='')
    en_dis_type = models.CharField('일정 타입', db_column='EN_DIS_TYPE', max_length=10, blank=True, default='')
    extension_flag = models.IntegerField('자동 연장', db_column='EXTENSION_FLAG', default=0)
    reg_member = models.ForeignKey(MemberTb, verbose_name='최초등록 회원', on_delete=models.CASCADE, related_name='REG_MEMBER_ID', null=True)
    del_member = models.CharField('삭제 회원 ID', db_column='DEL_MEMBER_ID', max_length=20, blank=True, null=True, default='')
    # del_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, related_name='DEL_MEMBER_ID', null=True)
    reg_dt = models.DateTimeField('최초등록 시각', db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField('최종수정 시각', db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField('사용', db_column='USE', default=0)  # Field name made lowercase.

    sign_data_url = models.CharField(db_column='SIGN_DATA_URL', max_length=255, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'DELETE_SCHEDULE_TB'
        verbose_name = '삭제된 일정'
        verbose_name_plural = '삭제된 일정'


class DeleteRepeatScheduleTb(models.Model):
    delete_repeat_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    repeat_schedule_id = models.IntegerField(db_column='REPEAT_SCHEDULE_ID', null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    member_ticket_tb = models.ForeignKey(MemberTicketTb, verbose_name='수강권', on_delete=models.CASCADE, db_column='lecture_tb_id',
                                         null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, verbose_name='수업', on_delete=models.CASCADE, db_column='group_tb_id',
                                   null=True)  # Field name made lowercase.
    lecture_schedule_id = models.IntegerField('상위 반복일정 ID', db_column='GROUP_SCHEDULE_ID', blank=True, null=True, default='')
    repeat_type_cd = models.CharField('반복 빈도', db_column='REPEAT_TYPE_CD', max_length=10, blank=True, default='')
    week_info = models.CharField('반복 요일', db_column='WEEK_INFO', max_length=100, blank=True, default='')
    start_date = models.DateField('시작일', db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField('종료일', db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    start_time = models.CharField('시작 시각', db_column='START_TIME', max_length=20, blank=True, default='')
    end_time = models.CharField('종료 시각', db_column='END_TIME', max_length=20, blank=True, default='')
    state_cd = models.CharField('진행 상태', db_column='STATE_CD', max_length=10, blank=True, default='')
    en_dis_type = models.CharField('일정 타입', db_column='EN_DIS_TYPE', max_length=10, blank=True, default='')
    extension_flag = models.IntegerField('자동 연장', db_column='EXTENSION_FLAG', default=0)
    reg_member = models.ForeignKey(MemberTb, verbose_name='최초등록 회원', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField('최초등록 시각', db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField('최종수정 시각', db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField('사용', db_column='USE', default=0)  # Field name made lowercase.

    time_duration = models.CharField(db_column='TIME_DURATION', max_length=20, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'DELETE_REPEAT_SCHEDULE_TB'
        verbose_name = '삭제된 반복일정'
        verbose_name_plural = '삭제된 반복일정'


class HolidayTb(models.Model):
    holiday_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    holiday_dt = models.CharField('공유일', db_column='HOLIDAY_DT', max_length=10, blank=True, default='')
    holiday_name = models.CharField('명칭', db_column='HOLIDAY_NAME', max_length=20, blank=True, default='')
    use = models.IntegerField('사용', db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'HOLIDAY_TB'
        verbose_name = '공휴일'
        verbose_name_plural = '공휴일'


class DailyRecordTb(TimeStampedModel):
    daily_record_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    schedule_tb = models.ForeignKey(ScheduleTb, verbose_name='일정', on_delete=models.CASCADE, null=True)
    title = models.CharField('제목', db_column='TITLE', max_length=500, blank=True, default='')
    contents = models.CharField('내용', db_column='CONTENTS', max_length=3000, blank=True, default='')
    reg_member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    is_member_view = models.IntegerField('회원 조회 가능 여부', db_column='IS_MEMBER_VIEW', default=0)
    img_list = models.CharField('이미지 정보', db_column='IMG_LIST', max_length=500, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'DAILY_RECORD_TB'
        verbose_name = '일지'
        verbose_name_plural = '일지'

    def __str__(self):
        return self.title.__str__()


class ScheduleAlarmTb(TimeStampedModel):
    schedule_alarm_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, verbose_name='지점', on_delete=models.CASCADE, null=True)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)
    schedule_tb = models.ForeignKey(ScheduleTb, verbose_name='일정', on_delete=models.CASCADE, null=True)
    alarm_dt = models.DateTimeField('PUSH 알람 일시', db_column='alarm_dt', blank=True)
    alarm_minute = models.IntegerField('알람 시각', db_column='ALARM_MINUTE', default=0)

    class Meta:
        managed = False
        db_table = 'SCHEDULE_ALARM_TB'
        verbose_name = '일정 push 알림'
        verbose_name_plural = '일정 push 알림'
