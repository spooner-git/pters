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

    # 수강 정보 기능 #####################################################################################################
    # 강좌 정보 list 조회
    url(r'^get_trainee_class_list/$', views.GetTraineeClassListView.as_view(), name='get_trainee_class_list'),
    # 수강 정보 list 조회 - auth_cd(연결상태) 종류별
    url(r'^get_trainee_lecture_list/$', views.GetTraineeLectureListView.as_view(), name='get_trainee_lecture_list'),
    # 수강 정보 연결 안된 정보 조회
    url(r'^get_trainee_lecture_connection_list/$', views.GetTraineeLectureConnectionListView.as_view(),
        name='get_trainee_lecture_connection_list'),
    # 수강 횟수 정보 가져오기
    url(r'^get_trainee_count/$', views.GetTraineeCountView.as_view(), name='get_trainee_count'),
    # 수강정보 선택/연동 기능
    url(r'^lecture_processing/$', views.lecture_processing, name='lecture_processing'),

    # Mypage 기능 #####################################################################################################
    # 회원 정보 조회
    url(r'^get_trainee_info/$', views.GetTraineeInfoView.as_view(), name='get_trainee_info'),
    # 회원 정보 수정
    url(r'^update_trainee_info/$', views.update_trainee_info_logic, name='update_trainee_info'),

    # 그룹 기능 #####################################################################################################
    # 회원이 자신이 속한 그룹중 진행중 상태인 그룹 list 조회
    url(r'^get_trainee_group_ing_list/$', views.GetTraineeGroupIngListViewAjax.as_view(),
        name='get_trainee_group_ing_list'),
    url(r'^get_trainee_group_end_list/$', views.GetTraineeGroupEndListViewAjax.as_view(),
        name='get_trainee_group_end_list'),

    # 알람 기능 #####################################################################################################
    url(r'^alarm/$', views.AlarmView.as_view(), name='alarm'),
    url(r'^get_alarm_ajax/$', views.AlarmViewAjax.as_view(), name='get_alarm_ajax'),



    # 페이지 #####################################################################################################
    # 회원 빈 월간 일정 페이지
    url(r'^trainee_main/$', views.TraineeMainView.as_view(), name='trainee_main'),
    # 회원 빈 월간 일정 페이지
    url(r'^cal_month_blank/$', views.CalMonthBlankView.as_view(), name='cal_month_blank'),
    # 회원 빈 Mypage 페이지
    url(r'^mypage_trainee_blank/$', views.MyPageBlankView.as_view(), name='mypage_trainee_blank'),
    # 월간 일정 페이지
    url(r'^cal_month/$', views.CalMonthView.as_view(), name='cal_month'),
    # Mypage 페이지
    url(r'^mypage_trainee/$', views.MyPageView.as_view(), name='mypage_trainee'),
    # 강좌 선택 페이지
    url(r'^lecture_select/$', views.LectureSelectView.as_view(), name='lecture_select'),
    # 회원 탈퇴 페이지
    url(r'^delete_trainee_account/$', views.DeleteTraineeAccountView.as_view(), name='delete_trainee_account'),
]
