from django.db import models
from django.contrib.auth.models import User


class Exercise(models.Model):
    EQUIPMENT_CHOICES = [
        ('BB', 'Barbell'),
        ('DB', 'Dumbbell'),
        ('KB', 'Kettlebell'),
        ('BW', 'Bodyweight'),
        ('MC', 'Machine'),
        ('CB', 'Cable'),
        ('OT', 'Other'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    muscles_targeted = models.CharField(max_length=255)
    equipment_type = models.CharField(max_length=2, choices=EQUIPMENT_CHOICES)
    video_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class WorkoutLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workout_logs')
    date = models.DateTimeField()
    notes = models.TextField(blank=True)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Workout on {self.date.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-date']


class ExerciseLog(models.Model):
    workout = models.ForeignKey(WorkoutLog, on_delete=models.CASCADE, related_name='exercise_logs')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    sets = models.PositiveIntegerField()
    reps = models.PositiveIntegerField()
    weight = models.FloatField(help_text="Weight in kg")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.exercise.name} - {self.sets}x{self.reps} @ {self.weight}kg"