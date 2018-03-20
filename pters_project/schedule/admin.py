from django.contrib import admin

# Register your models here.
from schedule.models import RepeatScheduleTb, ScheduleTb, DeleteRepeatScheduleTb, DeleteScheduleTb, SettingTb


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

