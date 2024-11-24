define(['exports', 'preact/jsx-runtime', 'preact/hooks', './Layer-8682b669', 'preact/compat', './TopLayerHost-1134809b', './Modal-a327901f', './FocusTrap-61139e4d', './tabbableUtils-63e9f37e', './positionUtils-35b6e6b7', './clientHints-cfef9b8d', './useOutsideClick-3ced4958', './useAnimation-6b82844f', './useUser-03bad59a', './useTestId-85e3a67d', './useSwipe-3c289d89', './useComponentTheme-ee621a15', './colors-237e9028', './mergeInterpolations-2c5b5a03', './UNSAFE_DrawerPopup/themes/redwood/DrawerPopupTheme', './useThemeInterpolations-20e5a76e', './useColorScheme-504ab80c', './useScale-cdf8dd7a', './theme-7fdf24b2', './Theme-4e5c2b63', './Common/themes/redwood/theme', './Common/themes/themeContract.css', 'preact', './UNSAFE_Modal/themes/ModalStyles.css', 'css!./ModalStyles.styles.css', './vanilla-extract-recipes-createRuntimeFn.esm-cef8720b', './FocusTracker-0be417ef', './classNames-902bc74c', './PRIVATE_FocusTracker/themes/FocusTrackerStyles.css', 'css!./FocusTrackerStyles.styles.css', './head-585360fd', './_arity-cc05f75a', './_curry3-d231d2ab', './_curry1-18233096', './_curry2-6839fe47', './_isArray-a4219cba', './_isString-5e4bea9c', './arrayUtils-110317ac', './logger-2fbed0e0', './_isObject-3d38b8ba', './UNSAFE_DrawerPopup/themes/redwood/DrawerPopupBaseTheme.css', 'module', './UNSAFE_DrawerPopup/themes/DrawerPopupStyles.css', 'css!./DrawerPopupStyles.styles.css', './UNSAFE_DrawerPopup/themes/redwood/DrawerPopupVariants.css', 'css!./DrawerPopupVariants.styles.css'], (function(e,t,s,r,o,a,n,i,l,c,u,d,p,m,b,f,h,y,w,g,v,S,P,T,D,E,C,F,k,_,A,x,O,U,M,R,I,j,N,H,L,X,Y,z,B,V,W,$,K,q,G){"use strict";const J="0px",Q=250;e.DrawerPopup=({children:e,isOpen:o=!1,autoFocusRef:a,placement:v="start",modality:S="modal",onClose:P,onTransitionEnd:T,"aria-label":D,"aria-labelledby":E,"aria-describedby":C,testId:F,...k})=>{const[_,A]=s.useState(o?"initial":"unmounted"),[x,O]=s.useState("hidden"),[U,M]=s.useState(!o),[R,I]=s.useState("overlay"),j=s.useRef(null),N=s.useRef(null),H="bottom"===v,L={opening:()=>H?{from:{translateY:B()},to:{translateY:J},options:{duration:Q}}:{from:{translateX:z()},to:{translateX:J},options:{duration:Q}},closing:()=>H?{from:{translateY:J},to:{translateY:B()},options:{duration:Q}}:{from:{translateX:J},to:{translateX:z()},options:{duration:Q}}},X=b.useTestId(F),{direction:Y}=m.useUser(),z=()=>{return`${"right"===c.normalizePosition(v,Y)?"":"-"}${e=j.current,Math.round(e.getBoundingClientRect().width)}px`;var e},B=()=>{return`${e=j.current,Math.round(e.offsetHeight)}px`;var e},{nodeRef:V}=p.useAnimation(_,{animationStates:L,isAnimatedOnMount:!0,onAnimationEnd:()=>{"opening"===_?T?.(!0):o||(V(null),O("hidden"),A("unmounted"),T?.(!1))}});s.useEffect((()=>{if("unmounted"!==_||o){if("unmounted"!==_||!o)return"initial"===_&&o?(V(j.current),M(!1),void A("opening")):void("opening"===_&&o?O("visible"):o||(M(!0),A("closing")));A("initial")}}),[o,_,V]),s.useEffect((()=>{if("opening"===_){const e=l.getActiveElement();N.current=e===document.body?document.body:e,N.current?.addEventListener("keydown",W)}if("closing"===_)return()=>{N.current?.removeEventListener("keydown",W)}}),[_]);const W=e=>{N.current===l.getActiveElement()&&"F6"===e.code&&(e.preventDefault(),e.stopPropagation(),l.focusWithin(j.current))},$=s.useCallback((e=>{const t=N.current;switch(e.code){case"Escape":P?.({reason:"escapeKey"});break;case"F6":e.preventDefault(),e.stopPropagation(),t&&l.focusOn(t)}}),[P]),K=s.useCallback((()=>{P?.({reason:"outsideClick"})}),[P]);d.useOutsideClick({isDisabled:U,ref:j,handler:K});const q=u.getClientHints(),G=s.useCallback((()=>"ios"===q.platform?document.documentElement.clientWidth:window.innerWidth),[q.platform]),Z=s.useCallback((()=>{const e=G();"overlay"===R&&e<600&&I("fullOverlay"),"fullOverlay"===R&&e>600&&I("overlay")}),[G,R]);s.useEffect((()=>{if(j.current&&"opening"===_){const e=new ResizeObserver((()=>{Z()}));return e.observe(document.body),()=>{e.unobserve(document.body)}}}),[_,Z]);const ee=s.useCallback((e=>{const t=e.direction;("ltr"===Y&&"start"===v&&"left"===t||"end"===v&&"right"===t||"rtl"===Y&&"start"===v&&"right"===t||"end"===v&&"left"===t||"bottom"===v&&"down"===t)&&P?.({reason:"swipe"})}),[Y,v,P]),{swipeProps:te}=f.useSwipe(ee,{threshold:50,maximumTime:750,tolerance:40}),{classes:se}=h.useComponentTheme(g.DrawerPopupRedwoodTheme,{placement:H?v:"rtl"===Y?"start"===v?"right":"left":"start"===v?"left":"right",visibility:x,displayModeHorizontal:["start","end"].indexOf(v)>-1?R:void 0}),re=[...Object.values(y.colorInterpolations)],oe=w.mergeInterpolations(re),{...ae}=oe(k),ne=()=>t.jsx("div",{ref:j,className:se,style:ae,tabIndex:-1,role:"dialog",onKeyDown:$,"aria-label":D,"aria-labelledby":E,"aria-describedby":C,...te,...X,children:t.jsx(i.FocusTrap,{autoFocusRef:a,children:e})}),ie="unmounted"!==_;return ie?"modal"===S?t.jsx(n.Modal,{isOpen:ie,children:ne()}):t.jsx(r.Layer,{children:ne()}):null},Object.defineProperty(e,"__esModule",{value:!0})}));
//# sourceMappingURL=UNSAFE_DrawerPopup.js.map