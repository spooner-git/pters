import datetime

import logging
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import InternalError
from django.db import transaction
from django.db import IntegrityError
from django.db.models import Q
from django.db.models.expressions import RawSQL
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views import View
from django.views.generic import RedirectView
from django.views.generic import TemplateView
from django.views.generic.base import ContextMixin
from el_pagination.views import AjaxListView

# Create your views here.

from configs.const import ON_SCHEDULE_TYPE, ADD_SCHEDULE, DEL_SCHEDULE, USE, UN_USE, FROM_TRAINEE_LESSON_ALARM_ON

from configs.views import AccessTestMixin

from login.models import MemberTb, LogTb, CommonCdTb
from schedule.models import ScheduleTb, DeleteScheduleTb, RepeatScheduleTb, HolidayTb
from trainer.models import ClassLectureTb, GroupLectureTb, ClassTb, SettingTb
from .models import LectureTb, MemberLectureTb

from schedule.functions import func_get_lecture_id, func_get_group_lecture_id, \
    func_check_group_available_member_before, func_check_group_available_member_after, func_add_schedule, \
    func_date_check, func_refresh_lecture_count
from .functions import func_get_class_lecture_count, func_get_lecture_list, \
    func_get_class_list, func_get_trainee_on_schedule, func_get_trainee_off_schedule, func_get_trainee_group_schedule, \
    func_get_holiday_schedule, func_get_trainee_on_repeat_schedule, func_check_schedule_setting, \
    func_get_lecture_connection_list

logger = logging.getLogger(__name__)


class GetTraineeErrorInfoView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_error_info.html'

    def get_context_data(self, **kwargs):
        context = super(GetTraineeErrorInfoView, self).get_context_data(**kwargs)
        return context


class IndexView(LoginRequiredMixin, AccessTestMixin, RedirectView):
    url = '/trainee/cal_month/'

    def get(self, request, **kwargs):

        lecture_data = MemberLectureTb.objects.filter(member_id=request.user.id,
                                                      use=USE).exclude(auth_cd='DELETE'
                                                                       ).order_by('-lecture_tb__start_date')

        class_counter = 0
        class_data = None
        error = None

        if len(lecture_data) > 0:
            for idx, lecture_info in enumerate(lecture_data):
                if idx == 0:
                    class_data = ClassLectureTb.objects.filter(lecture_tb=lecture_info.lecture_tb,
                                                               use=USE).order_by('-lecture_tb__start_date')
                else:
                    class_data |= ClassLectureTb.objects.filter(lecture_tb=lecture_info.lecture_tb,
                                                                use=USE).order_by('-lecture_tb__start_date')

        if class_data is None or len(class_data) == 0:
            self.url = '/trainee/cal_month_blank/'
        elif len(class_data) == 1:
            for lecture_info_data in class_data:
                lecture_info = lecture_info_data.lecture_tb
                request.session['class_id'] = lecture_info_data.class_tb_id
                request.session['lecture_id'] = lecture_info.lecture_id
                lecture_auth_info = None
                try:
                    lecture_auth_info = MemberLectureTb.objects.get(member_id=request.user.id,
                                                                    lecture_tb=lecture_info.lecture_id)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'

                if lecture_auth_info is not None:
                    if lecture_auth_info.auth_cd == 'WAIT':
                        self.url = '/trainee/lecture_select/'
                    elif lecture_auth_info.auth_cd == 'DELETE':
                        self.url = '/trainee/cal_month_blank/'
                    else:
                        request.session['class_hour'] = lecture_info_data.class_tb.class_hour
                        request.session['class_type_code'] = lecture_info_data.class_tb.subject_cd
                        request.session['class_type_name'] = lecture_info_data.class_tb.get_class_type_cd_name()
                        request.session['class_center_name'] = lecture_info_data.class_tb.get_center_name()
                else:
                    self.url = '/trainee/cal_month_blank/'

        else:
            class_id_comp = ''
            lecture_np_counter = 0
            lecture_id_select = ''
            for lecture_info_data in class_data:
                lecture_info = lecture_info_data.lecture_tb
                lecture_auth_info = None
                try:
                    lecture_auth_info = MemberLectureTb.objects.get(member_id=request.user.id,
                                                                    lecture_tb=lecture_info.lecture_id)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'
                if lecture_auth_info is not None:
                    if lecture_auth_info.auth_cd == 'WAIT':
                        lecture_np_counter += 1
                if class_id_comp != lecture_info_data.class_tb_id:
                    class_id_comp = lecture_info_data.class_tb_id
                    if lecture_info.lecture_avail_count > 0:
                        lecture_id_select = lecture_info.lecture_id

                    class_counter += 1

            if class_counter > 1:
                self.url = '/trainee/lecture_select/'
            else:
                request.session['class_id'] = class_id_comp
                request.session['lecture_id'] = lecture_id_select
                if lecture_np_counter > 0:
                    self.url = '/trainee/lecture_select/'
                else:
                    self.url = '/trainee/cal_month/'
                    class_info = None

                    try:
                        class_info = ClassTb.objects.get(class_id=class_id_comp)
                    except ObjectDoesNotExist:
                        error = '수강 정보를 불러오지 못했습니다.'
                    if error is None:
                        request.session['class_hour'] = class_info.class_hour
                        request.session['class_type_code'] = class_info.subject_cd
                        request.session['class_type_name'] = class_info.get_class_type_cd_name()
                        request.session['class_center_name'] = class_info.get_center_name()

        return super(IndexView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(IndexView, self).get_redirect_url(*args, **kwargs)


class CalMonthBlankView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'cal_month_trainee_blank.html'

    def get(self, request):
        # context = super(CalMonthBlankView, self).get_context_data(**kwargs)
        context = {}
        context = get_trainee_setting_data(context, request.user.id)
        holiday = HolidayTb.objects.filter(use=USE)
        request.session['setting_language'] = context['lt_lan_01']
        context['holiday'] = holiday
        return render(request, self.template_name, context)


class MyPageBlankView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'mypage_trainee_blank.html'

    def get(self, request):
        # context = super(MyPageBlankView, self).get_context_data(**kwargs)
        context = {}
        member_info = None
        error = None
        try:
            member_info = MemberTb.objects.get(member_id=request.user.id)
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

        if error is None:
            if member_info.phone is None:
                member_info.phone = ''
            if member_info.birthday_dt is None:
                member_info.birthday_dt = ''
            context['member_info'] = member_info
        return render(request, self.template_name, context)


class CalMonthView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'cal_month_trainee.html'

    def get(self, request):
        context = {}
        # context = super(CalMonthView, self).get_context_data(**kwargs)
        error = None
        class_id = request.session.get('class_id', '')
        class_info = None

        if class_id != '':
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '수강 정보를 불러오지 못했습니다.'

        if class_id != '' and error is None:
            context = func_get_class_lecture_count(context, class_id, request.user.id)
            context = get_trainer_setting_data(context, class_info.member_id, class_id)
            request.session['class_hour'] = class_info.class_hour
            request.session['class_type_code'] = class_info.subject_cd
            request.session['class_type_name'] = class_info.get_class_type_cd_name()
            # 회원 setting 값 로드

        context = func_get_holiday_schedule(context)
        context = get_trainee_setting_data(context, request.user.id)
        request.session['setting_language'] = context['lt_lan_01']
            # 강사 setting 값 로드

        return render(request, self.template_name, context)


class MyPageView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'mypage_trainee.html'

    def get(self, request):
        # context = super(MyPageView, self).get_context_data(**kwargs)
        context = {}
        error = None
        class_id = request.session.get('class_id', '')
        member_info = None
        class_info = None
        # today = datetime.date.today()
        if class_id != '' and class_id is not None:
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '수강 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                member_info = MemberTb.objects.get(member_id=request.user.id)
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'

        if class_id != '' and class_id is not None:
            if error is None:
                try:
                    class_info.mem_info = MemberTb.objects.get(member_id=class_info.member_id)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'
            context['class_info'] = class_info

        if error is None:
            if member_info.phone is None:
                member_info.phone = ''
            if member_info.birthday_dt is None:
                member_info.birthday_dt = ''
            context['member_info'] = member_info

        if error is None:
            if class_id != '' and class_id is not None:
                context = func_get_trainee_on_schedule(context, class_id, request.user.id, None, None)
                context = func_get_trainee_on_repeat_schedule(context, request.user.id, class_id)
                context = get_trainee_schedule_data_by_class_id_func(context, request.user.id,
                                                                     class_id)
                # 강사 setting 값 로드
                context = get_trainer_setting_data(context, class_info.member_id, class_id)

            # 회원 setting 값 로드
            context = get_trainee_setting_data(context, request.user.id)
            request.session['setting_language'] = context['lt_lan_01']

        return render(request, self.template_name, context)


class LectureSelectView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainee_lecture_select.html'

    def get_context_data(self, **kwargs):
        context = super(LectureSelectView, self).get_context_data(**kwargs)
        return context


class DeleteTraineeAccountView(AccessTestMixin, TemplateView):
    template_name = 'delete_trainee_account_form.html'

    def get_context_data(self, **kwargs):
        context = super(DeleteTraineeAccountView, self).get_context_data(**kwargs)

        return context


# pt 일정 추가
def add_trainee_schedule_logic(request):
    class_id = request.session.get('class_id', '')
    group_schedule_id = request.POST.get('group_schedule_id', None)
    training_date = request.POST.get('training_date', '')
    # time_duration = request.POST.get('time_duration', '')
    training_time = request.POST.get('training_time', '')
    next_page = request.POST.get('next_page')
    class_type_name = request.session.get('class_type_name', '')

    error = None
    class_info = None
    start_date = None
    end_date = None
    push_class_id = []
    push_title = []
    push_message = []
    context = {'push_lecture_id': None, 'push_title': None, 'push_message': None}
    schedule_info = None
    lecture_id = None
    lt_res_member_time_duration = 1

    if class_id is None or class_id == '':
        error = '수강 정보를 불러오지 못했습니다.'
    if training_date == '':
        error = '날짜를 선택해 주세요.'
    # elif time_duration == '':
    #     error = '진행 시간을 선택해 주세요.'
    elif training_time == '':
        error = '시작 시각을 선택해 주세요.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '수강 정보를 불러오지 못했습니다.'
    if error is None:
        try:
            setting_data = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id,
                                                 setting_type_cd='LT_RES_MEMBER_TIME_DURATION')
            lt_res_member_time_duration = int(setting_data.setting_info)
        except ObjectDoesNotExist:
            lt_res_member_time_duration = 1

    if error is None:
        if group_schedule_id is None or group_schedule_id == '':
            time_duration_temp = class_info.class_hour*int(lt_res_member_time_duration)
            start_date = datetime.datetime.strptime(training_date+' '+training_time, '%Y-%m-%d %H:%M')
            end_date = start_date + datetime.timedelta(minutes=int(time_duration_temp))
        else:
            try:
                schedule_info = ScheduleTb.objects.get(schedule_id=group_schedule_id)
            except ObjectDoesNotExist:
                error = '스케쥴 정보를 불러오지 못했습니다.'
            if error is None:
                start_date = schedule_info.start_dt
                end_date = schedule_info.end_dt
                if schedule_info.state_cd == 'PE' or schedule_info.state_cd == 'PC':
                    error = '이미 완료된 일정입니다.'

    if error is None:
        error = func_check_schedule_setting(class_id, start_date, end_date, ADD_SCHEDULE)

    if error is None:
        if group_schedule_id == '' or group_schedule_id is None:
            lecture_id = func_get_lecture_id(class_id, request.user.id)
        # 그룹 Lecture Id 조회
        else:
            try:
                group_schedule_info = ScheduleTb.objects.get(schedule_id=group_schedule_id)
            except ObjectDoesNotExist:
                group_schedule_info = None

            if group_schedule_info is not None:
                if group_schedule_info.state_cd == 'PE' or group_schedule_info.state_cd == 'PC':
                    error = '이미 완료된 일정입니다.'

                if error is None:
                    group_schedule_data = ScheduleTb.objects.filter(group_tb_id=group_schedule_info.group_tb_id,
                                                                    group_schedule_id=group_schedule_id,
                                                                    lecture_tb__member_id=request.user.id)
                    if len(group_schedule_data) == 0:
                        lecture_id = func_get_group_lecture_id(group_schedule_info.group_tb_id, request.user.id)
                    else:
                        lecture_id = None
                        error = '이미 일정에 포함되어있습니다.'

    if error is None:
        if lecture_id is None:
            error = '예약 가능 횟수를 확인해주세요.'

    if error is None:
        error = pt_add_logic_func(training_date, start_date, end_date, request.user.id, lecture_id, class_id,
                                  request, group_schedule_id)

    if error is None:
        # func_update_member_schedule_alarm(class_id)
        # class_info.schedule_check = 1
        # class_info.save()

        try:
            setting_data = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id,
                                                 setting_type_cd='LT_PUS_FROM_TRAINEE_LESSON_ALARM')
            lt_pus_from_trainee_lesson_alarm = int(setting_data.setting_info)
        except ObjectDoesNotExist:
            lt_pus_from_trainee_lesson_alarm = FROM_TRAINEE_LESSON_ALARM_ON

        if lt_pus_from_trainee_lesson_alarm == lt_pus_from_trainee_lesson_alarm:
            push_info_schedule_start_date = str(start_date).split(':')
            push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')

            if group_schedule_id == '' or group_schedule_id is None:

                push_class_id.append(class_id)
                push_title.append(class_type_name + ' 수업 - 일정 알림')
                push_message.append(request.user.first_name + '님이 '
                                    + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                    + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                    + ' [1:1 레슨] 일정을 등록했습니다')
            else:

                push_class_id.append(class_id)
                push_title.append(class_type_name + ' 수업 - 일정 알림')
                push_message.append(request.user.first_name + '님이 '
                                    + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                    + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                    + ' ['+schedule_info.get_group_type_cd_name()+']'
                                    + schedule_info.get_group_name() + ' 일정을 등록했습니다')

            context['push_class_id'] = push_class_id
            context['push_title'] = push_title
            context['push_message'] = push_message
        else:
            context['push_class_id'] = ''
            context['push_title'] = ''
            context['push_message'] = ''

        return render(request, 'ajax/trainee_error_info.html', context)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


# pt 일정 취소
def delete_trainee_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')
    class_type_name = request.session.get('class_type_name', '')
    error = None
    lecture_info = None
    class_info = None
    schedule_info = None
    start_date = None
    end_date = None
    push_class_id = []
    push_title = []
    push_message = []
    group_name = ''
    group_type_name = ''
    context = {'push_lecture_id': None, 'push_title': None, 'push_message': None}
    lecture_id = None

    if schedule_id == '':
        error = '스케쥴 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보를 불러오지 못했습니다.'

    if error is None:
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt
        group_name = schedule_info.get_group_name()
        group_type_name = schedule_info.get_group_type_cd_name()
        if start_date < timezone.now():  # 강사 설정 시간으로 변경필요
            error = '지난 일정입니다.'

    if error is None:
        if schedule_info.state_cd == 'PE' or schedule_info.state_cd == 'PC':
            error = '종료된 일정입니다.'

    if error is None:
        lecture_info = schedule_info.lecture_tb
        lecture_id = schedule_info.lecture_tb.lecture_id

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '수강 정보를 불러오지 못했습니다.'

    if error is None:
        if lecture_info.member_id != str(request.user.id):
            error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        if error is None:
            error = func_check_schedule_setting(class_id, start_date, end_date, DEL_SCHEDULE)

    if error is None:
        try:
            with transaction.atomic():

                delete_schedule = DeleteScheduleTb(schedule_id=schedule_info.schedule_id,
                                                   class_tb_id=schedule_info.class_tb_id,
                                                   lecture_tb_id=schedule_info.lecture_tb_id,
                                                   group_tb_id=schedule_info.group_tb_id,
                                                   delete_repeat_schedule_tb=schedule_info.repeat_schedule_tb_id,
                                                   group_schedule_id=schedule_info.group_schedule_id,
                                                   start_dt=schedule_info.start_dt, end_dt=schedule_info.end_dt,
                                                   permission_state_cd=schedule_info.permission_state_cd,
                                                   state_cd=schedule_info.state_cd,
                                                   en_dis_type=schedule_info.en_dis_type,
                                                   note=schedule_info.note, member_note=schedule_info.member_note,
                                                   reg_member_id=schedule_info.reg_member_id,
                                                   del_member_id=request.user.id,
                                                   reg_dt=schedule_info.reg_dt, mod_dt=timezone.now(), use=UN_USE)

                delete_schedule.save()
                schedule_info.delete()

                if error is None:
                    error = func_refresh_lecture_count(lecture_id)

        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값의 형태에 문제가 있습니다.'
        except IntegrityError:
            error = '삭제된 일정입니다.'
        except InternalError:
            error = '삭제된 일정입니다.'
        except ValidationError:
            error = '예약 가능한 횟수를 확인해주세요.'

    if error is None:
        # func_update_member_schedule_alarm(class_id)
        # class_info.schedule_check = 1
        # class_info.save()

        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_info.class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info=' ['+group_type_name+']'+group_name + ' 일정',
                         log_how='취소', log_detail=str(start_date) + '/' + str(end_date), use=USE)
        log_data.save()

        try:
            setting_data = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id,
                                                 setting_type_cd='LT_PUS_FROM_TRAINEE_LESSON_ALARM')
            lt_pus_from_trainee_lesson_alarm = int(setting_data.setting_info)
        except ObjectDoesNotExist:
            lt_pus_from_trainee_lesson_alarm = FROM_TRAINEE_LESSON_ALARM_ON
        if lt_pus_from_trainee_lesson_alarm == lt_pus_from_trainee_lesson_alarm:
            push_info_schedule_start_date = str(start_date).split(':')
            push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')

            push_class_id.append(class_id)
            push_title.append(class_type_name + ' 수업 - 일정 알림')
            push_message.append(request.user.first_name + '님이 '
                                + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                + ' ['+group_type_name+']'+group_name+' 일정을 취소했습니다.')

            context['push_class_id'] = push_class_id
            context['push_title'] = push_title
            context['push_message'] = push_message
        else:
            context['push_class_id'] = ''
            context['push_title'] = ''
            context['push_message'] = ''

        return render(request, 'ajax/trainee_error_info.html', context)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


class GetTraineeScheduleView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_schedule_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetTraineeScheduleView, self).get_context_data(**kwargs)
        date = self.request.GET.get('date', '')
        day = self.request.GET.get('day', '')

        class_id = self.request.session.get('class_id', '')
        today = datetime.date.today()
        if date != '':
            today = datetime.datetime.strptime(date, '%Y-%m-%d')
        if day == '':
            day = 46
        start_date = today - datetime.timedelta(days=int(day))
        end_date = today + datetime.timedelta(days=int(day))
        context['error'] = None
        # context = func_get_holiday_schedule(context)
        context = func_get_trainee_on_schedule(context, class_id, self.request.user.id, start_date, end_date)
        context = func_get_trainee_off_schedule(context, class_id, start_date, end_date)
        context = func_get_trainee_group_schedule(context, self.request.user.id, class_id, start_date, end_date)
        context = func_get_class_lecture_count(context, class_id, self.request.user.id)

        if context['error'] is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '['
                         + str(self.request.user.id) + ']' + context['error'])
            messages.error(self.request, context['error'])

        return context


class GetTraineeScheduleHistoryView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_all_schedule_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetTraineeScheduleHistoryView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        member_id = self.request.user.id
        context['error'] = None
        if member_id is None or member_id == '':
            context['error'] = '회원 정보를 불러오지 못했습니다.'

        if context['error'] is None:
            context = func_get_trainee_on_schedule(context, class_id, member_id, None, None)

        if context['error'] is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name+'['
                         + str(self.request.user.id) + ']' + context['error'])
            messages.error(self.request, context['error'])

        return context


class GetTraineeClassListView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'ajax/trainee_class_list_ajax.html'

    def get(self, request):
        context = {'error': None}
        context = func_get_class_list(context, request.user.id)
        if context['error'] is not None:
            logger.error(request.user.last_name + ' ' + request.user.first_name + '['
                         + str(request.user.id) + ']' + context['error'])
            messages.error(request, context['error'])

        return render(request, self.template_name, context)


class GetTraineeLectureConnectionListView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_lecture_list_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetTraineeLectureConnectionListView, self).get_context_data(**kwargs)
        class_id = self.request.GET.get('class_id', '')
        auth_cd = self.request.GET.get('auth_cd', '')
        context['error'] = None
        context = func_get_lecture_connection_list(context, class_id, self.request.user.id, auth_cd)

        if context['error'] is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '['
                         + str(self.request.user.id) + ']' + context['error'])
            messages.error(self.request, context['error'])

        return context


class GetTraineeLectureListView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_lecture_list_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetTraineeLectureListView, self).get_context_data(**kwargs)
        class_id = self.request.GET.get('class_id', '')
        auth_cd = self.request.GET.get('auth_cd', '')
        context['error'] = None
        context = func_get_lecture_list(context, class_id, self.request.user.id, auth_cd)

        if context['error'] is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '['
                         + str(self.request.user.id) + ']' + context['error'])
            messages.error(self.request, context['error'])

        return context


class GetTraineeCountView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_schedule_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetTraineeCountView, self).get_context_data(**kwargs)
        # context = {}
        class_id = self.request.session.get('class_id', '')
        context = func_get_class_lecture_count(context, class_id, self.request.user.id)

        if context['error'] is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '['
                         + str(self.request.user.id) + ']' + context['error'])
            messages.error(self.request, context['error'])

        return context


def lecture_processing(request):

    lecture_id = request.POST.get('lecture_id', '')
    class_id = request.POST.get('class_id', '')
    check = request.POST.get('check', '')
    next_page = request.POST.get('next_page')

    error = None
    # lecture_info = None
    member_lecture_wait_list = []

    if lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if check == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        class_lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id, auth_cd='VIEW', use=USE)
        for class_lecture_info in class_lecture_list:
            try:
                member_lecture_info = MemberLectureTb.objects.get(member_id=request.user.id, auth_cd='WAIT',
                                                                  lecture_tb_id=class_lecture_info.lecture_tb_id,
                                                                  use=USE)
            except ObjectDoesNotExist:
                member_lecture_info = None

            if member_lecture_info is not None:
                member_lecture_wait_list.append(member_lecture_info)

    if error is None:
        if check == '1':
            for member_lecture_wait_info in member_lecture_wait_list:
                member_lecture_wait_info.auth_cd = 'DELETE'
                member_lecture_wait_info.save()

        elif check == '0':
            request.session['class_id'] = class_id
            request.session['lecture_id'] = lecture_id
            class_type_name = ''
            class_name = None
            class_info = None
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'

            if error is None:
                request.session['class_hour'] = class_info.class_hour
                request.session['class_type_name'] = class_info.get_class_type_cd_name()
                request.session['class_center_name'] = class_info.get_center_name()

            # lecture_info.auth_cd = 'VIEW'
            # lecture_info.save()
            for member_lecture_wait_info in member_lecture_wait_list:
                member_lecture_wait_info.auth_cd = 'VIEW'
                member_lecture_wait_info.save()

        elif check == '2':
            request.session['class_id'] = class_id
            request.session['lecture_id'] = lecture_id
            class_info = None

            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'

            if error is None:
                request.session['class_hour'] = class_info.class_hour
                request.session['class_type_name'] = class_info.get_class_type_cd_name()
                request.session['class_center_name'] = class_info.get_center_name()

    if error is None:

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
    return redirect(next_page)


class GetTraineeInfoView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'ajax/trainee_info_ajax.html'

    def get(self, request):
        context = {}
        # context = super(GetTraineeInfoView, self).get_context_data(**kwargs)
        error = None
        member_info = None
        class_id = request.session.get('class_id', '')

        # today = datetime.date.today()
        # start_date = today - datetime.timedelta(days=46)
        # end_date = today + datetime.timedelta(days=47)
        class_info = None
        if class_id != '' and class_id is not None:
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'

        if error is None:
            if class_id != '' and class_id is not None:
                try:
                    member_info = MemberTb.objects.get(member_id=request.user.id)
                except ObjectDoesNotExist:
                    error = '회원 정보를 불러오지 못했습니다.'

        if error is None:
            if class_id != '' and class_id is not None:
                try:
                    class_info.mem_info = MemberTb.objects.get(member_id=class_info.member_id)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'
        context['class_info'] = class_info

        if error is None:
            if class_id != '' and class_id is not None:
                context = func_get_trainee_on_schedule(context, class_id, request.user.id, None, None)
                context = func_get_trainee_on_repeat_schedule(context, request.user.id, class_id)
                context = get_trainee_schedule_data_by_class_id_func(context, request.user.id,
                                                                     class_id)
                # 강사 setting 값 로드
                context = get_trainer_setting_data(context, class_info.member_id, class_id)

            # 회원 setting 값 로드
            context = get_trainee_setting_data(context, request.user.id)
            request.session['setting_language'] = context['lt_lan_01']

        if error is None:
            if member_info.phone is None:
                member_info.phone = ''
            if member_info.birthday_dt is None:
                member_info.birthday_dt = ''
            context['member_info'] = member_info

        return render(request, self.template_name, context)


def update_trainee_info_logic(request):
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
        error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            user = User.objects.get(id=member_id)
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

        try:
            member = MemberTb.objects.get(user_id=user.id)
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

    if first_name is None or first_name == '':
        first_name = user.first_name

    # if last_name is None or last_name == '':
    #     last_name = user.last_name

    if contents is None or contents == '':
        contents = member.contents

    if country is None or country == '':
        country = member.country

    if address is None or address == '':
        address = member.address

    if sex is None or sex == '':
        sex = member.sex

    if birthday_dt is None or birthday_dt == '':
        birthday_dt = member.birthday_dt

    if phone is None or phone == '':
        phone = member.phone
    else:
        if len(phone) != 11 and len(phone) != 10:
            error = '연락처를 확인해 주세요.'
        elif not phone.isdigit():
            error = '연락처를 확인해 주세요.'

    if error is None:
        try:
            with transaction.atomic():
                user.first_name = first_name
                # user.last_name = last_name
                user.save()
                # member.name = last_name + first_name
                member.name = first_name
                member.phone = phone
                member.contents = contents
                member.sex = sex
                if birthday_dt is not None and birthday_dt != '':
                    member.birthday_dt = birthday_dt
                member.country = country
                member.address = address
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
                         from_member_name=request.user.first_name,
                         log_info='회원 정보', log_how='수정', use=USE)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


class GetTraineeGroupIngListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_group_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetTraineeGroupIngListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        group_list = []

        lecture_data = MemberLectureTb.objects.filter(member_id=self.request.user.id,
                                                      lecture_tb__state_cd='IP',
                                                      auth_cd='VIEW').order_by('-lecture_tb__start_date')

        for lecture_info in lecture_data:
            group_lecture_check = 0
            try:
                group_lecture_info = GroupLectureTb.objects.get(group_tb__class_tb_id=class_id,
                                                                lecture_tb_id=lecture_info.lecture_tb_id)
            except ObjectDoesNotExist:
                group_lecture_check = 1

            if group_lecture_check == 0:
                check = 0

                try:
                    state_cd_nm = CommonCdTb.objects.get(common_cd=group_lecture_info.group_tb.state_cd)
                    group_lecture_info.group_tb.state_cd_nm = state_cd_nm.common_cd_nm
                except ObjectDoesNotExist:
                    error = '회원 정보를 불러오지 못했습니다.'

                if len(group_list) == 0:
                    group_list.append(group_lecture_info)

                for group_info in group_list:

                    if group_info.group_tb_id == group_lecture_info.group_tb_id:
                        check = 1
                if check == 0:
                    group_list.append(group_lecture_info)

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['group_data'] = group_list

        return context


class GetTraineeGroupEndListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_group_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetTraineeGroupEndListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        group_list = []

        lecture_data = MemberLectureTb.objects.filter(member_id=self.request.user.id,
                                                      lecture_tb__state_cd='IP').exclude(auth_cd='DELETE')
        lecture_data = lecture_data.order_by('-lecture_tb__start_date')

        for lecture_info in lecture_data:
            group_lecture_check = 0
            try:
                group_lecture_info = GroupLectureTb.objects.get(group_tb__class_tb_id=class_id,
                                                                lecture_tb_id=lecture_info.lecture_tb_id)
            except ObjectDoesNotExist:
                group_lecture_check = 1

            if group_lecture_check == 0:
                check = 0

                try:
                    state_cd_nm = CommonCdTb.objects.get(common_cd=group_lecture_info.group_tb.state_cd)
                    group_lecture_info.group_tb.state_cd_nm = state_cd_nm.common_cd_nm
                except ObjectDoesNotExist:
                    error = '회원 정보를 불러오지 못했습니다.'

                if len(group_list) == 0:
                    group_list.append(group_lecture_info)

                for group_info in group_list:

                    if group_info.group_tb_id == group_lecture_info.group_tb_id:
                        check = 1
                if check == 0:
                    group_list.append(group_lecture_info)

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['group_data'] = group_list

        return context


class AlarmView(LoginRequiredMixin, AccessTestMixin, AjaxListView):
    context_object_name = "log_data"
    template_name = "trainee_alarm.html"
    page_template = 'trainee_alarm_page.html'

    def get_queryset(self):
        lecture_id = self.request.session.get('lecture_id', '')
        error = None
        log_data = None

        if lecture_id is None or lecture_id == '':
            error = '수강정보를 불러오지 못했습니다.'

        if error is None:
            log_data = LogTb.objects.filter(lecture_tb_id=lecture_id, use=USE).order_by('-reg_dt')

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

                if log_info.log_detail != '' and log_info.log_detail is not None:
                    before_day = str(log_info.log_detail).split('/')[0]
                    after_day = str(log_info.log_detail).split('/')[1]

                    if '반복 일정' in log_info.log_info:
                        log_info.log_detail = before_day + '~' + after_day
                    else:
                        log_info.log_detail = before_day + '~' + after_day.split(' ')[1]

                day = int(log_info.time_ago.days)
                hour = int(log_info.time_ago.seconds/3600)
                minute = int(log_info.time_ago.seconds/60)
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


class AlarmViewAjax(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'ajax/alarm_data_ajax.html'

    def get(self, request):
        # context = super(AlarmViewAjax, self).get_context_data(**kwargs)
        context = {}
        error = None
        log_data = None

        if error is None:
            lecture_data = MemberLectureTb.objects.filter(member_id=request.user.id, auth_cd='VIEW')
            if len(lecture_data) > 0:
                for idx, lecture_data_info in enumerate(lecture_data):
                    lecture_info = lecture_data_info.lecture_tb
                    if idx == 0:
                        log_data = LogTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                        use=USE).order_by('-reg_dt')
                    else:
                        log_data |= LogTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                         use=USE).order_by('-reg_dt')
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

        return render(request, self.template_name, context)


def pt_add_logic_func(pt_schedule_date, start_date, end_date, user_id,
                      lecture_id, class_id, request, group_schedule_id):

    error = None
    lecture_info = None
    # class_info = None
    today = datetime.datetime.today()
    fifteen_days_after = today + datetime.timedelta(days=15)
    group_schedule_info = None
    group_id = None
    # start_date = None
    # end_date = None
    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'
    elif pt_schedule_date == '':
        error = '날짜를 선택해 주세요.'
    # elif pt_schedule_time_duration == '':
    #     error = '진행 시간을 선택해 주세요.'
    # elif pt_schedule_time == '':
    #     error = '시작 시간을 선택해 주세요.'

    # if error is None:
    #     try:
    #         class_info = ClassTb.objects.get(class_id=class_id)
    #     except ObjectDoesNotExist:
    #         error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        if group_schedule_id is not None and group_schedule_id != '':
            try:
                group_schedule_info = ScheduleTb.objects.get(schedule_id=group_schedule_id)
                group_id = group_schedule_info.group_tb_id
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'
        else:
            group_schedule_id = None

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id, use=USE)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'
        except ValueError:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        if lecture_info.member_id != str(user_id):
            error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        if lecture_info.state_cd != 'IP':
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        if start_date >= fifteen_days_after:
            error = '등록할 수 없는 날짜입니다.'

    if error is None:
        if start_date < timezone.now():
            error = '등록할 수 없는 날짜입니다.'

    if error is None:
        if lecture_info.lecture_avail_count == 0:
            error = '예약 가능한 횟수가 없습니다'

    if error is None:
        if group_schedule_info is not None and group_schedule_info != '':
            error = func_check_group_available_member_before(class_id, group_schedule_info.group_tb_id,
                                                             group_schedule_id)

    if error is None:
        try:
            with transaction.atomic():
                permission_state_cd = 'AP'
                schedule_result = func_add_schedule(class_id, lecture_id, None,
                                                    group_id, group_schedule_id,
                                                    start_date, end_date, '', ON_SCHEDULE_TYPE, request.user.id,
                                                    permission_state_cd,
                                                    'NP')
                error = schedule_result['error']

                if error is None:
                    error = func_refresh_lecture_count(lecture_id)

                if error is None:
                    if group_schedule_info is not None and group_schedule_info != '':
                        error = func_check_group_available_member_after(class_id, group_id, group_schedule_id)
                    else:
                        error = func_date_check(class_id, schedule_result['schedule_id'],
                                                pt_schedule_date, start_date, end_date)

                        if error is not None:
                            error += ' 일정이 중복됐습니다.'

                        if error is not None:
                            raise InternalError()

        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '날짜가 중복됐습니다.'
        except InternalError:
            error = error
        except ValidationError:
            error = '예약 가능한 횟수를 확인해주세요.'

    if error is None:
        if group_schedule_id is not None and group_schedule_id != '':
            log_data = LogTb(log_type='LS01', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             class_tb_id=class_id,
                             lecture_tb_id=lecture_id,
                             log_info='['+group_schedule_info.get_group_type_cd_name() + ']'
                                      + group_schedule_info.get_group_name() + ' 일정', log_how='등록',
                             log_detail=str(start_date) + '/' + str(end_date),  use=USE)
            log_data.save()
        else:
            log_data = LogTb(log_type='LS01', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name+request.user.first_name,
                             class_tb_id=class_id, lecture_tb_id=lecture_id,
                             log_info='[1:1 레슨] 일정', log_how='등록', log_detail=str(start_date) + '/' + str(end_date),
                             use=USE)
            log_data.save()

    else:
        return error


def get_trainee_repeat_schedule_data_func(context, class_id, member_id):

    error = None
    class_info = None
    pt_repeat_schedule_list = []
    lecture_list = None

    # 강좌 정보 가져오기
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '수강정보를 불러오지 못했습니다.'

    # 수강 정보 불러 오기
    if error is None:
        if member_id is None or member_id == '':
            lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                         auth_cd='VIEW',
                                                         lecture_tb__use=USE, use=USE)
        else:
            lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                         auth_cd='VIEW',
                                                         lecture_tb__member_id=member_id,
                                                         lecture_tb__use=USE, use=USE)

    if error is None:
        # 강사 클래스의 반복일정 불러오기
        pt_repeat_schedule_data = None

        if len(lecture_list) > 0:
            for lecture_list_info in lecture_list:
                lecture_info = lecture_list_info.lecture_tb
                if pt_repeat_schedule_data is None:
                    pt_repeat_schedule_data = \
                        RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                        en_dis_type=ON_SCHEDULE_TYPE).order_by('-reg_dt')
                else:
                    pt_repeat_schedule_data |= \
                        RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                        en_dis_type=ON_SCHEDULE_TYPE).order_by('-reg_dt')

            for pt_repeat_schedule_info in pt_repeat_schedule_data:
                # pt_repeat_schedule_info.start_date = str(pt_repeat_schedule_info.start_date)
                # pt_repeat_schedule_info.end_date = str(pt_repeat_schedule_info.end_date)
                state_cd_name = None
                try:
                    state_cd_name = CommonCdTb.objects.get(common_cd=pt_repeat_schedule_info.state_cd)
                except ObjectDoesNotExist:
                    error = '반복 일정의 상태를 불러오지 못했습니다.'
                if error is None:
                    pt_repeat_schedule_info.state_cd_nm = state_cd_name.common_cd_nm

                pt_repeat_schedule_list.append(pt_repeat_schedule_info)

    context['pt_repeat_schedule_data'] = pt_repeat_schedule_list
    if error is None:
        context['error'] = error

    return context


def get_trainer_setting_data(context, user_id, class_id):

    lt_res_01 = '00:00-23:59'
    lt_res_02 = 0
    lt_res_03 = '0'
    lt_res_04 = '00:00-23:59'
    lt_work_sun_time_avail = ''
    lt_work_mon_time_avail = ''
    lt_work_tue_time_avail = ''
    lt_work_wed_time_avail = ''
    lt_work_ths_time_avail = ''
    lt_work_fri_time_avail = ''
    lt_work_sat_time_avail = ''
    lt_res_05 = '7'
    lt_res_cancel_time = -1
    lt_res_enable_time = -1
    lt_res_member_time_duration = 1
    lt_res_member_start_time = 'A-0'
    lt_pus_from_trainee_lesson_alarm = FROM_TRAINEE_LESSON_ALARM_ON
    setting_data = SettingTb.objects.filter(member_id=user_id, class_tb_id=class_id, use=USE)

    for setting_info in setting_data:
        if setting_info.setting_type_cd == 'LT_RES_01':
            lt_res_01 = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_RES_02':
            lt_res_02 = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_RES_03':
            lt_res_03 = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_RES_04':
            lt_res_04 = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_WORK_SUN_TIME_AVAIL':
            lt_work_sun_time_avail = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_WORK_MON_TIME_AVAIL':
            lt_work_mon_time_avail = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_WORK_TUE_TIME_AVAIL':
            lt_work_tue_time_avail = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_WORK_WED_TIME_AVAIL':
            lt_work_wed_time_avail = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_WORK_THS_TIME_AVAIL':
            lt_work_ths_time_avail = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_WORK_FRI_TIME_AVAIL':
            lt_work_fri_time_avail = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_WORK_SAT_TIME_AVAIL':
            lt_work_sat_time_avail = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_RES_05':
            lt_res_05 = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_RES_CANCEL_TIME':
            lt_res_cancel_time = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_RES_ENABLE_TIME':
            lt_res_enable_time = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_RES_MEMBER_TIME_DURATION':
            lt_res_member_time_duration = int(setting_info.setting_info)
        if setting_info.setting_type_cd == 'LT_RES_MEMBER_START_TIME':
            lt_res_member_start_time = setting_info.setting_info
        if setting_info.setting_type_cd == 'LT_PUS_FROM_TRAINEE_LESSON_ALARM':
            lt_pus_from_trainee_lesson_alarm = int(setting_info.setting_info)

    if lt_res_cancel_time == -1:
        lt_res_cancel_time = lt_res_02*60
    if lt_res_enable_time == -1:
        lt_res_enable_time = lt_res_02*60
    if lt_work_sun_time_avail == '':
        lt_work_sun_time_avail = lt_res_04
    if lt_work_mon_time_avail == '':
        lt_work_mon_time_avail = lt_res_04
    if lt_work_tue_time_avail == '':
        lt_work_tue_time_avail = lt_res_04
    if lt_work_wed_time_avail == '':
        lt_work_wed_time_avail = lt_res_04
    if lt_work_ths_time_avail == '':
        lt_work_ths_time_avail = lt_res_04
    if lt_work_fri_time_avail == '':
        lt_work_fri_time_avail = lt_res_04
    if lt_work_sat_time_avail == '':
        lt_work_sat_time_avail = lt_res_04

    context['lt_res_01'] = lt_res_01
    context['lt_res_02'] = lt_res_02
    context['lt_res_03'] = lt_res_03
    # context['lt_res_04'] = lt_res_04
    context['lt_work_sun_time_avail'] = lt_work_sun_time_avail
    context['lt_work_mon_time_avail'] = lt_work_mon_time_avail
    context['lt_work_tue_time_avail'] = lt_work_tue_time_avail
    context['lt_work_wed_time_avail'] = lt_work_wed_time_avail
    context['lt_work_ths_time_avail'] = lt_work_ths_time_avail
    context['lt_work_fri_time_avail'] = lt_work_fri_time_avail
    context['lt_work_sat_time_avail'] = lt_work_sat_time_avail
    context['lt_res_05'] = lt_res_05
    context['lt_res_enable_time'] = lt_res_enable_time
    context['lt_res_cancel_time'] = lt_res_cancel_time
    context['lt_res_member_time_duration'] = lt_res_member_time_duration
    context['lt_res_member_start_time'] = lt_res_member_start_time
    context['lt_pus_from_trainee_lesson_alarm'] = lt_pus_from_trainee_lesson_alarm

    return context


def get_trainee_setting_data(context, user_id):

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, setting_type_cd='LT_LAN_01')
        lt_lan_01 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_lan_01 = 'KOR'

    context['lt_lan_01'] = lt_lan_01
    return context


def get_trainee_schedule_data_by_class_id_func(context, user_id, class_id):
    error = None

    context['lecture_info'] = None
    context['error'] = None

    # class_info = None
    next_schedule_start_dt = ''
    next_schedule_end_dt = ''
    lecture_reg_count_sum = 0
    lecture_rem_count_sum = 0
    lecture_avail_count_sum = 0
    pt_start_date = ''
    pt_end_date = ''
    lecture_counts = 0
    lecture_list = None

    if class_id is None or class_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    query_member_auth_cd \
        = "select `AUTH_CD` from MEMBER_LECTURE_TB as D" \
          " where D.LECTURE_TB_ID = `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and D.MEMBER_ID = "+str(user_id)

    if error is None:
        # 강사에 해당하는 강좌 정보 불러오기
        lecture_list = ClassLectureTb.objects.select_related(
            'lecture_tb').filter(class_tb_id=class_id, lecture_tb__member_id=user_id,
                                 lecture_tb__use=USE
                                 ).annotate(member_auth_cd=RawSQL(query_member_auth_cd, [])
                                            ).filter(member_auth_cd='VIEW').order_by('lecture_tb__start_date')
    if error is None:
        if len(lecture_list) > 0:
            for idx, lecture_list_info in enumerate(lecture_list):
                lecture_info = lecture_list_info.lecture_tb
                if error is None:
                    lecture_counts += 1
                    if lecture_counts == 1:
                        if lecture_info.state_cd == 'IP':
                            pt_start_date = lecture_info.start_date
                            pt_end_date = lecture_info.end_date

                    else:
                        if lecture_info.state_cd == 'IP':
                            if pt_start_date == '':
                                pt_start_date = lecture_info.start_date
                            else:
                                if pt_start_date > lecture_info.start_date:
                                    pt_start_date = lecture_info.start_date
                            if pt_end_date == '':
                                pt_end_date = lecture_info.end_date
                            else:
                                if pt_end_date < lecture_info.end_date:
                                    pt_end_date = lecture_info.end_date

                    lecture_reg_count_sum += lecture_info.lecture_reg_count
                    if lecture_info.state_cd == 'IP':
                        lecture_rem_count_sum += lecture_info.lecture_rem_count
                        lecture_avail_count_sum += lecture_info.lecture_avail_count

                else:
                    error = None
    if error is None:

        query_member_auth_cd \
            = "select `AUTH_CD` from MEMBER_LECTURE_TB as D" \
              " where D.LECTURE_TB_ID = `SCHEDULE_TB`.`LECTURE_TB_ID` and D.MEMBER_ID = " + str(user_id)

        lecture_finish_count = ScheduleTb.objects.select_related(
            'lecture_tb__member', 'group_tb'
        ).filter(Q(state_cd='PE') | Q(state_cd='PC'), class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE
                 ).annotate(member_auth_cd=RawSQL(query_member_auth_cd, [])
                            ).filter(member_auth_cd='VIEW').order_by('lecture_tb__start_date', 'start_dt').count()

    if error is not None:
        context['error'] = error

    context['next_schedule_start_dt'] = str(next_schedule_start_dt)
    context['next_schedule_end_dt'] = str(next_schedule_end_dt)
    context['lecture_info'] = lecture_list
    context['lecture_reg_count'] = lecture_reg_count_sum
    context['lecture_finish_count'] = lecture_finish_count
    context['lecture_rem_count'] = lecture_rem_count_sum
    context['lecture_avail_count'] = lecture_avail_count_sum
    context['pt_start_date'] = str(pt_start_date)
    context['pt_end_date'] = str(pt_end_date)

    return context
