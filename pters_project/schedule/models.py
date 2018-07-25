# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models

from center.models import CenterTb
from configs.models import TimeStampedModel
from login.models import MemberTb


class ClassTb(TimeStampedModel):
    class_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    center_tb = models.ForeignKey(CenterTb, on_delete=models.SET_NULL, null=True)
    subject_cd = models.CharField(db_column='SUBJECT_CD', max_length=10, blank=True, default='')
    subject_detail_nm = models.CharField(db_column='SUBJECT_DETAIL_NM', max_length=20, blank=True, default='')
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    class_hour = models.FloatField(db_column='CLASS_HOUR', blank=True, null=True)  # Field name made lowercase.
    start_hour_unit = models.FloatField(db_column='START_HOUR_UNIT', blank=True, null=True)
    class_member_num = models.IntegerField(db_column='CLASS_MEMBER_NUM', blank=True, null=True)
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, default='')
    schedule_check = models.IntegerField(db_column='SCHEDULE_CHECK', blank=True, null=True)
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CLASS_TB'

    def __str__(self):
        return self.member.__str__()+'_class'


class LectureTb(TimeStampedModel):
    lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    # class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE)  # Field name made lowercase.
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    lecture_reg_count = models.IntegerField(db_column='LECTURE_REG_COUNT', default=0)  # Field name made lowercase.
    lecture_rem_count = models.IntegerField(db_column='LECTURE_REM_COUNT', default=0)
    lecture_avail_count = models.IntegerField(db_column='LECTURE_AVAIL_COUNT', default=0)
    day_count = models.IntegerField(db_column='DAY_COUNT', blank=True, null=True)  # Field name made lowercase.
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    price = models.IntegerField(db_column='PRICE', blank=True, null=True, default=0)  # Field name made lowercase.
    refund_price = models.IntegerField(db_column='REFUND_PRICE', blank=True, null=True, default=0)
    refund_date = models.DateTimeField(db_column='REFUND_DATE', blank=True, null=True)  # Field name made lowercase.
    option_cd = models.CharField(db_column='OPTION_CD', max_length=10, blank=True, default='')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, default='')
    schedule_check = models.IntegerField(db_column='SCHEDULE_CHECK', blank=True, null=True, default=0)
    note = models.CharField(db_column='NOTE', max_length=255, blank=True, default='')
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'LECTURE_TB'

    def __str__(self):
        return self.member.__str__()+'_lecture'


class GroupTb(TimeStampedModel):
    group_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, default='', blank=True, null=True)
    group_type_cd = models.CharField(db_column='GROUP_TYPE_CD', max_length=45, blank=True, null=True)
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)
    member_num = models.IntegerField(db_column='MEMBER_NUM', default=2)  # Field name made lowercase.
    name = models.CharField(db_column='NAME', max_length=255, blank=True, null=True, default='')
    note = models.CharField(db_column='NOTE', max_length=1000, blank=True, null=True, default='')
    use = models.IntegerField(db_column='USE', blank=True, null=True, default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'GROUP_TB'

    def __str__(self):
        return self.name.__str__()+'_group'


class GroupLectureTb(TimeStampedModel):
    group_lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    group_tb = models.ForeignKey(GroupTb, on_delete=models.CASCADE, default='', blank=True, null=True)
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, default='', blank=True, null=True)
    use = models.IntegerField(db_column='USE', blank=True, null=True, default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'GROUP_LECTURE_TB'


class RepeatScheduleTb(TimeStampedModel):
    repeat_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_tb = models.ForeignKey(GroupTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_schedule_id = models.IntegerField(db_column='GROUP_SCHEDULE_ID', default='', blank=True)
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


class DeleteRepeatScheduleTb(models.Model):
    delete_repeat_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    repeat_schedule_id = models.IntegerField(db_column='REPEAT_SCHEDULE_ID', null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_tb = models.ForeignKey(GroupTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_schedule_id = models.IntegerField(db_column='GROUP_SCHEDULE_ID', default='', blank=True)
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
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'DELETE_REPEAT_SCHEDULE_TB'

    def __str__(self):
        return self.class_tb.__str__()+'-'+self.lecture_tb.__str__()


class DeleteScheduleTb(models.Model):
    delete_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    schedule_id = models.IntegerField(db_column='SCHEDULE_ID', null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_tb = models.ForeignKey(GroupTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_schedule_id = models.IntegerField(db_column='GROUP_SCHEDULE_ID', default='', blank=True)
    delete_repeat_schedule_tb = models.IntegerField(db_column='DELETE_REPEAT_SCHEDULE_TB_ID', default='', blank=True)
    start_dt = models.DateTimeField(db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
    end_dt = models.DateTimeField(db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
    permission_state_cd = models.CharField(db_column='PERMISSION_STATE_CD', max_length=10, blank=True, default='')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, default='')
    sign_data_url = models.CharField(db_column='SIGN_DATA_URL', max_length=255, blank=True, default='')
    note = models.CharField(db_column='NOTE', max_length=255, blank=True, default='')
    member_note = models.CharField(db_column='MEMBER_NOTE', max_length=255, blank=True, default='')
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, default='')
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, related_name='REG_MEMBER_ID', null=True)
    del_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, related_name='DEL_MEMBER_ID', null=True)
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True, default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'DELETE_SCHEDULE_TB'


class ScheduleTb(TimeStampedModel):
    schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_tb = models.ForeignKey(GroupTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_schedule_id = models.IntegerField(db_column='GROUP_SCHEDULE_ID', default='', blank=True)
    repeat_schedule_tb = models.ForeignKey(RepeatScheduleTb, on_delete=models.SET_DEFAULT, default='', null=True)
    start_dt = models.DateTimeField(db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
    end_dt = models.DateTimeField(db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
    permission_state_cd = models.CharField(db_column='PERMISSION_STATE_CD', max_length=10, blank=True, default='')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, default='')
    sign_data_url = models.CharField(db_column='SIGN_DATA_URL', max_length=255, blank=True, default='')
    max_mem_count = models.IntegerField(db_column='MAX_MEM_COUNT', default=1, blank=True, null=True)
    note = models.CharField(db_column='NOTE', max_length=255, blank=True, default='')
    member_note = models.CharField(db_column='MEMBER_NOTE', max_length=255, blank=True, default='')
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, default='')
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True, default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SCHEDULE_TB'


class SettingTb(TimeStampedModel):
    setting_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, default='', blank=True, null=True)
    setting_type_cd = models.CharField(db_column='SETTING_TYPE_CD', max_length=10, default='')
    setting_info = models.CharField(db_column='SETTING_INFO', max_length=255, blank=True, default='')
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SETTING_TB'


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


class ClassLectureTb(TimeStampedModel):
    class_lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE)
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE)  # Field name made lowercase.
    auth_cd = models.CharField(db_column='AUTH_CD', max_length=20, blank=True, default='')  # Field name made lowercase.
    mod_member_id = models.CharField(db_column='MOD_MEMBER_ID', max_length=20, blank=True, default='')
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CLASS_LECTURE_TB'


class MemberClassTb(TimeStampedModel):
    member_class_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE)
    auth_cd = models.CharField(db_column='AUTH_CD', max_length=20, blank=True, default='')  # Field name made lowercase.
    mod_member_id = models.CharField(db_column='MOD_MEMBER_ID', max_length=20, blank=True, default='')
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MEMBER_CLASS_TB'


class MemberLectureTb(TimeStampedModel):
    member_lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE)
    auth_cd = models.CharField(db_column='AUTH_CD', max_length=20, blank=True, default='')  # Field name made lowercase.
    mod_member_id = models.CharField(db_column='MOD_MEMBER_ID', max_length=20, blank=True, default='')
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MEMBER_LECTURE_TB'


class BackgroundImgTb(TimeStampedModel):
    background_img_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE)
    background_img_type_cd = models.CharField(db_column='BACKGROUND_IMG_TYPE_CD', max_length=45, blank=True, default='')
    url = models.CharField(db_column='URL', max_length=500, blank=True, default='')  # Field name made lowercase.
    reg_info = models.ForeignKey(MemberTb, on_delete=models.CASCADE, related_name='REG_INFO', null=True)
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'BACKGROUND_IMG_TB'
