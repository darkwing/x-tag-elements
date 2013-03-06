/* 

Specs
============================
https://etherpad.mozilla.org/dragbox-specs

To Do:
============================
-  Verify that CSS classes are added / removed to the correct

*/

(function() {
	var dragElement;

	function valueOrDefault(attr) {
		return function() {
			return this.hasAttribute(attr) ? this.getAttribute(attr) : false;
		}
	}

	xtag.register('x-dragbox', {
		lifecycle: {
			created: function(){
				var self = this;
				this.makeSortable(this.getDropElement().children);
				xtag.addObserver(this, 'inserted', function(element){
					if (element.parentNode == self.getDropElement()) {
						self.makeSortable([element]);
					}
				});
			}
		},
		prototype: {},
		accessors: {
			sortable: { // "true" or "false"
				get: function() {
					return !!this.getAttribute('sortable');
				},
				set: function(state) {
					return !!state ? this.setAttribute('sortable', null) : this.removeAttribute('sortable');
				}
			},
			'drag-elements': {
				get: function() { // Returns the children
					return this.getAttribute('drag-elements') || false;
				}
			},
			'drop-element': {
				get: function() {
					return this.getAttribute('drop-element') || false;
				}
			},
			'prevent-drop': { // CSS selector
				get: valueOrDefault('prevent-drop')
			},
			'prevent-drag': { // CSS selector
				get: valueOrDefault('prevent-drag')
			}
		},
		methods: {  // SAME
			makeSortable:  function(elements) {
				var self = this;
				xtag.toArray(elements).forEach(function(el) {
					var dragElementSelector = self['drag-elements'];
					if(!dragElementSelector || xtag.matchSelector(el, dragElementSelector)) { 
						el.setAttribute('draggable', 'true'); 
					}
				});
			},
			getDropElement: function() {
				var selector = this['drop-element'],
					element = this,
					result;

				if(selector) {
					result = xtag.queryChildren(this, selector);
					if(result[0]) element = result[0];
				}
				return element;
			}
		},
		events: { /* Check these vs. the old pattern! */
			dragstart: function(event){
				var preventDragSelector = this['prevent-drag'];
				if (event.target.parentNode == this.getDropElement() && (!preventDragSelector || !xtag.matchSelector(event.target, preventDragSelector))){
					dragElement = event.target;
					xtag.addClass(event.target, 'x-dragbox-drag-origin');
					event.dataTransfer.effectAllowed = 'move';
					event.dataTransfer.dropEffect = 'move';
					event.dataTransfer.setData('text/html', this.innerHTML);
				}
			},
			dragenter: function(event){
				var target = event.target;
				if (target.parentNode.tagName.match(/x-dragbox/i)){
					xtag.addClass(target, 'x-dragbox-drag-over');
				}
			},
			dragover: function(event){
				if (event.preventDefault) event.preventDefault();
				event.dataTransfer.dropEffect = 'move';  // ? need
				return false;
			},
			dragleave: function(event){
				if(event.target.nodeType == 1) { // Text nodes encountered, removeClass will bomb
					xtag.removeClass(event.target, 'x-dragbox-drag-over');
				}
			},
			drop: function(event) {
				event.stopPropagation();

				// There are cases where absolutely no drop is allowed
				if(!dragElement) return;
				// Don't allow 
				var preventDropSelector = this['prevent-drop'];
				if(preventDropSelector && xtag.matchSelector(dragElement, preventDropSelector)) return;

				// If within own box, insert before sibling
				var target = event.target,
					parent = target.parentNode,
					position = this['drop-position'] || 'bottom',
					dropElement = this.getDropElement(),
					children;

				if(this.getDropElement() == dragElement.parentNode) {
					if(!this.sortable) return; // is this correct usage per spec?

					children = xtag.toArray(dropElement.children);

					// Put into position based on to/from logic (i.e. dragged in from left or right)
					position = children.indexOf(dragElement) > children.indexOf(target) ? target : target.nextSibling;
					parent.insertBefore(dragElement, position);
				}
				else {
					// These will only be executed if moved to another box
					if(!position || position == 'bottom' || !dropElement.children.length) {
						dropElement.appendChild(dragElement);
					}
					else if(position == 'top') {
						dropElement.insertBefore(dragElement, dropElement.children[0]);
					}
					else { // relative

					 	// TODO

					}
				}
			},
			dragdrop: function(event){
				// DO NOT USE THIS -- NOT SUPPORTED IN ALL BROWSERS (i.e. chrome)
			},
			dragend: function(event){
				event.stopPropagation();
				xtag.removeClass(event.target, 'x-dragbox-drag-over');
				xtag.removeClass(event.target, 'x-dragbox-drag-origin');
			}
		}
	});
})();