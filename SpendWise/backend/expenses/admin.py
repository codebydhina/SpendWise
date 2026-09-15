from django.contrib import admin
from .models import Expense,Budget
@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin): list_display=['title','user','amount','category','payment_method','date']; search_fields=['title','notes','user__username']; list_filter=['category','payment_method','date']
@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin): list_display=['user','month','year','amount']; list_filter=['year','month']
