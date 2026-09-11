"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Sidebar from "./Sidebar";
import styles from "./admin.module.css";

export default function AdminLayoutClient({
  children,
  role,
}: {
  children: React.ReactNode;
  role: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <div className={styles.adminContainer}>
      {/* Mobile topbar */}
      <div className={styles.mobileTopbar}>
        <Link href="/" className={styles.mobileTopbarBrand} style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/logo.png" alt="Open Knowledge Space Logo" width={130} height={40} style={{ objectFit: "contain" }} />
        </Link>
        <button
          className={styles.sidebarToggle}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen((o) => !o)}
        >
          <span className={`${styles.toggleBar} ${sidebarOpen ? styles.toggleBarTop : ""}`} />
          <span className={`${styles.toggleBar} ${sidebarOpen ? styles.toggleBarMid : ""}`} />
          <span className={`${styles.toggleBar} ${sidebarOpen ? styles.toggleBarBot : ""}`} />
        </button>
      </div>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className={styles.sidebarBackdrop}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
