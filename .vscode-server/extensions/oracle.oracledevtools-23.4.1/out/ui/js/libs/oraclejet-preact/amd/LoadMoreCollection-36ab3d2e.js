define(['exports', 'preact/jsx-runtime', 'preact', './useViewportIntersect-1314c1cb', './Collection-6e493be7'], (function(e,o,t,r,n){"use strict";const i="oj-collection-loadmore",c=`.${i}`;e.LOADMORE_STYLE_CLASS=i,e.LoadMoreCollection=function({data:e,children:i,viewportConfig:s,hasMore:l,onLoadMore:a,loadMoreIndicator:d,suggestions:u,loadMoreThreshold:h=1}){return r.useViewportIntersect(s,Math.max(h,1),0,c,(()=>{e&&a()})),e?o.jsxs(t.Fragment,{children:[u,o.jsx(n.Collection,{items:e,children:i}),l&&d]}):o.jsx("div",{})}}));
//# sourceMappingURL=LoadMoreCollection-36ab3d2e.js.map