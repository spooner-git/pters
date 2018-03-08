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
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import RedirectView
from django.views.generic import TemplateView
from django.views.generic.base import ContextMixin, View

from config.views import date_check_func, AccessTestMixin
from login.models import MemberTb, LogTb, HolidayTb
from trainee.models import LectureTb
from trainer.models import ClassTb
from schedule.models import ScheduleTb, DeleteScheduleTb, RepeatScheduleTb

from django.utils import timezone


class IndexView(LoginRequiredMixin, AccessTestMixin, RedirectView):
    # url = '/trainee/cal_month/'
    def get(self, request, **kwargs):
        error = None
        lecture_info = None
        try:
            lecture_info = LectureTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'lecture가 존재하지 않습니다.'

        if error is None:
            self.url = '/trainee/cal_month/'
        else:
            self.url = '/trainee/blank/'
        return super(IndexView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(IndexView, self).get_redirect_url(*args, **kwargs)


class BlankView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(BlankView, self).get_context_data(**kwargs)
        return context


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
    schedule_info = None
    today = datetime.date.today()
    fifteen_days_after = today + datetime.timedelta(days=15)

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
            lecture_info = LectureTb.objects.get(lecture_id=schedule_info.lecture_tb_id, use='1')
        except ObjectDoesNotExist:
            error = '회원 PT 정보가 존재하지 않습니다.'

    if error is None:
        if lecture_info.member_id != str(request.user.id):
            error = '회원 정보가 일치하지 않습니다.'

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
        messages.error(request, error)
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
        messages.error(request, error)
        return redirect(next_page)


def pt_add_logic_func(pt_schedule_date, pt_schedule_time_duration, pt_schedule_time, user_id, user_name):

    error = None
    lecture_info = None
    class_info = None
    today = datetime.date.today()
    fourteen_days_ago = today - datetime.timedelta(days=14)
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
            lecture_info = LectureTb.objects.get(member_id=user_id, use='1')
        except ObjectDoesNotExist:
            error = 'lecture가 존재하지 않습니다.'

    if error is None:
        if start_date >= fifteen_days_after:
            error = '입력할 수 없는 날짜입니다.'

    if error is None:
        if start_date < fourteen_days_ago:
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
        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id)

        for schedule_datum in schedule_data:
            error = date_check_func(pt_schedule_date, start_date, end_date,
                                    schedule_datum.start_dt, schedule_datum.end_dt)
            if error is not None:
                break

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


def get_trainee_lecture_data_func(context, trainer_id, lecture_id):

    error = None
    class_info = None
    context['lecture_info'] = None

    pt_schedule_id = []
    pt_schedule_lecture_id = []
    pt_schedule_start_datetime = []
    pt_schedule_end_datetime = []
    pt_schedule_member_name = []
    pt_schedule_finish_check = []

    pt_repeat_schedule_id = []
    pt_repeat_schedule_type = []
    pt_repeat_schedule_week_info = []
    pt_repeat_schedule_start_date = []
    pt_repeat_schedule_end_date = []
    pt_repeat_schedule_start_time = []
    pt_repeat_schedule_time_duration = []

    # 강사 정보 가져오기
    try:
        class_info = ClassTb.objects.get(member_id=trainer_id)
    except ObjectDoesNotExist:
        error = '강사 정보가 존재하지 않습니다'

    if error is None:
        # 강사 클래스의 반복일정 불러오기
        if lecture_id is None:
            pt_repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                                      en_dis_type='1')
        else:
            pt_repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                                      lecture_tb_id=lecture_id,
                                                                      en_dis_type='1')
        for pt_repeat_schedule_info in pt_repeat_schedule_data:
            pt_repeat_schedule_id.append(pt_repeat_schedule_info.repeat_schedule_id)
            pt_repeat_schedule_type.append(pt_repeat_schedule_info.repeat_type_cd)
            pt_repeat_schedule_week_info.append(pt_repeat_schedule_info.week_info)
            pt_repeat_schedule_start_date.append(str(pt_repeat_schedule_info.start_date))
            pt_repeat_schedule_end_date.append(str(pt_repeat_schedule_info.end_date))
            pt_repeat_schedule_start_time.append(pt_repeat_schedule_info.start_time)
            pt_repeat_schedule_time_duration.append(pt_repeat_schedule_info.time_duration)

    # 강좌에 해당하는 수강/회원 정보 가져오기, 예약가능 횟수 1개 이상인 회원
    if error is None:
        # 강좌에 해당하는 수강정보 가져오기
        if lecture_id is None:
            context['lecture_info'] = LectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                               lecture_avail_count__gte=1, use=1)
        else:
            context['lecture_info'] = LectureTb.objects.filter(lecture_id=lecture_id,
                                                               lecture_avail_count__gte=1, use=1)
        for lecture in context['lecture_info']:
            # 수강정보에 해당하는 회원정보 가져오기
            try:
                lecture.member_info = MemberTb.objects.get(member_id=lecture.member_id, use=1)
            except ObjectDoesNotExist:
                error = '회원 정보가 존재하지 않습니다'

    # PT 일정 조회
    if error is None:
        # 회원에 해당하는 강좌 정보 불러오기
        for lecture_datum in context['lecture_info']:
            # 강좌별로 연결되어있는 회원 리스트 불러오기
            member_data = MemberTb.objects.get(member_id=lecture_datum.member_id)
            # 강좌별로 연결된 PT 스케쥴 가져오기
            lecture_datum.pt_schedule_data = ScheduleTb.objects.filter(lecture_tb=lecture_datum.lecture_id,
                                                                       en_dis_type='1')
            # PT 스케쥴 정보 셋팅
            for pt_schedule_datum in lecture_datum.pt_schedule_data:
                # lecture schedule id 셋팅
                pt_schedule_id.append(pt_schedule_datum.schedule_id)
                # lecture schedule 에 해당하는 lecture id 셋팅
                pt_schedule_lecture_id.append(lecture_datum.lecture_id)
                pt_schedule_member_name.append(member_data.name)
                pt_schedule_start_datetime.append(pt_schedule_datum.start_dt)
                pt_schedule_end_datetime.append(pt_schedule_datum.end_dt)
                # 끝난 스케쥴인지 확인
                if pt_schedule_datum.state_cd == 'PE':
                    pt_schedule_finish_check.append(1)
                else:
                    pt_schedule_finish_check.append(0)

    context['pt_schedule_id'] = pt_schedule_id
    context['pt_schedule_lecture_id'] = pt_schedule_lecture_id
    context['pt_schedule_member_name'] = pt_schedule_member_name
    context['pt_schedule_start_datetime'] = pt_schedule_start_datetime
    context['pt_schedule_end_datetime'] = pt_schedule_end_datetime
    context['pt_schedule_finish_check'] = pt_schedule_finish_check

    context['pt_repeat_schedule_id_data'] = pt_repeat_schedule_id
    context['pt_repeat_schedule_type_data'] = pt_repeat_schedule_type
    context['pt_repeat_schedule_week_info_data'] = pt_repeat_schedule_week_info
    context['pt_repeat_schedule_start_date_data'] = pt_repeat_schedule_start_date
    context['pt_repeat_schedule_end_date_data'] = pt_repeat_schedule_end_date
    context['pt_repeat_schedule_start_time_data'] = pt_repeat_schedule_start_time
    context['pt_repeat_schedule_time_duration_data'] = pt_repeat_schedule_time_duration

    return context
