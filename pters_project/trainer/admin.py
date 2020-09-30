from django.contrib import admin

# Register your models here.
from .models import ClassTb, MemberClassTb, ClassMemberTicketTb, LectureTb, SettingTb, TicketTb, TicketLectureTb, \
    LectureMemberTb, ProgramAuthTb, ProgramNoticeTb, ShopTb


@admin.register(ClassTb)
class ClassTbAdmin(admin.ModelAdmin):
    list_display = ('class_id', 'member', 'subject_cd', 'subject_detail_nm', 'start_date', 'state_cd',
                    'mod_dt', 'reg_dt', 'use')
    search_fields = ['subject_cd', 'subject_detail_nm']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member',
        )


@admin.register(MemberClassTb)
class MemberClassTbAdmin(admin.ModelAdmin):
    list_display = ('member_class_id', 'member', 'class_tb', 'auth_cd', 'own_cd',
                    'mod_member_id', 'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member',
            'class_tb__member',
        )


@admin.register(ClassMemberTicketTb)
class ClassMemberTicketTbAdmin(admin.ModelAdmin):
    list_display = ('class_member_ticket_id', 'class_tb', 'member_ticket_tb', 'auth_cd',
                    'mod_member_id', 'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member',
            'member_ticket_tb__member',
        )


@admin.register(ProgramAuthTb)
class ProgramAuthTb(admin.ModelAdmin):
    list_display = ('product_function_auth_id', 'class_tb', 'member', 'function_auth_tb', 'auth_type_cd', 'enable_flag',
                    'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member',
            'member',
            'function_auth_tb',
        )


@admin.register(ProgramNoticeTb)
class ProgramNoticeTb(admin.ModelAdmin):
    list_display = ('program_notice_id', 'class_tb', 'member', 'notice_type_cd', 'title', 'contents',
                    'to_member_type_cd', 'hits', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['class_tb']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member',
            'member',
        )


@admin.register(LectureTb)
class LectureTbAdmin(admin.ModelAdmin):
    list_display = ('lecture_id', 'class_tb', 'name', 'note', 'member_num', 'state_cd',
                    'ing_color_cd', 'end_color_cd', 'ing_font_color_cd', 'end_font_color_cd',
                    'lecture_type_cd', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['name', 'lecture_type_cd']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member',
        )


@admin.register(TicketTb)
class TicketTbAdmin(admin.ModelAdmin):
    list_display = ('ticket_id', 'class_tb', 'name', 'note', 'price', 'reg_count', 'effective_days',
                    'week_schedule_enable', 'day_schedule_enable', 'state_cd',
                    'reg_dt', 'mod_dt', 'use')
    search_fields = ['name']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member',
        )


@admin.register(TicketLectureTb)
class TicketLectureTbAdmin(admin.ModelAdmin):
    list_display = ('ticket_lecture_id', 'class_tb', 'ticket_tb', 'lecture_tb', 'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member',
            'ticket_tb__class_tb__member',
            'lecture_tb__class_tb__member',
        )


@admin.register(LectureMemberTb)
class LectureMemberTbAdmin(admin.ModelAdmin):
    list_display = ('lecture_member_id', 'class_tb', 'lecture_tb', 'member', 'fix_state_cd', 'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member',
            'lecture_tb__class_tb__member',
            'member',
        )


@admin.register(SettingTb)
class SettingTbAdmin(admin.ModelAdmin):
    list_display = ('setting_id', 'member', 'class_tb', 'member_ticket_tb', 'setting_type_cd', 'setting_info',
                    'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member',
            'class_tb__member',
            'member_ticket_tb__member',
        )


@admin.register(ShopTb)
class ShopTbAdmin(admin.ModelAdmin):
    list_display = ('shop_id', 'class_tb', 'name', 'price', 'note', 'state_cd', 'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member',
        )
