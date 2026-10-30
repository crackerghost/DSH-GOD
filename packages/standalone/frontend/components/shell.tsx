import { Coffee, Activity, Boxes, Cable, ChevronRight, Handshake, LayoutDashboard, LogOut, Moon, Network, Settings2, ShieldCheck, Sun, Monitor, PanelsTopLeft, LibraryBig, Route, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import brandMark from '../../../../icon.svg?inline'
import { Badge, Button } from './ui'
import type { Host, Page, Summary } from '../types'
import { hasDesktopBridge } from '../desktop-update'

const navigation = [
  { label: 'Workspace', items: [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'workspace', name: 'Model workbench', icon: PanelsTopLeft },
    { id: 'agents', name: 'Clients and subscriptions', icon: Monitor },
    { id: 'models', name: 'Model catalog', icon: Boxes },
    { id: 'usage', name: 'Usage', icon: Activity },
    { id: 'library', name: 'Resource library', icon: LibraryBig },
  ] },
  { label: 'Channels and connections', items: [
    { id: 'providers', name: 'Provider connections', icon: PanelsTopLeft },
    { id: 'routing', name: 'Routing groups', icon: Route },
    { id: 'channels', name: 'EAC router', icon: Network },
    { id: 'eac', name: 'EAC shared channel', icon: Handshake },
    { id: 'connection', name: 'API access', icon: Cable },
  ] },
  { label: 'Management', items: [{ id: 'settings', name: 'Service settings', icon: Settings2 }, { id: 'updates', name: 'App updates', icon: RotateCw }] },
  { label: 'Project support', items: [{ id: 'sponsor', name: 'Sponsor', icon: Coffee }] },
] as const

/**
 * 侧边栏能到达的每一个页面，按侧边栏顺序排列。
 *
 * `App` 用它当导航白名单：不在这份名单里的页面会被 `host.navigate` **静默丢弃**。
 * 此前 `app.tsx` 自己又写了一份同样的数组，两份一漂移就出了「模型工作台」
 * 点了没反应 —— 侧边栏有这一项、白名单里没有，`navigate('workspace')` 直接被
 * `includes` 短路，无报错、无 loading、内容区不切换（#678）。
 *
 * 从侧边栏**推导**而不是重述，是让这两份永远不可能再漂移的唯一办法。
 */
export const navigationPages: Page[] = navigation.flatMap(group => group.items.map(item => item.id))

type Origin = { x: number; y: number }

function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  const apply = (next: 'light' | 'dark') => {
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('ofm-theme', next) } catch { /* 存储不可用时仅本次会话生效 */ }
    setTheme(next)
  }
  const toggle = (origin?: Origin) => {
    const next = theme === 'dark' ? 'light' : 'dark'
    // 没有 View Transition、或用户要求减少动效时直接切换，不做扩散。
    if (!origin || typeof document.startViewTransition !== 'function'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { apply(next); return }
    const root = document.documentElement
    // 半径取按钮中心到视口最远角的距离，保证圆盘一定盖满整屏。
    const radius = Math.hypot(Math.max(origin.x, window.innerWidth - origin.x), Math.max(origin.y, window.innerHeight - origin.y))
    root.style.setProperty('--theme-reveal-x', `${origin.x}px`)
    root.style.setProperty('--theme-reveal-y', `${origin.y}px`)
    root.style.setProperty('--theme-reveal-r', `${radius}px`)
    // 扩散期间关掉 300ms 的底色过渡，否则"新主题"快照会抓到过渡中间色。
    root.classList.add('theme-transitioning')
    const transition = document.startViewTransition(() => { flushSync(() => apply(next)) })
    const finish = () => {
      root.classList.remove('theme-transitioning')
      root.style.removeProperty('--theme-reveal-x')
      root.style.removeProperty('--theme-reveal-y')
      root.style.removeProperty('--theme-reveal-r')
    }
    transition.finished.then(finish, finish)
  }
  return { theme, toggle }
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
  return <Button variant="ghost" className="theme-toggle" aria-label={label} title={theme === 'dark' ? 'light color' : 'Dark'}
    onClick={event => { const rect = event.currentTarget.getBoundingClientRect(); toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }) }}>
    <span className="theme-toggle-track" data-theme={theme}>
      <span className="theme-toggle-icon theme-toggle-sun" aria-hidden="true"><Sun size={16} /></span>
      <span className="theme-toggle-icon theme-toggle-moon" aria-hidden="true"><Moon size={16} /></span>
    </span>
  </Button>
}

export const pageNames: Record<Page, string> = {
  overview: 'Overview', workspace: 'Model workspace', models: 'Model catalog', usage: 'Usage', channels: 'EAC router',
  agents: 'Clients and subscriptions', providers: 'Provider connections', library: 'Resource library', routing: 'Routing groups',
  eac: 'EAC shared channel', settings: 'Service settings', updates: 'App updates', connection: 'API access', sponsor: 'Sponsor',
}

export function Sidebar({ page, summary, host, onDisclaimer }: { page: Page; summary?: Summary; host: Host; onDisclaimer(): void }) {
  return <>
    <a className="console-brand" href="/" aria-label="Our Free Model Home Page">
      <img className="console-mark" src={brandMark} alt="" width={34} height={36} />
      <span>Our Free Model<small>Local AI workspace</small></span>
    </a>
    <div className="workspace-switch"><span className="workspace-avatar"><ShieldCheck size={17} /></span>
      <span>Personal workspace<small>Standalone service</small></span><Badge>Local</Badge>
    </div>
    <nav className="console-nav" aria-label="Admin navigation">{navigation.map(group => <div className="nav-group" key={group.label}>
      <span className="nav-group-label">{group.label}</span>
      {group.items.filter(item => item.id !== 'updates' || hasDesktopBridge()).map(item => <button key={item.id} id={item.id === 'sponsor' ? 'ofm-sponsor-menu-desktop' : undefined} className={`console-nav-item ${item.id === 'sponsor' ? 'ofm-sponsor-nav' : ''} ${page === item.id ? 'selected' : ''}`}
        aria-current={page === item.id ? 'page' : undefined} onClick={() => host.navigate(item.id)}>
        <span className="console-nav-indicator" aria-hidden="true" />
        <item.icon size={18} strokeWidth={1.7} /><span>{item.name}</span>
        {item.id === 'models' && <span className="count-badge">{summary?.catalog.length ?? '—'}</span>}
      </button>)}
    </div>)}</nav>
    <div className="sidebar-support"><ShieldCheck size={17} /><div><strong>Local storage</strong><p>Runs on this computer · Local connections only</p></div></div>
    <div className="console-sidebar-footer"><div><span className="status-dot" />Service online<small>v{summary?.version ?? '—'}</small></div>
      <ThemeToggle /><Button variant="ghost" aria-label="Exit management" title="Exit management" onClick={() => { void host.logout().catch(host.error) }}><LogOut size={16} /></Button></div>
    <button type="button" className="sidebar-disclaimer" onClick={onDisclaimer}>Instructions for use and disclaimer</button>
  </>
}
export function Topbar({ page, summary }: { page: Page; summary?: Summary }) {
  return <><div className="console-breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong key={page} className="console-breadcrumb-current">{pageNames[page]}</strong></div>
    <div className="console-topbar-status"><span className="status-dot" /><span>{summary?.settings.enabled === false ? 'Inference paused' : 'Local service'}</span><span className="topbar-divider" /><span>LOCAL</span></div></>
}
