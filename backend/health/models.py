from django.db import models
from django.contrib.auth.models import User


class WeightEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weight_entries')
    weight_kg = models.FloatField(help_text="Weight in kg")
    timestamp = models.DateTimeField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.weight_kg}kg on {self.timestamp.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = "Weight Entries"


class BloodPressureReading(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bp_readings')
    systolic = models.PositiveIntegerField(help_text="Systolic pressure (mmHg)")
    diastolic = models.PositiveIntegerField(help_text="Diastolic pressure (mmHg)")
    timestamp = models.DateTimeField()
    pulse = models.PositiveIntegerField(null=True, blank=True, help_text="Heart rate (bpm)")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.systolic}/{self.diastolic} on {self.timestamp.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-timestamp']


class ProgressPhoto(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress_photos')
    image = models.ImageField(upload_to='progress_photos/%Y/%m/')
    timestamp = models.DateTimeField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Photo on {self.timestamp.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-timestamp']