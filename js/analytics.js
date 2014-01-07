var service, tracker, out;

function startApp() {
  // Initialize the Analytics service object with the name of your app.
  service = analytics.getService('twitter_lite');

  // Get a Tracker using your Google Analytics app Tracking ID.
  tracker = service.getTracker('UA-45963940-1');

  // Record an "appView" each time the user launches your app or goes to a new
  // screen within the app.
  tracker.sendAppView('MainView');
}

window.onload = startApp;
