import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileEditor } from '@/components/profile-editor'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: tags } = await supabase
    .from('neighbors_interest_tags')
    .select('*')
    .eq('user_id', user.id)
    .order('confidence', { ascending: false })

  return (
    <ProfileEditor
      profile={profile!}
      interestTags={tags || []}
    />
  )
}
