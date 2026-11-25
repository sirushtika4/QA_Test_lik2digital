"""Create valid PNG fixtures at exact byte counts for upload BVA.

Files are written to a temporary folder outside the repository. Their PNG
image data is a valid 1x1 pixel; PNG text metadata chunks provide the padding.
They are suitable for upload validation and can be opened as PNGs. Do not use
these synthetic images to evaluate OCR quality. Existing files are never
overwritten.
"""
from binascii import crc32
from pathlib import Path
import struct
import tempfile
import zlib

SIZES = (10_485_759, 10_485_760, 10_485_761)
TARGET = Path(tempfile.gettempdir()) / "ink2digital_boundary_fixtures"


def chunk(kind: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", crc32(kind + data) & 0xFFFFFFFF)


def base_png() -> bytes:
    signature = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", 1, 1, 8, 6, 0, 0, 0)
    idat = zlib.compress(b"\x00\xff\xff\xff\xff")
    return signature + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat)


def exact_size_png(target_size: int) -> bytes:
    prefix = base_png()
    suffix = chunk(b"IEND", b"")
    remaining = target_size - len(prefix) - len(suffix)
    text_chunks = []
    index = 0
    while remaining:
        chunk_size = min(60_000, remaining)
        keyword = f"Pad{index:04d}".encode("ascii") + b"\x00"
        data_size = chunk_size - 12
        if data_size < len(keyword):
            raise ValueError("Cannot represent exact target size with PNG metadata chunks")
        data = keyword + (b"x" * (data_size - len(keyword)))
        encoded = chunk(b"tEXt", data)
        if len(encoded) != chunk_size:
            raise AssertionError("PNG chunk size calculation failed")
        text_chunks.append(encoded)
        remaining -= chunk_size
        index += 1
    return prefix + b"".join(text_chunks) + suffix


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    for size in SIZES:
        path = TARGET / f"upload_{size}.png"
        if path.exists():
            raise SystemExit(f"Refusing to overwrite existing fixture: {path}")
        data = exact_size_png(size)
        if len(data) != size:
            raise SystemExit(f"Wrong generated size for {path.name}: {len(data)} != {size}")
        with path.open("xb") as output:
            output.write(data)
        print(f"Created {path}: {path.stat().st_size} bytes")
    print("Fixtures are valid 1x1 PNGs with metadata padding; do not use for OCR accuracy tests.")


if __name__ == "__main__":
    main()
