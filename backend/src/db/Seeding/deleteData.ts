import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { service_typeTable , locationTable , urgency_levelTable , useraccountTable, csr_requestsTable, pin_requestsTable, csr_shortlistTable, csr_interestedTable, notificationTable, feedbackTable } from '../schema/aiodb';
import { passwordResetRequestsTable } from '../schema/aiodb';
 
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);


// Delete all password reset requests
async function deleteResetPasswordRequests() {
  try {
    console.log('🗑️ Deleting Password Reset Requests...');
    const result = await db.delete(passwordResetRequestsTable);
    console.log('✅ All password reset requests deleted! Result:', result);
  } catch (err) {
    console.error('❌ Error deleting password reset requests:', err);
  }
}

//delete all users
async function deleteAllUsers(count?: number) {
  try {
    console.log('🗑️ Deleting Users...');
    const result = await db.delete(useraccountTable);
    console.log(`✅ All users deleted! Result:`, result);
  } catch (err) {
    console.error('❌ Error deleting users:', err);
  }
}

//Delete Service Types
async function deleteServiceTypes() {
  try {
    console.log('🗑️ Deleting Service Types...');
    const result = await db.delete(service_typeTable);
    console.log('✅ All service types deleted! Result:', result);
  } catch (err) {
    console.error('❌ Error deleting service types:', err);
  }
}


//Delete Locations
async function deleteLocations() {
  try {
    console.log('🗑️ Deleting Locations...');
    const result = await db.delete(locationTable);
    console.log('✅ All locations deleted! Result:', result);
  } catch (err) {
    console.error('❌ Error deleting locations:', err);
  }
}


//Delete Urgency Levels
async function deleteUrgencyLevels() {
  try {
    console.log('🗑️ Deleting Urgency Levels...');
    const result = await db.delete(urgency_levelTable);
    console.log('✅ All urgency levels deleted! Result:', result);
  } catch (err) {
    console.error('❌ Error deleting urgency levels:', err);
  }
}


//Delete PIN Requests
async function deletePIN_Req() {
  try {
    console.log('🗑️ Deleting PIN Requests...');
    const result = await db.delete(pin_requestsTable);
    console.log('✅ All PIN requests deleted! Result:', result);
  } catch (err) {
    console.error('❌ Error deleting PIN requests:', err);
  }
}

// Delete feedback entries (must be removed before deleting pin_requests and users)
async function deleteFeedback() {
  try {
    console.log('🗑️ Deleting Feedback...');
    const result = await db.delete(feedbackTable);
    console.log('✅ All feedback deleted! Result:', result);
  } catch (err) {
    console.error('❌ Error deleting feedback:', err);
  }
}

//Delete CSR Requests
async function deleteCSR_Req() {
  try {
    console.log('🗑️ Deleting CSR Requests...');
    const result = await db.delete(csr_requestsTable);
    console.log('✅ All CSR requests deleted! Result:', result);
  } catch (err) {
    console.error('❌ Error deleting CSR requests:', err);
  }
}

//Delete CSR Shortlist
async function deleteCSR_Shortlist() {
  try {
    console.log('🗑️ Deleting CSR Shortlist...');
    const result = await db.delete(csr_shortlistTable);
    console.log('✅ All CSR shortlist deleted! Result:', result);
  } catch (err) {
    console.error('❌ Error deleting CSR shortlist:', err);
  }
}

//Delete CSR Interested
async function deleteCSR_Interested() {
  try {
    console.log('🗑️ Deleting CSR Interested...');
    const result = await db.delete(csr_interestedTable);
    console.log('✅ All CSR interested deleted! Result:', result);
  } catch (err) {
    console.error('❌ Error deleting CSR interested:', err);
  }
}


// Delete Notifications
async function deleteNotifications() {
  try {
    console.log('🗑️ Deleting Notifications...');
    const result = await db.delete(notificationTable);
    console.log(`✅ All notifications deleted! Result:`, result);
  } catch (err) {
    console.error('❌ Error deleting notifications:', err);
  }
}

async function deleteAllData() {
  console.log('--- Starting full database deletion process ---');
  await deleteCSR_Shortlist();
  await deleteCSR_Interested();
  await deleteCSR_Req();
  // delete feedback first to remove references to pin_requests and users
  await deleteFeedback();
  await deletePIN_Req();
  await deleteNotifications();
  await deleteResetPasswordRequests();   // remove dependent password-reset records before deleting users to avoid FK violations
  await deleteAllUsers();
  await deleteServiceTypes();
  await deleteLocations();
  await deleteUrgencyLevels();
  console.log('✅ All data deleted in correct order!');
  await pool.end(); // Only close pool once, at the end
}

deleteAllData()
  .catch((err) => {
    console.error('❌ Error deleting data:', err);
    pool.end();
  });

