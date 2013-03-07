# Sisyphus
Plugin developed to save html forms data to LocalStorage to restore them after browser crashes, tabs closings and other disasters.

Description and sample are available at http://simsalabim.github.com/sisyphus/

Smashing Magazine article: http://coding.smashingmagazine.com/2011/12/05/sisyphus-js-client-side-drafts-and-more/

# How to contribute
1. Fork the repository
2. Make your changes
3. Check that your code style matches [jQuery Core Style Guidelines](http://contribute.jquery.org/style-guide/js/)
4. Use [uglifyjs](http://marijnhaverbeke.nl/uglifyjs) to build minified version of Sisyphus
5. Send a pull request

Author: Alexander Kaupanin

Updates by Tommi Gustafsson

# Changelog
## 2013-03-07
1. Made several new events for CKEDITOR integration: onBeforeSave, onBeforeTextSave, and "textsave.sisyphus" event for programmatic event triggering for text fields.
2. Removed $.browser check, which did not work in jQuery 1.9.
  - Now we will just update text twice in IE, since what I heard, oninput and onpropertychange support tests are unreliable. If you know how to detect which one to use in jQuery 1.9 and later, you are welcome to suggest a change.
