define(["require","exports","ojs/ojmutablearraydataprovider","knockout","../common/dataAccessService","../common/localizedConstants","../common/scriptExecutionModels","../utilities","../common/messageService","ojs/ojmodule-element-utils","signals","ojs/ojdataprovider","../common/filterModels","./collectionFiltersModule","ojs/ojcontext","ojs/ojbutton","ojs/ojcheckboxset","ojs/ojknockout","ojs/ojinputtext","ojs/ojlabel","ojs/ojselectcombobox","ojs/ojmessage","ojs/ojmessages","ojs/ojselector","ojs/ojnavigationlist","ojs/ojdialog","ojs/ojmenu","ojs/ojoption"],(function(require,e,t,i,n,s,l,o,a,c,r,d,h,u,g){"use strict";let v;return class{constructor(e){this.msgPos={my:{vertical:"top",horizontal:"end"},at:{vertical:"top",horizontal:"end"},of:"window"},this.messageHandlersField=new Map,this.filterUITexts=new h.FilterUITexts,this.saveButtonDisable=i.observable(!0),this.isSaving=i.observable(!1),this.currentCollectionFiltersMap=new Map,this.allConnectionNames=i.observableArray(),this.connectionNamesDP=new t(this.allConnectionNames(),{keyAttributes:"value"}),this.connectionNameValue=i.observable(""),this.connectionNameStatic="",this.connectionNamePure=i.observable(""),this.connectionUniqueId=-1,this.connectionScope=i.observable(l.ConfigurationTarget.Global),this.connectionScopeString=i.computed((()=>{switch(this.connectionScope()){case l.ConfigurationTarget.Workspace:return s.LocalizedConstants.Instance.workspace;case l.ConfigurationTarget.WorkspaceFolder:return s.LocalizedConstants.Instance.folder;default:return s.LocalizedConstants.Instance.user}})),this.profileWorkspaceFolder=i.observable(void 0),this.collectionModuleName="collectionFiltersModule",this.selectedTab=i.observable(l.FilterCollectionType.Connection).extend({notify:"always"}),this.collectionsModuleCache=new Map,this.collectionOptions=i.observableArray([{value:l.FilterCollectionType.Connection,label:this.filterUITexts.ctConnection,enabledIcon:"",unsavedIcon:""},{value:l.FilterCollectionType.Tables,label:this.filterUITexts.ctTables,enabledIcon:"",unsavedIcon:""},{value:l.FilterCollectionType.Views,label:this.filterUITexts.ctViews,enabledIcon:"",unsavedIcon:""},{value:l.FilterCollectionType.Procedures,label:this.filterUITexts.ctProcedures,enabledIcon:"",unsavedIcon:""},{value:l.FilterCollectionType.Functions,label:this.filterUITexts.ctFunctions,enabledIcon:"",unsavedIcon:""},{value:l.FilterCollectionType.Packages,label:this.filterUITexts.ctPackages,enabledIcon:"",unsavedIcon:""},{value:l.FilterCollectionType.Sequences,label:this.filterUITexts.ctSequences,enabledIcon:"",unsavedIcon:""},{value:l.FilterCollectionType.Synonyms,label:this.filterUITexts.ctSynonyms,enabledIcon:"",unsavedIcon:""},{value:l.FilterCollectionType.Triggers,label:this.filterUITexts.ctTriggers,enabledIcon:"",unsavedIcon:""},{value:l.FilterCollectionType.OtherUsers,label:this.filterUITexts.ctOtherUsers,enabledIcon:"",unsavedIcon:""}]),this.tabDP=new t(this.collectionOptions(),{keyAttributes:"value"}),this.collectionToConstantDict=new Map([[l.FilterCollectionType.Connection,this.filterUITexts.ctConnection],[l.FilterCollectionType.Tables,this.filterUITexts.ctTables],[l.FilterCollectionType.Views,this.filterUITexts.ctViews],[l.FilterCollectionType.Procedures,this.filterUITexts.ctProcedures],[l.FilterCollectionType.Functions,this.filterUITexts.ctFunctions],[l.FilterCollectionType.Packages,this.filterUITexts.ctPackages],[l.FilterCollectionType.Sequences,this.filterUITexts.ctSequences],[l.FilterCollectionType.Synonyms,this.filterUITexts.ctSynonyms],[l.FilterCollectionType.Triggers,this.filterUITexts.ctTriggers],[l.FilterCollectionType.OtherUsers,this.filterUITexts.ctOtherUsers]]),this.infoSignalToConfig=new r.Signal,this.infoSignalFromConfig=new r.Signal,this.settingsConfig=c.createConfig({name:"configSettings",params:{infoSignalToConfig:this.infoSignalToConfig,infoSignalFromConfig:this.infoSignalFromConfig,editable:i.observable(!1),profileConfigTarget:this.connectionScope,profileWorkspaceFolder:this.profileWorkspaceFolder}}).then((e=>({view:e.view,viewModel:e.viewModel,cleanupMode:"none"}))),this.enableAllExplorerValue=h.FilterEnableAll.EnableAllExplorer,this.disableAllExplorerValue=h.FilterEnableAll.DisableAllExplorer,this.enableAllIntellisenseValue=h.FilterEnableAll.EnableAllIntellisense,this.disableAllIntellisenseValue=h.FilterEnableAll.DisableAllIntellisense,this.onThemeChanged=()=>{n.DataAccessService.instance.logInfo("Theme Changed"),o.setContrast()},this.onConfigChanged=e=>{const t=e.data;n.DataAccessService.instance.updatedConfig(t)},this.onEnableMenuAction=e=>{e.detail&&null!==e.detail.selectedValue&&void 0!==e.detail.selectedValue&&this.doEnableDisableAll(e.detail.selectedValue)},this.disableDeleteAllButton=i.observable(!1),this.onDeleteAll=()=>{document.getElementById("deleteAllDialog").open()},this.onYesDeleteAll=()=>{this.collectionsModuleCache.clear(),this.initCollectionFilters(),this.clearCollectionOptionIcons(),this.updateModuleConfig(),this.saveButtonDisable(!0),this.isSaving(!0),this.sendSaveFiltersRequest([]),this.disableDeleteAllButton(!0),document.getElementById("deleteAllDialog").close()},this.onCancelDeleteAll=()=>{document.getElementById("deleteAllDialog").close()},this.onSave=()=>{this.saveButtonDisable(!0),this.isSaving(!0),this.sendSaveFiltersRequest(this.getActiveSettings())},this.onAddFilterSetting=e=>{this.getCurrentModule()?.doAddFilterSetting()},this.haveInvalidFilters=i.observable(!1),this.onConnectionNameChanged=e=>{if(this.connectionNameStatic!=e.detail.value){for(let[t,i]of this.currentCollectionFiltersMap)if(i.hasChanged)return void this.sendPromptRequest(e.detail.value,e.detail.previousValue);this.changeConnection(e.detail.value)}},this.onTabSelectionChanged=e=>{if(void 0!==e.detail.value){const t=e.detail.value;this.updateModuleConfig(),this.modifyButtons(t)}},this.moduleConfig=i.observable({view:[],viewModel:null,cleanupMode:"none"}),this.onClearPageEvent=e=>{try{n.DataAccessService.instance.logInfo("OnclearPageEvent:"+JSON.stringify(e));const t=e.data;this.handleClearEvent(t)}catch(e){n.DataAccessService.instance.logError(e),a.MessagesService.getinstance().ShowMessage(s.LocalizedConstants.Instance.unableToClear)}},this.handleClearEvent=e=>{try{n.DataAccessService.instance.URI=e.uri,n.DataAccessService.instance.windowUri=e.windowUri,n.DataAccessService.instance.profileName=e.profileName,n.DataAccessService.instance.connectionUniqueId=e.connectionUniqueId,n.DataAccessService.instance.configurationTarget=e.configurationTarget,n.DataAccessService.instance.workspaceFolderName=e.workspaceFolderName,n.DataAccessService.instance.workspaceFolderIndex=e.workspaceFolderIndex,this.initialize()}catch(e){n.DataAccessService.instance.logError(e),a.MessagesService.getinstance().ShowMessage(s.LocalizedConstants.Instance.unableToClear)}},this.focusLastValueElementIfEmpty=e=>{e&&e.detail&&e.detail.viewModel?.focusLastValueElementIfEmpty()},v=this,this.messageHandlers.set(l.MessageName.themeChanged,this.onThemeChanged),this.messageHandlers.set(l.MessageName.clearPageEvent,v.onClearPageEvent),this.messageHandlers.set(l.MessageName.odtConfigChanged,(e=>{n.DataAccessService.instance.logInfo("handling odtConfigChanged"),this.onConfigChanged(e)})),this.messageHandlers.set(l.MessageName.saveFilterSettingsResponse,(e=>{this.handleSaveFilterSettingsResponse(e)})),this.messageHandlers.set(l.MessageName.getFilterSettingsResponse,(e=>{this.handleGetFilterSettingsResponse(e)})),this.messageHandlers.set(l.MessageName.filterConnChangePromptResponse,(e=>{this.handlePromptResponse(e)})),n.DataAccessService.instance.subscribe((e=>{if(e&&this.messageHandlers.get(e.type)){const t=this.messageHandlers.get(e.type);t&&t(e)}else n.DataAccessService.instance.logError(`Could not find handler for message ${e.type}`)})),n.DataAccessService.instance.logInfo("Fetching Localized resources "),n.DataAccessService.instance.getLocalizedData().done((e=>{n.DataAccessService.instance.logInfo("Fetched localized resources."),s.LocalizedConstants.Instance.Configure(e),this.filterUITexts=new h.FilterUITexts})).fail((e=>{n.DataAccessService.instance.logError("Localized resources "+JSON.stringify(e))})),g.getPageContext().getBusyContext().whenReady().then((()=>{window.onresize=v.adjustFilterContainerHeight})),this.initialize(),o.setContrast()}get messagesDataProvider(){return a.MessagesService.getinstance().messagesDataproviderField}get messageHandlers(){return this.messageHandlersField}set messageHandlers(e){this.messageHandlersField=e}doEnableDisableAll(e){this.collectionOptions().forEach((t=>{let i=this.currentCollectionFiltersMap.get(t.value);if(i){switch(e){case this.enableAllExplorerValue:!0!==i.enableFiltersForExplorer&&(i.enableFiltersForExplorer=!0);break;case this.disableAllExplorerValue:!1!==i.enableFiltersForExplorer&&(i.enableFiltersForExplorer=!1);break;case this.enableAllIntellisenseValue:!0!==i.enableFiltersForIntellisense&&(i.enableFiltersForIntellisense=!0);break;case this.disableAllIntellisenseValue:!1!==i.enableFiltersForIntellisense&&(i.enableFiltersForIntellisense=!1)}this.currentCollectionFiltersMap.set(i.collectionType,i)}})),this.collectionsModuleCache.forEach(((t,i,n)=>{t.viewModel.updateEnableDisableAll(e)}))}changeConnection(e){this.connectionNameStatic=e,this.connectionNameValue(e),this.allConnectionNames().forEach((({value:t,label:i,pureName:n,configTarget:s,workspaceFolder:l,uniqueId:o})=>{e===t&&(this.connectionNamePure(n),this.connectionScope(s),this.profileWorkspaceFolder(l),this.connectionUniqueId=o)})),this.initialize(this.connectionNamePure(),this.connectionScope(),this.profileWorkspaceFolder(),this.connectionUniqueId)}sendPromptRequest(e,t){n.DataAccessService.instance.logInfo("Sending prompt request from filters page");const i=new l.MessageBase;i.type=l.MessageName.filterConnChangePromptRequest;const s=new l.ConnChangePromptRequest;s.ownerUri=n.DataAccessService.instance.URI,s.executionId=n.DataAccessService.instance.currentExecutionId,s.windowUri=n.DataAccessService.instance.windowUri,s.currentConnection=t,s.newConnection=e,i.data=s;try{n.DataAccessService.instance.send(i),n.DataAccessService.instance.logInfo("Placed fitlerConnChangePromptRequest")}catch(e){n.DataAccessService.instance.logError(e)}}handlePromptResponse(e){n.DataAccessService.instance.logInfo("Received prompt response for connection name change");try{const t=e.data;t&&t.changeConnection?this.changeConnection(t.newConnection):this.connectionNameValue(t?t.currentConnection:this.connectionNameStatic)}catch(e){n.DataAccessService.instance.logError(e)}}handleChangesFromCollection(e){try{v.currentCollectionFiltersMap.set(e.collectionType,e),v.modifyButtons(null,e.filters)}catch(e){n.DataAccessService.instance.logError(e)}}invalidFilterValues(e,t){if(!e||0==e.length)return!1;for(let t=0;t<e.length;++t)if(this.isFilterValueInvalid(e[t]))return!0;return!1}isFilterValueInvalid(e){return e.property!==l.FilterPropertiesType.VisibleCollections&&(e.condition==l.FilterConditionsType.Between||e.condition==l.FilterConditionsType.NotBetween?this.isValueInvalid(e.upperLimit)||this.isValueInvalid(e.lowerLimit):this.isValueInvalid(e.value))}isValueInvalid(e){return null==e||""===e}handleSaveFilterSettingsResponse(e){n.DataAccessService.instance.logInfo("Received SaveFilterSettingsResponse");try{const t=e.data;if(t){if(a.MessagesService.getinstance().ClearAll(),t.success){this.clearCollectionOptionIcons(),this.updateCollectionFilters(t.collectionFilterSettings,!1),this.selectedTab.notifySubscribers();for(let[e,t]of this.currentCollectionFiltersMap)t&&(t.isValid=!0,t.hasChanged=!1);this.connectionNamePure(t.profileName),this.connectionNameStatic=t.uniqueProfileName,this.connectionNameValue(t.uniqueProfileName),this.connectionScope(t.configurationTarget),this.profileWorkspaceFolder(t.workspaceFolder),this.connectionUniqueId=t.connectionUniqueId,this.endSaveFilters()}a.MessagesService.getinstance().ShowMessage(t.message)}this.saveButtonDisable(t&&t.success)}catch(e){n.DataAccessService.instance.logError(e),this.saveButtonDisable(!1)}finally{this.isSaving(!1)}n.DataAccessService.instance.logInfo("End updating filters")}handleGetFilterSettingsResponse(e){n.DataAccessService.instance.logInfo("Received GetFilterSettingsResponse");try{const t=e.data;if(!t.success)return;let i=t.profileNamesInfo;this.allConnectionNames.removeAll(),i.length>0&&i.forEach((([e,t,i,n,s])=>{this.allConnectionNames.push({value:t,label:e,pureName:e,configTarget:i,workspaceFolder:n,uniqueId:s})})),this.connectionNamesDP.data=this.allConnectionNames(),this.connectionNamePure(t.profileName),this.connectionNameStatic=t.uniqueProfileName,this.connectionNameValue(t.uniqueProfileName),this.connectionScope(t.configurationTarget),this.connectionUniqueId=t.connectionUniqueId,this.profileWorkspaceFolder(t.workspaceFolder),this.updateCollectionFilters(t.collectionFilterSettings),this.saveButtonDisable(!0),this.selectedTab()==t.selectedCollection?this.updateModuleConfig():this.selectedTab(t.selectedCollection)}catch(e){n.DataAccessService.instance.logError(e)}}getFilterSettings(e,t,i,s){a.MessagesService.getinstance().ClearAll();const o=new l.MessageBase;o.type=l.MessageName.getFilterSettingsRequest;const c=new l.GetFilterSettingsRequest;c.executionId=n.DataAccessService.instance.currentExecutionId,c.ownerUri=n.DataAccessService.instance.URI,c.windowUri=n.DataAccessService.instance.windowUri,c.profileName=null!=e?e:n.DataAccessService.instance.profileName,c.configurationTarget=null!=t?t:n.DataAccessService.instance.configurationTarget,c.workspaceFolder=null!=i?i:{uri:void 0,name:n.DataAccessService.instance.workspaceFolderName,index:n.DataAccessService.instance.workspaceFolderIndex},c.connectionUniqueId=null!=s?s:n.DataAccessService.instance.connectionUniqueId,o.data=c;try{n.DataAccessService.instance.send(o),n.DataAccessService.instance.logInfo("Successfully placed get filter settings request ")}catch(e){n.DataAccessService.instance.logError(e)}}sendSaveFiltersRequest(e){n.DataAccessService.instance.logInfo("Sending save request for filter settings");const t=new l.MessageBase;t.type=l.MessageName.saveFilterSettingsRequest;const i=new l.SaveFilterSettingsRequest;i.ownerUri=n.DataAccessService.instance.URI,i.executionId=n.DataAccessService.instance.currentExecutionId,i.windowUri=n.DataAccessService.instance.windowUri,i.collectionFilterSettings=e,i.profileName=this.connectionNamePure(),i.configurationTarget=this.connectionScope(),i.workspaceFolder=this.profileWorkspaceFolder(),i.uniqueProfileName=this.connectionNameValue(),i.connectionUniqueId=this.connectionUniqueId;let s=JSON.parse(JSON.stringify(i));t.data=s;try{n.DataAccessService.instance.send(t),n.DataAccessService.instance.logInfo("Placed SaveFilterSettingsRequest")}catch(e){n.DataAccessService.instance.logError(e)}}updateCollectionFilters(e,t=!0){try{t&&this.collectionsModuleCache&&this.collectionsModuleCache.clear();for(let t=0;t<e.length;t++){let i=e[t],n=this.currentCollectionFiltersMap.get(i.collectionType);n?(n.enableFiltersForExplorer=i.enableFiltersForExplorer,n.enableFiltersForIntellisense=i.enableFiltersForIntellisense,i.collectionType!==l.FilterCollectionType.Connection&&(n.overrideConnectionFilter=i.overrideConnectionFilter),n.match=i.match,n.filters=i.filters,n.collectionName=i.collectionName,n.collectionType=i.collectionType,n.id=u.getModuleName(i.collectionType)):n=new l.CollectionFilterInfo(i.collectionType,i.collectionName,i.enableFiltersForExplorer,i.enableFiltersForIntellisense,i.overrideConnectionFilter,i.match,i.filters,u.getModuleName(i.collectionType)),this.currentCollectionFiltersMap.set(i.collectionType,n),i.filters.length>0&&(i.enableFiltersForExplorer||i.enableFiltersForIntellisense)&&this.setCollectionEnabled(i.collectionType)}this.tabDP.data=this.collectionOptions(),this.tabDP.dispatchEvent(new d.DataProviderRefreshEvent),this.modifyButtons()}catch(e){n.DataAccessService.instance.logError(e)}}modifyButtons(e,t){let i=e||this.selectedTab(),n=this.currentCollectionFiltersMap.get(i),s=t||n?.filters;s&&this.haveInvalidFilters(this.invalidFilterValues(s,i));let l=!0,o=!1;this.haveInvalidFilters()?n.isValid=l=!1:n.isValid=!0;let a=!1;for(let[e,t]of this.currentCollectionFiltersMap)if(l=l&&t?.isValid,o=o||t?.hasChanged,!a&&t){let e=t.filters;e&&e.length>0&&!this.isFilterValueInvalid(e[0])&&(a=!0)}this.disableDeleteAllButton(!a),this.saveButtonDisable(!o)}endSaveFilters(){this.isSaving(!1),this.collectionsModuleCache.forEach(((e,t)=>{e&&e.viewModel?.onFilterSaveToCollection(t)}))}getActiveSettings(){let e=[];try{this.currentCollectionFiltersMap.forEach(((t,i,n)=>{t.filters=this.removeInvalidFilters(i),e.push(t)}))}catch(e){n.DataAccessService.instance.logError(e)}return e}removeInvalidFilters(e){let t=[],i=this.currentCollectionFiltersMap.get(e)?.filters;try{i&&i.forEach(((i,n)=>{this.isFilterValueInvalid(i)?e==this.selectedTab()?this.getCurrentModule().removeFilter(i.id):this.collectionsModuleCache.delete(e):t.push(i)}))}catch(e){n.DataAccessService.instance.logError(e),i&&(t=i)}return t}initCollectionFilters(){this.currentCollectionFiltersMap.clear(),this.collectionOptions().forEach((e=>{const t=new l.CollectionFilterInfo(e.value,e.label,!0,!0,!1,l.FilterMatch.All,[],u.getModuleName(e.value));this.currentCollectionFiltersMap.set(e.value,t)}))}clearCollectionOptionIcons(){this.collectionOptions().forEach((e=>{e.unsavedIcon="",e.enabledIcon=""}))}setCollectionEnabled(e){this.collectionOptions().forEach((t=>{t.value===e&&(t.enabledIcon="collectionFilterEnabledIcon")}))}getCurrentModule(){return this.collectionsModuleCache.get(this.selectedTab())?.viewModel}async updateModuleConfig(){let e=this.selectedTab();try{if(!this.collectionsModuleCache.has(e)){let t=this.currentCollectionFiltersMap.get(e);t||(t=new l.CollectionFilterInfo(e,this.collectionToConstantDict.get(e),!0,!0,!1,l.FilterMatch.All,[],u.getModuleName(e)));let i=new h.CollectionModuleParams;i.changesSignalFromCollection=this.handleChangesFromCollection,i.adjustFilterContainerHeight=this.adjustFilterContainerHeight,i.connectionName=this.connectionNameValue(),i.collFilter=t;let n=await c.createConfig({name:this.collectionModuleName,params:i});n&&(this.collectionsModuleCache.set(e,{view:n.view,viewModel:n.viewModel,cleanupMode:"none"}),n.viewModel?.initialize(t))}}catch(e){n.DataAccessService.instance.logError(e)}this.moduleConfig(this.collectionsModuleCache.get(e))}initialize(e,t,i,s){n.DataAccessService.instance.logInfo("Start initializing filterSettingsModule"),a.MessagesService.getinstance().ClearAll(),this.initCollectionFilters(),this.clearCollectionOptionIcons(),this.getFilterSettings(e,t,i,s),n.DataAccessService.instance.logInfo("End initializing")}adjustFilterContainerHeight(){let e=document.getElementById("filtersBody")?.clientHeight,t=document.getElementById(v.getCurrentModule()?.moduleId)?.clientHeight;e&&t&&v.getCurrentModule().containerHeight({"max-height":e-t})}}}));