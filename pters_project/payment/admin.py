from django.contrib import admin

# Register your models here.
from .models import PaymentInfoTb, BillingInfoTb, ProductTb, ProductPriceTb, ProductFunctionAuthTb, FunctionAuthTb, \
    BillingCancelInfoTb, IosReceiptCheckTb


@admin.register(ProductTb)
class ProductTbAdmin(admin.ModelAdmin):
    list_display = ('product_id', 'upper_product_id', 'name', 'contents',
                    'promotion_type_cd', 'coupon_cd', 'coupon_amount', 'expiry_date',
                    'order', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['name']


@admin.register(PaymentInfoTb)
class PaymentInfoTbAdmin(admin.ModelAdmin):
    list_display = ('payment_info_id', 'name', 'member', 'product_tb', 'paid_date',
                    'start_date', 'end_date', 'status', 'channel',
                    'payment_type_cd', 'price', 'card_name',
                    'fail_reason', 'pay_method', 'pg_provider', 'receipt_url',
                    'buyer_email', 'buyer_name', 'imp_uid', 'merchant_uid', 'customer_uid', 'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member',
            'product_tb',
        )


@admin.register(BillingInfoTb)
class BillingInfoTbAdmin(admin.ModelAdmin):
    list_display = ('billing_info_id', 'name', 'member', 'product_tb', 'pay_method', 'state_cd',
                    'payment_reg_date', 'next_payment_date', 'payed_date', 'payment_type_cd', 'period_month',
                    'merchant_uid', 'customer_uid', 'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member',
            'product_tb',
        )


@admin.register(BillingCancelInfoTb)
class BillingCancelInfoTbAdmin(admin.ModelAdmin):
    list_display = ('billing_info_id', 'member', 'cancel_type', 'cancel_reason', 'billing_info_tb',
                    'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member',
            'billing_info_tb',
        )


@admin.register(ProductPriceTb)
class ProductPriceTbAdmin(admin.ModelAdmin):
    list_display = ('product_price_id', 'product_tb', 'name', 'price', 'sale_price', 'payment_type_cd', 'period_month',
                    'order', 'reg_dt', 'mod_dt', 'use')
    search_fields = ['name']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'product_tb',
        )


@admin.register(FunctionAuthTb)
class FunctionAuthTbAdmin(admin.ModelAdmin):
    list_display = ('function_auth_id', 'function_auth_type_cd', 'function_auth_type_name', 'order',
                    'reg_dt', 'mod_dt', 'use')


@admin.register(ProductFunctionAuthTb)
class ProductFunctionAuthTbAdmin(admin.ModelAdmin):
    list_display = ('product_function_auth_id', 'product_tb', 'function_auth_tb', 'auth_type_cd', 'counts_type',
                    'counts', 'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'product_tb',
            'function_auth_tb',
        )


@admin.register(IosReceiptCheckTb)
class IosReceiptCheckTbAdmin(admin.ModelAdmin):
    list_display = ('ios_receipt_check_id', 'member', 'payment_tb', 'original_transaction_id', 'transaction_id',
                    'cancellation_date', 'receipt_data', 'iap_status_cd', 'reg_dt', 'mod_dt', 'use')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'member',
            'payment_tb',
        )