from django.contrib import admin

# Register your models here.
from trainee.models import LectureTb


@admin.register(LectureTb)
class LectureTbAdmin(admin.ModelAdmin):
    list_display = ('lecture_id', 'class_tb', 'member', 'lecture_reg_count', 'lecture_rem_count', 'lecture_avail_count',
                    'day_count', 'start_date', 'end_date',
                    'price', 'option_cd', 'state_cd', 'member_view_state_cd', 'schedule_check','note', 'reg_dt', 'mod_dt', 'use')
