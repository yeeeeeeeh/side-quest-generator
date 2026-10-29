# Usage: python3 visa/build-world.py <map-app>/MapApp/Resources/GeoJSON visa/world.json
# Builds one small world GeoJSON from map-app's per-country files: Douglas-Peucker simplification, 2-decimal rounding,
# and only rings big enough to see (the largest ring of every country is always kept).
import json, glob, os, sys, math
src, out = sys.argv[1], sys.argv[2]
TOL, MIN_AREA = 0.08, 0.02  # degrees, square degrees

def dp(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dmax, idx = 0, 0
    ax, ay, bx, by = *a, *b; dx, dy = bx - ax, by - ay; L = math.hypot(dx, dy)
    for i in range(1, len(pts) - 1):
        px, py = pts[i]
        d = abs(dy * px - dx * py + bx * ay - by * ax) / L if L else math.hypot(px - ax, py - ay)
        if d > dmax: dmax, idx = d, i
    if dmax > tol:
        return dp(pts[:idx + 1], tol)[:-1] + dp(pts[idx:], tol)
    return [a, b]

def area(r):
    return abs(sum(r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1] for i in range(len(r) - 1))) / 2

def simp_ring(r):
    if r[0] != r[-1]: r = r + [r[0]]
    s = dp(r, TOL)
    s = [[round(x, 2), round(y, 2)] for x, y in s]
    dedup = [s[0]] + [p for i, p in enumerate(s[1:], 1) if p != s[i - 1]]
    return dedup if len(dedup) >= 4 else None

features = []
for f in sorted(glob.glob(os.path.join(src, '*.geo.json'))):
    d = json.load(open(f))
    for feat in d['features']:
        code = feat['properties'].get('cca2'); code = code.upper() if code else code; g = feat['geometry']
        if not code or not g: continue
        polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
        polys = sorted(polys, key=lambda p: -area(p[0]))
        keep = []
        for k, p in enumerate(polys):
            if k > 0 and area(p[0]) < MIN_AREA: continue
            outer = simp_ring(p[0])
            if not outer: continue
            holes = [h for h in (simp_ring(h) for h in p[1:] if area(h) >= MIN_AREA) if h]
            keep.append([outer] + holes)
        if not keep:  # too small to draw: the app shows these as points
            continue
        features.append({"type": "Feature", "properties": {"c": code}, "geometry": {"type": "MultiPolygon", "coordinates": keep}})
json.dump({"type": "FeatureCollection", "features": features}, open(out, 'w'), separators=(',', ':'))
print(len(features), 'countries with shapes,', os.path.getsize(out) // 1024, 'KB')
