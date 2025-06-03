from django.contrib import admin
from .models import Exercise, WorkoutLog, ExerciseLog


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'muscles_targeted', 'equipment_type')
    list_filter = ('equipment_type', 'muscles_targeted')
    search_fields = ('name', 'description', 'muscles_targeted')


class ExerciseLogInline(admin.TabularInline):
    model = ExerciseLog
    extra = 1


@admin.register(WorkoutLog)
class WorkoutLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'duration_minutes')
    list_filter = ('date', 'user')
    search_fields = ('user__username', 'notes')
    inlines = [ExerciseLogInline]


@admin.register(ExerciseLog)
class ExerciseLogAdmin(admin.ModelAdmin):
    list_display = ('exercise', 'workout', 'sets', 'reps', 'weight')
    list_filter = ('exercise', 'workout__date')
    search_fields = ('exercise__name', 'workout__user__username', 'notes')