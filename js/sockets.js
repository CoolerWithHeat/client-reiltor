function isMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for Android
    if (/android/i.test(userAgent)) {
        return true;
    }

    // Check for iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return true;
    }

    // Check for other mobile devices
    if (/windows phone/i.test(userAgent) || /mobile/i.test(userAgent)) {
        return true;
    }

    return false;
}

let socket = null;
let activityTimeout = null;
let isConnected = false;

const initWebSocket = () => {
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const admin_token = localStorage.getItem('uzkvartir-token') || null;
    const socketUrl = wsScheme + '://' + window.location.host + `/serverdestination/ws/counter/${admin_token}`;

    socket = new WebSocket(socketUrl);

    socket.onopen = function(event) {
        console.log('WebSocket opened');
        isConnected = true;
        if (isMobile()) {
            startActivityTimeout();
            setupActivityListeners();
        }
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log(data);
        // Handle WebSocket messages
    };

    socket.onclose = function(event) {
        console.error('WebSocket closed unexpectedly');
        clearTimeout(activityTimeout);
        removeActivityListeners();
        isConnected = false;
    };
};

const disconnectWebSocket = () => {
    if (socket !== null && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }
};

const startActivityTimeout = () => {
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
        disconnectWebSocket();
    }, 15 * 1000);
};

const resetActivityTimeout = () => {
    clearTimeout(activityTimeout);
    startActivityTimeout();
};

const setupActivityListeners = () => {
    document.addEventListener('click', resetActivityTimeout);
    document.addEventListener('scroll', resetActivityTimeout);
    document.addEventListener('touchstart', resetActivityTimeout);
    document.addEventListener('mousemove', resetActivityTimeout);
    document.addEventListener('keydown', resetActivityTimeout);
};

const removeActivityListeners = () => {
    document.removeEventListener('click', resetActivityTimeout);
    document.removeEventListener('scroll', resetActivityTimeout);
    document.removeEventListener('touchstart', resetActivityTimeout);
    document.removeEventListener('mousemove', resetActivityTimeout);
    document.removeEventListener('keydown', resetActivityTimeout);
};

const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
        if (!isConnected) {
            initWebSocket();
        }
    } else {
        if (isConnected) {
            disconnectWebSocket();
        }
    }
};

document.addEventListener('visibilitychange', handleVisibilityChange);

// Initialize WebSocket based on device type and page visibility
if (isMobile()) {
    initWebSocket();
} else {
    if (document.visibilityState === 'visible') {
        initWebSocket();
    }
}
