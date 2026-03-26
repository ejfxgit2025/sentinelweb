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

    // Demo video behavior: lazy load, autoplay-safe start, responsive controls
    const demoVideo = document.getElementById('demo-video');
    if (demoVideo) {
        const desktopMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
        const isDesktop = () => desktopMedia.matches;

        const syncControls = () => {
            if (isDesktop()) {
                demoVideo.removeAttribute('controls');
            } else {
                demoVideo.setAttribute('controls', '');
            }
        };

        syncControls();
        if (desktopMedia.addEventListener) {
            desktopMedia.addEventListener('change', syncControls);
        } else if (desktopMedia.addListener) {
            desktopMedia.addListener(syncControls);
        }

        demoVideo.addEventListener('mouseenter', () => {
            if (isDesktop()) {
                demoVideo.setAttribute('controls', '');
            }
        });

        demoVideo.addEventListener('mouseleave', () => {
            if (isDesktop()) {
                demoVideo.removeAttribute('controls');
            }
        });

        const source = demoVideo.querySelector('source[data-src]');
        const loadVideo = () => {
            if (!source || source.getAttribute('src')) return;
            source.setAttribute('src', source.dataset.src);
            demoVideo.load();
            demoVideo.play().catch(() => {});
        };

        if ('IntersectionObserver' in window) {
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        loadVideo();
                        videoObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.25 });

            videoObserver.observe(demoVideo);
        } else {
            loadVideo();
        }
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
