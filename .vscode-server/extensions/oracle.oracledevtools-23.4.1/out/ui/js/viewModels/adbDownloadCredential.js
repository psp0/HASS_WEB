define(["require","exports","knockout","../common/scriptExecutionModels","../common/autonomousDBModels","../common/dataAccessService","../common/localizedConstants","ojs/ojcore","ojs/ojcheckboxset","jquery","ojs/ojtreeview","ojs/ojarraytreedataprovider","ojs/ojbutton","ojs/ojknockout","ojs/ojinputtext","ojs/ojlabel","ojs/ojprogress","ojs/ojformlayout","ojs/ojselectcombobox","ojs/ojmessage","ojs/ojmessages","ojs/ojnavigationlist","ojs/ojcollapsible","ojs/ojlabelvalue","ojs/ojdialog"],(function(require,e,s,a,t,i,n){"use strict";let o;class l{constructor(){this.walletFileLocation=n.LocalizedConstants.Instance.connUIPlaceHolderWalletFileLocation,this.tnsAdminLocation=n.LocalizedConstants.Instance.connUIPlaceHolderTnsAdminLocation,this.browse=n.LocalizedConstants.Instance.connUITextBrowse,this.ociReplaceExistingFiles=n.LocalizedConstants.Instance.ociReplaceExistingFiles,this.ociSkipExistingFiles=n.LocalizedConstants.Instance.ociSkipExistingFiles,this.ociCancel=n.LocalizedConstants.Instance.cancelQueryText,this.ociCopyCredentialsFileHeading=n.LocalizedConstants.Instance.ociCopyCredentialsFileHeading,this.ociFileAlreadtExists=n.LocalizedConstants.Instance.ociFileAlreadyExists,this.ociFilePath=n.LocalizedConstants.Instance.ociFilePath,this.ociOK=n.LocalizedConstants.Instance.OK,this.downloadWalletFile=n.LocalizedConstants.Instance.downloadWalletFile,this.downloadWalletFileCheckboxLabel=n.LocalizedConstants.Instance.downloadWalletFileCheckboxLabel}}return class{constructor(){this.downloadWalletFileInProgress=s.observable(!1),this.downloadWalletFileButtonText=s.observable(),this.existingFiles=s.observable(),this.connectionUILabelTexts=new l,this.newConnectionUIToDisplay=s.observable(t.NewConnectionUIToDisplay.DownloadWalletfileWhileMakingConnection),this.walletFileLocation=s.observable(""),this.downloadWalletFileOptions=s.observableArray(),this.messageHandlersField=new Map,this.disablebrowseNOkButton=s.computed((()=>this.downloadWalletFileInProgress()),this),this.themeFileId="ThemeCss",this.themeColorFileId="ThemeColor",this.customThemeTag="customTheme",this.onOCIReplaceExistingFiles=(e,s,a)=>{this.downloadWalletFileInProgress(!1),this.sendExistingFileActionRequest(t.FileExistsAction.Replace)},this.onOCISkipExistingFiles=(e,s,a)=>{this.downloadWalletFileInProgress(!1),this.sendExistingFileActionRequest(t.FileExistsAction.Skip)},this.onOCICancel=(e,s,a)=>{try{document.getElementById("modalDialogID").close(),this.downloadWalletFileInProgress(!1),this.existingFiles(""),this.newConnectionUIToDisplay(t.NewConnectionUIToDisplay.DownloadWalletfileWhileMakingConnection)}catch(e){i.DataAccessService.instance.logError(e)}},this.onBrowseOCIWalletFileLocation=(e,s,t)=>{const n=new a.MessageBase;n.type=a.MessageName.browseRequest;const o=new a.BrowseRequest;o.executionId=i.DataAccessService.instance.currentExecutionId,o.ownerUri=i.DataAccessService.instance.URI,o.windowUri=i.DataAccessService.instance.windowUri,o.path=this.walletFileLocation(),o.browseItem=a.BrowseItem.AdbCredential,n.data=o;try{i.DataAccessService.instance.send(n),i.DataAccessService.instance.logInfo("Successfully placed BrowseRequest")}catch(e){i.DataAccessService.instance.logError(e)}},this.onOCIDownloadWalletFile=(e,s,n)=>{if(this.downloadWalletFileInProgress(!0),null!=this.downloadWalletFileOptions()&&0==this.downloadWalletFileOptions().length)return void this.newConnectionUIToDisplay(t.NewConnectionUIToDisplay.NormalDB);const o=new a.MessageBase;o.type=a.MessageName.adbDownloadWalletFileRequestMessage;const l=new t.adbDownloadWalletFileRequest;l.executionId=i.DataAccessService.instance.currentExecutionId,l.windowUri=i.DataAccessService.instance.windowUri,l.adbDatabaseID=i.DataAccessService.instance.adbDatabaseID,l.adbDisplayName=i.DataAccessService.instance.adbDisplayName,l.adbName=i.DataAccessService.instance.adbName,l.walletFilepath=this.walletFileLocation(),l.profileName=i.DataAccessService.instance.profileName,l.dedicatedDb=i.DataAccessService.instance.isDedicatedDb,o.data=l;try{i.DataAccessService.instance.send(o),i.DataAccessService.instance.logInfo("Successfully placed onOCIDownloadWalletFile")}catch(e){i.DataAccessService.instance.logError(e)}},o=this,o.messageHandlers=new Map,this.messageHandlers.set(a.MessageName.adbDownloadWalletFileResponseMessage,(e=>{this.handleADBDownloadWalletFileResponse(e)})),this.messageHandlers.set(a.MessageName.browseReponse,(e=>{this.handleBrowseResponse(e)})),i.DataAccessService.instance.subscribe((e=>{if(e&&this.messageHandlers.get(e.type)){const s=this.messageHandlers.get(e.type);s&&s(e)}else i.DataAccessService.instance.logError(`Could not find handler for message ${e.type}`)})),null!=i.DataAccessService.instance.walletLocation&&i.DataAccessService.instance.walletLocation.length>0&&this.walletFileLocation(`${i.DataAccessService.instance.walletLocation}\\${i.DataAccessService.instance.adbName}`),this.downloadWalletFileOptions.push("yes"),i.DataAccessService.instance.logInfo("Fetching Localized resources "),i.DataAccessService.instance.getLocalizedData().done((e=>{i.DataAccessService.instance.logInfo("Fetched localized resources."),n.LocalizedConstants.Instance.Configure(e)})).fail((e=>{i.DataAccessService.instance.logError("Localized resources "+JSON.stringify(e))}))}get messageHandlers(){return this.messageHandlersField}set messageHandlers(e){this.messageHandlersField=e}getFormattedExistingFiles(e){var s="";for(let a=0;a<e.length;a++)s+=e[a],a!=e.length-1&&(s+="\n");return s}handleADBDownloadWalletFileResponse(e){i.DataAccessService.instance.logInfo("Received handleADBDownloadWalletFileResponse");var s=e.data;s.downloadCredentialsFilesData.existingFiles?s.downloadCredentialsFilesData.existingFiles.length>0?(this.newConnectionUIToDisplay(t.NewConnectionUIToDisplay.None),this.existingFiles(this.getFormattedExistingFiles(s.downloadCredentialsFilesData.existingFiles)),document.getElementById("modalDialogID").open()):this.newConnectionUIToDisplay(t.NewConnectionUIToDisplay.NormalDB):this.downloadWalletFileInProgress(!1)}sendExistingFileActionRequest(e){const s=new a.MessageBase;s.type=a.MessageName.adbReplaceWalletFileRequestMessage;const n=new t.adbReplaceWalletFileRequest;n.executionId=i.DataAccessService.instance.currentExecutionId,n.windowUri=i.DataAccessService.instance.windowUri,n.adbDatabaseID=i.DataAccessService.instance.adbDatabaseID,n.adbDisplayName=i.DataAccessService.instance.adbDisplayName,n.adbName=i.DataAccessService.instance.adbName,n.fileExistsAction=e,n.profileName=i.DataAccessService.instance.profileName,n.walletFilepath=this.walletFileLocation(),n.dedicatedDb=i.DataAccessService.instance.isDedicatedDb,s.data=n;try{i.DataAccessService.instance.send(s),i.DataAccessService.instance.logInfo("Successfully placed sendExistingFileActionRequest"),document.getElementById("modalDialogID").close(),this.newConnectionUIToDisplay(t.NewConnectionUIToDisplay.NormalDB)}catch(e){i.DataAccessService.instance.logError(e)}}handleBrowseResponse(e){i.DataAccessService.instance.logInfo("Received BrowseResponse");try{const s=e.data;s&&s.browseItem===a.BrowseItem.AdbCredential&&s.path&&this.walletFileLocation(s.path)}catch(e){i.DataAccessService.instance.logError(e)}}}}));