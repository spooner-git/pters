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
from center import views

urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^blank/$', views.BlankView.as_view(), name='blank'),

    url(r'^get_class_data/$', views.GetClassDataViewAjax.as_view(), name='get_class_data'),
    url(r'^get_trainer_data/$', views.GetTrainerDataViewAjax.as_view(), name='get_trainer_data'),
]


