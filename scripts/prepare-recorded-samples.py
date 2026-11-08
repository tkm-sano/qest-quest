"""Build a small, local, lossless instrument bank from pinned CC0 recordings.

Requires Python 3, NumPy and libsndfile. Downloads only the selected notes,
checks their Git blob hashes, trims unused tails, and writes 16-bit FLAC.
Raw recordings remain in the temporary cache, outside the repository.
"""
import concurrent.futures
import ctypes
import ctypes.util
import hashlib
import json
import os
import re
from pathlib import Path
import tempfile
import urllib.parse
import urllib.request

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SOURCES = json.loads((ROOT / "scripts/recorded-sample-sources.json").read_text())
OUTPUT = ROOT / "assets/instruments"
CACHE = Path(tempfile.gettempdir()) / "quantum-recorded-samples"
HEADERS = {"User-Agent": "Quantum-Image-Mixer-sample-build"}


class SoundInfo(ctypes.Structure):
    _fields_ = [("frames", ctypes.c_int64), ("samplerate", ctypes.c_int),
                ("channels", ctypes.c_int), ("format", ctypes.c_int),
                ("sections", ctypes.c_int), ("seekable", ctypes.c_int)]


lib = ctypes.CDLL(ctypes.util.find_library("sndfile"))
lib.sf_open.argtypes = [ctypes.c_char_p, ctypes.c_int, ctypes.POINTER(SoundInfo)]
lib.sf_open.restype = ctypes.c_void_p
lib.sf_readf_float.argtypes = [ctypes.c_void_p, ctypes.POINTER(ctypes.c_float), ctypes.c_int64]
lib.sf_readf_float.restype = ctypes.c_int64
lib.sf_writef_float.argtypes = lib.sf_readf_float.argtypes
lib.sf_writef_float.restype = ctypes.c_int64
lib.sf_close.argtypes = [ctypes.c_void_p]


def tune_root(audio, rate, note):
    if note is None:
        return None
    letter, sharp, octave = re.fullmatch(r"([A-G])(#?)(\d)", note).groups()
    offset = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}[letter]
    reference = 440 * 2 ** ((offset + bool(sharp) + (int(octave)-4)*12)/12)
    excerpt = audio[round(.1*rate):round(.7*rate)].mean(axis=1).astype(float)
    excerpt -= excerpt.mean()
    spectrum = np.abs(np.fft.rfft(excerpt*np.hanning(len(excerpt)), 2**18))
    frequencies = np.fft.rfftfreq(2**18, 1/rate)
    correlation = np.fft.irfft(np.abs(np.fft.rfft(excerpt, 2**18))**2)
    correlation /= max(correlation[0], 1e-20)
    candidates = []
    for shift in [-1, 0, 1]:
        expected = reference * 2**shift
        indices = np.flatnonzero((frequencies > expected*.97) & (frequencies < expected*1.03))
        index = indices[np.argmax(spectrum[indices])]
        strength = spectrum[index] / max(spectrum.max(), 1e-20)
        lag = rate/expected
        confidence = float(correlation[max(1, round(lag*.97)):round(lag*1.03)+2].max())
        if strength > .015:
            candidates.append((expected, index, confidence))
    if not candidates:
        return reference
    confidence = max(item[2] for item in candidates)
    eligible = [item for item in candidates if item[2] >= max(.4, confidence*.9)]
    if not eligible:
        return reference
    _, index, _ = max(eligible)
    logs = np.log(np.maximum(spectrum[index-1:index+2], 1e-20))
    correction = .5*(logs[0]-logs[2])/(logs[0]-2*logs[1]+logs[2])
    return float((index+correction)*rate/(2**18))


def retrieve(sample):
    repo = sample["repository"]
    revision = SOURCES["libraries"][repo]["revision"]
    url = f"https://raw.githubusercontent.com/sgossner/{repo}/{revision}/" + urllib.parse.quote(sample["path"], safe="/")
    cache = CACHE / (repo + "-" + sample["path"].rsplit("/", 1)[-1])
    if not cache.exists():
        data = urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=120).read()
        cache.write_bytes(data)
    data = cache.read_bytes()
    blob = hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()
    if blob != sample["blobSHA"]:
        raise RuntimeError("Source hash mismatch: " + sample["id"])
    info = SoundInfo()
    handle = lib.sf_open(os.fsencode(cache), 0x10, ctypes.byref(info))
    if not handle:
        raise RuntimeError("Cannot open recording: " + str(cache))
    audio = np.empty((info.frames, info.channels), np.float32)
    try:
        count = lib.sf_readf_float(handle, audio.ctypes.data_as(ctypes.POINTER(ctypes.c_float)), info.frames)
        if count != info.frames:
            raise RuntimeError("Incomplete recording: " + sample["id"])
    finally:
        lib.sf_close(handle)
    audio -= audio.mean(axis=0)
    cutoff = {"shaker": 1200, "clap": 120, "woodblock": 200, "tek": 180,
              "doum": 35, "kick": 25}.get(sample["family"], 0)
    if cutoff:
        # Remove handling/room rumble before level matching, so it does not
        # make the useful shaker or snare transient disproportionately quiet.
        blend = 1-np.exp(-2*np.pi*cutoff/info.samplerate)
        state = np.zeros(info.channels)
        for frame in audio:
            state += blend*(frame-state)
            frame -= state
    peak = float(np.abs(audio).max())
    active = np.flatnonzero(np.abs(audio).max(axis=1) > peak * .0125)
    start = max(0, int(active[0]) - round(.005 * info.samplerate))
    audio = audio[start:start + round(sample["seconds"] * info.samplerate)].copy()
    audio *= .75 / max(float(np.abs(audio).max()), 1e-8)
    attack = min(round(.002 * info.samplerate), len(audio))
    release = min(round(.08 * info.samplerate), len(audio))
    audio[:attack] *= np.linspace(0, 1, attack)[:, None]
    audio[-release:] *= ((1 + np.cos(np.linspace(0, np.pi, release))) / 2)[:, None]
    root_frequency = tune_root(audio, info.samplerate, sample["rootNote"])
    target = OUTPUT / (sample["id"] + ".flac")
    destination = SoundInfo(len(audio), info.samplerate, info.channels, 0x170000 | 0x0002, 0, 0)
    handle = lib.sf_open(os.fsencode(target), 0x20, ctypes.byref(destination))
    if not handle:
        raise RuntimeError("Cannot encode instrument: " + str(target))
    try:
        if lib.sf_writef_float(handle, audio.ctypes.data_as(ctypes.POINTER(ctypes.c_float)), len(audio)) != len(audio):
            raise RuntimeError("Incomplete instrument: " + sample["id"])
    finally:
        lib.sf_close(handle)
    # Diagnostic only: upper harmonics can be stronger than the fundamental.
    excerpt = audio[round(.1 * info.samplerate):round(.7 * info.samplerate)].mean(axis=1)
    frequencies = np.fft.rfftfreq(2**18, 1 / info.samplerate)
    spectrum = np.abs(np.fft.rfft(excerpt * np.hanning(len(excerpt)), 2**18))
    strongest = float(frequencies[np.argmax(spectrum)])
    print(sample["id"], "root", round(root_frequency, 2) if root_frequency else "unpitched", "spectral peak", round(strongest, 1), flush=True)
    return {**sample, "file": target.name, "sampleRate": info.samplerate,
            "channels": info.channels, "duration": len(audio) / info.samplerate,
            "rootFrequency": root_frequency,
            "highpassHz": cutoff,
            "trimStart": start / info.samplerate,
            "sha256": hashlib.sha256(target.read_bytes()).hexdigest()}


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(4) as pool:
        samples = list(pool.map(retrieve, SOURCES["samples"]))
    (OUTPUT / "manifest.json").write_text(json.dumps({**SOURCES, "samples": samples}, ensure_ascii=False, indent=2) + "\n")
    library = SOURCES["libraries"]["VSCO-2-CE"]
    url = library["repository"].replace("github.com/", "raw.githubusercontent.com/") + "/" + library["revision"] + "/LICENSE"
    license_text = urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=60).read()
    (OUTPUT / "LICENSE-CC0.txt").write_bytes(license_text)
    print("Prepared", len(samples), "recorded instruments")


if __name__ == "__main__":
    main()
