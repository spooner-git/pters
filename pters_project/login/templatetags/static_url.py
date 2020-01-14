import datetime
import logging
import os
from os import path

from django import template

from configs.settings import STATIC_URL, STATICFILES_DIRS

register = template.Library()
logger = logging.getLogger(__name__)

static_url_cache = {}


@register.filter
def replace_str(value):
    return value.replace("\'", "\"")


@register.simple_tag
def static_url(file_name):
    # value = static_url_cache.get(file_name)
    # if value is None or DEBUG:
    value = calculate_url(file_name)
    return value


def calculate_url(file_name):
    entry_name = file_name
    try:
        key = '#root#'
        if key in file_name:
            file_name = file_name.split(key, 1)[1]
            file_path = path.join(STATICFILES_DIRS[0], entry_name.replace(key, ''))
            prefix = ''
        else:
            file_path = path.join(STATICFILES_DIRS[0], file_name)
            prefix = STATIC_URL

        file_modified = calculate_file_name(path.join(STATICFILES_DIRS[0], file_path))
        if file_modified != 'error':
            file_modified = file_modified[: 16]
        value = '%s%s?v=%s' % (prefix, file_name, file_modified)
        # logger.info("Caching url '%s' for file '%s'", value, file_name)
    except Exception as e:
        if hasattr(e, 'errno') and e.errno == 21:  # is a directory
            value = STATIC_URL + file_name
            logger.error("Caching url '%s' for directory %s", value, file_name)
        else:
            raise Exception('Unable to calculate md5 for {} because {}', file_name, e)
    static_url_cache[entry_name] = value
    return value


def calculate_file_name(file_path):

    try:
        temp = str(datetime.datetime.fromtimestamp(os.path.getmtime(file_path)))
    except FileNotFoundError:
        temp = 'error'
    if temp != 'error':
        temp = temp.replace(' ', '_')
    return temp
    # with open(file_path, 'rb') as fh:
    #    m = hashlib.md5()
    #    while True:
    #        data = fh.read(8192)
    #        if not data:
    #            break
    #        m.update(data)
    #    return m.hexdigest()
