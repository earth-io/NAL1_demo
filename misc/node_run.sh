cd ~/dev/NAL1_demo/ 
echo "  
to test run 
cd ~/dev/NAL1_demo/test
python testKafkaProducer.py 
"

now=`date +%Y%m%d%H%M%S`
echo /tmp/output/node_processKafka_${now}.log 
node server/processKafka.js  `ifconfig | grep inet | grep 172 | awk '{ print $2 }'` > /tmp/output/node_processKafka_${now}.log i2>&1  &
ln -f -s /tmp/output/node_processKafka_${now}.log /tmp/output/node_processKafka.log 

