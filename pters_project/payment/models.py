from django.db import models

# Create your models here.
from login.models import MemberTb


class PaymentInfoTb(models.Model):
    payment_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    merchandise_type_cd = models.CharField(db_column='MERCHANDISE_TYPE_CD', max_length=45, blank=True, null=True)
    merchant_uid = models.CharField(db_column='MERCHANT_UID', max_length=100,  blank=True, null=True)
    customer_uid = models.CharField(db_column='CUSTOMER_UID', max_length=100, blank=True, null=True)
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    payment_type_cd = models.CharField(db_column='PAYMENT_TYPE_CD', max_length=45, blank=True, null=True)
    price = models.IntegerField(db_column='PRICE', default=0)
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PAYMENT_INFO_TB'


class BillingInfoTb(models.Model):
    billing_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    payment_type_cd = models.CharField(db_column='PAYMENT_TYPE_CD', max_length=45, blank=True, null=True)
    customer_uid = models.CharField(db_column='CUSTOMER_UID', max_length=100, blank=True, null=True)
    payment_date = models.DateField(db_column='PAYMENT_DATE', blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'BILLING_INFO_TB'
