import Link from 'next/link';
import ProductMegaMenu from './ProductMegaMenu';

export default function DesktopMenu() {
    return (
        <div className="hidden md:flex items-center gap-8">
            {/* Product Mega Menu */}
            <ProductMegaMenu />

            <Link href="/about" className="hover:text-primary">
                About Us
            </Link>

            <Link href="/blog" className="hover:text-primary">
                Blog
            </Link>

            <Link
                href="/get-started"
                className="rounded-md bg-black px-4 py-2 text-white"
            >
                Get Started
            </Link>
        </div>
    );
}
