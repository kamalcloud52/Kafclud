class AdminPage {
    constructor() {
        this.container = document.getElementById('page-content');
    }

    async render() {
        if (!auth.requireAdmin()) return;

        this.container.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-users-cog"></i> Admin Panel</h2>
                <div class="page-actions">
                    <button class="btn btn-primary" id="add-user-btn">
                        <i class="fas fa-user-plus"></i> Tambah User
                    </button>
                </div>
            </div>
            <div id="admin-content">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;

        document.getElementById('add-user-btn').addEventListener('click', () => {
            this.showAddUserModal();
        });

        await this.loadUsers();
    }

    async loadUsers() {
        try {
            const data = await api.getUsers();
            const content = document.getElementById('admin-content');

            if (!data.users || data.users.length === 0) {
                content.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>Belum ada user</h3>
                        <p>Tambahkan user baru untuk berbagi akses</p>
                    </div>
                `;
                return;
            }

            let html = '';
            for (const user of data.users) {
                let stats = { used: 0, fileCount: 0 };
                try {
                    const userStats = await api.getUserStats(user.id);
                    stats = userStats;
                } catch (e) {}

                html += `
                    <div class="user-list-item">
                        <div class="user-info">
                            <div class="avatar">${getInitials(user.username)}</div>
                            <div class="details">
                                <div class="name">${escapeHtml(user.username)}</div>
                                <div class="role">
                                    ${user.role === 'admin' ? '<span class="text-warning">Admin</span>' : 'User'}
                                    ${user.role === 'admin' ? ' <span style="font-size:11px;color:var(--text-muted);">(tidak bisa dihapus)</span>' : ''}
                                </div>
                                <div style="font-size:12px;color:var(--text-muted);">
                                    Storage: ${formatFileSize(stats.used)} | File: ${stats.fileCount}
                                </div>
                            </div>
                        </div>
                        <div class="user-actions">
                            ${user.role !== 'admin' ? `
                                <button class="btn btn-sm btn-outline" onclick="window.resetUserPassword('${user.id}')">
                                    <i class="fas fa-key"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="window.deleteUser('${user.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }

            content.innerHTML = html;

        } catch (error) {
            document.getElementById('admin-content').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Gagal memuat user</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    showAddUserModal() {
        const modalHtml = `
            <form id="add-user-form">
                <div class="form-group">
                    <label for="new-username">Username</label>
                    <input type="text" id="new-username" placeholder="Masukkan username" required />
                </div>
                <div class="form-group">
                    <label for="new-password">Password</label>
                    <input type="password" id="new-password" placeholder="Masukkan password" required />
                </div>
                <div class="form-group">
                    <label for="new-role">Role</label>
                    <select id="new-role">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </form>
        `;

        modal.show({
            title: 'Tambah User Baru',
            content: modalHtml,
            confirmText: 'Tambah',
            cancelText: 'Batal',
            onConfirm: async () => {
                const username = document.getElementById('new-username').value.trim();
                const password = document.getElementById('new-password').value.trim();
                const role = document.getElementById('new-role').value;

                if (!username || !password) {
                    toast.error('Username dan password harus diisi');
                    return false;
                }

                try {
                    await api.createUser(username, password, role);
                    toast.success(`User "${username}" berhasil ditambahkan`);
                    this.loadUsers();
                    return true;
                } catch (error) {
                    toast.error('Gagal tambah user: ' + error.message);
                    return false;
                }
            }
        });
    }
}

// Global functions for admin actions
window.deleteUser = async function(id) {
    const confirmed = await modal.confirm('Yakin ingin menghapus user ini? Semua file user akan terhapus.');
    if (confirmed) {
        try {
            await api.deleteUser(id);
            toast.success('User berhasil dihapus');
            adminPage.loadUsers();
        } catch (error) {
            toast.error('Gagal hapus user: ' + error.message);
        }
    }
};

window.resetUserPassword = async function(id) {
    const newPassword = await modal.prompt('Masukkan password baru:');
    if (newPassword && newPassword.length >= 4) {
        try {
            await api.resetUserPassword(id, newPassword);
            toast.success('Password berhasil direset');
        } catch (error) {
            toast.error('Gagal reset password: ' + error.message);
        }
    } else if (newPassword !== null) {
        toast.error('Password minimal 4 karakter');
    }
};

window.adminPage = new AdminPage();
