import datetime

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.db import IntegrityError
from django.shortcuts import redirect

# Create your views here.
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import RedirectView
from django.views.generic import TemplateView

from config.views import date_check_func, AccessTestMixin
from login.models import MemberTb, LogTb, HolidayTb
from trainee.models import LectureTb
from trainer.models import ClassTb
from schedule.models import ScheduleTb, DeleteScheduleTb

from django.utils import timezone


class IndexView(LoginRequiredMixin, AccessTestMixin, RedirectView):
    url = '/trainee/cal_month/'

    def get_redirect_url(self, *args, **kwargs):
        return super(IndexView, self).get_redirect_url(*args, **kwargs)


class WeekAddView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_week_trainee.html'

    def get_context_data(self, **kwargs):
        context = super(WeekAddView, self).get_context_data(**kwargs)
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
        today = datetime.date.today()
        fourteen_days_ago = today - datetime.timedelta(days=14)
        fifteen_days_after = today + datetime.timedelta(days=15)

        try:
            lecture_info = LectureTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'lecture가 존재하지 않습니다.'

        if error is None:
            try:
                class_info = ClassTb.objects.get(class_id=lecture_info.class_tb_id)
            except ObjectDoesNotExist:
                error = 'class가 존재하지 않습니다'

        if error is None:
            try:
                member_data = MemberTb.objects.get(member_id=lecture_info.member_id)
            except ObjectDoesNotExist:
                error = 'Member가 존재하지 않습니다'

        if error is None:
            schedule_data = ScheduleTb.objects.filter(lecture_tb=lecture_info.lecture_id,
                                                      en_dis_type='1')
            for schedule_datum in schedule_data:
                schedule_datum.data = schedule_datum.start_dt.timetuple()
                month_data.append(str(schedule_datum.data.tm_year)+'_'+str(schedule_datum.data.tm_mon)+'_'
                                  + str(schedule_datum.data.tm_mday))
                lecture_schedule_data.append(schedule_datum.schedule_id)
                daily_lecture_data_start_date.append(schedule_datum.start_dt)
                daily_lecture_data_end_date.append(schedule_datum.end_dt)
                daily_lecture_data_member.append(member_data.name)

        if error is None:

            class_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                         start_dt__gte=fourteen_days_ago,
                                                         start_dt__lt=fifteen_days_after)
            for class_schedule_datum in class_schedule_data:
                daily_off_data_start_date.append(class_schedule_datum.start_dt)
                daily_off_data_end_date.append(class_schedule_datum.end_dt)

        context['month_lecture_data'] = month_data
        context['daily_lecture_schedule_id'] = lecture_schedule_data
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date
        context['daily_lecture_data_member'] = daily_lecture_data_member
        context['daily_off_data_start_date'] = daily_off_data_start_date
        context['daily_off_data_end_date'] = daily_off_data_end_date
        context['lecture_avail_count'] = lecture_info.lecture_avail_count

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
        class_info = None
        lecture_info = None

        month_data = []
        lecture_schedule_data = []
        daily_lecture_data_start_date = []
        daily_lecture_data_end_date = []
        daily_lecture_data_member = []
        daily_off_data_start_date = []
        daily_off_data_end_date = []
        today = datetime.date.today()
        fourteen_days_ago = today - datetime.timedelta(days=14)
        fifteen_days_after = today + datetime.timedelta(days=15)

        try:
            lecture_info = LectureTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'lecture가 존재하지 않습니다.'

        if error is None:
            try:
                class_info = ClassTb.objects.get(class_id=lecture_info.class_tb_id)
            except ObjectDoesNotExist:
                error = 'class가 존재하지 않습니다'

        if error is None:
            member_data = MemberTb.objects.get(member_id=lecture_info.member_id)
            schedule_data = ScheduleTb.objects.filter(lecture_tb=lecture_info.lecture_id,
                                                      en_dis_type='1')
            for schedule_datum in schedule_data:
                schedule_datum.data = schedule_datum.start_dt.timetuple()
                month_data.append(str(schedule_datum.data.tm_year)+'_'+str(schedule_datum.data.tm_mon)+'_'
                                  + str(schedule_datum.data.tm_mday))
                lecture_schedule_data.append(schedule_datum.schedule_id)
                daily_lecture_data_start_date.append(schedule_datum.start_dt)
                daily_lecture_data_end_date.append(schedule_datum.end_dt)
                daily_lecture_data_member.append(member_data.name)

        if error is None:

            class_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                            start_dt__gte=fourteen_days_ago,
                                                         start_dt__lt=fifteen_days_after)
            for class_schedule_datum in class_schedule_data:
                daily_off_data_start_date.append(class_schedule_datum.start_dt)
                daily_off_data_end_date.append(class_schedule_datum.end_dt)

        holiday = HolidayTb.objects.filter(use='1')

        context['month_lecture_data'] = month_data
        context['daily_lecture_schedule_id'] = lecture_schedule_data
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date
        context['daily_lecture_data_member'] = daily_lecture_data_member
        context['daily_off_data_start_date'] = daily_off_data_start_date
        context['daily_off_data_end_date'] = daily_off_data_end_date
        context['lecture_avail_count'] = lecture_info.lecture_avail_count
        context['holiday'] = holiday

        return context


class MyPageView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'mypage_trainee.html'

    def get_context_data(self, **kwargs):
        context = super(MyPageView, self).get_context_data(**kwargs)
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
        today = datetime.date.today()
        fourteen_days_ago = today - datetime.timedelta(days=14)
        fifteen_days_after = today + datetime.timedelta(days=15)

        try:
            lecture_info = LectureTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'lecture가 존재하지 않습니다.'

        if error is None:
            try:
                class_info = ClassTb.objects.get(class_id=lecture_info.class_tb_id)
            except ObjectDoesNotExist:
                error = 'class가 존재하지 않습니다'

        if error is None:
            member_data = MemberTb.objects.get(member_id=lecture_info.member_id)
            schedule_data = ScheduleTb.objects.filter(lecture_tb=lecture_info.lecture_id, en_dis_type='1')
            for schedule_datum in schedule_data:
                schedule_datum.data = schedule_datum.start_dt.timetuple()
                month_data.append(str(schedule_datum.data.tm_year)+'_'+str(schedule_datum.data.tm_mon)+'_'
                                  + str(schedule_datum.data.tm_mday))
                lecture_schedule_data.append(schedule_datum.schedule_id)
                daily_lecture_data_start_date.append(schedule_datum.start_dt)
                daily_lecture_data_end_date.append(schedule_datum.end_dt)
                daily_lecture_data_member.append(member_data.name)

        if error is None:

            class_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                            start_dt__gte=fourteen_days_ago,
                                                            start_dt__lt=fifteen_days_after)
            for class_schedule_datum in class_schedule_data:
                daily_off_data_start_date.append(class_schedule_datum.start_dt)
                daily_off_data_end_date.append(class_schedule_datum.end_dt)

        holiday = HolidayTb.objects.filter(use='1')

        context['month_lecture_data'] = month_data
        context['daily_lecture_schedule_id'] = lecture_schedule_data
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date
        context['daily_lecture_data_member'] = daily_lecture_data_member
        context['daily_off_data_start_date'] = daily_off_data_start_date
        context['daily_off_data_end_date'] = daily_off_data_end_date
        context['lecture_reg_count'] = lecture_info.lecture_reg_count
        context['holiday'] = holiday

        return context


# pt 일정 삭제
@csrf_exempt
def pt_delete_logic(request):
    schedule_id = request.POST.get('schedule_id')
    next_page = request.POST.get('next_page')

    error = None
    lecture_info = None
    schedule_datum = None

    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:
        try:
            schedule_datum = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보가 정보가 존재하지 않습니다.'

    if error is None:
        start_date = schedule_datum.start_dt
        end_date = schedule_datum.end_dt
        if start_date < timezone.now():
            error = '이미 지난 일정입니다.'

    if error is None:
        if schedule_datum.state_cd == 'PE':
            error = '이미 종료된 일정입니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=schedule_datum.lecture_tb_id)
        except ObjectDoesNotExist:
            error = '회원 PT 정보가 존재하지 않습니다.'

    if error is None:
        if lecture_info.member_id != str(request.user.id):
            error = '회원 정보가 일치하지 않습니다.'

    if error is None:
        with transaction.atomic():

            delete_schedule = DeleteScheduleTb(schedule_id=schedule_datum.schedule_id,
                                               class_tb_id=schedule_datum.class_tb_id,
                                               lecture_tb_id=schedule_datum.lecture_tb_id,
                                               start_dt=schedule_datum.start_dt, end_dt=schedule_datum.end_dt,
                                               state_cd=schedule_datum.state_cd, en_dis_type=schedule_datum.en_dis_type,
                                               reg_dt=schedule_datum.reg_dt, mod_dt=timezone.now(), use=0)

            delete_schedule.save()
            schedule_datum.delete()

            lecture_info.lecture_avail_count += 1
            lecture_info.mod_dt = timezone.now()
            lecture_info.save()

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
        log_contents = '<span>' + request.user.first_name \
                       + ' 회원님께서</span> 일정을 <span class="status">삭제</span>했습니다.@'\
                       + log_start_date\
                       + ' - '+log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LS02', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        next_page = 'trainer:cal_month'
        return redirect(next_page)


# pt 일정 추가
@csrf_exempt
def pt_add_logic(request):
    training_date = request.POST.get('training_date')
    time_duration = request.POST.get('time_duration')
    training_time = request.POST.get('training_time')
    next_page = request.POST.get('next_page')

    error = None

    if training_date == '':
        error = '날짜를 선택해 주세요.'
    elif time_duration == '':
        error = '진행 시간을 선택해 주세요.'
    elif training_time == '':
        error = '시작 시간을 선택해 주세요.'

    if error is None:
        error = pt_add_logic_func(training_date, time_duration, training_time, request.user.id, request.user.first_name)

    if error is None:
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


# pt 일정 추가
@csrf_exempt
def pt_add_array_logic(request):
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
                                  request.user.id, request.user.first_name)

    if error is None:

        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


def pt_add_logic_func(pt_schedule_date, pt_schedule_time_duration, pt_schedule_time, user_id, user_name):

    error = None
    lecture_info = None
    class_info = None

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
            lecture_info = LectureTb.objects.get(member_id=user_id)
        except ObjectDoesNotExist:
            error = 'lecture가 존재하지 않습니다.'

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
        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id)

        for schedule_datum in schedule_data:
            error = date_check_func(pt_schedule_date, start_date, end_date,
                                    schedule_datum.start_dt, schedule_datum.end_dt)
            if error is not None:
                break

    if error is None:
        with transaction.atomic():
            lecture_schedule_data = ScheduleTb(class_tb_id=class_info.class_id, lecture_tb_id=lecture_info.lecture_id,
                                               start_dt=start_date, end_dt=end_date,
                                               state_cd='NP', en_dis_type='1',
                                               reg_dt=timezone.now(), mod_dt=timezone.now())
            lecture_schedule_data.save()
            lecture_info.lecture_avail_count -= 1
            lecture_info.mod_dt = timezone.now()
            lecture_info.save()

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


