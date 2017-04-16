function Sisyphus( options ) {

	this.options = {
		excludeFields: [],
		prefixFn: function( form ) {
			return form.id + form.name;
		}
	};
	options = options || {};

	for ( var key in options ) {
		this.options[ key ] = options[ key ];
	}
};

Sisyphus.prototype.isGroupInputElement = function( element ) {
	return [ "radio", "checkbox" ].indexOf( element.type ) !== -1;
};

Sisyphus.prototype.isSelectMultiple = function( element ) {
	return element.type === "select-multiple";
};

Sisyphus.prototype.protect = function( form ) {
	var i, element, self = this;
	this.mapFormElements( form );

	for ( var key in self.form_elements ) {
		for( i in self.form_elements[ key ] ) {
			element = self.form_elements[ key ][ i ];

			element.addEventListener( "change" , function() {
				self.saveToStorage( this );
			} );
		}
	}

	self.restoreFormData();
};

// TODO should accept form argument
Sisyphus.prototype.restoreFormData = function() {
	var i, element, self = this;

	for ( var key in self.form_elements ) {
		for( i in self.form_elements[ key ] ) {
			element = self.form_elements[ key ][ i ];

			self.restoreElementValue( element );
		}
	}
};

Sisyphus.prototype.restoreElementValue = function ( element ) {
	if ( this.isGroupInputElement( element ) ) {
		this.restoreGroupElement( element );
	} else if ( this.isSelectMultiple( element ) ) {
		this.restoreSelectMultiple( element );
	} else {
		this.restoreNonGroupElement( element );
	}
};

Sisyphus.prototype.restoreGroupElement = function ( element ) {
	var key, values;
	var elements = document.querySelectorAll( "[name='" + element.name + "']" );

	if ( elements.length ) {
		key = element.name;
		values = localStorage.getItem( key ) || [];

		for ( var i = 0; i < elements.length; i++ ) {
			if ( values.indexOf( elements[i].value ) !== -1 ) {
				elements[i].checked = true;
			}
		}
	} else {
		console.error(element);
		console.error( "The group input element has no name." );
	}
};

Sisyphus.prototype.restoreNonGroupElement = function ( element ) {
	var key;
	if ( element.id !== "" ) {
		key = element.id;
	} else if ( document.querySelectorAll( "[name='" + element.name + "']").length === 1 ) {
		key = element.name;
	} else {
		console.error( "The element is not unique on the page - has no id and there are elements with the same name");
		console.error( element );
		return;
	}
	element.value = localStorage.getItem( key );
};

Sisyphus.prototype.saveToStorage = function( element ) {
	if ( this.isGroupInputElement( element ) ) {
		this.saveGroupElementToStorage( element );
	} else if ( this.isSelectMultiple( element ) ) {
		this.saveSelectMultipleToStorage( element );
	} else {
		this.saveNonGroupElementToStorage( element );
	}
};

Sisyphus.prototype.saveSelectMultipleToStorage = function( element ) {
	var key, values = [];
	if ( element.id !== "" ) {
		key = element.id;
	} else if ( document.querySelectorAll( "[name='" + element.name + "']" ).length === 1 ) {
		key = element.name;
	} else {
		throw new Error( "The element is not unique on the page - has no id and there are elements with the same name");
	}
	for( var i = 0; i < element.options.length; i++ ) {
		if ( element.options[ i ].selected ) {
			values.push( element.options[ i ].value );
		}
	}
	localStorage.setItem( key, values );
};

Sisyphus.prototype.restoreSelectMultiple = function( element ) {
	var key, values;
	if ( element.id !== "" ) {
		key = element.id;
	} else if ( document.querySelectorAll( "[name='" + element.name + "']" ).length === 1 ) {
		key = element.name;
	} else {
		throw new Error( "The element is not unique on the page - has no id and there are elements with the same name");
	}

	values = localStorage.getItem( key ) || [];
	for( var i = 0; i < element.options.length; i++ ) {
		if ( values.indexOf( element.options[ i ].value ) !== -1 ) {
			element.options[ i ].selected = true;
		}
	}
};

Sisyphus.prototype.saveNonGroupElementToStorage = function( element ) {
	var key;
	if ( element.id !== "" ) {
		key = element.id;
	} else if ( document.querySelectorAll( "[name='" + element.name + "']" ).length === 1 ) {
		key = element.name;
	} else {
		throw new Error( "The element is not unique on the page - has no id and there are elements with the same name");
	}
	localStorage.setItem( key, element.value );
};

Sisyphus.prototype.saveGroupElementToStorage = function( element ) {
	var key, values = [];
	var elements = document.querySelectorAll( "[name='" + element.name + "']" );

	if ( elements.length ) {
		key = element.name;
		for ( var i = 0; i < elements.length; i++ ) {
			if ( elements[i].checked ) {
				values.push( elements[i].value );
			}
		}
	} else {
		console.error(element);
		throw new Error( "The group input element has no name." );
	}
	localStorage.setItem( key, values );
};

Sisyphus.prototype.mapFormElements = function( form ) {
	var select_list = form.getElementsByTagName( "select" ),
	textarea_list = form.getElementsByTagName( "textarea" ),
	input_list = form.getElementsByTagName( "input" ),
	self = this,
	i;

	self.form_elements = {
		select: [],
		text: [],
		textarea: [],
		checkbox: [],
		radio: [],
		hidden: []
	};

	for ( i = 0; i < textarea_list.length; i++ ) {
		self.form_elements.textarea.push( textarea_list[ i ] );
	}

	for ( i = 0; i < select_list.length; i++ ) {
		self.form_elements.select.push( select_list[ i ] );
	}

	for ( i = 0; i < input_list.length; i++ ) {
		if ( Object.prototype.toString.call( self.form_elements[ input_list[ i ].type ] ) === "[object Array]" ) {
			self.form_elements[ input_list[ i ].type ].push( input_list[ i ] );
		}
	}

	return self.form_elements;
};