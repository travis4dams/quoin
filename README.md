# QUOIN → native iPhone app

This folder is a ready-to-build [Capacitor](https://capacitorjs.com) project that wraps the
QUOIN game in a native iOS shell. The whole game lives in `www/index.html` and gets bundled
**inside** the app, so once it's on your phone it runs fully offline, forever — no signal, no
web server, nothing to evict.

You'll build and install it from your MacBook Air using a **free Apple ID**. The only catch of
the free route: the app stops opening after **7 days**, and you refresh it by plugging in and
re-running from Xcode (about 30 seconds). Same app, same steps, once a week.

---

## One-time setup on the Mac

1. **Install Xcode** from the Mac App Store (it's large — let it finish fully). Open it once and
   accept the license / let it install components.
2. **Install Node.js** if you don't have it: https://nodejs.org (the "LTS" download).
3. In Terminal, install the CocoaPods dependency manager Xcode projects use:
   ```bash
   sudo gem install cocoapods
   ```
   (On Apple Silicon you can also use `brew install cocoapods` if you have Homebrew.)

## Build the app (first time)

From inside this folder in Terminal:

```bash
npm install            # pulls in Capacitor
npx cap add ios        # generates the native iOS project (Mac only)
npx cap sync           # copies the game into the iOS project
npx cap open ios       # opens it in Xcode
```

### Set the app icon (optional but nice)

A 1024×1024 source icon is in `assets/icon.png`. To generate every icon size automatically:

```bash
npx @capacitor/assets generate --ios
npx cap sync
```

(If that command has trouble, you can instead drag `assets/icon.png` onto the **AppIcon**
slot in Xcode under `App > Assets`.)

## Sign it with your free Apple ID (the important part)

In Xcode, after `npx cap open ios`:

1. Add your Apple ID: **Xcode menu → Settings → Accounts → "+" → Apple ID**, sign in.
2. In the left sidebar click the blue **App** project, then the **App** target, then the
   **Signing & Capabilities** tab.
3. Tick **Automatically manage signing**.
4. **Team:** choose your name with "(Personal Team)" next to it.
5. **Bundle Identifier:** set it to something unique and *keep it forever*, e.g.
   `com.yourname.quoin`. (Don't keep changing this — a free account limits how many new app
   IDs you can register per week.)
6. Plug your iPhone into the Mac with a cable. Pick it from the device dropdown at the top of
   the Xcode window (next to the Run ▶ button).
7. Press **Run ▶**. The first build takes a minute.

### First launch on the phone

The first time, iOS won't trust a personal-team app yet. On the iPhone go to
**Settings → General → VPN & Device Management**, tap your Apple ID under "Developer App," and
tap **Trust**. Then open QUOIN from the home screen.

That's it — it's now a real app on your phone, working with no signal.

## The weekly refresh

When the 7 days are up, the icon stays but the app won't open. To reset the timer:

1. Plug the iPhone into the Mac.
2. Open this project in Xcode (`npx cap open ios`).
3. Make sure your phone is the selected device, press **Run ▶**.

Done — good for another 7 days. Nothing else changes; your settings and the app stay put.

## Editing the game later

The entire game is `www/index.html`. Change it, then run `npx cap sync` and rebuild from Xcode.
When you're ready to add the saved stats / recent-word memory we talked about, this is where it
goes — and a native app can store that permanently with no eviction worries.

---

### If you ever want it to stop expiring

A paid **Apple Developer Program** membership ($99/year) signs the app for ~a year instead of
7 days, so you'd refresh once annually instead of weekly. Everything above stays the same; you'd
just pick your paid team in step 4. Entirely optional.
