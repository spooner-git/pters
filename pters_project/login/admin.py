from django.contrib import admin

from login.models import CommonCdTb
from login.models import LogTb
from login.models import MemberTb
from schedule.models import ClassRepeatScheduleTb
from schedule.models import ClassScheduleTb
from trainer.models import ClassTb
from schedule.models import LectureScheduleTb
from trainee.models import LectureTb
from trainer.models import CompanyTb
from trainer.models import SettingTb
from trainer.models import ShopEmployeeTb

# Register your models here.


class ClassRepeatScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('class_repeat_schedule_id', 'class_tb', 'repeat_type_cd'
                    , 'week_cd', 'start_date', 'end_date', 'start_time'
                    , 'end_time', 'state_cd', 'en_dis_type', 'reg_dt', 'mod_dt', 'use')


class ClassScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('class_schedule_id', 'class_tb', 'start_dt', 'end_dt',
                    'state_cd', 'en_dis_type', 'reg_dt', 'mod_dt', 'use')


class ClassTbAdmin(admin.ModelAdmin):
    list_display = ('class_id', 'member_id', 'class_type_cd', 'subject_cd', 'subject_detail_nm', 'start_date', 'end_date',
                    'class_hour', 'start_hour_unit','class_member_num', 'state_cd', 'reg_dt', 'mod_dt', 'use')


class CommonCdTbAdmin(admin.ModelAdmin):
    list_display = ('common_cd', 'common_cd_nm', 'group_cd', 'group_cd_nm',
                    'upper_common_cd', 'upper_group_cd', 'attribute1', 'order', 'use')


class CompanyTbAdmin(admin.ModelAdmin):
    list_display = ('company_id', 'name', 'phone', 'address',
                    'info', 'img_url', 'reg_dt', 'mod_dt', 'use')


class LectureScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('lecture_schedule_id', 'lecture_tb', 'start_dt','end_dt',
                    'state_cd', 'sign_data_url', 'en_dis_type', 'reg_dt', 'mod_dt', 'use')


class LectureTbAdmin(admin.ModelAdmin):
    list_display = ('lecture_id', 'class_tb', 'member', 'lecture_count','day_count','start_date', 'end_date',
                    'price', 'option_cd', 'state_cd', 'reg_dt', 'mod_dt', 'use')


class LogTbAdmin(admin.ModelAdmin):
    list_display = ('log_id', 'external_id', 'log_type', 'contents',
                    'reg_dt', 'use')


class MemberTbAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'name', 'phone', 'age', 'sex',
                    'address', 'job', 'contents', 'reg_dt', 'mod_dt', 'use')


class SettingTbAdmin(admin.ModelAdmin):
    list_display = ('setting_id', 'member', 'setting_type_cd', 'setting_cd', 'state_cd',
                    'reg_dt', 'mod_dt', 'use')


class ShopEmployeeTbAdmin(admin.ModelAdmin):
    list_display = ('shop_employee_id', 'member', 'company', 'reg_dt', 'mod_dt', 'use')


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
