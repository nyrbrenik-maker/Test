// Trays Module
const Trays = {
    trays: [],
    bays: [],
    strains: [],
    plants: [],

    async init() {
        await this.loadData();
        this.render();
        this.attachEventListeners();
    },

    async loadData() {
        try {
            UI.showLoading('Loading trays...');

            [this.trays, this.bays, this.strains, this.plants] = await Promise.all([
                DataStore.getTrays(),
                DataStore.getBays(),
                DataStore.getStrains(),
                DataStore.getPlants()
            ]);

            UI.hideLoading();
        } catch (error) {
            UI.hideLoading();
            UI.showToast('Failed to load trays', 'error');
            console.error(error);
        }
    },

    render() {
        const tbody = document.getElementById('trays-tbody');

        if (this.trays.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        No trays found. Click "Add Tray" to get started.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.trays.map(tray => {
            const bay = this.bays.find(b => b.id === tray.bayId);
            const strainNames = tray.strainIds
                .map(id => this.strains.find(s => s.id === id)?.name || 'Unknown')
                .join(', ');
            const plantCount = this.plants.filter(p => p.trayId === tray.id && p.stage !== 'harvested').length;

            const statusClass = {
                active: 'info',
                vegetative: 'success',
                flowering: 'warning',
                harvested: 'secondary',
                empty: 'secondary'
            }[tray.status] || 'info';

            return `
                <tr>
                    <td><strong>${tray.name}</strong></td>
                    <td>${bay?.name || 'Unknown'}</td>
                    <td>${strainNames || '-'}</td>
                    <td>${Utils.formatDate(tray.dateStarted)}</td>
                    <td><span class="badge badge-${statusClass}">${tray.status}</span></td>
                    <td>${plantCount}</td>
                    <td class="table-actions">
                        <button class="btn-icon" onclick="Trays.viewTray('${tray.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${Auth.canEdit() ? `
                            <button class="btn-icon" onclick="Trays.editTray('${tray.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    attachEventListeners() {
        const addBtn = document.getElementById('add-tray-btn');
        if (addBtn) {
            addBtn.onclick = () => this.showAddEditModal();
        }
    },

    viewTray(trayId) {
        const tray = this.trays.find(t => t.id === trayId);
        if (!tray) return;

        const bay = this.bays.find(b => b.id === tray.bayId);
        const strainNames = tray.strainIds
            .map(id => this.strains.find(s => s.id === id)?.name || 'Unknown')
            .join(', ');
        const trayPlants = this.plants.filter(p => p.trayId === tray.id && p.stage !== 'harvested');
        const daysActive = Utils.daysBetween(tray.dateStarted);

        const content = `
            <div class="tray-details">
                <div class="form-row">
                    <div class="form-group">
                        <label>Tray Name</label>
                        <p><strong>${tray.name}</strong></p>
                    </div>
                    <div class="form-group">
                        <label>Bay Location</label>
                        <p>${bay?.name || 'Unknown'}</p>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <p><span class="badge badge-info">${tray.status}</span></p>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Date Started</label>
                        <p>${Utils.formatDate(tray.dateStarted)}</p>
                    </div>
                    <div class="form-group">
                        <label>Days Active</label>
                        <p>${daysActive} days</p>
                    </div>
                    <div class="form-group">
                        <label>Plant Count</label>
                        <p>${trayPlants.length} plants</p>
                    </div>
                </div>

                <div class="form-group">
                    <label>Strain(s)</label>
                    <p>${strainNames || 'None'}</p>
                </div>

                ${tray.notes ? `
                    <div class="form-group">
                        <label>Notes</label>
                        <p>${tray.notes}</p>
                    </div>
                ` : ''}

                ${trayPlants.length > 0 ? `
                    <div class="form-group">
                        <label>Plants in this Tray</label>
                        <div style="max-height: 200px; overflow-y: auto;">
                            ${trayPlants.map(p => {
                                const strain = this.strains.find(s => s.id === p.strainId);
                                return `
                                    <div class="data-item">
                                        <div class="data-item-header">
                                            <div class="data-item-title">${p.id}</div>
                                            <span class="badge badge-info">${p.stage}</span>
                                        </div>
                                        <div class="data-item-meta">
                                            ${strain?.name || 'Unknown strain'}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
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
                    this.editTray(trayId);
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

        UI.showModal(`<i class="fas fa-th-large"></i> ${tray.name}`, content, buttons);
    },

    showAddEditModal(trayId = null) {
        const tray = trayId ? this.trays.find(t => t.id === trayId) : null;
        const isEdit = !!tray;

        const fields = [
            {
                name: 'name',
                label: 'Tray Name',
                type: 'text',
                value: tray?.name || '',
                required: true,
                placeholder: 'e.g., Tray 1A'
            },
            {
                name: 'bayId',
                label: 'Bay Location',
                type: 'select',
                value: tray?.bayId || '',
                options: this.bays.map(b => ({ value: b.id, label: b.name })),
                required: true
            },
            {
                name: 'strainIds',
                label: 'Strain(s)',
                type: 'multiselect',
                value: tray?.strainIds || [],
                options: this.strains.map(s => ({ value: s.id, label: s.name })),
                help: 'Select one or more strains (mixed-strain trays supported)'
            },
            {
                name: 'dateStarted',
                label: 'Date Started',
                type: 'date',
                value: tray?.dateStarted || new Date().toISOString().split('T')[0],
                required: true
            },
            {
                name: 'status',
                label: 'Status',
                type: 'select',
                value: tray?.status || 'active',
                options: CONFIG.TRAY_STATUSES,
                required: true
            },
            {
                name: 'notes',
                label: 'Notes',
                type: 'textarea',
                value: tray?.notes || '',
                placeholder: 'Additional notes about this tray...'
            }
        ];

        const title = isEdit ? `<i class="fas fa-edit"></i> Edit Tray` : `<i class="fas fa-plus"></i> Add New Tray`;

        UI.showFormModal(title, fields, async (formData) => {
            const trayData = {
                id: tray?.id || Utils.generateId('TRY'),
                name: formData.name,
                bayId: formData.bayId,
                strainIds: Array.isArray(formData.strainIds) ? formData.strainIds : [],
                dateStarted: formData.dateStarted,
                status: formData.status,
                notes: formData.notes || '',
                _rowIndex: tray?._rowIndex
            };

            try {
                if (isEdit) {
                    UI.showToast('Tray updated (update to Google Sheets manually)', 'warning');
                } else {
                    await DataStore.addTray(trayData);
                    UI.showToast('Tray added successfully', 'success');
                }

                await this.loadData();
                this.render();
            } catch (error) {
                throw new Error('Failed to save tray: ' + error.message);
            }
        });
    },

    editTray(trayId) {
        this.showAddEditModal(trayId);
    }
};
