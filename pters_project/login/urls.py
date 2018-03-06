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
from login import views

urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^login/$', views.login_trainer, name='login'),
    url(r'^logout/$', views.logout_trainer, name='logout'),
    url(r'^register_trainer/$', views.RegisterTrainerView.as_view(), name='register_trainer'),
    url(r'^register_general/$', views.RegisterGeneralView.as_view(), name='register_general'),
    url(r'^register_business/$', views.RegisterBusinessView.as_view(), name='register_business'),
    url(r'^registertype/$', views.RegisterTypeSelectView.as_view(), name='registertype'),
    url(r'^add_member_info/$', views.add_member_info_logic, name='add_member_info'),
    url(r'^check_member_duplication/$', views.check_member_duplication_logic, name='check_member_duplication'),

    # url(r'^login_page/$', views.login_trainer_view, name='login_page'),

]
