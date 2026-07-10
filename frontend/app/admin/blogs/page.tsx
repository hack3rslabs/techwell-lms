import { redirect } from 'next/navigation'

export default function BlogsIndex() {
    redirect('/admin/blogs/dashboard')
}
