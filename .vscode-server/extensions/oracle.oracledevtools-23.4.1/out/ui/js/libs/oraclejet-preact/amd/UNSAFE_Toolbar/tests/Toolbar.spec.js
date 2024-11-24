define(['preact/jsx-runtime', '@testing-library/preact', 'chai', '../../ToolbarSeparator-570f470e', '../../BaseButton-9f07f6ef', '@testing-library/user-event', '../../Button-88a77e0e', '../../MenuButton-19527fdd', '../../SplitMenuButton-ccce6d3b', '../../useRovingTabIndexContainer-df24ba6e', 'preact/hooks', '../../useUser-03bad59a', '../../TopLayerHost-1134809b', '../../Common/themes/redwood/theme', '../../Common/themes/themeContract.css', 'preact', 'preact/compat', '../../clientHints-cfef9b8d', '../../TabbableModeContext-1e10fda7', '../../useTabbableMode-dd4cb96b', '../../useId-93f47e0a', '../themes/redwood/ToolbarTheme', '../themes/ToolbarStyles.css', 'css!./../../ToolbarStyles.styles.css', '../themes/redwood/ToolbarBaseTheme.css', 'module', '../themes/redwood/ToolbarVariants.css', '../../vanilla-extract-recipes-createRuntimeFn.esm-cef8720b', '../../useComponentTheme-ee621a15', '../../logger-2fbed0e0', '../../classNames-902bc74c', '../themes/ToolbarSeparatorStyles.css', 'css!./../../ToolbarSeparatorStyles.styles.css', '../../Separator-87ddeffc', '../../UNSAFE_Separator/themes/SeparatorStyles.css', 'css!./../../SeparatorStyles.styles.css', '../../usePress-52c24c9a', '../../useHover-78209499', '../../useToggle-373978a9', '../../useActive-92b57fa5', '../../useColorScheme-504ab80c', '../../dimensions-f9da1099', '../../size-0ac0e517', '../../utils-b1f1bfab', '../../colorUtils-35dd886e', '../../_curry1-18233096', '../../mergeInterpolations-2c5b5a03', '../../_curry3-d231d2ab', '../../_curry2-6839fe47', '../../_isObject-3d38b8ba', '../../mergeProps-31f70810', '../../UNSAFE_BaseButton/themes/BaseButtonStyles.css', 'css!./../../BaseButtonStyles.styles.css', '../../useTestId-85e3a67d', '../../ButtonLayout-818f8ae5', '../../Text-24f845b9', '../../UNSAFE_Text/themes/TextStyles.css', 'css!./../../TextStyles.styles.css', '../../UNSAFE_ButtonLayout/themes/redwood/ButtonLayoutTheme', '../../UNSAFE_ButtonLayout/themes/ButtonLayoutStyles.css', 'css!./../../ButtonLayoutStyles.styles.css', '../../UNSAFE_ButtonLayout/themes/redwood/ButtonLayoutBaseTheme.css', 'module', '../../UNSAFE_ButtonLayout/themes/redwood/ButtonLayoutVariants.css', 'css!./../../ButtonLayoutVariants.styles.css', '../../ChevronDown-86f3138b', '../../Icon-8e654a65', '../../useTooltip-c5269153', '../../useTooltipControlled-ca5c213a', '../../Floating-3a873bc7', '../../useFloating-64bd8b22', '../../positionUtils-35b6e6b7', '../../refUtils-280eda7e', '../../useOutsideClick-3ced4958', '../../arrayUtils-110317ac', '../../UNSAFE_Floating/themes/redwood/FloatingTheme', '../../UNSAFE_Floating/themes/FloatingStyles.css', 'css!./../../FloatingStyles.styles.css', '../../UNSAFE_Floating/themes/redwood/FloatingBaseTheme.css', 'module', '../../UNSAFE_Floating/themes/redwood/FloatingVariants.css', '../../vanilla-extract-dynamic.esm-f66d9a78', '../../UNSAFE_Floating/themes/FloatingContract.css', '../../Layer-8682b669', '../../useThemeInterpolations-20e5a76e', '../../useScale-cdf8dd7a', '../../theme-7fdf24b2', '../../Theme-4e5c2b63', '../../useFocus-b99be29c', '../../useTouch-c4d9ff65', '../../useAnimation-6b82844f', '../../hooks/UNSAFE_useTooltip/themes/redwood/TooltipContentTheme', '../../hooks/UNSAFE_useTooltip/themes/TooltipContentStyles.css', 'css!./../../TooltipContentStyles.styles.css', '../../hooks/UNSAFE_useTooltip/themes/redwood/TooltipContentBaseTheme.css', 'module', '../../hooks/UNSAFE_useTooltip/themes/redwood/TooltipContentVariants.css', 'css!./../../TooltipContentVariants.styles.css', '../../EnvironmentProvider-fea74278', '../../LayerManager-0b32f35b', '../../UNSAFE_Icon/themes/IconStyle.css', 'css!./../../IconStyle.styles.css', '../../Menu-d49ce065', '../../MenuItem-fa384473', '../../flexitem-554e6fbe', 'css!./../../flexitem.styles.css', '../../vanilla-extract-sprinkles-createRuntimeSprinkles.esm-fa409727', '../../useInteractionStyle-272137c8', '../../UNSAFE_Menu/themes/redwood/MenuItemTheme', '../../UNSAFE_Menu/themes/MenuItemStyles.css', 'css!./../../MenuItemStyles.styles.css', '../../UNSAFE_Menu/themes/redwood/MenuItemBaseTheme.css', 'module', '../../UNSAFE_Menu/themes/redwood/MenuItemVariants.css', 'css!./../../MenuItemVariants.styles.css', '../../UNSAFE_Menu/themes/MenuStyles.css', 'css!./../../MenuStyles.styles.css', '../../UNSAFE_Menu/themes/DropdownMenuStyles.css', 'css!./../../DropdownMenuStyles.styles.css', '../../Modal-a327901f', '../../UNSAFE_Modal/themes/ModalStyles.css', 'css!./../../ModalStyles.styles.css', 'css!./../../WindowOverlayStyles.styles.css', 'module', '../../UNSAFE_WindowOverlay/themes/redwood/WindowOverlayVariants.css', '../../useSheetSwipe-f65427d6', 'css!./../../SheetStyles.styles.css', '../../UNSAFE_Menu/themes/SheetMenuStyles.css', 'css!./../../SheetMenuStyles.styles.css', '../../SelectMenuGroupContext-c8793248', 'css!./../../MenuSeparatorStyles.styles.css', 'module', '../../UNSAFE_Menu/themes/redwood/MenuSeparatorVariants.css', '../../useMenuAction-1464518b', '../../NavDown-5eca5702', '../../UNSAFE_SplitMenuButton/themes/redwood/SplitMenuButtonTheme.css', 'css!./../../SplitMenuButtonStyles.styles.css', 'css!./../../SplitMenuButtonTheme.styles.css'], (function(e,t,s,o,a,n,l,r,c,u,d,i,m,y,S,h,b,p,T,f,F,A,B,M,w,E,U,g,N,_,x,v,I,C,L,k,V,j,q,D,O,R,W,H,P,z,G,J,K,Q,X,Y,Z,$,ee,te,se,oe,ae,ne,le,re,ce,ue,de,ie,me,ye,Se,he,be,pe,Te,fe,Fe,Ae,Be,Me,we,Ee,Ue,ge,Ne,_e,xe,ve,Ie,Ce,Le,ke,Ve,je,qe,De,Oe,Re,We,He,Pe,ze,Ge,Je,Ke,Qe,Xe,Ye,Ze,$e,et,tt,st,ot,at,nt,lt,rt,ct,ut,dt,mt,yt,St,ht,bt,pt,Tt,ft,Ft,At,Bt,Mt,wt,Et,Ut,gt,Nt,_t,xt){"use strict";function vt(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var It=vt(n);describe("Test Toolbar component",(()=>{const n=e.jsxs(o.Toolbar,{children:[e.jsx(a.BaseButton,{}),e.jsx(l.Button,{isDisabled:!0}),e.jsx(o.ToolbarSeparator,{}),e.jsx(r.MenuButton,{}),e.jsx(c.SplitMenuButton,{})]});it("Checks for Toolbar and amount of Toolbar content",(async()=>{t.render(n);const e=t.screen.getAllByRole("toolbar")[0],o=e?.childNodes;s.expect(e).not.to.be.null,s.expect(o?.length).equals(5)})),it("Uses left/right arrow keys to navigate, skipping disabled content and dividers",(async()=>{t.render(n);const e=t.screen.getAllByRole("toolbar")[0],o=e?.childNodes,a=o?.[0],l=o?.[3];await It.default.tab(),s.expect(document.activeElement).equals(a),s.expect(a.getAttribute("tabIndex")).equals("0"),t.fireEvent.keyDown(a,{key:"ArrowRight",code:"ArrowRight",charCode:39}),s.expect(document.activeElement).equals(l),s.expect(l.getAttribute("tabIndex")).equals("0"),s.expect(a.getAttribute("tabIndex")).equals("-1"),t.fireEvent.keyDown(l,{key:"ArrowLeft",code:"ArrowLeft",charCode:37}),s.expect(document.activeElement).equals(a),s.expect(a.getAttribute("tabIndex")).equals("0"),s.expect(l.getAttribute("tabIndex")).equals("-1")}))}))}));
//# sourceMappingURL=Toolbar.spec.js.map