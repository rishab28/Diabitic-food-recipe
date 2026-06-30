import urllib.request
import time
import socket

def test_speed(url):
    print(f"Testing speed for: {url}\n")
    
    # Measure DNS lookup
    dns_start = time.perf_counter()
    host = url.split("//")[-1].split("/")[0]
    ip = socket.gethostbyname(host)
    dns_time = time.perf_counter() - dns_start
    print(f"Resolved {host} to {ip} in {dns_time * 1000:.2f} ms")
    
    # Fetch content and measure times
    times = []
    for i in range(5):
        start = time.perf_counter()
        response = urllib.request.urlopen(url)
        content = response.read()
        duration = time.perf_counter() - start
        times.append(duration)
        
    avg_duration = sum(times) / len(times)
    print(f"Average Server Response Time: {avg_duration * 1000:.2f} ms")
    print(f"HTML Payload Size: {len(content) / 1024:.2f} KB\n")
    
    print("Performance Verdict:")
    if avg_duration < 0.3:
        print("🟢 EXTREMELY FAST (Vercel Edge Optimized) - Under 300ms!")
    elif avg_duration < 1.0:
        print("🟡 GOOD (Satisfactory Load Time) - Under 1 second")
    else:
        print("🔴 SLOW (High latency/Server load) - Over 1 second")

if __name__ == "__main__":
    test_speed("https://secretswapvaults.vercel.app/")
