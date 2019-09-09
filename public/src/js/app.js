var enableNotificationsButtons = document.querySelectorAll(
  ".enable-notifications"
);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js", {
      /* scope: '/help/' */
    })
    .then(function() {
      console.log("Service worker registered!");
    });
}

window.addEventListener("beforeinstallprompt", function(event) {
  console.log("beforeinstall prompt fired");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification() {
  if ("serviceWorker" in navigator) {
    var options = {
      body: "You succesfully subscribed to Our notification service!",
      icon: "/src/images/icons/app-icon-96x96.png",
      image: "/src/images/sf-boat.jpg",
      dir: "ltr",
      lang: "en-US",
      vibrate: [100, 50, 200],
      badge: "/src/images/icons/app-icon-96x96.png",
      tag: "confirm-confirmation",
      renotify: true,
      actions: [
        {
          action: "confirm",
          title: "Okay",
          icon: "/src/images/icons/app-icon-96x96.png"
        },
        {
          action: "cancle",
          title: "Cancel",
          icon: "/src/images/icons/app-icon-96x96.png"
        }
      ]
    };

    navigator.serviceWorker.ready.then(function(swreg) {
      swreg.showNotification("Succesfully subscribed from(SW!!)", options);
    });
  }
}

function configurePushSub() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  var reg;
  navigator.serviceWorker.ready
    .then(function(swreg) {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(function(sub) {
      console.log(sub);
      if (sub === null) {
        var vapidPublicKey =
          "BFRFf2pjAR35Bdvtu9KP4KzQaKTUS9Jfqp02Zu2BknubjWo44N2W7mqGPTZjaSPTU_LaDLUaX0np0qyp2zaE5Aw";
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey
        });
      } else {
      }
    })
    .then(function(newSub) {
      console.log(newSub);
      return fetch("https://pwagram-9a9e0.firebaseio.com/subscriptions.json", {
        method: "POST",
        header: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(newSub)
      });
    })
    .then(function(res) {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}

function askForNotificationsPermission() {
  Notification.requestPermission(function(result) {
    console.log("User choice", result);
    if (result !== "granted") {
      console.log("No notification permission granted");
    } else {
      configurePushSub();
      //displayConfirmNotification();
    }
  });
}

if ("Notification" in window && "serviceWorker" in navigator) {
  for (var i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = "inline-block";
    enableNotificationsButtons[i].addEventListener(
      "click",
      askForNotificationsPermission
    );
  }
}
