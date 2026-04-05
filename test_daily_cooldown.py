import requests
import sys

def test_daily_cooldown():
    """Test daily bonus cooldown after fix"""
    base_url = "https://clicker-game-idle.preview.emergentagent.com/api"
    session = requests.Session()
    
    # Login as existing user who already claimed
    login_data = {
        "email": "pguser@test.com",
        "password": "testpass123"
    }
    
    print("🔍 Testing Daily Bonus Cooldown Fix...")
    
    # Login
    response = session.post(f"{base_url}/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        return False
    
    print("✅ Logged in successfully")
    
    # Try to claim daily bonus (should fail with 400)
    response = session.post(f"{base_url}/daily/claim")
    
    if response.status_code == 400:
        print("✅ Cooldown correctly enforced with 400 status")
        try:
            error_detail = response.json()
            print(f"   Error message: {error_detail.get('detail', 'No detail')}")
        except:
            print(f"   Response: {response.text}")
        return True
    else:
        print(f"❌ Expected 400, got {response.status_code}")
        try:
            error_detail = response.json()
            print(f"   Response: {error_detail}")
        except:
            print(f"   Response: {response.text}")
        return False

if __name__ == "__main__":
    success = test_daily_cooldown()
    sys.exit(0 if success else 1)