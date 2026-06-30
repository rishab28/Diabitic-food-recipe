import csv
from collections import defaultdict

file_path = "ads data/Untitled-report-Jun-19-2026-to-Jun-23-2026.csv"

# Dictionary to hold aggregated data
# Format: { 'Campaign Name': { 'Ad Name': { 'spend': 0.0, 'purchases': 0, 'clicks': 0, 'impressions': 0 } } }
data = defaultdict(lambda: defaultdict(lambda: {'spend': 0.0, 'purchases': 0, 'clicks': 0, 'impressions': 0}))

try:
    with open(file_path, "r", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        headers = next(reader)
        
        # Get indices
        idx_camp = headers.index('Campaign name')
        idx_ad = headers.index('Ad name')
        idx_spend = headers.index('Amount spent (INR)')
        idx_purch = headers.index('Purchases')
        idx_clicks = headers.index('Link clicks')
        idx_imp = headers.index('Impressions')
        
        for row in reader:
            if not row or len(row) < len(headers):
                continue
            
            camp = row[idx_camp]
            ad = row[idx_ad]
            spend_str = row[idx_spend]
            purch_str = row[idx_purch]
            clicks_str = row[idx_clicks]
            imp_str = row[idx_imp]
            
            spend = float(spend_str) if spend_str else 0.0
            purch = int(float(purch_str)) if purch_str else 0
            clicks = int(float(clicks_str)) if clicks_str else 0
            imp = int(float(imp_str)) if imp_str else 0
            
            # Since rows might be broken down by day/age/gender, we sum them up
            data[camp][ad]['spend'] += spend
            data[camp][ad]['purchases'] += purch
            data[camp][ad]['clicks'] += clicks
            data[camp][ad]['impressions'] += imp

    # Print Report
    print("===== EXPERT META ADS ANALYSIS =====")
    for camp, ads in data.items():
        print(f"\nCAMPAIGN: {camp}")
        print("-" * 60)
        for ad, metrics in ads.items():
            spend = metrics['spend']
            purch = metrics['purchases']
            clicks = metrics['clicks']
            imp = metrics['impressions']
            
            cpa = spend / purch if purch > 0 else 0
            cpc = spend / clicks if clicks > 0 else 0
            ctr = (clicks / imp * 100) if imp > 0 else 0
            
            print(f"AD: {ad}")
            print(f"  Spend: ₹{spend:.2f}")
            print(f"  Purchases: {purch}  |  CPA: ₹{cpa:.2f}")
            print(f"  Clicks: {clicks}  |  CPC: ₹{cpc:.2f}  |  CTR: {ctr:.2f}%")
            print(f"  Impressions: {imp}")
            print("")

except Exception as e:
    print(f"Error parsing CSV: {e}")
