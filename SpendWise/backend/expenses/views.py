from datetime import date
from decimal import Decimal
from django.db.models import Sum,Count
from django.db.models.functions import TruncMonth
from django.contrib.auth.models import User
from rest_framework import viewsets,generics,permissions,status
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from .models import Expense,Budget
from .serializers import ExpenseSerializer,BudgetSerializer,SignupSerializer
class SignupView(generics.CreateAPIView): queryset=User.objects.all(); serializer_class=SignupSerializer; permission_classes=[permissions.AllowAny]
class ExpenseViewSet(viewsets.ModelViewSet):
 serializer_class=ExpenseSerializer
 search_fields=['title','category','notes']; ordering_fields=['date','amount','created_at']
 def get_queryset(self):
  qs=Expense.objects.filter(user=self.request.user)
  p=self.request.query_params
  if p.get('category'): qs=qs.filter(category=p['category'])
  if p.get('payment_method'): qs=qs.filter(payment_method=p['payment_method'])
  if p.get('date_from'): qs=qs.filter(date__gte=p['date_from'])
  if p.get('date_to'): qs=qs.filter(date__lte=p['date_to'])
  if p.get('min_amount'): qs=qs.filter(amount__gte=p['min_amount'])
  if p.get('max_amount'): qs=qs.filter(amount__lte=p['max_amount'])
  return qs
 def perform_create(self,serializer): serializer.save(user=self.request.user)
class BudgetViewSet(viewsets.ModelViewSet):
 serializer_class=BudgetSerializer
 def get_queryset(self): return Budget.objects.filter(user=self.request.user)
 def perform_create(self,s): s.save(user=self.request.user)
 @classmethod
 def current(cls,user):
  t=date.today(); return Budget.objects.filter(user=user,month=t.month,year=t.year).first()
@api_view(['GET'])
def stats(request):
 qs=Expense.objects.filter(user=request.user); today=date.today(); month=qs.filter(date__year=today.year,date__month=today.month)
 total=qs.aggregate(v=Sum('amount'))['v'] or Decimal('0'); spent=month.aggregate(v=Sum('amount'))['v'] or Decimal('0')
 b=BudgetViewSet.current(request.user); budget=b.amount if b else Decimal('0')
 highest=qs.order_by('-amount').values_list('amount',flat=True).first() or Decimal('0')
 days=max(today.day,1)
 return Response({'total_expenses':float(total),'monthly_expenses':float(spent),'budget':float(budget),'remaining':float(budget-spent),'average_daily':float(spent/days),'highest_expense':float(highest)})
def grouped(qs,field): return [{'label':x[field], 'total':float(x['total'])} for x in qs]
@api_view(['GET'])
def category_stats(request): return Response(grouped(Expense.objects.filter(user=request.user).values('category').annotate(total=Sum('amount')).order_by('-total'),'category'))
@api_view(['GET'])
def payment_stats(request): return Response(grouped(Expense.objects.filter(user=request.user).values('payment_method').annotate(total=Sum('amount')).order_by('-total'),'payment_method'))
@api_view(['GET'])
def monthly_stats(request): return Response([{'label':x['month'].strftime('%b %Y'),'total':float(x['total'])} for x in Expense.objects.filter(user=request.user).annotate(month=TruncMonth('date')).values('month').annotate(total=Sum('amount')).order_by('month')])
