const form = document.querySelector('#sendMessage');
const userMessage = document.querySelector('#message');
const chatlog = document.querySelector('#chatlog');
const clearChatlog = document.querySelector('#clearChat');
const loginButton = document.querySelector('#login');
const logoutButton = document.querySelector('#logout');
const userInfoButton = document.querySelector('#info');


form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (userMessage.value.length < 1) return;
    //get date
    const date = new Date();
    const hour = date.getHours().toString();
    const minutes = date.getMinutes().toString();
    const seconds = date.getSeconds().toString();
    //format date
    const paddedSeconds = seconds.padStart(2, '0');
    const paddedMinutes = minutes.padStart(2, '0');
    const paddedHour = hour.padStart(2, '0')

    //create new li element
    const newMessage = document.createElement('li');
    //change html of li element
    newMessage.innerHTML =  `
    <p class="messageContents">
        <span class="time">
            ${paddedHour}:${paddedMinutes}:${paddedSeconds}
        </span>
        ${userMessage.value}
    </p>
    `
    chatlog.appendChild(newMessage);
    //reset form
    userMessage.value = '';
    //store to local storage
    localStorage.setItem('messages', chatlog.innerHTML);

    chatlog.scrollTo({
        top: chatlog.scrollHeight,
        left: 0,
        behavior: 'smooth'
    })
}, false)


clearChatlog.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    location.reload();
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
        })
}

getUser()

const printUserData = (user) => {
    console.log(user)
    const { id, userProfile } = user
    console.log(id, userProfile.nickname)
    const htmlToAppend = `welcome, ${userProfile.nickname}`
    const newUser = document.createElement('p')
    newUser.setAttribute('id', `${id}`);
    newUser.innerHTML = htmlToAppend
    document.querySelector('#welcomeUser').append(newUser)
}