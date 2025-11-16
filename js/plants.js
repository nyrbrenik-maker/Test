// Plants Module
const Plants = {
    plants: [],
    trays: [],
    bays: [],
    strains: [],
    filters: {
        bay: '',
        tray: '',
        strain: '',
        stage: ''
    },

    async init() {
        await this.loadData();
        this.populateFilters();
        this.render();
        this.attachEventListeners();
    },

    async loadData() {
        try {
            UI.showLoading('Loading plants...');

            [this.plants, this.trays, this.bays, this.strains] = await Promise.all([
                DataStore.getPlants(),
                DataStore.getTrays(),
                DataStore.getBays(),
                DataStore.getStrains()
            ]);

            UI.hideLoading();
        } catch (error) {
            UI.hideLoading();
            UI.showToast('Failed to load plants', 'error');
            console.error(error);
        }
    },

    populateFilters() {
        // Populate bay filter
        const bayFilter = document.getElementById('filter-bay');
        bayFilter.innerHTML = '<option value="">All Bays</option>' +
            this.bays.map(b => `<option value="${b.id}">${b.name}</option>`).join('');

        // Populate tray filter
        const trayFilter = document.getElementById('filter-tray');
        trayFilter.innerHTML = '<option value="">All Trays</option>' +
            this.trays.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

        // Populate strain filter
        const strainFilter = document.getElementById('filter-strain');
        strainFilter.innerHTML = '<option value="">All Strains</option>' +
            this.strains.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    },

    render() {
        const tbody = document.getElementById('plants-tbody');
        const filteredPlants = this.getFilteredPlants();

        if (filteredPlants.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        No plants found. Click "Add Plant" or "Bulk Add" to get started.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredPlants.map(plant => {
            const tray = this.trays.find(t => t.id === plant.trayId);
            const bay = this.bays.find(b => b.id === plant.bayId);
            const strain = this.strains.find(s => s.id === plant.strainId);
            const daysInStage = Utils.daysBetween(plant.dateStageChanged);

            const stageClass = {
                seedling: 'info',
                vegetative: 'success',
                flowering: 'warning',
                harvested: 'secondary'
            }[plant.stage] || 'info';

            return `
                <tr>
                    <td><strong>${plant.id}</strong></td>
                    <td>${tray?.name || 'Unknown'}</td>
                    <td>${bay?.name || 'Unknown'}</td>
                    <td>${strain?.name || 'Unknown'}</td>
                    <td><span class="badge badge-${stageClass}">${plant.stage}</span></td>
                    <td>${daysInStage} days</td>
                    <td class="table-actions">
                        <button class="btn-icon" onclick="Plants.viewPlant('${plant.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${Auth.canEdit() ? `
                            <button class="btn-icon" onclick="Plants.editPlant('${plant.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    getFilteredPlants() {
        return this.plants.filter(plant => {
            if (this.filters.bay && plant.bayId !== this.filters.bay) return false;
            if (this.filters.tray && plant.trayId !== this.filters.tray) return false;
            if (this.filters.strain && plant.strainId !== this.filters.strain) return false;
            if (this.filters.stage && plant.stage !== this.filters.stage) return false;
            return true;
        });
    },

    attachEventListeners() {
        // Add plant button
        const addBtn = document.getElementById('add-plant-btn');
        if (addBtn) {
            addBtn.onclick = () => this.showAddEditModal();
        }

        // Bulk add button
        const bulkBtn = document.getElementById('bulk-add-plants-btn');
        if (bulkBtn) {
            bulkBtn.onclick = () => this.showBulkAddModal();
        }

        // Filters
        document.getElementById('filter-bay').onchange = (e) => {
            this.filters.bay = e.target.value;
            this.render();
        };

        document.getElementById('filter-tray').onchange = (e) => {
            this.filters.tray = e.target.value;
            this.render();
        };

        document.getElementById('filter-strain').onchange = (e) => {
            this.filters.strain = e.target.value;
            this.render();
        };

        document.getElementById('filter-stage').onchange = (e) => {
            this.filters.stage = e.target.value;
            this.render();
        };
    },

    viewPlant(plantId) {
        const plant = this.plants.find(p => p.id === plantId);
        if (!plant) return;

        const tray = this.trays.find(t => t.id === plant.trayId);
        const bay = this.bays.find(b => b.id === plant.bayId);
        const strain = this.strains.find(s => s.id === plant.strainId);
        const daysInStage = Utils.daysBetween(plant.dateStageChanged);
        const totalDays = Utils.daysBetween(plant.datePlanted);

        const content = `
            <div class="plant-details">
                <div class="form-row">
                    <div class="form-group">
                        <label>Plant ID</label>
                        <p><strong>${plant.id}</strong></p>
                    </div>
                    <div class="form-group">
                        <label>Growth Stage</label>
                        <p><span class="badge badge-info">${plant.stage}</span></p>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Tray</label>
                        <p>${tray?.name || 'Unknown'}</p>
                    </div>
                    <div class="form-group">
                        <label>Bay</label>
                        <p>${bay?.name || 'Unknown'}</p>
                    </div>
                    <div class="form-group">
                        <label>Strain</label>
                        <p>${strain?.name || 'Unknown'}</p>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Date Planted</label>
                        <p>${Utils.formatDate(plant.datePlanted)}</p>
                    </div>
                    <div class="form-group">
                        <label>Days in Current Stage</label>
                        <p>${daysInStage} days</p>
                    </div>
                    <div class="form-group">
                        <label>Total Days</label>
                        <p>${totalDays} days</p>
                    </div>
                </div>

                ${strain ? `
                    <div class="form-group">
                        <label>Expected Harvest</label>
                        <p>${Utils.formatDate(Utils.calculateHarvestDate(plant.datePlanted, strain.vegDays, strain.flowerDays))}</p>
                    </div>
                ` : ''}

                ${plant.notes ? `
                    <div class="form-group">
                        <label>Notes</label>
                        <p>${plant.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;

        const buttons = Auth.canEdit() ? [
            {
                label: 'Edit',
                type: 'primary',
                action: 'edit',
                handler: (modal) => {
                    UI.closeModal(modal);
                    this.editPlant(plantId);
                }
            },
            {
                label: 'Close',
                type: 'secondary',
                action: 'close'
            }
        ] : [
            {
                label: 'Close',
                type: 'secondary',
                action: 'close'
            }
        ];

        UI.showModal(`<i class="fas fa-seedling"></i> ${plant.id}`, content, buttons);
    },

    showAddEditModal(plantId = null) {
        const plant = plantId ? this.plants.find(p => p.id === plantId) : null;
        const isEdit = !!plant;

        const fields = [
            {
                name: 'id',
                label: 'Plant ID',
                type: 'text',
                value: plant?.id || Utils.generateId('PLT'),
                required: true,
                help: 'Unique identifier for this plant'
            },
            {
                name: 'trayId',
                label: 'Tray',
                type: 'select',
                value: plant?.trayId || '',
                options: this.trays.map(t => ({ value: t.id, label: t.name })),
                required: true
            },
            {
                name: 'bayId',
                label: 'Bay',
                type: 'select',
                value: plant?.bayId || '',
                options: this.bays.map(b => ({ value: b.id, label: b.name })),
                required: true
            },
            {
                name: 'strainId',
                label: 'Strain',
                type: 'select',
                value: plant?.strainId || '',
                options: this.strains.map(s => ({ value: s.id, label: s.name })),
                required: true
            },
            {
                name: 'stage',
                label: 'Growth Stage',
                type: 'select',
                value: plant?.stage || 'seedling',
                options: CONFIG.GROWTH_STAGES,
                required: true
            },
            {
                name: 'datePlanted',
                label: 'Date Planted',
                type: 'date',
                value: plant?.datePlanted || new Date().toISOString().split('T')[0],
                required: true
            },
            {
                name: 'notes',
                label: 'Notes',
                type: 'textarea',
                value: plant?.notes || '',
                placeholder: 'Additional notes about this plant...'
            }
        ];

        const title = isEdit ? `<i class="fas fa-edit"></i> Edit Plant` : `<i class="fas fa-plus"></i> Add New Plant`;

        UI.showFormModal(title, fields, async (formData) => {
            const plantData = {
                id: formData.id,
                trayId: formData.trayId,
                bayId: formData.bayId,
                strainId: formData.strainId,
                stage: formData.stage,
                datePlanted: formData.datePlanted,
                dateStageChanged: plant?.dateStageChanged || formData.datePlanted,
                notes: formData.notes || '',
                _rowIndex: plant?._rowIndex
            };

            // Validate plant ID format
            if (!CONFIG.VALIDATION.PLANT_ID_PATTERN.test(plantData.id)) {
                throw new Error('Plant ID must contain only letters, numbers, and hyphens');
            }

            // Check for duplicate ID
            if (!isEdit && this.plants.some(p => p.id === plantData.id)) {
                throw new Error('A plant with this ID already exists');
            }

            try {
                if (isEdit) {
                    UI.showToast('Plant updated (update to Google Sheets manually)', 'warning');
                } else {
                    await DataStore.addPlant(plantData);
                    UI.showToast('Plant added successfully', 'success');
                }

                await this.loadData();
                this.render();
            } catch (error) {
                throw new Error('Failed to save plant: ' + error.message);
            }
        });
    },

    showBulkAddModal() {
        const fields = [
            {
                name: 'trayId',
                label: 'Tray',
                type: 'select',
                options: this.trays.map(t => ({ value: t.id, label: t.name })),
                required: true,
                help: 'All plants will be added to this tray'
            },
            {
                name: 'bayId',
                label: 'Bay',
                type: 'select',
                options: this.bays.map(b => ({ value: b.id, label: b.name })),
                required: true
            },
            {
                name: 'strainId',
                label: 'Strain',
                type: 'select',
                options: this.strains.map(s => ({ value: s.id, label: s.name })),
                required: true
            },
            {
                name: 'count',
                label: 'Number of Plants',
                type: 'number',
                value: 10,
                required: true,
                placeholder: '10',
                help: 'How many plants to add'
            },
            {
                name: 'prefix',
                label: 'ID Prefix',
                type: 'text',
                value: 'PLT',
                required: true,
                placeholder: 'PLT',
                help: 'Prefix for plant IDs (e.g., PLT will create PLT-001, PLT-002, etc.)'
            },
            {
                name: 'stage',
                label: 'Growth Stage',
                type: 'select',
                value: 'seedling',
                options: CONFIG.GROWTH_STAGES,
                required: true
            },
            {
                name: 'datePlanted',
                label: 'Date Planted',
                type: 'date',
                value: new Date().toISOString().split('T')[0],
                required: true
            }
        ];

        UI.showFormModal('<i class="fas fa-layer-group"></i> Bulk Add Plants', fields, async (formData) => {
            const count = parseInt(formData.count);

            if (count < 1 || count > 100) {
                throw new Error('Please enter a number between 1 and 100');
            }

            const plants = [];
            const existingIds = new Set(this.plants.map(p => p.id));

            for (let i = 0; i < count; i++) {
                let plantId;
                let attempts = 0;

                // Generate unique ID
                do {
                    const num = String(i + 1).padStart(3, '0');
                    plantId = `${formData.prefix}-${num}`;
                    attempts++;

                    if (attempts > 1) {
                        plantId = `${formData.prefix}-${Utils.generateId().substring(0, 8)}`;
                    }
                } while (existingIds.has(plantId) && attempts < 10);

                if (existingIds.has(plantId)) {
                    throw new Error('Failed to generate unique plant IDs. Try a different prefix.');
                }

                existingIds.add(plantId);

                plants.push({
                    id: plantId,
                    trayId: formData.trayId,
                    bayId: formData.bayId,
                    strainId: formData.strainId,
                    stage: formData.stage,
                    datePlanted: formData.datePlanted,
                    dateStageChanged: formData.datePlanted,
                    notes: ''
                });
            }

            try {
                UI.showLoading(`Adding ${count} plants...`);
                await DataStore.bulkAddPlants(plants);
                UI.hideLoading();
                UI.showToast(`Successfully added ${count} plants`, 'success');

                await this.loadData();
                this.render();
            } catch (error) {
                UI.hideLoading();
                throw new Error('Failed to add plants: ' + error.message);
            }
        });
    },

    editPlant(plantId) {
        this.showAddEditModal(plantId);
    }
};
