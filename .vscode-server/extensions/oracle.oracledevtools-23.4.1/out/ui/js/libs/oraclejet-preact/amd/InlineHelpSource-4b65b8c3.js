define(['exports', 'preact/jsx-runtime', './classNames-902bc74c', './useComponentTheme-ee621a15', './TabbableModeContext-1e10fda7', './useTabbableMode-dd4cb96b', './useTranslationBundle-a17e0551', './UNSAFE_UserAssistance/themes/redwood/UserAssistanceTheme'], (function(e,s,a,n,t,o,r,c){"use strict";e.InlineHelpSource=function({children:e,source:t}){const l=r.useTranslationBundle("@oracle/oraclejet-preact").userAssistance_learnMore();e=e??l;const{isTabbable:b,tabbableModeProps:u}=o.useTabbableMode(),{classes:d,styles:i}=n.useComponentTheme(c.UserAssistanceRedwoodTheme),{helpSourceStyles:m}=i;return s.jsx("a",{class:a.classNames([d,m]),target:"_blank",href:t,...!b&&u,children:e})}}));
//# sourceMappingURL=InlineHelpSource-4b65b8c3.js.map
