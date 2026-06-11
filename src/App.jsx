import AttendeeApp from "./pages/AttendeeApp";
import LeaderDashboard from "./pages/LeaderDashboard";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import Projector from "./pages/Projector";

export default function App() {
  const view = new URLSearchParams(location.search).get("view");
  if (view === "projector") return <Projector />;
  if (view === "moderator") return <ModeratorDashboard />;
  if (view === "leader") return <LeaderDashboard />;
  return <AttendeeApp />;
}
