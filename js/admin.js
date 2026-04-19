// ============================================
// MALABAR SPICE — Admin Dashboard
// ============================================

const ADMIN = {
    API_URL: 'https://malabar-spice-backend.onrender.com/api',
    isLoggedIn: false,
    currentBooking: null,
    currentMenuItem: null,

    // Returns Authorization header using stored JWT token
    getAuthHeaders() {
        const token = sessionStorage.getItem('adminToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    },

    // Handle 401 responses — token expired or invalid
    handle401() {
        alert('Session expired. Please log in again.');
        this.logout();
    },

    // ---- Initialize ----
    init() {
        console.log('ADMIN.init() called');
        this.setupEventListeners();
        this.checkLogin();
    },

    setupEventListeners() {
        try {
            // Login
            const loginForm = document.getElementById('adminLoginForm');
            console.log('Login form element:', loginForm);
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    console.log('Form submitted');
                    this.handleLogin();
                });
                console.log('Login listener attached');
            } else {
                console.error('Login form not found!');
            }

            // Navigation
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.switchSection(e.target.closest('.nav-btn'));
                });
            });

            // Logout
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    this.logout();
                });
            }

            // Orders
            const bookingSearchPhone = document.getElementById('bookingSearchPhone');
            if (bookingSearchPhone) {
                bookingSearchPhone.addEventListener('input', () => {
                    this.filterBookings();
                });
            }

            const bookingStatusFilter = document.getElementById('bookingStatusFilter');
            if (bookingStatusFilter) {
                bookingStatusFilter.addEventListener('change', () => {
                    this.filterBookings();
                });
            }

            // Time Slots
            const addTimeSlotForm = document.getElementById('addTimeSlotForm');
            if (addTimeSlotForm) {
                addTimeSlotForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addTimeSlot();
                });
            }

            // Menu
            const addMenuItemForm = document.getElementById('addMenuItemForm');
            if (addMenuItemForm) {
                addMenuItemForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addMenuItem();
                });
            }

            // Gallery
            const addGalleryForm = document.getElementById('addGalleryForm');
            if (addGalleryForm) {
                addGalleryForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addGalleryImage();
                });
            }

            // Features
            const addFeatureForm = document.getElementById('addFeatureForm');
            if (addFeatureForm) {
                addFeatureForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addFeature();
                });
            }

            // Modal close buttons
            document.querySelectorAll('.close-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.target.closest('.modal').classList.remove('show');
                });
            });
            
            // Close button for booking modal
            const closeModalBtn = document.getElementById('closeModalBtn');
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', () => {
                    this.closeModal();
                });
            }
            
            // Booking action buttons
            const cancelBookingBtn = document.getElementById('cancelBookingBtn');
            if (cancelBookingBtn) {
                cancelBookingBtn.addEventListener('click', () => {
                    this.cancelBooking();
                });
            }
            
            const markArrivedBtn = document.getElementById('markArrivedBtn');
            if (markArrivedBtn) {
                markArrivedBtn.addEventListener('click', () => {
                    this.markArrived();
                });
            }

            // Edit Menu Modal
            const editMenuItemForm = document.getElementById('editMenuItemForm');
            if (editMenuItemForm) {
                editMenuItemForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.updateMenuItem();
                });
            }

            // Edit Gallery Modal
            const editGalleryForm = document.getElementById('editGalleryForm');
            if (editGalleryForm) {
                editGalleryForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.updateGalleryImage();
                });
            }

            // Edit Feature Modal
            const editFeatureForm = document.getElementById('editFeatureForm');
            if (editFeatureForm) {
                editFeatureForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.updateFeature();
                });
            }

            // Edit Time Slot Modal
            const editTimeSlotForm = document.getElementById('editTimeSlotForm');
            if (editTimeSlotForm) {
                editTimeSlotForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.updateTimeSlot();
                });
            }
        } catch (error) {
            console.error('Error in setupEventListeners:', error);
        }
    },

    checkLogin() {
        const loggedIn = sessionStorage.getItem('adminLoggedIn');
        console.log('checkLogin called, loggedIn status:', loggedIn);
        if (loggedIn === 'true') {
            this.isLoggedIn = true;
            this.showDashboard();
            this.loadAllData();
        }
    },

    async handleLogin() {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        const errorEl = document.getElementById('loginError');

        console.log('handleLogin called');
        console.log('Username entered:', username);

        try {
            const response = await fetch(`${this.API_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (result.success) {
                console.log('Login successful!');
                this.isLoggedIn = true;
                sessionStorage.setItem('adminLoggedIn', 'true');
                sessionStorage.setItem('adminToken', result.token);
                errorEl.classList.remove('show');
                this.showDashboard();
                this.loadAllData();
            } else {
                console.log('Login failed - invalid credentials');
                errorEl.textContent = result.error || 'Invalid username or password';
                errorEl.classList.add('show');
            }
        } catch (err) {
            console.error('Login error:', err);
            errorEl.textContent = 'Login error. Please check your connection.';
            errorEl.classList.add('show');
        }
    },

    logout() {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminToken');
        this.isLoggedIn = false;
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('adminLoginForm').reset();
    },

    showDashboard() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
    },

    switchSection(btn) {
        // Update active button
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active section
        const sectionId = btn.dataset.section + 'Section';
        document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');

        // Load data for section
        const section = btn.dataset.section;
        if (section === 'orders') this.loadBookings();
        if (section === 'timeslots') this.loadTimeSlots();
        if (section === 'menu') this.loadMenuItems();
        if (section === 'gallery') this.loadGalleryImages();
        if (section === 'settings') this.loadFeatures();
    },

    // ---- BOOKINGS ----
    async loadBookings() {
        try {
            const response = await fetch(`${this.API_URL}/admin/bookings`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const bookings = await response.json();
            this.displayBookings(bookings);
        } catch (err) {
            console.error('Error loading bookings:', err);
            document.getElementById('bookingsList').innerHTML = '<p class="error-message">Error loading bookings</p>';
        }
    },

    displayBookings(bookings) {
        const list = document.getElementById('bookingsList');
        
        if (!bookings || bookings.length === 0) {
            list.innerHTML = '<p class="empty-state">No bookings found</p>';
            return;
        }

        list.innerHTML = bookings.map(booking => `
            <div class="booking-card" onclick="ADMIN.openBookingDetails('${booking.id}')">
                <div class="booking-header">
                    <div class="booking-phone">${booking.phone}</div>
                    <div class="booking-status ${booking.arrived ? 'arrived' : 'confirmed'}">
                        ${booking.arrived ? 'Arrived' : 'Confirmed'}
                    </div>
                </div>
                <div class="booking-details-mini">
                    <div class="detail-item">
                        <span class="detail-label">Guest Name</span>
                        <span>${booking.name || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date</span>
                        <span>${booking.date}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Time</span>
                        <span>${booking.time}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Guests</span>
                        <span>${booking.guests}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Tables</span>
                        <span>${booking.tableNums.join(', ')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Zone</span>
                        <span>${booking.zone}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    async openBookingDetails(bookingId) {
        try {
            const response = await fetch(`${this.API_URL}/admin/bookings/${bookingId}`, {
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const booking = await response.json();
            this.currentBooking = booking;

            const details = document.getElementById('bookingDetails');
            details.innerHTML = `
                <div class="detail-row">
                    <span class="detail-key">Booking ID</span>
                    <span>${booking.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-key">Phone</span>
                    <span>${booking.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-key">Guest Name</span>
                    <span>${booking.name || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-key">Date</span>
                    <span>${booking.date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-key">Time</span>
                    <span>${booking.time}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-key">Number of Guests</span>
                    <span>${booking.guests}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-key">Tables</span>
                    <span>${booking.tableNums.join(', ')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-key">Zone</span>
                    <span>${booking.zone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-key">Special Requests</span>
                    <span>${booking.specialReq || 'None'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-key">Status</span>
                    <span>${booking.arrived ? 'Arrived' : 'Confirmed'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-key">Booked At</span>
                    <span>${new Date(booking.bookedAt).toLocaleString()}</span>
                </div>
            `;

            document.getElementById('editBookingModal').classList.add('show');
        } catch (err) {
            console.error('Error:', err);
            alert('Error loading booking details');
        }
    },

    async cancelBooking() {
        if (!this.currentBooking) return;
        
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const response = await fetch(`${this.API_URL}/admin/bookings/${this.currentBooking.id}/cancel`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const result = await response.json();
            
            if (result.success) {
                alert('Booking cancelled successfully');
                this.closeModal();
                this.loadBookings();
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error cancelling booking');
        }
    },

    async markArrived() {
        if (!this.currentBooking) return;

        try {
            const response = await fetch(`${this.API_URL}/admin/bookings/${this.currentBooking.id}/arrived`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const result = await response.json();
            
            if (result.success) {
                alert('Booking marked as arrived');
                this.closeModal();
                this.loadBookings();
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error updating booking');
        }
    },

    filterBookings() {
        const phone = document.getElementById('bookingSearchPhone').value.toLowerCase();
        const status = document.getElementById('bookingStatusFilter').value;

        document.querySelectorAll('.booking-card').forEach(card => {
            const cardPhone = card.querySelector('.booking-phone').textContent.toLowerCase();
            const cardStatus = card.querySelector('.booking-status').className.split(' ')[1];

            const phoneMatch = cardPhone.includes(phone);
            const statusMatch = !status || cardStatus === status;

            card.style.display = phoneMatch && statusMatch ? 'block' : 'none';
        });
    },

    // ---- UTILITY FUNCTIONS ----
    formatTime12Hour(time24) {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        let h = parseInt(hours);
        const m = minutes;
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; // 0 should be 12
        return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
    },

    // ---- TIME SLOTS ----
    async loadTimeSlots() {
        try {
            const response = await fetch(`${this.API_URL}/admin/timeslots`, {
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const slots = await response.json();
            this.displayTimeSlots(slots);
        } catch (err) {
            console.error('Error:', err);
            document.getElementById('timeSlotsList').innerHTML = '<p class="error-message">Error loading time slots</p>';
        }
    },

    displayTimeSlots(slots) {
        const list = document.getElementById('timeSlotsList');
        
        if (!slots || slots.length === 0) {
            list.innerHTML = '<p class="empty-state">No time slots added yet</p>';
            return;
        }

        list.innerHTML = slots.map(slot => `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="list-item-title">${this.formatTime12Hour(slot.startTime)} - ${this.formatTime12Hour(slot.endTime)}</div>
                    <div class="list-item-sub">Capacity: ${slot.capacity} guests</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-primary btn-sm" onclick="ADMIN.openEditTimeSlot('${slot._id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="ADMIN.deleteTimeSlot('${slot._id}')">Delete</button>
                </div>
            </div>
        `).join('');
    },

    async addTimeSlot() {
        const startTime = document.getElementById('slotStartTime').value;
        const endTime = document.getElementById('slotEndTime').value;
        const capacity = document.getElementById('slotCapacity').value;

        if (!startTime || !endTime || !capacity) {
            alert('Please fill all fields');
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}/admin/timeslots`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ startTime, endTime, capacity })
            });
            if (response.status === 401) { this.handle401(); return; }
            const result = await response.json();
            
            if (result.success) {
                alert('Time slot added successfully');
                document.getElementById('addTimeSlotForm').reset();
                this.loadTimeSlots();
            } else {
                alert('Error: ' + (result.error || 'Failed to add time slot'));
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error adding time slot: ' + err.message);
        }
    },

    async openEditTimeSlot(id) {
        try {
            const response = await fetch(`${this.API_URL}/admin/timeslots/${id}`, {
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const slot = await response.json();
            
            document.getElementById('editSlotId').value = slot._id;
            document.getElementById('editSlotStartTime').value = slot.startTime;
            document.getElementById('editSlotEndTime').value = slot.endTime;
            document.getElementById('editSlotCapacity').value = slot.capacity;

            document.getElementById('editTimeSlotModal').classList.add('show');
        } catch (err) {
            console.error('Error:', err);
            alert('Error loading time slot: ' + err.message);
        }
    },

    async updateTimeSlot() {
        const id = document.getElementById('editSlotId').value;
        const startTime = document.getElementById('editSlotStartTime').value;
        const endTime = document.getElementById('editSlotEndTime').value;
        const capacity = document.getElementById('editSlotCapacity').value;

        if (!startTime || !endTime || !capacity) {
            alert('Please fill all fields');
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}/admin/timeslots/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ startTime, endTime, capacity })
            });
            if (response.status === 401) { this.handle401(); return; }
            const result = await response.json();
            
            if (result.success) {
                alert('Time slot updated successfully');
                document.getElementById('editTimeSlotModal').classList.remove('show');
                this.loadTimeSlots();
            } else {
                alert('Error: ' + (result.error || 'Failed to update time slot'));
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error updating time slot: ' + err.message);
        }
    },

    async deleteTimeSlot(slotId) {
        if (!confirm('Delete this time slot?')) return;

        try {
            const response = await fetch(`${this.API_URL}/admin/timeslots/${slotId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const result = await response.json();
            
            if (result.success) {
                this.loadTimeSlots();
            } else {
                alert('Error: ' + (result.error || 'Failed to delete time slot'));
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error deleting time slot: ' + err.message);
        }
    },

    // ---- MENU ----
    async loadMenuItems() {
        try {
            const response = await fetch(`${this.API_URL}/admin/menu`, {
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const items = await response.json();
            this.displayMenuItems(items);
        } catch (err) {
            console.error('Error:', err);
            document.getElementById('menuList').innerHTML = '<p class="error-message">Error loading menu</p>';
        }
    },

    displayMenuItems(items) {
        const list = document.getElementById('menuList');
        
        if (!items || items.length === 0) {
            list.innerHTML = '<p class="empty-state">No menu items added yet</p>';
            return;
        }

        list.innerHTML = items.map(item => `
            <div class="menu-card-admin">
                <div class="menu-card-img-wrap-admin">
                    <img src="${item.image || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='}" alt="${item.name}" class="menu-card-img-admin" onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='">
                    <div class="menu-card-overlay-admin">
                        <button class="btn btn-primary btn-sm" onclick="ADMIN.openEditMenu('${item._id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="ADMIN.deleteMenuItem('${item._id}')">Delete</button>
                    </div>
                </div>
                <div class="menu-card-header">
                    <div class="menu-card-title">${item.name}</div>
                    <div class="menu-card-category">${item.category}</div>
                </div>
                <div class="menu-card-body">
                    <div class="menu-card-price">₹${parseFloat(item.price).toFixed(2)}</div>
                    <div class="menu-card-description">${item.description}</div>
                    <div class="menu-card-meta">
                        ${item.veg ? '<span>🥬 Vegetarian</span>' : '<span>🍖 Non-Veg</span>'}
                        ${item.calories ? `<span>${item.calories} cal</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    },

    async addMenuItem() {
        const name = document.getElementById('menuItemName').value;
        const category = document.getElementById('menuItemCategory').value;
        const price = document.getElementById('menuItemPrice').value;
        const description = document.getElementById('menuItemDescription').value;
        const calories = document.getElementById('menuItemCalories').value;
        const veg = document.getElementById('menuItemVeg').checked;
        const imageFile = document.getElementById('menuItemImage').files[0];

        if (!name || !category || !price) {
            alert('Please fill required fields');
            return;
        }

        let image = '';
        
        // Convert image to base64 if provided
        if (imageFile) {
            image = await this.fileToBase64(imageFile);
        }

        try {
            const response = await fetch(`${this.API_URL}/admin/menu`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ name, category, price, description, calories, veg, image })
            });
            if (response.status === 401) { this.handle401(); return; }
            const result = await response.json();
            
            if (result.success) {
                alert('Menu item added successfully');
                document.getElementById('addMenuItemForm').reset();
                this.loadMenuItems();
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error adding menu item');
        }
    },

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    async openEditMenu(id) {
        try {
            const response = await fetch(`${this.API_URL}/admin/menu/${id}`, {
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const item = await response.json();
            
            this.currentMenuItem = item;
            
            document.getElementById('editMenuItemId').value = item._id;
            document.getElementById('editMenuItemName').value = item.name;
            document.getElementById('editMenuItemCategory').value = item.category;
            document.getElementById('editMenuItemPrice').value = item.price;
            document.getElementById('editMenuItemDescription').value = item.description;
            document.getElementById('editMenuItemCalories').value = item.calories || '';
            document.getElementById('editMenuItemVeg').checked = item.veg;

            document.getElementById('editMenuModal').classList.add('show');
        } catch (err) {
            console.error('Error:', err);
            alert('Error loading menu item');
        }
    },

    async updateMenuItem() {
        const id = document.getElementById('editMenuItemId').value;
        const name = document.getElementById('editMenuItemName').value;
        const category = document.getElementById('editMenuItemCategory').value;
        const price = document.getElementById('editMenuItemPrice').value;
        const description = document.getElementById('editMenuItemDescription').value;
        const calories = document.getElementById('editMenuItemCalories').value;
        const veg = document.getElementById('editMenuItemVeg').checked;
        const imageFile = document.getElementById('editMenuItemImage').files[0];

        let updatedData = { name, category, price, description, calories, veg };
        
        if (imageFile) {
            updatedData.image = await this.fileToBase64(imageFile);
        }

        try {
            const response = await fetch(`${this.API_URL}/admin/menu/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(updatedData)
            });
            if (response.status === 401) { this.handle401(); return; }
            const result = await response.json();
            
            if (result.success) {
                alert('Menu item updated successfully');
                document.getElementById('editMenuModal').classList.remove('show');
                this.loadMenuItems();
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error updating menu item');
        }
    },

    async deleteMenuItem(itemId) {
        if (!confirm('Delete this menu item?')) return;

        try {
            const response = await fetch(`${this.API_URL}/admin/menu/${itemId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const result = await response.json();
            
            if (result.success) {
                this.loadMenuItems();
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error deleting menu item');
        }
    },

    // ---- GALLERY ----
    async loadGalleryImages() {
        try {
            const response = await fetch(`${this.API_URL}/admin/gallery`, {
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const images = await response.json();
            this.displayGalleryImages(images);
        } catch (err) {
            console.error('Error:', err);
            document.getElementById('galleryList').innerHTML = '<p class="error-message">Error loading gallery</p>';
        }
    },

    displayGalleryImages(images) {
        const list = document.getElementById('galleryList');
        
        if (!images || images.length === 0) {
            list.innerHTML = '<p class="empty-state">No gallery images yet</p>';
            return;
        }

        list.innerHTML = images.map(image => `
            <div class="menu-card-admin">
                <div class="menu-card-img-wrap-admin">
                    <img src="${image.image || 'data:image/svg+xml'}" alt="${image.title}" class="menu-card-img-admin" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><rect fill=%22%23f0f0f0%22 width=%22300%22 height=%22300%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22>No Image</text></svg>'">
                    <div class="menu-card-overlay-admin">
                        <button class="btn btn-primary btn-sm" onclick="ADMIN.openEditGallery('${image._id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="ADMIN.deleteGalleryImage('${image._id}')">Delete</button>
                    </div>
                </div>
                <div class="menu-card-body">
                    <div class="menu-card-title">${image.title}</div>
                    <div class="menu-card-description">${image.caption || 'No caption'}</div>
                </div>
            </div>
        `).join('');
    },

    async addGalleryImage() {
        const title = document.getElementById('galleryTitle').value;
        const caption = document.getElementById('galleryCaption').value;
        const imageFile = document.getElementById('galleryImage').files[0];

        if (!title || !imageFile) {
            alert('Please fill required fields');
            return;
        }

        let image = '';
        if (imageFile) {
            image = await this.fileToBase64(imageFile);
        }

        try {
            const response = await fetch(`${this.API_URL}/admin/gallery`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ title, caption, image })
            });
            if (response.status === 401) { this.handle401(); return; }
            const result = await response.json();
            
            if (result.success) {
                alert('Image added to gallery');
                document.getElementById('addGalleryForm').reset();
                this.loadGalleryImages();
            } else {
                alert('Error: ' + (result.error || 'Failed to add image'));
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error adding gallery image: ' + err.message);
        }
    },

    async openEditGallery(id) {
        try {
            const response = await fetch(`${this.API_URL}/admin/gallery/${id}`, {
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const image = await response.json();
            
            document.getElementById('editGalleryId').value = image._id;
            document.getElementById('editGalleryTitle').value = image.title;
            document.getElementById('editGalleryCaption').value = image.caption || '';

            document.getElementById('editGalleryModal').classList.add('show');
        } catch (err) {
            console.error('Error:', err);
            alert('Error loading gallery image');
        }
    },

    async updateGalleryImage() {
        const id = document.getElementById('editGalleryId').value;
        const title = document.getElementById('editGalleryTitle').value;
        const caption = document.getElementById('editGalleryCaption').value;
        const imageFile = document.getElementById('editGalleryImage').files[0];

        if (!title) {
            alert('Please fill required fields');
            return;
        }

        let updatedData = { title, caption };
        
        if (imageFile) {
            updatedData.image = await this.fileToBase64(imageFile);
        }

        try {
            const response = await fetch(`${this.API_URL}/admin/gallery/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(updatedData)
            });
            if (response.status === 401) { this.handle401(); return; }
            const result = await response.json();
            
            if (result.success) {
                alert('Gallery image updated');
                document.getElementById('editGalleryModal').classList.remove('show');
                this.loadGalleryImages();
            } else {
                alert('Error: ' + (result.error || 'Failed to update image'));
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error updating gallery image: ' + err.message);
        }
    },

    async deleteGalleryImage(id) {
        if (!confirm('Delete this gallery image?')) return;

        try {
            const response = await fetch(`${this.API_URL}/admin/gallery/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const result = await response.json();
            
            if (result.success) {
                this.loadGalleryImages();
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error deleting gallery image');
        }
    },

    // ---- FEATURES ----
    async loadFeatures() {
        try {
            const response = await fetch(`${this.API_URL}/admin/features`, {
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const features = await response.json();
            this.displayFeatures(features);
        } catch (err) {
            console.error('Error:', err);
            document.getElementById('featuresList').innerHTML = '<p class="error-message">Error loading features</p>';
        }
    },

    displayFeatures(features) {
        const list = document.getElementById('featuresList');
        
        if (!features || features.length === 0) {
            list.innerHTML = '<p class="empty-state">No features added yet</p>';
            return;
        }

        list.innerHTML = features.map(feature => `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="list-item-title">${feature.title}</div>
                    <div class="list-item-sub">${feature.description}</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-primary btn-sm" onclick="ADMIN.openEditFeature('${feature._id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="ADMIN.deleteFeature('${feature._id}')">Delete</button>
                </div>
            </div>
        `).join('');
    },

    async addFeature() {
        const title = document.getElementById('featureTitle').value;
        const description = document.getElementById('featureDescription').value;
        const iconFile = document.getElementById('featureIcon').files[0];

        if (!title || !description) {
            alert('Please fill required fields');
            return;
        }

        let icon = '';
        if (iconFile) {
            icon = await this.fileToBase64(iconFile);
        }

        try {
            const response = await fetch(`${this.API_URL}/admin/features`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ title, description, icon })
            });
            if (response.status === 401) { this.handle401(); return; }
            const result = await response.json();
            
            if (result.success) {
                alert('Feature added successfully');
                document.getElementById('addFeatureForm').reset();
                this.loadFeatures();
            } else {
                alert('Error: ' + (result.error || 'Failed to add feature'));
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error adding feature: ' + err.message);
        }
    },

    async openEditFeature(id) {
        try {
            const response = await fetch(`${this.API_URL}/admin/features/${id}`, {
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const feature = await response.json();
            
            document.getElementById('editFeatureId').value = feature._id;
            document.getElementById('editFeatureTitle').value = feature.title;
            document.getElementById('editFeatureDescription').value = feature.description;

            document.getElementById('editFeatureModal').classList.add('show');
        } catch (err) {
            console.error('Error:', err);
            alert('Error loading feature');
        }
    },

    async updateFeature() {
        const id = document.getElementById('editFeatureId').value;
        const title = document.getElementById('editFeatureTitle').value;
        const description = document.getElementById('editFeatureDescription').value;
        if (!title || !description) {
            alert('Please fill required fields');
            return;
        }

        let updatedData = { title, description };
        
        if (iconFile) {
            updatedData.icon = await this.fileToBase64(iconFile);
        }

        try {
            const response = await fetch(`${this.API_URL}/admin/features/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(updatedData)
            });
            if (response.status === 401) { this.handle401(); return; }
            const result = await response.json();
            
            if (result.success) {
                alert('Feature updated');
                document.getElementById('editFeatureModal').classList.remove('show');
                this.loadFeatures();
            } else {
                alert('Error: ' + (result.error || 'Failed to update feature'));
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error updating feature: ' + err.message);
        }
    },

    async deleteFeature(id) {
        if (!confirm('Delete this feature?')) return;

        try {
            const response = await fetch(`${this.API_URL}/admin/features/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            if (response.status === 401) { this.handle401(); return; }
            const result = await response.json();
            
            if (result.success) {
                this.loadFeatures();
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error deleting feature');
        }
    },

    // ---- MODALS ----
    closeModal() {
        document.getElementById('editBookingModal').classList.remove('show');
        document.getElementById('editMenuModal').classList.remove('show');
        document.getElementById('editGalleryModal').classList.remove('show');
        document.getElementById('editFeatureModal').classList.remove('show');
        document.getElementById('editTimeSlotModal').classList.remove('show');
    },

    // ---- LOAD ALL DATA ----
    loadAllData() {
        this.loadBookings();
        this.loadTimeSlots();
        this.loadMenuItems();
        this.loadGalleryImages();
        this.loadFeatures();
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    ADMIN.init();
});
