"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto text-center py-16">
      <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
        Something went wrong
      </h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={() => unstable_retry()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
