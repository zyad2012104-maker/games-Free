// مدير الإعلانات المحسن
class AdManager {
    constructor() {
        this.adsShown = 0;
        this.turnCount = 0;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        // تهيئة جميع الإعلانات
        this.loadAllAds();
        this.setupEventListeners();
        this.initialized = true;
    }

    loadAllAds() {
        // إعادة تحميل إعلانات AdSense
        try {
            (adsbygoogle = window.adsbygoogle || []).forEach(() => {
                // دفع لكل إعلان
                adsbygoogle.push({});
            });
        } catch (e) {
            console.log('AdSense loading:', e);
        }
    }

    showStartAd() {
        const startAd = document.getElementById('startAd');
        if (startAd) {
            startAd.style.display = 'block';
            this.adsShown++;
            this.updateAdStats();
            this.loadAllAds(); // إعادة تحميل الإعلانات
            
            // إخفاء تلقائي بعد 7 ثواني
            setTimeout(() => this.closeStartAd(), 7000);
        }
    }

    closeStartAd() {
        const startAd = document.getElementById('startAd');
        if (startAd) {
            startAd.style.display = 'none';
        }
    }

    showTurnAd(turnNumber) {
        const turnAd = document.getElementById('turnAdContainer');
        if (turnAd) {
            document.getElementById('turnNumber').textContent = turnNumber;
            turnAd.classList.remove('hidden');
            this.adsShown++;
            this.updateAdStats();
            this.loadAllAds(); // إعادة تحميل الإعلانات
            
            // إخفاء بعد 5 ثواني
            setTimeout(() => this.closeTurnAd(), 5000);
        }
    }

    closeTurnAd() {
        const turnAd = document.getElementById('turnAdContainer');
        if (turnAd) {
            turnAd.classList.add('hidden');
        }
    }

    updateAdStats() {
        const statsElement = document.getElementById('adsShown');
        if (statsElement) {
            statsElement.textContent = this.adsShown;
        }
    }

    setupEventListeners() {
        // إغلاق الإعلانات يدوياً
        document.querySelectorAll('.ad-close, .ad-close-small').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const adContainer = e.target.closest('.top-ad, .bottom-ad, .start-ad, .turn-ad-container, .ad-vertical-card, .ad-square-card');
                if (adContainer) {
                    adContainer.style.display = 'none';
                }
            });
        });

        // إعادة تحميل الإعلانات عند تغيير الصفحة
        window.addEventListener('load', () => this.loadAllAds());
        window.addEventListener('resize', () => this.loadAllAds());
    }
}

// إنشاء كائن المدير العام
const adManager = new AdManager();

// تهيئة الإعلانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    adManager.init();
});

// دوال مساعدة للاستخدام في الألعاب
function showStartAd() {
    adManager.showStartAd();
}

function closeStartAd() {
    adManager.closeStartAd();
}

function showTurnAd(turnNumber) {
    adManager.showTurnAd(turnNumber);
}

function closeTurnAd() {
    adManager.closeTurnAd();
}