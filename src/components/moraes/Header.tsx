import { Link } from '@tanstack/react-router';
import { MessageCircle, Menu, X, LayoutDashboard } from 'lucide-react';
import { EditableField } from '../admin/EditableField';
import { useState, useEffect } from 'react';
import { useSettingsContext } from '../../lib/settings-context';
import { useAuth } from '../../lib/auth-context';
import { motion, AnimatePresence } from 'motion/react';

export function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { settings, contactSettings } = useSettingsContext();
  const { currentUser, userRole } = useAuth();
  const isStaffLoggedIn = !!currentUser && !currentUser.is_anonymous && !!userRole;

  const whatsappNumber = contactSettings?.whatsappNumber || '5511995038661';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) return;
      
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { to: '/', label: 'Home', id: 'header_nav_home' },
    { to: '/a-empresa', label: 'A Empresa', id: 'header_nav_empresa' },
    { to: '/produtos', label: 'Produtos', id: 'header_nav_produtos' },
    { to: '/projetos', label: 'Projetos', id: 'header_nav_projetos' },
    { to: '/blog', label: 'Blog', id: 'header_nav_blog' },
    { to: '/contato', label: 'Contato', id: 'header_nav_contato' },
  ];

  return (
    <header 
      className={`bg-brand-bg sticky top-0 z-50 border-b border-gray-200 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex flex-col items-start group relative z-50">
          <EditableField id="header_logo_img" defaultValue="" type="image">
            {(url, styles) => (url || settings.siteLogo) ? (
              <img src={url || settings.siteLogo} alt={settings.siteName || "Logo"} className="h-10 md:h-12 w-auto object-contain" style={styles} />
            ) : (
              <div className="flex flex-col items-start">
                <EditableField id="header_logo_title" defaultValue={settings.siteName || "MORAES"}>
                  {(text, styles) => (
                    <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-brand-text group-hover:text-brand-rust transition-colors" style={styles}>
                      {text}
                    </span>
                  )}
                </EditableField>
                <EditableField id="header_logo_sub" defaultValue="Tijolos Revestimentos">
                  {(text, styles) => (
                    <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-brand-text/70 mt-0.5 font-medium" style={styles}>
                      {text}
                    </span>
                  )}
                </EditableField>
              </div>
            )}
          </EditableField>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.to}
              to={link.to} 
              className="text-sm font-medium text-brand-text hover:text-brand-rust transition-colors pb-1 border-b-2" 
              activeProps={{ className: 'border-brand-rust' }} 
              inactiveProps={{ className: 'border-transparent' }}
            >
              <EditableField id={link.id} defaultValue={link.label}>
                {(text, styles) => <span style={styles}>{text}</span>}
              </EditableField>
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-4">
          {isStaffLoggedIn && (
            <Link
              to="/admin"
              className="flex items-center gap-2 border border-brand-text/20 hover:border-brand-rust hover:text-brand-rust text-brand-text px-4 py-2.5 rounded text-sm font-medium transition-colors"
              title="Ir para o Painel Admin"
            >
              <LayoutDashboard className="w-4 h-4" />
              Painel Admin
            </Link>
          )}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-white px-5 py-2.5 rounded text-sm font-medium transition-colors"
          >
            <EditableField id="header_btn_icon" defaultValue="" type="image">
              {(url) => url ? <img src={url} alt="Icon" className="w-4 h-4 object-contain" /> : <MessageCircle className="w-4 h-4" />}
            </EditableField>
            <EditableField id="header_btn_text" defaultValue="WhatsApp">
              {(text, styles) => <span style={{ ...styles, color: styles?.color || 'white' }}>{text}</span>}
            </EditableField>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-brand-text relative z-50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] lg:hidden flex flex-col pt-24 px-6 h-screen w-full"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <div className="flex justify-end mb-8">
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-brand-text"
              >
                <X size={32} />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className="text-2xl font-serif font-bold text-brand-text border-b border-gray-100 pb-2 active:text-brand-rust"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <EditableField id={`${link.id}_mobile`} defaultValue={link.label}>
                    {(text, styles) => <span style={styles}>{text}</span>}
                  </EditableField>
                </Link>
              ))}
            </nav>
            
            <div className="mt-12 space-y-3">
              {isStaffLoggedIn && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-3 border border-brand-text/20 text-brand-text w-full py-4 rounded-xl text-lg font-bold transition-all active:scale-95"
                >
                  <LayoutDashboard size={24} />
                  Painel Admin
                </Link>
              )}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-brand-green hover:bg-brand-green-dark text-white w-full py-4 rounded-xl text-lg font-bold shadow-lg transition-all active:scale-95"
              >
                <MessageCircle size={24} />
                Falar no WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
