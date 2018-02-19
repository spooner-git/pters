from django.contrib import admin
from django.contrib.auth.models import User

from login.models import CommonCdTb
from login.models import LogTb
from login.models import MemberTb
from trainer.models import ClassRepeatScheduleTb
from trainer.models import ClassScheduleTb
from trainer.models import ClassTb
from trainee.models import LectureScheduleTb
from trainee.models import LectureTb
from trainer.models import CompanyTb
from trainer.models import SettingTb
from trainer.models import ShopEmployeeTb
from login.models import HolidayTb

# Register your models here.


@admin.register(ClassRepeatScheduleTb)
class ClassRepeatScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('class_repeat_schedule_id', 'class_tb', 'repeat_type_cd'
                    , 'week_cd', 'start_date', 'end_date', 'start_time'
                    , 'end_time', 'state_cd', 'en_dis_type', 'reg_dt', 'mod_dt', 'use')


@admin.register(ClassScheduleTb)
class ClassScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('class_schedule_id', 'class_tb', 'start_dt', 'end_dt',
                    'state_cd', 'en_dis_type', 'reg_dt', 'mod_dt', 'use')


@admin.register(ClassTb)
class ClassTbAdmin(admin.ModelAdmin):
    list_display = ('class_id', 'member_id', 'class_type_cd', 'subject_cd', 'subject_detail_nm', 'start_date', 'end_date',
                    'class_hour', 'start_hour_unit','class_member_num', 'state_cd', 'reg_dt', 'mod_dt', 'use')


@admin.register(CommonCdTb)
class CommonCdTbAdmin(admin.ModelAdmin):
    list_display = ('common_cd', 'common_cd_nm', 'group_cd', 'group_cd_nm',
                    'upper_common_cd', 'upper_group_cd', 'attribute1', 'order', 'use')


@admin.register(CompanyTb)
class CompanyTbAdmin(admin.ModelAdmin):
    list_display = ('company_id', 'name', 'phone', 'address',
                    'info', 'img_url', 'reg_dt', 'mod_dt', 'use')


@admin.register(LectureScheduleTb)
class LectureScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('lecture_schedule_id', 'lecture_tb','class_tb', 'start_dt','end_dt',
                    'state_cd', 'sign_data_url', 'en_dis_type', 'reg_dt', 'mod_dt', 'use')


@admin.register(LectureTb)
class LectureTbAdmin(admin.ModelAdmin):
    list_display = ('lecture_id', 'class_tb', 'member', 'lecture_reg_count','lecture_rem_count','lecture_avail_count',
                    'day_count','start_date', 'end_date',
                    'price', 'option_cd', 'state_cd', 'reg_dt', 'mod_dt', 'use')


@admin.register(LogTb)
class LogTbAdmin(admin.ModelAdmin):
    list_display = ('log_id', 'external_id', 'log_type', 'contents',
                    'reg_dt', 'use')


@admin.register(MemberTb)
class MemberTbAdmin(admin.ModelAdmin):
    list_display = ('user','get_user_group','name', 'phone', 'age', 'sex','birthday_dt',
                    'address', 'job', 'contents', 'reg_dt', 'mod_dt', 'use')

    def get_user_group(self, obj):
        group_data = obj.user.groups.get(user=obj.user)
        if group_data is None:
            group_data = ''
        else:
            group_data = group_data
        return group_data
    get_user_group.short_description = 'Group'


@admin.register(SettingTb)
class SettingTbAdmin(admin.ModelAdmin):
    list_display = ('setting_id', 'member', 'setting_type_cd', 'setting_cd', 'state_cd',
                    'reg_dt', 'mod_dt', 'use')


@admin.register(ShopEmployeeTb)
class ShopEmployeeTbAdmin(admin.ModelAdmin):
    list_display = ('shop_employee_id', 'member', 'company', 'reg_dt', 'mod_dt', 'use')


@admin.register(HolidayTb)
class HolidayTbAdmin(admin.ModelAdmin):
    list_display = ('holiday_id', 'holiday_dt','holiday_name', 'use')

