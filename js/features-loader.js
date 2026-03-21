// ============================================
// MALABAR SPICE - Features Loader
// Loads features dynamically from API
// ============================================

const FEATURES_LOADER = {
    API_URL: 'https://malabar-spice-backend.onrender.com/api',
    allFeatures: [],

    // Initialize and load features
    async init() {
        try {
            await this.loadFeatures();
            this.renderFeatures();
        } catch (err) {
            console.error('Error initializing features:', err);
        }
    },

    // Fetch features from API
    async loadFeatures() {
        try {
            const response = await fetch(`${this.API_URL}/admin/features`);
            if (!response.ok) throw new Error('Failed to fetch features');
            this.allFeatures = await response.json();
            console.log('Features loaded:', this.allFeatures.length);
        } catch (err) {
            console.error('Error loading features:', err);
            // Use static features as fallback
            this.loadStaticFeatures();
        }
    },

    // Static features as fallback
    loadStaticFeatures() {
        this.allFeatures = [
            {
                _id: '1',
                title: 'Online Reservations',
                description: 'Book your table online anytime, anywhere. Secure and instant confirmation.',
                icon: '📅'
            },
            {
                _id: '2',
                title: 'Premium Quality Ingredients',
                description: 'We source the finest spices and ingredients from Kerala to ensure authentic taste.',
                icon: '🌶️'
            },
            {
                _id: '3',
                title: 'Expert Chefs',
                description: 'Our master chefs bring decades of culinary expertise to every dish.',
                icon: '👨‍🍳'
            },
            {
                _id: '4',
                title: 'Cozy Ambiance',
                description: 'Enjoy Kerala-inspired traditional décor with modern comfort.',
                icon: '✨'
            }
        ];
    },

    // Render features
    renderFeatures() {
        const container = document.getElementById('featuresContainer');
        if (!container) return;

        if (!this.allFeatures || this.allFeatures.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">No features available</p>';
            return;
        }

        container.innerHTML = this.allFeatures.map(feature => `
            <div class="feature-card fade-up">
                <div class="feature-icon">${feature.icon || '⭐'}</div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
        `).join('');

        // Re-animate
        if (typeof initScrollAnimations === 'function') {
            initScrollAnimations();
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    FEATURES_LOADER.init();
});
