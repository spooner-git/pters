import logging

from django.contrib.auth import logout
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render, redirect
from django.views.generic import RedirectView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import TemplateView

# Create your views here.
from configs.const import USE
from trainee.models import MemberLectureTb

logger = logging.getLogger(__name__)


def index(request):
    # login 완료시 main page 이동
    template_name = 'index.html'

    if request.user.is_authenticated():
        next_page = '/check/'
    else:
        next_page = ''

    if next_page == '':
        return render(request, template_name)
    else:
        return redirect(next_page)


class CheckView(LoginRequiredMixin, RedirectView):

    def get(self, request, **kwargs):
        user_for_group = User.objects.get(id=request.user.id)
        group_list = user_for_group.groups.filter(user=request.user.id)
        if len(group_list) == 1:
            group = group_list[0]

            request.session['base_html'] = group.name + '_base.html'
            request.session['group_name'] = group.name
            if group.name == 'admin':
                self.url = '/spooner_adm/'
            else:
                self.url = '/' + group.name + '/'
        else:
            self.url = '/login/logout/'
        return super(CheckView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(CheckView, self).get_redirect_url(*args, **kwargs)


class SiteUsePolicyView(TemplateView):
    template_name = 'policy.html'

    def get_context_data(self, **kwargs):
        context = super(SiteUsePolicyView, self).get_context_data(**kwargs)
        return context


class SiteUsePolicyChargeView(TemplateView):
    template_name = 'policy_charge.html'

    def get_context_data(self, **kwargs):
        context = super(SiteUsePolicyChargeView, self).get_context_data(**kwargs)
        return context


class PrivacyView(TemplateView):
    template_name = 'privacy.html'

    def get_context_data(self, **kwargs):
        context = super(PrivacyView, self).get_context_data(**kwargs)
        return context


class AccessTestMixin(UserPassesTestMixin):

    def test_func(self):
        test_result = False
        error = None
        user_for_group = self.request.user
        # group = None
        url = None

        group_name = self.request.session.get('group_name', '')

        if error is None:
            if group_name == '':
                group_list = user_for_group.groups.filter(user=self.request.user.id)
                if len(group_list) == 1:
                    group_name = group_list[0].name
                    self.request.session['base_html'] = group_name+'_base.html'
                    self.request.session['group_name'] = group_name
                else:
                    error = '세션이 만료됐습니다.'

        if error is None:
            url = self.request.get_full_path().split('/')

        if error is None:
            if url[1] == 'trainee':
                if group_name == 'trainee':
                    test_result = True
            if url[1] == 'trainer':
                if group_name == 'trainer':
                    test_result = True
            if url[1] == 'center':
                if group_name == 'center':
                    test_result = True

        return test_result


def date_check_func(pt_schedule_date, add_start_dt, add_end_dt, origin_start_dt, origin_end_dt):
    error = None

    if origin_start_dt >= add_start_dt:
        if origin_start_dt < add_end_dt:
            error = str(pt_schedule_date)
    if origin_end_dt > add_start_dt:
        if origin_end_dt < add_end_dt:
            error = str(pt_schedule_date)
    if origin_start_dt <= add_start_dt:
        if origin_end_dt >= add_end_dt:
            error = str(pt_schedule_date)

    return error


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class Error404View(TemplateView):
    template_name = '404_page.html'

    def get_context_data(self, **kwargs):
        context = super(Error404View, self).get_context_data(**kwargs)

        return context


class Error500View(TemplateView):
    template_name = '505_page.html'

    def get_context_data(self, **kwargs):
        context = super(Error500View, self).get_context_data(**kwargs)

        return context
