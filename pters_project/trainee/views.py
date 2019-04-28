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

# Create your views here.

from configs.const import ON_SCHEDULE_TYPE, ADD_SCHEDULE, DEL_SCHEDULE, USE, UN_USE, FROM_TRAINEE_LESSON_ALARM_ON, \
    SCHEDULE_DUPLICATION_DISABLE, PROGRAM_SELECT, PROGRAM_LECTURE_CONNECT_DELETE, PROGRAM_LECTURE_CONNECT_ACCEPT

from configs.views import AccessTestMixin

from login.models import MemberTb, LogTb, CommonCdTb, SnsInfoTb
from schedule.models import ScheduleTb, DeleteScheduleTb, RepeatScheduleTb, HolidayTb
from trainer.functions import func_get_trainer_setting_list
from trainer.models import ClassLectureTb, GroupLectureTb, ClassTb, SettingTb, GroupTb, PackageGroupTb, PackageTb
from .models import LectureTb, MemberLectureTb

from schedule.functions import func_get_lecture_id, func_get_group_lecture_id, \
    func_check_group_available_member_before, func_check_group_available_member_after, func_add_schedule, \
    func_date_check, func_refresh_lecture_count
from .functions import func_get_class_lecture_count, func_get_lecture_list, \
    func_get_class_list, func_get_trainee_on_schedule, func_get_trainee_off_schedule, func_get_trainee_group_schedule, \
    func_get_holiday_schedule, func_get_trainee_on_repeat_schedule, func_check_select_time_reserve_setting, \
    func_get_lecture_connection_list, func_get_trainee_next_schedule_by_class_id, func_get_trainee_select_schedule, \
    func_get_trainee_ing_group_list, func_check_select_date_reserve_setting, func_get_trainee_package_list, \
    func_get_class_list_only_view

logger = logging.getLogger(__name__)


class GetTraineeErrorInfoView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_error_info.html'

    def get_context_data(self, **kwargs):
        context = super(GetTraineeErrorInfoView, self).get_context_data(**kwargs)
        return context


class IndexView(LoginRequiredMixin, AccessTestMixin, RedirectView):
    # url = '/trainee/cal_month/'
    url = '/trainee/trainee_main/'

    def get(self, request, **kwargs):

        class_id = request.session.get('class_id', '')

        # if class_id is None or class_id == '':
        #     self.url = '/trainee/trainee_main/'
        # else:

        query_auth_type_cd = "select B.AUTH_CD from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID =" \
                             " `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.MEMBER_ID = "+str(request.user.id)+" and" \
                             " B.USE=1"

        lecture_data = ClassLectureTb.objects.select_related(
            'class_tb',
            'lecture_tb__member').filter(
            lecture_tb__member_id=request.user.id,
            use=USE).annotate(auth_type_cd=RawSQL(query_auth_type_cd,
                                                  [])).exclude(auth_type_cd='DELETE'
                                                               ).order_by('-lecture_tb__start_date')
        if lecture_data is None or len(lecture_data) == 0:
            # self.url = '/trainee/cal_month_blank/'
            self.url = '/trainee/trainee_main/'

        elif len(lecture_data) == 1:
            for lecture_info in lecture_data:
                request.session['class_id'] = lecture_info.class_tb_id
                request.session['lecture_id'] = lecture_info.lecture_tb_id
                request.session['trainer_id'] = lecture_info.class_tb.member_id
                if lecture_info.auth_type_cd == 'WAIT':
                    # self.url = '/trainee/lecture_select/'
                    self.url = '/trainee/trainee_main/'
                elif lecture_info.auth_type_cd == 'DELETE':
                    # self.url = '/trainee/cal_month_blank/'
                    self.url = '/trainee/trainee_main/'
                else:
                    request.session['class_hour'] = lecture_info.class_tb.class_hour
                    request.session['class_type_code'] = lecture_info.class_tb.subject_cd
                    request.session['program_title'] = lecture_info.class_tb.get_class_type_cd_name()
                    request.session['class_center_name'] = lecture_info.class_tb.get_center_name()

        else:
            class_tb_comp = None
            class_counter = 0
            lecture_np_counter = 0
            lecture_id_select = ''
            class_tb_selected = None
            for lecture_info in lecture_data:
                if lecture_info.auth_type_cd == 'WAIT':
                    lecture_np_counter += 1

                if lecture_info.auth_type_cd == 'VIEW' and class_tb_selected is None:
                    class_tb_selected = lecture_info.class_tb
                    class_lecture_id_select = lecture_info.lecture_tb_id
                if class_tb_comp is not None:
                    if str(class_tb_comp.class_id) != str(lecture_info.class_tb_id):
                        class_tb_comp = lecture_info.class_tb
                        if lecture_info.lecture_tb.lecture_avail_count > 0:
                            lecture_id_select = lecture_info.lecture_tb_id
                        class_counter += 1
                else:
                    class_tb_comp = lecture_info.class_tb
                    if lecture_info.lecture_tb.lecture_avail_count > 0:
                        lecture_id_select = lecture_info.lecture_tb_id
                    class_counter += 1

            if class_counter > 1 or lecture_np_counter > 0:
                # self.url = '/trainee/lecture_select/'
                request.session['trainer_id'] = class_tb_selected.member_id
                request.session['class_id'] = class_tb_selected.class_id
                request.session['lecture_id'] = class_lecture_id_select
                request.session['class_hour'] = class_tb_selected.class_hour
                request.session['class_type_code'] = class_tb_selected.subject_cd
                request.session['program_title'] = class_tb_selected.get_class_type_cd_name()
                request.session['class_center_name'] = class_tb_selected.get_center_name()
                self.url = '/trainee/trainee_main/'
            else:
                # self.url = '/trainee/cal_month/'
                self.url = '/trainee/trainee_main/'
                request.session['trainer_id'] = class_tb_comp.member_id
                request.session['class_id'] = class_tb_comp.class_id
                request.session['lecture_id'] = lecture_id_select
                request.session['class_hour'] = class_tb_comp.class_hour
                request.session['class_type_code'] = class_tb_comp.subject_cd
                request.session['program_title'] = class_tb_comp.get_class_type_cd_name()
                request.session['class_center_name'] = class_tb_comp.get_center_name()

        return super(IndexView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(IndexView, self).get_redirect_url(*args, **kwargs)


class TraineeDesignTemplateView(TemplateView):
    template_name = 'trainee_design_template.html'

    def get_context_data(self, **kwargs):
        context = super(TraineeDesignTemplateView, self).get_context_data(**kwargs)
        return context


class TraineeMainView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainee_main.html'

    def get_context_data(self, **kwargs):
        context = super(TraineeMainView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        context['error'] = None
        context = func_get_class_list_only_view(context, self.request.user.id)
        if class_id is not None and class_id != '':
            context = func_get_trainee_next_schedule_by_class_id(context, class_id, self.request.user.id)
            context = func_get_trainee_ing_group_list(context, class_id, self.request.user.id)
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                class_info = None

            if class_info is not None:
                context = func_get_trainer_setting_list(context, class_info.member_id, class_id)
                cancel_prohibition_time = context['lt_res_cancel_time']
                # 근접 취소 시간 확인
                cancel_disable_time = timezone.now() + datetime.timedelta(minutes=cancel_prohibition_time)
                context['cancel_disable_time'] = cancel_disable_time

        return context


class CalMonthBlankView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'cal_month_trainee_blank.html'

    def get(self, request):
        # context = super(CalMonthBlankView, self).get_context_data(**kwargs)
        context = {}
        # context = get_trainee_setting_data(context, request.user.id)
        holiday = HolidayTb.objects.filter(use=USE)
        # request.session['setting_language'] = context['lt_lan_01']
        context['holiday'] = holiday
        return render(request, self.template_name, context)


class MyPageBlankView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'mypage_trainee_blank.html'

    def get(self, request):
        # context = super(MyPageBlankView, self).get_context_data(**kwargs)
        context = {}
        member_info = None
        error = None
        sns_id = request.session.get('social_login_id', '')
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
        context['check_password_changed'] = 1
        if sns_id != '' and sns_id is not None:
            sns_password_change_check = SnsInfoTb.objects.filter(member_id=request.user.id, sns_id=sns_id,
                                                                 change_password_check=1, use=USE).count()
            if sns_password_change_check == 0:
                context['check_password_changed'] = 0
        return render(request, self.template_name, context)


class TraineeCalendarView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainee_calendar.html'

    def get_context_data(self, **kwargs):
        context = super(TraineeCalendarView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')

        # date = self.request.GET.get('date', '')
        # day = self.request.GET.get('day', '')
        # today = datetime.date.today()
        # if date != '':
        #     today = datetime.datetime.strptime(date, '%Y-%m-%d')
        # if day == '':
        #     day = 46
        # start_date = today - datetime.timedelta(days=int(day))
        # end_date = today + datetime.timedelta(days=int(day))

        # context = func_get_class_lecture_count(context, class_id, self.request.user.id)

        context = func_get_holiday_schedule(context)

        return context


class MyPageView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'trainee_mypage.html'

    def get(self, request):
        # context = super(MyPageView, self).get_context_data(**kwargs)
        context = {}
        error = None
        class_id = request.session.get('class_id', '')
        sns_id = request.session.get('social_login_id', '')
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
            if member_info.phone is None or member_info.phone == '':
                member_info.phone = ''
            else:
                member_info.phone = member_info.phone[0:3] + '-' + \
                                    member_info.phone[3:7] + '-' + \
                                    member_info.phone[7:11]
            if member_info.birthday_dt is None:
                member_info.birthday_dt = ''
            context['member_info'] = member_info

        if error is None:
            context = func_get_trainee_package_list(context, class_id, request.user.id)

        context['check_password_changed'] = 1
        if sns_id != '' and sns_id is not None:
            sns_password_change_check = SnsInfoTb.objects.filter(member_id=request.user.id, sns_id=sns_id,
                                                                 change_password_check=1, use=USE).count()
            if sns_password_change_check == 0:
                context['check_password_changed'] = 0
        return render(request, self.template_name, context)


class ProgramSelectView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainee_program.html'

    def get_context_data(self, **kwargs):
        context = super(ProgramSelectView, self).get_context_data(**kwargs)
        context['error'] = None
        context = func_get_class_list(context, self.request.user.id)

        if context['error'] is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '['
                         + str(self.request.user.id) + ']' + context['error'])
            messages.error(self.request, context['error'])

        return context


# class DeleteTraineeAccountView(LoginRequiredMixin, AccessTestMixin, TemplateView):
#     template_name = 'delete_trainee_account_form.html'
#
#     def get_context_data(self, **kwargs):
#         context = super(DeleteTraineeAccountView, self).get_context_data(**kwargs)
#
#         return context


# pt 일정 추가
def add_trainee_schedule_logic(request):
    class_id = request.session.get('class_id', '')
    group_schedule_id = request.POST.get('group_schedule_id', None)
    training_date = request.POST.get('training_date', '')
    # time_duration = request.POST.get('time_duration', '')
    training_time = request.POST.get('training_time', '')
    next_page = request.POST.get('next_page', '/trainee/get_trainee_error_info/')
    class_type_name = request.session.get('class_type_name', '')
    error = None
    class_info = None
    start_date = None
    end_date = None
    select_date = None
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
        error = func_check_select_date_reserve_setting(class_id, class_info.member_id, training_date)

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
                if schedule_info.state_cd == 'PE':
                    error = '이미 완료된 일정입니다.'
                elif schedule_info.state_cd == 'PC':
                    error = '이미 결석 처리된 일정입니다.'

    if error is None:
        error = func_check_select_time_reserve_setting(class_id, class_info.member_id,
                                                       start_date, end_date, ADD_SCHEDULE)

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
                if group_schedule_info.state_cd == 'PE':
                    error = '이미 완료된 일정입니다.'
                elif group_schedule_info.state_cd == 'PC':
                    error = '이미 결석 처리된 일정입니다.'
                if error is None:
                    group_schedule_num = ScheduleTb.objects.filter(group_schedule_id=group_schedule_id,
                                                                   use=USE).count()
                    if group_schedule_num >= group_schedule_info.group_tb.member_num:
                        error = '정원을 초과했습니다.'

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
        else:
            try:
                test_member_lecture = MemberLectureTb.objects.get(lecture_tb_id=lecture_id, use=USE)
            except ObjectDoesNotExist:
                test_member_lecture = None

            if test_member_lecture is not None:
                if test_member_lecture.auth_cd == 'WAIT':
                    error = ' 알림 -> 프로그램 연결 허용 선택후 이용 가능합니다.'
                elif test_member_lecture.auth_cd == 'DELETE':
                    error = '강사님에게 프로그램 연결을 요청하세요.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

        if error is None:
            if start_date.date() > lecture_info.end_date:
                error = '수강 종료일 이후의 일정은 등록이 불가능합니다.'

    if error is None:
        schedule_result = pt_add_logic_func(training_date, start_date, end_date, request.user.id, lecture_id, class_id,
                                            request, group_schedule_id)
        error = schedule_result['error']
        context['schedule_id'] = schedule_result['schedule_id']
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

        if lt_pus_from_trainee_lesson_alarm == FROM_TRAINEE_LESSON_ALARM_ON:
            push_info_schedule_start_date = str(start_date).split(':')
            push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')

            if group_schedule_id == '' or group_schedule_id is None:

                push_class_id.append(class_id)
                push_title.append(class_type_name + ' 수업 - 일정 알림')
                push_message.append(request.user.first_name + '님이 '
                                    + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                    + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                    + ' [1:1 레슨] 수업을 예약했습니다')
            else:

                push_class_id.append(class_id)
                push_title.append(class_type_name + ' 수업 - 일정 알림')
                push_message.append(request.user.first_name + '님이 '
                                    + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                    + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                    + schedule_info.get_group_name() + ' 수업을 예약했습니다')

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
    class_type_name = request.session.get('class_type_name', '')
    next_page = request.POST.get('next_page', '/trainee/get_trainee_error_info/')
    error = None
    lecture_info = None
    class_info = None
    schedule_info = None
    start_date = None
    end_date = None
    push_class_id = []
    push_title = []
    push_message = []
    group_name = '1:1 레슨'
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
            error = '이미 지난 일정입니다.'

    if error is None:
        if schedule_info.state_cd == 'PE':
            error = '참석 완료된 일정입니다.'
        elif schedule_info.state_cd == 'PC':
            error = '결석 처리된 일정입니다.'

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
        error = func_check_select_date_reserve_setting(class_id, class_info.member_id, str(start_date).split(' ')[0])

    if error is None:
        error = func_check_select_time_reserve_setting(class_id, class_info.member_id,
                                                       start_date, end_date, DEL_SCHEDULE)

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
                    error = func_refresh_lecture_count(class_id, lecture_id)

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
        if group_name == '':
            group_name = '1:1 레슨'
        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_info.class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info=group_name + ' 수업',
                         log_how='예약 취소', log_detail=str(start_date) + '/' + str(end_date), use=USE)
        log_data.save()

        try:
            setting_data = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id,
                                                 setting_type_cd='LT_PUS_FROM_TRAINEE_LESSON_ALARM')
            lt_pus_from_trainee_lesson_alarm = int(setting_data.setting_info)
        except ObjectDoesNotExist:
            lt_pus_from_trainee_lesson_alarm = FROM_TRAINEE_LESSON_ALARM_ON

        if lt_pus_from_trainee_lesson_alarm == FROM_TRAINEE_LESSON_ALARM_ON:
            push_info_schedule_start_date = str(start_date).split(':')
            push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')

            push_class_id.append(class_id)
            push_title.append(class_type_name + ' - 수업 알림')
            push_message.append(request.user.first_name + '님이 '
                                + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                + group_name+' 수업을 예약 취소했습니다.')

            context['push_class_id'] = push_class_id
            context['push_title'] = push_title
            context['push_message'] = push_message
        else:
            context['push_class_id'] = ''
            context['push_title'] = ''
            context['push_message'] = ''

        return redirect(next_page)
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
        trainer_id = self.request.session.get('trainer_id', '')
        today = datetime.date.today()
        error = None
        if date != '':
            today = datetime.datetime.strptime(date, '%Y-%m-%d')
        if day == '':
            day = 46
        start_date = today - datetime.timedelta(days=int(day))
        end_date = today + datetime.timedelta(days=int(day))

        if trainer_id == '' or trainer_id is None:
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
                trainer_id = class_info.member_id
                self.request.session['trainer_id'] = trainer_id
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'

        context['error'] = error
        # context = func_get_holiday_schedule(context, start_date, end_date)
        context = func_get_trainee_on_schedule(context, class_id, self.request.user.id, start_date, end_date)
        context = func_get_trainee_off_schedule(context, class_id, start_date, end_date)
        # 그룹 스케쥴과 예약 가능 횟수 동시에 들고 와야할듯
        context = func_get_trainee_group_schedule(context, self.request.user.id, class_id, start_date, end_date)
        context = func_get_class_lecture_count(context, class_id, self.request.user.id)

        for group_schedule_info in context['group_schedule_data']:
            group_lecture_avail_count = 0
            query_member_auth_cd = "select `AUTH_CD` from MEMBER_LECTURE_TB as B" \
                                   " where B.USE=1" \
                                   " and B.LECTURE_TB_ID = `GROUP_LECTURE_TB`.`LECTURE_TB_ID`"
            group_lecture_data = GroupLectureTb.objects.select_related('lecture_tb__member').filter(
                group_tb_id=group_schedule_info.group_tb_id,
                lecture_tb__member_id=self.request.user.id,
                lecture_tb__use=USE).annotate(member_auth_cd=RawSQL(query_member_auth_cd,
                                                                    [])).filter(member_auth_cd='VIEW')

            for group_lecture_info in group_lecture_data:
                group_lecture_avail_count += group_lecture_info.lecture_tb.lecture_avail_count
            group_schedule_info.group_lecture_avail_count = group_lecture_avail_count

        if trainer_id != '' and trainer_id is not None:
            context = func_get_trainer_setting_list(context, trainer_id, class_id)

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


def program_select_logic(request):

    class_id = request.POST.get('class_id', '')
    class_id_session = request.session.get('class_id', '')
    # lecture_id = request.POST.get('lecture_id', '')
    lecture_connection_check = request.POST.get('lecture_connection_check', PROGRAM_SELECT)
    next_page = request.POST.get('next_page', '/trainee/trainee_main/')
    error = None
    # if lecture_connection_check == PROGRAM_LECTURE_CONNECT_DELETE:
    #     if lecture_id == '':
    #         error = '수강정보를 불러오지 못했습니다.'
    # else:
    lecture_connection_check = int(lecture_connection_check)
    if class_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        if lecture_connection_check == PROGRAM_LECTURE_CONNECT_DELETE:
            # 선택한 프로그램의 연결 대기중인 수강권 전부 삭제
            query_auth_type_cd = "select B.AUTH_CD from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID =" \
                                 " `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.MEMBER_ID = " + str(request.user.id) \
                                 + " and B.USE=1"

            lecture_data = ClassLectureTb.objects.select_related('class_tb', 'lecture_tb__member').filter(
                class_tb_id=class_id, lecture_tb__member_id=request.user.id,
                use=USE).annotate(member_auth_cd=RawSQL(query_auth_type_cd,
                                                        [])).filter(member_auth_cd='WAIT'
                                                                    ).order_by('-lecture_tb__start_date')
            for lecture_info in lecture_data:
                try:
                    member_lecture = MemberLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_tb_id,
                                                                 member_id=request.user.id)
                    member_lecture.auth_cd = 'DELETE'
                    member_lecture.save()
                except ObjectDoesNotExist:
                    error = None

            class_info = None
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'

            log_data = LogTb(log_type='LP02', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             class_tb_id=class_id_session,
                             log_info=class_info.member.name + ' 강사님의 \''
                                      + class_info.get_class_type_cd_name()+'\' 프로그램',
                             log_how='연결 취소',
                             log_detail='', use=USE)
            log_data.save()
            log_data = LogTb(log_type='LP02', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             class_tb_id=class_info.class_id,
                             log_info=class_info.member.name + ' 강사님의 \''
                                      + class_info.get_class_type_cd_name()+'\' 프로그램',
                             log_how='연결 취소',
                             log_detail='', use=USE)
            log_data.save()

        elif lecture_connection_check == PROGRAM_LECTURE_CONNECT_ACCEPT:
            # 선택한 프로그램의 연결 대기중인 수강권 전부 연결
            query_auth_type_cd = "select B.AUTH_CD from MEMBER_LECTURE_TB as B where B.LECTURE_TB_ID =" \
                                 " `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and B.MEMBER_ID = " + str(request.user.id) \
                                 + " and B.USE=1"

            lecture_data = ClassLectureTb.objects.select_related('class_tb', 'lecture_tb__member').filter(
                class_tb_id=class_id, lecture_tb__member_id=request.user.id,
                use=USE).annotate(member_auth_cd=RawSQL(query_auth_type_cd,
                                                        [])).filter(member_auth_cd='WAIT'
                                                                    ).order_by('-lecture_tb__start_date')
            for lecture_info in lecture_data:
                try:
                    member_lecture = MemberLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_tb_id,
                                                                 member_id=request.user.id)
                    member_lecture.auth_cd = 'VIEW'
                    member_lecture.save()
                except ObjectDoesNotExist:
                    error = None

            class_info = None
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'

            log_data = LogTb(log_type='LP01', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             class_tb_id=class_id_session,
                             log_info=class_info.member.name + ' 강사님의 \''
                                      + class_info.get_class_type_cd_name()+'\' 프로그램',
                             log_how='연결 완료',
                             log_detail='', use=USE)
            log_data.save()
            log_data = LogTb(log_type='LP01', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             class_tb_id=class_info.class_id,
                             log_info=class_info.member.name + ' 강사님의 \''
                                      + class_info.get_class_type_cd_name()+'\' 프로그램',
                             log_how='연결 완료',
                             log_detail='', use=USE)
            log_data.save()
            next_page = '/trainee/trainee_main/'

        if lecture_connection_check != PROGRAM_LECTURE_CONNECT_DELETE:
            # 선택한 프로그램 연결
            class_info = None
            request.session['class_id'] = class_id
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'

            if error is None:
                request.session['trainer_id'] = class_info.member_id
                request.session['class_hour'] = class_info.class_hour
                request.session['program_title'] = class_info.get_class_type_cd_name()
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
            # if class_id != '' and class_id is not None:
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
                # context = get_trainer_setting_data(context, class_info.member_id, class_id)

            # 회원 setting 값 로드
            # context = get_trainee_setting_data(context, request.user.id)
            # request.session['setting_language'] = context['lt_lan_01']

        if error is None:
            if member_info is not None:
                if member_info.phone is None:
                    member_info.phone = ''
                if member_info.birthday_dt is None:
                    member_info.birthday_dt = ''
            context['member_info'] = member_info

        return render(request, self.template_name, context)


def update_trainee_info_logic(request):
    first_name = request.POST.get('first_name', '')
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
                user.save()
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
        # log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
        #                  from_member_name=request.user.first_name,
        #                  log_info='회원 정보', log_how='수정', use=USE)
        # log_data.save()

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


class AlarmView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    # context_object_name = "log_data"
    template_name = "trainee_alarm.html"
    # page_template = 'trainee_alarm_page.html'

    def get_context_data(self, **kwargs):
        context = super(AlarmView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        # lecture_id = self.request.session.get('lecture_id', '')
        error = None
        log_data = None

        context = func_get_class_list(context, self.request.user.id)

        # if lecture_id is None or lecture_id == '':
        #     error = '수강정보를 불러오지 못했습니다.'

        if error is None:
            today = datetime.date.today()
            three_days_ago = today - datetime.timedelta(days=7)
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=USE).order_by('-reg_dt')

            query_member_auth_cd \
                = "select `AUTH_CD` from MEMBER_LECTURE_TB as D" \
                  " where D.LECTURE_TB_ID = `LOG_TB`.`LECTURE_TB_ID` and D.MEMBER_ID = " + str(self.request.user.id)

            log_data = LogTb.objects.filter(
                class_tb_id=class_id, reg_dt__gte=three_days_ago,
                use=USE).annotate(member_auth_cd=RawSQL(query_member_auth_cd, [])
                                  ).filter(Q(member_auth_cd='VIEW')
                                           | Q(auth_member_id=self.request.user.id)).order_by('-reg_dt')

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
                    log_detail_split = str(log_info.log_detail).split('/')
                    before_day = log_detail_split[0]
                    after_day = log_detail_split[1]

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

            context['log_data'] = log_data

        return context


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
    note = ''
    schedule_result = None
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
                note = group_schedule_info.note
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
                                                    start_date, end_date, note, ON_SCHEDULE_TYPE, request.user.id,
                                                    permission_state_cd,
                                                    'NP')
                error = schedule_result['error']

                if error is None:
                    error = func_refresh_lecture_count(class_id, lecture_id)

                if error is None:
                    if group_schedule_info is not None and group_schedule_info != '':
                        error = func_check_group_available_member_after(class_id, group_id, group_schedule_id)
                    else:
                        error = func_date_check(class_id, schedule_result['schedule_id'],
                                                pt_schedule_date, start_date, end_date, SCHEDULE_DUPLICATION_DISABLE)

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
                             log_info=group_schedule_info.get_group_name() + ' 수업', log_how='예약 완료',
                             log_detail=str(start_date) + '/' + str(end_date),  use=USE)
            log_data.save()
        else:
            log_data = LogTb(log_type='LS01', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name+request.user.first_name,
                             class_tb_id=class_id, lecture_tb_id=lecture_id,
                             log_info='1:1 레슨 수업', log_how='예약 완료',
                             log_detail=str(start_date) + '/' + str(end_date),
                             use=USE)
            log_data.save()

    return schedule_result


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
    lecture_finish_count = 0
    lecture_absence_count = 0

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
        ).filter(Q(state_cd='PE'), class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE
                 ).annotate(member_auth_cd=RawSQL(query_member_auth_cd, [])
                            ).filter(member_auth_cd='VIEW').order_by('lecture_tb__start_date', 'start_dt').count()

        lecture_absence_count = ScheduleTb.objects.select_related(
            'lecture_tb__member', 'group_tb'
        ).filter(Q(state_cd='PC'), class_tb_id=class_id, en_dis_type=ON_SCHEDULE_TYPE
                 ).annotate(member_auth_cd=RawSQL(query_member_auth_cd, [])
                            ).filter(member_auth_cd='VIEW').order_by('lecture_tb__start_date', 'start_dt').count()

    if error is not None:
        context['error'] = error

    context['next_schedule_start_dt'] = str(next_schedule_start_dt)
    context['next_schedule_end_dt'] = str(next_schedule_end_dt)
    context['lecture_info'] = lecture_list
    context['lecture_reg_count'] = lecture_reg_count_sum
    context['lecture_finish_count'] = lecture_finish_count
    context['lecture_absence_count'] = lecture_absence_count
    context['lecture_rem_count'] = lecture_rem_count_sum
    context['lecture_avail_count'] = lecture_avail_count_sum
    context['pt_start_date'] = str(pt_start_date)
    context['pt_end_date'] = str(pt_end_date)

    return context


class PopupCalendarPlanView(TemplateView):
    template_name = 'popup/trainee_popup_calendar_plan_view.html'

    def get_context_data(self, **kwargs):
        context = super(PopupCalendarPlanView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        select_date = self.request.GET.get('select_date')

        context['error'] = None
        context['select_date'] = select_date

        context['date_format'] = datetime.datetime.strptime(select_date, '%Y-%m-%d')

        if class_id is not None and class_id != '':
            context = func_get_trainee_select_schedule(context, class_id, self.request.user.id, select_date)
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                class_info = None

            if class_info is not None:
                context = func_get_trainer_setting_list(context, class_info.member_id, class_id)
                cancel_prohibition_time = context['lt_res_cancel_time']
                # 근접 예약 시간 확인
                cancel_disable_time = timezone.now() + datetime.timedelta(minutes=cancel_prohibition_time)
                context['cancel_disable_time'] = cancel_disable_time
                context['avail_end_date'] = datetime.datetime.strptime(str(context['avail_date_data'].pop()),
                                                                       '%Y-%m-%d')
        # if len(context['schedule_data']) == 0:
        #     return redirect('/trainee/popup_calendar_plan_reserve/')
        return context


class PopupCalendarPlanReserveView(TemplateView):
    template_name = 'popup/trainee_popup_calendar_plan_reserve.html'

    def get_context_data(self, **kwargs):
        context = super(PopupCalendarPlanReserveView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        select_date = self.request.GET.get('select_date')
        trainer_id = self.request.session.get('trainer_id', '')
        # 개인 수업 예약 가능 횟수 호출
        # 회원과 연결되어있는 수강권중에서 개인 수업이 포함되어 있는 경우 count

        # 선택한날에 오픈되어 있는 그룹수업의 예약 가능 횟수 호출
        # 회원과 연결되어있는 수강권중에서 해당 그룹 수업이 포함되어 있는 경우 count
        # context = func_get_trainee_group_schedule(context, self.request.user.id, class_id, select_date, select_date)
        context = func_get_class_lecture_count(context, class_id, self.request.user.id)

        context['error'] = None
        context['select_date'] = datetime.datetime.strptime(select_date, '%Y-%m-%d')
        start_date = datetime.datetime.strptime(select_date + ' 00:00', '%Y-%m-%d %H:%M')
        end_date = datetime.datetime.strptime(select_date + ' 23:59', '%Y-%m-%d %H:%M')
        # context = func_get_holiday_schedule(context, start_date, end_date)
        # context = func_get_trainee_on_schedule(context, class_id, self.request.user.id, start_date, end_date)
        # context = func_get_trainee_off_schedule(context, class_id, start_date, end_date)
        # 그룹 스케쥴과 예약 가능 횟수 동시에 들고 와야할듯
        context = func_get_trainee_group_schedule(context, self.request.user.id, class_id, start_date, end_date)
        # context = func_get_class_lecture_count(context, class_id, self.request.user.id)
        group_data = []
        group_id_list = []
        for group_schedule_info in context['group_schedule_data']:
            group_lecture_avail_count = 0
            query_member_auth_cd = "select `AUTH_CD` from MEMBER_LECTURE_TB as B" \
                                   " where B.USE=1" \
                                   " and B.LECTURE_TB_ID = `GROUP_LECTURE_TB`.`LECTURE_TB_ID`"
            group_lecture_data = GroupLectureTb.objects.select_related('lecture_tb__member').filter(
                group_tb_id=group_schedule_info.group_tb_id,
                lecture_tb__member_id=self.request.user.id,
                lecture_tb__use=USE).annotate(member_auth_cd=RawSQL(query_member_auth_cd,
                                                                    [])).filter(member_auth_cd='VIEW')

            for group_lecture_info in group_lecture_data:
                group_lecture_avail_count += group_lecture_info.lecture_tb.lecture_avail_count
            group_schedule_info.group_lecture_avail_count = group_lecture_avail_count

            if group_id_list.count(group_schedule_info.group_tb.group_id) == 0:
                group_id_list.append(group_schedule_info.group_tb.group_id)
                group_info = {'group_id': group_schedule_info.group_tb.group_id,
                              'group_name': group_schedule_info.group_tb.name,
                              'group_lecture_avail_count': group_lecture_avail_count}
                group_data.append(group_info)
        context['group_data'] = group_data
        # if trainer_id != '' and trainer_id is not None:
        #     context = func_get_trainer_setting_list(context, trainer_id, class_id)
        return context


class PopupCalendarPlanReserveCompleteView(TemplateView):
    template_name = 'popup/trainee_popup_calendar_plan_reserve_complete.html'

    def get_context_data(self, **kwargs):
        context = super(PopupCalendarPlanReserveCompleteView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        schedule_id = self.request.GET.get('schedule_id')
        schedule_info = None

        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            class_info = None

        if schedule_id is not None and schedule_id != '':
            try:
                schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id, use=USE)
            except ObjectDoesNotExist:
                schedule_info = None

        if schedule_info is not None:
            try:
                group_type_name = CommonCdTb.objects.get(common_cd=schedule_info.group_tb.group_type_cd).common_cd_nm
                group_name = schedule_info.group_tb.name
            except ObjectDoesNotExist:
                group_type_name = '개인'
                group_name = '1:1 레슨'
            except AttributeError:
                group_type_name = '개인'
                group_name = '1:1 레슨'
            schedule_info.group_name = group_name
            schedule_info.group_type_name = group_type_name

            context = func_get_trainer_setting_list(context, class_info.member_id, class_id)
            cancel_prohibition_time = context['lt_res_cancel_time']
            # 근접 취소 시간 확인
            cancel_disable_time = timezone.now() + datetime.timedelta(minutes=cancel_prohibition_time)
            context['cancel_disable_time'] = cancel_disable_time

        context['schedule_info'] = schedule_info
        return context


class PopupGroupTicketInfoView(TemplateView):
    template_name = 'popup/trainee_popup_group_ticket_info.html'

    def get_context_data(self, **kwargs):
        context = super(PopupGroupTicketInfoView, self).get_context_data(**kwargs)
        lecture_id = self.request.GET.get('lecture_id')
        group_id = self.request.GET.get('group_id')

        error = None
        lecture_info = None
        group_info = None
        schedule_list = None

        query_member_auth_cd \
            = "select `AUTH_CD` from MEMBER_LECTURE_TB as D" \
              " where D.LECTURE_TB_ID = `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and D.MEMBER_ID = " \
              + str(self.request.user.id)
        class_list = ClassLectureTb.objects.select_related(
            'class_tb__member').filter(lecture_tb_id=lecture_id,
                                       use=USE).annotate(member_auth_cd=RawSQL(query_member_auth_cd,
                                                                               [])).filter(member_auth_cd='VIEW')

        for class_info in class_list:
            if class_info.class_tb.member.phone is not None and class_info.class_tb.member.phone != '':
                class_info.class_tb.member.phone = class_info.class_tb.member.phone[0:3] + '-' + \
                                                   class_info.class_tb.member.phone[3:7] + '-' +\
                                                   class_info.class_tb.member.phone[7:11]

        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강권 정보를 불러오지 못했습니다.'

        try:
            group_info = GroupTb.objects.get(group_id=group_id)
        except ObjectDoesNotExist:
            error = '수업 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                lecture_info.package_tb.package_type_cd_nm \
                    = CommonCdTb.objects.get(common_cd=lecture_info.package_tb.package_type_cd).common_cd_nm
                if lecture_info.package_tb.package_type_cd_nm == '1:1':
                    lecture_info.package_tb.package_type_cd_nm = '개인'
            except ObjectDoesNotExist:
                lecture_info.package_tb.package_type_cd_nm = ''

            lecture_abs_count = ScheduleTb.objects.filter(lecture_tb_id=lecture_id, state_cd='PC').count()
            lecture_info.lecture_abs_count = lecture_abs_count
        if error is None:
            query_status = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `SCHEDULE_TB`.`STATE_CD`"
            if group_info.group_type_cd != 'ONE_TO_ONE':
                schedule_list = ScheduleTb.objects.filter(lecture_tb_id=lecture_id,
                                                          group_tb_id=group_id,
                                                          use=USE).annotate(status=RawSQL(query_status,
                                                                                          [])).order_by('-start_dt',
                                                                                                        '-end_dt')
            else:
                schedule_list = ScheduleTb.objects.filter(lecture_tb_id=lecture_id,
                                                          group_tb__isnull=True,
                                                          use=USE).annotate(status=RawSQL(query_status,
                                                                                          [])).order_by('-start_dt',
                                                                                                        '-end_dt')

        context['class_data'] = class_list
        context['lecture_info'] = lecture_info
        context['group_info'] = group_info
        context['schedule_data'] = schedule_list

        return context


class PopupTicketInfoView(TemplateView):
    template_name = 'popup/trainee_popup_ticket_info.html'

    def get_context_data(self, **kwargs):
        context = super(PopupTicketInfoView, self).get_context_data(**kwargs)
        package_id = self.request.GET.get('package_id')
        error = None
        package_info = None

        query_member_auth_cd \
            = "select `AUTH_CD` from MEMBER_LECTURE_TB as D" \
              " where D.LECTURE_TB_ID = `CLASS_LECTURE_TB`.`LECTURE_TB_ID` and D.MEMBER_ID = " \
              + str(self.request.user.id)
        lecture_list = ClassLectureTb.objects.select_related(
            'class_tb__member',
            'lecture_tb__package_tb').filter(lecture_tb__package_tb__package_id=package_id,
                                             use=USE).annotate(member_auth_cd=RawSQL(query_member_auth_cd,
                                                                                     [])).filter(member_auth_cd='VIEW')

        for lecture_info in lecture_list:
            if lecture_info.class_tb.member.phone is not None and lecture_info.class_tb.member.phone != '':
                lecture_info.class_tb.member.phone = lecture_info.class_tb.member.phone[0:3] + '-' + \
                                                     lecture_info.class_tb.member.phone[3:7] + '-' + \
                                                     lecture_info.class_tb.member.phone[7:11]
            try:
                lecture_info.status \
                    = CommonCdTb.objects.get(common_cd=lecture_info.lecture_tb.state_cd).common_cd_nm
            except ObjectDoesNotExist:
                lecture_info.status = ''

        if error is None:
            try:
                package_info = PackageTb.objects.get(package_id=package_id)
            except ObjectDoesNotExist:
                error = '수강권 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                package_info.package_type_cd_nm \
                    = CommonCdTb.objects.get(common_cd=package_info.package_type_cd).common_cd_nm
                if package_info.package_type_cd_nm == '1:1':
                    package_info.package_type_cd_nm = '개인'
            except ObjectDoesNotExist:
                package_info.package_type_cd_nm = ''

        if error is None:
            query_group_type = "select COMMON_CD_NM from COMMON_CD_TB as B " \
                               "where B.COMMON_CD = `GROUP_TB`.`group_type_cd`"
            package_info.package_group_data = PackageGroupTb.objects.select_related(
                'group_tb').filter(package_tb_id=package_id,
                                   group_tb__use=USE,
                                   use=USE).annotate(group_type_cd_nm=RawSQL(query_group_type,
                                                                             [])).order_by('-group_tb__group_type_cd',
                                                                                           'group_tb__reg_dt')

        context['package_info'] = package_info
        context['lecture_data'] = lecture_list
        return context


class PopupMyInfoChangeView(TemplateView):
    template_name = 'popup/trainee_popup_my_info_change.html'

    def get_context_data(self, **kwargs):
        context = super(PopupMyInfoChangeView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        # sns_id = self.request.session.get('social_login_id', '')
        member_info = None
        class_info = None
        error = None
        # today = datetime.date.today()
        if class_id != '' and class_id is not None:
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '수강 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                member_info = MemberTb.objects.get(member_id=self.request.user.id)
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
            if member_info.phone is None or member_info.phone == '':
                member_info.phone = ''
            else:
                member_info.phone = member_info.phone[0:3] + '-' + \
                                    member_info.phone[3:7] + '-' + \
                                    member_info.phone[7:11]
            if member_info.birthday_dt is None:
                member_info.birthday_dt = ''
            context['member_info'] = member_info
        return context


class UserPolicyView(TemplateView):
    template_name = 'trainee_user_policy.html'

    def get_context_data(self, **kwargs):
        context = super(UserPolicyView, self).get_context_data(**kwargs)
        return context


class PrivacyPolicyView(TemplateView):
    template_name = 'trainee_privacy_policy.html'

    def get_context_data(self, **kwargs):
        context = super(PrivacyPolicyView, self).get_context_data(**kwargs)
        return context


class TraineeInquiryView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainee_inquiry.html'

    def get_context_data(self, **kwargs):
        context = super(TraineeInquiryView, self).get_context_data(**kwargs)
        qa_type_list = CommonCdTb.objects.filter(upper_common_cd='16', use=1).order_by('order')
        context['qa_type_data'] = qa_type_list
        return context


# skkim Test페이지, 테스트 완료후 지울것 190316
class TestPageView(TemplateView):
    template_name = 'test_page.html'

    def get_context_data(self, **kwargs):
        context = super(TestPageView, self).get_context_data(**kwargs)
        return context
