//Pub
//TailwindCSS

const Koa = require('koa')
const Pug = require('koa-pug')
const path = require('path')
const route = require('koa-route')
const serve = require('koa-static')
const mount = require('koa-mount')
const websockify = require('koa-websocket')
const { MongoClient } = require('mongodb')

const uri = 'mongodb+srv://myshaitan:sJL2BLM8K7H8H7w@cluster0.pc53wka.mongodb.net/?retryWrites=true&w=majority'
const mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const app = websockify(new Koa())
// @ts-ignore
// eslint-disable-next-line no-new
const pug = new Pug({
    viewPath: path.resolve(__dirname, './views'),
    app,
})

app.use(mount('/public', serve('src/public')))
//app.use(serve('src/public'))

app.use(async (ctx) => {
    ctx.type = 'charset=utf-8'
    await ctx.render('main')
})

const _client = mongoClient.connect()

async function getChatsCollection(){
    const client = await _client
    return client.db('chat').collection('chats')
}

app.ws.use(
    route.all('/ws', async (ctx) =>{
        const chatsCollection = await getChatsCollection()
        const chatsCursor = chatsCollection.find({},{
            sort:{
                createdAt: 1,
            }
        })

        const chats = await chatsCursor.toArray()
        ctx.websocket.send(
            JSON.stringify({
                type:'sync',
                payload:{
                    chats,
                }
            })
        )

        ctx.websocket.on('message', async (data) => {
            data = data.toString("utf-8")
            if(typeof data !== 'string'){
                return
            }
            const chat = JSON.parse(data)
            await chatsCollection.insertOne(
                {
                    ...chat,
                    createdAt: new Date(),
                }
                )

            const {message, nickname} = chat

            const { server} = app.ws
            if(!server){
                return
            }

            server.clients.forEach(client => {
                client.send(JSON.stringify({
                    type:'chat',
                    payload:{
                        message,
                        nickname
                    }
                }))
            })
        })
    })
)

app.listen(5000)