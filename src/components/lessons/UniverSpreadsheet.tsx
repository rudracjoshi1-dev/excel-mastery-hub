// New implementation for bidirectional BroadcastChannel sync

// This setup allows for synchronization between different instances of the application using BroadcastChannel.

const broadcastChannel = new BroadcastChannel('spreadsheet-sync');

// Function to send data through the channel
function sendData(data) {
    broadcastChannel.postMessage(data);
}

// Listen for messages from other tabs or windows
broadcastChannel.onmessage = (event) => {
    const data = event.data;
    // Handle the data received from other instances
    // Update your application state or UI accordingly
};

// Example usage of sendData function
// sendData({ key: 'value' });