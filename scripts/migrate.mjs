import {readFile} from 'node:fs/promises';
import pg from 'pg';
if(!process.env.DATABASE_URL)throw new Error('Thiếu DATABASE_URL trong .env.local');
const client=new pg.Client({connectionString:process.env.DATABASE_URL});
try{await client.connect();await client.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));console.log('Đã tạo/cập nhật schema. Không xóa phiếu đang có.');}finally{await client.end();}
