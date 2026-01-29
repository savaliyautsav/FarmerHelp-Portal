import requests
import sys
import json
import base64
from datetime import datetime
from io import BytesIO
from PIL import Image

class SmartFarmerAPITester:
    def __init__(self, base_url="https://smartfarm-41.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.passed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    # Remove Content-Type for multipart/form-data
                    headers.pop('Content-Type', None)
                    response = requests.post(url, data=data, files=files, headers=headers, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                self.passed_tests.append(name)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def create_test_image(self):
        """Create a simple test image for disease detection"""
        # Create a simple test image with some visual features
        img = Image.new('RGB', (300, 300), color='green')
        # Add some visual features (simple pattern)
        for i in range(0, 300, 20):
            for j in range(0, 300, 20):
                if (i + j) % 40 == 0:
                    for x in range(i, min(i+10, 300)):
                        for y in range(j, min(j+10, 300)):
                            img.putpixel((x, y), (255, 255, 0))  # Yellow spots
        
        # Convert to bytes
        img_buffer = BytesIO()
        img.save(img_buffer, format='JPEG')
        img_buffer.seek(0)
        return img_buffer

    def test_health_endpoint(self):
        """Test API health check"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_weather_endpoint(self):
        """Test weather API"""
        return self.run_test("Weather API", "GET", "weather?lat=28.6139&lng=77.2090", 200)

    def test_market_prices_endpoint(self):
        """Test market prices API"""
        return self.run_test("Market Prices API", "GET", "market-prices", 200)

    def test_news_endpoint(self):
        """Test news API"""
        return self.run_test("News API", "GET", "news", 200)

    def test_policies_endpoint(self):
        """Test government policies API"""
        return self.run_test("Government Policies API", "GET", "policies", 200)

    def test_resources_endpoints(self):
        """Test farming resources APIs"""
        success1, _ = self.run_test("Farming Tools API", "GET", "resources/tools", 200)
        success2, _ = self.run_test("Fertilizers API", "GET", "resources/fertilizers", 200)
        success3, _ = self.run_test("Medicines API", "GET", "resources/medicines", 200)
        return success1 and success2 and success3

    def test_user_management(self):
        """Test user management APIs"""
        # Test creating a user
        test_user = {
            "firebase_uid": f"test_user_{datetime.now().strftime('%H%M%S')}",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "display_name": "Test User",
            "role": "user"
        }
        
        success1, user_data = self.run_test("Create User", "POST", "users", 200, test_user)
        if not success1:
            return False
            
        # Test getting the user
        firebase_uid = test_user["firebase_uid"]
        success2, _ = self.run_test("Get User", "GET", f"users/{firebase_uid}", 200)
        
        # Test getting all users
        success3, _ = self.run_test("Get All Users", "GET", "users", 200)
        
        return success1 and success2 and success3

    def test_disease_detection(self):
        """Test disease detection API with image upload"""
        try:
            # Create test image
            test_image = self.create_test_image()
            
            # Prepare form data
            form_data = {
                'user_id': f'test_user_{datetime.now().strftime("%H%M%S")}'
            }
            
            files = {
                'image': ('test_crop.jpg', test_image, 'image/jpeg')
            }
            
            success, response = self.run_test(
                "Disease Detection", 
                "POST", 
                "detect-disease", 
                200, 
                data=form_data, 
                files=files
            )
            
            if success and isinstance(response, dict):
                if 'report' in response:
                    print(f"   Disease detected: {response['report'].get('disease_name', 'Unknown')}")
                    print(f"   Crop: {response['report'].get('crop_name', 'Unknown')}")
                    return True
            
            return success
            
        except Exception as e:
            print(f"❌ Disease Detection Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": "Disease Detection",
                "error": str(e)
            })
            return False

    def test_contact_form(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Message",
            "message": "This is a test message from automated testing."
        }
        
        success1, _ = self.run_test("Submit Contact Form", "POST", "contact", 200, contact_data)
        success2, _ = self.run_test("Get Contact Messages", "GET", "contact", 200)
        
        return success1 and success2

    def test_admin_stats(self):
        """Test admin statistics API"""
        return self.run_test("Admin Statistics", "GET", "admin/stats", 200)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Smart Farmer Portal API Tests")
        print("=" * 50)
        
        # Core API tests
        self.test_health_endpoint()
        self.test_weather_endpoint()
        self.test_market_prices_endpoint()
        self.test_news_endpoint()
        self.test_policies_endpoint()
        
        # Resources tests
        self.test_resources_endpoints()
        
        # User management tests
        self.test_user_management()
        
        # Disease detection test
        self.test_disease_detection()
        
        # Contact form test
        self.test_contact_form()
        
        # Admin stats test
        self.test_admin_stats()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results Summary")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"   - {failure.get('test', 'Unknown')}: {failure.get('error', failure.get('response', 'Unknown error'))}")
        
        if self.passed_tests:
            print(f"\n✅ Passed Tests:")
            for test in self.passed_tests:
                print(f"   - {test}")
        
        return len(self.failed_tests) == 0

def main():
    tester = SmartFarmerAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())