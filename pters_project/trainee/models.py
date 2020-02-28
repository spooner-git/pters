# from django.db import models


# Create your models here.
from django.core.exceptions import ObjectDoesNotExist
from django.db import models

from configs.models import TimeStampedModel
from login.models import MemberTb, CommonCdTb


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
    pay_method = models.CharField('결제 방법', db_column='PAY_METHOD', max_length=45, blank=True, default='')
    refund_price = models.IntegerField('환불 금액', db_column='REFUND_PRICE', default=0)
    refund_date = models.DateTimeField('환불 일자', db_column='REFUND_DATE', blank=True, null=True)  # Field name made lowercase.
    state_cd = models.CharField('상태', db_column='STATE_CD', max_length=10, blank=True, default='')
    note = models.CharField('메모', db_column='NOTE', max_length=3000, blank=True, default='')
    member_auth_cd = models.CharField('연결 정보', db_column='MEMBER_AUTH_CD', max_length=20, blank=True, default='')

    day_count = models.IntegerField(db_column='DAY_COUNT', default=0)  # Field name made lowercase.
    option_cd = models.CharField(db_column='OPTION_CD', max_length=10, blank=True, default='')
    schedule_check = models.IntegerField(db_column='SCHEDULE_CHECK', default=1)

    class Meta:
        managed = False
        db_table = 'LECTURE_TB'
        verbose_name = '회원 수강권'
        verbose_name_plural = '회원 수강권'

    def __str__(self):

        return self.ticket_tb.__str__().split('(프로그램)-')[1]+'-'+self.member.__str__()+'(회원수강권)'

    def get_state_cd_name(self):
        try:
            state_cd_name = CommonCdTb.objects.get(common_cd=self.state_cd).common_cd_nm
        except ObjectDoesNotExist:
            state_cd_name = ''

        return state_cd_name


class ProgramNoticeHistoryTb(TimeStampedModel):
    program_notice_history_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    program_notice_tb = models.ForeignKey("trainer.ProgramNoticeTb", verbose_name='프로그램 공지', on_delete=models.CASCADE, null=True)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)
    class_tb = models.ForeignKey("trainer.ClassTb", verbose_name='프로그램', on_delete=models.CASCADE, null=True)

    class Meta:
        managed = False
        db_table = 'PROGRAM_NOTICE_MEMBER_READ_HISTORY_TB'
        verbose_name = '회원 프로그램 공지 조회 history'
        verbose_name_plural = '회원 프로그램 공지 조회 history'


# 회원 수강권 연결 정보 (이제 사용 안함)
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
