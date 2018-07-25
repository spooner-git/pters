import logging
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin

# Create your views here.
from django.views.generic import RedirectView
from django.views.generic import TemplateView

from center.models import CenterTb, CenterTrainerTb
from configs.const import USE
from configs.views import AccessTestMixin
from login.models import CommonCdTb
from schedule.models import ClassTb

logger = logging.getLogger(__name__)


class IndexView(LoginRequiredMixin, AccessTestMixin, RedirectView):
    # url = '/trainee/cal_month/'
    def get(self, request, **kwargs):
        self.url = '/center/blank/'
        return super(IndexView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(IndexView, self).get_redirect_url(*args, **kwargs)


class BlankView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'test.html'

    def get_context_data(self, **kwargs):
        context = super(BlankView, self).get_context_data(**kwargs)
        center_data = CenterTb.objects.filter(member_id = self.request.user.id)
        if len(center_data) > 0:
            self.request.session['center_id'] = center_data[0].center_id
        context['test'] = 'test'
        return context


class GetClassDataViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = "center_class_ajax.html"

    def get_context_data(self, **kwargs):
        context = super(GetClassDataViewAjax, self).get_context_data(**kwargs)
        center_id = self.request.session.get('center_id', '')
        error = None
        class_data = None

        if center_id is None or center_id == '':
            error = '센터 정보를 불러오지 못했습니다.'

        if error is None:
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=USE).order_by('-reg_dt')
            class_data = ClassTb.objects.filter(center_tb_id=center_id, use=USE).order_by('-reg_dt')
            # log_data.order_by('-reg_dt')

        if error is None:
            for class_info in class_data:
                class_info.subject_type_name = CommonCdTb.objects.get(common_cd=class_info.subject_cd)
                class_info.state_cd_name = CommonCdTb.objects.get(common_cd=class_info.state_cd)

        context['class_data'] = class_data

        if error is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+error)
            messages.error(self.request, error)

        return context


class GetTrainerDataViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = "center_member_ajax.html"

    def get_context_data(self, **kwargs):
        context = super(GetTrainerDataViewAjax, self).get_context_data(**kwargs)
        center_id = self.request.session.get('center_id', '')
        error = None

        if center_id is None or center_id == '':
            error = '센터 정보를 불러오지 못했습니다.'

        if error is None:
            member_data = CenterTrainerTb.objects.filter(center_id=center_id, use=USE).order_by('-mod_dt')

        context['member_data'] = member_data

        if error is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+error)
            messages.error(self.request, error)

        return context