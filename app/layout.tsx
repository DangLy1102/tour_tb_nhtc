import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Đi đâu cùng nhau? | So sánh & bình chọn tour',description:'7 tour từ TP.HCM: đối chiếu lịch trình, chi phí và cùng bình chọn chuyến đi.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="vi"><body>{children}</body></html>}
