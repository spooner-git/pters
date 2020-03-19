from django.db import models

from configs.const import ENABLE
from configs.models import TimeStampedModel
from login.models import MemberTb


class ProductTb(TimeStampedModel):
    product_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    upper_product_id = models.CharField('상위 상품 ID', db_column='UPPER_PRODUCT_ID', max_length=45, blank=True, default='')
    promotion_type_cd = models.CharField('상품 타입', db_column='PROMOTION_TYPE_CD', max_length=45, blank=True, default='')
    coupon_cd = models.CharField('쿠폰 코드', db_column='COUPON_CD', max_length=45, blank=True, default='')
    coupon_amount = models.IntegerField('쿠폰 갯수', db_column='COUPON_AMOUNT', default=0)
    expiry_date = models.DateTimeField('종료일', db_column='EXPIRY_DATE', blank=True)
    name = models.CharField('상품명', db_column='NAME', max_length=100, blank=True, default='')
    contents = models.CharField('내용', db_column='CONTENTS', max_length=1000,  blank=True, default='')
    order = models.IntegerField('순서', db_column='ORDER', default=1)

    class Meta:
        managed = False
        db_table = 'PRODUCT_TB'
        verbose_name = '상품'
        verbose_name_plural = '상품'

    def __str__(self):
        return self.name.__str__()


class PaymentInfoTb(TimeStampedModel):
    payment_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    name = models.CharField('결제명', db_column='NAME', max_length=100,  blank=True, default='')
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    product_tb = models.ForeignKey(ProductTb, verbose_name='상품', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    merchant_uid = models.CharField('merchant_uid', db_column='MERCHANT_UID', max_length=150,  blank=True, default='')
    customer_uid = models.CharField('customer_uid', db_column='CUSTOMER_UID', max_length=150, blank=True, default='')
    start_date = models.DateField('시작일', db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField('종료일', db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    paid_date = models.DateField('결제일', db_column='PAID_DATE', blank=True, null=True)  # Field name made lowercase.
    period_month = models.IntegerField('반복 개월수', db_column='PERIOD_MONTH', default=1)
    payment_type_cd = models.CharField('단기/정기 결제 종류', db_column='PAYMENT_TYPE_CD', max_length=45, blank=True, default='')
    price = models.IntegerField('결제 금액', db_column='PRICE', default=0)
    imp_uid = models.CharField('imp_uid', db_column='IMP_UID', max_length=45, blank=True, default='')
    channel = models.CharField('채널', db_column='CHANNEL', max_length=45, blank=True, default='')
    card_name = models.CharField('카드명', db_column='CARD_NAME', max_length=45, blank=True, default='')
    status = models.CharField('결제 상태', db_column='STATUS', max_length=45, blank=True, default='')
    fail_reason = models.CharField('실패 사유', db_column='FAIL_REASON', max_length=500, blank=True, default='')
    currency = models.CharField('통화', db_column='CURRENCY', max_length=45, blank=True, default='')
    pay_method = models.CharField('결제 방법', db_column='PAY_METHOD', max_length=45, blank=True, default='')
    pg_provider = models.CharField('결제 경로', db_column='PG_PROVIDER', max_length=45, blank=True, default='')
    receipt_url = models.CharField('영수증 url', db_column='RECEIPT_URL', max_length=500, blank=True, default='')
    buyer_email = models.CharField('구매자 email', db_column='BUYER_EMAIL', max_length=45, blank=True, default='')
    buyer_name = models.CharField('구매자 이름', db_column='BUYER_NAME', max_length=45, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'PAYMENT_INFO_TB'
        verbose_name = '결제 내역'
        verbose_name_plural = '결제 내역'

    def __str__(self):
        return self.payment_info_id.__str__()


class BillingInfoTb(TimeStampedModel):
    billing_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    name = models.CharField('결제명', db_column='NAME', max_length=100,  blank=True, default='')
    member = models.ForeignKey(MemberTb, verbose_name='회원 ', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    pay_method = models.CharField('결제 방법', db_column='PAY_METHOD', max_length=45, blank=True, default='')
    product_tb = models.ForeignKey(ProductTb, verbose_name='상품', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    payment_type_cd = models.CharField('단기/정기 결제 종류', db_column='PAYMENT_TYPE_CD', max_length=45, blank=True, default='')
    period_month = models.IntegerField('반복 개월수', db_column='PERIOD_MONTH', default=1)
    merchant_uid = models.CharField('merchant_uid', db_column='MERCHANT_UID', max_length=150,  blank=True, default='')
    customer_uid = models.CharField('customer_uid', db_column='CUSTOMER_UID', max_length=150, blank=True, default='')
    price = models.IntegerField('결제 금액', db_column='PRICE', default=0)
    card_name = models.CharField('카드명', db_column='CARD_NAME', max_length=45, blank=True, default='')
    payment_reg_date = models.DateField('정기결제 등록일', db_column='PAYMENT_REG_DATE', blank=True, null=True)
    next_payment_date = models.DateField('다음 결제일', db_column='NEXT_PAYMENT_DATE', blank=True, null=True)
    payed_date = models.IntegerField('결제일', db_column='PAYED_DATE', default=1)  # Field name made lowercase.
    state_cd = models.CharField('결제 상태', db_column='STATE_CD', max_length=45, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'BILLING_INFO_TB'
        verbose_name = '정기결제 정보'
        verbose_name_plural = '정기결제 정보'

    def __str__(self):
        return self.billing_info_id.__str__()


class BillingCancelInfoTb(TimeStampedModel):
    billing_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    billing_info_tb = models.ForeignKey(BillingInfoTb, verbose_name='정기결제', on_delete=models.CASCADE, null=True)
    cancel_type = models.CharField('해지 타입', db_column='CANCEL_TYPE', max_length=100, blank=True, default='')
    cancel_reason = models.CharField('해지 사유', db_column='CANCEL_REASON', max_length=1000, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'BILLING_CANCEL_INFO_TB'
        verbose_name = '정기 결제 해지 사유'
        verbose_name_plural = '정기 결제 해지 사유'


class ProductPriceTb(TimeStampedModel):
    product_price_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    product_tb = models.ForeignKey(ProductTb, verbose_name='상품', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    name = models.CharField(db_column='name', max_length=100, blank=True, default='')
    price = models.IntegerField('기본 가격', db_column='PRICE', default=0)
    sale_price = models.IntegerField('할인 가격', db_column='SALE_PRICE', default=0)
    payment_type_cd = models.CharField('단기/정기 결제 종류', db_column='PAYMENT_TYPE_CD', max_length=45,  blank=True, default='')
    period_month = models.IntegerField('개월', db_column='PERIOD_MONTH', default=1)
    order = models.IntegerField('순서', db_column='ORDER', default=1)

    class Meta:
        managed = False
        db_table = 'PRODUCT_PRICE_TB'
        verbose_name = '상품 가격'
        verbose_name_plural = '상품 가격'


class FunctionAuthTb(TimeStampedModel):
    function_auth_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    function_auth_type_cd = models.CharField('기능권한 타입', db_column='FUNCTION_AUTH_TYPE_CD', max_length=45, blank=True, null=True)
    function_auth_type_name = models.CharField('기능 권한명', db_column='FUNCTION_AUTH_TYPE_NAME', max_length=255,
                                               blank=True, null=True)
    order = models.IntegerField(db_column='ORDER', default=1)

    class Meta:
        managed = False
        db_table = 'FUNCTION_AUTH_TB'
        verbose_name = '기능 권한'
        verbose_name_plural = '기능 권한'

    def __str__(self):
        return self.function_auth_type_name.__str__()


class ProductFunctionAuthTb(TimeStampedModel):
    product_function_auth_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    product_tb = models.ForeignKey(ProductTb, verbose_name='상품', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    function_auth_tb = models.ForeignKey(FunctionAuthTb, verbose_name='기능 권한', on_delete=models.CASCADE, null=True)
    auth_type_cd = models.CharField('권한', db_column='AUTH_TYPE_CD', max_length=45, blank=True, null=True)
    counts_type = models.CharField('단위', db_column='COUNTS_TYPE', max_length=45, blank=True, null=True)
    counts = models.IntegerField('허용수', db_column='COUNTS', default=1)

    class Meta:
        managed = False
        db_table = 'PRODUCT_FUNCTION_AUTH_TB'
        verbose_name = '상품 -> 기능 권한'
        verbose_name_plural = '상품 -> 기능 권한'


class IosReceiptCheckTb(TimeStampedModel):
    ios_receipt_check_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    payment_tb = models.ForeignKey(PaymentInfoTb, verbose_name='결제정보', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    original_transaction_id = models.CharField(db_column='ORIGINAL_TRANSACTION_ID', max_length=45,
                                               blank=True, null=True)
    transaction_id = models.CharField('transaction_id', db_column='TRANSACTION_ID', max_length=45, blank=True, null=True)
    cancellation_date = models.CharField('환불 날짜', db_column='CANCELLATION_DATE', max_length=45, blank=True, null=True)
    receipt_data = models.TextField('영수증 정보', db_column='RECEIPT_DATA', blank=True, null=True)
    iap_status_cd = models.CharField('결제 상태', db_column='IAP_STATUS_CD', max_length=45, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'IOS_RECEIPT_CHECK_TB'
        verbose_name = 'IOS 영수증'
        verbose_name_plural = 'IOS 영수증'


class CouponTb(TimeStampedModel):
    coupon_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    product_tb = models.ForeignKey(ProductTb, verbose_name='관련 상품', on_delete=models.CASCADE, blank=True)  # Field name made lowercase.
    name = models.CharField('쿠폰명', db_column='NAME', max_length=100, blank=True, default='')
    contents = models.CharField('쿠폰 내용', db_column='CONTENTS', max_length=1000,  blank=True, default='')
    amount = models.IntegerField('쿠폰 갯수', db_column='AMOUNT', default=0)
    effective_days = models.IntegerField('쿠폰 사용 유효 기간', db_column='EFFECTIVE_DAYS', default=0)
    product_effective_days = models.IntegerField('관련 상품 기간', db_column='PRODUCT_EFFECTIVE_DAYS', default=0)
    start_date = models.DateTimeField('쿠폰 시작일', db_column='START_DATE', blank=True)
    end_date = models.DateTimeField('쿠폰 만료일', db_column='END_DATE', blank=True)
    target = models.CharField('대상', db_column='TARGET', max_length=45, blank=True, default='')
    coupon_cd = models.CharField('쿠폰 코드', unique=True, db_column='COUPON_CD', max_length=45, blank=True, default='')
    duplicate_enable = models.IntegerField('중복 가능 여부', db_column='DUPLICATE_ENABLE', default=ENABLE)
    direct_reg_enable = models.IntegerField('회원 직접 등록 가능 여부', db_column='DIRECT_REG_ENABLE', default=ENABLE)

    class Meta:
        managed = False
        db_table = 'COUPON_TB'
        verbose_name = '쿠폰'
        verbose_name_plural = '쿠폰'

    def __str__(self):
        return self.name.__str__()


class CouponMemberTb(TimeStampedModel):
    coupon_member_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    coupon_tb = models.ForeignKey(CouponTb, verbose_name='쿠폰', on_delete=models.CASCADE, null=True)
    name = models.CharField('쿠폰명', db_column='NAME', max_length=100, blank=True, default='')
    contents = models.CharField('쿠폰 내용', db_column='CONTENTS', max_length=1000,  blank=True, default='')
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    start_date = models.DateTimeField('지급일', db_column='START_DATE', blank=True)
    expiry_date = models.DateTimeField('만료일', db_column='EXPIRY_DATE', blank=True)
    exhaustion = models.IntegerField('소진 여부', db_column='EXHAUSTION', default=0)

    class Meta:
        managed = False
        db_table = 'COUPON_MEMBER_TB'
        verbose_name = '회원 쿠폰함'
        verbose_name_plural = '회원 쿠폰함'

    def __str__(self):
        return self.name.__str__()
