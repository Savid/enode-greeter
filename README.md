# enode-greeter

```bash
docker run -d --name enode-greeter \
  -e "REMOTE_GET_ENDPOINT=https://somewhere.example.com/enodes" \
  -e "REMOTE_SEND_ENDPOINT=https://somewhere.example.com/eth_statuses" \
  -e "SHARED_SECRET=abc123" \
  savid/enode-greeter:latest
```
