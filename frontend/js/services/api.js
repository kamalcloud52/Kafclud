class ApiService {
    constructor() {
        // AMBIL dari window yang di-set oleh Cloudflare Pages
        // TIDAK ADA HARDCODE!
        this.baseUrl = window.API_BASE_URL || 'http://localhost:3000/api';
        this.token = localStorage.getItem(APP.STORAGE_KEYS.TOKEN);
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem(APP.STORAGE_KEYS.TOKEN, token);
        } else {
            localStorage.removeItem(APP.STORAGE_KEYS.TOKEN);
        }
    }

    getToken() {
        return this.token;
    }

    getHeaders(includeContentType = true) {
        const headers = {};
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(!(options.body instanceof FormData)),
                ...(options.headers || {})
            }
        };

        if (config.body && config.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        try {
            const response = await fetch(url, config);
            
            if (options.responseType === 'blob') {
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Request failed');
                }
                return response;
            }

            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 401) {
                    this.setToken(null);
                    window.location.href = '/login';
                }
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                throw new Error('Koneksi ke server gagal');
            }
            throw error;
        }
    }

    // Auth
    async login(username, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        this.setToken(data.token);
        localStorage.setItem(APP.STORAGE_KEYS.USER, JSON.stringify(data.user));
        return data;
    }

    async logout() {
        this.setToken(null);
        localStorage.removeItem(APP.STORAGE_KEYS.USER);
    }

    async verifyToken() {
        return this.request('/auth/verify', { method: 'GET' });
    }

    // Files
    async listFiles(path = '') {
        return this.request(`/files/list?path=${encodeURIComponent(path)}`, { method: 'GET' });
    }

    async getFileInfo(path) {
        return this.request(`/files/info?path=${encodeURIComponent(path)}`, { method: 'GET' });
    }

    async uploadFile(file, path = '', onProgress) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', path);

        const token = this.getToken();
        const xhr = new XMLHttpRequest();
        
        return new Promise((resolve, reject) => {
            xhr.open('POST', `${this.baseUrl}/files/upload`);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            
            if (onProgress) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        onProgress(e.loaded / e.total);
                    }
                });
            }
            
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        reject(new Error(data.error || 'Upload failed'));
                    } catch {
                        reject(new Error('Upload failed'));
                    }
                }
            };
            
            xhr.onerror = () => reject(new Error('Upload failed'));
            xhr.send(formData);
        });
    }

    async createFolder(path) {
        return this.request('/files/folder', {
            method: 'POST',
            body: JSON.stringify({ path })
        });
    }

    async deleteItem(path) {
        return this.request('/files/delete', {
            method: 'DELETE',
            body: JSON.stringify({ path })
        });
    }

    async renameItem(path, name) {
        return this.request('/files/rename', {
            method: 'PUT',
            body: JSON.stringify({ path, name })
        });
    }

    async moveItem(source, destination) {
        return this.request('/files/move', {
            method: 'POST',
            body: JSON.stringify({ source, destination })
        });
    }

    async copyItem(source, destination) {
        return this.request('/files/copy', {
            method: 'POST',
            body: JSON.stringify({ source, destination })
        });
    }

    async downloadFile(path) {
        return this.request(`/files/download?path=${encodeURIComponent(path)}`, {
            method: 'GET',
            responseType: 'blob'
        });
    }

    async getStorageStats() {
        return this.request('/files/stats', { method: 'GET' });
    }

    // Media
    getVideoUrl(path) {
        // TAMBAHKAN token ke URL untuk autentikasi
        const token = this.getToken();
        return `${this.baseUrl}/media/video?path=${encodeURIComponent(path)}&token=${token}`;
    }

    getAudioUrl(path) {
        const token = this.getToken();
        return `${this.baseUrl}/media/audio?path=${encodeURIComponent(path)}&token=${token}`;
    }

   getThumbnailUrl(path) {
    const token = this.getToken();
    return `${this.baseUrl}/media/thumbnail?path=${encodeURIComponent(path)}&token=${token}`;
   }

    // User
    async getProfile() {
        return this.request('/user/profile', { method: 'GET' });
    }

    async changePassword(currentPassword, newPassword) {
        return this.request('/user/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    // Admin
    async getUsers() {
        return this.request('/admin/users', { method: 'GET' });
    }

    async createUser(username, password, role = 'user') {
        return this.request('/admin/users', {
            method: 'POST',
            body: JSON.stringify({ username, password, role })
        });
    }

    async deleteUser(id) {
        return this.request(`/admin/users/${id}`, { method: 'DELETE' });
    }

    async resetUserPassword(id, newPassword) {
        return this.request(`/admin/users/${id}/reset`, {
            method: 'PUT',
            body: JSON.stringify({ newPassword })
        });
    }

    async getUserStats(id) {
        return this.request(`/admin/users/${id}/stats`, { method: 'GET' });
    }
}

// Buat instance global
window.api = new ApiService();
