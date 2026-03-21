// ============================================
// MALABAR SPICE - Gallery Loader
// Loads gallery images dynamically from API
// ============================================

const GALLERY_LOADER = {
    API_URL: 'https://malabar-spice-backend.onrender.com/api',
    allGalleryImages: [],
    currentLightboxIndex: 0,

    // Initialize and load gallery
    async init() {
        try {
            await this.loadGalleryImages();
            this.renderGallery();
            this.setupFilterButtons();
            // Re-initialize animations after rendering
            if (typeof initScrollAnimations === 'function') {
                initScrollAnimations();
            }
        } catch (err) {
            console.error('Error initializing gallery:', err);
        }
    },

    // Fetch gallery images from API
    async loadGalleryImages() {
        try {
            const response = await fetch(`${this.API_URL}/admin/gallery`);
            if (!response.ok) throw new Error('Failed to fetch gallery images');
            this.allGalleryImages = await response.json();
            console.log('Gallery images loaded:', this.allGalleryImages.length);
        } catch (err) {
            console.error('Error loading gallery images:', err);
            // Use static gallery as fallback
            this.loadStaticGallery();
        }
    },

    // Static gallery as fallback
    loadStaticGallery() {
        this.allGalleryImages = [
            { _id: '1', title: 'Kerala Sadya', caption: 'Traditional banana leaf feast', image: 'assets/images/gallery_sadya.png', category: 'food' },
            { _id: '2', title: 'Malabar Biriyani', caption: 'Fragrant coastal rice dish', image: 'assets/images/gallery_biriyani.png', category: 'food' },
            { _id: '3', title: 'Karimeen Pollichathu', caption: 'Pearl spot fish in banana leaf', image: 'assets/images/gallery_karimeen.png', category: 'food' },
            { _id: '4', title: 'Our Dining Room', caption: 'Kerala-inspired fine dining ambiance', image: 'assets/images/gallery_interior.png', category: 'ambiance' },
            { _id: '5', title: 'Kerala Spices', caption: 'The soul of Malabar cuisine', image: 'assets/images/gallery_spices.png', category: 'heritage' },
            { _id: '6', title: 'Appam & Stew', caption: 'Classic Kerala breakfast delight', image: 'assets/images/gallery_appam.png', category: 'food' },
            { _id: '7', title: 'Kerala Backwaters', caption: 'The heritage we celebrate', image: 'assets/images/gallery_backwaters.png', category: 'heritage' },
            { _id: '8', title: 'Kerala Payasam', caption: 'A sweet traditional dessert', image: 'assets/images/gallery_payasam.png', category: 'desserts' },
            { _id: '9', title: 'Our Master Chef', caption: 'Crafting authentic Kerala cuisine', image: 'assets/images/gallery_chef.png', category: 'ambiance' }
        ];
    },

    // Render gallery grid
    renderGallery() {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        if (!this.allGalleryImages || this.allGalleryImages.length === 0) {
            galleryGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #999;">No gallery images available</p>';
            return;
        }

        galleryGrid.innerHTML = this.allGalleryImages.map((img, index) => {
            const imageUrl = img.image && img.image.startsWith('data:') ? img.image : img.image || 'assets/images/default-gallery.png';
            const category = img.category || 'food';
            
            return `
                <div class="gallery-item fade-up" data-category="${category}" data-index="${index}" onclick="GALLERY_LOADER.openLightbox(${index})">
                    <img src="${imageUrl}" alt="${img.title}" 
                        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><rect fill=%221a2e22%22 width=%22300%22 height=%22300%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22#999%22 text-anchor=%22middle%22 dy=%22.3em%22>No Image</text></svg>'">
                    <div class="gallery-item-overlay">
                        <span>${img.title}</span>
                    </div>
                    <div class="gallery-zoom-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Filter gallery items
    filterGallery(category) {
        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    },

    // Setup filter buttons
    setupFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterGallery(btn.dataset.filter);
            });
        });
    },

    // Lightbox functions
    openLightbox(index) {
        this.currentLightboxIndex = index;
        this.updateLightboxImg();
        document.getElementById('lightbox').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeLightbox() {
        document.getElementById('lightbox').classList.remove('active');
        document.body.style.overflow = '';
    },

    changeLightbox(dir) {
        const visibleItems = [...document.querySelectorAll('.gallery-item:not(.hidden)')];
        const currentIndexes = visibleItems.map(el => parseInt(el.dataset.index));
        const pos = currentIndexes.indexOf(this.currentLightboxIndex);
        if (pos === -1) return;
        const newPos = (pos + dir + currentIndexes.length) % currentIndexes.length;
        this.currentLightboxIndex = currentIndexes[newPos];
        this.updateLightboxImg();
    },

    updateLightboxImg() {
        const img = this.allGalleryImages[this.currentLightboxIndex];
        const imageUrl = img.image && img.image.startsWith('data:') ? img.image : img.image || 'assets/images/default-gallery.png';
        document.getElementById('lightboxImg').src = imageUrl;
        document.getElementById('lightboxImg').alt = img.title;
        document.getElementById('lightboxCaption').textContent = `${img.title} — ${img.caption}`;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    GALLERY_LOADER.init();
});
