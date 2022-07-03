//Pub
//TailwindCSS

const Koa = require('koa')
const Pug = require('koa-pug')
const path = require('path')
const route = require('koa-route')
const serve = require('koa-static')
const mount = require('koa-mount')
const websockify = require('koa-websocket')

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

app.ws.use(
    route.all('/ws', async (ctx) =>{
        ctx.websocket.on('message', async (data) => {
            console.log(data.toString("utf-8"))
            if(typeof data.toString("utf-8") !== 'string'){
                return
            }
            console.log(data.toString("utf-8"))
            const {message, nickname} = JSON.parse(data.toString("utf-8"))

            const { server} = app.ws
            if(!server){
                return
            }

            server.clients.forEach(client => {
                client.send(JSON.stringify({
                    message,
                    nickname
                }))
            })

        })
    })
)

app.listen(5000)