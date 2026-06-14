import './globals.css';

export const metadata = {
  title: 'TOKO FARZHDYTL',
  description: 'Toko online TOKO FARZHDYTL - belanja gampang, order via WhatsApp',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
