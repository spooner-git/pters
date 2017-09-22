from django.shortcuts import render

# Create your views here.
from django.views.generic import TemplateView
from mobile.models import MemberTb


class HomeView(TemplateView):
    template_name = 'main_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(HomeView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context


def get_login_member_info(context):
    member_detail = MemberTb.objects.filter(member_id='TB05000002')
    context['login_member'] = list(member_detail)[0]

    return context

