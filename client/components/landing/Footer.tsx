import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-bold text-[22px] tracking-tight text-white">
                Labhya Compute
              </span>
            </Link>
            <p className="text-[14px] text-[#a1a1aa] max-w-xs leading-relaxed">
              Peer-to-peer GPU marketplace for AI builders, researchers, and developers. Rent high-performance compute on demand.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white text-[15px]">Product</h4>
            <ul className="space-y-3 text-[14px] text-[#a1a1aa]">
              <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/marketplace" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sessions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white text-[15px]">Company</h4>
            <ul className="space-y-3 text-[14px] text-[#a1a1aa]">
              <li><span className="hover:text-white transition-colors cursor-not-allowed opacity-50">About</span></li>
              <li><Link href="/register/host" className="hover:text-white transition-colors">Become a Host</Link></li>
              <li><span className="hover:text-white transition-colors cursor-not-allowed opacity-50">Contact</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white text-[15px]">Account</h4>
            <ul className="space-y-3 text-[14px] text-[#a1a1aa]">
              <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#6b7280]">
          <p>© {currentYear} Labhya Compute. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-[#a1a1aa] transition-colors cursor-not-allowed opacity-50">Terms</span>
            <span className="hover:text-[#a1a1aa] transition-colors cursor-not-allowed opacity-50">Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
