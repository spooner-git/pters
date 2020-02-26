from django.contrib import admin

# Register your models here.
from .models import MemberTicketTb, ProgramNoticeHistoryTb


@admin.register(MemberTicketTb)
class MemberTicketTbAdmin(admin.ModelAdmin):
    list_display = ('member_ticket_id', 'member', 'ticket_tb', 'state_cd', 'member_auth_cd', 'note',
                    'start_date', 'end_date',
                    'member_ticket_reg_count', 'member_ticket_rem_count', 'member_ticket_avail_count',
                    'price', 'refund_price', 'refund_date', 'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member',
            'ticket_tb__class_tb__member',
        )


@admin.register(ProgramNoticeHistoryTb)
class ProgramNoticeHistoryTbAdmin(admin.ModelAdmin):
    list_display = ('program_notice_history_id', 'program_notice_tb', 'member', 'class_tb', 'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'program_notice_tb__class_tb__member',
            'member',
            'class_tb__member',
        )
