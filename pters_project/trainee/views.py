import datetime
import logging

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import InternalError, IntegrityError, transaction
from django.db.models import Q
from django.db.models.expressions import RawSQL
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views import View
from django.views.generic import TemplateView, RedirectView

from board.models import QATb, QACommentTb
from configs import settings
from configs.views import AccessTestMixin, func_setting_data_update
from configs.const import ON_SCHEDULE_TYPE, ADD_SCHEDULE, DEL_SCHEDULE, USE, UN_USE, FROM_TRAINEE_LESSON_ALARM_ON, \
    SCHEDULE_DUPLICATION_DISABLE, PROGRAM_SELECT, PROGRAM_LECTURE_CONNECT_DELETE, PROGRAM_LECTURE_CONNECT_ACCEPT, \
    SCHEDULE_DUPLICATION_ENABLE, LECTURE_TYPE_ONE_TO_ONE, STATE_CD_IN_PROGRESS, STATE_CD_FINISH, STATE_CD_ABSENCE, \
    STATE_CD_NOT_PROGRESS, PERMISSION_STATE_CD_APPROVE, AUTH_TYPE_VIEW, AUTH_TYPE_WAIT, AUTH_TYPE_DELETE, \
    PERMISSION_STATE_CD_WAIT, TO_TRAINEE_LESSON_ALARM_ON, TO_SHARED_TRAINER_LESSON_ALARM_ON, TO_TRAINEE_LESSON_ALARM_OFF, \
    TO_SHARED_TRAINER_LESSON_ALARM_OFF, TO_END_TRAINEE, TO_ING_TRAINEE, TO_ALL_TRAINEE
from login.models import MemberTb, LogTb, CommonCdTb, SnsInfoTb
from schedule.functions import func_get_member_ticket_id, func_add_schedule, func_refresh_member_ticket_count, \
    func_get_lecture_member_ticket_id_from_trainee, func_send_push_trainee, func_get_holiday_schedule, \
    func_send_push_trainer_trainer, func_send_push_trainer, func_get_member_ticket_one_to_one_lecture_info
from schedule.models import ScheduleTb, DeleteScheduleTb, DailyRecordTb
from trainer.functions import func_get_trainer_setting_list
from trainer.models import ClassMemberTicketTb,  ClassTb, SettingTb, LectureTb, TicketLectureTb,\
    TicketTb, ProgramNoticeTb
from .functions import func_get_class_member_ticket_count, func_get_member_ticket_list, func_get_class_list, \
    func_get_trainee_on_schedule, func_get_trainee_off_schedule, func_get_trainee_lecture_schedule, \
    func_get_trainee_on_repeat_schedule, func_check_select_time_reserve_setting, \
    func_get_member_ticket_connection_list, func_get_trainee_next_schedule_by_class_id,\
    func_get_trainee_select_schedule, func_get_trainee_ing_member_ticket_list, func_check_select_date_reserve_setting, \
    func_get_trainee_ticket_list, func_get_class_list_only_view
from .models import MemberTicketTb, ProgramNoticeHistoryTb

logger = logging.getLogger(__name__)


# class TraineeBasicDataMixin(object):
#     def test2(self):
#         print("second mixin!!!")


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
        class_member_ticket_data = ClassMemberTicketTb.objects.select_related(
            'class_tb',
            'member_ticket_tb__member').filter(
            auth_cd=AUTH_TYPE_VIEW,
            member_ticket_tb__use=USE,
            member_ticket_tb__member_id=request.user.id,
            use=USE).exclude(
            member_ticket_tb__member_auth_cd=AUTH_TYPE_DELETE).order_by('-member_ticket_tb__start_date')

        if class_id is None or class_id == '':
            if class_member_ticket_data is None or len(class_member_ticket_data) == 0:
                # self.url = '/trainee/cal_month_blank/'
                self.url = '/trainee/trainee_main/'

            elif len(class_member_ticket_data) == 1:
                for class_member_ticket_info in class_member_ticket_data:
                    request.session['class_id'] = class_member_ticket_info.class_tb_id
                    request.session['member_ticket_id'] = class_member_ticket_info.member_ticket_tb_id
                    request.session['trainer_id'] = class_member_ticket_info.class_tb.member_id
                    request.session['trainer_name'] = class_member_ticket_info.class_tb.member.name
                    if class_member_ticket_info.member_ticket_tb.member_auth_cd == AUTH_TYPE_WAIT:
                        # self.url = '/trainee/member_ticket_select/'
                        self.url = '/trainee/trainee_main/'
                    elif class_member_ticket_info.member_ticket_tb.member_auth_cd == AUTH_TYPE_DELETE:
                        # self.url = '/trainee/cal_month_blank/'
                        self.url = '/trainee/trainee_main/'
                    else:
                        request.session['class_hour'] = class_member_ticket_info.class_tb.class_hour
                        request.session['class_type_code'] = class_member_ticket_info.class_tb.subject_cd
                        request.session['program_title'] = class_member_ticket_info.class_tb.get_class_type_cd_name()
                        request.session['class_center_name'] = class_member_ticket_info.class_tb.get_center_name()

            else:
                class_tb_comp = None
                class_counter = 0
                member_ticket_np_counter = 0
                member_ticket_id_select = ''
                class_tb_selected = None
                class_member_ticket_id_select = None
                for class_member_ticket_info in class_member_ticket_data:
                    if class_member_ticket_info.member_ticket_tb.member_auth_cd == AUTH_TYPE_WAIT:
                        member_ticket_np_counter += 1

                    if class_member_ticket_info.member_ticket_tb.member_auth_cd == AUTH_TYPE_VIEW \
                            and class_tb_selected is None:
                        class_tb_selected = class_member_ticket_info.class_tb
                        class_member_ticket_id_select = class_member_ticket_info.member_ticket_tb_id

                    if class_tb_comp is not None:
                        if str(class_tb_comp.class_id) != str(class_member_ticket_info.class_tb_id):
                            class_tb_comp = class_member_ticket_info.class_tb
                            if class_member_ticket_info.member_ticket_tb.member_ticket_avail_count > 0:
                                member_ticket_id_select = class_member_ticket_info.member_ticket_tb_id
                            class_counter += 1
                    else:
                        class_tb_comp = class_member_ticket_info.class_tb
                        if class_member_ticket_info.member_ticket_tb.member_ticket_avail_count > 0:
                            member_ticket_id_select = class_member_ticket_info.member_ticket_tb_id
                        class_counter += 1

                if class_counter > 1:
                    # self.url = '/trainee/member_ticket_select/'
                    if class_tb_selected is None:
                        class_tb_selected = class_tb_comp
                    request.session['trainer_id'] = class_tb_selected.member_id
                    request.session['trainer_name'] = class_tb_selected.member.name
                    request.session['class_id'] = class_tb_selected.class_id
                    request.session['member_ticket_id'] = class_member_ticket_id_select
                    request.session['class_hour'] = class_tb_selected.class_hour
                    request.session['class_type_code'] = class_tb_selected.subject_cd
                    request.session['program_title'] = class_tb_selected.get_class_type_cd_name()
                    request.session['class_center_name'] = class_tb_selected.get_center_name()
                    self.url = '/trainee/trainee_main/'
                else:
                    if member_ticket_np_counter == 0:
                        # self.url = '/trainee/cal_month/'
                        self.url = '/trainee/trainee_main/'
                        request.session['trainer_id'] = class_tb_comp.member_id
                        request.session['trainer_name'] = class_tb_comp.member.name
                        request.session['class_id'] = class_tb_comp.class_id
                        request.session['member_ticket_id'] = member_ticket_id_select
                        request.session['class_hour'] = class_tb_comp.class_hour
                        request.session['class_type_code'] = class_tb_comp.subject_cd
                        request.session['program_title'] = class_tb_comp.get_class_type_cd_name()
                        request.session['class_center_name'] = class_tb_comp.get_center_name()
        else:
            self.url = '/trainee/trainee_main/'
        request.session['APP_VERSION'] = settings.APP_VERSION

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
            context = func_get_trainee_ing_member_ticket_list(context, class_id, self.request.user.id)
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
                self.request.session['trainer_name'] = class_info.member.name
            except ObjectDoesNotExist:
                class_info = None

            if class_info is not None:
                func_setting_data_update(self.request, 'trainee')
                context = func_get_trainer_setting_list(context, class_id, class_info.member_id)
                cancel_prohibition_time = context['setting_member_reserve_cancel_time']
                # 근접 취소 시간 확인
                cancel_disable_time = timezone.now() + datetime.timedelta(minutes=cancel_prohibition_time)
                context['cancel_disable_time'] = cancel_disable_time
                check_alarm_program_notice_qa_comment(context, class_id, self.request.user.id)
        return context


class CalMonthView(LoginRequiredMixin, AccessTestMixin, RedirectView):
    url = '/trainee/trainee_main/'

    def get(self, request, **kwargs):
        return super(CalMonthView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(CalMonthView, self).get_redirect_url(*args, **kwargs)


class CalMonthBlankView(LoginRequiredMixin, AccessTestMixin, RedirectView):
    url = '/trainee/trainee_main/'

    def get(self, request, **kwargs):
        return super(CalMonthBlankView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(CalMonthBlankView, self).get_redirect_url(*args, **kwargs)


class MyPageBlankView(LoginRequiredMixin, AccessTestMixin, RedirectView):
    url = '/trainee/trainee_mypage/'

    def get(self, request, **kwargs):
        return super(MyPageBlankView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(MyPageBlankView, self).get_redirect_url(*args, **kwargs)


class TraineeCalendarView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainee_calendar.html'

    def get_context_data(self, **kwargs):
        context = super(TraineeCalendarView, self).get_context_data(**kwargs)
        # class_id = self.request.session.get('class_id', '')

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

        func_setting_data_update(self.request, 'trainee')
        # context = func_get_class_member_ticket_count(context, class_id, self.request.user.id)

        context['holiday'] = func_get_holiday_schedule(start_date, end_date)

        if class_id is not None and class_id != '':
            check_alarm_program_notice_qa_comment(context, class_id, self.request.user.id)
        return context


class TraineeProgramNoticeView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainee_program_notice.html'

    def get_context_data(self, **kwargs):
        context = super(TraineeProgramNoticeView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        if class_id is not None and class_id != '':
            query = "select count(B.ID) from PROGRAM_NOTICE_MEMBER_READ_HISTORY_TB as B " \
                    " where B.PROGRAM_NOTICE_TB_ID = `PROGRAM_NOTICE_TB`.`ID`" \
                    " and B.MEMBER_ID="+str(self.request.user.id)+" and B.USE=1"

            member_ticket_num = ClassMemberTicketTb.objects.select_related(
                'member_ticket_tb__member',
                'member_ticket_tb__ticket_tb'
            ).filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__member_id=self.request.user.id,
                     member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
                     member_ticket_tb__ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
                     member_ticket_tb__use=USE, member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW, use=USE
                     ).count()

            to_member_type_cd = Q(to_member_type_cd=TO_ALL_TRAINEE)
            if member_ticket_num == 0:
                to_member_type_cd |= Q(to_member_type_cd=TO_END_TRAINEE)
            else:
                to_member_type_cd |= Q(to_member_type_cd=TO_ING_TRAINEE)

            program_notice_data = ProgramNoticeTb.objects.filter(to_member_type_cd,
                                                                 class_tb_id=class_id,
                                                                 use=USE).annotate(read=RawSQL(query,
                                                                                               [])).order_by('-reg_dt')
            context['program_notice_data'] = program_notice_data

            check_alarm_program_notice_qa_comment(context, class_id, self.request.user.id)

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
            if member_info.profile_url is None or member_info.profile_url == '':
                member_info.profile_url = '/static/common/icon/icon_account.png'
            context['member_info'] = member_info

        if error is None:
            if class_id != '' and class_id is not None:
                context = func_get_trainee_ticket_list(context, class_id, request.user.id)

        context['check_password_changed'] = 1
        if sns_id != '' and sns_id is not None:
            sns_password_change_check = SnsInfoTb.objects.filter(member_id=request.user.id, sns_id=sns_id,
                                                                 change_password_check=1, use=USE).count()
            if sns_password_change_check == 0:
                context['check_password_changed'] = 0
        func_setting_data_update(self.request, 'trainee')

        if error is None:
            if class_id is not None and class_id != '':
                check_alarm_program_notice_qa_comment(context, class_id, self.request.user.id)

        return render(request, self.template_name, context)


class ProgramSelectView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainee_program.html'

    def get_context_data(self, **kwargs):
        context = super(ProgramSelectView, self).get_context_data(**kwargs)
        context['error'] = None
        context = func_get_class_list(context, self.request.user.id)

        if context['error'] is not None:
            logger.error(self.request.user.first_name + '[' + str(self.request.user.id) + ']' + context['error'])
            messages.error(self.request, context['error'])

        return context


# 일정 추가
def add_trainee_schedule_logic(request):
    class_id = request.session.get('class_id', '')
    lecture_id = request.POST.get('lecture_id', '')
    lecture_schedule_id = request.POST.get('lecture_schedule_id', None)
    training_date = request.POST.get('training_date', '')
    # time_duration = request.POST.get('time_duration', '')
    training_time = request.POST.get('training_time', '')
    # class_type_name = request.session.get('class_type_name', '')
    setting_week_start_date = request.session.get('setting_week_start_date', 'SUN')
    error = None
    class_info = None
    start_date = None
    end_date = None
    context = {'push_class_id': None, 'push_title': None, 'push_message': None}
    schedule_info = None
    lecture_info = None
    member_ticket_id = None
    member_ticket_info = None
    error = None
    log_how = '예약 확정'
    # lt_res_member_time_duration = 60

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

    # if error is None:
    #     try:
    #         setting_data = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id,
    #                                              setting_type_cd='LT_RES_MEMBER_TIME_DURATION')
    #         lt_res_member_time_duration = int(setting_data.setting_info)
    #     except ObjectDoesNotExist:
    #         lt_res_member_time_duration = 60

    if lecture_schedule_id == '' or lecture_schedule_id is None:
        if lecture_id is None or lecture_id == '':
            error = '오류가 발생했습니다.[-1]'

    if error is None:
        if lecture_schedule_id == '' or lecture_schedule_id is None:
            # member_ticket_id = func_get_member_ticket_id(class_id, request.user.id)
            member_ticket_result = func_get_lecture_member_ticket_id_from_trainee(
                class_id, lecture_id, request.user.id,
                datetime.datetime.strptime(training_date, "%Y-%m-%d").date())

            if member_ticket_result['error'] is not None:
                error = member_ticket_result['error']
            else:
                member_ticket_id = member_ticket_result['member_ticket_id']
        # 그룹 Lecture Id 조회
        else:
            try:
                lecture_schedule_info = ScheduleTb.objects.get(schedule_id=lecture_schedule_id, use=USE)
            except ObjectDoesNotExist:
                lecture_schedule_info = None

            if lecture_schedule_info is not None:
                if lecture_schedule_info.state_cd == STATE_CD_FINISH:
                    error = '이미 출석 처리된 일정입니다.'
                elif lecture_schedule_info.state_cd == STATE_CD_ABSENCE:
                    error = '이미 결석 처리된 일정입니다.'

                if error is None:
                    lecture_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_schedule_info.lecture_tb_id,
                                                                      lecture_schedule_id=lecture_schedule_id,
                                                                      member_ticket_tb__member_id=request.user.id,
                                                                      use=USE)
                    if len(lecture_schedule_data) == 0:
                        member_ticket_result = func_get_lecture_member_ticket_id_from_trainee(
                            class_id, lecture_schedule_info.lecture_tb_id, request.user.id,
                            datetime.datetime.strptime(training_date, "%Y-%m-%d").date())

                        if member_ticket_result['error'] is not None:
                            error = member_ticket_result['error']
                        else:
                            member_ticket_id = member_ticket_result['member_ticket_id']
                    else:
                        member_ticket_id = None
                        error = '이미 일정에 포함되어있습니다.'

    if error is None:
        if lecture_schedule_id is None or lecture_schedule_id == '':
            try:
                lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
            except ObjectDoesNotExist:
                error = '오류가 발생했습니다.[0]'
            # lecture_info = func_get_member_ticket_one_to_one_lecture_info(class_id, member_ticket_id)
            if lecture_info is not None:
                time_duration_temp = lecture_info.lecture_minute
            else:
                time_duration_temp = 60

            # if int(lt_res_member_time_duration) < 10:
            #     time_duration_temp = class_info.class_hour*int(lt_res_member_time_duration)
            # else:
            #     time_duration_temp = int(lt_res_member_time_duration)

            start_date = datetime.datetime.strptime(training_date+' '+training_time, '%Y-%m-%d %H:%M')
            end_date = start_date + datetime.timedelta(minutes=int(time_duration_temp))
        else:
            try:
                schedule_info = ScheduleTb.objects.get(schedule_id=lecture_schedule_id, use=USE)
            except ObjectDoesNotExist:
                error = '스케쥴 정보를 불러오지 못했습니다.'
            if error is None:
                start_date = schedule_info.start_dt
                end_date = schedule_info.end_dt
                if schedule_info.state_cd == STATE_CD_FINISH:
                    error = '이미 출석 처리된 일정입니다.'
                elif schedule_info.state_cd == STATE_CD_ABSENCE:
                    error = '이미 결석 처리된 일정입니다.'

    if error is None:
        error = func_check_select_time_reserve_setting(class_id, class_info.member_id,
                                                       start_date, end_date, ADD_SCHEDULE)

    if error is None:
        if member_ticket_id is None:
            error = '예약가능 횟수를 확인해주세요.'

    if error is None:
        try:
            member_ticket_info = MemberTicketTb.objects.get(member_ticket_id=member_ticket_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        select_date = start_date.date()
        if member_ticket_info.ticket_tb.day_schedule_enable < 9999:
            # 체크 하기
            tomorrow = select_date + datetime.timedelta(days=1)
            day_schedule_count = ScheduleTb.objects.filter(member_ticket_tb_id=member_ticket_info.member_ticket_id,
                                                           start_dt__gte=select_date, start_dt__lt=tomorrow,
                                                           use=USE).count()

            if day_schedule_count >= member_ticket_info.ticket_tb.day_schedule_enable:
                error = member_ticket_info.ticket_tb.name + ' 수강권의 하루 최대 이용 횟수를 초과했습니다.'
    if error is None:
        select_date = start_date.date()
        if member_ticket_info.ticket_tb.week_schedule_enable < 9999:
            week_idx = 0
            if setting_week_start_date == 'MON':
                week_idx = 1

            # 주의 마지막 날짜 찾기
            week_idx -= int(select_date.strftime('%w'))
            first_day = select_date + datetime.timedelta(days=week_idx)

            # 주의 첫번째 날짜 찾기
            last_day = first_day + datetime.timedelta(days=7)

            week_schedule_count = ScheduleTb.objects.filter(member_ticket_tb_id=member_ticket_info.member_ticket_id,
                                                            start_dt__gte=first_day, start_dt__lt=last_day,
                                                            use=USE).count()
            if week_schedule_count >= member_ticket_info.ticket_tb.week_schedule_enable:
                error = member_ticket_info.ticket_tb.name + ' 수강권의 주간 최대 이용 횟수를 초과했습니다.'

        if error is None:
            if member_ticket_info.member_auth_cd == AUTH_TYPE_WAIT:
                error = '알림 -> 프로그램 연결 허용 선택후 이용 가능합니다.'
            elif member_ticket_info.member_auth_cd == AUTH_TYPE_DELETE:
                error = '강사님에게 프로그램 연결을 요청하세요.'

        if error is None:
            if start_date.date() > member_ticket_info.end_date:
                error = '수강권 종료일 이후의 일정은 등록이 불가능합니다.'

    if error is None:
        schedule_result = pt_add_logic_func(training_date, start_date, end_date, request.user.id, member_ticket_id,
                                            class_id, request, lecture_info, lecture_schedule_id)
        error = schedule_result['error']
        context['schedule_id'] = schedule_result['schedule_id']
    # if error is None:
        # func_update_member_schedule_alarm(class_id)
        # class_info.schedule_check = 1
        # class_info.save()

        # try:
        #     setting_data = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id,
        #                                          setting_type_cd='LT_PUS_FROM_TRAINEE_LESSON_ALARM')
        #     lt_pus_from_trainee_lesson_alarm = int(setting_data.setting_info)
        # except ObjectDoesNotExist:
        #     lt_pus_from_trainee_lesson_alarm = FROM_TRAINEE_LESSON_ALARM_ON
        #
        # if str(lt_pus_from_trainee_lesson_alarm) == str(FROM_TRAINEE_LESSON_ALARM_ON):
    # else:
    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    return render(request, 'ajax/trainee_error_info.html', context)


# pt 일정 취소
def delete_trainee_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)
    setting_to_shared_trainer_lesson_alarm = request.session.get('setting_to_shared_trainer_lesson_alarm',
                                                                 TO_SHARED_TRAINER_LESSON_ALARM_OFF)
    trainer_name = request.session.get('trainer_name', '')
    error = None
    member_ticket_info = None
    class_info = None
    schedule_info = None
    start_date = None
    end_date = None
    # push_class_id = []
    # push_title = []
    # push_message = []
    lecture_name = '개인'
    # context = {'push_class_id': None, 'push_title': None, 'push_message': None}
    context = {}
    member_ticket_id = None
    lecture_id = None
    repeat_schedule_id = None
    permission_state_cd = PERMISSION_STATE_CD_APPROVE
    lecture_schedule_id = ''
    if schedule_id == '':
        error = '일정 정보를 불러오지 못했습니다.[0]'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id,
                                                   member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW, use=USE)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.[1]'

    if error is None:
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt
        permission_state_cd = schedule_info.permission_state_cd
        lecture_schedule_id = schedule_info.lecture_schedule_id
        lecture_name = schedule_info.get_lecture_name()
        if start_date < timezone.now():  # 강사 설정 시간으로 변경필요
            error = '이미 지난 일정입니다.'

    if error is None:
        if schedule_info.state_cd == STATE_CD_FINISH:
            error = '이미 출석 처리된 일정입니다.'
        elif schedule_info.state_cd == STATE_CD_ABSENCE:
            error = '이미 결석 처리된 일정입니다.'

    if error is None:
        member_ticket_info = schedule_info.member_ticket_tb
        member_ticket_id = member_ticket_info.member_ticket_id

        # if member_ticket_info is not None and member_ticket_info != '':
        # member_ticket_id = schedule_info.member_ticket_tb.member_ticket_id
        if schedule_info.lecture_tb is not None and schedule_info.lecture_tb != '':
            lecture_id = schedule_info.lecture_tb_id
        if schedule_info.repeat_schedule_tb is not None and schedule_info.repeat_schedule_tb != '':
            repeat_schedule_id = schedule_info.repeat_schedule_tb_id

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '수강권 정보를 불러오지 못했습니다.[0]'

    if error is None:
        if str(member_ticket_info.member_id) != str(request.user.id):
            error = '회원 정보를 불러오지 못했습니다.[0]'

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
                                                   member_ticket_tb_id=member_ticket_id,
                                                   lecture_tb_id=lecture_id,
                                                   delete_repeat_schedule_tb=repeat_schedule_id,
                                                   lecture_schedule_id=schedule_info.lecture_schedule_id,
                                                   start_dt=schedule_info.start_dt, end_dt=schedule_info.end_dt,
                                                   permission_state_cd=schedule_info.permission_state_cd,
                                                   state_cd=schedule_info.state_cd,
                                                   en_dis_type=schedule_info.en_dis_type,
                                                   note=schedule_info.note, member_note=schedule_info.member_note,
                                                   reg_member_id=schedule_info.reg_member_id,
                                                   del_member=str(request.user.id),
                                                   reg_dt=schedule_info.reg_dt, mod_dt=timezone.now(), use=UN_USE)

                delete_schedule.save()
                schedule_info.delete()

                # if error is None:
                error = func_refresh_member_ticket_count(class_id, member_ticket_id)
                if error is not None:
                    raise InternalError
        except ValueError:
            error = '오류가 발생했습니다.[0]'
        except TypeError:
            error = '오류가 발생했습니다.[1]'
        except IntegrityError:
            error = '이미 취소된 일정입니다.'
        except InternalError:
            error = '오류가 발생했습니다.[2]'
        except ValidationError:
            error = '예약가능 횟수를 확인해주세요.'

    if error is None:
        # func_update_member_schedule_alarm(class_id)
        # class_info.schedule_check = 1
        # class_info.save()
        push_info_schedule_start_date = str(start_date).split(':')
        push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')

        push_schedule_info = push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]\
                             + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
        log_info = push_schedule_info.replace('~', '/')
        if lecture_name == '':
            lecture_name = '개인'
        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                         from_member_name=request.user.first_name,
                         class_tb_id=class_id, member_ticket_tb_id=member_ticket_info.member_ticket_id,
                         log_info=lecture_name + ' 수업',
                         log_how='예약 취소',
                         log_detail=log_info,
                         use=USE)
        log_data.save()

        # try:
        #     setting_data = SettingTb.objects.get(class_tb_id=class_id,
        #                                          setting_type_cd='LT_PUS_FROM_TRAINEE_LESSON_ALARM')
        #     lt_pus_from_trainee_lesson_alarm = int(setting_data.setting_info)
        # except ObjectDoesNotExist:
        #     lt_pus_from_trainee_lesson_alarm = FROM_TRAINEE_LESSON_ALARM_ON
        # if str(lt_pus_from_trainee_lesson_alarm) == str(FROM_TRAINEE_LESSON_ALARM_ON):
        func_send_push_trainee(class_id,
                               class_type_name + ' - 일정 알림',
                               request.user.first_name + '님이 '
                               + push_schedule_info
                               + ' ['+lecture_name + '] 수업을 예약 취소했습니다.')

        if lecture_name != '개인':
            if permission_state_cd == PERMISSION_STATE_CD_APPROVE:
                wait_schedule_data = ScheduleTb.objects.filter(class_tb=class_id,
                                                               lecture_schedule_id=lecture_schedule_id,
                                                               member_ticket_tb__isnull=False,
                                                               permission_state_cd=PERMISSION_STATE_CD_WAIT,
                                                               use=USE).order_by('start_dt', 'reg_dt')
                approve_schedule_count = ScheduleTb.objects.filter(class_tb=class_id,
                                                                   lecture_schedule_id=lecture_schedule_id,
                                                                   member_ticket_tb__isnull=False,
                                                                   permission_state_cd=PERMISSION_STATE_CD_APPROVE,
                                                                   use=USE).count()
                if len(wait_schedule_data) > 0:
                    wait_schedule_info = wait_schedule_data[0]
                    if wait_schedule_info.max_mem_count > approve_schedule_count:
                        if wait_schedule_info.member_ticket_tb is not None and wait_schedule_info.member_ticket_tb != '':
                            wait_schedule_info.permission_state_cd = PERMISSION_STATE_CD_APPROVE
                            wait_schedule_info.save()
                            member_ticket_id = wait_schedule_info.member_ticket_tb_id
                            member_name = wait_schedule_info.member_ticket_tb.member.name
                            if str(setting_to_trainee_lesson_alarm) == str(TO_TRAINEE_LESSON_ALARM_ON):
                                func_send_push_trainer(member_ticket_id,
                                                       class_type_name + ' - 일정 알림',
                                                       # trainer_name + '님의 ' +
                                                       push_schedule_info
                                                       + ' ['+lecture_name+'] 수업이 예약 확정됐습니다.')
                            if str(setting_to_shared_trainer_lesson_alarm) == str(TO_SHARED_TRAINER_LESSON_ALARM_ON):
                                func_send_push_trainer_trainer(class_id, class_type_name + ' - 일정 알림',
                                                               member_name + '님의 '
                                                               + push_schedule_info
                                                               + ' ['+lecture_name+'] 수업이 예약 확정됐습니다.',
                                                               request.user.id)
                            log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                                             from_member_name=trainer_name,
                                             to_member_name=member_name,
                                             class_tb_id=class_id,
                                             member_ticket_tb_id=member_ticket_id,
                                             log_info=lecture_name + ' 수업',
                                             log_how='예약 확정',
                                             log_detail=log_info, use=USE)
                            log_data.save()
    else:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
    return render(request, 'ajax/trainee_error_info.html', context)


class GetTraineeScheduleView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_schedule_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetTraineeScheduleView, self).get_context_data(**kwargs)
        date = self.request.GET.get('date', '')
        day = self.request.GET.get('day', '')
        class_id = self.request.session.get('class_id', '')
        trainer_id = self.request.session.get('trainer_id', '')
        class_hour = self.request.session.get('class_hour', '')
        today = datetime.date.today()
        error = None
        if date != '':
            today = datetime.datetime.strptime(date, '%Y-%m-%d')
        if day == '':
            day = 46
        start_date = today - datetime.timedelta(days=int(day))
        end_date = today + datetime.timedelta(days=int(day))
        if class_id is not None and class_id != '':
            if trainer_id == '' or trainer_id is None:
                try:
                    class_info = ClassTb.objects.get(class_id=class_id)
                    trainer_id = class_info.member_id
                    class_hour = class_info.class_hour
                    self.request.session['trainer_id'] = trainer_id
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'

            context['error'] = error
            # context = func_get_holiday_schedule(context, start_date, end_date)
            context = func_get_trainee_on_schedule(context, class_id, self.request.user.id, start_date, end_date)
            context = func_get_trainee_off_schedule(context, class_id, start_date, end_date)
            # 그룹 스케쥴과 예약 가능 횟수 동시에 들고 와야할듯
            context = func_get_trainee_lecture_schedule(context, self.request.user.id, class_id, start_date, end_date)
            context = func_get_class_member_ticket_count(context, class_id, self.request.user.id)

            if trainer_id != '' and trainer_id is not None:
                context = func_get_trainer_setting_list(context, class_id, trainer_id)

            if context['error'] is not None:
                logger.error(self.request.user.first_name + '[' + str(self.request.user.id) + ']' + context['error'])
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
            logger.error(self.request.user.first_name+'[' + str(self.request.user.id) + ']' + context['error'])
            messages.error(self.request, context['error'])

        return context


class GetTraineeClassListView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'ajax/trainee_class_list_ajax.html'

    def get(self, request):
        context = {'error': None}
        context = func_get_class_list(context, request.user.id)
        if context['error'] is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + context['error'])
            messages.error(request, context['error'])

        return render(request, self.template_name, context)


class GetTraineeMemberTicketConnectionListView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_member_ticket_list_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetTraineeMemberTicketConnectionListView, self).get_context_data(**kwargs)
        class_id = self.request.GET.get('class_id', '')
        auth_cd = self.request.GET.get('auth_cd', '')
        context['error'] = None
        context = func_get_member_ticket_connection_list(context, class_id, self.request.user.id, auth_cd)

        if context['error'] is not None:
            logger.error(self.request.user.first_name + '[' + str(self.request.user.id) + ']' + context['error'])
            messages.error(self.request, context['error'])

        return context


class GetTraineeMemberTicketListView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_member_ticket_list_ajax.html'

    def get_context_data(self, **kwargs):
        # context = {}
        context = super(GetTraineeMemberTicketListView, self).get_context_data(**kwargs)
        class_id = self.request.GET.get('class_id', '')
        auth_cd = self.request.GET.get('auth_cd', '')
        context['error'] = None
        context = func_get_member_ticket_list(context, class_id, self.request.user.id, auth_cd)

        if context['error'] is not None:
            logger.error(self.request.user.first_name + '[' + str(self.request.user.id) + ']' + context['error'])
            messages.error(self.request, context['error'])

        return context


class GetTraineeCountView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_schedule_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetTraineeCountView, self).get_context_data(**kwargs)
        # context = {}
        class_id = self.request.session.get('class_id', '')
        context = func_get_class_member_ticket_count(context, class_id, self.request.user.id)

        if context['error'] is not None:
            logger.error(self.request.user.first_name + '[' + str(self.request.user.id) + ']' + context['error'])
            messages.error(self.request, context['error'])

        return context


def program_select_logic(request):

    class_id = request.POST.get('class_id', '')
    class_id_session = request.session.get('class_id', '')
    # member_ticket_id = request.POST.get('member_ticket_id', '')
    member_ticket_connection_check = request.POST.get('member_ticket_connection_check', PROGRAM_SELECT)
    next_page = request.POST.get('next_page', '/trainee/trainee_main/')
    error = None
    # if member_ticket_connection_check == PROGRAM_LECTURE_CONNECT_DELETE:
    #     if member_ticket_id == '':
    #         error = '수강정보를 불러오지 못했습니다.'
    # else:
    member_ticket_connection_check = int(member_ticket_connection_check)
    if class_id == '':
        error = '수강보권 정보를 불러오지 못했습니다.[0]'

    if error is None:
        if member_ticket_connection_check == PROGRAM_LECTURE_CONNECT_DELETE:
            # 선택한 프로그램의 연결 대기중인 수강권 전부 삭제
            member_ticket_data = ClassMemberTicketTb.objects.select_related(
                'class_tb', 'member_ticket_tb__member'
            ).filter(class_tb_id=class_id, member_ticket_tb__member_id=request.user.id,
                     member_ticket_tb__member_auth_cd=AUTH_TYPE_WAIT, use=USE).order_by('-member_ticket_tb__start_date')
            for member_ticket_info in member_ticket_data:
                member_ticket_info.member_ticket_tb.member_auth_cd = AUTH_TYPE_DELETE
                member_ticket_info.member_ticket_tb.save()
            class_info = None
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '수강권 정보를 불러오지 못했습니다.[1]'

            # log_data = LogTb(log_type='LP02', auth_member_id=request.user.id,
            #                  from_member_name=request.user.first_name,
            #                  class_tb_id=class_id_session,
            #                  log_info=class_info.member.name + ' 강사님의 \''
            #                           + class_info.get_class_type_cd_name()+'\' 프로그램',
            #                  log_how='연결 취소',
            #                  log_detail='', use=USE)
            # log_data.save()
            log_data = LogTb(log_type='LP02', auth_member_id=request.user.id,
                             from_member_name=request.user.first_name,
                             class_tb_id=class_info.class_id,
                             log_info=class_info.member.name + ' 강사님의 \''
                                      + class_info.get_class_type_cd_name()+'\' 프로그램',
                             log_how='연결 취소',
                             log_detail='', use=USE)
            log_data.save()

        elif member_ticket_connection_check == PROGRAM_LECTURE_CONNECT_ACCEPT:
            # 선택한 프로그램의 연결 대기중인 수강권 전부 연결
            member_ticket_data = ClassMemberTicketTb.objects.select_related(
                'class_tb', 'member_ticket_tb__member'
            ).filter(class_tb_id=class_id, member_ticket_tb__member_id=request.user.id,
                     member_ticket_tb__member_auth_cd=AUTH_TYPE_WAIT,
                     use=USE).order_by('-member_ticket_tb__start_date')
            for member_ticket_info in member_ticket_data:
                member_ticket_info.member_ticket_tb.member_auth_cd = AUTH_TYPE_VIEW
                member_ticket_info.member_ticket_tb.save()

            class_info = None
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '수강권 정보를 불러오지 못했습니다.[2]'

            # log_data = LogTb(log_type='LP01', auth_member_id=request.user.id,
            #                  from_member_name=request.user.first_name,
            #                  class_tb_id=class_id_session,
            #                  log_info=class_info.member.name + ' 강사님의 \''
            #                           + class_info.get_class_type_cd_name()+'\' 프로그램',
            #                  log_how='연결 완료',
            #                  log_detail='', use=USE)
            # log_data.save()
            log_data = LogTb(log_type='LP01', auth_member_id=request.user.id,
                             from_member_name=request.user.first_name,
                             class_tb_id=class_info.class_id,
                             log_info=class_info.member.name + ' 강사님의 \''
                                      + class_info.get_class_type_cd_name()+'\' 프로그램',
                             log_how='연결 완료',
                             log_detail='', use=USE)
            log_data.save()
            next_page = '/trainee/trainee_main/'

        if member_ticket_connection_check != PROGRAM_LECTURE_CONNECT_DELETE:
            # 선택한 프로그램 연결
            class_info = None
            request.session['class_id'] = class_id
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '수강권 정보를 불러오지 못했습니다.[3]'

            if error is None:
                request.session['trainer_id'] = class_info.member_id
                request.session['class_hour'] = class_info.class_hour
                request.session['program_title'] = class_info.get_class_type_cd_name()
                request.session['class_center_name'] = class_info.get_center_name()

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
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
                error = '수강권 정보를 불러오지 못했습니다.[0]'

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
                    error = '수강권 정보를 불러오지 못했습니다.[1]'
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
    # phone = request.POST.get('phone', '')
    contents = request.POST.get('contents', '')
    country = request.POST.get('country', '')
    address = request.POST.get('address', '')
    sex = request.POST.get('sex', '')
    birthday_dt = request.POST.get('birthday', '')
    email = request.POST.get('email', '')

    error = None
    member_id = request.user.id
    user = None
    member = None

    if member_id == '':
        error = '회원 정보를 불러오지 못했습니다.[0]'

    if error is None:
        try:
            user = User.objects.get(id=member_id)
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.[1]'

        try:
            member = MemberTb.objects.get(user_id=user.id)
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.[2]'

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

    if email is None or email == '':
        email = user.email
    # if phone is None or phone == '':
    #     phone = member.phone
    # else:
    #     if len(phone) != 11 and len(phone) != 10:
    #         error = '연락처를 확인해 주세요.'
    #     elif not phone.isdigit():
    #         error = '연락처를 확인해 주세요.'

    if error is None:
        try:
            with transaction.atomic():
                user.first_name = first_name
                user.email = email
                user.save()
                member.name = first_name
                # member.phone = phone
                member.contents = contents
                member.sex = sex
                if birthday_dt is not None and birthday_dt != '':
                    member.birthday_dt = birthday_dt
                member.country = country
                member.address = address
                member.save()

        except ValueError:
            error = '오류가 발샣했습니다.[0]'
        except IntegrityError:
            error = '오류가 발샣했습니다.[1]'
        except TypeError:
            error = '오류가 발샣했습니다.[2]'
        except ValidationError:
            error = '오류가 발샣했습니다.[3]'
        except InternalError:
            error = '오류가 발샣했습니다.[4]'

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return render(request, 'ajax/trainee_error_info.html')


class AlarmView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    # context_object_name = "log_data"
    template_name = "trainee_alarm.html"
    # page_template = 'trainee_alarm_page.html'

    def get_context_data(self, **kwargs):
        context = super(AlarmView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        # member_ticket_id = self.request.session.get('member_ticket_id', '')
        error = None
        log_data = None

        context = func_get_class_list(context, self.request.user.id)

        # if member_ticket_id is None or member_ticket_id == '':
        #     error = '수강정보를 불러오지 못했습니다.'

        if error is None:
            today = datetime.date.today()
            three_days_ago = today - datetime.timedelta(days=7)
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=USE).order_by('-reg_dt')

            log_data = LogTb.objects.select_related('member_ticket_tb__member').filter(
                Q(member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW) | Q(auth_member_id=self.request.user.id),
                class_tb_id=class_id, member_ticket_tb__member_id=self.request.user.id, reg_dt__gte=three_days_ago,
                use=USE).order_by('-reg_dt')

            check_alarm_program_notice_qa_comment(context, class_id, self.request.user.id)

        if error is None:
            for log_info in log_data:
                if log_info.member_read == 0:
                    log_info.log_read = 0
                    log_info.member_read = 1
                    log_info.save()
                elif log_info.member_read == 1:
                    log_info.log_read = 1
                else:
                    log_info.log_read = 2
                log_info.time_ago = timezone.now() - log_info.reg_dt
                log_info.reg_dt = str(log_info.reg_dt).split('.')[0]

                if log_info.log_detail != '' and log_info.log_detail is not None:
                    log_detail_split = str(log_info.log_detail).split('/')
                    before_day = log_detail_split[0]
                    after_day = log_detail_split[1]

                    if '반복 일정' in log_info.log_how or '반복 일정' in log_info.log_info:
                        log_info.log_detail = before_day + '~' + after_day
                    else:

                        after_day_split = after_day.split(' ')
                        if len(after_day_split) > 1:
                            log_info.log_detail = before_day + '~' + after_day.split(' ')[1]
                        else:
                            log_info.log_detail = before_day + '~' + after_day
                        # log_info.log_detail = before_day + '~' + after_day.split(' ')[1]
                        if len(log_detail_split) > 2:
                            log_info.log_detail = before_day + '~' + after_day + '~' + log_detail_split[2]

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
            member_ticket_data = MemberTicketTb.objects.filter(member_id=request.user.id, member_auth_cd=AUTH_TYPE_VIEW)
            if len(member_ticket_data) > 0:
                for idx, member_ticket_info in enumerate(member_ticket_data):
                    if idx == 0:
                        log_data = LogTb.objects.filter(member_ticket_tb_id=member_ticket_info.member_ticket_id,
                                                        use=USE).order_by('-reg_dt')
                    else:
                        log_data |= LogTb.objects.filter(member_ticket_tb_id=member_ticket_info.member_ticket_id,
                                                         use=USE).order_by('-reg_dt')
                log_data.order_by('-reg_dt')

        if error is None:
            query = "select count(B.ID) from QA_COMMENT_TB as B where B.QA_TB_ID = `QA_TB`.`ID` and B.READ=0 and B.USE=1"

            context['check_qa_comment'] = QATb.objects.filter(
                member_id=self.request.user.id, status_type_cd='QA_COMPLETE',
                use=USE).annotate(qa_comment=RawSQL(query, [])).filter(qa_comment__gt=0).count()

        if error is None:
            for log_info in log_data:
                if log_info.member_read == 0:
                    log_info.log_read = 0
                    log_info.member_read = 1
                    log_info.save()
                elif log_info.member_read == 1:
                    log_info.log_read = 1
                else:
                    log_info.log_read = 2

            context['log_data'] = log_data

        return render(request, self.template_name, context)


def pt_add_logic_func(schedule_date, start_date, end_date, user_id,
                      member_ticket_id, class_id, request, lecture_info, lecture_schedule_id):

    class_type_name = request.session.get('class_type_name', '')
    error = None
    member_ticket_info = None
    # class_info = None
    today = datetime.datetime.today()
    fifteen_days_after = today + datetime.timedelta(days=15)
    lecture_schedule_info = None
    # lecture_info = None
    note = ''
    schedule_duplication = SCHEDULE_DUPLICATION_DISABLE
    schedule_result = {'error': None, 'schedule_id': ''}
    setting_member_private_class_auto_permission = USE
    setting_member_public_class_auto_permission = USE
    lecture_schedule_num = 0
    log_how = '대기 예약'
    # start_date = None
    # end_date = None
    if member_ticket_id is None or member_ticket_id == '':
        error = '수강권 정보를 불러오지 못했습니다.[0]'
    elif schedule_date == '':
        error = '날짜를 선택해 주세요.'

    if error is None:
        try:
            setting_info = SettingTb.objects.get(class_tb_id=class_id,
                                                 setting_type_cd='LT_RES_PRIVATE_CLASS_AUTO_PERMISSION', use=USE)
            setting_member_private_class_auto_permission = int(setting_info.setting_info)
        except ObjectDoesNotExist:
            setting_member_private_class_auto_permission = USE
        try:
            setting_info = SettingTb.objects.get(class_tb_id=class_id,
                                                 setting_type_cd='LT_RES_PUBLIC_CLASS_AUTO_PERMISSION', use=USE)
            setting_member_public_class_auto_permission = int(setting_info.setting_info)
        except ObjectDoesNotExist:
            setting_member_public_class_auto_permission = USE

    if error is None:
        if lecture_schedule_id is not None and lecture_schedule_id != '':
            schedule_duplication = SCHEDULE_DUPLICATION_ENABLE
            try:
                lecture_schedule_info = ScheduleTb.objects.get(schedule_id=lecture_schedule_id, use=USE)
                lecture_info = lecture_schedule_info.lecture_tb
                note = lecture_schedule_info.note
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.[0]'
        # else:
        #     lecture_info = func_get_member_ticket_one_to_one_lecture_info(class_id, member_ticket_id)
        #     lecture_schedule_id = None

    if error is None:
        try:
            member_ticket_info = MemberTicketTb.objects.get(member_ticket_id=member_ticket_id, use=USE)
        except ObjectDoesNotExist:
            error = '수강권 정보를 불러오지 못했습니다.[1]'
        except ValueError:
            error = '수강권 정보를 불러오지 못했습니다.[2]'

    if error is None:
        if str(member_ticket_info.member_id) != str(user_id):
            error = '회원 정보를 불러오지 못했습니다.[1]'

    if error is None:
        if member_ticket_info.state_cd != STATE_CD_IN_PROGRESS:
            error = '수강권 정보를 불러오지 못했습니다.[3]'

    if error is None:
        if start_date >= fifteen_days_after:
            error = '등록할 수 없는 날짜입니다.'

    if error is None:
        if start_date < timezone.now():
            error = '이미 지난 날짜입니다.'

    if error is None:
        if member_ticket_info.member_ticket_avail_count == 0:
            error = '예약가능 횟수가 없습니다'

    if error is None:
        try:
            with transaction.atomic():
                permission_state_cd = PERMISSION_STATE_CD_WAIT
                if lecture_schedule_id is not None and lecture_schedule_id != '':
                    if str(setting_member_public_class_auto_permission) == str(USE):
                        permission_state_cd = PERMISSION_STATE_CD_APPROVE
                        log_how = '예약 확정'
                else:
                    if str(setting_member_private_class_auto_permission) == str(USE):
                        permission_state_cd = PERMISSION_STATE_CD_APPROVE
                        log_how = '예약 확정'
                if lecture_schedule_info is not None and lecture_schedule_info != '':
                    lecture_schedule_num = ScheduleTb.objects.filter(lecture_schedule_id=lecture_schedule_id,
                                                                     permission_state_cd=PERMISSION_STATE_CD_APPROVE,
                                                                     use=USE).count()
                    if lecture_schedule_num >= lecture_schedule_info.lecture_tb.member_num:
                        permission_state_cd = PERMISSION_STATE_CD_WAIT
                        log_how = '대기 예약'
                schedule_result = func_add_schedule(class_id, member_ticket_id, None,
                                                    lecture_info, lecture_schedule_id,
                                                    start_date, end_date, note, ON_SCHEDULE_TYPE, request.user.id,
                                                    permission_state_cd,
                                                    STATE_CD_NOT_PROGRESS, schedule_duplication)
                error = schedule_result['error']

                if error is not None:
                    raise InternalError()

        except TypeError:
            error = '오류가 발생했습니다.[0]'
        except ValueError:
            error = '오류가 발생했습니다.[1]'
        except IntegrityError:
            error = '오류가 발생했습니다.[2]'
        except InternalError:
            error = error
        except ValidationError:
            error = '예약가능 횟수를 확인해주세요.'

    if error is None:
        log_info_schedule_start_date = str(start_date).split(':')
        log_info_schedule_end_date = str(end_date).split(' ')[1].split(':')

        lecture_name = lecture_info.name
        if lecture_schedule_id is not None and lecture_schedule_id != '':
            lecture_name = lecture_schedule_info.get_lecture_name()
            log_data = LogTb(log_type='LS01', auth_member_id=request.user.id,
                             from_member_name=request.user.first_name,
                             class_tb_id=class_id,
                             member_ticket_tb_id=member_ticket_id,
                             log_info=lecture_name + ' 수업', log_how=log_how,
                             log_detail=log_info_schedule_start_date[0] + ':' + log_info_schedule_start_date[1]
                                        + '/' + log_info_schedule_end_date[0] + ':' + log_info_schedule_end_date[1],
                             use=USE)
            log_data.save()
        else:
            log_data = LogTb(log_type='LS01', auth_member_id=request.user.id,
                             from_member_name=request.user.first_name,
                             class_tb_id=class_id, member_ticket_tb_id=member_ticket_id,
                             log_info=lecture_name, log_how=log_how,
                             log_detail=log_info_schedule_start_date[0] + ':' + log_info_schedule_start_date[1]
                                        + '/' + log_info_schedule_end_date[0] + ':' + log_info_schedule_end_date[1],
                             use=USE)
            log_data.save()

        push_info_schedule_start_date = str(start_date).split(':')
        push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')

        func_send_push_trainee(class_id, class_type_name + ' - 일정 알림',
                               request.user.first_name + '님이 '
                               + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                               + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                               + ' [' + lecture_name + '] 수업을 '+log_how+'했습니다')

    else:
        schedule_result['error'] = error
    return schedule_result


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

    context['member_ticket_info'] = None
    context['error'] = None

    # class_info = None
    next_schedule_start_dt = ''
    next_schedule_end_dt = ''
    member_ticket_reg_count_sum = 0
    member_ticket_rem_count_sum = 0
    member_ticket_avail_count_sum = 0
    pt_start_date = ''
    pt_end_date = ''
    member_ticket_counts = 0
    member_ticket_list = None
    member_ticket_finish_count = 0
    member_ticket_absence_count = 0

    if class_id is None or class_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        # 강사에 해당하는 강좌 정보 불러오기
        member_ticket_list = ClassMemberTicketTb.objects.select_related(
            'member_ticket_tb'
        ).filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__member_id=user_id,
                 member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__use=USE, use=USE
                 ).order_by('member_ticket_tb__start_date')
    if error is None:
        if len(member_ticket_list) > 0:
            for idx, member_ticket_list_info in enumerate(member_ticket_list):
                member_ticket_info = member_ticket_list_info.member_ticket_tb
                if error is None:
                    member_ticket_counts += 1
                    if member_ticket_counts == 1:
                        if member_ticket_info.state_cd == STATE_CD_IN_PROGRESS:
                            pt_start_date = member_ticket_info.start_date
                            pt_end_date = member_ticket_info.end_date

                    else:
                        if member_ticket_info.state_cd == STATE_CD_IN_PROGRESS:
                            if pt_start_date == '':
                                pt_start_date = member_ticket_info.start_date
                            else:
                                if pt_start_date > member_ticket_info.start_date:
                                    pt_start_date = member_ticket_info.start_date
                            if pt_end_date == '':
                                pt_end_date = member_ticket_info.end_date
                            else:
                                if pt_end_date < member_ticket_info.end_date:
                                    pt_end_date = member_ticket_info.end_date

                    member_ticket_reg_count_sum += member_ticket_info.member_ticket_reg_count
                    if member_ticket_info.state_cd == STATE_CD_IN_PROGRESS:
                        member_ticket_rem_count_sum += member_ticket_info.member_ticket_rem_count
                        member_ticket_avail_count_sum += member_ticket_info.member_ticket_avail_count

                else:
                    error = None
    if error is None:

        member_ticket_finish_count = ScheduleTb.objects.select_related(
            'member_ticket_tb__member', 'lecture_tb'
        ).filter(Q(state_cd=STATE_CD_FINISH), class_tb_id=class_id, member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW,
                 en_dis_type=ON_SCHEDULE_TYPE, use=USE
                 ).order_by('member_ticket_tb__start_date', 'start_dt').count()

        member_ticket_absence_count = ScheduleTb.objects.select_related(
            'member_ticket_tb__member', 'lecture_tb'
        ).filter(Q(state_cd=STATE_CD_ABSENCE), class_tb_id=class_id, member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW,
                 en_dis_type=ON_SCHEDULE_TYPE, use=USE
                 ).order_by('member_ticket_tb__start_date', 'start_dt').count()

    if error is not None:
        context['error'] = error

    context['next_schedule_start_dt'] = str(next_schedule_start_dt)
    context['next_schedule_end_dt'] = str(next_schedule_end_dt)
    context['member_ticket_info'] = member_ticket_list
    context['member_ticket_reg_count'] = member_ticket_reg_count_sum
    context['member_ticket_finish_count'] = member_ticket_finish_count
    context['member_ticket_absence_count'] = member_ticket_absence_count
    context['member_ticket_rem_count'] = member_ticket_rem_count_sum
    context['member_ticket_avail_count'] = member_ticket_avail_count_sum
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
                context = func_get_trainer_setting_list(context, class_id, class_info.member_id)
                cancel_prohibition_time = context['setting_member_reserve_cancel_time']
                # 근접 예약 시간 확인
                cancel_disable_time = timezone.now() + datetime.timedelta(minutes=cancel_prohibition_time)
                context['cancel_disable_time'] = cancel_disable_time
                context['avail_end_date'] = datetime.datetime.strptime(str(context['avail_date_data'].pop()),
                                                                       '%Y-%m-%d')
        # if len(context['schedule_data']) == 0:
        #     return redirect('/trainee/popup_calendar_plan_reserve/')
        return context


class PopupCalendarPlanReserveView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'popup/trainee_popup_calendar_plan_reserve.html'

    def get_context_data(self, **kwargs):
        context = super(PopupCalendarPlanReserveView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id')
        select_date = self.request.GET.get('select_date')
        # 개인 수업 예약 가능 횟수 호출
        # 회원과 연결되어있는 수강권중에서 개인 수업이 포함되어 있는 경우 count

        # 선택한날에 오픈되어 있는 그룹수업의 예약 가능 횟수 호출
        # 회원과 연결되어있는 수강권중에서 해당 그룹 수업이 포함되어 있는 경우 count
        context = func_get_class_member_ticket_count(context, class_id, self.request.user.id)

        context['error'] = None
        context['select_date'] = datetime.datetime.strptime(select_date, '%Y-%m-%d')
        start_date = datetime.datetime.strptime(select_date + ' 00:00', '%Y-%m-%d %H:%M')
        end_date = datetime.datetime.strptime(select_date + ' 23:59', '%Y-%m-%d %H:%M')

        member_ticket_data = ClassMemberTicketTb.objects.select_related(
            'member_ticket_tb__ticket_tb').filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW,
                                                  member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
                                                  member_ticket_tb__member_id=self.request.user.id,
                                                  member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW,
                                                  member_ticket_tb__use=USE,
                                                  use=USE).order_by('-member_ticket_tb__start_date',
                                                                    '-member_ticket_tb__reg_dt')

        if len(member_ticket_data) > 0:
            query_ticket_list = Q()
            for member_ticket_info in member_ticket_data:
                ticket_info = member_ticket_info.member_ticket_tb.ticket_tb
                query_ticket_list |= Q(ticket_tb_id=ticket_info.ticket_id)

            ticket_lecture_data = TicketLectureTb.objects.select_related(
                'lecture_tb').filter(query_ticket_list, class_tb_id=class_id,
                                     lecture_tb__lecture_type_cd=LECTURE_TYPE_ONE_TO_ONE,
                                     lecture_tb__state_cd=STATE_CD_IN_PROGRESS,
                                     lecture_tb__use=USE, use=USE).order_by('reg_dt')
            context['one_to_one_lecture_data'] = ticket_lecture_data
            if len(ticket_lecture_data) == 0:
                context['one_to_one_lecture_check'] = False
                context['one_to_one_lecture_time_duration'] = 60
                context['one_to_one_lecture_id'] = ''
                context['one_to_one_lecture_start_time'] = 'A-0'
            else:
                context['one_to_one_lecture_check'] = True
                lecture_tb_info = ticket_lecture_data[0].lecture_tb
                context['one_to_one_lecture_time_duration'] = lecture_tb_info.lecture_minute
                context['one_to_one_lecture_id'] = lecture_tb_info.lecture_id
                context['one_to_one_lecture_start_time'] = lecture_tb_info.start_time
        # try:
        #     lecture_tb_info = LectureTb.objects.get(class_tb_id=class_id, lecture_type_cd=LECTURE_TYPE_ONE_TO_ONE, use=USE)
        #     context['one_to_one_lecture_time_duration'] = lecture_tb_info.lecture_minute
        # except ObjectDoesNotExist:
        #     context['one_to_one_lecture_time_duration'] = 60

        # 그룹 스케쥴과 예약 가능 횟수 동시에 들고 와야할듯
        context = func_get_trainee_lecture_schedule(context, self.request.user.id, class_id, start_date, end_date)
        lecture_data = []
        lecture_id_list = []
        for lecture_schedule_info in context['lecture_schedule_data']:

            ticket_lecture_data = TicketLectureTb.objects.select_related(
                'ticket_tb').filter(class_tb_id=class_id, ticket_tb__state_cd=STATE_CD_IN_PROGRESS, ticket_tb__use=USE,
                                    lecture_tb_id=lecture_schedule_info.lecture_tb_id,
                                    lecture_tb__state_cd=STATE_CD_IN_PROGRESS, lecture_tb__use=USE, use=USE)

            query_ticket_data = Q()
            for ticket_lecture_info in ticket_lecture_data:
                query_ticket_data |= Q(member_ticket_tb__ticket_tb_id=ticket_lecture_info.ticket_tb_id)

            class_member_ticket_data = ClassMemberTicketTb.objects.select_related('member_ticket_tb__member').filter(
                query_ticket_data, auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__member_id=self.request.user.id,
                member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS, use=USE)
            # member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW,

            lecture_member_ticket_avail_count = 0
            lecture_member_ticket_reg_count = 0
            for class_member_ticket_info in class_member_ticket_data:
                lecture_member_ticket_avail_count += class_member_ticket_info.member_ticket_tb.member_ticket_avail_count
                lecture_member_ticket_reg_count += class_member_ticket_info.member_ticket_tb.member_ticket_reg_count
            lecture_schedule_info.lecture_member_ticket_reg_count = lecture_member_ticket_reg_count
            lecture_schedule_info.lecture_member_ticket_avail_count = lecture_member_ticket_avail_count

            if lecture_id_list.count(lecture_schedule_info.lecture_tb.lecture_id) == 0:
                lecture_id_list.append(lecture_schedule_info.lecture_tb.lecture_id)
                lecture_info = {'lecture_id': lecture_schedule_info.lecture_tb.lecture_id,
                                'lecture_name': lecture_schedule_info.lecture_tb.name,
                                'lecture_member_ticket_reg_count': lecture_member_ticket_reg_count,
                                'lecture_member_ticket_avail_count': lecture_member_ticket_avail_count}
                lecture_data.append(lecture_info)
        context['lecture_data'] = lecture_data

        return context


class PopupCalendarPlanReserveCompleteView(LoginRequiredMixin, AccessTestMixin, TemplateView):
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

            context = func_get_trainer_setting_list(context, class_id, class_info.member_id)
            cancel_prohibition_time = context['setting_member_reserve_cancel_time']
            # 근접 취소 시간 확인
            cancel_disable_time = timezone.now() + datetime.timedelta(minutes=cancel_prohibition_time)
            context['cancel_disable_time'] = cancel_disable_time

        context['schedule_info'] = schedule_info
        return context


class PopupMemberTicketInfoView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'popup/trainee_popup_member_ticket_info.html'

    def get_context_data(self, **kwargs):
        context = super(PopupMemberTicketInfoView, self).get_context_data(**kwargs)
        member_ticket_id = self.request.GET.get('member_ticket_id')

        error = None
        member_ticket_info = None
        ticket_info = None
        schedule_list = None

        class_list = ClassMemberTicketTb.objects.select_related(
            'class_tb__member').filter(member_ticket_tb_id=member_ticket_id, auth_cd=AUTH_TYPE_VIEW,
                                       member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW, use=USE)

        for class_info in class_list:
            if class_info.class_tb.member.phone is not None and class_info.class_tb.member.phone != '':
                class_info.class_tb.member.phone = class_info.class_tb.member.phone[0:3] + '-' + \
                                                   class_info.class_tb.member.phone[3:7] + '-' +\
                                                   class_info.class_tb.member.phone[7:11]
            if class_info.class_tb.member.profile_url is None or class_info.class_tb.member.profile_url == '':
                class_info.class_tb.member.profile_url = '/static/common/icon/icon_account.png'
        try:
            member_ticket_info = MemberTicketTb.objects.get(member_ticket_id=member_ticket_id)

        except ObjectDoesNotExist:
            error = '수강권 정보를 불러오지 못했습니다.'

        if error is None:

            member_ticket_abs_count = ScheduleTb.objects.filter(member_ticket_tb_id=member_ticket_id,
                                                                state_cd=STATE_CD_ABSENCE, use=USE).count()
            member_ticket_info.member_ticket_abs_count = member_ticket_abs_count
        if error is None:
            query_status = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `SCHEDULE_TB`.`STATE_CD`"
            query_permission = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `SCHEDULE_TB`.`PERMISSION_STATE_CD`"
            # 자유형 문제
            schedule_list = ScheduleTb.objects.select_related(
                'lecture_tb').filter(member_ticket_tb_id=member_ticket_id,
                                     use=USE).annotate(status=RawSQL(query_status,
                                                                     []),
                                                       permission=RawSQL(query_permission,
                                                                         [])).order_by('-start_dt', '-end_dt')

        if error is None:
            try:
                ticket_info = TicketTb.objects.get(ticket_id=member_ticket_info.ticket_tb_id)
            except ObjectDoesNotExist:
                error = '수강권 정보를 불러오지 못했습니다.'

        if error is None:
            ticket_info.ticket_lecture_data = TicketLectureTb.objects.select_related(
                'lecture_tb'
            ).filter(ticket_tb_id=member_ticket_info.ticket_tb_id, ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
                     lecture_tb__state_cd=STATE_CD_IN_PROGRESS, lecture_tb__use=USE,
                     use=USE).order_by('lecture_tb__reg_dt')
        context['ticket_info'] = ticket_info
        context['class_data'] = class_list
        context['member_ticket_info'] = member_ticket_info
        context['schedule_data'] = schedule_list

        return context


class PopupLectureTicketInfoView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'popup/trainee_popup_lecture_ticket_info.html'

    def get_context_data(self, **kwargs):
        context = super(PopupLectureTicketInfoView, self).get_context_data(**kwargs)
        member_ticket_id = self.request.GET.get('member_ticket_id')
        lecture_id = self.request.GET.get('lecture_id')

        error = None
        member_ticket_info = None
        lecture_info = None
        schedule_list = None

        class_list = ClassMemberTicketTb.objects.select_related(
            'class_tb__member').filter(member_ticket_tb_id=member_ticket_id, auth_cd=AUTH_TYPE_VIEW,
                                       member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW, use=USE)

        for class_info in class_list:
            if class_info.class_tb.member.phone is not None and class_info.class_tb.member.phone != '':
                class_info.class_tb.member.phone = class_info.class_tb.member.phone[0:3] + '-' + \
                                                   class_info.class_tb.member.phone[3:7] + '-' +\
                                                   class_info.class_tb.member.phone[7:11]
            if class_info.class_tb.member.profile_url is None or class_info.class_tb.member.profile_url == '':
                class_info.class_tb.member.profile_url = '/static/common/icon/icon_account.png'
        try:
            member_ticket_info = MemberTicketTb.objects.get(member_ticket_id=member_ticket_id)
        except ObjectDoesNotExist:
            error = '수강권 정보를 불러오지 못했습니다.'

        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수업 정보를 불러오지 못했습니다.'

        if error is None:

            member_ticket_abs_count = ScheduleTb.objects.filter(member_ticket_tb_id=member_ticket_id,
                                                                state_cd=STATE_CD_ABSENCE, use=USE).count()
            member_ticket_info.member_ticket_abs_count = member_ticket_abs_count
        if error is None:
            query_status = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `SCHEDULE_TB`.`STATE_CD`"
            query_permission = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `SCHEDULE_TB`.`PERMISSION_STATE_CD`"
            # 자유형 문제
            schedule_list = ScheduleTb.objects.filter(member_ticket_tb_id=member_ticket_id,
                                                      lecture_tb_id=lecture_id,
                                                      use=USE).annotate(status=RawSQL(query_status,
                                                                                      []),
                                                                        permission=RawSQL(query_permission,
                                                                                          [])).order_by('-start_dt',
                                                                                                        '-end_dt')

        context['class_data'] = class_list
        context['member_ticket_info'] = member_ticket_info
        context['lecture_info'] = lecture_info
        context['schedule_data'] = schedule_list

        return context


class PopupTicketInfoView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'popup/trainee_popup_ticket_info.html'

    def get_context_data(self, **kwargs):
        context = super(PopupTicketInfoView, self).get_context_data(**kwargs)
        ticket_id = self.request.GET.get('ticket_id')
        error = None
        ticket_info = None

        member_ticket_list = ClassMemberTicketTb.objects.select_related(
            'class_tb__member',
            'member_ticket_tb__ticket_tb',
            'member_ticket_tb__member'
        ).filter(auth_cd=AUTH_TYPE_VIEW,
                 member_ticket_tb__ticket_tb__ticket_id=ticket_id, member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW,
                 member_ticket_tb__member_id=self.request.user.id,
                 use=USE).order_by('member_ticket_tb__state_cd', '-member_ticket_tb__start_date',
                                   '-member_ticket_tb__end_date',
                                   '-member_ticket_tb__reg_dt')

        for member_ticket_info in member_ticket_list:
            if member_ticket_info.class_tb.member.phone is not None and member_ticket_info.class_tb.member.phone != '':
                member_ticket_info.class_tb.member.phone = member_ticket_info.class_tb.member.phone[0:3] + '-' + \
                                                     member_ticket_info.class_tb.member.phone[3:7] + '-' + \
                                                     member_ticket_info.class_tb.member.phone[7:11]
            if member_ticket_info.class_tb.member.profile_url is None or member_ticket_info.class_tb.member.profile_url == '':
                member_ticket_info.class_tb.member.profile_url = '/static/common/icon/icon_account.png'
            try:
                member_ticket_info.status \
                    = CommonCdTb.objects.get(common_cd=member_ticket_info.member_ticket_tb.state_cd).common_cd_nm
            except ObjectDoesNotExist:
                member_ticket_info.status = ''

        if error is None:
            try:
                ticket_info = TicketTb.objects.get(ticket_id=ticket_id)
            except ObjectDoesNotExist:
                error = '수강권 정보를 불러오지 못했습니다.'

        if error is None:
            ticket_info.ticket_lecture_data = TicketLectureTb.objects.select_related(
                'lecture_tb'
            ).filter(ticket_tb_id=ticket_id, ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
                     lecture_tb__state_cd=STATE_CD_IN_PROGRESS, lecture_tb__use=USE,
                     use=USE).order_by('lecture_tb__reg_dt')

        context['ticket_info'] = ticket_info
        context['member_ticket_data'] = member_ticket_list
        return context


class PopupMyInfoChangeView(LoginRequiredMixin, AccessTestMixin, TemplateView):
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
                error = '수강권 정보를 불러오지 못했습니다.[0]'

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
                    error = '수강권 정보를 불러오지 못했습니다.[1]'
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


class PopupMyPasswordChangeView(TemplateView):
    template_name = 'popup/trainee_popup_my_password_change.html'

    def get_context_data(self, **kwargs):
        context = super(PopupMyPasswordChangeView, self).get_context_data(**kwargs)
        member_info = None
        error = None

        try:
            member_info = MemberTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

        if error is None:
            context['member_info'] = member_info
        return context


class UserPolicyView(TemplateView):
    template_name = 'trainee_user_policy.html'

    def get_context_data(self, **kwargs):
        context = super(UserPolicyView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        if class_id is not None and class_id != '':
            check_alarm_program_notice_qa_comment(context, class_id, self.request.user.id)
        return context


class PrivacyPolicyView(TemplateView):
    template_name = 'trainee_privacy_policy.html'

    def get_context_data(self, **kwargs):
        context = super(PrivacyPolicyView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        if class_id is not None and class_id != '':
            check_alarm_program_notice_qa_comment(context, class_id, self.request.user.id)
        return context


class AboutusView(TemplateView):
    template_name = 'trainee_about_us.html'

    def get_context_data(self, **kwargs):
        context = super(AboutusView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        if class_id is not None and class_id != '':
            check_alarm_program_notice_qa_comment(context, class_id, self.request.user.id)
        return context


class TraineeInquiryView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainee_inquiry.html'

    def get_context_data(self, **kwargs):
        context = super(TraineeInquiryView, self).get_context_data(**kwargs)
        qa_type_list = CommonCdTb.objects.filter(upper_common_cd='16', use=1).order_by('order')
        context['qa_type_data'] = qa_type_list
        class_id = self.request.session.get('class_id', '')
        if class_id is not None and class_id != '':
            check_alarm_program_notice_qa_comment(context, class_id, self.request.user.id)
        return context


class PopupPlanDailyRecordView(TemplateView):
    template_name = 'popup/trainee_popup_plan_daily_record.html'

    def get_context_data(self, **kwargs):
        context = super(PopupPlanDailyRecordView, self).get_context_data(**kwargs)
        schedule_id = self.request.GET.get('schedule_id')
        daily_record_info = None
        error = None
        if schedule_id is None or schedule_id == '':
            error = '일지 정보를 불러오지 못했습니다.'
        try:
            daily_record_info = DailyRecordTb.objects.get(schedule_tb_id=schedule_id)
            if daily_record_info.class_tb.member.profile_url is None or daily_record_info.class_tb.member.profile_url == '':
                daily_record_info.class_tb.member.profile_url = '/static/common/icon/icon_account.png'
        except ObjectDoesNotExist:
            error = '일지 정보를 불러오지 못했습니다.'

        if error is None:
            context['daily_record_info'] = daily_record_info
        return context


class PopupProgramNoticeView(TemplateView):
    template_name = 'popup/trainee_popup_program_notice.html'

    def get_context_data(self, **kwargs):
        context = super(PopupProgramNoticeView, self).get_context_data(**kwargs)
        program_notice_id = self.request.GET.get('program_notice_id')
        class_id = self.request.session.get('class_id')
        program_notice_info = None
        error = None
        if program_notice_id is None or program_notice_id == '':
            error = '공지사항 정보를 불러오지 못했습니다.[0]'

        try:
            program_notice_history_info = ProgramNoticeHistoryTb.objects.get(program_notice_tb_id=program_notice_id,
                                                                             member_id=self.request.user.id, use=USE)
            program_notice_info = program_notice_history_info.program_notice_tb
            if program_notice_info.member.profile_url is None or program_notice_info.member.profile_url == '':
                program_notice_info.member.profile_url = '/static/common/icon/icon_account.png'
            program_notice_info.hits += 1
            program_notice_info.save()
        except ObjectDoesNotExist:
            program_notice_history_info = ProgramNoticeHistoryTb(program_notice_tb_id=program_notice_id,
                                                                 member_id=self.request.user.id,
                                                                 class_tb_id=class_id, use=USE)
            program_notice_history_info.save()

        if program_notice_info is None:
            try:
                program_notice_info = ProgramNoticeTb.objects.get(program_notice_id=program_notice_id)
                if program_notice_info.member.profile_url is None or program_notice_info.member.profile_url == '':
                    program_notice_info.member.profile_url = '/static/common/icon/icon_account.png'
                program_notice_info.hits += 1
                program_notice_info.save()
            except ObjectDoesNotExist:
                error = '공지사항 정보를 불러오지 못했습니다.[1]'

        if error is None:
            context['program_notice_info'] = program_notice_info
        return context


class PopupInquiryView(TemplateView):
    template_name = 'popup/trainee_popup_inquiry.html'

    def get_context_data(self, **kwargs):
        context = super(PopupInquiryView, self).get_context_data(**kwargs)
        qa_type_list = CommonCdTb.objects.filter(upper_common_cd='16', use=1).order_by('order')
        context['qa_type_data'] = qa_type_list
        class_id = self.request.session.get('class_id', '')
        if class_id is not None and class_id != '':
            check_alarm_program_notice_qa_comment(context, class_id, self.request.user.id)
        return context


class PopupInquiryHistoryView(TemplateView):
    template_name = 'popup/trainee_popup_inquiry_history.html'

    def get_context_data(self, **kwargs):
        context = super(PopupInquiryHistoryView, self).get_context_data(**kwargs)
        query_type_cd = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `QA_TB`.`QA_TYPE_CD`"
        query_status = "select COMMON_CD_NM from COMMON_CD_TB as B where B.COMMON_CD = `QA_TB`.`STATUS`"
        qa_list = QATb.objects.select_related(
            'member').filter(member_id=self.request.user.id, use=USE
                             ).annotate(qa_type_cd_name=RawSQL(query_type_cd, []),
                                        status_type_cd_name=RawSQL(query_status, [])
                                        ).order_by('-reg_dt')
        for qa_info in qa_list:
            # if qa_info.read == 0 and qa_info.status_type_cd == 'QA_COMPLETE':
            #     qa_info.read = 1
            #     qa_info.save()
            qa_info.contents = qa_info.contents.replace('\n', '<br/>')
        context['qa_data'] = qa_list

        return context


class PopupInquiryHistoryInfoView(TemplateView):
    template_name = 'popup/trainee_popup_inquiry_history_info.html'

    def get_context_data(self, **kwargs):
        context = super(PopupInquiryHistoryInfoView, self).get_context_data(**kwargs)
        qa_id = self.request.GET.get('qa_id')
        error = None
        qa_info = None
        qa_comment_info = None

        if qa_id is None or qa_id != '':
            try:
                qa_info = QATb.objects.get(qa_id=qa_id)
            except ObjectDoesNotExist:
                error = '문의 정보를 불러오지 못했습니다.'

        if error is None:
            if qa_info.status_type_cd == 'QA_COMPLETE':
                if qa_info.read == 0:
                    qa_info.read = 1
                    qa_info.save()
                try:
                    qa_comment_info = QACommentTb.objects.get(qa_tb_id=qa_id)
                    if qa_comment_info.read == 0:
                        qa_comment_info.read = 1
                        qa_comment_info.save()
                except ObjectDoesNotExist:
                    qa_comment_info = None

        if error is not None:
            logger.error('[' + str(self.request.user.id) + ']' + str(error))
            messages.error(self.request, str(error))

        context['qa_info'] = qa_info
        context['qa_comment_info'] = qa_comment_info

        return context


# skkim Test페이지, 테스트 완료후 지울것 190316
class TestPageView(TemplateView):
    template_name = 'test_page.html'

    def get_context_data(self, **kwargs):
        context = super(TestPageView, self).get_context_data(**kwargs)
        return context


def check_alarm_program_notice_qa_comment(context, class_id, user_id):
    query = "select count(B.ID) from QA_COMMENT_TB as B where B.QA_TB_ID = `QA_TB`.`ID` and B.READ=0 and B.USE=1"

    member_ticket_num = ClassMemberTicketTb.objects.select_related(
        'member_ticket_tb__member',
        'member_ticket_tb__ticket_tb'
    ).filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, member_ticket_tb__member_id=user_id,
             member_ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
             member_ticket_tb__ticket_tb__state_cd=STATE_CD_IN_PROGRESS,
             member_ticket_tb__use=USE, member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW, use=USE
             ).count()

    to_member_type_cd = Q(to_member_type_cd=TO_ALL_TRAINEE)
    if member_ticket_num == 0:
        to_member_type_cd |= Q(to_member_type_cd=TO_END_TRAINEE)
    else:
        to_member_type_cd |= Q(to_member_type_cd=TO_ING_TRAINEE)

    context['check_qa_comment'] = QATb.objects.filter(
        member_id=user_id, status_type_cd='QA_COMPLETE',
        use=USE).annotate(qa_comment=RawSQL(query, [])).filter(qa_comment__gt=0).count()
    program_notice_count = ProgramNoticeTb.objects.filter(to_member_type_cd, class_tb_id=class_id, use=USE).count()
    program_notice_read_count = ProgramNoticeHistoryTb.objects.filter(class_tb_id=class_id,
                                                                      member_id=user_id,
                                                                      use=USE).count()

    context['check_program_notice'] = program_notice_count - program_notice_read_count

    today = datetime.date.today()
    seven_days_ago = today - datetime.timedelta(days=7)
    context['check_alarm'] = LogTb.objects.select_related('member_ticket_tb__member').filter(
        Q(member_ticket_tb__member_auth_cd=AUTH_TYPE_VIEW) | Q(auth_member_id=user_id),
        class_tb_id=class_id, member_ticket_tb__member_id=user_id, reg_dt__gte=seven_days_ago,
        member_read=0, use=USE).order_by('-reg_dt').count()
    context['check_np_member_ticket_counts'] = func_get_class_list(context, user_id)['np_member_ticket_counts']
