"""words/*.txt  ->  vocab.json (bot va web app uchun bitta manba).
Ishlatish:  python build_vocab.py vocab.json words
Mavjud so'zga misol/mavzu/ishora qo'shadi, yangisini qo'shadi, takrorlamaydi."""
import json, re, sys, glob, os

vocab_path, words_dir = sys.argv[1], sys.argv[2]
V = json.load(open(vocab_path, encoding='utf-8'))
added = enriched = 0
for f in sorted(glob.glob(os.path.join(words_dir, '*.txt'))):
    lv = th = None
    for line in open(f, encoding='utf-8'):
        line = line.strip()
        m = re.match(r'##\s*(\w+)\s*\|\s*(.+)', line)
        if m:
            lv, th = m.group(1), m.group(2).strip(); V.setdefault(lv, []); continue
        if not line or line.startswith('#'):
            continue
        parts = [p.strip() for p in line.split(' | ')]
        if ' = ' not in parts[0] or lv is None:
            print('Format xatosi:', line); continue
        de, uz = [p.strip() for p in parts[0].split(' = ', 1)]
        ex = parts[1] if len(parts) > 1 else ''
        hint = parts[2] if len(parts) > 2 else ''
        cur = next((w for w in V[lv] if w[0] == de), None)
        if cur is None:
            V[lv].append([de, uz, ex, th, hint]); added += 1
        else:
            while len(cur) < 5: cur.append('')
            if ex and not cur[2]: cur[2] = ex
            if not cur[3]: cur[3] = th
            if hint and not cur[4]: cur[4] = hint
            enriched += 1
json.dump(V, open(vocab_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f"Yangi: {added}, boyitilgan: {enriched}")
print({k: len(v) for k, v in V.items()}, 'JAMI:', sum(len(v) for v in V.values()))
