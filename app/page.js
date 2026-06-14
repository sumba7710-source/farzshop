'use client';

import { useEffect, useState } from 'react';

const WA_NUMBER = '6285137724172';

function formatRupiah(num) {
  return 'Rp' + Number(num).toLocaleString('id-ID');
}

function waLink(product) {
  const text = `Halo TOKO FARZHDYTL, saya mau order:\n\n*${product.nama}*\nHarga: ${formatRupiah(
    product.harga
  )}\n\nFoto: ${product.foto}\n\nMohon info lebih lanjut ya. Terima kasih!`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.nama.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main>
      <div className="header">
        <h1>TOKO FARZHDYTL</h1>
        <p>Belanja gampang, order langsung via WhatsApp</p>
      </div>

      <div className="search-wrap">
        <input
          className="search-box"
          type="text"
          placeholder="Cari nama barang..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="container">
        {loading ? (
          <div className="empty">
            <h3>Memuat barang...</h3>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <h3>Belum ada barang</h3>
            <p>Barang akan muncul di sini setelah ditambahkan owner via bot Telegram.</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((p) => (
              <div className="card" key={p.id}>
                <div className="card-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.foto} alt={p.nama} loading="lazy" />
                </div>
                <div className="card-body">
                  <div className="card-name">{p.nama}</div>
                  <div className="card-desc">{p.deskripsi}</div>
                  <div className="card-price">{formatRupiah(p.harga)}</div>
                  <a
                    className="btn-order"
                    href={waLink(p)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Order via WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="footer">© {new Date().getFullYear()} TOKO FARZHDYTL</div>
    </main>
  );
}
