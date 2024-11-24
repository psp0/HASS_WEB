define(['exports', 'preact/jsx-runtime', 'preact/hooks', 'preact/compat', './useFloating-64bd8b22', './refUtils-280eda7e', './useOutsideClick-3ced4958', './useUser-03bad59a', './useComponentTheme-ee621a15', './classNames-902bc74c', './utils-b1f1bfab', './Common/themes/themeContract.css', './UNSAFE_Floating/themes/redwood/FloatingTheme', './UNSAFE_Floating/themes/FloatingStyles.css', './vanilla-extract-dynamic.esm-f66d9a78', './UNSAFE_Floating/themes/FloatingContract.css'], (function(t,e,n,i,s,o,r,a,l,c,u,f,d,m,h,g){"use strict";const x=i.forwardRef((({data:t,anchorRef:i,tail:s,isRtl:r,backgroundColor:a},m)=>{const{styles:h,baseTheme:g}=l.useComponentTheme(d.FloatingRedwoodTheme),x=n.useRef(null),[p,b]=n.useState({arrowStyle:{visibility:"hidden"},arrowInnerStyle:{visibility:"hidden"}});n.useLayoutEffect((()=>{if(null==x.current)return;const{isCornerVerticalPlacement:e,isCornerHorizontalPlacement:n}=function(t,e,n){if("simple"===e&&n&&n.arrow){const{centerOffset:e}=n.arrow,i=7;let s=0,o=0;const r=t.current,a=void 0===r?.x&&void 0===r?.y;a&&(s=Math.round(r.getBoundingClientRect().height),o=Math.round(t.current?.getBoundingClientRect().width));return{isCornerVerticalPlacement:a?Math.abs(e)>=s/2-i/2:["start-top-corner","start-bottom-corner","end-top-corner","end-bottom-corner"].includes(n.origPlacement),isCornerHorizontalPlacement:a?Math.abs(e)>=o/2-i/2:["top-start-corner","top-end-corner","bottom-start-corner","bottom-end-corner"].includes(n.origPlacement)}}return{isCornerVerticalPlacement:!1,isCornerHorizontalPlacement:!1}}(i,s,t);b(function(t,e,n,i,s,o){const r={visibility:"visible"},a={visibility:"visible"};if("simple"===t&&s&&s.arrow){const{x:l,y:c,centerOffset:d}=s.arrow,m=7,h=6,g=5,x=5,p=0===d,b=d>0;function y(t){const e=t?h:m;C({borderTop:`${S(e)} solid ${u.rgba(f.colorSchemeVars.palette.neutral[90],.1)}`,borderRight:R(e),borderLeft:R(e)},r);const n=t?x:g;w({borderTop:`${S(n)} solid ${o}`,borderRight:`${R(n)}`,borderLeft:`${R(n)}`},a)}function C(t,e){Object.assign(e,t)}function w(t,e){Object.assign(e,t)}function A(t){return`rotate(${45*t}deg)`}function S(t){return`${t}px`}function R(t){return`${S(t)} solid transparent`}y(n||i);switch(s.placement.split("-")[0]){case"top":v();break;case"end":e?F():j();break;case"bottom":k();break;case"start":e?j():F()}function v(){null!=l&&(i?(C({top:"",bottom:S(2-m),left:S(l+(b?5:-5)),transform:A(b?5:3)},r),M()):(C({top:"",bottom:S(-m),left:S(p?l:l+(b?1:-1)),transform:A(0)},r),O()))}function j(){null!=c&&(n?(C({top:S(c+(b?2:-2)),right:"",left:S(-m-1),transform:A(b?7:5)},r),M()):(C({top:S(p?c:c+(b?-2:2)),right:"",left:S(1.5*-m),transform:A(2)},r),O()))}function k(){null!=l&&(i?(C({top:S(3-m),bottom:"",left:S(l+(b?4:-4)),transform:A(b?2:6)},r),w({top:S(-g),left:S((b?1:-1)-g)},a)):(C({top:S(-m),bottom:"",left:S(p?l:l+(b?1:-1)),transform:A(4)},r),O()))}function F(){null!=c&&(n?(C({top:S(c+(b?2:-2)),right:S(-m-1),left:"",transform:A(b?1:3)},r),w({top:S(-g),left:S((b?-2:2)-g)},a)):(C({top:S(p?c:c+(b?-2:2)),right:S(1.5*-m),left:"",transform:A(6)},r),O()))}function M(){w({top:S(-g),left:S((b?2:-2)-g)},a)}function O(){w({top:S(-g-2),left:S(-g)},a)}}return{arrowStyle:r,arrowInnerStyle:a}}(s,r,e,n,t,a))}),[t,a,t?.placement,t?.x,t?.y,t?.offset,t?.arrow,s,r,i]);const y=n.useMemo((()=>o.mergeRefs(m,x)),[m,x]);return"simple"===s&&e.jsxs("div",{ref:y,class:c.classNames([g,h.floatingTailBaseStyle]),style:p.arrowStyle,children:[" ",e.jsx("div",{class:c.classNames([h.floatingTailBaseStyle]),style:p.arrowInnerStyle})," "]})}));const p=i.forwardRef((({children:t,backgroundColor:i,onClickOutside:u,placement:f="bottom",anchorRef:p,offsetValue:b,class:y,tail:C="none",flipOptions:w={mainAxis:!0,crossAxis:!1},shiftOptions:A={mainAxis:!0,crossAxis:!1},sizeOptions:S={isMaxHeightAdjusted:!1,isMaxWidthAdjusted:!1},boundaryOptions:R={padding:0},onPosition:v},j)=>{const k=n.useRef(null),[F,M]=n.useState(),[O,E]=n.useState(null),{styles:P,baseTheme:T}=l.useComponentTheme(d.FloatingRedwoodTheme);n.useLayoutEffect((()=>{E(p.current)}),[p]),p.current!==O&&E(p.current);const{direction:$}=a.useUser(),H="rtl"===$,V=n.useCallback((t=>{M(t),v?.(t)}),[v]),B=[s.offset(b),s.flip({mainAxis:w.mainAxis,crossAxis:w.crossAxis,fallbackPlacements:w.fallbackPlacements?.map((t=>s.logicalSide(t,$))),padding:R.padding}),s.shift({mainAxis:A.mainAxis,crossAxis:A.crossAxis,limiter:s.limitShift({mainAxis:A.mainAxis,crossAxis:A.crossAxis})}),...k.current?[s.arrow({element:k.current})]:[]];(S.isMaxHeightAdjusted||S.isMaxWidthAdjusted)&&B.push(s.size({apply({availableWidth:t,availableHeight:e,elements:n}){S.isMaxHeightAdjusted&&parseInt(n.floating.style.maxHeight)!==e&&Object.assign(n.floating.style,{maxHeight:`${Math.min(e,S.maxHeightCeiling||e)}px`}),S.isMaxWidthAdjusted&&parseInt(n.floating.style.maxWidth)!==t&&Object.assign(n.floating.style,{maxWidth:`${Math.min(t,S.maxWidthCeiling||t)}px`})},padding:R.padding}));const{x:N,y:U,reference:W,floating:I,refs:z,update:L}=s.useFloating({placement:f,middleware:B,onPosition:V}),[_,D]=n.useState(!1);n.useEffect((()=>{if(z.reference.current&&z.floating.current&&!0===_)return s.autoUpdate(z.reference.current,z.floating.current,L)}),[z.floating,z.reference,L,_]),n.useEffect((()=>{null!=N&&null!=U&&D(!0)}),[N,U]),r.useOutsideClick({isDisabled:!1,ref:z.floating,handler:u}),n.useLayoutEffect((()=>{if(O instanceof Element){return void W(O)}const t=O;if(null!=t&&null!=t.contextElement){const e=function(t,e){let n=null,i=null,s=!1;return{contextElement:t||void 0,getBoundingClientRect(){const o=t?.getBoundingClientRect()||{width:0,height:0,x:0,y:0},r="x"===e.axis||"both"===e.axis,a="y"===e.axis||"both"===e.axis;let l=o.width,c=o.height,u=o.x,f=o.y;return null==n&&e.x&&r&&(n=o.x-e.x),null==i&&e.y&&a&&(i=o.y-e.y),u-=n||0,f-=i||0,l=0,c=0,s?s&&(c="x"===e.axis?o.height:c,l="y"===e.axis?o.width:l):(l="y"===e.axis?o.width:0,c="x"===e.axis?o.height:0,u=r&&null!=e.x?e.x:u,f=a&&null!=e.y?e.y:f),s=!0,{width:l,height:c,x:u,y:f,top:f,right:u+l,bottom:f+c,left:u}}}}(t.contextElement,{axis:"both",x:t.x,y:t.y});return void W(e)}const e={getBoundingClientRect:()=>({width:0,height:0,x:t.x,y:t.y,top:t.y,left:t.x,right:t.x,bottom:t.y})};t&&null!=t.x&&W(e)}),[O,W]);const q=n.useMemo((()=>o.mergeRefs(j,I)),[j,I]),G={top:U,left:N};let J={};i&&(J=h.assignInlineVars({[g.floatingVars.backgroundColor]:i}));const K=null==N&&null==U?m.floatingVisibilityStyles.hidden:m.floatingVisibilityStyles.visible,Q=c.classNames([y,T,P.baseStyle,K]),X=p&&p.current;return e.jsxs("div",{class:Q,ref:q,style:{...G,...J},children:[t,X&&e.jsx(x,{ref:k,backgroundColor:i,data:F,anchorRef:p,tail:C,isRtl:H})]})}));t.Floating=p}));
//# sourceMappingURL=Floating-3a873bc7.js.map
