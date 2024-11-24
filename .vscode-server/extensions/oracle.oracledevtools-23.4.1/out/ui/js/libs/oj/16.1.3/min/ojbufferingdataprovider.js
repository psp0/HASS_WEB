/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
define(["ojs/ojcore-base","ojs/ojdataprovider","ojs/ojeventtarget","ojs/ojmap","ojs/ojbufferingdataproviderevents","ojs/ojset","ojs/ojcomponentcore"],function(t,e,a,s,i,r,d){"use strict";t=t&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t,s=s&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s,r=r&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r;
/**
     * @preserve Copyright 2013 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
/**
     * @preserve Copyright 2013 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
class o{constructor(){this.unsubmittedItems=new s,this.submittingItems=new s,this.submittedAddItems=new s,this.addItemOrder=[],this.mapOpTransform=new s,this.mapEditItemStatus=new s}addItem(t){const e=t.metadata.key,a=this.unsubmittedItems.get(e),s=this.submittingItems.get(e);if(a&&("add"===a.operation||"update"===a.operation)||s&&("add"===s.operation||"update"===s.operation))throw new Error("Cannot add item with same key as an item being added or updated");if(a&&"remove"===a.operation){this.unsubmittedItems.delete(e);const a={operation:"update",item:t};return this.unsubmittedItems.set(e,a),this.mapOpTransform.set(e,a),void this.addItemOrder.unshift(e)}this.unsubmittedItems.set(e,{operation:"add",item:t}),this.addItemOrder.unshift(e)}removeItem(t){const e=t.metadata.key,a=this.unsubmittedItems.get(e),s=this.submittingItems.get(e);if(a&&"remove"===a.operation||s&&"remove"===s.operation)throw new Error("Cannot remove item with same key as an item being removed");return a&&"add"===a.operation?(this.unsubmittedItems.delete(e),void this._removeFromAddItemOrder(e)):a&&"update"===a.operation?(this.unsubmittedItems.set(e,{operation:"remove",item:t}),this.mapOpTransform.delete(e),this._removeFromAddItemOrder(e),void this.submittedAddItems.delete(e)):(this._removeFromAddItemOrder(e),this.submittedAddItems.delete(e),void this.unsubmittedItems.set(e,{operation:"remove",item:t}))}updateItem(t){const e=this.unsubmittedItems.get(t.metadata.key),a=this.submittingItems.get(t.metadata.key);if(e&&"remove"===e.operation||a&&"remove"===a.operation)throw new Error("Cannot update item with same key as an item being removed");!e||"add"!==e.operation&&"update"!==e.operation?this.unsubmittedItems.set(t.metadata.key,{operation:"update",item:t}):this.unsubmittedItems.set(t.metadata.key,{operation:e.operation,item:t})}setItemMutated(t){const e=t.item.metadata.key,a=this.submittingItems.get(e);if(a){"submitted"===this.mapEditItemStatus.get(e)?(this.submittingItems.delete(e),this._isAddOrMoveAdd(a)&&this.submittedAddItems.set(e,a)):(this.mapEditItemStatus.set(e,"mutated"),this.submittingItems.set(e,a))}}setItemStatus(t,e,a){const s=t.item.metadata.key;if("submitting"===e)this.unsubmittedItems.delete(s),this.submittingItems.set(s,t);else if("submitted"===e){if(t){"mutated"===this.mapEditItemStatus.get(s)?(this.submittingItems.delete(s),this._isAddOrMoveAdd(t)&&this.submittedAddItems.set(s,t)):this.mapEditItemStatus.set(s,"submitted")}}else if("unsubmitted"===e){let e;this.submittingItems.delete(s),e=a?{operation:t.operation,item:{data:t.item.data,metadata:{key:t.item.metadata.key,message:a}}}:t,this.unsubmittedItems.set(s,e)}}getUnsubmittedItems(){return this.unsubmittedItems}getSubmittingItems(){return this.submittingItems}getSubmittedAddItems(){return this.submittedAddItems}isEmpty(t){return 0===this.unsubmittedItems.size&&0===this.submittingItems.size&&(!t||0===this.submittedAddItems.size)}getItem(t,e){let a=this.unsubmittedItems.get(t);return a||(a=this.submittingItems.get(t)),e&&!a&&(a=this.submittedAddItems.get(t)),a}isUpdateTransformed(t){return!!this.mapOpTransform.get(t)}getEditItemStatus(t){return this.mapEditItemStatus.get(t)}isSubmittingOrSubmitted(t){return this.submittingItems.has(t)||this.submittedAddItems.has(t)}resetAllUnsubmittedItems(){this._clearAddItemOrder(),this.unsubmittedItems.clear(),this.submittingItems.clear(),this.mapOpTransform.clear()}_clearAddItemOrder(){this.unsubmittedItems.forEach((t,e)=>{this._isAddOrMoveAdd(t)&&this._removeFromAddItemOrder(e)}),this.submittingItems.forEach((t,e)=>{this._isAddOrMoveAdd(t)&&this._removeFromAddItemOrder(e)})}_removeFromAddItemOrder(e){let a=this.addItemOrder.findIndex(a=>t.KeyUtils.equals(a,e));-1!==a&&this.addItemOrder.splice(a,1)}_isAddOrMoveAdd(t){return"add"===t.operation||this._isMoveAdd(t)}_isMoveAdd(t){return"update"===t.operation&&this.isUpdateTransformed(t.item.metadata.key)}getAddItemOrder(){return this.addItemOrder}}class n{constructor(t,e){var a;this.dataProvider=t,this.options=e,this._generateKey=t=>this.customKeyGenerator?this.customKeyGenerator(t):crypto.randomUUID?crypto.randomUUID():([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,t=>(t^crypto.getRandomValues(new Uint8Array(1))[0]&15>>t/4).toString(16)),this.AsyncIterable=(a=class{constructor(t,e){this._parent=t,this._asyncIterator=e,this[Symbol.asyncIterator]=function(){return this._asyncIterator}}},Symbol.asyncIterator,a),this.AsyncIterator=class{constructor(t,e,a){this._parent=t,this._baseIterator=e,this._params=a,this.firstBaseKey=null,this.mergedAddKeySet=new r,this.mergedItemArray=[],this.nextOffset=0,null==this._params&&(this._params={})}_fetchNext(){const t=this._params?.signal;if(t&&t.aborted){const e=t.reason;return Promise.reject(new DOMException(e,"AbortError"))}return new Promise((e,a)=>{if(t){const e=t.reason;t.addEventListener("abort",t=>a(new DOMException(e,"AbortError")))}return e(this._baseIterator.next().then(async t=>{!this.firstBaseKey&&t.value.metadata.length&&(this.firstBaseKey=t.value.metadata[0].key),t.value.fetchParameters&&t.value.fetchParameters.sortCriteria&&(this._parent.lastSortCriteria=t.value.fetchParameters.sortCriteria);const e=t.value.data.map((e,a)=>({data:t.value.data[a],metadata:t.value.metadata[a]}));if(this._parent.totalFilteredRowCount=t.value.totalFilteredRowCount,await this._parent._mergeEdits(e,this.mergedItemArray,this._params.filterCriterion,this._parent.lastSortCriteria,this.mergedAddKeySet,t.done),0===this.nextOffset)for(let t=0;t<this.mergedItemArray.length;t++){const e=this.mergedItemArray[t].metadata.key;if(!this._parent._isItemRemoved(e)){this.firstBaseKey=e;break}}let a=this.mergedItemArray.length-this.nextOffset;for(let t=this.nextOffset;t<this.mergedItemArray.length;t++){const e=this.mergedItemArray[t];this._parent._isItemRemoved(e.metadata.key)&&--a}const s=this._params||{};if((s.size&&a<s.size||null==s.size&&0===a)&&!t.done)return this._fetchNext();const i=[],r=[];let d;for(d=this.nextOffset;d<this.mergedItemArray.length;d++){const t=this.mergedItemArray[d];if(!this._parent._isItemRemoved(t.metadata.key)&&(this.nextOffset=d+1,i.push(t.data),r.push(t.metadata),s.size&&i.length===s.size))break}return{done:t.done&&0===i.length,value:{fetchParameters:this._params,data:i,metadata:r,totalFilteredRowCount:"enabled"===this._params?.includeFilteredRowCount?this._parent.totalFilteredRowCount:null}}}))})}next(){return this._fetchNext()}},this._addEventListeners(t),this.editBuffer=new o,this.lastSortCriteria=null,this.lastIterator=null,this.customKeyGenerator=e?.keyGenerator,this.generatedKeyMap=new Map,this.totalFilteredRowCount=0,this.dataBeforeUpdated=new Map}_fetchByKeysFromBuffer(t){const e=new s,a=new Set;return t.keys.forEach(t=>{const s=this.editBuffer.getItem(t);if(s)switch(s.operation){case"add":case"update":e.set(t,s.item)}else a.add(t)}),{results:e,unresolvedKeys:a}}_compareItem(t,a,s){for(const i of s){let s=e.SortUtils.getNaturalSortComparator();const r="descending"===i.direction?-1:1,d=s(t[i.attribute],a[i.attribute])*r;if(0!==d)return d}return 0}_insertAddEdits(t,e,a,s,i,r){t.forEach(async(t,d)=>{if("add"===t.operation)e&&!e.filter(t.item.data)||this.totalFilteredRowCount++;else{let a=null;if(e)if(this.dataBeforeUpdated.has(d))a=this.dataBeforeUpdated.get(d);else{let t=new Set;t.add(d),a=(await this.dataProvider.fetchByKeys({keys:t})).results.get(d).data,this.dataBeforeUpdated.set(d,a)}"remove"===t.operation?e&&!e.filter(a)||this.totalFilteredRowCount--:"update"===t.operation&&e&&(e.filter(a)&&!e.filter(t.item.data)?this.totalFilteredRowCount--:!e.filter(a)&&e.filter(t.item.data)&&this.totalFilteredRowCount++)}if(("add"===t.operation||"update"===t.operation)&&!i.has(d)&&(!e||e.filter(t.item.data)))if(a&&a.length){let e=!1;for(let r=0;r<s.length;r++)if("update"!==t.operation||this.editBuffer.isUpdateTransformed(d)||d!==s[r].metadata.key||s.splice(r,1),this._compareItem(t.item.data,s[r].data,a)<0){s.splice(r,0,t.item),i.add(d),e=!0;break}!e&&r&&(s.push(t.item),i.add(d))}else if("add"===t.operation||"update"===t.operation&&this.editBuffer.isUpdateTransformed(d)){let e=!0;s.forEach(t=>{d===t.metadata.key||i.has(d)||this._isItemRemoved(t.metadata.key)||(e=!1)}),e?s.push(t.item):s.splice(0,0,t.item),i.add(d)}})}_mergeAddEdits(t,e,a,s,i){this._insertAddEdits(this.editBuffer.getUnsubmittedItems(),t,e,a,s,i),this._insertAddEdits(this.editBuffer.getSubmittingItems(),t,e,a,s,i)}_mergeEdits(t,a,s,i,r,d){let o;s&&(o=s.filter?s:e.FilterFactory.getFilter({filterDef:s,filterOptions:this.options}));for(const e of t){const t=this.editBuffer.getItem(e.metadata.key);t?"remove"===t.operation?a.push(e):"update"!==t.operation||this.editBuffer.isUpdateTransformed(t.item.metadata.key)||o&&!o.filter(t.item.data)||i&&0!==i.length||a.push(t.item):a.push(e)}this._mergeAddEdits(o,i,a,r,d)}async _fetchFromOffset(t){const e=t?.signal;if(e){const t=e.reason;if(e.aborted)throw new DOMException(t,"AbortError");e.addEventListener("abort",()=>{throw new DOMException(t,"AbortError")})}const a=t.offset,s=null==t.size||-1===t.size,i=t.size,r=[],{submitting:d,submitted:o,unsubmitted:n}=this._getEditBufferCounts(),m=n.numAdds,h=m+d.numAdds+o.numAdds;let u,l=[],f=!1,p=0;if(this.editBuffer.isEmpty(!0))return await this.dataProvider.fetchByOffset(t);if(s||a+i>h){const e=n.numRemoves+d.numRemoves,r=n.numMoveAdds+d.numMoveAdds,l=d.numAdds+o.numAdds;let f,I;e>0||r>0||l>0?(f={offset:0},s||(I={size:a+i+e+r+l-Math.max(m-a,0)}),p=Math.max(a-h,0)):m>0&&(f={offset:Math.max(a-m,0)},s||(I={size:i-Math.max(m-a,0)}));const y={...t,...f,...I};u=await this.dataProvider.fetchByOffset(y)}u&&(l=u.results,f=u.done),a<h&&r.push(...this._getAllAdds().slice(a,s?void 0:a+i));for(let t=0;t<l.length&&(s||r.length<i);t++){const e=l[t],a=e.metadata.key;if(!(this.editBuffer.isUpdateTransformed(a)||this._isItemRemoved(a)||this.editBuffer.isSubmittingOrSubmitted(a)))if(p>0)--p;else{const t=this.editBuffer.getItem(a);r.push(t?t.item:e)}}if(!f&&(s||r.length<i)){const e={...t,offset:t.offset+r.length,size:s?t.size:t.size-r.length};let a=await this._fetchFromOffset(e);r.push(...a.results),f=a.done}return{fetchParameters:t,results:r,done:f}}containsKeys(t){const e=this._fetchByKeysFromBuffer(t),a=e.unresolvedKeys,s=new Set;return e.results.forEach((t,e)=>{s.add(e)}),0===a.size?Promise.resolve({containsParameters:t,results:s}):this.dataProvider.containsKeys({attributes:t.attributes,keys:a,scope:t.scope}).then(e=>s.size>0?(e.results.forEach((t,e)=>{s.add(e)}),{containsParameters:t,results:s}):e)}fetchByKeys(t){const e=this._fetchByKeysFromBuffer(t),a=e.unresolvedKeys,s=e.results,i=t?.signal;if(i&&i.aborted){const t=i.reason;return Promise.reject(new DOMException(t,"AbortError"))}return new Promise((e,r)=>{if(i){const t=i.reason;i.addEventListener("abort",e=>r(new DOMException(t,"AbortError")))}return 0===a.size?e({fetchParameters:t,results:s}):e(this.dataProvider.fetchByKeys({attributes:t.attributes,keys:a,scope:t.scope,signal:i}).then(e=>s.size>0?(e.results.forEach((t,e)=>{s.set(e,t)}),{fetchParameters:t,results:s}):e))})}fetchByOffset(t){return this._fetchFromOffset(t)}fetchFirst(t){this.lastSortCriteria=t?t.sortCriteria:null;const e=this.dataProvider.fetchFirst(t)[Symbol.asyncIterator]();return this.lastIterator=new this.AsyncIterator(this,e,t),new this.AsyncIterable(this,this.lastIterator)}getCapability(t){return this.dataProvider.getCapability(t)}_calculateSizeChange(t){let e=0;return t.forEach((t,a)=>{this.editBuffer.getEditItemStatus(a)||("add"===t.operation?++e:"remove"===t.operation&&--e)}),e}_getEditBufferCounts(){return{submitting:this._getCounts(this.editBuffer.getSubmittingItems()),unsubmitted:this._getCounts(this.editBuffer.getUnsubmittedItems()),submitted:{numAdds:this.editBuffer.getSubmittedAddItems().size}}}_getCounts(t){let e=0,a=0,s=0;return t.forEach((t,i)=>{"add"===t.operation?++e:"remove"===t.operation?++a:"update"===t.operation&&this.editBuffer.isUpdateTransformed(i)&&++s}),{numAdds:e,numRemoves:a,numMoveAdds:s}}_getAllAdds(){return this.editBuffer.getAddItemOrder().map(t=>this.editBuffer.getItem(t,!0)?.item)}getTotalSize(){return this.dataProvider.getTotalSize().then(t=>(t>-1&&(t+=this._calculateSizeChange(this.editBuffer.getSubmittingItems()),t+=this._calculateSizeChange(this.editBuffer.getUnsubmittedItems())),t))}isEmpty(){const t=this.editBuffer.getUnsubmittedItems(),e=this.editBuffer.getSubmittingItems();t.forEach((t,e)=>{if("add"===t.operation||"update"===t.operation)return"no"}),e.forEach((t,e)=>{if("add"===t.operation||"update"===t.operation)return"no"});const a=this.dataProvider.isEmpty();return"no"===a&&(t.size>0||e.size>0)?"unknown":a}_isItemRemoved(t){const e=this.editBuffer.getItem(t);return null!=e&&"remove"===e.operation}_addToMergedArrays(e,a,s=null){let i=null;if(this.lastIterator)if(a)i=this._getNextKey(s);else{i=this.lastIterator.firstBaseKey;let a=0!==this.lastIterator.nextOffset;if(this.editBuffer.isUpdateTransformed(e.metadata.key))for(let s=0;s<this.lastIterator.mergedItemArray.length;s++)if(t.KeyUtils.equals(this.lastIterator.mergedItemArray[s].metadata.key,e.metadata.key)){a&&(a=this.lastIterator.nextOffset<=s),this.lastIterator.mergedItemArray.splice(s,1);break}this.lastIterator.mergedItemArray.splice(0,0,e),this.lastIterator.mergedAddKeySet.add(e.metadata.key),this.lastIterator.firstBaseKey=e.metadata.key,a&&this.lastIterator.nextOffset++}return i}_getNextKey(t,e=!1){let a=t;if(this.lastIterator){const s=this.lastIterator.mergedItemArray;let i=this._findKeyInItems(t,s);for(;null!==a&&(e||this._isItemRemoved(a));)e&&(e=!1),a=-1===i||i+1===s.length?null:s[i+1].metadata.key,i++}return a}addItem(t){const a=Object.assign({},t);null===t.metadata.key&&(a.metadata=Object.assign({},t.metadata),a.metadata.key=this._generateKey(t.data)),this.editBuffer.addItem(a);const s=this._addToMergedArrays(a,!1),i={add:{data:[a.data],keys:(new Set).add(a.metadata.key),metadata:[a.metadata],addBeforeKeys:[s],indexes:[0]}},r=new e.DataProviderMutationEvent(i);this.dispatchEvent(r),this._dispatchSubmittableChangeEvent()}_removeFromMergedArrays(e,a){if(this.lastIterator){const s=this.lastIterator.mergedItemArray,i=this.lastIterator.mergedAddKeySet,r=this._findKeyInItems(e,s);if(-1!==r){(a||i.has(e))&&(s.splice(r,1),i.delete(e));for(let t=this.lastIterator.nextOffset-1;t>=0;t--){let e=s[t]?.metadata.key;if(null!=e&&!this._isItemRemoved(e))break;this.lastIterator.nextOffset=t}if(t.KeyUtils.equals(this.lastIterator.firstBaseKey,e)&&(this.lastIterator.firstBaseKey=null,s.length>r))for(let t=r;t<s.length;t++){const e=s[t].metadata.key;if(!this._isItemRemoved(e)){this.lastIterator.firstBaseKey=e;break}}}}}removeItem(t){const a=t.metadata.key;this.lastIterator&&null!==this.lastIterator.firstBaseKey&&this.lastIterator.firstBaseKey===a&&(this.lastIterator.firstBaseKey=this._getNextKey(t.metadata.key,!0)),this.editBuffer.removeItem(t),this._removeFromMergedArrays(t.metadata.key,!1);const s={remove:{data:t.data?[t.data]:null,keys:(new Set).add(t.metadata.key),metadata:[t.metadata]}},i=new e.DataProviderMutationEvent(s);this.dispatchEvent(i),this._dispatchSubmittableChangeEvent()}updateItem(t){this.editBuffer.updateItem(t);const a={update:{data:[t.data],keys:(new Set).add(t.metadata.key),metadata:[t.metadata]}},s=new e.DataProviderMutationEvent(a);this.dispatchEvent(s),this._dispatchSubmittableChangeEvent()}getSubmittableItems(){const t=this.editBuffer.getUnsubmittedItems(),e=this.editBuffer.getSubmittingItems(),a=[];return t.forEach((t,s)=>{e.has(s)||a.push(t)}),a}resetAllUnsubmittedItems(){this.editBuffer.resetAllUnsubmittedItems(),this._dispatchSubmittableChangeEvent(),this.dispatchEvent(new e.DataProviderRefreshEvent)}_addEventDetail(t,e,a,s){null==t[e]&&(t[e]="add"===e?{data:[],keys:new Set,metadata:[],addBeforeKeys:[]}:{data:[],keys:new Set,metadata:[]}),t[e].keys.add(a.metadata.key),t[e].data.push(a.data),t[e].metadata.push(a.metadata),"add"===e&&t[e].addBeforeKeys.push(s)}resetUnsubmittedItem(t){const a=this.editBuffer.getUnsubmittedItems(),i=new Set,r=new s,d=a.get(t);d&&(i.add(t),r.set(t,d),a.delete(t)),this._dispatchSubmittableChangeEvent(),this.dataProvider.fetchByKeys({keys:i}).then(t=>{const a={};let s;r.forEach((e,i)=>{if("add"===e.operation)this._removeFromMergedArrays(e.item.metadata.key,!1),this._addEventDetail(a,"remove",e.item);else if("remove"===e.operation){if(s=t.results.get(i),s){let t=null;if(this.lastIterator){const e=this.lastIterator.mergedItemArray,a=this._findKeyInItems(i,e);if(-1!==a)for(let s=a+1;s<e.length;s++)if(!this._isItemRemoved(e[s].metadata.key)){t=e[s].metadata.key;break}}this._addEventDetail(a,"add",s,t)}}else s=t.results.get(i),s?this._addEventDetail(a,"update",s):this._addEventDetail(a,"remove",e.item)}),this.dispatchEvent(new e.DataProviderMutationEvent(a))})}setItemStatus(t,e,a,s){t&&(s&&this.generatedKeyMap.set(s,t.item.metadata.key),this.editBuffer.setItemStatus(t,e,a),this._dispatchSubmittableChangeEvent())}_dispatchSubmittableChangeEvent(){const t=this.getSubmittableItems(),e=new i.BufferingDataProviderSubmittableChangeEvent(t);this.dispatchEvent(e)}_findKeyInMetadata(e,a){if(a)for(let s=0;s<a.length;s++)if(t.KeyUtils.equals(e,a[s].key))return s;return-1}_findKeyInItems(e,a){if(a)for(let s=0;s<a.length;s++)if(t.KeyUtils.equals(e,a[s].metadata.key))return s;return-1}_initDetailProp(t,e,a,s){t[a]&&(e[a]=s)}_initDetail(t,e,a,s=!1){a?(this._initDetailProp(t,e,"data",[]),this._initDetailProp(t,e,"metadata",[]),s&&this._initDetailProp(t,e,"addBeforeKeys",[]),this._initDetailProp(t,e,"indexes",[]),this._initDetailProp(t,e,"parentKeys",[])):(this._initDetailProp(t,e,"data",t.data),this._initDetailProp(t,e,"metadata",t.metadata),s&&this._initDetailProp(t,e,"addBeforeKeys",t.addBeforeKeys),this._initDetailProp(t,e,"indexes",t.indexes),this._initDetailProp(t,e,"parentKeys",t.parentKeys))}_initDetails(t,e,a){t.add&&(e.add={keys:new Set},this._initDetail(t.add,e.add,a,!0)),t.remove&&(e.remove={keys:new Set},this._initDetail(t.remove,e.remove,a)),t.update&&(e.update={keys:new Set},this._initDetail(t.update,e.update,a))}_pushDetailProp(t,e,a,s){t[a]&&e[a].push(t[a][s])}_pushDetail(t,e,a){if(a.keys.add(t),e.metadata){const s=this._findKeyInMetadata(t,e.metadata);s>-1&&(this._pushDetailProp(e,a,"data",s),this._pushDetailProp(e,a,"metadata",s),e.addBeforeKeys&&0!==e.addBeforeKeys.length&&this._pushDetailProp(e,a,"addBeforeKeys",s),e.indexes&&0!==e.indexes.length&&this._pushDetailProp(e,a,"indexes",s),this._pushDetailProp(e,a,"parentKeys",s))}}_isSkipItem(t,e,a){let s=null!=e.get(t);if(!s){const e=a.get(t);s=e&&"remove"===e.operation}return s}_isSortFieldUpdated(t,e){let a=!1;if(this.lastIterator&&this.lastSortCriteria&&this.lastSortCriteria.length){const s=this._findKeyInItems(t,this.lastIterator.mergedItemArray);if(s<0)return!1;const i=[];let r=0;if(this.lastIterator&&this.lastSortCriteria)for(const t of this.lastSortCriteria)i[r++]=t.attribute;for(const r of i){const i=this._findKeyInMetadata(t,e.metadata);this.lastIterator.mergedItemArray[s][r]!==e.data[i]&&(a=!0)}}return a}_getOperationDetails(t,e,a){if(t&&(t.add||t.remove||t.update)){let e={};const a=this.editBuffer.getSubmittingItems(),s=this.editBuffer.getUnsubmittedItems();if(0===a.size&&0===s.size)e=t;else{let i;this._initDetails(t,e,!0),this._processAdd(e,t,a,s),t.remove&&t.remove.keys.forEach(r=>{i=this._isSkipItem(r,a,s),i||this._pushDetail(r,t.remove,e.remove);const d=s.get(r);!d||"remove"!==d.operation&&"update"!==d.operation||s.delete(r)}),t.update&&t.update.keys.forEach(r=>{i=this._isSkipItem(r,a,s),i||this._pushDetail(r,t.update,e.update)})}return e}return t}_processAdd(t,e,a,s){e.add&&(t.add=e.add)}_handleRefreshEvent(t){this.dataBeforeUpdated=new Map;const e=this.editBuffer.getUnsubmittedItems(),a=new Set;e.forEach(t=>{"remove"!==t.operation&&"update"!==t.operation||a.add(t.item.metadata.key)}),a.size>0?this.dataProvider.fetchByKeys({keys:a}).then(s=>{s.results.forEach((t,e)=>{a.delete(e)}),a.forEach(t=>{e.delete(t)}),this.dispatchEvent(t)}):this.dispatchEvent(t)}_cleanUpSubmittedItem(t,e){const a=this.editBuffer.getSubmittingItems().get(e);a&&this.editBuffer.setItemMutated(a)}_handleMutateEvent(t){this.dataBeforeUpdated=new Map;const a=t.detail.add;a&&a.metadata&&a.data&&a.metadata.forEach((t,e)=>{let s;if(a.addBeforeKeys&&void 0!==a.addBeforeKeys[e])s=this._addToMergedArrays({metadata:a.metadata[e],data:a.data[e]},!0,a.addBeforeKeys[e]),a.addBeforeKeys[e]&&!s&&this.lastIterator&&this.lastIterator.mergedItemArray&&this.lastIterator.mergedItemArray.splice(this.lastIterator.mergedItemArray.length,0,{data:a.data[e],metadata:a.metadata[e]}),a.addBeforeKeys[e]=s;else if(a.indexes&&a.indexes[e]){let t=a.indexes[e];for(;this.lastIterator&&t<this.lastIterator.mergedItemArray.length&&this._isItemRemoved(this.lastIterator.mergedItemArray[t].metadata.key);)t++;this.lastIterator&&t>=this.lastIterator.mergedItemArray.length&&this.lastIterator.mergedItemArray.splice(this.lastIterator.mergedItemArray.length,0,{data:a.data[e],metadata:a.metadata[e]})}this._cleanUpSubmittedItem("add",t.key)});const s=t.detail.remove;s&&s.keys.forEach(t=>{this._removeFromMergedArrays(t,!0),this._cleanUpSubmittedItem("remove",t)});const i=[],r=[],d=t.detail.update;d&&d.data.forEach((t,e)=>{r[e]=this._isSortFieldUpdated(d.metadata[e].key,d),r[e]&&(this._removeFromMergedArrays(d.metadata[e].key,!0),i[e]=this._addToMergedArrays({data:t,metadata:d.metadata[e]},!0),i[e]||this.lastIterator&&this.lastIterator.mergedItemArray&&this.lastIterator.mergedItemArray.splice(this.lastIterator.mergedItemArray.length,0,{data:t,metadata:d.metadata[e]})),this._cleanUpSubmittedItem("remove",d.metadata[e].key)});const o=this._getOperationDetails(t.detail,i,r);this._checkGeneratedKeys(o),this.dispatchEvent(new e.DataProviderMutationEvent(o))}_checkGeneratedKeys(t){const e=(e,a,s)=>{if(this.generatedKeyMap.has(e)){const i=this.generatedKeyMap.get(e);if((!t.remove||!t.remove.keys?.has(e))&&(t.remove||(t.remove={keys:new Set}),t.remove.keys.add(i),a)){const t=this.lastIterator?.mergedItemArray?.[0]?.metadata?.key;null!==t&&(a.addBeforeKeys||(a.addBeforeKeys=[]),a.addBeforeKeys[s]=t)}}};if(t.add?.keys){let a=0;t.add.keys.forEach(s=>{e(s,t.add,a),a++})}}_addEventListeners(t){t[n._ADDEVENTLISTENER](n._REFRESH,this._handleRefreshEvent.bind(this)),t[n._ADDEVENTLISTENER](n._MUTATE,this._handleMutateEvent.bind(this))}}return n._REFRESH="refresh",n._MUTATE="mutate",n._ADDEVENTLISTENER="addEventListener",a.EventTargetMixin.applyMixin(n),t._registerLegacyNamespaceProp("BufferingDataProvider",n),n});
//# sourceMappingURL=ojbufferingdataprovider.js.map