# Create your views here.
import copy
import datetime

import logging
import os

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User, Group
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.shortcuts import redirect, render
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from django.views.generic import TemplateView
from django.views.generic.base import ContextMixin, RedirectView
from el_pagination.decorators import page_template
from el_pagination.views import AjaxListView

from center.models import CenterTrainerTb
from configs.views import AccessTestMixin, get_client_ip
from login.models import MemberTb, LogTb, HolidayTb, CommonCdTb
from schedule.views import get_trainer_schedule_data_func
from trainee.models import LectureTb
from trainee.views import get_trainee_repeat_schedule_data_func
from trainer.models import ClassTb
from schedule.models import ScheduleTb, RepeatScheduleTb, SettingTb

logger = logging.getLogger(__name__)


class IndexView(LoginRequiredMixin, AccessTestMixin, RedirectView):
    # url = '/trainee/cal_month/'
    def get(self, request, **kwargs):

        class_data = ClassTb.objects.filter(member_id=self.request.user.id).exclude(member_view_state_cd='DELETE').order_by('-start_date')
        self.url = '/trainer/class_select/'

        class_counter = 0

        if len(class_data) == 0:
            self.url = '/trainer/add_class/'
        elif len(class_data) == 1:
            self.url = '/trainer/trainer_main/'
            for class_info in class_data:
                self.request.session['class_id'] = class_info.class_id
        else:
            self.url = '/trainer/class_select/'
            class_id_comp = ''
            class_np_counter = 0

        return super(IndexView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(IndexView, self).get_redirect_url(*args, **kwargs)


class TrainerMainView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'main_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(TrainerMainView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        # class_info = None
        today = datetime.date.today()
        one_day_after = today + datetime.timedelta(days=1)
        month_first_day = today.replace(day=1)
        # print("modified : "+str(datetime.datetime.fromtimestamp(os.path.getmtime(str(os.path.dirname(os.path.abspath(__file__)))+"/"+(str(os.path.basename(__file__)))))))
        # print("Last modified : "+str(datetime.datetime.fromtimestamp(os.path.getmtime(str(os.path.dirname(os.path.abspath(__file__)))+"/templates/main_trainer.html"))))

        next_year = int(month_first_day.strftime('%Y')) + 1
        next_month = int(month_first_day.strftime('%m')) % 12 + 1
        next_month_first_day = month_first_day.replace(month=next_month)

        if next_month == 1:
            next_month_first_day = next_month_first_day.replace(year=next_year)

        today_schedule_num = 0
        new_member_num = 0
        total_member_num = 0
        to_be_end_member_num = 0
        np_member_num = 0

        context['total_member_num'] = 0
        context['to_be_end_member_num'] = 0
        context['today_schedule_num'] = 0
        context['new_member_num'] = 0

        if class_id is None or class_id == '':
            error = '강사 정보가 존재하지 않습니다'

        if error is None:
            all_member = MemberTb.objects.filter(use=1).order_by('name')

            for member_info in all_member:
                member_data = member_info

                member_lecture_reg_count = 0
                member_lecture_rem_count = 0
                member_lecture_avail_count = 0
                # 강좌에 해당하는 수강/회원 정보 가져오기
                lecture_list = LectureTb.objects.filter(class_tb_id=class_id, member_id=member_data.member_id,
                                                        lecture_rem_count__gt=0, state_cd='IP', use=1).order_by('-start_date')
                if len(lecture_list) > 0:
                    total_member_num += 1
                    if len(lecture_list) == 1:
                        if month_first_day < lecture_list[0].start_date < next_month_first_day:
                            new_member_num += 1

                    for lecture_info in lecture_list:
                        # if lecture_info.state_cd == 'NP':
                        if lecture_info.member_view_state_cd == 'WAIT':
                            np_member_num += 1
                        member_lecture_reg_count += lecture_info.lecture_reg_count
                        member_lecture_rem_count += lecture_info.lecture_rem_count
                        member_lecture_avail_count += lecture_info.lecture_avail_count

                    if 0 < member_lecture_rem_count < 4:
                        to_be_end_member_num += 1
                        break

        if error is None :
            #남은 횟수 1개 이상인 경우 - 180314 hk.kim
            context['total_member_num'] = total_member_num
            #남은 횟수 1개 이상 3개 미만인 경우 - 180314 hk.kim
            context['to_be_end_member_num'] = to_be_end_member_num
            context['np_member_num'] = np_member_num
            context['new_member_num'] = new_member_num

        if error is None:
            today_schedule_num = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                           start_dt__gte=today, start_dt__lt=one_day_after,
                                                           en_dis_type='1').count()
            #new_member_num = LectureTb.objects.filter(class_tb_id=class_info.class_id,
            #                                          start_date__gte=month_first_day,
            #                                          start_date__lt=next_month_first_day, use=1).count()

        context['today_schedule_num'] = today_schedule_num
        # context['new_member_num'] = new_member_num

        context = get_trainer_setting_data(context, self.request.user.id, class_id)

        self.request.session['setting_member_reserve_time_available'] = context['lt_res_01']
        self.request.session['setting_member_reserve_time_prohibition'] = context['lt_res_02']
        self.request.session['setting_member_reserve_prohibition'] = context['lt_res_03']
        self.request.session['setting_trainer_work_time_available'] = context['lt_res_04']
        self.request.session['setting_language'] = context['lt_lan_01']

        self.request.session['setting_trainee_schedule_confirm1'] = context['lt_pus_01']
        self.request.session['setting_trainee_schedule_confirm2'] = context['lt_pus_02']
        self.request.session['setting_trainee_no_schedule_confirm'] = context['lt_pus_03']
        self.request.session['setting_trainer_schedule_confirm'] = context['lt_pus_04']
        self.request.session['setting_trainer_no_schedule_confirm1'] = context['lt_pus_05']
        self.request.session['setting_trainer_no_schedule_confirm2'] = context['lt_pus_06']

        if error is not None:
                messages.error(self.request, error)
        # else:
            # logger.error(class_info.member.name+'['+str(class_info.class_id)+'] : login success')

        return context


class CalDayView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_day.html'

    def get_context_data(self, **kwargs):
        context = super(CalDayView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        today = datetime.date.today()
        start_date = today
        end_date = today + datetime.timedelta(days=1)
        context = get_trainer_schedule_data_func(context, class_id, start_date, end_date)

        holiday = HolidayTb.objects.filter(use=1)
        context['holiday'] = holiday

        return context


@method_decorator(csrf_exempt, name='dispatch')
class CalDayViewAjax(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'schedule_ajax.html'

    def get(self, request, *args, **kwargs):
        context = super(CalDayViewAjax, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        date = request.session.get('date', '')
        day = request.session.get('day', '')
        today = datetime.date.today()
        if date != '':
            today = datetime.datetime.strptime(date, '%Y-%m-%d')
        if day == '':
            day = 46
        start_date = today - datetime.timedelta(days=int(day))
        end_date = today + datetime.timedelta(days=int(47))

        context = get_trainer_schedule_data_func(context, class_id, start_date, end_date)
        context = get_member_data(context, class_id, None)

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        class_id = request.session.get('class_id', '')
        date = request.POST.get('date', '')
        day = request.POST.get('day', '')
        today = datetime.date.today()
        if date != '':
            today = datetime.datetime.strptime(date, '%Y-%m-%d')
        if day == '':
            day = 18

        start_date = today - datetime.timedelta(days=int(day))
        end_date = today + datetime.timedelta(days=int(day)+1)

        context = super(CalDayViewAjax, self).get_context_data(**kwargs)
        context = get_trainer_schedule_data_func(context, class_id, start_date, end_date)
        context = get_member_data(context, class_id, None)

        return render(request, self.template_name, context)


class CalWeekView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_week.html'

    def get_context_data(self, **kwargs):
        context = super(CalWeekView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        today = datetime.date.today()
        start_date = today - datetime.timedelta(days=18)
        end_date = today + datetime.timedelta(days=19)
        context = get_trainer_schedule_data_func(context, class_id, start_date, end_date)
        context = get_member_data(context, class_id, None)
        holiday = HolidayTb.objects.filter(use=1)
        context['holiday'] = holiday

        return context


class CalMonthView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_month.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        today = datetime.date.today()
        start_date = today - datetime.timedelta(days=46)
        end_date = today + datetime.timedelta(days=47)
        context = get_trainer_schedule_data_func(context, class_id, start_date, end_date)
        context = get_member_data(context, class_id, None)

        holiday = HolidayTb.objects.filter(use=1)
        context['holiday'] = holiday

        return context


class OffRepeatAddView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_add_off_repeat.html'

    def get_context_data(self, **kwargs):
        context = super(OffRepeatAddView, self).get_context_data(**kwargs)

        return context


class ManageMemberView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_member.html'

    def get_context_data(self, **kwargs):
        context = super(ManageMemberView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context = get_member_data(context, class_id, None)
        return context


class ManageMemberViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_member_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(ManageMemberViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context = get_member_data(context, class_id, None)
        return context


class ManageWorkView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_work.html'

    def get_context_data(self, **kwargs):
        context = super(ManageWorkView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context = get_member_data(context, class_id, None)

        return context


def get_member_data(context, class_id, member_id):

    error = None
    class_info = None

    member_list = []
    member_finish_list = []
    # 강사 정보 가져오기
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강사 정보가 존재하지 않습니다'

    if error is None:
        if member_id is None or member_id == '':
            all_member = MemberTb.objects.filter(use=1).order_by('name')
        else:
            all_member = MemberTb.objects.filter(member_id=member_id, use=1).order_by('name')

        for member_info in all_member:
            member_data = copy.copy(member_info)
            member_data_finish = copy.copy(member_info)
            lecture_finish_check = 0
            # 강좌에 해당하는 수강/회원 정보 가져오기
            lecture_list = LectureTb.objects.filter(class_tb_id=class_info.class_id, member_id=member_data.member_id, state_cd='IP',
                                                    use=1).order_by('start_date')

            lecture_finish_list = LectureTb.objects.filter(class_tb_id=class_info.class_id, member_id=member_data.member_id,
                                                           use=1).exclude(state_cd='IP').order_by('start_date')

            if len(lecture_list) == 0:
                if len(lecture_finish_list) > 0:
                    lecture_finish_check = 1

            if len(lecture_list) > 0:
                lecture_list = LectureTb.objects.filter(class_tb_id=class_info.class_id, member_id=member_data.member_id,
                                                        use=1).order_by('start_date')
                member_data.rj_lecture_counts = 0
                member_data.np_lecture_counts = 0

                member_data.lecture_reg_count_yet = 0
                member_data.lecture_rem_count_yet = 0
                member_data.lecture_avail_count_yet = 0

                member_data.lecture_counts = len(lecture_list)
                member_data.lecture_reg_count = 0
                member_data.lecture_rem_count = 0
                member_data.lecture_avail_count = 0

                member_data.lecture_reg_count_total = 0
                member_data.lecture_rem_count_total = 0
                member_data.lecture_avail_count_total = 0

                member_data.start_date = None
                member_data.end_date = None
                member_data.mod_dt = None

                for idx, lecture_info in enumerate(lecture_list):
                    # if lecture_info.state_cd == 'RJ':
                    if lecture_info.member_view_state_cd == 'DELETE':
                        member_data.rj_lecture_counts += 1
                    # if lecture_info.state_cd == 'NP':
                    if lecture_info.member_view_state_cd == 'WAIT':
                        member_data.np_lecture_counts += 1

                    if lecture_info.use != 0:
                        # if lecture_info.state_cd == 'IP' or lecture_info.state_cd == 'PE':
                        if lecture_info.state_cd == 'IP':
                            member_data.lecture_reg_count += lecture_info.lecture_reg_count
                            member_data.lecture_rem_count += lecture_info.lecture_rem_count
                            member_data.lecture_avail_count += lecture_info.lecture_avail_count
                            member_data.end_date = lecture_info.end_date
                            if member_data.start_date is None or member_data.start_date == '':
                                member_data.start_date = lecture_info.start_date
                            else:
                                if member_data.start_date > lecture_info.start_date:
                                    member_data.start_date = lecture_info.start_date
                            if member_data.end_date is None or member_data.start_date == '':
                                member_data.end_date = lecture_info.end_date
                            else:
                                if member_data.end_date < lecture_info.end_date:
                                    member_data.end_date = lecture_info.end_date

                        # if lecture_info.state_cd == 'NP' or lecture_info.state_cd == 'RJ':
                        #    member_data.lecture_reg_count_yet += lecture_info.lecture_reg_count
                        #    member_data.lecture_rem_count_yet += lecture_info.lecture_rem_count
                        #    member_data.lecture_avail_count_yet += lecture_info.lecture_avail_count

                        if member_data.mod_dt is None or member_data.mod_dt == '':
                            member_data.mod_dt = lecture_info.mod_dt
                        else:
                            if member_data.mod_dt > lecture_info.mod_dt:
                                member_data.mod_dt = lecture_info.mod_dt
                        member_data.lecture_reg_count_total += lecture_info.lecture_reg_count
                        member_data.lecture_rem_count_total += lecture_info.lecture_rem_count
                        member_data.lecture_avail_count_total += lecture_info.lecture_avail_count
                        member_data.lecture_id = lecture_info.lecture_id

                member_list.append(member_data)

            if lecture_finish_check > 0:
                member_data_finish.rj_lecture_counts = 0
                member_data_finish.np_lecture_counts = 0

                member_data_finish.lecture_reg_count_yet = 0
                member_data_finish.lecture_rem_count_yet = 0
                member_data_finish.lecture_avail_count_yet = 0

                member_data_finish.lecture_counts = len(lecture_finish_list)
                member_data_finish.lecture_reg_count = 0
                member_data_finish.lecture_rem_count = 0
                member_data_finish.lecture_avail_count = 0

                member_data_finish.lecture_reg_count_total = 0
                member_data_finish.lecture_rem_count_total = 0
                member_data_finish.lecture_avail_count_total = 0
                member_data_finish.start_date = None
                member_data_finish.end_date = None
                member_data_finish.mod_dt = None
                for idx, lecture_info in enumerate(lecture_finish_list):
                    # if lecture_info.state_cd == 'RJ':
                    if lecture_info.member_view_state_cd == 'DELETE':
                        member_data_finish.rj_lecture_counts += 1
                    # if lecture_info.state_cd == 'NP':
                    if lecture_info.member_view_state_cd == 'WAIT':
                        member_data_finish.np_lecture_counts += 1

                    if lecture_info.use != 0:
                        # if lecture_info.state_cd == 'IP' or lecture_info.state_cd == 'PE':
                        if lecture_info.state_cd == 'IP':
                            member_data_finish.lecture_reg_count += lecture_info.lecture_reg_count
                            member_data_finish.lecture_rem_count += lecture_info.lecture_rem_count
                            member_data_finish.lecture_avail_count += lecture_info.lecture_avail_count
                            member_data_finish.end_date = lecture_info.end_date
                            if member_data_finish.start_date is None or member_data_finish.start_date == '':
                                member_data_finish.start_date = lecture_info.start_date
                            else:
                                if member_data_finish.start_date > lecture_info.start_date:
                                    member_data_finish.start_date = lecture_info.start_date

                            if member_data_finish.end_date is None or member_data_finish.end_date == '':
                                member_data_finish.end_date = lecture_info.end_date
                            else:
                                if member_data_finish.end_date < lecture_info.end_date:
                                    member_data_finish.end_date = lecture_info.end_date

                        # if lecture_info.state_cd == 'NP' or lecture_info.state_cd == 'RJ':
                        #    member_data_finish.lecture_reg_count_yet += lecture_info.lecture_reg_count
                        #    member_data_finish.lecture_rem_count_yet += lecture_info.lecture_rem_count
                        #    member_data_finish.lecture_avail_count_yet += lecture_info.lecture_avail_count

                        if member_data_finish.mod_dt is None or member_data_finish.mod_dt == '':
                            member_data_finish.mod_dt = lecture_info.mod_dt
                        else:
                            if member_data_finish.mod_dt > lecture_info.mod_dt:
                                member_data_finish.mod_dt = lecture_info.mod_dt

                        member_data_finish.lecture_reg_count_total += lecture_info.lecture_reg_count
                        member_data_finish.lecture_rem_count_total += lecture_info.lecture_rem_count
                        member_data_finish.lecture_avail_count_total += lecture_info.lecture_avail_count
                        member_data_finish.lecture_id = lecture_info.lecture_id

                member_finish_list.append(member_data_finish)

        context['member_data'] = member_list
        context['member_finish_data'] = member_finish_list

    return context


class AlarmView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'alarm.html'

    def get_context_data(self, **kwargs):
        context = super(AlarmView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None

        if error is None:
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=1).order_by('-reg_dt')
            log_data = LogTb.objects.filter(class_tb_id=class_id, use=1).order_by('-reg_dt')
            log_data.order_by('-reg_dt')

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

            context['log_data'] = log_data

        return context


class AlarmTestView(LoginRequiredMixin, AccessTestMixin, AjaxListView):
    context_object_name = "log_data"
    template_name = "alarm_test.html"
    page_template = 'alarm_test_page.html'

    def get_queryset(self):
        # context = super(AlarmTestView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        # page_template =
        log_data = None
        if error is None:
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=1).order_by('-reg_dt')
            log_data = LogTb.objects.filter(class_tb_id=class_id, use=1).order_by('-reg_dt')
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

        # context['log_data'] = log_data

        return log_data


@page_template('alarm_test_page.html')  # just add this decorator
def entry_index(
        request, template='alarm_test.html', extra_context=None):

    class_id = request.session.get('class_id', '')
    error = None
    log_data = None
    if error is None:
        # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=1).order_by('-reg_dt')
        log_data = LogTb.objects.filter(class_tb_id=class_id, use=1).order_by('-reg_dt')
        log_data.order_by('-reg_dt')

    context = {
        'log_data': log_data,
    }
    if extra_context is not None:
        context.update(extra_context)
    return render(request, template, context)

'''
def entry_index(
        request,
        template='alarm_test.html',
        page_template='alarm_test_page.html'):
    class_id = request.session.get('class_id', '')
    error = None
    log_data = None
    if error is None:
        # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=1).order_by('-reg_dt')
        log_data = LogTb.objects.filter(class_tb_id=class_id, use=1).order_by('-reg_dt')
        log_data.order_by('-reg_dt')

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

    context = {
        'request': request,
        'entry_list': log_data,
        'page_template': page_template,
    }
    if request.is_ajax():
        template = page_template

    return render(request, template, context)
'''

'''
@page_template('alarm_test_page.html')  # just add this decorator
def entry_index(request, template='alarm_test.html', extra_context=None):
    class_id = request.session.get('class_id', '')
    error = None

    if error is None:
        # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=1).order_by('-reg_dt')
        log_data = LogTb.objects.filter(class_tb_id=class_id, use=1).order_by('-reg_dt')
        log_data.order_by('-reg_dt')

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

    context = {
        'entries': log_data,
    }
    if extra_context is not None:
        context.update(extra_context)
    return render_to_response(
        template, context, context_instance=RequestContext(request))
'''


class AlarmViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'alarm_data_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(AlarmViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None

        if error is None:
            log_data = LogTb.objects.filter(class_tb_id=class_id, use=1).order_by('-reg_dt')
            log_data.order_by('-reg_dt')

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

            context['log_data'] = log_data

        return context


class TrainerSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting.html'

    def get_context_data(self, **kwargs):
        context = super(TrainerSettingView, self).get_context_data(**kwargs)

        return context


class MyPageView(AccessTestMixin, TemplateView):
    template_name = 'setting_mypage.html'

    def get_context_data(self, **kwargs):
        context = super(MyPageView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context = get_trainer_setting_data(context, self.request.user.id, class_id)

        return context


class PushSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_push.html'

    def get_context_data(self, **kwargs):
        context = super(PushSettingView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context = get_trainer_setting_data(context, self.request.user.id, class_id)

        return context


class ReserveSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_reserve.html'

    def get_context_data(self, **kwargs):
        context = super(ReserveSettingView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context = get_trainer_setting_data(context, self.request.user.id, class_id)

        return context

class ClassSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_class.html'

    def get_context_data(self, **kwargs):
        context = super(ClassSettingView, self).get_context_data(**kwargs)

        return context

class SalesSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_sales.html'

    def get_context_data(self, **kwargs):
        context = super(SalesSettingView, self).get_context_data(**kwargs)

        return context


class LanguageSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_language.html'

    def get_context_data(self, **kwargs):
        context = super(LanguageSettingView, self).get_context_data(**kwargs)

        return context


# 회원가입 api
@csrf_exempt
def add_member_info_logic(request):
    fast_check = request.POST.get('fast_check')
    email = request.POST.get('email')
    name = request.POST.get('name')
    phone = request.POST.get('phone')
    contents = request.POST.get('contents')
    counts = request.POST.get('counts')
    price = request.POST.get('price')
    start_date = request.POST.get('start_date')
    end_date = request.POST.get('end_date')
    counts_fast = request.POST.get('counts_fast')
    price_fast = request.POST.get('price_fast')
    start_date_fast = request.POST.get('start_date_fast')
    end_date_fast = request.POST.get('end_date_fast')
    sex = request.POST.get('sex')
    birthday_dt = request.POST.get('birthday')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    input_start_date = ''
    input_end_date = ''
    input_counts = 0
    input_price = 0
    now = timezone.now()
    class_info = None

    if User.objects.filter(username=phone).exists():
        error = '이미 가입된 회원 입니다.'
    #elif User.objects.filter(email=email).exists():
    #    error = '이미 가입된 회원 입니다.'
    #elif email == '':
    #    error = 'e-mail 정보를 입력해 주세요.'
    elif name == '':
        error = '이름을 입력해 주세요.'
    elif phone == '':
        error = '연락처를 입력해 주세요.'
    elif len(phone) != 11 and len(phone) != 10:
        error = '연락처를 확인해 주세요.'
    elif not phone.isdigit():
        error = '연락처를 확인해 주세요.'

    if error is None:
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

    if error is None:
        if len(phone) == 11:
            password = phone[7:]
        elif len(phone) == 10:
            password = phone[6:]

    if error is None:

        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강사 강좌 정보가 없습니다.'

    if error is None:
        try:
            with transaction.atomic():
                user = User.objects.create_user(username=phone, email=email, first_name=name, password=password)
                group = Group.objects.get(name='trainee')
                user.groups.add(group)
                if birthday_dt == '':
                    member = MemberTb(member_id=user.id, name=name, phone=phone, contents=contents, sex=sex,
                                      mod_dt=timezone.now(), reg_dt=timezone.now(), user_id=user.id)
                else:
                    member = MemberTb(member_id=user.id, name=name, phone=phone, contents=contents, sex=sex,
                                      birthday_dt=birthday_dt, mod_dt=timezone.now(),reg_dt=timezone.now(), user_id=user.id)
                member.save()
                lecture = LectureTb(class_tb_id=class_info.class_id,member_id=member.member_id,
                                    lecture_reg_count=input_counts, lecture_rem_count=input_counts,
                                    lecture_avail_count=input_counts, price=input_price, option_cd='DC', state_cd='IP',
                                    start_date=input_start_date,end_date=input_end_date, mod_dt=now,
                                    reg_dt=now, use=1)
                lecture.save()

        except ValueError as e:
            error = '이미 가입된 회원입니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '이미 가입된 회원입니다.'

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 '\
        #               + name + ' 회원님의</span> 정보를 <span class="status">등록</span>했습니다.'
        log_data = LogTb(log_type='LB01', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=name, class_tb_id=class_id, lecture_tb_id=lecture.lecture_id,
                         log_info='회원 정보', log_how='등록',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


# 회원가입 api
@csrf_exempt
def add_member_info_logic_test(request):
    fast_check = request.POST.get('fast_check')
    user_id = request.POST.get('user_id')
    name = request.POST.get('name')
    phone = request.POST.get('phone')
    contents = request.POST.get('contents')
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
    next_page = request.POST.get('next_page')

    error = None
    input_start_date = ''
    input_end_date = ''
    input_counts = 0
    input_price = 0
    class_info = None
    lecture_info = None

    # if User.objects.filter(username=phone).exists():
    #    error = '이미 가입된 회원 입니다.'
    # elif User.objects.filter(email=email).exists():
    #    error = '이미 가입된 회원 입니다.'
    # elif email == '':
    #    error = 'e-mail 정보를 입력해 주세요.'
    if search_confirm == '0':
        if name == '':
            error = '이름을 입력해 주세요.'
        elif phone == '':
            error = '연락처를 입력해 주세요.'
        elif len(phone) != 11 and len(phone) != 10:
            error = '연락처를 확인해 주세요.'
        elif not phone.isdigit():
            error = '연락처를 확인해 주세요.'

    if error is None:
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

    if error is None:

        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강사 강좌 정보가 없습니다.'

    if error is None:
        try:
            user = User.objects.get(username=user_id)

        except ObjectDoesNotExist:
            error = '가입되지 않은 회원입니다.'

    if error is None:
        try:
            with transaction.atomic():

                state_cd = 'IP'

                lecture_info = add_lecture_info_logic_func(class_info.class_id, user.id, state_cd, input_counts, input_price, input_start_date, input_end_date, contents)

        except ValueError as e:
            error = '이미 가입된 회원입니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '이미 가입된 회원입니다.'

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + name + ' 회원님의</span> 정보를 <span class="status">등록</span>했습니다.'

        log_data = LogTb(log_type='LB01', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='등록',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


def add_lecture_info_logic_func(class_id, member_id, state_cd, counts, price, start_date, end_date, note):

    lecture = LectureTb(class_tb_id=class_id, member_id=member_id,
                        lecture_reg_count=counts, lecture_rem_count=counts,
                        lecture_avail_count=counts, price=price, option_cd='DC',
                        state_cd=state_cd,
                        start_date=start_date, end_date=end_date,
                        note=note,
                        mod_dt=timezone.now(),
                        reg_dt=timezone.now(), use=1)
    lecture.save()

    return lecture


# 회원수정 api
@csrf_exempt
def update_member_info_logic(request):
    member_id = request.POST.get('id')
    email = request.POST.get('email')
    first_name = request.POST.get('first_name')
    last_name = request.POST.get('last_name')
    name = request.POST.get('name')
    phone = request.POST.get('phone')
    contents = request.POST.get('contents')
    sex = request.POST.get('sex')
    birthday_dt = request.POST.get('birthday')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None

    if member_id == '':
        error = '회원 ID를 확인해 주세요.'

    if name == '':
        error = '이름을 입력해 주세요.'
    elif phone == '':
        error = '연락처를 입력해 주세요.'
    elif len(phone) != 11 and len(phone) != 10:
        error = '연락처를 확인해 주세요.'
    elif not phone.isdigit():
        error = '연락처를 확인해 주세요.'

    if error is None:
        try:
            user = User.objects.get(username=member_id, is_active=1)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

        try:
            member = MemberTb.objects.get(user_id=user.id, use=1)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    if error is None:
        try:
            with transaction.atomic():
                user.first_name = first_name
                user.last_name = last_name
                user.email = email
                user.save()
                member.name = name
                member.phone = phone
                member.contents = contents
                member.sex = sex

                if birthday_dt != '':
                    member.birthday_dt = birthday_dt
                member.mod_dt = timezone.now()
                member.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:

        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #              + name + ' 회원님의</span> 정보를 <span class="status">수정</span>했습니다.'

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=name, class_tb_id=class_id,
                         log_info='회원 정보', log_how='수정',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


# 회원가입 api
@csrf_exempt
def delete_member_info_logic(request):
    member_id = request.POST.get('id')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None

    if member_id == '':
        error = '회원 ID를 확인해 주세요.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강사 강좌 정보가 없습니다.'

    if error is None:

        try:
            user = User.objects.get(username=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

        try:
            member = MemberTb.objects.get(user_id=user.id, use=1)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

        lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                member_id=user.id, use=1)

    if error is None:
        try:
            with transaction.atomic():
                #user.is_active = 0
                #user.save()
                #member.use = 0
                #member.mod_dt = timezone.now()
                #member.save()
                for lecture_info in lecture_data:
                    schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                              lecture_tb_id=lecture_info.lecture_id,
                                                              state_cd='NP')

                    schedule_data_finish = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                                     lecture_tb_id=lecture_info.lecture_id,
                                                                     state_cd='PE')
                    repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                                           lecture_tb_id=lecture_info.lecture_id)
                    schedule_data.delete()
                    repeat_schedule_data.delete()
                    # schedule_data_finish.class_tb_id = ''
                    # schedule_data_finish.save()
                    if lecture_info.state_cd == 'IP':
                        lecture_info.state_cd = 'PE'
                    lecture_info.use = 0
                    lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
                    lecture_info.mod_dt = timezone.now()
                    lecture_info.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:

        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member.name + ' 회원님의</span> 수강정보를 <span class="status">삭제</span>했습니다.'

        log_data = LogTb(log_type='LB02', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member.name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='삭제',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


@csrf_exempt
def resend_member_lecture_info_logic(request):

    lecture_id = request.POST.get('lecture_id', '')
    member_name = request.POST.get('member_name', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page', '')

    error = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '회원 수강정보를 불러오지 못했습니다.'

    if error is None:
        # lecture_info.state_cd = 'NP'
        lecture_info.member_view_state_cd = 'WAIT'
        lecture_info.mod_dt = timezone.now()

        lecture_info.save()

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member_name + ' 회원님의</span> 수강정보를 <span class="status">재요청</span>했습니다.'

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='재요청',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


@csrf_exempt
def delete_member_lecture_info_logic(request):

    lecture_id = request.POST.get('lecture_id', '')
    member_name = request.POST.get('member_name', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None

    if lecture_id is None or lecture_id == '':
        error = '회원 수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '회원 수강정보를 불러오지 못했습니다.'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                  state_cd='NP')
        repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
        schedule_data.delete()
        repeat_schedule_data.delete()
        lecture_info.use = 0
        lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
        lecture_info.mod_dt = timezone.now()
        if lecture_info.state_cd == 'IP':
            lecture_info.state_cd = 'PE'
        lecture_info.save()

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member_name + ' 회원님의</span> 수강정보를 <span class="status"> 삭제 </span>했습니다.'

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='삭제',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


@csrf_exempt
def refund_member_lecture_info_logic(request):

    lecture_id = request.POST.get('lecture_id', '')
    member_name = request.POST.get('member_name', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None

    if lecture_id is None or lecture_id == '':
        error = '회원 수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '회원 수강정보를 불러오지 못했습니다.'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                  state_cd='NP')
        repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
        schedule_data.delete()
        repeat_schedule_data.delete()
        lecture_info.use = 0
        lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
        lecture_info.mod_dt = timezone.now()
        lecture_info.state_cd = 'RF'
        lecture_info.save()

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member_name + ' 회원님의</span> 수강정보를 <span class="status"> 삭제 </span>했습니다.'

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='환불 처리',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


@csrf_exempt
def update_member_lecture_view_info_logic(request):

    lecture_id = request.POST.get('lecture_id', '')
    member_name = request.POST.get('member_name', '')
    member_view_state_cd = request.POST.get('member_view_state_cd', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None

    if lecture_id is None or lecture_id == '':
        error = '회원 수강정보를 불러오지 못했습니다.'

    if error is None:
        if member_view_state_cd != 'VIEW' and member_view_state_cd != 'WAIT' and member_view_state_cd != 'DELETE':
            error = '회원 상태 코드가 맞지 않습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '회원 수강정보를 불러오지 못했습니다.'

    if error is None:
        lecture_info.member_view_state_cd = member_view_state_cd
        lecture_info.mod_dt = timezone.now()
        lecture_info.save()

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member_name + ' 회원님의</span> 수강정보를 <span class="status"> 삭제 </span>했습니다.'

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='회원 연동', log_how='수정',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


@csrf_exempt
def refund_member_lecture_info_logic(request):

    lecture_id = request.POST.get('lecture_id', '')
    member_name = request.POST.get('member_name', '')
    refund_price = request.POST.get('refund_price', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None
    input_refund_price = 0

    if lecture_id is None or lecture_id == '':
        error = '회원 수강정보를 불러오지 못했습니다.'

    if error is None:
        if refund_price is None or refund_price == 0:
            error = '환불 금액을 입력해 주세요.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '회원 수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            input_refund_price = int(refund_price)
        except ValueError:
            error = '환불 금액은 숫자만 입력 가능합니다.'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                  state_cd='NP')
        repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
        schedule_data.delete()
        repeat_schedule_data.delete()
        # lecture_info.use = 0
        lecture_info.refund_price = input_refund_price
        lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
        lecture_info.mod_dt = timezone.now()
        lecture_info.state_cd = 'RF'
        lecture_info.save()

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member_name + ' 회원님의</span> 수강정보를 <span class="status"> 삭제 </span>했습니다.'

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='환불 처리',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


@csrf_exempt
def update_member_lecture_info_logic(request):

    lecture_id = request.POST.get('lecture_id', '')
    start_date = request.POST.get('start_date', '')
    end_date = request.POST.get('end_date', '')
    price = request.POST.get('price', '')
    refund_price = request.POST.get('refund_price', '')
    lecture_reg_count = request.POST.get('lecture_reg_count', '')
    note = request.POST.get('note', '')
    member_name = request.POST.get('member_name', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page', '')

    error = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '회원 수강정보를 불러오지 못했습니다.'

    if error is None:

        if start_date is None or start_date == '':
            start_date = lecture_info.start_date
        if end_date is None or end_date == '':
            end_date = lecture_info.end_date
        if price is None or price == '':
            price = lecture_info.price
        if refund_price is None or refund_price == '':
            refund_price = lecture_info.refund_price
        if lecture_reg_count is None or lecture_reg_count == '':
            lecture_reg_count = lecture_info.lecture_reg_count
        if note is None or note == '':
            note = lecture_info.note

    if error is None:
        if lecture_reg_count < lecture_info.lecture_rem_count:
            error = '등록 횟수가 남은 횟수보다 작습니다.'

    if error is None:
        if lecture_reg_count < lecture_info.lecture_reg_count-lecture_info.lecture_avail_count:
            error = '등록횟수가이미 등록한 스케쥴보다 작습니다.'

    if error is None:
        lecture_info.start_date = start_date
        lecture_info.end_date = end_date
        lecture_info.price = price
        lecture_info.refund_price = refund_price
        lecture_info.note = note
        lecture_info.lecture_reg_count = lecture_reg_count
        lecture_info.mod_dt = timezone.now()
        lecture_info.save()

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member_name + ' 회원님의</span> 수강정보를 <span class="status">수정</span>했습니다.'

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='수정',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


@method_decorator(csrf_exempt, name='dispatch')
class GetMemberInfoView(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'search_member_id_ajax.html'

    def get(self, request, *args, **kwargs):

        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        context = super(GetMemberInfoView, self).get_context_data(**kwargs)
        user_id = request.POST.get('id', '')

        member = ''
        user = ''
        error = None

        if user_id == '':
            error = 'id를 입력해주세요.'

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

        if error is None:
            try:
                member = MemberTb.objects.get(user_id=user.id, use=1)
            except ObjectDoesNotExist:
                error = '회원 ID를 확인해 주세요.'

        context['member_info'] = member
        messages.error(request, error)

        return render(request, self.template_name, context)


# log 삭제
@csrf_exempt
def alarm_delete_logic(request):
    log_size = request.POST.get('log_id_size')
    delete_log_id = request.POST.getlist('log_id_array[]')
    next_page = request.POST.get('next_page')

    error = None
    if log_size == '0':
        error = '로그가 없습니다.'

    if error is None:

        for i in range(0, int(log_size)):
            try:
                log_info = LogTb.objects.get(log_id=delete_log_id[i])
            except ObjectDoesNotExist:
                error = 'log가 존재하지 않습니다'
            if error is None:
                log_info.use = 0
                log_info.mod_dt = timezone.now()
                log_info.save()

        return redirect(next_page)
    else:
        messages.error(request, error)
        return redirect(next_page)


@method_decorator(csrf_exempt, name='dispatch')
class ReadMemberLectureData(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'member_lecture_data_ajax.html'

    def get(self, request, *args, **kwargs):
        context = super(ReadMemberLectureData, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')

        context = get_trainee_repeat_schedule_data_func(context, class_id, None)
        context = get_member_data(context, class_id, None)

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        lecture_id = request.POST.get('lecture_id', None)
        class_id = request.session.get('class_id', '')
        member_id = request.POST.get('member_id', None)
        context = super(ReadMemberLectureData, self).get_context_data(**kwargs)
        context = get_trainee_repeat_schedule_data_func(context, class_id, member_id)
        context = get_member_data(context, class_id, member_id)

        return render(request, self.template_name, context)


# 강사 예약허용시간 setting 업데이트 api
@csrf_exempt
def update_setting_push_logic(request):
    setting_trainee_schedule_confirm1 = request.POST.get('setting_trainee_schedule_confirm1', '')
    setting_trainee_schedule_confirm2 = request.POST.get('setting_trainee_schedule_confirm2', '')
    setting_trainee_no_schedule_confirm = request.POST.get('setting_trainee_no_schedule_confirm', '')
    setting_trainer_schedule_confirm = request.POST.get('setting_trainer_schedule_confirm', '')
    setting_trainer_no_schedule_confirm1 = request.POST.get('setting_trainer_no_schedule_confirm1', '')
    setting_trainer_no_schedule_confirm2 = request.POST.get('setting_trainer_no_schedule_confirm2', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    lt_pus_01 = None
    lt_pus_02 = None
    lt_pus_03 = None
    lt_pus_04 = None

    if error is None:
        try:
            lt_pus_01 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_01')
        except ObjectDoesNotExist:
            lt_pus_01 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_01', reg_dt=timezone.now(),
                                  use=1)
        try:
            lt_pus_02 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_02')
        except ObjectDoesNotExist:
            lt_pus_02 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_02', reg_dt=timezone.now(),
                                  use=1)
        try:
            lt_pus_03 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_03')
        except ObjectDoesNotExist:
            lt_pus_03 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_03', reg_dt=timezone.now(),
                                  use=1)
        try:
            lt_pus_04 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_04')
        except ObjectDoesNotExist:
            lt_pus_04 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_04', reg_dt=timezone.now(),
                                  use=1)

    if error is None:
        try:
            with transaction.atomic():
                lt_pus_01.mod_dt = timezone.now()
                lt_pus_01.setting_info = setting_trainee_schedule_confirm1+'/'+setting_trainee_schedule_confirm2
                lt_pus_01.save()

                lt_pus_02.mod_dt = timezone.now()
                lt_pus_02.setting_info = setting_trainee_no_schedule_confirm
                lt_pus_02.save()

                lt_pus_03.mod_dt = timezone.now()
                lt_pus_03.setting_info = setting_trainer_schedule_confirm
                lt_pus_03.save()

                lt_pus_04.mod_dt = timezone.now()
                lt_pus_04.setting_info = setting_trainer_no_schedule_confirm1+'/'+setting_trainer_no_schedule_confirm2
                lt_pus_04.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:

        request.session.setting_trainee_schedule_confirm = setting_trainee_schedule_confirm1+'/'+setting_trainee_schedule_confirm2
        request.session.setting_trainee_no_schedule_confirm = setting_trainee_no_schedule_confirm
        request.session.setting_trainer_schedule_confirm = setting_trainer_schedule_confirm
        request.session.setting_trainer_no_schedule_confirm1 = setting_trainer_no_schedule_confirm1 + '/' + setting_trainer_no_schedule_confirm2

        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 님께서 ' \
        #               + 'PUSH 설정</span> 정보를 <span class="status">수정</span>했습니다.'

        log_data = LogTb(log_type='LT03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id,
                         log_info='PUSH 설정 정보', log_how='수정',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


# 강사 예약허용시간 setting 업데이트 api
@csrf_exempt
def update_setting_reserve_logic(request):
    setting_member_reserve_time_available = request.POST.get('setting_member_reserve_time_available', '')
    setting_member_reserve_time_prohibition = request.POST.get('setting_member_reserve_time_prohibition', '')
    setting_member_reserve_prohibition = request.POST.get('setting_member_reserve_prohibition', '')
    setting_trainer_work_time_available = request.POST.get('setting_trainer_work_time_available', '')
    class_id = request.session.get('class_id', '')

    next_page = request.POST.get('next_page')

    error = None
    lt_res_01 = None
    lt_res_02 = None
    lt_res_03 = None
    lt_res_04 = None

    if error is None:
        if setting_member_reserve_time_available == '':
            setting_member_reserve_time_available = '00:00-24:00'
        if setting_member_reserve_time_prohibition == '':
            setting_member_reserve_time_prohibition = '0'
        if setting_member_reserve_prohibition == '':
            setting_member_reserve_prohibition = '0'
        if setting_trainer_work_time_available == '':
            setting_trainer_work_time_available = '07:00-23:00'

    if error is None:
        try:
            lt_res_01 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_01')
        except ObjectDoesNotExist:
            lt_res_01 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_01', reg_dt=timezone.now(), use=1)
        try:
            lt_res_02 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_02')
        except ObjectDoesNotExist:
            lt_res_02 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_02', reg_dt=timezone.now(), use=1)
        try:
            lt_res_03 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_03')
        except ObjectDoesNotExist:
            lt_res_03 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_03', reg_dt=timezone.now(), use=1)
        try:
            lt_res_04 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_04')
        except ObjectDoesNotExist:
            lt_res_04 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_04', reg_dt=timezone.now(), use=1)

    if error is None:
        try:
            with transaction.atomic():
                lt_res_01.mod_dt = timezone.now()
                lt_res_01.setting_info = setting_member_reserve_time_available
                lt_res_01.save()

                lt_res_02.mod_dt = timezone.now()
                lt_res_02.setting_info = setting_member_reserve_time_prohibition
                lt_res_02.save()

                lt_res_03.mod_dt = timezone.now()
                lt_res_03.setting_info = setting_member_reserve_prohibition
                lt_res_03.save()

                lt_res_04.mod_dt = timezone.now()
                lt_res_04.setting_info = setting_trainer_work_time_available
                lt_res_04.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:
        request.session['setting_member_reserve_prohibition'] = setting_member_reserve_prohibition
        request.session['setting_member_reserve_time_available'] = setting_member_reserve_time_available
        request.session['setting_member_reserve_time_prohibition'] = setting_member_reserve_time_prohibition
        request.session['setting_trainer_work_time_available'] = setting_trainer_work_time_available
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 님께서 '\
        #               + '예약 허용대 시간 설정</span> 정보를 <span class="status">수정</span>했습니다.'

        log_data = LogTb(log_type='LT03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id,
                         log_info='예약 관련 설정 정보', log_how='수정',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


# 강사 예약허용시간 setting 업데이트 api
@csrf_exempt
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
                lt_sal_01 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_01', use=1)
            except ObjectDoesNotExist:
                lt_sal_01 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_01', reg_dt=timezone.now(),
                                      use=1)
            try:
                lt_sal_02 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_02', use=1)
            except ObjectDoesNotExist:
                lt_sal_02 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_02', reg_dt=timezone.now(),
                                      use=1)
            try:
                lt_sal_03 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_03', use=1)
            except ObjectDoesNotExist:
                lt_sal_03 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_03', reg_dt=timezone.now(),
                                      use=1)
            try:
                lt_sal_04 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_04', use=1)
            except ObjectDoesNotExist:
                lt_sal_04 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_04', reg_dt=timezone.now(),
                                      use=1)
            try:
                lt_sal_05 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_05', use=1)
            except ObjectDoesNotExist:
                lt_sal_05 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_05', reg_dt=timezone.now(),
                                      use=1)
            try:
                lt_sal_00 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_00', use=1)
            except ObjectDoesNotExist:
                lt_sal_00 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_00', reg_dt=timezone.now(),
                                      use=1)

    if error is None:
        try:
            with transaction.atomic():
                if setting_sales_type == '0':
                    lt_sal_01.mod_dt = timezone.now()
                    lt_sal_01.setting_info = setting_sal_01
                    lt_sal_01.save()

                    lt_sal_02.mod_dt = timezone.now()
                    lt_sal_02.setting_info = setting_sal_02
                    lt_sal_02.save()

                    lt_sal_03.mod_dt = timezone.now()
                    lt_sal_03.setting_info = setting_sal_03
                    lt_sal_03.save()

                    lt_sal_04.mod_dt = timezone.now()
                    lt_sal_04.setting_info = setting_sal_04
                    lt_sal_04.save()

                    lt_sal_05.mod_dt = timezone.now()
                    lt_sal_05.setting_info = setting_sal_05
                    lt_sal_05.save()

                    lt_sal_00.mod_dt = timezone.now()
                    lt_sal_00.setting_info = ''
                    lt_sal_00.save()
                else:
                    lt_sal_01.mod_dt = timezone.now()
                    lt_sal_01.setting_info = ''
                    lt_sal_01.save()

                    lt_sal_02.mod_dt = timezone.now()
                    lt_sal_02.setting_info = ''
                    lt_sal_02.save()

                    lt_sal_03.mod_dt = timezone.now()
                    lt_sal_03.setting_info = ''
                    lt_sal_03.save()

                    lt_sal_04.mod_dt = timezone.now()
                    lt_sal_04.setting_info = ''
                    lt_sal_04.save()

                    lt_sal_05.mod_dt = timezone.now()
                    lt_sal_05.setting_info = ''
                    lt_sal_05.save()

                    lt_sal_00.mod_dt = timezone.now()
                    lt_sal_00.setting_info = setting_sal_00
                    lt_sal_00.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:

        log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 님께서 ' \
                       + '강의금액 설정</span> 정보를 <span class="status">수정</span>했습니다.'

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id,
                         log_info='강의 금액 설정 정보', log_how='수정',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


# 강사 언어 setting 업데이트 api
@csrf_exempt
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
            lt_lan_01 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_LAN_01')
        except ObjectDoesNotExist:
            lt_lan_01 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_LAN_01', reg_dt=timezone.now(), use=1)

    if error is None:
        try:
            with transaction.atomic():
                lt_lan_01.mod_dt = timezone.now()
                lt_lan_01.setting_info = setting_member_language
                lt_lan_01.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:
        request.session['setting_language'] = setting_member_language
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 님께서 '\
        #               + '언어 설정</span> 정보를 <span class="status">수정</span>했습니다.'

        log_data = LogTb(log_type='LT03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id, log_info='언어 설정 정보', log_how='수정',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


class TrainerSettingViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'setting_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(TrainerSettingViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context = get_trainer_setting_data(context, self.request.user.id, class_id)
        return context


def get_trainer_setting_data(context, user_id, class_id):

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_01', use=1)
        lt_res_01 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_01 = '00:00-23:59'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_02', use=1)
        lt_res_02 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_02 = '0'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_03', use=1)
        lt_res_03 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_03 = '0'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_04', use=1)
        lt_res_04 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_04 = '00:00-23:59'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_LAN_01', use=1)
        lt_lan_01 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_lan_01 = 'KOR'


    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_PUS_01', use=1)
        lt_pus_data = setting_data.setting_info.split('/')
        lt_pus_01 = lt_pus_data[0]
        lt_pus_02 = lt_pus_data[1]
    except ObjectDoesNotExist:
        lt_pus_01 = ''
        lt_pus_02 = ''

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_PUS_02', use=1)
        lt_pus_03 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_pus_03 = ''

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_PUS_03', use=1)
        lt_pus_04 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_pus_04 = ''

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_PUS_04', use=1)
        lt_pus_data = setting_data.setting_info.split('/')
        lt_pus_05 = lt_pus_data[0]
        lt_pus_06 = lt_pus_data[1]
    except ObjectDoesNotExist:
        lt_pus_05 = ''
        lt_pus_06 = ''

    context['lt_res_01'] = lt_res_01
    context['lt_res_02'] = lt_res_02
    context['lt_res_03'] = lt_res_03
    context['lt_res_04'] = lt_res_04
    context['lt_lan_01'] = lt_lan_01

    context['lt_pus_01'] = lt_pus_01
    context['lt_pus_02'] = lt_pus_02
    context['lt_pus_03'] = lt_pus_03
    context['lt_pus_04'] = lt_pus_04
    context['lt_pus_05'] = lt_pus_05
    context['lt_pus_06'] = lt_pus_06

    return context


@method_decorator(csrf_exempt, name='dispatch')
class ReadLectureByClassMemberAjax(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'member_class_lecture_data_ajax.html'

    def get(self, request, *args, **kwargs):
        context = super(ReadLectureByClassMemberAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        member_id = request.POST.get('member_id', '')
        context['error'] = None

        context = get_lecture_list_by_class_member_id(context, class_id, member_id)

        if context['error'] is not None:
            messages.error(self.request, context['error'])

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        context = super(ReadLectureByClassMemberAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        member_id = request.POST.get('member_id', '')
        context['error'] = None

        context = get_lecture_list_by_class_member_id(context, class_id, member_id)
        if context['error'] is not None:
            messages.error(self.request, context['error'])

        return render(request, self.template_name, context)


def get_lecture_list_by_class_member_id(context, class_id, member_id):
    error = None
    class_data = None
    context['error'] = None
    lecture_counts = 0
    np_lecture_counts = 0
    if class_id is None or class_id == '':
        error = '강사 정보를 불러오지 못했습니다.'

    if member_id is None or member_id == '':
        error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_data = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_data.trainer_info = MemberTb.objects.get(member_id=class_data.member_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_data.class_type_name = CommonCdTb.objects.get(common_cd=class_data.subject_cd)
        except ObjectDoesNotExist:
            error = '강좌 type을 불러오지 못했습니다.'

    if error is None:
        lecture_data = LectureTb.objects.filter(class_tb_id=class_id, member_id=member_id, use=1).order_by('-start_date')

        for lecture_info in lecture_data:
            lecture_info.start_date = str(lecture_info.start_date)
            lecture_info.end_date = str(lecture_info.end_date)
            lecture_info.mod_dt = str(lecture_info.mod_dt)
            lecture_info.reg_dt = str(lecture_info.reg_dt)
            lecture_info.state_cd_name = CommonCdTb.objects.get(common_cd=lecture_info.state_cd)
            lecture_info.member_view_state_cd_name = CommonCdTb.objects.get(common_cd=lecture_info.member_view_state_cd)
            if lecture_info.member_view_state_cd == 'WAIT':
                np_lecture_counts += 1
            lecture_counts += 1

    class_data.lecture_counts = lecture_counts
    class_data.np_lecture_counts = np_lecture_counts
    context['class_data'] = class_data
    context['lecture_data'] = lecture_data

    # print(error)
    if error is not None:
        context['error'] = error

    return context


# 회워탈퇴 api
@csrf_exempt
def out_member_logic(request):
    member_id = request.POST.get('id')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None

    if member_id == '':
        error = '회원 ID를 확인해 주세요.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강사 강좌 정보가 없습니다.'

    if error is None:

        try:
            user = User.objects.get(username=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

        try:
            member = MemberTb.objects.get(user_id=user.id, use=1)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

        lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                member_id=user.id, use=1)

    if error is None:
        try:
            with transaction.atomic():
                # user.is_active = 0
                # user.save()
                # member.use = 0
                # member.mod_dt = timezone.now()
                # member.save()
                for lecture_info in lecture_data:
                    schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                              lecture_tb_id=lecture_info.lecture_id,
                                                              state_cd='NP')

                    schedule_data_finish = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                                     lecture_tb_id=lecture_info.lecture_id,
                                                                     state_cd='PE').update(class_tb_id='')
                    repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                                           lecture_tb_id=lecture_info.lecture_id)
                    schedule_data.delete()
                    repeat_schedule_data.delete()
                    # schedule_data_finish.class_tb_id = ''
                    # schedule_data_finish.save()
                    if lecture_info.state_cd == 'IP':
                        lecture_info.state_cd = 'PE'
                    lecture_info.use = 0
                    lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
                    lecture_info.mod_dt = timezone.now()
                    lecture_info.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:

        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member.name + ' 회원님의</span> 수강정보를 <span class="status">삭제</span>했습니다.'

        log_data = LogTb(log_type='LB02', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member.name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='삭제',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


# 회원가입 api
@csrf_exempt
def add_class_info_logic(request):
    center_id = request.POST.get('center_id', '')
    subject_cd = request.POST.get('subject_cd', '')
    subject_detail_nm = request.POST.get('subject_detail_nm', '')
    start_date = request.POST.get('start_date', '')
    end_date = request.POST.get('end_date', '')
    class_hour = request.POST.get('class_hour', '')
    start_hour_unit = request.POST.get('start_hour_unit', '')
    class_member_num = request.POST.get('class_member_num', '')

    next_page = request.POST.get('next_page', '')

    error = None

    if subject_cd is None or subject_cd == '':
        error = '스케쥴 타입을 설정해주세요.'

    if class_hour is None or class_hour == '':
        class_hour = 1
    if start_hour_unit is None or start_hour_unit == '':
        start_hour_unit = 1

    if start_date is None or start_date == '':
        start_date = datetime.date.today()
    if end_date is None or end_date == '':
        end_date = start_date + timezone.timedelta(days=3650)

    if class_member_num is None or class_member_num == '':
        error = '수업당 최대 허용 인원을 설정해 주세요.'

    if error is None:
        try:
            with transaction.atomic():

                class_info = ClassTb(member_id=request.user.id, center_id=center_id,
                                     subject_cd=subject_cd, start_date=start_date, end_date=end_date,
                                     class_hour=class_hour, start_hour_unit=start_hour_unit,
                                     class_member_num=class_member_num, state_cd='IP',
                                     reg_dt=timezone.now(), mod_dt=timezone.now(), use=1)

                class_info.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:
        request.session['class_id'] = class_info.class_id
        log_data = LogTb(log_type='LC01', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         log_info='강좌 정보', log_how='등록',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)


class ClassSelectView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainer_class_select.html'

    def get_context_data(self, **kwargs):
        context = super(ClassSelectView, self).get_context_data(**kwargs)
        return context


class AddClassView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainer_class_add.html'

    def get_context_data(self, **kwargs):
        context = super(AddClassView, self).get_context_data(**kwargs)

        error = None

        class_type_cd_data = CommonCdTb.objects.filter(upper_common_cd='02', use=1)

        for class_type_cd_info in class_type_cd_data:
            class_type_cd_info.subject_type_cd = CommonCdTb.objects.filter(upper_common_cd='03', group_cd=class_type_cd_info.common_cd, use=1)

        center_list = CenterTrainerTb.objects.filter(member_id=self.request.user.id, use=1)

        context['center_list'] = center_list
        context['class_type_cd_data'] = class_type_cd_data

        return context


class GetClassDataViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = "trainer_class_ajax.html"

    def get_context_data(self, **kwargs):
        context = super(GetClassDataViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        class_data = None

        if error is None:
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=1).order_by('-reg_dt')
            class_data = ClassTb.objects.filter(member_id=self.request.user.id, use=1).order_by('-reg_dt')
            # log_data.order_by('-reg_dt')

        if error is None:
            for class_info in class_data:
                class_info.subject_type_name = CommonCdTb.objects.get(common_cd=class_info.subject_cd)
                class_info.state_cd_name = CommonCdTb.objects.get(common_cd=class_info.state_cd)

        context['class_data'] = class_data

        if error is not None:
            messages.error(self.request, error)

        return context


@csrf_exempt
def class_processing_logic(request):

    class_id = request.POST.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    if class_id == '':
        error = '강좌를 선택해 주세요.'

    if error is None:
        request.session['class_id'] = class_id

    if error is None:
        return redirect(next_page)
    else:
        messages.error(request, error)
    return redirect(next_page)


@csrf_exempt
def delete_class_info_logic(request):

    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page', '')
    error = None

    if class_id is None or class_id == '':
        error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        class_info.member_view_state_cd = 'DELETE'
        class_info.mod_dt = timezone.now()
        class_info.save()

    if error is None:
        log_data = LogTb(log_type='LC02', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id,
                         log_info='강좌 정보', log_how='연동 해제',
                         reg_dt=timezone.now(), ip=get_client_ip(request), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        messages.error(request, error)

        return redirect(next_page)

