// Bays Module
const Bays = {
    bays: [],

    async init() {
        await this.loadData();
        this.render();
        this.attachEventListeners();
    },

    async loadData() {
        try {
            UI.showLoading('Loading bays...');
            this.bays = await DataStore.getBays();
            UI.hideLoading();
        } catch (error) {
            UI.hideLoading();
            UI.showToast('Failed to load bays', 'error');
            console.error(error);
        }
    },

    render() {
        const container = document.getElementById('bays-grid');

        if (this.bays.length === 0) {
            UI.renderEmptyState(container, 'fa-warehouse', 'No bays configured. Click "Add Bay" to get started.');
            return;
        }

        container.innerHTML = this.bays.map(bay => {
            const tempStatus = this.getEnvStatus(bay.temperature, CONFIG.VALIDATION.MIN_TEMP, CONFIG.VALIDATION.MAX_TEMP);
            const humidStatus = this.getEnvStatus(bay.humidity, CONFIG.VALIDATION.MIN_HUMIDITY, CONFIG.VALIDATION.MAX_HUMIDITY);

            return `
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">${bay.name}</div>
                        ${Auth.isAdmin() ? `
                            <button class="btn-icon" onclick="Bays.editBay('${bay.id}')" style="color: white;" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                    </div>
                    <div class="card-body">
                        ${bay.location ? `
                            <div class="card-row">
                                <span class="card-label"><i class="fas fa-map-marker-alt"></i> Location</span>
                                <span class="card-value">${bay.location}</span>
                            </div>
                        ` : ''}
                        <div class="card-row">
                            <span class="card-label"><i class="fas fa-thermometer-half"></i> Temperature</span>
                            <span class="card-value">
                                ${bay.temperature}°F
                                <span class="badge badge-${tempStatus.class}">${tempStatus.label}</span>
                            </span>
                        </div>
                        <div class="card-row">
                            <span class="card-label"><i class="fas fa-tint"></i> Humidity</span>
                            <span class="card-value">
                                ${bay.humidity}%
                                <span class="badge badge-${humidStatus.class}">${humidStatus.label}</span>
                            </span>
                        </div>
                        ${bay.notes ? `
                            <div class="card-row">
                                <span class="card-label"><i class="fas fa-sticky-note"></i> Notes</span>
                                <span class="card-value">${UI.truncate(bay.notes, 50)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    attachEventListeners() {
        const addBtn = document.getElementById('add-bay-btn');
        if (addBtn) {
            addBtn.onclick = () => this.showAddEditModal();
        }
    },

    getEnvStatus(value, min, max) {
        if (value < min || value > max) {
            return { class: 'danger', label: 'Alert' };
        }
        if (value < min + 5 || value > max - 5) {
            return { class: 'warning', label: 'Warning' };
        }
        return { class: 'success', label: 'Good' };
    },

    showAddEditModal(bayId = null) {
        const bay = bayId ? this.bays.find(b => b.id === bayId) : null;
        const isEdit = !!bay;

        const fields = [
            {
                name: 'name',
                label: 'Bay Name',
                type: 'text',
                value: bay?.name || '',
                required: true,
                placeholder: 'e.g., Bay A1'
            },
            {
                name: 'location',
                label: 'Location',
                type: 'text',
                value: bay?.location || '',
                placeholder: 'e.g., North Wing, Room 2'
            },
            {
                name: 'temperature',
                label: 'Temperature (°F)',
                type: 'number',
                value: bay?.temperature || 75,
                required: true,
                help: `Optimal range: ${CONFIG.VALIDATION.MIN_TEMP}-${CONFIG.VALIDATION.MAX_TEMP}°F`
            },
            {
                name: 'humidity',
                label: 'Humidity (%)',
                type: 'number',
                value: bay?.humidity || 60,
                required: true,
                help: `Optimal range: ${CONFIG.VALIDATION.MIN_HUMIDITY}-${CONFIG.VALIDATION.MAX_HUMIDITY}%`
            },
            {
                name: 'notes',
                label: 'Notes',
                type: 'textarea',
                value: bay?.notes || '',
                placeholder: 'Additional notes about this bay...'
            }
        ];

        const title = isEdit ? `<i class="fas fa-edit"></i> Edit Bay` : `<i class="fas fa-plus"></i> Add New Bay`;

        UI.showFormModal(title, fields, async (formData) => {
            const bayData = {
                id: bay?.id || Utils.generateId('BAY'),
                name: formData.name,
                location: formData.location || '',
                temperature: parseFloat(formData.temperature),
                humidity: parseFloat(formData.humidity),
                notes: formData.notes || '',
                _rowIndex: bay?._rowIndex
            };

            // Validate temperature and humidity
            if (bayData.temperature < CONFIG.VALIDATION.MIN_TEMP || bayData.temperature > CONFIG.VALIDATION.MAX_TEMP) {
                throw new Error(`Temperature must be between ${CONFIG.VALIDATION.MIN_TEMP}-${CONFIG.VALIDATION.MAX_TEMP}°F`);
            }

            if (bayData.humidity < CONFIG.VALIDATION.MIN_HUMIDITY || bayData.humidity > CONFIG.VALIDATION.MAX_HUMIDITY) {
                throw new Error(`Humidity must be between ${CONFIG.VALIDATION.MIN_HUMIDITY}-${CONFIG.VALIDATION.MAX_HUMIDITY}%`);
            }

            try {
                if (isEdit) {
                    // Update existing bay
                    UI.showToast('Updating bay...', 'info');
                    // Note: Update functionality requires batch update API
                    // For now, we'll show a message
                    UI.showToast('Bay updated (update to Google Sheets manually)', 'warning');
                } else {
                    await DataStore.addBay(bayData);
                    UI.showToast('Bay added successfully', 'success');
                }

                await this.loadData();
                this.render();
            } catch (error) {
                throw new Error('Failed to save bay: ' + error.message);
            }
        });
    },

    editBay(bayId) {
        this.showAddEditModal(bayId);
    }
};
