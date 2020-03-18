# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from __future__ import unicode_literals

from django.contrib.auth.models import User
from django.db import models

from configs.models import TimeStampedModel


class MemberTb(TimeStampedModel):
    member_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    name = models.CharField('이름', db_column='NAME', max_length=20, blank=True, default='')  # Field name made lowercase.
    phone = models.CharField('휴대폰', db_column='PHONE', max_length=20, blank=True, default='')  # Field name made lowercase.
    sex = models.CharField('성별', db_column='SEX', max_length=2, blank=True, default='')  # Field name made lowercase.
    birthday_dt = models.DateField('생년월일', db_column='BIRTHDAY_DT', blank=True, null=True)  # Field name made lowercase.
    profile_url = models.CharField('프로필 사진 URL', db_column='PROFILE_URL', max_length=255, blank=True, null=True,
                                   default='/static/common/icon/icon_account.png')
    phone_is_active = models.IntegerField('휴대폰 인증 여부', db_column='PHONE_IS_ACTIVE', blank=True, null=True, default=0)
    reg_info = models.CharField('생성자 회원 ID', db_column='REG_INFO', max_length=20, blank=True, default='')
    user = models.ForeignKey(User, verbose_name='회원', on_delete=models.SET_NULL, blank=True, null=True)

    age = models.IntegerField('나이', db_column='AGE', blank=True, null=True)  # Field name made lowercase.
    country = models.CharField('국가', db_column='COUNTRY', max_length=255, blank=True, default='')
    address = models.CharField('지역', db_column='ADDRESS', max_length=255, blank=True, default='')
    job = models.CharField('직업', db_column='JOB', max_length=20, blank=True, default='')  # Field name made lowercase.
    contents = models.CharField('소개', db_column='CONTENTS', max_length=255, blank=True, default='')
    recommended_member_id = models.CharField('추천 회원 ID', db_column='RECOMMENDED_MEMBER_ID',
                                             max_length=20, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'MEMBER_TB'
        verbose_name = '회원'
        verbose_name_plural = '회원'

    def __str__(self):
        return self.name


class MemberOutInfoTb(TimeStampedModel):
    member_out_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE)  # Field name made lowercase.
    out_type = models.CharField('탈퇴 유형', db_column='OUT_TYPE', max_length=45, blank=True, default='')  # Field name made lowercase.
    out_reason = models.CharField('탈퇴 사유', db_column='OUT_REASON', max_length=3000, blank=True, default='')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MEMBER_OUT_INFO_TB'
        verbose_name = '탈퇴 내역'
        verbose_name_plural = '탈퇴 내역'


class CommonCdTb(models.Model):
    common_cd_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    group_cd = models.CharField('그룹 코드', db_column='GROUP_CD', max_length=45, blank=True, default='')
    common_cd = models.CharField('공통 코드', db_column='COMMON_CD', primary_key=True, max_length=45)  # Field name made lowercase.
    common_cd_nm = models.CharField('공콩 코드명', db_column='COMMON_CD_NM', max_length=100, blank=True, default='')
    group_cd_nm = models.CharField('그룹 코드명', db_column='GROUP_CD_NM', max_length=100, blank=True, default='')
    upper_common_cd = models.CharField('상위 코드', db_column='UPPER_COMMON_CD', max_length=45, blank=True, default='')
    upper_group_cd = models.CharField('상위 그룹 코드', db_column='UPPER_GROUP_CD', max_length=45, blank=True, default='')
    attribute1 = models.CharField('속성', db_column='ATTRIBUTE1', max_length=255, blank=True, default='')
    order = models.IntegerField('순서', db_column='ORDER', default=1)  # Field name made lowercase.
    use = models.IntegerField('사용', db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'COMMON_CD_TB'
        verbose_name = '공통 코드'
        verbose_name_plural = '공통 코드'

    def __str__(self):
        return self.common_cd_nm


class LogTb(TimeStampedModel):
    log_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    log_type = models.CharField('로그 분류', db_column='LOG_TYPE', max_length=20, blank=True, default='')
    auth_member = models.ForeignKey(MemberTb, verbose_name='회원', db_column='AUTH_MEMBER_ID', null=True, default='')
    from_member_name = models.CharField('from 회원명', db_column='FROM_MEMBER_NAME', max_length=20, blank=True, default='')
    to_member_name = models.CharField('to 회원명', db_column='TO_MEMBER_NAME', max_length=20, blank=True, default='')
    class_tb = models.ForeignKey('trainer.ClassTb', verbose_name='프로그램', db_column='class_tb_id', null=True, default='')
    member_ticket_tb = models.ForeignKey('trainee.MemberTicketTb', verbose_name='회원 수강권', db_column='lecture_tb_id', null=True, default='')
    log_info = models.CharField('LOG 제목', db_column='LOG_INFO', max_length=255, blank=True, default='')
    log_how = models.CharField('LOG 정보', db_column='LOG_HOW', max_length=255, blank=True, default='')
    log_detail = models.CharField('LOG 상세 정보', db_column='LOG_DETAIL', max_length=255, blank=True, default='')
    ip = models.CharField('IP', db_column='IP', max_length=255, blank=True, default='')
    read = models.IntegerField('강사 읽음 확인', db_column='READ', default=0)  # Field name made lowercase.
    member_read = models.IntegerField('회원 읽음 확인', db_column='MEMBER_READ', default=0)

    push_check = models.IntegerField('push 확인', db_column='PUSH_CHECK', default=0)

    class Meta:
        managed = False
        db_table = 'LOG_TB'
        verbose_name = '로그(알람)'
        verbose_name_plural = '로그(알람)'


class PushInfoTb(TimeStampedModel):
    push_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    token = models.CharField('토큰',db_column='TOKEN', max_length=255, blank=True, default='')
    device_id = models.CharField('디바이스 ID', db_column='DEVICE_ID', max_length=255, blank=True, default='')
    device_info = models.CharField('디바이스 정보', db_column='DEVICE_INFO', max_length=255, blank=True, default='')
    badge_counter = models.IntegerField('앱 badge', db_column='BADGE_COUNTER', default=0)
    last_login = models.DateTimeField('최종 로그인 시각', db_column='LAST_LOGIN', blank=True, null=True)

    session_info = models.CharField('세션 정보', db_column='SESSION_INFO', max_length=255, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'PUSH_INFO_TB'
        verbose_name = 'PUSH 정보'
        verbose_name_plural = 'PUSH 정보'


class SnsInfoTb(TimeStampedModel):
    sns_info_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, verbose_name='회원', on_delete=models.CASCADE)  # Field name made lowercase.
    sns_name = models.CharField('SNS 이름', db_column='SNS_NAME', max_length=255, blank=True, default='')
    sns_id = models.CharField('SNS ID', db_column='SNS_ID', max_length=255, blank=True, default='')  # Field name made lowercase.
    sns_type = models.CharField('SNS 종류', db_column='SNS_TYPE', max_length=10, blank=True, default='')
    sns_connect_date = models.DateField('SNS 가입일', db_column='SNS_CONNECT_DATE', blank=True, null=True)
    change_password_check = models.IntegerField('비밀번호 변경 유무', db_column='CHANGE_PASSWORD_CHECK', default=0)

    sns_profile = models.CharField('프로필 정보', db_column='SNS_PROFILE', max_length=255, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'SNS_INFO_TB'
        verbose_name = 'SNS 가입 정보'
        verbose_name_plural = 'SNS 가입 정보'
