from django.contrib import admin
from django.core.exceptions import ObjectDoesNotExist

from login.models import CommonCdTb, PushInfoTb, QATb, BoardTb, CommentTb
from login.models import LogTb
from login.models import MemberTb
from login.models import HolidayTb

# Register your models here.


@admin.register(CommonCdTb)
class CommonCdTbAdmin(admin.ModelAdmin):
    list_display = ('common_cd', 'common_cd_nm', 'group_cd', 'group_cd_nm',
                    'upper_common_cd', 'upper_group_cd', 'attribute1', 'order', 'use')


@admin.register(LogTb)
class LogTbAdmin(admin.ModelAdmin):
    list_display = ('log_id', 'log_type', 'auth_member_id', 'from_member_name', 'to_member_name',
                    'class_tb_id', 'lecture_tb_id',
                    'log_info', 'log_how', 'log_detail', 'ip',
                    'reg_dt', 'read', 'use')


@admin.register(MemberTb)
class MemberTbAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_user_group', 'name', 'phone', 'age', 'sex', 'birthday_dt',
                    'address', 'job', 'contents', 'reg_dt', 'mod_dt', 'use')

    def get_user_group(self, obj):
        if obj.user is None:
            group_data = ''
        else:
            try:
                group_data = obj.user.groups.get(user=obj.user)
            except ObjectDoesNotExist:
                group_data = ''
        return group_data
    get_user_group.short_description = 'Group'


@admin.register(HolidayTb)
class HolidayTbAdmin(admin.ModelAdmin):
    list_display = ('holiday_id', 'holiday_dt', 'holiday_name', 'use')


@admin.register(PushInfoTb)
class PushInfoTbAdmin(admin.ModelAdmin):
    list_display = ('push_info_id', 'member', 'token', 'badge_counter', 'session_info','device_info',
                    'last_login', 'use')


@admin.register(QATb)
class QATbAdmin(admin.ModelAdmin):
    list_display = ('qa_id', 'member', 'qa_type_cd', 'title', 'contents', 'status', 'mod_dt', 'reg_dt', 'use')


@admin.register(BoardTb)
class BoardTbAdmin(admin.ModelAdmin):
    list_display = ('board_id', 'member', 'board_type_cd', 'title', 'contents', 'to_member_type_cd',
                    'hits', 'get', 'mod_dt', 'reg_dt', 'use')


@admin.register(CommentTb)
class CommentTbAdmin(admin.ModelAdmin):
    list_display = ('comment_id', 'member', 'board_type_cd', 'board', 'contents', 'mod_dt', 'reg_dt', 'use')
