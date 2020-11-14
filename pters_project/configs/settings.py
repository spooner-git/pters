"""
Django settings for pters project.

Generated by 'django-admin startproject' using Django 1.10.5.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.10/ref/settings/
"""
import os
import pymysql

pymysql.install_as_MySQLdb()

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.10/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("PTERS_DJANGO_SECRET", '')

# SECURITY WARNING: don't run with debug turned on in production!

DEBUG = True

APP_VERSION = '4.0'

# ALLOWED_HOSTS = ['pters.co.kr','www.pters.co.kr','kr.pters.co.kr','jp.pters.co.kr','us.pters.co.kr','13.125.37.117']
ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'el_pagination',
    'debug_toolbar',
    'login',
    'schedule',
    'trainee',
    'trainer',
    'payment',
    'stats',
    'board',
    'tasks',
    'admin_spooner',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    # 'django.middleware.cache.UpdateCacheMiddleware',
    # 'django.middleware.cache.FetchFromCacheMiddleware',
]
# CACHES = {
#     'default': {
#         'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
#         'LOCATION': '127.0.0.1:8000',
#     }
# }
# CACHE_MIDDLEWARE_SECONDS = 86400

INTERNAL_IPS = ('127.0.0.1', 'localhost',)
ROOT_URLCONF = 'configs.urls'

AUTHENTICATION_BACKENDS = (
    # Needed to login by username in Django admin, regardless of `allauth`
    "django.contrib.auth.backends.ModelBackend",
    # If is_active is 0, login will be ok
    'django.contrib.auth.backends.AllowAllUsersModelBackend'
    # `allauth` specific authentication methods, such as login by e-mail
    # "allauth.account.auth_backends.AuthenticationBackend",
)

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates'), ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'configs.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.10/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'pters-test',
        'USER': os.environ.get("PTERS_DB_USER", ''),
        'PASSWORD': os.environ.get("PTERS_DB_PASSWORD", ''),
        'HOST': os.environ.get("PTERS_DB_HOST", ''),
        'PORT': '3306',
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.10/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    # {
    #     'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    # },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/

LANGUAGE_CODE = 'ko-kr'

TIME_ZONE = 'Asia/Seoul'

USE_I18N = True

USE_L10N = False                    # if setting -> korean

USE_TZ = False

DATETIME_FORMAT = 'Y-m-d H:i:s'     # '2006-10-25 14:30:59'
DATE_FORMAT = 'Y-m-d'
TIME_FORMAT = 'H:i:s'


STATIC_URL = '/static/'

STATICFILES_DIRS = (
  os.path.join(BASE_DIR, "static"),
  'static/',
)
# STATIC_ROOT = '/static/'
# STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.CachedStaticFilesStorage'

# LOGIN URL
LOGIN_URL = '/'
LOGIN_REDIRECT_URL = '/trainer/index/'

# IMP API
PAYMENT_ID = os.environ.get("PAYMENT_ID", '')
PTERS_IMP_REST_API_KEY = os.environ.get('PTERS_IMP_REST_API_KEY', '')
PTERS_IMP_REST_API_SECRET = os.environ.get('PTERS_IMP_REST_API_SECRET', '')

# Email Activation
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_USE_SSL = True
EMAIL_PORT = os.environ.get("PTERS_EMAIL_POST", '')
EMAIL_HOST = os.environ.get("PTERS_EMAIL_HOST", '')
EMAIL_HOST_USER = os.environ.get("PTERS_EMAIL_HOST_USER", '')
EMAIL_HOST_PASSWORD = os.environ.get("PTERS_EMAIL_HOST_PASSWORD", '')
DEFAULT_FROM_EMAIL = os.environ.get("PTERS_EMAIL_DEFAULT", '')
ACCOUNT_ACTIVATION_DAYS = 7


# AWS S3 Upload
PTERS_AWS_ACCESS_KEY_ID = os.environ.get("PTERS_AWS_ACCESS_KEY_ID", '')
PTERS_AWS_SECRET_ACCESS_KEY = os.environ.get("PTERS_AWS_SECRET_ACCESS_KEY", '')
PTERS_AWS_S3_BUCKET_NAME = os.environ.get("PTERS_AWS_S3_BUCKET_NAME", '')
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}

PTERS_AWS_PUSH_API_KEY = os.environ.get("PTERS_AWS_PUSH_API_KEY", '')

PTERS_PUSH_SERVER_KEY = os.environ.get("PTERS_PUSH_SERVER_KEY", '')
PTERS_reCAPTCHA_SECRET_KEY = os.environ.get("PTERS_reCAPTCHA_SECRET_KEY", '')
PTERS_SMS_ACTIVATION_MAX_COUNT = 10

PTERS_NAVER_ACCESS_KEY_ID = os.environ.get("PTERS_NAVER_ACCESS_KEY_ID", '')
PTERS_NAVER_SECRET_KEY = os.environ.get("PTERS_NAVER_SECRET_KEY", '')
PTERS_NAVER_SMS_API_KEY_ID = os.environ.get("PTERS_NAVER_SMS_API_KEY_ID", '')
PTERS_NAVER_SMS_SECRET_KEY = os.environ.get("PTERS_NAVER_SMS_SECRET_KEY", '')
SMS_ACTIVATION_SECONDS = 180
EMAIL_ACTIVATION_SECONDS = 600
RESET_PASSWORD_ACTIVATION_SECONDS = 300
PTERS_NAVER_SMS_PHONE_NUMBER = os.environ.get("PTERS_NAVER_SMS_PHONE_NUMBER", '')

PTERS_NAVER_ID_LOGIN_CLIENT_ID = os.environ.get("PTERS_NAVER_ID_LOGIN_CLIENT_ID", '')
PTERS_NAVER_ID_LOGIN_CLIENT_SECRET = os.environ.get("PTERS_NAVER_ID_LOGIN_CLIENT_SECRET", '')

# db data upload size
DATA_UPLOAD_MAX_NUMBER_FIELDS = 100000

PTERS_IOS_SUBSCRIPTION_SECRET = os.environ.get("PTERS_IOS_SUBSCRIPTION_SECRET", '')

LOG_FILE = os.path.join(os.path.dirname(__file__), '..', 'logs/default_log.log')
LOG_FILE_LOGIN = os.path.join(os.path.dirname(__file__), '..', 'logs/login_log.log')
LOG_FILE_SCHEDULE = os.path.join(os.path.dirname(__file__), '..', 'logs/schedule_log.log')
LOG_FILE_TRAINEE = os.path.join(os.path.dirname(__file__), '..', 'logs/trainee_log.log')
LOG_FILE_TRAINER = os.path.join(os.path.dirname(__file__), '..', 'logs/trainer_log.log')
LOG_FILE_PAYMENT = os.path.join(os.path.dirname(__file__), '..', 'logs/payment_log.log')
LOG_FILE_TASKS = os.path.join(os.path.dirname(__file__), '..', 'logs/tasks_log.log')
LOG_FILE_ADMIN_SPOONER = os.path.join(os.path.dirname(__file__), '..', 'logs/admin_spooner_log.log')
LOG_FILE_BOARD = os.path.join(os.path.dirname(__file__), '..', 'logs/board_log.log')
LOG_FILE_CONFIGS = os.path.join(os.path.dirname(__file__), '..', 'logs/configs_log.log')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
            'datefmt': "%d/%b/%Y %H:%M:%S"
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'default': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOG_FILE,
            'maxBytes': 1024*1024*5,  # 5 MB
            'formatter': 'verbose',
            'backupCount': 5,
        },
        'login_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': LOG_FILE_LOGIN,
            'maxBytes': 1024*1024*10,
            'backupCount': 5,
        },
        'trainer_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': LOG_FILE_TRAINER,
            'maxBytes': 1024*1024*10,
            'backupCount': 5,
        },
        'trainee_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': LOG_FILE_TRAINEE,
            'maxBytes': 1024*1024*10,
            'backupCount': 5,
        },
        'schedule_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': LOG_FILE_SCHEDULE,
            'maxBytes': 1024*1024*10,
            'backupCount': 5,
        },
        'payment_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': LOG_FILE_PAYMENT,
            'maxBytes': 1024*1024*10,
            'backupCount': 5,
        },
        'tasks_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': LOG_FILE_TASKS,
            'maxBytes': 1024*1024*10,
            'backupCount': 5,
        },
        'admin_spooner_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': LOG_FILE_ADMIN_SPOONER,
            'maxBytes': 1024*1024*10,
            'backupCount': 5,
        },
        'board_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': LOG_FILE_BOARD,
            'maxBytes': 1024*1024*10,
            'backupCount': 5,
        },
        'configs_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': LOG_FILE_CONFIGS,
            'maxBytes': 1024*1024*10,
            'backupCount': 5,
        },
    },
    'loggers': {
        '': {
            'handlers': ['default'],
            'propagate': True,
            'level': 'ERROR',
        },
        'django': {
            'handlers': ['default'],
            'propagate': True,
            'level': 'ERROR',
        },
        'django.request': {
            'handlers': ['default'],
            'propagate': False,
            'level': 'ERROR',
        },
        'login': {
            'handlers': ['login_file'],
            'level': 'DEBUG',
        },
        'trainer': {
            'handlers': ['trainer_file'],
            'level': 'DEBUG',
        },
        'trainee': {
            'handlers': ['trainee_file'],
            'level': 'DEBUG',
        },
        'schedule': {
            'handlers': ['schedule_file'],
            'level': 'DEBUG',
        },
        'payment': {
            'handlers': ['payment_file'],
            'level': 'DEBUG',
        },
        'tasks': {
            'handlers': ['tasks_file'],
            'level': 'DEBUG',
        },
        'admin_spooner': {
            'handlers': ['admin_spooner_file'],
            'level': 'DEBUG',
        },
        'board': {
            'handlers': ['board_file'],
            'level': 'DEBUG',
        },
        'configs': {
            'handlers': ['configs_file'],
            'level': 'DEBUG',
        },
    }
}

EL_PAGINATION_LOADING = "<img src='/static/user/res/ajax/loading.gif' alt='loading' style='width:10%;'/>"


# celery
# Required
# your redis server url
CELERY_BROKER_URL = 'redis://localhost:6379/0'
# your redis url for getting result
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
#  Customize the settings # https://docs.celeryproject.org/en/latest/userguide/configuration.html
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Asia/Seoul'
CELERY_ENABLE_UTC = False
# Define the timezone for the scheduler, Celery beat.


