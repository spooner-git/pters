import datetime

from django.contrib import messages
from django.contrib.auth.models import User, Group
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.contrib.auth import authenticate, logout, login
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.shortcuts import redirect, render
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

from login.models import MemberTb
from trainer.models import ClassTb


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
    auto_login_check = request.POST.get('auto_login_check', '0')
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
            if auto_login_check=='0':
                request.session.set_expiry(0)
            # print(str(request.session.get_expiry_age()))
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
@csrf_exempt
def logout_trainer(request):
    #logout 끝나면 login page로 이동
    logout(request)
    return redirect('/login/')


# 회원가입 api
@csrf_exempt
class ResendEmailAuthenticationView(RegistrationView, View):
    template_name = 'index.html'

    def get(self, request, *args, **kwargs):
        error = None

        return render(request, self.template_name, {'error': error})

    def post(self, request, *args, **kwargs):
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        error = None

        if username is None or username == '':
            error = 'ID를 입력해주세요.'

        if error is None:
            if password is None or password == '':
                error = '비밀번호를를 입력해주세요'

        if error is None:
            user = authenticate(username=username, password=password)
            if user is not None:
                if user.is_active:
                    error = '이미 인증된 ID 입니다.'
                else:
                    self.send_activation_email(user)
            else:
                error = 'ID가 존재하지 않습니다.'

        return render(request, self.template_name, {'error': error})


# 회원가입 api
@csrf_exempt
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
                if group_type == 'trainer':
                    class_info = ClassTb(member_id=user.id, class_type_cd='PT',
                                         start_date=datetime.date.today(), end_date=datetime.date.today()+timezone.timedelta(days=3650),
                                         class_hour=1, start_hour_unit=1, class_member_num=100,
                                         state_cd='IP', reg_dt=timezone.now(), mod_dt=timezone.now(), use=1)

                    class_info.save()

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
        messages.info(request, '회원가입이 정상적으로 완료됐습니다.')
        return redirect(next_page)
    else:
        messages.error(request, error)
        return redirect(next_page)


@method_decorator(csrf_exempt, name='dispatch')
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
                                              mod_dt=timezone.now(), reg_dt=timezone.now(), user_id=user.id, use=1)
                        else:
                            member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex, mod_dt=timezone.now(), reg_dt=timezone.now(),
                                              birthday_dt=birthday_dt,user_id=user.id, use=1)
                        member.save()
                        if group_type == 'trainer':
                            class_info = ClassTb(member_id=user.id, class_type_cd='PT',
                                                 start_date=datetime.date.today(), end_date=datetime.date.today()+timezone.timedelta(days=3650),
                                                 class_hour=1, start_hour_unit=1, class_member_num=100,
                                                 state_cd='IP', reg_dt=timezone.now(), mod_dt=timezone.now(), use=1)

                            class_info.save()
                except ValueError as e:
                    error = '이미 가입된 회원입니다.'
                except IntegrityError as e:
                    error = '등록 값에 문제가 있습니다.'
                except TypeError as e:
                    error = '등록 값의 형태가 문제 있습니다.1'
                except ValidationError as e:
                    error = '등록 값의 형태가 문제 있습니다.2'
                except InternalError:
                    error = '이미 가입된 회원입니다.2'
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


class RegisterErrorView(TemplateView):
    template_name = 'registration_error_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(RegisterErrorView, self).get_context_data(**kwargs)

        return context

