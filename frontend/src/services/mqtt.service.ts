import mqtt, { MqttClient } from 'mqtt';

const MQTT_BROKER = process.env.EXPO_PUBLIC_MQTT_BROKER;
const MQTT_TOPIC = process.env.EXPO_PUBLIC_MQTT_TOPIC;
const MQTT_USER = process.env.EXPO_PUBLIC_MQTT_USER;
const MQTT_PASS = process.env.EXPO_PUBLIC_MQTT_PASS;

let client: MqttClient | null = null;

function getClient(): MqttClient | null {
  if (client) return client;

  if (!MQTT_BROKER) {
    console.error('[MQTT] EXPO_PUBLIC_MQTT_BROKER nao definido');
    return null;
  }

  try {
    const clientId = 'seceye-app-' + Math.random().toString(16).slice(2, 10);
    const brokerUrl = MQTT_BROKER.trim();

    client = mqtt.connect(brokerUrl, {
      clientId,
      username: MQTT_USER,
      password: MQTT_PASS,
      reconnectPeriod: 3000,
      connectTimeout: 10000,
      clean: true,
    });

    client.on('connect', () => {
      console.log('[MQTT] Conectado ao broker', MQTT_BROKER);
    });

    client.on('reconnect', () => {
      console.log('[MQTT] Reconectando...');
    });

    client.on('error', (err) => {
      console.warn('[MQTT] Erro de conexao:', err?.message ?? err);
    });

    client.on('close', () => {
      console.log('[MQTT] Conexao encerrada');
    });

    client.on('offline', () => {
      console.log('[MQTT] Cliente offline');
    });

    return client;
  } catch (error) {
    console.error('[MQTT] Falha ao inicializar cliente:', error);
    client = null;
    return null;
  }
}

export function connectMqtt(): void {
  try {
    getClient();
  } catch (error) {
    console.error('[MQTT] connectMqtt exception:', error);
  }
}

export function deactivateAlarm(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const c = getClient();

      if (!c) {
        const err = new Error('[MQTT] Cliente nao inicializado');
        console.error(err.message);
        reject(err);
        return;
      }

      if (!MQTT_TOPIC) {
        const err = new Error('[MQTT] EXPO_PUBLIC_MQTT_TOPIC nao definido');
        console.error(err.message);
        reject(err);
        return;
      }

      const doPublish = () => {
        c.publish(MQTT_TOPIC, '0', { qos: 1 }, (err) => {
          if (err) {
            console.error('[MQTT] Falha ao publicar "0":', err.message);
            reject(err);
          } else {
            console.log('[MQTT] Publicado "0" em', MQTT_TOPIC);
            resolve();
          }
        });
      };

      if (c.connected) {
        doPublish();
      } else {
        const timeout = setTimeout(() => {
          c.off('connect', onConnect);
          reject(new Error('[MQTT] Timeout aguardando conexao'));
        }, 10000);

        const onConnect = () => {
          clearTimeout(timeout);
          c.off('connect', onConnect);
          doPublish();
        };

        c.on('connect', onConnect);
      }
    } catch (error) {
      console.error('[MQTT] deactivateAlarm exception:', error);
      reject(error as Error);
    }
  });
}

export function activateAlarm(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const c = getClient();

      if (!c) {
        const err = new Error('[MQTT] Cliente nao inicializado');
        console.error(err.message);
        reject(err);
        return;
      }

      if (!MQTT_TOPIC) {
        const err = new Error('[MQTT] EXPO_PUBLIC_MQTT_TOPIC nao definido');
        console.error(err.message);
        reject(err);
        return;
      }

      const doPublish = () => {
        c.publish(MQTT_TOPIC, '1', { qos: 1 }, (err) => {
          if (err) {
            console.error('[MQTT] Falha ao publicar "1":', err.message);
            reject(err);
          } else {
            console.log('[MQTT] Publicado "1" em', MQTT_TOPIC);
            resolve();
          }
        });
      };

      if (c.connected) {
        doPublish();
      } else {
        const timeout = setTimeout(() => {
          c.off('connect', onConnect);
          reject(new Error('[MQTT] Timeout aguardando conexao'));
        }, 10000);

        const onConnect = () => {
          clearTimeout(timeout);
          c.off('connect', onConnect);
          doPublish();
        };

        c.on('connect', onConnect);
      }
    } catch (error) {
      console.error('[MQTT] activateAlarm exception:', error);
      reject(error as Error);
    }
  });
}

export function disconnectMqtt(): void {
  try {
    if (client) {
      client.end(true, {}, () => {
        console.log('[MQTT] Cliente desconectado');
      });
      client = null;
    }
  } catch (error) {
    console.error('[MQTT] disconnectMqtt exception:', error);
    client = null;
  }
}