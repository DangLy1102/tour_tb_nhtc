import nodemailer from 'nodemailer';
import {getDb} from '../../../../lib/db';
import {allowedEmail,normalizeEmail,newCode,codeHash,tokenHash,isSameOrigin} from '../../../../lib/security.mjs';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!isSameOrigin(request))return Response.json({error:'Yêu cầu không hợp lệ.'},{status:403});
 const {SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASSWORD,SMTP_FROM,AUTH_SECRET}=process.env;
 if(!SMTP_HOST||!SMTP_USER||!SMTP_PASSWORD||!SMTP_FROM||!AUTH_SECRET||AUTH_SECRET.length<32||!process.env.DATABASE_URL)return Response.json({error:'Quản trị viên cần cấu hình database và SMTP trước khi đăng nhập.'},{status:503});
 let email:string;try{email=normalizeEmail((await request.json()).email);}catch{return Response.json({error:'Dữ liệu không hợp lệ.'},{status:400});}
 if(!allowedEmail(email,process.env.ALLOWED_EMAIL_DOMAIN||'nhtc.com.vn'))return Response.json({error:'Chỉ chấp nhận email công ty @'+(process.env.ALLOWED_EMAIL_DOMAIN||'nhtc.com.vn')+'.'},{status:400});
 const code=newCode(),hash=codeHash(email,code,AUTH_SECRET);
 const ip=tokenHash(request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'local');
 let client;try{
  client=await getDb().connect();await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[ip]);await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[email]);
  const {rows}=await client.query("SELECT COUNT(*) FILTER(WHERE email=$1 AND created_at>now()-interval '60 seconds') AS recent, COUNT(*) FILTER(WHERE email=$1) AS per_email, COUNT(*) FILTER(WHERE ip_hash=$2) AS per_ip FROM tour_mail_requests WHERE created_at>now()-interval '1 hour'",[email,ip]);
  if(Number(rows[0].recent)>0||Number(rows[0].per_email)>=5||Number(rows[0].per_ip)>=20){await client.query('ROLLBACK');return Response.json({error:'Đã gửi quá nhanh. Vui lòng đợi ít nhất 60 giây hoặc thử lại sau.'},{status:429});}
  await client.query("INSERT INTO tour_codes(email,code_hash,expires_at) VALUES($1,$2,now()+interval '10 minutes') ON CONFLICT(email) DO UPDATE SET code_hash=$2,expires_at=now()+interval '10 minutes',attempts=0",[email,hash]);
  await client.query('INSERT INTO tour_mail_requests(email,ip_hash) VALUES($1,$2)',[email,ip]);await client.query('COMMIT');
  await nodemailer.createTransport({host:SMTP_HOST,port:Number(SMTP_PORT||587),secure:Number(SMTP_PORT||587)===465,auth:{user:SMTP_USER,pass:SMTP_PASSWORD},connectionTimeout:10000,socketTimeout:15000}).sendMail({from:SMTP_FROM,to:email,subject:'Mã đăng nhập bình chọn tour NHTC',text:`Mã đăng nhập của bạn: ${code}\nMã có hiệu lực 10 phút và chỉ dùng một lần. Không chia sẻ mã này.`});
  return Response.json({ok:true});
 }catch{if(client){await client.query('ROLLBACK').catch(()=>{});await client.query('DELETE FROM tour_codes WHERE email=$1 AND code_hash=$2',[email,hash]).catch(()=>{});}return Response.json({error:'Chưa gửi được mã. Vui lòng kiểm tra cấu hình SMTP/database hoặc thử lại sau.'},{status:503});}finally{client?.release();}
}
