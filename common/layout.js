console.log('loading layout.js from common');

var spacing=30;
var nCol = 5;
var nRow = 4;
var col  = (k)=> k%nCol; 
var row  = (k)=> Math.floor(k/nCol);
var x    = (k)=> (spacing/2)+spacing*col(k);  // cell position is based on k
var y    = (k)=> (spacing/2)+spacing*row(k);
var foobar='foobar';
console.log('layout.js loaded zzzzzz',foobar)

if(typeof module!='undefined'){ 
  module.exports.nCol    = nCol;
  module.exports.nRow    = nRow;
  module.exports.col     = col;
  module.exports.row     = row;
  module.exports.x       = x;
  module.exports.y       = y;
  module.exports.foobar  = foobar;
} 
