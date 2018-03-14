import datetime

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import InternalError
from django.db import transaction
from django.db import IntegrityError
from django.shortcuts import redirect, render

# Create your views here.
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import RedirectView
from django.views.generic import TemplateView
from django.views.generic.base import ContextMixin

from config.views import date_check_func, AccessTestMixin
from login.models import MemberTb, LogTb, HolidayTb
from trainee.models import LectureTb
from trainer.models import ClassTb, SettingTb
from schedule.models import ScheduleTb, DeleteScheduleTb, RepeatScheduleTb

from django.utils import timezone


class IndexView(LoginRequiredMixin, AccessTestMixin, RedirectView):
    # url = '/trainee/cal_month/'
    def get(self, request, **kwargs):

        lecture_data = LectureTb.objects.filter(member_id=self.request.user.id)
        self.url = '/trainee/cal_month/'

        if len(lecture_data) == 0:
            self.url = '/trainee/blank/'
        elif len(lecture_data) == 1:
            for lecture_info in lecture_data:
                if lecture_info.state_cd == 'NP':
                    self.url = '/trainee/lecture_select/'
                else:
                    self.request.session['lecture_id'] = lecture_info.lecture_id
        else:
            self.url = '/trainee/lecture_select/'

        return super(IndexView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(IndexView, self).get_redirect_url(*args, **kwargs)


class BlankView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(BlankView, self).get_context_data(**kwargs)
        return context


class LectureCheckView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainee_lecture_check.html'

    def get_context_data(self, **kwargs):
        context = super(LectureCheckView, self).get_context_data(**kwargs)
        error = None

        lecture_data = LectureTb.objects.filter(member_id=self.request.user.id)

        for lecture_info in lecture_data:
            class_info = None
            trainer_info = None
            try:
                class_info = ClassTb.objects.get(class_id=lecture_info.class_tb_id)
            except ObjectDoesNotExist:
                error = '강사 정보가 없습니다.'

            if error is None:
                try:
                    trainer_info = MemberTb.objects.get(member_id=class_info.member_id)
                except ObjectDoesNotExist:
                    error = '강사 회원정보가 없습니다.'

            if error is None:
                lecture_info.class_info = class_info
                lecture_info.trainer_info = trainer_info

        messages.error(self.request, error)

        context['lecture_data'] = lecture_data

        return context


class LectureSelectView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainee_lecture_select.html'

    def get_context_data(self, **kwargs):
        context = super(LectureSelectView, self).get_context_data(**kwargs)
        error = None

        lecture_data = LectureTb.objects.filter(member_id=self.request.user.id)

        for lecture_info in lecture_data:
            class_info = None
            trainer_info = None
            try:
                class_info = ClassTb.objects.get(class_id=lecture_info.class_tb_id)
            except ObjectDoesNotExist:
                error = '강사 정보가 없습니다.'

            if error is None:
                try:
                    trainer_info = MemberTb.objects.get(member_id=class_info.member_id)
                except ObjectDoesNotExist:
                    error = '강사 회원정보가 없습니다.'

            if error is None:
                lecture_info.class_info = class_info
                lecture_info.trainer_info = trainer_info

        messages.error(self.request, error)

        context['lecture_data'] = lecture_data

        return context


@csrf_exempt
def lecture_processing(request):

    lecture_id = request.POST.get('lecture_id', '')
    check = request.POST.get('check', '')
    next_page = request.POST.get('next_page')

    error = None
    lecture_info = None
    if lecture_id == '':
        error = '수강정보를 선택해 주세요.'

    if check == '':
        error = '수강정보를 선택해 주세요.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보가 존재하지 않습니다.'

    if error is None:
        if check == '1':
            repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_id)
            schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_id)
            repeat_schedule_data.delete()
            schedule_data.delete()
            lecture_info.delete()

        elif check == '0':
            lecture_info.state_cd = 'IP'
            lecture_info.save()
        elif check == '2':
            request.session['lecture_id'] = lecture_id

    if error is None:

        return redirect(next_page)
    else:
        messages.error(request, error)
    return redirect(next_page)


class WeekAddView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_week_trainee.html'

    def get_context_data(self, **kwargs):
        context = super(WeekAddView, self).get_context_data(**kwargs)
        error = None
        lecture_id = self.request.session.get('lecture_id', '')

        today = datetime.date.today()
        start_date = today - datetime.timedelta(days=46)
        end_date = today + datetime.timedelta(days=47)
        if lecture_id is None or '':
            error = '수강정보를 확인해 주세요.'
        if error is None:
            context = get_trainee_schedule_data_func(context, self.request.user.id, lecture_id, start_date, end_date)

        return context


class DayAddView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainee_add_pt.html'

    def get_context_data(self, **kwargs):
        context = super(DayAddView, self).get_context_data(**kwargs)

        return context


# trainee용 Month View
class CalMonthView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_month_trainee.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthView, self).get_context_data(**kwargs)
        error = None
        lecture_id = self.request.session.get('lecture_id', '')

        today = datetime.date.today()
        start_date = today - datetime.timedelta(days=46)
        end_date = today + datetime.timedelta(days=47)

        if lecture_id is None or '':
            error = '수강정보를 확인해 주세요.'

        if error is None:
            context = get_trainee_schedule_data_func(context, self.request.user.id, lecture_id, start_date, end_date)

            # 강사 setting 값 로드
            context = get_trainee_setting_data(context, self.request.user.id)
            self.request.session['setting_language'] = context['lt_lan_01']

        return context


class MyPageView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'mypage_trainee.html'

    def get_context_data(self, **kwargs):
        context = super(MyPageView, self).get_context_data(**kwargs)
        error = None
        lecture_id = self.request.session.get('lecture_id', '')

        today = datetime.date.today()
        start_date = today - datetime.timedelta(days=46)
        end_date = today + datetime.timedelta(days=47)

        if lecture_id is None or '':
            error = '수강정보를 확인해 주세요.'

        if error is None:
            context = get_trainee_schedule_data_func(context, self.request.user.id, lecture_id, start_date, end_date)

            # 강사 setting 값 로드
            context = get_trainee_setting_data(context, self.request.user.id)
            self.request.session['setting_language'] = context['lt_lan_01']

        return context


# pt 일정 삭제
@csrf_exempt
def pt_delete_logic(request):
    schedule_id = request.POST.get('schedule_id')
    next_page = request.POST.get('next_page')

    error = None
    lecture_info = None
    class_info = None
    schedule_info = None
    start_date = None
    end_date = None
    today = datetime.datetime.today()
    fifteen_days_after = today + datetime.timedelta(days=15)
    disable_time = timezone.now()
    nowtime = datetime.datetime.strptime(disable_time.strftime('%H:%M'), '%H:%M')
    lt_res_01 = None
    lt_res_02 = None
    lt_res_03 = None

    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보가 정보가 존재하지 않습니다.'

    if error is None:
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt
        if start_date < timezone.now():  # 강사 설정 시간으로 변경필요
            error = '이미 지난 일정입니다.'

    if error is None:
        if start_date >= fifteen_days_after:
            error = '입력할 수 없는 날짜입니다.'

    if error is None:
        if schedule_info.state_cd == 'PE':
            error = '이미 종료된 일정입니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=schedule_info.lecture_tb_id, use=1)
        except ObjectDoesNotExist:
            error = '회원 PT 정보가 존재하지 않습니다.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=lecture_info.class_tb_id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'

    if error is None:
        if lecture_info.member_id != str(request.user.id):
            error = '회원 정보가 일치하지 않습니다.'

    if error is None:
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, setting_type_cd='LT_RES_01', use=1)
            lt_res_01 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_01 = '00:00-23:59'
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, setting_type_cd='LT_RES_02', use=1)
            lt_res_02 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_02 = '0'
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, setting_type_cd='LT_RES_03', use=1)
            lt_res_03 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_03 = '0'

    reserve_avail_start_time = datetime.datetime.strptime(lt_res_01.split('-')[0], '%H:%M')
    reserve_avail_end_time = datetime.datetime.strptime(lt_res_01.split('-')[1], '%H:%M')

    reserve_prohibition_time = lt_res_02
    reserve_stop = lt_res_03

    if error is None:
        if lecture_info.member_id != str(request.user.id):
            error = '회원 정보가 일치하지 않습니다.'

    if reserve_prohibition_time != '':
        disable_time = disable_time + datetime.timedelta(hours=int(reserve_prohibition_time))

    if reserve_stop == '1':
        error = '강사 설정에 의해 현재 예약이 일시 정지 되어있습니다.'

    if error is None:
        if nowtime < reserve_avail_start_time:
            error = '현재는 삭제할수 없는 시간입니다.'
        if nowtime > reserve_avail_end_time:
            error = '현재는 삭제할수 없는 시간입니다.'

    if error is None:
        if start_date >= fifteen_days_after:
            error = '삭제할 수 없는 날짜입니다.'

    if error is None:
        if start_date < disable_time:
            error = '삭제할 수 없는 일정입니다.'
    if error is None:
        try:
            with transaction.atomic():

                delete_schedule = DeleteScheduleTb(schedule_id=schedule_info.schedule_id,
                                                   class_tb_id=schedule_info.class_tb_id,
                                                   lecture_tb_id=schedule_info.lecture_tb_id,
                                                   delete_repeat_schedule_tb=schedule_info.repeat_schedule_tb_id,
                                                   start_dt=schedule_info.start_dt, end_dt=schedule_info.end_dt,
                                                   state_cd=schedule_info.state_cd, en_dis_type=schedule_info.en_dis_type,
                                                   reg_dt=schedule_info.reg_dt, mod_dt=timezone.now(), use=0)

                delete_schedule.save()
                schedule_info.delete()

                lecture_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=schedule_info.lecture_tb_id)
                if lecture_info.lecture_reg_count >= len(lecture_schedule_data):
                    lecture_info.lecture_avail_count = lecture_info.lecture_reg_count \
                                                              - len(lecture_schedule_data)
                else:
                    error = '예약 가능한 횟수를 확인해주세요.'
                    raise ValidationError()

                #진행 완료된 일정을 삭제하는경우 예약가능 횟수 및 남은 횟수 증가
                if schedule_info.state_cd == 'PE':
                    lecture_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=schedule_info.lecture_tb_id,
                                                                      state_cd='PE')
                    if lecture_info.lecture_reg_count >= len(lecture_schedule_data):
                        lecture_info.lecture_rem_count = lecture_info.lecture_reg_count \
                                                           - len(lecture_schedule_data)

                    else:
                        error = '예약 가능한 횟수를 확인해주세요.'
                        raise ValidationError()

                lecture_info.mod_dt = timezone.now()
                lecture_info.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값의 형태에 문제가 있습니다.'
        except IntegrityError:
            error = '이미 삭제된 일정입니다.'
        except InternalError:
            error = '이미 삭제된 일정입니다.'
        except ValidationError as e:
            error = '예약 가능한 횟수를 확인해주세요.'

    if error is None:
        class_info.schedule_check = 1
        class_info.save()
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        log_start_date = start_date.strftime('%Y')+'년 ' \
                         + start_date.strftime('%m')+'월 ' \
                         + start_date.strftime('%d')+'일 ' \
                         + week_info[int(start_date.strftime('%w'))] + '요일 '
        if start_date.strftime('%p') == 'AM':
            log_start_date = str(log_start_date) + '오전'
        elif start_date.strftime('%p') == 'PM':
            log_start_date = str(log_start_date) + '오후'
        log_start_date = str(log_start_date) + start_date.strftime(' %I:%M')

        if end_date.strftime('%p') == 'AM':
            log_end_date = '오전'
        elif end_date.strftime('%p') == 'PM':
            log_end_date = '오후'

        log_end_date = str(log_end_date) + end_date.strftime(' %I:%M')
        log_contents = '<span>' + request.user.first_name \
                       + ' 회원님께서</span> 일정을 <span class="status">삭제</span>했습니다.@'\
                       + log_start_date\
                       + ' - '+log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LS02', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.error(request, error)
        next_page = 'trainee:cal_month'
        return redirect(next_page)


# pt 일정 추가
@csrf_exempt
def pt_add_logic(request):
    lecture_id = request.POST.get('lecture_id', '')
    training_date = request.POST.get('training_date', '')
    time_duration = request.POST.get('time_duration', '')
    training_time = request.POST.get('training_time', '')
    next_page = request.POST.get('next_page')

    error = None
    lecture_info = None
    class_info = None
    start_date = None
    end_date = None
    today = datetime.datetime.today()
    fifteen_days_after = today + datetime.timedelta(days=15)
    disable_time = timezone.now()
    nowtime = datetime.datetime.strptime(disable_time.strftime('%H:%M'), '%H:%M')

    lt_res_01 = None
    lt_res_02 = None
    lt_res_03 = None

    if lecture_id == '':
        error = '수강정보를 확인해주세요.'
    elif training_date == '':
        error = '날짜를 선택해 주세요.'
    elif time_duration == '':
        error = '진행 시간을 선택해 주세요.'
    elif training_time == '':
        error = '시작 시간을 선택해 주세요.'

    if error is None:
        if int(time_duration) > 1:
            error = '진행 시간은 1시간만 선택 가능합니다.'

    if error is None:

        start_date = datetime.datetime.strptime(training_date+' '+training_time, '%Y-%m-%d %H:%M:%S.%f')
        end_date = start_date + datetime.timedelta(hours=int(time_duration))

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(member_id=request.user.id, lecture_id=lecture_id, use=1)
        except ObjectDoesNotExist:
            error = 'lecture가 존재하지 않습니다.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=lecture_info.class_tb_id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'

    if error is None:
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, setting_type_cd='LT_RES_01', use=1)
            lt_res_01 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_01 = '00:00-23:59'

        reserve_avail_start_time = datetime.datetime.strptime(lt_res_01.split('-')[0], '%H:%M')
        reserve_avail_end_time = datetime.datetime.strptime(lt_res_01.split('-')[1], '%H:%M')
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, setting_type_cd='LT_RES_02', use=1)
            lt_res_02 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_02 = '0'
        reserve_prohibition_time = lt_res_02
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, setting_type_cd='LT_RES_03', use=1)
            lt_res_03 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_03 = '0'
        reserve_stop = lt_res_03

    if error is None:
        if lecture_info.member_id != str(request.user.id):
            error = '회원 정보가 일치하지 않습니다.'

    if reserve_prohibition_time != '':
        disable_time = disable_time + datetime.timedelta(hours=int(reserve_prohibition_time))

    if reserve_stop == '1':
        error = '강사 설정에 의해 현재 예약이 일시 정지 되어있습니다.'

    if error is None:
        if nowtime < reserve_avail_start_time:
            error = '현재는 입력할수 없는 시간입니다.'
        if nowtime > reserve_avail_end_time:
            error = '현재는 입력할수 없는 시간입니다.'

    if error is None:
        if start_date >= fifteen_days_after:
            error = '입력할 수 없는 날짜입니다.'

    if error is None:
        if start_date < disable_time:
            error = '입력할 수 없는 일정입니다.'

    if error is None:
        error = pt_add_logic_func(training_date, time_duration, training_time, request.user.id, request.user.first_name, lecture_id)

    if error is None:
        class_info.schedule_check = 1
        class_info.save()
        return redirect(next_page)
    else:
        messages.error(request, error)
        return redirect(next_page)


# pt 일정 추가
@csrf_exempt
def pt_add_array_logic(request):
    lecture_id = request.POST.get('lecture_id')
    add_pt_size = request.POST.get('add_pt_size')
    training_date = request.POST.getlist('training_date[]')
    time_duration = request.POST.getlist('time_duration[]')
    training_time = request.POST.getlist('training_time[]')
    next_page = request.POST.get('next_page')

    error = None

    if int(add_pt_size) == 0:
        error = 'pt 일정을 선택하세요.'

    for i in range(0, int(add_pt_size)):
        error = pt_add_logic_func(training_date[i], time_duration[i], training_time[i],
                                  request.user.id, request.user.first_name, lecture_id)

    if error is None:

        return redirect(next_page)
    else:
        messages.error(request, error)
        return redirect(next_page)


def pt_add_logic_func(pt_schedule_date, pt_schedule_time_duration, pt_schedule_time, user_id, user_name, lecture_id):

    error = None
    lecture_info = None
    class_info = None
    today = datetime.datetime.today()
    fifteen_days_after = today + datetime.timedelta(days=15)


    if pt_schedule_date == '':
        error = '날짜를 선택해 주세요.'
    elif pt_schedule_time_duration == '':
        error = '진행 시간을 선택해 주세요.'
    elif pt_schedule_time == '':
        error = '시작 시간을 선택해 주세요.'

    if error is None:

        start_date = datetime.datetime.strptime(pt_schedule_date+' '+pt_schedule_time, '%Y-%m-%d %H:%M:%S.%f')
        end_date = start_date + datetime.timedelta(hours=int(pt_schedule_time_duration))

        try:
            lecture_info = LectureTb.objects.get(member_id=user_id,lecture_id=lecture_id, use=1)
        except ObjectDoesNotExist:
            error = 'lecture가 존재하지 않습니다.'

    seven_days_ago = start_date - datetime.timedelta(days=7)
    seven_days_after = end_date + datetime.timedelta(days=7)

    if error is None:
        if start_date >= fifteen_days_after:
            error = '입력할 수 없는 날짜입니다.'

    if error is None:
        if start_date < timezone.now():
            error = '입력할 수 없는 날짜입니다.'

    if error is None:
        if lecture_info.member_id != str(user_id):
            error = '회원 정보가 일치하지 않습니다.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=lecture_info.class_tb_id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'

    if error is None:
        if lecture_info.lecture_avail_count == 0:
            error = '예약 가능한 횟수가 없습니다'

    if error is None:
        try:
            with transaction.atomic():
                lecture_schedule_data = ScheduleTb(class_tb_id=class_info.class_id, lecture_tb_id=lecture_info.lecture_id,
                                                   start_dt=start_date, end_dt=end_date,
                                                   state_cd='NP', en_dis_type='1',
                                                   reg_dt=timezone.now(), mod_dt=timezone.now())
                lecture_schedule_data.save()

                schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
                if lecture_info.lecture_reg_count >= len(schedule_data):
                    lecture_info.lecture_avail_count = lecture_info.lecture_reg_count \
                                                              - len(schedule_data)
                    lecture_info.mod_dt = timezone.now()
                    lecture_info.save()

                else:
                    error = '예약 가능한 횟수를 확인해주세요.'
                    # add_schedule_info.delete()
                    raise ValidationError()

        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '날짜가 중복됐습니다.'
        except InternalError:
            error = '예약 가능한 횟수를 확인해주세요.'
        except ValidationError:
            error = '예약 가능한 횟수를 확인해주세요.'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                  start_dt__gte=seven_days_ago, end_dt__lte=seven_days_after).exclude(schedule_id=lecture_schedule_data.schedule_id)
        for schedule_datum in schedule_data:
            error = date_check_func(pt_schedule_date, start_date, end_date,
                                    schedule_datum.start_dt, schedule_datum.end_dt)
            if error is not None:
                break
    if error is not None:
        lecture_schedule_data.delete()
        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=int(lecture_id))
        if lecture_info.lecture_reg_count >= len(schedule_data):
            lecture_info.lecture_avail_count = lecture_info.lecture_reg_count \
                                                      - len(schedule_data)
            lecture_info.mod_dt = timezone.now()
            lecture_info.save()

        else:
            error = '예약 가능한 횟수를 확인해주세요.'

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        log_start_date = start_date.strftime('%Y')+'년 ' \
                         + start_date.strftime('%m')+'월 ' \
                         + start_date.strftime('%d')+'일 ' \
                         + week_info[int(start_date.strftime('%w'))] + '요일 '
        if start_date.strftime('%p') == 'AM':
            log_start_date = str(log_start_date) + '오전'
        elif start_date.strftime('%p') == 'PM':
            log_start_date = str(log_start_date) + '오후'
        log_start_date = str(log_start_date) + start_date.strftime(' %I:%M')

        if end_date.strftime('%p') == 'AM':
            log_end_date = '오전'
        elif end_date.strftime('%p') == 'PM':
            log_end_date = '오후'

        log_end_date = str(log_end_date) + end_date.strftime(' %I:%M')
        log_contents = '<span>'+user_name + ' 회원님께서 ' \
                       + '</span> 일정을 <span class="status">등록</span>했습니다.@'\
                       + log_start_date\
                       + ' - '+log_end_date
        log_data = LogTb(external_id=user_id, log_type='LS01', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()

    else:
        return error


def get_trainee_repeat_schedule_data_func(context, trainer_id, member_id):

    error = None
    class_info = None

    pt_repeat_schedule_id = []
    pt_repeat_schedule_type = []
    pt_repeat_schedule_week_info = []
    pt_repeat_schedule_start_date = []
    pt_repeat_schedule_end_date = []
    pt_repeat_schedule_start_time = []
    pt_repeat_schedule_time_duration = []
    lecture_list = None

    # 강좌 정보 가져오기
    try:
        class_info = ClassTb.objects.get(member_id=trainer_id)
    except ObjectDoesNotExist:
        error = '강사 정보가 존재하지 않습니다'

    # 수강 정보 불러 오기
    if error is None:
        if member_id is None or '':
            lecture_list = LectureTb.objects.filter(class_tb_id=class_info.class_id, state_cd='IP',
                                                    lecture_rem_count__gt=0, use=1)
            lecture_list |= LectureTb.objects.filter(class_tb_id=class_info.class_id, state_cd='NP',
                                                    lecture_rem_count__gt=0, use=1)
        else:
            lecture_list = LectureTb.objects.filter(class_tb_id=class_info.class_id, member_id=member_id,
                                                    lecture_rem_count__gt=0,
                                                    state_cd='IP', use=1)
            lecture_list |= LectureTb.objects.filter(class_tb_id=class_info.class_id, member_id=member_id,
                                                     state_cd='NP',
                                                    lecture_rem_count__gt=0, use=1)

    if error is None:
        # 강사 클래스의 반복일정 불러오기
        pt_repeat_schedule_data = RepeatScheduleTb

        for idx, lecture_info in enumerate(lecture_list):
            if idx == 0:
                pt_repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                          en_dis_type='1')
            else:
                pt_repeat_schedule_data |= RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                           en_dis_type='1')
        for pt_repeat_schedule_info in pt_repeat_schedule_data:
            pt_repeat_schedule_id.append(pt_repeat_schedule_info.repeat_schedule_id)
            pt_repeat_schedule_type.append(pt_repeat_schedule_info.repeat_type_cd)
            pt_repeat_schedule_week_info.append(pt_repeat_schedule_info.week_info)
            pt_repeat_schedule_start_date.append(str(pt_repeat_schedule_info.start_date))
            pt_repeat_schedule_end_date.append(str(pt_repeat_schedule_info.end_date))
            pt_repeat_schedule_start_time.append(pt_repeat_schedule_info.start_time)
            pt_repeat_schedule_time_duration.append(pt_repeat_schedule_info.time_duration)

    context['pt_repeat_schedule_id_data'] = pt_repeat_schedule_id
    context['pt_repeat_schedule_type_data'] = pt_repeat_schedule_type
    context['pt_repeat_schedule_week_info_data'] = pt_repeat_schedule_week_info
    context['pt_repeat_schedule_start_date_data'] = pt_repeat_schedule_start_date
    context['pt_repeat_schedule_end_date_data'] = pt_repeat_schedule_end_date
    context['pt_repeat_schedule_start_time_data'] = pt_repeat_schedule_start_time
    context['pt_repeat_schedule_time_duration_data'] = pt_repeat_schedule_time_duration

    return context


def get_trainer_setting_data(context, user_id):

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, setting_type_cd='LT_RES_01')
        lt_res_01 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_01 = ''

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, setting_type_cd='LT_RES_02')
        lt_res_02 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_02 = ''

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, setting_type_cd='LT_RES_03')
        lt_res_03 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_03 = ''

    context['lt_res_01'] = lt_res_01
    context['lt_res_02'] = lt_res_02
    context['lt_res_03'] = lt_res_03
    return context


def get_trainee_setting_data(context, user_id):

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, setting_type_cd='LT_LAN_01')
        lt_lan_01 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_lan_01 = 'KOR'

    context['lt_lan_01'] = lt_lan_01
    return context


@method_decorator(csrf_exempt, name='dispatch')
class ReadTraineeScheduleViewAjax(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'trainee_schedule_ajax.html'

    def get(self, request, *args, **kwargs):
        context = super(ReadTraineeScheduleViewAjax, self).get_context_data(**kwargs)
        date = request.session.get('date', '')
        day = request.session.get('day', '')
        lecture_id = self.request.session.get('lecture_id', '')
        today = datetime.date.today()
        if date != '':
            today = datetime.datetime.strptime(date, '%Y-%m-%d')
        if day == '':
            day = 46
        start_date = today - datetime.timedelta(days=int(day))
        end_date = today + datetime.timedelta(days=int(47))

        context = get_trainee_schedule_data_func(context, self.request.user.id, lecture_id, start_date, end_date)

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        date = request.POST.get('date', '')
        day = request.POST.get('day', '')
        lecture_id = self.request.session.get('lecture_id', '')
        today = datetime.date.today()
        if date != '':
            today = datetime.datetime.strptime(date, '%Y-%m-%d')
        if day == '':
            day = 18

        start_date = today - datetime.timedelta(days=int(day))
        end_date = today + datetime.timedelta(days=int(day)+1)

        context = super(ReadTraineeScheduleViewAjax, self).get_context_data(**kwargs)
        context = get_trainee_schedule_data_func(context, self.request.user.id, lecture_id, start_date, end_date)

        return render(request, self.template_name, context)


def get_trainee_schedule_data_func(context, user_id, lecture_id, start_date, end_date):
    error = None
    class_info = None
    lecture_info = None

    month_data = []
    lecture_schedule_data = []
    daily_lecture_data_start_date = []
    daily_lecture_data_end_date = []
    daily_lecture_data_member = []
    daily_off_data_start_date = []
    daily_off_data_end_date = []
    pt_schedule_finish_check = []

    pt_repeat_schedule_id = []
    pt_repeat_schedule_type = []
    pt_repeat_schedule_week_info = []
    pt_repeat_schedule_start_date = []
    pt_repeat_schedule_end_date = []
    pt_repeat_schedule_start_time = []
    pt_repeat_schedule_time_duration = []

    today = datetime.date.today()
    now = timezone.now()
    # fourteen_days_ago = today - datetime.timedelta(days=14)
    # fifteen_days_after = today + datetime.timedelta(days=15)
    next_schedule_start_dt = ''
    next_schedule_end_dt = ''

    if lecture_id is None or '':
        error = '수강 정보가 없습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(member_id=user_id, lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = 'lecture가 존재하지 않습니다.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=lecture_info.class_tb_id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'

    if error is None:
        try:
            class_info.mem_info = MemberTb.objects.get(member_id=class_info.member_id)
        except ObjectDoesNotExist:
            error = '강사 정보가 존재하지 않습니다.'


    # 강사 setting 값 로드
    if error is None:
        context = get_trainer_setting_data(context, class_info.member_id)

    if error is None:
        member_data = MemberTb.objects.get(member_id=lecture_info.member_id)
        pt_repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb=lecture_info.lecture_id, en_dis_type='1')
        schedule_data = ScheduleTb.objects.filter(lecture_tb=lecture_info.lecture_id,
                                                  en_dis_type='1')
        for schedule_info in schedule_data:
            schedule_info.data = schedule_info.start_dt.timetuple()
            month_data.append(str(schedule_info.data.tm_year) + '_' + str(schedule_info.data.tm_mon) + '_'
                              + str(schedule_info.data.tm_mday))
            lecture_schedule_data.append(schedule_info.schedule_id)
            daily_lecture_data_start_date.append(schedule_info.start_dt)
            if schedule_info.start_dt > now:
                if next_schedule_start_dt is '':
                    next_schedule_start_dt = schedule_info.start_dt
                    next_schedule_end_dt = schedule_info.end_dt
                elif next_schedule_start_dt > schedule_info.start_dt:
                    next_schedule_start_dt = schedule_info.start_dt
                    next_schedule_end_dt = schedule_info.end_dt

            daily_lecture_data_end_date.append(schedule_info.end_dt)
            daily_lecture_data_member.append(member_data.name)
            if schedule_info.state_cd == 'PE':
                pt_schedule_finish_check.append(1)
            else:
                pt_schedule_finish_check.append(0)

        for pt_repeat_schedule_info in pt_repeat_schedule_data:
            pt_repeat_schedule_id.append(pt_repeat_schedule_info.repeat_schedule_id)
            pt_repeat_schedule_type.append(pt_repeat_schedule_info.repeat_type_cd)
            pt_repeat_schedule_week_info.append(pt_repeat_schedule_info.week_info)
            pt_repeat_schedule_start_date.append(str(pt_repeat_schedule_info.start_date))
            pt_repeat_schedule_end_date.append(str(pt_repeat_schedule_info.end_date))
            pt_repeat_schedule_start_time.append(pt_repeat_schedule_info.start_time)
            pt_repeat_schedule_time_duration.append(pt_repeat_schedule_info.time_duration)

    if error is None:

        class_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                        start_dt__gte=start_date,
                                                        start_dt__lt=end_date)
        for class_schedule_datum in class_schedule_data:
            daily_off_data_start_date.append(class_schedule_datum.start_dt)
            daily_off_data_end_date.append(class_schedule_datum.end_dt)

    holiday = HolidayTb.objects.filter(use=1)

    context['month_lecture_data'] = month_data
    context['daily_lecture_schedule_id'] = lecture_schedule_data
    context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
    context['daily_lecture_data_end_date'] = daily_lecture_data_end_date
    context['daily_lecture_data_member'] = daily_lecture_data_member
    context['pt_schedule_finish_check'] = pt_schedule_finish_check
    context['daily_off_data_start_date'] = daily_off_data_start_date
    context['daily_off_data_end_date'] = daily_off_data_end_date

    context['pt_repeat_schedule_id_data'] = pt_repeat_schedule_id
    context['pt_repeat_schedule_type_data'] = pt_repeat_schedule_type
    context['pt_repeat_schedule_week_info_data'] = pt_repeat_schedule_week_info
    context['pt_repeat_schedule_start_date_data'] = pt_repeat_schedule_start_date
    context['pt_repeat_schedule_end_date_data'] = pt_repeat_schedule_end_date
    context['pt_repeat_schedule_start_time_data'] = pt_repeat_schedule_start_time
    context['pt_repeat_schedule_time_duration_data'] = pt_repeat_schedule_time_duration

    context['next_schedule_start_dt'] = next_schedule_start_dt
    context['next_schedule_end_dt'] = next_schedule_end_dt
    context['lecture_info'] = lecture_info
    context['class_info'] = class_info
    context['lecture_finish_count'] = lecture_info.lecture_reg_count - lecture_info.lecture_rem_count
    context['holiday'] = holiday

    return context


