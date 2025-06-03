from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from .models import UserProfile, ProfilePicture
from .serializers import UserSerializer, UserProfileSerializer, UserRegistrationSerializer, ProfilePictureSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Regular users can only see their own profile
        if not self.request.user.is_staff:
            return User.objects.filter(id=self.request.user.id)
        return User.objects.all()


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Regular users can only see and edit their own profile
        if not self.request.user.is_staff:
            return UserProfile.objects.filter(user=self.request.user)
        return UserProfile.objects.all()
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        profile = UserProfile.objects.get(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_profile_picture(self, request):
        """Upload a new profile picture"""
        if 'image' not in request.FILES:
            return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new profile picture
        profile_picture = ProfilePicture.objects.create(
            user=request.user,
            image=request.FILES['image'],
            is_current=True  # This will automatically unset other current pictures
        )
        
        serializer = ProfilePictureSerializer(profile_picture)
        return Response({
            'message': 'Profile picture uploaded successfully',
            'profile_picture': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def profile_pictures(self, request):
        """Get all profile pictures for the user"""
        pictures = ProfilePicture.objects.filter(user=request.user)
        serializer = ProfilePictureSerializer(pictures, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def set_current_picture(self, request):
        """Set a specific profile picture as current"""
        picture_id = request.data.get('picture_id')
        if not picture_id:
            return Response({'error': 'picture_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            picture = ProfilePicture.objects.get(id=picture_id, user=request.user)
            # Unset all current pictures for this user
            ProfilePicture.objects.filter(user=request.user, is_current=True).update(is_current=False)
            # Set this picture as current
            picture.is_current = True
            picture.save()
            
            serializer = ProfilePictureSerializer(picture)
            return Response({
                'message': 'Profile picture set as current',
                'profile_picture': serializer.data
            })
        except ProfilePicture.DoesNotExist:
            return Response({'error': 'Profile picture not found'}, status=status.HTTP_404_NOT_FOUND)


class RegistrationViewSet(viewsets.GenericViewSet):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Return user data and profile
        user_serializer = UserSerializer(user)
        profile_serializer = UserProfileSerializer(user.profile)
        
        return Response({
            'user': user_serializer.data,
            'profile': profile_serializer.data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)