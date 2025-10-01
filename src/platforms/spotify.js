/**
 * Spotify Web Player Controller
 * Handles Spotify-specific functionality
 */

class SpotifyController extends BaseMusicController {
    constructor() {
        super('Spotify');
    }

    /**
     * Check if current page is Spotify
     */
    isValidPlatform() {
        return window.location.hostname === 'open.spotify.com';
    }

    /**
     * Find Spotify's audio element or player
     */
    findAudioElement() {
        // Spotify uses a complex audio system, try multiple approaches
        
        // 1. Look for HTML5 audio elements
        const audioElements = document.querySelectorAll('audio');
        for (let audio of audioElements) {
            if (audio.src || audio.currentSrc) {
                return audio;
            }
        }
        
        // 2. Look for any audio element (even without src)
        const allAudios = document.querySelectorAll('audio');
        if (allAudios.length > 0) {
            return allAudios[0];
        }
        
        // 3. Spotify might use Web Audio API or other methods
        // We'll handle this through button clicking instead
        return null;
    }

    /**
     * Get Spotify-specific player information
     */
    getPlayerInfo() {
        const info = {};
        
        // Try to get track title using the actual HTML structure
        const titleSelectors = [
            '[data-testid="context-item-info-title"] a',
            '[data-testid="context-item-info-title"]',
            '[data-testid="now-playing-widget"] [dir="auto"]'
        ];
        
        for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                info.title = element.textContent.trim();
                break;
            }
        }

        // Try to get artist name using the actual HTML structure
        const artistSelectors = [
            '[data-testid="context-item-info-artist"]',
            '[data-testid="context-item-info-subtitles"] a'
        ];
        
        for (const selector of artistSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                info.artist = element.textContent.trim();
                break;
            }
        }

        return info;
    }

    /**
     * Get Spotify's brand color
     */
    getPlatformColor() {
        return '#1db954'; // Spotify green
    }

    /**
     * Jump to position using Spotify's progress bar
     */
    jumpToPositionViaProgressBar(position) {
        // Look for Spotify's progress bar using the actual HTML structure
        const progressBarSelectors = [
            '[data-testid="progress-bar"]',
            '[data-testid="playback-progressbar"]',
            '.NP0jD9fPfkH_VmIJ4hEg',
            '.BDW4CFlIaMu9sHJRFCCg'
        ];
        
        for (const selector of progressBarSelectors) {
            const progressBar = document.querySelector(selector);
            if (progressBar) {
                const rect = progressBar.getBoundingClientRect();
                
                // Check if element is visible and has reasonable dimensions
                if (rect.width === 0 || rect.height === 0 || rect.top < 0 || rect.top > window.innerHeight) {
                    console.log(`Spotify Controller: Progress bar ${selector} not visible or has invalid dimensions:`, rect);
                    continue;
                }
                
                const targetX = rect.left + (rect.width * position);
                const targetY = rect.top + (rect.height / 2);
                
                console.log(`Spotify Controller: Found progress bar ${selector} with rect:`, rect);
                console.log(`Spotify Controller: Trying click on progress bar at (${targetX}, ${targetY})`);
                
                // Check if click coordinates are reasonable
                if (targetX < 0 || targetX > window.innerWidth || targetY < 0 || targetY > window.innerHeight) {
                    console.log(`Spotify Controller: Click coordinates out of bounds, skipping`);
                    continue;
                }
                
                // Try multiple event types
                const events = ['mousedown', 'click', 'mouseup'];
                events.forEach(eventType => {
                    const event = new MouseEvent(eventType, {
                        bubbles: true,
                        cancelable: true,
                        clientX: targetX,
                        clientY: targetY,
                        button: 0
                    });
                    progressBar.dispatchEvent(event);
                });
                
                const percentage = Math.round(position * 100);
                this.showFeedback(`Jumped to ${percentage}%`);
                console.log(`Spotify Controller: Attempted jump to ${percentage}% via progress bar`);
                return true;
            }
        }
        
        return false;
    }

    /**
     * Override jumpToPosition to use Spotify-specific methods
     */
    jumpToPosition(position) {
        console.log(`Spotify Controller: Attempting to jump to ${Math.round(position * 100)}%...`);
        
        // First try the standard audio element approach
        const audio = this.findAudioElement();
        if (audio && audio.duration && !isNaN(audio.duration)) {
            const targetTime = audio.duration * position;
            audio.currentTime = targetTime;
            
            const percentage = Math.round(position * 100);
            const playerInfo = this.getPlayerInfo();
            console.log(`Spotify Controller: Jumped to ${percentage}% via audio element (${Math.round(targetTime)}s of ${Math.round(audio.duration)}s)`, playerInfo);
            
            this.showFeedback(`Jumped to ${this.formatTime(targetTime)} (${percentage}%)`);
            return;
        }
        
        console.log('Spotify Controller: Audio element approach failed, trying input range...');
        
        // Try to find and manipulate the input range element directly
        if (this.jumpToPositionViaInputRange(position)) {
            return;
        }
        
        console.log('Spotify Controller: Input range approach failed, trying progress bar...');
        
        // If input range approach fails, try progress bar method
        if (this.jumpToPositionViaProgressBar(position)) {
            return;
        }
        
        // If all methods fail, show error
        console.log('Spotify Controller: All methods failed');
        this.showFeedback('Cannot jump - player not accessible');
    }

    /**
     * Jump to position using Spotify's input range element
     */
    jumpToPositionViaInputRange(position) {
        // Look for the input range element
        const inputRange = document.querySelector('input[type="range"][min="0"]');
        if (inputRange) {
            const max = parseInt(inputRange.max);
            if (max && !isNaN(max)) {
                const targetValue = Math.floor(max * position);
                
                console.log(`Spotify Controller: Found input range with max=${max}, setting to ${targetValue}`);
                
                // Set the value and trigger events
                inputRange.value = targetValue;
                
                // Trigger input and change events
                const inputEvent = new Event('input', { bubbles: true });
                const changeEvent = new Event('change', { bubbles: true });
                
                inputRange.dispatchEvent(inputEvent);
                inputRange.dispatchEvent(changeEvent);
                
                const percentage = Math.round(position * 100);
                this.showFeedback(`Jumped to ${percentage}%`);
                console.log(`Spotify Controller: Set input range to ${percentage}%`);
                return true;
            }
        }
        
        console.log('Spotify Controller: Input range not found or invalid');
        return false;
    }

    /**
     * Override fastForward to use Spotify-specific methods
     */
    fastForward() {
        // Increment position (1=25%, 2=50%, 3=75%, 4=100%)
        this.fastForwardPosition = (this.fastForwardPosition % 4) + 1;
        
        const position = this.fastForwardPosition * 0.25;
        const percentage = this.fastForwardPosition * 25;
        
        console.log(`Spotify Controller: Fast forward to ${percentage}% (position ${this.fastForwardPosition})`);
        
        // Use Spotify-specific jump method
        this.jumpToPosition(position);
    }

    /**
     * Go to previous track on Spotify
     */
    previousTrack() {
        // Look for Spotify's previous button using the actual HTML structure
        const prevButtonSelectors = [
            '[data-testid="control-button-skip-back"]',
            'button[aria-label="Previous"]',
            '[aria-label*="Previous" i]'
        ];
        
        for (const selector of prevButtonSelectors) {
            const button = document.querySelector(selector);
            if (button && !button.disabled) {
                button.click();
                console.log(`Spotify Controller: Clicked previous track button (${selector})`);
                this.showFeedback('Previous track');
                return true;
            }
        }
        
        // Try keyboard shortcut as fallback
        document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
            shiftKey: true,
            bubbles: true
        }));
        
        console.log('Spotify Controller: Previous track button not found, tried keyboard shortcut');
        this.showFeedback('Previous track (keyboard)');
        return true;
    }

    /**
     * Go to next track on Spotify
     */
    nextTrack() {
        // Look for Spotify's next button using the actual HTML structure
        const nextButtonSelectors = [
            '[data-testid="control-button-skip-forward"]',
            'button[aria-label="Next"]',
            '[aria-label*="Next" i]'
        ];
        
        for (const selector of nextButtonSelectors) {
            const button = document.querySelector(selector);
            if (button && !button.disabled) {
                button.click();
                console.log(`Spotify Controller: Clicked next track button (${selector})`);
                this.showFeedback('Next track');
                return true;
            }
        }
        
        // Try keyboard shortcut as fallback
        document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            shiftKey: true,
            bubbles: true
        }));
        
        console.log('Spotify Controller: Next track button not found, tried keyboard shortcut');
        this.showFeedback('Next track (keyboard)');
        return true;
    }

    /**
     * Spotify-specific initialization
     */
    init() {
        super.init();
        
        if (this.isInitialized) {
            // Handle Spotify's single-page application navigation
            this.handleNavigation();
            
            // Additional Spotify-specific setup can go here
            this.setupSpotifySpecificFeatures();
        }
    }

    /**
     * Setup Spotify-specific features
     */
    setupSpotifySpecificFeatures() {
        // Wait for Spotify's player to load
        setTimeout(() => {
            console.log('Spotify Controller: Setting up Spotify-specific features...');
            
            // Additional Spotify-specific initialization can go here
            // For example, listening to Spotify's internal events
        }, 1000);
    }

    /**
     * Handle navigation changes in Spotify's SPA
     */
    handleNavigation() {
        // Listen for URL changes in Spotify's single-page application
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                console.log('Spotify Controller: Navigation detected, reinitializing...');
                
                // Reinitialize after navigation
                setTimeout(() => {
                    this.setupSpotifySpecificFeatures();
                }, 500);
            }
        }).observe(document, { subtree: true, childList: true });
    }
}

// Initialize Spotify controller if on Spotify
if (window.location.hostname === 'open.spotify.com') {
    window.spotifyController = new SpotifyController();
}
