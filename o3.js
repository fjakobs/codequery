require("./declare");

var cq = require("./codequery");
var pu = require('./parseutil');
var fs = require('fs');
//var files = pu.loadFiles("../o3", /\.h$/, /deps|\_glue/, "c");
var files = pu.loadFiles("../o3", /\.h$/, /deps|\_glue/, "c");

var util = require('util');
files.forEach(function(f){
    console.log(f.name);
    f.root.find("o3_glue_gen").parent().prevScan(/class|struct/).next().each(function(n){
        
        console.log(n.nv);
        var scope = n.scan("{}").first().child();
        var baseClass = scope.scan("o3_begin_class(<$>)").child();
        var ifaces = scope.scan("o3_add_iface(<$>)").child();
        
        scope.scan(/o3_fun|o3_set|o3_get|o3_prop/).each(function(n){
            n.query().prev().prev().prev().filter('o3_ext').filled(function(){
                console.log( "Function is member of: "+this.next().child() );
            });
            var s = n.scan("</[a-zA-Z\_]+.*/><$>(<$>)", ";");
            if(s.empty()){ // o3_set o3_prop or o3_get on immediate
               s = n.query().scanOne(/\;/);
               var propname = s.prev().val(),
                   type = s.prev().prev().serializePrevUntil(2, n.nv); 
               console.log(n.nv+" ## "+type+" ## "+propname);
               return;
            }
            var returnType = s.eq(0).prev().serializePrevUntil(2, n.nv);
            var fname = s.eq(0).val();
            console.log(n.nv+" ## "+returnType+" ## "+fname);
            // split arguments
            s.eq(1).child().split(",",2).forEach(function(i){ 
                cq.parse(i).query().scan('=').empty(function(){
                    this.end().lastSibling().prev().prev().serializePrevUntil(2, false); // type
                }).filled(function(){
                    this.prev().prev().serializePrevUntil(2,false); // type
                    this.next().serialize(2); // default value
                });
            })
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
             });
        });
    });
});

