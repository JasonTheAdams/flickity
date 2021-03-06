( function( window, factory ) {
  'use strict';
  // universal module definition

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'classie/classie',
      'eventie/eventie',
      './flickity',
      'fizzy-ui-utils/utils'
    ], function( classie, eventie, Flickity, utils ) {
      return factory( window, classie, eventie, Flickity, utils );
    });
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('desandro-classie'),
      require('eventie'),
      require('./flickity'),
      require('fizzy-ui-utils')
    );
  } else {
    // browser global
    factory(
      window,
      window.classie,
      window.eventie,
      window.Flickity,
      window.fizzyUIUtils
    );
  }

}( window, function factory( window, classie, eventie, Flickity, utils ) {
'use strict';

Flickity.createMethods.push('_createLazyload');

Flickity.prototype._createLazyload = function() {
  this.on( 'cellSelect', this.lazyLoad );
};

Flickity.prototype.lazyLoad = function() {
  if ( !this.options.lazyLoad ) {
    return;
  }
  // get adjacent cells
  var cellElems;
  switch (this.options.cellAlign.toLowerCase()) {
    case 'left':
      cellElems = this.getNextCellElements( this.options.lazyLoadAdjacent );
      break;

    case 'right':
      cellElems = this.getPrevCellElements( this.options.lazyLoadAdjacent );
      break;
      
    default:
      cellElems = this.getAdjacentCellElements( this.options.lazyLoadAdjacent );
  }

  // get lazy images in those cells
  var lazyImages = [];
  for ( var i=0, len = cellElems.length; i < len; i++ ) {
    var cellElem = cellElems[i];
    var lazyCellImages = getCellLazyImages( cellElem );
    lazyImages = lazyImages.concat( lazyCellImages );
  }
  // load lazy images
  for ( i=0, len = lazyImages.length; i < len; i++ ) {
    var img = lazyImages[i];
    new LazyLoader( img, this );
  }
};

function getCellLazyImages( cellElem ) {
  // check if cell element is lazy image
  if ( cellElem.nodeName == 'IMG' &&
    cellElem.getAttribute('data-flickity-lazyload') ) {
    return [ cellElem ];
  }
  // select lazy images in cell
  var imgs = cellElem.querySelectorAll('img[data-flickity-lazyload]');
  return utils.makeArray( imgs );
}

// -------------------------- LazyLoader -------------------------- //

/**
 * class to handle loading images
 */
function LazyLoader( img, flickity ) {
  this.img = img;
  this.flickity = flickity;
  this.load();
}

LazyLoader.prototype.handleEvent = utils.handleEvent;

LazyLoader.prototype.load = function() {
  eventie.bind( this.img, 'load', this );
  eventie.bind( this.img, 'error', this );
  // load image
  this.img.src = this.img.getAttribute('data-flickity-lazyload');
  // remove attr
  this.img.removeAttribute('data-flickity-lazyload');
};

LazyLoader.prototype.onload = function() {
  this.unbindEvents();
  var cell = this.flickity.getParentCell( this.img );
  this.flickity.cellSizeChange( cell && cell.element );
  classie.add( this.img, 'flickity-lazyloaded');
};

LazyLoader.prototype.onerror = function() {
  this.unbindEvents();
  classie.add( this.img, 'flickity-lazyerror');
};

LazyLoader.prototype.unbindEvents = function() {
  eventie.unbind( this.img, 'load', this );
  eventie.unbind( this.img, 'error', this );
};

// -----  ----- //

Flickity.LazyLoader = LazyLoader;

return Flickity;

}));
