export default function GoogleSearchBar() {
  const onSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const query = (e.target as HTMLInputElement).value;
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10">
      <input
        onKeyDown={onSearch}
        placeholder="Search Google or type a URL"
        className="w-full px-4 py-3 rounded-2xl shadow-md border border-gray-300 focus:outline-none"
      />
    </div>
  );
}
