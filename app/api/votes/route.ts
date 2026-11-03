import {auth} from '@/auth';
import {tours} from '@/app/data';
import {setVote,tally,VoteStoreError} from '@/lib/votes';

function pack(email:string|null,data:Awaited<ReturnType<typeof tally>>){
 return {counts:data.counts,total:data.total,mine:email?data.votes[email]??null:null,email,who:email?data.who:{}};
}

export const dynamic='force-dynamic';
export const revalidate=0;

function emailOf(session:{user?:{email?:string|null}}|null){
 const email=session?.user?.email?.toLowerCase()||'';
 return email.endsWith('@nhtc.com.vn')?email:null;
}

export async function GET(){
 const session=await auth();
 const email=emailOf(session);
 return Response.json(pack(email,await tally()));
}

export async function POST(req:Request){
 const email=emailOf(await auth());
 if(!email)return Response.json({error:'Cần đăng nhập bằng mail @nhtc.com.vn'},{status:401});
 const body=await req.json().catch(()=>({})) as {id?:string|null};
 const id=body.id??null;
 if(id){
  const t=tours.find(x=>x.id===id);
  if(!t||t.expired)return Response.json({error:'Tour không hợp lệ'},{status:400});
 }
 try{
  return Response.json(pack(email,await setVote(email,id)));
 }catch(e){
  const msg=e instanceof VoteStoreError?e.message:'Không lưu được phiếu. Thử lại sau.';
  return Response.json({error:msg},{status:503});
 }
}
