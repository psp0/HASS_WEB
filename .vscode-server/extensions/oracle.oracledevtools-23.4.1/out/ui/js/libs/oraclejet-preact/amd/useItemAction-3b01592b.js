define(['exports', 'preact/hooks', './collectionUtils-6a04588d'], (function(t,e,a){"use strict";const n=(t,e,a)=>{if(void 0!==t){const n=o(t,e);return n&&a({context:n}),void 0!==n}return!1},o=(t,e)=>{const a=e?.data?.findIndex((e=>e.metadata.key===t))??-1;if(a>-1){return{index:a+(e?.offset||0),data:e?.data[a].data,metadata:e?.data[a].metadata}}};t.useItemAction=(t,o,r,c,d)=>{const s=e.useCallback((t=>{const e=a.keyExtractor(t.target,c);n(e,o,r)&&t.stopPropagation()}),[o,r,c]),i=e.useCallback((e=>{"Enter"===e.key?n(t,o,r):d&&" "===e.key&&(n(t,o,r),e.preventDefault())}),[o,r,t,d]);return o&&r?{onClick:s,onKeyDown:i}:{}}}));
//# sourceMappingURL=useItemAction-3b01592b.js.map
