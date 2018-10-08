ifconfig | grep inet | grep broadcast | head -1 | awk '{print $2}' | python ~/setKafkaHost.py
