define(['exports', 'preact/jsx-runtime', './UNSAFE_PieChart/themes/PieChartStyles.css', './PathUtils-2adb9fd7', './layoutUtils-fa012ea3', './classNames-902bc74c', './useUser-03bad59a', './usePieChartNav-be002217', './useDatatip-53c4d649', './util-a02e87e9', './mergeProps-31f70810', './useTestId-85e3a67d', './size-0ac0e517', './colorUtils-4c312b6d', './accUtils-c6181728', './TrackResizeContainer-3e88e29d', './VisTabularDatatip-877ef918'], (function(e,t,a,i,n,s,o,r,l,c,d,h,u,b,x,m,f){"use strict";const g=.45,M=.38,p=3,v=1.5,I=90;function T(e){return e*(Math.PI/180)}function y(e,t,a,i){const n=Math.atan2(i,a)-Math.atan2(t,e);return n<0?n+2*Math.PI:n}function j(e,t,a,n,s,o,r,l,c){const d=Math.max(n-e,0),h=Math.max(s-e,0),u=360==r||d<e?0:l+2*e,b=o?o+e:0,x=T(360==r?359.99:r),m=T(c),f=u/2,g=f<d?Math.asin(f/d):0,M=-x/2-m,p=Math.min(5*f,x>0?Math.abs(f/Math.sin(x/2)):0),v=0==d?p:p*h/d,I=t+Math.cos(M)*p,j=a+Math.sin(M)*v,C=t+Math.cos(-g-m)*d,P=a+Math.sin(-g-m)*h,w=t+Math.cos(-m-x+g)*d,L=a+Math.sin(-m-x+g)*h;let A,S=y(w-t,L-a,C-t,P-a);if(S=Math.min(S,x),b>0){const e=f<b?Math.asin(f/b):0,n=t+Math.cos(-e-m)*b,s=a+Math.sin(-e-m)*b,o=t+Math.cos(-m-x+e)*b,l=a+Math.sin(-m-x+e)*b;let c=y(o-t,l-a,n-t,s-a);c=Math.min(c,S,x),360==r?(A=i.moveTo(w,L),A+=i.arcTo(d,h,x,1,C,P),A+=i.lineTo(w,L),A+=i.moveTo(n,s),A+=i.arcTo(b,b,x,0,o,l)):(A=i.moveTo(o,l),A+=i.lineTo(w,L),A+=i.arcTo(d,h,S,1,C,P),A+=i.lineTo(n,s),A+=i.arcTo(b,b,c,0,o,l))}else 360==r?(A=i.moveTo(w,L),A+=i.arcTo(d,h,x,1,C,P)):(A=i.moveTo(I,j),A+=i.lineTo(w,L),A+=i.arcTo(d,h,S,1,C,P));return A+=i.closePath(),A}function C(e,t,a){return{innerBounds:{width:Math.sqrt(2)*a,height:Math.sqrt(2)*a,x:e-a/Math.sqrt(2),y:t-a/Math.sqrt(2)},outerBounds:{width:2*a,height:2*a,x:e-a,y:t-a}}}function P(e,t,a,i,n,s){return s?function(e,t,a,i,n,s){const o=(e+t/2)/180*Math.PI,r=(n+s)/2;return{x:a+r*Math.cos(o),y:i-r*Math.sin(o),width:0,height:0}}(e[s.itemIndex].startAngle,e[s.itemIndex].angleExtent,t,a,i,n):void 0}function w(e,t,a){return a?.color||null!=t?.itemIndex?e[t.itemIndex]:void 0}function L({cx:e,cy:i,r:n,startAngle:o,angleExtent:r,gap:l,innerRadius:c,color:d,id:h,itemIndex:u,isFocused:b=!1,isHovered:x=!1,...m}){const f=j(0,e,i,n,n,c,r,l,o);let g;return b?(g=j(2,e,i,n,n,c,r,l,o),t.jsxs("g",{id:h,role:m.accessibleLabel?"img":void 0,"data-oj-item-index":u,"data-oj-object":"pieSlice","aria-label":m.accessibleLabel,children:[t.jsx("path",{d:f,fill:d,stroke:d,className:a.styles.innerShapes}),t.jsx("path",{d:g,fill:d,className:s.classNames([a.styles.contrastBorder,a.styles.innerShapes])})]})):t.jsx("path",{role:m.accessibleLabel?"img":void 0,"aria-label":m.accessibleLabel,d:f,"data-oj-object":"pieSlice",fill:d,id:h,"data-oj-item-index":u})}e.PieChart=function({data:e,width:i="100%",height:s="448px",testId:x,innerRadius:T=0,...y}){const j=b.getColorRamp(),{totalValue:A,isLabelOutside:S}=e.reduce((({totalValue:e,isLabelOutside:t},a)=>({totalValue:e+(V?.has(a.id)?0:a.value),isLabelOutside:t})),{totalValue:0,isLabelOutside:!1});var V;const N=function(e,t){let a,i=I;const n=[];for(let s=0;s<e.length;s++){const o=e[s],r=o.value;a=r===t?100:0===t?0:Math.min(r/t*100,99.99);const l=3.6*a;let c=i-l;c<0&&(c+=360),n.push({index:s,startAngle:c,angleExtent:l,...o}),i=c}return n}(e,A),U=function(e){return p*e}(.5),E=e.length>100,{direction:F}=o.useUser(),R=h.useTestId(x);return t.jsx(m.TrackResizeContainer,{width:u.sizeToCSS(i)||"0px",height:u.sizeToCSS(s)||"0px",children:function(i,s){const o=n.getAvailSpace(i,s),{cx:h,cy:u}=function(e){return{cx:e.x+Math.floor(e.width/2),cy:e.y+Math.floor(e.height/2)}}(o),b=function(e,t){const a=t?M:g;return Math.floor(Math.min(e.width,e.height)*a)}(o,S),x=T*b,m=function(e,t,a){if(!t)return e;const i=2*Math.PI*a;let n=0;return e.filter((({startAngle:e,angleExtent:t})=>{const a=(t+e)/360*i;return!(t/360*i<v&&Math.abs(n-a)<v||(n=a,0))}))}(N,E,b),p=function(e,t){return({itemIndex:a},i)=>{let n=a;return n=t&&("ArrowRight"===i||"ArrowUp"===i)||!t&&("ArrowLeft"===i||"ArrowDown"===i)?a-1:a+1,{itemIndex:(n%e.length+e.length)%e.length}}}(m,"rtl"===F),{activeId:I,navProps:A,focusedItemInfo:V,hoveredItemInfo:D}=r.usePieChartNav({getNextChartItem:p}),z=V.isFocusVisible?V:D,O=z?e[m[z.itemIndex].index]:void 0,{content:k,borderColor:q}=O&&y.datatip?y.datatip({data:O}):((e,a)=>e?e.accessibleLabel?{content:e.accessibleLabel,borderColor:w(j,a,e)}:{content:t.jsx(f.VisTabularDatatip,{tableData:[{key:"Value",value:e.value}]}),borderColor:w(j,a,e)}:{content:void 0,borderColor:void 0})(O,z),B=V.isFocusVisible?"element":"pointer",H=z?.isFocusVisible?P(m,h,u,x,b,z):void 0,{datatipContent:_,datatipProps:G}=l.useDatatip({content:k,offset:c.calculateOffset("rtl"===F,i,H),anchor:B,placement:"top-start",borderColor:q});G["aria-describedby"]=[y["aria-describedby"],G["aria-describedby"]].filter(Boolean).join(" ");const J=d.mergeProps(A,G);return t.jsxs("div",{tabIndex:0,"aria-label":y["aria-label"],"aria-labelledby":y["aria-labelledby"],"aria-activedescendant":I,role:"application",...J,...R,className:a.styles.chart,style:{width:i,height:s},children:[m.length>0&&t.jsx("svg",{className:a.styles.svg,children:m.map(((e,a)=>t.jsx(L,{cx:h,cy:u,itemIndex:a,id:V.itemIndex===a?I:void 0,isFocused:V?.itemIndex===a&&V?.isFocusVisible,isHovered:D?.itemIndex===a,r:b,startAngle:e.startAngle,gap:U,innerRadius:x,angleExtent:e.angleExtent,color:e.color||j[a%j.length],accessibleLabel:e.accessibleLabel},e.id)))}),y.children?.(C(h,u,x)),_]})}})}}));
//# sourceMappingURL=PieChart-40887c29.js.map
