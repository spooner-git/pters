import logging

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models.expressions import RawSQL
from django.utils import timezone
from django.contrib import messages
from django.core.mail import EmailMessage
from django.shortcuts import redirect

# Create your views here.
from django.views.generic import TemplateView

from configs.const import USE

from .models import QATb

logger = logging.getLogger(__name__)


def add_question_info_logic(request):

    qa_type_cd = request.POST.get('inquire_type', '')
    title = request.POST.get('inquire_subject', '')
    contents = request.POST.get('inquire_body', '')
    next_page = request.POST.get('next_page')
    error = None

    if qa_type_cd == '' or qa_type_cd is None:
        error = '문의 유형을 선택해주세요.'

    if error is None:
        qa_info = QATb(member_id=request.user.id, qa_type_cd=qa_type_cd, title=title, contents=contents,
                       email_address=request.user.email,
                       status_type_cd='QA_WAIT', use=USE)
        qa_info.save()

    if error is None:
        email = EmailMessage('[PTERS 질문]'+request.user.first_name+'회원-'+title,
                             '질문 유형:'+qa_type_cd+'\n\n'+contents + '\n\n' + request.user.email +
                             '\n\n' + str(timezone.now()),
                             to=['support@pters.co.kr'])
        email.send()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        messages.info(request, qa_type_cd+'/'+title+'/'+contents)

        return redirect(next_page)


class GetQuestionDataView(LoginRequiredMixin, TemplateView):
    template_name = 'ajax/qa_data_ajax.html'

    def get_context_data(self, **kwargs):
        # start_time = timezone.now()
        # context = {}
        context = super(GetQuestionDataView, self).get_context_data(**kwargs)
        query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `QA_TB`.`QA_TYPE_CD`"
        query_status = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `QA_TB`.`STATUS`"
        question_list = QATb.objects.filter(member_id=self.request.user.id, use=USE
                                            ).annotate(qa_type_cd_name=RawSQL(query_type_cd, []),
                                                       status_type_cd_name=RawSQL(query_status, [])
                                                       ).order_by('-reg_dt')
        context['question_data'] = question_list

        return context

