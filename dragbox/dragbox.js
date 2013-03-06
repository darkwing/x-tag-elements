/* 

Specs
============================
https://etherpad.mozilla.org/dragbox-specs

*/

(function() {
	function setItemSortable(element) {
		xtag.toArray(element.children).forEach(function(item){
			item.setAttribute('draggable', element.getAttribute('sortable'));
		});
	}

	var dragElement;
	xtag.register('x-dragbox', {
		lifecycle: { // NEW
		  created: function(){
			var self = this;
			
			setItemSortable(this);
			xtag.addObserver(this, 'inserted', function(element){
				if (element.parentNode == self) {
					setItemSortable(self);
				}
			});
		  },
		  inserted: function(){},
		  removed: function(){},
		  attributeChanged: function(name, value){
		  	if(name == 'sortable') setItemSortable(this);
		  }
		},
		prototype: { // You can pass prototypes and we will create a new obj for you 
		},
		accessors: { // New way of declaring getters/setters
			sortable: {
				get: function() {
					console.log('sortable getter');
					return typeof this.getAttribute('sortable') != 'undefined';
				},
				set: function(state) {
					var bool = !!state;
					bool ? this.setAttribute('sortable', null) : this.removeAttribute('sortable');
				}
			},
			'drop-position': {

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
				xtag.removeClass(event.target, 'x-dragbox-drag-over');
			},
			drop: function(event) {
				if(!dragElement) return;
				event.stopPropagation();

				// If within own box, insert before sibling
				var parent = event.target.parentNode,
					children;

				if(parent == dragElement.parentNode) {
					if(!this.getAttribute('drop-position')) return; // is this correct usage per spec?

					children = xtag.toArray(this.children);
					// Put into position based on to/from logic
					if(children.indexOf(dragElement) > children.indexOf(event.target)) {
						parent.insertBefore(dragElement, event.target);
					}
					else {
						parent.insertBefore(dragElement, event.target.nextSibling);
					}
				}
				else {
					// These will only be executed if moved to another box
					var position = this.getAttribute('drop-position');
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
			dragdrop: function(event){ // DO NOT USE THIS -- NOT SUPPORTED IN ALL BROWSERS (i.e. chrome)
				
			},
			dragend: function(event){/**/
				event.stopPropagation();

				xtag.removeClass(event.target, 'x-dragbox-drag-over');
				xtag.removeClass(event.target, 'x-dragbox-drag-origin');
				
			}
		}
	});
})();