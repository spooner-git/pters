import datetime

import boto3
import botocore
import base64

import logging
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.shortcuts import redirect, render

# Create your views here.
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from django.views.generic.base import ContextMixin

from configs import settings
from configs.views import date_check_func
from login.models import LogTb, MemberTb, CommonCdTb
from schedule.models import LectureTb, ClassLectureTb
from schedule.models import ClassTb
from schedule.models import ScheduleTb, DeleteScheduleTb, RepeatScheduleTb, DeleteRepeatScheduleTb

from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)


class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        return context


def add_schedule_logic_func(schedule_date, schedule_start_datetime, schedule_end_datetime,
                            user_id, lecture_id, note, en_dis_type, repeat_id, class_id):

    error = None
    class_info = None
    add_schedule_info = None
    seven_days_ago = schedule_start_datetime - datetime.timedelta(days=7)
    seven_days_after = schedule_end_datetime + datetime.timedelta(days=7)

    if error is None:
        # 강사 정보 가져오기
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다.'

    if en_dis_type == '1':
        if error is None:
            try:
                member_lecture_info = LectureTb.objects.get(lecture_id=int(lecture_id), use=1)
            except ObjectDoesNotExist:
                error = '회원 수강 정보를 불러오지 못했습니다.'
            except ValueError:
                error = '회원 수강 정보를 불러오지 못했습니다.'
        if error is None:
            if member_lecture_info.lecture_avail_count == 0:
                error = '예약 가능한 횟수를 확인해주세요.'

    if error is None:
        try:
            with transaction.atomic():

                if repeat_id is None:
                    add_schedule_info = ScheduleTb(class_tb_id=class_info.class_id, lecture_tb_id=lecture_id,
                                                   start_dt=schedule_start_datetime, end_dt=schedule_end_datetime,
                                                   state_cd='NP', permission_state_cd='AP', note=note, member_note='', en_dis_type=en_dis_type,
                                                   reg_member_id=user_id,
                                                   reg_dt=timezone.now(), mod_dt=timezone.now())
                else:
                    add_schedule_info = ScheduleTb(class_tb_id=class_info.class_id, lecture_tb_id=lecture_id,
                                                   repeat_schedule_tb_id=repeat_id,
                                                   start_dt=schedule_start_datetime, end_dt=schedule_end_datetime,
                                                   state_cd='NP', permission_state_cd='AP', note=note, member_note='', en_dis_type=en_dis_type,
                                                   reg_member_id=user_id,
                                                   reg_dt=timezone.now(), mod_dt=timezone.now())
                add_schedule_info.save()

                if en_dis_type == '1':
                    lecture_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=int(lecture_id))
                    if member_lecture_info.lecture_reg_count >= len(lecture_schedule_data):
                        member_lecture_info.lecture_avail_count = member_lecture_info.lecture_reg_count \
                                                                  - len(lecture_schedule_data)
                        member_lecture_info.mod_dt = timezone.now()
                        member_lecture_info.save()

                    else:
                        error = '예약 가능한 횟수를 확인해주세요.'
                        # add_schedule_info.delete()
                        raise ValidationError()

        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '날짜가 중복됐습니다.'
        except ValidationError as e:
            error = '예약 가능한 횟수를 확인해주세요.'
        except InternalError as e:
            error = '예약 가능한 횟수를 확인해주세요.'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                  start_dt__gte=seven_days_ago, end_dt__lte=seven_days_after, use=1).exclude(schedule_id=add_schedule_info.schedule_id)
        for schedule_datum in schedule_data:
            error = date_check_func(schedule_date, schedule_start_datetime, schedule_end_datetime,
                                    schedule_datum.start_dt, schedule_datum.end_dt)
            if error is not None:
                break

        if error is not None:
            add_schedule_info.delete()
            if en_dis_type == '1':
                lecture_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=int(lecture_id))
                if member_lecture_info.lecture_reg_count >= len(lecture_schedule_data):
                    member_lecture_info.lecture_avail_count = member_lecture_info.lecture_reg_count \
                                                              - len(lecture_schedule_data)
                    member_lecture_info.mod_dt = timezone.now()
                    member_lecture_info.save()

                else:
                    error = '예약 가능한 횟수를 확인해주세요.'

    return error


def delete_schedule_logic_func(schedule_info, member_id):

    error = None
    lecture_info = None
    en_dis_type = schedule_info.en_dis_type

    if en_dis_type == '1':
        if error is None:
            try:
                lecture_info = LectureTb.objects.get(lecture_id=schedule_info.lecture_tb_id, use=1)
            except ObjectDoesNotExist:
                error = '회원 PT 정보가 존재하지 않습니다'

    if error is None:
        # 강사 정보 가져오기
        try:
            class_info = ClassTb.objects.get(class_id=schedule_info.class_tb_id)
        except ObjectDoesNotExist:
            error = '강사 정보가 존재하지 않습니다'

    # print()
    if error is None:
        try:
            with transaction.atomic():
                delete_schedule = DeleteScheduleTb(schedule_id=schedule_info.schedule_id,
                                                   class_tb_id=schedule_info.class_tb_id,
                                                   lecture_tb_id=schedule_info.lecture_tb_id,
                                                   delete_repeat_schedule_tb=schedule_info.repeat_schedule_tb_id,
                                                   start_dt=schedule_info.start_dt, end_dt=schedule_info.end_dt,
                                                   permission_state_cd=schedule_info.permission_state_cd,
                                                   state_cd=schedule_info.state_cd, note=schedule_info.note,
                                                   en_dis_type=schedule_info.en_dis_type, member_note=schedule_info.member_note,
                                                   reg_member_id=schedule_info.reg_member_id,
                                                   del_member_id=str(member_id),
                                                   reg_dt=schedule_info.reg_dt, mod_dt=timezone.now(), use=0)

                delete_schedule.save()
                schedule_info.delete()

                if en_dis_type == '1':

                    lecture_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
                    if lecture_info.lecture_reg_count >= len(lecture_schedule_data):
                        lecture_info.lecture_avail_count = lecture_info.lecture_reg_count \
                                                                  - len(lecture_schedule_data)
                    else:
                        error = '예약 가능한 횟수를 확인해주세요.'
                        raise ValidationError()

                    # 진행 완료된 일정을 삭제하는경우 예약가능 횟수 및 남은 횟수 증가
                    if schedule_info.state_cd == 'PE':
                        lecture_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                          state_cd='PE')
                        if lecture_info.lecture_reg_count >= len(lecture_schedule_data):
                            lecture_info.lecture_rem_count = lecture_info.lecture_reg_count \
                                                               - len(lecture_schedule_data)

                        else:
                            error = '예약 가능한 횟수를 확인해주세요.'
                            raise ValidationError()

                    lecture_repeat_schedule_data = None

                    if delete_schedule.delete_repeat_schedule_tb is not None and delete_schedule.delete_repeat_schedule_tb != '':
                        try:
                            lecture_repeat_schedule_data = RepeatScheduleTb.objects.get(
                                repeat_schedule_id=delete_schedule.delete_repeat_schedule_tb)
                        except ObjectDoesNotExist:
                            lecture_repeat_schedule_data = None

                    if lecture_repeat_schedule_data is not None:
                        repeat_schedule_count = ScheduleTb.objects.filter(repeat_schedule_tb_id=delete_schedule.delete_repeat_schedule_tb).count()
                        repeat_schedule_finish_count = ScheduleTb.objects.filter(repeat_schedule_tb_id=delete_schedule.delete_repeat_schedule_tb,
                                                                                 state_cd='PE').count()
                        if repeat_schedule_count == 0:
                            delete_repeat_schedule = DeleteRepeatScheduleTb(
                                class_tb_id=lecture_repeat_schedule_data.class_tb_id,
                                lecture_tb_id=lecture_repeat_schedule_data.lecture_tb_id,
                                repeat_schedule_id=lecture_repeat_schedule_data.repeat_schedule_id,
                                repeat_type_cd=lecture_repeat_schedule_data.repeat_type_cd,
                                week_info=lecture_repeat_schedule_data.week_info,
                                start_date=lecture_repeat_schedule_data.start_date,
                                end_date=lecture_repeat_schedule_data.end_date,
                                start_time=lecture_repeat_schedule_data.start_time,
                                time_duration=lecture_repeat_schedule_data.time_duration,
                                state_cd=lecture_repeat_schedule_data.state_cd, en_dis_type=lecture_repeat_schedule_data.en_dis_type,
                                reg_member_id=lecture_repeat_schedule_data.reg_member_id,
                                reg_dt=lecture_repeat_schedule_data.reg_dt, mod_dt=timezone.now(), use=0)
                            delete_repeat_schedule.save()
                            lecture_repeat_schedule_data.delete()
                        else:
                            if repeat_schedule_finish_count == 0:
                                lecture_repeat_schedule_data.state_cd = 'NP'
                                lecture_repeat_schedule_data.save()

                    if lecture_info.lecture_rem_count > 0 and lecture_info.state_cd == 'PE':
                        lecture_info.state_cd = 'IP'
                    lecture_info.mod_dt = timezone.now()
                    lecture_info.schedule_check = 1
                    lecture_info.save()

        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '이미 삭제된 일정입니다'
        except InternalError as e:
            error = '이미 삭제된 일정입니다'
        except ValidationError as e:
            error = '예약 가능한 횟수를 확인해주세요.'

    # print(error)
    return error


def get_trainer_schedule_data_func(context, class_id, start_date, end_date):

    error = None
    class_info = None
    off_schedule_id = []
    off_schedule_start_datetime = []
    off_schedule_end_datetime = []
    off_schedule_note = []

    pt_schedule_id = []
    pt_schedule_lecture_id = []
    pt_schedule_start_datetime = []
    pt_schedule_end_datetime = []
    pt_schedule_member_name = []
    pt_schedule_member_id = []
    pt_schedule_finish_check = []
    pt_schedule_note = []
    off_repeat_schedule_id = []
    off_repeat_schedule_type = []
    off_repeat_schedule_week_info = []
    off_repeat_schedule_start_date = []
    off_repeat_schedule_end_date = []
    off_repeat_schedule_start_time = []
    off_repeat_schedule_time_duration = []

    pt_repeat_schedule_id = []
    pt_repeat_schedule_type = []
    pt_repeat_schedule_week_info = []
    pt_repeat_schedule_start_date = []
    pt_repeat_schedule_end_date = []
    pt_repeat_schedule_start_time = []
    pt_repeat_schedule_time_duration = []
    pt_repeat_schedule_state_cd = []
    pt_repeat_schedule_state_cd_nm = []

    # 강사 정보 가져오기
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강사 정보가 존재하지 않습니다'

    if error is None:
        # 강사 클래스의 반복일정 불러오기
        off_repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                   en_dis_type='0')
        for off_repeat_schedule_info in off_repeat_schedule_data:
            off_repeat_schedule_id.append(off_repeat_schedule_info.repeat_schedule_id)
            off_repeat_schedule_type.append(off_repeat_schedule_info.repeat_type_cd)
            off_repeat_schedule_week_info.append(off_repeat_schedule_info.week_info)
            off_repeat_schedule_start_date.append(str(off_repeat_schedule_info.start_date))
            off_repeat_schedule_end_date.append(str(off_repeat_schedule_info.end_date))
            off_repeat_schedule_start_time.append(off_repeat_schedule_info.start_time)
            off_repeat_schedule_time_duration.append(off_repeat_schedule_info.time_duration)

        pt_repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
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

    # OFF 일정 조회
    if error is None:
        off_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                      en_dis_type='0', start_dt__gte=start_date,
                                                      start_dt__lt=end_date)
        for off_schedule_datum in off_schedule_data:
            off_schedule_id.append(off_schedule_datum.schedule_id)
            off_schedule_start_datetime.append(str(off_schedule_datum.start_dt))
            off_schedule_end_datetime.append(str(off_schedule_datum.end_dt))
            if off_schedule_datum.note is None:
                off_schedule_note.append('')
            else:
                off_schedule_note.append(off_schedule_datum.note)

    # PT 일정 조회
    if error is None:
        # 강사에 해당하는 강좌 정보 불러오기
        lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, use=1)

        for lecture_datum_info in lecture_data:
            lecture_datum = lecture_datum_info.lecture_tb
            # 강좌별로 연결되어있는 회원 리스트 불러오기
            member_data = MemberTb.objects.get(member_id=lecture_datum.member_id)
            # 강좌별로 연결된 PT 스케쥴 가져오기
            lecture_datum.pt_schedule_data = ScheduleTb.objects.filter(lecture_tb=lecture_datum.lecture_id,
                                                                       en_dis_type='1',
                                                                       start_dt__gte=start_date,
                                                                       start_dt__lt=end_date, use=1)
            # PT 스케쥴 정보 셋팅
            for pt_schedule_datum in lecture_datum.pt_schedule_data:
                # lecture schedule id 셋팅
                pt_schedule_id.append(pt_schedule_datum.schedule_id)
                # lecture schedule 에 해당하는 lecture id 셋팅
                pt_schedule_lecture_id.append(lecture_datum.lecture_id)
                pt_schedule_member_name.append(member_data.name)
                pt_schedule_member_id.append(member_data.member_id)
                pt_schedule_start_datetime.append(str(pt_schedule_datum.start_dt))
                pt_schedule_end_datetime.append(str(pt_schedule_datum.end_dt))
                if pt_schedule_datum.note is None:
                    pt_schedule_note.append('')
                else:
                    pt_schedule_note.append(pt_schedule_datum.note)
                # 끝난 스케쥴인지 확인
                if pt_schedule_datum.state_cd == 'PE':
                    pt_schedule_finish_check.append(1)
                else:
                    pt_schedule_finish_check.append(0)

    if error is None:
        class_info.schedule_check = 0
        class_info.save()

    context['off_schedule_id'] = off_schedule_id
    context['off_schedule_start_datetime'] = off_schedule_start_datetime
    context['off_schedule_end_datetime'] = off_schedule_end_datetime
    context['off_schedule_note'] = off_schedule_note
    context['pt_schedule_id'] = pt_schedule_id
    context['pt_schedule_lecture_id'] = pt_schedule_lecture_id
    context['pt_schedule_member_name'] = pt_schedule_member_name
    context['pt_schedule_member_id'] = pt_schedule_member_id

    context['pt_schedule_start_datetime'] = pt_schedule_start_datetime
    context['pt_schedule_end_datetime'] = pt_schedule_end_datetime
    context['pt_schedule_finish_check'] = pt_schedule_finish_check
    context['pt_schedule_note'] = pt_schedule_note

    context['off_repeat_schedule_id_data'] = off_repeat_schedule_id
    context['off_repeat_schedule_type_data'] = off_repeat_schedule_type
    context['off_repeat_schedule_week_info_data'] = off_repeat_schedule_week_info
    context['off_repeat_schedule_start_date_data'] = off_repeat_schedule_start_date
    context['off_repeat_schedule_end_date_data'] = off_repeat_schedule_end_date
    context['off_repeat_schedule_start_time_data'] = off_repeat_schedule_start_time
    context['off_repeat_schedule_time_duration_data'] = off_repeat_schedule_time_duration

    context['pt_repeat_schedule_id_data'] = pt_repeat_schedule_id
    context['pt_repeat_schedule_type_data'] = pt_repeat_schedule_type
    context['pt_repeat_schedule_week_info_data'] = pt_repeat_schedule_week_info
    context['pt_repeat_schedule_start_date_data'] = pt_repeat_schedule_start_date
    context['pt_repeat_schedule_end_date_data'] = pt_repeat_schedule_end_date
    context['pt_repeat_schedule_start_time_data'] = pt_repeat_schedule_start_time
    context['pt_repeat_schedule_time_duration_data'] = pt_repeat_schedule_time_duration
    context['pt_repeat_schedule_state_cd'] = pt_repeat_schedule_state_cd
    context['pt_repeat_schedule_state_cd_nm'] = pt_repeat_schedule_state_cd_nm

    return context


# 일정 추가
def add_schedule_logic(request):
    lecture_id = request.POST.get('lecture_id')
    member_id = request.POST.get('member_id')
    member_name = request.POST.get('member_name')
    schedule_date = request.POST.get('training_date')
    schedule_time = request.POST.get('training_time')
    schedule_time_duration = request.POST.get('time_duration')
    en_dis_type = request.POST.get('en_dis_type')
    note = request.POST.get('add_memo', '')
    date = request.POST.get('date', '')
    day = request.POST.get('day', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    schedule_start_datetime = None
    input_datetime_list = []

    request.session['date'] = date
    request.session['day'] = day

    if en_dis_type == '1':
        if member_id == '':
            error = '회원을 선택해 주세요.'

    if schedule_date == '':
        error = '날짜를 선택해 주세요.'
    elif schedule_time == '':
        error = '시작 시간을 선택해 주세요.'
    elif schedule_time_duration == '':
        error = '진행 시간을 선택해 주세요.'

    if note is None:
        note = ''

    if error is None:
        # 강사 정보 가져오기
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강사 정보가 존재하지 않습니다'

    if error is None:
        # 최초 날짜 값 셋팅
        try:
            schedule_start_datetime = datetime.datetime.strptime(schedule_date + ' ' + schedule_time, '%Y-%m-%d %H:%M:%S.%f')
            schedule_end_datetime = schedule_start_datetime + datetime.timedelta(hours=int(schedule_time_duration))
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:

        '''
        # 날짜 값 셋팅 - 1시간 단위
        time_test = 0
        while time_test < int(schedule_time_duration):
            date_time_set = []
            #날짜 값 셋팅
            try:
                input_schedule_start_datetime = schedule_start_datetime + datetime.timedelta(hours=time_test)
                input_schedule_end_datetime = input_schedule_start_datetime + datetime.timedelta(hours=1)
            except ValueError as e:
                error = '등록 값에 문제가 있습니다.'
            except IntegrityError as e:
                error = '등록 값에 문제가 있습니다.'
            except TypeError as e:
                error = '등록 값의 형태에 문제가 있습니다.'
            time_test += 1

            if error is None:
                date_time_set.append(input_schedule_start_datetime)
                date_time_set.append(input_schedule_end_datetime)
                input_datetime_list.append(date_time_set)
        '''
    if error is None:
        try:
            with transaction.atomic():
                if en_dis_type == '1':
                    lecture_id = get_member_schedule_input_lecture(class_info.class_id, member_id)
                    if lecture_id is None:
                        error = '등록할수 있는 일정이 없습니다.'

                if error is None:
                    error = add_schedule_logic_func(schedule_date, schedule_start_datetime, schedule_end_datetime,
                                                    request.user.id, lecture_id, note,
                                                    en_dis_type, None, class_id)
                '''
                for input_datetime in input_datetime_list:
                    lecture_id = get_member_schedule_input_lecture(class_info.class_id, member_id)
                    error = add_schedule_logic_func(schedule_date, input_datetime[0], input_datetime[1],
                                                    request.user.id, lecture_id, note,
                                                    en_dis_type, None)
                    if error is not None:
                        break
                '''
                if error is not None:
                    raise ValidationError()

        except TypeError as e:
            error = error
        except ValueError as e:
            error = error
        except IntegrityError as e:
            error = error
        except ValidationError as e:
            error = error + '등록 일정이 겹칩니다.'
        except InternalError as e:
            error = error

    if error is None:
        member_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id, lecture_tb__state_cd='IP', lecture_tb__use=1)
        # member_lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id, state_cd='IP', member_view_state_cd='VIEW', use=1)
        for member_lecture_data_info in member_lecture_data:
            member_lecture_info = member_lecture_data_info.lecture_tb
            member_lecture_info.schedule_check = 1
            member_lecture_info.save()

        save_log_data(schedule_start_datetime, schedule_end_datetime,
                      class_info.class_id, lecture_id, request.user.last_name+request.user.first_name,
                      member_name, en_dis_type, 'LS01', request)

        push_info_schedule_start_date = str(schedule_start_datetime).split(':')
        push_info_schedule_end_date = str(schedule_end_datetime).split(' ')[1].split(':')

        if en_dis_type == '1':
            request.session['push_info'] = request.user.last_name+request.user.first_name+'님이 '\
                                           + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]\
                                           + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]+' PT 일정을 등록했습니다'
            request.session['lecture_id'] = lecture_id
        else:
            request.session['push_info'] = ''
            request.session['lecture_id'] = ''

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


# 일정 삭제
def delete_schedule_logic(request):
    pt_schedule_id = request.POST.get('schedule_id', '')
    off_schedule_id = request.POST.get('off_schedule_id', '')
    member_name = request.POST.get('member_name')
    en_dis_type = request.POST.get('en_dis_type')
    date = request.POST.get('date', '')
    day = request.POST.get('day', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    request.session['date'] = date
    request.session['day'] = day
    lecture_id = ''

    if en_dis_type == '1':
        schedule_id = pt_schedule_id
    else:
        schedule_id = off_schedule_id

    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보가 존재하지 않습니다'

    if error is None:
        lecture_id = schedule_info.lecture_tb_id
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt
        en_dis_type = schedule_info.en_dis_type

    if error is None:
        error = delete_schedule_logic_func(schedule_info, request.user.id)

    if error is None:

        member_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__state_cd='IP', lecture_tb__use=1)
        # member_lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id, state_cd='IP', member_view_state_cd='VIEW', use=1)
        for member_lecture_data_info in member_lecture_data:
            member_lecture_info = member_lecture_data_info.lecture_tb
            member_lecture_info.schedule_check = 1
            member_lecture_info.save()
        save_log_data(start_date, end_date, class_id, lecture_id, request.user.last_name+request.user.first_name,
                      member_name, en_dis_type, 'LS02', request)

        push_info_schedule_start_date = str(start_date).split(':')
        push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')

        if en_dis_type == '1':
            request.session['push_info'] = request.user.last_name+request.user.first_name+'님이 '\
                                           + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]\
                                           + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1] + ' PT 일정을 삭제했습니다'
            request.session['lecture_id'] = lecture_id
        else:
            request.session['push_info'] = ''
            request.session['lecture_id'] = ''

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


# 일정 완료
def finish_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id')
    member_name = request.POST.get('member_name')
    #imgUpload = request.POST.get('upload')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    # image upload test - hk.kim 180313
    # format, imgstr = imgUpload.split(';base64,')
    # ext = format.split('/')[-1]
    # data = ContentFile(base64.b64decode(imgstr), name='temp.' + ext)

    #print(str(imgUpload))
    error = None
    schedule_info = None
    lecture_info = None

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
        if schedule_info.state_cd == 'PE':
            error = '이미 확정된 스케쥴입니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=schedule_info.lecture_tb_id, use=1)
        except ObjectDoesNotExist:
            error = '회원 PT 정보를 불러오지 못했습니다.'

    # if error is None:
    #    if lecture_info.state_cd == 'NP':
    #        error = '회원이 수락하지 않은 스케쥴입니다.'
    #    if lecture_info.state_cd == 'RJ':
    #        error = '회원이 수락하지 않은 스케쥴입니다.'

    if error is None:
        try:
            with transaction.atomic():
                schedule_info.mod_dt = timezone.now()
                schedule_info.state_cd = 'PE'
                schedule_info.save()
                # 남은 횟수 차감
                if schedule_info.state_cd == 'PE':
                    lecture_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=schedule_info.lecture_tb_id,
                                                                      state_cd='PE')
                    if lecture_info.lecture_reg_count >= len(lecture_schedule_data):
                        lecture_info.lecture_rem_count = lecture_info.lecture_reg_count \
                                                         - len(lecture_schedule_data)

                    else:
                        error = '예약 가능한 횟수를 확인해주세요.'
                        raise ValidationError()

                lecture_repeat_schedule_data = None
                if schedule_info.repeat_schedule_tb_id is not None and schedule_info.repeat_schedule_tb_id != '':
                    try:
                        lecture_repeat_schedule_data = RepeatScheduleTb.objects.get(repeat_schedule_id=schedule_info.repeat_schedule_tb_id)
                    except ObjectDoesNotExist:
                        lecture_repeat_schedule_data = None

                if lecture_repeat_schedule_data is not None:
                    if lecture_repeat_schedule_data.state_cd == 'NP':
                        lecture_repeat_schedule_data.state_cd = 'IP'
                        lecture_repeat_schedule_data.save()

                if lecture_info.lecture_rem_count == 0:
                    lecture_info.state_cd = 'PE'
                    if lecture_repeat_schedule_data is not None:
                        lecture_repeat_schedule_data.state_cd = 'PE'
                        lecture_repeat_schedule_data.save()

                lecture_info.mod_dt = timezone.now()
                lecture_info.schedule_check = 1
                lecture_info.save()

        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError as e:
            error = '예약 가능한 횟수를 확인해주세요.'
        except InternalError as e:
            error = '예약 가능 횟수를 확인해주세요.'
    # print(error)

    if error is None:
        save_log_data(start_date, end_date, class_id, lecture_info.lecture_id, request.user.last_name+request.user.first_name,
                      member_name, '1', 'LS03', request)

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


# 반복 일정 추가
def add_repeat_schedule_logic(request):
    member_id = request.POST.get('member_id')
    lecture_id = request.POST.get('lecture_id', '')
    member_name = request.POST.get('member_name')
    repeat_type = request.POST.get('repeat_freq')
    repeat_schedule_start_date = request.POST.get('repeat_start_date')
    repeat_schedule_end_date = request.POST.get('repeat_end_date')
    repeat_week_type = request.POST.get('repeat_day', '')
    repeat_schedule_time = request.POST.get('repeat_start_time')
    repeat_schedule_time_duration = request.POST.get('repeat_dur')
    # date = request.POST.get('date', '')
    # day = request.POST.get('day', '')
    en_dis_type = request.POST.get('en_dis_type', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    # error_message = None
    error_date_message = None
    class_info = None
    # lecture_id = ''
    repeat_week_type_data = []
    repeat_schedule_start_date_info = None
    repeat_schedule_end_date_info = None
    repeat_schedule_info = None
    # request.session['date'] = date
    # request.session['day'] = day
    pt_schedule_input_counter = 0

    week_info = ['SUN', 'MON', 'TUE', 'WED', 'THS', 'FRI', 'SAT']

    if repeat_type == '':
        error = '반복 빈도를 선택해주세요.'

    if error is None:
        if repeat_week_type == '':
            error = '반복 요일을 설정해주세요.'

    if error is None:
        temp_data = repeat_week_type.split('/')
        for week_type_info in temp_data:
            for idx, week_info_detail in enumerate(week_info):
                if week_info_detail == week_type_info:
                    repeat_week_type_data.append(idx)
                    break

    if error is None:
        if repeat_schedule_start_date == '':
            error = '반복일정 시작 날짜를 선택해 주세요.'

    if error is None:
        repeat_schedule_start_date_info = datetime.datetime.strptime(repeat_schedule_start_date, '%Y-%m-%d')
        if repeat_schedule_end_date == '':
            repeat_schedule_end_date_info = repeat_schedule_start_date_info + datetime.timedelta(days=365)
        else:
            repeat_schedule_end_date_info = datetime.datetime.strptime(repeat_schedule_end_date, '%Y-%m-%d')

    if error is None:
        if repeat_schedule_time == '':
            error = '시작 시간을 선택해 주세요.'
        elif repeat_schedule_time_duration == '':
            error = '진행 시간을 선택해 주세요.'

    if error is None:
        if en_dis_type == '1':
            # if lecture_id == '':
            #     error = '회원을 선택해 주세요.'
            if member_name == '':
                error = '회원을 선택해 주세요.'
        else:
            lecture_id = ''

    if error is None:
        # 반복 일정 데이터 등록
        repeat_schedule_info = RepeatScheduleTb(class_tb_id=class_id, lecture_tb_id=lecture_id,
                                                repeat_type_cd=repeat_type,
                                                week_info=repeat_week_type,
                                                start_date=repeat_schedule_start_date_info, end_date=repeat_schedule_end_date_info,
                                                start_time=repeat_schedule_time, time_duration=repeat_schedule_time_duration,
                                                state_cd='NP', en_dis_type=en_dis_type,
                                                reg_member_id=request.user.id,
                                                reg_dt=timezone.now(), mod_dt=timezone.now())

        repeat_schedule_info.save()
        if repeat_schedule_info.repeat_schedule_id is None:
            request.session['repeat_schedule_id'] = ''
        request.session['repeat_schedule_id'] = repeat_schedule_info.repeat_schedule_id

    if error is None:

        # 반복일정 처음 날짜 설정
        check_date = repeat_schedule_start_date_info

        # 반복일정 종료 날짜 보다 크면 종료
        while check_date <= repeat_schedule_end_date_info:

            # 반복일정 등록해야하는 첫번째 요일 검색 -> 자신보다 뒤에있는 요일중에 가장 가까운것
            week_idx = -1
            for week_type_info in repeat_week_type_data:
                if week_type_info >= int(check_date.strftime('%w')):
                    week_idx = week_type_info
                    break
            # 가장 가까운 요일이 뒤에 없다면 다음주중에 가장 가까운 요일 선택
            if week_idx == -1:
                week_idx = repeat_week_type_data[0]

            # 현재 요일에서 가야하는 요일 빼기 -> 더해야 하는 날짜 계산
            week_idx -= int(check_date.strftime('%w'))

            # 만약 요일을 뺐는데 음수라면 +7 or +14 더하기
            if week_idx < 0:
                if repeat_type == '2W':
                    week_idx += 14
                else:
                    week_idx += 7

            # 요일 계산된 값을 더하기
            check_date = check_date + datetime.timedelta(days=week_idx)

            # 날짜 계산을 했는데 일정 넘어가면 멈추기
            if check_date > repeat_schedule_end_date_info:
                break
            # 데이터 넣을 날짜 setting
            try:
                schedule_start_datetime = datetime.datetime.strptime(str(check_date).split(' ')[0]
                                                                     + ' ' + repeat_schedule_time,
                                                                     '%Y-%m-%d %H:%M:%S.%f')
                schedule_end_datetime = schedule_start_datetime + datetime.timedelta(hours=int(repeat_schedule_time_duration))
            except ValueError as e:
                error = '등록 값에 문제가 있습니다.'
            except IntegrityError as e:
                error = '등록 값에 문제가 있습니다.'
            except TypeError as e:
                error = '등록 값의 형태에 문제가 있습니다.'
            '''
            # 1시간 단위 날짜 값 셋팅
            if error is None:
                time_test = 0
                while time_test < int(repeat_schedule_time_duration):
                    date_time_set = []
                    # 날짜 값 셋팅
                    try:
                        input_schedule_start_datetime = schedule_start_datetime + datetime.timedelta(hours=time_test)
                        input_schedule_end_datetime = input_schedule_start_datetime + datetime.timedelta(hours=1)
                    except ValueError as e:
                        error = '등록 값에 문제가 있습니다.'
                    except IntegrityError as e:
                        error = '등록 값에 문제가 있습니다.'
                    except TypeError as e:
                        error = '등록 값의 형태에 문제가 있습니다.'
                    time_test += 1

                    if error is None:
                        date_time_set.append(input_schedule_start_datetime)
                        date_time_set.append(input_schedule_end_datetime)
                        input_datetime_list.append(date_time_set)
            '''
            if error is None:

                try:
                    with transaction.atomic():
                        # PT 일정 추가라면 일정 추가해야할 lecture id 찾기
                        if en_dis_type == '1':
                            lecture_id = get_member_schedule_input_lecture(class_id, member_id)

                        error = add_schedule_logic_func(str(check_date).split(' ')[0], schedule_start_datetime,
                                                        schedule_end_datetime, request.user.id,
                                                        lecture_id, '', en_dis_type,
                                                        repeat_schedule_info.repeat_schedule_id, class_id)
                        if error is None:
                            pt_schedule_input_counter += 1
                        '''

                        # 1시간 단위 날짜 값 셋팅
                        for input_datetime in input_datetime_list:
                            lecture_id = get_member_schedule_input_lecture(class_info.class_id, member_id)
                            error = add_schedule_logic_func(str(check_date).split(' ')[0], input_datetime[0],
                                                            input_datetime[1], request.user.id,
                                                            lecture_id, '', en_dis_type,
                                                            repeat_schedule_info.repeat_schedule_id)
                            if error is not None:
                                break
                        '''
                        if error is not None:
                            raise ValidationError()

                except TypeError as e:
                    error = error
                except ValueError as e:
                    error = error
                except IntegrityError as e:
                    error = error
                except ValidationError as e:
                    error = error
                except InternalError as e:
                    error = error

                if error == '예약 가능한 횟수를 확인해주세요.' or error == '날짜가 중복됐습니다.' or error == '등록 값에 문제가 있습니다.':
                    logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
                    messages.error(request, error)
                elif error == '등록 값의 형태에 문제가 있습니다.' or error == '회원 수강 정보를 불러오지 못했습니다.' or error == '강사 정보를 불러오지 못했습니다.':
                    logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
                    messages.error(request, error)
                elif error is not None:
                    if error_date_message is None:
                        error_date_message = error
                    else:
                        error_date_message = error_date_message + '/' + error

            else:
                logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
                messages.error(request, error)

            error = None

            # 날짜값 입력후 날짜 증가
            check_date = check_date + datetime.timedelta(days=1)

            # 날짜값 입력후 날짜 증가했는데 일요일이고 격주인경우 일주일 더하기
            if int(check_date.strftime('%w')) == 0:
                if repeat_type == '2W':
                    check_date = check_date + datetime.timedelta(days=7)
    request.session['repeat_schedule_input_counter'] = pt_schedule_input_counter
    if error_date_message is not None:
        # logger.info(error_date_message)
        messages.info(request, error_date_message)

    return redirect(next_page)


def add_repeat_schedule_confirm(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id')
    repeat_confirm = request.POST.get('repeat_confirm')
    date = request.POST.get('date', '')
    day = request.POST.get('day', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    repeat_schedule_data = None
    start_date = None
    end_date = None
    en_dis_type = None
    lecture_info = None
    member_info = None
    member_name = ''
    information = None
    request.session['date'] = date
    request.session['day'] = day
    lecture_id = ''

    if repeat_schedule_id == '':
        error = '확인할 반복일정을 선택해주세요.'
    if repeat_confirm == '':
        error = '확인할 반복일정에 대한 정보를 확인해주세요.'

    if error is None:
        try:
            repeat_schedule_data = RepeatScheduleTb.objects.get(repeat_schedule_id=repeat_schedule_id)
        except ObjectDoesNotExist:
            error = '반복 일정이 존재하지 않습니다'

    if error is None:
        start_date = repeat_schedule_data.start_date
        end_date = repeat_schedule_data.end_date
        en_dis_type = repeat_schedule_data.en_dis_type

    if error is None:
        if en_dis_type == '1':
            try:
                lecture_info = LectureTb.objects.get(lecture_id=repeat_schedule_data.lecture_tb_id, use=1)
            except ObjectDoesNotExist:
                error = '회원 PT 정보가 존재하지 않습니다'

            if error is None:
                try:
                    member_info = MemberTb.objects.get(member_id=lecture_info.member_id)
                except ObjectDoesNotExist:
                    error = '회원 정보가 존재하지 않습니다'
            if error is None:
                lecture_id = lecture_info.lecture_id
                member_name = member_info.name

    if error is None:
        if repeat_confirm == '0':
            try:
                with transaction.atomic():
                    schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id)
                    # schedule_data.delete()
                    for delete_schedule_info in schedule_data:
                        if delete_schedule_info.state_cd != 'PE':
                            error = delete_schedule_logic_func(delete_schedule_info, request.user.id)
                        if error is not None:
                            break

                    repeat_schedule_data.delete()

                    if en_dis_type == '1':
                        if lecture_info.lecture_rem_count > 0:
                            lecture_info.state_cd = 'IP'
                        else:
                            lecture_info.state_cd = 'PE'
                        lecture_info.mod_dt = timezone.now()

                        lecture_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
                        if lecture_info.lecture_reg_count >= len(lecture_schedule_data):
                            lecture_info.lecture_avail_count = lecture_info.lecture_reg_count \
                                                               - len(lecture_schedule_data)
                        else:
                            error = '예약 가능한 횟수를 확인해주세요.'
                            raise ValidationError()

                        lecture_info.save()

            except TypeError as e:
                error = '등록 값의 형태에 문제가 있습니다.'
            except ValueError as e:
                error = '등록 값에 문제가 있습니다.'
            except IntegrityError as e:
                error = '반복일정 삭제중 요류가 발생했습니다. 다시 시도해주세요.'
            except InternalError as e:
                error = '반복일정 삭제중 요류가 발생했습니다. 다시 시도해주세요.'
            except ValidationError as e:
                error = '반복일정 삭제중 요류가 발생했습니다. 다시 시도해주세요.'
            if error is None:
                information = '반복일정 등록이 취소됐습니다.'
            request.session['push_info'] = ''
            request.session['lecture_id'] = ''

        else:
            member_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__state_cd='IP', lecture_tb__use=1)
            # member_lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id, state_cd='IP', member_view_state_cd='VIEW', use=1)
            for member_lecture_data_info in member_lecture_data:
                member_lecture_info = member_lecture_data_info.lecture_tb
                member_lecture_info.schedule_check = 1
                member_lecture_info.save()

            save_log_data(start_date, end_date, class_id, lecture_id, request.user.last_name+request.user.first_name,
                          member_name, en_dis_type, 'LR01', request)

            if en_dis_type == '1':
                request.session['push_info'] = request.user.last_name + request.user.first_name + '님이 ' + str(start_date) \
                                               + '~' + str(end_date) + ' PT 반복일정을 등록했습니다'
                request.session['lecture_id'] = lecture_id
            else:
                request.session['push_info'] = ''
                request.session['lecture_id'] = ''
            information = '반복일정 등록이 완료됐습니다.'

    # print(error)
    if error is None:
        if information is None:
            return redirect(next_page)
        else:
            messages.info(request, information)
            return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


@csrf_exempt
def delete_repeat_schedule_logic(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id')
    date = request.POST.get('date', '')
    day = request.POST.get('day', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    schedule_data = None
    start_date = None
    end_date = None
    en_dis_type = None
    lecture_info = None
    member_info = None
    member_name = ''
    repeat_schedule_info = None
    request.session['date'] = date
    request.session['day'] = day

    if repeat_schedule_id == '':
        error = '확인할 반복일정을 선택해주세요.'

    if error is None:
        try:
            repeat_schedule_info = RepeatScheduleTb.objects.get(repeat_schedule_id=repeat_schedule_id)
        except ObjectDoesNotExist:
            error = '반복 일정이 존재하지 않습니다'

    if error is None:
        start_date = repeat_schedule_info.start_date
        end_date = repeat_schedule_info.end_date
        en_dis_type = repeat_schedule_info.en_dis_type

    if error is None:
        if en_dis_type == '1':
            try:
                lecture_info = LectureTb.objects.get(lecture_id=repeat_schedule_info.lecture_tb_id, use=1)
            except ObjectDoesNotExist:
                error = '회원 PT 정보가 존재하지 않습니다.'
            if error is None:
                try:
                    member_info = MemberTb.objects.get(member_id=lecture_info.member_id)
                except ObjectDoesNotExist:
                    error = '회원 정보가 존재하지 않습니다.'
            if error is None:
                member_name = member_info.name

    if error is None:
        schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id, start_dt__gte=timezone.now())

    if error is None:
        try:
            with transaction.atomic():
                for delete_schedule_info in schedule_data:
                    if delete_schedule_info.state_cd != 'PE':
                        error = delete_schedule_logic_func(delete_schedule_info, request.user.id)
                    if error is not None:
                        break

                if error is not None:
                    raise ValidationError()

                delete_repeat_schedule = DeleteRepeatScheduleTb(class_tb_id=repeat_schedule_info.class_tb_id, lecture_tb_id=repeat_schedule_info.lecture_tb_id,
                                                                repeat_schedule_id=repeat_schedule_info.repeat_schedule_id,
                                                                repeat_type_cd=repeat_schedule_info.repeat_type_cd,
                                                                week_info=repeat_schedule_info.week_info,
                                                                start_date=repeat_schedule_info.start_date,
                                                                end_date=repeat_schedule_info.end_date,
                                                                start_time=repeat_schedule_info.start_time,
                                                                time_duration=repeat_schedule_info.time_duration,
                                                                state_cd=repeat_schedule_info.state_cd, en_dis_type=repeat_schedule_info.en_dis_type,
                                                                reg_member_id=repeat_schedule_info.reg_member_id,
                                                                reg_dt=repeat_schedule_info.reg_dt, mod_dt=timezone.now(), use=0)
                delete_repeat_schedule.save()
                repeat_schedule_info.delete()

        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '이미 삭제된 일정입니다1'
        except InternalError as e:
            error = '이미 삭제된 일정입니다2'
        except ValidationError as e:
            error = '예약 가능한 횟수를 확인해주세요.'

    # print(error)

    if error is None:
        member_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__state_cd='IP', lecture_tb__use=1)
        # member_lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id, state_cd='IP', member_view_state_cd='VIEW', use=1)
        for member_lecture_data_info in member_lecture_data:
            member_lecture_info = member_lecture_data_info.lecture_tb
            member_lecture_info.schedule_check = 1
            member_lecture_info.save()
        save_log_data(start_date, end_date, class_id, delete_repeat_schedule.lecture_tb_id, request.user.last_name+request.user.first_name,
                      member_name, en_dis_type, 'LR02', request)

        if en_dis_type == '1':
            request.session['push_info'] = request.user.last_name + request.user.first_name + '님이 ' + str(start_date) \
                                           + '~' + str(end_date) + ' PT 반복일정을 삭제했습니다'
            request.session['lecture_id'] = delete_repeat_schedule.lecture_tb_id
        else:
            request.session['push_info'] = ''
            request.session['lecture_id'] = ''

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


class CheckScheduleUpdateViewAjax(LoginRequiredMixin, TemplateView):
    template_name = 'data_change_check_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(CheckScheduleUpdateViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        user_for_group = User.objects.get(id=self.request.user.id)
        group = user_for_group.groups.get(user=self.request.user.id)

        # update_check 0 : data update 없음
        # update_check 1 : data update 있음
        update_check = 0
        if class_id is None or class_id == '':
            error = '강좌 정보를 불러오지 못했습니다.'
        if error is None:
            if group.name == 'trainer':
                # 강사 정보 가져오기
                try:
                    class_info = ClassTb.objects.get(class_id=class_id)
                except ObjectDoesNotExist:
                    error = '강사 정보가 존재하지 않습니다'

                if error is None:
                    update_check = class_info.schedule_check

            if group.name == 'trainee':
                try:
                    lecture_info = LectureTb.objects.get(member=self.request.user.id, use=1)
                except ObjectDoesNotExist:
                    error = '회원 PT 정보가 존재하지 않습니다'
                if error is None:
                    update_check = lecture_info.schedule_check

        # print(error)
        context['data_changed'] = update_check
        if error is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+error)
            messages.error(self.request, error)

        return context


def save_log_data(start_date, end_date, class_id, lecture_id, user_name, member_name, en_dis_type, log_type, request):

    # 일정 등록
    log_type_name = ''
    log_type_detail = ''

    if log_type == 'LS01':
        log_type_name = '일정'
        log_type_detail = '등록'

    if log_type == 'LS02':
        log_type_name = '일정'
        log_type_detail = '삭제'

    if log_type == 'LS03':
        log_type_name = '일정'
        log_type_detail = '완료'
    if log_type == 'LR01':
        log_type_name = '반복 일정'
        log_type_detail = '등록'

    if log_type == 'LR02':
        log_type_name = '반복 일정'
        log_type_detail = '삭제'

    if en_dis_type == '1':
        # log_contents = '<span>' + user_name + ' 강사님께서 ' + member_name \
        #               + ' 회원님의</span> '+log_type_name \
        #               + ' 을 <span class="status">'+log_type_detail\
        #               + '</span>했습니다.@' \
        #               + log_start_date \
        #               + ' - ' + log_end_date

        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                         from_member_name=user_name, to_member_name=member_name,
                         class_tb_id=class_id, lecture_tb_id=lecture_id,
                         log_info='PT '+log_type_name, log_how=log_type_detail,
                         log_detail=str(start_date) + '~' + str(end_date),
                         reg_dt=timezone.now(), use=1)
        log_data.save()
    else:
        # log_contents = '<span>' + user_name + ' 강사님께서 ' \
        #               + ' OFF </span> '+log_type_name\
        #               + '을 <span class="status">'+log_type_detail\
        #               + '</span>했습니다.@' \
        #               + log_start_date \
        #               + ' - ' + log_end_date

        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                         from_member_name=user_name,
                         class_tb_id=class_id,
                         log_info='OFF '+log_type_name, log_how=log_type_detail,
                         log_detail=str(start_date) + '~' + str(end_date),
                         reg_dt=timezone.now(), use=1)
        log_data.save()


def get_member_schedule_input_lecture(class_id, member_id):

    lecture_id = None
    # 강좌에 해당하는 수강/회원 정보 가져오기
    lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__member_id=member_id,
                                                 lecture_tb__state_cd='IP', lecture_tb__lecture_avail_count__gt=0,
                                                 lecture_tb__use=1).order_by('lecture_tb__start_date')
    # lecture_list = LectureTb.objects.filter(class_tb_id=class_id, member_id=member_id, state_cd='IP',
     #                                        lecture_avail_count__gt=0, use=1).order_by('start_date')
    if len(lecture_list) > 0:
        lecture_id = lecture_list[0].lecture_tb.lecture_id

    return lecture_id


@csrf_exempt
def upload_sign_image_logic(request):

    # user_id = request.POST.get('user_id', '')
    schedule_id = request.POST.get('schedule_id', '')
    image_test = request.POST.get('upload_file', '')
    next_page = '/trainer/cal_day_ajax/'

    s3 = boto3.resource('s3', aws_access_key_id=getattr(settings, "PTERS_AWS_ACCESS_KEY_ID", ''),
                        aws_secret_access_key=getattr(settings, "PTERS_AWS_SECRET_ACCESS_KEY", ''))
    bucket = s3.Bucket(getattr(settings, "PTERS_AWS_S3_BUCKET_NAME", ''))
    exists = True

    try:
        s3.meta.client.head_bucket(Bucket='pters-image')
    except botocore.exceptions.ClientError as e:
        # If a client error is thrown, then check that it was a 404 error.
        # If it was a 404 error, then the bucket does not exist.
        error_code = int(e.response['Error']['Code'])
        if error_code == 404:
            exists = False

    if exists is True:
        format, img_str = image_test.split(';base64,')
        ext = format.split('/')[-1]

        data = ContentFile(base64.b64decode(img_str), name='temp.' + ext)

        bucket.put_object(Key=schedule_id+'.png', Body=data, ContentType='image/png',
                          ACL='public-read')

    return redirect(next_page)


# 수정 필요 - hkkim - 2018.03.28
@method_decorator(csrf_exempt, name='dispatch')
class GetFinishScheduleViewAjax(LoginRequiredMixin, ContextMixin, View):
    template_name = 'finish_schedule_ajax.html'

    def get(self, request, *args, **kwargs):
        context = super(GetFinishScheduleViewAjax, self).get_context_data(**kwargs)

        lecture_id = request.GET.get('lecture_id', '')
        member_id = request.GET.get('member_id', '')

        finish_schedule_list = None
        if lecture_id is None or lecture_id == '':
            lecture_list = LectureTb.objects.filter(member_id=member_id, use=1)
            if len(lecture_list) > 0:
                for idx, lecture_info in enumerate(lecture_list):
                    if idx == 0:
                        finish_schedule_list = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id, state_cd='PE').order_by('-end_dt')
                    else:
                        finish_schedule_list |= ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id, state_cd='PE').order_by('-end_dt')
        else:
            finish_schedule_list = ScheduleTb.objects.filter(lecture_tb_id=lecture_id, state_cd='PE').order_by('-end_dt')

        context['finish_schedule_list'] = finish_schedule_list

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        context = super(GetFinishScheduleViewAjax, self).get_context_data(**kwargs)

        lecture_id = request.POST.get('lecture_id', '')
        member_id = request.POST.get('member_id', '')

        finish_schedule_list = None
        if lecture_id is None or lecture_id == '':
            lecture_list = LectureTb.objects.filter(member_id=member_id, use=1)

            if len(lecture_list) > 0:
                for idx, lecture_info in enumerate(lecture_list):
                    if idx == 0:
                        finish_schedule_list = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id, state_cd='PE').order_by('-end_dt')
                    else:
                        finish_schedule_list |= ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id, state_cd='PE').order_by('-end_dt')
        else:
            finish_schedule_list = ScheduleTb.objects.filter(lecture_tb_id=lecture_id, state_cd='PE').order_by('-end_dt')

        context['finish_schedule_list'] = finish_schedule_list

        return render(request, self.template_name, context)


# 메모 수정
@csrf_exempt
def update_memo_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id')
    note = request.POST.get('add_memo', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보가 존재하지 않습니다'

    if error is None:
        schedule_info.note = note
        schedule_info.mod_dt = timezone.now()
        schedule_info.save()

    if error is None:
        log_data = LogTb(log_type='LS03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info='일정 메모', log_how='수정',
                         reg_dt=timezone.now(), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)