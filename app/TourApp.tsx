'use client';
import {useEffect,useState} from 'react';
import {tours,heroSlides} from './data';
import type {Tour} from './data';
const money=(n:number)=>new Intl.NumberFormat('vi-VN').format(n)+'đ';
const chips=['Tất cả','Mới tìm','Không shopping','Trung Quốc','Đài Loan','Hàn Quốc','Singapore'];
export default function TourApp(){
 const [filter,setFilter]=useState('Tất cả');const [search,setSearch]=useState('');const [budget,setBudget]=useState(false);
 const [selected,setSelected]=useState<string[]>(['higo','tugo','lijiang']);const [detail,setDetail]=useState<Tour|null>(null);
 const [tab,setTab]=useState('Lịch trình');const [photo,setPhoto]=useState(0);const [hero,setHero]=useState(0);
 const [counts,setCounts]=useState<Record<string,number>>({});const [mine,setMine]=useState<string|null>(null);const [me,setMe]=useState<string|null>(null);const [loaded,setLoaded]=useState(false);
 const [usd,setUsd]=useState(26000);const [people,setPeople]=useState(2);const [single,setSingle]=useState(false);const [sort,setSort]=useState('recommend');
 useEffect(()=>{Promise.all([fetch('/api/auth/session').then(r=>r.json()),fetch('/api/votes').then(r=>r.json())]).then(([s,v])=>{setMe(s?.user?.email??v.email??null);setCounts(v.counts||{});setMine(v.mine??null)}).catch(()=>{}).finally(()=>setLoaded(true));if(new URLSearchParams(location.search).has('vote'))document.getElementById('vote')?.scrollIntoView({behavior:'smooth'});},[]);
 useEffect(()=>{const t=setInterval(()=>setHero(h=>(h+1)%heroSlides.length),5500);return()=>clearInterval(t);},[]);
 useEffect(()=>{document.body.style.overflow=detail?'hidden':'';const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setDetail(null)};window.addEventListener('keydown',key);return()=>{document.body.style.overflow='';window.removeEventListener('keydown',key)};},[detail]);
 function login(){location.href='/login?next='+encodeURIComponent('/?vote=1')}
 async function vote(id:string|null){if(!me){login();return}const r=await fetch('/api/votes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});if(r.status===401){login();return}const v=await r.json();setCounts(v.counts||{});setMine(v.mine??null);setMe(v.email??me)}
 function open(t:Tour){setDetail(t);setTab('Lịch trình');setPhoto(0)}
 function toggle(id:string){setSelected(s=>s.includes(id)?s.filter(x=>x!==id):s.length<4?[...s,id]:s)}
 const total=Object.values(counts).reduce((a,b)=>a+b,0);
 const top=[...tours].filter(t=>!t.expired).sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0));
 const visible=tours.filter(t=>(filter==='Tất cả'||filter==='Mới tìm'&&t.fresh||filter==='Không shopping'&&t.shop==='Không shopping'||filter===t.country)&&(!budget||t.price>=15000000&&t.price<=16000000)&&`${t.name} ${t.operator} ${t.highlights.join(' ')}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort==='price'?a.price-b.price:sort==='votes'?(counts[b.id]||0)-(counts[a.id]||0):Number(!!a.expired)-Number(!!b.expired));
 const compare=tours.filter(t=>selected.includes(t.id));
 const live=tours.filter(t=>!t.expired).length;
 const fresh=tours.filter(t=>t.fresh).length;
 const slide=heroSlides[hero];
 return <>
 <header><a className="brand" href="#">đi<span>đâu</span><i>↗</i></a><nav><a href="#tours">Khám phá tour</a><a href="#compare">So sánh <b>{selected.length}</b></a><a href="#vote">Bình chọn</a></nav>{me?<span className="navuser"><span title={me}>{me}</span><a href="/logout">Đăng xuất</a></span>:<a className="navuser" href="/login?next=%2F%3Fvote%3D1">Đăng nhập Google</a>}</header>
 <main>
 <section className="hero">
  <div className="hero-copy"><span className="eyebrow">HẸN NHAU MỘT CHUYẾN ĐI · 2026</span>
   <h1>Đi đâu cũng được.<br/><em>Miễn là cùng nhau.</em></h1>
   <p>{live} hành trình cùng tầm 14–18 triệu từ TP.HCM — cổ trấn, núi tuyết, hồ ngũ sắc hay skyline.<br/>Xem lịch, ảnh, chi phí rồi chọn chuyến của cả nhóm.</p>
   <div className="hero-actions"><a className="button primary" href="#tours">Tìm chuyến đi của mình ↗</a><a className="textlink" href="#vote">Xem bình chọn ↓</a></div>
   <div className="hero-stats"><span><strong>{String(live).padStart(2,'0')}</strong> hành trình</span><span><strong>{String(fresh).padStart(2,'0')}</strong> tour mới tìm</span><span><strong>14–18tr</strong> tầm giá đối chiếu</span></div>
  </div>
  <div className="hero-image" style={{backgroundImage:`linear-gradient(180deg,transparent 32%,#152923cc),url('${slide.img}')`}}>
   <span className="phototag">{slide.tag}</span>
   <div><span>{slide.kicker}</span><h2>{slide.title}</h2><p>{slide.text}</p></div>
   <div className="hero-dots">{heroSlides.map((_,i)=><button key={i} className={i===hero?'on':''} aria-label={'Ảnh '+(i+1)} onClick={()=>setHero(i)}/>)}</div>
  </div>
 </section>
 <div className="context"><span className="dot"/> Đối chiếu ngày 02/11/2026 <span className="separator">/</span> Giá người lớn, ở ghép. Ảnh minh họa. Chỗ và giá cuối cùng cần nhà tour xác nhận.</div>
 <section id="tours">
  <div className="section-head"><div><span className="eyebrow">01 / CHỌN HÀNH TRÌNH</span><h2>Chuyến nào hợp với bạn?</h2></div><p>Từ Ô Trấn đến Lệ Giang, Cửu Trại, Singapore.<br/>Chọn tối đa 4 tour để đặt cạnh nhau.</p></div>
  <div className="filterbar"><div className="chips">{chips.map(f=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f}</button>)}</div><input aria-label="Tìm tour" placeholder="Tìm điểm đến, nhà tour, điểm nhấn…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
  <div className="subfilter"><label><input type="checkbox" checked={budget} onChange={e=>setBudget(e.target.checked)}/> Chỉ giá tour 15–16 triệu</label><div><span>{visible.length} hành trình</span><select aria-label="Sắp xếp" value={sort} onChange={e=>setSort(e.target.value)}><option value="recommend">Theo danh sách</option><option value="price">Giá thấp đến cao</option><option value="votes">Nhiều bình chọn</option></select></div></div>
  <div className="grid">{visible.map(t=>{const cover=t.images[0];return <article className={'card '+(t.expired?'expired':'')} key={t.id}>
   <div className="card-image" style={{backgroundImage:`linear-gradient(0deg,#0d201e55,transparent 45%),url("${cover}")`}} onClick={()=>open(t)}>
    <span className={'badge '+(t.fresh?'new':'')}>{t.expired?'LỊCH ĐÃ QUA':t.fresh?'MỚI TÌM THÊM':t.shop==='Không shopping'?'NO SHOPPING':'TỪ PDF CỦA BẠN'}</span>
    <button className={'compare-toggle '+(selected.includes(t.id)?'checked':'')} aria-label={'Chọn so sánh '+t.name} aria-pressed={selected.includes(t.id)} onClick={e=>{e.stopPropagation();toggle(t.id)}}>{selected.includes(t.id)?'✓':'+'}</button>
    <span className="country">{t.country}<span>{t.images.length} ảnh</span></span>
   </div>
   {t.images.length>1&&<div className="card-thumbs">{t.images.map((src,i)=><button key={src} style={{backgroundImage:`url("${src}")`}} aria-label={'Xem ảnh '+(i+1)} onClick={()=>open(t)}/>)}</div>}
   <div className="card-body">
    <div className="card-meta">{t.operator}<span>{t.duration}</span></div>
    <h3>{t.name}</h3>
    <p className="desc">{t.desc}</p>
    <div className="pills">{t.highlights.map(h=><span key={h}>{h}</span>)}</div>
    <div className="features"><span>◷ {t.free==='Không'?'Theo đoàn':t.free+' tự do'}</span><span>⌂ {t.hotel}</span><span>{t.pace}</span></div>
    <div className="price-row"><div><small>GIÁ TOUR TỪ / NGƯỜI</small><strong>{money(t.price)}</strong><span>Chưa gồm tip & chi tiêu riêng</span></div><button className="arrow" onClick={()=>open(t)} aria-label={'Chi tiết '+t.name}>↗</button></div>
    <div className="card-bottom"><button onClick={()=>open(t)}>Lịch trình & ảnh</button><button disabled={t.expired} className={mine===t.id?'voted':''} onClick={()=>vote(mine===t.id?null:t.id)}>{mine===t.id?'♥ Đã chọn':me?'♡ Bình chọn':'♡ Đăng nhập'} <b>{counts[t.id]||0}</b></button></div>
   </div>
  </article>})}</div>
  {!visible.length&&<div className="empty">Chưa có tour phù hợp. Thử đổi bộ lọc hoặc từ khóa.</div>}
 </section>
 <section id="compare">
  <div className="section-head"><div><span className="eyebrow">02 / ĐẶT CẠNH NHAU</span><h2>Nhìn rõ trước khi chọn.</h2></div><button className="subtle" onClick={()=>setSelected([])}>Bỏ chọn tất cả</button></div>
  <p className="muted">Chọn bằng dấu + trên mỗi tour. Tối đa 4 tour; vuốt ngang để xem bảng trên điện thoại.</p>
  {compare.length?<div className="table-wrap"><table><thead><tr><th>Tiêu chí</th>{compare.map(t=><th key={t.id}><img src={t.image} alt=""/><b>{t.name}</b><small>{t.operator}</small><button aria-label={'Bỏ '+t.name} onClick={()=>toggle(t.id)}>×</button></th>)}</tr></thead>
  <tbody>{([['Giá tour từ',(t:Tour)=>money(t.price)],['Thời gian',(t:Tour)=>t.duration],['Điểm nhấn',(t:Tour)=>t.highlights.join(' · ')],['Hợp với',(t:Tour)=>t.bestFor],['Nhịp tour',(t:Tour)=>t.pace],['Shopping',(t:Tour)=>t.shop],['Ngày tự do',(t:Tour)=>t.free],['Khách sạn',(t:Tour)=>t.hotel],['Hành lý',(t:Tour)=>t.bag],['Tip ngoài giá',(t:Tour)=>t.tipVnd?money(t.tipVnd):t.tip+' USD'],['Lịch khởi hành',(t:Tour)=>t.dates],['Cần lưu ý',(t:Tour)=>t.note]] as [string,(t:Tour)=>string][]).map(([label,fn])=><tr key={label}><td>{label}</td>{compare.map(t=><td key={t.id}>{fn(t)}</td>)}</tr>)}</tbody></table></div>:<div className="empty">Chọn tour ở danh sách phía trên để bắt đầu so sánh.</div>}
  <div className="calculator"><div><span className="eyebrow">NGÂN SÁCH DỰ KIẾN</span><h3>Giá tour chỉ là điểm bắt đầu.</h3><p>Ước tính = giá từ + tip + dự trù ăn/đi lại ngoài lịch.<br/>Chưa gồm show, Disney, mua sắm hay phụ thu ngày lễ.</p></div>
   <div className="calc-controls"><label>Số người lớn<input type="number" min="1" max="100" value={people} onChange={e=>setPeople(Math.max(1,Math.min(100,Number(e.target.value)||1)))}/></label><label>USD → VND (giả định)<input type="number" min="1" value={usd} onChange={e=>setUsd(Math.max(1,Number(e.target.value)||1))}/></label><label className="checklabel"><input type="checkbox" checked={single} onChange={e=>setSingle(e.target.checked)}/> Mỗi người một phòng đơn</label></div>
   <div className="calc-results">{compare.map(t=><div key={t.id}><span>{t.name}</span><strong>{money((t.price+(t.tipVnd||t.tip*usd)+t.extra+(single?t.single:0))*people)}</strong><small>{t.extra?`Gồm dự trù ${money(t.extra)}/người`:'Chưa thêm chi tiêu cá nhân'}{single&&t.single===0?' · Chưa có giá phòng đơn':''}{t.expired?' · Giá lịch cũ':''}</small></div>)}</div>
  </div>
 </section>
 <section id="vote" className="vote-section">
  <div className="vote-intro"><span className="eyebrow">03 / CẢ NHÓM CÙNG CHỌN</span><h2>Một phiếu.<br/>Một điểm hẹn.</h2><p>Bình chọn bằng Google Workspace <b>@nhtc.com.vn</b>.<br/>Một người một phiếu, đổi ý được bất cứ lúc nào.</p><div className="vote-total"><strong>{total.toString().padStart(2,'0')}</strong><span>phiếu từ mail công ty</span></div>{me?<small>Đang đăng nhập {me}</small>:<small>Chưa đăng nhập — bấm chọn tour sẽ chuyển sang Google.</small>}</div>
  <div className="ranking">{top.map((t,i)=><div className={'rank '+(mine===t.id?'myvote':'')} key={t.id}><span className="ranknum">{String(i+1).padStart(2,'0')}</span><img src={t.image} alt=""/><div className="rankcontent"><div><strong>{t.name}</strong><span>{counts[t.id]||0} phiếu · {total?Math.round((counts[t.id]||0)*100/total):0}%</span></div><div className="track"><span style={{width:`${total?(counts[t.id]||0)*100/total:0}%`}}/></div></div><button aria-pressed={mine===t.id} onClick={()=>vote(mine===t.id?null:t.id)}>{!me?'Đăng nhập':mine===t.id?'✓ Đã chọn':'Chọn'}</button></div>)}{!total&&<p className="muted">Chưa có phiếu nào. Hãy là người chọn điểm hẹn đầu tiên.</p>}{mine&&<button className="textlink" onClick={()=>vote(null)}>Rút phiếu của tôi</button>}</div>
 </section>
 <section className="sources"><span className="eyebrow">NGUỒN & GHI CHÚ</span><h3>Để mỗi lựa chọn có cơ sở.</h3><p>PDF bạn gửi (HIGO, NLG, Trương Gia Giới, Thâm Quyến, Tugo) + trang nhà tour thật cho các chương trình tra cứu thêm, đối chiếu 02/11/2026. Giá niêm yết, chưa phải giữ chỗ. Tour Thâm Quyến giữ để tham khảo vì lịch đã qua. Ảnh minh họa, không phải ảnh đoàn thật.</p><div>{tours.map(t=><a href={t.source} target="_blank" rel="noreferrer" key={t.id}>{t.sourceLabel} ↗</a>)}</div><p className="muted">Hạng sao theo tiêu chuẩn địa phương. Tỷ giá và dự trù trong công cụ chỉ phục vụ lập ngân sách.</p></section>
 </main>
 <footer><a className="brand" href="#">đi<span>đâu</span><i>↗</i></a><span>Chọn một nơi. Tạo một kỷ niệm.</span><a href="#">Về đầu trang ↑</a></footer>
 {detail&&<div className="modal-backdrop" onClick={()=>setDetail(null)}><section role="dialog" aria-modal="true" aria-label={detail.name} className="modal" onClick={e=>e.stopPropagation()}>
  <button className="close" autoFocus onClick={()=>setDetail(null)} aria-label="Đóng">×</button>
  <div className="modal-photo" style={{backgroundImage:`url("${detail.images[photo]||detail.image}")`}}/>
  <div className="modal-thumbs">{detail.images.map((src,i)=><button key={src} className={i===photo?'on':''} style={{backgroundImage:`url("${src}")`}} onClick={()=>setPhoto(i)} aria-label={'Ảnh '+(i+1)}/>)}</div>
  <span className="eyebrow">{detail.operator} / {detail.country}</span>
  <h2>{detail.name}</h2>
  <div className="modalprice">{money(detail.price)} <small>/ người lớn · {detail.duration}</small></div>
  <div className="pills">{detail.highlights.map(h=><span key={h}>{h}</span>)}</div>
  <p className="muted">{detail.bestFor} · {detail.pace}</p>
  <div className="tabs">{['Lịch trình','Giá & bao gồm','Lưu ý'].map(x=><button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{x}</button>)}</div>
  {tab==='Lịch trình'?<><p className="info"><b>Chuyến bay:</b> {detail.flight}</p><ol className="timeline">{detail.days.map((d,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span><p>{d}</p></li>)}</ol></>
  :tab==='Giá & bao gồm'?<div className="detail-text"><h3>Ngày khởi hành & giá</h3><p>{detail.dates}</p><h3>Đã bao gồm</h3><p>{detail.included}</p><h3>Thanh toán thêm</h3><p>{detail.excluded}</p><p className="info">Giá trẻ em, điều kiện visa và hủy tour: xem tài liệu nguồn và xác nhận nhà tour trước khi cọc.</p></div>
  :<div className="detail-text"><h3>Cần xác nhận trước khi đặt</h3><p>{detail.note}</p><p>Giá và lịch theo tài liệu/website đối chiếu ngày 02/11/2026. Thứ tự điểm có thể thay đổi. Chưa xác nhận tồn chỗ hay giá thanh toán.</p></div>}
  <div className="modalfoot"><a href={detail.source} target="_blank" rel="noreferrer">Xem chương trình gốc ↗</a><button className="button primary" disabled={detail.expired} onClick={()=>vote(mine===detail.id?null:detail.id)}>{mine===detail.id?'✓ Đã bình chọn':me?'Bình chọn tour này ♡':'Đăng nhập để bình chọn'}</button></div>
 </section></div>}
 </>;
}
