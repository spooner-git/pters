# Create your views here.
from django.contrib import messages
from django.contrib.auth import authenticate,logout, login
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.db import transaction
from django.shortcuts import render, redirect
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from login.forms import AuthUserForm, MemberForm
from login.models import MemberTb
from schedule.models import ClassTb, LectureTb


class IndexView(LoginRequiredMixin, TemplateView):
    #def get(self, request):
    #    if request.is_mobile:
    #        return redirect('mobile:index')

    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        return context


class PtAddView(LoginRequiredMixin, TemplateView):
    template_name = 'pt_add.html'

    def get_context_data(self, **kwargs):
        context = super(PtAddView, self).get_context_data(**kwargs)

        return context


class OffAddView(LoginRequiredMixin, TemplateView):
    template_name = 'off_add.html'

    def get_context_data(self, **kwargs):
        context = super(OffAddView, self).get_context_data(**kwargs)

        return context


class OffRepeatAddView(LoginRequiredMixin, TemplateView):
    template_name = 'off_repeat_add.html'

    def get_context_data(self, **kwargs):
        context = super(OffRepeatAddView, self).get_context_data(**kwargs)

        return context


class ManageMemberView(LoginRequiredMixin, TemplateView):
    template_name = 'manage_member.html'

    def get_context_data(self, **kwargs):
        context = super(ManageMemberView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'
            # logger.error(error)

        context['trainer_member'] = None

        if error is None :
            context['trainer_member'] = LectureTb.objects.filter(class_field=trainer_class.class_id)

            for lecture in context['trainer_member']:
                try:
                    lecture.trainer_member = MemberTb.objects.get(member_id=lecture.member)
                except ObjectDoesNotExist:
                    error = 'lecture가 존재하지 않습니다'
                    # logger.error(error)

        return context


class AddMemberView(LoginRequiredMixin, TemplateView):
    template_name = 'member_add.html'

    def get_context_data(self, **kwargs):
        context = super(AddMemberView, self).get_context_data(**kwargs)

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



# 회원가입 api
@csrf_exempt
def member_registration(request, next='trainer:member_manage'):
    email = request.POST.get('email')
    name = request.POST.get('name')
    phone = request.POST.get('phone')
    contents = request.POST.get('contents')
    counts = request.POST.get('counts')
    start_date = request.POST.get('start_date')
    end_date = request.POST.get('end_date')

    error = None
    if MemberTb.objects.filter(name=name, phone=phone).exists():
        error = '이미 가입된 회원 입니다.'
    elif User.objects.filter(email=email).exists():
        error = '이미 가입된 회원 입니다.'
    elif email == '':
        error = 'e-mail 정보를 입력해 주세요.'
    elif name == '':
        error = '이름을 입력해 주세요.'
    elif phone == '':
        error = '연락처를 입력해 주세요.'
    elif counts == '':
        error = '남은 횟수를 입력해 주세요.'
    elif start_date == '':
        error = '시작 날짜를 입력해 주세요.'
    elif end_date == '':
        error = '종료 날짜를 입력해 주세요.'

    if error is None:

        start_date = start_date.split('/')[2] + '-' + start_date.split('/')[0] + '-' + start_date.split('/')[1]
        end_date = end_date.split('/')[2] + '-' + end_date.split('/')[0] + '-' + end_date.split('/')[1]
        password = email.split('@')[0] + phone[7:]

        try:
            with transaction.atomic():
                user = User.objects.create_user(username=email, email=email, first_name=name, password=password)
                member = MemberTb(name=name, phone=phone, contents=contents,
                                  mod_dt=timezone.now(),reg_dt=timezone.now(), user_id=user.id)
                member.save()
                trainer_class = ClassTb.objects.get(member=request.user.id)
                lecture = LectureTb(class_field=trainer_class.class_id,member=member.member_id,
                                    lecture_count=counts,option_cd='DC', state_cd='IP',
                                    start_date=start_date,end_date=end_date, mod_dt=timezone.now(),
                                    reg_dt=timezone.now(), use=1)
                lecture.save()

        except ValueError as e:
            #logger.error(e)
            error = 'Registration ValueError!'
        except IntegrityError as e:
            #logger.error(e)
            error = 'Registration IntegrityError!'
        except TypeError as e:
            error = 'Registration TypeError!'

    if error is None:
        # Send email with activation key
        # user=User.objects.get(username=email)

        # email_subject = 'Account confirmation'
        # email_body = "Hey %s, thanks for signing up. To activate your account, click this link within \
        # 48hours http://local.finers.co.kr:8000/users/confirm/%s" % (user.username, user.profile.activation_key)
        # send_mail(email_subject, email_body, 'test@finers.com', [user.email], fail_silently=False)
        # user = authenticate(username=email, password=password)
        return redirect(next)
    else:
        messages.info(request, error)
        next = 'trainer:member_add'
        return redirect(next)

