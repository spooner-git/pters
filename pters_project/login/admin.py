from django.contrib import admin
from login.models import CommonCdTb
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
    list_display = ('log_id', 'external_id', 'log_type', 'contents',
                    'reg_dt', 'use')


@admin.register(MemberTb)
class MemberTbAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_user_group', 'name', 'phone', 'age', 'sex', 'birthday_dt',
                    'address', 'job', 'contents', 'reg_dt', 'mod_dt', 'use')

    def get_user_group(self, obj):
        group_data = obj.user.groups.get(user=obj.user)
        if group_data is None:
            group_data = ''
        else:
            group_data = group_data
        return group_data
    get_user_group.short_description = 'Group'


@admin.register(HolidayTb)
class HolidayTbAdmin(admin.ModelAdmin):
    list_display = ('holiday_id', 'holiday_dt', 'holiday_name', 'use')

