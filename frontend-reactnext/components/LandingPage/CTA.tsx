import Link from 'next/link';

export default function CTA() {
    return (
        <section className="py-24 bg-ebony-900 text-white relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 !text-white">Ready to Transform Your IEP Process?</h2>
                <p className="text-xl text-ebony-200 max-w-2xl mx-auto mb-10">
                    Join thousands of educators who are saving hours every week with AUTISM360.
                </p>

                <Link
                    href="/auth/register"
                    className="inline-block bg-dusty-olive-600 text-white text-xl font-bold px-10 py-5 rounded-full shadow-lg shadow-dusty-olive-600/30 hover:shadow-xl hover:scale-105 hover:bg-dusty-olive-700 transition-all"
                >
                    Get Started Now
                </Link>
            </div>

            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-ebony-900 via-ebony-800 to-dusty-olive-900 opacity-90"></div>
        </section>
    );
}
