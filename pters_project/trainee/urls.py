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
from trainee import views

urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^blank/$', views.BlankView.as_view(), name='blank'),
    url(r'^cal_month/$', views.CalMonthView.as_view(), name='cal_month'),
    url(r'^add_pt/$', views.WeekAddView.as_view(), name='add_pt'),
    url(r'^add_pt_day/$', views.DayAddView.as_view(), name='add_pt_day'),
    url(r'^pt_delete_logic/$', views.pt_delete_logic, name='pt_delete_logic'),
    url(r'^pt_add_logic/$', views.pt_add_logic, name='pt_add_logic'),
    url(r'^pt_add_array_logic/$', views.pt_add_array_logic, name='pt_add_array_logic'),
    url(r'^mypage_trainee/$', views.MyPageView.as_view(), name='mypage_trainee'),

    url(r'^lecture_select/$', views.LectureSelectView.as_view(), name='lecture_select'),
    url(r'^lecture_check/$', views.LectureCheckView.as_view(), name='lecture_check'),

    url(r'^lecture_processing/$', views.lecture_processing, name='lecture_processing'),

    url(r'^read_trainee_lecture_ajax/$', views.ReadTraineeLectureViewAjax.as_view(), name='read_trainee_lecture_ajax'),
    url(r'^read_trainee_schedule_ajax/$', views.ReadTraineeScheduleViewAjax.as_view(), name='read_trainee_schedule_ajax'),
    url(r'^read_trainee_lecture_by_class_ajax/$', views.ReadLectureByClassAjax.as_view(), name='read_trainee_lecture_by_class_ajax'),


]


