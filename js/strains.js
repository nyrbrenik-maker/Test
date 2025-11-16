// Strains Module
const Strains = {
    strains: [],
    effects: [],
    terpenes: [],
    useCases: [],

    async init() {
        await this.loadData();
        this.render();
        this.attachEventListeners();
    },

    async loadData() {
        try {
            UI.showLoading('Loading strains...');

            [this.strains, this.effects, this.terpenes, this.useCases] = await Promise.all([
                DataStore.getStrains(),
                DataStore.getEffects(),
                DataStore.getTerpenes(),
                DataStore.getUseCases()
            ]);

            UI.hideLoading();
        } catch (error) {
            UI.hideLoading();
            UI.showToast('Failed to load strains', 'error');
            console.error(error);
        }
    },

    render() {
        const tbody = document.getElementById('strains-tbody');

        if (this.strains.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        No strains found. Click "Add Strain" to get started.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.strains.map(strain => `
            <tr>
                <td><strong>${strain.name}</strong></td>
                <td><span class="badge badge-info">${strain.type}</span></td>
                <td>${strain.vegDays} days</td>
                <td>${strain.flowerDays} days</td>
                <td>${UI.formatPercent(strain.thcPercent)}</td>
                <td>${UI.formatPercent(strain.cbdPercent)}</td>
                <td class="table-actions">
                    <button class="btn-icon" onclick="Strains.viewStrain('${strain.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${Auth.isAdmin() ? `
                        <button class="btn-icon" onclick="Strains.editStrain('${strain.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    },

    attachEventListeners() {
        const addBtn = document.getElementById('add-strain-btn');
        if (addBtn) {
            addBtn.onclick = () => this.showAddEditModal();
        }
    },

    viewStrain(strainId) {
        const strain = this.strains.find(s => s.id === strainId);
        if (!strain) return;

        const content = `
            <div class="strain-details">
                <div class="form-row">
                    <div class="form-group">
                        <label>Name</label>
                        <p><strong>${strain.name}</strong></p>
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <p><span class="badge badge-info">${strain.type}</span></p>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Vegetative Days</label>
                        <p>${strain.vegDays} days</p>
                    </div>
                    <div class="form-group">
                        <label>Flowering Days</label>
                        <p>${strain.flowerDays} days</p>
                    </div>
                    <div class="form-group">
                        <label>Total Grow Time</label>
                        <p>${strain.vegDays + strain.flowerDays} days</p>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>THC Content</label>
                        <p>${UI.formatPercent(strain.thcPercent)}</p>
                    </div>
                    <div class="form-group">
                        <label>CBD Content</label>
                        <p>${UI.formatPercent(strain.cbdPercent)}</p>
                    </div>
                </div>

                ${strain.effects.length > 0 ? `
                    <div class="form-group">
                        <label>Effects</label>
                        <div class="tag-list">
                            ${strain.effects.map(e => `<span class="tag">${e}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                ${strain.terpenes.length > 0 ? `
                    <div class="form-group">
                        <label>Terpenes</label>
                        <div class="tag-list">
                            ${strain.terpenes.map(t => `<span class="tag">${t}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                ${strain.useCases.length > 0 ? `
                    <div class="form-group">
                        <label>Medical Use Cases</label>
                        <div class="tag-list">
                            ${strain.useCases.map(u => `<span class="tag">${u}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                ${strain.notes ? `
                    <div class="form-group">
                        <label>Notes</label>
                        <p>${strain.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;

        const buttons = Auth.isAdmin() ? [
            {
                label: 'Edit',
                type: 'primary',
                action: 'edit',
                handler: (modal) => {
                    UI.closeModal(modal);
                    this.editStrain(strainId);
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

        UI.showModal(`<i class="fas fa-cannabis"></i> ${strain.name}`, content, buttons);
    },

    showAddEditModal(strainId = null) {
        const strain = strainId ? this.strains.find(s => s.id === strainId) : null;
        const isEdit = !!strain;

        const fields = [
            {
                name: 'name',
                label: 'Strain Name',
                type: 'text',
                value: strain?.name || '',
                required: true,
                placeholder: 'e.g., Blue Dream'
            },
            {
                name: 'type',
                label: 'Type',
                type: 'select',
                value: strain?.type || 'Hybrid',
                options: CONFIG.STRAIN_TYPES,
                required: true
            },
            {
                name: 'vegDays',
                label: 'Vegetative Days',
                type: 'number',
                value: strain?.vegDays || 30,
                required: true,
                placeholder: '30'
            },
            {
                name: 'flowerDays',
                label: 'Flowering Days',
                type: 'number',
                value: strain?.flowerDays || 60,
                required: true,
                placeholder: '60'
            },
            {
                name: 'thcPercent',
                label: 'THC %',
                type: 'number',
                value: strain?.thcPercent || 0,
                required: true,
                placeholder: '20.5'
            },
            {
                name: 'cbdPercent',
                label: 'CBD %',
                type: 'number',
                value: strain?.cbdPercent || 0,
                required: true,
                placeholder: '0.5'
            },
            {
                name: 'effects',
                label: 'Effects',
                type: 'multiselect',
                value: strain?.effects || [],
                options: this.effects
            },
            {
                name: 'terpenes',
                label: 'Terpenes',
                type: 'multiselect',
                value: strain?.terpenes || [],
                options: this.terpenes
            },
            {
                name: 'useCases',
                label: 'Medical Use Cases',
                type: 'multiselect',
                value: strain?.useCases || [],
                options: this.useCases
            },
            {
                name: 'notes',
                label: 'Notes',
                type: 'textarea',
                value: strain?.notes || '',
                placeholder: 'Additional notes about this strain...'
            }
        ];

        const title = isEdit ? `<i class="fas fa-edit"></i> Edit Strain` : `<i class="fas fa-plus"></i> Add New Strain`;

        UI.showFormModal(title, fields, async (formData) => {
            const strainData = {
                id: strain?.id || Utils.generateId('STR'),
                name: formData.name,
                type: formData.type,
                vegDays: parseInt(formData.vegDays),
                flowerDays: parseInt(formData.flowerDays),
                thcPercent: parseFloat(formData.thcPercent),
                cbdPercent: parseFloat(formData.cbdPercent),
                effects: Array.isArray(formData.effects) ? formData.effects : [],
                terpenes: Array.isArray(formData.terpenes) ? formData.terpenes : [],
                useCases: Array.isArray(formData.useCases) ? formData.useCases : [],
                notes: formData.notes || '',
                _rowIndex: strain?._rowIndex
            };

            try {
                if (isEdit) {
                    await DataStore.updateStrain(strainData);
                    UI.showToast('Strain updated successfully', 'success');
                } else {
                    await DataStore.addStrain(strainData);
                    UI.showToast('Strain added successfully', 'success');
                }

                await this.loadData();
                this.render();
            } catch (error) {
                throw new Error('Failed to save strain: ' + error.message);
            }
        });
    },

    editStrain(strainId) {
        this.showAddEditModal(strainId);
    }
};
