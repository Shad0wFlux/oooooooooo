/**
 * InstaKitPro - Dark Web Style
 * الملف الرئيسي للوظائف المشتركة بين الصفحات
 */

document.addEventListener('DOMContentLoaded', function() {
    // إضافة تأثيرات بصرية للعناصر
    addVisualEffects();
    
    // تهيئة الأحداث المشتركة
    initCommonEvents();
});

/**
 * إضافة تأثيرات بصرية للعناصر
 */
function addVisualEffects() {
    // إضافة تأثير توهج للروابط عند التحويم
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('mouseover', function() {
            this.style.textShadow = '0 0 10px var(--primary-color)';
        });
        
        link.addEventListener('mouseout', function() {
            this.style.textShadow = 'none';
        });
    });
    
    // إضافة تأثير نبض للأزرار
    const buttons = document.querySelectorAll('button:not(.close-alert):not(.copy-button)');
    buttons.forEach(button => {
        button.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 5px 15px var(--shadow-color)';
        });
        
        button.addEventListener('mouseout', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
    
    // إضافة تأثير توهج للأيقونات في البطاقات
    const cardIcons = document.querySelectorAll('.card-icon i');
    cardIcons.forEach(icon => {
        setInterval(() => {
            icon.style.textShadow = '0 0 20px var(--primary-color)';
            setTimeout(() => {
                icon.style.textShadow = '0 0 10px var(--primary-color)';
            }, 1000);
        }, 2000);
    });
}

/**
 * تهيئة الأحداث المشتركة بين الصفحات
 */
function initCommonEvents() {
    // إضافة تأثير صوتي عند النقر على الأزرار (اختياري)
    const buttons = document.querySelectorAll('button, .card, .back-button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            playClickSound();
        });
    });
}

/**
 * تشغيل صوت النقر (اختياري)
 */
function playClickSound() {
    // يمكن تنفيذ هذه الدالة إذا كنت ترغب في إضافة تأثيرات صوتية
    // const clickSound = new Audio('/static/sounds/click.mp3');
    // clickSound.volume = 0.2;
    // clickSound.play();
}

/**
 * عرض رسالة تنبيه
 * @param {string} type - نوع التنبيه (success, error, warning)
 * @param {string} message - نص الرسالة
 * @param {string} containerId - معرف حاوية التنبيه (اختياري)
 */
function showAlert(type, message, containerId = 'alert-container') {
    const alertContainer = document.getElementById(containerId);
    if (!alertContainer) return;
    
    alertContainer.innerHTML = `
        <div class="alert alert-${type}">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button type="button" class="close-alert" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // إخفاء التنبيه تلقائيًا بعد 5 ثوانٍ
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.style.opacity = '0';
            setTimeout(() => {
                if (alert.parentElement === alertContainer) {
                    alertContainer.removeChild(alert);
                }
            }, 300);
        }
    }, 5000);
}

/**
 * نسخ نص إلى الحافظة
 * @param {string} text - النص المراد نسخه
 * @param {Element} button - زر النسخ (اختياري)
 * @returns {boolean} - نجاح العملية
 */
function copyToClipboard(text, button = null) {
    // إنشاء عنصر نصي مؤقت
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    
    // تحديد النص ونسخه
    textarea.select();
    let success = false;
    
    try {
        success = document.execCommand('copy');
        
        // إظهار تأثير النسخ على الزر إذا تم تمريره
        if (success && button) {
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.classList.remove('copied');
            }, 2000);
        }
    } catch (err) {
        console.error('فشل نسخ النص: ', err);
    }
    
    // إزالة العنصر المؤقت
    document.body.removeChild(textarea);
    return success;
}

/**
 * التحقق من صحة معرف الجلسة
 * @param {string} sessionId - معرف الجلسة
 * @returns {boolean} - صحة معرف الجلسة
 */
function isValidSessionId(sessionId) {
    // معرف الجلسة يجب أن يكون نصًا بطول معين
    return sessionId && sessionId.length >= 20;
}

/**
 * تحميل معرف الجلسة من التخزين المحلي
 * @returns {string|null} - معرف الجلسة أو null إذا لم يكن موجودًا
 */
function loadSessionId() {
    return localStorage.getItem('instakit_session');
}

/**
 * حفظ معرف الجلسة في التخزين المحلي
 * @param {string} sessionId - معرف الجلسة
 */
function saveSessionId(sessionId) {
    if (isValidSessionId(sessionId)) {
        localStorage.setItem('instakit_session', sessionId);
    }
}

/**
 * إضافة تأثير كتابة متتالية للنص
 * @param {string} elementId - معرف العنصر
 * @param {string} text - النص المراد كتابته
 * @param {number} speed - سرعة الكتابة (بالمللي ثانية)
 */
function typeWriter(elementId, text, speed = 50) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

/**
 * تحويل التاريخ إلى صيغة مقروءة
 * @param {Date|string} date - كائن التاريخ أو نص التاريخ
 * @returns {string} - التاريخ بصيغة مقروءة
 */
function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('ar-SA', options);
}

/**
 * إظهار رسالة خطأ للمستخدم
 * @param {Error|string} error - كائن الخطأ أو نص الخطأ
 */
function handleError(error) {
    const message = typeof error === 'string' ? error : error.message || 'حدث خطأ غير معروف';
    showAlert('error', message);
    console.error('خطأ:', error);
}

/**
 * التحقق من اتصال الإنترنت
 * @returns {boolean} - حالة الاتصال
 */
function isOnline() {
    return navigator.onLine;
}

/**
 * إضافة مستمع لحالة الاتصال
 */
window.addEventListener('online', function() {
    showAlert('success', 'تم استعادة الاتصال بالإنترنت');
});

window.addEventListener('offline', function() {
    showAlert('error', 'انقطع الاتصال بالإنترنت');
});
