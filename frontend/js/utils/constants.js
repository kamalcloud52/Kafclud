// TIDAK ADA URL DI SINI!
// Semua URL diambil dari environment variable Cloudflare Pages

const APP = {
    NAME: 'Kafa Cloud',
    VERSION: '2.0.0',
    STORAGE_KEYS: {
        TOKEN: 'kafa_token',
        THEME: 'kafa_theme',
        USER: 'kafa_user'
    }
};

// FILE TYPES
const FILE_TYPES = {
    VIDEO: ['mp4', 'webm', 'mkv', 'avi', 'mov'],
    AUDIO: ['mp3', 'aac', 'm4a', 'ogg', 'wav', 'flac'],
    IMAGE: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'ico'],
    PDF: ['pdf'],
    DOCUMENT: ['doc', 'docx', 'txt', 'md', 'rtf'],
    SPREADSHEET: ['xls', 'xlsx', 'csv'],
    PRESENTATION: ['ppt', 'pptx'],
    ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz']
};

const FILE_ICONS = {
    folder: 'fa-folder',
    video: 'fa-film',
    audio: 'fa-music',
    image: 'fa-image',
    pdf: 'fa-file-pdf',
    document: 'fa-file-alt',
    spreadsheet: 'fa-file-excel',
    presentation: 'fa-file-powerpoint',
    archive: 'fa-file-archive',
    default: 'fa-file'
};

// Export ke global
window.APP = APP;
window.FILE_TYPES = FILE_TYPES;
window.FILE_ICONS = FILE_ICONS;
