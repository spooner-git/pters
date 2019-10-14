import base64
import datetime
import logging

import boto3
from botocore.exceptions import ClientError
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.core.files.base import ContentFile
from django.db import IntegrityError, InternalError, transaction
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views import View
from django.views.generic import TemplateView

from configs.const import ON_SCHEDULE_TYPE, USE, AUTO_FINISH_OFF, AUTO_FINISH_ON, TO_TRAINEE_LESSON_ALARM_ON, \
    TO_TRAINEE_LESSON_ALARM_OFF, SCHEDULE_DUPLICATION_DISABLE, AUTO_ABSENCE_ON, SCHEDULE_DUPLICATION_ENABLE, \
    LECTURE_TYPE_ONE_TO_ONE, STATE_CD_NOT_PROGRESS, PERMISSION_STATE_CD_APPROVE, STATE_CD_FINISH, STATE_CD_ABSENCE, \
    OFF_SCHEDULE_TYPE
from configs import settings
from login.models import LogTb, MemberTb
from schedule.forms import AddScheduleTbForm
from schedule.functions import func_send_push_trainee, func_send_push_trainer
from trainee.models import MemberTicketTb
from trainer.models import LectureTb, ClassTb
from .functions import func_get_member_ticket_id, func_add_schedule, func_refresh_member_ticket_count, func_date_check,\
    func_get_lecture_member_ticket_id, func_check_lecture_available_member_before, \
    func_check_lecture_available_member_after, func_delete_schedule, \
    func_delete_repeat_schedule, func_get_repeat_schedule_date_list, func_add_repeat_schedule, \
    func_refresh_lecture_status
from .models import ScheduleTb, RepeatScheduleTb

logger = logging.getLogger(__name__)


class IndexView(TemplateView):
    template_name = 'index_schedule.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        return context


# 일정 추가
def add_schedule_logic(request):
    # start_time = timezone.now()
    # 폼 검사 시작
    schedule_input_form = AddScheduleTbForm(request.POST)

    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_schedule_auto_finish = request.session.get('setting_schedule_auto_finish', AUTO_FINISH_OFF)
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)
    error = None
    info_message = None
    context = {}
    if schedule_input_form.is_valid():
        schedule_start_datetime = schedule_input_form.cleaned_data['start_dt']
        schedule_end_datetime = schedule_input_form.cleaned_data['end_dt']
        en_dis_type = schedule_input_form.cleaned_data['en_dis_type']
        note = schedule_input_form.cleaned_data['note']
        duplication_enable_flag = schedule_input_form.cleaned_data['duplication_enable_flag']
        lecture_id = schedule_input_form.cleaned_data['lecture_id']

        lecture_info = schedule_input_form.get_lecture_info()
        member_list = schedule_input_form.get_member_list(class_id)

        # 폼 검사 종료
        lecture_schedule_id = None

        state_cd = STATE_CD_NOT_PROGRESS
        permission_state_cd = PERMISSION_STATE_CD_APPROVE

        if str(en_dis_type) == str(ON_SCHEDULE_TYPE) and timezone.now() > schedule_end_datetime:
            if str(setting_schedule_auto_finish) == str(AUTO_FINISH_ON):
                state_cd = STATE_CD_FINISH
            elif str(setting_schedule_auto_finish) == str(AUTO_ABSENCE_ON):
                state_cd = STATE_CD_ABSENCE

        # 수업 정보 가져오기
        # OFF 일정이거나 그룹 수업인 경우
        if lecture_info is None or lecture_info.lecture_type_cd != LECTURE_TYPE_ONE_TO_ONE:
            try:
                with transaction.atomic():
                    schedule_result = func_add_schedule(class_id, None, None, lecture_id, None,
                                                        schedule_start_datetime,
                                                        schedule_end_datetime, note, en_dis_type, request.user.id,
                                                        permission_state_cd, state_cd, duplication_enable_flag)
                    error = schedule_result['error']
                    if error is None:
                        lecture_schedule_id = schedule_result['schedule_id']
                        error = func_date_check(class_id, schedule_result['schedule_id'],
                                                schedule_start_datetime.date(),
                                                schedule_start_datetime, schedule_end_datetime,
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

            if error is None and str(en_dis_type) == str(ON_SCHEDULE_TYPE):
                log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                                 from_member_name=request.user.first_name,
                                 class_tb_id=class_id,
                                 log_info=lecture_info.name + ' 일정', log_how='등록',
                                 log_detail=str(schedule_start_datetime) + '/' + str(schedule_end_datetime), use=USE)
                log_data.save()
        else:
            if len(member_list) == 0:
                error = '회원을 선택해주세요.'

        if error is None:
            # 그룹 레슨이거나 개인 레슨인 경우
            for member_info in member_list:
                error_temp = None

                if member_info['error'] is None:
                    try:
                        with transaction.atomic():
                            # 자유형 문제
                            # 개일 레슨인 경우
                            if lecture_info.lecture_type_cd == LECTURE_TYPE_ONE_TO_ONE:
                                lecture_id = None
                                lecture_schedule_id = None

                            else:
                                if lecture_id is None:
                                    raise InternalError

                            schedule_result = func_add_schedule(class_id, member_info['member_ticket_id'], None,
                                                                lecture_id, lecture_schedule_id,
                                                                schedule_start_datetime, schedule_end_datetime,
                                                                note, en_dis_type, request.user.id, permission_state_cd,
                                                                state_cd, duplication_enable_flag)
                            error_temp = schedule_result['error']

                            if error_temp is not None:
                                raise InternalError
                            else:
                                log_data = LogTb(
                                    log_type='LS02', auth_member_id=request.user.id,
                                    from_member_name=request.user.first_name, to_member_name=member_info['member_name'],
                                    class_tb_id=class_id, member_ticket_tb_id=member_info['member_ticket_id'],
                                    log_info=lecture_info.name + ' 수업', log_how='예약 완료',
                                    log_detail=str(schedule_start_datetime) + '/' + str(schedule_end_datetime),
                                    use=USE)
                                log_data.save()

                                if str(setting_to_trainee_lesson_alarm) == str(TO_TRAINEE_LESSON_ALARM_ON):
                                    push_info_schedule_start_date = str(schedule_start_datetime).split(':')
                                    push_info_schedule_end_date = str(schedule_end_datetime).split(' ')[1].split(':')
                                    func_send_push_trainer(member_info['member_ticket_id'],
                                                           class_type_name + ' - 수업 알림',
                                                           request.user.first_name + '님이 '
                                                           + push_info_schedule_start_date[0] + ':'
                                                           + push_info_schedule_start_date[1] + '~'
                                                           + push_info_schedule_end_date[0] + ':'
                                                           + push_info_schedule_end_date[1]
                                                           + ' [' + lecture_info.name + '] 수업을 등록했습니다')
                    except TypeError:
                        error_temp = '오류가 발생했습니다. [1]'
                    except ValueError:
                        error_temp = '오류가 발생했습니다. [2]'
                    except IntegrityError:
                        error_temp = '오류가 발생했습니다. [3]'
                    except InternalError:
                        error_temp = error_temp
                else:
                    error_temp = member_info['error']

                if error_temp is not None:
                    if info_message is None or info_message == '':
                        info_message = member_info['member_name']
                    else:
                        info_message = info_message + ',' + member_info['member_name']

    else:
        for field in schedule_input_form:
            for field_error in field.errors:
                error = field_error
                break
        for non_field_error in schedule_input_form.non_field_errors():
            error = non_field_error
            break

    if error is None:
        if info_message is not None:
            info_message += '님의 일정이 등록되지 않았습니다.'
            context['lecture_schedule_info'] = info_message
    else:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        # messages.error(request, error)
        context['messageArray'] = error
    # end_time = timezone.now()

    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
    # return render(request, 'ajax/schedule_error_info.html', context)


# 일정 취소
def delete_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id', '')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)

    error = None
    schedule_info = None
    lecture_info = None
    lecture_name = ''
    member_ticket_info = None
    start_dt = None
    end_dt = None
    push_schedule_info = None
    context = {}
    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.'

    if error is None:
        lecture_info = schedule_info.lecture_tb
        if lecture_info is not None:
            lecture_name = lecture_info.name
        member_ticket_info = schedule_info.member_ticket_tb
        start_dt = schedule_info.start_dt
        end_dt = schedule_info.end_dt
        push_info_schedule_start_date = str(start_dt).split(':')
        push_info_schedule_end_date = str(end_dt).split(' ')[1].split(':')
        push_schedule_info = push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]\
                             + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]

    if error is None:
        # 개인 레슨인 경우
        if lecture_info is None and member_ticket_info is not None:
            member_ticket_id = schedule_info.member_ticket_tb_id
            member_name = schedule_info.member_ticket_tb.member.name
            func_send_push_trainer(member_ticket_id,
                                   class_type_name + ' - 수업 알림',
                                   request.user.first_name + '님이 ' + push_schedule_info
                                   + ' [개인 레슨] 수업을 예약 취소했습니다.')
            # logger.error(request.user.first_name + '[' + str(request.user.id) + ']'
            #              + member_name + '님에게 push 알림 전송에 실패했습니다.')

            log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                             from_member_name=request.user.first_name,
                             to_member_name=member_name,
                             class_tb_id=class_id,
                             member_ticket_tb_id=member_ticket_id,
                             log_info='개인 수업',
                             log_how='예약 취소',
                             log_detail=str(start_dt) + '/' + str(end_dt), use=USE)
            log_data.save()
        # 그룹 레슨인 경우
        if lecture_info is not None:
            log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                             from_member_name=request.user.first_name,
                             class_tb_id=class_id,
                             log_info=lecture_name + ' 수업',
                             log_how='예약 취소',
                             log_detail=str(start_dt) + '/' + str(end_dt), use=USE)
            log_data.save()

        schedule_result = func_delete_schedule(class_id, schedule_id, request.user.id)
        error = schedule_result['error']

    if error is None:
        # 그룹 레슨의 경우
        member_lecture_schedule_data = ScheduleTb.objects.filter(lecture_schedule_id=schedule_id)
        for member_lecture_schedule_info in member_lecture_schedule_data:
            temp_error = None
            schedule_id = member_lecture_schedule_info.schedule_id
            member_ticket_id = member_lecture_schedule_info.member_ticket_tb_id
            member_name = member_lecture_schedule_info.member_ticket_tb.member.name

            if temp_error is None:
                try:
                    with transaction.atomic():
                        schedule_result = func_delete_schedule(class_id, schedule_id, request.user.id)
                        temp_error = schedule_result['error']

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
                if str(setting_to_trainee_lesson_alarm) == str(TO_TRAINEE_LESSON_ALARM_ON):
                    func_send_push_trainer(member_ticket_id,
                                           class_type_name + ' - 수업 알림',
                                           request.user.first_name + '님이 ' + push_schedule_info
                                           + ' ['+lecture_name+'] 수업을 예약 취소했습니다.')
                    # logger.error(request.user.first_name + '[' + str(request.user.id) + ']'
                    #              + member_name + '님에게 push 알림 전송에 실패했습니다.')
                if lecture_info is not None:
                    log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                                     from_member_name=request.user.first_name,
                                     to_member_name=member_name,
                                     class_tb_id=class_id,
                                     member_ticket_tb_id=member_ticket_id,
                                     log_info=lecture_name + ' 수업',
                                     log_how='예약 취소',
                                     log_detail=str(start_dt) + '/' + str(end_dt), use=USE)
                    log_data.save()

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        # messages.error(request, error)
        context['messageArray'] = error

    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
    # return render(request, 'ajax/schedule_error_info.html')


def update_schedule_logic(request):

    # 폼 검사 시작
    schedule_ids = request.POST.getlist('schedule_ids[]', '')
    schedule_start_datetime = request.POST.get('start_dt', '')
    schedule_end_datetime = request.POST.get('end_dt', '')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)
    error = None
    start_dt = schedule_start_datetime
    end_dt = schedule_end_datetime
    log_detail_info = ''
    lecture_name = '개인 수업'
    context = {}

    if end_dt is None or end_dt == '':
        error = '종료 시각을 선택해주세요.'
    if start_dt is None or start_dt == '':
        error = '시작 시각을 선택해주세요.'

    if error is None:
        check_time = False
        schedule_end_datetime_split = schedule_end_datetime.split(' ')
        if schedule_end_datetime_split[1] == '24:00' or schedule_end_datetime_split[1] == '24:0':
            end_dt = schedule_end_datetime_split[0] + ' 23:59'
            check_time = True

        try:
            start_dt = datetime.datetime.strptime(start_dt, '%Y-%m-%d %H:%M')
            end_dt = datetime.datetime.strptime(end_dt, '%Y-%m-%d %H:%M')
            if check_time:
                end_dt = end_dt + datetime.timedelta(minutes=1)
        except ValueError:
            error = '날짜 오류가 발생했습니다.[0]'
        except IntegrityError:
            error = '날짜 오류가 발생했습니다.[1]'
        except TypeError:
            error = '날짜 오류가 발생했습니다.[2]'

    if error is None:
        for schedule_id in schedule_ids:
            try:
                schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
            except ObjectDoesNotExist:
                error = '일정 정보를 불러오지 못했습니다.'

            if error is None:
                log_detail_info = str(schedule_info.start_dt)\
                                  + '/' + str(schedule_info.end_dt)\
                                  + '->' + str(start_dt) + '/' + str(end_dt)
                if str(schedule_info.en_dis_type) != str(OFF_SCHEDULE_TYPE):
                    if schedule_info.lecture_tb is not None and schedule_info.lecture_tb != '':
                        lecture_name = schedule_info.lecture_tb.name

                    if schedule_info.member_ticket_tb is None or schedule_info.member_ticket_tb == '':
                        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                                         from_member_name=request.user.first_name,
                                         class_tb_id=class_id,
                                         log_info=lecture_name + ' 수업',
                                         log_how='예약 변경',
                                         log_detail=log_detail_info, use=USE)
                        log_data.save()
                    else:
                        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                                         from_member_name=request.user.first_name,
                                         to_member_name=schedule_info.member_ticket_tb.member.name,
                                         class_tb_id=class_id,
                                         member_ticket_tb_id=schedule_info.member_ticket_tb_id,
                                         log_info=lecture_name + ' 수업',
                                         log_how='예약 변경',
                                         log_detail=log_detail_info, use=USE)
                        log_data.save()
                schedule_info.start_dt = start_dt
                schedule_info.end_dt = end_dt
                schedule_info.save()
            if error is None:

                if schedule_info.member_ticket_tb is not None and schedule_info.member_ticket_tb != '':
                    if str(setting_to_trainee_lesson_alarm) == str(TO_TRAINEE_LESSON_ALARM_ON):
                        log_detail_info = log_detail_info.replace('/', '~')
                        func_send_push_trainer(schedule_info.member_ticket_tb_id,
                                               class_type_name + ' - 수업 알림',
                                               request.user.first_name + '님이 '
                                               + log_detail_info
                                               + ' [' + lecture_name + '] 수업을 수정했습니다')

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        # messages.error(request, error)
        context['messageArray'] = error

    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
    # return render(request, 'ajax/schedule_error_info.html')


# 일정 완료
def update_schedule_state_cd_logic(request):
    schedule_id = request.POST.get('schedule_id')
    schedule_state_cd = request.POST.get('state_cd', STATE_CD_FINISH)
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)

    schedule_state_cd_name = '완료'
    error = None
    schedule_info = None
    member_ticket_info = None
    member_ticket_repeat_schedule_data = None
    member_name = None
    push_member_ticket_id = []
    push_title = []
    push_message = []
    start_date = None
    end_date = None
    context = {'push_member_ticket_id': '', 'push_title': '', 'push_message': ''}

    if schedule_id == '':
        error = '일정을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.select_related('lecture_tb').get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.'
        if schedule_state_cd == STATE_CD_FINISH:
            schedule_state_cd_name = '출석'
        elif schedule_state_cd == STATE_CD_ABSENCE:
            schedule_state_cd_name = '결석'

    if error is None:
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt
        if schedule_info.member_ticket_tb is not None and schedule_info.member_ticket_tb != '':
            member_ticket_info = schedule_info.member_ticket_tb
            if schedule_info.member_ticket_tb.member is not None and schedule_info.member_ticket_tb.member != '':
                member_name = schedule_info.member_ticket_tb.member.name
        else:
            member_name = ''

    if error is None:
        try:
            with transaction.atomic():
                schedule_info.state_cd = schedule_state_cd
                schedule_info.save()
                # 남은 횟수 차감
                error = func_refresh_member_ticket_count(class_id, member_ticket_info.member_ticket_id)

                member_ticket_repeat_schedule_data = None
                if schedule_info.repeat_schedule_tb is not None and schedule_info.repeat_schedule_tb != '':
                    member_ticket_repeat_schedule_data = schedule_info.repeat_schedule_tb
                    if member_ticket_repeat_schedule_data.state_cd == STATE_CD_NOT_PROGRESS:
                        member_ticket_repeat_schedule_data.state_cd = 'IP'
                        member_ticket_repeat_schedule_data.save()
                    member_ticket_repeat_schedule_counter = ScheduleTb.objects.filter(
                        repeat_schedule_tb_id=member_ticket_repeat_schedule_data.repeat_schedule_id,
                        use=USE).exclude(Q(state_cd=STATE_CD_FINISH) | Q(state_cd=STATE_CD_ABSENCE)).count()

                    if member_ticket_repeat_schedule_counter == 0:
                        member_ticket_repeat_schedule_data.state_cd = STATE_CD_FINISH
                        member_ticket_repeat_schedule_data.save()

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
        if schedule_info.lecture_tb_id is not None and schedule_info.lecture_tb_id != '':
            lecture_repeat_schedule_id = None
            if member_ticket_repeat_schedule_data is not None and member_ticket_repeat_schedule_data != '':
                lecture_repeat_schedule_id = member_ticket_repeat_schedule_data.lecture_schedule_id
            func_refresh_lecture_status(schedule_info.lecture_tb_id, schedule_info.lecture_schedule_id,
                                        lecture_repeat_schedule_id)

    if error is None:

        push_info_schedule_start_date = str(start_date).split(':')
        push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')

        push_member_ticket_id.append(schedule_info.member_ticket_tb_id)
        push_title.append(class_type_name + ' - '+schedule_state_cd_name)
        log_info = '개인 레슨'
        push_info = push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1] \
                    + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1] \
                    + ' [개인 레슨] 수업이 '+schedule_state_cd_name+' 처리 되었습니다.'

        if schedule_info.lecture_tb_id is not None and schedule_info.lecture_tb_id != '':
            log_info = schedule_info.lecture_tb.name + ' 수업'
            push_info = push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1] \
                        + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1] \
                        + ' ['+schedule_info.lecture_tb.name\
                        + '] 수업이 '+schedule_state_cd_name+' 처리 되었습니다.'

        log_data = LogTb(log_type='LS03', auth_member_id=request.user.id,
                         from_member_name=request.user.first_name,
                         to_member_name=member_name,
                         class_tb_id=class_id, member_ticket_tb_id=member_ticket_info.member_ticket_id,
                         log_info=log_info, log_how=schedule_state_cd_name,
                         log_detail=str(start_date) + '/' + str(end_date), use=USE)
        log_data.save()
        push_message.append(push_info)

        if str(setting_to_trainee_lesson_alarm) == str(TO_TRAINEE_LESSON_ALARM_ON):
            context['push_member_ticket_id'] = push_member_ticket_id
            context['push_title'] = push_title
            context['push_message'] = push_message

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        # messages.error(request, error)
        context['messageArray'] = error
    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
    # return render(request, 'ajax/schedule_error_info.html', context)


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
    context = {}

    if schedule_id == '':
        error = '일정을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.'

    if error is None:
        lecture_schedule_data = ScheduleTb.objects.filter(lecture_schedule_id=schedule_id)
        if len(lecture_schedule_data) > 0:
            lecture_schedule_data.update(note=note)

        schedule_info.note = note
        schedule_info.save()

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        # messages.error(request, error)
        context['messageArray'] = error
    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
    # return render(request, 'ajax/schedule_error_info.html', None)


# 반복 일정 추가
def add_repeat_schedule_logic(request):
    repeat_type = request.POST.get('repeat_freq', '')
    repeat_schedule_start_date = request.POST.get('repeat_start_date', '')
    repeat_schedule_end_date = request.POST.get('repeat_end_date', '')
    repeat_week_type = request.POST.get('repeat_day', '')
    repeat_start_time = request.POST.get('repeat_start_time')
    repeat_end_time = request.POST.get('repeat_end_time')
    lecture_id = request.POST.get('lecture_id', None)
    member_ids = request.POST.getlist('member_ids[]', '')
    en_dis_type = request.POST.get('en_dis_type', ON_SCHEDULE_TYPE)
    duplication_enable_flag = request.POST.get('duplication_enable_flag', SCHEDULE_DUPLICATION_ENABLE)
    class_id = request.session.get('class_id', '')

    week_info = ['(일)', '(월)', '(화)', '(수)', '(목)', '(금)', '(토)']
    context = {}
    error = None
    member_id = None
    member_ticket_id = None
    lecture_info = None

    repeat_schedule_start_date_info = None
    repeat_schedule_end_date_info = None
    repeat_schedule_info = None
    repeat_schedule_date_list = []
    repeat_duplication_date_data = []
    repeat_success_date_data = []

    schedule_check = 0
    schedule_input_counter = 0
    success_start_date = None
    success_end_date = None
    end_time_check = 0

    if repeat_schedule_start_date == repeat_schedule_end_date:
        if repeat_start_time == repeat_end_time:
            error = '일정을 다시 선택해주세요.'
    if repeat_type == '':
        error = '매주/격주를 선택해주세요.'
    if repeat_week_type == '':
        error = '요일을 선택해주세요.'
    if repeat_start_time == '':
        error = '시작 시각을 선택해 주세요.'
    elif repeat_end_time == '':
        error = '종료 시각을 선택해 주세요.'
    if repeat_schedule_start_date == '':
        error = '시작 날짜를 선택해 주세요.'
    elif repeat_schedule_end_date == '':
        error = '종료 날짜를 선택해 주세요.'

    if error is None:
        try:
            repeat_schedule_start_date_info = datetime.datetime.strptime(repeat_schedule_start_date, '%Y-%m-%d')
            repeat_schedule_end_date_info = datetime.datetime.strptime(repeat_schedule_end_date, '%Y-%m-%d')
            if (repeat_schedule_end_date_info - repeat_schedule_start_date_info) > datetime.timedelta(days=365):
                error = '1년까지만 반복 일정을 등록할수 있습니다.'
        except ValueError:
            error = '날짜 오류가 발생했습니다.[0]'
        except IntegrityError:
            error = '날짜 오류가 발생했습니다.[1]'
        except TypeError:
            error = '날짜 오류가 발생했습니다.[2]'

    # 등록할 날짜 list 가져오기
    if error is None:
        repeat_schedule_date_list = func_get_repeat_schedule_date_list(repeat_type, repeat_week_type,
                                                                       repeat_schedule_start_date_info,
                                                                       repeat_schedule_end_date_info)
        if len(repeat_schedule_date_list) == 0:
            error = '등록할 수 있는 일정이 없습니다.'

    # OFF 일정이 아닌 경우 / 수업 정보 가져오기
    if error is None:
        if lecture_id is not None and lecture_id != '':
            try:
                lecture_info = LectureTb.objects.get(lecture_id=lecture_id, use=USE)
                if len(member_ids) > lecture_info.member_num:
                    error = '정원보다 등록하려는 회원수가 많습니다.'
            except ObjectDoesNotExist:
                error = '수업 정보에 오류가 발생했습니다.'

    # 개인 일정 등록하는 경우
    if error is None:
        if lecture_info is not None and lecture_info.lecture_type_cd == LECTURE_TYPE_ONE_TO_ONE:
            lecture_id = None
            member_id = member_ids[0]
            if member_id == '':
                error = '회원을 선택해 주세요.'
            else:
                member_ticket_id = func_get_member_ticket_id(class_id, member_id)
                if member_ticket_id is None or member_ticket_id == '':
                    error = '등록할수 있는 일정이 없습니다.'

    # 반복 일정 데이터 등록
    if error is None:
        repeat_schedule_result = func_add_repeat_schedule(class_id, member_ticket_id, lecture_id, None, repeat_type,
                                                          repeat_week_type,
                                                          repeat_schedule_start_date, repeat_schedule_end_date,
                                                          repeat_start_time, repeat_end_time, en_dis_type,
                                                          request.user.id)
        if repeat_schedule_result['error'] is None:
            if repeat_schedule_result['schedule_info'] is None:
                context['repeat_schedule_id'] = ''
            else:
                context['repeat_schedule_id'] = repeat_schedule_result['schedule_info'].repeat_schedule_id
                repeat_schedule_info = repeat_schedule_result['schedule_info']

    if error is None:
        # 반복일정 데이터 등록
        for repeat_schedule_date_info in repeat_schedule_date_list:
            error_date = None
            temp_error_date = str(repeat_schedule_date_info).split(' ')[0]\
                              + week_info[int(repeat_schedule_date_info.strftime('%w'))]
            # 데이터 넣을 날짜,시간 setting
            if repeat_end_time == '24:00' or repeat_end_time == '24:0':
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
                error_date = temp_error_date
            except IntegrityError:
                error_date = temp_error_date
            except TypeError:
                error_date = temp_error_date

            if end_time_check == 1:
                schedule_end_datetime = schedule_end_datetime + datetime.timedelta(minutes=1)

            if error_date is None:
                # 개인 일정 추가라면 일정 추가해야할 lecture id 찾기
                member_ticket_id = None
                if lecture_info is not None and lecture_info.lecture_type_cd == LECTURE_TYPE_ONE_TO_ONE:
                    member_ticket_id = func_get_member_ticket_id(class_id, member_id)
                    if member_ticket_id is not None and member_ticket_id != '':
                        schedule_check = 1

                # OFF 일정이면 바로 등록
                if str(en_dis_type) == str(OFF_SCHEDULE_TYPE):
                    schedule_check = 1
                # 그룹 수업이면 바로 등록
                if lecture_info is not None and lecture_info.lecture_type_cd != LECTURE_TYPE_ONE_TO_ONE:
                    schedule_check = 1

                if schedule_check == 1:
                    try:
                        with transaction.atomic():
                            state_cd = STATE_CD_NOT_PROGRESS
                            permission_state_cd = PERMISSION_STATE_CD_APPROVE
                            schedule_result = func_add_schedule(class_id, member_ticket_id,
                                                                repeat_schedule_info.repeat_schedule_id,
                                                                lecture_id, None,
                                                                schedule_start_datetime, schedule_end_datetime, '',
                                                                en_dis_type, request.user.id,
                                                                permission_state_cd,
                                                                state_cd, duplication_enable_flag)

                            if schedule_result['error'] is not None:
                                error_date = str(repeat_schedule_date_info).split(' ')[0]

                            if error_date is None:
                                if member_ticket_id is not None and member_ticket_id != '':
                                    error_temp = func_refresh_member_ticket_count(class_id, member_ticket_id)
                                    if error_temp is not None:
                                        error_date = str(repeat_schedule_date_info).split(' ')[0]

                            if error_date is None:
                                error_date = func_date_check(class_id, schedule_result['schedule_id'],
                                                             str(repeat_schedule_date_info).split(' ')[0],
                                                             schedule_start_datetime, schedule_end_datetime,
                                                             duplication_enable_flag)
                            if error_date is None:
                                if schedule_input_counter == 0:
                                    success_start_date = str(repeat_schedule_date_info).split(' ')[0]
                                success_end_date = str(repeat_schedule_date_info).split(' ')[0]
                                schedule_input_counter += 1

                            if error_date is not None:
                                raise ValidationError(str(error_date))

                    except TypeError:
                        error_date = temp_error_date
                    except ValueError:
                        error_date = temp_error_date
                    except IntegrityError:
                        error_date = temp_error_date
                    except ValidationError:
                        error_date = temp_error_date
                    except InternalError:
                        error_date = temp_error_date

            if error_date is not None:
                repeat_duplication_date_data.append(error_date)
            else:
                repeat_success_date_data.append(temp_error_date)

    if error is None:
        if schedule_input_counter == 0:
            repeat_schedule_info.delete()
        else:
            repeat_schedule_info.start_date = success_start_date
            repeat_schedule_info.end_date = success_end_date
            repeat_schedule_info.save()
            context['repeat_start_date'] = success_start_date
            context['repeat_end_date'] = success_end_date
        context['repeat_schedule_input_counter'] = schedule_input_counter
        context['repeat_duplication_date_data'] = repeat_duplication_date_data
        context['repeat_success_date_data'] = repeat_success_date_data
    else:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        # messages.error(request, error)

        context['messageArray'] = error
    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
    # return render(request, 'ajax/repeat_schedule_result_ajax.html', context)


def add_repeat_schedule_confirm(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id')
    repeat_confirm = request.POST.get('repeat_confirm')
    member_ids = request.POST.getlist('member_ids[]', '')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)
    error = None
    repeat_schedule_info = None
    start_date = None
    end_date = None
    en_dis_type = None
    information = None
    member_ticket_id = ''
    lecture_info = None
    context = {}

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
        lecture_info = repeat_schedule_info.lecture_tb

    if error is None:
        start_date = repeat_schedule_info.start_date
        end_date = repeat_schedule_info.end_date
        en_dis_type = repeat_schedule_info.en_dis_type

    if error is None:
        if str(en_dis_type) == str(ON_SCHEDULE_TYPE):
            member_ticket_info = repeat_schedule_info.member_ticket_tb
            if member_ticket_info is not None:
                member_ticket_id = member_ticket_info.member_ticket_id

    if error is None:
        if repeat_confirm == '0':
            try:
                with transaction.atomic():
                    schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id)
                    for delete_schedule_info in schedule_data:
                        if delete_schedule_info.state_cd != STATE_CD_FINISH \
                                and delete_schedule_info.state_cd != STATE_CD_ABSENCE:
                            delete_member_ticket_id = delete_schedule_info.member_ticket_tb_id
                            delete_schedule_info.delete()
                            if str(en_dis_type) == str(ON_SCHEDULE_TYPE):
                                error = func_refresh_member_ticket_count(class_id, delete_member_ticket_id)
                        if error is not None:
                            break
                    repeat_schedule_info.delete()

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
            if lecture_info is not None:
                # func_update_member_schedule_alarm(class_id)

                log_data = LogTb(log_type='LR01', auth_member_id=request.user.id,
                                 from_member_name=request.user.first_name,
                                 class_tb_id=class_id,
                                 log_info=lecture_info.name,
                                 log_how='반복 일정 등록',
                                 log_detail=str(start_date) + '/' + str(end_date), use=USE)
                log_data.save()

                schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id, use=USE)

                for lecture_member_id in member_ids:
                    try:
                        member_info = MemberTb.objects.get(member_id=lecture_member_id)
                    except ObjectDoesNotExist:
                        member_info = None

                    if member_info is not None:
                        member_ticket_id = None
                        member_ticket_result = func_get_lecture_member_ticket_id(class_id, lecture_info.lecture_id,
                                                                                 member_info.member_id)
                        if member_ticket_result['error'] is not None:
                            error = member_ticket_result['error']
                        else:
                            member_ticket_id = member_ticket_result['member_ticket_id']

                        if error is None:
                            if member_ticket_id is not None and member_ticket_id != '':
                                repeat_schedule_result = func_add_repeat_schedule(repeat_schedule_info.class_tb_id,
                                                                                  member_ticket_id,
                                                                                  repeat_schedule_info.lecture_tb_id,
                                                                                  repeat_schedule_info.repeat_schedule_id,
                                                                                  repeat_schedule_info.repeat_type_cd,
                                                                                  repeat_schedule_info.week_info,
                                                                                  repeat_schedule_info.start_date,
                                                                                  repeat_schedule_info.end_date,
                                                                                  repeat_schedule_info.start_time,
                                                                                  repeat_schedule_info.end_time,
                                                                                  repeat_schedule_info.en_dis_type,
                                                                                  request.user.id)
                                member_repeat_schedule_info = repeat_schedule_result['schedule_info']
                                for schedule_info in schedule_data:
                                    member_ticket_id = None
                                    member_ticket_result = func_get_lecture_member_ticket_id(class_id,
                                                                                             lecture_info.lecture_id,
                                                                                             member_info.member_id)
                                    if member_ticket_result['error'] is None:
                                        member_ticket_id = member_ticket_result['member_ticket_id']

                                    if member_ticket_id is not None and member_ticket_id != '':
                                        error_temp = func_check_lecture_available_member_before(class_id,
                                                                                                lecture_info.lecture_id,
                                                                                                schedule_info.schedule_id)
                                        if error_temp is None:
                                            try:
                                                with transaction.atomic():
                                                    state_cd = STATE_CD_NOT_PROGRESS
                                                    permission_state_cd = PERMISSION_STATE_CD_APPROVE
                                                    schedule_result = func_add_schedule(
                                                        class_id, member_ticket_id,
                                                        member_repeat_schedule_info.repeat_schedule_id,
                                                        lecture_info.lecture_id, schedule_info.schedule_id,
                                                        schedule_info.start_dt, schedule_info.end_dt,
                                                        '', ON_SCHEDULE_TYPE, request.user.id, permission_state_cd,
                                                        state_cd, SCHEDULE_DUPLICATION_ENABLE)

                                                    error_temp = schedule_result['error']

                                                    if error_temp is None:
                                                        error_temp = func_refresh_member_ticket_count(class_id,
                                                                                                      member_ticket_id)

                                                    if error_temp is None:
                                                        error_temp = \
                                                            func_check_lecture_available_member_after(
                                                                class_id, lecture_info.lecture_id,
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
                        if member_ticket_id is not None and member_ticket_id != '':
                            log_data = LogTb(log_type='LR01', auth_member_id=request.user.id,
                                             from_member_name=request.user.first_name,
                                             to_member_name=member_info.name,
                                             class_tb_id=class_id,
                                             member_ticket_tb_id=member_ticket_id,
                                             log_info=lecture_info.name,
                                             log_how='반복 일정 등록',
                                             log_detail=str(start_date) + '/' + str(end_date), use=USE)
                            log_data.save()
                            if str(setting_to_trainee_lesson_alarm) == str(TO_TRAINEE_LESSON_ALARM_ON):
                                func_send_push_trainer(member_ticket_id,
                                                       class_type_name + ' - 수업 알림',
                                                       request.user.first_name + '님이 '
                                                       + str(start_date) + '~' + str(end_date)
                                                       + ' ['+lecture_info.name + '] 반복 일정을 등록했습니다')

                information = '반복 일정 등록이 완료됐습니다.'
            else:
                if str(en_dis_type) == str(ON_SCHEDULE_TYPE) and str(setting_to_trainee_lesson_alarm) == str(TO_TRAINEE_LESSON_ALARM_ON):
                    func_send_push_trainer(member_ticket_id,
                                           class_type_name + ' - 수업 알림',
                                           request.user.first_name + '님이 '
                                           + str(start_date) + '~' + str(end_date)
                                           + ' [개인 수업] 반복 일정을 등록했습니다')

    if error is None:
        if information is not None:
            messages.info(request, information)
    else:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        # messages.error(request, error)
        context['messageArray'] = error
    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
    # return render(request, 'ajax/schedule_error_info.html')


def delete_repeat_schedule_logic(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id', '')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')

    error = None
    repeat_schedule_info = None
    context = {}
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)

    if repeat_schedule_id == '':
        error = '확인할 반복 일정을 선택해주세요.'

    if error is None:
        # 반복일정 정보 가져오기
        try:
            repeat_schedule_info = RepeatScheduleTb.objects.get(repeat_schedule_id=repeat_schedule_id)
        except ObjectDoesNotExist:
            error = '반복 일정이 존재하지 않습니다'

    if error is None:
        # 그룹 수업인 경우 + 포함된 회원의 반복일정이 존재하는 경우
        try:
            with transaction.atomic():
                lecture_member_repeat_schedule_data = RepeatScheduleTb.objects.select_related(
                    'member_ticket_tb__member', 'lecture_tb').filter(lecture_schedule_id=repeat_schedule_id)
                if len(lecture_member_repeat_schedule_data) > 0:
                    for lecture_member_repeat_schedule_info in lecture_member_repeat_schedule_data:
                        start_date = lecture_member_repeat_schedule_info.start_date
                        end_date = lecture_member_repeat_schedule_info.end_date
                        member_ticket_id = lecture_member_repeat_schedule_info.member_ticket_tb_id
                        member_name = lecture_member_repeat_schedule_info.member_ticket_tb.member.name
                        lecture_name = lecture_member_repeat_schedule_info.lecture_tb.name

                        # 반복일정에 해당하는 일정 불러오기
                        lecture_member_schedule_data = ScheduleTb.objects.select_related(
                            'member_ticket_tb__member').filter(
                            repeat_schedule_tb_id=lecture_member_repeat_schedule_info.repeat_schedule_id,
                            start_dt__gt=timezone.now())

                        # 반복일정에 해당하는 회원 수강정보 저장
                        # 일정 삭제
                        delete_member_ticket_id_data = {}
                        for lecture_member_schedule_info in lecture_member_schedule_data:
                            member_ticket_id = lecture_member_schedule_info.member_ticket_tb_id
                            delete_member_ticket_id_data[member_ticket_id] = member_ticket_id
                            lecture_member_schedule_info.delete()

                        # 회원 수강정보(횟수) refresh
                        for delete_member_ticket_id_info in delete_member_ticket_id_data:
                            error = func_refresh_member_ticket_count(class_id, delete_member_ticket_id_info)
                            if error is not None:
                                break

                        # 반복일정 삭제
                        if error is None:
                            schedule_result = func_delete_repeat_schedule(lecture_member_repeat_schedule_info.repeat_schedule_id)
                            error = schedule_result['error']

                        if error is not None:
                            raise ValidationError(str(error))
                        else:
                            # 로그 남기기 및 회원에게 push
                            log_info = lecture_name + ' 반복 일정'

                            log_data = LogTb(log_type='LR02', auth_member_id=request.user.id,
                                             from_member_name=request.user.first_name,
                                             to_member_name=member_name,
                                             class_tb_id=class_id,
                                             member_ticket_tb_id=member_ticket_id,
                                             log_info=log_info,
                                             log_how='반복 일정 취소',
                                             log_detail=str(start_date) + '/' + str(end_date), use=USE)
                            log_data.save()

                            if str(setting_to_trainee_lesson_alarm) == str(TO_TRAINEE_LESSON_ALARM_ON):
                                func_send_push_trainer(member_ticket_id,
                                                       class_type_name + ' - 수업 알림',
                                                       request.user.first_name + '님이 '
                                                       + str(start_date) + '~' + str(end_date)
                                                       + ' ['+lecture_name + '] 반복 일정을 취소했습니다')

        except TypeError:
            error = '반복일정 삭제중 오류가 발생했습니다.[0]'
        except ValueError:
            error = '반복일정 삭제중 오류가 발생했습니다.[1]'
        except IntegrityError:
            error = '반복일정 삭제중 오류가 발생했습니다.[2]'
        except InternalError:
            error = '반복일정 삭제중 오류가 발생했습니다.[3]'
        except ValidationError:
            error = '반복일정 삭제중 오류가 발생했습니다.[4]'

    if error is None:
        # OFF 일정 or 그룹 일정 or 1:1 회원 일정
        try:
            with transaction.atomic():
                start_date = repeat_schedule_info.start_date
                end_date = repeat_schedule_info.end_date
                lecture_name = '개인 수업'
                member_ticket_id = ''
                member_name = ''
                if str(repeat_schedule_info.en_dis_type) == str(ON_SCHEDULE_TYPE):
                    if repeat_schedule_info.member_ticket_tb is not None and repeat_schedule_info.member_ticket_tb != '':
                        member_ticket_id = repeat_schedule_info.member_ticket_tb_id
                        member_name = repeat_schedule_info.member_ticket_tb.member.name
                    if repeat_schedule_info.lecture_tb is not None and repeat_schedule_info.lecture_tb != '':
                        lecture_name = repeat_schedule_info.lecture_tb.name

                schedule_data = ScheduleTb.objects.select_related('member_ticket_tb__member').filter(
                    repeat_schedule_tb_id=repeat_schedule_info.repeat_schedule_id, start_dt__gt=timezone.now())
                if repeat_schedule_info.member_ticket_tb is None or repeat_schedule_info.member_ticket_tb == '':
                    schedule_data.delete()
                else:
                    delete_member_ticket_id_data = {}
                    for schedule_info in schedule_data:
                        member_ticket_id = schedule_info.member_ticket_tb_id
                        delete_member_ticket_id_data[member_ticket_id] = member_ticket_id
                        schedule_info.delete()

                    for delete_member_ticket_id_info in delete_member_ticket_id_data:
                        error = func_refresh_member_ticket_count(class_id, delete_member_ticket_id_info)
                        if error is not None:
                            break

                if error is None:
                    schedule_result = func_delete_repeat_schedule(repeat_schedule_info.repeat_schedule_id)
                    error = schedule_result['error']

                if error is not None:
                    raise ValidationError(str(error))

                else:
                    # 로그 남기기 및 회원에게 push
                    if str(repeat_schedule_info.en_dis_type) == str(ON_SCHEDULE_TYPE):
                        log_info = lecture_name + ' 반복 일정'
                        if member_ticket_id != '':
                            log_data = LogTb(log_type='LR02', auth_member_id=request.user.id,
                                             from_member_name=request.user.first_name,
                                             to_member_name=member_name,
                                             class_tb_id=class_id,
                                             member_ticket_tb_id=member_ticket_id,
                                             log_info=log_info,
                                             log_how='반복 일정 취소',
                                             log_detail=str(start_date) + '/' + str(end_date), use=USE)
                            log_data.save()
                            if str(setting_to_trainee_lesson_alarm) == str(TO_TRAINEE_LESSON_ALARM_ON):
                                func_send_push_trainer(member_ticket_id,
                                                       class_type_name + ' - 수업 알림',
                                                       request.user.first_name + '님이 '
                                                       + str(start_date) + '~' + str(end_date)
                                                       + ' [' + lecture_name + '] 반복 일정을 취소했습니다')
                        else:
                            log_data = LogTb(log_type='LR02', auth_member_id=request.user.id,
                                             from_member_name=request.user.first_name,
                                             class_tb_id=class_id,
                                             log_info=lecture_name + ' 반복 일정',
                                             log_how='반복 일정 취소',
                                             log_detail=str(start_date) + '/' + str(end_date), use=USE)
                            log_data.save()
        except TypeError:
            error = '반복일정 삭제중 오류가 발생했습니다.[5]'
        except ValueError:
            error = '반복일정 삭제중 오류가 발생했습니다.[6]'
        except IntegrityError:
            error = '반복일정 삭제중 오류가 발생했습니다.[7]'
        except InternalError:
            error = '반복일정 삭제중 오류가 발생했습니다.[8]'
        except ValidationError:
            error = '반복일정 삭제중 오류가 발생했습니다.[9]'

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        context['messageArray'] = error

    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})


def delete_repeat_schedule_logic2(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id', '')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')

    error = None
    schedule_data = None
    start_date = None
    end_date = None
    member_ticket_id = None
    en_dis_type = None
    member_ticket_info = None
    member_info = None
    member_name = ''
    repeat_schedule_info = None
    push_member_ticket_id = []
    push_title = []
    push_message = []
    lecture_id = None
    lecture_name = ''
    context = {'push_member_ticket_id': '', 'push_title': '', 'push_message': ''}
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
        member_ticket_id = repeat_schedule_info.member_ticket_tb_id
        lecture_id = repeat_schedule_info.lecture_tb_id
        if lecture_id is not None and lecture_id != '':
            lecture_name = repeat_schedule_info.get_lecture_name()

    if error is None:
        if str(en_dis_type) == str(ON_SCHEDULE_TYPE):
            try:
                member_ticket_info = MemberTicketTb.objects.get(member_ticket_id=member_ticket_id, use=USE)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'
            if error is None:
                member_info = member_ticket_info.member
            if error is None:
                member_name = member_info.name

    if error is None:
        # 오늘 날짜 이후의 반복 일정 취소 -> 전체 취소 확인 필요 hk.kim
        schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id,
                                                  start_dt__gt=timezone.now())

    if error is None:
        try:
            with transaction.atomic():
                delete_member_ticket_id_list = []
                old_member_ticket_id = None
                for delete_schedule_info in schedule_data:
                    if delete_schedule_info.state_cd != STATE_CD_FINISH \
                            and delete_schedule_info.state_cd != STATE_CD_ABSENCE:
                        current_member_ticket_id = delete_schedule_info.member_ticket_tb_id
                        delete_schedule_info.delete()

                        if str(en_dis_type) == str(ON_SCHEDULE_TYPE):
                            if old_member_ticket_id != current_member_ticket_id:
                                old_member_ticket_id = current_member_ticket_id
                                delete_member_ticket_id_list.append(old_member_ticket_id)

                if str(en_dis_type) == str(ON_SCHEDULE_TYPE):
                    for delete_member_ticket_id_info in delete_member_ticket_id_list:
                        error = func_refresh_member_ticket_count(class_id, delete_member_ticket_id_info)

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
        if lecture_id is not None and lecture_id != '':
            log_info = lecture_name + ' 반복 일정'

        log_data = LogTb(log_type='LR02', auth_member_id=request.user.id,
                         from_member_name=request.user.first_name,
                         to_member_name=member_name,
                         class_tb_id=class_id,
                         member_ticket_tb_id=member_ticket_id,
                         log_info=log_info,
                         log_how='반복 일정 취소',
                         log_detail=str(start_date) + '/' + str(end_date), use=USE)
        log_data.save()

        if str(en_dis_type) == str(ON_SCHEDULE_TYPE) and str(setting_to_trainee_lesson_alarm) == str(TO_TRAINEE_LESSON_ALARM_ON):
            push_member_ticket_id.append(member_ticket_id)
            push_title.append(class_type_name + ' - 수업 알림')
            push_message_info = request.user.first_name + '님이 ' + str(start_date)\
                                + '~' + str(end_date) + ' [개인 레슨] 반복 일정을 취소했습니다'
            if lecture_id is not None and lecture_id == '':
                push_message_info = request.user.first_name + '님이 ' + str(start_date)\
                                    + '~' + str(end_date)\
                                    + ' [' + lecture_name+'] 반복 일정을 취소했습니다'
            push_message.append(push_message_info)
            # context['push_member_ticket_id'] = push_member_ticket_id
            # context['push_title'] = push_title
            # context['push_message'] = push_message

    else:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        # messages.error(request, error)
        context['messageArray'] = error
    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})


class CheckScheduleUpdateViewAjax(LoginRequiredMixin, View):
    template_name = 'ajax/data_change_check_ajax.html'

    def get(self, request):
        context = {}
        class_id = self.request.session.get('class_id', '')
        error = None
        class_info = None
        user_for_lecture = None
        lecture = None

        if class_id is None or class_id == '':
            error = '오류가 발생했습니다.'

        if error is None:
            try:
                user_for_lecture = User.objects.get(id=request.user.id)
            except ObjectDoesNotExist:
                error = '오류가 발생했습니다.'

        if error is None:
            try:
                lecture = user_for_lecture.lectures.get(user=request.user.id)
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'

        # update_check 0 : data update 없음
        # update_check 1 : data update 있음
        update_check = 0
        if error is None:
            if lecture.name == 'trainer':
                # 강사 정보 가져오기
                try:
                    class_info = ClassTb.objects.get(class_id=class_id)
                except ObjectDoesNotExist:
                    error = '오류가 발생했습니다.'

                if error is None:
                    update_check = class_info.schedule_check

            # if lecture.name == 'trainee':
            #     member_ticket_data = MemberTicketTb.objects.filter(member_id=request.user.id, use=USE)
            #
            #     if len(member_ticket_data) > 0:
            #         for member_ticket_info in member_ticket_data:
            #             if member_ticket_info.member_ticket_tb.schedule_check == 1:
            #                 update_check = 1

        context['data_changed'] = update_check
        if error is not None:
            logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
            # messages.error(request, error)

        return render(request, self.template_name, context)


class CheckScheduleDuplicateViewAjax(LoginRequiredMixin, View):
    template_name = 'ajax/schedule_error_info.html'

    def post(self, request):
        context = {}
        schedule_input_form = AddScheduleTbForm(request.POST)
        error = None
        if schedule_input_form.is_valid():
            schedule_start_datetime = schedule_input_form.cleaned_data['start_dt']
            schedule_end_datetime = schedule_input_form.cleaned_data['end_dt']
            class_id = self.request.session.get('class_id', '')

            error_date = func_date_check(class_id, None, str(schedule_start_datetime).split(' ')[0],
                                         schedule_start_datetime, schedule_end_datetime,
                                         SCHEDULE_DUPLICATION_DISABLE)
            if error_date is not None:
                error = '일정이 중복되었습니다.'
        else:
            if not schedule_input_form.is_valid():
                for field in schedule_input_form:
                    for field_error in field.errors:
                        error = field_error
                        break
                for non_field_error in schedule_input_form.non_field_errors():
                    error = non_field_error
                    break

        if error is not None:
            logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
            # messages.error(request, error)

        return render(request, self.template_name, context)


# 일정 완료
def finish_lecture_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id')
    class_id = request.session.get('class_id', '')
    schedule_state_cd = request.POST.get('schedule_state_cd', STATE_CD_FINISH)
    schedule_state_cd_name = '완료'
    error = None
    schedule_info = None
    lecture_info = None
    push_member_ticket_id = []
    push_title = []
    push_message = []
    start_date = None
    end_date = None
    class_type_name = request.session.get('class_type_name', '')
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)

    context = {'push_member_ticket_id': '', 'push_title': '', 'push_message': ''}

    if schedule_id == '':
        error = '일정을 선택하세요.'

    if error is None:

        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.'
        if schedule_state_cd == STATE_CD_FINISH:
            schedule_state_cd_name = '완료'
        elif schedule_state_cd == STATE_CD_ABSENCE:
            schedule_state_cd_name = '결석 처리'

    if error is None:
        lecture_info = schedule_info.lecture_tb

    if error is None:
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt
        if schedule_info.state_cd == STATE_CD_FINISH or schedule_info.state_cd == STATE_CD_ABSENCE:
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
                    if repeat_schedule_data.state_cd == STATE_CD_NOT_PROGRESS:
                        repeat_schedule_data.state_cd = 'IP'
                        repeat_schedule_data.save()
                    repeat_schedule_counter = \
                        ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_data.repeat_schedule_id,
                                                  use=USE).exclude(Q(state_cd=STATE_CD_FINISH)
                                                                   | Q(state_cd=STATE_CD_ABSENCE)).count()
                    if repeat_schedule_counter == 0:
                        repeat_schedule_data.state_cd = STATE_CD_FINISH
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
        member_lecture_schedule_data = ScheduleTb.objects.select_related(
            'member_ticket_tb__member').filter(lecture_schedule_id=schedule_id)
        for member_lecture_schedule_info in member_lecture_schedule_data:
            lecture_repeat_schedule = None
            temp_error = None
            start_date = member_lecture_schedule_info.start_dt
            end_date = member_lecture_schedule_info.end_dt
            member_ticket_info = member_lecture_schedule_info.member_ticket_tb
            if member_lecture_schedule_info.state_cd == STATE_CD_FINISH \
                    or member_lecture_schedule_info.state_cd == STATE_CD_ABSENCE:
                temp_error = '완료된 스케쥴입니다.'
            member_name = member_lecture_schedule_info.member_ticket_tb.member.name

            if temp_error is None:
                try:
                    with transaction.atomic():
                        member_lecture_schedule_info.state_cd = schedule_state_cd
                        member_lecture_schedule_info.save()
                        # 남은 횟수 차감
                        temp_error = func_refresh_member_ticket_count(class_id, member_ticket_info.member_ticket_id)
                        member_ticket_info.refresh_from_db()
                        member_ticket_repeat_schedule = None
                        if member_lecture_schedule_info.repeat_schedule_tb_id is not None \
                                and member_lecture_schedule_info.repeat_schedule_tb_id != '':
                            member_ticket_repeat_schedule = member_lecture_schedule_info.repeat_schedule_tb

                        if member_ticket_repeat_schedule is not None:
                            if member_ticket_repeat_schedule.state_cd == STATE_CD_NOT_PROGRESS:
                                member_ticket_repeat_schedule.state_cd = 'IP'
                                member_ticket_repeat_schedule.save()
                            member_ticket_repeat_schedule_counter = \
                                ScheduleTb.objects.filter(
                                    repeat_schedule_tb_id=member_ticket_repeat_schedule.repeat_schedule_id,
                                    use=USE).exclude(Q(state_cd=STATE_CD_FINISH)
                                                     | Q(state_cd=STATE_CD_ABSENCE)).count()
                            if member_ticket_repeat_schedule_counter == 0:
                                member_ticket_repeat_schedule.state_cd = STATE_CD_FINISH
                                member_ticket_repeat_schedule.save()

                        if member_ticket_info.member_ticket_rem_count == 0:
                            member_ticket_info.state_cd = STATE_CD_FINISH
                            member_ticket_info.schedule_check = 1
                        member_ticket_info.save()

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
                temp_error = func_refresh_member_ticket_count(class_id, member_ticket_info.member_ticket_id)
                if member_lecture_schedule_info.lecture_tb_id is not None \
                        and member_lecture_schedule_info.lecture_tb_id != '':
                    lecture_repeat_schedule_id = None
                    if member_ticket_repeat_schedule is not None and member_ticket_repeat_schedule != '':
                        lecture_repeat_schedule_id = lecture_repeat_schedule.lecture_schedule_id
                    func_refresh_lecture_status(member_lecture_schedule_info.lecture_tb_id,
                                                member_lecture_schedule_info.lecture_schedule_id,
                                                lecture_repeat_schedule_id)

            if temp_error is None:

                push_info_schedule_start_date = str(start_date).split(':')
                push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')
                push_member_ticket_id.append(member_lecture_schedule_info.member_ticket_tb_id)
                push_title.append(class_type_name + ' - 수업 알림')
                if member_lecture_schedule_info.lecture_tb_id is not None \
                        and member_lecture_schedule_info.lecture_tb_id != '':

                    log_data = LogTb(log_type='LS03', auth_member_id=request.user.id,
                                     from_member_name=request.user.first_name,
                                     to_member_name=member_name,
                                     class_tb_id=class_id,
                                     member_ticket_tb_id=member_lecture_schedule_info.member_ticket_tb_id,
                                     log_info=member_lecture_schedule_info.get_lecture_name() + ' 수업',
                                     log_how=schedule_state_cd_name,
                                     log_detail=str(start_date) + '/' + str(end_date), use=USE)
                    log_data.save()
                    push_message.append(push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                        + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                        + ' [' + schedule_info.get_lecture_name() + '] 수업을 '
                                        + schedule_state_cd_name + ' 했습니다.')

    if error is None:

        log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                         from_member_name=request.user.first_name,
                         class_tb_id=class_id,
                         log_info=lecture_info.name + ' 수업',
                         log_how=schedule_state_cd_name,
                         log_detail=str(start_date) + '/' + str(end_date), use=USE)
        log_data.save()
    if error is None:

        if str(setting_to_trainee_lesson_alarm) == str(TO_TRAINEE_LESSON_ALARM_ON):
            context['push_member_ticket_id'] = push_member_ticket_id
            context['push_title'] = push_title
            context['push_message'] = push_message
    else:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        # messages.error(request, error)
        context['messageArray'] = error
    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
    # return render(request, 'ajax/schedule_error_info.html', context)


# 일정 추가
def add_member_lecture_schedule_logic(request):
    member_id = request.POST.get('member_id')
    lecture_schedule_id = request.POST.get('schedule_id')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_schedule_auto_finish = request.session.get('setting_schedule_auto_finish', AUTO_FINISH_OFF)
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)
    error = None
    lecture_info = None
    schedule_info = None
    member_info = None
    lecture_id = ''
    member_ticket_id = ''

    push_member_ticket_id = []
    push_title = []
    push_message = []
    context = {'push_member_ticket_id': '', 'push_title': '', 'push_message': ''}

    if lecture_schedule_id == '':
        error = '일정을 선택해 주세요.'

    # if note is None:
    #     note = ''

    if error is None:
        # 스케쥴 정보 가져오기
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=lecture_schedule_id)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.'

    if error is None:
        lecture_id = schedule_info.lecture_tb_id

    if error is None:
        # 그룹 정보 가져오기
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'

    if error is None:
        # 회원 정보 가져오기
        try:
            member_info = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        member_ticket_result = func_get_lecture_member_ticket_id(class_id, lecture_id, member_info.member_id)
        if member_ticket_result['error'] is not None:
            error = member_ticket_result['error']
        else:
            member_ticket_id = member_ticket_result['member_ticket_id']

            if member_ticket_id is None or member_ticket_id == '':
                error = '예약 가능한 횟수가 없습니다.'

    if error is None:
        lecture_schedule_data = ScheduleTb.objects.filter(lecture_schedule_id=lecture_schedule_id,
                                                          member_ticket_tb__member_id=member_id, use=USE)
        if len(lecture_schedule_data) != 0:
            error = '일정에 포함되어있는 회원입니다.'

    if error is None:
        error = func_check_lecture_available_member_before(class_id, lecture_id, lecture_schedule_id)

    if error is None:
        try:
            with transaction.atomic():
                if error is None:

                    state_cd = schedule_info.state_cd
                    permission_state_cd = PERMISSION_STATE_CD_APPROVE

                    if timezone.now() > schedule_info.end_dt:
                        if str(setting_schedule_auto_finish) == str(AUTO_FINISH_ON):
                            state_cd = STATE_CD_FINISH
                        elif str(setting_schedule_auto_finish) == str(AUTO_ABSENCE_ON):
                            state_cd = STATE_CD_ABSENCE
                    schedule_result = func_add_schedule(class_id, member_ticket_id, None,
                                                        lecture_id, lecture_schedule_id,
                                                        schedule_info.start_dt, schedule_info.end_dt,
                                                        schedule_info.note, ON_SCHEDULE_TYPE,
                                                        request.user.id, permission_state_cd, state_cd,
                                                        SCHEDULE_DUPLICATION_ENABLE)
                    error = schedule_result['error']

                if error is None:
                    error = func_refresh_member_ticket_count(class_id, member_ticket_id)

                if error is None:
                    error = func_check_lecture_available_member_after(class_id, lecture_id, lecture_schedule_id)

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
                         member_ticket_tb_id=member_ticket_id,
                         log_info=lecture_info.name+' 수업', log_how='예약 완료',
                         log_detail=str(schedule_info.start_dt) + '/' + str(schedule_info.end_dt), use=USE)
        log_data.save()

    if error is None:
        if str(setting_to_trainee_lesson_alarm) == str(TO_TRAINEE_LESSON_ALARM_ON):
            push_info_schedule_start_date = str(schedule_info.start_dt).split(':')
            push_info_schedule_end_date = str(schedule_info.end_dt).split(' ')[1].split(':')

            push_member_ticket_id.append(member_ticket_id)
            push_title.append(class_type_name + ' - 수업 알림')
            push_message.append(request.user.first_name + '님이 '
                                + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                + ' ['+lecture_info.name+'] 수업을 예약 완료했습니다')
            context['push_member_ticket_id'] = push_member_ticket_id
            context['push_title'] = push_title
            context['push_message'] = push_message

    else:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        # messages.error(request, error)
        context['messageArray'] = error
    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
    # return render(request, 'ajax/schedule_error_info.html', context)


# 일정 추가
def add_other_member_lecture_schedule_logic(request):
    member_id = request.POST.get('member_id')
    member_ticket_id = request.POST.get('member_ticket_id')
    lecture_schedule_id = request.POST.get('schedule_id')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    setting_schedule_auto_finish = request.session.get('setting_schedule_auto_finish', AUTO_FINISH_OFF)
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)

    error = None
    member_ticket_info = None
    schedule_info = None
    member_info = None
    lecture_info = None
    lecture_id = ''

    push_member_ticket_id = []
    push_title = []
    push_message = []
    context = {'push_member_ticket_id': '', 'push_title': '', 'push_message': ''}

    if lecture_schedule_id == '':
        error = '일정을 선택해 주세요.'

    if error is None:
        # 스케쥴 정보 가져오기
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=lecture_schedule_id)
        except ObjectDoesNotExist:
            error = '일정 정보를 불러오지 못했습니다.'

    if error is None:
        lecture_id = schedule_info.lecture_tb_id

    if error is None:
        # 그룹 정보 가져오기
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
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
            member_ticket_info = MemberTicketTb.objects.get(member_ticket_id=member_ticket_id)
            if member_ticket_info.member_ticket_avail_count == 0:
                error = '예약 가능 횟수가 없습니다.'
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        lecture_schedule_data = ScheduleTb.objects.filter(lecture_schedule_id=lecture_schedule_id,
                                                          member_ticket_tb__member_id=member_id, use=USE)
        if len(lecture_schedule_data) != 0:
            error = '일정에 포함되어있는 회원입니다.'

    if error is None:
        error = func_check_lecture_available_member_before(class_id, lecture_id, lecture_schedule_id)

    if error is None:
        try:
            with transaction.atomic():
                if error is None:

                    state_cd = schedule_info.state_cd
                    permission_state_cd = PERMISSION_STATE_CD_APPROVE
                    if timezone.now() > schedule_info.end_dt:
                        if str(setting_schedule_auto_finish) == str(AUTO_FINISH_ON):
                            state_cd = STATE_CD_FINISH
                        elif str(setting_schedule_auto_finish) == str(AUTO_ABSENCE_ON):
                            state_cd = STATE_CD_ABSENCE
                    schedule_result = func_add_schedule(class_id, member_ticket_id, None,
                                                        lecture_id, lecture_schedule_id,
                                                        schedule_info.start_dt, schedule_info.end_dt,
                                                        schedule_info.note, ON_SCHEDULE_TYPE,
                                                        request.user.id, permission_state_cd, state_cd,
                                                        SCHEDULE_DUPLICATION_ENABLE)
                    error = schedule_result['error']

                if error is None:
                    error = func_refresh_member_ticket_count(class_id, member_ticket_id)

                if error is None:
                    error = func_check_lecture_available_member_after(class_id, lecture_id, lecture_schedule_id)

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
                         member_ticket_tb_id=member_ticket_info.member_ticket_id,
                         log_info=lecture_info.name + ' 수업',
                         log_how='예약 완료',
                         log_detail=str(schedule_info.start_dt) + '/' + str(schedule_info.end_dt), use=USE)
        log_data.save()

    if error is None:
        if str(setting_to_trainee_lesson_alarm) == str(TO_TRAINEE_LESSON_ALARM_ON):
            push_info_schedule_start_date = str(schedule_info.start_dt).split(':')
            push_info_schedule_end_date = str(schedule_info.end_dt).split(' ')[1].split(':')

            push_member_ticket_id.append(member_ticket_id)
            push_title.append(class_type_name + ' - 수업 알림')
            push_message.append(request.user.first_name + '님이 '
                                + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                                + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]
                                + ' [' + lecture_info.name + '] 수업을 예약 완료했습니다')
            context['push_member_ticket_id'] = push_member_ticket_id
            context['push_title'] = push_title
            context['push_message'] = push_message
    else:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        # messages.error(request, error)

        context['messageArray'] = error
    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
    # return render(request, 'ajax/schedule_error_info.html', context)


# 그룹 반복 일정 취소
def delete_lecture_repeat_schedule_logic(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id')
    class_id = request.session.get('class_id', '')
    class_type_name = request.session.get('class_type_name', '')
    error = None
    schedule_data = None
    start_date = None
    end_date = None
    lecture_repeat_schedule_info = None
    lecture_info = None
    push_member_ticket_id = []
    push_title = []
    push_message = []
    context = {'push_member_ticket_id': '', 'push_title': '', 'push_message': ''}
    setting_to_trainee_lesson_alarm = request.session.get('setting_to_trainee_lesson_alarm',
                                                          TO_TRAINEE_LESSON_ALARM_OFF)

    if repeat_schedule_id == '':
        error = '확인할 반복 일정을 선택해주세요.'

    if error is None:
        try:
            lecture_repeat_schedule_info = RepeatScheduleTb.objects.get(repeat_schedule_id=repeat_schedule_id)
        except ObjectDoesNotExist:
            error = '반복 일정이 존재하지 않습니다'

    if error is None:
        lecture_info = lecture_repeat_schedule_info.lecture_tb

    if error is None:
        start_date = lecture_repeat_schedule_info.start_date
        end_date = lecture_repeat_schedule_info.end_date

    if error is None:
        # 오늘 이후 날짜 반복 일정만 제거 -> 전체 제거 -> 오늘 이후 날짜 반복 일정만 제거
        schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id, start_dt__gt=timezone.now())

    if error is None:
        try:
            with transaction.atomic():
                for delete_schedule_info in schedule_data:
                    end_schedule_counter = ScheduleTb.objects.filter(
                        Q(state_cd=STATE_CD_FINISH) | Q(state_cd=STATE_CD_ABSENCE),
                        lecture_schedule_id=delete_schedule_info.schedule_id, use=USE).count()
                    if end_schedule_counter == 0:
                        schedule_result = func_delete_schedule(class_id, delete_schedule_info.schedule_id,
                                                               request.user.id)
                        error = schedule_result['error']

                schedule_result = func_delete_repeat_schedule(lecture_repeat_schedule_info.repeat_schedule_id)
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
        repeat_schedule_list = RepeatScheduleTb.objects.filter(lecture_schedule_id=repeat_schedule_id)

        for repeat_schedule_info in repeat_schedule_list:
            error_temp = None
            start_date = repeat_schedule_info.start_date
            end_date = repeat_schedule_info.end_date
            member_ticket_id = repeat_schedule_info.member_ticket_tb_id
            member_name = None
            member_repeat_schedule_id = repeat_schedule_info.repeat_schedule_id
            member_ticket_info = None

            try:
                member_ticket_info = MemberTicketTb.objects.get(member_ticket_id=member_ticket_id, use=USE)
            except ObjectDoesNotExist:
                error_temp = '수강정보를 불러오지 못했습니다.'
            if error_temp is None:
                member_name = member_ticket_info.member.name

            if error_temp is None:
                # 오늘 날짜 이후의 반복 일정 취소 -> 전체 취소 확인 필요 hk.kim
                schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=member_repeat_schedule_id,
                                                          start_dt__gt=timezone.now())

            if error_temp is None:
                try:
                    with transaction.atomic():
                        delete_member_ticket_id_list = []
                        old_member_ticket_id = None
                        for delete_schedule_info in schedule_data:
                            if delete_schedule_info.state_cd != STATE_CD_FINISH \
                                    or delete_schedule_info.state_cd != STATE_CD_ABSENCE:
                                current_member_ticket_id = delete_schedule_info.member_ticket_tb_id
                                delete_schedule_info.delete()

                                if old_member_ticket_id != current_member_ticket_id:
                                    old_member_ticket_id = current_member_ticket_id
                                    delete_member_ticket_id_list.append(old_member_ticket_id)

                        for delete_member_ticket_id_info in delete_member_ticket_id_list:
                            error_temp = func_refresh_member_ticket_count(class_id, delete_member_ticket_id_info)

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
                                 member_ticket_tb_id=member_ticket_id,
                                 log_info=lecture_info.name + ' 반복 일정',
                                 log_how='반복 일정 취소',
                                 log_detail=str(start_date) + '/' + str(end_date), use=USE)
                log_data.save()
                push_member_ticket_id.append(member_ticket_id)
                push_title.append(class_type_name + ' - 반복 일정 알림')
                push_message.append(request.user.first_name + '님이 ' + str(start_date)
                                    + '~' + str(end_date)
                                    + ' ['+repeat_schedule_info.get_lecture_name() + '] 반복 일정을 취소했습니다')

    if error is None:

        log_data = LogTb(log_type='LR02', auth_member_id=request.user.id,
                         from_member_name=request.user.first_name,
                         class_tb_id=class_id,
                         log_info=lecture_info.name + ' 반복 일정',
                         log_how='반복 일정 취소',
                         log_detail=str(start_date) + '/' + str(end_date), use=USE)
        log_data.save()
        if str(setting_to_trainee_lesson_alarm) == str(TO_TRAINEE_LESSON_ALARM_ON):
            context['push_member_ticket_id'] = push_member_ticket_id
            context['push_title'] = push_title
            context['push_message'] = push_message

    else:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+str(error))
        # messages.error(request, error)
        context['messageArray'] = error
    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
    # return render(request, 'ajax/schedule_error_info.html', context)


def send_push_to_trainer_logic(request):
    class_id = request.session.get('class_id', '')
    title = request.POST.get('title', '')
    message = request.POST.get('message', '')

    error = None
    context = {}

    if class_id == '':
        error = 'push를 전송하는중 오류가 발생했습니다.'

    if error is None:
        error = func_send_push_trainee(class_id, title, message)

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+str(error))
        # messages.error(request, error)
        context['messageArray'] = error
    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
    # return render(request, 'ajax/schedule_error_info.html')


def send_push_to_trainee_logic(request):
    member_ticket_id = request.POST.get('member_ticket_id', '')
    title = request.POST.get('title', '')
    message = request.POST.get('message', '')
    context = {}

    error = None
    if member_ticket_id == '':
        error = 'push를 전송하는중 오류가 발생했습니다.'

    if error is None:
        error = func_send_push_trainer(member_ticket_id, title, message)

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+str(error))
        # messages.error(request, error)
        context['messageArray'] = error
    return JsonResponse(context, json_dumps_params={'ensure_ascii': True})
    # return render(request, 'ajax/schedule_error_info.html')
