import { NextResponse } from 'next/server';
import { getAllProducts } from '../../../lib/db';

export const dynamic = 'force-dynamic';

const KV_URL = (() => {
  const key = Object.keys(process.env).find((k) => k.endsWith('_REST_API_URL'));
  return key ? process.env[key] : undefined;
})();
const KV_TOKEN = (() => {
  const key = Object.keys(process.env).find((k) => k.endsWith('_REST_API_TOKEN'));
  return key ? process.env[key] : undefined;
})();

export async function GET() {
  try {
    const products = await getAllProducts();

    // DEBUG: raw data
    const listRes = await fetch(`${KV_URL}/lrange/products:list/0/-1`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    }).then((r) => r.json());

    const ids = listRes.result || [];
    const rawItems = await Promise.all(
      ids.map((id) =>
        fetch(`${KV_URL}/get/product:${id}`, {
          headers: { Authorization: `Bearer ${KV_TOKEN}` },
        }).then((r) => r.json())
      )
    );

    return NextResponse.json({ ok: true, products, debug_listRes: listRes, debug_rawItems: rawItems });
  } catch (err) {
    return NextResponse.json({ ok: false, products: [], error: err.message, stack: err.stack });
  }
}
