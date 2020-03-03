import json
import httplib2
from celery import shared_task

from configs import settings


@shared_task
def task_send_fire_base_push(instance_id, title, message, badge_counter):
    push_server_id = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')
    error = None
    data = {
        'to': instance_id,
        'notification': {
            'title': title,
            'body': message,
            'badge': badge_counter,
            'sound': 'default'
        }
    }
    body = json.dumps(data)
    h = httplib2.Http()

    resp, content = h.request("https://fcm.googleapis.com/fcm/send", method="POST", body=body,
                              headers={'Content-Type': 'application/json;',
                                       'Authorization': 'key=' + push_server_id})
    if resp['status'] != '200':
        error = '오류가 발생했습니다.'
    return error


@shared_task
def task_send_fire_base_push_multi(registration_ids, title, message, badge_counter):
    push_server_id = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')
    error = None
    data = {
        'registration_ids': registration_ids,
        'notification': {
            'title': title,
            'body': message,
            'badge': badge_counter,
            'sound': 'default'
        }
    }
    body = json.dumps(data)
    h = httplib2.Http()

    resp, content = h.request("https://fcm.googleapis.com/fcm/send", method="POST", body=body,
                              headers={'Content-Type': 'application/json;',
                                       'Authorization': 'key=' + push_server_id})
    if resp['status'] != '200':
        error = '오류가 발생했습니다.'
    return error


@shared_task
def task_send_fire_base_push_multi_without_badge(registration_ids, title, message):
    push_server_id = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')
    error = None
    data = {
        'registration_ids': registration_ids,
        'notification': {
            'title': title,
            'body': message,
            'sound': 'default'
        }
    }
    body = json.dumps(data)
    h = httplib2.Http()

    resp, content = h.request("https://fcm.googleapis.com/fcm/send", method="POST", body=body,
                              headers={'Content-Type': 'application/json;',
                                       'Authorization': 'key=' + push_server_id})
    if resp['status'] != '200':
        error = '오류가 발생했습니다.'
    return error


@shared_task
def task_send_aws_lambda_for_push_alarm(data):
    pters_aws_push_api_key = getattr(settings, "PTERS_AWS_PUSH_API_KEY", '')
    body = json.dumps(data)
    h = httplib2.Http()

    resp, content = h.request("https://3icgiwnj76.execute-api.ap-northeast-2.amazonaws.com/pters_alarm_200303/pters_schedule_push_alarm",
                              method="POST", body=body,
                              headers={'Content-Type': 'application/json;',
                                       'x-api-key': pters_aws_push_api_key})

    if resp['status'] != '200':
        error = '오류가 발생했습니다.'
    return error
