from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Expense,Budget
class ExpenseSerializer(serializers.ModelSerializer):
 class Meta: model=Expense; fields='__all__'; read_only_fields=['id','user','created_at','updated_at']
 def validate_title(self,v):
  if len(v.strip())<3: raise serializers.ValidationError('Title must be at least 3 characters.')
  return v.strip()
 def validate_amount(self,v):
  if v<=0: raise serializers.ValidationError('Amount must be greater than 0.')
  return v
class BudgetSerializer(serializers.ModelSerializer):
 class Meta: model=Budget; fields='__all__'; read_only_fields=['id','user','created_at','updated_at']
 def validate_amount(self,v):
  if v<=0: raise serializers.ValidationError('Budget must be greater than 0.')
  return v
class SignupSerializer(serializers.ModelSerializer):
 full_name=serializers.CharField(write_only=True)
 class Meta: model=User; fields=['username','email','password','full_name']; extra_kwargs={'password':{'write_only':True}}
 def create(self,d):
  full=d.pop('full_name'); u=User.objects.create_user(**d); u.first_name=full; u.save(); return u
