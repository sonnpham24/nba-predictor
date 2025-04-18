'use client';

export default function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white px-4 py-2 rounded shadow-lg animate-fade-in-out">
      {message}
    </div>
  );
}
