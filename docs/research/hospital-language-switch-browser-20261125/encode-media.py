"""Encode the actual browser screenshots at 20 fps. No generation API is used."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent
FRAMES = Path('/tmp/blinkad-language-switch-browser-frames-20261125')
FFMPEG = shutil.which('ffmpeg') or '/opt/homebrew/bin/ffmpeg'
FFPROBE = shutil.which('ffprobe') or '/opt/homebrew/bin/ffprobe'
frames = sorted(FRAMES.glob('frame-*.png'))
assert len(frames) == 80, 'Capture all 80 frames first'
# Deliberately hold a captured still at the beginning/end. This removes tiny
# compositor variations from a static screen without redrawing any UI.
for index in range(1, 10):
    shutil.copy2(frames[0], frames[index])
for index in range(51, 80):
    shutil.copy2(frames[50], frames[index])
pattern = str(FRAMES / 'frame-%03d.png')
subprocess.run([
    FFMPEG, '-hide_banner', '-loglevel', 'error', '-framerate', '20', '-i', pattern,
    '-filter_complex', '[0:v]split[a][b];[a]palettegen=max_colors=256:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
    '-loop', '0', '-y', str(ROOT / 'language-switch.gif'),
], check=True)
subprocess.run([
    FFMPEG, '-hide_banner', '-loglevel', 'error', '-framerate', '20', '-i', pattern,
    '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-an', '-y', str(ROOT / 'language-switch.mp4'),
], check=True)
shutil.copy2(frames[0], ROOT / 'poster.png')
probe = json.loads(subprocess.check_output([
    FFPROBE, '-v', 'error', '-count_frames', '-show_entries',
    'format=duration,size:stream=width,height,nb_frames,nb_read_frames',
    '-of', 'json', str(ROOT / 'language-switch.gif'),
], text=True))
duration = float(probe['format']['duration'])
assert 3 <= duration <= 5
hold_hashes = {hashlib.sha256(p.read_bytes()).hexdigest() for p in frames[50:]}
assert len(hold_hashes) == 1, 'The final English page must be pixel-stable'
metadata = {
    'date_kst': '2026-11-25', 'method': 'Functional HTML UI, scripted real DOM clicks, Ego browser screenshots, FFmpeg encoding',
    'design': 'Fictional dermatology clinic, ivory/taupe, licensed skin-care stock photo',
    'source_size': [960, 540], 'timeline_frames': len(frames), 'fps': 20,
    'planned_still_holds': {'korean': [0, 9], 'english': [50, 79]},
    'actual_gif_duration_seconds': duration, 'actual_gif_frame_count': int(probe['streams'][0]['nb_read_frames']),
    'final_english_hold_source_frames_identical': len(hold_hashes) == 1,
    'higgsfield_generation_requests': 0, 'higgsfield_credits_spent': 0,
    'official_article_modified': False, 'files': {}, 'visual_review': 'pending',
}
for name in ['language-switch.gif', 'language-switch.mp4', 'poster.png', 'sample.html', 'dermatology-photo.jpg', 'photo-source.json']:
    p = ROOT / name
    metadata['files'][name] = {'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
(ROOT / 'metadata.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(metadata, ensure_ascii=False))
