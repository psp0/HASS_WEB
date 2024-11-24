define(['exports', 'preact/jsx-runtime', '@testing-library/preact', '@testing-library/user-event', 'chai', './Text-24f845b9', './View-f608b1c8', './Avatar-c37442d3', './Button-88a77e0e'], (function(e,t,i,a,n,s,c,l,r){"use strict";function d(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var o=d(a);const u=(e,t)=>[...Array(e)].map(((e,i)=>({id:t?i:`${i}`,name:`Employee ${i}`,title:`Employee title ${i}`,initials:`E${i}`}))),p=async()=>i.screen.findByRole("grid"),x=async(e="row")=>i.screen.findAllByRole(e);e.CardContent=({context:e,showButton:i})=>t.jsxs(c.View,{padding:"4x",children:[t.jsx(l.Avatar,{initials:e.data.initials,size:"xl"}),t.jsx("div",{style:"margin-top: 15px;",children:t.jsx(s.Text,{variant:"primary",size:"md",lineClamp:1,children:e.data.name})}),t.jsx(s.Text,{variant:"secondary",size:"md",lineClamp:1,children:e.data.title}),i&&t.jsxs("div",{style:"margin-top: 5px;",children:[t.jsx("div",{style:"margin-right: 5px; display: inline-block;",children:t.jsx(r.Button,{variant:"outlined",size:"md",label:"A"})}),t.jsx("div",{style:"display: inline-block;",children:t.jsx(r.Button,{variant:"outlined",size:"md",label:"B"})})]}),e.selector&&t.jsx("div",{style:"position: relative; left: -13px",children:e.selector?.()})]}),e.getRoot=p,e.populateData=u,e.testRender=({GenericCardGrid:e,ActionCardGrid:a,SelectionCardGrid:s,ContentUpdatableCardGrid:c})=>{it("initial render",(async function(){const a=u(100);i.render(t.jsx(e,{data:a}));const s=await x("gridcell");n.expect(s.length).eq(25)})),it("checking key type - string key",(async()=>{const a=u(3);i.render(t.jsx(e,{data:a}));const s=await x("gridcell");n.expect(void 0===s[0].dataset.ojKeyType).eq(!0),n.expect(void 0===s[1].dataset.ojKeyType).eq(!0),n.expect(void 0===s[2].dataset.ojKeyType).eq(!0)})),it("checking key type - numeric key",(async()=>{const a=u(3,!0);i.render(t.jsx(e,{data:a}));const s=await x("gridcell");n.expect(s[0].dataset.ojKeyType).eq("number"),n.expect(s[1].dataset.ojKeyType).eq("number"),n.expect(s[2].dataset.ojKeyType).eq("number")})),it("aria attributes - multiselectable and selected, selectionMode is none",(async()=>{const e=u(2);i.render(t.jsx(s,{data:e}));const a=await x("gridcell"),c=await p();n.expect(c.getAttribute("aria-multiselectable")).eq(null),n.expect(a[0].getAttribute("aria-selected")).eq(null),n.expect(a[1].getAttribute("aria-selected")).eq(null)})),it("aria attributes - multiselectable and selected, selectionMode is single",(async()=>{const e=u(2);i.render(t.jsx(s,{data:e,selectionMode:"single",selectedKeys:new Set(["1"])}));const a=await x("gridcell"),c=await p();n.expect(c.getAttribute("aria-multiselectable")).eq("false"),n.expect(a[0].getAttribute("aria-selected")).eq("false"),n.expect(a[1].getAttribute("aria-selected")).eq("true")})),it("aria attributes - multiselectable and selected, selectionMode is multiple",(async()=>{const e=u(3);i.render(t.jsx(s,{data:e,selectionMode:"multiple",selectedKeys:new Set(["1","2"])}));const a=await x("gridcell"),c=await p();n.expect(c.getAttribute("aria-multiselectable")).eq("true"),n.expect(a[0].getAttribute("aria-selected")).eq("false"),n.expect(a[1].getAttribute("aria-selected")).eq("true"),n.expect(a[2].getAttribute("aria-selected")).eq("true")})),"undefined"==typeof jest&&(it("content focusBehavior - valid case",(async()=>{const e=u(3);i.render(t.jsx(a,{data:e}));const s=await x("gridcell");await o.default.tab(),await i.waitFor((()=>{n.expect(s[0].matches(":focus-within")).to.be.true}))})),it("content focusBehavior - invalid case",(async()=>{const e=u(3);i.render(t.jsx(a,{data:e,showButton:!0}));const s=await p();await o.default.tab(),await i.waitFor((()=>{n.expect(s.matches(":focus")).to.be.true}))}))),it("memoization - update memoized children",(async()=>{const e=u(3),{queryByTestId:a}=i.render(t.jsx(c,{data:e})),s=a(e[0].id),l=a(e[1].id),r=a(e[2].id);n.expect(s?.innerHTML,"the 1st item initial count should be 0").eq("0"),n.expect(l?.innerHTML,"the 2nd item initial count should be 0").eq("0"),n.expect(r?.innerHTML,"the 3rd item initial count should be 0").eq("0");const d=a("mybutton");await o.default.click(d),n.expect(s?.innerHTML,"the 1st item new count should be 1").eq("1"),n.expect(l?.innerHTML,"the 2nd item new count should be 1").eq("1"),n.expect(r?.innerHTML,"the 3rd item new count should be 1").eq("1")}))}}));
//# sourceMappingURL=BaseCardViewTest-4e981927.js.map
