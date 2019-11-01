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
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User, Group
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.contrib.auth.views import deprecate_current_app
from django.contrib.sites.shortcuts import get_current_site
from django.core import signing
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.core.mail import EmailMultiAlternatives
from django.db import IntegrityError, InternalError, transaction
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render, resolve_url
from django.template import loader
from django.template.loader import render_to_string
from django.template.response import TemplateResponse
from django.urls import reverse
from django.utils import timezone
from django.utils.encoding import force_text, force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.translation import ugettext as _
from django.views import View
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.debug import sensitive_post_parameters
from django.views.generic import TemplateView, FormView
from registration import signals
from registration.backends.hmac.views import RegistrationView, REGISTRATION_SALT
from registration.forms import RegistrationForm

from configs.const import USE, UN_USE, AUTH_TYPE_VIEW, AUTH_TYPE_WAIT, ACTIVATE, ON_SCHEDULE_TYPE
from configs import settings
from payment.functions import func_cancel_period_billing_schedule
from payment.models import PaymentInfoTb, BillingInfoTb, BillingCancelInfoTb
from schedule.models import ScheduleTb
from trainee.models import MemberTicketTb, MemberMemberTicketTb
from trainer.models import LectureMemberTb, ClassTb, SettingTb, LectureTb
from trainer.models import LectureMemberTicketTb
from .forms import MyPasswordResetForm, MyPasswordChangeForm, MyRegistrationForm
from .models import MemberTb, PushInfoTb, SnsInfoTb

logger = logging.getLogger(__name__)


def index(request):
    # login 완료시 main page 이동
    template_name = 'general_login.html'

    request.session['APP_VERSION'] = settings.APP_VERSION
    if request.user.is_authenticated():
        next_page = '/check/'
    else:
        next_page = ''

    if next_page == '':
        return render(request, template_name)
    else:
        return redirect(next_page)


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

    request.session['APP_VERSION'] = settings.APP_VERSION
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
                        # if auto_login_check == '0':
                        #     request.session.set_expiry(0)
                    else:
                        group_list = user.groups.filter(user=user.id)
                        group_name = 'trainer'
                        if len(group_list) == 1:
                            group_name = group_list[0].name
                        # if group_name == 'trainee' and not user.check_password('0000'):
                        if group_name == 'trainee':
                            login(request, user)
                            # if auto_login_check == '0':
                            #     request.session.set_expiry(0)
                        else:
                            request.session['member_id'] = user.id
                            request.session['username'] = user.username
                            next_page = '/login/authenticated_member/'
                else:
                    error = '이미 탈퇴한 회원입니다.'
        else:
            error = 'ID/비밀번호를 확인해주세요.'
            # next_page = '/'
            # logger.error(error)

    if error is not None:
        messages.error(request, error)
    return redirect(next_page)


class ServiceInfoView(TemplateView):
    template_name = 'service_info.html'

    def get_context_data(self, **kwargs):
        context = super(ServiceInfoView, self).get_context_data(**kwargs)
        return context


class ServiceTestLoginView(TemplateView):
    template_name = 'service_test_login.html'

    def get_context_data(self, **kwargs):
        context = super(ServiceTestLoginView, self).get_context_data(**kwargs)

        # db 업데이트용
        # DB 수업 시간 업데이트
        # class_data = ClassTb.objects.filter(use=USE)
        # for class_info in class_data:
        #     setting_data = SettingTb.objects.filter(class_tb_id=class_info.class_id,
        #                                             setting_type_cd='LT_CALENDAR_BASIC_SETTING_TIME')
        #     if len(setting_data) > 1:
        #         print('LT_CALENDAR_BASIC_SETTING_TIME:'+str(class_info.class_id))
        #     setting_data2 = SettingTb.objects.filter(class_tb_id=class_info.class_id,
        #                                              setting_type_cd='LT_CALENDAR_TIME_SELECTOR_TYPE')
        #     if len(setting_data2) > 1:
        #         print('LT_CALENDAR_TIME_SELECTOR_TYPE:'+str(class_info.class_id))
            # try:
            #     setting_info = SettingTb.objects.get(class_tb_id=class_info.class_id,
            #                                          setting_type_cd='LT_RES_MEMBER_TIME_DURATION')
            #     update_setting_hour = int(setting_info.setting_info)
            #     if update_setting_hour < 10:
            #         update_setting_hour = int(class_info.class_hour)*int(setting_info.setting_info)
            #
            #     try:
            #         update_setting_data = SettingTb.objects.get(member_id=class_info.member_id,
            #                                                     class_tb_id=class_info.class_id,
            #                                                     setting_type_cd='LT_CALENDAR_BASIC_SETTING_TIME')
            #     except ObjectDoesNotExist:
            #         update_setting_data = SettingTb(member_id=class_info.member_id,  class_tb_id=class_info.class_id,
            #                                         setting_type_cd='LT_CALENDAR_BASIC_SETTING_TIME', use=USE)
            #     update_setting_data.setting_info = str(update_setting_hour)
            #     update_setting_data.save()
            #
            #     lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id)
            #     lecture_data.update(lecture_minute=update_setting_hour)
            # except ObjectDoesNotExist:
            #     try:
            #         update_setting_data = SettingTb.objects.get(member_id=class_info.member_id,
            #                                                     class_tb_id=class_info.class_id,
            #                                                     setting_type_cd='LT_CALENDAR_BASIC_SETTING_TIME')
            #     except ObjectDoesNotExist:
            #         update_setting_data = SettingTb(member_id=class_info.member_id,  class_tb_id=class_info.class_id,
            #                                         setting_type_cd='LT_CALENDAR_BASIC_SETTING_TIME', use=USE)
            #     update_setting_data.setting_info = str(class_info.class_hour)
            #     update_setting_data.save()
            #     lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id)
            #     lecture_data.update(lecture_minute=class_info.class_hour)
            #
            # try:
            #     update_setting_data2 = SettingTb.objects.get(member_id=class_info.member_id,
            #                                                  class_tb_id=class_info.class_id,
            #                                                  setting_type_cd='LT_CALENDAR_TIME_SELECTOR_TYPE')
            # except ObjectDoesNotExist:
            #     update_setting_data2 = SettingTb(member_id=class_info.member_id, class_tb_id=class_info.class_id,
            #                                      setting_type_cd='LT_CALENDAR_TIME_SELECTOR_TYPE', use=USE)
            #
            # update_setting_data2.setting_info = '0'
            # update_setting_data2.save()

            # setting_data.delete()

        # group_lecture_list = LectureMemberTicketTb.objects.select_related('lecture_tb',
        #                                                                   'member_ticket_tb__member').filter(fix_state_cd='FIX', use=USE)
        #
        # for group_lecture_info in group_lecture_list:
        #     lecture_member_count = LectureMemberTb.objects.filter(lecture_tb_id=group_lecture_info.lecture_tb_id,
        #                                                           member_id=group_lecture_info.member_ticket_tb.member_id,
        #                                                           use=USE).count()
        #     if lecture_member_count == 0:
        #         group_member_info = LectureMemberTb(class_tb_id=group_lecture_info.lecture_tb.class_tb_id,
        #                                             fix_state_cd='FIX',
        #                                             lecture_tb_id=group_lecture_info.lecture_tb_id,
        #                                             member_id=group_lecture_info.member_ticket_tb.member_id, use=USE)
        #         group_member_info.save()
        # member_ticket_data = MemberTicketTb.objects.filter(member_auth_cd__isnull=True)
        # for member_ticket_info in member_ticket_data:
        #     try:
        #         member_member_ticket_info = MemberMemberTicketTb.objects.get(member_ticket_tb_id=member_ticket_info.member_ticket_id)
        #         member_ticket_info.member_auth_cd = member_member_ticket_info.auth_cd
        #         member_ticket_info.save()
        #     except ObjectDoesNotExist:
        #         member_lecture = None
        # schedule_data = ScheduleTb.objects.select_related('lecture_tb').filter(ing_color_cd__isnull=True,
        #                                                                        en_dis_type=ON_SCHEDULE_TYPE)
        # for schedule_info in schedule_data:
        #     if schedule_info.lecture_tb is not None and schedule_info.lecture_tb != '':
        #         schedule_info.max_mem_count = schedule_info.lecture_tb.member_num
        #         schedule_info.ing_color_cd = schedule_info.lecture_tb.ing_color_cd
        #         schedule_info.ing_font_color_cd = schedule_info.lecture_tb.ing_font_color_cd
        #         schedule_info.end_color_cd = schedule_info.lecture_tb.end_color_cd
        #         schedule_info.end_font_color_cd = schedule_info.lecture_tb.end_font_color_cd
        #     else:
        #         schedule_info.ing_color_cd = '#fbf3bd'
        #         schedule_info.ing_font_color_cd = '#282828'
        #         schedule_info.end_color_cd = '#d2d1cf'
        #         schedule_info.end_font_color_cd = '#282828'
        #     schedule_info.save()
        return context


class CheckRegistration(TemplateView):
    template_name = 'check_registration.html'

    def get_context_data(self, **kwargs):
        context = super(CheckRegistration, self).get_context_data(**kwargs)

        return context


class LoginSimpleNaverView(TemplateView):
    template_name = 'login_naver_processing.html'

    def get_context_data(self, **kwargs):
        context = super(LoginSimpleNaverView, self).get_context_data(**kwargs)
        return context


class LoginSimpleKakaoView(TemplateView):
    template_name = 'login_kakao_processing.html'

    def get_context_data(self, **kwargs):
        context = super(LoginSimpleKakaoView, self).get_context_data(**kwargs)
        context['access_token'] = self.request.GET.get('access_token', '')
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


class AddSocialMemberInfoView(RegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):

        email = request.POST.get('email', '')
        first_name = request.POST.get('first_name', '')
        name = request.POST.get('name', '')
        sex = request.POST.get('sex', '')
        sns_id = request.POST.get('sns_id', '')
        sns_type = request.POST.get('sns_type', 'naver')
        auto_login_check = request.POST.get('auto_login_check', '1')
        group_type = request.POST.get('group_type', 'trainer')
        social_access_token = request.POST.get('social_accessToken', '')
        next_page = request.POST.get('next_page', '/login/registration_social/')

        error = None
        user = None
        if first_name == '' or first_name == 'None' or first_name is None:
            first_name = name

        if email == '' or email is None:
            username = sns_id
        else:
            username = email
        try:
            user = User.objects.get(username=username)
        except ObjectDoesNotExist:
            error = None

        if user is not None:
            error = '이미 가입된 회원입니다.'

        if error is None:
            try:
                with transaction.atomic():

                    user = User.objects.create_user(username=username, first_name=first_name, email=email,
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
                    self.request.session['social_login_check'] = '1'
                    self.request.session['social_login_type'] = sns_type
                    self.request.session['social_login_id'] = sns_id
                    self.request.session['social_accessToken'] = social_access_token
                    if auto_login_check == '0':
                        self.request.session.set_expiry(0)
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
            logger.error(name + '[' + username + ']' + error)
            messages.error(request, error)

        return redirect(next_page)


class AddOldSocialMemberInfoView(RegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):

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


class RegistrationSocialView(TemplateView):
    template_name = 'registration_social_form.html'

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


class CheckSocialMemberInfoView(TemplateView):
    template_name = 'ajax/registration_error_ajax.html'
    error = ''

    def get_context_data(self, **kwargs):
        context = super(CheckSocialMemberInfoView, self).get_context_data(**kwargs)
        user_email = self.request.GET.get('email', '')
        sns_id = self.request.GET.get('sns_id', '')
        sns_type = self.request.GET.get('sns_type', '')
        username = ''
        if user_email is None or user_email == '':
            user_email = sns_id

        # 소셜 회원가입하지 않고 email 정보도 없는 회원
        context['social_check'] = '0'

        # 소셜 회원가입한 회원
        try:
            sns_info = SnsInfoTb.objects.select_related('member').get(sns_id=sns_id, sns_type=sns_type, use=USE)
            username = sns_info.member.user.username
            context['social_check'] = '1'
        except ObjectDoesNotExist:
            sns_info = None

        # 소셜 회원가입하지 않았으나 email은 등록된 회원
        if sns_info is None and user_email is not None and user_email != '':
            try:
                user_info = User.objects.get(email=user_email)
                username = user_info.username
                context['social_check'] = '2'
            except ObjectDoesNotExist:
                username = ''

        # 소셜 회원가입하지 않았으나 email은 등록된 회원
        if username == '':
            try:
                user_info = User.objects.get(username=user_email)
                username = user_info.username
                context['social_check'] = '2'
            except ObjectDoesNotExist:
                username = ''

        context['username'] = username

        return context


# 회원가입 api
class AddTempMemberInfoView(RegistrationView, View):
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


class AddMemberView(RegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):
        form = MyRegistrationForm(request.POST, request.FILES)
        name = request.POST.get('name', '')
        first_name = request.POST.get('first_name', name)
        phone = request.POST.get('phone', '')
        group_type = request.POST.get('group_type', 'trainee')
        sms_activation_check = request.session.get('sms_activation_check', False)
        error = None

        if sms_activation_check is False:
            error = '문자 인증을 완료해주세요.'

        if error is None:
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

                            member = MemberTb(member_id=user.id, name=name, phone=phone, user_id=user.id,
                                              phone_is_active=ACTIVATE, use=USE)
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
                    for err in field.errors:
                        messages.error(request, str(field.label)+':'+err)
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


class RegisterErrorView(TemplateView):
    template_name = 'ajax/registration_error_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(RegisterErrorView, self).get_context_data(**kwargs)

        return context


class RegistrationTempView(TemplateView):
    template_name = 'registration_temp_member_form.html'

    def get_context_data(self, **kwargs):
        context = super(RegistrationTempView, self).get_context_data(**kwargs)

        return context


# 회원가입 api
class AddTempMemberInfoView(RegistrationView, View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):

        form = MyRegistrationForm(request.POST, request.FILES)
        member_id = request.POST.get('member_id', '')
        error = None
        user = None
        try:
            user = User.objects.get(id=member_id)
        except ObjectDoesNotExist:
            error = '가입되지 않은 회원입니다.'

        if error is None:
            if form.is_valid():
                try:
                    with transaction.atomic():
                        user.username = form.cleaned_data['username']
                        user.set_password(form.cleaned_data['password1'])
                        user.save()

                except ValueError:
                    error = '오류가 발생했습니다.[1]'
                except IntegrityError:
                    error = '오류가 발생했습니다.[2]'
                except TypeError:
                    error = '오류가 발생했습니다.[3]'
                except ValidationError:
                    error = '오류가 발생했습니다.[4]'
                except InternalError:
                    error = '오류가 발생했습니다.[5]'
            else:
                for field in form:
                    for err in field.errors:
                        messages.error(request, str(field.label)+':'+err)

        if error is not None:
            logger.error('member_id:'+str(member_id)+'[' + form.cleaned_data['username'] + ']' + error)
            messages.error(request, error)

        return render(request, self.template_name)


class AuthenticatedMemberView(View):
    template_name = 'registration_authenticated_member_form.html'

    def get(self, request):
        context = {}
        member_id = request.session.get('member_id', '')
        error = None
        if member_id is None or member_id == '':
            error = '회원 정보를 불러오지 못했습니다.[1]'

        if error is None:
            try:
                member = MemberTb.objects.get(member_id=member_id)
                context['member'] = member
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.[2]'

        if error is not None:
            logger.error('member_id:'+str(member_id) + str(error))
            messages.error(request, error)

        return render(request, self.template_name, context)


def authenticated_member_logic(request):
    member_id = request.POST.get('member_id', '')
    error = None
    if member_id is None or member_id == '':
        error = '회원 정보를 불러오지 못했습니다.[1]'

    if error is None:
        try:
            member = MemberTb.objects.get(member_id=member_id)
            member.user.is_active = True
            member.user.save()
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.[2]'

    if error is not None:
        logger.error('member_id:'+str(member_id) + str(error))
        messages.error(request, error)

    return render(request, 'ajax/registration_error_ajax.html')


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


def activate_sms_logic(request):
    token = request.POST.get('token', '')
    recaptcha_test_session = request.session.get('recaptcha_session', '')
    sms_count = request.session.get('sms_count', 0)
    phone = request.POST.get('phone', '')

    recaptcha_secret_key = settings.PTERS_reCAPTCHA_SECRET_KEY
    sms_activation_count = settings.PTERS_SMS_ACTIVATION_MAX_COUNT
    error = None

    if phone == '':
        error = '휴대폰 번호를 입력해주세요.'
    else:
        member_list = MemberTb.objects.filter(phone=phone, phone_is_active=ACTIVATE, use=USE)
        if len(member_list) > 0:
            error = '이미 등록된 휴대폰 번호가 존재합니다.'

    if error is None:
        if int(sms_count) < sms_activation_count:
            if recaptcha_test_session != 'success':
                # error = func_recaptcha_test(recaptcha_secret_key, token)
                # 테스트
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
        error = func_send_sms_auth(phone, sms_activation_number)

    if error is not None:
        logger.error('error:'+str(error)+':'+str(timezone.now()))
        messages.error(request, error)

    return render(request, 'ajax/trainer_error_ajax.html')


def activate_email_logic(request):
    token = request.POST.get('token', '')
    recaptcha_test_session = request.session.get('recaptcha_session', '')
    # sms_count = request.session.get('email_count', 0)
    email = request.POST.get('email', '')

    recaptcha_secret_key = settings.PTERS_reCAPTCHA_SECRET_KEY
    # sms_activation_count = settings.PTERS_SMS_ACTIVATION_MAX_COUNT
    error = None

    if email == '':
        error = '이메일 주소를 입력해주세요.'
    # else:
    #     member_list = MemberTb.objects.filter(user__email=email, phone_is_active=ACTIVATE, use=USE)
    #     if len(member_list) > 0:
    #         error = '이미 등록된 휴대폰 번호가 존재합니다.'

    if error is None:
        # if int(sms_count) < sms_activation_count:
        if recaptcha_test_session != 'success':
            # error = func_recaptcha_test(recaptcha_secret_key, token)
            # 테스트
            if error is None:
                request.session['recaptcha_session'] = 'success'
            else:
                request.session['recaptcha_session'] = 'failed'
        # else:
        #     error = '일일 문자 인증 횟수가 '+str(sms_activation_count)+'회 초과했습니다.'

    if error is None:
        max_range = 99999
        request.session['email_activation_check'] = False
        request.session['email_activation_time'] = str(timezone.now())
        email_activation_number = str(random.randrange(0, max_range)).zfill(len(str(max_range)))
        request.session['email_activation_number'] = email_activation_number
        error = func_send_email_auth(email, email_activation_number)

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

    now = int(float(time.time()) * 1000)
    hash_str = "POST {}\n{}\n{}".format(sms_uri, str(now), acc_key_id)
    digest = hmac.new(acc_sec_key, msg=hash_str.encode('utf-8'), digestmod=hashlib.sha256).digest()
    d_hash = base64.b64encode(digest).decode()

    data = {
        "type": "SMS",
        "contentType": "COMM",
        "countryCode": "82",
        "from": settings.PTERS_NAVER_SMS_PHONE_NUMBER,
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
                                       'x-ncp-apigw-timestamp': str(now),
                                       'x-ncp-iam-access-key': acc_key_id,
                                       'x-ncp-apigw-signature-v2': d_hash})
    if resp['status'] != '202':
        error = '비정상적인 접근입니다.[2-1]'
    return error


def func_send_email_auth(email, activation_number, request):
    current_site = get_current_site(request)
    site_name = current_site.name
    domain = current_site.domain
    context = {
        'email': email,
        'domain': domain,
        'site_name': site_name,
        'request': request,
        'reset_activation_number': activation_number
    }
    body = loader.render_to_string('activation_email.html', context)
    subject = loader.render_to_string('activation_email_subject.txt', context)
    email_message = EmailMultiAlternatives(subject, body, None, [email])
    html_email = loader.render_to_string('activation_email.html', context)
    email_message.attach_alternative(html_email, 'text/html')
    email_message.send()


class ActivateSmsConfirmView(View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):
        user_activation_code = request.POST.get('user_activation_code')
        phone = request.POST.get('phone', '')
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
                if phone is not None and phone != '':
                    try:
                        member_info = MemberTb.objects.get(member_id=request.user.id)
                        member_info.phone = phone
                        member_info.phone_is_active = ACTIVATE
                        member_info.save()
                    except ObjectDoesNotExist:
                        error = None
        else:
            request.session['sms_activation_check'] = False
            error = '문자 인증번호가 일치하지 않습니다.'
        if error is not None:
            messages.error(request, error)

        return render(request, self.template_name)


class ActivateEmailConfirmView(View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):
        user_activation_code = request.POST.get('user_activation_code')
        email = request.POST.get('email', '')
        email_activation_number = request.session.get('email_activation_number')
        email_activation_time = request.session.get('email_activation_time')
        now = timezone.now()
        error = None
        email_activation_time = datetime.datetime.strptime(email_activation_time, '%Y-%m-%d %H:%M:%S.%f')

        time_interval = str(now-email_activation_time)
        time_interval_data = time_interval.split('.')[0].split(':')
        time_interval_minutes = time_interval_data[1]
        time_interval_seconds = time_interval_data[2]

        if user_activation_code == email_activation_number:
            if(int(time_interval_minutes)*60+int(time_interval_seconds)) > settings.EMAIL_ACTIVATION_SECONDS:
                error = '입력 시한이 지났습니다.'
                request.session['email_activation_check'] = False
            else:
                request.session['email_activation_check'] = True
                if email is not None and email != '':
                    try:
                        member_info = MemberTb.objects.get(member_id=request.user.id)
                        member_info.user.email = email
                        member_info.save()
                    except ObjectDoesNotExist:
                        error = None
        else:
            request.session['email_activation_check'] = False
            error = '인증번호가 일치하지 않습니다.'
        if error is not None:
            messages.error(request, error)

        return render(request, self.template_name)


class FindIdView(TemplateView):
    template_name = 'find_id_form.html'

    def get_context_data(self, **kwargs):
        context = super(FindIdView, self).get_context_data(**kwargs)
        return context

    def post(self, request):
        name = request.POST.get('name', '')
        phone = request.POST.get('phone', '')
        email = request.POST.get('email', '')
        find_id_type = request.POST.get('find_id_type', '')
        error = None
        member_username = ''

        if find_id_type == 'phone':
            if phone is None or phone == '':
                error = '휴대폰 번호를 입력해주세요'
        elif find_id_type == 'email':
            if email is None or email == '':
                error = '이메일을 입력해주세요.'
        if name is None or name == '':
            error = '이름을 입력해주세요.'

        if error is None:
            try:
                member = None
                if find_id_type == 'phone':
                    member = MemberTb.objects.get(name=name, phone=phone)
                elif find_id_type == 'email':
                    member = MemberTb.objects.get(name=name, user__email=email)

                if member is not None:
                    counter = 0
                    for member_username_info in member.user.username:
                        if counter < 3:
                            member_username += member_username_info
                        else:
                            member_username += '*'
                        counter += 1

            except ObjectDoesNotExist:
                error = '일치하는 회원 정보가 없습니다.'

        if error is not None:
            messages.error(self.request, error)
        return render(request, self.template_name, {'username': member_username})


class ResetPasswordView(TemplateView):
    template_name = 'reset_password_form.html'

    def get_context_data(self, **kwargs):
        context = super(ResetPasswordView, self).get_context_data(**kwargs)
        self.request.session.set_expiry(1)
        return context


class ResetPassword2View(View):
    template_name = 'reset_password_form2.html'

    def post(self, request):
        # name = request.POST.get('name', '')
        username = request.POST.get('username', '')
        error = None
        member = None
        request.session['reset_activation_check'] = False

        if username is None or username == '':
            error = '아이디를 입력해주세요'
        # if name is None or name == '':
        #     error = '이름을 입력해주세요.'
        if error is None:
            try:
                member = MemberTb.objects.get(user__username=username)
                # member = MemberTb.objects.get(name=name, user__username=username)
                if member.phone is None:
                    member.phone = ''
                else:
                    if len(member.phone) < 10:
                        member.phone = ''
                    else:
                        member.phone = member.phone[0:3] + '-' + member.phone[3:4] + '***-' + member.phone[7:8]+'***'
                if member.user.email is None:
                    member.email = ''
                else:
                    member_email = ''
                    counter = 0
                    email_check = False
                    for member_email_info in member.user.email:
                        if counter < 3 or member_email_info == '@':
                            member_email += member_email_info
                        else:
                            member_email += '*'
                        if member_email_info == '@':
                            counter = 0
                            email_check = True
                        counter += 1

                    if email_check:
                        member.email = member_email
                    else:
                        member.email = ''
            except ObjectDoesNotExist:
                error = '일치하는 회원 정보가 없습니다.'

        if error is not None:
            messages.error(request, error)

        return render(request, self.template_name, {'member': member})


def reset_password3(request):
    member_id = request.POST.get('member_id', '')
    reset_activation_check = request.session.get('reset_activation_check', False)
    reset_password_time = request.session.get('reset_password_time')
    error = None
    member = None

    if member_id is None or member_id == '':
        error = '일치하는 회원 정보가 없습니다.[0]'

    if error is None:
        try:
            member = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '일치하는 회원 정보가 없습니다.[1]'

    if error is None:
        if reset_activation_check is False:
            error = '잘못된 접근입니다.'

    if error is None:
        if reset_password_time is None or reset_password_time == '':
            reset_password_time = str(timezone.now())
            request.session['reset_password_time'] = reset_password_time
        reset_password_time = datetime.datetime.strptime(reset_password_time, '%Y-%m-%d %H:%M:%S.%f')

        time_interval = str(timezone.now()-reset_password_time)
        time_interval_data = time_interval.split('.')[0].split(':')
        time_interval_minutes = time_interval_data[1]
        time_interval_seconds = time_interval_data[2]

        if(int(time_interval_minutes)*60+int(time_interval_seconds)) > settings.RESET_PASSWORD_ACTIVATION_SECONDS:
            error = '입력 시한이 지났습니다. 다시 인증을 해주세요.[0]'

    if error is None:
        return render(request, 'reset_password_form3.html', {'member': member})
    else:
        messages.error(request, error)
        return redirect('/login/reset_password/')


def reset_password_logic(request):
    reset_password_time = request.session.get('reset_password_time')
    reset_activation_check = request.session.get('reset_activation_check', False)
    error = None

    if request.method == "POST":
        member_id = request.POST.get('member_id', '')
        member = None
        if member_id is None or member_id == '':
            error = '일치하는 회원 정보가 없습니다.[0]'

        if error is None:
            try:
                member = MemberTb.objects.get(member_id=member_id)
            except ObjectDoesNotExist:
                error = '일치하는 회원 정보가 없습니다.[1]'

        if error is None:
            if reset_activation_check is False:
                error = '잘못된 접근입니다.'

        if error is None:
            if reset_password_time is None or reset_password_time == '':
                reset_password_time = str(timezone.now())
                request.session['reset_password_time'] = reset_password_time
            reset_password_time = datetime.datetime.strptime(reset_password_time, '%Y-%m-%d %H:%M:%S.%f')

            time_interval = str(timezone.now() - reset_password_time)
            time_interval_data = time_interval.split('.')[0].split(':')
            time_interval_minutes = time_interval_data[1]
            time_interval_seconds = time_interval_data[2]

            if (int(time_interval_minutes) * 60 + int(
                    time_interval_seconds)) > settings.RESET_PASSWORD_ACTIVATION_SECONDS:
                error = '입력 시한이 지났습니다. 다시 인증을 해주세요.[0]'

        if error is None:
            form = MyPasswordChangeForm(user=member.user, data=request.POST)
            if form.is_valid():
                form.save()
            else:
                for field in form:
                    for err in field.errors:
                        messages.error(request, str(field.label)+':'+err)
    else:
        error = '잘못된 접근입니다.'
    if error is not None:
        messages.error(request, str(field.label)+':'+err)

    return render(request, 'ajax/registration_error_ajax.html')


class ResetActivateView(View):
    template_name = 'ajax/registration_error_ajax.html'
    sms_template_name = 'password_reset_sms.txt'

    def post(self, request):
        token = request.POST.get('token', '')
        recaptcha_test_session = request.session.get('recaptcha_session', '')
        sms_count = request.session.get('sms_count', 0)
        member_id = request.POST.get('member_id', '')
        phone = request.POST.get('phone', '')
        email = request.POST.get('email', '')
        activation_type = request.POST.get('activation_type', 'phone')

        recaptcha_secret_key = settings.PTERS_reCAPTCHA_SECRET_KEY
        sms_activation_count = settings.PTERS_SMS_ACTIVATION_MAX_COUNT
        error = None
        max_range = 99999
        request.session['reset_activation_check'] = False
        request.session['reset_activation_time'] = str(timezone.now())
        reset_activation_number = str(random.randrange(0, max_range)).zfill(len(str(max_range)))
        request.session['reset_activation_number'] = reset_activation_number
        request.session['reset_activation_type'] = activation_type

        if recaptcha_test_session != 'success':
            # error = func_recaptcha_test(recaptcha_secret_key, token)
            if error is None:
                request.session['recaptcha_session'] = 'success'
            else:
                request.session['recaptcha_session'] = 'failed'

        if activation_type == 'phone':
            if phone == '':
                error = '휴대폰 번호를 입력해주세요.'
            else:
                member_list = MemberTb.objects.filter(member_id=member_id, phone=phone, use=USE)
                if len(member_list) == 0:
                    error = '휴대폰 번호가 잘못됐습니다.'

            if error is None:
                if int(sms_count) > sms_activation_count:
                    error = '일일 문자 인증 횟수가 '+str(sms_activation_count)+'회 초과했습니다.'

            if error is None:
                error = func_send_sms_auth(phone, reset_activation_number)

        elif activation_type == 'email':
            if email == '':
                error = '이메일 주소를 입력해주세요.'
            else:
                member_list = MemberTb.objects.filter(member_id=member_id, user__email=email, use=USE)
                if len(member_list) == 0:
                    error = '이메일 주소가 잘못됐습니다.'

            if error is None:
                func_send_email_auth(email, reset_activation_number, request)

        else:
            error = '인증하실 방법을 선택해주세요.'

        if error is not None:
            logger.error('error:'+str(error)+':'+str(timezone.now()))
            messages.error(request, error)

        return render(request, self.template_name)


class ResetActivateConfirmView(View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):
        user_activation_code = request.POST.get('user_activation_code')
        sms_activation_number = request.session.get('reset_activation_number')
        sms_activation_time = request.session.get('reset_activation_time')
        reset_activation_type = request.session.get('reset_activation_type', 'phone')
        now = timezone.now()
        error = None
        sms_activation_time = datetime.datetime.strptime(sms_activation_time, '%Y-%m-%d %H:%M:%S.%f')

        time_interval = str(now-sms_activation_time)
        time_interval_data = time_interval.split('.')[0].split(':')
        time_interval_minutes = time_interval_data[1]
        time_interval_seconds = time_interval_data[2]

        limit_time = settings.SMS_ACTIVATION_SECONDS
        if reset_activation_type == 'email':
            limit_time = settings.EMAIL_ACTIVATION_SECONDS

        if user_activation_code == sms_activation_number:
            if(int(time_interval_minutes)*60+int(time_interval_seconds)) > limit_time:
                error = '입력 시한이 지났습니다.'
                request.session['reset_activation_check'] = False
            else:
                request.session['reset_activation_check'] = True
        else:
            request.session['reset_activation_check'] = False
            error = '인증번호가 일치하지 않습니다.'
        if error is not None:
            messages.error(request, error)

        return render(request, self.template_name)


def password_change_logic(request):
    old_password = request.POST.get('old_password', '')
    new_password1 = request.POST.get('new_password1', '')
    new_password2 = request.POST.get('new_password2', '')

    error = None

    if not request.user.check_password(old_password):
        error = '기존 비밀번호가 일치하지 않습니다.'

    if str(new_password1) != str(new_password2):
        error = '새로운 비밀번호가 일치하지 않습니다.'

    if error is None:
        form = MyPasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            update_session_auth_hash(request, form.user)
        else:
            for field in form:
                for err in field.errors:
                    messages.error(request, str(field.label)+':'+err)

    if error is not None:
        messages.error(request, error)

    return render(request, 'ajax/registration_error_ajax.html')


def func_send_sms_reset_password(phone, contents):
    error = None
    h = httplib2.Http()
    acc_key_id = settings.PTERS_NAVER_ACCESS_KEY_ID
    acc_sec_key = settings.PTERS_NAVER_SECRET_KEY.encode('utf-8')

    sms_uri = "/sms/v2/services/{}/messages".format(settings.PTERS_NAVER_SMS_API_KEY_ID)
    sms_url = "https://sens.apigw.ntruss.com{}".format(sms_uri)

    now = int(float(time.time()) * 1000)
    hash_str = "POST {}\n{}\n{}".format(sms_uri, str(now), acc_key_id)
    digest = hmac.new(acc_sec_key, msg=hash_str.encode('utf-8'), digestmod=hashlib.sha256).digest()
    d_hash = base64.b64encode(digest).decode()

    data = {
        "type": "SMS",
        "contentType": "COMM",
        "countryCode": "82",
        "from": settings.PTERS_NAVER_SMS_PHONE_NUMBER,
        "content": contents,
        "messages": [
            {
                "to": str(phone),
                "content": contents
            }
        ]
    }
    body = json.dumps(data)

    resp, content = h.request(sms_url,
                              method="POST", body=body,
                              headers={'Content-Type': 'application/json; charset=utf-8',
                                       'x-ncp-apigw-timestamp': str(now),
                                       'x-ncp-iam-access-key': acc_key_id,
                                       'x-ncp-apigw-signature-v2': d_hash})
    if resp['status'] != '202':
        error = '비정상적인 접근입니다.[2-1]'

    return error


class CheckMemberUsernameView(View):
    template_name = 'ajax/registration_error_ajax.html'

    def post(self, request):
        username = request.POST.get('username', '')
        error = ''
        if username is None or username == '':
            error = '아이디를 입력해주세요.'

        if error == '':
            if User.objects.filter(username=username).exists():
                error = '중복된 아이디 입니다.'

        if error == '':
            form = MyRegistrationForm(request.POST, request.FILES)
            if len(form['username'].errors) > 0:
                error = form['username'].errors[0]

        if error != '':
            if 'This name cannot be registered' in error:
                error = '등록 불가 아이디 입니다.'
            messages.error(request, error)
        return render(request, self.template_name)


class RegistrationView(TemplateView):
    template_name = 'registration_form.html'

    def get_context_data(self, **kwargs):
        context = super(RegistrationView, self).get_context_data(**kwargs)
        self.request.session['sms_activation_check'] = False

        return context


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