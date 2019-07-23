from django import forms


class MemberTicketForm(forms.Form):
    member_id = forms.IntegerField('member_id')
    contents = forms.CharField('contents', '')
    counts = forms.IntegerField('counts')
    price = forms.IntegerField('price')
    start_date = forms.DateField('start_date')
    end_date = forms.DateField('end_date')
    ticket_id = forms.IntegerField('ticket_id', '')

