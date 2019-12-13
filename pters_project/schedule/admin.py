from django.contrib import admin

# Register your models here.
from .models import RepeatScheduleTb, ScheduleTb, DeleteRepeatScheduleTb, DeleteScheduleTb, HolidayTb, DailyRecordTb


@admin.register(RepeatScheduleTb)
class RepeatScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('repeat_schedule_id', 'class_tb', 'member_ticket_tb', 'lecture_tb', 'lecture_schedule_id',
                    'repeat_type_cd', 'week_info', 'start_date', 'end_date', 'start_time', 'end_time', 'time_duration',
                    'state_cd', 'en_dis_type', 'reg_member', 'reg_dt', 'mod_dt')
    search_fields = ['class_tb__member__name', 'member_ticket_tb__member__name', 'lecture_tb__name']


@admin.register(ScheduleTb)
class ScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('schedule_id', 'class_tb', 'member_ticket_tb', 'lecture_tb', 'lecture_schedule_id',
                    'repeat_schedule_tb', 'start_dt', 'end_dt', 'alarm_dt', 'max_mem_count',
                    'permission_state_cd', 'state_cd', 'sign_data_url', 'note', 'member_note', 'en_dis_type',
                    'ing_color_cd', 'ing_font_color_cd', 'end_color_cd', 'end_font_color_cd',
                    'reg_member', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb__member__name', 'member_ticket_tb__member__name', 'lecture_tb__name']


@admin.register(DeleteScheduleTb)
class DeleteScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('delete_schedule_id', 'schedule_id', 'class_tb', 'member_ticket_tb', 'lecture_tb',
                    'lecture_schedule_id', 'delete_repeat_schedule_tb', 'start_dt', 'end_dt',
                    'permission_state_cd', 'state_cd', 'sign_data_url', 'note', 'member_note', 'en_dis_type',
                    'reg_member', 'del_member', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb__member__name', 'member_ticket_tb__member__name', 'lecture_tb__name']


@admin.register(DeleteRepeatScheduleTb)
class DeleteRepeatScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('delete_repeat_schedule_id', 'repeat_schedule_id', 'class_tb', 'member_ticket_tb', 'lecture_tb',
                    'lecture_schedule_id', 'repeat_type_cd', 'week_info', 'start_date', 'end_date',
                    'start_time', 'time_duration', 'state_cd', 'en_dis_type', 'reg_member', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb__member__name', 'member_ticket_tb__member__name', 'lecture_tb__name']


@admin.register(HolidayTb)
class HolidayTbAdmin(admin.ModelAdmin):
    list_display = ('holiday_id', 'holiday_dt', 'holiday_name', 'use')
    search_fields = ['holiday_name']


@admin.register(DailyRecordTb)
class DailyRecordTbAdmin(admin.ModelAdmin):
    list_display = ('daily_record_id', 'class_tb', 'schedule_tb', 'title', 'contents', 'reg_member',
                    'is_member_view', 'img_list', 'use')
    search_fields = ['holiday_name']
