if(typeof require!='undefined'){
  var   { range }                                            = require('./utility.js');
  var   { Model }                                            = require('./Model.js');
}

var model=Model(); 
model.configure( 5,4); 

range(31).map(()=> model.doRandomOp());

if(typeof module!='undefined'){ 
  module.exports.model = model; 
} 