define(['exports', 'preact/jsx-runtime', './hooks/UNSAFE_useChartDataCursor/themes/DataCursorStyles.css', './Marker-514042dd', 'css!./SvgShapesStyles.styles.css', 'preact/hooks', './Common/themes/themeContract.css', './utils-b1f1bfab'], (function(e,t,r,s,o,n,i,a){"use strict";e.useChartDataCursor=function({findNearest:e,dataCursorPosition:o,onDataCursorPositionChange:c,isDataCursorEnabled:l,isHoriz:d,plotAreaSpace:u,yScale:y,xScale:x,dataCursorStyle:h,focusedItemInfo:v,getDataItemPos:f,getMarkerInfo:p}){let C=null,m=o?.x,g=o?.y;const k="snap"===h?.behavior,S=n.useRef(),P=()=>{const{seriesIndex:t,groupIndex:r}=v,s=f(t,r);if(!s)return;const o=s?.x+s.width/2,n=s?.y+s.height/2;let i=x.invert(d?n:o),a=y.invert(d?o:n);const l=e(i,a);S.current=l,k&&(i=x.invert(l.x),a=y.invert(l.y)),c?.({x:i,y:a})};if(null!=m&&null!=g&&l){const o=S.current||e(m,g);k&&(m=x.invert(o.x),g=y.invert(o.y));const{mainLineProps:n,contrastLineProps:c}=function(e,t,r,s,o){const n=o?.lineColor,i=o?.lineStyle,a=s?e.transform(t):r.y+r.height,c=s?r.x:e.transform(t),l=s?e.transform(t):r.y,d=s?r.x+r.width:e.transform(t),u=o?.lineWidth||1;return{mainLineProps:{x1:c,y1:a,x2:d,y2:l,style:{stroke:n,strokeDashArray:"dotted"===i?3:"dashed"===i?6:void 0,strokeWidth:u}},contrastLineProps:{x1:s?c:c+u,y1:s?a+u:a,x2:s?d:d+u,y2:s?l+u:l}}}(x,m,u,d,h),{type:l,color:v}=p(o.seriesIndex,o.groupIndex),f=l||"circle",P="circle"===f?18:16;C=t.jsxs(t.Fragment,{children:[t.jsxs("g",{class:r.styles.dataCursor,children:[t.jsx("line",{...n,class:r.styles.dataCursorLine}),t.jsx("line",{...c,class:r.styles.contrastLine})]}),h?.isMarkerDisplayed&&o&&t.jsx(s.Marker,{type:f,tx:o.x,ty:o.y,isInteractive:!0,scale:1,fill:v,stroke:a.rgb(i.colorSchemeVars.palette.neutral[0]),outerStroke:v,width:P,height:P,preserveRectAspectRatio:!0})]})}return{dataCursorContent:C,dataCursorProps:l?{onPointerMove:t=>{const r=t.offsetX,s=t.offsetY;if(r<u.x||s<u.y||r>u.x+u.width||s>u.y+u.height)return C=null,void c?.({x:void 0,y:void 0});let o=x.invert(d?s:r),n=y.invert(d?r:s);const i=e(o,n);S.current=i,k&&(o=x.invert(i.x),n=y.invert(i.y)),c?.({x:o,y:n})},onPointerLeave:()=>{c?.({x:void 0,y:void 0}),S.current=void 0},onKeyDown:e=>{if("Tab"===e.key)return c?.({x:void 0,y:void 0}),void(S.current=void 0);P()},onKeyUp:e=>{"Tab"===e.key&&v.isCurrent||P()}}:{}}}}));
//# sourceMappingURL=useChartDataCursor-6551b0da.js.map
