from django.db import models

# Create your models here.
from center.models import CenterTb
from login.models import MemberTb


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
    member_view_state_cd = models.CharField(db_column='MEMBER_VIEW_STATE_CD', max_length=20, blank=True, null=True, default='WAIT')  # Field name made lowercase.
    schedule_check = models.IntegerField(db_column='SCHEDULE_CHECK', blank=True, null=True)
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CLASS_TB'

    def __str__(self):
        return self.member.__str__()+'_class'

