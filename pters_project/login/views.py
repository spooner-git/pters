import base64
import datetime
import hashlib
import hmac
import json
import logging
import random

import httplib2
import time
from django.contrib import messages
from django.contrib.auth import authenticate, logout, login, get_user_model, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm, PasswordChangeForm
from django.contrib.auth.models import User, Group
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.views import deprecate_current_app
from django.contrib.sites.shortcuts import get_current_site
from django.core import signing
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError, InternalError, transaction
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render, resolve_url
from django.template.loader import render_to_string
from django.template.response import TemplateResponse
from django.urls import reverse
from django.utils import timezone
from django.utils.encoding import force_text
from django.utils.http import urlsafe_base64_decode
from django.utils.translation import ugettext as _
from django.views import View
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.debug import sensitive_post_parameters
from django.views.generic import TemplateView, FormView
from registration import signals
from registration.backends.hmac.views import RegistrationView, REGISTRATION_SALT
from registration.forms import RegistrationForm

from configs.const import USE, UN_USE, AUTH_TYPE_VIEW, AUTH_TYPE_WAIT
from configs import settings
from payment.functions import func_cancel_period_billing_schedule
from payment.models import PaymentInfoTb, BillingInfoTb, BillingCancelInfoTb
from trainee.models import MemberTicketTb
from .forms import MyPasswordResetForm, MyPasswordChangeForm, MyRegistrationForm
from .models import MemberTb, PushInfoTb, SnsInfoTb

logger = logging.getLogger(__name__)


class IndexView(TemplateView):
    template_name = 'login.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        logout(self.request)

        return context


def login_trainer(request):
    # login 완료시 main page로 이동
    username = request.POST.get('username')
    password = request.POST.get('password')
    social_login_check = request.POST.get('social_login_check', '0')
    social_login_type = request.POST.get('social_login_type', '')
    auto_login_check = request.POST.get('auto_login_check', '1')
    social_login_id = request.POST.get('social_login_id', '')
    social_access_token = request.POST.get('social_accessToken', '')

    next_page = request.POST.get('next_page')
    error = None
    if next_page == '':
        next_page = '/trainer/'
    if next_page is None:
        next_page = '/trainer/'

    request.session['push_token'] = ''
    request.session['social_login_check'] = social_login_check
    request.session['social_login_type'] = social_login_type
    request.session['social_login_id'] = social_login_id
    request.session['social_accessToken'] = social_access_token

    if not error:
        # if password == 'kakao_login':
        #     user = authenticate(username=username)
        # else:
        if social_login_check == '0':
            request.session['social_login_type'] = ''
            request.session['social_login_id'] = ''
            request.session['social_accessToken'] = ''
            user = authenticate(username=username, password=password)
        else:
            try:
                user = User.objects.get(username=username)
                user.backend = 'django.contrib.auth.backends.ModelBackend'
            except ObjectDoesNotExist:
                user = None

        if user is not None:
            member = None
            try:
                member = MemberTb.objects.get(member_id=user.id)
            except ObjectDoesNotExist:
                error = 'ID/비밀번호를 확인해주세요.'
            if error is None:
                if member.use == 1:
                    if user.is_active:
                        login(request, user)
                        if auto_login_check == '0':
                            request.session.set_expiry(0)
                    else:
                        group_list = user.groups.filter(user=user.id)
                        group_name = 'trainer'
                        if len(group_list) == 1:
                            group_name = group_list[0].name
                        if group_name == 'trainee' and member.name not in user.username:
                            login(request, user)
                            if auto_login_check == '0':
                                request.session.set_expiry(0)
                        else:
                            request.session['user_id'] = user.id
                            request.session['username'] = user.username
                            if user.email is None or user.email == '':
                                next_page = '/login/send_email_member/'
                            else:
                                next_page = '/login/resend_email_member/'
                else:
                    error = '이미 탈퇴한 회원입니다.'
        else:
            error = 'ID/비밀번호를 확인해주세요.'
            next_page = '/'
            # logger.error(error)

    if error is not None:
        messages.error(request, error)
    return redirect(next_page)


class ServiceInfoView(TemplateView):
    template_name = 'service_info.html'

    def get_context_data(self, **kwargs):
        context = super(ServiceInfoView, self).get_context_data(**kwargs)
        return context


class ServicePriceInfoView(TemplateView):
    template_name = 'service_price_info.html'

    def get_context_data(self, **kwargs):
        context = super(ServicePriceInfoView, self).get_context_data(**kwargs)
        return context


class ServiceTestLoginView(TemplateView):
    template_name = 'service_test_login.html'

    def get_context_data(self, **kwargs):
        context = super(ServiceTestLoginView, self).get_context_data(**kwargs)

        # Empty 를 Normal로 변경 및 FIX 체크
        # class_data = ClassTb.objects.filter()
        # for class_info in class_data:
        #     # 프로그램에 속한 그룹 불러오기
        #     group_data = LectureTb.objects.filter(class_tb_id=class_info.class_id)
        #     if len(group_data) == 0:
        #         group_data = None
        #     else:
        #         for group_info in group_data:
        #
        #             if group_info.group_type_cd == 'NORMAL':
        #                 group_lecture_data = GroupMemberTicketTb.objects.filter(group_tb_id=group_info.group_id,
        #                                                                    lecture_tb__state_cd='IP',
        #                                                                    lecture_tb__use=USE,
        #                                                                    use=USE)
        #                 group_lecture_data.update(fix_state_cd='FIX')
        #             elif group_info.group_type_cd == 'EMPTY':
        #                 group_info.group_type_cd = 'NORMAL'
        #                 group_info.save()

        # 1:1 그룹 생성
        # class_data = ClassTb.objects.filter(class_id__gte='502')
        # for class_info in class_data:
        #     # 그룹중에 1:1 그룹 불러오기
        #     check_group = LectureTb.objects.filter(class_tb_id=class_info.class_id, group_type_cd='ONE_TO_ONE')
        #     # 1개도 없는 경우 생성
        #     if len(check_group) == 0:
        #         group_info = LectureTb(class_tb_id=class_info.class_id, group_type_cd='ONE_TO_ONE', member_num=1,
        #                              name='1:1레슨',
        #                              # ing_group_member_num=ing_group_member_num,
        #                              # end_group_member_num=end_group_member_num,
        #                              ing_color_cd='#fbf3bd', end_color_cd='#8c8763',
        #                              reg_dt=class_info.reg_dt,
        #                              mod_dt=class_info.mod_dt,
        #                              state_cd='IP', use=USE)
        #         group_info.save()
        #     else:
        #         group_info = check_group[0]
        #     class_lecture_data = ClassMemberTicketTb.objects.select_related(
        # 'lecture_tb').filter(class_tb_id=class_info.class_id)
        #     if len(class_lecture_data) > 0:
        #         for class_lecture_info in class_lecture_data:
        #             if class_lecture_info.lecture_tb is not None and class_lecture_info.lecture_tb != '':
    #                 check_group = GroupMemberTicketTb.objects.filter(lecture_tb_id=class_lecture_info.lecture_tb_id)
        #                 # 1:1 그룹인 경우 GroupLecture가 없음. 1:1에 대한 GroupLecture 생성
        #                 if len(check_group) == 0:
        #                     lecture_info = GroupMemberTicketTb(group_tb_id=group_info.group_id,
        #                                                   lecture_tb_id=class_lecture_info.lecture_tb_id,
        #                                                   reg_dt=class_lecture_info.lecture_tb.reg_dt,
        #                                                   mod_dt=class_lecture_info.lecture_tb.mod_dt,
        #                                                   fix_state_cd='',
        #                                                   use=class_lecture_info.lecture_tb.use)
        #                     lecture_info.save()

        # 그룹 숫자 업데이트 패키지 정보 업데이트
        # class_data = ClassTb.objects.filter()
        # for class_info in class_data:
        #     group_data = LectureTb.objects.filter(class_tb_id=class_info.class_id)
        #     if len(group_data) == 0:
        #         group_data = None
        #     else:
        #         for group_info in group_data:
        #
        #             package_group_test = PackageLectureTb.objects.filter(group_tb_id=group_info.group_id)
        #             if len(package_group_test) == 0:
        #                 package_info = TicketTb(class_tb_id=group_info.class_tb_id, name=group_info.name,
        #                                          state_cd=group_info.state_cd,
        #                                          package_type_cd=group_info.group_type_cd,
        #                                          ing_package_member_num=group_info.ing_group_member_num,
        #                                          end_package_member_num=group_info.end_group_member_num,
        #                                          package_group_num=1,
        #                                          reg_dt=group_info.reg_dt,
        #                                          mod_dt=group_info.mod_dt,
        #                                          use=group_info.use)
        #                 package_info.save()
        #                 package_group_info = PackageLectureTb(class_tb_id=group_info.class_tb_id,
        #                                                     package_tb_id=package_info.package_id,
        #                                                     group_tb_id=group_info.group_id,
        #                                                     reg_dt=group_info.reg_dt,
        #                                                     mod_dt=group_info.mod_dt,
        #                                                     use=group_info.use)
        #                 package_group_info.save()
        #
        #                 group_lecture_data = GroupMemberTicketTb.objects.filter(group_tb_id=group_info.group_id)
        #                 for group_lecture_info in group_lecture_data:
        #                     group_lecture_info.lecture_tb.package_tb_id = package_info.package_id
        #                     group_lecture_info.lecture_tb.save()
        # group_data = LectureTb.objects.filter()
        # for group_info in group_data:
        #     package_info = TicketTb(class_tb_id=group_info.class_tb_id, name=group_info.name,
        #                              state_cd=group_info.state_cd, package_type_cd=group_info.group_type_cd,
        #                              package_group_num=1, use=group_info.use)
        #     package_info.save()
        # for lecture_info in lecture_data:
        #     package_lecture_info =
        # trainer_list = MemberTb.objects.filter(use=USE)
        # for trainer_info in trainer_list:
        #
        #     user_for_group = User.objects.get(id=trainer_info.user_id)
        #     group = user_for_group.groups.get(user=trainer_info.user_id)
        #     if str(group.id) == '3':
        #         payment_info = PaymentInfoTb(name='초기 이용 고객 감사 이벤트', member_id=trainer_info.user_id,
        #                                      product_tb_id='10',
        #                                      merchant_uid='m_free_event_'+str(trainer_info.user_id),
        #                                      customer_uid='c_free_event_'+str(trainer_info.user_id),
        #                                      start_date='2018-10-29', end_date='2028-10-29', period_month='120',
        #                                      payment_type_cd='SINGLE', price=0, card_name='없음', status='paid',
        #                                      buyer_name=trainer_info.name, use=USE)
        #         billing_info = BillingInfoTb(name='초기 이용 고객 감사 이벤트', member_id=str(trainer_info.user_id),
        #                                      product_tb_id='10',
        #                                      customer_uid='c_free_event_'+str(trainer_info.user_id),
        #                                      payment_reg_date='2018-10-29', next_payment_date='2028-10-29',
        #                                      payment_type_cd='SINGLE', price=0, card_name='없음',
        #                                      payed_date='29',
        #                                      state_cd='IP', use=USE)
        #         payment_info.save()
        #         billing_info.save()
        return context


class LoginSimpleNaverView(TemplateView):
    template_name = 'login_naver_processing.html'

    def get_context_data(self, **kwargs):
        context = super(LoginSimpleNaverView, self).get_context_data(**kwargs)
        return context


class LoginSimpleSnsView(TemplateView):
    template_name = 'login_sns_processing.html'

    def post(self, request):
        # context = super(LoginSimpleFacebookView, self).get_context_data(**kwargs)
        context = {}
        sns_id = request.POST.get('sns_id', '')
        username = request.POST.get('username', '')
        email = request.POST.get('email', '')
        last_name = request.POST.get('last_name', '')
        first_name = request.POST.get('first_name', '')
        sns_type = request.POST.get('sns_type', 'google')
        social_access_token = request.POST.get('social_accessToken', '')
        sex = request.POST.get('sex', '')

        context['username'] = username
        context['email'] = email
        context['last_name'] = last_name
        context['first_name'] = first_name
        context['name'] = last_name + first_name
        context['sns_id'] = sns_id
        context['sns_type'] = sns_type
        context['social_accessToken'] = social_access_token
        context['sex'] = sex

        return render(request, self.template_name, context)


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
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
    return redirect('/')


class AddNewMemberSnsInfoView(RegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request, *args, **kwargs):

        email = request.POST.get('email', '')
        first_name = request.POST.get('first_name', '')
        name = request.POST.get('name', '')
        sex = request.POST.get('sex', '')
        sns_id = request.POST.get('sns_id', '')
        sns_type = request.POST.get('sns_type', 'naver')
        auto_login_check = request.POST.get('auto_login_check', '1')
        group_type = request.POST.get('group_type', 'trainer')
        social_access_token = request.POST.get('social_accessToken', '')
        next_page = request.POST.get('next_page', '/login/new_member_sns_info/')

        error = None
        user = None
        if first_name == '' or first_name == 'None' or first_name is None:
            first_name = name

        # if last_name == '' or last_name == 'None' or last_name is None:
        #     last_name = ''

        try:
            user = User.objects.get(username=email)
        except ObjectDoesNotExist:
            error = None

        if user is not None:
            error = '이미 가입된 회원입니다.'

        if error is None:
            try:
                with transaction.atomic():

                    user = User.objects.create_user(username=email, first_name=first_name, email=email,
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
                    request.session['social_login_check'] = '1'
                    request.session['social_login_type'] = sns_type
                    request.session['social_login_id'] = sns_id
                    request.session['social_accessToken'] = social_access_token
                    if auto_login_check == '0':
                        request.session.set_expiry(0)
                    login(request, user)
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
            logger.error(name + '[' + email + ']' + error)
            messages.error(request, error)

        return redirect(next_page)


class AddOldMemberSnsInfoView(RegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request, *args, **kwargs):

        # first_name = request.POST.get('first_name', '')
        email = request.POST.get('email', '')
        name = request.POST.get('name', '')
        sns_id = request.POST.get('sns_id', '')
        sns_type = request.POST.get('sns_type', 'NAVER')
        auto_login_check = request.POST.get('auto_login_check', '1')
        social_access_token = request.POST.get('social_accessToken', '')

        error = None
        user = None

        try:
            user = User.objects.get(email=email)
        except ObjectDoesNotExist:
            error = None

        if user is None:
            try:
                user = User.objects.get(username=email)
                user.email = email
                user.save()
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
                    user.is_active = 1
                    user.save()
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                    login(request, user)
                    request.session['social_login_check'] = '1'
                    request.session['social_login_type'] = sns_type
                    request.session['social_login_id'] = sns_id
                    request.session['social_accessToken'] = social_access_token

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
            logger.error(name + '[' + email + ']' + error)
            messages.error(request, error)

        return render(request, self.template_name)


class DeleteSnsInfoView(View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):

        sns_id = request.POST.get('sns_id')
        sns_type = request.POST.get('sns_type')
        error = None
        sns_info = None
        try:
            sns_info = SnsInfoTb.objects.get(sns_id=sns_id, sns_type=sns_type, use=USE)
        except ObjectDoesNotExist:
            error = '이미 연동해제가 완료됐습니다.'

        if error is None:
            try:
                with transaction.atomic():
                    sns_info.use = UN_USE
                    sns_info.save()
                    request.session['social_login_check'] = '0'
                    request.session['social_login_type'] = ''
                    request.session['social_login_id'] = ''
                    request.session['social_accessToken'] = ''

            except ValueError:
                error = '등록 값에 문제가 있습니다.'
            except IntegrityError:
                error = '등록 값에 문제가 있습니다.'
            except TypeError:
                error = '등록 값에 문제가 있습니다.'
            except ValidationError:
                error = '등록 값에 문제가 있습니다.'

        if error is not None:
            messages.error(request, error)

        return render(request, self.template_name)


class NewMemberSnsInfoView(TemplateView):
    template_name = 'send_sns_info_to_new_form.html'

    def post(self, request):
        context = {'username': self.request.POST.get('username'),
                   'email': self.request.POST.get('email'),
                   'last_name': self.request.POST.get('last_name'),
                   'name': self.request.POST.get('name'),
                   'sns_id': self.request.POST.get('sns_id'),
                   'sns_type': self.request.POST.get('sns_type'),
                   'sex': self.request.POST.get('sex'),
                   'social_accessToken': self.request.POST.get('social_accessToken')
                   }
        return render(request, self.template_name, context)


class CheckSnsMemberInfoView(TemplateView):
    template_name = 'ajax/id_check_ajax.html'
    error = ''

    def get_context_data(self, **kwargs):
        context = super(CheckSnsMemberInfoView, self).get_context_data(**kwargs)
        user_email = self.request.GET.get('email', '')
        sns_id = self.request.GET.get('sns_id', '')
        sns_type = self.request.GET.get('sns_type', '')
        username = ''

        context['error'] = '0'
        try:
            sns_info = SnsInfoTb.objects.select_related('member').get(sns_id=sns_id, sns_type=sns_type, use=USE)
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

        if username == '':
            try:
                user_info = User.objects.get(username=user_email)
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
        form = MyRegistrationForm(request.POST, request.FILES)
        user_id = request.POST.get('username', '')
        # email = request.POST.get('email', '')
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
                        # if email is None or email == '':
                        #     error = 'Email을 입력해주세요.'
                        if user_id is None or user_id == '':
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
                            # user.email = email
                            user.set_password(password)
                            user.save()
                if error is None:
                    # user = authenticate(username=username, password=password)
                    if user is not None:
                        if user.is_active:
                            error = '이미 인증된 ID 입니다.'
                            # else:
                            #     self.send_activation_email(user)
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
            logger.error(str(username) + '->' + str(user_id) + str(error))
            messages.error(request, error)
        else:
            logger.info(str(username) + '->' + str(user_id) + ' 회원가입 완료')

        return render(request, self.template_name)


class MyReRegistrationView(RegistrationView):
    def send_activation_email(self, user):
        """
        Send the activation email. The activation key is the username,
        signed using TimestampSigner.

        """
        activation_key = self.get_activation_key(user)
        context = self.get_email_context(activation_key)
        context.update({
            'user': user,
        })
        subject = render_to_string('registration/activation_re_email_subject.txt',
                                   context)
        # Force subject to a single line to avoid header-injection
        # issues.
        subject = ''.join(subject.splitlines())
        message = render_to_string('registration/activation_re_email.txt',
                                   context)
        user.email_user(subject, message, settings.DEFAULT_FROM_EMAIL)


# 회원가입 api
class ResendEmailAuthenticationView(MyReRegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):
        user_id = request.POST.get('username', '')
        email = request.POST.get('email', '')
        member_id = request.POST.get('member_id', '')
        error = None
        user = None
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
            logger.error(str(user_id) + '[' + str(email) + ']' + str(error))
            messages.error(request, error)
        else:
            logger.error(str(user_id) + '[' + str(email) + '] 이메일 재인증 요청')

        return render(request, self.template_name)


# 회원가입 api
class ChangeResendEmailAuthenticationView(MyReRegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):
        user_id = request.POST.get('username', '')
        email = request.POST.get('email', '')
        member_id = request.POST.get('member_id', '')

        error = None
        user = None
        if member_id is None or member_id == '':
            error = 'ID를 입력해주세요.'

        if error is None:
            try:
                User.objects.get(email=email)
                error = '이미 가입된 email입니다.'
            except ObjectDoesNotExist:
                error = None

        if error is None:
            try:
                user = User.objects.get(id=member_id)
                user.email = email
                user.is_active = 0
                user.save()
            except ObjectDoesNotExist:
                error = '가입되지 않은 회원입니다.'

        if error is None:
            # user = authenticate(username=username, password=password)
            if user is not None:
                self.send_activation_email(user)
            else:
                error = 'ID가 존재하지 않습니다.'

        if error is None:
            logger.info(str(user_id) + '[' + str(email) + '] 이메일 변경 요청')
        else:
            logger.error(str(user_id) + '[' + str(email) + ']' + str(error))
            messages.error(request, error)

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
        email_template_name = 'password_reset_email.txt'
        subject_template_name = 'password_reset_subject.txt'
        # context = None
        if email is None or email == '':
            error = 'Email 정보를 입력해주세요.'

        if error is None:
            if User.objects.filter(email=email).exists() is not True:
                error = email + '로 가입된 회원이 없습니다.'

        if error is None:
            if post_reset_redirect is None:
                post_reset_redirect = reverse('login:auth_password_reset_done')
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
            logger.error('email:' + email + '/' + error)
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
        logger.info(member.name + ' 회원 가입 완료')
        messages.info(request, '회원가입이 정상적으로 완료됐습니다.')
    else:
        logger.error(name + '[' + str(user_id) + ']' + error)
        messages.error(request, error)
    return render(request, 'ajax/registration_error_ajax.html')


class AddMemberView(RegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request, *args, **kwargs):

        form = MyRegistrationForm(request.POST, request.FILES)

        first_name = request.POST.get('first_name', '')
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
                        user.is_active = True
                        user.save()
                        if birthday_dt == '':
                            member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex,
                                              user_id=user.id, use=USE)
                        else:
                            member = MemberTb(member_id=user.id, name=name, phone=phone, sex=sex,
                                              birthday_dt=birthday_dt, user_id=user.id, use=USE)
                        member.save()
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
            logger.error(name + '[' + form.cleaned_data['username'] + ']' + error)
            messages.error(request, error)

        return render(request, self.template_name)


class AddMemberNoEmailView(View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):

        first_name = request.POST.get('first_name', '')
        name = request.POST.get('name', '')
        sex = request.POST.get('sex', '')
        birthday_dt = request.POST.get('birthday', '')
        phone = request.POST.get('phone', '')
        context = add_member_no_email_func(request.user.id, first_name, phone, sex, birthday_dt)
        error = context['error']

        if error is not None:
            logger.error(name + '[강사 회원가입]' + error)
            messages.error(request, error)
            return render(request, self.template_name, {'username': '',
                                                        'user_db_id': ''})
        else:
            if context['error'] is not None:
                logger.error(name + '[강사 회원가입]' + context['error'])
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
        form = MyRegistrationForm(self.request.POST, self.request.FILES)
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
    next_page = '/login/logout/'
    error = None

    member_id = request.user.id
    user = None
    member = None
    sns_data = None
    group_name = ''
    if member_id == '':
        error = 'ID를 확인해 주세요.'

    if error is None:

        try:
            user = User.objects.get(id=member_id)
        except ObjectDoesNotExist:
            error = 'ID를 확인해 주세요.'
        if error is None:
            group = user.groups.get(user=request.user.id)
            group_name = group.name

    if error is None:
        try:
            member = MemberTb.objects.get(user_id=user.id, use=USE)
        except ObjectDoesNotExist:
            error = 'ID를 확인해 주세요.'

    if error is None:
        sns_data = SnsInfoTb.objects.select_related('member').filter(member_id=member_id, use=USE)

    # if error is None:
    #    group = user.groups.get(user=request.user.id)

    if error is None:
        try:
            with transaction.atomic():
                if group_name == 'trainee':
                    member_member_ticket_data = MemberTicketTb.objects.filter(member_id=member_id,
                                                                              member_auth_cd=AUTH_TYPE_VIEW, use=USE)
                    if len(member_member_ticket_data) > 0:
                        member_member_ticket_data.update(member_auth_cd=AUTH_TYPE_WAIT)
                # elif group_name == 'trainer':
                #     member_class_data = MemberClassTb.objects.filter(member_id=member_id, auth_cd=AUTH_TYPE_VIEW, use=USE)
                #     if len(member_class_data) > 0:
                #         member_class_data.update(auth_cd='DELETE')

                if error is None:
                    member.contents = str(user.username) + ':' + str(user.id)
                    user.username = str(user.username) + ':' + str(user.id)
                    user.email = ''
                    user.is_active = 0
                    user.set_password('0000')
                    user.save()
                    member.save()

                if len(sns_data) > 0:
                    sns_data.update(use=UN_USE)
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '등록 값에 문제가 있습니다.'
        except InternalError:
            error = '다시 시도해주세요.'

    if group_name != 'trainee':
        billing_data = BillingInfoTb.objects.filter(member_id=request.user.id, use=USE)

        if len(billing_data) > 0:
            for billing_info in billing_data:
                error = func_cancel_period_billing_schedule(billing_info.customer_uid)
                if error is None:
                    billing_cancel_info = BillingCancelInfoTb(billing_info_tb_id=billing_info.billing_info_id,
                                                              member_id=request.user.id,
                                                              cancel_type='탈퇴',
                                                              cancel_reason='회원 탈퇴',
                                                              use=USE)
                    billing_cancel_info.save()
                    billing_info.state_cd = 'DEL'
                    billing_info.save()
                payment_data = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                            customer_uid=billing_info.customer_uid)
                if len(payment_data) > 0:
                    payment_data.update(status='cancelled', use=UN_USE)

                error = None

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
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

        return context


def clear_badge_counter_logic(request):
    push_token = request.session.get('push_token', '')
    error = None
    token_data = None
    if push_token is None or push_token == '':
        error = 'Push 정보를 가져올 수 없습니다'

    logger.info(request.user.first_name + '[' + str(request.user.id) + ']' + push_token)
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
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        # messages.error(request, error)

        return render(request, 'ajax/token_check_ajax.html', {'token_check': ''})


def add_member_no_email_func(user_id, first_name, phone, sex, birthday_dt):
    error = None
    name = ''
    password = '0000'
    username = ''
    context = {'error': None, 'user_db_id': '', 'username': ''}

    if first_name is None or first_name == '':
        error = '이름을 입력해 주세요.'

    if error is None:
        name = first_name
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
                user = User.objects.create_user(username=username, first_name=first_name,
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


class BaseRegistrationView(FormView):
    """
    Base class for user registration views.

    """
    disallowed_url = 'registration_disallowed'
    form_class = MyRegistrationForm
    success_url = None
    template_name = 'registration/registration_form.html'

    def dispatch(self, *args, **kwargs):
        """
        Check that user signup is allowed before even bothering to
        dispatch or do other processing.

        """
        if not self.registration_allowed():
            return redirect(self.disallowed_url)
        return super(BaseRegistrationView, self).dispatch(*args, **kwargs)

    def form_valid(self, form):
        new_user = self.register(form)
        success_url = self.get_success_url(new_user) if \
            (hasattr(self, 'get_success_url') and
             callable(self.get_success_url)) else \
            self.success_url

        # success_url may be a string, or a tuple providing the full
        # argument set for redirect(). Attempting to unpack it tells
        # us which one it is.
        try:
            to, args, kwargs = success_url
            return redirect(to, *args, **kwargs)
        except ValueError:
            return redirect(success_url)

    def registration_allowed(self):
        """
        Override this to enable/disable user registration, either
        globally or on a per-request basis.

        """
        return getattr(settings, 'REGISTRATION_OPEN', True)

    def register(self, form):
        """
        Implement user-registration logic here. Access to both the
        request and the registration form is available here.

        """
        raise NotImplementedError


class RegistrationView(BaseRegistrationView):
    """
    Register a new (inactive) user account, generate an activation key
    and email it to the user.

    This is different from the model-based activation workflow in that
    the activation key is the username, signed using Django's
    TimestampSigner, with HMAC verification on activation.

    """
    email_body_template = 'registration/activation_email.txt'
    email_subject_template = 'registration/activation_email_subject.txt'

    def register(self, form):
        new_user = self.create_inactive_user(form)
        signals.user_registered.send(sender=self.__class__,
                                     user=new_user,
                                     request=self.request)
        return new_user

    def get_success_url(self, user):
        return ('registration_complete', (), {})

    def create_inactive_user(self, form):
        """
        Create the inactive user account and send an email containing
        activation instructions.

        """
        new_user = form.save(commit=False)
        new_user.is_active = False
        new_user.save()

        self.send_activation_email(new_user)

        return new_user

    def get_activation_key(self, user):
        """
        Generate the activation key which will be emailed to the user.

        """
        return signing.dumps(
            obj=getattr(user, user.USERNAME_FIELD),
            salt=REGISTRATION_SALT
        )

    def get_email_context(self, activation_key):
        """
        Build the template context used for the activation email.

        """
        scheme = 'https' if self.request.is_secure else 'http'
        return {
            'scheme': scheme,
            'activation_key': activation_key,
            'expiration_days': settings.ACCOUNT_ACTIVATION_DAYS,
            'site': get_current_site(self.request)
        }

    def send_activation_email(self, user):
        """
        Send the activation email. The activation key is the username,
        signed using TimestampSigner.

        """
        activation_key = self.get_activation_key(user)
        context = self.get_email_context(activation_key)
        context.update({
            'user': user,
        })
        subject = render_to_string(self.email_subject_template,
                                   context)
        # Force subject to a single line to avoid header-injection
        # issues.
        subject = ''.join(subject.splitlines())
        message = render_to_string(self.email_body_template,
                                   context)
        user.email_user(subject, message, settings.DEFAULT_FROM_EMAIL)


class BaseActivationView(TemplateView):
    """
    Base class for user activation views.

    """
    success_url = None
    template_name = 'registration/activate.html'

    def get(self, *args, **kwargs):
        """
        The base activation logic; subclasses should leave this method
        alone and implement activate(), which is called from this
        method.

        """
        activated_user = self.activate(*args, **kwargs)
        if activated_user:
            signals.user_activated.send(
                sender=self.__class__,
                user=activated_user,
                request=self.request
            )
            success_url = self.get_success_url(activated_user) if \
                (hasattr(self, 'get_success_url') and
                 callable(self.get_success_url)) else \
                self.success_url
            try:
                to, args, kwargs = success_url
                return redirect(to, *args, **kwargs)
            except ValueError:
                return redirect(success_url)
        return super(BaseActivationView, self).get(*args, **kwargs)

    def activate(self, *args, **kwargs):
        """
        Implement account-activation logic here.

        """
        raise NotImplementedError


class ActivationView(BaseActivationView):
    """
    Given a valid activation key, activate the user's
    account. Otherwise, show an error message stating the account
    couldn't be activated.

    """
    # success_url = 'registration_activation_complete'
    success_url = '/login/activate/complete/'

    def activate(self, *args, **kwargs):
        # This is safe even if, somehow, there's no activation key,
        # because unsign() will raise BadSignature rather than
        # TypeError on a value of None.
        username = self.validate_key(kwargs.get('activation_key'))
        if username is not None:
            user = self.get_user(username)
            if user is not None:
                user.is_active = True
                user.save()
                return user
        return False

    def validate_key(self, activation_key):
        """
        Verify that the activation key is valid and within the
        permitted activation time window, returning the username if
        valid or ``None`` if not.

        """
        try:
            username = signing.loads(
                activation_key,
                salt=REGISTRATION_SALT,
                max_age=settings.ACCOUNT_ACTIVATION_DAYS * 86400
            )
            return username
        # SignatureExpired is a subclass of BadSignature, so this will
        # catch either one.
        except signing.BadSignature:
            return None

    def get_user(self, username):
        """
        Given the verified username, look up and return the
        corresponding user account if it exists, or ``None`` if it
        doesn't.

        """
        User = get_user_model()
        try:
            user = User.objects.get(**{
                User.USERNAME_FIELD: username,
                'is_active': False
            })
            return user
        except User.DoesNotExist:
            return None


# 4 views for password reset:
# - password_reset sends the mail
# - password_reset_done shows a success message for the above
# - password_reset_confirm checks the link the user clicked and
#   prompts for a new password
# - password_reset_complete shows a success message for the above

@deprecate_current_app
@csrf_protect
def password_reset(request,
                   template_name='password_reset_form.html',
                   email_template_name='password_reset_email.html',
                   subject_template_name='password_reset_subject.txt',
                   password_reset_form=PasswordResetForm,
                   token_generator=default_token_generator,
                   post_reset_redirect=None,
                   from_email=None,
                   extra_context=None,
                   html_email_template_name=None,
                   extra_email_context=None):
    if post_reset_redirect is None:
        post_reset_redirect = reverse('login:auth_password_reset')
        # post_reset_redirect = '/login/password_reset/done/'
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
        form = password_reset_form()
    context = {
        'form': form,
        'title': _('Password reset'),
    }
    if extra_context is not None:
        context.update(extra_context)

    return TemplateResponse(request, template_name, context)


@deprecate_current_app
def password_reset_done(request,
                        template_name='password_reset_done.html',
                        extra_context=None):
    context = {
        'title': _('Password reset sent'),
    }
    if extra_context is not None:
        context.update(extra_context)

    return TemplateResponse(request, template_name, context)


# Doesn't need csrf_protect since no-one can guess the URL
@sensitive_post_parameters()
@never_cache
@deprecate_current_app
def password_reset_confirm(request, uidb64=None, token=None,
                           template_name='password_reset_confirm.html',
                           token_generator=default_token_generator,
                           set_password_form=SetPasswordForm,
                           post_reset_redirect=None,
                           extra_context=None):
    """
    View that checks the hash in a password reset link and presents a
    form for entering a new password.
    """
    assert uidb64 is not None and token is not None  # checked by URLconf
    if post_reset_redirect is None:
        post_reset_redirect = reverse('login:auth_password_reset_complete')
    else:
        post_reset_redirect = resolve_url(post_reset_redirect)
    try:
        # urlsafe_base64_decode() decodes to bytestring on Python 3
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = User._default_manager.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and token_generator.check_token(user, token):
        validlink = True
        title = _('Enter new password')
        if request.method == 'POST':
            form = set_password_form(user, request.POST)
            if form.is_valid():
                form.save()
                return HttpResponseRedirect(post_reset_redirect)
        else:
            form = set_password_form(user)
    else:
        validlink = False
        form = None
        title = _('Password reset unsuccessful')
    context = {
        'form': form,
        'title': title,
        'validlink': validlink,
    }
    if extra_context is not None:
        context.update(extra_context)

    return TemplateResponse(request, template_name, context)


@deprecate_current_app
def password_reset_complete(request,
                            template_name='password_reset_complete.html',
                            extra_context=None):
    context = {
        'login_url': resolve_url(settings.LOGIN_URL),
        'title': _('Password reset complete'),
    }
    if extra_context is not None:
        context.update(extra_context)

    return TemplateResponse(request, template_name, context)


@sensitive_post_parameters()
@csrf_protect
@login_required
@deprecate_current_app
def password_change(request,
                    template_name='password_change_form.html',
                    post_change_redirect=None,
                    password_change_form=PasswordChangeForm,
                    extra_context=None):
    if post_change_redirect is None:
        post_change_redirect = reverse('password_change_done')
    else:
        post_change_redirect = resolve_url(post_change_redirect)
    if request.method == "POST":
        form = password_change_form(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            # Updating the password logs out all other sessions for the user
            # except the current one.
            update_session_auth_hash(request, form.user)
            return HttpResponseRedirect(post_change_redirect)
    else:
        form = password_change_form(user=request.user)
    context = {
        'form': form,
        'title': _('Password change'),
    }
    if extra_context is not None:
        context.update(extra_context)

    return TemplateResponse(request, template_name, context)


@sensitive_post_parameters()
@csrf_protect
@login_required
@deprecate_current_app
def password_change_social(request,
                           template_name='password_change_form.html',
                           post_change_redirect=None,
                           password_change_form=MyPasswordChangeForm,
                           extra_context=None):
    if post_change_redirect is None:
        post_change_redirect = reverse('password_change_done')
    else:
        post_change_redirect = resolve_url(post_change_redirect)
    if request.method == "POST":
        form = password_change_form(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            # Updating the password logs out all other sessions for the user
            # except the current one.
            update_session_auth_hash(request, form.user)
            return HttpResponseRedirect(post_change_redirect)
    else:
        form = password_change_form(user=request.user)
    context = {
        'form': form,
        'title': _('Password change'),
    }
    if extra_context is not None:
        context.update(extra_context)

    return TemplateResponse(request, template_name, context)


@login_required
@deprecate_current_app
def password_change_done(request,
                         template_name='password_change_done.html',
                         extra_context=None):
    context = {
        'title': _('Password change successful'),
    }
    if extra_context is not None:
        context.update(extra_context)
    sns_id = request.session.get('social_login_id', '')
    if sns_id != '' and sns_id is not None:
        sns_data = SnsInfoTb.objects.filter(member_id=request.user.id, sns_id=sns_id, use=USE)
        sns_data.update(change_password_check=1)

    return TemplateResponse(request, template_name, context)


def check_phone_logic(request):
    token = request.POST.get('token', '')
    recaptcha_test_session = request.session.get('recaptcha_session', '')
    sms_count = request.session.get('sms_count', 0)
    phone_number = request.POST.get('phone_number', '')

    recaptcha_secret_key = settings.PTERS_reCAPTCHA_SECRET_KEY
    sms_activation_count = settings.PTERS_SMS_ACTIVATION_MAX_COUNT
    error = None

    if phone_number == '':
        error = '휴대폰 번호를 입력해주세요.'

    if error is None:
        if int(sms_count) < sms_activation_count:
            if recaptcha_test_session != 'success':
                error = func_recaptcha_test(recaptcha_secret_key, token)
                if error is None:
                    request.session['recaptcha_session'] = 'success'
                else:
                    request.session['recaptcha_session'] = 'failed'
        else:
            error = '일일 문자 인증 횟수가 '+str(sms_activation_count)+'회 초과했습니다.'

    if error is None:
        max_range = 99999
        request.session['sms_activation_check'] = False
        request.session['sms_activation_time'] = str(timezone.now())
        sms_activation_number = str(random.randrange(0, max_range)).zfill(len(str(max_range)))
        request.session['sms_activation_number'] = sms_activation_number
        error = func_send_sms_auth(phone_number, sms_activation_number)

    if error is not None:
        logger.error('error:'+str(error)+':'+str(timezone.now()))
        messages.error(request, error)

    return render(request, 'ajax/trainer_error_ajax.html')


def func_recaptcha_test(recaptcha_secret_key, token):
    error = None
    h = httplib2.Http()
    resp, content = h.request("https://www.google.com/recaptcha/api/siteverify",
                              method="POST", body='secret=' + recaptcha_secret_key + '&response=' + token,
                              headers={'Content-Type': 'application/x-www-form-urlencoded;'})
    if resp['status'] != '200':
        error = '비정상적인 접근입니다.[1]'
    else:
        response_data = content.decode('utf-8')
        response_json_data = None
        error = None
        try:
            response_json_data = json.loads(response_data)
        except ValueError:
            error = '비정상적인 접근입니다.[2]'
        except TypeError:
            error = '비정상적인 접근입니다.[3]'

        if error is None:
            success = response_json_data['success']
            if success:
                score = response_json_data['score']
                if score < 0.5:
                    error = '비정상적인 접근입니다.[4]'
            else:
                error = '비정상적인 접근입니다.[5]'

    return error


def func_send_sms_auth(phone, activation_number):
    error = None
    h = httplib2.Http()
    acc_key_id = settings.PTERS_NAVER_ACCESS_KEY_ID
    acc_sec_key = settings.PTERS_NAVER_SECRET_KEY.encode('utf-8')

    sms_uri = "/sms/v2/services/{}/messages".format(settings.PTERS_NAVER_SMS_API_KEY_ID)
    sms_url = "https://sens.apigw.ntruss.com{}".format(sms_uri)

    stime = int(float(time.time()) * 1000)
    hash_str = "POST {}\n{}\n{}".format(sms_uri, str(stime), acc_key_id)
    digest = hmac.new(acc_sec_key, msg=hash_str.encode('utf-8'), digestmod=hashlib.sha256).digest()
    d_hash = base64.b64encode(digest).decode()

    data = {
        "type": "SMS",
        "contentType": "COMM",
        "countryCode": "82",
        "from": "01027850505",
        "content": "[PTERS] 인증번호 ["+activation_number+"]를 입력해주세요.",
        "messages": [
            {
                "to": str(phone),
                "content": "[PTERS] 인증번호 ["+activation_number+"]를 입력해주세요."
            }
        ]
    }
    body = json.dumps(data)

    resp, content = h.request(sms_url,
                              method="POST", body=body,
                              headers={'Content-Type': 'application/json; charset=utf-8',
                                       'x-ncp-apigw-timestamp': str(stime),
                                       'x-ncp-iam-access-key': acc_key_id,
                                       'x-ncp-apigw-signature-v2': d_hash})
    if resp['status'] != '202':
        error = '비정상적인 접근입니다.[2-1]'
    return error


class ActivateSmsConfirmView(View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):
        user_activation_code = request.POST.get('user_activation_code')
        sms_activation_number = request.session.get('sms_activation_number')
        sms_activation_time = request.session.get('sms_activation_time')
        now = timezone.now()
        error = None
        sms_activation_time = datetime.datetime.strptime(sms_activation_time, '%Y-%m-%d %H:%M:%S.%f')

        time_interval = str(now-sms_activation_time)
        time_interval_data = time_interval.split('.')[0].split(':')
        time_interval_minutes = time_interval_data[1]
        time_interval_seconds = time_interval_data[2]

        if user_activation_code == sms_activation_number:
            if(int(time_interval_minutes)*60+int(time_interval_seconds)) > settings.SMS_ACTIVATION_SECONDS:
                error = '입력 시한이 지났습니다.'
                request.session['sms_activation_check'] = False
            else:
                request.session['sms_activation_check'] = True
        else:
            request.session['sms_activation_check'] = False
            error = '문자 인증번호가 일치하지 않습니다.'
        if error is not None:
            messages.error(request, error)

        return render(request, self.template_name)
