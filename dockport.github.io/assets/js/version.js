const TALLYBOOK_VERSION = {
    version: "1.0.0",
    downloadUrl: "https://github.com/dockport/TallyBook/releases/download/1.0.0/TallyBook-x86_64.AppImage",
    filename: "TallyBook-x86_64.AppImage"
};

// Automatically populate the version text and download link on the page
document.addEventListener('DOMContentLoaded', () => {
    const versionEl = document.getElementById('tallybook-version');
    const downloadBtn = document.getElementById('tallybook-download-btn');

    if (versionEl) {
        versionEl.textContent = `DOWNLOAD VERSION ${TALLYBOOK_VERSION.version}`;
    }

    if (downloadBtn) {
        downloadBtn.href = TALLYBOOK_VERSION.downloadUrl;

        // Find existing image inside link to preserve it
        const imgEl = downloadBtn.querySelector('img');
        downloadBtn.innerHTML = '';
        if (imgEl) {
            downloadBtn.appendChild(imgEl);
        }

        // Add the filename as text
        downloadBtn.appendChild(document.createTextNode(TALLYBOOK_VERSION.filename));
    }
});
