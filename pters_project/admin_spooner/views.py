import logging

import collections
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin

# Create your views here.
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.utils.datastructures import MultiValueDictKeyError
from django.views import View
from django.views.generic import TemplateView

from admin_spooner.functions import func_upload_board_content_image_logic, func_delete_board_content_image_logic
from board.models import QATb, NoticeTb, QACommentTb
from configs.const import USE, UN_USE
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
        # NOTICE : 공지사항, SYS_USAGE : 사용법 , FAQ : 자주 묻는 질문
        notice_type_cd = request.POST.get('notice_type_cd', '')
        title = request.POST.get('title', '')
        contents = request.POST.get('contents', '')
        to_member_type_cd = request.POST.get('to_member_type_cd')
        use = request.POST.get('use', USE)
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
                                   use=use)
            notice_info.save()

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            # messages.error(request, error)
            context['messageArray'] = error

        return JsonResponse(context, json_dumps_params={'ensure_ascii': True})


class AddQACommentInfoView(LoginRequiredMixin, AccessTestMixin, View):

    def post(self, request):
        qa_id = request.POST.get('qa_id')
        title = request.POST.get('title', '')
        contents = request.POST.get('contents', '')
        # QA_WAIT : 답변 대기 / QA_COMPLETE : 답변 완료
        status_type_cd = request.POST.get('status_type_cd', 'QA_COMPLETE')
        member_type_cd = request.session.get('group_name')

        context = {}
        error = None
        qa_info = None

        if member_type_cd != 'admin':
            error = '관리자만 접근 가능합니다.'

        if qa_id is None or qa_id == '':
            error = '변경할 문의 글을 선택해주세요.'

        if error is None:
            try:
                qa_info = QATb.objects.get(qa_id=qa_id)
            except ObjectDoesNotExist:
                error = '문의 글을 불러오지 못했습니다.'

        if error is None:
            qa_info.status_type_cd = status_type_cd
            qa_info.save()

        if error is None:
            use = UN_USE
            if status_type_cd == 'QA_COMPLETE':
                use = USE
            qa_comment_info = QACommentTb(qa_tb_id=qa_id, member_id=request.user.id, title=title, contents=contents,
                                          use=use)
            qa_comment_info.save()

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            # messages.error(request, error)
            context['messageArray'] = error

        return JsonResponse(context, json_dumps_params={'ensure_ascii': True})


class UpdateQACommentInfoView(LoginRequiredMixin, AccessTestMixin, View):

    def post(self, request):
        qa_comment_id = request.POST.get('qa_comment_id')
        title = request.POST.get('title', '')
        contents = request.POST.get('contents', '')
        # QA_WAIT : 답변 대기 / QA_COMPLETE : 답변 완료
        status_type_cd = request.POST.get('status_type_cd', 'QA_COMPLETE')
        member_type_cd = request.session.get('group_name')

        context = {}
        error = None
        qa_comment_info = None

        if member_type_cd != 'admin':
            error = '관리자만 접근 가능합니다.'

        if qa_comment_id is None or qa_comment_id == '':
            error = '변경할 문의 답변 글을 선택해주세요.'

        if error is None:
            try:
                qa_comment_info = QACommentTb.objects.get(qa_comment_id=qa_comment_id)
            except ObjectDoesNotExist:
                error = '문의 답변 글을 불러오지 못했습니다.'

        if error is None:
            qa_comment_info.qa_tb.status_type_cd = status_type_cd
            qa_comment_info.qa_tb.save()

        if error is None:
            use = UN_USE
            if status_type_cd == 'QA_COMPLETE':
                use = USE
            qa_comment_info.member_id = request.user.id
            qa_comment_info.title = title
            qa_comment_info.contents = contents
            qa_comment_info.use=use
            qa_comment_info.save()

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            # messages.error(request, error)
            context['messageArray'] = error

        return JsonResponse(context, json_dumps_params={'ensure_ascii': True})


class DeleteQACommentInfoView(LoginRequiredMixin, AccessTestMixin, View):

    def post(self, request):
        qa_comment_id = request.POST.get('qa_comment_id')
        member_type_cd = request.session.get('group_name')

        context = {}
        error = None
        qa_comment_info = None

        if member_type_cd != 'admin':
            error = '관리자만 접근 가능합니다.'

        if qa_comment_id is None or qa_comment_id == '':
            error = '변경할 문의 답변 글을 선택해주세요.'

        if error is None:
            try:
                qa_comment_info = QACommentTb.objects.get(qa_comment_id=qa_comment_id)
            except ObjectDoesNotExist:
                error = '문의 답변 글을 불러오지 못했습니다.'

        if error is None:
            qa_comment_info.qa_tb.status_type_cd = 'QA_WAIT'
            qa_comment_info.qa_tb.save()
            qa_comment_info.delete()

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            # messages.error(request, error)
            context['messageArray'] = error

        return JsonResponse(context, json_dumps_params={'ensure_ascii': True})


class GetQACommentDataView(LoginRequiredMixin, View):

    def get(self, request):
        qa_id = request.GET.get('qa_id')
        qa_comment_data = QACommentTb.objects.select_related('qa_tb',
                                                             'member').filter(qa_tb_id=qa_id).order_by('reg_dt')

        qa_comment_list = []
        for qa_comment_info in qa_comment_data:
            qa_comment_list.append({'qa_comment_id': qa_comment_info.qa_comment_id,
                                    'qa_comment_title': qa_comment_info.title,
                                    'qa_comment_contents': qa_comment_info.contents,
                                    'qa_comment_member_name': qa_comment_info.member.name,
                                    'qa_comment_mod_dt': str(qa_comment_info.mod_dt),
                                    'qa_comment_reg_dt': str(qa_comment_info.reg_dt),
                                    'qa_comment_use': qa_comment_info.use})

        return JsonResponse({'qa_comment_data': qa_comment_list}, json_dumps_params={'ensure_ascii': True})


class UpdateNoticeInfoView(LoginRequiredMixin, AccessTestMixin, View):

    def post(self, request):
        notice_id = request.POST.get('notice_id')
        notice_type_cd = request.POST.get('notice_type_cd', '')
        title = request.POST.get('title', '')
        contents = request.POST.get('contents', '')
        to_member_type_cd = request.POST.get('to_member_type_cd')
        use = request.POST.get('use', USE)
        member_type_cd = request.session.get('group_name')

        context = {}
        error = None
        notice_info = None

        if member_type_cd != 'admin':
            error = '관리자만 접근 가능합니다.'

        if notice_id is None or notice_id == '':
            error = '변경할 게시글을 선택해주세요.'

        if notice_type_cd == '' or notice_type_cd is None:
            error = '공지 유형을 선택해주세요.'

        if error is None:
            try:
                notice_info = NoticeTb.objects.get(notice_id=notice_id)
            except ObjectDoesNotExist:
                error = '게시글을 불러오지 못했습니다.'

        if error is None:
            notice_info.member_id = request.user.id
            notice_info.notice_type_cd = notice_type_cd
            notice_info.title = title
            notice_info.contents = contents
            notice_info.to_member_type_cd = to_member_type_cd
            notice_info.use = use
            notice_info.save()

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            # messages.error(request, error)
            context['messageArray'] = error

        return JsonResponse(context, json_dumps_params={'ensure_ascii': True})


class DeleteNoticeInfoView(LoginRequiredMixin, AccessTestMixin, View):

    def post(self, request):
        notice_id = request.POST.get('notice_id')
        member_type_cd = request.session.get('group_name')

        context = {}
        error = None
        notice_info = None

        if member_type_cd != 'admin':
            error = '관리자만 접근 가능합니다.'

        if notice_id is None or notice_id == '':
            error = '변경할 게시글을 선택해주세요.'

        if error is None:
            try:
                notice_info = NoticeTb.objects.get(notice_id=notice_id)
            except ObjectDoesNotExist:
                error = '게시글을 불러오지 못했습니다.'

        if error is None:
            notice_info.delete()

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            # messages.error(request, error)
            context['messageArray'] = error

        return JsonResponse(context, json_dumps_params={'ensure_ascii': True})


class UpdateQaStatusInfoView(LoginRequiredMixin, AccessTestMixin, View):

    def post(self, request):
        qa_id = request.POST.get('qa_id')
        # QA_WAIT : 답변 대기 / QA_COMPLETE : 답변 완료
        title = request.POST.get('title', '')
        contents = request.POST.get('contents', '')

        status_type_cd = request.POST.get('status_type_cd', 'QA_COMPLETE')
        member_type_cd = request.session.get('group_name')

        context = {}
        error = None
        qa_info = None

        if member_type_cd != 'admin':
            error = '관리자만 접근 가능합니다.'

        if qa_id is None or qa_id == '':
            error = '변경할 문의 글을 선택해주세요.'

        if error is None:
            try:
                qa_info = QATb.objects.get(qa_id=qa_id)
            except ObjectDoesNotExist:
                error = '문의 글을 불러오지 못했습니다.'

        if error is None:
            qa_info.status_type_cd = status_type_cd
            qa_info.save()

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            # messages.error(request, error)
            context['messageArray'] = error

        return JsonResponse(context, json_dumps_params={'ensure_ascii': True})


def update_admin_board_content_img_logic(request):
    error_message = None
    img_url = None
    context = {}
    if request.method == 'POST':
        # 대표 이미지 설정
        try:
            img_url = func_upload_board_content_image_logic(request.FILES['content_img_file'],
                                                            request.POST.get('content_img_file_name'),
                                                            request.POST.get('board_type_cd'),
                                                            request.user.id, 'admin')
        except MultiValueDictKeyError:
            img_url = None
    else:
        error_message = '잘못된 요청입니다.'

    if img_url is None:
        error_message = '이미지 업로드중 오류가 발생했습니다.'

    if error_message is not None:
        messages.error(request, error_message)
        context['messageArray'] = error_message
    else:
        context['img_url'] = img_url
    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})


def delete_admin_board_content_img_logic(request):
    # error_message = None
    # img_url = None
    context = {}
    if request.method == 'POST':
        # 대표 이미지 설정
        try:
            error_message = func_delete_board_content_image_logic(request.POST.get('content_img_file_name'))
        except MultiValueDictKeyError:
            error_message = '이미지 삭제중 오류가 발생했습니다.'
    else:
        error_message = '잘못된 요청입니다.'

    if error_message is not None:
        messages.error(request, error_message)
        context['messageArray'] = error_message
    # else:
    #     context['img_url'] = img_url
    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
