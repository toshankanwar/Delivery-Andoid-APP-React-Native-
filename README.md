# Bakery Delivery App

> A modern, responsive food delivery mobile app built with Expo and React Native — featuring seamless EAS build configuration, OTA (Over-the-air) updates, and Android adaptive icon support.

You can download the latest built APK here:

[https://expo.dev/artifacts/eas/pxCHo9wcQeTSP2csNaPGgE.apk](https://expo.dev/artifacts/eas/pxCHo9wcQeTSP2csNaPGgE.apk)

![login](https://toshankanwar.website/delivery/img1.jpg)
![orders](https://toshankanwar.website/delivery/img2.jpg)
![order model](https://toshankanwar.website/delivery/img3.jpg)

---

## Table of Contents

- [Project Overview](#project-overview)  
- [Features](#features)  
- [Project Setup](#project-setup)  
- [Development](#development)  
- [Building the App](#building-the-app)  
- [Over-the-Air (OTA) Updates](#over-the-air-ota-updates)  
- [Android Adaptive Icon](#android-adaptive-icon)  
- [Keystore & Signing](#keystore--signing)  
- [Troubleshooting](#troubleshooting)  
- [Folder Structure](#folder-structure)  
- [Contributing](#contributing)  
- [License](#license)  
- [APK Download Link](#apk-download-link)

---

## Project Overview

Bakery Delivery App is a mobile application designed to facilitate easy ordering and delivery of bakery products. The app is built using Expo SDK 53 with React Native 0.79.5, leveraging modern React Native architecture to provide a smooth user experience.

This project uses Expo Application Services (EAS) for cloud builds, and supports instant JavaScript/UI updates via EAS OTA update functionality.

---

## Features

- Responsive UI built with React Native components  
- Android adaptive launcher icon with custom foreground and background  
- Android edge-to-edge display enabled for immersive experience  
- Light mode UI by default using React Native `useColorScheme`  
- EAS Build integration for easy continuous deployment  
- OTA updates for pushing JS-only changes instantly without rebuilding  
- Secure APK signing managed via EAS credentials  
- Supports tablets on iOS with full layout scaling  
- Easy environment configuration using `app.json` extra field  

---

## Project Setup

### Prerequisites

- Node.js LTS installed  
- Expo CLI and EAS CLI installed globally:

npm install -g expo-cli eas-cli


- Android or iOS setup for device or simulator testing  
- An Expo account (sign up at https://expo.dev/)

### Clone this repository

git clone https://github.com/toshankanwar/Delivery-Andoid-APP-React-Native-
cd bakery-delivery-app


### Install dependencies

npm install
npx expo install


---

## Development

### Running Locally

Start the Expo development server with cache clear:

npx expo start --clear


You can test your app in Expo Go or on a simulator/emulator.

---

## Building the App

### Configure `eas.json`

Use this minimal EAS build configuration for Android APK build:

{
"cli": {
"version": ">= 3.13.0"
},
"build": {
"production": {
"android": {
"buildType": "apk"
}
}
}
}
### Build APK

Run the production build:

eas build --platform android --profile production


### Download APK

After build completes, download the `.apk` file from the Expo build artifacts page.

**Note**: The APK targets Android 7.0+ (API 24+) devices.

---

## APK Download Link

You can download the latest built APK here:

[https://expo.dev/artifacts/eas/pxCHo9wcQeTSP2csNaPGgE.apk](https://expo.dev/artifacts/eas/pxCHo9wcQeTSP2csNaPGgE.apk)

---

## Over-the-Air (OTA) Updates

You can update JS code, UI, and assets instantly without rebuilding or releasing a new APK.

### Setup `app.json` for OTA updates

Ensure your `app.json` includes:

{
"expo": {
...
"updates": {
"fallbackToCacheTimeout": 0
}
}
}

### Publish OTA Update

After making code changes, run:

eas update --branch production --message "Your update message"


Users will get the update the next time they open the app.

---

## Android Adaptive Icon

Your app uses Android adaptive icons configured like this in `app.json`:

"android": {
"adaptiveIcon": {
"foregroundImage": "./assets/adaptive-icon.png",
"backgroundColor": "#ffffff"
}
}

**Important:**  
- Adaptive icons cannot be changed via OTA updates; they require an APK rebuild.  
- Make sure your adaptive icon image is 1024x1024 PNG with transparent padding as per Android guidelines.  
- To update the launcher icon, replace the `./assets/adaptive-icon.png` image and rebuild your APK.

---

## Keystore & Signing

Expo manages your Android signing keys automatically via EAS:

- Running `eas build` on a new project will generate and manage your keystore.  
- To view or manage your keys, run:

eas credentials --platform android


- To reset or upload your own keystore, use the above CLI commands accordingly.

**Important:** Keep a local backup of your keystore to enable app updates.

---

## Troubleshooting

### Common build issues

- **Gradle errors related to `react-native-appearance`**: This package is deprecated. Remove it via:

npm uninstall react-native-appearance


and replace with `useColorScheme` from React Native core.

- **Parsing errors installing APK**:  

  - Verify you downloaded an `.apk` not `.aab` file.  
  - Ensure Android version ≥7.0 on your device.  
  - Use file manager to install, avoid direct install from browser.  
  - Rebuild with correct keystore and `buildType: "apk"`.

- **TurboModule / Native errors while app runs**:

  - Disable new React Native architecture by setting `"newArchEnabled": false` in `app.json`.

- **Icon not displaying correctly on Android**:

  - Android uses adaptive icons (`android.adaptiveIcon`). Ensure `foregroundImage` points to your logo.

---

## Folder Structure

/assets # Images (icon.png, adaptive-icon.png, splash-icon.png, favicon.png)
/android # Generated by EAS prebuild (if used)
/ios # Generated by Expo (if iOS customizations)
/node_modules # dependencies
/app.json # Expo config
/eas.json # EAS build profiles
/package.json # npm dependencies & scripts

---

## Contributing

1. Fork the project  
2. Create a new branch (`git checkout -b feature/your-feature`)  
3. Commit your changes (`git commit -m 'Add some feature'`)  
4. Push to the branch (`git push origin feature/your-feature`)  
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Contact

For questions or help, please open an issue on GitHub, or contact the maintainer via:

- Website: [https://toshankanwar.website](https://toshankanwar.website)  
- Email: contact@toshankanwar.website

---

# You're all set to develop, build, update, and manage your Bakery Delivery App like a pro! 🚀🍰📱  









