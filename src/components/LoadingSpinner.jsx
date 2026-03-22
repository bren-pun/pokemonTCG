export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="spinner w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full" />
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}
