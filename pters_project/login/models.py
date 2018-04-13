# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from __future__ import unicode_literals

from django.contrib.auth.models import User
from django.db import models


class MemberTb(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    member_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    name = models.CharField(db_column='NAME', max_length=20, blank=True, null=True)  # Field name made lowercase.
    phone = models.CharField(db_column='PHONE', max_length=20, blank=True, null=True)  # Field name made lowercase.
    age = models.IntegerField(db_column='AGE', blank=True, null=True)  # Field name made lowercase.
    sex = models.CharField(db_column='SEX', max_length=2, blank=True, null=True)  # Field name made lowercase.
    birthday_dt = models.DateField(db_column='BIRTHDAY_DT', blank=True, null=True)  # Field name made lowercase.
    country = models.CharField(db_column='COUNTRY', max_length=255, blank=True, null=True)  # Field name made lowercase.
    address = models.CharField(db_column='ADDRESS', max_length=255, blank=True, null=True)  # Field name made lowercase.
    job = models.CharField(db_column='JOB', max_length=20, blank=True, null=True)  # Field name made lowercase.
    contents = models.CharField(db_column='CONTENTS', max_length=255, blank=True, null=True, default='')  # Field name made lowercase.
    reg_info = models.CharField(db_column='REG_INFO', max_length=20, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True, default='1')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MEMBER_TB'

    def __str__(self):
        return self.name


class CommonCdTb(models.Model):
    group_cd = models.CharField(db_column='GROUP_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    common_cd = models.CharField(db_column='COMMON_CD', primary_key=True, max_length=10)  # Field name made lowercase.
    common_cd_nm = models.CharField(db_column='COMMON_CD_NM', max_length=100, blank=True, null=True)  # Field name made lowercase.
    group_cd_nm = models.CharField(db_column='GROUP_CD_NM', max_length=20, blank=True, null=True)  # Field name made lowercase.
    upper_common_cd = models.CharField(db_column='UPPER_COMMON_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    upper_group_cd = models.CharField(db_column='UPPER_GROUP_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    attribute1 = models.CharField(db_column='ATTRIBUTE1', max_length=255, blank=True, null=True)  # Field name made lowercase.
    order = models.IntegerField(db_column='ORDER', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True, default='1')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'COMMON_CD_TB'


class LogTb(models.Model):
    log_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    log_type = models.CharField(db_column='LOG_TYPE', max_length=20, blank=True, null=True)  # Field name made lowercase.
    auth_member_id = models.CharField(db_column='AUTH_MEMBER_ID', max_length=20, blank=True, null=True)  # Field name made lowercase.
    from_member_name = models.CharField(db_column='FROM_MEMBER_NAME', max_length=20, blank=True, null=True)  # Field name made lowercase.
    to_member_name = models.CharField(db_column='TO_MEMBER_NAME', max_length=20, blank=True, null=True)  # Field name made lowercase.
    class_tb_id = models.CharField(db_column='CLASS_TB_ID', max_length=20, blank=True, null=True)  # Field name made lowercase.
    lecture_tb_id = models.CharField(db_column='LECTURE_TB_ID', max_length=20, blank=True, null=True)  # Field name made lowercase.
    log_info = models.CharField(db_column='LOG_INFO', max_length=255, blank=True, null=True, default='')  # Field name made lowercase.
    log_how = models.CharField(db_column='LOG_HOW', max_length=255, blank=True, null=True, default='')  # Field name made lowercase.
    log_detail = models.CharField(db_column='LOG_DETAIL', max_length=255, blank=True, null=True, default='')  # Field name made lowercase.
    ip = models.CharField(db_column='IP', max_length=255, blank=True, null=True)
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    read = models.IntegerField(db_column='READ', blank=True, null=True, default='0')  # Field name made lowercase.
    push_check = models.IntegerField(db_column='PUSH_CHECK', blank=True, null=True, default='0')  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True, default='1')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'LOG_TB'


class HolidayTb(models.Model):
    holiday_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    holiday_dt = models.CharField(db_column='HOLIDAY_DT', max_length=10, blank=True, null=True)  # Field name made lowercase.
    holiday_name = models.CharField(db_column='HOLIDAY_NAME', max_length=20, blank=True, null=True)
    use = models.IntegerField(db_column='USE', blank=True, null=True, default='1')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'HOLIDAY_TB'


class PushInfoTb(models.Model):
    push_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    token = models.CharField(db_column='TOKEN', max_length=255, blank=True, null=True, default='')  # Field name made lowercase.
    badge_counter = models.IntegerField(db_column='BADGE_COUNTER', blank=True, null=True, default='0')  # Field name made lowercase.
    last_login = models.DateTimeField(db_column='LAST_LOGIN', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True, default='1')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PUSH_INFO_TB'
