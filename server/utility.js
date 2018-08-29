/*
stackoverflow.com/questions/424292/seedable-javascript-random-number-generator
stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
*/
var randumb=((__,seed=1)=>  // gives the same series of 'random' numbers every time
  (__,x=Math.sin(seed++)*10000)=> x - Math.floor(x)
)();
//var Math_random=Math.random(); // truly random
var Math_random=randumb;  // same random set of nubers every time
var random= (arr)=> arr[Math.floor(arr.length*Math_random())]; // get a random item from an array 
var append=($p,$c)=>{ $p.append($c); return $c; };
var add=(o,k,v)=> o[k]==undefined ? o[k]=[v]  : o[k].push(v);
var range=(n)=> [...Array(n).keys()];


if(typeof module!='undefined'){ 
  module.exports.Math_random = Math_random; 
  module.exports.random      = random;
  module.exports.append      = append;
  module.exports.add         = add;
  module.exports.range       = range;
} 