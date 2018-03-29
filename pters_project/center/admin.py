from django.contrib import admin

# Register your models here.
from center.models import CenterTb, CenterTrainerTb


@admin.register(CenterTb)
class CenterTbAdmin(admin.ModelAdmin):
    list_display = ('center_id', 'member', 'center_name', 'address', 'center_type_cd',
                    'center_img_url', 'reg_dt', 'mod_dt', 'use')


@admin.register(CenterTrainerTb)
class CenterTrainerTbAdmin(admin.ModelAdmin):
    list_display = ('center_trainer_id', 'member', 'center', 'reg_dt', 'mod_dt', 'use')

