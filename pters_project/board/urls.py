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
    url(r'^add_qa_info/$', views.add_qa_info_logic, name='add_qa_info'),
    url(r'^get_qa_list/$', views.GetQADataView.as_view(), name='get_qa_list'),
    url(r'^clear_qa_list/$', views.ClearQADataView.as_view(), name='clear_qa_list'),
    url(r'^get_notice_list/$', views.GetNoticeDataView.as_view(), name='get_notice_list'),

    url(r'^get_qa_comment_list/$', views.GetQACommentDataView.as_view(), name='get_qa_comment_list'),

]
