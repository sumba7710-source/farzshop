import { NextResponse } from 'next/server';
import { addProduct, getAllProducts, deleteProduct } from '../../../lib/db';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER_ID = process.env.TELEGRAM_OWNER_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId, text) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });
}

const HELP_TEXT = `<b>TOKO FARZHDYTL - Bot Admin</b>

Format tambah barang (pisahkan tiap baris dengan ENTER):

/add
Nama Barang
https://link-foto-barang.com/gambar.jpg
Deskripsi barang di sini
50000

Perintah lain:
/list - lihat semua barang
/hapus &lt;id&gt; - hapus barang berdasarkan id
/help - bantuan`;

export async function POST(req) {
  let chatId;
  try {
    const body = await req.json();
    const message = body.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    chatId = message.chat.id;
    const text = message.text.trim();

    if (OWNER_ID && String(chatId) !== String(OWNER_ID)) {
      await sendMessage(chatId, 'Maaf, kamu tidak punya akses ke bot ini.');
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith('/add')) {
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const data = lines.slice(1);

      if (data.length < 4) {
        await sendMessage(
          chatId,
          `Format salah. Contoh format yang benar:\n\n<code>/add\nKaos Polos Hitam\nhttps://contoh.com/foto.jpg\nKaos cotton combed 30s, all size\n75000</code>`
        );
        return NextResponse.json({ ok: true });
      }

      const [nama, foto, ...rest] = data;
      const harga = rest[rest.length - 1];
      const deskripsi = rest.slice(0, -1).join('\n');

      if (!/^https?:\/\//i.test(foto)) {
        await sendMessage(chatId, 'Link foto tidak valid. Harus berupa URL (dimulai dengan http/https).');
        return NextResponse.json({ ok: true });
      }

      if (isNaN(Number(harga.replace(/[^0-9]/g, '')))) {
        await sendMessage(chatId, 'Harga tidak valid. Masukkan harga berupa angka, contoh: 50000');
        return NextResponse.json({ ok: true });
      }

      const product = await addProduct({
        nama,
        foto,
        deskripsi: deskripsi || '-',
        harga: Number(harga.replace(/[^0-9]/g, '')),
      });

      await sendMessage(
        chatId,
        `✅ Barang berhasil ditambahkan!\n\n<b>${product.nama}</b>\nHarga: Rp${product.harga.toLocaleString('id-ID')}\nID: <code>${product.id}</code>\n\nCek di web TOKO FARZHDYTL.`
      );
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith('/list')) {
      const products = await getAllProducts();
      if (products.length === 0) {
        await sendMessage(chatId, 'Belum ada barang. Tambah dengan /add');
        return NextResponse.json({ ok: true });
      }

      const list = products
        .map(
          (p) =>
            `• <b>${p.nama}</b> - Rp${p.harga.toLocaleString('id-ID')}\n  ID: <code>${p.id}</code>`
        )
        .join('\n\n');

      await sendMessage(chatId, `<b>Daftar Barang (${products.length}):</b>\n\n${list}`);
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith('/hapus')) {
      const parts = text.split(/\s+/);
      const id = parts[1];

      if (!id) {
        await sendMessage(chatId, 'Format: /hapus <id>\nLihat id barang dengan /list');
        return NextResponse.json({ ok: true });
      }

      const result = await deleteProduct(id);
      await sendMessage(chatId, `🗑️ Hasil hapus ID ${id}:\n<code>${JSON.stringify(result)}</code>`);
      return NextResponse.json({ ok: true });
  }

    if (text.startsWith('/start') || text.startsWith('/help')) {
      await sendMessage(chatId, HELP_TEXT);
      return NextResponse.json({ ok: true });
    }

    await sendMessage(chatId, 'Perintah tidak dikenali. Ketik /help untuk bantuan.');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    if (chatId) {
      try {
        await sendMessage(chatId, `⚠️ Error: ${err.message}`);
      } catch (e) {
        console.error('Failed to send error message', e);
      }
    }
    return NextResponse.json({ ok: false, error: err.message });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Telegram webhook is running.' });
    }
