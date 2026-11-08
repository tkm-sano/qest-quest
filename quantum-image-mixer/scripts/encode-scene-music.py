"""Encode interleaved float32 PCM as gapless Ogg Vorbis using libsndfile.

Called by render-scene-music.mjs. Requires Python 3 and the system libsndfile;
there are no Python package dependencies and no role in browser playback.
"""
import array
import ctypes
import ctypes.util
import sys


class SoundInfo(ctypes.Structure):
    _fields_ = [("frames", ctypes.c_int64), ("samplerate", ctypes.c_int),
                ("channels", ctypes.c_int), ("format", ctypes.c_int),
                ("sections", ctypes.c_int), ("seekable", ctypes.c_int)]


def encode(source, destination, sample_rate):
    library = ctypes.util.find_library("sndfile")
    if not library:
        raise RuntimeError("Install libsndfile to encode the music assets")
    lib = ctypes.CDLL(library)
    lib.sf_open.argtypes = [ctypes.c_char_p, ctypes.c_int, ctypes.POINTER(SoundInfo)]
    lib.sf_open.restype = ctypes.c_void_p
    lib.sf_writef_float.argtypes = [ctypes.c_void_p, ctypes.POINTER(ctypes.c_float), ctypes.c_int64]
    lib.sf_writef_float.restype = ctypes.c_int64
    lib.sf_command.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.c_void_p, ctypes.c_int]
    lib.sf_close.argtypes = [ctypes.c_void_p]
    lib.sf_strerror.argtypes = [ctypes.c_void_p]
    lib.sf_strerror.restype = ctypes.c_char_p
    samples = array.array("f")
    with open(source, "rb") as stream:
        samples.frombytes(stream.read())
    frames = len(samples) // 2
    info = SoundInfo(frames, int(sample_rate), 2, 0x200000 | 0x0060, 0, 0)
    handle = lib.sf_open(destination.encode(), 0x20, ctypes.byref(info))
    if not handle:
        raise RuntimeError(lib.sf_strerror(None).decode())
    try:
        quality = ctypes.c_double(.9)
        lib.sf_command(handle, 0x1300, ctypes.byref(quality), ctypes.sizeof(quality))
        pointer = (ctypes.c_float * len(samples)).from_buffer(samples)
        if lib.sf_writef_float(handle, pointer, frames) != frames:
            raise RuntimeError(lib.sf_strerror(handle).decode())
    finally:
        lib.sf_close(handle)


if __name__ == "__main__":
    encode(*sys.argv[1:])
