import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.get('/prices', async (req, res) => {
  const prices = await prisma.historicalPrice.findMany({ orderBy: { timestamp: 'desc' } })
  res.json(prices)
})

app.post('/prices', async (req, res) => {
  const { symbol, price } = req.body
  const created = await prisma.historicalPrice.create({ data: { symbol, price: Number(price) } })
  res.status(201).json(created)
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`historical-api listening on ${PORT}`))
