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


# Create your views here.
from django.views.generic import TemplateView

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
def add_member_info_logic(request):
    user_id = request.POST.get('id', '')
    password = request.POST.get('password', '')
    email = request.POST.get('email', '')
    name = request.POST.get('name', '')
    phone = request.POST.get('phone', '')
    sex = request.POST.get('sex', '')
    group_type = request.POST.get('group_type', 'trainee')
    birthday_dt = request.POST.get('birthday', '')
    next_page = request.POST.get('next_page', '')

    error = None

    if user_id == '':
        error = 'ID를 입력해 주세요.'
    elif User.objects.filter(username=user_id).exists():
        error = '이미 가입된 회원 입니다.'
    # elif User.objects.filter(email=email).exists():
    #    error = '이미 가입된 회원 입니다.'
    # elif email == '':
    #    error = 'e-mail 정보를 입력해 주세요.'
    elif password == '':
        error = '비밀번호를 입력해 주세요.'
    elif name == '':
        error = '이름을 입력해 주세요.'
    #elif phone == '':
    #    error = '연락처를 입력해 주세요.'
    #elif len(phone) != 11 and len(phone) != 10:
    #    error = '연락처를 확인해 주세요.'
    #elif not phone.isdigit():
    #    error = '연락처를 확인해 주세요.'

    if error is None:
        try:
            with transaction.atomic():
                user = User.objects.create_user(username=user_id, email=email, first_name=name, password=password)
                group = Group.objects.get(name=group_type)
                user.groups.add(group)
                if birthday_dt == '':
                    member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex,
                                      mod_dt=timezone.now(), reg_dt=timezone.now(), user_id=user.id)
                else:
                    member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex,
                                      birthday_dt=birthday_dt, mod_dt=timezone.now(), reg_dt=timezone.now(),
                                      user_id=user.id)
                member.save()
                if group_type == 'trainer':
                    class_info = ClassTb(member_id=member.member_id, class_type_cd='PT',
                                         start_date=datetime.date.today(), end_date=datetime.date.today()+timezone.timedelta(days=3650),
                                         class_hour='1', start_hour_unit='1', class_member_num='100',
                                         state_cd='IP', reg_dt=timezone.now(), mod_dt=timezone.now(),use='1')

                    class_info.save()

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

    if error is None:
        messages.info(request, '회원가입이 정상적으로 완료됐습니다.')
        return redirect(next_page)
    else:
        messages.error(request, error)
        return redirect(next_page)


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

