import datetime

import boto3
import botocore
import base64

from botocore.exceptions import ClientError

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
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from configs import settings
from configs.const import ON_SCHEDULE_TYPE, USE, GROUP_SCHEDULE_TYPE
from login.models import LogTb, MemberTb
from schedule.functions import func_get_lecture_id, func_add_schedule, func_refresh_lecture_count, func_date_check, \
    func_update_member_schedule_alarm, func_save_log_data, func_check_group_schedule_enable, \
    func_get_available_group_member_list, func_get_group_lecture_id, \
    func_check_group_available_member_before, func_check_group_available_member_after, \
    func_send_push_trainer, func_get_not_available_group_member_list, func_send_push_trainee, func_delete_schedule, \
    func_delete_repeat_schedule, func_update_repeat_schedule, func_get_repeat_schedule_date_list, \
    func_add_repeat_schedule, func_refresh_group_status
from schedule.models import LectureTb, MemberLectureTb, GroupLectureTb, GroupTb
from schedule.models import ClassTb
from schedule.models import ScheduleTb, RepeatScheduleTb

from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)


class IndexView(TemplateView):
    template_name = 'index_schedule.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        return context


# 일정 추가
def add_schedule_logic(request):
    member_id = request.POST.get('member_id')
    schedule_date = request.POST.get('training_date')
    schedule_time = request.POST.get('training_time')
    schedule_time_duration = request.POST.get('time_duration')
    en_dis_type = request.POST.get('en_dis_type')
    note = request.POST.get('add_memo', '')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    next_page = request.POST.get('next_page')

    error = None
    schedule_start_datetime = None
    schedule_end_datetime = None
    lecture_id = ''
    member_info = None
    member_name = ''
    push_lecture_id = []
    push_title = []
    push_message = []
    class_info = None

    context = {'push_lecture_id': None, 'push_title': None, 'push_message': None}

    if en_dis_type == ON_SCHEDULE_TYPE:
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
            error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        # 강사 정보 가져오기
        if en_dis_type == ON_SCHEDULE_TYPE:
            try:
                member_info = MemberTb.objects.get(member_id=member_id)
            except ObjectDoesNotExist:
                error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        # 최초 날짜 값 셋팅
        time_duration_temp = class_info.class_hour*int(schedule_time_duration)

        try:
            schedule_start_datetime = datetime.datetime.strptime(schedule_date + ' ' + schedule_time,
                                                                 '%Y-%m-%d %H:%M:%S.%f')
            schedule_end_datetime = schedule_start_datetime + datetime.timedelta(minutes=int(time_duration_temp))
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        if en_dis_type == ON_SCHEDULE_TYPE:
            lecture_id = func_get_lecture_id(class_id, member_id)
            if lecture_id is None or lecture_id == '':
                error = '등록할수 있는 일정이 없습니다.'

    if error is None:
        try:
            with transaction.atomic():
                schedule_result = None
                if error is None:
                    schedule_result = func_add_schedule(class_id, lecture_id, None, None, None, schedule_start_datetime,
                                                        schedule_end_datetime, note, en_dis_type, request.user.id)
                    error = schedule_result['error']

                if error is None:
                    if lecture_id is not None and lecture_id != '':
                        error = func_refresh_lecture_count(lecture_id)

                if error is None:
                    error = func_date_check(class_id, schedule_result['schedule_id'],
                                            schedule_date, schedule_start_datetime, schedule_end_datetime)

                    if error is not None:
                        error += ' 일정이 중복되었습니다.'
                if error is not None:
                    raise InternalError()

        except TypeError:
            error = error
        except ValueError:
            error = error
        except IntegrityError:
            error = error
        except InternalError:
            error = error

    if error is None:
        func_update_member_schedule_alarm(class_id)

        if en_dis_type == ON_SCHEDULE_TYPE:
            member_name = member_info.name
        func_save_log_data(schedule_start_datetime, schedule_end_datetime,
                           class_id, lecture_id, request.user.last_name+request.user.first_name,
                           member_name, en_dis_type, 'LS01', request)

    if error is None:
        push_info_schedule_start_date = str(schedule_start_datetime).split(':')
        push_info_schedule_end_date = str(schedule_end_datetime).split(' ')[1].split(':')
        if en_dis_type == ON_SCHEDULE_TYPE:
            push_lecture_id.append(lecture_id)
            push_title.append(class_type_name + ' 수업 - 일정 알림')
            push_message.append(request.user.last_name+request.user.first_name+'님이 '
                                + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1] +
                                ' 일정을 등록했습니다.')

            context['push_lecture_id'] = push_lecture_id
            context['push_title'] = push_title
            context['push_message'] = push_message
        else:
            context['push_lecture_id'] = ''
            context['push_title'] = ''
            context['push_message'] = ''

        return render(request, 'ajax/schedule_error_info.html', context)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


# 일정 취소
def delete_schedule_logic(request):
    pt_schedule_id = request.POST.get('schedule_id', '')
    off_schedule_id = request.POST.get('off_schedule_id', '')
    member_id = request.POST.get('member_id')
    en_dis_type = request.POST.get('en_dis_type', ON_SCHEDULE_TYPE)
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')
    class_type_name = request.session.get('class_type_name', '')

    push_lecture_id = []
    push_title = []
    push_message = []
    error = None
    group_id = None
    lecture_id = None
    repeat_schedule_id = None
    start_dt = None
    end_dt = None
    member_name = None
    schedule_info = None
    context = {'push_lecture_id': None, 'push_title': None, 'push_message': None}

    if en_dis_type == ON_SCHEDULE_TYPE:
        schedule_id = pt_schedule_id
    else:
        schedule_id = off_schedule_id

    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보를 불러오지 못했습니다.'

    if error is None:
        if en_dis_type == ON_SCHEDULE_TYPE:
            try:
                member_info = MemberTb.objects.get(member_id=member_id)
                member_name = member_info.name
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        lecture_id = schedule_info.lecture_tb_id
        repeat_schedule_id = schedule_info.repeat_schedule_tb_id
        en_dis_type = schedule_info.en_dis_type
        start_dt = schedule_info.start_dt
        end_dt = schedule_info.end_dt
        group_id = schedule_info.group_tb_id

    if error is None:
        try:
            with transaction.atomic():
                group_id = schedule_info.group_tb_id
                schedule_result = func_delete_schedule(schedule_id, request.user.id)
                error = schedule_result['error']
                if en_dis_type == ON_SCHEDULE_TYPE:
                    error = func_refresh_lecture_count(lecture_id)

                    if repeat_schedule_id is not None and repeat_schedule_id != '':
                        error = func_update_repeat_schedule(repeat_schedule_id)

        except TypeError:
            error = '등록 값의 형태에 문제가 있습니다.'
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '이미 취소된 일정입니다.'
        except InternalError:
            error = '이미 취소된 일정입니다.'
        except ValidationError:
            error = '예약 가능한 횟수를 확인해주세요.'

    if error is None:
        func_refresh_group_status(group_id, None, None)

    if error is None:
        if group_id is None or group_id == '':
            func_save_log_data(start_dt, end_dt, class_id, lecture_id, request.user.last_name+request.user.first_name,
                               member_name, en_dis_type, 'LS02', request)

            func_update_member_schedule_alarm(class_id)

        else:
            func_save_log_data(start_dt, end_dt, class_id, lecture_id, request.user.last_name+request.user.first_name,
                               member_name, GROUP_SCHEDULE_TYPE, 'LS02', request)

        push_info_schedule_start_date = str(start_dt).split(':')
        push_info_schedule_end_date = str(end_dt).split(' ')[1].split(':')

        if en_dis_type == ON_SCHEDULE_TYPE:
            push_lecture_id.append(schedule_info.lecture_tb_id)
            push_title.append(class_type_name + ' 수업 - 일정 알림')
            if group_id is not None and group_id != '':
                push_message.append(request.user.last_name+request.user.first_name+'님이 '
                                    + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                    + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                    + ' 그룹 일정을 취소했습니다.')
            else:
                push_message.append(request.user.last_name+request.user.first_name+'님이 '
                                    + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                    + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                    + ' 일정을 취소했습니다.')
            context['push_lecture_id'] = push_lecture_id
            context['push_title'] = push_title
            context['push_message'] = push_message

        else:
            context['push_lecture_id'] = ''
            context['push_title'] = ''
            context['push_message'] = ''
        # return redirect(next_page)
        return render(request, 'ajax/schedule_error_info.html', context)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


# 일정 완료
def finish_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id')
    member_id = request.POST.get('member_id', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')
    class_type_name = request.session.get('class_type_name', '')

    error = None
    schedule_info = None
    lecture_info = None
    lecture_repeat_schedule_data = None
    member_name = None
    push_lecture_id = []
    push_title = []
    push_message = []
    start_date = None
    end_date = None
    context = {'push_lecture_id': None, 'push_title': None, 'push_message': None}

    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            member_info = MemberTb.objects.get(member_id=member_id)
            member_name = member_info.name
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt
        if schedule_info.state_cd == 'PE':
            error = '이미 완료된 스케쥴입니다.'
    if error is None:
        lecture_info = schedule_info.lecture_tb

    if error is None:
        try:
            with transaction.atomic():
                schedule_info.mod_dt = timezone.now()
                schedule_info.state_cd = 'PE'
                schedule_info.save()
                # 남은 횟수 차감
                error = func_refresh_lecture_count(lecture_info.lecture_id)
                lecture_info.refresh_from_db()

                lecture_repeat_schedule_data = None
                if schedule_info.repeat_schedule_tb_id is not None and schedule_info.repeat_schedule_tb_id != '':
                    lecture_repeat_schedule_data = schedule_info.repeat_schedule_tb

                if lecture_repeat_schedule_data is not None:
                    if lecture_repeat_schedule_data.state_cd == 'NP':
                        lecture_repeat_schedule_data.state_cd = 'IP'
                        lecture_repeat_schedule_data.save()
                    lecture_repeat_schedule_counter =\
                        ScheduleTb.objects.filter(repeat_schedule_tb_id=lecture_repeat_schedule_data.repeat_schedule_id,
                                                  use=USE).exclude(state_cd='PE').count()
                    if lecture_repeat_schedule_counter == 0:
                        lecture_repeat_schedule_data.state_cd = 'PE'
                        lecture_repeat_schedule_data.save()

                if lecture_info.lecture_rem_count == 0:
                    lecture_info.state_cd = 'PE'
                lecture_info.schedule_check = 1
                lecture_info.save()

        except TypeError:
            error = '등록 값의 형태에 문제가 있습니다.'
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '예약 가능한 횟수를 확인해주세요.'
        except InternalError:
            error = '예약 가능 횟수를 확인해주세요.'
    # 그룹 스케쥴 종료 및 그룹 반복일정 종료
    if error is None:
        if schedule_info.group_tb_id is not None and schedule_info.group_tb_id != '':
            group_repeat_schedule_id = None
            if lecture_repeat_schedule_data is not None and lecture_repeat_schedule_data != '':
                group_repeat_schedule_id = lecture_repeat_schedule_data.group_schedule_id
            func_refresh_group_status(schedule_info.group_tb_id, schedule_info.group_schedule_id,
                                      group_repeat_schedule_id)

    if error is None:

        push_info_schedule_start_date = str(start_date).split(':')
        push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')
        func_save_log_data(start_date, end_date, class_id, '', request.user.last_name+request.user.first_name,
                           member_name, ON_SCHEDULE_TYPE, 'LS03', request)

        push_lecture_id.append(schedule_info.lecture_tb_id)
        push_title.append(class_type_name + ' 수업 - 일정 알림')
        if schedule_info.group_tb_id is not None and schedule_info.group_tb_id != '':
            push_message.append(push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                + ' 그룹 일정이 완료됐습니다.')
        else:
            push_message.append(push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                + ' 일정이 완료됐습니다.')
        context['push_lecture_id'] = push_lecture_id
        context['push_title'] = push_title
        context['push_message'] = push_message

    if error is None:
        return render(request, 'ajax/schedule_error_info.html', context)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


@csrf_exempt
def upload_sign_image_logic(request):

    schedule_id = request.POST.get('schedule_id', '')
    image_test = request.POST.get('upload_file', '')
    context = {'error': None}

    s3 = boto3.resource('s3', aws_access_key_id=getattr(settings, "PTERS_AWS_ACCESS_KEY_ID", ''),
                        aws_secret_access_key=getattr(settings, "PTERS_AWS_SECRET_ACCESS_KEY", ''))
    bucket = s3.Bucket(getattr(settings, "PTERS_AWS_S3_BUCKET_NAME", ''))
    exists = True
    error_code = 0
    try:
        s3.meta.client.head_bucket(Bucket='pters-image')
    except ClientError as e:
        # If a client error is thrown, then check that it was a 404 error.
        # If it was a 404 error, then the bucket does not exist.
        error_code = int(e.response['Error']['Code'])
        if error_code == 404:
            exists = False

    if exists is True:
        image_format, image_str = image_test.split(';base64,')
        ext = image_format.split('/')[-1]

        data = ContentFile(base64.b64decode(image_str), name='temp.' + ext)

        bucket.put_object(Key=schedule_id+'.png', Body=data, ContentType='image/png',
                          ACL='public-read')
    else:
        context['error'] = error_code

    return render(request, 'ajax/schedule_error_info.html', context)


# 메모 수정
@csrf_exempt
def update_memo_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id')
    note = request.POST.get('add_memo', '')
    # next_page = request.POST.get('next_page')
    # context = {'error': None}
    error = None
    schedule_info = None
    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보를 불러오지 못했습니다.'

    if error is None:
        schedule_info.note = note
        schedule_info.mod_dt = timezone.now()
        schedule_info.save()

    if error is None:
        return render(request, 'ajax/schedule_error_info.html', None)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return render(request, 'ajax/schedule_error_info.html', None)


# 반복 일정 추가
def add_repeat_schedule_logic(request):
    member_id = request.POST.get('member_id')
    repeat_type = request.POST.get('repeat_freq')
    repeat_schedule_start_date = request.POST.get('repeat_start_date')
    repeat_schedule_end_date = request.POST.get('repeat_end_date')
    repeat_week_type = request.POST.get('repeat_day', '')
    repeat_start_time = request.POST.get('repeat_start_time')
    repeat_schedule_time_duration = request.POST.get('repeat_dur')
    en_dis_type = request.POST.get('en_dis_type', ON_SCHEDULE_TYPE)
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    error_date_message = None
    class_info = None
    lecture_id = None
    repeat_schedule_start_date_info = None
    repeat_schedule_end_date_info = None
    repeat_schedule_info = None
    pt_schedule_input_counter = 0
    repeat_schedule_start_time = None
    repeat_schedule_end_time = None
    repeat_schedule_date_list = []
    success_start_date = None
    success_end_date = None

    if repeat_type == '':
        error = '반복 빈도를 선택해주세요.'

    if error is None:
        if repeat_week_type == '':
            error = '반복 요일을 설정해주세요.'

    if error is None:
        if repeat_schedule_start_date == '':
            error = '반복일정 시작 날짜를 선택해 주세요.'
        if repeat_schedule_end_date == '':
            error = '반복일정 종료 날짜를 선택해 주세요.'

    if error is None:
        try:
            repeat_schedule_start_date_info = datetime.datetime.strptime(repeat_schedule_start_date, '%Y-%m-%d')
            repeat_schedule_end_date_info = datetime.datetime.strptime(repeat_schedule_end_date, '%Y-%m-%d')
        except ValueError:
            error = '날짜에서 오류가 발생했습니다.'
        except IntegrityError:
            error = '날짜에서 오류가 발생했습니다.'
        except TypeError:
            error = '날짜에서 오류가 발생했습니다.'

    if error is None:
        if (repeat_schedule_end_date_info - repeat_schedule_start_date_info) > datetime.timedelta(days=365):
            error = '1년까지만 반복일정을 등록할수 있습니다.'

    if error is None:
        if repeat_start_time == '':
            error = '시작 시간을 선택해 주세요.'
        elif repeat_schedule_time_duration == '':
            error = '진행 시간을 선택해 주세요.'

    if error is None:
        if en_dis_type == ON_SCHEDULE_TYPE:
            if member_id == '':
                error = '회원을 선택해 주세요.'
            else:
                lecture_id = func_get_lecture_id(class_id, member_id)
                if lecture_id is None or lecture_id == '':
                    error = '등록할수 있는 일정이 없습니다.'
        else:
            lecture_id = None

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        repeat_schedule_start_time = datetime.datetime.strptime(repeat_start_time, '%H:%M:%S.%f')
        temp_time_duration = class_info.class_hour*int(repeat_schedule_time_duration)
        repeat_schedule_end_time = repeat_schedule_start_time + datetime.timedelta(minutes=int(temp_time_duration))
        repeat_schedule_start_time = repeat_schedule_start_time.time()
        repeat_schedule_end_time = repeat_schedule_end_time.time()
    if error is None:
        repeat_schedule_date_list = func_get_repeat_schedule_date_list(repeat_type, repeat_week_type,
                                                                       repeat_schedule_start_date_info,
                                                                       repeat_schedule_end_date_info)
        if len(repeat_schedule_date_list) == 0:
            error = '등록할 수 있는 일정이 없습니다.'

    if error is None:
        # 반복 일정 데이터 등록
        repeat_schedule_result = func_add_repeat_schedule(class_id, lecture_id, None, None, repeat_type,
                                                          repeat_week_type,
                                                          repeat_schedule_start_date, repeat_schedule_end_date,
                                                          str(repeat_schedule_start_time),
                                                          str(repeat_schedule_end_time),
                                                          repeat_schedule_time_duration, en_dis_type,
                                                          request.user.id)
        if repeat_schedule_result['error'] is None:
            if repeat_schedule_result['schedule_info'] is None:
                request.session['repeat_schedule_id'] = ''
            else:
                request.session['repeat_schedule_id'] = repeat_schedule_result['schedule_info'].repeat_schedule_id
                repeat_schedule_info = repeat_schedule_result['schedule_info']

    if error is None:
        for repeat_schedule_date_info in repeat_schedule_date_list:
            error_date = None
            # 데이터 넣을 날짜 setting
            try:
                schedule_start_datetime = datetime.datetime.strptime(str(repeat_schedule_date_info).split(' ')[0]
                                                                     + ' ' + str(repeat_schedule_start_time),
                                                                     '%Y-%m-%d %H:%M:%S')
                schedule_end_datetime = datetime.datetime.strptime(str(repeat_schedule_date_info).split(' ')[0]
                                                                   + ' ' + str(repeat_schedule_end_time),
                                                                   '%Y-%m-%d %H:%M:%S')

            except ValueError:
                error_date = str(repeat_schedule_date_info).split(' ')[0]
            except IntegrityError:
                error_date = str(repeat_schedule_date_info).split(' ')[0]
            except TypeError:
                error_date = str(repeat_schedule_date_info).split(' ')[0]

            if error_date is None:
                try:
                    with transaction.atomic():
                        schedule_check = 0
                        schedule_result = None
                        # PT 일정 추가라면 일정 추가해야할 lecture id 찾기
                        if en_dis_type == ON_SCHEDULE_TYPE:
                            lecture_id = func_get_lecture_id(class_id, member_id)
                            if lecture_id is not None and lecture_id != '':
                                schedule_check = 1
                        else:
                            schedule_check = 1
                            # if lecture_id is None or lecture_id == '':
                            #     error_date = str(repeat_schedule_date_info).split(' ')[0]
                        if error_date is None:
                            if schedule_check == 1:
                                schedule_result = func_add_schedule(class_id, lecture_id,
                                                                    repeat_schedule_info.repeat_schedule_id,
                                                                    None, None,
                                                                    schedule_start_datetime, schedule_end_datetime, '',
                                                                    en_dis_type, request.user.id)
                                if schedule_result['error'] is not None:
                                    error_date = str(repeat_schedule_date_info).split(' ')[0]

                        if error_date is None:
                            if lecture_id is not None and lecture_id != '':
                                error_temp = func_refresh_lecture_count(lecture_id)
                                if error_temp is not None:
                                    error_date = str(repeat_schedule_date_info).split(' ')[0]

                        if error_date is None:
                            # if lecture_id is not None and lecture_id != '':
                            error_date = func_date_check(class_id, schedule_result['schedule_id'],
                                                         str(repeat_schedule_date_info).split(' ')[0],
                                                         schedule_start_datetime, schedule_end_datetime)

                        if error_date is not None:
                            raise ValidationError(str(error_date))
                        else:
                            if schedule_check == 1:
                                if pt_schedule_input_counter == 0:
                                    success_start_date = str(repeat_schedule_date_info).split(' ')[0]
                                success_end_date = str(repeat_schedule_date_info).split(' ')[0]
                                pt_schedule_input_counter += 1

                except TypeError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0]
                except ValueError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0]
                except IntegrityError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0]
                except ValidationError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0]
                except InternalError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0]

            if error_date is not None:
                if error_date_message is None:
                    error_date_message = error_date
                else:
                    error_date_message = error_date_message + '/' + error_date

    if error is None:
        if pt_schedule_input_counter == 0:
            repeat_schedule_info.delete()
        else:
            repeat_schedule_info.start_date = success_start_date
            repeat_schedule_info.end_date = success_end_date
            repeat_schedule_info.save()

        request.session['repeat_schedule_input_counter'] = pt_schedule_input_counter

        if error_date_message is not None:
            messages.info(request, error_date_message)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    return redirect(next_page)


def add_repeat_schedule_confirm(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id')
    repeat_confirm = request.POST.get('repeat_confirm')
    date = request.POST.get('date', '')
    day = request.POST.get('day', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')
    class_type_name = request.session.get('class_type_name', '')

    error = None
    repeat_schedule_data = None
    start_date = None
    end_date = None
    en_dis_type = None
    member_name = ''
    information = None
    request.session['date'] = date
    request.session['day'] = day
    lecture_id = ''
    push_lecture_id = []
    push_title = []
    push_message = []
    context = {'push_lecture_id': None, 'push_title': None, 'push_message': None}

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
        if en_dis_type == ON_SCHEDULE_TYPE:
            lecture_info = repeat_schedule_data.lecture_tb
            member_info = lecture_info.member
            lecture_id = lecture_info.lecture_id
            member_name = member_info.name

    if error is None:
        if repeat_confirm == '0':
            try:
                with transaction.atomic():
                    schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id)
                    for delete_schedule_info in schedule_data:
                        if delete_schedule_info.state_cd != 'PE':
                            delete_lecture_id = delete_schedule_info.lecture_tb_id
                            delete_schedule_info.delete()
                            if en_dis_type == ON_SCHEDULE_TYPE:
                                error = func_refresh_lecture_count(delete_lecture_id)
                        if error is not None:
                            break
                    repeat_schedule_data.delete()

            except TypeError:
                error = '등록 값의 형태에 문제가 있습니다.'
            except ValueError:
                error = '등록 값에 문제가 있습니다.'
            except IntegrityError:
                error = '반복일정 취소중 요류가 발생했습니다. 다시 시도해주세요.'
            except InternalError:
                error = '반복일정 취소중 요류가 발생했습니다. 다시 시도해주세요.'
            except ValidationError:
                error = '반복일정 취소중 요류가 발생했습니다. 다시 시도해주세요.'
            if error is None:
                information = '반복일정 등록이 취소됐습니다.'

        else:

            func_update_member_schedule_alarm(class_id)

            func_save_log_data(start_date, end_date, class_id, lecture_id,
                               request.user.last_name+request.user.first_name,
                               member_name, en_dis_type, 'LR01', request)

            if en_dis_type == ON_SCHEDULE_TYPE:
                push_lecture_id.append(lecture_id)
                push_title.append(class_type_name + ' 수업 - 일정 알림')
                push_message.append(request.user.last_name + request.user.first_name + '님이 ' + str(start_date)
                                    + '~' + str(end_date) + ' 반복일정을 등록했습니다')

                context['push_lecture_id'] = push_lecture_id
                context['push_title'] = push_title
                context['push_message'] = push_message
            else:
                context['push_lecture_id'] = ''
                context['push_title'] = ''
                context['push_message'] = ''

            information = '반복일정 등록이 완료됐습니다.'

    if error is None:
        if information is None:
            return render(request, 'ajax/schedule_error_info.html', context)
        else:
            messages.info(request, information)
            return render(request, 'ajax/schedule_error_info.html', context)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


@csrf_exempt
def delete_repeat_schedule_logic(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')
    class_type_name = request.session.get('class_type_name', '')

    error = None
    schedule_data = None
    start_date = None
    end_date = None
    lecture_id = None
    en_dis_type = None
    lecture_info = None
    member_info = None
    member_name = ''
    repeat_schedule_info = None
    push_lecture_id = []
    push_title = []
    push_message = []
    group_id = None
    context = {'push_lecture_id': None, 'push_title': None, 'push_message': None}

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
        lecture_id = repeat_schedule_info.lecture_tb_id
        group_id = repeat_schedule_info.group_tb_id

    if error is None:
        if en_dis_type == ON_SCHEDULE_TYPE:
            try:
                lecture_info = LectureTb.objects.get(lecture_id=lecture_id, use=USE)
            except ObjectDoesNotExist:
                error = '회원 수강정보를 불러오지 못했습니다.'
            if error is None:
                member_info = lecture_info.member
            if error is None:
                member_name = member_info.name

    if error is None:
        # 오늘 날짜 이후의 반복일정 취소 -> 전체 취소 확인 필요 hk.kim
        schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id,
                                                  start_dt__gt=timezone.now())

    if error is None:
        try:
            with transaction.atomic():
                delete_lecture_id_list = []
                old_lecture_id = None
                for delete_schedule_info in schedule_data:
                    if delete_schedule_info.state_cd != 'PE':
                        current_lecture_id = delete_schedule_info.lecture_tb_id
                        delete_schedule_info.delete()

                        if en_dis_type == ON_SCHEDULE_TYPE:
                            if old_lecture_id != current_lecture_id:
                                old_lecture_id = current_lecture_id
                                delete_lecture_id_list.append(old_lecture_id)

                        # if en_dis_type == ON_SCHEDULE_TYPE:
                        #     error = func_refresh_lecture_count(delete_lecture_id)
                    # if error is not None:
                    #     break
                if en_dis_type == ON_SCHEDULE_TYPE:
                    for delete_lecture_id_info in delete_lecture_id_list:
                        error = func_refresh_lecture_count(delete_lecture_id_info)

                if error is None:
                    schedule_result = func_delete_repeat_schedule(repeat_schedule_id)
                    error = schedule_result['error']

                if error is not None:
                    raise ValidationError(str(error))

        except TypeError:
            error = '등록 값의 형태에 문제가 있습니다.'
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '이미 취소된 일정입니다.'
        except InternalError:
            error = '이미 취소된 일정입니다.'
        except ValidationError:
            error = '예약 가능한 횟수를 확인해주세요.'

    if error is None:

        func_update_member_schedule_alarm(class_id)

        if group_id is None or group_id == '':
            func_save_log_data(start_date, end_date, class_id, lecture_id,
                               request.user.last_name+request.user.first_name,
                               member_name, en_dis_type, 'LR02', request)

        else:
            func_save_log_data(start_date, end_date, class_id, lecture_id,
                               request.user.last_name+request.user.first_name,
                               member_name, GROUP_SCHEDULE_TYPE, 'LR02', request)

        if en_dis_type == ON_SCHEDULE_TYPE:
            push_lecture_id.append(lecture_id)
            push_title.append(class_type_name + ' 수업 - 일정 알림')
            push_message.append(request.user.last_name + request.user.first_name + '님이 ' + str(start_date)
                                + '~' + str(end_date) + ' 반복일정을 취소했습니다')

            context['push_lecture_id'] = push_lecture_id
            context['push_title'] = push_title
            context['push_message'] = push_message
        else:
            context['push_lecture_id'] = ''
            context['push_title'] = ''
            context['push_message'] = ''

        return render(request, 'ajax/schedule_error_info.html', context)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


class CheckScheduleUpdateViewAjax(LoginRequiredMixin, TemplateView):
    template_name = 'ajax/data_change_check_ajax.html'

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
                    error = '강좌 정보를 불러오지 못했습니다.'

                if error is None:
                    update_check = class_info.schedule_check

            if group.name == 'trainee':
                lecture_data = MemberLectureTb.objects.filter(member=self.request.user.id, use=USE)

                if len(lecture_data) > 0:
                    for lecture_info in lecture_data:
                        if lecture_info.lecture_tb.schedule_check == 1:
                            update_check = 1

        context['data_changed'] = update_check
        if error is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+error)
            messages.error(self.request, error)

        return context


# 일정 추가
@csrf_exempt
def add_group_schedule_logic(request):
    group_id = request.POST.get('group_id')
    schedule_date = request.POST.get('training_date')
    schedule_time = request.POST.get('training_time')
    schedule_time_duration = request.POST.get('time_duration')
    note = request.POST.get('add_memo', '')
    date = request.POST.get('date', '')
    day = request.POST.get('day', '')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    next_page = request.POST.get('next_page')

    error = None
    info_message = None
    schedule_start_datetime = None
    schedule_end_datetime = None
    group_info = None
    schedule_result = None
    group_schedule_id = None

    push_lecture_id = []
    push_title = []
    push_message = []
    class_info = None
    context = {'push_lecture_id': None, 'push_title': None, 'push_message': None}

    request.session['date'] = date
    request.session['day'] = day

    if group_id == '':
        error = '그룹을 선택해 주세요.'
    elif schedule_date == '':
        error = '날짜를 선택해 주세요.'
    elif schedule_time == '':
        error = '시작 시간을 선택해 주세요.'
    elif schedule_time_duration == '':
        error = '진행 시간을 선택해 주세요.'

    if note is None:
        note = ''

    if error is None:
        # 그룹 정보 가져오기
        try:
            group_info = GroupTb.objects.get(group_id=group_id, use=USE)
        except ObjectDoesNotExist:
            error = '그룹 정보를 불러오지 못했습니다.'

    if error is None:
        # 강사 정보 가져오기
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        error = func_check_group_schedule_enable(group_id)
    if error is None:
        # 최초 날짜 값 셋팅
        time_duration_temp = class_info.class_hour * int(schedule_time_duration)

        try:
            schedule_start_datetime = datetime.datetime.strptime(schedule_date + ' ' + schedule_time,
                                                                 '%Y-%m-%d %H:%M:%S.%f')
            schedule_end_datetime = schedule_start_datetime + datetime.timedelta(minutes=int(time_duration_temp))
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        try:
            with transaction.atomic():
                if error is None:
                    schedule_result = func_add_schedule(class_id, None, None,
                                                        group_id, None,
                                                        schedule_start_datetime, schedule_end_datetime,
                                                        note, ON_SCHEDULE_TYPE, request.user.id)
                    error = schedule_result['error']

                if error is None:
                    group_schedule_id = schedule_result['schedule_id']
                    error = func_date_check(class_id, schedule_result['schedule_id'],
                                            schedule_date, schedule_start_datetime, schedule_end_datetime)

                    if error is not None:
                        error += ' 일정이 중복되었습니다.'
                if error is not None:
                    raise InternalError()

        except TypeError:
            error = error
        except ValueError:
            error = error
        except IntegrityError:
            error = error
        except InternalError:
            error = error

    if error is None:
        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info='그룹 레슨 일정', log_how='등록',
                         log_detail=str(schedule_start_datetime) + '/' + str(schedule_end_datetime),
                         reg_dt=timezone.now(), use=USE)
        log_data.save()

    if error is None:
        not_reg_member_list = func_get_not_available_group_member_list(group_id)
        member_list = func_get_available_group_member_list(group_id)

        for member_info in not_reg_member_list:
            if info_message is None or info_message == '':
                info_message = member_info.name
            else:
                info_message = info_message + ',' + member_info.name

        for member_info in member_list:
            lecture_id = func_get_group_lecture_id(group_id, member_info.member_id)
            if lecture_id is not None and lecture_id != '':
                error_temp = func_check_group_available_member_before(class_id, group_id, group_schedule_id)

                if error_temp is None:
                    try:
                        with transaction.atomic():
                            if error_temp is None:
                                schedule_result = func_add_schedule(class_id, lecture_id, None,
                                                                    group_id, group_schedule_id,
                                                                    schedule_start_datetime, schedule_end_datetime,
                                                                    note, ON_SCHEDULE_TYPE, request.user.id)
                                error_temp = schedule_result['error']

                            if error_temp is None:
                                error_temp = func_refresh_lecture_count(lecture_id)

                            if error_temp is None:
                                error_temp = func_check_group_available_member_after(class_id, group_id,
                                                                                     group_schedule_id)

                            if error_temp is not None:
                                raise InternalError
                            else:
                                log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                                                 from_member_name=request.user.last_name + request.user.first_name,
                                                 to_member_name=member_info.name,
                                                 class_tb_id=class_id,
                                                 log_info=group_info.name + ' 그룹 레슨 일정', log_how='등록',
                                                 log_detail=str(schedule_start_datetime) + '/' + str(
                                                     schedule_end_datetime),
                                                 reg_dt=timezone.now(), use=USE)
                                log_data.save()

                                push_info_schedule_start_date = str(schedule_start_datetime).split(':')
                                push_info_schedule_end_date = str(schedule_end_datetime).split(' ')[1].split(':')
                                push_lecture_id.append(lecture_id)
                                push_title.append(class_type_name + ' 수업 - 일정 알림')
                                push_message.append(request.user.last_name + request.user.first_name + '님이 '
                                                    + push_info_schedule_start_date[0] + ':'
                                                    + push_info_schedule_start_date[1] + '~'
                                                    + push_info_schedule_end_date[0] + ':'
                                                    + push_info_schedule_end_date[1] + ' 그룹 일정을 등록했습니다')

                    except TypeError:
                        error_temp = error_temp
                    except ValueError:
                        error_temp = error_temp
                    except IntegrityError:
                        error_temp = error_temp
                    except InternalError:
                        error_temp = error_temp

            else:
                error_temp = member_info.name + ' 회원님의 예약가능한 횟수가 없습니다.'

            if error_temp is not None:
                if info_message is None or info_message == '':
                    info_message = member_info.name
                else:
                    info_message = info_message + ',' + member_info.name

    if error is None:
        if info_message is not None:
            info_message += ' 님의 일정이 등록되지 않았습니다.'
            messages.info(request, info_message)
        else:
            context['push_lecture_id'] = push_lecture_id
            context['push_title'] = push_title
            context['push_message'] = push_message
        return render(request, 'ajax/schedule_error_info.html', context)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)
        return redirect(next_page)


# 그룹 일정 취소
def delete_group_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id', '')
    date = request.POST.get('date', '')
    day = request.POST.get('day', '')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    next_page = request.POST.get('next_page')

    error = None
    schedule_info = None
    request.session['date'] = date
    request.session['day'] = day
    push_lecture_id = []
    push_title = []
    push_message = []
    group_info = None
    context = {'push_lecture_id': None, 'push_title': None, 'push_message': None}

    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보를 불러오지 못했습니다.'

    if error is None:
        group_info = schedule_info.group_tb

    if error is None:
        schedule_result = func_delete_schedule(schedule_id, request.user.id)
        error = schedule_result['error']

        if schedule_info.repeat_schedule_tb_id is not None and schedule_info.repeat_schedule_tb_id != '':
            error = func_update_repeat_schedule(schedule_info.repeat_schedule_tb_id)
        func_refresh_group_status(group_info.group_id, None, None)

    if error is None:
        member_group_schedule_data = ScheduleTb.objects.filter(group_schedule_id=schedule_id)
        for member_group_schedule_info in member_group_schedule_data:
            temp_error = None
            member_name = None
            schedule_id = member_group_schedule_info.schedule_id
            lecture_id = member_group_schedule_info.lecture_tb_id
            repeat_schedule_id = member_group_schedule_info.repeat_schedule_tb_id
            start_dt = member_group_schedule_info.start_dt
            end_dt = member_group_schedule_info.end_dt
            group_id = member_group_schedule_info.group_tb_id
            try:
                member_lecture = MemberLectureTb.objects.get(lecture_tb_id=lecture_id, use=1)
                member_name = member_lecture.member.name
            except ObjectDoesNotExist:
                temp_error = '회원 정보를 불러오지 못했습니다.'

            if temp_error is None:
                try:
                    with transaction.atomic():
                        schedule_result = func_delete_schedule(schedule_id, request.user.id)
                        temp_error = schedule_result['error']
                        if temp_error is None:
                            temp_error = func_refresh_lecture_count(lecture_id)
                        if temp_error is None:
                            if repeat_schedule_id is not None and repeat_schedule_id != '':
                                temp_error = func_update_repeat_schedule(repeat_schedule_id)

                except TypeError:
                    temp_error = '등록 값의 형태에 문제가 있습니다.'
                except ValueError:
                    temp_error = '등록 값에 문제가 있습니다.'
                except IntegrityError:
                    temp_error = '이미 취소된 일정입니다.'
                except InternalError:
                    temp_error = '이미 취소된 일정입니다.'
                except ValidationError:
                    temp_error = '예약 가능한 횟수를 확인해주세요.'

            if temp_error is None:
                func_refresh_group_status(group_id, None, None)

            if temp_error is None:
                func_save_log_data(start_dt, end_dt, class_id, lecture_id,
                                   request.user.last_name+request.user.first_name,
                                   member_name, GROUP_SCHEDULE_TYPE, 'LS02', request)

                push_info_schedule_start_date = str(start_dt).split(':')
                push_info_schedule_end_date = str(end_dt).split(' ')[1].split(':')

                push_lecture_id.append(member_group_schedule_info.lecture_tb_id)
                push_title.append(class_type_name + ' 수업 - 일정 알림')
                if group_id is not None and group_id != '':
                    push_message.append(request.user.last_name+request.user.first_name+'님이 '
                                        + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                        + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                        + ' 그룹 일정을 취소했습니다.')
                else:
                    push_message.append(request.user.last_name+request.user.first_name+'님이 '
                                        + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                        + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                        + ' 일정을 취소했습니다.')

    if error is None:

        func_update_member_schedule_alarm(class_id)
        context['push_lecture_id'] = push_lecture_id
        context['push_title'] = push_title
        context['push_message'] = push_message

        log_data = LogTb(log_type='LS03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name + ' 그룹 레슨 일정', log_how='취소',
                         log_detail=str(schedule_info.start_dt) + '/' + str(schedule_info.end_dt),
                         reg_dt=timezone.now(), use=USE)
        log_data.save()

        return render(request, 'ajax/schedule_error_info.html', context)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)
        return redirect(next_page)


# 일정 완료
def finish_group_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    schedule_info = None
    group_info = None
    push_lecture_id = []
    push_title = []
    push_message = []
    start_date = None
    end_date = None
    class_type_name = request.session.get('class_type_name', '')
    context = {'push_lecture_id': None, 'push_title': None, 'push_message': None}

    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:

        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보를 불러오지 못했습니다.'

    if error is None:
        group_info = schedule_info.group_tb

    if error is None:
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt
        if schedule_info.state_cd == 'PE':
            error = '이미 확정된 스케쥴입니다.'

    if error is None:
        try:
            with transaction.atomic():
                schedule_info.mod_dt = timezone.now()
                schedule_info.state_cd = 'PE'
                schedule_info.save()

                repeat_schedule_data = None
                if schedule_info.repeat_schedule_tb_id is not None and schedule_info.repeat_schedule_tb_id != '':
                    repeat_schedule_data = schedule_info.repeat_schedule_tb

                if repeat_schedule_data is not None:
                    if repeat_schedule_data.state_cd == 'NP':
                        repeat_schedule_data.state_cd = 'IP'
                        repeat_schedule_data.save()
                    repeat_schedule_counter = \
                        ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_data.repeat_schedule_id,
                                                  use=USE).exclude(state_cd='PE').count()
                    if repeat_schedule_counter == 0:
                        repeat_schedule_data.state_cd = 'PE'
                        repeat_schedule_data.save()

        except TypeError:
            error = '등록 값의 형태에 문제가 있습니다.'
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '예약 가능한 횟수를 확인해주세요.'
        except InternalError:
            error = '예약 가능 횟수를 확인해주세요.'

    if error is None:
        member_group_schedule_data = ScheduleTb.objects.filter(group_schedule_id=schedule_id)
        for member_group_schedule_info in member_group_schedule_data:
            lecture_repeat_schedule = None
            temp_error = None
            member_name = None
            start_date = member_group_schedule_info.start_dt
            end_date = member_group_schedule_info.end_dt
            lecture_info = member_group_schedule_info.lecture_tb
            if member_group_schedule_info.state_cd == 'PE':
                temp_error = '이미 완료된 스케쥴입니다.'

            try:
                member_lecture = MemberLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_id, use=1)
                member_name = member_lecture.member.name
            except ObjectDoesNotExist:
                temp_error = '회원 정보를 불러오지 못했습니다.'

            if temp_error is None:
                try:
                    with transaction.atomic():
                        member_group_schedule_info.mod_dt = timezone.now()
                        member_group_schedule_info.state_cd = 'PE'
                        member_group_schedule_info.save()
                        # 남은 횟수 차감
                        temp_error = func_refresh_lecture_count(lecture_info.lecture_id)
                        lecture_info.refresh_from_db()
                        if member_group_schedule_info.repeat_schedule_tb_id is not None \
                                and member_group_schedule_info.repeat_schedule_tb_id != '':
                            lecture_repeat_schedule = member_group_schedule_info.repeat_schedule_tb

                        if lecture_repeat_schedule is not None:
                            if lecture_repeat_schedule.state_cd == 'NP':
                                lecture_repeat_schedule.state_cd = 'IP'
                                lecture_repeat_schedule.save()
                            lecture_repeat_schedule_counter = \
                                ScheduleTb.objects.filter(
                                    repeat_schedule_tb_id=lecture_repeat_schedule.repeat_schedule_id,
                                    use=USE).exclude(state_cd='PE').count()
                            if lecture_repeat_schedule_counter == 0:
                                lecture_repeat_schedule.state_cd = 'PE'
                                lecture_repeat_schedule.save()

                        if lecture_info.lecture_rem_count == 0:
                            lecture_info.state_cd = 'PE'
                        lecture_info.schedule_check = 1
                        lecture_info.save()

                except TypeError:
                    temp_error = '등록 값의 형태에 문제가 있습니다.'
                except ValueError:
                    temp_error = '등록 값에 문제가 있습니다.'
                except IntegrityError:
                    temp_error = '등록 값에 문제가 있습니다.'
                except ValidationError:
                    temp_error = '예약 가능한 횟수를 확인해주세요.'
                except InternalError:
                    temp_error = '예약 가능 횟수를 확인해주세요.'

            # 그룹 스케쥴 종료 및 그룹 반복일정 종료
            if temp_error is None:
                if member_group_schedule_info.group_tb_id is not None and member_group_schedule_info.group_tb_id != '':
                    group_repeat_schedule_id = None
                    if lecture_repeat_schedule is not None and lecture_repeat_schedule != '':
                        group_repeat_schedule_id = lecture_repeat_schedule.group_schedule_id
                    func_refresh_group_status(member_group_schedule_info.group_tb_id,
                                              member_group_schedule_info.group_schedule_id,
                                              group_repeat_schedule_id)

            if temp_error is None:

                push_info_schedule_start_date = str(start_date).split(':')
                push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')
                func_save_log_data(start_date, end_date, class_id, '', request.user.last_name + request.user.first_name,
                                   member_name, GROUP_SCHEDULE_TYPE, 'LS03', request)

                push_lecture_id.append(member_group_schedule_info.lecture_tb_id)
                push_title.append(class_type_name + ' 수업 - 일정 알림')
                if member_group_schedule_info.group_tb_id is not None and member_group_schedule_info.group_tb_id != '':
                    push_message.append(push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                        + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                        + ' 그룹 일정이 완료됐습니다.')
                else:
                    push_message.append(push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                        + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                        + ' 일정이 완료됐습니다.')

    if error is None:

        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name + ' 그룹 레슨 일정', log_how='완료',
                         log_detail=str(start_date) + '/' + str(end_date),
                         reg_dt=timezone.now(), use=USE)
        log_data.save()
    if error is None:

        context['push_lecture_id'] = push_lecture_id
        context['push_title'] = push_title
        context['push_message'] = push_message
        return render(request, 'ajax/schedule_error_info.html', context)
    else:
        logger.error(
            request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)
        return redirect(next_page)


# 일정 추가
@csrf_exempt
def add_member_group_schedule_logic(request):
    member_id = request.POST.get('member_id')
    group_schedule_id = request.POST.get('schedule_id')
    note = request.POST.get('add_memo', '')
    date = request.POST.get('date', '')
    day = request.POST.get('day', '')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    next_page = request.POST.get('next_page')

    error = None
    group_info = None
    schedule_info = None
    member_info = None
    group_id = ''
    lecture_id = ''

    push_lecture_id = []
    push_title = []
    push_message = []
    context = {'push_lecture_id': None, 'push_title': None, 'push_message': None}

    request.session['date'] = date
    request.session['day'] = day

    if group_schedule_id == '':
        error = '일정을 선택해 주세요.'

    if note is None:
        note = ''

    if error is None:
        # 스케쥴 정보 가져오기
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=group_schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보를 불러오지 못했습니다.'

    if error is None:
        group_id = schedule_info.group_tb_id

    if error is None:
        # 그룹 정보 가져오기
        try:
            group_info = GroupTb.objects.get(group_id=group_id)
        except ObjectDoesNotExist:
            error = '그룹 정보를 불러오지 못했습니다.'

    if error is None:
        # 회원 정보 가져오기
        try:
            member_info = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        lecture_id = func_get_group_lecture_id(group_id, member_info.member_id)
        if lecture_id is None or lecture_id == '':
            error = '회원님의 예약 가능한 일정이 없습니다.'

    if error is None:
        group_schedule_data = ScheduleTb.objects.filter(group_schedule_id=group_schedule_id,
                                                        lecture_tb__member_id=member_id)
        if len(group_schedule_data) != 0:
            error = '회원님이 이미 그룹 일정에 포함되어있습니다.'

    if error is None:
        error = func_check_group_available_member_before(class_id, group_id, group_schedule_id)

    if error is None:
        try:
            with transaction.atomic():
                if error is None:
                    schedule_result = func_add_schedule(class_id, lecture_id, None,
                                                        group_id, group_schedule_id,
                                                        schedule_info.start_dt, schedule_info.end_dt,
                                                        note, ON_SCHEDULE_TYPE, request.user.id)
                    error = schedule_result['error']

                if error is None:
                    error = func_refresh_lecture_count(lecture_id)

                if error is None:
                    error = func_check_group_available_member_after(class_id, group_id, group_schedule_id)

                if error is not None:
                    raise InternalError()

        except TypeError:
            error = error
        except ValueError:
            error = error
        except IntegrityError:
            error = error
        except InternalError:
            error = error

    if error is None:

        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_info.name,
                         class_tb_id=class_id,
                         log_info=group_info.name+' 그룹 레슨 일정', log_how='등록',
                         log_detail=str(schedule_info.start_dt) + '/' + str(schedule_info.end_dt),
                         reg_dt=timezone.now(), use=USE)
        log_data.save()

    if error is None:
        push_info_schedule_start_date = str(schedule_info.start_dt).split(':')
        push_info_schedule_end_date = str(schedule_info.end_dt).split(' ')[1].split(':')

        push_lecture_id.append(lecture_id)
        push_title.append(class_type_name + ' 수업 - 일정 알림')
        push_message.append(request.user.last_name + request.user.first_name + '님이 '
                            + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                            + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                            + ' 그룹 일정을 등록했습니다')
        context['push_lecture_id'] = push_lecture_id
        context['push_title'] = push_title
        context['push_message'] = push_message

        return render(request, 'ajax/schedule_error_info.html', context)
    else:
        logger.error(
            request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)
        return redirect(next_page)


# 그룹 반복 일정 추가
def add_group_repeat_schedule_logic(request):
    group_id = request.POST.get('group_id', '')
    repeat_type = request.POST.get('repeat_freq')
    repeat_schedule_start_date = request.POST.get('repeat_start_date')
    repeat_schedule_end_date = request.POST.get('repeat_end_date')
    repeat_week_type = request.POST.get('repeat_day', '')
    repeat_start_time = request.POST.get('repeat_start_time')
    repeat_schedule_time_duration = request.POST.get('repeat_dur')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    error_date_message = None
    success_start_date = None
    success_end_date = None
    class_info = None
    group_info = None
    repeat_schedule_start_date_info = None
    repeat_schedule_end_date_info = None
    repeat_schedule_start_time = None
    repeat_schedule_end_time = None
    repeat_schedule_info = None
    repeat_schedule_date_list = None
    pt_schedule_input_counter = 0
    group_schedule_reg_counter = 0

    if repeat_type == '':
        error = '반복 빈도를 선택해주세요.'

    if error is None:
        if repeat_week_type == '':
            error = '반복 요일을 설정해주세요.'

    if error is None:
        if repeat_schedule_start_date == '':
            error = '반복일정 시작 날짜를 선택해 주세요.'
        if repeat_schedule_end_date == '':
            error = '반복일정 종료 날짜를 선택해 주세요.'

    if error is None:
        try:
            repeat_schedule_start_date_info = datetime.datetime.strptime(repeat_schedule_start_date, '%Y-%m-%d')
            repeat_schedule_end_date_info = datetime.datetime.strptime(repeat_schedule_end_date, '%Y-%m-%d')
        except ValueError:
            error = '날짜에서 오류가 발생했습니다.'
        except IntegrityError:
            error = '날짜에서 오류가 발생했습니다.'
        except TypeError:
            error = '날짜에서 오류가 발생했습니다.'

    if error is None:
        if (repeat_schedule_end_date_info - repeat_schedule_start_date_info) > datetime.timedelta(days=365):
            error = '1년까지만 반복일정을 등록할수 있습니다.'

    if error is None:
        if repeat_start_time == '':
            error = '시작 시간을 선택해 주세요.'
        elif repeat_schedule_time_duration == '':
            error = '진행 시간을 선택해 주세요.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        # 그룹 정보 가져오기
        try:
            group_info = GroupTb.objects.get(group_id=group_id, use=USE)
        except ObjectDoesNotExist:
            error = '그룹 정보를 불러오지 못했습니다.'

    if error is None and group_info.group_type_cd == 'NORMAL':
        group_lecture_data = GroupLectureTb.objects.filter(group_tb_id=group_id,
                                                           group_tb__use=USE,
                                                           lecture_tb__state_cd='IP',
                                                           lecture_tb__lecture_avail_count__gt=0,
                                                           lecture_tb__use=USE,
                                                           use=USE)

        if len(group_lecture_data) == 0:
            error = '그룹 회원들의 예약 가능 횟수가 없습니다.'

        for group_lecture_info in group_lecture_data:
            if group_schedule_reg_counter < group_lecture_info.lecture_tb.lecture_avail_count:
                group_schedule_reg_counter = group_lecture_info.lecture_tb.lecture_avail_count

    if error is None:
        repeat_schedule_start_time = datetime.datetime.strptime(repeat_start_time, '%H:%M:%S.%f')
        temp_time_duration = class_info.class_hour*int(repeat_schedule_time_duration)
        repeat_schedule_end_time = repeat_schedule_start_time + datetime.timedelta(minutes=int(temp_time_duration))
        repeat_schedule_start_time = repeat_schedule_start_time.time()
        repeat_schedule_end_time = repeat_schedule_end_time.time()

    if error is None:
        repeat_schedule_date_list = func_get_repeat_schedule_date_list(repeat_type, repeat_week_type,
                                                                       repeat_schedule_start_date_info,
                                                                       repeat_schedule_end_date_info)
        if len(repeat_schedule_date_list) == 0:
            error = '등록할 수 있는 일정이 없습니다.'

    if error is None:
        # 반복 일정 데이터 등록
        repeat_schedule_result = func_add_repeat_schedule(class_id, None, group_id, None, repeat_type,
                                                          repeat_week_type,
                                                          repeat_schedule_start_date, repeat_schedule_end_date,
                                                          str(repeat_schedule_start_time),
                                                          str(repeat_schedule_end_time),
                                                          repeat_schedule_time_duration, ON_SCHEDULE_TYPE,
                                                          request.user.id)
        if repeat_schedule_result['error'] is None:
            if repeat_schedule_result['schedule_info'] is None:
                request.session['repeat_schedule_id'] = ''
            else:
                request.session['repeat_schedule_id'] = repeat_schedule_result['schedule_info'].repeat_schedule_id
                repeat_schedule_info = repeat_schedule_result['schedule_info']

    if error is None:
        for repeat_schedule_date_info in repeat_schedule_date_list:

            # 그룹 스케쥴 등록 횟수 설정
            if group_info.group_type_cd == 'NORMAL':
                if group_schedule_reg_counter <= 0:
                    break

            error_date = None
            # 데이터 넣을 날짜 setting
            try:
                schedule_start_datetime = datetime.datetime.strptime(str(repeat_schedule_date_info).split(' ')[0]
                                                                     + ' ' + str(repeat_schedule_start_time),
                                                                     '%Y-%m-%d %H:%M:%S')
                schedule_end_datetime = datetime.datetime.strptime(str(repeat_schedule_date_info).split(' ')[0]
                                                                   + ' ' + str(repeat_schedule_end_time),
                                                                   '%Y-%m-%d %H:%M:%S')

            except ValueError:
                error_date = str(repeat_schedule_date_info).split(' ')[0]
            except IntegrityError:
                error_date = str(repeat_schedule_date_info).split(' ')[0]
            except TypeError:
                error_date = str(repeat_schedule_date_info).split(' ')[0]

            if error_date is None:

                try:
                    with transaction.atomic():
                        # PT 일정 추가라면 일정 추가해야할 lecture id 찾기
                        schedule_result = None
                        if error_date is None:
                            schedule_result = func_add_schedule(class_id, None,
                                                                repeat_schedule_info.repeat_schedule_id,
                                                                group_id, None,
                                                                schedule_start_datetime, schedule_end_datetime,
                                                                '', ON_SCHEDULE_TYPE, request.user.id)
                            error_date = schedule_result['error']

                        if error_date is None:
                            error_date = func_date_check(class_id, schedule_result['schedule_id'],
                                                         str(repeat_schedule_date_info).split(' ')[0],
                                                         schedule_start_datetime, schedule_end_datetime)

                        if error_date is not None:
                            raise ValidationError(str(error_date))
                        else:
                            if pt_schedule_input_counter == 0:
                                success_start_date = str(repeat_schedule_date_info).split(' ')[0]
                            success_end_date = str(repeat_schedule_date_info).split(' ')[0]
                            pt_schedule_input_counter += 1
                            if group_info.group_type_cd == 'NORMAL':
                                group_schedule_reg_counter -= 1

                        error = None

                except TypeError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0]
                except ValueError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0]
                except IntegrityError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0]
                except ValidationError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0]
                except InternalError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0]

            if error_date is not None:
                if error_date_message is None:
                    error_date_message = error_date
                else:
                    error_date_message = error_date_message + '/' + error_date

    if error is None:
        if pt_schedule_input_counter == 0:
            repeat_schedule_info.delete()
        else:
            repeat_schedule_info.start_date = success_start_date
            repeat_schedule_info.end_date = success_end_date
            repeat_schedule_info.save()

        request.session['repeat_schedule_input_counter'] = pt_schedule_input_counter

        if error_date_message is not None:
            messages.info(request, error_date_message)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    return redirect(next_page)


def add_group_repeat_schedule_confirm(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id')
    repeat_confirm = request.POST.get('repeat_confirm')
    date = request.POST.get('date', '')
    day = request.POST.get('day', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')
    class_type_name = request.session.get('class_type_name', '')
    error = None
    repeat_schedule_info = None
    group_info = None
    start_date = None
    end_date = None
    information = None
    push_lecture_id = []
    push_title = []
    push_message = []
    request.session['date'] = date
    request.session['day'] = day
    error_message = None
    context = {'push_lecture_id': None, 'push_title': None, 'push_message': None}

    if repeat_schedule_id == '':
        error = '확인할 반복일정을 선택해주세요.'
    if repeat_confirm == '':
        error = '확인할 반복일정에 대한 정보를 확인해주세요.'

    if error is None:
        try:
            repeat_schedule_info = RepeatScheduleTb.objects.get(repeat_schedule_id=repeat_schedule_id)
        except ObjectDoesNotExist:
            error = '반복 일정이 존재하지 않습니다'

    if error is None:
        group_info = repeat_schedule_info.group_tb

    if error is None:
        start_date = repeat_schedule_info.start_date
        end_date = repeat_schedule_info.end_date

    if error is None:
        if repeat_confirm == '0':
            try:
                with transaction.atomic():
                    schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id)
                    schedule_data.delete()
                    repeat_schedule_info.delete()

            except TypeError:
                error = '등록 값의 형태에 문제가 있습니다.'
            except ValueError:
                error = '등록 값에 문제가 있습니다.'
            except IntegrityError:
                error = '반복일정 취소중 요류가 발생했습니다. 다시 시도해주세요.'
            except InternalError:
                error = '반복일정 취소중 요류가 발생했습니다. 다시 시도해주세요.'
            except ValidationError:
                error = '반복일정 취소중 요류가 발생했습니다. 다시 시도해주세요.'

            if error is None:
                information = '반복일정 등록이 취소됐습니다.'

        else:
            func_update_member_schedule_alarm(class_id)

            log_data = LogTb(log_type='LR01', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             class_tb_id=class_id,
                             log_info=group_info.name + ' 그룹 반복 일정', log_how='등록',
                             log_detail=str(start_date) + '/' + str(end_date),
                             reg_dt=timezone.now(), use=USE)
            log_data.save()

            schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id, use=USE)

            if group_info.group_type_cd == 'NORMAL':
                member_list = func_get_available_group_member_list(group_info.group_id)

                for member_info in member_list:
                    lecture_id = func_get_group_lecture_id(group_info.group_id, member_info.member_id)
                    if lecture_id is not None and lecture_id != '':
                        repeat_schedule_result = func_add_repeat_schedule(repeat_schedule_info.class_tb_id,
                                                                          lecture_id,
                                                                          repeat_schedule_info.group_tb_id,
                                                                          repeat_schedule_info.repeat_schedule_id,
                                                                          repeat_schedule_info.repeat_type_cd,
                                                                          repeat_schedule_info.week_info,
                                                                          repeat_schedule_info.start_date,
                                                                          repeat_schedule_info.end_date,
                                                                          repeat_schedule_info.start_time,
                                                                          repeat_schedule_info.end_time,
                                                                          repeat_schedule_info.time_duration,
                                                                          repeat_schedule_info.en_dis_type,
                                                                          request.user.id)
                        member_repeat_schedule_info = repeat_schedule_result['schedule_info']
                        for schedule_info in schedule_data:
                            lecture_id = func_get_group_lecture_id(group_info.group_id, member_info.member_id)
                            error_temp = func_check_group_available_member_before(class_id, group_info.group_id,
                                                                                  schedule_info.schedule_id)
                            if error_temp is None:
                                try:
                                    with transaction.atomic():
                                        if error_temp is None:
                                            schedule_result = \
                                                func_add_schedule(class_id, lecture_id,
                                                                  member_repeat_schedule_info.repeat_schedule_id,
                                                                  group_info.group_id, schedule_info.schedule_id,
                                                                  schedule_info.start_dt, schedule_info.end_dt,
                                                                  '', ON_SCHEDULE_TYPE, request.user.id)
                                            error_temp = schedule_result['error']

                                        if error_temp is None:
                                            error_temp = func_refresh_lecture_count(lecture_id)

                                        if error_temp is None:
                                            error_temp = \
                                                func_check_group_available_member_after(class_id,
                                                                                        group_info.group_id,
                                                                                        schedule_info.schedule_id)

                                        if error_temp is not None:
                                            raise InternalError

                                except TypeError:
                                    error_temp = 'TypeError'
                                except ValueError:
                                    error_temp = 'ValueError'
                                except IntegrityError:
                                    error_temp = 'IntegrityError'
                                except InternalError:
                                    error_temp = 'InternalError'

                                if error_temp is not None:
                                    error_message = error_temp

                    log_data = LogTb(log_type='LR01', auth_member_id=request.user.id,
                                     from_member_name=request.user.last_name + request.user.first_name,
                                     to_member_name=member_info.name,
                                     class_tb_id=class_id,
                                     log_info='그룹 반복 일정', log_how='등록',
                                     log_detail=str(start_date) + '/' + str(end_date),
                                     reg_dt=timezone.now(), use=USE)
                    log_data.save()
                    push_lecture_id.append(lecture_id)
                    push_title.append(class_type_name + ' 수업 - 일정 알림')
                    push_message.append(request.user.last_name + request.user.first_name + '님이 ' + str(start_date)
                                        + '~' + str(end_date) + ' 그룹 반복일정을 등록했습니다')

            information = '반복일정 등록이 완료됐습니다.'

    if error is None:
        if information is None:
            return redirect(next_page)
        else:
            context['push_lecture_id'] = push_lecture_id
            context['push_title'] = push_title
            context['push_message'] = push_message
            messages.info(request, information)
            logger.info(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error_message)
            return render(request, 'ajax/schedule_error_info.html', context)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


# 그룹 반복 일정 취소
@csrf_exempt
def delete_group_repeat_schedule_logic(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id')
    date = request.POST.get('date', '')
    day = request.POST.get('day', '')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    next_page = request.POST.get('next_page')
    error = None
    schedule_data = None
    start_date = None
    end_date = None
    group_repeat_schedule_info = None
    group_info = None
    push_lecture_id = []
    push_title = []
    push_message = []
    request.session['date'] = date
    request.session['day'] = day
    context = {'push_lecture_id': None, 'push_title': None, 'push_message': None}

    if repeat_schedule_id == '':
        error = '확인할 반복일정을 선택해주세요.'

    if error is None:
        try:
            group_repeat_schedule_info = RepeatScheduleTb.objects.get(repeat_schedule_id=repeat_schedule_id)
        except ObjectDoesNotExist:
            error = '반복 일정이 존재하지 않습니다'

    if error is None:
        group_info = group_repeat_schedule_info.group_tb

    if error is None:
        start_date = group_repeat_schedule_info.start_date
        end_date = group_repeat_schedule_info.end_date

    if error is None:
        # 오늘 이후 날짜 반복일정만 제거 -> 전체 제거 -> 오늘 이후 날짜 반복일정만 제거
        schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id, start_dt__gt=timezone.now())

    if error is None:
        try:
            with transaction.atomic():
                for delete_schedule_info in schedule_data:
                    end_schedule_counter = ScheduleTb.objects.filter(group_schedule_id=delete_schedule_info.schedule_id,
                                                                     state_cd='PE', use=USE).count()
                    if end_schedule_counter == 0:
                        schedule_result = func_delete_schedule(delete_schedule_info.schedule_id, request.user.id)
                        error = schedule_result['error']

                schedule_result = func_delete_repeat_schedule(group_repeat_schedule_info.repeat_schedule_id)
                error = schedule_result['error']

                if error is not None:
                    raise ValidationError(str(error))

        except TypeError:
            error = '등록 값의 형태에 문제가 있습니다.'
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '이미 취소된 일정입니다'
        except InternalError:
            error = '이미 취소된 일정입니다'
        except ValidationError:
            error = error

    if error is None:
        repeat_schedule_list = RepeatScheduleTb.objects.filter(group_schedule_id=repeat_schedule_id)

        for repeat_schedule_info in repeat_schedule_list:
            error_temp = None
            start_date = repeat_schedule_info.start_date
            end_date = repeat_schedule_info.end_date
            lecture_id = repeat_schedule_info.lecture_tb_id
            member_name = None
            member_repeat_schedule_id = repeat_schedule_info.repeat_schedule_id
            lecture_info = None

            try:
                lecture_info = LectureTb.objects.get(lecture_id=lecture_id, use=USE)
            except ObjectDoesNotExist:
                error_temp = '회원 수강정보를 불러오지 못했습니다.'
            if error_temp is None:
                member_name = lecture_info.member.name

            if error_temp is None:
                # 오늘 날짜 이후의 반복일정 취소 -> 전체 취소 확인 필요 hk.kim
                schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=member_repeat_schedule_id,
                                                          start_dt__gt=timezone.now())

            if error_temp is None:
                try:
                    with transaction.atomic():
                        delete_lecture_id_list = []
                        old_lecture_id = None
                        for delete_schedule_info in schedule_data:
                            if delete_schedule_info.state_cd != 'PE':
                                current_lecture_id = delete_schedule_info.lecture_tb_id
                                delete_schedule_info.delete()

                                if old_lecture_id != current_lecture_id:
                                    old_lecture_id = current_lecture_id
                                    delete_lecture_id_list.append(old_lecture_id)

                        for delete_lecture_id_info in delete_lecture_id_list:
                            error_temp = func_refresh_lecture_count(delete_lecture_id_info)

                        if error_temp is None:
                            schedule_result = func_delete_repeat_schedule(member_repeat_schedule_id)
                            error_temp = schedule_result['error']

                        if error_temp is not None:
                            raise ValidationError(str(error_temp))

                except TypeError:
                    error_temp = '등록 값의 형태에 문제가 있습니다.'
                except ValueError:
                    error_temp = '등록 값에 문제가 있습니다.'
                except IntegrityError:
                    error_temp = '이미 취소된 일정입니다.'
                except InternalError:
                    error_temp = '이미 취소된 일정입니다.'
                except ValidationError:
                    error_temp = '예약 가능한 횟수를 확인해주세요.'

            if error_temp is None:
                func_save_log_data(start_date, end_date, class_id, lecture_id,
                                   request.user.last_name + request.user.first_name,
                                   member_name, GROUP_SCHEDULE_TYPE, 'LR02', request)

                push_lecture_id.append(lecture_id)
                push_title.append(class_type_name + ' 수업 - 일정 알림')
                push_message.append(request.user.last_name + request.user.first_name + '님이 ' + str(start_date)
                                    + '~' + str(end_date) + ' 그룹 반복일정을 취소했습니다')

    if error is None:

        func_update_member_schedule_alarm(class_id)

        log_data = LogTb(log_type='LR02', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name + ' 그룹 반복 일정', log_how='취소',
                         log_detail=str(start_date) + '/' + str(end_date),
                         reg_dt=timezone.now(), use=USE)
        log_data.save()
        context['push_lecture_id'] = push_lecture_id
        context['push_title'] = push_title
        context['push_message'] = push_message

        return render(request, 'ajax/schedule_error_info.html', context)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


def delete_schedule_logic_func(schedule_id, lecture_id, repeat_schedule_id, en_dis_type, member_id):

    error = None

    if error is None:
        try:
            with transaction.atomic():
                schedule_result = func_delete_schedule(schedule_id, member_id)
                error = schedule_result['error']
                if en_dis_type == ON_SCHEDULE_TYPE:
                    error = func_refresh_lecture_count(lecture_id)

                    if repeat_schedule_id is not None and repeat_schedule_id != '':
                        error = func_update_repeat_schedule(repeat_schedule_id)

        except TypeError:
            error = '등록 값의 형태에 문제가 있습니다.'
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '이미 취소된 일정입니다.'
        except InternalError:
            error = '이미 취소된 일정입니다.'
        except ValidationError:
            error = '예약 가능한 횟수를 확인해주세요.'

    return error


@csrf_exempt
def send_push_to_trainer_logic(request):
    class_id = request.session.get('class_id', '')
    title = request.POST.get('title', '')
    message = request.POST.get('message', '')
    next_page = request.POST.get('next_page')

    error = None

    if class_id == '':
        error = 'push를 전송하는중 오류가 발생했습니다.'

    if error is None:
        error = func_send_push_trainee(class_id, title, message)

    if error is None:
        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


@csrf_exempt
def send_push_to_trainee_logic(request):
    lecture_id = request.POST.get('lecture_id', '')
    title = request.POST.get('title', '')
    message = request.POST.get('message', '')
    next_page = request.POST.get('next_page')

    error = None
    if lecture_id == '':
        error = 'push를 전송하는중 오류가 발생했습니다.'

    if error is None:
        error = func_send_push_trainer(lecture_id, title, message)

    if error is None:
        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)
