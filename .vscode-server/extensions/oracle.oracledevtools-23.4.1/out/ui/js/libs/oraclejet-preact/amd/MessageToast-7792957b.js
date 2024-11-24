define(['exports', 'preact/jsx-runtime', 'preact/hooks', './TopLayerHost-1134809b', './EnvironmentProvider-fea74278', './useMessagesFocusManager-eea05ccc', './useBreakpointValues-885d18a1', './MessagesContext-e6605f86', './useMessagesContext-1fdfc011', './useTranslationBundle-a17e0551', './Message-14de4bf2', 'preact', './utils-b1f1bfab', './Floating-3a873bc7', 'preact/compat', './useComponentTheme-ee621a15', './useTestId-85e3a67d', 'css!./TooltipContentStyles.styles.css', 'module', './hooks/UNSAFE_useTooltip/themes/redwood/TooltipContentVariants.css', 'css!./IconStyle.styles.css', './IconButton-0d891953', 'css!./MessageStyles.styles.css', './MessageFormattingUtils-83f6ebb6', './MessagesManager-e4da0822', './Flex-f2984cda', './MessageUtils-8fb9ce97', './FocusTrap-61139e4d', './LiveRegion-a66ead79', './UNSAFE_MessageToast/themes/redwood/MessageToastTheme', './MessageLayer-b7d1f259'], (function(e,s,t,n,a,o,r,i,l,c,u,d,g,m,f,p,h,y,M,v,x,T,R,b,F,k,C,S,j,E,I){"use strict";const U={entering:e=>({from:{transform:`translate(0, ${e.offsetHeight}px)`,opacity:1},to:{transform:"translate(0, 0)",opacity:1},end:{transform:"unset",opacity:1},options:{duration:250}}),exiting:{from:{opacity:1},to:{opacity:0},end:{opacity:0},options:{duration:250}}},L={opacity:0};e.MessageToast=function({data:e,detailRendererKey:n,iconRendererKey:i,renderers:d,onClose:m,offset:f,position:y,testId:M}){const v=h.useTestId(M),x=t.useRef(new Map),T=t.useRef(null),R=t.useRef(null),b=t.useRef(null),[w,B]=t.useState(),[_,z]=t.useState(e.length>0),[A,N]=t.useState(!1),V=c.useTranslationBundle("@oracle/oraclejet-preact"),{UNSAFE_messagesLayerId:$}=l.useMessagesContext(),H=t.useRef(e.length),K=t.useRef(0);H.current=e.length,t.useImperativeHandle(b,(()=>({focus:()=>!!e.length&&(T.current=x.current.get(e[0].key)??null,N(!0),!0),contains:s=>!(!e.length||!s)&&(R.current?.contains(s)??!1)})),[e]);const{controller:P,handlers:W}=o.useMessageFocusManager(b,{onFocus:t.useCallback((()=>{B(V.message_navigationFromMessagesRegion())}),[V]),onFocusLeave:t.useCallback((()=>{N(!1)}),[])},{handleEscapeKey:!1}),D=t.useCallback(((s,t,n)=>{const a=n?.contains(document.activeElement);if(0===H.current)return z(!1),N(!1),void(a&&setImmediate((()=>P.restorePriorFocus())));const o=t+1<e.length?t+1:t-1;if(o>-1&&a){const s=e[o].key;x.current.get(s)?.focus()}}),[P,e]),q=t.useCallback((e=>s=>x.current.set(e,s)),[]);t.useEffect((()=>{const s=K.current;if(K.current=e.length,e.length)return z(!0),e.length>s&&B(V.message_navigationToMessagesRegion()),void P.prioritize();B(s?V.messageToast_allMessagesClosed():"")}),[P,e.length,V]);const G=r.useBreakpointValues({sm:`calc(100vw - ${g.xUnits(8)})`,md:`calc(100vw - ${g.xUnits(12)})`,lg:`calc(150 * ${g.xUnits(1)})`}),J=r.useBreakpointValues({sm:{horizontal:"number"==typeof f?f:f?.horizontal??0,vertical:16+("number"==typeof f?f:f?.vertical??0)},lg:{horizontal:"number"==typeof f?f:f?.horizontal??0,vertical:24+("number"==typeof f?f:f?.vertical??0)}}),{classes:O}=p.useComponentTheme(E.MessageToastRedwoodTheme);return _||0!==e.length?s.jsxs(a.EnvironmentProvider,{environment:{colorScheme:"dark"},children:[s.jsx(I.MessageLayer,{offset:J,position:y,children:s.jsx("div",{class:O,ref:R,tabIndex:-1,id:$,...W,...v,children:s.jsx(S.FocusTrap,{autoFocusRef:T,isDisabled:!A,children:s.jsx(k.Flex,{direction:"column",gap:"1x",align:"center",maxWidth:G,children:s.jsx(F.MessagesManager,{animationStates:U,initialAnimationStyles:L,data:e,onMessageWillRemove:D,children:({item:e})=>s.jsx(u.Message,{messageRef:q(e.key),item:e,detailRenderer:C.getRenderer(e,n,d),iconRenderer:C.getRenderer(e,i,d),onClose:m,variant:"toast"},e.key)})})})})}),s.jsx(j.LiveRegion,{children:w})]}):s.jsx(j.LiveRegion,{children:w})}}));
//# sourceMappingURL=MessageToast-7792957b.js.map
