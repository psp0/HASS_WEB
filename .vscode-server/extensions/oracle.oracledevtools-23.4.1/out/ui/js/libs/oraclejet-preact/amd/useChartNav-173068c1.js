define(['exports', 'preact/hooks', './LegendUtils-b7e1ee6f', './eventsUtils-18475190', './accUtils-c6181728'], (function(e,s,i,n,r){"use strict";function t(e,s){return e?.groupIndex===s?.groupIndex&&e?.isCurrent===s?.isCurrent&&e?.isFocusVisible===s?.isFocusVisible}function o(e,s){return e?.seriesIndex===s?.seriesIndex&&t(e,s)}e.useChartNav=function({rootRef:e,getNextChartItem:r,getDefaultNavGroup:u,getNextNavGroup:c,xIndexExtent:d,onItemInput:I,drilling:l}){const[x,a]=s.useState({groupIndex:d.startIndex,seriesIndex:0}),C="on"===l||"groupsOnly"===l,[p,b]=s.useState(),[g,f]=s.useState({groupIndex:0}),v=s.useRef(),F=s.useRef(),V=x.isCurrent,h=g.isCurrent,k=e=>{t(e,g)||f(e)},m=e=>{if(!o(e,F.current)){const s={groupIndex:e?.groupIndex,seriesIndex:e?.seriesIndex};I?.(s),F.current=e}},w=e=>{var s,i;o(e,x)||(a(e),p&&(s=p,i=e,s?.seriesIndex!==i?.seriesIndex||i?.groupIndex!==s?.groupIndex)&&b({...p,isCurrent:!1}),e.isCurrent&&m(e))},E=e=>{p&&o(e,p)||(b(e),a({...x,isCurrent:!1}),m(e))},y=e=>{const s=u(g),r=Math.max(d.startIndex,Math.min(d.endIndex,x.groupIndex));e.shiftKey?V?(w({...x,groupIndex:r,isCurrent:!1,isFocusVisible:!1}),m(void 0)):h?(w({...x,groupIndex:r,isCurrent:!0,isFocusVisible:!0}),C&&(k({...g,...s,isCurrent:!1,isFocusVisible:!1}),n.cancelEvent(e))):C&&k({...g,...s,isCurrent:!0,isFocusVisible:!0}):V?(w({...x,groupIndex:r,isCurrent:!1,isFocusVisible:!1}),C&&(k({...g,...s,isCurrent:!0,isFocusVisible:!0}),n.cancelEvent(e)),m(void 0)):h&&C?k({...g,...s,isCurrent:!1,isFocusVisible:!1}):w({...x,groupIndex:r,isCurrent:!0,isFocusVisible:!0}),v.current=i.getRandomId()};return{focusedItemInfo:x,focusedGroupInfo:g,hoveredItemInfo:p,activeId:v.current,navProps:{onKeyDown:e=>{const s=e.key;switch(s){case"Tab":y(e);break;case"ArrowRight":if(h){const e=c(g,s);k({...e,isCurrent:!0,isFocusVisible:!0})}else{const e=r(x,s);w({...e,isCurrent:!0,isFocusVisible:!0})}b(void 0),n.cancelEvent(e);break;case"ArrowLeft":if(h){const e=c(g,s);k({...e,isCurrent:!0,isFocusVisible:!0})}else{const e=r(x,s);w({...e,isCurrent:!0,isFocusVisible:!0})}b(void 0),n.cancelEvent(e);break;case"ArrowUp":if(V){const e=r(x,s);w({...e,isCurrent:!0,isFocusVisible:!0})}b(void 0),n.cancelEvent(e);break;case"ArrowDown":if(V){const e=r(x,s);w({...e,isCurrent:!0,isFocusVisible:!0})}b(void 0),n.cancelEvent(e)}},onKeyUp:e=>{if("Tab"===e.key)V||h||y(e)},onPointerUp:s=>{const i=n.getInfo(e,s);if(!i)return;const{seriesIndex:r,groupIndex:t}=i;null!=r&&null!=t?(w({seriesIndex:r,groupIndex:t,isCurrent:!1,isFocusVisible:!1}),k({...g,isCurrent:!1,isFocusVisible:!1})):void 0!==t&&void 0===r&&(k({groupIndex:t,isCurrent:!0,isFocusVisible:!1}),w({...x,isCurrent:!1,isFocusVisible:!1}))},onPointerMove:s=>{const i=n.getInfo(e,s);if(!i)return void E(void 0);const{seriesIndex:r,groupIndex:t}=i;null!=r&&(E({seriesIndex:r,groupIndex:t,isCurrent:!0}),w({...x,isCurrent:!1}))},onBlur:()=>{w({...x,isCurrent:!1,isFocusVisible:!1})}}}}}));
//# sourceMappingURL=useChartNav-173068c1.js.map
