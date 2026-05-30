document.addEventListener('DOMContentLoaded', () => {
    const leaderboardBody = document.getElementById('leaderboard-body');
    const loadingState = document.getElementById('loading');
    const errorState = document.getElementById('error');
    const lastUpdated = document.getElementById('last-updated');

    async function fetchLeaderboard() {
        try {
            // Add a cache buster to ensure we get the latest data from GitHub Pages
            const timestamp = new Date().getTime();
            const response = await fetch(`./data/cses_leaderboard.json?t=${timestamp}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            renderLeaderboard(data);
            
            // Set last updated time based on the response headers if available, or just current time if testing locally
            const lastModified = response.headers.get('Last-Modified');
            if (lastModified) {
                const date = new Date(lastModified);
                lastUpdated.textContent = `Last updated: ${date.toLocaleString()}`;
            } else {
                lastUpdated.textContent = 'Live Leaderboard';
            }
            
        } catch (error) {
            console.error("Could not fetch leaderboard data:", error);
            loadingState.style.display = 'none';
            errorState.style.display = 'flex';
        }
    }

    function renderLeaderboard(data) {
        leaderboardBody.innerHTML = '';
        
        if (!data || data.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No data available</td></tr>';
            loadingState.style.display = 'none';
            return;
        }

        data.forEach((user, index) => {
            const tr = document.createElement('tr');
            
            // Clean up rank string (e.g., removing # if present and parsing to int)
            const rankNum = parseInt(user.rank.replace(/[^0-9]/g, '')) || (index + 1);
            tr.setAttribute('data-rank', rankNum);
            
            tr.innerHTML = `
                <td><span class="rank-badge">${user.rank}</span></td>
                <td class="user-cell">${escapeHTML(user.user)}</td>
                <td><span class="solved-count">${escapeHTML(user.solved_tasks)}</span></td>
                <td>${escapeHTML(user.last_progress)}</td>
            `;
            
            leaderboardBody.appendChild(tr);
        });
        
        loadingState.style.display = 'none';
    }

    // Helper to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Initialize
    fetchLeaderboard();
});
