import { redirect } from 'next/navigation'

export default function DashboardPage() {
  // Redirect to emails page like Resend does
  redirect('/emails')
}
