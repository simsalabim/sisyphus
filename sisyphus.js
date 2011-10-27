/**
 * Plugin developed to save html forms data to LocalStorage to restore them after browser crashes, tabs closings
 * and other disasters.
 *
 * @author Alexander Kaupanin <kaupanin@gmail.com>
 */
  
(function($) {
  
  $.fn.sisyphus = function() {
    protect(this);
  };
  
  /**
   * Protect specified forms, store it's fields data to local storage and restore them on page load
   *
   * @param [Object] targets  - forms object(s), result of jQuery selector
   * @return void
   */
  function protect(targets) {
    if (! isLocalStorageAvailable()) {
      return false;
    }
    
    var href = window.location.hostname + window.location.pathname + window.location.search;
    $(targets).each(function(){
      var target = $(this);
      var protectedFields = target.find(':input');
      bindSaveAndRestoreData(protectedFields, target, href);
      bindReleaseDataOnSubmitOrReset(protectedFields, target, href);
    });
  }
  
  
  /**
   * Restore form fields data and bind saving it's instant condition to local storage
   *
   * @param Object protectedFields   jQuery object contains form fields to protect
   * @param Object target            jQuery target form object
   * @param String href              current window location
   *
   * @return void
   */
  function bindSaveAndRestoreData(protectedFields, target, href) {
    protectedFields.each(function(){
      var prefix = href + target[0].id + this.name;
      var resque = localStorage.getItem(prefix);
      if (resque) {
        restoreData(this, resque)
      }
      bindSaveData(this, prefix);
    });
  }
  
  
  /**
   * Restore form field data from local storage
   *
   * @param HTMLDomElement elem   form element object
   * @param String resque         previously stored fields data
   *
   * @return void
   */
  function restoreData(elem, resque) {
    if (elem.type == 'checkbox' && resque != 'false' && elem.name.indexOf('[') == -1) {
      elem.checked = true;
    } else if (elem.type == 'radio') {
      if (elem.value == resque) {
        $(elem).attr('checked', 'checked');
      }
    } else if (elem.name.indexOf('[') == -1) {
      elem.value = resque; 
    } else {
      resque = resque.split(',');
      $(elem).val(resque); 
    }
  }
  
  
  /**
   * Bind saving field data to local storage when user fills it
   *
   * @param HTMLDomElement elem   form element object
   * @param String prefix         prefix used as key to store data in local storage
   *
   * @return void
   */
  function bindSaveData(elem, prefix) {
    if ($(elem).is(':text') || $(elem).is('textarea')) {
      elem.oninput = function() {
        try {
          localStorage.setItem(prefix, elem.value);
        } catch (e) {
          //QUOTA_EXCEEDED_ERR
        }
      }
    } else {
      elem.onchange = function() {
        var value = $(elem).val();
        if (elem.type == 'checkbox') {
          if (elem.name.indexOf('[') != -1) {
            value = [];
            $('[name="' + elem.name + '"]:checked').each(function(){ value.push(this.value) });
          } else {
            value = $(elem).is(':checked');
          }
        }
        if (elem.type == 'radio') {
          value = elem.value;
        }
        try {
          localStorage.setItem(prefix, value);
        } catch (e) {
          //QUOTA_EXCEEDED_ERR
        }
      }
    }
  }
  
  
  /**
   * Bind release form fields data from local storage on submit/resett form
   *
   * @param Object protectedFields   jQuery object contains form fields to protect
   * @param Object target            jQuery target form object
   * @param String href              current window location
   *
   * @return void
   */
  function bindReleaseDataOnSubmitOrReset(protectedFields, target, href) {
    target.submit(function(){
      releaseData(protectedFields, target, href);
    });
    target.bind('reset', function(){
      releaseData(protectedFields, target, href);
    });
  }
  
  
  /**
   * Bind release form fields data from local storage on submit/resett form
   *
   * @param Object protectedFields   jQuery object contains form fields to protect
   * @param Object target            jQuery target form object
   * @param String href              current window location
   *
   * @return void
   */
  function releaseData(protectedFields, target, href) {
    protectedFields.each(function(){
      var prefix = href + target[0].id + this.name;
      localStorage.removeItem(prefix);
    });
  }
  
  
  /**
   * Check if local storage is available
   *
   * @return Boolean
   */
  function isLocalStorageAvailable() {
    try {
       return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
       return false;
    }
  }
  
})(jQuery);