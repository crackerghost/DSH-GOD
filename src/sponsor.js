/** Sponsor content and daily notice interactions. Browser-only; does not read account data or call sponsor APIs. */
export const SPONSOR = Object.freeze({
  title: 'A message from our sponsor',
  name: 'Beichen API',
  url: 'https://beichenapi.com/register?aff=DL49WAC2DQNG',
  invite: 'DL49WAC2DQNG',
  greeting: 'Dear friends,',
  paragraphs: [
    'Keeping our servers online is expensive, and we are a small team of students. To keep the plugin running, we have partnered with a service that supports us through advertising and referral commissions. We use that support to increase server capacity and maintain the service. Our small server was overwhelmed when the project suddenly became popular, so we had to upgrade. We are sorry if the ad interrupts your experience, and we appreciate your understanding.',
    'This plugin aims to provide free computing resources for learning. Responses can be slow, but we are doing what we can to improve them. The project’s recent popularity took us by surprise. When many people use it at once, response times may increase. Thank you for bearing with us.',
    'The sponsorship helps cover our server and operating costs. It is funded by commissions when people use the partner service. If you choose to sign up, please consider using our referral code. (ʕ  •ᴥ•ʔ)',
    'Beichen API is our partner service. You can find its community group through the link on its homepage. It provides access to international AI models. If you would like to try those models, please consider using our referral link. And please don’t skip the code—one of our teammates is especially invested in it. ( •̥́ ˍ •̀ू )',
    '(•‾̑⌣‾̑•)✧˖ If you need paid model access, you can also consider this service; we think its pricing and quality are good. We plan to keep maintaining this project and providing it for free. This sponsorship is one way to cover the cost of the servers. We are sorry to everyone who dislikes ads, and we appreciate your patience. (ó﹏ò｡)',
    'Most of all, thank you for supporting and using the project. If you prefer not to use a referral link, that is completely fine—using the plugin or giving it a star already means a lot to us. Referral commissions help us keep improving OFM. Thank you again for being here.',
  ],
})

export const SPONSOR_DAY_KEY = 'ofm.sponsor.last-shown.v1'

/** 使用用户当地的日历日期，不能用 UTC 的 toISOString() 划分“今天”。 */
export function sponsorLocalDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** 同源窗口共用 Web Lock；只有公告成功打开后才记账。存储禁用时跳过自动广告。 */
export async function claimSponsorDay({ storage, locks, now = () => new Date(), eligible = () => true, show = () => {} }) {
  const claim = () => {
    if (!eligible()) return false
    const day = sponsorLocalDay(now())
    try {
      if (storage.getItem(SPONSOR_DAY_KEY) === day) return false
      // 写入失败时不弹窗，避免刷新、重挂载或隐私模式下反复打扰。
      const previous = storage.getItem(SPONSOR_DAY_KEY)
      storage.setItem(SPONSOR_DAY_KEY, day)
      try { show() } catch (error) {
        if (previous === null) storage.removeItem(SPONSOR_DAY_KEY)
        else storage.setItem(SPONSOR_DAY_KEY, previous)
        throw error
      }
      return true
    } catch { return false }
  }
  try { return locks?.request ? await locks.request('ofm-sponsor-daily', claim) : claim() }
  catch { return false }
}

/** 两端共用 React 组件；插件通过构建脚本内联，独立端直接导入。 */
export function createSponsorUI(React, image, createPortal, variant = 'plugin') {
  const { createElement: h, useState, useEffect, useRef } = React
  const surfaceClass = `ofm-sponsor ofm-sponsor-${variant}`
  const icon = (name, size = 18) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
    name === 'arrow' ? h('path', { d: 'M7 17 17 7M7 7h10v10' })
      : name === 'close' ? h('path', { d: 'm6 6 12 12M6 18 18 6' })
        : [h('path', { key: 1, d: 'M20 8v5a3 3 0 0 1-3 3H8a4 4 0 0 1-4-4V8zM20 9h1a2 2 0 0 1 0 4h-1M8 4v1m5-1v1' }), h('path', { key: 2, d: 'M4 20h16' })])

  function SponsorArticle() {
    const [copied, setCopied] = useState('')
    const copyTimer = useRef(null)
    useEffect(() => () => clearTimeout(copyTimer.current), [])
    const copy = async (value, label) => {
      try {
        await navigator.clipboard.writeText(value)
        setCopied(`${label} copied`)
      } catch { setCopied('Could not copy. Select and copy the text manually.') }
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(''), 3000)
    }
    const paragraph = index => h('p', { key: index }, SPONSOR.paragraphs[index])
    return h('article', { className: 'ofm-sponsor-article' },
      h('div', { className: 'ofm-sponsor-intro' },
        h('div', null, h('h2', null, 'Help keep the free service running.'), h('p', null, 'A note from the OFM team and an honest invitation to support the project.')),
        h('span', { className: 'ofm-sponsor-seal', 'aria-hidden': true }, icon('cup', 26))),
      h('div', { className: 'ofm-sponsor-letter' },
        h('p', { className: 'ofm-sponsor-greeting' }, SPONSOR.greeting),
        paragraph(0), paragraph(1), paragraph(2),
        h('div', { className: 'ofm-sponsor-contact' },
          h('p', null, 'Here is our referral link:'),
          h('a', { className: 'ofm-sponsor-url', href: SPONSOR.url, target: '_blank', rel: 'noopener noreferrer' }, SPONSOR.url, icon('arrow', 16)),
          h('div', { className: 'ofm-sponsor-copyrow' }, h('span', null, 'Referral code: ', h('strong', null, SPONSOR.invite)),
            h('button', { type: 'button', onClick: () => copy(SPONSOR.invite, 'Referral code') }, 'Copy referral code')),
          h('span', { className: 'ofm-sponsor-copy-status', role: 'status' }, copied)),
        paragraph(3), paragraph(4), paragraph(5),
        h('div', { className: 'ofm-sponsor-signoff' }, h('span', null, 'Thank you for your understanding and support.'), h('strong', null, 'The OFM team'))),
      h('figure', { className: 'ofm-sponsor-evidence' },
        h('figcaption', null, h('strong', null, 'Example images generated through the partner service'), h('span', null, 'Contact us if you spot an issue · Original images below')),
        h('img', { src: image, alt: 'Three image-generation examples: a pelican riding a bicycle and a historical river scene. The original screenshots include Chinese text.', width: 1227, height: 367, loading: 'lazy', decoding: 'async' })),
      h('div', { className: 'ofm-sponsor-end' }, h('p', null, 'Want to learn more? Visit the partner site.'),
        h('a', { className: 'ofm-sponsor-visit', href: SPONSOR.url, target: '_blank', rel: 'noopener noreferrer' }, 'Visit Beichen API', icon('arrow')), h('span', null, 'Sponsor website · Referral code included')))
  }

  function SponsorPage() {
    return h('section', { className: surfaceClass + ' ofm-sponsor-page', 'aria-labelledby': 'ofm-sponsor-page-title' },
      h('header', { className: 'ofm-sponsor-pagehead' }, h('h1', { id: 'ofm-sponsor-page-title' }, SPONSOR.title), h('p', null, 'Beichen API × OFM · Read the full message here at any time.')),
      h(SponsorArticle))
  }

  function SponsorNotice({ targetId, placement = 'below' }) {
    const dialog = useRef(null)
    const mounted = useRef(false)
    const closing = useRef(false)
    const animation = useRef(null)
    const previousFocus = useRef(null)
    const unlock = useRef(() => {})
    const [opened, setOpened] = useState(false)
    const [leaving, setLeaving] = useState(false)
    const finish = () => {
      dialog.current?.close()
      // 清除收起动画的 forwards 状态，否则同一界面跨日再打开会透明并卡住操作。
      animation.current?.cancel()
      animation.current = null
      unlock.current()
      if (mounted.current) { setOpened(false); setLeaving(false) }
    }
    const dismiss = () => {
      const node = dialog.current
      if (!node?.open || closing.current) return
      closing.current = true
      setLeaving(true)
      const target = document.getElementById(targetId)
      const focusedInside = node.contains(document.activeElement)
      const complete = () => {
        if (!mounted.current) return
        finish()
        if (focusedInside) (target ?? previousFocus.current)?.focus({ preventScroll: true })
        if (target && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          target.animate?.([{ outline: '2px solid currentColor', outlineOffset: '4px' }, { outline: '2px solid transparent', outlineOffset: '0px' }], { duration: 700, easing: 'ease-out' })
        }
      }
      if (target) {
        const rect = target.getBoundingClientRect()
        if (rect.left < 0 || rect.right > window.innerWidth || rect.top < 0 || rect.bottom > window.innerHeight) {
          target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' })
        }
      }
      if (!target || !node.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { complete(); return }
      const from = node.getBoundingClientRect(), to = target.getBoundingClientRect()
      if (to.bottom < 0 || to.top > window.innerHeight) { complete(); return }
      animation.current = node.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${to.x + to.width / 2 - from.x - from.width / 2}px, ${to.y + to.height / 2 - from.y - from.height / 2}px) scale(${Math.max(.08, to.width / from.width)}, ${Math.max(.04, to.height / from.height)})`, opacity: 0 },
      ], { duration: 440, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' })
      animation.current.finished.then(complete, complete)
    }
    useEffect(() => {
      mounted.current = true
      let cancelled = false
      const blockedByDialog = () => {
        const selector = 'dialog[open], [role="dialog"][aria-modal="true"]'
        // 插件挂在宿主设置弹窗中；菜单所在的这一层不是需要避让的其他弹窗。
        const hostDialog = variant === 'plugin' ? document.getElementById(targetId)?.closest(selector) : null
        return [...document.querySelectorAll(selector)].some(node => node !== dialog.current && node !== hostDialog && node.getClientRects().length > 0)
      }
      const show = () => {
        if (cancelled || document.hidden || !dialog.current || blockedByDialog()) throw new Error('not ready')
        previousFocus.current = document.activeElement
        dialog.current.showModal()
        closing.current = false
        const oldOverflow = document.body.style.overflow, oldPadding = document.body.style.paddingRight
        const gutter = Math.max(0, window.innerWidth - document.documentElement.clientWidth)
        document.body.style.overflow = 'hidden'
        if (gutter) document.body.style.paddingRight = `${gutter + parseFloat(getComputedStyle(document.body).paddingRight || '0')}px`
        let restored = false
        unlock.current = () => { if (restored) return; restored = true; document.body.style.overflow = oldOverflow; document.body.style.paddingRight = oldPadding }
        setOpened(true)
      }
      const tryShow = () => {
        if (cancelled || document.hidden) return
        if (blockedByDialog()) { observe(); return }
        let storage
        try { storage = window.localStorage } catch { return }
        void claimSponsorDay({ storage, locks: navigator.locks, eligible: () => !cancelled && !document.hidden, show }).then(shown => {
          if (shown || storage.getItem(SPONSOR_DAY_KEY) === sponsorLocalDay()) observer.disconnect()
        }).catch(() => { observer.disconnect() })
      }
      const observer = new MutationObserver(tryShow)
      const observe = () => observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'aria-hidden'] })
      const timer = setTimeout(tryShow, 700)
      const onVisibility = () => { if (!document.hidden) tryShow() }
      // 宿主在 document 上用 Esc 关闭设置页；公告打开时先消费按键，保留设置页。
      const onKeyDown = event => {
        if (event.key !== 'Escape' || !dialog.current?.open) return
        event.preventDefault()
        event.stopPropagation()
        dismiss()
      }
      document.addEventListener('visibilitychange', onVisibility)
      document.addEventListener('keydown', onKeyDown, true)
      return () => {
        cancelled = true; mounted.current = false
        clearTimeout(timer)
        observer.disconnect()
        document.removeEventListener('visibilitychange', onVisibility)
        document.removeEventListener('keydown', onKeyDown, true)
        animation.current?.cancel()
        dialog.current?.close()
        unlock.current()
      }
    }, [])
    return createPortal(h('dialog', { ref: dialog, className: `${surfaceClass} ofm-sponsor-dialog${leaving ? ' is-closing' : ''}`, 'aria-labelledby': 'ofm-sponsor-dialog-title', 'aria-describedby': 'ofm-sponsor-dialog-description', 'data-placement': placement,
      onCancel: event => { event.preventDefault(); dismiss() },
      onClick: event => { if (event.target === dialog.current) { const r = dialog.current.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dismiss() } } },
      h('header', { className: 'ofm-sponsor-dialoghead' }, h('div', null, h('h2', { id: 'ofm-sponsor-dialog-title' }, SPONSOR.title), h('p', { id: 'ofm-sponsor-dialog-description' }, 'Beichen API × OFM · Shown once on the first visit each day')),
        h('button', { type: 'button', className: 'ofm-sponsor-close', autoFocus: true, onClick: dismiss, 'aria-label': 'Close sponsor message', title: 'Close message (Esc)' }, icon('close'))),
      h('div', { className: 'ofm-sponsor-scroll', tabIndex: 0, role: 'region', 'aria-label': 'Full sponsor message; scroll to read' }, opened ? h(SponsorArticle) : null),
      h('footer', { className: 'ofm-sponsor-dialogfoot' }, h('p', null, 'You can close this message at any time.', h('span', null, 'Read it later from the Sponsor menu.')),
        h('button', { type: 'button', className: 'ofm-sponsor-fold', onClick: dismiss }, 'Close message', icon('arrow', 16)))), document.body)
  }
  return { SponsorPage, SponsorNotice }
}
