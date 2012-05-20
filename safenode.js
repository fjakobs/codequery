var m = require('module').Module.prototype;
var compile = m._compile;

var cq = require ("./codequery.js");

var file_blacklist = [
    /async\.js$/i,
    /uglify/,
    /util\.js$/i,
    /glob\.js$/i,
    /\/q\.js$/i
];

var async_inline_blacklist =  [
    "if","while","for",/\.on$/, //,/map$/,/each$/, /sort$/, /forEach$/, /filter$/,/\_\_define(S|G)etter\_\_/,/router/,
     /when$/,/then$/,/call$/,/fail$/,
//    /\.token$/,/\.replace$/,//
];

function match(arr, str){
    if(typeof str != "string") return false;
    for(var i = 0;i<arr.length;i++){
        var a = arr[i];
        if(typeof a == 'string'){
            if(a == str) return true;   
        } else
            if(str.match(a)) return true;
    };
    return false
}

m._compile = function(content, filename){
    
    if(match(file_blacklist, filename))
        return compile.call(this,content,filename);
    
    try{
    //var file = filename.replace("/Users/arc","");
    var f = {}, opts = {keywords:cq.jskeywords};
    f.data = content;    
    f.root = cq.parse(f.data, opts);
    f.name = filename;
	f.check = f.root.toString();
    var output = content;
    if(f.root.err || f.data != f.check){
        console.log("Parse error in "+f.name);	
    } else {
        // lets find all inline funtions inside a functioncall
        f.root.find("<fn>(<arg>)").each(function(i,m){
            var func = m.fn.node();
            // only accept nodes where fn is an identifier
            if(func && func.nt == cq.type.identifier && !match(async_inline_blacklist, func.nv)){
                m.arg.child().scan("function(<arg>){}").each(function(i, m){
                   // only accept functions that are last arg AND have a first arg called 'err'
                   if( m.arg.child().node().nv == "err" && i.ns.ns.ns.ns.nv == '}' &&
                      i.ns.ns.ns.ns.ns.nt == 0){
                        // lets patch it!
                        
                    }
                });
            }
        });
        output = f.check;
    }
    }catch(e){
        console.log(e.stack);   
    }
        
    compile.call(this, output, filename);
}


