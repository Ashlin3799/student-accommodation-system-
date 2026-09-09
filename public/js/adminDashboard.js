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
        <div class="app-card" id="app-${app.id}">
          <h3>${app.studentName}</h3>
          <p><strong>Room Requested:</strong> ${app.roomRequested}</p>
          <p><strong>Date Submitted:</strong> ${app.date}</p>
          <p><strong>Status:</strong> <span class="badge-${app.status.toLowerCase()}">${app.status}</span></p>
          
          ${app.status === 'Pending' ? `
            <div style="margin-top: 10px;">
              <button onclick="updateStatus('${app.id}', 'Approved')" style="background:#22c55e; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; margin-right:8px;">Approve</button>
              <button onclick="updateStatus('${app.id}', 'Rejected')" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">Reject</button>
            </div>
          ` : ''}
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


// Handle Approve / Reject Actions
async function updateStatus(applicationId, newStatus) {
  try {
    const response = await fetch(`/api/admin/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json();
    if (result.success) {
      alert(`Application ${newStatus} successfully!`);
      fetchApplications(); // Reload UI
    } else {
      alert('Failed to update status');
    }
  } catch (err) {
    console.error('Error updating status:', err);
  }
}

// Automatically load applications when page visits
fetchApplications();