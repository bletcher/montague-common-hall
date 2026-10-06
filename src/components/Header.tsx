'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About the Hall' },
  { href: '/rent', label: 'Rent the Hall' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/donate', label: 'Donate' },
  { href: '/news', label: 'News' },
  { href: '/directions', label: 'Directions' },
  { href: '/contact', label: 'Contact' },
]

export function Header({ address }: { address: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isCurrent = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="brand-bar">
        <div className="container brand-inner">
          <Link href="/" className="brand">
            <span className="brand-name">Montague Common Hall</span>
            <span className="brand-tag">Community Center &amp; Performing Arts Space in Western Massachusetts</span>
          </Link>
          <span className="brand-address">{address}</span>
        </div>
      </div>
      <nav className="nav" aria-label="Main">
        <div className="container nav-inner">
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="nav-list"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Close menu' : 'Menu'}
          </button>
          <ul id="nav-list" className={open ? 'nav-list open' : 'nav-list'}>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(item.href) ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}
