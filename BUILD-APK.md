# راهنمای ساخت فایل APK برای «انگلیسی شاد»

> فایل APK یک فایل باینری اندروید است و فقط با ابزار اندروید روی کامپیوتر ساخته می‌شود.
> دو روش زیر هر دو خروجی APK قابل نصب و قابل اشتراک (Android 8.0+) می‌دهند.

---

## روش ۱ (ساده‌ترین – بدون نصب هیچ برنامه‌ای): PWABuilder

1. پوشه‌ی `dist` را (پس از `npm run build`) روی یک هاست رایگان HTTPS بگذارید
   (مثلاً **Netlify Drop**: netlify.com/drop → پوشه dist را بکشید و رها کنید → یک آدرس می‌گیرید).
2. به سایت **https://www.pwabuilder.com** بروید و آدرس را وارد کنید.
3. روی **Package for stores → Android** کلیک کنید.
4. در تنظیمات، **Package ID** را `ir.happyenglish.kids` بگذارید و **Signing key → Create new** را انتخاب کنید.
5. دکمه **Generate** → فایل zip دانلود می‌شود که داخلش هم `app-release-signed.apk` و هم `.aab` (برای گوگل‌پلی) هست.
6. فایل `.apk` را به گوشی بفرستید (تلگرام/واتساپ/بلوتوث) و نصب کنید.
   در اولین نصب، اندروید اجازه‌ی «نصب از منابع ناشناس» می‌خواهد → تأیید کنید.

---

## روش ۲ (کاملاً آفلاین و مستقل): Capacitor + Android Studio

پیش‌نیاز: Node.js، Android Studio (با SDK 34) و JDK 17.

```bash
# ۱) وابستگی‌ها و بیلد وب
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
npm run build

# ۲) اضافه کردن پلتفرم اندروید (فایل capacitor.config.json از قبل آماده است)
npx cap add android
npx cap sync android

# ۳) ساخت APK دیباگ (برای تست و اشتراک سریع)
cd android
./gradlew assembleDebug
# خروجی: android/app/build/outputs/apk/debug/app-debug.apk

# ۴) ساخت APK/AAB امضاشده برای انتشار
./gradlew assembleRelease     # APK
./gradlew bundleRelease       # AAB برای گوگل‌پلی
```

### تنظیم حداقل اندروید ۸.۰
در فایل `android/variables.gradle` مقدار `minSdkVersion` را `26` بگذارید.

### آیکن برنامه
در Android Studio: روی پوشه `app` راست‌کلیک → **New → Image Asset** → تصویر `public/icon-512.png` را انتخاب کنید.

### امضای نسخه Release
```bash
keytool -genkey -v -keystore happy-english.keystore -alias happy -keyalg RSA -keysize 2048 -validity 10000
```
سپس مسیر keystore را در `android/app/build.gradle` بخش `signingConfigs` قرار دهید.

---

## نکات مهم
- برنامه برای ترجمه، تولید تصویر و تشخیص دست‌خط به اینترنت نیاز دارد؛ دسترسی `INTERNET` به‌صورت پیش‌فرض در Capacitor فعال است.
- کلید API هوش مصنوعی (اختیاری) داخل برنامه از منوی ⚙️ وارد می‌شود و فقط در حافظه‌ی گوشی ذخیره می‌گردد؛ هیچ کلیدی داخل کد نیست.
- کلمات تمرین‌شده در حافظه گوشی ذخیره می‌شوند و بدون اینترنت هم قابل مرور هستند.
