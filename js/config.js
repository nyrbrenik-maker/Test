// GreenGrow Configuration
const CONFIG = {
    APP_NAME: 'GreenGrow',
    VERSION: '1.0.0',

    // Google Sheets API Configuration
    SHEETS_API_BASE: 'https://sheets.googleapis.com/v4/spreadsheets',

    // Sheet names (must match your Google Sheets tabs)
    SHEET_NAMES: {
        BAYS: 'Bays',
        TRAYS: 'Trays',
        PLANTS: 'Plants',
        STRAINS: 'Strains',
        EFFECTS: 'Effects',
        TERPENES: 'Terpenes',
        USE_CASES: 'UseCases',
        USERS: 'Users',
        SETTINGS: 'Settings'
    },

    // Default reference data (used if sheets are empty)
    DEFAULT_EFFECTS: [
        'Uplifted', 'Energetic', 'Creative', 'Focused', 'Happy',
        'Relaxed', 'Sedated', 'Sleepy', 'Euphoric', 'Giggly',
        'Hungry', 'Talkative', 'Aroused'
    ],

    DEFAULT_TERPENES: [
        'Myrcene', 'Limonene', 'Caryophyllene', 'Pinene', 'Linalool',
        'Humulene', 'Terpinolene', 'Ocimene', 'Bisabolol', 'Valencene'
    ],

    DEFAULT_USE_CASES: [
        'Insomnia', 'Stress', 'Anxiety', 'Depression', 'Pain',
        'PTSD', 'Inflammation', 'Nausea', 'Lack of Appetite',
        'Muscle Spasms', 'Migraines', 'Fatigue', 'ADD/ADHD'
    ],

    // Plant growth stages
    GROWTH_STAGES: [
        'seedling',
        'vegetative',
        'flowering',
        'harvested'
    ],

    // Strain types
    STRAIN_TYPES: [
        'Indica',
        'Sativa',
        'Hybrid'
    ],

    // Tray statuses
    TRAY_STATUSES: [
        'active',
        'vegetative',
        'flowering',
        'harvested',
        'empty'
    ],

    // User roles
    USER_ROLES: {
        ADMIN: 'admin',
        GROWER: 'grower',
        CLIENT: 'client'
    },

    // Local storage keys
    STORAGE_KEYS: {
        API_KEY: 'greengrow_api_key',
        SHEET_ID: 'greengrow_sheet_id',
        USER_ROLE: 'greengrow_user_role',
        USER_NAME: 'greengrow_user_name',
        CACHE_PREFIX: 'greengrow_cache_'
    },

    // Cache duration (in milliseconds)
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

    // Validation rules
    VALIDATION: {
        PLANT_ID_PATTERN: /^[A-Z0-9-]+$/,
        MIN_TEMP: 60,
        MAX_TEMP: 90,
        MIN_HUMIDITY: 30,
        MAX_HUMIDITY: 80,
        MIN_THC: 0,
        MAX_THC: 35,
        MIN_CBD: 0,
        MAX_CBD: 25
    }
};

// Utility functions
const Utils = {
    // Format date
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Calculate days between dates
    daysBetween(date1, date2 = new Date()) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    // Add days to date
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    // Generate unique ID
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        return `${prefix}${timestamp}${random}`.toUpperCase();
    },

    // Validate email
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Sort array of objects
    sortBy(array, key, ascending = true) {
        return array.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];

            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    },

    // Group array by key
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) {
                result[group] = [];
            }
            result[group].push(item);
            return result;
        }, {});
    },

    // Calculate harvest date
    calculateHarvestDate(startDate, vegDays, flowerDays) {
        const totalDays = parseInt(vegDays) + parseInt(flowerDays);
        return this.addDays(startDate, totalDays);
    },

    // Get growth stage based on days
    getGrowthStage(daysInGrowth, vegDays, flowerDays) {
        if (daysInGrowth < 14) return 'seedling';
        if (daysInGrowth < vegDays) return 'vegetative';
        if (daysInGrowth < vegDays + flowerDays) return 'flowering';
        return 'harvested';
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, Utils };
}
