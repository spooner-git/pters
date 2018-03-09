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
    schedule_check = models.IntegerField(db_column='SCHEDULE_CHECK', blank=True, null=True)
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = True
        db_table = 'LECTURE_TB'

    def __str__(self):
        return self.member.__str__()+'_lecture'
