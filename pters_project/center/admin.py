from django.contrib import admin

# Register your models here.
from center.models import CenterTb


@admin.register(CenterTb)
class CenterTbAdmin(admin.ModelAdmin):
    list_display = ('center_id', 'member_id', 'center_name', 'address', 'center_type_cd',
                    'center_img_url', 'reg_dt', 'mod_dt', 'use')
