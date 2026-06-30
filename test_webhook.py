import urllib.request
import json

def test_user_webhook():
    url = "https://script.google.com/macros/s/AKfycbxLAG9bSL8rdr-0YYwXxM61al5QP6FXURZqiuqmbHlcSHRI1dTcolrGPVfrBXxvyW5dtA/exec"
    payload = {
        "name": "Test User",
        "phone": "9999988888",
        "email": "test@gmail.com",
        "url": "https://secretswapvaults.vercel.app/test",
        "timestamp": "2026-06-29T12:00:00Z"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(
        url, 
        data=json.dumps(payload).encode('utf-8'), 
        headers=headers,
        method="POST"
    )
    
    print("Sending POST request to user webhook...")
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"HTTP Status: {status}")
            print(f"Response body:\n{body}")
    except Exception as e:
        print(f"Error making request: {e}")

if __name__ == "__main__":
    test_user_webhook()
