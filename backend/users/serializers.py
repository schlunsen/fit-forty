from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, ProfilePicture


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class ProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfilePicture
        fields = ['id', 'image', 'is_current', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    current_profile_picture = serializers.SerializerMethodField()
    profile_pictures = ProfilePictureSerializer(source='user.profile_pictures', many=True, read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'age', 'weight', 'height', 'gender', 'goals', 'created_at', 'updated_at', 'current_profile_picture', 'profile_pictures']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_current_profile_picture(self, obj):
        current_pic = obj.current_profile_picture
        if current_pic:
            return ProfilePictureSerializer(current_pic).data
        return None


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords don't match"})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        return user