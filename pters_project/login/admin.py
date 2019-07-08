from django.contrib import admin

from .models import CommonCdTb, PushInfoTb, LogTb, MemberTb, SnsInfoTb


# Register your models here.


@admin.register(CommonCdTb)
class CommonCdTbAdmin(admin.ModelAdmin):
    list_display = ('common_cd', 'common_cd_nm', 'group_cd', 'group_cd_nm',
                    'upper_common_cd', 'upper_group_cd', 'attribute1', 'order', 'use')
    search_fields = ['common_cd_nm', 'upper_common_cd']


@admin.register(LogTb)
class LogTbAdmin(admin.ModelAdmin):
    list_display = ('log_id', 'log_type', 'auth_member_id', 'from_member_name', 'to_member_name',
                    'class_tb_id', 'lecture_tb_id',
                    'log_info', 'log_how', 'log_detail', 'ip',
                    'reg_dt', 'read', 'use')
    search_fields = ['class_tb_id']


@admin.register(MemberTb)
class MemberTbAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_user_group', 'name', 'phone', 'age', 'sex', 'birthday_dt',
                    'address', 'job', 'contents', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['name']

    def get_user_group(self, obj):
        group_name = ''
        if obj.user is None:
            group_data = ''
        else:
            group_data = obj.user.groups.filter(user=obj.user)
            for group_info in group_data:
                if group_name == '':
                    group_name = group_info.name
                else:
                    group_name += '/' + group_info.name

        return group_name
    get_user_group.short_description = 'Group'


@admin.register(PushInfoTb)
class PushInfoTbAdmin(admin.ModelAdmin):
    list_display = ('push_info_id', 'member', 'device_info', 'token', 'badge_counter', 'device_id',
                    'last_login', 'use')
    search_fields = ['member__name', 'device_id', 'device_info']


@admin.register(SnsInfoTb)
class SnsInfoTbAdmin(admin.ModelAdmin):
    list_display = ('sns_info_id', 'member', 'sns_id', 'sns_type', 'sns_name', 'sns_profile',
                    'sns_connect_date', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['member__name', 'sns_type']
