from django.contrib import admin

# Register your models here.
from .models import RepeatScheduleTb, ScheduleTb, DeleteRepeatScheduleTb, DeleteScheduleTb, HolidayTb


@admin.register(RepeatScheduleTb)
class RepeatScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('repeat_schedule_id', 'class_tb', 'lecture_tb', 'repeat_type_cd', 'group_tb', 'group_schedule_id',
                    'week_info', 'start_date', 'end_date', 'start_time', 'end_time', 'time_duration',
                    'state_cd', 'en_dis_type', 'reg_member', 'reg_dt', 'mod_dt')
    search_fields = ['class_tb__member__name', 'lecture_tb__member__name', 'group_tb__name']


@admin.register(DeleteRepeatScheduleTb)
class DeleteRepeatScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('repeat_schedule_id', 'class_tb', 'lecture_tb', 'repeat_type_cd', 'group_tb', 'group_schedule_id',
                    'week_info', 'start_date', 'end_date', 'start_time', 'time_duration',
                    'state_cd', 'en_dis_type', 'reg_member', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb__member__name', 'lecture_tb__member__name', 'group_tb__name']


@admin.register(ScheduleTb)
class ScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('schedule_id', 'class_tb', 'lecture_tb', 'group_tb', 'group_schedule_id',
                    'repeat_schedule_tb', 'start_dt', 'end_dt',
                    'permission_state_cd', 'state_cd', 'sign_data_url', 'note', 'member_note', 'en_dis_type',
                    'reg_member', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb__member__name', 'lecture_tb__member__name', 'group_tb__name']


@admin.register(DeleteScheduleTb)
class DeleteScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('schedule_id', 'class_tb', 'lecture_tb', 'group_tb', 'group_schedule_id',
                    'delete_repeat_schedule_tb', 'start_dt', 'end_dt',
                    'permission_state_cd', 'state_cd', 'sign_data_url', 'note', 'member_note', 'en_dis_type',
                    'reg_member', 'del_member_id', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb__member__name', 'lecture_tb__member__name', 'group_tb__name']


@admin.register(HolidayTb)
class HolidayTbAdmin(admin.ModelAdmin):
    list_display = ('holiday_id', 'holiday_dt', 'holiday_name', 'use')
    search_fields = ['holiday_name']
