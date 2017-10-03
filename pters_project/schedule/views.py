from django.shortcuts import render

# Create your views here.
from django.views.generic import TemplateView
from config.views import get_login_member_info
from django.contrib.auth.mixins import LoginRequiredMixin
from config.settings import LOGIN_URL


class IndexView(LoginRequiredMixin, TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        return context


class CalDayView(LoginRequiredMixin, TemplateView):
    template_name = 'daily_cal.html'

    def get_context_data(self, **kwargs):
        context = super(CalDayView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context


class CalMonthView(LoginRequiredMixin, TemplateView):
    template_name = 'month_cal.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context
