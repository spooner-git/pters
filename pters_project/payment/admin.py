from django.contrib import admin

# Register your models here.
from .models import PaymentInfoTb, BillingInfoTb, ProductTb, ProductPriceTb, ProductFunctionAuthTb, FunctionAuthTb, \
    BillingCancelInfoTb


@admin.register(PaymentInfoTb)
class PaymentInfoTbAdmin(admin.ModelAdmin):
    list_display = ('payment_info_id', 'name', 'member', 'product_tb', 'merchant_uid', 'customer_uid',
                    'start_date', 'end_date', 'paid_date', 'payment_type_cd', 'price', 'imp_uid', 'channel', 'card_name',
                    'buyer_email', 'status', 'fail_reason', 'currency', 'pay_method', 'pg_provider', 'receipt_url',
                    'buyer_name', 'reg_dt', 'mod_dt', 'use')


@admin.register(BillingInfoTb)
class BillingInfoTbAdmin(admin.ModelAdmin):
    list_display = ('billing_info_id', 'member', 'pay_method', 'product_tb',
                    'payment_type_cd', 'merchant_uid', 'customer_uid', 'payment_reg_date',
                    'next_payment_date', 'payed_date', 'reg_dt', 'mod_dt', 'use')


@admin.register(ProductTb)
class ProductTbAdmin(admin.ModelAdmin):
    list_display = ('product_id', 'upper_product_id', 'name', 'contents',
                    'reg_dt', 'mod_dt', 'order', 'use')


@admin.register(ProductPriceTb)
class ProductPriceTbAdmin(admin.ModelAdmin):
    list_display = ('product_price_id', 'product_tb', 'name', 'price', 'sale_price',
                    'payment_type_cd', 'order', 'reg_dt', 'mod_dt', 'use')


@admin.register(FunctionAuthTb)
class FunctionAuthTbAdmin(admin.ModelAdmin):
    list_display = ('function_auth_id', 'function_auth_type_cd', 'function_auth_type_name',
                    'reg_dt', 'mod_dt', 'use')


@admin.register(ProductFunctionAuthTb)
class ProductFunctionAuthTbAdmin(admin.ModelAdmin):
    list_display = ('product_function_auth_id', 'product_tb', 'function_auth_tb', 'auth_type_cd', 'counts_type',
                    'counts', 'reg_dt', 'mod_dt', 'use')


@admin.register(BillingCancelInfoTb)
class BillingCancelInfoTbAdmin(admin.ModelAdmin):
    list_display = ('billing_info_id', 'member', 'billing_info_tb', 'cancel_type', 'cancel_reason',
                    'reg_dt', 'mod_dt', 'use')
