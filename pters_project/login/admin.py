from django.contrib import admin
from django.core.exceptions import ObjectDoesNotExist

from .models import CommonCdTb, PushInfoTb, LogTb, MemberTb

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


@admin.register(PushInfoTb)
class PushInfoTbAdmin(admin.ModelAdmin):
    list_display = ('push_info_id', 'member', 'device_id', 'token', 'badge_counter',
                    'device_info', 'last_login', 'use')

