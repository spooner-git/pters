from django.contrib import admin

# Register your models here.
from trainer.models import ClassTb, CompanyTb


@admin.register(ClassTb)
class ClassTbAdmin(admin.ModelAdmin):
    list_display = ('class_id', 'member_id', 'center_tb', 'subject_cd', 'subject_detail_nm',
                    'start_date', 'end_date',
                    'class_hour', 'start_hour_unit', 'class_member_num', 'state_cd',
                    'member_view_state_cd', 'schedule_check',
                    'reg_dt', 'mod_dt', 'use')


@admin.register(CompanyTb)
class CompanyTbAdmin(admin.ModelAdmin):
    list_display = ('company_id', 'name', 'phone', 'address',
                    'info', 'img_url', 'reg_dt', 'mod_dt', 'use')
