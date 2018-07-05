from django.db import models

# Create your models here.
from login.models import MemberTb


class PaymentInfoTb(models.Model):
    payment_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    name = models.CharField(db_column='NAME', max_length=45,  blank=True, null=True)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    pay_method_type_cd = models.CharField(db_column='PAY_METHOD_TYPE_CD', max_length=45, blank=True, null=True)
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
    pay_method_type_cd = models.CharField(db_column='PAY_METHOD_TYPE_CD', max_length=45, blank=True, null=True)
    payment_type_cd = models.CharField(db_column='PAYMENT_TYPE_CD', max_length=45, blank=True, null=True)
    merchant_uid = models.CharField(db_column='MERCHANT_UID', max_length=100,  blank=True, null=True)
    customer_uid = models.CharField(db_column='CUSTOMER_UID', max_length=100, blank=True, null=True)
    payment_date = models.DateField(db_column='PAYMENT_DATE', blank=True, null=True)  # Field name made lowercase.
    payed_date = models.IntegerField(db_column='PAYED_DATE', blank=True, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'BILLING_INFO_TB'


class ProductTb(models.Model):
    product_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    merchandise_type_cd = models.CharField(db_column='MERCHANDISE_TYPE_CD', max_length=45, blank=True, null=True)
    name = models.CharField(db_column='NAME', max_length=100, blank=True, null=True)
    contents = models.CharField(db_column='CONTENTS', max_length=200,  blank=True, null=True)
    order = models.IntegerField(db_column='ORDER', default=0)
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PRODUCT_TB'


class ProductPriceTb(models.Model):
    product_price_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    product_tb = models.ForeignKey(ProductTb, on_delete=models.CASCADE)  # Field name made lowercase.
    name = models.CharField(db_column='name', max_length=45, blank=True, null=True)
    price = models.IntegerField(db_column='PRICE', default=0)
    sale_price = models.IntegerField(db_column='SALE_PRICE', default=0)
    payment_type_cd = models.CharField(db_column='PAYMENT_TYPE_CD', max_length=45,  blank=True, null=True)
    order = models.IntegerField(db_column='ORDER', default=0)
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PRODUCT_PRICE_TB'
