# Create your views here.
import datetime

from django.contrib import messages
from django.contrib.auth import authenticate,logout, login
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User, Group
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.db import transaction
from django.shortcuts import render, redirect
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from config.views import date_check_func, AccessTestMixin
from login.models import MemberTb, LogTb ,HolidayTb
from trainee.models import LectureTb, LectureScheduleTb
from trainer.models import ClassTb, ClassScheduleTb


class IndexView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'main_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member=self.request.user.id)
        except ObjectDoesNotExist:
            error = '강사 PT 정보가 존재하지 않습니다'

        context['trainer_member_count'] = 0

        if error is None :
            context['trainer_member_count'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                                       lecture_rem_count__gte=1).count()
            context['trainer_end_member_count'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                                           lecture_rem_count__gte=1,
                                                                           lecture_rem_count__lte=3).count()

        today_time = datetime.datetime.now()
        today_start_time = today_time.strftime('%Y-%m-%d 00:00:00.000000')
        today_end_time = today_time.strftime('%Y-%m-%d 23:59:59.999999')
        sum_val = 0
        sum_mod_val = 0
        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)

            for lecture in month_lecture_data:
                sum_val = sum_val+LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                   start_dt__gte=today_start_time,
                                                                   start_dt__lte=today_end_time,
                                                                   en_dis_type='1',use='1').count()
                sum_mod_val = sum_mod_val+LogTb.objects.filter(external_id=lecture.member_id,
                                                               reg_dt__gte=today_start_time,
                                                               reg_dt__lte=today_end_time,
                                                               log_type='LS03').count()

        context['today_schedule_val'] = sum_val
        context['today_schedule_mod_val'] = sum_mod_val

        return context


class CalDayView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_day.html'

    def get_context_data(self, **kwargs):
        context = super(CalDayView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = '강사 PT 정보가 존재하지 않습니다'
            # logger.error(error)

        context['trainer_member'] = None #sk Test 추가 171117

        #daily_off_data = []
        # daily_data = []
        class_schedule_data = []
        lecture_schedule_data = []
        daily_off_data_start_date = []
        daily_off_data_end_date = []
        daily_lecture_data_start_date = []
        daily_lecture_data_end_date = []
        daily_lecture_data_member = []
        daily_lecture_data_id = []
        daily_schedule_finish = []
        today_dt = timezone.now()
        before_dt = today_dt - datetime.timedelta(days=14)
        after_dt = today_dt + datetime.timedelta(days=14)

        #sk Test 추가 171117
        if error is None :
            context['trainer_member'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id
                                                                 , lecture_rem_count__gte=1)

            for lecture in context['trainer_member']:
                try:
                    lecture.trainer_member = MemberTb.objects.get(member_id=lecture.member_id)
                except ObjectDoesNotExist:
                    error = '회원 PT 정보가 존재하지 않습니다'
                    # logger.error(error)
        #sk Test 추가 171117

        if error is None:

            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                              en_dis_type='0', start_dt__gte=before_dt,
                                                              start_dt__lte=after_dt, use='1')
            for month_class in month_class_data:
                class_schedule_data.append(month_class.class_schedule_id)
                daily_off_data_start_date.append(month_class.start_dt)
                daily_off_data_end_date.append(month_class.end_dt)

        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)
            for lecture in month_lecture_data:
                member_data = MemberTb.objects.get(member_id=lecture.member_id)
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                            en_dis_type='1', start_dt__gte=before_dt,
                                                                            start_dt__lte=after_dt, use='1')
                for month_lecture in lecture.lecture_schedule:
                    #month_lecture.data = month_lecture.start_dt.timetuple()
                    #result = month_lecture.end_dt-month_lecture.start_dt
                    #result_hour = int(result.seconds/60/60)
                    #daily_data.append(month_lecture.start_dt.strftime('%Y_%-m_%-d_%-H_%M')
                    #                  + '_' + str(result_hour) + '_' + member_data.name)
                    #daily_data.append(str(month_lecture.data.tm_year)+'_'+str(month_lecture.data.tm_mon)+'_'
                    #                  +str(month_lecture.data.tm_mday)+'_'+str(month_lecture.data.tm_hour)+'_'
                    #                  +str(format(month_lecture.data.tm_min,'02d'))+'_'+str(result_hour)+'_'+member_data.name)
                    lecture_schedule_data.append(month_lecture.lecture_schedule_id)
                    daily_lecture_data_start_date.append(month_lecture.start_dt)
                    daily_lecture_data_end_date.append(month_lecture.end_dt)
                    daily_lecture_data_member.append(member_data.name)
                    daily_lecture_data_id.append(lecture.lecture_id)
                    if month_lecture.state_cd == 'PE':
                        daily_schedule_finish.append(1)
                    else :
                        daily_schedule_finish.append(0)

        # context['daily_lecture_data'] = daily_data
        context['daily_lecture_schedule_id'] = lecture_schedule_data
        context['class_schedule_data'] = class_schedule_data

        context['daily_off_data_start_date'] = daily_off_data_start_date
        context['daily_off_data_end_date'] = daily_off_data_end_date
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date
        context['daily_lecture_data_member'] = daily_lecture_data_member
        context['daily_lecture_data_id'] = daily_lecture_data_id

        context['daily_schedule_finish'] = daily_schedule_finish

        return context


class CalDayViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_day_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(CalDayViewAjax, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = '강사 PT 정보가 존재하지 않습니다'
            # logger.error(error)

        context['trainer_member'] = None  # sk Test 추가 171117

        # daily_off_data = []
        # daily_data = []
        class_schedule_data = []
        lecture_schedule_data = []
        daily_off_data_start_date = []
        daily_off_data_end_date = []
        daily_lecture_data_start_date = []
        daily_lecture_data_end_date = []
        daily_lecture_data_member = []
        daily_lecture_data_id = []
        daily_schedule_finish = []
        today_dt = timezone.now()
        before_dt = today_dt - datetime.timedelta(days=14)
        after_dt = today_dt + datetime.timedelta(days=14)

        # sk Test 추가 171117
        if error is None:
            context['trainer_member'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id
                                                                 , lecture_rem_count__gte=1)

            for lecture in context['trainer_member']:
                try:
                    lecture.trainer_member = MemberTb.objects.get(member_id=lecture.member_id)
                except ObjectDoesNotExist:
                    error = '회원 PT 정보가 존재하지 않습니다'
                    # logger.error(error)
        # sk Test 추가 171117

        if error is None:

            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                              en_dis_type='0', start_dt__gte=before_dt,
                                                              start_dt__lte=after_dt, use='1')
            for month_class in month_class_data:
                class_schedule_data.append(month_class.class_schedule_id)
                daily_off_data_start_date.append(month_class.start_dt)
                daily_off_data_end_date.append(month_class.end_dt)

        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)
            for lecture in month_lecture_data:
                member_data = MemberTb.objects.get(member_id=lecture.member_id)
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                            en_dis_type='1', start_dt__gte=before_dt,
                                                                            start_dt__lte=after_dt, use='1')
                for month_lecture in lecture.lecture_schedule:
                    # month_lecture.data = month_lecture.start_dt.timetuple()
                    # result = month_lecture.end_dt-month_lecture.start_dt
                    # result_hour = int(result.seconds/60/60)
                    # daily_data.append(month_lecture.start_dt.strftime('%Y_%-m_%-d_%-H_%M')
                    #                  + '_' + str(result_hour) + '_' + member_data.name)
                    # daily_data.append(str(month_lecture.data.tm_year)+'_'+str(month_lecture.data.tm_mon)+'_'
                    #                  +str(month_lecture.data.tm_mday)+'_'+str(month_lecture.data.tm_hour)+'_'
                    #                  +str(format(month_lecture.data.tm_min,'02d'))+'_'+str(result_hour)+'_'+member_data.name)
                    lecture_schedule_data.append(month_lecture.lecture_schedule_id)
                    daily_lecture_data_start_date.append(month_lecture.start_dt)
                    daily_lecture_data_end_date.append(month_lecture.end_dt)
                    daily_lecture_data_member.append(member_data.name)
                    daily_lecture_data_id.append(lecture.lecture_id)
                    if month_lecture.state_cd == 'PE':
                        daily_schedule_finish.append(1)
                    else :
                        daily_schedule_finish.append(0)

        # context['daily_lecture_data'] = daily_data
        context['daily_lecture_schedule_id'] = lecture_schedule_data
        context['class_schedule_data'] = class_schedule_data
        context['daily_off_data_start_date'] = daily_off_data_start_date
        context['daily_off_data_end_date'] = daily_off_data_end_date
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date
        context['daily_lecture_data_member'] = daily_lecture_data_member
        context['daily_lecture_data_id'] = daily_lecture_data_id
        context['daily_schedule_finish'] = daily_schedule_finish

        return context


class PtAddView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'pt_add.html'

    def get_context_data(self, **kwargs):
        context = super(PtAddView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = '강사 PT 정보가 존재하지 않습니다'

        context['trainer_member'] = None
        daily_off_data_start_date = []
        daily_off_data_end_date = []
        daily_lecture_data_start_date = []
        daily_lecture_data_end_date = []
        today_dt = timezone.now()
        before_dt = today_dt - datetime.timedelta(days=1)
        after_dt = today_dt + datetime.timedelta(days=14)

        if error is None :
            context['trainer_member'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id
                                                                 , lecture_avail_count__gte=1)

            for lecture in context['trainer_member']:
                try:
                    lecture.trainer_member = MemberTb.objects.get(member_id=lecture.member_id)
                except ObjectDoesNotExist:
                    error = '회원 PT 정보가 존재하지 않습니다'
                    # logger.error(error)

        if error is None:

            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                              en_dis_type='0', start_dt__gte=before_dt,
                                                              start_dt__lte=after_dt, use='1')
            for month_class in month_class_data:
                daily_off_data_start_date.append(month_class.start_dt)
                daily_off_data_end_date.append(month_class.end_dt)

        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)
            for lecture in month_lecture_data:
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                            en_dis_type='1', start_dt__gte=before_dt,
                                                                            start_dt__lte=after_dt, use='1')
                for month_lecture in lecture.lecture_schedule:
                    daily_lecture_data_start_date.append(month_lecture.start_dt)
                    daily_lecture_data_end_date.append(month_lecture.end_dt)

        context['daily_off_data_start_date'] = daily_off_data_start_date
        context['daily_off_data_end_date'] = daily_off_data_end_date
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date

        return context


class CalWeekView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_week.html'

    def get_context_data(self, **kwargs):
        context = super(CalWeekView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = '강사 PT 정보가 존재하지 않습니다'
            # logger.error(error)

        context['trainer_member'] = None #sk Test 추가 171117

        #daily_off_data = []
        #daily_data = []
        class_schedule_data = []
        lecture_schedule_data = []

        daily_off_data_start_date = []
        daily_off_data_end_date = []
        daily_lecture_data_start_date = []
        daily_lecture_data_end_date = []
        daily_lecture_data_member = []
        daily_lecture_data_id = []
        daily_schedule_finish = []
        today_dt = timezone.now()
        before_dt = today_dt - datetime.timedelta(days=14)
        after_dt = today_dt + datetime.timedelta(days=14)

        #sk Test 추가 171117
        if error is None :
            context['trainer_member'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id
                                                                 , lecture_rem_count__gte=1)

            for lecture in context['trainer_member']:
                try:
                    lecture.trainer_member = MemberTb.objects.get(member_id=lecture.member_id)
                except ObjectDoesNotExist:
                    error = '회원 PT 정보가 존재하지 않습니다'
                    # logger.error(error)

        #sk Test 추가 171117

        if error is None:

            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                              en_dis_type='0', start_dt__gte=before_dt,
                                                              start_dt__lte=after_dt, use='1')
            for month_class in month_class_data:
                #month_class.data = month_class.start_dt.timetuple()
                #result = month_class.end_dt - month_class.start_dt
                #result_hour = int(result.seconds / 60 / 60)
                # daily_data.append(month_lecture.start_dt.strftime('%Y_%-m_%-d_%-H_%M')
                #                  + '_' + str(result_hour) + '_' + member_data.name)
                #daily_off_data.append(str(month_class.data.tm_year) + '_' + str(month_class.data.tm_mon) + '_'
                #                      + str(month_class.data.tm_mday) + '_' + str(month_class.data.tm_hour) + '_'
                #                      + str(format(month_class.data.tm_min, '02d')) + '_' + str(result_hour) + '_OFF')
                class_schedule_data.append(month_class.class_schedule_id)
                daily_off_data_start_date.append(month_class.start_dt)
                daily_off_data_end_date.append(month_class.end_dt)

        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)
            for lecture in month_lecture_data:
                member_data = MemberTb.objects.get(member_id=lecture.member_id)
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                            en_dis_type='1', start_dt__gte=before_dt,
                                                                            start_dt__lte=after_dt, use='1')
                for month_lecture in lecture.lecture_schedule:
                    #month_lecture.data = month_lecture.start_dt.timetuple()
                    #result = month_lecture.end_dt - month_lecture.start_dt
                    #result_hour = int(result.seconds / 60 / 60)
                    # daily_data.append(month_lecture.start_dt.strftime('%Y_%-m_%-d_%-H_%M')
                    #                  + '_' + str(result_hour) + '_' + member_data.name)
                    #daily_data.append(str(month_lecture.data.tm_year) + '_' + str(month_lecture.data.tm_mon) + '_'
                    #                  + str(month_lecture.data.tm_mday) + '_' + str(month_lecture.data.tm_hour) + '_'
                    #                  + str(format(month_lecture.data.tm_min, '02d')) + '_' + str(result_hour) + '_'
                    #                  + member_data.name)
                    lecture_schedule_data.append(month_lecture.lecture_schedule_id)
                    daily_lecture_data_start_date.append(month_lecture.start_dt)
                    daily_lecture_data_end_date.append(month_lecture.end_dt)
                    daily_lecture_data_member.append(member_data.name)
                    daily_lecture_data_id.append(lecture.lecture_id)
                    if month_lecture.state_cd == 'PE':
                        daily_schedule_finish.append(1)
                    else :
                        daily_schedule_finish.append(0)

        #context['daily_off_data'] = daily_off_data
        #context['daily_lecture_data'] = daily_data
        context['daily_lecture_schedule_id'] = lecture_schedule_data
        context['class_schedule_data'] = class_schedule_data

        context['daily_off_data_start_date'] = daily_off_data_start_date
        context['daily_off_data_end_date'] = daily_off_data_end_date
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date
        context['daily_lecture_data_member'] = daily_lecture_data_member
        context['daily_lecture_data_id'] = daily_lecture_data_id
        context['daily_schedule_finish'] = daily_schedule_finish

        return context


class CalMonthView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_month.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = '강사 PT 정보가 존재하지 않습니다'
            # logger.error(error)

        context['trainer_member'] = None #sk Test 추가 171117

        #daily_off_data = []
        #daily_data = []
        class_schedule_data = []
        lecture_schedule_data = []

        daily_off_data_start_date = []
        daily_off_data_end_date = []
        daily_lecture_data_start_date = []
        daily_lecture_data_end_date = []
        daily_lecture_data_member = []
        daily_lecture_data_id = []
        holiday = []
        today_dt = timezone.now()
        before_dt = today_dt - datetime.timedelta(days=14)
        after_dt = today_dt + datetime.timedelta(days=14)

        #sk Test 추가 171117
        if error is None :
            context['trainer_member'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id
                                                                 , lecture_rem_count__gte=1)

            for lecture in context['trainer_member']:
                try:
                    lecture.trainer_member = MemberTb.objects.get(member_id=lecture.member_id)
                except ObjectDoesNotExist:
                    error = '회원 PT 정보가 존재하지 않습니다'
                    # logger.error(error)

        #sk Test 추가 171117

        if error is None:

            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                              en_dis_type='0', start_dt__gte=before_dt,
                                                              start_dt__lte=after_dt, use='1')
            for month_class in month_class_data:
                #month_class.data = month_class.start_dt.timetuple()
                #result = month_class.end_dt - month_class.start_dt
                #result_hour = int(result.seconds / 60 / 60)
                # daily_data.append(month_lecture.start_dt.strftime('%Y_%-m_%-d_%-H_%M')
                #                  + '_' + str(result_hour) + '_' + member_data.name)
                #daily_off_data.append(str(month_class.data.tm_year) + '_' + str(month_class.data.tm_mon) + '_'
                #                      + str(month_class.data.tm_mday) + '_' + str(month_class.data.tm_hour) + '_'
                #                      + str(format(month_class.data.tm_min, '02d')) + '_' + str(result_hour) + '_OFF')
                class_schedule_data.append(month_class.class_schedule_id)
                daily_off_data_start_date.append(month_class.start_dt)
                daily_off_data_end_date.append(month_class.end_dt)

        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)
            for lecture in month_lecture_data:
                member_data = MemberTb.objects.get(member_id=lecture.member_id)
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                            en_dis_type='1', start_dt__gte=before_dt,
                                                                            start_dt__lte=after_dt, use='1')
                for month_lecture in lecture.lecture_schedule:
                    #month_lecture.data = month_lecture.start_dt.timetuple()
                    #result = month_lecture.end_dt - month_lecture.start_dt
                    #result_hour = int(result.seconds / 60 / 60)
                    # daily_data.append(month_lecture.start_dt.strftime('%Y_%-m_%-d_%-H_%M')
                    #                  + '_' + str(result_hour) + '_' + member_data.name)
                    #daily_data.append(str(month_lecture.data.tm_year) + '_' + str(month_lecture.data.tm_mon) + '_'
                    #                  + str(month_lecture.data.tm_mday) + '_' + str(month_lecture.data.tm_hour) + '_'
                    #                  + str(format(month_lecture.data.tm_min, '02d')) + '_' + str(result_hour) + '_'
                    #                  + member_data.name)
                    lecture_schedule_data.append(month_lecture.lecture_schedule_id)
                    daily_lecture_data_start_date.append(month_lecture.start_dt)
                    daily_lecture_data_end_date.append(month_lecture.end_dt)
                    daily_lecture_data_member.append(member_data.name)
                    daily_lecture_data_id.append(lecture.lecture_id)

        #context['daily_off_data'] = daily_off_data
        #context['daily_lecture_data'] = daily_data
#        holiday = HolidayTb.objects.filter(holiday_dt__gte=before_dt, holiday_dt__lte=after_dt, use='1')
        holiday = HolidayTb.objects.filter(use='1')
        context['daily_lecture_schedule_id'] = lecture_schedule_data
        context['class_schedule_data'] = class_schedule_data

        context['daily_off_data_start_date'] = daily_off_data_start_date
        context['daily_off_data_end_date'] = daily_off_data_end_date
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date
        context['daily_lecture_data_member'] = daily_lecture_data_member
        context['daily_lecture_data_id'] = daily_lecture_data_id
        context['holiday'] = holiday

        return context


class OffAddView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'off_add.html'

    def get_context_data(self, **kwargs):
        context = super(OffAddView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = '강사 PT 정보가 존재하지 않습니다'

        daily_off_data_start_date = []
        daily_off_data_end_date = []
        daily_lecture_data_start_date = []
        daily_lecture_data_end_date = []
        today_dt = timezone.now()
        before_dt = today_dt - datetime.timedelta(days=1)
        after_dt = today_dt + datetime.timedelta(days=14)

        if error is None:

            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                              en_dis_type='0', start_dt__gte=before_dt,
                                                              start_dt__lte=after_dt, use='1')
            for month_class in month_class_data:
                daily_off_data_start_date.append(month_class.start_dt)
                daily_off_data_end_date.append(month_class.end_dt)

        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)
            for lecture in month_lecture_data:
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                            en_dis_type='1', start_dt__gte=before_dt,
                                                                            start_dt__lte=after_dt, use='1')
                for month_lecture in lecture.lecture_schedule:
                    daily_lecture_data_start_date.append(month_lecture.start_dt)
                    daily_lecture_data_end_date.append(month_lecture.end_dt)

        context['daily_off_data_start_date'] = daily_off_data_start_date
        context['daily_off_data_end_date'] = daily_off_data_end_date
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date

        return context


class OffRepeatAddView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_add_off_repeat.html'

    def get_context_data(self, **kwargs):
        context = super(OffRepeatAddView, self).get_context_data(**kwargs)

        return context


#sk 추가 업무 관리
class ManageWorkView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_work.html'

    def get_context_data(self, **kwargs):
        context = super(ManageWorkView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = '강사 PT 정보가 존재하지 않습니다'
            # logger.error(error)

        context['trainer_member'] = None

        if error is None :
            context['trainer_member'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)

            for lecture in context['trainer_member']:
                try:
                    lecture.trainer_member = MemberTb.objects.get(member_id=lecture.member_id)
                except ObjectDoesNotExist:
                    error = '회원 PT 정보가 존재하지 않습니다'
                    # logger.error(error)

        return context
#sk 추가 업무 관리


class ManageMemberView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_member.html'

    def get_context_data(self, **kwargs):
        context = super(ManageMemberView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = '강사 PT 정보가 존재하지 않습니다'
            # logger.error(error)

        context['trainer_member'] = None

        if error is None :
            context['trainer_member'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)

            for lecture in context['trainer_member']:
                try:
                    lecture.trainer_member = MemberTb.objects.get(member_id=lecture.member_id)
                except ObjectDoesNotExist:
                    error = '회원 PT 정보가 존재하지 않습니다'
                    # logger.error(error)

        return context


class AddMemberView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'member_add.html'

    def get_context_data(self, **kwargs):
        context = super(AddMemberView, self).get_context_data(**kwargs)

        return context


class AlarmView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'alarm.html'

    def get_context_data(self, **kwargs):
        context = super(AlarmView, self).get_context_data(**kwargs)
        log_data = LogTb.objects.filter(external_id=self.request.user.id, use=1).order_by('-reg_dt')
        trainer_class = None
        error = None
        try:
            trainer_class = ClassTb.objects.get(member=self.request.user.id)
        except ObjectDoesNotExist:
            error = '강사 PT 정보가 존재하지 않습니다'

        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)

            for lecture in month_lecture_data:
                log_data |= LogTb.objects.filter(external_id=lecture.member_id, use=1).order_by('-reg_dt')

        log_data.order_by('-reg_dt')

        for log_data_detail in log_data:
            log_data_detail.id = log_data_detail.log_id
            log_data_detail.reg_date = log_data_detail.reg_dt
            temp_data = log_data_detail.contents.split('@')
            if len(temp_data) == 2:
                log_data_detail.log_type = 1
                log_data_detail.log_contents = temp_data[0]
                log_data_detail.log_after_date = temp_data[1]
            elif len(temp_data) == 3:
                log_data_detail.log_type = 2
                log_data_detail.log_contents = temp_data[0]
                log_data_detail.log_before_date = temp_data[1]
                log_data_detail.log_after_date = temp_data[2]
            else:
                log_data_detail.log_type = 0
                log_data_detail.log_contents = log_data_detail.contents

            if log_data_detail.read == 0:
                log_data_detail.log_read = 0
                log_data_detail.read = 1
                log_data_detail.save()
            elif log_data_detail.read == 1:
                log_data_detail.log_read = 1
            else:
                log_data_detail.log_read = 2

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
        today_dt = timezone.now()
        before_dt = today_dt - datetime.timedelta(days=1)
        after_dt = today_dt + datetime.timedelta(days=14)

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

            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                              en_dis_type='0', start_dt__gte=before_dt,
                                                              start_dt__lte=after_dt, use='1')
            for month_class in month_class_data:
                daily_off_data_start_date.append(month_class.start_dt)
                daily_off_data_end_date.append(month_class.end_dt)

        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)
            for lecture in month_lecture_data:
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                            en_dis_type='1',
                                                                            start_dt__gte=before_dt,
                                                                            start_dt__lte=after_dt,
                                                                            use='1').exclude(
                    lecture_schedule_id=lecture_schedule_id)
                for month_lecture in lecture.lecture_schedule:
                    daily_lecture_data_start_date.append(month_lecture.start_dt)
                    daily_lecture_data_end_date.append(month_lecture.end_dt)

        if error is None:
            try:
                modify_lecture_schedule = LectureScheduleTb.objects.get(lecture_schedule_id=lecture_schedule_id)
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
        today_dt = timezone.now()
        before_dt = today_dt - datetime.timedelta(days=1)
        after_dt = today_dt + datetime.timedelta(days=14)

        if error is None:

            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                              en_dis_type='0', start_dt__gte=before_dt,
                                                              start_dt__lte=after_dt, use='1').exclude(
                class_schedule_id=class_schedule_id)
            for month_class in month_class_data:
                daily_off_data_start_date.append(month_class.start_dt)
                daily_off_data_end_date.append(month_class.end_dt)

        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)
            for lecture in month_lecture_data:
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                            en_dis_type='1',
                                                                            start_dt__gte=before_dt,
                                                                            start_dt__lte=after_dt, use='1')
                for month_lecture in lecture.lecture_schedule:
                    daily_lecture_data_start_date.append(month_lecture.start_dt)
                    daily_lecture_data_end_date.append(month_lecture.end_dt)

        if error is None:
            try:
                modify_lecture_schedule = ClassScheduleTb.objects.get(class_schedule_id=class_schedule_id)
            except ObjectDoesNotExist:
                error = 'schedule이 없습니다.'

        context['before_off_schedule_id'] = class_schedule_id
        context['modify_dt'] = modify_lecture_schedule.start_dt
        context['daily_off_data_start_date'] = daily_off_data_start_date
        context['daily_off_data_end_date'] = daily_off_data_end_date
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date

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
    next_page = request.POST.get('next_page')
    counts_fast = request.POST.get('counts_fast')
    price_fast = request.POST.get('price_fast')
    start_date_fast = request.POST.get('start_date_fast')
    end_date_fast = request.POST.get('end_date_fast')

    error = None
    input_start_date = ''
    input_end_date = ''
    input_counts = 0
    input_price = 0


    if MemberTb.objects.filter(name=name, phone=phone).exists():
        error = '이미 가입된 회원 입니다.'
    elif User.objects.filter(email=email).exists():
        error = '이미 가입된 회원 입니다.'
    elif email == '':
        error = 'e-mail 정보를 입력해 주세요.'
    elif name == '':
        error = '이름을 입력해 주세요.'
    elif phone == '':
        error = '연락처를 입력해 주세요.'

    if fast_check == '0':
        if counts_fast == '':
            error = '남은 횟수를 입력해 주세요.'
        elif start_date_fast == '':
            error = '시작 날짜를 입력해 주세요.'
        elif end_date_fast == '':
            error = '종료 날짜를 입력해 주세요.'
        else:
            input_counts = counts_fast
            input_start_date = start_date_fast
            input_end_date = end_date_fast
            if price_fast == '':
                input_price = 0
            else:
                input_price = price_fast

    elif fast_check == '1':
        if counts == '':
            error = '남은 횟수를 입력해 주세요.'
        elif start_date == '':
            error = '시작 날짜를 입력해 주세요.'
        elif end_date == '':
            error = '종료 날짜를 입력해 주세요.'
        else:
            input_counts = counts
            input_start_date = start_date
            input_end_date = end_date
            if price == '':
                input_price = 0
            else:
                input_price = price

    if error is None:

        password = email.split('@')[0] + phone[7:]

        try:
            with transaction.atomic():
                user = User.objects.create_user(username=email, email=email, first_name=name, password=password)
                group = Group.objects.get(name='trainee')
                user.groups.add(group)
                member = MemberTb(member_id=user.id, name=name, phone=phone, contents=contents,
                                  mod_dt=timezone.now(),reg_dt=timezone.now(), user_id=user.id)
                member.save()
                trainer_class = ClassTb.objects.get(member_id=request.user.id)
                lecture = LectureTb(class_tb_id=trainer_class.class_id,member_id=member.member_id,
                                    lecture_reg_count=input_counts, lecture_rem_count=input_counts,
                                    lecture_avail_count=input_counts, price=input_price, option_cd='DC', state_cd='IP',
                                    start_date=input_start_date,end_date=input_end_date, mod_dt=timezone.now(),
                                    reg_dt=timezone.now(), use=1)
                lecture.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'

    if error is None:
        log_contents = '<span>' + request.user.first_name + ' 강사님께서 '\
                       + name + ' 회원님의</span> 정보를 <span class="status">등록</span>했습니다.'
        log_data = LogTb(external_id=request.user.id, log_type='LB01', contents=log_contents, reg_dt=timezone.now(),use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        #next_page = 'trainer:member_add'
        return redirect(next_page)


# pt 일정 추가
@csrf_exempt
def add_pt_logic(request, next_page='trainer:cal_day'):
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

    if error is None:
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=request.user.id)
        except ObjectDoesNotExist:
            error = '강사 PT 정보가 존재하지 않습니다'

    if error is None:
        try:
            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id, en_dis_type='0', use=1)

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
            lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb_id=lecture.lecture_id,
                                                                        en_dis_type='1', use=1)

            for month_lecture in lecture.lecture_schedule:
                error = date_check_func(training_date, start_date, end_date,
                                        month_lecture.start_dt, month_lecture.end_dt)
                if error is not None:
                    break

            if error is not None:
                break

    if error is None:
        with transaction.atomic():
            lecture_schedule_data = LectureScheduleTb(lecture_tb_id=lecture_id, start_dt=start_date,
                                                        end_dt=end_date,
                                                        state_cd='NP', en_dis_type='1',
                                                        reg_dt=timezone.now(), mod_dt=timezone.now(), use=1)
            lecture_schedule_data.save()
            lecture_date_update = LectureTb.objects.get(lecture_id=int(lecture_id))
            member_lecture_avail_count = lecture_date_update.lecture_avail_count
            lecture_date_update.lecture_avail_count = member_lecture_avail_count - 1
            lecture_date_update.mod_dt = timezone.now()
            lecture_date_update.save()

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
        # + start_date.strftime('%Y년 %m월 %d일')+start_date.strftime('%w')\
        # + start_date.strftime('%p %I:%M')\
        # + '- '+end_date.strftime('%p %I:%M')
        log_contents = '<span>'+request.user.first_name + ' 강사님께서 ' + member_name \
                       + ' 회원님의</span> 일정을 <span class="status">등록</span>했습니다.@'\
                       + log_start_date\
                       + ' - '+log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LS01', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        #next_page = 'trainer:add_pt'
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
        user_data = User.objects.get(username=username)
    except ObjectDoesNotExist:
        error = '아이디가 존재하지 않습니다.'
        # logger.error(error)

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
    next = 'trainer:trainer_login'
    logout(request)

    return redirect(next)


# 로그인 페이지 아직 구현 x
@csrf_exempt
def login_trainer_view(request):
    if request.user.is_authenticated():
        return redirect('home')

    next = request.GET.get('next', 'trainer:login')
    fail = request.GET.get('fail', 'registration_page')

    return render(request, 'login_web.html',
                  {
                      'next': next,
                      'fail': fail
                  })


# pt 일정 삭제
@csrf_exempt
def daily_pt_delete(request):
    schedule_id = request.POST.get('schedule_id')
    member_name = request.POST.get('member_name')
    next_page = request.POST.get('next_page')

    error = None
    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:

        lecture_schedule_data = None
        try:
            lecture_schedule_data = LectureScheduleTb.objects.get(lecture_schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '강사 PT 정보가 존재하지 않습니다'
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
            if lecture_schedule_data.use == 0:
                error = '이미 삭제된 스케쥴입니다.'

        if error is None:
            try:
                with transaction.atomic():
                    lecture_schedule_data.mod_dt = timezone.now()
                    lecture_schedule_data.use = 0
                    member_lecture_avail_count = lecture_data.lecture_avail_count
                    member_lecture_rem_count = lecture_data.lecture_rem_count

                    lecture_data.lecture_avail_count = member_lecture_avail_count+1

                    if lecture_schedule_data.state_cd == 'PE':
                        lecture_data.lecture_rem_count = member_lecture_rem_count+1

                    lecture_data.mod_dt = timezone.now()
                    lecture_schedule_data.save()
                    lecture_data.save()

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
        # + start_date.strftime('%Y년 %m월 %d일')+start_date.strftime('%w')\
        # + start_date.strftime('%p %I:%M')\
        # + '- '+end_date.strftime('%p %I:%M')
        log_contents = '<span>'+request.user.first_name + ' 강사님께서 ' + member_name \
                       + ' 회원님의</span> 일정을 <span class="status">삭제</span>했습니다.@'\
                       + log_start_date\
                       + ' - '+log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LS02', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        #next_page = 'trainer:cal_day'
        return redirect(next_page)


# Off 일정 추가
@csrf_exempt
def add_off_logic(request):
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
    elif next_page == '':
        error = '시작 시간을 선택해 주세요.'

    if error is None:

        trainer_class = None

        try:
            start_date = datetime.datetime.strptime(training_date+' '+training_time,'%Y-%m-%d %H:%M:%S.%f')
            end_date = start_date + datetime.timedelta(hours=int(time_duration))
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

        try:
            trainer_class = ClassTb.objects.get(member_id=request.user.id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'
            # logger.error(error)

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
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb_id=lecture.lecture_id,
                                                                            en_dis_type='1', use=1)
                for month_lecture in lecture.lecture_schedule:
                    error = date_check_func(training_date, start_date, end_date,
                                            month_lecture.start_dt, month_lecture.end_dt)
                    if error is not None:
                        break

                if error is not None:
                    break

        if error is None:
            try:
                month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                                  en_dis_type='0', use=1)
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
            class_schedule_data = ClassScheduleTb(class_tb_id=trainer_class.class_id, start_dt=start_date, end_dt=end_date,
                                                    state_cd='NP',en_dis_type='0', reg_dt=timezone.now(), mod_dt=timezone.now(), use=1)
            class_schedule_data.save()

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
        # + start_date.strftime('%Y년 %m월 %d일')+start_date.strftime('%w')\
        # + start_date.strftime('%p %I:%M')\
        # + '- '+end_date.strftime('%p %I:%M')
        log_contents = '<span>'+request.user.first_name + ' 강사님께서 '\
                       + ' OFF </span> 일정을 <span class="status">등록</span>했습니다.@'\
                       + log_start_date\
                       + ' - '+log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LS01', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        #next_page = 'trainer:add_off'
        return redirect(next_page)


# OFF 일정 삭제
@csrf_exempt
def daily_off_delete(request):
    off_schedule_id = request.POST.get('off_schedule_id')
    next_page = request.POST.get('next_page')

    error = None
    if off_schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:

        class_schedule_data = None
        try:
            class_schedule_data = ClassScheduleTb.objects.get(class_schedule_id=off_schedule_id)
        except ObjectDoesNotExist:
            error = '강사 PT 정보가 존재하지 않습니다'
            # logger.error(error)

    if class_schedule_data.use == 0:
        error = '이미 삭제된 OFF 일정입니다.'

    if error is None:
        start_date = class_schedule_data.start_dt
        end_date = class_schedule_data.end_dt

    if error is None:
        try:
            class_schedule_data.mod_dt = timezone.now()
            class_schedule_data.use = 0
            class_schedule_data.save()

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
        # + start_date.strftime('%Y년 %m월 %d일')+start_date.strftime('%w')\
        # + start_date.strftime('%p %I:%M')\
        # + '- '+end_date.strftime('%p %I:%M')
        log_contents = '<span>'+request.user.first_name + ' 강사님께서 ' \
                       + ' OFF </span> 일정을 <span class="status">삭제</span>했습니다.@'\
                       + log_start_date\
                       + ' - '+log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LS02', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        next_page = 'trainer:cal_day'
        return redirect(next_page)


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
                log_data = LogTb.objects.get(log_id=delete_log_id[i])
            except ObjectDoesNotExist:
                error = 'class가 존재하지 않습니다'
                # logger.error(error)
            if error is None:
                log_data.use = 0
                log_data.mod_dt = timezone.now()
                log_data.save()

        return redirect(next_page)
    else:
        messages.info(request, error)
        next_page = 'trainer:alarm'
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
            # logger.error(e)
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            # logger.error(e)
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=request.user.id, use=1)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'
            # logger.error(error)

    if error is None:
        try:
            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id, en_dis_type='0', use=1)

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
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id, use=1)

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        for lecture in month_lecture_data:
            lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb_id=lecture.lecture_id,
                                                                        en_dis_type='1', use=1).exclude(
                                                                        lecture_schedule_id=modify_schedule_id)
            for month_lecture in lecture.lecture_schedule:
                error = date_check_func(training_date, start_date, end_date,
                                        month_lecture.start_dt, month_lecture.end_dt)
                if error is not None:
                    break

            if error is not None:
                break

    if error is None:
        try:
            modify_schedule_data = LectureScheduleTb.objects.get(lecture_schedule_id=modify_schedule_id)

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        if modify_schedule_data.use == 0:
            error = '이미 변경된 스케쥴입니다.'
        else:
            with transaction.atomic():
                lecture_schedule_data = LectureScheduleTb(lecture_tb_id=lecture_id, start_dt=start_date, end_dt=end_date,
                                                        state_cd='NP',en_dis_type='1',
                                                        reg_dt=timezone.now(),mod_dt=timezone.now(), use=1)
                lecture_schedule_data.save()
                modify_schedule_data.use = 0
                modify_schedule_data.mod_dt = timezone.now()
                modify_schedule_data.state_cd = 'CC'
                modify_schedule_data.save()
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
        #next_page = 'trainer:add_pt'
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
            # logger.error(error)

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
            lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb_id=lecture.lecture_id,
                                                                        en_dis_type='1', use=1)
            for month_lecture in lecture.lecture_schedule:
                error = date_check_func(training_date, start_date, end_date,
                                        month_lecture.start_dt, month_lecture.end_dt)
                if error is not None:
                    break

            if error is not None:
                break

    if error is None:
        try:
            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                                  en_dis_type='0', use=1).exclude(
                                                                class_schedule_id=class_schedule_id)
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
            modify_schedule_data = ClassScheduleTb.objects.get(class_schedule_id=class_schedule_id)
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        if modify_schedule_data.use == 0:
                '이미 변경된 OFF일정 입니다.'
        else:
            with transaction.atomic():
                class_schedule_data = ClassScheduleTb(class_tb_id=trainer_class.class_id, start_dt=start_date,
                                                        end_dt=end_date,
                                                        state_cd='NP', en_dis_type='0', reg_dt=timezone.now(),
                                                        mod_dt=timezone.now(), use=1)
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
        #next_page = 'trainer:add_off'
        return redirect(next_page)


# pt 일정 수정
@csrf_exempt
def daily_pt_finish(request):
    schedule_id = request.POST.get('schedule_id')
    member_name = request.POST.get('member_name')
    next_page = request.POST.get('next_page')

    error = None
    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:

        lecture_schedule_data = None
        try:
            lecture_schedule_data = LectureScheduleTb.objects.get(lecture_schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '강사 PT 정보가 존재하지 않습니다'
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
            if lecture_schedule_data.state_cd == 'PE':
                error = '이미 확정된 스케쥴입니다.'

        if error is None:
            try:
                with transaction.atomic():
                    lecture_schedule_data.mod_dt = timezone.now()
                    lecture_schedule_data.state_cd = 'PE'
                    member_lecture_rem_count = lecture_data.lecture_rem_count
                    lecture_data.lecture_rem_count = member_lecture_rem_count - 1
                    lecture_data.mod_dt = timezone.now()
                    lecture_schedule_data.save()
                    lecture_data.save()

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
        # + start_date.strftime('%Y년 %m월 %d일')+start_date.strftime('%w')\
        # + start_date.strftime('%p %I:%M')\
        # + '- '+end_date.strftime('%p %I:%M')
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
        # next_page = 'trainer:cal_day'
        return redirect(next_page)
