import { motion } from "framer-motion";
import { Bell } from "lucide-react";
export function RemindersPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="empty-state"
    >
      <Bell size={40} style={{ color: "var(--accent)", marginBottom: 12 }} />
      <h3>Reminders Coming Soon</h3>
      <p>Set reminders for your tasks and ideas.</p>
    </motion.div>
  );
}
