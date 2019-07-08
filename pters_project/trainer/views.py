# Create your views here.
import datetime
import json
import logging
import random
import urllib
import collections
from operator import attrgetter

from urllib.parse import quote

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.db.models import Q
from django.db.models.expressions import RawSQL
from django.http import HttpResponse, request
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views import View
from django.views.generic import TemplateView
from django.views.generic.base import RedirectView
from el_pagination.views import AjaxListView
from openpyxl import Workbook
from openpyxl.styles import Font
from openpyxl.writer.excel import save_virtual_workbook

from configs.const import ON_SCHEDULE_TYPE, OFF_SCHEDULE_TYPE, USE, UN_USE, AUTO_FINISH_OFF, \
    MEMBER_RESERVE_PROHIBITION_ON, SORT_MEMBER_NAME, SORT_REMAIN_COUNT, SORT_START_DATE, SORT_ASC, SORT_PACKAGE_TYPE,\
    SORT_REG_COUNT, GROUP_SCHEDULE

from configs.views import AccessTestMixin
from login.views import add_member_no_email_func

from board.models import BoardTb
from login.models import MemberTb, LogTb, CommonCdTb, SnsInfoTb
from schedule.models import ScheduleTb, RepeatScheduleTb, HolidayTb
from trainee.models import LectureTb, MemberLectureTb
from .models import ClassLectureTb, GroupTb, GroupLectureTb, ClassTb, MemberClassTb, BackgroundImgTb, SettingTb, \
    PackageTb, PackageGroupTb, CenterTrainerTb

from schedule.functions import func_refresh_group_status, func_refresh_lecture_count, \
    func_get_trainer_attend_schedule, func_get_group_lecture_id, func_check_group_available_member_before, \
    func_add_schedule, func_check_group_available_member_after, func_get_trainer_schedule_all
from stats.functions import get_sales_data
from .functions import func_get_trainer_setting_list, func_add_lecture_info, \
    func_delete_lecture_info, func_get_member_ing_list, func_get_member_end_list, \
    func_get_class_member_ing_list, func_get_class_member_end_list, \
    func_get_member_info, func_get_member_from_lecture_list, func_get_package_info, func_get_group_info

logger = logging.getLogger(__name__)


class IndexView(LoginRequiredMixin, AccessTestMixin, RedirectView):
    url = '/trainer/class_select/'

    def get(self, request, **kwargs):

        class_id = request.session.get('class_id', '')
        class_auth_data = MemberClassTb.objects.select_related('class_tb'
                                                               ).filter(member_id=request.user.id,
                                                                        auth_cd='VIEW', use=USE)

        error = None
        if class_id is None or class_id == '':
            if len(class_auth_data) == 0:
                self.url = '/trainer/add_class/'
            elif len(class_auth_data) == 1:
                self.url = '/trainer/trainer_main/'
                for class_info in class_auth_data:
                    request.session['class_id'] = class_info.class_tb_id
                    request.session['class_hour'] = class_info.class_tb.class_hour
                    request.session['class_type_code'] = class_info.class_tb.subject_cd
                    request.session['class_type_name'] = class_info.class_tb.get_class_type_cd_name()
                    request.session['class_center_name'] = class_info.class_tb.get_center_name()

            else:
                self.url = '/trainer/class_select/'
        else:
            self.url = '/trainer/trainer_main/'

        # get_setting_info(request)
        if error is not None:
            logger.error(request.user.last_name + ' ' + request.user.first_name + '['
                         + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return super(IndexView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(IndexView, self).get_redirect_url(*args, **kwargs)


class GetErrorInfoView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainer_error_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetErrorInfoView, self).get_context_data(**kwargs)
        return context


# 일정 기능 ############### ############### ############### ############### ############### ############### ##############

class GetTrainerScheduleAllView(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = self.request.session.get('class_id', '')
        date = request.GET.get('date', '')
        day = request.GET.get('day', '')
        today = datetime.date.today()

        if date != '':
            today = datetime.datetime.strptime(date, '%Y-%m-%d')
        if day == '':
            day = 46
        start_date = today - datetime.timedelta(days=int(day))
        end_date = today + datetime.timedelta(days=int(day))
        all_schedule_data = func_get_trainer_schedule_all(class_id, start_date, end_date)

        return JsonResponse(all_schedule_data, json_dumps_params={'ensure_ascii': True})


class GetGroupMemberScheduleListViewAjax(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = self.request.session.get('class_id', '')
        group_schedule_id = request.GET.get('group_schedule_id', '')
        error = None
        group_schedule_list = []
        if group_schedule_id is None or group_schedule_id == '':
            error = '일정 정보를 불러오지 못했습니다.'

        if error is None:
            group_schedule_data = ScheduleTb.objects.select_related(
                'lecture_tb__member').filter(class_tb_id=class_id, group_schedule_id=group_schedule_id,
                                             use=USE).order_by('start_dt')
            for group_schedule_info in group_schedule_data:
                schedule_type = GROUP_SCHEDULE
                schedule_info = {'schedule_id': group_schedule_info.schedule_id,
                                 'member_name': group_schedule_info.lecture_tb.member.name,
                                 'schedule_type': schedule_type,
                                 'start_dt': str(group_schedule_info.start_dt),
                                 'end_dt': str(group_schedule_info.end_dt),
                                 'state_cd': group_schedule_info.state_cd,
                                 'note': group_schedule_info.note
                                 }
                group_schedule_list.append(schedule_info)

        if error is not None:
            logger.error(request.user.first_name + ' ' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return JsonResponse({'group_member_schedule_data': group_schedule_list},
                            json_dumps_params={'ensure_ascii': True})


class GetMemberScheduleAllView(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = self.request.session.get('class_id', '')
        member_id = request.GET.get('member_id', None)
        error = None
        ordered_schedule_dict = collections.OrderedDict()

        if member_id is None or member_id == '':
            error = '회원 정보를 불러오지 못했습니다.'

        if error is None:
            # 수강 정보 불러 오기
            query_auth = "select AUTH_CD from CLASS_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                         "`SCHEDULE_TB`.`LECTURE_TB_ID` and B.CLASS_TB_ID = " + str(class_id) + \
                         " and B.USE=1"

            member_schedule_data = ScheduleTb.objects.select_related(
                'lecture_tb__member',
                'group_tb').filter(
                class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE, use=USE, lecture_tb__member_id=member_id,
                lecture_tb__use=USE).annotate(auth_cd=RawSQL(query_auth,
                                                             [])).filter(auth_cd='VIEW').order_by(
                '-lecture_tb__start_date',
                '-lecture_tb__reg_dt',
                '-start_dt')

            schedule_list = []
            temp_lecture_id = None
            for member_schedule_info in member_schedule_data:
                lecture_id = member_schedule_info.lecture_tb.lecture_id
                group_info = member_schedule_info.group_tb
                schedule_type = member_schedule_info.en_dis_type
                if temp_lecture_id != lecture_id:
                    temp_lecture_id = lecture_id
                    schedule_list = []

                try:
                    group_id = group_info.group_id
                    group_name = group_info.name
                    group_max_member_num = group_info.member_num
                    schedule_type = 2
                except AttributeError:
                    group_id = ''
                    group_name = ''
                    group_max_member_num = ''

                schedule_info = {'schedule_id': member_schedule_info.schedule_id,
                                 'group_id': group_id,
                                 'group_name': group_name,
                                 'group_max_member_num': group_max_member_num,
                                 'schedule_type': schedule_type,
                                 'start_dt': str(member_schedule_info.start_dt),
                                 'end_dt': str(member_schedule_info.end_dt),
                                 'state_cd': member_schedule_info.state_cd,
                                 'note': member_schedule_info.note
                                 }
                schedule_list.append(schedule_info)
                ordered_schedule_dict[lecture_id] = schedule_list

        else:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return JsonResponse(ordered_schedule_dict, json_dumps_params={'ensure_ascii': True})


class GetGroupScheduleListView(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = self.request.session.get('class_id', '')
        group_id = request.GET.get('group_id', None)
        error = None

        if group_id is None or group_id == '':
            error = '회원 정보를 불러오지 못했습니다.'

        if error is None:

            query = "select count(B.ID) from SCHEDULE_TB as B where B.GROUP_SCHEDULE_ID = `SCHEDULE_TB`.`ID` " \
                    "AND B.STATE_CD != \'PC\' AND B.USE=1"

            schedule_data = ScheduleTb.objects.select_related(
                'lecture_tb__member',
                'group_tb').filter(class_tb=class_id, group_tb_id=group_id, group_schedule_id__isnull=True,
                                   use=USE).annotate(group_current_member_num=RawSQL(query,
                                                                                     [])).order_by('start_dt', 'reg_dt')

            group_schedule_list = []
            for schedule_info in schedule_data:
                schedule_type = schedule_info.en_dis_type

                try:
                    group_id = schedule_info.group_tb.group_id
                    group_name = schedule_info.group_tb.name
                    group_max_member_num = schedule_info.group_tb.member_num
                    group_current_member_num = schedule_info.group_current_member_num
                    schedule_type = 2
                except AttributeError:
                    group_id = ''
                    group_name = ''
                    group_max_member_num = ''
                    group_current_member_num = ''

                group_schedule_list.append({'schedule_id': schedule_info.schedule_id,
                                            'start_dt': str(schedule_info.start_dt),
                                            'end_dt': str(schedule_info.end_dt),
                                            'state_cd': schedule_info.state_cd,
                                            'schedule_type': schedule_type,
                                            'note': schedule_info.note,
                                            'group_id': group_id,
                                            'group_name': group_name,
                                            'group_max_member_num': group_max_member_num,
                                            'group_current_member_num': group_current_member_num})

        else:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return JsonResponse({'group_schedule_list': group_schedule_list}, json_dumps_params={'ensure_ascii': True})


class GetOffRepeatScheduleView(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = self.request.session.get('class_id', '')

        off_repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id, en_dis_type=OFF_SCHEDULE_TYPE)
        off_repeat_schedule_list = []
        for off_repeat_schedule_info in off_repeat_schedule_data:
            off_repeat_schedule = {'repeat_schedule_id': off_repeat_schedule_info.repeat_schedule_id,
                                   'repeat_type_cd': off_repeat_schedule_info.repeat_type_cd,
                                   'start_date': off_repeat_schedule_info.start_date,
                                   'end_date': off_repeat_schedule_info.end_date,
                                   'start_time': off_repeat_schedule_info.start_time,
                                   'end_time': off_repeat_schedule_info.end_time,
                                   'time_duration': off_repeat_schedule_info.time_duration,
                                   'state_cd': off_repeat_schedule_info.state_cd}
            off_repeat_schedule_list.append(off_repeat_schedule)

        messages.error(request, '')

        return JsonResponse({'off_repeat_schedule_data': off_repeat_schedule_list},
                            json_dumps_params={'ensure_ascii': True})


class GetGroupRepeatScheduleListViewAjax(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = request.session.get('class_id', '')
        group_id = self.request.GET.get('group_id', '')

        group_repeat_schedule_list = []
        group_repeat_schedule_data = RepeatScheduleTb.objects.select_related(
            'group_tb').filter(class_tb_id=class_id, group_tb_id=group_id).order_by('start_date')

        for group_repeat_schedule_info in group_repeat_schedule_data:

            group_repeat_schedule = {'repeat_schedule_id': group_repeat_schedule_info.repeat_schedule_id,
                                     'repeat_type_cd': group_repeat_schedule_info.repeat_type_cd,
                                     'start_date': group_repeat_schedule_info.start_date,
                                     'end_date': group_repeat_schedule_info.end_date,
                                     'start_time': group_repeat_schedule_info.start_time,
                                     'end_time': group_repeat_schedule_info.end_time,
                                     'time_duration': group_repeat_schedule_info.time_duration,
                                     'state_cd': group_repeat_schedule_info.state_cd,
                                     'group_repeat_schedule_id': group_repeat_schedule_info.group_repeat_schedule_id}
            group_repeat_schedule_list.append(group_repeat_schedule)

        return JsonResponse({'group_repeat_schedule_data': group_repeat_schedule_list},
                            json_dumps_params={'ensure_ascii': True})


class GetMemberRepeatScheduleView(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = request.session.get('class_id', '')
        member_id = self.request.GET.get('member_id', None)
        error = None

        if member_id is None or member_id == '':
            error = '회원 정보를 불러오지 못했습니다.'

        member_repeat_schedule_list = []
        if error is None:
            member_repeat_schedule_data = RepeatScheduleTb.objects.select_related(
                'lecture_tb__member', 'group_tb').filter(class_tb_id=class_id,
                                                         lecture_tb__member_id=member_id).order_by('start_date')

            for member_repeat_schedule_info in member_repeat_schedule_data:
                schedule_type = 1
                try:
                    group_id = member_repeat_schedule_info.group_tb.group_id
                    group_name = member_repeat_schedule_info.group_tb.name
                    group_max_member_num = member_repeat_schedule_info.group_tb.member_num
                    schedule_type = 2
                except AttributeError:
                    group_id = ''
                    group_name = ''
                    group_max_member_num = ''

                member_repeat_schedule = {'repeat_schedule_id': member_repeat_schedule_info.repeat_schedule_id,
                                          'repeat_type_cd': member_repeat_schedule_info.repeat_type_cd,
                                          'start_date': member_repeat_schedule_info.start_date,
                                          'end_date': member_repeat_schedule_info.end_date,
                                          'start_time': member_repeat_schedule_info.start_time,
                                          'end_time': member_repeat_schedule_info.end_time,
                                          'time_duration': member_repeat_schedule_info.time_duration,
                                          'state_cd': member_repeat_schedule_info.state_cd,
                                          'group_repeat_schedule_id': member_repeat_schedule_info.group_repeat_schedule_id,
                                          'group_id': group_id,
                                          'group_name': group_name,
                                          'group_max_member_num': group_max_member_num,
                                          'schedule_type': schedule_type}
                member_repeat_schedule_list.append(member_repeat_schedule)
        else:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return JsonResponse({'member_repeat_schedule_data': member_repeat_schedule_list},
                            json_dumps_params={'ensure_ascii': True})


# ############### ############### ############### ############### ############### ############### ##############
# 회원 기능 ############### ############### ############### ############### ############### ############### ##############
class GetMemberInfoView(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = self.request.session.get('class_id', '')
        member_id = request.GET.get('member_id', '')
        error = None

        if member_id == '':
            error = '회원 ID를 입력해주세요.'

        if error is None:
            member_result = func_get_member_info(class_id, request.user.id, member_id)
            error = member_result.error

        if error is not None:
            logger.error(request.user.first_name + ' ' + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return JsonResponse(member_result.member_info, json_dumps_params={'ensure_ascii': True})


class SearchMemberInfoView(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = self.request.session.get('class_id', '')
        search_id = request.GET.get('search_id', '')
        error = None
        user_info = None

        if search_id == '':
            error = '회원 ID를 입력해 주세요.'

        if error is None:
            if len(search_id) < 3:
                error = '3글자 이상 입력해주세요.'

        if error is None:
            try:
                user_info = User.objects.get(username=search_id)
            except ObjectDoesNotExist:
                error = '회원 ID를 확인해 주세요.'

        if error is None:
            member_result = func_get_member_info(class_id, request.user.id, user_info.id)
            error = member_result.error

        if error is not None:
            logger.error(request.user.first_name + ' ' + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return JsonResponse(member_result.member_info, json_dumps_params={'ensure_ascii': True})


class GetMemberListView(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = self.request.session.get('class_id', '')
        keyword = request.GET.get('keyword', '')
        current_member_data = func_get_member_ing_list(class_id, request.user.id, keyword)
        finish_member_data = func_get_member_end_list(class_id, request.user.id, keyword)
        return JsonResponse({'current_member_data': current_member_data,
                             'finish_member_data': finish_member_data},
                            json_dumps_params={'ensure_ascii': True})


class GetMemberIngListViewAjax(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = self.request.session.get('class_id', '')
        page = request.GET.get('page', 0)
        member_sort = request.GET.get('sort_val', SORT_MEMBER_NAME)
        sort_order_by = request.GET.get('sort_order_by', SORT_ASC)
        keyword = request.GET.get('keyword', '')

        current_member_data = func_get_member_ing_list(class_id, request.user.id, keyword)
        finish_member_num = len(func_get_class_member_end_list(class_id, keyword))
        sort_info = int(member_sort)
        if sort_info == SORT_MEMBER_NAME:
            current_member_data = sorted(current_member_data, key=lambda elem: elem['member_name'],
                                         reverse=int(sort_order_by))
        elif sort_info == SORT_REMAIN_COUNT:
            current_member_data = sorted(current_member_data, key=lambda elem: elem['lecture_rem_count'],
                                         reverse=int(sort_order_by))
        elif sort_info == SORT_START_DATE:
            current_member_data = sorted(current_member_data, key=lambda elem: elem['start_date'],
                                         reverse=int(sort_order_by))
        elif sort_info == SORT_REG_COUNT:
            current_member_data = sorted(current_member_data, key=lambda elem: elem['lecture_reg_count'],
                                         reverse=int(sort_order_by))
        # context['total_member_num'] = len(member_data)
        # if page != 0:
        #     paginator = Paginator(member_data, 20)  # Show 20 contacts per page
        #     try:
        #         member_data = paginator.page(page)
        #     except EmptyPage:
        #         member_data = None
        #
        # context['member_data'] = member_data
        # end_dt = timezone.now()
        return JsonResponse({'current_member_data': current_member_data, 'finish_member_num': finish_member_num},
                            json_dumps_params={'ensure_ascii': True})


class GetMemberEndListViewAjax(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        # start_dt = timezone.now()
        class_id = self.request.session.get('class_id', '')
        page = request.GET.get('page', 0)
        member_sort = request.GET.get('sort_val', SORT_MEMBER_NAME)
        sort_order_by = request.GET.get('sort_order_by', SORT_ASC)
        keyword = request.GET.get('keyword', '')

        finish_member_data = func_get_member_end_list(class_id, request.user.id, keyword)
        current_member_num = len(func_get_class_member_ing_list(class_id, keyword))

        sort_info = int(member_sort)
        if sort_info == SORT_MEMBER_NAME:
            finish_member_data = sorted(finish_member_data, key=lambda elem: elem['member_name'],
                                        reverse=int(sort_order_by))
        elif sort_info == SORT_REMAIN_COUNT:
            finish_member_data = sorted(finish_member_data, key=lambda elem: elem['lecture_rem_count'],
                                        reverse=int(sort_order_by))
        elif sort_info == SORT_START_DATE:
            finish_member_data = sorted(finish_member_data, key=lambda elem: elem['start_date'],
                                        reverse=int(sort_order_by))
        elif sort_info == SORT_REG_COUNT:
            finish_member_data = sorted(finish_member_data, key=lambda elem: elem['lecture_reg_count'],
                                        reverse=int(sort_order_by))

        # context['total_member_num'] = len(member_data)
        # if page != 0:
        #     paginator = Paginator(member_data, 20)  # Show 20 contacts per page
        #     try:
        #         member_data = paginator.page(page)
        #     except EmptyPage:
        #         member_data = None
        #
        # end_dt = timezone.now()
        return JsonResponse({'finish_member_data': finish_member_data, 'current_member_num': current_member_num},
                            json_dumps_params={'ensure_ascii': True})


# 회원수정
def update_member_info_logic(request):
    member_id = request.POST.get('member_id')
    first_name = request.POST.get('first_name', '')
    phone = request.POST.get('phone', '')
    sex = request.POST.get('sex', '')
    birthday_dt = request.POST.get('birthday', '')
    next_page = request.POST.get('next_page')

    error = None
    member = None

    if member_id == '':
        error = '회원 ID를 확인해 주세요.'

    if error is None:
        try:
            member = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    if error is None:
        if member.user.is_active or request.user.id != member.reg_info:
            error = '회원 정보를 수정할수 없습니다.'

    if error is None:
        try:
            with transaction.atomic():
                # 회원의 이름을 변경하는 경우 자동으로 ID 변경되도록 설정
                if member.user.first_name != first_name:
                    username = member.user.first_name
                    i = 0
                    count = MemberTb.objects.filter(name=username).count()
                    max_range = (100 * (10 ** len(str(count)))) - 1
                    for i in range(0, 100):
                        username = member.user.first_name + str(random.randrange(0, max_range)).zfill(len(str(max_range)))
                        try:
                            User.objects.get(username=username)
                        except ObjectDoesNotExist:
                            break

                    if i == 100:
                        error = 'ID 변경에 실패했습니다. 다시 시도해주세요.'
                        raise InternalError

                    member.user.username = username
                    member.user.first_name = first_name
                    member.user.save()

                member.name = first_name
                member.phone = phone
                member.sex = sex
                if birthday_dt is not None and birthday_dt != '':
                    member.birthday_dt = birthday_dt
                member.save()

        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '등록 값에 문제가 있습니다.'
        except InternalError:
            error = error

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


# 회원 삭제
def delete_member_info_logic(request):
    class_id = request.session.get('class_id', '')
    member_id = request.POST.get('member_id')
    next_page = request.POST.get('next_page')
    error = None
    class_lecture_data = None
    member = None
    if member_id == '':
        error = '회원 ID를 확인해 주세요.'

    if error is None:

        try:
            member = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    if error is None:
        query_member_auth = "select B.AUTH_CD from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID =" \
                            " `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.USE=1"

        class_lecture_data = ClassLectureTb.objects.select_related(
            'lecture_tb__package_tb').filter(class_tb_id=class_id, auth_cd='VIEW',
                                             lecture_tb__member_id=member_id,
                                             use=USE).annotate(member_auth_cd=RawSQL(query_member_auth, []))

    if error is None:

        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                  lecture_tb__member_id=member_id,
                                                  state_cd='NP')

        finish_schedule_data = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'),
                                                         class_tb_id=class_id,
                                                         lecture_tb__member_id=member_id)
        repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                               lecture_tb__member_id=member_id)

        try:
            with transaction.atomic():
                # 등록된 일정 정리
                if len(schedule_data) > 0:
                    # 예약된 일정 삭제
                    schedule_data.delete()
                if len(repeat_schedule_data) > 0:
                    # 완료된 일정 비활성화
                    finish_schedule_data.update(use=UN_USE)
                if len(repeat_schedule_data) > 0:
                    # 반복일정 삭제
                    repeat_schedule_data.delete()

                class_lecture_data.update(auth_cd='DELETE', mod_member_id=request.user.id)

                for class_lecture_info in class_lecture_data:
                    lecture_info = class_lecture_info.lecture_tb
                    if lecture_info.state_cd == 'IP':
                        lecture_info.lecture_avail_count = 0
                        lecture_info.state_cd = 'PE'
                        lecture_info.save()

                if len(class_lecture_data.filter(member_auth_cd='VIEW')) == 0:
                    if member.user.is_active == 0 and str(member.reg_info) == str(request.user.id):
                        member.contents = member.user.username + ':' + str(member_id)
                        member.use = UN_USE
                        member.save()

        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)

# ############### ############### ############### ############### ############### ############### ##############


class TrainerMainView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'main_trainer.html'

    def get_context_data(self, **kwargs):
        context = {}
        # context = super(TrainerMainView, self).get_context_data(**kwargs)

        class_id = self.request.session.get('class_id', '')
        error = None
        today = datetime.date.today()
        one_day_after = today + datetime.timedelta(days=1)
        month_first_day = today.replace(day=1)

        # 업무 시간 고려
        context = func_get_trainer_setting_list(context, self.request.user.id, class_id)

        setting_trainer_work_time_avail = [context['lt_work_sun_time_avail'],
                                           context['lt_work_mon_time_avail'],
                                           context['lt_work_tue_time_avail'],
                                           context['lt_work_wed_time_avail'],
                                           context['lt_work_ths_time_avail'],
                                           context['lt_work_fri_time_avail'],
                                           context['lt_work_sat_time_avail']]
        work_avail_start_time = 24
        work_avail_end_time = 0
        for i in range(0, 7):
            work_avail_time = setting_trainer_work_time_avail[i]
            work_avail_start_time_test = work_avail_time.split('-')[0]
            work_avail_start_time_test = int(work_avail_start_time_test.split(':')[0])
            work_avail_end_time_test = work_avail_time.split('-')[1]
            work_avail_end_time_test = int(work_avail_end_time_test.split(':')[0])
            if work_avail_time != '0:00-0:00' and work_avail_time != '00:00-00:00':
                if work_avail_start_time > work_avail_start_time_test:
                    work_avail_start_time = work_avail_start_time_test
                if work_avail_end_time < work_avail_end_time_test:
                    work_avail_end_time = work_avail_end_time_test

        if work_avail_start_time == 24:
            work_avail_start_time = '23:59'
        else:
            work_avail_start_time = str(work_avail_start_time) + ':00'
        today_start_time = datetime.datetime.strptime(str(today) + ' ' + work_avail_start_time, '%Y-%m-%d %H:%M')
        if work_avail_end_time == 24:
            work_avail_end_time = '23:59'
        else:
            work_avail_end_time = str(work_avail_end_time) + ':00'
        one_day_after = datetime.datetime.strptime(str(today) + ' ' + work_avail_end_time, '%Y-%m-%d %H:%M')
        today = today_start_time

        next_year = int(month_first_day.strftime('%Y')) + 1
        next_month = (int(month_first_day.strftime('%m')) + 1) % 13
        if next_month == 0:
            next_month = 1
        next_month_first_day = month_first_day.replace(month=next_month)

        if next_month == 1:
            next_month_first_day = next_month_first_day.replace(year=next_year)

        today_schedule_num = 0
        new_member_num = 0
        total_member_num = 0
        to_be_end_member_num = 0
        np_member_num = 0

        # class_info = None

        context['total_member_num'] = 0
        context['to_be_end_member_num'] = 0
        context['today_schedule_num'] = 0
        context['new_member_num'] = 0

        if class_id is None or class_id == '':
            error = '프로그램 정보를 불러오지 못했습니다.'
        #
        # try:
        #     class_info = ClassTb.objects.get(class_id=class_id)
        # except ObjectDoesNotExist:
        #     error = '프로그램 정보를 불러오지 못했습니다.'
        #
        # if error is None:
        #     self.request.session['class_hour'] = class_info.class_hour
        #     self.request.session['class_type_code'] = class_info.subject_cd
        #     self.request.session['class_type_name'] = class_info.get_class_type_cd_name()

        if error is None:
            all_member = func_get_class_member_ing_list(class_id, '')
            total_member_num = len(all_member)

            class_lecture_list = ClassLectureTb.objects.select_related(
                'lecture_tb__member').filter(class_tb_id=class_id, lecture_tb__state_cd='IP', lecture_tb__use=USE,
                                             auth_cd='VIEW', use=USE).order_by('-lecture_tb__start_date')
            for member_info in all_member:
                # member_data = member_info

                member_lecture_reg_count = 0
                member_lecture_rem_count = 0
                member_lecture_avail_count = 0
                # 강좌에 해당하는 수강/회원 정보 가져오기
                # class_lecture_list = ClassLectureTb.objects.select_related(
                #     'lecture_tb').filter(class_tb_id=class_id, lecture_tb__member_id=member_info,
                #                          lecture_tb__state_cd='IP', lecture_tb__use=USE,
                #                          auth_cd='VIEW', use=USE).order_by('-lecture_tb__start_date')
                if len(class_lecture_list) > 0:
                    start_date = ''
                    for lecture_info_data in class_lecture_list:
                        lecture_info = lecture_info_data.lecture_tb
                        if str(lecture_info.member_id) == str(member_info):
                            if lecture_info_data.auth_cd == 'WAIT':
                                np_member_num += 1
                            member_lecture_reg_count += lecture_info.lecture_reg_count
                            member_lecture_rem_count += lecture_info.lecture_rem_count
                            member_lecture_avail_count += lecture_info.lecture_avail_count

                            if lecture_info.state_cd == 'IP':
                                if start_date == '':
                                    start_date = lecture_info.start_date
                                else:
                                    if start_date > lecture_info.start_date:
                                        start_date = lecture_info.start_date

                    if start_date != '':
                        if month_first_day <= start_date < next_month_first_day:
                            new_member_num += 1

                    if 0 < member_lecture_rem_count < 4:
                        to_be_end_member_num += 1

        if error is None:
            # 남은 횟수 1개 이상인 경우 - 180314 hk.kim
            context['total_member_num'] = total_member_num
            # 남은 횟수 1개 이상 3개 미만인 경우 - 180314 hk.kim
            context['to_be_end_member_num'] = to_be_end_member_num
            context['np_member_num'] = np_member_num
            context['new_member_num'] = new_member_num

        if error is None:
            today_schedule_num = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                           group_tb__isnull=True,
                                                           lecture_tb__isnull=False,
                                                           start_dt__gte=today, start_dt__lt=one_day_after,
                                                           en_dis_type=ON_SCHEDULE_TYPE).count()
            today_schedule_num += ScheduleTb.objects.filter(class_tb_id=class_id,
                                                            group_tb__isnull=False,
                                                            lecture_tb__isnull=True,
                                                            start_dt__gte=today, start_dt__lt=one_day_after,
                                                            en_dis_type=ON_SCHEDULE_TYPE).count()

        context['today_schedule_num'] = today_schedule_num

        if error is not None:
            logger.error(self.request.user.first_name + str(self.request.user.id) + ']' + error)
            messages.error(request, error)
        else:
            logger.info(self.request.user.first_name + '[' + str(self.request.user.id) + '] : login success')

        return context


class CalTotalView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_total.html'

    def get_context_data(self, **kwargs):
        context = super(CalTotalView, self).get_context_data(**kwargs)
        context['holiday'] = HolidayTb.objects.filter(use=USE)
        return context


# 단순화 1:1/그룹/클래스 통합 테스트 180828
class ManageLectureView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_lecture.html'

    def get_context_data(self, **kwargs):
        context = super(ManageLectureView, self).get_context_data(**kwargs)
        return context


# 수강권 관리 181030
class ManageTicketView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_ticket.html'

    def get_context_data(self, **kwargs):
        context = super(ManageTicketView, self).get_context_data(**kwargs)
        return context


class ManageMemberView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_member.html'

    def get_context_data(self, **kwargs):
        context = super(ManageMemberView, self).get_context_data(**kwargs)
        return context


class ManageGroupView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_group.html'

    def get_context_data(self, **kwargs):
        context = super(ManageGroupView, self).get_context_data(**kwargs)
        return context


class ManageClassView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_class.html'

    def get_context_data(self, **kwargs):
        context = super(ManageClassView, self).get_context_data(**kwargs)
        return context


class ManageCenterView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_center.html'

    def get_context_data(self, **kwargs):
        context = super(ManageCenterView, self).get_context_data(**kwargs)
        return context


class HelpPtersView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'setting_help.html'

    def get_context_data(self, **kwargs):
        context = super(HelpPtersView, self).get_context_data(**kwargs)
        qa_type_list = CommonCdTb.objects.filter(upper_common_cd='16', use=1).order_by('order')
        context['qa_type_data'] = qa_type_list
        return context


class FromPtersView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'setting_from_pters_team.html'

    def get_context_data(self, **kwargs):
        context = super(FromPtersView, self).get_context_data(**kwargs)

        return context


class AboutUsView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'setting_about_us.html'

    def get_context_data(self, **kwargs):
        context = super(AboutUsView, self).get_context_data(**kwargs)

        return context


class AttendModeView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'attend_mode.html'

    def get_context_data(self, **kwargs):
        context = super(AttendModeView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        setting_admin_password = '0000'
        setting_attend_class_prev_display_time = 0
        setting_attend_class_after_display_time = 0
        setting_schedule_auto_finish = 0
        current_time = timezone.now()
        check_setting_counter = 0
        setting_data = SettingTb.objects.filter(member_id=self.request.user.id, class_tb_id=class_id, use=USE)

        for setting_info in setting_data:
            if setting_info.setting_type_cd == 'LT_ADMIN_PASSWORD':
                setting_admin_password = setting_info.setting_info
                check_setting_counter += 1
            if setting_info.setting_type_cd == 'LT_ATTEND_CLASS_PREV_DISPLAY_TIME':
                setting_attend_class_prev_display_time = int(setting_info.setting_info)
                check_setting_counter += 1
            if setting_info.setting_type_cd == 'LT_ATTEND_CLASS_AFTER_DISPLAY_TIME':
                setting_attend_class_after_display_time = int(setting_info.setting_info)
                check_setting_counter += 1
            if setting_info.setting_type_cd == 'LT_SCHEDULE_AUTO_FINISH':
                setting_schedule_auto_finish = int(setting_info.setting_info)
                check_setting_counter += 1

        start_date = current_time + datetime.timedelta(minutes=int(setting_attend_class_prev_display_time))
        end_date = current_time - datetime.timedelta(minutes=int(setting_attend_class_after_display_time))
        context = func_get_trainer_attend_schedule(context, class_id, start_date, end_date, current_time)

        context['setting_admin_password'] = setting_admin_password
        context['setting_attend_class_prev_display_time'] = setting_attend_class_prev_display_time
        context['setting_attend_class_after_display_time'] = setting_attend_class_after_display_time
        context['setting_schedule_auto_finish'] = setting_schedule_auto_finish
        if check_setting_counter != 4:
            context['check_setting_data'] = 1

        return context


class AttendModeDetailView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'attend_mode_detail.html'

    def post(self, request):
        context = {}
        class_id = request.session.get('class_id', '')
        phone_number = request.POST.get('phone_number', '')
        schedule_id = request.POST.get('schedule_id', '')
        error = None
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            schedule_info = None

        member_data = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                    lecture_tb__member__phone=phone_number,
                                                    auth_cd='VIEW',
                                                    use=USE)
        if len(member_data) > 0:
            context['member_info'] = member_data[0].lecture_tb.member
            member_id = member_data[0].lecture_tb.member_id
            context['member_id'] = member_id
            if schedule_info.lecture_tb is None or schedule_info.lecture_tb == '':
                try:
                    group_schedule_info = ScheduleTb.objects.get(group_schedule_id=schedule_id,
                                                                 group_tb_id=schedule_info.group_tb_id,
                                                                 lecture_tb__member_id=member_id)
                    context['lecture_info'] = group_schedule_info.lecture_tb

                except ObjectDoesNotExist:
                    lecture_id = func_get_group_lecture_id(schedule_info.group_tb_id, member_id)
                    if lecture_id is None or lecture_id == '':
                        error = '예약 가능한 횟수가 없습니다.'
                    else:
                        try:
                            context['lecture_info'] = LectureTb.objects.get(lecture_id=lecture_id)
                        except ObjectDoesNotExist:
                            error = '수강정보를 불러오지 못했습니다.'
            else:
                if schedule_info.lecture_tb.member_id==member_id:
                    context['lecture_info'] = schedule_info.lecture_tb
                else:
                    error = '번호와 수업이 일치하지 않습니다.'

        if schedule_info is not None:
            context['schedule_info'] = schedule_info
            context['schedule_id'] = schedule_id
        if error is not None:
            logger.error('class_id:'+str(class_id) + '/phone_number:' + str(phone_number) + '/schedule_id:'
                         + str(schedule_id) + '/' + error)
            messages.error(request, error)

        return render(request, self.template_name, context)


class BGSettingView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'setting_background.html'

    def get(self, request):
        # context = super(BGSettingView, self).get_context_data(**kwargs)
        context = {}
        class_id = request.session.get('class_id', '')
        error = None
        background_img_data = None

        context['common_cd_data'] = CommonCdTb.objects.filter(upper_common_cd='14', use=USE).order_by('order')

        if error is None:
            if class_id is not None and class_id != '':
                background_img_data = BackgroundImgTb.objects.filter(class_tb_id=class_id,
                                                                     use=USE).order_by('-class_tb_id')
            else:
                background_img_data = BackgroundImgTb.objects.filter(class_tb__member_id=request.user.id,
                                                                     use=USE).order_by('-class_tb_id')

        if error is None:
            for background_img_info in background_img_data:
                try:
                    background_img_type_name = \
                        CommonCdTb.objects.get(common_cd=background_img_info.background_img_type_cd)
                except ObjectDoesNotExist:
                    background_img_type_name = None
                if background_img_type_name is not None:
                    background_img_info.background_img_type_name = background_img_type_name.common_cd_nm

        context['background_img_data'] = background_img_data

        return render(request, self.template_name, context)


class ClassSelectView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainer_class_select.html'

    def get_context_data(self, **kwargs):
        context = super(ClassSelectView, self).get_context_data(**kwargs)
        return context


class AddClassView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'trainer_class_add.html'

    def get(self, request):
        context = {}
        cancel_redirect_url = request.GET.get('cancel_redirect_url', '/login/logout/')
        # context = super(AddClassView, self).get_context_data(**kwargs)
        class_type_cd_data = CommonCdTb.objects.filter(upper_common_cd='02', use=USE).order_by('order')
        # class_type_cd_data = CommonCdTb.objects.filter(common_cd='TR', use=USE).order_by('order')
        # class_type_cd_data |= CommonCdTb.objects.filter(common_cd='ETC', use=USE).order_by('order')

        for class_type_cd_info in class_type_cd_data:
            class_type_cd_info.subject_type_cd = CommonCdTb.objects.filter(upper_common_cd='03',
                                                                           group_cd=class_type_cd_info.common_cd,
                                                                           use=USE).order_by('order')

        center_list = CenterTrainerTb.objects.filter(member_id=request.user.id, use=USE)

        context['center_list'] = center_list
        context['class_type_cd_data'] = class_type_cd_data
        context['cancel_redirect_url'] = cancel_redirect_url

        return render(request, self.template_name, context)


class MyPageView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'setting_mypage.html'

    def get(self, request):
        context = {}
        # context = super(MyPageView, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        sns_id = request.session.get('social_login_id', '')
        error = None
        class_info = None
        now = timezone.now()
        next_schedule_start_dt = ''
        next_schedule_end_dt = ''

        today = datetime.date.today()
        month_first_day = today.replace(day=1)
        next_year = int(month_first_day.strftime('%Y')) + 1
        next_month = (int(month_first_day.strftime('%m')) + 1) % 12
        if next_month == 0:
            next_month = 1
        next_month_first_day = month_first_day.replace(month=next_month)

        if next_month == 1:
            next_month_first_day = next_month_first_day.replace(year=next_year)

        end_schedule_num = 0
        new_member_num = 0
        total_member_num = 0
        current_total_member_num = 0

        context['total_member_num'] = 0
        context['current_total_member_num'] = 0
        context['end_schedule_num'] = 0
        context['new_member_num'] = 0

        if class_id is None or class_id == '':
            error = '프로그램 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
                context['center_name'] = class_info.get_center_name()
            except ObjectDoesNotExist:
                error = '프로그램 정보를 불러오지 못했습니다.'

        if error is None:
            # all_member = MemberTb.objects.filter().order_by('name')
            all_member = func_get_class_member_ing_list(class_id, '')
            end_member = func_get_class_member_end_list(class_id, '')

            for member_info in all_member:
                # member_data = member_info

                # 강좌에 해당하는 수강/회원 정보 가져오기
                total_class_lecture_list = ClassLectureTb.objects.select_related('lecture_tb'
                                                                                 ).filter(class_tb_id=class_id,
                                                                                          lecture_tb__member_id
                                                                                          =member_info.member_id,
                                                                                          lecture_tb__use=USE,
                                                                                          auth_cd='VIEW',
                                                                                          use=USE).order_by('-lecture_tb__start_date')

                if len(total_class_lecture_list) > 0:
                    # total_member_num += 1
                    start_date = ''
                    for class_lecture_info in total_class_lecture_list:
                        lecture_info = class_lecture_info.lecture_tb
                        if lecture_info.state_cd == 'IP':
                            # current_total_member_num += 1
                            # for lecture_info_data in class_lecture_list:
                            if start_date == '':
                                start_date = lecture_info.start_date
                            else:
                                if start_date > lecture_info.start_date:
                                    start_date = lecture_info.start_date
                            # break

                    if start_date != '':
                        if month_first_day <= start_date < next_month_first_day:
                            new_member_num += 1

            query_class_auth_cd \
                = "select `AUTH_CD` from CLASS_LECTURE_TB as D" \
                  " where D.LECTURE_TB_ID = `SCHEDULE_TB`.`LECTURE_TB_ID` and D.CLASS_TB_ID = " + str(class_id)
            end_schedule_num += ScheduleTb.objects.select_related(
                'lecture_tb', 'group_tb').filter(Q(state_cd='PE'), class_tb_id=class_id,
                                                 group_tb__isnull=True, lecture_tb__isnull=False,
                                                 en_dis_type=ON_SCHEDULE_TYPE, use=USE
                                                 ).annotate(class_auth_cd=RawSQL(query_class_auth_cd, [])
                                                            ).filter(class_auth_cd='VIEW').count()

            end_schedule_num += ScheduleTb.objects.filter(Q(state_cd='PE'), class_tb_id=class_id,
                                                          group_tb__isnull=False,
                                                          lecture_tb__isnull=True,
                                                          en_dis_type=ON_SCHEDULE_TYPE,
                                                          use=USE).count()
        if error is None:
            # 남은 횟수 1개 이상인 경우 - 180314 hk.kim
            context['total_member_num'] = len(all_member) + len(end_member)
            # 남은 횟수 1개 이상 3개 미만인 경우 - 180314 hk.kim
            # context['current_total_member_num'] = current_total_member_num
            context['current_total_member_num'] = len(all_member)
            context['new_member_num'] = new_member_num

        pt_schedule_data = ScheduleTb.objects.filter(class_tb=class_id,
                                                     en_dis_type=ON_SCHEDULE_TYPE,
                                                     start_dt__gte=now, use=USE).order_by('start_dt')
        if len(pt_schedule_data) > 0:
            next_schedule_start_dt = pt_schedule_data[0].start_dt
            next_schedule_end_dt = pt_schedule_data[0].end_dt

        # product_list = ProductTb.objects.filter(use=USE)
        # current_payment_data = []
        # for product_info in product_list:
        #     try:
        #         payment_info = PaymentInfoTb.objects.filter(member_id=request.user.id,
        #                                                     merchandise_type_cd=product_info.merchandise_type_cd,
        #                                                     start_date__lte=today, end_date__gte=today,
        #                                                     status='paid',
        #                                                     use=USE).latest('end_date')
        #     except ObjectDoesNotExist:
        #         payment_info = None
        #     if payment_info is not None:
        #         current_payment_data.append(payment_info)
        # context['current_payment_data'] = current_payment_data
        context['next_schedule_start_dt'] = str(next_schedule_start_dt)
        context['next_schedule_end_dt'] = str(next_schedule_end_dt)
        context['end_schedule_num'] = end_schedule_num
        context['check_password_changed'] = 1
        if sns_id != '' and sns_id is not None:
            sns_password_change_check = SnsInfoTb.objects.filter(member_id=request.user.id, sns_id=sns_id,
                                                                 change_password_check=1, use=USE).count()
            if sns_password_change_check == 0:
                context['check_password_changed'] = 0

        return render(request, self.template_name, context)


class DeleteAccountView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'delete_account_form.html'

    def get_context_data(self, **kwargs):
        context = super(DeleteAccountView, self).get_context_data(**kwargs)

        return context


class TrainerSettingView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'setting.html'

    def get_context_data(self, **kwargs):
        context = super(TrainerSettingView, self).get_context_data(**kwargs)

        return context


class PushSettingView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'setting_push.html'

    def get(self, request):
        context = {}
        # context = super(PushSettingView, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        context = func_get_trainer_setting_list(context, request.user.id, class_id)

        return render(request, self.template_name, context)


class ReserveSettingView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'setting_reserve.html'

    def get(self, request):
        context = {}

        return render(request, self.template_name, context)


class BasicSettingView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'setting_basic.html'

    def get(self, request):
        context = {}

        return render(request, self.template_name, context)


class SalesSettingView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'setting_sales.html'

    def get_context_data(self, **kwargs):
        context = super(SalesSettingView, self).get_context_data(**kwargs)
        return context


class ClassSettingView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'setting_class.html'

    def get_context_data(self, **kwargs):
        context = super(ClassSettingView, self).get_context_data(**kwargs)
        return context


class LanguageSettingView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'setting_language.html'

    def get_context_data(self, **kwargs):
        context = super(LanguageSettingView, self).get_context_data(**kwargs)
        return context


class ManageWorkView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'manage_work.html'

    def get(self, request):
        context = {}
        class_id = request.session.get('class_id', '')
        start_date = request.session.get('sales_start_date', '')
        end_date = request.session.get('sales_end_date', '')

        error = None
        finish_date = None
        month_first_day = None
        if end_date == '' or end_date is None:
            finish_date = timezone.now()
            this_year = int(finish_date.strftime('%Y'))
            next_month = (int(finish_date.strftime('%m'))+1) % 12
            if next_month == 0:
                next_month = 12
            elif next_month == 1:
                this_year += 1
            finish_date = finish_date.replace(month=next_month, day=1)
            finish_date = finish_date - datetime.timedelta(days=1)
            finish_date = finish_date.replace(year=this_year)
        else:
            try:
                finish_date = datetime.datetime.strptime(end_date, '%Y-%m-%d')
            except TypeError:
                error = '날짜 형식에 문제 있습니다.'
            except ValueError:
                error = '날짜 형식에 문제 있습니다.'

        if start_date == '' or start_date is None:
            month_first_day = finish_date.replace(day=1)
            # default 통계값
            # for i in range(1, 3):
            #     before_year = int(month_first_day.strftime('%Y')) - 1
            #     before_month = (int(month_first_day.strftime('%m')) - 1) % 13
            #     if before_month == 0:
            #         before_month = 12
            #     before_month_first_day = month_first_day.replace(month=before_month)
            #     if before_month == 12:
            #         before_month_first_day = before_month_first_day.replace(year=before_year)
            #     month_first_day = before_month_first_day
        else:
            try:
                month_first_day = datetime.datetime.strptime(start_date, '%Y-%m-%d')
            except TypeError:
                error = '날짜 형식에 문제 있습니다.'
            except ValueError:
                error = '날짜 형식에 문제 있습니다.'

        # if error is None:
        #     context = get_stats_member_data(class_id, month_first_day, finish_date)
        #     error = context['error']

        if error is None:
            sales_data_result = get_sales_data(class_id, month_first_day, finish_date)
            if sales_data_result['error'] is None:
                context['month_price_data'] = sales_data_result['month_price_data']
            else:
                error = sales_data_result['error']

        if error is not None:
            logger.error(request.user.last_name + ' ' + request.user.first_name + '['
                         + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return render(request, self.template_name, context)


class AlarmView(LoginRequiredMixin, AccessTestMixin, AjaxListView):
    context_object_name = "log_data"
    template_name = "alarm.html"
    page_template = 'alarm_page.html'

    def get_queryset(self):
        class_id = self.request.session.get('class_id', '')
        error = None
        log_data = None
        if error is None:
            today = datetime.date.today()
            three_days_ago = today - datetime.timedelta(days=3)
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=USE).order_by('-reg_dt')
            log_data = LogTb.objects.filter(class_tb_id=class_id, reg_dt__gte=three_days_ago,
                                            use=USE).order_by('-reg_dt')
            # log_data.order_by('-reg_dt')

        if error is None:
            for log_info in log_data:
                if log_info.read == 0:
                    log_info.log_read = 0
                    log_info.read = 1
                    log_info.save()
                elif log_info.read == 1:
                    log_info.log_read = 1
                else:
                    log_info.log_read = 2
                log_info.time_ago = timezone.now() - log_info.reg_dt
                log_info.reg_dt = str(log_info.reg_dt).split('.')[0]
                # log_info.time_ago = str(log_info.time_ago).split('.')[0]

                if log_info.log_detail is not None and log_info.log_detail != '':
                    log_detail_split = str(log_info.log_detail).split('/')
                    before_day = log_detail_split[0]
                    after_day = log_detail_split[1]

                    if '반복 일정' in log_info.log_info:
                        log_info.log_detail = before_day + '~' + after_day
                    else:
                        log_info.log_detail = before_day + '~' + after_day.split(' ')[1]

                day = int(log_info.time_ago.days)
                hour = int(log_info.time_ago.seconds / 3600)
                minute = int(log_info.time_ago.seconds / 60)
                sec = int(log_info.time_ago.seconds)

                if day > 0:
                    log_info.time_ago = str(day) + '일 전'
                else:
                    if hour > 0:
                        log_info.time_ago = str(hour) + '시간 전'
                    else:
                        if minute > 0:
                            log_info.time_ago = str(minute) + '분 전'
                        else:
                            log_info.time_ago = str(sec) + '초 전'

        return log_data


class AlarmPCView(LoginRequiredMixin, AccessTestMixin, AjaxListView):
    context_object_name = "log_data"
    template_name = "alarm_pc.html"
    page_template = 'alarm_page.html'

    def get_queryset(self):
        class_id = self.request.session.get('class_id', '')
        error = None
        log_data = None
        if error is None:
            today = datetime.date.today()
            three_days_ago = today - datetime.timedelta(days=3)
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=USE).order_by('-reg_dt')
            log_data = LogTb.objects.filter(class_tb_id=class_id, reg_dt__gte=three_days_ago,
                                            use=USE).order_by('-reg_dt')

        if error is None:
            for log_info in log_data:
                if log_info.read == 0:
                    log_info.log_read = 0
                    log_info.read = 1
                    log_info.save()
                elif log_info.read == 1:
                    log_info.log_read = 1
                else:
                    log_info.log_read = 2
                log_info.time_ago = timezone.now() - log_info.reg_dt
                log_info.reg_dt = str(log_info.reg_dt).split('.')[0]
                # log_info.time_ago = str(log_info.time_ago).split('.')[0]

                if log_info.log_detail is not None and log_info.log_detail != '':
                    before_day = str(log_info.log_detail).split('/')[0]
                    after_day = str(log_info.log_detail).split('/')[1]

                    if '반복 일정' in log_info.log_info:
                        log_info.log_detail = before_day + '~' + after_day
                    else:
                        log_info.log_detail = before_day + '~' + after_day.split(' ')[1]

                day = int(log_info.time_ago.days)
                hour = int(log_info.time_ago.seconds / 3600)
                minute = int(log_info.time_ago.seconds / 60)
                sec = int(log_info.time_ago.seconds)

                if day > 0:
                    log_info.time_ago = str(day) + '일 전'
                else:
                    if hour > 0:
                        log_info.time_ago = str(hour) + '시간 전'
                    else:
                        if minute > 0:
                            log_info.time_ago = str(minute) + '분 전'
                        else:
                            log_info.time_ago = str(sec) + '초 전'

        return log_data


# iframe화를 위해 skkim
class CalWeekIframeView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'iframe_cal_week.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthIframeView, self).get_context_data(**kwargs)
        holiday = HolidayTb.objects.filter(use=USE)
        context['holiday'] = holiday

        return context


class CalMonthIframeView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'iframe_cal_month.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthIframeView, self).get_context_data(**kwargs)
        holiday = HolidayTb.objects.filter(use=USE)
        context['holiday'] = holiday

        return context


class CalPreviewIframeView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'iframe_cal_preview.html'

    def get(self, request):
        context = {}
        # context = super(CalMonthView, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        class_info = None
        error = None

        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '프로그램 정보를 불러오지 못했습니다.'

        # if error is None:
        #     request.session['class_hour'] = class_info.class_hour

        holiday = HolidayTb.objects.filter(use=USE)
        context['holiday'] = holiday

        return render(request, self.template_name, context)
        # iframe화를 위해 skkim


# ############### ############### ############### ############### ############### ############### ##############




def export_excel_member_list_logic(request):
    class_id = request.session.get('class_id', '')
    finish_flag = request.GET.get('finish_flag', '0')
    member_sort = request.GET.get('sort_val', SORT_MEMBER_NAME)
    sort_order_by = request.GET.get('sort_order_by', SORT_ASC)
    keyword = request.GET.get('keyword', '')
    sort_info = int(member_sort)

    error = None
    member_list = []
    member_finish_list = []

    wb = Workbook()
    ws1 = wb.active
    start_raw = 3

    ws1['A2'] = '회원명'
    ws1['B2'] = '수강권'
    ws1['C2'] = '회원 ID'
    ws1['D2'] = '등록 횟수'
    ws1['E2'] = '남은 횟수'
    ws1['F2'] = '시작 일자'
    ws1['G2'] = '종료 일자'
    ws1['H2'] = '연락처'
    ws1.column_dimensions['A'].width = 10
    ws1.column_dimensions['B'].width = 20
    ws1.column_dimensions['C'].width = 20
    ws1.column_dimensions['D'].width = 10
    ws1.column_dimensions['E'].width = 10
    ws1.column_dimensions['F'].width = 15
    ws1.column_dimensions['G'].width = 15
    ws1.column_dimensions['H'].width = 20
    # filename_temp = request.user.last_name + request.user.first_name + '님_'
    filename_temp = request.user.first_name + '님_'
    if finish_flag == '0':
        member_list = func_get_member_ing_list(class_id, request.user.id, keyword)

        if sort_info == SORT_MEMBER_NAME:
            member_list = sorted(member_list, key=attrgetter('name'), reverse=int(sort_order_by))
        elif sort_info == SORT_REMAIN_COUNT:
            member_list = sorted(member_list, key=attrgetter('lecture_rem_count'), reverse=int(sort_order_by))
        elif sort_info == SORT_START_DATE:
            member_list = sorted(member_list, key=attrgetter('start_date'), reverse=int(sort_order_by))
        elif sort_info == SORT_REG_COUNT:
            member_list = sorted(member_list, key=attrgetter('lecture_reg_count'), reverse=int(sort_order_by))

        filename_temp += '진행중_회원목록'
        ws1.title = "진행중 회원"
        ws1['A1'] = '진행중 회원정보'
        ws1['A1'].font = Font(bold=True, size=15)
        for member_info in member_list:
            ws1['A' + str(start_raw)] = member_info.name
            ws1['B' + str(start_raw)] = member_info.group_info
            ws1['C' + str(start_raw)] = member_info.user.username
            ws1['D' + str(start_raw)] = member_info.lecture_reg_count
            ws1['E' + str(start_raw)] = member_info.lecture_rem_count
            ws1['F' + str(start_raw)] = member_info.start_date
            if member_info.end_date == '9999-12-31':
                ws1['G' + str(start_raw)] = '소진시까지'
            else:
                ws1['G' + str(start_raw)] = member_info.end_date

            if member_info.phone is None:
                ws1['H' + str(start_raw)] = '---'
            else:
                ws1['H' + str(start_raw)] = member_info.phone[0:3] + '-' + member_info.phone[3:7]\
                                            + '-' + member_info.phone[7:]
            start_raw += 1
    else:
        member_finish_list = func_get_member_end_list(class_id, request.user.id, keyword)

        if sort_info == SORT_MEMBER_NAME:
            member_finish_list = sorted(member_finish_list, key=attrgetter('name'), reverse=int(sort_order_by))
        elif sort_info == SORT_REMAIN_COUNT:
            member_finish_list = sorted(member_finish_list, key=attrgetter('lecture_rem_count'),
                                        reverse=int(sort_order_by))
        elif sort_info == SORT_START_DATE:
            member_finish_list = sorted(member_finish_list, key=attrgetter('start_date'), reverse=int(sort_order_by))
        elif sort_info == SORT_REG_COUNT:
            member_finish_list = sorted(member_list, key=attrgetter('lecture_reg_count'), reverse=int(sort_order_by))

        ws1.title = "종료된 회원"
        filename_temp += '종료된_회원목록'
        ws1['A1'] = '종료된 회원정보'
        ws1['A1'].font = Font(bold=True, size=15)
        for member_info in member_finish_list:
            ws1['A' + str(start_raw)] = member_info.name
            ws1['B' + str(start_raw)] = member_info.group_info
            ws1['C' + str(start_raw)] = member_info.user.username
            ws1['D' + str(start_raw)] = member_info.lecture_reg_count
            ws1['E' + str(start_raw)] = member_info.lecture_rem_count
            ws1['F' + str(start_raw)] = member_info.start_date
            if member_info.end_date == '9999-12-31':
                ws1['G' + str(start_raw)] = '소진시까지'
            else:
                ws1['G' + str(start_raw)] = member_info.end_date
            if member_info.phone is None:
                ws1['H' + str(start_raw)] = '---'
            else:
                ws1['H' + str(start_raw)] = member_info.phone[0:3] + '-' + member_info.phone[3:7]\
                                            + '-' + member_info.phone[7:]
            start_raw += 1

    user_agent = request.META['HTTP_USER_AGENT']
    filename_temp += '.xlsx'
    filename = filename_temp.encode('utf-8')
    response = HttpResponse(save_virtual_workbook(wb),
                            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    if 'chrome' in str(user_agent) or 'Chrome' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename="' + quote(filename) + '"'
    elif 'safari' in str(user_agent) or 'Safari' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename="' + quote(filename) + '"'
    elif 'firefox' in str(user_agent) or 'Firefox' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename*="' + quote(filename) + '"'
    else:
        response['Content-Disposition'] = 'attachment; filename="' + quote(filename) + '"'

    if error is not None:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '['
                     + str(request.user.id) + ']' + error)
    return response


def export_excel_member_info_logic(request):
    class_id = request.session.get('class_id', '')
    member_id = request.GET.get('member_id', '')

    error = None
    member_info = None
    lecture_counts = 0
    np_lecture_counts = 0
    lecture_list = None

    if class_id is None or class_id == '':
        error = '오류가 발생했습니다.'

    if member_id is None or member_id == '':
        error = '회원 정보를 불러오지 못했습니다.'

    wb = Workbook()
    ws1 = wb.active

    if error is None:
        try:
            member_info = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'

    # 수강 정보 불러 오기
    if error is None:
        # query_group_type_cd = "select GROUP_TYPE_CD from GROUP_TB WHERE ID = " \
        #                       "(select GROUP_TB_ID from GROUP_LECTURE_TB as B " \
        #                       "where B.LECTURE_TB_ID = `CLASS_LECTURE_TB`.`LECTURE_TB_ID` AND " \
        #                       "(select A.USE from LECTURE_TB as A where A.ID=B.LECTURE_TB_ID)=1 and B.USE=1)"
        # query_group_name = "select NAME from GROUP_TB WHERE ID = " \
        #                    "(select GROUP_TB_ID from GROUP_LECTURE_TB as B " \
        #                    "where B.LECTURE_TB_ID = `CLASS_LECTURE_TB`.`LECTURE_TB_ID` AND " \
        #                    "(select A.USE from LECTURE_TB as A where A.ID=B.LECTURE_TB_ID)=1 and B.USE=1)"
        query_lecture_count = "select count(*) from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                              "`CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and " \
                              "(select A.USE from LECTURE_TB as A where A.ID=B.LECTURE_TB_ID)=1 and B.USE=1"

        lecture_list = ClassLectureTb.objects.select_related(
            'lecture_tb__package_tb').filter(class_tb_id=class_id, auth_cd='VIEW', lecture_tb__member_id=member_id,
                                             lecture_tb__use=USE,
                                             use=USE).annotate(lecture_count=RawSQL(query_lecture_count, [])
                                                               ).order_by('-lecture_tb__start_date',
                                                                          'lecture_tb__reg_dt')

    if error is None:
        # 강사 클래스의 반복일정 불러오기
        if len(lecture_list) > 0:

            for idx, lecture_list_info in enumerate(lecture_list):
                lecture_info = lecture_list_info.lecture_tb
                lecture_info.start_date = str(lecture_info.start_date)
                lecture_info.end_date = str(lecture_info.end_date)
                lecture_info.mod_dt = str(lecture_info.mod_dt)
                lecture_info.reg_dt = str(lecture_info.reg_dt)

                start_raw = 7
                ws1.title = lecture_info.start_date + ' 수강정보'
                ws1['A1'] = '수강 정보'
                ws1['A1'].font = Font(bold=True, size=15)
                ws1['A2'] = '수강권'
                ws1['B2'] = '시작일자'
                ws1['C2'] = '종료일자'
                ws1['D2'] = '등록횟수'
                ws1['E2'] = '남은횟수'
                ws1['F2'] = '등록금액'
                ws1['G2'] = '진행상태'
                ws1['H2'] = '회원님과 연결상태'
                ws1['I2'] = '특이사항'

                ws1.column_dimensions['A'].width = 15
                ws1.column_dimensions['B'].width = 20
                ws1.column_dimensions['C'].width = 20
                ws1.column_dimensions['D'].width = 25
                ws1.column_dimensions['E'].width = 25
                ws1.column_dimensions['F'].width = 15
                ws1.column_dimensions['G'].width = 10
                ws1.column_dimensions['H'].width = 10
                ws1.column_dimensions['I'].width = 20

                try:
                    lecture_info.state_cd_name = CommonCdTb.objects.get(common_cd=lecture_info.state_cd)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'
                try:
                    lecture_test = MemberLectureTb.objects.get(lecture_tb__lecture_id=lecture_info.lecture_id)
                    lecture_info.auth_cd = lecture_test.auth_cd
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'

                try:
                    lecture_info.auth_cd_name = CommonCdTb.objects.get(common_cd=lecture_info.auth_cd)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'

                if lecture_info.auth_cd == 'WAIT':
                    np_lecture_counts += 1
                lecture_counts += 1

                lecture_list_info.group_info = ''

                if '\r\n' in lecture_info.note:
                    lecture_info.note = lecture_info.note.replace('\r\n', ' ')

                ws1['A3'] = lecture_list_info.group_info
                ws1['B3'] = lecture_info.start_date
                ws1['C3'] = lecture_info.end_date
                ws1['D3'] = lecture_info.lecture_reg_count
                ws1['E3'] = lecture_info.lecture_rem_count
                ws1['F3'] = lecture_info.price
                ws1['G3'] = lecture_info.state_cd_name.common_cd_nm
                ws1['H3'] = lecture_info.auth_cd_name.common_cd_nm
                ws1['I3'] = lecture_info.note

                ws1['A5'] = '반복 일정'
                ws1['A5'].font = Font(bold=True, size=15)
                ws1['A6'] = '빈도'
                ws1['B6'] = '요일'
                ws1['C6'] = '시작시각 ~ 종료시각'
                ws1['D6'] = '시작일 ~ 종료일'
                repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                       en_dis_type=ON_SCHEDULE_TYPE
                                                                       ).order_by('-start_date')
                # if repeat_schedule_data is not None and len(repeat_schedule_data) > 0:
                for repeat_schedule_info in repeat_schedule_data:
                    if repeat_schedule_info.repeat_type_cd == 'WW':
                        ws1['A' + str(start_raw)] = '매주'
                    else:
                        ws1['A' + str(start_raw)] = '격주'
                    week_info = repeat_schedule_info.week_info.replace('MON', '월')
                    week_info = week_info.replace('TUE', '화')
                    week_info = week_info.replace('WED', '수')
                    week_info = week_info.replace('THS', '목')
                    week_info = week_info.replace('FRI', '금')
                    week_info = week_info.replace('SAT', '토')
                    week_info = week_info.replace('SUN', '일')
                    ws1['B' + str(start_raw)] = week_info

                    ws1['C' + str(start_raw)] = repeat_schedule_info.start_time + '~'\
                                                + repeat_schedule_info.end_time

                    ws1['D' + str(start_raw)] = str(repeat_schedule_info.start_date) + '~'\
                                                + str(repeat_schedule_info.end_date)

                    start_raw += 1

                start_raw += 1
                ws1['A' + str(start_raw)] = '레슨 이력'
                ws1['A' + str(start_raw)].font = Font(bold=True, size=15)
                start_raw += 1
                ws1['A' + str(start_raw)] = '회차'
                ws1['B' + str(start_raw)] = '수행 일시'
                ws1['C' + str(start_raw)] = '진행시간'
                ws1['D' + str(start_raw)] = '구분'
                ws1['E' + str(start_raw)] = '메모'

                start_raw += 1
                pt_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                             en_dis_type=ON_SCHEDULE_TYPE,
                                                             use=USE).order_by('-start_dt')

                if pt_schedule_data is not None and len(pt_schedule_data) > 0:
                    schedule_idx = len(pt_schedule_data)
                    for pt_schedule_info in pt_schedule_data:

                        ws1['A' + str(start_raw)] = str(schedule_idx)
                        start_date_temp = str(pt_schedule_info.start_dt).split(':')
                        ws1['B' + str(start_raw)] = start_date_temp[0] + ':' + start_date_temp[1]

                        time_duration_temp = pt_schedule_info.end_dt - pt_schedule_info.start_dt
                        time_duration = str(time_duration_temp).split(':')
                        time_duration_str = ''
                        if time_duration[0] != '00' and time_duration[0] != '0':
                            time_duration_str += time_duration[0] + '시간'
                        if time_duration[1] != '00' and time_duration[1] != '0':
                            time_duration_str += time_duration[1] + '분'

                        ws1['C' + str(start_raw)] = time_duration_str
                        if pt_schedule_info.state_cd == 'PE':
                            ws1['D' + str(start_raw)] = '완료'
                        elif pt_schedule_info.state_cd == 'PC':
                            ws1['D' + str(start_raw)] = '결석'
                        else:
                            ws1['D' + str(start_raw)] = '시작전'

                        if pt_schedule_info.note is None:
                            ws1['E' + str(start_raw)] = ''
                        else:
                            ws1['E' + str(start_raw)] = pt_schedule_info.note
                        start_raw += 1
                        schedule_idx -= 1

                ws1 = wb.create_sheet()

    user_agent = request.META['HTTP_USER_AGENT']
    filename = str(member_info.name + '_회원님_수강정보.xlsx').encode('utf-8')
    # test_str = urllib.parse.unquote('한글')
    response = HttpResponse(save_virtual_workbook(wb),
                            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    if 'chrome' in str(user_agent) or 'Chrome' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename="' + urllib.parse.quote(filename) + '"'
    elif 'safari' in str(user_agent) or 'Safari' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename="' + urllib.parse.quote(filename) + '"'
    elif 'firefox' in str(user_agent) or 'Firefox' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename*="' + urllib.parse.quote(filename) + '"'
    else:
        response['Content-Disposition'] = 'attachment; filename="' + urllib.parse.quote(filename) + '"'
    # filename="'+test_str+'.xlsx"'
    # response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    # response['Content-Disposition'] = 'attachment; filename=.xlsx'

    if error is not None:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '['
                     + str(request.user.id) + ']' + error)
    return response


# ############### ############### ############### ############### ############### ############### ##############
# 회원 수강권 기능 ############### ############### ############### ############### ############### ############### ########

class GetLectureListView(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = self.request.session.get('class_id', '')
        member_id = request.GET.get('member_id', '')
        error = None
        lecture_list = collections.OrderedDict()

        if class_id is None or class_id == '':
            error = '오류가 발생했습니다.'

        if member_id is None or member_id == '':
            error = '회원 정보를 불러오지 못했습니다.'

        if error is None:
            query_member_auth = "select AUTH_CD from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                                "`CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.MEMBER_ID = '" + str(member_id) + \
                                "' and B.USE=1"

            lecture_data = ClassLectureTb.objects.select_related(
                'lecture_tb__package_tb').filter(class_tb_id=class_id, auth_cd='VIEW', lecture_tb__member_id=member_id,
                                                 lecture_tb__use=USE,
                                                 use=USE).annotate(member_auth=RawSQL(query_member_auth, []),
                                                                   ).order_by('-lecture_tb__start_date',
                                                                              '-lecture_tb__reg_dt')

            for lecture_info_data in lecture_data:
                lecture_info = lecture_info_data.lecture_tb
                package_info = lecture_info.package_tb
                if '\r\n' in lecture_info.note:
                    lecture_info.note = lecture_info.note.replace('\r\n', ' ')

                member_lecture_info = {'lecture_id': lecture_info.lecture_id,
                                       'lecture_package_name': package_info.name,
                                       'lecture_package_id': package_info.package_id,
                                       'lecture_state_cd': lecture_info.state_cd,
                                       'lecture_reg_count': lecture_info.lecture_reg_count,
                                       'lecture_rem_count': lecture_info.lecture_rem_count,
                                       'lecture_avail_count': lecture_info.lecture_avail_count,
                                       'lecture_start_date': lecture_info.start_date,
                                       'lecture_end_date': lecture_info.end_date,
                                       'lecture_price': lecture_info.price,
                                       'lecture_refund_date': lecture_info.refund_date,
                                       'lecture_refund_price': lecture_info.refund_price,
                                       'lecture_note': lecture_info.note}
                lecture_list[lecture_info.lecture_id] = member_lecture_info

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return JsonResponse(lecture_list, json_dumps_params={'ensure_ascii': True})


# 수강정보 추가
def add_lecture_info_logic(request):
    member_id = request.POST.get('member_id')
    contents = request.POST.get('contents', '')
    counts = request.POST.get('counts')
    price = request.POST.get('price')
    start_date = request.POST.get('start_date')
    end_date = request.POST.get('end_date')
    class_id = request.session.get('class_id', '')
    package_id = request.POST.get('package_id', '')
    next_page = request.POST.get('next_page')

    error = None

    if member_id is None or member_id == '':
        error = '오류가 발생했습니다.[tr:1972]'

    if counts == '':
        error = '등록 횟수를 입력해 주세요.'
    elif start_date == '':
        error = '시작 일자를 입력해 주세요.'

    if package_id == '':
        error = '수강권을 선택해 주세요.'

    if price == '':
        price = 0

    if end_date == '':
        end_date = '9999-12-31'

    if error is None:
        try:
            User.objects.get(id=member_id)
        except ObjectDoesNotExist:
            error = '가입되지 않은 회원입니다.'

    if error is None:
        error = func_add_lecture_info(request.user.id, class_id, package_id, counts, price, start_date, end_date,
                                      contents, member_id)
    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


def update_lecture_info_logic(request):
    lecture_id = request.POST.get('lecture_id', '')
    next_page = request.POST.get('next_page', '')
    error = None
    lecture_info = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    note = request.POST.get('note', lecture_info.note)
    start_date = request.POST.get('start_date', lecture_info.start_date)
    end_date = request.POST.get('end_date', lecture_info.end_date)
    price = request.POST.get('price', lecture_info.price)
    refund_price = request.POST.get('refund_price', lecture_info.refund_price)
    refund_date = request.POST.get('refund_date', lecture_info.refund_date)
    lecture_reg_count = request.POST.get('lecture_reg_count', lecture_info.lecture_reg_count)

    try:
        price = int(price)
    except ValueError:
        error = '수강 금액은 숫자만 입력 가능합니다.'

    try:
        refund_price = int(refund_price)
    except ValueError:
        error = '환불 금액은 숫자만 입력 가능합니다.'

    try:
        lecture_reg_count = int(lecture_reg_count)
    except ValueError:
        error = '등록 횟수는 숫자만 입력 가능합니다.'

    try:
        refund_date = datetime.datetime.strptime(refund_date, '%Y-%m-%d')
    except ValueError:
        error = '환불 날짜 오류가 발생했습니다.'
    except TypeError:
        error = '환불 날짜 오류가 발생했습니다.'

    finish_schedule_count = 0
    reserve_schedule_count = 0

    if error is None:
        schedule_list = ScheduleTb.objects.filter(lecture_tb=lecture_id, use=USE)
        if len(schedule_list) > 0:
            reserve_schedule_count = schedule_list.count()
            finish_schedule_count = schedule_list.filter(Q(state_cd='PE') | Q(state_cd='PC')).count()

    if error is None:
        if lecture_reg_count < reserve_schedule_count:
            error = '등록 횟수가 이미 등록한 일정의 횟수보다 적습니다.'

    if error is None:
        lecture_info.start_date = start_date
        lecture_info.end_date = end_date
        lecture_info.price = price
        lecture_info.refund_price = refund_price
        lecture_info.refund_date = refund_date
        lecture_info.note = note
        lecture_info.lecture_reg_count = lecture_reg_count
        lecture_info.lecture_rem_count = lecture_reg_count - finish_schedule_count
        lecture_info.lecture_avail_count = lecture_reg_count - reserve_schedule_count
        if lecture_info.state_cd == 'PE':
            lecture_info.lecture_rem_count = 0
            lecture_info.lecture_avail_count = 0
        lecture_info.save()

    if error is not None:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


def delete_lecture_info_logic(request):
    lecture_id = request.POST.get('lecture_id', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        error = func_delete_lecture_info(request.user.id, class_id, lecture_id)

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


def finish_lecture_info_logic(request):
    lecture_id = request.POST.get('lecture_id', '')
    member_id = request.POST.get('member_id', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None
    lecture_info = None
    member_info = None
    group_info = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            member_info = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '회원정보를 불러오지 못했습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    # if error is None:
    #     try:
    #         group_info = GroupLectureTb.objects.get(lecture_tb_id=lecture_id, use=USE)
    #     except ObjectDoesNotExist:
    #         group_info = None

    if error is None:
        now = timezone.now()
        # group_data = GroupLectureTb.objects.filter(lecture_tb_id=lecture_id, use=USE)
        # schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id).exclude(state_cd='PE')
        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_id,
                                                  end_dt__lte=now, use=USE).exclude(Q(state_cd='PE') | Q(state_cd='PC'))
        schedule_data_delete = ScheduleTb.objects.filter(lecture_tb_id=lecture_id,
                                                         end_dt__gt=now,
                                                         use=USE).exclude(Q(state_cd='PE') | Q(state_cd='PC'))
        repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_id)
        # func_refresh_lecture_count(lecture_id)

        if len(schedule_data) > 0:
            schedule_data.update(state_cd='PE')
        if len(schedule_data_delete) > 0:
            schedule_data_delete.delete()
        if len(repeat_schedule_data) > 0:
            repeat_schedule_data.delete()
        lecture_info.lecture_avail_count = 0
        lecture_info.lecture_rem_count = 0
        lecture_info.state_cd = 'PE'
        lecture_info.save()

        group_lecture_data = GroupLectureTb.objects.filter(lecture_tb_id=lecture_info.lecture_id, use=USE)
        group_lecture_data.update(fix_state_cd='')

        package_group_data = PackageGroupTb.objects.filter(package_tb_id=lecture_info.package_tb_id, use=USE)
        for package_group_info in package_group_data:
            func_refresh_group_status(package_group_info.group_tb_id, None, None)

    # if error is None:
    #     if group_info is not None:
    #         func_refresh_group_status(group_info.group_tb_id, None, None)

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


def refund_lecture_info_logic(request):
    lecture_id = request.POST.get('lecture_id', '')
    member_id = request.POST.get('member_id', '')
    refund_price = request.POST.get('refund_price', '')
    refund_date = request.POST.get('refund_date', datetime.date.today())
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    input_refund_price = 0
    error = None
    member_info = None
    group_info = None
    lecture_info = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        if refund_price is None or refund_price == 0:
            error = '환불 금액을 입력해 주세요.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            member_info = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '회원정보를 불러오지 못했습니다.'

    if error is None:
        try:
            input_refund_price = int(refund_price)
        except ValueError:
            error = '환불 금액은 숫자만 입력 가능합니다.'

    if error is None:
        if input_refund_price > lecture_info.price:
            error = '환불 금액이 등록 금액보다 많습니다.'
    #
    # if error is None:
    #     try:
    #         group_info = GroupLectureTb.objects.get(lecture_tb_id=lecture_id, use=USE)
    #     except ObjectDoesNotExist:
    #         group_info = None
    if error is None:
        now = timezone.now()
        # group_data = GroupLectureTb.objects.filter(lecture_tb_id=lecture_id, use=USE)
        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_id,
                                                  end_dt__lte=now, use=USE).exclude(Q(state_cd='PE') | Q(state_cd='PC'))
        schedule_data_delete = ScheduleTb.objects.filter(lecture_tb_id=lecture_id,
                                                         end_dt__gt=now,
                                                         use=USE).exclude(Q(state_cd='PE') | Q(state_cd='PC'))
        repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_id)

        if len(schedule_data) > 0:
            schedule_data.update(state_cd='PE')
        if len(schedule_data_delete) > 0:
            schedule_data_delete.delete()
        if len(repeat_schedule_data) > 0:
            repeat_schedule_data.delete()
        repeat_schedule_data.delete()
        lecture_info.refund_price = input_refund_price
        lecture_info.refund_date = refund_date
        lecture_info.lecture_avail_count = 0

        end_schedule_counter = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'),
                                                         lecture_tb_id=lecture_id).count()
        if lecture_info.lecture_reg_count >= end_schedule_counter:
            lecture_info.lecture_rem_count = lecture_info.lecture_reg_count\
                                               - end_schedule_counter
        # func_refresh_lecture_count(lecture_id)
        # lecture_info.lecture_rem_count = 0
        lecture_info.state_cd = 'RF'
        lecture_info.save()

        group_lecture_data = GroupLectureTb.objects.filter(lecture_tb_id=lecture_info.lecture_id, use=USE)
        group_lecture_data.update(fix_state_cd='')

        package_group_data = PackageGroupTb.objects.filter(package_tb_id=lecture_info.package_tb_id, use=USE)
        for package_group_info in package_group_data:
            func_refresh_group_status(package_group_info.group_tb_id, None, None)
    # if error is None:
    #     if group_info is not None:
    #         func_refresh_group_status(group_info.group_tb_id, None, None)

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


def progress_lecture_info_logic(request):
    lecture_id = request.POST.get('lecture_id', '')
    member_id = request.POST.get('member_id', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None
    lecture_info = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        if lecture_info.package_tb.use == UN_USE:
            error = '해당 수강권은 진행중 상태가 아닙니다.'
        else:
            if lecture_info.package_tb.state_cd != 'IP':
                error = '해당 수강권은 진행중 상태가 아닙니다.'

    if error is None:
        # group_data = GroupLectureTb.objects.filter(lecture_tb_id=lecture_id, use=USE)
        schedule_data_count = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id).count()
        schedule_data_finish_count = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'),
                                                               lecture_tb_id=lecture_info.lecture_id).count()

    if error is None:
        lecture_info.lecture_avail_count = lecture_info.lecture_reg_count - schedule_data_count
        lecture_info.lecture_rem_count = lecture_info.lecture_reg_count - schedule_data_finish_count
        lecture_info.refund_price = 0
        lecture_info.refund_date = None
        lecture_info.state_cd = 'IP'
        lecture_info.save()
        package_group_data = PackageGroupTb.objects.filter(package_tb_id=lecture_info.package_tb_id, use=USE)
        for package_group_info in package_group_data:
            func_refresh_group_status(package_group_info.group_tb_id, None, None)

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


def update_lecture_connection_info_logic(request):
    lecture_id = request.POST.get('lecture_id', '')
    member_id = request.POST.get('member_id', '')
    auth_cd = request.POST.get('member_view_state_cd', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None
    member_info = None
    class_info = None

    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '프로그램 정보를 불러오지 못했습니다.'

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        if auth_cd != 'VIEW' and auth_cd != 'WAIT' and auth_cd != 'DELETE':
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            member_info = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '회원정보를 불러오지 못했습니다.'

    if error is None:
        try:
            member_lecture_info = MemberLectureTb.objects.get(lecture_tb_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        class_lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id, auth_cd='VIEW', use=USE)
        check_lecture_connection = 0
        for class_lecture_info in class_lecture_list:
            try:
                MemberLectureTb.objects.get(member_id=member_id, auth_cd='VIEW',
                                            lecture_tb_id=class_lecture_info.lecture_tb_id, use=USE)
                check_lecture_connection = 1
            except ObjectDoesNotExist:
                check_lecture_connection = 0
            if check_lecture_connection == 1:
                break

        if check_lecture_connection > 0:
            if auth_cd == 'WAIT':
                auth_cd = 'VIEW'
        member_lecture_info.auth_cd = auth_cd
        member_lecture_info.save()

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


def add_group_info_logic(request):
    class_id = request.session.get('class_id', '')
    group_type_cd = request.POST.get('group_type_cd', '')
    member_num = request.POST.get('member_num', '')
    name = request.POST.get('name', '')
    note = request.POST.get('note', '')
    ing_color_cd = request.POST.get('ing_color_cd', '#ffd3d9')
    end_color_cd = request.POST.get('end_color_cd', '#d2d1cf')
    ing_font_color_cd = request.POST.get('ing_font_color_cd', '#282828')
    end_font_color_cd = request.POST.get('end_font_color_cd', '#282828')
    next_page = request.POST.get('next_page', '/trainer/get_group_ing_list/')
    error = None
    try:
        with transaction.atomic():
            group_info = GroupTb(class_tb_id=class_id, group_type_cd=group_type_cd, member_num=member_num,
                                 name=name, note=note, ing_color_cd=ing_color_cd, end_color_cd=end_color_cd,
                                 ing_font_color_cd=ing_font_color_cd, end_font_color_cd=end_font_color_cd,
                                 state_cd='IP', use=USE)

            group_info.save()
    except ValueError:
        error = '오류가 발생했습니다. [1]'
    except IntegrityError:
        error = '오류가 발생했습니다. [2]'
    except TypeError:
        error = '오류가 발생했습니다. [3]'
    except ValidationError:
        error = '오류가 발생했습니다. [4]'
    except InternalError:
        error = '오류가 발생했습니다. [5]'

    if error is not None:
        messages.error(request, error)

    return redirect(next_page)


def delete_group_info_logic(request):
    class_id = request.session.get('class_id', '')
    group_id = request.POST.get('group_id', '')
    next_page = request.POST.get('next_page', '/trainer/get_group_ing_list/')
    error = None
    group_info = None

    try:
        group_info = GroupTb.objects.get(group_id=group_id)
    except ObjectDoesNotExist:
        error = '오류가 발생했습니다.'

    package_data = PackageGroupTb.objects.filter(group_tb_id=group_id, use=USE)

    if error is None:
        group_data = GroupLectureTb.objects.select_related(
            'lecture_tb__package_tb', 'lecture_tb__member').filter(group_tb_id=group_id, use=USE)
    try:
        with transaction.atomic():

            if error is None:
                schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                          group_tb_id=group_id,
                                                          end_dt__lte=timezone.now(),
                                                          en_dis_type=ON_SCHEDULE_TYPE).exclude(Q(state_cd='PE')
                                                                                                | Q(state_cd='PC'))
                schedule_data_delete = ScheduleTb.objects.filter(class_tb_id=class_id, group_tb_id=group_id,
                                                                 # lecture_tb__isnull=True,
                                                                 end_dt__gt=timezone.now(),
                                                                 en_dis_type=ON_SCHEDULE_TYPE
                                                                 ).exclude(Q(state_cd='PE') | Q(state_cd='PC'))
                repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                       group_tb_id=group_id)
                schedule_data_finish = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'),
                                                                 class_tb_id=class_id,
                                                                 group_tb_id=group_id,
                                                                 en_dis_type=ON_SCHEDULE_TYPE)
                if len(schedule_data) > 0:
                    schedule_data.update(state_cd='PE', use=UN_USE)
                if len(schedule_data_delete) > 0:
                    schedule_data_delete.delete()
                if len(repeat_schedule_data) > 0:
                    repeat_schedule_data.delete()
                if len(schedule_data_finish) > 0:
                    schedule_data_finish.update(use=UN_USE)

            if error is None:
                if len(group_data) > 0:
                    group_data.update(use=UN_USE)

            if error is None:
                group_info.state_cd = 'PE'
                group_info.use = UN_USE
                group_info.save()
                if len(package_data) > 0:
                    package_data.update(use=UN_USE)

            if error is not None:
                raise InternalError

    except ValueError:
        error = '오류가 발생했습니다. [1]'
    except IntegrityError:
        error = '오류가 발생했습니다. [2]'
    except TypeError:
        error = '오류가 발생했습니다. [3]'
    except ValidationError:
        error = '오류가 발생했습니다. [4]'
    except InternalError:
        error = error

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


def update_group_info_logic(request):
    group_id = request.POST.get('group_id', '')
    group_type_cd = request.POST.get('group_type_cd', '')
    member_num = request.POST.get('member_num', '')
    name = request.POST.get('name', '')
    note = request.POST.get('note', '')
    ing_color_cd = request.POST.get('ing_color_cd', '')
    end_color_cd = request.POST.get('end_color_cd', '')
    ing_font_color_cd = request.POST.get('ing_font_color_cd', '')
    end_font_color_cd = request.POST.get('end_font_color_cd', '')
    next_page = request.POST.get('next_page', '/trainer/get_error_info/')
    group_info = None
    error = None

    try:
        group_info = GroupTb.objects.get(group_id=group_id)
    except ObjectDoesNotExist:
        error = '오류가 발생했습니다.'

    if error is None:

        if group_type_cd == '' or group_type_cd is None:
            group_type_cd = group_info.group_type_cd

        if member_num == '' or member_num is None:
            member_num = group_info.member_num

        if name == '' or name is None:
            name = group_info.name

        if note == '' or note is None:
            note = group_info.note

        if ing_color_cd == '' or ing_color_cd is None:
            ing_color_cd = group_info.ing_color_cd

        if end_color_cd == '' or end_color_cd is None:
            end_color_cd = group_info.end_color_cd

        if ing_font_color_cd == '' or ing_font_color_cd is None:
            ing_font_color_cd = group_info.ing_font_color_cd

        if end_font_color_cd == '' or end_font_color_cd is None:
            end_font_color_cd = group_info.end_font_color_cd

    if error is None:
        try:
            if int(member_num) <= 0:
                error = '정원은 1명 이상이어야 합니다.'
        except ValueError:
            error = '정원은 숫자만 입력 가능합니다.'
        except TypeError:
            error = '정원은 숫자만 입력 가능합니다.'

    if error is None:
        member_fix_data = []
        group_lecture_data = GroupLectureTb.objects.select_related(
            'lecture_tb__member').filter(group_tb_id=group_id, use=USE)
        for group_lecture_info in group_lecture_data:
            check = 0
            for member_fix_info in member_fix_data:
                if str(member_fix_info) == str(group_lecture_info.lecture_tb.member_id):
                    check = 1
            if check == 0:
                if group_lecture_info.fix_state_cd == 'FIX':
                    member_fix_data.append(group_lecture_info.lecture_tb.member_id)
        if int(member_num) < len(member_fix_data):
            error = '정원보다 고정인원이 많습니다.'

    if error is None:
        group_info.group_type_cd = group_type_cd
        group_info.member_num = member_num
        group_info.name = name
        group_info.note = note
        group_info.ing_color_cd = ing_color_cd
        group_info.end_color_cd = end_color_cd
        group_info.ing_font_color_cd = ing_font_color_cd
        group_info.end_font_color_cd = end_font_color_cd
        group_info.save()

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


class GetGroupInfoViewAjax(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = request.session.get('class_id', '')
        group_id = request.GET.get('group_id', '')

        return JsonResponse(func_get_group_info(class_id, group_id, request.user.id),
                            json_dumps_params={'ensure_ascii': True})


class GetGroupIngListViewAjax(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = request.session.get('class_id', '')
        error = None
        group_package_data = PackageGroupTb.objects.select_related(
            'package_tb', 'group_tb').filter(class_tb_id=class_id, group_tb__state_cd='IP', group_tb__use=USE,
                                             use=USE).order_by('group_tb_id', 'package_tb_id')

        group_data = collections.OrderedDict()
        temp_group_id = None
        group_package_list = []
        group_package_id_list = []
        for group_package_info in group_package_data:
            group_tb = group_package_info.group_tb
            package_tb = group_package_info.package_tb
            group_id = str(group_tb.group_id)

            if temp_group_id != group_id:
                temp_group_id = group_id
                group_package_list = []
                group_package_id_list = []

            if package_tb.state_cd == 'IP' and package_tb.use == USE:
                group_package_list.append(package_tb.name)
                group_package_id_list.append(package_tb.package_id)

            group_data[group_id] = {'group_id': group_id,
                                    'group_name': group_tb.name,
                                    'group_note': group_tb.note,
                                    'group_max_num': group_tb.member_num,
                                    'group_package_list': group_package_list,
                                    'group_package_id_list': group_package_id_list}
        group_list = []

        class_lecture_list = ClassLectureTb.objects.select_related(
            'lecture_tb__package_tb',
            'lecture_tb__member').filter(class_tb_id=class_id, auth_cd='VIEW',
                                         lecture_tb__package_tb__state_cd='IP',
                                         lecture_tb__package_tb__use=USE, lecture_tb__state_cd='IP',
                                         lecture_tb__use=USE,
                                         use=USE).order_by('lecture_tb__package_tb', 'lecture_tb__member')

        for group_info in group_data:
            member_list = {}
            for lecture_info in class_lecture_list:
                for package_info in group_data[group_info]['group_package_id_list']:
                    if lecture_info.lecture_tb.package_tb.package_id == package_info:
                        member_list[lecture_info.lecture_tb.member_id] = lecture_info.lecture_tb.member_id
            group_data[group_info]['group_ing_member_num'] = len(member_list)
            group_list.append(group_data[group_info])

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return JsonResponse({'current_group_data': group_list}, json_dumps_params={'ensure_ascii': True})


class GetGroupEndListViewAjax(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = request.session.get('class_id', '')
        error = None

        group_package_data = PackageGroupTb.objects.select_related(
            'package_tb', 'group_tb').filter(class_tb_id=class_id, group_tb__state_cd='PE', group_tb__use=USE,
                                             use=USE).order_by('group_tb_id', 'package_tb_id')

        group_data = collections.OrderedDict()
        temp_group_id = None
        group_package_list = []
        group_package_id_list = []
        for group_package_info in group_package_data:
            group_tb = group_package_info.group_tb
            package_tb = group_package_info.package_tb
            group_id = str(group_tb.group_id)

            if temp_group_id != group_id:
                temp_group_id = group_id
                group_package_list = []
                group_package_id_list = []

            if package_tb.use == USE:
                group_package_list.append(package_tb.name)
                group_package_id_list.append(package_tb.package_id)

            group_data[group_id] = {'group_id': group_id,
                                    'group_name': group_tb.name,
                                    'group_note': group_tb.note,
                                    'group_max_num': group_tb.member_num,
                                    'group_package_list': group_package_list,
                                    'group_package_id_list': group_package_id_list}
        group_list = []

        for group_info in group_data:
            group_list.append(group_data[group_info])

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return JsonResponse({'finish_group_data': group_list}, json_dumps_params={'ensure_ascii': True})


class GetGroupIngMemberListViewAjax(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = request.session.get('class_id', '')
        group_id = request.GET.get('group_id', '')
        error = None

        group_package_data = PackageGroupTb.objects.select_related(
            'package_tb', 'group_tb').filter(class_tb_id=class_id, group_tb_id=group_id, group_tb__use=USE,
                                             package_tb__state_cd='IP', package_tb__use=USE,
                                             use=USE).order_by('group_tb_id', 'package_tb_id')

        # 수업에 속한 수강권을 가지고 있는 회원들을 가지고 오기 위한 작업
        query_package_list = Q()
        for group_package_info in group_package_data:
            query_package_list |= Q(lecture_tb__package_tb_id=group_package_info.package_tb_id)

        query_lecture_count = "select count(*) from MEMBER_LECTURE_TB as A where A.LECTURE_TB_ID =" \
                              " `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and A.AUTH_CD=\'VIEW\' and" \
                              " A.USE=1"

        all_lecture_list = ClassLectureTb.objects.select_related(
            'lecture_tb__package_tb',
            'lecture_tb__member').filter(query_package_list, class_tb_id=class_id, auth_cd='VIEW',
                                         lecture_tb__package_tb__state_cd='IP',
                                         lecture_tb__package_tb__use=USE, lecture_tb__state_cd='IP',
                                         lecture_tb__use=USE,
                                         use=USE).annotate(lecture_count=RawSQL(query_lecture_count,
                                                                                [])).order_by('lecture_tb__member_id',
                                                                                              'lecture_tb__end_date')

        member_list = func_get_member_from_lecture_list(all_lecture_list, request.user.id)

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return JsonResponse({'group_ing_member_list': member_list}, json_dumps_params={'ensure_ascii': True})


def finish_group_info_logic(request):
    group_id = request.POST.get('group_id', '')
    error = None
    group_info = None
    now = timezone.now()
    if error is None:
        try:
            group_info = GroupTb.objects.get(group_id=group_id)
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(group_tb_id=group_id,
                                                  end_dt__lte=now, use=USE).exclude(Q(state_cd='PE') | Q(state_cd='PC'))
        schedule_data_delete = ScheduleTb.objects.filter(group_tb_id=group_id,
                                                         end_dt__gt=now, use=USE).exclude(Q(state_cd='PE')
                                                                                          | Q(state_cd='PC'))
        repeat_schedule_data = RepeatScheduleTb.objects.filter(group_tb_id=group_id)

        if len(schedule_data) > 0:
            schedule_data.update(state_cd='PE')
        if len(schedule_data_delete) > 0:
            schedule_data_delete.delete()
        if len(repeat_schedule_data) > 0:
            repeat_schedule_data.delete()

        group_info.state_cd = 'PE'
        group_info.save()

    if error is not None:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return render(request, 'ajax/trainer_error_ajax.html')


def progress_group_info_logic(request):
    group_id = request.POST.get('group_id', '')
    error = None
    group_info = None
    if error is None:
        try:
            group_info = GroupTb.objects.get(group_id=group_id)
        except ObjectDoesNotExist:
            error = '그룹 정보를 불러오지 못했습니다.'

        group_info.state_cd = 'IP'
        group_info.save()

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return render(request, 'ajax/trainer_error_ajax.html')


# 그룹 회원 삭제
def update_fix_group_member_logic(request):
    json_data = request.body.decode('utf-8')
    next_page = request.POST.get('next_page', '/trainer/get_group_ing_list/')
    json_loading_data = None
    error = None

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다. [1]'
    except TypeError:
        error = '오류가 발생했습니다. [2]'

    group_id = json_loading_data['group_id']
    try:
        group_info = GroupTb.objects.get(group_id=group_id, use=USE)
    except ObjectDoesNotExist:
        error = '오류가 발생했습니다.'

    if error is None:
        # idx = 0
        if error is None:
            member_fix_data = []
            fix_counter = 0
            group_lecture_data = GroupLectureTb.objects.select_related(
                'lecture_tb__member').filter(group_tb_id=group_id, use=USE)
            for group_lecture_info in group_lecture_data:
                check = 0
                for member_fix_info in member_fix_data:
                    if str(member_fix_info) == str(group_lecture_info.lecture_tb.member_id):
                        check = 1
                if check == 0:
                    if group_lecture_info.fix_state_cd == 'FIX':
                        member_fix_data.append(group_lecture_info.lecture_tb.member_id)

            for json_info in json_loading_data['member_info']:
                if json_info['fix_info'] == 'FIX':
                    fix_counter += 1
            if fix_counter != 0:
                if len(member_fix_data) + fix_counter > group_info.member_num:
                    error = '그룹 정원보다 고정 회원이 많습니다.'

    if error is None:
        try:
            with transaction.atomic():
                for json_info in json_loading_data['member_info']:
                    group_lecture_counter = GroupLectureTb.objects.select_related(
                        'lecture_tb__member').filter(group_tb_id=group_id,
                                                     lecture_tb__member_id=json_info['member_id'],
                                                     lecture_tb__state_cd='IP', use=USE).count()
                    if group_lecture_counter == 0:
                        error = '이미 종료된 회원입니다.'

                    if error is None and group_lecture_data is not None:
                        for group_lecture_info in group_lecture_data:
                            if str(group_lecture_info.lecture_tb.member_id) == str(json_info['member_id']):
                                group_lecture_info.fix_state_cd = json_info['fix_info']
                                group_lecture_info.save()

        except ValueError:
            error = '오류가 발생했습니다. [4]'
        except IntegrityError:
            error = '오류가 발생했습니다. [5]'
        except TypeError:
            error = '오류가 발생했습니다. [6]'
        except ValidationError:
            error = '오류가 발생했습니다. [7]'
        except InternalError:
            error = error

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


# 패키지 추가
def add_package_info_logic(request):
    class_id = request.session.get('class_id', '')
    json_data = request.body.decode('utf-8')
    next_page = request.POST.get('next_page', '/trainer/get_error_info/')
    json_loading_data = None
    error = None
    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다. [0]'
    except TypeError:
        error = '오류가 발생했습니다. [1]'

    if error is None:
        try:
            with transaction.atomic():

                package_name = json_loading_data['package_info']['package_name']
                if package_name is None or package_name == '':
                    error = '수강 이름을 입력하세요.'
                    raise InternalError

                if len(json_loading_data['new_package_group_data']) == 0:
                    error = '수강권은 1가지 이상의 수업을 선택하셔야 합니다.'
                    raise InternalError
                elif len(json_loading_data['new_package_group_data']) == 1:
                    group_id = json_loading_data['new_package_group_data'][0]['group_id']
                else:
                    error = '오류가 발생했습니다. [4]'

                package_info = PackageTb(class_tb_id=class_id, name=package_name,
                                         state_cd='IP',
                                         note=json_loading_data['package_info']['package_note'], use=USE)
                package_info.save()

                if json_loading_data['new_package_group_data'] != '[]':
                    for json_info in json_loading_data['new_package_group_data']:
                        if json_info['group_id'] is None or json_info['group_id'] == '':
                            error = '오류가 발생했습니다. [5]'
                            raise InternalError
                        else:

                            package_group_counter = PackageGroupTb.objects.filter(package_tb_id=package_info.package_id,
                                                                                  group_tb_id=json_info['group_id'],
                                                                                  use=USE).count()
                            if package_group_counter > 0:
                                error = '오류가 발생했습니다. [6]'
                                raise InternalError

                            if error is None:
                                package_group_info = PackageGroupTb(class_tb_id=class_id,
                                                                    package_tb_id=package_info.package_id,
                                                                    group_tb_id=json_info['group_id'],
                                                                    use=USE)
                                package_group_info.save()

        except InternalError:
            error = error

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


# 패키지 삭제
def delete_package_info_logic(request):
    class_id = request.session.get('class_id', '')
    package_id = request.POST.get('package_id', '')
    next_page = request.POST.get('next_page', '/trainer/get_error_info/')
    error = None
    package_info = None
    try:
        package_info = PackageTb.objects.get(class_tb_id=class_id, package_id=package_id)
    except ObjectDoesNotExist:
        error = '오류가 발생했습니다. [0]'

    if error is None:
        try:
            with transaction.atomic():
                if error is None:
                    package_group_data = PackageGroupTb.objects.filter(class_tb_id=class_id, package_tb_id=package_id,
                                                                       use=USE)
                    for package_group_info in package_group_data:
                        package_group_info.use = UN_USE
                        package_group_info.save()
                        func_refresh_group_status(package_group_info.group_tb_id, None, None)

                package_info.state_cd = 'PE'
                package_info.use = UN_USE
                package_info.save()

        except ValueError:
            error = '오류가 발생했습니다. [1]'
        except IntegrityError:
            error = '오류가 발생했습니다. [2]'
        except TypeError:
            error = '오류가 발생했습니다. [3]'
        except ValidationError:
            error = '오류가 발생했습니다. [4]'

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


# 패키지 추가
def update_package_info_logic(request):
    class_id = request.session.get('class_id', '')
    package_id = request.POST.get('package_id', '')
    package_name = request.POST.get('package_name', '')
    package_note = request.POST.get('package_note', '')
    next_page = request.POST.get('next_page', '/trainer/get_error_info/')
    error = None
    try:
        package_info = PackageTb.objects.get(class_tb_id=class_id, package_id=package_id)
    except ObjectDoesNotExist:
        error = '오류가 발생했습니다. [0]'
    if error is None:
        if package_name is not None and package_name != '':
            package_info.name = package_name
        if package_note is not None and package_note != '':
            package_info.note = package_note
        package_info.save()

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


# 패키지에 그룹 추가
def add_package_group_info_logic(request):
    class_id = request.session.get('class_id', '')
    package_id = request.POST.get('package_id', '')
    group_id = request.POST.get('group_id', '')
    next_page = request.POST.get('next_page', '/trainer/get_error_info/')
    error = None
    package_group_counter = PackageGroupTb.objects.filter(package_tb_id=package_id, group_tb_id=group_id,
                                                          use=USE).count()
    if package_group_counter > 0:
        error = '이미 포함된 그룹입니다.'

    if error is None:
        try:
            with transaction.atomic():
                package_group_info = PackageGroupTb(class_tb_id=class_id, package_tb_id=package_id,
                                                    group_tb_id=group_id, use=USE)
                package_group_info.save()
                package_group_lecture_data = ClassLectureTb.objects.select_related(
                    'lecture_tb__member').filter(class_tb_id=class_id, auth_cd='VIEW',
                                                 lecture_tb__package_tb_id=package_id,
                                                 lecture_tb__use=USE, use=USE)

                query_class_count = "select count(*) from CLASS_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                                    "`GROUP_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and " \
                                    " B.USE=1"
                for package_group_lecture_info in package_group_lecture_data:

                    group_lecture_counter = GroupLectureTb.objects.filter(
                        group_tb_id=package_group_info.group_tb_id,
                        lecture_tb__member_id=package_group_lecture_info.lecture_tb.member_id,
                        lecture_tb__state_cd='IP', lecture_tb__use=USE, fix_state_cd='FIX',
                        use=USE).annotate(class_count=RawSQL(query_class_count,
                                                             [])).filter(class_count__gte=1).count()
                    if group_lecture_counter > 0:
                        fix_state_cd = 'FIX'
                    else:
                        fix_state_cd = ''
                    group_lecture_info = GroupLectureTb(group_tb_id=package_group_info.group_tb_id,
                                                        lecture_tb_id=package_group_lecture_info.lecture_tb_id,
                                                        fix_state_cd=fix_state_cd, use=USE)
                    group_lecture_info.save()
                func_refresh_group_status(group_id, None, None)

        except ValueError:
            error = '오류가 발생했습니다.'
        except IntegrityError:
            error = '오류가 발생했습니다.'
        except TypeError:
            error = '오류가 발생했습니다.'
        except ValidationError:
            error = '오류가 발생했습니다.'
        except InternalError:
            error = '오류가 발생했습니다.'

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


# 패키지에서 그룹 삭제
def delete_package_group_info_logic(request):
    class_id = request.session.get('class_id', '')
    package_id = request.POST.get('package_id', '')
    group_id = request.POST.get('group_id', '')
    next_page = request.POST.get('next_page', '/trainer/get_error_info/')
    error = None

    if error is None:
        try:
            with transaction.atomic():
                # 그룹에 패키지에서 제외되도록 설정
                package_group_data = PackageGroupTb.objects.filter(class_tb_id=class_id,
                                                                   package_tb_id=package_id, group_tb_id=group_id,
                                                                   use=USE)
                package_group_data.update(use=UN_USE)

                # 그룹이 회원의 수강권에서 제외되도록 설정
                package_group_lecture_data = GroupLectureTb.objects.filter(group_tb_id=group_id,
                                                                           lecture_tb__package_tb_id=package_id)
                package_group_lecture_data.update(fix_state_cd='', use=UN_USE)

                class_lecture_data = ClassLectureTb.objects.select_related(
                    'lecture_tb__package_tb').filter(class_tb_id=class_id,
                                                     lecture_tb__package_tb_id=package_id,
                                                     auth_cd='VIEW', lecture_tb__state_cd='IP',
                                                     lecture_tb__use=USE, use=USE)

                schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                          lecture_tb__package_tb_id=package_id,
                                                          group_tb_id=group_id,
                                                          end_dt__lte=timezone.now(),
                                                          en_dis_type=ON_SCHEDULE_TYPE
                                                          ).exclude(Q(state_cd='PE') | Q(state_cd='PC'))
                schedule_data_delete = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                 lecture_tb__package_tb_id=package_id,
                                                                 group_tb_id=group_id,
                                                                 # lecture_tb__isnull=True,
                                                                 end_dt__gt=timezone.now(),
                                                                 en_dis_type=ON_SCHEDULE_TYPE
                                                                 ).exclude(Q(state_cd='PE')
                                                                           | Q(state_cd='PC'))
                repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                       lecture_tb__package_tb_id=package_id,
                                                                       group_tb_id=group_id)
                if len(schedule_data) > 0:
                    schedule_data.update(state_cd='PE')
                if len(schedule_data_delete) > 0:
                    schedule_data_delete.delete()
                if len(repeat_schedule_data) > 0:
                    repeat_schedule_data.delete()
                for class_lecture_info in class_lecture_data:
                    error = func_refresh_lecture_count(class_lecture_info.class_tb_id,
                                                       class_lecture_info.lecture_tb_id)

                func_refresh_group_status(group_id, None, None)

                if error is not None:
                    raise InternalError

        except ValueError:
            error = '오류가 발생했습니다.'
        except IntegrityError:
            error = '오류가 발생했습니다.'
        except TypeError:
            error = '오류가 발생했습니다.'
        except ValidationError:
            error = '오류가 발생했습니다.'
        except InternalError:
            error = error

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


class GetPackageInfoViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/group_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetPackageInfoViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        package_id = self.request.GET.get('ticket_id')

        context['ticket_info'] = func_get_package_info(class_id, package_id, self.request.user.id)

        return context


class GetPackageIngListViewAjax(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = self.request.session.get('class_id', '')
        page = self.request.GET.get('page', 0)
        package_sort = self.request.GET.get('sort_val', SORT_PACKAGE_TYPE)
        sort_order_by = self.request.GET.get('sort_order_by', SORT_ASC)
        keyword = self.request.GET.get('keyword', '')
        sort_info = int(package_sort)
        error = None
        # start_time = timezone.now()

        package_group_data = PackageGroupTb.objects.select_related(
            'package_tb', 'group_tb').filter(class_tb_id=class_id, package_tb__state_cd='IP', package_tb__use=USE,
                                             use=USE).order_by('package_tb_id', 'group_tb_id')

        package_data = collections.OrderedDict()
        temp_package_id = None
        package_group_list = []
        package_group_id_list = []
        for package_group_info in package_group_data:
            package_tb = package_group_info.package_tb
            group_tb = package_group_info.group_tb
            package_id = str(package_tb.package_id)
            if temp_package_id != package_id:
                temp_package_id = package_id
                package_group_list = []
                package_group_id_list = []
            if group_tb.state_cd == 'IP' and group_tb.use == USE:
                package_group_list.append(group_tb.name)
                package_group_id_list.append(group_tb.group_id)
            package_data[package_id] = {'package_id': package_id,
                                        'package_name': package_tb.name,
                                        'package_note': package_tb.note,
                                        'package_group_list': package_group_list,
                                        'package_group_id_list': package_group_id_list}
        package_list = []
        class_lecture_list = ClassLectureTb.objects.select_related(
            'lecture_tb__package_tb',
            'lecture_tb__member').filter(class_tb_id=class_id, auth_cd='VIEW',
                                         lecture_tb__package_tb__state_cd='IP',
                                         lecture_tb__package_tb__use=USE, lecture_tb__state_cd='IP',
                                         lecture_tb__use=USE,
                                         use=USE).order_by('lecture_tb__package_tb', 'lecture_tb__member')

        for package_info in package_data:
            member_list = {}
            for lecture_info in class_lecture_list:
                package_id = lecture_info.lecture_tb.package_tb_id
                if package_id == package_info:
                    member_id = lecture_info.lecture_tb.member_id
                    member_list[member_id] = member_id
            package_data[package_info]['package_ing_member_num'] = len(member_list)
            package_list.append(package_data[package_info])
        # package_data = PackageTb.objects.filter(class_tb_id=class_id, state_cd='IP',
        #                                         use=USE).filter(name__contains=keyword).order_by('name')

        # order = ['ONE_TO_ONE', 'NORMAL', 'EMPTY', 'PACKAGE']
        # order = {key: i for i, key in enumerate(order)}
        # package_data = sorted(package_data, key=lambda package_info: order.get(package_info.package_type_cd, 0))

        # package_data = sorted(package_data, key=lambda package_info: order.get(package_info.package_type_cd,
        #                                                                        sort_order_by))
        # if keyword == '' or keyword is None:
        #     if sort_info == SORT_PACKAGE_MEMBER_COUNT:
        #         package_data = package_data[0:1] + sorted(package_data[1:], key=attrgetter('ing_package_member_num'),
        #                                                   reverse=int(sort_order_by))
        #     if sort_info == SORT_PACKAGE_NAME:
        #         package_data = package_data[0:1] + sorted(package_data[1:], key=attrgetter('name'),
        #                                                   reverse=int(sort_order_by))
        #     elif sort_info == SORT_PACKAGE_CREATE_DATE:
        #         package_data = package_data[0:1] + sorted(package_data[1:], key=attrgetter('reg_dt'),
        #                                                   reverse=int(sort_order_by))
        # else:
        #     if sort_info == SORT_PACKAGE_MEMBER_COUNT:
        #         package_data = sorted(package_data, key=attrgetter('ing_package_member_num'),
        #                               reverse=int(sort_order_by))
        #     if sort_info == SORT_PACKAGE_NAME:
        #         package_data = sorted(package_data, key=attrgetter('name'),
        #                               reverse=int(sort_order_by))
        #     elif sort_info == SORT_PACKAGE_CREATE_DATE:
        #         package_data = sorted(package_data, key=attrgetter('reg_dt'),
        #                               reverse=int(sort_order_by))
        #
        # context['total_package_num'] = len(package_data)
        # if page != 0:
        #     paginator = Paginator(package_data, 20)  # Show 20 contacts per page
        #     try:
        #         package_data = paginator.page(page)
        #     except EmptyPage:
        #         package_data = None
        #
        # if package_data is not None:
        #
        #     for package_info in package_data:
        #         package_info.package_group_data = PackageGroupTb.objects.select_related(
        #             'group_tb').filter(class_tb_id=class_id, group_tb__state_cd='IP',
        #                                package_tb_id=package_info.package_id, group_tb__use=USE,
        #                                use=USE).order_by('-group_tb__group_type_cd', '-group_tb__name')

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        # context['package_data'] = package_data

        # end_time = timezone.now()
        return JsonResponse({'current_package_data': package_list}, json_dumps_params={'ensure_ascii': True})


class GetPackageEndListViewAjax(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        class_id = self.request.session.get('class_id', '')

        page = self.request.GET.get('page', 0)
        package_sort = self.request.GET.get('sort_val', SORT_PACKAGE_TYPE)
        sort_order_by = self.request.GET.get('sort_order_by', SORT_ASC)
        keyword = self.request.GET.get('keyword', '')
        sort_info = int(package_sort)

        error = None

        package_group_data = PackageGroupTb.objects.select_related(
            'package_tb', 'group_tb').filter(class_tb_id=class_id, package_tb__state_cd='PE', package_tb__use=USE,
                                             use=USE).order_by('package_tb_id', 'group_tb_id')

        package_data = collections.OrderedDict()
        temp_package_id = None
        package_group_list = []
        package_group_id_list = []
        for package_group_info in package_group_data:
            package_tb = package_group_info.package_tb
            group_tb = package_group_info.group_tb
            package_id = str(package_tb.package_id)
            if temp_package_id != package_id:
                temp_package_id = package_id
                package_group_list = []
                package_group_id_list = []

            if group_tb.use == USE:
                package_group_list.append(group_tb.name)
                package_group_id_list.append(group_tb.group_id)
            package_data[package_id] = {'package_id': package_id,
                                        'package_name': package_tb.name,
                                        'package_note': package_tb.note,
                                        'package_group_list': package_group_list,
                                        'package_group_id_list': package_group_id_list}
        package_list = []
        class_lecture_list = ClassLectureTb.objects.select_related(
            'lecture_tb__package_tb',
            'lecture_tb__member').filter(class_tb_id=class_id, auth_cd='VIEW',
                                         lecture_tb__package_tb__state_cd='PE',
                                         lecture_tb__package_tb__use=USE,
                                         lecture_tb__use=USE,
                                         use=USE).order_by('lecture_tb__package_tb', 'lecture_tb__member')

        for package_info in package_data:
            member_list = {}
            for lecture_info in class_lecture_list:
                package_id = lecture_info.lecture_tb.package_tb_id
                if package_id == package_info:
                    member_id = lecture_info.lecture_tb.member_id
                    member_list[member_id] = member_id
            package_data[package_info]['package_end_member_num'] = len(member_list)
            package_list.append(package_data[package_info])

        # if keyword == '' or keyword is None:
        #     if sort_info == SORT_PACKAGE_MEMBER_COUNT:
        #         package_data = package_data[0:1] + sorted(package_data[1:], key=attrgetter('ing_package_member_num'),
        #                                                   reverse=int(sort_order_by))
        #     if sort_info == SORT_PACKAGE_NAME:
        #         package_data = package_data[0:1] + sorted(package_data[1:], key=attrgetter('name'),
        #                                                   reverse=int(sort_order_by))
        #     elif sort_info == SORT_PACKAGE_CREATE_DATE:
        #         package_data = package_data[0:1] + sorted(package_data[1:], key=attrgetter('reg_dt'),
        #                                                   reverse=int(sort_order_by))
        # else:
        #     if sort_info == SORT_PACKAGE_MEMBER_COUNT:
        #         package_data = sorted(package_data, key=attrgetter('ing_package_member_num'),
        #                               reverse=int(sort_order_by))
        #     if sort_info == SORT_PACKAGE_NAME:
        #         package_data = sorted(package_data, key=attrgetter('name'),
        #                               reverse=int(sort_order_by))
        #     elif sort_info == SORT_PACKAGE_CREATE_DATE:
        #         package_data = sorted(package_data, key=attrgetter('reg_dt'),
        #                               reverse=int(sort_order_by))

        # context['total_package_num'] = len(package_data)
        # if page != 0:
        #     paginator = Paginator(package_data, 20)  # Show 20 contacts per page
        #     try:
        #         package_data = paginator.page(page)
        #     except EmptyPage:
        #         package_data = None
        #
        # if package_data is not None:
        #     for package_info in package_data:
        #         if package_info.state_cd == 'IP':
        #             package_info.package_group_data = PackageGroupTb.objects.select_related(
        #                 'group_tb').filter(class_tb_id=class_id,
        #                                    package_tb_id=package_info.package_id, group_tb__state_cd='IP',
        #                                    use=USE).order_by('-group_tb__group_type_cd', '-group_tb__name')
        #
        #         else:
        #             package_info.package_group_data = PackageGroupTb.objects.select_related(
        #                 'group_tb').filter(class_tb_id=class_id,
        #                                    package_tb_id=package_info.package_id, group_tb__use=USE,
        #                                    use=USE).order_by('-group_tb__group_type_cd', '-group_tb__name')

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        # context['package_data'] = package_data
        return JsonResponse({'finish_package_data': package_list}, json_dumps_params={'ensure_ascii': True})


class GetPackageIngMemberListViewAjax(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        # context = {}
        class_id = self.request.session.get('class_id', '')
        package_id = self.request.GET.get('package_id', '')
        error = None
        # member_data = []

        query_lecture_count = "select count(*) from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID =" \
                              " `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and" \
                              " B.USE=1"

        all_lecture_list = ClassLectureTb.objects.select_related(
            'lecture_tb__package_tb',
            'lecture_tb__member__user'
        ).filter(class_tb_id=class_id, auth_cd='VIEW', lecture_tb__package_tb_id=package_id, lecture_tb__state_cd='IP',
                 lecture_tb__use=USE, use=USE).annotate(lecture_count=RawSQL(query_lecture_count,
                                                                             [])).order_by('lecture_tb__member_id',
                                                                                           'lecture_tb__end_date')
        member_list = func_get_member_from_lecture_list(all_lecture_list, request.user.id)

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        return JsonResponse({'package_ing_member_list': member_list}, json_dumps_params={'ensure_ascii': True})


class GetPackageEndMemberListViewAjax(LoginRequiredMixin, AccessTestMixin, View):

    def get(self, request):
        # context = {}
        class_id = self.request.session.get('class_id', '')
        package_id = self.request.GET.get('package_id', '')
        error = None

        query_lecture_count = "select count(*) from MEMBER_LECTURE_TB as A where A.LECTURE_TB_ID =" \
                              " `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and A.AUTH_CD=\'VIEW\' and" \
                              " A.USE=1"
        query_lecture_ip_count = "select count(*) from LECTURE_TB as C where C.MEMBER_ID" \
                                 "=(select B.MEMBER_ID from LECTURE_TB as B where B.ID =" \
                                 " `CLASS_LECTURE_TB`.`LECTURE_TB_ID`)" \
                                 " and " + class_id + \
                                 " = (select D.CLASS_TB_ID from CLASS_LECTURE_TB as D" \
                                 " where D.LECTURE_TB_ID=C.ID and D.CLASS_TB_ID=" + class_id + ")" \
                                 " and C.STATE_CD=\'IP\' and C.PACKAGE_TB_ID=" + package_id + " and C.USE=1"

        all_lecture_list = ClassLectureTb.objects.select_related(
            'lecture_tb__package_tb',
            'lecture_tb__member__user'
        ).filter(~Q(lecture_tb__state_cd='IP'), class_tb_id=class_id, auth_cd='VIEW',
                 lecture_tb__package_tb_id=package_id, lecture_tb__use=USE,
                 use=USE).annotate(lecture_count=RawSQL(query_lecture_count, []),
                                   lecture_ip_count=RawSQL(query_lecture_ip_count, [])
                                   ).filter(lecture_ip_count=0).order_by('lecture_tb__member_id',
                                                                         'lecture_tb__end_date')

        member_list = func_get_member_from_lecture_list(all_lecture_list, request.user.id)

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        return JsonResponse({'package_end_member_list': member_list}, json_dumps_params={'ensure_ascii': True})


def finish_package_info_logic(request):
    # next_page = request.POST.get('next_page', '')
    package_id = request.POST.get('package_id', '')
    class_id = request.session.get('class_id', '')
    error = None
    package_info = None
    now = timezone.now()

    if error is None:
        try:
            package_info = PackageTb.objects.get(package_id=package_id)
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'

    if error is None:
        package_group_data = PackageGroupTb.objects.select_related('group_tb').filter(
            package_tb_id=package_id, group_tb__use=USE, use=USE)

        package_lecture_data = ClassLectureTb.objects.select_related(
            'lecture_tb').filter(class_tb_id=class_id, lecture_tb__package_tb_id=package_id, auth_cd='VIEW', use=USE)

    if error is None:

        if package_lecture_data is not None:
            for package_lecture_info in package_lecture_data:
                lecture_info = package_lecture_info.lecture_tb
                schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                          end_dt__lte=now,
                                                          use=USE).exclude(Q(state_cd='PE') | Q(state_cd='PC'))
                schedule_data_delete = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                 end_dt__gt=now,
                                                                 use=USE).exclude(Q(state_cd='PE') | Q(state_cd='PC'))
                repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
                # func_refresh_lecture_count(lecture_id)
                if len(schedule_data) > 0:
                    schedule_data.update(state_cd='PE')
                if len(schedule_data_delete) > 0:
                    schedule_data_delete.delete()
                if len(repeat_schedule_data) > 0:
                    repeat_schedule_data.delete()
                schedule_data_finish = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'),
                                                                 lecture_tb_id=lecture_info.lecture_id)
                lecture_info.lecture_avail_count = 0
                if lecture_info.state_cd == 'RF':
                    lecture_info.lecture_rem_count = lecture_info.lecture_reg_count - len(schedule_data_finish)
                else:
                    lecture_info.lecture_rem_count = 0
                    lecture_info.state_cd = 'PE'
                lecture_info.save()

                query_class_count = "select count(*) from CLASS_LECTURE_TB as B where B.LECTURE_TB_ID = " \
                                    "`GROUP_LECTURE_TB`.`LECTURE_TB_ID` and B.AUTH_CD=\'VIEW\' and " \
                                    " B.USE=1"

                group_lecture_data = GroupLectureTb.objects.filter(lecture_tb_id=package_lecture_info.lecture_tb_id,
                                                                   lecture_tb__state_cd='IP',
                                                                   use=USE)
                group_lecture_data.update(fix_state_cd='')

    if error is None:
        for package_group_info in package_group_data:
            func_refresh_group_status(package_group_info.group_tb_id, None, None)

    if error is None:
        package_info.state_cd = 'PE'
        package_info.save()

    if error is None:
        # log_data = LogTb(log_type='LP03', auth_member_id=request.user.id,
        #                  from_member_name=request.user.last_name + request.user.first_name,
        #                  class_tb_id=class_id,
        #                  log_info=package_info.name + package_info.name + ' 수강권',
        #                  log_how='완료 처리', use=USE)
        #
        # log_data.save()

        return render(request, 'ajax/trainer_error_ajax.html')
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return render(request, 'ajax/trainer_error_ajax.html')


def progress_package_info_logic(request):
    package_id = request.POST.get('package_id', '')
    class_id = request.session.get('class_id', '')
    error = None
    if error is None:
        try:
            package_info = PackageTb.objects.get(package_id=package_id)
        except ObjectDoesNotExist:
            error = '수강권 정보를 불러오지 못했습니다.'

    if error is None:
        package_group_data = PackageGroupTb.objects.select_related('group_tb').filter(
            package_tb_id=package_id, group_tb__state_cd='IP', group_tb__use=USE, use=USE)
        if len(package_group_data) == 0:
            error = '수강권에 소속된 진행중 그룹이 없어 재개할수 없습니다.'

    if error is None:
        for package_group_info in package_group_data:
            # package_group_info.use = USE
            # package_group_info.save()
            func_refresh_group_status(package_group_info.group_tb_id, None, None)

    if error is None:
        package_info.state_cd = 'IP'
        package_info.save()

    if error is None:
        # log_data = LogTb(log_type='LP03', auth_member_id=request.user.id,
        #                  from_member_name=request.user.last_name + request.user.first_name,
        #                  class_tb_id=class_id,
        #                  log_info=package_info.name + package_info.name + ' 수강권',
        #                  log_how='재개', use=USE)
        #
        # log_data.save()

        return render(request, 'ajax/trainer_error_ajax.html')
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return render(request, 'ajax/trainer_error_ajax.html')


class GetPackageGroupListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/package_group_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetPackageGroupListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        package_id = self.request.GET.get('package_id', '')
        error = None

        package_group_data = PackageGroupTb.objects.select_related(
            'group_tb').filter(class_tb_id=class_id, group_tb__state_cd='IP',
                               package_tb_id=package_id, group_tb__use=USE,
                               use=USE).order_by('-group_tb__group_type_cd', '-group_tb_id')

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['package_group_data'] = package_group_data

        return context


class GetEndPackageGroupListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/package_group_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetEndPackageGroupListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        package_id = self.request.GET.get('package_id', '')
        error = None
        try:
            package_info = PackageTb.objects.get(package_id=package_id)
        except ObjectDoesNotExist:
            error = '수강권 정보를 불러오지 못했습니다.'

        if error is None:
            if package_info.state_cd == 'IP':
                package_group_data = PackageGroupTb.objects.select_related(
                    'group_tb').filter(class_tb_id=class_id,
                                       package_tb_id=package_id, group_tb__state_cd='IP',
                                       use=USE).order_by('-group_tb__group_type_cd', '-group_tb_id')

            else:
                package_group_data = PackageGroupTb.objects.select_related(
                    'group_tb').filter(class_tb_id=class_id,
                                       package_tb_id=package_id, group_tb__use=USE,
                                       use=USE).order_by('-group_tb__group_type_cd', '-group_tb_id')

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['package_group_data'] = package_group_data

        return context


def add_package_member_logic(request):
    class_id = request.session.get('class_id', '')
    json_data = request.body.decode('utf-8')
    next_page = request.POST.get('next_page', '/trainer/get_package_ing_list/')
    json_loading_data = None
    error = None
    user_db_id_list = []
    user_name_list = []
    package_info = None
    package_id = None
    setting_lecture_auto_finish = request.session.get('setting_lecture_auto_finish', AUTO_FINISH_OFF)

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다.'
    except TypeError:
        error = '오류가 발생했습니다.'

    if error is None:
        package_id = json_loading_data['lecture_info']['package_id']

    if error is None:
        try:
            package_info = PackageTb.objects.get(package_id=package_id, use=USE)
        except ObjectDoesNotExist:
            error = '수강권 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            with transaction.atomic():

                if json_loading_data['new_member_data'] != '[]':
                    for json_info in json_loading_data['new_member_data']:
                        context = add_member_no_email_func(request.user.id,
                                                           json_info['first_name'], json_info['last_name'],
                                                           json_info['phone'], json_info['sex'],
                                                           json_info['birthday_dt'])

                        if context['error'] is None:
                            user_name_list.append(json_info['last_name'] + json_info['first_name'])
                            user_db_id_list.append(context['user_db_id'])
                        else:
                            error = context['error']
                            break

                if error is None:
                    if json_loading_data['old_member_data'] != '[]':
                        for json_info in json_loading_data['old_member_data']:
                            user_db_id_list.append(json_info['db_id'])

                if error is None:
                    for user_info in user_db_id_list:
                        error = func_add_lecture_info(request.user.id, class_id, package_id,
                                                      json_loading_data['lecture_info']['counts'],
                                                      json_loading_data['lecture_info']['price'],
                                                      json_loading_data['lecture_info']['start_date'],
                                                      json_loading_data['lecture_info']['end_date'],
                                                      json_loading_data['lecture_info']['memo'],
                                                      user_info)
                if error is not None:
                    raise InternalError
        except InternalError:
            error = error

    if error is not None:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(
            request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


# 패키지 회원 삭제
def delete_package_member_info_logic(request):
    class_id = request.session.get('class_id', '')
    json_data = request.body.decode('utf-8')
    next_page = request.POST.get('next_page', '/trainer/get_group_ing_list/')
    json_loading_data = None
    error = None

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다.'
    except TypeError:
        error = '오류가 발생했습니다.'

    package_id = json_loading_data['package_id']

    if error is None:
        # idx = 0
        for member_id_info in json_loading_data['ids']:
            member_name = None
            package_lecture_data = None
            if error is None:
                try:
                    user = User.objects.get(id=member_id_info)
                except ObjectDoesNotExist:
                    error = '회원 ID를 확인해 주세요.'
                try:
                    member = MemberTb.objects.get(user_id=user.id)
                    member_name = member.name
                except ObjectDoesNotExist:
                    error = '회원 ID를 확인해 주세요.'
            if error is None:
                package_lecture_data = ClassLectureTb.objects.select_related(
                    'lecture_tb__package_tb').filter(class_tb_id=class_id, auth_cd='VIEW',
                                                     lecture_tb__package_tb_id=package_id,
                                                     lecture_tb__member_id=user.id,
                                                     lecture_tb__use=USE,
                                                     use=USE)
            if error is None:
                try:
                    with transaction.atomic():
                        if package_lecture_data is not None:
                            for package_lecture_info in package_lecture_data:
                                error = func_delete_lecture_info(request.user.id, class_id,
                                                                 package_lecture_info.lecture_tb.lecture_id,
                                                                 member_id_info)
                                if error is not None:
                                    break

                        if error is not None:
                            raise InternalError(str(error))

                except ValueError:
                    error = '오류가 발생했습니다.'
                except IntegrityError:
                    error = '오류가 발생했습니다.'
                except TypeError:
                    error = '오류가 발생했습니다.'
                except ValidationError:
                    error = '오류가 발생했습니다.'
                except InternalError:
                    error = error

            # log_data = LogTb(log_type='LB02', auth_member_id=request.user.id,
            #                  from_member_name=request.user.last_name + request.user.first_name,
            #                  to_member_name=member_name, class_tb_id=class_id,
            #                  log_info='수강권',
            #                  log_how='삭제', use=USE)
            # log_data.save()

    if error is None:

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)



class GetClassListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = "ajax/trainer_class_ajax.html"

    def get_context_data(self, **kwargs):
        context = super(GetClassListViewAjax, self).get_context_data(**kwargs)
        member_class_data = None
        error = None
        if error is None:
            member_class_data = MemberClassTb.objects.select_related('class_tb'
                                                                     ).filter(member_id=self.request.user.id,
                                                                              auth_cd__contains='VIEW',
                                                                              use=USE).order_by('-reg_dt')

        if error is None:
            for class_auth_info in member_class_data:

                class_info = class_auth_info.class_tb
                all_member = func_get_class_member_ing_list(class_info.class_id, '')
                total_member_num = len(all_member)
                class_info.subject_type_name = class_info.get_class_type_cd_name()
                class_info.state_cd_name = class_info.get_state_cd_name()
                class_info.total_member_num = total_member_num

        context['class_data'] = member_class_data

        if error is not None:
            messages.error(self.request, error)

        return context


class AddClassInfoView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'ajax/trainer_error_ajax.html'

    def post(self, request):
        center_id = request.POST.get('center_id', '')
        subject_cd = request.POST.get('subject_cd', '')
        subject_detail_nm = request.POST.get('subject_detail_nm', '')
        start_date = request.POST.get('start_date', '')
        end_date = request.POST.get('end_date', '')
        class_hour = request.POST.get('class_hour', 60)
        start_hour_unit = request.POST.get('start_hour_unit', 1)
        class_member_num = request.POST.get('class_member_num', '')

        error = None
        class_info = None

        if subject_cd is None or subject_cd == '':
            error = '프로그램 종류를 설정해주세요.'

        if class_hour is None or class_hour == '':
            class_hour = 60

        if start_hour_unit is None or start_hour_unit == '':
            start_hour_unit = 1

        if start_date is None or start_date == '':
            start_date = datetime.date.today()
        if end_date is None or end_date == '':
            end_date = start_date + timezone.timedelta(days=3650)

        if subject_detail_nm is None:
            subject_detail_nm = ''

        if class_member_num is None or class_member_num == '':
            error = '수업당 최대 허용 인원을 설정해 주세요.'

        if error is None:
            try:
                with transaction.atomic():
                    class_info = ClassTb(member_id=request.user.id, center_tb_id=center_id,
                                         subject_cd=subject_cd, start_date=start_date, end_date=end_date,
                                         class_hour=class_hour, start_hour_unit=start_hour_unit,
                                         # member_view_state_cd='VIEW',
                                         subject_detail_nm=subject_detail_nm,
                                         class_member_num=int(class_member_num), state_cd='IP', use=USE)

                    class_info.save()
                    member_class_info = MemberClassTb(member_id=request.user.id, class_tb_id=class_info.class_id,
                                                      auth_cd='VIEW', mod_member_id=request.user.id, use=USE)
                    member_class_info.save()
                    one_to_one_group_info = GroupTb(class_tb_id=class_info.class_id, name='1:1 레슨',
                                                    group_type_cd='ONE_TO_ONE',
                                                    ing_color_cd='#fbf3bd', end_color_cd='#d2d1cf',
                                                    state_cd='IP', member_num=1, use=USE)
                    one_to_one_group_info.save()
                    package_info = PackageTb(class_tb_id=class_info.class_id, name='1:1 레슨',
                                             # package_type_cd='ONE_TO_ONE',
                                             state_cd='IP', use=USE)
                    package_info.save()
                    package_group_info = PackageGroupTb(class_tb_id=class_info.class_id,
                                                        package_tb_id=package_info.package_id,
                                                        group_tb_id=one_to_one_group_info.group_id, use=USE)
                    package_group_info.save()

            except ValueError:
                error = '등록 값에 문제가 있습니다.'
            except IntegrityError:
                error = '등록 값에 문제가 있습니다.'
            except TypeError:
                error = '등록 값에 문제가 있습니다.'
            except ValidationError:
                error = '등록 값에 문제가 있습니다.'
            except InternalError:
                error = '등록 값에 문제가 있습니다.'

        if error is None:
            request.session['class_id'] = class_info.class_id
            request.session['class_hour'] = class_info.class_hour
            request.session['class_type_code'] = class_info.subject_cd
            request.session['class_type_name'] = class_info.get_class_type_cd_name()
            request.session['class_center_name'] = class_info.get_center_name()

        # if error is None:
            # log_data = LogTb(log_type='LC01', auth_member_id=request.user.id,
            #                  from_member_name=request.user.last_name + request.user.first_name,
            #                  log_info='프로그램', log_how='등록', use=USE)
            #
            # log_data.save()

        if error is not None:
            logger.error(
                request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)
        return render(request, self.template_name)


class DeleteClassInfoView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'ajax/trainer_error_ajax.html'

    def post(self, request):
        class_id = request.POST.get('class_id', '')
        class_id_session = request.session.get('class_id', '')

        error = None
        class_info = None
        if class_id is None or class_id == '':
            error = '프로그램 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                class_info = MemberClassTb.objects.get(member_id=request.user.id, class_tb_id=class_id)
                # class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '프로그램 정보를 불러오지 못했습니다.'

        if error is None:
            # class_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id).count()
            # if len(class_lecture_data) == 0:
            #     class_setting_data = SettingTb.objects.filter(class_tb_id=class_id)
            #     class_setting_data.delete()
            #     class_info.delete()
            # else:
            class_info.auth_cd = 'DELETE'
            class_info.save()

        if error is None:
            if str(class_id) == str(class_id_session):
                request.session['class_id'] = ''
                request.session['class_type_code'] = ''
                request.session['class_type_name'] = ''
                request.session['class_center_name'] = ''

        if error is None:
            log_data = LogTb(log_type='LC02', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             class_tb_id=class_id,
                             log_info='프로그램', log_how='삭제', use=USE)

            log_data.save()

        if error is not None:
            logger.error(
                request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return render(request, self.template_name)


class UpdateClassInfoView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'ajax/trainer_error_ajax.html'

    def post(self, request):
        class_id = request.POST.get('class_id', '')
        class_id_session = request.session.get('class_id', '')
        subject_cd = request.POST.get('subject_cd', '')
        subject_detail_nm = request.POST.get('subject_detail_nm', '')
        start_date = request.POST.get('start_date', '')
        end_date = request.POST.get('end_date', '')
        class_hour = request.POST.get('class_hour', '')
        start_hour_unit = request.POST.get('start_hour_unit', '')
        class_member_num = request.POST.get('class_member_num', '')

        error = None
        class_info = None

        if class_id is None or class_id == '':
            error = '오류가 발생했습니다.'

        if error is None:
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '오류가 발생했습니다.'

        if error is None:

            if subject_cd is not None and subject_cd != '':
                class_info.subject_cd = subject_cd

            if class_hour is not None and class_hour != '':
                class_info.class_hour = class_hour

            if start_hour_unit is not None and start_hour_unit != '':
                class_info.start_hour_unit = start_hour_unit

            if start_date is not None and start_date != '':
                class_info.start_date = start_date
            if end_date is not None and end_date != '':
                class_info.end_date = end_date

            if subject_detail_nm is not None and subject_detail_nm != '':
                class_info.subject_detail_nm = subject_detail_nm

            if class_member_num is not None and class_member_num != '':
                class_info.class_member_num = class_member_num

            class_info.save()

        if error is None:
            if str(class_id) == str(class_id_session):
                request.session['class_type_code'] = class_info.subject_cd
                request.session['class_type_name'] = class_info.subject_detail_nm
                request.session['class_hour'] = class_info.class_hour
            # log_data = LogTb(log_type='LC02', auth_member_id=request.user.id,
            #                  from_member_name=request.user.last_name + request.user.first_name,
            #                  class_tb_id=class_id,
            #                  log_info='프로그램', log_how='수정', use=USE)
            #
            # log_data.save()

        if error is not None:
            logger.error(
                request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return render(request, self.template_name)


def select_class_processing_logic(request):
    class_id = request.POST.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    class_info = None

    if class_id == '':
        error = '프로그램을 선택해 주세요.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'

    if error is None:
        request.session['class_id'] = class_id
        request.session['class_hour'] = class_info.class_hour
        request.session['class_type_code'] = class_info.subject_cd
        request.session['class_type_name'] = class_info.get_class_type_cd_name()
        request.session['class_center_name'] = class_info.get_center_name()

    if error is None:
        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)
    return redirect(next_page)


class GetBackgroundImgTypeListViewAjax(LoginRequiredMixin, AccessTestMixin, View):
    template_name = "ajax/trainer_common_code_ajax.html"

    def get(self, request):
        context = {}
        error = None

        context['common_cd_data'] = CommonCdTb.objects.filter(upper_common_cd='14', use=USE).order_by('order')

        if error is not None:
            messages.error(request, error)

        return render(request, self.template_name, context)


class GetBackgroundImgListViewAjax(LoginRequiredMixin, AccessTestMixin, View):
    template_name = "ajax/trainer_background_ajax.html"

    def post(self, request):
        context = {}
        class_id = request.POST.get('class_id', '')
        error = None
        background_img_data = None

        if error is None:
            if class_id is not None and class_id != '':
                background_img_data = BackgroundImgTb.objects.filter(class_tb_id=class_id,
                                                                     use=USE).order_by('-class_tb_id')
            else:
                background_img_data = BackgroundImgTb.objects.filter(class_tb__member_id=request.user.id,
                                                                     use=USE).order_by('-class_tb_id')

        if error is None:
            for background_img_info in background_img_data:
                try:
                    background_img_type_name = \
                        CommonCdTb.objects.get(common_cd=background_img_info.background_img_type_cd)
                except ObjectDoesNotExist:
                    background_img_type_name = None
                if background_img_type_name is not None:
                    background_img_info.background_img_type_name = background_img_type_name.common_cd_nm

        context['background_img_data'] = background_img_data

        if error is not None:
            messages.error(request, error)

        return render(request, self.template_name, context)


class UpdateBackgroundImgInfoViewAjax(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'ajax/trainer_error_ajax.html'

    def post(self, request):
        class_id = request.session.get('class_id', '')
        background_img_id = request.POST.get('background_img_id', '')
        background_img_type_cd = request.POST.get('background_img_type_cd', '')
        url = request.POST.get('url', '')

        error = None
        log_how_info = ''
        background_img_info = None
        if class_id is None or class_id == '':
            error = '오류가 발생했습니다.'
        if background_img_id == '' or background_img_id is None:
            try:
                background_img_info = BackgroundImgTb.objects.get(class_tb_id=class_id,
                                                                  background_img_type_cd=background_img_type_cd,
                                                                  use=USE)
                log_how_info = '수정'
            except ObjectDoesNotExist:
                background_img_info = BackgroundImgTb(class_tb_id=class_id,
                                                      background_img_type_cd=background_img_type_cd,
                                                      url=url, reg_info_id=request.user.id, use=USE)
                log_how_info = '추가'

            if background_img_type_cd is not None and background_img_type_cd != '':
                background_img_info.background_img_type_cd = background_img_type_cd
            if url is not None and url != '':
                background_img_info.url = url

            background_img_info.save()
        else:
            try:
                background_img_info = BackgroundImgTb.objects.get(background_img_id=background_img_id, use=USE)
            except ObjectDoesNotExist:
                error = '배경화면 정보를 불러오지 못했습니다.'

            if error is None:
                if background_img_type_cd is not None and background_img_type_cd != '':
                    background_img_info.background_img_type_cd = background_img_type_cd
                if url is not None and url != '':
                    background_img_info.url = url

                background_img_info.save()
                log_how_info = '수정'

        # if error is None:
        #     log_data = LogTb(log_type='LC02', auth_member_id=request.user.id,
        #                      from_member_name=request.user.last_name + request.user.first_name,
        #                      class_tb_id=class_id,
        #                      log_info='배경화면 정보', log_how=log_how_info,
        #                      reg_dt=timezone.now(), use=USE)
        #
        #     log_data.save()

        if error is not None:
            logger.error(
                request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return render(request, self.template_name)


class DeleteBackgroundImgInfoViewAjax(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'ajax/trainer_error_ajax.html'

    def post(self, request):
        class_id = ''
        background_img_id = request.POST.get('background_img_id', '')

        error = None
        if background_img_id is None or background_img_id == '':
            error = '배경화면 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                background_img_info = BackgroundImgTb.objects.get(background_img_id=background_img_id)
                class_id = background_img_info.class_tb_id
                background_img_info.delete()
            except ObjectDoesNotExist:
                error = '오류가 발생했습니다.'

        # if error is None:
            # log_data = LogTb(log_type='LC02', auth_member_id=request.user.id,
            #                  from_member_name=request.user.last_name + request.user.first_name,
            #                  class_tb_id=class_id,
            #                  log_info='배경 화면', log_how='삭제', use=USE)
            #
            # log_data.save()

        if error is not None:
            logger.error(
                request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return render(request, self.template_name)


class GetTrainerInfoView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'ajax/trainer_info_ajax.html'

    def get(self, request):
        context = {}
        # context = super(GetTrainerInfoView, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        error = None
        class_info = None
        now = timezone.now()
        next_schedule_start_dt = ''
        next_schedule_end_dt = ''

        today = datetime.date.today()
        month_first_day = today.replace(day=1)
        next_year = int(month_first_day.strftime('%Y')) + 1
        next_month = (int(month_first_day.strftime('%m')) + 1) % 13
        if next_month == 0:
            next_month = 1
        next_month_first_day = month_first_day.replace(month=next_month)

        if next_month == 1:
            next_month_first_day = next_month_first_day.replace(year=next_year)

        end_schedule_num = 0
        new_member_num = 0
        total_member_num = 0
        current_total_member_num = 0
        center_name = '없음'
        context['total_member_num'] = 0
        context['current_total_member_num'] = 0
        context['end_schedule_num'] = 0
        context['new_member_num'] = 0
        user_member_info = None
        off_repeat_schedule_data = None

        if class_id is None or class_id == '':
            error = '오류가 발생했습니다.'

        if error is None:
            try:
                user_member_info = MemberTb.objects.get(member_id=request.user.id)
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '오류가 발생했습니다.'

        if error is None:
            center_name = class_info.get_center_name()
        if error is None:
            off_repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                       en_dis_type=OFF_SCHEDULE_TYPE)

        if error is None:
            all_member = func_get_class_member_ing_list(class_id, '')
            total_member_num = len(all_member)
            for member_info in all_member:
                # member_data = member_info

                # 강좌에 해당하는 수강/회원 정보 가져오기
                class_lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                                   lecture_tb__member_id=member_info,
                                                                   lecture_tb__state_cd='IP',
                                                                   lecture_tb__use=USE,
                                                                   auth_cd='VIEW',
                                                                   use=USE).order_by('-lecture_tb__start_date')

                # if len(total_class_lecture_list) > 0:
                #     total_member_num += 1

                if len(class_lecture_list) > 0:
                    # total_member_num += 1
                    start_date = ''
                    for lecture_info_data in class_lecture_list:
                        lecture_info = lecture_info_data.lecture_tb
                        if lecture_info.state_cd == 'IP':
                            if start_date == '':
                                start_date = lecture_info.start_date
                            else:
                                if start_date > lecture_info.start_date:
                                    start_date = lecture_info.start_date
                    if start_date != '':
                        if month_first_day <= start_date < next_month_first_day:
                            new_member_num += 1

        if error is None:
            # 남은 횟수 1개 이상인 경우 - 180314 hk.kim
            context['total_member_num'] = total_member_num
            # 남은 횟수 1개 이상 3개 미만인 경우 - 180314 hk.kim
            context['current_total_member_num'] = current_total_member_num
            context['new_member_num'] = new_member_num

        if error is None:
            end_schedule_num = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'), class_tb_id=class_id,
                                                         en_dis_type=ON_SCHEDULE_TYPE, use=USE).count()
            # new_member_num = LectureTb.objects.filter(class_tb_id=class_info.class_id,
            #                                          start_date__gte=month_first_day,
            #                                          start_date__lt=next_month_first_day, use=USE).count()

        pt_schedule_data = ScheduleTb.objects.filter(class_tb=class_id,
                                                     en_dis_type=ON_SCHEDULE_TYPE,
                                                     start_dt__gte=now,
                                                     use=USE).order_by('start_dt')
        if len(pt_schedule_data) > 0:
            next_schedule_start_dt = pt_schedule_data[0].start_dt
            next_schedule_end_dt = pt_schedule_data[0].end_dt

        context['next_schedule_start_dt'] = str(next_schedule_start_dt)
        context['next_schedule_end_dt'] = str(next_schedule_end_dt)
        context['member_info'] = user_member_info
        context['end_schedule_num'] = end_schedule_num
        context['center_name'] = center_name

        context['off_repeat_schedule_data'] = off_repeat_schedule_data

        return render(request, self.template_name, context)


# 회원수정 api
def update_trainer_info_logic(request):
    # member_id = request.POST.get('id')
    # email = request.POST.get('email', '')
    first_name = request.POST.get('first_name', '')
    last_name = request.POST.get('last_name', '')
    phone = request.POST.get('phone', '')
    contents = request.POST.get('contents', '')
    country = request.POST.get('country', '')
    address = request.POST.get('address', '')
    sex = request.POST.get('sex', '')
    birthday_dt = request.POST.get('birthday', '')
    next_page = request.POST.get('next_page')

    error = None
    member_id = request.user.id
    user = None
    member = None
    if member_id == '':
        error = '회원 ID를 확인해 주세요.'

    if error is None:
        try:
            user = User.objects.get(id=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

        try:
            member = MemberTb.objects.get(user_id=user.id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    input_first_name = ''
    # input_last_name = ''
    input_phone = ''
    # input_contents = ''
    # input_country = ''
    # input_address = ''
    # input_sex = ''
    # input_birthday_dt = ''

    if first_name is None or first_name == '':
        input_first_name = user.first_name
    else:
        input_first_name = first_name

    # if last_name is None or last_name == '':
    #     input_last_name = user.last_name
    # else:
    #     input_last_name = last_name

    if contents is None or contents == '':
        input_contents = member.contents
    else:
        input_contents = contents

    if country is None or country == '':
        input_country = member.country
    else:
        input_country = country

    if address is None or address == '':
        input_address = member.address
    else:
        input_address = address

    if sex is None or sex == '':
        input_sex = member.sex
    else:
        input_sex = sex

    if birthday_dt is None or birthday_dt == '':
        input_birthday_dt = member.birthday_dt
    else:
        input_birthday_dt = birthday_dt

    if phone is None or phone == '':
        input_phone = member.phone
    else:
        if len(phone) != 11 and len(phone) != 10:
            error = '연락처를 확인해 주세요.'
        elif not phone.isdigit():
            error = '연락처를 확인해 주세요.'
        else:
            input_phone = phone

    if error is None:
        try:
            with transaction.atomic():
                user.first_name = input_first_name
                # user.last_name = input_last_name
                # user.email = email
                user.save()
                # member.name = input_last_name + input_first_name
                member.name = input_first_name
                member.phone = input_phone
                member.contents = input_contents
                member.sex = input_sex
                if input_birthday_dt is not None and input_birthday_dt != '':
                    member.birthday_dt = input_birthday_dt
                member.country = input_country
                member.address = input_address
                member.save()

        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '등록 값에 문제가 있습니다.'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:
        # log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
        #                  from_member_name=request.user.last_name + request.user.first_name,
        #                  log_info='본인 정보', log_how='수정', use=USE)
        # log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


# 강사 예약허용시간 setting 업데이트 api
def update_setting_push_logic(request):
    setting_to_trainee_lesson_alarm = request.POST.get('setting_to_trainee_lesson_alarm', '0')
    setting_from_trainee_lesson_alarm = request.POST.get('setting_from_trainee_lesson_alarm', '1')
    # setting_trainee_no_schedule_confirm = request.POST.get('setting_trainee_no_schedule_confirm', '')
    # setting_trainer_schedule_confirm = request.POST.get('setting_trainer_schedule_confirm', '')
    # setting_trainer_no_schedule_confirm1 = request.POST.get('setting_trainer_no_schedule_confirm1', '')
    # setting_trainer_no_schedule_confirm2 = request.POST.get('setting_trainer_no_schedule_confirm2', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    lt_pus_to_trainee_lesson_alarm = None
    lt_pus_from_trainee_lesson_alarm = None

    if error is None:
        try:
            lt_pus_to_trainee_lesson_alarm = SettingTb.objects.get(member_id=request.user.id,
                                                                   class_tb_id=class_id,
                                                                   setting_type_cd='LT_PUS_TO_TRAINEE_LESSON_ALARM')
        except ObjectDoesNotExist:
            lt_pus_to_trainee_lesson_alarm = SettingTb(member_id=request.user.id, class_tb_id=class_id,
                                                       setting_type_cd='LT_PUS_TO_TRAINEE_LESSON_ALARM', use=USE)

        try:
            lt_pus_from_trainee_lesson_alarm = SettingTb.objects.get(member_id=request.user.id,
                                                                     class_tb_id=class_id,
                                                                     setting_type_cd='LT_PUS_FROM_TRAINEE_LESSON_ALARM')
        except ObjectDoesNotExist:
            lt_pus_from_trainee_lesson_alarm = SettingTb(member_id=request.user.id, class_tb_id=class_id,
                                                         setting_type_cd='LT_PUS_FROM_TRAINEE_LESSON_ALARM', use=USE)

    if error is None:
        try:
            with transaction.atomic():
                lt_pus_to_trainee_lesson_alarm.setting_info = setting_to_trainee_lesson_alarm
                lt_pus_to_trainee_lesson_alarm.save()

                lt_pus_from_trainee_lesson_alarm.setting_info = setting_from_trainee_lesson_alarm
                lt_pus_from_trainee_lesson_alarm.save()

        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '등록 값에 문제가 있습니다.'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:

        request.session.setting_to_trainee_lesson_alarm = int(setting_to_trainee_lesson_alarm)
        request.session.setting_from_trainee_lesson_alarm = int(setting_from_trainee_lesson_alarm)

        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 님께서 ' \
        #               + 'PUSH 설정</span> 정보를 <span class="status">수정</span>했습니다.'

        # log_data = LogTb(log_type='LT03', auth_member_id=request.user.id,
        #                  from_member_name=request.user.last_name + request.user.first_name,
        #                  class_tb_id=class_id,
        #                  log_info='PUSH 설정', log_how='수정', use=USE)
        # log_data.save()
        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


# 강사 기본 setting 업데이트 api
def update_setting_basic_logic(request):
    # setting_trainer_work_time_available = request.POST.get('setting_trainer_work_time_available', '00:00-23:59')
    setting_trainer_work_sun_time_avail = request.POST.get('setting_trainer_work_sun_time_avail', '00:00-23:59')
    setting_trainer_work_mon_time_avail = request.POST.get('setting_trainer_work_mon_time_avail', '00:00-23:59')
    setting_trainer_work_tue_time_avail = request.POST.get('setting_trainer_work_tue_time_avail', '00:00-23:59')
    setting_trainer_work_wed_time_avail = request.POST.get('setting_trainer_work_wed_time_avail', '00:00-23:59')
    setting_trainer_work_ths_time_avail = request.POST.get('setting_trainer_work_ths_time_avail', '00:00-23:59')
    setting_trainer_work_fri_time_avail = request.POST.get('setting_trainer_work_fri_time_avail', '00:00-23:59')
    setting_trainer_work_sat_time_avail = request.POST.get('setting_trainer_work_sat_time_avail', '00:00-23:59')
    setting_schedule_auto_finish = request.POST.get('setting_schedule_auto_finish', AUTO_FINISH_OFF)
    setting_lecture_auto_finish = request.POST.get('setting_lecture_auto_finish', AUTO_FINISH_OFF)
    setting_admin_password = request.POST.get('setting_admin_password', '0000')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    if error is None:
        if setting_trainer_work_sun_time_avail is None or setting_trainer_work_sun_time_avail == '':
            setting_trainer_work_sun_time_avail = '00:00-23:59'
        if setting_trainer_work_mon_time_avail is None or setting_trainer_work_mon_time_avail == '':
            setting_trainer_work_mon_time_avail = '00:00-23:59'
        if setting_trainer_work_tue_time_avail is None or setting_trainer_work_tue_time_avail == '':
            setting_trainer_work_tue_time_avail = '00:00-23:59'
        if setting_trainer_work_wed_time_avail is None or setting_trainer_work_wed_time_avail == '':
            setting_trainer_work_wed_time_avail = '00:00-23:59'
        if setting_trainer_work_ths_time_avail is None or setting_trainer_work_ths_time_avail == '':
            setting_trainer_work_ths_time_avail = '00:00-23:59'
        if setting_trainer_work_fri_time_avail is None or setting_trainer_work_fri_time_avail == '':
            setting_trainer_work_fri_time_avail = '00:00-23:59'
        if setting_trainer_work_sat_time_avail is None or setting_trainer_work_sat_time_avail == '':
            setting_trainer_work_sat_time_avail = '00:00-23:59'
        if setting_schedule_auto_finish is None or setting_schedule_auto_finish == '':
            setting_schedule_auto_finish = AUTO_FINISH_OFF
        if setting_lecture_auto_finish is None or setting_lecture_auto_finish == '':
            setting_lecture_auto_finish = AUTO_FINISH_OFF
        if setting_admin_password is None or setting_admin_password == '':
            setting_admin_password = '0000'

    if error is None:
        try:
            lt_work_sun_time_avail = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id,
                                                           setting_type_cd='LT_WORK_SUN_TIME_AVAIL')
        except ObjectDoesNotExist:
            lt_work_sun_time_avail = SettingTb(member_id=request.user.id,
                                               class_tb_id=class_id, setting_type_cd='LT_WORK_SUN_TIME_AVAIL', use=USE)
        try:
            lt_work_mon_time_avail = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id,
                                                           setting_type_cd='LT_WORK_MON_TIME_AVAIL')
        except ObjectDoesNotExist:
            lt_work_mon_time_avail = SettingTb(member_id=request.user.id,
                                               class_tb_id=class_id, setting_type_cd='LT_WORK_MON_TIME_AVAIL', use=USE)
        try:
            lt_work_tue_time_avail = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id,
                                                           setting_type_cd='LT_WORK_TUE_TIME_AVAIL')
        except ObjectDoesNotExist:
            lt_work_tue_time_avail = SettingTb(member_id=request.user.id,
                                               class_tb_id=class_id, setting_type_cd='LT_WORK_TUE_TIME_AVAIL', use=USE)
        try:
            lt_work_wed_time_avail = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id,
                                                           setting_type_cd='LT_WORK_WED_TIME_AVAIL')
        except ObjectDoesNotExist:
            lt_work_wed_time_avail = SettingTb(member_id=request.user.id,
                                               class_tb_id=class_id, setting_type_cd='LT_WORK_WED_TIME_AVAIL', use=USE)
        try:
            lt_work_ths_time_avail = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id,
                                                           setting_type_cd='LT_WORK_THS_TIME_AVAIL')
        except ObjectDoesNotExist:
            lt_work_ths_time_avail = SettingTb(member_id=request.user.id,
                                               class_tb_id=class_id, setting_type_cd='LT_WORK_THS_TIME_AVAIL', use=USE)
        try:
            lt_work_fri_time_avail = SettingTb.objects.get(member_id=request.user.id,  class_tb_id=class_id,
                                                           setting_type_cd='LT_WORK_FRI_TIME_AVAIL')
        except ObjectDoesNotExist:
            lt_work_fri_time_avail = SettingTb(member_id=request.user.id,
                                               class_tb_id=class_id, setting_type_cd='LT_WORK_FRI_TIME_AVAIL', use=USE)
        try:
            lt_work_sat_time_avail = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id,
                                                           setting_type_cd='LT_WORK_SAT_TIME_AVAIL')
        except ObjectDoesNotExist:
            lt_work_sat_time_avail = SettingTb(member_id=request.user.id,
                                               class_tb_id=class_id, setting_type_cd='LT_WORK_SAT_TIME_AVAIL', use=USE)
        try:
            lt_schedule_auto_finish = SettingTb.objects.get(member_id=request.user.id,
                                                            class_tb_id=class_id,
                                                            setting_type_cd='LT_SCHEDULE_AUTO_FINISH')
        except ObjectDoesNotExist:
            lt_schedule_auto_finish = SettingTb(member_id=request.user.id,
                                                class_tb_id=class_id, setting_type_cd='LT_SCHEDULE_AUTO_FINISH',
                                                use=USE)
        try:
            lt_lecture_auto_finish = SettingTb.objects.get(member_id=request.user.id,
                                                           class_tb_id=class_id,
                                                           setting_type_cd='LT_LECTURE_AUTO_FINISH')
        except ObjectDoesNotExist:
            lt_lecture_auto_finish = SettingTb(member_id=request.user.id,
                                               class_tb_id=class_id, setting_type_cd='LT_LECTURE_AUTO_FINISH',
                                               use=USE)
        try:
            admin_password = SettingTb.objects.get(member_id=request.user.id,
                                                   class_tb_id=class_id, setting_type_cd='LT_ADMIN_PASSWORD')
        except ObjectDoesNotExist:
            admin_password = SettingTb(member_id=request.user.id,
                                       class_tb_id=class_id, setting_type_cd='LT_ADMIN_PASSWORD', use=USE)

    if error is None:
        try:
            with transaction.atomic():

                lt_work_sun_time_avail.setting_info = setting_trainer_work_sun_time_avail
                lt_work_mon_time_avail.setting_info = setting_trainer_work_mon_time_avail
                lt_work_tue_time_avail.setting_info = setting_trainer_work_tue_time_avail
                lt_work_wed_time_avail.setting_info = setting_trainer_work_wed_time_avail
                lt_work_ths_time_avail.setting_info = setting_trainer_work_ths_time_avail
                lt_work_fri_time_avail.setting_info = setting_trainer_work_fri_time_avail
                lt_work_sat_time_avail.setting_info = setting_trainer_work_sat_time_avail
                lt_work_sun_time_avail.save()
                lt_work_mon_time_avail.save()
                lt_work_tue_time_avail.save()
                lt_work_wed_time_avail.save()
                lt_work_ths_time_avail.save()
                lt_work_fri_time_avail.save()
                lt_work_sat_time_avail.save()
                # lt_res_04.setting_info = setting_trainer_work_time_available
                # lt_res_04.save()

                lt_schedule_auto_finish.setting_info = setting_schedule_auto_finish
                lt_schedule_auto_finish.save()

                lt_lecture_auto_finish.setting_info = setting_lecture_auto_finish
                lt_lecture_auto_finish.save()
                admin_password.setting_info = setting_admin_password
                admin_password.save()

        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '등록 값에 문제가 있습니다.'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 님께서 '\
        #               + '예약 허용대 시간 설정</span> 정보를 <span class="status">수정</span>했습니다.'

        # log_data = LogTb(log_type='LT03', auth_member_id=request.user.id,
        #                  from_member_name=request.user.last_name + request.user.first_name,
        #                  class_tb_id=class_id, log_info='기본 설정', log_how='수정', use=USE)
        # log_data.save()

        return redirect(next_page)
    else:
        logger.error(
            request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


# 강사 예약허용시간 setting 업데이트 api
def update_setting_reserve_logic(request):
    setting_member_reserve_time_available = request.POST.get('setting_member_reserve_time_available', '00:00-23:59')
    setting_member_reserve_time_prohibition = request.POST.get('setting_member_reserve_time_prohibition', '60')
    setting_member_cancel_time = request.POST.get('setting_member_cancel_time_prohibition', '60')
    setting_member_reserve_prohibition = request.POST.get('setting_member_reserve_prohibition',
                                                          MEMBER_RESERVE_PROHIBITION_ON)
    setting_member_reserve_date_available = request.POST.get('setting_member_reserve_date_available', '7')
    # setting_member_cancel_time = request.POST.get('setting_member_cancel_time', '')
    setting_member_reserve_time_duration = request.POST.get('setting_member_reserve_time_duration', '1')
    setting_member_start_time = request.POST.get('setting_member_start_time', 'A-0')
    class_id = request.session.get('class_id', '')

    next_page = request.POST.get('next_page')

    error = None
    lt_res_01 = None
    lt_res_03 = None
    lt_res_04 = None
    lt_res_05 = None
    lt_res_cancel_time = None
    lt_res_enable_time = None
    lt_res_member_time_duration = None
    lt_res_member_start_time = None

    if error is None:
        if setting_member_reserve_time_available is None or setting_member_reserve_time_available == '':
            setting_member_reserve_time_available = '00:00-23:59'
        if setting_member_reserve_time_prohibition is None or setting_member_reserve_time_prohibition == '':
            setting_member_reserve_time_prohibition = '60'
        if setting_member_cancel_time is None or setting_member_cancel_time == '':
            setting_member_cancel_time = '60'
        if setting_member_reserve_prohibition is None or setting_member_reserve_prohibition == '':
            setting_member_reserve_prohibition = MEMBER_RESERVE_PROHIBITION_ON
        if setting_member_reserve_date_available is None or setting_member_reserve_date_available == '':
            setting_member_reserve_date_available = '7'
        if setting_member_reserve_time_duration is None or setting_member_reserve_time_duration == '':
            setting_member_reserve_time_duration = '1'
        if setting_member_start_time is None or setting_member_start_time == '':
            setting_member_start_time = 'A-0'

    if error is None:
        try:
            lt_res_01 = SettingTb.objects.get(member_id=request.user.id,
                                              class_tb_id=class_id, setting_type_cd='LT_RES_01')
        except ObjectDoesNotExist:
            lt_res_01 = SettingTb(member_id=request.user.id, class_tb_id=class_id,
                                  setting_type_cd='LT_RES_01', use=USE)
        try:
            lt_res_03 = SettingTb.objects.get(member_id=request.user.id,
                                              class_tb_id=class_id, setting_type_cd='LT_RES_03')
        except ObjectDoesNotExist:
            lt_res_03 = SettingTb(member_id=request.user.id, class_tb_id=class_id,
                                  setting_type_cd='LT_RES_03', use=USE)
        try:
            lt_res_05 = SettingTb.objects.get(member_id=request.user.id,
                                              class_tb_id=class_id, setting_type_cd='LT_RES_05')
        except ObjectDoesNotExist:
            lt_res_05 = SettingTb(member_id=request.user.id,
                                  class_tb_id=class_id, setting_type_cd='LT_RES_05', use=USE)
        try:
            lt_res_cancel_time = SettingTb.objects.get(member_id=request.user.id,
                                                       class_tb_id=class_id, setting_type_cd='LT_RES_CANCEL_TIME')
        except ObjectDoesNotExist:
            lt_res_cancel_time = SettingTb(member_id=request.user.id,
                                           class_tb_id=class_id, setting_type_cd='LT_RES_CANCEL_TIME', use=USE)
        try:
            lt_res_enable_time = SettingTb.objects.get(member_id=request.user.id,
                                                       class_tb_id=class_id, setting_type_cd='LT_RES_ENABLE_TIME')
        except ObjectDoesNotExist:
            lt_res_enable_time = SettingTb(member_id=request.user.id,
                                           class_tb_id=class_id, setting_type_cd='LT_RES_ENABLE_TIME', use=USE)
        try:
            lt_res_member_time_duration = SettingTb.objects.get(member_id=request.user.id,
                                                                class_tb_id=class_id,
                                                                setting_type_cd='LT_RES_MEMBER_TIME_DURATION')
        except ObjectDoesNotExist:
            lt_res_member_time_duration = SettingTb(member_id=request.user.id,
                                                    class_tb_id=class_id, setting_type_cd='LT_RES_MEMBER_TIME_DURATION',
                                                    use=USE)
        try:
            lt_res_member_start_time = SettingTb.objects.get(member_id=request.user.id,
                                                             class_tb_id=class_id,
                                                             setting_type_cd='LT_RES_MEMBER_START_TIME')
        except ObjectDoesNotExist:
            lt_res_member_start_time = SettingTb(member_id=request.user.id,
                                                 class_tb_id=class_id, setting_type_cd='LT_RES_MEMBER_START_TIME',
                                                 use=USE)

    if error is None:
        try:
            with transaction.atomic():
                lt_res_01.setting_info = setting_member_reserve_time_available
                lt_res_01.save()

                lt_res_03.setting_info = setting_member_reserve_prohibition
                lt_res_03.save()

                lt_res_05.setting_info = setting_member_reserve_date_available
                lt_res_05.save()

                lt_res_cancel_time.setting_info = setting_member_cancel_time
                lt_res_cancel_time.save()

                lt_res_enable_time.setting_info = setting_member_reserve_time_prohibition
                lt_res_enable_time.save()

                lt_res_member_time_duration.setting_info = setting_member_reserve_time_duration
                lt_res_member_time_duration.save()

                lt_res_member_start_time.setting_info = setting_member_start_time
                lt_res_member_start_time.save()

        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '등록 값에 문제가 있습니다.'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 님께서 '\
        #               + '예약 허용대 시간 설정</span> 정보를 <span class="status">수정</span>했습니다.'

        # log_data = LogTb(log_type='LT03', auth_member_id=request.user.id,
        #                  from_member_name=request.user.last_name + request.user.first_name,
        #                  class_tb_id=class_id, log_info='회원 예약 설정', log_how='수정', use=USE)
        # log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


# 강사 예약허용시간 setting 업데이트 api
def update_setting_sales_logic(request):
    setting_sales_10 = request.POST.get('setting_sales_10', '')
    setting_sales_20 = request.POST.get('setting_sales_20', '')
    setting_sales_30 = request.POST.get('setting_sales_30', '')
    setting_sales_40 = request.POST.get('setting_sales_40', '')
    setting_sales_50 = request.POST.get('setting_sales_50', '')
    setting_sales = request.POST.get('setting_sales', '')
    setting_sales_type = request.POST.get('setting_sales_type', '0')
    class_id = request.session.get('class_id', '')

    next_page = request.POST.get('next_page')

    error = None
    lt_sal_01 = ''
    lt_sal_02 = ''
    lt_sal_03 = ''
    lt_sal_04 = ''
    lt_sal_05 = ''
    lt_sal_00 = ''
    setting_sal_00 = ''
    setting_sal_01 = ''
    setting_sal_02 = ''
    setting_sal_03 = ''
    setting_sal_04 = ''
    setting_sal_05 = ''

    if error is None:
        if setting_sales_type == '0':
            setting_sal_01 = setting_sales_10
            setting_sal_02 = setting_sales_20
            setting_sal_03 = setting_sales_30
            setting_sal_04 = setting_sales_40
            setting_sal_05 = setting_sales_50
        else:
            setting_sal_00 = setting_sales

    if error is None:
        try:
            lt_sal_01 = SettingTb.objects.get(member_id=request.user.id,
                                              class_tb_id=class_id, setting_type_cd='LT_SAL_01', use=USE)
        except ObjectDoesNotExist:
            lt_sal_01 = SettingTb(member_id=request.user.id, class_tb_id=class_id,
                                  setting_type_cd='LT_SAL_01', use=USE)
        try:
            lt_sal_02 = SettingTb.objects.get(member_id=request.user.id,
                                              class_tb_id=class_id, setting_type_cd='LT_SAL_02', use=USE)
        except ObjectDoesNotExist:
            lt_sal_02 = SettingTb(member_id=request.user.id, class_tb_id=class_id,
                                  setting_type_cd='LT_SAL_02', use=USE)
        try:
            lt_sal_03 = SettingTb.objects.get(member_id=request.user.id,
                                              class_tb_id=class_id, setting_type_cd='LT_SAL_03', use=USE)
        except ObjectDoesNotExist:
            lt_sal_03 = SettingTb(member_id=request.user.id, class_tb_id=class_id,
                                  setting_type_cd='LT_SAL_03', use=USE)
        try:
            lt_sal_04 = SettingTb.objects.get(member_id=request.user.id,
                                              class_tb_id=class_id, setting_type_cd='LT_SAL_04', use=USE)
        except ObjectDoesNotExist:
            lt_sal_04 = SettingTb(member_id=request.user.id, class_tb_id=class_id,
                                  setting_type_cd='LT_SAL_04', use=USE)
        try:
            lt_sal_05 = SettingTb.objects.get(member_id=request.user.id,
                                              class_tb_id=class_id, setting_type_cd='LT_SAL_05', use=USE)
        except ObjectDoesNotExist:
            lt_sal_05 = SettingTb(member_id=request.user.id, class_tb_id=class_id,
                                  setting_type_cd='LT_SAL_05', use=USE)
        try:
            lt_sal_00 = SettingTb.objects.get(member_id=request.user.id,
                                              class_tb_id=class_id, setting_type_cd='LT_SAL_00', use=USE)
        except ObjectDoesNotExist:
            lt_sal_00 = SettingTb(member_id=request.user.id, class_tb_id=class_id,
                                  setting_type_cd='LT_SAL_00', use=USE)

    if error is None:
        try:
            with transaction.atomic():
                if setting_sales_type == '0':
                    lt_sal_01.setting_info = setting_sal_01
                    lt_sal_01.save()

                    lt_sal_02.setting_info = setting_sal_02
                    lt_sal_02.save()

                    lt_sal_03.setting_info = setting_sal_03
                    lt_sal_03.save()

                    lt_sal_04.setting_info = setting_sal_04
                    lt_sal_04.save()

                    lt_sal_05.setting_info = setting_sal_05
                    lt_sal_05.save()

                    lt_sal_00.setting_info = ''
                    lt_sal_00.save()
                else:
                    lt_sal_01.setting_info = ''
                    lt_sal_01.save()

                    lt_sal_02.setting_info = ''
                    lt_sal_02.save()

                    lt_sal_03.setting_info = ''
                    lt_sal_03.save()

                    lt_sal_04.setting_info = ''
                    lt_sal_04.save()

                    lt_sal_05.setting_info = ''
                    lt_sal_05.save()

                    lt_sal_00.setting_info = setting_sal_00
                    lt_sal_00.save()

        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '등록 값에 문제가 있습니다.'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:

        # log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
        #                  from_member_name=request.user.last_name + request.user.first_name,
        #                  class_tb_id=class_id,
        #                  log_info='강의 금액 설정', log_how='수정', use=USE)
        # log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


# 강사 언어 setting 업데이트 api
def update_setting_language_logic(request):
    setting_member_language = request.POST.get('setting_member_language', '')
    next_page = request.POST.get('next_page')
    class_id = request.session.get('class_id', '')

    error = None
    lt_lan_01 = None
    if error is None:
        if setting_member_language == '':
            setting_member_language = 'KOR'

    if error is None:
        try:
            lt_lan_01 = SettingTb.objects.get(member_id=request.user.id,
                                              class_tb_id=class_id, setting_type_cd='LT_LAN_01')
        except ObjectDoesNotExist:
            lt_lan_01 = SettingTb(member_id=request.user.id, class_tb_id=class_id,
                                  setting_type_cd='LT_LAN_01', use=USE)

    if error is None:
        try:
            with transaction.atomic():
                lt_lan_01.setting_info = setting_member_language
                lt_lan_01.save()

        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '등록 값에 문제가 있습니다.'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:

        # log_data = LogTb(log_type='LT03', auth_member_id=request.user.id,
        #                  from_member_name=request.user.last_name + request.user.first_name,
        #                  class_tb_id=class_id, log_info='언어 설정', log_how='수정', use=USE)
        # log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


# log 삭제
def alarm_delete_logic(request):
    log_size = request.POST.get('log_id_size')
    delete_log_id = request.POST.getlist('log_id_array[]')
    next_page = request.POST.get('next_page')

    error = None
    if log_size == '0':
        error_info = '알람이 없습니다.'

    if error is None:

        for i in range(0, int(log_size)):
            try:
                log_info = LogTb.objects.get(log_id=delete_log_id[i])
            except ObjectDoesNotExist:
                error = '알람 정보를 불러오지 못했습니다.'
            if error is None:
                log_info.use = 0
                log_info.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)
        return redirect(next_page)


class GetNoticeInfoView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/notice_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetNoticeInfoView, self).get_context_data(**kwargs)
        # class_id = self.request.session.get('class_id', '')

        board_list = BoardTb.objects.filter(board_type_cd='NOTICE',
                                            to_member_type_cd='ALL', use=USE).order_by('mod_dt')
        board_list |= BoardTb.objects.filter(board_type_cd='NOTICE',
                                             to_member_type_cd='TRAINEE', use=USE).order_by('mod_dt')
        board_list.order_by('mod_dt')
        for board_info in board_list:
            board_info.hits += 1
            board_info.save()

        context['board_list'] = board_list

        return context


# 출석 체크 완료 기능
def attend_mode_check_logic(request):
    class_id = request.session.get('class_id', '')
    phone_number = request.POST.get('phone_number', '')
    schedule_id = request.POST.get('schedule_id', '')
    error = None

    try:
        schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
    except ObjectDoesNotExist:
        schedule_info = None

    member_data = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                lecture_tb__member__phone=phone_number,
                                                auth_cd='VIEW',
                                                use=USE)
    member_id_list = []
    for member_info in member_data:
        member_id_test = 0
        for member_id_element in member_id_list:
            if member_id_element == member_info.lecture_tb.member_id:
                member_id_test += 1
                break
        if member_id_test == 0:
            member_id_list.append(member_info.lecture_tb.member_id)

    if len(member_id_list) > 1:
        error = '중복되는 휴대폰 번호 2개 이상 존재합니다. 강사에게 문의해주세요.'

    if error is None:
        if len(member_data) > 0:
            member_id = member_data[0].lecture_tb.member_id
            if schedule_info.lecture_tb is None or schedule_info.lecture_tb == '':
                try:
                    group_schedule_info = ScheduleTb.objects.get(group_schedule_id=schedule_id,
                                                                 group_tb_id=schedule_info.group_tb_id,
                                                                 lecture_tb__member_id=member_id)
                    if group_schedule_info.state_cd == 'PE':
                        error = '이미 출석 처리된 수업입니다.'

                except ObjectDoesNotExist:
                    lecture_id = func_get_group_lecture_id(schedule_info.group_tb_id, member_id)
                    if lecture_id is None or lecture_id == '':
                        error = '예약 가능한 횟수가 없습니다. 수강권을 확인해주세요.'
                    else:
                        try:
                            LectureTb.objects.get(lecture_id=lecture_id)
                        except ObjectDoesNotExist:
                            error = '수강정보를 불러오지 못했습니다.'
            else:
                if schedule_info.state_cd == 'PE':
                    error = '이미 출석 처리된 수업입니다.'
                if error is None:
                    if schedule_info.lecture_tb.member_id != member_id:
                        error = '휴대폰 번호와 수업이 일치하지 않습니다.'
        else:
            error = '휴대폰 번호를 확인해주세요.'

    if error is None:

        return render(request, 'ajax/trainer_error_ajax.html')
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return render(request, 'ajax/trainer_error_ajax.html')


# 출석 체크 완료 기능
def attend_mode_finish_logic(request):
    member_id = request.POST.get('member_id')
    schedule_id = request.POST.get('schedule_id')
    class_id = request.session.get('class_id', '')
    error = None
    try:
        schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
    except ObjectDoesNotExist:
        schedule_info = None

    if member_id is not None:
        try:
            with transaction.atomic():
                if schedule_info.lecture_tb is None or schedule_info.lecture_tb == '':
                    try:
                        group_schedule_info = ScheduleTb.objects.get(group_schedule_id=schedule_id,
                                                                     group_tb_id=schedule_info.group_tb_id,
                                                                     lecture_tb__member_id=member_id)
                        if group_schedule_info.state_cd == 'PE':
                            error = '이미 출석 처리된 수업입니다.'

                        if error is None:
                            group_schedule_info.state_cd = 'PE'
                            group_schedule_info.save()
                            error = func_refresh_lecture_count(class_id, group_schedule_info.lecture_tb_id)

                    except ObjectDoesNotExist:
                        lecture_id = func_get_group_lecture_id(schedule_info.group_tb_id, member_id)
                        if lecture_id is None or lecture_id == '':
                            error = '예약 가능한 횟수가 없습니다.'
                        else:
                            error = func_check_group_available_member_before(class_id, schedule_info.group_tb_id,
                                                                             schedule_id)

                        if error is None:
                            schedule_result = func_add_schedule(class_id, lecture_id, None,
                                                                schedule_info.group_tb_id, schedule_id,
                                                                schedule_info.start_dt, schedule_info.end_dt,
                                                                schedule_info.note, ON_SCHEDULE_TYPE,
                                                                member_id, 'AP', 'PE')
                            error = schedule_result['error']

                        if error is None:
                            error = func_refresh_lecture_count(class_id, lecture_id)

                        if error is None:
                            error = func_check_group_available_member_after(class_id, schedule_info.group_tb_id,
                                                                            schedule_id)

                else:
                    if schedule_info.lecture_tb.member_id == member_id:
                        if schedule_info.state_cd == 'PE':
                            error = '이미 출석 처리된 수업입니다.'
                        if error is None:
                            schedule_info.state_cd = 'PE'
                            schedule_info.save()
                            error = func_refresh_lecture_count(class_id, schedule_info.lecture_tb.lecture_id)

        except TypeError:
            error = error
        except ValueError:
            error = error
        except IntegrityError:
            error = error
        except InternalError:
            error = error

    if error is None:

        return redirect('/trainer/attend_mode/')
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return render(request, 'ajax/trainer_error_ajax.html')


# 강사 출석 기능 setting 업데이트 api
def update_attend_mode_setting_logic(request):
    setting_admin_password = request.POST.get('setting_admin_password', '0000')
    setting_attend_class_prev_display_time = request.POST.get('setting_attend_class_prev_display_time', '5')
    setting_attend_class_after_display_time = request.POST.get('setting_attend_class_after_display_time', '5')
    setting_schedule_auto_finish = request.POST.get('setting_schedule_auto_finish', AUTO_FINISH_OFF)

    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page', '/trainer/attend_mode/')

    error = None
    if error is None:
        if setting_attend_class_prev_display_time is None or setting_attend_class_prev_display_time == '':
            setting_attend_class_prev_display_time = '5'
        if setting_attend_class_after_display_time is None or setting_attend_class_after_display_time == '':
            setting_attend_class_after_display_time = '5'
        if setting_schedule_auto_finish is None or setting_schedule_auto_finish == '':
            setting_schedule_auto_finish = AUTO_FINISH_OFF

    if error is None:
        try:
            admin_password = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id,
                                                   setting_type_cd='LT_ADMIN_PASSWORD')
        except ObjectDoesNotExist:
            admin_password = SettingTb(member_id=request.user.id, class_tb_id=class_id,
                                       setting_type_cd='LT_ADMIN_PASSWORD', use=USE)
        try:
            attend_class_prev_display_time = SettingTb.objects.get(member_id=request.user.id,
                                                                   class_tb_id=class_id,
                                                                   setting_type_cd='LT_ATTEND_CLASS_PREV_DISPLAY_TIME')
        except ObjectDoesNotExist:
            attend_class_prev_display_time = SettingTb(member_id=request.user.id,
                                                       class_tb_id=class_id,
                                                       setting_type_cd='LT_ATTEND_CLASS_PREV_DISPLAY_TIME', use=USE)
        try:
            attend_class_after_display_time = SettingTb.objects.get(member_id=request.user.id,
                                                                    class_tb_id=class_id,
                                                                    setting_type_cd='LT_ATTEND_CLASS_AFTER_DISPLAY_TIME')
        except ObjectDoesNotExist:
            attend_class_after_display_time = SettingTb(member_id=request.user.id,
                                                        class_tb_id=class_id,
                                                        setting_type_cd='LT_ATTEND_CLASS_AFTER_DISPLAY_TIME', use=USE)
        try:
            schedule_auto_finish = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id,
                                                         setting_type_cd='LT_SCHEDULE_AUTO_FINISH')
        except ObjectDoesNotExist:
            schedule_auto_finish = SettingTb(member_id=request.user.id,
                                             class_tb_id=class_id, setting_type_cd='LT_SCHEDULE_AUTO_FINISH', use=USE)

    if error is None:
        try:
            with transaction.atomic():
                admin_password.setting_info = setting_admin_password
                admin_password.save()
                attend_class_prev_display_time.setting_info = setting_attend_class_prev_display_time
                attend_class_prev_display_time.save()
                attend_class_after_display_time.setting_info = setting_attend_class_after_display_time
                attend_class_after_display_time.save()
                schedule_auto_finish.setting_info = setting_schedule_auto_finish
                schedule_auto_finish.save()

        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '등록 값에 문제가 있습니다.'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:

        return redirect(next_page)
    else:
        logger.error(
            request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


#
def check_admin_password_logic(request):
    setting_admin_password = request.POST.get('setting_admin_password', '')
    class_id = request.session.get('class_id', '')

    error = None

    try:
        admin_password = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id,
                                               setting_type_cd='LT_ADMIN_PASSWORD').setting_info
    except ObjectDoesNotExist:
        admin_password = '0000'

    if admin_password != setting_admin_password:
        error = '관리자 비밀번호가 일치하지 않습니다.'

    if error is None:

        return render(request, 'ajax/trainer_error_ajax.html')
    else:
        logger.error(
            request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return render(request, 'ajax/trainer_error_ajax.html')


class GetAttendModeScheduleView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/schedule_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetAttendModeScheduleView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        setting_attend_class_prev_display_time = 0
        setting_attend_class_after_display_time = 0
        current_time = timezone.now()
        setting_data = SettingTb.objects.filter(member_id=self.request.user.id, class_tb_id=class_id, use=USE)

        for setting_info in setting_data:
            if setting_info.setting_type_cd == 'LT_ATTEND_CLASS_PREV_DISPLAY_TIME':
                setting_attend_class_prev_display_time = int(setting_info.setting_info)
            if setting_info.setting_type_cd == 'LT_ATTEND_CLASS_AFTER_DISPLAY_TIME':
                setting_attend_class_after_display_time = int(setting_info.setting_info)

        start_date = current_time + datetime.timedelta(minutes=int(setting_attend_class_prev_display_time))
        end_date = current_time - datetime.timedelta(minutes=int(setting_attend_class_after_display_time))
        context = func_get_trainer_attend_schedule(context, class_id, start_date, end_date, current_time)

        return context


# 리뉴얼
class PopupCalendarPlanView(TemplateView):
    template_name = 'popup/trainer_popup_calendar_plan_view.html'

    def get_context_data(self, **kwargs):
        context = super(PopupCalendarPlanView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        select_date = self.request.GET.get('select_date')
        return context


class PopupCalendarPlanAdd(TemplateView):
    template_name = 'popup/trainer_popup_calendar_plan_add.html'

    def get_context_data(self, **kwargs):
        context = super(PopupCalendarPlanAdd, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        return context


class PopupMemberAdd(TemplateView):
    template_name = 'popup/trainer_popup_member_add.html'

    def get_context_data(self, **kwargs):
        context = super(PopupMemberAdd, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        return context


class PopupMemberView(TemplateView):
    template_name = 'popup/trainer_popup_member_view.html'

    def get_context_data(self, **kwargs):
        context = super(PopupMemberView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        return context


class PopupMemberEdit(TemplateView):
    template_name = 'popup/trainer_popup_member_edit.html'

    def get_context_data(self, **kwargs):
        context = super(PopupMemberEdit, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        return context


class PopupLectureAdd(TemplateView):
    template_name = 'popup/trainer_popup_lecture_add.html'

    def get_context_data(self, **kwargs):
        context = super(PopupLectureAdd, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        return context


class PopupLectureView(TemplateView):
    template_name = 'popup/trainer_popup_lecture_view.html'

    def get_context_data(self, **kwargs):
        context = super(PopupLectureView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        group_id = self.request.GET.get('lecture_id')
        context['lecture_info'] = func_get_group_info(class_id, group_id, self.request.user.id)
        return context


class PopupLectureEdit(TemplateView):
    template_name = 'popup/trainer_popup_lecture_edit.html'

    def get_context_data(self, **kwargs):
        context = super(PopupLectureEdit, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        return context


class PopupTicketAdd(TemplateView):
    template_name = 'popup/trainer_popup_ticket_add.html'

    def get_context_data(self, **kwargs):
        context = super(PopupTicketAdd, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        return context


class PopupTicketView(TemplateView):
    template_name = 'popup/trainer_popup_ticket_view.html'

    def get_context_data(self, **kwargs):
        context = super(PopupTicketView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        package_id = self.request.GET.get('ticket_id')

        context['ticket_info'] = func_get_package_info(class_id, package_id, self.request.user.id)
        return context


class PopupTicketEdit(TemplateView):
    template_name = 'popup/trainer_popup_ticket_edit.html'

    def get_context_data(self, **kwargs):
        context = super(PopupTicketEdit, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        return context