
import { notFound } from 'next/navigation'
import { getUser } from '@/lib/action/user.action'
import CallAgent from './call-agent'

export default async function CallAgentPage({ params }: { params: { id: string } }) {
    const user = await getUser(params.id)
    console.log(user)
    if (!user) {
        notFound()
    }

    return <CallAgent user={user} />
}