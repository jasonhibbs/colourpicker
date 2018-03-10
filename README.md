# ColourPicker.js

Finally, a usable (accessible, rational, and responsive) colour picker for the web.

[Demo ✨](http://colourpicker.jasonhibbs.co.uk/)

## Why?

I’ve not liked a single colour picker plugin I’ve found, and `<input type="color"/>` is useless to me.

The premise is simple: let people type their colour, or let them find one using a model designed with humans in mind.

## Setup

Add the required files…

```
<link rel="stylesheet" href="colourpicker.css">
<script src="jquery.min.js"></script>
<script src="tinycolor.js"></script>
<script src="colourpicker.js"></script>
```

Then…

```
<input type="colour"/>
```

Include jQuery, TinyColor, and the ColourPicker files, and simply put an `<input type="colour"/>` wherever you need one, or initialise an input with `$('#input').colourPicker(options);`.

Yes, that's the Old French spelling.

### Compatibility

It’s for the modern browsers, for sure. Here’s why:

- [Sliders are range inputs](https://caniuse.com/#feat=input-range)
- [Some gradients use calc()](https://caniuse.com/#feat=calc)

## Options

```
$('#input').colourPicker({
  autoSliders   : true,
  fallback      : 'black',
  fallbackAlpha : 'transparent',
  forceHex      : false,
  matchInput    : false,
  noAlpha       : false,
  useLastValid  : true,
});
```

## Methods

```
$('#input').colourPicker('val' [, string]);
$('#input').colourPicker('hue' [, 0-360]);
$('#input').colourPicker('saturation' [, 0-1]);
$('#input').colourPicker('value' [, 0-1]);
$('#input').colourPicker('alpha' [, 0-1]);
$('#input').colourPicker('isDark');
$('#input').colourPicker('show');
$('#input').colourPicker('hide');
$('#input').colourPicker('toggle');
```

## Style

ColourPicker is designed to inherit existing input styles. The included LESS is minimal on the text input, and very basic for the slider popover.

Since we’re using input[type=range] for the sliders, it is only compatible in recent browsers that allow styles here.

The particular style of this demo comes from my other project Pugless with only the addition of a focus style for the swatch button.

## Is that it?

I’m not a level 99 javascript developer so I’d appreciate that kind of feedback.

I have a few other to-dos.
