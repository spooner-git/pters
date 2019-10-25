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

from configs.models import TimeStampedModel


class MemberTb(TimeStampedModel):
    member_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    name = models.CharField(db_column='NAME', max_length=20, blank=True, default='')  # Field name made lowercase.
    phone = models.CharField(db_column='PHONE', max_length=20, blank=True, default='')  # Field name made lowercase.
    age = models.IntegerField(db_column='AGE', blank=True, null=True)  # Field name made lowercase.
    sex = models.CharField(db_column='SEX', max_length=2, blank=True, default='')  # Field name made lowercase.
    birthday_dt = models.DateField(db_column='BIRTHDAY_DT', blank=True, null=True)  # Field name made lowercase.
    country = models.CharField(db_column='COUNTRY', max_length=255, blank=True, default='')
    address = models.CharField(db_column='ADDRESS', max_length=255, blank=True, default='')
    job = models.CharField(db_column='JOB', max_length=20, blank=True, default='')  # Field name made lowercase.
    contents = models.CharField(db_column='CONTENTS', max_length=255, blank=True, default='')
    profile_url = models.CharField(db_column='PROFILE_URL', max_length=255, blank=True, null=True,
                                   default='/static/common/icon/icon_account.png')
    phone_is_active = models.IntegerField(db_column='PHONE_IS_ACTIVE', blank=True, null=True, default=0)
    reg_info = models.CharField(db_column='REG_INFO', max_length=20, blank=True, default='')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MEMBER_TB'

    def __str__(self):
        return self.name


class CommonCdTb(models.Model):
    common_cd_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    group_cd = models.CharField(db_column='GROUP_CD', max_length=45, blank=True, default='')
    common_cd = models.CharField(db_column='COMMON_CD', primary_key=True, max_length=45)  # Field name made lowercase.
    common_cd_nm = models.CharField(db_column='COMMON_CD_NM', max_length=100, blank=True, default='')
    group_cd_nm = models.CharField(db_column='GROUP_CD_NM', max_length=100, blank=True, default='')
    upper_common_cd = models.CharField(db_column='UPPER_COMMON_CD', max_length=45, blank=True, default='')
    upper_group_cd = models.CharField(db_column='UPPER_GROUP_CD', max_length=45, blank=True, default='')
    attribute1 = models.CharField(db_column='ATTRIBUTE1', max_length=255, blank=True, default='')
    order = models.IntegerField(db_column='ORDER', default=1)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'COMMON_CD_TB'


class LogTb(TimeStampedModel):
    log_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    log_type = models.CharField(db_column='LOG_TYPE', max_length=20, blank=True, default='')
    auth_member_id = models.CharField(db_column='AUTH_MEMBER_ID', max_length=20, blank=True, default='')
    from_member_name = models.CharField(db_column='FROM_MEMBER_NAME', max_length=20, blank=True, default='')
    to_member_name = models.CharField(db_column='TO_MEMBER_NAME', max_length=20, blank=True, default='')
    class_tb_id = models.CharField(db_column='CLASS_TB_ID', max_length=20, blank=True, default='')
    member_ticket_tb_id = models.CharField(db_column='LECTURE_TB_ID', max_length=20, blank=True, default='')
    log_info = models.CharField(db_column='LOG_INFO', max_length=255, blank=True, default='')
    log_how = models.CharField(db_column='LOG_HOW', max_length=255, blank=True, default='')
    log_detail = models.CharField(db_column='LOG_DETAIL', max_length=255, blank=True, default='')
    ip = models.CharField(db_column='IP', max_length=255, blank=True, default='')
    read = models.IntegerField(db_column='READ', default=0)  # Field name made lowercase.
    push_check = models.IntegerField(db_column='PUSH_CHECK', default=0)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'LOG_TB'


class PushInfoTb(TimeStampedModel):
    push_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    device_id = models.CharField(db_column='DEVICE_ID', max_length=255, blank=True, default='')
    token = models.CharField(db_column='TOKEN', max_length=255, blank=True, default='')
    badge_counter = models.IntegerField(db_column='BADGE_COUNTER', default=0)
    last_login = models.DateTimeField(db_column='LAST_LOGIN', blank=True, null=True)  # Field name made lowercase.
    session_info = models.CharField(db_column='SESSION_INFO', max_length=255, blank=True, default='')
    device_info = models.CharField(db_column='DEVICE_INFO', max_length=255, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PUSH_INFO_TB'


class SnsInfoTb(TimeStampedModel):
    sns_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    sns_id = models.CharField(db_column='SNS_ID', max_length=255, blank=True, default='')  # Field name made lowercase.
    sns_type = models.CharField(db_column='SNS_TYPE', max_length=10, blank=True, default='')
    sns_name = models.CharField(db_column='SNS_NAME', max_length=255, blank=True, default='')
    sns_profile = models.CharField(db_column='SNS_PROFILE', max_length=255, blank=True, default='')
    sns_connect_date = models.DateField(db_column='SNS_CONNECT_DATE', blank=True, null=True)
    change_password_check = models.IntegerField(db_column='CHANGE_PASSWORD_CHECK', default=0)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SNS_INFO_TB'

    def __str__(self):
        return self.name
