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
from django.views.generic import TemplateView

from . import views

urlpatterns = [
    url(r'^register_error_ajax/$', views.RegisterErrorView.as_view(), name='register_error_ajax'),
    url(r'^$', views.index, name='index'),

    url(r'^login/$', views.login_trainer, name='login'),
    url(r'^logout/$', views.logout_trainer, name='logout'),

    url(r'^service_info/$', views.ServiceInfoView.as_view(), name='service_info'),
    url(r'^service_test_login/$', views.ServiceTestLoginView.as_view(), name='service_test_login'),

    # sns 회원가입 처리
    url(r'^add_old_member_sns_info/$', views.AddOldMemberSnsInfoView.as_view(), name='add_old_member_sns_info'),
    # sns 연결 해제 처리
    url(r'^delete_sns_info/$', views.DeleteSnsInfoView.as_view(), name='delete_sns_info'),

    # sns 회원가입 체크
    url(r'^check_sns_member_info/$', views.CheckSnsMemberInfoView.as_view(), name='check_sns_member_info'),

    url(r'^check_member_email/$', views.CheckMemberEmailView.as_view(), name='check_member_email'),

    url(r'^check_member_form_validation/$', views.CheckMemberValidationView.as_view(),
        name='check_member_form_validation'),
    url(r'^check_member_password_form_validation/$', views.CheckMemberPasswordValidationView.as_view(),
        name='check_member_password_form_validation'),

    url(r'^add_member_info_no_email/$', views.AddMemberNoEmailView.as_view(), name='add_member_info_no_email'),

    url(r'^new_member_resend_email_authentication/$', views.NewMemberResendEmailAuthenticationView.as_view(),
        name='new_member_resend_email_authentication'),
    url(r'^resend_email_authentication/$', views.ResendEmailAuthenticationView.as_view(),
        name='resend_email_authentication'),

    url(r'^change_resend_email_authentication/$', views.ChangeResendEmailAuthenticationView.as_view(),
        name='change_resend_email_authentication'),

    # 미인증 및 강사 회원가입 로그인시
    url(r'^send_email_member/$', views.NewMemberSendEmailView.as_view(), name='send_email_member'),
    # 미인증 회원 로그인시
    url(r'^resend_email_member/$', views.NewMemberReSendEmailView.as_view(), name='resend_email_member'),


    # 회원 탈퇴 기능
    url(r'^out_member/$', views.out_member_logic, name='out_member'),

    url(r'^add_push_token/$', views.AddPushTokenView.as_view(), name='add_push_token'),
    url(r'^delete_push_token/$', views.DeletePushTokenView.as_view(), name='delete_push_token'),
    url(r'^clear_badge_counter/$', views.clear_badge_counter_logic, name='clear_badge_counter'),

    url(r'^activate/complete/$',
        TemplateView.as_view(
            template_name='registration/activation_complete.html'
        ),
        name='registration_activation_complete'),
    # The activation key can make use of any character from the
    # URL-safe base64 alphabet, plus the colon as a separator.
    url(r'^activate/(?P<activation_key>[-:\w]+)/$',
        views.ActivationView.as_view(),
        name='registration_activate'),
    url(r'^password/change/$',
        views.password_change,
        {'post_change_redirect': 'login:auth_password_change_done'},
        name='auth_password_change'),
    url(r'^password/change_social/$',
        views.password_change_social,
        {'post_change_redirect': 'login:auth_password_change_done'},
        name='auth_password_change_social'),

    url(r'^password/change/done/$',
        views.password_change_done,
        name='auth_password_change_done'),

    url(r'^password/reset/$',
        views.password_reset,
        {'post_reset_redirect': 'login:auth_password_reset_done',
         'email_template_name': 'password_reset_email.txt'},
        name='auth_password_reset'),

    url(r'^password/reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/'
        r'(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        views.password_reset_confirm,
        {'post_reset_redirect': 'login:auth_password_reset_complete'},
        name='auth_password_reset_confirm'),

    url(r'^password/reset/complete/$',
        views.password_reset_complete,
        name='auth_password_reset_complete'),

    url(r'^password/reset/done/$',
        views.password_reset_done,
        name='auth_password_reset_done'),



    # refactoring
    url(r'^check_member_username/$', views.CheckMemberUsernameView.as_view(), name='check_member_username'),

    # 회원 가입 유형 처리 부분
    url(r'^registration_check/$', views.RegistrationCheck.as_view(), name='registration_check'),
    # 일반 회원 가입 페이지
    url(r'^register/$', views.RegistrationView.as_view(), name='registration_register'),


    # 일반 회원 가입 처리 로직
    url(r'^add_member_info/$', views.AddMemberView.as_view(), name='add_member_info'),
    # 소셜 회원가입 페이지
    url(r'^new_member_sns_info/$', views.NewMemberSnsInfoView.as_view(), name='new_member_sns_info'),
    # 소셜 회원 가입 처리 로직
    url(r'^add_new_member_sns_info/$', views.AddNewMemberSnsInfoView.as_view(), name='add_new_member_sns_info'),

    # 다시 확인
    url(r'^add_member_info_email/$', views.add_member_info_logic_test, name='add_member_info_email'),


    # 네이버 아이디 로그인 처리
    url(r'^login_simple_naver/$', views.LoginSimpleNaverView.as_view(), name='login_simple_naver'),
    # 카카오 아이디 로그인 처리
    url(r'^login_simple_kakao/$', views.LoginSimpleKakaoView.as_view(), name='login_simple_kakao'),


    # 문자 인증 처리 기능
    url(r'^activate_sms/$', views.activate_sms_logic, name='activate_sms'),
    url(r'^activate_sms_confirm/$', views.ActivateSmsConfirmView.as_view(), name='activate_sms_confirm'),

    # 비밀번호 초기화 문자 인증 처리 기능
    url(r'^reset_password/$', views.ResetPasswordView.as_view(), name='reset_password'),
    url(r'^reset_password_sms/$', views.ResetPasswordSmsView.as_view(), name='reset_password_sms'),
]
