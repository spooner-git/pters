import logging

import collections
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin

# Create your views here.
from django.http import JsonResponse
from django.views import View
from django.views.generic import TemplateView

from board.models import QATb, NoticeTb
from configs.views import AccessTestMixin

logger = logging.getLogger(__name__)


class IndexView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'admin_index.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        error = None

        qa_list = QATb.objects.filter().order_by('-reg_dt')
        notice_list = NoticeTb.objects.filter().order_by('-reg_dt')
        context['qa_list'] = qa_list
        context['notice_list'] = notice_list
        if error is not None:
            logger.error(self.request.user.first_name + '[' + str(self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        return context


class GetQaAllView(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        qa_data_dict = collections.OrderedDict()
        qa_data = QATb.objects.filter().order_by('-reg_dt')

        for qa_info in qa_data:
            qa_data_dict[qa_info.qa_id] = {'qa_id': qa_info.qa_id,
                                           'qa_member_id': qa_info.member.member_id,
                                           'qa_member_name': qa_info.member.name,
                                           'qa_email_address': qa_info.email_address,
                                           'qa_type_cd': qa_info.qa_type_cd,
                                           'qa_title': qa_info.title,
                                           'qa_contents': qa_info.contents,
                                           'qa_status_type_cd': qa_info.status_type_cd,
                                           'qa_read': qa_info.read,
                                           'qa_mod_dt': qa_info.mod_dt,
                                           'qa_reg_dt': qa_info.reg_dt}

        return JsonResponse(qa_data_dict, json_dumps_params={'ensure_ascii': True})


class GetNoticeAllView(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        notice_data_dict = collections.OrderedDict()
        notice_data = NoticeTb.objects.filter().order_by('-reg_dt')

        for notice_info in notice_data:
            notice_data_dict[notice_info.notice_id] = {'notice_id': notice_info.notice_id,
                                                       'notice_type_cd': notice_info.notice_type_cd,
                                                       'notice_title': notice_info.title,
                                                       'notice_contents': notice_info.contents,
                                                       'notice_to_member_type_cd': notice_info.to_member_type_cd,
                                                       'notice_hits': notice_info.hits,
                                                       'notice_mod_dt': notice_info.mod_dt,
                                                       'notice_reg_dt': notice_info.reg_dt,
                                                       'notice_use': notice_info.use}

        return JsonResponse(notice_data_dict, json_dumps_params={'ensure_ascii': True})
