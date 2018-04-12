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
from django.conf.urls import url, include
from django.contrib import admin
from django.views.generic import TemplateView

from configs import views

urlpatterns = [
    url(r'^$', views.HomeView.as_view(), name='home'),
    url(r'^accounts/', include('registration.backends.hmac.urls')),
    url(r'^login/', include('login.urls', namespace='login')),
    url(r'^center/', include('center.urls', namespace='center')),
    url(r'^trainer/', include('trainer.urls', namespace='trainer')),
    url(r'^trainee/', include('trainee.urls', namespace='trainee')),
    url(r'^schedule/', include('schedule.urls', namespace='schedule')),
    url(r'^404_page/', include('schedule.urls', namespace='schedule')),
    url(r'^404_page/$', views.Error404View.as_view(), name='404_page'),
    url(r'^500_page/$', views.Error500View.as_view(), name='500_page'),
    url(r'^admin/', admin.site.urls),
    url(r'^robots\.txt$', TemplateView.as_view(template_name='robots.txt', content_type='text/plain')),
    # url(r'^static/(?P<path>.*)$', django.views.static.serve, {'document_root': settings.STATIC_URL}),
]
