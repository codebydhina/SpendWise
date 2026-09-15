from datetime import date, timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from expenses.models import Budget, Expense


class Command(BaseCommand):
    help = 'Create or refresh the SpendWise demo account and sample records.'

    def handle(self, *args, **options):
        demo, created = User.objects.get_or_create(
            username='demo',
            defaults={'email': 'demo@spendwise.local', 'first_name': 'Demo User'},
        )
        demo.email = 'demo@spendwise.local'
        demo.first_name = 'Demo User'
        demo.set_password('SpendWise123!')
        demo.save()

        Expense.objects.filter(user=demo).delete()
        Budget.objects.filter(user=demo).delete()

        today = date.today()
        records = [
            ('Apartment rent', '18500.00', 'Bills & Utilities', 'Bank Transfer', today - timedelta(days=2), 'Monthly rent'),
            ('Grocery run', '2140.50', 'Food', 'UPI', today - timedelta(days=4), 'Fresh produce and pantry staples'),
            ('Metro card top-up', '650.00', 'Transport', 'UPI', today - timedelta(days=6), 'Commute'),
            ('Dinner with friends', '1680.00', 'Food', 'Credit Card', today - timedelta(days=8), 'Friday dinner'),
            ('Streaming bundle', '799.00', 'Subscriptions', 'Debit Card', today - timedelta(days=10), 'Monthly subscriptions'),
            ('Pharmacy', '920.00', 'Health', 'UPI', today - timedelta(days=13), 'Vitamins and medicine'),
            ('Weekend workshop', '2400.00', 'Education', 'Debit Card', today - timedelta(days=17), 'Design workshop'),
            ('Running shoes', '3899.00', 'Shopping', 'Credit Card', today - timedelta(days=21), 'Training gear'),
            ('Cab to airport', '1180.00', 'Travel', 'UPI', today - timedelta(days=29), 'Airport transfer'),
            ('Hotel breakfast', '1350.00', 'Travel', 'Credit Card', today - timedelta(days=34), 'Work trip'),
            ('Concert tickets', '3200.00', 'Entertainment', 'Debit Card', today - timedelta(days=39), 'Live music'),
            ('Electricity bill', '1750.00', 'Bills & Utilities', 'Bank Transfer', today - timedelta(days=43), 'Home electricity'),
            ('Coffee and snack', '340.00', 'Food', 'Cash', today - timedelta(days=48), 'Afternoon break'),
            ('Online course', '4990.00', 'Education', 'Credit Card', today - timedelta(days=56), 'Productivity course'),
            ('Bike service', '2100.00', 'Transport', 'Cash', today - timedelta(days=64), 'Routine maintenance'),
            ('Desk lamp', '1299.00', 'Shopping', 'UPI', today - timedelta(days=72), 'Workspace upgrade'),
            ('Birthday gift', '1800.00', 'Other', 'UPI', today - timedelta(days=80), 'Family birthday'),
            ('Lunch', '520.00', 'Food', 'UPI', today - timedelta(days=92), 'Weekday lunch'),
        ]
        Expense.objects.bulk_create([
            Expense(
                user=demo,
                title=title,
                amount=amount,
                category=category,
                payment_method=payment,
                date=spent_on,
                notes=notes,
            )
            for title, amount, category, payment, spent_on, notes in records
        ])
        Budget.objects.create(user=demo, month=today.month, year=today.year, amount='40000.00')

        action = 'created' if created else 'refreshed'
        self.stdout.write(self.style.SUCCESS(
            f'Demo account {action}: username=demo password=SpendWise123! '
            f'({len(records)} expenses, budget=₹40,000)'
        ))
