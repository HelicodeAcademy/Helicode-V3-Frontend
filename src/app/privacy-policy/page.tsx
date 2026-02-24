import FooterCTA from '@/components/Landing-page/FooterCTA'
import Navbar from '@/components/navigation/Navbar'

export default function PrivacyPolicyPage() {
    return (
        <main>
            <Navbar />
            <div className="py-12 md:py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-8 pb-10">
                    <div className="space-y-13">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl lg:text-7xl font-normal">Privacy Policy</h2>

                            <p className="text-xl">
                                This Privacy Policy describes our policies and procedures on the collection, use and disclosure of your information when you use the service and tells you about your privacy rights and how the law protects you. We use your personal data to provide and improve the service. By using the service, You agree to the collection and use of information in accordance with this privacy policy.
                            </p>
                        </div>

                        <div className="space-y-18">
                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-3">Information We Collect</h2>
                                <p className="font-normal text-xl text-black mb-8">
                                    We collect information to provide and improve our Services.
                                </p>

                                <p className="mb-3 font-medium text-xl">
                                    <strong>a. Information You Provide</strong>
                                </p>
                                <p className="mb-4 text-xl">When you use Helicode, we may collect:</p>

                                <ul className="list-disc pl-4 mb-16 space-y-2.5 text-xl">
                                    <li>Full name</li>
                                    <li>Email address</li>
                                    <li>Phone number</li>
                                    <li>Company name and role</li>
                                    <li>Payment and billing information</li>
                                    <li>Any information you submit through forms, onboarding flows, or communication with us</li>
                                </ul>

                                <p className="mb-3 font-medium text-xl">
                                    <strong>b. Information Collected Automatically</strong>
                                </p>
                                <p className="mb-4 text-xl">When you access our Services, we may automatically collect:</p>

                                <ul className="list-disc pl-4 mb6 space-y-2.5 text-xl">
                                    <li>IP address</li>
                                    <li>Device type and browser</li>
                                    <li>Usage data (pages visited, actions taken)</li>
                                    <li>Cookies and similar tracking technologies</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-3">How We Use Your Information</h2>
                                <p className="font-normal text-xl text-black mb-8">
                                    We use your information to:
                                </p>

                                <ul className="list-disc pl-4 mb-4 space-y-2.5 text-xl">
                                    <li>Provide, operate, and improve our Services</li>
                                    <li>Enable hiring, payroll, and payment operations</li>
                                    <li>Communicate with you (updates, support, product information)</li>
                                    <li>Process transactions and payments</li>
                                    <li>Ensure security, prevent fraud, and comply with legal obligations</li>
                                    <li>Analyze usage to improve performance and user experience</li>
                                </ul>

                                <p className="font-normal text-xl text-black mb8">
                                    We do not sell your personal data.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Stablecoins and Financial Data</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    Some Helicode services involve stablecoin payments and blockchain-based infrastructure.
                                </p>

                                <ul className="list-disc pl-4 mb-4 space-y-2.5 text-xl">
                                    <li>Transaction data recorded on public blockchains is public by nature and not controlled by Helicode.</li>
                                    <li>We do not control or modify blockchain records.</li>
                                    <li>We only collect off-chain data required to operate our services, meet compliance requirements, and support users.</li>
                                </ul>

                                <p className="font-normal text-xl text-black mb8">
                                    You acknowledge and accept the transparency and immutability of blockchain transactions when using these services.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">How We Share Information</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    We may share your information only when necessary:
                                </p>

                                <ul className="list-disc pl-4 mb4 space-y-2.5 text-xl">
                                    <li>With trusted service providers (e.g. payment processors, analytics tools)</li>
                                    <li>To comply with legal or regulatory requirements</li>
                                    <li>To protect Helicode, our users, or the public from harm or fraud</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-6">How We Share Information</h2>
                                <p className="font-normal text-xl text-black">
                                    We take security seriously.
                                </p>
                                <p className="font-normal text-xl text-black mb6">
                                    We use industry-standard safeguards to protect your information, including encryption, access controls, and secure infrastructure. However, no system is 100% secure, and we cannot guarantee absolute security.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Data Retention</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    We retain personal information only as long as necessary to:
                                </p>

                                <ul className="list-disc pl-4 mb-6 space-y-2.5 text-xl">
                                    <li>Provide our Services</li>
                                    <li>Meet legal, accounting, or regulatory obligations</li>
                                    <li>Resolve disputes and enforce agreements</li>
                                </ul>

                                <p className="font-normal text-xl text-black mb8">
                                    When data is no longer needed, we securely delete or anonymize it.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Your Rights</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    Depending on your location, you may have the right to:
                                </p>

                                <ul className="list-disc pl-4 mb-6 space-y-2.5 text-xl">
                                    <li>Access your personal data</li>
                                    <li>Request correction or deletion</li>
                                    <li>Object to or restrict processing</li>
                                    <li>Withdraw consent</li>
                                </ul>

                                <p className="font-normal text-xl text-black mb8">
                                    To exercise these rights, contact us at{" "}<a href="mailto:admin@helicode.xyz" className="text-[#0052FF]">admin@helicode.xyz</a>.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Cookies</h2>
                                <p className="font-normal text-xl text-black mb-6">
                                    We use cookies and similar technologies to:
                                </p>

                                <ul className="list-disc pl-4 mb-6 space-y-2.5 text-xl">
                                    <li>Improve functionality</li>
                                    <li>Understand usage patterns</li>
                                    <li>Enhance user experience</li>
                                </ul>

                                <p className="font-normal text-xl text-black mb8">
                                    You can control cookies through your browser settings.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Children&apos;s Privacy</h2>
                                <p className="font-normal text-xl text-black mb6">
                                    Helicode is not intended for individuals under the age of 18. We do not knowingly collect personal data from minors.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Changes to This Policy</h2>
                                <p className="font-normal text-xl text-black mb6">
                                    We may update this Privacy Policy from time to time. When we do, we will update the “Last updated” date and notify users where required.
                                    Continued use of our Services means you accept the updated policy.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-medium text-black mb-8">Contact Us</h2>
                                <p className="font-normal text-xl text-black mb6">
                                    If you have questions or concerns about this Privacy Policy or your data, contact us at{" "}<a href="mailto:admin@helicode.xyz" className="text-[#0052FF]">admin@helicode.xyz</a>.
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
