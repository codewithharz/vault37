Purchase Payload: 
{commodityId: '69654944a64bff294bcf2953', cycleStartMode: 'CLUSTER', quantity: 4}
commodityId
: 
"69654944a64bff294bcf2953"
cycleStartMode
: 
"CLUSTER"
quantity
: 
4
[[Prototype]]
: 
Object


❌ Auto-approval job failed: Client must be connected before running operations
Error fetching system settings, falling back to constants: MongoNotConnectedError: Client must be connected before running operations
    at autoConnect (/Users/harz/Documents/backUps/Vault37/backend/node_modules/mongodb/lib/operations/execute_operation.js:98:19)
    at executeOperation (/Users/harz/Documents/backUps/Vault37/backend/node_modules/mongodb/lib/operations/execute_operation.js:40:40)
    at FindCursor._initialize (/Users/harz/Documents/backUps/Vault37/backend/node_modules/mongodb/lib/cursor/find_cursor.js:62:73)
    at FindCursor.cursorInit (/Users/harz/Documents/backUps/Vault37/backend/node_modules/mongodb/lib/cursor/abstract_cursor.js:632:38)
    at FindCursor.fetchBatch (/Users/harz/Documents/backUps/Vault37/backend/node_modules/mongodb/lib/cursor/abstract_cursor.js:666:24)
    at FindCursor.next (/Users/harz/Documents/backUps/Vault37/backend/node_modules/mongodb/lib/cursor/abstract_cursor.js:342:28)
    at Collection.findOne (/Users/harz/Documents/backUps/Vault37/backend/node_modules/mongodb/lib/collection.js:313:37)
    at NativeCollection.<computed> [as findOne] (/Users/harz/Documents/backUps/Vault37/backend/node_modules/mongoose/lib/drivers/node-mongodb-native/collection.js:246:33)
    at model.Query._findOne (/Users/harz/Documents/backUps/Vault37/backend/node_modules/mongoose/lib/query.js:2710:45)
    at model.Query.exec (/Users/harz/Documents/backUps/Vault37/backend/node_modules/mongoose/lib/query.js:4627:80)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async systemSettingsSchema.statics.getSettings (file:///Users/harz/Documents/backUps/Vault37/backend/src/models/SystemSettings.js:55:20)
    at async ConfigService.getSettings (file:///Users/harz/Documents/backUps/Vault37/backend/src/services/configService.js:28:30)
    at async autoApprovePendingTPIAs (file:///Users/harz/Documents/backUps/Vault37/backend/src/services/tpiaService.js:293:22)
    at async file:///Users/harz/Documents/backUps/Vault37/backend/src/jobs/tpiaJobs.js:13:30
    at async Timeout._onTimeout (/Users/harz/Documents/backUps/Vault37/backend/node_modules/node-cron/dist/esm/scheduler/runner.js:70:44) {
  errorLabelSet: Set(0) {}
}
❌ Auto-approval job failed: Client must be connected before running operations