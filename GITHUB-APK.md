# ساخت خودکار APK با GitHub (رایگان، بدون Android Studio)

## مرحله ۱ — ساخت مخزن در GitHub
1. وارد **github.com** شوید (در صورت نداشتن حساب، رایگان ثبت‌نام کنید).
2. دکمه **New repository** → نام: `happy-english` → **Public** → **Create repository**.

## مرحله ۲ — آپلود کد پروژه
**روش ساده (بدون نصب Git):**
1. در صفحه مخزن روی **uploading an existing file** کلیک کنید.
2. همه‌ی فایل‌ها و پوشه‌های پروژه (به‌جز `node_modules` و `dist`) را بکشید و رها کنید.
   ⚠️ پوشه‌ی مخفی `.github` حتماً باید آپلود شود (فایل‌های workflow داخل آن است).
3. **Commit changes** را بزنید.

**روش با Git:**
```bash
git init
git add .
git commit -m "Happy English app"
git branch -M main
git remote add origin https://github.com/USERNAME/happy-english.git
git push -u origin main
```

## مرحله ۳ — فعال‌سازی مجوزها (فقط یک بار)
1. در مخزن: **Settings → Actions → General**.
2. بخش **Workflow permissions** → گزینه **Read and write permissions** → **Save**.
3. برای لینک وب: **Settings → Pages → Source** → **GitHub Actions**.

## مرحله ۴ — دریافت APK
1. تب **Actions** را باز کنید؛ workflow با نام **Build Android APK** خودکار اجرا می‌شود (حدود ۵ تا ۸ دقیقه).
   اگر اجرا نشد: روی آن کلیک کنید → **Run workflow**.
2. بعد از تیک سبز ✅، به تب **Releases** (ستون راست صفحه مخزن) بروید.
3. فایل **HappyEnglish.apk** را دانلود کنید.

## مرحله ۵ — اشتراک‌گذاری
- **لینک APK:** روی `HappyEnglish.apk` در صفحه Releases راست‌کلیک → **Copy link** → این لینک را در تلگرام/واتساپ بفرستید. طرف مقابل روی گوشی اندروید دانلود و نصب می‌کند (اولین بار «نصب از منابع ناشناس» را تأیید می‌کند).
- **لینک وب (بدون نصب فایل):** `https://USERNAME.github.io/happy-english/` — در Chrome باز شود و «📲 نصب روی گوشی» زده شود.

## به‌روزرسانی برنامه
هر بار که فایلی را در GitHub تغییر دهید، APK و لینک وب جدید **خودکار** ساخته می‌شوند.

## نکات
- حداقل اندروید: **8.0**.
- این APK با کلید debug امضا شده و برای اشتراک مستقیم کاملاً کافی است؛ برای انتشار در گوگل‌پلی باید نسخه release با keystore شخصی امضا شود (راهنمای `BUILD-APK.md`).
- GitHub Actions برای مخازن Public کاملاً رایگان و نامحدود است.
