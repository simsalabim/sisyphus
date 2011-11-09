describe("Sisyphus", function() {
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
	
	it( "should not save all data, but textfield only on key input, if options.timeout is not set", function() {
		spyOn( sisyphus, "saveAllData" );
		$( ":text:first", targetForm ).trigger( "oninput" );
		expect( sisyphus.saveAllData.callCount ).toEqual( 0 );
	} );
	
	it( "should save textarea data on key input, if options.timeout is not set", function() {
		spyOn( sisyphus, "saveToLocalStorage" );
		$( "textarea:first", targetForm ).trigger( "oninput" );
		expect( sisyphus.saveToLocalStorage ).toHaveBeenCalled();
	} );
	
	it( "should not save all data, but textarea only on key input, if options.timeout is not set", function() {
		spyOn( sisyphus, "saveAllData" );
		$( "textarea:first", targetForm ).trigger( "oninput" );
		expect( sisyphus.saveAllData.callCount ).toEqual( 0 );
	} );
	
	it( "should save all data on checkbox change", function() {
		spyOn( sisyphus, "saveAllData" );
		$( ":checkbox:first", targetForm ).trigger( "change" );
		expect( sisyphus.saveAllData ).toHaveBeenCalled();
	} );
	
	it( "should save all data on radio change", function() {
		spyOn( sisyphus, "saveAllData" );
		$( ":radio:first", targetForm ).trigger( "change" );
		expect( sisyphus.saveAllData ).toHaveBeenCalled();
	} );
	
	it( "should save all data on select change", function() {
		spyOn( sisyphus, "saveAllData" );
		$( "select:first", targetForm ).trigger( "change" );
		expect( sisyphus.saveAllData ).toHaveBeenCalled();
	} );
	
	
	
	it( "should fire callback ONCE on saving all data to Local Storage", function() {
		spyOn( sisyphus.options, "onSaveCallback" );
		sisyphus.saveAllData();
		expect( sisyphus.options.onSaveCallback.callCount ).toEqual( 1 );
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
