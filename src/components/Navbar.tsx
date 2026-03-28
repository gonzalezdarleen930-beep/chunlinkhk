import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo.jpg";

const WHATSAPP_URL = "https://wa.me/85296396851?text=你好，我想查詢貸款內容";

const navLinks = [
  { label: "首頁", href: "/", hash: "" },
  { label: "關於我們", href: "/", hash: "about" },
  { label: "貸款優勢", href: "/", hash: "advantages" },
  { label: "私隱政策", href: "/PrivacyPolicy", hash: "" },
  { label: "聯絡我們", href: "/", hash: "contact" },
  { label: "線上申請", href: "/online", hash: "" },
];

interface LoanProductItem {
  slug: string;
  title: string;
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [loanProducts, setLoanProducts] = useState<LoanProductItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    supabase
      .from("loan_products")
      .select("slug, title")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setLoanProducts(data as LoanProductItem[]);
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    navigate("/");
  }

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logoImg} alt="富毅信貸有限公司" className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.slice(0, 2).map((link) => (
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

            {/* Loan Products Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onMouseEnter={() => setDropdownOpen(true)}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors hover:text-primary text-foreground"
              >
                貸款項目
                <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  {loanProducts.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/loan/${p.slug}`}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
                    >
                      {p.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.slice(2).map((link) => (
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

          {/* Right: Login + CTA */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md text-foreground hover:text-primary transition-colors"
                >
                  <User size={14} />
                  {isAdmin ? "管理員" : "我的帳戶"}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut size={14} />
                  登出
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <User size={14} />
                登入
              </Link>
            )}
            <Link
              to="/online"
              className="inline-flex items-center px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              立即申請
            </Link>
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
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.label}
                to={link.hash ? `/#${link.hash}` : link.href}
                onClick={(e) => handleNavClick(e, link)}
                className="block px-3 py-2 text-sm rounded-md text-foreground hover:text-primary hover:bg-muted transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Loan Products */}
            <button
              onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md text-foreground hover:text-primary hover:bg-muted transition-colors"
            >
              貸款項目
              <ChevronDown size={14} className={`transition-transform ${mobileDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileDropdownOpen && (
              <div className="pl-6 space-y-1">
                {loanProducts.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/loan/${p.slug}`}
                    onClick={() => { setOpen(false); setMobileDropdownOpen(false); }}
                    className="block px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                  >
                    {p.title}
                  </Link>
                ))}
              </div>
            )}

            {navLinks.slice(2).map((link) => (
              <Link
                key={link.label}
                to={link.hash ? `/#${link.hash}` : link.href}
                onClick={(e) => handleNavClick(e, link)}
                className="block px-3 py-2 text-sm rounded-md text-foreground hover:text-primary hover:bg-muted transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md text-foreground hover:text-primary hover:bg-muted"
                >
                  <User size={14} />
                  {isAdmin ? "管理員面板" : "我的帳戶"}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 w-full text-left px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <LogOut size={14} />
                  登出
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-primary text-primary hover:bg-primary/10"
              >
                <User size={14} />
                登入
              </Link>
            )}
            <Link
              to="/online"
              onClick={() => setOpen(false)}
              className="block mt-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium text-center"
            >
              立即申請
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
