define(["require","exports","knockout","./scriptExecutionModels","./localizedConstants","./dataAccessService"],(function(require,t,e,s,a,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.configSaveConfirmData=t.configProfileData=t.configSignalType=t.PagingModel=t.ModulePage=t.ResultArguments=t.CustomModuleConfig=t.PopUpDialogParams=t.PLSQLDataTypes10G=t.ParametersUIMode=t.CodeObjectOutPutUIParams=t.ParametersUIParams=t.Severity=t.ODTUINotification=t.CustomEventEmitter=t.DataGridModel=t.ScrollEventArgs=t.QueryMessage=t.SQLStatement=void 0;t.SQLStatement=class{constructor(){this.prePromptText="",this.prompt="",this.firstLine="",this.remainderLines=""}constructMessage(t){var e="SQL>",s=t.split("\n"),a=s[0].indexOf(e);if(this.prompt=s[0].substring(0,a+4),this.firstLine=s[0].substring(a+4),s.length>1)for(var i=1;i<s.length-1;i++)1==i?this.remainderLines=s[i]+"\n":this.remainderLines+=s[i]+"\n"}};class n{constructor(t,e,a,i="",n=!1){this.messageType=t,this.content=e,this.queryType=a,this.sqlText=i,this.statement=n,this.dataSourceType=s.DataSourceType.Message,this.queryType=a,this.statement=n}get displaySQL(){return`SQL: ${this.sqlText}`}get message(){return this.content}get isError(){return this.messageType===n.Error}get isControlMessage(){return!this.sqlText||""===this.sqlText}}t.QueryMessage=n,n.Message=0,n.Error=1;t.ScrollEventArgs=class{constructor(t,e,s){this.scrollHeight=t,this.scrollTop=e,this.clientHeight=s}};class o{constructor(t){this.randomIndex=0,this.fetchingCompleted=!1,this.MaxRowsCount=0,this.AllRowsFetched=!0,this.dataChanged=new r,this.selectionChanged=new r,this.fetchingRows=new r,this.selection=new Set,this.dataSourceType=s.DataSourceType.QueryResult,this.rows=e.observableArray([]),this.defaultSelection=!1,this.update(t)}get startIndex(){return this.startIndexField}set startIndex(t){this.startIndexField=t}get endIndex(){return this.endIndexField}set endIndex(t){this.endIndexField=t}get displayColumns(){const t=this.columns[this.columns.length-1],e=[];return this.columns.forEach((s=>{s.field!==t.field&&e.push(s)})),e}static sortFunction(t){return function(e,s){try{return Number(e[t])-Number(s[t])}catch(t){return 0}}}getSelection(){const t=Array.from(this.selection);return t.sort(((t,e)=>t-e)),t}onDataChanged(t){this.dataChanged.on("dataChanged",t)}onSelectionChanged(t){this.selectionChanged.on(o.ON_SELECTION_CHANGED_EVENT,t)}addOnFetchingRowsHandler(t){this.fetchingRows.on(o.ON_FETCHING_ROWS_EVENT,t)}updateOnDataFetchedEvent(t){i.DataAccessService.instance.logInfo("DataGridModel.updateOnDataFetchedEvent - DataFetchedEvent received"),this.MaxRowsCount=t.totalRows,this.AllRowsFetched=t.allRowsFetched,this.fetchingCompleted=!0,this.dataChanged.emit("dataChanged")}updateOnFetchingRows(){i.DataAccessService.instance.logInfo("DataGridModel.updateOnFetchingRows - FetchingRowsEvent received"),this.fetchingRows.emit(o.ON_FETCHING_ROWS_EVENT)}update(t){const a=t;this.rowNumColumnName=a.rowNumColumName,this.executionId=a.executionId,this.queryId=a.queryId,this.bindVariableId=a.bindVariableId,this.bindVariableName=a.bindVariableName,this.isImplicitRefCursor=a.isImplicitRefCursor,this.queryResultId=a.queryResultId,this.startIndex=a.startIndex,this.endIndex=a.endIndex,this.columnsToDisplayinGrid=t.columnsToDisplayinGrid;const n=new s.ColumnInfo(-1,"select",s.ColumnDataType.Empty);n.width=i.DataAccessService.instance.selectColumnWidth,n.template="checkTemplate",n.headerTemplate="checkHeaderTemplate",n.headerRenderer=null,this.columns=a.queryResult.columns.map((t=>{const e=new s.ColumnInfo(t.ordinal,t.name,t.dataType);return e.headerText=unescape(e.headerText),2!==a.sqlQueryType&&(e.template="describeTemplate"),e})),this.columns.unshift(n),this.batchId=a.queryResult.batchId,this.sqlText=a.sqlQuery,this.hasMoreRows=a.queryResult.hasMoreRows,this.MaxRowsCount=a.queryResult.maxRowsCount,this.AllRowsFetched=a.queryResult.allRowsFetched,this.fetchingCompleted=a.queryResult.fetchingCompleted,this.queryType=a.sqlQueryType,this.lastBatchItems=a.queryResult.rows,a.queryResult.rows.forEach((t=>{const s=t;s.selected=e.observable(),s.selected.subscribe((t=>{this.raiseRowSelected(s);const e=parseInt(s["RowNum:"+(this.columns.length-2)]);t?this.selection.add(e):this.selection.has(e)&&this.selection.delete(e)})),s.selected(this.defaultSelection),this.rows.push(s)})),this.dataChanged.emit("dataChanged")}raiseRowSelected(t){this.selectionChanged.emit(o.ON_SELECTION_CHANGED_EVENT,t)}}t.DataGridModel=o,o.randomColumName="Random",o.ON_SELECTION_CHANGED_EVENT="onSelectionChanged",o.ON_FETCHING_ROWS_EVENT="FetchingRows";class r{constructor(){this.handlerList=new Map}get handlerList(){return this.handlerListField}set handlerList(t){this.handlerListField=t}on(t,e){this.handlerList.get(t)||this.handlerList.set(t,[]);const s=this.handlerList.get(t);s&&s.push(e)}emit(t,e){if(this.handlerList.has(t)){const s=this.handlerList.get(t);s&&s.forEach((t=>{t(e)}))}}}t.CustomEventEmitter=r;class h{constructor(){}get severity(){return this.severityField}set severity(t){this.severityField=t}get summary(){return this.summaryField}set summary(t){this.summaryField=t}get detail(){return this.detailField}set detail(t){this.detailField=t}get autoTimeout(){return this.autoTimeoutField}set autoTimeout(t){this.autoTimeoutField=t}static get iconMapping(){return h.iconMappingField||(h.iconMappingField=new Map,h.iconMapping.set(d.info,"css/images/info.png"),h.iconMapping.set(d.error,"css/images/error.png"),h.iconMapping.set(d.warning,"css/images/warning.png"),h.iconMapping.set(d.confirmation,"css/images/confirmation.png")),h.iconMappingField}static set iconMapping(t){h.iconMappingField=t}}var d;t.ODTUINotification=h,function(t){t.error="error",t.warning="warning",t.info="info",t.confirmation="confirmation"}(d=t.Severity||(t.Severity={}));t.ParametersUIParams=class{};t.CodeObjectOutPutUIParams=class{constructor(){this.dataChanged=new r,this.dataSourceType=s.DataSourceType.CodeObjectOutput}get inputArgs(){return this.inputArgsField}set inputArgs(t){this.inputArgsField=t,this.dataChanged.emit("dataChanged")}get outputArgs(){return this.outputArgsField}set outputArgs(t){this.outputArgsField=t,this.dataChanged.emit("dataChanged")}addOnDataChangedHandler(t){this.dataChanged.on("dataChanged",t)}},function(t){t[t.DisplayInput=0]="DisplayInput",t[t.DisplayOutput=1]="DisplayOutput",t[t.TakeParameters=2]="TakeParameters"}(t.ParametersUIMode||(t.ParametersUIMode={}));class l{constructor(){this.datatypes=new Map,this.datatypes.set("VARCHAR2","VARCHAR2"),this.datatypes.set("VARCHAR","VARCHAR"),this.datatypes.set("STRING","STRING"),this.datatypes.set("NVARCHAR2","NVARCHAR2"),this.datatypes.set("CHAR","CHAR"),this.datatypes.set("CHARACTER","CHARACTER"),this.datatypes.set("NCHAR","NCHAR"),this.datatypes.set("NUMBER","NUMBER"),this.datatypes.set("DEC","DEC"),this.datatypes.set("DECIMAL","DECIMAL"),this.datatypes.set("DOUBLE PRECISION","DOUBLE PRECISION"),this.datatypes.set("FLOAT","FLOAT"),this.datatypes.set("INTEGER","INTEGER"),this.datatypes.set("INT","INT"),this.datatypes.set("NUMERIC","NUMERIC"),this.datatypes.set("REAL","REAL"),this.datatypes.set("SMALLINT","SMALLINT"),this.datatypes.set("PLS_INTEGER","PLS_INTEGER"),this.datatypes.set("BOOLEAN","BOOLEAN"),this.datatypes.set("BINARY_FLOAT","BINARY_FLOAT"),this.datatypes.set("BINARY_DOUBLE","BINARY_DOUBLE"),this.datatypes.set("BINARY_INTEGER","BINARY_INTEGER"),this.datatypes.set("NATURAL","NATURAL"),this.datatypes.set("NATURALN","NATURALN"),this.datatypes.set("POSITIVE","POSITIVE"),this.datatypes.set("POSITIVEN","POSITIVEN"),this.datatypes.set("SIGNTYPE","SIGNTYPE"),this.datatypes.set("LONG","LONG"),this.datatypes.set("RAW","RAW"),this.datatypes.set("LONG RAW","LONG RAW"),this.datatypes.set("DATE","DATE"),this.datatypes.set("TIMESTAMP","TIMESTAMP"),this.datatypes.set("TIMESTAMP WITH TIME ZONE","TIMESTAMP WITH TIME ZONE"),this.datatypes.set("TIMESTAMP WITH LOCAL TIME ZONE","TIMESTAMP WITH LOCAL TIME ZONE"),this.datatypes.set("INTERVAL YEAR TO MONTH","INTERVAL YEAR TO MONTH"),this.datatypes.set("INTERVAL DAY TO SECOND","INTERVAL DAY TO SECOND"),this.datatypes.set("ROWID","ROWID"),this.datatypes.set("MLSLABEL","MLSLABEL"),this.datatypes.set("UROWID","UROWID"),this.datatypes.set("CLOB","CLOB"),this.datatypes.set("NCLOB","NCLOB"),this.datatypes.set("BLOB","BLOB"),this.datatypes.set("BFILE","BFILE"),this.datatypes.set("REF","REF"),this.datatypes.set("SYS_REFCURSOR","SYS_REFCURSOR"),this.datatypes.set("TIMESTAMP_UNCONSTRAINED","TIMESTAMP_UNCONSTRAINED"),this.datatypes.set("TIMESTAMP_TZ_UNCONSTRAINED","TIMESTAMP_TZ_UNCONSTRAINED"),this.datatypes.set("TIMESTAMP_LTZ_UNCONSTRAINED","TIMESTAMP_LTZ_UNCONSTRAINED"),this.datatypes.set("YMINTERVAL_UNCONSTRAINED","YMINTERVAL_UNCONSTRAINED"),this.datatypes.set("DSINTERVAL_UNCONSTRAINED","DSINTERVAL_UNCONSTRAINED"),this.datatypes.set("XMLTYPE","XMLTYPE"),this.datatypes.set("USERDEFINEDTYPE","USERDEFINEDTYPE")}static get instance(){return l.instanceField||(l.instanceField=new l),l.instanceField}}t.PLSQLDataTypes10G=l;class c{constructor(t,e=a.LocalizedConstants.Instance.inputPanelHeader){this.name=t,this.dialogHeader=e,this.okLabel=a.LocalizedConstants.Instance.ok,this.cancelLabel=a.LocalizedConstants.Instance.cancel}static initDialogParams(){if(!c.PopupDialogOptionRepos){c.PopupDialogOptionRepos=new Map,c.PopupDialogOptionRepos.set(s.OperationName.BindVariableInput,new c("runInputDialog")),c.PopupDialogOptionRepos.set(s.OperationName.RunCodeObject,new c("runInputDialog")),c.PopupDialogOptionRepos.set(s.OperationName.Password,new c("userInputPromptModule")),c.PopupDialogOptionRepos.set(s.OperationName.SubstituionVariableInput,new c("userInputPromptModule")),c.PopupDialogOptionRepos.set(s.OperationName.UserName,new c("userInputPromptModule"));let t=new c("userInputPromptModule",a.LocalizedConstants.Instance.unsupportedCommandList);t.okLabel=a.LocalizedConstants.Instance.exceuteSQLScript,c.PopupDialogOptionRepos.set(s.OperationName.UnsupportedCommandPrompt,t);let e=new c("userInputPromptModule",a.LocalizedConstants.Instance.reconnectToDatabase);e.okLabel=a.LocalizedConstants.Instance.reconnect,e.cancelLabel=a.LocalizedConstants.Instance.cancelScriptExecution,c.PopupDialogOptionRepos.set(s.OperationName.PromptConnectionReconnect,e)}}static getPopulInfo(t){return c.initDialogParams(),c.PopupDialogOptionRepos.get(t)}get dialogHeader(){return this.dialogHeaderField}set dialogHeader(t){this.dialogHeaderField=t}get name(){return this.nameField}set name(t){this.nameField=t}}t.PopUpDialogParams=c;t.CustomModuleConfig=class{};t.ResultArguments=class{constructor(){this.observableIndex=e.observable()}get observableIndexProp(){return this.observableIndex()}set observableIndexProp(t){this.observableIndex(t)}};t.ModulePage=class{constructor(){this.startRow=0,this.endRow=0}populatePageInfo(t,e,s,a){this.startRow=p.getStartRowNum(t,e),this.endRow=p.getEndRowNum(t,e,s),this.isLastPage=t==a,this.isFirstPage=1==t,this.itemCount=this.endRow-this.startRow+1,this.rows=[],this.selectAll()}selectAll(){for(var t=this.startRow;t<=this.endRow;++t)this.rows.forEach((t=>{t.selected(!0)}))}unselectAll(){for(var t=this.startRow;t<=this.endRow;++t)this.rows.forEach((t=>{t.selected(!1)}))}};class p{constructor(){this.pageInputWidth=e.observable(""),this.inputPageNo=e.observable(1),this.curPageNo=1,this.pagingRangeText=e.observable(""),this.pageDataSource=[],this.isLastPage=e.observable(!1),this.isFirstPage=e.observable(!0),this.isSinglePage=!1,this.allPages=new Map,this.batchToPageMap=new Map,this.pendingPage=0,this.observablePageSource=e.observableArray([])}static getStartRowNum(t,e){return t<1?0:(t-1)*e+1}static getEndRowNum(t,e,s){return t*e>s?s:t*e}updateRows(t){for(var s=0;s<t.length&&s<this.pageDataSource.length;++s)this.pageDataSource[s](t[s]);if(t.length<this.pageDataSource.length)this.pageDataSource.splice(t.length),this.observablePageSource(this.pageDataSource);else if(t.length>this.pageDataSource.length){for(;s<t.length;)this.pageDataSource.push(e.observable(t[s++]));this.observablePageSource(this.pageDataSource)}}isPageFetched(t=this.curPageNo){return this.allPages.has(t)}getCurPage(){return this.allPages.get(this.curPageNo)}setToPrevPageNo(){this.inputPageNo(this.curPageNo)}getPageFromBatchId(t){return this.batchToPageMap.has(t)?this.batchToPageMap.get(t):0}}t.PagingModel=p,function(t){t[t.Initilize=0]="Initilize",t[t.ProfileData=1]="ProfileData",t[t.SaveConfirm=2]="SaveConfirm"}(t.configSignalType||(t.configSignalType={}));t.configProfileData=class{constructor(t,e,s,a){this.existingUserProfiles=t,this.existingWorkspaceProfiles=e,this.existingFolderProfiles=s,this.osUser=a}};t.configSaveConfirmData=class{constructor(t,e,s){this.targetConfigurationTarget=t,this.targetWorkspaceFolder=e,this.promptToSave=s}}}));