import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Đi đâu cùng nhau? | So sánh & bình chọn tour',description:'10 hành trình tầm 14–17 triệu từ TP.HCM: lịch trình, ảnh, chi phí và bình chọn chuyến đi của nhóm.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="vi"><body>{children}</body></html>}
