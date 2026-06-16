class VideoPage {
    constructor() {
        this.container = document.getElementById('page-content');
        this.currentPath = '';
        this.videos = [];
    }

    async render(params = {}) {
        this.currentPath = params.path || '';

        this.container.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-film"></i> Video Center</h2>
                <div class="page-actions">
                    <button class="btn btn-sm btn-outline" id="video-back">
                        <i class="fas fa-arrow-left"></i> Kembali
                    </button>
                </div>
            </div>
            <div id="video-content">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;

        document.getElementById('video-back').addEventListener('click', () => {
            window.history.back();
        });

        await this.loadVideos();
    }

    async loadVideos() {
        try {
            const result = await api.listFiles(this.currentPath);
            this.videos = (result.files || []).filter(f => isVideoFile(f.name));
            
            const content = document.getElementById('video-content');
            
            if (this.videos.length === 0) {
                content.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-film"></i>
                        <h3>Tidak ada video</h3>
                        <p>Folder ini tidak memiliki file video</p>
                    </div>
                `;
                return;
            }

            let html = '<div class="file-grid">';
            this.videos.forEach(video => {
                html += `
                    <div class="file-card" data-path="${video.path}">
                        <div class="icon">
                            <i class="fas fa-film" style="color:#ef4444;"></i>
                        </div>
                        <div class="name">${escapeHtml(video.name)}</div>
                        <div class="size">${formatFileSize(video.size)}</div>
                        <button class="btn btn-sm btn-primary" style="margin-top:8px;" onclick="window.playVideo('${video.path}','${escapeHtml(video.name)}')">
                            <i class="fas fa-play"></i> Putar
                        </button>
                    </div>
                `;
            });
            html += '</div>';
            content.innerHTML = html;

            // Click to play
            content.querySelectorAll('.file-card').forEach(card => {
                card.addEventListener('dblclick', () => {
                    const path = card.dataset.path;
                    const video = this.videos.find(v => v.path === path);
                    if (video) {
                        player.playVideo(path, video.name);
                    }
                });
            });

        } catch (error) {
            document.getElementById('video-content').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Gagal memuat video</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

// Helper untuk play video dari HTML
window.playVideo = function(path, name) {
    player.playVideo(path, name);
};

window.videoPage = new VideoPage();
