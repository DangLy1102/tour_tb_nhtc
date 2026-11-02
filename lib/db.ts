import {Pool} from 'pg';
const globalDb=globalThis as unknown as {tourPool?:Pool};
export function getDb(){if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL chưa được cấu hình');return globalDb.tourPool??=(new Pool({connectionString:process.env.DATABASE_URL,max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:10000}));}
