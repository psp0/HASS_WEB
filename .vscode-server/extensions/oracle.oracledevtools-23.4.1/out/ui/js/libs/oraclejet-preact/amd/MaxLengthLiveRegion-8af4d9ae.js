define(['exports', 'preact/jsx-runtime', 'preact', './useDebounce-74e7358c', './useTranslationBundle-a17e0551', './LiveRegion-a66ead79'], (function(e,n,t,i,a,r){"use strict";e.MaxLengthLiveRegion=function({isMaxLengthExceeded:e,maxLength:o,valueLength:s=0}){const c=i.useDebounce(o-s,500),u=a.useTranslationBundle("@oracle/oraclejet-preact"),g=u.formControl_maxLengthExceeded({MAX_LENGTH:`${o}`}),l=u.formControl_maxLengthRemaining({CHARACTER_COUNT:`${c}`});return n.jsxs(t.Fragment,{children:[n.jsx(r.LiveRegion,{children:l}),e&&n.jsx(r.LiveRegion,{type:"assertive",children:g})]})}}));
//# sourceMappingURL=MaxLengthLiveRegion-8af4d9ae.js.map