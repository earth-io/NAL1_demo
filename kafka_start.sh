kafka_ip=`ifconfig | grep inet | grep broadcast | head -1 | awk '{print $2}'`

docker stop zookeeper
docker rm zookeeper

docker run -d \
    --net=confluent \
    --name=zookeeper \
    -p "2181:2181" \
    -e ZOOKEEPER_CLIENT_PORT=2181 \
    confluentinc/cp-zookeeper:5.0.0

docker stop kafka
docker rm kafka

docker run -d \
    --net=confluent \
    --name=kafka \
    -p "9092:9092" \
    -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
    -e KAFKA_ADVERTISED_HOST_NAME=$kafka_ip   \
    -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://$kafka_ip:9092 \
    -e KAFKA_LISTENERS=PLAINTEXT://:9092 \
    -e KAFKA_BROKER_ID=1 \
    -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
    confluentinc/cp-kafka:5.0.0

echo IP $kafka_ip 

