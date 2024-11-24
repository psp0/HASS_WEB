# Change Log

## Version 23.4.1
* Release date: August 2024
* Release status: GA 

## What's new in 23.4.1
* TAF failover type SELECT is mapped to SESSION. (Fix for error: "TAF mode of FAILOVER_TYPE=SELECT configured on the DB service is not supported.")
* 10g verifier available by default. (Fix for error:  "ORA-28040: Database does not accept client authentication protocol; login denied.")

## Version 23.4.0
* Release date: July 2024
* Release status: GA 

## What's new in 23.4.0
* Enhanced and better performing grid control in results window for viewing and managing data
* Code generation using JavaScript, Python, Java and C# for data access applications 
* Compatible with new features of Oracle Database 23ai (such as new Boolean and Vector types)
* Clone connections in Database Explorer
* Improved extension activation time
* PL/SQL debugger setup now accepts hostname in addition to IP address

## Version 21.10.0
* Release date: May 2024
* Release status: GA 

## What's new in 21.10.0
* Database passwords are now stored in VS Code Secret Storage by default. User is prompted to optionally migrate existing passwords to VS Code Secret Storage

## Version 21.9.0
* Release date: March 2024
* Release status: GA 

## What's new in 21.9.0
* Select AI integration for generating SQL queries from natural language
* Kerberos authentication support
* Store passwords in Visual Studio Code Secret Storage
* Automatic Intellisense cache refresh on DDL execution
* Enhanced file associations setting 

## Version 21.8.0
* Release date: December 2023
* Release status: GA 

## What's new in 21.8.0
* "Test Connection" button added to connection dialogs
* Linux support for Secure External Password Store (SEPS)
* Fixed "Invalid Username/Password" (ORA-1017) password verifier issue
* Database Explorer "Describe" menu item now shows default value and comments when available

## Version 21.7.1
* Release date: October 2023
* Release status: GA 

## What's new in 21.7.1
* Real-Time SQL Monitoring: View monitored SQL, view and save SQL Monitor Active Reports, generate an Active Report for ad hoc SQL
* Filters: Connection level filter and other usability improvements
* Query results grid: Copy and Save now allow user to select one or more columns
* Title casing option for autocompletion and formatter
* Formatter enhancements
* Improved Secure External Password Store (SEPS) connectivity
* IntelliSense performance and memory usage improvement
* SQL execution performance improvements

## Version 21.6.0
* Release date: July 2023
* Release status: GA 

## What's new in 21.6.0
* Filters on Oracle Explorer (also filters IntelliSense suggestions)
* Organize connections by folder, workspace or user scopes
* Colorized connection node name and code window for easy identification
* Connection dialog LDAP option and other UI enhancements
* SEPS wallet connection support
* Explain plan/Execution plan
* Schema names offered as IntelliSense suggestions
* Configurable query results window location
* Performance and memory improvements, especially useful for very large schemas
* Shared IntelliSense cache between files that use the same connection
* Many improvements in IntelliSense including joins, insert, update and delete
* Formatter enhancements
* Enhanced diagnostic tracing to enable support to diagnose a wider range of issues

## Version 21.5.0
* Release date: September 2022
* Release status: GA

## What's new in 21.5.0
* Default Oracle Explorer database connection can be selected for use when running SQL scripts. This is useful when opening folders containing many SQL scripts
* Login script can be run each time a connection is established. This could be used to alter session settings to modify NLS parameters, etc
* SQL and PL/SQL formatter with configurable settings
* Create walletless connections to Oracle Autonomous Database 
* Get connection strings to connect to Oracle Autonomous Database
* Update network access control list (ACL) for Oracle Autonomous Database
* CodeLens support for Go to References/Find All References for PL/SQL Code objects opened from an Oracle Explorer connection
* Code folding improvements
* Improved IntelliSense (auto complete) suggestions for SQL and PL/SQL statements
* Improved efficiency of the database connection used by IntelliSense
* .NET Runtime is now automatically installed if no compatible runtime is currently installed 


## Version 21.4.0
* Release date: February 2022
* Release status: GA

## What's new in 21.4.0
* PL/SQL Debugger - Debug PL/SQL in stored procedures, functions and packages using Visual Studio Code's native debugging features. Use menus to compile PL/SQL for debugging, to step into PL/SQL, and to run to a breakpoint. Enable External Application Debugging to listen for and debug PL/SQL procedures and functions called by applications or SQL scripts.
* IntelliSense support for table/view aliases
* Smarter IntelliSense: Continuous parsing of SQL fragments being typed enables much better context sensitive autocomplete suggestions 
* Editor now supports hover, Go to/Peek Definition, Go to/Peek Type Definition and Go to/Peek Implementation
* Generate Create SQL menu item in Database Explorer outputs a CREATE SQL statement for a table or view
* Support for User Defined Types within a select list (for example, queries against tables that include Oracle Spatial types)
* SQL Parameter Binding Dialog is displayed with a request for input values when SQL is executed that includes undefined bind and substitution variables
* Procedure/Function input parameter dialog improvements including keyboard only entry (no mouse clicks required)
* Support for TLS based database connections without a wallet
* Support for single sign-on (SSO) with OCI IAM when connecting to Oracle Autonomous Database
* PL/SQL Compiler Settings page
* Support for .NET 6 which enables ARM64 processors such as Apple Silicon


## Version 21.3.0
* Release date: September 2021
* Release status: GA

## What's new in 21.3.0
* Create and manage Oracle Autonomous Databases (ADBs) using the Oracle Cloud Infrastructure Explorer tree control. Create, start, stop, and terminate ADB instances. Automatically download credentials files and create a database connection. Change the compartment or region, modify the administrator password and view the Service Console.
* Autocomplete/Intellisense setting to select whether to use uppercase or lowercase
* Results window data grid paging control to page through rows instead of a vertical scroll bar
* Oracle Database Explorer context menu to download PL/SQL files into a specific directory or into the folder that is currently open
* Opening stored procedures, functions or packages in a database via Oracle Database Explorer no longer saves the PL/SQL to a temporary file. Use the new download context menu or the Visual Studio Code menu Save As->Show Local if you wish to save the PL/SQL to a file.


## Version 19.3.4
* Release date: March 2021
* Release status: GA

## What's new in 19.3.4
* Script execution integration with the Problems panel including navigation to error locations and highlighting of error lines
* Breadcrumb support enabling navigation within scripts
* Navigation within a PL/SQL Package from Oracle Explorer via Open menu item
* Generate SELECT, INSERT, and DELETE SQL statements for relational tables from Oracle Explorer
* Describe context menu on the Oracle Explorer nodes shows object metadata
* Materialized view support in Oracle Explorer
* Show data on all different types of tables and views in Oracle Explorer
* Icons added to Oracle Explorer nodes
* Setting to change delimiter for CSV file generation
* Tooltip support for data grid
* Copy menu item for individual cells in data grid
* Results from script execution use session NLS settings
* LDAP multiplatform support


## Version 19.3.3
* Release date: September 2020
* Release status: GA

## What's new in 19.3.3
* Connection Dialog enhancements: Set/Change the current schema, improved proxy user connection UI
* Improved connection failure detection with an option to reconnect
* Support for macOS connections to Oracle Autonomous Database over TLS
* Support for database connections using LDAP
* Browse other schemas ("Other Users" node) in Oracle Explorer tree control
* SQL History and Bookmarks
* [Limited SQL*Plus support](https://www.oracle.com/database/technologies/appdev/dotnet/odtvscodesqlplus.html)
* Detection and warning of unsupported SQL*Plus commands in scripts (and child scripts)
* SQL*Plus CONNECT command associates the file with a connection
* Preservation of all session associated properties from execution to execution
* Autocommit On/Off setting
* Autocompletion of SQL*Plus commands
* Autocompletion of procedure/function parameters
* Intellisense/Autocomplete performance enhancements
* Syntax coloring for SQL and PL/SQL keywords and SQL*Plus commands/variables
* Append new results to existing results window
* Toolbar buttons to cancel running query and to clear results window
* Setting to automatically clear results window after each execution
* Remember previous selections in some UI elements and offer as defaults
* Support for REFCURSOR variables and implicit cursors
* Visual Studio Code theme support for Light/Dark/High Contrast themes

## Version 19.3.2
* Release date: September 2019
* Release status: GA

## What's new in 19.3.2
* Editor supports autocompletion of schema object names
* New connection dialog replaces "interview style" connection process
* "Develop New Query" menu item renamed to "Develop New SQL or PL/SQL"
* File extension .sql is now default rather than .plsql
* "Run" Stored Procedure/Function shortcut changed to Ctrl-E
* Run Stored Procedure/Function saves unsaved code to database before executing
* "Delete Connection", "Update Connection", "Connect", and "Disconnect" menu items added to Oracle Database Explorer
* "Refresh" menu item added to all Oracle Database Explorer nodes
* Oracle Database Explorer supports filtering to display a subset of nodes

## Version 19.3.1
* Release date: July 2019
* Release status: GA

## What's new in 19.3.1
* New Oracle Database Explorer tree control: connect and explore the Oracle schema, view table data, view, edit and save PL/SQL packages, procedures and functions. Run Stored Procedure/Functions with a UI for entering parameter values
* Detect missing .NET Core runtime and direct user to web page
* Tabbed results window while remembering user's choice of window location
* Tightened up UI with less white space
* Menu items changed to "Execute SQL" and "Execute All"
* Execute SQL (Ctrl-E) now executes only selected statement(s) or the statement that the cursor is on rather then the entire SQL file
* Fixed DBMS_OUTPUT.PUT_LINE not displaying in results window
* Show detailed PL/SQL errors.

## Version 19.3.0 
* Release date: June 19, 2019
* Release status: GA

## What's New in 19.3.0
* Connect to Oracle Database and Oracle Autonomous Database using Easy Connect syntax, TNS connect aliases, or Operating System Authentication
* Create and manage connection profiles and most recently used connections
* Edit SQL and PL/SQL with intelliSense, code snippets, and syntax coloring
* Execute SQL and PL/SQL and view and save results.


 Copyright (c) 2024, Oracle and/or its affiliates. 
