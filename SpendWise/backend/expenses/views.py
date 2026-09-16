from datetime import date
from decimal import Decimal
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.contrib.auth.models import User
from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Expense, Budget
from .serializers import ExpenseSerializer, BudgetSerializer, SignupSerializer

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    search_fields = ['title', 'category', 'notes']
    ordering_fields = ['date', 'amount', 'created_at']

    def get_queryset(self):
        qs = Expense.objects.filter(user=self.request.user)
        p = self.request.query_params
        if p.get('category'): qs = qs.filter(category=p['category'])
        if p.get('payment_method'): qs = qs.filter(payment_method=p['payment_method'])
        if p.get('date_from'): qs = qs.filter(date__gte=p['date_from'])
        if p.get('date_to'): qs = qs.filter(date__lte=p['date_to'])
        if p.get('min_amount'): qs = qs.filter(amount__gte=p['min_amount'])
        if p.get('max_amount'): qs = qs.filter(amount__lte=p['max_amount'])
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, s):
        s.save(user=self.request.user)

    @classmethod
    def current(cls, user):
        t = date.today()
        return Budget.objects.filter(user=user, month=t.month, year=t.year).first()

@api_view(['GET'])
def stats(request):
    qs = Expense.objects.filter(user=request.user)
    today = date.today()
    month = qs.filter(date__year=today.year, date__month=today.month)
    total = qs.aggregate(v=Sum('amount'))['v'] or Decimal('0')
    spent = month.aggregate(v=Sum('amount'))['v'] or Decimal('0')
    b = BudgetViewSet.current(request.user)
    budget = b.amount if b else Decimal('0')
    highest = qs.order_by('-amount').values_list('amount', flat=True).first() or Decimal('0')
    days = max(today.day, 1)
    return Response({
        'total_expenses': float(total),
        'monthly_expenses': float(spent),
        'budget': float(budget),
        'remaining': float(budget - spent),
        'average_daily': float(spent / days),
        'highest_expense': float(highest),
    })

def grouped(qs, field):
    return [{'label': x[field], 'total': float(x['total'])} for x in qs]

@api_view(['GET'])
def category_stats(request):
    return Response(grouped(
        Expense.objects.filter(user=request.user).values('category').annotate(total=Sum('amount')).order_by('-total'),
        'category'
    ))

@api_view(['GET'])
def payment_stats(request):
    return Response(grouped(
        Expense.objects.filter(user=request.user).values('payment_method').annotate(total=Sum('amount')).order_by('-total'),
        'payment_method'
    ))

@api_view(['GET'])
def monthly_stats(request):
    return Response([
        {'label': x['month'].strftime('%b %Y'), 'total': float(x['total'])}
        for x in Expense.objects.filter(user=request.user)
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
    ])

# ── Profile endpoints ──────────────────────────────────────────────────────
@api_view(['GET'])
def profile_me(request):
    u = request.user
    qs = Expense.objects.filter(user=u)
    return Response({
        'username': u.username,
        'email': u.email,
        'full_name': f'{u.first_name} {u.last_name}'.strip() or u.username,
        'first_name': u.first_name,
        'last_name': u.last_name,
        'date_joined': u.date_joined.strftime('%d %B %Y'),
        'expense_count': qs.count(),
        'total_spent': float(qs.aggregate(v=Sum('amount'))['v'] or 0),
    })

@api_view(['PUT', 'PATCH'])
def profile_update(request):
    u = request.user
    d = request.data
    if 'first_name' in d: u.first_name = d['first_name']
    if 'last_name' in d: u.last_name = d['last_name']
    if 'email' in d: u.email = d['email']
    u.save()
    return Response({
        'username': u.username,
        'email': u.email,
        'first_name': u.first_name,
        'last_name': u.last_name,
        'full_name': f'{u.first_name} {u.last_name}'.strip() or u.username,
    })

@api_view(['POST'])
def change_password(request):
    u = request.user
    old = request.data.get('old_password', '')
    new = request.data.get('new_password', '')
    if not u.check_password(old):
        return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(new) < 6:
        return Response({'error': 'New password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)
    u.set_password(new)
    u.save()
    return Response({'detail': 'Password changed successfully.'})
