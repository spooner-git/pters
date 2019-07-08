from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordResetForm, AuthenticationForm, SetPasswordForm
from django.contrib.auth.models import User
from django.forms import TextInput
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
        self.fields['email'].required = False
        self.fields['password1'].widget.attrs.update({
            'autocomplete': 'new-password'
        })


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
