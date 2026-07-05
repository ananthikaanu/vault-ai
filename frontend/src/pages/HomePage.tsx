import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchThoughts, fetchStats } from "../store";
import { QuickCapture } from "../components/QuickCapture";
import { HomeThoughtCard } from "../components/HomeThoughtCard";
import { InsightsSection } from "../components/InsightsSection";

export function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items } = useAppSelector((s) => s.thoughts);
  const [initialLoad, setInitialLoad] = useState(items.length === 0);

  useEffect(() => {
    const load = async () => {
      if (items.length === 0) setInitialLoad(true);
      await Promise.all([dispatch(fetchThoughts({})), dispatch(fetchStats())]);
      setInitialLoad(false);
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const recent = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="home-page">
      <QuickCapture />

      <div className="home-section">
        <div className="home-section__header">
          <h3>Recent Thoughts</h3>
          <button className="btn-link" onClick={() => navigate("/vault")}>
            View all <ArrowRight size={13} />
          </button>
        </div>

        {initialLoad ? (
          <div className="loading-state">
            <div className="spinner" />
          </div>
        ) : recent.length === 0 ? (
          <div className="home-empty-cards">
            <span>🌱</span>
            <p>Your vault is empty — capture your first thought above!</p>
          </div>
        ) : (
          <div className="home-cards-grid">
            {recent.map((t, i) => (
              <HomeThoughtCard key={t.id} thought={t} delay={i * 0.06} />
            ))}
          </div>
        )}
      </div>

      <InsightsSection />
    </div>
  );
}
