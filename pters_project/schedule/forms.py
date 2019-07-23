import datetime

from django import forms
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.db import IntegrityError

from configs.const import SCHEDULE_DUPLICATION_ENABLE, USE, ON_SCHEDULE_TYPE
from login.models import MemberTb
from schedule.functions import func_get_lecture_member_ticket_id
from trainer.models import LectureTb


def null_string_validator(value, text):
    if value is None or value == '':
        raise forms.ValidationError(text+'를 입력해 주세요.')


def date_time_validator(value):
    error = None
    date_time = value.split(' ')
    check_time = False
    if date_time[1] == '24:00':
        value = date_time[0] + ' 23:59'
        check_time = True
    try:
        datetime.datetime.strptime(value, '%Y-%m-%d %H:%M')
    except ValueError:
        error = '등록 값에 문제가 있습니다.'
    except IntegrityError:
        error = '등록 값에 문제가 있습니다.'
    except TypeError:
        error = '등록 값에 문제가 있습니다.'

    if error is not None:
        raise forms.ValidationError(error)


class AddScheduleTbForm(forms.Form):
    lecture_member_ids = forms.MultipleChoiceField(label='회원 정보', required=False)
    en_dis_type = forms.CharField(label='일정 종류', required=False)
    lecture_id = forms.IntegerField(label='수업 정보', required=False)
    start_dt = forms.CharField(label='시작 일시', validators=[date_time_validator], required=True)
    end_dt = forms.CharField(label='종료 일시', validators=[date_time_validator], required=True)
    note = forms.CharField(label='강사 메모', required=False)
    duplication_enable_flag = forms.IntegerField(label='중복 여부', initial=SCHEDULE_DUPLICATION_ENABLE, required=False)
    lecture_info = None

    def clean_lecture_member_ids(self):
        return self.data.getlist('lecture_member_ids[]')

    def clean_start_dt(self):
        start_dt = self.cleaned_data["start_dt"]

        date_time = start_dt.split(' ')
        check_time = False

        if date_time[1] == '24:00':
            start_dt = date_time[0] + ' 23:59'
            check_time = True

        start_dt = datetime.datetime.strptime(start_dt, '%Y-%m-%d %H:%M')
        if check_time:
            start_dt = start_dt + datetime.timedelta(minutes=1)

        return start_dt

    def clean_end_dt(self):
        end_dt = self.cleaned_data["end_dt"]
        date_time = end_dt.split(' ')
        check_time = False

        if date_time[1] == '24:00':
            end_dt = date_time[0] + ' 23:59'
            check_time = True

        end_dt = datetime.datetime.strptime(end_dt, '%Y-%m-%d %H:%M')
        if check_time:
            end_dt = end_dt + datetime.timedelta(minutes=1)

        return end_dt

    def clean_lecture_id(self):
        lecture_id = self.cleaned_data["lecture_id"]
        en_dis_type = self.cleaned_data["en_dis_type"]
        lecture_member_ids = self.cleaned_data["lecture_member_ids"]

        error = None
        if lecture_id is not None:
            try:
                lecture_info = LectureTb.objects.get(lecture_id=lecture_id, use=USE)
                if len(lecture_member_ids) > lecture_info.member_num:
                    error = '수업 정원보다 등록하려는 회원수가 많습니다.'
                self.lecture_info = lecture_info
            except ObjectDoesNotExist:
                error = '수업 정보를 불러오지 못햇습니다.'
        else:
            if en_dis_type == ON_SCHEDULE_TYPE:
                error = '수업을 선택해주세요.'
        if error is not None:
            raise ValidationError(error)

        return lecture_id

    def clean(self):
        cleaned_data = self.cleaned_data
        start_dt = cleaned_data.get("start_dt")
        end_dt = cleaned_data.get("end_dt")

        if start_dt == end_dt:
            raise ValidationError('일정을 다시 선택해주세요.')

        return cleaned_data

    def get_lecture_info(self):
        return self.lecture_info

    def get_member_list(self, class_id):
        member_list = []
        lecture_id = self.cleaned_data["lecture_id"]
        lecture_member_ids = self.cleaned_data["lecture_member_ids"]
        for lecture_member_id in lecture_member_ids:
            error = None
            member_name = None
            member_ticket_id = None
            try:
                member_info = MemberTb.objects.get(member_id=lecture_member_id)
                member_name = member_info.name
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'

            if error is None:
                member_ticket_result = func_get_lecture_member_ticket_id(class_id, lecture_id,
                                                                         lecture_member_id)
                if member_ticket_result['error'] is not None:
                    error = member_ticket_result['error']
                else:
                    member_ticket_id = member_ticket_result['member_ticket_id']

            member_list.append({'member_id': lecture_member_id,
                                'member_name': member_name,
                                'member_ticket_id': member_ticket_id,
                                'error': error})

        return member_list
