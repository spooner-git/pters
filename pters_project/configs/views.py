from django.contrib.auth.models import User

# Create your views here.
from django.views.generic import RedirectView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin


class HomeView(LoginRequiredMixin, RedirectView):

    def get(self, request, **kwargs):
        user_for_group = User.objects.get(id=request.user.id)
        group = user_for_group.groups.get(user=request.user.id)
        if group.name == 'trainee':
            self.url = '/trainee/'
        elif group.name == 'trainer':
            self.url = '/trainer/'
        elif group.name == 'admin':
            self.url = '/trainer/'
        elif group.name == 'center':
            self.url = '/center/'
        else:
            self.url = ''
        return super(HomeView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(HomeView, self).get_redirect_url(*args, **kwargs)


class AccessTestMixin(UserPassesTestMixin):
    def test_func(self):
        test_result = False
        user_for_group = User.objects.get(id=self.request.user.id)
        group = user_for_group.groups.get(user=self.request.user.id)
        url = self.request.get_full_path().split('/')

        if url[1] == 'trainee':
            if group.name == 'trainee':
                test_result = True
        if url[1] == 'trainer':
            if group.name == 'trainer':
                test_result = True
        if url[1] == 'center':
            if group.name == 'center':
                test_result = True

        return test_result


def date_check_func(pt_schedule_date, add_start_dt, add_end_dt, origin_start_dt, origin_end_dt):
    error = None

    if origin_start_dt >= add_start_dt:
        if origin_start_dt < add_end_dt:
            error = str(pt_schedule_date)+' 등록 시간이 겹칩니다.'
    if origin_end_dt > add_start_dt:
        if origin_end_dt < add_end_dt:
            error = str(pt_schedule_date)+' 등록 시간이 겹칩니다.'
    if origin_start_dt <= add_start_dt:
        if origin_end_dt >= add_end_dt:
            error = str(pt_schedule_date)+' 등록 시간이 겹칩니다.'

    return error


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip