"use client";

import React, { useEffect, useState } from "react";

export default function TestFetchPage() {
  const [data, setData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/product`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>Test fetch /api/product</h1>
      <p>
        URL: <code>{process.env.NEXT_PUBLIC_API_URL}/product</code>
      </p>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && (
        <pre style={{ whiteSpace: "pre-wrap", background: "#000000", padding: 10 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}
