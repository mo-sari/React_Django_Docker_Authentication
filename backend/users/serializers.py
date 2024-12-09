"User Serializers"
from rest_framework import serializers
from djoser.serializers import UserCreateSerializer
from .models import (
    User,
    Profile,
)


class UserSerializer(UserCreateSerializer):
    """User Serializer"""
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'name']


class ProfileSerializer(UserCreateSerializer):
    """Profile Serializer"""
    class Meta:
        model = Profile
        fields = '__all__'


class NameSerializer(serializers.Serializer):
    name = serializers.CharField()