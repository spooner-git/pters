from django.contrib import admin

# Register your models here.
from .models import RepeatScheduleTb, ScheduleTb, DeleteRepeatScheduleTb, DeleteScheduleTb, HolidayTb, DailyRecordTb, \
    ScheduleAlarmTb


@admin.register(RepeatScheduleTb)
class RepeatScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('repeat_schedule_id', 'class_tb', 'member_ticket_tb', 'lecture_tb', 'lecture_schedule_id',
                    'repeat_type_cd', 'week_info', 'start_date', 'end_date', 'start_time', 'end_time',
                    'state_cd', 'en_dis_type', 'reg_member', 'mod_member', 'reg_dt', 'mod_dt')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member',
            'member_ticket_tb__member',
            'member_ticket_tb__ticket_tb__class_tb__member',
            'lecture_tb__class_tb__member',
            'reg_member',
            'mod_member',
        )


@admin.register(ScheduleTb)
class ScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('schedule_id', 'class_tb', 'member_ticket_tb', 'lecture_tb', 'lecture_schedule_id',
                    'repeat_schedule_tb', 'start_dt', 'end_dt', 'max_mem_count', 'state_cd',
                    'permission_state_cd', 'daily_record_tb', 'note', 'member_note', 'en_dis_type',
                    'ing_color_cd', 'ing_font_color_cd',
                    'end_color_cd', 'end_font_color_cd', 'push_alarm_data',
                    'reg_member', 'mod_member', 'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member',
            'member_ticket_tb__member',
            'member_ticket_tb__ticket_tb__class_tb__member',
            'lecture_tb__class_tb__member',
            'repeat_schedule_tb',
            'daily_record_tb',
            'reg_member', 'mod_member'
        )


@admin.register(DailyRecordTb)
class DailyRecordTbAdmin(admin.ModelAdmin):
    list_display = ('daily_record_id', 'class_tb', 'schedule_tb', 'title', 'contents', 'reg_member',
                    'is_member_view', 'img_list', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member',
            'schedule_tb',
        )


@admin.register(DeleteScheduleTb)
class DeleteScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('delete_schedule_id', 'schedule_id', 'class_tb', 'member_ticket_tb', 'lecture_tb',
                    'lecture_schedule_id', 'delete_repeat_schedule_tb', 'start_dt', 'end_dt', 'state_cd',
                    'permission_state_cd', 'note', 'member_note', 'en_dis_type',
                    'reg_member', 'del_member', 'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member',
            'member_ticket_tb__member',
            'member_ticket_tb__ticket_tb__class_tb__member',
            'lecture_tb__class_tb__member',
            'reg_member'
        )


@admin.register(DeleteRepeatScheduleTb)
class DeleteRepeatScheduleTbAdmin(admin.ModelAdmin):
    list_display = ('delete_repeat_schedule_id', 'repeat_schedule_id', 'class_tb', 'member_ticket_tb', 'lecture_tb',
                    'lecture_schedule_id', 'repeat_type_cd', 'week_info', 'start_date', 'end_date',
                    'start_time', 'time_duration', 'state_cd', 'en_dis_type', 'reg_member', 'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member',
            'member_ticket_tb__member',
            'member_ticket_tb__ticket_tb__class_tb__member',
            'lecture_tb__class_tb__member',
            'reg_member',
        )


@admin.register(HolidayTb)
class HolidayTbAdmin(admin.ModelAdmin):
    list_display = ('holiday_id', 'holiday_dt', 'holiday_name', 'use')
    search_fields = ['holiday_name']


@admin.register(ScheduleAlarmTb)
class ScheduleAlarmTbAdmin(admin.ModelAdmin):
    list_display = ('schedule_alarm_id', 'class_tb', 'member_id', 'schedule_tb', 'alarm_dt', 'alarm_minute',
                    'mod_dt', 'reg_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member',
        )
