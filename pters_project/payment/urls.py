"""pters URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url

from payment import views

urlpatterns = [
    url(r'^$', views.PaymentView.as_view(), name='index'),

    # 결제 관련 ##########################################################################################################
    # 결제 검사
    url(r'^check_billing/$', views.check_billing_logic, name='check_billing'),
    # 결제시 완료 검사 페이지
    url(r'^billing_finish/$', views.billing_finish_logic, name='billing_finish'),
    # iamport 에서 결과 전송할때 동작하는 페이지
    url(r'^billing_check/$', views.billing_check_logic, name='billing_check'),


    # 정기 결제 변경 ######################################################################################################
    # 정기 결제 취소 페이지
    url(r'^cancel_period_billing/$', views.cancel_period_billing_logic, name='cancel_period_billing'),
    # 정기 결제 재시작 페이지
    url(r'^restart_period_billing/$', views.restart_period_billing_logic, name='restart_period_billing'),



    # 정기 결제 결제 방법 변경 페이지
    url(r'^update_period_billing/$', views.update_period_billing_logic, name='update_period_billing'),


    # 결제 정보 조회 ######################################################################################################
    # 결제 예정인 결제 정보 불러오기
    url(r'^get_payment_schedule_info/$', views.GetPaymentScheduleInfoView.as_view(), name='get_payment_schedule_info'),

    # 현재 이용중인 결제 정보 불러오기 (정기 결제인지 아닌지도 전달)
    url(r'^get_payment_info/$', views.GetPaymentInfoView.as_view(), name='get_payment_info'),

    # 현재 진행중인 정기 결제 정보 불러오기
    url(r'^get_billing_info/$', views.GetBillingInfoView.as_view(), name='get_billing_info'),

    # 결제 정보 리스트 조회
    url(r'^get_payment_list/$', views.GetPaymentListView.as_view(), name='get_payment_list'),


    # 현재 미사용 ########################################################################################################
    url(r'^delete_billing_info/$', views.delete_billing_info_logic, name='delete_billing_info'),
    # 결제 페이지
    url(r'^resend_period_billing/$', views.resend_period_billing_logic, name='resend_period_billing'),
    # 결제 완료 페이지
    url(r'^payment_complete/$', views.PaymentCompleteView.as_view(), name='payment_complete'),

    # 이용권 구매 내역 페이지
    url(r'^payment_history/$', views.PaymentHistoryView.as_view(), name='payment_history'),
    ###################################################################################################################
]
