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
    url(r'^get_error_info/$', views.GetErrorInfoView.as_view(), name='get_error_info'),

    # 일정 기능 #####################################################################################################
    # 강사 스케쥴 조회 - 1:1/Group/Off
    url(r'^get_trainer_schedule/$', views.GetTrainerScheduleView.as_view(), name='get_trainer_schedule'),
    # 강사 스케쥴 조회 - Off
    url(r'^get_off_repeat_schedule/$', views.GetOffRepeatScheduleView.as_view(), name='get_off_repeat_schedule'),
    # 강사 스케쥴 조회 - Group
    url(r'^get_trainer_group_schedule/$', views.GetTrainerGroupScheduleView.as_view(),
        name='get_trainer_group_schedule'),
    # 회원 스케쥴 조회 - 1:1/Group
    url(r'^get_member_schedule/$', views.GetMemberScheduleView.as_view(), name='get_member_schedule'),
    # 회원 반복 일정 조회 - 1:1/Group
    url(r'^get_member_repeat_schedule/$', views.GetMemberRepeatScheduleView.as_view(),
        name='get_member_repeat_schedule'),
    # 그룹일정에 속하는 그룹회원 일정 조회
    url(r'^get_group_member_schedule_list/$', views.GetGroupMemberScheduleListViewAjax.as_view(),
        name='get_group_member_schedule_list'),
    # 그룹 반복 일정 조회
    url(r'^get_group_repeat_schedule_list/$', views.GetGroupRepeatScheduleListViewAjax.as_view(),
        name='get_group_repeat_schedule_list'),
    # 그룹 반복일정과 같이 등록된 회원들의 반복일정
    url(r'^get_group_member_repeat_schedule_list/$', views.GetGroupMemberRepeatScheduleListViewAjax.as_view(),
        name='get_group_member_repeat_schedule_list'),

    # 회원 기능 #####################################################################################################
    # 회원 정보 조회
    url(r'^get_member_info/$', views.GetMemberInfoView.as_view(), name='get_member_info'),
    # 전체 회원 목록 조회
    url(r'^get_member_list/$', views.GetMemberListView.as_view(), name='get_member_list'),
    # 진행중 회원 목록 조회
    url(r'^get_member_ing_list/$', views.GetMemberIngListViewAjax.as_view(), name='get_member_ing_list'),
    # 진행 완료 회원 목록 조회
    url(r'^get_member_end_list/$', views.GetMemberEndListViewAjax.as_view(), name='get_member_end_list'),
    # 회원 정보 수정
    url(r'^update_member_info/$', views.update_member_info_logic, name='update_member_info'),
    # 회원 정보 삭제
    url(r'^delete_member_info/$', views.delete_member_info_logic, name='delete_member_info'),
    # 회원 리스트 엑셀 export 기능
    url(r'^export_excel_member_list/$', views.export_excel_member_list_logic, name='export_excel_member_list'),
    # 회원 정보 엑셀 export 기능
    url(r'^export_excel_member_info/$', views.export_excel_member_info_logic, name='export_excel_member_info'),

    # 수강 정보 기능 #####################################################################################################
    # 수강정보 조회
    url(r'^get_lecture_list/$', views.GetLectureListView.as_view(), name='get_lecture_list'),
    # 수강정보 추가
    url(r'^add_lecture_info/$', views.add_lecture_info_logic, name='add_lecture_info'),
    # 수강정보 수정
    url(r'^update_lecture_info/$', views.update_lecture_info_logic, name='update_lecture_info'),
    # 수강정보 삭제
    url(r'^delete_lecture_info/$', views.delete_lecture_info_logic, name='delete_lecture_info'),
    # 수강정보 종료 상태 변경
    url(r'^finish_lecture_info/$', views.finish_lecture_info_logic, name='finish_lecture_info'),
    # 수강정보 환불 상태 변경
    url(r'^refund_lecture_info/$', views.refund_lecture_info_logic, name='refund_lecture_info'),
    # 수강정보 진행중 상태 변경
    url(r'^progress_lecture_info/$', views.progress_lecture_info_logic, name='progress_lecture_info'),
    # 수강정보 연동 상태 변경
    url(r'^update_lecture_connection_info/$', views.update_lecture_connection_info_logic,
        name='update_lecture_connection_info'),

    # 그룹 기능 ##########################################################################################################
    # 그룹 추가
    url(r'^add_group_info/$', views.add_group_info_logic, name='add_group_info'),
    # 그룹 삭제 - 내부 회원 삭제 x
    url(r'^delete_group_info/$', views.delete_group_info_logic, name='delete_group_info'),
    # 그룹 수정 - 내부 회원 수정 x
    url(r'^update_group_info/$', views.update_group_info_logic, name='update_group_info'),
    # 그룹 회원 추가
    url(r'^add_group_member/$', views.add_group_member_logic, name='add_group_member'),
    # 그룹 회원 삭제
    url(r'^delete_group_member_info/$', views.delete_group_member_info_logic, name='delete_group_member_info'),
    # 진행중 그룹 list 조회
    url(r'^get_group_ing_list/$', views.GetGroupIngListViewAjax.as_view(), name='get_group_ing_list'),
    # 완료된 그룹 list 조회
    url(r'^get_group_end_list/$', views.GetGroupEndListViewAjax.as_view(), name='get_group_end_list'),
    # 그룹 회원 조회
    url(r'^get_group_member/$', views.GetGroupMemberViewAjax.as_view(), name='get_group_member'),
    # 그룹 종료 상태 변경
    url(r'^finish_group_info/$', views.finish_group_info_logic, name='finish_group_info'),
    # 그룹 재개 상태 변경
    url(r'^progress_group_info/$', views.progress_group_info_logic, name='progress_group_info'),


    # 강좌 기능 ##########################################################################################################
    # 강좌 정보 조회
    url(r'^get_class_list/$', views.GetClassListViewAjax.as_view(), name='get_class_list'),
    # 강좌 추가
    url(r'^add_class_info/$', views.AddClassInfoView.as_view(), name='add_class_info'),
    # 강좌 삭제
    url(r'^delete_class_info/$', views.DeleteClassInfoView.as_view(), name='delete_class_info'),
    # 강좌 정보 수정
    url(r'^update_class_info/$', views.UpdateClassInfoView.as_view(), name='update_class_info'),
    # 강좌 정보 선택 처리
    url(r'^select_class_processing/$', views.select_class_processing_logic, name='select_class_processing'),
    # 강좌 정보 수정
    url(r'^update_class_info/$', views.UpdateClassInfoView.as_view(), name='update_class_info'),


    # 배경 이미지 설정 기능 #################################################################################################
    # 배경 이미지 타입 코드 조회
    url(r'^get_background_img_type_list/$', views.GetBackgroundImgTypeListViewAjax.as_view(),
        name='get_background_img_type_list'),
    # 배경 이미지 정보 조회
    url(r'^get_background_img_list/$', views.GetBackgroundImgListViewAjax.as_view(), name='get_background_img_list'),
    # 배경 이미지 정보 추가/수정
    url(r'^update_background_img_info/$', views.UpdateBackgroundImgInfoViewAjax.as_view(),
        name='update_background_img_info'),
    # 배경 이미지 정보 삭제
    url(r'^delete_background_img_info/$', views.DeleteBackgroundImgInfoViewAjax.as_view(),
        name='delete_background_img_info'),


    # Mypage/Setting 기능 ###############################################################################################
    # 강사 정보 조회
    url(r'^get_trainer_info/$', views.GetTrainerInfoView.as_view(), name='get_trainer_info'),
    # 강사 정보 수정
    url(r'^update_trainer_info/$', views.update_trainer_info_logic, name='update_trainer_info'),
    # 푸시 Setting 수정
    url(r'^update_setting_push/$', views.update_setting_push_logic, name='update_setting_push'),
    # 일반 설정 관련 Setting 수정
    url(r'^update_setting_basic/$', views.update_setting_basic_logic, name='update_setting_basic'),
    # 예약관련 Setting 수정
    url(r'^update_setting_reserve/$', views.update_setting_reserve_logic, name='update_setting_reserve'),
    # 금액 Setting 정보 수정
    url(r'^update_setting_sales/$', views.update_setting_sales_logic, name='update_setting_sales'),
    # 언어 Setting 정보 수정
    url(r'^update_setting_language/$', views.update_setting_language_logic, name='update_setting_language'),


    # 알람 기능 ##########################################################################################################
    # 알람 삭제
    url(r'^alarm_delete/$', views.alarm_delete_logic, name='alarm_delete'),


    # 공지 기능 ##########################################################################################################
    # 공지사항 조회
    url(r'^get_notice_info/$', views.GetNoticeInfoView.as_view(), name='get_notice_info_ajax'),




    # 페이지 #####################################################################################################
    # 강사 메인 페이지
    url(r'^trainer_main/$', views.TrainerMainView.as_view(), name='trainer_main'),
    # 일일 일정 페이지
    url(r'^cal_day/$', views.CalDayView.as_view(), name='cal_day'),
    # 주간 일정 페이지
    url(r'^cal_week/$', views.CalWeekView.as_view(), name='cal_week'),
    # 월간 일정 페이지
    url(r'^cal_month/$', views.CalMonthView.as_view(), name='cal_month'),
    # 회원/그룹/클래스 통합 뷰 페이지
    url(r'^lecture_manage/$', views.ManageLectureView.as_view(), name='lecture_manage'),
    # 회원 관리 페이지
    url(r'^member_manage/$', views.ManageMemberView.as_view(), name='member_manage'),
    # 그룹 관리 페이지
    url(r'^group_manage/$', views.ManageGroupView.as_view(), name='group_manage'),
    # 클래스 관리 페이지
    url(r'^class_manage/$', views.ManageClassView.as_view(), name='class_manage'),
    # 센터 관리 페이지
    url(r'^center_manage/$', views.ManageCenterView.as_view(), name='center_manage'),
    # 이용 문의 페이지
    url(r'^help_setting/$', views.HelpPtersView.as_view(), name='help_setting'),
    # From 피터스팀 페이지
    url(r'^frompters_setting/$', views.FromPtersView.as_view(), name='frompters_setting'),
    # About us 페이지
    url(r'^aboutus_setting/$', views.AboutUsView.as_view(), name='aboutus_setting'),
    # 강좌 선택 페이지
    url(r'^class_select/$', views.ClassSelectView.as_view(), name='class_select'),
    # 강좌 추가 페이지
    url(r'^add_class/$', views.AddClassView.as_view(), name='add_class'),
    # Mypage 페이지
    url(r'^trainer_mypage/$', views.MyPageView.as_view(), name='trainer_mypage'),
    # 회원 탈퇴 페이지
    url(r'^delete_account/$', views.DeleteAccountView.as_view(), name='delete_account'),
    # Setting 페이지
    url(r'^trainer_setting/$', views.TrainerSettingView.as_view(), name='trainer_setting'),
    # 배경 화면 선택 페이지
    url(r'^background_setting/$', views.BGSettingView.as_view(), name='background_setting'),
    # 푸시 Setting 페이지
    url(r'^push_setting/$', views.PushSettingView.as_view(), name='push_setting'),
    # 예약 관련 Setting 페이지
    url(r'^reserve_setting/$', views.ReserveSettingView.as_view(), name='reserve_setting'),
    # 예약 관련 Setting 페이지
    url(r'^basic_setting/$', views.BasicSettingView.as_view(), name='basic_setting'),
    # 금액 Setting 페이지
    url(r'^sales_setting/$', views.SalesSettingView.as_view(), name='sales_setting'),
    # 클래스 Setting 페이지
    url(r'^class_setting/$', views.ClassSettingView.as_view(), name='class_setting'),
    # 언어 Setting 페이지
    url(r'^language_setting/$', views.LanguageSettingView.as_view(), name='language_setting'),
    # 매출 관리 페이지
    url(r'^work_manage/$', views.ManageWorkView.as_view(), name='work_manage'),
    # 알람 조회 페이지
    url(r'^alarm/$', views.AlarmView.as_view(), name='alarm'),
    # 알람 조회 페이지 PC
    url(r'^alarm_pc/$', views.AlarmPCView.as_view(), name='alarm_pc'),

    # iframe 주간 일정 페이지
    url(r'^iframe_week/$', views.CalWeekIframeView.as_view(), name='iframe_week'),
    # iframe 월간 일정 페이지
    url(r'^iframe_month/$', views.CalMonthIframeView.as_view(), name='iframe_month'),
    # iframe 회원 달력 미리보기 페이지
    url(r'^iframe_preview/$', views.CalPreviewIframeView.as_view(), name='iframe_preview'),
    ######################################################################################################
]
