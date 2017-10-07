from django.contrib.auth.models import User
from django.shortcuts import render
# Create your views here.


def user_group_check(request, group):
    user_for_group = User.objects.get(id=request.user.id)
    group_1 = user_for_group.groups.get(user=request.user.id)
    if group_1.name == group:
        redirect_url = None
    else:
        if group_1.name == 'trainer':
            redirect_url = '/trainer/'
        elif group_1.name == 'admin':
            redirect_url = '/trainer/'
        elif group_1.name == 'trainee':
            redirect_url = '/trainee/'

    return redirect_url

