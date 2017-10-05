from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render

# Create your views here.
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from config.settings import LOGIN_URL
from login.models import MemberTb
from schedule.models import LectureScheduleTb
from trainee.models import LectureTb
from trainer.models import ClassTb


class IndexView(LoginRequiredMixin, TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        return context


class CalDayView(LoginRequiredMixin, TemplateView):
    template_name = 'daily_cal.html'

    def get_context_data(self, **kwargs):
        context = super(CalDayView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'
            # logger.error(error)

        daily_data = []
        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)
            for lecture in month_lecture_data:
                member_data = MemberTb.objects.get(member_id=lecture.member_id)
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                      en_dis_type='1',use='1')
                for month_lecture in lecture.lecture_schedule:
                    result = month_lecture.end_dt-month_lecture.start_dt
                    result_hour = int(result.seconds/60/60)
                    daily_data.append(month_lecture.start_dt.strftime('%Y_%-m_%-d_%-H_%M')
                                      + '_' + str(result_hour) + '_' + member_data.name)
                    #daily_data.append(str(month_lecture.data.tm_year)+'_'+str(month_lecture.data.tm_mon)+'_'
                    #                  +str(month_lecture.data.tm_mday)+'_'+str(month_lecture.data.tm_hour)+'_'
                    #                  +str(month_lecture.data.tm_min)+'_'+str(result_hour)+'_'+member_data.name)

        context['daily_lecture_data'] = daily_data

        return context



class CalMonthView(LoginRequiredMixin, TemplateView):
    template_name = 'month_cal.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'
            # logger.error(error)

        month_data = []
        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)

            for lecture in month_lecture_data:
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                      en_dis_type='1',use='1')
                for month_lecture in lecture.lecture_schedule:
                    month_data.append(month_lecture.start_dt.strftime('%Y_%-m_%-d'))

        context['month_lecture_data'] = month_data

        return context
