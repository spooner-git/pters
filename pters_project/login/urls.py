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

    # sns 연결 해제 처리
    url(r'^delete_sns_info/$', views.DeleteSnsInfoView.as_view(), name='delete_sns_info'),

    # 회원 탈퇴 기능
    url(r'^out_member/$', views.out_member_logic, name='out_member'),


    # push 관련
    url(r'^add_push_token/$', views.AddPushTokenView.as_view(), name='add_push_token'),
    url(r'^delete_push_token/$', views.DeletePushTokenView.as_view(), name='delete_push_token'),
    url(r'^clear_badge_counter/$', views.clear_badge_counter_logic, name='clear_badge_counter'),


    # 회원가입 유형 처리 부분
    url(r'^registration_check/$', views.RegistrationCheck.as_view(), name='registration_check'),

    # 일반 회원가입 페이지
    url(r'^register/$', views.RegistrationView.as_view(), name='registration_register'),
    # 일반 회원가입 처리 로직
    url(r'^add_member_info/$', views.AddMemberView.as_view(), name='add_member_info'),

    # 소셜 회원가입 페이지
    url(r'^registration_social/$', views.RegistrationSocialView.as_view(), name='registration_social'),
    # 소셜 회원가입 처리 로직
    url(r'^add_social_member_info/$', views.AddSocialMemberInfoView.as_view(), name='add_social_member_info'),
    # 기존 회원 소셜 연동 처리 로직
    url(r'^add_old_social_member_info/$', views.AddOldSocialMemberInfoView.as_view(), name='add_old_social_member_info'),

    # 소셜 회원가입 검사 로직
    url(r'^check_social_member_info/$', views.CheckSocialMemberInfoView.as_view(), name='check_social_member_info'),
    # 네이버 아이디 로그인 처리
    url(r'^login_simple_naver/$', views.LoginSimpleNaverView.as_view(), name='login_simple_naver'),
    # 카카오 아이디 로그인 처리
    url(r'^login_simple_kakao/$', views.LoginSimpleKakaoView.as_view(), name='login_simple_kakao'),


    # 강사가 등록한 회원 회원가입 페이지
    url(r'^registration_temp/$', views.RegistrationTempView.as_view(), name='registration_temp'),

    # 강사가 등록한 회원 회원가입 처리 로직
    url(r'^add_temp_member_info/$', views.AddTempMemberInfoView.as_view(),
        name='add_temp_member_info'),

    # 미인증 회원 인증 페이지
    url(r'^authenticated_member/$', views.AuthenticatedMemberView.as_view(), name='authenticated_member'),
    # 미인증 회원 인증 로직
    url(r'^authenticated_member_logic/$', views.authenticated_member_logic, name='authenticated_member_logic'),


    # 회원가입 id 체크 기능
    url(r'^check_member_username/$', views.CheckMemberUsernameView.as_view(), name='check_member_username'),

    # 문자 인증 처리 기능
    url(r'^activate_sms/$', views.activate_sms_logic, name='activate_sms'),
    url(r'^activate_sms_confirm/$', views.ActivateSmsConfirmView.as_view(), name='activate_sms_confirm'),


    # 강사가 등록하는 회원용
    url(r'^add_member_info_no_email/$', views.AddMemberNoEmailView.as_view(), name='add_member_info_no_email'),



    # 비밀번호 초기화 문자 인증 처리 기능
    url(r'^reset_password/$', views.ResetPasswordView.as_view(), name='reset_password'),
    url(r'^reset_password2/$', views.ResetPassword2View.as_view(), name='reset_password2'),
    url(r'^reset_password3/$', views.reset_password3, name='reset_password3'),
    url(r'^reset_password_logic/$', views.reset_password_logic, name='reset_password_logic'),
    url(r'^reset_activate/$', views.ResetActivateView.as_view(), name='reset_activate'),
    url(r'^reset_activate_confirm/$', views.ResetActivateConfirmView.as_view(), name='reset_activate_confirm'),

    url(r'^password/change/$',
        views.password_change,
        {'post_change_redirect': 'login:auth_password_change_done'},
        name='auth_password_change'),
    url(r'^password/change_social/$',
        views.password_change_social,
        {'post_change_redirect': 'login:auth_password_change_done'},
        name='auth_password_change_social'),

    url(r'^password/change/done/$', views.password_change_done, name='auth_password_change_done'),

]
