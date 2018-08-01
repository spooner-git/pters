from django import forms

from .models import LectureTb


class LectureTbForm(forms.ModelForm):

    class Meta:
        model = LectureTb
