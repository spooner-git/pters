from django.db import models

# Create your models here.


class ShopEmployeeTb(models.Model):
    shop_employee_id = models.CharField(db_column='SHOP_EMPLOYEE_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    member = models.CharField(db_column='MEMBER_ID', null=False, default='', max_length=20)  # Field name made lowercase.
    company = models.CharField(db_column='COMPANY_ID', null=False, default='', max_length=20)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = True
        db_table = 'SHOP_EMPLOYEE_TB'


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
        managed = True
        db_table = 'COMPANY_TB'


class SettingTb(models.Model):
    setting_id = models.CharField(db_column='SETTING_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    member = models.CharField(db_column='MEMBER_ID', default='', max_length=20)  # Field name made lowercase.
    setting_type_cd = models.CharField(db_column='SETTING_TYPE_CD', max_length=10)  # Field name made lowercase.
    setting_cd = models.CharField(db_column='SETTING_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = True
        db_table = 'SETTING_TB'

