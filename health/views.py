from rest_framework import viewsets, permissions, parsers
from .models import WeightEntry, BloodPressureReading, ProgressPhoto
from .serializers import WeightEntrySerializer, BloodPressureReadingSerializer, ProgressPhotoSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.user == request.user


class WeightEntryViewSet(viewsets.ModelViewSet):
    queryset = WeightEntry.objects.all()
    serializer_class = WeightEntrySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        # Users can only see their own weight entries
        return WeightEntry.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BloodPressureReadingViewSet(viewsets.ModelViewSet):
    queryset = BloodPressureReading.objects.all()
    serializer_class = BloodPressureReadingSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        # Users can only see their own blood pressure readings
        return BloodPressureReading.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProgressPhotoViewSet(viewsets.ModelViewSet):
    queryset = ProgressPhoto.objects.all()
    serializer_class = ProgressPhotoSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    
    def get_queryset(self):
        # Users can only see their own progress photos
        return ProgressPhoto.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Add request to context for building absolute image URLs
        context.update({"request": self.request})
        return context