nodeId=$(ps -ef | grep processKafka.js | grep -v grep | awk '{print $2 }')
kill $nodeId
cd /Users/earth16/dev/NAL1_demo
node server/processKafka.js &

