// Dashboard Module
const Dashboard = {
    data: {
        strains: [],
        bays: [],
        trays: [],
        plants: []
    },

    async init() {
        await this.loadData();
        this.render();
    },

    async loadData() {
        try {
            UI.showLoading('Loading dashboard data...');

            [this.data.strains, this.data.bays, this.data.trays, this.data.plants] = await Promise.all([
                DataStore.getStrains(),
                DataStore.getBays(),
                DataStore.getTrays(),
                DataStore.getPlants()
            ]);

            UI.hideLoading();
        } catch (error) {
            UI.hideLoading();
            UI.showToast('Failed to load dashboard data', 'error');
            console.error(error);
        }
    },

    render() {
        this.renderStats();
        this.renderActiveGrows();
        this.renderUpcomingHarvests();

        if (Auth.canEdit()) {
            this.renderEnvironmentalStatus();
        }
    },

    renderStats() {
        // Total plants
        const totalPlants = this.data.plants.filter(p => p.stage !== 'harvested').length;
        document.getElementById('stat-total-plants').textContent = totalPlants;

        // Active strains (strains currently being grown)
        const activeStrainIds = new Set(this.data.plants
            .filter(p => p.stage !== 'harvested')
            .map(p => p.strainId));
        document.getElementById('stat-active-strains').textContent = activeStrainIds.size;

        // Active trays
        const activeTrays = this.data.trays.filter(t =>
            t.status !== 'empty' && t.status !== 'harvested'
        ).length;
        document.getElementById('stat-active-trays').textContent = activeTrays;

        // Upcoming harvests (within 30 days)
        const upcomingHarvests = this.getUpcomingHarvests(30).length;
        document.getElementById('stat-upcoming-harvests').textContent = upcomingHarvests;
    },

    renderActiveGrows() {
        const container = document.getElementById('active-grows-list');
        const activeTrays = this.data.trays.filter(t =>
            t.status !== 'empty' && t.status !== 'harvested'
        );

        if (activeTrays.length === 0) {
            UI.renderEmptyState(container, 'fa-seedling', 'No active grows');
            return;
        }

        container.innerHTML = activeTrays.slice(0, 10).map(tray => {
            const bay = this.data.bays.find(b => b.id === tray.bayId);
            const strainNames = tray.strainIds
                .map(id => this.data.strains.find(s => s.id === id)?.name || 'Unknown')
                .join(', ');
            const plantCount = this.data.plants.filter(p => p.trayId === tray.id && p.stage !== 'harvested').length;
            const daysActive = Utils.daysBetween(tray.dateStarted);

            const statusClass = {
                active: 'info',
                vegetative: 'success',
                flowering: 'warning'
            }[tray.status] || 'info';

            return `
                <div class="data-item">
                    <div class="data-item-header">
                        <div>
                            <div class="data-item-title">${tray.name}</div>
                            <div class="data-item-meta">
                                <i class="fas fa-warehouse"></i> ${bay?.name || 'Unknown Bay'} |
                                <i class="fas fa-cannabis"></i> ${strainNames}
                            </div>
                        </div>
                        <span class="badge badge-${statusClass}">${tray.status}</span>
                    </div>
                    <div class="data-item-meta">
                        <i class="fas fa-seedling"></i> ${plantCount} plants |
                        <i class="fas fa-calendar"></i> ${daysActive} days active
                    </div>
                </div>
            `;
        }).join('');
    },

    renderUpcomingHarvests() {
        const container = document.getElementById('upcoming-harvests-list');
        const harvests = this.getUpcomingHarvests(60);

        if (harvests.length === 0) {
            UI.renderEmptyState(container, 'fa-calendar', 'No upcoming harvests');
            return;
        }

        container.innerHTML = harvests.map(harvest => {
            const daysUntil = Utils.daysBetween(new Date(), harvest.harvestDate);
            const urgencyClass = daysUntil < 7 ? 'danger' : daysUntil < 14 ? 'warning' : 'success';

            // For client view, show less detail
            const detailHtml = Auth.isClient() ? '' : `
                <div class="data-item-meta">
                    <i class="fas fa-warehouse"></i> ${harvest.bayName} |
                    <i class="fas fa-seedling"></i> ${harvest.plantCount} plants
                </div>
            `;

            return `
                <div class="data-item">
                    <div class="data-item-header">
                        <div>
                            <div class="data-item-title">${harvest.strainName}</div>
                            ${detailHtml}
                        </div>
                        <span class="badge badge-${urgencyClass}">${daysUntil}d</span>
                    </div>
                    <div class="data-item-meta">
                        <i class="fas fa-calendar-check"></i> Est. ${Utils.formatDate(harvest.harvestDate)}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderEnvironmentalStatus() {
        const container = document.getElementById('environmental-status');

        if (this.data.bays.length === 0) {
            UI.renderEmptyState(container, 'fa-thermometer-half', 'No bays configured');
            return;
        }

        container.innerHTML = this.data.bays.map(bay => {
            const tempStatus = this.getEnvStatus(bay.temperature, CONFIG.VALIDATION.MIN_TEMP, CONFIG.VALIDATION.MAX_TEMP);
            const humidStatus = this.getEnvStatus(bay.humidity, CONFIG.VALIDATION.MIN_HUMIDITY, CONFIG.VALIDATION.MAX_HUMIDITY);

            return `
                <div class="data-item">
                    <div class="data-item-header">
                        <div class="data-item-title">${bay.name}</div>
                        <span class="badge badge-${tempStatus.class}">${tempStatus.label}</span>
                    </div>
                    <div class="data-item-meta">
                        <i class="fas fa-thermometer-half"></i> ${bay.temperature}°F
                        <span class="badge badge-${humidStatus.class}">${humidStatus.label}</span>
                        <i class="fas fa-tint"></i> ${bay.humidity}%
                    </div>
                </div>
            `;
        }).join('');
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

    getUpcomingHarvests(daysAhead) {
        const harvests = [];
        const now = new Date();
        const cutoffDate = Utils.addDays(now, daysAhead);

        // Group plants by strain
        const plantsByStrain = Utils.groupBy(
            this.data.plants.filter(p => p.stage !== 'harvested'),
            'strainId'
        );

        for (const [strainId, plants] of Object.entries(plantsByStrain)) {
            const strain = this.data.strains.find(s => s.id === strainId);
            if (!strain) continue;

            // Get the tray with the earliest start date for this strain
            const trayIds = [...new Set(plants.map(p => p.trayId))];
            const trays = trayIds.map(id => this.data.trays.find(t => t.id === id)).filter(Boolean);

            if (trays.length === 0) continue;

            const earliestTray = trays.reduce((earliest, tray) =>
                new Date(tray.dateStarted) < new Date(earliest.dateStarted) ? tray : earliest
            );

            const harvestDate = Utils.calculateHarvestDate(
                earliestTray.dateStarted,
                strain.vegDays,
                strain.flowerDays
            );

            if (harvestDate <= cutoffDate) {
                const bay = this.data.bays.find(b => b.id === earliestTray.bayId);

                harvests.push({
                    strainName: strain.name,
                    strainId: strain.id,
                    harvestDate,
                    plantCount: plants.length,
                    bayName: bay?.name || 'Unknown',
                    trayName: earliestTray.name
                });
            }
        }

        return harvests.sort((a, b) => a.harvestDate - b.harvestDate);
    },

    async refresh() {
        await this.loadData();
        this.render();
        UI.showToast('Dashboard refreshed', 'success');
    }
};
