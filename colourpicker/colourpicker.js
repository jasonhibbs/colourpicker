// Colour Picker 1.0.1 ////////////////////////////////////////////
// https://github.com/jasonhibbs/colourpicker
// Author:  Jason Mervyn Hibbs
// License: MIT

(function($, tinycolor) {
  // Data /////////////////////////////////////////////////////////
  // - options    : object
  // - value      : string
  // - wrap       : object
  //   - el       : $
  // - input      : object
  //   - id       : string
  //   - el       : $,
  //   - original : $
  //   - placeho… : string
  // - swatch     : object
  //   - el       : $
  //   - button   : $
  //   - swatch   : $
  // - controls   : object
  //   - el       : $
  //   - close    : $
  //   - hidden   : boolean
  // - sliders    : object
  //   - hue      : object
  //     - input  : $
  //     - value  : number
  //   - saturat… : object
  //     - input  : $
  //     - value  : number
  //   - value    : object
  //     - input  : $
  //     - value  : number
  //   - alpha    : object
  //     - input  : $
  //     - value  : number

  // Setup ////////////////////////////////////////////////////////
  var name = 'colourpicker';

  var defaults, methods,
      html, ids, classes;

  classes = {
    wrap          : name,
    input         : name + '_input',
    swatch        : name + '_swatch',
    swatchButton  : name + '_swatch_button',
    controls      : name + '_controls',
    closeButton   : name + '_close',
    label         : name + '_label',
    slider        : name + '_slider',
    hue           : '_hue',
    saturation    : '_saturation',
    value         : '_value',
    alpha         : '_alpha',
  };

  copy = {
    swatchToggle  : 'Toggle Controls',
    controlsClose : 'Close Controls'
  };

  defaults = {
    autoSliders   : true,
    fallback      : 'black',
    fallbackAlpha : 'transparent',
    forceHex      : false,
    matchInput    : false,
    noAlpha       : false,
    useLastValid  : true,
  };

  // Methods ------------------------------------------------------
  methods = {
    init: function(options) {
      return this.each(attach);

      function attach() {
        var $el = $(this),
            opts = $.extend({}, defaults, options),
            picker = renderPicker($el);

        methods.options(opts, picker);
        updateDisplays(picker);
      }
    },

    options: function(options, picker) {
      picker = picker || getPickerData(this);
      picker.options = options;

      if (picker.input.el.attr('no-alpha') &&
          picker.input.el.attr('no-alpha') !== 'false') {
        picker.options.noAlpha = true;
      }

      if (picker.options.noAlpha) {
        picker.wrap.el.addClass('_no-alpha');
        picker.sliders.alpha.input.attr('hidden', 'hidden');
      } else {
        picker.wrap.el.removeClass('_no-alpha');
        picker.sliders.alpha.input.removeAttr('hidden');
      }

      if (picker.options.matchInput) {
        picker.wrap.el.css({
          'font-size'   : picker.input.css.fontSize,
          'line-height' : picker.input.css.lineHeight
        });
      } else {
        picker.wrap.el.css({
          'font-size'   : '',
          'line-height' : ''
        });
      }

      checkModel(picker);
      return this;
    },

    show: function(picker) {
      picker = picker || getPickerData(this);
      picker.controls.hidden = false;
      picker.swatch.button.attr('aria-expanded', true);
      picker.controls.el.removeAttr('hidden');
      onModelChange(picker);

      $(document).on('click.colourPickerControls touchend.colourPickerControls focusin.colourPickerControls', function(e) {
        var $target = $(e.target);
        if (!$target.closest(picker.wrap.el).length) {
          methods.hide(picker);
        }
      });

      return this;
    },

    hide: function(picker) {
      picker = picker || getPickerData(this);
      picker.controls.hidden = true;
      picker.swatch.button.attr('aria-expanded', false);
      picker.controls.el.attr('hidden', 'hidden');
      onModelChange(picker);
      $(document).off('click.colourPickerControls touchend.colourPickerControls focusin.colourPickerControls');
      return this;
    },

    toggle: function(picker) {
      picker = picker || getPickerData(this);
      if (picker.controls.hidden) {
        methods.show(picker);
      } else {
        methods.hide(picker);
      }
      return this;
    },

    hue: function(val, picker) {
      picker = picker || getPickerData(this);

      if (!arguments.length) {
        return picker.sliders.hue.value;
      } else {
        picker.sliders.hue.input
          .val(val)
          .trigger('change');
        return this;
      }
    },

    saturation: function(val, picker) {
      picker = picker || getPickerData(this);

      if (!arguments.length) {
        return picker.sliders.saturation.value;
      } else {
        picker.sliders.saturation.input
          .val(val)
          .trigger('change');
        return this;
      }
    },

    value: function(val, picker) {
      picker = picker || getPickerData(this);

      if (!arguments.length) {
        return picker.sliders.value.value;
      } else {
        picker.sliders.value.input
          .val(val)
          .trigger('change');
        return this;
      }
    },

    alpha: function(val, picker) {
      picker = picker || getPickerData(this);

      if (!arguments.length) {
        return picker.sliders.alpha.value;
      } else {
        picker.sliders.alpha.input
          .val(val)
          .trigger('change');
        return this;
      }
    },

    isDark: function(picker) {
      return isDark(picker || getPickerData(this));
    },

    val: function(val, picker) {
      picker = picker || getPickerData(this);

      if (!arguments.length) {
        return picker.value;
      } else {
        updateFromValue(val, picker);
        return this;
      }
    },

    destroy: function(picker) {
      picker = picker || getPickerData(this);
      picker.input.original.insertAfter(picker.wrap.el);
      picker.wrap.el.remove();
      picker = null;
    }
  };

  // Prototype ----------------------------------------------------
  $.fn.colourPicker = function(method) {
    if (methods[method]) {
      return methods[method]
        .apply(this, [].slice.call(arguments, 1));

    } else if (typeof method === 'object' || !method) {
      return methods.init
        .apply(this, arguments);

    } else {
      $.error('‘' + method + '’ doesn’t exist on ColourPicker');
    }
  };

  // Render ///////////////////////////////////////////////////////
  function getUsableInput($el) {
    var $input = $el;

    if (!$el.is('input[type=colour]')) {
      var originalAttributes = $el.prop('attributes');

      $input = $('<input type="colour">')
        .insertAfter($el);

      $el.remove();

      $.each(originalAttributes, function() {
        if (this.name === 'type') {
          return;
        }

        $input.attr(this.name, this.value);
      });
    }

    return $input;
  }

  function prepareInput($input) {
    var $original = $input.clone();
    $input = getUsableInput($input);

    var css = {
      fontSize  : $input.css('font-size'),
      lineHeight: $input.css('line-height')
    };

    $input
      .addClass(classes.input)
      .attr({
        autocomplete: 'off',
        spellcheck  : false
      });

    if (!$input.attr('id')) {
      $input.attr('id', name + '_' + getPickers().index($input));
    }

    return {
      id          : $input[0].id,
      el          : $input,
      css         : css,
      original    : $original,
      placeholder : $input.attr('placeholder')
    };
  }

  function renderSwatch(picker) {
    var $input = picker.input.el;

    var $swatch = $('<span>')
      .attr({
        id    : picker.input.id + '_swatch',
        class : classes.swatch,
      });

    var button = renderSwatchButton(picker);
    button.button.appendTo($swatch);

    return {
      el     : $swatch,
      button : button.button,
      swatch : button.swatch
    };
  }

  function renderSwatchButton(picker) {
    var $button = $('<button>')
      .attr({
        type            : 'button',
        class           : classes.swatchButton,
        title           : copy.swatchToggle,
        'aria-label'    : copy.swatchToggle,
        'aria-controls' : picker.input.id + '_controls',
        'aria-expanded' : 'false'
      })
      .on('click', function() {
        methods.toggle(picker);
      });

    var $swatch = $('<span>').appendTo($button);

    $swatch.after(renderSwatchButtonArrow());

    return {
      button : $button,
      swatch : $swatch
    };
  }

  function renderSwatchButtonArrow(picker) {
    return '<svg xmlns="http://www.w3.org/2000/svg"' +
      'viewBox="0 0 26 26">' +
      '<polyline points="17 11 13 15 9 11"' +
        'fill="none"' +
        'stroke="#000"' +
        'stroke-linecap="round"' +
        'stroke-linejoin="round"' +
        'stroke-width="0.75"/>' +
    '</svg>';
  }

  function doWrap(picker) {
    var wrap = $('<span class="' + classes.wrap + '"></span>');

    picker.input.el
      .wrap(wrap)
      .after(picker.swatch.el, picker.controls.el)
      .on('keyup', function() {
        onInputKeyup(picker);
      });

    wrap = picker.input.el.parent();

    return {
      el: wrap
    };
  }

  function renderSliders(picker) {
    var sliders = {
      hue: renderSlider({
        type   : 'hue',
        label  : 'Hue',
        id     : picker.input.id + '_slider__hue',
        class  : classes.hue,
        min    : 0,
        max    : 360,
        step   : 0.5,
        val    : 0,
        picker : picker
      }),
      saturation: renderSlider({
        type   : 'saturation',
        label  : 'Saturation',
        id     : picker.input.id + '_slider__saturation',
        class  : classes.saturation,
        min    : 0,
        max    : 1,
        step   : 0.01,
        val    : 0.75,
        picker : picker
      }),
      value: renderSlider({
        type   : 'value',
        label  : 'Value',
        id     : picker.input.id + '_slider__value',
        class  : classes.value,
        min    : 0,
        max    : 1,
        step   : 0.01,
        val    : 1,
        picker : picker
      }),
      alpha: renderSlider({
        type   : 'alpha',
        label  : 'Alpha',
        id     : picker.input.id + '_slider__alpha',
        class  : classes.alpha,
        min    : 0,
        max    : 1,
        step   : 0.01,
        val    : 1,
        picker : picker
      }),
    };

    picker.controls.el.append(
      sliders.hue.input,
      sliders.saturation.input,
      sliders.value.input,
      sliders.alpha.input
    );

    return sliders;
  }

  function renderSlider(slider) {
    var $slider = $('<input>')
      .attr({
        type  : 'range',
        id    : slider.id,
        class : classes.slider + ' ' + slider.class,
        min   : slider.min,
        max   : slider.max,
        step  : slider.step,
        title : slider.label,
        'aria-label' : slider.label
      })
      .val(slider.val)
      .on('input change', function(e) {
        onSliderInput($(this).val(), slider.type, slider.picker);
      });

    return {
      input : $slider,
      value : slider.val
    };
  }

  function renderControls(picker) {
    var $input = picker.input.el;

    var $controls = $('<div>')
      .attr({
        id     : picker.input.id + '_controls',
        class  : classes.controls,
        hidden : 'hidden',
        role   : 'dialog'
      });

    var $button = renderControlsCloseButton(picker)
      .appendTo($controls);

    return {
      el      : $controls,
      close   : $button,
      hidden  : true,
    };
  }

  function renderControlsCloseButton(picker) {
    var $button = $('<button>')
      .attr({
        type            : 'button',
        class           : classes.closeButton,
        title           : copy.controlsClose,
        'aria-label'    : copy.controlsClose,
        'aria-controls' : picker.input.id + '_controls',
        'aria-expanded' : 'false'
      })
      .on('click', function() {
        methods.hide(picker);
      });

    $button.append(renderControlsCloseButtonArrow());

    return $button;
  }

  function renderControlsCloseButtonArrow(picker) {
    return '<svg xmlns="http://www.w3.org/2000/svg"' +
      'viewBox="0 0 26 26">' +
      '<polyline points="17 9 13 13 9 9"' +
        'fill="none"' +
        'stroke="#999"' +
        'stroke-linecap="round"' +
        'stroke-linejoin="round"' +
        'stroke-width="1"/>' +
      '<polyline points="17 17 13 13 9 17"' +
        'fill="none"' +
        'stroke="#999"' +
        'stroke-linecap="round"' +
        'stroke-linejoin="round"' +
        'stroke-width="1"/>' +
    '</svg>';
  }

  function renderPicker($input) {
    var picker = {};

    picker.input    = prepareInput($input);
    picker.swatch   = renderSwatch(picker);
    picker.controls = renderControls(picker);
    picker.sliders  = renderSliders(picker);
    picker.wrap     = doWrap(picker);
    picker.value    = picker.input.el.val();

    picker.input.el.data(name, picker);
    return picker;
  }

  function renderSliderBackgrounds(picker) {
    renderSliderBackgroundSaturation(picker);
    renderSliderBackgroundValue(picker);
    renderSliderBackgroundAlpha(picker);
  }

  function renderSliderBackgroundSaturation(picker) {
    var sliders = picker.sliders,
        style = getSliderGradient({
          start : tinycolor({ h: sliders.hue.value, s: 0, v: 1}).toRgbString(),
          end   : tinycolor({ h: sliders.hue.value, s: 1, v: 1}).toRgbString()
        }, sliders.saturation.input);
    sliders.saturation.input.css('background-image', style);
  }

  function renderSliderBackgroundValue(picker) {
    var sliders = picker.sliders,
        style = getSliderGradient({
          start : tinycolor({ h: sliders.hue.value, s: sliders.saturation.value, v: 0}).toRgbString(),
          end   : tinycolor({ h: sliders.hue.value, s: sliders.saturation.value, v: 1}).toRgbString()
        }, sliders.value.input);
    sliders.value.input.css('background-image', style);
  }

  function renderSliderBackgroundAlpha(picker) {
    var sliders = picker.sliders,
        colour = getSlidersModelColour(picker),
        styles = getSliderGradientAlpha({
          start : colour.setAlpha(0).toRgbString(),
          end   : colour.setAlpha(1).toRgbString()
        }, sliders.alpha.input);
    sliders.alpha.input.css(styles);
  }

  function getSliderGradient(gradient, input) {
    var height = input[0].clientHeight;

    if (height) {
      gradient.start += (height / 2) +  'px';
      gradient.end   += ' calc(100% - ' + (height / 2) +  'px)';
    }

    return 'linear-gradient(90deg,' +
      gradient.start + ','    +
      gradient.end   +
    ')';
  }

  function getSliderGradientAlpha(gradient, input) {
    input.css({
      'background-image'    : '',
      'background-size'     : '',
      'background-position' : '',
    });

    var original = {
      'height'   : input[0].clientHeight,
      'image'    : input.css('background-image'),
      'size'     : input.css('background-size'),
      'position' : input.css('background-position'),
    };

    if (original.height) {
      gradient.end += ' calc(100% - ' + (original.height / 2) +  'px)';
    }

    return {
      'background-image': 'linear-gradient(90deg,' +
          gradient.start + ', ' +
          gradient.end +
        '), ' + original.image,
      'background-size'    : 'cover, ' + original.size,
      'background-position': '0 0, '   + original.position
    };
  }

  // Input ////////////////////////////////////////////////////////
  function onSliderInput(value, type, picker) {
    updateModelFromSlider(type, picker);
    updateFromSliders(picker);
  }

  function onInputKeyup(picker) {
    updateFromInput(picker);
  }

  function onModelChange(picker) {
    picker.input.el.data(name, picker);
    picker.input.el.trigger('change');
  }

  // Update ///////////////////////////////////////////////////////
  function updateFromValue(val, picker) {
    updateModel(val, picker);
    updateSlidersModelFromValue(picker);
    updateInputFromModel(picker);
    updateSwatchFromModel(picker);
    updateSlidersFromModel(picker);
  }

  function updateFromInput(picker) {
    updateModelFromInput(picker);
    updateSwatchFromModel(picker);
    updateSlidersFromModel(picker);
  }

  function updateFromSliders(picker) {
    updateModelFromSliders(picker);
    updateInputFromModel(picker);
    updateSwatchFromModel(picker);
  }

  // Model ------------------------------------
  function updateModel(val, picker) {
    if (picker.value === val) {
      return false;
    }

    if (!val) {
      picker.value = '';
      picker.value = getValidColour(picker);
    }

    if (!picker.options.useLastValid || isColourValid(val, picker)) {
      picker.value = val;
    }

    return picker.value;
  }

  function updateModelFromInput(picker) {
    var val = picker.input.el.val();
    if (updateModel(val, picker)) {
      updateSlidersModelFromValue(picker);
      onModelChange(picker);
    }
  }

  function updateModelFromSlider(type, picker) {
    var slider = picker.sliders[type];
    slider.value = parseFloat(slider.input.val());
    updateSlidersModelFromSlider(type, picker);
    onModelChange(picker);
  }

  function updateModelFromSliders(picker) {
    var colour = getSlidersModelColour(picker),
        string = colour.toName() || colour.toRgbString();

    if (picker.options.forceHex) {
      string = colour.toHexString();
    }

    picker.value = string;
  }

  function updateSlidersModelFromSlider(type, picker) {
    var sliders = picker.sliders;

    if (picker.options.noAlpha) {
      sliders.alpha.value = 1;
    }

    if (picker.options.autoSliders) {
      if (type && type !== 'alpha' && sliders.alpha.value === 0) {
        sliders.alpha.value = 1;
      }

      if (type === 'hue' && sliders.saturation.value === 0) {
        sliders.saturation.value = 0.75;
      }

      if ((type === 'hue' || type === 'saturation') && sliders.value.value === 0) {
        sliders.value.value = 1;
      }
    }

    updateSlidersFromModel(picker);
  }

  function updateSlidersModelFromValue(picker) {
    var colour   = tinycolor(picker.value).toHsv();
        colour.a = (picker.options.noAlpha) ? 1 : tinycolor(picker.value).getAlpha();

    picker.sliders.hue.value        = colour.h;
    picker.sliders.saturation.value = colour.s;
    picker.sliders.value.value      = colour.v;
    picker.sliders.alpha.value      = colour.a;
  }

  // UI ---------------------------------------
  function updateDisplays(picker) {
    updateSwatchFromModel(picker);
    updateSlidersFromModel(picker);
  }

  function updateInputFromModel(picker) {
    picker.input.el.val(picker.value);
  }

  function updateSwatchFromModel(picker) {
    picker = picker || getPickerData(this);
    picker.swatch.swatch.css('background-color', getValidColour(picker));
    checkBrightness(picker);
  }

  function updateSliderFromModel(type, picker) {
    var slider = picker.sliders[type];
    slider.input.val(slider.value);
  }

  function updateSlidersFromModel(picker) {
    var colour   = tinycolor(picker.value).toHsv();
        colour.a = tinycolor(picker.value).getAlpha();

    updateSliderFromModel('hue',        picker);
    updateSliderFromModel('saturation', picker);
    updateSliderFromModel('value',      picker);
    updateSliderFromModel('alpha',      picker);
    renderSliderBackgrounds(picker);
  }

  // Check --------------------------------------------------------
  function getValidColour(picker) {
    if (isColourValid(picker.value, picker)) {
      return picker.value;
    }

    if (isColourValid(picker.input.placeholder, picker)) {
      return picker.input.placeholder;
    }

    if (!picker.options.noAlpha) {
      return picker.options.fallbackAlpha;
    }

    return picker.options.fallback;
  }

  function checkModel(picker) {
    picker.value = getValidColour(picker);
    updateSlidersModelFromValue(picker);
  }

  function checkBrightness(picker) {
    picker.wrap.el
      .removeClass('_light _dark')
      .addClass(isDark(picker) ? '_dark' : '_light');
  }

  function isDark(picker) {
    var colour     = tinycolor(picker.value),
        brightness = colour.getBrightness(),
        alpha      = colour.getAlpha(),
        is_dark    = ((brightness / 255) < 0.6 && alpha > 0.4);

    return is_dark;
  }

  function getSlidersModelColour(picker) {
    return tinycolor({
      h: picker.sliders.hue.value,
      s: picker.sliders.saturation.value,
      v: picker.sliders.value.value,
      a: picker.sliders.alpha.value,
    });
  }

  function getPickerData(el) {
    return el.data()[name];
  }

  function getPickers() {
    return $('.' + classes.input);
  }

  function isColourValid(color, picker) {
    var colour = tinycolor(color);

    if (picker && picker.options.noAlpha && colour.getAlpha() !== 1) {
      return false;
    }

    return colour.isValid();
  }

  // Run ----------------------------------------------------------
  $('input[type=colour]').colourPicker();

}(jQuery, tinycolor));

// TODO:
// - Allow controls to be appended to an existing element
// - Default placeholders
// - More testing of valid values with options; placeholder vs. fallback vs. no alpha, etc.
// - getPickerData should work on multiple elements
// - Add disabled state
// - Check offset for controls position
// - Examine HTML5 validation
// - Examine non-# hex input
// - If initialised on input[type=color], forceHex must be true, because spec
