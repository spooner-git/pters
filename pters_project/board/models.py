from django.core.exceptions import ObjectDoesNotExist
from django.db import models

from configs.const import BOARD_TYPE_CD_QA, BOARD_TYPE_CD_NOTICE, TO_MEMBER_BOARD_TYPE_CD_ALL
from configs.models import TimeStampedModel
from login.models import MemberTb, CommonCdTb


class QATb(TimeStampedModel):
    qa_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, verbose_name='등록자', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    email_address = models.CharField('email 주소', db_column='EMAIL_ADDRESS', max_length=255, blank=True, default='')
    qa_type_cd = models.CharField('질문 유형', db_column='QA_TYPE_CD', max_length=45, blank=True, default='')
    title = models.CharField('제목', db_column='TITLE', max_length=255, blank=True, default='')
    contents = models.CharField('내용', db_column='CONTENTS', max_length=1000, blank=True, default='')
    status_type_cd = models.CharField('처리 상태', db_column='STATUS', max_length=45, blank=True, default='')

    read = models.IntegerField('조회 여부', db_column='READ', default=0)  # Field name made lowercase.)

    class Meta:
        managed = False
        db_table = 'QA_TB'
        verbose_name = '문의사항'
        verbose_name_plural = '문의사항'

    def __str__(self):
        return self.member.__str__()+'(문의사항)'

    def get_qa_type_cd_name(self):
        try:
            qa_type_cd_name = CommonCdTb.objects.get(common_cd=self.qa_type_cd).common_cd_nm
        except ObjectDoesNotExist:
            qa_type_cd_name = ''

        return qa_type_cd_name

    def get_status_type_cd_name(self):
        try:
            status_type_cd_name = CommonCdTb.objects.get(common_cd=self.status_type_cd).common_cd_nm
        except ObjectDoesNotExist:
            status_type_cd_name = ''

        return status_type_cd_name


class QACommentTb(TimeStampedModel):
    qa_comment_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, verbose_name='등록자', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    qa_tb = models.ForeignKey(QATb, verbose_name='문의사항', on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    title = models.CharField('제목', db_column='TITLE', max_length=255, blank=True, default='')
    contents = models.CharField('내용', db_column='CONTENTS', max_length=3000, blank=True, default='')
    read = models.IntegerField('조회 여부', db_column='READ', default=0)  # Field name made lowercase.)

    upper_qa_comment_tb_id = models.CharField('상위 답변 ID', db_column='UPPER_QA_COMMENT_TB_ID',
                                              max_length=20, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'QA_COMMENT_TB'
        verbose_name = '문의사항 답변'
        verbose_name_plural = '문의사항 답변'


class NoticeTb(TimeStampedModel):
    notice_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, verbose_name='등록자', on_delete=models.CASCADE, null=True)
    notice_type_cd = models.CharField('공지 유형', db_column='NOTICE_TYPE_CD', max_length=20,
                                      blank=True, default=BOARD_TYPE_CD_NOTICE)
    title = models.CharField('제목', db_column='TITLE', max_length=255, blank=True, default='')
    contents = models.CharField('내용', db_column='CONTENTS', max_length=3000, blank=True, default='')
    to_member_type_cd = models.CharField('공지 대상', db_column='TO_MEMBER_TYPE_CD', max_length=20,
                                         blank=True, default=TO_MEMBER_BOARD_TYPE_CD_ALL)
    hits = models.IntegerField('조회수', db_column='HITS', default=0)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'NOTICE_TB'
        verbose_name = '관리자 공지사항'
        verbose_name_plural = '관리자 공지사항'


# 아직 사용 안함
class BoardTb(TimeStampedModel):
    board_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    board_type_cd = models.CharField(db_column='BOARD_TYPE_CD', max_length=45, blank=True, default='NOTICE')
    title = models.CharField(db_column='TITLE', max_length=255, blank=True, default='')
    contents = models.CharField(db_column='CONTENTS', max_length=3000, blank=True, default='')
    to_member_type_cd = models.CharField(db_column='TO_MEMBER_TYPE_CD', max_length=45, blank=True, default='ALL')
    hits = models.IntegerField(db_column='HITS', default=0)  # Field name made lowercase.
    get = models.IntegerField(db_column='GET', default=0)  # Field name made lowercase
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'BOARD_TB'
        verbose_name = '관리자 게시판'
        verbose_name_plural = '관리자 게시판'


class CommentTb(TimeStampedModel):
    comment_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    board_type_cd = models.CharField(db_column='BOARD_TYPE_CD', max_length=45, blank=True, default=BOARD_TYPE_CD_QA)
    board_id = models.CharField(db_column='BOARD_ID', max_length=20, blank=True, default='')
    title = models.CharField('제목', db_column='TITLE', max_length=255, blank=True, default='')
    contents = models.CharField('내용', db_column='CONTENTS', max_length=3000, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'COMMENT_TB'
        verbose_name = '관리자 게시판 댓글'
        verbose_name_plural = '관리자 게시판 댓글'
