from django.contrib import admin
from .models import WeightEntry, BloodPressureReading, ProgressPhoto


@admin.register(WeightEntry)
class WeightEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'weight_kg', 'timestamp')
    list_filter = ('timestamp', 'user')
    search_fields = ('user__username', 'notes')


@admin.register(BloodPressureReading)
class BloodPressureReadingAdmin(admin.ModelAdmin):
    list_display = ('user', 'systolic', 'diastolic', 'pulse', 'timestamp')
    list_filter = ('timestamp', 'user')
    search_fields = ('user__username', 'notes')


@admin.register(ProgressPhoto)
class ProgressPhotoAdmin(admin.ModelAdmin):
    list_display = ('user', 'timestamp')
    list_filter = ('timestamp', 'user')
    search_fields = ('user__username', 'notes')
    readonly_fields = ('image_preview',)
    
    def image_preview(self, obj):
        return obj.image.url if obj.image else 'No Image'
    
    image_preview.short_description = 'Image Preview'