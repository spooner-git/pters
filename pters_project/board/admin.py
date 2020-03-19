from django.contrib import admin

# Register your models here.
from .models import QATb, NoticeTb, QACommentTb


@admin.register(QATb)
class QATbAdmin(admin.ModelAdmin):
    list_display = ('qa_id', 'member', 'email_address', 'qa_type_cd', 'title', 'contents',
                    'status_type_cd', 'mod_dt', 'reg_dt', 'use')
    search_fields = ['email_address', 'qa_type_cd', 'status_type_cd', 'title']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member',
        )


@admin.register(QACommentTb)
class QACommentTbAdmin(admin.ModelAdmin):
    list_display = ('qa_comment_id', 'member', 'qa_tb', 'title', 'contents', 'read',
                    'mod_dt', 'reg_dt', 'use')
    search_fields = ['title']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member', 'qa_tb',
        )


@admin.register(NoticeTb)
class NoticeTbAdmin(admin.ModelAdmin):
    list_display = ('notice_id', 'member', 'notice_type_cd', 'title', 'contents', 'to_member_type_cd',
                    'home_display', 'hits', 'mod_dt', 'reg_dt', 'use')
    search_fields = ['notice_type_cd', 'to_member_type_cd', 'title']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member',
        )
