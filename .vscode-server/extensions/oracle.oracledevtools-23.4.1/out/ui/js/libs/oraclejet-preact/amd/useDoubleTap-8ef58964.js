define(['exports', 'preact/hooks'], (function(e,n){"use strict";e.useDoubleTap=function({isSingleTapImmediate:e=!0,onDoubleTap:u,onSingleTap:t,threshold:r=400}){const l=n.useRef(null);return{onClick:n.useCallback((n=>{l.current?(clearTimeout(l.current),l.current=null,u?.(n)):(e&&t?.(n),l.current=setTimeout((()=>{!e&&t?.(n),l.current=null}),r))}),[e,u,t,r])}}}));
//# sourceMappingURL=useDoubleTap-8ef58964.js.map
