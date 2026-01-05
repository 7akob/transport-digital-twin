import { NavLink } from "react-router-dom";

const linkBase =
  "block px-4 py-3 text-sm border-l-4 transition";
const active =
  "border-l-green-600 text-green-700 bg-green-50";
const inactive =
  "border-l-transparent text-slate-700 hover:bg-slate-50";

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-100 border-r min-h-screen">
      <div className="px-4 py-5 font-semibold text-slate-900">
        Urban Public Transport Twin
      </div>

      <nav className="mt-2">
        <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>
          Command Center
        </NavLink>
        <NavLink to="/topology" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>
          Topology View
        </NavLink>
        <NavLink to="/operations" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>
          Operations View
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>
          System Settings
        </NavLink>
      </nav>
    </aside>
  );
}
