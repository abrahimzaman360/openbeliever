export function FavouritesSkeleton() {
  return (
    <div className="rounded-xl border-2 border-gray-300 shadow-sm overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6 mb-4"></div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="h-48 bg-gray-200 rounded col-span-1"></div>
          <div className="h-48 bg-gray-200 rounded col-span-1"></div>
          <div className="h-48 bg-gray-200 rounded col-span-1"></div>
        </div>
      </div>
    </div>
  );
}
