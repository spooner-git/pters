import logging

# Create your views here.
from django.views.generic import TemplateView

logger = logging.getLogger(__name__)


class IndexView(TemplateView):
    template_name = 'index_stats.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        return context

