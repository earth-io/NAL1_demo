var randumb=((__,seed=1)=>  // gives the same series of 'random' numbers every time
  (__,x=Math.sin(seed++)*10000)=> x - Math.floor(x)
)();
//var Math_random=Math.random(); // truly random
var Math_random=randumb;  // same random set of nubers every time
exports.random= (arr)=> arr[Math.floor(arr.length*Math_random())]; // get a random item from an array 
exports.append=($p,$c)=>{ $p.append($c); return $c; };
exports.add=(o,k,v)=> o[k]==undefined ? o[k]=[v]  : o[k].push(v);
exports.range=(n)=> [...Array(n).keys()];


//randumb, Math_random, random, append, add, range
module.exports.Math_random = Math_random;  

