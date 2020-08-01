// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
//importScripts('/static/common/js/push/push.min.js');
 firebase.initializeApp({
   'messagingSenderId': '751903262384'
 });
var messaging = firebase.messaging();
var client;

/**
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.
 // [START initialize_firebase_in_sw]
 // Give the service worker access to Firebase Messaging.
 // Note that you can only use Firebase Messaging here, other Firebase libraries
 // are not available in the service worker.
 // Initialize the Firebase app in the service worker by passing in the
 // messagingSenderId.
 firebase.initializeApp({
   'messagingSenderId': 'YOUR-SENDER-ID'
 });
 // Retrieve an instance of Firebase Messaging so that it can handle background
 // messages.
 const messaging = firebase.messaging();
 // [END initialize_firebase_in_sw]
 **/


// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
/*
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  var notificationTitle = 'Background Message Title';
  var notificationOptions = {
    body: 'Background Message body.',
    icon: '/static/common/{{request.session.domain_url}}-favicon-48.png'
  };
  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});
*/
// [END background_handler]

self.addEventListener('push', function(event) {
    const payload = event.data.json();
    const title = payload.notification.title;
    const options = {
        body: payload.notification.body,
        icon: '/static/common/{{request.session.domain_url}}-favicon.ico',
        sound: 'default'
        //data: payload.notification.data
    };

    event.waitUntil(self.registration.showNotification(title, options));
    client.ports[0].postMessage("alarm data receive!!!");
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    //event.waitUntil(
     //   clients.openWindow("https://pters.co.kr")
    //);
});


self.addEventListener('message', function(event){
    client = event;
    //event.ports[0].postMessage("SW Says 'Hello back!'");
});

