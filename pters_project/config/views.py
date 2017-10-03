from django.shortcuts import render

# Create your views here.
from django.views.generic import TemplateView
from login.models import MemberTb
from django.contrib.auth.mixins import LoginRequiredMixin
from config.settings import LOGIN_URL


class HomeView(LoginRequiredMixin, TemplateView):
    #login_url = LOGIN_URL
    template_name = 'main_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(HomeView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context


def get_login_member_info(context):
    #user = User.objects.get(username='admin').select_related
    #member_detail = MemberTb.objects.get(user_id='2')
    #print(member_detail.user.username)
    #print(member_detail.name)
    #context['login_member'] = member_detail

    return context

