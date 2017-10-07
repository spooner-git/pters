# Create your views here.
import datetime
from django.contrib import messages
from django.contrib.auth import authenticate,logout, login
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User, Group
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.db import transaction
from django.shortcuts import render, redirect
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from login.models import MemberTb, LogTb
from trainee.models import LectureTb, LectureScheduleTb
from trainer.models import ClassTb, ClassScheduleTb


class IndexView(LoginRequiredMixin, TemplateView):
    template_name = 'main_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'

        context['trainer_member_count'] = 0

        if error is None :
            context['trainer_member_count'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                                       lecture_count__gte=1).count()
            context['trainer_end_member_count'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                                           lecture_count__gte=1,
                                                                           lecture_count__lte=3).count()

        today_time = datetime.datetime.now()
        today_start_time = today_time.strftime('%Y-%m-%d 00:00:00.000000')
        today_end_time = today_time.strftime('%Y-%m-%d 23:59:59.999999')
        sum_val = 0;
        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)

            for lecture in month_lecture_data:
                sum_val = sum_val+LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                   start_dt__gte=today_start_time,
                                                                   start_dt__lte=today_end_time,
                                                                   en_dis_type='1',use='1').count()

        context['today_schedule_val'] = sum_val

        return context


class CalDayView(LoginRequiredMixin, TemplateView):
    template_name = 'daily_cal.html'

    def get_context_data(self, **kwargs):
        context = super(CalDayView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'
            # logger.error(error)

        daily_off_data = []
        class_schedule_data = []
        daily_data = []
        lecture_schedule_data = []

        if error is None:

            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                              en_dis_type='1', use='1')
            for month_class in month_class_data:
                month_class.data = month_class.start_dt.timetuple()
                result = month_class.end_dt - month_class.start_dt
                result_hour = int(result.seconds / 60 / 60)
                # daily_data.append(month_lecture.start_dt.strftime('%Y_%-m_%-d_%-H_%M')
                #                  + '_' + str(result_hour) + '_' + member_data.name)
                daily_off_data.append(str(month_class.data.tm_year) + '_' + str(month_class.data.tm_mon) + '_'
                                  + str(month_class.data.tm_mday) + '_' + str(month_class.data.tm_hour) + '_'
                                  + str(format(month_class.data.tm_min, '02d')) + '_' + str(result_hour) + '_OFF')
                class_schedule_data.append(month_class.class_schedule_id)

        if error is None:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)
            for lecture in month_lecture_data:
                member_data = MemberTb.objects.get(member_id=lecture.member_id)
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb=lecture.lecture_id,
                                                                            en_dis_type='1',use='1')
                for month_lecture in lecture.lecture_schedule:
                    month_lecture.data = month_lecture.start_dt.timetuple()
                    result = month_lecture.end_dt-month_lecture.start_dt
                    result_hour = int(result.seconds/60/60)
                    #daily_data.append(month_lecture.start_dt.strftime('%Y_%-m_%-d_%-H_%M')
                    #                  + '_' + str(result_hour) + '_' + member_data.name)
                    daily_data.append(str(month_lecture.data.tm_year)+'_'+str(month_lecture.data.tm_mon)+'_'
                                      +str(month_lecture.data.tm_mday)+'_'+str(month_lecture.data.tm_hour)+'_'
                                      +str(format(month_lecture.data.tm_min,'02d'))+'_'+str(result_hour)+'_'+member_data.name)
                    lecture_schedule_data.append(month_lecture.lecture_schedule_id)

        context['daily_off_data'] = daily_off_data
        context['daily_lecture_data'] = daily_data
        context['daily_lecture_schedule_id'] = lecture_schedule_data
        context['class_schedule_data'] = class_schedule_data

        return context


class PtAddView(LoginRequiredMixin, TemplateView):
    template_name = 'pt_add.html'

    def get_context_data(self, **kwargs):
        context = super(PtAddView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'

        context['trainer_member'] = None

        if error is None :
            context['trainer_member'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id
                                                                 , lecture_count__gte=1)

            for lecture in context['trainer_member']:
                try:
                    lecture.trainer_member = MemberTb.objects.get(member_id=lecture.member_id)
                except ObjectDoesNotExist:
                    error = 'lecture가 존재하지 않습니다'
                    # logger.error(error)

        return context


class OffAddView(LoginRequiredMixin, TemplateView):
    template_name = 'off_add.html'

    def get_context_data(self, **kwargs):
        context = super(OffAddView, self).get_context_data(**kwargs)

        return context


class OffRepeatAddView(LoginRequiredMixin, TemplateView):
    template_name = 'off_repeat_add.html'

    def get_context_data(self, **kwargs):
        context = super(OffRepeatAddView, self).get_context_data(**kwargs)

        return context


class ManageMemberView(LoginRequiredMixin, TemplateView):
    template_name = 'manage_member.html'

    def get_context_data(self, **kwargs):
        context = super(ManageMemberView, self).get_context_data(**kwargs)
        error = None
        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=self.request.user.id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'
            # logger.error(error)

        context['trainer_member'] = None

        if error is None :
            context['trainer_member'] = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)

            for lecture in context['trainer_member']:
                try:
                    lecture.trainer_member = MemberTb.objects.get(member_id=lecture.member_id)
                except ObjectDoesNotExist:
                    error = 'lecture가 존재하지 않습니다'
                    # logger.error(error)

        return context


class AddMemberView(LoginRequiredMixin, TemplateView):
    template_name = 'member_add.html'

    def get_context_data(self, **kwargs):
        context = super(AddMemberView, self).get_context_data(**kwargs)

        return context


class AlarmView(LoginRequiredMixin, TemplateView):
    template_name = 'alarm.html'

    def get_context_data(self, **kwargs):
        context = super(AlarmView, self).get_context_data(**kwargs)

        log_data = LogTb.objects.filter(external_id=self.request.user.id).order_by('-reg_dt')
        for log_data_detail in log_data:
            temp_data = log_data_detail.contents.split('@')
            if len(temp_data) == 2:
                log_data_detail.log_contents = temp_data[0]
                log_data_detail.log_date = temp_data[1]
            else:
                log_data_detail.log_contents = log_data_detail.contents

        context['log_data'] = log_data

        return context


class LogInTrainerView(TemplateView):
    template_name = 'login_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(LogInTrainerView, self).get_context_data(**kwargs)

        return context


# 회원가입 api
@csrf_exempt
def member_registration(request, next='trainer:member_manage'):
    email = request.POST.get('email')
    name = request.POST.get('name')
    phone = request.POST.get('phone')
    contents = request.POST.get('contents')
    counts = request.POST.get('counts')
    start_date = request.POST.get('start_date')
    end_date = request.POST.get('end_date')

    error = None
    if MemberTb.objects.filter(name=name, phone=phone).exists():
        error = '이미 가입된 회원 입니다.'
    elif User.objects.filter(email=email).exists():
        error = '이미 가입된 회원 입니다.'
    elif email == '':
        error = 'e-mail 정보를 입력해 주세요.'
    elif name == '':
        error = '이름을 입력해 주세요.'
    elif phone == '':
        error = '연락처를 입력해 주세요.'
    elif counts == '':
        error = '남은 횟수를 입력해 주세요.'
    elif start_date == '':
        error = '시작 날짜를 입력해 주세요.'
    elif end_date == '':
        error = '종료 날짜를 입력해 주세요.'

    if error is None:

#        start_date = start_date.split('-')[0] + '-' + start_date.split('-')[1] + '-' + start_date.split('-')[2]
#        end_date = end_date.split('-')[0] + '-' + end_date.split('-')[1] + '-' + end_date.split('-')[2]
        password = email.split('@')[0] + phone[7:]

        try:
            with transaction.atomic():
                user = User.objects.create_user(username=email, email=email, first_name=name, password=password)
                group = Group.objects.get(name='trainee')
                user.groups.add(group)
                member = MemberTb(member_id=user.id, name=name, phone=phone, contents=contents,
                                  mod_dt=timezone.now(),reg_dt=timezone.now(), user_id=user.id)
                member.save()
                trainer_class = ClassTb.objects.get(member_id=request.user.id)
                lecture = LectureTb(class_tb_id=trainer_class.class_id,member_id=member.member_id,
                                    lecture_count=counts,option_cd='DC', state_cd='IP',
                                    start_date=start_date,end_date=end_date, mod_dt=timezone.now(),
                                    reg_dt=timezone.now(), use=1)
                lecture.save()

        except ValueError as e:
            #logger.error(e)
            error = 'Registration ValueError!'
        except IntegrityError as e:
            #logger.error(e)
            error = 'Registration IntegrityError!'
        except TypeError as e:
            error = 'Registration TypeError!'

    if error is None:
        # Send email with activation key
        # user=User.objects.get(username=email)

        # email_subject = 'Account confirmation'
        # email_body = "Hey %s, thanks for signing up. To activate your account, click this link within \
        # 48hours http://local.finers.co.kr:8000/users/confirm/%s" % (user.username, user.profile.activation_key)
        # send_mail(email_subject, email_body, 'test@finers.com', [user.email], fail_silently=False)
        # user = authenticate(username=email, password=password)
        log_contents = '<span>' + request.user.first_name + ' 강사님께서 '\
                       + name + ' 회원님의</span> 정보를 <span class="status">등록</span>했습니다.'
        log_data = LogTb(external_id=request.user.id, log_type='LB', contents=log_contents, reg_dt=timezone.now(),use=1)
        log_data.save()
        return redirect(next)
    else:
        messages.info(request, error)
        next = 'trainer:member_add'
        return redirect(next)


# pt 일정 추가
@csrf_exempt
def add_pt_logic(request, next='trainer:cal_day'):
    lecture_id = request.POST.get('lecture_id')
    member_name = request.POST.get('member_name')
    training_date = request.POST.get('training_date')
    time_duration = request.POST.get('time_duration')
    training_time = request.POST.get('training_time')

    error = None
    if lecture_id == '':
        error = '회원을 선택해 주세요.'
    elif training_date == '':
        error = '날짜를 선택해 주세요.'
    elif time_duration == '':
        error = '진행 시간을 선택해 주세요.'
    elif training_time == '':
        error = '시작 시간을 선택해 주세요.'

    if error is None:

        start_date = datetime.datetime.strptime(training_date+' '+training_time,'%Y-%m-%d %H:%M:%S.%f')
        end_date = start_date + datetime.timedelta(hours=int(time_duration))

        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=request.user.id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'
            # logger.error(error)

        try:
            month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id)
            for month_class in month_class_data:
                if month_class.start_dt >= start_date:
                    if month_class.start_dt < end_date:
                        error = '날짜가 겹칩니다.'
                if month_class.end_dt > start_date:
                    if month_class.end_dt < end_date:
                        error = '날짜가 겹칩니다.'
                if month_class.start_dt <= start_date:
                    if month_class.end_dt >= end_date:
                        error = '날짜가 겹칩니다.'

        except ValueError as e:
            # logger.error(e)
            error = 'Registration ValueError!'
        except IntegrityError as e:
            # logger.error(e)
            error = 'Registration IntegrityError'
        except TypeError as e:
            error = 'Registration TypeError!'

        if error is None:
            try:
                month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)

                for lecture in month_lecture_data:
                    lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb_id=lecture.lecture_id,
                                                                                en_dis_type='1', use=1)
                    for month_lecture in lecture.lecture_schedule:
                        if month_lecture.start_dt >= start_date:
                            if month_lecture.start_dt < end_date:
                                error = '날짜가 겹칩니다.'
                        if month_lecture.end_dt > start_date:
                            if month_lecture.end_dt < end_date:
                                error = '날짜가 겹칩니다.'
                        if month_lecture.start_dt <= start_date:
                            if month_lecture.end_dt >= end_date:
                                error = '날짜가 겹칩니다.'

                if error is None:
                    with transaction.atomic():
                        lecture_schedule_data = LectureScheduleTb(lecture_tb_id=lecture_id, start_dt=start_date, end_dt=end_date,
                                                                  state_cd='NP',en_dis_type='1',
                                                                  reg_dt=timezone.now(),mod_dt=timezone.now(), use=1)
                        lecture_schedule_data.save()
                        lecture_date_update = LectureTb.objects.get(lecture_id=int(lecture_id))
                        member_lecture_count = lecture_date_update.lecture_count
                        lecture_date_update.lecture_count = member_lecture_count-1
                        lecture_date_update.save()

            except ValueError as e:
                #logger.error(e)
                error = 'Registration ValueError!'
            except IntegrityError as e:
                #logger.error(e)
                error = 'Registration IntegrityError!'
            except TypeError as e:
                error = 'Registration TypeError!'

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        log_start_date = start_date.strftime('%Y년 %m월 %d일 ') + week_info[int(start_date.strftime('%w'))] + '요일 '
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
        # + start_date.strftime('%Y년 %m월 %d일')+start_date.strftime('%w')\
        # + start_date.strftime('%p %I:%M')\
        # + '- '+end_date.strftime('%p %I:%M')
        log_contents = '<span>'+request.user.first_name + ' 강사님께서 ' + member_name \
                       + ' 회원님의</span> 일정을 <span class="status">등록</span>했습니다.@'\
                       + log_start_date\
                       + ' - '+log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='SA', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next)
    else:
        messages.info(request, error)
        next = 'trainer:add_pt'
        return redirect(next)


# 로그인 api
@csrf_exempt
def login_trainer(request, next='home'):
    #login 완료시 main page로 이동
    username = request.POST.get('username')
    password = request.POST.get('password')

    error = None

    try:
        user_data = User.objects.get(username=username)
    except ObjectDoesNotExist:
        error = '아이디가 존재하지 않습니다.'
        # logger.error(error)

    if not error:
        user = authenticate(username=username, password=password)
        if user is not None and user.is_active:
            login(request, user)
            #member_detail = MemberTb.objects.get(user_id=user_data.id)
            # request.session['is_first_login'] = True
            #request.session['member_id'] = member_detail.member_id

            return redirect(next)
        else:
            error = '로그인에 실패하였습니다.'
            # logger.error(error)

    messages.info(request, error)
    return redirect(next)


# 로그아웃 api
@csrf_exempt
def logout_trainer(request):
    #logout 끝나면 login page로 이동
    next = 'trainer:trainer_login'
    logout(request)

    return redirect(next)


# 로그인 페이지 아직 구현 x
@csrf_exempt
def login_trainer_view(request):
    if request.user.is_authenticated():
        return redirect('home')

    next = request.GET.get('next', 'trainer:login')
    fail = request.GET.get('fail', 'registration_page')

    return render(request, 'login_web.html',
                  {
                      'next': next,
                      'fail': fail
                  })


# pt 일정 삭제
@csrf_exempt
def daily_pt_delete(request):
    schedule_id = request.POST.get('schedule_id')
    member_name = request.POST.get('member_name')
    next_page = request.POST.get('next_page')

    error = None
    if schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:

        lecture_schedule_data = None
        try:
            lecture_schedule_data = LectureScheduleTb.objects.get(lecture_schedule_id=schedule_id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'
            # logger.error(error)

        if error is None:
            start_date = lecture_schedule_data.start_dt
            end_date = lecture_schedule_data.end_dt

        lecture_data = None
        try:
            lecture_data = LectureTb.objects.get(lecture_id=lecture_schedule_data.lecture_tb_id)
        except ObjectDoesNotExist:
            error = 'Lecture가 존재하지 않습니다'

        try:
            with transaction.atomic():
                lecture_schedule_data.use = 0
                member_lecture_count = lecture_data.lecture_count
                lecture_data.lecture_count = member_lecture_count+1
                lecture_schedule_data.save()
                lecture_data.save()

        except ValueError as e:
            #logger.error(e)
            error = 'Registration ValueError!'
        except IntegrityError as e:
            #logger.error(e)
            error = 'Registration IntegrityError!'
        except TypeError as e:
            error = 'Registration TypeError!'

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        log_start_date = start_date.strftime('%Y년 %m월 %d일 ') + week_info[int(start_date.strftime('%w'))] + '요일 '
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
        # + start_date.strftime('%Y년 %m월 %d일')+start_date.strftime('%w')\
        # + start_date.strftime('%p %I:%M')\
        # + '- '+end_date.strftime('%p %I:%M')
        log_contents = '<span>'+request.user.first_name + ' 강사님께서 ' + member_name \
                       + ' 회원님의</span> 일정을 <span class="status">삭제</span>했습니다.@'\
                       + log_start_date\
                       + ' - '+log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='SA', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        next_page = 'trainer:cal_day'
        return redirect(next_page)


# Off 일정 추가
@csrf_exempt
def off_schedule_add_logic(request, next='trainer:cal_day'):
    training_date = request.POST.get('training_date')
    time_duration = request.POST.get('time_duration')
    training_time = request.POST.get('training_time')

    error = None

    if training_date == '':
        error = '날짜를 선택해 주세요.'
    elif time_duration == '':
        error = '진행 시간을 선택해 주세요.'
    elif training_time == '':
        error = '시작 시간을 선택해 주세요.'

    if error is None:

        start_date = datetime.datetime.strptime(training_date+' '+training_time,'%Y-%m-%d %H:%M:%S.%f')
        end_date = start_date + datetime.timedelta(hours=int(time_duration))

        trainer_class = None
        try:
            trainer_class = ClassTb.objects.get(member_id=request.user.id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'
            # logger.error(error)

        try:
            month_lecture_data = LectureTb.objects.filter(class_tb_id=trainer_class.class_id)

            for lecture in month_lecture_data:
                lecture.lecture_schedule = LectureScheduleTb.objects.filter(lecture_tb_id=lecture.lecture_id,
                                                                            en_dis_type='1', use=1)
                for month_lecture in lecture.lecture_schedule:
                    if month_lecture.start_dt >= start_date:
                        if month_lecture.start_dt < end_date:
                            error = '날짜가 겹칩니다.'
                    if month_lecture.end_dt > start_date:
                        if month_lecture.end_dt < end_date:
                            error = '날짜가 겹칩니다.'
                    if month_lecture.start_dt <= start_date:
                        if month_lecture.end_dt >= end_date:
                            error = '날짜가 겹칩니다.'

        except ValueError as e:
            #logger.error(e)
            error = 'Registration ValueError!'
        except IntegrityError as e:
            #logger.error(e)
            error = 'Registration IntegrityError!'
        except TypeError as e:
            error = 'Registration TypeError!'

        if error is None:
            try:
                month_class_data = ClassScheduleTb.objects.filter(class_tb_id=trainer_class.class_id,
                                                                  en_dis_type='1', use=1)
                for month_class in month_class_data:
                    if month_class.start_dt >= start_date:
                        if month_class.start_dt < end_date:
                            error = '날짜가 겹칩니다.'
                    if month_class.end_dt > start_date:
                        if month_class.end_dt < end_date:
                            error = '날짜가 겹칩니다.'
                    if month_class.start_dt <= start_date:
                        if month_class.end_dt >= end_date:
                            error = '날짜가 겹칩니다.'

                if error is None:
                    class_schedule_data = ClassScheduleTb(class_tb_id=trainer_class.class_id, start_dt=start_date, end_dt=end_date,
                                                          state_cd='NP',en_dis_type='1', reg_dt=timezone.now(), mod_dt=timezone.now(), use=1)
                    class_schedule_data.save()

            except ValueError as e:
                # logger.error(e)
                error = 'Registration ValueError!'
            except IntegrityError as e:
                # logger.error(e)
                error = 'Registration IntegrityError'
            except TypeError as e:
                error = 'Registration TypeError!'

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        log_start_date = start_date.strftime('%Y년 %m월 %d일 ') + week_info[int(start_date.strftime('%w'))] + '요일 '
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
        # + start_date.strftime('%Y년 %m월 %d일')+start_date.strftime('%w')\
        # + start_date.strftime('%p %I:%M')\
        # + '- '+end_date.strftime('%p %I:%M')
        log_contents = '<span>'+request.user.first_name + ' 강사님께서 '\
                       + ' OFF </span> 일정을 <span class="status">등록</span>했습니다.@'\
                       + log_start_date\
                       + ' - '+log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='SA', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next)
    else:
        messages.info(request, error)
        next = 'trainer:add_off'
        return redirect(next)


# OFF 일정 삭제
@csrf_exempt
def daily_off_delete(request):
    off_schedule_id = request.POST.get('off_schedule_id')
    next_page = request.POST.get('next_page')

    error = None
    if off_schedule_id == '':
        error = '스케쥴을 선택하세요.'

    if error is None:

        class_schedule_data = None
        try:
            class_schedule_data = ClassScheduleTb.objects.get(class_schedule_id=off_schedule_id)
        except ObjectDoesNotExist:
            error = 'class가 존재하지 않습니다'
            # logger.error(error)

        if error is None:
            start_date = class_schedule_data.start_dt
            end_date = class_schedule_data.end_dt

        try:
            class_schedule_data.use = 0
            class_schedule_data.save()

        except ValueError as e:
            #logger.error(e)
            error = 'Registration ValueError!'
        except IntegrityError as e:
            #logger.error(e)
            error = 'Registration IntegrityError!'
        except TypeError as e:
            error = 'Registration TypeError!'

    if error is None:
        week_info = ['일', '월', '화', '수', '목', '금', '토']

        log_start_date = start_date.strftime('%Y년 %m월 %d일 ') + week_info[int(start_date.strftime('%w'))] + '요일 '
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
        # + start_date.strftime('%Y년 %m월 %d일')+start_date.strftime('%w')\
        # + start_date.strftime('%p %I:%M')\
        # + '- '+end_date.strftime('%p %I:%M')
        log_contents = '<span>'+request.user.first_name + ' 강사님께서 ' \
                       + ' OFF </span> 일정을 <span class="status">삭제</span>했습니다.@'\
                       + log_start_date\
                       + ' - '+log_end_date
        log_data = LogTb(external_id=request.user.id, log_type='SA', contents=log_contents, reg_dt=timezone.now(),
                         use=1)
        log_data.save()
        return redirect(next_page)
    else:
        messages.info(request, error)
        next_page = 'trainer:cal_day'
        return redirect(next_page)

