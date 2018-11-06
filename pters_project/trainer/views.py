# Create your views here.
import datetime
import json
import logging
import random
import urllib

from urllib.parse import quote

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist, ValidationError, MultipleObjectsReturned
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.db.models import Q
from django.db.models.expressions import RawSQL
from django.http import HttpResponse, request
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
    MEMBER_RESERVE_PROHIBITION_ON

from configs.views import AccessTestMixin
from trainee.views import get_trainee_repeat_schedule_data_func
from login.views import add_member_no_email_func

from board.models import BoardTb
from center.models import CenterTrainerTb
from login.models import MemberTb, LogTb, CommonCdTb
# from payment.models import PaymentInfoTb, ProductTb
from schedule.models import ScheduleTb, RepeatScheduleTb, HolidayTb
from trainee.models import LectureTb, MemberLectureTb
from .models import ClassLectureTb, GroupTb, GroupLectureTb, ClassTb, MemberClassTb, BackgroundImgTb, SettingTb, \
    PackageTb, PackageGroupTb

from schedule.functions import func_get_trainer_schedule, func_get_trainer_off_repeat_schedule, \
    func_refresh_group_status, func_get_trainer_group_schedule, func_refresh_lecture_count
from stats.functions import get_sales_data, get_stats_member_data
from .functions import func_get_class_member_id_list, func_get_trainee_schedule_list, \
    func_get_trainer_setting_list, func_get_lecture_list, func_add_lecture_info, \
    func_delete_lecture_info, func_get_member_ing_list, func_get_member_end_list, \
    func_get_class_member_ing_list, func_get_class_member_end_list, func_get_member_one_to_one_ing_list, func_get_member_one_to_one_end_list, \
    func_get_ing_group_member_list, func_get_end_group_member_list, func_get_ing_package_member_list, \
    func_get_end_package_member_list, func_get_ing_package_in_member_list, func_get_end_package_in_member_list

logger = logging.getLogger(__name__)


class GetErrorInfoView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainer_error_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetErrorInfoView, self).get_context_data(**kwargs)
        return context


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

        if error is not None:
            logger.error(request.user.last_name + ' ' + request.user.first_name + '['
                         + str(request.user.id) + ']' + error)
            messages.error(request, error)

        return super(IndexView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(IndexView, self).get_redirect_url(*args, **kwargs)


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
            all_member = func_get_class_member_ing_list(class_id)
            total_member_num = len(all_member)

            for member_info in all_member:
                # member_data = member_info

                member_lecture_reg_count = 0
                member_lecture_rem_count = 0
                member_lecture_avail_count = 0
                # 강좌에 해당하는 수강/회원 정보 가져오기
                class_lecture_list = ClassLectureTb.objects.select_related(
                    'lecture_tb').filter(class_tb_id=class_id, lecture_tb__member_id=member_info,
                                         lecture_tb__state_cd='IP', lecture_tb__use=USE,
                                         auth_cd='VIEW', use=USE).order_by('-lecture_tb__start_date')
                start_date = ''
                if len(class_lecture_list) > 0:
                    for lecture_info_data in class_lecture_list:
                        lecture_info = lecture_info_data.lecture_tb
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
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '['
                         + str(self.request.user.id) + ']' + error)
            messages.error(request, error)
        else:
            logger.info(self.request.user.last_name + self.request.user.first_name + '['
                        + str(self.request.user.id) + '] : login success')

        return context


class CalDayView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'cal_day.html'

    def get(self):
        context = {}
        # context = super(CalDayView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
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


class CalWeekView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_week.html'

    def get_context_data(self, **kwargs):
        context = super(CalWeekView, self).get_context_data(**kwargs)
        context['holiday'] = HolidayTb.objects.filter(use=USE)
        return context


class CalMonthView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_month.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthView, self).get_context_data(**kwargs)
        context['holiday'] = HolidayTb.objects.filter(use=USE)
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


class HelpPtersView(AccessTestMixin, TemplateView):
    template_name = 'setting_help.html'

    def get_context_data(self, **kwargs):
        context = super(HelpPtersView, self).get_context_data(**kwargs)
        qa_type_list = CommonCdTb.objects.filter(upper_common_cd='16', use=1).order_by('order')
        context['qa_type_data'] = qa_type_list
        return context


class FromPtersView(AccessTestMixin, TemplateView):
    template_name = 'setting_from_pters_team.html'

    def get_context_data(self, **kwargs):
        context = super(FromPtersView, self).get_context_data(**kwargs)

        return context


class AboutUsView(AccessTestMixin, TemplateView):
    template_name = 'setting_about_us.html'

    def get_context_data(self, **kwargs):
        context = super(AboutUsView, self).get_context_data(**kwargs)

        return context


class BGSettingView(AccessTestMixin, View):
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
            all_member = func_get_class_member_ing_list(class_id)
            end_member = func_get_class_member_end_list(class_id)

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
                'lecture_tb', 'group_tb').filter(Q(state_cd='PE') | Q(state_cd='PC'), class_tb_id=class_id,
                                                 group_tb__isnull=True, lecture_tb__isnull=False,
                                                 en_dis_type=ON_SCHEDULE_TYPE, use=USE
                                                 ).annotate(class_auth_cd=RawSQL(query_class_auth_cd, [])
                                                            ).filter(class_auth_cd='VIEW').count()

            end_schedule_num += ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'), class_tb_id=class_id,
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

        return render(request, self.template_name, context)


class DeleteAccountView(AccessTestMixin, TemplateView):
    template_name = 'delete_account_form.html'

    def get_context_data(self, **kwargs):
        context = super(DeleteAccountView, self).get_context_data(**kwargs)

        return context


class TrainerSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting.html'

    def get_context_data(self, **kwargs):
        context = super(TrainerSettingView, self).get_context_data(**kwargs)

        return context


class PushSettingView(AccessTestMixin, View):
    template_name = 'setting_push.html'

    def get(self, request):
        context = {}
        # context = super(PushSettingView, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        context = func_get_trainer_setting_list(context, request.user.id, class_id)

        return render(request, self.template_name, context)


class ReserveSettingView(AccessTestMixin, View):
    template_name = 'setting_reserve.html'

    def get(self, request):
        context = {}

        return render(request, self.template_name, context)


class BasicSettingView(AccessTestMixin, View):
    template_name = 'setting_basic.html'

    def get(self, request):
        context = {}

        return render(request, self.template_name, context)


class SalesSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_sales.html'

    def get_context_data(self, **kwargs):
        context = super(SalesSettingView, self).get_context_data(**kwargs)
        return context


class ClassSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_class.html'

    def get_context_data(self, **kwargs):
        context = super(ClassSettingView, self).get_context_data(**kwargs)
        return context


class LanguageSettingView(AccessTestMixin, TemplateView):
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
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=USE).order_by('-reg_dt')
            log_data = LogTb.objects.filter(class_tb_id=class_id, use=USE).order_by('-reg_dt')
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


class AlarmPCView(LoginRequiredMixin, AccessTestMixin, AjaxListView):
    context_object_name = "log_data"
    template_name = "alarm_pc.html"
    page_template = 'alarm_page.html'

    def get_queryset(self):
        class_id = self.request.session.get('class_id', '')
        error = None
        log_data = None
        if error is None:
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=USE).order_by('-reg_dt')
            log_data = LogTb.objects.filter(class_tb_id=class_id, use=USE).order_by('-reg_dt')
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
class GetTrainerScheduleView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/schedule_ajax.html'

    def get_context_data(self, **kwargs):
        # start_time = timezone.now()
        # context = {}
        context = super(GetTrainerScheduleView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        date = self.request.GET.get('date', '')
        day = self.request.GET.get('day', '')
        today = datetime.date.today()

        if date != '':
            today = datetime.datetime.strptime(date, '%Y-%m-%d')
        if day == '':
            day = 46
        start_date = today - datetime.timedelta(days=int(day))
        end_date = today + datetime.timedelta(days=int(47))
        context = func_get_trainer_schedule(context, class_id, start_date, end_date)
        return context


class GetOffRepeatScheduleView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/off_schedule_data_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetOffRepeatScheduleView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = func_get_trainer_off_repeat_schedule(context, class_id)
        if error is None:
            context['error'] = error

        return context


class GetTrainerGroupScheduleView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/schedule_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetTrainerGroupScheduleView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        date = self.request.GET.get('date', '')
        day = self.request.GET.get('day', '')
        group_id = self.request.GET.get('group_id', None)
        today = datetime.date.today()

        if date != '':
            today = datetime.datetime.strptime(date, '%Y-%m-%d')
        if day == '':
            day = 46
        start_date = today - datetime.timedelta(days=int(day))
        end_date = today + datetime.timedelta(days=int(47))
        func_get_trainer_group_schedule(context, class_id, start_date, end_date, group_id)

        return context


class GetMemberScheduleView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/member_schedule_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetMemberScheduleView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        member_id = self.request.GET.get('member_id', None)
        context['error'] = None

        if member_id is None or member_id == '':
            context['error'] = '회원 정보를 불러오지 못했습니다.'
        if context['error'] is None:
            context = func_get_trainee_schedule_list(context, class_id, member_id)

        if context['error'] is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '['
                         + str(self.request.user.id) + ']' + context['error'])
            messages.error(self.request, context['error'])

        return context


class GetMemberRepeatScheduleView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/member_repeat_schedule_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetMemberRepeatScheduleView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        member_id = self.request.GET.get('member_id', None)
        context['error'] = None
        context = get_trainee_repeat_schedule_data_func(context, class_id, member_id)
        if context['error'] is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '['
                         + str(self.request.user.id) + ']' + context['error'])
            messages.error(self.request, context['error'])

        return context


class GetMemberInfoView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/search_member_id_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetMemberInfoView, self).get_context_data(**kwargs)
        user_id = self.request.GET.get('id', '')
        member_id = self.request.GET.get('member_id', '')
        id_flag = self.request.GET.get('id_flag', 0)
        class_id = self.request.session.get('class_id', '')

        member = ''
        user = ''
        error = None
        group = None
        lecture_list = None

        if int(id_flag) == 1:
            if user_id == '':
                error = '회원 ID를 확인해 주세요.'
            if error is None:
                try:
                    user = User.objects.get(username=user_id)
                except ObjectDoesNotExist:
                    error = '회원 ID를 확인해 주세요.'

            if error is None:
                try:
                    group = user.groups.get(user=user.id)
                except ObjectDoesNotExist:
                    error = '회원 ID를 확인해 주세요.'

                if error is None:
                    if group.name != 'trainee':
                        error = '회원 ID를 확인해 주세요.'
        else:
            if member_id == '':
                error = '회원 ID를 확인해 주세요.'
            if error is None:
                try:
                    user = User.objects.get(id=member_id)
                except ObjectDoesNotExist:
                    error = '회원 ID를 확인해 주세요.'

        if error is None:
            try:
                member = MemberTb.objects.get(user_id=user.id)
            except ObjectDoesNotExist:
                error = '회원 ID를 확인해 주세요.'
        if error is None:
            lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__member_id=user.id,
                                                         lecture_tb__use=USE, auth_cd='VIEW', use=USE)
        lecture_count = 0

        if error is None:
            if lecture_list is not None:
                for lecture_info_data in lecture_list:
                    member_lecture_list = MemberLectureTb.objects.filter(member_id=user.id,
                                                                         lecture_tb=lecture_info_data.lecture_tb_id,
                                                                         auth_cd='VIEW', lecture_tb__use=USE)
                    lecture_count += len(member_lecture_list)

        if error is None:
            if member.reg_info is None or str(member.reg_info) != str(self.request.user.id):
                if lecture_count == 0:
                    member.sex = ''
                    member.birthday_dt = ''
                    if member.phone is None:
                        member.phone = ''
                    else:
                        member.phone = '***-****-' + member.phone[7:]
                    member.user.email = ''

            if member.birthday_dt is None or member.birthday_dt == '':
                member.birthday_dt = ''
            else:
                member.birthday_dt = str(member.birthday_dt)

            if member.phone is None:
                member.phone = ''
            if member.sex is None:
                member.sex = ''

        context['member_info'] = member
        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name
                         + '[' + str(self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        return context


class GetMemberListView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/member_list_all_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetMemberListView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        # context = get_member_data(context, class_id, None, self.request.user.id)

        context['member_data'] = func_get_member_ing_list(class_id, self.request.user.id)
        context['member_finish_data'] = func_get_member_end_list(class_id, self.request.user.id)
        # return context
        return context


class GetMemberIngListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/member_list_ajax.html'

    def get_context_data(self, **kwargs):
        # start_dt = timezone.now()
        context = super(GetMemberIngListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context['member_data'] = func_get_member_ing_list(class_id, self.request.user.id)
        # end_dt = timezone.now()
        # print(str(end_dt-start_dt))
        return context


class GetMemberEndListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/member_list_ajax.html'

    def get_context_data(self, **kwargs):
        # start_dt = timezone.now()
        context = super(GetMemberEndListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context['member_data'] = func_get_member_end_list(class_id, self.request.user.id)
        # end_dt = timezone.now()
        # print(str(end_dt-start_dt))
        return context


class GetMemberOneToOneIngListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/member_list_ajax.html'

    def get_context_data(self, **kwargs):
        # start_dt = timezone.now()
        context = super(GetMemberOneToOneIngListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context['member_data'] = func_get_member_one_to_one_ing_list(class_id, self.request.user.id)
        # end_dt = timezone.now()
        # print(str(end_dt-start_dt))
        return context


class GetMemberOneToOneEndListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/member_list_ajax.html'

    def get_context_data(self, **kwargs):
        # start_dt = timezone.now()
        context = super(GetMemberOneToOneEndListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context['member_data'] = func_get_member_one_to_one_end_list(class_id, self.request.user.id)
        # end_dt = timezone.now()
        # print(str(end_dt-start_dt))
        return context


# 회원수정
def update_member_info_logic(request):
    member_id = request.POST.get('member_id')
    first_name = request.POST.get('first_name', '')
    last_name = request.POST.get('last_name', '')
    phone = request.POST.get('phone', '')
    sex = request.POST.get('sex', '')
    birthday_dt = request.POST.get('birthday', '')
    next_page = request.POST.get('next_page')

    error = None
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
            member = MemberTb.objects.get(user_id=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    input_first_name = ''
    input_last_name = ''
    input_phone = ''
    input_sex = ''
    input_birthday_dt = ''
    if error is None:
        if user.is_active:
            error = '회원 정보를 수정할수 없습니다.'

    if error is None:
        if first_name is None or first_name == '':
            input_first_name = user.first_name
        else:
            input_first_name = first_name

        # if last_name is None or last_name == '':
        #     input_last_name = user.last_name
        # else:
        #     input_last_name = last_name

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
                error = '연락처 자릿수를 확인해주세요.'
            elif not phone.isdigit():
                error = '연락처는 숫자만 입력 가능합니다.'
            else:
                input_phone = phone

    if error is None:
        try:
            with transaction.atomic():
                if user.first_name != input_first_name:
                    user.first_name = input_first_name
                    # user.last_name = input_last_name
                    # member.name = input_last_name + input_first_name
                    member.name = input_first_name
                    # username = user.last_name + user.first_name
                    username = user.first_name

                    i = 0
                    count = MemberTb.objects.filter(name=username).count()
                    max_range = (100 * (10 ** len(str(count)))) - 1
                    for i in range(0, 100):
                        # username = user.last_name + user.first_name + str(random.randrange(0, max_range)).zfill(len(str(max_range)))
                        username = user.first_name + str(random.randrange(0, max_range)).zfill(len(str(max_range)))
                        try:
                            User.objects.get(username=username)
                        except ObjectDoesNotExist:
                            break

                    if i == 100:
                        error = 'ID 생성에 실패했습니다. 다시 시도해주세요.'
                        raise InternalError

                    user.username = username
                    user.save()

                member.phone = input_phone
                member.sex = input_sex
                if input_birthday_dt is not None and input_birthday_dt != '':
                    member.birthday_dt = input_birthday_dt
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

    if error is None:
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         to_member_name=user.last_name + user.first_name,
                         log_info='회원 정보', log_how='수정', use=USE)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


# 회원가입 api
def delete_member_info_logic(request):
    member_id = request.POST.get('id')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')
    member_name = ''
    error = None
    class_lecture_data = None
    user = None
    member = None
    if member_id == '':
        error = '회원 ID를 확인해 주세요.'

    if error is None:

        try:
            user = User.objects.get(username=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

        try:
            member = MemberTb.objects.get(user_id=user.id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    if error is None:
        class_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__member_id=user.id,
                                                           use=USE, auth_cd='VIEW')
        member_name = member.name

    if error is None:
        try:
            with transaction.atomic():
                if user.is_active == 1:
                    for class_lecture_info in class_lecture_data:
                        lecture_info = class_lecture_info.lecture_tb
                        package_tb = lecture_info.package_tb
                        group_id_list = []
                        group_data = GroupLectureTb.objects.filter(lecture_tb_id=lecture_info.lecture_id, use=USE)
                        for group_info in group_data:
                            group_id_list.append(group_info.group_tb_id)
                        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                  lecture_tb_id=lecture_info.lecture_id,
                                                                  state_cd='NP')

                        schedule_data_finish = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'),
                                                                         class_tb_id=class_id,
                                                                         lecture_tb_id=lecture_info.lecture_id)
                        repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                               lecture_tb_id=lecture_info.lecture_id)

                        member_lecture_list = \
                            MemberLectureTb.objects.filter(member_id=user.id,
                                                           lecture_tb_id=lecture_info.lecture_id
                                                           ).exclude(auth_cd='VIEW')

                        # group_info = GroupLectureTb.objects.filter(lecture_tb_id=lecture_info.lecture_id, use=USE)

                        if len(member_lecture_list) > 0:
                            schedule_data.delete()
                            schedule_data_finish.delete()
                            repeat_schedule_data.delete()
                            lecture_info.delete()
                            # group_info.delete()
                        else:
                            # schedule_data.delete()
                            # repeat_schedule_data.delete()
                            if len(schedule_data) > 0:
                                schedule_data.delete()
                            if len(schedule_data_finish) > 0:
                                schedule_data_finish.update(use=UN_USE)
                            # lecture_info.use = 0
                            # lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
                            if lecture_info.state_cd == 'IP':
                                lecture_info.state_cd = 'PE'
                                lecture_info.save()

                            # if len(group_data) > 0:
                            #     for group_info in group_data:
                            #         group_data_total_size = \
                            #             GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                            #                                           use=USE).count()
                            #         group_data_end_size = \
                            #             GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                            #                                           use=USE).exclude(lecture_tb__state_cd='IP'
                            #                                                            ).count()
                            #         group_info_data = group_info.group_tb
                            #
                            #         if group_data_total_size == group_data_end_size:
                            #             group_info_data.state_cd = 'PE'
                            #             group_info_data.save()
                            #         else:
                            #             group_info_data.state_cd = 'IP'
                            #             group_info_data.save()
                            #
                            #     group_data.update(use=UN_USE)
                                # lecture_info.save()
                        if len(group_id_list) > 0:
                            for group_id_info in group_id_list:
                                try:
                                    group_info = GroupTb.objects.get(group_id=group_id_info, use=USE)
                                except ObjectDoesNotExist:
                                    group_info = None
                                if group_info is not None:
                                    group_info.ing_group_member_num = len(func_get_ing_group_member_list(class_id,
                                                                                                         group_id_info,
                                                                                                         request.user.id))
                                    group_info.end_group_member_num = len(func_get_end_group_member_list(class_id,
                                                                                                         group_id_info,
                                                                                                         request.user.id))
                                    group_info.save()
                        if package_tb is not None:
                            package_tb.ing_package_member_num = len(func_get_ing_package_member_list(class_id, package_tb.package_id))
                            package_tb.end_package_member_num = len(func_get_end_package_member_list(class_id, package_tb.package_id))
                            package_tb.save()

                    class_lecture_data.update(auth_cd='DELETE', mod_member_id=request.user.id)
                else:
                    for class_lecture_info in class_lecture_data:
                        lecture_info = class_lecture_info.lecture_tb
                        package_tb = lecture_info.package_tb
                        group_id_list = []
                        group_data = GroupLectureTb.objects.filter(lecture_tb_id=lecture_info.lecture_id, use=USE)
                        for group_info in group_data:
                            group_id_list.append(group_info.group_tb_id)
                        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                  lecture_tb_id=lecture_info.lecture_id)
                        repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                               lecture_tb_id=lecture_info.lecture_id)

                        # schedule_data.delete()
                        if len(schedule_data) > 0:
                            schedule_data.delete()
                        repeat_schedule_data.delete()
                        # lecture_info.use = 0
                        # lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
                        lecture_info.delete()

                        # if len(group_data) > 0:
                        #     for group_info in group_data:
                        #         group_data_total_size = \
                        #             GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id, use=USE).count()
                        #         group_data_end_size = \
                        #             GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                        #                                           use=USE).exclude(lecture_tb__state_cd='IP').count()
                        #         group_info_data = group_info.group_tb
                        #
                        #         # try:
                        #         #     group_info_data = GroupTb.objects.get(group_id=group_info.group_tb_id)
                        #         # except ObjectDoesNotExist:
                        #         #     error = '그룹 정보를 불러오지 못했습니다.'
                        #         if group_data_total_size == group_data_end_size:
                        #             group_info_data.state_cd = 'PE'
                        #             group_info_data.save()
                        #         else:
                        #             group_info_data.state_cd = 'IP'
                        #             group_info_data.save()
                        # group_data.delete()

                        # lecture_info.save()
                        member_lecture_list = MemberLectureTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
                        if len(member_lecture_list) > 0:
                            member_lecture_list.delete()

                        if len(group_id_list) > 0:
                            for group_id_info in group_id_list:
                                try:
                                    group_info = GroupTb.objects.get(group_id=group_id_info, use=USE)
                                except ObjectDoesNotExist:
                                    group_info = None
                                if group_info is not None:
                                    group_info.ing_group_member_num = len(func_get_ing_group_member_list(class_id,
                                                                                                         group_id_info,
                                                                                                         request.user.id))
                                    group_info.end_group_member_num = len(func_get_end_group_member_list(class_id,
                                                                                                         group_id_info,
                                                                                                         request.user.id))
                                    group_info.save()
                        if package_tb is not None:
                            package_tb.ing_package_member_num = len(func_get_ing_package_member_list(class_id, package_tb.package_id))
                            package_tb.end_package_member_num = len(func_get_end_package_member_list(class_id, package_tb.package_id))
                            package_tb.save()

                    class_lecture_data.delete()
                    if member.reg_info is not None:
                        if str(member.reg_info) == str(request.user.id):
                            member_lecture_list_confirm = MemberLectureTb.objects.filter(member_id=user.id)
                            if len(member_lecture_list_confirm) == 0:
                                member.delete()
                                user.delete()

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

    if error is None:

        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member.name + ' 회원님의</span> 수강정보를 <span class="status">삭제</span>했습니다.'

        log_data = LogTb(log_type='LB02', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id,
                         log_info='수강 정보', log_how='삭제', use=USE)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


def export_excel_member_list_logic(request):
    class_id = request.session.get('class_id', '')
    finish_flag = request.GET.get('finish_flag', '0')

    error = None
    member_list = []
    member_finish_list = []

    if error is None:
        member_list = func_get_member_ing_list(class_id, request.user.id)
        member_finish_list = func_get_member_end_list(class_id, request.user.id)

    wb = Workbook()
    ws1 = wb.active
    start_raw = 3

    ws1['A2'] = '회원명'
    ws1['B2'] = '수강유형'
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
                ws1['A2'] = '수강유형'
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

                if lecture_info.package_tb.package_type_cd == 'NORMAL':
                    group_check = 1
                elif lecture_info.package_tb.package_type_cd == 'EMPTY':
                    group_check = 2
                elif lecture_info.package_tb.package_type_cd == 'PACKAGE':
                    group_check = 3
                else:
                    group_check = 0

                lecture_list_info.group_info = ''

                if lecture_info.use != UN_USE:
                    # if lecture_info.state_cd == 'IP':
                    if group_check == 0:
                        lecture_list_info.group_info = '1:1 레슨'
                    elif group_check == 1:
                        lecture_list_info.group_info = '[그룹]'+lecture_info.package_tb.name
                    elif group_check == 2:
                        lecture_list_info.group_info = '[클래스]'+lecture_info.package_tb.name
                    else:
                        lecture_list_info.group_info = '[패키지]'+lecture_info.package_tb.name

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


class GetLectureListView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/lecture_list_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetLectureListView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        member_id = self.request.GET.get('member_id', '')
        context['error'] = None

        context = func_get_lecture_list(context, class_id, member_id)

        if context['error'] is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '['
                         + str(self.request.user.id) + ']' + context['error'])
            messages.error(self.request, context['error'])

        return context


# 회원가입 api
def add_lecture_info_logic(request):
    fast_check = request.POST.get('fast_check', '0')
    user_id = request.POST.get('user_id')
    # username = request.POST.get('username', '')
    name = request.POST.get('name')
    # phone = request.POST.get('phone')
    contents = request.POST.get('contents', '')
    contents_fast = request.POST.get('contents_fast', '')
    counts = request.POST.get('counts')
    price = request.POST.get('price')
    start_date = request.POST.get('start_date')
    end_date = request.POST.get('end_date')
    counts_fast = request.POST.get('counts_fast')
    price_fast = request.POST.get('price_fast')
    start_date_fast = request.POST.get('start_date_fast')
    end_date_fast = request.POST.get('end_date_fast')
    search_confirm = request.POST.get('search_confirm', '0')
    class_id = request.session.get('class_id', '')
    package_id = request.POST.get('group_id', '')
    setting_lecture_auto_finish = request.session.get('setting_lecture_auto_finish', AUTO_FINISH_OFF)
    group_package_type = request.POST.get('group_package_type', 'group')
    next_page = request.POST.get('next_page')

    error = None
    user = None
    input_start_date = ''
    input_end_date = ''
    input_counts = 0
    input_price = 0
    # lecture_info = None
    input_contents = ''
    # username = name

    if user_id is None or user_id == '':
        error = '오류가 발생했습니다.'

    if search_confirm == '0':
        if name == '':
            error = '회원 이름을 입력해 주세요.'

    if error is None:
        # username = name.replace(' ', '')
        if fast_check == '0':
            if counts_fast == '':
                error = '남은 횟수를 입력해 주세요.'
            elif start_date_fast == '':
                error = '시작 날짜를 입력해 주세요.'
            else:
                input_counts = counts_fast
                input_start_date = start_date_fast
                if price_fast == '':
                    input_price = 0
                else:
                    input_price = price_fast
                if end_date_fast == '':
                    input_end_date = '9999-12-31'
                else:
                    input_end_date = end_date_fast
            input_contents = contents_fast

        elif fast_check == '1':
            if counts == '':
                error = '남은 횟수를 입력해 주세요.'
            elif start_date == '':
                error = '시작 날짜를 입력해 주세요.'
            else:
                input_counts = counts
                input_start_date = start_date
                if price == '':
                    input_price = 0
                else:
                    input_price = price
                if end_date == '':
                    input_end_date = '9999-12-31'
                else:
                    input_end_date = end_date
            input_contents = contents

    if error is None:
        try:
            user = User.objects.get(id=user_id)

        except ObjectDoesNotExist:
            error = '가입되지 않은 회원입니다.'
    # if error is None:
    #     if group_id != '' and group_id is not None:
    #         group_info = None
    #         try:
    #             group_info = GroupTb.objects.get(group_id=group_id)
    #         except ObjectDoesNotExist:
    #             error = '수강 정보를 불러오지 못했습니다.'
    #
    #         if error is None:
    #             group_counter = GroupLectureTb.objects.filter(group_tb_id=group_id, use=USE).count()
    #             if group_info.group_type_cd == 'NORMAL':
    #                 if group_counter >= group_info.member_num:
    #                     error = '그룹 정원을 초과했습니다.'

    if error is None:

        error = func_add_lecture_info(request.user.id, request.user.last_name, request.user.first_name,
                                      class_id, package_id, input_counts, input_price,
                                      input_start_date, input_end_date, input_contents,
                                      user.id, setting_lecture_auto_finish)
    if error is None:
        return redirect(next_page)

    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


def update_lecture_info_logic(request):
    lecture_id = request.POST.get('lecture_id', '')
    start_date = request.POST.get('start_date', '')
    end_date = request.POST.get('end_date', '')
    price = request.POST.get('price', '')
    refund_price = request.POST.get('refund_price', '')
    refund_date = request.POST.get('refund_date', '')
    lecture_reg_count = request.POST.get('lecture_reg_count', '')
    note = request.POST.get('note', '')
    member_id = request.POST.get('member_id', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page', '')
    error = None
    input_refund_price = 0
    input_price = 0
    input_lecture_reg_count = 0
    finish_pt_count = 0
    reserve_pt_count = 0
    member_info = None
    lecture_info = None
    input_refund_date = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

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

        if start_date is None or start_date == '':
            start_date = lecture_info.start_date
        if end_date is None or end_date == '':
            end_date = lecture_info.end_date
        if price is None or price == '':
            input_price = lecture_info.price
        else:
            try:
                input_price = int(price)
            except ValueError:
                error = '수강 금액은 숫자만 입력 가능합니다.'
        if refund_price is None or refund_price == '':
            input_refund_price = lecture_info.refund_price
        else:
            try:
                input_refund_price = int(refund_price)
            except ValueError:
                error = '환불 금액은 숫자만 입력 가능합니다.'

        if refund_date is None or refund_date == '':
            input_refund_date = lecture_info.refund_date
        else:
            try:
                input_refund_date = datetime.datetime.strptime(refund_date, '%Y-%m-%d')
            except ValueError:
                error = '환불 날짜 오류가 발생했습니다.'
            except TypeError:
                error = '환불 날짜 오류가 발생했습니다.'

        if lecture_reg_count is None or lecture_reg_count == '':
            input_lecture_reg_count = lecture_info.lecture_reg_count
        else:
            try:
                input_lecture_reg_count = int(lecture_reg_count)
            except ValueError:
                error = '등록 횟수는 숫자만 입력 가능합니다.'

        if note is None or note == '':
            note = lecture_info.note

    if error is None:
        schedule_list = ScheduleTb.objects.filter(lecture_tb=lecture_id)
        if len(schedule_list) > 0:
            reserve_pt_count = schedule_list.count()
            finish_pt_count = schedule_list.filter(Q(state_cd='PE') | Q(state_cd='PC')).count()

    if error is None:
        if input_lecture_reg_count < reserve_pt_count:
            error = '등록 횟수가 이미 등록한 스케쥴보다 적습니다.'

    if error is None:
        lecture_info.start_date = start_date
        lecture_info.end_date = end_date
        lecture_info.price = input_price
        lecture_info.refund_price = input_refund_price
        lecture_info.refund_date = input_refund_date
        lecture_info.note = note
        if lecture_info.state_cd == 'IP':
            lecture_info.lecture_reg_count = input_lecture_reg_count
            lecture_info.lecture_rem_count = input_lecture_reg_count - finish_pt_count
            lecture_info.lecture_avail_count = input_lecture_reg_count - reserve_pt_count
        else:
            # if lecture_info.lecture_reg_count < input_lecture_reg_count:
            lecture_info.lecture_reg_count = input_lecture_reg_count
            lecture_info.lecture_rem_count = input_lecture_reg_count - finish_pt_count
            lecture_info.lecture_avail_count = input_lecture_reg_count - reserve_pt_count
            # lecture_info.refund_price = 0
            # lecture_info.refund_date = None
            if lecture_info.state_cd == 'PE':
                lecture_info.lecture_rem_count = 0
                lecture_info.lecture_avail_count = 0
                # lecture_info.state_cd = 'IP'
        lecture_info.save()

    if error is None:
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         to_member_name=member_info.name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='수정', use=USE)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


def delete_lecture_info_logic(request):
    lecture_id = request.POST.get('lecture_id', '')
    member_id = request.POST.get('member_id', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None
    member_info = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            member_info = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '회원정보를 불러오지 못했습니다.'

    if error is None:
        error = func_delete_lecture_info(request.user.id, class_id, lecture_id, member_id)
    # if error is None:
    #     try:
    #         group_info = GroupLectureTb.objects.get(lecture_tb_id=lecture_id, use=USE)
    #     except ObjectDoesNotExist:
    #         group_info = None
    #     if group_info is not None:
    #         func_refresh_group_status(group_info.group_id, None, None)

    if error is None:
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         to_member_name=member_info.name, class_tb_id=class_id, lecture_tb_id=lecture_id,
                         log_info='수강 정보', log_how='삭제', use=USE)

        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
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

        lecture_info.package_tb.ing_package_member_num = len(func_get_ing_package_member_list(class_id, lecture_info.package_tb_id))
        lecture_info.package_tb.end_package_member_num = len(func_get_end_package_member_list(class_id, lecture_info.package_tb_id))
        lecture_info.package_tb.save()
        package_group_data = PackageGroupTb.objects.filter(package_tb_id=lecture_info.package_tb_id, use=USE)
        for package_group_info in package_group_data:
            func_refresh_group_status(package_group_info.group_tb_id, None, None)
    # if error is None:
    #     if group_info is not None:
    #         func_refresh_group_status(group_info.group_tb_id, None, None)

    if error is None:
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         to_member_name=member_info.name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='완료 처리', use=USE)

        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
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

        lecture_info.package_tb.ing_package_member_num = len(func_get_ing_package_member_list(class_id, lecture_info.package_tb_id))
        lecture_info.package_tb.end_package_member_num = len(func_get_end_package_member_list(class_id, lecture_info.package_tb_id))
        lecture_info.package_tb.save()
        package_group_data = PackageGroupTb.objects.filter(package_tb_id=lecture_info.package_tb_id, use=USE)
        for package_group_info in package_group_data:
            func_refresh_group_status(package_group_info.group_tb_id, None, None)
    # if error is None:
    #     if group_info is not None:
    #         func_refresh_group_status(group_info.group_tb_id, None, None)

    if error is None:
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         to_member_name=member_info.name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='환불 처리', use=USE)

        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


def progress_lecture_info_logic(request):
    lecture_id = request.POST.get('lecture_id', '')
    member_id = request.POST.get('member_id', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None
    member_info = None
    group_data = None
    lecture_info = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

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
        if lecture_info.package_tb.use == UN_USE:
            error = '해당 수강권은 진행중 상태가 아닙니다.'
        else:
            if lecture_info.package_tb.state_cd != 'IP':
                error = '해당 수강권은 진행중 상태가 아닙니다.'

    if error is None:
        group_data = GroupLectureTb.objects.select_related('group_tb').filter(lecture_tb_id=lecture_id, use=USE)
        error_count = 0
        for group_info in group_data:
            if group_info.group_tb.state_cd != 'IP':
                if group_info.group_tb.group_type_cd == 'NORMAL':
                    error = group_info.group_tb.name + ' 그룹이 진행중 상태가 아닙니다.'
                    error_count += 1
                elif group_info.group_tb.group_type_cd == 'EMPTY':
                    error = group_info.group_tb.name + ' 클래스가 진행중 상태가 아닙니다.'
                    error_count += 1

        if error_count > 1:
            error = str(error_count)+'개의 그룹/클래스가 진행중 상태가 아닙니다.'

    # if error is None:
    #     error_count = 0
    #     for group_info in group_data:
    #         if group_info.group_tb.group_type_cd == 'NORMAL':
    #             if group_info.group_tb.ing_group_member_num >= group_info.group_tb.member_num:
    #                 error = group_info.group_tb.name + ' 그룹이 정원을 초과했습니다.'
    #                 error_count += 1
    #     if error_count > 1:
    #         error = str(error_count)+'개의 그룹이 정원을 초과했습니다.'

    if error is None:
        # group_data = GroupLectureTb.objects.filter(lecture_tb_id=lecture_id, use=USE)
        schedule_data_count = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id).count()
        schedule_data_finish_count = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'),
                                                               lecture_tb_id=lecture_info.lecture_id).count()
        lecture_info.lecture_avail_count = lecture_info.lecture_reg_count - schedule_data_count
        lecture_info.lecture_rem_count = lecture_info.lecture_reg_count - schedule_data_finish_count
        lecture_info.refund_price = 0
        lecture_info.refund_date = None
        lecture_info.state_cd = 'IP'
        lecture_info.save()
        lecture_info.package_tb.ing_package_member_num = len(func_get_ing_package_member_list(class_id, lecture_info.package_tb_id))
        lecture_info.package_tb.end_package_member_num = len(func_get_end_package_member_list(class_id, lecture_info.package_tb_id))
        # print(str(lecture_info.package_tb.ing_package_member_num))
        # print(str(lecture_info.package_tb.end_package_member_num))
        lecture_info.package_tb.save()
        package_group_data = PackageGroupTb.objects.filter(package_tb_id=lecture_info.package_tb_id, use=USE)
        for package_group_info in package_group_data:
            func_refresh_group_status(package_group_info.group_tb_id, None, None)
    # if error is None:
    #     if group_info is not None:
    #         func_refresh_group_status(group_info.group_tb_id, None, None)

    if error is None:
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         to_member_name=member_info.name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='진행중 처리', use=USE)

        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
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
    member_lecture_info = None

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

    if error is None:
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         to_member_name=member_info.name, class_tb_id=class_id, lecture_tb_id=lecture_id,
                         log_info='수강 정보 연동', log_how='수정', use=USE)

        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


def add_group_info_logic(request):
    class_id = request.session.get('class_id', '')
    group_type_cd = request.POST.get('group_type_cd', '')
    member_num = request.POST.get('member_num', '')
    name = request.POST.get('name', '')
    note = request.POST.get('note', '')
    next_page = request.POST.get('next_page', '/trainer/get_group_ing_list/')
    error = None
    group_info = None
    try:
        with transaction.atomic():
            group_info = GroupTb(class_tb_id=class_id, group_type_cd=group_type_cd, member_num=member_num,
                                 name=name, note=note, state_cd='IP', use=USE)

            group_info.save()

            package_info = PackageTb(class_tb_id=class_id, name=name,
                                     package_type_cd=group_type_cd, note=note, state_cd='IP', use=USE)
            package_info.save()

            package_group_info = PackageGroupTb(class_tb_id=class_id, package_tb_id=package_info.package_id,
                                                group_tb_id=group_info.group_id, use=USE)
            package_group_info.save()
    except ValueError:
        error = '오류가 발생했습니다. 다시 시도해주세요.'
    except IntegrityError:
        error = '오류가 발생했습니다. 다시 시도해주세요.'
    except TypeError:
        error = '오류가 발생했습니다. 다시 시도해주세요.'
    except ValidationError:
        error = '오류가 발생했습니다. 다시 시도해주세요.'
    except InternalError:
        error = '오류가 발생했습니다. 다시 시도해주세요.'

    if error is None:
        log_data = LogTb(log_type='LG01', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name + ' '+group_info.get_group_type_cd_name()+' 정보', log_how='등록', use=USE)
        log_data.save()

    else:
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
    # try:
    #     package_info = PackageTb.objects.get(package_id=package_id)
    # except ObjectDoesNotExist:
    #     error = '오류가 발생했습니다.'

    package_data = PackageGroupTb.objects.filter(group_tb_id=group_id, use=USE)

    if error is None:
        group_data = GroupLectureTb.objects.select_related('lecture_tb').filter(group_tb_id=group_id, use=USE)

    if error is None:
        if group_data is not None:
            for group_datum in group_data:
                lecture_info = group_datum.lecture_tb
                lecture_info.lecture_avail_count = 0
                lecture_info.lecture_rem_count = 0
                lecture_info.state_cd = 'PE'
                lecture_info.save()
    if error is None:
        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                  group_tb_id=group_id,
                                                  end_dt__lte=timezone.now(),
                                                  en_dis_type=ON_SCHEDULE_TYPE).exclude(Q(state_cd='PE')
                                                                                        | Q(state_cd='PC'))
        schedule_data_delete = ScheduleTb.objects.filter(class_tb_id=class_id, group_tb_id=group_id,
                                                         # lecture_tb__isnull=True,
                                                         end_dt__gt=timezone.now(),
                                                         en_dis_type=ON_SCHEDULE_TYPE).exclude(Q(state_cd='PE')
                                                                                               | Q(state_cd='PC'))
        repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                               group_tb_id=group_id)
        if len(schedule_data) > 0:
            schedule_data.update(state_cd='PE')
        if len(schedule_data_delete) > 0:
            schedule_data_delete.delete()
        if len(repeat_schedule_data) > 0:
            repeat_schedule_data.delete()
    if error is None:
        group_info.ing_group_member_num = len(
            func_get_ing_group_member_list(class_id, group_id, request.user.id))
        group_info.end_group_member_num = len(
            func_get_end_group_member_list(class_id, group_id, request.user.id))
        group_info.state_cd = 'PE'
        group_info.use = UN_USE
        group_info.save()
        # package_info.state_cd = 'PE'
        # package_info.use = 0
        # package_info.save()
        for package_data_info in package_data:
            package_data_info.use = 0
            package_data_info.save()
            package_data_info.package_tb.package_group_num -= 1
            if package_data_info.package_tb.package_group_num == 0:
                package_data_info.package_tb.state_cd = 'PE'
                package_data_info.package_tb.use = UN_USE
            package_data_info.package_tb.save()

        log_data = LogTb(log_type='LG01', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name + ' '+group_info.get_group_type_cd_name()+' 정보',
                         log_how='삭제', use=USE)
        log_data.save()
    else:

        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(
            request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


def update_group_info_logic(request):
    class_id = request.session.get('class_id', '')
    group_id = request.POST.get('group_id', '')
    group_type_cd = request.POST.get('group_type_cd', '')
    member_num = request.POST.get('member_num', '')
    name = request.POST.get('name', '')
    note = request.POST.get('note', '')
    next_page = request.POST.get('next_page', '/trainer/get_group_ing_list/')
    group_info = None
    error = None

    try:
        group_info = GroupTb.objects.get(group_id=group_id)
    except ObjectDoesNotExist:
        error = '오류가 발생했습니다.'

    try:
        pakcage_info = PackageTb.objects.get(group_id=group_id)
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
    if error is None:
        if int(member_num) <= 0:
            error = '정원은 1명 이상이어야 합니다.'

    if error is None:
        if group_type_cd == 'NORMAL':
            group_member_num = GroupLectureTb.objects.filter(group_tb_id=group_id, use=USE).count()
            if group_member_num > int(member_num):
                error = '현재 그룹에 추가된 인원이 정원보다 많습니다.'

    if error is None:
        group_info.group_type_cd = group_type_cd
        group_info.member_num = member_num
        group_info.name = name
        group_info.note = note
        group_info.save()

    if error is None:
        log_data = LogTb(log_type='LG03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name + ' '+group_info.get_group_type_cd_name()+' 정보',
                         log_how='수정', use=USE)
        log_data.save()

    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(
            request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


def add_group_member_logic(request):
    class_id = request.session.get('class_id', '')
    json_data = request.body.decode('utf-8')
    next_page = request.POST.get('next_page', '/trainer/get_group_ing_list/')
    json_loading_data = None
    error = None
    user_db_id_list = []
    user_name_list = []
    group_info = None
    group_id = None
    setting_lecture_auto_finish = request.session.get('setting_lecture_auto_finish', AUTO_FINISH_OFF)

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다.'
    except TypeError:
        error = '오류가 발생했습니다.'

    if error is None:
        group_id = json_loading_data['lecture_info']['group_id']

    if error is None:
        if group_id != '' and group_id is not None:
            try:
                group_info = GroupTb.objects.get(group_id=group_id, use=USE)
            except ObjectDoesNotExist:
                error = '오류가 발생했습니다.'

            # if error is None:
            #     # group_counter = GroupLectureTb.objects.filter(group_tb_id=group_id, use=USE).count()
            #     group_counter = group_info.ing_group_member_num
            #     group_counter += len(json_loading_data['new_member_data'])
            #     if group_info.group_type_cd == 'NORMAL':
            #         if group_counter > group_info.member_num:
            #             error = '그룹 정원을 초과했습니다.'

    # if error is None:
    #     if group_info.group_type_cd == 'NORMAL':
    #         if json_loading_data['old_member_data'] != '[]':
    #             for json_info in json_loading_data['old_member_data']:
    #                 member_lecture_data = MemberLectureTb.objects.filter(member_id=json_info['db_id'], use=USE)
    #
    #                 for member_lecture_info in member_lecture_data:
    #                     lecture_group_check = 0
    #                     try:
    #                         GroupLectureTb.objects.get(group_tb_id=group_id,
    #                                                    lecture_tb_id=member_lecture_info.lecture_tb_id, use=USE)
    #                     except ObjectDoesNotExist:
    #                         lecture_group_check = 1
    #                     if group_info.group_type_cd == 'NORMAL':
    #                         if lecture_group_check == 1:
    #                             if group_info.ing_group_member_num >= group_info.member_num:
    #                                 error = '그룹 정원을 초과했습니다.'
    #                                 break
    #
    #                 if error is not None:
    #                     break

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
                        try:
                            package_info = PackageGroupTb.objects.filter(
                                ~Q(package_tb__package_type_cd='PACKAGE'),
                                group_tb_id=json_loading_data['lecture_info']['group_id'], use=USE).latest('mod_dt')
                            package_id = package_info.package_tb_id
                        except ObjectDoesNotExist:
                            package_id = ''
                        error = func_add_lecture_info(request.user.id, request.user.last_name, request.user.first_name,
                                                      class_id, package_id,
                                                      json_loading_data['lecture_info']['counts'],
                                                      json_loading_data['lecture_info']['price'],
                                                      json_loading_data['lecture_info']['start_date'],
                                                      json_loading_data['lecture_info']['end_date'],
                                                      json_loading_data['lecture_info']['memo'],
                                                      user_info, setting_lecture_auto_finish)
                if error is not None:
                    raise InternalError
        except InternalError:
            error = error

    if error is None:
        log_data = LogTb(log_type='LG03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name + ' '+group_info.get_group_type_cd_name()+' 회원 정보',
                         log_how='등록', use=USE)
        log_data.save()

    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(
            request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


# 그룹 회원 삭제
def delete_group_member_info_logic(request):
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

    group_id = json_loading_data['group_id']

    if error is None:
        # idx = 0
        for member_id_info in json_loading_data['ids']:
            member_name = None
            group_lecture_data = None
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
                group_lecture_data = GroupLectureTb.objects.select_related('group_tb', 'lecture_tb'
                                                                           ).filter(group_tb_id=group_id,
                                                                                    lecture_tb__member_id=user.id,
                                                                                    use=USE)
            if error is None:
                try:
                    with transaction.atomic():
                        if group_lecture_data is not None:
                            for group_lecture_info in group_lecture_data:
                                error = func_delete_lecture_info(request.user.id, class_id,
                                                                 group_lecture_info.lecture_tb.lecture_id,
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

            log_data = LogTb(log_type='LB02', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             to_member_name=member_name, class_tb_id=class_id,
                             log_info='수강 정보',
                             log_how='삭제', use=USE)
            log_data.save()

    if error is None:

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


class GetGroupIngListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/group_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetGroupIngListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        # start_time = timezone.now()
        query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `GROUP_TB`.`GROUP_TYPE_CD`"
        query_state_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `GROUP_TB`.`STATE_CD`"
        # query_group_member_num = "select count(distinct(c.MEMBER_ID)) from MEMBER_LECTURE_TB as c where c.USE=1 and " \
        #                          "(select count(*) from GROUP_LECTURE_TB as d where d.GROUP_TB_ID=`GROUP_TB`.`ID`" \
        #                          " and d.LECTURE_TB_ID=c.LECTURE_TB_ID and d.USE=1) > 0 "

        group_data = GroupTb.objects.filter(class_tb_id=class_id, state_cd='IP', use=USE
                                            ).annotate(group_type_cd_nm=RawSQL(query_type_cd, []),
                                                       state_cd_nm=RawSQL(query_state_cd, [])
                                                       # group_member_num=RawSQL(query_group_member_num, [])
                                                       ).order_by('-group_type_cd')

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['group_data'] = group_data

        # end_time = timezone.now()
        # print(str(end_time-start_time))

        return context


class GetGroupEndListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/group_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetGroupEndListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None

        query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `GROUP_TB`.`GROUP_TYPE_CD`"
        query_state_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `GROUP_TB`.`STATE_CD`"
        # query_group_member_num = "select count(distinct(c.MEMBER_ID)) from MEMBER_LECTURE_TB as c where c.USE=1 and " \
        #                          "(select count(*) from GROUP_LECTURE_TB as d where d.GROUP_TB_ID=`GROUP_TB`.`ID`" \
        #                          " and d.LECTURE_TB_ID=c.LECTURE_TB_ID and d.USE=1) > 0 "

        group_data = GroupTb.objects.filter(class_tb_id=class_id, state_cd='PE', use=USE
                                            ).annotate(group_type_cd_nm=RawSQL(query_type_cd, []),
                                                       state_cd_nm=RawSQL(query_state_cd, [])
                                                       ).order_by('-group_type_cd')
        # group_data = GroupTb.objects.filter(class_tb_id=class_id, state_cd='PE', use=USE)
        # for group_info in group_data:
        #     member_data = []
        #     try:
        #         type_cd_nm = CommonCdTb.objects.get(common_cd=group_info.group_type_cd)
        #         group_info.group_type_cd_nm = type_cd_nm.common_cd_nm
        #     except ObjectDoesNotExist:
        #         error = '오류가 발생했습니다.'
        #     try:
        #         state_cd_nm = CommonCdTb.objects.get(common_cd=group_info.state_cd)
        #         group_info.state_cd_nm = state_cd_nm.common_cd_nm
        #     except ObjectDoesNotExist:
        #         error = '오류가 발생했습니다.'
        #
        #     lecture_list = GroupLectureTb.objects.filter(group_tb_id=group_info.group_id, use=USE)
        #     for lecture_info in lecture_list:
        #         try:
        #             member_info = MemberLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_tb_id, use=USE)
        #         except ObjectDoesNotExist:
        #             error = '회원 정보를 불러오지 못했습니다.'
        #         check_add_flag = 0
        #         for member_test in member_data:
        #             if member_test.user.id == member_info.member.user.id:
        #                 check_add_flag = 1
        #
        #         if check_add_flag == 0:
        #             member_data.append(member_info.member)
        #
        #     group_info.group_member_num = len(member_data)

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['group_data'] = group_data

        return context


class GetGroupMemberViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/group_member_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetGroupMemberViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        group_id = self.request.GET.get('group_id', '')
        error = None
        # member_data = []
        member_data = func_get_ing_group_member_list(class_id, group_id, self.request.user.id)

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['member_data'] = member_data
        return context


class GetEndGroupMemberViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/group_member_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetEndGroupMemberViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        group_id = self.request.GET.get('group_id', '')
        error = None
        member_data = func_get_end_group_member_list(class_id, group_id, self.request.user.id)

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['member_data'] = member_data
        return context


def finish_group_info_logic(request):
    group_id = request.POST.get('group_id', '')
    # next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None
    group_info = None
    group_data = None
    now = timezone.now()
    if error is None:
        try:
            group_info = GroupTb.objects.get(group_id=group_id)
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'
    if error is None:
        group_data = GroupLectureTb.objects.select_related('lecture_tb').filter(group_tb_id=group_id, use=USE)

    if error is None:
        schedule_data = ScheduleTb.objects.filter(group_tb_id=group_id,
                                                  end_dt__lte=now, use=USE).exclude(Q(state_cd='PE') | Q(state_cd='PC'))
        schedule_data_delete = ScheduleTb.objects.filter(group_tb_id=group_id,
                                                         end_dt__gt=now, use=USE).exclude(Q(state_cd='PE')
                                                                                          | Q(state_cd='PC'))
        repeat_schedule_data = RepeatScheduleTb.objects.filter(group_tb_id=group_id)
        # group_data.update(lecture_tb__state_cd='PE',
        #                   lecture_tb__lecture_avail_count=0, lecture_tb__lecture_rem_count=0)
        if len(schedule_data) > 0:
            schedule_data.update(state_cd='PE')
        if len(schedule_data_delete) > 0:
            schedule_data_delete.delete()
        if len(repeat_schedule_data) > 0:
            repeat_schedule_data.delete()

        if group_data is not None:
            for group_datum in group_data:
                lecture_info = group_datum.lecture_tb
                # schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                #                                           end_dt__lte=now,
                #                                           USE=USE).exclude(state_cd='PE')
                # schedule_data_delete = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                #                                                  end_dt__gt=now,
                #                                                  USE=USE).exclude(state_cd='PE')
                # repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
                # # func_refresh_lecture_count(lecture_id)
                # if len(schedule_data) > 0:
                #     schedule_data.update(state_cd='PE')
                # if len(schedule_data_delete) > 0:
                #     schedule_data_delete.delete()
                # if len(repeat_schedule_data) > 0:
                # #     repeat_schedule_data.delete()
                schedule_data_finish = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'),
                                                                 lecture_tb_id=lecture_info.lecture_id)
                lecture_info.lecture_avail_count = 0
                if lecture_info.state_cd == 'RF':
                    lecture_info.lecture_rem_count = lecture_info.lecture_reg_count - len(schedule_data_finish)
                else:
                    lecture_info.lecture_rem_count = 0
                    lecture_info.state_cd = 'PE'
                lecture_info.save()

        group_info.ing_group_member_num = len(func_get_ing_group_member_list(class_id,
                                                                             group_id,
                                                                             request.user.id))
        group_info.end_group_member_num = len(func_get_end_group_member_list(class_id,
                                                                             group_id,
                                                                             request.user.id))
        group_info.state_cd = 'PE'
        group_info.save()

        package_group_data = PackageGroupTb.objects.filter(group_tb_id=group_id, use=USE)
        for package_group_info in package_group_data:
            package_group_info.use = UN_USE
            package_group_info.save()

            # package_lecture_data = ClassLectureTb.objects.select_related(
            #     'lecture_tb__package_tb').filter(auth_cd='VIEW',
            #                                      lecture_tb__package_tb_id=package_group_info.package_tb_id, use=USE)
            # package_ing_lecture_count = package_lecture_data.filter(lecture_tb__state_cd='IP').count()
            # package_end_lecture_count = package_lecture_data.count() - package_ing_lecture_count
            # package_group_info.package_tb.ing_package_member_num = package_ing_lecture_count
            # package_group_info.package_tb.end_package_member_num = package_end_lecture_count

            package_group_info.package_tb.ing_package_member_num = len(func_get_ing_package_member_list(class_id,
                                                                                                        package_group_info.package_tb_id))
            package_group_info.package_tb.end_package_member_num = len(func_get_end_package_member_list(class_id,
                                                                                                        package_group_info.package_tb_id))
            if package_group_info.package_tb.package_type_cd != 'PACKAGE':
                package_group_info.package_tb.state_cd = 'PE'
            package_group_info.package_tb.save()

    if error is None:
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name + group_info.get_group_type_cd_name()+' 수강 정보',
                         log_how='완료 처리', use=USE)

        log_data.save()

        return render(request, 'ajax/trainer_error_ajax.html')
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return render(request, 'ajax/trainer_error_ajax.html')


def progress_group_info_logic(request):
    group_id = request.POST.get('group_id', '')
    # next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None
    group_info = None
    group_data = None
    if error is None:
        try:
            group_info = GroupTb.objects.get(group_id=group_id)
        except ObjectDoesNotExist:
            error = '그룹 정보를 불러오지 못했습니다.'

    if error is None:
        group_data = GroupLectureTb.objects.filter(group_tb_id=group_id, use=USE)
    if error is None:
        if group_data is not None:
            for group_datum in group_data:
                lecture_info = group_datum.lecture_tb
                schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
                schedule_data_finish = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'),
                                                                 lecture_tb_id=lecture_info.lecture_id)
                lecture_info.lecture_avail_count = lecture_info.lecture_reg_count - len(schedule_data)
                lecture_info.lecture_rem_count = lecture_info.lecture_reg_count - len(schedule_data_finish)
                if lecture_info.lecture_rem_count > 0 and lecture_info.state_cd == 'PE':
                    lecture_info.state_cd = 'IP'
                lecture_info.save()

        group_info.ing_group_member_num = len(func_get_ing_group_member_list(class_id,
                                                                             group_id,
                                                                             request.user.id))
        group_info.end_group_member_num = len(func_get_end_group_member_list(class_id,
                                                                             group_id,
                                                                             request.user.id))
        group_info.state_cd = 'IP'
        group_info.save()

        package_group_data = PackageGroupTb.objects.filter(group_tb_id=group_id, use=USE)
        for package_group_info in package_group_data:
            package_group_info.use = USE
            package_group_info.save()

            # package_lecture_data = ClassLectureTb.objects.select_related(
            #     'lecture_tb__package_tb').filter(auth_cd='VIEW',
            #                                      lecture_tb__package_tb_id=package_group_info.package_tb_id, use=USE)
            # package_ing_lecture_count = package_lecture_data.filter(lecture_tb__state_cd='IP').count()
            # package_end_lecture_count = package_lecture_data.count() - package_ing_lecture_count
            # package_group_info.package_tb.ing_package_member_num = package_ing_lecture_count
            # package_group_info.package_tb.end_package_member_num = package_end_lecture_count

            package_group_info.package_tb.ing_package_member_num = len(func_get_ing_package_member_list(class_id, package_group_info.package_tb_id))
            package_group_info.package_tb.end_package_member_num = len(func_get_end_package_member_list(class_id, package_group_info.package_tb_id))
            if package_group_info.package_tb.package_type_cd != 'PACKAGE':
                package_group_info.package_tb.state_cd = 'IP'
            package_group_info.package_tb.save()

    if error is None:
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name + group_info.get_group_type_cd_name()+' 수강 정보',
                         log_how='재개', use=USE)

        log_data.save()

        return render(request, 'ajax/trainer_error_ajax.html')
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return render(request, 'ajax/trainer_error_ajax.html')


# 그룹 회원 삭제
def update_fix_group_member_logic(request):
    # class_id = request.session.get('class_id', '')
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
        if len(json_loading_data['ids']) > group_info.member_num:
            error = '그룹 정원보다 고정 회원이 많습니다.'
    except ObjectDoesNotExist:
        error = '오류가 발생했습니다. [3]'

    if error is None:
        # idx = 0
        for member_id_info in json_loading_data['ids']:
            group_lecture_data = None
            if error is None:
                group_lecture_data = GroupLectureTb.objects.select_related(
                    'lecture_tb__member').filter(group_tb_id=group_id, use=USE)
            if error is None:
                try:
                    with transaction.atomic():
                        if group_lecture_data is not None:
                            for group_lecture_info in group_lecture_data:
                                if group_lecture_info.lecture_tb.member_id == member_id_info:
                                    group_lecture_info.fix_state_cd = 'FIX'
                                else:
                                    group_lecture_info.fix_state_cd = ''
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
        logger.error(
            request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
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
                # package_type_cd = ''
                if package_name is None or package_name == '':
                    error = '패키지 이름을 입력하세요.'
                    raise InternalError

                if len(json_loading_data['new_package_group_data']) == 0:
                    error = '패키지는 1가지 이상의 수강권을 선택하셔야 합니다.'
                    raise InternalError
                elif len(json_loading_data['new_package_group_data']) > 1:
                    package_type_cd = 'PACKAGE'
                elif len(json_loading_data['new_package_group_data']) == 1:
                    group_id = json_loading_data['new_package_group_data'][0]['group_id']
                    try:
                        package_type_cd = GroupTb.objects.get(group_id=group_id, use=USE).group_type_cd
                    except ObjectDoesNotExist:
                        error = '오류가 발생했습니다. [3]'
                else:
                    error = '오류가 발생했습니다. [4]'

                package_info = PackageTb(class_tb_id=class_id, name=package_name,
                                         state_cd='IP', package_type_cd=package_type_cd,
                                         package_group_num=len(json_loading_data['new_package_group_data']),
                                         ing_package_member_num=0, end_package_member_num=0,
                                         note=json_loading_data['package_info']['package_note'], use=USE)
                package_info.save()

                if json_loading_data['new_package_group_data'] != '[]':
                    for json_info in json_loading_data['new_package_group_data']:
                        if json_info['group_id'] is None or json_info['group_id'] == '':
                            error = '오류가 발생했습니다. [5]'
                            raise InternalError
                        else:
                            package_group_info = PackageGroupTb(class_tb_id=class_id,
                                                                package_tb_id=package_info.package_id,
                                                                group_tb_id=json_info['group_id'],
                                                                use=USE)
                            package_group_info.save()

        except InternalError:
            error = error

    if error is not None:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


# 패키지 삭제
def delete_package_info_logic(request):
    class_id = request.session.get('class_id', '')
    package_id = request.POST.get('package_id', '')
    next_page = request.POST.get('next_page', '/trainer/get_error_info/')
    error = None
    now = timezone.now()

    try:
        package_info = PackageTb.objects.get(class_tb_id=class_id, package_id=package_id)
    except ObjectDoesNotExist:
        error = '오류가 발생했습니다. [0]'

    if error is None:
        try:
            with transaction.atomic():
                package_lecture_data = ClassLectureTb.objects.select_related(
                    'lecture_tb').filter(class_tb_id=class_id, auth_cd='VIEW',
                                         lecture_tb__package_tb_id=package_id, lecture_tb__state_cd='IP', use=USE)

                for package_lecture_info in package_lecture_data:
                    # package_lecture_info.auth_cd = 'DELETE'
                    # package_lecture_info.save()

                    if package_lecture_info.lecture_tb.lecture_rem_count == package_lecture_info.lecture_tb.lecture_reg_count:
                        package_lecture_info.lecture_tb.delete()
                    else:
                        if package_lecture_info.lecture_tb.state_cd == 'IP':
                            package_lecture_info.lecture_tb.state_cd = 'PE'
                            package_lecture_info.lecture_tb.lecture_avail_count = 0
                            package_lecture_info.lecture_tb.lecture_rem_count = 0
                            package_lecture_info.lecture_tb.save()

                if error is None:
                    schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                              lecture_tb__package_tb_id=package_id,
                                                              end_dt__lte=now, use=USE).exclude(Q(state_cd='PE')
                                                                                                | Q(state_cd='PC'))
                    schedule_data_delete = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                     lecture_tb__package_tb_id=package_id,
                                                                     end_dt__gt=now,
                                                                     use=USE).exclude(Q(state_cd='PE')
                                                                                      | Q(state_cd='PC'))
                    repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                           lecture_tb__package_tb_id=package_id)

                    if len(schedule_data) > 0:
                        schedule_data.update(state_cd='PE')
                    if len(schedule_data_delete) > 0:
                        schedule_data_delete.delete()
                    if len(repeat_schedule_data) > 0:
                        repeat_schedule_data.delete()
                if error is None:
                    package_group_data = PackageGroupTb.objects.filter(class_tb_id=class_id, package_tb_id=package_id,
                                                                       use=USE)
                    for package_group_info in package_group_data:
                        package_group_info.use = UN_USE
                        package_group_info.save()
                        func_refresh_group_status(package_group_info.group_tb_id, None, None)

                # if error is None:
                #     if len(package_group_data) == 1:
                #         group_id = package_group_data[0].group_tb.group_id
                        # schedule_data = ScheduleTb.objects.filter(group_tb_id=group_id,
                        #                                           end_dt__lte=now, use=USE).exclude(state_cd='PE')
                        # schedule_data_delete = ScheduleTb.objects.filter(group_tb_id=group_id,
                        #                                                  end_dt__gt=now, use=USE).exclude(state_cd='PE')
                        # repeat_schedule_data = RepeatScheduleTb.objects.filter(group_tb_id=group_id)
                        #
                        # if len(schedule_data) > 0:
                        #     schedule_data.update(state_cd='PE')
                        # if len(schedule_data_delete) > 0:
                        #     schedule_data_delete.delete()
                        # if len(repeat_schedule_data) > 0:
                        #     repeat_schedule_data.delete()
                        # package_group_data[0].group_tb.state_cd = 'PE'
                        # package_group_data[0].group_tb.use = UN_USE
                        # package_group_data[0].group_tb.save()

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
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
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
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


# 패키지에 그룹 추가
def add_package_group_info_logic(request):
    class_id = request.session.get('class_id', '')
    package_id = request.POST.get('package_id', '')
    group_id = request.POST.get('group_id', '')
    next_page = request.POST.get('next_page', '/trainer/get_error_info/')
    error = None

    try:
        with transaction.atomic():
            package_group_info = PackageGroupTb(class_tb_id=class_id, package_tb_id=package_id,
                                                group_tb_id=group_id, use=USE)
            package_group_info.save()
            package_group_info.package_tb.package_group_num = PackageGroupTb.objects.filter(class_tb_id=class_id,
                                                                                            package_tb_id=package_id,
                                                                                            use=USE).count()
            package_group_info.package_tb.package_type_cd = 'PACKAGE'
            package_group_info.package_tb.save()
            package_group_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, auth_cd='VIEW',
                                                                       lecture_tb__package_tb_id=package_id,
                                                                       lecture_tb__use=USE, use=USE)
            for package_group_lecture_info in package_group_lecture_data:
                group_lecture_info = GroupLectureTb(group_tb_id=group_id,
                                                    lecture_tb_id=package_group_lecture_info.lecture_tb_id, use=USE)
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
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
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
                package_group_data = PackageGroupTb.objects.filter(class_tb_id=class_id,
                                                                   package_tb_id=package_id, group_tb_id=group_id,
                                                                   use=USE)
                package_group_data.update(use=UN_USE)

                package_group_lecture_data = GroupLectureTb.objects.filter(group_tb_id=group_id,
                                                                           lecture_tb__package_tb_id=package_id)

                package_group_lecture_data.update(use=UN_USE)
                try:
                    package_info = PackageTb.objects.get(package_id=package_id)
                except ObjectDoesNotExist:
                    package_info = None
                if package_info is not None:
                    package_info.package_group_num = PackageGroupTb.objects.filter(class_tb_id=class_id,
                                                                                   package_tb_id=package_id,
                                                                                   use=USE).count()
                    if package_info.package_group_num == 1:
                        try:
                            package_group_info = PackageGroupTb.objects.get(class_tb_id=class_id,
                                                                            package_tb_id=package_id, use=USE)
                            package_info.package_type_cd = package_group_info.group_tb.group_type_cd
                        except MultipleObjectsReturned:
                            package_info.package_type_cd = 'PACKAGE'
                        except ObjectDoesNotExist:
                            package_info.package_type_cd = package_info.package_type_cd

                    package_info.save()

                if package_info is not None:
                    if package_info.package_group_num == 0:
                        class_lecture_data = ClassLectureTb.objects.select_related(
                            'lecture_tb__package_tb').filter(class_tb_id=class_id,
                                                             lecture_tb__package_tb_id=package_id,
                                                             auth_cd='VIEW', lecture_tb__state_cd='IP',
                                                             lecture_tb__use=USE, use=USE)
                        for class_lecture_info in class_lecture_data:
                            lecture_info = class_lecture_info.lecture_tb

                            if lecture_info.lecture_rem_count == lecture_info.lecture_reg_count:
                                lecture_info.delete()
                            else:
                                if lecture_info.state_cd == 'IP':
                                    lecture_info.lecture_avail_count = 0
                                    lecture_info.lecture_rem_count = 0
                                    lecture_info.state_cd = 'PE'
                                    lecture_info.save()
                        if error is None:
                            schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                      lecture_tb__package_tb_id=package_id,
                                                                      end_dt__lte=timezone.now(),
                                                                      en_dis_type=ON_SCHEDULE_TYPE
                                                                      ).exclude(Q(state_cd='PE') | Q(state_cd='PC'))
                            schedule_data_delete = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                             lecture_tb__package_tb_id=package_id,
                                                                             # lecture_tb__isnull=True,
                                                                             end_dt__gt=timezone.now(),
                                                                             en_dis_type=ON_SCHEDULE_TYPE
                                                                             ).exclude(Q(state_cd='PE')
                                                                                       | Q(state_cd='PC'))
                            repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                                   lecture_tb__package_tb_id=package_id)
                            if len(schedule_data) > 0:
                                schedule_data.update(state_cd='PE')
                            if len(schedule_data_delete) > 0:
                                schedule_data_delete.delete()
                            if len(repeat_schedule_data) > 0:
                                repeat_schedule_data.delete()
                        package_info.use = UN_USE
                        package_info.save()
                    else:
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
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


class GetPackageIngListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/package_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetPackageIngListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None

        query_state_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `PACKAGE_TB`.`STATE_CD`"
        query_package_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B " \
                                "where B.COMMON_CD = `PACKAGE_TB`.`PACKAGE_TYPE_CD`"
        package_data = PackageTb.objects.filter(
            class_tb_id=class_id, state_cd='IP',
            use=USE).annotate(state_cd_nm=RawSQL(query_state_cd, []),
                              package_type_cd_nm=RawSQL(query_package_type_cd,
                                                        [])).order_by('-package_type_cd', 'package_id')
        order = ['ONE_TO_ONE', 'NORMAL', 'EMPTY', 'PACKAGE']
        order = {key: i for i, key in enumerate(order)}
        package_data = sorted(package_data, key=lambda package_info: order.get(package_info.package_type_cd, 0))

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['package_data'] = package_data

        return context


class GetPackageEndListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/package_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetPackageEndListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        query_state_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `PACKAGE_TB`.`STATE_CD`"
        query_package_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B " \
                                "where B.COMMON_CD = `PACKAGE_TB`.`PACKAGE_TYPE_CD`"
        package_data = PackageTb.objects.filter(Q(state_cd='PE') | Q(end_package_member_num__gt=0),
                                                class_tb_id=class_id,
                                                use=USE).annotate(state_cd_nm=RawSQL(query_state_cd, []),
                                                                  package_type_cd_nm=RawSQL(
                                                                      query_package_type_cd,
                                                                      [])).order_by('-package_type_cd', 'package_id')
        order = ['ONE_TO_ONE', 'NORMAL', 'EMPTY', 'PACKAGE']
        order = {key: i for i, key in enumerate(order)}
        package_data = sorted(package_data, key=lambda package_info: order.get(package_info.package_type_cd, 0))

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['package_data'] = package_data

        return context


class GetSinglePackageViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/package_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetSinglePackageViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None

        query_state_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `PACKAGE_TB`.`STATE_CD`"
        query_package_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B " \
                                "where B.COMMON_CD = `PACKAGE_TB`.`PACKAGE_TYPE_CD`"
        query_package_group_id = "select GROUP_TB_ID from PACKAGE_GROUP_TB as B " \
                                 "where B.PACKAGE_TB_ID = `PACKAGE_TB`.`ID`"
        package_data = PackageTb.objects.filter(
            ~Q(package_type_cd='PACKAGE'), class_tb_id=class_id, state_cd='IP',
            use=USE).annotate(state_cd_nm=RawSQL(query_state_cd, []),
                              group_tb_id=RawSQL(query_package_group_id, []),
                              package_type_cd_nm=RawSQL(query_package_type_cd,
                                                        [])).order_by('-package_type_cd', '-package_id')

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['package_data'] = package_data

        return context


class GetPackageMemberViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/package_member_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetPackageMemberViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        package_id = self.request.GET.get('package_id', '')
        error = None
        # member_data = []
        member_data = func_get_ing_package_in_member_list(class_id, package_id, self.request.user.id)

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['member_data'] = member_data
        return context


class GetEndPackageMemberViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/package_member_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetEndPackageMemberViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        package_id = self.request.GET.get('package_id', '')
        error = None
        member_data = func_get_end_package_in_member_list(class_id, package_id, self.request.user.id)

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['member_data'] = member_data
        return context


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
        package_group_data = PackageGroupTb.objects.select_related('group_tb').filter(package_tb_id=package_id, use=USE)

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

    if error is None:
        for package_group_info in package_group_data:
            func_refresh_group_status(package_group_info.group_tb_id, None, None)

    if error is None:
        package_info.package_group_num = package_group_data.filter(use=USE).count()
        package_info.ing_package_member_num = len(func_get_ing_package_member_list(class_id, package_id))
        package_info.end_package_member_num = len(func_get_end_package_member_list(class_id, package_id))
        package_info.state_cd = 'PE'
        package_info.save()

    if error is None:
        log_data = LogTb(log_type='LP03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info=package_info.name + package_info.name + ' 수강권',
                         log_how='완료 처리', use=USE)

        log_data.save()

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
            error = '패키지 정보를 불러오지 못했습니다.'

    if error is None:
        package_group_data = PackageGroupTb.objects.select_related('group_tb').filter(package_tb_id=package_id)

        package_lecture_data = ClassLectureTb.objects.select_related(
            'lecture_tb').filter(class_tb_id=class_id, lecture_tb__package_tb_id=package_id, auth_cd='VIEW', use=USE)

        # group_data = GroupLectureTb.objects.filter(group_tb_id=group_id, use=USE)
    if error is None:
        if package_lecture_data is not None:
            for package_lecture_info in package_lecture_data:
                lecture_info = package_lecture_info.lecture_tb
                schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
                schedule_data_finish = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'),
                                                                 lecture_tb_id=lecture_info.lecture_id)
                lecture_info.lecture_avail_count = lecture_info.lecture_reg_count - len(schedule_data)
                lecture_info.lecture_rem_count = lecture_info.lecture_reg_count - len(schedule_data_finish)
                if lecture_info.lecture_rem_count > 0 and lecture_info.state_cd == 'PE':
                    lecture_info.state_cd = 'IP'
                lecture_info.save()

    # if error is None:
    #     if len(package_group_data) == 1:
    #         package_group_data[0].group_tb.state_cd = 'PE'
    #         package_group_data[0].group_tb.save()

    if error is None:
        for package_group_info in package_group_data:
            # package_group_info.use = USE
            # package_group_info.save()
            func_refresh_group_status(package_group_info.group_tb_id, None, None)

    if error is None:
        package_info.package_group_num = package_group_data.filter(use=USE).count()
        package_info.ing_package_member_num = len(func_get_ing_package_member_list(class_id, package_id))
        package_info.end_package_member_num = len(func_get_end_package_member_list(class_id, package_id))
        package_info.state_cd = 'IP'
        package_info.save()

    if error is None:
        log_data = LogTb(log_type='LP03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info=package_info.name + package_info.name + ' 수강권',
                         log_how='재개', use=USE)

        log_data.save()

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
            'group_tb').filter(class_tb_id=class_id, package_tb_id=package_id, group_tb__use=USE,
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
        package_info = PackageTb.objects.get(package_id=package_id, use=USE)

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
                        error = func_add_lecture_info(request.user.id, request.user.last_name, request.user.first_name,
                                                      class_id, package_id,
                                                      json_loading_data['lecture_info']['counts'],
                                                      json_loading_data['lecture_info']['price'],
                                                      json_loading_data['lecture_info']['start_date'],
                                                      json_loading_data['lecture_info']['end_date'],
                                                      json_loading_data['lecture_info']['memo'],
                                                      user_info, setting_lecture_auto_finish)
                if error is not None:
                    raise InternalError
        except InternalError:
            error = error

    if error is None:
        log_data = LogTb(log_type='LP03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info=package_info.name + '수강권 회원 정보',
                         log_how='등록', use=USE)
        log_data.save()

    else:
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

            log_data = LogTb(log_type='LB02', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             to_member_name=member_name, class_tb_id=class_id,
                             log_info='수강 정보',
                             log_how='삭제', use=USE)
            log_data.save()

    if error is None:

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


class GetGroupMemberScheduleListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/schedule_lesson_data_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetGroupMemberScheduleListViewAjax, self).get_context_data(**kwargs)
        group_schedule_id = self.request.GET.get('group_schedule_id', '')
        error = None
        group_schedule_data = None
        if group_schedule_id is None or group_schedule_id == '':
            error = '일정 정보를 불러오지 못했습니다.'

        if error is None:
            group_schedule_data = ScheduleTb.objects.filter(group_schedule_id=group_schedule_id,
                                                            use=USE).order_by('start_dt')
            for group_schedule_info in group_schedule_data:
                # member_info = MemberTb.objects.get(member_id=group_schedule_info.lecture_tb.member_id)
                member_info = group_schedule_info.lecture_tb.member
                if member_info.reg_info is None or str(member_info.reg_info) != str(self.request.user.id):
                    lecture_count = MemberLectureTb.objects.filter(auth_cd='VIEW', use=USE).count()
                    if lecture_count == 0:
                        member_info.sex = ''
                        member_info.birthday_dt = ''
                        if member_info.phone is None:
                            member_info.phone = ''
                        else:
                            member_info.phone = '***-****-' + member_info.phone[7:]
                        member_info.user.email = ''

                if member_info.sex is None:
                    member_info.sex = ''
                if member_info.phone is None:
                    member_info.phone = ''
                group_schedule_info.member_info = member_info
                group_schedule_info.start_dt = str(group_schedule_info.start_dt)
                group_schedule_info.end_dt = str(group_schedule_info.end_dt)
                if group_schedule_info.state_cd == 'PE':
                    group_schedule_info.finish_check = 1
                elif group_schedule_info.state_cd == 'PC':
                    group_schedule_info.finish_check = 2
                else:
                    group_schedule_info.finish_check = 0

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '['
                         + str(self.request.user.id) + ']' + error)
            messages.error(self.request, error)
        else:
            context['schedule_data'] = group_schedule_data

        return context


class GetGroupRepeatScheduleListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/schedule_repeat_data_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetGroupRepeatScheduleListViewAjax, self).get_context_data(**kwargs)
        group_id = self.request.GET.get('group_id', '')

        group_repeat_schedule_data = RepeatScheduleTb.objects.select_related('group_tb'
                                                                             ).filter(group_tb_id=group_id,
                                                                                      group_schedule_id__isnull=True
                                                                                      ).order_by('start_date')

        context['repeat_schedule_data'] = group_repeat_schedule_data

        return context


class GetGroupMemberRepeatScheduleListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/schedule_repeat_data_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetGroupMemberRepeatScheduleListViewAjax, self).get_context_data(**kwargs)
        group_repeat_schedule_id = self.request.GET.get('group_repeat_schedule_id', '')

        group_repeat_schedule_data = RepeatScheduleTb.objects.filter(group_schedule_id=group_repeat_schedule_id
                                                                     ).order_by('start_date')
        for group_repeat_schedule_info in group_repeat_schedule_data:
            group_repeat_schedule_info.start_date = str(group_repeat_schedule_info.start_date)
            group_repeat_schedule_info.end_date = str(group_repeat_schedule_info.end_date)
        context['repeat_schedule_data'] = group_repeat_schedule_data

        return context


class GetMemberGroupClassIngListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/member_group_class_list_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetMemberGroupClassIngListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        # start_time = timezone.now()
        query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `GROUP_TB`.`GROUP_TYPE_CD`"
        query_state_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `GROUP_TB`.`STATE_CD`"
        # query_group_member_num = "select count(distinct(c.MEMBER_ID)) from MEMBER_LECTURE_TB as c where c.USE=1 and " \
        #                          "(select count(*) from GROUP_LECTURE_TB as d where d.GROUP_TB_ID=`GROUP_TB`.`ID`" \
        #                          " and d.LECTURE_TB_ID=c.LECTURE_TB_ID and d.USE=1) > 0 "

        group_data = GroupTb.objects.filter(class_tb_id=class_id, state_cd='IP', use=USE
                                            ).annotate(group_type_cd_nm=RawSQL(query_type_cd, []),
                                                       state_cd_nm=RawSQL(query_state_cd, []),
                                                       # group_member_num=RawSQL(query_group_member_num, [])
                                                       ).order_by('-group_type_cd', 'ing_group_member_num')
        # for group_info in group_data:
        #     member_data = []
        #     lecture_data = GroupLectureTb.objects.select_related('lecture_tb__member').filter(group_tb_id=group_info.group_id,
        #                                                                                       lecture_tb__use=USE, use=USE)
        #     for lecture_info in lecture_data:
        #         member_info = lecture_info.lecture_tb
        #         if error is None:
        #             check_add_flag = 0
        #             for member_test in member_data:
        #                 if member_test.user.id == member_info.member.user.id:
        #                     check_add_flag = 1
        #
        #             if check_add_flag == 0:
        #                 member_data.append(member_info.member)
        #     group_info.group_member_num = len(member_data)

        # member_data = func_get_member_one_to_one_ing_list(class_id, self.request.user.id)
        # context['member_data'] = member_data

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['group_data'] = group_data
        # end_time = timezone.now()
        # print(str(end_time-start_time))
        return context


class GetMemberGroupClassEndListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/member_group_class_list_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetMemberGroupClassEndListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        # start_time = timezone.now()
        query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `GROUP_TB`.`GROUP_TYPE_CD`"
        query_state_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `GROUP_TB`.`STATE_CD`"
        group_data = GroupTb.objects.filter(class_tb_id=class_id, end_group_member_num__gt=0, use=USE
                                            ).annotate(group_type_cd_nm=RawSQL(query_type_cd, []),
                                                       state_cd_nm=RawSQL(query_state_cd, []),
                                                       ).order_by('-group_type_cd', 'end_group_member_num')
        # for group_info in group_data:
        #     member_data = []
        #     lecture_data = GroupLectureTb.objects.select_related('lecture_tb__member').filter(group_tb_id=group_info.group_id,
        #                                                                                       lecture_tb__use=USE, use=USE)
        #     for lecture_info in lecture_data:
        #         member_info = lecture_info.lecture_tb
        #         if error is None:
        #             check_add_flag = 0
        #             for member_test in member_data:
        #                 if member_test.user.id == member_info.member.user.id:
        #                     check_add_flag = 1
        #
        #             if check_add_flag == 0:
        #                 member_data.append(member_info.member)
        #     group_info.group_member_num = len(member_data)
        # member_data = func_get_member_one_to_one_end_list(class_id, self.request.user.id)
        # context['member_data'] = member_data

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['group_data'] = group_data
        # end_time = timezone.now()
        # print(str(end_time-start_time))
        return context


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
                all_member = func_get_class_member_ing_list(class_info.class_id)
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
                                                    group_type_cd='ONE_TO_ONE', state_cd='IP', member_num=1, use=USE)
                    one_to_one_group_info.save()
                    package_info = PackageTb(class_tb_id=class_info.class_id, name='1:1 레슨',
                                             package_type_cd='ONE_TO_ONE', package_group_num=1, state_cd='IP', use=USE)
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

        if error is None:
            log_data = LogTb(log_type='LC01', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             log_info='프로그램 정보', log_how='등록', use=USE)

            log_data.save()

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
                             log_info='프로그램 정보', log_how='연동 해제', use=USE)

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
            log_data = LogTb(log_type='LC02', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             class_tb_id=class_id,
                             log_info='프로그램 정보', log_how='수정', use=USE)

            log_data.save()

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
        class_id = request.POST.get('class_id', '')
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

        if error is None:
            log_data = LogTb(log_type='LC02', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             class_tb_id=class_id,
                             log_info='배경 화면 정보', log_how='삭제', use=USE)

            log_data.save()

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
            all_member = func_get_class_member_ing_list(class_id)
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
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         log_info='본인 정보', log_how='수정', use=USE)
        log_data.save()

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

        log_data = LogTb(log_type='LT03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info='PUSH 설정 정보', log_how='수정', use=USE)
        log_data.save()
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

        log_data = LogTb(log_type='LT03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id, log_info='설정 정보', log_how='수정', use=USE)
        log_data.save()

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

        log_data = LogTb(log_type='LT03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id, log_info='회원 예약 설정', log_how='수정', use=USE)
        log_data.save()

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

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info='강의 금액 설정', log_how='수정', use=USE)
        log_data.save()

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

        log_data = LogTb(log_type='LT03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id, log_info='언어 설정', log_how='수정', use=USE)
        log_data.save()

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
        error = '알람이 없습니다.'

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
