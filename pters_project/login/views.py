from datetime import timezone

from django.contrib import messages
from django.contrib.auth.models import User, Group
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.contrib.auth import authenticate, logout, login
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt


# Create your views here.
from django.views.generic import TemplateView

from login.models import MemberTb, LogTb
from trainee.models import LectureTb
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
    fast_check = request.POST.get('fast_check')
    email = request.POST.get('email')
    name = request.POST.get('name')
    phone = request.POST.get('phone')
    contents = request.POST.get('contents')
    counts = request.POST.get('counts')
    price = request.POST.get('price')
    start_date = request.POST.get('start_date')
    end_date = request.POST.get('end_date')
    counts_fast = request.POST.get('counts_fast')
    price_fast = request.POST.get('price_fast')
    start_date_fast = request.POST.get('start_date_fast')
    end_date_fast = request.POST.get('end_date_fast')
    sex = request.POST.get('sex')
    birthday_dt = request.POST.get('birthday')
    next_page = request.POST.get('next_page')

    error = None
    input_start_date = ''
    input_end_date = ''
    input_counts = 0
    input_price = 0
    now = timezone.now()
    class_info = None

    if User.objects.filter(username=phone).exists():
        error = '이미 가입된 회원 입니다.'
    # elif User.objects.filter(email=email).exists():
    #    error = '이미 가입된 회원 입니다.'
    # elif email == '':
    #    error = 'e-mail 정보를 입력해 주세요.'
    elif name == '':
        error = '이름을 입력해 주세요.'
    elif phone == '':
        error = '연락처를 입력해 주세요.'
    elif len(phone) != 11 and len(phone) != 10:
        error = '연락처를 확인해 주세요.'
    elif not phone.isdigit():
        error = '연락처를 확인해 주세요.'

    if error is None:
        if fast_check == '0':
            if counts_fast == '':
                error = '남은 횟수를 입력해 주세요.'
            elif start_date_fast == '':
                error = '시작 날짜를 입력해 주세요.'
            else:
                input_counts = counts_fast
                input_start_date = start_date_fast
                if price_fast == '':
                    input_price = 0
                else:
                    input_price = price_fast
                if end_date_fast == '':
                    input_end_date = '9999-12-31'
                else:
                    input_end_date = end_date_fast

        elif fast_check == '1':
            if counts == '':
                error = '남은 횟수를 입력해 주세요.'
            elif start_date == '':
                error = '시작 날짜를 입력해 주세요.'
            else:
                input_counts = counts
                input_start_date = start_date
                if price == '':
                    input_price = 0
                else:
                    input_price = price
                if end_date == '':
                    input_end_date = '9999-12-31'
                else:
                    input_end_date = end_date

    if error is None:
        if len(phone) == 11:
            password = phone[7:]
        elif len(phone) == 10:
            password = phone[6:]

    if error is None:

        try:
            class_info = ClassTb.objects.get(member_id=request.user.id)
        except ObjectDoesNotExist:
            error = '강사 강좌 정보가 없습니다.'

    if error is None:
        try:
            with transaction.atomic():
                user = User.objects.create_user(username=phone, email=email, first_name=name, password=password)
                group = Group.objects.get(name='trainee')
                user.groups.add(group)
                if birthday_dt == '':
                    member = MemberTb(member_id=user.id, name=name, phone=phone, contents=contents, sex=sex,
                                      mod_dt=timezone.now(), reg_dt=timezone.now(), user_id=user.id)
                else:
                    member = MemberTb(member_id=user.id, name=name, phone=phone, contents=contents, sex=sex,
                                      birthday_dt=birthday_dt, mod_dt=timezone.now(), reg_dt=timezone.now(),
                                      user_id=user.id)
                member.save()
                lecture = LectureTb(class_tb_id=class_info.class_id, member_id=member.member_id,
                                    lecture_reg_count=input_counts, lecture_rem_count=input_counts,
                                    lecture_avail_count=input_counts, price=input_price, option_cd='DC',
                                    state_cd='IP',
                                    start_date=input_start_date, end_date=input_end_date, mod_dt=now,
                                    reg_dt=now, use=1)
                lecture.save()

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
        log_contents = '<span>' + request.user.first_name + ' 강사님께서 ' \
                       + name + ' 회원님의</span> 정보를 <span class="status">등록</span>했습니다.'
        log_data = LogTb(external_id=request.user.id, log_type='LB01', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)

        return redirect(next_page)


@csrf_exempt
def check_member_duplication_logic(request):
    user_id = request.POST.get('id')
    next_page = request.POST.get('next_page')

    error = None

    if User.objects.filter(username=user_id).exists():
        error = '이미 가입된 회원 입니다.'

    if error is None:
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)
