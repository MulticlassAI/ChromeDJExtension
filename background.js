/**
 * Background Script for Universal Music Player Controller
 * Handles keyboard commands and communicates with content scripts
 */

// Listen for keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
    console.log('Universal Music Player Controller: Command received:', command);
    
    const supportedCommands = ['fast-forward', 'previous-track', 'next-track'];
    
    if (supportedCommands.includes(command)) {
        try {
            // Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                console.log('Universal Music Player Controller: No active tab found');
                return;
            }
            
            // Check if the tab is a supported music platform
            const url = tab.url;
            const isSupportedPlatform = 
                url.includes('soundcloud.com') ||
                url.includes('music.youtube.com') ||
                (url.includes('youtube.com') && url.includes('/watch')) ||
                url.includes('open.spotify.com');
            
            if (!isSupportedPlatform) {
                console.log('Universal Music Player Controller: Current tab is not a supported platform');
                return;
            }
            
            // Send message to content script
            chrome.tabs.sendMessage(tab.id, {
                action: command,
                command: command
            }).catch(error => {
                console.log('Universal Music Player Controller: Error sending message to content script:', error);
            });
            
        } catch (error) {
            console.error('Universal Music Player Controller: Error handling command:', error);
        }
    }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Universal Music Player Controller: Extension installed');
});
