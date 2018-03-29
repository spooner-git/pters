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

    # 강사 - 회원정보 등록 관련
    url(r'^member_manage/$', views.ManageMemberView.as_view(), name='member_manage'),
    url(r'^member_manage_ajax/$', views.ManageMemberViewAjax.as_view(), name='member_manage_ajax'),
    url(r'^add_member_info/$', views.add_member_info_logic_test, name='add_member_info'),
    url(r'^update_member_info/$', views.update_member_info_logic, name='update_member_info'),
    url(r'^delete_member_info/$', views.delete_member_info_logic, name='delete_member_info'),
    url(r'^get_member_info/$', views.GetMemberInfoView.as_view(), name='get_member_info'),

    # 회원 수강 list 조회
    url(r'^read_lecture_by_class_member_ajax/$', views.ReadLectureByClassMemberAjax.as_view(), name='read_lecture_by_class_member_ajax'),

    url(r'^resend_member_lecture_info/$', views.resend_member_lecture_info_logic, name='resend_member_lecture_info'),
    url(r'^delete_member_lecture_info/$', views.delete_member_lecture_info_logic, name='delete_member_lecture_info'),
    url(r'^update_member_lecture_info/$', views.update_member_lecture_info_logic, name='update_member_lecture_info'),
    url(r'^refund_member_lecture_info/$', views.refund_member_lecture_info_logic, name='refund_member_lecture_info'),

    # 회원 연동 상태 변경
    url(r'^update_member_lecture_view_info/$', views.update_member_lecture_view_info_logic, name='update_member_lecture_view_info'),

    # url(r'^add_lecture_info/$', views.add_lecture_info_logic, name='add_lecture_info'),

    # 일정 조회 관련
    url(r'^cal_day/$', views.CalDayView.as_view(), name='cal_day'),
    url(r'^cal_day_ajax/$', views.CalDayViewAjax.as_view(), name='cal_day_ajax'),
    url(r'^cal_week/$', views.CalWeekView.as_view(), name='cal_week'),
    url(r'^cal_month/$', views.CalMonthView.as_view(), name='cal_month'),
    url(r'^add_repeat_off/$', views.OffRepeatAddView.as_view(), name='add_rep'
                                                                     'eat_off'),

    # 회원 데이터 관련
    url(r'^read_member_lecture_data/$', views.ReadMemberLectureData.as_view(), name='read_member_lecture_data'),

    # log 관련
    url(r'^alarm/$', views.AlarmView.as_view(), name='alarm'),
    url(r'^alarm_test/$', views.AlarmTestView.as_view(), name='alarm_test'),
    url(r'^get_alarm_ajax/$', views.AlarmViewAjax.as_view(), name='get_alarm_ajax'),
    url(r'^alarm_delete/$', views.alarm_delete_logic, name='alarm_delete'),

    # 기타 setting 관련
    url(r'^trainer_setting/$', views.TrainerSettingView.as_view(), name='trainer_setting'),
    url(r'^trainer_mypage/$', views.MyPageView.as_view(), name='trainer_mypage'),
    url(r'^trainer_mypage_ajax/$', views.MyPageViewAjax.as_view(), name='trainer_mypage_ajax'),
    url(r'^push_setting/$', views.PushSettingView.as_view(), name='push_setting'),
    url(r'^reserve_setting/$', views.ReserveSettingView.as_view(), name='reserve_setting'),
    url(r'^sales_setting/$', views.SalesSettingView.as_view(), name='sales_setting'),
    url(r'^class_setting/$', views.ClassSettingView.as_view(), name='class_setting'),
    url(r'^language_setting/$', views.LanguageSettingView.as_view(), name='language_setting'),
    url(r'^work_manage/$', views.ManageWorkView.as_view(), name='work_manage'),
    url(r'^trainer_setting_ajax/$', views.TrainerSettingViewAjax.as_view(), name='trainer_setting_ajax'),

    url(r'^update_setting_push/$', views.update_setting_push_logic, name='update_setting_push'),
    url(r'^update_setting_reserve/$', views.update_setting_reserve_logic, name='update_setting_reserve'),
    url(r'^update_setting_sales/$', views.update_setting_sales_logic, name='update_setting_sales'),
    url(r'^update_setting_language/$', views.update_setting_language_logic, name='update_setting_language'),


    # 강좌 개설 기능
    url(r'^add_class/$', views.AddClassView.as_view(), name='add_class'),
    url(r'^class_select/$', views.ClassSelectView.as_view(), name='class_select'),
    url(r'^class_processing/$', views.class_processing_logic, name='class_processing'),
    url(r'^add_class_info/$', views.AddClassInfoView.as_view(), name='add_class_info'),
    url(r'^get_class_data/$', views.GetClassDataViewAjax.as_view(), name='get_class_data'),
    url(r'^delete_class_info/$', views.DeleteClassInfoView.as_view(), name='delete_class_info'),


    url(r'^trainer_error_info/$', views.TrainerErrorInfoView.as_view(), name='trainer_error_info'),

]
