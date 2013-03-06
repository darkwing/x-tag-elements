/* 

Specs
============================
https://etherpad.mozilla.org/dragbox-specs

To Do:
============================
-  Verify that CSS classes are added / removed to the correct
-  Do something with "setItemSortable" -- that's not right
-  Should we make children draggable=true by default, or should users need to do that manually?

Thoughts:
============================
-  "prevent-drop" and "prevent-drag" seem defaults harsh

*/

(function() {
	var dragElement;

	xtag.register('x-dragbox', {
		lifecycle: {
		  created: function(){
		  	var self = this;
		  	this.makeSortable(this.children);
		  	xtag.addObserver(this, 'inserted', function(element){
				if (element.parentNode == self) self.makeSortable([element]);
			});
		  },
		  inserted: function(){},
		  removed: function(){},
		  attributeChanged: function(name, value){}
		},
		prototype: {},
		accessors: {
			sortable: { // "true" or "false"
				get: function() {
					!!this.getAttribute('sortable');
				},
				set: function(state) {
					!!state ? this.setAttribute('sortable', null) : this.removeAttribute('sortable');
				}
			},
			'prevent-drop': { // CSS selector
				get: function() {
					return this.getAttribute('prevent-drop') || '*';
				}
			},
			'prevent-drag': { // CSS selector
				get: function() {
					return this.getAttribute('prevent-drag') || '*';
				}
			}
		},
		methods: {  // SAME
			makeSortable:  function(elements) {
				xtag.toArray(elements).forEach(function(el) {
					el.setAttribute("draggable", "true");
				});
			}
		},
		events: { /* Check these vs. the old pattern! */
			dragstart: function(event){
				if (event.target.parentNode == this && !xtag.matchSelector(event.target, this['prevent-drag'])){
					dragElement = event.target;
					xtag.addClass(event.target, 'x-dragbox-drag-origin');
					event.dataTransfer.effectAllowed = 'move';
					event.dataTransfer.dropEffect = 'move';
					event.dataTransfer.setData('text/html', this.innerHTML);
				}
			},
			dragenter: function(event){
				this.dragElement = event
				if (event.target.parentNode.tagName.match(/x-dragbox/i)){
					xtag.addClass(event.target, 'x-dragbox-drag-over');
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
				if(!dragElement || this['prevent-drop'] == '*') return;

				// If within own box, insert before sibling
				var target = event.target,
					parent = target.parentNode,
					position = this['drop-position'] || 'bottom',
					children;

				if(parent == dragElement.parentNode) {
					if(!this['sortable']) return; // is this correct usage per spec?

					children = xtag.toArray(this.children);

					// Put into position based on to/from logic (i.e. dragged in from left or right)
					position = children.indexOf(dragElement) > children.indexOf(target) ? target : target.nextSibling;
					parent.insertBefore(dragElement, position);
				}
				else {
					// These will only be executed if moved to another box
					if(!position || position == 'bottom' || !this.children.length) {
						this.appendChild(dragElement);
					}
					else if(position == 'top') {
						this.insertBefore(dragElement, this.children[0]);
					}
					else { // relative
						
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