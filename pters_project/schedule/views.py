import datetime
import logging

from django.contrib import messages
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.shortcuts import render, redirect

# Create your views here.
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from config.views import date_check_func
from login.models import LogTb, MemberTb
from schedule.models import ScheduleTb, DeleteScheduleTb, RepeatScheduleTb, DeleteRepeatScheduleTb
from trainee.models import LectureTb
from trainer.models import ClassTb


class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        return context


def add_schedule_logic_func(schedule_date, schedule_start_datetime, schedule_end_datetime,
                            user_id, lecture_id, en_dis_type, repeat_id):

    error = None
    class_info = None

    if error is None:
        # 강사 정보 가져오기
        try:
            class_info = ClassTb.objects.get(member_id=user_id)
        except ObjectDoesNotExist:
            error = '강사 정보가 존재하지 않습니다'

    if en_dis_type == '1':
        if error is None:
            try:
                member_lecture_info = LectureTb.objects.get(lecture_id=int(lecture_id))
            except ObjectDoesNotExist:
                error = '회원 PT 정보가 존재하지 않습니다'
        if error is None:
            if member_lecture_info.lecture_avail_count == 0:
                error = '예약 가능한 횟수가 없습니다'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id)
        for schedule_datum in schedule_data:
            error = date_check_func(schedule_date, schedule_start_datetime, schedule_end_datetime,
                                    schedule_datum.start_dt, schedule_datum.end_dt)
            if error is not None:
                break

    if error is None:
        try:
            with transaction.atomic():

                if repeat_id is None:
                    add_schedule_info = ScheduleTb(class_tb_id=class_info.class_id, lecture_tb_id=lecture_id,
                                                   start_dt=schedule_start_datetime, end_dt=schedule_end_datetime,
                                                   state_cd='NP', en_dis_type=en_dis_type,
                                                   reg_dt=timezone.now(), mod_dt=timezone.now())
                else:
                    add_schedule_info = ScheduleTb(class_tb_id=class_info.class_id, lecture_tb_id=lecture_id,
                                                   repeat_schedule_tb_id=repeat_id,
                                                   start_dt=schedule_start_datetime, end_dt=schedule_end_datetime,
                                                   state_cd='NP', en_dis_type=en_dis_type,
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
                        #add_schedule_info.delete()
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
            error = '예약 가능 횟수를 확인해주세요.'

    return error


def delete_schedule_logic_func(schedule_info):

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
        try:
            with transaction.atomic():
                delete_schedule = DeleteScheduleTb(schedule_id=schedule_info.schedule_id,
                                                   class_tb_id=schedule_info.class_tb_id,
                                                   lecture_tb_id=schedule_info.lecture_tb_id,
                                                   delete_repeat_schedule_tb=schedule_info.repeat_schedule_tb_id,
                                                   start_dt=schedule_info.start_dt, end_dt=schedule_info.end_dt,
                                                   state_cd=schedule_info.state_cd, en_dis_type=schedule_info.en_dis_type,
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

                    #진행 완료된 일정을 삭제하는경우 예약가능 횟수 및 남은 횟수 증가
                    if schedule_info.state_cd == 'PE':
                        lecture_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                          state_cd='PE')
                        if lecture_info.lecture_reg_count >= len(lecture_schedule_data):
                            lecture_info.lecture_rem_count = lecture_info.lecture_reg_count \
                                                               - len(lecture_schedule_data)

                        else:
                            error = '예약 가능한 횟수를 확인해주세요.'
                            raise ValidationError()
                    lecture_info.mod_dt = timezone.now()
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

    return error


def get_trainer_schedule_data_func(context, trainer_id, start_date, end_date):

    error = None
    class_info = None
    context['lecture_info'] = None
    off_schedule_id = []
    off_schedule_start_datetime = []
    off_schedule_end_datetime = []
    pt_schedule_id = []
    pt_schedule_lecture_id = []
    pt_schedule_start_datetime = []
    pt_schedule_end_datetime = []
    pt_schedule_member_name = []
    pt_schedule_finish_check = []
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
    #off_repeat_schedule_reg_dt = []
    #today = datetime.datetime.strptime(date, '%Y-%m-%d')
    #fourteen_days_ago = today - datetime.timedelta(days=14)
    #fifteen_days_after = today + datetime.timedelta(days=15)

    # 강사 정보 가져오기
    try:
        class_info = ClassTb.objects.get(member_id=trainer_id)
    except ObjectDoesNotExist:
        error = '강사 정보가 존재하지 않습니다'

    if error is None:
        # 강사 클래스의 반복일정 불러오기
        off_repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                                   en_dis_type='0')
        for off_repeat_schedule_info in off_repeat_schedule_data:
            off_repeat_schedule_id.append(off_repeat_schedule_info.repeat_schedule_id)
            off_repeat_schedule_type.append(off_repeat_schedule_info.repeat_type_cd)
            off_repeat_schedule_week_info.append(off_repeat_schedule_info.week_info)
            off_repeat_schedule_start_date.append(str(off_repeat_schedule_info.start_date))
            off_repeat_schedule_end_date.append(str(off_repeat_schedule_info.end_date))
            off_repeat_schedule_start_time.append(off_repeat_schedule_info.start_time)
            off_repeat_schedule_time_duration.append(off_repeat_schedule_info.time_duration)

        pt_repeat_schedule_data = RepeatScheduleTb.objexts.filter(class_tb_id=class_info.class_id,
                                                                  en_dis_type='1')
        for pt_repeat_schedule_info in pt_repeat_schedule_data:
            pt_repeat_schedule_id.append(pt_repeat_schedule_info.repeat_schedule_id)
            pt_repeat_schedule_type.append(pt_repeat_schedule_info.repeat_type_cd)
            pt_repeat_schedule_week_info.append(pt_repeat_schedule_info.week_info)
            pt_repeat_schedule_start_date.append(str(pt_repeat_schedule_info.start_date))
            pt_repeat_schedule_end_date.append(str(pt_repeat_schedule_info.end_date))
            pt_repeat_schedule_start_time.append(pt_repeat_schedule_info.start_time)
            pt_repeat_schedule_time_duration.append(pt_repeat_schedule_info.time_duration)

    # 강좌에 해당하는 수강/회원 정보 가져오기, 예약가능 횟수 1개 이상인 회원
    if error is None:
        # 강좌에 해당하는 수강정보 가져오기
        context['lecture_info'] = LectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                           lecture_avail_count__gte=1, use=1)
        for lecture in context['lecture_info']:
            # 수강정보에 해당하는 회원정보 가져오기
            try:
                lecture.member_info = MemberTb.objects.get(member_id=lecture.member_id, use=1)
            except ObjectDoesNotExist:
                error = '회원 정보가 존재하지 않습니다'

    # OFF 일정 조회
    if error is None:
        off_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id,
                                                      en_dis_type='0', start_dt__gte=start_date,
                                                      start_dt__lt=end_date)
        for off_schedule_datum in off_schedule_data:
            off_schedule_id.append(off_schedule_datum.schedule_id)
            off_schedule_start_datetime.append(off_schedule_datum.start_dt)
            off_schedule_end_datetime.append(off_schedule_datum.end_dt)

    # PT 일정 조회
    if error is None:
        # 강사에 해당하는 강좌 정보 불러오기
        lecture_data = LectureTb.objects.filter(class_tb_id=class_info.class_id)
        for lecture_datum in lecture_data:
            # 강좌별로 연결되어있는 회원 리스트 불러오기
            member_data = MemberTb.objects.get(member_id=lecture_datum.member_id)
            # 강좌별로 연결된 PT 스케쥴 가져오기
            lecture_datum.pt_schedule_data = ScheduleTb.objects.filter(lecture_tb=lecture_datum.lecture_id,
                                                                       en_dis_type='1',
                                                                       start_dt__gte=start_date,
                                                                       start_dt__lt=end_date)
            # PT 스케쥴 정보 셋팅
            for pt_schedule_datum in lecture_datum.pt_schedule_data:
                # lecture schedule id 셋팅
                pt_schedule_id.append(pt_schedule_datum.schedule_id)
                # lecture schedule 에 해당하는 lecture id 셋팅
                pt_schedule_lecture_id.append(lecture_datum.lecture_id)
                pt_schedule_member_name.append(member_data.name)
                pt_schedule_start_datetime.append(pt_schedule_datum.start_dt)
                pt_schedule_end_datetime.append(pt_schedule_datum.end_dt)
                # 끝난 스케쥴인지 확인
                if pt_schedule_datum.state_cd == 'PE':
                    pt_schedule_finish_check.append(1)
                else:
                    pt_schedule_finish_check.append(0)

    context['off_schedule_id'] = off_schedule_id
    context['off_schedule_start_datetime'] = off_schedule_start_datetime
    context['off_schedule_end_datetime'] = off_schedule_end_datetime
    context['pt_schedule_id'] = pt_schedule_id
    context['pt_schedule_lecture_id'] = pt_schedule_lecture_id
    context['pt_schedule_member_name'] = pt_schedule_member_name
    context['pt_schedule_start_datetime'] = pt_schedule_start_datetime
    context['pt_schedule_end_datetime'] = pt_schedule_end_datetime
    context['pt_schedule_finish_check'] = pt_schedule_finish_check
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

    return context


# 일정 추가
@csrf_exempt
def add_schedule_logic(request):
    lecture_id = request.POST.get('lecture_id')
    member_name = request.POST.get('member_name')
    schedule_date = request.POST.get('training_date')
    schedule_time = request.POST.get('training_time')
    schedule_time_duration = request.POST.get('time_duration')
    en_dis_type = request.POST.get('en_dis_type')
    next_page = request.POST.get('next_page')

    error = None
    if en_dis_type == '1':
        if lecture_id == '':
            error = '회원을 선택해 주세요.'

    if schedule_date == '':
        error = '날짜를 선택해 주세요.'
    elif schedule_time == '':
        error = '시작 시간을 선택해 주세요.'
    elif schedule_time_duration == '':
        error = '진행 시간을 선택해 주세요.'

    if error is None:
        #날짜 값 셋팅
        try:
            schedule_start_datetime = datetime.datetime.strptime(schedule_date+' '+schedule_time, '%Y-%m-%d %H:%M:%S.%f')
            schedule_end_datetime = schedule_start_datetime + datetime.timedelta(hours=int(schedule_time_duration))
        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태에 문제가 있습니다.'

    if error is None:
        error = add_schedule_logic_func(schedule_date, schedule_start_datetime, schedule_end_datetime,
                                        request.user.id, lecture_id,
                                        en_dis_type, None)

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        log_start_date = schedule_start_datetime.strftime('%Y')+'년 ' \
                         + schedule_start_datetime.strftime('%m')+'월 ' \
                         + schedule_start_datetime.strftime('%d')+'일 ' \
                         + week_info[int(schedule_start_datetime.strftime('%w'))] + '요일 '
        if schedule_start_datetime.strftime('%p') == 'AM':
            log_start_date = str(log_start_date) + '오전'
        elif schedule_start_datetime.strftime('%p') == 'PM':
            log_start_date = str(log_start_date) + '오후'
        log_start_date = str(log_start_date) + schedule_start_datetime.strftime(' %I:%M')

        if schedule_end_datetime.strftime('%p') == 'AM':
            log_end_date = '오전'
        elif schedule_end_datetime.strftime('%p') == 'PM':
            log_end_date = '오후'

        log_end_date = str(log_end_date) + schedule_end_datetime.strftime(' %I:%M')
        if en_dis_type == '1':
            log_contents = '<span>'+request.user.first_name + ' 강사님께서 ' + member_name \
                           + ' 회원님의</span> 일정을 <span class="status">등록</span>했습니다.@'\
                           + log_start_date\
                           + ' - '+log_end_date
        else:
            log_contents = '<span>'+request.user.first_name + ' 강사님께서 '\
                           + ' OFF </span> 일정을 <span class="status">등록</span>했습니다.@'\
                           + log_start_date\
                           + ' - '+log_end_date

        log_data = LogTb(external_id=request.user.id, log_type='LS01', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


# 일정 삭제
@csrf_exempt
def delete_schedule_logic(request):
    pt_schedule_id = request.POST.get('schedule_id')
    off_schedule_id = request.POST.get('off_schedule_id')
    member_name = request.POST.get('member_name')
    en_dis_type = request.POST.get('en_dis_type')
    next_page = request.POST.get('next_page')

    error = None

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
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt
        en_dis_type = schedule_info.en_dis_type

    if error is None:
        error = delete_schedule_logic_func(schedule_info)

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        log_start_date = start_date.strftime('%Y') + '년 ' \
                         + start_date.strftime('%m') + '월 ' \
                         + start_date.strftime('%d') + '일 ' \
                         + week_info[int(start_date.strftime('%w'))] + '요일 '
        if start_date.strftime('%p') == 'AM':
            log_start_date = str(log_start_date) + '오전'
        elif start_date.strftime('%p') == 'PM':
            log_start_date = str(log_start_date) + '오후'
        log_start_date = str(log_start_date) + start_date.strftime(' %I:%M')

        if end_date.strftime('%p') == 'AM':
            log_end_date = '오전'
        elif end_date.strftime('%p') == 'PM':
            log_end_date = '오후'

        log_end_date = str(log_end_date) + end_date.strftime(' %I:%M')
        if en_dis_type == '1':
            log_contents = '<span>' + request.user.first_name + ' 강사님께서 ' + member_name \
                           + ' 회원님의</span> 일정을 <span class="status">삭제</span>했습니다.@' \
                           + log_start_date \
                           + ' - ' + log_end_date
        else:
            log_contents = '<span>' + request.user.first_name + ' 강사님께서 ' \
                           + ' OFF </span> 일정을 <span class="status">삭제</span>했습니다.@' \
                           + log_start_date \
                           + ' - ' + log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LS02', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


# 일정 완료
@csrf_exempt
def finish_schedule_logic(request):
    schedule_id = request.POST.get('schedule_id')
    member_name = request.POST.get('member_name')
    next_page = request.POST.get('next_page')

    error = None
    schedule_info = None
    lecture_info = None

    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:

        try:
            schedule_info = ScheduleTb.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = '스케쥴 정보가 존재하지 않습니다'

    if error is None:
        start_date = schedule_info.start_dt
        end_date = schedule_info.end_dt
        if schedule_info.state_cd == 'PE':
            error = '이미 확정된 스케쥴입니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=schedule_info.lecture_tb_id, use=1)
        except ObjectDoesNotExist:
            error = '회원 PT 정보가 존재하지 않습니다'

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

                lecture_info.mod_dt = timezone.now()
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

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        log_start_date = start_date.strftime('%Y') + '년 ' \
                         + start_date.strftime('%m') + '월 ' \
                         + start_date.strftime('%d') + '일 ' \
                         + week_info[int(start_date.strftime('%w'))] + '요일 '
        if start_date.strftime('%p') == 'AM':
            log_start_date = str(log_start_date) + '오전'
        elif start_date.strftime('%p') == 'PM':
            log_start_date = str(log_start_date) + '오후'
        log_start_date = str(log_start_date) + start_date.strftime(' %I:%M')

        if end_date.strftime('%p') == 'AM':
            log_end_date = '오전'
        elif end_date.strftime('%p') == 'PM':
            log_end_date = '오후'

        log_end_date = str(log_end_date) + end_date.strftime(' %I:%M')
        log_contents = '<span>' + request.user.first_name + ' 강사님께서 ' + member_name \
                       + ' 회원님의</span> 일정을 <span class="status">완료</span>했습니다.@' \
                       + log_start_date \
                       + ' - ' + log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LS03', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


# 반복 일정 추가
@csrf_exempt
def add_repeat_schedule_logic(request):

    lecture_id = request.POST.get('lecture_id')
    member_name = request.POST.get('member_name')
    repeat_type = request.POST.get('repeat_freq')
    repeat_schedule_start_date = request.POST.get('repeat_start_date')
    repeat_schedule_end_date = request.POST.get('repeat_end_date')
    repeat_week_type = request.POST.get('repeat_day')
    repeat_schedule_time = request.POST.get('repeat_start_time')
    repeat_schedule_time_duration = request.POST.get('repeat_dur')
    en_dis_type = request.POST.get('en_dis_type')
    next_page = request.POST.get('next_page')

    error = None
    error_date = None
    class_info = None
    repeat_week_type_data = []
    repeat_schedule_start_date_info = None
    repeat_schedule_end_date_info = None
    repeat_schedule_info = None
    week_info = ['SUN', 'MON', 'TUE', 'WED', 'THS', 'FRI', 'SAT']

    if repeat_type == '':
        error = '반복 빈도를 선택해주세요.'
    else:
        if repeat_week_type == '':
            error = '반복 요일을 설정해주세요.'
        else:
            temp_data = repeat_week_type.split('/')
            for week_type_info in temp_data:
                for idx, week_info_detail in enumerate(week_info):
                    if week_info_detail == week_type_info:
                        repeat_week_type_data.append(idx)
                        break

    if repeat_schedule_start_date == '':
        error = '반복일정 시작 날짜를 선택해 주세요.'
    else:
        repeat_schedule_start_date_info = datetime.datetime.strptime(repeat_schedule_start_date, '%Y-%m-%d')
        if repeat_schedule_end_date == '':
            repeat_schedule_end_date_info = repeat_schedule_start_date_info + datetime.timedelta(days=365)
        else:
            repeat_schedule_end_date_info = datetime.datetime.strptime(repeat_schedule_end_date, '%Y-%m-%d')

    if repeat_schedule_time == '':
        error = '시작 시간을 선택해 주세요.'
    elif repeat_schedule_time_duration == '':
        error = '진행 시간을 선택해 주세요.'

    if en_dis_type == '1':
        if lecture_id == '':
            error = '회원을 선택해 주세요.'
        elif member_name == '':
            error = '회원을 선택해 주세요.'
    print(str(lecture_id))
    if error is None:
    #강사 정보 가져오기
        try:
            class_info = ClassTb.objects.get(member_id=request.user.id)
        except ObjectDoesNotExist:
            error = '강사 정보가 존재하지 않습니다'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_info.class_id)

    if error is None:
        #반복 일정 데이터 등록
        repeat_schedule_info = RepeatScheduleTb(class_tb_id=class_info.class_id, lecture_tb_id=lecture_id,
                                                repeat_type_cd=repeat_type,
                                                week_info=repeat_week_type,
                                                start_date=repeat_schedule_start_date_info, end_date=repeat_schedule_end_date_info,
                                                start_time=repeat_schedule_time, time_duration=repeat_schedule_time_duration,
                                                state_cd='NP', en_dis_type=en_dis_type,
                                                reg_dt=timezone.now(), mod_dt=timezone.now())

        repeat_schedule_info.save()
        if repeat_schedule_info.repeat_schedule_id is None:
            request.session['repeat_schedule_id'] = ''
        request.session['repeat_schedule_id'] = repeat_schedule_info.repeat_schedule_id

    if error is None:

        check_date = repeat_schedule_start_date_info
        while check_date <= repeat_schedule_end_date_info:
            week_idx = -1
            for week_type_info in repeat_week_type_data:
                if week_type_info >= int(check_date.strftime('%w')):
                    week_idx = week_type_info
                    break
            if week_idx == -1:
                week_idx = repeat_week_type_data[0]

            week_idx -= int(check_date.strftime('%w'))
            if week_idx < 0:
                if repeat_type == '2W':
                    week_idx += 14
                else:
                    week_idx += 7

            check_date = check_date + datetime.timedelta(days=week_idx)
            try:
                schedule_start_datetime = datetime.datetime.strptime(str(check_date).split(' ')[0]
                                                                     + ' ' + repeat_schedule_time,
                                                                     '%Y-%m-%d %H:%M:%S.%f')
                schedule_end_datetime = schedule_start_datetime + datetime.timedelta(
                    hours=int(repeat_schedule_time_duration))
            except ValueError as e:
                error = '등록 값에 문제가 있습니다.'
            except IntegrityError as e:
                error = '등록 값에 문제가 있습니다.'
            except TypeError as e:
                error = '등록 값의 형태에 문제가 있습니다.'

            if error is None:
                for schedule_datum in schedule_data:
                    error = date_check_func(str(check_date).split(' ')[0], schedule_start_datetime,
                                            schedule_end_datetime,
                                            schedule_datum.start_dt, schedule_datum.end_dt)

                    if error is not None:
                        if error_date is None:
                            error_date = error
                        else:
                            error_date = error_date + '/' + error
                        break
                if error is None:
                    error = add_schedule_logic_func(str(check_date).split(' ')[0], schedule_start_datetime,
                                                    schedule_end_datetime, request.user.id,
                                                    lecture_id, en_dis_type,
                                                    repeat_schedule_info.repeat_schedule_id)

                    if error == '예약 가능한 횟수가 없습니다':
                        check_date = repeat_schedule_end_date_info + datetime.timedelta(days=1)
                        error = None
                    elif error == '예약 가능한 횟수를 확인해주세요.':
                        check_date = repeat_schedule_end_date_info + datetime.timedelta(days=1)
                        error = None

                    # 한번 더 확인 필요
                    if error is not None:
                        if error_date is None:
                            error_date = error
                        else:
                            error_date = error_date + '/' + error
                    error = None
                else:
                    error = None

            check_date = check_date + datetime.timedelta(days=1)

            if int(check_date.strftime('%w')) == 0:
                if repeat_type == '2W':
                    check_date = check_date + datetime.timedelta(days=7)
            '''
        #날짜 값 셋팅
        for week_type_info in repeat_week_type_data:
            week_idx = 0
            for idx, week_info_detail in enumerate(week_info):
                if week_info_detail == week_type_info:
                    week_idx = idx
                    break
            check_date = repeat_schedule_start_date_info
            week_idx -= int(check_date.strftime('%w'))
            if week_idx < 0:
                week_idx += 7

            check_date = check_date + datetime.timedelta(days=week_idx)
            while check_date <= repeat_schedule_end_date_info:

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

                if error is None:
                    for schedule_datum in schedule_data:
                        error = date_check_func(str(check_date).split(' ')[0], schedule_start_datetime, schedule_end_datetime,
                                                schedule_datum.start_dt, schedule_datum.end_dt)

                        if error is not None:
                            if error_date is None:
                                error_date = error
                            else:
                                error_date = error_date + '/' + error
                            break
                    if error is None:
                        error = add_schedule_logic_func(str(check_date).split(' ')[0], schedule_start_datetime,
                                                        schedule_end_datetime, request.user.id,
                                                        lecture_id, en_dis_type,
                                                        repeat_schedule_info.repeat_schedule_id)

                        #한번 더 확인 필요
                        if error is not None:
                            if error_date is None:
                                error_date = error
                            else:
                                error_date = error_date + '/' + error
                        error = None
                    else:
                        error = None

                if repeat_type == '2W':
                    check_date = check_date + datetime.timedelta(days=14)
                else:
                    check_date = check_date + datetime.timedelta(days=7)
'''
    if error is None:
        if error_date is not None:
            messages.info(request, error_date)
            return redirect(next_page)
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


@csrf_exempt
def add_repeat_schedule_confirm(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id')
    repeat_confirm = request.POST.get('repeat_confirm')
    next_page = request.POST.get('next_page')

    error = None
    repeat_schedule_data = None
    start_date = None
    end_date = None
    en_dis_type = None
    lecture_info = None
    member_info = None

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
                lecture_info = LectureTb.objects.get(lecture_id=repeat_schedule_data.lecture_tb_id)
            except ObjectDoesNotExist:
                error = '회원 PT 정보가 존재하지 않습니다'

            if error is None:
                member_info = MemberTb.objects.get(member_id=lecture_info.member_id)

    if error is None:
        if repeat_confirm == '0':
            try:
                with transaction.atomic():
                    schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id)
                    schedule_data.delete()
                    repeat_schedule_data.delete()
                    if en_dis_type == '1':
                        lecture_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
                        if lecture_info.lecture_reg_count >= len(lecture_schedule_data):
                            lecture_info.lecture_avail_count = lecture_info.lecture_reg_count \
                                                               - len(lecture_schedule_data)
                        else:
                            error = '예약 가능한 횟수를 확인해주세요.'
                            raise ValidationError()
                        lecture_info.mod_dt = timezone.now()
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
                error = '반복일정 등록이 취소됐습니다.'
        else:

            log_start_date = start_date.strftime('%Y')+'년 ' \
                             + start_date.strftime('%m')+'월 ' \
                             + start_date.strftime('%d')+'일 '
            log_start_date = str(log_start_date)

            log_end_date = end_date.strftime('%Y')+'년 ' \
                             + end_date.strftime('%m')+'월 ' \
                             + end_date.strftime('%d')+'일 '
            log_end_date = str(log_end_date)

            if en_dis_type == '1':
                log_contents = '<span>'+request.user.first_name + ' 강사님께서 ' + member_info.name \
                               + ' 회원님의</span> 반복 일정을 <span class="status">등록</span>했습니다.@'\
                               + log_start_date\
                               + ' - '+log_end_date
            else:
                log_contents = '<span>' + request.user.first_name + ' 강사님께서 ' \
                               + ' OFF </span> 반복 일정을 <span class="status">등록</span>했습니다.@' \
                               + log_start_date \
                               + ' - ' + log_end_date
            log_data = LogTb(external_id=request.user.id, log_type='LR01', contents=log_contents, reg_dt=timezone.now(),
                             use=1)
            log_data.save()

            error = '반복일정 등록이 완료됐습니다.'
    if error is None:
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)


@csrf_exempt
def delete_repeat_schedule_logic(request):

    repeat_schedule_id = request.POST.get('repeat_schedule_id')
    next_page = request.POST.get('next_page')

    error = None
    schedule_data = None
    start_date = None
    end_date = None
    en_dis_type = None
    lecture_info = None
    member_info = None
    repeat_schedule_info = None

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
                lecture_info = LectureTb.objects.get(lecture_id=repeat_schedule_info.lecture_tb_id)
            except ObjectDoesNotExist:
                error = '회원 PT 정보가 존재하지 않습니다.'
            if error is None:
                try:
                    member_info = MemberTb.objects.get(member_id=lecture_info.member_id)
                except ObjectDoesNotExist:
                    error = '회원 정보가 존재하지 않습니다.'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(repeat_schedule_tb_id=repeat_schedule_id, start_dt__gte=timezone.now())

    if error is None:
        try:
            with transaction.atomic():
                for delete_schedule_info in schedule_data:
                    if delete_schedule_info.state_cd != 'PE':
                        error = delete_schedule_logic_func(delete_schedule_info)
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
    if error is None:
        log_start_date = start_date.strftime('%Y')+'년 ' \
                         + start_date.strftime('%m')+'월 ' \
                         + start_date.strftime('%d')+'일 '
        log_start_date = str(log_start_date)

        log_end_date = end_date.strftime('%Y')+'년 ' \
                         + end_date.strftime('%m')+'월 ' \
                         + end_date.strftime('%d')+'일 '
        log_end_date = str(log_end_date)

        if en_dis_type == '1':
            log_contents = '<span>'+request.user.first_name + ' 강사님께서 ' + member_info.name \
                           + ' 회원님의</span> 반복 일정을 <span class="status">삭제</span>했습니다.@'\
                           + log_start_date\
                           + ' - '+log_end_date
        else:
            log_contents = '<span>' + request.user.first_name + ' 강사님께서 ' \
                           + ' OFF </span> 반복 일정을 <span class="status">삭제</span>했습니다.@' \
                           + log_start_date \
                           + ' - ' + log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='LR02', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        return redirect(next_page)

