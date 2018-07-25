from django.db import models

# Create your models here.
from configs.models import TimeStampedModel
from login.models import MemberTb


class PaymentInfoTb(TimeStampedModel):
    payment_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    name = models.CharField(db_column='NAME', max_length=45,  blank=True, default='')
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    merchandise_type_cd = models.CharField(db_column='MERCHANDISE_TYPE_CD', max_length=45, blank=True, default='')
    merchant_uid = models.CharField(db_column='MERCHANT_UID', max_length=100,  blank=True, default='')
    customer_uid = models.CharField(db_column='CUSTOMER_UID', max_length=100, blank=True, default='')
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    payment_type_cd = models.CharField(db_column='PAYMENT_TYPE_CD', max_length=45, blank=True, default='')
    price = models.IntegerField(db_column='PRICE', default=0)
    imp_uid = models.CharField(db_column='IMP_UID', max_length=45, blank=True, default='')
    channel = models.CharField(db_column='CHANNEL', max_length=45, blank=True, default='')
    card_name = models.CharField(db_column='CARD_NAME', max_length=45, blank=True, default='')
    buyer_email = models.CharField(db_column='BUYER_EMAIL', max_length=45, blank=True, default='')
    status = models.CharField(db_column='STATUS', max_length=45, blank=True, default='')
    fail_reason = models.CharField(db_column='FAIL_REASON', max_length=500, blank=True, default='')
    currency = models.CharField(db_column='CURRENCY', max_length=45, blank=True, default='')
    pay_method = models.CharField(db_column='PAY_METHOD', max_length=45, blank=True, default='')
    pg_provider = models.CharField(db_column='PG_PROVIDER', max_length=45, blank=True, default='')
    receipt_url = models.CharField(db_column='RECEIPT_URL', max_length=500, blank=True, default='')
    buyer_name = models.CharField(db_column='BUYER_NAME', max_length=45, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PAYMENT_INFO_TB'


class BillingInfoTb(TimeStampedModel):
    billing_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    pay_method = models.CharField(db_column='PAY_METHOD', max_length=45, blank=True, default='')
    merchandise_type_cd = models.CharField(db_column='MERCHANDISE_TYPE_CD', max_length=45, blank=True, default='')
    payment_type_cd = models.CharField(db_column='PAYMENT_TYPE_CD', max_length=45, blank=True, default='')
    merchant_uid = models.CharField(db_column='MERCHANT_UID', max_length=100,  blank=True, default='')
    customer_uid = models.CharField(db_column='CUSTOMER_UID', max_length=100, blank=True, default='')
    payment_reg_date = models.DateField(db_column='PAYMENT_REG_DATE', blank=True, null=True)
    next_payment_date = models.DateField(db_column='NEXT_PAYMENT_DATE', blank=True, null=True)
    payed_date = models.IntegerField(db_column='PAYED_DATE', default=1)  # Field name made lowercase.
    state_cd = models.CharField(db_column='STATE_CD', max_length=45, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'BILLING_INFO_TB'


class BillingCancelInfoTb(TimeStampedModel):
    billing_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    billing_info_tb = models.ForeignKey(BillingInfoTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    cancel_type = models.CharField(db_column='CANCEL_TYPE', max_length=100, blank=True, default='')
    cancel_reason = models.CharField(db_column='CANCEL_REASON', max_length=1000, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'BILLING_CANCEL_INFO_TB'


class ProductTb(TimeStampedModel):
    product_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    merchandise_type_cd = models.CharField(db_column='MERCHANDISE_TYPE_CD', max_length=45, blank=True, default='')
    name = models.CharField(db_column='NAME', max_length=100, blank=True, default='')
    contents = models.CharField(db_column='CONTENTS', max_length=200,  blank=True, default='')
    order = models.IntegerField(db_column='ORDER', default=1)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PRODUCT_TB'


class ProductPriceTb(TimeStampedModel):
    product_price_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    product_tb = models.ForeignKey(ProductTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    name = models.CharField(db_column='name', max_length=45, blank=True, default='')
    price = models.IntegerField(db_column='PRICE', default=0)
    sale_price = models.IntegerField(db_column='SALE_PRICE', default=0)
    payment_type_cd = models.CharField(db_column='PAYMENT_TYPE_CD', max_length=45,  blank=True, default='')
    order = models.IntegerField(db_column='ORDER', default=1)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PRODUCT_PRICE_TB'


# class FunctionAuthTb(models.Model):
#     function_auth_id = models.AutoField(db_column='ID', primary_key=True, null=False)
#     member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
#     function_auth_type_cd = models.CharField(db_column='FUNCTION_AUTH_TYPE_CD', max_length=45, blank=True, null=True)
#     payment_type_cd = models.CharField(db_column='PAYMENT_TYPE_CD', max_length=45, blank=True, null=True)
#     expired_date = models.DateField(db_column='EXPIRED_DATE', blank=True, null=True)  # Field name made lowercase.
#     reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
#     mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
#     use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.
#
#     class Meta:
#         managed = False
#         db_table = 'FUNCTION_AUTH_TB'
