import { NextResponse } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth/middleware'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const me = await requireAuth()
    const myId = me.userId
    const supabase = await createClient()
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const contacts = url.searchParams.get('contacts')

    // Fetch all admin IDs for shared support inbox logic
    const { data: admins } = await supabase.from('users').select('id').in('role', ['admin', 'super_admin'])
    const adminIds = admins?.map(a => a.id) || [myId]
    const adminIdsStr = `(${adminIds.join(',')})`
    const isMeAdmin = me.role === 'admin' || me.role === 'super_admin'

    if (contacts) {
      let query = supabase
        .from('users')
        .select('id, fullname, email, phone, role')
        .neq('id', myId)

      if (isMeAdmin) {
        query = query.in('role', ['customer', 'vendor'])
      } else {
        query = query.in('role', ['super_admin', 'admin'])
      }

      const { data, error } = await query.order('fullname', { ascending: true })
      if (error) throw error

      let contactsWithMeta = (data || []).map(c => ({
        ...c,
        lastMessage: null as null | { content: string; created_at: string; sender_id: number },
        unreadCount: 0,
      }))

      try {
        const enriched = await Promise.all(contactsWithMeta.map(async (contact) => {
          let orQuery = `and(sender_id.eq.${myId},receiver_id.eq.${contact.id}),and(sender_id.eq.${contact.id},receiver_id.eq.${myId})`
          
          if (isMeAdmin) {
            // Admins see all messages to/from any admin and this customer
            orQuery = `and(sender_id.in.${adminIdsStr},receiver_id.eq.${contact.id}),and(sender_id.eq.${contact.id},receiver_id.in.${adminIdsStr})`
          } else {
            // Customer sees all messages to/from any admin and themselves
            orQuery = `and(sender_id.eq.${myId},receiver_id.in.${adminIdsStr}),and(sender_id.in.${adminIdsStr},receiver_id.eq.${myId})`
          }

          const { data: msgs } = await supabase
            .from('direct_messages')
            .select('content, created_at, sender_id, is_read')
            .or(orQuery)
            .order('created_at', { ascending: false })
            .limit(1)

          let unreadQuery = supabase
            .from('direct_messages')
            .select('id', { count: 'exact', head: true })
            .eq('sender_id', contact.id)
            .eq('is_read', false)

          if (isMeAdmin) {
            unreadQuery = unreadQuery.in('receiver_id', adminIds)
          } else {
            unreadQuery = unreadQuery.eq('receiver_id', myId)
          }

          const { count: unread } = await unreadQuery

          return {
            ...contact,
            lastMessage: msgs?.[0] || null,
            unreadCount: unread || 0,
          }
        }))
        contactsWithMeta = enriched
      } catch {
        // Table may not exist yet
      }

      contactsWithMeta.sort((a, b) => {
        if (a.lastMessage && !b.lastMessage) return -1
        if (!a.lastMessage && b.lastMessage) return 1
        if (a.lastMessage && b.lastMessage) {
          return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
        }
        return a.fullname.localeCompare(b.fullname)
      })

      return NextResponse.json({ contacts: contactsWithMeta })
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const { data: otherUser } = await supabase.from('users').select('role').eq('id', userId).single()
    const isOtherAdmin = otherUser?.role === 'admin' || otherUser?.role === 'super_admin'

    let orQuery = `and(sender_id.eq.${myId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${myId})`
    if (isMeAdmin && !isOtherAdmin) {
      orQuery = `and(sender_id.in.${adminIdsStr},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.in.${adminIdsStr})`
    } else if (!isMeAdmin && isOtherAdmin) {
      orQuery = `and(sender_id.eq.${myId},receiver_id.in.${adminIdsStr}),and(sender_id.in.${adminIdsStr},receiver_id.eq.${myId})`
    }

    const { data: messages, error } = await supabase
      .from('direct_messages')
      .select(`
        id, content, attachment_url, file_type, is_read, created_at,
        sender:users!direct_messages_sender_id_fkey(id, fullname, role)
      `)
      .or(orQuery)
      .order('created_at', { ascending: true })

    if (error) {
      if (error.code === '42P01') return NextResponse.json({ messages: [] })
      throw error
    }

    // Mark as read
    let updateQuery = supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('is_read', false)

    if (isMeAdmin && !isOtherAdmin) {
      updateQuery = updateQuery.eq('sender_id', userId).in('receiver_id', adminIds)
    } else if (!isMeAdmin && isOtherAdmin) {
      updateQuery = updateQuery.in('sender_id', adminIds).eq('receiver_id', myId)
    } else {
      updateQuery = updateQuery.eq('sender_id', userId).eq('receiver_id', myId)
    }

    await updateQuery

    return NextResponse.json({ messages: messages || [] })
  } catch (err) {
    const { error, status } = authErrorResponse(err)
    return NextResponse.json({ error }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const me = await requireAuth()
    const myId = me.userId
    const supabase = await createClient()
    const body = await request.json()
    const { receiver_id, content, attachment_url, file_type } = body

    if (!receiver_id) return NextResponse.json({ error: 'receiver_id required' }, { status: 400 })
    if (!content?.trim() && !attachment_url) return NextResponse.json({ error: 'content or attachment required' }, { status: 400 })

    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: myId,
        receiver_id,
        content: content?.trim() || '',
        attachment_url: attachment_url || null,
        file_type: file_type || null,
        is_read: false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message: data })
  } catch (err) {
    const { error, status } = authErrorResponse(err)
    return NextResponse.json({ error }, { status })
  }
}
