# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-10-05 10:04
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='commoncdtb',
            name='use',
            field=models.IntegerField(blank=True, db_column='USE', default='1', null=True),
        ),
        migrations.AlterField(
            model_name='logtb',
            name='use',
            field=models.IntegerField(blank=True, db_column='USE', default='1', null=True),
        ),
    ]
