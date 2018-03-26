from django.db import models

# Create your models here.
from login.models import MemberTb


class CenterTb(models.Model):
    center_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    center_name = models.CharField(db_column='CENTER_NAME', max_length=20, blank=True, null=True)  # Field name made lowercase.
    address = models.CharField(db_column='ADDRESS', max_length=255, blank=True, null=True)  # Field name made lowercase.
    center_type_cd = models.CharField(db_column='CENTER_TYPE_CD', max_length=20, blank=True, null=True)  # Field name made lowercase.
    center_img_url = models.CharField(db_column='CENTER_IMG_URL', max_length=255, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CENTER_TB'

    def __str__(self):
        return self.center_name.__str__()+'_center'


class CenterTrainerTb(models.Model):
    center_trainer_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    center = models.ForeignKey(CenterTb, on_delete=models.CASCADE)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CENTER_TRAINER_TB'
