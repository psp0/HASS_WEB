define(['exports', 'preact/hooks', './keys-459a726d', './collectionUtils-6a04588d'], (function(e,t,a,l){"use strict";e.useTabbableModeSet=function(e,n,r,c,s,u){const[o,i]=t.useState(),k=t.useCallback(((e,t)=>u?u(e,t):e===t),[u]),d=t.useCallback(((t,a=!1)=>{i(void 0),l.getElementContainsFunc(e.current,!0)(t)&&a&&e.current?.focus()}),[e,i]),g=t.useCallback((e=>{i(e),c&&!k(e,r)&&c({value:e})}),[r,k,c,i]),b=t.useCallback((e=>k(e,o)),[o,k]),C=t.useCallback((()=>o),[o]),f={onFocus:t=>{if(t.target===e.current)b(void 0)||d(t.target);else{const e=n(t.target);a.isKeyDefined(e)&&!b(e)&&g(e)}},onBlur:t=>{t.relatedTarget&&l.getElementContainsFunc(e.current,!0)(t.relatedTarget)||d(t.relatedTarget)},onKeyDown:t.useCallback((e=>{null==r||null!=s&&!s(r)||("F2"===e.key?b(r)?d(e.target,!0):g(r):"Esc"!==e.key&&"Escape"!==e.key||d(e.target,!0))}),[r,d,g,s,b])};return[b,f,C,i]}}));
//# sourceMappingURL=useTabbableModeSet-a59f4b76.js.map