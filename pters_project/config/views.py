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
