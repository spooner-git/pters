from django.contrib import admin

# Register your models here.
from .models import QATb, BoardTb, CommentTb, NoticeTb, QACommentTb


@admin.register(QATb)
class QATbAdmin(admin.ModelAdmin):
    list_display = ('qa_id', 'member', 'email_address', 'qa_type_cd', 'title', 'contents',
                    'status_type_cd', 'read', 'mod_dt', 'reg_dt', 'use')
    search_fields = ['member__name', 'email_address', 'qa_type_cd', 'status_type_cd', 'title']


@admin.register(QACommentTb)
class QACommentTbAdmin(admin.ModelAdmin):
    list_display = ('qa_comment_id', 'member', 'qa_tb', 'upper_qa_comment_tb_id', 'title', 'contents',
                    'mod_dt', 'reg_dt', 'use')
    search_fields = ['member__name', 'upper_qa_comment_tb_id', 'title']


@admin.register(BoardTb)
class BoardTbAdmin(admin.ModelAdmin):
    list_display = ('board_id', 'member', 'board_type_cd', 'title', 'contents', 'to_member_type_cd',
                    'hits', 'get', 'mod_dt', 'reg_dt', 'use')
    search_fields = ['member__name', 'board_type_cd', 'title']


@admin.register(CommentTb)
class CommentTbAdmin(admin.ModelAdmin):
    list_display = ('comment_id', 'member', 'board_type_cd', 'board_id', 'title', 'contents', 'mod_dt', 'reg_dt', 'use')
    search_fields = ['member__name', 'board_type_cd', 'title']


@admin.register(NoticeTb)
class NoticeTbAdmin(admin.ModelAdmin):
    list_display = ('notice_id', 'member', 'notice_type_cd', 'title', 'contents', 'to_member_type_cd',
                    'hits', 'mod_dt', 'reg_dt', 'use')
    search_fields = ['member__name', 'notice_type_cd', 'to_member_type_cd', 'title']
