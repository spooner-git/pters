from django.http import HttpResponseRedirect
from django.shortcuts import render, get_object_or_404, render_to_response, redirect

# Create your views here.
from django.views.generic import TemplateView
from config.views import get_login_member_info
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.contrib.auth import authenticate,logout, login
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.mixins import LoginRequiredMixin


class IndexView(LoginRequiredMixin, TemplateView):
    #def get(self, request):
    #    if request.is_mobile:
    #        return redirect('mobile:index')

    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context


class PtAddView(LoginRequiredMixin, TemplateView):
    template_name = 'pt_add.html'

    def get_context_data(self, **kwargs):
        context = super(PtAddView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context


class OffAddView(LoginRequiredMixin, TemplateView):
    template_name = 'off_add.html'

    def get_context_data(self, **kwargs):
        context = super(OffAddView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context


class OffRepeatAddView(LoginRequiredMixin, TemplateView):
    template_name = 'off_repeat_add.html'

    def get_context_data(self, **kwargs):
        context = super(OffRepeatAddView, self).get_context_data(**kwargs)
        context = get_login_member_info(context)

        return context


class ManageMemberView(LoginRequiredMixin, TemplateView):
    template_name = 'manage_member.html'

    def get_context_data(self, **kwargs):
        context = super(ManageMemberView, self).get_context_data(**kwargs)
        get_login_member_info(context)

        return context


class AddMemberView(LoginRequiredMixin, TemplateView):
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


# 로그인 api
@csrf_exempt
def login_trainer(request, next='home'):
    #login 완료시 main page로 이동
    username = request.POST.get('username')
    password = request.POST.get('password')

    error = None

    try:
        trainer = User.objects.get(username=username)
    except ObjectDoesNotExist:
        error = '아이디가 존재하지 않습니다.'
        # logger.error(error)

    if not error:
        user = authenticate(username=username, password=password)
        if user is not None and user.is_active:
            login(request, user)
            #member_detail = MemberTb.objects.get(user_id=trainer.id)
            #request.session['is_first_login'] = True
            #request.session['trainer_name'] = member_detail.name

            return redirect(next)
        else:
            error = '로그인에 실패하였습니다.'
            #logger.error(error)

    messages.info(request, error)
    return redirect(next)


# 로그아웃 api
@csrf_exempt
def logout_trainer(request):
    #logout 끝나면 login page로 이동
    next = 'trainer:trainer_login'
    logout(request)

    return redirect(next)


# 로그인 페이지 아직 구현 x
@csrf_exempt
def login_trainer_view(request):
    if request.user.is_authenticated():
        return redirect('home')

    next = request.GET.get('next', 'trainer:login')
    fail = request.GET.get('fail', 'registration_page')

    return render(request, 'login_web.html',
                  {
                      'next': next,
                      'fail': fail
                  })
