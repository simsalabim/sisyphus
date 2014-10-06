var browserStorage = {};

/**
 * Check if local storage or other browser storage is available
 *
 * @return Boolean
 */
browserStorage.isAvailable = function() {
	if ( typeof $.jStorage === "object" ) {
		return true;
	}
	try {
		return localStorage.getItem;
	} catch ( e ) {
		return false;
	}
};

/**
 * Set data to browser storage
 *
 * @param [String] key
 * @param [String] value
 *
 * @return Boolean
 */
browserStorage.set = function( key, value ) {
	if ( typeof $.jStorage === "object" ) {
		$.jStorage.set( key, value + "" );
	} else {
		try {
			localStorage.setItem( key, value + "" );
		} catch ( e ) {
			//QUOTA_EXCEEDED_ERR
		}
	}
};

/**
 * Get data from browser storage by specified key
 *
 * @param [String] key
 *
 * @return string
 */
browserStorage.get = function( key ) {
	if ( typeof $.jStorage === "object" ) {
		var result = $.jStorage.get( key );
		return result ? result.toString() : result;
	} else {
		return localStorage.getItem( key );
	}
};

/**
 * Delete data from browser storage by specified key
 *
 * @param [String] key
 *
 * @return void
 */
browserStorage.remove = function( key ) {
	if ( typeof $.jStorage === "object" ) {
		$.jStorage.deleteKey( key );
	} else {
		localStorage.removeItem( key );
	}
};
