import { CanvasSink } from "mediabunny";
import { formatTimestamp } from "../../shared/utils/formatTimestamp";
import { canvasToThumbnailBlob } from "./canvasToBlob";

export interface IPreviewThumbnailCacheConfig {
  /**
   * Interval in seconds between auto-fill thumbnails. Default: 1.
   */
  fillIntervalSeconds: number;
  /**
   * Maximum memory in bytes for cached thumbnails. Default: 100MB.
   */
  maxMemoryBytes: number;
}

interface ICachedThumbnail {
  sizeBytes: number;
  timestamp: number;
  url: string;
}

const DEFAULT_CONFIG: IPreviewThumbnailCacheConfig = {
  fillIntervalSeconds: 1,
  maxMemoryBytes: 100 * 1024 * 1024, // 100MB
};

/**
 * LRU cache for video thumbnails with memory-based eviction and background auto-fill.
 */
export class PreviewThumbnailCache {
  private autoFillCancelled = true;
  // Map maintains insertion order; we move accessed items to end for LRU behavior.
  private cache = new Map<number, ICachedThumbnail>();
  private config: IPreviewThumbnailCacheConfig;
  private totalMemoryBytes = 0;

  /**
   * Creates a new ThumbnailCache instance.
   *
   * @param config - Optional configuration overrides.
   */
  constructor(config?: Partial<IPreviewThumbnailCacheConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Disposes of the cache, revoking all blob URLs and clearing entries.
   */
  dispose(): void {
    this.stopAutoFill();
    for (const entry of this.cache.values()) {
      URL.revokeObjectURL(entry.url);
    }
    this.cache.clear();
    this.totalMemoryBytes = 0;
    console.log("PreviewThumbnailCache: disposed");
  }

  /**
   * Gets a cached thumbnail URL for the given timestamp.
   *
   * @param timestamp - The timestamp in seconds.
   * @returns The cached blob URL, or undefined if not cached.
   */
  get(timestamp: number): string | undefined {
    const entry = this.cache.get(timestamp);
    if (entry) {
      // Move to end for LRU behavior.
      this.cache.delete(timestamp);
      this.cache.set(timestamp, entry);
      return entry.url;
    }
    return undefined;
  }

  /**
   * Gets the current configuration.
   *
   * @returns The current cache configuration.
   */
  getConfig(): IPreviewThumbnailCacheConfig {
    return { ...this.config };
  }

  /**
   * Gets the current memory usage in bytes.
   *
   * @returns Total memory used by cached thumbnails.
   */
  getMemoryUsage(): number {
    return this.totalMemoryBytes;
  }

  /**
   * Gets the number of cached entries.
   *
   * @returns Number of thumbnails in cache.
   */
  getSize(): number {
    return this.cache.size;
  }

  /**
   * Checks if a timestamp is already cached.
   *
   * @param timestamp - The timestamp in seconds.
   * @returns True if the timestamp is cached.
   */
  has(timestamp: number): boolean {
    return this.cache.has(timestamp);
  }

  /**
   * Adds a thumbnail to the cache, evicting old entries if over memory limit.
   *
   * @param timestamp - The timestamp in seconds.
   * @param url - The blob URL for the thumbnail.
   * @param sizeBytes - The size of the blob in bytes.
   */
  set(timestamp: number, url: string, sizeBytes: number): void {
    // If already cached, revoke old URL and update.
    const existing = this.cache.get(timestamp);
    if (existing) {
      URL.revokeObjectURL(existing.url);
      this.totalMemoryBytes -= existing.sizeBytes;
      this.cache.delete(timestamp);
    }

    // Evict oldest entries until we have room.
    while (
      this.cache.size > 0 &&
      this.totalMemoryBytes + sizeBytes > this.config.maxMemoryBytes
    ) {
      this.evictOldest();
    }

    // Add new entry.
    this.cache.set(timestamp, { sizeBytes, timestamp, url });
    this.totalMemoryBytes += sizeBytes;
  }

  /**
   * Stops the background auto-fill process.
   */
  stopAutoFill(): void {
    this.autoFillCancelled = true;
  }

  /**
   * Runs the auto-fill process, fetching thumbnails sequentially.
   *
   * @param params - Parameters for auto-fill.
   */
  async runAutoFill({
    duration,
    timestamp,
    videoSink,
  }: {
    duration: number;
    timestamp: number;
    videoSink: CanvasSink;
  }): Promise<void> {
    this.autoFillCancelled = false;
    const interval = this.config.fillIntervalSeconds;
    let fetchedCount = 0;

    while (timestamp <= duration && !this.autoFillCancelled) {
      // Stop if memory limit reached.
      if (this.totalMemoryBytes >= this.config.maxMemoryBytes) {
        console.log(
          `PreviewThumbnailCache: auto-fill stopped at ${formatTimestamp(timestamp)} (memory limit reached: ${(this.totalMemoryBytes / 1024 / 1024).toFixed(1)}MB)`,
        );
        return;
      }

      // Skip if already cached.
      if (!this.has(timestamp)) {
        const success = await this.fetchAndCache(timestamp, videoSink);
        if (success) {
          fetchedCount++;
          if (fetchedCount % 60 === 0) {
            console.log(
              `PreviewThumbnailCache: auto-fill progress ${formatTimestamp(timestamp)} / ${formatTimestamp(duration)} (${fetchedCount} thumbnails, ${(this.totalMemoryBytes / 1024 / 1024).toFixed(1)}MB)`,
            );
          }
        }
      }

      timestamp += interval;

      // Yield to main thread to prevent blocking.
      await this.yieldToMainThread(0);
    }

    if (!this.autoFillCancelled) {
      console.log(
        `PreviewThumbnailCache: auto-fill complete (${fetchedCount} thumbnails, ${(this.totalMemoryBytes / 1024 / 1024).toFixed(1)}MB)`,
      );
    }
  }

  /**
   * Evicts the oldest (least recently used) entry from the cache.
   */
  private evictOldest(): void {
    // Map iterator gives entries in insertion order; first entry is oldest.
    const firstKey = this.cache.keys().next().value;
    if (firstKey !== undefined) {
      const entry = this.cache.get(firstKey);
      if (entry) {
        URL.revokeObjectURL(entry.url);
        this.totalMemoryBytes -= entry.sizeBytes;
        this.cache.delete(firstKey);
        // console.log(`ThumbnailCache: evicted thumbnail at ${firstKey}s`);
      }
    }
  }

  /**
   * Fetches a thumbnail and adds it to the cache.
   *
   * @param timestamp - The timestamp to fetch.
   * @param videoSink - The video sink to fetch from.
   * @returns True if fetch was successful.
   */
  private async fetchAndCache(
    timestamp: number,
    videoSink: CanvasSink,
  ): Promise<boolean> {
    try {
      const canvas = await videoSink.getCanvas(timestamp);
      if (!canvas) return false;

      const blob = await canvasToThumbnailBlob(canvas.canvas);
      if (!blob) return false;

      const url = URL.createObjectURL(blob);
      this.set(timestamp, url, blob.size);
      return true;
    } catch (error) {
      console.error(
        `PreviewThumbnailCache: error fetching thumbnail at ${formatTimestamp(timestamp)}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Yields to the main thread using requestIdleCallback or setTimeout.
   *
   * @param minDelay - Minimum delay in milliseconds.
   */
  private yieldToMainThread(minDelay: number): Promise<void> {
    return new Promise((resolve) => {
      if (minDelay > 0) {
        setTimeout(resolve, minDelay);
      } else if ("requestIdleCallback" in window) {
        requestIdleCallback(() => resolve(), { timeout: 100 });
      } else {
        setTimeout(resolve, 16); // ~60fps
      }
    });
  }
}
