import {auth} from '@/auth';
import {redirect} from 'next/navigation';
import GoogleButton from './GoogleButton';

function safeNext(v?:string){
 return v&&v.startsWith('/')&&!v.startsWith('//')?v:'/?vote=1';
}

export default async function Login({searchParams}:{searchParams:Promise<{next?:string,error?:string}>}){
 const q=await searchParams;
 const next=safeNext(q.next);
 const session=await auth();
 if(session?.user)redirect(next);
 const msg=q.error==='AccessDenied'?'Mail này không thuộc workspace @nhtc.com.vn.'
  :q.error==='Configuration'?'Chưa đăng nhập được. Kiểm tra biến AUTH_* trên Vercel và redirect URI Google Cloud.'
  :q.error?`Lỗi đăng nhập: ${q.error}`:null;
 return <main className="login-shell"><section className="login-card">
  <a className="brand" href="/">đi<span>đâu</span><i>↗</i></a>
  <span className="eyebrow">NHTC WORKSPACE</span>
  <h1>Đăng nhập để bình chọn.</h1>
  <p>Chỉ nhận tài khoản Google công ty <b>@nhtc.com.vn</b>. Xem tour vẫn không cần đăng nhập.</p>
  {msg&&<p className="error">{msg}</p>}
  <GoogleButton next={next}/>
  <small>Google sẽ hỏi chọn tài khoản. Nếu bạn đang mở Gmail cá nhân, chọn đúng mail công ty.</small>
 </section></main>;
}
