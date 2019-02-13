killProsesses=$( ps -ef | grep node | grep -v grep | awk '{print $2}' | tr '\n' ' ' )
kill $killProsesses

bash /Users/earth16/dev/NAL1_demo/misc/node_run.sh

#bash ~/dev/NAL1_demo/node_processKafka.sh 
