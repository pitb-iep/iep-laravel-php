import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[hsl(var(--primary-hue),90%,98%)] text-center">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="relative w-64 h-32 lg:w-96 lg:h-48 drop-shadow-xl animate-float">
                        <Image
                            src="/logo.png"
                            alt="AUTISM360 Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6">
                    AUTISM<span className="text-[hsl(var(--primary-hue),70%,60%)]">360</span>
                </h1>

                <p className="text-xl lg:text-3xl font-medium text-slate-600 max-w-4xl mx-auto mb-4">
                    Digital & Scalable Special Education Management
                </p>

                <p className="text-lg lg:text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
                    Assessment • IEP • Goals • Data • Progress — all in one platform.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/auth/register"
                        className="btn-primary text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                        Get Started
                    </Link>
                    <Link
                        href="/auth/login"
                        className="px-8 py-4 rounded-full font-semibold text-slate-600 hover:text-[hsl(var(--primary-hue),70%,60%)] transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[hsl(var(--primary-hue),70%,60%)] rounded-full blur-[100px] opacity-20 animate-blob"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400 rounded-full blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
            </div>
        </section>
    );
}
