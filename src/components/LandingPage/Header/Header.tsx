import AuthButton from './AuthButton';
import Logo from './Logo';
import Navigation from './Navigation';

export default function Header() {
  return (
    <header className="fixed top-0 w-screen bg-black/25">
      <div className="container mx-auto flex items-center justify-between gap-12 p-4">
        <Logo />
        <Navigation />
        <AuthButton />
      </div>
    </header>
  );
}
