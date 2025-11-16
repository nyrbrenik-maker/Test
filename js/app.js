// Main Application
const App = {
    currentPage: 'dashboard',

    async init() {
        // Check if API is configured
        const hasCredentials = SheetsAPI.loadCredentials();

        // Check if user is logged in
        const isLoggedIn = Auth.init();

        // Show appropriate screen
        if (!isLoggedIn) {
            this.showLoginScreen();
        } else if (!hasCredentials) {
            this.showApp();
            this.navigateTo('settings');
            UI.showToast('Please configure Google Sheets connection', 'info', 5000);
        } else {
            this.showApp();
            await this.loadInitialData();
        }
    },

    showLoginScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');

        // Handle login form
        const loginForm = document.getElementById('login-form');
        loginForm.onsubmit = async (e) => {
            e.preventDefault();

            const role = document.getElementById('user-role').value;
            const name = document.getElementById('user-name').value;

            if (!role || !name) {
                UI.showToast('Please fill in all fields', 'error');
                return;
            }

            // Login user
            Auth.login(name, role);

            // Show app
            this.showApp();

            // Load initial data if API is configured
            if (SheetsAPI.isConfigured()) {
                await this.loadInitialData();
            } else {
                this.navigateTo('settings');
                UI.showToast('Please configure Google Sheets connection', 'info', 5000);
            }
        };
    },

    showApp() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');

        // Update user info in header
        document.getElementById('current-user').textContent = Auth.getUserDisplayName();
        document.getElementById('current-role').textContent = Auth.getRoleDisplayName();

        // Setup navigation
        this.setupNavigation();

        // Setup logout
        document.getElementById('logout-btn').onclick = () => {
            Auth.logout();
            window.location.reload();
        };

        // Setup refresh button
        document.getElementById('refresh-data').onclick = async () => {
            await this.refreshCurrentPage();
        };

        // Setup mobile menu toggle
        document.getElementById('menu-toggle').onclick = () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('open');
        };

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menu-toggle');

            if (sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    },

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigateTo(page);

                // Close mobile menu
                document.getElementById('sidebar').classList.remove('open');
            });
        });
    },

    async navigateTo(pageName) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[data-page="${pageName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const selectedPage = document.getElementById(`page-${pageName}`);
        if (selectedPage) {
            selectedPage.classList.add('active');
        }

        this.currentPage = pageName;

        // Initialize page module if needed
        await this.initializePage(pageName);
    },

    async initializePage(pageName) {
        try {
            switch (pageName) {
                case 'dashboard':
                    await Dashboard.init();
                    break;
                case 'strains':
                    await Strains.init();
                    break;
                case 'bays':
                    await Bays.init();
                    break;
                case 'trays':
                    await Trays.init();
                    break;
                case 'plants':
                    await Plants.init();
                    break;
                case 'settings':
                    await Settings.init();
                    break;
            }
        } catch (error) {
            console.error(`Error initializing ${pageName}:`, error);
            UI.showToast(`Error loading ${pageName}`, 'error');
        }
    },

    async loadInitialData() {
        try {
            UI.showLoading('Loading your cultivation data...');

            // Clear cache to get fresh data
            DataStore.clearCache();

            // Navigate to dashboard
            await this.navigateTo('dashboard');

            UI.hideLoading();
        } catch (error) {
            UI.hideLoading();
            console.error('Error loading initial data:', error);

            if (error.message.includes('Failed to fetch') || error.message.includes('404')) {
                UI.showToast('Could not connect to Google Sheets. Please check your configuration.', 'error', 5000);
                this.navigateTo('settings');
            } else {
                UI.showToast('Error loading data: ' + error.message, 'error');
            }
        }
    },

    async refreshCurrentPage() {
        DataStore.clearCache();
        await this.initializePage(this.currentPage);
        UI.showToast('Data refreshed', 'success');
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    App.init();
}

// Handle online/offline status
window.addEventListener('online', () => {
    UI.showToast('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    UI.showToast('You are offline. Changes may not be saved.', 'warning', 5000);
});

// Export for debugging
window.GreenGrow = {
    App,
    Auth,
    SheetsAPI,
    DataStore,
    Dashboard,
    Strains,
    Bays,
    Trays,
    Plants,
    Settings,
    UI,
    CONFIG,
    Utils
};
