function doAnimate(event) {
    var el = event.currentTarget;

    // Get the first position.
    var first = el.getBoundingClientRect();

    // Now set the element to the last position.
    el.classList.add('state-after');

    // Read again. This forces a sync
    // layout, so be careful.
    var last = el.getBoundingClientRect();

    // You can do this for other computed
    // styles as well, if needed. Just be
    // sure to stick to compositor-only
    // props like transform and opacity
    // where possible.
    var invert = first.top - last.top;
    var scaleX = first.width / window.innerWidth;


    // Invert.
    el.style.transform = 'translateY(' + invert + 'px) scaleX(' + scaleX + ')';

    // Wait for the next frame so we
    // know all the style changes have
    // taken hold.
    requestAnimationFrame(function() {

        // Switch on animations.
        el.classList.add('animate-on-transforms');

        // GO GO GOOOOOO!
        el.style.transform = '';
    });

    // Capture the end with transitionend
    el.addEventListener('transitionend', tidyUpAnimations(el));
}

function tidyUpAnimations(el) {
    return function () {
        // Switch off animations.
        el.classList.remove('animate-on-transforms');
    };
}

function reset() {
    document.querySelectorAll('li > span').forEach(function (el) {
        el.classList.remove('state-after');
    })
}