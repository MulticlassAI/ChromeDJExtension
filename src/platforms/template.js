/**
 * Template Music Controller
 * Copy this file and modify it to add support for new music platforms
 */

class TemplateMusicController extends BaseMusicController {
    constructor() {
        // Replace 'Template' with your platform name (e.g., 'Spotify', 'Apple Music')
        super('Template');
    }

    /**
     * Check if current page is your platform
     * Return true if the current URL matches your platform
     */
    isValidPlatform() {
        // Example: return window.location.hostname === 'open.spotify.com';
        return window.location.hostname === 'your-platform.com';
    }

    /**
     * Find your platform's audio/video element
     * Return the HTML audio or video element that plays music
     */
    findAudioElement() {
        // Common patterns:
        // return document.querySelector('audio');
        // return document.querySelector('video');
        // return document.querySelector('[data-testid="audio-player"]');
        
        // Try multiple selectors
        const selectors = [
            'audio',
            'video',
            '[data-testid="audio-element"]',
            '.audio-player audio',
            '#player audio'
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && (element.src || element.currentSrc)) {
                return element;
            }
        }
        
        return null;
    }

    /**
     * Get platform-specific player information (optional)
     * Return an object with track info like title, artist, etc.
     */
    getPlayerInfo() {
        const info = {};
        
        // Try to get track title
        const titleElement = document.querySelector('.track-title, .song-title, [data-testid="track-title"]');
        if (titleElement) {
            info.title = titleElement.textContent.trim();
        }

        // Try to get artist name
        const artistElement = document.querySelector('.artist-name, .track-artist, [data-testid="artist-name"]');
        if (artistElement) {
            info.artist = artistElement.textContent.trim();
        }

        // Try to get play button state
        const playButton = document.querySelector('.play-button, [data-testid="play-button"]');
        if (playButton) {
            info.isPlaying = playButton.classList.contains('playing') || 
                           playButton.getAttribute('aria-label')?.includes('Pause');
        }

        return info;
    }

    /**
     * Get your platform's brand color (optional)
     * Return a hex color code for visual feedback
     */
    getPlatformColor() {
        // Examples:
        // Spotify: '#1db954'
        // Apple Music: '#fa243c'
        // YouTube: '#ff0000'
        return '#007bff'; // Default blue
    }

    /**
     * Platform-specific initialization (optional)
     * Override this if you need custom setup
     */
    init() {
        super.init();
        
        if (this.isInitialized) {
            // Add any platform-specific setup here
            this.setupPlatformSpecificFeatures();
        }
    }

    /**
     * Setup platform-specific features (optional)
     */
    setupPlatformSpecificFeatures() {
        // Example: Monitor for track changes
        // this.monitorTrackChanges();
        
        // Example: Setup custom DOM observers
        // this.setupCustomObserver();
    }

    /**
     * Monitor for track changes (optional)
     */
    monitorTrackChanges() {
        let lastTrackInfo = null;
        
        const checkTrackChange = () => {
            const currentInfo = this.getPlayerInfo();
            const currentTrack = `${currentInfo.artist} - ${currentInfo.title}`;
            
            if (lastTrackInfo && lastTrackInfo !== currentTrack && currentTrack !== ' - ') {
                console.log(`${this.platformName} Controller: Track changed to ${currentTrack}`);
            }
            
            lastTrackInfo = currentTrack;
        };

        // Check for track changes every 2 seconds
        setInterval(checkTrackChange, 2000);
    }
}

// Initialize controller if on your platform
// Replace the condition with your platform's URL pattern
if (window.location.hostname === 'your-platform.com') {
    window.templateController = new TemplateMusicController();
}

/*
STEPS TO ADD A NEW PLATFORM:

1. Copy this file to a new file (e.g., 'spotify.js')
2. Replace 'Template' with your platform name throughout the file
3. Update isValidPlatform() to match your platform's URL
4. Update findAudioElement() to find your platform's audio element
5. Update getPlayerInfo() to extract track information (optional)
6. Update getPlatformColor() with your platform's brand color (optional)
7. Add your platform's URLs to manifest.json in the "matches" array
8. Add your script file to manifest.json in the "js" array
9. Update content.js to initialize your controller
10. Test the extension on your platform

Example for Spotify:
- File: src/platforms/spotify.js
- Class: SpotifyController
- URL: open.spotify.com
- Color: #1db954
- Audio selector: Usually 'audio' or '[data-testid="audio-element"]'
*/
