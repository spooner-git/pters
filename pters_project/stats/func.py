import datetime

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q, Sum

from configs.const import USE
from schedule.models import ClassLectureTb


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
            try:
                price_info = ClassLectureTb.objects.filter(
                                        Q(lecture_tb__start_date__gte=month_first_day)
                                        & Q(lecture_tb__start_date__lte=month_last_day),
                                        class_tb_id=class_id, auth_cd='VIEW', lecture_tb__use=USE,
                                        use=USE).aggregate(Sum('lecture_tb__price'))
                price = int(price_info['lecture_tb__price__sum'])
            except TypeError:
                price = 0

            # 환불 정보 가져오기
            try:
                refund_price_info = ClassLectureTb.objects.filter(
                                        Q(lecture_tb__refund_date__gte=month_first_day)
                                        & Q(lecture_tb__refund_date__lte=month_last_day),
                                        class_tb_id=class_id, auth_cd='VIEW', lecture_tb__use=USE,
                                        use=USE).aggregate(Sum('lecture_tb__refund_price'))
                refund_price = int(refund_price_info['lecture_tb__refund_price__sum'])
            except TypeError:
                refund_price = 0

            month_price_info = {'month': str(month_first_day.date()),
                                'price': price,
                                'refund_price': refund_price}

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
        price_data = ClassLectureTb.objects.filter(
                                Q(lecture_tb__start_date__gte=month_first_day)
                                & Q(lecture_tb__start_date__lte=month_last_day),
                                class_tb_id=class_id, auth_cd='VIEW', lecture_tb__use=USE,
                                use=USE).order_by('lecture_tb__start_date', 'reg_dt')

        for price_info in price_data:
            try:
                price_lecture_info = ClassLectureTb.objects.filter(~Q(lecture_tb_id=price_info.lecture_tb_id),
                                                                   class_tb_id=class_id,
                                                                   lecture_tb__member_id
                                                                   =price_info.lecture_tb.member_id,
                                                                   lecture_tb__start_date__gte
                                                                   =price_info.lecture_tb.start_date,
                                                                   lecture_tb__use=USE, auth_cd='VIEW',
                                                                   use=USE).latest('reg_dt')
                if price_lecture_info.reg_dt < price_info.lecture_tb.reg_dt:
                    trade_info = '연장 결제'
                    trade_type = 1
                else:
                    trade_info = '신규 결제'
                    trade_type = 0
            except ObjectDoesNotExist:
                trade_info = '신규 결제'
                trade_type = 0

            price_info = {'date': str(price_info.lecture_tb.start_date),
                          'trade_type': trade_type,
                          'trade_info': trade_info,
                          'price': price_info.lecture_tb.price}
            price_list.append(price_info)

        # 환불 정보 가져오기
        refund_price_data = ClassLectureTb.objects.filter(
                                Q(lecture_tb__refund_date__gte=month_first_day)
                                & Q(lecture_tb__refund_date__lte=month_last_day),
                                class_tb_id=class_id, auth_cd='VIEW', lecture_tb__use=USE,
                                use=USE).order_by('lecture_tb__refund_date')

        for refund_price_info in refund_price_data:
            if refund_price_info.lecture_tb.price != refund_price_info.lecture_tb.refund_price:
                trade_info = '부분 환불'
                trade_type = 3
            else:
                trade_info = '전체 환불'
                trade_type = 2
            price_info = {'date': str(refund_price_info.lecture_tb.refund_date),
                          'trade_type': trade_type,
                          'trade_info': trade_info,
                          'price': refund_price_info.lecture_tb.refund_price}
            price_list.append(price_info)

        price_list.sort(key=lambda x: x['date'])

    context = {'error': error, 'price_data': price_list}

    return context
