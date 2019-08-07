import logging
from django import template
register = template.Library()
logger = logging.getLogger(__name__)


@register.filter
def multiply(value, arg):
    return int(value*arg)
