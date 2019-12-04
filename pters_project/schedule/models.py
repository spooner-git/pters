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
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    member_ticket_tb = models.ForeignKey(MemberTicketTb, on_delete=models.CASCADE, db_column='lecture_tb_id',
                                         null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, db_column='group_tb_id',
                                   null=True)  # Field name made lowercase.
    lecture_schedule_id = models.IntegerField(db_column='GROUP_SCHEDULE_ID', blank=True, null=True, default='')
    repeat_type_cd = models.CharField(db_column='REPEAT_TYPE_CD', max_length=10, blank=True, default='')
    week_info = models.CharField(db_column='WEEK_INFO', max_length=100, blank=True, default='')
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    start_time = models.CharField(db_column='START_TIME', max_length=20, blank=True, default='')
    end_time = models.CharField(db_column='END_TIME', max_length=20, blank=True, default='')
    time_duration = models.CharField(db_column='TIME_DURATION', max_length=20, blank=True, default='')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True, default='')
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, null=True, default='')
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'REPEAT_SCHEDULE_TB'

    def __str__(self):
        return self.class_tb.__str__()

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
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    member_ticket_tb = models.ForeignKey(MemberTicketTb, on_delete=models.CASCADE, db_column='lecture_tb_id', null=True)
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, db_column='group_tb_id',
                                   null=True)  # Field name made lowercase.
    lecture_schedule_id = models.IntegerField(db_column='GROUP_SCHEDULE_ID', blank=True, null=True, default='')
    repeat_schedule_tb = models.ForeignKey(RepeatScheduleTb, on_delete=models.SET_DEFAULT, null=True, default='')
    start_dt = models.DateTimeField(db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
    end_dt = models.DateTimeField(db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
    alarm_dt = models.DateTimeField(db_column='ALARM_DT', blank=True, null=True)  # Field name made lowercase.
    permission_state_cd = models.CharField(db_column='PERMISSION_STATE_CD', max_length=10, blank=True, default='')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, default='')
    sign_data_url = models.CharField(db_column='SIGN_DATA_URL', max_length=255, blank=True, default='')
    max_mem_count = models.IntegerField(db_column='MAX_MEM_COUNT', default=1)
    note = models.CharField(db_column='NOTE', max_length=500, blank=True, default='')
    member_note = models.CharField(db_column='MEMBER_NOTE', max_length=500, blank=True, default='')
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, default='')
    ing_color_cd = models.CharField(db_column='ING_COLOR_CD', max_length=20, default='#ffd3d9')
    end_color_cd = models.CharField(db_column='END_COLOR_CD', max_length=20, default='#d2d1cf')
    ing_font_color_cd = models.CharField(db_column='ING_FONT_COLOR_CD', max_length=20, default='#282828')
    end_font_color_cd = models.CharField(db_column='END_FONT_COLOR_CD', max_length=20, default='#282828')
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', default=USE)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SCHEDULE_TB'

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
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    member_ticket_tb = models.ForeignKey(MemberTicketTb, on_delete=models.CASCADE, db_column='lecture_tb_id',
                                         null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, db_column='group_tb_id',
                                   null=True)  # Field name made lowercase.
    lecture_schedule_id = models.IntegerField(db_column='GROUP_SCHEDULE_ID', blank=True, null=True, default='')
    delete_repeat_schedule_tb = models.IntegerField(db_column='DELETE_REPEAT_SCHEDULE_TB_ID',
                                                    blank=True, null=True, default='')
    start_dt = models.DateTimeField(db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
    end_dt = models.DateTimeField(db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
    permission_state_cd = models.CharField(db_column='PERMISSION_STATE_CD', max_length=10, blank=True, default='')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, default='')
    sign_data_url = models.CharField(db_column='SIGN_DATA_URL', max_length=255, blank=True, default='')
    note = models.CharField(db_column='NOTE', max_length=255, blank=True, default='')
    member_note = models.CharField(db_column='MEMBER_NOTE', max_length=255, blank=True, default='')
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, default='')
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, related_name='REG_MEMBER_ID', null=True)
    del_member = models.CharField(db_column='DEL_MEMBER_ID', max_length=20, blank=True, null=True, default='')
    # del_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, related_name='DEL_MEMBER_ID', null=True)
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', default=0)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'DELETE_SCHEDULE_TB'


class DeleteRepeatScheduleTb(models.Model):
    delete_repeat_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    repeat_schedule_id = models.IntegerField(db_column='REPEAT_SCHEDULE_ID', null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    member_ticket_tb = models.ForeignKey(MemberTicketTb, on_delete=models.CASCADE, db_column='lecture_tb_id',
                                         null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, db_column='group_tb_id',
                                   null=True)  # Field name made lowercase.
    lecture_schedule_id = models.IntegerField(db_column='GROUP_SCHEDULE_ID', blank=True, null=True, default='')
    repeat_type_cd = models.CharField(db_column='REPEAT_TYPE_CD', max_length=10, blank=True, default='')
    week_info = models.CharField(db_column='WEEK_INFO', max_length=100, blank=True, default='')
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    start_time = models.CharField(db_column='START_TIME', max_length=20, blank=True, default='')
    end_time = models.CharField(db_column='END_TIME', max_length=20, blank=True, default='')
    time_duration = models.CharField(db_column='TIME_DURATION', max_length=20, blank=True, default='')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, default='')
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, default='')
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', default=0)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'DELETE_REPEAT_SCHEDULE_TB'

    def __str__(self):
        return self.class_tb.__str__()+'-'+self.lecture_tb.__str__()


class HolidayTb(models.Model):
    holiday_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    holiday_dt = models.CharField(db_column='HOLIDAY_DT', max_length=10, blank=True, default='')
    holiday_name = models.CharField(db_column='HOLIDAY_NAME', max_length=20, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'HOLIDAY_TB'


class DailyRecordTb(TimeStampedModel):
    daily_record_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    schedule_tb = models.ForeignKey(ScheduleTb, on_delete=models.CASCADE, null=True)
    title = models.CharField(db_column='TITLE', max_length=500, blank=True, default='')
    contents = models.CharField(db_column='CONTENTS', max_length=3000, blank=True, default='')
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    is_member_view = models.IntegerField(db_column='IS_MEMBER_VIEW', default=0)  # Field name made lowercase.
    img_list = models.CharField(db_column='IMG_LIST', max_length=500, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=USE)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'DAILY_RECORD_TB'
