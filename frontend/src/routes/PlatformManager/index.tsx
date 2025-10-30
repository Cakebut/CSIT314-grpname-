import ReportsPage from "./ReportsPage";
import AnnouncementsPage from "./AnnouncementsPage";
import CategoriesPage from "./CategoriesPage";

export default function PlatformManagerHome() {
  return (
    <div>
      <CategoriesPage />
      <hr />
      <ReportsPage />
      <hr />
      <AnnouncementsPage />
    </div>
  );
}
