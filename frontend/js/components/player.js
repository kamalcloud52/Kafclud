class PlayerComponent {
    constructor() {
        this.videoPlayer = document.getElementById('video-player');
        this.videoElement = document.getElementById('video-element');
        this.videoTitle = document.getElementById('video-title');
        this.videoClose = document.getElementById('video-close');
        this.videoPlay = document.getElementById('video-play');
        this.videoTime = document.getElementById('video-time');
        this.videoProgress = document.getElementById('video-progress');
        this.videoVolume = document.getElementById('video-volume');
        this.videoVolumeSlider = document.getElementById('video-volume-slider');
        this.videoSpeed = document.getElementById('video-speed');
        this.videoFullscreen = document.getElementById('video-fullscreen');

        // Music
        this.musicPlayer = document.getElementById('music-player');
        this.musicTitle = document.getElementById('music-title');
        this.musicArtist = document.getElementById('music-artist');
        this.musicPlayBtn = document.getElementById('music-play-btn');
        this.musicPrev = document.getElementById('music-prev');
        this.musicNext = document.getElementById('music-next');
        this.musicShuffle = document.getElementById('music-shuffle');
        this.musicRepeat = document.getElementById('music-repeat');
        this.musicProgress = document.getElementById('music-progress-slider');
        this.musicCurrentTime = document.getElementById('music-current-time');
        this.musicDuration = document.getElementById('music-duration');
        this.musicVolume = document.getElementById('music-volume-slider');
        this.musicPlaylistToggle = document.getElementById('music-playlist-toggle');
        this.musicPlaylist = document.getElementById('music-playlist');
        this.playlistItems = document.getElementById('playlist-items');
        this.playlistClear = document.getElementById('playlist-clear');

        this.audio = new Audio();
        this.playlist = [];
        this.currentIndex = -1;
        this.isShuffled = false;
        this.repeatMode = 'none'; // none, one, all
        this.isPlaying = false;

        this.initVideo();
        this.initMusic();
    }

    initVideo() {
        this.videoClose.addEventListener('click', () => this.closeVideo());
        
        this.videoPlay.addEventListener('click', () => {
            if (this.videoElement.paused) {
                this.videoElement.play();
                this.videoPlay.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                this.videoElement.pause();
                this.videoPlay.innerHTML = '<i class="fas fa-play"></i>';
            }
        });

        this.videoElement.addEventListener('timeupdate', () => {
            const percent = (this.videoElement.currentTime / this.videoElement.duration) * 100;
            this.videoProgress.value = percent;
            this.videoTime.textContent = `${this.formatTime(this.videoElement.currentTime)} / ${this.formatTime(this.videoElement.duration)}`;
        });

        this.videoProgress.addEventListener('input', () => {
            const time = (this.videoProgress.value / 100) * this.videoElement.duration;
            this.videoElement.currentTime = time;
        });

        this.videoVolume.addEventListener('click', () => {
            this.videoElement.muted = !this.videoElement.muted;
            this.videoVolume.innerHTML = this.videoElement.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
        });

        this.videoVolumeSlider.addEventListener('input', () => {
            this.videoElement.volume = this.videoVolumeSlider.value / 100;
        });

        let speed = 1;
        this.videoSpeed.addEventListener('click', () => {
            const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
            const currentIndex = speeds.indexOf(speed);
            speed = speeds[(currentIndex + 1) % speeds.length];
            this.videoElement.playbackRate = speed;
            this.videoSpeed.textContent = `${speed}x`;
        });

        this.videoFullscreen.addEventListener('click', () => {
            if (this.videoElement.requestFullscreen) {
                this.videoElement.requestFullscreen();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.videoPlayer.style.display === 'flex') {
                if (e.key === ' ' || e.key === 'Space') {
                    e.preventDefault();
                    this.videoPlay.click();
                }
                if (e.key === 'ArrowRight') {
                    this.videoElement.currentTime += 5;
                }
                if (e.key === 'ArrowLeft') {
                    this.videoElement.currentTime -= 5;
                }
                if (e.key === 'f' || e.key === 'F') {
                    this.videoFullscreen.click();
                }
            }
        });
    }

    playVideo(path, title) {
        this.videoTitle.textContent = title || getFileName(path);
        this.videoElement.src = api.getVideoUrl(path);
        this.videoPlayer.style.display = 'flex';
        this.videoElement.load();
        this.videoElement.play();
        this.videoPlay.innerHTML = '<i class="fas fa-pause"></i>';
    }

    closeVideo() {
        this.videoElement.pause();
        this.videoElement.src = '';
        this.videoPlayer.style.display = 'none';
    }

    // Music Player
    initMusic() {
        this.musicPlayBtn.addEventListener('click', () => this.togglePlay());
        this.musicPrev.addEventListener('click', () => this.prevTrack());
        this.musicNext.addEventListener('click', () => this.nextTrack());
        this.musicShuffle.addEventListener('click', () => this.toggleShuffle());
        this.musicRepeat.addEventListener('click', () => this.toggleRepeat());
        
        this.musicProgress.addEventListener('input', () => {
            const time = (this.musicProgress.value / 100) * this.audio.duration;
            this.audio.currentTime = time;
        });

        this.musicVolume.addEventListener('input', () => {
            this.audio.volume = this.musicVolume.value / 100;
        });

        this.musicPlaylistToggle.addEventListener('click', () => {
            this.musicPlaylist.style.display = this.musicPlaylist.style.display === 'none' ? 'block' : 'none';
        });

        this.playlistClear.addEventListener('click', () => {
            this.playlist = [];
            this.currentIndex = -1;
            this.renderPlaylist();
            this.musicPlayer.style.display = 'none';
        });

        this.audio.addEventListener('timeupdate', () => {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            this.musicProgress.value = percent;
            this.musicCurrentTime.textContent = this.formatTime(this.audio.currentTime);
        });

        this.audio.addEventListener('loadedmetadata', () => {
            this.musicDuration.textContent = this.formatTime(this.audio.duration);
        });

        this.audio.addEventListener('ended', () => {
            if (this.repeatMode === 'one') {
                this.audio.currentTime = 0;
                this.audio.play();
            } else {
                this.nextTrack();
            }
        });
    }

    playMusic(path, title) {
        const file = this.playlist.find(p => p.path === path);
        if (file) {
            this.currentIndex = this.playlist.indexOf(file);
        } else {
            this.addToPlaylist(path, title);
            this.currentIndex = this.playlist.length - 1;
        }
        this.loadTrack(this.currentIndex);
    }

    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        const track = this.playlist[index];
        this.currentIndex = index;
        this.musicTitle.textContent = track.name;
        this.musicArtist.textContent = 'Audio';
        this.audio.src = api.getAudioUrl(track.path);
        this.audio.load();
        this.audio.play();
        this.isPlaying = true;
        this.musicPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
        this.musicPlayer.style.display = 'flex';
        this.renderPlaylist();
    }

    addToPlaylist(path, name) {
        if (!this.playlist.find(p => p.path === path)) {
            this.playlist.push({ path, name: name || getFileName(path) });
            this.renderPlaylist();
        }
    }

    addMultipleToPlaylist(files) {
        files.forEach(file => {
            if (!this.playlist.find(p => p.path === file.path)) {
                this.playlist.push({ path: file.path, name: file.name });
            }
        });
        this.renderPlaylist();
        if (this.currentIndex === -1 && this.playlist.length > 0) {
            this.loadTrack(0);
        }
    }

    togglePlay() {
        if (this.audio.paused) {
            this.audio.play();
            this.musicPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.isPlaying = true;
        } else {
            this.audio.pause();
            this.musicPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.isPlaying = false;
        }
    }

    prevTrack() {
        if (this.playlist.length === 0) return;
        const index = this.isShuffled 
            ? Math.floor(Math.random() * this.playlist.length)
            : (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack(index);
    }

    nextTrack() {
        if (this.playlist.length === 0) return;
        const index = this.isShuffled 
            ? Math.floor(Math.random() * this.playlist.length)
            : (this.currentIndex + 1) % this.playlist.length;
        this.loadTrack(index);
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.musicShuffle.classList.toggle('active');
    }

    toggleRepeat() {
        const modes = ['none', 'one', 'all'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        this.musicRepeat.classList.toggle('active', this.repeatMode !== 'none');
    }

    renderPlaylist() {
        if (this.playlist.length === 0) {
            this.playlistItems.innerHTML = '<div style="padding:8px;text-align:center;color:var(--text-muted);font-size:13px;">Playlist kosong</div>';
            return;
        }

        let html = '';
        this.playlist.forEach((item, index) => {
            html += `
                <div class="playlist-item ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <span class="pl-name">${escapeHtml(item.name)}</span>
                    <button class="pl-remove" data-index="${index}"><i class="fas fa-times"></i></button>
                </div>
            `;
        });

        this.playlistItems.innerHTML = html;

        this.playlistItems.querySelectorAll('.playlist-item').forEach(item => {
            const index = parseInt(item.dataset.index);
            item.addEventListener('click', () => this.loadTrack(index));
            
            const removeBtn = item.querySelector('.pl-remove');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.playlist.splice(index, 1);
                    if (this.currentIndex === index) {
                        this.currentIndex = -1;
                        this.audio.pause();
                        this.musicPlayer.style.display = 'none';
                    } else if (this.currentIndex > index) {
                        this.currentIndex--;
                    }
                    this.renderPlaylist();
                });
            }
        });
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.player = new PlayerComponent();
});
