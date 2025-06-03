from rest_framework import serializers
from .models import Exercise, WorkoutLog, ExerciseLog


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'description', 'muscles_targeted', 'equipment_type', 
                 'video_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ExerciseLogSerializer(serializers.ModelSerializer):
    exercise_name = serializers.ReadOnlyField(source='exercise.name')
    
    class Meta:
        model = ExerciseLog
        fields = ['id', 'exercise', 'exercise_name', 'sets', 'reps', 'weight', 
                 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class WorkoutLogSerializer(serializers.ModelSerializer):
    exercise_logs = ExerciseLogSerializer(many=True, read_only=True)
    exercise_logs_data = serializers.ListField(
        child=ExerciseLogSerializer(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = WorkoutLog
        fields = ['id', 'user', 'date', 'notes', 'duration_minutes', 
                 'exercise_logs', 'exercise_logs_data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        exercise_logs_data = validated_data.pop('exercise_logs_data', [])
        workout_log = WorkoutLog.objects.create(**validated_data)
        
        for exercise_log_data in exercise_logs_data:
            ExerciseLog.objects.create(workout=workout_log, **exercise_log_data)
        
        return workout_log
    
    def update(self, instance, validated_data):
        exercise_logs_data = validated_data.pop('exercise_logs_data', None)
        
        # Update the workout log instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # If exercise logs were provided, update them
        if exercise_logs_data is not None:
            # Delete existing logs
            instance.exercise_logs.all().delete()
            
            # Create new logs
            for exercise_log_data in exercise_logs_data:
                ExerciseLog.objects.create(workout=instance, **exercise_log_data)
        
        return instance