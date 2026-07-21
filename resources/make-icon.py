#!/usr/bin/env python3
"""Generatore dell'icona placeholder di LexFlow (nessuna dipendenza esterna).

Produce `resources/icon.png` 1024x1024: monogramma «LF» bianco su quadrato
arrotondato blu navy. Sorgente unica: electron-builder genera .icns/.ico dai
formati derivati al momento del build. Per il logo definitivo basta sostituire
`resources/icon.png` (vedi docs/BUILD-WINDOWS.md §8).

Uso:  python3 resources/make-icon.py
"""
import os
import struct
import zlib

W = 1024          # lato icona in px
SS = 2            # supersampling per l'anti-aliasing dei bordi
R = 180.0         # raggio degli angoli del quadrato arrotondato
NAVY = (30, 58, 95)     # #1e3a5f
WHITE = (255, 255, 255)

# --- Geometria del monogramma «LF», in coordinate 1024 ---
T = 90            # spessore tratto
TOP, BOT = 282.0, 742.0
# «L»
LX = 247.0
L_RECTS = [
    (LX, TOP, LX + T, BOT),          # asta verticale
    (LX, BOT - T, LX + 230.0, BOT),  # piede orizzontale
]
# «F»
FX = LX + 230.0 + 70.0
F_RECTS = [
    (FX, TOP, FX + T, BOT),                 # asta verticale
    (FX, TOP, FX + 230.0, TOP + T),         # braccio superiore
    (FX, 467.0, FX + 190.0, 467.0 + T),     # braccio centrale
]
LETTER_RECTS = L_RECTS + F_RECTS


def inside_rrect(x: float, y: float) -> bool:
    """True se (x,y) è dentro il quadrato arrotondato full-bleed [0,W]."""
    if x < 0 or x > W or y < 0 or y > W:
        return False
    cx = R if x < R else (W - R if x > W - R else x)
    cy = R if y < R else (W - R if y > W - R else y)
    dx, dy = x - cx, y - cy
    return dx * dx + dy * dy <= R * R


def inside_letters(x: float, y: float) -> bool:
    for x0, y0, x1, y1 in LETTER_RECTS:
        if x0 <= x <= x1 and y0 <= y <= y1:
            return True
    return False


def build_png_bytes() -> bytes:
    raw = bytearray()
    inv = 1.0 / (SS * SS)
    step = 1.0 / SS
    for py in range(W):
        raw.append(0)  # filtro "None" per la riga
        row = bytearray()
        for px in range(W):
            r = g = b = a = 0
            for sy in range(SS):
                fy = py + (sy + 0.5) * step
                for sx in range(SS):
                    fx = px + (sx + 0.5) * step
                    if inside_letters(fx, fy):
                        r += WHITE[0]; g += WHITE[1]; b += WHITE[2]; a += 255
                    elif inside_rrect(fx, fy):
                        r += NAVY[0]; g += NAVY[1]; b += NAVY[2]; a += 255
                    # altrimenti trasparente: nessun contributo
            row += bytes((
                int(r * inv), int(g * inv), int(b * inv), int(a * inv),
            ))
        raw += row
    return raw


def chunk(tag: bytes, data: bytes) -> bytes:
    return (struct.pack('>I', len(data)) + tag + data
            + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF))


def main() -> None:
    raw = build_png_bytes()
    ihdr = struct.pack('>IIBBBBB', W, W, 8, 6, 0, 0, 0)  # 8-bit RGBA
    png = (b'\x89PNG\r\n\x1a\n'
           + chunk(b'IHDR', ihdr)
           + chunk(b'IDAT', zlib.compress(bytes(raw), 9))
           + chunk(b'IEND', b''))
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'icon.png')
    with open(out, 'wb') as f:
        f.write(png)
    print(f'Scritto {out} ({W}x{W}, {len(png)} byte)')


if __name__ == '__main__':
    main()
