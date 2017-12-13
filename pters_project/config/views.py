from django.contrib.auth.models import User

# Create your views here.
from django.views.generic import RedirectView
from django.contrib.auth.mixins import LoginRequiredMixin


class HomeView(LoginRequiredMixin, RedirectView):

    def get(self, request, **kwargs):
        user_for_group = User.objects.get(id=request.user.id)
        group_1 = user_for_group.groups.get(user=request.user.id)
        if group_1.name == 'trainee':
            self.url = '/trainee/'
        elif group_1.name == 'trainer':
            self.url = '/trainer/'
        elif group_1.name == 'admin':
            self.url = '/trainer/'
        else:
            self.url = ''
        return super(HomeView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(HomeView, self).get_redirect_url(*args, **kwargs)


class TrainerView(RedirectView):

    def get(self, request, **kwargs):
        user_for_group = User.objects.get(id=request.user.id)
        group_1 = user_for_group.groups.get(user=request.user.id)
        if group_1.name == 'trainee':
            self.url = '/trainee/'
        return super(TrainerView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(TrainerView, self).get_redirect_url(*args, **kwargs)


class TraineeView(RedirectView):

    def get(self, request, **kwargs):
        user_for_group = User.objects.get(id=request.user.id)
        group_1 = user_for_group.groups.get(user=request.user.id)
        #print(self.url)
        if group_1.name == 'trainer':
            self.url = '/trainer/'
        else:
            self.url = self.url
        return super(TraineeView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(TraineeView, self).get_redirect_url(*args, **kwargs)


def date_check_func(training_dt, add_start_dt, add_end_dt, origin_start_dt, origin_end_dt):
    error = None

    if origin_start_dt >= add_start_dt:
        if origin_start_dt < add_end_dt:
            error = training_dt + '등록 시간이 겹칩니다.'
    if origin_end_dt > add_start_dt:
        if origin_end_dt < add_end_dt:
            error = training_dt + '등록 시간이 겹칩니다.'
    if origin_start_dt <= add_start_dt:
        if origin_end_dt >= add_end_dt:
            error = training_dt + '등록 시간이 겹칩니다.'

    return error

