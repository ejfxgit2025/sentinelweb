document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // Demo player: thumbnail-first YouTube experience with custom controls
    const demoPlayer = document.getElementById('demo-player');
    if (demoPlayer) {
        const videoId = demoPlayer.dataset.videoId;
        const thumbnailLayer = demoPlayer.querySelector('.demo-thumbnail-layer');
        const iframeLayer = demoPlayer.querySelector('.demo-iframe-layer');
        const playPauseBtn = demoPlayer.querySelector('[data-action="play"]');
        const muteBtn = demoPlayer.querySelector('[data-action="mute"]');

        let iframe = null;
        let isPlaying = false;
        let isMuted = false;

        const postCommand = (func) => {
            if (!iframe || !iframe.contentWindow) return;
            iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func,
                args: []
            }), 'https://www.youtube.com');
        };

        const updatePlayButton = () => {
            const icon = playPauseBtn?.querySelector('i');
            if (!icon || !playPauseBtn) return;
            icon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
            playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause video' : 'Play video');
        };

        const updateMuteButton = () => {
            const icon = muteBtn?.querySelector('i');
            if (!icon || !muteBtn) return;
            icon.className = isMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
            muteBtn.setAttribute('aria-label', isMuted ? 'Unmute video' : 'Mute video');
        };

        const createIframe = () => {
            if (iframe || !videoId || !iframeLayer) return;
            iframe = document.createElement('iframe');
            iframe.className = 'demo-iframe';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            iframe.setAttribute('allowfullscreen', '');
            iframe.title = 'Sentinel in-action demo video';
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&disablekb=1`;
            iframeLayer.appendChild(iframe);
            demoPlayer.classList.add('is-playing');

            [playPauseBtn, muteBtn].forEach((button) => {
                if (button) button.disabled = false;
            });

            isPlaying = true;
            updatePlayButton();
            updateMuteButton();
        };

        const startPlayback = () => {
            createIframe();
            postCommand('playVideo');
            isPlaying = true;
            updatePlayButton();
        };

        const togglePlayback = () => {
            if (!iframe) {
                startPlayback();
                return;
            }

            if (isPlaying) {
                postCommand('pauseVideo');
            } else {
                postCommand('playVideo');
            }

            isPlaying = !isPlaying;
            updatePlayButton();
        };

        const toggleMute = () => {
            if (!iframe) {
                startPlayback();
            }

            if (isMuted) {
                postCommand('unMute');
            } else {
                postCommand('mute');
            }

            isMuted = !isMuted;
            updateMuteButton();
        };

        thumbnailLayer?.addEventListener('click', startPlayback);
        thumbnailLayer?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                startPlayback();
            }
        });

        playPauseBtn?.addEventListener('click', togglePlayback);
        muteBtn?.addEventListener('click', toggleMute);
    }

    const downloadBtn = document.getElementById('download-sentinel-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            const url = downloadBtn.dataset.downloadUrl || downloadBtn.href;

            try {
                const response = await fetch(url, { mode: 'cors' });
                if (!response.ok) throw new Error('Download request failed');

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                const blobLink = document.createElement('a');
                blobLink.href = objectUrl;
                blobLink.download = 'Sentinel.zip';
                document.body.appendChild(blobLink);
                blobLink.click();
                blobLink.remove();
                setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
            } catch {
                const directLink = document.createElement('a');
                directLink.href = url;
                directLink.download = 'Sentinel.zip';
                directLink.target = '_blank';
                directLink.rel = 'noopener';
                document.body.appendChild(directLink);
                directLink.click();
                directLink.remove();
            }
        });
    }

});
