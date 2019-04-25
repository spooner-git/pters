from django import forms

from .models import LectureTb


def null_string_validator(value, text):
    if value is None or value == '':
        raise forms.ValidationError(text+'를 입력해 주세요.')


class LectureTbForm(forms.ModelForm):

    class Meta:
        model = LectureTb
