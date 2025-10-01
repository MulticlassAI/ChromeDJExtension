/**
 * YouTube Music Controller
 * Handles YouTube Music-specific player interactions
 */

class YouTubeMusicController extends BaseMusicController {
    constructor() {
        super('YouTube Music');
        // Explicitly reset fast forward position
        this.fastForwardPosition = 0;
        console.log('YouTube Music Controller: Constructor called, fastForwardPosition reset to 0');
    }

    /**
     * Check if current page is YouTube Music
     */
    isValidPlatform() {
        return window.location.hostname === 'music.youtube.com' || 
               (window.location.hostname.includes('youtube.com') && 
                window.location.pathname.includes('/watch'));
    }

    /**
     * Find YouTube Music's audio/video element
     */
    findAudioElement() {
        // YouTube Music uses video elements for audio
        const videoElements = document.querySelectorAll('video');
        
        // Find the main player video element
        for (let video of videoElements) {
            if (video.src || video.currentSrc) {
                return video;
            }
        }

        // Fallback: try to find audio elements
        const audioElements = document.querySelectorAll('audio');
        for (let audio of audioElements) {
            if (audio.src || audio.currentSrc) {
                return audio;
            }
        }

        return null;
    }

    /**
     * Get YouTube Music-specific player information
     */
    getPlayerInfo() {
        const info = {};
        
        // Try to get track title from YouTube Music
        let titleElement = document.querySelector('.title.ytmusic-player-bar, .ytp-title-text a, h1.title');
        if (!titleElement) {
            // Alternative selectors for different YouTube layouts
            titleElement = document.querySelector('[class*="title"]:not([class*="subtitle"])', 
                                                 '.ytmusic-player-bar .title',
                                                 '.ytp-videowall-still-info-title');
        }
        if (titleElement) {
            info.title = titleElement.textContent.trim();
        }

        // Try to get artist/channel name
        let artistElement = document.querySelector('.subtitle.ytmusic-player-bar, .ytp-title-channel-name, .byline');
        if (!artistElement) {
            artistElement = document.querySelector('[class*="subtitle"]', 
                                                 '.ytmusic-player-bar .subtitle',
                                                 '.ytp-videowall-still-info-author');
        }
        if (artistElement) {
            info.artist = artistElement.textContent.trim();
        }

        // Try to get play button state
        const playButton = document.querySelector('.play-pause-button, .ytp-play-button, [aria-label*="Play"], [aria-label*="Pause"]');
        if (playButton) {
            const ariaLabel = playButton.getAttribute('aria-label') || '';
            info.isPlaying = ariaLabel.includes('Pause') || playButton.classList.contains('playing');
        }

        // Get video/audio element info
        const mediaElement = this.findAudioElement();
        if (mediaElement) {
            info.currentTime = mediaElement.currentTime;
            info.duration = mediaElement.duration;
            info.paused = mediaElement.paused;
        }

        return info;
    }

    /**
     * Get YouTube's brand color
     */
    getPlatformColor() {
        return '#ff0000'; // YouTube red
    }

    /**
     * YouTube Music-specific initialization
     */
    init() {
        // Reset fast forward position on init
        this.fastForwardPosition = 0;
        console.log('YouTube Music Controller: init() called, fastForwardPosition reset to 0');
        
        super.init();
        
        if (this.isInitialized) {
            // Handle YouTube's single-page application navigation
            this.handleNavigation();
            
            // Additional YouTube Music-specific setup
            this.setupYouTubeMusicSpecificFeatures();
        }
    }

    /**
     * Setup YouTube Music-specific features
     */
    setupYouTubeMusicSpecificFeatures() {
        // Monitor for track changes
        this.monitorTrackChanges();
        
        // Handle YouTube's complex DOM updates
        this.setupAdvancedDOMObserver();
    }

    /**
     * Monitor for track changes in YouTube Music
     */
    monitorTrackChanges() {
        let lastTrackInfo = null;
        
        const checkTrackChange = () => {
            const currentInfo = this.getPlayerInfo();
            const currentTrack = `${currentInfo.artist} - ${currentInfo.title}`;
            
            if (lastTrackInfo && lastTrackInfo !== currentTrack && currentTrack !== ' - ') {
                console.log(`YouTube Music Controller: Track changed to ${currentTrack}`);
                // Reset fast forward position when track changes
                this.fastForwardPosition = 0;
            }
            
            lastTrackInfo = currentTrack;
        };

        // Check for track changes every 2 seconds
        setInterval(checkTrackChange, 2000);
    }

    /**
     * Setup advanced DOM observer for YouTube's dynamic content
     */
    setupAdvancedDOMObserver() {
        // YouTube heavily uses dynamic content loading
        const observer = new MutationObserver((mutations) => {
            let shouldReinit = false;
            
            mutations.forEach((mutation) => {
                // Check if player elements were added/removed
                if (mutation.type === 'childList') {
                    const addedNodes = Array.from(mutation.addedNodes);
                    const removedNodes = Array.from(mutation.removedNodes);
                    
                    const hasPlayerChanges = [...addedNodes, ...removedNodes].some(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            return node.matches && (
                                node.matches('video, audio') ||
                                node.querySelector && node.querySelector('video, audio') ||
                                node.classList.contains('ytmusic-player') ||
                                node.classList.contains('ytp-player')
                            );
                        }
                        return false;
                    });
                    
                    if (hasPlayerChanges) {
                        shouldReinit = true;
                    }
                }
            });
            
            if (shouldReinit) {
                // Debounce reinitializations
                clearTimeout(this.reinitTimeout);
                this.reinitTimeout = setTimeout(() => {
                    if (this.isValidPlatform()) {
                        console.log('YouTube Music Controller: Reinitializing due to DOM changes');
                        this.isInitialized = false;
                        this.init();
                    }
                }, 1000);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Override fastForward to prevent YouTube Music interference
     */
    fastForward() {
        // Prevent YouTube Music's own keyboard shortcuts from interfering
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            // Don't interfere if user is typing
            return;
        }
        
        console.log(`YouTube Music Controller: fastForward called, current position: ${this.fastForwardPosition}`);
        
        // Increment position (1=25%, 2=50%, 3=75%, 4=100%)
        this.fastForwardPosition = (this.fastForwardPosition % 4) + 1;
        
        const position = this.fastForwardPosition * 0.25;
        const percentage = this.fastForwardPosition * 25;
        
        console.log(`YouTube Music Controller: Fast forward to ${percentage}% (position ${this.fastForwardPosition})`);
        
        // Use jumpToPosition method
        this.jumpToPosition(position);
    }

    /**
     * Override jumpToPosition for YouTube Music-specific behavior
     */
    jumpToPosition(position) {
        console.log(`YouTube Music Controller: Attempting to jump to ${Math.round(position * 100)}%...`);
        
        const mediaElement = this.findAudioElement();
        
        if (!mediaElement) {
            console.log('YouTube Music Controller: No media element found');
            this.showFeedback('No media player found');
            return;
        }

        // YouTube sometimes needs a moment to load duration
        if (!mediaElement.duration || isNaN(mediaElement.duration)) {
            console.log('YouTube Music Controller: Duration not available, trying to load...');
            
            // Try to trigger duration loading
            if (mediaElement.load) {
                mediaElement.load();
            }
            
            // Wait a bit and try again
            setTimeout(() => {
                if (mediaElement.duration && !isNaN(mediaElement.duration)) {
                    const targetTime = mediaElement.duration * position;
                    mediaElement.currentTime = targetTime;
                    
                    const percentage = Math.round(position * 100);
                    const playerInfo = this.getPlayerInfo();
                    console.log(`YouTube Music Controller: Jumped to ${percentage}% (${Math.round(targetTime)}s of ${Math.round(mediaElement.duration)}s)`, playerInfo);
                    
                    this.showFeedback(`Jumped to ${this.formatTime(targetTime)} (${percentage}%)`);
                } else {
                    console.log('YouTube Music Controller: Duration still not available');
                    this.showFeedback('Cannot jump - video not fully loaded');
                }
            }, 500);
            
            return;
        }

        // Standard jump to position
        const targetTime = mediaElement.duration * position;
        mediaElement.currentTime = targetTime;
        
        const percentage = Math.round(position * 100);
        const playerInfo = this.getPlayerInfo();
        console.log(`YouTube Music Controller: Jumped to ${percentage}% (${Math.round(targetTime)}s of ${Math.round(mediaElement.duration)}s)`, playerInfo);
        
        this.showFeedback(`Jumped to ${this.formatTime(targetTime)} (${percentage}%)`);
    }

    /**
     * Override jump to middle for YouTube-specific behavior
     */
    jumpToMiddle() {
        const mediaElement = this.findAudioElement();
        
        if (!mediaElement) {
            console.log(`${this.platformName} Controller: No media element found`);
            this.showFeedback('No media player found');
            return;
        }

        // YouTube sometimes needs a moment to load duration
        if (!mediaElement.duration || isNaN(mediaElement.duration)) {
            // Try to trigger duration loading
            if (mediaElement.load) {
                mediaElement.load();
            }
            
            // Wait a bit and try again
            setTimeout(() => {
                if (mediaElement.duration && !isNaN(mediaElement.duration)) {
                    const middleTime = mediaElement.duration / 2;
                    mediaElement.currentTime = middleTime;
                    
                    const playerInfo = this.getPlayerInfo();
                    console.log(`${this.platformName} Controller: Jumped to middle (${Math.round(middleTime)}s of ${Math.round(mediaElement.duration)}s)`, playerInfo);
                    
                    this.showFeedback(`Jumped to ${this.formatTime(middleTime)}`);
                } else {
                    console.log(`${this.platformName} Controller: Duration still not available`);
                    this.showFeedback('Cannot jump - video not fully loaded');
                }
            }, 500);
            
            return;
        }

        // Standard jump to middle
        super.jumpToMiddle();
    }

    /**
     * Go to previous track on YouTube Music
     */
    previousTrack() {
        // Look for YouTube Music's previous button
        const prevButtons = [
            '.previous-button',
            '.ytmusic-player-bar .previous-button',
            '[aria-label*="Previous" i]',
            '[title*="Previous" i]',
            '.ytp-prev-button'
        ];
        
        for (const selector of prevButtons) {
            const button = document.querySelector(selector);
            if (button && !button.disabled) {
                button.click();
                console.log(`YouTube Music Controller: Clicked previous track button (${selector})`);
                this.showFeedback('Previous track');
                return true; // Return immediately after successful click
            }
        }
        
        // Try keyboard shortcut as fallback ONLY if button click failed
        console.log('YouTube Music Controller: Previous track button not found, trying keyboard shortcut');
        document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'j',
            shiftKey: true,
            bubbles: true
        }));
        
        this.showFeedback('Previous track (keyboard)');
        return true;
    }

    /**
     * Go to next track on YouTube Music
     */
    nextTrack() {
        // Look for YouTube Music's next button
        const nextButtons = [
            '.next-button',
            '.ytmusic-player-bar .next-button',
            '[aria-label*="Next" i]',
            '[title*="Next" i]',
            '.ytp-next-button'
        ];
        
        for (const selector of nextButtons) {
            const button = document.querySelector(selector);
            if (button && !button.disabled) {
                button.click();
                console.log(`YouTube Music Controller: Clicked next track button (${selector})`);
                this.showFeedback('Next track');
                return true; // Return immediately after successful click
            }
        }
        
        // Try keyboard shortcut as fallback ONLY if button click failed
        console.log('YouTube Music Controller: Next track button not found, trying keyboard shortcut');
        document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'k',
            shiftKey: true,
            bubbles: true
        }));
        
        this.showFeedback('Next track (keyboard)');
        return true;
    }
}

// Initialize YouTube Music controller if on YouTube Music or YouTube
if (window.location.hostname === 'music.youtube.com' || 
    (window.location.hostname.includes('youtube.com') && window.location.pathname.includes('/watch'))) {
    // Always create a fresh instance to avoid state persistence issues
    window.youtubeMusicController = new YouTubeMusicController();
    console.log('YouTube Music Controller: Fresh instance created');
}
