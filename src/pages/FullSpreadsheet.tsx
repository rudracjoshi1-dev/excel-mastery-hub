// Update to FullSpreadsheet.tsx with two-way BroadcastChannel sync

// Properly handle REQUEST_SNAPSHOT with retry logic
// Handle both RESPONSE_SNAPSHOT and UPDATE messages

import React, { useEffect, useRef } from 'react';

const FullSpreadsheet = () => {
    const channel = useRef(new BroadcastChannel('spreadsheet_channel'));

    useEffect(() => {
        // Function to send REQUEST_SNAPSHOT messages with retry logic
        const requestSnapshotWithRetry = (retryCount = 3) => {
            channel.current.postMessage({ type: 'REQUEST_SNAPSHOT' });

            const onMessage = (event) => {
                if (event.data.type === 'RESPONSE_SNAPSHOT') {
                    // Handle received snapshot
                    // Stop listening after receiving response
                    channel.current.removeEventListener('message', onMessage);
                } else if (event.data.type === 'UPDATE') {
                    // Handle update messages
                    // Update state based on the event data
                }
            };
            channel.current.addEventListener('message', onMessage);

            if (retryCount > 0) {
                setTimeout(() => {
                    requestSnapshotWithRetry(retryCount - 1);
                }, 3000); // Retry after 3 seconds
            }
        };

        // Start the process by requesting a snapshot
        requestSnapshotWithRetry();

        return () => {
            channel.current.close(); // Clean up the channel on unmount
        };
    }, []);

    return <div>Your Spreadsheet Component</div>;
};

export default FullSpreadsheet;
