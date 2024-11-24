define(['exports', 'preact/jsx-runtime', './labelUtils-4b490596', './UNSAFE_Axis/themes/AxisStyles.css', './UNSAFE_Axis/themes/redwood/AxisTheme', './useComponentTheme-ee621a15', './classNames-902bc74c', './clientHints-cfef9b8d'], (function(e,s,t,i,l,n,c,a){"use strict";function o({text:e,style:t,textProps:l,isTitle:n,isInteractive:o,id:r}){const x=a.getClientHints().browser;return s.jsx("text",{style:t,...l,class:c.classNames([o?i.styles.isInteractive:"",n?i.styles.axisTitle:i.styles.axisLabel,n||"safari"!==x?"":i.styles.middleBaseline]),id:r,children:e})}e.Axis=function({title:e,titleStyle:c,titleProps:a,tickLabels:r,tickLabelStyle:x,focusedGroupIndex:d,axisPosition:m,activeId:u,isTextInteractive:p}){const{classes:y}=n.useComponentTheme(l.AxisRedwoodTheme);return s.jsxs("g",{class:y,children:[e&&s.jsx(o,{text:e,textProps:a,style:c,isTitle:!0}),r.length>0&&s.jsx("g",{style:x,children:r.map((({label:e,labelProps:l,index:n},c)=>{const a=d===c;return s.jsxs(s.Fragment,{children:[a&&e?s.jsx("rect",{...t.getEnclosingRectDims(l,m),class:i.styles.outlineRing}):"",e&&s.jsx(o,{textProps:{...l,"data-oj-object":"group","data-oj-group-index":n},text:e,isInteractive:p?.(n),id:a?u:""})]})}))})]})}}));
//# sourceMappingURL=Axis-e5656cfd.js.map