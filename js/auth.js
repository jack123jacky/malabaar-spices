// ============================================
// MALABAR SPICE — Auth & Account Manager
// Syncs with MongoDB backend, uses localStorage only for auth persistence
// ============================================

const MS = {
    KEYS: {
        USER_PHONE: 'ms_user_phone'
    },
    API_URL: 'https://malabar-spice-backend.onrender.com/api',

    _uuid() {
        return 'bk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    },

    // ---- Auth ----
    getCurrentUserPhone() {
        return localStorage.getItem(this.KEYS.USER_PHONE);
    },
    isLoggedIn() {
        return !!this.getCurrentUserPhone();
    },
    async fetchUser() {
        const phone = this.getCurrentUserPhone();
        if (!phone) return null;
        try {
            const res = await fetch(`${this.API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            return { ...data.user, bookings: data.bookings || [] };
        } catch (e) {
            console.error('Fetch user failed', e);
            return null;
        }
    },
    async login(phone, name) {
        try {
            const res = await fetch(`${this.API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, name })
            });
            const data = await res.json();
            
            // Reconstruct user object with nested bookings for sync UI operations
            const userObj = { ...data.user, bookings: data.bookings || [] };
            localStorage.setItem(this.KEYS.USER_PHONE, userObj.phone);
            return userObj;
        } catch (e) {
            console.error('Login failed', e);
            return null;
        }
    },
    async updateName(name) {
        const phone = this.getCurrentUserPhone();
        if (!phone) return;
        try {
            await fetch(`${this.API_URL}/user/name`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, name })
            });
        } catch (e) { console.error('Failed to update name', e); }
    },
    logout() {
        localStorage.removeItem(this.KEYS.USER_PHONE);
    },

    // ---- Bookings ----
    async saveBooking(bookingData) {
        const phone = this.getCurrentUserPhone();
        if (!phone) return null;

        const booking = {
            id: this._uuid(),
            phone: phone,
            date: bookingData.date,
            time: bookingData.time,
            tableNums: bookingData.tableNums || [],
            zone: bookingData.zone || '',
            guests: bookingData.guests || '1',
            specialReq: bookingData.specialReq || '',
            bookedAt: Date.now(),
            sessionStart: bookingData.sessionStart,
            sessionEnd: bookingData.sessionEnd,
            graceEnd: bookingData.sessionStart + (15 * 60 * 1000), // +15 min
            arrived: false,
            reviewed: false,
            review: null
        };

        try {
            await fetch(`${this.API_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(booking)
            });
        } catch (e) { console.error('Failed to save booking to DB', e); }
        
        return booking;
    },
    async getBookings() {
        const user = await this.fetchUser();
        return user ? user.bookings : [];
    },
    async getActiveBooking() {
        const bookings = await this.getBookings();
        const now = Date.now();
        return bookings.find(b =>
            b.sessionStart <= now + 15 * 60 * 1000 && b.sessionEnd > now - 60000
        ) || null;
    },
    async markArrived(bookingId) {
        try {
            await fetch(`${this.API_URL}/bookings/arrived`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId })
            });
        } catch (e) { console.error('Failed to check in', e); return false; }
        
        return true;
    },
    async canReview(bookingId) {
        const bookings = await this.getBookings();
        const bk = bookings.find(b => b.id === bookingId);
        return bk && bk.arrived && !bk.reviewed;
    },

    // ---- Reviews ----
    async saveReview(bookingId, rating, comment) {
        const user = await this.fetchUser();
        if (!user) return false;
        
        const bk = user.bookings.find(b => b.id === bookingId);
        if (!bk || !bk.arrived || bk.reviewed) return false;

        const review = {
            id: this._uuid(),
            bookingId,
            phone: user.phone,
            name: user.name || 'Guest',
            rating,
            comment,
            date: bk.date,
            postedAt: Date.now()
        };

        try {
            await fetch(`${this.API_URL}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(review)
            });
            return true;
        } catch (e) { 
            console.error('Failed to submit review', e); 
            return false;
        }
    },
    async getAllReviews() {
        try {
            const res = await fetch(`${this.API_URL}/reviews`);
            return await res.json();
        } catch(e) {
            console.error('Failed to fetch reviews', e);
            return [];
        }
    }
};
