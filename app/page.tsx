import {redirect} from 'next/navigation';
import {currentUser} from '../lib/auth';
import TourApp from './TourApp';
export const dynamic='force-dynamic';
export default async function Page(){const user=await currentUser();if(!user)redirect('/login');return <TourApp email={user.email}/>;}
