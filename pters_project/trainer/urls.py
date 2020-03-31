# coding=utf-8
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
    # 강사 전체 스케쥴 조회(OFF/개인/그룹) - refactoring
    url(r'^get_trainer_schedule_all/$', views.GetTrainerScheduleAllView.as_view(), name='get_trainer_schedule_all'),
    # 그룹 수업 일정에 속하는 회원의 일정 조회 - refactoring
    url(r'^get_lecture_member_schedule_list/$', views.GetLectureMemberScheduleListViewAjax.as_view(),
        name='get_lecture_member_schedule_list'),

    # 강사 전체 스케쥴 조회(OFF/개인/그룹) - refactoring
    url(r'^get_trainer_schedule_info/$', views.GetTrainerScheduleInfoView.as_view(), name='get_trainer_schedule_info'),

    # 회원 스케쥴 조회 - 수업 - refactoring
    url(r'^get_member_schedule_all/$', views.GetMemberScheduleAllView.as_view(), name='get_member_schedule_all'),

    # 수업 스케쥴 조회 - refactoring
    url(r'^get_lecture_schedule_list/$', views.GetLectureScheduleListView.as_view(), name='get_lecture_schedule_list'),

    # 전체 반복 일정 조회
    url(r'^get_repeat_schedule_all/$', views.GetRepeatScheduleAllView.as_view(), name='get_repeat_schedule_all'),
    url(r'^get_permission_wait_schedule_all/$', views.GetPermissionWaitScheduleAllView.as_view(), name='get_permission_wait_schedule_all'),
    # OFF 반복 일정 조회 - refactoring
    url(r'^get_off_repeat_schedule/$', views.GetOffRepeatScheduleView.as_view(), name='get_off_repeat_schedule'),
    # 수업 반복 일정 조회 - refactoring
    url(r'^get_lecture_repeat_schedule_list/$', views.GetLectureRepeatScheduleListViewAjax.as_view(),
        name='get_lecture_repeat_schedule_list'),
    # 회원 반복 일정 조회 - refactoring
    url(r'^get_member_repeat_schedule/$', views.GetMemberRepeatScheduleView.as_view(),
        name='get_member_repeat_schedule'),


    url(r'^add_closed_date/$', views.add_closed_date_logic,
        name='add_closed_date'),
    url(r'^update_closed_date/$', views.update_closed_date_logic,
        name='update_closed_date'),
    url(r'^delete_closed_date/$', views.delete_closed_date_logic,
        name='delete_closed_date'),
    url(r'^get_trainer_closed_date/$', views.GetTrainerClosedDateView.as_view(),
        name='get_trainer_closed_date'),
    url(r'^get_member_closed_date/$', views.GetMemberClosedDateView.as_view(),
        name='get_member_closed_date'),

    # 회원 기능 ##########################################
    # 회원 정보 조회 - refactoring
    url(r'^get_member_info/$', views.GetMemberInfoView.as_view(), name='get_member_info'),
    url(r'^search_member_info/$', views.SearchMemberInfoView.as_view(), name='search_member_info'),
    # 전체 회원 목록 조회 - refactoring
    url(r'^get_member_list/$', views.GetMemberListView.as_view(), name='get_member_list'),
    # 진행중 회원 목록 조회 - refactoring
    url(r'^get_member_ing_list/$', views.GetMemberIngListViewAjax.as_view(), name='get_member_ing_list'),
    # 진행 완료 회원 목록 조회 - refactoring
    url(r'^get_member_end_list/$', views.GetMemberEndListViewAjax.as_view(), name='get_member_end_list'),

    # 회원 수강정보 조회 - refactoring
    url(r'^get_member_ticket_info/$', views.GetMemberTicketInfoView.as_view(), name='get_member_ticket_info'),
    # 회원 수강정보 조회 - refactoring
    url(r'^get_member_ticket_list/$', views.GetMemberTicketListView.as_view(), name='get_member_ticket_list'),
    # 회원이 들을수 있는 수업 조회
    url(r'^get_member_lecture_list/$', views.GetMemberLectureListView.as_view(), name='get_member_lecture_list'),


    # 회원 정보 수정 - refactoring
    url(r'^update_member_info/$', views.update_member_info_logic, name='update_member_info'),
    # 회원 정보 삭제 - refactoring
    url(r'^delete_member_info/$', views.delete_member_info_logic, name='delete_member_info'),
    # 회원 리스트 엑셀 export 기능
    url(r'^export_excel_member_list/$', views.export_excel_member_list_logic, name='export_excel_member_list'),
    # 회원 정보 엑셀 export 기능
    url(r'^export_excel_member_info/$', views.export_excel_member_info_logic, name='export_excel_member_info'),

    # 회원 수강정보 추가 - refactoring
    url(r'^add_member_ticket_info/$', views.add_member_ticket_info_logic, name='add_member_ticket_info'),
    # 회원 수강정보 수정 - refactoring
    url(r'^update_member_ticket_info/$', views.update_member_ticket_info_logic, name='update_member_ticket_info'),
    # 회원 수강정보 삭제 - refactoring - 확인 필요
    url(r'^delete_member_ticket_info/$', views.delete_member_ticket_info_logic, name='delete_member_ticket_info'),

    # 회원 수강정보 상태 변경 - refactoring - 확인 필요
    url(r'^update_member_ticket_status_info/$', views.update_member_ticket_status_info_logic,
        name='update_member_ticket_status_info'),
    # 회원 연동 상태 변경 - refactoring
    url(r'^update_member_connection_info/$', views.update_member_connection_info_logic,
        name='update_member_connection_info'),

    # 회원이 들을수 있는 수업 조회
    url(r'^get_hold_member_ticket_list/$',
        views.GetHoldMemberTicketListView.as_view(), name='get_hold_member_ticket_list'),
    # 회원 수강정보 홀딩 - refactoring - 확인 필요
    url(r'^add_hold_member_ticket_info/$',
        views.add_hold_member_ticket_info_logic, name='add_hold_member_ticket_info'),
    # 회원 수강정보 홀딩 수정 - refactoring - 확인 필요
    url(r'^update_hold_member_ticket_info/$',
        views.update_hold_member_ticket_info_logic, name='update_hold_member_ticket_info'),
    # 회원 수강정보 홀딩 삭제 - refactoring - 확인 필요
    url(r'^delete_hold_member_ticket_info/$',
        views.delete_hold_member_ticket_info_logic, name='delete_hold_member_ticket_info'),


    # 회원 프로필 업데이트/삭제
    url(r'^update_member_profile_img', views.update_member_profile_img_logic, name='update_member_profile_img'),
    url(r'^delete_member_profile_img', views.delete_member_profile_img_logic, name='delete_member_profile_img'),


    # 수업 기능 ##########################################################################################################
    # 수업 추가 - refactoring
    url(r'^add_lecture_info/$', views.add_lecture_info_logic, name='add_lecture_info'),
    # 수업 삭제 - refactoring - 내부 회원 삭제 x
    url(r'^delete_lecture_info/$', views.delete_lecture_info_logic, name='delete_lecture_info'),
    # 수업 수정 - refactoring - 내부 회원 수정 x
    url(r'^update_lecture_info/$', views.update_lecture_info_logic, name='update_lecture_info'),

    # 수업 종료 상태 변경 - refactoring
    url(r'^update_lecture_status_info/$', views.update_lecture_status_info_logic, name='update_lecture_status_info'),
    # 수업 고정 맴버 변경
    url(r'^update_fix_lecture_member/$', views.update_fix_lecture_member_logic, name='update_fix_lecture_member'),

    # 수업 정보 조회 - refactoring
    url(r'^get_lecture_info/$', views.GetLectureInfoViewAjax.as_view(), name='get_lecture_info'),
    # 진행중 수업 list 조회 - refactoring
    url(r'^get_lecture_ing_list/$', views.GetLectureIngListViewAjax.as_view(), name='get_lecture_ing_list'),
    # 완료된 수업 list 조회 - refactoring
    url(r'^get_lecture_end_list/$', views.GetLectureEndListViewAjax.as_view(), name='get_lecture_end_list'),
    # 수업 회원 조회 - refactoring
    url(r'^get_lecture_ing_member_list/$', views.GetLectureIngMemberListViewAjax.as_view(),
        name='get_lecture_ing_member_list'),



    # 회원권 기능 #########################################################################################################
    # 회원권 추가 - refactoring
    url(r'^add_ticket_info/$', views.add_ticket_info_logic, name='add_ticket_info'),
    # 회원권 삭제 - refactoring
    url(r'^delete_ticket_info/$', views.delete_ticket_info_logic, name='delete_ticket_info'),
    # 회원권 수정 - refactoring
    url(r'^update_ticket_info/$', views.update_ticket_info_logic, name='update_ticket_info'),
    # 회원권에 수업 추가 - refactoring
    url(r'^add_ticket_lecture_info/$', views.add_ticket_lecture_info_logic, name='add_ticket_lecture_info'),
    # 회원권에 수업 삭제 - refactoring
    url(r'^delete_ticket_lecture_info/$', views.delete_ticket_lecture_info_logic, name='delete_ticket_lecture_info'),
    # 회원권 상태 변경 - refactoring
    url(r'^update_ticket_status_info/$', views.update_ticket_status_info_logic, name='update_ticket_status_info'),

    # 회원권 정보 조회 - refactoring
    url(r'^get_ticket_info/$', views.GetTicketInfoViewAjax.as_view(), name='get_ticket_info'),
    # 진행중 회원권 list 조회 - refactoring
    url(r'^get_ticket_ing_list/$', views.GetTicketIngListViewAjax.as_view(), name='get_ticket_ing_list'),
    # 완료된 회원권 list 조회 - refactoring
    url(r'^get_ticket_end_list/$', views.GetTicketEndListViewAjax.as_view(), name='get_ticket_end_list'),
    # 회원권 회원 조회 - refactoring
    url(r'^get_ticket_ing_member_list/$', views.GetTicketIngMemberListViewAjax.as_view(),
        name='get_ticket_ing_member_list'),
    # 회원권 종료 회원 조회 - refactoring
    url(r'^get_ticket_end_member_list/$', views.GetTicketEndMemberListViewAjax.as_view(),
        name='get_ticket_end_member_list'),



    # 강좌 기능 ##########################################################################################################
    # 강좌 정보 조회
    url(r'^get_program_list/$', views.GetProgramListViewAjax.as_view(), name='get_program_list'),
    # 강좌 정보 조회
    url(r'^get_program_category/$', views.GetProgramCategoryViewAjax.as_view(), name='get_program_category'),
    # 강좌 추가
    url(r'^add_program_info/$', views.add_program_info_logic, name='add_program_info'),
    # 강좌 삭제
    url(r'^delete_program_info/$', views.delete_program_info_logic, name='delete_program_info'),
    # 강좌 정보 수정
    url(r'^update_program_info/$', views.update_program_info_logic, name='update_program_info'),
    # 강좌 정보 선택 처리
    url(r'^select_program_processing/$', views.select_program_processing_logic, name='select_program_processing'),

    # 강사 검색 기능
    url(r'^search_trainer_info/$', views.SearchTrainerInfoView.as_view(), name='search_trainer_info'),
    # 지점 공유 기능
    url(r'^update_share_program_info/$', views.update_share_program_info_logic, name='update_share_program_info'),
    # 지점 공유 내역 조회
    url(r'^get_share_program_data/$', views.GetShareProgramDataViewAjax.as_view(), name='get_share_program_data'),

    # 나에게 지점 공유 권한 내역 조회
    url(r'^get_shared_program_data/$', views.GetSharedProgramDataViewAjax.as_view(), name='get_share_program_data'),

    # 지점 공유 연결 안된 정보 조회
    url(r'^get_trainer_program_connection_list/$', views.GetTrainerProgramConnectionListView.as_view(),
        name='get_trainer_program_connection_list'),
    # 지점 공유 수락/거절 기능
    url(r'^update_trainer_program_connection_info/$', views.update_trainer_program_connection_info_logic,
        name='update_trainer_program_connection_info'),
    # 지점 공유 해제 기능
    url(r'^delete_trainer_program_connection/$', views.delete_trainer_program_connection_logic,
        name='delete_trainer_program_connection'),

    url(r'^refresh_trainer_page/$', views.refresh_trainer_page_logic, name='refresh_trainer_page'),


    # 배경 이미지 설정 기능 #################################################################################################
    # 배경 이미지 타입 코드 조회
    url(r'^get_background_img_type_list/$', views.GetBackgroundImgTypeListViewAjax.as_view(),
        name='get_background_img_type_list'),
    # 배경 이미지 정보 조회
    url(r'^get_background_img_list/$', views.GetBackgroundImgListViewAjax.as_view(), name='get_background_img_list'),
    # 배경 이미지 정보 추가/수정
    url(r'^update_background_img_info/$', views.update_background_img_info_logic,
        name='update_background_img_info'),
    # 배경 이미지 정보 삭제
    url(r'^delete_background_img_info/$', views.delete_background_img_info_logic,
        name='delete_background_img_info'),


    # Mypage/Setting 기능 ###############################################################################################
    # 강사 정보 조회
    url(r'^get_trainer_info/$', views.GetTrainerInfoView.as_view(), name='get_trainer_info'),
    # 강사 정보 수정
    url(r'^update_trainer_info/$', views.update_trainer_info_logic, name='update_trainer_info'),
    # 푸시 - to 외부 Setting 수정
    url(r'^update_setting_push/$', views.update_setting_push_logic, name='update_setting_push'),

    # 푸시 - to 나에게 Setting 수정
    url(r'^update_setting_push_to_me/$', views.update_setting_push_to_me_logic, name='update_setting_push_to_me'),

    # 일반 설정 관련 Setting 수정
    url(r'^update_setting_calendar_setting/$', views.update_setting_calendar_setting_logic,
        name='update_setting_calendar_setting'),

    url(r'^update_setting_work_time/$', views.update_setting_work_time_logic, name='update_setting_work_time'),
    url(r'^update_setting_auto_complete/$', views.update_setting_auto_complete_logic,
        name='update_setting_auto_complete'),
    # 출석체크 모드 Setting 수정
    url(r'^update_attend_mode_setting/$', views.update_attend_mode_setting_logic, name='update_attend_mode_setting'),

    # 예약관련 Setting 수정
    url(r'^update_setting_reserve/$', views.update_setting_reserve_logic, name='update_setting_reserve'),
    # 금액 Setting 정보 수정
    url(r'^update_setting_sales/$', views.update_setting_sales_logic, name='update_setting_sales'),
    # 언어 Setting 정보 수정
    url(r'^update_setting_language/$', views.update_setting_language_logic, name='update_setting_language'),

    # 사용자 앱 view 관련 Setting 수정
    url(r'^update_setting_theme/$', views.update_setting_theme_logic, name='update_setting_theme'),


    # 사용자 앱 view 관련 Setting 수정
    url(r'^update_setting_access_lock/$', views.update_setting_access_lock_logic,
        name='update_setting_access_lock'),

    # Setting 정보 가져오기
    url(r'^get_trainer_setting_data/$', views.GetTrainerSettingDataView.as_view(), name='get_trainer_setting_data'),
    url(r'^get_program_auth_data/$', views.GetProgramAuthDataView.as_view(), name='get_program_auth_data'),
    url(r'^get_trainer_auth_data/$', views.GetTrainerAuthDataView.as_view(), name='get_trainer_auth_data'),



    # 알람 기능 ##########################################################################################################
    # 알람 삭제
    url(r'^alarm_delete/$', views.alarm_delete_logic, name='alarm_delete'),


    # 공지 기능 ##########################################################################################################
    # 공지사항 조회
    url(r'^get_notice_info/$', views.GetNoticeInfoView.as_view(), name='get_notice_info_ajax'),


    # 강사 게시판 관리 기능 #################################################################################################
    # 공지사항/사용법/FAQ 전체 조회
    url(r'^get_program_board_ing_list/$', views.GetProgramBoardIngListView.as_view(),
        name='get_program_board_ing_list'),
    url(r'^get_program_board_end_list/$', views.GetProgramBoardEndListView.as_view(),
        name='get_program_board_end_list'),
    url(r'^get_program_board_all/$', views.GetProgramBoardAllView.as_view(), name='get_program_board_all'),
    url(r'^get_program_board_info/$', views.GetProgramBoardInfoView.as_view(), name='get_program_board_info'),
    # 공지사항/사용법/FAQ 추가
    url(r'^add_program_board_info/$', views.add_program_board_info_logic, name='add_program_board_info'),
    # 공지사항/사용법/FAQ 수정
    url(r'^update_program_board_info/$', views.update_program_board_info_logic, name='update_program_board_info'),
    # 공지사항/사용법/FAQ 삭제
    url(r'^delete_program_board_info/$', views.delete_program_board_info_logic, name='delete_program_board_info'),

    # 강사 공지사항 관리 기능 ###############################################################################################
    # 강사의 공지사항 전체 조회
    url(r'^get_program_notice_list/$', views.GetProgramNoticeAllView.as_view(), name='get_program_notice_list'),
    # 강사 공지사항 추가
    url(r'^add_program_notice_info/$', views.AddProgramNoticeInfoView.as_view(), name='add_program_notice_info'),
    # 강사 공지사항 수정
    url(r'^update_program_notice_info/$', views.UpdateProgramNoticeInfoView.as_view(),
        name='update_program_notice_info'),
    # 강사 공지사항 삭제
    url(r'^delete_program_notice_info/$', views.DeleteProgramNoticeInfoView.as_view(),
        name='delete_program_notice_info'),

    # Attend Mode 기능 ###############################################################################################
    # 일정선택후 휴대폰 번호 입력시 확인 기능
    url(r'^attend_mode_check/$', views.attend_mode_check_logic, name='attend_mode_check'),
    # 휴대폰 번호 입력후 출석 완료 기능
    url(r'^attend_mode_finish/$', views.attend_mode_finish_logic, name='attend_mode_finish'),
    # 관리자 비밀번호 확인
    url(r'^check_admin_password/$', views.check_admin_password_logic, name='check_admin_password'),
    # 출석 체크 모드 스케쥴 조회
    url(r'^get_attend_mode_schedule/$', views.GetAttendModeScheduleView.as_view(), name='get_attend_mode_schedule'),

    # 페이지 #####################################################################################################
    # 강사 메인 페이지
    url(r'^trainer_main/$', views.TrainerMainView.as_view(), name='trainer_main'),
    # 일정 페이지
    url(r'^cal_total/$', views.CalTotalView.as_view(), name='cal_total'),
    # 회원/그룹/클래스 통합 뷰 페이지
    url(r'^lecture_manage/$', views.ManageLectureView.as_view(), name='lecture_manage'),
    # 회원 관리 페이지
    url(r'^member_manage/$', views.ManageMemberView.as_view(), name='member_manage'),
    # Attend Mode 페이지
    url(r'^attend_mode/$', views.AttendModeView.as_view(), name='attend_mode'),
    # Attend Mode Detail 페이지
    url(r'^attend_mode_detail/$', views.AttendModeDetailView.as_view(), name='attend_mode_detail'),
    # 강좌 선택 페이지
    url(r'^class_select/$', views.ClassSelectView.as_view(), name='class_select'),
    # Mypage 페이지
    url(r'^trainer_mypage/$', views.MyPageView.as_view(), name='trainer_mypage'),
    # 회원 탈퇴 페이지
    # url(r'^delete_account/$', views.DeleteAccountView.as_view(), name='delete_account'),
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

    # 매출 관리 페이지
    url(r'^work_manage/$', views.ManageWorkView.as_view(), name='work_manage'),
    # 알람 조회 페이지
    url(r'^alarm/$', views.AlarmView.as_view(), name='alarm'),
    # 알람 조회 페이지 PC
    # url(r'^alarm_pc/$', views.AlarmPCView.as_view(), name='alarm_pc'),

    ######################################################################################################

    # 리뉴얼 
    # 팝업
    # 일정 팝업 페이지
    url(r'^popup_plan_view/$', views.PopupCalendarPlanView.as_view(), name='popup_plan_view'),
    # 일정 팝업 페이지
    url(r'^popup_plan_add/$', views.PopupCalendarPlanAdd.as_view(), name='popup_plan_add'),
    # 회원정보 팝업 페이지
    url(r'^popup_member_view/$', views.PopupMemberView.as_view(), name='popup_member_view'),
    # 회원 간단 정보 팝업 페이지
    url(r'^popup_member_simple_view/$', views.PopupMemberSimpleView.as_view(), name='popup_member_simple_view'),
    # 회원추가 팝업 페이지
    url(r'^popup_member_add/$', views.PopupMemberAdd.as_view(), name='popup_member_add'),
    # 회원설정 팝업 페이지
    url(r'^popup_member_edit/$', views.PopupMemberEdit.as_view(), name='popup_member_edit'),
    # 수업정보 팝업 페이지
    url(r'^popup_lecture_view/$', views.PopupLectureView.as_view(), name='popup_lecture_view'),
    # 수업 간단 정보 팝업 페이지
    url(r'^popup_lecture_simple_view/$', views.PopupLectureSimpleView.as_view(), name='popup_lecture_simple_view'),
    # 수업추가 팝업 페이지
    url(r'^popup_lecture_add/$', views.PopupLectureAdd.as_view(), name='popup_lecture_add'),
    # 수업설정 팝업 페이지
    url(r'^popup_lecture_edit/$', views.PopupLectureEdit.as_view(), name='popup_lecture_edit'),
    # 회원권정보 팝업 페이지
    url(r'^popup_ticket_view/$', views.PopupTicketView.as_view(), name='popup_ticket_view'),
    # 회원권 간단 정보 팝업 페이지
    url(r'^popup_ticket_simple_view/$', views.PopupTicketSimpleView.as_view(), name='popup_ticket_simple_view'),
    # 회원권추가 팝업 페이지
    url(r'^popup_ticket_add/$', views.PopupTicketAdd.as_view(), name='popup_ticket_add'),
    # 회원권설정 팝업 페이지
    url(r'^popup_ticket_edit/$', views.PopupTicketEdit.as_view(), name='popup_ticket_edit'),

    # 회원 선택 팝업 페이지
    url(r'^popup_member_select/$', views.PopupMemberSelect.as_view(), name='popup_member_select'),
    # 수업 선택 팝업 페이지
    url(r'^popup_lecture_select/$', views.PopupLectureSelect.as_view(), name='popup_lecture_select'),
    # 회원권 선택 팝업 페이지
    url(r'^popup_ticket_select/$', views.PopupTicketSelect.as_view(), name='popup_ticket_select'),
    # 색상태그 선택 팝업 페이지
    url(r'^popup_color_select/$', views.PopupColorSelect.as_view(), name='popup_color_select'),

    # 지점 추가 페이지
    url(r'^add_program/$', views.add_program_logic, name='add_program'),
    # url(r'^refresh_all_data/$', views.refresh_all_data_logic, name='refresh_all_data')


    url(r'^update_trainer_board_content_img/$', views.update_trainer_board_content_img_logic,
        name='update_trainer_board_content_img'),

    url(r'^add_trainer_member_ticket_price_bug_check/$',
        views.add_trainer_member_ticket_price_bug_check_logic, name='add_trainer_member_ticket_price_bug_check'),
    url(r'^delete_trainer_member_ticket_price_bug_check/$',
        views.delete_trainer_member_ticket_price_bug_check_logic, name='delete_trainer_member_ticket_price_bug_check'),
    url(r'^get_trainer_member_ticket_price_bug_list/$',
        views.GetTrainerMemberTicketPriceBugListView.as_view(), name='get_trainer_member_ticket_price_bug_list'),
    url(r'^holding_test/$', views.holding_test_logic, name='holding_test')
]
