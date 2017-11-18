import datetime

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.db import IntegrityError
from django.shortcuts import render, redirect

# Create your views here.
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import RedirectView
from django.views.generic import TemplateView

from config.views import TraineeView
from login.models import MemberTb, LogTb
from trainee.models import LectureTb, LectureScheduleTb
from trainer.models import ClassTb, ClassScheduleTb

from django.utils import timezone


class IndexView(RedirectView):
    url = '/trainee/cal_month/'

    def get_redirect_url(self, *args, **kwargs):
        return super(IndexView, self).get_redirect_url(*args, **kwargs)


class WeekAddView(LoginRequiredMixin, TemplateView):
    template_name = 'trainee_add_pt_cal.html'

    def get_context_data(self, **kwargs):
        context = super(WeekAddView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None

        month_data = []
        lecture_schedule_data = []
        daily_lecture_data_start_date = []
        daily_lecture_data_end_date = []
        daily_lecture_data_member = []
        daily_off_data_start_date = []
        daily_off_data_end_date = []
        today_dt = timezone.now()
        before_dt = today_dt - datetime.timedelta(days=14)
        after_dt = today_dt + datetime.timedelta(days=14)

        try:
            month_lecture_data = LectureTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'lecture가 존재하지 않습니다.'

        if error is None:
            try:
                trainer_class = ClassTb.objects.get(class_id=month_lecture_data.class_tb_id)
            except ObjectDoesNotExist:
                error = 'class가 존재하지 않습니다'

        if error is None:
            try:
                member_data = MemberTb.objects.get(member_id=month_lecture_data.member_id)
            except ObjectDoesNotExist:
                error = 'Member가 존재하지 않습니다'

        if error is None:
            lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=month_lecture_data.lecture_id,
                                                                en_dis_type='1',use='1')
            for month_lecture in lecture_schedule:
                month_lecture.data = month_lecture.start_dt.timetuple()
                #month_data.append(month_lecture.start_dt.strftime('%Y_%#m_%#d'))
                month_data.append(str(month_lecture.data.tm_year)+'_'+str(month_lecture.data.tm_mon)+'_'
                                  + str(month_lecture.data.tm_mday))
                lecture_schedule_data.append(month_lecture.lecture_schedule_id)
                daily_lecture_data_start_date.append(month_lecture.start_dt)
                daily_lecture_data_end_date.append(month_lecture.end_dt)
                daily_lecture_data_member.append(member_data.name)

        if error is None:

            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                              en_dis_type='0', start_dt__gte=before_dt,
                                                              start_dt__lte=after_dt, use='1')
            for month_class in month_class_data:
                daily_off_data_start_date.append(month_class.start_dt)
                daily_off_data_end_date.append(month_class.end_dt)

        if error is None:

            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id).exclude(
                                                            lecture_id=month_lecture_data.lecture_id)
            for lecture in month_lecture_data:
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                            en_dis_type='1', start_dt__gte=before_dt,
                                                                            start_dt__lte=after_dt, use='1')
                for month_lecture in lecture.lecture_schedule:
                    daily_off_data_start_date.append(month_lecture.start_dt)
                    daily_off_data_end_date.append(month_lecture.end_dt)

        context['month_lecture_data'] = month_data
        context['daily_lecture_schedule_id'] = lecture_schedule_data
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date
        context['daily_lecture_data_member'] = daily_lecture_data_member
        context['daily_off_data_start_date'] = daily_off_data_start_date
        context['daily_off_data_end_date'] = daily_off_data_end_date

        return context


class DayAddView(LoginRequiredMixin, TemplateView):
    template_name = 'trainee_add_pt.html'

    def get_context_data(self, **kwargs):
        context = super(DayAddView, self).get_context_data(**kwargs)

        return context


# trainee용 Month View
class CalMonthView(LoginRequiredMixin, TemplateView):
    template_name = 'month_cal.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None

        month_data = []
        lecture_schedule_data = []
        daily_lecture_data_start_date = []
        daily_lecture_data_end_date = []
        daily_lecture_data_member = []
        daily_off_data_start_date = []
        daily_off_data_end_date = []
        today_dt = timezone.now()
        before_dt = today_dt - datetime.timedelta(days=14)
        after_dt = today_dt + datetime.timedelta(days=14)

        try:
            month_lecture_data = LectureTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'lecture가 존재하지 않습니다.'

        if error is None:
            try:
                trainer_class = ClassTb.objects.get(class_id=month_lecture_data.class_tb_id)
            except ObjectDoesNotExist:
                error = 'class가 존재하지 않습니다'

        if error is None:
            member_data = MemberTb.objects.get(member_id=month_lecture_data.member_id)
            lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=month_lecture_data.lecture_id,
                                                                en_dis_type='1',use='1')
            for month_lecture in lecture_schedule:
                month_lecture.data = month_lecture.start_dt.timetuple()
                #month_data.append(month_lecture.start_dt.strftime('%Y_%#m_%#d'))
                month_data.append(str(month_lecture.data.tm_year)+'_'+str(month_lecture.data.tm_mon)+'_'
                                  + str(month_lecture.data.tm_mday))
                lecture_schedule_data.append(month_lecture.lecture_schedule_id)
                daily_lecture_data_start_date.append(month_lecture.start_dt)
                daily_lecture_data_end_date.append(month_lecture.end_dt)
                daily_lecture_data_member.append(member_data.name)

        if error is None:

            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                              en_dis_type='0', start_dt__gte=before_dt,
                                                              start_dt__lte=after_dt, use='1')
            for month_class in month_class_data:
                daily_off_data_start_date.append(month_class.start_dt)
                daily_off_data_end_date.append(month_class.end_dt)

        if error is None:

            month_lecture_data_others = LectureTb.objects.filter(class_tb_id=trainer_class.class_id).exclude(
                                                            lecture_id=month_lecture_data.lecture_id)
            for lecture in month_lecture_data_others:
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                            en_dis_type='1', start_dt__gte=before_dt,
                                                                            start_dt__lte=after_dt, use='1')
                for month_lecture in lecture.lecture_schedule:
                    daily_off_data_start_date.append(month_lecture.start_dt)
                    daily_off_data_end_date.append(month_lecture.end_dt)

        context['month_lecture_data'] = month_data
        context['daily_lecture_schedule_id'] = lecture_schedule_data
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date
        context['daily_lecture_data_member'] = daily_lecture_data_member
        context['daily_off_data_start_date'] = daily_off_data_start_date
        context['daily_off_data_end_date'] = daily_off_data_end_date
        context['lecture_count'] = month_lecture_data.lecture_count

        return context


# pt 일정 삭제
@csrf_exempt
def pt_delete_logic(request):
    schedule_id = request.POST.get('schedule_id')
    next_page = request.POST.get('next_page')

    error = None
    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:

        lecture_schedule_data = None
        try:
            lecture_schedule_data = LectureScheduleTb.objects.get(lecture_schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보가 정보가 존재하지 않습니다'
            # logger.error(error)

    if error is None:
        start_date = lecture_schedule_data.start_dt
        end_date = lecture_schedule_data.end_dt

        lecture_data = None
        try:
            lecture_data = LectureTb.objects.get(lecture_id=lecture_schedule_data.lecture_tb_id)
        except ObjectDoesNotExist:
            error = '회원 PT 정보가 존재하지 않습니다'

    if error is None:
        with transaction.atomic():
            lecture_schedule_data.mod_dt = timezone.now()
            lecture_schedule_data.use = 0
            member_lecture_count = lecture_data.lecture_count
            lecture_data.lecture_count = member_lecture_count+1
            lecture_data.mod_dt = timezone.now()
            lecture_schedule_data.save()
            lecture_data.save()

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        log_start_date = start_date.strftime('%Y년 %m월 %d일 ') + week_info[int(start_date.strftime('%w'))] + '요일 '
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
def pt_add_logic(request, next='trainee:cal_month'):
    training_date = request.POST.get('training_date')
    time_duration = request.POST.get('time_duration')
    training_time = request.POST.get('training_time')

    error = None
    trainee_lecture = None
    trainer_class = None

    if training_date == '':
        error = '날짜를 선택해 주세요.'
    elif time_duration == '':
        error = '진행 시간을 선택해 주세요.'
    elif training_time == '':
        error = '시작 시간을 선택해 주세요.'

    if error is None:

        start_date = datetime.datetime.strptime(training_date+' '+training_time,'%Y-%m-%d %H:%M:%S.%f')
        end_date = start_date + datetime.timedelta(hours=int(time_duration))

        try:
            trainee_lecture = LectureTb.objects.get(member_id=request.user.id)
        except ObjectDoesNotExist:
            error = 'lecture가 존재하지 않습니다.'

    if error is None:
        try:
            trainer_class = ClassTb.objects.get(class_id=trainee_lecture.class_tb_id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'

    if error is None:
        try:
            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id, en_dis_type='0', use=1)

        except ValueError as e:
            # logger.error(e)
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            # logger.error(e)
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        for month_class in month_class_data:
            if month_class.start_dt >= start_date:
                if month_class.start_dt < end_date:
                    error = '등록 시간이 겹칩니다.'
            if month_class.end_dt > start_date:
                if month_class.end_dt < end_date:
                    error = '등록 시간이 겹칩니다.'
            if month_class.start_dt <= start_date:
                if month_class.end_dt >= end_date:
                    error = '등록 시간이 겹칩니다.'

    if error is None:
        try:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)

        except ValueError as e:
            #logger.error(e)
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
             #logger.error(e)
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        for lecture in month_lecture_data:
            lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb_id=lecture.lecture_id,
                                                                        en_dis_type='1', use=1)
            for month_lecture in lecture.lecture_schedule:
                if month_lecture.start_dt >= start_date:
                    if month_lecture.start_dt < end_date:
                        error = '등록 시간이 겹칩니다.'
                if month_lecture.end_dt > start_date:
                    if month_lecture.end_dt < end_date:
                        error = '등록 시간이 겹칩니다.'
                if month_lecture.start_dt <= start_date:
                    if month_lecture.end_dt >= end_date:
                        error = '등록 시간이 겹칩니다.'

    if error is None:
        with transaction.atomic():
            lecture_schedule_data = LectureScheduleTb(lecture_tb_id=trainee_lecture.lecture_id, start_dt=start_date,
                                                      end_dt=end_date, state_cd='NP', en_dis_type='1',
                                                      reg_dt=timezone.now(), mod_dt=timezone.now(), use=1)
            lecture_schedule_data.save()
            lecture_date_update = LectureTb.objects.get(lecture_id=trainee_lecture.lecture_id)
            member_lecture_count = lecture_date_update.lecture_count
            lecture_date_update.lecture_count = member_lecture_count - 1
            lecture_date_update.mod_dt = timezone.now()
            lecture_date_update.save()

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        log_start_date = start_date.strftime('%Y년 %m월 %d일 ') + week_info[int(start_date.strftime('%w'))] + '요일 '
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
        # + start_date.strftime('%Y년 %m월 %d일')+start_date.strftime('%w')\
        # + start_date.strftime('%p %I:%M')\
        # + '- '+end_date.strftime('%p %I:%M')
        log_contents = '<span>'+request.user.first_name + ' 회원님께서 ' \
                       + '</span> 일정을 <span class="status">등록</span>했습니다.@'\
                       + log_start_date\
                       + ' - '+log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LS01', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next)
    else:
        messages.info(request, error)
        next = 'trainee:cal_month'
        return redirect(next)
