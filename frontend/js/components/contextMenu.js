class ContextMenuComponent {
    constructor() {
        this.menu = document.getElementById('context-menu');
        this.items = [];
        this.isOpen = false;
        
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target)) {
                this.close();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    show(x, y, items) {
        this.items = items;
        this.menu.innerHTML = '';
        
        items.forEach((item) => {
            if (item === 'separator') {
                const hr = document.createElement('hr');
                this.menu.appendChild(hr);
                return;
            }
            
            const div = document.createElement('div');
            div.className = `context-menu-item${item.danger ? ' danger' : ''}`;
            div.innerHTML = `
                <i class="fas ${item.icon || 'fa-circle'}"></i>
                <span>${item.label}</span>
            `;
            
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
                if (item.action) {
                    item.action();
                }
            });
            
            this.menu.appendChild(div);
        });
        
        const menuWidth = this.menu.offsetWidth || 200;
        const menuHeight = this.menu.offsetHeight || 200;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = x;
        let top = y;
        
        if (x + menuWidth > viewportWidth) {
            left = viewportWidth - menuWidth - 10;
        }
        if (y + menuHeight > viewportHeight) {
            top = viewportHeight - menuHeight - 10;
        }
        
        this.menu.style.left = `${Math.max(10, left)}px`;
        this.menu.style.top = `${Math.max(10, top)}px`;
        this.menu.classList.add('show');
        this.isOpen = true;
    }

    close() {
        this.menu.classList.remove('show');
        this.isOpen = false;
    }

    isOpen() {
        return this.isOpen;
    }
}

window.contextMenu = new ContextMenuComponent();
