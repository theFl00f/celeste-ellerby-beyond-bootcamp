const form = document.querySelector('#sendMessage');
const userMessage = document.querySelector('#message');
const deleteMessage = document.getElementsByClassName('userMessage')
const chatlog = document.querySelector('#chatlog');
const clearChatlog = document.querySelector('#clearChat');
const loginButton = document.querySelector('#login');
const logoutButton = document.querySelector('#logout');
const userInfoButton = document.querySelector('#info');
const welcomeUser = document.querySelector('#welcomeUser');
const onlineUsers = document.querySelector('#onlineUsers')
let currentUser;
let userId = null;
let userNickname = 'anonymous';

const socket = io();

const socketSendMessage = () => {
    const msg = userMessage.value;
    if (msg) {
        socket.emit('msg', {message: msg})
    }
    console.log(msg)
    printMessages()
}

socket.on('counter', (data) => {
    onlineUsers.innerHTML = data.onlineUsers
})




//listen for new messages

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (userMessage.value.length < 1) return;
    getUser();
    if (currentUser) {
        userId = currentUser.id;
        userNickname = currentUser.nickname;
    }
    postMessageToDB(userId, userNickname, userMessage.value).then(data => {
        console.log(data)
    })
    socketSendMessage();
//     //reset form
    userMessage.value = '';
})





const savedMessages = localStorage.getItem('messages');
if (savedMessages) {
    chatlog.innerHTML = savedMessages;
}

const getUser = () => {
    fetch('/api/data/users')
        .then((data) => data.json())
        .then(json => {
            printUserData(json)
        }).catch(err => {
            console.log(err)
            userId = null;
            userNickname = 'anonymous'
        })
}

getUser()


const printUserData = (user) => {
    
    if (!welcomeUser.hasChildNodes()) {
        const { id, userProfile } = user
        currentUser = userProfile;
        console.log(user)
        console.log(id, userProfile.nickname)
        const htmlToAppend = `welcome, ${userProfile.nickname}`
        const newUser = document.createElement('p')
        newUser.setAttribute('id', `${id}`);
        newUser.innerHTML = htmlToAppend
        welcomeUser.append(newUser)
    }
}

const postMessageToDB = async (id, nickname, message) => {
    const response = await fetch('/api/data/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            body: message,
            user: {
                id,
                nickname
            }
        })
    })
    return response.json();
}

const getMessages = () => {
    return fetch('/api/data/messages')
        .then(data => {
            return data.json()
        })
        .then(json => {
        return json
    })
}

const printMessages = () => {
    getMessages()
        .then(res => {
        chatlog.innerHTML = '';
        console.log(res)
        res.forEach(message => {
            const { _id, body, created_at, user } = message
            //create new li element
            const newMessage = document.createElement('li');
            const newDate = new Date(created_at);
            const dateString = newDate.toString().slice(0, 15)
            const timeArray = newDate.toString().slice(16, -33).split(':')
            const hours = parseInt(timeArray[0]);
            let amPm;
            if (hours >= 12) {
                amPm = 'pm'
            } else {
                amPm = 'am'
            }
            // console.log(hours)
            const formattedTime = `${timeArray[0]}:${timeArray[1]}`
            //change html of li element
            //only add button if p.userinfo id is equal to null or is not equal to the div.welcomeUser child's id
            if (user.id !== null && currentUser && user.id == currentUser.id) {
                //matches
                newMessage.innerHTML =  `
                <article class="userMessage">
                    <button href="/api/data/messages/${_id}" id="${_id}" class="deleteMessage">x</button>
                    <p class="userInfo" id="${user.id}">${user.nickname}
                        <span class="time">
                            <span class="date">${dateString} </span>
                            ${formattedTime}
                        </span>
                    </p>
                    <p class="messageContents">
                        ${body}
                    </p>
                </article>
                `
            } else {
                //does not match
                newMessage.innerHTML =  `
                <article class="userMessage">
                    <p class="userInfo" id="${user.id}">${user.nickname}
                        <span class="time">
                            <span class="date">${dateString} </span>
                            ${formattedTime}
                        </span>
                    </p>
                    <p class="messageContents">
                        ${body}
                    </p>
                </article>
                `
            }
            chatlog.appendChild(newMessage);
            chatlog.scrollTo({
                top: chatlog.scrollHeight,
                left: 0,
                behavior: 'auto'
            })
        })
    })
    .then(() => {
            // delete message
            const messageArray = [...document.getElementsByClassName('deleteMessage')];
            messageArray.forEach(message => {
                message.addEventListener('click', function (e) {
                    e.preventDefault();
                    fetch(`/api/data/messages/${this.id}`, {
                        method: 'DELETE'
                    })
                    .then(res => res.json())
                    .then(() => {
                        printMessages();
                    })
                })
            })


        })
}

socket.on('newmsg', msg => {
    console.log('socket listener', msg)
    printMessages()
})

printMessages();