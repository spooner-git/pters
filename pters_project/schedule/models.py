from django.db import models

# Create your models here.
from trainee.models import LectureTb
from trainer.models import ClassTb


class ClassRepeatScheduleTb(models.Model):
    class_repeat_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, default='')  # Field name made lowercase.
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
    class_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, default='')  # Field name made lowercase.
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
    lecture_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, default='')  # Field name made lowercase.
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

