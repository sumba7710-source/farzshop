import { kv } from '@vercel/kv';

const LIST_KEY = 'products:list';

// Ambil semua produk (terbaru duluan)
export async function getAllProducts() {
  const ids = await kv.lrange(LIST_KEY, 0, -1);
  if (!ids || ids.length === 0) return [];

  const products = await Promise.all(
    ids.map((id) => kv.get(`product:${id}`))
  );

  return products.filter(Boolean);
}

// Tambah produk baru
export async function addProduct({ nama, foto, deskripsi, harga }) {
  const id = Date.now().toString();
  const product = {
    id,
    nama,
    foto,
    deskripsi,
    harga,
    createdAt: new Date().toISOString(),
  };

  await kv.set(`product:${id}`, product);
  await kv.lpush(LIST_KEY, id);

  return product;
}

// Hapus produk
export async function deleteProduct(id) {
  await kv.del(`product:${id}`);
  await kv.lrem(LIST_KEY, 0, id);
}
