from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordResetForm, AuthenticationForm
from django.contrib.auth.models import User

from login.models import MemberTb


class AuthUserForm(forms.ModelForm):

    class Meta:
        model = User
        fields = ('username', 'password', 'first_name')


class MemberForm(forms.ModelForm):

    class Meta:
        model = MemberTb
        fields = ('name', 'phone', 'contents')


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

