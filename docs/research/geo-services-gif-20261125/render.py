"""Render an original, deterministic service-description motion graphic.

No AI answer, ranking or client result is represented. All business copy is fictional.
Run with Pillow installed; renders PNG frames, MP4 and a GIF using local FFmpeg.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import hashlib
import json
import math
import subprocess

ROOT = Path(__file__).resolve().parent
FRAMES = ROOT / "frames"
FRAMES.mkdir(exist_ok=True)
FONT = Path("/Library/Fonts/Pretendard-1.3.9/public/static/alternative")
W, H, SCALE, FPS, SECONDS = 1280, 720, 2, 30, 4.8
BG = (236, 234, 230)
INK = (35, 38, 43)
MUTED = (112, 115, 120)
BLUE = (45, 88, 195)


def ease(x):
    x = max(0, min(1, x))
    return x * x * (3 - 2 * x)


def progress(t, start, duration):
    return ease((t - start) / duration) * (1 - ease((t - 4.15) / .65))


def font(size, weight="Regular"):
    return ImageFont.truetype(str(FONT / f"Pretendard-{weight}.ttf"), round(size * SCALE))


def mix(a, b, amount):
    return tuple(round(x + (y - x) * amount) for x, y in zip(a, b))


def frame(t):
    im = Image.new("RGB", (W * SCALE, H * SCALE), BG)
    d = ImageDraw.Draw(im)

    def rect(box, fill, radius=0, outline=None, width=1):
        box = tuple(round(v * SCALE) for v in box)
        if radius:
            d.rounded_rectangle(box, round(radius * SCALE), fill=fill, outline=outline, width=round(width * SCALE))
        else:
            d.rectangle(box, fill=fill, outline=outline, width=round(width * SCALE))

    def line(points, fill, width=1):
        d.line([(round(x * SCALE), round(y * SCALE)) for x, y in points], fill=fill, width=round(width * SCALE), joint="curve")

    def text(x, y, s, size, weight="Regular", fill=INK):
        d.text((round(x * SCALE), round(y * SCALE)), s, font=font(size, weight), fill=fill, stroke_width=0)

    shadow = Image.new("RGBA", im.size)
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((70*SCALE, 74*SCALE, 1210*SCALE, 658*SCALE), 18*SCALE, fill=(38, 39, 45, 28))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18*SCALE))
    im = Image.alpha_composite(im.convert("RGBA"), shadow).convert("RGB")
    d = ImageDraw.Draw(im)
    rect((64, 54, 1216, 648), (255, 255, 255), 16)
    rect((65, 55, 1215, 108), (248, 248, 247), 15)
    rect((65, 84, 1215, 108), (248, 248, 247))
    for x, color in [(91, (219, 220, 221)), (111, (219, 220, 221)), (131, (219, 220, 221))]:
        d.ellipse(((x-4)*SCALE, 77*SCALE, (x+4)*SCALE, 85*SCALE), fill=color)
    text(180, 67, "브랜드 소개", 20, "Medium", MUTED)
    text(1073, 67, "가상 예시", 18, "Medium", MUTED)
    line([(65, 108), (1215, 108)], (233, 234, 235))

    text(124, 143, "COFFEE /", 22, "Bold")
    text(268, 145, "회사 소개", 19, "Medium", MUTED)
    line([(124, 191), (1156, 191)], (235, 236, 237))
    text(124, 224, "소개에 적힌 내용", 23, "Medium", MUTED)
    text(775, 224, "서비스별 소개 여부", 23, "Medium", MUTED)
    text(124, 277, "커피머신을", 60, "Bold")
    text(124, 349, "판매합니다.", 60, "Bold")

    install = progress(t, .8, .55)
    training = progress(t, 1.45, .55)
    copy = progress(t, 2.05, .55)

    # New text fades in at a fixed position, without synthetic typing or reflow.
    c = mix((255, 255, 255), INK, copy)
    offset = (1 - copy) * 8
    text(127, 446 + offset, "설치와 직원 교육도", 44, "Medium", c)
    text(127, 503 + offset, "함께합니다.", 44, "Medium", c)
    line([(127, 564), (127 + 375 * copy, 564)], mix((255, 255, 255), BLUE, copy), 3)

    def item(y, label, active, n):
        back = mix((249, 249, 248), (240, 244, 253), active)
        rect((776, y, 1152, y+82), back, 9)
        text(800, y+6, label, 50, "SemiBold")
        stroke = mix((193, 196, 201), BLUE, active)
        d.ellipse((1083*SCALE, (y+25)*SCALE, 1117*SCALE, (y+59)*SCALE), outline=stroke, width=2*SCALE)
        if active > 0:
            line([(1091, y+42), (1098, y+49), (1109, y+35)], mix(back, BLUE, active), 3)

    line([(710, 224), (710, 574)], (239, 240, 241))
    item(282, "판매", 1, 1)
    item(388, "설치", install, 2)
    item(494, "교육", training, 3)
    text(124, 602, "소개에서 빠진 서비스도 함께 안내하세요.", 19, "Medium", MUTED)
    text(1067, 602, "BlinkAd", 19, "SemiBold", MUTED)
    caption = "가상 커피머신 업체 · 소개 문구 보완 예시"
    width = d.textlength(caption, font=font(20)) / SCALE
    text((W-width)/2, 674, caption, 20, "Regular", MUTED)
    return im.resize((W, H), Image.Resampling.LANCZOS)


if __name__ == "__main__":
    count = round(FPS*SECONDS)
    for i in range(count):
        frame(i/(count-1)*SECONDS).save(FRAMES / f"{i:04d}.png")
    for name, at in [("poster.png", 3.0), ("initial.png", 0.0), ("installation.png", 1.3), ("education.png", 2.0)]:
        frame(at).save(ROOT/name)
    ff = "/opt/homebrew/bin/ffmpeg"
    subprocess.run([ff, "-y", "-v", "error", "-framerate", str(FPS), "-i", str(FRAMES/"%04d.png"), "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", str(ROOT/"geo-services.mp4")], check=True)
    subprocess.run([ff, "-y", "-v", "error", "-i", str(ROOT/"geo-services.mp4"), "-filter_complex", "fps=20,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5", "-loop", "0", str(ROOT/"geo-services.gif")], check=True)
    with Image.open(ROOT/"geo-services.gif") as gif:
        duration = 0
        for i in range(gif.n_frames):
            gif.seek(i)
            duration += gif.info.get("duration", 0)
        gif_info = {"width":gif.width, "height":gif.height, "frames":gif.n_frames, "duration_ms":duration, "loop":gif.info.get("loop")}
    assets = {n:{"bytes":(ROOT/n).stat().st_size, "sha256":hashlib.sha256((ROOT/n).read_bytes()).hexdigest()} for n in ["geo-services.gif", "geo-services.mp4", "poster.png"]}
    metadata = {"created_date_kst":"2026-11-25", "purpose":"GEO article fictional coffee-machine service description example", "source_article":"https://www.blinkad.kr/blog/geo-marketing-brand-description", "method":"Original programmatic motion graphic with fixed Korean typography; local Pillow and FFmpeg", "credits_spent":0, "gif":gif_info, "mp4":{"width":W,"height":H,"fps":FPS,"duration_seconds":SECONDS,"audio":False}, "assets":assets, "disclosure":"Fictional example, not a recorded AI answer or a client outcome.","article_applied":False,"production_deployed":False}
    (ROOT/"metadata.json").write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps(metadata,ensure_ascii=False))
