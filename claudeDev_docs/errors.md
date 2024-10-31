# Error Log

This document keeps track of encountered errors and their solutions throughout the development process.

## Template
```
Date: [YYYY-MM-DD]
Error: [Brief description of the error]
Context: [What was happening when the error occurred]
Solution: [How the error was resolved]
Prevention: [Steps to prevent this error in the future, if applicable]
```

## Active Issues

### Cross-Platform Compatibility Error
Date: 2024-10-31
Error: Invalid ELF header in bcrypt module
Context: When running the Docker container on ARM architecture while building for x86
```
Error: /usr/src/app/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node: invalid ELF header
```
Temporary Solution: Removed bcrypt dependency for development
Future Solution: Implement proper cross-platform build configuration
Prevention: Need to implement proper multi-architecture Docker builds

### Simulation Loading Error
Date: 2024-10-31
Error: Simulation loading functionality not working
Context: When attempting to load previously saved simulations
Current Status: Under investigation
Prevention: TBD after root cause analysis

### Parameter Change Issues
Date: 2024-10-31
Error: Parameter changes during simulation not properly reflected
Context: When modifying global or cell-specific parameters after simulation start
Symptoms:
- Changes don't affect simulation behavior as expected
- Exported data doesn't reflect parameter modifications
Temporary Solution: Advise users to set all parameters before starting simulation
Future Solution: Implement proper parameter change handling during simulation
Prevention: Need to implement proper state management for parameter changes

### Database Initialization Error
Date: 2024-10-31
Error: Relation "users" does not exist
Context: When database initialization scripts don't run in correct order
```
ERROR: relation "users" does not exist
```
Solution: Renamed SQL files to ensure proper execution order:
- 01_create_users_table.sql
- 02_create_simulations_table.sql
Prevention: Always prefix SQL initialization files with numbers to ensure correct execution order

## Resolved Issues

[To be added as issues are resolved]

## Notes
- This log will be updated as new issues are discovered and existing ones are resolved
- For immediate issues and workarounds, check the Known Issues section in currentTask.md
- For setup-related issues, refer to the Troubleshooting section in README.md
