from django.db import models

# Create your models here.
from configs.models import TimeStampedModel
from login.models import MemberTb


class ProductTb(TimeStampedModel):
    product_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    upper_product_id = models.CharField(db_column='UPPER_PRODUCT_ID', max_length=45, blank=True, default='')
    name = models.CharField(db_column='NAME', max_length=100, blank=True, default='')
    contents = models.CharField(db_column='CONTENTS', max_length=1000,  blank=True, default='')
    order = models.IntegerField(db_column='ORDER', default=1)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PRODUCT_TB'

    def __str__(self):
        return self.name.__str__()


class PaymentInfoTb(TimeStampedModel):
    payment_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    name = models.CharField(db_column='NAME', max_length=45,  blank=True, default='')
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    product_tb = models.ForeignKey(ProductTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    merchant_uid = models.CharField(db_column='MERCHANT_UID', max_length=100,  blank=True, default='')
    customer_uid = models.CharField(db_column='CUSTOMER_UID', max_length=100, blank=True, default='')
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    paid_date = models.DateField(db_column='PAID_DATE', blank=True, null=True)  # Field name made lowercase.
    period_month = models.IntegerField(db_column='PERIOD_MONTH', default=1)
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
    name = models.CharField(db_column='NAME', max_length=45,  blank=True, default='')
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    pay_method = models.CharField(db_column='PAY_METHOD', max_length=45, blank=True, default='')
    product_tb = models.ForeignKey(ProductTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    payment_type_cd = models.CharField(db_column='PAYMENT_TYPE_CD', max_length=45, blank=True, default='')
    period_month = models.IntegerField(db_column='PERIOD_MONTH', default=1)
    merchant_uid = models.CharField(db_column='MERCHANT_UID', max_length=100,  blank=True, default='')
    customer_uid = models.CharField(db_column='CUSTOMER_UID', max_length=100, blank=True, default='')
    price = models.IntegerField(db_column='PRICE', default=0)
    card_name = models.CharField(db_column='CARD_NAME', max_length=45, blank=True, default='')
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
    billing_info_tb = models.ForeignKey(BillingInfoTb, on_delete=models.CASCADE, null=True)
    cancel_type = models.CharField(db_column='CANCEL_TYPE', max_length=100, blank=True, default='')
    cancel_reason = models.CharField(db_column='CANCEL_REASON', max_length=1000, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'BILLING_CANCEL_INFO_TB'


class ProductPriceTb(TimeStampedModel):
    product_price_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    product_tb = models.ForeignKey(ProductTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    name = models.CharField(db_column='name', max_length=45, blank=True, default='')
    price = models.IntegerField(db_column='PRICE', default=0)
    sale_price = models.IntegerField(db_column='SALE_PRICE', default=0)
    payment_type_cd = models.CharField(db_column='PAYMENT_TYPE_CD', max_length=45,  blank=True, default='')
    period_month = models.IntegerField(db_column='PERIOD_MONTH', default=1)
    order = models.IntegerField(db_column='ORDER', default=1)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PRODUCT_PRICE_TB'


class FunctionAuthTb(TimeStampedModel):
    function_auth_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    function_auth_type_cd = models.CharField(db_column='FUNCTION_AUTH_TYPE_CD', max_length=45, blank=True, null=True)
    function_auth_type_name = models.CharField(db_column='FUNCTION_AUTH_TYPE_NAME', max_length=255,
                                               blank=True, null=True)
    order = models.IntegerField(db_column='ORDER', default=1)
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'FUNCTION_AUTH_TB'

    def __str__(self):
        return self.function_auth_type_name.__str__()


class ProductFunctionAuthTb(TimeStampedModel):
    product_function_auth_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    product_tb = models.ForeignKey(ProductTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    function_auth_tb = models.ForeignKey(FunctionAuthTb, on_delete=models.CASCADE, null=True)
    auth_type_cd = models.CharField(db_column='AUTH_TYPE_CD', max_length=45, blank=True, null=True)
    counts_type = models.CharField(db_column='COUNTS_TYPE', max_length=45, blank=True, null=True)
    counts = models.IntegerField(db_column='COUNTS', default=1)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PRODUCT_FUNCTION_AUTH_TB'


class IosReceiptCheckTb(TimeStampedModel):
    ios_receipt_check_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    payment_tb = models.ForeignKey(PaymentInfoTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    original_transaction_id = models.CharField(db_column='ORIGINAL_TRANSACTION_ID', max_length=45,
                                               blank=True, null=True)
    transaction_id = models.CharField(db_column='TRANSACTION_ID', max_length=45, blank=True, null=True)
    cancellation_date = models.CharField(db_column='CANCELLATION_DATE', max_length=45, blank=True, null=True)
    receipt_data = models.TextField(db_column='RECEIPT_DATA', blank=True, null=True)
    iap_status_cd = models.CharField(db_column='IAP_STATUS_CD', max_length=45, blank=True, null=True)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'IOS_RECEIPT_CHECK_TB'
