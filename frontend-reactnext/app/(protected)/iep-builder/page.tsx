import IEPBuilder from '@/components/IEP/IEPBuilder';

export default function IEPBuilderPage() {
    return (
        <div>
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">IEP Builder</h1>
                <p className="text-slate-500">Create a new Individualized Education Program.</p>
            </div>
            <IEPBuilder />
        </div>
    );
}
