// Simple test to check env variables
require('dotenv').config();

console.log('All env variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
console.log('ATLASDB_URL exists:', !!process.env.ATLASDB_URL);
