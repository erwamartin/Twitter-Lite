var loaderController = function(){
	var _this = this;
	_this.properties = {
		
	}
	_this.defaults = {
		initialize : {
			conteneur : 'body',
			elements : {
				overlay : {
					class : {
						normal : 'overlay',
						show : 'show',
						hide : ''
					},
					content : ''
				},
			}
		}
	}

	_this.initialize = function(params){
		_this.properties = $.extend(true,{},_this.defaults.initialize,params);
		_this.properties.elements.overlay.element = $('<div></div>').addClass(_this.properties.elements.overlay.class.normal).append(_this.properties.elements.overlay.content);
		$(_this.properties.conteneur).append(_this.properties.elements.overlay.element);
	}

	_this.show = function(params){
		_this.properties.elements.overlay.element
			.removeClass(_this.properties.elements.overlay.class.hide)
			.addClass(_this.properties.elements.overlay.class.show);
	}

	_this.hide = function(params){
		_this.properties.elements.overlay.element
			.removeClass(_this.properties.elements.overlay.class.show)
			.addClass(_this.properties.elements.overlay.class.hide);
	}
}