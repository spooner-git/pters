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
    url(r'^login/$', views.login_trainer, name='login'),
    url(r'^logout/$', views.logout_trainer, name='logout'),
    url(r'^login_page/$', views.login_trainer_view, name='login_page'),
    url(r'^add_pt/$', views.PtAddView.as_view(), name='add_pt'),
    url(r'^add_pt_logic/$', views.add_pt_logic, name='add_pt_logic'),
    url(r'^add_off/$', views.OffAddView.as_view(), name='add_off'),
    url(r'^add_off_logic/$', views.add_off_logic, name='add_off_logic'),
    url(r'^add_repeat_off/$', views.OffRepeatAddView.as_view(), name='add_repeat_off'),
    url(r'^member_manage/$', views.ManageMemberView.as_view(), name='member_manage'),
    url(r'^member_add/$', views.AddMemberView.as_view(), name='member_add'),
    url(r'^member_registration/$', views.member_registration, name='member_registration'),
    url(r'^trainer_login/$', views.LogInTrainerView.as_view(), name='trainer_login'),
    url(r'^alarm/$', views.AlarmView.as_view(), name='alarm'),
    url(r'^alarm_delete/$', views.alarm_delete_logic, name='alarm_delete'),
    url(r'^cal_day/$', views.CalDayView.as_view(), name='cal_day'),
    url(r'^cal_day_ajax/$', views.CalDayViewAjax.as_view(), name='cal_day_ajax'),
    url(r'^cal_week/$', views.CalWeekView.as_view(), name='cal_week'),
    url(r'^cal_month/$', views.CalMonthView.as_view(), name='cal_month'),
    url(r'^daily_pt_delete/$', views.daily_pt_delete, name='daily_pt_delete'),
    url(r'^daily_off_delete/$', views.daily_off_delete, name='daily_off_delete'),
    url(r'^trainer_setting/$', views.TrainerSettingView.as_view(), name='trainer_setting'),
    url(r'^push_setting/$', views.PushSettingView.as_view(), name='push_setting'),
    url(r'^reserve_setting/$', views.ReserveSettingView.as_view(), name='reserve_setting'),
    url(r'^sales_setting/$', views.SalesSettingView.as_view(), name='sales_setting'),
    url(r'^modify_pt/$', views.PtModifyView.as_view(), name='modify_pt'),
    url(r'^modify_pt_logic/$', views.modify_pt_logic, name='modify_pt_logic'),
    url(r'^modify_off/$', views.OffModifyView.as_view(), name='modify_off'),
    url(r'^modify_off_logic/$', views.modify_off_logic, name='modify_off_logic'),
    url(r'^work_manage/$', views.ManageWorkView.as_view(), name='work_manage'),

]
