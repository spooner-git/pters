from django.http import HttpResponseRedirect
from django.shortcuts import render, get_object_or_404, render_to_response, redirect

# Create your views here.
from django.template import RequestContext
from django.urls import reverse
from django.utils.regex_helper import Choice
from django.views.generic import TemplateView
from config.views import get_login_member_info


class IndexView(TemplateView):
    def get(self, request):
        if request.is_mobile:
            return redirect('mobile:index')

    template_name = 'login_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context


class PtAddView(TemplateView):
    template_name = 'pt_add.html'

    def get_context_data(self, **kwargs):
        context = super(PtAddView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context


class OffAddView(TemplateView):
    template_name = 'off_add.html'

    def get_context_data(self, **kwargs):
        context = super(OffAddView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context


class OffRepeatAddView(TemplateView):
    template_name = 'off_repeat_add.html'

    def get_context_data(self, **kwargs):
        context = super(OffRepeatAddView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context


class ManageMemberView(TemplateView):
    template_name = 'manage_member.html'

    def get_context_data(self, **kwargs):
        context = super(ManageMemberView, self).get_context_data(**kwargs)
        get_login_member_info(context)

        return context


class AddMemberView(TemplateView):
    template_name = 'member_add.html'

    def get_context_data(self, **kwargs):
        context = super(AddMemberView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context


class LogInTrainerView(TemplateView):
    template_name = 'login_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(LogInTrainerView, self).get_context_data(**kwargs)

        return context