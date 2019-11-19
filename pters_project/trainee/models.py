# from django.db import models


# Create your models here.
from django.core.exceptions import ObjectDoesNotExist
from django.db import models

from configs.models import TimeStampedModel
from login.models import MemberTb, CommonCdTb


class MemberTicketTb(TimeStampedModel):
    member_ticket_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    # class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE)  # Field name made lowercase.
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    ticket_tb = models.ForeignKey("trainer.TicketTb", on_delete=models.CASCADE, db_column='package_tb_id', null=True)
    member_ticket_reg_count = models.IntegerField(db_column='LECTURE_REG_COUNT', default=0)
    member_ticket_rem_count = models.IntegerField(db_column='LECTURE_REM_COUNT', default=0)
    member_ticket_avail_count = models.IntegerField(db_column='LECTURE_AVAIL_COUNT', default=0)
    day_count = models.IntegerField(db_column='DAY_COUNT', default=0)  # Field name made lowercase.
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    price = models.IntegerField(db_column='PRICE', default=0)  # Field name made lowercase.
    refund_price = models.IntegerField(db_column='REFUND_PRICE', default=0)
    refund_date = models.DateTimeField(db_column='REFUND_DATE', blank=True, null=True)  # Field name made lowercase.
    option_cd = models.CharField(db_column='OPTION_CD', max_length=10, blank=True, default='')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, default='')
    schedule_check = models.IntegerField(db_column='SCHEDULE_CHECK', default=1)
    note = models.CharField(db_column='NOTE', max_length=3000, blank=True, default='')
    member_auth_cd = models.CharField(db_column='MEMBER_AUTH_CD', max_length=20, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'LECTURE_TB'

    def __str__(self):
        return self.member.__str__()+'_member_ticket'

    def get_state_cd_name(self):
        try:
            state_cd_name = CommonCdTb.objects.get(common_cd=self.state_cd).common_cd_nm
        except ObjectDoesNotExist:
            state_cd_name = ''

        return state_cd_name


class MemberMemberTicketTb(TimeStampedModel):
    member_member_ticket_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    member_ticket_tb = models.ForeignKey(MemberTicketTb, on_delete=models.CASCADE, db_column='lecture_tb_id', null=True)
    auth_cd = models.CharField(db_column='AUTH_CD', max_length=20, blank=True, default='')  # Field name made lowercase.
    mod_member_id = models.CharField(db_column='MOD_MEMBER_ID', max_length=20, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MEMBER_LECTURE_TB'

    def get_auth_cd_name(self):

        try:
            auth_cd_name = CommonCdTb.objects.get(common_cd=self.auth_cd).common_cd_nm
        except ObjectDoesNotExist:
            auth_cd_name = ''
        return auth_cd_name
