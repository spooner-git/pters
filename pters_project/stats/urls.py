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
from stats import views

urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
    # 매출 통계 정보 조회
    url(r'^get_sales_list/$', views.GetSalesListViewAjax.as_view(), name='get_sales_list'),
    # 매출 상세 내역 조회
    url(r'^get_sales_info/$', views.GetSalesInfoViewAjax.as_view(), name='get_sales_info'),
    # 회원 통계 정보 조회
    url(r'^get_stats_member_list/$', views.GetStatsMemberListViewAjax.as_view(), name='get_stats_member_list'),
]
