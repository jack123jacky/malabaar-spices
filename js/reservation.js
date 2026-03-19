/* ============================================================
   MALABAR SPICE — Reservation System Logic
   reservation.js
   ============================================================ */

/* ---- 1. DATA DEFINITIONS ---- */

const TIME_SLOTS = [
    { id: 'ts1', label: '12:00 PM – 2:00 PM', start: '12:00' },
    { id: 'ts2', label: '2:00 PM – 4:00 PM', start: '14:00' },
    { id: 'ts3', label: '4:30 PM – 6:30 PM', start: '16:30' },
    { id: 'ts4', label: '6:00 PM – 8:00 PM', start: '18:00' },
    { id: 'ts5', label: '7:30 PM – 9:30 PM', start: '19:30' },
    { id: 'ts6', label: '8:00 PM – 10:00 PM', start: '20:00' },
];

/* Table definitions:
   id, number, seats, shape (round|rect|large), zone, zoneLabel */
const TABLES = [
    // Window zone (col 0)
    { id: 't1', num: 1, seats: 2, shape: 'round', zone: 'window', zoneLabel: '🪟 Window' },
    { id: 't2', num: 2, seats: 2, shape: 'round', zone: 'window', zoneLabel: '🪟 Window' },
    { id: 't3', num: 3, seats: 4, shape: 'rect', zone: 'window', zoneLabel: '🪟 Window' },

    // Indoor zone A (col 1)
    { id: 't4', num: 4, seats: 4, shape: 'rect', zone: 'indoorA', zoneLabel: '🏠 Indoor – A' },
    { id: 't5', num: 5, seats: 4, shape: 'rect', zone: 'indoorA', zoneLabel: '🏠 Indoor – A' },
    { id: 't6', num: 6, seats: 2, shape: 'round', zone: 'indoorA', zoneLabel: '🏠 Indoor – A' },

    // Indoor zone B (col 2)
    { id: 't7', num: 7, seats: 6, shape: 'large', zone: 'indoorB', zoneLabel: '🏠 Indoor – B' },
    { id: 't8', num: 8, seats: 4, shape: 'rect', zone: 'indoorB', zoneLabel: '🏠 Indoor – B' },
    { id: 't9', num: 9, seats: 2, shape: 'round', zone: 'indoorB', zoneLabel: '🏠 Indoor – B' },

    // Outdoor / Garden (col 3)
    { id: 't10', num: 10, seats: 4, shape: 'rect', zone: 'outdoor', zoneLabel: '🌿 Outdoor / Garden' },
    { id: 't11', num: 11, seats: 6, shape: 'large', zone: 'outdoor', zoneLabel: '🌿 Outdoor / Garden' },
    { id: 't12', num: 12, seats: 2, shape: 'round', zone: 'outdoor', zoneLabel: '🌿 Outdoor / Garden' },
];

/* Simulated pre-existing reservations (date → slotId → [tableId]) */
const EXISTING_BOOKINGS = {};

/* Grace-period tracking: bookingKey → timer references */
const GRACE_TIMERS = {};

/* ---- 2. STATE ---- */
let selectedDate = '';
let selectedSlot = null;       // TIME_SLOTS entry
let selectedTables = [];         // Array of TABLES entries (multi-select)

/* ---- 3. INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
    setMinDate();
    renderFloorPlan();
    updateSummary();
});

function setMinDate() {
    const dateInput = document.getElementById('resDate');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
}

/* ---- 4. DATE CHANGE ---- */
function onDateChange() {
    selectedDate = document.getElementById('resDate').value;
    selectedSlot = null;
    selectedTables = [];
    renderTimeSlots();
    renderFloorPlan();
    hideTableInfoBar();
    updateSummary();
}

/* ---- 5. TIME SLOTS ---- */
function renderTimeSlots() {
    const grid = document.getElementById('timeslotGrid');
    grid.innerHTML = '';

    if (!selectedDate) return;

    TIME_SLOTS.forEach(slot => {
        const booked = getBookingsForSlot(selectedDate, slot.id);
        const isFull = booked.length >= TABLES.length;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'timeslot-btn' + (isFull ? ' ts-full' : '');
        btn.id = 'slot-' + slot.id;
        btn.setAttribute('aria-label', slot.label);
        btn.disabled = isFull;

        const dot = document.createElement('span');
        dot.className = 'ts-dot' + (isFull ? ' full' : '');
        btn.appendChild(dot);
        btn.appendChild(document.createTextNode(slot.label));

        if (!isFull) {
            btn.addEventListener('click', () => selectSlot(slot));
        }
        grid.appendChild(btn);
    });
}

function selectSlot(slot) {
    selectedSlot = slot;
    selectedTables = [];

    // UI update
    document.querySelectorAll('.timeslot-btn').forEach(b => b.classList.remove('ts-selected'));
    const btn = document.getElementById('slot-' + slot.id);
    if (btn) btn.classList.add('ts-selected');

    renderFloorPlan();
    hideTableInfoBar();
    updateSummary();
}

/* ---- 6. FLOOR PLAN ---- */
const ZONES = [
    { id: 'window', label: '🪟 Window' },
    { id: 'indoorA', label: '🏠 Indoor – A' },
    { id: 'indoorB', label: '🏠 Indoor – B' },
    { id: 'outdoor', label: '🌿 Outdoor / Garden' },
];

function renderFloorPlan() {
    const plan = document.getElementById('floorPlan');
    plan.innerHTML = '';

    ZONES.forEach(zone => {
        const zoneTables = TABLES.filter(t => t.zone === zone.id);
        const col = document.createElement('div');
        col.className = 'floor-zone';

        const title = document.createElement('div');
        title.className = 'floor-zone-title';
        title.textContent = zone.label;
        col.appendChild(title);

        const list = document.createElement('div');
        list.className = 'tables-in-zone';

        zoneTables.forEach(table => {
            list.appendChild(buildTableEl(table));
        });

        col.appendChild(list);
        plan.appendChild(col);
    });
}

function buildTableEl(table) {
    const status = getTableStatus(table.id);
    const isAvail = status === 'available';

    const wrap = document.createElement('div');
    wrap.className = `table-shape table-${table.shape} table-${isSelected(table) ? 'selected' : status}`;
    wrap.id = 'table-' + table.id;
    wrap.setAttribute('tabindex', isAvail ? '0' : '-1');
    wrap.setAttribute('aria-label', `Table ${table.num}, ${table.seats} seats, ${table.zoneLabel}, ${status}`);
    wrap.setAttribute('role', 'button');

    // Number & Seats label
    const numEl = document.createElement('span');
    numEl.className = 'table-num';
    numEl.textContent = table.num;

    const seatsEl = document.createElement('span');
    seatsEl.className = 'table-seats';
    seatsEl.textContent = table.seats + ' seats';

    wrap.appendChild(numEl);
    wrap.appendChild(seatsEl);

    // Decorative chairs
    addChairs(wrap, table);

    if (isAvail) {
        wrap.addEventListener('click', () => selectTable(table));
        wrap.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') selectTable(table); });
    }

    return wrap;
}

function addChairs(wrap, table) {
    const shape = table.shape;
    if (shape === 'round') {
        // 1 chair top, 1 bottom
        ['top', 'bottom'].forEach(pos => {
            const row = document.createElement('div');
            row.className = 'chair-row ' + pos;
            const c = document.createElement('div'); c.className = 'chair';
            row.appendChild(c);
            wrap.appendChild(row);
        });
    } else {
        // 2 chairs top, 2 bottom
        ['top', 'bottom'].forEach(pos => {
            const row = document.createElement('div');
            row.className = 'chair-row ' + pos;
            for (let i = 0; i < 2; i++) {
                const c = document.createElement('div'); c.className = 'chair';
                row.appendChild(c);
            }
            wrap.appendChild(row);
        });
    }
}

/* ---- 7. TABLE SELECTION (multi) ---- */
function selectTable(table) {
    if (!selectedDate) {
        flashMsg('Please select a date first.', 'warn');
        return;
    }
    if (!selectedSlot) {
        flashMsg('Please select a time slot first.', 'warn');
        return;
    }

    const idx = selectedTables.findIndex(t => t.id === table.id);
    if (idx === -1) {
        // Add to selection
        selectedTables.push(table);
    } else {
        // Deselect — toggle off
        selectedTables.splice(idx, 1);
    }

    renderFloorPlan();
    if (selectedTables.length > 0) {
        showTableInfoBar();
        document.getElementById('step3').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        hideTableInfoBar();
    }
    updateSummary();
}

function isSelected(table) {
    return selectedTables.some(t => t.id === table.id);
}

function showTableInfoBar() {
    const bar = document.getElementById('tableInfoBar');
    bar.style.display = 'flex';

    const nums = selectedTables.map(t => 'T' + t.num).join(', ');
    const totalSeats = selectedTables.reduce((sum, t) => sum + t.seats, 0);
    const zones = [...new Set(selectedTables.map(t => t.zoneLabel))].join(' · ');

    document.getElementById('tibNum').textContent = nums || '—';
    document.getElementById('tibSeats').textContent = totalSeats + ' seats total';
    document.getElementById('tibZone').textContent = zones || '—';
    const s = document.getElementById('tibStatus');
    s.textContent = selectedTables.length + ' table' + (selectedTables.length > 1 ? 's' : '') + ' selected ✓';
    s.className = 'tib-value tib-status available';
}

function hideTableInfoBar() {
    document.getElementById('tableInfoBar').style.display = 'none';
}

/* ---- 8. BOOKING STATUS ---- */
function getBookingsForSlot(date, slotId) {
    return (EXISTING_BOOKINGS[date] && EXISTING_BOOKINGS[date][slotId]) || [];
}

function isTableBooked(tableId, date, slotId) {
    const booked = getBookingsForSlot(date, slotId);
    return booked.includes(tableId);
}

function getTableStatus(tableId) {
    if (!selectedDate || !selectedSlot) return 'available';
    if (isTableBooked(tableId, selectedDate, selectedSlot.id)) {
        // If booked in the NEXT slot treat as 'soon'
        return 'reserved';
    }
    // Check if booked in the adjacent previous slot (shows soon)
    const slotIdx = TIME_SLOTS.findIndex(s => s.id === selectedSlot.id);
    if (slotIdx > 0) {
        const prevSlot = TIME_SLOTS[slotIdx - 1];
        if (isTableBooked(tableId, selectedDate, prevSlot.id)) return 'soon';
    }
    return 'available';
}

/* ---- 9. BOOKING FORM SUBMIT ---- */
async function handleReservation(e) {
    e.preventDefault();

    if (selectedTables.length === 0) {
        flashMsg('Please select at least one table from the floor plan.', 'warn'); return;
    }
    if (!selectedSlot) {
        flashMsg('Please choose a time slot.', 'warn'); return;
    }
    if (!selectedDate) {
        flashMsg('Please pick a reservation date.', 'warn'); return;
    }

    // Double-booking check for ALL selected tables
    const alreadyBooked = selectedTables.filter(t => isTableBooked(t.id, selectedDate, selectedSlot.id));
    if (alreadyBooked.length > 0) {
        flashMsg(`Table(s) ${alreadyBooked.map(t => 'T' + t.num).join(', ')} are no longer available. Please reselect.`, 'error');
        selectedTables = selectedTables.filter(t => !alreadyBooked.some(b => b.id === t.id));
        renderFloorPlan();
        showTableInfoBar();
        return;
    }

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const guests = document.getElementById('guests').value;
    const specialReq = document.getElementById('specialReq').value.trim();

    // Save bookings for all selected tables
    if (!EXISTING_BOOKINGS[selectedDate]) EXISTING_BOOKINGS[selectedDate] = {};
    if (!EXISTING_BOOKINGS[selectedDate][selectedSlot.id]) EXISTING_BOOKINGS[selectedDate][selectedSlot.id] = [];

    selectedTables.forEach(table => {
        EXISTING_BOOKINGS[selectedDate][selectedSlot.id].push(table.id);
        const bookingKey = `${selectedDate}_${selectedSlot.id}_${table.id}`;
        startGracePeriod(bookingKey, selectedDate, selectedSlot.id, table.id);
    });

    // ---- Save to user account ----
    const slotStart = getSlotStartDate(selectedDate, selectedSlot.id);
    const tableNums = selectedTables.map(t => 'T' + t.num);
    const zones = [...new Set(selectedTables.map(t => t.zoneLabel))].join(', ');

    if (typeof MS !== 'undefined' && MS.isLoggedIn()) {
        MS.updateName(firstName + ' ' + lastName);
        await MS.saveBooking({
            date: new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            time: selectedSlot.label,
            tableNums,
            zone: zones,
            guests,
            specialReq,
            sessionStart: slotStart.getTime(),
            sessionEnd: slotStart.getTime() + 2 * 60 * 60 * 1000
        });
    }

    // Show success
    showSuccess(firstName, lastName, phone, guests);
}

/* ---- 10. GRACE PERIOD ---- */
// Returns a Date object for the slot start time on the given date string
function getSlotStartDate(date, slotId) {
    const slot = TIME_SLOTS.find(s => s.id === slotId);
    if (!slot) return new Date();
    const [hh, mm] = slot.start.split(':').map(Number);
    const d = new Date(date + 'T00:00:00'); // midnight on reservation date
    d.setHours(hh, mm, 0, 0);
    return d;
}

function startGracePeriod(key, date, slotId, tableId) {
    const GRACE_MS = 15 * 60 * 1000; // 15 minutes
    const slotStart = getSlotStartDate(date, slotId);
    const now = Date.now();
    const delayToSlot = Math.max(0, slotStart.getTime() - now); // wait until slot opens

    if (GRACE_TIMERS[key]) clearTimeout(GRACE_TIMERS[key]);

    // Wait until the slot start time, THEN start the 15-min grace window
    GRACE_TIMERS[key] = setTimeout(() => {
        GRACE_TIMERS[key] = setTimeout(() => {
            const bookings = EXISTING_BOOKINGS[date] && EXISTING_BOOKINGS[date][slotId];
            if (bookings) {
                const idx = bookings.indexOf(tableId);
                if (idx !== -1) {
                    bookings.splice(idx, 1);
                    console.log(`Grace period expired: Table ${tableId} released.`);
                }
            }
            delete GRACE_TIMERS[key];
            renderFloorPlan();
            renderTimeSlots();
        }, GRACE_MS);
    }, delayToSlot);
}

/* ---- 11. SUCCESS UI ---- */
function showSuccess(firstName, lastName, phone, guests) {
    document.getElementById('reserveForm').style.display = 'none';
    const successCard = document.getElementById('formSuccess');
    successCard.style.display = 'block';

    const dateFormatted = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const tableNums = selectedTables.map(t => 'T' + t.num).join(', ');
    const totalSeats = selectedTables.reduce((sum, t) => sum + t.seats, 0);
    const zones = [...new Set(selectedTables.map(t => t.zoneLabel))].join(' · ');

    const loggedIn = typeof MS !== 'undefined' && MS.isLoggedIn();
    document.getElementById('successMsg').innerHTML =
        `<strong>${firstName} ${lastName}</strong>, your 
        <strong>${selectedTables.length} table${selectedTables.length > 1 ? 's' : ''} (${tableNums})</strong> 
        with <strong>${totalSeats} seats</strong> in <strong>${zones}</strong> 
        are reserved for <strong>${selectedSlot.label}</strong> on <strong>${dateFormatted}</strong>.<br><br>
        Please arrive within 15 minutes of your slot start time.<br><br>
        ${loggedIn ? '✅ Booking saved to your account. <a href="account.html" style="color:var(--gold)">View in My Account →</a>' : ''}`;

    // Show arrived button if login is active
    const arrivedWrap = document.getElementById('arrivedWrap');
    if (arrivedWrap) arrivedWrap.style.display = 'block';

    // Countdown: first count down to slot start, then count the 15-min grace period
    const timerEl = document.getElementById('successTimer');
    const slotStart = getSlotStartDate(selectedDate, selectedSlot.id);

    const tick = () => {
        const now = Date.now();
        const diff = slotStart.getTime() - now; // ms until slot opens

        if (diff > 0) {
            // Slot hasn't started yet — show countdown to reservation time
            const totalSec = Math.ceil(diff / 1000);
            const h = Math.floor(totalSec / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            const s = totalSec % 60;
            const parts = [];
            if (h > 0) parts.push(h + 'h');
            if (m > 0 || h > 0) parts.push(m + 'm');
            parts.push(String(s).padStart(2, '0') + 's');
            timerEl.textContent = `🕐 Reservation begins in: ${parts.join(' ')} — grace period starts then.`;
            setTimeout(tick, 1000);
        } else {
            // Slot has started — count the 15-minute grace window
            const graceEnd = slotStart.getTime() + 15 * 60 * 1000;
            const graceLeft = Math.max(0, Math.ceil((graceEnd - now) / 1000));
            if (graceLeft > 0) {
                const gm = Math.floor(graceLeft / 60);
                const gs = graceLeft % 60;
                timerEl.textContent = `⏱ Grace period: ${gm}:${String(gs).padStart(2, '0')} remaining — please arrive soon.`;
                setTimeout(tick, 1000);
            } else {
                timerEl.textContent = '⚠ Grace period has ended. Please contact us to confirm your booking.';
            }
        }
    };
    tick();

    // Refresh floor plan and slots to reflect new booking
    renderFloorPlan();
    renderTimeSlots();
}

/* ---- 12. RESET ---- */
function resetReservation() {
    selectedDate = '';
    selectedSlot = null;
    selectedTables = [];

    document.getElementById('resDate').value = '';
    document.getElementById('timeslotGrid').innerHTML = '';
    document.getElementById('reserveForm').reset();
    document.getElementById('reserveForm').style.display = 'block';
    document.getElementById('formSuccess').style.display = 'none';

    renderFloorPlan();
    hideTableInfoBar();
    updateSummary();

    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
}

/* ---- 13. SUMMARY CARD ---- */
function updateSummary() {
    const dateFormatted = selectedDate
        ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—';

    const tableStr = selectedTables.length > 0
        ? selectedTables.map(t => 'T' + t.num).join(', ') + ' (' + selectedTables.reduce((s, t) => s + t.seats, 0) + ' seats)'
        : '—';
    const zoneStr = selectedTables.length > 0
        ? [...new Set(selectedTables.map(t => t.zoneLabel))].join(' · ')
        : '—';

    document.getElementById('sumDate').textContent = dateFormatted;
    document.getElementById('sumTime').textContent = selectedSlot ? selectedSlot.label : '—';
    document.getElementById('sumTable').textContent = tableStr;
    document.getElementById('sumZone').textContent = zoneStr;
}

/* ---- 14. FLASH MESSAGE ---- */
function flashMsg(msg, type = 'warn') {
    const existing = document.getElementById('flashToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'flashToast';
    toast.style.cssText = `
    position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
    background: ${type === 'error' ? '#c62828' : '#b8922a'};
    color: #fff; padding: 14px 28px; border-radius: 8px;
    font-family: 'Lato', sans-serif; font-size: 14px; font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25); z-index: 9999;
    animation: fadeUp 0.3s ease both;
    white-space: nowrap;
  `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3500);
}
