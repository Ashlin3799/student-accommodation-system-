// Admin Room Management (add/edit/delete rooms, search & filter, and a
// nicer card layout with room photos). Talks to the existing
// /api/rooms CRUD endpoints in src/routes/rooms.js.

// ----------------------------------------------------
// DOM ELEMENTS
// ----------------------------------------------------

const roomsGrid = document.getElementById('roomsGrid');
const roomsMessage = document.getElementById('roomsMessage');
const adminName = document.getElementById('adminName');

const roomSearch = document.getElementById('roomSearch');
const typeFilter = document.getElementById('typeFilter');
const statusFilter = document.getElementById('statusFilter');
const minPrice = document.getElementById('minPrice');
const maxPrice = document.getElementById('maxPrice');
const sortBy = document.getElementById('sortBy');
const clearFiltersButton = document.getElementById('clearFiltersButton');

const refreshButton = document.getElementById('refreshButton');
const logoutButton = document.getElementById('logoutButton');
const addRoomButton = document.getElementById('addRoomButton');

const roomModal = document.getElementById('roomModal');
const roomModalTitle = document.getElementById('roomModalTitle');
const closeRoomModal = document.getElementById('closeRoomModal');
const cancelRoomForm = document.getElementById('cancelRoomForm');
const roomForm = document.getElementById('roomForm');
const roomFormError = document.getElementById('roomFormError');

// ----------------------------------------------------
// CHECK ADMIN LOGIN
// ----------------------------------------------------

const token = localStorage.getItem('token');
const userData = localStorage.getItem('user');

if (!token || !userData) {
  window.location.href = '/';
} else {
  try {
    const user = JSON.parse(userData);

    if (user.role !== 'admin') {
      window.location.href = '/student/dashboard.html';
    } else if (user.name) {
      adminName.textContent = user.name;
    }
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }
}

// ----------------------------------------------------
// ROOM ICON PLACEHOLDER (used when a room has no image)
// ----------------------------------------------------

const ROOM_ICON_SVG = `
  <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 21V7l9-4 9 4v14"></path>
    <path d="M9 21v-7h6v7"></path>
    <path d="M3 11h18"></path>
  </svg>
`;

const STATUS_GRADIENTS = {
  available: 'linear-gradient(135deg,#22c55e,#15803d)',
  occupied: 'linear-gradient(135deg,#f87171,#b91c1c)',
  reserved: 'linear-gradient(135deg,#fbbf24,#d97706)',
  maintenance: 'linear-gradient(135deg,#94a3b8,#475569)'
};

// ----------------------------------------------------
// BUILD FILTER QUERY
// ----------------------------------------------------

function buildQuery() {
  const params = new URLSearchParams();

  if (roomSearch.value.trim()) params.set('search', roomSearch.value.trim());
  if (typeFilter.value) params.set('type', typeFilter.value);
  if (statusFilter.value) params.set('status', statusFilter.value);
  if (minPrice.value) params.set('minPrice', minPrice.value);
  if (maxPrice.value) params.set('maxPrice', maxPrice.value);
  if (sortBy.value) params.set('sort', sortBy.value);

  return params.toString();
}

// ----------------------------------------------------
// LOAD ROOMS
// ----------------------------------------------------

let debounceTimer = null;
let currentRooms = [];

async function loadRooms() {
  roomsMessage.textContent = 'Loading rooms...';

  try {
    const query = buildQuery();
    const res = await fetch(`/api/rooms${query ? '?' + query : ''}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Unable to load rooms.');
    }

    currentRooms = Array.isArray(data) ? data : data.value || data.rooms || [];
    renderRooms(currentRooms);
  } catch (error) {
    console.error('Room loading error:', error);
    roomsMessage.textContent = error.message;
    roomsGrid.innerHTML = '';
  }
}

function debouncedLoad() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadRooms, 250);
}

// ----------------------------------------------------
// RENDER ROOM CARDS
// ----------------------------------------------------

function renderRooms(rooms) {
  if (!Array.isArray(rooms) || rooms.length === 0) {
    roomsMessage.textContent = 'No rooms match your filters.';
    roomsGrid.innerHTML = '';
    return;
  }

  roomsMessage.textContent = `${rooms.length} room${rooms.length === 1 ? '' : 's'} found.`;
  roomsGrid.innerHTML = rooms.map(roomCard).join('');
}

function roomCard(room) {
  const status = room.status || 'available';
  const gradient = STATUS_GRADIENTS[status] || STATUS_GRADIENTS.available;
  const firstImage = Array.isArray(room.images) && room.images.length ? room.images[0] : null;

  // If the image URL fails to load, hide it and reveal the placeholder
  // that sits right behind it — avoids juggling escaped HTML inside an
  // inline onerror string.
  const media = firstImage
    ? `<img src="${escapeHtml(firstImage)}" alt="${escapeHtml(room.roomNumber)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
       <div class="room-media-placeholder" style="display:none;background:${gradient}">${ROOM_ICON_SVG}</div>`
    : `<div class="room-media-placeholder" style="background:${gradient}">${ROOM_ICON_SVG}</div>`;

  const amenities = (room.amenities || [])
    .slice(0, 4)
    .map((a) => `<span>${escapeHtml(a)}</span>`)
    .join('');

  return `
    <article class="admin-room-card">
      <div class="room-media">
        ${media}
        <span class="room-media-badge room-status-${escapeHtml(status)}">${escapeHtml(status)}</span>
      </div>

      <div class="room-card-body">
        <div class="room-card-title">
          <span class="room-card-number">${escapeHtml(room.roomNumber)}</span>
          <span class="room-card-type">${escapeHtml(room.type)}</span>
        </div>

        <div class="room-card-location">${escapeHtml(room.building)} · Floor ${escapeHtml(String(room.floor))}</div>

        ${room.description ? `<p class="room-card-desc">${escapeHtml(room.description)}</p>` : ''}

        ${amenities ? `<div class="room-card-amenities">${amenities}</div>` : ''}

        <div class="room-card-stats">
          <div class="room-card-price">$${escapeHtml(String(room.pricePerMonth))}<span> /month</span></div>
          <div class="room-card-occupancy">${escapeHtml(String(room.occupied))}/${escapeHtml(String(room.capacity))} occupied</div>
        </div>
      </div>

      <div class="room-card-actions">
        <button type="button" class="btn-edit-room" onclick="openEditRoom('${room._id}')">Edit</button>
        <button type="button" class="btn-delete-room" onclick="deleteRoom('${room._id}', '${escapeHtml(room.roomNumber)}')">Delete</button>
      </div>
    </article>
  `;
}

// ----------------------------------------------------
// MODAL: OPEN / CLOSE
// ----------------------------------------------------

function openAddRoom() {
  roomForm.reset();
  document.getElementById('roomId').value = '';
  roomModalTitle.textContent = 'Add Room';
  roomFormError.style.display = 'none';
  roomModal.style.display = 'flex';
}

function openEditRoom(roomId) {
  const room = currentRooms.find((r) => r._id === roomId);
  if (!room) return;

  document.getElementById('roomId').value = room._id;
  document.getElementById('roomNumber').value = room.roomNumber || '';
  document.getElementById('building').value = room.building || '';
  document.getElementById('floor').value = room.floor ?? '';
  document.getElementById('type').value = room.type || 'single';
  document.getElementById('capacity').value = room.capacity ?? '';
  document.getElementById('occupied').value = room.occupied ?? 0;
  document.getElementById('pricePerMonth').value = room.pricePerMonth ?? '';
  document.getElementById('status').value = room.status || 'available';
  document.getElementById('amenities').value = (room.amenities || []).join(', ');
  document.getElementById('images').value = (room.images || []).join(', ');
  document.getElementById('description').value = room.description || '';

  roomModalTitle.textContent = `Edit Room — ${room.roomNumber}`;
  roomFormError.style.display = 'none';
  roomModal.style.display = 'flex';
}

function closeRoomModalFn() {
  roomModal.style.display = 'none';
}

// ----------------------------------------------------
// SAVE ROOM (CREATE OR UPDATE)
// ----------------------------------------------------

function splitList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

roomForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  roomFormError.style.display = 'none';

  const roomId = document.getElementById('roomId').value;

  const payload = {
    roomNumber: document.getElementById('roomNumber').value.trim(),
    building: document.getElementById('building').value.trim(),
    floor: Number(document.getElementById('floor').value),
    type: document.getElementById('type').value,
    capacity: Number(document.getElementById('capacity').value),
    occupied: document.getElementById('occupied').value ? Number(document.getElementById('occupied').value) : 0,
    pricePerMonth: Number(document.getElementById('pricePerMonth').value),
    status: document.getElementById('status').value,
    amenities: splitList(document.getElementById('amenities').value),
    images: splitList(document.getElementById('images').value),
    description: document.getElementById('description').value.trim()
  };

  const saveButton = document.getElementById('saveRoomButton');
  saveButton.disabled = true;
  saveButton.textContent = 'Saving...';

  try {
    const res = await fetch(roomId ? `/api/rooms/${roomId}` : '/api/rooms', {
      method: roomId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || (data.errors && data.errors.join(', ')) || 'Unable to save room.');
    }

    closeRoomModalFn();
    await loadRooms();
  } catch (error) {
    console.error('Room save error:', error);
    roomFormError.textContent = error.message;
    roomFormError.style.display = 'block';
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = 'Save Room';
  }
});

// ----------------------------------------------------
// DELETE ROOM
// ----------------------------------------------------

async function deleteRoom(roomId, roomNumber) {
  const confirmed = window.confirm(`Delete room ${roomNumber}? This cannot be undone.`);
  if (!confirmed) return;

  try {
    const res = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Unable to delete room.');
    }

    await loadRooms();
  } catch (error) {
    console.error('Room delete error:', error);
    alert(error.message);
  }
}

// ----------------------------------------------------
// ESCAPE HTML
// ----------------------------------------------------

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = String(value ?? '');
  return div.innerHTML;
}

// ----------------------------------------------------
// EVENT WIRING
// ----------------------------------------------------

roomSearch.addEventListener('input', debouncedLoad);
typeFilter.addEventListener('change', loadRooms);
statusFilter.addEventListener('change', loadRooms);
sortBy.addEventListener('change', loadRooms);
minPrice.addEventListener('input', debouncedLoad);
maxPrice.addEventListener('input', debouncedLoad);

clearFiltersButton.addEventListener('click', () => {
  roomSearch.value = '';
  typeFilter.value = '';
  statusFilter.value = '';
  minPrice.value = '';
  maxPrice.value = '';
  sortBy.value = '';
  loadRooms();
});

refreshButton.addEventListener('click', loadRooms);
addRoomButton.addEventListener('click', openAddRoom);
closeRoomModal.addEventListener('click', closeRoomModalFn);
cancelRoomForm.addEventListener('click', closeRoomModalFn);

roomModal.addEventListener('click', (event) => {
  if (event.target === roomModal) closeRoomModalFn();
});

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
});

// ----------------------------------------------------
// INITIAL LOAD
// ----------------------------------------------------

loadRooms();