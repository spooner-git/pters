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
    # 일정 등록 삭제 관련
    url(r'^add_schedule/$', views.add_schedule_logic, name='add_schedule'),
    url(r'^delete_schedule/$', views.delete_schedule_logic, name='delete_schedule'),
    url(r'^finish_schedule/$', views.finish_schedule_logic, name='finish_schedule'),
    # url(r'^finish_schedule_image/$', views.finish_schedule_image_logic, name='finish_schedule_image'),
    url(r'^add_repeat_schedule/$', views.add_repeat_schedule_logic, name='add_repeat_schedule'),
    url(r'^add_repeat_schedule_confirm/$', views.add_repeat_schedule_confirm, name='add_repeat_schedule_confirm'),
    url(r'^delete_repeat_schedule/$', views.delete_repeat_schedule_logic, name='delete_repeat_schedule'),

    url(r'^check_schedule_update/$', views.CheckScheduleUpdateViewAjax.as_view(), name='check_schedule_update'),
    url(r'^upload_sign_image/$', views.upload_sign_image_logic, name='upload_sign_image'),

    # 수정 필요 - hkkim - 2018.03.28
    url(r'^get_finish_schedule/$', views.GetFinishScheduleViewAjax.as_view(), name='get_finish_schedule'),

    url(r'^update_memo_schedule/$', views.update_memo_schedule_logic, name='update_memo_schedule'),

]
