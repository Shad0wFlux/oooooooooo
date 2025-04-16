FROM python:3.10-slim

WORKDIR /app

COPY . /app/

RUN pip install --no-cache-dir -r requirements.txt

# إنشاء مجلد التحميلات إذا لم يكن موجوداً
RUN mkdir -p /app/static/uploads

# تعيين الصلاحيات المناسبة
RUN chmod -R 755 /app
RUN chmod -R 777 /app/static/uploads

# تعيين متغيرات البيئة
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# فتح المنفذ (سيتم تجاهله واستخدام متغير البيئة PORT)
EXPOSE 5000

# تشغيل التطبيق باستخدام gunicorn مع متغير البيئة PORT
CMD gunicorn --bind 0.0.0.0:$PORT app:app
