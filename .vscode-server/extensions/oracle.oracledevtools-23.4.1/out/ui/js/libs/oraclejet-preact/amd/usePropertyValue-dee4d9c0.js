define(['exports', 'preact/hooks', './_curry1-18233096', './curryN-a3cf891a'], (function(r,e,t,u){"use strict";var c=t._curry1((function(r){return u.curryN(r.length,r)}));const n=c(((r,e)=>getComputedStyle(r).getPropertyValue(e)));r.curry=c,r.usePropertyValue=()=>{const r=r=>"",[t,u]=e.useState((()=>r=>""));return[e.useCallback((e=>{u(null!==e?()=>n(e):()=>r)}),[]),t]}}));
//# sourceMappingURL=usePropertyValue-dee4d9c0.js.map
