import Image from 'next/image';

export default function LogoLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
            <div className="relative w-72 h-72 mb-6 flex items-center justify-center">
                {/* Spinning Ring - now visible around the logo */}
                <div className="absolute inset-0 rounded-full border-8 border-[var(--color-dusty-olive-100)] border-t-[var(--color-dusty-olive-600)] animate-spin" style={{ animationDuration: '0.9999s' }}></div>

                {/* Logo Container - smaller than parent to show the spinning ring */}
                <div className="relative z-10 w-56 h-56 bg-white rounded-full shadow-lg flex items-center justify-center p-0">
                    <Image
                        src="/logo.png"
                        alt="Loading..."
                        width={512}
                        height={512}
                        className="object-contain"
                        priority
                        unoptimized
                    />
                </div>
            </div>
            <p className="text-[var(--color-dusty-olive-600)] font-medium text-sm tracking-[0.2em] uppercase animate-pulse">Loading</p>
        </div>
    );
}
