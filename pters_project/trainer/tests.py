# from django.test import TestCase

# Create your tests here.
# class GetTrainerScheduleView(LoginRequiredMixin, AccessTestMixin, View):
#     template_name = 'ajax/schedule_ajax.html'
#
#     def get(self, request):
#         start_time = timezone.now()
#         context = {}
#         # context = super(GetTrainerScheduleView, self).get_context_data(**kwargs)
#         class_id = self.request.session.get('class_id', '')
#         date = self.request.GET.get('date', '')
#         day = self.request.GET.get('day', '')
#         today = datetime.date.today()
#
#         if date != '':
#             today = datetime.datetime.strptime(date, '%Y-%m-%d')
#         if day == '':
#             day = 46
#         start_date = today - datetime.timedelta(days=int(day))
#         end_date = today + datetime.timedelta(days=int(47))
#         context = func_get_trainer_schedule(context, class_id, start_date, end_date)
#         offScheduleIdArray = []
#         offTimeArray_start_date = []
#         offTimeArray_end_date = []
#         offScheduleNoteArray = []
#         scheduleIdArray = []
#         classArray_lecture_id = []
#         classTimeArray_member_name = []
#         classTimeArray_member_id = []
#         classTimeArray_start_date = []
#         classTimeArray_end_date = []
#         scheduleFinishArray = []
#         scheduleNoteArray = []
#         # scheduleIdxArray = []
#         group_schedule_id = []
#         group_schedule_group_id = []
#         group_schedule_group_name = []
#         group_schedule_max_member_num = []
#         group_schedule_current_member_num = []
#         group_schedule_group_type_cd_name = []
#         group_schedule_start_datetime = []
#         group_schedule_end_datetime = []
#         group_schedule_finish_check = []
#         group_schedule_note = []
#         for off_schedule_info in context['off_schedule_data']:
#             offScheduleIdArray.append(str(off_schedule_info.schedule_id))
#             offTimeArray_start_date.append(str(off_schedule_info.start_dt))
#             offTimeArray_end_date.append(str(off_schedule_info.end_dt))
#             offScheduleNoteArray.append(str(off_schedule_info.note))
#
#         for pt_schedule_info in context['pt_schedule_data']:
#             scheduleIdArray.append(str(pt_schedule_info.schedule_id))
#             classArray_lecture_id.append(str(pt_schedule_info.lecture_tb_id))
#             classTimeArray_member_name.append(str(pt_schedule_info.lecture_tb.member.name))
#             classTimeArray_member_id.append(str(pt_schedule_info.lecture_tb.member.member_id))
#             classTimeArray_start_date.append(str(pt_schedule_info.start_dt))
#             classTimeArray_end_date.append(str(pt_schedule_info.end_dt))
#             scheduleFinishArray.append(str(pt_schedule_info.finish_check()))
#             scheduleNoteArray.append(str(pt_schedule_info.note))
#
#         for group_schedule_info in context['group_schedule_data']:
#             group_schedule_id.append(str(group_schedule_info.schedule_id))
#             group_schedule_group_id.append(str(group_schedule_info.group_tb.group_id))
#             group_schedule_group_name.append(str(group_schedule_info.group_tb.name))
#             group_schedule_max_member_num.append(str(group_schedule_info.group_tb.member_num))
#             group_schedule_current_member_num.append(str(group_schedule_info.group_current_member_num))
#             group_schedule_group_type_cd_name.append(str(group_schedule_info.group_type_cd_name))
#             group_schedule_start_datetime.append(str(group_schedule_info.start_dt))
#             group_schedule_end_datetime.append(str(group_schedule_info.end_dt))
#             group_schedule_finish_check.append(str(group_schedule_info.finish_check()))
#             group_schedule_note.append(str(group_schedule_info.note))
#
#         data = {
#             'offScheduleIdArray': offScheduleIdArray,
#             'offTimeArray_start_date': offTimeArray_start_date,
#             'offTimeArray_end_date': offTimeArray_end_date,
#             'offScheduleNoteArray': offScheduleNoteArray,
#
#             "scheduleIdArray": scheduleIdArray,
#             'classArray_lecture_id': classArray_lecture_id,
#             'classTimeArray_member_name': classTimeArray_member_name,
#             'classTimeArray_member_id': classTimeArray_member_id,
#             'classTimeArray_start_date': classTimeArray_start_date,
#             'classTimeArray_end_date': classTimeArray_end_date,
#             'scheduleFinishArray': scheduleFinishArray,
#             'scheduleNoteArray': scheduleNoteArray,
#
#             'group_schedule_id': group_schedule_id,
#             'group_schedule_group_id': group_schedule_group_id,
#             'group_schedule_group_name': group_schedule_group_name,
#             'group_schedule_max_member_num': group_schedule_max_member_num,
#             'group_schedule_current_member_num': group_schedule_current_member_num,
#             'group_schedule_group_type_cd_name': group_schedule_group_type_cd_name,
#             'group_schedule_start_datetime': group_schedule_start_datetime,
#             'group_schedule_end_datetime': group_schedule_end_datetime,
#             'group_schedule_finish_check': group_schedule_finish_check,
#             'group_schedule_note': group_schedule_note,
#
#             'messageArray': [],
#             'RepeatDuplicationDateArray': [''],
#             'repeatArray': [''],
#             'repeatScheduleCounterArray': ['']
#         }
#         body = json.dumps(data, ensure_ascii=False)
#         end_time = timezone.now()
#         return JsonResponse(body, safe=False)