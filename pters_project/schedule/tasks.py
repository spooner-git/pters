import json

import httplib2

# `celery` 프로그램을 작동시키기 위한 기본 장고 세팅 값을 정한다.
from celery import shared_task

from configs import settings
from configs.const import AUTH_TYPE_VIEW, USE
from login.models import PushInfoTb
from trainer.models import MemberClassTb
from trainee.models import MemberTicketTb


# 강사 -> 회원 push 메시지 전달
@shared_task
def func_send_push_trainer(member_ticket_id, title, message):
    error = None
    push_server_id = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')
    if member_ticket_id is not None and member_ticket_id != '':
        # member_member_ticket_data = MemberMemberTicketTb.objects.filter(member_ticket_tb_id=member_ticket_id, use=USE)
        # for class_member_ticket_info in member_member_ticket_data:
        member_ticket_info = MemberTicketTb.objects.filter(member_ticket_id=member_ticket_id,
                                                           member_auth_cd=AUTH_TYPE_VIEW, use=USE)
        for member_ticket_info in member_ticket_info:
            token_data = PushInfoTb.objects.filter(member_id=member_ticket_info.member.member_id)
            for token_info in token_data:
                if token_info.device_id != 'pc':
                    token_info.badge_counter += 1
                    token_info.save()
                instance_id = token_info.token
                badge_counter = token_info.badge_counter
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


# 회원 -> 강사 push 메시지 전달
@shared_task
def func_send_push_trainee(class_id, title, message):
    push_server_id = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')
    error = None
    if class_id is not None and class_id != '':

        member_class_data = MemberClassTb.objects.filter(class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, use=USE)

        for member_class_info in member_class_data:

            token_data = PushInfoTb.objects.filter(member_id=member_class_info.member.member_id)
            for token_info in token_data:
                if token_info.device_id != 'pc':
                    token_info.badge_counter += 1
                    token_info.save()
                instance_id = token_info.token
                badge_counter = token_info.badge_counter
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
