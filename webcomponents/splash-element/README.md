# &lt;splash-element&gt;

_A Polymer based Web-Component helping you to display a splash screen while your own Web-Component is getting ready._


## What can you do with it ?

**&lt;splash-element&gt;** allows you to customize the transition with a Polymer's built-in effects, and lets you decide when it should be played :
* At once when your Web-Component is fully ready
* After a given time (don't worry, if your Web-Component isn't ready yet, the transition will be delayed until it is)
* When your own Web-Component fires an event of your choosing
* Or simply manually, whenever you see fit

You can also rewind it, and listen to the end of the transition.

## How can you do it ?

Use a &lt;splash-element&gt; component and put your Web-Component in its light DOM. Give an id to your splash,
and pass it to &lt;splash-element&gt; via its 'splashId' attribute.

###Customize the transition

Simply set the 'transition' attribute to your splash and Web-Component with one of the following :
* 'core-transition-fade' (default)
* 'core-transition-center'
* 'core-transition-top',
* 'core-transition-bottom'
* 'core-transition-left'
* 'core-transition-right'

[Please check core-transition for more details.](https://github.com/Polymer/core-transition/blob/master/core-transition-css.html)

Note that you cannot change it during runtime. If you add multiple Web-Components to &lt;splash-element&gt;'s light DOM,
only the first one's 'transition' attribute will be accounted for.

###Play the transition as soon my Web-Component is fully ready

That's the default behaviour, you don't need to change any of the &lt;splash-element&gt;'s attributes (except 'splashId' of course).

###Play the transition after a given time

The 'minSplashDuration' is here for you. Set the time in milliseconds. Note that :
* if your Web-Component isn't ready yet after 'minSplashDuration' milliseconds, the transition will be delayed until it is
* if you set the 'waitFor' will has priority over 'minSplashDuration'
* if you set the 'manual' attribute, you will need to first call the 'initiate()' method. 

###Play the transition when your element fires an event

The 'waitFor' is here what you are looking for : set it with your event's name (just don't forget to fire it in your component!). Note that :
* this attributes has priority over 'minSplashDuration'
* if you set the 'manual' attribute, you will need to first call the 'initiate()' method. 

###Play the transition manually, whenever you want

Give it the 'manual' attribute, and call the 'initiate()' method of &lt;splash-element&gt;.
It then will look for it's 'minSplashDuration' and 'waitFor' attributes to define when/how the transition should be played. Leave them both alone to play it at once.

###Rewind the transition once it was played

Just call &lt;splash-element&gt;'s 'rewind()' method to do it immediately.

###Know when your transition was played

Simply listen to the 'transitionend' event that &lt;splash-element&gt; fires.

###Example

```html
<style>
	#splash {
		position: absolute;
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;
		background-repeat: no-repeat;
		background-position: 50%;
		background-size: 300px;
		background-image: url(res/your-splash.svg);
		background-color: #eee;
	}
</style>

<splash-element splashId="splash" minSplashDuration="2000" fit>
	<your-element class="element" transition="core-transition-bottom" fit></your-element>
</splash-element>
<div id="splash" transition="core-transition-center"></div>
```

What it does :

When the **&lt;splash-element&gt;** is added to the DOM, it will display the **&lt;div id="splash"&gt;** for 2000ms before transitioning to **&lt;your-element&gt;** (or wait for &lt;your-element&gt; to be ready if it takes more than 2000ms).
The **&lt;div id="splash"&gt;** will slide down the page, will &lt;your-element&gt; will 'zoom-in' the page.

## Demo!

[This way.](http://vguillou.github.io/webcomponents/splash-element/demo.html)

## License

[MIT License](http://opensource.org/licenses/MIT)