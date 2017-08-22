from django.contrib import admin

from mobile.models import ClassRepeatScheduleTb
from mobile.models import ClassScheduleTb
from mobile.models import ClassTb
from mobile.models import CommonCdTb
from mobile.models import CompanyTb
from mobile.models import LectureScheduleTb
from mobile.models import LectureTb
from mobile.models import LogTb
from mobile.models import MemberTb
from mobile.models import SettingTb
from mobile.models import ShopEmployeeTb

# Register your models here.


class ClassRepeatScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('class_repeat_schedule_id', 'class_field', 'en_dis_type_cd', 'repeat_type_cd'
                    , 'week_cd', 'start_date', 'end_date', 'start_time'
                    , 'end_time', 'state_cd', 'reg_dt', 'mod_dt', 'use')


class ClassScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('class_schedule_id', 'class_field', 'en_dis_type_cd', 'start_dt', 'end_dt',
                    'state_cd', 'reg_dt', 'mod_dt', 'use')


class ClassTbAdmin(admin.ModelAdmin):
    list_display = ('class_id', 'member', 'class_type_cd', 'subject_cd', 'start_date', 'end_date',
                    'class_hour', 'start_hour_unit','class_member_num', 'state_cd', 'reg_dt', 'mod_dt', 'use')


class CommonCdTbAdmin(admin.ModelAdmin):
    list_display = ('group_cd', 'common_cd', 'common_cd_nm', 'group_cd_nm',
                    'upper_common_cd', 'upper_group_cd', 'attribute1', 'order', 'use')


class CompanyTbAdmin(admin.ModelAdmin):
    list_display = ('company_id', 'name', 'phone', 'address',
                    'info', 'img_url', 'reg_dt', 'mod_dt', 'use')


class LectureScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('lecture_schedule_id', 'lecture', 'en_dis_type_cd', 'start_dt','end_dt',
                    'state_cd', 'sign_data_url', 'reg_dt', 'mod_dt', 'use')


class LectureTbAdmin(admin.ModelAdmin):
    list_display = ('lecture_id', 'class_field', 'member', 'lecture_count','day_count','start_date', 'end_date',
                    'price', 'option_cd', 'state_cd', 'reg_dt', 'mod_dt', 'use')


class LogTbAdmin(admin.ModelAdmin):
    list_display = ('log_id', 'external_id', 'log_type', 'contents',
                    'reg_dt', 'use')


class MemberTbAdmin(admin.ModelAdmin):
    list_display = ('member_id', 'member_type_cd', 'author_cd', 'id', 'pw', 'name', 'phone', 'age', 'sex',
                    'address', 'job', 'contents', 'reg_dt', 'mod_dt', 'use')


class SettingTbAdmin(admin.ModelAdmin):
    list_display = ('member', 'setting_type_cd', 'setting_cd', 'state_cd',
                    'reg_dt', 'mod_dt', 'use')


class ShopEmployeeTbAdmin(admin.ModelAdmin):
    list_display = ('member', 'company', 'reg_dt', 'mod_dt', 'use')


admin.site.register(ClassRepeatScheduleTb, ClassRepeatScheduleTbAdmin)
admin.site.register(ClassScheduleTb, ClassScheduleTbAdmin)
admin.site.register(ClassTb, ClassTbAdmin)
admin.site.register(CommonCdTb, CommonCdTbAdmin)
admin.site.register(CompanyTb, CompanyTbAdmin)
admin.site.register(LectureScheduleTb, LectureScheduleTbAdmin)
admin.site.register(LectureTb, LectureTbAdmin)
admin.site.register(LogTb, LogTbAdmin)
admin.site.register(MemberTb, MemberTbAdmin)
admin.site.register(SettingTb, SettingTbAdmin)
admin.site.register(ShopEmployeeTb, ShopEmployeeTbAdmin)