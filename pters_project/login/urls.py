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
from login import views

urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^login/$', views.login_trainer, name='login'),
    url(r'^logout/$', views.logout_trainer, name='logout'),
    url(r'^register_trainer/$', views.RegisterTrainerView.as_view(), name='register_trainer'),
    url(r'^register_general/$', views.RegisterGeneralView.as_view(), name='register_general'),
    url(r'^register_business/$', views.RegisterBusinessView.as_view(), name='register_business'),
    url(r'^register_type/$', views.RegisterTypeSelectView.as_view(), name='register_type'),
    url(r'^add_member_info_email/$', views.add_member_info_logic_test, name='add_member_info_email'),
    url(r'^check_member_id/$', views.CheckMemberIdView.as_view(), name='check_member_id'),

    url(r'^add_member_info/$', views.AddMemberView.as_view(), name='add_member_info'),
    url(r'^add_member_info_no_email/$', views.AddMemberNoEmailView.as_view(), name='add_member_info_no_email'),


    url(r'^resend_email_authentication/$', views.ResendEmailAuthenticationView,
        name='resend_email_authentication'),
    url(r'^register_error_ajax/$', views.RegisterErrorView.as_view(), name='register_error_ajax'),

    url(r'^send_email_member/$', views.NewMemberSendEmailView.as_view(), name='send_email_member'),
    url(r'^resend_email_member/$', views.NewMemberReSendEmailView.as_view(), name='resend_email_member'),

]
