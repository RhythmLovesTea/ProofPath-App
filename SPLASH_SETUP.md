# ProofPath Splash Screen & App Icon Setup

## Splash Screen (react-native-splash-screen)

### Design Spec
- Background: `#1d1d1f` (Apple near-black / ProofPath dark tile)
- Center icon: White fingerprint-meets-document SVG (see `/assets/splash_icon.svg`)
- Tagline line 1: "Your identity. Your rights." — white, SF Pro Display weight 600
- Tagline line 2: "आपकी पहचान। आपके अधिकार।" — bodyMuted `#cccccc`, weight 400

### Android Setup (android/app/src/main/res/)

1. Place `splash_bg.xml` in `drawable/`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_bg" />
    <item>
        <bitmap
            android:src="@drawable/splash_icon"
            android:gravity="center" />
    </item>
</layer-list>
```

2. Add in `values/colors.xml`:
```xml
<color name="splash_bg">#1d1d1f</color>
```

3. Add to `values/styles.xml`:
```xml
<style name="SplashTheme" parent="Theme.AppCompat.NoActionBar">
    <item name="android:windowBackground">@drawable/splash_bg</item>
    <item name="android:statusBarColor">#1d1d1f</item>
    <item name="android:navigationBarColor">#1d1d1f</item>
</style>
```

4. In `AndroidManifest.xml`, set `android:theme="@style/SplashTheme"` on MainActivity.

5. In `MainActivity.java/kt`:
```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    SplashScreen.show(this)
    super.onCreate(savedInstanceState)
}
```

6. In `App.tsx`, call `SplashScreen.hide()` after DB init completes.

### App Icon Spec
- Foreground: White fingerprint icon on transparent background (108×108dp)  
- Background: `#0066cc` (Action Blue)  
- Adaptive icon: `ic_launcher_foreground.xml` + `ic_launcher_background.xml`

Place assets in:
- `mipmap-mdpi/` — 48×48px  
- `mipmap-hdpi/` — 72×72px  
- `mipmap-xhdpi/` — 96×96px  
- `mipmap-xxhdpi/` — 144×144px  
- `mipmap-xxxhdpi/` — 192×192px

### Mock Server
Start the development sync server with:
```bash
node mock-server/server.js
```
Endpoints available at `http://localhost:3000/api/`

> Note: Android emulator connects to host machine at `10.0.2.2:3000`
