# Create your views here.
import datetime

from django.contrib import messages
from django.contrib.auth import authenticate,logout, login
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User, Group
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.db import transaction
from django.shortcuts import render, redirect
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from config.views import date_check_func, AccessTestMixin
from login.models import MemberTb, LogTb ,HolidayTb
from trainee.models import LectureTb
from trainer.models import ClassTb
from schedule.models import ScheduleTb, DeleteScheduleTb, RepeatScheduleTb


class RegisterView(TemplateView):
    template_name = 'login_register_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(RegisterView, self).get_context_data(**kwargs)

        return context


class IndexView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'main_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        error = None
        class_info = None
        today = datetime.date.today()
        one_day_after = today + datetime.timedelta(days=1)
        fourteen_days_ago = today - datetime.timedelta(days=14)
        today_schedule_num = 0
        new_member_num = 0
        context['total_member_num'] = 0
        context['to_be_end_member_num'] = 0
        context['today_schedule_num'] = 0
        context['new_member_num'] = 0

        try:
            class_info = ClassTb.objects.get(member=self.request.user.id)
        except ObjectDoesNotExist:
            error = '강사 정보가 존재하지 않습니다'

        if error is None :
            #남은 횟수 1개 이상인 경우 - 180215 hk.kim
            context['total_member_num'] = LectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                                   lecture_rem_count__gte=1).count()
            #남은 횟수 1개 이상 3개 미만인 경우 - 180215 hk.kim
            context['to_be_end_member_num'] = LectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                                       lecture_rem_count__gte=1,
                                                                       lecture_rem_count__lte=3).count()

        if error is None:
            today_schedule_num = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                           start_dt__gte=today, start_dt__lt=one_day_after,
                                                           en_dis_type='1').count()
            new_member_num = LectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                      start_date__gte=fourteen_days_ago, use='1').count()

        context['today_schedule_num'] = today_schedule_num
        context['new_member_num'] = new_member_num

        if error is not None:
            messages.info(self.request, error)

        return context


class CalDayView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_day.html'

    def get_context_data(self, **kwargs):
        context = super(CalDayView, self).get_context_data(**kwargs)
        context = get_trainer_schedule_data(context, self.request.user.id)
        return context


class CalDayViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_day_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(CalDayViewAjax, self).get_context_data(**kwargs)
        context = get_trainer_schedule_data(context, self.request.user.id)

        return context


class CalWeekView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_week.html'

    def get_context_data(self, **kwargs):
        context = super(CalWeekView, self).get_context_data(**kwargs)
        context = get_trainer_schedule_data(context, self.request.user.id)

        return context


class CalMonthView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_month.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthView, self).get_context_data(**kwargs)
        context = get_trainer_schedule_data(context, self.request.user.id)

        holiday = HolidayTb.objects.filter(use='1')
        context['holiday'] = holiday

        return context


class OffRepeatAddView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_add_off_repeat.html'

    def get_context_data(self, **kwargs):
        context = super(OffRepeatAddView, self).get_context_data(**kwargs)

        return context


def get_trainer_schedule_data(context, trainer_id):

    error = None
    class_info = None
    context['lecture_info'] = None
    off_schedule_id = []
    off_schedule_start_datetime = []
    off_schedule_end_datetime = []
    pt_schedule_id = []
    pt_schedule_lecture_id = []
    pt_schedule_start_datetime = []
    pt_schedule_end_datetime = []
    pt_schedule_member_name = []
    pt_schedule_finish_check = []

    today = datetime.date.today()
    fourteen_days_ago = today - datetime.timedelta(days=14)
    fifteen_days_after = today + datetime.timedelta(days=15)

    # 강사 정보 가져오기
    try:
        class_info = ClassTb.objects.get(member_id=trainer_id)
    except ObjectDoesNotExist:
        error = '강사 정보가 존재하지 않습니다'

    # 강좌에 해당하는 수강/회원 정보 가져오기, 예약가능 횟수 1개 이상인 회원
    if error is None:
        # 강좌에 해당하는 수강정보 가져오기
        context['lecture_info'] = LectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                           lecture_avail_count__gte=1)
        for lecture in context['lecture_info']:
            # 수강정보에 해당하는 회원정보 가져오기
            try:
                lecture.member_info = MemberTb.objects.get(member_id=lecture.member_id)
            except ObjectDoesNotExist:
                error = '회원 정보가 존재하지 않습니다'

    # OFF 일정 조회
    if error is None:
        off_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                      en_dis_type='0', start_dt__gte=fourteen_days_ago,
                                                      start_dt__lt=fifteen_days_after)
        for off_schedule_datum in off_schedule_data:
            off_schedule_id.append(off_schedule_datum.schedule_id)
            off_schedule_start_datetime.append(off_schedule_datum.start_dt)
            off_schedule_end_datetime.append(off_schedule_datum.end_dt)

    # PT 일정 조회
    if error is None:
        # 강사에 해당하는 강좌 정보 불러오기
        lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id)
        for lecture_datum in lecture_data:
            # 강좌별로 연결되어있는 회원 리스트 불러오기
            member_data = MemberTb.objects.get(member_id=lecture_datum.member_id)
            # 강좌별로 연결된 PT 스케쥴 가져오기
            lecture_datum.pt_schedule_data = ScheduleTb.objects.filter(lecture_tb=lecture_datum.lecture_id,
                                                                       en_dis_type='1',
                                                                       start_dt__gte=fourteen_days_ago,
                                                                       start_dt__lt=fifteen_days_after)
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

    context['off_schedule_id'] = off_schedule_id
    context['off_schedule_start_datetime'] = off_schedule_start_datetime
    context['off_schedule_end_datetime'] = off_schedule_end_datetime
    context['pt_schedule_id'] = pt_schedule_id
    context['pt_schedule_lecture_id'] = pt_schedule_lecture_id
    context['pt_schedule_member_name'] = pt_schedule_member_name
    context['pt_schedule_start_datetime'] = pt_schedule_start_datetime
    context['pt_schedule_end_datetime'] = pt_schedule_end_datetime
    context['pt_schedule_finish_check'] = pt_schedule_finish_check

    return context


# 일정 추가
@csrf_exempt
def add_schedule_logic(request):
    lecture_id = request.POST.get('lecture_id')
    member_name = request.POST.get('member_name')
    schedule_date = request.POST.get('training_date')
    schedule_time = request.POST.get('training_time')
    schedule_time_duration = request.POST.get('time_duration')
    en_dis_type = request.POST.get('en_dis_type')
    next_page = request.POST.get('next_page')

    error = None
    if en_dis_type == '1':
        if lecture_id == '':
            error = '회원을 선택해 주세요.'

    if schedule_date == '':
        error = '날짜를 선택해 주세요.'
    elif schedule_time == '':
        error = '시작 시간을 선택해 주세요.'
    elif schedule_time_duration == '':
        error = '진행 시간을 선택해 주세요.'

    if error is None:
        #날짜 값 셋팅
        try:
            schedule_start_datetime = datetime.datetime.strptime(schedule_date+' '+schedule_time, '%Y-%m-%d %H:%M:%S.%f')
            schedule_end_datetime = schedule_start_datetime + datetime.timedelta(hours=int(schedule_time_duration))
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        error = add_schedule_logic_func(schedule_date, schedule_start_datetime, schedule_end_datetime,
                                        request.user.id, request.user.first_name, lecture_id,
                                        en_dis_type, member_name)

    if error is None:
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


# 일정 삭제
@csrf_exempt
def delete_schedule_logic(request):
    pt_schedule_id = request.POST.get('schedule_id')
    off_schedule_id = request.POST.get('off_schedule_id')
    member_name = request.POST.get('member_name')
    en_dis_type = request.POST.get('en_dis_type')
    next_page = request.POST.get('next_page')

    error = None
    lecture_info = None
    schedule_info = None

    if en_dis_type == '1':
        schedule_id = pt_schedule_id
    else:
        schedule_id = off_schedule_id

    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보가 존재하지 않습니다'

    if error is None:
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt

    if en_dis_type == '1':
        if error is None:
            try:
                lecture_info = LectureTb.objects.get(lecture_id=schedule_info.lecture_tb_id, use='1')
            except ObjectDoesNotExist:
                error = '회원 PT 정보가 존재하지 않습니다'

    if error is None:
        try:
            with transaction.atomic():
                delete_schedule = DeleteScheduleTb(schedule_id=schedule_info.schedule_id,
                                                   class_tb_id=schedule_info.class_tb_id,
                                                   lecture_tb_id=schedule_info.lecture_tb_id,
                                                   start_dt=schedule_info.start_dt, end_dt=schedule_info.end_dt,
                                                   state_cd=schedule_info.state_cd, en_dis_type=schedule_info.en_dis_type,
                                                   reg_dt=schedule_info.reg_dt, mod_dt=timezone.now(), use=0)

                if en_dis_type == '1':
                    lecture_info.lecture_avail_count += 1
                    #진행 완료된 일정을 삭제하는경우 예약가능 횟수 및 남은 횟수 증가
                    if schedule_info.state_cd == 'PE':
                        lecture_info.lecture_rem_count += 1

                    lecture_info.mod_dt = timezone.now()
                    lecture_info.save()

                delete_schedule.save()
                schedule_info.delete()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

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
        if en_dis_type == '1':
            log_contents = '<span>'+request.user.first_name + ' 강사님께서 ' + member_name \
                           + ' 회원님의</span> 일정을 <span class="status">삭제</span>했습니다.@'\
                           + log_start_date\
                           + ' - '+log_end_date
        else:
            log_contents = '<span>' + request.user.first_name + ' 강사님께서 ' \
                           + ' OFF </span> 일정을 <span class="status">삭제</span>했습니다.@' \
                           + log_start_date \
                           + ' - ' + log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LS02', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


# 일정 완료
@csrf_exempt
def finish_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id')
    member_name = request.POST.get('member_name')
    next_page = request.POST.get('next_page')

    error = None
    schedule_info = None
    lecture_info = None

    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:

        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보가 존재하지 않습니다'

    if error is None:
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt
        if schedule_info.state_cd == 'PE':
            error = '이미 확정된 스케쥴입니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=schedule_info.lecture_tb_id)
        except ObjectDoesNotExist:
            error = '회원 PT 정보가 존재하지 않습니다'

    if error is None:
        try:
            with transaction.atomic():
                schedule_info.mod_dt = timezone.now()
                schedule_info.state_cd = 'PE'
                lecture_info.lecture_rem_count -= 1
                lecture_info.mod_dt = timezone.now()
                schedule_info.save()
                lecture_info.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        log_start_date = start_date.strftime('%Y') + '년 ' \
                         + start_date.strftime('%m') + '월 ' \
                         + start_date.strftime('%d') + '일 ' \
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
        log_contents = '<span>' + request.user.first_name + ' 강사님께서 ' + member_name \
                       + ' 회원님의</span> 일정을 <span class="status">완료</span>했습니다.@' \
                       + log_start_date \
                       + ' - ' + log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LS03', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


def add_schedule_logic_func(schedule_date, schedule_start_datetime, schedule_end_datetime,
                            user_id, user_name, lecture_id, en_dis_type, member_name):

    error = None
    class_info = None

    if error is None:
        # 강사 정보 가져오기
        try:
            class_info = ClassTb.objects.get(member_id=user_id)
        except ObjectDoesNotExist:
            error = '강사 정보가 존재하지 않습니다'

    if en_dis_type == '1':
        if error is None:
            try:
                member_lecture_info = LectureTb.objects.get(lecture_id=int(lecture_id))
            except ObjectDoesNotExist:
                error = '회원 PT 정보가 존재하지 않습니다'
        if error is None:
            if member_lecture_info.lecture_avail_count == 0:
                error = '예약 가능한 횟수가 없습니다'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id)
        for schedule_datum in schedule_data:
            error = date_check_func(schedule_date, schedule_start_datetime, schedule_end_datetime,
                                    schedule_datum.start_dt, schedule_datum.end_dt)
            if error is not None:
                break

    if error is None:
        with transaction.atomic():
            add_schedule_info = ScheduleTb(class_tb_id=class_info.class_id, lecture_tb_id=lecture_id,
                                           start_dt=schedule_start_datetime, end_dt=schedule_end_datetime,
                                           state_cd='NP', en_dis_type=en_dis_type,
                                           reg_dt=timezone.now(), mod_dt=timezone.now())
            add_schedule_info.save()
            if en_dis_type == '1':
                member_lecture_info.lecture_avail_count -= 1
                member_lecture_info.mod_dt = timezone.now()
                member_lecture_info.save()

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        log_start_date = schedule_start_datetime.strftime('%Y')+'년 ' \
                         + schedule_start_datetime.strftime('%m')+'월 ' \
                         + schedule_start_datetime.strftime('%d')+'일 ' \
                         + week_info[int(schedule_start_datetime.strftime('%w'))] + '요일 '
        if schedule_start_datetime.strftime('%p') == 'AM':
            log_start_date = str(log_start_date) + '오전'
        elif schedule_start_datetime.strftime('%p') == 'PM':
            log_start_date = str(log_start_date) + '오후'
        log_start_date = str(log_start_date) + schedule_start_datetime.strftime(' %I:%M')

        if schedule_end_datetime.strftime('%p') == 'AM':
            log_end_date = '오전'
        elif schedule_end_datetime.strftime('%p') == 'PM':
            log_end_date = '오후'

        log_end_date = str(log_end_date) + schedule_end_datetime.strftime(' %I:%M')
        if en_dis_type == '1':
            log_contents = '<span>'+user_name + ' 강사님께서 ' + member_name \
                           + ' 회원님의</span> 일정을 <span class="status">등록</span>했습니다.@'\
                           + log_start_date\
                           + ' - '+log_end_date
        else:
            log_contents = '<span>'+user_name + ' 강사님께서 '\
                           + ' OFF </span> 일정을 <span class="status">등록</span>했습니다.@'\
                           + log_start_date\
                           + ' - '+log_end_date

        log_data = LogTb(external_id=user_id, log_type='LS01', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
    else:
        return error


# 반복 일정 추가

@csrf_exempt
def add_repeat_schedule_logic(request):

    #lecture_id = request.POST.get('repeat_freq')
    #member_name = request.POST.get('repeat_start_date')
    repeat_freq = request.POST.get('repeat_freq')
    repeat_start_date = request.POST.get('repeat_start_date')
    repeat_end_date = request.POST.get('repeat_end_date')
    repeat_day = request.POST.get('repeat_day')
    repeat_start_time = request.POST.get('repeat_start_time')
    repeat_dur = request.POST.get('repeat_dur')
    en_dis_type = request.POST.get('en_dis_type')
    next_page = request.POST.get('next_page')

    error = None

    class_info = None

    #if repeat_freq == '':

    #else:
    #    repeat_type = ''

    if error is None:
        # 강사 정보 가져오기
        try:
            class_info = ClassTb.objects.get(member_id=request.user.id)
        except ObjectDoesNotExist:
            error = '강사 정보가 존재하지 않습니다'

    if error is None:
        '''

        try:

            #repeat_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
            class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, default='', blank=True,
                                         null=True)  # Field name made lowercase.
            lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, default='', blank=True,
                                           null=True)  # Field name made lowercase.
            repeat_type_cd = models.CharField(db_column='REPEAT_TYPE_CD', max_length=10, blank=True,
                                              null=True)  # Field name made lowercase.
            week_info = models.CharField(db_column='WEEK_INFO', max_length=10, blank=True,
                                         null=True)  # Field name made lowercase.
            start_dt = models.DateField(db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
            end_dt = models.DateField(db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
            state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True,
                                        null=True)  # Field name made lowercase.
            en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True,
                                           null=True)  # Field name made lowercase.
            reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
            mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.

            with transaction.atomic():
                delete_schedule = RepeatScheduleTb(class_tb_id=class_info.id,
                                                   repeat_type_cd=repeat_type,
                                                   start_dt=schedule_info.start_dt, end_dt=schedule_info.end_dt,
                                                   state_cd=schedule_info.state_cd,
                                                   en_dis_type=schedule_info.en_dis_type,
                                                   reg_dt=schedule_info.reg_dt, mod_dt=timezone.now(), use=0)

                if en_dis_type == '1':
                    lecture_info.lecture_avail_count += 1
                    # 진행 완료된 일정을 삭제하는경우 예약가능 횟수 및 남은 횟수 증가
                    if schedule_info.state_cd == 'PE':
                        lecture_info.lecture_rem_count += 1

                    lecture_info.mod_dt = timezone.now()
                    lecture_info.save()

                delete_schedule.save()
                schedule_info.delete()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        log_start_date = start_date.strftime('%Y') + '년 ' \
                         + start_date.strftime('%m') + '월 ' \
                         + start_date.strftime('%d') + '일 ' \
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
        if en_dis_type == '1':
            log_contents = '<span>' + request.user.first_name + ' 강사님께서 ' + member_name \
                           + ' 회원님의</span> 일정을 <span class="status">삭제</span>했습니다.@' \
                           + log_start_date \
                           + ' - ' + log_end_date
        else:
            log_contents = '<span>' + request.user.first_name + ' 강사님께서 ' \
                           + ' OFF </span> 일정을 <span class="status">삭제</span>했습니다.@' \
                           + log_start_date \
                           + ' - ' + log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LS02', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()

    #schedule add logic add
    #요일 받아서 기간 안에 +7일씩 혹은 +14일씩 혹은 +2일씩 +1일씩 돌면서 검사
    #문제가 있는 날짜 list 에 추가
    #문제가 있는 날짜 return
    #문제가 있는지 확인하는 form input 추가
    #문제가 있는지 확인된 값이 1로 들어오면 그대로 돌면서 추가
    #겹치는 일정이 있으면 추가 하지 않고 다음일정으로 등록

    #반복일정 테이블에 스케쥴 id값 저장?
    #-> 수정 삭제시에 해당 id만 제거 하거나 수정하면 될듯

    #반복일정 삭제시는 제거하면 되니 문제 없음  - 오늘날짜 이후 일정만 삭제

    #반복일정 수정시에는 수정하는 날짜 등록 가능한지 확인
    #확인 완료시 일정삭제후 등록 하거나 일정 등록후 삭제
'''

        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


class ManageMemberView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_member.html'

    def get_context_data(self, **kwargs):
        context = super(ManageMemberView, self).get_context_data(**kwargs)
        context = get_member_data(context,self.request.user.id)

        return context


class ManageMemberViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_member_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(ManageMemberViewAjax, self).get_context_data(**kwargs)
        context = get_member_data(context,self.request.user.id)
        return context


class ManageWorkView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_work.html'

    def get_context_data(self, **kwargs):
        context = super(ManageWorkView, self).get_context_data(**kwargs)
        context = get_member_data(context,self.request.user.id)

        return context


def get_member_data(context, trainer_id):

    error = None
    class_info = None
    context['lecture_info'] = None

    # 강사 정보 가져오기
    try:
        class_info = ClassTb.objects.get(member_id=trainer_id)
    except ObjectDoesNotExist:
        error = '강사 정보가 존재하지 않습니다'

    # 강좌에 해당하는 수강/회원 정보 가져오기
    if error is None:
        # 강좌에 해당하는 수강정보 가져오기
        context['lecture_info'] = LectureTb.objects.filter(class_tb_id=class_info.class_id)

        for lecture in context['lecture_info']:
            # 수강정보에 해당하는 회원정보 가져오기
            try:
                lecture.member_info = MemberTb.objects.get(member_id=lecture.member_id)
            except ObjectDoesNotExist:
                error = '회원 정보가 존재하지 않습니다'

    return context


class AlarmView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'alarm.html'

    def get_context_data(self, **kwargs):
        context = super(AlarmView, self).get_context_data(**kwargs)
        class_info = None
        error = None

        try:
            class_info = ClassTb.objects.get(member=self.request.user.id)
        except ObjectDoesNotExist:
            error = '강사 정보가 존재하지 않습니다'

        if error is None:
            log_data = LogTb.objects.filter(external_id=self.request.user.id, use=1).order_by('-reg_dt')

        if error is None:
            lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id)

            for lecture_info in lecture_data:
                log_data |= LogTb.objects.filter(external_id=lecture_info.member_id, use=1).order_by('-reg_dt')

            log_data.order_by('-reg_dt')

        if error is None:
            for log_info in log_data:
                log_info.id = log_info.log_id
                log_info.reg_date = log_info.reg_dt
                temp_data = log_info.contents.split('@')
                if len(temp_data) == 2:
                    log_info.log_type = 1
                    log_info.log_contents = temp_data[0]
                    log_info.log_after_date = temp_data[1]
                elif len(temp_data) == 3:
                    log_info.log_type = 2
                    log_info.log_contents = temp_data[0]
                    log_info.log_before_date = temp_data[1]
                    log_info.log_after_date = temp_data[2]
                else:
                    log_info.log_type = 0
                    log_info.log_contents = log_info.contents

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


class LogInTrainerView(TemplateView):
    template_name = 'login_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(LogInTrainerView, self).get_context_data(**kwargs)

        return context


class TrainerSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting.html'

    def get_context_data(self, **kwargs):
        context = super(TrainerSettingView, self).get_context_data(**kwargs)

        return context


class PushSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_push.html'

    def get_context_data(self, **kwargs):
        context = super(PushSettingView, self).get_context_data(**kwargs)

        return context


class ReserveSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_reserve.html'

    def get_context_data(self, **kwargs):
        context = super(ReserveSettingView, self).get_context_data(**kwargs)

        return context


class SalesSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_sales.html'

    def get_context_data(self, **kwargs):
        context = super(SalesSettingView, self).get_context_data(**kwargs)

        return context


# 회원가입 api
@csrf_exempt
def member_registration(request):
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
    next_page = request.POST.get('next_page')

    error = None
    input_start_date = ''
    input_end_date = ''
    input_counts = 0
    input_price = 0
    now = timezone.now()

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

        with transaction.atomic():
            try:
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
                class_info = ClassTb.objects.get(member_id=request.user.id)
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

    if error is None:
        log_contents = '<span>' + request.user.first_name + ' 강사님께서 '\
                       + name + ' 회원님의</span> 정보를 <span class="status">등록</span>했습니다.'
        log_data = LogTb(external_id=request.user.id, log_type='LB01', contents=log_contents, reg_dt=timezone.now(),use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)

        return redirect(next_page)



# 로그인 api
@csrf_exempt
def login_trainer(request):
    #login 완료시 main page로 이동
    username = request.POST.get('username')
    password = request.POST.get('password')
    next_page = request.POST.get('next_page')
    error = None

    try:
        User.objects.get(username=username)
    except ObjectDoesNotExist:
        error = '아이디가 존재하지 않습니다.'

    if not error:
        user = authenticate(username=username, password=password)
        if user is not None and user.is_active:
            login(request, user)
            #member_detail = MemberTb.objects.get(user_id=user_data.id)
            # request.session['is_first_login'] = True
            #request.session['member_id'] = member_detail.member_id

            return redirect(next_page)
        else:
            error = '로그인에 실패하였습니다.'
            # logger.error(error)

    if error is None:
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


# 로그아웃 api
@csrf_exempt
def logout_trainer(request):
    #logout 끝나면 login page로 이동
    logout(request)
    return redirect('trainer:trainer_login')


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
        messages.info(request, error)
        return redirect(next_page)











# pt 일정 수정
@csrf_exempt
def modify_pt_logic(request):
    modify_schedule_id = request.POST.get('modify_schedule_id')
    lecture_id = request.POST.get('lecture_id')
    member_name = request.POST.get('member_name')
    training_date = request.POST.get('training_date')
    time_duration = request.POST.get('time_duration')
    training_time = request.POST.get('training_time')
    next_page = request.POST.get('next_page')

    error = None
    if lecture_id == '':
        error = '회원을 선택해 주세요.'
    elif training_date == '':
        error = '날짜를 선택해 주세요.'
    elif time_duration == '':
        error = '진행 시간을 선택해 주세요.'
    elif training_time == '':
        error = '시작 시간을 선택해 주세요.'

    if error is None:

        try:
            start_date = datetime.datetime.strptime(training_date+' '+training_time,'%Y-%m-%d %H:%M:%S.%f')
            end_date = start_date + datetime.timedelta(hours=int(time_duration))
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=request.user.id, use=1)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'

    if error is None:
        try:
            month_class_data = ScheduleTb.objects.filter(class_tb_id=trainer_class.class_id, en_dis_type='0')

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        for month_class in month_class_data:
            error = date_check_func(training_date, start_date, end_date,
                                    month_class.start_dt, month_class.end_dt)
            if error is not None:
                break

    if error is None:
        try:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        for lecture in month_lecture_data:
            lecture.lecture_schedule = ScheduleTb.objects.filter(lecture_tb_id=lecture.lecture_id,
                                                                 en_dis_type='1').exclude(schedule_id=modify_schedule_id)
            for month_lecture in lecture.lecture_schedule:
                error = date_check_func(training_date, start_date, end_date,
                                        month_lecture.start_dt, month_lecture.end_dt)
                if error is not None:
                    break

            if error is not None:
                break

    if error is None:
        try:
            modify_schedule_data = ScheduleTb.objects.get(schedule_id=modify_schedule_id)

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
            with transaction.atomic():
                delete_schedule = DeleteScheduleTb(schedule_id=modify_schedule_data.schedule_id,
                                                   class_tb_id=modify_schedule_data.class_tb_id,
                                                   lecture_tb_id=modify_schedule_data.lecture_tb_id,
                                                   start_dt=modify_schedule_data.start_dt, end_dt=modify_schedule_data.end_dt,
                                                   state_cd=modify_schedule_data.state_cd,
                                                   en_dis_type=modify_schedule_data.en_dis_type,
                                                   reg_dt=modify_schedule_data.reg_dt, mod_dt=timezone.now(), use=0)

                delete_schedule.save()
                modify_schedule_data.delete()
                lecture_schedule_data = ScheduleTb(class_tb_id=trainer_class.class_id, lecture_tb_id=lecture_id,
                                                   start_dt=start_date, end_dt=end_date,
                                                   state_cd='NP', en_dis_type='1',
                                                   reg_dt=timezone.now(), mod_dt=timezone.now())
                lecture_schedule_data.save()

                lecture_date_update = LectureTb.objects.get(lecture_id=int(lecture_id))
                lecture_date_update.mod_dt = timezone.now()
                lecture_date_update.save()

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        modify_start_date = modify_schedule_data.start_dt
        modify_end_date = modify_schedule_data.end_dt

        modify_log_start_date = modify_start_date.strftime('%Y')+'년 ' \
                                + modify_start_date.strftime('%m')+'월 ' \
                                + modify_start_date.strftime('%d')+'일 ' \
                                + week_info[int(modify_start_date.strftime('%w'))] + '요일 '
        if modify_start_date.strftime('%p') == 'AM':
            modify_log_start_date = str(modify_log_start_date) + '오전'
        elif modify_start_date.strftime('%p') == 'PM':
            modify_log_start_date = str(modify_log_start_date) + '오후'
        modify_log_start_date = str(modify_log_start_date) + modify_start_date.strftime(' %I:%M')

        if modify_end_date.strftime('%p') == 'AM':
            modify_log_end_date = '오전'
        elif modify_end_date.strftime('%p') == 'PM':
            modify_log_end_date = '오후'

        modify_log_end_date = str(modify_log_end_date) + modify_end_date.strftime(' %I:%M')

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

        log_contents = '<span>'+request.user.first_name + ' 강사님께서 ' + member_name \
                       + ' 회원님의</span> 일정을 <span class="status">변경</span>했습니다.@'\
                       + modify_log_start_date\
                       + ' - '+modify_log_end_date\
                       + '@'+log_start_date\
                       + ' - '+log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LS03', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


# Off 일정 추가
@csrf_exempt
def modify_off_logic(request):
    class_schedule_id = request.POST.get('modify_off_schedule_id')
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

        start_date = datetime.datetime.strptime(training_date+' '+training_time,'%Y-%m-%d %H:%M:%S.%f')
        end_date = start_date + datetime.timedelta(hours=int(time_duration))

        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=request.user.id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'

    if error is None:
        month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)

        for lecture in month_lecture_data:
            lecture.lecture_schedule = ScheduleTb.objects.filter(lecture_tb_id=lecture.lecture_id,
                                                                        en_dis_type='1', use=1)
            for month_lecture in lecture.lecture_schedule:
                error = date_check_func(training_date, start_date, end_date,
                                        month_lecture.start_dt, month_lecture.end_dt)
                if error is not None:
                    break

            if error is not None:
                break

    if error is None:
        month_class_data = ScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                     en_dis_type='0', use=1).exclude(schedule_id=class_schedule_id)

        for month_class in month_class_data:
            error = date_check_func(training_date, start_date, end_date,
                                    month_class.start_dt, month_class.end_dt)
            if error is not None:
                break

    if error is None:
        try:
            modify_schedule_data = ScheduleTb.objects.get(schedule_id=class_schedule_id)
        except ObjectDoesNotExist:
            error = '수정할 스케쥴이 존재하지 않습니다'

    if error is None:
            with transaction.atomic():
                delete_schedule = DeleteScheduleTb(schedule_id=modify_schedule_data.schedule_id,
                                                   class_tb_id=modify_schedule_data.class_tb_id,
                                                   lecture_tb_id=modify_schedule_data.lecture_tb_id,
                                                   start_dt=modify_schedule_data.start_dt, end_dt=modify_schedule_data.end_dt,
                                                   state_cd=modify_schedule_data.state_cd,
                                                   en_dis_type=modify_schedule_data.en_dis_type,
                                                   reg_dt=modify_schedule_data.reg_dt, mod_dt=timezone.now(), use=0)

                delete_schedule.save()
                modify_schedule_data.delete()
                class_schedule_data = ScheduleTb(class_tb_id=trainer_class.class_id, start_dt=start_date,
                                                 end_dt=end_date,
                                                 state_cd='NP', en_dis_type='0', reg_dt=timezone.now(),
                                                 mod_dt=timezone.now())
                class_schedule_data.save()

                modify_schedule_data.use = 0
                modify_schedule_data.state_cd = 'CC'
                modify_schedule_data.mod_dt = timezone.now()
                modify_schedule_data.save()

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        modify_start_date = modify_schedule_data.start_dt
        modify_end_date = modify_schedule_data.end_dt

        modify_log_start_date = modify_start_date.strftime('%Y')+'년 ' \
                                + modify_start_date.strftime('%m')+'월 ' \
                                + modify_start_date.strftime('%d')+'일 ' \
                                + week_info[int(modify_start_date.strftime('%w'))] + '요일 '
        if modify_start_date.strftime('%p') == 'AM':
            modify_log_start_date = str(modify_log_start_date) + '오전'
        elif modify_start_date.strftime('%p') == 'PM':
            modify_log_start_date = str(modify_log_start_date) + '오후'
        modify_log_start_date = str(modify_log_start_date) + modify_start_date.strftime(' %I:%M')

        if modify_end_date.strftime('%p') == 'AM':
            modify_log_end_date = '오전'
        elif modify_end_date.strftime('%p') == 'PM':
            modify_log_end_date = '오후'

        modify_log_end_date = str(modify_log_end_date) + modify_end_date.strftime(' %I:%M')

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

        log_contents = '<span>'+request.user.first_name + ' 강사님께서 '\
                       + ' OFF </span> 일정을 <span class="status">변경</span>했습니다.@'\
                       + modify_log_start_date\
                       + ' - '+modify_log_end_date\
                       + '@'+log_start_date\
                       + ' - '+log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LS03', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


@method_decorator(csrf_exempt, name='dispatch')
class PtModifyView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_modify_pt.html'

    def get_context_data(self, **kwargs):
        context = super(PtModifyView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        trainee_lecture = None
        trainee_info = None
        context['member_name'] = None
        context['lecture_avail_count'] = None
        context['lecture_id'] = None
        context['modify_dt'] = None

        lecture_schedule_id = self.request.GET.get('schedule_id')
        lecture_id = self.request.GET.get('lecture_id')
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'

        daily_off_data_start_date = []
        daily_off_data_end_date = []
        daily_lecture_data_start_date = []
        daily_lecture_data_end_date = []
        today = datetime.date.today()
        one_day_ago = today - datetime.timedelta(days=1)
        fifteen_days_after = today + datetime.timedelta(days=15)

        if error is None:
            try:
                trainee_lecture = LectureTb.objects.get(lecture_id=lecture_id)
            except ObjectDoesNotExist:
                error = 'lecture가 존재하지 않습니다.'

        if error is None:
            try:
                trainee_info = MemberTb.objects.get(member_id=trainee_lecture.member_id)
            except ObjectDoesNotExist:
                error = 'member가 존재하지 않습니다.'

        if error is None:

            month_class_data = ScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                         en_dis_type='0', start_dt__gte=one_day_ago,
                                                         start_dt__lt=fifteen_days_after)
            for month_class in month_class_data:
                daily_off_data_start_date.append(month_class.start_dt)
                daily_off_data_end_date.append(month_class.end_dt)

        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)
            for lecture in month_lecture_data:
                lecture.lecture_schedule = ScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                     en_dis_type='1',
                                                                     start_dt__gte=one_day_ago,
                                                                     start_dt__lt=fifteen_days_after).exclude(schedule_id=lecture_schedule_id)
                for month_lecture in lecture.lecture_schedule:
                    daily_lecture_data_start_date.append(month_lecture.start_dt)
                    daily_lecture_data_end_date.append(month_lecture.end_dt)

        if error is None:
            try:
                modify_lecture_schedule = ScheduleTb.objects.get(schedule_id=lecture_schedule_id)
            except ObjectDoesNotExist:
                error = 'schedule이 없습니다.'

        context['modify_schedule_id'] = lecture_schedule_id
        context['modify_dt'] = modify_lecture_schedule.start_dt
        context['member_name'] = trainee_info.name
        context['lecture_avail_count'] = trainee_lecture.lecture_avail_count
        context['lecture_id'] = trainee_lecture.lecture_id
        context['daily_off_data_start_date'] = daily_off_data_start_date
        context['daily_off_data_end_date'] = daily_off_data_end_date
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date

        return context


@method_decorator(csrf_exempt, name='dispatch')
class OffModifyView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_modify_off.html'

    def get_context_data(self, **kwargs):
        context = super(OffModifyView, self).get_context_data(**kwargs)
        class_schedule_id = self.request.GET.get('off_schedule_id')
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'

        daily_off_data_start_date = []
        daily_off_data_end_date = []
        daily_lecture_data_start_date = []
        daily_lecture_data_end_date = []
        today = datetime.date.today()
        one_day_ago = today - datetime.timedelta(days=1)
        fifteen_days_after = today + datetime.timedelta(days=15)

        if error is None:

            month_class_data = ScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                         en_dis_type='0', start_dt__gte=one_day_ago,
                                                         start_dt__lt=fifteen_days_after,).exclude(schedule_id=class_schedule_id)
            for month_class in month_class_data:
                daily_off_data_start_date.append(month_class.start_dt)
                daily_off_data_end_date.append(month_class.end_dt)

        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)
            for lecture in month_lecture_data:
                lecture.lecture_schedule = ScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                     en_dis_type='1',
                                                                     start_dt__gte=one_day_ago,
                                                                     start_dt__lt=fifteen_days_after, use='1')
                for month_lecture in lecture.lecture_schedule:
                    daily_lecture_data_start_date.append(month_lecture.start_dt)
                    daily_lecture_data_end_date.append(month_lecture.end_dt)

        if error is None:
            try:
                modify_lecture_schedule = ScheduleTb.objects.get(schedule_id=class_schedule_id)
            except ObjectDoesNotExist:
                error = 'schedule이 없습니다.'

        context['before_off_schedule_id'] = class_schedule_id
        context['modify_dt'] = modify_lecture_schedule.start_dt
        context['daily_off_data_start_date'] = daily_off_data_start_date
        context['daily_off_data_end_date'] = daily_off_data_end_date
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date

        return context

