/**
 * Created by Hyunki on 2018. 4. 10..
 */
 // Initialize Firebase


var config = {
apiKey: "AIzaSyBj_wmDL1z0suH2znta70mGgUV53hAmBOc",
authDomain: "pters-b9c4f.firebaseapp.com",
databaseURL: "https://pters-b9c4f.firebaseio.com",
projectId: "pters-b9c4f",
storageBucket: "pters-b9c4f.appspot.com",
messagingSenderId: "751903262384",
// serviceWorkerLocation: './',
};

firebase.initializeApp(config);

const messaging = firebase.messaging();

function registrationServiceWorker(token_info){
        messaging.requestPermission()
        .then(function() {
            if (navigator.serviceWorker) {
                navigator.serviceWorker.register('/static/user/js/push/firebase-messaging-sw.js?v=t89')
                    .then(function (reg) {
                        console.log('서비스워커 등록성공 :', reg)
                        //firebase_worker = reg.active;
                        //reg.active.postMessage({'hello':'world'});
                        //window.addEventListener('message', function(event){ console.log('client::'+event) }, false);
                        messaging.useServiceWorker(reg);

                        return messaging.getToken()
                            .then(function (currentToken) {
                                console.log(currentToken)
                                // pc_token = currentToken;
                                if(token_info != currentToken){
                                    if (currentToken) {
                                        sendTokenToServer(currentToken);
                                        //updateUIForPushEnabled(currentToken);
                                        update_push_token(currentToken, platform_check);
                                    } else {
                                        // Show permission request.
                                        console.log('No Instance ID token available. Request permission to generate one.');
                                        // Show permission UI.
                                        //updateUIForPushPermissionRequired();
                                        setTokenSentToServer(false);
                                    }
                                }
                            })
                            .catch(function (err) {
                                reg.unregister('/static/user/js/push/firebase-messaging-sw.js?v=t80')
                                console.log('An error occurred while retrieving token. ', err);
                                showToken('Error retrieving Instance ID token. ', err);
                                setTokenSentToServer(false);
                            });
                    })
                    .catch(function (error) {
                        console.log('서비스워커 등록실패 :', error)
                        // location.reload();
                        //registrationServiceWorker();
                    });

            }
        })
        .catch(function(err) {
          console.log('Unable to get permission to notify.', err);
        });
}
   // $('.request-btn').click(function () {
    //   console.log(Push.Permission.get());

// if(check_reg_val == 0 && platform_check=='pc'){
//     registrationServiceWorker();
// }

 function showToken(currentToken) {
    // Show token in console and UI.
    var tokenElement = document.querySelector('#token');
    tokenElement.textContent = currentToken;
  }
  // Send the Instance ID token your application server, so that it can:
  // - send messages back to this app
  // - subscribe/unsubscribe the token from topics
  function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer()) {
      console.log('Sending token to server...');
      // TODO(developer): Send the current token to your server.
      setTokenSentToServer(true);
    } else {
      console.log('Token already sent to server so won\'t send it again ' +
          'unless it changes');
    }
  }
  function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') === 1;
  }
  function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentToServer', sent ? 1 : 0);
  }
  function showHideDiv(divId, show) {
    const div = document.querySelector('#' + divId);
    if (show) {
      div.style = 'display: visible';
    } else {
      div.style = 'display: none';
    }
  }
  function requestPermission() {
    console.log('Requesting permission...');
    // [START request_permission]
    messaging.requestPermission().then(function() {
      console.log('Notification permission granted.');
      // TODO(developer): Retrieve an Instance ID token for use with FCM.
      // [START_EXCLUDE]
      // In many cases once an app has been granted notification permission, it
      // should update its UI reflecting this.
      resetUI();
      // [END_EXCLUDE]
    }).catch(function(err) {
      console.log('Unable to get permission to notify.', err);
    });
    // [END request_permission]
  }
  function deleteToken() {
    // Delete Instance ID token.
    // [START delete_token]
    messaging.getToken().then(function(currentToken) {
      messaging.deleteToken(currentToken).then(function() {
        console.log('Token deleted.');
        setTokenSentToServer(false);
        // [START_EXCLUDE]
        // Once token is deleted update UI.
        resetUI();
        // [END_EXCLUDE]
      }).catch(function(err) {
        console.log('Unable to delete token. ', err);
      });
      // [END delete_token]
    }).catch(function(err) {
      console.log('Error retrieving Instance ID token. ', err);
      showToken('Error retrieving Instance ID token. ', err);
    });
  }
  // Add a message to the messages element.
  function appendMessage(payload) {
    const messagesElement = document.querySelector('#messages');
    const dataHeaderELement = document.createElement('h5');
    const dataElement = document.createElement('pre');
    dataElement.style = 'overflow-x:hidden;';
    dataHeaderELement.textContent = 'Received message:';
    dataElement.textContent = JSON.stringify(payload, null, 2);
    messagesElement.appendChild(dataHeaderELement);
    messagesElement.appendChild(dataElement);
  }
  // Clear the messages element of all children.
  function clearMessages() {
    const messagesElement = document.querySelector('#messages');
    while (messagesElement.hasChildNodes()) {
      messagesElement.removeChild(messagesElement.lastChild);
    }
  }


function send_message_to_sw(worker, msg){
    return new Promise(function(resolve, reject){
        // Create a Message Channel
        var msg_chan = new MessageChannel();

        // Handler for recieving message reply from service worker
        msg_chan.port1.onmessage = function(event){
            if(event.data.error){
                reject(event.data.error);
            }else{
                resolve(event.data);
            }
        };
        // Send message to service worker along with port for reply
        worker.postMessage("tell me'"+msg+"'", [msg_chan.port2]);
    });
}