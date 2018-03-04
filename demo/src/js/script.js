//@codekit-prepend "plugins.js"
// Scripts ////////////////////////////////////////////////////////

// Titler ---------------------------------------------------------
var $siteTitle   = $('h1.site_title'),
    $titlePicker = $('#titler');

$titlePicker.on('change', function() {
  $siteTitle.css('color', $titlePicker.colourPicker('val'));
}).change();

// Do the magic ---------------------------------------------------
var $magicPicker  = $('#magic'),
    $magicLabel   = $magicPicker.closest('label');
var magicTimer,
    magicHue      = 0,
    magicStep     = (360  / 90),
    magicInterval = (1000 / 29.97);

function addMagic(oldHue) {
  var newHue = (oldHue >= 360) ? 0 : oldHue + magicStep;
  $magicPicker.colourPicker('hue', newHue);
  return newHue;
}

function startMagic() {
  magicTimer = setInterval(function() {
    magicHue = addMagic(magicHue);
  }, magicInterval);
}

function stopMagic() {
  clearInterval(magicTimer);
}

$magicLabel.hover(startMagic, stopMagic);

