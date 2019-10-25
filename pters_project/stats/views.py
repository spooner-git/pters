import datetime
import logging

# Create your views here.
from django.views.generic import TemplateView
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin

from .functions import get_sales_data, get_sales_info, get_stats_member_data

logger = logging.getLogger(__name__)


class IndexView(TemplateView):
    template_name = 'index_stats.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        return context


class GetSalesListViewAjax(LoginRequiredMixin, TemplateView):
    template_name = "ajax/summary_sales_data_ajax.json"

    def get_context_data(self, **kwargs):
        context = super(GetSalesListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        start_date = self.request.GET.get('start_date', '')
        end_date = self.request.GET.get('end_date', '')
        error = None
        sales_data_result = {}

        if start_date == '' or start_date is None:
            error = '시작 일자를 선택해주세요.'
        elif end_date == '' or end_date is None:
            error = '종료 일자를 선택해주세요.'

        if error is None:
            try:
                finish_date = datetime.datetime.strptime(end_date, '%Y-%m-%d')
                month_first_day = datetime.datetime.strptime(start_date, '%Y-%m-%d')
                month_first_day = month_first_day.replace(day=1)
                self.request.session['sales_start_date'] = str(month_first_day.date())
                self.request.session['sales_finish_date'] = str(finish_date.date())
                sales_data_result = get_sales_data(class_id, month_first_day, finish_date)
            except TypeError:
                error = '날짜 형식에 문제 있습니다.'
            except ValueError:
                error = '날짜 형식에 문제 있습니다.'

        if error is None:
            if sales_data_result['error'] is None:
                context['month_price_data'] = sales_data_result['month_price_data']
            else:
                error = sales_data_result['error']

        if error is not None:
            logger.error(self.request.user.first_name + '[' + str(self.request.user.id) + ']' + error)
            # messages.error(self.request, error)
            context['messageArray'] = error

        return context


class GetSalesInfoViewAjax(LoginRequiredMixin, TemplateView):
    template_name = "ajax/detail_sales_data_ajax.json"

    def get_context_data(self, **kwargs):
        context = super(GetSalesInfoViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        month_date = self.request.GET.get('month_date', '')
        error = None
        sales_data_result = {}
        if month_date == '' or month_date is None:
            error = '조회하고자 하는 날짜를 선택해주세요.'
        if error is None:
            try:
                month_first_day = datetime.datetime.strptime(month_date, '%Y-%m-%d')
                month_first_day = month_first_day.replace(day=1)
                sales_data_result = get_sales_info(class_id, month_first_day)
            except TypeError:
                error = '날짜 형식에 문제 있습니다.'
            except ValueError:
                error = '날짜 형식에 문제 있습니다.'
        if error is None:
            if sales_data_result['error'] is None:
                context['price_data'] = sales_data_result['price_data']
            else:
                error = sales_data_result['error']

        if error is not None:
            logger.error(self.request.user.first_name + '[' + str(self.request.user.id) + ']' + error)
            # messages.error(self.request, error)
            context['messageArray'] = error

        return context


class GetStatsMemberListViewAjax(LoginRequiredMixin, TemplateView):
    template_name = "ajax/summary_member_data_ajax.json"

    def get_context_data(self, **kwargs):
        context = {}
        class_id = self.request.session.get('class_id', '')
        start_date = self.request.GET.get('start_date', '')
        end_date = self.request.GET.get('end_date', '')

        error = None
        if start_date == '' or start_date is None:
            error = '시작 일자를 선택해주세요.'
        elif end_date == '' or end_date is None:
            error = '종료 일자를 선택해주세요.'
        if error is None:
            try:
                finish_date = datetime.datetime.strptime(end_date, '%Y-%m-%d')
                month_first_day = datetime.datetime.strptime(start_date, '%Y-%m-%d')
                context = get_stats_member_data(class_id, month_first_day, finish_date)
            except TypeError:
                error = '날짜 형식에 문제 있습니다.'
            except ValueError:
                error = '날짜 형식에 문제 있습니다.'

        if error is None:
            error = context['error']

        if error is not None:
            logger.error(self.request.user.first_name + '[' + str(self.request.user.id) + ']' + error)
            # messages.error(self.request, error)
            context['messageArray'] = error
        return context
