import requests
import sys
import json
from datetime import datetime

class AIStartupClickerTester:
    def __init__(self, base_url="https://clicker-game-idle.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.user_data = None
        self.game_state = None

    def run_test(self, name, method, endpoint, expected_status, data=None, cookies=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")

            return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_password_validation(self):
        """Test password validation rules"""
        timestamp = datetime.now().strftime('%H%M%S')
        
        # Test weak passwords that should fail
        weak_passwords = [
            ("short", "Short password (< 8 chars)"),
            ("12345678", "No letters"),
            ("abcdefgh", "No numbers"),
            ("abc123", "Too short + missing requirements")
        ]
        
        for weak_pass, description in weak_passwords:
            test_data = {
                "email": f"test{timestamp}@example.com",
                "password": weak_pass,
                "username": f"TestUser{timestamp}"
            }
            
            success, response = self.run_test(
                f"Password Validation - {description}",
                "POST",
                "auth/register",
                422,  # Validation error
                data=test_data
            )
            
            if not success:
                print(f"   ❌ Expected validation error for: {description}")
                return False
        
        print("   ✅ All weak passwords correctly rejected")
        return True

    def test_username_validation(self):
        """Test username validation rules"""
        timestamp = datetime.now().strftime('%H%M%S')
        
        # Test invalid usernames that should fail
        invalid_usernames = [
            ("ab", "Too short (< 3 chars)"),
            ("user@name", "Contains special chars"),
            ("user name", "Contains spaces"),
            ("user-name", "Contains hyphens"),
            ("user.name", "Contains dots")
        ]
        
        for invalid_user, description in invalid_usernames:
            test_data = {
                "email": f"test{timestamp}@example.com",
                "password": "validpass123",
                "username": invalid_user
            }
            
            success, response = self.run_test(
                f"Username Validation - {description}",
                "POST",
                "auth/register",
                422,  # Validation error
                data=test_data
            )
            
            if not success:
                print(f"   ❌ Expected validation error for: {description}")
                return False
        
        print("   ✅ All invalid usernames correctly rejected")
        return True

    def test_register_new_user(self):
        """Test user registration with valid credentials"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "email": f"testuser{timestamp}@example.com",
            "password": "testpass123",  # Valid: 8+ chars, has letter, has number
            "username": f"TestUser{timestamp}"  # Valid: 3+ chars, alphanumeric
        }
        
        success, response = self.run_test(
            "User Registration (Valid Credentials)",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if success and response:
            self.user_data = {
                "email": test_data["email"],
                "password": test_data["password"],
                "username": test_data["username"],
                "id": response.get("id")
            }
            print(f"   Created user: {self.user_data['username']}")
            return True
        return False

    def test_login_with_invalid_credentials(self):
        """Test login with invalid credentials should fail"""
        test_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        success, response = self.run_test(
            "Login with Invalid Credentials",
            "POST",
            "auth/login",
            401,  # Unauthorized
            data=test_data
        )
        
        if success:
            print("   ✅ Invalid credentials correctly rejected")
            return True
        return False

    def test_login_new_user(self):
        """Test login with newly created user"""
        if not self.user_data:
            print("❌ No user data available for login test")
            return False
            
        test_data = {
            "email": self.user_data["email"],
            "password": self.user_data["password"]
        }
        
        success, response = self.run_test(
            "Login New User",
            "POST",
            "auth/login",
            200,
            data=test_data
        )
        
        if success and response:
            print(f"   Logged in as: {response.get('username')}")
            return True
        return False

    def test_get_me(self):
        """Test get current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        if success and response:
            print(f"   User info: {response.get('username')} ({response.get('email')})")
            return True
        return False

    def test_game_state(self):
        """Test get game state"""
        success, response = self.run_test(
            "Get Game State",
            "GET",
            "game/state",
            200
        )
        
        if success and response:
            self.game_state = response
            print(f"   Current users: {response.get('current_users')}")
            print(f"   Click power: {response.get('click_power')}")
            print(f"   Passive income: {response.get('passive_income')}")
            print(f"   Upgrades available: {len(response.get('upgrades', []))}")
            return True
        return False

    def test_click(self):
        """Test clicking to gain users"""
        success, response = self.run_test(
            "Click to Gain Users",
            "POST",
            "game/click",
            200
        )
        
        if success and response:
            print(f"   Gained: {response.get('gained')} users")
            print(f"   New total: {response.get('current_users')}")
            return True
        return False

    def test_buy_upgrade(self):
        """Test buying an upgrade"""
        if not self.game_state or not self.game_state.get('upgrades'):
            print("❌ No game state available for upgrade test")
            return False
        
        # Find an affordable upgrade
        affordable_upgrade = None
        for upgrade in self.game_state['upgrades']:
            if upgrade.get('can_afford', False):
                affordable_upgrade = upgrade
                break
        
        if not affordable_upgrade:
            print("   No affordable upgrades available, trying to click more...")
            # Click a few times to get more users
            for i in range(5):
                self.test_click()
            
            # Refresh game state
            self.test_game_state()
            
            # Try again
            for upgrade in self.game_state['upgrades']:
                if upgrade.get('can_afford', False):
                    affordable_upgrade = upgrade
                    break
        
        if not affordable_upgrade:
            print("   Still no affordable upgrades, testing with first upgrade anyway")
            affordable_upgrade = self.game_state['upgrades'][0]
        
        test_data = {
            "upgrade_id": affordable_upgrade['id']
        }
        
        expected_status = 200 if affordable_upgrade.get('can_afford', False) else 400
        
        success, response = self.run_test(
            f"Buy Upgrade ({affordable_upgrade['name']})",
            "POST",
            "game/buy-upgrade",
            expected_status,
            data=test_data
        )
        
        if success and response:
            if expected_status == 200:
                print(f"   Bought: {response.get('upgrade_id')}")
                print(f"   New level: {response.get('new_level')}")
                print(f"   Cost: {response.get('cost')}")
            return True
        return False

    def test_leaderboard(self):
        """Test leaderboard endpoint"""
        success, response = self.run_test(
            "Get Leaderboard",
            "GET",
            "leaderboard",
            200
        )
        
        if success and response:
            players = response.get('players', [])
            print(f"   Players on leaderboard: {len(players)}")
            if players:
                print(f"   Top player: {players[0].get('username')} with {players[0].get('total_users_generated')} users")
            return True
        return False

    def test_leaderboard_top10(self):
        """Test top 10 leaderboard endpoint"""
        success, response = self.run_test(
            "Get Top 10 Leaderboard",
            "GET",
            "leaderboard/top10",
            200
        )
        
        if success and response:
            print(f"   Top 10 players: {len(response)}")
            if response:
                print(f"   #1: {response[0].get('username')} with {response[0].get('total_users_generated')} users")
            return True
        return False

    def test_profile(self):
        """Test profile endpoint"""
        success, response = self.run_test(
            "Get Profile",
            "GET",
            "profile",
            200
        )
        
        if success and response:
            print(f"   Username: {response.get('username')}")
            print(f"   Rank: {response.get('rank')}")
            print(f"   Level: {response.get('level')}")
            print(f"   Total upgrades: {response.get('total_upgrades')}")
            return True
        return False

    def test_logout(self):
        """Test logout"""
        success, response = self.run_test(
            "Logout",
            "POST",
            "auth/logout",
            200
        )
        
        if success and response:
            print(f"   Message: {response.get('message')}")
            return True
        return False

def main():
    print("🚀 Starting AI Startup Clicker Backend Tests")
    print("=" * 50)
    
    tester = AIStartupClickerTester()
    
    # Test sequence
    tests = [
        ("Password Validation Tests", tester.test_password_validation),
        ("Username Validation Tests", tester.test_username_validation),
        ("Register New User (Valid)", tester.test_register_new_user),
        ("Login New User", tester.test_login_new_user),
        ("Login with Invalid Credentials", tester.test_login_with_invalid_credentials),
        ("Get Current User Info", tester.test_get_me),
        ("Get Game State", tester.test_game_state),
        ("Click to Gain Users", tester.test_click),
        ("Buy Upgrade", tester.test_buy_upgrade),
        ("Get Leaderboard", tester.test_leaderboard),
        ("Get Top 10 Leaderboard", tester.test_leaderboard_top10),
        ("Get Profile", tester.test_profile),
        ("Logout", tester.test_logout),
    ]
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print final results
    print(f"\n{'='*50}")
    print(f"📊 Final Results:")
    print(f"   Tests run: {tester.tests_run}")
    print(f"   Tests passed: {tester.tests_passed}")
    print(f"   Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())