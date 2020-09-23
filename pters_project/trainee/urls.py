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
from . import views

urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^get_trainee_error_info/$', views.GetTraineeErrorInfoView.as_view(), name='get_trainee_error_info'),

    # 일정 기능 #####################################################################################################
    # 회원 일정 등록 - 1:1/Group
    url(r'^add_trainee_schedule/$', views.add_trainee_schedule_logic, name='add_trainee_schedule'),
    # 회원 일정 취소 - 1:1/Group
    url(r'^delete_trainee_schedule/$', views.delete_trainee_schedule_logic, name='delete_trainee_schedule'),
    # 회원 스케쥴 조회 - 1:1/Group/Off
    url(r'^get_trainee_schedule/$', views.GetTraineeScheduleView.as_view(), name='get_trainee_schedule'),
    # 회원 스케쥴 이력 조회 - 1:1/Group
    url(r'^get_trainee_schedule_history/$', views.GetTraineeScheduleHistoryView.as_view(),
        name='get_trainee_schedule_history'),

    url(r'^check_trainee_schedule/$', views.check_trainee_schedule_logic, name='check_trainee_schedule'),

    # 수강 정보 기능 #####################################################################################################
    # 강좌 정보 list 조회
    url(r'^get_trainee_class_list/$', views.GetTraineeClassListView.as_view(), name='get_trainee_class_list'),
    # 수강정보 선택/연동 기능
    url(r'^program_select/$', views.program_select_logic, name='program_select'),



    # 수강 정보 list 조회 - auth_cd(연결상태) 종류별
    url(r'^get_trainee_member_ticket_list/$', views.GetTraineeMemberTicketListView.as_view(), name='get_trainee_member_ticket_list'),
    # 수강 정보 연결 안된 정보 조회
    url(r'^get_trainee_member_ticket_connection_list/$', views.GetTraineeMemberTicketConnectionListView.as_view(),
        name='get_trainee_member_ticket_connection_list'),
    # 수강 횟수 정보 가져오기
    url(r'^get_trainee_count/$', views.GetTraineeCountView.as_view(), name='get_trainee_count'),

    # Mypage 기능 #####################################################################################################
    # 회원 정보 조회
    url(r'^get_trainee_info/$', views.GetTraineeInfoView.as_view(), name='get_trainee_info'),
    # 회원 정보 수정
    url(r'^update_trainee_info/$', views.update_trainee_info_logic, name='update_trainee_info'),

    # 알람 기능 #####################################################################################################
    url(r'^trainee_alarm/$', views.AlarmView.as_view(), name='trainee_alarm'),
    url(r'^get_alarm_ajax/$', views.AlarmViewAjax.as_view(), name='get_alarm_ajax'),



    # 페이지 #####################################################################################################
    # 회원 design template 페이지
    url(r'^trainee_design_template/$', views.TraineeDesignTemplateView.as_view(), name='trainee_design_template'),

    # 회원 메인 페이지
    url(r'^trainee_main/$', views.TraineeMainView.as_view(), name='trainee_main'),
    # 월간 일정 페이지
    url(r'^trainee_calendar/$', views.TraineeCalendarView.as_view(), name='trainee_calendar'),
    # 공지 사항 페이지
    url(r'^trainee_program_notice/$', views.TraineeProgramNoticeView.as_view(), name='trainee_program_notice'),
    # 피터스 공지 사항 페이지
    url(r'^trainee_system_notice/$', views.TraineeSystemNoticeView.as_view(), name='trainee_system_notice'),
    # 지점 선택 페이지
    url(r'^trainee_program/$', views.ProgramSelectView.as_view(), name='trainee_program'),

    # 이용약관
    url(r'^trainee_user_policy/$', views.UserPolicyView.as_view(), name='trainee_user_policy'),
    # 개인정보 처리방침
    url(r'^trainee_privacy_policy/$', views.PrivacyPolicyView.as_view(), name='trainee_privacy_policy'),

    # About us
    url(r'^trainee_about_us/$', views.AboutusView.as_view(), name='trainee_about_us'),

    # Mypage 페이지
    url(r'^trainee_mypage/$', views.MyPageView.as_view(), name='trainee_mypage'),

    # 설정 페이지
    url(r'^trainee_setting/$', views.TraineeSettingView.as_view(), name='trainee_setting'),
    url(r'^update_trainee_setting_push', views.update_trainee_setting_push_logic, name='update_trainee_setting_push'),


    # 회원 탈퇴 페이지
    # url(r'^delete_trainee_account/$', views.DeleteTraineeAccountView.as_view(), name='delete_trainee_account'),
    # 문의 페이지
    url(r'^trainee_inquiry/$', views.TraineeInquiryView.as_view(), name='trainee_inquiry'),

    # 테스트 페이지 (테스트 완료후 지울것 190316)
    url(r'^test_page/$', views.TestPageView.as_view(), name='test_page'),

    # 팝업 #########################################################################################################
    # 회원 일정 팝업 페이지
    url(r'^popup_calendar_plan_view/$', views.PopupCalendarPlanView.as_view(),
        name='popup_calendar_plan_view'),
    # 회원 일정 팝업 예약 페이지
    url(r'^popup_calendar_plan_reserve/$', views.PopupCalendarPlanReserveView.as_view(),
        name='popup_calendar_plan_reserve'),
    # 회원 일정 팝업 예약 완료 페이지
    url(r'^popup_calendar_plan_reserve_complete/$', views.PopupCalendarPlanReserveCompleteView.as_view(),
        name='popup_calendar_plan_reserve_complete'),

    # 수강권 정보 팝업 페이지
    url(r'^popup_member_ticket_info/$', views.PopupMemberTicketInfoView.as_view(),
        name='popup_member_ticket_info'),

    # 회원 수업 정보 팝업 페이지
    url(r'^popup_lecture_ticket_info/$', views.PopupLectureTicketInfoView.as_view(),
        name='popup_lecture_ticket_info'),
    url(r'^popup_ticket_info/$', views.PopupTicketInfoView.as_view(),
        name='popup_ticket_info'),
    url(r'^popup_member_shop_history/$', views.PopupMemberShopHistoryView.as_view(),
        name='popup_member_shop_history'),

    # 회원 마이 정보 수정 팝업 페이지
    url(r'^popup_my_info_change/$', views.PopupMyInfoChangeView.as_view(),
        name='popup_my_info_change'),
    # 회원 마이 정보 수정 팝업 페이지
    url(r'^popup_my_password_change/$', views.PopupMyPasswordChangeView.as_view(),
        name='popup_my_password_change'),

    # 회원 일지 팝업 페이지
    url(r'^popup_plan_daily_record/$', views.PopupPlanDailyRecordView.as_view(),
        name='popup_plan_daily_record'),

    # 회원 지점 공지 팝업 페이지
    url(r'^popup_program_notice/$', views.PopupProgramNoticeView.as_view(),
        name='popup_program_notice'),

    url(r'^popup_system_notice/$', views.PopupSystemNoticeView.as_view(),
        name='popup_system_notice'),

    url(r'^popup_system_popup_notice/$', views.PopupSystemPopupNoticeView.as_view(),
        name='popup_system_popup_notice'),

    # 회원 문의 내역 팝업 페이지
    url(r'^popup_inquiry/$', views.PopupInquiryView.as_view(), name='popup_inquiry'),
    url(r'^popup_inquiry_history/$', views.PopupInquiryHistoryView.as_view(), name='popup_inquiry_history'),
    url(r'^popup_inquiry_history_info/$', views.PopupInquiryHistoryInfoView.as_view(), name='popup_inquiry_history_info'),

    # 삭제된 페이지
    # 회원 빈 월간 일정 페이지
    url(r'^cal_month_blank/$', views.CalMonthBlankView.as_view(), name='cal_month_blank'),
    # 회원 빈 Mypage 페이지
    url(r'^mypage_trainee_blank/$', views.MyPageBlankView.as_view(), name='mypage_trainee_blank'),
    # 월간 일정 페이지
    url(r'^cal_month/$', views.CalMonthView.as_view(), name='cal_month'),
    # Mypage 페이지
    # url(r'^mypage_trainee/$', views.MyPageView.as_view(), name='mypage_trainee'),
]
