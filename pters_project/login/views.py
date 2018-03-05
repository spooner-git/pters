from django.contrib import messages
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import authenticate, logout, login
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt


# Create your views here.
from django.views.generic import TemplateView


class IndexView(TemplateView):
    template_name = 'login.html'

    def get_context_data(self, **kwargs):
        logout(self.request)
        context = super(IndexView, self).get_context_data(**kwargs)

        return context


@csrf_exempt
def login_trainer(request):
    #login 완료시 main page로 이동
    username = request.POST.get('username')
    password = request.POST.get('password')
    next_page = request.POST.get('next_page')
    error = None
    if next_page == '':
        next_page = '/trainer/'
    if next_page is None:
        next_page = '/trainer/'

    try:
        User.objects.get(username=username)
    except ObjectDoesNotExist:
        error = '아이디가 존재하지 않습니다.'

    if not error:
        user = authenticate(username=username, password=password)
        if user is not None and user.is_active:
            login(request, user)
            #member_detail = MemberTb.objects.get(user_id=user_data.id)
            # request.session['is_first_login'] = True
            #request.session['member_id'] = member_detail.member_id

            return redirect(next_page)
        else:
            error = '로그인에 실패하였습니다.'
            # logger.error(error)

    if error is None:
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


class RegisterView(TemplateView):
    template_name = 'register_member.html'

    def get_context_data(self, **kwargs):
        context = super(RegisterView, self).get_context_data(**kwargs)

        return context


# 로그아웃 api
@csrf_exempt
def logout_trainer(request):
    #logout 끝나면 login page로 이동
    logout(request)
    return redirect('/login/')

