from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from datetime import datetime, timezone
from health.models import BloodPressureReading


class BloodPressureReadingModelTest(TestCase):
    """Test the BloodPressureReading model"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='password123'
        )
        
        # Create a BP reading for user1
        self.bp_reading = BloodPressureReading.objects.create(
            user=self.user1,
            systolic=120,
            diastolic=80,
            pulse=72,
            timestamp=datetime.now(timezone.utc),
            notes="Test note"
        )
    
    def test_bp_reading_creation(self):
        """Test that a blood pressure reading can be created"""
        self.assertEqual(self.bp_reading.systolic, 120)
        self.assertEqual(self.bp_reading.diastolic, 80)
        self.assertEqual(self.bp_reading.pulse, 72)
        self.assertEqual(self.bp_reading.user, self.user1)
        self.assertTrue(isinstance(self.bp_reading, BloodPressureReading))
        self.assertTrue(str(self.bp_reading).startswith("testuser1"))


class BloodPressureReadingAPITest(TestCase):
    """Test the BloodPressureReading API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        
        # Clear all existing BP readings to ensure a clean test environment
        BloodPressureReading.objects.all().delete()
        
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
        
        # Create BP readings for both users
        self.bp_reading1 = BloodPressureReading.objects.create(
            user=self.user1,
            systolic=120,
            diastolic=80,
            pulse=72,
            timestamp=datetime.now(timezone.utc),
            notes="Test note for user 1"
        )
        self.bp_reading2 = BloodPressureReading.objects.create(
            user=self.user2,
            systolic=130,
            diastolic=85,
            pulse=75,
            timestamp=datetime.now(timezone.utc),
            notes="Test note for user 2"
        )
        
        # URLs for API endpoints
        self.list_url = reverse('bloodpressurereading-list')
        self.detail_url1 = reverse('bloodpressurereading-detail', args=[self.bp_reading1.id])
        self.detail_url2 = reverse('bloodpressurereading-detail', args=[self.bp_reading2.id])
    
    def test_list_bp_readings_unauthenticated(self):
        """Test that unauthenticated users cannot access BP readings"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_bp_readings_authenticated(self):
        """Test that authenticated users can only see their own BP readings"""
        # Clear any previous data to ensure test isolation
        BloodPressureReading.objects.all().delete()
        
        # Create test readings for each user
        reading1 = BloodPressureReading.objects.create(
            user=self.user1,
            systolic=120,
            diastolic=80,
            pulse=72,
            timestamp=datetime.now(timezone.utc),
            notes="Test reading for user 1"
        )
        reading2 = BloodPressureReading.objects.create(
            user=self.user2,
            systolic=130,
            diastolic=85,
            pulse=75,
            timestamp=datetime.now(timezone.utc),
            notes="Test reading for user 2"
        )
        
        # Authenticate as user1
        self.client.force_authenticate(user=self.user1)
        
        # Get list of BP readings
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Handle paginated response
        if 'results' in response.data:
            # Paginated response
            self.assertEqual(response.data['count'], 1)  # Only 1 entry for this user
            results = response.data['results']
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['id'], reading1.id)
        else:
            # Non-paginated response
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]['id'], reading1.id)
        
        # Authenticate as user2
        self.client.force_authenticate(user=self.user2)
        
        # Get list of BP readings
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Handle paginated response
        if 'results' in response.data:
            # Paginated response
            self.assertEqual(response.data['count'], 1)  # Only 1 entry for this user
            results = response.data['results']
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['id'], reading2.id)
        else:
            # Non-paginated response
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]['id'], reading2.id)
    
    def test_retrieve_bp_reading(self):
        """Test that users can only retrieve their own BP readings"""
        # Authenticate as user1
        self.client.force_authenticate(user=self.user1)
        
        # User1 can access their own reading
        response = self.client.get(self.detail_url1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.bp_reading1.id)
        
        # User1 cannot access user2's reading
        response = self.client.get(self.detail_url2)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_create_bp_reading(self):
        """Test that authenticated users can create BP readings"""
        # Authenticate as user1
        self.client.force_authenticate(user=self.user1)
        
        # Create a new BP reading
        data = {
            'systolic': 122,
            'diastolic': 82,
            'pulse': 70,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'notes': 'New BP reading'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check that the reading was created with the correct user
        new_reading = BloodPressureReading.objects.get(id=response.data['id'])
        self.assertEqual(new_reading.user, self.user1)
        self.assertEqual(new_reading.systolic, 122)
        self.assertEqual(new_reading.diastolic, 82)
        
        # Verify that the total count of readings for user1 is now 2
        self.assertEqual(BloodPressureReading.objects.filter(user=self.user1).count(), 2)
    
    def test_update_bp_reading(self):
        """Test that users can only update their own BP readings"""
        # Authenticate as user1
        self.client.force_authenticate(user=self.user1)
        
        # Update user1's reading
        data = {
            'systolic': 125,
            'diastolic': 85,
            'pulse': 75,
            'timestamp': self.bp_reading1.timestamp.isoformat(),
            'notes': 'Updated note'
        }
        
        response = self.client.put(self.detail_url1, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh from database
        self.bp_reading1.refresh_from_db()
        self.assertEqual(self.bp_reading1.systolic, 125)
        self.assertEqual(self.bp_reading1.diastolic, 85)
        self.assertEqual(self.bp_reading1.notes, 'Updated note')
        
        # Attempt to update user2's reading
        data = {
            'systolic': 135,
            'diastolic': 90,
            'pulse': 80,
            'timestamp': self.bp_reading2.timestamp.isoformat(),
            'notes': 'Attempted update'
        }
        
        response = self.client.put(self.detail_url2, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Verify user2's reading was not changed
        self.bp_reading2.refresh_from_db()
        self.assertEqual(self.bp_reading2.systolic, 130)
        self.assertEqual(self.bp_reading2.diastolic, 85)
    
    def test_delete_bp_reading(self):
        """Test that users can only delete their own BP readings"""
        # Authenticate as user1
        self.client.force_authenticate(user=self.user1)
        
        # Attempt to delete user2's reading
        response = self.client.delete(self.detail_url2)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Verify user2's reading still exists
        self.assertTrue(BloodPressureReading.objects.filter(id=self.bp_reading2.id).exists())
        
        # Delete user1's reading
        response = self.client.delete(self.detail_url1)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify user1's reading was deleted
        self.assertFalse(BloodPressureReading.objects.filter(id=self.bp_reading1.id).exists())