# InstaKitPro - دليل النشر على Railway

هذا الدليل يشرح كيفية نشر تطبيق InstaKitPro على منصة Railway بشكل مباشر.

## المتطلبات المسبقة

1. حساب على منصة [Railway](https://railway.app/)
2. تثبيت [Git](https://git-scm.com/) على جهازك (اختياري)

## خطوات النشر

### الطريقة الأولى: النشر المباشر من GitHub

1. قم بإنشاء مستودع جديد على GitHub وارفع ملفات المشروع إليه
2. سجل دخولك إلى حسابك على منصة Railway
3. انقر على زر "New Project"
4. اختر "Deploy from GitHub repo"
5. اختر المستودع الذي رفعت إليه ملفات المشروع
6. انتظر حتى يتم بناء ونشر المشروع تلقائياً
7. بمجرد اكتمال النشر، انقر على "Settings" ثم "Generate Domain" للحصول على رابط للوصول إلى التطبيق

### الطريقة الثانية: النشر باستخدام Docker

1. سجل دخولك إلى حسابك على منصة Railway
2. انقر على زر "New Project"
3. اختر "Deploy from Dockerfile"
4. ارفع ملف مضغوط يحتوي على جميع ملفات المشروع
5. انتظر حتى يتم بناء ونشر المشروع تلقائياً
6. بمجرد اكتمال النشر، انقر على "Settings" ثم "Generate Domain" للحصول على رابط للوصول إلى التطبيق

## متغيرات البيئة (اختياري)

يمكنك إضافة متغيرات البيئة التالية في إعدادات المشروع على Railway:

- `FLASK_ENV`: production
- `FLASK_APP`: app.py

## ملاحظات هامة

- تأكد من أن ملف `Dockerfile` و `requirements.txt` موجودان في المجلد الرئيسي للمشروع
- Railway سيكتشف تلقائياً أن المشروع هو تطبيق Flask ويقوم بتكوينه بشكل مناسب
- يمكنك مراقبة سجلات التطبيق من خلال تبويب "Logs" في لوحة التحكم
- تأكد من أن المنفذ المستخدم في التطبيق هو المنفذ الذي توفره Railway من خلال متغير البيئة `PORT`

## استكشاف الأخطاء وإصلاحها

إذا واجهت أي مشاكل أثناء النشر، تحقق من:

1. وجود جميع الملفات المطلوبة في المجلد الرئيسي
2. صحة ملف `requirements.txt` واحتوائه على جميع المكتبات المطلوبة
3. صحة ملف `Dockerfile` وتكوينه بشكل صحيح
4. سجلات التطبيق في تبويب "Logs" للحصول على معلومات حول الأخطاء

## الدعم

إذا كنت بحاجة إلى مزيد من المساعدة، يمكنك:

- زيارة [وثائق Railway](https://docs.railway.app/)
- التواصل مع المطور عبر تليجرام: @nusrc
