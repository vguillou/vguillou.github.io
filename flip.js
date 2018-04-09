(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Flip = factory());
}(this, (function () { 'use strict';

  function snakeToCamel(str) {
    return str.replace(/(-\w)/g, function (match) {
      return match[1].toUpperCase();
    });
  }

  function nextFrame(fn) {
    // Twice because of firefox
    requestAnimationFrame(function () {
      return requestAnimationFrame(fn);
    });
  }

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var ElementHelper = function () {
    function ElementHelper(element) {
      classCallCheck(this, ElementHelper);

      this.element = element;
    }

    createClass(ElementHelper, [{
      key: 'getStyle',
      value: function getStyle(styleProp) {
        return window.getComputedStyle(this.element).getPropertyValue(styleProp);
      }
    }, {
      key: 'getStyles',
      value: function getStyles(styleProps) {
        var _this = this;

        return styleProps.map(function (prop) {
          return _this.getStyle(_this.element, prop);
        });
      }
    }, {
      key: 'setStyle',
      value: function setStyle(styleProp, value) {
        this.element.style[snakeToCamel(styleProp)] = value;
      }
    }, {
      key: 'addClass',
      value: function addClass(clazz) {
        this.element.classList.add(clazz);
      }
    }, {
      key: 'addEventListener',
      value: function addEventListener(eventName, cb) {
        this.element.addEventListener(eventName, cb);
      }
    }, {
      key: 'removeEventListener',
      value: function removeEventListener(eventName, cb) {
        this.element.removeEventListener(eventName, cb);
      }
    }, {
      key: 'measure',
      value: function measure(otherPropsToFlip) {
        return {
          rect: this.element.getBoundingClientRect(),
          opacity: this.getStyle('opacity'),
          others: this.getStyles(otherPropsToFlip)
        };
      }
    }], [{
      key: 'getTransition',
      value: function getTransition(properties, transitionDuration, transitionTimingFunction) {
        return properties.map(function (prop) {
          return prop + ' ' + transitionDuration + ' ' + transitionTimingFunction;
        }).join(',');
      }
    }, {
      key: 'getTransform',
      value: function getTransform(translateX, translateY, scaleX, scaleY) {
        var transforms = [];
        if (translateX || translateY) transforms.push('translate(' + translateX + 'px,' + translateY + 'px)');
        if (scaleX !== 1 || scaleY !== 1) transforms.push('scale(' + scaleX + ',' + scaleY + ')');
        return transforms.join(' ');
      }
    }]);
    return ElementHelper;
  }();

  var Flipper = function () {
    function Flipper(element, toClass, otherPropsToFlip) {
      classCallCheck(this, Flipper);

      this.helper = new ElementHelper(element);
      this.toClass = toClass;
      this.otherPropsToFlip = otherPropsToFlip ? [].concat(otherPropsToFlip) : [];
    }

    createClass(Flipper, [{
      key: 'firstLastInvert',
      value: function firstLastInvert() {
        // first
        var first = this.helper.measure(this.otherPropsToFlip);

        this.helper.addClass(this.toClass);

        // last
        var last = this.helper.measure(this.otherPropsToFlip);

        // invert
        this.inverted = this.invert(first, last, this.otherPropsToFlip);
      }
    }, {
      key: 'play',
      value: function play(transitionDuration, transitionTimingFunction) {
        var _this = this;

        return new Promise(function (resolve) {
          // For starters, lets check if we actually have anything to transition
          var transitionProps = [];
          if (_this.inverted.hasTransformChanged) transitionProps.push('transform');
          if (_this.inverted.hasOpacityChanged) transitionProps.push('opacity');
          Flipper.forEachPropThatChanged(_this.otherPropsToFlip, _this.inverted, function (prop) {
            return transitionProps.push(prop);
          });
          if (!transitionProps.length) {
            resolve();
            return;
          }

          // Set the transition property to enable...well...the transition
          _this.helper.setStyle('transition', ElementHelper.getTransition(transitionProps, transitionDuration, transitionTimingFunction));

          // Prepare cleanup and resolve after the transition
          var transitionEndCallback = function transitionEndCallback() {
            _this.helper.removeEventListener('transitionend', transitionEndCallback);
            _this.helper.setStyle('transition', '');
            resolve();
          };
          _this.helper.addEventListener('transitionend', transitionEndCallback);

          // Remove transform and opacity to trigger the transition towards the css class
          if (_this.inverted.hasTransformChanged) _this.helper.setStyle('transform', '');
          if (_this.inverted.hasOpacityChanged) _this.helper.setStyle('opacity', '');
          Flipper.forEachPropThatChanged(_this.otherPropsToFlip, _this.inverted, function (prop) {
            return _this.helper.setStyle(prop, '');
          });
        });
      }
    }, {
      key: 'invert',
      value: function invert(first, last, otherPropsToFlip) {
        var _this2 = this;

        // Calculate
        var inverted = {
          translateX: (first.rect.left + first.rect.right) / 2 - (last.rect.left + last.rect.right) / 2,
          translateY: (first.rect.top + first.rect.bottom) / 2 - (last.rect.top + last.rect.bottom) / 2,
          scaleX: first.rect.width / last.rect.width,
          scaleY: first.rect.height / last.rect.height,
          hasOpacityChanged: first.opacity !== last.opacity,
          opacity: first.opacity,
          hasOtherPropsToFlipChanged: first.others.map(function (firstOther, index) {
            return firstOther !== last.others[index];
          }),
          otherPropsToFlip: first.others
        };
        inverted.transform = ElementHelper.getTransform(inverted.translateX, inverted.translateY, inverted.scaleX, inverted.scaleY);
        inverted.hasTransformChanged = !!inverted.transform;

        // Invert
        if (inverted.hasTransformChanged) this.helper.setStyle('transform', inverted.transform);
        if (inverted.hasOpacityChanged) this.helper.setStyle('opacity', inverted.opacity);
        Flipper.forEachPropThatChanged(otherPropsToFlip, inverted, function (prop, index) {
          return _this2.helper.setStyle(prop, inverted.otherPropsToFlip[index]);
        });

        // return info about what has changed
        return inverted;
      }
    }], [{
      key: 'equals',
      value: function equals(first, second) {
        return first.helper.element === second.helper.element && first.toClass === second.toClass;
      }
    }, {
      key: 'forEachPropThatChanged',
      value: function forEachPropThatChanged(props, inverted, actionFn) {
        props.forEach(function (p, index) {
          if (inverted.hasOtherPropsToFlipChanged[index]) actionFn(p, index);
        });
      }
    }]);
    return Flipper;
  }();

  /**
   * A simple an small implementation of Paul Lewis' Flip animation principle.
   */

  var Flip = function () {
    function Flip() {
      classCallCheck(this, Flip);

      this.reset();
    }

    /**
     * Set the properties of the transition
     * @param {String} duration as set in CSS (default is '375ms')
     * @param {String} timingFunction as set in CSS (default is 'cubic-bezier(0.4, 0.0, 0.2, 1)')
     * @returns {Flip} the instance of Flip
     */


    createClass(Flip, [{
      key: 'withTransition',
      value: function withTransition() {
        var duration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '375ms';
        var timingFunction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'cubic-bezier(0.4, 0.0, 0.2, 1)';

        this.transitionDuration = duration || this.transitionDuration;
        this.transitionTimingFunction = timingFunction || this.transitionTimingFunction;
        return this;
      }

      /**
       * Set the element(s) that will transition, and the CSS to which it will transition to.
       * @param {(HTMLElement|Array<HTMLElement>)} elements that will transition
       * @param {String} toClass CSS class to which the element will transition to
       * @param {(String|Array<String>)} otherPropsToFlip Optionnaly, the additionnal CSS properties
       * that should transition (other than 'opacity' and 'transform', in snake case)
       * @returns {Flip} the instance of Flip
       * @throws {Error} if either 'element' or 'toClass' in not defined
       */

    }, {
      key: 'withClass',
      value: function withClass(elements, toClass) {
        var _this = this;

        var otherPropsToFlip = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

        if (!elements) throw new Error('elements should be defined');
        if (!toClass) throw new Error('toClass should be defined');
        if (this.ongoing) console.warn('withClass(): transition already ongoing');
        var elementArray = [].concat(elements);
        var newFlipper = void 0;
        elementArray.forEach(function (element) {
          newFlipper = new Flipper(element, toClass, otherPropsToFlip);
          if (!_this.flippers.some(function (currentFlipper) {
            return Flipper.equals(currentFlipper, newFlipper);
          })) {
            _this.flippers.push(newFlipper);
          }
        });
        return this;
      }

      /**
       * Triggers the transition.
       * @returns {Promise} that resolves after the transition ended.
       */

    }, {
      key: 'go',
      value: function go() {
        var _this2 = this;

        return new Promise(function (resolve) {
          _this2.ongoing = true;
          // fli
          _this2.flippers.forEach(function (flipper) {
            return flipper.firstLastInvert();
          });
          // p
          nextFrame(function () {
            var transitionPromises = _this2.flippers.map(function (flipper) {
              return flipper.play(_this2.transitionDuration, _this2.transitionTimingFunction);
            });
            Promise.all(transitionPromises).then(function () {
              _this2.ongoing = false;
              _this2.reset();
              resolve();
            });
          });
        });
      }

      /**
       * Resets everything (element(s) to transition, as well as transition settings).
       * @returns {Flip} the instance of Flip
       */

    }, {
      key: 'reset',
      value: function reset() {
        if (this.ongoing) console.warn('reset(): transition still ongoing');
        this.flippers = [];
        this.withTransition();
        return this;
      }
    }]);
    return Flip;
  }();

  return Flip;

})));
//# sourceMappingURL=flip.js.map
