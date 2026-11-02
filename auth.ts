import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const domain='@nhtc.com.vn';

export const {handlers,signIn,signOut,auth}=NextAuth({
 secret:process.env.AUTH_SECRET,
 trustHost:true,
 pages:{error:'/login'},
 providers:[Google({clientId:process.env.AUTH_GOOGLE_ID,clientSecret:process.env.AUTH_GOOGLE_SECRET,authorization:{params:{hd:'nhtc.com.vn',prompt:'select_account'}}})],
 callbacks:{
  signIn({profile}){
   const email=String(profile?.email||'').toLowerCase();
   return Boolean(profile?.email_verified&&email.endsWith(domain));
  }
 }
});
