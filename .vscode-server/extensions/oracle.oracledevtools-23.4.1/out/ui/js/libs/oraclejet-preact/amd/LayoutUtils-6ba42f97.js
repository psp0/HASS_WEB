define(['exports'], (function(n){"use strict";n.getRandomId=function(){return`_${Math.random().toString(36).slice(2)}`},n.getUnion=function(n,t){const e={};if(t&&0!==t.w&&0!==t.h)if(0!==n.w&&0!==n.h){const h=n.x+n.w,i=n.y+n.h,x=t.x+t.w,r=t.y+t.h,w=Math.min(n.x,t.x),y=Math.min(n.y,t.y);e.w=h<x?x-w:h-w,e.h=i>r?i-y:r-y,e.x=w,e.y=y}else e.x=t.x,e.y=t.y,e.w=t.w,e.h=t.h;else e.x=n.x,e.y=n.y,e.w=n.w,e.h=n.h;return e},n.intersects=function(n,t){if(t&&0!==t.w&&0!==t.h&&0!==n.w&&0!==n.h){const e=n.x+n.w,h=n.y+n.h,i=t.x+t.w,x=t.y+t.h;return!(t.x>e||i<n.x||t.y>h||x<n.y)}return!1}}));
//# sourceMappingURL=LayoutUtils-6ba42f97.js.map
