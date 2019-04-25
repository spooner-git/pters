from django.contrib import admin

# Register your models here.
from .models import LectureTb, MemberLectureTb


@admin.register(LectureTb)
class LectureTbAdmin(admin.ModelAdmin):
    list_display = ('lecture_id', 'member', 'lecture_reg_count', 'lecture_rem_count', 'lecture_avail_count',
                    'day_count', 'start_date', 'end_date',
                    'price', 'refund_price', 'refund_date', 'option_cd', 'state_cd', 'schedule_check',
                    'note', 'reg_dt', 'mod_dt', 'use')


@admin.register(MemberLectureTb)
class MemberLectureTbAdmin(admin.ModelAdmin):
    list_display = ('member_lecture_id', 'member', 'lecture_tb', 'auth_cd',
                    'mod_member_id', 'reg_dt', 'mod_dt', 'use')
