import {createHash,createHmac,randomBytes,randomInt} from 'node:crypto';
export function normalizeEmail(value){return typeof value==='string'?value.trim().toLowerCase():'';}
export function allowedEmail(value,domain='nhtc.com.vn'){const email=normalizeEmail(value);return /^[a-z0-9.!#$%&'*+\-/=?^_`{|}~]+@[a-z0-9.-]+$/.test(email)&&email.length<=254&&email.split('@').length===2&&email.split('@')[1]===domain.toLowerCase();}
export const tokenHash=value=>createHash('sha256').update(value).digest('hex');
export const codeHash=(email,code,secret)=>createHmac('sha256',secret).update(email+'\0'+code).digest('hex');
export const newCode=()=>randomInt(0,1000000).toString().padStart(6,'0');
export const newToken=()=>randomBytes(32).toString('hex');
export function isSameOrigin(request){try{const origin=request.headers.get('origin');if(!origin)return false;const url=new URL(request.url),from=new URL(origin);const host=request.headers.get('host');return from.origin===url.origin||!!host&&from.origin===url.protocol+'//'+host;}catch{return false;}}
