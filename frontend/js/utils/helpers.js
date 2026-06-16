function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

function isVideoFile(filename) {
    return FILE_TYPES.VIDEO.includes(getFileExtension(filename));
}

function isAudioFile(filename) {
    return FILE_TYPES.AUDIO.includes(getFileExtension(filename));
}

function isImageFile(filename) {
    return FILE_TYPES.IMAGE.includes(getFileExtension(filename));
}

function isPDFFile(filename) {
    return FILE_TYPES.PDF.includes(getFileExtension(filename));
}

function getFileIcon(filename) {
    const ext = getFileExtension(filename);
    if (FILE_TYPES.VIDEO.includes(ext)) return FILE_ICONS.video;
    if (FILE_TYPES.AUDIO.includes(ext)) return FILE_ICONS.audio;
    if (FILE_TYPES.IMAGE.includes(ext)) return FILE_ICONS.image;
    if (FILE_TYPES.PDF.includes(ext)) return FILE_ICONS.pdf;
    if (FILE_TYPES.DOCUMENT.includes(ext)) return FILE_ICONS.document;
    if (FILE_TYPES.SPREADSHEET.includes(ext)) return FILE_ICONS.spreadsheet;
    if (FILE_TYPES.PRESENTATION.includes(ext)) return FILE_ICONS.presentation;
    if (FILE_TYPES.ARCHIVE.includes(ext)) return FILE_ICONS.archive;
    return FILE_ICONS.default;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Baru saja';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' menit lalu';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' jam lalu';
    if (diff < 604800000) return Math.floor(diff / 86400000) + ' hari lalu';
    
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return name.substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function getParentPath(path) {
    if (!path || path === '') return '';
    const parts = path.split('/');
    parts.pop();
    return parts.join('/');
}

function joinPath(...parts) {
    return parts.filter(p => p).join('/');
}

function getFileName(path) {
    const parts = path.split('/');
    return parts[parts.length - 1] || '';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
}

function toggleTheme() {
    const current = isDarkMode();
    const theme = current ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(APP.STORAGE_KEYS.THEME, theme);
    updateThemeIcon(!current);
}

function updateThemeIcon(isDark) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function loadTheme() {
    const saved = localStorage.getItem(APP.STORAGE_KEYS.THEME);
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
        updateThemeIcon(saved === 'dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon(true);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export ke global
window.getFileExtension = getFileExtension;
window.isVideoFile = isVideoFile;
window.isAudioFile = isAudioFile;
window.isImageFile = isImageFile;
window.isPDFFile = isPDFFile;
window.getFileIcon = getFileIcon;
window.formatFileSize = formatFileSize;
window.formatDate = formatDate;
window.getInitials = getInitials;
window.truncateText = truncateText;
window.getParentPath = getParentPath;
window.joinPath = joinPath;
window.getFileName = getFileName;
window.debounce = debounce;
window.isDarkMode = isDarkMode;
window.toggleTheme = toggleTheme;
window.updateThemeIcon = updateThemeIcon;
window.loadTheme = loadTheme;
window.escapeHtml = escapeHtml;
