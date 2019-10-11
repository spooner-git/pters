import logging

import collections
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin

# Create your views here.
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views import View
from django.views.generic import TemplateView

from board.models import QATb, NoticeTb
from configs.const import USE
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
        # start_time = timezone.now()
        qa_data_dict = collections.OrderedDict()
        qa_data = QATb.objects.select_related('member').filter(use=USE).order_by('-reg_dt')

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
        # end_time = timezone.now()
        # print(str(end_time-start_time))
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


class AddNoticeInfoView(LoginRequiredMixin, AccessTestMixin, View):

    def post(self, request):
        notice_type_cd = request.POST.get('notice_type_cd', '')
        title = request.POST.get('title', '')
        contents = request.POST.get('contents', '')
        to_member_type_cd = request.POST.get('to_member_type_cd')
        member_type_cd = request.session.get('group_name')

        context = {}
        error = None
        if member_type_cd != 'admin':
            error = '관리자만 접근 가능합니다.'

        if notice_type_cd == '' or notice_type_cd is None:
            error = '공지 유형을 선택해주세요.'

        if error is None:
            notice_info = NoticeTb(member_id=request.user.id, notice_type_cd=notice_type_cd,
                                   title=title, contents=contents, to_member_type_cd=to_member_type_cd,
                                   use=USE)
            notice_info.save()

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            # messages.error(request, error)
            context['messageArray'] = error

        return JsonResponse(context, json_dumps_params={'ensure_ascii': True})


class UpdateNoticeInfoView(LoginRequiredMixin, AccessTestMixin, View):

    def post(self, request):
        notice_type_cd = request.POST.get('notice_type_cd', '')
        title = request.POST.get('title', '')
        contents = request.POST.get('contents', '')
        to_member_type_cd = request.POST.get('to_member_type_cd')
        member_type_cd = request.session.get('group_name')

        context = {}
        error = None
        if member_type_cd != 'admin':
            error = '관리자만 접근 가능합니다.'

        if notice_type_cd == '' or notice_type_cd is None:
            error = '공지 유형을 선택해주세요.'

        if error is None:
            notice_info = NoticeTb(member_id=request.user.id, notice_type_cd=notice_type_cd,
                                   title=title, contents=contents, to_member_type_cd=to_member_type_cd,
                                   use=USE)
            notice_info.save()

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            # messages.error(request, error)
            context['messageArray'] = error

        return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
