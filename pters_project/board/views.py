import logging
from django.utils import timezone
from django.contrib import messages
from django.core.mail import EmailMessage
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
from configs.const import USE

from .models import QATb

logger = logging.getLogger(__name__)


@csrf_exempt
def question_reg_logic(request):

    qa_type_cd = request.POST.get('inquire_type', '')
    title = request.POST.get('inquire_subject', '')
    contents = request.POST.get('inquire_body', '')
    next_page = request.POST.get('next_page')
    error = None

    if qa_type_cd == '' or qa_type_cd is None:
        error = '문의 유형을 선택해주세요.'

    if error is None:
        qa_info = QATb(member_id=request.user.id, qa_type_cd=qa_type_cd, title=title, contents=contents,
                       status='0', use=USE)
        qa_info.save()

    if error is None:
        email = EmailMessage('[PTERS 질문]'+request.user.last_name+request.user.first_name+'회원-'+title,
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
