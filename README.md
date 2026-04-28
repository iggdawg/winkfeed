# WinkFeed

WinkFeed is a high-performance, unified social aggregator built with React Native and Expo. Deeply inspired by the classic HTC BlinkFeed aesthetic, it seamlessly merges content from Reddit, Bluesky, Mastodon, and the Open Web into a single, beautifully organized chronological timeline.

## ✨ Features

- **Unified Chronological Feed:** A perfectly interleaved masonry grid combining your favorite subreddits, decentralized fediverse timelines, and custom news topics.
- **Dynamic Weather Header:** A sleek, dashboard-style header that pulls your live location and weather data, shifting its gradient background to match the time of day and current forecast.
- **Dedicated Media Gallery:** A visual-first tab that isolates image and video content from Bluesky, Mastodon, and Reddit into an edge-to-edge media feed.
- **Smart Video Autoplay:** Powered by `expo-video` and `expo-network`, videos load natively and seamlessly. Autoplay policies intelligently adapt to your network state (Wi-Fi vs. Cellular) to save your mobile data.
- **Deep Personalization:** A robust settings suite backed by `zustand` allows you to manage active sources, blacklist specific news outlets, provide custom Mastodon instance credentials, and toggle network constraints.

## 🛠 Tech Stack

- **Framework:** [Expo](https://expo.dev/) & React Native (SDK 54)
- **State Management:** `zustand` (with persistent storage)
- **Navigation:** Expo Router (File-based routing)
- **UI & Layout:** `@shopify/flash-list` for performant masonry grids
- **Media:** `expo-video`, `expo-image`
- **Device Integrations:** `expo-location`, `expo-network`, `expo-secure-store`

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and the Expo CLI installed.
If you'd like to run a local EAS build, ensure you have the Android SDK configured.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iggdawg/winkfeed.git
   cd winkfeed
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npm start
   ```

### Building the APK

You can build a standalone Android APK directly on your local machine using EAS Build.
*Note: You must have the Android SDK installed and your `ANDROID_HOME` environment variable properly configured.*

```bash
eas build -p android --profile preview --local
```

Alternatively, omit the `--local` flag to compile the app using Expo's cloud servers.

## 📡 API Integrations

WinkFeed respects your privacy and utilizes direct device-to-API requests wherever possible.
- **Reddit:** Unauthenticated JSON API parsing (`r/all.json`).
- **Bluesky:** Built on the official `@atproto/api` for native thread resolution.
- **Mastodon:** REST API integration supporting any valid fediverse instance.
- **NewsAPI:** Direct polling with client-side blocklist filtering.
- **Open-Meteo:** Privacy-first, keyless weather data endpoint.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License

This project is licensed under the MIT License.
