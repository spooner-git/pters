from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordResetForm, AuthenticationForm, SetPasswordForm, UsernameField
from django.contrib.auth.models import User
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.validators import MinLengthValidator, RegexValidator
from django.forms import TextInput, CharField
from django.template import loader
from django.utils.functional import lazy
from registration.forms import RegistrationForm

from login.models import MemberTb
from django.utils.translation import ugettext, ugettext_lazy as _


class AuthUserForm(forms.ModelForm):

    class Meta:
        model = User
        fields = ('username', 'password', 'first_name')


class MemberForm(forms.ModelForm):

    class Meta:
        model = MemberTb
        fields = ('name', 'phone', 'contents')


class MyRegistrationForm(RegistrationForm):
    def __init__(self, *args, **kwargs):
        super(RegistrationForm, self).__init__(*args, **kwargs)
        self.fields['username'].required = True
        self.fields['name'].required = True
        self.fields['email'].required = False

    labels = {
        'username': '아이디',
        'name': '이름',
        'email': '이메일',
        'password1': '비밀번호',
        'password2': '비밀번호 확인'
    }

    username = UsernameField(
        max_length=20,
        validators=[UnicodeUsernameValidator(message='영어, 숫자, -_@ 제외 불가'),
                    MinLengthValidator(4, message='최소 4자 이상 입력'),
                    ]
    )
    name = CharField(
        max_length=20,
        validators=[RegexValidator(regex='[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{2,8}', message='-_ 제외 특수문자 불가'),
                    MinLengthValidator(2, message='최소 2자 이상 입력')]
    )


class MyPasswordResetForm(PasswordResetForm):

    def get_users(self, email):
        """Given an email, return matching user(s) who should receive a reset.

        This allows subclasses to more easily customize the default policies
        that prevent inactive users and users with unusable passwords from
        resetting their password.
        """
        active_users = get_user_model()._default_manager.filter(
            email__iexact=email)
        return (u for u in active_users if u.has_usable_password())


class MyPasswordChangeForm(SetPasswordForm):
    """
    A form that lets a user change their password by entering their old
    password.
    """
    error_messages = dict(SetPasswordForm.error_messages, **{
        'password_incorrect': _("Your old password was entered incorrectly. Please enter it again."),
    })

    field_order = ['new_password1', 'new_password2']
