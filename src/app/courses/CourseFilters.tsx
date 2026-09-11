"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./courses.module.css";

export default function CourseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  // Debounce search to avoid too many URL updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        router.push(`/courses?q=${encodeURIComponent(query)}`);
      } else {
        router.push(`/courses`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, router]);

  return (
    <div className={styles.filterContainer}>
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search for courses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />
        {query && (
          <button onClick={() => setQuery("")} className={styles.clearSearchBtn}>
            ×
          </button>
        )}
      </div>
    </div>
  );
}
