from django.db import models

# Create your models here.
from configs.models import TimeStampedModel


class CustomizingAppTb(TimeStampedModel):
    qa_comment_id = models.AutoField(db_column='ID', primary_key=True, null=False)
    app_domain = models.CharField('앱 도메인', db_column='APP_DOMAIN', max_length=45, blank=True, default='')
    app_name = models.CharField('앱 이름', db_column='APP_NAME', max_length=45, blank=True, default='')
    ios_url = models.CharField('Ios 다운로드 url', db_column='IOS_URL', max_length=45, blank=True, default='')
    android_url = models.CharField('Android 다운로드 url', db_column='ANDROID_URL', max_length=45, blank=True, default='')
    main_color_cd = models.CharField('메인 color 코드', db_column='MAIN_COLOR_CD', max_length=45, blank=True, default='#')
    sub_color_cd = models.CharField('서브 color 코드', db_column='SUB_COLOR_CD', max_length=45, blank=True, default='')

    class Meta:
        managed = False
        db_table = 'CUSTOMIZING_APP_TB'
        verbose_name = '앱 커스터마이징'
        verbose_name_plural = '앱 커스터마이징'
