export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-animate">
        <div className="starry-background"></div>
        {children}
      </div>
    );
}
  