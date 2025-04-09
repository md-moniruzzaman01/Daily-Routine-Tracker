

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
        chrome.alarms.create(alarmName, { delayInMinutes: request.delay });
        chrome.storage.local.set({ [alarmName]: request.activity });
    }

    if (request.type === "scheduleRecurringAlarm") {
        chrome.alarms.create(request.alarmName, {
            delayInMinutes: request.delay,
            periodInMinutes: request.periodInMinutes
        });
        chrome.storage.local.set({ [request.alarmName]: request.activity });
    }
});


chrome.alarms.onAlarm.addListener(alarm => {
  chrome.storage.local.get(alarm.name, result => {
      const activity = result[alarm.name];
      if (activity) {
          chrome.notifications.create({
              type: "basic",
              iconUrl: "icon128.png",
              title: "Routine Reminder",
              message: `Time for: ${activity}`,
              priority: 2
          });
          chrome.storage.local.remove(alarm.name);
      }
  });
});
