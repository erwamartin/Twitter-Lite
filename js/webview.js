"use strict";

var notificationID = 0;
var lastNotification = null;

$(document).ready(function() {
	var webView = $('#webview');
	webView.attr('src', 'http://www.twitter.com/');
	webView.on('loadstop', function() {
		//$('h1').first().html('test');
		//console.log('test'+cssContent());
		/*webview.executeScript(
	      //{file: "js/webview_edit.js"},
	      {code: '(' + addCSS + ')()'},
	      function(results) {
	        // return value stored in results
	        console.log(results);
	        console.log('done');
	      });*/

		window.addEventListener("message", function(event) { 
			//console.log('window received message:', event.data);
			if(event.data.command=='haveTweets'){

				var settingName = 'defilement_automatique';
				chrome.storage.sync.get(settingName,function(data){
					if(typeof(data[settingName])!='undefined' && data[settingName]=='on'){
						webview.contentWindow.postMessage({
							command: 'loadTweets'
						}, '*');
					}
				});
				if(lastNotification['type']!='haveTweets'){
					//console.log('window received message:', event.data);
					/*var notification = webkitNotifications.createNotification(
					  'twitter-48.png',
					  'Twitter Lite', 
					  'Nouveaux Tweets disponibles !'
					);
					notification.show();*/

					var settingName = 'affichage_notifications';
					chrome.storage.sync.get(settingName,function(data){
						if(typeof(data[settingName])!='undefined' && data[settingName]=='on'){
							notificationHaveTweets(webView.get(0));
						}
					});

				}
			}
			var time = new Date().getTime();
			lastNotification = {'type' : event.data.command, 'timestamp' : time};
		});

		addCssJS(webView.get(0),'css/webview_edit.css');
	});

	webview.addEventListener('newwindow', function(e) {
      	e.preventDefault();
      	window.open(e.targetUrl);
    });

	//setInterval("refresh_haveTweets()", 2000);
	/*setInterval(
		function() { 
			console.log('refresh_haveTweets');
	},2000);*/

});

function notificationHaveTweets(webview_in){
	var options = {};
	var path = chrome.runtime.getURL('twitter-128.png');
	options.iconUrl = path;
	options.type = "basic";
	options.title = "Twitter Lite";
	options.message = "De nouveaux tweets sont disponibles !";
	chrome.notifications.create("id"+notificationID++, options, function(){
		chrome.notifications.onClicked.addListener(function(){
			chrome.app.window.current().show();
			webview_in.contentWindow.postMessage({
				command: 'loadTweets'
			}, '*');
		});
	});
}

function addCssJS(webview_in,url_css){
	 $.ajax({
	    url: url_css,
	    dataType: "text",
	    success: function(cssText) {
	       	webview_in.executeScript({code: 'var cssContent = '+JSON.stringify(cssText)+';'},
	       		function(results) {
		      	}
	       	);
	       	webview_in.executeScript({code: '(' + functionJS + ')();'},
		       	function(results) {
		       		/* On initialise la connexion des messages */
					webview_in.contentWindow.postMessage({
						command: 'firstMessage'
					}, '*');
		      	}
	      	);
	    }
	});
}

var functionJS = function() {
	if(typeof(chargement)=='undefined'){
	    var head = document.getElementsByTagName("head")[0].innerHTML;	
		var headWithCss = head + '<style type="text/css">'+cssContent+'</style>';
		document.getElementsByTagName('head')[0].innerHTML = headWithCss;

		/*var bouton_deconnexion = document.getElementById('signout-button');
		if (bouton_deconnexion != null) {
	      bouton_deconnexion.addEventListener('click', function(e) {
	       
	        e.preventDefault();
	        e.stopPropagation();
	      });
	    }*/
	    chargement = true;

	    //_sendMessage('testABCS');

	    window.addEventListener('message', _receiveMessage);
	 }

	 function _receiveMessage(event) {
		if (typeof(appWindow)=='undefined' || typeof(appOrigin)=='undefined') {
			appWindow = event.source;
			appOrigin = event.origin;
			setInterval(
				function(){
					if(document.getElementsByClassName('new-tweets-bar').length>0){
						_sendMessage({
							command:'haveTweets'
						});
					}else{
						_sendMessage({
							command:'noHaveTweets'
						});
					}
			},2000);
		}else if(event.data.command=='loadTweets'){
			simulate(document.getElementsByClassName('new-tweets-bar')[0],'click');
			window.scrollTo(0,0);
		}
	}

	function _sendMessage(data) {
		if (typeof(appWindow)=='undefined' || typeof(appOrigin)=='undefined') {
			return console.error('Cannot send message to Chrome wrapper app - communication channel has not yet been opened');
		}
		appWindow.postMessage(data, appOrigin);
	}

	function simulate(element, eventName){
	    var options = extend(defaultOptions, arguments[2] || {});
	    var oEvent, eventType = null;

	    for (var name in eventMatchers)
	    {
	        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
	    }

	    if (!eventType)
	        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

	    if (document.createEvent)
	    {
	        oEvent = document.createEvent(eventType);
	        if (eventType == 'HTMLEvents')
	        {
	            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
	        }
	        else
	        {
	            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
	            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
	            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
	        }
	        element.dispatchEvent(oEvent);
	    }
	    else
	    {
	        options.clientX = options.pointerX;
	        options.clientY = options.pointerY;
	        var evt = document.createEventObject();
	        oEvent = extend(evt, options);
	        element.fireEvent('on' + eventName, oEvent);
	    }
	    return element;
	}

	function extend(destination, source) {
	    for (var property in source)
	      destination[property] = source[property];
	    return destination;
	}

	var eventMatchers = {
	    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
	    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
	}
	var defaultOptions = {
	    pointerX: 0,
	    pointerY: 0,
	    button: 0,
	    ctrlKey: false,
	    altKey: false,
	    shiftKey: false,
	    metaKey: false,
	    bubbles: true,
	    cancelable: true
	}
 }

/*var have_tweets = function(){
	var retour = false;
	if(document.getElementsByClassName('new-tweets-bar').length>0){
		retour =  true;
	}
	return retour;
}*/
