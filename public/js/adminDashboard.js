// Logout Functionality
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}

// Dynamic Fetch for Applications List
async function fetchApplications() {
  try {
    const response = await fetch('/api/admin/applications');
    const result = await response.json();
    const container = document.getElementById('applications-list');
    
    if (result.success && result.data.length > 0) {
      container.innerHTML = result.data.map(app => `
        <div class="app-card">
          <h3>${app.studentName}</h3>
          <p><strong>Room Requested:</strong> ${app.roomRequested}</p>
          <p><strong>Date Submitted:</strong> ${app.date}</p>
          <p><strong>Status:</strong> <span class="badge-pending">${app.status}</span></p>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p>No pending applications found.</p>';
    }
  } catch (err) {
    console.error('Error fetching applications:', err);
    document.getElementById('applications-list').innerHTML = '<p style="color: red;">Failed to load applications.</p>';
  }
}

// Automatically load applications when page visits
fetchApplications();