// UI Helper Functions
const UI = {
    // Show toast notification
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type]} toast-icon"></i>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

        container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Show modal
    showModal(title, content, buttons = []) {
        const container = document.getElementById('modal-container');

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';

        const buttonsHtml = buttons.map(btn => {
            const btnClass = btn.type || 'secondary';
            return `<button class="btn btn-${btnClass}" data-action="${btn.action}">${btn.label}</button>`;
        }).join('');

        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" data-action="close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttons.length > 0 ? `
                    <div class="modal-footer">
                        ${buttonsHtml}
                    </div>
                ` : ''}
            </div>
        `;

        container.appendChild(modal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });

        // Handle button clicks
        modal.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;

                if (action === 'close') {
                    this.closeModal(modal);
                } else {
                    // Find button config and call handler
                    const buttonConfig = buttons.find(b => b.action === action);
                    if (buttonConfig && buttonConfig.handler) {
                        buttonConfig.handler(modal);
                    }
                }
            });
        });

        return modal;
    },

    // Close modal
    closeModal(modal) {
        if (typeof modal === 'string') {
            modal = document.querySelector(modal);
        }
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s';
            setTimeout(() => modal.remove(), 300);
        }
    },

    // Show form modal
    showFormModal(title, fields, onSubmit) {
        const formHtml = `
            <form id="modal-form" class="modal-form">
                ${fields.map(field => this.renderFormField(field)).join('')}
            </form>
        `;

        const modal = this.showModal(title, formHtml, [
            {
                label: 'Cancel',
                type: 'secondary',
                action: 'close'
            },
            {
                label: 'Save',
                type: 'primary',
                action: 'submit',
                handler: async (modal) => {
                    const form = modal.querySelector('#modal-form');
                    if (form.checkValidity()) {
                        const formData = this.getFormData(form);
                        try {
                            await onSubmit(formData);
                            this.closeModal(modal);
                        } catch (error) {
                            this.showToast(error.message, 'error');
                        }
                    } else {
                        form.reportValidity();
                    }
                }
            }
        ]);

        // Handle form submit
        const form = modal.querySelector('#modal-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            modal.querySelector('[data-action="submit"]').click();
        });

        return modal;
    },

    // Render form field
    renderFormField(field) {
        const {
            name,
            label,
            type = 'text',
            value = '',
            options = [],
            required = false,
            placeholder = '',
            help = '',
            multiple = false,
            rows = 3
        } = field;

        let inputHtml = '';

        switch (type) {
            case 'select':
                inputHtml = `
                    <select id="${name}" name="${name}" ${required ? 'required' : ''} ${multiple ? 'multiple' : ''}>
                        <option value="">Select ${label}...</option>
                        ${options.map(opt => {
                            const optValue = typeof opt === 'string' ? opt : opt.value;
                            const optLabel = typeof opt === 'string' ? opt : opt.label;
                            const selected = value === optValue ? 'selected' : '';
                            return `<option value="${optValue}" ${selected}>${optLabel}</option>`;
                        }).join('')}
                    </select>
                `;
                break;

            case 'textarea':
                inputHtml = `
                    <textarea id="${name}" name="${name}" rows="${rows}"
                        placeholder="${placeholder}" ${required ? 'required' : ''}>${value}</textarea>
                `;
                break;

            case 'multiselect':
                inputHtml = `
                    <div class="multiselect-container" id="${name}-container">
                        ${options.map(opt => {
                            const optValue = typeof opt === 'string' ? opt : opt.value;
                            const optLabel = typeof opt === 'string' ? opt : opt.label;
                            const checked = Array.isArray(value) && value.includes(optValue) ? 'checked' : '';
                            return `
                                <label class="checkbox-label">
                                    <input type="checkbox" name="${name}" value="${optValue}" ${checked}>
                                    <span>${optLabel}</span>
                                </label>
                            `;
                        }).join('')}
                    </div>
                `;
                break;

            case 'number':
                inputHtml = `
                    <input type="number" id="${name}" name="${name}" value="${value}"
                        placeholder="${placeholder}" ${required ? 'required' : ''}>
                `;
                break;

            case 'date':
                inputHtml = `
                    <input type="date" id="${name}" name="${name}" value="${value}"
                        ${required ? 'required' : ''}>
                `;
                break;

            default:
                inputHtml = `
                    <input type="${type}" id="${name}" name="${name}" value="${value}"
                        placeholder="${placeholder}" ${required ? 'required' : ''}>
                `;
        }

        return `
            <div class="form-group">
                <label for="${name}">${label} ${required ? '<span style="color: red;">*</span>' : ''}</label>
                ${inputHtml}
                ${help ? `<small>${help}</small>` : ''}
            </div>
        `;
    },

    // Get form data
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};

        // Handle regular inputs
        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                // Multiple values (checkboxes)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        // Handle checkboxes that might have no selection
        form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            const name = cb.name;
            if (!data[name]) {
                data[name] = [];
            }
        });

        return data;
    },

    // Show confirm dialog
    showConfirm(title, message, onConfirm) {
        const content = `<p>${message}</p>`;

        this.showModal(title, content, [
            {
                label: 'Cancel',
                type: 'secondary',
                action: 'close'
            },
            {
                label: 'Confirm',
                type: 'danger',
                action: 'confirm',
                handler: async (modal) => {
                    await onConfirm();
                    this.closeModal(modal);
                }
            }
        ]);
    },

    // Show loading overlay
    showLoading(message = 'Loading...') {
        const loading = document.getElementById('loading-screen');
        if (loading) {
            loading.querySelector('p').textContent = message;
            loading.classList.remove('hidden');
        }
    },

    // Hide loading overlay
    hideLoading() {
        const loading = document.getElementById('loading-screen');
        if (loading) {
            loading.classList.add('hidden');
        }
    },

    // Render empty state
    renderEmptyState(container, icon, message) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas ${icon}"></i>
                <p>${message}</p>
            </div>
        `;
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Format percentage
    formatPercent(value) {
        return `${parseFloat(value).toFixed(1)}%`;
    },

    // Truncate text
    truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
};

// Add CSS for multiselect
const style = document.createElement('style');
style.textContent = `
    .multiselect-container {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        padding: 0.5rem;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        padding: 0.5rem;
        cursor: pointer;
        border-radius: 4px;
        transition: var(--transition);
    }

    .checkbox-label:hover {
        background: var(--bg-tertiary);
    }

    .checkbox-label input {
        margin-right: 0.5rem;
        width: auto;
    }

    .modal-form {
        max-height: 60vh;
        overflow-y: auto;
    }

    @keyframes fadeOut {
        to {
            opacity: 0;
        }
    }

    @keyframes slideOutRight {
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
