from django.contrib import admin

# Register your models here.
from .models import MemberTicketTb


@admin.register(MemberTicketTb)
class MemberTicketTbAdmin(admin.ModelAdmin):
    list_display = ('member_ticket_id', 'member', 'member_ticket_reg_count', 'member_ticket_rem_count',
                    'member_ticket_avail_count', 'day_count', 'start_date', 'end_date',
                    'price', 'refund_price', 'refund_date', 'option_cd', 'state_cd', 'schedule_check',
                    'note', 'reg_dt', 'mod_dt', 'use')


# @admin.register(MemberMemberTicketTb)
# class MemberMemberTicketTbAdmin(admin.ModelAdmin):
#     list_display = ('member_member_ticket_id', 'member', 'member_ticket_tb', 'auth_cd',
#                     'mod_member_id', 'reg_dt', 'mod_dt', 'use')
