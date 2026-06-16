class UploadComponent {
    constructor(container) {
        this.container = container;
        this.onUpload = null;
        this.currentPath = '';
        this.uploading = false;
    }

    render(path, onUpload) {
        this.currentPath = path || '';
        this.onUpload = onUpload || this.onUpload;

        if (!this.container) return;

        this.container.innerHTML = `
            <div class="upload-zone" id="upload-zone">
                <i class="fas fa-cloud-upload-alt"></i>
                <div class="upload-text">Seret file ke sini atau klik untuk upload</div>
                <div class="upload-subtext">Maksimal 10GB per file</div>
                <input type="file" id="file-input" multiple style="display:none;" />
                <div id="upload-progress" style="display:none;margin-top:12px;">
                    <div style="height:4px;background:var(--border-color);border-radius:2px;overflow:hidden;">
                        <div id="upload-progress-bar" style="height:100%;width:0%;background:var(--primary-color);transition:width 0.3s;"></div>
                    </div>
                    <div id="upload-progress-text" style="font-size:13px;color:var(--text-muted);margin-top:4px;">0%</div>
                </div>
            </div>
        `;

        const zone = this.container.querySelector('#upload-zone');
        const input = this.container.querySelector('#file-input');
        const progress = this.container.querySelector('#upload-progress');
        const progressBar = this.container.querySelector('#upload-progress-bar');
        const progressText = this.container.querySelector('#upload-progress-text');

        // Click to upload
        zone.addEventListener('click', () => {
            if (!this.uploading) {
                input.click();
            }
        });

        // File input change
        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                this.uploadFiles(input.files);
                input.value = '';
            }
        });

        // Drag & drop
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0 && !this.uploading) {
                this.uploadFiles(e.dataTransfer.files);
            }
        });

        // Store references
        this._progress = { progress, progressBar, progressText };
        this._input = input;
        this._zone = zone;
    }

    async uploadFiles(files) {
        if (this.uploading) return;
        this.uploading = true;
        this._input.disabled = true;
        this._zone.style.opacity = '0.5';
        this._progress.progress.style.display = 'block';

        let successCount = 0;
        let failCount = 0;

        for (const file of files) {
            try {
                await api.uploadFile(file, this.currentPath, (progress) => {
                    const percent = Math.round(progress * 100);
                    this._progress.progressBar.style.width = `${percent}%`;
                    this._progress.progressText.textContent = `${percent}% - ${file.name}`;
                });
                successCount++;
                toast.success(`${file.name} berhasil diupload`);
                if (this.onUpload) this.onUpload(file);
            } catch (error) {
                failCount++;
                toast.error(`${file.name} gagal diupload: ${error.message}`);
            }
        }

        // Reset
        this.uploading = false;
        this._input.disabled = false;
        this._zone.style.opacity = '1';
        this._progress.progress.style.display = 'none';
        this._progress.progressBar.style.width = '0%';
        this._progress.progressText.textContent = '0%';

        if (successCount > 0 && failCount === 0) {
            toast.success(`${successCount} file berhasil diupload`);
        } else if (successCount > 0 && failCount > 0) {
            toast.warning(`${successCount} berhasil, ${failCount} gagal`);
        }

        // Refresh
        if (this.onUpload) {
            this.onUpload(null);
        }
    }

    setPath(path) {
        this.currentPath = path || '';
    }
}

window.UploadComponent = UploadComponent;
