import requests
from bs4 import BeautifulSoup
import json
import os

url = "https://cses.fi/problemset/stats/friends/"

# Use environment variable for session ID, fallback to hardcoded for local testing.
session_id = os.environ.get("CSES_PHPSESSID", "bd118d15d63b39770097e0bb8252ce71a994e489")
cookies = {
    "PHPSESSID": session_id
}

def main():
    res = requests.get(url, cookies=cookies)
    if res.status_code != 200:
        print(f"Failed to fetch: {res.status_code}")
        return

    soup = BeautifulSoup(res.text, "html.parser")
    table = soup.find_all("table", class_="narrow")
    
    # The first table is the summary, the second is the leaderboard
    if len(table) < 2:
        print("Could not find the ranking table.")
        return
        
    leaderboard_table = table[-1]
    leaderboard = []
    
    for row in leaderboard_table.find_all("tr")[1:]:
        cols = row.find_all("td")
        if len(cols) >= 4:
            rank = cols[0].text.strip()
            user = cols[1].text.strip()
            solved = cols[2].text.strip()
            last_progress = cols[3].text.strip()
            
            leaderboard.append({
                "rank": rank,
                "user": user,
                "solved_tasks": solved,
                "last_progress": last_progress
            })
            
    os.makedirs("data", exist_ok=True)
    with open("data/cses_leaderboard.json", "w", encoding="utf-8") as f:
        json.dump(leaderboard, f, ensure_ascii=False, indent=4)
        
    print(f"Successfully saved {len(leaderboard)} users to data/cses_leaderboard.json")

if __name__ == "__main__":
    main()