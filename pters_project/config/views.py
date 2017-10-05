import datetime
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render

# Create your views here.
from django.views.generic import TemplateView
from login.models import MemberTb
from django.contrib.auth.mixins import LoginRequiredMixin
from config.settings import LOGIN_URL
from schedule.models import LectureScheduleTb
from trainee.models import LectureTb
from trainer.models import ClassTb


class HomeView(LoginRequiredMixin, TemplateView):
    #login_url = LOGIN_URL
    template_name = 'main_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(HomeView, self).get_context_data(**kwargs)
        #context = get_login_member_info(context)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'
            # logger.error(error)

        context['trainer_member_count'] = 0

        if error is None :
            context['trainer_member_count'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id).count()
            context['trainer_end_member_count'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                                           lecture_count__gte=1,
                                                                           lecture_count__lte=3).count()

        today_time = datetime.datetime.now()
        today_start_time = today_time.strftime('%Y-%m-%d 00:00:00.000000')
        today_end_time = today_time.strftime('%Y-%m-%d 23:59:59.999999')
        sum_val = 0;
        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)

            for lecture in month_lecture_data:
                sum_val = sum_val+LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                   start_dt__gte=today_start_time,
                                                                   start_dt__lte=today_end_time,
                                                                   en_dis_type='1',use='1').count()

        context['today_schedule_val'] = sum_val

        return context


def get_login_member_info(context):
    #user = User.objects.get(username='admin').select_related
    #member_detail = MemberTb.objects.get(user_id='2')
    #print(member_detail.user.username)
    #print(member_detail.name)
    #context['login_member'] = member_detail

    return context

