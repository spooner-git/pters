from django.db import models

from configs.const import BOARD_TYPE_CD_QA, NOTICE_TYPE_CD_NORMAL, TO_MEMBER_BOARD_TYPE_CD_ALL
from configs.models import TimeStampedModel
from login.models import MemberTb


class QATb(TimeStampedModel):
    qa_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    email_address = models.CharField(db_column='EMAIL_ADDRESS', max_length=255, blank=True, default='')
    qa_type_cd = models.CharField(db_column='QA_TYPE_CD', max_length=45, blank=True, default='')
    title = models.CharField(db_column='TITLE', max_length=255, blank=True, default='')
    contents = models.CharField(db_column='CONTENTS', max_length=1000, blank=True, default='')
    status_type_cd = models.CharField(db_column='STATUS', max_length=45, blank=True, default='')
    read = models.IntegerField(db_column='READ', default=1)  # Field name made lowercase.)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'QA_TB'


class QACommentTb(TimeStampedModel):
    qa_comment_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    qa_tb = models.ForeignKey(QATb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    upper_qa_comment_tb_id = models.CharField(db_column='UPPER_QA_COMMENT_TB_ID', max_length=20, blank=True, default='')
    title = models.CharField(db_column='TITLE', max_length=255, blank=True, default='')
    contents = models.CharField(db_column='CONTENTS', max_length=3000, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'QA_COMMENT_TB'


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


class CommentTb(TimeStampedModel):
    comment_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    board_type_cd = models.CharField(db_column='BOARD_TYPE_CD', max_length=45, blank=True, default=BOARD_TYPE_CD_QA)
    board_id = models.CharField(db_column='BOARD_ID', max_length=20, blank=True, default='')
    title = models.CharField(db_column='TITLE', max_length=255, blank=True, default='')
    contents = models.CharField(db_column='CONTENTS', max_length=3000, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'COMMENT_TB'


class NoticeTb(TimeStampedModel):
    notice_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    notice_type_cd = models.CharField(db_column='NOTICE_TYPE_CD', max_length=20,
                                      blank=True, default=NOTICE_TYPE_CD_NORMAL)
    title = models.CharField(db_column='TITLE', max_length=255, blank=True, default='')
    contents = models.CharField(db_column='CONTENTS', max_length=3000, blank=True, default='')
    to_member_type_cd = models.CharField(db_column='TO_MEMBER_TYPE_CD', max_length=20,
                                         blank=True, default=TO_MEMBER_BOARD_TYPE_CD_ALL)
    hits = models.IntegerField(db_column='HITS', default=0)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'NOTICE_TB'
