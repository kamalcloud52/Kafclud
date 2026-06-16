class SettingsPage {
    constructor() {
        this.container = document.getElementById('page-content');
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-cog"></i> Settings</h2>
            </div>
            <div style="max-width:600px;">
                <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius);padding:24px;margin-bottom:16px;">
                    <h3 style="margin-bottom:16px;">Ubah Password</h3>
                    <form id="password-form">
                        <div class="form-group">
                            <label for="current-password">Password Saat Ini</label>
                            <input type="password" id="current-password" placeholder="Masukkan password saat ini" required />
                        </div>
                        <div class="form-group">
                            <label for="new-password">Password Baru</label>
                            <input type="password" id="new-password" placeholder="Masukkan password baru" required />
                        </div>
                        <div class="form-group">
                            <label for="confirm-password">Konfirmasi Password Baru</label>
                            <input type="password" id="confirm-password" placeholder="Konfirmasi password baru" required />
                        </div>
                        <button type="submit" class="btn btn-primary">Ubah Password</button>
                    </form>
                </div>

                <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius);padding:24px;margin-bottom:16px;">
                    <h3 style="margin-bottom:16px;">Akun</h3>
                    <p><strong>Username:</strong> <span id="settings-username">${auth.getUser()?.username || '-'}</span></p>
                    <p><strong>Role:</strong> <span id="settings-role">${auth.getUser()?.role || '-'}</span></p>
                    <button class="btn btn-danger" id="logout-settings-btn" style="margin-top:12px;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>

                <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius);padding:24px;">
                    <h3 style="margin-bottom:16px;">Tentang</h3>
                    <p><strong>Kafa Cloud</strong> v2.0</p>
                    <p style="color:var(--text-muted);font-size:14px;">Cloud storage pribadi self-hosted</p>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const form = document.getElementById('password-form');
        const currentPass = document.getElementById('current-password');
        const newPass = document.getElementById('new-password');
        const confirmPass = document.getElementById('confirm-password');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (newPass.value !== confirmPass.value) {
                toast.error('Password baru dan konfirmasi tidak cocok');
                return;
            }

            if (newPass.value.length < 4) {
                toast.error('Password minimal 4 karakter');
                return;
            }

            try {
                await api.changePassword(currentPass.value, newPass.value);
                toast.success('Password berhasil diubah');
                form.reset();
            } catch (error) {
                toast.error('Gagal ubah password: ' + error.message);
            }
        });

        document.getElementById('logout-settings-btn').addEventListener('click', () => {
            auth.logout();
        });
    }
}

window.settingsPage = new SettingsPage();
