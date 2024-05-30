import express from 'express'
import { _2, _sPromise } from "./api/_.js"
import Redis from 'ioredis'
import dotenv from 'dotenv'
import { getCached, rateLimiter } from './middleware/redis.js'

const app = express()

dotenv.config({ path: './.env' })
const port = process.env.PORT || 6300

export const redis = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
})

redis.on('connect', () => console.log('Redis Connected'))

app.get('/', rateLimiter('_check', 20, 60), getCached('_s2'), async (req, res) => {
    const _s = await _sPromise()
    // await redis.setex('_s2', 18, JSON.stringify(_s._))
    await redis.setex('_s2', 18, JSON.stringify(_s))
    res.json({ _: _s })
})

app.get('/mutate/:id', async (req, res) => {
    const id = req.params.id
    // any db mutation here
    // like creating new order, reducing stock
    await redis.del('_:' + id)
})

app.get('/rate-limit', rateLimiter('home', 20, 60), async (req, res) => res.send('Rate Limiting'))

app.get('/:id', async (req, res) => {
    const id = req.params.id
    const key = '_:' + id
    let _ = await redis.get(key)
    if (_) {
        console.log('Fetched from cache', _)
        return res.json({ _: JSON.parse(_) })
    }
    _ = await _2(id)
    await redis.set(key, JSON.stringify(_))
    res.json({ _ })
})

app.listen(port, () => console.log(`Listening on Port ${port}`))