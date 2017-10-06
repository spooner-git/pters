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
    url(r'^add_repeat_off/$', views.OffRepeatAddView.as_view(), name='add_repeat_off'),
    url(r'^member_manage/$', views.ManageMemberView.as_view(), name='member_manage'),
    url(r'^member_add/$', views.AddMemberView.as_view(), name='member_add'),
    url(r'^member_registration/$', views.member_registration, name='member_registration'),
    url(r'^trainer_login/$', views.LogInTrainerView.as_view(), name='trainer_login'),
    url(r'^alarm/$', views.AlarmView.as_view(), name='alarm'),
    url(r'^cal_day/$', views.CalDayView.as_view(), name='cal_day'),
]
