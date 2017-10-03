from django import forms

from .models import MemberTb


class MemberForm(forms.ModelForm):

    class Meta:
        model = MemberTb
        fields = ('username','password',)