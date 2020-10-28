# from django.db import models


# Create your models here.
from django.core.exceptions import ObjectDoesNotExist
from django.db import models

from configs.const import STATE_CD_IN_PROGRESS, STATE_CD_NOT_PROGRESS
from configs.models import TimeStampedModel
from login.models import MemberTb, CommonCdTb
# from trainer.models import ClassTb


class MemberTicketTb(TimeStampedModel):
    member_ticket_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    # class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE)  # Field name made lowercase.
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE)  # Field name made lowercase.
    ticket_tb = models.ForeignKey("trainer.TicketTb", verbose_name='수강권', on_delete=models.CASCADE, db_column='package_tb_id', null=True)
    member_ticket_reg_count = models.IntegerField('등록 횟수', db_column='LECTURE_REG_COUNT', default=0)
    member_ticket_rem_count = models.IntegerField('남은 횟수', db_column='LECTURE_REM_COUNT', default=0)
    member_ticket_avail_count = models.IntegerField('예약 가능 횟수', db_column='LECTURE_AVAIL_COUNT', default=0)
    start_date = models.DateField('시작일', db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField('종료일', db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    price = models.IntegerField('결제 금액', db_column='PRICE', default=0)  # Field name made lowercase.
    payment_price = models.IntegerField('납부 금액', db_column='PAYMENT_PRICE', default=0)
    pay_method = models.CharField('결제 방법', db_column='PAY_METHOD', max_length=45, blank=True, default='')
    refund_price = models.IntegerField('환불 금액', db_column='REFUND_PRICE', default=0)
    refund_date = models.DateTimeField('환불 일자', db_column='REFUND_DATE', blank=True, null=True)
    state_cd = models.CharField('상태', db_column='STATE_CD', max_length=10, blank=True, default='')
    note = models.CharField('메모', db_column='NOTE', max_length=3000, blank=True, default='')
    member_auth_cd = models.CharField('연결 정보', db_column='MEMBER_AUTH_CD', max_length=20, blank=True, default='')
    day_count = models.IntegerField(db_column='DAY_COUNT', default=0)  # Field name made lowercase.
    option_cd = models.CharField(db_column='OPTION_CD', max_length=10, blank=True, default='')
    schedule_check = models.IntegerField(db_column='SCHEDULE_CHECK', default=1)

    class Meta:
        managed = False
        db_table = 'LECTURE_TB'
        verbose_name = '수강권'
        verbose_name_plural = '수강권'

    def __str__(self):

        return self.ticket_tb.__str__().split('(지점)-')[1]+'-'+self.member.__str__()+'(수강권)'

    def get_state_cd_name(self):
        try:
            state_cd_name = CommonCdTb.objects.get(common_cd=self.state_cd).common_cd_nm
        except ObjectDoesNotExist:
            state_cd_name = ''

        return state_cd_name


class MemberClosedDateHistoryTb(TimeStampedModel):
    member_closed_date_history_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)
    member_ticket_tb = models.ForeignKey(MemberTicketTb, verbose_name='수강권', on_delete=models.CASCADE,
                                         db_column='lecture_tb_id', null=True)
    schedule_tb = models.ForeignKey("schedule.ScheduleTb", verbose_name='일정', on_delete=models.DO_NOTHING, null=True)
    reason_type_cd = models.CharField('불가 이유', db_column='REASON_TYPE_CD', max_length=45, blank=True, default='')
    start_date = models.DateField('시작일', db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField('종료일', db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    note = models.CharField('메모', db_column='NOTE', max_length=200, blank=True, default='')
    extension_flag = models.IntegerField('연장 유무', db_column='EXTENSION_FLAG', default=1)

    class Meta:
        managed = False
        db_table = 'MEMBER_CLOSED_DATE_HISTORY_TB'
        verbose_name = '회원 불가 일정 history'
        verbose_name_plural = '회원 불가 일정 history'


class ProgramNoticeHistoryTb(TimeStampedModel):
    program_notice_history_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    program_notice_tb = models.ForeignKey("trainer.ProgramNoticeTb", verbose_name='지점 공지', on_delete=models.CASCADE, null=True)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)
    class_tb = models.ForeignKey("trainer.ClassTb", verbose_name='지점', on_delete=models.CASCADE, null=True)

    class Meta:
        managed = False
        db_table = 'PROGRAM_NOTICE_MEMBER_READ_HISTORY_TB'
        verbose_name = '회원 지점 공지 조회 history'
        verbose_name_plural = '회원 지점 공지 조회 history'


class MemberShopTb(TimeStampedModel):
    member_shop_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey("trainer.ClassTb", verbose_name='지점', on_delete=models.CASCADE, null=True)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)
    shop_tb = models.ForeignKey("trainer.ShopTb", verbose_name='부가 상품', on_delete=models.CASCADE, null=True)
    price = models.IntegerField('가격', db_column='PRICE', default=0)
    payment_price = models.IntegerField('납부 금액', db_column='PAYMENT_PRICE', default=0)
    refund_price = models.IntegerField('환불 금액', db_column='REFUND_PRICE', default=0)
    pay_method = models.CharField('결제 방법', db_column='PAY_METHOD', max_length=45, blank=True, default='')
    start_date = models.DateField('최초 거래일', db_column='START_DATE', blank=True)
    end_date = models.DateField('최종 거래일', db_column='END_DATE', blank=True)
    note = models.CharField('설명', db_column='NOTE', max_length=200, blank=True)
    state_cd = models.CharField('상태', db_column='STATE_CD', max_length=10, blank=True, default=STATE_CD_NOT_PROGRESS)

    class Meta:
        managed = False
        db_table = 'MEMBER_SHOP_TB'
        verbose_name = '회원 상품 구매 이력'
        verbose_name_plural = '회원 상품 구매 이력'


class MemberPaymentHistoryTb(TimeStampedModel):
    member_payment_history_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey("trainer.ClassTb", verbose_name='지점', on_delete=models.CASCADE, null=True)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)
    member_ticket_tb = models.ForeignKey(MemberTicketTb, verbose_name='수강권', on_delete=models.CASCADE, null=True)
    member_shop_tb = models.ForeignKey(MemberShopTb, verbose_name='상품', on_delete=models.CASCADE, null=True)
    pay_method = models.CharField('결제 방법', db_column='PAY_METHOD', max_length=45, blank=True, default='')
    payment_price = models.IntegerField('납부 금액', db_column='PAYMENT_PRICE', default=0)
    refund_price = models.IntegerField('환불 금액', db_column='REFUND_PRICE', default=0)
    pay_date = models.DateField('거래일', db_column='PAY_DATE', blank=True, null=True)
    note = models.CharField('설명', db_column='NOTE', max_length=200, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'MEMBER_PAYMENT_HISTORY_TB'
        verbose_name = '회원 납부 이력'
        verbose_name_plural = '회원 납부 이력'


# 수강권 연결 정보 (이제 사용 안함)
class MemberMemberTicketTb(TimeStampedModel):
    member_member_ticket_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    member_ticket_tb = models.ForeignKey(MemberTicketTb, on_delete=models.CASCADE, db_column='lecture_tb_id', null=True)
    auth_cd = models.CharField(db_column='AUTH_CD', max_length=20, blank=True, default='')  # Field name made lowercase.
    mod_member_id = models.CharField(db_column='MOD_MEMBER_ID', max_length=20, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'MEMBER_LECTURE_TB'

    def get_auth_cd_name(self):

        try:
            auth_cd_name = CommonCdTb.objects.get(common_cd=self.auth_cd).common_cd_nm
        except ObjectDoesNotExist:
            auth_cd_name = ''
        return auth_cd_name
