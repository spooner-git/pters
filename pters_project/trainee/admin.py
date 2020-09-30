from django.contrib import admin

# Register your models here.
from .models import MemberTicketTb, ProgramNoticeHistoryTb, MemberPaymentHistoryTb, MemberShopTb


@admin.register(MemberTicketTb)
class MemberTicketTbAdmin(admin.ModelAdmin):
    list_display = ('member_ticket_id', 'member', 'ticket_tb', 'state_cd', 'member_auth_cd', 'note',
                    'start_date', 'end_date',
                    'member_ticket_reg_count', 'member_ticket_rem_count', 'member_ticket_avail_count',
                    'price', 'payment_price', 'pay_method',
                    'refund_price', 'refund_date', 'reg_dt', 'mod_dt', 'use')

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


@admin.register(MemberShopTb)
class MemberShopTbAdmin(admin.ModelAdmin):
    list_display = ('member_shop_id', 'class_tb', 'member', 'shop_tb', 'state_cd', 'note',
                    'price', 'payment_price', 'refund_price', 'start_date', 'end_date', 'pay_method',
                    'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member',
            'shop_tb__class_tb__member',
        )


@admin.register(MemberPaymentHistoryTb)
class MemberPaymentHistoryTbAdmin(admin.ModelAdmin):
    list_display = ('member_payment_history_id', 'class_tb', 'member', 'member_ticket_tb', 'member_shop_tb',
                    'payment_price', 'refund_price', 'pay_date', 'pay_method', 'note',
                    'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member',
            'member_shop_tb__shop_tb__class_tb__member',
            'member_ticket_tb__member',
            'member_ticket_tb__ticket_tb__class_tb__member',
        )

