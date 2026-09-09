const els = {
  search: document.getElementById('search'),
  type: document.getElementById('type'),
  status: document.getElementById('status'),
  sort: document.getElementById('sort'),
  minPrice: document.getElementById('minPrice'),
  maxPrice: document.getElementById('maxPrice'),
  clearFilters: document.getElementById('clearFilters'),
  grid: document.getElementById('grid'),
  resultCount: document.getElementById('resultCount'),
  emptyState: document.getElementById('emptyState'),
};

let debounceTimer = null;

function buildQuery() {
  const params = new URLSearchParams();
  if (els.search.value.trim()) params.set('search', els.search.value.trim());
  if (els.type.value) params.set('type', els.type.value);
  if (els.status.value) params.set('status', els.status.value);
  if (els.sort.value) params.set('sort', els.sort.value);
  if (els.minPrice.value) params.set('minPrice', els.minPrice.value);
  if (els.maxPrice.value) params.set('maxPrice', els.maxPrice.value);
  return params.toString();
}

function roomCard(room) {
  const amenities = (room.amenities || [])
    .slice(0, 4)
    .map((a) => `<span class="amenity">${escapeHtml(a)}</span>`)
    .join('');

  return `
    <article class="room-card">
      <div class="room-head">
        <div>
          <div class="room-number">${escapeHtml(room.roomNumber)}</div>
          <div class="room-building">${escapeHtml(room.building)} · Floor ${room.floor}</div>
        </div>
        <span class="status-tag status-${room.status}">${room.status}</span>
      </div>

      <div class="room-type">${escapeHtml(room.type)} room</div>

      ${room.description ? `<p class="room-desc">${escapeHtml(room.description)}</p>` : ''}

      ${amenities ? `<div class="room-amenities">${amenities}</div>` : ''}

      <div class="room-foot">
        <div class="room-price">$${room.pricePerMonth}<span> /month</span></div>
        <div class="room-occupancy">${room.occupied}/${room.capacity} occupied</div>
      </div>
    </article>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadRooms() {
  try {
    const query = buildQuery();
    const res = await fetch(`/api/rooms${query ? '?' + query : ''}`);
    const data = await res.json();
    const rooms = data.rooms || [];

    els.resultCount.textContent = `${rooms.length} room${rooms.length === 1 ? '' : 's'} found`;
    els.grid.innerHTML = rooms.map(roomCard).join('');
    els.emptyState.hidden = rooms.length !== 0;
  } catch (err) {
    els.resultCount.textContent = '';
    els.emptyState.textContent = 'Could not load rooms. Please try again shortly.';
    els.emptyState.hidden = false;
    console.error(err);
  }
}

function debouncedLoad() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadRooms, 250);
}

els.search.addEventListener('input', debouncedLoad);
els.type.addEventListener('change', loadRooms);
els.status.addEventListener('change', loadRooms);
els.sort.addEventListener('change', loadRooms);
els.minPrice.addEventListener('input', debouncedLoad);
els.maxPrice.addEventListener('input', debouncedLoad);

els.clearFilters.addEventListener('click', () => {
  els.search.value = '';
  els.type.value = '';
  els.status.value = '';
  els.sort.value = '';
  els.minPrice.value = '';
  els.maxPrice.value = '';
  loadRooms();
});

loadRooms();