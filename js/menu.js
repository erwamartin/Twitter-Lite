$(function(){

	loadSettings();

	$('#open_menu').click(function(evt){
		evt.preventDefault();
		if($('#open_menu').hasClass('open')){
			$('#conteneur_webview').animate({paddingTop:'0'});
			$('#header').animate({height:'0'},function(){
				$('#header').hide();
			});
			//$('#open_menu').animate({marginTop:'42.5px'});
			$('#open_menu').css({backgroundImage:'url(../images/bottom_arrow.png)'});

			$('#open_menu').removeClass('open');
		}else{
			$('#conteneur_webview').animate({paddingTop:'35px'});
			$('#header').show().animate({height:'35px'});
			//$('#open_menu').animate({marginTop:'42.5px'});
			$('#open_menu').css({backgroundImage:'url(../images/top_arrow.png)'});

			$('#open_menu').addClass('open');
		}
	});


	$('#reglages').click(function(){
		$('#pannel_reglages').show();
		$('#background_pannel_reglages').show();

		$('#background_pannel_reglages').click(function(){
			closeSettingsPannel();
		});

		$('#pannel_reglages .close').click(function(){
			closeSettingsPannel();
		});
	});

	$('#enregistrement_reglages').click(function(){
		$('#pannel_reglages .reglage').each(function(){
			var storageObject = {};
			var name = $(this).attr('id');
			var value = 'off';
			if($(this).is(':checked')){
				value = 'on';
			}
			storageObject[name] = value;
			chrome.storage.sync.set(storageObject);
		});
		closeSettingsPannel();
	});


	$('#pause').click(function(){
		var storageObject = {};
		var name = $(this).attr('id');
		var value = 'off';
		if($('#pause').hasClass('actif')){
			$('#pause').css({backgroundImage:'url(../images/pause.png)',color:'#bbb'});
			$('#pause').removeClass('actif');
		}else{
			$('#pause').css({backgroundImage:'url(../images/pause_actif.png)',color:'#fff'});
			$('#pause').addClass('actif');

			value = 'on';
		}
		storageObject[name] = value;
		chrome.storage.sync.set(storageObject);
	});
});

function closeSettingsPannel(){
	$('#pannel_reglages').hide();
	$('#background_pannel_reglages').hide();
}

function loadSettings(){
	$('#pannel_reglages .reglage').each(function(){
		var input = $(this);
		var name = $(this).attr('id');
		chrome.storage.sync.get(name,function(data){
			if(data[name]=='on'){
				input.attr('checked', true);
			}
		});
	});
}