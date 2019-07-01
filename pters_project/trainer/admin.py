from django.contrib import admin

# Register your models here.
from .models import ClassTb, MemberClassTb, ClassLectureTb, GroupTb, GroupLectureTb, SettingTb, BackgroundImgTb, \
    PackageTb, PackageGroupTb


@admin.register(ClassTb)
class ClassTbAdmin(admin.ModelAdmin):
    list_display = ('class_id', 'member', 'center_tb', 'subject_cd', 'subject_detail_nm',
                    'start_date', 'end_date',
                    'class_hour', 'start_hour_unit', 'class_member_num', 'state_cd',
                    'schedule_check',
                    'reg_dt', 'mod_dt', 'use')
    search_fields = ['member__name', 'subject_cd', 'subject_detail_nm']


@admin.register(MemberClassTb)
class MemberClassTbAdmin(admin.ModelAdmin):
    list_display = ('member_class_id', 'member', 'class_tb', 'auth_cd',
                    'mod_member_id', 'reg_dt', 'mod_dt', 'use')


@admin.register(ClassLectureTb)
class ClassLectureTbAdmin(admin.ModelAdmin):
    list_display = ('class_lecture_id', 'class_tb', 'lecture_tb', 'auth_cd',
                    'mod_member_id', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb__member__name', 'lecture_tb__member__name']


@admin.register(GroupTb)
class GroupTbAdmin(admin.ModelAdmin):
    list_display = ('group_id', 'class_tb', 'name', 'group_type_cd', 'member_num', 'state_cd',
                    'ing_color_cd', 'end_color_cd', 'ing_font_color_cd', 'end_font_color_cd',
                    'note', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb__member__name']


@admin.register(GroupLectureTb)
class GroupLectureTbAdmin(admin.ModelAdmin):
    list_display = ('group_lecture_id', 'group_tb', 'lecture_tb', 'reg_dt', 'mod_dt', 'use')


@admin.register(SettingTb)
class SettingTbAdmin(admin.ModelAdmin):
    list_display = ('setting_id', 'member', 'class_tb', 'lecture_tb', 'setting_type_cd', 'setting_info',
                    'reg_dt', 'mod_dt', 'use')
    search_fields = ['member__name', 'class_tb']


@admin.register(BackgroundImgTb)
class BackgroundImgTbAdmin(admin.ModelAdmin):
    list_display = ('background_img_id', 'class_tb', 'background_img_type_cd', 'url', 'reg_info',
                    'reg_dt', 'mod_dt', 'use')


@admin.register(PackageTb)
class PackageTbAdmin(admin.ModelAdmin):
    list_display = ('package_id', 'class_tb', 'name', 'state_cd', 'note', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb__member__name', 'name']


@admin.register(PackageGroupTb)
class PackageGroupTbAdmin(admin.ModelAdmin):
    list_display = ('package_group_id', 'class_tb', 'package_tb', 'group_tb', 'reg_dt', 'mod_dt', 'use')

