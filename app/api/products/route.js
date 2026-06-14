import { NextResponse } from 'next/server';
import { getAllProducts } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ ok: true, products });
  } catch (err) {
    return NextResponse.json({ ok: false, products: [], error: err.message });
  }
}
