import json
import urllib.request
import urllib.error

url = 'http://127.0.0.1:5000/insights/company'
body = json.dumps({'company': 'Aether Industries Limited'}).encode('utf-8')
req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=120) as res:
        print('STATUS', res.status)
        print('HEADERS', res.headers)
        print(res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('HTTP ERROR', e.code)
    print('HEADERS', e.headers)
    print(e.read().decode('utf-8'))
except Exception as e:
    import traceback
    traceback.print_exc()
