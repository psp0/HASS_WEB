define(["require","exports","knockout","../common/dataAccessService","../common/localizedConstants","../common/scriptExecutionModels","ojs/ojbutton","ojs/ojcheckboxset","ojs/ojlabel","ojs/ojoption","ojs/ojprogress","ojs/ojprogress-bar"],(function(require,e,s,n,t,c){"use strict";return class{constructor(e){this.cancelQuery=()=>{this.cancelEnabled(!1);const e=new c.CancelScriptExecutionParams;e.ownerUri=n.DataAccessService.instance.URI,e.executionId=n.DataAccessService.instance.currentExecutionId,n.DataAccessService.instance.cancelQuery(e)},this.executing=e.executing,e.cancelHandler(this.cancelQuery),this.cancelEnabled=s.observable(!0),this.showAllSQL=s.observableArray(["true"]),this.showSQLUserOption=s.observable(!0),this.showAllSQL.subscribe((e=>{e.indexOf("true")>-1?this.showSQLUserOption(!0):this.showSQLUserOption(!1)}))}get chkShowAllSQLLabel(){return t.LocalizedConstants.Instance.chkShowAllSQLLabel}get messagesPanelLabel(){return t.LocalizedConstants.Instance.messagesPanelLabel}get cancelQueryTooltip(){return t.LocalizedConstants.Instance.cancelQueryTooltip}get cancelQueryText(){return t.LocalizedConstants.Instance.cancelQueryText}get clearLabel(){return t.LocalizedConstants.Instance.clearLabel}isCancelEnabled(){return this.cancelEnabled}}}));