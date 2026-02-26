import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="AUTISM360 Logo" width={40} height={40} className="object-contain" />
                        <span className="font-bold text-xl text-slate-900">AUTISM360</span>
                    </div>

                    <div className="flex gap-8 text-slate-500 font-medium">
                        <Link href="/auth/login" className="hover:text-[hsl(var(--primary-hue),70%,60%)] transition-colors">Sign In</Link>
                        <Link href="/auth/register" className="hover:text-[hsl(var(--primary-hue),70%,60%)] transition-colors">Create Account</Link>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
                    © {new Date().getFullYear()} AUTISM360. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
