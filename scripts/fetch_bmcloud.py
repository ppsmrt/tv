import requests, base64, json, urllib.parse, zlib, gzip, os, sys

API_URL = "https://bmcloud.in/apis/apps/bmcloudapi.php?id=bmcloud"
OUTPUT_FILE = "assets/playlist/test.m3u"

def try_decode_level6(data, max_level=6):
    for _ in range(max_level):
        try:
            return json.loads(data)
        except:
            pass
        try:
            b = base64.b64decode(data, validate=True)
            if b != data.encode('utf-8', errors='ignore'):
                data = b.decode('utf-8', errors='ignore')
                continue
        except:
            pass
        ud = urllib.parse.unquote_plus(data)
        if ud != data:
            data = ud
            continue
        try:
            g = gzip.decompress(data.encode('latin1'))
            data = g.decode('utf-8', errors='ignore')
            continue
        except:
            pass
        try:
            z = zlib.decompress(data.encode('latin1'))
            data = z.decode('utf-8', errors='ignore')
            continue
        except:
            pass
        break
    try:
        return json.loads(data)
    except:
        return data

def json_to_m3u(data):
    lines = ["#EXTM3U"]
    if isinstance(data, dict):
        items = data.get("channels") or data.get("items") or data.get("list") or []
    elif isinstance(data, list):
        items = data
    else:
        lines.append("# Unable to parse JSON; saving raw output")
        lines.append("# RAW-START")
        lines.append(str(data))
        lines.append("# RAW-END")
        return "\n".join(lines)
    for it in items:
        if not isinstance(it, dict):
            continue
        name = it.get("name") or it.get("title") or "Unknown"
        url = it.get("url") or it.get("stream") or it.get("link") or ""
        logo = it.get("logo") or it.get("tvg-logo") or ""
        group = it.get("group") or it.get("group-title") or "BMCloud"
        if not url:
            continue
        logo_attr = logo.replace('"', "'")
        group_attr = group.replace('"', "'")
        attrs = []
        if logo_attr:
            attrs.append(f'tvg-logo="{logo_attr}"')
        if group_attr:
            attrs.append(f'group-title="{group_attr}"')
        attrstr = " ".join(attrs)
        if attrstr:
            lines.append(f'#EXTINF:-1 {attrstr},{name}')
        else:
            lines.append(f'#EXTINF:-1,{name}')
        lines.append(url)
    return "\n".join(lines)

def fetch_and_save():
    try:
        resp = requests.get(API_URL, timeout=20)
        resp.raise_for_status()
        text = resp.text.strip()
        decoded = try_decode_level6(text)
        m3u = json_to_m3u(decoded)
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        prev_data = open(OUTPUT_FILE, 'r', encoding='utf-8').read() if os.path.exists(OUTPUT_FILE) else ''
        if m3u.strip() == prev_data.strip():
            print("✅ No changes in playlist")
            return False
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(m3u)
        print("🎉 Playlist updated")
        return True
    except Exception as e:
        print("❌ Error:", e)
        return False

if __name__ == "__main__":
    changed = fetch_and_save()
    sys.exit(0 if changed else 1)
      
