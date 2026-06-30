import urllib.request
import time
import socket

def test_all_pages():
    base_url = "https://secretswapvaults.vercel.app"
    
    pages = [
        # Diabetic Funnel
        {"name": "Diabetic Landing Page", "path": "/"},
        {"name": "Diabetic Upsell (₹999)", "path": "/upsell.html"},
        {"name": "Diabetic Downsell (₹499)", "path": "/downsell.html"},
        {"name": "Diabetic Thank-You (Normal)", "path": "/thankyou.html"},
        {"name": "Diabetic Thank-You (VIP)", "path": "/thankyou-vip.html"},
        
        # Kids Funnel
        {"name": "Kids Hinglish Landing Page", "path": "/kids/"},
        {"name": "Kids English Landing Page", "path": "/kids/index-en.html"},
        {"name": "Kids Hinglish Upsell (₹999)", "path": "/kids/upsell.html"},
        {"name": "Kids English Upsell (₹999)", "path": "/kids/upsell-en.html"},
        {"name": "Kids Hinglish Downsell (₹499)", "path": "/kids/downsell.html"},
        {"name": "Kids English Downsell (₹499)", "path": "/kids/downsell-en.html"},
        {"name": "Kids Thank-You (Normal)", "path": "/kids/thankyou.html"},
        {"name": "Kids Thank-You (VIP)", "path": "/kids/thankyou-vip.html"}
    ]
    
    # Resolve host once
    host = "secretswapvaults.vercel.app"
    dns_start = time.perf_counter()
    ip = socket.gethostbyname(host)
    dns_time = (time.perf_counter() - dns_start) * 1000
    
    print(f"DNS Resolution: Resolved {host} to {ip} in {dns_time:.2f} ms\n")
    
    results = []
    
    for page in pages:
        url = base_url + page["path"]
        print(f"Testing: {page['name']} ({page['path']})...")
        
        times = []
        content_size = 0
        
        # Test 3 runs to get a stable average
        for i in range(3):
            try:
                start = time.perf_counter()
                response = urllib.request.urlopen(url)
                content = response.read()
                duration = time.perf_counter() - start
                times.append(duration)
                content_size = len(content)
            except Exception as e:
                print(f"Error loading {url}: {e}")
                times.append(99.9) # failure penalty
        
        avg_time = sum(times) / len(times)
        results.append({
            "name": page["name"],
            "path": page["path"],
            "avg_time_ms": avg_time * 1000,
            "size_kb": content_size / 1024
        })
        time.sleep(0.1) # brief pause to prevent hitting rate limits
        
    print("\nGenerating Markdown Report Table...")
    
    report_lines = []
    report_lines.append("| Funnel Page Name | Path | Load Time (ms) | Size (KB) | Speed Status |")
    report_lines.append("| :--- | :--- | :--- | :--- | :--- |")
    
    for r in results:
        t = r["avg_time_ms"]
        status = ""
        if t < 300:
            status = "🟢 Blazing Fast (<300ms)"
        elif t < 600:
            status = "🟡 Good (<600ms)"
        else:
            status = "🔴 Review Required (>600ms)"
            
        report_lines.append(f"| {r['name']} | `{r['path']}` | **{t:.1f} ms** | {r['size_kb']:.2f} KB | {status} |")
        
    report = "\n".join(report_lines)
    
    # Save report
    with open("speed_report.md", "w") as f:
        f.write(report)
        
    print("\n--- SPEED REPORT ---")
    print(report)

if __name__ == "__main__":
    test_all_pages()
