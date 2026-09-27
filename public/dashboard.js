async function loadDashboard() {
  const message = document.querySelector('#dashboardMessage');

  if (message) {
    message.textContent = 'Loading dashboard...';
  }

  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    const response = await fetch('/api/dashboard/stats', {
      method: 'GET',
      headers: {
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

    await loadTrends();

    if (message) {
      message.textContent = 'Dashboard updated successfully.';
    }
  } catch (error) {
    console.error('Dashboard error:', error);

    if (message) {
      message.textContent =
        error.message || 'Unable to load dashboard.';
    }
  }
}

function renderDashboard(data) {
  if (!data) return;

  // Room statistics
  setValue('#totalRooms', data.rooms?.totalRooms ?? 0);
  setValue('#totalCapacity', data.rooms?.totalCapacity ?? 0);
  setValue('#totalOccupied', data.rooms?.totalOccupied ?? 0);
  setValue('#availableBeds', data.rooms?.availableBeds ?? 0);
  setValue(
    '#occupancyRate',
    `${data.rooms?.occupancyRate ?? 0}%`
  );

  // Application statistics
  setValue('#totalApplications', data.applications?.total ?? 0);
  setValue(
    '#pendingApplications',
    data.applications?.pending ?? 0
  );
  setValue(
    '#approvedApplications',
    data.applications?.approved ?? 0
  );
  setValue(
    '#rejectedApplications',
    data.applications?.rejected ?? 0
  );

  // Complaint statistics
  setValue('#totalComplaints', data.complaints?.total ?? 0);
  setValue(
    '#pendingComplaints',
    data.complaints?.pending ?? 0
  );
  setValue(
    '#progressComplaints',
    data.complaints?.inProgress ?? 0
  );
  setValue(
    '#resolvedComplaints',
    data.complaints?.resolved ?? 0
  );
}


// Chart.js instances
const dashboardCharts = {
  applicationsTrend: null,
  complaintsTrend: null,
  complaintsBreakdown: null
};


async function loadTrends(queryString = '') {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication token not found.');
    }

    const response = await fetch(
      `/api/dashboard/trends${queryString}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || 'Unable to load dashboard trends'
      );
    }

    renderTrendCharts(result.data);

    return result.data;
  } catch (error) {
    console.error('Dashboard trends error:', error);
    throw error;
  }
}


function renderTrendCharts(data) {
  if (typeof Chart === 'undefined') {
    console.error(
      'Chart.js is not loaded. Make sure the Chart.js script is included before this file.'
    );
    return;
  }

  if (!data) {
    console.error('No trend data received.');
    return;
  }

  renderLineChart(
    'applicationsTrendChart',
    'applicationsTrend',
    data.applications?.labels ?? [],
    data.applications?.series ?? {}
  );

  renderLineChart(
    'complaintsTrendChart',
    'complaintsTrend',
    data.complaints?.labels ?? [],
    data.complaints?.series ?? {}
  );

  renderBreakdownChart(
    'complaintsBreakdownChart',
    data.complaints?.series ?? {}
  );
}


function renderLineChart(canvasId, chartKey, labels, series) {
  const canvas = document.getElementById(canvasId);

  if (!canvas) {
    console.warn(`Canvas #${canvasId} was not found.`);
    return;
  }

  const colors = [
    '#f59e0b',
    '#3b82f6',
    '#22c55e',
    '#ef4444'
  ];

  const datasets = Object.keys(series).map(
    (statusKey, index) => ({
      label: statusKey,
      data: series[statusKey],
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length],
      tension: 0.25,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 5
    })
  );

  if (dashboardCharts[chartKey]) {
    dashboardCharts[chartKey].data.labels = labels;
    dashboardCharts[chartKey].data.datasets = datasets;
    dashboardCharts[chartKey].update();
    return;
  }

  dashboardCharts[chartKey] = new Chart(canvas, {
    type: 'line',

    data: {
      labels,
      datasets
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        mode: 'index',
        intersect: false
      },

      plugins: {
        legend: {
          display: true
        }
      },

      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}


function renderBreakdownChart(canvasId, series) {
  const canvas = document.getElementById(canvasId);

  if (!canvas) {
    console.warn(`Canvas #${canvasId} was not found.`);
    return;
  }

  const labels = Object.keys(series);

  const totals = labels.map((key) =>
    Array.isArray(series[key])
      ? series[key].reduce(
          (sum, number) => sum + Number(number || 0),
          0
        )
      : 0
  );

  const colors = [
    '#f59e0b',
    '#3b82f6',
    '#22c55e',
    '#ef4444'
  ];

  if (dashboardCharts.complaintsBreakdown) {
    dashboardCharts.complaintsBreakdown.data.labels = labels;

    dashboardCharts.complaintsBreakdown.data.datasets[0].data =
      totals;

    dashboardCharts.complaintsBreakdown.update();

    return;
  }

  dashboardCharts.complaintsBreakdown = new Chart(canvas, {
    type: 'doughnut',

    data: {
      labels,

      datasets: [
        {
          data: totals,
          backgroundColor: colors
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}


function setValue(selector, value) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}


function setupDashboard() {
  const refreshButton = document.querySelector(
    '#refreshDashboardBtn'
  );

  if (refreshButton) {
    refreshButton.addEventListener('click', loadDashboard);
  }

  loadDashboard();
}


document.addEventListener(
  'DOMContentLoaded',
  setupDashboard
);