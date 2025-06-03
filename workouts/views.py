from rest_framework import viewsets, permissions
from .models import Exercise, WorkoutLog, ExerciseLog
from .serializers import ExerciseSerializer, WorkoutLogSerializer, ExerciseLogSerializer


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


class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        # Allow staff to edit exercises, but regular users can only read
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class WorkoutLogViewSet(viewsets.ModelViewSet):
    queryset = WorkoutLog.objects.all()
    serializer_class = WorkoutLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        # Users can only see their own workout logs
        return WorkoutLog.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExerciseLogViewSet(viewsets.ModelViewSet):
    queryset = ExerciseLog.objects.all()
    serializer_class = ExerciseLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own exercise logs
        return ExerciseLog.objects.filter(workout__user=self.request.user)
    
    def perform_create(self, serializer):
        # Ensure the workout belongs to the current user
        workout = serializer.validated_data.get('workout')
        if workout.user != self.request.user:
            raise permissions.PermissionDenied("You cannot add exercises to another user's workout")
        serializer.save()