chrome.runtime.onInstalled.addListener(() => {
  console.log("Daily Routine Extension Installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "notify") {
      chrome.notifications.create({
          type: "basic",
          iconUrl: "icon128.png",
          title: request.title,
          message: request.message,
          priority: 2
      });
  }

  if (request.type === "scheduleAlarm") {
      const alarmName = "routine_" + Date.now();
      const targetDate = new Date(request.targetDate);
      chrome.alarms.create(alarmName, { when: targetDate.getTime(), periodInMinutes: 10080 }); // Weekly repeat
      chrome.storage.local.set({ [alarmName]: { activity: request.activity, time: targetDate.getTime() } });
  }
});

// Check for missed alarms when Chrome starts (PC was off or Chrome was closed)
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(null, (items) => {
      const now = Date.now();
      for (const [key, value] of Object.entries(items)) {
          if (key.startsWith("routine_") && value.time && now > value.time) {
              // Show missed alarm notification
              chrome.notifications.create({
                  type: "basic",
                  iconUrl: "icon128.png",
                  title: "Missed Routine",
                  message: `You missed: ${value.activity}`,
                  priority: 2
              });
              // Optionally, you can delete the alarm from storage as it's been processed
              chrome.storage.local.remove(key);
          }
      }
  });
});

chrome.alarms.onAlarm.addListener(alarm => {
  chrome.storage.local.get(alarm.name, result => {
      const activity = result[alarm.name]?.activity;
      if (activity) {
          chrome.notifications.create({
              type: "basic",
              iconUrl: "icon128.png",
              title: "Routine Reminder",
              message: `Time for: ${activity}`,
              priority: 2
          });
          // Remove the alarm from storage after notifying
          chrome.storage.local.remove(alarm.name);
      }
  });
});
