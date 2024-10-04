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