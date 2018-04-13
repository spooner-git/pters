import datetime

import logging
from django.contrib import messages
from django.contrib.auth.models import User, Group
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.views import password_reset, password_reset_done
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.contrib.auth import authenticate, logout, login
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render, resolve_url
from django.template.response import TemplateResponse
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from registration.backends.hmac.views import RegistrationView

# Create your views here.
from django.views.generic import TemplateView

#from login.forms import ProfileForm
from django.views.generic.base import ContextMixin
from registration.forms import RegistrationForm

from configs import settings
from login.forms import MyPasswordResetForm
from login.models import MemberTb, PushInfoTb
# from schedule.models import ClassTb
from schedule.models import MemberLectureTb

logger = logging.getLogger(__name__)


class IndexView(TemplateView):
    template_name = 'login.html'

    def get_context_data(self, **kwargs):
        logout(self.request)
        context = super(IndexView, self).get_context_data(**kwargs)

        # acceptLang = self.request.META['HTTP_ACCEPT_LANGUAGE']
        # firstLang = acceptLang.split(',')[0]
        # if 'ko' in firstLang:
        #    print('ko')

        return context


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

    if not error:
        user = authenticate(username=username, password=password)

        if user is not None and user.is_active:
            login(request, user)
            if auto_login_check == '0':
                request.session.set_expiry(0)

            token_exist = False
            try:
                token_data = PushInfoTb.objects.get(token=keyword, use=1)
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
                    token_info = PushInfoTb(member_id=user.id, token=keyword,last_login=timezone.now(), use=1)
                    token_info.save()

            request.session['push_token'] = keyword
            # request.session['is_first_login'] = True
            # request.session['member_id'] = member_detail.member_id

            return redirect(next_page)
        elif user is not None and user.is_active == 0:
            try:
                member = MemberTb.objects.get(member_id=user.id)
            except ObjectDoesNotExist:
                error = 'ID/비밀번호를 확인해주세요.'
            if error is None:
                if member.use == 1:
                    request.session['username'] = user.username
                    if user.email is None or user.email == '':
                        next_page = '/login/send_email_member/'
                    else:
                        next_page = '/login/resend_email_member/'
                    return redirect(next_page)
                else:
                    error = '이미 탈퇴한 회원입니다.'
        else:
            error = 'ID/비밀번호를 확인해주세요.'
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

    if token is not None and token != '':
        try:
            token_data = PushInfoTb.objects.get(member_id=request.user.id, token=token)
            token_data.delete()
        except ObjectDoesNotExist:
            None

    logout(request)

    return redirect('/login/')


# 회원가입 api
class ResendEmailAuthenticationView(RegistrationView, View):
    template_name = 'registration_error_ajax.html'

    def post(self, request, *args, **kwargs):
        username = request.POST.get('username', '')
        user_id = request.POST.get('id', '')
        email = request.POST.get('email', '')
        password = request.POST.get('password', '')
        member_type = request.POST.get('member_type', '')
        error = None
        user = None

        if username is None or username == '':
            error = 'ID를 입력해주세요.'

        if error is None:
            if member_type == 'new':
                if password is None or password == '':
                    error = '비밀번호를 입력해주세요.'
                else:
                    if len(password) < 8:
                        error = '비밀번호는 8자 이상 입력햇주세요.'

        if error is None:
            if member_type == 'new':
                if email is None or email == '':
                    error = 'email을 입력해주세요'

        if error is None:
            if member_type == 'id':
                if email is None or email == '':
                    error = 'id를 입력해주세요'

        if error is None:
            if member_type == 'new':
                try:
                    User.objects.get(username=user_id)
                except ObjectDoesNotExist:
                    error = '존재 하지 않음'
                if error is None:
                    error = '이미 가입된 ID 입니다.'
                else:
                    error = None

        if error is None:
            if member_type == 'new':
                try:
                    User.objects.get(email=email)
                except ObjectDoesNotExist:
                    error = '존재 하지 않음'
                if error is None:
                    error = '이미 가입된 email 입니다.'
                else:
                    error = None

        if error is None:
            try:
                user = User.objects.get(username=username)
            except ObjectDoesNotExist:
                error = '가입되지 않은 회원입니다.'

        if error is None:
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

        if error is not None:
            logger.error(username+'->'+user_id+'['+email+']'+error)
            messages.error(request, error)
        else:
            logger.error(username+'->'+user_id+'['+email+'] 회원가입 완료')

        return render(request, self.template_name)


# 회원가입 api
class ResetPasswordView(View):
    template_name = 'registration_error_ajax.html'

    def post(self, request, *args, **kwargs):
        email = request.POST.get('email', '')
        error = None
        post_reset_redirect = None
        from_email = None
        extra_context = None
        html_email_template_name = None
        extra_email_context = None
        password_reset_form = MyPasswordResetForm
        token_generator = default_token_generator
        # template_name = 'registration_error_ajax.html'
        email_template_name = 'registration/password_reset_email.txt'
        subject_template_name = 'registration/password_reset_subject.txt'
        context = None
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
                'title': _('Password reset'),
            }
            if extra_context is not None:
                context.update(extra_context)

            return render(request, self.template_name, context)
        else:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+error)
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
                                      mod_dt=timezone.now(), reg_dt=timezone.now(), user_id=user.id, use=1)
                else:
                    member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex, mod_dt=timezone.now(), reg_dt=timezone.now(),
                                      birthday_dt=birthday_dt,user_id=user.id, use=1)
                member.save()
                # if group_type == 'trainer':
                #     class_info = ClassTb(member_id=user.id, class_type_cd='PT',
                #                         start_date=datetime.date.today(), end_date=datetime.date.today()+timezone.timedelta(days=3650),
                #                         class_hour=1, start_hour_unit=1, class_member_num=100,
                #                         state_cd='IP', reg_dt=timezone.now(), mod_dt=timezone.now(), use=1)

                #    class_info.save()

        except ValueError as e:
            error = '이미 가입된 회원입니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.1'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다.2'
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
    template_name = 'registration_error_ajax.html'

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
                                              country=country, address=address,
                                              mod_dt=timezone.now(), reg_dt=timezone.now(), user_id=user.id, use=1)
                        else:
                            member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex,
                                              country=country, address=address,
                                              birthday_dt=birthday_dt,
                                              mod_dt=timezone.now(), reg_dt=timezone.now(), user_id=user.id, use=1)
                        member.save()
                        # if group_type == 'trainer':
                        #    class_info = ClassTb(member_id=user.id, subject_cd='WP',
                        #                         start_date=datetime.date.today(), end_date=datetime.date.today()+timezone.timedelta(days=3650),
                        #                         class_hour=1, start_hour_unit=1, class_member_num=100,
                        #                         state_cd='IP', reg_dt=timezone.now(), mod_dt=timezone.now(), use=1)

                        #    class_info.save()
                except ValueError as e:
                    error = '이미 가입된 회원입니다.'
                except IntegrityError as e:
                    error = '등록 값에 문제가 있습니다.'
                except TypeError as e:
                    error = '등록 값의 형태가 문제 있습니다.'
                except ValidationError as e:
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
    template_name = 'registration_error_ajax.html'

    def post(self, request, *args, **kwargs):

        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        name = request.POST.get('name', '')
        phone = request.POST.get('username', '')
        sex = request.POST.get('sex', '')
        birthday_dt = request.POST.get('birthday', '')
        # contents = request.POST.get('contents', '')

        error = None

        if User.objects.filter(username=phone).exists():
            error = '이미 가입된 회원 입니다.'
        # elif User.objects.filter(email=email).exists():
        #    error = '이미 가입된 회원 입니다.'
        elif name == '':
            error = '이름을 입력해 주세요.'
        elif phone == '':
            error = '연락처를 입력해 주세요.'
        elif len(phone) != 11 and len(phone) != 10:
            error = '연락처를 확인해 주세요.'
        elif not phone.isdigit():
            error = '연락처를 확인해 주세요.'

        if error is None:
            if len(phone) == 11:
                password = phone[7:]
            elif len(phone) == 10:
                password = phone[6:]

        if error is None:
            try:
                with transaction.atomic():
                    user = User.objects.create_user(username=phone, first_name=first_name, last_name=last_name, password=password, is_active=0)
                    group = Group.objects.get(name='trainee')
                    user.groups.add(group)
                    if birthday_dt == '':
                        member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex, reg_info=request.user.id,
                                          mod_dt=timezone.now(), reg_dt=timezone.now(), user_id=user.id)
                    else:
                        member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex, reg_info=request.user.id,
                                          birthday_dt=birthday_dt, mod_dt=timezone.now(), reg_dt=timezone.now(),
                                          user_id=user.id)
                    member.save()

            except ValueError as e:
                error = '이미 가입된 회원입니다.'
            except IntegrityError as e:
                error = '등록 값에 문제가 있습니다.'
            except TypeError as e:
                error = '등록 값의 형태가 문제 있습니다.'
            except ValidationError as e:
                error = '등록 값의 형태가 문제 있습니다'
            except InternalError:
                error = '이미 가입된 회원입니다.'

        if error is not None:
            logger.error(name+'[강사 회원가입]'+error)
            messages.error(request, error)

        return render(request, self.template_name)


@method_decorator(csrf_exempt, name='dispatch')
class CheckMemberIdView(View):
    template_name = 'id_check_ajax.html'
    error = ''

    def get(self, request, *args, **kwargs):

        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        user_id = request.POST.get('id', '')
        if user_id == '':
            self.error = 'id를 입력해주세요.'

        if User.objects.filter(username=user_id).exists():
            self.error = '이미 가입된 회원 입니다.'
        return render(request, self.template_name, {'error': self.error})


@method_decorator(csrf_exempt, name='dispatch')
class CheckMemberEmailView(View):
    template_name = 'id_check_ajax.html'
    error = ''

    def get(self, request, *args, **kwargs):

        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        user_email = request.POST.get('email', '')
        if user_email == '':
            self.error = 'email를 입력해주세요.'

        if User.objects.filter(email=user_email).exists():
            self.error = '이미 가입된 회원 입니다.'
        return render(request, self.template_name, {'error': self.error})


class RegisterErrorView(TemplateView):
    template_name = 'registration_error_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(RegisterErrorView, self).get_context_data(**kwargs)

        return context


class NewMemberSendEmailView(TemplateView):
    template_name = 'send_email_to_new_form.html'

    def get_context_data(self, **kwargs):
        context = super(NewMemberSendEmailView, self).get_context_data(**kwargs)

        return context


class NewMemberReSendEmailView(TemplateView):
    template_name = 'send_email_to_reconfirm_form.html'

    def get_context_data(self, **kwargs):
        context = super(NewMemberReSendEmailView, self).get_context_data(**kwargs)
        user_name = self.request.session.get('username', '')
        error = None
        user = None
        if user_name is None or user_name == '':
            error = '회원 정보를 불러오지 못했습니다.'
        if error is None:
            try:
                user = User.objects.get(username=user_name)
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'

        if error is None:
            context['user_email'] = user.email

        context['activation_days'] = getattr(settings, "ACCOUNT_ACTIVATION_DAYS", '')

        return context


# 회워탈퇴 api
def out_member_logic(request):
    next_page = request.POST.get('next_page')
    next_page = '/login/'
    error = None

    member_id = request.user.id
    user = None
    if member_id == '':
        error = '회원 ID를 확인해 주세요.'

    if error is None:

        try:
            user = User.objects.get(id=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    if error is None:
        try:
            member = MemberTb.objects.get(user_id=user.id, use=1)
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
                member.mod_dt = timezone.now()
                member.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
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
    template_name = 'token_check_ajax.html'
    error = ''

    def get(self, request, *args, **kwargs):

        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        keyword = request.POST.get('keyword', '')
        token_exist = False
        # print(keyword)
        try:
            token_data = PushInfoTb.objects.get(token=keyword, use=1)
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
                token_info = PushInfoTb(member_id=request.user.id, token=keyword, last_login=timezone.now(), use=1)
                token_info.save()

        request.session['push_token'] = keyword
        return render(request, self.template_name, {'token_check': token_exist})


class ClearBadgeCounterView(TemplateView):
    template_name = 'token_check_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(ClearBadgeCounterView, self).get_context_data(**kwargs)

        logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+push_token)

        return context


def clear_badge_counter_logic(request):
    template_name = 'token_check_ajax.html'
    push_token = request.session.get('push_token', '')
    error = None
    token_data = None
    if push_token is None or push_token == '':
        error = 'token 정보를 가져올 수 없습니다'

    if error is None:
        try:
            token_data = PushInfoTb.objects.get(token=push_token, use=1)
        except ObjectDoesNotExist:
            error = 'token 정보를 가져올 수 없습니다'

    if error is None:
        token_data.badge_counter = 0
        token_data.save()

    if error is None:
        return render(request, template_name, {'token_check': token_data.token})
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return render(request, template_name, {'token_check': error})
