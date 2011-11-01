/**
 * Plugin developed to save html forms data to LocalStorage to restore them after browser crashes, tabs closings
 * and other disasters.
 *
 * @author Alexander Kaupanin <kaupanin@gmail.com>
 */
	
(function($, window) {
	
	$.fn.sisyphus = function(options) {
		options = $.extend($.fn.sisyphus.defaults, options);
		protect(this, options);
		$.fn.sisyphus.action = null;
	};
	
	$.fn.sisyphus.defaults = {
		excludeFields: null,
		customKeyPrefix: "",
		timeout: 0,
		onSaveCallback: function() {},
		onRestoreCallback: function() {},
		onReleaseDataCallback: function() {}
	}
	
	/**
	 * Protect specified forms, store it's fields data to local storage and restore them on page load
	 *
	 * @param [Object] targets		forms object(s), result of jQuery selector
	 * @param Object options		plugin options
	 *
	 * @return void
	 */
	function protect(targets, options) {
		if (! isLocalStorageAvailable()) {
			return false;
		}

		var href = location.hostname + location.pathname + location.search;
		$(targets).each(function() {
			var target = $(this);
			var protectedFields = target.find(":input");
			bindSaveAndRestoreData(protectedFields, target, href, options);
			bindReleaseDataOnSubmitOrReset(protectedFields, target, href, options);
		});
	}
	
	
	/**
	 * Restore form fields data and bind saving it's instant condition to local storage
	 *
	 * @param Object protectedFields	jQuery object contains form fields to protect
	 * @param Object target			jQuery target form object
	 * @param String href				current window location
	 * @param Object options			plugin options
	 *
	 * @return void
	 */
	function bindSaveAndRestoreData(protectedFields, target, href, options) {
		var restored = false;
		protectedFields.each(function() {
			field = $(this);
			var prefix = href + target[0].id + field.attr("name") + options.customKeyPrefix;
			var resque = localStorage.getItem(prefix);
			if (resque) {
				restoreData(field, resque, options);
				restored = true;
			}
			bindSaveData(field, prefix, options);
		});
		if (restored && $.isFunction(options.onRestoreCallback)) {
			options.onRestoreCallback.call();
		}
	}
	
	
	/**
	 * Restore form field data from local storage
	 *
	 * @param Object elem		jQuery form element object
	 * @param String resque	previously stored fields data
	 * @param Object options	plugin options
	 *
	 * @return void
	 */
	function restoreData(elem, resque, options) {
		if (elem.is(":checkbox") && resque !== "false" && elem.attr("name").indexOf("[") === -1) {
			elem.attr("checked", "checked");
		} else if (elem.is(":radio")) {
			if (elem.val() === resque) {
				$(elem).attr("checked", "checked");
			}
		} else if (elem.attr("name").indexOf("[") === -1) {
			elem.val(resque); 
		} else {
			resque = resque.split(",");
			$(elem).val(resque); 
		}
	}
	
	
	/**
	 * Bind saving field data to local storage when user fills it
	 *
	 * @param Object elem		jQuery form element object
	 * @param String prefix	prefix used as key to store data in local storage
	 * @param Object options	plugin options
	 *
	 * @return void
	 */
	function bindSaveData(elem, prefix, options) {
		if (elem.is(":text") || elem.is("textarea")) {
			if (! options.timeout) {
				bindSaveDataImmediately(elem, prefix, options);
			} else {
				bindSaveDataByTimeout(elem, prefix, options);
			}
		} else {
			bindSaveDataOnChange(elem, prefix, options);
		}
	}
	
	
	/**
	 * Bind immediate saving (on typing/checking/changing) field data to local storage when user fills it
	 *
	 * @param Object elem		jQuery form element object
	 * @param String prefix	prefix used as key to store data in local storage
	 * @param Object options	plugin options
	 *
	 * @return void
	 */
	function bindSaveDataImmediately(elem, prefix, options) {
		if ($.browser.msie == null) {
			elem.get(0).oninput = function() {
				try {
					localStorage.setItem(prefix, elem.val());
				} catch (e) { 
					//QUOTA_EXCEEDED_ERR
				}
				if ($.isFunction(options.onSaveCallback)) {
					options.onSaveCallback.call();
				}
			}
		} else {
			elem.get(0).onpropertychange = function() {
				try {
					localStorage.setItem(prefix, elem.val() + "");
				} catch (e) { 
					//QUOTA_EXCEEDED_ERR
				}
				if (elem.val() != "" && $.isFunction(options.onSaveCallback)) {
					options.onSaveCallback.call();
				}
			}
		}
	}
	
	
	/**
	 * Bind saving (by timeout) field data to local storage when user fills it
	 *
	 * @param Object elem		jQuery form element object
	 * @param String prefix	prefix used as key to store data in local storage
	 * @param Object options	plugin options
	 *
	 * @return void
	 */
	function bindSaveDataByTimeout(elem, prefix, options) {
		setTimeout((function(elem) {
			function timeout() {
				try {
					localStorage.setItem(prefix, elem.val());
				} catch (e) {	}
				if ($.isFunction(options.onSaveCallback)) {
					options.onSaveCallback.call();
				}
				setTimeout(timeout, options.timeout * 1000);
			}
			return timeout;
		})(elem), options.timeout * 1000);
	}
	
	
	/**
	 * Bind saving field data on change
	 *
	 * @param Object elem		jQuery form element object
	 * @param String prefix	prefix used as key to store data in local storage
	 * @param Object options	plugin options
	 *
	 * @return void
	 */
	function bindSaveDataOnChange(elem, prefix, options) {
		elem.change(function() {
			var value = elem.val();
			if (elem.is(":checkbox")) {
				if (elem.attr("name").indexOf("[") != -1) {
					value = [];
					$("[name='" + elem.attr("name") +"']:checked").each(function() {
						value.push($(this).val()) 
					});
				} else {
					value = elem.is(":checked");
				}
			}
			if (elem.is(":radio")) {
				value = elem.val();
			}
			try {
				localStorage.setItem(prefix, value);
			} catch (e) { 
				//QUOTA_EXCEEDED_ERR
			}
			if ($.isFunction(options.onSaveCallback)) {
				options.onSaveCallback.call();
			}
		});
	}
	
	
	/**
	 * Bind release form fields data from local storage on submit/resett form
	 *
	 * @param Object protectedFields	jQuery object contains form fields to protect
	 * @param Object target			jQuery target form object
	 * @param String href				current window location
	 * @param Object options			plugin options
	 *
	 * @return void
	 */
	function bindReleaseDataOnSubmitOrReset(protectedFields, target, href, options) {
		target.bind("submit reset", function() {
			releaseData( protectedFields, target, href, options );
		});
	}
	
	
	/**
	 * Bind release form fields data from local storage on submit/resett form
	 *
	 * @param Object protectedFields	jQuery object contains form fields to protect
	 * @param Object target			jQuery target form object
	 * @param String href				current window location
	 * @param Object options			plugin options
	 *
	 * @return void
	 */
	function releaseData(protectedFields, target, href, options) {
		var released = false;
		protectedFields.each(function() {
			var prefix = href + target[0].id + this.name;
			localStorage.removeItem(prefix);
			released = true;
		});
		if (released && $.isFunction(options.onReleaseDataCallback)) {
			options.onReleaseDataCallback.call();
		}
	}
	
	
	/**
	 * Check if local storage is available
	 *
	 * @return Boolean
	 */
	function isLocalStorageAvailable() {
		try {
			return localStorage.getItem;;
		} catch (e) {
			return false;
		}
	}
	
})(jQuery, window);
