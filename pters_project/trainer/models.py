# from django.db import models

# Create your models here.
from django.core.exceptions import ObjectDoesNotExist
from django.db import models

from center.models import CenterTb
from configs.const import USE
from configs.models import TimeStampedModel
from login.models import MemberTb, CommonCdTb
from trainee.models import MemberLectureTb, LectureTb


class ClassTb(TimeStampedModel):
    class_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE)  # Field name made lowercase.
    center_tb = models.ForeignKey(CenterTb, on_delete=models.SET_NULL, blank=True, null=True)
    subject_cd = models.CharField(db_column='SUBJECT_CD', max_length=10, blank=True, default='')
    subject_detail_nm = models.CharField(db_column='SUBJECT_DETAIL_NM', max_length=20, blank=True, default='')
    start_date = models.DateField(db_column='START_DATE', blank=True, null=True)  # Field name made lowercase.
    end_date = models.DateField(db_column='END_DATE', blank=True, null=True)  # Field name made lowercase.
    class_hour = models.IntegerField(db_column='CLASS_HOUR', blank=True, null=True)  # Field name made lowercase.
    start_hour_unit = models.IntegerField(db_column='START_HOUR_UNIT', blank=True, null=True)
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


class MemberClassTb(TimeStampedModel):
    member_class_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    member = models.ForeignKey(MemberTb, on_delete=models.CASCADE, null=True)  # Field name made lowercase.
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, null=True)
    auth_cd = models.CharField(db_column='AUTH_CD', max_length=20, blank=True,
                               default='')  # Field name made lowercase.
    mod_member_id = models.CharField(db_column='MOD_MEMBER_ID', max_length=20, blank=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MEMBER_CLASS_TB'


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
            group_lecture_info = GroupLectureTb.objects.get(lecture_tb_id=self.lecture_tb_id,
                                                            lecture_tb__use=USE, use=USE)
            if group_lecture_info.group_tb.group_type_cd == 'NORMAL':
                group_check = 1
            else:
                group_check = 2

        except ObjectDoesNotExist:
            group_check = 0

        return group_check

    def get_member_lecture_auth_check(self):
        if self.lecture_tb_id is not None and self.lecture_tb_id != '':
            lecture_auth_count = MemberLectureTb.objects.filter(lecture_tb=self.lecture_tb_id,
                                                                auth_cd='VIEW', lecture_tb__use=USE,
                                                                use=USE).count()
        return lecture_auth_count

    def get_group_lecture_info(self):

        try:
            group_info = GroupLectureTb.objects.select_related('group_tb').get(lecture_tb_id=self.lecture_tb_id,
                                                                               lecture_tb__use=USE, use=USE)
        except ObjectDoesNotExist:
            group_info = None
        return group_info

    def get_auth_cd_name(self):

        try:
            auth_cd_name = CommonCdTb.objects.get(common_cd=self.auth_cd).common_cd_nm
        except ObjectDoesNotExist:
            auth_cd_name = ''
        return auth_cd_name


class GroupTb(TimeStampedModel):
    group_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, blank=True, null=True)
    group_type_cd = models.CharField(db_column='GROUP_TYPE_CD', max_length=45, blank=True, null=True)
    ing_color_cd = models.CharField(db_column='ING_COLOR_CD', max_length=20, default='#ffacb7')
    end_color_cd = models.CharField(db_column='END_COLOR_CD', max_length=20, default='#af757c')
    ing_font_color_cd = models.CharField(db_column='ING_FONT_COLOR_CD', max_length=20, default='#000000')
    end_font_color_cd = models.CharField(db_column='END_FONT_COLOR_CD', max_length=20, default='#000000')
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)
    member_num = models.IntegerField(db_column='MEMBER_NUM', default=2)  # Field name made lowercase.
    ing_group_member_num = models.IntegerField(db_column='ING_GROUP_MEMBER_NUM', default=0)
    end_group_member_num = models.IntegerField(db_column='END_GROUP_MEMBER_NUM', default=0)
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

    def get_state_cd_name(self):
        try:
            state_cd_name = CommonCdTb.objects.get(common_cd=self.state_cd).common_cd_nm
        except ObjectDoesNotExist:
            state_cd_name = ''

        return state_cd_name


class PackageTb(TimeStampedModel):
    package_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, blank=True, null=True)
    name = models.CharField(db_column='NAME', max_length=255, blank=True, null=True, default='')
    package_type_cd = models.CharField(db_column='PACKAGE_TYPE_CD', max_length=1000, blank=True, null=True, default='')
    package_group_num = models.IntegerField(db_column='PACKAGE_GROUP_NUM', default=1)  # Field name made lowercase.
    ing_package_member_num = models.IntegerField(db_column='ING_PACKAGE_MEMBER_NUM', default=0)
    end_package_member_num = models.IntegerField(db_column='END_PACKAGE_MEMBER_NUM', default=0)
    state_cd = models.CharField(db_column='STATE_CD', max_length=10, blank=True, null=True)
    note = models.CharField(db_column='NOTE', max_length=1000, blank=True, null=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PACKAGE_TB'

    def __str__(self):
        return self.name.__str__()+'_package'


class GroupLectureTb(TimeStampedModel):
    group_lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    group_tb = models.ForeignKey(GroupTb, on_delete=models.CASCADE, blank=True, null=True)
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, blank=True, null=True)
    package_tb = models.ForeignKey(PackageTb, on_delete=models.CASCADE, blank=True, null=True)
    fix_state_cd = models.CharField(db_column='FIX_STATE_CD', max_length=1000, blank=True, null=True, default='')
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'GROUP_LECTURE_TB'


class PackageLectureTb(TimeStampedModel):
    package_lecture_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    package_tb = models.ForeignKey(PackageTb, on_delete=models.CASCADE, blank=True, null=True)
    lecture_tb = models.ForeignKey(LectureTb, on_delete=models.CASCADE, blank=True, null=True)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PACKAGE_LECTURE_TB'


class PackageGroupTb(TimeStampedModel):
    package_group_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    class_tb = models.ForeignKey(ClassTb, on_delete=models.CASCADE, blank=True, null=True)
    package_tb = models.ForeignKey(PackageTb, on_delete=models.CASCADE, blank=True, null=True)
    group_tb = models.ForeignKey(GroupTb, on_delete=models.CASCADE, blank=True, null=True)
    use = models.IntegerField(db_column='USE', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PACKAGE_GROUP_TB'


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
