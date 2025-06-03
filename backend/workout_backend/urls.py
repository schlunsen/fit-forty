from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.views import UserViewSet, UserProfileViewSet, RegistrationViewSet
from workouts.views import ExerciseViewSet, WorkoutLogViewSet, ExerciseLogViewSet
from health.views import WeightEntryViewSet, BloodPressureReadingViewSet, ProgressPhotoViewSet

# Define router for DRF
router = routers.DefaultRouter()
# Users
router.register(r'users', UserViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'registration', RegistrationViewSet, basename='registration')
# Workouts
router.register(r'exercises', ExerciseViewSet)
router.register(r'workouts', WorkoutLogViewSet)
router.register(r'exercise-logs', ExerciseLogViewSet)
# Health
router.register(r'weight-entries', WeightEntryViewSet)
router.register(r'blood-pressure', BloodPressureReadingViewSet)
router.register(r'progress-photos', ProgressPhotoViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api-auth/', include('rest_framework.urls')),
]

# Debug mode only - in production, Nginx will serve these
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)