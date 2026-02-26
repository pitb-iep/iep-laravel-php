import { ClipboardCheck, FileBarChart, Target, TrendingUp, CheckCircle2, Zap } from 'lucide-react';

export default function Features() {
    const features = [
        {
            icon: <ClipboardCheck className="w-12 h-12 text-blue-600" />,
            title: "Digital Assessments",
            description: "Streamlined, paperless assessments that automatically feed into IEP goals and reports."
        },
        {
            icon: <FileBarChart className="w-12 h-12 text-purple-600" />,
            title: "IEP Builder",
            description: "Create compliant, comprehensive IEPs in minutes with our intelligent drafting engine."
        },
        {
            icon: <Target className="w-12 h-12 text-orange-600" />,
            title: "Smart Goal Bank",
            description: "Access thousands of customizable, clinically-verified goals tailored to student needs."
        },
        {
            icon: <TrendingUp className="w-12 h-12 text-emerald-600" />,
            title: "Real-time Progress",
            description: "Visualize student growth with automatic data tracking and beautiful progress charts."
        },
        {
            icon: <CheckCircle2 className="w-12 h-12 text-green-600" />,
            title: "Compliance Checking",
            description: "Built-in validation ensures you never miss a deadline or mandatory requirement."
        },
        {
            icon: <Zap className="w-12 h-12 text-yellow-600" />,
            title: "Instant Reports",
            description: "Generate professional progress reports for parents and districts with one click."
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything You Need</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Powerful tools designed specifically for special education professionals, therapists, and administrators.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-8 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all group"
                        >
                            <div className="mb-6 p-4 rounded-xl bg-slate-50 w-fit group-hover:bg-[hsl(var(--primary-hue),10%,95%)] transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-500 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
