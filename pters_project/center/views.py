from django.contrib.auth.mixins import LoginRequiredMixin

# Create your views here.
from django.views.generic import RedirectView
from django.views.generic import TemplateView

from configs.views import AccessTestMixin


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
        context['test'] = 'test'
        return context

