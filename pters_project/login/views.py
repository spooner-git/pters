import logging
from django.contrib import messages
from django.contrib.auth.models import User, Group
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.views import password_reset_done
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.contrib.auth import authenticate, logout, login
from django.core.mail import EmailMessage
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render, resolve_url
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from registration.backends.hmac.views import RegistrationView

# Create your views here.
from django.views.generic import TemplateView

from registration.forms import RegistrationForm

from configs import settings
from configs.const import USE
from login.forms import MyPasswordResetForm
from login.models import MemberTb, PushInfoTb, QATb

logger = logging.getLogger(__name__)


class IndexView(View):
    template_name = 'login.html'

    # def get_context_data(self, **kwargs):
    def get(self, request):
        context = {}
        logout(request)
        # context = super(IndexView, self).get_context_data(**kwargs)

        # acceptLang = self.request.META['HTTP_ACCEPT_LANGUAGE']
        # firstLang = acceptLang.split(',')[0]
        # if 'ko' in firstLang:
        #    print('ko')

        return render(request, self.template_name, context)


@csrf_exempt
def login_trainer(request):
    # login 완료시 main page로 이동
    username = request.POST.get('username')
    password = request.POST.get('password')
    keyword = request.POST.get('keyword', '')
    auto_login_check = request.POST.get('auto_login_check', '0')
    next_page = request.POST.get('next_page')
    error = None
    if next_page == '':
        next_page = '/trainer/'
    if next_page is None:
        next_page = '/trainer/'

    user_agent = request.META['HTTP_USER_AGENT']

    if not error:
        user = authenticate(username=username, password=password)

        if user is not None and user.is_active:
            login(request, user)
            if auto_login_check == '0':
                request.session.set_expiry(0)

            try:
                token_data = PushInfoTb.objects.get(token=keyword, use=USE)
                if token_data.member_id == user.id:
                    token_exist = True
                    token_data.last_login = timezone.now()
                    token_data.save()
                else:
                    token_data.delete()
                    token_exist = False
            except ObjectDoesNotExist:
                token_exist = False

            if token_exist is False:
                if keyword is not None and keyword != '':
                    token_info = PushInfoTb(member_id=user.id, token=keyword, last_login=timezone.now(),
                                            session_info=request.session.session_key,
                                            device_info=str(user_agent), use=USE)
                    token_info.save()

            request.session['push_token'] = keyword

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
    token = request.session.get('push_token', '')
    error = None
    if token is not None and token != '':
        try:
            token_data = PushInfoTb.objects.get(member_id=request.user.id, token=token)
            token_data.delete()
        except ObjectDoesNotExist:
            error = 'token data 없음 : PC 버전'

    logout(request)
    if error is not None:
            logger.error(request.user.last_name + ' ' + request.user.first_name
                         + '[' + str(request.user.id) + ']' + error)
    return redirect('/')


# 회원가입 api
class ResendEmailAuthenticationView(RegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request, *args, **kwargs):
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
            error = 'email 정보를 입력해주세요.'

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
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError:
            error = '등록 값의 형태가 문제 있습니다.'
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
                    error = '등록 값의 형태가 문제 있습니다.'
                except ValidationError:
                    error = '등록 값의 형태가 문제 있습니다.'
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


@method_decorator(csrf_exempt, name='dispatch')
class CheckMemberIdView(View):
    template_name = 'ajax/id_check_ajax.html'
    error = ''

    def get(self, request):

        return render(request, self.template_name)

    def post(self, request):
        user_id = request.POST.get('id', '')
        form = RegistrationForm(request.POST, request.FILES)
        if user_id is None or user_id == '':
            self.error = 'ID를 입력해주세요.'
        else:
            if form.is_valid():
                if User.objects.filter(username=user_id).exists():
                    self.error = '사용중인 아이디 입니다.'
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
                self.error = '사용중인 이이디 입니다.'
        return render(request, self.template_name, {'error': self.error})


@method_decorator(csrf_exempt, name='dispatch')
class CheckMemberEmailView(View):
    template_name = 'ajax/id_check_ajax.html'
    error = ''

    def get(self, request):

        return render(request, self.template_name)

    def post(self, request):
        user_email = request.POST.get('email', '')
        form = RegistrationForm(request.POST, request.FILES)
        if user_email is None or user_email == '':
            self.error = 'email를 입력해주세요.'
        else:

            if User.objects.filter(email=user_email).exists():
                self.error = '사용중인 이메일 입니다.'

            if self.error is None or self.error == '':
                if form.is_valid():
                    if User.objects.filter(email=user_email).exists():
                        self.error = '사용중인 이메일 입니다.'
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

        return render(request, self.template_name, {'error': self.error})


@method_decorator(csrf_exempt, name='dispatch')
class CheckMemberValidationView(View):
    template_name = 'ajax/id_check_ajax.html'
    error = ''

    def get(self, request):

        return render(request, self.template_name)

    def post(self, request):
        form = RegistrationForm(request.POST, request.FILES)
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
        return render(request, self.template_name, {'error': self.error})


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
            error = '회원 정보를 불러오지 못했습니다.'
        if error is None:
            try:
                user = User.objects.get(id=user_id)
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'

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
        error = '회원 ID를 확인해 주세요.'

    if error is None:

        try:
            user = User.objects.get(id=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    if error is None:
        try:
            member = MemberTb.objects.get(user_id=user.id, use=USE)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

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
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:
        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


@method_decorator(csrf_exempt, name='dispatch')
class AddPushTokenView(View):
    template_name = 'ajax/token_check_ajax.html'
    error = ''

    def post(self, request):
        keyword = request.POST.get('keyword', '')
        user_agent = request.META['HTTP_USER_AGENT']
        try:
            token_data = PushInfoTb.objects.get(token=keyword, use=USE)
            if token_data.member_id == request.user.id:
                token_exist = True
                token_data.last_login = timezone.now()
                token_data.save()
            else:
                token_data.delete()
                token_exist = False
        except ObjectDoesNotExist:
            token_exist = False

        if token_exist is False:
            if keyword is not None and keyword != '':
                token_info = PushInfoTb(member_id=request.user.id, token=keyword, last_login=timezone.now(),
                                        session_info=request.session.session_key,
                                        device_info=str(user_agent), use=USE)
                token_info.save()

        request.session['push_token'] = keyword
        return render(request, self.template_name, {'token_check': token_exist})


@method_decorator(csrf_exempt, name='dispatch')
class DeletePushTokenView(View):
    template_name = 'ajax/token_check_ajax.html'
    error = ''

    def get(self, request):

        return render(request, self.template_name)

    def post(self, request):
        keyword = request.POST.get('keyword', '')
        try:
            token_data = PushInfoTb.objects.get(token=keyword, use=USE)
            token_data.delete()
            token_exist = False
        except ObjectDoesNotExist:
            token_exist = False

        return render(request, self.template_name, {'token_check': token_exist})


class ClearBadgeCounterView(TemplateView):
    template_name = 'ajax/token_check_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(ClearBadgeCounterView, self).get_context_data(**kwargs)

        # logger.error(self.request.user.last_name+' '+self.request.user.first_name+
        # '['+str(self.request.user.id)+']'+push_token)

        return context


@csrf_exempt
def clear_badge_counter_logic(request):
    push_token = request.session.get('push_token', '')
    error = None
    token_data = None
    if push_token is None or push_token == '':
        error = '푸시 정보를 가져올 수 없습니다'

    logger.info(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+push_token)
    if error is None:
        try:
            token_data = PushInfoTb.objects.get(token=push_token, use=USE)
        except ObjectDoesNotExist:
            error = '푸시 정보를 가져올 수 없습니다'

    if error is None:
        token_data.badge_counter = 0
        token_data.save()

    if error is None:
        return render(request, 'ajax/token_check_ajax.html', {'token_check': token_data.token})
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        # messages.error(request, error)

        return render(request, 'ajax/token_check_ajax.html', {'token_check': error})


@csrf_exempt
def question_reg_logic(request):

    qa_type_cd = request.POST.get('inquire_type', '')
    title = request.POST.get('inquire_subject', '')
    contents = request.POST.get('inquire_body', '')
    next_page = request.POST.get('next_page')
    error = None

    if qa_type_cd == '' or qa_type_cd is None:
        error = '문의 유형을 선택해주세요.'

    if error is None:
        qa_info = QATb(member_id=request.user.id, qa_type_cd=qa_type_cd, title=title, contents=contents,
                       status='0', use=USE)
        qa_info.save()

    if error is None:
        email = EmailMessage('[PTERS 질문]'+request.user.last_name+request.user.first_name+'회원-'+title,
                             '질문 유형:'+qa_type_cd+'\n\n'+contents + '\n\n' + request.user.email +
                             '\n\n' + str(timezone.now()),
                             to=['support@pters.co.kr'])
        email.send()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        messages.info(request, qa_type_cd+'/'+title+'/'+contents)

        return redirect(next_page)


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
        username = name

    if error is None:

        count = MemberTb.objects.filter(name=username).count()
        if count != 0:
            # username += str(count + 1)
            test = False
            i = count + 1

            while True:
                username = last_name + first_name + str(i)
                try:
                    User.objects.get(username=username)
                except ObjectDoesNotExist:
                    test = True

                if test:
                    break
                else:
                    i += 1

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
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '이미 가입된 회원입니다.'

    context['error'] = error

    return context
