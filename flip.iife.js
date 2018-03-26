var Flip = (function () {
  'use strict';

  class Utils {
    static snakeToCamel(str) {
      return str.replace(/(-\w)/g, match => match[1].toUpperCase());
    }

    static nextFrame(fn) {
      // Twice because of firefox
      requestAnimationFrame(() => requestAnimationFrame(fn));
    }
  }

  class ElementHelper {
    constructor(element) {
      this.element = element;
    }

    cleanTransition() {
      this.element.style.transition = '';
    }

    setStyle(styleProp, value) {
      this.element.style[Utils.snakeToCamel(styleProp)] = value;
    }

    static getStyle(element, styleProp) {
      return window.getComputedStyle(element).getPropertyValue(styleProp);
    }

    static getStyles(element, styleProps) {
      return styleProps.map(prop => this.getStyle(element, prop));
    }

    static measure(element, otherPropsToFlip) {
      return {
        rect: element.getBoundingClientRect(),
        opacity: ElementHelper.getStyle(element, 'opacity'),
        others: ElementHelper.getStyles(element, otherPropsToFlip)
      };
    }

    static getTransition(properties, transitionDuration, transitionTimingFunction) {
      return properties.map(prop => `${prop} ${transitionDuration} ${transitionTimingFunction}`).join(',');
    }
  }

  class Flipper {
    constructor(element, toClass, otherPropsToFlip) {
      this.element = element;
      this.helper = new ElementHelper(element);
      this.toClass = toClass;
      this.otherPropsToFlip = otherPropsToFlip ? [].concat(otherPropsToFlip) : [];
    }

    firstLastInvert() {
      // first
      const first = ElementHelper.measure(this.element, this.otherPropsToFlip);

      this.element.classList.add(this.toClass);

      // last
      const last = ElementHelper.measure(this.element, this.otherPropsToFlip);

      // invert
      this.invert = this.invert(first, last, this.otherPropsToFlip);
    }

    play(transitionDuration, transitionTimingFunction) {
      // Switch on animations.
      const transitionProps = ['transform'];
      if (this.invert.hasOpacityChanged) transitionProps.push('opacity');
      Flipper.forEachPropThatChanged(this.otherPropsToFlip, this.invert, prop => transitionProps.push(prop));

      this.element.style.transition = ElementHelper.getTransition(transitionProps, transitionDuration, transitionTimingFunction);

      // Remove transform and opacity to trigger the transition towards the css class
      this.element.style.transform = '';
      if (this.invert.hasOpacityChanged) this.element.style.opacity = '';
      Flipper.forEachPropThatChanged(this.otherPropsToFlip, this.invert, prop => this.helper.setStyle(prop, ''));
    }

    cleanTransition() {
      this.helper.cleanTransition();
    }

    invert(first, last, otherPropsToFlip) {
      const invert = {
        translateX: (first.rect.left + first.rect.right) / 2 - (last.rect.left + last.rect.right) / 2,
        translateY: (first.rect.top + first.rect.bottom) / 2 - (last.rect.top + last.rect.bottom) / 2,
        scaleX: first.rect.width / last.rect.width,
        scaleY: first.rect.height / last.rect.height,
        hasOpacityChanged: first.opacity !== last.opacity,
        opacity: first.opacity,
        hasOtherPropsToFlipChanged: first.others.map((firstOther, index) => firstOther !== last.others[index]),
        otherPropsToFlip: first.others
      };

      // Invert
      this.element.style.transform = `translate(${invert.translateX}px,${invert.translateY}px) scale(${invert.scaleX},${invert.scaleY})`;
      if (invert.hasOpacityChanged) this.element.style.opacity = invert.opacity;
      Flipper.forEachPropThatChanged(otherPropsToFlip, invert, (prop, index) => this.helper.setStyle(this.element, prop, invert.otherPropsToFlip[index]));

      // return info about what has changed
      return invert;
    }

    static forEachPropThatChanged(props, invert, actionFn) {
      props.forEach((p, index) => {
        if (invert.hasOtherPropsToFlipChanged[index]) actionFn(p, index);
      });
    }

    static transitionEndCallback(flipper, resolve) {
      return () => {
        flipper.element.removeEventListener('transitionend', Flipper.transitionEndCallback);
        flipper.cleanTransition();
        if (resolve) resolve();
      };
    }
  }

  class Flip {
    constructor() {
      this.flippers = [];
      this.withTransition();
    }

    /**
     * Set the properties of the transition
     * @param {String} duration as set in CSS (default is '375ms')
     * @param {String} timingFunction as set in CSS (default is 'cubic-bezier(0.4, 0.0, 0.2, 1)')
     * @returns the instance of Flip
     */
    withTransition(duration = '375ms', timingFunction = 'cubic-bezier(0.4, 0.0, 0.2, 1)') {
      this.transitionDuration = duration || this.transitionDuration;
      this.transitionTimingFunction = timingFunction || this.transitionTimingFunction;
      return this;
    }

    /**
     * Set the element that will transition, and the CSS to which it will transition to.
     * @param {HTMLElement} element that will transition
     * @param {String}} toClass CSS class to which the element will transition to
     * @param {Array or String} otherPropsToFlip Optionnaly, the additionnal CSS properties
     * that should transition (other than 'opacity' and 'transform', in snake case)
     * @returns the instance of Flip
     * @throws {Error} if either 'element' or 'toClass' in not defined
     */
    withClass(element, toClass, otherPropsToFlip = []) {
      if (!element) throw new Error('element should be defined');
      if (!toClass) throw new Error('toClass should be defined');
      this.flippers.push(new Flipper(element, toClass, otherPropsToFlip));
      return this;
    }

    /**
     * Triggers the transition.
     * @returns A Promise that resolves after the transition ended.
     */
    go() {
      return new Promise(resolve => {
        // fli
        this.flippers.forEach(flipper => flipper.firstLastInvert());
        // p
        Utils.nextFrame(() => {
          this.flippers.forEach((flipper, index) => {
            flipper.element.addEventListener('transitionend', Flipper.transitionEndCallback(flipper, !index ? resolve : undefined));
            flipper.play(this.transitionDuration, this.transitionTimingFunction);
          });
        });
        if (!this.flippers.length) resolve();
      });
    }
  }

  return Flip;

}());
//# sourceMappingURL=flip.iife.js.map
