describe("Sisyphus", function() {
	var subject, form, sisyphus, element;

	beforeEach( function() {
		loadFixtures( "fixtures.html" );
		form = document.getElementById( "form1" );
		sisyphus = new Sisyphus();
	} );

	describe( "initialization", function() {
		it( "should create different instances each time", function() {
			expect( new Sisyphus() ).not.toBe( new Sisyphus() );
		} );

		it( "should return an object", function() {
			expect( typeof sisyphus ).toEqual( "object" );
		} );
	} );

	describe( "options", function() {
		it( "should have default options", function() {
			expect( Object.keys(sisyphus.options).length ).toBeGreaterThan(0);
		} );

		it( "should override default options on initialize", function() {
			var default_option_key, options = {}, custom_value = 'custom value';
			for ( key in sisyphus.options ) {
				default_option_key = key;
				break;
			}
			options[default_option_key] = custom_value;
			var sisyphus2 = new Sisyphus( options );
			expect( sisyphus2.options[ default_option_key ] ).toEqual( custom_value );
		} );

		it( "should default prefixFn to return form's id and name concatenated", function() {
			expect( sisyphus.options.prefixFn( form ) ).toEqual( form.id + form.name );
		} );
	} );

	describe( "mapFormElements", function() {
		it( "should build a proper map of elements to protect", function() {
			subject = sisyphus.mapFormElements( form );

			expect( subject.text.length ).toEqual( 1 );
			expect( subject.textarea.length ).toEqual( 1 );
			expect( subject.select.length ).toEqual( 2 );
			expect( subject.radio.length ).toEqual( 3 );
			expect( subject.checkbox.length ).toEqual( 5 );
			expect( subject ).toEqual( sisyphus.form_elements );
		} );
	} );

	describe( "protect", function() {
		[ "name" , "country", "planet", "story" ].forEach( function( id ) {
			it( "should save element's data to local storage if change has been triggered", function() {
				var event = new Event( "change" ),
						element = document.getElementById( id );

				sisyphus.protect( form );
				spyOn( sisyphus, "saveToStorage" );
				element.dispatchEvent( event );
				expect( sisyphus.saveToStorage ).toHaveBeenCalledWith( element );
			} );
		} );

		it( "should trigger restore form's data", function() {
			spyOn( sisyphus, "restoreFormData" );
			sisyphus.protect( form );
			expect( sisyphus.restoreFormData ).toHaveBeenCalled();
		} );

		it( "should not trigger restore form's data if document load has not been triggered", function() {
			var event = new Event( "unload" );

			sisyphus.protect( form );
			spyOn( sisyphus, "restoreFormData" );
			document.dispatchEvent( event );
			expect( sisyphus.restoreFormData ).not.toHaveBeenCalled();
		} );
	} );

	describe( "restoreFormData", function() {
		it( "should invoke restore data for each form's element", function() {
			sisyphus.mapFormElements( form );
			spyOn( sisyphus, "restoreElementValue" );
			sisyphus.restoreFormData();
//			TODO count times
			expect( sisyphus.restoreElementValue ).toHaveBeenCalled();
		} );
	} );

	describe( "restoreElementValue", function() {
		describe("non group element", function() {
			beforeEach( function() {
				subject = document.createElement( "input" );
				spyOn( sisyphus, 'isGroupInputElement').andReturn(false);
				spyOn( sisyphus, 'restoreGroupElement');
				spyOn( sisyphus, 'restoreNonGroupElement');
			} );

			it( "should trigger restore of a non-group element", function() {
				sisyphus.restoreElementValue( subject );
				expect( sisyphus.restoreNonGroupElement ).toHaveBeenCalled();
			} );

			it( "should not trigger restore of a group element", function() {
				sisyphus.restoreElementValue( subject );
				expect( sisyphus.restoreGroupElement ).not.toHaveBeenCalled();
			} );
		});

		describe( "group element", function() {
			beforeEach( function() {
				element = document.createElement( "input" );
				spyOn( sisyphus, "isGroupInputElement" ).andReturn( true );
				spyOn( sisyphus, "restoreGroupElement" );
				spyOn( sisyphus, "restoreNonGroupElement" );
			} );

			it( "should trigger restore of a group element", function() {
				sisyphus.restoreElementValue( element );
				expect( sisyphus.restoreGroupElement ).toHaveBeenCalled();
			} );

			it( "should not trigger restore of a non-group element", function() {
				sisyphus.restoreElementValue( element );
				expect( sisyphus.restoreNonGroupElement ).not.toHaveBeenCalled();
			} );
		});
	} );

	describe( "saveToStorage", function() {
		describe("non group element", function() {
			beforeEach( function() {
				subject = document.createElement( "input" );
				spyOn( sisyphus, 'isGroupInputElement').andReturn(false);
				spyOn( sisyphus, 'saveGroupElementToStorage');
				spyOn( sisyphus, 'saveNonGroupElementToStorage');
			} );

			it( "should trigger save of a non-group element", function() {
				sisyphus.saveToStorage( subject );
				expect( sisyphus.saveNonGroupElementToStorage ).toHaveBeenCalled();
			} );

			it( "should not trigger save of a group element", function() {
				sisyphus.saveToStorage( subject );
				expect( sisyphus.saveGroupElementToStorage ).not.toHaveBeenCalled();
			} );
		});

		describe( "group element", function() {
			beforeEach( function() {
				element = document.createElement( "input" );
				spyOn( sisyphus, "isGroupInputElement" ).andReturn( true );
				spyOn( sisyphus, "saveGroupElementToStorage" );
				spyOn( sisyphus, "saveNonGroupElementToStorage" );
			} );

			it( "should trigger save of a group element", function() {
				sisyphus.saveToStorage( element );
				expect( sisyphus.saveGroupElementToStorage ).toHaveBeenCalled();
			} );

			it( "should not trigger save of a non-group element", function() {
				sisyphus.saveToStorage( element );
				expect( sisyphus.saveNonGroupElementToStorage ).not.toHaveBeenCalled();
			} );
		});
	} );

	describe( "saveNonGroupElementToStorage", function() {
		beforeEach( function() {
			element = document.createElement( "input" );
			var id, name, value, body = document.getElementsByTagName( "body" )[ 0 ];
			body.appendChild( element );
//			TODO Firefox
			spyOn( localStorage, "setItem" );
		} );

		afterEach( function() {
			var body = document.getElementsByTagName( "body" )[ 0 ];
			body.removeChild( element );
		} );

		it( "should store elements value if it has an id", function() {
			var id = "some-id", value = "some-value";
			element.id = id;
			element.value = value;
			sisyphus.saveNonGroupElementToStorage( element );
//			TODO Firefox
			expect( localStorage.setItem ).toHaveBeenCalledWith( id, value );
		} );

		it( "should store elements value if it has unique name", function() {
			id = "";
			value = "some-value";
			name = "some-name";
			element.id = id;
			element.value = value;
			element.name = name;

			sisyphus.saveNonGroupElementToStorage( element );
//			TODO Firefox
			expect( localStorage.setItem).toHaveBeenCalledWith( name, value );
		} );

		it( "should raise an error if element has no id and its name is not unique", function() {
			var another_element = document.createElement( "input" ),
					body = document.getElementsByTagName( "body" )[ 0 ];
			body.appendChild( another_element );
			id = "";
			value = "some-value";
			name = "some-name";
			element.id = id;
			element.value = value;
			element.name = name;
			another_element.name = name;

			expect( function() { sisyphus.saveNonGroupElementToStorage( element ) } ).toThrow();
			body.removeChild( another_element );
		} );
	} );

	describe( "restoreNonGroupElement", function() {
		beforeEach( function() {
			element = document.createElement( "input" );
			var id, name, value, body = document.getElementsByTagName( "body" )[ 0 ];
			body.appendChild( element );
//			TODO Firefox
			spyOn( localStorage, "getItem" ).andReturn( "retrieved value" );
		} );

		afterEach( function() {
			var body = document.getElementsByTagName( "body" )[ 0 ];
			body.removeChild( element );
		} );

		it( "should restore elements value if it has an id", function() {
			var id = "some-id", value = "some-value";
			element.id = id;
			element.value = value;
			sisyphus.restoreNonGroupElement( element );
//			TODO Firefox
			expect( localStorage.getItem ).toHaveBeenCalledWith( id );
			expect( element.value ).toEqual( "retrieved value" );
		} );

		it( "should store elements value if it has unique name", function() {
			id = "";
			value = "some-value";
			name = "some-name";
			element.id = id;
			element.value = value;
			element.name = name;

			sisyphus.restoreNonGroupElement( element );
//			TODO Firefox
			expect( localStorage.getItem ).toHaveBeenCalledWith( name );
			expect( element.value ).toEqual( "retrieved value" );
		} );

		it( "should print an error if element has no id and its name is not unique", function() {
			var another_element = document.createElement( "input" ),
					body = document.getElementsByTagName( "body" )[ 0 ];
			body.appendChild( another_element );
			id = "";
			value = "some-value";
			name = "some-name";
			element.id = id;
			element.value = value;
			element.name = name;
			another_element.name = name;
			spyOn(console, 'error');

			sisyphus.restoreNonGroupElement( element );
			expect( console.error ).toHaveBeenCalledWith( "The element is not unique on the page - has no id and there are elements with the same name" );
			expect( element.value ).toEqual( value );
			body.removeChild( another_element );
		} );
	} );

	describe( "isGroupInputElement", function() {
		[ "checkbox", "radio" ].forEach( function ( type ) {
			it( "should return true for " + type, function() {
				var element = document.createElement( "input" );
				element.type = type;
				expect( sisyphus.isGroupInputElement( element) ).toEqual( true );
			} );
		} );

		[ "text", "textarea", "select" ].forEach( function ( type ) {
			it( "should return false for " + type, function() {
				var element = document.createElement( "input" );
				element.type = type;
				expect( sisyphus.isGroupInputElement( element) ).toEqual( false );
			} );
		} );
	} );

} );
