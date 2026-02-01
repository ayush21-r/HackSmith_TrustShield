import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Backend-only authentication logging utility
 * Logs all login and signup events to a secure text file
 * NO API exposes this file - it's backend-only for security audits
 */

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log file path - in backend/logs folder
const LOG_FILE = path.join(__dirname, '../..', 'logs', 'auth-log.txt');

// Ensure logs directory exists
const LOGS_DIR = path.dirname(LOG_FILE);
if (!fs.existsSync(LOGS_DIR)) {
  try {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create logs directory:', error.message);
  }
}

/**
 * Log authentication events (login/signup)
 * @param {string} action - 'LOGIN' or 'SIGNUP'
 * @param {string} email - User email
 * @param {string} role - User role (EMPLOYEE or HR)
 */
export const logAuthEvent = (action, email, role) => {
  try {
    // Create timestamp in readable format
    const timestamp = new Date().toISOString();
    
    // Format: [ISO-timestamp] ACTION | email | role
    const logEntry = `[${timestamp}] ${action} | ${email} | ${role}\n`;
    
    // Append to log file (creates if doesn't exist)
    fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
    
    console.log(`✅ Auth event logged: ${action} by ${email}`);
  } catch (error) {
    console.error('❌ Failed to write auth log:', error.message);
    // Don't throw - logging failure shouldn't break authentication
  }
};

/**
 * Get log file location (for admin reference only)
 * NEVER expose this to frontend
 */
export const getLogFilePath = () => {
  return LOG_FILE;
};
