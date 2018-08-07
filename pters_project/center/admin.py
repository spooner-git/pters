from django.contrib import admin

# Register your models here.
from .models import CenterTb, CenterTrainerTb, CompanyTb


@admin.register(CenterTb)
class CenterTbAdmin(admin.ModelAdmin):
    list_display = ('center_id', 'member', 'center_name', 'address', 'center_type_cd',
                    'center_img_url', 'reg_dt', 'mod_dt', 'use')


@admin.register(CenterTrainerTb)
class CenterTrainerTbAdmin(admin.ModelAdmin):
    list_display = ('center_trainer_id', 'member', 'center', 'reg_dt', 'mod_dt', 'use')


@admin.register(CompanyTb)
class CompanyTbAdmin(admin.ModelAdmin):
    list_display = ('company_id', 'name', 'phone', 'address',
                    'info', 'img_url', 'reg_dt', 'mod_dt', 'use')

