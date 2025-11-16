// Google Sheets API Integration
const SheetsAPI = {
    apiKey: null,
    spreadsheetId: null,
    cache: {},

    // Initialize API with credentials
    init(apiKey, spreadsheetId) {
        this.apiKey = apiKey;
        this.spreadsheetId = spreadsheetId;

        // Save to local storage
        localStorage.setItem(CONFIG.STORAGE_KEYS.API_KEY, apiKey);
        localStorage.setItem(CONFIG.STORAGE_KEYS.SHEET_ID, spreadsheetId);
    },

    // Load credentials from local storage
    loadCredentials() {
        this.apiKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
        this.spreadsheetId = localStorage.getItem(CONFIG.STORAGE_KEYS.SHEET_ID);
        return !!(this.apiKey && this.spreadsheetId);
    },

    // Check if API is configured
    isConfigured() {
        return !!(this.apiKey && this.spreadsheetId);
    },

    // Build API URL
    buildUrl(range) {
        const encodedRange = encodeURIComponent(range);
        return `${CONFIG.SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodedRange}?key=${this.apiKey}`;
    },

    // Get data from sheet
    async getSheetData(sheetName, useCache = true) {
        if (!this.isConfigured()) {
            throw new Error('Google Sheets API not configured');
        }

        // Check cache
        const cacheKey = `${CONFIG.STORAGE_KEYS.CACHE_PREFIX}${sheetName}`;
        const cached = this.cache[cacheKey];

        if (useCache && cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
            return cached.data;
        }

        try {
            const url = this.buildUrl(sheetName);
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 404) {
                    // Sheet doesn't exist, return empty array
                    return [];
                }
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const result = await response.json();
            const rows = result.values || [];

            // Convert to objects using first row as headers
            if (rows.length === 0) {
                return [];
            }

            const headers = rows[0];
            const data = rows.slice(1).map(row => {
                const obj = { _rowIndex: rows.indexOf(row) + 2 }; // +2 for header and 1-indexing
                headers.forEach((header, index) => {
                    obj[header] = row[index] || '';
                });
                return obj;
            });

            // Update cache
            this.cache[cacheKey] = {
                data,
                timestamp: Date.now()
            };

            return data;
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            throw error;
        }
    },

    // Append data to sheet
    async appendData(sheetName, values) {
        if (!this.isConfigured()) {
            throw new Error('Google Sheets API not configured');
        }

        try {
            const url = `${CONFIG.SHEETS_API_BASE}/${this.spreadsheetId}/values/${sheetName}:append?valueInputOption=USER_ENTERED&key=${this.apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [values]
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to append data: ${response.statusText}`);
            }

            // Clear cache for this sheet
            this.clearCache(sheetName);

            return await response.json();
        } catch (error) {
            console.error('Error appending data:', error);
            throw error;
        }
    },

    // Update data in sheet
    async updateData(sheetName, range, values) {
        if (!this.isConfigured()) {
            throw new Error('Google Sheets API not configured');
        }

        try {
            const fullRange = `${sheetName}!${range}`;
            const url = `${CONFIG.SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(fullRange)}?valueInputOption=USER_ENTERED&key=${this.apiKey}`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [values]
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to update data: ${response.statusText}`);
            }

            // Clear cache for this sheet
            this.clearCache(sheetName);

            return await response.json();
        } catch (error) {
            console.error('Error updating data:', error);
            throw error;
        }
    },

    // Clear cache for specific sheet or all
    clearCache(sheetName = null) {
        if (sheetName) {
            const cacheKey = `${CONFIG.STORAGE_KEYS.CACHE_PREFIX}${sheetName}`;
            delete this.cache[cacheKey];
        } else {
            this.cache = {};
        }
    },

    // Test connection
    async testConnection() {
        if (!this.isConfigured()) {
            throw new Error('API credentials not configured');
        }

        try {
            const url = `${CONFIG.SHEETS_API_BASE}/${this.spreadsheetId}?key=${this.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Connection failed: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                title: data.properties?.title || 'Unknown',
                sheets: data.sheets?.map(s => s.properties.title) || []
            };
        } catch (error) {
            console.error('Connection test failed:', error);
            throw error;
        }
    }
};

// Data access layer - provides clean interface to app data
const DataStore = {
    // Get all strains
    async getStrains() {
        const data = await SheetsAPI.getSheetData(CONFIG.SHEET_NAMES.STRAINS);
        return data.map(strain => ({
            id: strain.id || Utils.generateId('STR'),
            name: strain.name || '',
            type: strain.type || 'Hybrid',
            vegDays: parseInt(strain.vegDays) || 30,
            flowerDays: parseInt(strain.flowerDays) || 60,
            thcPercent: parseFloat(strain.thcPercent) || 0,
            cbdPercent: parseFloat(strain.cbdPercent) || 0,
            effects: strain.effects ? strain.effects.split(',').map(e => e.trim()) : [],
            terpenes: strain.terpenes ? strain.terpenes.split(',').map(t => t.trim()) : [],
            useCases: strain.useCases ? strain.useCases.split(',').map(u => u.trim()) : [],
            notes: strain.notes || '',
            _rowIndex: strain._rowIndex
        }));
    },

    // Get all bays
    async getBays() {
        const data = await SheetsAPI.getSheetData(CONFIG.SHEET_NAMES.BAYS);
        return data.map(bay => ({
            id: bay.id || Utils.generateId('BAY'),
            name: bay.name || '',
            temperature: parseFloat(bay.temperature) || 0,
            humidity: parseFloat(bay.humidity) || 0,
            location: bay.location || '',
            notes: bay.notes || '',
            _rowIndex: bay._rowIndex
        }));
    },

    // Get all trays
    async getTrays() {
        const data = await SheetsAPI.getSheetData(CONFIG.SHEET_NAMES.TRAYS);
        return data.map(tray => ({
            id: tray.id || Utils.generateId('TRY'),
            name: tray.name || '',
            bayId: tray.bayId || '',
            strainIds: tray.strainIds ? tray.strainIds.split(',').map(s => s.trim()) : [],
            dateStarted: tray.dateStarted || '',
            status: tray.status || 'active',
            notes: tray.notes || '',
            _rowIndex: tray._rowIndex
        }));
    },

    // Get all plants
    async getPlants() {
        const data = await SheetsAPI.getSheetData(CONFIG.SHEET_NAMES.PLANTS);
        return data.map(plant => ({
            id: plant.id || Utils.generateId('PLT'),
            trayId: plant.trayId || '',
            bayId: plant.bayId || '',
            strainId: plant.strainId || '',
            stage: plant.stage || 'seedling',
            datePlanted: plant.datePlanted || '',
            dateStageChanged: plant.dateStageChanged || '',
            notes: plant.notes || '',
            _rowIndex: plant._rowIndex
        }));
    },

    // Get effects
    async getEffects() {
        const data = await SheetsAPI.getSheetData(CONFIG.SHEET_NAMES.EFFECTS);
        if (data.length === 0) {
            return CONFIG.DEFAULT_EFFECTS;
        }
        return data.map(e => e.name || e.effect || '').filter(Boolean);
    },

    // Get terpenes
    async getTerpenes() {
        const data = await SheetsAPI.getSheetData(CONFIG.SHEET_NAMES.TERPENES);
        if (data.length === 0) {
            return CONFIG.DEFAULT_TERPENES;
        }
        return data.map(t => t.name || t.terpene || '').filter(Boolean);
    },

    // Get use cases
    async getUseCases() {
        const data = await SheetsAPI.getSheetData(CONFIG.SHEET_NAMES.USE_CASES);
        if (data.length === 0) {
            return CONFIG.DEFAULT_USE_CASES;
        }
        return data.map(u => u.name || u.useCase || '').filter(Boolean);
    },

    // Add strain
    async addStrain(strain) {
        const row = [
            strain.id || Utils.generateId('STR'),
            strain.name,
            strain.type,
            strain.vegDays,
            strain.flowerDays,
            strain.thcPercent,
            strain.cbdPercent,
            strain.effects.join(', '),
            strain.terpenes.join(', '),
            strain.useCases.join(', '),
            strain.notes || ''
        ];
        return await SheetsAPI.appendData(CONFIG.SHEET_NAMES.STRAINS, row);
    },

    // Add bay
    async addBay(bay) {
        const row = [
            bay.id || Utils.generateId('BAY'),
            bay.name,
            bay.temperature,
            bay.humidity,
            bay.location || '',
            bay.notes || ''
        ];
        return await SheetsAPI.appendData(CONFIG.SHEET_NAMES.BAYS, row);
    },

    // Add tray
    async addTray(tray) {
        const row = [
            tray.id || Utils.generateId('TRY'),
            tray.name,
            tray.bayId,
            tray.strainIds.join(', '),
            tray.dateStarted,
            tray.status,
            tray.notes || ''
        ];
        return await SheetsAPI.appendData(CONFIG.SHEET_NAMES.TRAYS, row);
    },

    // Add plant
    async addPlant(plant) {
        const row = [
            plant.id || Utils.generateId('PLT'),
            plant.trayId,
            plant.bayId,
            plant.strainId,
            plant.stage,
            plant.datePlanted,
            plant.dateStageChanged || plant.datePlanted,
            plant.notes || ''
        ];
        return await SheetsAPI.appendData(CONFIG.SHEET_NAMES.PLANTS, row);
    },

    // Bulk add plants
    async bulkAddPlants(plants) {
        const promises = plants.map(plant => this.addPlant(plant));
        return await Promise.all(promises);
    },

    // Update strain
    async updateStrain(strain) {
        const row = [
            strain.id,
            strain.name,
            strain.type,
            strain.vegDays,
            strain.flowerDays,
            strain.thcPercent,
            strain.cbdPercent,
            strain.effects.join(', '),
            strain.terpenes.join(', '),
            strain.useCases.join(', '),
            strain.notes || ''
        ];
        const range = `A${strain._rowIndex}:K${strain._rowIndex}`;
        return await SheetsAPI.updateData(CONFIG.SHEET_NAMES.STRAINS, range, row);
    },

    // Clear all caches
    clearCache() {
        SheetsAPI.clearCache();
    }
};
