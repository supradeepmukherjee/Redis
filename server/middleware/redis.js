import { redis } from '../app.js'

export const getCached = key => async (req, res, next) => {
    if (await redis.exists(key)) {
        const _s = await redis.get(key)
        console.log('Fetched from cache', _s)
        return res.json({ _: JSON.parse(_s) })
    }
    next()
}

// getCached()

export const rateLimiter = (key, limit, timer) => async (req, res, next) => {
    // current ip --> request count
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const fullKey = `${clientIP}:${key}:req-count`
    const response = await redis.incr(fullKey)
    if (response === 1) await redis.expire(fullKey, timer)
    const tRemaining = await redis.ttl(fullKey)
    if (response > limit) return res.status(429).send(`Too many Requests, Please Try again after ${tRemaining} seconds`)
    next()
}