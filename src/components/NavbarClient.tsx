"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOutAction } from "@/app/actions";
import styles from "@/app/page.module.css";

interface NavbarClientProps {
  user: { name?: string | null; role?: string } | null;
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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
