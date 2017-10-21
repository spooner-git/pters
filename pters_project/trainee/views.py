from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render

# Create your views here.
from django.views.generic import RedirectView
from django.views.generic import TemplateView

from trainee.models import LectureTb, LectureScheduleTb
from trainer.models import ClassTb


class IndexView(RedirectView):
    url = '/trainee/cal_month/'

    def get_redirect_url(self, *args, **kwargs):
        return super(IndexView, self).get_redirect_url(*args, **kwargs)


# trainee용 Month View
class CalMonthView(LoginRequiredMixin, TemplateView):
    template_name = 'month_cal.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthView, self).get_context_data(**kwargs)

        month_data = []
        lecture_schedule_data = []

        daily_lecture_data_start_date = []
        daily_lecture_data_end_date = []
        month_lecture_data = LectureTb.objects.filter(member_id=self.request.user.id)

        for lecture in month_lecture_data:
            lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                        en_dis_type='1',use='1')
            for month_lecture in lecture.lecture_schedule:
                month_lecture.data = month_lecture.start_dt.timetuple()
                #month_data.append(month_lecture.start_dt.strftime('%Y_%#m_%#d'))
                month_data.append(str(month_lecture.data.tm_year)+'_'+str(month_lecture.data.tm_mon)+'_'
                                  + str(month_lecture.data.tm_mday))
                lecture_schedule_data.append(month_lecture.lecture_schedule_id)
                daily_lecture_data_start_date.append(month_lecture.start_dt)
                daily_lecture_data_end_date.append(month_lecture.end_dt)

        context['month_lecture_data'] = month_data
        context['daily_lecture_schedule_id'] = lecture_schedule_data
        context['daily_lecture_data_start_date'] = daily_lecture_data_start_date
        context['daily_lecture_data_end_date'] = daily_lecture_data_end_date

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