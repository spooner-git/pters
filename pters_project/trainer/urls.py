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

from trainer import views

urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^trainer_main/$', views.TrainerMainView.as_view(), name='trainer_main'),

    # 일정 기능 #####################################################################################################
    url(r'^cal_day/$', views.CalDayView.as_view(), name='cal_day'),
    url(r'^cal_week/$', views.CalWeekView.as_view(), name='cal_week'),
    url(r'^cal_month/$', views.CalMonthView.as_view(), name='cal_month'),
    # 강사 스케쥴 조회 - 1:1/Group/Off
    url(r'^get_trainer_schedule/$', views.GetTrainerScheduleView.as_view(), name='get_trainer_schedule'),
    url(r'^get_off_repeat_schedule/$', views.GetOffRepeatScheduleView.as_view(), name='get_off_repeat_schedule'),

    # 회원 기능 #####################################################################################################
    url(r'^member_manage/$', views.ManageMemberView.as_view(), name='member_manage'),
    url(r'^member_manage_ajax/$', views.ManageMemberViewAjax.as_view(), name='member_manage_ajax'),
    url(r'^add_member_info/$', views.add_member_info_logic, name='add_member_info'),
    url(r'^update_member_info/$', views.update_member_info_logic, name='update_member_info'),
    url(r'^delete_member_info/$', views.delete_member_info_logic, name='delete_member_info'),
    url(r'^resend_member_lecture_info/$', views.resend_member_lecture_info_logic, name='resend_member_lecture_info'),
    url(r'^delete_member_lecture_info/$', views.delete_member_lecture_info_logic, name='delete_member_lecture_info'),
    url(r'^update_member_lecture_info/$', views.update_member_lecture_info_logic, name='update_member_lecture_info'),
    url(r'^refund_member_lecture_info/$', views.refund_member_lecture_info_logic, name='refund_member_lecture_info'),
    url(r'^progress_member_lecture_info/$', views.progress_member_lecture_info_logic, name='progress_member_lecture_info'),
    url(r'^finish_member_lecture_info/$', views.finish_member_lecture_info_logic, name='finish_member_lecture_info'),
    # 회원 연동 상태 변경
    url(r'^update_member_lecture_view_info/$', views.update_member_lecture_view_info_logic, name='update_member_lecture_view_info'),
    # 회원 정보 조회
    url(r'^get_member_info/$', views.GetMemberInfoView.as_view(), name='get_member_info'),
    # 진행중 회원 목록 조회
    url(r'^get_member_ing_list/$', views.GetMemberIngListViewAjax.as_view(), name='get_member_ing_list'),
    # 진행 완료 회원 목록 조회
    url(r'^get_member_end_list/$', views.GetMemberEndListViewAjax.as_view(), name='get_member_end_list'),
    # 회원 데이터 관련
    url(r'^read_lecture_by_class_member_ajax/$', views.ReadLectureByClassMemberAjax.as_view(), name='read_lecture_by_class_member_ajax'),
    # 회원 수강 list 조회
    url(r'^read_member_lecture_data/$', views.ReadMemberLectureData.as_view(), name='read_member_lecture_data'),
    # 회원 스케쥴 데이터 read
    url(r'^read_member_schedule_data/$', views.ReadMemberScheduleDataView.as_view(), name='read_member_schedule_data'),

    # 엑셀 export/import 기능
    url(r'^check_import_excel_member_list/$', views.check_import_excel_member_list_logic,
        name='check_import_excel_member_list'),
    url(r'^check_import_excel_member_info/$', views.check_import_excel_member_info_logic,
        name='check_import_excel_member_info'),
    url(r'^export_excel_member_list/$', views.export_excel_member_list_logic, name='export_excel_member_list'),
    url(r'^export_excel_member_info/$', views.export_excel_member_info_logic, name='export_excel_member_info'),
    url(r'^import_excel_member_list/$', views.import_excel_member_list_logic, name='import_excel_member_list'),
    url(r'^import_excel_member_info/$', views.import_excel_member_info_logic, name='import_excel_member_info'),


    # 그룹 기능 ##########################################################################################################
    # 그룹 추가
    url(r'^add_group_info/$', views.add_group_info_logic, name='add_group_info'),
    # 그룹 삭제 - 검토 필요
    url(r'^delete_group_info/$', views.delete_group_info_logic, name='delete_group_info'),
    # 그룹 수정 - 검토 필요
    url(r'^update_group_info/$', views.update_group_info_logic, name='update_group_info'),
    # 그룹에 회원 추가
    url(r'^add_group_member/$', views.add_group_member_logic, name='add_group_member'),
    # 그룹에 해당하는 회원 정보 삭제
    url(r'^delete_group_member_info/$', views.delete_group_member_info_logic, name='delete_group_member_info'),
    # 진행중 그룹 list 조회
    url(r'^get_group_ing_list/$', views.GetGroupIngListViewAjax.as_view(), name='get_group_ing_list'),
    # 완료된 그룹 list 조회
    url(r'^get_group_end_list/$', views.GetGroupEndListViewAjax.as_view(), name='get_group_end_list'),
    # 그룹에 해당하는 회원 조회
    url(r'^get_group_member/$', views.GetGroupMemberViewAjax.as_view(), name='get_group_member'),
    # 그룹일정에 속하는 그룹회원 일정 조회
    url(r'^get_group_schedule_list/$', views.GetGroupScheduleListViewAjax.as_view(), name='get_group_schedule_list'),
    # 그룹에 속하는 반복 일정 조회
    url(r'^get_group_repeat_schedule_list/$', views.GetGroupRepeatScheduleListViewAjax.as_view(), name='get_group_repeat_schedule_list'),
    # 그룹 반복일정과 같이 등록된 회원들의 반복일정
    url(r'^get_group_member_repeat_schedule_list/$', views.GetGroupMemberRepeatScheduleListViewAjax.as_view(), name='get_group_member_repeat_schedule_list'),


    # 강좌 기능 ##########################################################################################################
    url(r'^add_class/$', views.AddClassView.as_view(), name='add_class'),
    url(r'^add_class_info/$', views.AddClassInfoView.as_view(), name='add_class_info'),
    url(r'^delete_class_info/$', views.DeleteClassInfoView.as_view(), name='delete_class_info'),
    url(r'^update_class_info/$', views.UpdateClassInfoView.as_view(), name='update_class_info'),
    url(r'^class_select/$', views.ClassSelectView.as_view(), name='class_select'),
    url(r'^class_processing/$', views.class_processing_logic, name='class_processing'),
    url(r'^get_class_data/$', views.GetClassDataViewAjax.as_view(), name='get_class_data'),

    # Mypage/Setting 기능 ###############################################################################################
    url(r'^update_trainer_info/$', views.update_trainer_info_logic, name='update_trainer_info'),
    url(r'^delete_account/$', views.DeleteAccountView.as_view(), name='delete_account'),
    url(r'^trainer_mypage/$', views.MyPageView.as_view(), name='trainer_mypage'),
    url(r'^trainer_mypage_ajax/$', views.MyPageViewAjax.as_view(), name='trainer_mypage_ajax'),
    url(r'^trainer_setting/$', views.TrainerSettingView.as_view(), name='trainer_setting'),
    url(r'^push_setting/$', views.PushSettingView.as_view(), name='push_setting'),
    url(r'^reserve_setting/$', views.ReserveSettingView.as_view(), name='reserve_setting'),
    url(r'^sales_setting/$', views.SalesSettingView.as_view(), name='sales_setting'),
    url(r'^class_setting/$', views.ClassSettingView.as_view(), name='class_setting'),
    url(r'^language_setting/$', views.LanguageSettingView.as_view(), name='language_setting'),
    url(r'^help_setting/$', views.HelpPtersView.as_view(), name='help_setting'),
    url(r'^work_manage/$', views.ManageWorkView.as_view(), name='work_manage'),
    url(r'^trainer_setting_ajax/$', views.TrainerSettingViewAjax.as_view(), name='trainer_setting_ajax'),
    url(r'^update_setting_push/$', views.update_setting_push_logic, name='update_setting_push'),
    url(r'^update_setting_reserve/$', views.update_setting_reserve_logic, name='update_setting_reserve'),
    url(r'^update_setting_sales/$', views.update_setting_sales_logic, name='update_setting_sales'),
    url(r'^update_setting_language/$', views.update_setting_language_logic, name='update_setting_language'),
    url(r'^trainer_error_info/$', views.TrainerErrorInfoView.as_view(), name='trainer_error_info'),

    # 알람 기능 ##########################################################################################################
    url(r'^alarm/$', views.AlarmView.as_view(), name='alarm'),
    url(r'^alarm_delete/$', views.alarm_delete_logic, name='alarm_delete'),

    # 공지 기능 ##########################################################################################################
    url(r'^get_notice_info/$', views.GetNoticeInfoView.as_view(), name='get_off_repeat_schedule_ajax'),

]
