import {cookies} from 'next/headers';
import {getDb} from '../../../../lib/db';
import {sessionCookie} from '../../../../lib/auth';
import {normalizeEmail,allowedEmail,codeHash,newToken,tokenHash,isSameOrigin} from '../../../../lib/security.mjs';
export async function POST(request:Request){
 if(!isSameOrigin(request))return Response.json({error:'Yêu cầu không hợp lệ.'},{status:403});
 let email:string,code:string;try{const b=await request.json();email=normalizeEmail(b.email);code=b.code;}catch{return Response.json({error:'Dữ liệu không hợp lệ.'},{status:400});}
 if(!allowedEmail(email,process.env.ALLOWED_EMAIL_DOMAIN||'nhtc.com.vn')||typeof code!=='string'||!/^\d{6}$/.test(code))return Response.json({error:'Email hoặc mã không hợp lệ.'},{status:400});
 if(!process.env.AUTH_SECRET||process.env.AUTH_SECRET.length<32)return Response.json({error:'Chưa cấu hình đăng nhập.'},{status:503});
 let client;try{client=await getDb().connect();await client.query('BEGIN');const {rows}=await client.query('SELECT *,expires_at>now() AS valid FROM tour_codes WHERE email=$1 FOR UPDATE',[email]);const row=rows[0];
 if(!row||!row.valid||row.attempts>=5){await client.query('ROLLBACK');return Response.json({error:'Mã đã hết hạn hoặc bị khóa. Hãy yêu cầu mã mới.'},{status:400});}
 if(row.code_hash!==codeHash(email,code,process.env.AUTH_SECRET)){await client.query('UPDATE tour_codes SET attempts=attempts+1 WHERE email=$1',[email]);await client.query('COMMIT');return Response.json({error:'Mã không đúng.'},{status:400});}
 const token=newToken();await client.query('DELETE FROM tour_codes WHERE email=$1',[email]);await client.query("INSERT INTO tour_sessions(token_hash,email,expires_at) VALUES($1,$2,now()+interval '7 days')",[tokenHash(token),email]);await client.query('COMMIT');
 (await cookies()).set(sessionCookie,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:604800});return Response.json({ok:true});
 }catch{await client?.query('ROLLBACK').catch(()=>{});return Response.json({error:'Chưa đăng nhập được. Vui lòng thử lại.'},{status:503});}finally{client?.release();}
}
