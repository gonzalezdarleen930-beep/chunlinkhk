import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const WHATSAPP_URL = "https://api.whatsapp.com/send/?phone=85296396851&text&type=phone_number&app_absent=0";

const navLinks = [
  { label: "首頁", href: "/", hash: "" },
  { label: "關於我們", href: "/", hash: "about" },
  { label: "貸款優勢", href: "/", hash: "advantages" },
  { label: "私隱政策", href: "/PrivacyPolicy", hash: "" },
  { label: "聯絡我們", href: "/", hash: "contact" },
  { label: "線上申請", href: "/online", hash: "" },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  function handleNavClick(e: React.MouseEvent, link: typeof navLinks[0]) {
    if (link.hash) {
      e.preventDefault();
      setOpen(false);
      if (location.pathname === "/") {
        scrollToSection(link.hash);
      } else {
        navigate("/");
        setTimeout(() => scrollToSection(link.hash), 100);
      }
    } else {
      setOpen(false);
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">富</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-foreground leading-tight">富毅信貸有限公司</div>
                <div className="text-xs text-muted-foreground leading-tight">GRIT CREDIT LIMITED</div>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.hash ? `/#${link.hash}` : link.href}
                onClick={(e) => handleNavClick(e, link)}
                className={`px-3 py-2 text-sm rounded-md transition-colors hover:text-primary ${
                  !link.hash && location.pathname === link.href
                    ? "text-primary font-medium"
                    : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              立即申請
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-foreground hover:bg-muted"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.hash ? `/#${link.hash}` : link.href}
                onClick={(e) => handleNavClick(e, link)}
                className="block px-3 py-2 text-sm rounded-md text-foreground hover:text-primary hover:bg-muted transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium text-center"
            >
              立即申請
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
