import datetime

from django import forms
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.db import IntegrityError

from configs.const import SCHEDULE_DUPLICATION_ENABLE, USE
from trainer.models import LectureTb
from .models import ScheduleTb


def null_string_validator(value, text):
    if value is None or value == '':
        raise forms.ValidationError(text+'를 입력해 주세요.')


def date_time_validator(value):
    error = None
    date_time = value.split(' ')
    if date_time[1] == '24:00':
        value = date_time[0] + ' 23:59'

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
    lecture_id = forms.IntegerField(label='수업 정보', required=False)
    start_dt = forms.CharField(label='시작 일시', validators=[date_time_validator], required=True)
    end_dt = forms.CharField(label='종료 일시', validators=[date_time_validator], required=True)
    lecture_member_ids = forms.MultipleChoiceField(label='회원 정보', required=False)
    note = forms.CharField(label='강사 메모', required=False)
    en_dis_type = forms.IntegerField(label='일정 종류', initial='test', required=True)
    duplication_enable_flag = forms.IntegerField(label='중복 여부', initial=SCHEDULE_DUPLICATION_ENABLE, required=True)

    def clean_lecture_member_ids(self):
        return self.data.getlist('lecture_member_ids[]')

    def clean_start_dt(self):
        start_dt = self.cleaned_data["start_dt"]
        return datetime.datetime.strptime(start_dt, '%Y-%m-%d %H:%M')

    def clean_end_dt(self):
        end_dt = self.cleaned_data["end_dt"]
        return datetime.datetime.strptime(end_dt, '%Y-%m-%d %H:%M')

    def clean_lecture_id(self):
        lecture_id = self.cleaned_data["lecture_id"]
        lecture_member_ids = self.cleaned_data["lecture_member_ids"]

        error = None
        lecture_info = None

        if lecture_id is not None:
            try:
                lecture_info = LectureTb.objects.get(lecture_id=lecture_id, use=USE)
                if len(lecture_member_ids) > lecture_info.member_num:
                    error = '수업 정원보다 등록하려는 회원수가 많습니다.'
            except ObjectDoesNotExist:
                error = '수업 정보를 불러오지 못햇습니다.'

        if error is not None:
            raise ValidationError(error)
        return lecture_info

    def clean(self):
        cleaned_data_test = self.cleaned_data
        start_dt = cleaned_data_test.get("start_dt")
        end_dt = cleaned_data_test.get("end_dt")

        if start_dt == end_dt:
            raise ValidationError('일정을 다시 선택해주세요.')

        return cleaned_data_test
