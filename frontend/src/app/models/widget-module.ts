// Interface for the summary cards (reused by InstructorDashboard and WidgetComponent)
export interface SummaryCard {
  title: string;
  value: string;
  trend: string;
  iconName: string; // e.g., 'fas fa-user-graduate'
  colorClass: string; // e.g., 'blue', 'green', 'orange'
}


