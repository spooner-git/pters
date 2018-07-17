from django.contrib import admin

# Register your models here.
from payment.models import PaymentInfoTb, BillingInfoTb


@admin.register(PaymentInfoTb)
class PaymentInfoTbAdmin(admin.ModelAdmin):
    list_display = ('payment_info_id', 'member', 'merchandise_type_cd', 'merchant_uid', 'customer_uid',
                    'start_date', 'end_date', 'payment_type_cd',
                    'reg_dt', 'mod_dt', 'use')


@admin.register(BillingInfoTb)
class BillingInfoTbAdmin(admin.ModelAdmin):
    list_display = ('billing_info_id', 'member', 'payment_type_cd', 'customer_uid', 'payment_reg_date',
                    'next_payment_date', 'reg_dt', 'mod_dt', 'use')
