from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExpenseViewSet, BudgetViewSet, SignupView,
    stats, category_stats, payment_stats, monthly_stats,
    profile_me, profile_update, change_password,
)

r = DefaultRouter()
r.register('expenses', ExpenseViewSet, basename='expense')
r.register('budget', BudgetViewSet, basename='budget')

urlpatterns = [
    path('auth/signup/', SignupView.as_view()),
    path('auth/me/', profile_me),
    path('auth/me/update/', profile_update),
    path('auth/change-password/', change_password),
    path('expenses/stats/', stats),
    path('expenses/category-stats/', category_stats),
    path('expenses/payment-stats/', payment_stats),
    path('expenses/monthly-stats/', monthly_stats),
    path('', include(r.urls)),
]
