from kafka import KafkaConsumer, KafkaProducer
import redis

kafkaServer = '172.16.1.2'

print( "Kafka broker " + kafkaServer)
#producer = KafkaProducer(bootstrap_servers=[kafkaServer + ':9092'], api_version=(0, 10))
producer = KafkaProducer(bootstrap_servers=[kafkaServer + ':9092'])

filename = 'multicell-trace_3_nodes.json'

logTopic = "CellAgent"


with open(filename) as fp:
    # do stuff with fp
    line = fp.readline()
    producer.send(logTopic, line.encode('utf-8'))
    cnt = 1
    while line:
        print("Line {}: {}".format(cnt, line.strip()))
        line = fp.readline()
        cnt += 1
        producer.send(logTopic, line.encode('utf-8'))


