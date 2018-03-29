from django.contrib import admin

# Register your models here.
from schedule.models import RepeatScheduleTb, ScheduleTb, DeleteRepeatScheduleTb, DeleteScheduleTb, SettingTb, ClassTb, \
    LectureTb, CompanyTb, ClassLectureTb, MemberClassTb, MemberLectureTb


@admin.register(RepeatScheduleTb)
class RepeatScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('repeat_schedule_id', 'class_tb', 'lecture_tb', 'repeat_type_cd',
                    'week_info', 'start_date', 'end_date', 'start_time', 'time_duration',
                    'state_cd', 'en_dis_type', 'reg_dt', 'mod_dt')


@admin.register(DeleteRepeatScheduleTb)
class DeleteRepeatScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('repeat_schedule_id', 'class_tb', 'lecture_tb', 'repeat_type_cd',
                    'week_info', 'start_date', 'end_date', 'start_time', 'time_duration',
                    'state_cd', 'en_dis_type', 'reg_dt', 'mod_dt', 'use')


@admin.register(ScheduleTb)
class ScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('schedule_id', 'class_tb', 'lecture_tb', 'repeat_schedule_tb', 'start_dt', 'end_dt',
                    'state_cd', 'sign_data_url', 'note', 'en_dis_type', 'reg_dt', 'mod_dt')


@admin.register(DeleteScheduleTb)
class DeleteScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('schedule_id', 'class_tb', 'lecture_tb', 'delete_repeat_schedule_tb', 'start_dt', 'end_dt',
                    'state_cd', 'sign_data_url', 'note', 'en_dis_type', 'reg_dt', 'mod_dt', 'use')


@admin.register(SettingTb)
class SettingTbAdmin(admin.ModelAdmin):
    list_display = ('setting_id', 'member', 'class_tb', 'lecture_tb', 'setting_type_cd', 'setting_info',
                    'reg_dt', 'mod_dt', 'use')


@admin.register(ClassTb)
class ClassTbAdmin(admin.ModelAdmin):
    list_display = ('class_id', 'member', 'center_tb', 'subject_cd', 'subject_detail_nm',
                    'start_date', 'end_date',
                    'class_hour', 'start_hour_unit', 'class_member_num', 'state_cd',
                    'schedule_check',
                    'reg_dt', 'mod_dt', 'use')


@admin.register(LectureTb)
class LectureTbAdmin(admin.ModelAdmin):
    list_display = ('lecture_id', 'member', 'lecture_reg_count', 'lecture_rem_count', 'lecture_avail_count',
                    'day_count', 'start_date', 'end_date',
                    'price', 'refund_price', 'option_cd', 'state_cd', 'schedule_check','note', 'reg_dt', 'mod_dt', 'use')


@admin.register(CompanyTb)
class CompanyTbAdmin(admin.ModelAdmin):
    list_display = ('company_id', 'name', 'phone', 'address',
                    'info', 'img_url', 'reg_dt', 'mod_dt', 'use')


@admin.register(ClassLectureTb)
class ClassLectureTbAdmin(admin.ModelAdmin):
    list_display = ('class_lecture_id', 'class_tb', 'lecture_tb', 'auth_cd',
                    'mod_member_id', 'reg_dt', 'mod_dt', 'use')


@admin.register(MemberClassTb)
class MemberClassTbAdmin(admin.ModelAdmin):
    list_display = ('member_class_id', 'member', 'class_tb', 'auth_cd',
                    'mod_member_id', 'reg_dt', 'mod_dt', 'use')


@admin.register(MemberLectureTb)
class MemberLectureTbAdmin(admin.ModelAdmin):
    list_display = ('member_lecture_id', 'member', 'lecture_tb', 'auth_cd',
                    'mod_member_id', 'reg_dt', 'mod_dt', 'use')
