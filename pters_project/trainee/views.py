import datetime

import logging
from django.contrib import messages
from django.contrib.auth import SESSION_KEY
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import InternalError
from django.db import transaction
from django.db import IntegrityError
from django.db.models import Q
from django.shortcuts import redirect, render

# Create your views here.
from configs import settings
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import RedirectView
from django.views.generic import TemplateView
from django.views.generic.base import ContextMixin
from el_pagination.views import AjaxListView

from configs.views import date_check_func, AccessTestMixin
from login.models import MemberTb, LogTb, HolidayTb, CommonCdTb, PushInfoTb
from schedule.functions import func_send_push_trainee, func_get_lecture_id, func_get_group_lecture_id, \
    func_check_group_available_member_before, func_check_group_available_member_after, func_add_schedule, \
    func_date_check, func_refresh_lecture_count
from schedule.models import LectureTb, MemberLectureTb, ClassLectureTb, MemberClassTb, GroupTb, GroupLectureTb
from schedule.models import ClassTb
from schedule.models import ScheduleTb, DeleteScheduleTb, RepeatScheduleTb, SettingTb

from django.utils import timezone

from trainee.function import func_get_trainee_schedule_data, func_get_class_lecture_count, func_get_lecture_list, \
    func_get_class_list

logger = logging.getLogger(__name__)


class IndexView(LoginRequiredMixin, AccessTestMixin, RedirectView):
    url = '/trainee/cal_month/'

    def get(self, request, **kwargs):

        lecture_data = MemberLectureTb.objects.filter(member_id=self.request.user.id, use=1).exclude(auth_cd='DELETE').order_by('-lecture_tb__start_date')

        class_counter = 0
        class_data = None
        error = None

        if len(lecture_data) > 0:
            for idx, lecture_info in enumerate(lecture_data):
                if idx == 0:
                    class_data = ClassLectureTb.objects.filter(lecture_tb=lecture_info.lecture_tb,
                                                               use=1).order_by('-lecture_tb__start_date')
                else:
                    class_data |= ClassLectureTb.objects.filter(lecture_tb=lecture_info.lecture_tb,
                                                                use=1).order_by('-lecture_tb__start_date')

        if class_data is None or len(class_data) == 0:
            self.url = '/trainee/cal_month_blank/'
        elif len(class_data) == 1:
            for lecture_info_data in class_data:
                lecture_info = lecture_info_data.lecture_tb
                self.request.session['class_id'] = lecture_info_data.class_tb_id
                self.request.session['lecture_id'] = lecture_info.lecture_id
                lecture_auth_info = None
                try:
                    lecture_auth_info = MemberLectureTb.objects.get(member_id=self.request.user.id,
                                                                    lecture_tb=lecture_info.lecture_id)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'

                if lecture_auth_info is not None:
                    if lecture_auth_info.auth_cd == 'WAIT':
                        self.url = '/trainee/lecture_select/'
                    elif lecture_auth_info.auth_cd == 'DELETE':
                        self.url = '/trainee/cal_month_blank/'
                    else:
                        class_type_name = ''
                        class_name = None

                        self.request.session['class_hour'] = lecture_info_data.class_tb.class_hour
                        try:
                            class_name = CommonCdTb.objects.get(common_cd=lecture_info_data.class_tb.subject_cd)
                        except ObjectDoesNotExist:
                            error = '강좌 정보를 불러오지 못했습니다.'
                        if error is None:
                            if lecture_info_data.class_tb.subject_detail_nm is None or lecture_info_data.class_tb.subject_detail_nm == '':
                                class_type_name = class_name.common_cd_nm
                            else:
                                class_type_name = lecture_info_data.class_tb.subject_detail_nm
                        if error is None:
                            self.request.session['class_type_name'] = class_type_name
                        else:
                            self.request.session['class_type_name'] = ''

                        if error is None:
                            if lecture_info_data.class_tb.center_tb is None or lecture_info_data.class_tb.center_tb == '':
                                self.request.session['class_center_name'] = ''
                            else:
                                self.request.session['class_center_name'] = lecture_info_data.class_tb.center_tb.center_name
                else:
                    self.url = '/trainee/cal_month_blank/'

        else:
            class_id_comp = ''
            lecture_np_counter = 0
            lecture_id_select = ''
            for lecture_info_data in class_data:
                lecture_info = lecture_info_data.lecture_tb
                lecture_auth_info = None
                try:
                    lecture_auth_info = MemberLectureTb.objects.get(member_id=self.request.user.id, lecture_tb=lecture_info.lecture_id)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'
                if lecture_auth_info is not None:
                    if lecture_auth_info.auth_cd == 'WAIT':
                        lecture_np_counter += 1
                if class_id_comp != lecture_info_data.class_tb_id:
                    class_id_comp = lecture_info_data.class_tb_id
                    if lecture_info.lecture_avail_count > 0:
                        lecture_id_select = lecture_info.lecture_id

                    class_counter += 1

            if class_counter > 1:
                self.url = '/trainee/lecture_select/'
            else:
                self.request.session['class_id'] = class_id_comp
                self.request.session['lecture_id'] = lecture_id_select
                if lecture_np_counter > 0:
                    self.url = '/trainee/lecture_select/'
                else:
                    self.url = '/trainee/cal_month/'
                    class_type_name = ''
                    class_name = None
                    class_info = None

                    try:
                        class_info = ClassTb.objects.get(class_id=class_id_comp)
                    except ObjectDoesNotExist:
                        error = '강좌 정보를 불러오지 못했습니다.'
                    if error is None:
                        self.request.session['class_hour'] = class_info.class_hour

                    if error is None:
                        try:
                            class_name = CommonCdTb.objects.get(common_cd=class_info.subject_cd)
                        except ObjectDoesNotExist:
                            error = '강좌 정보를 불러오지 못했습니다.'
                    if error is None:
                        if class_info.subject_detail_nm is None or class_info.subject_detail_nm == '':
                            class_type_name = class_name.common_cd_nm
                        else:
                            class_type_name = class_info.subject_detail_nm

                    if error is None:
                        self.request.session['class_type_name'] = class_type_name
                    else:
                        self.request.session['class_type_name'] = ''

                    if error is None:
                        if class_info.center_tb is None or class_info.center_tb == '':
                            self.request.session['class_center_name'] = ''
                        else:
                            self.request.session['class_center_name'] = class_info.center_tb.center_name

        return super(IndexView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(IndexView, self).get_redirect_url(*args, **kwargs)


class CalMonthBlankView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_month_trainee_blank.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthBlankView, self).get_context_data(**kwargs)
        context = get_trainee_setting_data(context, self.request.user.id)
        holiday = HolidayTb.objects.filter(use=1)
        self.request.session['setting_language'] = context['lt_lan_01']
        context['holiday'] = holiday
        return context


class LectureSelectView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainee_lecture_select.html'

    def get_context_data(self, **kwargs):
        context = super(LectureSelectView, self).get_context_data(**kwargs)
        return context


class GetTraineeClassListView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_class_list_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetTraineeClassListView, self).get_context_data(**kwargs)

        context['error'] = None
        context = func_get_class_list(context, self.request.user.id)
        if context['error'] is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+context['error'])
            messages.error(self.request, context['error'])

        return context


@method_decorator(csrf_exempt, name='dispatch')
class GetTraineeLectureListView(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'ajax/trainee_lecture_list_ajax.html'

    def get(self, request, *args, **kwargs):
        context = super(GetTraineeLectureListView, self).get_context_data(**kwargs)
        class_id = request.GET.get('class_id', '')
        auth_cd = request.GET.get('auth_cd', '')
        context['error'] = None
        context = func_get_lecture_list(context, class_id, request.user.id, auth_cd)

        if context['error'] is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+context['error'])
            messages.error(self.request, context['error'])

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        context = super(GetTraineeLectureListView, self).get_context_data(**kwargs)
        class_id = request.POST.get('class_id', '')
        auth_cd = request.POST.get('auth_cd', '')

        context['error'] = None
        context = func_get_lecture_list(context, class_id, request.user.id, auth_cd)

        if context['error'] is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+context['error'])
            messages.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+self.request, context['error'])

        return render(request, self.template_name, context)


def lecture_processing(request):

    lecture_id = request.POST.get('lecture_id', '')
    class_id = request.POST.get('class_id', '')
    check = request.POST.get('check', '')
    next_page = request.POST.get('next_page')

    error = None
    lecture_info = None
    if lecture_id == '':
        error = '수강정보를 선택해 주세요.'

    if check == '':
        error = '수강정보를 선택해 주세요.'

    if error is None:
        try:
            lecture_info = MemberLectureTb.objects.get(member=request.user.id, lecture_tb=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        if check == '1':
            lecture_info.auth_cd = 'DELETE'
            lecture_info.save()
        elif check == '0':
            request.session['class_id'] = class_id
            request.session['lecture_id'] = lecture_id
            class_type_name = ''
            class_name = None
            class_info = None
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '강좌 정보를 불러오지 못했습니다.'

            if error is None:
                try:
                    class_name = CommonCdTb.objects.get(common_cd=class_info.subject_cd)
                except ObjectDoesNotExist:
                    error = '강좌 과목 정보를 불러오지 못했습니다.'
            if error is None:
                request.session['class_hour'] = class_info.class_hour

                if class_info.subject_detail_nm is None or class_info.subject_detail_nm == '':
                    class_type_name = class_name.common_cd_nm
                else:
                    class_type_name = class_info.subject_detail_nm

            if error is None:
                request.session['class_type_name'] = class_type_name
            else:
                request.session['class_type_name'] = ''

            if error is None:
                if class_info.center_tb is None or class_info.center_tb == '':
                    request.session['class_center_name'] = ''
                else:
                    request.session['class_center_name'] = class_info.center_tb.center_name
            lecture_info.auth_cd = 'VIEW'
            lecture_info.save()
        elif check == '2':
            request.session['class_id'] = class_id
            request.session['lecture_id'] = lecture_id
            class_type_name = ''
            class_name = None
            class_info = None

            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '강좌 정보를 불러오지 못했습니다.'

            if error is None:
                try:
                    class_name = CommonCdTb.objects.get(common_cd=class_info.subject_cd)
                except ObjectDoesNotExist:
                    error = '강좌 과목 정보를 불러오지 못했습니다.'

            if error is None:
                request.session['class_hour'] = class_info.class_hour

            if error is None:
                if class_info.subject_detail_nm is None or class_info.subject_detail_nm == '':
                    class_type_name = class_name.common_cd_nm
                else:
                    class_type_name = class_info.subject_detail_nm

            if error is None:
                request.session['class_type_name'] = class_type_name
            else:
                request.session['class_type_name'] = ''

            if error is None:
                if class_info.center_tb is None or class_info.center_tb == '':
                    request.session['class_center_name'] = ''
                else:
                    request.session['class_center_name'] = class_info.center_tb.center_name

    if error is None:

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
    return redirect(next_page)


class CalMonthView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_month_trainee.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthView, self).get_context_data(**kwargs)
        error = None
        class_id = self.request.session.get('class_id', '')
        class_info = None

        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

        today = datetime.date.today()
        start_date = today - datetime.timedelta(days=46)
        end_date = today + datetime.timedelta(days=47)

        if error is None:
            context = func_get_trainee_schedule_data(context, self.request.user.id, class_id, start_date, end_date)

            # 회원 setting 값 로드
            context = get_trainee_setting_data(context, self.request.user.id)
            self.request.session['setting_language'] = context['lt_lan_01']
            self.request.session['class_hour'] = class_info.class_hour

        # 강사 setting 값 로드
        if error is None:
            context = get_trainer_setting_data(context, class_info.member_id, class_id)

        return context


class MyPageView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'mypage_trainee.html'

    def get_context_data(self, **kwargs):
        context = super(MyPageView, self).get_context_data(**kwargs)
        error = None
        class_id = self.request.session.get('class_id', '')
        # lecture_id = self.request.session.get('lecture_id', '')

        today = datetime.date.today()
        start_date = today - datetime.timedelta(days=46)
        end_date = today + datetime.timedelta(days=47)

        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'
        if error is None:
            try:
                member_info = MemberTb.objects.get(member_id=self.request.user.id)
                context['member_info'] = member_info
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'

        #    error = '수강정보를 확인해 주세요.'
        if error is None:
            context = get_trainee_schedule_data_by_class_id_func(context, self.request.user.id,
                                                                 self.request.user.last_name + self.request.user.first_name, class_id, start_date, end_date)

            # 강사 setting 값 로드
            context = get_trainee_setting_data(context, self.request.user.id)
            self.request.session['setting_language'] = context['lt_lan_01']

        # 강사 setting 값 로드
        if error is None:
            context = get_trainer_setting_data(context, class_info.member_id, class_id)

        return context


class MyPageViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/mypage_trainee_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(MyPageViewAjax, self).get_context_data(**kwargs)
        error = None
        class_id = self.request.session.get('class_id', '')
        # lecture_id = self.request.session.get('lecture_id', '')

        today = datetime.date.today()
        start_date = today - datetime.timedelta(days=46)
        end_date = today + datetime.timedelta(days=47)

        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                member_info = MemberTb.objects.get(member_id=self.request.user.id)
                context['member_info'] = member_info
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'

        # if lecture_id is None or lecture_id == '':
        #    error = '수강정보를 확인해 주세요.'

        if error is None:
            context = get_trainee_schedule_data_by_class_id_func(context, self.request.user.id,
                                                                 self.request.user.last_name + self.request.user.first_name, class_id, start_date, end_date)

            # 강사 setting 값 로드
            context = get_trainee_setting_data(context, self.request.user.id)
            self.request.session['setting_language'] = context['lt_lan_01']

        # 강사 setting 값 로드
        if error is None:
            context = get_trainer_setting_data(context, class_info.member_id, class_id)

        return context

class MyPageBlankView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'mypage_trainee_blank.html'

    def get_context_data(self, **kwargs):
        context = super(MyPageBlankView, self).get_context_data(**kwargs)
        error = None

        return context


# pt 일정 삭제
def delete_trainee_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')
    class_type_name = request.session.get('class_type_name', '')

    error = None
    lecture_info = None
    class_info = None
    schedule_info = None
    start_date = None
    end_date = None
    today = datetime.datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
    disable_time = timezone.now()
    nowtime = datetime.datetime.strptime(disable_time.strftime('%H:%M'), '%H:%M')
    reserve_avail_date = 14

    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보를 불러오지 못했습니다.'

    if error is None:
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt
        if start_date < timezone.now():  # 강사 설정 시간으로 변경필요
            error = '이미 지난 일정입니다.'

    if error is None:
        if schedule_info.state_cd == 'PE':
            error = '이미 종료된 일정입니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=schedule_info.lecture_tb_id, use=1)
        except ObjectDoesNotExist:
            error = '회원 수강 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        if lecture_info.member_id != str(request.user.id):
            error = '회원 정보가 일치하지 않습니다.'

    if error is None:
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_info.class_id,
                                                      setting_type_cd='LT_RES_01', use=1)
            lt_res_01 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_01 = '00:00-23:59'
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_info.class_id,
                                                      setting_type_cd='LT_RES_02', use=1)
            lt_res_02 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_02 = '0'
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_info.class_id,
                                                      setting_type_cd='LT_RES_03', use=1)
            lt_res_03 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_03 = '0'

        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_info.class_id,
                                                      setting_type_cd='LT_RES_04', use=1)
            lt_res_04 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_04 = '00:00-23:59'

        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_info.class_id,
                                                      setting_type_cd='LT_RES_05', use=1)
            lt_res_05 = int(setting_data_info.setting_info)
        except ObjectDoesNotExist:
            lt_res_05 = 14

        reserve_avail_start_time = datetime.datetime.strptime(lt_res_01.split('-')[0], '%H:%M')
        reserve_avail_end_time = datetime.datetime.strptime(lt_res_01.split('-')[1], '%H:%M')
        reserve_avail_date = lt_res_05
        reserve_prohibition_time = lt_res_02
        reserve_stop = lt_res_03

        if reserve_prohibition_time != '':
            disable_time = disable_time + datetime.timedelta(hours=int(reserve_prohibition_time))

        if nowtime < reserve_avail_start_time:
            error = '현재는 삭제할수 없는 시간입니다.'
        if nowtime > reserve_avail_end_time:
            error = '현재는 삭제할수 없는 시간입니다.'
        if reserve_stop == '1':
            error = '강사 설정에 의해 현재 예약이 일시 정지 되어있습니다.'

    avail_end_date = today + datetime.timedelta(days=reserve_avail_date)

    if error is None:
        if lecture_info.member_id != str(request.user.id):
            error = '회원 정보가 일치하지 않습니다.'

    if error is None:
        if start_date >= avail_end_date:
            error = '삭제할 수 없는 날짜입니다.'

    if error is None:
        if start_date < disable_time:
            error = '삭제할 수 없는 일정입니다.'
    if error is None:
        try:
            with transaction.atomic():

                delete_schedule = DeleteScheduleTb(schedule_id=schedule_info.schedule_id,
                                                   class_tb_id=schedule_info.class_tb_id,
                                                   lecture_tb_id=schedule_info.lecture_tb_id,
                                                   delete_repeat_schedule_tb=schedule_info.repeat_schedule_tb_id,
                                                   start_dt=schedule_info.start_dt, end_dt=schedule_info.end_dt,
                                                   permission_state_cd=schedule_info.permission_state_cd,
                                                   state_cd=schedule_info.state_cd, en_dis_type=schedule_info.en_dis_type,
                                                   note=schedule_info.note, member_note=schedule_info.member_note,
                                                   reg_member_id=schedule_info.reg_member_id,
                                                   del_member_id=request.user.id,
                                                   reg_dt=schedule_info.reg_dt, mod_dt=timezone.now(), use=0)

                delete_schedule.save()
                schedule_info.delete()

                lecture_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=schedule_info.lecture_tb_id)
                if lecture_info.lecture_reg_count >= len(lecture_schedule_data):
                    lecture_info.lecture_avail_count = lecture_info.lecture_reg_count \
                                                              - len(lecture_schedule_data)
                else:
                    error = '예약 가능한 횟수를 확인해주세요.'
                    raise ValidationError()

                #진행 완료된 일정을 삭제하는경우 예약가능 횟수 및 남은 횟수 증가
                if schedule_info.state_cd == 'PE':
                    lecture_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=schedule_info.lecture_tb_id,
                                                                      state_cd='PE')
                    if lecture_info.lecture_reg_count >= len(lecture_schedule_data):
                        lecture_info.lecture_rem_count = lecture_info.lecture_reg_count \
                                                           - len(lecture_schedule_data)

                    else:
                        error = '예약 가능한 횟수를 확인해주세요.'
                        raise ValidationError()

                lecture_info.mod_dt = timezone.now()
                lecture_info.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값의 형태에 문제가 있습니다.'
        except IntegrityError:
            error = '이미 삭제된 일정입니다.'
        except InternalError:
            error = '이미 삭제된 일정입니다.'
        except ValidationError as e:
            error = '예약 가능한 횟수를 확인해주세요.'

    # print(error)
    if error is None:
        member_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                            lecture_tb__state_cd='IP',
                                                            auth_cd='VIEW', lecture_tb__use=1, use=1)
        # member_lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id, state_cd='IP', use=1)
        for member_lecture_data_info in member_lecture_data:
            member_lecture_info = member_lecture_data_info.lecture_tb
            member_lecture_info.schedule_check = 1
            member_lecture_info.save()
        class_info.schedule_check = 1
        class_info.save()

        # log_contents = '<span>' + request.user.first_name \
        #               + ' 회원님께서</span> 일정을 <span class="status">삭제</span>했습니다.@'\
        #               + log_start_date\
        #               + ' - '+log_end_date
        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_info.class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='PT 일정', log_how='삭제', log_detail=str(start_date) + '/' + str(end_date),
                         reg_dt=timezone.now(), use=1)
        log_data.save()

        push_info_schedule_start_date = str(start_date).split(':')
        push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')

        func_send_push_trainee(class_info.class_id, class_type_name + ' 수업 - 일정 알림',
                       request.user.last_name + request.user.first_name + '님이 ' \
                       + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1] \
                       + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1] + ' 일정을 취소했습니다.')
        # request.session['push_title'] = class_type_name + ' 수업 - 일정 알림'
        # request.session['push_info'] = request.user.last_name+request.user.first_name+'님이 '\
        #                               + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]\
        #                               + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1] + ' 일정을 취소했습니다'
        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        next_page = 'trainee:cal_month'
        return redirect(next_page)


# pt 일정 추가
def add_trainee_schedule_logic(request):
    class_id = request.POST.get('class_id', '')
    # lecture_id = request.POST.get('lecture_id', '')
    group_schedule_id = request.POST.get('group_schedule_id', None)
    training_date = request.POST.get('training_date', '')
    time_duration = request.POST.get('time_duration', '')
    training_time = request.POST.get('training_time', '')
    next_page = request.POST.get('next_page')
    class_type_name = request.session.get('class_type_name', '')

    error = None
    lecture_info = None
    class_info = None
    start_date = None
    end_date = None
    group_id = None
    today = datetime.datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
    disable_time = timezone.now()
    nowtime = datetime.datetime.strptime(disable_time.strftime('%H:%M'), '%H:%M')
    reserve_avail_date = 14
    if class_id is None or class_id == '':
        error = '강좌 정보를 불러오지 못했습니다.'
    if training_date == '':
        error = '날짜를 선택해 주세요.'
    elif time_duration == '':
        error = '진행 시간을 선택해 주세요.'
    elif training_time == '':
        error = '시작 시간을 선택해 주세요.'

    # if error is None:
    #    if int(time_duration) > 1:
    #        error = '진행 시간은 1시간만 선택 가능합니다.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        time_duration_temp = class_info.class_hour*int(time_duration)
        start_date = datetime.datetime.strptime(training_date+' '+training_time, '%Y-%m-%d %H:%M:%S.%f')
        end_date = start_date + datetime.timedelta(minutes=int(time_duration_temp))

    if error is None:
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id, setting_type_cd='LT_RES_01', use=1)
            lt_res_01 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_01 = '00:00-23:59'

        reserve_avail_start_time = datetime.datetime.strptime(lt_res_01.split('-')[0], '%H:%M')
        reserve_avail_end_time = datetime.datetime.strptime(lt_res_01.split('-')[1], '%H:%M')
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id, setting_type_cd='LT_RES_02', use=1)
            lt_res_02 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_02 = '0'
        reserve_prohibition_time = lt_res_02
        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id, setting_type_cd='LT_RES_03', use=1)
            lt_res_03 = setting_data_info.setting_info
        except ObjectDoesNotExist:
            lt_res_03 = '0'

        try:
            setting_data_info = SettingTb.objects.get(member_id=class_info.member_id, class_tb_id=class_id, setting_type_cd='LT_RES_05', use=1)
            lt_res_05 = int(setting_data_info.setting_info)
        except ObjectDoesNotExist:
            lt_res_05 = 14
        reserve_stop = lt_res_03
        reserve_avail_date = lt_res_05

        if reserve_prohibition_time != '':
            if int(reserve_prohibition_time) >= 24:
                reserve_prohibition_time = '0'
            disable_time = disable_time + datetime.timedelta(hours=int(reserve_prohibition_time))

        if reserve_stop == '1':
            error = '강사 설정에 의해 현재 예약이 일시 정지 되어있습니다.'

        if error is None:
            if nowtime < reserve_avail_start_time:
                error = '현재는 입력할수 없는 시간입니다.'
            if nowtime > reserve_avail_end_time:
                error = '현재는 입력할수 없는 시간입니다.'

    avail_end_date = today + datetime.timedelta(days=reserve_avail_date)

    if error is None:
        if start_date >= avail_end_date:
            error = '입력할 수 없는 날짜입니다.'
    if error is None:
        if start_date < disable_time:
            error = '입력할 수 없는 일정입니다.'

    if error is None:
        # lecture_id = get_trainee_schedule_input_lecture(class_id, request.user.id)
        if group_schedule_id == '' or group_schedule_id is None:
            lecture_id = func_get_lecture_id(class_id, request.user.id)
        # 그룹 Lecture Id 조회
        else:
            try:
                group_schedule_info = ScheduleTb.objects.get(schedule_id=group_schedule_id)
            except ObjectDoesNotExist:
                group_schedule_info = None
            if group_schedule_info is not None:
                group_schedule_data = ScheduleTb.objects.filter(group_tb_id=group_schedule_info.group_tb_id,
                                                                group_schedule_id=group_schedule_id,
                                                                lecture_tb__member_id=request.user.id)
                if len(group_schedule_data) == 0:
                    lecture_id = func_get_group_lecture_id(group_schedule_info.group_tb_id, request.user.id)
                else:
                    lecture_id = None
                    error = '이미 그룹 일정에 포함되어있습니다.'

    if error is None:
        if lecture_id is None:
            error = '등록할수 있는 일정이 없습니다.'

    if error is None:
        error = pt_add_logic_func(training_date, time_duration, training_time, request.user.id, lecture_id, class_id, request, group_schedule_id)

    if error is not None:
        if '-' in error:
            error += ' 일정이 중복되었습니다. '
    # print(error)
    if error is None:
        member_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                            lecture_tb__state_cd='IP',
                                                            auth_cd='VIEW', lecture_tb__use=1, use=1)
        for member_lecture_data_info in member_lecture_data:
            member_lecture_info = member_lecture_data_info.lecture_tb
            member_lecture_info.schedule_check = 1
            member_lecture_info.save()
        class_info.schedule_check = 1
        class_info.save()

        push_info_schedule_start_date = str(start_date).split(':')
        push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')

        if group_schedule_id == '' or group_schedule_id is None:
            func_send_push_trainee(class_info.class_id, class_type_name + ' 수업 - 일정 알림',
                           request.user.last_name + request.user.first_name + '님이 ' \
                           + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1] \
                           + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1] + ' 일정을 등록했습니다')
        else:
            func_send_push_trainee(class_info.class_id, class_type_name + ' 수업 - 일정 알림',
                           request.user.last_name + request.user.first_name + '님이 ' \
                           + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1] \
                           + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1] + ' 그룹 일정을 등록했습니다')

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


def pt_add_logic_func(pt_schedule_date, pt_schedule_time_duration, pt_schedule_time, user_id,
                      lecture_id, class_id, request, group_schedule_id):

    error = None
    lecture_info = None
    class_info = None
    today = datetime.datetime.today()
    fifteen_days_after = today + datetime.timedelta(days=15)
    group_schedule_info = None
    group_id = None
    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'
    elif pt_schedule_date == '':
        error = '날짜를 선택해 주세요.'
    elif pt_schedule_time_duration == '':
        error = '진행 시간을 선택해 주세요.'
    elif pt_schedule_time == '':
        error = '시작 시간을 선택해 주세요.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        if group_schedule_id is not None and group_schedule_id != '':
            try:
                group_schedule_info = ScheduleTb.objects.get(schedule_id=group_schedule_id)
                group_id = group_schedule_info.group_tb_id
            except ObjectDoesNotExist:
                error = '그룹 일정 정보를 불러오지 못했습니다.'
        else:
            group_schedule_id = None

    if error is None:
        time_duration_temp = class_info.class_hour*int(pt_schedule_time_duration)
        start_date = datetime.datetime.strptime(pt_schedule_date+' '+pt_schedule_time, '%Y-%m-%d %H:%M:%S.%f')
        end_date = start_date + datetime.timedelta(minutes=int(time_duration_temp))

        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id, use=1)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'
        except ValueError:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        if lecture_info.state_cd != 'IP':
            error = '등록할수 있는 수강 정보가 없습니다.'

    if error is None:
        if start_date >= fifteen_days_after:
            error = '입력할 수 없는 날짜입니다.'

    if error is None:
        if start_date < timezone.now():
            error = '입력할 수 없는 날짜입니다.'

    if error is None:
        if lecture_info.member_id != str(user_id):
            error = '회원 정보가 일치하지 않습니다.'

    if error is None:
        if lecture_info.lecture_avail_count == 0:
            error = '예약 가능한 횟수가 없습니다'

    if error is None:
        if group_schedule_info is not None and group_schedule_info != '':
            error = func_check_group_available_member_before(class_id, group_schedule_info.group_tb_id, group_schedule_id)

    if error is None:
        try:
            with transaction.atomic():
                schedule_result = func_add_schedule(class_id, lecture_id, None,
                                                    group_id, group_schedule_id,
                                                    start_date, end_date, '', '1', request.user.id)
                error = schedule_result['error']

                if error is None:
                    error = func_refresh_lecture_count(lecture_id)

                if error is None:
                    if group_schedule_info is not None and group_schedule_info != '':
                        error = func_check_group_available_member_after(class_id, group_id, group_schedule_id)
                    else:
                        error = func_date_check(class_id, schedule_result['schedule_id'],
                                                pt_schedule_date, start_date, end_date)

                        if error is not None:
                            error += ' 일정이 중복되었습니다.'

                if error is not None:
                    raise InternalError()

        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '날짜가 중복됐습니다.'
        except InternalError:
            error = '예약 가능한 횟수를 확인해주세요.'
        except ValidationError:
            error = '예약 가능한 횟수를 확인해주세요.'

    if error is None:
        if group_schedule_id is not None and group_schedule_id != '':
            log_data = LogTb(log_type='LS01', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             class_tb_id=class_id,
                             lecture_tb_id=lecture_id,
                             log_info=group_schedule_info.group_tb.name + ' 레슨 일정', log_how='등록',
                             log_detail=str(start_date) + '/' + str(end_date),
                             reg_dt=timezone.now(), use=1)
            log_data.save()
        else:
            log_data = LogTb(log_type='LS01', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                             class_tb_id=class_id, lecture_tb_id=lecture_id,
                             log_info='1:1 레슨 일정', log_how='등록', log_detail=str(start_date) + '/' + str(end_date),
                             reg_dt=timezone.now(), use=1)
            log_data.save()

    else:
        return error


def get_trainee_repeat_schedule_data_func(context, class_id, member_id):

    error = None
    class_info = None

    pt_repeat_schedule_id = []
    pt_repeat_schedule_type = []
    pt_repeat_schedule_week_info = []
    pt_repeat_schedule_start_date = []
    pt_repeat_schedule_end_date = []
    pt_repeat_schedule_start_time = []
    pt_repeat_schedule_time_duration = []
    pt_repeat_schedule_state_cd = []
    pt_repeat_schedule_state_cd_nm = []
    pt_repeat_schedule_group_data = []
    lecture_list = None

    # 강좌 정보 가져오기
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강좌 정보를 불러오지 못했습니다.'

    # 수강 정보 불러 오기
    if error is None:
        if member_id is None or member_id == '':
            lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                         lecture_tb__use='1', use=1)
        else:
            lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                         lecture_tb__member_id=member_id,
                                                         lecture_tb__use='1', use=1)

    if error is None:
        # 강사 클래스의 반복일정 불러오기
        pt_repeat_schedule_data = RepeatScheduleTb

        if len(lecture_list) > 0:
            for idx, lecture_list_info in enumerate(lecture_list):
                lecture_info = lecture_list_info.lecture_tb
                if idx == 0:
                    pt_repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                              en_dis_type='1')
                else:
                    pt_repeat_schedule_data |= RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                               en_dis_type='1')
            for pt_repeat_schedule_info in pt_repeat_schedule_data:
                pt_repeat_schedule_id.append(pt_repeat_schedule_info.repeat_schedule_id)
                pt_repeat_schedule_type.append(pt_repeat_schedule_info.repeat_type_cd)
                pt_repeat_schedule_week_info.append(pt_repeat_schedule_info.week_info)
                pt_repeat_schedule_start_date.append(str(pt_repeat_schedule_info.start_date))
                pt_repeat_schedule_end_date.append(str(pt_repeat_schedule_info.end_date))
                pt_repeat_schedule_start_time.append(pt_repeat_schedule_info.start_time)
                pt_repeat_schedule_time_duration.append(pt_repeat_schedule_info.time_duration)
                pt_repeat_schedule_state_cd.append(pt_repeat_schedule_info.state_cd)
                pt_repeat_schedule_group_data.append(pt_repeat_schedule_info.group_tb)

                try:
                    state_cd_name = CommonCdTb.objects.get(common_cd=pt_repeat_schedule_info.state_cd)
                except ObjectDoesNotExist:
                    error = '반복일정의 상태를 불러오지 못했습니다.'
                if error is None:
                    pt_repeat_schedule_state_cd_nm.append(state_cd_name.common_cd_nm)

    context['pt_repeat_schedule_id_data'] = pt_repeat_schedule_id
    context['pt_repeat_schedule_type_data'] = pt_repeat_schedule_type
    context['pt_repeat_schedule_week_info_data'] = pt_repeat_schedule_week_info
    context['pt_repeat_schedule_start_date_data'] = pt_repeat_schedule_start_date
    context['pt_repeat_schedule_end_date_data'] = pt_repeat_schedule_end_date
    context['pt_repeat_schedule_start_time_data'] = pt_repeat_schedule_start_time
    context['pt_repeat_schedule_time_duration_data'] = pt_repeat_schedule_time_duration
    context['pt_repeat_schedule_state_cd'] = pt_repeat_schedule_state_cd
    context['pt_repeat_schedule_state_cd_nm'] = pt_repeat_schedule_state_cd_nm
    context['pt_repeat_schedule_group_data'] = pt_repeat_schedule_group_data
    if error is None:
        context['error'] = error

    return context


def get_trainee_repeat_schedule_data_func_from_schedule(context, class_id, member_id):

    error = None
    class_info = None

    pt_repeat_schedule_id = []
    pt_repeat_schedule_type = []
    pt_repeat_schedule_week_info = []
    pt_repeat_schedule_start_date = []
    pt_repeat_schedule_end_date = []
    pt_repeat_schedule_start_time = []
    pt_repeat_schedule_time_duration = []
    pt_repeat_schedule_state_cd = []
    pt_repeat_schedule_state_cd_nm = []
    lecture_list = None

    # 강좌 정보 가져오기
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강좌 정보를 불러오지 못했습니다.'

    # 수강 정보 불러 오기
    if error is None:
        if member_id is None or member_id == '':
            lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                         lecture_tb__use='1', use=1)
            # lecture_list = LectureTb.objects.filter(class_tb_id=class_info.class_id, state_cd='IP', use=1)
            # lecture_list.filter(state_cd='IP')
            # lecture_list.filter(state_cd='NP')
            # lecture_list = lecture_list.filter()
        else:
            lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                         lecture_tb__member_id=member_id,
                                                         lecture_tb__use='1', use=1)
            # lecture_list = LectureTb.objects.filter(class_tb_id=class_info.class_id, state_cd='IP', member_id=member_id, use=1)
            # lecture_list.filter(state_cd='IP')
            # lecture_list.filter(state_cd='NP')
            # lecture_list = lecture_list.filter()

    if error is None:
        # 강사 클래스의 반복일정 불러오기
        pt_repeat_schedule_data = RepeatScheduleTb

        if len(lecture_list) > 0:
            for idx, lecture_list_info in enumerate(lecture_list):
                lecture_info = lecture_list_info.lecture_tb
                if idx == 0:
                    pt_repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                              en_dis_type='1').exclude(state_cd='PE')
                else:
                    pt_repeat_schedule_data |= RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                               en_dis_type='1').exclude(state_cd='PE')
            for pt_repeat_schedule_info in pt_repeat_schedule_data:
                pt_repeat_schedule_id.append(pt_repeat_schedule_info.repeat_schedule_id)
                pt_repeat_schedule_type.append(pt_repeat_schedule_info.repeat_type_cd)
                pt_repeat_schedule_week_info.append(pt_repeat_schedule_info.week_info)
                pt_repeat_schedule_start_date.append(str(pt_repeat_schedule_info.start_date))
                pt_repeat_schedule_end_date.append(str(pt_repeat_schedule_info.end_date))
                pt_repeat_schedule_start_time.append(pt_repeat_schedule_info.start_time)
                pt_repeat_schedule_time_duration.append(pt_repeat_schedule_info.time_duration)
                pt_repeat_schedule_state_cd.append(pt_repeat_schedule_info.state_cd)
                try:
                    state_cd_name = CommonCdTb.objects.get(common_cd=pt_repeat_schedule_info.state_cd)
                except ObjectDoesNotExist:
                    error = '반복일정의 상태를 불러오지 못했습니다.'
                if error is None:
                    pt_repeat_schedule_state_cd_nm.append(state_cd_name.common_cd_nm)

    context['pt_repeat_schedule_id_data'] = pt_repeat_schedule_id
    context['pt_repeat_schedule_type_data'] = pt_repeat_schedule_type
    context['pt_repeat_schedule_week_info_data'] = pt_repeat_schedule_week_info
    context['pt_repeat_schedule_start_date_data'] = pt_repeat_schedule_start_date
    context['pt_repeat_schedule_end_date_data'] = pt_repeat_schedule_end_date
    context['pt_repeat_schedule_start_time_data'] = pt_repeat_schedule_start_time
    context['pt_repeat_schedule_time_duration_data'] = pt_repeat_schedule_time_duration
    context['pt_repeat_schedule_state_cd'] = pt_repeat_schedule_state_cd
    context['pt_repeat_schedule_state_cd_nm'] = pt_repeat_schedule_state_cd_nm

    if error is None:
        context['error'] = error

    return context


def get_trainer_setting_data(context, user_id, class_id):

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_01')
        lt_res_01 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_01 = '00:00-23:59'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_02')
        lt_res_02 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_02 = '0'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_03')
        lt_res_03 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_03 = '0'
    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_04')
        lt_res_04 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_04 = '00:00-23:59'
    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_05')
        lt_res_05 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_05 = '14'

    context['lt_res_01'] = lt_res_01
    context['lt_res_02'] = lt_res_02
    context['lt_res_03'] = lt_res_03
    context['lt_res_04'] = lt_res_04
    context['lt_res_05'] = lt_res_05
    return context


def get_trainee_setting_data(context, user_id):

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, setting_type_cd='LT_LAN_01')
        lt_lan_01 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_lan_01 = 'KOR'

    context['lt_lan_01'] = lt_lan_01
    return context


@method_decorator(csrf_exempt, name='dispatch')
class GetTraineeScheduleView(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'ajax/trainee_schedule_ajax.html'

    def get(self, request, *args, **kwargs):
        context = super(GetTraineeScheduleView, self).get_context_data(**kwargs)
        date = request.session.get('date', '')
        day = request.session.get('day', '')

        class_id = self.request.session.get('class_id', '')
        today = datetime.date.today()
        if date != '':
            today = datetime.datetime.strptime(date, '%Y-%m-%d')
        if day == '':
            day = 46
        start_date = today - datetime.timedelta(days=int(day))
        end_date = today + datetime.timedelta(days=int(day))

        context = func_get_trainee_schedule_data(context, self.request.user.id, class_id, start_date, end_date)
        context = func_get_class_lecture_count(context, class_id, self.request.user.id)

        if context['error'] is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+context['error'])
            messages.error(self.request, context['error'])

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        context = super(GetTraineeScheduleView, self).get_context_data(**kwargs)
        date = request.POST.get('date', '')
        day = request.POST.get('day', '')
        class_id = self.request.session.get('class_id', '')
        today = datetime.date.today()
        if date != '':
            today = datetime.datetime.strptime(date, '%Y-%m-%d')
        if day == '':
            day = 18
        start_date = today - datetime.timedelta(days=int(day))
        end_date = today + datetime.timedelta(days=int(day)+1)

        context = func_get_trainee_schedule_data(context, self.request.user.id, class_id, start_date, end_date)
        context = func_get_class_lecture_count(context, class_id, self.request.user.id)

        if context['error'] is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+context['error'])
            messages.error(self.request, context['error'])

        return render(request, self.template_name, context)


@method_decorator(csrf_exempt, name='dispatch')
class GetTraineeScheduleHistoryView(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'ajax/trainee_all_schedule_ajax.html'

    def post(self, request, *args, **kwargs):
        context = super(GetTraineeScheduleHistoryView, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        member_id = request.user.id
        context['error'] = None

        if member_id is None or member_id == '':
            context['error'] = '회원 정보를 불러오지 못했습니다.'

        if context['error'] is None:
            context = get_trainee_schedule_data_func(context, class_id, member_id)

        if context['error'] is not None:
            logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+context['error'])
            messages.error(request, context['error'])

        return render(request, self.template_name, context)


def get_trainee_schedule_data_func(context, class_id, member_id):

    error = None
    class_info = None

    pt_schedule_data = None

    lecture_list = None
    pt_schedule_id = []
    pt_schedule_lecture_id = []
    pt_schedule_start_datetime = []
    pt_schedule_end_datetime = []
    pt_schedule_state_cd = []
    pt_schedule_note = []
    pt_schedule_reg_datetime = []
    pt_schedule_mod_datetime = []
    pt_schedule_idx = []

    # 강좌 정보 가져오기
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강좌 정보를 불러오지 못했습니다.'
    # 수강 정보 불러 오기
    if error is None:
        lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                     lecture_tb__member_id=member_id,
                                                     lecture_tb__use='1', use=1)
    if error is None:
        # 강사 클래스의 반복일정 불러오기
        if len(lecture_list) > 0:
            for idx, lecture_list_info in enumerate(lecture_list):
                lecture_info = lecture_list_info.lecture_tb
                try:
                    lecture_info_data = MemberLectureTb.objects.get(auth_cd='VIEW', member_id=member_id,
                                                                    lecture_tb=lecture_info.lecture_id)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'

                if error is None:
                    pt_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                 en_dis_type='1').order_by('start_dt')

                    if pt_schedule_data is not None and len(pt_schedule_data) > 0:
                        idx = 0
                        for pt_schedule_info in pt_schedule_data:
                            idx += 1
                            # lecture schedule id 셋팅
                            pt_schedule_id.append(pt_schedule_info.schedule_id)
                            # lecture schedule 에 해당하는 lecture id 셋팅
                            pt_schedule_lecture_id.append(pt_schedule_info.lecture_tb_id)

                            pt_schedule_start_datetime.append(str(pt_schedule_info.start_dt))
                            pt_schedule_end_datetime.append(str(pt_schedule_info.end_dt))
                            pt_schedule_reg_datetime.append(str(pt_schedule_info.mod_dt))
                            pt_schedule_mod_datetime.append(str(pt_schedule_info.reg_dt))
                            pt_schedule_idx.append(idx)

                            if pt_schedule_info.note is None:
                                pt_schedule_note.append('')
                            else:
                                pt_schedule_note.append(pt_schedule_info.note)
                            # 끝난 스케쥴인지 확인
                            pt_schedule_state_cd.append(str(pt_schedule_info.state_cd))
                else:
                    error = None

    context['pt_schedule_id'] = pt_schedule_id
    context['pt_schedule_lecture_id'] = pt_schedule_lecture_id
    context['pt_schedule_start_datetime'] = pt_schedule_start_datetime
    context['pt_schedule_end_datetime'] = pt_schedule_end_datetime
    context['pt_schedule_reg_datetime'] = pt_schedule_reg_datetime
    context['pt_schedule_mod_datetime'] = pt_schedule_mod_datetime
    context['pt_schedule_state_cd'] = pt_schedule_state_cd
    context['pt_schedule_note'] = pt_schedule_note
    context['pt_schedule_idx'] = pt_schedule_idx

    if error is None:
        context['error'] = error

    return context

def get_trainee_schedule_data_by_class_id_func(context, user_id, user_name, class_id, start_date, end_date):
    error = None

    context['lecture_info'] = None
    context['error'] = None
    off_schedule_start_datetime = []
    off_schedule_end_datetime = []
    pt_schedule_id = []
    pt_schedule_lecture_id = []
    pt_schedule_start_datetime = []
    pt_schedule_end_datetime = []
    pt_schedule_member_name = []
    pt_schedule_finish_check = []
    pt_schedule_note = []
    pt_schedule_idx = []

    pt_repeat_schedule_id = []
    pt_repeat_schedule_type = []
    pt_repeat_schedule_week_info = []
    pt_repeat_schedule_start_date = []
    pt_repeat_schedule_end_date = []
    pt_repeat_schedule_start_time = []
    pt_repeat_schedule_time_duration = []

    lecture_data = None
    class_info = None
    pt_schedule_data = None
    pt_repeat_schedule_data = None
    next_schedule_start_dt = ''
    next_schedule_end_dt = ''
    now = timezone.now()
    lecture_reg_count_sum = 0
    lecture_rem_count_sum = 0
    lecture_avail_count_sum = 0
    pt_start_date = ''
    pt_end_date = ''
    lecture_counts = 0
    if class_id is None or class_id == '':
        error = '강사 정보를 불러오지 못했습니다.'

    if error is None:
        # 강사 정보 가져오기
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다'

    if error is None:
        try:
            class_info.mem_info = MemberTb.objects.get(member_id=class_info.member_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다.'

    if error is None:
        # 강사에 해당하는 강좌 정보 불러오기
        lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                     lecture_tb__member_id=user_id, use=1).order_by('lecture_tb')

    if error is None:
        # 강사 클래스의 반복일정 불러오기
        if len(lecture_list) > 0:
            for idx, lecture_list_info in enumerate(lecture_list):
                lecture_info = lecture_list_info.lecture_tb
                try:
                    lecture_info_data = MemberLectureTb.objects.get(auth_cd='VIEW', member_id=user_id,
                                                                    lecture_tb=lecture_info.lecture_id)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'

                if error is None:
                    lecture_counts += 1
                    pt_schedule_data = ScheduleTb.objects.filter(lecture_tb=lecture_info.lecture_id,
                                                                 en_dis_type='1',
                                                                 start_dt__gte=start_date,
                                                                 start_dt__lt=end_date).order_by('start_dt')

                    # PT 스케쥴 정보 셋팅
                    if pt_schedule_data is not None:
                        idx = 0
                        for pt_schedule_datum in pt_schedule_data:
                            idx += 1
                            # lecture schedule id 셋팅
                            pt_schedule_id.append(pt_schedule_datum.schedule_id)
                            # lecture schedule 에 해당하는 lecture id 셋팅
                            pt_schedule_lecture_id.append(pt_schedule_datum.lecture_tb_id)
                            pt_schedule_member_name.append(user_name)

                            if pt_schedule_datum.start_dt > now:
                                if next_schedule_start_dt is '':
                                    next_schedule_start_dt = pt_schedule_datum.start_dt
                                    next_schedule_end_dt = pt_schedule_datum.end_dt
                                elif next_schedule_start_dt > pt_schedule_datum.start_dt:
                                    next_schedule_start_dt = pt_schedule_datum.start_dt
                                    next_schedule_end_dt = pt_schedule_datum.end_dt

                            pt_schedule_start_datetime.append(str(pt_schedule_datum.start_dt))
                            pt_schedule_end_datetime.append(str(pt_schedule_datum.end_dt))
                            pt_schedule_idx.append(idx)

                            if pt_schedule_datum.note is None:
                                pt_schedule_note.append('')
                            else:
                                pt_schedule_note.append(pt_schedule_datum.note)
                            # 끝난 스케쥴인지 확인
                            if pt_schedule_datum.state_cd == 'PE':
                                pt_schedule_finish_check.append(1)
                            else:
                                pt_schedule_finish_check.append(0)

                    if lecture_counts == 1:
                    # if idx == 0:
                        pt_repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                                  en_dis_type='1')
                        # if lecture_info.use != 0:
                        # if lecture_info.state_cd == 'IP' or lecture_info.state_cd == 'PE':
                        if lecture_info.state_cd == 'IP':
                            pt_start_date = lecture_info.start_date
                            pt_end_date = lecture_info.end_date

                    else:
                        pt_repeat_schedule_data |= RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                                   en_dis_type='1')
                        # if lecture_info.use != 0:
                        # if lecture_info.state_cd == 'IP' or lecture_info.state_cd == 'PE':
                        if lecture_info.state_cd == 'IP':
                            if pt_start_date == '':
                                pt_start_date = lecture_info.start_date
                            else:
                                if pt_start_date > lecture_info.start_date:
                                    pt_start_date = lecture_info.start_date
                            if pt_end_date == '':
                                pt_end_date = lecture_info.end_date
                            else:
                                if pt_end_date < lecture_info.end_date:
                                    pt_end_date = lecture_info.end_date

                    # if lecture_info.use != 0:
                    # if lecture_info.state_cd == 'IP' or lecture_info.state_cd == 'PE':
                    if lecture_info.state_cd == 'IP':
                        lecture_reg_count_sum += lecture_info.lecture_reg_count
                        lecture_rem_count_sum += lecture_info.lecture_rem_count
                        lecture_avail_count_sum += lecture_info.lecture_avail_count
                    lecture_info.schedule_check = 0
                    lecture_info.save()
                else:
                    error = None

            if pt_repeat_schedule_data is not None:
                for pt_repeat_schedule_info in pt_repeat_schedule_data:
                    pt_repeat_schedule_id.append(pt_repeat_schedule_info.repeat_schedule_id)
                    pt_repeat_schedule_type.append(pt_repeat_schedule_info.repeat_type_cd)
                    pt_repeat_schedule_week_info.append(pt_repeat_schedule_info.week_info)
                    pt_repeat_schedule_start_date.append(str(pt_repeat_schedule_info.start_date))
                    pt_repeat_schedule_end_date.append(str(pt_repeat_schedule_info.end_date))
                    pt_repeat_schedule_start_time.append(pt_repeat_schedule_info.start_time)
                    pt_repeat_schedule_time_duration.append(pt_repeat_schedule_info.time_duration)

    # OFF 일정
    if error is None:
        if pt_start_date != '':
            off_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                          start_dt__gte=start_date,
                                                          start_dt__lt=end_date)
            for off_schedule_datum in off_schedule_data:
                off_schedule_start_datetime.append(str(off_schedule_datum.start_dt))
                off_schedule_end_datetime.append(str(off_schedule_datum.end_dt))

    holiday = HolidayTb.objects.filter(use=1)

    if error is not None:
        context['error'] = error

    context['off_schedule_start_datetime'] = off_schedule_start_datetime
    context['off_schedule_end_datetime'] = off_schedule_end_datetime

    context['pt_schedule_id'] = pt_schedule_id
    context['pt_schedule_lecture_id'] = pt_schedule_lecture_id
    context['pt_schedule_member_name'] = pt_schedule_member_name
    context['pt_schedule_start_datetime'] = pt_schedule_start_datetime
    context['pt_schedule_end_datetime'] = pt_schedule_end_datetime
    context['pt_schedule_finish_check'] = pt_schedule_finish_check
    context['pt_schedule_note'] = pt_schedule_note
    context['pt_schedule_idx'] = pt_schedule_idx

    context['pt_repeat_schedule_id_data'] = pt_repeat_schedule_id
    context['pt_repeat_schedule_type_data'] = pt_repeat_schedule_type
    context['pt_repeat_schedule_week_info_data'] = pt_repeat_schedule_week_info
    context['pt_repeat_schedule_start_date_data'] = pt_repeat_schedule_start_date
    context['pt_repeat_schedule_end_date_data'] = pt_repeat_schedule_end_date
    context['pt_repeat_schedule_start_time_data'] = pt_repeat_schedule_start_time
    context['pt_repeat_schedule_time_duration_data'] = pt_repeat_schedule_time_duration

    context['next_schedule_start_dt'] = str(next_schedule_start_dt)
    context['next_schedule_end_dt'] = str(next_schedule_end_dt)
    context['lecture_info'] = lecture_list
    context['class_info'] = class_info
    context['lecture_reg_count'] = lecture_reg_count_sum
    context['lecture_finish_count'] = lecture_reg_count_sum - lecture_rem_count_sum
    context['lecture_avail_count'] = lecture_avail_count_sum
    context['pt_start_date'] = str(pt_start_date)
    context['pt_end_date'] = str(pt_end_date)
    context['holiday'] = holiday

    return context


class AlarmViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/alarm_data_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(AlarmViewAjax, self).get_context_data(**kwargs)
        # class_id = self.request.session.get('class_id', '')

        error = None

        if error is None:
            lecture_data = MemberLectureTb.objects.filter(member_id=self.request.user.id, auth_cd='VIEW')
            # lecture_data = LectureTb.objects.filter(member_id=self.request.user.id).exclude(member_view_state_cd='DELETE')
            if len(lecture_data) > 0:
                for idx, lecture_data_info in enumerate(lecture_data):
                    lecture_info = lecture_data_info.lecture_tb
                    if idx == 0:
                        log_data = LogTb.objects.filter(lecture_tb_id=lecture_info.lecture_id, use=1).order_by('-reg_dt')
                    else:
                        log_data |= LogTb.objects.filter(lecture_tb_id=lecture_info.lecture_id, use=1).order_by('-reg_dt')
                log_data.order_by('-reg_dt')

        if error is None:
            for log_info in log_data:
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


class AlarmView(LoginRequiredMixin, AccessTestMixin, AjaxListView):
    context_object_name = "log_data"
    template_name = "trainee_alarm.html"
    page_template = 'trainee_alarm_page.html'

    def get_queryset(self):
        lecture_id = self.request.session.get('lecture_id', '')
        error = None
        log_data = None

        if lecture_id is None or lecture_id == '':
            error = '수강정보를 불러오지 못했습니다.'

        if error is None:
            lecture_data = LectureTb.objects.filter(lecture_id=lecture_id)

        if error is None:
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=1).order_by('-reg_dt')
            log_data = LogTb.objects.filter(lecture_tb_id=lecture_id, use=1).order_by('-reg_dt')
            # log_data.order_by('-reg_dt')

        if error is None:
            for log_info in log_data:
                if log_info.read == 0:
                    log_info.log_read = 0
                    log_info.read = 1
                    log_info.save()
                elif log_info.read == 1:
                    log_info.log_read = 1
                else:
                    log_info.log_read = 2
                log_info.time_ago = timezone.now() - log_info.reg_dt
                log_info.reg_dt = str(log_info.reg_dt).split('.')[0]

                if log_info.log_detail != '' and log_info.log_detail is not None:
                    before_day = str(log_info.log_detail).split('/')[0]
                    after_day = str(log_info.log_detail).split('/')[1]

                    if '반복 일정' in log_info.log_info:
                        log_info.log_detail = before_day + '~' + after_day
                    else:
                        log_info.log_detail = before_day + '~' + after_day.split(' ')[1]

                day = int(log_info.time_ago.days)
                hour = int(log_info.time_ago.seconds/3600)
                minute = int(log_info.time_ago.seconds/60)
                sec = int(log_info.time_ago.seconds)

                if day > 0:
                    log_info.time_ago = str(day) + '일 전'
                else:
                    if hour > 0:
                        log_info.time_ago = str(hour) + '시간 전'
                    else:
                        if minute > 0:
                            log_info.time_ago = str(minute) + '분 전'
                        else:
                            log_info.time_ago = str(sec) + '초 전'

        return log_data


class GetTraineeErrorInfoView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_error_info.html'

    def get_context_data(self, **kwargs):
        context = super(GetTraineeErrorInfoView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        return context


def get_trainee_schedule_input_lecture(class_id, member_id):

    lecture_id = None
    # 강좌에 해당하는 수강/회원 정보 가져오기
    lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__member_id=member_id,
                                                 lecture_tb__state_cd='IP', lecture_tb__lecture_avail_count__gt=0,
                                                 lecture_tb__use=1).order_by('lecture_tb__start_date')
    # lecture_list = LectureTb.objects.filter(class_tb_id=class_id, member_id=member_id, state_cd='IP',
     #                                        lecture_avail_count__gt=0, use=1).order_by('start_date')
    if len(lecture_list) > 0:
        for lecture_info in lecture_list:
            error = None
            try:
                MemberLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_tb_id,
                                            member_id=member_id, auth_cd='VIEW', use=1)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'
            if error is None:
                lecture_id = lecture_info.lecture_tb.lecture_id

    return lecture_id


def update_trainee_info_logic(request):
    member_id = request.POST.get('id')
    email = request.POST.get('email', '')
    first_name = request.POST.get('first_name', '')
    last_name = request.POST.get('last_name', '')
    phone = request.POST.get('phone', '')
    contents = request.POST.get('contents', '')
    country = request.POST.get('country', '')
    address = request.POST.get('address', '')
    sex = request.POST.get('sex', '')
    birthday_dt = request.POST.get('birthday', '')
    next_page = request.POST.get('next_page')

    error = None
    member_id = request.user.id
    if member_id == '':
        error = '회원 ID를 확인해 주세요.'

    if error is None:
        try:
            user = User.objects.get(id=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

        try:
            member = MemberTb.objects.get(user_id=user.id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    input_first_name = ''
    input_last_name = ''
    input_phone = ''
    input_contents = ''
    input_country = ''
    input_address = ''
    input_sex = ''
    input_birthday_dt = ''

    if first_name is None or first_name == '':
        input_first_name = user.first_name
    else:
        input_first_name = first_name

    if last_name is None or last_name == '':
        input_last_name = user.last_name
    else:
        input_last_name = last_name

    if contents is None or contents == '':
        input_contents = member.contents
    else:
        input_contents = contents

    if country is None or country == '':
        input_country = member.country
    else:
        input_country = country

    if address is None or address == '':
        input_address = member.address
    else:
        input_address = address

    if sex is None or sex == '':
        input_sex = member.sex
    else:
        input_sex = sex

    if birthday_dt is None or birthday_dt == '':
        input_birthday_dt = member.birthday_dt
    else:
        input_birthday_dt = birthday_dt

    if phone is None or phone == '':
        input_phone = member.phone
    else:
        if len(phone) != 11 and len(phone) != 10:
            error = '연락처를 확인해 주세요.'
        elif not phone.isdigit():
            error = '연락처를 확인해 주세요.'
        else:
            input_phone = phone

    if error is None:
        try:
            with transaction.atomic():
                user.first_name = input_first_name
                user.last_name = input_last_name
                # user.email = email
                user.save()
                member.name = input_last_name + input_first_name
                member.phone = input_phone
                member.contents = input_contents
                member.sex = input_sex
                if input_birthday_dt is not None and input_birthday_dt != '':
                    member.birthday_dt = input_birthday_dt
                member.country = input_country
                member.address = input_address
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
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         log_info='회원 정보', log_how='수정',
                         reg_dt=timezone.now(), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


class DeleteTraineeAccountView(AccessTestMixin, TemplateView):
    template_name = 'delete_trainee_account_form.html'

    def get_context_data(self, **kwargs):
        context = super(DeleteTraineeAccountView, self).get_context_data(**kwargs)

        return context


@method_decorator(csrf_exempt, name='dispatch')
class GetTraineeGroupIngListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_group_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetTraineeGroupIngListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        group_list = []
        # group_data = GroupTb.objects.filter(class_tb_id=class_id, state_cd='IP', use=1)

        lecture_data = MemberLectureTb.objects.filter(member_id=self.request.user.id,
                                                      lecture_tb__state_cd='IP',
                                                      auth_cd='VIEW',
                                                      use=1).order_by('-lecture_tb__start_date')

        for lecture_info in lecture_data:
            group_lecture_check = 0
            try:
                group_lecture_info = GroupLectureTb.objects.get(group_tb__class_tb_id=class_id,
                                                                lecture_tb_id=lecture_info.lecture_tb_id, use=1)
            except ObjectDoesNotExist:
                group_lecture_check = 1

            if group_lecture_check == 0:
                check = 0

                try:
                    state_cd_nm = CommonCdTb.objects.get(common_cd=group_lecture_info.group_tb.state_cd)
                    group_lecture_info.group_tb.state_cd_nm = state_cd_nm.common_cd_nm
                except ObjectDoesNotExist:
                    error = '그룹 정보를 불러오지 못했습니다.'

                if len(group_list) == 0:
                    group_list.append(group_lecture_info)

                for group_info in group_list:

                    if group_info.group_tb_id == group_lecture_info.group_tb_id:
                        check = 1
                if check == 0:
                    group_list.append(group_lecture_info)

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['group_data'] = group_list

        return context


@method_decorator(csrf_exempt, name='dispatch')
class GetTraineeGroupEndListViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'ajax/trainee_group_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetTraineeGroupEndListViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        group_list = []
        # group_data = GroupTb.objects.filter(class_tb_id=class_id, state_cd='IP', use=1)

        lecture_data = MemberLectureTb.objects.filter(member_id=self.request.user.id,
                                                      lecture_tb__state_cd='IP',
                                                      use=1).exclude(auth_cd='DELETE').order_by('-lecture_tb__start_date')

        for lecture_info in lecture_data:
            group_lecture_check = 0
            try:
                group_lecture_info = GroupLectureTb.objects.get(group_tb__class_tb_id=class_id,
                                                                lecture_tb_id=lecture_info.lecture_tb_id,
                                                                use=1)
            except ObjectDoesNotExist:
                group_lecture_check = 1

            if group_lecture_check == 0:
                check = 0

                try:
                    state_cd_nm = CommonCdTb.objects.get(common_cd=group_lecture_info.group_tb.state_cd)
                    group_lecture_info.group_tb.state_cd_nm = state_cd_nm.common_cd_nm
                except ObjectDoesNotExist:
                    error = '그룹 정보를 불러오지 못했습니다.'

                if len(group_list) == 0:
                    group_list.append(group_lecture_info)

                for group_info in group_list:

                    if group_info.group_tb_id == group_lecture_info.group_tb_id:
                        check = 1
                if check == 0:
                    group_list.append(group_lecture_info)

        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['group_data'] = group_list

        return context


@method_decorator(csrf_exempt, name='dispatch')
class GetTraineeCountView(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'ajax/trainee_schedule_ajax.html'

    def post(self, request, *args, **kwargs):
        context = super(GetTraineeCountView, self).get_context_data(**kwargs)
        date = request.POST.get('date', '')
        day = request.POST.get('day', '')
        class_id = self.request.session.get('class_id', '')
        context = func_get_class_lecture_count(context, class_id, self.request.user.id)

        if context['error'] is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+context['error'])
            messages.error(self.request, context['error'])

        return render(request, self.template_name, context)
