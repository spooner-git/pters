import logging

import collections
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.mail import EmailMessage
from django.db.models import Q
from django.db.models.expressions import RawSQL
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views import View
from django.views.generic import TemplateView

from configs.const import USE
from .models import QATb, BoardTb, NoticeTb, QACommentTb

logger = logging.getLogger(__name__)


def add_qa_info_logic(request):

    qa_type_cd = request.POST.get('inquire_type', '')
    title = request.POST.get('inquire_subject', '')
    contents = request.POST.get('inquire_body', '')
    # next_page = request.POST.get('next_page')
    context = {}

    error = None

    if qa_type_cd == '' or qa_type_cd is None:
        error = '문의 유형을 선택해주세요.'

    if error is None:
        qa_info = QATb(member_id=request.user.id, qa_type_cd=qa_type_cd, title=title, contents=contents,
                       email_address=request.user.email,
                       status_type_cd='QA_WAIT', use=USE)
        qa_info.save()

    # if error is None:
        # email = EmailMessage('[PTERS 질문]'+request.user.first_name+'회원-'+title,
        #                      '질문 유형:'+qa_type_cd+'\n\n'+contents + '\n\n' + request.user.email +
        #                      '\n\n' + str(timezone.now()),
        #                      to=['support@pters.co.kr'])
        # email.send()

        # return redirect(next_page)
    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        # messages.error(request, error)
        messages.info(request, qa_type_cd+'/'+title+'/'+contents)
        context['messageArray'] = error
        # return redirect(next_page)
    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})


class GetQADataView(LoginRequiredMixin, TemplateView):
    template_name = 'ajax/qa_data_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetQADataView, self).get_context_data(**kwargs)
        query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `QA_TB`.`QA_TYPE_CD`"
        query_status = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `QA_TB`.`STATUS`"
        qa_list = QATb.objects.select_related(
            'member').filter(member_id=self.request.user.id, use=USE
                             ).annotate(qa_type_cd_name=RawSQL(query_type_cd, []),
                                        status_type_cd_name=RawSQL(query_status, [])
                                        ).order_by('reg_dt')
        for qa_info in qa_list:
            if qa_info.read == 0 and qa_info.status_type_cd == 'QA_COMPLETE':
                qa_info.read = 1
                qa_info.save()
            qa_info.contents = qa_info.contents.replace('\n', '<br/>')
        context['qa_data'] = qa_list

        return context


class ClearQADataView(LoginRequiredMixin, TemplateView):
    template_name = 'ajax/qa_data_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(ClearQADataView, self).get_context_data(**kwargs)
        qa_list = QATb.objects.filter(member_id=self.request.user.id, read=0,
                                      status_type_cd='QA_COMPLETE', use=USE).order_by('reg_dt')
        qa_list.update(read=1)
        context['qa_data'] = qa_list

        return context


class GetNoticeDataView(LoginRequiredMixin, View):

    def get(self, request):
        notice_type_cd = request.GET.getlist('notice_type[]')
        member_type_cd = request.session.get('group_name')

        query_notice_type_list = Q()
        for notice_type_cd_info in notice_type_cd:
            query_notice_type_list |= Q(notice_type_cd=notice_type_cd_info)
        query_notice_group_cd = Q(to_member_type_cd='ALL') | Q(to_member_type_cd=member_type_cd)

        query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `NOTICE_TB`.`NOTICE_TYPE_CD`"
        notice_data = NoticeTb.objects.filter(query_notice_type_list, query_notice_group_cd,
                                              use=USE
                                              ).annotate(notice_type_cd_name=RawSQL(query_type_cd, []),
                                                         ).order_by('-reg_dt')
        notice_list = []
        for notice_info in notice_data:
            notice_list.append({'notice_id': notice_info.notice_id,
                                'notice_type_cd': notice_info.notice_type_cd,
                                'notice_type_cd_name': notice_info.notice_type_cd_name,
                                'notice_title': notice_info.title,
                                'notice_contents': notice_info.contents,
                                'notice_to_member_type_cd': notice_info.to_member_type_cd,
                                'notice_hits': notice_info.hits,
                                'notice_mod_dt': str(notice_info.mod_dt),
                                'notice_reg_dt': str(notice_info.reg_dt),
                                'notice_use': notice_info.use})

        return JsonResponse({'notice_data': notice_list}, json_dumps_params={'ensure_ascii': True})


class GetQACommentDataView(LoginRequiredMixin, View):

    def get(self, request):
        qa_id = request.GET.get('qa_id')
        qa_comment_data = QACommentTb.objects.select_related('qa_tb', 'member').filter(qa_tb_id=qa_id,
                                                                                       use=USE).order_by('reg_dt')

        qa_comment_list = []
        for qa_comment_info in qa_comment_data:
            qa_comment_list.append({'qa_comment_id': qa_comment_info.qa_comment_id,
                                    'qa_comment_title': qa_comment_info.title,
                                    'qa_comment_contents': qa_comment_info.contents,
                                    'qa_comment_member_name': qa_comment_info.member.name,
                                    'qa_comment_mod_dt': str(qa_comment_info.mod_dt),
                                    'qa_comment_reg_dt': str(qa_comment_info.reg_dt),
                                    'qa_comment_use': qa_comment_info.use})
            if qa_comment_info.read == 0:
                qa_comment_info.read = 1
                qa_comment_info.save()

        return JsonResponse({'qa_comment_data': qa_comment_list}, json_dumps_params={'ensure_ascii': True})
