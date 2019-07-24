import os

from celery import Celery

from configs import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configs.settings')

app = Celery('configs')

# namespace='CELERY'는 모든 셀러리 관련 구성 키를 의미한다. 반드시 CELERY라는 접두사로 시작해야 한다.
app.config_from_object('django.conf:settings', namespace='CELERY')

# 장고 app config에 등록된 모든 taks 모듈을 불러온다.
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

CELERY_WORKING = False


def update_celery_status():
    global CELERY_WORKING
    result = app.control.broadcast('ping', reply=True, limit=1)
    CELERY_WORKING = bool(result)
    return CELERY_WORKING
