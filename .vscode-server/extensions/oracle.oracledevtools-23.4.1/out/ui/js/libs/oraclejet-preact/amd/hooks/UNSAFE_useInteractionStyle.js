define(['exports', '../useInteractionStyle-272137c8', '../mergeProps-31f70810', '../clientHints-cfef9b8d', '../useHover-78209499', '../useToggle-373978a9', 'preact/hooks', '../useActive-92b57fa5'], (function(e,t,o,r,i,c,s,a){"use strict";e.useInteractionStyle=t.useInteractionStyle,e.wrapWithActiveSelector=e=>({"&:active":e}),e.wrapWithFocusSelector=e=>({"&:focus":e}),e.wrapWithFocusVisibleSelector=e=>({"&:focus-visible":e}),e.wrapWithHoverSelector=e=>({"&:hover":e}),e.wrapWithNotActiveSelector=e=>({"&:not(:active)":e}),e.wrapWithParentNotActiveSelector=(e,t)=>({[`${t}:not(:active) > &`]:e}),e.wrapWithParentPseudoHoverSelector=(e,t)=>({"@media":{"(hover: hover)":{selectors:{[`${t}:hover:not(:active) > &`]:e}}}}),e.wrapWithPseudoHoverSelector=e=>({"@media":{"(hover: hover)":{selectors:{"&:hover:not(:active)":e}}}}),e.wrapWithVisitedSelector=e=>({"&:visited":e}),Object.defineProperty(e,"__esModule",{value:!0})}));
//# sourceMappingURL=UNSAFE_useInteractionStyle.js.map
