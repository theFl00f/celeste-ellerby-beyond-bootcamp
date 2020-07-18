const form = document.querySelector('#sendMessage');
const userMessage = document.querySelector('#message');
const deleteMessage = document.getElementsByClassName('userMessage')
const chatlog = document.querySelector('#chatlog');
const clearChatlog = document.querySelector('#clearChat');
const loginButton = document.querySelector('#login');
const logoutButton = document.querySelector('#logout');
const userInfoButton = document.querySelector('#info');
const welcomeUser = document.querySelector('#welcomeUser');
const onlineUsers = document.querySelector('#onlineUsers');
let currentUser;
let userId = null;
let userNickname = 'anonymous';

const socket = io();

const socketSendMessage = () => {
    const msg = userMessage.value;
    if (msg) {
        socket.emit('msg', {message: msg});
    }
    printMessages();
}

socket.on('counter', (data) => {
    onlineUsers.innerHTML = data.onlineUsers;
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
        console.log(data);
    })
    socketSendMessage();
//     //reset form
    userMessage.value = '';
})


const getUser = () => {
    fetch('/api/data/users')
        .then((data) => data.json())
        .then(json => {
            printUserData(json);
            logoutButton.classList.remove('hidden');
            loginButton.classList.add('hidden');
            welcomeUser.classList.add('hidden')
            //execute 'logged out' state for news section
        }).catch(err => {
            console.log(err);
            userId = null;
            userNickname = 'anonymous';
            logoutButton.classList.add('hidden');
            loginButton.classList.remove('hidden');
            welcomeUser.classList.add('hidden')
            //execute 'logged out' state for news section
        })
}



const printUserData = (user) => {
    if (!welcomeUser.hasChildNodes()) {
        const { id, userProfile } = user;
        currentUser = userProfile;
        const htmlToAppend = `welcome, <span>${userProfile.nickname}</span>`;
        const newUser = document.createElement('p');
        newUser.setAttribute('id', `${id}`);
        newUser.innerHTML = htmlToAppend;
        welcomeUser.append(newUser);
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
            return data.json();
        })
        .then(json => {
        return json;
    })
}

const printMessages = () => {
    getMessages()
        .then(res => {
        chatlog.innerHTML = '';
        res.forEach(message => {
            const { _id, body, created_at, user } = message;
            const newMessage = document.createElement('li');
            const newDate = new Date(created_at);
            const dateString = newDate.toString().slice(0, 15);
            const timeArray = newDate.toString().slice(16, -33).split(':');
            const hours = parseInt(timeArray[0]);
            let amPm;
            if (hours >= 12) {
                amPm = 'pm'
            } else {
                amPm = 'am'
            }
            const formattedTime = `${timeArray[0]}:${timeArray[1]}`
            if (user.id !== null && currentUser && user.id == currentUser.id) {
                newMessage.innerHTML =  `
                <article class="userMessage">
                    <button href="/api/data/messages/${_id}" id="${_id}" class="deleteMessage">x</button>
                    <p class="userInfo" id="${user.id}">${user.nickname}
                    <span class="date">${dateString} </span>
                    </p>
                    <p class="messageContents">
                        ${body}
                    </p>
                </article>
                <span class="time">${formattedTime}</span>
                `
            } else {
                //does not match
                newMessage.innerHTML =  `
                <article class="userMessage">
                    <p class="userInfo" id="${user.id}">${user.nickname}
                    <span class="date">${dateString} </span>
                    </p>
                    <p class="messageContents">
                        ${body}
                    </p>
                </article>
                <span class="time">${formattedTime}</span>
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
    printMessages()
})

printMessages();
getUser()
