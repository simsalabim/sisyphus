describe("jQuery.sisyphus", function() {
	var sisyphus, targetForm;
	
	beforeEach( function() {
		loadFixtures('fixtures.html');
		sisyphus = Sisyphus.getInstance();
		sisyphus.setOptions({});
		targetForm = $( "form:first" );
		sisyphus.protect(targetForm);
		
	} );
	
	
	it( "should return false if Local Storage is unavailable", function() {
	  spyOn(sisyphus, 'isLocalStorageAvailable').andCallFake(function() {return false;});;
	  expect(sisyphus.protect(targetForm)).toEqual(false);
	} );
	
	
	it( "should save textfied data on key input, if options.timeout is not set", function() {
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
		sisyphus.releaseData( targetForm.find( ":text" ) );
		expect(sisyphus.options.onReleaseDataCallback).toHaveBeenCalled();
	} );
	
});
