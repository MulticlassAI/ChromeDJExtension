/**
 * SoundCloud Music Controller
 * Handles SoundCloud-specific functionality
 */

class SoundCloudController extends BaseMusicController {
    constructor() {
        super('SoundCloud');
    }

    /**
     * Check if current page is SoundCloud
     */
    isValidPlatform() {
        return window.location.hostname.includes('soundcloud.com');
    }

    /**
     * Find SoundCloud's audio element
     */
    findAudioElement() {
        // SoundCloud typically uses a single audio element
        const audioElements = document.querySelectorAll('audio');
        console.log(`SoundCloud Controller: Found ${audioElements.length} audio elements`);
        
        // Look for the main audio element (usually the first one)
        for (let i = 0; i < audioElements.length; i++) {
            const audio = audioElements[i];
            console.log(`SoundCloud Controller: Audio ${i}:`, {
                src: audio.src,
                currentSrc: audio.currentSrc,
                duration: audio.duration,
                currentTime: audio.currentTime,
                paused: audio.paused
            });
            
            if (audio.src || audio.currentSrc) {
                return audio;
            }
        }
        
        // If no audio with src found, return the first audio element
        if (audioElements.length > 0) {
            console.log('SoundCloud Controller: No audio with src found, returning first audio element');
            return audioElements[0];
        }
        
        console.log('SoundCloud Controller: No audio elements found');
        return null;
    }

    /**
     * Get SoundCloud-specific player information
     */
    getPlayerInfo() {
        const info = {};
        
        // Try to get track title
        const titleElement = document.querySelector('.playbackSoundBadge__titleLink, .soundTitle__title, [data-testid="sound-title"]');
        if (titleElement) {
            info.title = titleElement.textContent.trim();
        }

        // Try to get artist name
        const artistElement = document.querySelector('.playbackSoundBadge__lightLink, .soundTitle__username, [data-testid="sound-artist"]');
        if (artistElement) {
            info.artist = artistElement.textContent.trim();
        }

        return info;
    }

    /**
     * Get SoundCloud's brand color
     */
    getPlatformColor() {
        return '#ff5500'; // SoundCloud orange
    }

    /**
     * Jump to position using SoundCloud's progress bar
     */
    jumpToPositionViaProgressBar(position) {
        const progressWrapper = document.querySelector('.playbackTimeline__progressWrapper');
        if (!progressWrapper) {
            console.log('SoundCloud Controller: Progress bar not found');
            return false;
        }

        const maxValue = parseInt(progressWrapper.getAttribute('aria-valuemax'));
        if (!maxValue || isNaN(maxValue)) {
            console.log('SoundCloud Controller: Could not get track duration');
            return false;
        }

        const targetTime = Math.floor(maxValue * position);
        
        const clickTargets = [
            '.playbackTimeline__progressBackground',
            '.playbackTimeline__progressWrapper',
            '.playbackTimeline__progressBar'
        ];
        
        for (const selector of clickTargets) {
            const element = document.querySelector(selector);
            if (element) {
                const rect = element.getBoundingClientRect();
                const targetX = rect.left + (rect.width * position);
                const targetY = rect.top + (rect.height / 2);
                
                console.log(`SoundCloud Controller: Trying click on ${selector} at (${targetX}, ${targetY})`);
                
                const events = ['mousedown', 'click', 'mouseup'];
                events.forEach(eventType => {
                    const event = new MouseEvent(eventType, {
                        bubbles: true,
                        cancelable: true,
                        clientX: targetX,
                        clientY: targetY,
                        button: 0
                    });
                    element.dispatchEvent(event);
                });
                
                const touchEvent = new TouchEvent('touchstart', {
                    bubbles: true,
                    cancelable: true,
                    touches: [{
                        clientX: targetX,
                        clientY: targetY
                    }]
                });
                element.dispatchEvent(touchEvent);
            }
        }
        
        const minutes = Math.floor(targetTime / 60);
        const seconds = targetTime % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        const percentage = Math.round(position * 100);
        this.showFeedback(`Attempted jump to ${timeString} (${percentage}%)`);
        
        console.log(`SoundCloud Controller: Attempted jump to ${percentage}% via progress bar (${timeString})`);
        return true;
    }

    /**
     * Override jumpToPosition to use SoundCloud-specific methods
     */
    jumpToPosition(position) {
        console.log(`SoundCloud Controller: Attempting to jump to ${Math.round(position * 100)}%...`);
        
        const audio = this.findAudioElement();
        console.log('SoundCloud Controller: Audio element found:', audio);
        
        if (audio && audio.duration && !isNaN(audio.duration)) {
            const targetTime = audio.duration * position;
            console.log(`SoundCloud Controller: Setting currentTime from ${audio.currentTime} to ${targetTime}`);
            audio.currentTime = targetTime;
            
            const percentage = Math.round(position * 100);
            const playerInfo = this.getPlayerInfo();
            console.log(`SoundCloud Controller: Jumped to ${percentage}% via audio element (${Math.round(targetTime)}s of ${Math.round(audio.duration)}s)`, playerInfo);
            
            this.showFeedback(`Jumped to ${this.formatTime(targetTime)} (${percentage}%)`);
            return;
        }
        
        console.log('SoundCloud Controller: Audio element approach failed, trying progress bar...');
        
        if (this.jumpToPositionViaProgressBar(position)) {
            return;
        }
        
        console.log('SoundCloud Controller: All methods failed');
        this.showFeedback('Cannot jump - player not accessible');
    }

    /**
     * Override jump to middle to use jumpToPosition
     */
    jumpToMiddle() {
        this.jumpToPosition(0.5);
    }

    /**
     * Override fastForward to use SoundCloud-specific methods
     */
    fastForward() {
        // Increment position (1=25%, 2=50%, 3=75%, 4=100%)
        this.fastForwardPosition = (this.fastForwardPosition % 4) + 1;
        
        const position = this.fastForwardPosition * 0.25;
        const percentage = this.fastForwardPosition * 25;
        
        console.log(`SoundCloud Controller: Fast forward to ${percentage}% (position ${this.fastForwardPosition})`);
        
        // Use SoundCloud-specific jump method
        this.jumpToPosition(position);
    }

    /**
     * Go to previous track on SoundCloud
     */
    previousTrack() {
        // Look for SoundCloud's previous button
        const prevButton = document.querySelector('.skipControl__previous, .playControls__prev');
        if (prevButton && !prevButton.disabled) {
            prevButton.click();
            console.log('SoundCloud Controller: Clicked previous track button');
            this.showFeedback('Previous track');
            return true;
        }
        
        // Alternative selectors for different SoundCloud layouts
        const altPrevButtons = [
            '.playControls .skipControl:first-child',
            '[title*="previous" i]',
            '[aria-label*="previous" i]'
        ];
        
        for (const selector of altPrevButtons) {
            const button = document.querySelector(selector);
            if (button && !button.disabled) {
                button.click();
                console.log(`SoundCloud Controller: Clicked previous track button (${selector})`);
                this.showFeedback('Previous track');
                return true;
            }
        }
        
        console.log('SoundCloud Controller: Previous track button not found');
        this.showFeedback('Previous track not available');
        return false;
    }

    /**
     * Go to next track on SoundCloud
     */
    nextTrack() {
        // Look for SoundCloud's next button
        const nextButton = document.querySelector('.skipControl__next, .playControls__next');
        if (nextButton && !nextButton.disabled) {
            nextButton.click();
            console.log('SoundCloud Controller: Clicked next track button');
            this.showFeedback('Next track');
            return true;
        }
        
        // Alternative selectors for different SoundCloud layouts
        const altNextButtons = [
            '.playControls .skipControl:last-child',
            '[title*="next" i]',
            '[aria-label*="next" i]'
        ];
        
        for (const selector of altNextButtons) {
            const button = document.querySelector(selector);
            if (button && !button.disabled) {
                button.click();
                console.log(`SoundCloud Controller: Clicked next track button (${selector})`);
                this.showFeedback('Next track');
                return true;
            }
        }
        
        console.log('SoundCloud Controller: Next track button not found');
        this.showFeedback('Next track not available');
        return false;
    }

    /**
     * SoundCloud-specific initialization
     */
    init() {
        super.init();
        
        if (this.isInitialized) {
            // Handle SoundCloud's single-page application navigation
            this.handleNavigation();
            
            // Additional SoundCloud-specific setup can go here
            this.setupSoundCloudSpecificFeatures();
        }
    }

    /**
     * Setup SoundCloud-specific features
     */
    setupSoundCloudSpecificFeatures() {
        // Wait for SoundCloud's player to load
        setTimeout(() => {
            console.log('SoundCloud Controller: Setting up SoundCloud-specific features...');
            
            // Additional SoundCloud-specific initialization can go here
            // For example, listening to SoundCloud's internal events
        }, 1000);
    }

    /**
     * Handle navigation changes in SoundCloud's SPA
     */
    handleNavigation() {
        // Listen for URL changes in SoundCloud's single-page application
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                console.log('SoundCloud Controller: Navigation detected, reinitializing...');
                
                // Reinitialize after navigation
                setTimeout(() => {
                    this.setupSoundCloudSpecificFeatures();
                }, 500);
            }
        }).observe(document, { subtree: true, childList: true });
    }
}

// Initialize SoundCloud controller if on SoundCloud
if (window.location.hostname.includes('soundcloud.com')) {
    window.soundCloudController = new SoundCloudController();
}
