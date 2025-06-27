import Link from 'next/link';

const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Contact', href: '#contact' },
];

export default function Header() {
  return (
    <header className="fixed w-full bg-black/80 backdrop-blur-md z-50">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold gradient-text">
            Flame Audio AI
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              {item.name}
            </Link>
          ))}
          <Link 
            href="/login" 
            className="btn-secondary"
          >
            Sign In
          </Link>
          <Link 
            href="/dashboard" 
            className="btn-primary"
          >
            Get Started
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <button className="md:hidden text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </nav>
    </header>
  );
}
