// IIFE
;(() => {
    const socket = new WebSocket(`ws://${window.location.host}/ws`)
    const formEl = document.getElementById('form')
    /** @type {HTMLInputElement | null} */
    const inputEl = document.getElementById('input')
    const chatsEl = document.getElementById('chats')

    if(!formEl || !inputEl || !chatsEl){
        throw new Error('Init failed!')
    }

    /**
     * @typedef chats
     * @property {string} nickname
     * @property {string} message
     */

    /**
     * @type{chat[]}
     */
    const chats = []

    const adjectives = ['멋진', '친절한', '훌륭한', '새침한']
    const anmals = ['물범', '사자', '사슴', '돌고레', '독수리']


    function pickRandom(array){
        const randomIdx = Math.floor(Math.random() * array.length)
        const result = array[randomIdx]

        if(!result)
        {
            throw new Error('array length is 0.')
        }
        return result
    }

    const myNickname = `${pickRandom(adjectives)} ${pickRandom(anmals)}`

    formEl.addEventListener('submit', (event) => {
        event.preventDefault()
        
        socket.send(JSON.stringify({
            nickname:myNickname,
            message: decodeURIComponent(inputEl.value)
        }) )
        inputEl.value = ''
    })

    socket.addEventListener('message', (event)=>{
        chatsEl.innerHTML = ''


        chats.push(JSON.parse(event.data))
        chats.forEach(chat => {
            const div  = document.createElement('div')
            div.innerText = `${chat.nickname}: ${chat.message}`
            chatsEl.appendChild(div)
        })
    })
})()
