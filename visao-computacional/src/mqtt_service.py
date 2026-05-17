"""Cliente MQTT para publicar eventos no broker HiveMQ."""
import paho.mqtt.client as mqtt

from . import config

CLIENT_ID = "seceye-python-cv"


class MQTTService:
    def __init__(self):
        self.broker = config.MQTT_BROKER
        self.port = config.MQTT_PORT
        self.topic = config.MQTT_TOPIC
        self.client_id = CLIENT_ID
        self.connected = False
        self.client = mqtt.Client(client_id=self.client_id, clean_session=True)
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.reconnect_delay_set(min_delay=1, max_delay=30)

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self.connected = True
            print(f">> [MQTT] Conectado ao broker {self.broker}:{self.port}", flush=True)
        else:
            self.connected = False
            print(f">> [MQTT] Falha na conexao (rc={rc})", flush=True)

    def _on_disconnect(self, client, userdata, rc):
        self.connected = False
        print(f">> [MQTT] Desconectado (rc={rc})", flush=True)

    def connect(self):
        try:
            self.client.connect(self.broker, self.port, keepalive=60)
            self.client.loop_start()
        except Exception as e:
            print(f">> [MQTT] Erro ao conectar: {e}", flush=True)

    def publish_trigger(self, state: str):
        try:
            if not self.connected:
                print(">> [MQTT] Nao conectado - tentando reconectar antes de publicar", flush=True)
                try:
                    self.client.reconnect()
                except Exception as e:
                    print(f">> [MQTT] Falha ao reconectar: {e}", flush=True)
                    return

            result = self.client.publish(self.topic, payload=state, qos=1)
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                print(f">> [MQTT] Publicado '{state}' em {self.topic}", flush=True)
            else:
                print(f">> [MQTT] Falha ao publicar (rc={result.rc})", flush=True)
        except Exception as e:
            print(f">> [MQTT] Erro ao publicar: {e}", flush=True)

    def disconnect(self):
        try:
            self.client.loop_stop()
            self.client.disconnect()
        except Exception as e:
            print(f">> [MQTT] Erro ao desconectar: {e}", flush=True)
