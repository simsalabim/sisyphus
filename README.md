# Sisyphus
Plugin developed to save html forms data to LocalStorage to restore them after browser crashes, tabs closings and other disasters.

Description and sample are available at http://simsalabim.github.com/sisyphus/

CKEDITOR and TinyMCE integration demos are available in the *demo* folder of the repository.

Smashing Magazine article: http://coding.smashingmagazine.com/2011/12/05/sisyphus-js-client-side-drafts-and-more/

# How to contribute
1. Fork the repository
2. Make your changes
3. Check that your code style matches [jQuery Core Style Guidelines](http://contribute.jquery.org/style-guide/js/)
4. Use [uglifyjs](http://marijnhaverbeke.nl/uglifyjs) to build minified version of Sisyphus 
  - Visual Studio with Web Essentials will also do this for you
5. Send a pull request

Author: Alexander Kaupanin

Updates by Tommi Gustafsson

# jQuery Support
Sisyphus supports jQuery 1.4.3 and later.

# Browser Support
Sisyphus works on browsers that support HTML5 local storage: IE8+, Firefox, Chrome, Opera 10.5+, and Safari 4.0+.

You can also use [jStorage](https://github.com/andris9/jStorage) to replicate localStorage functionality in browsers without local storage support.

# Changelog

## 2013-03-12
1. Added TinyMCE integration demo

## 2013-03-11
1. Solution to the oninput and onpropertychange detection problem

## 2013-03-07
1. Made several new events for CKEDITOR integration: onBeforeSave, onBeforeTextSave, and "textsave.sisyphus" event for programmatic event triggering for text fields.
2. Removed $.browser check, which did not work in jQuery 1.9.
  - Now we will just update text twice in IE, since what I heard, oninput and onpropertychange support tests are unreliable. If you know how to detect which one to use in jQuery 1.9 and later, you are welcome to suggest a change.