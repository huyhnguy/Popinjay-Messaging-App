# Popinjay - Messaging App
A messaging app created with Node.js, Express, MongoDB, React, Javascript, HTML, CSS.

[https://popinjay-frontend.vercel.app/](https://popinjay-frontend.vercel.app/)

## Table of Contents
- [Description](#description)
    - [Features](#features)
    - [Group-Management](#group-management)
    - [Notifications](#notifications)
- [Technologies](#technologies)
- [How-to-use-the-Project](#how-to-use-the-project)
- [How-to-Run-Project-Locally](#how-to-run-project-locally)

## Description

### Features
- Group management (master, admin, member)
- Notifications
- Authentication with HTTP-only cookies and JWTs
- Image sending in messages
- Message editing and deletion
- Responsive design
- Search bars for users, groups, and messages
- Profile settings for updating display name, profile picture, and 'about me'
- Efficient database queries for fast, efficient site performance

### Group Management
Users can create group chats and manage them as a master. Groups will have a master, admins, and regular members. Masters can change the display name, profile picture and admin permissions of the group. Masters can also delete messages, kick users, and invite users. Admin powers depend on the admin permissions granted by the master but at most they can kick users, invite users, and delete messages.

### Notifications
Notifications will be shown in the notifications tab and new notifications will be marked with a light blue background in notifications, in the group tab, and in the messages tab. Users will be notified of any new notifications by a counter that will pop up in the navigation bar on the bell icon.

Users will receive notifications whenever...
- they get new messages in groups or private messages
- they get added to a group
- they get kicked from a group
- they are given the admin role in a group
- they have their admin role taken away in a group
- they are given the master role in a group

## Technologies
- MongoDB
- Mongoose
- Express.js
- React.js
- Node.js 
- JWT (JSON Web Tokens)
- Cloudinary 
- Font Awesome
- ESLint
- Vite
- Multer
- Bcrypt
- Heroku (backend)
- Vercel (frontend)

##  How to Use The Project 
- Make a new group by navigating to the group tab and clicking the plus button at the top right 
![Add Group Image](/images/new_group.png "New Group")
- To manage groups, click on a group in the group tab, then click on the cog icon in the top right. 
    - Masters can do a number of things to each member based on the options given in the dropdown when they click a member within the member list
    ![Master](/images//master.png "Master")
    - Admins are granted powers based on the permissions given from the master. At most they can kick users, invite users, and delete messages
- To mark all new notifications as read, click the envelope icon in the top right of the notification tab, or click an individual notification to mark it as read
![Notifications](/images/notifications.png "Notifications")
- To upload images into your messages, click the up arrow icon in the bottom left of a conversation.
- To edit or delete messages, hover over them for the options
![Messages](/images/crud_message.png "Messages")

## How to Run Project Locally
1. Clone this repository
2. cd or change directory to the project directory
3. cd to the 'backend' directory
4. run ```npm install``` in your bash/command line
5. Connect to your MongoDB cluster
    1. Sign up or log in to MongoDB [https://www.mongodb.com/](https://www.mongodb.com/)
    2. Create a new project
    3. Create a new MO(free) cluster
    4. Create a database user and save the password
    5. Grab the database connection string and replace <db_password> with the password from step 5.
    6. Create a .env file and within, write ```MONGODB_URI=<db_connection_string>```. Make sure to replace <db_connection_string> with your real connection string
6. Within your .env file, write ```ACCESS_TOKEN_SECRET=<random_string>```. Make sure to replace <random_string> with a random string.
7. Connect to Cloudinary
    1. Sign up or log in to Cloudinary [https://cloudinary.com/](https://cloudinary.com/)
    2. Within the home console, click the 'Get Started' button.
    3. Click the 'View API Keys'
    4. Within your .env file, write ```CLOUDINARY_CLOUD_NAME=``` and add your cloud name
    5. Write ```CLOUDINARY_API_KEY=``` and add your api key
    6. Write ```CLOUDINARY_API_SECRET=``` and add your api secret
8. Within your 'app.js' file, in the 'corsOptions' variable, change the origin to 'http://localhost:5173'
9. run ```npm run devstart``` in your bash/command line
10. In a different terminal window, cd back to the project root directory and into the 'frontend' directory
11. run ```npm install``` in your bash/command line
12. Within the 'src' directory, go through each react componenet and, for all fetching, replace the domain of every string with 'http://localhost:3000'. For example ```fetch('https://popinjay-7457d2787149.herokuapp.com/api/login'...``` would become ```fetch('http://localhost:3000/api/login'...```
12. run ```npm run dev``` in your bash/command line
13. Visit your localhost site 'http://localhost:5173'





