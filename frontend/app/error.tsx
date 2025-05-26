"use client";

export default function Error() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Something went wrong!</h2>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => {
            window.location.reload();
          }}>
          Try again
        </button>
      </div>
    </div>
  );
}
