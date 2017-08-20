from django.shortcuts import render

# Create your views here.
from django.views.generic import TemplateView


class HomeView(TemplateView):
    template_name = 'main_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(HomeView, self).get_context_data(**kwargs)

        return context


class CalDayView(TemplateView):
    template_name = 'daily_cal.html'

    def get_context_data(self, **kwargs):
        context = super(CalDayView, self).get_context_data(**kwargs)

        return context


class CalMonthView(TemplateView):
    template_name = 'month_cal.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthView, self).get_context_data(**kwargs)

        return context


class PtAddView(TemplateView):
    template_name = 'pt_add.html'

    def get_context_data(self, **kwargs):
        context = super(PtAddView, self).get_context_data(**kwargs)

        return context


class OffAddView(TemplateView):
    template_name = 'off_add.html'

    def get_context_data(self, **kwargs):
        context = super(OffAddView, self).get_context_data(**kwargs)

        return context