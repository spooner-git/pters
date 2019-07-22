import datetime

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q

from configs.const import USE, ON_SCHEDULE_TYPE, STATS_RE_REG, STATS_NEW_REG, STATS_PART_REFUND, STATS_ALL_REFUND, \
    STATE_CD_FINISH, AUTH_TYPE_VIEW

from schedule.models import ScheduleTb
from trainer.models import ClassMemberTicketTb


def get_sales_data(class_id, month_first_day, finish_date):

    month_price_list = []
    counter = 0
    error = None
    if month_first_day is None or month_first_day == '':
        error = '시작 날짜를 선택해주세요.'
    else:
        month_first_day = month_first_day.replace(day=1)
    if finish_date is None or finish_date == '':
        error = '종료 날짜를 선택해주세요.'

    if error is None:
        while finish_date >= month_first_day:
            price = 0
            new_reg_price = 0
            re_reg_price = 0
            all_refund_price = 0
            part_refund_price = 0
            refund_price = 0

            if counter > 40:
                error = '매출 통계를 계산할수 있는 범위가 넘었습니다.'
                break
            next_year = int(month_first_day.strftime('%Y')) + 1
            next_month = (int(month_first_day.strftime('%m')) + 1) % 13
            if next_month == 0:
                next_month = 1
            next_month_first_day = month_first_day.replace(month=next_month)

            if next_month == 1:
                next_month_first_day = next_month_first_day.replace(year=next_year)
            month_last_day = next_month_first_day - datetime.timedelta(days=1)

            # try:
            #     price_info = ClassMemberTicketTb.objects.filter(
            #                             Q(lecture_tb__start_date__gte=month_first_day)
            #                             & Q(lecture_tb__start_date__lte=month_last_day),
            #                             class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, lecture_tb__use=USE,
            #                             use=USE).aggregate(Sum('lecture_tb__price'))
            #     new_reg_price = int(price_info['lecture_tb__price__sum'])
            # except TypeError:
            #     new_reg_price = 0

            # 결제 정보 가져오기
            price_data = ClassMemberTicketTb.objects.select_related(
                'lecture_tb__member').filter(Q(lecture_tb__start_date__gte=month_first_day)
                                             & Q(lecture_tb__start_date__lte=month_last_day),
                                             class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, lecture_tb__use=USE,
                                             use=USE).order_by('lecture_tb__start_date', 'lecture_tb__reg_dt')

            for price_info in price_data:
                try:
                    price_lecture_info = ClassMemberTicketTb.objects.select_related(
                        'lecture_tb').filter(~Q(lecture_tb_id=price_info.lecture_tb_id), class_tb_id=class_id,
                                             lecture_tb__member_id=price_info.lecture_tb.member_id,
                                             lecture_tb__start_date__lte=price_info.lecture_tb.start_date,
                                             lecture_tb__use=USE, auth_cd=AUTH_TYPE_VIEW, use=USE).latest('reg_dt')
                    if price_lecture_info.lecture_tb.start_date < price_info.lecture_tb.start_date:
                        re_reg_price += price_info.lecture_tb.price
                    else:
                        if price_lecture_info.lecture_tb.reg_dt > price_info.lecture_tb.reg_dt:
                            re_reg_price += price_info.lecture_tb.price
                        else:
                            new_reg_price += price_info.lecture_tb.price
                except ObjectDoesNotExist:
                    new_reg_price += price_info.lecture_tb.price
                price += price_info.lecture_tb.price

            # 환불 정보 가져오기
            # try:
            #     refund_price_info = ClassMemberTicketTb.objects.filter(
            #                             Q(lecture_tb__refund_date__gte=month_first_day)
            #                             & Q(lecture_tb__refund_date__lte=month_last_day),
            #                             class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, lecture_tb__use=USE,
            #                             use=USE).aggregate(Sum('lecture_tb__refund_price'))
            #     all_refund_price = int(refund_price_info['lecture_tb__refund_price__sum'])
            # except TypeError:
            #     all_refund_price = 0
            refund_price_data = ClassMemberTicketTb.objects.select_related('lecture_tb').filter(
                                    Q(lecture_tb__refund_date__gte=month_first_day)
                                    & Q(lecture_tb__refund_date__lte=month_last_day),
                                    class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, lecture_tb__use=USE,
                                    use=USE).order_by('lecture_tb__refund_date', 'lecture_tb__reg_dt')

            for refund_price_info in refund_price_data:
                if refund_price_info.lecture_tb.price != refund_price_info.lecture_tb.refund_price:
                    part_refund_price += refund_price_info.lecture_tb.refund_price
                else:
                    all_refund_price += refund_price_info.lecture_tb.refund_price
                refund_price += refund_price_info.lecture_tb.refund_price

            month_price_info = {'month': str(month_first_day.date()),
                                'price': price,
                                'refund_price': refund_price,
                                'new_reg_price': new_reg_price,
                                're_reg_price': re_reg_price,
                                'all_refund_price': all_refund_price,
                                'part_refund_price': part_refund_price}

            month_price_list.append(month_price_info)

            month_first_day = next_month_first_day
            counter += 1

    context = {'error': error, 'month_price_data': month_price_list}

    return context


def get_sales_info(class_id, month_first_day):

    price_list = []
    error = None
    if month_first_day is None or month_first_day == '':
        error = '시작 날짜를 선택해주세요.'
    else:
        month_first_day = month_first_day.replace(day=1)

    if error is None:
        next_year = int(month_first_day.strftime('%Y')) + 1
        next_month = (int(month_first_day.strftime('%m')) + 1) % 13
        if next_month == 0:
            next_month = 1
        next_month_first_day = month_first_day.replace(month=next_month)

        if next_month == 1:
            next_month_first_day = next_month_first_day.replace(year=next_year)
        month_last_day = next_month_first_day - datetime.timedelta(days=1)

        # 결제 정보 가져오기
        price_data = ClassMemberTicketTb.objects.select_related('lecture_tb__member', 'lecture_tb__package_tb').filter(
                                Q(lecture_tb__start_date__gte=month_first_day)
                                & Q(lecture_tb__start_date__lte=month_last_day),
                                class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, lecture_tb__use=USE,
                                use=USE).order_by('lecture_tb__start_date', 'lecture_tb__reg_dt')

        for price_info in price_data:
            try:
                price_lecture_info = ClassMemberTicketTb.objects.select_related(
                    'lecture_tb__member').filter(~Q(lecture_tb_id=price_info.lecture_tb_id),
                                                 class_tb_id=class_id,
                                                 lecture_tb__member_id=price_info.lecture_tb.member_id,
                                                 lecture_tb__start_date__lte=price_info.lecture_tb.start_date,
                                                 lecture_tb__use=USE, auth_cd=AUTH_TYPE_VIEW, use=USE).latest('reg_dt')
                if price_lecture_info.lecture_tb.start_date < price_info.lecture_tb.start_date:
                    trade_info = '추가'
                    trade_type = STATS_RE_REG
                else:
                    if price_lecture_info.lecture_tb.reg_dt > price_info.lecture_tb.reg_dt:
                        trade_info = '추가'
                        trade_type = STATS_RE_REG
                    else:
                        trade_info = '신규'
                        trade_type = STATS_NEW_REG
            except ObjectDoesNotExist:
                trade_info = '신규'
                trade_type = STATS_NEW_REG

            price_info = {'date': str(price_info.lecture_tb.start_date),
                          'trade_type': trade_type,
                          'trade_info': trade_info,
                          'price': price_info.lecture_tb.price,
                          'member_db_id': price_info.lecture_tb.member_id,
                          'member_name': price_info.lecture_tb.member.name,
                          'package_name': price_info.lecture_tb.package_tb.name}
            price_list.append(price_info)

        # 환불 정보 가져오기
        refund_price_data = ClassMemberTicketTb.objects.select_related(
            'lecture_tb__member',
            'lecture_tb__package_tb').filter(Q(lecture_tb__refund_date__gte=month_first_day)
                                             & Q(lecture_tb__refund_date__lte=month_last_day),
                                             class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, lecture_tb__use=USE,
                                             use=USE).order_by('lecture_tb__refund_date', 'lecture_tb__reg_dt')

        for refund_price_info in refund_price_data:
            if refund_price_info.lecture_tb.price != refund_price_info.lecture_tb.refund_price:
                trade_info = '부분 환불'
                trade_type = STATS_PART_REFUND
            else:
                trade_info = '전체 환불'
                trade_type = STATS_ALL_REFUND
            price_info = {'date': str(refund_price_info.lecture_tb.refund_date),
                          'trade_type': trade_type,
                          'trade_info': trade_info,
                          'price': refund_price_info.lecture_tb.refund_price,
                          'member_db_id': refund_price_info.lecture_tb.member_id,
                          'member_name': refund_price_info.lecture_tb.member.name,
                          'package_name': refund_price_info.lecture_tb.package_tb.name}
            price_list.append(price_info)

        price_list.sort(key=lambda x: x['date'], reverse=True)

    context = {'error': error, 'price_data': price_list}

    return context


def get_stats_member_data(class_id, month_first_day, finish_date):
    member_stats_list = []
    counter = 0
    error = None
    total_month_new_reg_member = 0
    total_month_re_reg_member = 0
    total_month_all_refund_member = 0
    total_month_part_refund_member = 0

    if month_first_day is None or month_first_day == '':
        error = '시작 날짜를 선택해주세요.'
    else:
        month_first_day = month_first_day.replace(day=1)
    if finish_date is None or finish_date == '':
        error = '종료 날짜를 선택해주세요.'

    if error is None:
        while finish_date >= month_first_day:
            month_new_reg_member = 0
            month_re_reg_member = 0
            month_all_refund_member = 0
            month_part_refund_member = 0

            if counter > 40:
                error = '매출 통계를 계산할수 있는 범위가 넘었습니다.'
                break
            next_year = int(month_first_day.strftime('%Y')) + 1
            next_month = (int(month_first_day.strftime('%m')) + 1) % 13
            if next_month == 0:
                next_month = 1
            next_month_first_day = month_first_day.replace(month=next_month)

            if next_month == 1:
                next_month_first_day = next_month_first_day.replace(year=next_year)
            month_last_day = next_month_first_day - datetime.timedelta(days=1)

            # 결제 정보 가져오기
            price_data = ClassMemberTicketTb.objects.select_related(
                'lecture_tb').filter(Q(lecture_tb__start_date__gte=month_first_day)
                                     & Q(lecture_tb__start_date__lte=month_last_day),
                                     class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, lecture_tb__use=USE,
                                     use=USE).order_by('lecture_tb__start_date', 'lecture_tb__reg_dt')

            for price_info in price_data:
                try:
                    price_lecture_info = ClassMemberTicketTb.objects.select_related(
                        'lecture_tb').filter(~Q(lecture_tb_id=price_info.lecture_tb_id),
                                             class_tb_id=class_id,
                                             lecture_tb__member_id=price_info.lecture_tb.member_id,
                                             lecture_tb__start_date__lte=price_info.lecture_tb.start_date,
                                             lecture_tb__use=USE, auth_cd=AUTH_TYPE_VIEW,
                                             use=USE).latest('reg_dt')
                    if price_lecture_info.lecture_tb.start_date < price_info.lecture_tb.start_date:
                        month_re_reg_member += 1
                    else:
                        if price_lecture_info.lecture_tb.reg_dt > price_info.lecture_tb.reg_dt:
                            month_re_reg_member += 1
                        else:
                            month_new_reg_member += 1
                except ObjectDoesNotExist:
                    month_new_reg_member += 1

            # 환불 정보 가져오기
            refund_price_data = ClassMemberTicketTb.objects.select_related(
                'lecture_tb').filter(Q(lecture_tb__refund_date__gte=month_first_day)
                                     & Q(lecture_tb__refund_date__lte=month_last_day),
                                     class_tb_id=class_id, auth_cd=AUTH_TYPE_VIEW, lecture_tb__use=USE,
                                     use=USE).order_by('lecture_tb__refund_date', 'lecture_tb__reg_dt')

            for refund_price_info in refund_price_data:
                if refund_price_info.lecture_tb.price != refund_price_info.lecture_tb.refund_price:
                    month_part_refund_member += 1
                else:
                    month_all_refund_member += 1

            # 완료 수강 이력 가져오기
            class_lecture_list = ClassMemberTicketTb.objects.select_related('lecture_tb').filter(
                class_tb_id=class_id, lecture_tb__use=USE, auth_cd=AUTH_TYPE_VIEW, use=USE)
            finish_schedule_num = 0
            for class_lecture_info in class_lecture_list:
                finish_schedule_num += ScheduleTb.objects.filter(
                    Q(state_cd=STATE_CD_FINISH), class_tb_id=class_id, group_tb__isnull=True,
                    lecture_tb_id=class_lecture_info.lecture_tb_id,
                    start_dt__gte=month_first_day, start_dt__lt=month_last_day + datetime.timedelta(days=1),
                    en_dis_type=ON_SCHEDULE_TYPE, use=USE).count()

            finish_schedule_num += ScheduleTb.objects.filter(
                Q(state_cd=STATE_CD_FINISH), class_tb_id=class_id, group_tb__isnull=False, lecture_tb__isnull=True,
                start_dt__gte=month_first_day, start_dt__lt=month_last_day + datetime.timedelta(days=1),
                en_dis_type=ON_SCHEDULE_TYPE, use=USE).count()
            total_month_new_reg_member += month_new_reg_member
            total_month_re_reg_member += month_re_reg_member
            total_month_all_refund_member += month_all_refund_member
            total_month_part_refund_member += month_part_refund_member

            schedule_finish_info = {'month': str(month_first_day.date()),
                                    'finish_schedule_count': finish_schedule_num,
                                    'month_new_reg_member': month_new_reg_member,
                                    'month_re_reg_member': month_re_reg_member,
                                    'month_all_refund_member': month_all_refund_member,
                                    'month_part_refund_member': month_part_refund_member}

            member_stats_list.append(schedule_finish_info)

            month_first_day = next_month_first_day
            counter += 1

    context = {'error': error, 'member_stats_data': member_stats_list,
               'total_month_new_reg_member': total_month_new_reg_member,
               'total_month_re_reg_member': total_month_re_reg_member,
               'total_month_all_refund_member': total_month_all_refund_member,
               'total_month_part_refund_member': total_month_part_refund_member}

    return context
