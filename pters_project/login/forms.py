from django import forms
from django.contrib.auth.models import User, Group
from login.models import MemberTb


class AuthUserForm(forms.ModelForm):

    class Meta:
        model = User
        fields = ('username', 'password', 'first_name')


#class AuthUserGroupsForm(forms.ModelForm):
#
    #class Meta:
        #model = UserGroups
        #fields = ('user_id', 'group_id')


class MemberForm(forms.ModelForm):

    class Meta:
        model = MemberTb
        fields = ('name','phone','contents')

