async function loadDashboard() {
  const message = document.querySelector('#dashboardMessage');

  if (message) {
    message.textContent = 'Loading dashboard...';
  }

  try {
    const token = localStorage.getItem('token');

    const response = await fetch('/api/dashboard/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || 'Unable to load dashboard statistics'
      );
    }

    renderDashboard(result.data);

    if (message) {
      message.textContent = 'Dashboard updated successfully.';
    }
  } catch (error) {
    console.error('Dashboard error:', error);

    if (message) {
      message.textContent = error.message;
    }
  }
}

function renderDashboard(data) {
  // Room statistics
  setValue('#totalRooms', data.rooms.totalRooms);
  setValue('#totalCapacity', data.rooms.totalCapacity);
  setValue('#totalOccupied', data.rooms.totalOccupied);
  setValue('#availableBeds', data.rooms.availableBeds);
  setValue('#occupancyRate', `${data.rooms.occupancyRate}%`);

  // Application statistics
  setValue('#totalApplications', data.applications.total);
  setValue('#pendingApplications', data.applications.pending);
  setValue('#approvedApplications', data.applications.approved);
  setValue('#rejectedApplications', data.applications.rejected);

  // Complaint statistics
  setValue('#totalComplaints', data.complaints.total);
  setValue('#pendingComplaints', data.complaints.pending);
  setValue('#progressComplaints', data.complaints.inProgress);
  setValue('#resolvedComplaints', data.complaints.resolved);
}

function setValue(selector, value) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function setupDashboard() {
  const refreshButton = document.querySelector('#refreshDashboardBtn');

  if (refreshButton) {
    refreshButton.addEventListener('click', loadDashboard);
  }

  loadDashboard();
}

document.addEventListener('DOMContentLoaded', setupDashboard);