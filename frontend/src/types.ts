export type UserType = {
    _id: string, 
    profile_picture?: string, 
    display_name: string,
    about_me?: string,
    createdAt: Date
} 

export type MessageType = { 
    _id: string,
    content?: string,
    image?: string,
    user: UserType,
    createdAt: Date
}

export type NotificationType = {
    _id: string,
    to: string,
    from: string,
    from_type: 'User' | 'Conversation',
    conversation_id: string,
    is_read: boolean
}

export type ConversationType = {
    _id: string,
    users: UserType[],
    history: MessageType[],
    display_name: string,
    profile_picture: string,
    admins: string[],
    admin_permissions: {
        delete_messages: boolean,
        invite_users: boolean,
        kick_users: boolean,
    }
    owner: string,
}
