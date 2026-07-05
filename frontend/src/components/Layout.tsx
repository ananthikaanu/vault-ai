import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { RightPanel } from "./RightPanel";

const SHOW_RIGHT_PANEL = ["/", "/vault", "/stats"];
const FULL_HEIGHT_PAGES = ["/chat"];

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const showRight = SHOW_RIGHT_PANEL.includes(pathname);
  const fullHeight = FULL_HEIGHT_PAGES.includes(pathname);

  return (
    <div className={`app-layout ${showRight ? "app-layout--3col" : "app-layout--2col"}`}>
      <Sidebar />

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-overlay"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="mobile-sidebar-wrap"
            >
              <Sidebar mobile onClose={() => setMobileSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="app-center">
        <div className="mobile-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
        <Header />

        <div className="app-content" style={fullHeight ? { padding: 0, overflow: "hidden" } : undefined}>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={fullHeight ? { height: "100%" } : undefined}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {showRight && <RightPanel />}
    </div>
  );
}
