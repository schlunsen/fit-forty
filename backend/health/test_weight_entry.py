from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from datetime import datetime, timezone
from health.models import WeightEntry


class WeightEntryModelTest(TestCase):
    """Test the WeightEntry model"""
    
    def setUp(self):
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
        
        # Create a weight entry for user1
        self.weight_entry = WeightEntry.objects.create(
            user=self.user1,
            weight_kg=75.5,
            timestamp=datetime.now(timezone.utc),
            notes="Test note"
        )
    
    def test_weight_entry_creation(self):
        """Test that a weight entry can be created"""
        self.assertEqual(self.weight_entry.weight_kg, 75.5)
        self.assertEqual(self.weight_entry.user, self.user1)
        self.assertTrue(isinstance(self.weight_entry, WeightEntry))
        self.assertTrue(str(self.weight_entry).startswith("testuser1"))


class WeightEntryAPITest(TestCase):
    """Test the WeightEntry API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        
        # Clear all existing weight entries to ensure a clean test environment
        WeightEntry.objects.all().delete()
        
        # Create two test users
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
        
        # Create weight entries for both users
        self.weight_entry1 = WeightEntry.objects.create(
            user=self.user1,
            weight_kg=75.5,
            timestamp=datetime.now(timezone.utc),
            notes="Test note for user 1"
        )
        self.weight_entry2 = WeightEntry.objects.create(
            user=self.user2,
            weight_kg=80.0,
            timestamp=datetime.now(timezone.utc),
            notes="Test note for user 2"
        )
        
        # URLs for API endpoints
        self.list_url = reverse('weightentry-list')
        self.detail_url1 = reverse('weightentry-detail', args=[self.weight_entry1.id])
        self.detail_url2 = reverse('weightentry-detail', args=[self.weight_entry2.id])
    
    def test_list_weight_entries_unauthenticated(self):
        """Test that unauthenticated users cannot access weight entries"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_weight_entries_authenticated(self):
        """Test that authenticated users can only see their own weight entries"""
        # Clear any previous data to ensure test isolation
        WeightEntry.objects.all().delete()
        
        # Create test entries for each user
        entry1 = WeightEntry.objects.create(
            user=self.user1,
            weight_kg=75.5,
            timestamp=datetime.now(timezone.utc),
            notes="Test entry for user 1"
        )
        entry2 = WeightEntry.objects.create(
            user=self.user2,
            weight_kg=80.0,
            timestamp=datetime.now(timezone.utc),
            notes="Test entry for user 2"
        )
        
        # Authenticate as user1
        self.client.force_authenticate(user=self.user1)
        
        # Get list of weight entries
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Handle paginated response
        if 'results' in response.data:
            # Paginated response
            self.assertEqual(response.data['count'], 1)  # Only 1 entry for this user
            results = response.data['results']
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['id'], entry1.id)
        else:
            # Non-paginated response
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]['id'], entry1.id)
        
        # Authenticate as user2
        self.client.force_authenticate(user=self.user2)
        
        # Get list of weight entries
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Handle paginated response
        if 'results' in response.data:
            # Paginated response
            self.assertEqual(response.data['count'], 1)  # Only 1 entry for this user
            results = response.data['results']
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['id'], entry2.id)
        else:
            # Non-paginated response
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]['id'], entry2.id)
    
    def test_retrieve_weight_entry(self):
        """Test that users can only retrieve their own weight entries"""
        # Authenticate as user1
        self.client.force_authenticate(user=self.user1)
        
        # User1 can access their own entry
        response = self.client.get(self.detail_url1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.weight_entry1.id)
        
        # User1 cannot access user2's entry
        response = self.client.get(self.detail_url2)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_create_weight_entry(self):
        """Test that authenticated users can create weight entries"""
        # Authenticate as user1
        self.client.force_authenticate(user=self.user1)
        
        # Create a new weight entry
        data = {
            'weight_kg': 76.0,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'notes': 'New weight entry'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check that the entry was created with the correct user
        new_entry = WeightEntry.objects.get(id=response.data['id'])
        self.assertEqual(new_entry.user, self.user1)
        self.assertEqual(new_entry.weight_kg, 76.0)
        
        # Verify that the total count of entries for user1 is now 2
        self.assertEqual(WeightEntry.objects.filter(user=self.user1).count(), 2)
    
    def test_update_weight_entry(self):
        """Test that users can only update their own weight entries"""
        # Authenticate as user1
        self.client.force_authenticate(user=self.user1)
        
        # Update user1's entry
        data = {
            'weight_kg': 77.0,
            'timestamp': self.weight_entry1.timestamp.isoformat(),
            'notes': 'Updated note'
        }
        
        response = self.client.put(self.detail_url1, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh from database
        self.weight_entry1.refresh_from_db()
        self.assertEqual(self.weight_entry1.weight_kg, 77.0)
        self.assertEqual(self.weight_entry1.notes, 'Updated note')
        
        # Attempt to update user2's entry
        data = {
            'weight_kg': 81.0,
            'timestamp': self.weight_entry2.timestamp.isoformat(),
            'notes': 'Attempted update'
        }
        
        response = self.client.put(self.detail_url2, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Verify user2's entry was not changed
        self.weight_entry2.refresh_from_db()
        self.assertEqual(self.weight_entry2.weight_kg, 80.0)
    
    def test_delete_weight_entry(self):
        """Test that users can only delete their own weight entries"""
        # Authenticate as user1
        self.client.force_authenticate(user=self.user1)
        
        # Attempt to delete user2's entry
        response = self.client.delete(self.detail_url2)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Verify user2's entry still exists
        self.assertTrue(WeightEntry.objects.filter(id=self.weight_entry2.id).exists())
        
        # Delete user1's entry
        response = self.client.delete(self.detail_url1)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify user1's entry was deleted
        self.assertFalse(WeightEntry.objects.filter(id=self.weight_entry1.id).exists())