describe("jQuery.sisyphus", function() {
	var sisyphus, targetForm;
	
	beforeEach( function() {
		loadFixtures('fixtures.html');
		sisyphus = Sisyphus.getInstance();
		sisyphus.setOptions({});
		targetForm = $( "form:first" );
		sisyphus.protect(targetForm);
	} );
	
	
	it( "should return same instances", function() {
		var sisyphus1 = Sisyphus.getInstance(),
			sisyphus2 = Sisyphus.getInstance();
		expect(sisyphus1).toEqual(sisyphus2);
	} );
	
	
	it( "should have instances with common optins", function() {
		var sisyphus1 = Sisyphus.getInstance(),
			sisyphus2 = Sisyphus.getInstance();
		sisyphus1.setOptions( { timeout: 5 } );
		sisyphus2.setOptions( { timeout: 15 } );
		expect(sisyphus1.options).toEqual(sisyphus2.options);
	} );
	
	
	it( "should return false if Local Storage is unavailable", function() {
	  spyOn(sisyphus, 'isLocalStorageAvailable').andCallFake(function() {return false;});
	  expect(sisyphus.protect(targetForm)).toEqual(false);
	} );
	
	
	it( "should save textfield data on key input, if options.timeout is not set", function() {
		spyOn( sisyphus, "saveToLocalStorage" );
		$( ":text:first", targetForm ).trigger( "oninput" );
		expect( sisyphus.saveToLocalStorage ).toHaveBeenCalled();
	} );
	
	it( "should save textarea data on key input, if options.timeout is not set", function() {
		spyOn( sisyphus, "saveToLocalStorage" );
		$( "textarea:first", targetForm ).trigger( "oninput" );
		expect( sisyphus.saveToLocalStorage ).toHaveBeenCalled();
	} );
	
	it( "should save checkbox data on change", function() {
		spyOn( sisyphus, "saveToLocalStorage" );
		$( ":checkbox:first", targetForm ).trigger( "change" );
		expect( sisyphus.saveToLocalStorage ).toHaveBeenCalled();
	} );
	
	it( "should save radio data on change", function() {
		spyOn( sisyphus, "saveToLocalStorage" );
		$( ":radio:first", targetForm ).trigger( "change" );
		expect( sisyphus.saveToLocalStorage ).toHaveBeenCalled();
	} );
	
	it( "should save select's data on change", function() {
		spyOn( sisyphus, "saveToLocalStorage" );
		$( "select:first", targetForm ).trigger( "change" );
		expect( sisyphus.saveToLocalStorage ).toHaveBeenCalled();
	} );
	
	
	
	it( "should fire callback on saving data to Local Storage", function() {
		spyOn( sisyphus.options, "onSaveCallback" );
		sisyphus.saveToLocalStorage( "key", "value" );
		expect(sisyphus.options.onSaveCallback).toHaveBeenCalled();
	} );
	
	it( "should fire callback on removing data from Local Storage", function() {
		spyOn( sisyphus.options, "onReleaseDataCallback" );
		sisyphus.releaseData( targetForm.attr( "id" ), targetForm.find( ":text" ) );
		expect(sisyphus.options.onReleaseDataCallback).toHaveBeenCalled();
	} );
	
});
