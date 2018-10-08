import redis
import sys

p = sys.stdin.read()
r = redis.StrictRedis(host='localhost', port=6379, db=0)
#r.set('docker:kafka:host', sys.argv[1])
r.set('docker:kafka:host', p.strip())
print( p.strip())
