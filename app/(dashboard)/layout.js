import MainLayout from '@/app/components/layout/MainLayout'
import ProtectedDashboard from '@/app/components/layout/ProtectedDashboard'

export default function DashboardLayout({ children }) {
  return (
    <ProtectedDashboard>
      <MainLayout>{children}</MainLayout>
    </ProtectedDashboard>
  )
}
