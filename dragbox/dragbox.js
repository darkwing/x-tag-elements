/* 

Specs
============================
https://etherpad.mozilla.org/dragbox-specs

To Do:
============================
-  Verify that CSS classes are added / removed to the correct
-  Do something with "setItemSortable" -- that's not right
-  Should we make children draggable=true by default, or should users need to do that manually?

*/

(function() {
	var dragElement;

	function boolSet(attr) {
		return function(state) {
			!!state ? this.setAttribute(attr, null) : this.removeAttribute(attr);
		}
	}

	function boolGet(attr) {
		return function() {
			return typeof this.getAttribute(attr) != 'undefined';
		}
	}

	xtag.register('x-dragbox', {
		lifecycle: {
		  created: function(){},
		  inserted: function(){},
		  removed: function(){},
		  attributeChanged: function(name, value){}
		},
		prototype: {},
		accessors: {
			sortable: {
				get: boolGet('sortable'),
				set: boolSet('sortable')
			}
		},
		methods: {  // SAME
		},
		events: { /* Check these vs. the old pattern! */
			dragstart: function(event){
				if (event.target.parentNode == this){
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
				//console.log('dragover!');
				if (event.preventDefault) event.preventDefault();
				event.dataTransfer.dropEffect = 'move'; 
				return false;
			},
			dragleave: function(event){
				if(event.target.nodeType == 1) { // Text nodes encountered, removeClass will bomb
					xtag.removeClass(event.target, 'x-dragbox-drag-over');
				}
			},
			drop: function(event) {
				if(!dragElement) return;
				event.stopPropagation();

				// If within own box, insert before sibling
				var target = event.target,
					parent = target.parentNode,
					position = this.getAttribute('drop-position') || 'bottom',
					children;

				if(parent == dragElement.parentNode) {
					if(!this.getAttribute('sortable')) return; // is this correct usage per spec?

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