define(['exports', './classNames-902bc74c', './_curry3-d231d2ab', './_isObject-3d38b8ba'], (function(r,s,c,e){"use strict";var n=c._curry3((function(r,s,c){var n,t={};for(n in c=c||{},s=s||{})e._has(n,s)&&(t[n]=e._has(n,c)?r(n,s[n],c[n]):s[n]);for(n in c)e._has(n,c)&&!e._has(n,t)&&(t[n]=c[n]);return t})),t=c._curry3((function r(s,c,t){return n((function(c,n,t){return e._isObject(n)&&e._isObject(t)?r(s,n,t):s(c,n,t)}),c,t)}));const a=(r,c,e)=>"class"===r?s.classNames([c,e]):e;r.mergeInterpolations=r=>s=>r.reduce(((r,c)=>t(a,r,c(s))),{})}));
//# sourceMappingURL=mergeInterpolations-2c5b5a03.js.map