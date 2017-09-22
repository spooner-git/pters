from django.shortcuts import render

# Create your views here.
from django.views.generic import TemplateView
from config.views import get_login_member_info

class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context


class CalDayView(TemplateView):
    template_name = 'daily_cal.html'

    def get_context_data(self, **kwargs):
        context = super(CalDayView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context


class CalMonthView(TemplateView):
    template_name = 'month_cal.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context
