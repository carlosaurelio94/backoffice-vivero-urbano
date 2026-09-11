import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '@/lib/brand';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} · ${PRODUCT_TAGLINE}`,
  description: 'Sistema de gestión de clientes, presupuestos, proveedores y facturas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      {/*
        suppressHydrationWarning en <html> es necesario porque el hook useTheme
        agrega/quita la clase "dark" en el cliente — evita el warning de hidratación.

        Este script inline previene el "flash" de tema incorrecto antes de que
        React hidrate. Se ejecuta de forma síncrona antes de que el browser pinte.
      */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
