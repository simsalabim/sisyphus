/**
 * Plugin developed to save html forms data to LocalStorage to restore them after browser crashes, tabs closings
 * and other disasters.
 *
 * @author Alexander Kaupanin <kaupanin@gmail.com>
 */
	
//$.sisyphus().setOptions({timeout: 15})
$.sisyphus = function() {
	return Sisyphus.getInstance();
};

$.fn.sisyphus = function( options ) {
	var sisyphus = Sisyphus.getInstance();
	sisyphus.setOptions( options )
	sisyphus.protect(this);
};
	
var Sisyphus =(function() {
	var instantiated;
	
	function init () {
		return {
			/**
			 * Set plugin options
			 *
			 * @param [Object] options
			 *
			 * @return void
			 */
			setOptions: function ( options ) {
				var defaults = {
					excludeFields: null,
					customKeyPrefix: "",
					timeout: 0,
					onSaveCallback: function() {},
					onRestoreCallback: function() {},
					onReleaseDataCallback: function() {}
				};
				this.options = $.extend( defaults, options );
			}, 
			
			/**
			 * Protect specified forms, store it's fields data to local storage and restore them on page load
			 *
			 * @param [Object] targets		forms object(s), result of jQuery selector
			 * @param Object options		plugin options
			 *
			 * @return void
			 */
			protect: function( targets ) {
				if (! this.isLocalStorageAvailable()) {
					return false;
				}

				this.href = location.hostname + location.pathname + location.search;
				var self = this;
				
				targets.each( function() {
					var target = $( this );
					var protectedFields = target.find( ":input" ).not( ":submit" ).not( ":reset" ).not( ":button" );
					self.bindSaveAndRestoreData( protectedFields );
					self.bindReleaseDataOnSubmitOrReset( protectedFields );
				} );
					
				return true;
			},
			
			
			/**
			 * Check if local storage is available
			 *
			 * @return Boolean
			 */
			isLocalStorageAvailable: function() {
				try {
					return localStorage.getItem;
				} catch (e) {
					return false;
				}
			},
			
			
			/**
			 * Restore form fields data and bind saving it's instant condition to local storage
			 *
			 * @param Object protectedFields	jQuery object contains form fields to protect
			 *
			 * @return void
			 */
			bindSaveAndRestoreData: function( protectedFields ) {
				var self = this;
				var restored = false;
				var targetFormId = protectedFields.parents( "form" ).attr( "id" );
				protectedFields.each( function() {
					var field = $(this);
					var prefix = self.href + targetFormId + field.attr( "name" ) + self.options.customKeyPrefix;
					var resque = localStorage.getItem( prefix );
					if (resque) {
						self.restoreData( field, resque );
						restored = true;
					}
					if ( field.is( ":text" ) || field.is( "textarea" ) ) {
						if ( ! self.options.timeout ) {
							self.bindSaveDataImmediately( field, prefix );
						}
					} else {
						self.bindSaveDataOnChange( field, prefix );
					}
				} );
				
				if ( self.options.timeout ) {
					self.bindSaveDataByTimeout( protectedFields );
				}
				
				if ( restored && $.isFunction( self.options.onRestoreCallback ) ) {
					self.options.onRestoreCallback.call();
				}
			},
			
			
			/**
			 * Restore form field data from local storage
			 *
			 * @param Object elem		jQuery form element object
			 * @param String resque	previously stored fields data
			 *
			 * @return void
			 */
			restoreData: function( elem, resque ) {
				if ( elem.is(":checkbox") && resque !== false && elem.attr("name").indexOf("[") === -1 ) {
					elem.attr( "checked", "checked" );
				} else if ( elem.is(":radio") ) {
					if (elem.val() === resque) {
						elem.attr("checked", "checked");
					}
				} else if ( elem.attr( "name" ).indexOf( "[" ) === -1 ) {
					elem.val( resque ); 
				} else {
					resque = resque.split( "," );
					elem.val( resque ); 
				}
			},
			
			
			/**
			 * Bind immediate saving (on typing/checking/changing) field data to local storage when user fills it
			 *
			 * @param Object elem		jQuery form element object
			 * @param String prefix	prefix used as key to store data in local storage
			 *
			 * @return void
			 */
			bindSaveDataImmediately: function( elem, prefix ) {
				var self = this;
				if ( $.browser.msie == null ) {
					elem.get(0).oninput = function() {
						self.saveToLocalStorage( prefix, elem.val() );
					}
				} else {
					elem.get(0).onpropertychange = function() {
						self.saveToLocalStorage( prefix, elem.val() );
					}
				}
			},
			
			
			/**
			 * Save data to Local Storage and fire callback if defined
			 *
			 * @param String key
			 * @param String value
			 *
			 * @return void
			 */
			saveToLocalStorage: function( key, value ) {
				try {
					localStorage.setItem( key, value + "" );
				} catch (e) { 
					//QUOTA_EXCEEDED_ERR
				}
				if ( value !== "" && $.isFunction( this.options.onSaveCallback ) ) {
					this.options.onSaveCallback.call();
				}
			},
			
			
			/**
			 * Bind saving field data on change
			 *
			 * @param Object elem		jQuery form element object
			 * @param String prefix	prefix used as key to store data in local storage
			 *
			 * @return void
			 */
			bindSaveDataOnChange: function( elem, prefix ) {
				var self = this;
				elem.change( function() {
					var value = elem.val();
					if ( elem.is(":checkbox") ) {
						if ( elem.attr( "name" ).indexOf( "[" ) != -1 ) {
							value = [];
							$( "[name='" + elem.attr( "name" ) +"']:checked" ).each( function() {
								value.push( $(this).val() );
							} );
						} else {
							value = elem.is( ":checked" );
							//alert(value)
						}
					}
					if ( elem.is( ":radio" ) ) {
						value = elem.val();
					}
					self.saveToLocalStorage( prefix, value );
				} );
			},
			
			
			/**
			 * Bind saving (by timeout) field data to local storage when user fills it
			 *
			 * @param Object protectedFields	jQuery form elements tuple
			 *
			 * @return void
			 */
			bindSaveDataByTimeout: function( protectedFields ) {
				var self = this;
				setTimeout( (function( protectedFields ) {
					function timeout() {
						protectedFields.each( function() {
							var elem = $( this );
							if ( elem.is( ":text" ) || elem.is( "textarea" ) ) {
								var prefix = self.href + elem.parents( "form" ).attr( "id" ) + elem.attr( "name" ) + self.options.customKeyPrefix;
								try {
									localStorage.setItem( prefix, elem.val() );
								} catch (e) {
									//QUOTA_EXCEEDED_ERR
								}
							}
						} );
						if ( $.isFunction( self.options.onSaveCallback ) ) {
							self.options.onSaveCallback.call();
						}
						setTimeout( timeout, self.options.timeout * 1000 );
					}
					return timeout;
				})(protectedFields), self.options.timeout * 1000 );
			},
			
			
			/**
			 * Bind release form fields data from local storage on submit/reset form
			 *
			 * @param Object protectedFields	jQuery object contains form fields to protect
			 *
			 * @return void
			 */
			bindReleaseDataOnSubmitOrReset: function( protectedFields ) {
				var self = this;
				protectedFields.parents( "form" ).bind( "submit reset", function() {
					self.releaseData( protectedFields );
				} );
			},
			
			
			/**
			 * Bind release form fields data from local storage on submit/resett form
			 *
			 * @param Object protectedFields	jQuery object contains form fields to protect
			 *
			 * @return void
			 */
			releaseData: function( protectedFields ) {
				var released = false;
				var self = this;
				var targetFormId = protectedFields.parents( "form" ).attr( "id" );
				protectedFields.each( function() {
					field = $(this);
					var prefix = self.href + targetFormId + field.attr( "name" ) + self.options.customKeyPrefix;
					localStorage.removeItem( prefix );
					released = true;
				} );
				if ( released && $.isFunction( self.options.onReleaseDataCallback ) ) {
					self.options.onReleaseDataCallback.call();
				}
			}
			
		};
	}
	
	return {
		getInstance: function() {
			if ( ! instantiated){
				instantiated = init();
			}
			return instantiated; 
		}
	};
})();
