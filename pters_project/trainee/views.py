import datetime

from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render

# Create your views here.
from django.views.generic import RedirectView
from django.views.generic import TemplateView

from login.models import MemberTb
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

# trainer용 Month View
#class CalMonthView(LoginRequiredMixin, TemplateView):
#    template_name = 'month_cal.html'
#
#    def get_context_data(self, **kwargs):
#        context = super(CalMonthView, self).get_context_data(**kwargs)
#        error = None
#        trainer_class = None
#        try:
#            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
#        except ObjectDoesNotExist:
#            error = 'class가 존재하지 않습니다'
#            # logger.error(error)
#
#        month_data = []
#        if error is None:
#            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)
#
#            for lecture in month_lecture_data:
#                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
#                                                                            en_dis_type='1',use='1')
#                for month_lecture in lecture.lecture_schedule:
#                    month_lecture.data = month_lecture.start_dt.timetuple()
#                    #month_data.append(month_lecture.start_dt.strftime('%Y_%#m_%#d'))
#                    month_data.append(str(month_lecture.data.tm_year)+'_'+str(month_lecture.data.tm_mon)+'_'
#                                      +str(month_lecture.data.tm_mday))
#        context['month_lecture_data'] = month_data
#
#        return context