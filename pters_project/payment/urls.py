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

    # 페이지 #####################################################################################################
    # 결제 페이지
    # url(r'^payment/$', views.PaymentView.as_view(), name='payment'),
    # 결제 페이지
    url(r'^add_billing/$', views.add_billing_logic, name='add_billing'),
    url(r'^delete_billing/$', views.delete_billing_logic, name='delete_billing'),
    # 결제 페이지
    url(r'^billing_check/$', views.billing_check_logic, name='billing_check'),
    # 결제 페이지
    # url(r'^payment_schedule/$', views.payment_schedule_logic, name='payment_schedule'),
    # 결제 페이지
    url(r'^payment_complete/$', views.PaymentCompleteView.as_view(), name='payment_complete'),
    ######################################################################################################
]
