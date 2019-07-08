from django import forms

from .models import ScheduleTb


def null_string_validator(value, text):
    if value is None or value == '':
        raise forms.ValidationError(text+'를 입력해 주세요.')


class ScheduleTbForm(forms.ModelForm):

    class Meta:
        model = ScheduleTb

    def clean_start_dt(self):
        start_dt = self.cleaned_data["start_dt"]
        null_string_validator(start_dt, '시작 일시')

        return start_dt

    def clean_end_dt(self):
        end_dt = self.cleaned_data["end_dt"]
        null_string_validator(end_dt, '종료 일시')

        return end_dt
