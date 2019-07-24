from configs.settings import DEBUG

if DEBUG is False:
    from .celery import app as celery_app

    __all__ = ['celery_app']
