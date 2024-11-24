define(['exports', './_curry2-6839fe47', './_isObject-3d38b8ba', './_curry1-18233096'], (function(e,r,t,n){"use strict";function a(e){for(var r,t=[];!(r=e.next()).done;)t.push(r.value);return t}function u(e,r,t){for(var n=0,a=t.length;n<a;){if(e(r,t[n]))return!0;n+=1}return!1}var c="function"==typeof Object.is?Object.is:function(e,r){return e===r?0!==e||1/e==1/r:e!=e&&r!=r},s=Object.prototype.toString,o=function(){return"[object Arguments]"===s.call(arguments)?function(e){return"[object Arguments]"===s.call(e)}:function(e){return t._has("callee",e)}}(),i=!{toString:null}.propertyIsEnumerable("toString"),f=["constructor","valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"],l=function(){return arguments.propertyIsEnumerable("length")}(),y=function(e,r){for(var t=0;t<e.length;){if(e[t]===r)return!0;t+=1}return!1},g="function"!=typeof Object.keys||l?n._curry1((function(e){if(Object(e)!==e)return[];var r,n,a=[],u=l&&o(e);for(r in e)!t._has(r,e)||u&&"length"===r||(a[a.length]=r);if(i)for(n=f.length-1;n>=0;)r=f[n],t._has(r,e)&&!y(a,r)&&(a[a.length]=r),n-=1;return a})):n._curry1((function(e){return Object(e)!==e?[]:Object.keys(e)})),p=n._curry1((function(e){return null===e?"Null":void 0===e?"Undefined":Object.prototype.toString.call(e).slice(8,-1)}));function b(e,r,t,n){var c=a(e);function s(e,r){return v(e,r,t.slice(),n.slice())}return!u((function(e,r){return!u(s,r,e)}),a(r),c)}function v(e,r,n,a){if(c(e,r))return!0;var u,s,o=p(e);if(o!==p(r))return!1;if("function"==typeof e["fantasy-land/equals"]||"function"==typeof r["fantasy-land/equals"])return"function"==typeof e["fantasy-land/equals"]&&e["fantasy-land/equals"](r)&&"function"==typeof r["fantasy-land/equals"]&&r["fantasy-land/equals"](e);if("function"==typeof e.equals||"function"==typeof r.equals)return"function"==typeof e.equals&&e.equals(r)&&"function"==typeof r.equals&&r.equals(e);switch(o){case"Arguments":case"Array":case"Object":if("function"==typeof e.constructor&&"Promise"===(u=e.constructor,null==(s=String(u).match(/^function (\w*)/))?"":s[1]))return e===r;break;case"Boolean":case"Number":case"String":if(typeof e!=typeof r||!c(e.valueOf(),r.valueOf()))return!1;break;case"Date":if(!c(e.valueOf(),r.valueOf()))return!1;break;case"Error":return e.name===r.name&&e.message===r.message;case"RegExp":if(e.source!==r.source||e.global!==r.global||e.ignoreCase!==r.ignoreCase||e.multiline!==r.multiline||e.sticky!==r.sticky||e.unicode!==r.unicode)return!1}for(var i=n.length-1;i>=0;){if(n[i]===e)return a[i]===r;i-=1}switch(o){case"Map":return e.size===r.size&&b(e.entries(),r.entries(),n.concat([e]),a.concat([r]));case"Set":return e.size===r.size&&b(e.values(),r.values(),n.concat([e]),a.concat([r]));case"Arguments":case"Array":case"Object":case"Boolean":case"Number":case"String":case"Date":case"Error":case"RegExp":case"Int8Array":case"Uint8Array":case"Uint8ClampedArray":case"Int16Array":case"Uint16Array":case"Int32Array":case"Uint32Array":case"Float32Array":case"Float64Array":case"ArrayBuffer":break;default:return!1}var f=g(e);if(f.length!==g(r).length)return!1;var l=n.concat([e]),y=a.concat([r]);for(i=f.length-1;i>=0;){var h=f[i];if(!t._has(h,r)||!v(r[h],e[h],l,y))return!1;i-=1}return!0}var h=r._curry2((function(e,r){return v(e,r,[],[])}));e._isArguments=o,e.equals=h,e.keys=g}));
//# sourceMappingURL=equals-32544366.js.map
