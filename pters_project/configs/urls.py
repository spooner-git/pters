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
import debug_toolbar
from django.conf.urls import url, include
from django.contrib import admin
from django.views.generic import TemplateView

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^check/$', views.CheckView.as_view(), name='check'),
    url(r'^policy/$', views.SiteUsePolicyView.as_view(), name='policy'),
    url(r'^policy_charge/$', views.SiteUsePolicyChargeView.as_view(), name='policy_charge'),
    url(r'^privacy/$', views.PrivacyView.as_view(), name='privacy'),
    url(r'^accounts/', include('registration.backends.hmac.urls')),
    url(r'^login/', include('login.urls', namespace='login')),
    url(r'^trainer/', include('trainer.urls', namespace='trainer')),
    url(r'^trainee/', include('trainee.urls', namespace='trainee')),
    url(r'^schedule/', include('schedule.urls', namespace='schedule')),
    url(r'^payment/', include('payment.urls', namespace='payment')),
    url(r'^stats/', include('stats.urls', namespace='stats')),
    url(r'^board/', include('board.urls', namespace='board')),
    url(r'^tasks/', include('tasks.urls', namespace='tasks')),
    # url(r'^404_page/$', views.Error404View.as_view(), name='404_page'),
    url(r'^403\.html$', TemplateView.as_view(template_name='403.html', content_type='text/html')),
    url(r'^404\.html$', TemplateView.as_view(template_name='404.html', content_type='text/html')),
    # url(r'^500_page/$', views.Error500View.as_view(), name='500_page'),
    url(r'^500\.html$', TemplateView.as_view(template_name='500.html', content_type='text/html')),
    url(r'^naverec38fa0ee0cdfb66dcf991b8ab081cef\.html$',
        TemplateView.as_view(template_name='naverec38fa0ee0cdfb66dcf991b8ab081cef.html',
                             content_type='text/html')),
    url(r'^spooner_adm/', admin.site.urls),
    url(r'^robots\.txt$', TemplateView.as_view(template_name='robots.txt', content_type='text/plain')),
    url(r'^sitemap\.xml$', TemplateView.as_view(template_name='sitemap.xml', content_type='text/xml')),
    # url(r'^static/(?P<path>.*)$', django.views.static.serve, {'document_root': settings.STATIC_URL}),
    url(r'^__debug__/', include(debug_toolbar.urls)),

]
