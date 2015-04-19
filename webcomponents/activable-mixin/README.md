# activable-mixin

_A Polymer mixin that gives you more control over the lifecycle of the children of your `core-selector`, and `core-animated-pages` in particular._

## What can you do with it ?

Direct children elements of `core-selector` that require finer control over their
activation status should add this **`ActivableMixin`** mixin to their Polymer
prototype definition and implement the `activated` and/or `deactivated` method(s).

Here are all the new callbacks they can implement :
* **willActivate** (only for children of `core-animated-pages`) :
Called before the transition when the child is selected. Useful to handle initialization
before your element gets visible.

* **activated** :
Called when the child is selected and displayed (after the end of the transition
if child of `core-animated-pages`).
* **willDeactivate** (only for children of `core-animated-pages`) :
Called before the transition when the child is unselected.

* **deactivated** :
Called when the child is unselected and not displayed anymore (after the end
of the transition if child of `core-animated-pages`).
Useful to handle exit tasks when your element isn't visible anymore.
 
## How do you use it ?

**`ActivableMixin`**'s must manually call the `activableAttributeChangedHandler` from the
element's `attributeChanged` callback, forwarding the 3 parameters. In addition, direct
children of a `core-animated-pages` element must call `activableDetachedHandler`
as well from their `detached` callback.
Then fill free to implement the new callbacks in your element.

### Example

First add the mixin and the necessary method calls in your element to setup the mixin:

```html
<polymer-element name="activable-element">
	<template>
		<content></content>
	</template>
	<script>
	Polymer('activable-element', Polymer.mixin({
		attributeChanged: function(attrName, oldVal, newVal) {
			// Necessary call to setup the mixin
			this.activableAttributeChangedHandler(attrName, oldVal, newVal);
		},
		detached: function() {
			// Necessary call when used inside a `core-animated-pages`
			this.activableDetachedHandler();
		},
		// New callbacks
		willActivate: function() { ... },
		activated: function() { ... },
		willDeactivate: function() { ... },
		deactivated: function() { ... }
	}, Polymer.ActivableMixin));
	</script>
</polymer-element>
```

Then use your element as a direct child of `core-selector` implementation, such as `core-animated-pages`:
```html
<core-animated-pages transitions="cross-fade">
	<activable-element log="page 1">
		<div cross-fade>page 1</div>
	</activable-element>
	<activable-element log="page 2">
		<div cross-fade>page 2</div>
	</activable-element>
	<activable-element log="page 3">
		<div cross-fade>page 3</div>
	</activable-element>
</core-animated-pages>
```

## Demo

[Here.](http://vguillou.github.io/webcomponents/activable-mixin/demo.html)

## License

[MIT License](http://opensource.org/licenses/MIT)