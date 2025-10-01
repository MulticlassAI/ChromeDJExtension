/**
 * Base Music Player Controller
 * Abstract base class for music platform controllers
 */

class BaseMusicController {
    constructor(platformName) {
        this.platformName = platformName;
        this.isInitialized = false;
        this.fastForwardPosition = 0; // Track current fast forward position (0=start, 1=25%, 2=50%, 3=75%, 4=100%)
        this.shortcuts = {
            jumpToMiddle: { key: 'h', modifiers: ['alt'] }
        };
    }

    /**
     * Initialize the controller
     */
    init() {
        if (this.isInitialized) return;
        
        console.log(`${this.platformName} Controller: Initializing...`);
        
        if (this.isValidPlatform()) {
            this.setupEventListeners();
            this.isInitialized = true;
            this.showFeedback(`${this.platformName} Controller Ready! Use Option+H to jump to middle`);
            console.log(`${this.platformName} Controller: Initialized successfully`);
        }
    }

    /**
     * Check if current page is valid for this platform
     * Must be implemented by subclasses
     */
    isValidPlatform() {
        throw new Error('isValidPlatform() must be implemented by subclass');
    }

    /**
     * Find the audio element for this platform
     * Must be implemented by subclasses
     */
    findAudioElement() {
        throw new Error('findAudioElement() must be implemented by subclass');
    }

    /**
     * Get additional platform-specific player info
     * Can be overridden by subclasses
     */
    getPlayerInfo() {
        return {};
    }

    /**
     * Setup keyboard event listeners (now handled centrally by content script)
     */
    setupEventListeners() {
        // Event listeners are now handled centrally by the main content script
        // This method is kept for compatibility but doesn't add duplicate listeners
    }

    /**
     * Handle keyboard events
     */
    handleKeydown(event) {
        const shortcut = this.shortcuts.jumpToMiddle;
        
        if (this.isShortcutPressed(event, shortcut)) {
            event.preventDefault();
            event.stopPropagation();
            this.jumpToMiddle();
        }
    }

    /**
     * Check if a specific shortcut is pressed
     */
    isShortcutPressed(event, shortcut) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const modifiersMatch = shortcut.modifiers.every(modifier => {
            switch (modifier) {
                case 'alt': return event.altKey;
                case 'ctrl': return event.ctrlKey;
                case 'shift': return event.shiftKey;
                case 'meta': return event.metaKey;
                default: return false;
            }
        });
        
        return keyMatch && modifiersMatch;
    }

    /**
     * Jump to a specific position in the current song
     * @param {number} position - Position as a decimal (0.0 to 1.0)
     */
    jumpToPosition(position) {
        const audio = this.findAudioElement();
        
        if (!audio) {
            console.log(`${this.platformName} Controller: No audio element found`);
            this.showFeedback('No audio player found');
            return;
        }

        if (audio.duration && !isNaN(audio.duration)) {
            const targetTime = audio.duration * position;
            audio.currentTime = targetTime;
            
            const percentage = Math.round(position * 100);
            const playerInfo = this.getPlayerInfo();
            console.log(`${this.platformName} Controller: Jumped to ${percentage}% (${Math.round(targetTime)}s of ${Math.round(audio.duration)}s)`, playerInfo);
            
            this.showFeedback(`Jumped to ${this.formatTime(targetTime)} (${percentage}%)`);
        } else {
            console.log(`${this.platformName} Controller: Audio duration not available`);
            this.showFeedback('Cannot jump - song not loaded');
        }
    }

    /**
     * Jump to the middle of the current song
     */
    jumpToMiddle() {
        this.jumpToPosition(0.5);
    }

    /**
     * Fast forward through the song in 25% increments
     * Each press cycles: 25% → 50% → 75% → 100% → 25% (loop)
     */
    fastForward() {
        // Increment position (1=25%, 2=50%, 3=75%, 4=100%)
        this.fastForwardPosition = (this.fastForwardPosition % 4) + 1;
        
        const position = this.fastForwardPosition * 0.25;
        const percentage = this.fastForwardPosition * 25;
        
        console.log(`${this.platformName} Controller: Fast forward to ${percentage}% (position ${this.fastForwardPosition})`);
        
        // Jump to the calculated position
        this.jumpToPosition(position);
    }

    /**
     * Go to previous track
     * Must be implemented by subclasses for platform-specific behavior
     */
    previousTrack() {
        console.log(`${this.platformName} Controller: previousTrack not implemented`);
        this.showFeedback('Previous track not supported on this platform');
    }

    /**
     * Go to next track
     * Must be implemented by subclasses for platform-specific behavior
     */
    nextTrack() {
        console.log(`${this.platformName} Controller: nextTrack not implemented`);
        this.showFeedback('Next track not supported on this platform');
    }

    /**
     * Format time in MM:SS format
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Show visual feedback to user
     */
    showFeedback(message) {
        // Remove existing feedback if any
        const existingFeedback = document.getElementById('music-controller-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        // Create feedback element
        const feedback = document.createElement('div');
        feedback.id = 'music-controller-feedback';
        feedback.textContent = `${this.platformName}: ${message}`;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getPlatformColor()};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(feedback);

        // Remove feedback after 3 seconds
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Get platform-specific color for feedback
     * Can be overridden by subclasses
     */
    getPlatformColor() {
        return '#333333'; // Default dark color
    }

    /**
     * Handle single-page application navigation
     */
    handleNavigation() {
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                // Re-initialize after navigation
                setTimeout(() => {
                    if (this.isValidPlatform()) {
                        this.init();
                    }
                }, 500);
            }
        }).observe(document, { subtree: true, childList: true });
    }
}

// Make BaseMusicController available globally
window.BaseMusicController = BaseMusicController;
