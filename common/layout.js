/*
if(typeof require!='undefined'){
  // nothing else needed to use this module
}
*/
let spacing=30;
var nCol = 5;  // must be a global
var nRow = 4;  // ibid
// cell position is based on k
var col  = (k)=> k%nCol;              // const does not work when running with nodejs
var row  = (k)=> Math.floor(k/nCol);  // ibid
const x    = (k)=> (spacing/2)+spacing*col(k);  // for some reason x & y can be const's
const y    = (k)=> (spacing/2)+spacing*row(k);  // while col and row cannot be zzzzz WTF

console.log('layout 1 ',nCol,nRow);

if(typeof module!='undefined'){ 
  module.exports.nCol    = nCol;
  module.exports.nRow    = nRow;
  module.exports.col     = col;
  module.exports.row     = row;
  module.exports.x       = x;
  module.exports.y       = y;
} 
