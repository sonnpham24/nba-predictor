'use client';

export default function VerifiedBadge({ showText = false }: { showText?: boolean }) {
  return (
    <span
      className="inline-flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-1.5 py-0.5 rounded-full shadow-md text-[10px] font-black tracking-wider uppercase flex-shrink-0"
      title="Verified Official Admin"
    >
      <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
      {showText && <span>VERIFIED ADMIN</span>}
    </span>
  );
}
