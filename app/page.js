import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function Home() {
  // Since our middleware handles redirects for root path, 
  // this page might never render for logged-in users,
  // but just in case, we will redirect to login.
  redirect('/login')
}
