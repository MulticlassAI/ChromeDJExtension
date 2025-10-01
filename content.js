/**
 * Universal Music Player Controller - Main Content Script
 * Coordinates platform-specific controllers and handles initialization
 */

(function() {
    'use strict';
    
    console.log('Universal Music Player Controller: Loading...');
    
    // Global controller registry
    window.musicControllers = window.musicControllers || {};
    
    /**
     * Initialize the appropriate controller based on current platform
     */
    function initializeController() {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        
        console.log(`Universal Music Player Controller: Detecting platform for ${hostname}${pathname}`);
        
        // Initialize controllers for different platforms
        window.musicControllers = {
            soundcloud: window.soundCloudController,
            youtubeMusic: window.youtubeMusicController,
            spotify: window.spotifyController
        };
        
        // Initialize SoundCloud controller
        if (hostname.includes('soundcloud.com') && window.soundCloudController) {
            window.soundCloudController.init();
            console.log('Universal Music Player Controller: SoundCloud controller initialized');
        }
        
        // Initialize YouTube Music controller
        if ((hostname === 'music.youtube.com' || 
             (hostname.includes('youtube.com') && pathname.includes('/watch')))) {
            // Force recreation of YouTube Music controller to reset state
            if (typeof YouTubeMusicController !== 'undefined') {
                window.youtubeMusicController = new YouTubeMusicController();
                console.log('Universal Music Player Controller: Fresh YouTube Music controller created');
            }
            
            if (window.youtubeMusicController) {
                window.musicControllers.youtube = window.youtubeMusicController;
                window.youtubeMusicController.init();
                console.log('Universal Music Player Controller: YouTube Music controller initialized');
            }
        }
        
        // Initialize Spotify controller
        if (hostname === 'open.spotify.com') {
            // Force recreation of Spotify controller to reset state
            if (typeof SpotifyController !== 'undefined') {
                window.spotifyController = new SpotifyController();
                console.log('Universal Music Player Controller: Fresh Spotify controller created');
            }
            
            if (window.spotifyController) {
                window.spotifyController.init();
                console.log('Universal Music Player Controller: Spotify controller initialized');
            }
        }
    }
    
    /**
     * Wait for all scripts to load and then initialize
     */
    function waitForControllersAndInit() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkAndInit = () => {
            attempts++;
            
            // Check if base controller is loaded
            if (!window.BaseMusicController) {
                if (attempts < maxAttempts) {
                    setTimeout(checkAndInit, 100);
                    return;
                }
                console.error('Universal Music Player Controller: BaseMusicController not loaded');
                return;
            }
            
            // Initialize appropriate controller
            initializeController();
            
            // Set up navigation handling for SPAs
            setupNavigationHandling();
        };
        
        checkAndInit();
    }
    
    /**
     * Setup navigation handling for single-page applications
     */
    function setupNavigationHandling() {
        let lastUrl = location.href;
        
        // Handle URL changes (for SPAs)
        const handleNavigation = () => {
            const currentUrl = location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                console.log('Universal Music Player Controller: Navigation detected, reinitializing...');
                
                // Clear existing controllers
                window.musicControllers = {};
                
                // Reinitialize after a short delay
                setTimeout(initializeController, 500);
            }
        };
        
        // Listen for navigation events
        window.addEventListener('popstate', handleNavigation);
        
        // Also watch for DOM changes that might indicate navigation
        const observer = new MutationObserver((mutations) => {
            // Debounce navigation detection
            clearTimeout(window.navigationTimeout);
            window.navigationTimeout = setTimeout(handleNavigation, 100);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Handle messages from background script
     */
    function setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('Universal Music Player Controller: Message received:', message);
            
            const trackCommands = ['previous-track', 'next-track'];
            
            if (message.action === 'fast-forward') {
                console.log('Universal Music Player Controller: Processing fast-forward command');
                
                // Find active controller and execute fast forward
                let handled = false;
                
                console.log('Universal Music Player Controller: Available controllers:', Object.keys(window.musicControllers));
                
                Object.values(window.musicControllers).forEach(controller => {
                    if (!controller) {
                        console.log('Universal Music Player Controller: Skipping undefined controller');
                        return;
                    }
                    
                    console.log(`Universal Music Player Controller: Checking controller ${controller.platformName}, initialized: ${controller.isInitialized}, valid: ${controller.isValidPlatform()}`);
                    
                    if (controller.isInitialized && controller.isValidPlatform()) {
                        if (controller.fastForward) {
                            console.log(`Universal Music Player Controller: Calling fastForward on ${controller.platformName}`);
                            controller.fastForward();
                            handled = true;
                        } else {
                            console.log(`Universal Music Player Controller: fastForward not implemented for ${controller.platformName}`);
                        }
                    }
                });
                
                if (!handled) {
                    console.log('Universal Music Player Controller: No active controller found for fast forward command');
                }
                
                sendResponse({ success: handled });
            } else if (trackCommands.includes(message.action)) {
                // Find active controller and execute track navigation command
                let handled = false;
                
                Object.values(window.musicControllers).forEach(controller => {
                    if (!controller) {
                        console.log('Universal Music Player Controller: Skipping undefined controller');
                        return;
                    }
                    
                    if (controller.isInitialized && controller.isValidPlatform()) {
                        // Call the appropriate track navigation method
                        switch (message.action) {
                            case 'previous-track':
                                if (controller.previousTrack) {
                                    controller.previousTrack();
                                } else {
                                    console.log('Universal Music Player Controller: previousTrack not implemented for this platform');
                                }
                                break;
                            case 'next-track':
                                if (controller.nextTrack) {
                                    controller.nextTrack();
                                } else {
                                    console.log('Universal Music Player Controller: nextTrack not implemented for this platform');
                                }
                                break;
                        }
                        handled = true;
                    }
                });
                
                if (!handled) {
                    console.log('Universal Music Player Controller: No active controller found for track navigation command');
                }
                
                sendResponse({ success: handled });
            }
            
            return true; // Keep message channel open for async response
        });
    }
    
    /**
     * Global keyboard shortcut handler (fallback for direct key presses)
     */
    function setupGlobalShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl + F shortcut (fallback)
            if (event.ctrlKey && event.key.toLowerCase() === 'f') {
                // Prevent default browser behavior (Find dialog)
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                console.log('Universal Music Player Controller: Ctrl+F fallback triggered');
                
                // Check if any controller handled the event
                let handled = false;
                
                Object.values(window.musicControllers).forEach(controller => {
                    if (!controller) return;
                    
                    if (controller.isInitialized && controller.isValidPlatform()) {
                        if (controller.fastForward) {
                            console.log(`Universal Music Player Controller: Calling fastForward on ${controller.platformName} (fallback)`);
                            controller.fastForward();
                            handled = true;
                        }
                    }
                });
                
                if (!handled) {
                    console.log('Universal Music Player Controller: No active controller found for Ctrl+F shortcut');
                }
            }
            
            // Ctrl + Left arrow (fallback)
            if (event.ctrlKey && event.key === 'ArrowLeft') {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                Object.values(window.musicControllers).forEach(controller => {
                    if (!controller) return;
                    if (controller.isInitialized && controller.isValidPlatform() && controller.previousTrack) {
                        controller.previousTrack();
                    }
                });
            }
            
            // Ctrl + Right arrow (fallback)
            if (event.ctrlKey && event.key === 'ArrowRight') {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                Object.values(window.musicControllers).forEach(controller => {
                    if (!controller) return;
                    if (controller.isInitialized && controller.isValidPlatform() && controller.nextTrack) {
                        controller.nextTrack();
                    }
                });
            }
        }, true);
    }
    
    /**
     * Main initialization
     */
    function init() {
        console.log('Universal Music Player Controller: Initializing main controller...');
        
        // Setup message listener for background script commands
        setupMessageListener();
        
        // Setup global shortcuts (fallback)
        setupGlobalShortcuts();
        
        // Wait for platform controllers to load and initialize
        waitForControllersAndInit();
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
