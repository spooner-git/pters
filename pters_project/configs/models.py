# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.

from django.db import models


class TimeStampedModel(models.Model):
    reg_dt = models.DateTimeField(db_column='REG_DT', blank=True, null=True, auto_now_add=True)
    mod_dt = models.DateTimeField(db_column='MOD_DT', blank=True, null=True, auto_now=True)

    class Meta:
        abstract = True
