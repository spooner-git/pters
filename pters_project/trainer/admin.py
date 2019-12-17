from django.contrib import admin

# Register your models here.
from .models import ClassTb, MemberClassTb, ClassMemberTicketTb, LectureTb, LectureMemberTicketTb, SettingTb,\
    TicketTb, TicketLectureTb, LectureMemberTb, ProgramAuthTb


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
    search_fields = ['class_tb__member__name', 'member__name']


@admin.register(ClassMemberTicketTb)
class ClassMemberTicketTbAdmin(admin.ModelAdmin):
    list_display = ('class_member_ticket_id', 'class_tb', 'member_ticket_tb', 'auth_cd',
                    'mod_member_id', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb__member__name', 'member_ticket_tb__member__name']


@admin.register(LectureTb)
class LectureTbAdmin(admin.ModelAdmin):
    list_display = ('lecture_id', 'class_tb', 'name', 'member_num', 'state_cd',
                    'ing_color_cd', 'end_color_cd', 'ing_font_color_cd', 'end_font_color_cd',
                    'lecture_type_cd', 'note', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb__member__name', 'name', 'lecture_type_cd']


@admin.register(TicketTb)
class TicketTbAdmin(admin.ModelAdmin):
    list_display = ('ticket_id', 'class_tb', 'name', 'ticket_type_cd', 'effective_days', 'price',
                    'week_schedule_enable', 'day_schedule_enable', 'reg_count', 'state_cd', 'note',
                    'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb__member__name', 'name']


# 이제 사용 안함
@admin.register(LectureMemberTicketTb)
class LectureMemberTicketTbAdmin(admin.ModelAdmin):
    list_display = ('lecture_member_ticket_id', 'lecture_tb', 'member_ticket_tb', 'fix_state_cd',
                    'reg_dt', 'mod_dt', 'use')


@admin.register(LectureMemberTb)
class LectureMemberTbAdmin(admin.ModelAdmin):
    list_display = ('lecture_member_id', 'class_tb', 'lecture_tb', 'member', 'fix_state_cd', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb__member__name', 'lecture_tb', 'member__name']


@admin.register(TicketLectureTb)
class TicketLectureTbAdmin(admin.ModelAdmin):
    list_display = ('ticket_lecture_id', 'class_tb', 'ticket_tb', 'lecture_tb', 'reg_dt', 'mod_dt', 'use')


@admin.register(SettingTb)
class SettingTbAdmin(admin.ModelAdmin):
    list_display = ('setting_id', 'member', 'class_tb', 'member_ticket_tb', 'setting_type_cd', 'setting_info',
                    'reg_dt', 'mod_dt', 'use')
    search_fields = ['member__name', 'class_tb']


@admin.register(ProgramAuthTb)
class SettingTbAdmin(admin.ModelAdmin):
    list_display = ('product_function_auth_id', 'class_tb', 'member', 'function_auth_tb', 'auth_type_cd', 'enable_flag',
                    'reg_dt', 'mod_dt', 'use')
    search_fields = ['member__name', 'class_tb']
