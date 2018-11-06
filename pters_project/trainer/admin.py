from django.contrib import admin

# Register your models here.
from .models import ClassTb, MemberClassTb, ClassLectureTb, GroupTb, GroupLectureTb, SettingTb, BackgroundImgTb, \
    PackageTb, PackageLectureTb, PackageGroupTb


@admin.register(ClassTb)
class ClassTbAdmin(admin.ModelAdmin):
    list_display = ('class_id', 'member', 'center_tb', 'subject_cd', 'subject_detail_nm',
                    'start_date', 'end_date',
                    'class_hour', 'start_hour_unit', 'class_member_num', 'state_cd',
                    'schedule_check',
                    'reg_dt', 'mod_dt', 'use')


@admin.register(MemberClassTb)
class MemberClassTbAdmin(admin.ModelAdmin):
    list_display = ('member_class_id', 'member', 'class_tb', 'auth_cd',
                    'mod_member_id', 'reg_dt', 'mod_dt', 'use')


@admin.register(ClassLectureTb)
class ClassLectureTbAdmin(admin.ModelAdmin):
    list_display = ('class_lecture_id', 'class_tb', 'lecture_tb', 'auth_cd',
                    'mod_member_id', 'reg_dt', 'mod_dt', 'use')


@admin.register(GroupTb)
class GroupTbAdmin(admin.ModelAdmin):
    list_display = ('group_id', 'class_tb', 'group_type_cd', 'member_num',
                    'ing_group_member_num', 'end_group_member_num', 'name',
                    'note', 'state_cd', 'reg_dt', 'mod_dt', 'use')


@admin.register(GroupLectureTb)
class GroupLectureTbAdmin(admin.ModelAdmin):
    list_display = ('group_lecture_id', 'group_tb', 'lecture_tb', 'reg_dt', 'mod_dt', 'use')


@admin.register(SettingTb)
class SettingTbAdmin(admin.ModelAdmin):
    list_display = ('setting_id', 'member', 'class_tb', 'lecture_tb', 'setting_type_cd', 'setting_info',
                    'reg_dt', 'mod_dt', 'use')


@admin.register(BackgroundImgTb)
class BackgroundImgTbAdmin(admin.ModelAdmin):
    list_display = ('background_img_id', 'class_tb', 'background_img_type_cd', 'url', 'reg_info',
                    'reg_dt', 'mod_dt', 'use')


@admin.register(PackageTb)
class PackageTbAdmin(admin.ModelAdmin):
    list_display = ('package_id', 'class_tb', 'name', 'package_type_cd',
                    'ing_package_member_num', 'end_package_member_num',
                    'package_group_num', 'state_cd', 'note', 'reg_dt', 'mod_dt', 'use')


@admin.register(PackageLectureTb)
class PackageLectureTbAdmin(admin.ModelAdmin):
    list_display = ('package_lecture_id', 'package_tb', 'lecture_tb', 'reg_dt', 'mod_dt', 'use')


@admin.register(PackageGroupTb)
class PackageGroupTbAdmin(admin.ModelAdmin):
    list_display = ('package_group_id', 'class_tb', 'package_tb', 'group_tb', 'reg_dt', 'mod_dt', 'use')

