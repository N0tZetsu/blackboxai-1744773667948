// Default configuration in case config.json fails to load
const defaultConfig = {
    backgroundImage: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg',
    backgroundVideo: '',
    backgroundAudio: '',
    defaultVolume: 0.5,
    title: 'Bienvenido al Servidor',
    subtitle: 'Cargando...'
};

// Main configuration object
let config = { ...defaultConfig };

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const bgVideo = document.getElementById('bgVideo');
const bgAudio = document.getElementById('bgAudio');
const volumeSlider = document.getElementById('volumeSlider');
const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');

// Initialize loading screen
async function initLoadingScreen() {
    try {
        // Fetch configuration
        const response = await fetch('config.json');
        if (!response.ok) throw new Error('Failed to load configuration');
        const loadedConfig = await response.json();
        config = { ...defaultConfig, ...loadedConfig };
    } catch (error) {
        console.warn('Using default configuration:', error);
    }

    // Apply configuration
    setupMedia();
    updateText();
    setupVolumeControl();
}

// Setup media elements (background video/image and audio)
function setupMedia() {
    // Set background image (will be visible if video is not available)
    loadingScreen.style.backgroundImage = `url('${config.backgroundImage}')`;

    // Setup video if available
    if (config.backgroundVideo) {
        bgVideo.src = config.backgroundVideo;
        bgVideo.style.display = 'block';
        
        bgVideo.onerror = () => {
            console.warn('Failed to load background video, falling back to image');
            bgVideo.style.display = 'none';
        };
    } else {
        bgVideo.style.display = 'none';
    }

    // Setup audio if available
    if (config.backgroundAudio) {
        bgAudio.src = config.backgroundAudio;
        bgAudio.volume = config.defaultVolume;
        
        // Auto-play audio when possible
        bgAudio.play().catch(error => {
            console.warn('Auto-play failed:', error);
            // Create play button for manual start
            createPlayButton();
        });
    }
}

// Update text content
function updateText() {
    title.textContent = config.title;
    subtitle.textContent = config.subtitle;
}

// Setup volume control
function setupVolumeControl() {
    // Set initial volume
    volumeSlider.value = config.defaultVolume * 100;
    
    // Volume change handler
    volumeSlider.addEventListener('input', () => {
        const volume = volumeSlider.value / 100;
        bgAudio.volume = volume;
        
        // Update volume icon based on level
        const volumeIcon = document.querySelector('.volume-icon');
        if (volume === 0) {
            volumeIcon.textContent = '🔇';
        } else if (volume < 0.5) {
            volumeIcon.textContent = '🔉';
        } else {
            volumeIcon.textContent = '🔊';
        }
    });
}

// Create play button for manual audio start
function createPlayButton() {
    const playButton = document.createElement('button');
    playButton.innerHTML = '▶️ Play Music';
    playButton.className = 'play-button';
    
    // Style the button
    playButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 30px;
        padding: 10px 20px;
        background: rgba(0, 0, 0, 0.6);
        border: none;
        border-radius: 25px;
        color: white;
        cursor: pointer;
        font-family: 'Poppins', sans-serif;
        backdrop-filter: blur(5px);
        transition: all 0.3s ease;
        z-index: 2;
    `;

    playButton.addEventListener('mouseover', () => {
        playButton.style.transform = 'scale(1.1)';
    });

    playButton.addEventListener('mouseout', () => {
        playButton.style.transform = 'scale(1)';
    });

    playButton.addEventListener('click', () => {
        bgAudio.play();
        playButton.remove();
    });

    document.body.appendChild(playButton);
}

// Simulate loading progress
function simulateLoading() {
    const progress = document.querySelector('.progress');
    let width = 0;
    
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            // You can add additional logic here when loading is complete
        } else {
            width++;
            progress.style.width = width + '%';
        }
    }, 50);
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    simulateLoading();
});

// Handle visibility change to manage audio
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        bgAudio.pause();
    } else {
        if (bgAudio.src) bgAudio.play().catch(() => {});
    }
});
