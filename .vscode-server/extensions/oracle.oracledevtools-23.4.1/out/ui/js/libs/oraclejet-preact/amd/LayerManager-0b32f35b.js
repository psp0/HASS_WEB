define(['exports', 'preact/jsx-runtime', 'preact/compat', './TopLayerHost-1134809b'], (function(e,t,r,s){"use strict";e.LayerManager=function({children:e}){const[o,n]=r.useState(),[a,u]=r.useState(),c=r.useCallback((e=>{null!==e&&n(e)}),[]),l=r.useCallback((e=>{null!==e&&u(e)}),[]);return t.jsx(s.LayerContext.Consumer,{children:r=>{let n={};o&&a&&(n={priority:void 0,getHost:e=>"top"===e?a:o});const u=r.getHost?r:n;return t.jsxs(s.LayerContext.Provider,{value:u,children:[e,!r.getHost&&t.jsx(s.LayerHost,{ref:c}),!r.getHost&&t.jsx(s.TopLayerHost,{ref:l})]})}})}}));
//# sourceMappingURL=LayerManager-0b32f35b.js.map
