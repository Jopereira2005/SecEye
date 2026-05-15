import express from 'express'
import mqtt from 'mqtt'
import dotenv from 'dotenv'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 8888

app.use(express.json())

const mqttClient = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}:${process.env.MQTT_PORT}`, {
  clientId: 'seceye-bridge',
  reconnectPeriod: 3000,
})

mqttClient.on('connect', () => {
  console.log('MQTT conectado ao broker.hivemq.com')
})

mqttClient.on('error', (err) => {
  console.error('MQTT erro:', err.message)
})

app.post('/mqtt/trigger', (req, res) => {
  const state = req.query.state as string

  if (state !== '0' && state !== '1') {
    res.status(400).json({ ok: false, error: 'state deve ser 0 ou 1' })
    return
  }

  mqttClient.publish(
    process.env.MQTT_TOPIC!,
    state,
    { qos: 1 },
    (err: { message: any }) => {
      if (err) {
        console.error('Publish falhou:', err)
        res.status(500).json({ ok: false, error: err.message })
        return
      }
      console.log(`📡 Publicado "${state}" em ${process.env.MQTT_TOPIC}`)
      res.json({ ok: true, published: state })
    }
  )
})

app.listen(PORT, () => {
  console.log(`Bridge rodando na porta ${PORT}`)
})