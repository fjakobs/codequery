var parser = require("./treec");
var pu = require('./parseutil');

var n = Date.now();
var files = pu.loadFiles("./apf", /\.js$/, /\_old/);

console.log(Date.now() - n);

// lets go and find our declare shit
for(var i = 10;i<files.length;i++){
    var f = files[i];
    var n = f.root.scan("define([$a], function($b){$c})");
	if(n.nt){
	    var v = n.found;
	    var deps = v.a.split(",", {ws:0}),
	        args = v.b.split(",", {ws:0});
	    n.replace("module.declare",1);
        v.a.pn.remove(3);
        v.b.replace("require, exports, module");
        n.ns.fc.scan("function").replacews("");
        v.c.scan("return").replace("module.exports = ",1);
        
        for(var i = 0; i < args.length; i++)
            v.c.before( (i==0?"\n":"") + "    var " + args[i] + " = require(" + deps[i] + ");\n");
        console.log(f.root.toString());
        return;
	}
	    
	        
	
    
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
}

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

	



