import FooterCTA from '@/components/Landing-page/FooterCTA'
import Navbar from '@/components/navigation/Navbar'

export default function TermsOfUsePage() {
    return (
        <main>
            <Navbar />
            <div className="py-12 md:py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-8 pb-10">
                    <div className="space-y-13">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl lg:text-7xl font-normal">Terms of use</h2>

                            <div>
                                <p className="text-xl">
                                    Welcome to Helicode. These Terms and Conditions (“Terms”) govern your access to and use of Helicode&apos;s website, products, platforms, and services (collectively, the “Services”).
                                </p>

                                <p className="text-xl">
                                    By accessing or using Helicode, you agree to be bound by these Terms. If you do not agree, please do not use our Services.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-18">
                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-3">About Helicode</h2>
                                <p className="font-normal text-xl text-black">
                                    Helicode is an infrastructure platform focused on global hiring, management, and payments including the use of stablecoins and blockchain-based systems. We provide tools, content, and services to individuals, companies, and partners globally.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-3">Eligibility</h2>
                                <p className="font-normal text-xl text-black mb-8">
                                    To use Helicode, you must:
                                </p>

                                <ul className="list-disc pl-4 mb-4 space-y-2.5 text-xl">
                                    <li>Be at least 18 years old</li>
                                    <li>Have the legal capacity to enter into binding agreements</li>
                                    <li>Use the Services in compliance with applicable laws and regulations</li>
                                </ul>

                                <p className="font-normal text-xl text-black mb8">
                                    By using our Services, you confirm that you meet these requirements.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Use of Our Services</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    You agree to:
                                </p>

                                <ul className="list-disc pl-4 mb-6 space-y-2.5 text-xl">
                                    <li>Use Helicode only for lawful purposes</li>
                                    <li>Provide accurate and complete information</li>
                                    <li>Not misuse, exploit, reverse-engineer, or interfere with the Services</li>
                                    <li>Not use the Services to engage in fraud, illegal activity, or harm others</li>
                                </ul>

                                <p className="font-normal text-xl text-black mb8">
                                    We reserve the right to suspend or terminate access if these Terms are violated.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Accounts and Responsibilities</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    If you create an account:
                                </p>

                                <ul className="list-disc pl-4 mb-4 space-y-2.5 text-xl">
                                    <li>You are responsible for maintaining its confidentiality</li>
                                    <li>You are responsible for all activities under your account</li>
                                    <li>You must notify us immediately of any unauthorized use</li>
                                </ul>

                                <p className="font-normal text-xl text-black mb8">
                                    Helicode is not liable for losses caused by unauthorized access due to your failure to secure your account.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Payments and Fees</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    Some Services may require payment.
                                </p>

                                <ul className="list-disc pl-4 mb-4 space-y-2.5 text-xl">
                                    <li>Fees, pricing, and payment terms will be disclosed before purchase</li>
                                    <li>Payments may be made using fiat or stablecoins, depending on the service</li>
                                    <li>All fees are non-refundable unless stated otherwise</li>
                                </ul>

                                <p className="font-normal text-xl text-black mb8">
                                    You are responsible for any taxes, duties, or charges associated with your use of the Services.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Stablecoins and Blockchain Transactions</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    Certain Helicode services involve stablecoin payments and blockchain infrastructure. You acknowledge that:
                                </p>

                                <ul className="list-disc pl-4 mb-4 space-y-2.5 text-xl">
                                    <li>Blockchain transactions are irreversible</li>
                                    <li>Transaction data on public blockchains is transparent and immutable</li>
                                    <li>Network delays, congestion, or failures may occur</li>
                                    <li>Helicode does not control blockchain networks</li>
                                </ul>

                                <p className="font-normal text-xl text-black mb8">
                                    Helicode is not responsible for losses caused by blockchain network issues, user wallet errors, or incorrect transaction details provided by you.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Education and Content Disclaimer</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    Educational content provided by Helicode is for informational and educational purposes only.
                                </p>

                                <ul className="list-disc pl-4 mb4 space-y-2.5 text-xl">
                                    <li>We do not guarantee job placement, income, or financial outcomes</li>
                                    <li>Participation in courses or programs does not constitute professional, legal, or financial advice</li>
                                    <li>Outcomes depend on individual effort, market conditions, and external factors</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Intellectual Property</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    All content, software, branding, and materials provided by Helicode are owned by or licensed to Helicode. You may not:
                                </p>

                                <ul className="list-disc pl-4 mb-4 space-y-2.5 text-xl">
                                    <li>Copy, modify, distribute, or resell our content without permission</li>
                                    <li>Use our trademarks, logos, or brand assets without written consent</li>
                                </ul>

                                <p className="font-normal text-xl text-black mb8">
                                    Limited, non-exclusive use is granted solely for accessing the Services.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Third-Party Services</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    Helicode may integrate or link to third-party tools or platforms.
                                </p>

                                <ul className="list-disc pl-4 mb4 space-y-2.5 text-xl">
                                    <li>We do not control third-party services</li>
                                    <li>We are not responsible for their content, availability, or practices</li>
                                    <li>Use of third-party services is at your own risk</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Suspension and Termination</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    We may suspend or terminate your access to the Services at any time if:
                                </p>

                                <ul className="list-disc pl-4 mb-4 space-y-2.5 text-xl">
                                    <li>You violate these Terms</li>
                                    <li>You engage in fraudulent or harmful behavior</li>
                                    <li>Required by law or regulation</li>
                                </ul>

                                <p className="font-normal text-xl text-black mb8">
                                    Termination does not affect obligations or rights accrued before termination.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Limitation of Liability</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    To the maximum extent permitted by law:
                                </p>

                                <ul className="list-disc pl-4 mb-4 space-y-2.5 text-xl">
                                    <li>Helicode is provided “as is” and “as available”</li>
                                    <li>We are not liable for indirect, incidental, or consequential damages</li>
                                    <li>Our total liability will not exceed the amount paid by you to Helicode in the last 12 months</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Indemnification</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    You agree to indemnify and hold harmless Helicode, its founders, employees, and partners from any claims, losses, or damages arising from:
                                </p>

                                <ul className="list-disc pl-4 mb-4 space-y-2.5 text-xl">
                                    <li>Your use of the Services</li>
                                    <li>Your violation of these Terms</li>
                                    <li>Your breach of applicable laws</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Changes to These Terms</h2>
                                <p className="font-normal text-xl text-black mb6">
                                    We may update these Terms from time to time. When changes are made, we will update the “Last updated” date. Continued use of the Services after changes means you accept the updated Terms.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Governing Law</h2>
                                <p className="font-normal text-xl text-black mb6">
                                    These Terms are governed by and construed in accordance with the laws of [insert jurisdiction], without regard to conflict of law principles.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Contact Information</h2>
                                <p className="font-normal text-xl text-black mb6">
                                    If you have questions about these Terms, contact us at,{" "}<a href="mailto:admin@helicode.xyz" className="text-[#0052FF]">admin@helicode.xyz</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <FooterCTA />
            </div>
        </main>
    )
}
