async function loadSidebar(activePage) {
  try {
    const response = await fetch('/admin/components/sidebar.html');
    const sidebarHtml = await response.text();
    
    // Find the container element or replace an existing sidebar div
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
      sidebarContainer.innerHTML = sidebarHtml;

      // Set active link highlight
      if (activePage) {
        const activeLink = sidebarContainer.querySelector(`[data-page="${activePage}"]`);
        if (activeLink) activeLink.classList.add('active');
      }

      // Restore admin name from localStorage if available
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const adminNameEl = document.getElementById('adminName');
          if (user.name && adminNameEl) adminNameEl.textContent = user.name;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
  } catch (error) {
    console.error('Failed to load sidebar:', error);
  }
}

// Global Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}