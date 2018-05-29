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
from login.models import LogTb, MemberTb, CommonCdTb
from schedule.functions import func_get_lecture_id, func_add_schedule, func_refresh_lecture_count, func_date_check, \
    func_update_member_schedule_alarm, func_save_log_data, func_check_group_schedule_enable, \
    func_get_available_group_member_list, func_get_group_lecture_id, \
    func_check_group_available_member_before, func_check_group_available_member_after, \
    func_send_push_trainer, func_get_not_available_group_member_list
from schedule.models import LectureTb, ClassLectureTb, MemberLectureTb, GroupLectureTb, GroupTb
from schedule.models import ClassTb
from schedule.models import ScheduleTb, DeleteScheduleTb, RepeatScheduleTb, DeleteRepeatScheduleTb

from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)


class IndexView(TemplateView):
    template_name = 'index_schedule.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        return context


def delete_schedule_logic_func(schedule_info, member_id):

    error = None
    lecture_info = None
    en_dis_type = schedule_info.en_dis_type

    if en_dis_type == '1':
        if error is None:
            try:
                lecture_info = LectureTb.objects.get(lecture_id=schedule_info.lecture_tb_id, use=1)
            except ObjectDoesNotExist:
                error = '회원 수강정보를 불러오지 못했습니다.'

    # print()
    if error is None:
        try:
            with transaction.atomic():
                delete_schedule = DeleteScheduleTb(schedule_id=schedule_info.schedule_id,
                                                   class_tb_id=schedule_info.class_tb_id,
                                                   group_tb_id=schedule_info.group_tb_id,
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
                                group_tb_id=lecture_repeat_schedule_data.group_tb_id,
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

                        group_data = GroupLectureTb.objects.filter(lecture_tb_id=schedule_info.lecture_tb_id)
                        if len(group_data) > 0:
                            for group_info in group_data:
                                group_data_total_size = GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                                                                                      use=1).count()
                                group_data_end_size = GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                                                                                    use=1).exclude(lecture_tb__state_cd='IP').count()

                                try:
                                    group_info_data = GroupTb.objects.get(group_id=group_info.group_tb_id)
                                except ObjectDoesNotExist:
                                    error = '그룹 정보를 불러오지 못했습니다.'
                                if error is None:
                                    if group_data_total_size == group_data_end_size:
                                        group_info_data.state_cd = 'PE'
                                        group_info_data.save()
                                    else:
                                        group_info_data.state_cd = 'IP'
                                        group_info_data.save()
                                else:
                                    error = None
                    lecture_info.mod_dt = timezone.now()
                    lecture_info.schedule_check = 1
                    lecture_info.save()

        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '이미 삭제된 일정입니다.'
        except InternalError as e:
            error = '이미 삭제된 일정입니다.'
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
    pt_schedule_idx = []
    group_schedule_id = []
    group_schedule_start_datetime = []
    group_schedule_end_datetime = []
    group_schedule_finish_check = []
    group_schedule_note = []
    group_schedule_group_id = []
    group_schedule_name = []
    group_schedule_max_member_num = []
    group_schedule_current_member_num = []

    # 강사 정보 가져오기
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강좌 정보를 불러오지 못했습니다.'

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
        lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, auth_cd='VIEW', use=1)

        for lecture_datum_info in lecture_data:
            lecture_datum = lecture_datum_info.lecture_tb
            # 강좌별로 연결되어있는 회원 리스트 불러오기

            if error is None:
                # 강좌별로 연결된 PT 스케쥴 가져오기
                lecture_datum.pt_schedule_data = ScheduleTb.objects.filter(class_tb=class_id,
                                                                           lecture_tb=lecture_datum.lecture_id,
                                                                           en_dis_type='1',
                                                                           start_dt__gte=start_date,
                                                                           start_dt__lt=end_date, use=1).order_by('start_dt')
                # PT 스케쥴 정보 셋팅
                idx = 0
                for pt_schedule_datum in lecture_datum.pt_schedule_data:
                    # lecture schedule id 셋팅
                    idx += 1
                    pt_schedule_id.append(pt_schedule_datum.schedule_id)
                    # lecture schedule 에 해당하는 lecture id 셋팅
                    pt_schedule_lecture_id.append(lecture_datum.lecture_id)
                    pt_schedule_member_name.append(lecture_datum.member.name)
                    pt_schedule_member_id.append(lecture_datum.member.member_id)
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

    if error is None:
        # 강좌별로 연결된 그룹 스케쥴 가져오기
        pt_schedule_data = ScheduleTb.objects.filter(class_tb=class_id,
                                                     group_tb__isnull=False,
                                                     lecture_tb__isnull=True,
                                                     en_dis_type='1',
                                                     start_dt__gte=start_date,
                                                     start_dt__lt=end_date, use=1).order_by('start_dt')

        idx = 0
        for pt_schedule_datum in pt_schedule_data:
            # lecture schedule id 셋팅
            idx += 1
            group_schedule_id.append(pt_schedule_datum.schedule_id)
            group_schedule_start_datetime.append(str(pt_schedule_datum.start_dt))
            group_schedule_end_datetime.append(str(pt_schedule_datum.end_dt))
            if pt_schedule_datum.group_tb is not None and pt_schedule_datum.group_tb != '':
                schedule_current_member_num = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                        group_tb_id=pt_schedule_datum.group_tb.group_id,
                                                                        lecture_tb__isnull=False,
                                                                        start_dt=pt_schedule_datum.start_dt,
                                                                        end_dt=pt_schedule_datum.end_dt,
                                                                        use=1).count()
                group_schedule_group_id.append(pt_schedule_datum.group_tb.group_id)
                group_schedule_name.append(pt_schedule_datum.group_tb.name)
                group_schedule_max_member_num.append(pt_schedule_datum.group_tb.member_num)
                group_schedule_current_member_num.append(schedule_current_member_num)

            if pt_schedule_datum.note is None:
                group_schedule_note.append('')
            else:
                group_schedule_note.append(pt_schedule_datum.note)
            # 끝난 스케쥴인지 확인
            if pt_schedule_datum.state_cd == 'PE':
                group_schedule_finish_check.append(1)
            else:
                group_schedule_finish_check.append(0)

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
    context['pt_schedule_idx'] = pt_schedule_idx
    context['group_schedule_id'] = group_schedule_id
    context['group_schedule_start_datetime'] = group_schedule_start_datetime
    context['group_schedule_end_datetime'] = group_schedule_end_datetime
    context['group_schedule_group_id'] = group_schedule_group_id
    context['group_schedule_name'] = group_schedule_name
    context['group_schedule_max_member_num'] = group_schedule_max_member_num
    context['group_schedule_current_member_num'] = group_schedule_current_member_num
    context['group_schedule_note'] = group_schedule_note
    context['group_schedule_finish_check'] = group_schedule_finish_check

    return context


# 일정 추가
def add_schedule_logic(request):
    # lecture_id = request.POST.get('lecture_id')
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
    class_type_name = request.session.get('class_type_name', '')
    next_page = request.POST.get('next_page')

    error = None
    schedule_start_datetime = None
    lecture_id = ''

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
            error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        # 최초 날짜 값 셋팅
        time_duration_temp = class_info.class_hour*int(schedule_time_duration)

        try:
            schedule_start_datetime = datetime.datetime.strptime(schedule_date + ' ' + schedule_time, '%Y-%m-%d %H:%M:%S.%f')
            schedule_end_datetime = schedule_start_datetime + datetime.timedelta(minutes=int(time_duration_temp))
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        if en_dis_type == '1':
            lecture_id = func_get_lecture_id(class_id, member_id)
            if lecture_id is None or lecture_id == '':
                error = '등록할수 있는 일정이 없습니다.'

    if error is None:
        try:
            with transaction.atomic():
                if error is None:
                    schedule_result = func_add_schedule(class_id, lecture_id, None, None, None, schedule_start_datetime, schedule_end_datetime, note, en_dis_type, request.user.id)
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

        func_save_log_data(schedule_start_datetime, schedule_end_datetime,
                           class_info.class_id, lecture_id, request.user.last_name+request.user.first_name,
                           member_name, en_dis_type, 'LS01', request)

    if error is None:
        push_info_schedule_start_date = str(schedule_start_datetime).split(':')
        push_info_schedule_end_date = str(schedule_end_datetime).split(' ')[1].split(':')
        if en_dis_type == '1':
            func_send_push_trainer(lecture_id, class_type_name + ' 수업 - 일정 알림',
                           request.user.last_name+request.user.first_name+'님이 '
                           + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                           + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1] + ' 일정을 등록했습니다.')
            # request.session['push_title'] = class_type_name + ' 수업 - 일정 알림'
            # request.session['push_info'] = request.user.last_name+request.user.first_name+'님이 '\
            #                               + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]\
            #                               + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]+' 일정을 등록했습니다'
            # request.session['lecture_id'] = lecture_id
            request.session['push_title'] = ''
            request.session['push_info'] = ''
            request.session['lecture_id'] = ''
        else:
            request.session['push_title'] = ''
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
    class_type_name = request.session.get('class_type_name', '')

    error = None
    request.session['date'] = date
    request.session['day'] = day
    lecture_id = ''
    class_info = None

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
            error = '스케쥴 정보를 불러오지 못했습니다.'

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
        func_save_log_data(start_date, end_date, class_id, lecture_id, request.user.last_name+request.user.first_name,
                      member_name, en_dis_type, 'LS02', request)

        push_info_schedule_start_date = str(start_date).split(':')
        push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')

        if en_dis_type == '1':
            func_send_push_trainer(lecture_id, class_type_name + ' 수업 - 일정 알림',
                                   request.user.last_name + request.user.first_name + '님이 ' \
                                   + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1] \
                                   + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[
                                       1] + ' 일정을 취소했습니다')
            # request.session['push_title'] = class_type_name + ' 수업 - 일정 알림'
            # request.session['push_info'] = request.user.last_name+request.user.first_name+'님이 '\
            #                                + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]\
            #                                + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1] + ' 일정을 취소했습니다'
            # request.session['lecture_id'] = lecture_id
            request.session['push_title'] = ''
            request.session['push_info'] = ''
            request.session['lecture_id'] = ''
        else:
            request.session['push_title'] = ''
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
    # imgUpload = request.POST.get('upload')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')
    class_type_name = request.session.get('class_type_name', '')

    # image upload test - hk.kim 180313
    # format, imgstr = imgUpload.split(';base64,')
    # ext = format.split('/')[-1]
    # data = ContentFile(base64.b64decode(imgstr), name='temp.' + ext)

    # print(str(imgUpload))
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
            error = '회원 수강정보를 불러오지 못했습니다.'

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
                    if lecture_repeat_schedule_data.group_schedule_id is not None and lecture_repeat_schedule_data.group_schedule_id != '':
                        try:
                            group_repeat_schedule_info = RepeatScheduleTb.objects.get(repeat_schedule_id=lecture_repeat_schedule_data.group_schedule_id)
                        except ObjectDoesNotExist:
                            group_repeat_schedule_info = None

                        if group_repeat_schedule_info is not None:
                            if group_repeat_schedule_info.state_cd == 'NP':
                                group_repeat_schedule_info.state_cd = 'IP'
                                group_repeat_schedule_info.save()

                if lecture_info.lecture_rem_count == 0:
                    lecture_info.state_cd = 'PE'
                    if lecture_repeat_schedule_data is not None:
                        lecture_repeat_schedule_data.state_cd = 'PE'
                        lecture_repeat_schedule_data.save()

                    group_data = GroupLectureTb.objects.filter(lecture_tb_id=schedule_info.lecture_tb_id)
                    if len(group_data) > 0:
                        for group_info in group_data:
                            group_data_total_size = GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                                                                                  use=1).count()
                            group_data_end_size = GroupLectureTb.objects.filter(group_tb_id=group_info.group_tb_id,
                                                                                use=1).exclude(lecture_tb__state_cd='IP').count()

                            try:
                                group_info_data = GroupTb.objects.get(group_id=group_info.group_tb_id)
                            except ObjectDoesNotExist:
                                error = '그룹 정보를 불러오지 못했습니다.'
                            if error is None:
                                if group_data_total_size == group_data_end_size:
                                    group_info_data.state_cd = 'PE'
                                    group_info_data.save()
                                else:
                                    group_info_data.state_cd = 'IP'
                                    group_info_data.save()
                            else:
                                error = None

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
        func_save_log_data(start_date, end_date, class_id, lecture_info.lecture_id, request.user.last_name+request.user.first_name,
                      member_name, '1', 'LS03', request)

        push_info_schedule_start_date = str(start_date).split(':')
        push_info_schedule_end_date = str(end_date).split(' ')[1].split(':')

    if error is None:
        func_send_push_trainer(schedule_info.lecture_tb_id, class_type_name + ' 수업 - 일정 알림',
                               request.user.last_name + request.user.first_name + '님이 ' \
                               + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1] \
                               + '~' + push_info_schedule_end_date[0] + ':' \
                               + push_info_schedule_end_date[1] + ' 일정을 완료 처리했습니다.')
        # request.session['push_title'] = class_type_name + ' 수업 - 일정 알림'
        # request.session['push_info'] = request.user.last_name + request.user.first_name + '님이 '\
        #                               + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]\
        #                               + '~' + push_info_schedule_end_date[0] + ':'\
        #                               + push_info_schedule_end_date[1] + ' 일정을 완료 처리했습니다'

        # request.session['lecture_id'] = schedule_info.lecture_tb_id
        request.session['push_title'] = ''
        request.session['push_info'] = ''
        request.session['lecture_id'] = ''

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
            if lecture_id == '':
                error = '회원을 선택해 주세요.'
            else:
                lecture_id = func_get_lecture_id(class_id, member_id)
                if lecture_id is None or lecture_id == '':
                    error = '등록할수 있는 일정이 없습니다.'
        else:
            lecture_id = ''

    if error is None:
        if member_name == '':
            error = '회원을 선택해 주세요.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

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

                time_duration_temp = class_info.class_hour*int(repeat_schedule_time_duration)
                schedule_end_datetime = schedule_start_datetime + \
                                        datetime.timedelta(minutes=int(time_duration_temp))
            except ValueError as e:
                error = '등록 값에 문제가 있습니다.'
            except IntegrityError as e:
                error = '등록 값에 문제가 있습니다.'
            except TypeError as e:
                error = '등록 값의 형태에 문제가 있습니다.'

            if error is None:

                try:
                    with transaction.atomic():
                        # PT 일정 추가라면 일정 추가해야할 lecture id 찾기
                        if en_dis_type == '1':
                            lecture_id = func_get_lecture_id(class_id, member_id)
                            if lecture_id is None or lecture_id == '':
                                error = '등록할수 있는 일정이 없습니다.'

                        if error is None:
                            schedule_result = func_add_schedule(class_id, lecture_id, repeat_schedule_info.repeat_schedule_id,
                                                                None, None,
                                                                schedule_start_datetime, schedule_end_datetime, '',
                                                                en_dis_type, request.user.id)
                            error = schedule_result['error']

                        if error is None:
                            if lecture_id is not None and lecture_id != '':
                                error = func_refresh_lecture_count(lecture_id)

                        if error is None:
                            error = func_date_check(class_id, schedule_result['schedule_id'],
                                                    str(check_date).split(' ')[0], schedule_start_datetime, schedule_end_datetime)
                            if error is not None:
                                raise ValidationError()
                            else:
                                pt_schedule_input_counter += 1

                        error = None

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

                if error == '예약 가능한 횟수를 확인해주세요.' or error == '날짜가 중복됐습니다.' or error == '등록 값에 문제가 있습니다.' or error == '등록중 오류가 발생했습니다.':
                    logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
                    messages.error(request, error)
                elif error == '등록 값의 형태에 문제가 있습니다.' or error == '회원 수강 정보를 불러오지 못했습니다.' or error == '등록할수 있는 일정이 없습니다.':
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

    if pt_schedule_input_counter == 0:
        repeat_schedule_info.delete()
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
    class_type_name = request.session.get('class_type_name', '')

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
                error = '회원 수강정보를 불러오지 못했습니다.'

            if error is None:
                try:
                    member_info = MemberTb.objects.get(member_id=lecture_info.member_id)
                except ObjectDoesNotExist:
                    error = '회원 정보를 불러오지 못했습니다.'
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
            request.session['push_title'] = ''
            request.session['push_info'] = ''
            request.session['lecture_id'] = ''

        else:
            member_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__state_cd='IP', lecture_tb__use=1)
            # member_lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id, state_cd='IP', member_view_state_cd='VIEW', use=1)
            for member_lecture_data_info in member_lecture_data:
                member_lecture_info = member_lecture_data_info.lecture_tb
                member_lecture_info.schedule_check = 1
                member_lecture_info.save()

            func_save_log_data(start_date, end_date, class_id, lecture_id, request.user.last_name+request.user.first_name,
                          member_name, en_dis_type, 'LR01', request)

            if en_dis_type == '1':
                func_send_push_trainer(lecture_id, class_type_name + ' 수업 - 일정 알림',
                                       request.user.last_name + request.user.first_name + '님이 ' + str(start_date) \
                                       + '~' + str(end_date) + ' 반복일정을 등록했습니다')
                # request.session['push_title'] = class_type_name + ' 수업 - 일정 알림'
                # request.session['push_info'] = request.user.last_name + request.user.first_name + '님이 ' + str(start_date) \
                #                               + '~' + str(end_date) + ' 반복일정을 등록했습니다'
                # request.session['lecture_id'] = lecture_id
                request.session['push_title'] = ''
                request.session['push_info'] = ''
                request.session['lecture_id'] = ''
            else:
                request.session['push_title'] = ''
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
    class_type_name = request.session.get('class_type_name', '')

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
                error = '회원 수강정보를 불러오지 못했습니다.'
            if error is None:
                try:
                    member_info = MemberTb.objects.get(member_id=lecture_info.member_id)
                except ObjectDoesNotExist:
                    error = '회원 정보를 불러오지 못했습니다.'
            if error is None:
                member_name = member_info.name

    if error is None:
        # 오늘 날짜 이후의 반복일정 삭제 -> 전체 삭제 확이 필요 hk.kim
        schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id)

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
            error = '이미 삭제된 일정입니다.'
        except InternalError as e:
            error = '이미 삭제된 일정입니다.'
        except ValidationError as e:
            error = '예약 가능한 횟수를 확인해주세요.'

    # print(error)

    if error is None:
        member_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__state_cd='IP', lecture_tb__use=1)
        for member_lecture_data_info in member_lecture_data:
            member_lecture_info = member_lecture_data_info.lecture_tb
            member_lecture_info.schedule_check = 1
            member_lecture_info.save()
        func_save_log_data(start_date, end_date, class_id, delete_repeat_schedule.lecture_tb_id, request.user.last_name+request.user.first_name,
                      member_name, en_dis_type, 'LR02', request)

        if en_dis_type == '1':
            func_send_push_trainer(delete_repeat_schedule.lecture_tb_id, class_type_name + ' 수업 - 일정 알림',
                                   request.user.last_name + request.user.first_name + '님이 ' + str(start_date) \
                                   + '~' + str(end_date) + ' 반복일정을 취소했습니다')
            request.session['push_title'] = ''
            request.session['push_info'] = ''
            request.session['lecture_id'] = ''
            # request.session['push_title'] = class_type_name + ' 수업 - 일정 알림'
            # request.session['push_info'] = request.user.last_name + request.user.first_name + '님이 ' + str(start_date) \
            #                               + '~' + str(end_date) + ' 반복일정을 취소했습니다'
            # request.session['lecture_id'] = delete_repeat_schedule.lecture_tb_id
        else:
            request.session['push_title'] = ''
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
                    error = '강좌 정보를 불러오지 못했습니다.'

                if error is None:
                    update_check = class_info.schedule_check

            if group.name == 'trainee':
                lecture_data = MemberLectureTb.objects.filter(member=self.request.user.id, use=1)

                if len(lecture_data) > 0:
                    for lecture_info in lecture_data:
                        if lecture_info.lecture_tb.schedule_check == 1:
                            update_check = 1

        # print(error)
        context['data_changed'] = update_check
        if error is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+error)
            messages.error(self.request, error)

        return context


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
            class_lecture_list = ClassLectureTb.objects.filter(member_id=request.user.id, auth_cd='VIEW', use=1)

            if len(class_lecture_list) > 0:
                for idx, class_lecture_info in enumerate(class_lecture_list):
                    if idx == 0:
                        finish_schedule_list = ScheduleTb.objects.filter(lecture_tb_id=class_lecture_info.lecture_tb_id, state_cd='PE').order_by('-end_dt')
                    else:
                        finish_schedule_list |= ScheduleTb.objects.filter(lecture_tb_id=class_lecture_info.lecture_tb_id, state_cd='PE').order_by('-end_dt')
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
            class_lecture_list = ClassLectureTb.objects.filter(member_id=request.user.id, auth_cd='VIEW', use=1)

            if len(class_lecture_list) > 0:
                for idx, class_lecture_info in enumerate(class_lecture_list):
                    if idx == 0:
                        finish_schedule_list = ScheduleTb.objects.filter(lecture_tb_id=class_lecture_info.lecture_tb_id, state_cd='PE').order_by('-end_dt')
                    else:
                        finish_schedule_list |= ScheduleTb.objects.filter(lecture_tb_id=class_lecture_info.lecture_tb_id, state_cd='PE').order_by('-end_dt')
        else:
            finish_schedule_list = ScheduleTb.objects.filter(lecture_tb_id=lecture_id, state_cd='PE').order_by('-end_dt')

        context['finish_schedule_list'] = finish_schedule_list

        return render(request, self.template_name, context)


# hkkim - 2018.04.23
@method_decorator(csrf_exempt, name='dispatch')
class GetDeleteScheduleViewAjax(LoginRequiredMixin, ContextMixin, View):
    template_name = 'delete_schedule_ajax.html'

    def get(self, request, *args, **kwargs):
        context = super(GetFinishScheduleViewAjax, self).get_context_data(**kwargs)

        lecture_id = request.GET.get('lecture_id', '')
        member_id = request.GET.get('member_id', '')

        delete_schedule_list = None
        if lecture_id is None or lecture_id == '':
            class_lecture_list = ClassLectureTb.objects.filter(member_id=request.user.id, auth_cd='VIEW', use=1)

            if len(class_lecture_list) > 0:
                for idx, class_lecture_info in enumerate(class_lecture_list):
                    error = None
                    try:
                        MemberLectureTb.objects.get(member_id=member_id, lecture_tb_id=class_lecture_info.lecture_tb_id, use=1)
                    except ObjectDoesNotExist:
                        error = '수강정보를 불러오지 못했습니다.'
                    if error is None:
                        if idx == 0:
                            delete_schedule_list = DeleteScheduleTb.objects.filter(lecture_tb_id=class_lecture_list.lecture_tb_id).order_by('-end_dt')
                        else:
                            delete_schedule_list |= DeleteScheduleTb.objects.filter(lecture_tb_id=class_lecture_list.lecture_tb_id).order_by('-end_dt')
        else:
            delete_schedule_list = DeleteScheduleTb.objects.filter(lecture_tb_id=lecture_id).order_by('-end_dt')

        context['delete_schedule_list'] = delete_schedule_list

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        context = super(GetFinishScheduleViewAjax, self).get_context_data(**kwargs)

        lecture_id = request.POST.get('lecture_id', '')
        member_id = request.POST.get('member_id', '')

        delete_schedule_list = None
        if lecture_id is None or lecture_id == '':
            class_lecture_list = ClassLectureTb.objects.filter(member_id=request.user.id, auth_cd='VIEW', use=1)

            if len(class_lecture_list) > 0:
                for idx, class_lecture_info in enumerate(class_lecture_list):
                    error = None
                    try:
                        MemberLectureTb.objects.get(member_id=member_id, lecture_tb_id=class_lecture_info.lecture_tb_id, use=1)
                    except ObjectDoesNotExist:
                        error = '수강정보를 불러오지 못했습니다.'
                    if error is None:
                        if idx == 0:
                            delete_schedule_list = DeleteScheduleTb.objects.filter(lecture_tb_id=class_lecture_list.lecture_tb_id).order_by('-end_dt')
                        else:
                            delete_schedule_list |= DeleteScheduleTb.objects.filter(lecture_tb_id=class_lecture_list.lecture_tb_id).order_by('-end_dt')
        else:
            delete_schedule_list = DeleteScheduleTb.objects.filter(lecture_tb_id=lecture_id).order_by('-end_dt')

        context['delete_schedule_list'] = delete_schedule_list

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
            error = '스케쥴 정보를 불러오지 못했습니다.'

    if error is None:
        schedule_info.note = note
        schedule_info.mod_dt = timezone.now()
        schedule_info.save()

    if error is None:
        '''
        log_data = LogTb(log_type='LS03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info='일정 메모', log_how='수정',
                         reg_dt=timezone.now(), use=1)

        log_data.save()
        '''
        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


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
            group_info = GroupTb.objects.get(group_id=group_id, use=1)
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
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        try:
            with transaction.atomic():
                if error is None:
                    schedule_result = func_add_schedule(class_id, None, None,
                                                        group_id, None,
                                                        schedule_start_datetime, schedule_end_datetime,
                                                        note, '1', request.user.id)
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
                         from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name+' 그룹 일정', log_how='추가',
                         log_detail=str(schedule_start_datetime) + '/' + str(schedule_end_datetime),
                         reg_dt=timezone.now(), use=1)
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
            error_temp = None
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
                                                                    note, '1', request.user.id)
                                error_temp = schedule_result['error']

                            if error_temp is None:
                                error_temp = func_refresh_lecture_count(lecture_id)

                            if error_temp is None:
                                error_temp = func_check_group_available_member_after(class_id, group_id, group_schedule_id)

                            if error_temp is not None:
                                raise InternalError
                            else:
                                log_data = LogTb(log_type='LS02', auth_member_id=request.user.id,
                                                 from_member_name=request.user.last_name + request.user.first_name,
                                                 to_member_name=member_info.name,
                                                 class_tb_id=class_id,
                                                 log_info=group_info.name + '그룹 일정', log_how='추가',
                                                 log_detail=str(schedule_start_datetime) + '/' + str(
                                                     schedule_end_datetime),
                                                 reg_dt=timezone.now(), use=1)
                                log_data.save()

                                push_info_schedule_start_date = str(schedule_start_datetime).split(':')
                                push_info_schedule_end_date = str(schedule_end_datetime).split(' ')[1].split(':')
                                func_send_push_trainer(lecture_id, class_type_name + ' 수업 - 일정 알림',
                                                       request.user.last_name + request.user.first_name + '님이 '
                                                       + push_info_schedule_start_date[0] + ':' +
                                                       push_info_schedule_start_date[1]
                                                       + '~' + push_info_schedule_end_date[0] + ':' +
                                                       push_info_schedule_end_date[1] + ' 그룹 일정을 등록했습니다')

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
                # if error is None:
                #    error = error_temp
                # else:
                #    error = error+'/'+error_temp

    if error is None:
        request.session['push_title'] = ''
        request.session['push_info'] = ''
        request.session['lecture_id'] = ''
        if info_message is not None:
            info_message += ' 님의 일정이 등록되지 않았습니다.'
            messages.info(request, info_message)
        return redirect(next_page)
    else:
        logger.error(
            request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)
        return redirect(next_page)


# 그룹 일정 삭제
def delete_group_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id', '')
    date = request.POST.get('date', '')
    day = request.POST.get('day', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    request.session['date'] = date
    request.session['day'] = day

    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:
        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            group_info = GroupTb.objects.get(group_id=schedule_info.group_tb_id)
        except ObjectDoesNotExist:
            error = '그룹 정보를 불러오지 못했습니다.'

    if error is None:

        try:
            with transaction.atomic():
                delete_schedule = DeleteScheduleTb(schedule_id=schedule_info.schedule_id,
                                                   class_tb_id=schedule_info.class_tb_id,
                                                   group_tb_id=schedule_info.group_tb_id,
                                                   lecture_tb_id=schedule_info.lecture_tb_id,
                                                   delete_repeat_schedule_tb=schedule_info.repeat_schedule_tb_id,
                                                   start_dt=schedule_info.start_dt, end_dt=schedule_info.end_dt,
                                                   permission_state_cd=schedule_info.permission_state_cd,
                                                   state_cd=schedule_info.state_cd, note=schedule_info.note,
                                                   en_dis_type=schedule_info.en_dis_type,
                                                   member_note=schedule_info.member_note,
                                                   reg_member_id=schedule_info.reg_member_id,
                                                   del_member_id=str(request.user.id),
                                                   reg_dt=schedule_info.reg_dt, mod_dt=timezone.now(), use=0)

                delete_schedule.save()
                schedule_info.delete()

        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '이미 삭제된 일정입니다'
        except InternalError as e:
            error = '이미 삭제된 일정입니다'

    if error is None:

        member_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__state_cd='IP',
                                                            lecture_tb__use=1)

        for member_lecture_data_info in member_lecture_data:
            member_lecture_info = member_lecture_data_info.lecture_tb
            member_lecture_info.schedule_check = 1
            member_lecture_info.save()

        log_data = LogTb(log_type='LS03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name+' 그룹 일정', log_how='삭제',
                         log_detail=str(schedule_info.start_dt) + '/' + str(schedule_info.end_dt),
                         reg_dt=timezone.now(), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(
            request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)
        return redirect(next_page)


# 일정 추가
@csrf_exempt
def add_member_group_schedule_logic(request):
    # group_id = request.POST.get('group_id')
    # lecture_id = request.POST.get('lecture_id')
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
        if lecture_id == '':
            error = '회원님의 예약 가능한 일정이 없습니다.'

    if error is None:
        error = func_check_group_available_member_before(class_id, group_id, group_schedule_id)

    if error is None:
        try:
            with transaction.atomic():
                if error is None:
                    schedule_result = func_add_schedule(class_id, lecture_id, None,
                                                        group_id, group_schedule_id,
                                                        schedule_info.start_dt, schedule_info.end_dt,
                                                        note, '1', request.user.id)
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
                         log_info=group_info.name+'그룹 일정', log_how='추가',
                         log_detail=str(schedule_info.start_dt) + '/' + str(schedule_info.end_dt),
                         reg_dt=timezone.now(), use=1)
        log_data.save()

    if error is None:
        push_info_schedule_start_date = str(schedule_info.start_dt).split(':')
        push_info_schedule_end_date = str(schedule_info.end_dt).split(' ')[1].split(':')
        func_send_push_trainer(lecture_id, class_type_name + ' 수업 - 일정 알림',
                               request.user.last_name + request.user.first_name + '님이 '
                               + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]
                               + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]+' 그룹 일정을 등록했습니다')
        # request.session['push_title'] = class_type_name + ' 수업 - 일정 알림'
        # request.session['push_info'] = request.user.last_name+request.user.first_name+'님이 '\
        #                               + push_info_schedule_start_date[0] + ':' + push_info_schedule_start_date[1]\
        #                               + '~' + push_info_schedule_end_date[0] + ':' + push_info_schedule_end_date[1]+' 그룹 일정을 등록했습니다'
        # request.session['lecture_id'] = lecture_id
        request.session['push_title'] = ''
        request.session['push_info'] = ''
        request.session['lecture_id'] = ''

        return redirect(next_page)
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
    repeat_schedule_time = request.POST.get('repeat_start_time')
    repeat_schedule_time_duration = request.POST.get('repeat_dur')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    error_date_message = None
    class_info = None
    group_info = None
    repeat_week_type_data = []
    repeat_schedule_start_date_info = None
    repeat_schedule_end_date_info = None
    repeat_schedule_info = None
    pt_schedule_input_counter = 0
    group_schedule_reg_counter = 0

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
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        # 그룹 정보 가져오기
        try:
            group_info = GroupTb.objects.get(group_id=group_id, use=1)
        except ObjectDoesNotExist:
            error = '그룹 정보를 불러오지 못했습니다.'

    if error is None and group_info.group_type_cd == 'NORMAL':
        group_lecture_data = GroupLectureTb.objects.filter(group_tb_id=group_id,
                                                           group_tb__use=1,
                                                           lecture_tb__state_cd='IP',
                                                           lecture_tb__lecture_avail_count__gt=0,
                                                           lecture_tb__use=1,
                                                           use=1)

        if len(group_lecture_data) == 0:
            error = '그룹에 해당하는 회원들의 예약 가능 횟수가 없습니다.'

        for group_lecture_info in group_lecture_data:
            if group_schedule_reg_counter < group_lecture_info.lecture_tb.lecture_avail_count:
                group_schedule_reg_counter = group_lecture_info.lecture_tb.lecture_avail_count

    if error is None:
        # 반복 일정 데이터 등록
        repeat_schedule_info = RepeatScheduleTb(class_tb_id=class_id,
                                                group_tb_id=group_id,
                                                repeat_type_cd=repeat_type,
                                                week_info=repeat_week_type,
                                                start_date=repeat_schedule_start_date_info, end_date=repeat_schedule_end_date_info,
                                                start_time=repeat_schedule_time, time_duration=repeat_schedule_time_duration,
                                                state_cd='NP', en_dis_type='1',
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

            # 그룹 스케쥴 등록 횟수 설정
            if error is None and group_info.group_type_cd == 'NORMAL':
                group_schedule_reg_counter -= 1
                if group_schedule_reg_counter < 0:
                    break

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

                time_duration_temp = class_info.class_hour*int(repeat_schedule_time_duration)
                schedule_end_datetime = schedule_start_datetime + \
                                        datetime.timedelta(minutes=int(time_duration_temp))
            except ValueError as e:
                error = '등록 값에 문제가 있습니다.'
            except IntegrityError as e:
                error = '등록 값에 문제가 있습니다.'
            except TypeError as e:
                error = '등록 값의 형태에 문제가 있습니다.'

            if error is None:

                try:
                    with transaction.atomic():
                        # PT 일정 추가라면 일정 추가해야할 lecture id 찾기
                        if error is None:
                            schedule_result = func_add_schedule(class_id, None, repeat_schedule_info.repeat_schedule_id,
                                                                group_id, None,
                                                                schedule_start_datetime, schedule_end_datetime,
                                                                '', '1', request.user.id)
                            error = schedule_result['error']

                        if error is None:
                            error = func_date_check(class_id, schedule_result['schedule_id'],
                                                    str(check_date).split(' ')[0], schedule_start_datetime, schedule_end_datetime)

                            if error is not None:
                                raise ValidationError()
                            else:
                                pt_schedule_input_counter += 1

                        error = None

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

                if error == '날짜가 중복됐습니다.' or error == '등록 값에 문제가 있습니다.' or error == '등록중 오류가 발생했습니다.':
                    logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
                    messages.error(request, error)
                elif error == '등록 값의 형태에 문제가 있습니다.' or error == '등록할수 있는 일정이 없습니다.' or error == '강사 정보를 불러오지 못했습니다.':
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

    if pt_schedule_input_counter == 0:
        repeat_schedule_info.delete()

    request.session['repeat_schedule_input_counter'] = pt_schedule_input_counter
    if error_date_message is not None:
        # logger.info(error_date_message)
        messages.info(request, error_date_message)
    if error is not None:
        request.session['repeat_schedule_id'] = ''
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
    member_info = None
    information = None
    request.session['date'] = date
    request.session['day'] = day

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
        try:
            group_info = GroupTb.objects.get(group_id=repeat_schedule_info.group_tb_id)
        except ObjectDoesNotExist:
            error = '그룹 정보를 불러오지 못했습니다.'

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
            request.session['push_title'] = ''
            request.session['push_info'] = ''
            request.session['lecture_id'] = ''

        else:
            member_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__state_cd='IP', lecture_tb__use=1)
            for member_lecture_data_info in member_lecture_data:
                member_lecture_info = member_lecture_data_info.lecture_tb
                member_lecture_info.schedule_check = 1
                member_lecture_info.save()

            log_data = LogTb(log_type='LR01', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             class_tb_id=class_id,
                             log_info=group_info.name + ' 그룹 반복 일정', log_how='추가',
                             log_detail=str(start_date) + '/' + str(end_date),
                             reg_dt=timezone.now(), use=1)
            log_data.save()

            schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id, use=1)

            if group_info.group_type_cd == 'NORMAL':
                member_list = func_get_available_group_member_list(group_info.group_id)

                for member_info in member_list:
                    error_temp = None
                    lecture_id = func_get_group_lecture_id(group_info.group_id, member_info.member_id)
                    if lecture_id is not None and lecture_id != '':
                        repeat_schedule_info = RepeatScheduleTb(class_tb_id=repeat_schedule_info.class_tb_id,
                                                                group_tb_id=repeat_schedule_info.group_tb_id,
                                                                group_schedule_id=repeat_schedule_info.repeat_schedule_id,
                                                                lecture_tb_id=lecture_id,
                                                                repeat_type_cd=repeat_schedule_info.repeat_type_cd,
                                                                week_info=repeat_schedule_info.week_info,
                                                                start_date=repeat_schedule_info.start_date, end_date=repeat_schedule_info.end_date,
                                                                start_time=repeat_schedule_info.start_time, time_duration=repeat_schedule_info.time_duration,
                                                                state_cd='NP', en_dis_type=repeat_schedule_info.en_dis_type,
                                                                reg_member_id=request.user.id,
                                                                reg_dt=timezone.now(), mod_dt=timezone.now())

                        repeat_schedule_info.save()
                        for schedule_info in schedule_data:
                            error_temp = func_check_group_available_member_before(class_id, group_info.group_id,
                                                                                  schedule_info.schedule_id)
                            if error_temp is None:
                                try:
                                    with transaction.atomic():
                                        if error_temp is None:
                                            schedule_result = func_add_schedule(class_id, lecture_id,
                                                                                repeat_schedule_info.repeat_schedule_id,
                                                                                group_info.group_id, schedule_info.schedule_id,
                                                                                schedule_info.start_dt,
                                                                                schedule_info.end_dt,
                                                                                '', '1', request.user.id)
                                            error_temp = schedule_result['error']

                                        if error_temp is None:
                                            error_temp = func_refresh_lecture_count(lecture_id)

                                        if error_temp is None:
                                            error_temp = func_check_group_available_member_after(class_id, group_info.group_id,
                                                                                                 schedule_info.schedule_id)

                                        if error_temp is not None:
                                            raise InternalError

                                except TypeError:
                                    error_temp = error_temp
                                except ValueError:
                                    error_temp = error_temp
                                except IntegrityError:
                                    error_temp = error_temp
                                except InternalError:
                                    error_temp = error_temp

                    log_data = LogTb(log_type='LR01', auth_member_id=request.user.id,
                                     from_member_name=request.user.last_name + request.user.first_name,
                                     to_member_name=member_info.name,
                                     class_tb_id=class_id,
                                     log_info=group_info.name + ' 그룹 반복 일정', log_how='추가',
                                     log_detail=str(start_date) + '/' + str(end_date),
                                     reg_dt=timezone.now(), use=1)
                    log_data.save()
                    func_send_push_trainer(lecture_id, class_type_name + ' 수업 - 일정 알림',
                                           request.user.last_name + request.user.first_name + '님이 ' + str(start_date) \
                                           + '~' + str(end_date) + ' 그룹 반복일정을 등록했습니다')

            request.session['push_title'] = ''
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


# 그룹 반복 일정 삭제
@csrf_exempt
def delete_group_repeat_schedule_logic(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id')
    date = request.POST.get('date', '')
    day = request.POST.get('day', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')
    class_type_name = request.session.get('class_type_name', '')
    error = None
    schedule_data = None
    start_date = None
    end_date = None
    group_repeat_schedule_info = None
    request.session['date'] = date
    request.session['day'] = day
    if repeat_schedule_id == '':
        error = '확인할 반복일정을 선택해주세요.'

    if error is None:
        try:
            group_repeat_schedule_info = RepeatScheduleTb.objects.get(repeat_schedule_id=repeat_schedule_id)
        except ObjectDoesNotExist:
            error = '반복 일정이 존재하지 않습니다'

    if error is None:
        try:
            group_info = GroupTb.objects.get(group_id=group_repeat_schedule_info.group_tb_id)
        except ObjectDoesNotExist:
            error = '그룹 정보를 불러오지 못했습니다.'

    if error is None:
        start_date = group_repeat_schedule_info.start_date
        end_date = group_repeat_schedule_info.end_date

    if error is None:
        # 오늘 이후 날짜 반복일정만 제거 -> 전체 제거
        schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id)

    if error is None:
        try:
            with transaction.atomic():
                for delete_schedule_info in schedule_data:
                    end_schedule_counter = ScheduleTb.objects.filter(group_schedule_id=delete_schedule_info.schedule_id,
                                                                     state_cd='PE', use=1).count()
                    if end_schedule_counter == 0:
                        delete_schedule = DeleteScheduleTb(schedule_id=delete_schedule_info.schedule_id,
                                                           class_tb_id=delete_schedule_info.class_tb_id,
                                                           group_tb_id=delete_schedule_info.group_tb_id,
                                                           lecture_tb_id=delete_schedule_info.lecture_tb_id,
                                                           delete_repeat_schedule_tb=delete_schedule_info.repeat_schedule_tb_id,
                                                           start_dt=delete_schedule_info.start_dt, end_dt=delete_schedule_info.end_dt,
                                                           permission_state_cd=delete_schedule_info.permission_state_cd,
                                                           state_cd=delete_schedule_info.state_cd, note=delete_schedule_info.note,
                                                           en_dis_type=delete_schedule_info.en_dis_type,
                                                           member_note=delete_schedule_info.member_note,
                                                           reg_member_id=delete_schedule_info.reg_member_id,
                                                           del_member_id=str(request.user.id),
                                                           reg_dt=delete_schedule_info.reg_dt, mod_dt=timezone.now(), use=0)

                        delete_schedule.save()
                        delete_schedule_info.delete()
                    if error is not None:
                        break

                if error is not None:
                    raise ValidationError()

                delete_repeat_schedule = DeleteRepeatScheduleTb(class_tb_id=group_repeat_schedule_info.class_tb_id,
                                                                lecture_tb_id=group_repeat_schedule_info.lecture_tb_id,
                                                                group_tb_id=group_repeat_schedule_info.group_tb_id,
                                                                repeat_schedule_id=group_repeat_schedule_info.repeat_schedule_id,
                                                                repeat_type_cd=group_repeat_schedule_info.repeat_type_cd,
                                                                week_info=group_repeat_schedule_info.week_info,
                                                                start_date=group_repeat_schedule_info.start_date,
                                                                end_date=group_repeat_schedule_info.end_date,
                                                                start_time=group_repeat_schedule_info.start_time,
                                                                time_duration=group_repeat_schedule_info.time_duration,
                                                                state_cd=group_repeat_schedule_info.state_cd,
                                                                en_dis_type=group_repeat_schedule_info.en_dis_type,
                                                                reg_member_id=group_repeat_schedule_info.reg_member_id,
                                                                reg_dt=group_repeat_schedule_info.reg_dt,
                                                                mod_dt=timezone.now(), use=0)
                delete_repeat_schedule.save()
                group_repeat_schedule_info.delete()

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

    if error is None:
        member_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__state_cd='IP', lecture_tb__use=1)
        for member_lecture_data_info in member_lecture_data:
            member_lecture_info = member_lecture_data_info.lecture_tb
            member_lecture_info.schedule_check = 1
            member_lecture_info.save()

        log_data = LogTb(log_type='LR02', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name + ' 그룹 반복 일정', log_how='삭제',
                         log_detail=str(start_date) + '/' + str(end_date),
                         reg_dt=timezone.now(), use=1)
        log_data.save()

        request.session['push_title'] = ''
        request.session['push_info'] = ''
        request.session['lecture_id'] = ''

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)

