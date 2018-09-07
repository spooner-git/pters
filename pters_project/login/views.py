import logging
import random

from django.contrib import messages
from django.contrib.auth.models import User, Group
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.views import password_reset_done
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.contrib.auth import authenticate, logout, login
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render, resolve_url
from django.urls import reverse
from django.utils import timezone
from django.views import View
from django.views.generic import TemplateView
from registration.backends.hmac.views import RegistrationView

# Create your views here.

from registration.forms import RegistrationForm

from configs import settings
from configs.const import USE

from .forms import MyPasswordResetForm
from .models import MemberTb, PushInfoTb, SnsInfoTb

logger = logging.getLogger(__name__)


class IndexView(View):
    template_name = 'login.html'

    # def get_context_data(self, **kwargs):
    def get(self, request):
        context = {}
        # print(str(request.user))
        logout(request)
        # context = super(IndexView, self).get_context_data(**kwargs)

        # acceptLang = self.request.META['HTTP_ACCEPT_LANGUAGE']
        # firstLang = acceptLang.split(',')[0]
        # if 'ko' in firstLang:
        #    print('ko')

        return render(request, self.template_name, context)


def login_trainer(request):
    # login 완료시 main page로 이동
    username = request.POST.get('username')
    password = request.POST.get('password')
    social_login_check = request.POST.get('social_login_check', '0')
    auto_login_check = request.POST.get('auto_login_check', '1')
    next_page = request.POST.get('next_page')
    error = None
    if next_page == '':
        next_page = '/trainer/'
    if next_page is None:
        next_page = '/trainer/'
    request.session['push_token'] = ''
    request.session['social_login_check'] = social_login_check
    if not error:
        # if password == 'kakao_login':
        #     user = authenticate(username=username)
        # else:
        if social_login_check == '0':
            user = authenticate(username=username, password=password)
        else:
            try:
                user = User.objects.get(username=username)
                user.backend = 'django.contrib.auth.backends.ModelBackend'
            except ObjectDoesNotExist:
                user = None

        if user is not None and user.is_active:
            login(request, user)
            if auto_login_check == '0':
                request.session.set_expiry(0)
            return redirect(next_page)

        elif user is not None and user.is_active == 0:
            member = None
            try:
                member = MemberTb.objects.get(member_id=user.id)
            except ObjectDoesNotExist:
                error = 'ID/비밀번호를 확인해주세요.'
            if error is None:
                if member.use == 1:
                    request.session['user_id'] = user.id
                    if user.email is None or user.email == '':
                        next_page = '/login/send_email_member/'
                    else:
                        next_page = '/login/resend_email_member/'
                    return redirect(next_page)
                else:
                    error = '이미 탈퇴한 회원입니다.'
        else:
            error = 'ID/비밀번호를 확인해주세요.'
            next_page = '/login/'
            # logger.error(error)

    if error is None:
        return redirect(next_page)
    else:
        messages.error(request, error)
        return redirect(next_page)


class LoginSimpleView(TemplateView):
    template_name = 'login_naver_processing.html'

    def get_context_data(self, **kwargs):
        context = super(LoginSimpleView, self).get_context_data(**kwargs)
        return context


class RegisterTrainerView(TemplateView):
    template_name = 'login_register_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(RegisterTrainerView, self).get_context_data(**kwargs)

        return context


class RegisterGeneralView(TemplateView):
    template_name = 'login_register_general.html'

    def get_context_data(self, **kwargs):
        context = super(RegisterGeneralView, self).get_context_data(**kwargs)

        return context


class RegisterBusinessView(TemplateView):
    template_name = 'login_register_business.html'

    def get_context_data(self, **kwargs):
        context = super(RegisterBusinessView, self).get_context_data(**kwargs)

        return context


class RegisterTypeSelectView(TemplateView):
    template_name = 'login_register_type.html'

    def get_context_data(self, **kwargs):
        context = super(RegisterTypeSelectView, self).get_context_data(**kwargs)

        return context


# 로그아웃 api
def logout_trainer(request):
    # logout 끝나면 login page로 이동
    # token = request.session.get('push_token', '')
    device_id = request.session.get('device_id', 'pc')
    error = None
    if device_id == 'pc':
        token_data = PushInfoTb.objects.filter(member_id=request.user.id, device_id=device_id)
        token_data.delete()

    logout(request)
    if error is not None:
            logger.error(request.user.last_name + ' ' + request.user.first_name
                         + '[' + str(request.user.id) + ']' + error)
    return redirect('/login/')


class AddNewMemberSnsInfoView(RegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request, *args, **kwargs):

        email = request.POST.get('email', '')
        name = request.POST.get('name', '')
        sex = request.POST.get('sex', '')
        sns_id = request.POST.get('sns_id', '')
        sns_type = request.POST.get('sns_type', 'naver')
        auto_login_check = request.POST.get('auto_login_check', '1')
        group_type = request.POST.get('group_type', 'trainer')

        error = None
        user = None

        try:
            user = User.objects.get(username=email)
        except ObjectDoesNotExist:
            error = None

        if user is not None:
            error = '이미 가입된 회원입니다.'

        if error is None:
            try:
                with transaction.atomic():

                    user = User.objects.create_user(username=email, first_name=name, last_name='', email=email,
                                                    password=sns_id, is_active=1)
                    group = Group.objects.get(name=group_type)
                    user.groups.add(group)

                    member = MemberTb(member_id=user.id, name=name, sex=sex,
                                      user_id=user.id, use=USE)
                    member.save()
                    sns_info = SnsInfoTb(member_id=user.id, sns_id=sns_id, sns_type=sns_type,
                                         sns_name=name, sns_connect_date=timezone.now(), use=USE)
                    sns_info.save()
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                    login(request, user)
                    request.session['social_login_check'] = '1'
                    if auto_login_check == '0':
                        request.session.set_expiry(0)
                    return redirect('/trainer/')

            except ValueError:
                error = '이미 가입된 회원입니다.'
            except IntegrityError:
                error = '등록 값에 문제가 있습니다.'
            except TypeError:
                error = '등록 값에 문제가 있습니다.'
            except ValidationError:
                error = '등록 값에 문제가 있습니다.'
            except InternalError:
                error = '이미 가입된 회원입니다.'

        if error is not None:
            logger.error(name+'['+email+']'+error)
            messages.error(request, error)

        return render(request, self.template_name)


class AddOldMemberSnsInfoView(RegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request, *args, **kwargs):

        # first_name = request.POST.get('first_name', '')
        email = request.POST.get('email', '')
        name = request.POST.get('name', '')
        sns_id = request.POST.get('sns_id', '')
        sns_type = request.POST.get('sns_type', 'naver')
        auto_login_check = request.POST.get('auto_login_check', '1')

        error = None
        user = None

        try:
            user = User.objects.get(username=email)
        except ObjectDoesNotExist:
            error = None

        if user is None:
            error = '로그인에 실패했습니다.'

        if error is None:
            try:
                with transaction.atomic():
                    sns_info = SnsInfoTb(member_id=user.id, sns_id=sns_id, sns_type=sns_type,
                                         sns_name=name, sns_connect_date=timezone.now(), use=USE)
                    sns_info.save()
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                    login(request, user)
                    request.session['social_login_check'] = '1'
                    if auto_login_check == '0':
                        request.session.set_expiry(0)
                    return redirect('/trainer/')

            except ValueError:
                error = '이미 가입된 회원입니다.'
            except IntegrityError:
                error = '등록 값에 문제가 있습니다.'
            except TypeError:
                error = '등록 값에 문제가 있습니다.'
            except ValidationError:
                error = '등록 값에 문제가 있습니다.'
            except InternalError:
                error = '이미 가입된 회원입니다.'

        if error is not None:
            logger.error(name+'['+email+']'+error)
            messages.error(request, error)

        return render(request, self.template_name)


class NewMemberSnsInfoView(TemplateView):
    template_name = 'send_sns_info_to_new_form.html'

    def post(self, request):
        context = {}
        context['username'] = self.request.POST.get('username')
        context['email'] = self.request.POST.get('email')
        context['name'] = self.request.POST.get('name')
        context['sns_id'] = self.request.POST.get('sns_id')
        context['sns_type'] = self.request.POST.get('sns_type')
        context['sex'] = self.request.POST.get('sex')

        return render(request, self.template_name, context)


class CheckSnsMemberInfoView(TemplateView):
    template_name = 'ajax/id_check_ajax.html'
    error = ''

    def get_context_data(self, **kwargs):
        context = super(CheckSnsMemberInfoView, self).get_context_data(**kwargs)
        user_email = self.request.GET.get('email', '')
        sns_id = self.request.GET.get('sns_id', '')
        username = ''

        context['error'] = '0'
        try:
            sns_info = SnsInfoTb.objects.select_related('member').get(sns_id=sns_id)
            username = sns_info.member.user.username
            context['error'] = '1'
        except ObjectDoesNotExist:
            sns_info = None

        if sns_info is None:
            try:
                user_info = User.objects.get(email=user_email)
                username = user_info.username
                context['error'] = '2'
            except ObjectDoesNotExist:
                username = ''

        context['username'] = username

        return context


# 회원가입 api
class NewMemberResendEmailAuthenticationView(RegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):
        form = RegistrationForm(request.POST, request.FILES)
        user_id = request.POST.get('username', '')
        email = request.POST.get('email', '')
        password = request.POST.get('password', '')
        member_type = request.POST.get('member_type', '')
        member_id = request.POST.get('member_id', '')
        error = None
        user = None
        username = None
        if member_id is None or member_id == '':
            error = 'ID를 입력해주세요.'
        else:
            if form.is_valid():
                if error is None:
                    if member_type == 'new':
                        if email is None or email == '':
                            error = 'Email을 입력해주세요.'
                        elif user_id is None or user_id == '':
                            error = 'ID를 입력해주세요.'

                if error is None:
                    try:
                        user = User.objects.get(id=member_id)
                    except ObjectDoesNotExist:
                        error = '가입되지 않은 회원입니다.'

                if error is None:
                    username = user.username
                    if member_type == 'new':
                        if error is None:
                            user.username = user_id
                            user.email = email
                            user.set_password(password)
                            user.save()
                if error is None:
                    # user = authenticate(username=username, password=password)
                    if user is not None:
                        if user.is_active:
                            error = '이미 인증된 ID 입니다.'
                        else:
                            self.send_activation_email(user)
                    else:
                        error = 'ID가 존재하지 않습니다.'

            else:
                for field in form:
                    if field.errors:
                        for err in field.errors:
                            if error is None or error == '':
                                if field.name == 'username':
                                    error = '사용할수 없는 ID 입니다.'
                                else:
                                    error = err
                            else:
                                if field.name != 'username':
                                    error += err

        if error is not None:
            logger.error(str(username)+'->'+str(user_id)+'['+str(email)+']'+str(error))
            messages.error(request, error)
        else:
            logger.error(str(username)+'->'+str(user_id)+'['+str(email)+'] 회원가입 완료')

        return render(request, self.template_name)


# 회원가입 api
class ResendEmailAuthenticationView(RegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):
        user_id = request.POST.get('username', '')
        email = request.POST.get('email', '')
        member_id = request.POST.get('member_id', '')
        error = None
        user = None
        username = None
        if member_id is None or member_id == '':
            error = 'ID를 입력해주세요.'
        if error is None:
            try:
                user = User.objects.get(id=member_id)
            except ObjectDoesNotExist:
                error = '가입되지 않은 회원입니다.'

        if error is None:
            # user = authenticate(username=username, password=password)
            if user is not None:
                if user.is_active:
                    error = '이미 인증된 ID 입니다.'
                else:
                    self.send_activation_email(user)
            else:
                error = 'ID가 존재하지 않습니다.'

        if error is not None:
            logger.error(str(username) + '->' + str(user_id) + '[' + str(email) + ']' + str(error))
            messages.error(request, error)
        else:
            logger.error(str(username) + '->' + str(user_id) + '[' + str(email) + '] 회원가입 완료')

        return render(request, self.template_name)


# 회원가입 api
class ResetPasswordView(View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):
        email = request.POST.get('email', '')
        error = None
        post_reset_redirect = None
        from_email = None
        # extra_context = None
        html_email_template_name = None
        extra_email_context = None
        form = None
        password_reset_form = MyPasswordResetForm
        token_generator = default_token_generator
        # template_name = 'registration_error_ajax.html'
        email_template_name = 'registration/password_reset_email.txt'
        subject_template_name = 'registration/password_reset_subject.txt'
        # context = None
        if email is None or email == '':
            error = 'Email 정보를 입력해주세요.'

        if error is None:
            if User.objects.filter(email=email).exists() is not True:
                error = '가입되지 않은 회원입니다.'

        if error is None:
            if post_reset_redirect is None:
                post_reset_redirect = reverse(password_reset_done)
            else:
                post_reset_redirect = resolve_url(post_reset_redirect)
            if request.method == "POST":
                form = password_reset_form(request.POST)
                if form.is_valid():
                    opts = {
                        'use_https': request.is_secure(),
                        'token_generator': token_generator,
                        'from_email': from_email,
                        'email_template_name': email_template_name,
                        'subject_template_name': subject_template_name,
                        'request': request,
                        'html_email_template_name': html_email_template_name,
                        'extra_email_context': extra_email_context,
                    }
                    form.save(**opts)
                    return HttpResponseRedirect(post_reset_redirect)
                else:
                    for field in form:
                        if field.errors:
                            for err in field.errors:
                                if error is None:
                                    error = err
                                else:
                                    error += err
            else:
                form = password_reset_form()

        if error is None:
            context = {
                'form': form,
                'title': 'Password reset',
            }
            # if extra_context is not None:
            #     context.update(extra_context)

            return render(request, self.template_name, context)
        else:
            logger.error(request.user.last_name + ' ' + request.user.first_name
                         + '[' + str(request.user.id) + ']' + error)
            messages.error(request, error)
            return render(request, self.template_name)


# 회원가입 api
def add_member_info_logic_test(request):
    user_id = request.POST.get('id', '')
    name = request.POST.get('name', '')
    phone = request.POST.get('phone', '')
    sex = request.POST.get('sex', '')
    group_type = request.POST.get('group_type', 'trainee')
    birthday_dt = request.POST.get('birthday', '')
    next_page = request.POST.get('next_page', '')

    error = None
    member = None
    user = None

    if user_id == '':
        error = 'ID를 입력해 주세요.'

    if group_type == '':
        group_type = 'trainee'

    if error is None:
        try:
            user = User.objects.get(username=user_id)

        except ObjectDoesNotExist:
            error = '필수 입력 사항을 확인해주세요.'

    if error is None:
        try:
            with transaction.atomic():
                group = Group.objects.get(name=group_type)
                user.groups.add(group)
                user.first_name = name
                user.save()
                if birthday_dt == '':
                    member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex,
                                      user_id=user.id, use=USE)
                else:
                    member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex,
                                      birthday_dt=birthday_dt, user_id=user.id, use=USE)
                member.save()
                # if group_type == 'trainer':
                #     class_info = ClassTb(member_id=user.id, class_type_cd='PT',
                #                         start_date=datetime.date.today(),
                #  end_date=datetime.date.today()+timezone.timedelta(days=3650),
                #                         class_hour=1, start_hour_unit=1, class_member_num=100,
                #                         state_cd='IP', reg_dt=timezone.now(), mod_dt=timezone.now(), use=USE)

                #    class_info.save()

        except ValueError:
            error = '이미 가입된 회원입니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '등록 값에 문제가 있습니다.'
        except InternalError:
            error = '이미 가입된 회원입니다.'

    if error is None:
        logger.info(member.name+' 회원 가입 완료')
        messages.info(request, '회원가입이 정상적으로 완료됐습니다.')
        return redirect(next_page)
    else:
        logger.error(name+'['+str(user_id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


class AddMemberView(RegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request, *args, **kwargs):

        form = RegistrationForm(request.POST, request.FILES)

        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        name = request.POST.get('name', '')
        phone = request.POST.get('phone', '')
        sex = request.POST.get('sex', '')
        group_type = request.POST.get('group_type', 'trainee')
        birthday_dt = request.POST.get('birthday', '')
        address = request.POST.get('address', '')
        country = request.POST.get('country', '')

        error = None

        if form.is_valid():
            user = None
            try:
                user = User.objects.get(username=form.cleaned_data['username'])
            except ObjectDoesNotExist:
                error = None

            if user is not None:
                error = '이미 가입된 회원입니다.'

            if error is None:
                try:
                    with transaction.atomic():
                        user = self.register(form)
                        group = Group.objects.get(name=group_type)
                        user.groups.add(group)
                        user.first_name = first_name
                        user.last_name = last_name
                        user.save()
                        if birthday_dt == '':
                            member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex,
                                              country=country, address=address, user_id=user.id, use=USE)
                        else:
                            member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex,
                                              country=country, address=address,
                                              birthday_dt=birthday_dt, user_id=user.id, use=USE)
                        member.save()
                        # if group_type == 'trainer':
                        #    class_info = ClassTb(member_id=user.id, subject_cd='WP',
                        #                         start_date=datetime.date.today(),
                        # end_date=datetime.date.today()+timezone.timedelta(days=3650),
                        #                         class_hour=1, start_hour_unit=1, class_member_num=100,
                        #                         state_cd='IP', reg_dt=timezone.now(), mod_dt=timezone.now(), use=USE)

                        #    class_info.save()
                except ValueError:
                    error = '이미 가입된 회원입니다.'
                except IntegrityError:
                    error = '등록 값에 문제가 있습니다.'
                except TypeError:
                    error = '등록 값에 문제가 있습니다.'
                except ValidationError:
                    error = '등록 값에 문제가 있습니다.'
                except InternalError:
                    error = '이미 가입된 회원입니다.'
        else:
            for field in form:
                if field.errors:
                    for err in field.errors:
                        if error is None:
                            if field.name == 'username':
                                error = '사용할수 없는 ID 입니다.'
                            else:
                                error = err
                        else:
                            if field.name != 'username':
                                error += err

        if error is not None:
            logger.error(name+'['+form.cleaned_data['email']+']'+error)
            messages.error(request, error)

        return render(request, self.template_name)


class AddMemberNoEmailView(View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):

        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        name = request.POST.get('name', '')
        # phone = request.POST.get('username', '')
        sex = request.POST.get('sex', '')
        birthday_dt = request.POST.get('birthday', '')
        phone = request.POST.get('phone', '')
        # group_id = request.POST.get('group_id', '')
        context = add_member_no_email_func(request.user.id, first_name, last_name, phone, sex, birthday_dt)
        if context['error'] is not None:
            logger.error(name+'[강사 회원가입]'+context['error'])
            messages.error(request, context['error'])

        return render(request, self.template_name, {'username': context['username'],
                                                    'user_db_id': context['user_db_id']})


class CheckMemberIdView(TemplateView):
    template_name = 'ajax/id_check_ajax.html'
    error = ''

    def get_context_data(self, **kwargs):
        context = super(CheckMemberIdView, self).get_context_data(**kwargs)
        user_id = self.request.GET.get('id', '')
        form = RegistrationForm(self.request.GET, self.request.FILES)
        if user_id is None or user_id == '':
            self.error = 'ID를 입력해주세요.'
        else:
            if form.is_valid():
                if User.objects.filter(username=user_id).exists():
                    self.error = '사용 불가'
            else:
                for field in form:
                    if field.errors:
                        for err in field.errors:
                            if self.error is None or self.error == '':
                                if field.name == 'username':
                                    self.error = err
                                else:
                                    self.error = ''
                            else:
                                if field.name == 'username':
                                    self.error += err

        if self.error != '':
            self.error = self.error.replace("이름", "ID")
            if self.error == '해당 사용자 ID은 이미 존재합니다.':
                self.error = '사용 불가'

        if self.error != '':
            context['error'] = self.error

        return context


class CheckMemberEmailView(TemplateView):
    template_name = 'ajax/id_check_ajax.html'
    error = ''

    def get_context_data(self, **kwargs):
        context = super(CheckMemberEmailView, self).get_context_data(**kwargs)
        user_email = self.request.GET.get('email', '')
        form = RegistrationForm(self.request.GET, self.request.FILES)
        if user_email is None or user_email == '':
            self.error = 'Email을 입력해주세요.'
        else:
            user_data = User.objects.filter(email=user_email)

            if len(user_data) > 0:
                self.error = '사용 불가'
                context['username'] = user_data[0].username

            if self.error is None or self.error == '':
                if form.is_valid():
                    if User.objects.filter(email=user_email).exists():
                        self.error = '사용 불가'
                else:
                    for field in form:
                        if field.errors:
                            for err in field.errors:
                                if self.error is None or self.error == '':
                                    if field.name == 'email':
                                        self.error = err
                                    else:
                                        self.error = ''
                                else:
                                    if field.name == 'email':
                                        self.error += err
        if self.error != '':
            context['error'] = self.error

        return context


class CheckMemberValidationView(View):
    template_name = 'ajax/id_check_ajax.html'
    error = ''

    def post(self, request):
        context = {}
        # context = super(CheckMemberValidationView, self).get_context_data(**kwargs)
        form = RegistrationForm(self.request.POST, self.request.FILES)
        if form.is_valid():
            self.error = ''
        else:
            for field in form:
                if field.errors:
                    for err in field.errors:
                        if self.error is None or self.error == '':
                            if field.name == 'username':
                                self.error = '사용할수 없는 ID 입니다.'
                            else:
                                self.error = err
                        else:
                            if field.name != 'username':
                                self.error += err
        if self.error != '':
            context['error'] = self.error
        return render(request, self.template_name, context)


class CheckMemberPasswordValidationView(View):
    template_name = 'ajax/id_check_ajax.html'
    error = ''

    def post(self, request):
        context = {}
        # context = super(CheckMemberValidationView, self).get_context_data(**kwargs)
        form = RegistrationForm(self.request.POST, self.request.FILES)
        if form.is_valid():
            self.error = ''
        else:
            for field in form:
                if field.errors:
                    for err in field.errors:
                        if self.error is None or self.error == '':
                            if field.name == 'password2':
                                self.error = err
                        else:
                            if field.name == 'password2':
                                self.error += err
        if self.error != '':
            context['error'] = self.error
        return render(request, self.template_name, context)


class RegisterErrorView(TemplateView):
    template_name = 'ajax/registration_error_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(RegisterErrorView, self).get_context_data(**kwargs)

        return context


class NewMemberSendEmailView(TemplateView):
    template_name = 'send_email_to_new_form.html'

    def get_context_data(self, **kwargs):
        context = super(NewMemberSendEmailView, self).get_context_data(**kwargs)

        return context


class NewMemberReSendEmailView(View):
    template_name = 'send_email_to_reconfirm_form.html'

    def get(self, request):
        context = {}
        # context = super(NewMemberReSendEmailView, self).get_context_data(**kwargs)
        user_id = request.session.get('user_id', '')
        error = None
        user = None
        if user_id is None or user_id == '':
            error = '정보를 불러오지 못했습니다.'
        if error is None:
            try:
                user = User.objects.get(id=user_id)
            except ObjectDoesNotExist:
                error = '정보를 불러오지 못했습니다.'

        if error is None:
            context['user_email'] = user.email

        context['activation_days'] = getattr(settings, "ACCOUNT_ACTIVATION_DAYS", '')

        return render(request, self.template_name, context)


# 회워탈퇴 api
def out_member_logic(request):
    # next_page = request.POST.get('next_page')
    next_page = '/login/'
    error = None

    member_id = request.user.id
    user = None
    member = None
    if member_id == '':
        error = 'ID를 확인해 주세요.'

    if error is None:

        try:
            user = User.objects.get(id=member_id)
        except ObjectDoesNotExist:
            error = 'ID를 확인해 주세요.'

    if error is None:
        try:
            member = MemberTb.objects.get(user_id=user.id, use=USE)
        except ObjectDoesNotExist:
            error = 'ID를 확인해 주세요.'

    # if error is None:
    #    group = user.groups.get(user=request.user.id)

    if error is None:
        try:
            with transaction.atomic():
                user.is_active = 0
                user.save()
                member.use = 0
                member.save()

        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '등록 값에 문제가 있습니다.'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:
        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


class AddPushTokenView(View):
    template_name = 'ajax/token_check_ajax.html'
    error = ''

    def post(self, request):
        keyword = request.POST.get('token_info', '')
        device_id = request.POST.get('device_id', 'pc')
        user_agent = request.META['HTTP_USER_AGENT']
        add_token_check = False
        if keyword == '' or device_id == '' or keyword is None or device_id is None:
            self.error = 'token 정보를 불러오지 못했습니다.'

        if self.error == '':
            if str(request.user) != 'AnonymousUser':
                if device_id == 'pc':
                    token_data = PushInfoTb.objects.filter(member_id=request.user.id, device_id=device_id, use=USE)
                else:
                    token_data = PushInfoTb.objects.filter(device_id=device_id, use=USE)

                if len(token_data) == 0:
                    add_token_check = True
                elif len(token_data) == 1:
                    token_data.update(token=keyword, last_login=timezone.now(), member_id=request.user.id,
                                      session_info=request.session.session_key, device_info=str(user_agent))
                else:
                    token_data.delete()
                    add_token_check = True

                if add_token_check:
                    token_data = PushInfoTb.objects.filter(token=keyword, use=USE)
                    if len(token_data) > 0:
                        token_data.delete()

                    token_info = PushInfoTb(member_id=request.user.id, token=keyword, last_login=timezone.now(),
                                            session_info=request.session.session_key, device_id=device_id,
                                            device_info=str(user_agent), use=USE)
                    token_info.save()
                request.session['device_id'] = device_id
                request.session['push_token'] = keyword

        return render(request, self.template_name, {'token_check': True})


class DeletePushTokenView(View):
    template_name = 'ajax/token_check_ajax.html'
    error = ''

    def post(self, request):
        device_id = request.POST.get('device_id', '')
        if device_id != '':
            token_data = PushInfoTb.objects.filter(device_id=device_id, use=USE)
            if len(token_data) > 0:
                token_data.delete()

        return render(request, self.template_name, {'token_check': True})


class ClearBadgeCounterView(TemplateView):
    template_name = 'ajax/token_check_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(ClearBadgeCounterView, self).get_context_data(**kwargs)

        # logger.error(self.request.user.last_name+' '+self.request.user.first_name+
        # '['+str(self.request.user.id)+']'+push_token)

        return context


def clear_badge_counter_logic(request):
    push_token = request.session.get('push_token', '')
    error = None
    token_data = None
    if push_token is None or push_token == '':
        error = 'Push 정보를 가져올 수 없습니다'

    logger.info(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+push_token)
    if error is None:
        try:
            token_data = PushInfoTb.objects.get(token=push_token, use=USE)
        except ObjectDoesNotExist:
            error = 'Push 정보를 가져올 수 없습니다'

    if error is None:
        token_data.badge_counter = 0
        token_data.save()

    if error is None:
        return render(request, 'ajax/token_check_ajax.html', {'token_check': token_data.token})
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        # messages.error(request, error)

        return render(request, 'ajax/token_check_ajax.html', {'token_check': ''})


def add_member_no_email_func(user_id, first_name, last_name, phone, sex, birthday_dt):
    error = None
    name = ''
    password = '0000'
    username = ''
    context = {'error': None, 'user_db_id': '', 'username': ''}

    if last_name is None or last_name == '':
        error = '성을 입력해 주세요.'

    if first_name is None or first_name == '':
        error = '이름을 입력해 주세요.'

    if error is None:
        name = last_name + first_name
        if name == '':
            error = '이름을 입력해 주세요.'
        else:
            name = name.replace(' ', '')
    if sex == '':
        sex = None

    if phone == '':
        phone = None
    else:
        if len(phone) != 11 and len(phone) != 10:
            error = '연락처 자릿수를 확인해주세요.'
        elif not phone.isdigit():
            error = '연락처는 숫자만 입력 가능합니다.'

    if error is None:

        i = 0
        count = MemberTb.objects.filter(name=name).count()
        max_range = (100 * (10 ** len(str(count)))) - 1

        # while test:
        for i in range(0, 100):
            username = name + str(random.randrange(0, max_range)).zfill(len(str(max_range)))
            try:
                User.objects.get(username=username)
            except ObjectDoesNotExist:
                break

        if i == 100:
            error = 'ID 생성에 실패했습니다. 다시 시도해주세요.'

    if error is None:
        try:
            with transaction.atomic():
                user = User.objects.create_user(username=username, first_name=first_name, last_name=last_name,
                                                password=password, is_active=0)
                group = Group.objects.get(name='trainee')
                user.groups.add(group)
                if birthday_dt == '':
                    member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex, reg_info=user_id,
                                      user_id=user.id)
                else:
                    member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex, reg_info=user_id,
                                      birthday_dt=birthday_dt, user_id=user.id)
                member.save()
                context['username'] = username
                context['user_db_id'] = user.id

        except ValueError:
            error = '이미 가입된 회원입니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '등록 값에 문제가 있습니다.'
        except InternalError:
            error = '이미 가입된 회원입니다.'

    context['error'] = error

    return context
