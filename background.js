let activeTab = "";
let startTime = Date.now();

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    handleSwitch(tab.url);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") handleSwitch(tab.url);
});

function handleSwitch(url) {
    let endTime = Date.now();
    let timeSpent = endTime - startTime; // milliseconds

    // Save previous site time
    if (activeTab) {
        chrome.storage.local.get(["tracking"], (data) => {
            let tracking = data.tracking || {};

            tracking[activeTab] = (tracking[activeTab] || 0) + timeSpent;

            chrome.storage.local.set({ tracking });
        });
    }

    activeTab = new URL(url).hostname;
    startTime = Date.now();
}
const BACKEND = "http://localhost:4000";
const USER_ID = "user1";

function sendTrackingToBackend() {
  chrome.storage.local.get(["tracking"], (data) => {
    const tracking = data.tracking || {};

    fetch(`${BACKEND}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        tracking: tracking
      })
    })
      .then(res => res.json())
      .then(json => console.log("Sent to backend:", json))
      .catch(err => console.error("Error sending:", err));
  });
}

// Send every 1 minute (60000 ms)
setInterval(sendTrackingToBackend, 60000);

// Also send when extension loads
sendTrackingToBackend();
