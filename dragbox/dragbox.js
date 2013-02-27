/* 

Specs
============================
https://etherpad.mozilla.org/dragbox-specs

FYI
============================
If we could merge dragdrop and dragend together, we'd have the three pieces we need
to really make this work without a local var

*/

(function() {
	function setItemSortable(element) {
		xtag.toArray(element.children).forEach(function(item){
			item.setAttribute('draggable', element.getAttribute('sortable'));
		});
	}

	function dumpEvent(event, that) {
		console.log(' ');
		console.log('--------------------------');
		console.log(' ');
		console.log('dragbox: ', that, that.outerHTML);
		console.log(event.type, event);
		['target', 'relatedTarget', 'rangeParent', 'originalTarget', 'explicitOriginalTarget', 'currentTarget', 'toElement', 'fromElement', 'srcElement'].forEach(function(i) {
			console.log('event["' + i + '"]', event[i] ? event[i].outerHTML : null, event[i]);
		});
		console.log('elementFromPoint: ', document.elementFromPoint(event.pageX, event.pageY), event.pageX, event.pageY);
	}
	
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
					return typeof this.getAttribute(sortable) != 'undefined';
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
					xtag.addClass(event.target, 'x-dragbox-drag-origin');
					event.dataTransfer.effectAllowed = 'move';
					event.dataTransfer.dropEffect = 'move';
					event.dataTransfer.setData('text/html', this.innerHTML);
				}
			},
			dragenter: function(event){
				//dumpEvent(event);

				var parent = event.target.parentNode;
				if (parent.tagName.match(/x-dragbox/i)){
					xtag.addClass(event.target, 'x-dragbox-drag-over');
				}
			},
			dragover: function(event){
				if (event.preventDefault) event.preventDefault();
				event.dataTransfer.dropEffect = 'move'; 
				return false;
			},
			dragleave: function(event){
				xtag.removeClass(event.target, 'x-dragbox-drag-over');
			},
			drop: function(event) {
				dumpEvent(event, this);
				window.dropEvent = event;
			},
			dragdrop: function(event){ // DO NOT USE THIS -- NOT SUPPORTED IN ALL BROWSERS (i.e. chrome)
				
			},
			dragend: function(event){/*
				event.stopPropagation();

				dumpEvent(event, this);
				*/
				window.dragEvent = event;

				xtag.removeClass(event.target, 'x-dragbox-drag-over');
				xtag.removeClass(event.target, 'x-dragbox-drag-origin');
				
			}
		}
	});
})();