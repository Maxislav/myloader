'use strict'

function evalInContext(text) {
    return eval(text);        //# .logs `{ a: 1, b: 2, c: 3 }` inside example()
}
const modUrl ={}
const mod = {};
const modh = {}
const modu = {}

const getModueName = (()=>{
	let i = 0
	return () => {
		return 'm' +  i++
	}
})()

const loadModule = (url) => {
	
	if(modUrl[url]) {
		return modUrl[url]
	}
	const moduleName = getModueName()
	modu[url] = moduleName
	
	return modUrl[url] = new Promise( (resolve, reject) =>{
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url , true);
		xhr.send();
		xhr.onreadystatechange = function() { // (3)
		  if (xhr.readyState != 4) return;

		  if (xhr.status != 200) {
		    console.error(xhr.status + ': ' + xhr.statusText);
		  } else {
		    mod[moduleName] = {
		    	k: 0,
		    	url: url,
		    	reqMatch: xhr.responseText.match(/require\(.+\)/g),
		    	text:  '(({module, require}) => {\n'+xhr.responseText+ '\n'+`//@ sourceURL=${url}` +  '\n return module})(this)' ,
		    	buildMod: function(){
		    		if(this.exports) return this.exports;
		    		return this.exports = evalInContext.call({
		    			module: {},
						require: function(url){

							return mod[modu[url]].buildMod()
						}
		    		}, this.text).exports
		    	}
		    }
		    resolve(mod[moduleName])
		  }
		}
	})
}

const list = ['./app/init.js' , './app/init.js', './app/start.js']
Promise.all(list.map(url=>{
	return loadModule(url)
}))
.then(()=>{
	function go(){
			const ll = Object
			.keys(mod)
			.sort()
			.forEach(key =>{
				mod[key].buildMod()
				
			})
		}
		
		go()
		
})