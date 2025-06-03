from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.views import APIView
from health.views import IsOwnerOrReadOnly
from health.models import WeightEntry
from datetime import datetime, timezone


class MockObject:
    """Mock object for testing permissions"""
    def __init__(self, user):
        self.user = user


class MockView(APIView):
    """Mock view for testing permissions"""
    permission_classes = [IsOwnerOrReadOnly]


class IsOwnerOrReadOnlyTest(TestCase):
    """Test the IsOwnerOrReadOnly permission class"""
    
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='password123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='password123'
        )
        self.view = MockView.as_view()
        
        # Create a weight entry owned by user1
        self.weight_entry = WeightEntry.objects.create(
            user=self.user1,
            weight_kg=75.5,
            timestamp=datetime.now(timezone.utc),
            notes="Test note"
        )
    
    def test_get_request_allowed_for_any_authenticated_user(self):
        """Test that GET requests are allowed for any authenticated user"""
        # Create a GET request
        request = self.factory.get('/fake-url/')
        
        # Authenticate as user2 (not the owner)
        force_authenticate(request, user=self.user2)
        
        # Check permission
        permission = IsOwnerOrReadOnly()
        has_permission = permission.has_object_permission(
            request=request,
            view=None,
            obj=self.weight_entry
        )
        
        # Any user should be able to make GET requests
        self.assertTrue(has_permission)
    
    def test_put_request_allowed_only_for_owner(self):
        """Test that PUT requests are only allowed for the owner"""
        # Create a PUT request
        request = self.factory.put('/fake-url/')
        
        # Authenticate as owner
        force_authenticate(request, user=self.user1)
        
        # Check permission
        permission = IsOwnerOrReadOnly()
        has_permission = permission.has_object_permission(
            request=request,
            view=None,
            obj=self.weight_entry
        )
        
        # Owner should be able to make PUT requests
        self.assertTrue(has_permission)
        
        # Now authenticate as non-owner
        request = self.factory.put('/fake-url/')
        force_authenticate(request, user=self.user2)
        
        # Check permission
        has_permission = permission.has_object_permission(
            request=request,
            view=None,
            obj=self.weight_entry
        )
        
        # Non-owner should not be able to make PUT requests
        self.assertFalse(has_permission)
    
    def test_post_request_allowed_only_for_owner(self):
        """Test that POST requests are only allowed for the owner"""
        # Create a POST request
        request = self.factory.post('/fake-url/')
        
        # Authenticate as owner
        force_authenticate(request, user=self.user1)
        
        # Check permission
        permission = IsOwnerOrReadOnly()
        has_permission = permission.has_object_permission(
            request=request,
            view=None,
            obj=self.weight_entry
        )
        
        # Owner should be able to make POST requests
        self.assertTrue(has_permission)
        
        # Now authenticate as non-owner
        request = self.factory.post('/fake-url/')
        force_authenticate(request, user=self.user2)
        
        # Check permission
        has_permission = permission.has_object_permission(
            request=request,
            view=None,
            obj=self.weight_entry
        )
        
        # Non-owner should not be able to make POST requests
        self.assertFalse(has_permission)
    
    def test_delete_request_allowed_only_for_owner(self):
        """Test that DELETE requests are only allowed for the owner"""
        # Create a DELETE request
        request = self.factory.delete('/fake-url/')
        
        # Authenticate as owner
        force_authenticate(request, user=self.user1)
        
        # Check permission
        permission = IsOwnerOrReadOnly()
        has_permission = permission.has_object_permission(
            request=request,
            view=None,
            obj=self.weight_entry
        )
        
        # Owner should be able to make DELETE requests
        self.assertTrue(has_permission)
        
        # Now authenticate as non-owner
        request = self.factory.delete('/fake-url/')
        force_authenticate(request, user=self.user2)
        
        # Check permission
        has_permission = permission.has_object_permission(
            request=request,
            view=None,
            obj=self.weight_entry
        )
        
        # Non-owner should not be able to make DELETE requests
        self.assertFalse(has_permission)