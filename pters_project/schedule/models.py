# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.core.exceptions import ObjectDoesNotExist
from django.db import models

from center.models import CenterTb
from configs.const import USE, SCHEDULE_NOT_FINISH, SCHEDULE_FINISH
from configs.models import TimeStampedModel
from login.models import MemberTb, CommonCdTb


class ClassTb(TimeStampedModel):
    class_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    center_tb = models.ForeignKey(CenterTb, on_delete=models.SET_NULL, blank=True, null=True)
    subject_cd = models.CharField(db_column='SUBJECT_CD', max_length=10, blank=True, default='')
    subject_detail_nm = models.CharField(db_column='SUBJECT_DETAIL_NM', max_length=20, blank=True, default='')
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    class_hour = models.FloatField(db_column='CLASS_HOUR', blank=True, null=True)  # Field name made lowercase.
    start_hour_unit = models.FloatField(db_column='START_HOUR_UNIT', blank=True, null=True)
    class_member_num = models.IntegerField(db_column='CLASS_MEMBER_NUM', default=1)
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, default='')
    schedule_check = models.IntegerField(db_column='SCHEDULE_CHECK', default=1)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CLASS_TB'

    def __str__(self):
        return self.member.__str__()+'_class'

    def get_class_type_cd_name(self):
        try:
            subject_type_name = CommonCdTb.objects.get(common_cd=self.subject_cd).common_cd_nm
        except ObjectDoesNotExist:
            subject_type_name = ''

        if self.subject_detail_nm is not None and self.subject_detail_nm != '':
            subject_type_name = self.subject_detail_nm

        return subject_type_name

    def get_state_cd_name(self):
        try:
            state_cd_name = CommonCdTb.objects.get(common_cd=self.state_cd).common_cd_nm
        except ObjectDoesNotExist:
            state_cd_name = ''

        return state_cd_name

    def get_center_name(self):
        if self.center_tb_id is not None and self.center_tb_id != '':
            center_name = self.center_tb.center_name
        else:
            center_name = ''

        return center_name


class LectureTb(TimeStampedModel):
    lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    # class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE)  # Field name made lowercase.
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    lecture_reg_count = models.IntegerField(db_column='LECTURE_REG_COUNT', default=0)  # Field name made lowercase.
    lecture_rem_count = models.IntegerField(db_column='LECTURE_REM_COUNT', default=0)
    lecture_avail_count = models.IntegerField(db_column='LECTURE_AVAIL_COUNT', default=0)
    day_count = models.IntegerField(db_column='DAY_COUNT', default=0)  # Field name made lowercase.
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    price = models.IntegerField(db_column='PRICE', default=0)  # Field name made lowercase.
    refund_price = models.IntegerField(db_column='REFUND_PRICE', default=0)
    refund_date = models.DateTimeField(db_column='REFUND_DATE', blank=True, null=True)  # Field name made lowercase.
    option_cd = models.CharField(db_column='OPTION_CD', max_length=10, blank=True, default='')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, default='')
    schedule_check = models.IntegerField(db_column='SCHEDULE_CHECK', default=1)
    note = models.CharField(db_column='NOTE', max_length=255, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'LECTURE_TB'

    def __str__(self):
        return self.member.__str__()+'_lecture'

    def check_authorized(self, class_id):
        try:
            ClassLectureTb.objects.get(class_tb_id=class_id, lecture_tb_id=self.lecture_id,
                                       auth_cd='VIEW', use=USE)
            authorized_check = True
        except ObjectDoesNotExist:
            authorized_check = False

        return authorized_check

    def get_str_start_date(self):
        return str(self.start_date)

    def get_str_end_date(self):
        return str(self.end_date)

    def get_str_reg_dt(self):
        return str(self.reg_dt)

    def get_str_mod_dt(self):
        return str(self.mod_dt)

    def get_state_cd_name(self):
        try:
            state_cd_name = CommonCdTb.objects.get(common_cd=self.state_cd).common_cd_nm
        except ObjectDoesNotExist:
            state_cd_name = ''

        return state_cd_name


class GroupTb(TimeStampedModel):
    group_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, blank=True, null=True)
    group_type_cd = models.CharField(db_column='GROUP_TYPE_CD', max_length=45, blank=True, null=True)
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)
    member_num = models.IntegerField(db_column='MEMBER_NUM', default=2)  # Field name made lowercase.
    name = models.CharField(db_column='NAME', max_length=255, blank=True, null=True, default='')
    note = models.CharField(db_column='NOTE', max_length=1000, blank=True, null=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'GROUP_TB'

    def __str__(self):
        return self.name.__str__()+'_group'

    def get_group_type_cd_name(self):
        try:
            group_type_cd_name = CommonCdTb.objects.get(common_cd=self.group_type_cd).common_cd_nm
        except ObjectDoesNotExist:
            group_type_cd_name = ''

        return group_type_cd_name


class GroupLectureTb(TimeStampedModel):
    group_lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    group_tb = models.ForeignKey(GroupTb, on_delete=models.CASCADE, blank=True, null=True)
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, blank=True, null=True)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'GROUP_LECTURE_TB'


class RepeatScheduleTb(TimeStampedModel):
    repeat_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_tb = models.ForeignKey(GroupTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_schedule_id = models.IntegerField(db_column='GROUP_SCHEDULE_ID', blank=True, null=True, default='')
    repeat_type_cd = models.CharField(db_column='REPEAT_TYPE_CD', max_length=10, blank=True, default='')
    week_info = models.CharField(db_column='WEEK_INFO', max_length=100, blank=True, default='')
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    start_time = models.CharField(db_column='START_TIME', max_length=20, blank=True, default='')
    end_time = models.CharField(db_column='END_TIME', max_length=20, blank=True, default='')
    time_duration = models.CharField(db_column='TIME_DURATION', max_length=20, blank=True, default='')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True, default='')
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, null=True, default='')
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'REPEAT_SCHEDULE_TB'

    def __str__(self):
        return self.class_tb.__str__()

    def get_str_start_date(self):
        return str(self.start_date)

    def get_str_end_date(self):
        return str(self.end_date)

    def get_group_type_name(self):

        if self.group_tb_id is not None and self.group_tb_id != '':
            try:
                group_type_name = CommonCdTb.objects.get(common_cd=self.group_tb.group_type_cd).common_cd_nm
            except ObjectDoesNotExist:
                group_type_name = '1:1 레슨'
        else:
            group_type_name = '1:1 레슨'

        return group_type_name

    def get_group_name(self):

        if self.group_tb_id is not None and self.group_tb_id != '':
            group_name = self.group_tb.name
        else:
            group_name = ''

        return group_name

    def get_state_cd_name(self):
        try:
            state_cd_name = CommonCdTb.objects.get(common_cd=self.state_cd).common_cd_nm
        except ObjectDoesNotExist:
            state_cd_name = ''

        return state_cd_name


class DeleteRepeatScheduleTb(models.Model):
    delete_repeat_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    repeat_schedule_id = models.IntegerField(db_column='REPEAT_SCHEDULE_ID', null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_tb = models.ForeignKey(GroupTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_schedule_id = models.IntegerField(db_column='GROUP_SCHEDULE_ID', blank=True, null=True, default='')
    repeat_type_cd = models.CharField(db_column='REPEAT_TYPE_CD', max_length=10, blank=True, default='')
    week_info = models.CharField(db_column='WEEK_INFO', max_length=100, blank=True, default='')
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    start_time = models.CharField(db_column='START_TIME', max_length=20, blank=True, default='')
    end_time = models.CharField(db_column='END_TIME', max_length=20, blank=True, default='')
    time_duration = models.CharField(db_column='TIME_DURATION', max_length=20, blank=True, default='')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, default='')
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, default='')
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', default=0)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'DELETE_REPEAT_SCHEDULE_TB'

    def __str__(self):
        return self.class_tb.__str__()+'-'+self.lecture_tb.__str__()


class DeleteScheduleTb(models.Model):
    delete_schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    schedule_id = models.IntegerField(db_column='SCHEDULE_ID', null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_tb = models.ForeignKey(GroupTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_schedule_id = models.IntegerField(db_column='GROUP_SCHEDULE_ID', blank=True, null=True, default='')
    delete_repeat_schedule_tb = models.IntegerField(db_column='DELETE_REPEAT_SCHEDULE_TB_ID',
                                                    blank=True, null=True, default='')
    start_dt = models.DateTimeField(db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
    end_dt = models.DateTimeField(db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
    permission_state_cd = models.CharField(db_column='PERMISSION_STATE_CD', max_length=10, blank=True, default='')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, default='')
    sign_data_url = models.CharField(db_column='SIGN_DATA_URL', max_length=255, blank=True, default='')
    note = models.CharField(db_column='NOTE', max_length=255, blank=True, default='')
    member_note = models.CharField(db_column='MEMBER_NOTE', max_length=255, blank=True, default='')
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, default='')
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, related_name='REG_MEMBER_ID', null=True)
    del_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, related_name='DEL_MEMBER_ID', null=True)
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True)  # Field name made lowercase.
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', default=0)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'DELETE_SCHEDULE_TB'


class ScheduleTb(TimeStampedModel):
    schedule_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_tb = models.ForeignKey(GroupTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    group_schedule_id = models.IntegerField(db_column='GROUP_SCHEDULE_ID', blank=True, null=True, default='')
    repeat_schedule_tb = models.ForeignKey(RepeatScheduleTb, on_delete=models.SET_DEFAULT, null=True, default='')
    start_dt = models.DateTimeField(db_column='START_DT', blank=True, null=True)  # Field name made lowercase.
    end_dt = models.DateTimeField(db_column='END_DT', blank=True, null=True)  # Field name made lowercase.
    permission_state_cd = models.CharField(db_column='PERMISSION_STATE_CD', max_length=10, blank=True, default='')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, default='')
    sign_data_url = models.CharField(db_column='SIGN_DATA_URL', max_length=255, blank=True, default='')
    max_mem_count = models.IntegerField(db_column='MAX_MEM_COUNT', default=1)
    note = models.CharField(db_column='NOTE', max_length=255, blank=True, default='')
    member_note = models.CharField(db_column='MEMBER_NOTE', max_length=255, blank=True, default='')
    en_dis_type = models.CharField(db_column='EN_DIS_TYPE', max_length=10, blank=True, default='')
    reg_member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    use = models.IntegerField(db_column='USE', default=USE)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SCHEDULE_TB'

    def get_str_start_dt(self):
        return str(self.start_dt)

    def get_str_end_dt(self):
        return str(self.end_dt)

    def get_str_mod_dt(self):
        return str(self.mod_dt)

    def get_str_reg_dt(self):
        return str(self.reg_dt)

    def finish_check(self):
        if self.state_cd == 'PE':
            return SCHEDULE_FINISH
        else:
            return SCHEDULE_NOT_FINISH

    def get_group_current_member_num(self):
        if self.group_tb_id is not None and self.group_tb_id != '':
            group_current_member_num = ScheduleTb.objects.filter(class_tb_id=self.class_tb_id,
                                                                 group_tb_id=self.group_tb.group_id,
                                                                 lecture_tb__isnull=False,
                                                                 group_schedule_id=self.schedule_id,
                                                                 use=USE).count()

        return group_current_member_num

    def get_group_type_name(self):

        if self.group_tb_id is not None and self.group_tb_id != '':
            try:
                group_type_name = CommonCdTb.objects.get(common_cd=self.group_tb.group_type_cd).common_cd_nm
            except ObjectDoesNotExist:
                group_type_name = '1:1 레슨'
        else:
            group_type_name = '1:1 레슨'

        return group_type_name


class SettingTb(TimeStampedModel):
    setting_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, blank=True, null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, blank=True, null=True)
    setting_type_cd = models.CharField(db_column='SETTING_TYPE_CD', max_length=10, default='')
    setting_info = models.CharField(db_column='SETTING_INFO', max_length=255, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SETTING_TB'


class CompanyTb(TimeStampedModel):
    company_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    name = models.CharField(db_column='NAME', max_length=20, blank=True, default='')  # Field name made lowercase.
    phone = models.CharField(db_column='PHONE', max_length=20, blank=True, default='')  # Field name made lowercase.
    address = models.CharField(db_column='ADDRESS', max_length=100, blank=True, default='')
    info = models.CharField(db_column='INFO', max_length=255, blank=True, default='')  # Field name made lowercase.
    img_url = models.CharField(db_column='IMG_URL', max_length=255, blank=True, default='')
    use = models.IntegerField(db_column='USE', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'COMPANY_TB'


class ClassLectureTb(TimeStampedModel):
    class_lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    auth_cd = models.CharField(db_column='AUTH_CD', max_length=20, blank=True, default='')  # Field name made lowercase.
    mod_member_id = models.CharField(db_column='MOD_MEMBER_ID', max_length=20, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CLASS_LECTURE_TB'

    def get_group_lecture_check(self):

        try:
            GroupLectureTb.objects.get(lecture_tb_id=self.lecture_tb_id,
                                       lecture_tb__use=USE,
                                       group_tb__group_type_cd='NORMAL',
                                       use=USE)
            group_check = 1
        except ObjectDoesNotExist:
            group_check = 0

        try:
            GroupLectureTb.objects.get(lecture_tb_id=self.lecture_tb_id,
                                       lecture_tb__use=USE, group_tb__group_type_cd='EMPTY', use=USE)
            group_check = 2
        except ObjectDoesNotExist:
            group_check = group_check

        return group_check

    def get_member_lecture_auth_check(self):
        if self.lecture_tb_id is not None and self.lecture_tb_id != '':
            lecture_auth_count = MemberLectureTb.objects.filter(lecture_tb=self.lecture_tb_id,
                                                                auth_cd='VIEW', lecture_tb__use=USE,
                                                                use=USE).count()
        return lecture_auth_count

    def get_group_lecture_info(self):

        try:
            group_info = GroupLectureTb.objects.get(lecture_tb_id=self.lecture_tb_id, lecture_tb__use=USE, use=USE)
        except ObjectDoesNotExist:
            group_info = None
        return group_info


class MemberClassTb(TimeStampedModel):
    member_class_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)
    auth_cd = models.CharField(db_column='AUTH_CD', max_length=20, blank=True, default='')  # Field name made lowercase.
    mod_member_id = models.CharField(db_column='MOD_MEMBER_ID', max_length=20, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MEMBER_CLASS_TB'


class MemberLectureTb(TimeStampedModel):
    member_lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, null=True)
    auth_cd = models.CharField(db_column='AUTH_CD', max_length=20, blank=True, default='')  # Field name made lowercase.
    mod_member_id = models.CharField(db_column='MOD_MEMBER_ID', max_length=20, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MEMBER_LECTURE_TB'


class BackgroundImgTb(TimeStampedModel):
    background_img_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)
    background_img_type_cd = models.CharField(db_column='BACKGROUND_IMG_TYPE_CD', max_length=45, blank=True, default='')
    url = models.CharField(db_column='URL', max_length=500, blank=True, default='')  # Field name made lowercase.
    reg_info = models.ForeignKey(MemberTb, on_delete=models.CASCADE, related_name='REG_INFO', null=True)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'BACKGROUND_IMG_TB'

