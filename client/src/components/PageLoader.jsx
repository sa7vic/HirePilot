import SkeletonCard from "./SkeletonCard.jsx";

export default function PageLoader({ cards = 4 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: cards }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
