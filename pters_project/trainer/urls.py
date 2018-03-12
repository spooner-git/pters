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

    # 강사 - 회원정보 등록 관련
    url(r'^member_manage/$', views.ManageMemberView.as_view(), name='member_manage'),
    url(r'^member_manage_ajax/$', views.ManageMemberViewAjax.as_view(), name='member_manage_ajax'),
    url(r'^add_member_info/$', views.add_member_info_logic, name='add_member_info'),
    url(r'^update_member_info/$', views.update_member_info_logic, name='update_member_info'),
    url(r'^delete_member_info/$', views.delete_member_info_logic, name='delete_member_info'),

    # 일정 조회 관련
    url(r'^cal_day/$', views.CalDayView.as_view(), name='cal_day'),
    url(r'^cal_day_ajax/$', views.CalDayViewAjax.as_view(), name='cal_day_ajax'),
    url(r'^cal_week/$', views.CalWeekView.as_view(), name='cal_week'),
    url(r'^cal_month/$', views.CalMonthView.as_view(), name='cal_month'),
    url(r'^add_repeat_off/$', views.OffRepeatAddView.as_view(), name='add_repeat_off'),

    # 회원 데이터 관련
    url(r'^read_member_lecture_data/$', views.ReadMemberLectureData.as_view(), name='read_member_lecture_data'),

    # log 관련
    url(r'^alarm/$', views.AlarmView.as_view(), name='alarm'),
    url(r'^alarm_delete/$', views.alarm_delete_logic, name='alarm_delete'),

    # 기타 setting 관련
    url(r'^trainer_setting/$', views.TrainerSettingView.as_view(), name='trainer_setting'),
    url(r'^push_setting/$', views.PushSettingView.as_view(), name='push_setting'),
    url(r'^reserve_setting/$', views.ReserveSettingView.as_view(), name='reserve_setting'),
    url(r'^sales_setting/$', views.SalesSettingView.as_view(), name='sales_setting'),
    url(r'^work_manage/$', views.ManageWorkView.as_view(), name='work_manage'),
    url(r'^trainer_setting_ajax/$', views.TrainerSettingViewAjax.as_view(), name='trainer_setting_ajax'),

    url(r'^update_setting_push/$', views.update_setting_push_logic, name='update_setting_push'),
    url(r'^update_setting_reserve/$', views.update_setting_reserve_logic, name='update_setting_reserve'),
    url(r'^update_setting_language/$', views.update_setting_language_logic, name='update_setting_language'),

]
