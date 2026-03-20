// ============================================
// MALABAR SPICE - Menu Loader
// Loads menu items dynamically from API
// ============================================

const MENU_LOADER = {
    API_URL: 'https://malabaar-spices-wbql.vercel.app/api',
    allMenuItems: [],

    // Category mapping for filters
    categoryMap: {
        'Appetizers': 'appetizer',
        'Curries': 'main',
        'Breads': 'main',
        'Rice Dishes': 'main',
        'Seafood': 'main',
        'Desserts': 'dessert',
        'Beverages': 'beverage'
    },

    // Initialize and load menu
    async init() {
        try {
            await this.loadMenuItems();
            this.renderMenu();
            // Re-initialize animations after rendering
            if (typeof initScrollAnimations === 'function') {
                initScrollAnimations();
            }
            // Re-attach filter listener
            this.attachFilterListener();
        } catch (err) {
            console.error('Error initializing menu:', err);
            this.showErrorMessage();
        }
    },

    // Fetch menu items from API
    async loadMenuItems() {
        try {
            const response = await fetch(`${this.API_URL}/admin/menu`);
            if (!response.ok) throw new Error('Failed to fetch menu items');
            this.allMenuItems = await response.json();
            console.log('Menu items loaded:', this.allMenuItems.length);
        } catch (err) {
            console.error('Error loading menu items:', err);
            // If API fails, use static menu as fallback
            this.loadStaticMenu();
        }
    },

    // Static menu as fallback
    loadStaticMenu() {
        this.allMenuItems = [
            {
                _id: '1',
                name: 'Unnakkaya',
                category: 'Appetizers',
                price: 180,
                description: 'Sweetened plantain fritters stuffed with coconut and sugar.',
                veg: true,
                image: ''
            },
            {
                _id: '2',
                name: 'Kerala Sadya',
                category: 'Rice Dishes',
                price: 380,
                description: 'Traditional festive feast served on banana leaf.',
                veg: true,
                image: ''
            },
            {
                _id: '3',
                name: 'Malabar Biriyani (Chicken)',
                category: 'Rice Dishes',
                price: 420,
                description: 'Fragrant basmati rice cooked with coastal spices and tender meat.',
                veg: false,
                image: ''
            },
            {
                _id: '4',
                name: 'Karimeen Pollichathu',
                category: 'Seafood',
                price: 480,
                description: 'Pearl spot fish marinated with spices, wrapped in banana leaf, and grilled to perfection.',
                veg: false,
                image: ''
            },
            {
                _id: '5',
                name: 'Vegetable Stew with Appam',
                category: 'Breads',
                price: 250,
                description: 'Mildly spiced mixed vegetables in coconut milk, served with fluffy appams.',
                veg: true,
                image: ''
            },
            {
                _id: '6',
                name: 'Payasam',
                category: 'Desserts',
                price: 150,
                description: 'Traditional slow-cooked milk and rice dessert with cardamom and nuts.',
                veg: true,
                image: ''
            }
        ];
    },

    // Render menu items
    renderMenu() {
        const menuGrid = document.getElementById('menuGrid');
        if (!menuGrid) return;

        if (!this.allMenuItems || this.allMenuItems.length === 0) {
            menuGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #999;">No menu items available</p>';
            return;
        }

        menuGrid.innerHTML = this.allMenuItems.map(item => {
            const filterCategory = this.categoryMap[item.category] || 'main';
            const imageSrc = item.image || 'assets/images/default-menu-item.png';
            const vegIcon = item.veg ? '🥬' : '🍖';
            
            return `
                <div class="menu-card fade-up" data-category="${filterCategory}" data-name="${item.name.toLowerCase()}">
                    <div class="menu-card-img-wrap">
                        <img src="${imageSrc}" alt="${item.name}" 
                            onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><rect fill=%22%23f0f0f0%22 width=%22300%22 height=%22300%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2218%22>No Image</text></svg>'">
                        <span class="menu-card-category">${item.category}</span>
                        <span class="menu-card-price">&#8377;${parseFloat(item.price).toFixed(0)}</span>
                    </div>
                    <div class="menu-card-body">
                        <h3>${item.name}</h3>
                        <p>${item.description || 'A delicious dish from our kitchen.'}</p>
                        <div class="menu-card-meta">
                            <span>${vegIcon}</span>
                            ${item.calories ? `<span>${item.calories} cal</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Attach filter listener
    attachFilterListener() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterMenuItems());
        }
        const menuSearch = document.getElementById('menuSearch');
        if (menuSearch) {
            menuSearch.addEventListener('input', () => this.filterMenuItems());
        }
    },

    // Filter menu items
    filterMenuItems() {
        const categoryFilter = document.getElementById('categoryFilter');
        const menuSearch = document.getElementById('menuSearch');
        const cards = document.querySelectorAll('.menu-card');

        if (!cards.length) return;

        const selectedCat = categoryFilter ? categoryFilter.value.toLowerCase() : 'all';
        const searchVal = menuSearch ? menuSearch.value.toLowerCase().trim() : '';

        cards.forEach(card => {
            const cardCat = (card.dataset.category || '').toLowerCase();
            const cardName = (card.dataset.name || '').toLowerCase();

            const matchCat = selectedCat === 'all' || cardCat === selectedCat;
            const matchSearch = !searchVal || cardName.includes(searchVal);

            if (matchCat && matchSearch) {
                card.style.display = '';
                card.style.opacity = '1';
            } else {
                card.style.opacity = '0';
                setTimeout(() => {
                    if (card.style.opacity === '0') card.style.display = 'none';
                }, 220);
            }
        });
    },

    // Show error message
    showErrorMessage() {
        const menuGrid = document.getElementById('menuGrid');
        if (menuGrid) {
            menuGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e74c3c;">Error loading menu items. Please try again later.</p>';
        }
    }
};

// Initialize menu loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    MENU_LOADER.init();
});

// Override the filterMenu function to use the menu loader
const originalFilterMenu = typeof filterMenu !== 'undefined' ? filterMenu : null;
function filterMenu() {
    if (MENU_LOADER && typeof MENU_LOADER.filterMenuItems === 'function') {
        MENU_LOADER.filterMenuItems();
    } else if (originalFilterMenu) {
        originalFilterMenu();
    }
}
