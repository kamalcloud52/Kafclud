class LoginPage {
    constructor() {
        this.container = document.getElementById('page-content');
    }

    render() {
        // Cek apakah sudah login
        if (auth.isAuthenticated()) {
            window.location.href = '/';
            return;
        }

        this.container.innerHTML = `
            <div class="login-page">
                <div class="login-card">
                    <div class="logo">
                        <i class="fas fa-cloud"></i>
                    </div>
                    <h1>Kafa Cloud</h1>
                    <p class="subtitle">Masuk ke akun Anda</p>
                    
                    <form id="login-form">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" placeholder="Masukkan username" required autofocus />
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" placeholder="Masukkan password" required />
                        </div>
                        
                        <div id="login-error" class="error-message"></div>
                        
                        <button type="submit" class="btn btn-primary btn-block btn-lg" id="login-btn">
                            <span id="login-text">Masuk</span>
                            <span id="login-spinner" class="loading-spinner" style="display:none;"></span>
                        </button>
                    </form>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const form = document.getElementById('login-form');
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        const errorEl = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');
        const btnText = document.getElementById('login-text');
        const spinner = document.getElementById('login-spinner');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user = username.value.trim();
            const pass = password.value.trim();

            if (!user || !pass) {
                errorEl.textContent = 'Username dan password harus diisi';
                errorEl.style.display = 'block';
                return;
            }

            btn.disabled = true;
            btnText.textContent = 'Memproses...';
            spinner.style.display = 'inline-block';
            errorEl.style.display = 'none';

            try {
                const result = await auth.login(user, pass);
                
                if (result.user) {
                    toast.success('Login berhasil!');
                    window.location.href = '/';
                } else {
                    errorEl.textContent = 'Login gagal, silahkan coba lagi';
                    errorEl.style.display = 'block';
                }
            } catch (error) {
                errorEl.textContent = error.message || 'Username atau password salah';
                errorEl.style.display = 'block';
            } finally {
                btn.disabled = false;
                btnText.textContent = 'Masuk';
                spinner.style.display = 'none';
            }
        });

        password.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                form.dispatchEvent(new Event('submit'));
            }
        });
    }
}

// Override login page
window.loginPage = new LoginPage();
