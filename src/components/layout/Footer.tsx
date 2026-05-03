import Link from 'next/link';
import Image from 'next/image';
export default function MainFooter() {
  return (
    <footer className="border-t mt-16 py-10 px-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
             <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
                      <Image
                        src="/3zf.png"
                        alt="3ZF Logo"
                        width={32}
                        height={32}
                        className="object-contain rounded-xl"
                        priority
                      />
                      <span
                        className="font-heading font-bold text-lg hidden sm:block"
                        style={{ color: 'var(--color-text)' }}
                      >
                        3ZF
                      </span>
                    </Link>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Three Zeros of Freedom — A unified platform for community, organisation, and commerce.
            </p>
          </div>
          {[
            { title: 'Platform', links: [['Home', '/'], ['About', '/about'], ['Community', '/community'], ['Supershop', '/supershop']] },
            { title: 'Organisation', links: [['Register', '/organisation'], ['Donate', '/organisation/donate'], ['Association', '/association'], ['Events', '/events']] },
            { title: 'Support', links: [['Blog', '/blog'], ['Gallery', '/gallery'], ['Contact', '/contact'], ['Privacy Policy', '/privacy']] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={label}><Link href={href} className="text-sm hover:text-[var(--color-brand)] transition-colors" style={{ color: 'var(--color-text-secondary)' }}>{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          <p>© {new Date().getFullYear()} 3ZF Platform. All rights reserved.</p>
          <p>Made with ❤️ for the community</p>
        </div>
      </div>
    </footer>
  );
}
