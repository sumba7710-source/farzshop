const LIST_KEY = 'products:list';

function findEnv(suffix) {
  const key = Object.keys(process.env).find((k) => k.endsWith(suffix));
  return key ? process.env[key] : undefined;
}

const KV_URL = findEnv('_REST_API_URL');
const KV_TOKEN = findEnv('_REST_API_TOKEN');
async function kvFetch(path, options = {}) {
  if (!KV_URL || !KV_TOKEN) {
    throw new Error(`ENV MISSING - KV_URL: ${KV_URL}, KV_TOKEN exists: ${!!KV_TOKEN}`);
  }

  const res = await fetch(`${KV_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      ...(options.headers || {}),
    },
  });

  const json = await res.json();

  if (json.error) {
    throw new Error(`KV ERROR: ${JSON.stringify(json)}`);
  }

  return json;
}

export async function getAllProducts() {
  const listRes = await kvFetch(`/lrange/${LIST_KEY}/0/-1`);
  const ids = listRes.result || [];
  if (ids.length === 0) return [];

  const products = await Promise.all(
    ids.map(async (id) => {
      const res = await kvFetch(`/get/product:${id}`);
      if (!res.result) return null;
      let parsed = res.result;
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      return parsed;
    })
  );
  
  return products.filter(Boolean);
}

export async function addProduct({ nama, foto, deskripsi, harga }) {
  const id = Date.now().toString();
  const product = {
    id: id,
    nama: nama,
    foto: foto,
    deskripsi: deskripsi,
    harga: harga,
    createdAt: new Date().toISOString(),
  };

  await kvFetch(`/set/product:${id}`, {
    method: 'POST',
    body: JSON.stringify(JSON.stringify(product)),
    headers: { 'Content-Type': 'application/json' },
  });

  await kvFetch(`/lpush/${LIST_KEY}/${id}`, {
    method: 'POST',
  });

  return product;
}

export async function deleteProduct(id) {
  const delRes = await kvFetch(`/del/product:${id}`, { method: 'POST' });
  const lremRes = await kvFetch(`/lrem/${LIST_KEY}/0/${encodeURIComponent(id)}`, { method: 'POST' });
  return { delRes, lremRes };
}
