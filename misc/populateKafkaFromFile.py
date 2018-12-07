import sys
from kafka import KafkaConsumer, KafkaProducer

filename = sys.argv[1]
kafkaServer = '172.16.1.2'
kafkaServer = sys.argv[2]

logTopic = "CellAgent"

print( "Kafka broker " + kafkaServer)
#producer = KafkaProducer(bootstrap_servers=[kafkaServer + ':9092'], api_version=(0, 10))
producer = KafkaProducer(bootstrap_servers=[kafkaServer + ':9092'])

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

