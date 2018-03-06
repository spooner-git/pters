# Create your views here.
import datetime

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User, Group
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.shortcuts import redirect, render
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from django.views.generic.base import ContextMixin

from config.views import date_check_func, AccessTestMixin
from login.models import MemberTb, LogTb, HolidayTb
from schedule.views import add_schedule_logic_func, delete_schedule_logic_func, get_trainer_schedule_data_func
from trainee.models import LectureTb
from trainer.models import ClassTb
from schedule.models import ScheduleTb, DeleteScheduleTb, RepeatScheduleTb, DeleteRepeatScheduleTb


class IndexView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'main_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        error = None
        class_info = None
        today = datetime.date.today()
        one_day_after = today + datetime.timedelta(days=1)
        fourteen_days_ago = today - datetime.timedelta(days=14)
        today_schedule_num = 0
        new_member_num = 0
        context['total_member_num'] = 0
        context['to_be_end_member_num'] = 0
        context['today_schedule_num'] = 0
        context['new_member_num'] = 0

        try:
            class_info = ClassTb.objects.get(member=self.request.user.id)
        except ObjectDoesNotExist:
            error = '강사 정보가 존재하지 않습니다'

        if error is None :
            #남은 횟수 1개 이상인 경우 - 180215 hk.kim
            context['total_member_num'] = LectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                                   lecture_rem_count__gte=1).count()
            #남은 횟수 1개 이상 3개 미만인 경우 - 180215 hk.kim
            context['to_be_end_member_num'] = LectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                                       lecture_rem_count__gte=1,
                                                                       lecture_rem_count__lte=3).count()

        if error is None:
            today_schedule_num = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                           start_dt__gte=today, start_dt__lt=one_day_after,
                                                           en_dis_type='1').count()
            new_member_num = LectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                      start_date__gte=fourteen_days_ago, use='1').count()

        context['today_schedule_num'] = today_schedule_num
        context['new_member_num'] = new_member_num

        if error is not None:
            messages.info(self.request, error)

        return context


class CalDayView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_day.html'

    def get_context_data(self, **kwargs):
        context = super(CalDayView, self).get_context_data(**kwargs)
        date = datetime.date.today()
        context = get_trainer_schedule_data_func(context, self.request.user.id, date)
        return context


class CalDayViewAjax(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'cal_day_ajax.html'

    def get(self, request, *args, **kwargs):
        context = super(CalDayViewAjax, self).get_context_data(**kwargs)
        date = datetime.date.today()
        context = get_trainer_schedule_data_func(context, self.request.user.id, date)

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        date = request.POST.get('date')
        if date == '':
            date = datetime.date.today()
        context = super(CalDayViewAjax, self).get_context_data(**kwargs)
        context = get_trainer_schedule_data_func(context, self.request.user.id, date)

        return render(request, self.template_name, context)


class CalWeekView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_week.html'

    def get_context_data(self, **kwargs):
        context = super(CalWeekView, self).get_context_data(**kwargs)
        date = datetime.date.today()
        context = get_trainer_schedule_data_func(context, self.request.user.id, date)

        return context


class CalMonthView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_month.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthView, self).get_context_data(**kwargs)
        date = datetime.date.today()
        context = get_trainer_schedule_data_func(context, self.request.user.id, date)

        holiday = HolidayTb.objects.filter(use='1')
        context['holiday'] = holiday

        return context


class OffRepeatAddView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_add_off_repeat.html'

    def get_context_data(self, **kwargs):
        context = super(OffRepeatAddView, self).get_context_data(**kwargs)

        return context


class ManageMemberView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_member.html'

    def get_context_data(self, **kwargs):
        context = super(ManageMemberView, self).get_context_data(**kwargs)
        context = get_member_data(context,self.request.user.id)

        return context


class ManageMemberViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_member_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(ManageMemberViewAjax, self).get_context_data(**kwargs)
        context = get_member_data(context,self.request.user.id)
        return context


class ManageWorkView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_work.html'

    def get_context_data(self, **kwargs):
        context = super(ManageWorkView, self).get_context_data(**kwargs)
        context = get_member_data(context,self.request.user.id)

        return context


def get_member_data(context, trainer_id):

    error = None
    class_info = None
    context['lecture_info'] = None

    # 강사 정보 가져오기
    try:
        class_info = ClassTb.objects.get(member_id=trainer_id)
    except ObjectDoesNotExist:
        error = '강사 정보가 존재하지 않습니다'

    # 강좌에 해당하는 수강/회원 정보 가져오기
    if error is None:
        # 강좌에 해당하는 수강정보 가져오기
        context['lecture_info'] = LectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                           lecture_rem_count__gt=0, use=1)
        context['lecture_finish_info'] = LectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                                  lecture_rem_count=0, use=1)

        for lecture in context['lecture_info']:
            # 수강정보에 해당하는 회원정보 가져오기
            try:
                lecture.member_info = MemberTb.objects.get(member_id=lecture.member_id, use=1)
            except ObjectDoesNotExist:
                error = '회원 정보가 존재하지 않습니다'

        for lecture in context['lecture_finish_info']:
            # 수강정보에 해당하는 회원정보 가져오기
            try:
                lecture.member_info = MemberTb.objects.get(member_id=lecture.member_id, use=1)
            except ObjectDoesNotExist:
                error = '회원 정보가 존재하지 않습니다'

    return context


class AlarmView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'alarm.html'

    def get_context_data(self, **kwargs):
        context = super(AlarmView, self).get_context_data(**kwargs)
        class_info = None
        error = None

        try:
            class_info = ClassTb.objects.get(member=self.request.user.id)
        except ObjectDoesNotExist:
            error = '강사 정보가 존재하지 않습니다'

        if error is None:
            log_data = LogTb.objects.filter(external_id=self.request.user.id, use=1).order_by('-reg_dt')

        if error is None:
            lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id)

            for lecture_info in lecture_data:
                log_data |= LogTb.objects.filter(external_id=lecture_info.member_id, use=1).order_by('-reg_dt')

            log_data.order_by('-reg_dt')

        if error is None:
            for log_info in log_data:
                log_info.id = log_info.log_id
                log_info.reg_date = log_info.reg_dt
                temp_data = log_info.contents.split('@')
                if len(temp_data) == 2:
                    log_info.log_type = 1
                    log_info.log_contents = temp_data[0]
                    log_info.log_after_date = temp_data[1]
                elif len(temp_data) == 3:
                    log_info.log_type = 2
                    log_info.log_contents = temp_data[0]
                    log_info.log_before_date = temp_data[1]
                    log_info.log_after_date = temp_data[2]
                else:
                    log_info.log_type = 0
                    log_info.log_contents = log_info.contents

                if log_info.read == 0:
                    log_info.log_read = 0
                    log_info.read = 1
                    log_info.save()
                elif log_info.read == 1:
                    log_info.log_read = 1
                else:
                    log_info.log_read = 2

            context['log_data'] = log_data

        return context


class TrainerSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting.html'

    def get_context_data(self, **kwargs):
        context = super(TrainerSettingView, self).get_context_data(**kwargs)

        return context


class PushSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_push.html'

    def get_context_data(self, **kwargs):
        context = super(PushSettingView, self).get_context_data(**kwargs)

        return context


class ReserveSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_reserve.html'

    def get_context_data(self, **kwargs):
        context = super(ReserveSettingView, self).get_context_data(**kwargs)

        return context


class SalesSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_sales.html'

    def get_context_data(self, **kwargs):
        context = super(SalesSettingView, self).get_context_data(**kwargs)

        return context


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
    class_info= None

    if User.objects.filter(username=phone).exists():
        error = '이미 가입된 회원 입니다.'
    #elif User.objects.filter(email=email).exists():
    #    error = '이미 가입된 회원 입니다.'
    #elif email == '':
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
                                      birthday_dt=birthday_dt, mod_dt=timezone.now(),reg_dt=timezone.now(), user_id=user.id)
                member.save()
                lecture = LectureTb(class_tb_id=class_info.class_id,member_id=member.member_id,
                                    lecture_reg_count=input_counts, lecture_rem_count=input_counts,
                                    lecture_avail_count=input_counts, price=input_price, option_cd='DC', state_cd='IP',
                                    start_date=input_start_date,end_date=input_end_date, mod_dt=now,
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
        log_contents = '<span>' + request.user.first_name + ' 강사님께서 '\
                       + name + ' 회원님의</span> 정보를 <span class="status">등록</span>했습니다.'
        log_data = LogTb(external_id=request.user.id, log_type='LB01', contents=log_contents, reg_dt=timezone.now(),use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)

        return redirect(next_page)


# 회원수정 api
@csrf_exempt
def update_member_info_logic(request):
    member_id = request.POST.get('id')
    email = request.POST.get('email')
    name = request.POST.get('name')
    phone = request.POST.get('phone')
    contents = request.POST.get('contents')
    sex = request.POST.get('sex')
    birthday_dt = request.POST.get('birthday')
    next_page = request.POST.get('next_page')

    error = None

    if member_id == '':
        error = '회원 ID를 확인해 주세요.1'

    if name == '':
        error = '이름을 입력해 주세요.'
    elif phone == '':
        error = '연락처를 입력해 주세요.'
    elif len(phone) != 11 and len(phone) != 10:
        error = '연락처를 확인해 주세요.'
    elif not phone.isdigit():
        error = '연락처를 확인해 주세요.'

    if error is None:
        try:
            user = User.objects.get(username=member_id, is_active=1)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.2'

        try:
            member = MemberTb.objects.get(user_id=user.id, use=1)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.3'

    if error is None:
        try:
            with transaction.atomic():
                user.first_name = name
                user.email = email
                user.save()
                member.name = name
                member.phone = phone
                member.contents = contents
                member.sex = sex

                if birthday_dt != '':
                    member.birthday_dt = birthday_dt
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

        log_contents = '<span>' + request.user.first_name + ' 강사님께서 ' \
                       + name + ' 회원님의</span> 정보를 <span class="status">수정</span>했습니다.'
        log_data = LogTb(external_id=request.user.id, log_type='LB03', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()

        return redirect(next_page)
    else:
        messages.info(request, error)

        return redirect(next_page)


# 회원가입 api
@csrf_exempt
def delete_member_info_logic(request):
    member_id = request.POST.get('id')
    next_page = request.POST.get('next_page')

    error = None

    if member_id == '':
        error = '회원 ID를 확인해 주세요.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(member_id=request.user.id)
        except ObjectDoesNotExist:
            error = '강사 강좌 정보가 없습니다.'

    if error is None:

        try:
            user = User.objects.get(username=member_id, is_active=1)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

        try:
            member = MemberTb.objects.get(user_id=user.id, use=1)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

        lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                member_id=user.id, use=1)

    if error is None:
        try:
            with transaction.atomic():
                #user.is_active = 0
                #user.save()
                #member.use = 0
                #member.mod_dt = timezone.now()
                #member.save()
                for lecture_info in lecture_data:
                    schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                              lecture_tb_id=lecture_info.lecture_id,
                                                              state_cd='NP')
                    schedule_data.delete()
                    lecture_info.state_cd = 'CC'
                    lecture_info.use = 0
                    lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
                    lecture_info.mod_dt = timezone.now()
                    lecture_info.save()

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

        log_contents = '<span>' + request.user.first_name + ' 강사님께서 ' \
                       + member.name + ' 회원님의</span> 수강정보를 <span class="status">삭제</span>했습니다.'
        log_data = LogTb(external_id=request.user.id, log_type='LB02', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()

        return redirect(next_page)
    else:
        messages.info(request, error)

        return redirect(next_page)


# log 삭제
@csrf_exempt
def alarm_delete_logic(request):
    log_size = request.POST.get('log_id_size')
    delete_log_id = request.POST.getlist('log_id_array[]')
    next_page = request.POST.get('next_page')

    error = None
    if log_size == '0':
        error = '로그가 없습니다.'

    if error is None:

        for i in range(0, int(log_size)):
            try:
                log_info = LogTb.objects.get(log_id=delete_log_id[i])
            except ObjectDoesNotExist:
                error = 'log가 존재하지 않습니다'
            if error is None:
                log_info.use = 0
                log_info.mod_dt = timezone.now()
                log_info.save()

        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)
