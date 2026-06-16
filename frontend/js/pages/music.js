class MusicPage {
    constructor() {
        this.container = document.getElementById('page-content');
        this.currentPath = '';
        this.audios = [];
    }

    async render(params = {}) {
        this.currentPath = params.path || '';

        this.container.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-music"></i> Music Center</h2>
                <div class="page-actions">
                    <button class="btn btn-sm btn-outline" id="music-back">
                        <i class="fas fa-arrow-left"></i> Kembali
                    </button>
                    <button class="btn btn-sm btn-primary" id="play-all-btn">
                        <i class="fas fa-play"></i> Putar Semua
                    </button>
                </div>
            </div>
            <div id="music-content">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;

        document.getElementById('music-back').addEventListener('click', () => {
            window.history.back();
        });

        document.getElementById('play-all-btn').addEventListener('click', () => {
            if (this.audios.length > 0) {
                player.addMultipleToPlaylist(this.audios);
                player.loadTrack(0);
                toast.success(`${this.audios.length} lagu ditambahkan ke playlist`);
            }
        });

        await this.loadMusic();
    }

    async loadMusic() {
        try {
            const result = await api.listFiles(this.currentPath);
            this.audios = (result.files || []).filter(f => isAudioFile(f.name));
            
            const content = document.getElementById('music-content');
            
            if (this.audios.length === 0) {
                content.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-music"></i>
                        <h3>Tidak ada audio</h3>
                        <p>Folder ini tidak memiliki file audio</p>
                    </div>
                `;
                return;
            }

            let html = '<div class="file-list">';
            html += `
                <div class="file-list-header">
                    <div>#</div>
                    <div>Nama Lagu</div>
                    <div>Ukuran</div>
                    <div>Action</div>
                </div>
            `;

            this.audios.forEach((audio, index) => {
                html += `
                    <div class="file-list-item" data-path="${audio.path}">
                        <div>${index + 1}</div>
                        <div class="name">
                            <i class="fas fa-music" style="color:#8b5cf6;"></i>
                            <span>${escapeHtml(audio.name)}</span>
                        </div>
                        <div>${formatFileSize(audio.size)}</div>
                        <div>
                            <button class="btn btn-sm btn-primary" onclick="window.playMusic('${audio.path}','${escapeHtml(audio.name)}')">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="window.addToPlaylist('${audio.path}','${escapeHtml(audio.name)}')">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            content.innerHTML = html;

        } catch (error) {
            document.getElementById('music-content').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Gagal memuat musik</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

window.playMusic = function(path, name) {
    player.playMusic(path, name);
};

window.addToPlaylist = function(path, name) {
    player.addToPlaylist(path, name);
    toast.success(`"${name}" ditambahkan ke playlist`);
};

window.musicPage = new MusicPage();
