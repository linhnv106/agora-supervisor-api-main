# HLS Protocol

HLS is Apple HLS (HTTP Live Streaming), for both live and VOD streaming over HTTP, and the standard protocol on Apple platforms.

## The main use scenario of HLS:

- Cross Platform: the default for live streaming to PCs is RTMP, although some libraries can play HLS in Flash right now. Android 3.0+ can play HLS, and iOS has always supported HLS.
- Industrial Strength on Apple platforms: the most stable live streaming protocol for OSX/iOS is HLS, similar to RTMP for Flash on Windows PCs.
- Friendly for CDNs: HLS, since it streams over HTTP, is a CDN-friendly delivery protocol.
- Simple: HLS is an open protocol and there are lots of tools for TS (MPEG transport stream is the container format used by HLS).

In a word, HLS is the best delivery protocol when the user does not care about the latency, for both PC and mobile (Android and iOS).

## The workflow of HLS:

1. The encoder, for example, FFMPEG or FMLE, publishes an RTMP stream to SRS, and the codec of that stream must be H.264+AAC (use transcoding to convert other codecs when required).
2. SRS demuxes RTMP then remuxes the content into mpegts and writes a ts file, updating the m3u8.
3. The client, for example, an iPhone or VLC, accesses the m3u8 provided by any web server, for instance, SRS's embedded HTTP server, or nginx.

Note: SRS only needs you to configure HLS on the vhost, and SRS will create the directory by app name.
