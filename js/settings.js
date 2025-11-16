// Settings Module
const Settings = {
    effects: [],
    terpenes: [],
    useCases: [],

    async init() {
        await this.loadData();
        this.render();
        this.attachEventListeners();
        this.loadSavedConfig();
    },

    async loadData() {
        try {
            if (SheetsAPI.isConfigured()) {
                [this.effects, this.terpenes, this.useCases] = await Promise.all([
                    DataStore.getEffects(),
                    DataStore.getTerpenes(),
                    DataStore.getUseCases()
                ]);
            } else {
                this.effects = CONFIG.DEFAULT_EFFECTS;
                this.terpenes = CONFIG.DEFAULT_TERPENES;
                this.useCases = CONFIG.DEFAULT_USE_CASES;
            }
        } catch (error) {
            console.error('Error loading settings data:', error);
            this.effects = CONFIG.DEFAULT_EFFECTS;
            this.terpenes = CONFIG.DEFAULT_TERPENES;
            this.useCases = CONFIG.DEFAULT_USE_CASES;
        }
    },

    render() {
        // Render effects
        const effectsList = document.getElementById('effects-list');
        effectsList.innerHTML = this.effects.map(effect =>
            `<span class="tag">${effect}</span>`
        ).join('');

        // Render terpenes
        const terpenesList = document.getElementById('terpenes-list');
        terpenesList.innerHTML = this.terpenes.map(terpene =>
            `<span class="tag">${terpene}</span>`
        ).join('');

        // Render use cases
        const useCasesList = document.getElementById('usecases-list');
        useCasesList.innerHTML = this.useCases.map(useCase =>
            `<span class="tag">${useCase}</span>`
        ).join('');
    },

    attachEventListeners() {
        // Google Sheets config form
        const configForm = document.getElementById('sheets-config-form');
        configForm.onsubmit = async (e) => {
            e.preventDefault();
            await this.saveConfiguration();
        };

        // Test connection button
        const testBtn = document.getElementById('test-connection');
        testBtn.onclick = async () => {
            await this.testConnection();
        };

        // Manage reference data buttons
        document.getElementById('manage-effects').onclick = () => {
            this.showManageModal('Effects', this.effects, (updated) => {
                this.effects = updated;
                this.render();
            });
        };

        document.getElementById('manage-terpenes').onclick = () => {
            this.showManageModal('Terpenes', this.terpenes, (updated) => {
                this.terpenes = updated;
                this.render();
            });
        };

        document.getElementById('manage-usecases').onclick = () => {
            this.showManageModal('Use Cases', this.useCases, (updated) => {
                this.useCases = updated;
                this.render();
            });
        };
    },

    loadSavedConfig() {
        const apiKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
        const sheetId = localStorage.getItem(CONFIG.STORAGE_KEYS.SHEET_ID);

        if (apiKey) {
            document.getElementById('api-key').value = apiKey;
        }

        if (sheetId) {
            document.getElementById('sheet-id').value = sheetId;
        }
    },

    async saveConfiguration() {
        const apiKey = document.getElementById('api-key').value.trim();
        const sheetId = document.getElementById('sheet-id').value.trim();

        if (!apiKey || !sheetId) {
            UI.showToast('Please fill in all fields', 'error');
            return;
        }

        try {
            UI.showLoading('Saving configuration...');
            SheetsAPI.init(apiKey, sheetId);

            // Test the connection
            await SheetsAPI.testConnection();

            UI.hideLoading();
            UI.showToast('Configuration saved successfully', 'success');
        } catch (error) {
            UI.hideLoading();
            UI.showToast('Configuration saved, but connection test failed: ' + error.message, 'warning');
        }
    },

    async testConnection() {
        const apiKey = document.getElementById('api-key').value.trim();
        const sheetId = document.getElementById('sheet-id').value.trim();

        if (!apiKey || !sheetId) {
            UI.showToast('Please save configuration first', 'error');
            return;
        }

        try {
            UI.showLoading('Testing connection...');
            SheetsAPI.init(apiKey, sheetId);
            const result = await SheetsAPI.testConnection();

            UI.hideLoading();

            const sheetsHtml = result.sheets.map(s => `<li>${s}</li>`).join('');

            UI.showModal(
                '<i class="fas fa-check-circle"></i> Connection Successful',
                `
                    <div class="form-group">
                        <label>Spreadsheet Title</label>
                        <p><strong>${result.title}</strong></p>
                    </div>
                    <div class="form-group">
                        <label>Available Sheets (${result.sheets.length})</label>
                        <ul style="margin-left: 1.5rem;">
                            ${sheetsHtml}
                        </ul>
                    </div>
                    <div class="form-group">
                        <p class="text-muted text-small">
                            <i class="fas fa-info-circle"></i>
                            Make sure your sheets are named according to the configuration in config.js
                        </p>
                    </div>
                `,
                [{
                    label: 'Close',
                    type: 'primary',
                    action: 'close'
                }]
            );
        } catch (error) {
            UI.hideLoading();
            UI.showToast('Connection failed: ' + error.message, 'error');
        }
    },

    showManageModal(title, items, onSave) {
        const content = `
            <div class="form-group">
                <label>Manage ${title}</label>
                <div id="manage-items-list" style="max-height: 300px; overflow-y: auto; margin-bottom: 1rem;">
                    ${items.map((item, index) => `
                        <div class="data-item" style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${item}</span>
                            <button type="button" class="btn-icon" onclick="Settings.removeItem(${index})" title="Remove">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" id="new-item-input" placeholder="Add new ${title.toLowerCase()}..." style="flex: 1;">
                    <button type="button" class="btn btn-primary" onclick="Settings.addItem()">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
        `;

        const modal = UI.showModal(
            `<i class="fas fa-edit"></i> Manage ${title}`,
            content,
            [
                {
                    label: 'Save Changes',
                    type: 'primary',
                    action: 'save',
                    handler: (modal) => {
                        UI.showToast(`${title} updated successfully`, 'success');
                        UI.showToast('Note: Changes are local only. Update your Google Sheet to persist.', 'info', 5000);
                        UI.closeModal(modal);
                    }
                },
                {
                    label: 'Cancel',
                    type: 'secondary',
                    action: 'close'
                }
            ]
        );

        // Store current items and modal for add/remove functions
        this.currentManageModal = {
            modal,
            items: [...items],
            onSave
        };

        // Add enter key handler for input
        const input = modal.querySelector('#new-item-input');
        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                this.addItem();
            }
        };
    },

    addItem() {
        const input = document.getElementById('new-item-input');
        const value = input.value.trim();

        if (!value) {
            UI.showToast('Please enter a value', 'error');
            return;
        }

        if (this.currentManageModal.items.includes(value)) {
            UI.showToast('This item already exists', 'error');
            return;
        }

        this.currentManageModal.items.push(value);
        input.value = '';

        // Update the list display
        const list = document.getElementById('manage-items-list');
        const index = this.currentManageModal.items.length - 1;
        const item = value;

        list.innerHTML += `
            <div class="data-item" style="display: flex; justify-content: space-between; align-items: center;">
                <span>${item}</span>
                <button type="button" class="btn-icon" onclick="Settings.removeItem(${index})" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Call onSave to update parent array
        this.currentManageModal.onSave(this.currentManageModal.items);
    },

    removeItem(index) {
        if (!this.currentManageModal) return;

        this.currentManageModal.items.splice(index, 1);

        // Re-render the list
        const list = document.getElementById('manage-items-list');
        list.innerHTML = this.currentManageModal.items.map((item, i) => `
            <div class="data-item" style="display: flex; justify-content: space-between; align-items: center;">
                <span>${item}</span>
                <button type="button" class="btn-icon" onclick="Settings.removeItem(${i})" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Call onSave to update parent array
        this.currentManageModal.onSave(this.currentManageModal.items);
    }
};
