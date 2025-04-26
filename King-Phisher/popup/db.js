import mysql from 'mysql2/promise';

//It Create the database if it doesn't exist
async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'your_mysql_user',
    password: 'your_mysql_password',
  });

  await connection.query('CREATE DATABASE IF NOT EXISTS kingphisher');
  console.log('✅ Database "kingphisher" created or already exists.');
  await connection.end();
}

// Create a connection pool to the new database
async function initializePool() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'your_mysql_user',
    password: 'your_mysql_password',
    database: 'kingphisher',
  });

  // Create the users table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      email VARCHAR(255) PRIMARY KEY,
      password VARCHAR(255) NOT NULL
    )
  `);
  console.log('✅ Table "users" is ready.');

  return pool;
}

// Run setup and export the pool
let pool;
const initialize = async () => {
  await setupDatabase();
  pool = await initializePool();
};

await initialize();

export default pool;
