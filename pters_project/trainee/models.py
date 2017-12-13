from django.db import models


# Create your models here.
from login.models import MemberTb
from trainer.models import ClassTb


class LectureTb(models.Model):
    lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE)  # Field name made lowercase.
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    lecture_reg_count = models.IntegerField(db_column='LECTURE_REG_COUNT', default=0)  # Field name made lowercase.
    lecture_rem_count = models.IntegerField(db_column='LECTURE_REM_COUNT', default=0)
    lecture_avail_count = models.IntegerField(db_column='LECTURE_AVAIL_COUNT', default=0)
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

    def __unicode__(self):
        return u"%s" % self.member.__unicode__()+'_lecture'


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

