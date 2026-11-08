import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDownWideNarrow, Check, ChevronDown, Heart, Search, SlidersHorizontal, Sparkles, Type, X } from 'lucide-react'
import './style.css'

const families = [
  ['Inter','sans'],['Roboto','sans'],['Open Sans','sans'],['Lato','sans'],['Montserrat','sans'],['Poppins','sans'],['Nunito','sans'],['Nunito Sans','sans'],['Manrope','sans'],['DM Sans','sans'],['Plus Jakarta Sans','sans'],['Work Sans','sans'],['Source Sans 3','sans'],['IBM Plex Sans','sans'],['Outfit','sans'],['Urbanist','sans'],['Raleway','sans'],['Rubik','sans'],['Figtree','sans'],['Barlow','sans'],['Karla','sans'],['Mulish','sans'],['Cabin','sans'],['Archivo','sans'],['Lexend','sans'],['Josefin Sans','sans'],['Quicksand','sans'],['Heebo','sans'],['PT Sans','sans'],['Noto Sans','sans'],['Ubuntu','sans'],['Titillium Web','sans'],['Exo 2','sans'],['Oxygen','sans'],['Fira Sans','sans'],['Red Hat Display','sans'],['Sora','sans'],['Albert Sans','sans'],['Instrument Sans','sans'],['Geist','sans'],['Bricolage Grotesque','sans'],['Space Grotesk','sans'],['Epilogue','sans'],['Onest','sans'],['Hanken Grotesk','sans'],['Public Sans','sans'],['Signika','sans'],['Varela Round','sans'],['Dosis','sans'],['Maven Pro','sans'],
  ['Merriweather','serif'],['Playfair Display','serif'],['Lora','serif'],['PT Serif','serif'],['Source Serif 4','serif'],['Libre Baskerville','serif'],['DM Serif Display','serif'],['Cormorant Garamond','serif'],['Bodoni Moda','serif'],['Crimson Text','serif'],['EB Garamond','serif'],['Spectral','serif'],['Libre Caslon Text','serif'],['Bitter','serif'],['Literata','serif'],['Fraunces','serif'],['Newsreader','serif'],['Alegreya','serif'],['Lora','serif'],['Gelasio','serif'],['Vollkorn','serif'],['Cardo','serif'],['Prata','serif'],['Zilla Slab','serif'],['Roboto Slab','serif'],['Arvo','serif'],['Bree Serif','serif'],['Noto Serif','serif'],['Brygada 1918','serif'],['Instrument Serif','serif'],['Young Serif','serif'],['DM Serif Text','serif'],['Gloock','serif'],['Newsreader','serif'],
  ['Oswald','display'],['Bebas Neue','display'],['Anton','display'],['Archivo Black','display'],['Abril Fatface','display'],['Righteous','display'],['Bungee','display'],['Alfa Slab One','display'],['Passion One','display'],['Lobster','display'],['Bowlby One SC','display'],['Lilita One','display'],['Russo One','display'],['Fjalla One','display'],['Teko','display'],['Staatliches','display'],['DM Mono','mono'],['Roboto Mono','mono'],['Space Mono','mono'],['JetBrains Mono','mono'],['Fira Code','mono'],['IBM Plex Mono','mono'],['Source Code Pro','mono'],['Inconsolata','mono'],['Ubuntu Mono','mono'],['Anonymous Pro','mono'],['Share Tech Mono','mono'],['Caveat','hand'],['Dancing Script','hand'],['Pacifico','hand'],['Sacramento','hand'],['Great Vibes','hand'],['Satisfy','hand'],['Kalam','hand'],['Patrick Hand','hand'],['Shadows Into Light','hand'],['Permanent Marker','hand'],['Lobster Two','hand'],['Cookie','hand'],
].map(([name, category], i) => ({ name, category, id: `${name.toLowerCase().replaceAll(' ', '-')}-${i}` }))

const categoryNames = { all: 'Tất cả', sans: 'Không chân', serif: 'Có chân', display: 'Tiêu đề', mono: 'Lập trình', hand: 'Viết tay' }
const sampleDefault = 'Sphinx of black quartz, judge my vow.'
const weightLabels = { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' }

function App() {
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [sample, setSample] = useState(sampleDefault)
  const [fontSize, setFontSize] = useState(30)
  const [weight, setWeight] = useState('400')
  const [favorites, setFavorites] = useState(() => new Set(JSON.parse(localStorage.getItem('fontroom-favorites') || '[]')))
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [sort, setSort] = useState('popular')
  const [sortOpen, setSortOpen] = useState(false)
  const [loaded, setLoaded] = useState(new Set())
  const [copied, setCopied] = useState('')
  const seen = useRef(new Set())
  const searchRef = useRef(null)

  const filtered = useMemo(() => {
    let result = families.filter(f => (category === 'all' || f.category === category) && f.name.toLowerCase().includes(query.trim().toLowerCase()) && (!onlyFavorites || favorites.has(f.name)))
    if (sort === 'az') result = [...result].sort((a,b) => a.name.localeCompare(b.name))
    else if (sort === 'favorites') result = [...result].sort((a,b) => Number(favorites.has(b.name)) - Number(favorites.has(a.name)))
    return result
  }, [category, query, onlyFavorites, favorites, sort])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const name = entry.target.dataset.font
          if (name && !seen.current.has(name)) {
            seen.current.add(name)
            const family = encodeURIComponent(name).replaceAll('%20', '+')
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`
            document.head.appendChild(link)
            setLoaded(old => new Set(old).add(name))
          }
        }
      })
    }, { rootMargin: '180px' })
    document.querySelectorAll('[data-font]').forEach(node => observer.observe(node))
    return () => observer.disconnect()
  }, [filtered])

  useEffect(() => { localStorage.setItem('fontroom-favorites', JSON.stringify([...favorites])) }, [favorites])

  useEffect(() => {
    const onKeyDown = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const toggleFavorite = name => setFavorites(current => {
    const next = new Set(current)
    next.has(name) ? next.delete(name) : next.add(name)
    return next
  })
  const copyFont = async (name) => {
    await navigator.clipboard.writeText(`font-family: '${name}', sans-serif;`)
    setCopied(name)
    window.setTimeout(() => setCopied(''), 1600)
  }

  return <main>
    <header className="topbar">
      <a className="brand" href="#top"><span className="brand-mark"><Type size={18} strokeWidth={2.5}/></span> fontroom<span className="brand-period">.</span></a>
      <div className="topbar-note"><span className="online-dot"/> Thư viện font cho mọi dự án</div>
      <button className={`saved-top ${onlyFavorites ? 'active' : ''}`} onClick={() => setOnlyFavorites(!onlyFavorites)}><Heart size={16} fill={onlyFavorites ? 'currentColor' : 'none'}/> <span>Đã lưu</span><b>{favorites.size}</b></button>
    </header>

    <section className="hero" id="top">
      <div className="hero-copy"><div className="eyebrow"><Sparkles size={13}/> TÌM FONT HỢP GU</div><h1>Mỗi chữ một<br/><span>cá tính.</span></h1><p>Thử font, cảm nhận chất riêng, chọn kiểu chữ<br className="desktop-only"/> phù hợp cho thiết kế tiếp theo của bạn.</p></div>
      <div className="hero-preview" aria-label="Bản xem trước font"><div className="preview-top"><span>YOUR NEXT IDEA</span><span className="preview-dash">✳</span></div><div className="preview-word">Aa</div><div className="preview-bottom"><span>DISPLAY<br/><b>01 / 100+</b></span><span className="preview-line"/><span className="preview-type">A a<br/>Bb Cc</span></div></div>
      <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
    </section>

    <section className="explorer" id="fonts">
      <div className="explorer-heading"><div><div className="section-kicker">BỘ SƯU TẬP</div><h2>Chọn kiểu chữ của bạn<span>.</span></h2></div><div className="count-badge">{filtered.length} <span>fonts</span></div></div>
      <div className="toolbar">
        <div className="search-box"><Search size={17}/><input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm font chữ..." aria-label="Tìm font chữ"/>{query && <button className="clear-search" onClick={() => setQuery('')} aria-label="Xóa tìm kiếm"><X size={15}/></button>}<kbd>⌘ K</kbd></div>
        <div className="toolbar-actions"><button className={`filter-toggle ${onlyFavorites ? 'selected' : ''}`} onClick={() => setOnlyFavorites(!onlyFavorites)}><SlidersHorizontal size={15}/><span>Đã lưu</span></button><div className="sort-wrap"><button className="sort-button" onClick={() => setSortOpen(!sortOpen)}><ArrowDownWideNarrow size={15}/><span>{sort === 'az' ? 'Tên A—Z' : sort === 'favorites' ? 'Đã lưu trước' : 'Phổ biến'}</span><ChevronDown size={14}/></button>{sortOpen && <div className="sort-menu">{[['popular','Phổ biến'],['az','Tên A—Z'],['favorites','Đã lưu trước']].map(([id,label])=><button key={id} onClick={()=>{setSort(id);setSortOpen(false)}}>{label}{sort===id&&<Check size={14}/>}</button>)}</div>}</div></div>
      </div>
      <div className="categories" role="tablist" aria-label="Phân loại font">{Object.entries(categoryNames).map(([id,label])=><button key={id} role="tab" aria-selected={category===id} className={category===id?'active':''} onClick={()=>setCategory(id)}>{label}{id==='all'&&<span>{families.length}</span>}</button>)}</div>
      <div className="sample-controls"><div className="sample-input"><span className="sample-tag">Aa</span><input value={sample} onChange={e=>setSample(e.target.value)} aria-label="Câu mẫu"/><button onClick={()=>setSample('')} aria-label="Xóa câu mẫu"><X size={15}/></button></div><div className="sample-options"><label><span>Cỡ chữ</span><input type="range" min="20" max="48" value={fontSize} onChange={e=>setFontSize(+e.target.value)} aria-label="Cỡ chữ"/><b>{fontSize}px</b></label><div className="weight-picker" aria-label="Độ đậm">{['400','500','600','700'].map(w=><button key={w} className={weight===w?'active':''} onClick={()=>setWeight(w)} title={weightLabels[w]}>{w==='400'?'R':w==='500'?'M':w==='600'?'S':'B'}</button>)}</div></div></div>
      <div className="results-label">{onlyFavorites ? 'FONT ĐÃ LƯU' : 'FONT DÀNH CHO BẠN'} <span>{filtered.length} kết quả</span></div>
      {filtered.length ? <div className="font-grid">{filtered.map((font,index)=><article className="font-card" data-font={font.name} key={font.id} style={{'--card-index': index%12}}><div className="card-head"><div className="font-name-wrap"><h3>{font.name}</h3><span className={`category-pill ${font.category}`}>{categoryNames[font.category]}</span></div><button className={`heart-button ${favorites.has(font.name)?'is-favorite':''}`} onClick={()=>toggleFavorite(font.name)} aria-label={favorites.has(font.name)?`Bỏ lưu ${font.name}`:`Lưu ${font.name}`}><Heart size={17} fill={favorites.has(font.name)?'currentColor':'none'}/></button></div><div className={`font-sample ${loaded.has(font.name)?'loaded':''}`} style={{fontFamily: loaded.has(font.name) ? `'${font.name}', ${font.category==='serif'?'serif':font.category==='mono'?'monospace':font.category==='hand'?'cursive':'sans-serif'}` : 'inherit',fontSize:`${fontSize}px`,fontWeight:weight}}>{sample||'Type something...'}</div><div className="card-foot"><span className="specimen">Aa Bb Cc <i>123</i></span><button className="copy-button" onClick={()=>copyFont(font.name)}>{copied===font.name?<><Check size={13}/> Đã copy</>:<>Dùng font <span>↗</span></>}</button></div></article>)}</div> : <div className="empty-state"><div className="empty-icon"><Search size={22}/></div><h3>Chưa tìm thấy font phù hợp</h3><p>Thử tên khác hoặc chọn một nhóm font.</p><button onClick={()=>{setQuery('');setCategory('all');setOnlyFavorites(false)}}>Xóa bộ lọc</button></div>}
      <footer className="footer"><div className="footer-brand">fontroom<span>.</span></div><div>Made for people who care about type.</div><div>Google Fonts · {families.length} typefaces</div></footer>
    </section>
  </main>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
