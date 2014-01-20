"use strict";

var app = {
	controllers : {
		loaderController : new loaderController(),
	}
}

var notificationID = 0;
var lastNotification = null;
var lastLoadingTweets = null;
var settingName;

$(document).ready(function() {

	app.controllers.loaderController.initialize({
		conteneur : 'body',
		elements : {
			overlay : {
				content : 	$('<div></div>').addClass('loader_conteneur').append([
								$('<div></div>').addClass('logo big').append([
									$('<img src="twitter-128.png">'),
									$('<p>Twitter Lite</p>'),
									$('<p class="loading"></p>').text('Chargement en cours...')
								]),
								//$('<div></div>').addClass('loader'),
								//$('<p class="text"></p>').text('Chargement en cours...')
							])
			}
		}
	});

	load();

});

function load(){
	app.controllers.loaderController.show();
	if (navigator.onLine) {
		loadApp();
	}else{
		load404();
	}
}

function load404(){
	app.controllers.loaderController.hide();
	$('#conteneur_webview').prepend('<div id="page404" class="page"></div>').show();
	$('#page404').load('/404.html',function(){
		$('#reload').off('click').on('click',function(evt){
			evt.preventDefault();
			app.controllers.loaderController.show();
			window.setTimeout(function(){ 
				if (navigator.onLine) {
					loadApp();
				}else{
					app.controllers.loaderController.hide();
				}
			},300);
		})
	});
}

function loadApp(){
	$('.page').remove();
	$('#webview').show();
	var webView = $('#webview');
	webView.attr('src', 'http://www.twitter.com/');
	webView.on('loadstop', function() {

		window.setTimeout(function(){ 

			$('#open_menu').show();
			$('#webview').show();
			app.controllers.loaderController.hide();

		},500);

		settingName = 'showBubbleParametres';
		chrome.storage.sync.get(settingName,function(data){
			if(typeof(data[settingName])!='undefined' && data[settingName]=='on'){
				$('#bubble_parametres').show();
				$('#background_bubble').show();
				$('#background_bubble').on('click',function(){
					$('#bubble_parametres').hide();
					$('#background_bubble').hide();
					var storageObject = {};
					storageObject['showBubbleParametres'] = 'off';
      				chrome.storage.sync.set(storageObject);
				});
			}
		});

		window.addEventListener("message", function(event) { 
			//console.log('window received message:', event.data);
			var time = new Date().getTime();

			// On initialise pour le premier chargement de la page (affichage classique)
			if(lastLoadingTweets==null){
				lastLoadingTweets = {'timestamp' : time};
			}

			if(event.data.command=='haveTweets'){

				settingName = 'defilement_automatique';
				chrome.storage.sync.get(settingName,function(data){
					if(typeof(data[settingName])!='undefined' && data[settingName]=='on'){
						
						settingName = 'pause';
						chrome.storage.sync.get(settingName,function(data){
							if(typeof(data[settingName])!='undefined' && data[settingName]!='on'){
								settingName = 'remontee_automatique';
								chrome.storage.sync.get(settingName,function(data){
									if(typeof(data[settingName])!='undefined' && data[settingName]=='on'){
										webview.contentWindow.postMessage({
											command: 'clickHomeButton'
										}, '*');
									}else{
										webview.contentWindow.postMessage({
											command: 'loadTweets'
										}, '*');
									}
								});
							}
						});
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

					settingName = 'affichage_notifications';
					chrome.storage.sync.get(settingName,function(data){
						if(typeof(data[settingName])!='undefined' && data[settingName]=='on'){

							settingName = 'pause';
							chrome.storage.sync.get(settingName,function(data){
								if(typeof(data[settingName])!='undefined' && data[settingName]!='on'){
									notificationHaveTweets(webView.get(0));
								}
							});

						}
					});
					lastLoadingTweets = {'timestamp' : time};
				}
			}else if(event.data.command=='noHaveTweets'){
				/* Si cela fait plus de 30 secondes que l'on a pas trouvé de tweets */
				//console.log((time-(lastLoadingTweets['timestamp']+(30*1000)))/1000);
				settingName = 'remontee_automatique';
				chrome.storage.sync.get(settingName,function(data){
					if(typeof(data[settingName])!='undefined' && data[settingName]=='on'){
						if(lastLoadingTweets['timestamp']+(30*1000)<time){
							settingName = 'defilement_automatique';
							chrome.storage.sync.get(settingName,function(data){
								if(typeof(data[settingName])!='undefined' && data[settingName]=='on'){
									settingName = 'pause';
									chrome.storage.sync.get(settingName,function(data){
										if(typeof(data[settingName])!='undefined' && data[settingName]!='on'){
											webview.contentWindow.postMessage({
												command: 'clickHomeButton'
											}, '*');
											lastLoadingTweets = {'timestamp' : time};
										}
									});

								}
							});
						}
					}
				});
			}
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
}

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

	// Premier chargement
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

	    // Ajout des trends
	    var tendanceTitle = document.getElementsByClassName('trends-container')[0].getElementsByClassName('flex-module-header')[0].getElementsByClassName('trend-location')[0].innerHTML;
	    document.getElementsByClassName('content-header')[0].getElementsByClassName('header-inner')[0].innerHTML +='<a href="#" id="bouton_tendances">'+tendanceTitle+'</a>';

	    var trends = document.getElementsByClassName("dashboard")[0].getElementsByClassName("trends")[0];
		trends.id = "block_tendances";
		trends.innerHTML += '<span class="close icon close-medium" id="close_tendances" >Fermer</span>';

		document.getElementById('page-container').insertBefore(trends,document.getElementById('page-container').firstChild);

		document.getElementById('bouton_tendances').removeEventListener('click');
		document.getElementById('bouton_tendances').addEventListener('click', toogleTendances,false);
		document.getElementById('close_tendances').removeEventListener('click');
		document.getElementById('close_tendances').addEventListener('click', toogleTendances,false);
		//document.getElementById('page-container').getElementsByClassName("content-main")[0].insertBefore(trends,document.getElementById('page-container').getElementsByClassName("stream-container")[0]);

	    window.addEventListener('message', _receiveMessage);
	 }else if(document.getElementById('bouton_tendances')!=null && document.getElementById('close_tendances')!=null){

	 	// Ajout des events supprimés lors du chargement d'une autre page que la home
		document.getElementById('bouton_tendances').removeEventListener('click');
		document.getElementById('bouton_tendances').addEventListener('click', toogleTendances,false);
		document.getElementById('close_tendances').removeEventListener('click');
		document.getElementById('close_tendances').addEventListener('click', toogleTendances,false);

	}

	 function toogleTendances(evt){
		evt.preventDefault();
		var trends = document.getElementById('block_tendances');
		var classString = trends.className, nameIndex = classString.indexOf('show');
		 if (nameIndex == -1) {
   			classString += ' ' + 'show';
	    }else {
	        classString = classString.substr(0, nameIndex) + classString.substr(nameIndex+'show'.length);
	    }
	    document.getElementById('block_tendances').className = classString;
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
			//window.scrollTo(0,0);
		}else if(event.data.command=='clickHomeButton'){
			// Si on est sur la page d'accueil
			if(document.getElementsByClassName('wrapper-home').length>0){
				simulate(document.getElementById('global-nav-home').getElementsByClassName('js-nav')[0],'click');
				window.scrollTo(0,0);
			}
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
