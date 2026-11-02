'use client';
import {useEffect,useState} from 'react';

export default function GoogleButton({next}:{next:string}){
 const [csrf,setCsrf]=useState('');
 useEffect(()=>{fetch('/api/auth/csrf').then(r=>r.json()).then(d=>setCsrf(d.csrfToken||''))},[]);
 return <form action="/api/auth/signin/google" method="POST">
  <input type="hidden" name="csrfToken" value={csrf}/>
  <input type="hidden" name="callbackUrl" value={next}/>
  <button className="button primary" type="submit" disabled={!csrf}>Đăng nhập bằng Google</button>
 </form>;
}
