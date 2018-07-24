import datetime
import logging

# Create your views here.
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin

from configs.const import STATS_SALES
from stats.func import get_sales_data, get_sales_info, get_stats_member_data

logger = logging.getLogger(__name__)


class IndexView(TemplateView):
    template_name = 'index_stats.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        return context


@method_decorator(csrf_exempt, name='dispatch')
class GetSalesListViewAjax(LoginRequiredMixin, View):
    template_name = "ajax/summary_sales_data_ajax.html"

    def post(self, request):
        context = {}
        class_id = request.POST.get('class_id', '')
        start_date = request.POST.get('start_date', '')
        end_date = request.POST.get('end_date', '')

        error = None
        if start_date == '' or start_date is None:
            error = '시작 일자를 선택해주세요.'
        elif end_date == '' or end_date is None:
            error = '종료 일자를 선택해주세요.'
        try:
            finish_date = datetime.datetime.strptime(end_date, '%Y-%m-%d')
            month_first_day = datetime.datetime.strptime(start_date, '%Y-%m-%d')
        except TypeError:
            error = '날짜 형식에 문제 있습니다.'
        except ValueError:
            error = '날짜 형식에 문제 있습니다.'

        sales_data_result = get_sales_data(class_id, month_first_day, finish_date)
        if sales_data_result['error'] is None:
            context['month_price_data'] = sales_data_result['month_price_data']
        else:
            error = sales_data_result['error']

        if error is not None:
            logger.error(request.user.last_name + ' ' + request.user.first_name + '['
                         + str(request.user.id) + ']' + error)
            messages.error(request, error)
        else:
            request.session['sales_start_date'] = str(month_first_day.date())
            request.session['sales_finish_date'] = str(finish_date.date())

        return render(request, self.template_name, context)


@method_decorator(csrf_exempt, name='dispatch')
class GetSalesInfoViewAjax(LoginRequiredMixin, View):
    template_name = "ajax/detail_sales_data_ajax.html"

    def post(self, request):
        context = {}
        class_id = request.POST.get('class_id', '')
        # class_id = request.session.get('class_id', '')
        month_date = request.POST.get('month_date', '')
        error = None
        if month_date == '' or month_date is None:
            error = '조회하고자 하는 날짜를 선택해주세요.'

        try:
            month_first_day = datetime.datetime.strptime(month_date, '%Y-%m-%d')
        except TypeError:
            error = '날짜 형식에 문제 있습니다.'
        except ValueError:
            error = '날짜 형식에 문제 있습니다.'

        sales_data_result = get_sales_info(class_id, month_first_day)

        if sales_data_result['error'] is None:
            context['price_data'] = sales_data_result['price_data']
        else:
            error = sales_data_result['error']

        if error is not None:
            logger.error(request.user.last_name + ' ' + request.user.first_name + '['
                         + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return render(request, self.template_name, context)


@method_decorator(csrf_exempt, name='dispatch')
class GetStatsMemberListViewAjax(LoginRequiredMixin, View):
    template_name = "ajax/summary_member_data_ajax.html"

    def post(self, request):
        context = {}
        class_id = request.POST.get('class_id', '')
        start_date = request.POST.get('start_date', '')
        end_date = request.POST.get('end_date', '')

        error = None
        if start_date == '' or start_date is None:
            error = '시작 일자를 선택해주세요.'
        elif end_date == '' or end_date is None:
            error = '종료 일자를 선택해주세요.'
        try:
            finish_date = datetime.datetime.strptime(end_date, '%Y-%m-%d')
            month_first_day = datetime.datetime.strptime(start_date, '%Y-%m-%d')
        except TypeError:
            error = '날짜 형식에 문제 있습니다.'
        except ValueError:
            error = '날짜 형식에 문제 있습니다.'

        if error is None:
            context = get_stats_member_data(class_id, month_first_day, finish_date)
            error = context['error']
        if error is not None:
            logger.error(request.user.last_name + ' ' + request.user.first_name + '['
                         + str(request.user.id) + ']' + error)
            messages.error(request, error)
        return render(request, self.template_name, context)
