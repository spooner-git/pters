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
from schedule import views

urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
    # 강사 일정 기능 #####################################################################################################
    # 일정 등록
    url(r'^add_schedule/$', views.add_schedule_logic, name='add_schedule'),
    # 일정 삭제
    url(r'^delete_schedule/$', views.delete_schedule_logic, name='delete_schedule'),
    # 일정 완료
    url(r'^finish_schedule/$', views.finish_schedule_logic, name='finish_schedule'),
    # 사인 이미지 업로드
    url(r'^upload_sign_image/$', views.upload_sign_image_logic, name='upload_sign_image'),
    # 일정 메모 수정
    url(r'^update_memo_schedule/$', views.update_memo_schedule_logic, name='update_memo_schedule'),
    # 반복일정 등록
    url(r'^add_repeat_schedule/$', views.add_repeat_schedule_logic, name='add_repeat_schedule'),
    # 반복일정 확인
    url(r'^add_repeat_schedule_confirm/$', views.add_repeat_schedule_confirm, name='add_repeat_schedule_confirm'),
    # 반복일정 삭제
    url(r'^delete_repeat_schedule/$', views.delete_repeat_schedule_logic, name='delete_repeat_schedule'),
    # 일정 수정 됐는지 확인
    url(r'^check_schedule_update/$', views.CheckScheduleUpdateViewAjax.as_view(), name='check_schedule_update'),

    # 그룹 일정 기능 #####################################################################################################
    # 그룹 일정 등록
    url(r'^add_group_schedule/$', views.add_group_schedule_logic, name='add_group_schedule'),
    # 그룹 일정 삭제
    url(r'^delete_group_schedule/$', views.delete_group_schedule_logic, name='delete_group_schedule'),
    # 그룹 일정 완료
    url(r'^finish_group_schedule/$', views.finish_group_schedule_logic, name='finish_group_schedule'),
    # 그룹 일정에 회원 일정 등록
    url(r'^add_member_group_schedule/$', views.add_member_group_schedule_logic, name='add_member_group_schedule'),
    # 그룹 반복일정 등록
    url(r'^add_group_repeat_schedule/$', views.add_group_repeat_schedule_logic, name='add_group_repeat_schedule'),
    # 그룹 반복일정 확인
    url(r'^add_group_repeat_schedule_confirm/$', views.add_group_repeat_schedule_confirm, name='add_group_repeat_schedule_confirm'),
    # 그룹 반복일정 삭제
    url(r'^delete_group_repeat_schedule/$', views.delete_group_repeat_schedule_logic, name='delete_group_repeat_schedule'),

]
