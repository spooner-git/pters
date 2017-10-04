# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-10-04 13:28
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='LectureTb',
            fields=[
                ('lecture_id', models.AutoField(db_column='ID', primary_key=True, serialize=False)),
                ('lecture_count', models.IntegerField(blank=True, db_column='LECTURE_COUNT', null=True)),
                ('day_count', models.IntegerField(blank=True, db_column='DAY_COUNT', null=True)),
                ('start_date', models.DateField(blank=True, db_column='START_DATE', null=True)),
                ('end_date', models.DateField(blank=True, db_column='END_DATE', null=True)),
                ('price', models.IntegerField(blank=True, db_column='PRICE', null=True)),
                ('option_cd', models.CharField(blank=True, db_column='OPTION_CD', max_length=10, null=True)),
                ('state_cd', models.CharField(blank=True, db_column='STATE_CD', max_length=10, null=True)),
                ('reg_dt', models.DateTimeField(blank=True, db_column='REG_DT', null=True)),
                ('mod_dt', models.DateTimeField(blank=True, db_column='MOD_DT', null=True)),
                ('use', models.IntegerField(blank=True, db_column='USE', null=True)),
            ],
            options={
                'managed': True,
                'db_table': 'LECTURE_TB',
            },
        ),
    ]
