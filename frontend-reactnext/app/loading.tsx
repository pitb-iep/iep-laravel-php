import LogoLoader from '@/components/ui/LogoLoader';

export default function Loading() {
    return (
        <div className="flex items-center justify-center h-full min-h-screen bg-[var(--bg-app)]">
            <LogoLoader />
        </div>
    );
}
