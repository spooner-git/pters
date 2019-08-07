import datetime
import logging
from django import template

from django.utils import timezone

register = template.Library()
logger = logging.getLogger(__name__)


@register.filter
def timeuntil_formatting(input_date_time, setting_time):
    today = timezone.now()
    error = None
    try:
        time_compare = datetime.datetime.strptime(str(input_date_time), '%Y-%m-%d %H:%M')
    except ValueError:
        error = '값 없음'

    if error is None:
        # 근접 취소 가능 시간 셋팅
        cancel_prohibition_time = setting_time

        # 근접 취소 시간 확인
        cancel_disable_time = time_compare - datetime.timedelta(minutes=cancel_prohibition_time)
        time_compare_val = (cancel_disable_time - today)
        cancel_prohibition_date = time_compare_val.days
        cancel_prohibition_hour = int(abs(time_compare_val.seconds)/60/60)
        cancel_prohibition_minute = int(abs(time_compare_val.seconds)/60 - cancel_prohibition_hour*60)
        error_comment = ''

        if cancel_prohibition_date > 0:
            error_comment = str(cancel_prohibition_date) + '일'
        elif cancel_prohibition_date == 0:
            if cancel_prohibition_hour > 0:
                error_comment = str(cancel_prohibition_hour) + '시간 '

            if cancel_prohibition_minute > 0:
                error_comment += str(cancel_prohibition_minute) + '분'
    else:
        error_comment = ''
    return error_comment


@property
def is_past_due(self):
    return datetime.date.today() >= self.date


@register.filter
def multiply(value, arg):
    return value * arg
