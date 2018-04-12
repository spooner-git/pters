# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models

from center.models import CenterTb
from login.models import MemberTb


class ClassTb(models.Model):
    class_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    center_tb = models.ForeignKey(CenterTb, on_delete=models.CASCADE, null=True)
    subject_cd = models.CharField(db_column='SUBJECT_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    subject_detail_nm = models.CharField(db_column='SUBJECT_DETAIL_NM', max_length=20, blank=True, null=True)  # Field name made lowercase.
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    class_hour = models.FloatField(db_column='CLASS_HOUR', blank=True, null=True)  # Field name made lowercase.
    start_hour_unit = models.FloatField(db_column='START_HOUR_UNIT', blank=True, null=True)  # Field name made lowercase.
    class_member_num = models.IntegerField(db_column='CLASS_MEMBER_NUM', blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    # member_view_state_cd = models.CharField(db_column='MEMBER_VIEW_STATE_CD', max_length=20, blank=True, null=True, default='WAIT')  # Field name made lowercase.
    schedule_check = models.IntegerField(db_column='SCHEDULE_CHECK', blank=True, null=True)
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CLASS_TB'

    def __str__(self):
        return self.member.__str__()+'_class'


class LectureTb(models.Model):
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
    refund_price = models.IntegerField(db_column='REFUND_PRICE', blank=True, null=True, default=0)  # Field name made lowercase.
    option_cd = models.CharField(db_column='OPTION_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    # member_view_state_cd = models.CharField(db_column='MEMBER_VIEW_STATE_CD', max_length=20, blank=True, null=True, default='WAIT')  # Field name made lowercase.
    schedule_check = models.IntegerField(db_column='SCHEDULE_CHECK', blank=True, null=True, default=0)
    note = models.CharField(db_column='NOTE', max_length=255, blank=True, null=True, default='')  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'LECTURE_TB'

    def __str__(self):
        return self.member.__str__()+'_lecture'


class RepeatScheduleTb(models.Model):
    repeat_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, default='', blank=True, null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, default='', blank=True, null=True)  # Field name made lowercase.
    repeat_type_cd = models.CharField(db_column='REPEAT_TYPE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    week_info = models.CharField(db_column='WEEK_INFO', max_length=100, blank=True, null=True)  # Field name made lowercase.
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    start_time = models.CharField(db_column='START_TIME', max_length=20, blank=True, null=True)  # Field name made lowercase.
    time_duration = models.CharField(db_column='TIME_DURATION', max_length=20, blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, null=True)  # Field name made lowercase.
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'REPEAT_SCHEDULE_TB'

    def __str__(self):
        return self.class_tb.__str__()+'-'+self.lecture_tb.__str__()


class DeleteRepeatScheduleTb(models.Model):
    delete_repeat_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    repeat_schedule_id = models.IntegerField(db_column='REPEAT_SCHEDULE_ID', null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, default='', blank=True, null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, default='', blank=True, null=True)  # Field name made lowercase.
    repeat_type_cd = models.CharField(db_column='REPEAT_TYPE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    week_info = models.CharField(db_column='WEEK_INFO', max_length=100, blank=True, null=True)  # Field name made lowercase.
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    start_time = models.CharField(db_column='START_TIME', max_length=20, blank=True, null=True)  # Field name made lowercase.
    time_duration = models.CharField(db_column='TIME_DURATION', max_length=20, blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, null=True)  # Field name made lowercase.
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
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
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, default='', blank=True, null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, default='', blank=True, null=True)  # Field name made lowercase.
    delete_repeat_schedule_tb = models.IntegerField(db_column='DELETE_REPEAT_SCHEDULE_TB_ID', blank=True, null=True)  # Field name made lowercase.
    start_dt = models.DateTimeField(db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
    end_dt = models.DateTimeField(db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
    permission_state_cd = models.CharField(db_column='PERMISSION_STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    sign_data_url = models.CharField(db_column='SIGN_DATA_URL', max_length=255, blank=True, null=True)  # Field name made lowercase.
    note = models.CharField(db_column='NOTE', max_length=255, blank=True, null=True)
    member_note = models.CharField(db_column='MEMBER_NOTE', max_length=255, blank=True, null=True)
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, null=True)  # Field name made lowercase.
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    del_member = models.CharField(db_column='DEL_MEMBER_ID', max_length=20, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'DELETE_SCHEDULE_TB'


class ScheduleTb(models.Model):
    schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, default='', blank=True, null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, default='', blank=True, null=True)  # Field name made lowercase.
    repeat_schedule_tb = models.ForeignKey(RepeatScheduleTb, on_delete=models.SET_NULL, default='', blank=True, null=True) # Field name made lowercase.
    start_dt = models.DateTimeField(db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
    end_dt = models.DateTimeField(db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
    permission_state_cd = models.CharField(db_column='PERMISSION_STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    sign_data_url = models.CharField(db_column='SIGN_DATA_URL', max_length=255, blank=True, null=True)  # Field name made lowercase.
    max_mem_count = models.IntegerField(db_column='MAX_MEM_COUNT', default=1, blank=True, null=True)
    note = models.CharField(db_column='NOTE', max_length=255, blank=True, null=True)
    member_note = models.CharField(db_column='MEMBER_NOTE', max_length=255, blank=True, null=True)
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, null=True)  # Field name made lowercase.
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True, default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SCHEDULE_TB'


class SettingTb(models.Model):
    setting_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, default='', blank=True, null=True)  # Field name made lowercase.
    setting_type_cd = models.CharField(db_column='SETTING_TYPE_CD', max_length=10)  # Field name made lowercase.
    setting_info = models.CharField(db_column='SETTING_INFO', max_length=255, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SETTING_TB'


class CompanyTb(models.Model):
    company_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    name = models.CharField(db_column='NAME', max_length=20, blank=True, null=True)  # Field name made lowercase.
    phone = models.CharField(db_column='PHONE', max_length=20, blank=True, null=True)  # Field name made lowercase.
    address = models.CharField(db_column='ADDRESS', max_length=100, blank=True, null=True)  # Field name made lowercase.
    info = models.CharField(db_column='INFO', max_length=255, blank=True, null=True)  # Field name made lowercase.
    img_url = models.CharField(db_column='IMG_URL', max_length=255, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'COMPANY_TB'


class ClassLectureTb(models.Model):
    class_lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE)
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE)  # Field name made lowercase.
    auth_cd = models.CharField(db_column='AUTH_CD', max_length=20, blank=True, null=True)  # Field name made lowercase.
    mod_member_id = models.CharField(db_column='MOD_MEMBER_ID', max_length=20, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CLASS_LECTURE_TB'


class MemberClassTb(models.Model):
    member_class_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE)
    auth_cd = models.CharField(db_column='AUTH_CD', max_length=20, blank=True, null=True)  # Field name made lowercase.
    mod_member_id = models.CharField(db_column='MOD_MEMBER_ID', max_length=20, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MEMBER_CLASS_TB'


class MemberLectureTb(models.Model):
    member_lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE)
    auth_cd = models.CharField(db_column='AUTH_CD', max_length=20, blank=True, null=True)  # Field name made lowercase.
    mod_member_id = models.CharField(db_column='MOD_MEMBER_ID', max_length=20, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MEMBER_LECTURE_TB'
