import 'dotenv/config';

import { drizzle } from 'drizzle-orm/node-postgres';

// Initialize the database connection using the connection string from the environment variable
const db = drizzle(process.env.DATABASE_URL);

export default db;