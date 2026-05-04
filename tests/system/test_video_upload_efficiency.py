"""System coverage for first-class video tracking.

The test is opt-in because it can download or generate many video samples. Set
``AIM_RUN_VIDEO_SYSTEM_TESTS=1`` to run it. If ``AIM_VIDEO_SYSTEM_DATASET_URL``
points to a zip/tar archive or to a JSON manifest with ``videos`` entries, that
dataset is used. Otherwise ffmpeg is used to synthesize moving MP4 variants.
"""

import gc
import hashlib
import json
import os
import shutil
import subprocess
import tarfile
import time
import urllib.parse
import urllib.request
import zipfile

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List

import pytest


RUN_SYSTEM_TESTS_ENV = 'AIM_RUN_VIDEO_SYSTEM_TESTS'
DATASET_URL_ENV = 'AIM_VIDEO_SYSTEM_DATASET_URL'
CACHE_DIR_ENV = 'AIM_VIDEO_SYSTEM_CACHE_DIR'
VIDEO_COUNT_ENV = 'AIM_VIDEO_SYSTEM_VIDEO_COUNT'
MAX_RSS_BYTES_ENV = 'AIM_VIDEO_UPLOAD_MAX_RSS_BYTES'
MAX_STORAGE_MULTIPLIER_ENV = 'AIM_VIDEO_UPLOAD_MAX_STORAGE_MULTIPLIER'
MIN_UPLOAD_MIB_PER_SEC_ENV = 'AIM_VIDEO_UPLOAD_MIN_MIB_PER_SEC'
MAX_VIDEO_TRACK_P95_SECONDS_ENV = 'AIM_VIDEO_UPLOAD_MAX_TRACK_P95_SECONDS'

DEFAULT_VIDEO_COUNT = 100
MIB = 1024 * 1024


@dataclass(frozen=True)
class VideoSample:
    path: Path
    width: int
    height: int
    fps: float
    fmt: str
    caption: str

    @property
    def size_bytes(self) -> int:
        return self.path.stat().st_size

    @property
    def digest(self) -> str:
        return _sha256_file(self.path)


@pytest.mark.system
def test_video_upload_many_files_is_efficient(tmp_path):
    if os.environ.get(RUN_SYSTEM_TESTS_ENV) != '1':
        pytest.skip(f'set {RUN_SYSTEM_TESTS_ENV}=1 to run the video upload system test')

    aim_module = pytest.importorskip('aim')
    video_cls = getattr(aim_module, 'Video', None)
    if video_cls is None:
        pytest.skip('aim.Video is not implemented yet')

    from aim.sdk.configs import AIM_ENABLE_TRACKING_THREAD
    from aim.sdk.index_manager import RepoIndexManager
    from aim.sdk.repo import _get_tracking_queue
    from aim.storage.treeutils import decode_tree
    from aim.web.run import app
    from fastapi.testclient import TestClient
    from tests.utils import decode_encoded_tree_stream

    _assert_video_api_contract_is_registered()

    video_count = _int_env(VIDEO_COUNT_ENV, DEFAULT_VIDEO_COUNT)
    assert video_count > 0
    samples = _prepare_video_samples(tmp_path, video_count)
    _assert_dataset_shape(samples, video_count)

    previous_env_value = os.environ.get(AIM_ENABLE_TRACKING_THREAD)
    previous_tracking_queue = aim_module.Repo.tracking_queue
    os.environ[AIM_ENABLE_TRACKING_THREAD] = 'ON'
    if aim_module.Repo.tracking_queue is None:
        aim_module.Repo.tracking_queue = _get_tracking_queue()

    run = None
    try:
        repo = aim_module.Repo.default_repo()
        run = aim_module.Run(repo=repo, system_tracking_interval=None)
        assert run._tracker._non_blocking, 'video efficiency test must exercise async tracking'
        run['testcase'] = __name__
        video_system_test_id = f'{int(time.time() * 1000)}-{os.getpid()}'
        run['video_system_test_id'] = video_system_test_id
        run_hash = run.hash

        source_total_bytes = sum(sample.size_bytes for sample in samples)
        largest_video_bytes = max(sample.size_bytes for sample in samples)
        repo_size_before = _directory_size(Path(repo.path))
        rss_before = _rss_bytes()
        peak_rss = rss_before
        started_at = time.perf_counter()

        blob_expectations: Dict[int, VideoSample] = {}
        track_latencies = []
        for step, sample in enumerate(samples):
            video = video_cls(path=str(sample.path), fps=sample.fps, format=sample.fmt, caption=sample.caption)
            track_started_at = time.perf_counter()
            run.track(video, name='stress_videos', step=step, context={'suite': 'video_system'})
            track_latencies.append(time.perf_counter() - track_started_at)
            blob_expectations[step] = sample
            del video
            if step % 10 == 0:
                gc.collect()
                peak_rss = max(peak_rss, _rss_bytes())

        logging_loop_elapsed = time.perf_counter() - started_at
        if aim_module.Repo.tracking_queue is not None:
            aim_module.Repo.tracking_queue._queue.join()
        elapsed = time.perf_counter() - started_at
        run.close()
        RepoIndexManager.get_index_manager(repo).index(run_hash)
        repo.container_pool.clear()
    finally:
        if previous_env_value is None:
            os.environ.pop(AIM_ENABLE_TRACKING_THREAD, None)
        else:
            os.environ[AIM_ENABLE_TRACKING_THREAD] = previous_env_value
        if previous_tracking_queue is not aim_module.Repo.tracking_queue:
            aim_module.Repo.tracking_queue = previous_tracking_queue

    repo_size_after = _directory_size(Path(repo.path))
    gc.collect()
    peak_rss = max(peak_rss, _rss_bytes())

    max_video_track_p95 = _float_env(MAX_VIDEO_TRACK_P95_SECONDS_ENV, 0.25)
    video_track_p95 = _percentile(track_latencies, 0.95)
    assert video_track_p95 <= max_video_track_p95, (
        f'path-backed async video track() p95 was {video_track_p95 * 1000:.1f}ms; '
        f'limit is {max_video_track_p95 * 1000:.1f}ms'
    )

    max_rss_delta = _int_env(MAX_RSS_BYTES_ENV, max(512 * MIB, largest_video_bytes * 4))
    rss_delta = max(0, peak_rss - rss_before)
    assert rss_delta <= max_rss_delta, (
        f'uploading {len(samples)} videos grew RSS by {rss_delta / MIB:.1f} MiB; '
        f'limit is {max_rss_delta / MIB:.1f} MiB'
    )

    storage_multiplier = _float_env(MAX_STORAGE_MULTIPLIER_ENV, 2.0)
    max_storage_delta = int(source_total_bytes * storage_multiplier) + 128 * MIB
    storage_delta = max(0, repo_size_after - repo_size_before)
    assert storage_delta <= max_storage_delta, (
        f'video upload used {storage_delta / MIB:.1f} MiB for {source_total_bytes / MIB:.1f} MiB of source videos; '
        f'limit is {max_storage_delta / MIB:.1f} MiB'
    )

    min_upload_mib_per_sec = _float_env(MIN_UPLOAD_MIB_PER_SEC_ENV, 0.5)
    upload_mib_per_sec = source_total_bytes / MIB / max(elapsed, 0.001)
    assert upload_mib_per_sec >= min_upload_mib_per_sec, (
        f'video upload throughput was {upload_mib_per_sec:.2f} MiB/s; '
        f'limit is {min_upload_mib_per_sec:.2f} MiB/s'
    )
    logging_loop_mib_per_sec = source_total_bytes / MIB / max(logging_loop_elapsed, 0.001)
    assert logging_loop_mib_per_sec >= upload_mib_per_sec, 'async logging loop should not wait for full blob writes'

    try:
        with TestClient(app) as client:
            response = client.get(
                '/api/runs/search/videos/',
                params={
                    'q': f'run.video_system_test_id == "{video_system_test_id}"',
                    'record_density': video_count,
                    'index_density': 1,
                    'report_progress': False,
                },
            )
            assert response.status_code == 200, response.text

            decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_bytes(chunk_size=512 * 1024)))
            assert set(decoded_response.keys()) == {run_hash}
            trace_data = decoded_response[run_hash]['traces'][0]
            assert trace_data['name'] == 'stress_videos'
            assert len(trace_data['values']) == video_count

            blob_uri_by_step = {}
            for step, records in zip(trace_data['iters'], trace_data['values']):
                assert len(records) == 1
                record = records[0]
                assert 'blob_uri' in record
                assert 'data' not in record
                assert record.get('caption') == blob_expectations[step].caption
                blob_uri_by_step[step] = record['blob_uri']

            requested_steps = sorted({0, video_count // 2, video_count - 1})
            response = client.post('/api/runs/videos/get-batch', json=[blob_uri_by_step[step] for step in requested_steps])
            assert response.status_code == 200, response.text

            decoded_blobs = decode_tree(
                decode_encoded_tree_stream(response.iter_bytes(chunk_size=512 * 1024), concat_chunks=True)
            )
            assert len(decoded_blobs) == len(requested_steps)
            for step in requested_steps:
                sample = blob_expectations[step]
                blob = decoded_blobs[blob_uri_by_step[step]]
                assert len(blob) == sample.size_bytes
                assert hashlib.sha256(bytes(blob)).hexdigest() == sample.digest
    finally:
        repo.container_pool.clear()


def _assert_video_api_contract_is_registered() -> None:
    from aim.sdk.sequence import Sequence
    from aim.sdk.sequences.sequence_type_map import SEQUENCE_TYPE_MAP

    assert SEQUENCE_TYPE_MAP.get('aim.video') == 'videos'
    assert SEQUENCE_TYPE_MAP.get('list(aim.video)') == 'videos'
    assert 'videos' in Sequence.registry


def _prepare_video_samples(tmp_path: Path, video_count: int) -> List[VideoSample]:
    dataset_url = os.environ.get(DATASET_URL_ENV)
    if dataset_url:
        dataset_dir = _download_and_unpack_dataset(dataset_url, tmp_path)
        samples = _samples_from_dataset_dir(dataset_dir)
    else:
        samples = _generate_synthetic_video_dataset(tmp_path / 'synthetic-videos', video_count)

    return samples[:video_count]


def _download_and_unpack_dataset(dataset_url: str, tmp_path: Path) -> Path:
    cache_root = Path(os.environ.get(CACHE_DIR_ENV, tmp_path / 'video-system-cache')).expanduser()
    cache_root.mkdir(parents=True, exist_ok=True)
    parsed_url = urllib.parse.urlparse(dataset_url)
    archive_name = Path(parsed_url.path).name or 'video-dataset'
    archive_path = cache_root / archive_name
    dataset_dir = cache_root / archive_path.stem

    if not archive_path.exists():
        _download_file(dataset_url, archive_path)

    if archive_path.suffix == '.json':
        dataset_dir.mkdir(parents=True, exist_ok=True)
        _download_manifest_videos(archive_path, dataset_dir)
        return dataset_dir

    if dataset_dir.exists() and any(dataset_dir.iterdir()):
        return dataset_dir

    dataset_dir.mkdir(parents=True, exist_ok=True)
    if zipfile.is_zipfile(archive_path):
        with zipfile.ZipFile(archive_path) as archive:
            _safe_extract_zip(archive, dataset_dir)
    elif tarfile.is_tarfile(archive_path):
        with tarfile.open(archive_path) as archive:
            _safe_extract_tar(archive, dataset_dir)
    else:
        single_file = dataset_dir / archive_path.name
        if not single_file.exists():
            shutil.copy2(archive_path, single_file)
    return dataset_dir


def _download_manifest_videos(manifest_path: Path, dataset_dir: Path) -> None:
    manifest = json.loads(manifest_path.read_text())
    for entry in manifest.get('videos', []):
        video_url = entry['url']
        relative_path = Path(entry.get('path') or Path(urllib.parse.urlparse(video_url).path).name)
        destination = dataset_dir / relative_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        if not destination.exists():
            _download_file(video_url, destination)
    shutil.copy2(manifest_path, dataset_dir / 'manifest.json')


def _download_file(url: str, destination: Path) -> None:
    temporary_path = destination.with_suffix(destination.suffix + '.download')
    with urllib.request.urlopen(url, timeout=60) as response, temporary_path.open('wb') as file:
        shutil.copyfileobj(response, file, length=8 * MIB)
    temporary_path.replace(destination)


def _safe_extract_zip(archive: zipfile.ZipFile, destination: Path) -> None:
    destination_root = destination.resolve()
    for member in archive.infolist():
        member_path = (destination / member.filename).resolve()
        if destination_root not in (member_path, *member_path.parents):
            raise ValueError(f'Unsafe path in zip dataset archive: {member.filename}')
    archive.extractall(destination)


def _safe_extract_tar(archive: tarfile.TarFile, destination: Path) -> None:
    destination_root = destination.resolve()
    for member in archive.getmembers():
        member_path = (destination / member.name).resolve()
        if destination_root not in (member_path, *member_path.parents):
            raise ValueError(f'Unsafe path in tar dataset archive: {member.name}')
    archive.extractall(destination)


def _samples_from_dataset_dir(dataset_dir: Path) -> List[VideoSample]:
    metadata_by_name = _load_manifest_metadata(dataset_dir)
    video_paths = sorted(
        path
        for path in dataset_dir.rglob('*')
        if path.suffix.lower() in {'.mp4', '.m4v', '.mov', '.webm', '.gif'}
    )
    samples = []
    for idx, path in enumerate(video_paths):
        metadata = metadata_by_name.get(path.name) or metadata_by_name.get(path.relative_to(dataset_dir).as_posix())
        if metadata:
            width = int(metadata['width'])
            height = int(metadata['height'])
            fps = float(metadata['fps'])
        else:
            width, height, fps = _probe_video(path)
        samples.append(
            VideoSample(
                path=path,
                width=width,
                height=height,
                fps=fps,
                fmt=path.suffix.lower().lstrip('.'),
                caption=f'video-system-{idx}-{width}x{height}-{fps:g}fps',
            )
        )
    return samples


def _load_manifest_metadata(dataset_dir: Path) -> Dict[str, dict]:
    manifest_path = dataset_dir / 'manifest.json'
    if not manifest_path.exists():
        return {}
    manifest = json.loads(manifest_path.read_text())
    metadata = {}
    for entry in manifest.get('videos', []):
        key = entry.get('path') or Path(urllib.parse.urlparse(entry.get('url', '')).path).name
        if key and {'width', 'height', 'fps'} <= set(entry.keys()):
            metadata[key] = entry
            metadata[Path(key).name] = entry
    return metadata


def _generate_synthetic_video_dataset(dataset_dir: Path, video_count: int) -> List[VideoSample]:
    ffmpeg = shutil.which('ffmpeg')
    if not ffmpeg:
        pytest.skip(f'{DATASET_URL_ENV} is not set and ffmpeg is not available to generate a video dataset')

    dataset_dir.mkdir(parents=True, exist_ok=True)
    source_path = dataset_dir / 'synthetic_source_1920x1080_60fps.mp4'
    if not source_path.exists():
        _run_ffmpeg_source(ffmpeg, source_path)
    variants = [
        (320, 200, 12),
        (426, 240, 15),
        (640, 360, 24),
        (1280, 720, 30),
        (1920, 1080, 60),
    ]
    samples = []
    for idx in range(video_count):
        variant_idx = idx % len(variants)
        width, height, fps = variants[variant_idx]
        output_path = dataset_dir / f'synthetic_variant_{variant_idx}_{width}x{height}_{fps}fps.mp4'
        if not output_path.exists():
            _run_ffmpeg_variant(ffmpeg, source_path, output_path, width, height, fps)
        samples.append(
            VideoSample(
                path=output_path,
                width=width,
                height=height,
                fps=float(fps),
                fmt='mp4',
                caption=f'video-system-{idx}-{width}x{height}-{fps}fps',
            )
        )
    return samples


def _run_ffmpeg_source(ffmpeg: str, output_path: Path) -> None:
    base_cmd = [
        ffmpeg,
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-f',
        'lavfi',
        '-i',
        'testsrc2=size=1920x1080:rate=60:duration=1.0',
        '-pix_fmt',
        'yuv420p',
        '-an',
        '-movflags',
        '+faststart',
    ]
    _run_ffmpeg_with_fallbacks(
        base_cmd,
        output_path,
        (['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '30'], ['-c:v', 'mpeg4', '-q:v', '6']),
    )


def _run_ffmpeg_variant(ffmpeg: str, source_path: Path, output_path: Path, width: int, height: int, fps: int) -> None:
    base_cmd = [
        ffmpeg,
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-i',
        str(source_path),
        '-vf',
        f'scale={width}:{height}',
        '-r',
        str(fps),
        '-pix_fmt',
        'yuv420p',
        '-an',
        '-movflags',
        '+faststart',
    ]
    _run_ffmpeg_with_fallbacks(
        base_cmd,
        output_path,
        (['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '30'], ['-c:v', 'mpeg4', '-q:v', '6']),
    )


def _run_ffmpeg_with_fallbacks(base_cmd: List[str], output_path: Path, codec_arg_sets: tuple) -> None:
    result = None
    for codec_args in codec_arg_sets:
        result = subprocess.run(base_cmd + codec_args + [str(output_path)], capture_output=True, text=True)
        if result.returncode == 0:
            return
    pytest.fail(f'ffmpeg failed to generate {output_path}: {result.stderr}')


def _probe_video(path: Path) -> tuple:
    ffprobe = shutil.which('ffprobe')
    if not ffprobe:
        pytest.skip('downloaded dataset has no manifest metadata and ffprobe is not available')
    result = subprocess.run(
        [
            ffprobe,
            '-v',
            'error',
            '-select_streams',
            'v:0',
            '-show_entries',
            'stream=width,height,r_frame_rate',
            '-of',
            'json',
            str(path),
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        pytest.fail(f'ffprobe failed for {path}: {result.stderr}')
    stream = json.loads(result.stdout)['streams'][0]
    fps = _parse_fps(stream['r_frame_rate'])
    return int(stream['width']), int(stream['height']), fps


def _assert_dataset_shape(samples: List[VideoSample], expected_count: int) -> None:
    assert len(samples) == expected_count
    resolutions = {(sample.width, sample.height) for sample in samples}
    fps_values = {round(sample.fps, 2) for sample in samples}
    assert len(resolutions) >= _int_env('AIM_VIDEO_SYSTEM_MIN_RESOLUTION_BUCKETS', 5)
    assert len(fps_values) >= _int_env('AIM_VIDEO_SYSTEM_MIN_FPS_BUCKETS', 3)
    assert any(sample.width <= 320 and sample.height <= 240 for sample in samples)
    assert any(sample.width >= 1920 and sample.height >= 1080 for sample in samples)


def _directory_size(path: Path) -> int:
    total = 0
    if not path.exists():
        return total
    for file_path in path.rglob('*'):
        if file_path.is_file():
            total += file_path.stat().st_size
    return total


def _rss_bytes() -> int:
    try:
        import psutil
    except ImportError:
        return 0
    return psutil.Process(os.getpid()).memory_info().rss


def _sha256_file(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open('rb') as file:
        for chunk in iter(lambda: file.read(8 * MIB), b''):
            hasher.update(chunk)
    return hasher.hexdigest()


def _parse_fps(raw: str) -> float:
    numerator, _, denominator = raw.partition('/')
    if denominator:
        return float(numerator) / float(denominator)
    return float(numerator)


def _int_env(name: str, default: int) -> int:
    return int(os.environ.get(name, default))


def _float_env(name: str, default: float) -> float:
    return float(os.environ.get(name, default))


def _percentile(values: List[float], pct: float) -> float:
    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, int(round((len(ordered) - 1) * pct))))
    return ordered[index]
