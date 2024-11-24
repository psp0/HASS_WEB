define(['exports', './types-c0115c86', './logger-2fbed0e0'], (function(e,t,a){"use strict";class n{static _getDayPeriods(e,t){const a=new Date(2019,0,1,0,0,0);function r(e){const t=e.formatToParts(a).find((e=>"dayPeriod"===e.type));return t?t.value:""}const s=n.getFormatterLocale(e,t),o=new Intl.DateTimeFormat(s,{hour:"numeric",hour12:!0}),i=r(o);a.setHours(20);return{format:{wide:{am:i,pm:r(o)}}}}static getFormatterLocale(e,t){return e+"-u-ca-"+t}static _getEras(e,t){const a=[{era:"0",start:"2000-02-11T00:00:00"}],r={eraNarrow:{0:"",1:""},eraAbbr:{0:"",1:""},eraName:{0:"",1:""}};function s(e,t){const a=e.formatToParts(t).find((e=>"era"===e.type));return a?a.value:""}const o=["narrow","short","long"],i=n.getFormatterLocale(e,t),l={narrow:"eraNarrow",short:"eraAbbr",long:"eraName"};for(let e=0;e<a.length;e++){const t=new Date(a[e].start);for(let e=0;e<o.length;e++){const a=o[e],n={year:"numeric",month:"numeric",day:"numeric",era:a},d=s(new Intl.DateTimeFormat(i,n),t),m={0:d,1:d};r[l[a]]=m}}return r}static _fillMonthAndDays(e,t,a,r,s){const o=[[2020,0,5],[2020,1,3],[2020,2,3],[2020,3,1],[2020,4,7],[2020,5,5],[2020,6,4],[2020,7,1],[2020,8,1],[2020,9,1],[2020,10,1],[2020,11,1]];function i(e){const t=e.find((e=>"month"===e.type));return t?t.value:null}function l(e){const t=e.find((e=>"weekday"===e.type));return t?t.value:null}const d=n.getFormatterLocale(e,t),m=new Intl.DateTimeFormat(d,r),h={},u={};for(let e=0;e<o.length;e++){const t=e+1,r=n._weekdaysFormatMap[t],d=new Date(o[e][0],o[e][1],o[e][2]),c=m.formatToParts(d);let _,y;s?(_=m.format(d),y=m.format(d)):(_=i(c),y=l(c)),void 0===h[a]&&(h[a]={}),h[a][t]=_,t<=7&&(void 0===u[a]&&(u[a]={}),u[a][r]=y)}return{monthFormat:h,dayFormat:u}}static _getFormatMonthAndDays(e,t){const a=[],r=[],s=["short","narrow","long"];for(let o=0;o<s.length;o++){const i={month:s[o],weekday:s[o],year:"numeric",day:"numeric"},l=n._monthNamesFormatMap[s[o]],d=n._fillMonthAndDays(e,t,l,i,!1);a[o]=d.monthFormat,r[o]=d.dayFormat}const o=Object.assign({},...a),i=Object.assign({},...r),l={};l.format=o;const d={};return d.format=i,l["stand-alone"]=l.format,d["stand-alone"]=d.format,{monthsNode:l,daysNode:d}}static _getStandAloneDays(e,t){const a=[],r=["short","narrow","long"];for(let s=0;s<r.length;s++){const o={weekday:r[s]},i=n._monthNamesFormatMap[r[s]],l=n._fillMonthAndDays(e,t,i,o,!0);a[s]=l.dayFormat}const s=Object.assign({},...a),o={"stand-alone":{}};return o["stand-alone"]=s,{daysNode:o}}static _getStandAloneMonths(e,t){const a=[],r=["short","narrow","long"];for(let s=0;s<r.length;s++){const o={month:r[s]},i=n._monthNamesFormatMap[r[s]],l=n._fillMonthAndDays(e,t,i,o,!0);a[s]=l.monthFormat}const s=Object.assign({},...a),o={"stand-alone":{}};return o["stand-alone"]=s,{monthsNode:o}}static getCalendar(e,t){if(n.calendars=n.calendars??{},n.calendars[e]=n.calendars[e]??{},void 0===n.calendars[e][t]){const a=n._getDayPeriods(e,t),r=n._getEras(e,t);let s,o;const i=n._getStandAloneMonths(e,t),l=n._getStandAloneDays(e,t);if(n.exceptionLocales.includes(e))s=i.monthsNode["stand-alone"],o=l.daysNode["stand-alone"];else{const a=n._getFormatMonthAndDays(e,t);s=a.monthsNode.format,o=a.daysNode.format}const d={format:s,"stand-alone":i.monthsNode["stand-alone"]},m={format:o,"stand-alone":l.daysNode["stand-alone"]};n.calendars[e][t]={dayPeriods:a,months:d,days:m,eras:r,locale:e}}return n.calendars[e][t]}}n._monthNamesFormatMap={short:"abbreviated",narrow:"narrow",long:"wide"},n._weekdaysFormatMap={1:"sun",2:"mon",3:"tue",4:"wed",5:"thu",6:"fri",7:"sat"},n.exceptionLocales=["ja","ja-JP","zh","zh-Hans","zh-Hans-CN","zh-Hans-HK","zh-Hans-MO","zh-Hans-SG","zh-Hant","zh-Hant-HK","zh-Hant-MO","zh-Hant-TW"];const r=new Map;function s(e,t){const a=new Date(Date.UTC(e.year,e.month-1,e.date,e.hours,e.minutes)),n=function(e,t){let a=60*e.hours+e.minutes,n=60*t.hours+t.minutes,r=e.year-t.year;0==r&&(r=e.month-t.month,0===r&&(r=e.date-t.date));r>0?a+=1440:r<0&&(n+=1440);return n-a}(e,o(a,t));let r=0;a.setTime(a.getTime()-6e4*n),i(o(a,t),e)||(r=-60,a.setTime(a.getTime()+36e5),i(o(a,t),e)||(r=60,a.setTime(a.getTime()-72e5)));return n+r}function o(e,t){const a=function(e){let t=r.get(e);t||(t=new Intl.DateTimeFormat("en-US",{year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric",hourCycle:"h23",timeZone:e}),r.set(e,t));return t}(t).format(e),[n,s]=a.split(","),[o,i,l]=n.split("/"),[d,m]=s.trim().split(":");return{year:parseInt(l),month:parseInt(o),date:parseInt(i),hours:parseInt(d),minutes:parseInt(m)}}function i(e,t){return e.year===t.year&&e.month===t.month&&e.hours===t.hours&&e.minutes===t.minutes}class l{}l._YEAR_AND_DATE_REGEXP=/(\d{1,4})\D+?(\d{1,4})/g,l._YMD_REGEXP=/(\d{1,4})\D+?(\d{1,4})\D+?(\d{1,4})/g,l._TIME_REGEXP=/(\d{1,2})(?:\D(\d{1,2}))?(?:\D(\d{1,2}))?(?:\D(\d{1,3}))?/g,l._TIME_FORMAT_REGEXP=/h|H|K|k/g,l._YEAR_REGEXP=/y{1,4}/,l._MONTH_REGEXP=/M{1,5}/,l._DAY_REGEXP=/d{1,2}/,l._WEEK_DAY_REGEXP=/E{1,5}/,l._HOUR_REGEXP=/h{1,2}|k{1,2}/i,l._MINUTE_REGEXP=/m{1,2}/,l._SECOND_REGEXP=/s{1,2}/,l._FRACTIONAL_SECOND_REGEXP=/S{1,3}/,l._AMPM_REGEXP=/a{1,2}/,l._WORD_REGEXP="(\\D+?\\s*)",l._ESCAPE_REGEXP=/([\^$.*+?|\[\](){}])/g,l._TOKEN_REGEXP=/ccccc|cccc|ccc|cc|c|EEEEE|EEEE|EEE|EE|E|dd|d|MMMMM|MMMM|MMM|MM|M|LLLLL|LLLL|LLL|LL|L|yyyy|yy|y|hh|h|HH|H|KK|K|kk|k|mm|m|ss|s|aa|a|SSS|SS|S|zzzz|zzz|zz|z|v|ZZZ|ZZ|Z|XXX|XX|X|VV|GGGGG|GGGG|GGG|GG|G/g,l._ZULU="zulu",l._LOCAL="local",l._AUTO="auto",l._INVARIANT="invariant",l._OFFSET="offset",l._ALNUM_REGEXP="(\\D+|\\d\\d?\\D|\\d\\d?|\\D+\\d\\d?)",l._NON_DIGIT_REGEXP="(\\D+|\\D+\\d\\d?)",l._NON_DIGIT_OPT_REGEXP="(\\D*)",l._STR_REGEXP="(.+?)",l._TWO_DIGITS_REGEXP="(\\d\\d?)",l._THREE_DIGITS_REGEXP="(\\d{1,3})",l._FOUR_DIGITS_REGEXP="(\\d{1,4})",l._SLASH_REGEXP="(\\/)",l._PROPERTIES_MAP={MMM:{token:"months",style:"format",mLen:"abbreviated",matchIndex:0,key:"month",value:"short",regExp:l._ALNUM_REGEXP},MMMM:{token:"months",style:"format",mLen:"wide",matchIndex:0,key:"month",value:"long",regExp:l._ALNUM_REGEXP},MMMMM:{token:"months",style:"format",mLen:"narrow",matchIndex:0,key:"month",value:"narrow",regExp:l._ALNUM_REGEXP},LLL:{token:"months",style:"stand-alone",mLen:"abbreviated",matchIndex:1,key:"month",value:"short",regExp:l._ALNUM_REGEXP},LLLL:{token:"months",style:"stand-alone",mLen:"wide",matchIndex:1,key:"month",value:"long",regExp:l._ALNUM_REGEXP},LLLLL:{token:"months",style:"stand-alone",mLen:"narrow",matchIndex:1,key:"month",value:"narrow",regExp:l._ALNUM_REGEXP},E:{token:"days",style:"format",dLen:"abbreviated",matchIndex:0,key:"weekday",value:"short",regExp:l._NON_DIGIT_REGEXP},EE:{token:"days",style:"format",dLen:"abbreviated",matchIndex:0,key:"weekday",value:"short",regExp:l._NON_DIGIT_REGEXP},EEE:{token:"days",style:"format",dLen:"abbreviated",matchIndex:0,key:"weekday",value:"short",regExp:l._NON_DIGIT_REGEXP},EEEE:{token:"days",style:"format",dLen:"wide",matchIndex:0,key:"weekday",value:"long",regExp:l._NON_DIGIT_REGEXP},EEEEE:{token:"days",style:"format",dLen:"narrow",matchIndex:0,key:"weekday",value:"narrow",regExp:l._NON_DIGIT_REGEXP},c:{token:"days",style:"stand-alone",dLen:"abbreviated",matchIndex:1,key:"weekday",value:"short",regExp:l._NON_DIGIT_REGEXP},cc:{token:"days",style:"stand-alone",dLen:"abbreviated",matchIndex:1,key:"weekday",value:"short",regExp:l._NON_DIGIT_REGEXP},ccc:{token:"days",style:"stand-alone",dLen:"abbreviated",matchIndex:1,key:"weekday",value:"short",regExp:l._NON_DIGIT_REGEXP},cccc:{token:"days",style:"stand-alone",dLen:"wide",matchIndex:1,key:"weekday",value:"long",regExp:l._NON_DIGIT_REGEXP},ccccc:{token:"days",style:"stand-alone",dLen:"narrow",matchIndex:1,key:"weekday",value:"narrow",regExp:l._NON_DIGIT_REGEXP},h:{token:"time",timePart:"hour",start1:0,end1:11,start2:1,end2:12,key:"hour",value:"numeric",regExp:l._TWO_DIGITS_REGEXP},hh:{token:"time",timePart:"hour",start1:0,end1:11,start2:1,end2:12,key:"hour",value:"2-digit",regExp:l._TWO_DIGITS_REGEXP},K:{token:"time",timePart:"hour",start1:0,end1:12,start2:0,end2:12,key:"hour",value:"numeric",regExp:l._TWO_DIGITS_REGEXP},KK:{token:"time",timePart:"hour",start1:0,end1:12,start2:0,end2:12,key:"hour",value:"2-digit",regExp:l._TWO_DIGITS_REGEXP},H:{token:"time",timePart:"hour",start1:0,end1:23,start2:0,end2:23,key:"hour",value:"numeric",regExp:l._TWO_DIGITS_REGEXP},HH:{token:"time",timePart:"hour",start1:0,end1:23,start2:0,end2:23,key:"hour",value:"2-digit",regExp:l._TWO_DIGITS_REGEXP},k:{token:"time",timePart:"hour",start1:0,end1:24,start2:0,end2:24,key:"hour",value:"numeric",regExp:l._TWO_DIGITS_REGEXP},kk:{token:"time",timePart:"hour",start1:0,end1:24,start2:0,end2:24,key:"hour",value:"2-digit",regExp:l._TWO_DIGITS_REGEXP},m:{token:"time",timePart:"minute",start1:0,end1:59,start2:0,end2:59,key:"minute",value:"numeric",regExp:l._TWO_DIGITS_REGEXP},mm:{token:"time",timePart:"minute",start1:0,end1:59,start2:0,end2:59,key:"minute",value:"2-digit",regExp:l._TWO_DIGITS_REGEXP},s:{token:"time",timePart:"second",start1:0,end1:59,start2:0,end2:59,key:"second",value:"numeric",regExp:l._TWO_DIGITS_REGEXP},ss:{token:"time",timePart:"second",start1:0,end1:59,start2:0,end2:59,key:"second",value:"2-digit",regExp:l._TWO_DIGITS_REGEXP},S:{token:"time",timePart:"millisec",start1:0,end1:999,start2:0,end2:999,key:"millisecond",value:"numeric",regExp:l._THREE_DIGITS_REGEXP},SS:{token:"time",timePart:"millisec",start1:0,end1:999,start2:0,end2:999,key:"millisecond",value:"numeric",regExp:l._THREE_DIGITS_REGEXP},SSS:{token:"time",timePart:"millisec",start1:0,end1:999,start2:0,end2:999,key:"millisecond",value:"numeric",regExp:l._THREE_DIGITS_REGEXP},d:{token:"dayOfMonth",key:"day",value:"numeric",getPartIdx:2,regExp:l._TWO_DIGITS_REGEXP},dd:{token:"dayOfMonth",key:"day",value:"2-digit",getPartIdx:2,regExp:l._TWO_DIGITS_REGEXP},M:{token:"monthIndex",key:"month",value:"numeric",getPartIdx:1,regExp:l._TWO_DIGITS_REGEXP},MM:{token:"monthIndex",key:"month",value:"2-digit",getPartIdx:1,regExp:l._TWO_DIGITS_REGEXP},L:{token:"monthIndex",key:"month",value:"numeric",getPartIdx:1,regExp:l._TWO_DIGITS_REGEXP},LL:{token:"monthIndex",key:"month",value:"2-digit",getPartIdx:1,regExp:l._TWO_DIGITS_REGEXP},y:{token:"year",key:"year",value:"numeric",regExp:l._FOUR_DIGITS_REGEXP},yy:{token:"year",key:"year",value:"2-digit",regExp:l._TWO_DIGITS_REGEXP},yyyy:{token:"year",key:"year",value:"numeric",regExp:l._FOUR_DIGITS_REGEXP},a:{token:"ampm",key:"dayPeriod",value:void 0,regExp:l._WORD_REGEXP},z:{token:"tzAbbrev",key:"timeZoneName",value:"short",regExp:l._STR_REGEXP},v:{token:"tzAbbrev",key:"timeZoneName",value:"short",regExp:l._STR_REGEXP},zz:{token:"tzAbbrev",key:"timeZoneName",value:"short",regExp:l._STR_REGEXP},zzz:{token:"tzAbbrev",key:"timeZoneName",value:"short",regExp:l._STR_REGEXP},zzzz:{token:"tzFull",key:"timeZoneName",value:"long",regExp:l._STR_REGEXP},Z:{token:"tzhm",key:"tzhm",value:"short",regExp:l._STR_REGEXP,type:"tzOffset"},ZZ:{token:"tzhm",key:"tzhm",value:"short",regExp:l._STR_REGEXP,type:"tzOffset"},ZZZ:{token:"tzhm",key:"tzhm",value:"short",regExp:l._STR_REGEXP,type:"tzOffset"},X:{token:"tzh",key:"tzh",value:"short",regExp:l._STR_REGEXP,type:"tzOffset"},XX:{token:"tzhm",key:"tzhm",value:"short",regExp:l._STR_REGEXP,type:"tzOffset"},XXX:{token:"tzhsepm",key:"tzhsepm",value:"short",regExp:l._STR_REGEXP,type:"tzOffset"},VV:{token:"tzid",key:"tzid",value:"short",regExp:l._STR_REGEXP,type:"tzOffset"},G:{token:"era",key:"era",value:"eraAbbr",regExp:l._NON_DIGIT_REGEXP},GG:{token:"era",key:"era",value:"eraAbbr",regExp:l._NON_DIGIT_REGEXP},GGG:{token:"era",key:"era",value:"eraAbbr",regExp:l._NON_DIGIT_REGEXP},GGGG:{token:"era",key:"era",value:"eraName",regExp:l._NON_DIGIT_REGEXP},GGGGG:{token:"era",key:"era",value:"eraNarrow",regExp:l._NON_DIGIT_REGEXP},"/":{token:"slash",regExp:l._SLASH_REGEXP}},l.FRACTIONAL_SECOND_MAP={a:{key:"dayPeriod",token:"dayPeriod",value:"narrow"},SSS:{key:"fractionalSecondDigits",token:"fractionalSecond",value:3},SS:{key:"fractionalSecondDigits",token:"fractionalSecond",value:2},S:{key:"fractionalSecondDigits",token:"fractionalSecond",value:1}},l._tokenMap={era:{short:"GGG",long:"GGGG",narrow:"GGGGG"},month:{short:"MMM",long:"MMMM",narrow:"MMMMM",numeric:"M","2-digit":"MM"},weekday:{short:"EEE",long:"EEEE",narrow:"EEEEE"},year:{numeric:"y","2-digit":"yy"},day:{numeric:"d","2-digit":"dd"},hour:{numeric:"h","2-digit":"hh"},minute:{numeric:"m","2-digit":"mm"},second:{numeric:"s","2-digit":"ss"},fractionalSecond:{1:"S",2:"SS",3:"SSS"},timeZoneName:{short:"z",long:"zzzz"}},l._dateTimeFormats={dateStyle:{full:{year:"y",month_s:"MM",month_m:"MMMM",weekday:"EEEE",day:"d"},long:{year:"y",month_s:"MM",month_m:"MMMM",day:"d"},medium:{year:"y",month_s:"MM",month_m:"MMM",day:"d"},short:{year:"y",month_s:"M",month_m:"MMM",day:"d"}},timeStyle:{full:{hour:"h",minute:"mm",second:"ss",timeZoneName:"zzzz"},long:{hour:"h",minute:"mm",second:"ss",timeZoneName:"z"},medium:{hour:"h",minute:"mm",second:"ss"},short:{hour:"h",minute:"mm"}}},l._ALPHA_REGEXP=/([a-zA-Z]+)/,l._HOUR12_REGEXP=/h/g,l._hourCycleMap={h12:"h",h23:"H",h11:"K",h24:"k"},l._zh_tw_locales=["zh-TW","zh-Hant","zh-Hant-TW"],l._zh_tw_pm_symbols=["中午","下午","晚上"];const d=/^\s+|\s+$|\u200f|\u200e/g,m=/\s+|\u200f|\u200e/g,h=/0+$/g,u=["0","00","000"],c=/^[+-]?\d{4}(?:-\d{2}(?:-\d{2})?)?(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}(?::?\d{2})?)?)?$|^T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}(?::?\d{2})?)?$/,_=/^[+-]?\d{4}-\d{2}-\d{2}$/;function y(e){return null==e||e.trim().length>0&&_.test(e.trim())}function g(e,t){return 0===e.indexOf(t)}function E(e){return(e+"").replace(d,"")}function p(e){return(e+"").replace(h,"")}function f(e){return(e+"").replace(m,"")}function T(e){return e.split(" ").join(" ").toUpperCase()}function k(e,t){let a=e+"",n=!1;return e<0&&(a=a.substr(1),n=!0),t>1&&a.length<t&&(a=u[t-2]+a,a=a.substr(a.length-t,t)),n&&(a="-"+a),a}function I(e,t,a){let n=""+e;for(let e=n.length;e<t;e+=1)n=a?"0"+n:n+"0";return n}function v(e,t,a,n,r){throw new RangeError("The string "+e+" is not a valid ISO 8601 string: "+a+" is out of range.  Enter a value between "+n+" and "+r+" for "+t,{cause:{code:"isoStringOutOfRange",parameterMap:{isoStr:e,value:a,minValue:n,maxValue:r,propertyName:t}}})}function w(e){throw new Error("The string "+e+" is not a valid ISO 8601 string syntax.",{cause:{code:"invalidISOString",parameterMap:{isoStr:e}}})}function P(e){let t=e;"number"==typeof t&&(t=new Date(t));let a=k(t.getFullYear(),4)+"-"+k(t.getMonth()+1,2)+"-"+k(t.getDate(),2)+"T"+k(t.getHours(),2)+":"+k(t.getMinutes(),2)+":"+k(t.getSeconds(),2);return t.getMilliseconds()>0&&(a+="."+p(k(t.getMilliseconds(),3))),a}function M(e){return e%400==0||e%100!=0&&e%4==0}function G(e,t){switch(t){case 0:case 2:case 4:case 6:case 7:case 9:case 11:return 31;case 1:return M(e)?29:28;default:return 30}}function S(e){!1===c.test(e)&&w(e);const t=e.split("T"),a=e.indexOf("T"),n=new Date;let r,s=!1;const o=[n.getFullYear(),n.getMonth()+1,n.getDate(),0,0,0,0];if(""!==t[0]){g(t[0],"-")&&(t[0]=t[0].slice(1),s=!0);const a=t[0].split("-");for(r=0;r<a.length;r++){const t=parseInt(a[r],10);if(1===r&&(t<1||t>12)&&v(e,"month",t,1,12),2===r){const a=G(o[0],o[1]-1);(t<1||t>a)&&v(e,"day",t,1,a)}o[r]=t}s&&(o[0]=-o[0])}if(-1!==a){const a=t[1].split("."),n=a[0].split(":");for(r=0;r<n.length;r++){const t=parseInt(n[r],10);0===r&&(t<0||t>24)&&v(e,"hour",t,0,24),1===r&&(t<0||t>59)&&v(e,"minute",t,0,59),2===r&&(t<0||t>59)&&v(e,"second",t,0,59),o[3+r]=t}2===a.length&&a[1]&&(o[6]=parseInt(I(a[1],3,!1),10))}return o}function x(e,t){if(void 0===e)throw new Error("Internal "+t+" error. Default options missing.");return function(a,n,r,s){if(void 0!==e[a]){let s=e[a];switch(n){case"boolean":s=function(e){if("string"==typeof e)switch(e.toLowerCase().trim()){case"true":case"1":return!0;case"false":case"0":return!1;default:return e}return e}(s);break;case"string":s=String(s);break;case"number":s=Number(s);break;default:throw new Error("Internal error. Wrong value type.")}if(void 0!==r&&-1===r.indexOf(s)){const n=[];for(let e=0;e<r.length;e++)n.push(r[e]);const s="The value '"+e[a]+"' is out of range for '"+t+"' options property '"+a+"'. Valid values: "+n,o=new RangeError(s),i={errorCode:"optionOutOfRange",parameterMap:{propertyName:a,propertyValue:e[a],propertyValueValid:n,caller:t}};throw o.errorInfo=i,o}return s}return s}}function R(e){let t=k(e[0],4)+"-"+k(e[1],2)+"-"+k(e[2],2)+"T"+k(e[3],2)+":"+k(e[4],2)+":"+k(e[5],2);return e[6]>0&&(t+="."+p(k(e[6],3))),t}function O(e){return e&&"string"==typeof e?function(e){const t=S(e),a=new Date(t[0],t[1]-1,t[2],t[3],t[4],t[5],t[6]);return a.setFullYear(t[0]),a}(e):null}function D(e){const t={format:null,dateTime:null,timeZone:"",isoStrParts:null},a=c.exec(e);if(null===a&&w(e),a&&void 0===a[1]&&void 0===a[2])return t.format="local",t.dateTime=e,t.isoStrParts=S(t.dateTime),t;t.timeZone=void 0!==a[1]?a[1]:a[2],"Z"===t.timeZone?t.format="zulu":t.format="offset";const n=e.length,r=t.timeZone.length;return t.dateTime=e.substring(0,n-r),t.isoStrParts=S(t.dateTime),t}function b(e,t,a,n){const r=a?t>0:t<0,s=Math.abs(t);let o=Math.floor(s/60);const i=s%60,l=r?"-":"+";n&&(o=I(o,2,!0));let d=e+l+o;return(i>0||n)&&(d+=":"+I(i,2,!0)),d}var L={__proto__:null,_ISO_DATE_REGEXP:c,isDateOnlyIsoString:y,startsWith:g,trim:E,trimRightZeros:p,trimNumber:f,toUpper:T,padZeros:k,zeroPad:I,dateToLocalIso:P,isLeapYear:M,getDaysInMonth:G,IsoStrParts:S,getGetOption:x,partsToIsoString:R,isoToLocalDate:O,getISOStrFormatInfo:D,getTimeStringFromOffset:b};let N=null;class X{static parseImpl(e,t,a,n){let r=0;let s,o="",i=null;return!0===c.test(e)?(o=e,r=this._isoStrDateTimeStyle(e)):(r=this._dateTimeStyle(a),s=this._parseExact(e,t,a,n),o=s.value),i=D(o),void 0!==a.timeZone&&i.format!==l._LOCAL&&this._adjustHours(i,a),o=this._createParseISOStringFromDate(r,i,a),void 0===s?s={value:o,warning:null}:(s.value=o,s.warning=null),2===r&&(a.isoStrFormat,l._LOCAL),s}static _appendPreOrPostMatch(e,t){let a=0,n=!1;for(let r=0,s=e.length;r<s;r++){const s=e.charAt(r);switch(s){case"'":n?t.push("'"):a+=1,n=!1;break;case"\\":n&&t.push("\\"),n=!n;break;default:t.push(s),n=!1}}return a}static _validateRange(e){if(e.value<e.low||e.value>e.high){const t=e.displayValue+" is out of range.  Enter a value between "+e.displayLow+" and "+e.displayHigh+" for "+e.name,a={cause:{code:"datetimeOutOfRange",parameterMap:{value:e.displayValue,minValue:e.displayLow,maxValue:e.displayHigh,propertyName:e.name}}};throw new RangeError(t,a)}}static _throwInvalidDateFormat(e,t,a){const n=void 0!==t.year||void 0!==t.month||void 0!==t.weekday||void 0!==t.day,r=void 0!==t.hour||void 0!==t.minute||void 0!==t.second;let s="";s=n&&r?"MM/dd/yy hh:mm:ss a":n?"MM/dd/yy":"hh:mm:ss a";throw new SyntaxError("Unexpected character(s) "+a+' encountered in the pattern "'+e+' An example of a valid pattern is "'+s+'".',{cause:{code:"optionValueInvalid",parameterMap:{propertyName:"pattern",propertyValue:e}}})}static _throwWeekdayMismatch(e,a){const n="The weekday "+e+" does not match the date "+a,r={cause:{code:"dateToWeekdayMismatch",parameterMap:{weekday:e,date:a}}};throw new t.FormatParseError(n,r)}static _throwDateFormatMismatch(e,a,n){let r="",s="";2===n?(r='The value "'+e+'" does not match the expected date-time format "'+a+'"',s="datetimeFormatMismatch"):0===n?(r='The value "'+e+'" does not match the expected date format "'+a+'"',s="dateFormatMismatch"):(r='The value "'+e+'" does not match the expected time format "'+a+'"',s="timeFormatMismatch");const o={cause:{code:s,parameterMap:{value:e,format:a}}};throw new t.FormatParseError(r,o)}static _parseTimezoneOffset(e){const t=e.split(":"),a=new Array(2);return 2===t.length?(a[0]=parseInt(t[0],10),a[1]=parseInt(t[1],10)):2===e.length||3===e.length?(a[0]=parseInt(e,10),a[1]=0):(a[0]=parseInt(e.substr(0,3),10),a[1]=parseInt(e.substr(3),10)),a}static _expandYear(e,t){if((t=Number(t))<100){const a=e%100;t+=100*Math.floor(e/100)+(t<a?100:0)}return t}static _arrayIndexOfMonthOrDay(e,t,a){const n=X.toUpperTrimmedNoPeriod(t),r=Object.keys(e);for(let t=0;t<r.length;t++){const s=e[r[t]],o=X.toUpperTrimmedNoPeriod(s);if(n===o)return t;if("months"===a){const e=Number(n),a=parseInt(o);if(Number.isInteger(a)&&Number.isInteger(e)&&a===e)return t}}return-1}static toUpperTrimmedNoPeriod(e){let t=T(e);return t=E(t),t=t.replace(/\.$/,""),t}static _getDayIndex(e,t){let a=0,n=[];const r=e.days.format,s=e.days["stand-alone"];n=[r.abbreviated,r.wide,s.abbreviated,s.wide];for(let e=0;e<n.length;e++)if(a=this._arrayIndexOfMonthOrDay(n[e],t,"days"),-1!==a)return a;return a}static _getMonthIndex(e,t){let a=-1;const n=e.months.format,r=e.months["stand-alone"],s=[n.wide,n.abbreviated,r.wide,r.abbreviated];for(let e=0;e<s.length;e++)if(a=this._arrayIndexOfMonthOrDay(s[e],t,"months"),-1!==a)return a;return a}static _getParseRegExp(e,t){const a=e.replace(l._ESCAPE_REGEXP,"\\\\$1"),n=["^"],r=[];let s=0,o=0,i=l._TOKEN_REGEXP.exec(a);for(;null!==i;){const d=a.slice(s,i.index);if(s=l._TOKEN_REGEXP.lastIndex,o+=this._appendPreOrPostMatch(d,n),o%2)n.push(i[0]);else{const a=i[0];let s="";void 0!==l._PROPERTIES_MAP[a]?s=l._PROPERTIES_MAP[a].regExp:this._throwInvalidDateFormat(e,t,a),s&&n.push(s),r.push(i[0])}i=l._TOKEN_REGEXP.exec(a)}this._appendPreOrPostMatch(a.slice(s),n),n.push("$");return{regExp:n.join("").replace(/\s+/g,"\\s+"),groups:r}}static _getTokenIndex(e,t){for(let a=0;a<e.length;a++)if(void 0!==e[a][t])return a;return 0}static _parseLenienthms(e,t,a,n,r){l._TIME_REGEXP.lastIndex=0;let s,o,i=0,d=0,m=0,h=0,u=l._TIME_REGEXP.exec(t);switch(null===u&&this._throwDateFormatMismatch(t,a,n),void 0!==u[1]&&(i=parseInt(u[1],10)),void 0!==u[2]&&(d=parseInt(u[2],10)),void 0!==u[3]&&(m=parseInt(u[3],10)),void 0!==u[4]&&(h=parseInt(u[4],10)),l._TIME_FORMAT_REGEXP.lastIndex=0,u=l._TIME_FORMAT_REGEXP.exec(a),u[0]){case"h":12===i&&(i=0),o={name:"hour",value:i,low:0,high:11,displayValue:i,displayLow:1,displayHigh:12},this._validateRange(o),s=this._matchPMSymbol(r,t),s&&i<12&&(i+=12);break;case"K":o={name:"hour",value:i,low:0,high:11,displayValue:i,displayLow:0,displayHigh:11},this._validateRange(o),s=this._matchPMSymbol(r,t),s&&i<12&&(i+=12);break;case"H":o={name:"hour",value:i,low:0,high:23,displayValue:i,displayLow:0,displayHigh:23},this._validateRange(o);break;case"k":24===i&&(i=0),o={name:"hour",value:i,low:0,high:23,displayValue:i,displayLow:1,displayHigh:24}}o={name:"minute",value:d,low:0,high:59,displayValue:d,displayLow:0,displayHigh:59},this._validateRange(o),o={name:"second",value:m,low:0,high:59,displayValue:m,displayLow:0,displayHigh:59},this._validateRange(o),o={name:"farctionalSecond",value:h,low:0,high:999,displayValue:h,displayLow:0,displayHigh:999},this._validateRange(o),e.setHours(i,d,m,h)}static _getWeekdayName(e,t){const a=t.days.format,n=t.days["stand-alone"],r=[a.wide,a.abbreviated,n.wide,n.abbreviated];for(let t=0;t<r.length;t++){const a=Object.keys(r[t]);for(let n=0;n<a.length;n++){const s=r[t][a[n]];if(new RegExp(s+"\\b","i").test(e))return s}}return null}static _parseLenientyMEd(e,t,a,n,r){l._YMD_REGEXP.lastIndex=0;const s=l._YMD_REGEXP.exec(e);let o=0;null===s&&(o=r?2:0,this._throwDateFormatMismatch(e,t,o));const i=[{y:t.indexOf("y")},{M:t.indexOf("M")},{d:t.indexOf("d")}];i.sort((function(e,t){const a=Object.keys(e)[0],n=Object.keys(t)[0];return e[a]-t[n]}));let d=0,m=0,h=0,u=0,c=0,_=0;const y=this._getTokenIndex(i,"d");let g=!1,E=!1;for(_=1;_<=3;_++){const e=s[_],t=parseInt(e);(e.length>2||t>31)&&(d=t,g=!0,u=_-1)}for(g||(u=this._getTokenIndex(i,"y"),d=s[this._getTokenIndex(i,"y")+1]),_=0;_<3;_++)if(_!==u&&s[_+1]>12){h=s[_+1],E=!0,c=_;break}if(E){for(_=0;_<3;_++)if(_!==c&&_!==u){m=s[_+1];break}void 0===m&&(m=s[this._getTokenIndex(i,"M")+1])}else u===this._getTokenIndex(i,"d")?(h=s[this._getTokenIndex(i,"y")+1],m=s[this._getTokenIndex(i,"M")+1]):u===this._getTokenIndex(i,"M")?(h=s[this._getTokenIndex(i,"d")+1],m=s[this._getTokenIndex(i,"y")+1]):(h=s[this._getTokenIndex(i,"d")+1],m=s[this._getTokenIndex(i,"M")+1]);m-=1;const p=G(d,m);let f;E&&y!==c&&m>12&&(f={name:"month",value:h,low:0,high:11,displayValue:h,displayLow:1,displayHigh:12},this._validateRange(f)),f={name:"month",value:m,low:0,high:11,displayValue:m+1,displayLow:1,displayHigh:12},this._validateRange(f),f={name:"day",value:h,low:1,high:p,displayValue:h,displayLow:1,displayHigh:p},this._validateRange(f);const T=a.twoDigitYearStart||1950;d=this._expandYear(T,d),f={name:"year",value:d,low:0,high:9999,displayValue:d,displayLow:0,displayHigh:9999},this._validateRange(f);const k=new Date(d,m,h),I=this._getWeekdayName(e,n);if(null!==I){const e=this._getDayIndex(n,I);k.getDay()!==e&&this._throwWeekdayMismatch(I,k.getDate())}if(r){const a=e.substr(l._YMD_REGEXP.lastIndex);0===a.length?k.setHours(0,0,0,0):this._parseLenienthms(k,a,t,2,n)}return{value:P(k),warning:"lenient parsing was used"}}static _parseLenientyMMMEd(e,t,a,n,r){const s=e;e=T(e);const o=n.months.format,i=n.months["stand-alone"],d=[o.wide,o.abbreviated,i.wide,i.abbreviated];let m=!1,h=[],u=0,c="";for(u=0;u<d.length;u++){h=[];const t=Object.keys(d[u]);let a=0;for(a=0;a<t.length;a++)c=T(d[u][t[a]]),h.unshift({idx:a,name:c});for(h.sort((function(e,t){return t.idx-e.idx})),a=0;a<h.length;a++)if(c=h[a].name,-1!==e.indexOf(c)){m=!0,e=e.replace(c,"");break}if(m)break}if(!m)return this._parseLenientyMEd(s,t,a,n,r);const _=this._getMonthIndex(n,c);let y={name:"month",value:_,low:0,high:11,displayValue:_,displayLow:1,displayHigh:12};this._validateRange(y);const g=this._getWeekdayName(s,n),E=new RegExp(g+"\\W","i");null!==g&&(e=e.replace(E,"")),l._YEAR_AND_DATE_REGEXP.lastIndex=0;const p=l._YEAR_AND_DATE_REGEXP.exec(e);if(null===p){const e=r?2:0;this._throwDateFormatMismatch(s,t,e)}const f=[{y:t.indexOf("y")},{d:t.indexOf("d")}];f.sort((function(e,t){const a=Object.keys(e)[0],n=Object.keys(t)[0];return e[a]-t[n]}));let k=0,I=0,v=0,w=!1;for(u=1;u<=2;u++){const e=p[u],t=parseInt(e);(e.length>2||t>31)&&(k=t,w=!0,v=u-1)}w||(v=this._getTokenIndex(f,"y"),k=parseInt(p[this._getTokenIndex(f,"y")+1],10)),I=v===this._getTokenIndex(f,"d")?parseInt(p[this._getTokenIndex(f,"y")+1],10):parseInt(p[this._getTokenIndex(f,"d")+1],10);const M=a.twoDigitYearStart||1950;k=this._expandYear(M,k),y={name:"year",value:k,low:0,high:9999,displayValue:k,displayLow:0,displayHigh:9999},this._validateRange(y);const S=new Date(k,_,I);if(null!==g){const e=this._getDayIndex(n,g);S.getDay()!==e&&this._throwWeekdayMismatch(g,S.getDate())}const x=G(k,_);if(y={name:"day",value:I,low:1,high:x,displayValue:I,displayLow:1,displayHigh:x},this._validateRange(y),r){const a=e.substr(l._YEAR_AND_DATE_REGEXP.lastIndex);0===a.length?S.setHours(0,0,0,0):this._parseLenienthms(S,a,t,2,n)}return{value:P(S),warning:"lenient parsing was used"}}static _parseLenient(e,t,a,n){let r;switch(this._dateTimeStyle(a)){case 0:r=this._parseLenientyMMMEd(e,t,a,n,!1);break;case 1:const s=new Date;this._parseLenienthms(s,e,t,1,n);r={value:P(s),warning:"lenient parsing was used"};break;case 2:r=this._parseLenientyMMMEd(e,t,a,n,!0);break;default:r={value:"",warning:"lenient parsing was used"}}const s=S(r.value),o=[s[0],s[1],s[2]],i=r.value.split("T");return r.value=k(o[0],4)+"-"+k(o[1],2)+"-"+k(o[2],2)+"T"+i[1],r}static _getNameIndex(e,t,a,n,r,s,o,i,l,d,m){let h=0;const u=e[t][r];h="months"===t?this._getMonthIndex(e,a):this._getDayIndex(e,a);const c=u[n][l],_=u[n][d],y={name:m,value:h,low:o,high:i,displayValue:parseInt(a),displayLow:c,displayHigh:_};return this._validateRange(y),h}static _validateTimePart(e,t,a,n){const r=t;r[a.timePart]=e,"h"===n||"hh"===n?12===e&&(r[a.timePart]=0):"k"===n||"kk"===n?(r.htoken=n,24===e&&(r[a.timePart]=0)):"K"!==n&&"KK"!==n||12===e&&(r[a.timePart]=0);const s={name:a.timePart,value:r[a.timePart],low:a.start1,high:a.end1,displayValue:e,displayLow:a.start2,displayHigh:a.end2};this._validateRange(s)}static _dateTimeStyle(e){const t=void 0!==e.hour||void 0!==e.minute||void 0!==e.second||void 0!==e.fractionalSecondDigits,a=void 0!==e.year||void 0!==e.month||void 0!==e.day||void 0!==e.weekday;return a&&t?2:t?1:a?0:void 0!==e.dateStyle&&void 0!==e.timeStyle?2:void 0!==e.timeStyle?1:0}static _matchPMSymbol(e,t){const a=e.locale;let n=!1,r=0;if(l._zh_tw_locales.includes(a)){const e=l._zh_tw_pm_symbols;for(r=0;r<e.length;r++){const a=e[r];if(-1!==t.indexOf(a))return!0}}else{const a=e.dayPeriods.format.wide.pm;n=-1!==T(t).indexOf(T(a))}return n}static _parseExact(e,t,a,n){const r=n.eras.eraAbbr[1],s=f(r);e=e.replace(r,s);const o=x(a,"NativeDateTimeConverter.parse")("lenientParse","string",["none","full"],"full"),i=this._dateTimeStyle(a),d=this._getParseRegExp(t,a),m=new RegExp(d.regExp).exec(e);if(null===m){if("full"===o)return this._parseLenient(e,t,a,n);this._throwDateFormatMismatch(e,t,i)}const h=d.groups;let u,c,_=null,y=null,g=null,E=null,p="",T=null,k="";const I={hour:0,minute:0,second:0,millisec:0,htoken:""},v=a.twoDigitYearStart||1950;for(let r=0,s=h.length;r<s;r++){const s=m[r+1];if(s){const i=h[r],d=parseInt(s,10),m=l._PROPERTIES_MAP[i];switch(m.token){case"months":y=this._getNameIndex(n,m.token,s,m.mLen,m.style,m.matchIndex,0,11,"1","12","month name");break;case"days":k=s,E=this._getNameIndex(n,m.token,s,m.dLen,m.style,m.matchIndex,0,6,"sun","sat","weekday");break;case"time":this._validateTimePart(d,I,m,i);break;case"dayOfMonth":g=d;break;case"monthIndex":if(y=d-1,y>11&&"full"===o)try{return this._parseLenient(e,t,a,n)}catch(e){c={name:"month",value:y,low:0,high:11,displayValue:y+1,displayLow:1,displayHigh:12},this._validateRange(c)}break;case"year":_=this._expandYear(v,d);break;case"ampm":u=this._matchPMSymbol(n,s);break;case"tzhm":p=s.substr(-2),p=s.substr(0,3)+":"+p;break;case"tzhsepm":p=s;break;case"tzh":p=s+":00";break;case"tzid":T=s}}}const w=new Date;null===_&&(_=w.getFullYear()),null===y&&null===g?(y=w.getMonth(),g=w.getDate()):null===g&&(g=1),w.setFullYear(_,y,g);const P=G(_,y);c={name:"day",value:g,low:1,high:P,displayValue:g,displayLow:1,displayHigh:P},this._validateRange(c),1==u&&I.hour<12&&(I.hour+=12),0!=u||12!=I.hour||"k"!=I.htoken&&"kk"!=I.htoken||(I.hour=0),w.setHours(I.hour,I.minute,I.second,I.millisec);const M=[_,y+1,g,0,0,0,0];M[3]=w.getHours(),M[4]=w.getMinutes(),M[5]=w.getSeconds(),M[6]=w.getMilliseconds();let S=R(M);if(null!==T){p=b("",this._getTimeZoneOffset(M,T),!1,!0)}""!==p&&(S+=p),c={name:"year",value:_,low:0,high:9999,displayValue:_,displayLow:0,displayHigh:9999},this._validateRange(c),c={name:"month",value:y,low:0,high:11,displayValue:y+1,displayLow:1,displayHigh:12},this._validateRange(c);const D=G(M[0],M[1]-1);if(c={name:"day",value:M[2],low:1,high:D,displayValue:M[2],displayLow:1,displayHigh:D},this._validateRange(c),null!==E){const e=O(S);e&&e.getDay()!==E&&this._throwWeekdayMismatch(k,e.getDate())}return{value:S}}static _isoStrDateTimeStyle(e){const t=e.indexOf("T");return-1===t?0:t>0?2:1}static _getTimeZoneOffset(e,t){if(this.getLocalSystemTimeZone()===t){return-new Date(e[0],e[1]-1,e[2],e[3],e[4],e[5]).getTimezoneOffset()}return s({year:e[0],month:e[1],date:e[2],hours:e[3],minutes:e[4]},t)}static _getAdjustedOffset(e,t){const a=t.isoStrParts;return this._getTimeZoneOffset(a,e)}static _adjustHours(e,t){const a=e.isoStrParts;let n=0;switch(e.format){case l._OFFSET:const t=this._parseTimezoneOffset(e.timeZone),a=t[0],r=t[1];n=60*a+(a<0?-r:r);break;case l._ZULU:n=0}let r=this._getAdjustedOffset(t.timeZone,e);r-=n;const s=new Date(a[0],a[1]-1,a[2],a[3],a[4],a[4]);s.setHours(a[3]+(r/60<<0),r%60);const o=D(P(s));r=this._getAdjustedOffset(t.timeZone,o),r-=n;const i=new Date(Date.UTC(a[0],a[1]-1,a[2],a[3],a[4],a[5])),d=i.getUTCMinutes()+r;i.setUTCHours(i.getUTCHours()+(d/60<<0),d%60),a[0]=i.getUTCFullYear(),a[1]=i.getUTCMonth()+1,a[2]=i.getUTCDate(),a[3]=i.getUTCHours(),a[4]=i.getUTCMinutes(),a[5]=i.getUTCSeconds()}static _createISOStrParts(e,t){let a=0,n="";switch(e){case 0:n=k(t[0],4)+"-"+k(t[1],2)+"-"+k(t[2],2);break;case 1:n="T"+k(t[3],2)+":"+k(t[4],2)+":"+k(t[5],2),a=t[6],a>0&&(n+="."+p(a));break;default:n=k(t[0],4)+"-"+k(t[1],2)+"-"+k(t[2],2)+"T"+k(t[3],2)+":"+k(t[4],2)+":"+k(t[5],2),a=t[6],a>0&&(n+="."+p(a))}return n}static _getParseISOStringOffset(e,t){return b("",this._getTimeZoneOffset(t,e),!1,!0)}static _createParseISOStringFromDate(e,t,a){const n=x(a,"NativeDateTimeConverter.parse")("isoStrFormat","string",[l._ZULU,l._OFFSET,l._INVARIANT,l._LOCAL,l._AUTO],l._AUTO),r=t.isoStrParts,s=a.timeZone;let o=this._createISOStrParts(e,r);if(0===e)return o;switch(n){case l._OFFSET:case l._AUTO:o+=this._getParseISOStringOffset(s,r);break;case l._LOCAL:2===e&&(o+=this._getParseISOStringOffset(s,r));break;case l._ZULU:let t=0;if(t=-this._getTimeZoneOffset(r,s),0!==t){const a=new Date(Date.UTC(r[0],r[1]-1,r[2],r[3],r[4],r[5],r[6]));t=a.getUTCMinutes()+t,a.setUTCHours(a.getUTCHours()+(t/60<<0),t%60),r[0]=a.getUTCFullYear(),r[1]=a.getUTCMonth()+1,r[2]=a.getUTCDate(),r[3]=a.getUTCHours(),r[4]=a.getUTCMinutes(),r[5]=a.getUTCSeconds(),o=this._createISOStrParts(e,r)}o+="Z"}return o}static getTimeZoneCurrentDate(e){const t={year:"numeric",day:"2-digit",month:"2-digit"};e&&(t.timeZone=e);const a=Intl.DateTimeFormat("en-US",t).format(new Date).split("/");return a[2]+"-"+a[0]+"-"+a[1]}static getTimeZoneCurrentOffset(e,t){const a=P(new Date);let n;if(t&&t.startsWith("T")){n=a.split("T")[0]+t}const r=D(n??a);return this._getAdjustedOffset(e,r)}static getLocalSystemTimeZone(){if(!N){const e=new Intl.DateTimeFormat("en-US");N=e.resolvedOptions().timeZone}return N}}const z=(e,t,a)=>{const n=t.formatToParts(a),r=n.find((e=>"year"===e.type))?.value;return e.formatToParts(a).reduce(((e,t)=>"year"===t.type?e+(r??t.value):e+t.value),"")},A=(e,a)=>{if(null==a||""===a)throw new t.FormatParseError("The format value cannot be empty.",{cause:{code:"emptyFormatValue"}});if(a.startsWith("T")){let t="";t=e?X.getTimeZoneCurrentDate(e):P(new Date).split("T")[0],a=t+a}else-1===a.indexOf("T")&&(a+="T00:00:00");if(!c.exec(a)){throw new t.FormatParseError("The format value must be a valid iso string.",{cause:{code:"invalidISOString",parameterMap:{isoStr:a}}})}if(e){let t=!1;X.getLocalSystemTimeZone()===e&&(t=!0);const n=a.substring(a.indexOf("T"));if(-1===n.indexOf("Z")&&-1===n.indexOf("+")&&-1===n.indexOf("-")&&!t){const t=S(a);a+=b("",s({year:t[0],month:t[1],date:t[2],hours:t[3],minutes:t[4]},e),!1,!0)}}return a=a.replace(/(T.*?[+-]..$)/,"$1:00")},F=(e,t)=>{const a=new Date("2000-01-02T00:00:00");let n="",r="",s=null,o=null,i=null,d=!1,m=!1;void 0!==t.dateStyle&&(o=l._dateTimeFormats.dateStyle,o=o[t.dateStyle],d=!0),void 0!==t.timeStyle&&(i=l._dateTimeFormats.timeStyle,i=i[t.timeStyle],m=!0);const h=l._tokenMap;return e.formatToParts(a).map((({type:e,value:a})=>{switch(e){case"literal":s=a.replace(l._ALPHA_REGEXP,"'$1'");break;case"dayPeriod":s="a";break;case"hour":m?s=i[e]:(r=t[e],s=h[e][r]);let n=t.hour12;void 0===n&&(n=!1),t.hourCycle&&(s=s.replace(l._HOUR12_REGEXP,l._hourCycleMap[t.hourCycle])),!0===n&&(s=s.replace(l._HOUR12_REGEXP,"h"));break;case"month":d?s=isNaN(+a)?o.month_m:o.month_s:(r=t[e],s=h[e][r]);break;case"year":case"day":case"weekday":d?s=o[e]:(r=t[e],s=h[e][r]);break;case"minute":case"second":case"timeZoneName":m?s=i[e]:(r=t[e],s=h[e][r]);break;case"era":r=t[e]||"short",s=h[e][r];break;case"fractionalSecond":s=t.fractionalSecondDigits,s=h[e][s]}n+=s})),n};e.CalendarUtils=n,e.NativeDateTimeConstants=l,e.NativeParserImpl=X,e.dateTimeUtils=L,e.formatWithYearFormat=z,e.getDaysInMonth=G,e.getFormatParse=function(e){const r=(e=>new Intl.DateTimeFormat(e.locale,e))(e),s=((e,t)=>{const a=e.resolvedOptions(),n=t.isoStrFormat??"auto",r=t.twoDigitYearStart??1950,s=t.lenientParse??"full",o=F(e,a);return{...a,isoStrFormat:n,twoDigitYearStart:r,lenientParse:s,patternFromOptions:o}})(r,e),o=((e,t)=>{let a=null;return"short"===e.dateStyle&&e.dateStyleShortYear&&(a=new Intl.DateTimeFormat(e.locale,{year:e.dateStyleShortYear,numberingSystem:t.numberingSystem,calendar:t.calendar})),a})(e,s);return{format:e=>((e,t,a,n)=>{const r=A(a,n),s=new Date(r);return t?z(e,t,s):e.format(s)})(r,o,s.timeZone,e),parse:o=>((e,r,s,o)=>{if(null==o||""===o)throw new t.FormatParseError("The parse value cannot be empty.",{cause:{code:"emptyParseValue"}});const i=n.getCalendar(e,s.calendar),l=F(r,s),d=X.parseImpl(o,l,s,i),m=d.value;return m&&d.warning&&a.warn("The value "+o+" was leniently parsed to represent a date "+m),m})(e.locale,r,s,o),resolvedOptions:s,formatter:r}},e.getISODateOffset=s,e.isDateOnlyIsoString=y,e.normalizeIsoString=A}));
//# sourceMappingURL=getFormatParse-71c34a65.js.map