from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
class ExpenseTests(TestCase):
 def setUp(self): self.u=User.objects.create_user(username='test',password='pass12345'); self.c=APIClient(); self.c.force_authenticate(self.u)
 def test_create(self):
  r=self.c.post('/api/expenses/',{'title':'Lunch','amount':250,'category':'Food','payment_method':'UPI','date':'2026-09-15'},format='json'); self.assertEqual(r.status_code,201)
 def test_negative_rejected(self):
  r=self.c.post('/api/expenses/',{'title':'Lunch','amount':-1,'category':'Food','payment_method':'UPI','date':'2026-09-15'},format='json'); self.assertEqual(r.status_code,400)
