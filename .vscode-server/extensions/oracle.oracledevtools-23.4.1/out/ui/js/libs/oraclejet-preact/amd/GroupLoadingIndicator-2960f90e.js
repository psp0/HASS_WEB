define(['exports', 'preact/jsx-runtime', 'preact/hooks', './classNames-902bc74c', './keys-459a726d', './useId-93f47e0a', './useViewportIntersect-1314c1cb', './TabbableModeContext-1e10fda7', './useComponentTheme-ee621a15', './useInteractionStyle-272137c8', './mergeInterpolations-2c5b5a03', './flexitem-554e6fbe', './PRIVATE_List/themes/ListStyles.css', './UNSAFE_GroupedList/themes/redwood/GroupedListTheme', './Flex-f2984cda', './Skeleton-4f4380ad', './List-96f5c957'], (function(e,t,i,s,n,o,a,r,l,d,c,u,p,b,y,m,v){"use strict";e.GROUP_SELECTOR="[data-oj-listview-group]",e.GroupLoadingIndicator=()=>t.jsx(v.SkeletonContainer,{minimumCount:3,children:e=>{const i={paddingLeft:10*e+"px"};return t.jsxs(y.Flex,{height:"12x",align:"center",children:[t.jsx("span",{style:i}),t.jsx(m.Skeleton,{height:"4x"})]})}}),e.ListGroupHeader=function({ariaDescribedBy:e,children:y,itemKey:m,itemIndex:v,itemDepth:x,isFocused:f,isFocusRingVisible:h,isActive:g,isGridlineVisible:S,isExpandable:j,expandedKeys:I,viewportConfig:k}){const[E,L]=i.useState(!1),{classes:T,styles:C}=l.useComponentTheme(b.GroupedListRedwoodTheme),{interactionProps:H,applyHoverStyle:R,applyPseudoHoverStyle:w,applyActiveStyle:G}=d.useInteractionStyle(),V=[p.listGroupHeaderMultiVariantStyles({expandable:j?"isExpandable":"notExpandable",needsEventsHover:R?"isNeedsEventsHover":"notNeedsEventsHover",pseudoHover:w?"isPseudoHover":"notPseudoHover",active:G||g?"isActive":"notActive",focusRingVisible:h&&f?"isFocusRingVisible":"notFocusRingVisible",gridlineTop:v>0?"visible":"hidden",gridlineBottom:S?"visible":"hidden"})];E&&(V.push(T),V.push(C.stuckHeader));const A=s.classNames(V),F=c.mergeInterpolations([...Object.values(u.flexitemInterpolations)]),{class:N,...P}=F({alignSelf:"center",flex:"1 0 auto"});return a.useViewportIntersect({scroller:()=>j?null:null==k?document.body:k.scroller()},0,1,"[data-oj-key="+m+"]",(()=>{L(!1)}),(e=>{e.boundingClientRect.y!==e.intersectionRect.y&&L(!0)})),t.jsx("div",{id:o.useId(),role:"row","aria-rowindex":v+1,"aria-level":isNaN(x)?void 0:x+1,"data-oj-key":m,class:A,..."number"==typeof m&&{"data-oj-key-type":"number"},...H,children:t.jsx("div",{id:o.useId(),role:"gridcell","aria-describedby":e,"aria-colindex":1,"aria-expanded":n.containsKey(I,m),style:P,children:t.jsx(r.TabbableModeContext.Provider,{value:{isTabbable:!1},children:y})})})},e.STICKY_SELECTOR="[data-oj-listview-sticky]",e.excludeGroup=(e,t)=>{if(!t.all){const i=e.data.filter((e=>!e.metadata.isLeaf)).map((e=>e.metadata.key)),s=Array.from(t.keys.values()).filter((e=>!i.includes(e)));return{...t,keys:new Set(s)}}return t}}));
//# sourceMappingURL=GroupLoadingIndicator-2960f90e.js.map