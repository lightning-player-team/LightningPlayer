// ffprobe output types
// Converted from https://github.com/FFmpeg/FFmpeg/blob/master/doc/ffprobe.xsd

export interface IStreamDisposition {
  attached_pic: number;
  captions: number;
  clean_effects: number;
  comment: number;
  default: number;
  dependent: number;
  descriptions: number;
  dub: number;
  forced: number;
  hearing_impaired: number;
  karaoke: number;
  lyrics: number;
  metadata: number;
  multilayer: number;
  non_diegetic: number;
  original: number;
  still_image: number;
  timed_thumbnails: number;
  visual_impaired: number;
}

// Not in doc.
export interface IStreamTags {
  creation_time?: string;
  encoder?: string;
  handler_name?: string;
  language?: string;
  vendor_id?: string;
}

// Not in doc.
export interface IFormatTags {
  compatible_brands?: string;
  creation_time?: string;
  major_brand?: string;
  minor_version?: string;
}

export interface IVideoStreamInfo {
  chroma_location?: string;
  closed_captions?: string;
  coded_height?: number;
  coded_width?: number;
  color_primaries?: string;
  color_range?: string;
  color_space?: string;
  color_transfer?: string;
  display_aspect_ratio?: string;
  field_order?: string;
  film_grain?: string;
  has_b_frames?: number;
  height?: number;
  is_avc?: string; // Not in doc.
  level?: number;
  pix_fmt?: string;
  refs?: number;
  sample_aspect_ratio?: string;
  width?: number;
}

export interface IAudioStreamInfo {
  sample_fmt?: string;
  sample_rate?: string;
  channels?: number;
  channel_layout?: string;
  bits_per_sample?: number;
  initial_padding?: number;
}

export interface IBaseStreamInfo {
  avg_frame_rate: string;
  bit_rate?: string;
  bits_per_raw_sample?: string;
  codec_long_name?: string;
  codec_name?: string;
  codec_tag_string: string;
  codec_tag: string;
  codec_type?: string;
  disposition: IStreamDisposition;
  duration_ts?: number;
  duration?: string;
  extradata_hash?: string;
  extradata_size?: number;
  extradata?: string;
  id?: string;
  index: number;
  max_bit_rate?: string;
  nal_length_size?: string; // Not in doc.
  nb_frames?: string;
  nb_read_frames?: string;
  nb_read_packets?: string;
  profile?: string;
  r_frame_rate: string;
  side_data_list: unknown[];
  start_pts?: number;
  start_time?: string;
  tags: IStreamTags;
  time_base: string;
}

export type IStreamInfo = IBaseStreamInfo & IVideoStreamInfo & IAudioStreamInfo;

export interface IMediaInfo {
  streams: IStreamInfo[];
  format: {
    bit_rate: string;
    duration: string;
    filename: string;
    format_long_name?: string;
    format_name: string;
    nb_programs: number;
    nb_stream_groups: number;
    nb_streams: number;
    probe_score: number;
    size: string;
    start_time: string;
    tags: IFormatTags;
  };
}
