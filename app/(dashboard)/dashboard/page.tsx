import { redirect } from 'next/navigation'

export default function DashboardPage() {
  // Default dashboard route - redirect to emails (main view)
  redirect('/emails')
}
