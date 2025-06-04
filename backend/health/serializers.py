from rest_framework import serializers
from .models import WeightEntry, BloodPressureReading, ProgressPhoto


class WeightEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightEntry
        fields = ['id', 'user', 'weight_kg', 'timestamp', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class BloodPressureReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodPressureReading
        fields = ['id', 'user', 'systolic', 'diastolic', 'pulse', 'timestamp', 
                 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ProgressPhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProgressPhoto
        fields = ['id', 'user', 'image', 'image_url', 'timestamp', 'notes', 'body_part_tags', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
    
    def validate_body_part_tags(self, value):
        """Validate that body_part_tags contains valid choices"""
        valid_choices = [choice[0] for choice in ProgressPhoto.BODY_PART_CHOICES]
        for tag in value:
            if tag not in valid_choices:
                raise serializers.ValidationError(f"Invalid body part tag: {tag}")
        return value