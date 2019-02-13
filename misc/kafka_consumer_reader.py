import sys
from kafka import KafkaConsumer, KafkaProducer

kafkaServer = sys.argv[1]
consumerTopic = sys.argv[2]

kafkaServer = '172.16.1.2'

#consumerTopic = 'CellAgent'

consumer = KafkaConsumer(
			bootstrap_servers=[kafkaServer + ':9092'],
			api_version=(0, 10, 0),
#			group_id='my_group',
			auto_offset_reset='earliest',
			consumer_timeout_ms=1000
		)

consumer.subscribe([consumerTopic])

while True:
    for message in consumer:
        print(message.value.decode())
