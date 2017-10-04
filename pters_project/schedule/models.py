from django.db import models

# Create your models here.


class ClassRepeatScheduleTb(models.Model):
    class_repeat_schedule_id = models.CharField(db_column='CLASS_REPEAT_SCHEDULE_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    class_field = models.CharField(db_column='CLASS_ID', default='', max_length=20)  # Field name made lowercase.
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
        managed = True
        db_table = 'CLASS_REPEAT_SCHEDULE_TB'


class ClassScheduleTb(models.Model):
    class_schedule_id = models.CharField(db_column='CLASS_SCHEDULE_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    class_field = models.CharField(db_column='CLASS_ID', default='', max_length=20)  # Field name made lowercase.
    start_dt = models.DateTimeField(db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
    end_dt = models.DateTimeField(db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = True
        db_table = 'CLASS_SCHEDULE_TB'


class LectureScheduleTb(models.Model):
    lecture_schedule_id = models.CharField(db_column='LECTURE_SCHEDULE_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    lecture = models.CharField(db_column='LECTURE_ID', default='', max_length=20)  # Field name made lowercase.
    start_dt = models.DateTimeField(db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
    end_dt = models.DateTimeField(db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    sign_data_url = models.CharField(db_column='SIGN_DATA_URL', max_length=255, blank=True, null=True)  # Field name made lowercase.
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = True
        db_table = 'LECTURE_SCHEDULE_TB'


class LectureTb(models.Model):
    lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_field = models.CharField(db_column='CLASS_ID', null=False, default='', max_length=20)  # Field name made lowercase.
    member = models.CharField(db_column='MEMBER_ID', null=False, default='', max_length=20)  # Field name made lowercase.
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
        managed = True
        db_table = 'LECTURE_TB'


class ClassTb(models.Model):
    class_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.CharField(db_column='MEMBER_ID', default='', max_length=20)  # Field name made lowercase.
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
        managed = True
        db_table = 'CLASS_TB'
