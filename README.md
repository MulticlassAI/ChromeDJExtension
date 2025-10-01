# Universal Music Player Controller

**A Chrome extension designed for DJs and music producers to quickly navigate through tracks on SoundCloud and YouTube Music.**

Skip the intro, find the drop, and get a feel for new tracks instantly with keyboard shortcuts that jump to key sections of any song. Perfect for playlist curation, track discovery, and rapid music evaluation.

## 🎯 What It Does

This extension adds **instant track navigation** to web music players, allowing you to:

- **Jump to different sections** of tracks without manual scrubbing
- **Quickly evaluate new music** by skipping to the most important parts
- **Efficiently browse playlists** and discover new tracks
- **Save time** when curating sets or building playlists
- **Get the essence** of a track in seconds, not minutes

## 🎹 For DJs & Producers

- **Track Discovery**: Instantly jump to drops, breakdowns, and key sections
- **Playlist Curation**: Quickly evaluate hundreds of tracks for your sets
- **A&R Workflow**: Rapidly assess new releases and demos
- **Remix Research**: Find the perfect sections to sample or remix
- **Set Preparation**: Preview tracks efficiently when building DJ sets

## ⌨️ Keyboard Shortcuts

### Track Navigation
- **`^ + Shift + ←`** - **Previous track**
- **`^ + Shift + →`** - **Next track**

### Fast Forward
- **`^ + F`** - **Fast forward** through song (cycles: 25% → 50% → 75% → 100% → repeat)

## 🎵 Supported Platforms

### ✅ Currently Supported
- **SoundCloud** (`*.soundcloud.com`) - Perfect for discovering new electronic music
- **YouTube Music** (`music.youtube.com`) - Great for mainstream and underground tracks
- **Spotify** (`open.spotify.com`) - World's largest music streaming platform

### 🔄 Coming Soon
- **YouTube** (`*.youtube.com/watch`) - Regular YouTube videos and music
- Bandcamp
- Beatport
- Apple Music Web
- Any other web-based music platform

## 🚀 Installation

### Quick Setup (5 minutes)

1. **Download** this repository as ZIP or clone it:
   ```bash
   git clone https://github.com/yourusername/music-player-controller.git
   ```

2. **Open Chrome Extensions**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the Extension**:
   - Click "Load unpacked"
   - Select the downloaded folder
   - The extension icon should appear in your toolbar

4. **Start Using**:
   - Visit SoundCloud, YouTube Music, or Spotify
   - Play any track
   - Use `^ + F` to fast forward through sections
   - Use `^ + Shift + ←/→` to navigate tracks

### Chrome Web Store
## 🎛️ How to Use

1. **Open** SoundCloud, YouTube Music, or Spotify in Chrome
2. **Play any track** you want to preview
3. **Use keyboard shortcuts** to navigate:
   - `^ + Shift + ←` → Previous track
   - `^ + Shift + →` → Next track
   - `^ + F` → Fast forward (1st press: 25%, 2nd: 50%, 3rd: 75%, 4th: 100%, then repeats)
4. **See instant feedback** showing where you jumped to
5. **Repeat** for rapid track evaluation

## 💡 Use Cases
- **Pre-gig prep**: Quickly preview hundreds of tracks for your set
- **Live discovery**: Find new music during downtime between sets
- **Track evaluation**: Assess energy levels and key sections instantly

### Music Producer Workflow  
- **Reference hunting**: Find inspiration by jumping to key sections
- **Sample research**: Locate perfect loops and breaks efficiently
- **Demo review**: Rapidly evaluate submissions and new releases

### Music Enthusiast
- **Playlist building**: Curate the perfect mix in record time
- **Discovery**: Get a feel for new genres and artists quickly
- **Sharing**: Preview tracks before sending to friends

## 🛠️ Technical Details

### Architecture
The extension uses a **modular, extensible architecture** that makes adding new platforms simple:

```
src/
├── core/
│   └── base-controller.js     # Abstract base class for all platforms
├── platforms/
│   ├── soundcloud.js          # SoundCloud-specific implementation
│   ├── youtube-music.js       # YouTube Music-specific implementation
│   └── template.js            # Template for adding new platforms
├── content.js                 # Main coordinator script
├── background.js              # Handles keyboard commands
└── manifest.json              # Chrome extension configuration
```

### Key Features
- **Cross-platform compatibility**: Works on SoundCloud and YouTube Music
- **Smart audio detection**: Automatically finds audio elements on different platforms
- **Fallback mechanisms**: Uses multiple methods to ensure compatibility
- **Visual feedback**: Shows confirmation with platform-specific styling
- **SPA support**: Handles single-page application navigation

## 🔧 Development

### Adding New Platforms

Want to add support for Spotify, Beatport, or another platform? It's easy:

1. **Copy** `src/platforms/template.js` to `src/platforms/yourplatform.js`
2. **Implement** the required methods:
   ```javascript
   isValidPlatform()     // Check if current page matches your platform
   findAudioElement()    // Locate the audio/video element
   getPlatformColor()    // Brand color for feedback (optional)
   ```
3. **Update** `manifest.json` to include your platform's URLs
4. **Test** and submit a pull request!

### Example Implementation
```javascript
class SpotifyController extends BaseMusicController {
    constructor() {
        super('Spotify');
    }

    isValidPlatform() {
        return window.location.hostname === 'open.spotify.com';
    }

    findAudioElement() {
        return document.querySelector('audio');
    }

    getPlatformColor() {
        return '#1db954'; // Spotify green
    }
}
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Add new platforms** - Spotify, Beatport, Bandcamp, etc.
2. **Improve existing implementations** - Better audio detection, more robust navigation
3. **Add new features** - More keyboard shortcuts, custom jump positions
4. **Fix bugs** - Report issues or submit fixes
5. **Improve documentation** - Help others understand and use the extension

### Development Setup
```bash
git clone https://github.com/yourusername/music-player-controller.git
cd music-player-controller
# Load as unpacked extension in Chrome
# Make your changes
# Test on supported platforms
# Submit a pull request
```

## 📝 License

MIT License - feel free to use, modify, and distribute.

## 🙏 Acknowledgments

Built for the DJ and music producer community. Special thanks to all the artists and platforms that make music discovery possible.

---

**Made with ❤️ for music lovers, DJs, and producers worldwide.**
