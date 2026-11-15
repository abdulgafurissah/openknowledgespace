"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOutAction } from "@/app/actions";
import { useCart } from "@/context/CartContext";
import styles from "@/app/page.module.css";

interface NavbarClientProps {
  user: { name?: string | null; role?: string } | null;
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* Backdrop */}
      {menuOpen && (
        <div
          className={styles.navBackdrop}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav className={styles.navbar}>
        {/* Logo */}
        <Link href="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <Image src="/logo.png" alt="Open Knowledge Space Logo" width={160} height={60} style={{ objectFit: "contain" }} priority />
        </Link>

        {/* Desktop nav links */}
        <div className={styles.navLinks}>
          <Link href="/courses">Courses</Link>
          <Link href="/events">Events</Link>
          <Link
            href="/suq"
            style={{
              fontWeight: 700,
              color: pathname.startsWith('/suq') ? 'var(--accent-primary)' : undefined,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            Open Suq
          </Link>
          <Link href="/blog">Blog</Link>

          {/* Cart Icon Button */}
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open Cart (${itemCount} items)`}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              position: 'relative',
              padding: '0.35rem 0.65rem',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'background var(--transition-fast)',
            }}
            title="Shopping Cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {itemCount > 0 && (
              <span
                style={{
                  background: 'var(--accent-primary)',
                  color: 'var(--bg-dark)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  borderRadius: '9999px',
                  padding: '0.1rem 0.45rem',
                  minWidth: '18px',
                  textAlign: 'center',
                  lineHeight: '1.2',
                }}
              >
                {itemCount}
              </span>
            )}
          </button>

          {user ? (
            <>
              <Link href="/dashboard" className={styles.navSecondary}>
                {user.name || "My Dashboard"}
              </Link>
              <form action={signOutAction} style={{ display: "inline" }}>
                <button
                  type="submit"
                  className={styles.navSecondary}
                  style={{ background: "transparent", border: "none", cursor: "pointer", font: "inherit" }}
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.navSecondary}>Sign In</Link>
              <Link href="/register" className={styles.navCta}>Sign Up</Link>
            </>
          )}
        </div>

        {/* Hamburger button — mobile only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Mobile Cart Button */}
          <button
            type="button"
            onClick={openCart}
            aria-label="Open Cart"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              padding: '0.35rem',
              color: 'var(--text-primary)',
            }}
            className={styles.mobileOnly}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {itemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  background: 'var(--accent-primary)',
                  color: 'var(--bg-dark)',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  borderRadius: '9999px',
                  padding: '0.05rem 0.35rem',
                  minWidth: '16px',
                  textAlign: 'center',
                }}
              >
                {itemCount}
              </span>
            )}
          </button>

          <button
            className={styles.hamburger}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={`${styles.hamburgerBar} ${menuOpen ? styles.barTop : ""}`} />
            <span className={`${styles.hamburgerBar} ${menuOpen ? styles.barMid : ""}`} />
            <span className={`${styles.hamburgerBar} ${menuOpen ? styles.barBot : ""}`} />
          </button>
        </div>

        {/* Mobile drawer */}
        <div className={`${styles.mobileDrawer} ${menuOpen ? styles.drawerOpen : ""}`} role="dialog" aria-label="Navigation menu">
          <div className={styles.drawerHeader}>
            <Link href="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
              <Image src="/logo.png" alt="Open Knowledge Space Logo" width={140} height={50} style={{ objectFit: "contain" }} />
            </Link>
          </div>

          <nav className={styles.drawerNav}>
            <Link href="/courses" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
              <span>📖</span> Courses
            </Link>
            <Link href="/events" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
              <span>📅</span> Events
            </Link>
            <Link href="/suq" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
              <span>🛍️</span> Open Suq (Marketplace)
            </Link>
            <Link href="/blog" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
              <span>📰</span> Blog
            </Link>
            <button
              onClick={() => { setMenuOpen(false); openCart(); }}
              className={styles.drawerLink}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', font: 'inherit', width: '100%', textAlign: 'left' }}
            >
              <span>🛒</span> Cart ({itemCount})
            </button>
            {user ? (
              <>
                <Link href="/dashboard" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
                  <span>📊</span> {user.name || "My Dashboard"}
                </Link>
                <form action={signOutAction}>
                  <button type="submit" className={styles.drawerLink} style={{ background: "transparent", border: "none", cursor: "pointer", font: "inherit", width: "100%", textAlign: "left" }}>
                    <span>🚪</span> Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
                  <span>👤</span> Sign In
                </Link>
                <Link href="/register" className={`${styles.drawerLink} ${styles.drawerCta}`} onClick={() => setMenuOpen(false)}>
                  <span>✨</span> Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </nav>
    </>
  );
}
