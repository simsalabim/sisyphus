function Sisyphus(options) {
	this.GROUP_INPUT_TYPES = [ "radio", "checkbox" ];

	this.options = {
		excludeFields: [],
		prefixFn: function( form ) {
			return form.id + form.name;
		}
	};
	options = options || {};

	for ( key in options ) {
		this.options[ key ] = options[ key ];
	}
};

Sisyphus.prototype.isGroupInputElement = function( element ) {
	return this.GROUP_INPUT_TYPES.indexOf( element.type ) !== -1;
};

Sisyphus.prototype.protect = function( form ) {
	var form_elements = this.formElements( form ), i, element, self = this;

	for ( var key in form_elements ) {
		for( i in form_elements[ key ] ) {
			element = form_elements[ key ][ i ];

			element.addEventListener( "change" , function() {
				self.saveToStorage( element );
			} );
		}
	}
};

Sisyphus.prototype.saveToStorage = function( element ) {
	if ( this.isGroupInputElement( element ) ) {
		this.saveGroupElementToStorage( element );
	} else {
		this.saveNonGroupElementToStorage( element );
	}
};

Sisyphus.prototype.saveNonGroupElementToStorage = function( element ) {
	var key;
	if ( element.id !== "" ) {
		key = element.id;
	} else if ( document.querySelectorAll( "[name='" + element.name + "']").length === 1 ) {
		key = element.name;
	} else {
		throw new Error( "The element is not unique on the page - has no id and there are elements with the same name ");
	}
	localStorage.setItem( key, element.value );
};

Sisyphus.prototype.saveGroupElementToStorage = function( element ) {

};

Sisyphus.prototype.formElements = function( form ) {
	var select_list = form.getElementsByTagName( "select"),
	textarea_list = form.getElementsByTagName( "textarea"),
	input_list = form.getElementsByTagName( "input"),
	i;

	var map = {
		select: [],
		text: [],
		textarea: [],
		checkbox: [],
		radio: []
	};

	for ( i = 0; i < textarea_list.length; i++ ) {
		map.textarea.push( textarea_list[ i ] );
	};

	for ( i = 0; i < select_list.length; i++ ) {
		map.select.push( select_list[ i ] );
	};

	for ( i = 0; i < input_list.length; i++ ) {
		if ( input_list[i].type === "checkbox" ) {
			map.checkbox.push( input_list[ i ] );
		}
		if ( input_list[i].type === "radio" ) {
			map.radio.push( input_list[ i ] );
		}
		if ( input_list[i].type === "text" ) {
			map.text.push( input_list[ i ] );
		}
	};

	return map;
};