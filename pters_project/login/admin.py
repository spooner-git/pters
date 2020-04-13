from django.contrib import admin

from .models import CommonCdTb, PushInfoTb, LogTb, MemberTb, SnsInfoTb, MemberOutInfoTb


# Register your models here.
@admin.register(MemberTb)
class MemberTbAdmin(admin.ModelAdmin):
    list_display = ('member_id', 'get_user_group', 'name', 'phone_is_active', 'reg_info',
                    'phone', 'sex', 'birthday_dt', 'contents', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['name']

    def get_user_group(self, obj):
        group_name = ''
        if obj.user is not None:
            group_data = obj.user.groups.filter(user=obj.user)
            for group_info in group_data:
                group_info_name = '강사'
                if group_info.name == 'trainee':
                    group_info_name = '회원'
                elif group_info.name == 'admin':
                    group_info_name = '관리자'
                if group_name == '':
                    group_name = group_info_name
                else:
                    group_name += '/' + group_info_name

        return group_name
    get_user_group.short_description = '회원 분류'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'user',
        )


@admin.register(MemberOutInfoTb)
class MemberOutInfoTbAdmin(admin.ModelAdmin):
    list_display = ('member_out_info_id', 'get_user_group', 'member', 'out_type', 'out_reason',
                    'reg_dt', 'mod_dt', 'use')

    def get_user_group(self, obj):
        group_name = ''
        if obj.member.user is not None:
            group_data = obj.member.user.groups.filter(user=obj.member.user)
            for group_info in group_data:
                group_info_name = '강사'
                if group_info.name == 'trainee':
                    group_info_name = '회원'
                elif group_info.name == 'admin':
                    group_info_name = '관리자'
                if group_name == '':
                    group_name = group_info_name
                else:
                    group_name += '/' + group_info_name

        return group_name
    get_user_group.short_description = '회원 분류'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member__user',
        )


@admin.register(LogTb)
class LogTbAdmin(admin.ModelAdmin):
    list_display = ('log_id', 'auth_member_id', 'from_member_name', 'to_member_name', 'class_tb',
                    'member_ticket_tb', 'log_info', 'log_how', 'log_detail', 'reg_dt', 'read', 'member_read', 'use')
    search_fields = ['class_tb_id']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'class_tb__member', 'member_ticket_tb__ticket_tb__class_tb__member'
        )


@admin.register(PushInfoTb)
class PushInfoTbAdmin(admin.ModelAdmin):
    list_display = ('push_info_id', 'member', 'device_info', 'device_id', 'token', 'badge_counter',
                    'last_login', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['device_id', 'device_info']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member',
        )


@admin.register(SnsInfoTb)
class SnsInfoTbAdmin(admin.ModelAdmin):
    list_display = ('sns_info_id', 'member', 'sns_id', 'sns_type', 'sns_name',
                    'sns_connect_date', 'change_password_check', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['sns_type', 'sns_name']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member',
        )


@admin.register(CommonCdTb)
class CommonCdTbAdmin(admin.ModelAdmin):
    list_display = ('common_cd_id', 'common_cd', 'common_cd_nm', 'group_cd', 'group_cd_nm',
                    'upper_common_cd', 'upper_group_cd', 'attribute1', 'order', 'use')
    search_fields = ['common_cd_nm', 'upper_common_cd']

