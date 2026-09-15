from django.db import models
from django.contrib.auth.models import User
class Expense(models.Model):
 CATEGORIES=[(x,x) for x in ['Food','Transport','Shopping','Education','Entertainment','Bills & Utilities','Health','Travel','Subscriptions','Other']]
 PAYMENTS=[(x,x) for x in ['Cash','UPI','Debit Card','Credit Card','Bank Transfer','Other']]
 user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='expenses')
 title=models.CharField(max_length=120)
 amount=models.DecimalField(max_digits=12,decimal_places=2)
 category=models.CharField(max_length=40,choices=CATEGORIES)
 payment_method=models.CharField(max_length=30,choices=PAYMENTS)
 date=models.DateField()
 notes=models.TextField(blank=True)
 created_at=models.DateTimeField(auto_now_add=True)
 updated_at=models.DateTimeField(auto_now=True)
 class Meta: ordering=['-date','-created_at']
class Budget(models.Model):
 user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='budgets')
 month=models.PositiveSmallIntegerField(); year=models.PositiveSmallIntegerField(); amount=models.DecimalField(max_digits=12,decimal_places=2)
 created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
 class Meta: constraints=[models.UniqueConstraint(fields=['user','month','year'],name='unique_user_month_budget')]
