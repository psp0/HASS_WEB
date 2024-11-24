"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTSMQueries = void 0;
class RTSMQueries {
}
exports.RTSMQueries = RTSMQueries;
RTSMQueries.s_cGetRTSMList_XML = `
 select 
  DBMS_SQLTUNE.REPORT_SQL_MONITOR_LIST(
  type=>'XML',
  report_level=>'ALL',
  active_since_sec => :1,
  top_n_rankby => :2,
  top_n_count => 100
) 
from dual`;
RTSMQueries.s_cGetRTSMReport_Id = `
 select DBMS_SQL_MONITOR.report_sql_monitor(
  sql_id => :1,
  type         => 'ACTIVE',
  report_level => 'ALL') AS report
from dual`;
RTSMQueries.s_cGetRTSMReport_Id_ExecId = `
 select DBMS_SQL_MONITOR.report_sql_monitor(
  sql_id => :1,
  sql_exec_id => :2,
  type         => 'ACTIVE',
  report_level => 'ALL') AS report
from dual`;
RTSMQueries.s_cGetRTSMReport_Id_ExecId_Start = `
 select DBMS_SQL_MONITOR.report_sql_monitor(
  sql_id => :1,
  sql_exec_id => :2,
  sql_exec_start => :3,
  type         => :4,
  report_level => 'ALL') AS report
from dual`;
RTSMQueries.s_cGetRTSMReportOld_Id = `
 select DBMS_SQLTUNE.report_sql_monitor(
  sql_id => :1,
  type         => 'ACTIVE',
  report_level => 'ALL') AS report
from dual`;
RTSMQueries.s_cGetRTSMReportOld_Id_ExecId = `
 select DBMS_SQLTUNE.report_sql_monitor(
  sql_id => :1,
  sql_exec_id => :2,
  type         => 'ACTIVE',
  report_level => 'ALL') AS report
from dual`;
RTSMQueries.s_cGetRTSMTaskCompletion = `
 select DBMS_SQLTUNE.report_sql_monitor(
  sql_id => :1,
  sql_exec_id => :2,
  sql_exec_start => :3,
  type         => 'XML',
  report_level => 'BASIC')
from dual`;
RTSMQueries.s_cGetRTSMTaskStatus = `
select m.STATUS
from V$ALL_SQL_MONITOR m
where m.SQL_ID = :1 
and m.SQL_EXEC_ID = :2
and m.SQL_EXEC_START = :3`;
RTSMQueries.s_cGetRTSMReportOld_Id_ExecId_Start = `
 select DBMS_SQLTUNE.report_sql_monitor(
  sql_id => :1,
  sql_exec_id => :2,
  sql_exec_start => :3,
  type         => 'ACTIVE',
  report_level => 'ALL') AS report
from dual`;
RTSMQueries.s_GetStatementInfo = `
select *
from
(
select m.SQL_ID,
  m.SQL_TEXT,
  m.IS_FULL_SQLTEXT,
  m.SQL_EXEC_START,
  m.SQL_EXEC_ID,
  m.SQL_PLAN_HASH_VALUE
from V$ALL_SQL_MONITOR m
where m.SQL_TEXT like :1 
and m.PROGRAM like 'OracleVSCodeServer%' 
order by m.SQL_EXEC_START desc
)
where ROWNUM <= 1`;
