# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2018-02-19 16:04
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CommonCdTb',
            fields=[
                ('group_cd', models.CharField(blank=True, db_column='GROUP_CD', max_length=10, null=True)),
                ('common_cd', models.CharField(db_column='COMMON_CD', max_length=10, primary_key=True, serialize=False)),
                ('common_cd_nm', models.CharField(blank=True, db_column='COMMON_CD_NM', max_length=100, null=True)),
                ('group_cd_nm', models.CharField(blank=True, db_column='GROUP_CD_NM', max_length=20, null=True)),
                ('upper_common_cd', models.CharField(blank=True, db_column='UPPER_COMMON_CD', max_length=10, null=True)),
                ('upper_group_cd', models.CharField(blank=True, db_column='UPPER_GROUP_CD', max_length=10, null=True)),
                ('attribute1', models.CharField(blank=True, db_column='ATTRIBUTE1', max_length=255, null=True)),
                ('order', models.IntegerField(blank=True, db_column='ORDER', null=True)),
                ('use', models.IntegerField(blank=True, db_column='USE', default='1', null=True)),
            ],
            options={
                'db_table': 'COMMON_CD_TB',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='HolidayTb',
            fields=[
                ('holiday_id', models.AutoField(db_column='ID', primary_key=True, serialize=False)),
                ('holiday_dt', models.CharField(blank=True, db_column='HOLIDAY_DT', max_length=10, null=True)),
                ('holiday_name', models.CharField(blank=True, db_column='HOLIDAY_NAME', max_length=20, null=True)),
                ('use', models.IntegerField(blank=True, db_column='USE', default='1', null=True)),
            ],
            options={
                'db_table': 'HOLIDAY_TB',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='LogTb',
            fields=[
                ('log_id', models.AutoField(db_column='ID', primary_key=True, serialize=False)),
                ('external_id', models.CharField(blank=True, db_column='EXTERNAL_ID', max_length=20, null=True)),
                ('log_type', models.CharField(blank=True, db_column='LOG_TYPE', max_length=10, null=True)),
                ('contents', models.CharField(blank=True, db_column='CONTENTS', max_length=255, null=True)),
                ('reg_dt', models.DateTimeField(blank=True, db_column='REG_DT', null=True)),
                ('read', models.IntegerField(blank=True, db_column='READ', default='0', null=True)),
                ('use', models.IntegerField(blank=True, db_column='USE', default='1', null=True)),
            ],
            options={
                'db_table': 'LOG_TB',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='MemberTb',
            fields=[
                ('member_id', models.AutoField(db_column='ID', primary_key=True, serialize=False)),
                ('name', models.CharField(blank=True, db_column='NAME', max_length=20, null=True)),
                ('phone', models.CharField(blank=True, db_column='PHONE', max_length=20, null=True)),
                ('age', models.IntegerField(blank=True, db_column='AGE', null=True)),
                ('sex', models.CharField(blank=True, db_column='SEX', max_length=2, null=True)),
                ('birthday_dt', models.DateTimeField(blank=True, db_column='BIRTHDAY_DT', null=True)),
                ('address', models.CharField(blank=True, db_column='ADDRESS', max_length=255, null=True)),
                ('job', models.CharField(blank=True, db_column='JOB', max_length=20, null=True)),
                ('contents', models.CharField(blank=True, db_column='CONTENTS', max_length=255, null=True)),
                ('reg_dt', models.DateTimeField(blank=True, db_column='REG_DT', null=True)),
                ('mod_dt', models.DateTimeField(blank=True, db_column='MOD_DT', null=True)),
                ('use', models.IntegerField(blank=True, db_column='USE', default='1', null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'MEMBER_TB',
                'managed': True,
            },
        ),
    ]
