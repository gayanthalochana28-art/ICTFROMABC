// 3.1. ෆෝන්ට් පූරණය සහ කළමනාකරණය
function loadFonts() {
    // Poppins ෆොන්ට් පූරණය
    const fontLinks = [
        '/_next/static/immutable/media/47fe1b7cd6e6ed85-s.p.1n2oi-d4a-xww.woff2',
        '/_next/static/immutable/media/829ba4228c966254-s.p.0zvxjg5nywxta.woff2',
        '/_next/static/immutable/media/8e6fa89aa22d24ec-s.p.1bg6trwi21i5q.woff2',
        '/_next/static/immutable/media/a218039a3287bcfd-s.p.17e3l4txdrufi.woff2',
        '/_next/static/immutable/media/e2334d715941921e-s.p.2g9xiodaln20i.woff2'
    ];
    
    fontLinks.forEach(fontUrl => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.href = fontUrl;
        link.crossOrigin = 'anonymous';
        link.type = 'font/woff2';
        document.head.appendChild(link);
    });
}

// 3.2. පින්තූර පූරණය සහ කළමනාකරණය
function loadImages() {
    const images = [
        '/loginmb.png',
        '/loginpc.png'
    ];
    
    images.forEach(imgSrc => {
        const img = new Image();
        img.src = imgSrc;
        img.onload = () => {
            console.log(`Image loaded: ${imgSrc}`);
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${imgSrc}`);
        };
    });
}

// 3.3. සමාජ මාධ්‍ය සබැඳි සඳහා සිදුවීම්
function setupSocialLinks() {
    const socialLinks = document.querySelectorAll('a[href="#"]');
    socialLinks.forEach(link => {
        // සමාජ මාධ්‍ය සබැඳි හඳුනා ගැනීම
        const svg = link.querySelector('svg');
        if (svg) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const linkType = detectSocialLinkType(svg);
                if (linkType) {
                    console.log(`Social link clicked: ${linkType}`);
                    // සමාජ මාධ්‍ය පිටුව විවෘත කිරීම
                    window.open(getSocialUrl(linkType), '_blank');
                }
            });
        }
    });
}

function detectSocialLinkType(svgElement) {
    // SVG මත පදනම්ව සමාජ මාධ්‍ය වර්ගය හඳුනා ගැනීම
    const svgContent = svgElement.outerHTML;
    if (svgContent.includes('youtube') || svgContent.includes('play')) {
        return 'youtube';
    } else if (svgContent.includes('telegram') || svgContent.includes('send')) {
        return 'telegram';
    } else if (svgContent.includes('facebook') || svgContent.includes('thumbs-up')) {
        return 'facebook';
    }
    return null;
}

function getSocialUrl(type) {
    const urls = {
        'youtube': 'https://www.youtube.com/ictfromabc',
        'telegram': 'https://t.me/ictfromabc',
        'facebook': 'https://www.facebook.com/ictfromabc'
    };
    return urls[type] || '#';
}

// 3.4. ආදාන ක්ෂේත්‍ර සීමා කිරීම්
function setupInputRestrictions() {
    const phoneInput = document.querySelector('input[placeholder="07X XXX XXXX"]');
    const otpInput = document.querySelector('input[placeholder="------"]');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            // දුරකථන අංකය සඳහා අක්ෂර සීමා කිරීම්
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            e.target.value = value;
            
            // අංකය ආකෘතිකරණය කිරීම
            if (value.length >= 7) {
                const formatted = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`;
                e.target.value = formatted;
            }
        });
    }
    
    if (otpInput) {
        otpInput.addEventListener('input', (e) => {
            // OTP සඳහා අක්ෂර සීමා කිරීම්
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 6) {
                value = value.slice(0, 6);
            }
            e.target.value = value;
        });
    }
}

// 3.5. මෙනු සහ සංචලනය
function setupNavigation() {
    // ඩෙස්ක්ටොප් සහ ජංගම අතුරුමුහුණත් අතර ස්විචය
    const handleResize = () => {
        const isMobile = window.innerWidth < 1024;
        const mobileView = document.querySelector('.flex.lg\\:hidden');
        const desktopView = document.querySelector('.hidden.lg\\:grid');
        
        if (isMobile) {
            if (desktopView) desktopView.style.display = 'none';
            if (mobileView) mobileView.style.display = 'flex';
        } else {
            if (desktopView) desktopView.style.display = 'grid';
            if (mobileView) mobileView.style.display = 'none';
        }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // ආරම්භක සැකසුම
}

// 3.6. පරිශීලක අන්තර්ක්‍රියා සඳහා සජීවිකරණ
function setupAnimations() {
    // ශීර්ෂ සඳහා සජීවිකරණය
    const headings = document.querySelectorAll('h1, h2');
    headings.forEach((heading, index) => {
        heading.style.opacity = '0';
        heading.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            heading.style.transition = 'all 0.6s ease-out';
            heading.style.opacity = '1';
            heading.style.transform = 'translateY(0)';
        }, 300 + (index * 150));
    });
    
    // පෝරමය සඳහා සජීවිකරණය
    const forms = document.querySelectorAll('.bg-\\[\\#db3900\\]');
    forms.forEach((form, index) => {
        form.style.opacity = '0';
        form.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            form.style.transition = 'all 0.8s ease-out';
            form.style.opacity = '1';
            form.style.transform = 'scale(1)';
        }, 600 + (index * 200));
    });
}

// 3.7. පිටුව ආරම්භ කිරීම
function initPage() {
    loadFonts();
    loadImages();
    setupSocialLinks();
    setupInputRestrictions();
    setupNavigation();
    setupAnimations();
    
    // Console පණිවිඩය
    console.log('🚀 ictfromabc Student Login Portal loaded successfully!');
    console.log('📱 Phone: 071 455 5513');
    console.log('🔗 Visit: https://ictfromabc-kappa.vercel.app');
}

// පිටුව සම්පූර්ණයෙන් පූරණය වූ පසු ආරම්භ කිරීම
if (document.readyState === 'complete') {
    initPage();
} else {
    window.addEventListener('load', initPage);
}