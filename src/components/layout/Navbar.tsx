'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Sun, Moon,
  User, LogOut, Settings, Bell, ShoppingCart, Lock,
} from 'lucide-react';
import Image from 'next/image';
import useAuthStore from '@/store/authStore';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useT } from '@/hooks/useT';

type DropdownItem = {
  label: string;
  href: string;
  requiresAuth?: boolean;
};

type NavItem = {
  key: string;
  label: string;
  image: string;
  href?: string;
  requiresAuth?: boolean;
  dropdown?: DropdownItem[];
};

export default function MainNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t, lang } = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleProtectedNav = (
    e: React.MouseEvent,
    href: string,
    requiresAuth?: boolean,
  ) => {
    if (requiresAuth && !isAuthenticated) {
      e.preventDefault();
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
      setMobileOpen(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navItems: NavItem[] = [
    {
      key: 'home',
      href: '/',
      label: t.nav.home,
      image: '/icons/home.png',
    },
    {
      key: 'about',
      href: '/about',
      label: t.nav.about,
      image: '/icons/about.png',
    },
    {
      key: 'community',
      href: '/community',
      label: t.nav.community,
      image: '/4x/harmony.png',
      requiresAuth: true,
    },
    {
      key: 'organisation',
      href: '/organisation',
      label: t.nav.organisation,
      image: '/4x/organisation.png',
      requiresAuth: true,
    },
    {
      key: 'association',
      href: '/association',
      label: t.nav.association,
      image: '/4x/association.png',
      requiresAuth: true,
    },
    {
      key: 'supershop',
      href: '/supershop',
      label: t.nav.supershop,
      image: '/icons/supershop.png',
    },
    {
      key: 'blood',
      href: '/blood',
      label: t.nav.blood,
      image: '/icons/blood.webp',
    },
    {
      key: 'more',
      label: lang === 'bn' ? 'আরো' : 'More',
      image: '/icons/more.png',
      dropdown: [
        { label: t.nav.events,  href: '/events' },
        { label: t.nav.blog,    href: '/blog' },
        { label: t.nav.gallery, href: '/gallery' },
        { label: t.nav.contact, href: '/contact' },
      ],
    },
  ];

  const NavImage = ({
    image,
    label,
  }: {
    image: string;
    label: string;
    active: boolean;
  }) => (
    <span
      className="relative flex items-center justify-center rounded-xl overflow-hidden flex-shrink-0"
      style={{
        width: 44,
        height: 44,
        background: 'transparent',
      }}
    >
      <Image
        src={image}
        alt={label}
        fill
        sizes="44px"
        className="object-cover"
        style={{ filter: 'none' }}
      />
    </span>
  );

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'superadmin' ||
    user?.email === 'asadforex2025@gmail.com';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 glass border-b"
      style={{ borderColor: 'var(--color-border)', height: 'var(--navbar-height)' }}
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-2">

        {/* ───── Logo ───── */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 min-w-0">
          <Image
            src="/3zf.png"
            alt="3ZF Logo"
            width={32}
            height={32}
            className="object-contain rounded-xl flex-shrink-0"
            priority
          />
          <span
            className="font-heading font-bold leading-tight text-[10px] xs:text-xs sm:text-sm lg:text-base"
            style={{ color: 'var(--color-text)' }}
          >
            3ZF Management <br /> Solution Ltd.
          </span>
        </Link>

        {/* ───── Desktop Nav ───── */}
        <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
          {navItems.map((item) =>
            item.dropdown ? (
              <div
                key={item.key}
                className="relative group"
                onMouseEnter={() => setDropdownOpen(item.key)}
                onMouseLeave={() => setDropdownOpen(null)}
              >
                <button
                  className={`
                    relative flex items-center justify-center w-14 h-14
                    rounded-xl transition-colors
                    hover:bg-[var(--color-bg-hover)]
                    ${item.dropdown.some((d) => d.href === pathname)
                      ? 'bg-[var(--color-bg-hover)]'
                      : ''}
                  `}
                >
                  <NavImage
                    image={item.image}
                    label={item.label}
                    active={item.dropdown.some((d) => d.href === pathname)}
                  />

                  {/* Tooltip */}
                  <span
                    className="
                      absolute top-full mt-1.5 left-1/2 -translate-x-1/2
                      whitespace-nowrap text-xs font-medium px-2 py-1 rounded-md
                      opacity-0 group-hover:opacity-100
                      pointer-events-none transition-opacity duration-150 z-50
                    "
                    style={{ background: 'var(--color-text)', color: 'var(--color-bg)' }}
                  >
                    {item.label}
                    <span
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                      style={{ background: 'var(--color-text)' }}
                    />
                  </span>
                </button>

                {/* Dropdown panel */}
                <AnimatePresence>
                  {dropdownOpen === item.key && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full left-0 mt-1 w-44 card shadow-modal py-1 z-50"
                    >
                      {item.dropdown.map((d) => (
                        <Link
                          key={d.href}
                          href={d.href}
                          className="block px-4 py-2.5 text-sm hover:bg-[var(--color-bg-hover)] rounded-lg mx-1 transition-colors"
                          style={{
                            color: pathname === d.href
                              ? 'var(--color-brand)'
                              : 'var(--color-text)',
                          }}
                        >
                          {d.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={item.key}
                href={item.href!}
                onClick={(e) => handleProtectedNav(e, item.href!, item.requiresAuth)}
                className={`
                  relative group flex items-center justify-center
                  w-14 h-14 rounded-xl transition-colors
                  hover:bg-[var(--color-bg-hover)]
                  ${pathname === item.href ? 'bg-[var(--color-bg-hover)]' : ''}
                  ${item.requiresAuth && !isAuthenticated ? 'opacity-60' : ''}
                `}
              >
                <NavImage
                  image={item.image}
                  label={item.label}
                  active={pathname === item.href}
                />

                {/* Lock badge for protected items */}
                {item.requiresAuth && !isAuthenticated && (
                  <span className="absolute bottom-1 right-1 bg-[var(--color-text)] rounded-full p-0.5">
                    <Lock className="w-2 h-2" style={{ color: 'var(--color-bg)' }} />
                  </span>
                )}

                {/* Tooltip */}
                <span
                  className="
                    absolute top-full mt-1.5 left-1/2 -translate-x-1/2
                    whitespace-nowrap text-xs font-medium px-2 py-1 rounded-md
                    opacity-0 group-hover:opacity-100
                    pointer-events-none transition-opacity duration-150 z-50
                  "
                  style={{ background: 'var(--color-text)', color: 'var(--color-bg)' }}
                >
                  {item.requiresAuth && !isAuthenticated
                    ? `🔒 ${item.label}`
                    : item.label}
                  <span
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                    style={{ background: 'var(--color-text)' }}
                  />
                </span>
              </Link>
            )
          )}
        </nav>

        {/* ───── Right actions ───── */}
        <div className="flex items-center gap-1">

          <LanguageSwitcher variant="icon" className="hidden sm:flex" />

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-ghost w-9 h-9 flex items-center justify-center p-0"
            title={theme === 'dark' ? t.common.lightMode : t.common.darkMode}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated && user ? (
            <>
              <Link
                href="/supershop/cart"
                className="btn-ghost w-9 h-9 flex items-center justify-center p-0"
                title={t.supershop.cart}
              >
                <ShoppingCart className="w-4 h-4" />
              </Link>

              <Link
                href="/community/notifications"
                className="btn-ghost w-9 h-9 flex items-center justify-center p-0"
              >
                <Bell className="w-4 h-4" />
              </Link>

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6B46C1&color=fff`
                    }
                    alt={user.name}
                    className="w-8 h-8 avatar"
                  />
                  <span
                    className="text-sm font-medium hidden md:block"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-2 w-60 card shadow-modal py-2 z-50"
                    >
                      <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                          {user.name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          @{user.username}
                        </p>
                      </div>

                      <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
                          {t.common.language}
                        </p>
                        <LanguageSwitcher variant="full" />
                      </div>

                      <Link
                        href={`/community/profile/${user.username}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-bg-hover)] transition-colors"
                        style={{ color: 'var(--color-text)' }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        {t.nav.profile}
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-bg-hover)] transition-colors"
                        style={{ color: 'var(--color-text)' }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        {t.nav.settings}
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-bg-hover)] transition-colors"
                          style={{ color: 'var(--color-brand)' }}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          ⚡ {t.nav.adminPanel}
                        </Link>
                      )}

                      <div className="border-t mt-1" style={{ borderColor: 'var(--color-border)' }} />

                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500"
                      >
                        <LogOut className="w-4 h-4" />
                        {t.nav.logout}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login" className="btn-secondary text-sm py-2">
                {t.nav.login}
              </Link>
              <Link href="/register" className="btn-primary text-sm py-2">
                {t.nav.register}
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="lg:hidden btn-ghost w-9 h-9 flex items-center justify-center p-0"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ───── Mobile Drawer (rendered via portal outside <header>) ───── */}
      {mounted && createPortal(
        <>
          {/* Backdrop */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                key="drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                style={{ top: 'var(--navbar-height)' }}
                onClick={() => setMobileOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Drawer panel — slides in from the left */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                key="drawer-panel"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="lg:hidden fixed right-0 bottom-0 z-50 w-72 max-w-[85vw] overflow-y-auto"
                style={{
                  top: 'var(--navbar-height)',
                  background: 'var(--color-bg)',
                  borderLeft: '1px solid var(--color-border)',
                }}
              >
              <nav className="p-3 space-y-0.5">

                {navItems.map((item) =>
                  item.dropdown
                    ? item.dropdown.map((d) => (
                        <Link
                          key={d.href}
                          href={d.href}
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-xl
                            transition-colors hover:bg-[var(--color-bg-hover)]
                            ${pathname === d.href ? 'bg-[var(--color-bg-hover)]' : ''}
                          `}
                          onClick={() => setMobileOpen(false)}
                        >
                          <span
                            className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            ↳
                          </span>
                          <span
                            className="text-sm font-medium"
                            style={{
                              color: pathname === d.href
                                ? 'var(--color-brand)'
                                : 'var(--color-text)',
                            }}
                          >
                            {d.label}
                          </span>
                          {pathname === d.href && (
                            <span
                              className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: 'var(--color-brand)' }}
                            />
                          )}
                        </Link>
                      ))
                    : (
                      <Link
                        key={item.key}
                        href={item.href!}
                        onClick={(e) => {
                          handleProtectedNav(e, item.href!, item.requiresAuth);
                          if (!item.requiresAuth || isAuthenticated) setMobileOpen(false);
                        }}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl
                          transition-colors hover:bg-[var(--color-bg-hover)]
                          ${pathname === item.href ? 'bg-[var(--color-bg-hover)]' : ''}
                          ${item.requiresAuth && !isAuthenticated ? 'opacity-60' : ''}
                        `}
                      >
                        <span
                          className="relative flex-shrink-0 rounded-lg overflow-hidden"
                          style={{
                            width: 36,
                            height: 36,
                            background: 'transparent',
                          }}
                        >
                          <Image
                            src={item.image}
                            alt={item.label}
                            fill
                            sizes="36px"
                            className="object-cover"
                            style={{ filter: 'none' }}
                          />
                        </span>

                        <span
                          className="text-sm font-medium"
                          style={{
                            color: pathname === item.href
                              ? 'var(--color-brand)'
                              : 'var(--color-text)',
                          }}
                        >
                          {item.label}
                        </span>

                        {item.requiresAuth && !isAuthenticated ? (
                          <span className="ml-auto flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            <Lock className="w-3 h-3" />
                            Login
                          </span>
                        ) : pathname === item.href ? (
                          <span
                            className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: 'var(--color-brand)' }}
                          />
                        ) : null}
                      </Link>
                    )
                )}

                {/* Divider */}
                <div className="my-2 border-t" style={{ borderColor: 'var(--color-border)' }} />

                {/* Language + theme */}
                <div className="flex items-center gap-2 px-3 py-1">
                  <LanguageSwitcher variant="badge" />
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="ml-auto btn-ghost w-9 h-9 flex items-center justify-center p-0"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>

                {/* Mobile auth buttons */}
                {!isAuthenticated && (
                  <div className="flex gap-2 px-3 pt-1">
                    <Link
                      href="/login"
                      className="btn-secondary text-sm py-2 flex-1 text-center"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t.nav.login}
                    </Link>
                    <Link
                      href="/register"
                      className="btn-primary text-sm py-2 flex-1 text-center"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t.nav.register}
                    </Link>
                  </div>
                )}

                {/* Mobile admin link */}
                {isAuthenticated && isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-[var(--color-bg-hover)]"
                    style={{ color: 'var(--color-brand)' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="text-base">⚡</span>
                    <span className="text-sm font-medium">{t.nav.adminPanel}</span>
                  </Link>
                )}

              </nav>
            </motion.div>
          )}
        </AnimatePresence>
        </>,
        document.body
      )}
    </header>
  );
}