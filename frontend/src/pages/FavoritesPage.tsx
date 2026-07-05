import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useAppSelector } from "../hooks/redux";
import { HomeThoughtCard } from "../components/HomeThoughtCard";

export function FavoritesPage() {
  const { items } = useAppSelector((s) => s.thoughts);
  const favorites = items.filter((t) => t.starred);

  if (favorites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="empty-state"
      >
        <Star size={40} style={{ color: "var(--accent)", marginBottom: 12 }} />
        <h3>No favorites yet</h3>
        <p>Click the ★ on any thought to pin it here.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <h3>Favorites</h3>
        <span className="section-badge">{favorites.length} starred</span>
      </div>
      <div className="cards-grid">
        {favorites.map((thought, i) => (
          <HomeThoughtCard key={thought.id} thought={thought} delay={i * 0.05} />
        ))}
      </div>
    </motion.div>
  );
}
