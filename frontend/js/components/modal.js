class ModalComponent {
    constructor() {
        this.container = document.getElementById('modal-container');
        this.activeModal = null;
    }

    show(options = {}) {
        const {
            title = '',
            content = '',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            showCancel = true,
            onConfirm = null,
            onCancel = null,
            size = 'md',
            closeOnOutside = true
        } = options;

        this.close();

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = `modal modal-${size}`;
        
        modal.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${showCancel || onConfirm ? `
            <div class="modal-footer">
                ${showCancel ? `<button class="btn modal-cancel">${cancelText}</button>` : ''}
                ${onConfirm ? `<button class="btn btn-primary modal-confirm">${confirmText}</button>` : ''}
            </div>
            ` : ''}
        `;
        
        overlay.appendChild(modal);
        this.container.appendChild(overlay);
        
        this.activeModal = { overlay, modal, onConfirm, onCancel };

        modal.querySelector('.modal-close').addEventListener('click', () => this.close());

        const cancelBtn = modal.querySelector('.modal-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (onCancel) onCancel();
                this.close();
            });
        }

        const confirmBtn = modal.querySelector('.modal-confirm');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (onConfirm) {
                    const result = onConfirm();
                    if (result !== false) {
                        this.close();
                    }
                } else {
                    this.close();
                }
            });
        }

        if (closeOnOutside) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }

        return this;
    }

    close() {
        if (this.activeModal) {
            this.activeModal.overlay.remove();
            this.activeModal = null;
        }
        return this;
    }

    confirm(message, title = 'Konfirmasi') {
        return new Promise((resolve) => {
            this.show({
                title,
                content: `<p>${message}</p>`,
                confirmText: 'Ya',
                cancelText: 'Batal',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }

    prompt(message, defaultValue = '') {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'w-full';
            input.value = defaultValue;
            input.placeholder = message;
            
            this.show({
                title: 'Input',
                content: `<p>${message}</p><div class="mt-8"></div>`,
                confirmText: 'OK',
                cancelText: 'Batal',
                onConfirm: () => resolve(input.value),
                onCancel: () => resolve(null)
            });
            
            const body = this.activeModal.modal.querySelector('.modal-body');
            body.appendChild(input);
            setTimeout(() => input.focus(), 100);
        });
    }

    alert(message, title = 'Informasi') {
        return new Promise((resolve) => {
            this.show({
                title,
                content: `<p>${message}</p>`,
                confirmText: 'OK',
                showCancel: false,
                onConfirm: () => resolve(true)
            });
        });
    }
}

window.modal = new ModalComponent();
