"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleConnectionProxyConstants = void 0;
class OracleConnectionProxyConstants {
}
exports.OracleConnectionProxyConstants = OracleConnectionProxyConstants;
OracleConnectionProxyConstants.OracleConnectionProxyRequest = `OracleConnectionProxy/Request`;
OracleConnectionProxyConstants.s_vIsCloudDBQuery = `select sys_context('userenv', 'cloud_service') from dual`;
OracleConnectionProxyConstants.s_vServerHostQuery = `select sys_context ('userenv', 'server_host') from dual`;
OracleConnectionProxyConstants.s_vHasObjectQuery = `SELECT 'Y' FROM all_objects WHERE object_type = :1 and object_name = :2`;
OracleConnectionProxyConstants.s_vDbaPrivilegeQuery = `select username from user_role_privs where (GRANTED_ROLE = 'DBA' OR GRANTED_ROLE = 'IMP_FULL_DATABASE' OR GRANTED_ROLE = 'EXP_FULL_DATABASE' OR GRANTED_ROLE = 'PDB_DBA') AND USERNAME = USER`;
OracleConnectionProxyConstants.s_vSysPrivilegeQuery = `select USER NAME from dual where USER = 'SYS'`;
OracleConnectionProxyConstants.s_vUserQuery = `select user from dual`;
OracleConnectionProxyConstants.s_vSysDateQuery = `select to_char(sysdate, 'hh24_mi_ss') wizard_sysdate from dual`;
OracleConnectionProxyConstants.s_vCurrentTimestampQuery = `select current_timestamp from dual`;
OracleConnectionProxyConstants.s_vIsExportPrivilegedQuery = `select username from user_role_privs where ( GRANTED_ROLE = 'DBA' OR GRANTED_ROLE = 'EXP_FULL_DATABASE' OR GRANTED_ROLE = 'PDB_DBA' ) AND USERNAME = USER`;
OracleConnectionProxyConstants.s_vIsImportPrivilegedQuery = `select username from user_role_privs where ( GRANTED_ROLE = 'DBA' OR GRANTED_ROLE = 'IMP_FULL_DATABASE' OR GRANTED_ROLE = 'PDB_DBA' ) AND USERNAME = USER`;
OracleConnectionProxyConstants.s_vGetTimezoneVersionQuery = `select version from v$timezone_file`;
OracleConnectionProxyConstants.s_vHasUtlFileAccessQuery = `
begin
  null;
  exception when utl_file.invalid_operation then null;
end;`;
OracleConnectionProxyConstants.s_vGetBannerQuery = "select banner from v$version";
