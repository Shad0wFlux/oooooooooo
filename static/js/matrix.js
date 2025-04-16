/**
 * Matrix Rain Effect for Dark Web Style
 * تأثير مطر الماتريكس للخلفية
 */

document.addEventListener('DOMContentLoaded', function() {
    // إنشاء عنصر canvas للماتريكس
    const matrixBg = document.querySelector('.matrix-bg');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // تعيين أبعاد الكانفاس لتغطية الشاشة بالكامل
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // إضافة الكانفاس إلى عنصر الخلفية
    matrixBg.appendChild(canvas);
    
    // الأحرف التي ستظهر في تأثير الماتريكس
    const arabic = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي٠١٢٣٤٥٦٧٨٩';
    const latin = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\';
    const chars = arabic + latin + special;
    
    // حجم الخط وعدد الأعمدة
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    
    // مصفوفة لتتبع موضع Y لكل عمود
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -canvas.height);
    }
    
    // الألوان المستخدمة في التأثير
    const colors = [
        'rgba(0, 198, 255, 0.8)',  // أزرق فاتح
        'rgba(0, 114, 255, 0.8)',  // أزرق
        'rgba(0, 255, 127, 0.8)',  // أخضر فاتح
        'rgba(255, 45, 85, 0.8)'   // أحمر
    ];
    
    // دالة لرسم تأثير الماتريكس
    function drawMatrix() {
        // تعتيم الخلفية لإنشاء تأثير التلاشي
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // تعيين خصائص النص
        ctx.font = fontSize + 'px monospace';
        
        // رسم الأحرف
        for (let i = 0; i < drops.length; i++) {
            // اختيار حرف عشوائي
            const char = chars.charAt(Math.floor(Math.random() * chars.length));
            
            // اختيار لون عشوائي
            const color = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillStyle = color;
            
            // رسم الحرف
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);
            
            // إعادة تعيين موضع Y عندما يصل الحرف إلى أسفل الشاشة أو بشكل عشوائي
            if (drops[i] * fontSize > canvas.height || Math.random() > 0.99) {
                drops[i] = 0;
            }
            
            // تحريك القطرة للأسفل
            drops[i]++;
        }
    }
    
    // تحديث حجم الكانفاس عند تغيير حجم النافذة
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // إعادة حساب عدد الأعمدة
        const newColumns = Math.floor(canvas.width / fontSize);
        
        // تحديث مصفوفة القطرات
        for (let i = 0; i < newColumns; i++) {
            if (i >= drops.length) {
                drops[i] = Math.floor(Math.random() * -canvas.height);
            }
        }
        
        // اقتصاص المصفوفة إذا كان عدد الأعمدة الجديد أقل
        if (newColumns < drops.length) {
            drops.length = newColumns;
        }
    });
    
    // تشغيل الرسوم المتحركة
    setInterval(drawMatrix, 50);
});
