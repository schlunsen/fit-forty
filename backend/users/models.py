from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import os


class ProfilePicture(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='profile_pictures')
    image = models.ImageField(upload_to='profile_pictures/%Y/%m/')
    is_current = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"
    
    def save(self, *args, **kwargs):
        # If this is being set as current, unset all other current pictures for this user
        if self.is_current:
            ProfilePicture.objects.filter(user=self.user, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class UserProfile(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    age = models.PositiveIntegerField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True, help_text="Weight in kg")
    height = models.FloatField(null=True, blank=True, help_text="Height in cm")
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    goals = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    @property
    def current_profile_picture(self):
        """Get the current profile picture for this user"""
        try:
            return self.user.profile_pictures.filter(is_current=True).first()
        except AttributeError:
            return None


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()