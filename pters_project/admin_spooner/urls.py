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
    url(r'^get_qa_all/$', views.GetQaAllView.as_view(), name='get_qa_all'),
    url(r'^get_notice_all/$', views.GetNoticeAllView.as_view(), name='get_notice_all'),
    url(r'^add_notice_info/$', views.AddNoticeInfoView.as_view(), name='add_notice_info'),
    url(r'^update_notice_info/$', views.UpdateNoticeInfoView.as_view(), name='update_notice_info'),

]
