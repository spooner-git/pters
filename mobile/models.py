# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from __future__ import unicode_literals

from django.db import models


class ClassRepeatScheduleTb(models.Model):
    class_repeat_schedule_id = models.CharField(db_column='CLASS_REPEAT_SCHEDULE_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    class_field = models.ForeignKey('ClassTb', models.DO_NOTHING, db_column='CLASS_ID', blank=True, null=True)  # Field name made lowercase. Field renamed because it was a Python reserved word.
    repeat_type_cd = models.CharField(db_column='REPEAT_TYPE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    week_cd = models.CharField(db_column='WEEK_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    start_time = models.TimeField(db_column='START_TIME', blank=True, null=True)  # Field name made lowercase.
    end_time = models.TimeField(db_column='END_TIME', blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CLASS_REPEAT_SCHEDULE_TB'


class ClassScheduleTb(models.Model):
    class_schedule_id = models.CharField(db_column='CLASS_SCHEDULE_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    class_field = models.ForeignKey('ClassTb', models.DO_NOTHING, db_column='CLASS_ID', blank=True, null=True)  # Field name made lowercase. Field renamed because it was a Python reserved word.
    start_dt = models.DateTimeField(db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
    end_dt = models.DateTimeField(db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CLASS_SCHEDULE_TB'


class ClassTb(models.Model):
    class_id = models.CharField(db_column='CLASS_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    member = models.ForeignKey('MemberTb', models.DO_NOTHING, db_column='MEMBER_ID', blank=True, null=True)  # Field name made lowercase.
    class_type_cd = models.CharField(db_column='CLASS_TYPE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    subject_cd = models.CharField(db_column='SUBJECT_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    subject_detail_nm = models.CharField(db_column='SUBJECT_DETAIL_NM', max_length=20, blank=True, null=True)  # Field name made lowercase.
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    class_hour = models.FloatField(db_column='CLASS_HOUR', blank=True, null=True)  # Field name made lowercase.
    start_hour_unit = models.FloatField(db_column='START_HOUR_UNIT', blank=True, null=True)  # Field name made lowercase.
    class_member_num = models.IntegerField(db_column='CLASS_MEMBER_NUM', blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CLASS_TB'


class CommonCdTb(models.Model):
    group_cd = models.CharField(db_column='GROUP_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    common_cd = models.CharField(db_column='COMMON_CD', primary_key=True, max_length=10)  # Field name made lowercase.
    common_cd_nm = models.CharField(db_column='COMMON_CD_NM', max_length=100, blank=True, null=True)  # Field name made lowercase.
    group_cd_nm = models.CharField(db_column='GROUP_CD_NM', max_length=20, blank=True, null=True)  # Field name made lowercase.
    upper_common_cd = models.CharField(db_column='UPPER_COMMON_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    upper_group_cd = models.CharField(db_column='UPPER_GROUP_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    attribute1 = models.CharField(db_column='ATTRIBUTE1', max_length=255, blank=True, null=True)  # Field name made lowercase.
    order = models.IntegerField(db_column='ORDER', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'COMMON_CD_TB'


class CompanyTb(models.Model):
    company_id = models.CharField(db_column='COMPANY_ID', primary_key=True, max_length=20)  # Field name made lowercase.
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


class IdTb(models.Model):
    idx = models.AutoField(db_column='IDX', primary_key=True)  # Field name made lowercase.
    table_cd = models.CharField(db_column='TABLE_CD', max_length=20)  # Field name made lowercase.
    id = models.CharField(db_column='ID', max_length=20)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ID_TB'


class LectureScheduleTb(models.Model):
    lecture_schedule_id = models.CharField(db_column='LECTURE_SCHEDULE_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    lecture = models.ForeignKey('LectureTb', models.DO_NOTHING, db_column='LECTURE_ID', blank=True, null=True)  # Field name made lowercase.
    start_dt = models.DateTimeField(db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
    end_dt = models.DateTimeField(db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    sign_data_url = models.CharField(db_column='SIGN_DATA_URL', max_length=255, blank=True, null=True)  # Field name made lowercase.
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'LECTURE_SCHEDULE_TB'


class LectureTb(models.Model):
    lecture_id = models.CharField(db_column='LECTURE_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    class_field = models.ForeignKey(ClassTb, models.DO_NOTHING, db_column='CLASS_ID')  # Field name made lowercase. Field renamed because it was a Python reserved word.
    member = models.ForeignKey('MemberTb', models.DO_NOTHING, db_column='MEMBER_ID')  # Field name made lowercase.
    lecture_count = models.IntegerField(db_column='LECTURE_COUNT', blank=True, null=True)  # Field name made lowercase.
    day_count = models.IntegerField(db_column='DAY_COUNT', blank=True, null=True)  # Field name made lowercase.
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    price = models.IntegerField(db_column='PRICE', blank=True, null=True)  # Field name made lowercase.
    option_cd = models.CharField(db_column='OPTION_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'LECTURE_TB'


class LogTb(models.Model):
    log_id = models.CharField(db_column='LOG_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    external_id = models.CharField(db_column='EXTERNAL_ID', max_length=20, blank=True, null=True)  # Field name made lowercase.
    log_type = models.CharField(db_column='LOG_TYPE', max_length=10, blank=True, null=True)  # Field name made lowercase.
    contents = models.CharField(db_column='CONTENTS', max_length=255, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'LOG_TB'


class MemberTb(models.Model):
    member_id = models.CharField(db_column='MEMBER_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    member_type_cd = models.CharField(db_column='MEMBER_TYPE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    author_cd = models.CharField(db_column='AUTHOR_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    id = models.CharField(db_column='ID', max_length=20, blank=True, null=True)  # Field name made lowercase.
    pw = models.CharField(db_column='PW', max_length=20, blank=True, null=True)  # Field name made lowercase.
    name = models.CharField(db_column='NAME', max_length=20, blank=True, null=True)  # Field name made lowercase.
    phone = models.CharField(db_column='PHONE', max_length=20, blank=True, null=True)  # Field name made lowercase.
    age = models.IntegerField(db_column='AGE', blank=True, null=True)  # Field name made lowercase.
    sex = models.CharField(db_column='SEX', max_length=2, blank=True, null=True)  # Field name made lowercase.
    address = models.CharField(db_column='ADDRESS', max_length=255, blank=True, null=True)  # Field name made lowercase.
    job = models.CharField(db_column='JOB', max_length=20, blank=True, null=True)  # Field name made lowercase.
    contents = models.CharField(db_column='CONTENTS', max_length=255, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MEMBER_TB'


class SettingTb(models.Model):
    setting_id = models.CharField(db_column='SETTING_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    member = models.ForeignKey(MemberTb, models.DO_NOTHING, db_column='MEMBER_ID')  # Field name made lowercase.
    setting_type_cd = models.CharField(db_column='SETTING_TYPE_CD', max_length=10)  # Field name made lowercase.
    setting_cd = models.CharField(db_column='SETTING_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SETTING_TB'
        unique_together = (('member', 'setting_type_cd'),)


class ShopEmployeeTb(models.Model):
    shop_employee_id = models.CharField(db_column='SHOP_EMPLOYEE_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    member = models.ForeignKey(MemberTb, models.DO_NOTHING, db_column='MEMBER_ID')  # Field name made lowercase.
    company = models.ForeignKey(CompanyTb, models.DO_NOTHING, db_column='COMPANY_ID')  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SHOP_EMPLOYEE_TB'
        unique_together = (('member', 'company'),)


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=80)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'
