from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet,BudgetViewSet,SignupView,stats,category_stats,payment_stats,monthly_stats
r=DefaultRouter(); r.register('expenses',ExpenseViewSet,basename='expense'); r.register('budget',BudgetViewSet,basename='budget')
urlpatterns=[path('auth/signup/',SignupView.as_view()),path('expenses/stats/',stats),path('expenses/category-stats/',category_stats),path('expenses/payment-stats/',payment_stats),path('expenses/monthly-stats/',monthly_stats),path('',include(r.urls))]
