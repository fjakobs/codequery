require("./declare");

var cq = require("./codequery");
var pu = require('./parseutil');
var fs = require('fs');
//var files = pu.loadFiles("../o3", /\.h$/, /deps|\_glue/, "c");
var files = pu.loadFiles("../o3", /cGLWindow\.h$/, /deps|\_glue/, "c");
var OutputData = []
var util = require('util');

function Parameter(type, name, defaultvalue)
{
	return {type:type, name: name, defaultvalue: defaultvalue};
}

function Def(o3def, exttype, returntype, name, parameters)
{
	return {o3def: o3def, exttype: exttype, returntype: returntype, name: name, parameters: parameters};
}

function Enum(name, value)
{
	return {name: name, value: value};
};

files.forEach(function(f){
    console.log(f.name);
	var Results = [];
	var Classes = [];
	var Enums = [];
	var Functions = [];
	
    f.root.find("o3_glue_gen").parent().prevScan(/class|struct/).next().each(function(n){
        
        console.log(n.nv);
		var classname = n.nv;
        var scope = n.scan("{}").first().child();
        var baseClass = scope.scan("o3_begin_class(<$>)").child().eq(0).val();
        var ifaces = scope.scan("o3_add_iface(<$>)").child();
		var ext = "";
        scope.scan(/o3_fun|o3_set|o3_get|o3_prop/).each(function(n){
            n.query().prev().prev().prev().filter('o3_ext').filled(function(){
                console.log( "Function is member of: "+this.next().child() );
				ext = this.next().child().val();
            });
            var s = n.scan("</[a-zA-Z\_]+.*/><$>(<$>)", ";");
            if(s.empty()){ // o3_set o3_prop or o3_get on immediate
               s = n.query().scanOne(/\;/);
               var propname = s.prev().val(),
                   type = s.prev().prev().serializePrevUntil(2, n.nv); 
               console.log(n.nv+" ## "+type+" ## "+propname);
			   Functions.push(Def(n.nv, ext, type, propname));
               return;
            }
            var returnType = s.eq(0).prev().serializePrevUntil(2, n.nv);
            var fname = s.eq(0).val();
            console.log(n.nv+" ## "+returnType+" ## "+fname);
		  
			var Params = [];
            // split arguments
            s.eq(1).child().split(",",2).forEach(function(i){ 
                cq.parse(i).query().scan('=').empty(function(){
                    var type = this.end().lastSibling().prev().prev().serializePrevUntil(2, false); // type
					var name = this.end().lastSibling().prev().eq(0).val();
					Params.push(Parameter(type, name));
                }).filled(function(){
                    var type = this.prev().prev().serializePrevUntil(2,false); // type
                    var defval = this.next().serialize(2); // default value
                    var name = this.end().lastSibling().prev().eq(0).val();
					Params.push(Parameter(type, name, defval));
                });
            })
			Functions.push(Def(n.nv, ext, returnType, fname, Params));
        });
        var def = 0;
        scope.scan("o3_enum(<$>)").child().each(function(n){
             n.split(",",2).slice(1).forEach(function(i){
                 var name, value = def++;
                 cq.parse(i).query().scan('=').empty(function(){
                     name = this.end().serialize(2) // name
                 }).filled(function(){
                     name = this.prev().serializePrevUntil(2,false); // name
                     value = this.next().serialize(2); // value
                 });
                 console.log(name +" ::: "+value);
				 Enums.push(Enum(name, value));
             });
        });
		var Class = [];
		if (Functions.length)
		{
			Class.push({functions: Functions});
		}
		if (Enums.length)
		{
			Class.push({enums: Enums});
		}
		if (Class.length)
		{
			Classes.push({classname: classname, items:Class});
		}
    });
	if (Classes.length)
	{
		
//		dump(Results);
		OutputData.push([f.name, Classes]);
	};
});

function dump(arr,level) 
{
	if(!level) level = 0;
	if (level>10) return;
	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += " ";

	if(typeof(arr) == 'object') 
	{ //Array/Hashes/Objects
		for(var item in arr) 
		{
			var value = arr[item];
 
			if(typeof(value) == 'object') 
			{ //If it is an array,
				console.log(level_padding + "" + item + "");
				dump(value,level+1);
			} 
			else 
			{
				console.log(level_padding + "" + item + " => " + value + "");
			}
		}
	} 
	else 
	{ //Stings/Chars/Numbers etc.
		console.log("===>"+arr+"<===("+typeof(arr)+")");
	}	
} 

dump(OutputData);
