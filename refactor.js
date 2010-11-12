var cq = require("./codequery");
var pu = require('./parseutil');

var files = pu.loadFiles("./apf", /\.js$/, /\_old/, "js");
var fns = {};
/*
f.root.find("($a){}").prev().filter(/^\w+$/).not(/if|when|for|while/).each(function(n){
    fns[n.nv] = 1;
});
*/
//console.log( files[384].root.dump() );

files.forEach(function(f){
    f.root.scan("define([<dep>], function<fn>(<arg>){<code>})").each(function(i,v,m){
        
	   var deps = m.dep.child().split(",", {ws:0}),
	       args = m.arg.child().split(",", {ws:0});
	   this.replace("module.declare", 1);

	   m.dep.remove(3);
	   m.arg.replace("(require, exports, module)",2);
	   m.fn.ws("");
	   m.code.child().scan("return").nextFilter(/\{|\(|[\w$_]+/).replace("module.exports =", 1).empty(function(){
	      console.log("NO EXPORT"+f.name+":1")
	   });
	   
	   for(var i = 0; i < args.length; i++)
	       m.code.before( (i==0?"\n":"") + "    var " + args[i] + " = require(" + deps[i] + ");\n");
       
       /*
            module.exports = {
                a:b
            }
            
            (function(){
                this.bla = bla;
            }).call(someClass.prototype)
            module.exports = someClass;
            
            var x = {
                a:b
            }
            module.exports = x;
       */
       //if(f.name.match(/cache/)){
         //  console.log(f.root.toString());
           // the exports:
           f.root.scan('module.declare(function(){<$>})').child()
                 .scan('module.exports = </.*/><$>').empty(function(){console.log(f.name)});//.log();
      // }
       
	}).empty(function(){
	   console.log("FAIL ON: "+f.name);
	});
});
	// if we are finding stuff with markers, how do we get to the markers?
	// alright now i want to do some useful querying
	// operations we'd wanna do...
	// replace a range with new code?
	// n[2].replace("require, exports, module");
	// js.replace("define", fn[0]);
	// lets add new things
	// js.add("var "+args[0]+" = "+deps[0]+";\n", code);
	// console.log(js.serialize(args));
	//  }
//}

console.log("END");

return;
//
//for(k in classes){
//    console.log( "Class"+k);
//	var t = classes[k].apf;
//	for(var i = 0;i<t.length;i++)
//		console.log(t[i].v);
//}
//return;
// lets scan for all apf.bla functions
var functions = {};

//var ns, apf = {};
//
//for(k in dict){    
//    ns = apf;
//    if(k.match(/^apf/)) {
//        var chunks = k.split(".");        
//        for (var i=1; i<chunks.length; i++) {
//            var chunk = chunks[i];
//            ns = ns[chunk] || (ns[chunk] = {});
//        }
//    }
//}
//require("fs").writeFileSync("apf-deps.json", JSON.stringify(apf, 4));

var apfdeps = require("./apf-deps.json");

for (var key in apfdeps) {
    var chunks = key.split(" ");

    if (chunks.length != 2)
        continue;

    var cls = classes[chunks[1]];
    if (!cls) {
        console.log("cound not find " + key);
        continue;
    }
    
    for (var method in apfdeps[key]) {
        if (!cls.methods[method] && !cls.props[method]) {
            var id = "apf." + chunks[0] + "." + method;
            console.log("cannot find function " + id);
            printIndentifier(id);
        } else {
            //console.log("FOUND function " + method);
        }
    }
}

function printIndentifier(name) {
    var t = dict[name];
    if (!t) return;
    
    for (var i=0; i<t.length; i++) {
        var file = js.findRoot(t[i]).file;
        console.log(file.name + ":" + (t[i].l+1));
    }
};


for (var name in functions) {
    //console.log(name);
}
console.log(Object.keys(functions).length);

// apf.bla = function when no new
// search function name in type == 'object'
// replace apf. with name of object .. make sure there is no variable name of that object

// apf.bla = class
// new keyword in front of it
// when not in classes, fix

// check if namespace is a module itself OR
// repeat process of A and B in namespace 
// apf.bla = namespace
//        . = function / class

// apf.bla = constant
//function : () .call .apply

//for(k in dict){
//    if(k.match(/^apf/)){
//	   console.log(k);
//}

	



