"use strict";

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('../window.html', {
    id: 'webview',
    //'frame' : 'none',
    bounds: {
      width: 460,
      height: 500,
      left: 0,
      top: 0
    },
    minWidth: 460,
    minHeight: 200,
    maxWidth: 460
  });
});
