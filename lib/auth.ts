import {cookies} from 'next/headers';
import {getDb} from './db';
import {allowedEmail,tokenHash} from './security.mjs';
export const sessionCookie='tour_session';
export async function currentUser(){const token=(await cookies()).get(sessionCookie)?.value;if(!token||!/^[a-f0-9]{64}$/.test(token))return null;const {rows}=await getDb().query('SELECT email FROM tour_sessions WHERE token_hash=$1 AND expires_at>now()',[tokenHash(token)]);const email=rows[0]?.email;return email&&allowedEmail(email,process.env.ALLOWED_EMAIL_DOMAIN||'nhtc.com.vn')?{email}:null;}
export const noStore={'Cache-Control':'no-store, private'};
