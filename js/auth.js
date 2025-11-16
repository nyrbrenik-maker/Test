// Authentication and User Management
const Auth = {
    currentUser: null,
    currentRole: null,

    // Initialize auth system
    init() {
        // Load saved user info
        const savedRole = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_ROLE);
        const savedName = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_NAME);

        if (savedRole && savedName) {
            this.currentRole = savedRole;
            this.currentUser = savedName;
            return true;
        }

        return false;
    },

    // Login user
    login(name, role) {
        this.currentUser = name;
        this.currentRole = role;

        // Save to local storage
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_ROLE, role);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_NAME, name);

        // Apply role to body for CSS
        document.body.className = `role-${role}`;

        return true;
    },

    // Logout user
    logout() {
        this.currentUser = null;
        this.currentRole = null;

        // Clear from local storage
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_ROLE);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_NAME);

        // Remove role class
        document.body.className = '';

        return true;
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!(this.currentUser && this.currentRole);
    },

    // Check if user has permission
    hasPermission(requiredRole) {
        if (!this.currentRole) return false;

        const roleHierarchy = {
            admin: 3,
            grower: 2,
            client: 1
        };

        return roleHierarchy[this.currentRole] >= roleHierarchy[requiredRole];
    },

    // Check if user is admin
    isAdmin() {
        return this.currentRole === CONFIG.USER_ROLES.ADMIN;
    },

    // Check if user is grower or admin
    canEdit() {
        return this.currentRole === CONFIG.USER_ROLES.ADMIN ||
               this.currentRole === CONFIG.USER_ROLES.GROWER;
    },

    // Check if user is client
    isClient() {
        return this.currentRole === CONFIG.USER_ROLES.CLIENT;
    },

    // Get user display name
    getUserDisplayName() {
        return this.currentUser || 'Guest';
    },

    // Get role display name
    getRoleDisplayName() {
        if (!this.currentRole) return '';

        const roleNames = {
            admin: 'Administrator',
            grower: 'Grower',
            client: 'Client'
        };

        return roleNames[this.currentRole] || this.currentRole;
    }
};
