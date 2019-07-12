import datetime

import boto3
import base64

from botocore.exceptions import ClientError

import logging
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError, InternalError, transaction
from django.db.models import Q
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views import View
from django.views.generic import TemplateView
from django.core.files.base import ContentFile

# Create your views here.
from configs import settings
from configs.const import ON_SCHEDULE_TYPE, USE, AUTO_FINISH_OFF, AUTO_FINISH_ON, TO_TRAINEE_LESSON_ALARM_ON, \
    TO_TRAINEE_LESSON_ALARM_OFF, SCHEDULE_DUPLICATION_DISABLE, AUTO_ABSENCE_ON, SCHEDULE_DUPLICATION_ENABLE, \
    OFF_SCHEDULE_TYPE

from login.models import LogTb, MemberTb
from trainer.models import GroupTb, ClassTb
from trainee.models import LectureTb, MemberLectureTb
from .models import ScheduleTb, RepeatScheduleTb

from .functions import func_get_lecture_id, func_add_schedule, func_refresh_lecture_count, func_date_check, \
    func_get_group_lecture_id, func_check_group_available_member_before, func_check_group_available_member_after, \
    func_send_push_trainer, func_send_push_trainee, func_delete_schedule, func_delete_repeat_schedule, \
    func_update_repeat_schedule, func_get_repeat_schedule_date_list, func_add_repeat_schedule, func_refresh_group_status

logger = logging.getLogger(__name__)


class IndexView(TemplateView):
    template_name = 'index_schedule.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        return context


# 일정 추가
def add_schedule_logic(request):
    member_id = request.POST.get('member_id', '')
    schedule_date = request.POST.get('start_date')
    schedule_time = request.POST.get('start_time')
    schedule_end_date = request.POST.get('end_date')
    schedule_end_time = request.POST.get('end_time')
    en_dis_type = request.POST.get('en_dis_type', OFF_SCHEDULE_TYPE)
    note = request.POST.get('add_memo', '')
    duplication_enable_flag = request.POST.get('duplication_enable_flag', SCHEDULE_DUPLICATION_ENABLE)

    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_schedule_auto_finish = request.session.get('setting_schedule_auto_finish', AUTO_FINISH_OFF)
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)
    error = None
    schedule_start_datetime = None
    schedule_end_datetime = None
    lecture_id = ''
    member_info = None
    push_lecture_id = []
    push_title = []
    push_message = []
    context = {'push_lecture_id': '', 'push_title': '', 'push_message': ''}

    if en_dis_type == ON_SCHEDULE_TYPE:
        if member_id == '':
            error = '회원을 선택해 주세요.'

    if schedule_date == schedule_end_date:
        if schedule_time == schedule_end_time:
            error = '일정을 다시 선택해주세요.'

    if error is None:
        # 날짜 값 셋팅
        end_time_check = 0
        if schedule_end_time == '24:00':
            schedule_end_time = '23:59'
            end_time_check = 1

        try:
            schedule_start_datetime = datetime.datetime.strptime(schedule_date + ' ' + schedule_time,
                                                                 '%Y-%m-%d %H:%M')
            schedule_end_datetime = datetime.datetime.strptime(schedule_end_date + ' ' + schedule_end_time,
                                                               '%Y-%m-%d %H:%M')
            if end_time_check == 1:
                schedule_end_datetime = schedule_end_datetime + datetime.timedelta(minutes=1)

        except ValueError:
            error = '날짜 선택에 문제가 있습니다.[0]'
        except IntegrityError:
            error = '날짜 선택에 문제가 있습니다.[1]'
        except TypeError:
            error = '날짜 선택에 문제가 있습니다.[2]'

    if error is None:
        # 회원 정보 가져오기
        if en_dis_type == ON_SCHEDULE_TYPE:
            try:
                member_info = MemberTb.objects.get(member_id=member_id)
            except ObjectDoesNotExist:
                error = '오류가 발생했습니다.'

    if error is None:
        if en_dis_type == ON_SCHEDULE_TYPE:
            lecture_id = func_get_lecture_id(class_id, member_id)
            if lecture_id is None or lecture_id == '':
                error = '등록할 수 있는 일정이 없습니다.'

    if error is None:
        try:
            with transaction.atomic():
                state_cd = 'NP'
                permission_state_cd = 'AP'
                if timezone.now() > schedule_end_datetime:
                    if setting_schedule_auto_finish == AUTO_FINISH_ON:
                        state_cd = 'PE'
                    elif setting_schedule_auto_finish == AUTO_ABSENCE_ON:
                        state_cd = 'PC'

                schedule_result = func_add_schedule(class_id, lecture_id, None, None, None, schedule_start_datetime,
                                                    schedule_end_datetime, note, en_dis_type, request.user.id,
                                                    permission_state_cd, state_cd, duplication_enable_flag)
                error = schedule_result['error']

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

        push_info_schedule_start_date = str(schedule_start_datetime).split(':')
        push_info_schedule_end_date = str(schedule_end_datetime).split(' ')[1].split(':')

        if en_dis_type == ON_SCHEDULE_TYPE:
            member_name = member_info.name

            log_data = LogTb(log_type='LS01', auth_member_id=request.user.id,
                             from_member_name=request.user.first_name,
                             to_member_name=member_name,
                             class_tb_id=class_id, lecture_tb_id=lecture_id,
                             log_info='개인 레슨', log_how='예약 완료',
                             log_detail=str(schedule_start_datetime) + '/' + str(schedule_end_datetime), use=USE)
            log_data.save()

            if setting_to_trainee_lesson_alarm == TO_TRAINEE_LESSON_ALARM_ON:
                push_lecture_id.append(lecture_id)
                push_title.append(class_type_name + ' - 예약 완료')
                push_message.append(push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                    + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1] +
                                    ' [개인 레슨] 수업이 예약 완료 되었습니다.')

                context['push_lecture_id'] = push_lecture_id
                context['push_title'] = push_title
                context['push_message'] = push_message
    else:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    return render(request, 'ajax/schedule_error_info.html', context)


# 일정 취소
def delete_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id', '')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)
    push_lecture_id = []
    push_title = []
    push_message = []
    schedule_info = None
    error = None

    context = {'push_lecture_id': '', 'push_title': '', 'push_message': ''}

    if schedule_id == '':
        error = '일정 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.select_related('lecture_tb__member',
                                                              'group_tb').get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.'

    if error is None:

        try:
            with transaction.atomic():
                schedule_result = func_delete_schedule(class_id, schedule_id, request.user.id)
                error = schedule_result['error']

                if error is not None:
                    raise InternalError()

        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '이미 취소된 일정입니다.'
        except InternalError:
            error = error
        except ValidationError:
            error = '남은 횟수를 확인해주세요.'

    if error is None:
        start_dt = str(schedule_info.start_dt)
        end_dt = str(schedule_info.end_dt)
        lecture_info = schedule_info.lecture_tb
        log_info = '[개인 레슨] 수업'

        if schedule_info.group_tb is not None:
            log_info = '['+schedule_info.group_tb.name+'] 수업'

        push_info_schedule_start_date = start_dt.split(':')
        push_info_schedule_end_date = end_dt.split(' ')[1].split(':')

        if schedule_info.en_dis_type == ON_SCHEDULE_TYPE:

            log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                             from_member_name=request.user.first_name,
                             to_member_name=schedule_info.lecture_tb.member.name,
                             class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                             log_info=log_info, log_how='예약 취소',
                             log_detail=start_dt + '/' + end_dt, use=USE)
            log_data.save()

            if setting_to_trainee_lesson_alarm == TO_TRAINEE_LESSON_ALARM_ON:
                push_lecture_id.append(lecture_info.lecture_id)
                push_title.append(class_type_name + ' - 예약 취소')
                push_info = push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1] \
                            + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1] \
                            + log_info + '이 예약 취소 되었습니다.'
                push_message.append(push_info)

                context['push_lecture_id'] = push_lecture_id
                context['push_title'] = push_title
                context['push_message'] = push_message

    else:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
    return render(request, 'ajax/schedule_error_info.html', context)


# 일정 완료
def update_schedule_state_cd_logic(request):
    schedule_id = request.POST.get('schedule_id')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    schedule_state_cd = request.POST.get('state_cd', 'PE')
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)

    schedule_state_cd_name = '완료'
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
    context = {'push_lecture_id': '', 'push_title': '', 'push_message': ''}

    if schedule_id == '':
        error = '일정을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.select_related('group_tb').get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.'
        if schedule_state_cd == 'PE':
            schedule_state_cd_name = '출석'
        elif schedule_state_cd == 'PC':
            schedule_state_cd_name = '결석'

    if error is None:
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt
        if schedule_info.lecture_tb is not None and schedule_info.lecture_tb != '':
            lecture_info = schedule_info.lecture_tb
            if schedule_info.lecture_tb.member is not None and schedule_info.lecture_tb.member != '':
                member_name = schedule_info.lecture_tb.member.name
        else:
            member_name = ''

    if error is None:
        try:
            with transaction.atomic():
                schedule_info.state_cd = schedule_state_cd
                schedule_info.save()
                # 남은 횟수 차감
                error = func_refresh_lecture_count(class_id, lecture_info.lecture_id)

                lecture_repeat_schedule_data = None
                if schedule_info.repeat_schedule_tb is not None and schedule_info.repeat_schedule_tb != '':
                    lecture_repeat_schedule_data = schedule_info.repeat_schedule_tb
                    if lecture_repeat_schedule_data.state_cd == 'NP':
                        lecture_repeat_schedule_data.state_cd = 'IP'
                        lecture_repeat_schedule_data.save()
                    lecture_repeat_schedule_counter =\
                        ScheduleTb.objects.filter(repeat_schedule_tb_id=lecture_repeat_schedule_data.repeat_schedule_id,
                                                  use=USE).exclude(Q(state_cd='PE') | Q(state_cd='PC')).count()
                    if lecture_repeat_schedule_counter == 0:
                        lecture_repeat_schedule_data.state_cd = 'PE'
                        lecture_repeat_schedule_data.save()

        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '예약 가능 횟수를 확인해주세요.'
        except InternalError:
            error = '예약 가능 횟수를 확인해주세요.'
    # 그룹 스케쥴 종료 및 그룹 반복 일정 종료
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

        push_lecture_id.append(schedule_info.lecture_tb_id)
        push_title.append(class_type_name + ' - '+schedule_state_cd_name)
        log_info = '개인 레슨'
        push_info = push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1] \
                    + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1] \
                    + ' [개인 레슨] 수업이 '+schedule_state_cd_name+' 처리 되었습니다.'

        if schedule_info.group_tb_id is not None and schedule_info.group_tb_id != '':
            log_info = schedule_info.group_tb.name + ' 수업'
            push_info = push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1] \
                        + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1] \
                        + ' ['+schedule_info.group_tb.name\
                        + '] 수업이 '+schedule_state_cd_name+' 처리 되었습니다.'

        log_data = LogTb(log_type='LS03', auth_member_id=request.user.id,
                         from_member_name=request.user.first_name,
                         to_member_name=member_name,
                         class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info=log_info, log_how=schedule_state_cd_name,
                         log_detail=str(start_date) + '/' + str(end_date), use=USE)
        log_data.save()
        push_message.append(push_info)

        if setting_to_trainee_lesson_alarm == TO_TRAINEE_LESSON_ALARM_ON:
            context['push_lecture_id'] = push_lecture_id
            context['push_title'] = push_title
            context['push_message'] = push_message

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
    return render(request, 'ajax/schedule_error_info.html', context)


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
        s3.meta.client.head_bucket(Bucket=getattr(settings, "PTERS_AWS_S3_BUCKET_NAME", ''))
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
def update_memo_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id')
    note = request.POST.get('add_memo', '')
    error = None
    schedule_info = None
    if schedule_id == '':
        error = '일정을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.'

    if error is None:
        group_schedule_data = ScheduleTb.objects.filter(group_schedule_id=schedule_id)
        if len(group_schedule_data) > 0:
            group_schedule_data.update(note=note)

        schedule_info.note = note
        schedule_info.save()

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
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
    repeat_end_time = request.POST.get('repeat_end_time')
    repeat_schedule_time_duration = request.POST.get('repeat_dur', '')
    en_dis_type = request.POST.get('en_dis_type', ON_SCHEDULE_TYPE)
    class_id = request.session.get('class_id', '')
    # next_page = request.POST.get('next_page')

    duplication_enable_flag = request.POST.get('duplication_enable_flag', SCHEDULE_DUPLICATION_DISABLE)
    # setting_schedule_auto_finish = request.session.get('setting_schedule_auto_finish', AUTO_FINISH_OFF)

    week_info = ['(일)', '(월)', '(화)', '(수)', '(목)', '(금)', '(토)']
    context = {}
    error = None
    lecture_id = None
    repeat_schedule_start_date_info = None
    repeat_schedule_end_date_info = None
    repeat_schedule_info = None
    pt_schedule_input_counter = 0
    repeat_schedule_date_list = []
    success_start_date = None
    success_end_date = None
    end_time_check = 0
    repeat_duplication_date_data = []
    repeat_success_date_data = []
    schedule_check = 0

    if duplication_enable_flag is None or duplication_enable_flag == '':
        duplication_enable_flag = SCHEDULE_DUPLICATION_DISABLE
    if repeat_type == '':
        error = '매주/격주를 선택해주세요.'

    if error is None:
        if repeat_week_type == '':
            error = '요일을 선택해주세요.'

    if error is None:
        if repeat_schedule_start_date == '':
            error = '시작 날짜를 선택해 주세요.'
        if repeat_schedule_end_date == '':
            error = '종료 날짜를 선택해 주세요.'

    if error is None:
        if repeat_schedule_start_date == repeat_schedule_end_date:
            if repeat_start_time == repeat_end_time:
                error = '일정을 다시 선택해주세요.'

    if error is None:
        try:
            repeat_schedule_start_date_info = datetime.datetime.strptime(repeat_schedule_start_date, '%Y-%m-%d')
            repeat_schedule_end_date_info = datetime.datetime.strptime(repeat_schedule_end_date, '%Y-%m-%d')
        except ValueError:
            error = '날짜 오류가 발생했습니다.'
        except IntegrityError:
            error = '날짜 오류가 발생했습니다.'
        except TypeError:
            error = '날짜 오류가 발생했습니다.'

    if error is None:
        if (repeat_schedule_end_date_info - repeat_schedule_start_date_info) > datetime.timedelta(days=365):
            error = '1년까지만 반복 일정을 등록할수 있습니다.'

    if error is None:
        if repeat_start_time == '':
            error = '시작 시각을 선택해 주세요.'
        elif repeat_end_time == '':
            error = '종료 시각을 선택해 주세요.'

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
                                                          repeat_start_time,
                                                          repeat_end_time,
                                                          repeat_schedule_time_duration, en_dis_type,
                                                          request.user.id)
        if repeat_schedule_result['error'] is None:
            if repeat_schedule_result['schedule_info'] is None:
                context['repeat_schedule_id'] = ''
            else:
                context['repeat_schedule_id'] = repeat_schedule_result['schedule_info'].repeat_schedule_id
                repeat_schedule_info = repeat_schedule_result['schedule_info']

    if error is None:
        for repeat_schedule_date_info in repeat_schedule_date_list:
            error_date = None
            # 데이터 넣을 날짜 setting
            if repeat_end_time == '24:00':
                repeat_end_time = '23:59'
                end_time_check = 1
            repeat_schedule_info_date = str(repeat_schedule_date_info).split(' ')[0]
            try:
                schedule_start_datetime = datetime.datetime.strptime(repeat_schedule_info_date
                                                                     + ' ' + repeat_start_time,
                                                                     '%Y-%m-%d %H:%M')
                schedule_end_datetime = datetime.datetime.strptime(repeat_schedule_info_date
                                                                   + ' ' + repeat_end_time,
                                                                   '%Y-%m-%d %H:%M')

            except ValueError:
                error_date = repeat_schedule_info_date \
                             + week_info[int(repeat_schedule_date_info.strftime('%w'))]
            except IntegrityError:
                error_date = repeat_schedule_info_date \
                             + week_info[int(repeat_schedule_date_info.strftime('%w'))]
            except TypeError:
                error_date = repeat_schedule_info_date \
                             + week_info[int(repeat_schedule_date_info.strftime('%w'))]
            if end_time_check == 1:
                schedule_end_datetime = schedule_end_datetime + datetime.timedelta(minutes=1)

            if error_date is None:
                try:
                    with transaction.atomic():
                        schedule_result = None
                        # PT 일정 추가라면 일정 추가해야할 lecture id 찾기
                        lecture_id = None
                        if en_dis_type == ON_SCHEDULE_TYPE:
                            lecture_id = func_get_lecture_id(class_id, member_id)
                            if lecture_id is not None and lecture_id != '':
                                schedule_check = 1
                        else:
                            schedule_check = 1
                        if error_date is None:
                            if schedule_check == 1:

                                state_cd = 'NP'
                                permission_state_cd = 'AP'
                                schedule_result = func_add_schedule(class_id, lecture_id,
                                                                    repeat_schedule_info.repeat_schedule_id,
                                                                    None, None,
                                                                    schedule_start_datetime, schedule_end_datetime, '',
                                                                    en_dis_type, request.user.id,
                                                                    permission_state_cd,
                                                                    state_cd, duplication_enable_flag)

                                if schedule_result['error'] is not None:
                                    error_date = str(repeat_schedule_date_info).split(' ')[0]

                        if error_date is None:
                            if lecture_id is not None and lecture_id != '':
                                error_temp = func_refresh_lecture_count(class_id, lecture_id)
                                if error_temp is not None:
                                    error_date = str(repeat_schedule_date_info).split(' ')[0]

                        if error_date is None:
                            if schedule_check == 1:
                                error_date = func_date_check(class_id, schedule_result['schedule_id'],
                                                             str(repeat_schedule_date_info).split(' ')[0],
                                                             schedule_start_datetime, schedule_end_datetime,
                                                             duplication_enable_flag)

                        if error_date is not None:
                            raise ValidationError(str(error_date))
                        else:
                            if schedule_check == 1:
                                if pt_schedule_input_counter == 0:
                                    success_start_date = str(repeat_schedule_date_info).split(' ')[0]
                                success_end_date = str(repeat_schedule_date_info).split(' ')[0]
                                pt_schedule_input_counter += 1

                except TypeError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0] \
                                 + week_info[int(repeat_schedule_date_info.strftime('%w'))]
                except ValueError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0] \
                                 + week_info[int(repeat_schedule_date_info.strftime('%w'))]
                except IntegrityError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0] \
                                 + week_info[int(repeat_schedule_date_info.strftime('%w'))]
                except ValidationError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0] \
                                 + week_info[int(repeat_schedule_date_info.strftime('%w'))]
                except InternalError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0] \
                                 + week_info[int(repeat_schedule_date_info.strftime('%w'))]
            if error_date is not None:
                repeat_duplication_date_data.append(error_date)
            else:
                if schedule_check == 1:
                    repeat_success_date_data.append(str(repeat_schedule_date_info).split(' ')[0]
                                                    + week_info[int(repeat_schedule_date_info.strftime('%w'))])

    if error is None:
        if pt_schedule_input_counter == 0:
            repeat_schedule_info.delete()
        else:
            repeat_schedule_info.start_date = success_start_date
            repeat_schedule_info.end_date = success_end_date
            repeat_schedule_info.save()
            context['repeat_start_date'] = success_start_date
            context['repeat_end_date'] = success_end_date
        context['repeat_schedule_input_counter'] = pt_schedule_input_counter
        context['repeat_duplication_date_data'] = repeat_duplication_date_data
        context['repeat_success_date_data'] = repeat_success_date_data
    else:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    return render(request, 'ajax/repeat_schedule_result_ajax.html', context)


def add_repeat_schedule_confirm(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id')
    repeat_confirm = request.POST.get('repeat_confirm')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)

    error = None
    repeat_schedule_data = None
    start_date = None
    end_date = None
    en_dis_type = None
    member_name = ''
    information = None
    lecture_id = ''
    push_lecture_id = []
    push_title = []
    push_message = []
    context = {'push_lecture_id': '', 'push_title': '', 'push_message': ''}

    if repeat_schedule_id == '':
        error = '확인할 반복 일정을 선택해주세요.'
    if repeat_confirm == '':
        error = '확인할 반복 일정에 대한 정보를 확인해주세요.'

    if error is None:
        try:
            repeat_schedule_data = RepeatScheduleTb.objects.get(repeat_schedule_id=repeat_schedule_id)
        except ObjectDoesNotExist:
            error = '반복 일정을 불러오지 못했습니다.'

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
                        if delete_schedule_info.state_cd != 'PE' and delete_schedule_info.state_cd != 'PC':
                            delete_lecture_id = delete_schedule_info.lecture_tb_id
                            delete_schedule_info.delete()
                            if en_dis_type == ON_SCHEDULE_TYPE:
                                error = func_refresh_lecture_count(class_id, delete_lecture_id)
                        if error is not None:
                            break
                    repeat_schedule_data.delete()

            except TypeError:
                error = '등록 값에 문제가 있습니다.'
            except ValueError:
                error = '등록 값에 문제가 있습니다.'
            except IntegrityError:
                error = '반복 일정 취소중 요류가 발생했습니다. 다시 시도해주세요.'
            except InternalError:
                error = '반복 일정 취소중 요류가 발생했습니다. 다시 시도해주세요.'
            except ValidationError:
                error = '반복 일정 취소중 요류가 발생했습니다. 다시 시도해주세요.'
            if error is None:
                information = '반복 일정 등록이 취소됐습니다.'

        else:

            # func_update_member_schedule_alarm(class_id)
            log_data = LogTb(log_type='LR01', auth_member_id=request.user.id,
                             from_member_name=request.user.first_name,
                             to_member_name=member_name,
                             class_tb_id=class_id,
                             lecture_tb_id=lecture_id,
                             log_info='1:1 레슨 반복 일정',
                             log_how='반복 일정 등록',
                             log_detail=str(start_date) + '/' + str(end_date), use=USE)
            log_data.save()

            if en_dis_type == ON_SCHEDULE_TYPE and setting_to_trainee_lesson_alarm == TO_TRAINEE_LESSON_ALARM_ON:
                push_lecture_id.append(lecture_id)
                push_title.append(class_type_name + ' - 수업 알림')
                push_message.append(request.user.first_name + '님이 ' + str(start_date)
                                    + '~' + str(end_date) + ' [1:1 레슨] 반복 일정을 등록했습니다')

                context['push_lecture_id'] = push_lecture_id
                context['push_title'] = push_title
                context['push_message'] = push_message

            information = '반복 일정 등록이 완료됐습니다.'

    if error is None:
        if information is not None:
            messages.info(request, information)
    else:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
    return render(request, 'ajax/schedule_error_info.html', context)


def delete_repeat_schedule_logic(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id', '')
    class_id = request.session.get('class_id', '')
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
    group_name = ''
    context = {'push_lecture_id': '', 'push_title': '', 'push_message': ''}
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)

    if repeat_schedule_id == '':
        error = '확인할 반복 일정을 선택해주세요.'

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
        if group_id is not None and group_id != '':
            # group_type_cd_name = repeat_schedule_info.get_group_type_cd_name()
            group_name = repeat_schedule_info.get_group_name()

    if error is None:
        if en_dis_type == ON_SCHEDULE_TYPE:
            try:
                lecture_info = LectureTb.objects.get(lecture_id=lecture_id, use=USE)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'
            if error is None:
                member_info = lecture_info.member
            if error is None:
                member_name = member_info.name

    if error is None:
        # 오늘 날짜 이후의 반복 일정 취소 -> 전체 취소 확인 필요 hk.kim
        schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id,
                                                  start_dt__gt=timezone.now())

    if error is None:
        try:
            with transaction.atomic():
                delete_lecture_id_list = []
                old_lecture_id = None
                for delete_schedule_info in schedule_data:
                    if delete_schedule_info.state_cd != 'PE' and delete_schedule_info.state_cd != 'PC':
                        current_lecture_id = delete_schedule_info.lecture_tb_id
                        delete_schedule_info.delete()

                        if en_dis_type == ON_SCHEDULE_TYPE:
                            if old_lecture_id != current_lecture_id:
                                old_lecture_id = current_lecture_id
                                delete_lecture_id_list.append(old_lecture_id)

                if en_dis_type == ON_SCHEDULE_TYPE:
                    for delete_lecture_id_info in delete_lecture_id_list:
                        error = func_refresh_lecture_count(class_id, delete_lecture_id_info)

                if error is None:
                    schedule_result = func_delete_repeat_schedule(repeat_schedule_id)
                    error = schedule_result['error']

                if error is not None:
                    raise ValidationError(str(error))

        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '취소된 일정입니다.'
        except InternalError:
            error = '취소된 일정입니다.'
        except ValidationError:
            error = '예약 가능 횟수를 확인해주세요.'

    if error is None:

        # func_update_member_schedule_alarm(class_id)
        log_info = '개인 레슨 반복 일정'
        if group_id is not None and group_id != '':
            log_info = group_name + ' 반복 일정'

        log_data = LogTb(log_type='LR02', auth_member_id=request.user.id,
                         from_member_name=request.user.first_name,
                         to_member_name=member_name,
                         class_tb_id=class_id,
                         lecture_tb_id=lecture_id,
                         log_info=log_info,
                         log_how='반복 일정 취소',
                         log_detail=str(start_date) + '/' + str(end_date), use=USE)
        log_data.save()

        if en_dis_type == ON_SCHEDULE_TYPE and setting_to_trainee_lesson_alarm == TO_TRAINEE_LESSON_ALARM_ON:
            push_lecture_id.append(lecture_id)
            push_title.append(class_type_name + ' - 수업 알림')
            push_message_info = request.user.first_name + '님이 ' + str(start_date)\
                                + '~' + str(end_date) + ' [개인 레슨] 반복 일정을 취소했습니다'
            if group_id is not None and group_id == '':
                push_message_info = request.user.first_name + '님이 ' + str(start_date)\
                                    + '~' + str(end_date)\
                                    + ' [' + group_name+'] 반복 일정을 취소했습니다'
            push_message.append(push_message_info)

            context['push_lecture_id'] = push_lecture_id
            context['push_title'] = push_title
            context['push_message'] = push_message

    else:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
    return render(request, 'ajax/schedule_error_info.html', context)


class CheckScheduleUpdateViewAjax(LoginRequiredMixin, View):
    template_name = 'ajax/data_change_check_ajax.html'

    def get(self, request):
        context = {}
        class_id = request.session.get('class_id', '')
        error = None
        class_info = None
        user_for_group = None
        group = None

        if class_id is None or class_id == '':
            error = '오류가 발생했습니다.'

        if error is None:
            try:
                user_for_group = User.objects.get(id=request.user.id)
            except ObjectDoesNotExist:
                error = '오류가 발생했습니다.'

        if error is None:
            try:
                group = user_for_group.groups.get(user=request.user.id)
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'

        # update_check 0 : data update 없음
        # update_check 1 : data update 있음
        update_check = 0
        if error is None:
            if group.name == 'trainer':
                # 강사 정보 가져오기
                try:
                    class_info = ClassTb.objects.get(class_id=class_id)
                except ObjectDoesNotExist:
                    error = '오류가 발생했습니다.'

                if error is None:
                    update_check = class_info.schedule_check

            if group.name == 'trainee':
                lecture_data = MemberLectureTb.objects.filter(member=request.user.id, use=USE)

                if len(lecture_data) > 0:
                    for lecture_info in lecture_data:
                        if lecture_info.lecture_tb.schedule_check == 1:
                            update_check = 1

        context['data_changed'] = update_check
        if error is not None:
            logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
            messages.error(request, error)

        return render(request, self.template_name, context)


# 일정 추가
def add_group_schedule_logic(request):
    group_id = request.POST.get('group_id')
    schedule_date = request.POST.get('training_date')
    schedule_time = request.POST.get('training_time')
    schedule_end_date = request.POST.get('training_end_date')
    schedule_end_time = request.POST.get('training_end_time')
    note = request.POST.get('add_memo', '')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_schedule_auto_finish = request.session.get('setting_schedule_auto_finish', AUTO_FINISH_OFF)
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)
    duplication_enable_flag = request.POST.get('duplication_enable_flag', SCHEDULE_DUPLICATION_DISABLE)
    group_member_ids = request.POST.get('group_member_ids', '')

    if group_member_ids is not None and group_member_ids != '':
        group_member_ids = group_member_ids.split('/')

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
    package_tb_list = []
    context = {'push_lecture_id': '', 'push_title': '', 'push_message': ''}

    if duplication_enable_flag is None or duplication_enable_flag == '':
        duplication_enable_flag = SCHEDULE_DUPLICATION_DISABLE
    if group_id == '':
        error = '오류가 발생했습니다.'
    elif schedule_date == '':
        error = '날짜를 선택해 주세요.'
    elif schedule_end_date == '':
        error = '날짜를 선택해 주세요.'
    elif schedule_time == '':
        error = '시작 시각을 선택해 주세요.'
    elif schedule_end_time == '':
        error = '종료 시각을 선택해 주세요.'
    if error is None:
        if schedule_date == schedule_end_date:
            if schedule_time == schedule_end_time:
                error = '일정을 다시 선택해주세요.'

    if note is None:
        note = ''

    if error is None:
        # 그룹 정보 가져오기
        try:
            group_info = GroupTb.objects.get(group_id=group_id, use=USE)
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'
    if error is None:
        if len(group_member_ids) > group_info.member_num:
            error = '그룹 정원보다 등록하려는 회원수가 많습니다.'

    if error is None:

        end_time_check = 0
        if schedule_end_time == '24:00':
            schedule_end_time = '23:59'
            end_time_check = 1

        try:
            schedule_start_datetime = datetime.datetime.strptime(schedule_date + ' ' + schedule_time,
                                                                 '%Y-%m-%d %H:%M')
            schedule_end_datetime = datetime.datetime.strptime(schedule_end_date + ' ' + schedule_end_time,
                                                               '%Y-%m-%d %H:%M')
            if end_time_check == 1:
                schedule_end_datetime = schedule_end_datetime + datetime.timedelta(minutes=1)
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except TypeError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:
        try:
            with transaction.atomic():
                if error is None:
                    state_cd = 'NP'
                    permission_state_cd = 'AP'
                    if timezone.now() > schedule_end_datetime:
                        if setting_schedule_auto_finish == AUTO_FINISH_ON:
                            state_cd = 'PE'
                        elif setting_schedule_auto_finish == AUTO_ABSENCE_ON:
                            state_cd = 'PC'
                    schedule_result = func_add_schedule(class_id, None, None,
                                                        group_id, None,
                                                        schedule_start_datetime, schedule_end_datetime,
                                                        note, ON_SCHEDULE_TYPE, request.user.id,
                                                        permission_state_cd,
                                                        state_cd)
                    error = schedule_result['error']

                if error is None:
                    group_schedule_id = schedule_result['schedule_id']
                    error = func_date_check(class_id, schedule_result['schedule_id'],
                                            schedule_date, schedule_start_datetime, schedule_end_datetime,
                                            duplication_enable_flag)

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
                         from_member_name=request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name+' 일정', log_how='등록',
                         log_detail=str(schedule_start_datetime) + '/' + str(schedule_end_datetime), use=USE)
        log_data.save()

    if error is None:
        for group_member_id in group_member_ids:
            error_temp = None
            try:
                member_info = MemberTb.objects.get(member_id=group_member_id)
            except ObjectDoesNotExist:
                member_info = None

            if member_info is not None:
                lecture_id = func_get_group_lecture_id(group_id, member_info.member_id)
                if lecture_id is not None and lecture_id != '':
                    try:
                        with transaction.atomic():

                            if error_temp is None:

                                state_cd = 'NP'
                                permission_state_cd = 'AP'
                                if timezone.now() > schedule_end_datetime:
                                    if setting_schedule_auto_finish == AUTO_FINISH_ON:
                                        state_cd = 'PE'
                                    elif setting_schedule_auto_finish == AUTO_ABSENCE_ON:
                                        state_cd = 'PC'
                                schedule_result = func_add_schedule(class_id, lecture_id, None,
                                                                    group_id, group_schedule_id,
                                                                    schedule_start_datetime, schedule_end_datetime,
                                                                    note, ON_SCHEDULE_TYPE, request.user.id,
                                                                    permission_state_cd,
                                                                    state_cd)
                                error_temp = schedule_result['error']

                            if error_temp is None:
                                error_temp = func_refresh_lecture_count(class_id, lecture_id)

                            if error_temp is not None:
                                raise InternalError
                            else:
                                try:
                                    lecture_info = LectureTb.objects.select_related(
                                        'package_tb').get(lecture_id=lecture_id)
                                except ObjectDoesNotExist:
                                    lecture_info = None

                                if lecture_info is not None:
                                    if lecture_info.state_cd == 'PE':
                                        package_tb_list.append(lecture_info.package_tb)
                                log_data = LogTb(
                                    log_type='LS02', auth_member_id=request.user.id,
                                    from_member_name=request.user.first_name, to_member_name=member_info.name,
                                    class_tb_id=class_id, lecture_tb_id=lecture_id,
                                    log_info=group_info.name + ' 수업', log_how='예약 완료',
                                    log_detail=str(schedule_start_datetime) + '/' + str(schedule_end_datetime), use=USE)
                                log_data.save()

                                push_info_schedule_start_date = str(schedule_start_datetime).split(':')
                                push_info_schedule_end_date = str(schedule_end_datetime).split(' ')[1].split(':')
                                push_lecture_id.append(lecture_id)
                                push_title.append(class_type_name + ' - 수업 알림')
                                push_message.append(request.user.first_name + '님이 '
                                                    + push_info_schedule_start_date[0] + ':'
                                                    + push_info_schedule_start_date[1] + '~'
                                                    + push_info_schedule_end_date[0] + ':'
                                                    + push_info_schedule_end_date[1]
                                                    + ' [' + group_info.name + '] 수업을 등록했습니다')

                    except TypeError:
                        error_temp = '오류가 발생했습니다. [1]'
                    except ValueError:
                        error_temp = '오류가 발생했습니다. [2]'
                    except IntegrityError:
                        error_temp = '오류가 발생했습니다. [3]'
                    except InternalError:
                        error_temp = error_temp

                else:
                    error_temp = member_info.name + '님의 예약가능한 횟수가 없습니다.'

                if error_temp is not None:
                    if info_message is None or info_message == '':
                        info_message = member_info.name
                    else:
                        info_message = info_message + ',' + member_info.name

    if error is None:
        if info_message is not None:
            info_message += '님의 일정이 등록되지 않았습니다.'
            context['group_schedule_info'] = info_message
        else:
            if setting_to_trainee_lesson_alarm == TO_TRAINEE_LESSON_ALARM_ON:
                context['push_lecture_id'] = push_lecture_id
                context['push_title'] = push_title
                context['push_message'] = push_message
    else:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)
    return render(request, 'ajax/schedule_error_info.html', context)


# 그룹 일정 취소
def delete_group_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id', '')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)

    error = None
    schedule_info = None
    push_lecture_id = []
    push_title = []
    push_message = []
    group_info = None
    context = {'push_lecture_id': '', 'push_title': '', 'push_message': ''}

    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.'

    if error is None:
        group_info = schedule_info.group_tb

    if error is None:
        schedule_result = func_delete_schedule(class_id, schedule_id, request.user.id)
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
            # lecture_info = member_group_schedule_info.lecture_tb
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
                        schedule_result = func_delete_schedule(class_id, schedule_id, request.user.id)
                        temp_error = schedule_result['error']
                        if temp_error is None:
                            # temp_error = func_refresh_lecture_count_for_delete(class_id, lecture_id, auth_member_num)
                            temp_error = func_refresh_lecture_count(class_id, lecture_id)
                        if temp_error is None:
                            if repeat_schedule_id is not None and repeat_schedule_id != '':
                                temp_error = func_update_repeat_schedule(repeat_schedule_id)

                except TypeError:
                    temp_error = '등록 값에 문제가 있습니다.'
                except ValueError:
                    temp_error = '등록 값에 문제가 있습니다.'
                except IntegrityError:
                    temp_error = '취소된 일정입니다.'
                except InternalError:
                    temp_error = '취소된 일정입니다.'
                except ValidationError:
                    temp_error = '예약 가능 횟수를 확인해주세요.'

            if temp_error is None:
                push_info_schedule_start_date = str(start_dt).split(':')
                push_info_schedule_end_date = str(end_dt).split(' ')[1].split(':')

                push_lecture_id.append(member_group_schedule_info.lecture_tb_id)
                push_title.append(class_type_name + ' - 수업 알림')
                if group_id is not None and group_id != '':
                    log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                                     from_member_name=request.user.first_name,
                                     to_member_name=member_name,
                                     class_tb_id=class_id, lecture_tb_id=member_group_schedule_info.lecture_tb_id,
                                     log_info=member_group_schedule_info.get_group_name() + ' 수업',
                                     log_how='예약 취소',
                                     log_detail=str(start_dt) + '/' + str(end_dt), use=USE)
                    log_data.save()
                    push_message.append(request.user.first_name+'님이 '
                                        + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                        + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                        + ' ['+group_info.name
                                        + '] 수업을 예약 취소했습니다.')
                else:
                    push_message.append(request.user.first_name+'님이 '
                                        + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                        + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                        + ' [1:1 레슨] 수업을 예약 취소했습니다.')

    if error is None:

        # func_update_member_schedule_alarm(class_id)
        if setting_to_trainee_lesson_alarm == TO_TRAINEE_LESSON_ALARM_ON:
            context['push_lecture_id'] = push_lecture_id
            context['push_title'] = push_title
            context['push_message'] = push_message

        log_data = LogTb(log_type='LS03', auth_member_id=request.user.id,
                         from_member_name=request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name + ' 수업',
                         log_how='예약 취소',
                         log_detail=str(schedule_info.start_dt) + '/' + str(schedule_info.end_dt), use=USE)
        log_data.save()

    else:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)
    return render(request, 'ajax/schedule_error_info.html', context)


# 일정 완료
def finish_group_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id')
    class_id = request.session.get('class_id', '')
    schedule_state_cd = request.POST.get('schedule_state_cd', 'PE')
    schedule_state_cd_name = '완료'
    error = None
    schedule_info = None
    group_info = None
    push_lecture_id = []
    push_title = []
    push_message = []
    start_date = None
    end_date = None
    class_type_name = request.session.get('class_type_name', '')
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)

    context = {'push_lecture_id': '', 'push_title': '', 'push_message': ''}

    if schedule_id == '':
        error = '일정을 선택하세요.'

    if error is None:

        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.'
        if schedule_state_cd == 'PE':
            schedule_state_cd_name = '완료'
        elif schedule_state_cd == 'PC':
            schedule_state_cd_name = '결석 처리'

    if error is None:
        group_info = schedule_info.group_tb

    if error is None:
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt
        if schedule_info.state_cd == 'PE' or schedule_info.state_cd == 'PC':
            error = '완료된 스케쥴입니다.'

    if error is None:
        try:
            with transaction.atomic():
                schedule_info.state_cd = schedule_state_cd
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
                                                  use=USE).exclude(Q(state_cd='PE') | Q(state_cd='PC')).count()
                    if repeat_schedule_counter == 0:
                        repeat_schedule_data.state_cd = 'PE'
                        repeat_schedule_data.save()

        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '등록 값에 문제가 있습니다.'
        except ValidationError:
            error = '예약 가능 횟수를 확인해주세요.'
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
            if member_group_schedule_info.state_cd == 'PE' or member_group_schedule_info.state_cd == 'PC':
                temp_error = '완료된 스케쥴입니다.'

            try:
                member_lecture = MemberLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_id, use=1)
                member_name = member_lecture.member.name
            except ObjectDoesNotExist:
                temp_error = '회원 정보를 불러오지 못했습니다.'

            if temp_error is None:
                try:
                    with transaction.atomic():
                        member_group_schedule_info.state_cd = schedule_state_cd
                        member_group_schedule_info.save()
                        # 남은 횟수 차감
                        temp_error = func_refresh_lecture_count(class_id, lecture_info.lecture_id)
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
                                    use=USE).exclude(Q(state_cd='PE') | Q(state_cd='PC')).count()
                            if lecture_repeat_schedule_counter == 0:
                                lecture_repeat_schedule.state_cd = 'PE'
                                lecture_repeat_schedule.save()

                        if lecture_info.lecture_rem_count == 0:
                            lecture_info.state_cd = 'PE'
                        lecture_info.schedule_check = 1
                        lecture_info.save()

                except TypeError:
                    temp_error = '등록 값에 문제가 있습니다.'
                except ValueError:
                    temp_error = '등록 값에 문제가 있습니다.'
                except IntegrityError:
                    temp_error = '등록 값에 문제가 있습니다.'
                except ValidationError:
                    temp_error = '예약 가능 횟수를 확인해주세요.'
                except InternalError:
                    temp_error = '예약 가능 횟수를 확인해주세요.'

            # 그룹 스케쥴 종료 및 그룹 반복 일정 종료
            if temp_error is None:
                temp_error = func_refresh_lecture_count(class_id, lecture_info.lecture_id)
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
                push_lecture_id.append(member_group_schedule_info.lecture_tb_id)
                push_title.append(class_type_name + ' - 수업 알림')
                if member_group_schedule_info.group_tb_id is not None and member_group_schedule_info.group_tb_id != '':

                    log_data = LogTb(log_type='LS03', auth_member_id=request.user.id,
                                     from_member_name=request.user.first_name,
                                     to_member_name=member_name,
                                     class_tb_id=class_id, lecture_tb_id=member_group_schedule_info.lecture_tb_id,
                                     log_info=member_group_schedule_info.get_group_name() + ' 수업',
                                     log_how=schedule_state_cd_name,
                                     log_detail=str(start_date) + '/' + str(end_date), use=USE)
                    log_data.save()
                    push_message.append(push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                        + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                        + ' [' + schedule_info.get_group_name() + '] 수업을 '
                                        + schedule_state_cd_name + ' 했습니다.')

    if error is None:

        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                         from_member_name=request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name + ' 수업',
                         log_how=schedule_state_cd_name,
                         log_detail=str(start_date) + '/' + str(end_date), use=USE)
        log_data.save()
    if error is None:

        if setting_to_trainee_lesson_alarm == TO_TRAINEE_LESSON_ALARM_ON:
            context['push_lecture_id'] = push_lecture_id
            context['push_title'] = push_title
            context['push_message'] = push_message
    else:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)
    return render(request, 'ajax/schedule_error_info.html', context)


# 일정 추가
def add_member_group_schedule_logic(request):
    member_id = request.POST.get('member_id')
    group_schedule_id = request.POST.get('schedule_id')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_schedule_auto_finish = request.session.get('setting_schedule_auto_finish', AUTO_FINISH_OFF)
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)
    error = None
    group_info = None
    schedule_info = None
    member_info = None
    group_id = ''
    lecture_id = ''

    push_lecture_id = []
    push_title = []
    push_message = []
    context = {'push_lecture_id': '', 'push_title': '', 'push_message': ''}

    if group_schedule_id == '':
        error = '일정을 선택해 주세요.'

    # if note is None:
    #     note = ''

    if error is None:
        # 스케쥴 정보 가져오기
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=group_schedule_id)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.'

    if error is None:
        group_id = schedule_info.group_tb_id

    if error is None:
        # 그룹 정보 가져오기
        try:
            group_info = GroupTb.objects.get(group_id=group_id)
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'

    if error is None:
        # 회원 정보 가져오기
        try:
            member_info = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        lecture_id = func_get_group_lecture_id(group_id, member_info.member_id)
        if lecture_id is None or lecture_id == '':
            error = '예약 가능한 횟수가 없습니다.'

    if error is None:
        group_schedule_data = ScheduleTb.objects.filter(group_schedule_id=group_schedule_id,
                                                        lecture_tb__member_id=member_id, use=USE)
        if len(group_schedule_data) != 0:
            error = '일정에 포함되어있는 회원입니다.'

    if error is None:
        error = func_check_group_available_member_before(class_id, group_id, group_schedule_id)

    if error is None:
        try:
            with transaction.atomic():
                if error is None:

                    state_cd = schedule_info.state_cd
                    permission_state_cd = 'AP'

                    if timezone.now() > schedule_info.end_dt:
                        if setting_schedule_auto_finish == AUTO_FINISH_ON:
                            state_cd = 'PE'
                        elif setting_schedule_auto_finish == AUTO_ABSENCE_ON:
                            state_cd = 'PC'
                    schedule_result = func_add_schedule(class_id, lecture_id, None,
                                                        group_id, group_schedule_id,
                                                        schedule_info.start_dt, schedule_info.end_dt,
                                                        schedule_info.note, ON_SCHEDULE_TYPE,
                                                        request.user.id, permission_state_cd, state_cd)
                    error = schedule_result['error']

                if error is None:
                    error = func_refresh_lecture_count(class_id, lecture_id)

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
                         from_member_name=request.user.first_name,
                         to_member_name=member_info.name,
                         class_tb_id=class_id,
                         lecture_tb_id=lecture_id,
                         log_info=group_info.name+' 수업', log_how='예약 완료',
                         log_detail=str(schedule_info.start_dt) + '/' + str(schedule_info.end_dt), use=USE)
        log_data.save()

    if error is None:
        if setting_to_trainee_lesson_alarm == TO_TRAINEE_LESSON_ALARM_ON:
            push_info_schedule_start_date = str(schedule_info.start_dt).split(':')
            push_info_schedule_end_date = str(schedule_info.end_dt).split(' ')[1].split(':')

            push_lecture_id.append(lecture_id)
            push_title.append(class_type_name + ' - 수업 알림')
            push_message.append(request.user.first_name + '님이 '
                                + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                + ' ['+group_info.name+'] 수업을 예약 완료했습니다')
            context['push_lecture_id'] = push_lecture_id
            context['push_title'] = push_title
            context['push_message'] = push_message

    else:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)
    return render(request, 'ajax/schedule_error_info.html', context)


# 일정 추가
def add_other_member_group_schedule_logic(request):
    member_id = request.POST.get('member_id')
    lecture_id = request.POST.get('lecture_id')
    group_schedule_id = request.POST.get('schedule_id')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_schedule_auto_finish = request.session.get('setting_schedule_auto_finish', AUTO_FINISH_OFF)
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)

    error = None
    group_info = None
    schedule_info = None
    member_info = None
    lecture_info = None
    group_id = ''

    push_lecture_id = []
    push_title = []
    push_message = []
    context = {'push_lecture_id': '', 'push_title': '', 'push_message': ''}

    if group_schedule_id == '':
        error = '일정을 선택해 주세요.'

    if error is None:
        # 스케쥴 정보 가져오기
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=group_schedule_id)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.'

    if error is None:
        group_id = schedule_info.group_tb_id

    if error is None:
        # 그룹 정보 가져오기
        try:
            group_info = GroupTb.objects.get(group_id=group_id)
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'

    if error is None:
        # 회원 정보 가져오기
        try:
            member_info = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        # 회원 정보 가져오기
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
            if lecture_info.lecture_avail_count == 0:
                error = '예약 가능 횟수가 없습니다.'
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        group_schedule_data = ScheduleTb.objects.filter(group_schedule_id=group_schedule_id,
                                                        lecture_tb__member_id=member_id, use=USE)
        if len(group_schedule_data) != 0:
            error = '일정에 포함되어있는 회원입니다.'

    if error is None:
        error = func_check_group_available_member_before(class_id, group_id, group_schedule_id)

    if error is None:
        try:
            with transaction.atomic():
                if error is None:

                    state_cd = schedule_info.state_cd
                    permission_state_cd = 'AP'
                    if timezone.now() > schedule_info.end_dt:
                        if setting_schedule_auto_finish == AUTO_FINISH_ON:
                            state_cd = 'PE'
                        elif setting_schedule_auto_finish == AUTO_ABSENCE_ON:
                            state_cd = 'PC'
                    schedule_result = func_add_schedule(class_id, lecture_id, None,
                                                        group_id, group_schedule_id,
                                                        schedule_info.start_dt, schedule_info.end_dt,
                                                        schedule_info.note, ON_SCHEDULE_TYPE,
                                                        request.user.id, permission_state_cd, state_cd)
                    error = schedule_result['error']

                if error is None:
                    error = func_refresh_lecture_count(class_id, lecture_id)

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
                         from_member_name=request.user.first_name,
                         to_member_name=member_info.name,
                         class_tb_id=class_id,
                         lecture_tb_id=lecture_info.lecture_id,
                         log_info=group_info.name + ' 수업',
                         log_how='예약 완료',
                         log_detail=str(schedule_info.start_dt) + '/' + str(schedule_info.end_dt), use=USE)
        log_data.save()

    if error is None:
        if setting_to_trainee_lesson_alarm == TO_TRAINEE_LESSON_ALARM_ON:
            push_info_schedule_start_date = str(schedule_info.start_dt).split(':')
            push_info_schedule_end_date = str(schedule_info.end_dt).split(' ')[1].split(':')

            push_lecture_id.append(lecture_id)
            push_title.append(class_type_name + ' - 수업 알림')
            push_message.append(request.user.first_name + '님이 '
                                + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                + ' [' + group_info.name + '] 수업을 예약 완료했습니다')
            context['push_lecture_id'] = push_lecture_id
            context['push_title'] = push_title
            context['push_message'] = push_message
    else:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return render(request, 'ajax/schedule_error_info.html', context)


# 그룹 반복 일정 추가
def add_group_repeat_schedule_logic(request):
    group_id = request.POST.get('group_id', '')
    repeat_type = request.POST.get('repeat_freq')
    repeat_schedule_start_date = request.POST.get('repeat_start_date')
    repeat_schedule_end_date = request.POST.get('repeat_end_date')
    repeat_week_type = request.POST.get('repeat_day', '')
    repeat_start_time = request.POST.get('repeat_start_time')
    repeat_end_time = request.POST.get('repeat_end_time')
    repeat_schedule_time_duration = request.POST.get('repeat_dur', '')
    class_id = request.session.get('class_id', '')
    # next_page = request.POST.get('next_page')

    duplication_enable_flag = request.POST.get('duplication_enable_flag', SCHEDULE_DUPLICATION_DISABLE)
    # setting_schedule_auto_finish = request.session.get('setting_schedule_auto_finish', AUTO_FINISH_OFF)
    group_member_ids = request.POST.get('group_member_ids', '')
    if group_member_ids is not None and group_member_ids != '':
        group_member_ids = group_member_ids.split('/')
    week_info = ['(일)', '(월)', '(화)', '(수)', '(목)', '(금)', '(토)']
    context = {}
    error = None
    success_start_date = None
    success_end_date = None
    # class_info = None
    group_info = None
    repeat_schedule_start_date_info = None
    repeat_schedule_end_date_info = None
    # repeat_schedule_start_time = None
    # repeat_schedule_end_time = None
    repeat_schedule_info = None
    repeat_schedule_date_list = None
    pt_schedule_input_counter = 0
    # group_schedule_reg_counter = 0
    end_time_check = 0
    repeat_duplication_date_data = []
    repeat_success_date_data = []

    if duplication_enable_flag is None or duplication_enable_flag == '':
        duplication_enable_flag = SCHEDULE_DUPLICATION_DISABLE
    if repeat_type == '':
        error = '빈도를 선택해주세요.'

    if error is None:
        if repeat_week_type == '':
            error = '요일을 설정해주세요.'

    if error is None:
        if repeat_schedule_start_date == '':
            error = '시작 날짜를 선택해 주세요.'
        if repeat_schedule_end_date == '':
            error = '종료 날짜를 선택해 주세요.'

    if error is None:
        if repeat_schedule_start_date == repeat_schedule_end_date:
            if repeat_start_time == repeat_end_time:
                error = '일정을 다시 선택해주세요.'

    if error is None:
        try:
            repeat_schedule_start_date_info = datetime.datetime.strptime(repeat_schedule_start_date, '%Y-%m-%d')
            repeat_schedule_end_date_info = datetime.datetime.strptime(repeat_schedule_end_date, '%Y-%m-%d')
        except ValueError:
            error = '날짜 오류가 발생했습니다.'
        except IntegrityError:
            error = '날짜 오류가 발생했습니다.'
        except TypeError:
            error = '날짜 오류가 발생했습니다.'

    if error is None:
        if (repeat_schedule_end_date_info - repeat_schedule_start_date_info) > datetime.timedelta(days=365):
            error = '1년까지만 반복 일정을 등록할수 있습니다.'

    if error is None:
        if repeat_start_time == '':
            error = '시작 시각을 선택해 주세요.'
        elif repeat_end_time == '':
            error = '종료 시각을 선택해 주세요.'
        # elif repeat_schedule_time_duration == '':
        #     error = '진행 시간을 선택해 주세요.'

    if error is None:
        # 그룹 정보 가져오기
        try:
            group_info = GroupTb.objects.get(group_id=group_id, use=USE)
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'

    if error is None:
        if len(group_member_ids) > group_info.member_num:
            error = '그룹 정원보다 등록하려는 회원수가 많습니다.'
    # if error is None and group_info.group_type_cd == 'NORMAL':
    # if error is None:
    #     group_lecture_data = GroupLectureTb.objects.filter(group_tb_id=group_id,
    #                                                        group_tb__use=USE,
    #                                                        lecture_tb__state_cd='IP',
    #                                                        lecture_tb__lecture_avail_count__gt=0,
    #                                                        lecture_tb__use=USE,
    #                                                        use=USE)

        # if len(group_lecture_data) == 0:
        #     error = '그룹 회원들의 예약 가능 횟수가 없습니다.'

        # for group_lecture_info in group_lecture_data:
        #     if group_schedule_reg_counter < group_lecture_info.lecture_tb.lecture_avail_count:
        #         group_schedule_reg_counter = group_lecture_info.lecture_tb.lecture_avail_count

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
                                                          repeat_start_time,
                                                          repeat_end_time,
                                                          repeat_schedule_time_duration, ON_SCHEDULE_TYPE,
                                                          request.user.id)
        if repeat_schedule_result['error'] is None:
            if repeat_schedule_result['schedule_info'] is None:
                context['repeat_schedule_id'] = ''
                # request.session['repeat_schedule_id'] = ''
            else:
                context['repeat_schedule_id'] = repeat_schedule_result['schedule_info'].repeat_schedule_id
                # request.session['repeat_schedule_id'] = repeat_schedule_result['schedule_info'].repeat_schedule_id
                repeat_schedule_info = repeat_schedule_result['schedule_info']

    if error is None:
        for repeat_schedule_date_info in repeat_schedule_date_list:

            # 그룹 스케쥴 등록 횟수 설정
            # if group_info.group_type_cd == 'NORMAL':
            # if group_schedule_reg_counter <= 0:
            #     break

            error_date = None
            # 데이터 넣을 날짜 setting
            if repeat_end_time == '24:00':
                repeat_end_time = '23:59'
                end_time_check = 1

            try:
                schedule_start_datetime = datetime.datetime.strptime(str(repeat_schedule_date_info).split(' ')[0]
                                                                     + ' ' + repeat_start_time,
                                                                     '%Y-%m-%d %H:%M')
                schedule_end_datetime = datetime.datetime.strptime(str(repeat_schedule_date_info).split(' ')[0]
                                                                   + ' ' + repeat_end_time,
                                                                   '%Y-%m-%d %H:%M')
            except ValueError:
                error_date = str(repeat_schedule_date_info).split(' ')[0] \
                             + week_info[int(repeat_schedule_date_info.strftime('%w'))]
            except IntegrityError:
                error_date = str(repeat_schedule_date_info).split(' ')[0] \
                             + week_info[int(repeat_schedule_date_info.strftime('%w'))]
            except TypeError:
                error_date = str(repeat_schedule_date_info).split(' ')[0] \
                             + week_info[int(repeat_schedule_date_info.strftime('%w'))]

            if end_time_check == 1:
                schedule_end_datetime = schedule_end_datetime + datetime.timedelta(minutes=1)

            if error_date is None:

                try:
                    with transaction.atomic():
                        # PT 일정 추가라면 일정 추가해야할 lecture id 찾기
                        schedule_result = None
                        if error_date is None:

                            state_cd = 'NP'
                            permission_state_cd = 'AP'
                            # if setting_schedule_auto_finish == AUTO_FINISH_ON \
                            #         and timezone.now() > schedule_end_datetime:
                            #     state_cd = 'PE'
                            schedule_result = func_add_schedule(class_id, None,
                                                                repeat_schedule_info.repeat_schedule_id,
                                                                group_id, None,
                                                                schedule_start_datetime, schedule_end_datetime,
                                                                '', ON_SCHEDULE_TYPE, request.user.id,
                                                                permission_state_cd,
                                                                state_cd)
                            error_date = schedule_result['error']

                        if error_date is None:
                            error_date = func_date_check(class_id, schedule_result['schedule_id'],
                                                         str(repeat_schedule_date_info).split(' ')[0],
                                                         schedule_start_datetime, schedule_end_datetime,
                                                         duplication_enable_flag)

                        if error_date is not None:
                            raise ValidationError(str(error_date))
                        else:
                            if pt_schedule_input_counter == 0:
                                success_start_date = str(repeat_schedule_date_info).split(' ')[0]
                            success_end_date = str(repeat_schedule_date_info).split(' ')[0]
                            pt_schedule_input_counter += 1
                            # if group_info.group_type_cd == 'NORMAL':
                            # group_schedule_reg_counter -= 1

                        error = None

                except TypeError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0] \
                                 + week_info[int(repeat_schedule_date_info.strftime('%w'))]
                except ValueError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0] \
                                 + week_info[int(repeat_schedule_date_info.strftime('%w'))]
                except IntegrityError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0] \
                                 + week_info[int(repeat_schedule_date_info.strftime('%w'))]
                except ValidationError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0] \
                                 + week_info[int(repeat_schedule_date_info.strftime('%w'))]
                except InternalError:
                    error_date = str(repeat_schedule_date_info).split(' ')[0] \
                                 + week_info[int(repeat_schedule_date_info.strftime('%w'))]

            if error_date is not None:
                repeat_duplication_date_data.append(error_date)
            else:
                repeat_success_date_data.append(str(repeat_schedule_date_info).split(' ')[0]
                                                + week_info[int(repeat_schedule_date_info.strftime('%w'))])

    if error is None:
        if pt_schedule_input_counter == 0:
            repeat_schedule_info.delete()
        else:
            repeat_schedule_info.start_date = success_start_date
            repeat_schedule_info.end_date = success_end_date
            repeat_schedule_info.save()
            context['repeat_start_date'] = success_start_date
            context['repeat_end_date'] = success_end_date
        context['repeat_schedule_input_counter'] = pt_schedule_input_counter
        context['repeat_duplication_date_data'] = repeat_duplication_date_data
        context['repeat_success_date_data'] = repeat_success_date_data
    else:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    return render(request, 'ajax/repeat_schedule_result_ajax.html', context)


def add_group_repeat_schedule_confirm(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id')
    repeat_confirm = request.POST.get('repeat_confirm')
    class_id = request.session.get('class_id', '')
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
    # error_message = None
    context = {'push_lecture_id': '', 'push_title': '', 'push_message': ''}
    # setting_schedule_auto_finish = request.session.get('setting_schedule_auto_finish', AUTO_FINISH_OFF)
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)

    group_member_ids = request.POST.get('group_member_ids', '')
    if group_member_ids is not None and group_member_ids != '':
        group_member_ids = group_member_ids.split('/')
    if repeat_schedule_id == '':
        error = '확인할 반복 일정을 선택해주세요.'
    if repeat_confirm == '':
        error = '확인할 반복 일정에 대한 정보를 확인해주세요.'

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
                error = '등록 값에 문제가 있습니다.'
            except ValueError:
                error = '등록 값에 문제가 있습니다.'
            except IntegrityError:
                error = '오류가 발생했습니다. 다시 시도해주세요.'
            except InternalError:
                error = '오류가 발생했습니다. 다시 시도해주세요.'
            except ValidationError:
                error = '오류가 발생했습니다. 다시 시도해주세요.'

            if error is None:
                information = '반복 일정 등록이 취소됐습니다.'

        else:
            # func_update_member_schedule_alarm(class_id)

            log_data = LogTb(log_type='LR01', auth_member_id=request.user.id,
                             from_member_name=request.user.first_name,
                             class_tb_id=class_id,
                             log_info=group_info.name + ' 반복 일정',
                             log_how='반복 일정 등록',
                             log_detail=str(start_date) + '/' + str(end_date), use=USE)
            log_data.save()

            schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id, use=USE)

            # if group_info.group_type_cd == 'NORMAL':
            # member_list = func_get_available_group_member_list(group_info.group_id)

            for group_member_id in group_member_ids:
                try:
                    member_info = MemberTb.objects.get(member_id=group_member_id)
                except ObjectDoesNotExist:
                    member_info = None
                if member_info is not None:
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
                            if lecture_id is not None and lecture_id != '':
                                error_temp = func_check_group_available_member_before(class_id, group_info.group_id,
                                                                                      schedule_info.schedule_id)
                                if error_temp is None:
                                    try:
                                        with transaction.atomic():
                                            if error_temp is None:

                                                state_cd = 'NP'
                                                permission_state_cd = 'AP'
                                                # if setting_schedule_auto_finish == AUTO_FINISH_ON \
                                                #         and timezone.now() > schedule_info.end_dt:
                                                #     state_cd = 'PE'
                                                schedule_result = \
                                                    func_add_schedule(class_id, lecture_id,
                                                                      member_repeat_schedule_info.repeat_schedule_id,
                                                                      group_info.group_id, schedule_info.schedule_id,
                                                                      schedule_info.start_dt, schedule_info.end_dt,
                                                                      '', ON_SCHEDULE_TYPE, request.user.id,
                                                                      permission_state_cd,
                                                                      state_cd)
                                                error_temp = schedule_result['error']

                                            if error_temp is None:
                                                error_temp = func_refresh_lecture_count(class_id, lecture_id)

                                            if error_temp is None:
                                                error_temp = \
                                                    func_check_group_available_member_after(class_id,
                                                                                            group_info.group_id,
                                                                                            schedule_info.schedule_id)

                                            if error_temp is not None:
                                                raise InternalError

                                    except TypeError:
                                        error = 'TypeError'
                                    except ValueError:
                                        error = 'ValueError'
                                    except IntegrityError:
                                        error = 'IntegrityError'
                                    except InternalError:
                                        error = 'InternalError'

                                    # if error_temp is not None:
                                    #     error_message = error_temp
                    if lecture_id is not None and lecture_id != '':
                        log_data = LogTb(log_type='LR01', auth_member_id=request.user.id,
                                         from_member_name=request.user.first_name,
                                         to_member_name=member_info.name,
                                         class_tb_id=class_id,
                                         lecture_tb_id=lecture_id,
                                         log_info=group_info.name + ' 반복 일정',
                                         log_how='반복 일정 등록',
                                         log_detail=str(start_date) + '/' + str(end_date), use=USE)
                        log_data.save()
                        push_lecture_id.append(lecture_id)
                        push_title.append(class_type_name + ' - 수업 알림')
                        push_message.append(request.user.first_name + '님이 ' + str(start_date) + '~' + str(end_date)
                                            + ' ['+group_info.name + '] 반복 일정을 등록했습니다')

            information = '반복 일정 등록이 완료됐습니다.'
    if error is None:
        if information is not None:
            if setting_to_trainee_lesson_alarm == TO_TRAINEE_LESSON_ALARM_ON:
                context['push_lecture_id'] = push_lecture_id
                context['push_title'] = push_title
                context['push_message'] = push_message

            messages.info(request, information)
    else:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
    return render(request, 'ajax/schedule_error_info.html', context)


# 그룹 반복 일정 취소
def delete_group_repeat_schedule_logic(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    error = None
    schedule_data = None
    start_date = None
    end_date = None
    group_repeat_schedule_info = None
    group_info = None
    push_lecture_id = []
    push_title = []
    push_message = []
    context = {'push_lecture_id': '', 'push_title': '', 'push_message': ''}
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)

    if repeat_schedule_id == '':
        error = '확인할 반복 일정을 선택해주세요.'

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
        # 오늘 이후 날짜 반복 일정만 제거 -> 전체 제거 -> 오늘 이후 날짜 반복 일정만 제거
        schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id, start_dt__gt=timezone.now())

    if error is None:
        try:
            with transaction.atomic():
                for delete_schedule_info in schedule_data:
                    end_schedule_counter = ScheduleTb.objects.filter(Q(state_cd='PE') | Q(state_cd='PC'),
                                                                     group_schedule_id=delete_schedule_info.schedule_id,
                                                                     use=USE).count()
                    if end_schedule_counter == 0:
                        schedule_result = func_delete_schedule(class_id, delete_schedule_info.schedule_id,
                                                               request.user.id)
                        error = schedule_result['error']

                schedule_result = func_delete_repeat_schedule(group_repeat_schedule_info.repeat_schedule_id)
                error = schedule_result['error']

                if error is not None:
                    raise ValidationError(str(error))

        except TypeError:
            error = '등록 값에 문제가 있습니다.'
        except ValueError:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError:
            error = '취소된 일정입니다'
        except InternalError:
            error = '취소된 일정입니다'
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
                error_temp = '수강정보를 불러오지 못했습니다.'
            if error_temp is None:
                member_name = lecture_info.member.name

            if error_temp is None:
                # 오늘 날짜 이후의 반복 일정 취소 -> 전체 취소 확인 필요 hk.kim
                schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=member_repeat_schedule_id,
                                                          start_dt__gt=timezone.now())

            if error_temp is None:
                try:
                    with transaction.atomic():
                        delete_lecture_id_list = []
                        old_lecture_id = None
                        for delete_schedule_info in schedule_data:
                            if delete_schedule_info.state_cd != 'PE' or delete_schedule_info.state_cd != 'PC':
                                current_lecture_id = delete_schedule_info.lecture_tb_id
                                delete_schedule_info.delete()

                                if old_lecture_id != current_lecture_id:
                                    old_lecture_id = current_lecture_id
                                    delete_lecture_id_list.append(old_lecture_id)

                        for delete_lecture_id_info in delete_lecture_id_list:
                            error_temp = func_refresh_lecture_count(class_id, delete_lecture_id_info)

                        if error_temp is None:
                            schedule_result = func_delete_repeat_schedule(member_repeat_schedule_id)
                            error_temp = schedule_result['error']

                        if error_temp is not None:
                            raise ValidationError(str(error_temp))

                except TypeError:
                    error_temp = '등록 값에 문제가 있습니다.'
                except ValueError:
                    error_temp = '등록 값에 문제가 있습니다.'
                except IntegrityError:
                    error_temp = '취소된 일정입니다.'
                except InternalError:
                    error_temp = '취소된 일정입니다.'
                except ValidationError:
                    error_temp = '예약 가능 횟수를 확인해주세요.'

            if error_temp is None:
                log_data = LogTb(log_type='LR02', auth_member_id=request.user.id,
                                 from_member_name=request.user.first_name,
                                 to_member_name=member_name,
                                 class_tb_id=class_id,
                                 lecture_tb_id=lecture_id,
                                 log_info=group_info.name + ' 반복 일정',
                                 log_how='반복 일정 취소',
                                 log_detail=str(start_date) + '/' + str(end_date), use=USE)
                log_data.save()
                push_lecture_id.append(lecture_id)
                push_title.append(class_type_name + ' - 반복 일정 알림')
                push_message.append(request.user.first_name + '님이 ' + str(start_date)
                                    + '~' + str(end_date)
                                    + ' ['+repeat_schedule_info.get_group_name() + '] 반복 일정을 취소했습니다')

    if error is None:

        log_data = LogTb(log_type='LR02', auth_member_id=request.user.id,
                         from_member_name=request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name + ' 반복 일정',
                         log_how='반복 일정 취소',
                         log_detail=str(start_date) + '/' + str(end_date), use=USE)
        log_data.save()
        if setting_to_trainee_lesson_alarm == TO_TRAINEE_LESSON_ALARM_ON:
            context['push_lecture_id'] = push_lecture_id
            context['push_title'] = push_title
            context['push_message'] = push_message

    else:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+str(error))
        messages.error(request, error)
    return render(request, 'ajax/schedule_error_info.html', context)


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

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+str(error))
        messages.error(request, error)
    return redirect(next_page)


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

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+str(error))
        messages.error(request, error)
    return redirect(next_page)
