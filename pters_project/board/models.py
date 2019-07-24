from django.db import models

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
    board_type_cd = models.CharField(db_column='BOARD_TYPE_CD', max_length=45, blank=True, default='')
    board = models.ForeignKey(BoardTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    contents = models.CharField(db_column='CONTENTS', max_length=1000, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'COMMENT_TB'
