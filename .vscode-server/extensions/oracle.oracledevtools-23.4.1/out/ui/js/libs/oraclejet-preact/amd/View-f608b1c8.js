define(['exports', 'preact/jsx-runtime', 'preact/compat', './borders-ae734f24', './dimensions-f9da1099', './flexitem-554e6fbe', './colors-237e9028', './padding-c0ea25bf', './aria-609f1af8', './theme-7fdf24b2', './mergeInterpolations-2c5b5a03', './TopLayerHost-1134809b', './EnvironmentProvider-fea74278', './Common/themes/themeContract.css', './vanilla-extract-dynamic.esm-f66d9a78', './_curry1-18233096', './equals-32544366', './_isArray-a4219cba', './_isObject-3d38b8ba', './_isString-5e4bea9c'], (function(e,r,t,o,n,a,c,l,i,s,u,b,y,d,m,f,p,j,g,v){"use strict";var A=f._curry1((function(e){return null!=e&&"function"==typeof e["fantasy-land/empty"]?e["fantasy-land/empty"]():null!=e&&null!=e.constructor&&"function"==typeof e.constructor["fantasy-land/empty"]?e.constructor["fantasy-land/empty"]():null!=e&&"function"==typeof e.empty?e.empty():null!=e&&null!=e.constructor&&"function"==typeof e.constructor.empty?e.constructor.empty():j._isArray(e)?[]:v._isString(e)?"":g._isObject(e)?{}:p._isArguments(e)?function(){return arguments}():(r=e,"[object Uint8ClampedArray]"===(t=Object.prototype.toString.call(r))||"[object Int8Array]"===t||"[object Uint8Array]"===t||"[object Int16Array]"===t||"[object Uint16Array]"===t||"[object Int32Array]"===t||"[object Uint32Array]"===t||"[object Float32Array]"===t||"[object Float64Array]"===t||"[object BigInt64Array]"===t||"[object BigUint64Array]"===t?e.constructor.from(""):void 0);var r,t})),I=f._curry1((function(e){return null!=e&&p.equals(e,A(e))}));const h=[...Object.values(o.borderInterpolations),...Object.values(n.dimensionInterpolations),...Object.values(a.flexitemInterpolations),...Object.values(c.colorInterpolations),...Object.values(l.paddingInterpolations),...Object.values(i.ariaInterpolations),...Object.values(s.themeInterpolations)],x=u.mergeInterpolations(h),O=t.forwardRef((({as:e,children:t,colorScheme:o,scale:n,color:a,backgroundColor:c,...l},i)=>{const{class:s,ariaLabelledBy:u,ariaLabel:b,...f}=x({colorScheme:o,scale:n,backgroundColor:c,color:a,...l}),p={...o&&{colorScheme:o},...n&&{scale:n},...c&&{currentBgColor:c}},j={"aria-label":b,"aria-labelledby":u,children:t,className:s,ref:i,style:{...f,...c&&m.assignInlineVars({[d.globalVars.currentBackgroundColor]:f.backgroundColor}),boxSizing:"border-box"}},g=e||"div";return I(p)?r.jsx(g,{...j}):r.jsx(y.EnvironmentProvider,{environment:p,children:r.jsx(g,{...j})})}));e.View=O,e.elementTypes=["div","main","article","section","aside"]}));
//# sourceMappingURL=View-f608b1c8.js.map