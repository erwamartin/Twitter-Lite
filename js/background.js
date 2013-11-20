"use strict";

var defaultSettings = new Array(
    new Array('defilement_automatique','on'),
    new Array('remontee_automatique','off'),
    new Array('affichage_notifications','off'),
    new Array('showBubbleParametres','on'),
    new Array('pause','off',true)
);

chrome.app.runtime.onLaunched.addListener(function() {
  initSettings();
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

function initSettings(){
  initTheSetting(0);
}

function initTheSetting(cpt){
  if(typeof(defaultSettings[cpt])!='undefined'){
    var name = defaultSettings[cpt][0];
    chrome.storage.sync.get(name,function(data){
        if(typeof(data[name])=='undefined'){
          var storageObject = {};
          storageObject[name] = defaultSettings[cpt][1];
          chrome.storage.sync.set(storageObject);
        }else if(typeof(defaultSettings[cpt][2])!='undefined' && defaultSettings[cpt][2]==true){
          var storageObject = {};
          storageObject[name] = defaultSettings[cpt][1];
          chrome.storage.sync.set(storageObject);
        }

        /*  Setting suivant */
        cpt++;
        initTheSetting(cpt);
    });
  }
}
