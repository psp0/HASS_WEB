define(['exports', 'preact/jsx-runtime', 'preact/hooks', './useId-93f47e0a', './Check-dd88032a', './MenuItem-fa384473', './SelectMenuGroupContext-c8793248'], (function(e,t,n,o,i,s,u){"use strict";e.SelectMenuItem=function({value:e,label:m,isDisabled:c,endIcon:l}){const{isMultiple:a,value:d,onCommit:r}=n.useContext(u.SelectMenuGroupContext),p=o.useId(),C=n.useMemo((()=>`oj-menu-item-${p}`),[p]),{isSelected:x,memoizedOnCommit:I}=n.useMemo((()=>a?{isSelected:!!d?.includes(e),memoizedOnCommit:()=>{const t=x?d?.filter((t=>t!==e))||[]:[...d||[],e];r?.({value:t,previousValue:d})}}:{isSelected:d===e,memoizedOnCommit:()=>{r?.({value:e,previousValue:d})}}),[d,e,r,a]);return t.jsx(s.BaseMenuItem,{id:C,type:"select",role:a?"menuitemcheckbox":"menuitemradio",isChecked:x,isDisabled:c,startIcon:x?t.jsx(i.SvgCheck,{}):t.jsx("span",{}),label:m,onAction:I,endIcon:l})}}));
//# sourceMappingURL=SelectMenuItem-e2d849d3.js.map