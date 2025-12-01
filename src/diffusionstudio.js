/*!
 * @diffusionstudio/core v4.0.3
 * Copyright (c) 2025 Diffusion Studio Inc.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

class e {
  toJSON(e) {
    const t = {},
      i = this.constructor.__serializableProperties || [],
      r = this.constructor.__displayName;
    r && (t.displayName = r);
    const a = (e) => {
      if (null == e || e instanceof Blob || e instanceof FileSystemFileHandle)
        return e;
      if (Array.isArray(e))
        return e.map((e) => a(e)).filter((e) => void 0 !== e);
      if ("object" == typeof e && "toJSON" in e) return e.toJSON();
      if ("object" == typeof e) {
        const t = {};
        for (const i in e) {
          const r = a(e[i]);
          void 0 !== r && (t[i] = r);
        }
        return t;
      }
      return e;
    };
    return (
      i.forEach(({ propertyKey: i, mapTo: r }) => {
        if (e?.includes(i)) return;
        const s = this[i],
          n = r ?? i,
          o = a(s);
        void 0 !== o && (t[n] = o);
      }),
      t
    );
  }
  fromJSON(e) {
    return (
      (this.constructor.__serializableProperties || []).forEach(
        ({ propertyKey: t, deserializer: i, mapTo: r }) => {
          const a = r ?? t,
            s = i.fromJSON?.bind(i) ?? ((e) => e);
          if (e.hasOwnProperty(a))
            try {
              this[t] = s(e[a]);
            } catch (n) {
              console.error(`Error deserializing property ${t}:`, n);
            }
        },
      ),
      this
    );
  }
  static fromJSON(e) {
    return new this().fromJSON(e);
  }
}
function t(e = {}, t) {
  return function (i, r) {
    const a = i.constructor;
    (a.__serializableProperties || (a.__serializableProperties = []),
      (a.__serializableProperties = [
        ...a.__serializableProperties.filter((e) => e.propertyKey !== r),
        { propertyKey: r, deserializer: e, mapTo: t },
      ]));
  };
}
function i(e) {
  return function (t) {
    t.__displayName = e;
  };
}
function r(e) {
  return Math.floor(255 * e)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
}
function a(e, t) {
  return e.reduce((e, i) => {
    const r = i[t];
    return (e[r] || (e[r] = []), e[r].push(i), e);
  }, {});
}
function s(e, t) {
  return [e.slice(0, t), e.slice(t)].filter((e) => e.length > 0);
}
function n(e, t) {
  return t ? Math.floor(Math.random() * (t - e + 1) + e) : e;
}
async function o(e) {
  e <= 0 || (await new Promise((t) => setTimeout(t, e)));
}
function c(e, t = 300) {
  let i;
  return (...r) => {
    (clearTimeout(i),
      (i = setTimeout(() => {
        e.apply(e, r);
      }, t)));
  };
}
function l(e, t, i) {
  i < 0 && (i = 0);
  const r = e[t];
  (e.splice(t, 1), e.splice(i, 0, r));
}
function h(e) {
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function d(e, t, i) {
  return Math.max(t, Math.min(i, e));
}
function u(e) {
  throw new Error("This should not run!");
}
function m(e, t = "Unknown error") {
  if (!e) throw new Error(`Assertion failed: ${t}`);
}
let p = class {
  currentPromise = Promise.resolve();
  async acquire() {
    let e;
    const t = new Promise((t) => {
        e = t;
      }),
      i = this.currentPromise;
    return ((this.currentPromise = t), await i, e);
  }
};
const f = (e, t, i) => {
  let r = -1,
    a = 0,
    s = e.length - 1;
  for (; a <= s; ) {
    const n = (a + (s - a + 1) / 2) | 0;
    i(e[n]) <= t ? ((r = n), (a = n + 1)) : (s = n - 1);
  }
  return r;
};
function g(e) {
  if (1 === e.numberOfChannels) return e.getChannelData(0);
  const t = [];
  for (let n = 0; n < e.numberOfChannels; n++) t.push(e.getChannelData(n));
  const i = Math.max(...t.map((e) => e.length)),
    r = new Float32Array(i * e.numberOfChannels);
  let a = 0,
    s = 0;
  for (; s < i; )
    (t.forEach((e) => {
      r[a++] = void 0 !== e[s] ? e[s] : 0;
    }),
      s++);
  return r;
}
function k(e, t, i) {
  for (let r = 0; r < i.length; r++) e.setUint8(t + r, i.charCodeAt(r));
}
function y(e, t, i) {
  for (let r = 0; r < t.length; r++, i += 2) {
    const a = Math.max(-1, Math.min(1, t[r]));
    e.setInt16(i, a < 0 ? 32768 * a : 32767 * a, !0);
  }
  return e;
}
function w(e, t = "audio/wav") {
  const i = (function (e, t, i) {
    const r = 2 * t,
      a = 2 * e.length,
      s = 36 + a,
      n = new ArrayBuffer(8 + s),
      o = new DataView(n);
    return (
      k(o, 0, "RIFF"),
      o.setUint32(4, s, !0),
      k(o, 8, "WAVE"),
      k(o, 12, "fmt "),
      o.setUint32(16, 16, !0),
      o.setUint16(20, 1, !0),
      o.setUint16(22, t, !0),
      o.setUint32(24, i, !0),
      o.setUint32(28, i * r, !0),
      o.setUint16(32, r, !0),
      o.setUint16(34, 16, !0),
      k(o, 36, "data"),
      o.setUint32(40, a, !0),
      y(o, e, 44)
    );
  })(g(e), e.numberOfChannels, e.sampleRate);
  return new Blob([i.buffer], { type: t });
}
function b(e) {
  const t = new Float32Array(e.length * e.numberOfChannels);
  let i = 0;
  for (let r = 0; r < e.numberOfChannels; r++) {
    const a = e.getChannelData(r);
    (t.set(a, i), (i += a.length));
  }
  return t;
}
function T(e) {
  const t = e.numberOfChannels,
    i = e.length,
    r = new Int16Array(i * t);
  for (let a = 0; a < i; a++)
    for (let i = 0; i < t; i++) {
      let s = 32767 * e.getChannelData(i)[a];
      (s > 32767 && (s = 32767),
        s < -32767 && (s = -32767),
        (r[a * t + i] = s));
    }
  return r;
}
async function C(e, t = 22050, i = Math.sqrt(2)) {
  const r = await e.arrayBuffer(),
    a = new OfflineAudioContext({ sampleRate: t, length: 1 }),
    s = await a.decodeAudioData(r),
    n = a.createBuffer(1, s.length, t);
  if (s.numberOfChannels >= 2) {
    const e = s.getChannelData(0),
      t = s.getChannelData(1),
      r = n.getChannelData(0);
    for (let a = 0; a < s.length; ++a) r[a] = (i * (e[a] + t[a])) / 2;
    return n;
  }
  return s;
}
function S(e, t = 44100, i = 2) {
  if (e.sampleRate == t && e.numberOfChannels == i) return e;
  const r = Math.floor(e.duration * t),
    a = new OfflineAudioContext(i, 1, t).createBuffer(i, r, t);
  for (let s = 0; s < e.numberOfChannels; s++) {
    const i = e.getChannelData(s),
      r = a.getChannelData(s),
      n = e.sampleRate / t;
    for (let e = 0; e < r.length; e++) {
      const t = e * n,
        a = Math.floor(t),
        s = Math.ceil(t);
      if (s >= i.length) r[e] = i[a];
      else {
        const n = t - a;
        r[e] = i[a] * (1 - n) + i[s] * n;
      }
    }
  }
  return a;
}
function v(e) {
  return (
    {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
      "image/bmp": ".bmp",
      "image/tiff": ".tiff",
      "image/x-icon": ".ico",
      "image/vnd.microsoft.icon": ".ico",
      "image/avif": ".avif",
      "image/heic": ".heic",
      "image/heif": ".heif",
      "application/pdf": ".pdf",
      "text/plain": ".txt",
      "audio/mpeg": ".mp3",
      "audio/mp3": ".mp3",
      "audio/wav": ".wav",
      "audio/wave": ".wav",
      "audio/x-wav": ".wav",
      "audio/ogg": ".ogg",
      "audio/aac": ".aac",
      "audio/m4a": ".m4a",
      "audio/flac": ".flac",
      "audio/webm": ".webm",
      "video/mp4": ".mp4",
      "video/mpeg": ".mpeg",
      "video/quicktime": ".mov",
      "video/x-msvideo": ".avi",
      "video/webm": ".webm",
      "video/ogg": ".ogv",
      "video/3gpp": ".3gp",
      "video/x-flv": ".flv",
      "video/x-ms-wmv": ".wmv",
      "text/html": ".html",
      "application/json": ".json",
      "text/xml": ".xml",
      "application/xml": ".xml",
    }[e.toLowerCase().trim().split(";")[0].trim()] || ".bin"
  );
}
async function x(e, t) {
  const i = document.createElement("a");
  if (
    (document.head.appendChild(i),
    (i.target = "_blank"),
    t && !t.match(/\.[^.]+$/))
  )
    if (e instanceof File) t += v(e.type);
    else if (e instanceof FileSystemFileHandle) {
      t += v((await e.getFile()).type);
    }
  if (
    (t
      ? (i.download = t)
      : e instanceof File
        ? (i.download = e.name)
        : e instanceof Blob
          ? (i.download = "untitled")
          : "string" == typeof e &&
            (i.download = e.split("/").pop() ?? "untitled"),
    "string" == typeof e && e.startsWith("data:image/svg+xml;base64,"))
  ) {
    const r = e.split(",")[1],
      a = atob(r),
      s = new Array(a.length);
    for (let e = 0; e < a.length; e++) s[e] = a.charCodeAt(e);
    const n = new Uint8Array(s),
      o = new Blob([n], { type: "image/svg+xml" });
    ((i.href = URL.createObjectURL(o)),
      (i.download = t?.split(".")[0] + ".svg"));
  } else
    "string" == typeof e
      ? (i.href = e)
      : e instanceof Blob
        ? (i.href = URL.createObjectURL(e))
        : (i.href = URL.createObjectURL(await e.getFile()));
  (i.click(), i.remove());
}
async function P(e = "image/*,video/*,audio/*,text/*", t = !0) {
  try {
    return "showOpenFilePicker" in window
      ? await window.showOpenFilePicker({ multiple: t, startIn: "downloads" })
      : new Promise((i) => {
          const r = document.createElement("input");
          ((r.type = "file"),
            (r.accept = e),
            (r.multiple = t),
            (r.onchange = (e) => {
              const t = Array.from(e.target?.files ?? []);
              i(t);
            }),
            r.click());
        });
  } catch (i) {
    return [];
  }
}
const E = 0.2,
  I = 1;
let _ = 30,
  A = 48e3;
const F = {
  set experimental_timeBase(e) {
    _ = e;
  },
  set experimental_canonicalTimeBase(e) {
    A = e;
  },
};
function B(e) {
  return Math.round(e * _);
}
function M(e) {
  return Math.round(e * A) / A;
}
function D(e) {
  if (!e) return 0;
  if ("number" == typeof e) return M(B(e) / _);
  const t = e.split(":");
  if (3 === t.length) {
    const [i, r, a] = t.map(Number);
    if (isNaN(i) || isNaN(r) || isNaN(a))
      throw new Error(`Invalid time format: ${e}`);
    return M(B(3600 * i + 60 * r + a) / _);
  }
  if (2 === t.length) {
    const [i, r] = t.map(Number);
    if (isNaN(i) || isNaN(r)) throw new Error(`Invalid time format: ${e}`);
    return M(B(60 * i + r) / _);
  }
  if (e.includes("/")) {
    const [t, i] = e.split("/").map(Number);
    if (isNaN(t) || isNaN(i)) throw new Error(`Invalid time format: ${e}`);
    return M(t / i);
  }
  if ("string" == typeof e) {
    const t = parseFloat(e);
    if (isNaN(t)) throw new Error(`Invalid time format: ${e}`);
    if (e.endsWith("ms")) return M(B(t / 1e3) / _);
    if (e.endsWith("s")) return M(B(t) / _);
    if (e.endsWith("f")) return M(t / _);
    if (e.endsWith("min")) return M(B(60 * t) / _);
    throw new Error(`Invalid time format: ${e}`);
  }
  throw new Error(`Invalid time format: ${e}`);
}
function O(e) {
  const t = [];
  for (const i of e) {
    const e = { id: i.id, mimeType: i.mimeType, input: i.input };
    for (const [t, r] of Object.entries(i))
      "function" != typeof r &&
        "symbol" != typeof r &&
        "object" != typeof r &&
        (e[t] = r);
    t.push(e);
  }
  return JSON.parse(JSON.stringify(t));
}
const R = { fromJSON: (e) => new Date(e) };
function z(e) {
  let t = 1,
    i = "";
  const r = (e) => {
    const t = new Date(1970, 0, 1);
    return (
      t.setSeconds(e),
      t.setMilliseconds(Math.round((e % 1) * 1e3)),
      `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}:${t.getSeconds().toString().padStart(2, "0")},` +
        t.getMilliseconds().toString().padStart(3, "0")
    );
  };
  for (const a of e) {
    const e = a.words.join(" "),
      s = a.words.at(0)?.start,
      n = a.words.at(-1)?.end;
    s &&
      n &&
      ((i += `${t}\n` + r(s) + " --\x3e " + r(n) + `\n${e}\n\n`), (t += 1));
  }
  return { text: i, blob: new Blob([i], { type: "text/plain;charset=utf8" }) };
}
var N = Object.defineProperty,
  U = Object.getOwnPropertyDescriptor,
  L = (e, t, i, r) => {
    for (
      var a, s = r > 1 ? void 0 : r ? U(t, i) : t, n = e.length - 1;
      n >= 0;
      n--
    )
      (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
    return (r && s && N(t, i, s), s);
  };
class V extends e {
  _background = "#000000";
  canvas = document.createElement("canvas");
  videoCtx = this.canvas.getContext("2d");
  resolution = 1;
  width = 0;
  height = 0;
  textScale = 4;
  audioCtx;
  audioDestination;
  hardwareOffset = 0;
  playbackOffset = 0;
  inactiveFps = 1;
  playing = !1;
  stopped = !0;
  lastFrameTime = 0;
  constructor({
    width: e = 1920,
    height: t = 1080,
    background: i = "#000000",
    resolution: r = 1,
    callback: a,
    context: s = new AudioContext(),
    audioDestination: n = s.destination,
  } = {}) {
    (super(),
      (this.resolution = r),
      (this.background = i),
      (this.callback = a),
      (this.audioCtx = s),
      (this.audioDestination = n),
      this.resize(e, t));
  }
  get hardwareTime() {
    return this.audioCtx.currentTime;
  }
  get playbackTime() {
    return this.playing
      ? this.hardwareTime - this.hardwareOffset + this.playbackOffset
      : this.playbackOffset;
  }
  start() {
    this.stopped && ((this.stopped = !1), this.timer());
  }
  stop() {
    this.stopped = !0;
  }
  async play() {
    this.playing ||
      this.stopped ||
      (this.resumeAudioContext(),
      (this.hardwareOffset = this.hardwareTime),
      (this.playing = !0));
  }
  async pause() {
    this.playing &&
      ((this.playbackOffset = this.playbackTime), (this.playing = !1));
  }
  async timer(e = 0) {
    if (this.stopped) return;
    const t = 1e3 / (this.playing ? _ : this.inactiveFps);
    (e - this.lastFrameTime >= t &&
      ((this.lastFrameTime = e), await this.callback?.()),
      requestAnimationFrame(this.timer.bind(this)));
  }
  async resumeAudioContext() {
    "suspended" === this.audioCtx.state && (await this.audioCtx.resume());
  }
  get background() {
    return this._background;
  }
  set background(e) {
    this.background != e &&
      ((this.canvas.style.background = e), (this._background = e));
  }
  resize(e = this.width, t = this.height, i = this.resolution) {
    const r = 2 * Math.round(e / 2),
      a = 2 * Math.round(t / 2);
    return (
      (r === this.width && a === this.height && i === this.resolution) ||
        ((this.width = r),
        (this.height = a),
        (this.resolution = i),
        (this.canvas.width = 2 * Math.round((r * this.resolution) / 2)),
        (this.canvas.height = 2 * Math.round((a * this.resolution) / 2)),
        (this.videoCtx.imageSmoothingEnabled = !1)),
      this
    );
  }
  clear(e) {
    let t = 0,
      i = 0,
      r = this.width * this.resolution,
      a = this.height * this.resolution;
    return (
      (this.videoCtx.fillStyle = this._background),
      e &&
        ((t = (e.x ?? 0) * this.resolution),
        (i = (e.y ?? 0) * this.resolution),
        (r = e.width * this.resolution),
        (a = e.height * this.resolution)),
      this.videoCtx.setTransform(1, 0, 0, 1, 0, 0),
      this.videoCtx.clearRect(t, i, r, a),
      this.videoCtx.fillRect(t, i, r, a),
      this.videoCtx.scale(this.resolution, this.resolution),
      this
    );
  }
  mount(e) {
    e.appendChild(this.canvas);
  }
  unmount() {
    this.canvas.parentElement?.removeChild(this.canvas);
  }
}
function W(e, t) {
  return "lower" == t
    ? e.toLocaleLowerCase()
    : "upper" == t
      ? e.toUpperCase()
      : e;
}
function H(e = "#000000", t = 100) {
  return `${e}${Math.round((t / 100) * 255).toString(16)}`;
}
function $(e, t) {
  return "number" == typeof e
    ? e
    : (Number.parseFloat(e.replace("%", "")) * t) / 100;
}
function j(e) {
  return class extends e {
    _handlers = {};
    _regexHandlers = [];
    on(e, t, i = {}) {
      if (e instanceof RegExp) {
        const r = t;
        return (
          this._regexHandlers.push({ pattern: e, callback: r, ...i }),
          () => this.off(e)
        );
      }
      {
        const r = t;
        return (
          this._handlers[e]
            ? (this.off(e, r), this._handlers[e]?.push({ callback: r, ...i }))
            : (this._handlers[e] = [{ callback: r, ...i }]),
          () => this.off(e, r)
        );
      }
    }
    off(e, t) {
      "function" != typeof e
        ? Array.isArray(e)
          ? e.forEach((e) => e())
          : e instanceof RegExp
            ? (this._regexHandlers = this._regexHandlers.filter((t) => {
                return (
                  (i = t.pattern),
                  (r = e),
                  !(i.source === r.source && i.flags === r.flags)
                );
                var i, r;
              }))
            : (this._handlers[e] = this._handlers[e]?.filter(
                (e) => e.callback !== t,
              ))
        : e();
    }
    offAny() {
      ((this._handlers = {}), (this._regexHandlers = []));
    }
    emit(e, t) {
      for (const i of this._handlers[e] ?? [])
        (i.callback(t), i.once && this.off(e, i.callback));
      for (const i of this._regexHandlers)
        i.pattern.test(String(e)) &&
          (i.callback({ type: e, detail: t }), i.once && this.off(i.pattern));
    }
  };
}
(L([t()], V.prototype, "resolution", 2),
  L([t()], V.prototype, "width", 2),
  L([t()], V.prototype, "height", 2),
  L([t()], V.prototype, "background", 1));
let q = (e = 21) =>
  crypto
    .getRandomValues(new Uint8Array(e))
    .reduce(
      (e, t) =>
        (e +=
          (t &= 63) < 36
            ? t.toString(36)
            : t < 62
              ? (t - 26).toString(36).toUpperCase()
              : t > 62
                ? "-"
                : "_"),
      "",
    );
var K = Object.defineProperty,
  Q = (e, t, i, r) => {
    for (var a, s = void 0, n = e.length - 1; n >= 0; n--)
      (a = e[n]) && (s = a(t, i, s) || s);
    return (s && K(t, i, s), s);
  };
class X extends e {
  id = `source_${q()}`;
  mimeType;
  input;
  name;
  createdAt = /* @__PURE__ */ new Date().toISOString();
  constructor(e) {
    (super(),
      (this.input = e.input),
      (this.mimeType = e.mimeType),
      e.name
        ? (this.name = e.name)
        : "string" == typeof this.input
          ? (this.name = this.input.split("/").at(-1) ?? "")
          : this.input instanceof File ||
              this.input instanceof FileSystemFileHandle
            ? (this.name = this.input.name)
            : (this.name = "UNTITLED_BLOB"));
  }
  async init() {}
  async arrayBuffer() {
    if ("string" == typeof this.input) {
      const e = await fetch(this.input);
      return await e.arrayBuffer();
    }
    if (this.input instanceof Blob) return await this.input.arrayBuffer();
    {
      const e = await this.input.getFile();
      return await e.arrayBuffer();
    }
  }
  toJSON() {
    return this.id;
  }
}
function G(e) {
  return class extends e {
    height = 1080;
    width = 1920;
    get aspectRatio() {
      return this.width / this.height;
    }
  };
}
(Q([t()], X.prototype, "id"),
  Q([t()], X.prototype, "mimeType"),
  Q([t()], X.prototype, "input"),
  Q([t()], X.prototype, "name"),
  Q([t()], X.prototype, "createdAt"));
class Y extends Error {
  name = "DecoderError";
  constructor(e) {
    super(e);
  }
}
class J extends Error {
  name = "EncoderError";
  constructor(e) {
    super(e);
  }
}
class Z extends Error {
  name = "IOError";
  constructor(e) {
    super(e);
  }
}
class ee extends Error {
  name = "ReferenceError";
  constructor(e) {
    super(e);
  }
}
class te extends Error {
  name = "ValidationError";
  constructor(e) {
    super(e);
  }
}
function ie(e) {
  if (!e) throw new Error("Assertion failed.");
}
const re = (e) => {
    const t = ((e % 360) + 360) % 360;
    if (0 === t || 90 === t || 180 === t || 270 === t) return t;
    throw new Error(`Invalid rotation ${e}.`);
  },
  ae = (e) => e && e[e.length - 1],
  se = (e) => e >= 0 && e < 2 ** 32;
class ne {
  constructor(e) {
    ((this.bytes = e), (this.pos = 0));
  }
  seekToByte(e) {
    this.pos = 8 * e;
  }
  readBit() {
    const e = Math.floor(this.pos / 8),
      t = this.bytes[e] ?? 0,
      i = 7 - (7 & this.pos),
      r = (t & (1 << i)) >> i;
    return (this.pos++, r);
  }
  readBits(e) {
    if (1 === e) return this.readBit();
    let t = 0;
    for (let i = 0; i < e; i++) ((t <<= 1), (t |= this.readBit()));
    return t;
  }
  writeBits(e, t) {
    const i = this.pos + e;
    for (let r = this.pos; r < i; r++) {
      const e = Math.floor(r / 8);
      let a = this.bytes[e];
      const s = 7 - (7 & r);
      ((a &= ~(1 << s)),
        (a |= ((t & (1 << (i - r - 1))) >> (i - r - 1)) << s),
        (this.bytes[e] = a));
    }
    this.pos = i;
  }
  readAlignedByte() {
    if (this.pos % 8 != 0) throw new Error("Bitstream is not byte-aligned.");
    const e = this.pos / 8,
      t = this.bytes[e] ?? 0;
    return ((this.pos += 8), t);
  }
  skipBits(e) {
    this.pos += e;
  }
  getBitsLeft() {
    return 8 * this.bytes.length - this.pos;
  }
  clone() {
    const e = new ne(this.bytes);
    return ((e.pos = this.pos), e);
  }
}
const oe = (e) => {
    let t = 0;
    for (; 0 === e.readBits(1) && t < 32; ) t++;
    if (t >= 32) throw new Error("Invalid exponential-Golomb code.");
    return (1 << t) - 1 + e.readBits(t);
  },
  ce = (e) => {
    const t = oe(e);
    return 1 & t ? (t + 1) >> 1 : -(t >> 1);
  },
  le = (e) =>
    e.constructor === Uint8Array
      ? e
      : e instanceof ArrayBuffer
        ? new Uint8Array(e)
        : new Uint8Array(e.buffer, e.byteOffset, e.byteLength),
  he = (e) =>
    e.constructor === DataView
      ? e
      : e instanceof ArrayBuffer
        ? new DataView(e)
        : new DataView(e.buffer, e.byteOffset, e.byteLength),
  de = /* #__PURE__ */ new TextDecoder(),
  ue = /* #__PURE__ */ new TextEncoder(),
  me = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [t, e])),
  pe = { bt709: 1, bt470bg: 5, smpte170m: 6, bt2020: 9, smpte432: 12 },
  fe = /* #__PURE__ */ me(pe),
  ge = {
    bt709: 1,
    smpte170m: 6,
    linear: 8,
    "iec61966-2-1": 13,
    pq: 16,
    hlg: 18,
  },
  ke = /* #__PURE__ */ me(ge),
  ye = { rgb: 0, bt709: 1, bt470bg: 5, smpte170m: 6, "bt2020-ncl": 9 },
  we = /* #__PURE__ */ me(ye),
  be = (e) =>
    !!(e && e.primaries && e.transfer && e.matrix && void 0 !== e.fullRange),
  Te = (e) =>
    e instanceof ArrayBuffer ||
    ("undefined" != typeof SharedArrayBuffer &&
      e instanceof SharedArrayBuffer) ||
    ArrayBuffer.isView(e);
class Ce {
  constructor() {
    this.currentPromise = Promise.resolve();
  }
  async acquire() {
    let e;
    const t = new Promise((t) => {
        e = t;
      }),
      i = this.currentPromise;
    return ((this.currentPromise = t), await i, e);
  }
}
const Se = (e) => [...e].map((e) => e.toString(16).padStart(2, "0")).join(""),
  ve = (e) =>
    (e =
      (((e =
        (((e =
          (((e =
            (((e = ((e >> 1) & 1431655765) | ((1431655765 & e) << 1)) >> 2) &
              858993459) |
            ((858993459 & e) << 2)) >>
            4) &
            252645135) |
          ((252645135 & e) << 4)) >>
          8) &
          16711935) |
        ((16711935 & e) << 8)) >>
        16) &
        65535) |
      ((65535 & e) << 16)) >>> 0,
  xe = (e, t, i) => {
    let r = 0,
      a = e.length - 1,
      s = -1;
    for (; r <= a; ) {
      const n = (r + a) >> 1,
        o = i(e[n]);
      o === t ? ((s = n), (a = n - 1)) : o < t ? (r = n + 1) : (a = n - 1);
    }
    return s;
  },
  Pe = (e, t, i) => {
    let r = 0,
      a = e.length - 1,
      s = -1;
    for (; r <= a; ) {
      const n = (r + (a - r + 1) / 2) | 0;
      i(e[n]) <= t ? ((s = n), (r = n + 1)) : (a = n - 1);
    }
    return s;
  },
  Ee = (e, t, i) => {
    const r = Pe(e, i(t), i);
    e.splice(r + 1, 0, t);
  },
  Ie = () => {
    let e, t;
    return {
      promise: new Promise((i, r) => {
        ((e = i), (t = r));
      }),
      resolve: e,
      reject: t,
    };
  },
  _e = (e, t) => {
    for (let i = e.length - 1; i >= 0; i--) if (t(e[i])) return e[i];
  },
  Ae = (e, t) => {
    for (let i = e.length - 1; i >= 0; i--) if (t(e[i])) return i;
    return -1;
  },
  Fe = (e) => {
    throw new Error(`Unexpected value: ${e}`);
  },
  Be = (e, t, i) => {
    const r = e.getUint8(t),
      a = e.getUint8(t + 1),
      s = e.getUint8(t + 2);
    return i ? r | (a << 8) | (s << 16) : (r << 16) | (a << 8) | s;
  },
  Me = (e, t, i, r) => {
    ((i >>>= 0),
      (i &= 16777215),
      r
        ? (e.setUint8(t, 255 & i),
          e.setUint8(t + 1, (i >>> 8) & 255),
          e.setUint8(t + 2, (i >>> 16) & 255))
        : (e.setUint8(t, (i >>> 16) & 255),
          e.setUint8(t + 1, (i >>> 8) & 255),
          e.setUint8(t + 2, 255 & i)));
  },
  De = (e, t) => ({
    async next() {
      const i = await e.next();
      return i.done
        ? { value: void 0, done: !0 }
        : { value: t(i.value), done: !1 };
    },
    return: () => e.return(),
    throw: (t) => e.throw(t),
    [Symbol.asyncIterator]() {
      return this;
    },
  }),
  Oe = (e, t, i) => Math.max(t, Math.min(i, e)),
  Re = "und",
  ze = (e) => {
    const t = Math.round(e);
    return Math.abs(e / t - 1) < 10 * Number.EPSILON ? t : e;
  },
  Ne = (e, t) => Math.round(e / t) * t,
  Ue = /^[a-z]{3}$/,
  Le = (e) => Ue.test(e),
  Ve = 1e6 * (1 + Number.EPSILON),
  We = (e, t) => {
    const i = { ...e, ...t };
    if (e.headers || t.headers) {
      const r = e.headers ? He(e.headers) : {},
        a = t.headers ? He(t.headers) : {},
        s = { ...r };
      (Object.entries(a).forEach(([e, t]) => {
        const i = Object.keys(s).find(
          (t) => t.toLowerCase() === e.toLowerCase(),
        );
        (i && delete s[i], (s[e] = t));
      }),
        (i.headers = s));
    }
    return i;
  },
  He = (e) => {
    if (e instanceof Headers) {
      const t = {};
      return (
        e.forEach((e, i) => {
          t[i] = e;
        }),
        t
      );
    }
    if (Array.isArray(e)) {
      const t = {};
      return (
        e.forEach(([e, i]) => {
          t[e] = i;
        }),
        t
      );
    }
    return e;
  },
  $e = async (e, t, i, r) => {
    let a = 0;
    for (;;)
      try {
        return await e(t, i);
      } catch (s) {
        a++;
        const e = r(a, s, t);
        if (null === e) throw s;
        if (
          (console.error("Retrying failed fetch. Error:", s),
          !Number.isFinite(e) || e < 0)
        )
          throw new TypeError(
            "Retry delay must be a non-negative finite number.",
          );
        e > 0 && (await new Promise((t) => setTimeout(t, 1e3 * e)));
      }
  };
class je {
  constructor() {
    this.currentPromise = Promise.resolve();
  }
  call(e) {
    return (this.currentPromise = this.currentPromise.then(e));
  }
}
let qe = null;
const Ke = () =>
  null !== qe
    ? qe
    : (qe = !(
        "undefined" == typeof navigator || !navigator.vendor?.match(/apple/i)
      ));
let Qe = null;
const Xe = () =>
  null !== Qe
    ? Qe
    : (Qe =
        "undefined" != typeof navigator &&
        navigator.userAgent?.includes("Firefox"));
let Ge = null;
const Ye = (e, t) => (-1 !== e ? e : t),
  Je = (e, t, i, r) => e <= r && i <= t,
  Ze = function* (e) {
    for (const t in e) {
      const i = e[t];
      void 0 !== i && (yield { key: t, value: i });
    }
  },
  et = (e) => {
    switch (e.toLowerCase()) {
      case "image/jpeg":
      case "image/jpg":
        return ".jpg";
      case "image/png":
        return ".png";
      case "image/gif":
        return ".gif";
      case "image/webp":
        return ".webp";
      case "image/bmp":
        return ".bmp";
      case "image/svg+xml":
        return ".svg";
      case "image/tiff":
        return ".tiff";
      case "image/avif":
        return ".avif";
      case "image/x-icon":
      case "image/vnd.microsoft.icon":
        return ".ico";
      default:
        return null;
    }
  },
  tt = (e) => {
    const t = atob(e),
      i = new Uint8Array(t.length);
    for (let r = 0; r < t.length; r++) i[r] = t.charCodeAt(r);
    return i;
  },
  it = (e) => {
    let t = "";
    for (let i = 0; i < e.length; i++) t += String.fromCharCode(e[i]);
    return btoa(t);
  },
  rt = (e, t) => {
    if (e.length !== t.length) return !1;
    for (let i = 0; i < e.length; i++) if (e[i] !== t[i]) return !1;
    return !0;
  },
  at = () => {
    Symbol.dispose ??= Symbol("Symbol.dispose");
  },
  st = (e) => "number" == typeof e && !Number.isNaN(e);
class nt {
  constructor(e, t) {
    if (((this.data = e), (this.mimeType = t), !(e instanceof Uint8Array)))
      throw new TypeError("data must be a Uint8Array.");
    if ("string" != typeof t) throw new TypeError("mimeType must be a string.");
  }
}
class ot {
  constructor(e, t, i, r) {
    if (
      ((this.data = e),
      (this.mimeType = t),
      (this.name = i),
      (this.description = r),
      !(e instanceof Uint8Array))
    )
      throw new TypeError("data must be a Uint8Array.");
    if (void 0 !== t && "string" != typeof t)
      throw new TypeError("mimeType, when provided, must be a string.");
    if (void 0 !== i && "string" != typeof i)
      throw new TypeError("name, when provided, must be a string.");
    if (void 0 !== r && "string" != typeof r)
      throw new TypeError("description, when provided, must be a string.");
  }
}
const ct = {
    default: !0,
    forced: !1,
    original: !1,
    commentary: !1,
    hearingImpaired: !1,
    visuallyImpaired: !1,
  },
  lt = ["avc", "hevc", "vp9", "av1", "vp8"],
  ht = [
    "pcm-s16",
    "pcm-s16be",
    "pcm-s24",
    "pcm-s24be",
    "pcm-s32",
    "pcm-s32be",
    "pcm-f32",
    "pcm-f32be",
    "pcm-f64",
    "pcm-f64be",
    "pcm-u8",
    "pcm-s8",
    "ulaw",
    "alaw",
  ],
  dt = ["aac", "opus", "mp3", "vorbis", "flac"],
  ut = [...dt, ...ht],
  mt = ["webvtt"],
  pt = [
    { maxMacroblocks: 99, maxBitrate: 64e3, level: 10 },
    { maxMacroblocks: 396, maxBitrate: 192e3, level: 11 },
    { maxMacroblocks: 396, maxBitrate: 384e3, level: 12 },
    { maxMacroblocks: 396, maxBitrate: 768e3, level: 13 },
    { maxMacroblocks: 396, maxBitrate: 2e6, level: 20 },
    { maxMacroblocks: 792, maxBitrate: 4e6, level: 21 },
    { maxMacroblocks: 1620, maxBitrate: 4e6, level: 22 },
    { maxMacroblocks: 1620, maxBitrate: 1e7, level: 30 },
    { maxMacroblocks: 3600, maxBitrate: 14e6, level: 31 },
    { maxMacroblocks: 5120, maxBitrate: 2e7, level: 32 },
    { maxMacroblocks: 8192, maxBitrate: 2e7, level: 40 },
    { maxMacroblocks: 8192, maxBitrate: 5e7, level: 41 },
    { maxMacroblocks: 8704, maxBitrate: 5e7, level: 42 },
    { maxMacroblocks: 22080, maxBitrate: 135e6, level: 50 },
    { maxMacroblocks: 36864, maxBitrate: 24e7, level: 51 },
    { maxMacroblocks: 36864, maxBitrate: 24e7, level: 52 },
    { maxMacroblocks: 139264, maxBitrate: 24e7, level: 60 },
    { maxMacroblocks: 139264, maxBitrate: 48e7, level: 61 },
    { maxMacroblocks: 139264, maxBitrate: 8e8, level: 62 },
  ],
  ft = [
    { maxPictureSize: 36864, maxBitrate: 128e3, tier: "L", level: 30 },
    { maxPictureSize: 122880, maxBitrate: 15e5, tier: "L", level: 60 },
    { maxPictureSize: 245760, maxBitrate: 3e6, tier: "L", level: 63 },
    { maxPictureSize: 552960, maxBitrate: 6e6, tier: "L", level: 90 },
    { maxPictureSize: 983040, maxBitrate: 1e7, tier: "L", level: 93 },
    { maxPictureSize: 2228224, maxBitrate: 12e6, tier: "L", level: 120 },
    { maxPictureSize: 2228224, maxBitrate: 3e7, tier: "H", level: 120 },
    { maxPictureSize: 2228224, maxBitrate: 2e7, tier: "L", level: 123 },
    { maxPictureSize: 2228224, maxBitrate: 5e7, tier: "H", level: 123 },
    { maxPictureSize: 8912896, maxBitrate: 25e6, tier: "L", level: 150 },
    { maxPictureSize: 8912896, maxBitrate: 1e8, tier: "H", level: 150 },
    { maxPictureSize: 8912896, maxBitrate: 4e7, tier: "L", level: 153 },
    { maxPictureSize: 8912896, maxBitrate: 16e7, tier: "H", level: 153 },
    { maxPictureSize: 8912896, maxBitrate: 6e7, tier: "L", level: 156 },
    { maxPictureSize: 8912896, maxBitrate: 24e7, tier: "H", level: 156 },
    { maxPictureSize: 35651584, maxBitrate: 6e7, tier: "L", level: 180 },
    { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "H", level: 180 },
    { maxPictureSize: 35651584, maxBitrate: 12e7, tier: "L", level: 183 },
    { maxPictureSize: 35651584, maxBitrate: 48e7, tier: "H", level: 183 },
    { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "L", level: 186 },
    { maxPictureSize: 35651584, maxBitrate: 8e8, tier: "H", level: 186 },
  ],
  gt = [
    { maxPictureSize: 36864, maxBitrate: 2e5, level: 10 },
    { maxPictureSize: 73728, maxBitrate: 8e5, level: 11 },
    { maxPictureSize: 122880, maxBitrate: 18e5, level: 20 },
    { maxPictureSize: 245760, maxBitrate: 36e5, level: 21 },
    { maxPictureSize: 552960, maxBitrate: 72e5, level: 30 },
    { maxPictureSize: 983040, maxBitrate: 12e6, level: 31 },
    { maxPictureSize: 2228224, maxBitrate: 18e6, level: 40 },
    { maxPictureSize: 2228224, maxBitrate: 3e7, level: 41 },
    { maxPictureSize: 8912896, maxBitrate: 6e7, level: 50 },
    { maxPictureSize: 8912896, maxBitrate: 12e7, level: 51 },
    { maxPictureSize: 8912896, maxBitrate: 18e7, level: 52 },
    { maxPictureSize: 35651584, maxBitrate: 18e7, level: 60 },
    { maxPictureSize: 35651584, maxBitrate: 24e7, level: 61 },
    { maxPictureSize: 35651584, maxBitrate: 48e7, level: 62 },
  ],
  kt = [
    { maxPictureSize: 147456, maxBitrate: 15e5, tier: "M", level: 0 },
    { maxPictureSize: 278784, maxBitrate: 3e6, tier: "M", level: 1 },
    { maxPictureSize: 665856, maxBitrate: 6e6, tier: "M", level: 4 },
    { maxPictureSize: 1065024, maxBitrate: 1e7, tier: "M", level: 5 },
    { maxPictureSize: 2359296, maxBitrate: 12e6, tier: "M", level: 8 },
    { maxPictureSize: 2359296, maxBitrate: 3e7, tier: "H", level: 8 },
    { maxPictureSize: 2359296, maxBitrate: 2e7, tier: "M", level: 9 },
    { maxPictureSize: 2359296, maxBitrate: 5e7, tier: "H", level: 9 },
    { maxPictureSize: 8912896, maxBitrate: 3e7, tier: "M", level: 12 },
    { maxPictureSize: 8912896, maxBitrate: 1e8, tier: "H", level: 12 },
    { maxPictureSize: 8912896, maxBitrate: 4e7, tier: "M", level: 13 },
    { maxPictureSize: 8912896, maxBitrate: 16e7, tier: "H", level: 13 },
    { maxPictureSize: 8912896, maxBitrate: 6e7, tier: "M", level: 14 },
    { maxPictureSize: 8912896, maxBitrate: 24e7, tier: "H", level: 14 },
    { maxPictureSize: 35651584, maxBitrate: 6e7, tier: "M", level: 15 },
    { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "H", level: 15 },
    { maxPictureSize: 35651584, maxBitrate: 6e7, tier: "M", level: 16 },
    { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "H", level: 16 },
    { maxPictureSize: 35651584, maxBitrate: 1e8, tier: "M", level: 17 },
    { maxPictureSize: 35651584, maxBitrate: 48e7, tier: "H", level: 17 },
    { maxPictureSize: 35651584, maxBitrate: 16e7, tier: "M", level: 18 },
    { maxPictureSize: 35651584, maxBitrate: 8e8, tier: "H", level: 18 },
    { maxPictureSize: 35651584, maxBitrate: 16e7, tier: "M", level: 19 },
    { maxPictureSize: 35651584, maxBitrate: 8e8, tier: "H", level: 19 },
  ],
  yt = ".01.01.01.01.00",
  wt = ".0.110.01.01.01.0",
  bt = (e, t, i, r) => {
    if ("avc" === e) {
      const e = 100,
        a = Math.ceil(t / 16) * Math.ceil(i / 16),
        s =
          pt.find((e) => a <= e.maxMacroblocks && r <= e.maxBitrate) ?? ae(pt),
        n = s ? s.level : 0;
      return `avc1.${e.toString(16).padStart(2, "0")}${"00"}${n.toString(16).padStart(2, "0")}`;
    }
    if ("hevc" === e) {
      const e = "",
        a = 1,
        s = "6",
        n = t * i,
        o =
          ft.find((e) => n <= e.maxPictureSize && r <= e.maxBitrate) ?? ae(ft),
        c = "B0";
      return `hev1.${e}${a}.${s}.${o.tier}${o.level}.${c}`;
    }
    if ("vp8" === e) return "vp8";
    if ("vp9" === e) {
      const e = t * i,
        a = "08";
      return `vp09.${"00"}.${(gt.find((t) => e <= t.maxPictureSize && r <= t.maxBitrate) ?? ae(gt)).level.toString().padStart(2, "0")}.${a}`;
    }
    if ("av1" === e) {
      const e = 0,
        a = t * i,
        s =
          kt.find((e) => a <= e.maxPictureSize && r <= e.maxBitrate) ?? ae(kt),
        n = "08";
      return `av01.${e}.${s.level.toString().padStart(2, "0")}${s.tier}.${n}`;
    }
    throw new TypeError(`Unhandled codec '${e}'.`);
  },
  Tt = (e) => {
    const t = e.split(".");
    return [
      1,
      1,
      Number(t[1]),
      2,
      1,
      Number(t[2]),
      3,
      1,
      Number(t[3]),
      4,
      1,
      t[4] ? Number(t[4]) : 1,
    ];
  },
  Ct = (e) => {
    const t = e.split("."),
      i = Number(t[1]),
      r = t[2];
    return [
      129,
      (i << 5) + Number(r.slice(0, -1)),
      (("H" === r.slice(-1) ? 1 : 0) << 7) +
        ((8 === Number(t[3]) ? 0 : 1) << 6) +
        0 +
        ((t[4] ? Number(t[4]) : 0) << 4) +
        ((t[5] ? Number(t[5][0]) : 1) << 3) +
        ((t[5] ? Number(t[5][1]) : 1) << 2) +
        (t[5] ? Number(t[5][2]) : 0),
      0,
    ];
  },
  St = (e) => {
    const {
      codec: t,
      codecDescription: i,
      colorSpace: r,
      avcCodecInfo: a,
      hevcCodecInfo: s,
      vp9CodecInfo: n,
      av1CodecInfo: o,
    } = e;
    if ("avc" === t) {
      if ((ie(null !== e.avcType), a)) {
        const t = new Uint8Array([
          a.avcProfileIndication,
          a.profileCompatibility,
          a.avcLevelIndication,
        ]);
        return `avc${e.avcType}.${Se(t)}`;
      }
      if (!i || i.byteLength < 4)
        throw new TypeError(
          "AVC decoder description is not provided or is not at least 4 bytes long.",
        );
      return `avc${e.avcType}.${Se(i.subarray(1, 4))}`;
    }
    if ("hevc" === t) {
      let e, t, r, a, n, o;
      if (s)
        ((e = s.generalProfileSpace),
          (t = s.generalProfileIdc),
          (r = ve(s.generalProfileCompatibilityFlags)),
          (a = s.generalTierFlag),
          (n = s.generalLevelIdc),
          (o = [...s.generalConstraintIndicatorFlags]));
      else {
        if (!i || i.byteLength < 23)
          throw new TypeError(
            "HEVC decoder description is not provided or is not at least 23 bytes long.",
          );
        const s = he(i),
          c = s.getUint8(1);
        ((e = (c >> 6) & 3),
          (t = 31 & c),
          (r = ve(s.getUint32(2))),
          (a = (c >> 5) & 1),
          (n = s.getUint8(12)),
          (o = []));
        for (let e = 0; e < 6; e++) o.push(s.getUint8(6 + e));
      }
      let c = "hev1.";
      for (
        c += ["", "A", "B", "C"][e] + t,
          c += ".",
          c += r.toString(16).toUpperCase(),
          c += ".",
          c += 0 === a ? "L" : "H",
          c += n;
        o.length > 0 && 0 === o[o.length - 1];

      )
        o.pop();
      return (
        o.length > 0 &&
          ((c += "."),
          (c += o.map((e) => e.toString(16).toUpperCase()).join("."))),
        c
      );
    }
    if ("vp8" === t) return "vp8";
    if ("vp9" === t) {
      if (!n) {
        const t = e.width * e.height;
        let i = ae(gt).level;
        for (const e of gt)
          if (t <= e.maxPictureSize) {
            i = e.level;
            break;
          }
        return `vp09.00.${i.toString().padStart(2, "0")}.08`;
      }
      let t = `vp09.${n.profile.toString().padStart(2, "0")}.${n.level.toString().padStart(2, "0")}.${n.bitDepth.toString().padStart(2, "0")}.${n.chromaSubsampling.toString().padStart(2, "0")}`;
      return (
        (t += `.${n.colourPrimaries.toString().padStart(2, "0")}.${n.transferCharacteristics.toString().padStart(2, "0")}.${n.matrixCoefficients.toString().padStart(2, "0")}.${n.videoFullRangeFlag.toString().padStart(2, "0")}`),
        t.endsWith(yt) && (t = t.slice(0, -15)),
        t
      );
    }
    if ("av1" === t) {
      if (!o) {
        const t = e.width * e.height;
        let i = ae(gt).level;
        for (const e of gt)
          if (t <= e.maxPictureSize) {
            i = e.level;
            break;
          }
        return `av01.0.${i.toString().padStart(2, "0")}M.08`;
      }
      const t = o.profile,
        i = o.level.toString().padStart(2, "0"),
        a = o.tier ? "H" : "M",
        s = o.bitDepth.toString().padStart(2, "0"),
        n = o.monochrome ? "1" : "0",
        c =
          100 * o.chromaSubsamplingX +
          10 * o.chromaSubsamplingY +
          1 *
            (o.chromaSubsamplingX && o.chromaSubsamplingY
              ? o.chromaSamplePosition
              : 0),
        l = r?.primaries ? pe[r.primaries] : 1,
        h = r?.transfer ? ge[r.transfer] : 1,
        d = r?.matrix ? ye[r.matrix] : 1,
        u = r?.fullRange ? 1 : 0;
      let m = `av01.${t}.${i}${a}.${s}`;
      return (
        (m += `.${n}.${c.toString().padStart(3, "0")}`),
        (m += `.${l.toString().padStart(2, "0")}`),
        (m += `.${h.toString().padStart(2, "0")}`),
        (m += `.${d.toString().padStart(2, "0")}`),
        (m += `.${u}`),
        m.endsWith(wt) && (m = m.slice(0, -17)),
        m
      );
    }
    throw new TypeError(`Unhandled codec '${t}'.`);
  },
  vt = (e, t, i) => {
    if ("aac" === e)
      return t >= 2 && i <= 24e3
        ? "mp4a.40.29"
        : i <= 24e3
          ? "mp4a.40.5"
          : "mp4a.40.2";
    if ("mp3" === e) return "mp3";
    if ("opus" === e) return "opus";
    if ("vorbis" === e) return "vorbis";
    if ("flac" === e) return "flac";
    if (ht.includes(e)) return e;
    throw new TypeError(`Unhandled codec '${e}'.`);
  },
  xt = (e) => {
    const { codec: t, codecDescription: i, aacCodecInfo: r } = e;
    if ("aac" === t) {
      if (!r) throw new TypeError("AAC codec info must be provided.");
      if (r.isMpeg2) return "mp4a.67";
      return `mp4a.40.${It(i).objectType}`;
    }
    if ("mp3" === t) return "mp3";
    if ("opus" === t) return "opus";
    if ("vorbis" === t) return "vorbis";
    if ("flac" === t) return "flac";
    if (t && ht.includes(t)) return t;
    throw new TypeError(`Unhandled codec '${t}'.`);
  },
  Pt = [
    96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3,
    7350,
  ],
  Et = [-1, 1, 2, 3, 4, 5, 6, 8],
  It = (e) => {
    if (!e || e.byteLength < 2)
      throw new TypeError("AAC description must be at least 2 bytes long.");
    const t = new ne(e);
    let i = t.readBits(5);
    31 === i && (i = 32 + t.readBits(6));
    const r = t.readBits(4);
    let a = null;
    15 === r ? (a = t.readBits(24)) : r < Pt.length && (a = Pt[r]);
    const s = t.readBits(4);
    let n = null;
    return (
      s >= 1 && s <= 7 && (n = Et[s]),
      {
        objectType: i,
        frequencyIndex: r,
        sampleRate: a,
        channelConfiguration: s,
        numberOfChannels: n,
      }
    );
  },
  _t = 48e3,
  At = /^pcm-([usf])(\d+)+(be)?$/,
  Ft = (e) => {
    if ((ie(ht.includes(e)), "ulaw" === e))
      return {
        dataType: "ulaw",
        sampleSize: 1,
        littleEndian: !0,
        silentValue: 255,
      };
    if ("alaw" === e)
      return {
        dataType: "alaw",
        sampleSize: 1,
        littleEndian: !0,
        silentValue: 213,
      };
    const t = At.exec(e);
    let i;
    (ie(t),
      (i = "u" === t[1] ? "unsigned" : "s" === t[1] ? "signed" : "float"));
    return {
      dataType: i,
      sampleSize: Number(t[2]) / 8,
      littleEndian: "be" !== t[3],
      silentValue: "pcm-u8" === e ? 128 : 0,
    };
  },
  Bt = (e) =>
    e.startsWith("avc1") || e.startsWith("avc3")
      ? "avc"
      : e.startsWith("hev1") || e.startsWith("hvc1")
        ? "hevc"
        : "vp8" === e
          ? "vp8"
          : e.startsWith("vp09")
            ? "vp9"
            : e.startsWith("av01")
              ? "av1"
              : e.startsWith("mp4a.40") || "mp4a.67" === e
                ? "aac"
                : "mp3" === e ||
                    "mp4a.69" === e ||
                    "mp4a.6B" === e ||
                    "mp4a.6b" === e
                  ? "mp3"
                  : "opus" === e
                    ? "opus"
                    : "vorbis" === e
                      ? "vorbis"
                      : "flac" === e
                        ? "flac"
                        : "ulaw" === e
                          ? "ulaw"
                          : "alaw" === e
                            ? "alaw"
                            : At.test(e)
                              ? e
                              : "webvtt" === e
                                ? "webvtt"
                                : null,
  Mt = ["avc1", "avc3", "hev1", "hvc1", "vp8", "vp09", "av01"],
  Dt = /^(avc1|avc3)\.[0-9a-fA-F]{6}$/,
  Ot =
    /^(hev1|hvc1)\.(?:[ABC]?\d+)\.[0-9a-fA-F]{1,8}\.[LH]\d+(?:\.[0-9a-fA-F]{1,2}){0,6}$/,
  Rt = /^vp09(?:\.\d{2}){3}(?:(?:\.\d{2}){5})?$/,
  zt = /^av01\.\d\.\d{2}[MH]\.\d{2}(?:\.\d\.\d{3}\.\d{2}\.\d{2}\.\d{2}\.\d)?$/,
  Nt = (e) => {
    if (!e) throw new TypeError("Video chunk metadata must be provided.");
    if ("object" != typeof e)
      throw new TypeError("Video chunk metadata must be an object.");
    if (!e.decoderConfig)
      throw new TypeError(
        "Video chunk metadata must include a decoder configuration.",
      );
    if ("object" != typeof e.decoderConfig)
      throw new TypeError(
        "Video chunk metadata decoder configuration must be an object.",
      );
    if ("string" != typeof e.decoderConfig.codec)
      throw new TypeError(
        "Video chunk metadata decoder configuration must specify a codec string.",
      );
    if (!Mt.some((t) => e.decoderConfig.codec.startsWith(t)))
      throw new TypeError(
        "Video chunk metadata decoder configuration codec string must be a valid video codec string as specified in the WebCodecs Codec Registry.",
      );
    if (
      !Number.isInteger(e.decoderConfig.codedWidth) ||
      e.decoderConfig.codedWidth <= 0
    )
      throw new TypeError(
        "Video chunk metadata decoder configuration must specify a valid codedWidth (positive integer).",
      );
    if (
      !Number.isInteger(e.decoderConfig.codedHeight) ||
      e.decoderConfig.codedHeight <= 0
    )
      throw new TypeError(
        "Video chunk metadata decoder configuration must specify a valid codedHeight (positive integer).",
      );
    if (
      void 0 !== e.decoderConfig.description &&
      !Te(e.decoderConfig.description)
    )
      throw new TypeError(
        "Video chunk metadata decoder configuration description, when defined, must be an ArrayBuffer or an ArrayBuffer view.",
      );
    if (void 0 !== e.decoderConfig.colorSpace) {
      const { colorSpace: t } = e.decoderConfig;
      if ("object" != typeof t)
        throw new TypeError(
          "Video chunk metadata decoder configuration colorSpace, when provided, must be an object.",
        );
      const i = Object.keys(pe);
      if (null != t.primaries && !i.includes(t.primaries))
        throw new TypeError(
          `Video chunk metadata decoder configuration colorSpace primaries, when defined, must be one of ${i.join(", ")}.`,
        );
      const r = Object.keys(ge);
      if (null != t.transfer && !r.includes(t.transfer))
        throw new TypeError(
          `Video chunk metadata decoder configuration colorSpace transfer, when defined, must be one of ${r.join(", ")}.`,
        );
      const a = Object.keys(ye);
      if (null != t.matrix && !a.includes(t.matrix))
        throw new TypeError(
          `Video chunk metadata decoder configuration colorSpace matrix, when defined, must be one of ${a.join(", ")}.`,
        );
      if (null != t.fullRange && "boolean" != typeof t.fullRange)
        throw new TypeError(
          "Video chunk metadata decoder configuration colorSpace fullRange, when defined, must be a boolean.",
        );
    }
    if (
      e.decoderConfig.codec.startsWith("avc1") ||
      e.decoderConfig.codec.startsWith("avc3")
    ) {
      if (!Dt.test(e.decoderConfig.codec))
        throw new TypeError(
          "Video chunk metadata decoder configuration codec string for AVC must be a valid AVC codec string as specified in Section 3.4 of RFC 6381.",
        );
    } else if (
      e.decoderConfig.codec.startsWith("hev1") ||
      e.decoderConfig.codec.startsWith("hvc1")
    ) {
      if (!Ot.test(e.decoderConfig.codec))
        throw new TypeError(
          "Video chunk metadata decoder configuration codec string for HEVC must be a valid HEVC codec string as specified in Section E.3 of ISO 14496-15.",
        );
    } else if (e.decoderConfig.codec.startsWith("vp8")) {
      if ("vp8" !== e.decoderConfig.codec)
        throw new TypeError(
          'Video chunk metadata decoder configuration codec string for VP8 must be "vp8".',
        );
    } else if (e.decoderConfig.codec.startsWith("vp09")) {
      if (!Rt.test(e.decoderConfig.codec))
        throw new TypeError(
          'Video chunk metadata decoder configuration codec string for VP9 must be a valid VP9 codec string as specified in Section "Codecs Parameter String" of https://www.webmproject.org/vp9/mp4/.',
        );
    } else if (
      e.decoderConfig.codec.startsWith("av01") &&
      !zt.test(e.decoderConfig.codec)
    )
      throw new TypeError(
        'Video chunk metadata decoder configuration codec string for AV1 must be a valid AV1 codec string as specified in Section "Codecs Parameter String" of https://aomediacodec.github.io/av1-isobmff/.',
      );
  },
  Ut = ["mp4a", "mp3", "opus", "vorbis", "flac", "ulaw", "alaw", "pcm"],
  Lt = (e) => {
    if (!e) throw new TypeError("Audio chunk metadata must be provided.");
    if ("object" != typeof e)
      throw new TypeError("Audio chunk metadata must be an object.");
    if (!e.decoderConfig)
      throw new TypeError(
        "Audio chunk metadata must include a decoder configuration.",
      );
    if ("object" != typeof e.decoderConfig)
      throw new TypeError(
        "Audio chunk metadata decoder configuration must be an object.",
      );
    if ("string" != typeof e.decoderConfig.codec)
      throw new TypeError(
        "Audio chunk metadata decoder configuration must specify a codec string.",
      );
    if (!Ut.some((t) => e.decoderConfig.codec.startsWith(t)))
      throw new TypeError(
        "Audio chunk metadata decoder configuration codec string must be a valid audio codec string as specified in the WebCodecs Codec Registry.",
      );
    if (
      !Number.isInteger(e.decoderConfig.sampleRate) ||
      e.decoderConfig.sampleRate <= 0
    )
      throw new TypeError(
        "Audio chunk metadata decoder configuration must specify a valid sampleRate (positive integer).",
      );
    if (
      !Number.isInteger(e.decoderConfig.numberOfChannels) ||
      e.decoderConfig.numberOfChannels <= 0
    )
      throw new TypeError(
        "Audio chunk metadata decoder configuration must specify a valid numberOfChannels (positive integer).",
      );
    if (
      void 0 !== e.decoderConfig.description &&
      !Te(e.decoderConfig.description)
    )
      throw new TypeError(
        "Audio chunk metadata decoder configuration description, when defined, must be an ArrayBuffer or an ArrayBuffer view.",
      );
    if (
      e.decoderConfig.codec.startsWith("mp4a") &&
      "mp4a.69" !== e.decoderConfig.codec &&
      "mp4a.6B" !== e.decoderConfig.codec &&
      "mp4a.6b" !== e.decoderConfig.codec
    ) {
      if (
        ![
          "mp4a.40.2",
          "mp4a.40.02",
          "mp4a.40.5",
          "mp4a.40.05",
          "mp4a.40.29",
          "mp4a.67",
        ].includes(e.decoderConfig.codec)
      )
        throw new TypeError(
          "Audio chunk metadata decoder configuration codec string for AAC must be a valid AAC codec string as specified in https://www.w3.org/TR/webcodecs-aac-codec-registration/.",
        );
      if (!e.decoderConfig.description)
        throw new TypeError(
          "Audio chunk metadata decoder configuration for AAC must include a description, which is expected to be an AudioSpecificConfig as specified in ISO 14496-3.",
        );
    } else if (
      e.decoderConfig.codec.startsWith("mp3") ||
      e.decoderConfig.codec.startsWith("mp4a")
    ) {
      if (
        "mp3" !== e.decoderConfig.codec &&
        "mp4a.69" !== e.decoderConfig.codec &&
        "mp4a.6B" !== e.decoderConfig.codec &&
        "mp4a.6b" !== e.decoderConfig.codec
      )
        throw new TypeError(
          'Audio chunk metadata decoder configuration codec string for MP3 must be "mp3", "mp4a.69" or "mp4a.6B".',
        );
    } else if (e.decoderConfig.codec.startsWith("opus")) {
      if ("opus" !== e.decoderConfig.codec)
        throw new TypeError(
          'Audio chunk metadata decoder configuration codec string for Opus must be "opus".',
        );
      if (
        e.decoderConfig.description &&
        e.decoderConfig.description.byteLength < 18
      )
        throw new TypeError(
          "Audio chunk metadata decoder configuration description, when specified, is expected to be an Identification Header as specified in Section 5.1 of RFC 7845.",
        );
    } else if (e.decoderConfig.codec.startsWith("vorbis")) {
      if ("vorbis" !== e.decoderConfig.codec)
        throw new TypeError(
          'Audio chunk metadata decoder configuration codec string for Vorbis must be "vorbis".',
        );
      if (!e.decoderConfig.description)
        throw new TypeError(
          "Audio chunk metadata decoder configuration for Vorbis must include a description, which is expected to adhere to the format described in https://www.w3.org/TR/webcodecs-vorbis-codec-registration/.",
        );
    } else if (e.decoderConfig.codec.startsWith("flac")) {
      if ("flac" !== e.decoderConfig.codec)
        throw new TypeError(
          'Audio chunk metadata decoder configuration codec string for FLAC must be "flac".',
        );
      const t = 42;
      if (
        !e.decoderConfig.description ||
        e.decoderConfig.description.byteLength < t
      )
        throw new TypeError(
          "Audio chunk metadata decoder configuration for FLAC must include a description, which is expected to adhere to the format described in https://www.w3.org/TR/webcodecs-flac-codec-registration/.",
        );
    } else if (
      (e.decoderConfig.codec.startsWith("pcm") ||
        e.decoderConfig.codec.startsWith("ulaw") ||
        e.decoderConfig.codec.startsWith("alaw")) &&
      !ht.includes(e.decoderConfig.codec)
    )
      throw new TypeError(
        `Audio chunk metadata decoder configuration codec string for PCM must be one of the supported PCM codecs (${ht.join(", ")}).`,
      );
  },
  Vt = (e) => {
    if (!e) throw new TypeError("Subtitle metadata must be provided.");
    if ("object" != typeof e)
      throw new TypeError("Subtitle metadata must be an object.");
    if (!e.config)
      throw new TypeError("Subtitle metadata must include a config object.");
    if ("object" != typeof e.config)
      throw new TypeError("Subtitle metadata config must be an object.");
    if ("string" != typeof e.config.description)
      throw new TypeError(
        "Subtitle metadata config description must be a string.",
      );
  };
class Wt {
  constructor(e) {
    ((this.mutex = new Ce()),
      (this.firstMediaStreamTimestamp = null),
      (this.trackTimestampInfo = new WeakMap()),
      (this.output = e));
  }
  onTrackClose(e) {}
  validateAndNormalizeTimestamp(e, t, i) {
    t += e.source._timestampOffset;
    let r = this.trackTimestampInfo.get(e);
    if (!r) {
      if (!i) throw new Error("First packet must be a key packet.");
      ((r = { maxTimestamp: t, maxTimestampBeforeLastKeyPacket: t }),
        this.trackTimestampInfo.set(e, r));
    }
    if (t < 0) throw new Error(`Timestamps must be non-negative (got ${t}s).`);
    if (
      (i && (r.maxTimestampBeforeLastKeyPacket = r.maxTimestamp),
      t < r.maxTimestampBeforeLastKeyPacket)
    )
      throw new Error(
        `Timestamps cannot be smaller than the largest timestamp of the previous GOP (a GOP begins with a key packet and ends right before the next key packet). Got ${t}s, but largest timestamp is ${r.maxTimestampBeforeLastKeyPacket}s.`,
      );
    return ((r.maxTimestamp = Math.max(r.maxTimestamp, t)), t);
  }
}
var Ht, $t;
(!(function (e) {
  ((e[(e.IDR = 5)] = "IDR"),
    (e[(e.SPS = 7)] = "SPS"),
    (e[(e.PPS = 8)] = "PPS"),
    (e[(e.SPS_EXT = 13)] = "SPS_EXT"));
})(Ht || (Ht = {})),
  (function (e) {
    ((e[(e.RASL_N = 8)] = "RASL_N"),
      (e[(e.RASL_R = 9)] = "RASL_R"),
      (e[(e.BLA_W_LP = 16)] = "BLA_W_LP"),
      (e[(e.RSV_IRAP_VCL23 = 23)] = "RSV_IRAP_VCL23"),
      (e[(e.VPS_NUT = 32)] = "VPS_NUT"),
      (e[(e.SPS_NUT = 33)] = "SPS_NUT"),
      (e[(e.PPS_NUT = 34)] = "PPS_NUT"),
      (e[(e.PREFIX_SEI_NUT = 39)] = "PREFIX_SEI_NUT"),
      (e[(e.SUFFIX_SEI_NUT = 40)] = "SUFFIX_SEI_NUT"));
  })($t || ($t = {})));
const jt = (e) => {
    const t = [];
    let i = 0;
    for (; i < e.length; ) {
      let r = -1,
        a = 0;
      for (let t = i; t < e.length - 3; t++) {
        if (0 === e[t] && 0 === e[t + 1] && 1 === e[t + 2]) {
          ((r = t), (a = 3));
          break;
        }
        if (
          t < e.length - 4 &&
          0 === e[t] &&
          0 === e[t + 1] &&
          0 === e[t + 2] &&
          1 === e[t + 3]
        ) {
          ((r = t), (a = 4));
          break;
        }
      }
      if (-1 === r) break;
      if (i > 0 && r > i) {
        const a = e.subarray(i, r);
        a.length > 0 && t.push(a);
      }
      i = r + a;
    }
    if (i < e.length) {
      const r = e.subarray(i);
      r.length > 0 && t.push(r);
    }
    return t;
  },
  qt = (e, t) => {
    const i = [];
    let r = 0;
    const a = new DataView(e.buffer, e.byteOffset, e.byteLength);
    for (; r + t <= e.length; ) {
      let s;
      (1 === t
        ? (s = a.getUint8(r))
        : 2 === t
          ? (s = a.getUint16(r, !1))
          : 3 === t
            ? (s = Be(a, r, !1))
            : 4 === t
              ? (s = a.getUint32(r, !1))
              : (Fe(t), ie(!1)),
        (r += t));
      const n = e.subarray(r, r + s);
      (i.push(n), (r += s));
    }
    return i;
  },
  Kt = (e) => {
    const t = [],
      i = e.length;
    for (let r = 0; r < i; r++)
      r + 2 < i && 0 === e[r] && 0 === e[r + 1] && 3 === e[r + 2]
        ? (t.push(0, 0), (r += 2))
        : t.push(e[r]);
    return new Uint8Array(t);
  },
  Qt = (e) => 31 & e[0],
  Xt = (e) => {
    try {
      const t = jt(e),
        i = t.filter((e) => Qt(e) === Ht.SPS),
        r = t.filter((e) => Qt(e) === Ht.PPS),
        a = t.filter((e) => Qt(e) === Ht.SPS_EXT);
      if (0 === i.length) return null;
      if (0 === r.length) return null;
      const s = i[0],
        n = Gt(s);
      ie(null !== n);
      const o =
        100 === n.profileIdc ||
        110 === n.profileIdc ||
        122 === n.profileIdc ||
        144 === n.profileIdc;
      return {
        configurationVersion: 1,
        avcProfileIndication: n.profileIdc,
        profileCompatibility: n.constraintFlags,
        avcLevelIndication: n.levelIdc,
        lengthSizeMinusOne: 3,
        sequenceParameterSets: i,
        pictureParameterSets: r,
        chromaFormat: o ? n.chromaFormatIdc : null,
        bitDepthLumaMinus8: o ? n.bitDepthLumaMinus8 : null,
        bitDepthChromaMinus8: o ? n.bitDepthChromaMinus8 : null,
        sequenceParameterSetExt: o ? a : null,
      };
    } catch (t) {
      return (
        console.error("Error building AVC Decoder Configuration Record:", t),
        null
      );
    }
  },
  Gt = (e) => {
    try {
      const t = new ne(Kt(e));
      (t.skipBits(1), t.skipBits(2));
      if (7 !== t.readBits(5)) return null;
      const i = t.readAlignedByte(),
        r = t.readAlignedByte(),
        a = t.readAlignedByte();
      oe(t);
      let s = null,
        n = null,
        o = null;
      if (
        100 === i ||
        110 === i ||
        122 === i ||
        244 === i ||
        44 === i ||
        83 === i ||
        86 === i ||
        118 === i ||
        128 === i
      ) {
        ((s = oe(t)),
          3 === s && t.skipBits(1),
          (n = oe(t)),
          (o = oe(t)),
          t.skipBits(1));
        if (t.readBits(1))
          for (let e = 0; e < (3 !== s ? 8 : 12); e++) {
            if (t.readBits(1)) {
              const i = e < 6 ? 16 : 64;
              let r = 8,
                a = 8;
              for (let e = 0; e < i; e++) {
                if (0 !== a) {
                  a = (r + ce(t) + 256) % 256;
                }
                r = 0 === a ? r : a;
              }
            }
          }
      }
      oe(t);
      const c = oe(t);
      if (0 === c) oe(t);
      else if (1 === c) {
        (t.skipBits(1), ce(t), ce(t));
        const e = oe(t);
        for (let i = 0; i < e; i++) ce(t);
      }
      (oe(t), t.skipBits(1), oe(t), oe(t));
      return {
        profileIdc: i,
        constraintFlags: r,
        levelIdc: a,
        frameMbsOnlyFlag: t.readBits(1),
        chromaFormatIdc: s,
        bitDepthLumaMinus8: n,
        bitDepthChromaMinus8: o,
      };
    } catch (t) {
      return (console.error("Error parsing AVC SPS:", t), null);
    }
  },
  Yt = (e, t) => {
    if (t.description) {
      const i = 3 & le(t.description)[21];
      return qt(e, i + 1);
    }
    return jt(e);
  },
  Jt = (e) => (e[0] >> 1) & 63,
  Zt = (e) => {
    try {
      const t = jt(e),
        i = t.filter((e) => Jt(e) === $t.VPS_NUT),
        r = t.filter((e) => Jt(e) === $t.SPS_NUT),
        a = t.filter((e) => Jt(e) === $t.PPS_NUT),
        s = t.filter(
          (e) => Jt(e) === $t.PREFIX_SEI_NUT || Jt(e) === $t.SUFFIX_SEI_NUT,
        );
      if (0 === r.length || 0 === a.length) return null;
      const n = r[0],
        o = new ne(Kt(n));
      (o.skipBits(16), o.readBits(4));
      const c = o.readBits(3),
        l = o.readBits(1),
        {
          general_profile_space: h,
          general_tier_flag: d,
          general_profile_idc: u,
          general_profile_compatibility_flags: m,
          general_constraint_indicator_flags: p,
          general_level_idc: f,
        } = ei(o, c);
      oe(o);
      const g = oe(o);
      (3 === g && o.skipBits(1),
        oe(o),
        oe(o),
        o.readBits(1) && (oe(o), oe(o), oe(o), oe(o)));
      const k = oe(o),
        y = oe(o);
      oe(o);
      const w = o.readBits(1);
      for (let e = w ? 0 : c; e <= c; e++) (oe(o), oe(o), oe(o));
      (oe(o),
        oe(o),
        oe(o),
        oe(o),
        oe(o),
        oe(o),
        o.readBits(1) && o.readBits(1) && ti(o),
        o.skipBits(1),
        o.skipBits(1),
        o.readBits(1) &&
          (o.skipBits(4), o.skipBits(4), oe(o), oe(o), o.skipBits(1)));
      const b = oe(o);
      if ((ii(o, b), o.readBits(1))) {
        const e = oe(o);
        for (let t = 0; t < e; t++) (oe(o), o.skipBits(1));
      }
      (o.skipBits(1), o.skipBits(1));
      let T = 0;
      o.readBits(1) && (T = ai(o, c));
      let C = 0;
      if (a.length > 0) {
        const e = a[0],
          t = new ne(Kt(e));
        (t.skipBits(16),
          oe(t),
          oe(t),
          t.skipBits(1),
          t.skipBits(1),
          t.skipBits(3),
          t.skipBits(1),
          t.skipBits(1),
          oe(t),
          oe(t),
          ce(t),
          t.skipBits(1),
          t.skipBits(1),
          t.readBits(1) && oe(t),
          ce(t),
          ce(t),
          t.skipBits(1),
          t.skipBits(1),
          t.skipBits(1),
          t.skipBits(1));
        const i = t.readBits(1),
          r = t.readBits(1);
        C = i || r ? (i && !r ? 2 : !i && r ? 3 : 0) : 0;
      }
      const S = [
        ...(i.length
          ? [{ arrayCompleteness: 1, nalUnitType: $t.VPS_NUT, nalUnits: i }]
          : []),
        ...(r.length
          ? [{ arrayCompleteness: 1, nalUnitType: $t.SPS_NUT, nalUnits: r }]
          : []),
        ...(a.length
          ? [{ arrayCompleteness: 1, nalUnitType: $t.PPS_NUT, nalUnits: a }]
          : []),
        ...(s.length
          ? [{ arrayCompleteness: 1, nalUnitType: Jt(s[0]), nalUnits: s }]
          : []),
      ];
      return {
        configurationVersion: 1,
        generalProfileSpace: h,
        generalTierFlag: d,
        generalProfileIdc: u,
        generalProfileCompatibilityFlags: m,
        generalConstraintIndicatorFlags: p,
        generalLevelIdc: f,
        minSpatialSegmentationIdc: T,
        parallelismType: C,
        chromaFormatIdc: g,
        bitDepthLumaMinus8: k,
        bitDepthChromaMinus8: y,
        avgFrameRate: 0,
        constantFrameRate: 0,
        numTemporalLayers: c + 1,
        temporalIdNested: l,
        lengthSizeMinusOne: 3,
        arrays: S,
      };
    } catch (t) {
      return (
        console.error("Error building HEVC Decoder Configuration Record:", t),
        null
      );
    }
  },
  ei = (e, t) => {
    const i = e.readBits(2),
      r = e.readBits(1),
      a = e.readBits(5);
    let s = 0;
    for (let h = 0; h < 32; h++) s = (s << 1) | e.readBits(1);
    const n = new Uint8Array(6);
    for (let h = 0; h < 6; h++) n[h] = e.readBits(8);
    const o = e.readBits(8),
      c = [],
      l = [];
    for (let h = 0; h < t; h++) (c.push(e.readBits(1)), l.push(e.readBits(1)));
    if (t > 0) for (let h = t; h < 8; h++) e.skipBits(2);
    for (let h = 0; h < t; h++) (c[h] && e.skipBits(88), l[h] && e.skipBits(8));
    return {
      general_profile_space: i,
      general_tier_flag: r,
      general_profile_idc: a,
      general_profile_compatibility_flags: s,
      general_constraint_indicator_flags: n,
      general_level_idc: o,
    };
  },
  ti = (e) => {
    for (let t = 0; t < 4; t++)
      for (let i = 0; i < (3 === t ? 2 : 6); i++) {
        if (e.readBits(1)) {
          const i = Math.min(64, 1 << (4 + (t << 1)));
          t > 1 && ce(e);
          for (let t = 0; t < i; t++) ce(e);
        } else oe(e);
      }
  },
  ii = (e, t) => {
    const i = [];
    for (let r = 0; r < t; r++) i[r] = ri(e, r, t, i);
  },
  ri = (e, t, i, r) => {
    let a = 0,
      s = 0,
      n = 0;
    if ((0 !== t && (s = e.readBits(1)), s)) {
      if (t === i) {
        n = t - (oe(e) + 1);
      } else n = t - 1;
      (e.readBits(1), oe(e));
      const s = r[n] ?? 0;
      for (let t = 0; t <= s; t++) {
        e.readBits(1) || e.readBits(1);
      }
      a = r[n];
    } else {
      const t = oe(e),
        i = oe(e);
      for (let r = 0; r < t; r++) (oe(e), e.readBits(1));
      for (let r = 0; r < i; r++) (oe(e), e.readBits(1));
      a = t + i;
    }
    return a;
  },
  ai = (e, t) => {
    if (e.readBits(1)) {
      255 === e.readBits(8) && (e.readBits(16), e.readBits(16));
    }
    if (
      (e.readBits(1) && e.readBits(1),
      e.readBits(1) &&
        (e.readBits(3),
        e.readBits(1),
        e.readBits(1) && (e.readBits(8), e.readBits(8), e.readBits(8))),
      e.readBits(1) && (oe(e), oe(e)),
      e.readBits(1),
      e.readBits(1),
      e.readBits(1),
      e.readBits(1) && (oe(e), oe(e), oe(e), oe(e)),
      e.readBits(1) &&
        (e.readBits(32),
        e.readBits(32),
        e.readBits(1) && oe(e),
        e.readBits(1) && si(e, !0, t)),
      e.readBits(1))
    ) {
      (e.readBits(1), e.readBits(1), e.readBits(1));
      const t = oe(e);
      return (oe(e), oe(e), oe(e), oe(e), t);
    }
    return 0;
  },
  si = (e, t, i) => {
    let r = !1,
      a = !1,
      s = !1;
    ((r = 1 === e.readBits(1)),
      (a = 1 === e.readBits(1)),
      (r || a) &&
        ((s = 1 === e.readBits(1)),
        s && (e.readBits(8), e.readBits(5), e.readBits(1), e.readBits(5)),
        e.readBits(4),
        e.readBits(4),
        s && e.readBits(4),
        e.readBits(5),
        e.readBits(5),
        e.readBits(5)));
    for (let n = 0; n <= i; n++) {
      let t = !0;
      1 === e.readBits(1) || (t = 1 === e.readBits(1));
      let i = !1;
      t ? oe(e) : (i = 1 === e.readBits(1));
      let n = 1;
      if (!i) {
        n = oe(e) + 1;
      }
      (r && ni(e, n, s), a && ni(e, n, s));
    }
  },
  ni = (e, t, i) => {
    for (let r = 0; r < t; r++)
      (oe(e), oe(e), i && (oe(e), oe(e)), e.readBits(1));
  },
  oi = (e) => {
    const t = new ne(e);
    if (2 !== t.readBits(2)) return null;
    const i = t.readBits(1),
      r = (t.readBits(1) << 1) + i;
    3 === r && t.skipBits(1);
    if (1 === t.readBits(1)) return null;
    if (0 !== t.readBits(1)) return null;
    t.skipBits(2);
    if (4817730 !== t.readBits(24)) return null;
    let a = 8;
    if (r >= 2) {
      a = t.readBits(1) ? 12 : 10;
    }
    const s = t.readBits(3);
    let n = 0,
      o = 0;
    if (7 !== s) {
      if (((o = t.readBits(1)), 1 === r || 3 === r)) {
        const e = t.readBits(1),
          i = t.readBits(1);
        ((n = e || i ? (e && !i ? 2 : 1) : 3), t.skipBits(1));
      } else n = 1;
    } else ((n = 3), (o = 1));
    const c = (t.readBits(16) + 1) * (t.readBits(16) + 1);
    let l = ae(gt).level;
    for (const h of gt)
      if (c <= h.maxPictureSize) {
        l = h.level;
        break;
      }
    return {
      profile: r,
      level: l,
      bitDepth: a,
      chromaSubsampling: n,
      videoFullRangeFlag: o,
      colourPrimaries: 2 === s ? 1 : 1 === s ? 6 : 2,
      transferCharacteristics: 2 === s ? 1 : 1 === s ? 6 : 2,
      matrixCoefficients: 7 === s ? 0 : 2 === s ? 1 : 1 === s ? 6 : 2,
    };
  },
  ci = function* (e) {
    const t = new ne(e),
      i = () => {
        let e = 0;
        for (let i = 0; i < 8; i++) {
          const r = t.readAlignedByte();
          if (((e |= (127 & r) << (7 * i)), !(128 & r))) break;
          if (7 === i && 128 & r) return null;
        }
        return e >= 2 ** 32 - 1 ? null : e;
      };
    for (; t.getBitsLeft() >= 8; ) {
      t.skipBits(1);
      const r = t.readBits(4),
        a = t.readBits(1),
        s = t.readBits(1);
      let n;
      if ((t.skipBits(1), a && t.skipBits(8), s)) {
        const e = i();
        if (null === e) return;
        n = e;
      } else n = Math.floor(t.getBitsLeft() / 8);
      (ie(t.pos % 8 == 0),
        yield { type: r, data: e.subarray(t.pos / 8, t.pos / 8 + n) },
        t.skipBits(8 * n));
    }
  },
  li = (e) => {
    for (const { type: t, data: i } of ci(e)) {
      if (1 !== t) continue;
      const e = new ne(i),
        r = e.readBits(3);
      e.readBits(1);
      let a = 0,
        s = 0,
        n = 0;
      if (e.readBits(1)) a = e.readBits(5);
      else {
        if (e.readBits(1)) {
          (e.skipBits(32), e.skipBits(32));
          if (e.readBits(1)) return null;
        }
        const t = e.readBits(1);
        t &&
          ((n = e.readBits(5)), e.skipBits(32), e.skipBits(5), e.skipBits(5));
        const i = e.readBits(5);
        for (let r = 0; r <= i; r++) {
          e.skipBits(12);
          const i = e.readBits(5);
          if ((0 === r && (a = i), i > 7)) {
            const t = e.readBits(1);
            0 === r && (s = t);
          }
          if (t) {
            if (e.readBits(1)) {
              const t = n + 1;
              (e.skipBits(t), e.skipBits(t), e.skipBits(1));
            }
          }
          e.readBits(1) && e.skipBits(4);
        }
      }
      const o = e.readBits(1);
      let c = 8;
      if (2 === r && o) {
        c = e.readBits(1) ? 12 : 10;
      } else r <= 2 && (c = o ? 10 : 8);
      let l = 0;
      1 !== r && (l = e.readBits(1));
      let h = 1,
        d = 1,
        u = 0;
      return (
        l ||
          (0 === r
            ? ((h = 1), (d = 1))
            : 1 === r
              ? ((h = 0), (d = 0))
              : 12 === c && ((h = e.readBits(1)), h && (d = e.readBits(1))),
          h && d && (u = e.readBits(2))),
        {
          profile: r,
          level: a,
          tier: s,
          bitDepth: c,
          monochrome: l,
          chromaSubsamplingX: h,
          chromaSubsamplingY: d,
          chromaSamplePosition: u,
        }
      );
    }
    return null;
  },
  hi = (e) => {
    const t = he(e),
      i = t.getUint8(9),
      r = t.getUint16(10, !0),
      a = t.getUint32(12, !0),
      s = t.getInt16(16, !0),
      n = t.getUint8(18);
    let o = null;
    return (
      n && (o = e.subarray(19, 21 + i)),
      {
        outputChannelCount: i,
        preSkip: r,
        inputSampleRate: a,
        outputGain: s,
        channelMappingFamily: n,
        channelMappingTable: o,
      }
    );
  },
  di = [
    480, 960, 1920, 2880, 480, 960, 1920, 2880, 480, 960, 1920, 2880, 480, 960,
    480, 960, 120, 240, 480, 960, 120, 240, 480, 960, 120, 240, 480, 960, 120,
    240, 480, 960,
  ],
  ui = (e) => {
    if (e.length < 7) throw new Error("Setup header is too short.");
    if (5 !== e[0]) throw new Error("Wrong packet type in Setup header.");
    if ("vorbis" !== String.fromCharCode(...e.slice(1, 7)))
      throw new Error("Invalid packet signature in Setup header.");
    const t = e.length,
      i = new Uint8Array(t);
    for (let h = 0; h < t; h++) i[h] = e[t - 1 - h];
    const r = new ne(i);
    let a = 0;
    for (; r.getBitsLeft() > 97; )
      if (1 === r.readBits(1)) {
        a = r.pos;
        break;
      }
    if (0 === a)
      throw new Error("Invalid Setup header: framing bit not found.");
    let s = 0,
      n = !1,
      o = 0;
    for (; r.getBitsLeft() >= 97; ) {
      const e = r.pos,
        t = r.readBits(8),
        i = r.readBits(16),
        a = r.readBits(16);
      if (t > 63 || 0 !== i || 0 !== a) {
        r.pos = e;
        break;
      }
      if ((r.skipBits(1), s++, s > 64)) break;
      r.clone().readBits(6) + 1 === s && ((n = !0), (o = s));
    }
    if (!n) throw new Error("Invalid Setup header: mode header not found.");
    if (o > 63) throw new Error(`Unsupported mode count: ${o}.`);
    const c = o;
    ((r.pos = 0), r.skipBits(a));
    const l = Array(c).fill(0);
    for (let h = c - 1; h >= 0; h--) (r.skipBits(40), (l[h] = r.readBits(1)));
    return { modeBlockflags: l };
  },
  mi = (e, t, i) => {
    switch (e) {
      case "avc": {
        const e = ((e, t) => {
          if (t.description) {
            const i = 3 & le(t.description)[4];
            return qt(e, i + 1);
          }
          return jt(e);
        })(i, t);
        return e.some((e) => Qt(e) === Ht.IDR) ? "key" : "delta";
      }
      case "hevc":
        return Yt(i, t).some((e) => {
          const t = Jt(e);
          return $t.BLA_W_LP <= t && t <= $t.RSV_IRAP_VCL23;
        })
          ? "key"
          : "delta";
      case "vp8":
        return 0 === (1 & i[0]) ? "key" : "delta";
      case "vp9": {
        const e = new ne(i);
        if (2 !== e.readBits(2)) return null;
        const t = e.readBits(1);
        3 === (e.readBits(1) << 1) + t && e.skipBits(1);
        if (e.readBits(1)) return null;
        return 0 === e.readBits(1) ? "key" : "delta";
      }
      case "av1": {
        let e = !1;
        for (const { type: t, data: r } of ci(i))
          if (1 === t) {
            const t = new ne(r);
            (t.skipBits(4), (e = !!t.readBits(1)));
          } else if (3 === t || 6 === t || 7 === t) {
            if (e) return "key";
            const t = new ne(r);
            if (t.readBits(1)) return null;
            return 0 === t.readBits(2) ? "key" : "delta";
          }
        return null;
      }
      default:
        (Fe(e), ie(!1));
    }
  };
var pi;
!(function (e) {
  ((e[(e.STREAMINFO = 0)] = "STREAMINFO"),
    (e[(e.VORBIS_COMMENT = 4)] = "VORBIS_COMMENT"),
    (e[(e.PICTURE = 6)] = "PICTURE"));
})(pi || (pi = {}));
const fi = (e, t) => {
    const i = he(e);
    let r = 0;
    const a = i.getUint32(r, !0);
    r += 4;
    const s = de.decode(e.subarray(r, r + a));
    ((r += a), a > 0 && ((t.raw ??= {}), (t.raw.vendor ??= s)));
    const n = i.getUint32(r, !0);
    r += 4;
    for (let o = 0; o < n; o++) {
      const a = i.getUint32(r, !0);
      r += 4;
      const s = de.decode(e.subarray(r, r + a));
      r += a;
      const n = s.indexOf("=");
      if (-1 === n) continue;
      const o = s.slice(0, n).toUpperCase(),
        c = s.slice(n + 1);
      switch (((t.raw ??= {}), (t.raw[o] ??= c), o)) {
        case "TITLE":
          t.title ??= c;
          break;
        case "DESCRIPTION":
          t.description ??= c;
          break;
        case "ARTIST":
          t.artist ??= c;
          break;
        case "ALBUM":
          t.album ??= c;
          break;
        case "ALBUMARTIST":
          t.albumArtist ??= c;
          break;
        case "COMMENT":
          t.comment ??= c;
          break;
        case "LYRICS":
          t.lyrics ??= c;
          break;
        case "TRACKNUMBER":
          {
            const e = c.split("/"),
              i = Number.parseInt(e[0], 10),
              r = e[1] && Number.parseInt(e[1], 10);
            (Number.isInteger(i) && i > 0 && (t.trackNumber ??= i),
              r && Number.isInteger(r) && r > 0 && (t.tracksTotal ??= r));
          }
          break;
        case "TRACKTOTAL":
          {
            const e = Number.parseInt(c, 10);
            Number.isInteger(e) && e > 0 && (t.tracksTotal ??= e);
          }
          break;
        case "DISCNUMBER":
          {
            const e = c.split("/"),
              i = Number.parseInt(e[0], 10),
              r = e[1] && Number.parseInt(e[1], 10);
            (Number.isInteger(i) && i > 0 && (t.discNumber ??= i),
              r && Number.isInteger(r) && r > 0 && (t.discsTotal ??= r));
          }
          break;
        case "DISCTOTAL":
          {
            const e = Number.parseInt(c, 10);
            Number.isInteger(e) && e > 0 && (t.discsTotal ??= e);
          }
          break;
        case "DATE":
          {
            const e = new Date(c);
            Number.isNaN(e.getTime()) || (t.date ??= e);
          }
          break;
        case "GENRE":
          t.genre ??= c;
          break;
        case "METADATA_BLOCK_PICTURE": {
          const e = tt(c),
            i = he(e),
            r = i.getUint32(0, !1),
            a = i.getUint32(4, !1),
            s = String.fromCharCode(...e.subarray(8, 8 + a)),
            n = i.getUint32(8 + a, !1),
            o = de.decode(e.subarray(12 + a, 12 + a + n)),
            l = i.getUint32(a + n + 28),
            h = e.subarray(a + n + 32, a + n + 32 + l);
          ((t.images ??= []),
            t.images.push({
              data: h,
              mimeType: s,
              kind: 3 === r ? "coverFront" : 4 === r ? "coverBack" : "unknown",
              name: void 0,
              description: o || void 0,
            }));
        }
      }
    }
  },
  gi = (e, t, i) => {
    const r = [e],
      a = ue.encode("Mediabunny");
    let s = new Uint8Array(4 + a.length),
      n = new DataView(s.buffer);
    (n.setUint32(0, a.length, !0), s.set(a, 4), r.push(s));
    const o = new Set(),
      c = (e, t) => {
        const i = `${e}=${t}`,
          a = ue.encode(i);
        ((s = new Uint8Array(4 + a.length)),
          (n = new DataView(s.buffer)),
          n.setUint32(0, a.length, !0),
          s.set(a, 4),
          r.push(s),
          o.add(e));
      };
    for (const { key: m, value: p } of Ze(t))
      switch (m) {
        case "title":
          c("TITLE", p);
          break;
        case "description":
          c("DESCRIPTION", p);
          break;
        case "artist":
          c("ARTIST", p);
          break;
        case "album":
          c("ALBUM", p);
          break;
        case "albumArtist":
          c("ALBUMARTIST", p);
          break;
        case "genre":
          c("GENRE", p);
          break;
        case "date":
          {
            const e = t.raw?.DATE ?? t.raw?.date;
            c(
              "DATE",
              e && "string" == typeof e ? e : p.toISOString().slice(0, 10),
            );
          }
          break;
        case "comment":
          c("COMMENT", p);
          break;
        case "lyrics":
          c("LYRICS", p);
          break;
        case "trackNumber":
          c("TRACKNUMBER", p.toString());
          break;
        case "tracksTotal":
          c("TRACKTOTAL", p.toString());
          break;
        case "discNumber":
          c("DISCNUMBER", p.toString());
          break;
        case "discsTotal":
          c("DISCTOTAL", p.toString());
          break;
        case "images":
          for (const e of p) {
            const t =
                "coverFront" === e.kind ? 3 : "coverBack" === e.kind ? 4 : 0,
              i = new Uint8Array(e.mimeType.length);
            for (let n = 0; n < e.mimeType.length; n++)
              i[n] = e.mimeType.charCodeAt(n);
            const r = ue.encode(e.description ?? ""),
              a = new Uint8Array(
                8 + i.length + 4 + r.length + 16 + 4 + e.data.length,
              ),
              s = he(a);
            (s.setUint32(0, t, !1),
              s.setUint32(4, i.length, !1),
              a.set(i, 8),
              s.setUint32(8 + i.length, r.length, !1),
              a.set(r, 12 + i.length),
              s.setUint32(28 + i.length + r.length, e.data.length, !1),
              a.set(e.data, 32 + i.length + r.length));
            c("METADATA_BLOCK_PICTURE", it(a));
          }
          break;
        case "raw":
          break;
        default:
          Fe(m);
      }
    if (t.raw)
      for (const m in t.raw) {
        const e = t.raw[m] ?? t.raw[m.toLowerCase()];
        "vendor" === m ||
          null == e ||
          o.has(m) ||
          ("string" == typeof e && c(m, e));
      }
    const l = new Uint8Array(4);
    (he(l).setUint32(0, o.size, !0), r.splice(2, 0, l));
    const h = r.reduce((e, t) => e + t.length, 0),
      d = new Uint8Array(h);
    let u = 0;
    for (const m of r) (d.set(m, u), (u += m.length));
    return d;
  };
class ki {
  constructor(e) {
    this.input = e;
  }
}
const yi = [],
  wi = [],
  bi = [],
  Ti = [],
  Ci = /* #__PURE__ */ new Uint8Array(0);
class Si {
  constructor(e, t, i, r, a = -1, s, n) {
    if (
      ((this.data = e),
      (this.type = t),
      (this.timestamp = i),
      (this.duration = r),
      (this.sequenceNumber = a),
      e === Ci && void 0 === s)
    )
      throw new Error(
        "Internal error: byteLength must be explicitly provided when constructing metadata-only packets.",
      );
    if ((void 0 === s && (s = e.byteLength), !(e instanceof Uint8Array)))
      throw new TypeError("data must be a Uint8Array.");
    if ("key" !== t && "delta" !== t)
      throw new TypeError('type must be either "key" or "delta".');
    if (!Number.isFinite(i)) throw new TypeError("timestamp must be a number.");
    if (!Number.isFinite(r) || r < 0)
      throw new TypeError("duration must be a non-negative number.");
    if (!Number.isFinite(a))
      throw new TypeError("sequenceNumber must be a number.");
    if (!Number.isInteger(s) || s < 0)
      throw new TypeError("byteLength must be a non-negative integer.");
    if (void 0 !== n && ("object" != typeof n || !n))
      throw new TypeError("sideData, when provided, must be an object.");
    if (void 0 !== n?.alpha && !(n.alpha instanceof Uint8Array))
      throw new TypeError(
        "sideData.alpha, when provided, must be a Uint8Array.",
      );
    if (
      void 0 !== n?.alphaByteLength &&
      (!Number.isInteger(n.alphaByteLength) || n.alphaByteLength < 0)
    )
      throw new TypeError(
        "sideData.alphaByteLength, when provided, must be a non-negative integer.",
      );
    ((this.byteLength = s),
      (this.sideData = n ?? {}),
      this.sideData.alpha &&
        void 0 === this.sideData.alphaByteLength &&
        (this.sideData.alphaByteLength = this.sideData.alpha.byteLength));
  }
  get isMetadataOnly() {
    return this.data === Ci;
  }
  get microsecondTimestamp() {
    return Math.trunc(Ve * this.timestamp);
  }
  get microsecondDuration() {
    return Math.trunc(Ve * this.duration);
  }
  toEncodedVideoChunk() {
    if (this.isMetadataOnly)
      throw new TypeError(
        "Metadata-only packets cannot be converted to a video chunk.",
      );
    if ("undefined" == typeof EncodedVideoChunk)
      throw new Error("Your browser does not support EncodedVideoChunk.");
    return new EncodedVideoChunk({
      data: this.data,
      type: this.type,
      timestamp: this.microsecondTimestamp,
      duration: this.microsecondDuration,
    });
  }
  alphaToEncodedVideoChunk(e = this.type) {
    if (!this.sideData.alpha)
      throw new TypeError("This packet does not contain alpha side data.");
    if (this.isMetadataOnly)
      throw new TypeError(
        "Metadata-only packets cannot be converted to a video chunk.",
      );
    if ("undefined" == typeof EncodedVideoChunk)
      throw new Error("Your browser does not support EncodedVideoChunk.");
    return new EncodedVideoChunk({
      data: this.sideData.alpha,
      type: e,
      timestamp: this.microsecondTimestamp,
      duration: this.microsecondDuration,
    });
  }
  toEncodedAudioChunk() {
    if (this.isMetadataOnly)
      throw new TypeError(
        "Metadata-only packets cannot be converted to an audio chunk.",
      );
    if ("undefined" == typeof EncodedAudioChunk)
      throw new Error("Your browser does not support EncodedAudioChunk.");
    return new EncodedAudioChunk({
      data: this.data,
      type: this.type,
      timestamp: this.microsecondTimestamp,
      duration: this.microsecondDuration,
    });
  }
  static fromEncodedChunk(e, t) {
    if (!(e instanceof EncodedVideoChunk || e instanceof EncodedAudioChunk))
      throw new TypeError(
        "chunk must be an EncodedVideoChunk or EncodedAudioChunk.",
      );
    const i = new Uint8Array(e.byteLength);
    return (
      e.copyTo(i),
      new Si(
        i,
        e.type,
        e.timestamp / 1e6,
        (e.duration ?? 0) / 1e6,
        void 0,
        void 0,
        t,
      )
    );
  }
  clone(e) {
    if (void 0 !== e && ("object" != typeof e || null === e))
      throw new TypeError("options, when provided, must be an object.");
    if (void 0 !== e?.timestamp && !Number.isFinite(e.timestamp))
      throw new TypeError(
        "options.timestamp, when provided, must be a number.",
      );
    if (void 0 !== e?.duration && !Number.isFinite(e.duration))
      throw new TypeError("options.duration, when provided, must be a number.");
    return new Si(
      this.data,
      this.type,
      e?.timestamp ?? this.timestamp,
      e?.duration ?? this.duration,
      this.sequenceNumber,
      this.byteLength,
    );
  }
}
at();
class vi {
  get displayWidth() {
    return this.rotation % 180 == 0 ? this.codedWidth : this.codedHeight;
  }
  get displayHeight() {
    return this.rotation % 180 == 0 ? this.codedHeight : this.codedWidth;
  }
  get microsecondTimestamp() {
    return Math.trunc(Ve * this.timestamp);
  }
  get microsecondDuration() {
    return Math.trunc(Ve * this.duration);
  }
  get hasAlpha() {
    return this.format && this.format.includes("A");
  }
  constructor(e, t) {
    if (
      ((this._closed = !1), e instanceof ArrayBuffer || ArrayBuffer.isView(e))
    ) {
      if (!t || "object" != typeof t)
        throw new TypeError("init must be an object.");
      if (!("format" in t) || "string" != typeof t.format)
        throw new TypeError("init.format must be a string.");
      if (!Number.isInteger(t.codedWidth) || t.codedWidth <= 0)
        throw new TypeError("init.codedWidth must be a positive integer.");
      if (!Number.isInteger(t.codedHeight) || t.codedHeight <= 0)
        throw new TypeError("init.codedHeight must be a positive integer.");
      if (void 0 !== t.rotation && ![0, 90, 180, 270].includes(t.rotation))
        throw new TypeError(
          "init.rotation, when provided, must be 0, 90, 180, or 270.",
        );
      if (!Number.isFinite(t.timestamp))
        throw new TypeError("init.timestamp must be a number.");
      if (
        void 0 !== t.duration &&
        (!Number.isFinite(t.duration) || t.duration < 0)
      )
        throw new TypeError(
          "init.duration, when provided, must be a non-negative number.",
        );
      ((this._data = le(e).slice()),
        (this.format = t.format),
        (this.codedWidth = t.codedWidth),
        (this.codedHeight = t.codedHeight),
        (this.rotation = t.rotation ?? 0),
        (this.timestamp = t.timestamp),
        (this.duration = t.duration ?? 0),
        (this.colorSpace = new VideoColorSpace(t.colorSpace)));
    } else if ("undefined" != typeof VideoFrame && e instanceof VideoFrame) {
      if (void 0 !== t?.rotation && ![0, 90, 180, 270].includes(t.rotation))
        throw new TypeError(
          "init.rotation, when provided, must be 0, 90, 180, or 270.",
        );
      if (void 0 !== t?.timestamp && !Number.isFinite(t?.timestamp))
        throw new TypeError("init.timestamp, when provided, must be a number.");
      if (
        void 0 !== t?.duration &&
        (!Number.isFinite(t.duration) || t.duration < 0)
      )
        throw new TypeError(
          "init.duration, when provided, must be a non-negative number.",
        );
      ((this._data = e),
        (this.format = e.format),
        (this.codedWidth = e.displayWidth),
        (this.codedHeight = e.displayHeight),
        (this.rotation = t?.rotation ?? 0),
        (this.timestamp = t?.timestamp ?? e.timestamp / 1e6),
        (this.duration = t?.duration ?? (e.duration ?? 0) / 1e6),
        (this.colorSpace = e.colorSpace));
    } else {
      if (
        !(
          ("undefined" != typeof HTMLImageElement &&
            e instanceof HTMLImageElement) ||
          ("undefined" != typeof SVGImageElement &&
            e instanceof SVGImageElement) ||
          ("undefined" != typeof ImageBitmap && e instanceof ImageBitmap) ||
          ("undefined" != typeof HTMLVideoElement &&
            e instanceof HTMLVideoElement) ||
          ("undefined" != typeof HTMLCanvasElement &&
            e instanceof HTMLCanvasElement) ||
          ("undefined" != typeof OffscreenCanvas &&
            e instanceof OffscreenCanvas)
        )
      )
        throw new TypeError(
          "Invalid data type: Must be a BufferSource or CanvasImageSource.",
        );
      {
        if (!t || "object" != typeof t)
          throw new TypeError("init must be an object.");
        if (void 0 !== t.rotation && ![0, 90, 180, 270].includes(t.rotation))
          throw new TypeError(
            "init.rotation, when provided, must be 0, 90, 180, or 270.",
          );
        if (!Number.isFinite(t.timestamp))
          throw new TypeError("init.timestamp must be a number.");
        if (
          void 0 !== t.duration &&
          (!Number.isFinite(t.duration) || t.duration < 0)
        )
          throw new TypeError(
            "init.duration, when provided, must be a non-negative number.",
          );
        if ("undefined" != typeof VideoFrame)
          return new vi(
            new VideoFrame(e, {
              timestamp: Math.trunc(t.timestamp * Ve),
              duration: Math.trunc((t.duration ?? 0) * Ve) || void 0,
            }),
            t,
          );
        let i = 0,
          r = 0;
        if (
          ("naturalWidth" in e
            ? ((i = e.naturalWidth), (r = e.naturalHeight))
            : "videoWidth" in e
              ? ((i = e.videoWidth), (r = e.videoHeight))
              : "width" in e && ((i = Number(e.width)), (r = Number(e.height))),
          !i || !r)
        )
          throw new TypeError("Could not determine dimensions.");
        const a = new OffscreenCanvas(i, r),
          s = a.getContext("2d", { alpha: Xe(), willReadFrequently: !0 });
        (ie(s),
          s.drawImage(e, 0, 0),
          (this._data = a),
          (this.format = "RGBX"),
          (this.codedWidth = i),
          (this.codedHeight = r),
          (this.rotation = t.rotation ?? 0),
          (this.timestamp = t.timestamp),
          (this.duration = t.duration ?? 0),
          (this.colorSpace = new VideoColorSpace({
            matrix: "rgb",
            primaries: "bt709",
            transfer: "iec61966-2-1",
            fullRange: !0,
          })));
      }
    }
  }
  clone() {
    if (this._closed) throw new Error("VideoSample is closed.");
    return (
      ie(null !== this._data),
      xi(this._data)
        ? new vi(this._data.clone(), {
            timestamp: this.timestamp,
            duration: this.duration,
            rotation: this.rotation,
          })
        : this._data instanceof Uint8Array
          ? new vi(this._data.slice(), {
              format: this.format,
              codedWidth: this.codedWidth,
              codedHeight: this.codedHeight,
              timestamp: this.timestamp,
              duration: this.duration,
              colorSpace: this.colorSpace,
              rotation: this.rotation,
            })
          : new vi(this._data, {
              format: this.format,
              codedWidth: this.codedWidth,
              codedHeight: this.codedHeight,
              timestamp: this.timestamp,
              duration: this.duration,
              colorSpace: this.colorSpace,
              rotation: this.rotation,
            })
    );
  }
  close() {
    this._closed ||
      (xi(this._data) ? this._data.close() : (this._data = null),
      (this._closed = !0));
  }
  allocationSize() {
    if (this._closed) throw new Error("VideoSample is closed.");
    return (
      ie(null !== this._data),
      xi(this._data)
        ? this._data.allocationSize()
        : this._data instanceof Uint8Array
          ? this._data.byteLength
          : this.codedWidth * this.codedHeight * 4
    );
  }
  async copyTo(e) {
    if (!Te(e))
      throw new TypeError(
        "destination must be an ArrayBuffer or an ArrayBuffer view.",
      );
    if (this._closed) throw new Error("VideoSample is closed.");
    if ((ie(null !== this._data), xi(this._data))) await this._data.copyTo(e);
    else if (this._data instanceof Uint8Array) {
      le(e).set(this._data);
    } else {
      const t = this._data.getContext("2d");
      ie(t);
      const i = t.getImageData(0, 0, this.codedWidth, this.codedHeight);
      le(e).set(i.data);
    }
  }
  toVideoFrame() {
    if (this._closed) throw new Error("VideoSample is closed.");
    return (
      ie(null !== this._data),
      xi(this._data)
        ? new VideoFrame(this._data, {
            timestamp: this.microsecondTimestamp,
            duration: this.microsecondDuration || void 0,
          })
        : this._data instanceof Uint8Array
          ? new VideoFrame(this._data, {
              format: this.format,
              codedWidth: this.codedWidth,
              codedHeight: this.codedHeight,
              timestamp: this.microsecondTimestamp,
              duration: this.microsecondDuration || void 0,
              colorSpace: this.colorSpace,
            })
          : new VideoFrame(this._data, {
              timestamp: this.microsecondTimestamp,
              duration: this.microsecondDuration || void 0,
            })
    );
  }
  draw(e, t, i, r, a, s, n, o, c) {
    let l = 0,
      h = 0,
      d = this.displayWidth,
      u = this.displayHeight,
      m = 0,
      p = 0,
      f = this.displayWidth,
      g = this.displayHeight;
    if (
      (void 0 !== s
        ? ((l = t),
          (h = i),
          (d = r),
          (u = a),
          (m = s),
          (p = n),
          void 0 !== o ? ((f = o), (g = c)) : ((f = d), (g = u)))
        : ((m = t), (p = i), void 0 !== r && ((f = r), (g = a))),
      !(
        ("undefined" != typeof CanvasRenderingContext2D &&
          e instanceof CanvasRenderingContext2D) ||
        ("undefined" != typeof OffscreenCanvasRenderingContext2D &&
          e instanceof OffscreenCanvasRenderingContext2D)
      ))
    )
      throw new TypeError(
        "context must be a CanvasRenderingContext2D or OffscreenCanvasRenderingContext2D.",
      );
    if (!Number.isFinite(l)) throw new TypeError("sx must be a number.");
    if (!Number.isFinite(h)) throw new TypeError("sy must be a number.");
    if (!Number.isFinite(d) || d < 0)
      throw new TypeError("sWidth must be a non-negative number.");
    if (!Number.isFinite(u) || u < 0)
      throw new TypeError("sHeight must be a non-negative number.");
    if (!Number.isFinite(m)) throw new TypeError("dx must be a number.");
    if (!Number.isFinite(p)) throw new TypeError("dy must be a number.");
    if (!Number.isFinite(f) || f < 0)
      throw new TypeError("dWidth must be a non-negative number.");
    if (!Number.isFinite(g) || g < 0)
      throw new TypeError("dHeight must be a non-negative number.");
    if (this._closed) throw new Error("VideoSample is closed.");
    ({
      sx: l,
      sy: h,
      sWidth: d,
      sHeight: u,
    } = this._rotateSourceRegion(l, h, d, u, this.rotation));
    const k = this.toCanvasImageSource();
    e.save();
    const y = m + f / 2,
      w = p + g / 2;
    (e.translate(y, w), e.rotate((this.rotation * Math.PI) / 180));
    const b = this.rotation % 180 == 0 ? 1 : f / g;
    (e.scale(1 / b, b),
      e.drawImage(k, l, h, d, u, -f / 2, -g / 2, f, g),
      e.restore());
  }
  drawWithFit(e, t) {
    if (
      !(
        ("undefined" != typeof CanvasRenderingContext2D &&
          e instanceof CanvasRenderingContext2D) ||
        ("undefined" != typeof OffscreenCanvasRenderingContext2D &&
          e instanceof OffscreenCanvasRenderingContext2D)
      )
    )
      throw new TypeError(
        "context must be a CanvasRenderingContext2D or OffscreenCanvasRenderingContext2D.",
      );
    if (!t || "object" != typeof t)
      throw new TypeError("options must be an object.");
    if (!["fill", "contain", "cover"].includes(t.fit))
      throw new TypeError("options.fit must be 'fill', 'contain', or 'cover'.");
    if (void 0 !== t.rotation && ![0, 90, 180, 270].includes(t.rotation))
      throw new TypeError(
        "options.rotation, when provided, must be 0, 90, 180, or 270.",
      );
    void 0 !== t.crop && Ei(t.crop, "options.");
    const i = e.canvas.width,
      r = e.canvas.height,
      a = t.rotation ?? this.rotation,
      [s, n] =
        a % 180 == 0
          ? [this.codedWidth, this.codedHeight]
          : [this.codedHeight, this.codedWidth];
    let o, c, l, h;
    t.crop && Pi(t.crop, s, n);
    const {
      sx: d,
      sy: u,
      sWidth: m,
      sHeight: p,
    } = this._rotateSourceRegion(
      t.crop?.left ?? 0,
      t.crop?.top ?? 0,
      t.crop?.width ?? s,
      t.crop?.height ?? n,
      a,
    );
    if ("fill" === t.fit) ((o = 0), (c = 0), (l = i), (h = r));
    else {
      const [e, a] = t.crop ? [t.crop.width, t.crop.height] : [s, n],
        d =
          "contain" === t.fit ? Math.min(i / e, r / a) : Math.max(i / e, r / a);
      ((l = e * d), (h = a * d), (o = (i - l) / 2), (c = (r - h) / 2));
    }
    e.save();
    const f = a % 180 == 0 ? 1 : l / h;
    (e.translate(i / 2, r / 2),
      e.rotate((a * Math.PI) / 180),
      e.scale(1 / f, f),
      e.translate(-i / 2, -r / 2),
      e.drawImage(this.toCanvasImageSource(), d, u, m, p, o, c, l, h),
      e.restore());
  }
  _rotateSourceRegion(e, t, i, r, a) {
    return (
      90 === a
        ? ([e, t, i, r] = [t, this.codedHeight - e - i, r, i])
        : 180 === a
          ? ([e, t] = [this.codedWidth - e - i, this.codedHeight - t - r])
          : 270 === a && ([e, t, i, r] = [this.codedWidth - t - r, e, r, i]),
      { sx: e, sy: t, sWidth: i, sHeight: r }
    );
  }
  toCanvasImageSource() {
    if (this._closed) throw new Error("VideoSample is closed.");
    if ((ie(null !== this._data), this._data instanceof Uint8Array)) {
      const e = this.toVideoFrame();
      return (queueMicrotask(() => e.close()), e);
    }
    return this._data;
  }
  setRotation(e) {
    if (![0, 90, 180, 270].includes(e))
      throw new TypeError("newRotation must be 0, 90, 180, or 270.");
    this.rotation = e;
  }
  setTimestamp(e) {
    if (!Number.isFinite(e))
      throw new TypeError("newTimestamp must be a number.");
    this.timestamp = e;
  }
  setDuration(e) {
    if (!Number.isFinite(e) || e < 0)
      throw new TypeError("newDuration must be a non-negative number.");
    this.duration = e;
  }
  [Symbol.dispose]() {
    this.close();
  }
}
const xi = (e) => "undefined" != typeof VideoFrame && e instanceof VideoFrame,
  Pi = (e, t, i) => {
    ((e.left = Math.min(e.left, t)),
      (e.top = Math.min(e.top, i)),
      (e.width = Math.min(e.width, t - e.left)),
      (e.height = Math.min(e.height, i - e.top)),
      ie(e.width >= 0),
      ie(e.height >= 0));
  },
  Ei = (e, t) => {
    if (!e || "object" != typeof e)
      throw new TypeError(t + "crop, when provided, must be an object.");
    if (!Number.isInteger(e.left) || e.left < 0)
      throw new TypeError(t + "crop.left must be a non-negative integer.");
    if (!Number.isInteger(e.top) || e.top < 0)
      throw new TypeError(t + "crop.top must be a non-negative integer.");
    if (!Number.isInteger(e.width) || e.width < 0)
      throw new TypeError(t + "crop.width must be a non-negative integer.");
    if (!Number.isInteger(e.height) || e.height < 0)
      throw new TypeError(t + "crop.height must be a non-negative integer.");
  },
  Ii = new Set([
    "f32",
    "f32-planar",
    "s16",
    "s16-planar",
    "s32",
    "s32-planar",
    "u8",
    "u8-planar",
  ]);
class _i {
  get microsecondTimestamp() {
    return Math.trunc(Ve * this.timestamp);
  }
  get microsecondDuration() {
    return Math.trunc(Ve * this.duration);
  }
  constructor(e) {
    if (((this._closed = !1), Di(e))) {
      if (null === e.format)
        throw new TypeError("AudioData with null format is not supported.");
      ((this._data = e),
        (this.format = e.format),
        (this.sampleRate = e.sampleRate),
        (this.numberOfFrames = e.numberOfFrames),
        (this.numberOfChannels = e.numberOfChannels),
        (this.timestamp = e.timestamp / 1e6),
        (this.duration = e.numberOfFrames / e.sampleRate));
    } else {
      if (!e || "object" != typeof e)
        throw new TypeError("Invalid AudioDataInit: must be an object.");
      if (!Ii.has(e.format))
        throw new TypeError("Invalid AudioDataInit: invalid format.");
      if (!Number.isFinite(e.sampleRate) || e.sampleRate <= 0)
        throw new TypeError("Invalid AudioDataInit: sampleRate must be > 0.");
      if (!Number.isInteger(e.numberOfChannels) || 0 === e.numberOfChannels)
        throw new TypeError(
          "Invalid AudioDataInit: numberOfChannels must be an integer > 0.",
        );
      if (!Number.isFinite(e?.timestamp))
        throw new TypeError("init.timestamp must be a number.");
      const t = e.data.byteLength / (Ai(e.format) * e.numberOfChannels);
      if (!Number.isInteger(t))
        throw new TypeError(
          "Invalid AudioDataInit: data size is not a multiple of frame size.",
        );
      let i;
      if (
        ((this.format = e.format),
        (this.sampleRate = e.sampleRate),
        (this.numberOfFrames = t),
        (this.numberOfChannels = e.numberOfChannels),
        (this.timestamp = e.timestamp),
        (this.duration = t / e.sampleRate),
        e.data instanceof ArrayBuffer)
      )
        i = new Uint8Array(e.data);
      else {
        if (!ArrayBuffer.isView(e.data))
          throw new TypeError(
            "Invalid AudioDataInit: data is not a BufferSource.",
          );
        i = new Uint8Array(e.data.buffer, e.data.byteOffset, e.data.byteLength);
      }
      const r = this.numberOfFrames * this.numberOfChannels * Ai(this.format);
      if (i.byteLength < r)
        throw new TypeError("Invalid AudioDataInit: insufficient data size.");
      this._data = i;
    }
  }
  allocationSize(e) {
    if (!e || "object" != typeof e)
      throw new TypeError("options must be an object.");
    if (!Number.isInteger(e.planeIndex) || e.planeIndex < 0)
      throw new TypeError("planeIndex must be a non-negative integer.");
    if (void 0 !== e.format && !Ii.has(e.format))
      throw new TypeError("Invalid format.");
    if (
      void 0 !== e.frameOffset &&
      (!Number.isInteger(e.frameOffset) || e.frameOffset < 0)
    )
      throw new TypeError("frameOffset must be a non-negative integer.");
    if (
      void 0 !== e.frameCount &&
      (!Number.isInteger(e.frameCount) || e.frameCount < 0)
    )
      throw new TypeError("frameCount must be a non-negative integer.");
    if (this._closed) throw new Error("AudioSample is closed.");
    const t = e.format ?? this.format,
      i = e.frameOffset ?? 0;
    if (i >= this.numberOfFrames)
      throw new RangeError("frameOffset out of range");
    const r = void 0 !== e.frameCount ? e.frameCount : this.numberOfFrames - i;
    if (r > this.numberOfFrames - i)
      throw new RangeError("frameCount out of range");
    const a = Ai(t),
      s = Fi(t);
    if (s && e.planeIndex >= this.numberOfChannels)
      throw new RangeError("planeIndex out of range");
    if (!s && 0 !== e.planeIndex)
      throw new RangeError("planeIndex out of range");
    return (s ? r : r * this.numberOfChannels) * a;
  }
  copyTo(e, t) {
    if (!Te(e))
      throw new TypeError(
        "destination must be an ArrayBuffer or an ArrayBuffer view.",
      );
    if (!t || "object" != typeof t)
      throw new TypeError("options must be an object.");
    if (!Number.isInteger(t.planeIndex) || t.planeIndex < 0)
      throw new TypeError("planeIndex must be a non-negative integer.");
    if (void 0 !== t.format && !Ii.has(t.format))
      throw new TypeError("Invalid format.");
    if (
      void 0 !== t.frameOffset &&
      (!Number.isInteger(t.frameOffset) || t.frameOffset < 0)
    )
      throw new TypeError("frameOffset must be a non-negative integer.");
    if (
      void 0 !== t.frameCount &&
      (!Number.isInteger(t.frameCount) || t.frameCount < 0)
    )
      throw new TypeError("frameCount must be a non-negative integer.");
    if (this._closed) throw new Error("AudioSample is closed.");
    const { planeIndex: i, format: r, frameCount: a, frameOffset: s } = t,
      n = r ?? this.format;
    if (!n) throw new Error("Destination format not determined");
    const o = this.numberOfFrames,
      c = this.numberOfChannels,
      l = s ?? 0;
    if (l >= o) throw new RangeError("frameOffset out of range");
    const h = void 0 !== a ? a : o - l;
    if (h > o - l) throw new RangeError("frameCount out of range");
    const d = Ai(n),
      u = Fi(n);
    if (u && i >= c) throw new RangeError("planeIndex out of range");
    if (!u && 0 !== i) throw new RangeError("planeIndex out of range");
    const m = (u ? h : h * c) * d;
    if (e.byteLength < m)
      throw new RangeError("Destination buffer is too small");
    const p = he(e),
      f = Mi(n);
    if (Di(this._data))
      if (u)
        if ("f32-planar" === n)
          this._data.copyTo(e, {
            planeIndex: i,
            frameOffset: l,
            frameCount: h,
            format: "f32-planar",
          });
        else {
          const e = new ArrayBuffer(4 * h),
            t = new Float32Array(e);
          this._data.copyTo(t, {
            planeIndex: i,
            frameOffset: l,
            frameCount: h,
            format: "f32-planar",
          });
          const r = new DataView(e);
          for (let i = 0; i < h; i++) {
            f(p, i * d, r.getFloat32(4 * i, !0));
          }
        }
      else {
        const e = c,
          t = new Float32Array(h);
        for (let i = 0; i < e; i++) {
          this._data.copyTo(t, {
            planeIndex: i,
            frameOffset: l,
            frameCount: h,
            format: "f32-planar",
          });
          for (let r = 0; r < h; r++) {
            f(p, (r * e + i) * d, t[r]);
          }
        }
      }
    else {
      const e = this._data,
        t = new DataView(e.buffer, e.byteOffset, e.byteLength),
        r = this.format,
        a = Bi(r),
        s = Ai(r),
        n = Fi(r);
      for (let m = 0; m < h; m++)
        if (u) {
          let e;
          e = n ? (i * o + (m + l)) * s : ((m + l) * c + i) * s;
          f(p, m * d, a(t, e));
        } else
          for (let e = 0; e < c; e++) {
            let i;
            i = n ? (e * o + (m + l)) * s : ((m + l) * c + e) * s;
            f(p, (m * c + e) * d, a(t, i));
          }
    }
  }
  clone() {
    if (this._closed) throw new Error("AudioSample is closed.");
    if (Di(this._data)) {
      const e = new _i(this._data.clone());
      return (e.setTimestamp(this.timestamp), e);
    }
    return new _i({
      format: this.format,
      sampleRate: this.sampleRate,
      numberOfFrames: this.numberOfFrames,
      numberOfChannels: this.numberOfChannels,
      timestamp: this.timestamp,
      data: this._data,
    });
  }
  close() {
    this._closed ||
      (Di(this._data) ? this._data.close() : (this._data = new Uint8Array(0)),
      (this._closed = !0));
  }
  toAudioData() {
    if (this._closed) throw new Error("AudioSample is closed.");
    if (Di(this._data)) {
      if (this._data.timestamp === this.microsecondTimestamp)
        return this._data.clone();
      if (Fi(this.format)) {
        const e = this.allocationSize({ planeIndex: 0, format: this.format }),
          t = new ArrayBuffer(e * this.numberOfChannels);
        for (let i = 0; i < this.numberOfChannels; i++)
          this.copyTo(new Uint8Array(t, i * e, e), {
            planeIndex: i,
            format: this.format,
          });
        return new AudioData({
          format: this.format,
          sampleRate: this.sampleRate,
          numberOfFrames: this.numberOfFrames,
          numberOfChannels: this.numberOfChannels,
          timestamp: this.microsecondTimestamp,
          data: t,
        });
      }
      {
        const e = new ArrayBuffer(
          this.allocationSize({ planeIndex: 0, format: this.format }),
        );
        return (
          this.copyTo(e, { planeIndex: 0, format: this.format }),
          new AudioData({
            format: this.format,
            sampleRate: this.sampleRate,
            numberOfFrames: this.numberOfFrames,
            numberOfChannels: this.numberOfChannels,
            timestamp: this.microsecondTimestamp,
            data: e,
          })
        );
      }
    }
    return new AudioData({
      format: this.format,
      sampleRate: this.sampleRate,
      numberOfFrames: this.numberOfFrames,
      numberOfChannels: this.numberOfChannels,
      timestamp: this.microsecondTimestamp,
      data: this._data,
    });
  }
  toAudioBuffer() {
    if (this._closed) throw new Error("AudioSample is closed.");
    const e = new AudioBuffer({
        numberOfChannels: this.numberOfChannels,
        length: this.numberOfFrames,
        sampleRate: this.sampleRate,
      }),
      t = new Float32Array(
        this.allocationSize({ planeIndex: 0, format: "f32-planar" }) / 4,
      );
    for (let i = 0; i < this.numberOfChannels; i++)
      (this.copyTo(t, { planeIndex: i, format: "f32-planar" }),
        e.copyToChannel(t, i));
    return e;
  }
  setTimestamp(e) {
    if (!Number.isFinite(e))
      throw new TypeError("newTimestamp must be a number.");
    this.timestamp = e;
  }
  [Symbol.dispose]() {
    this.close();
  }
  static *_fromAudioBuffer(e, t) {
    if (!(e instanceof AudioBuffer))
      throw new TypeError("audioBuffer must be an AudioBuffer.");
    const i = e.numberOfChannels,
      r = e.sampleRate,
      a = e.length,
      s = Math.floor(24e4 / i);
    let n = 0,
      o = a;
    for (; o > 0; ) {
      const a = Math.min(s, o),
        c = new Float32Array(i * a);
      for (let t = 0; t < i; t++)
        e.copyFromChannel(c.subarray(t * a, (t + 1) * a), t, n);
      (yield new _i({
        format: "f32-planar",
        sampleRate: r,
        numberOfFrames: a,
        numberOfChannels: i,
        timestamp: t + n / r,
        data: c,
      }),
        (n += a),
        (o -= a));
    }
  }
  static fromAudioBuffer(e, t) {
    if (!(e instanceof AudioBuffer))
      throw new TypeError("audioBuffer must be an AudioBuffer.");
    const i = e.numberOfChannels,
      r = e.sampleRate,
      a = e.length,
      s = Math.floor(24e4 / i);
    let n = 0,
      o = a;
    const c = [];
    for (; o > 0; ) {
      const a = Math.min(s, o),
        l = new Float32Array(i * a);
      for (let t = 0; t < i; t++)
        e.copyFromChannel(l.subarray(t * a, (t + 1) * a), t, n);
      const h = new _i({
        format: "f32-planar",
        sampleRate: r,
        numberOfFrames: a,
        numberOfChannels: i,
        timestamp: t + n / r,
        data: l,
      });
      (c.push(h), (n += a), (o -= a));
    }
    return c;
  }
}
const Ai = (e) => {
    switch (e) {
      case "u8":
      case "u8-planar":
        return 1;
      case "s16":
      case "s16-planar":
        return 2;
      case "s32":
      case "s32-planar":
      case "f32":
      case "f32-planar":
        return 4;
      default:
        throw new Error("Unknown AudioSampleFormat");
    }
  },
  Fi = (e) => {
    switch (e) {
      case "u8-planar":
      case "s16-planar":
      case "s32-planar":
      case "f32-planar":
        return !0;
      default:
        return !1;
    }
  },
  Bi = (e) => {
    switch (e) {
      case "u8":
      case "u8-planar":
        return (e, t) => (e.getUint8(t) - 128) / 128;
      case "s16":
      case "s16-planar":
        return (e, t) => e.getInt16(t, !0) / 32768;
      case "s32":
      case "s32-planar":
        return (e, t) => e.getInt32(t, !0) / 2147483648;
      case "f32":
      case "f32-planar":
        return (e, t) => e.getFloat32(t, !0);
    }
  },
  Mi = (e) => {
    switch (e) {
      case "u8":
      case "u8-planar":
        return (e, t, i) => e.setUint8(t, Oe(127.5 * (i + 1), 0, 255));
      case "s16":
      case "s16-planar":
        return (e, t, i) =>
          e.setInt16(t, Oe(Math.round(32767 * i), -32768, 32767), !0);
      case "s32":
      case "s32-planar":
        return (e, t, i) =>
          e.setInt32(
            t,
            Oe(Math.round(2147483647 * i), -2147483648, 2147483647),
            !0,
          );
      case "f32":
      case "f32-planar":
        return (e, t, i) => e.setFloat32(t, i, !0);
    }
  },
  Di = (e) => "undefined" != typeof AudioData && e instanceof AudioData,
  Oi = (e) => {
    if (!e || "object" != typeof e)
      throw new TypeError("options must be an object.");
    if (void 0 !== e.metadataOnly && "boolean" != typeof e.metadataOnly)
      throw new TypeError(
        "options.metadataOnly, when defined, must be a boolean.",
      );
    if (void 0 !== e.verifyKeyPackets && "boolean" != typeof e.verifyKeyPackets)
      throw new TypeError(
        "options.verifyKeyPackets, when defined, must be a boolean.",
      );
    if (e.verifyKeyPackets && e.metadataOnly)
      throw new TypeError(
        "options.verifyKeyPackets and options.metadataOnly cannot be enabled together.",
      );
  },
  Ri = (e) => {
    if (!st(e)) throw new TypeError("timestamp must be a number.");
  },
  zi = (e, t, i) =>
    i.verifyKeyPackets
      ? t.then(async (t) => {
          if (!t || "delta" === t.type) return t;
          const i = await e.determinePacketType(t);
          return (i && (t.type = i), t);
        })
      : t;
class Ni {
  constructor(e) {
    if (!(e instanceof Gi)) throw new TypeError("track must be an InputTrack.");
    this._track = e;
  }
  getFirstPacket(e = {}) {
    if ((Oi(e), this._track.input._disposed)) throw new us();
    return zi(this._track, this._track._backing.getFirstPacket(e), e);
  }
  getPacket(e, t = {}) {
    if ((Ri(e), Oi(t), this._track.input._disposed)) throw new us();
    return zi(this._track, this._track._backing.getPacket(e, t), t);
  }
  getNextPacket(e, t = {}) {
    if (!(e instanceof Si))
      throw new TypeError("packet must be an EncodedPacket.");
    if ((Oi(t), this._track.input._disposed)) throw new us();
    return zi(this._track, this._track._backing.getNextPacket(e, t), t);
  }
  async getKeyPacket(e, t = {}) {
    if ((Ri(e), Oi(t), this._track.input._disposed)) throw new us();
    if (!t.verifyKeyPackets) return this._track._backing.getKeyPacket(e, t);
    const i = await this._track._backing.getKeyPacket(e, t);
    if (!i || "delta" === i.type) return i;
    return "delta" === (await this._track.determinePacketType(i))
      ? this.getKeyPacket(i.timestamp - 1 / this._track.timeResolution, t)
      : i;
  }
  async getNextKeyPacket(e, t = {}) {
    if (!(e instanceof Si))
      throw new TypeError("packet must be an EncodedPacket.");
    if ((Oi(t), this._track.input._disposed)) throw new us();
    if (!t.verifyKeyPackets) return this._track._backing.getNextKeyPacket(e, t);
    const i = await this._track._backing.getNextKeyPacket(e, t);
    if (!i || "delta" === i.type) return i;
    return "delta" === (await this._track.determinePacketType(i))
      ? this.getNextKeyPacket(i, t)
      : i;
  }
  packets(e, t, i = {}) {
    if (void 0 !== e && !(e instanceof Si))
      throw new TypeError("startPacket must be an EncodedPacket.");
    if (void 0 !== e && e.isMetadataOnly && !i?.metadataOnly)
      throw new TypeError(
        "startPacket can only be metadata-only if options.metadataOnly is enabled.",
      );
    if (void 0 !== t && !(t instanceof Si))
      throw new TypeError("endPacket must be an EncodedPacket.");
    if ((Oi(i), this._track.input._disposed)) throw new us();
    const r = [];
    let { promise: a, resolve: s } = Ie(),
      { promise: n, resolve: o } = Ie(),
      c = !1,
      l = !1,
      h = null;
    const d = [],
      u = () => Math.max(2, d.length);
    (async () => {
      let h = e ?? (await this.getFirstPacket(i));
      for (
        ;
        h &&
        !l &&
        !this._track.input._disposed &&
        !(t && h.sequenceNumber >= t?.sequenceNumber);

      )
        r.length > u()
          ? (({ promise: n, resolve: o } = Ie()), await n)
          : (r.push(h),
            s(),
            ({ promise: a, resolve: s } = Ie()),
            (h = await this.getNextPacket(h, i)));
      ((c = !0), s());
    })().catch((e) => {
      h || ((h = e), s());
    });
    const m = this._track;
    return {
      async next() {
        for (;;) {
          if (m.input._disposed) throw new us();
          if (l) return { value: void 0, done: !0 };
          if (h) throw h;
          if (r.length > 0) {
            const e = r.shift(),
              t = performance.now();
            for (d.push(t); d.length > 0 && t - d[0] >= 1e3; ) d.shift();
            return (o(), { value: e, done: !1 });
          }
          if (c) return { value: void 0, done: !0 };
          await a;
        }
      },
      return: async () => ((l = !0), o(), s(), { value: void 0, done: !0 }),
      async throw(e) {
        throw e;
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }
}
class Ui {
  constructor(e, t) {
    ((this.onSample = e), (this.onError = t));
  }
}
class Li {
  mediaSamplesInRange(e = 0, t = 1 / 0) {
    (Ri(e), Ri(t));
    const i = [];
    let r = !1,
      a = null,
      { promise: s, resolve: n } = Ie(),
      { promise: o, resolve: c } = Ie(),
      l = !1,
      h = !1,
      d = !1,
      u = null;
    (async () => {
      const m = new Error(),
        p = await this._createDecoder(
          (o) => {
            (c(),
              o.timestamp >= t && (h = !0),
              h
                ? o.close()
                : (a && (o.timestamp > e ? (i.push(a), (r = !0)) : a.close()),
                  o.timestamp >= e && (i.push(o), (r = !0)),
                  (a = r ? null : o),
                  i.length > 0 && (n(), ({ promise: s, resolve: n } = Ie()))));
          },
          (e) => {
            u || ((e.stack = m.stack), (u = e), n());
          },
        ),
        f = this._createPacketSink(),
        g =
          (await f.getKeyPacket(e, { verifyKeyPackets: !0 })) ??
          (await f.getFirstPacket());
      if (!g) return;
      let k,
        y = g;
      if (t < 1 / 0) {
        const e = await f.getPacket(t),
          i = e
            ? "key" === e.type && e.timestamp === t
              ? e
              : await f.getNextKeyPacket(e, { verifyKeyPackets: !0 })
            : null;
        i && (k = i);
      }
      const w = f.packets(g, k);
      for (await w.next(); y && !h && !this._track.input._disposed; ) {
        const e = Vi(i.length);
        if (i.length + p.getDecodeQueueSize() > e) {
          (({ promise: o, resolve: c } = Ie()), await o);
          continue;
        }
        p.decode(y);
        const t = await w.next();
        if (t.done) break;
        y = t.value;
      }
      (await w.return(),
        d || this._track.input._disposed || (await p.flush()),
        p.close(),
        !r && a && i.push(a),
        (l = !0),
        n());
    })().catch((e) => {
      u || ((u = e), n());
    });
    const m = this._track,
      p = () => {
        a?.close();
        for (const e of i) e.close();
      };
    return {
      async next() {
        for (;;) {
          if (m.input._disposed) throw (p(), new us());
          if (d) return { value: void 0, done: !0 };
          if (u) throw (p(), u);
          if (i.length > 0) {
            const e = i.shift();
            return (c(), { value: e, done: !1 });
          }
          if (l) return { value: void 0, done: !0 };
          await s;
        }
      },
      return: async () => (
        (d = !0),
        (h = !0),
        c(),
        n(),
        p(),
        { value: void 0, done: !0 }
      ),
      async throw(e) {
        throw e;
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }
  mediaSamplesAtTimestamps(e) {
    ((e) => {
      if (!(Symbol.iterator in e) && !(Symbol.asyncIterator in e))
        throw new TypeError("Argument must be an iterable or async iterable.");
    })(e);
    const t = (async function* (e) {
        Symbol.iterator in e
          ? yield* e[Symbol.iterator]()
          : yield* e[Symbol.asyncIterator]();
      })(e),
      i = [],
      r = [];
    let { promise: a, resolve: s } = Ie(),
      { promise: n, resolve: o } = Ie(),
      c = !1,
      l = !1,
      h = null;
    const d = (e) => {
      (r.push(e), s(), ({ promise: a, resolve: s } = Ie()));
    };
    (async () => {
      const e = new Error(),
        a = await this._createDecoder(
          (e) => {
            if ((o(), l)) return void e.close();
            let t = 0;
            for (; i.length > 0 && e.timestamp - i[0] > -1e-10; )
              (t++, i.shift());
            if (t > 0) for (let i = 0; i < t; i++) d(i < t - 1 ? e.clone() : e);
            else e.close();
          },
          (t) => {
            h || ((t.stack = e.stack), (h = t), s());
          },
        ),
        u = this._createPacketSink();
      let m = null,
        p = null,
        f = -1;
      const g = async () => {
          ie(p);
          let e = p;
          for (a.decode(e); e.sequenceNumber < f; ) {
            const t = Vi(r.length);
            for (; r.length + a.getDecodeQueueSize() > t && !l; )
              (({ promise: n, resolve: o } = Ie()), await n);
            if (l) break;
            const i = await u.getNextPacket(e);
            (ie(i), a.decode(i), (e = i));
          }
          f = -1;
        },
        k = async () => {
          await a.flush();
          for (let e = 0; e < i.length; e++) d(null);
          i.length = 0;
        };
      for await (const r of t) {
        if ((Ri(r), l || this._track.input._disposed)) break;
        const e = await u.getPacket(r),
          t = e && (await u.getKeyPacket(r, { verifyKeyPackets: !0 }));
        t
          ? (m &&
              (t.sequenceNumber !== p.sequenceNumber ||
                e.timestamp < m.timestamp) &&
              (await g(), await k()),
            i.push(e.timestamp),
            (f = Math.max(e.sequenceNumber, f)),
            (m = e),
            (p = t))
          : (-1 !== f && (await g(), await k()), d(null), (m = null));
      }
      (l || this._track.input._disposed || (-1 !== f && (await g()), await k()),
        a.close(),
        (c = !0),
        s());
    })().catch((e) => {
      h || ((h = e), s());
    });
    const u = this._track,
      m = () => {
        for (const e of r) e?.close();
      };
    return {
      async next() {
        for (;;) {
          if (u.input._disposed) throw (m(), new us());
          if (l) return { value: void 0, done: !0 };
          if (h) throw (m(), h);
          if (r.length > 0) {
            const e = r.shift();
            return (ie(void 0 !== e), o(), { value: e, done: !1 });
          }
          if (c) return { value: void 0, done: !0 };
          await a;
        }
      },
      return: async () => (
        (l = !0),
        o(),
        s(),
        m(),
        { value: void 0, done: !0 }
      ),
      async throw(e) {
        throw e;
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }
}
const Vi = (e) => (0 === e ? 40 : 8);
class Wi extends Ui {
  constructor(e, t, i, r, a, s) {
    (super(e, t),
      (this.codec = i),
      (this.decoderConfig = r),
      (this.rotation = a),
      (this.timeResolution = s),
      (this.decoder = null),
      (this.customDecoder = null),
      (this.customDecoderCallSerializer = new je()),
      (this.customDecoderQueueSize = 0),
      (this.inputTimestamps = []),
      (this.sampleQueue = []),
      (this.currentPacketIndex = 0),
      (this.raslSkipped = !1),
      (this.alphaDecoder = null),
      (this.alphaHadKeyframe = !1),
      (this.colorQueue = []),
      (this.alphaQueue = []),
      (this.merger = null),
      (this.mergerCreationFailed = !1),
      (this.decodedAlphaChunkCount = 0),
      (this.alphaDecoderQueueSize = 0),
      (this.nullAlphaFrameQueue = []),
      (this.currentAlphaPacketIndex = 0),
      (this.alphaRaslSkipped = !1));
    const n = yi.find((e) => e.supports(i, r));
    if (n)
      ((this.customDecoder = new n()),
        (this.customDecoder.codec = i),
        (this.customDecoder.config = r),
        (this.customDecoder.onSample = (e) => {
          if (!(e instanceof vi))
            throw new TypeError(
              "The argument passed to onSample must be a VideoSample.",
            );
          this.finalizeAndEmitSample(e);
        }),
        this.customDecoderCallSerializer.call(() => this.customDecoder.init()));
    else {
      const e = (e) => {
        if (this.alphaQueue.length > 0) {
          const t = this.alphaQueue.shift();
          (ie(void 0 !== t), this.mergeAlpha(e, t));
        } else this.colorQueue.push(e);
      };
      if (
        "avc" === i &&
        this.decoderConfig.description &&
        (null !== Ge
          ? Ge
          : (Ge = !(
              "undefined" == typeof navigator ||
              !navigator.vendor?.includes("Google Inc")
            )))
      ) {
        const e = ((e) => {
          try {
            const t = he(e);
            let i = 0;
            const r = t.getUint8(i++),
              a = t.getUint8(i++),
              s = t.getUint8(i++),
              n = t.getUint8(i++),
              o = 3 & t.getUint8(i++),
              c = 31 & t.getUint8(i++),
              l = [];
            for (let m = 0; m < c; m++) {
              const r = t.getUint16(i, !1);
              ((i += 2), l.push(e.subarray(i, i + r)), (i += r));
            }
            const h = t.getUint8(i++),
              d = [];
            for (let m = 0; m < h; m++) {
              const r = t.getUint16(i, !1);
              ((i += 2), d.push(e.subarray(i, i + r)), (i += r));
            }
            const u = {
              configurationVersion: r,
              avcProfileIndication: a,
              profileCompatibility: s,
              avcLevelIndication: n,
              lengthSizeMinusOne: o,
              sequenceParameterSets: l,
              pictureParameterSets: d,
              chromaFormat: null,
              bitDepthLumaMinus8: null,
              bitDepthChromaMinus8: null,
              sequenceParameterSetExt: null,
            };
            if (
              (100 === a || 110 === a || 122 === a || 144 === a) &&
              i + 4 <= e.length
            ) {
              const r = 3 & t.getUint8(i++),
                a = 7 & t.getUint8(i++),
                s = 7 & t.getUint8(i++),
                n = t.getUint8(i++);
              ((u.chromaFormat = r),
                (u.bitDepthLumaMinus8 = a),
                (u.bitDepthChromaMinus8 = s));
              const o = [];
              for (let c = 0; c < n; c++) {
                const r = t.getUint16(i, !1);
                ((i += 2), o.push(e.subarray(i, i + r)), (i += r));
              }
              u.sequenceParameterSetExt = o;
            }
            return u;
          } catch (t) {
            return (
              console.error(
                "Error deserializing AVC Decoder Configuration Record:",
                t,
              ),
              null
            );
          }
        })(le(this.decoderConfig.description));
        if (e && e.sequenceParameterSets.length > 0) {
          const t = Gt(e.sequenceParameterSets[0]);
          t &&
            0 === t.frameMbsOnlyFlag &&
            (this.decoderConfig = {
              ...this.decoderConfig,
              hardwareAcceleration: "prefer-software",
            });
        }
      }
      ((this.decoder = new VideoDecoder({
        output: (t) => {
          try {
            e(t);
          } catch (i) {
            this.onError(i);
          }
        },
        error: t,
      })),
        this.decoder.configure(this.decoderConfig));
    }
  }
  getDecodeQueueSize() {
    return this.customDecoder
      ? this.customDecoderQueueSize
      : (ie(this.decoder),
        Math.max(
          this.decoder.decodeQueueSize,
          this.alphaDecoder?.decodeQueueSize ?? 0,
        ));
  }
  decode(e) {
    if (
      "hevc" === this.codec &&
      this.currentPacketIndex > 0 &&
      !this.raslSkipped
    ) {
      if (this.hasHevcRaslPicture(e.data)) return;
      this.raslSkipped = !0;
    }
    (this.currentPacketIndex++,
      this.customDecoder
        ? (this.customDecoderQueueSize++,
          this.customDecoderCallSerializer
            .call(() => this.customDecoder.decode(e))
            .then(() => this.customDecoderQueueSize--))
        : (ie(this.decoder),
          Ke() || Ee(this.inputTimestamps, e.timestamp, (e) => e),
          this.decoder.decode(e.toEncodedVideoChunk()),
          this.decodeAlphaData(e)));
  }
  decodeAlphaData(e) {
    if (!e.sideData.alpha || this.mergerCreationFailed)
      return void this.pushNullAlphaFrame();
    if (!this.merger)
      try {
        this.merger = new Hi();
      } catch (i) {
        return (
          console.error("Due to an error, only color data will be decoded.", i),
          (this.mergerCreationFailed = !0),
          void this.decodeAlphaData(e)
        );
      }
    if (!this.alphaDecoder) {
      const e = (e) => {
        if ((this.alphaDecoderQueueSize--, this.colorQueue.length > 0)) {
          const t = this.colorQueue.shift();
          (ie(void 0 !== t), this.mergeAlpha(t, e));
        } else this.alphaQueue.push(e);
        for (
          this.decodedAlphaChunkCount++;
          this.nullAlphaFrameQueue.length > 0 &&
          this.nullAlphaFrameQueue[0] === this.decodedAlphaChunkCount;

        )
          if ((this.nullAlphaFrameQueue.shift(), this.colorQueue.length > 0)) {
            const e = this.colorQueue.shift();
            (ie(void 0 !== e), this.mergeAlpha(e, null));
          } else this.alphaQueue.push(null);
      };
      ((this.alphaDecoder = new VideoDecoder({
        output: (t) => {
          try {
            e(t);
          } catch (i) {
            this.onError(i);
          }
        },
        error: this.onError,
      })),
        this.alphaDecoder.configure(this.decoderConfig));
    }
    const t = mi(this.codec, this.decoderConfig, e.sideData.alpha);
    if (
      (this.alphaHadKeyframe || (this.alphaHadKeyframe = "key" === t),
      this.alphaHadKeyframe)
    ) {
      if (
        "hevc" === this.codec &&
        this.currentAlphaPacketIndex > 0 &&
        !this.alphaRaslSkipped
      ) {
        if (this.hasHevcRaslPicture(e.sideData.alpha))
          return void this.pushNullAlphaFrame();
        this.alphaRaslSkipped = !0;
      }
      (this.currentAlphaPacketIndex++,
        this.alphaDecoder.decode(e.alphaToEncodedVideoChunk(t ?? e.type)),
        this.alphaDecoderQueueSize++);
    } else this.pushNullAlphaFrame();
  }
  pushNullAlphaFrame() {
    0 === this.alphaDecoderQueueSize
      ? this.alphaQueue.push(null)
      : this.nullAlphaFrameQueue.push(
          this.decodedAlphaChunkCount + this.alphaDecoderQueueSize,
        );
  }
  hasHevcRaslPicture(e) {
    return Yt(e, this.decoderConfig).some((e) => {
      const t = Jt(e);
      return t === $t.RASL_N || t === $t.RASL_R;
    });
  }
  sampleHandler(e) {
    if (Ke()) {
      if (
        this.sampleQueue.length > 0 &&
        e.timestamp >= ae(this.sampleQueue).timestamp
      ) {
        for (const e of this.sampleQueue) this.finalizeAndEmitSample(e);
        this.sampleQueue.length = 0;
      }
      Ee(this.sampleQueue, e, (e) => e.timestamp);
    } else {
      const t = this.inputTimestamps.shift();
      (ie(void 0 !== t), e.setTimestamp(t), this.finalizeAndEmitSample(e));
    }
  }
  finalizeAndEmitSample(e) {
    (e.setTimestamp(
      Math.round(e.timestamp * this.timeResolution) / this.timeResolution,
    ),
      e.setDuration(
        Math.round(e.duration * this.timeResolution) / this.timeResolution,
      ),
      e.setRotation(this.rotation),
      this.onSample(e));
  }
  mergeAlpha(e, t) {
    if (!t) {
      const t = new vi(e);
      return void this.sampleHandler(t);
    }
    (ie(this.merger), this.merger.update(e, t), e.close(), t.close());
    const i = new VideoFrame(this.merger.canvas, {
        timestamp: e.timestamp,
        duration: e.duration ?? void 0,
      }),
      r = new vi(i);
    this.sampleHandler(r);
  }
  async flush() {
    if (
      (this.customDecoder
        ? await this.customDecoderCallSerializer.call(() =>
            this.customDecoder.flush(),
          )
        : (ie(this.decoder),
          await Promise.all([this.decoder.flush(), this.alphaDecoder?.flush()]),
          this.colorQueue.forEach((e) => e.close()),
          (this.colorQueue.length = 0),
          this.alphaQueue.forEach((e) => e?.close()),
          (this.alphaQueue.length = 0),
          (this.alphaHadKeyframe = !1),
          (this.decodedAlphaChunkCount = 0),
          (this.alphaDecoderQueueSize = 0),
          (this.nullAlphaFrameQueue.length = 0),
          (this.currentAlphaPacketIndex = 0),
          (this.alphaRaslSkipped = !1)),
      Ke())
    ) {
      for (const e of this.sampleQueue) this.finalizeAndEmitSample(e);
      this.sampleQueue.length = 0;
    }
    ((this.currentPacketIndex = 0), (this.raslSkipped = !1));
  }
  close() {
    this.customDecoder
      ? this.customDecoderCallSerializer.call(() => this.customDecoder.close())
      : (ie(this.decoder),
        this.decoder.close(),
        this.alphaDecoder?.close(),
        this.colorQueue.forEach((e) => e.close()),
        (this.colorQueue.length = 0),
        this.alphaQueue.forEach((e) => e?.close()),
        (this.alphaQueue.length = 0),
        this.merger?.close());
    for (const e of this.sampleQueue) e.close();
    this.sampleQueue.length = 0;
  }
}
class Hi {
  constructor() {
    "undefined" != typeof OffscreenCanvas
      ? (this.canvas = new OffscreenCanvas(300, 150))
      : (this.canvas = document.createElement("canvas"));
    const e = this.canvas.getContext("webgl2", { premultipliedAlpha: !1 });
    if (!e) throw new Error("Couldn't acquire WebGL 2 context.");
    ((this.gl = e),
      (this.program = this.createProgram()),
      (this.vao = this.createVAO()),
      (this.colorTexture = this.createTexture()),
      (this.alphaTexture = this.createTexture()),
      this.gl.useProgram(this.program),
      this.gl.uniform1i(
        this.gl.getUniformLocation(this.program, "u_colorTexture"),
        0,
      ),
      this.gl.uniform1i(
        this.gl.getUniformLocation(this.program, "u_alphaTexture"),
        1,
      ));
  }
  createProgram() {
    const e = this.createShader(
        this.gl.VERTEX_SHADER,
        "#version 300 es\n\t\t\tin vec2 a_position;\n\t\t\tin vec2 a_texCoord;\n\t\t\tout vec2 v_texCoord;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tgl_Position = vec4(a_position, 0.0, 1.0);\n\t\t\t\tv_texCoord = a_texCoord;\n\t\t\t}\n\t\t",
      ),
      t = this.createShader(
        this.gl.FRAGMENT_SHADER,
        "#version 300 es\n\t\t\tprecision highp float;\n\t\t\t\n\t\t\tuniform sampler2D u_colorTexture;\n\t\t\tuniform sampler2D u_alphaTexture;\n\t\t\tin vec2 v_texCoord;\n\t\t\tout vec4 fragColor;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tvec3 color = texture(u_colorTexture, v_texCoord).rgb;\n\t\t\t\tfloat alpha = texture(u_alphaTexture, v_texCoord).r;\n\t\t\t\tfragColor = vec4(color, alpha);\n\t\t\t}\n\t\t",
      ),
      i = this.gl.createProgram();
    return (
      this.gl.attachShader(i, e),
      this.gl.attachShader(i, t),
      this.gl.linkProgram(i),
      i
    );
  }
  createShader(e, t) {
    const i = this.gl.createShader(e);
    return (this.gl.shaderSource(i, t), this.gl.compileShader(i), i);
  }
  createVAO() {
    const e = this.gl.createVertexArray();
    this.gl.bindVertexArray(e);
    const t = new Float32Array([
        -1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, 1, 1, 1, 0,
      ]),
      i = this.gl.createBuffer();
    (this.gl.bindBuffer(this.gl.ARRAY_BUFFER, i),
      this.gl.bufferData(this.gl.ARRAY_BUFFER, t, this.gl.STATIC_DRAW));
    const r = this.gl.getAttribLocation(this.program, "a_position"),
      a = this.gl.getAttribLocation(this.program, "a_texCoord");
    return (
      this.gl.enableVertexAttribArray(r),
      this.gl.vertexAttribPointer(r, 2, this.gl.FLOAT, !1, 16, 0),
      this.gl.enableVertexAttribArray(a),
      this.gl.vertexAttribPointer(a, 2, this.gl.FLOAT, !1, 16, 8),
      e
    );
  }
  createTexture() {
    const e = this.gl.createTexture();
    return (
      this.gl.bindTexture(this.gl.TEXTURE_2D, e),
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_S,
        this.gl.CLAMP_TO_EDGE,
      ),
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_T,
        this.gl.CLAMP_TO_EDGE,
      ),
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER,
        this.gl.LINEAR,
      ),
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MAG_FILTER,
        this.gl.LINEAR,
      ),
      e
    );
  }
  update(e, t) {
    ((e.displayWidth === this.canvas.width &&
      e.displayHeight === this.canvas.height) ||
      ((this.canvas.width = e.displayWidth),
      (this.canvas.height = e.displayHeight)),
      this.gl.activeTexture(this.gl.TEXTURE0),
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorTexture),
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        e,
      ),
      this.gl.activeTexture(this.gl.TEXTURE1),
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.alphaTexture),
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        t,
      ),
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height),
      this.gl.clear(this.gl.COLOR_BUFFER_BIT),
      this.gl.bindVertexArray(this.vao),
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4));
  }
  close() {
    (this.gl.getExtension("WEBGL_lose_context")?.loseContext(),
      (this.gl = null));
  }
}
class $i extends Li {
  constructor(e) {
    if (!(e instanceof Yi))
      throw new TypeError("videoTrack must be an InputVideoTrack.");
    (super(), (this._track = e));
  }
  async _createDecoder(e, t) {
    if (!(await this._track.canDecode()))
      throw new Error(
        "This video track cannot be decoded by this browser. Make sure to check decodability before using a track.",
      );
    const i = this._track.codec,
      r = this._track.rotation,
      a = await this._track.getDecoderConfig(),
      s = this._track.timeResolution;
    return (ie(i && a), new Wi(e, t, i, a, r, s));
  }
  _createPacketSink() {
    return new Ni(this._track);
  }
  async getSample(e) {
    Ri(e);
    for await (const t of this.mediaSamplesAtTimestamps([e])) return t;
    throw new Error("Internal error: Iterator returned nothing.");
  }
  samples(e = 0, t = 1 / 0) {
    return this.mediaSamplesInRange(e, t);
  }
  samplesAtTimestamps(e) {
    return this.mediaSamplesAtTimestamps(e);
  }
}
class ji {
  constructor(e, t = {}) {
    if (((this._nextCanvasIndex = 0), !(e instanceof Yi)))
      throw new TypeError("videoTrack must be an InputVideoTrack.");
    if (t && "object" != typeof t)
      throw new TypeError("options must be an object.");
    if (void 0 !== t.alpha && "boolean" != typeof t.alpha)
      throw new TypeError("options.alpha, when provided, must be a boolean.");
    if (void 0 !== t.width && (!Number.isInteger(t.width) || t.width <= 0))
      throw new TypeError(
        "options.width, when defined, must be a positive integer.",
      );
    if (void 0 !== t.height && (!Number.isInteger(t.height) || t.height <= 0))
      throw new TypeError(
        "options.height, when defined, must be a positive integer.",
      );
    if (void 0 !== t.fit && !["fill", "contain", "cover"].includes(t.fit))
      throw new TypeError(
        'options.fit, when provided, must be one of "fill", "contain", or "cover".',
      );
    if (void 0 !== t.width && void 0 !== t.height && void 0 === t.fit)
      throw new TypeError(
        "When both options.width and options.height are provided, options.fit must also be provided.",
      );
    if (void 0 !== t.rotation && ![0, 90, 180, 270].includes(t.rotation))
      throw new TypeError(
        "options.rotation, when provided, must be 0, 90, 180 or 270.",
      );
    if (
      (void 0 !== t.crop && Ei(t.crop, "options."),
      void 0 !== t.poolSize &&
        ("number" != typeof t.poolSize ||
          !Number.isInteger(t.poolSize) ||
          t.poolSize < 0))
    )
      throw new TypeError("poolSize must be a non-negative integer.");
    const i = t.rotation ?? e.rotation,
      [r, a] =
        i % 180 == 0
          ? [e.codedWidth, e.codedHeight]
          : [e.codedHeight, e.codedWidth],
      s = t.crop;
    s && Pi(s, r, a);
    let [n, o] = s ? [s.width, s.height] : [r, a];
    const c = n / o;
    (void 0 !== t.width && void 0 === t.height
      ? ((n = t.width), (o = Math.round(n / c)))
      : void 0 === t.width && void 0 !== t.height
        ? ((o = t.height), (n = Math.round(o * c)))
        : void 0 !== t.width &&
          void 0 !== t.height &&
          ((n = t.width), (o = t.height)),
      (this._videoTrack = e),
      (this._alpha = t.alpha ?? !1),
      (this._width = n),
      (this._height = o),
      (this._rotation = i),
      (this._crop = s),
      (this._fit = t.fit ?? "fill"),
      (this._videoSampleSink = new $i(e)),
      (this._canvasPool = Array.from({ length: t.poolSize ?? 0 }, () => null)));
  }
  _videoSampleToWrappedCanvas(e) {
    let t = this._canvasPool[this._nextCanvasIndex],
      i = !1;
    (t ||
      ("undefined" != typeof document
        ? ((t = document.createElement("canvas")),
          (t.width = this._width),
          (t.height = this._height))
        : (t = new OffscreenCanvas(this._width, this._height)),
      this._canvasPool.length > 0 &&
        (this._canvasPool[this._nextCanvasIndex] = t),
      (i = !0)),
      this._canvasPool.length > 0 &&
        (this._nextCanvasIndex =
          (this._nextCanvasIndex + 1) % this._canvasPool.length));
    const r = t.getContext("2d", { alpha: this._alpha || Xe() });
    (ie(r),
      r.resetTransform(),
      i ||
        (!this._alpha && Xe()
          ? ((r.fillStyle = "black"),
            r.fillRect(0, 0, this._width, this._height))
          : r.clearRect(0, 0, this._width, this._height)),
      e.drawWithFit(r, {
        fit: this._fit,
        rotation: this._rotation,
        crop: this._crop,
      }));
    const a = { canvas: t, timestamp: e.timestamp, duration: e.duration };
    return (e.close(), a);
  }
  async getCanvas(e) {
    Ri(e);
    const t = await this._videoSampleSink.getSample(e);
    return t && this._videoSampleToWrappedCanvas(t);
  }
  canvases(e = 0, t = 1 / 0) {
    return De(this._videoSampleSink.samples(e, t), (e) =>
      this._videoSampleToWrappedCanvas(e),
    );
  }
  canvasesAtTimestamps(e) {
    return De(
      this._videoSampleSink.samplesAtTimestamps(e),
      (e) => e && this._videoSampleToWrappedCanvas(e),
    );
  }
}
class qi extends Ui {
  constructor(e, t, i, r) {
    (super(e, t),
      (this.decoder = null),
      (this.customDecoder = null),
      (this.customDecoderCallSerializer = new je()),
      (this.customDecoderQueueSize = 0),
      (this.currentTimestamp = null));
    const a = (t) => {
        (null === this.currentTimestamp ||
          Math.abs(t.timestamp - this.currentTimestamp) >= t.duration) &&
          (this.currentTimestamp = t.timestamp);
        const i = this.currentTimestamp;
        if (((this.currentTimestamp += t.duration), 0 === t.numberOfFrames))
          return void t.close();
        const a = r.sampleRate;
        (t.setTimestamp(Math.round(i * a) / a), e(t));
      },
      s = wi.find((e) => e.supports(i, r));
    s
      ? ((this.customDecoder = new s()),
        (this.customDecoder.codec = i),
        (this.customDecoder.config = r),
        (this.customDecoder.onSample = (e) => {
          if (!(e instanceof _i))
            throw new TypeError(
              "The argument passed to onSample must be an AudioSample.",
            );
          a(e);
        }),
        this.customDecoderCallSerializer.call(() => this.customDecoder.init()))
      : ((this.decoder = new AudioDecoder({
          output: (e) => {
            try {
              a(new _i(e));
            } catch (t) {
              this.onError(t);
            }
          },
          error: t,
        })),
        this.decoder.configure(r));
  }
  getDecodeQueueSize() {
    return this.customDecoder
      ? this.customDecoderQueueSize
      : (ie(this.decoder), this.decoder.decodeQueueSize);
  }
  decode(e) {
    this.customDecoder
      ? (this.customDecoderQueueSize++,
        this.customDecoderCallSerializer
          .call(() => this.customDecoder.decode(e))
          .then(() => this.customDecoderQueueSize--))
      : (ie(this.decoder), this.decoder.decode(e.toEncodedAudioChunk()));
  }
  flush() {
    return this.customDecoder
      ? this.customDecoderCallSerializer.call(() => this.customDecoder.flush())
      : (ie(this.decoder), this.decoder.flush());
  }
  close() {
    this.customDecoder
      ? this.customDecoderCallSerializer.call(() => this.customDecoder.close())
      : (ie(this.decoder), this.decoder.close());
  }
}
class Ki extends Ui {
  constructor(e, t, i) {
    (super(e, t),
      (this.decoderConfig = i),
      (this.currentTimestamp = null),
      ie(ht.includes(i.codec)),
      (this.codec = i.codec));
    const { dataType: r, sampleSize: a, littleEndian: s } = Ft(this.codec);
    switch (((this.inputSampleSize = a), a)) {
      case 1:
        "unsigned" === r
          ? (this.readInputValue = (e, t) => e.getUint8(t) - 128)
          : "signed" === r
            ? (this.readInputValue = (e, t) => e.getInt8(t))
            : "ulaw" === r
              ? (this.readInputValue = (e, t) =>
                  ((e) => {
                    let t = 0,
                      i = 0,
                      r = ~e;
                    (128 & r && ((r &= -129), (t = -1)),
                      (i = 5 + ((240 & r) >> 4)));
                    const a =
                      ((1 << i) | ((15 & r) << (i - 4)) | (1 << (i - 5))) - 33;
                    return 0 === t ? a : -a;
                  })(e.getUint8(t)))
              : "alaw" === r
                ? (this.readInputValue = (e, t) =>
                    ((e) => {
                      let t = 0,
                        i = 0,
                        r = 85 ^ e;
                      (128 & r && ((r &= -129), (t = -1)),
                        (i = 4 + ((240 & r) >> 4)));
                      let a = 0;
                      return (
                        (a =
                          4 !== i
                            ? (1 << i) | ((15 & r) << (i - 4)) | (1 << (i - 5))
                            : (r << 1) | 1),
                        0 === t ? a : -a
                      );
                    })(e.getUint8(t)))
                : ie(!1);
        break;
      case 2:
        "unsigned" === r
          ? (this.readInputValue = (e, t) => e.getUint16(t, s) - 32768)
          : "signed" === r
            ? (this.readInputValue = (e, t) => e.getInt16(t, s))
            : ie(!1);
        break;
      case 3:
        "unsigned" === r
          ? (this.readInputValue = (e, t) => Be(e, t, s) - 2 ** 23)
          : "signed" === r
            ? (this.readInputValue = (e, t) =>
                ((e, t, i) => (Be(e, t, i) << 8) >> 8)(e, t, s))
            : ie(!1);
        break;
      case 4:
        "unsigned" === r
          ? (this.readInputValue = (e, t) => e.getUint32(t, s) - 2 ** 31)
          : "signed" === r
            ? (this.readInputValue = (e, t) => e.getInt32(t, s))
            : "float" === r
              ? (this.readInputValue = (e, t) => e.getFloat32(t, s))
              : ie(!1);
        break;
      case 8:
        "float" === r
          ? (this.readInputValue = (e, t) => e.getFloat64(t, s))
          : ie(!1);
        break;
      default:
        (Fe(a), ie(!1));
    }
    switch (a) {
      case 1:
        "ulaw" === r || "alaw" === r
          ? ((this.outputSampleSize = 2),
            (this.outputFormat = "s16"),
            (this.writeOutputValue = (e, t, i) => e.setInt16(t, i, !0)))
          : ((this.outputSampleSize = 1),
            (this.outputFormat = "u8"),
            (this.writeOutputValue = (e, t, i) => e.setUint8(t, i + 128)));
        break;
      case 2:
        ((this.outputSampleSize = 2),
          (this.outputFormat = "s16"),
          (this.writeOutputValue = (e, t, i) => e.setInt16(t, i, !0)));
        break;
      case 3:
        ((this.outputSampleSize = 4),
          (this.outputFormat = "s32"),
          (this.writeOutputValue = (e, t, i) => e.setInt32(t, i << 8, !0)));
        break;
      case 4:
        ((this.outputSampleSize = 4),
          "float" === r
            ? ((this.outputFormat = "f32"),
              (this.writeOutputValue = (e, t, i) => e.setFloat32(t, i, !0)))
            : ((this.outputFormat = "s32"),
              (this.writeOutputValue = (e, t, i) => e.setInt32(t, i, !0))));
        break;
      case 8:
        ((this.outputSampleSize = 4),
          (this.outputFormat = "f32"),
          (this.writeOutputValue = (e, t, i) => e.setFloat32(t, i, !0)));
        break;
      default:
        (Fe(a), ie(!1));
    }
  }
  getDecodeQueueSize() {
    return 0;
  }
  decode(e) {
    const t = he(e.data),
      i =
        e.byteLength /
        this.decoderConfig.numberOfChannels /
        this.inputSampleSize,
      r = i * this.decoderConfig.numberOfChannels * this.outputSampleSize,
      a = new ArrayBuffer(r),
      s = new DataView(a);
    for (let l = 0; l < i * this.decoderConfig.numberOfChannels; l++) {
      const e = l * this.inputSampleSize,
        i = l * this.outputSampleSize,
        r = this.readInputValue(t, e);
      this.writeOutputValue(s, i, r);
    }
    const n = i / this.decoderConfig.sampleRate;
    (null === this.currentTimestamp ||
      Math.abs(e.timestamp - this.currentTimestamp) >= n) &&
      (this.currentTimestamp = e.timestamp);
    const o = this.currentTimestamp;
    this.currentTimestamp += n;
    const c = new _i({
      format: this.outputFormat,
      data: a,
      numberOfChannels: this.decoderConfig.numberOfChannels,
      sampleRate: this.decoderConfig.sampleRate,
      numberOfFrames: i,
      timestamp: o,
    });
    this.onSample(c);
  }
  async flush() {}
  close() {}
}
class Qi extends Li {
  constructor(e) {
    if (!(e instanceof Ji))
      throw new TypeError("audioTrack must be an InputAudioTrack.");
    (super(), (this._track = e));
  }
  async _createDecoder(e, t) {
    if (!(await this._track.canDecode()))
      throw new Error(
        "This audio track cannot be decoded by this browser. Make sure to check decodability before using a track.",
      );
    const i = this._track.codec,
      r = await this._track.getDecoderConfig();
    return (
      ie(i && r),
      ht.includes(r.codec) ? new Ki(e, t, r) : new qi(e, t, i, r)
    );
  }
  _createPacketSink() {
    return new Ni(this._track);
  }
  async getSample(e) {
    Ri(e);
    for await (const t of this.mediaSamplesAtTimestamps([e])) return t;
    throw new Error("Internal error: Iterator returned nothing.");
  }
  samples(e = 0, t = 1 / 0) {
    return this.mediaSamplesInRange(e, t);
  }
  samplesAtTimestamps(e) {
    return this.mediaSamplesAtTimestamps(e);
  }
}
class Xi {
  constructor(e) {
    if (!(e instanceof Ji))
      throw new TypeError("audioTrack must be an InputAudioTrack.");
    this._audioSampleSink = new Qi(e);
  }
  _audioSampleToWrappedArrayBuffer(e) {
    return {
      buffer: e.toAudioBuffer(),
      timestamp: e.timestamp,
      duration: e.duration,
    };
  }
  async getBuffer(e) {
    Ri(e);
    const t = await this._audioSampleSink.getSample(e);
    return t && this._audioSampleToWrappedArrayBuffer(t);
  }
  buffers(e = 0, t = 1 / 0) {
    return De(this._audioSampleSink.samples(e, t), (e) =>
      this._audioSampleToWrappedArrayBuffer(e),
    );
  }
  buffersAtTimestamps(e) {
    return De(
      this._audioSampleSink.samplesAtTimestamps(e),
      (e) => e && this._audioSampleToWrappedArrayBuffer(e),
    );
  }
}
class Gi {
  constructor(e, t) {
    ((this.input = e), (this._backing = t));
  }
  isVideoTrack() {
    return this instanceof Yi;
  }
  isAudioTrack() {
    return this instanceof Ji;
  }
  get id() {
    return this._backing.getId();
  }
  get internalCodecId() {
    return this._backing.getInternalCodecId();
  }
  get languageCode() {
    return this._backing.getLanguageCode();
  }
  get name() {
    return this._backing.getName();
  }
  get timeResolution() {
    return this._backing.getTimeResolution();
  }
  get disposition() {
    return this._backing.getDisposition();
  }
  getFirstTimestamp() {
    return this._backing.getFirstTimestamp();
  }
  computeDuration() {
    return this._backing.computeDuration();
  }
  async computePacketStats(e = 1 / 0) {
    const t = new Ni(this);
    let i = 1 / 0,
      r = -1 / 0,
      a = 0,
      s = 0;
    for await (const n of t.packets(void 0, void 0, { metadataOnly: !0 })) {
      if (a >= e && n.timestamp >= r) break;
      ((i = Math.min(i, n.timestamp)),
        (r = Math.max(r, n.timestamp + n.duration)),
        a++,
        (s += n.byteLength));
    }
    return {
      packetCount: a,
      averagePacketRate: a ? Number((a / (r - i)).toPrecision(16)) : 0,
      averageBitrate: a ? Number(((8 * s) / (r - i)).toPrecision(16)) : 0,
    };
  }
}
class Yi extends Gi {
  constructor(e, t) {
    (super(e, t), (this._backing = t));
  }
  get type() {
    return "video";
  }
  get codec() {
    return this._backing.getCodec();
  }
  get codedWidth() {
    return this._backing.getCodedWidth();
  }
  get codedHeight() {
    return this._backing.getCodedHeight();
  }
  get rotation() {
    return this._backing.getRotation();
  }
  get displayWidth() {
    return this._backing.getRotation() % 180 == 0
      ? this._backing.getCodedWidth()
      : this._backing.getCodedHeight();
  }
  get displayHeight() {
    return this._backing.getRotation() % 180 == 0
      ? this._backing.getCodedHeight()
      : this._backing.getCodedWidth();
  }
  getColorSpace() {
    return this._backing.getColorSpace();
  }
  async hasHighDynamicRange() {
    const e = await this._backing.getColorSpace();
    return (
      "bt2020" === e.primaries ||
      "smpte432" === e.primaries ||
      "pg" === e.transfer ||
      "hlg" === e.transfer ||
      "bt2020-ncl" === e.matrix
    );
  }
  canBeTransparent() {
    return this._backing.canBeTransparent();
  }
  getDecoderConfig() {
    return this._backing.getDecoderConfig();
  }
  async getCodecParameterString() {
    const e = await this._backing.getDecoderConfig();
    return e?.codec ?? null;
  }
  async canDecode() {
    try {
      const e = await this._backing.getDecoderConfig();
      if (!e) return !1;
      const t = this._backing.getCodec();
      if ((ie(null !== t), yi.some((i) => i.supports(t, e)))) return !0;
      if ("undefined" == typeof VideoDecoder) return !1;
      return !0 === (await VideoDecoder.isConfigSupported(e)).supported;
    } catch (e) {
      return (console.error("Error during decodability check:", e), !1);
    }
  }
  async determinePacketType(e) {
    if (!(e instanceof Si))
      throw new TypeError("packet must be an EncodedPacket.");
    if (e.isMetadataOnly)
      throw new TypeError(
        "packet must not be metadata-only to determine its type.",
      );
    if (null === this.codec) return null;
    const t = await this.getDecoderConfig();
    return (ie(t), mi(this.codec, t, e.data));
  }
}
class Ji extends Gi {
  constructor(e, t) {
    (super(e, t), (this._backing = t));
  }
  get type() {
    return "audio";
  }
  get codec() {
    return this._backing.getCodec();
  }
  get numberOfChannels() {
    return this._backing.getNumberOfChannels();
  }
  get sampleRate() {
    return this._backing.getSampleRate();
  }
  getDecoderConfig() {
    return this._backing.getDecoderConfig();
  }
  async getCodecParameterString() {
    const e = await this._backing.getDecoderConfig();
    return e?.codec ?? null;
  }
  async canDecode() {
    try {
      const e = await this._backing.getDecoderConfig();
      if (!e) return !1;
      const t = this._backing.getCodec();
      if ((ie(null !== t), wi.some((i) => i.supports(t, e)))) return !0;
      if (e.codec.startsWith("pcm-")) return !0;
      if ("undefined" == typeof AudioDecoder) return !1;
      return !0 === (await AudioDecoder.isConfigSupported(e)).supported;
    } catch (e) {
      return (console.error("Error during decodability check:", e), !1);
    }
  }
  async determinePacketType(e) {
    if (!(e instanceof Si))
      throw new TypeError("packet must be an EncodedPacket.");
    return null === this.codec ? null : "key";
  }
}
const Zi = (e) => {
    let t =
      (e.hasVideo ? "video/" : e.hasAudio ? "audio/" : "application/") +
      (e.isQuickTime ? "quicktime" : "mp4");
    if (e.codecStrings.length > 0) {
      t += `; codecs="${[...new Set(e.codecStrings)].join(", ")}"`;
    }
    return t;
  },
  er = 16,
  tr = (e) => {
    let t = Ss(e);
    const i = Bs(e, 4);
    let r = 8;
    1 === t && ((t = Es(e)), (r = 16));
    const a = t - r;
    return a < 0
      ? null
      : { name: i, totalSize: t, headerSize: r, contentSize: a };
  },
  ir = (e) => xs(e) / 65536,
  rr = (e) => xs(e) / 1073741824,
  ar = (e) => {
    let t = 0;
    for (let i = 0; i < 4; i++) {
      t <<= 7;
      const i = ks(e);
      if (((t |= 127 & i), !(128 & i))) break;
    }
    return t;
  },
  sr = (e) => {
    let t = ws(e);
    return (
      e.skip(2),
      (t = Math.min(t, e.remainingLength)),
      de.decode(gs(e, t))
    );
  },
  nr = (e) => {
    const t = tr(e);
    if (!t || "data" !== t.name) return null;
    if (e.remainingLength < 8) return null;
    const i = Ss(e);
    e.skip(4);
    const r = gs(e, t.contentSize - 8);
    switch (i) {
      case 1:
        return de.decode(r);
      case 2:
        return new TextDecoder("utf-16be").decode(r);
      case 13:
        return new nt(r, "image/jpeg");
      case 14:
        return new nt(r, "image/png");
      case 27:
        return new nt(r, "image/bmp");
      default:
        return r;
    }
  };
class or extends ki {
  constructor(e) {
    (super(e),
      (this.moovSlice = null),
      (this.currentTrack = null),
      (this.tracks = []),
      (this.metadataPromise = null),
      (this.movieTimescale = -1),
      (this.movieDurationInTimescale = -1),
      (this.isQuickTime = !1),
      (this.metadataTags = {}),
      (this.currentMetadataKeys = null),
      (this.isFragmented = !1),
      (this.fragmentTrackDefaults = []),
      (this.currentFragment = null),
      (this.lastReadFragment = null),
      (this.reader = e._reader));
  }
  async computeDuration() {
    const e = await this.getTracks(),
      t = await Promise.all(e.map((e) => e.computeDuration()));
    return Math.max(0, ...t);
  }
  async getTracks() {
    return (await this.readMetadata(), this.tracks.map((e) => e.inputTrack));
  }
  async getMimeType() {
    await this.readMetadata();
    const e = await Promise.all(
      this.tracks.map((e) => e.inputTrack.getCodecParameterString()),
    );
    return Zi({
      isQuickTime: this.isQuickTime,
      hasVideo: this.tracks.some((e) => "video" === e.info?.type),
      hasAudio: this.tracks.some((e) => "audio" === e.info?.type),
      codecStrings: e.filter(Boolean),
    });
  }
  async getMetadataTags() {
    return (await this.readMetadata(), this.metadataTags);
  }
  readMetadata() {
    return (this.metadataPromise ??= (async () => {
      let e = 0;
      for (;;) {
        let t = this.reader.requestSliceRange(e, 8, er);
        if ((t instanceof Promise && (t = await t), !t)) break;
        const i = e,
          r = tr(t);
        if (!r) break;
        if ("ftyp" === r.name) {
          const e = Bs(t, 4);
          this.isQuickTime = "qt  " === e;
        } else if ("moov" === r.name) {
          let e = this.reader.requestSlice(t.filePos, r.contentSize);
          if ((e instanceof Promise && (e = await e), !e)) break;
          ((this.moovSlice = e),
            this.readContiguousBoxes(this.moovSlice),
            this.tracks.sort(
              (e, t) =>
                Number(t.disposition.default) - Number(e.disposition.default),
            ));
          for (const t of this.tracks) {
            const e = t.editListPreviousSegmentDurations / this.movieTimescale;
            t.editListOffset -= Math.round(e * t.timescale);
          }
          break;
        }
        e = i + r.totalSize;
      }
      if (this.isFragmented && null !== this.reader.fileSize) {
        let e = this.reader.requestSlice(this.reader.fileSize - 4, 4);
        (e instanceof Promise && (e = await e), ie(e));
        const t = Ss(e),
          i = this.reader.fileSize - t;
        if (i >= 0 && i <= this.reader.fileSize - er) {
          let e = this.reader.requestSliceRange(i, 8, er);
          if ((e instanceof Promise && (e = await e), e)) {
            const t = tr(e);
            if (t && "mfra" === t.name) {
              let i = this.reader.requestSlice(e.filePos, t.contentSize);
              (i instanceof Promise && (i = await i),
                i && this.readContiguousBoxes(i));
            }
          }
        }
      }
    })());
  }
  getSampleTableForTrack(e) {
    if (e.sampleTable) return e.sampleTable;
    const t = {
      sampleTimingEntries: [],
      sampleCompositionTimeOffsets: [],
      sampleSizes: [],
      keySampleIndices: null,
      chunkOffsets: [],
      sampleToChunk: [],
      presentationTimestamps: null,
      presentationTimestampIndexMap: null,
    };
    ((e.sampleTable = t), ie(this.moovSlice));
    const i = this.moovSlice.slice(e.sampleTableByteOffset);
    ((this.currentTrack = e), this.traverseBox(i), (this.currentTrack = null));
    if (
      "audio" === e.info?.type &&
      e.info.codec &&
      ht.includes(e.info.codec) &&
      0 === t.sampleCompositionTimeOffsets.length
    ) {
      ie("audio" === e.info?.type);
      const i = Ft(e.info.codec),
        r = [],
        a = [];
      for (let s = 0; s < t.sampleToChunk.length; s++) {
        const n = t.sampleToChunk[s],
          o = t.sampleToChunk[s + 1],
          c =
            (o ? o.startChunkIndex : t.chunkOffsets.length) - n.startChunkIndex;
        for (let s = 0; s < c; s++) {
          const o = n.startSampleIndex + s * n.samplesPerChunk,
            c = o + n.samplesPerChunk,
            l = Pe(t.sampleTimingEntries, o, (e) => e.startIndex),
            h = t.sampleTimingEntries[l],
            d = Pe(t.sampleTimingEntries, c, (e) => e.startIndex),
            u = t.sampleTimingEntries[d],
            m = h.startDecodeTimestamp + (o - h.startIndex) * h.delta,
            p = u.startDecodeTimestamp + (c - u.startIndex) * u.delta - m,
            f = ae(r);
          f && f.delta === p
            ? f.count++
            : r.push({
                startIndex: n.startChunkIndex + s,
                startDecodeTimestamp: m,
                count: 1,
                delta: p,
              });
          const g = n.samplesPerChunk * i.sampleSize * e.info.numberOfChannels;
          a.push(g);
        }
        ((n.startSampleIndex = n.startChunkIndex), (n.samplesPerChunk = 1));
      }
      ((t.sampleTimingEntries = r), (t.sampleSizes = a));
    }
    if (t.sampleCompositionTimeOffsets.length > 0) {
      t.presentationTimestamps = [];
      for (const e of t.sampleTimingEntries)
        for (let i = 0; i < e.count; i++)
          t.presentationTimestamps.push({
            presentationTimestamp: e.startDecodeTimestamp + i * e.delta,
            sampleIndex: e.startIndex + i,
          });
      for (const e of t.sampleCompositionTimeOffsets)
        for (let i = 0; i < e.count; i++) {
          const r = e.startIndex + i,
            a = t.presentationTimestamps[r];
          a && (a.presentationTimestamp += e.offset);
        }
      (t.presentationTimestamps.sort(
        (e, t) => e.presentationTimestamp - t.presentationTimestamp,
      ),
        (t.presentationTimestampIndexMap = Array(
          t.presentationTimestamps.length,
        ).fill(-1)));
      for (let e = 0; e < t.presentationTimestamps.length; e++)
        t.presentationTimestampIndexMap[
          t.presentationTimestamps[e].sampleIndex
        ] = e;
    }
    return t;
  }
  async readFragment(e) {
    if (this.lastReadFragment?.moofOffset === e) return this.lastReadFragment;
    let t = this.reader.requestSliceRange(e, 8, er);
    (t instanceof Promise && (t = await t), ie(t));
    const i = tr(t);
    ie("moof" === i?.name);
    let r = this.reader.requestSlice(e, i.totalSize);
    (r instanceof Promise && (r = await r), ie(r), this.traverseBox(r));
    const a = this.lastReadFragment;
    ie(a && a.moofOffset === e);
    for (const [, s] of a.trackData) {
      const e = s.track,
        { fragmentPositionCache: t } = e;
      if (!s.startTimestampIsFinal) {
        const i = e.fragmentLookupTable.find(
          (e) => e.moofOffset === a.moofOffset,
        );
        if (i) fr(s, i.timestamp);
        else {
          const e = Pe(t, a.moofOffset - 1, (e) => e.moofOffset);
          if (-1 !== e) {
            const i = t[e];
            fr(s, i.endTimestamp);
          }
        }
        s.startTimestampIsFinal = !0;
      }
      const i = Pe(t, s.startTimestamp, (e) => e.startTimestamp);
      (-1 !== i && t[i].moofOffset === a.moofOffset) ||
        t.splice(i + 1, 0, {
          moofOffset: a.moofOffset,
          startTimestamp: s.startTimestamp,
          endTimestamp: s.endTimestamp,
        });
    }
    return a;
  }
  readContiguousBoxes(e) {
    const t = e.filePos;
    for (; e.filePos - t <= e.length - 8; ) {
      if (!this.traverseBox(e)) break;
    }
  }
  *iterateContiguousBoxes(e) {
    const t = e.filePos;
    for (; e.filePos - t <= e.length - 8; ) {
      const t = e.filePos,
        i = tr(e);
      if (!i) break;
      (yield { boxInfo: i, slice: e }, (e.filePos = t + i.totalSize));
    }
  }
  traverseBox(e) {
    const t = e.filePos,
      i = tr(e);
    if (!i) return !1;
    const r = e.filePos,
      a = t + i.totalSize;
    switch (i.name) {
      case "mdia":
      case "minf":
      case "dinf":
      case "mfra":
      case "edts":
      case "wave":
        this.readContiguousBoxes(e.slice(r, i.contentSize));
        break;
      case "mvhd":
        {
          const t = ks(e);
          (e.skip(3),
            1 === t
              ? (e.skip(16),
                (this.movieTimescale = Ss(e)),
                (this.movieDurationInTimescale = Es(e)))
              : (e.skip(8),
                (this.movieTimescale = Ss(e)),
                (this.movieDurationInTimescale = Ss(e))));
        }
        break;
      case "trak":
        {
          const t = {
            id: -1,
            demuxer: this,
            inputTrack: null,
            disposition: { ...ct },
            info: null,
            timescale: -1,
            durationInMovieTimescale: -1,
            durationInMediaTimescale: -1,
            rotation: 0,
            internalCodecId: null,
            name: null,
            languageCode: Re,
            sampleTableByteOffset: -1,
            sampleTable: null,
            fragmentLookupTable: [],
            currentFragmentState: null,
            fragmentPositionCache: [],
            editListPreviousSegmentDurations: 0,
            editListOffset: 0,
          };
          if (
            ((this.currentTrack = t),
            this.readContiguousBoxes(e.slice(r, i.contentSize)),
            -1 !== t.id && -1 !== t.timescale && null !== t.info)
          )
            if ("video" === t.info.type && -1 !== t.info.width) {
              const e = t;
              ((t.inputTrack = new Yi(this.input, new lr(e))),
                this.tracks.push(t));
            } else if (
              "audio" === t.info.type &&
              -1 !== t.info.numberOfChannels
            ) {
              const e = t;
              ((t.inputTrack = new Ji(this.input, new hr(e))),
                this.tracks.push(t));
            }
          this.currentTrack = null;
        }
        break;
      case "tkhd":
        {
          const t = this.currentTrack;
          if (!t) break;
          const i = ks(e),
            r = !!(1 & bs(e));
          if (((t.disposition.default = r), 0 === i))
            (e.skip(8),
              (t.id = Ss(e)),
              e.skip(4),
              (t.durationInMovieTimescale = Ss(e)));
          else {
            if (1 !== i)
              throw new Error(`Incorrect track header version ${i}.`);
            (e.skip(16),
              (t.id = Ss(e)),
              e.skip(4),
              (t.durationInMovieTimescale = Es(e)));
          }
          e.skip(16);
          const a = [
              ir(e),
              ir(e),
              rr(e),
              ir(e),
              ir(e),
              rr(e),
              ir(e),
              ir(e),
              rr(e),
            ],
            s = re(Ne(gr(a), 90));
          (ie(0 === s || 90 === s || 180 === s || 270 === s), (t.rotation = s));
        }
        break;
      case "elst":
        {
          const t = this.currentTrack;
          if (!t) break;
          const i = ks(e);
          e.skip(3);
          let r = !1,
            a = 0;
          const s = Ss(e);
          for (let n = 0; n < s; n++) {
            const s = 1 === i ? Es(e) : Ss(e),
              n = 1 === i ? Is(e) : xs(e),
              o = ir(e);
            if (0 !== s) {
              if (r) {
                console.warn(
                  "Unsupported edit list: multiple edits are not currently supported. Only using first edit.",
                );
                break;
              }
              if (-1 !== n) {
                if (1 !== o) {
                  console.warn(
                    "Unsupported edit list entry: media rate must be 1.",
                  );
                  break;
                }
                ((t.editListPreviousSegmentDurations = a),
                  (t.editListOffset = n),
                  (r = !0));
              } else a += s;
            }
          }
        }
        break;
      case "mdhd":
        {
          const t = this.currentTrack;
          if (!t) break;
          const i = ks(e);
          (e.skip(3),
            0 === i
              ? (e.skip(8),
                (t.timescale = Ss(e)),
                (t.durationInMediaTimescale = Ss(e)))
              : 1 === i &&
                (e.skip(16),
                (t.timescale = Ss(e)),
                (t.durationInMediaTimescale = Es(e))));
          let r = ws(e);
          if (r > 0) {
            t.languageCode = "";
            for (let e = 0; e < 3; e++)
              ((t.languageCode =
                String.fromCharCode(96 + (31 & r)) + t.languageCode),
                (r >>= 5));
            Le(t.languageCode) || (t.languageCode = Re);
          }
        }
        break;
      case "hdlr":
        {
          const t = this.currentTrack;
          if (!t) break;
          e.skip(8);
          const i = Bs(e, 4);
          "vide" === i
            ? (t.info = {
                type: "video",
                width: -1,
                height: -1,
                codec: null,
                codecDescription: null,
                colorSpace: null,
                avcType: null,
                avcCodecInfo: null,
                hevcCodecInfo: null,
                vp9CodecInfo: null,
                av1CodecInfo: null,
              })
            : "soun" === i &&
              (t.info = {
                type: "audio",
                numberOfChannels: -1,
                sampleRate: -1,
                codec: null,
                codecDescription: null,
                aacCodecInfo: null,
              });
        }
        break;
      case "stbl":
        {
          const a = this.currentTrack;
          if (!a) break;
          ((a.sampleTableByteOffset = t),
            this.readContiguousBoxes(e.slice(r, i.contentSize)));
        }
        break;
      case "stsd":
        {
          const t = this.currentTrack;
          if (!t) break;
          if (null === t.info || t.sampleTable) break;
          const i = ks(e);
          e.skip(3);
          const r = Ss(e);
          for (let a = 0; a < r; a++) {
            const r = e.filePos,
              a = tr(e);
            if (!a) break;
            t.internalCodecId = a.name;
            const s = a.name.toLowerCase();
            if ("video" === t.info.type)
              ("avc1" === s || "avc3" === s
                ? ((t.info.codec = "avc"),
                  (t.info.avcType = "avc1" === s ? 1 : 3))
                : "hvc1" === s || "hev1" === s
                  ? (t.info.codec = "hevc")
                  : "vp08" === s
                    ? (t.info.codec = "vp8")
                    : "vp09" === s
                      ? (t.info.codec = "vp9")
                      : "av01" === s
                        ? (t.info.codec = "av1")
                        : console.warn(
                            `Unsupported video codec (sample entry type '${a.name}').`,
                          ),
                e.skip(24),
                (t.info.width = ws(e)),
                (t.info.height = ws(e)),
                e.skip(50),
                this.readContiguousBoxes(
                  e.slice(e.filePos, r + a.totalSize - e.filePos),
                ));
            else {
              ("mp4a" === s ||
                ("opus" === s
                  ? (t.info.codec = "opus")
                  : "flac" === s
                    ? (t.info.codec = "flac")
                    : "twos" === s ||
                      "sowt" === s ||
                      "raw " === s ||
                      "in24" === s ||
                      "in32" === s ||
                      "fl32" === s ||
                      "fl64" === s ||
                      "lpcm" === s ||
                      "ipcm" === s ||
                      "fpcm" === s ||
                      ("ulaw" === s
                        ? (t.info.codec = "ulaw")
                        : "alaw" === s
                          ? (t.info.codec = "alaw")
                          : console.warn(
                              `Unsupported audio codec (sample entry type '${a.name}').`,
                            ))),
                e.skip(8));
              const n = ws(e);
              e.skip(6);
              let o = ws(e),
                c = ws(e);
              e.skip(4);
              let l = Ss(e) / 65536;
              if (0 === i && n > 0)
                if (1 === n) (e.skip(4), (c = 8 * Ss(e)), e.skip(8));
                else if (2 === n) {
                  (e.skip(4), (l = Fs(e)), (o = Ss(e)), e.skip(4), (c = Ss(e)));
                  const i = Ss(e);
                  if ((e.skip(8), "lpcm" === s)) {
                    const e = (c + 7) >> 3,
                      r = Boolean(1 & i),
                      a = Boolean(2 & i),
                      s = 4 & i ? -1 : 0;
                    (c > 0 &&
                      c <= 64 &&
                      (r
                        ? 32 === c &&
                          (t.info.codec = a ? "pcm-f32be" : "pcm-f32")
                        : s & (1 << (e - 1))
                          ? 1 === e
                            ? (t.info.codec = "pcm-s8")
                            : 2 === e
                              ? (t.info.codec = a ? "pcm-s16be" : "pcm-s16")
                              : 3 === e
                                ? (t.info.codec = a ? "pcm-s24be" : "pcm-s24")
                                : 4 === e &&
                                  (t.info.codec = a ? "pcm-s32be" : "pcm-s32")
                          : 1 === e && (t.info.codec = "pcm-u8")),
                      null === t.info.codec &&
                        console.warn("Unsupported PCM format."));
                  }
                }
              ("opus" === t.info.codec && (l = _t),
                (t.info.numberOfChannels = o),
                (t.info.sampleRate = l),
                "twos" === s
                  ? 8 === c
                    ? (t.info.codec = "pcm-s8")
                    : 16 === c
                      ? (t.info.codec = "pcm-s16be")
                      : (console.warn(
                          `Unsupported sample size ${c} for codec 'twos'.`,
                        ),
                        (t.info.codec = null))
                  : "sowt" === s
                    ? 8 === c
                      ? (t.info.codec = "pcm-s8")
                      : 16 === c
                        ? (t.info.codec = "pcm-s16")
                        : (console.warn(
                            `Unsupported sample size ${c} for codec 'sowt'.`,
                          ),
                          (t.info.codec = null))
                    : "raw " === s
                      ? (t.info.codec = "pcm-u8")
                      : "in24" === s
                        ? (t.info.codec = "pcm-s24be")
                        : "in32" === s
                          ? (t.info.codec = "pcm-s32be")
                          : "fl32" === s
                            ? (t.info.codec = "pcm-f32be")
                            : "fl64" === s
                              ? (t.info.codec = "pcm-f64be")
                              : "ipcm" === s
                                ? (t.info.codec = "pcm-s16be")
                                : "fpcm" === s && (t.info.codec = "pcm-f32be"),
                this.readContiguousBoxes(
                  e.slice(e.filePos, r + a.totalSize - e.filePos),
                ));
            }
          }
        }
        break;
      case "avcC":
        {
          const t = this.currentTrack;
          if (!t) break;
          (ie(t.info), (t.info.codecDescription = gs(e, i.contentSize)));
        }
        break;
      case "hvcC":
        {
          const t = this.currentTrack;
          if (!t) break;
          (ie(t.info), (t.info.codecDescription = gs(e, i.contentSize)));
        }
        break;
      case "vpcC":
        {
          const t = this.currentTrack;
          if (!t) break;
          (ie("video" === t.info?.type), e.skip(4));
          const i = ks(e),
            r = ks(e),
            a = ks(e),
            s = a >> 4,
            n = (a >> 1) & 7,
            o = 1 & a,
            c = ks(e),
            l = ks(e),
            h = ks(e);
          t.info.vp9CodecInfo = {
            profile: i,
            level: r,
            bitDepth: s,
            chromaSubsampling: n,
            videoFullRangeFlag: o,
            colourPrimaries: c,
            transferCharacteristics: l,
            matrixCoefficients: h,
          };
        }
        break;
      case "av1C":
        {
          const t = this.currentTrack;
          if (!t) break;
          (ie("video" === t.info?.type), e.skip(1));
          const i = ks(e),
            r = i >> 5,
            a = 31 & i,
            s = ks(e),
            n = s >> 7,
            o = (s >> 6) & 1,
            c = (s >> 4) & 1,
            l = (s >> 3) & 1,
            h = (s >> 2) & 1,
            d = 3 & s,
            u = 2 === r && o ? ((s >> 5) & 1 ? 12 : 10) : o ? 10 : 8;
          t.info.av1CodecInfo = {
            profile: r,
            level: a,
            tier: n,
            bitDepth: u,
            monochrome: c,
            chromaSubsamplingX: l,
            chromaSubsamplingY: h,
            chromaSamplePosition: d,
          };
        }
        break;
      case "colr":
        {
          const t = this.currentTrack;
          if (!t) break;
          ie("video" === t.info?.type);
          if ("nclx" !== Bs(e, 4)) break;
          const i = ws(e),
            r = ws(e),
            a = ws(e),
            s = Boolean(128 & ks(e));
          t.info.colorSpace = {
            primaries: fe[i],
            transfer: ke[r],
            matrix: we[a],
            fullRange: s,
          };
        }
        break;
      case "esds":
        {
          const t = this.currentTrack;
          if (!t) break;
          (ie("audio" === t.info?.type), e.skip(4));
          (ie(3 === ks(e)), ar(e), e.skip(2));
          const i = ks(e),
            r = !!(64 & i),
            a = !!(32 & i);
          if ((!!(128 & i) && e.skip(2), r)) {
            const t = ks(e);
            e.skip(t);
          }
          a && e.skip(2);
          ie(4 === ks(e));
          const s = ar(e),
            n = e.filePos,
            o = ks(e);
          if (
            (64 === o || 103 === o
              ? ((t.info.codec = "aac"),
                (t.info.aacCodecInfo = { isMpeg2: 103 === o }))
              : 105 === o || 107 === o
                ? (t.info.codec = "mp3")
                : 221 === o
                  ? (t.info.codec = "vorbis")
                  : console.warn(
                      `Unsupported audio codec (objectTypeIndication ${o}) - discarding track.`,
                    ),
            e.skip(12),
            s > e.filePos - n)
          ) {
            ie(5 === ks(e));
            const i = ar(e);
            if (
              ((t.info.codecDescription = gs(e, i)), "aac" === t.info.codec)
            ) {
              const e = It(t.info.codecDescription);
              (null !== e.numberOfChannels &&
                (t.info.numberOfChannels = e.numberOfChannels),
                null !== e.sampleRate && (t.info.sampleRate = e.sampleRate));
            }
          }
        }
        break;
      case "enda":
        {
          const t = this.currentTrack;
          if (!t) break;
          ie("audio" === t.info?.type);
          255 & ws(e) &&
            ("pcm-s16be" === t.info.codec
              ? (t.info.codec = "pcm-s16")
              : "pcm-s24be" === t.info.codec
                ? (t.info.codec = "pcm-s24")
                : "pcm-s32be" === t.info.codec
                  ? (t.info.codec = "pcm-s32")
                  : "pcm-f32be" === t.info.codec
                    ? (t.info.codec = "pcm-f32")
                    : "pcm-f64be" === t.info.codec &&
                      (t.info.codec = "pcm-f64"));
        }
        break;
      case "pcmC": {
        const t = this.currentTrack;
        if (!t) break;
        (ie("audio" === t.info?.type), e.skip(4));
        const i = ks(e),
          r = Boolean(1 & i),
          a = ks(e);
        "pcm-s16be" === t.info.codec
          ? r
            ? 16 === a
              ? (t.info.codec = "pcm-s16")
              : 24 === a
                ? (t.info.codec = "pcm-s24")
                : 32 === a
                  ? (t.info.codec = "pcm-s32")
                  : (console.warn(`Invalid ipcm sample size ${a}.`),
                    (t.info.codec = null))
            : 16 === a
              ? (t.info.codec = "pcm-s16be")
              : 24 === a
                ? (t.info.codec = "pcm-s24be")
                : 32 === a
                  ? (t.info.codec = "pcm-s32be")
                  : (console.warn(`Invalid ipcm sample size ${a}.`),
                    (t.info.codec = null))
          : "pcm-f32be" === t.info.codec &&
            (r
              ? 32 === a
                ? (t.info.codec = "pcm-f32")
                : 64 === a
                  ? (t.info.codec = "pcm-f64")
                  : (console.warn(`Invalid fpcm sample size ${a}.`),
                    (t.info.codec = null))
              : 32 === a
                ? (t.info.codec = "pcm-f32be")
                : 64 === a
                  ? (t.info.codec = "pcm-f64be")
                  : (console.warn(`Invalid fpcm sample size ${a}.`),
                    (t.info.codec = null)));
        break;
      }
      case "dOps":
        {
          const t = this.currentTrack;
          if (!t) break;
          (ie("audio" === t.info?.type), e.skip(1));
          const i = ks(e),
            r = ws(e),
            a = Ss(e),
            s = Ts(e),
            n = ks(e);
          let o;
          o = 0 !== n ? gs(e, 2 + i) : new Uint8Array(0);
          const c = new Uint8Array(19 + o.byteLength),
            l = new DataView(c.buffer);
          (l.setUint32(0, 1332770163, !1),
            l.setUint32(4, 1214603620, !1),
            l.setUint8(8, 1),
            l.setUint8(9, i),
            l.setUint16(10, r, !0),
            l.setUint32(12, a, !0),
            l.setInt16(16, s, !0),
            l.setUint8(18, n),
            c.set(o, 19),
            (t.info.codecDescription = c),
            (t.info.numberOfChannels = i));
        }
        break;
      case "dfLa":
        {
          const t = this.currentTrack;
          if (!t) break;
          (ie("audio" === t.info?.type), e.skip(4));
          const i = 127,
            r = 128,
            s = e.filePos;
          for (; e.filePos < a; ) {
            const a = ks(e),
              s = bs(e);
            if ((a & i) === pi.STREAMINFO) {
              e.skip(10);
              const i = Ss(e),
                r = i >>> 12,
                a = 1 + ((i >> 9) & 7);
              ((t.info.sampleRate = r),
                (t.info.numberOfChannels = a),
                e.skip(20));
            } else e.skip(s);
            if (a & r) break;
          }
          const n = e.filePos;
          e.filePos = s;
          const o = gs(e, n - s),
            c = new Uint8Array(4 + o.byteLength);
          (new DataView(c.buffer).setUint32(0, 1716281667, !1),
            c.set(o, 4),
            (t.info.codecDescription = c));
        }
        break;
      case "stts":
        {
          const t = this.currentTrack;
          if (!t) break;
          if (!t.sampleTable) break;
          e.skip(4);
          const i = Ss(e);
          let r = 0,
            a = 0;
          for (let s = 0; s < i; s++) {
            const i = Ss(e),
              s = Ss(e);
            (t.sampleTable.sampleTimingEntries.push({
              startIndex: r,
              startDecodeTimestamp: a,
              count: i,
              delta: s,
            }),
              (r += i),
              (a += i * s));
          }
        }
        break;
      case "ctts":
        {
          const t = this.currentTrack;
          if (!t) break;
          if (!t.sampleTable) break;
          e.skip(4);
          const i = Ss(e);
          let r = 0;
          for (let a = 0; a < i; a++) {
            const i = Ss(e),
              a = xs(e);
            (t.sampleTable.sampleCompositionTimeOffsets.push({
              startIndex: r,
              count: i,
              offset: a,
            }),
              (r += i));
          }
        }
        break;
      case "stsz":
        {
          const t = this.currentTrack;
          if (!t) break;
          if (!t.sampleTable) break;
          e.skip(4);
          const i = Ss(e),
            r = Ss(e);
          if (0 === i)
            for (let a = 0; a < r; a++) {
              const i = Ss(e);
              t.sampleTable.sampleSizes.push(i);
            }
          else t.sampleTable.sampleSizes.push(i);
        }
        break;
      case "stz2":
        {
          const t = this.currentTrack;
          if (!t) break;
          if (!t.sampleTable) break;
          (e.skip(4), e.skip(3));
          const i = ks(e),
            r = Ss(e),
            a = gs(e, Math.ceil((r * i) / 8)),
            s = new ne(a);
          for (let e = 0; e < r; e++) {
            const e = s.readBits(i);
            t.sampleTable.sampleSizes.push(e);
          }
        }
        break;
      case "stss":
        {
          const t = this.currentTrack;
          if (!t) break;
          if (!t.sampleTable) break;
          (e.skip(4), (t.sampleTable.keySampleIndices = []));
          const i = Ss(e);
          for (let r = 0; r < i; r++) {
            const i = Ss(e) - 1;
            t.sampleTable.keySampleIndices.push(i);
          }
          0 !== t.sampleTable.keySampleIndices[0] &&
            t.sampleTable.keySampleIndices.unshift(0);
        }
        break;
      case "stsc":
        {
          const t = this.currentTrack;
          if (!t) break;
          if (!t.sampleTable) break;
          e.skip(4);
          const i = Ss(e);
          for (let a = 0; a < i; a++) {
            const i = Ss(e) - 1,
              r = Ss(e),
              a = Ss(e);
            t.sampleTable.sampleToChunk.push({
              startSampleIndex: -1,
              startChunkIndex: i,
              samplesPerChunk: r,
              sampleDescriptionIndex: a,
            });
          }
          let r = 0;
          for (let e = 0; e < t.sampleTable.sampleToChunk.length; e++)
            if (
              ((t.sampleTable.sampleToChunk[e].startSampleIndex = r),
              e < t.sampleTable.sampleToChunk.length - 1)
            ) {
              r +=
                (t.sampleTable.sampleToChunk[e + 1].startChunkIndex -
                  t.sampleTable.sampleToChunk[e].startChunkIndex) *
                t.sampleTable.sampleToChunk[e].samplesPerChunk;
            }
        }
        break;
      case "stco":
        {
          const t = this.currentTrack;
          if (!t) break;
          if (!t.sampleTable) break;
          e.skip(4);
          const i = Ss(e);
          for (let r = 0; r < i; r++) {
            const i = Ss(e);
            t.sampleTable.chunkOffsets.push(i);
          }
        }
        break;
      case "co64":
        {
          const t = this.currentTrack;
          if (!t) break;
          if (!t.sampleTable) break;
          e.skip(4);
          const i = Ss(e);
          for (let r = 0; r < i; r++) {
            const i = Es(e);
            t.sampleTable.chunkOffsets.push(i);
          }
        }
        break;
      case "mvex":
        ((this.isFragmented = !0),
          this.readContiguousBoxes(e.slice(r, i.contentSize)));
        break;
      case "mehd":
        {
          const t = ks(e);
          e.skip(3);
          const i = 1 === t ? Es(e) : Ss(e);
          this.movieDurationInTimescale = i;
        }
        break;
      case "trex":
        {
          e.skip(4);
          const t = Ss(e),
            i = Ss(e),
            r = Ss(e),
            a = Ss(e),
            s = Ss(e);
          this.fragmentTrackDefaults.push({
            trackId: t,
            defaultSampleDescriptionIndex: i,
            defaultSampleDuration: r,
            defaultSampleSize: a,
            defaultSampleFlags: s,
          });
        }
        break;
      case "tfra":
        {
          const t = ks(e);
          e.skip(3);
          const i = Ss(e),
            r = this.tracks.find((e) => e.id === i);
          if (!r) break;
          const a = Ss(e),
            s = (12 & a) >> 2,
            n = 3 & a,
            o = [ks, ws, bs, Ss],
            c = o[(48 & a) >> 4],
            l = o[s],
            h = o[n],
            d = Ss(e);
          for (let u = 0; u < d; u++) {
            const i = 1 === t ? Es(e) : Ss(e),
              a = 1 === t ? Es(e) : Ss(e);
            (c(e),
              l(e),
              h(e),
              r.fragmentLookupTable.push({ timestamp: i, moofOffset: a }));
          }
          r.fragmentLookupTable.sort((e, t) => e.timestamp - t.timestamp);
          for (let e = 0; e < r.fragmentLookupTable.length - 1; e++) {
            const t = r.fragmentLookupTable[e],
              i = r.fragmentLookupTable[e + 1];
            t.timestamp === i.timestamp &&
              (r.fragmentLookupTable.splice(e + 1, 1), e--);
          }
        }
        break;
      case "moof":
        ((this.currentFragment = {
          moofOffset: t,
          moofSize: i.totalSize,
          implicitBaseDataOffset: t,
          trackData: new Map(),
        }),
          this.readContiguousBoxes(e.slice(r, i.contentSize)),
          (this.lastReadFragment = this.currentFragment),
          (this.currentFragment = null));
        break;
      case "traf":
        if (
          (ie(this.currentFragment),
          this.readContiguousBoxes(e.slice(r, i.contentSize)),
          this.currentTrack)
        ) {
          const e = this.currentFragment.trackData.get(this.currentTrack.id);
          if (e) {
            const { currentFragmentState: t } = this.currentTrack;
            (ie(t),
              null !== t.startTimestamp &&
                (fr(e, t.startTimestamp), (e.startTimestampIsFinal = !0)));
          }
          ((this.currentTrack.currentFragmentState = null),
            (this.currentTrack = null));
        }
        break;
      case "tfhd":
        {
          (ie(this.currentFragment), e.skip(1));
          const t = bs(e),
            i = Boolean(1 & t),
            r = Boolean(2 & t),
            a = Boolean(8 & t),
            s = Boolean(16 & t),
            n = Boolean(32 & t),
            o = Boolean(65536 & t),
            c = Boolean(131072 & t),
            l = Ss(e),
            h = this.tracks.find((e) => e.id === l);
          if (!h) break;
          const d = this.fragmentTrackDefaults.find((e) => e.trackId === l);
          ((this.currentTrack = h),
            (h.currentFragmentState = {
              baseDataOffset: this.currentFragment.implicitBaseDataOffset,
              sampleDescriptionIndex: d?.defaultSampleDescriptionIndex ?? null,
              defaultSampleDuration: d?.defaultSampleDuration ?? null,
              defaultSampleSize: d?.defaultSampleSize ?? null,
              defaultSampleFlags: d?.defaultSampleFlags ?? null,
              startTimestamp: null,
            }),
            i
              ? (h.currentFragmentState.baseDataOffset = Es(e))
              : c &&
                (h.currentFragmentState.baseDataOffset =
                  this.currentFragment.moofOffset),
            r && (h.currentFragmentState.sampleDescriptionIndex = Ss(e)),
            a && (h.currentFragmentState.defaultSampleDuration = Ss(e)),
            s && (h.currentFragmentState.defaultSampleSize = Ss(e)),
            n && (h.currentFragmentState.defaultSampleFlags = Ss(e)),
            o && (h.currentFragmentState.defaultSampleDuration = 0));
        }
        break;
      case "tfdt":
        {
          const t = this.currentTrack;
          if (!t) break;
          ie(t.currentFragmentState);
          const i = ks(e);
          e.skip(3);
          const r = 0 === i ? Ss(e) : Es(e);
          t.currentFragmentState.startTimestamp = r;
        }
        break;
      case "trun":
        {
          const t = this.currentTrack;
          if (!t) break;
          if (
            (ie(this.currentFragment),
            ie(t.currentFragmentState),
            this.currentFragment.trackData.has(t.id))
          ) {
            console.warn(
              "Can't have two trun boxes for the same track in one fragment. Ignoring...",
            );
            break;
          }
          const i = ks(e),
            r = bs(e),
            a = Boolean(1 & r),
            s = Boolean(4 & r),
            n = Boolean(256 & r),
            o = Boolean(512 & r),
            c = Boolean(1024 & r),
            l = Boolean(2048 & r),
            h = Ss(e);
          let d = t.currentFragmentState.baseDataOffset;
          a && (d += xs(e));
          let u = null;
          s && (u = Ss(e));
          let m = d;
          if (0 === h) {
            this.currentFragment.implicitBaseDataOffset = m;
            break;
          }
          let p = 0;
          const f = {
            track: t,
            startTimestamp: 0,
            endTimestamp: 0,
            firstKeyFrameTimestamp: null,
            samples: [],
            presentationTimestamps: [],
            startTimestampIsFinal: !1,
          };
          this.currentFragment.trackData.set(t.id, f);
          for (let y = 0; y < h; y++) {
            let r, a, s;
            (n
              ? (r = Ss(e))
              : (ie(null !== t.currentFragmentState.defaultSampleDuration),
                (r = t.currentFragmentState.defaultSampleDuration)),
              o
                ? (a = Ss(e))
                : (ie(null !== t.currentFragmentState.defaultSampleSize),
                  (a = t.currentFragmentState.defaultSampleSize)),
              c
                ? (s = Ss(e))
                : (ie(null !== t.currentFragmentState.defaultSampleFlags),
                  (s = t.currentFragmentState.defaultSampleFlags)),
              0 === y && null !== u && (s = u));
            let h = 0;
            l && (h = 0 === i ? Ss(e) : xs(e));
            const d = !(65536 & s);
            (f.samples.push({
              presentationTimestamp: p + h,
              duration: r,
              byteOffset: m,
              byteSize: a,
              isKeyFrame: d,
            }),
              (m += a),
              (p += r));
          }
          f.presentationTimestamps = f.samples
            .map((e, t) => ({
              presentationTimestamp: e.presentationTimestamp,
              sampleIndex: t,
            }))
            .sort((e, t) => e.presentationTimestamp - t.presentationTimestamp);
          for (let e = 0; e < f.presentationTimestamps.length; e++) {
            const t = f.presentationTimestamps[e],
              i = f.samples[t.sampleIndex];
            if (
              (null === f.firstKeyFrameTimestamp &&
                i.isKeyFrame &&
                (f.firstKeyFrameTimestamp = i.presentationTimestamp),
              e < f.presentationTimestamps.length - 1)
            ) {
              const r = f.presentationTimestamps[e + 1];
              i.duration = r.presentationTimestamp - t.presentationTimestamp;
            }
          }
          const g = f.samples[f.presentationTimestamps[0].sampleIndex],
            k = f.samples[ae(f.presentationTimestamps).sampleIndex];
          ((f.startTimestamp = g.presentationTimestamp),
            (f.endTimestamp = k.presentationTimestamp + k.duration),
            (this.currentFragment.implicitBaseDataOffset = m));
        }
        break;
      case "udta":
        {
          const t = this.iterateContiguousBoxes(e.slice(r, i.contentSize));
          for (const { boxInfo: e, slice: i } of t) {
            if ("meta" !== e.name && !this.currentTrack) {
              const t = i.filePos;
              ((this.metadataTags.raw ??= {}),
                "©" === e.name[0]
                  ? (this.metadataTags.raw[e.name] ??= sr(i))
                  : (this.metadataTags.raw[e.name] ??= gs(i, e.contentSize)),
                (i.filePos = t));
            }
            switch (e.name) {
              case "meta":
                (i.skip(-e.headerSize), this.traverseBox(i));
                break;
              case "©nam":
              case "name":
                this.currentTrack
                  ? (this.currentTrack.name = de.decode(gs(i, e.contentSize)))
                  : (this.metadataTags.title ??= sr(i));
                break;
              case "©des":
                this.currentTrack || (this.metadataTags.description ??= sr(i));
                break;
              case "©ART":
                this.currentTrack || (this.metadataTags.artist ??= sr(i));
                break;
              case "©alb":
                this.currentTrack || (this.metadataTags.album ??= sr(i));
                break;
              case "albr":
                this.currentTrack || (this.metadataTags.albumArtist ??= sr(i));
                break;
              case "©gen":
                this.currentTrack || (this.metadataTags.genre ??= sr(i));
                break;
              case "©day":
                if (!this.currentTrack) {
                  const e = new Date(sr(i));
                  Number.isNaN(e.getTime()) || (this.metadataTags.date ??= e);
                }
                break;
              case "©cmt":
                this.currentTrack || (this.metadataTags.comment ??= sr(i));
                break;
              case "©lyr":
                this.currentTrack || (this.metadataTags.lyrics ??= sr(i));
            }
          }
        }
        break;
      case "meta":
        {
          if (this.currentTrack) break;
          const t = 0 !== Ss(e);
          ((this.currentMetadataKeys = new Map()),
            t
              ? this.readContiguousBoxes(e.slice(r, i.contentSize))
              : this.readContiguousBoxes(e.slice(r + 4, i.contentSize - 4)),
            (this.currentMetadataKeys = null));
        }
        break;
      case "keys":
        {
          if (!this.currentMetadataKeys) break;
          e.skip(4);
          const t = Ss(e);
          for (let i = 0; i < t; i++) {
            const t = Ss(e);
            e.skip(4);
            const r = de.decode(gs(e, t - 8));
            this.currentMetadataKeys.set(i + 1, r);
          }
        }
        break;
      case "ilst": {
        if (!this.currentMetadataKeys) break;
        const t = this.iterateContiguousBoxes(e.slice(r, i.contentSize));
        for (const { boxInfo: e, slice: i } of t) {
          let t = e.name;
          const r =
            (t.charCodeAt(0) << 24) +
            (t.charCodeAt(1) << 16) +
            (t.charCodeAt(2) << 8) +
            t.charCodeAt(3);
          this.currentMetadataKeys.has(r) &&
            (t = this.currentMetadataKeys.get(r));
          const a = nr(i);
          switch (
            ((this.metadataTags.raw ??= {}),
            (this.metadataTags.raw[t] ??= a),
            t)
          ) {
            case "©nam":
            case "titl":
            case "com.apple.quicktime.title":
            case "title":
              "string" == typeof a && (this.metadataTags.title ??= a);
              break;
            case "©des":
            case "desc":
            case "dscp":
            case "com.apple.quicktime.description":
            case "description":
              "string" == typeof a && (this.metadataTags.description ??= a);
              break;
            case "©ART":
            case "com.apple.quicktime.artist":
            case "artist":
              "string" == typeof a && (this.metadataTags.artist ??= a);
              break;
            case "©alb":
            case "albm":
            case "com.apple.quicktime.album":
            case "album":
              "string" == typeof a && (this.metadataTags.album ??= a);
              break;
            case "aART":
            case "album_artist":
              "string" == typeof a && (this.metadataTags.albumArtist ??= a);
              break;
            case "©cmt":
            case "com.apple.quicktime.comment":
            case "comment":
              "string" == typeof a && (this.metadataTags.comment ??= a);
              break;
            case "©gen":
            case "gnre":
            case "com.apple.quicktime.genre":
            case "genre":
              "string" == typeof a && (this.metadataTags.genre ??= a);
              break;
            case "©lyr":
            case "lyrics":
              "string" == typeof a && (this.metadataTags.lyrics ??= a);
              break;
            case "©day":
            case "rldt":
            case "com.apple.quicktime.creationdate":
            case "date":
              if ("string" == typeof a) {
                const e = new Date(a);
                Number.isNaN(e.getTime()) || (this.metadataTags.date ??= e);
              }
              break;
            case "covr":
            case "com.apple.quicktime.artwork":
              a instanceof nt
                ? ((this.metadataTags.images ??= []),
                  this.metadataTags.images.push({
                    data: a.data,
                    kind: "coverFront",
                    mimeType: a.mimeType,
                  }))
                : a instanceof Uint8Array &&
                  ((this.metadataTags.images ??= []),
                  this.metadataTags.images.push({
                    data: a,
                    kind: "coverFront",
                    mimeType: "image/*",
                  }));
              break;
            case "track":
              if ("string" == typeof a) {
                const e = a.split("/"),
                  t = Number.parseInt(e[0], 10),
                  i = e[1] && Number.parseInt(e[1], 10);
                (Number.isInteger(t) &&
                  t > 0 &&
                  (this.metadataTags.trackNumber ??= t),
                  i &&
                    Number.isInteger(i) &&
                    i > 0 &&
                    (this.metadataTags.tracksTotal ??= i));
              }
              break;
            case "trkn":
              if (a instanceof Uint8Array && a.length >= 6) {
                const e = he(a),
                  t = e.getUint16(2, !1),
                  i = e.getUint16(4, !1);
                (t > 0 && (this.metadataTags.trackNumber ??= t),
                  i > 0 && (this.metadataTags.tracksTotal ??= i));
              }
              break;
            case "disc":
            case "disk":
              if (a instanceof Uint8Array && a.length >= 6) {
                const e = he(a),
                  t = e.getUint16(2, !1),
                  i = e.getUint16(4, !1);
                (t > 0 && (this.metadataTags.discNumber ??= t),
                  i > 0 && (this.metadataTags.discsTotal ??= i));
              }
          }
        }
      }
    }
    return ((e.filePos = a), !0);
  }
}
class cr {
  constructor(e) {
    ((this.internalTrack = e),
      (this.packetToSampleIndex = new WeakMap()),
      (this.packetToFragmentLocation = new WeakMap()));
  }
  getId() {
    return this.internalTrack.id;
  }
  getCodec() {
    throw new Error("Not implemented on base class.");
  }
  getInternalCodecId() {
    return this.internalTrack.internalCodecId;
  }
  getName() {
    return this.internalTrack.name;
  }
  getLanguageCode() {
    return this.internalTrack.languageCode;
  }
  getTimeResolution() {
    return this.internalTrack.timescale;
  }
  getDisposition() {
    return this.internalTrack.disposition;
  }
  async computeDuration() {
    const e = await this.getPacket(1 / 0, { metadataOnly: !0 });
    return (e?.timestamp ?? 0) + (e?.duration ?? 0);
  }
  async getFirstTimestamp() {
    const e = await this.getFirstPacket({ metadataOnly: !0 });
    return e?.timestamp ?? 0;
  }
  async getFirstPacket(e) {
    const t = await this.fetchPacketForSampleIndex(0, e);
    return t || !this.internalTrack.demuxer.isFragmented
      ? t
      : this.performFragmentedLookup(
          null,
          (e) =>
            e.trackData.get(this.internalTrack.id)
              ? { sampleIndex: 0, correctSampleFound: !0 }
              : { sampleIndex: -1, correctSampleFound: !1 },
          -1 / 0,
          1 / 0,
          e,
        );
  }
  mapTimestampIntoTimescale(e) {
    return (
      ze(e * this.internalTrack.timescale) + this.internalTrack.editListOffset
    );
  }
  async getPacket(e, t) {
    const i = this.mapTimestampIntoTimescale(e),
      r = this.internalTrack.demuxer.getSampleTableForTrack(this.internalTrack),
      a = dr(r, i),
      s = await this.fetchPacketForSampleIndex(a, t);
    return kr(r) && this.internalTrack.demuxer.isFragmented
      ? this.performFragmentedLookup(
          null,
          (e) => {
            const t = e.trackData.get(this.internalTrack.id);
            if (!t) return { sampleIndex: -1, correctSampleFound: !1 };
            const r = Pe(
              t.presentationTimestamps,
              i,
              (e) => e.presentationTimestamp,
            );
            return {
              sampleIndex:
                -1 !== r ? t.presentationTimestamps[r].sampleIndex : -1,
              correctSampleFound: -1 !== r && i < t.endTimestamp,
            };
          },
          i,
          i,
          t,
        )
      : s;
  }
  async getNextPacket(e, t) {
    const i = this.packetToSampleIndex.get(e);
    if (void 0 !== i) return this.fetchPacketForSampleIndex(i + 1, t);
    const r = this.packetToFragmentLocation.get(e);
    if (void 0 === r)
      throw new Error("Packet was not created from this track.");
    return this.performFragmentedLookup(
      r.fragment,
      (e) => {
        if (e === r.fragment) {
          const t = e.trackData.get(this.internalTrack.id);
          if (r.sampleIndex + 1 < t.samples.length)
            return { sampleIndex: r.sampleIndex + 1, correctSampleFound: !0 };
        } else {
          if (e.trackData.get(this.internalTrack.id))
            return { sampleIndex: 0, correctSampleFound: !0 };
        }
        return { sampleIndex: -1, correctSampleFound: !1 };
      },
      -1 / 0,
      1 / 0,
      t,
    );
  }
  async getKeyPacket(e, t) {
    const i = this.mapTimestampIntoTimescale(e),
      r = this.internalTrack.demuxer.getSampleTableForTrack(this.internalTrack),
      a = dr(r, i),
      s = -1 === a ? -1 : mr(r, a),
      n = await this.fetchPacketForSampleIndex(s, t);
    return kr(r) && this.internalTrack.demuxer.isFragmented
      ? this.performFragmentedLookup(
          null,
          (e) => {
            const t = e.trackData.get(this.internalTrack.id);
            if (!t) return { sampleIndex: -1, correctSampleFound: !1 };
            const r = Ae(
              t.presentationTimestamps,
              (e) =>
                t.samples[e.sampleIndex].isKeyFrame &&
                e.presentationTimestamp <= i,
            );
            return {
              sampleIndex:
                -1 !== r ? t.presentationTimestamps[r].sampleIndex : -1,
              correctSampleFound: -1 !== r && i < t.endTimestamp,
            };
          },
          i,
          i,
          t,
        )
      : n;
  }
  async getNextKeyPacket(e, t) {
    const i = this.packetToSampleIndex.get(e);
    if (void 0 !== i) {
      const e = this.internalTrack.demuxer.getSampleTableForTrack(
          this.internalTrack,
        ),
        r = pr(e, i);
      return this.fetchPacketForSampleIndex(r, t);
    }
    const r = this.packetToFragmentLocation.get(e);
    if (void 0 === r)
      throw new Error("Packet was not created from this track.");
    return this.performFragmentedLookup(
      r.fragment,
      (e) => {
        if (e === r.fragment) {
          const t = e.trackData
            .get(this.internalTrack.id)
            .samples.findIndex((e, t) => e.isKeyFrame && t > r.sampleIndex);
          if (-1 !== t) return { sampleIndex: t, correctSampleFound: !0 };
        } else {
          const t = e.trackData.get(this.internalTrack.id);
          if (t && null !== t.firstKeyFrameTimestamp) {
            const e = t.samples.findIndex((e) => e.isKeyFrame);
            return (ie(-1 !== e), { sampleIndex: e, correctSampleFound: !0 });
          }
        }
        return { sampleIndex: -1, correctSampleFound: !1 };
      },
      -1 / 0,
      1 / 0,
      t,
    );
  }
  async fetchPacketForSampleIndex(e, t) {
    if (-1 === e) return null;
    const i = this.internalTrack.demuxer.getSampleTableForTrack(
        this.internalTrack,
      ),
      r = ur(i, e);
    if (!r) return null;
    let a;
    if (t.metadataOnly) a = Ci;
    else {
      let e = this.internalTrack.demuxer.reader.requestSlice(
        r.sampleOffset,
        r.sampleSize,
      );
      (e instanceof Promise && (e = await e), ie(e), (a = gs(e, r.sampleSize)));
    }
    const s =
        (r.presentationTimestamp - this.internalTrack.editListOffset) /
        this.internalTrack.timescale,
      n = r.duration / this.internalTrack.timescale,
      o = new Si(a, r.isKeyFrame ? "key" : "delta", s, n, e, r.sampleSize);
    return (this.packetToSampleIndex.set(o, e), o);
  }
  async fetchPacketInFragment(e, t, i) {
    if (-1 === t) return null;
    const r = e.trackData.get(this.internalTrack.id).samples[t];
    let a;
    if ((ie(r), i.metadataOnly)) a = Ci;
    else {
      let e = this.internalTrack.demuxer.reader.requestSlice(
        r.byteOffset,
        r.byteSize,
      );
      (e instanceof Promise && (e = await e), ie(e), (a = gs(e, r.byteSize)));
    }
    const s =
        (r.presentationTimestamp - this.internalTrack.editListOffset) /
        this.internalTrack.timescale,
      n = r.duration / this.internalTrack.timescale,
      o = new Si(
        a,
        r.isKeyFrame ? "key" : "delta",
        s,
        n,
        e.moofOffset + t,
        r.byteSize,
      );
    return (
      this.packetToFragmentLocation.set(o, { fragment: e, sampleIndex: t }),
      o
    );
  }
  async performFragmentedLookup(e, t, i, r, a) {
    const s = this.internalTrack.demuxer;
    let n = null,
      o = null,
      c = -1;
    if (e) {
      const { sampleIndex: i, correctSampleFound: r } = t(e);
      if (r) return this.fetchPacketInFragment(e, i, a);
      -1 !== i && ((o = e), (c = i));
    }
    const l = Pe(this.internalTrack.fragmentLookupTable, i, (e) => e.timestamp),
      h = -1 !== l ? this.internalTrack.fragmentLookupTable[l] : null,
      d = Pe(
        this.internalTrack.fragmentPositionCache,
        i,
        (e) => e.startTimestamp,
      ),
      u = -1 !== d ? this.internalTrack.fragmentPositionCache[d] : null,
      m = Math.max(h?.moofOffset ?? 0, u?.moofOffset ?? 0) || null;
    let p;
    for (
      e
        ? null === m || e.moofOffset >= m
          ? ((p = e.moofOffset + e.moofSize), (n = e))
          : (p = m)
        : (p = m ?? 0);
      ;

    ) {
      if (n) {
        const e = n.trackData.get(this.internalTrack.id);
        if (e && e.startTimestamp > r) break;
      }
      let e = s.reader.requestSliceRange(p, 8, er);
      if ((e instanceof Promise && (e = await e), !e)) break;
      const i = p,
        l = tr(e);
      if (!l) break;
      if ("moof" === l.name) {
        n = await s.readFragment(i);
        const { sampleIndex: e, correctSampleFound: r } = t(n);
        if (r) return this.fetchPacketInFragment(n, e, a);
        -1 !== e && ((o = n), (c = e));
      }
      p = i + l.totalSize;
    }
    if (h && (!o || o.moofOffset < h.moofOffset)) {
      const e = this.internalTrack.fragmentLookupTable[l - 1];
      ie(!e || e.timestamp < h.timestamp);
      const i = e?.timestamp ?? -1 / 0;
      return this.performFragmentedLookup(null, t, i, r, a);
    }
    return o ? this.fetchPacketInFragment(o, c, a) : null;
  }
}
class lr extends cr {
  constructor(e) {
    (super(e), (this.decoderConfigPromise = null), (this.internalTrack = e));
  }
  getCodec() {
    return this.internalTrack.info.codec;
  }
  getCodedWidth() {
    return this.internalTrack.info.width;
  }
  getCodedHeight() {
    return this.internalTrack.info.height;
  }
  getRotation() {
    return this.internalTrack.rotation;
  }
  async getColorSpace() {
    return {
      primaries: this.internalTrack.info.colorSpace?.primaries,
      transfer: this.internalTrack.info.colorSpace?.transfer,
      matrix: this.internalTrack.info.colorSpace?.matrix,
      fullRange: this.internalTrack.info.colorSpace?.fullRange,
    };
  }
  async canBeTransparent() {
    return !1;
  }
  async getDecoderConfig() {
    return this.internalTrack.info.codec
      ? (this.decoderConfigPromise ??= (async () => {
          if (
            "vp9" !== this.internalTrack.info.codec ||
            this.internalTrack.info.vp9CodecInfo
          ) {
            if (
              "av1" === this.internalTrack.info.codec &&
              !this.internalTrack.info.av1CodecInfo
            ) {
              const e = await this.getFirstPacket({});
              this.internalTrack.info.av1CodecInfo = e && li(e.data);
            }
          } else {
            const e = await this.getFirstPacket({});
            this.internalTrack.info.vp9CodecInfo = e && oi(e.data);
          }
          return {
            codec: St(this.internalTrack.info),
            codedWidth: this.internalTrack.info.width,
            codedHeight: this.internalTrack.info.height,
            description: this.internalTrack.info.codecDescription ?? void 0,
            colorSpace: this.internalTrack.info.colorSpace ?? void 0,
          };
        })())
      : null;
  }
}
class hr extends cr {
  constructor(e) {
    (super(e), (this.decoderConfig = null), (this.internalTrack = e));
  }
  getCodec() {
    return this.internalTrack.info.codec;
  }
  getNumberOfChannels() {
    return this.internalTrack.info.numberOfChannels;
  }
  getSampleRate() {
    return this.internalTrack.info.sampleRate;
  }
  async getDecoderConfig() {
    return this.internalTrack.info.codec
      ? (this.decoderConfig ??= {
          codec: xt(this.internalTrack.info),
          numberOfChannels: this.internalTrack.info.numberOfChannels,
          sampleRate: this.internalTrack.info.sampleRate,
          description: this.internalTrack.info.codecDescription ?? void 0,
        })
      : null;
  }
}
const dr = (e, t) => {
    if (e.presentationTimestamps) {
      const i = Pe(e.presentationTimestamps, t, (e) => e.presentationTimestamp);
      return -1 === i ? -1 : e.presentationTimestamps[i].sampleIndex;
    }
    {
      const i = Pe(e.sampleTimingEntries, t, (e) => e.startDecodeTimestamp);
      if (-1 === i) return -1;
      const r = e.sampleTimingEntries[i];
      return (
        r.startIndex +
        Math.min(
          Math.floor((t - r.startDecodeTimestamp) / r.delta),
          r.count - 1,
        )
      );
    }
  },
  ur = (e, t) => {
    const i = Pe(e.sampleTimingEntries, t, (e) => e.startIndex),
      r = e.sampleTimingEntries[i];
    if (!r || r.startIndex + r.count <= t) return null;
    let a = r.startDecodeTimestamp + (t - r.startIndex) * r.delta;
    const s = Pe(e.sampleCompositionTimeOffsets, t, (e) => e.startIndex),
      n = e.sampleCompositionTimeOffsets[s];
    n && t - n.startIndex < n.count && (a += n.offset);
    const o = e.sampleSizes[Math.min(t, e.sampleSizes.length - 1)],
      c = Pe(e.sampleToChunk, t, (e) => e.startSampleIndex),
      l = e.sampleToChunk[c];
    ie(l);
    const h =
        l.startChunkIndex +
        Math.floor((t - l.startSampleIndex) / l.samplesPerChunk),
      d = e.chunkOffsets[h],
      u = l.startSampleIndex + (h - l.startChunkIndex) * l.samplesPerChunk;
    let m = 0,
      p = d;
    if (1 === e.sampleSizes.length)
      ((p += o * (t - u)), (m += o * l.samplesPerChunk));
    else
      for (let g = u; g < u + l.samplesPerChunk; g++) {
        const i = e.sampleSizes[g];
        (g < t && (p += i), (m += i));
      }
    let f = r.delta;
    if (e.presentationTimestamps) {
      const i = e.presentationTimestampIndexMap[t];
      if ((ie(void 0 !== i), i < e.presentationTimestamps.length - 1)) {
        f = e.presentationTimestamps[i + 1].presentationTimestamp - a;
      }
    }
    return {
      presentationTimestamp: a,
      duration: f,
      sampleOffset: p,
      sampleSize: o,
      chunkOffset: d,
      chunkSize: m,
      isKeyFrame:
        !e.keySampleIndices || -1 !== xe(e.keySampleIndices, t, (e) => e),
    };
  },
  mr = (e, t) => {
    if (!e.keySampleIndices) return t;
    const i = Pe(e.keySampleIndices, t, (e) => e);
    return e.keySampleIndices[i] ?? -1;
  },
  pr = (e, t) => {
    if (!e.keySampleIndices) return t + 1;
    const i = Pe(e.keySampleIndices, t, (e) => e);
    return e.keySampleIndices[i + 1] ?? -1;
  },
  fr = (e, t) => {
    ((e.startTimestamp += t), (e.endTimestamp += t));
    for (const i of e.samples) i.presentationTimestamp += t;
    for (const i of e.presentationTimestamps) i.presentationTimestamp += t;
  },
  gr = (e) => {
    const [t, , , i] = e,
      r = Math.hypot(t, i),
      a = t / r,
      s = i / r,
      n = -Math.atan2(s, a) * (180 / Math.PI);
    return Number.isFinite(n) ? n : 0;
  },
  kr = (e) => 0 === e.sampleSizes.length;
class yr {
  constructor(e) {
    this.value = e;
  }
}
class wr {
  constructor(e) {
    this.value = e;
  }
}
class br {
  constructor(e) {
    this.value = e;
  }
}
class Tr {
  constructor(e) {
    this.value = e;
  }
}
var Cr;
!(function (e) {
  ((e[(e.EBML = 440786851)] = "EBML"),
    (e[(e.EBMLVersion = 17030)] = "EBMLVersion"),
    (e[(e.EBMLReadVersion = 17143)] = "EBMLReadVersion"),
    (e[(e.EBMLMaxIDLength = 17138)] = "EBMLMaxIDLength"),
    (e[(e.EBMLMaxSizeLength = 17139)] = "EBMLMaxSizeLength"),
    (e[(e.DocType = 17026)] = "DocType"),
    (e[(e.DocTypeVersion = 17031)] = "DocTypeVersion"),
    (e[(e.DocTypeReadVersion = 17029)] = "DocTypeReadVersion"),
    (e[(e.Void = 236)] = "Void"),
    (e[(e.Segment = 408125543)] = "Segment"),
    (e[(e.SeekHead = 290298740)] = "SeekHead"),
    (e[(e.Seek = 19899)] = "Seek"),
    (e[(e.SeekID = 21419)] = "SeekID"),
    (e[(e.SeekPosition = 21420)] = "SeekPosition"),
    (e[(e.Duration = 17545)] = "Duration"),
    (e[(e.Info = 357149030)] = "Info"),
    (e[(e.TimestampScale = 2807729)] = "TimestampScale"),
    (e[(e.MuxingApp = 19840)] = "MuxingApp"),
    (e[(e.WritingApp = 22337)] = "WritingApp"),
    (e[(e.Tracks = 374648427)] = "Tracks"),
    (e[(e.TrackEntry = 174)] = "TrackEntry"),
    (e[(e.TrackNumber = 215)] = "TrackNumber"),
    (e[(e.TrackUID = 29637)] = "TrackUID"),
    (e[(e.TrackType = 131)] = "TrackType"),
    (e[(e.FlagEnabled = 185)] = "FlagEnabled"),
    (e[(e.FlagDefault = 136)] = "FlagDefault"),
    (e[(e.FlagForced = 21930)] = "FlagForced"),
    (e[(e.FlagOriginal = 21934)] = "FlagOriginal"),
    (e[(e.FlagHearingImpaired = 21931)] = "FlagHearingImpaired"),
    (e[(e.FlagVisualImpaired = 21932)] = "FlagVisualImpaired"),
    (e[(e.FlagCommentary = 21935)] = "FlagCommentary"),
    (e[(e.FlagLacing = 156)] = "FlagLacing"),
    (e[(e.Name = 21358)] = "Name"),
    (e[(e.Language = 2274716)] = "Language"),
    (e[(e.LanguageBCP47 = 2274717)] = "LanguageBCP47"),
    (e[(e.CodecID = 134)] = "CodecID"),
    (e[(e.CodecPrivate = 25506)] = "CodecPrivate"),
    (e[(e.CodecDelay = 22186)] = "CodecDelay"),
    (e[(e.SeekPreRoll = 22203)] = "SeekPreRoll"),
    (e[(e.DefaultDuration = 2352003)] = "DefaultDuration"),
    (e[(e.Video = 224)] = "Video"),
    (e[(e.PixelWidth = 176)] = "PixelWidth"),
    (e[(e.PixelHeight = 186)] = "PixelHeight"),
    (e[(e.AlphaMode = 21440)] = "AlphaMode"),
    (e[(e.Audio = 225)] = "Audio"),
    (e[(e.SamplingFrequency = 181)] = "SamplingFrequency"),
    (e[(e.Channels = 159)] = "Channels"),
    (e[(e.BitDepth = 25188)] = "BitDepth"),
    (e[(e.SimpleBlock = 163)] = "SimpleBlock"),
    (e[(e.BlockGroup = 160)] = "BlockGroup"),
    (e[(e.Block = 161)] = "Block"),
    (e[(e.BlockAdditions = 30113)] = "BlockAdditions"),
    (e[(e.BlockMore = 166)] = "BlockMore"),
    (e[(e.BlockAdditional = 165)] = "BlockAdditional"),
    (e[(e.BlockAddID = 238)] = "BlockAddID"),
    (e[(e.BlockDuration = 155)] = "BlockDuration"),
    (e[(e.ReferenceBlock = 251)] = "ReferenceBlock"),
    (e[(e.Cluster = 524531317)] = "Cluster"),
    (e[(e.Timestamp = 231)] = "Timestamp"),
    (e[(e.Cues = 475249515)] = "Cues"),
    (e[(e.CuePoint = 187)] = "CuePoint"),
    (e[(e.CueTime = 179)] = "CueTime"),
    (e[(e.CueTrackPositions = 183)] = "CueTrackPositions"),
    (e[(e.CueTrack = 247)] = "CueTrack"),
    (e[(e.CueClusterPosition = 241)] = "CueClusterPosition"),
    (e[(e.Colour = 21936)] = "Colour"),
    (e[(e.MatrixCoefficients = 21937)] = "MatrixCoefficients"),
    (e[(e.TransferCharacteristics = 21946)] = "TransferCharacteristics"),
    (e[(e.Primaries = 21947)] = "Primaries"),
    (e[(e.Range = 21945)] = "Range"),
    (e[(e.Projection = 30320)] = "Projection"),
    (e[(e.ProjectionType = 30321)] = "ProjectionType"),
    (e[(e.ProjectionPoseRoll = 30325)] = "ProjectionPoseRoll"),
    (e[(e.Attachments = 423732329)] = "Attachments"),
    (e[(e.AttachedFile = 24999)] = "AttachedFile"),
    (e[(e.FileDescription = 18046)] = "FileDescription"),
    (e[(e.FileName = 18030)] = "FileName"),
    (e[(e.FileMediaType = 18016)] = "FileMediaType"),
    (e[(e.FileData = 18012)] = "FileData"),
    (e[(e.FileUID = 18094)] = "FileUID"),
    (e[(e.Chapters = 272869232)] = "Chapters"),
    (e[(e.Tags = 307544935)] = "Tags"),
    (e[(e.Tag = 29555)] = "Tag"),
    (e[(e.Targets = 25536)] = "Targets"),
    (e[(e.TargetTypeValue = 26826)] = "TargetTypeValue"),
    (e[(e.TargetType = 25546)] = "TargetType"),
    (e[(e.TagTrackUID = 25541)] = "TagTrackUID"),
    (e[(e.TagEditionUID = 25545)] = "TagEditionUID"),
    (e[(e.TagChapterUID = 25540)] = "TagChapterUID"),
    (e[(e.TagAttachmentUID = 25542)] = "TagAttachmentUID"),
    (e[(e.SimpleTag = 26568)] = "SimpleTag"),
    (e[(e.TagName = 17827)] = "TagName"),
    (e[(e.TagLanguage = 17530)] = "TagLanguage"),
    (e[(e.TagString = 17543)] = "TagString"),
    (e[(e.TagBinary = 17541)] = "TagBinary"),
    (e[(e.ContentEncodings = 28032)] = "ContentEncodings"),
    (e[(e.ContentEncoding = 25152)] = "ContentEncoding"),
    (e[(e.ContentEncodingOrder = 20529)] = "ContentEncodingOrder"),
    (e[(e.ContentEncodingScope = 20530)] = "ContentEncodingScope"),
    (e[(e.ContentCompression = 20532)] = "ContentCompression"),
    (e[(e.ContentCompAlgo = 16980)] = "ContentCompAlgo"),
    (e[(e.ContentCompSettings = 16981)] = "ContentCompSettings"),
    (e[(e.ContentEncryption = 20533)] = "ContentEncryption"));
})(Cr || (Cr = {}));
const Sr = [Cr.EBML, Cr.Segment],
  vr = [
    Cr.SeekHead,
    Cr.Info,
    Cr.Cluster,
    Cr.Tracks,
    Cr.Cues,
    Cr.Attachments,
    Cr.Chapters,
    Cr.Tags,
  ],
  xr = [...Sr, ...vr],
  Pr = (e) =>
    e < 256
      ? 1
      : e < 65536
        ? 2
        : e < 1 << 24
          ? 3
          : e < 2 ** 32
            ? 4
            : e < 2 ** 40
              ? 5
              : 6,
  Er = (e) =>
    e < 256n
      ? 1
      : e < 65536n
        ? 2
        : e < 1n << 24n
          ? 3
          : e < 1n << 32n
            ? 4
            : e < 1n << 40n
              ? 5
              : e < 1n << 48n
                ? 6
                : e < 1n << 56n
                  ? 7
                  : 8,
  Ir = (e) =>
    e >= -64 && e < 64
      ? 1
      : e >= -8192 && e < 8192
        ? 2
        : e >= -1048576 && e < 1 << 20
          ? 3
          : e >= -134217728 && e < 1 << 27
            ? 4
            : e >= -17179869184 && e < 2 ** 34
              ? 5
              : 6;
class _r {
  constructor(e) {
    ((this.writer = e),
      (this.helper = new Uint8Array(8)),
      (this.helperView = new DataView(this.helper.buffer)),
      (this.offsets = new WeakMap()),
      (this.dataOffsets = new WeakMap()));
  }
  writeByte(e) {
    (this.helperView.setUint8(0, e),
      this.writer.write(this.helper.subarray(0, 1)));
  }
  writeFloat32(e) {
    (this.helperView.setFloat32(0, e, !1),
      this.writer.write(this.helper.subarray(0, 4)));
  }
  writeFloat64(e) {
    (this.helperView.setFloat64(0, e, !1), this.writer.write(this.helper));
  }
  writeUnsignedInt(e, t = Pr(e)) {
    let i = 0;
    switch (t) {
      case 6:
        this.helperView.setUint8(i++, (e / 2 ** 40) | 0);
      case 5:
        this.helperView.setUint8(i++, (e / 2 ** 32) | 0);
      case 4:
        this.helperView.setUint8(i++, e >> 24);
      case 3:
        this.helperView.setUint8(i++, e >> 16);
      case 2:
        this.helperView.setUint8(i++, e >> 8);
      case 1:
        this.helperView.setUint8(i++, e);
        break;
      default:
        throw new Error("Bad unsigned int size " + t);
    }
    this.writer.write(this.helper.subarray(0, i));
  }
  writeUnsignedBigInt(e, t = Er(e)) {
    let i = 0;
    for (let r = t - 1; r >= 0; r--)
      this.helperView.setUint8(i++, Number((e >> BigInt(8 * r)) & 0xffn));
    this.writer.write(this.helper.subarray(0, i));
  }
  writeSignedInt(e, t = Ir(e)) {
    (e < 0 && (e += 2 ** (8 * t)), this.writeUnsignedInt(e, t));
  }
  writeVarInt(
    e,
    t = ((e) => {
      if (e < 127) return 1;
      if (e < 16383) return 2;
      if (e < 2097151) return 3;
      if (e < 268435455) return 4;
      if (e < 2 ** 35 - 1) return 5;
      if (e < 2 ** 42 - 1) return 6;
      throw new Error("EBML varint size not supported " + e);
    })(e),
  ) {
    let i = 0;
    switch (t) {
      case 1:
        this.helperView.setUint8(i++, 128 | e);
        break;
      case 2:
        (this.helperView.setUint8(i++, 64 | (e >> 8)),
          this.helperView.setUint8(i++, e));
        break;
      case 3:
        (this.helperView.setUint8(i++, 32 | (e >> 16)),
          this.helperView.setUint8(i++, e >> 8),
          this.helperView.setUint8(i++, e));
        break;
      case 4:
        (this.helperView.setUint8(i++, 16 | (e >> 24)),
          this.helperView.setUint8(i++, e >> 16),
          this.helperView.setUint8(i++, e >> 8),
          this.helperView.setUint8(i++, e));
        break;
      case 5:
        (this.helperView.setUint8(i++, 8 | ((e / 2 ** 32) & 7)),
          this.helperView.setUint8(i++, e >> 24),
          this.helperView.setUint8(i++, e >> 16),
          this.helperView.setUint8(i++, e >> 8),
          this.helperView.setUint8(i++, e));
        break;
      case 6:
        (this.helperView.setUint8(i++, 4 | ((e / 2 ** 40) & 3)),
          this.helperView.setUint8(i++, (e / 2 ** 32) | 0),
          this.helperView.setUint8(i++, e >> 24),
          this.helperView.setUint8(i++, e >> 16),
          this.helperView.setUint8(i++, e >> 8),
          this.helperView.setUint8(i++, e));
        break;
      default:
        throw new Error("Bad EBML varint size " + t);
    }
    this.writer.write(this.helper.subarray(0, i));
  }
  writeAsciiString(e) {
    this.writer.write(new Uint8Array(e.split("").map((e) => e.charCodeAt(0))));
  }
  writeEBML(e) {
    if (null !== e)
      if (e instanceof Uint8Array) this.writer.write(e);
      else if (Array.isArray(e)) for (const t of e) this.writeEBML(t);
      else if (
        (this.offsets.set(e, this.writer.getPos()),
        this.writeUnsignedInt(e.id),
        Array.isArray(e.data))
      ) {
        const t = this.writer.getPos(),
          i = -1 === e.size ? 1 : (e.size ?? 4);
        -1 === e.size
          ? this.writeByte(255)
          : this.writer.seek(this.writer.getPos() + i);
        const r = this.writer.getPos();
        if (
          (this.dataOffsets.set(e, r), this.writeEBML(e.data), -1 !== e.size)
        ) {
          const e = this.writer.getPos() - r,
            a = this.writer.getPos();
          (this.writer.seek(t), this.writeVarInt(e, i), this.writer.seek(a));
        }
      } else if ("number" == typeof e.data) {
        const t = e.size ?? Pr(e.data);
        (this.writeVarInt(t), this.writeUnsignedInt(e.data, t));
      } else if ("bigint" == typeof e.data) {
        const t = e.size ?? Er(e.data);
        (this.writeVarInt(t), this.writeUnsignedBigInt(e.data, t));
      } else if ("string" == typeof e.data)
        (this.writeVarInt(e.data.length), this.writeAsciiString(e.data));
      else if (e.data instanceof Uint8Array)
        (this.writeVarInt(e.data.byteLength, e.size),
          this.writer.write(e.data));
      else if (e.data instanceof yr)
        (this.writeVarInt(4), this.writeFloat32(e.data.value));
      else if (e.data instanceof wr)
        (this.writeVarInt(8), this.writeFloat64(e.data.value));
      else if (e.data instanceof br) {
        const t = e.size ?? Ir(e.data.value);
        (this.writeVarInt(t), this.writeSignedInt(e.data.value, t));
      } else if (e.data instanceof Tr) {
        const t = ue.encode(e.data.value);
        (this.writeVarInt(t.length), this.writer.write(t));
      } else Fe(e.data);
  }
}
const Ar = 16,
  Fr = (e) => {
    const t = ks(e);
    if ((e.skip(-1), 0 === t)) return null;
    let i = 1,
      r = 128;
    for (; 0 === (t & r); ) (i++, (r >>= 1));
    return i;
  },
  Br = (e) => {
    const t = ks(e);
    if (0 === t) return null;
    let i = 1,
      r = 128;
    for (; 0 === (t & r); ) (i++, (r >>= 1));
    let a = t & (r - 1);
    for (let s = 1; s < i; s++) ((a *= 256), (a += ks(e)));
    return a;
  },
  Mr = (e, t) => {
    if (t < 1 || t > 8) throw new Error("Bad unsigned int size " + t);
    let i = 0;
    for (let r = 0; r < t; r++) ((i *= 256), (i += ks(e)));
    return i;
  },
  Dr = (e) => {
    const t = Fr(e);
    if (null === t) return null;
    return Mr(e, t);
  },
  Or = (e) => {
    let t = ks(e);
    return (
      255 === t
        ? (t = null)
        : (e.skip(-1), (t = Br(e)), 72057594037927940 === t && (t = null)),
      t
    );
  },
  Rr = (e) => {
    const t = Dr(e);
    if (null === t) return null;
    return { id: t, size: Or(e) };
  },
  zr = (e, t) => {
    const i = gs(e, t);
    let r = 0;
    for (; r < t && 0 !== i[r]; ) r += 1;
    return String.fromCharCode(...i.subarray(0, r));
  },
  Nr = (e, t) => {
    const i = gs(e, t);
    let r = 0;
    for (; r < t && 0 !== i[r]; ) r += 1;
    return de.decode(i.subarray(0, r));
  },
  Ur = (e, t) => {
    if (0 === t) return 0;
    if (4 !== t && 8 !== t) throw new Error("Bad float size " + t);
    return 4 === t ? As(e) : Fs(e);
  },
  Lr = async (e, t, i, r) => {
    const a = new Set(i);
    let s = t;
    for (; null === r || s < r; ) {
      let t = e.requestSliceRange(s, 2, Ar);
      if ((t instanceof Promise && (t = await t), !t)) break;
      const i = Rr(t);
      if (!i) break;
      if (a.has(i.id)) return { pos: s, found: !0 };
      (Hr(i.size), (s = t.filePos + i.size));
    }
    return { pos: null !== r && r > s ? r : s, found: !1 };
  },
  Vr = async (e, t, i, r) => {
    const a = new Set(i);
    let s = t;
    for (; s < r; ) {
      let t = e.requestSliceRange(s, 0, Math.min(65536, r - s));
      if ((t instanceof Promise && (t = await t), !t)) break;
      if (t.length < 8) break;
      for (let e = 0; e < t.length - 8; e++) {
        t.filePos = s;
        const e = Dr(t);
        if (null !== e && a.has(e)) return s;
        s++;
      }
    }
    return null;
  },
  Wr = {
    avc: "V_MPEG4/ISO/AVC",
    hevc: "V_MPEGH/ISO/HEVC",
    vp8: "V_VP8",
    vp9: "V_VP9",
    av1: "V_AV1",
    aac: "A_AAC",
    mp3: "A_MPEG/L3",
    opus: "A_OPUS",
    vorbis: "A_VORBIS",
    flac: "A_FLAC",
    "pcm-u8": "A_PCM/INT/LIT",
    "pcm-s16": "A_PCM/INT/LIT",
    "pcm-s16be": "A_PCM/INT/BIG",
    "pcm-s24": "A_PCM/INT/LIT",
    "pcm-s24be": "A_PCM/INT/BIG",
    "pcm-s32": "A_PCM/INT/LIT",
    "pcm-s32be": "A_PCM/INT/BIG",
    "pcm-f32": "A_PCM/FLOAT/IEEE",
    "pcm-f64": "A_PCM/FLOAT/IEEE",
    webvtt: "S_TEXT/WEBVTT",
  };
function Hr(e) {
  if (null === e)
    throw new Error(
      "Undefined element size is used in a place where it is not supported.",
    );
}
const $r = (e) => {
  let t =
    (e.hasVideo ? "video/" : e.hasAudio ? "audio/" : "application/") +
    (e.isWebM ? "webm" : "x-matroska");
  if (e.codecStrings.length > 0) {
    t += `; codecs="${[...new Set(e.codecStrings.filter(Boolean))].join(", ")}"`;
  }
  return t;
};
var jr, qr, Kr;
(!(function (e) {
  ((e[(e.None = 0)] = "None"),
    (e[(e.Xiph = 1)] = "Xiph"),
    (e[(e.FixedSize = 2)] = "FixedSize"),
    (e[(e.Ebml = 3)] = "Ebml"));
})(jr || (jr = {})),
  (function (e) {
    ((e[(e.Block = 1)] = "Block"),
      (e[(e.Private = 2)] = "Private"),
      (e[(e.Next = 4)] = "Next"));
  })(qr || (qr = {})),
  (function (e) {
    ((e[(e.Zlib = 0)] = "Zlib"),
      (e[(e.Bzlib = 1)] = "Bzlib"),
      (e[(e.lzo1x = 2)] = "lzo1x"),
      (e[(e.HeaderStripping = 3)] = "HeaderStripping"));
  })(Kr || (Kr = {})));
const Qr = [
    { id: Cr.SeekHead, flag: "seekHeadSeen" },
    { id: Cr.Info, flag: "infoSeen" },
    { id: Cr.Tracks, flag: "tracksSeen" },
    { id: Cr.Cues, flag: "cuesSeen" },
  ],
  Xr = 10485760;
class Gr extends ki {
  constructor(e) {
    (super(e),
      (this.readMetadataPromise = null),
      (this.segments = []),
      (this.currentSegment = null),
      (this.currentTrack = null),
      (this.currentCluster = null),
      (this.currentBlock = null),
      (this.currentBlockAdditional = null),
      (this.currentCueTime = null),
      (this.currentDecodingInstruction = null),
      (this.currentTagTargetIsMovie = !0),
      (this.currentSimpleTagName = null),
      (this.currentAttachedFile = null),
      (this.isWebM = !1),
      (this.reader = e._reader));
  }
  async computeDuration() {
    const e = await this.getTracks(),
      t = await Promise.all(e.map((e) => e.computeDuration()));
    return Math.max(0, ...t);
  }
  async getTracks() {
    return (
      await this.readMetadata(),
      this.segments.flatMap((e) => e.tracks.map((e) => e.inputTrack))
    );
  }
  async getMimeType() {
    await this.readMetadata();
    const e = await this.getTracks(),
      t = await Promise.all(e.map((e) => e.getCodecParameterString()));
    return $r({
      isWebM: this.isWebM,
      hasVideo: this.segments.some((e) =>
        e.tracks.some((e) => "video" === e.info?.type),
      ),
      hasAudio: this.segments.some((e) =>
        e.tracks.some((e) => "audio" === e.info?.type),
      ),
      codecStrings: t.filter(Boolean),
    });
  }
  async getMetadataTags() {
    await this.readMetadata();
    for (const t of this.segments)
      t.metadataTagsCollected ||
        (null !== this.reader.fileSize && (await this.loadSegmentMetadata(t)),
        (t.metadataTagsCollected = !0));
    let e = {};
    for (const t of this.segments) e = { ...e, ...t.metadataTags };
    return e;
  }
  readMetadata() {
    return (this.readMetadataPromise ??= (async () => {
      let e = 0;
      for (;;) {
        let t = this.reader.requestSliceRange(e, 2, Ar);
        if ((t instanceof Promise && (t = await t), !t)) break;
        const i = Rr(t);
        if (!i) break;
        const r = i.id;
        let a = i.size;
        const s = t.filePos;
        if (r === Cr.EBML) {
          Hr(a);
          let e = this.reader.requestSlice(s, a);
          if ((e instanceof Promise && (e = await e), !e)) break;
          this.readContiguousElements(e);
        } else if (r === Cr.Segment) {
          if ((await this.readSegment(s, a), null === a)) break;
          if (null === this.reader.fileSize) break;
        } else if (r === Cr.Cluster) {
          if (null === this.reader.fileSize) break;
          if (null === a) {
            a = (await Lr(this.reader, s, xr, this.reader.fileSize)).pos - s;
          }
          const e = ae(this.segments);
          e && (e.elementEndPos = s + a);
        }
        (Hr(a), (e = s + a));
      }
    })());
  }
  async readSegment(e, t) {
    ((this.currentSegment = {
      seekHeadSeen: !1,
      infoSeen: !1,
      tracksSeen: !1,
      cuesSeen: !1,
      tagsSeen: !1,
      attachmentsSeen: !1,
      timestampScale: -1,
      timestampFactor: -1,
      duration: -1,
      seekEntries: [],
      tracks: [],
      cuePoints: [],
      dataStartPos: e,
      elementEndPos: null === t ? null : e + t,
      clusterSeekStartPos: e,
      lastReadCluster: null,
      metadataTags: {},
      metadataTagsCollected: !1,
    }),
      this.segments.push(this.currentSegment));
    let i = e;
    for (
      ;
      null === this.currentSegment.elementEndPos ||
      i < this.currentSegment.elementEndPos;

    ) {
      let e = this.reader.requestSliceRange(i, 2, Ar);
      if ((e instanceof Promise && (e = await e), !e)) break;
      const t = i,
        r = Rr(e);
      if (!r || (!vr.includes(r.id) && r.id !== Cr.Void)) {
        const e = await Vr(
          this.reader,
          t,
          vr,
          Math.min(this.currentSegment.elementEndPos ?? 1 / 0, t + Xr),
        );
        if (e) {
          i = e;
          continue;
        }
        break;
      }
      const { id: a, size: s } = r,
        n = e.filePos,
        o = Qr.findIndex((e) => e.id === a);
      if (-1 !== o) {
        const e = Qr[o].flag;
        ((this.currentSegment[e] = !0), Hr(s));
        let t = this.reader.requestSlice(n, s);
        (t instanceof Promise && (t = await t),
          t && this.readContiguousElements(t));
      } else if (a === Cr.Tags || a === Cr.Attachments) {
        (a === Cr.Tags
          ? (this.currentSegment.tagsSeen = !0)
          : (this.currentSegment.attachmentsSeen = !0),
          Hr(s));
        let e = this.reader.requestSlice(n, s);
        (e instanceof Promise && (e = await e),
          e && this.readContiguousElements(e));
      } else if (a === Cr.Cluster) {
        this.currentSegment.clusterSeekStartPos = t;
        break;
      }
      if (null === s) break;
      i = n + s;
    }
    if (
      (this.currentSegment.seekEntries.sort(
        (e, t) => e.segmentPosition - t.segmentPosition,
      ),
      null !== this.reader.fileSize)
    )
      for (const n of this.currentSegment.seekEntries) {
        const t = Qr.find((e) => e.id === n.id);
        if (!t) continue;
        if (this.currentSegment[t.flag]) continue;
        let i = this.reader.requestSliceRange(e + n.segmentPosition, 2, Ar);
        if ((i instanceof Promise && (i = await i), !i)) continue;
        const r = Rr(i);
        if (!r) continue;
        const { id: a, size: s } = r;
        if (a !== t.id) continue;
        (Hr(s), (this.currentSegment[t.flag] = !0));
        let o = this.reader.requestSlice(i.filePos, s);
        (o instanceof Promise && (o = await o),
          o && this.readContiguousElements(o));
      }
    (-1 === this.currentSegment.timestampScale &&
      ((this.currentSegment.timestampScale = 1e6),
      (this.currentSegment.timestampFactor = 1e3)),
      this.currentSegment.tracks.sort(
        (e, t) => Number(t.disposition.default) - Number(e.disposition.default),
      ));
    const r = new Map(this.currentSegment.tracks.map((e) => [e.id, e]));
    for (const n of this.currentSegment.cuePoints) {
      const e = r.get(n.trackId);
      e && e.cuePoints.push(n);
    }
    for (const n of this.currentSegment.tracks) {
      n.cuePoints.sort((e, t) => e.time - t.time);
      for (let e = 0; e < n.cuePoints.length - 1; e++) {
        const t = n.cuePoints[e],
          i = n.cuePoints[e + 1];
        t.time === i.time && (n.cuePoints.splice(e + 1, 1), e--);
      }
    }
    let a = null,
      s = -1 / 0;
    for (const n of this.currentSegment.tracks)
      n.cuePoints.length > s && ((s = n.cuePoints.length), (a = n));
    for (const n of this.currentSegment.tracks)
      0 === n.cuePoints.length && (n.cuePoints = a.cuePoints);
    this.currentSegment = null;
  }
  async readCluster(e, t) {
    if (t.lastReadCluster?.elementStartPos === e) return t.lastReadCluster;
    let i = this.reader.requestSliceRange(e, 2, Ar);
    (i instanceof Promise && (i = await i), ie(i));
    const r = e,
      a = Rr(i);
    ie(a);
    ie(a.id === Cr.Cluster);
    let s = a.size;
    const n = i.filePos;
    if (null === s) {
      s = (await Lr(this.reader, n, xr, t.elementEndPos)).pos - n;
    }
    let o = this.reader.requestSlice(n, s);
    o instanceof Promise && (o = await o);
    const c = {
      segment: t,
      elementStartPos: r,
      elementEndPos: n + s,
      dataStartPos: n,
      timestamp: -1,
      trackData: new Map(),
    };
    if (((this.currentCluster = c), o)) {
      const e = this.readContiguousElements(o, xr);
      c.elementEndPos = e;
    }
    for (const [, l] of c.trackData) {
      const e = l.track;
      ie(l.blocks.length > 0);
      let t = !1;
      for (let r = 0; r < l.blocks.length; r++) {
        const e = l.blocks[r];
        ((e.timestamp += c.timestamp), (t ||= e.lacing !== jr.None));
      }
      l.presentationTimestamps = l.blocks
        .map((e, t) => ({ timestamp: e.timestamp, blockIndex: t }))
        .sort((e, t) => e.timestamp - t.timestamp);
      for (let r = 0; r < l.presentationTimestamps.length; r++) {
        const t = l.presentationTimestamps[r],
          i = l.blocks[t.blockIndex];
        if (
          (null === l.firstKeyFrameTimestamp &&
            i.isKeyFrame &&
            (l.firstKeyFrameTimestamp = i.timestamp),
          r < l.presentationTimestamps.length - 1)
        ) {
          const e = l.presentationTimestamps[r + 1];
          i.duration = e.timestamp - i.timestamp;
        } else
          0 === i.duration &&
            null != e.defaultDuration &&
            i.lacing === jr.None &&
            (i.duration = e.defaultDuration);
      }
      t &&
        (this.expandLacedBlocks(l.blocks, e),
        (l.presentationTimestamps = l.blocks
          .map((e, t) => ({ timestamp: e.timestamp, blockIndex: t }))
          .sort((e, t) => e.timestamp - t.timestamp)));
      const i = l.blocks[l.presentationTimestamps[0].blockIndex],
        a = l.blocks[ae(l.presentationTimestamps).blockIndex];
      ((l.startTimestamp = i.timestamp),
        (l.endTimestamp = a.timestamp + a.duration));
      const s = Pe(
        e.clusterPositionCache,
        l.startTimestamp,
        (e) => e.startTimestamp,
      );
      (-1 !== s && e.clusterPositionCache[s].elementStartPos === r) ||
        e.clusterPositionCache.splice(s + 1, 0, {
          elementStartPos: c.elementStartPos,
          startTimestamp: l.startTimestamp,
        });
    }
    return ((t.lastReadCluster = c), c);
  }
  getTrackDataInCluster(e, t) {
    let i = e.trackData.get(t);
    if (!i) {
      const r = e.segment.tracks.find((e) => e.id === t);
      if (!r) return null;
      ((i = {
        track: r,
        startTimestamp: 0,
        endTimestamp: 0,
        firstKeyFrameTimestamp: null,
        blocks: [],
        presentationTimestamps: [],
      }),
        e.trackData.set(t, i));
    }
    return i;
  }
  expandLacedBlocks(e, t) {
    for (let i = 0; i < e.length; i++) {
      const r = e[i];
      if (r.lacing === jr.None) continue;
      r.decoded ||
        ((r.data = this.decodeBlockData(t, r.data)), (r.decoded = !0));
      const a = ps.tempFromBytes(r.data),
        s = [],
        n = ks(a) + 1;
      switch (r.lacing) {
        case jr.Xiph:
          {
            let e = 0;
            for (let t = 0; t < n - 1; t++) {
              let t = 0;
              for (; a.bufferPos < a.length; ) {
                const i = ks(a);
                if (((t += i), i < 255)) {
                  (s.push(t), (e += t));
                  break;
                }
              }
            }
            s.push(a.length - (a.bufferPos + e));
          }
          break;
        case jr.FixedSize:
          {
            const e = a.length - 1,
              t = Math.floor(e / n);
            for (let i = 0; i < n; i++) s.push(t);
          }
          break;
        case jr.Ebml:
          {
            const e = Br(a);
            ie(null !== e);
            let t = e;
            s.push(t);
            let i = t;
            for (let r = 1; r < n - 1; r++) {
              const e = a.bufferPos,
                r = Br(a);
              ie(null !== r);
              ((t += r - ((1 << (7 * (a.bufferPos - e) - 1)) - 1)),
                s.push(t),
                (i += t));
            }
            s.push(a.length - (a.bufferPos + i));
          }
          break;
        default:
          ie(!1);
      }
      (ie(s.length === n), e.splice(i, 1));
      const o = r.duration || n * (t.defaultDuration ?? 0);
      for (let t = 0; t < n; t++) {
        const c = s[t],
          l = gs(a, c),
          h = r.timestamp + (o * t) / n,
          d = o / n;
        e.splice(i + t, 0, {
          timestamp: h,
          duration: d,
          isKeyFrame: r.isKeyFrame,
          data: l,
          lacing: jr.None,
          decoded: !0,
          mainAdditional: r.mainAdditional,
        });
      }
      ((i += n), i--);
    }
  }
  async loadSegmentMetadata(e) {
    for (const t of e.seekEntries) {
      if (t.id !== Cr.Tags || e.tagsSeen) {
        if (t.id !== Cr.Attachments || e.attachmentsSeen) continue;
      } else;
      let i = this.reader.requestSliceRange(
        e.dataStartPos + t.segmentPosition,
        2,
        Ar,
      );
      if ((i instanceof Promise && (i = await i), !i)) continue;
      const r = Rr(i);
      if (!r || r.id !== t.id) continue;
      const { size: a } = r;
      (Hr(a), ie(!this.currentSegment), (this.currentSegment = e));
      let s = this.reader.requestSlice(i.filePos, a);
      (s instanceof Promise && (s = await s),
        s && this.readContiguousElements(s),
        (this.currentSegment = null),
        t.id === Cr.Tags
          ? (e.tagsSeen = !0)
          : t.id === Cr.Attachments && (e.attachmentsSeen = !0));
    }
  }
  readContiguousElements(e, t) {
    const i = e.filePos;
    for (; e.filePos - i <= e.length - 2; ) {
      const i = e.filePos;
      if (!this.traverseElement(e, t)) return i;
    }
    return e.filePos;
  }
  traverseElement(e, t) {
    const i = Rr(e);
    if (!i) return !1;
    if (t && t.includes(i.id)) return !1;
    const { id: r, size: a } = i,
      s = e.filePos;
    switch ((Hr(a), r)) {
      case Cr.DocType:
        this.isWebM = "webm" === zr(e, a);
        break;
      case Cr.Seek:
        {
          if (!this.currentSegment) break;
          const t = { id: -1, segmentPosition: -1 };
          (this.currentSegment.seekEntries.push(t),
            this.readContiguousElements(e.slice(s, a)),
            (-1 !== t.id && -1 !== t.segmentPosition) ||
              this.currentSegment.seekEntries.pop());
        }
        break;
      case Cr.SeekID:
        {
          const t =
            this.currentSegment?.seekEntries[
              this.currentSegment.seekEntries.length - 1
            ];
          if (!t) break;
          t.id = Mr(e, a);
        }
        break;
      case Cr.SeekPosition:
        {
          const t =
            this.currentSegment?.seekEntries[
              this.currentSegment.seekEntries.length - 1
            ];
          if (!t) break;
          t.segmentPosition = Mr(e, a);
        }
        break;
      case Cr.TimestampScale:
        if (!this.currentSegment) break;
        ((this.currentSegment.timestampScale = Mr(e, a)),
          (this.currentSegment.timestampFactor =
            1e9 / this.currentSegment.timestampScale));
        break;
      case Cr.Duration:
        if (!this.currentSegment) break;
        this.currentSegment.duration = Ur(e, a);
        break;
      case Cr.TrackEntry:
        if (!this.currentSegment) break;
        if (
          ((this.currentTrack = {
            id: -1,
            segment: this.currentSegment,
            demuxer: this,
            clusterPositionCache: [],
            cuePoints: [],
            disposition: { ...ct },
            inputTrack: null,
            codecId: null,
            codecPrivate: null,
            defaultDuration: null,
            name: null,
            languageCode: Re,
            decodingInstructions: [],
            info: null,
          }),
          this.readContiguousElements(e.slice(s, a)),
          this.currentTrack.decodingInstructions.some(
            (e) =>
              "decompress" !== e.data?.type ||
              e.scope !== qr.Block ||
              e.data.algorithm !== Kr.HeaderStripping,
          ) &&
            (console.warn(
              `Track #${this.currentTrack.id} has an unsupported content encoding; dropping.`,
            ),
            (this.currentTrack = null)),
          this.currentTrack &&
            -1 !== this.currentTrack.id &&
            this.currentTrack.codecId &&
            this.currentTrack.info)
        ) {
          const e = this.currentTrack.codecId.indexOf("/"),
            t =
              -1 === e
                ? this.currentTrack.codecId
                : this.currentTrack.codecId.slice(0, e);
          if (
            "video" === this.currentTrack.info.type &&
            -1 !== this.currentTrack.info.width &&
            -1 !== this.currentTrack.info.height
          ) {
            this.currentTrack.codecId === Wr.avc
              ? ((this.currentTrack.info.codec = "avc"),
                (this.currentTrack.info.codecDescription =
                  this.currentTrack.codecPrivate))
              : this.currentTrack.codecId === Wr.hevc
                ? ((this.currentTrack.info.codec = "hevc"),
                  (this.currentTrack.info.codecDescription =
                    this.currentTrack.codecPrivate))
                : t === Wr.vp8
                  ? (this.currentTrack.info.codec = "vp8")
                  : t === Wr.vp9
                    ? (this.currentTrack.info.codec = "vp9")
                    : t === Wr.av1 && (this.currentTrack.info.codec = "av1");
            const e = this.currentTrack,
              i = new Yi(this.input, new Jr(e));
            ((this.currentTrack.inputTrack = i),
              this.currentSegment.tracks.push(this.currentTrack));
          } else if (
            "audio" === this.currentTrack.info.type &&
            -1 !== this.currentTrack.info.numberOfChannels &&
            -1 !== this.currentTrack.info.sampleRate
          ) {
            t === Wr.aac
              ? ((this.currentTrack.info.codec = "aac"),
                (this.currentTrack.info.aacCodecInfo = {
                  isMpeg2: this.currentTrack.codecId.includes("MPEG2"),
                }),
                (this.currentTrack.info.codecDescription =
                  this.currentTrack.codecPrivate))
              : this.currentTrack.codecId === Wr.mp3
                ? (this.currentTrack.info.codec = "mp3")
                : t === Wr.opus
                  ? ((this.currentTrack.info.codec = "opus"),
                    (this.currentTrack.info.codecDescription =
                      this.currentTrack.codecPrivate),
                    (this.currentTrack.info.sampleRate = _t))
                  : t === Wr.vorbis
                    ? ((this.currentTrack.info.codec = "vorbis"),
                      (this.currentTrack.info.codecDescription =
                        this.currentTrack.codecPrivate))
                    : t === Wr.flac
                      ? ((this.currentTrack.info.codec = "flac"),
                        (this.currentTrack.info.codecDescription =
                          this.currentTrack.codecPrivate))
                      : "A_PCM/INT/LIT" === this.currentTrack.codecId
                        ? 8 === this.currentTrack.info.bitDepth
                          ? (this.currentTrack.info.codec = "pcm-u8")
                          : 16 === this.currentTrack.info.bitDepth
                            ? (this.currentTrack.info.codec = "pcm-s16")
                            : 24 === this.currentTrack.info.bitDepth
                              ? (this.currentTrack.info.codec = "pcm-s24")
                              : 32 === this.currentTrack.info.bitDepth &&
                                (this.currentTrack.info.codec = "pcm-s32")
                        : "A_PCM/INT/BIG" === this.currentTrack.codecId
                          ? 8 === this.currentTrack.info.bitDepth
                            ? (this.currentTrack.info.codec = "pcm-u8")
                            : 16 === this.currentTrack.info.bitDepth
                              ? (this.currentTrack.info.codec = "pcm-s16be")
                              : 24 === this.currentTrack.info.bitDepth
                                ? (this.currentTrack.info.codec = "pcm-s24be")
                                : 32 === this.currentTrack.info.bitDepth &&
                                  (this.currentTrack.info.codec = "pcm-s32be")
                          : "A_PCM/FLOAT/IEEE" === this.currentTrack.codecId &&
                            (32 === this.currentTrack.info.bitDepth
                              ? (this.currentTrack.info.codec = "pcm-f32")
                              : 64 === this.currentTrack.info.bitDepth &&
                                (this.currentTrack.info.codec = "pcm-f64"));
            const e = this.currentTrack,
              i = new Ji(this.input, new Zr(e));
            ((this.currentTrack.inputTrack = i),
              this.currentSegment.tracks.push(this.currentTrack));
          }
        }
        this.currentTrack = null;
        break;
      case Cr.TrackNumber:
        if (!this.currentTrack) break;
        this.currentTrack.id = Mr(e, a);
        break;
      case Cr.TrackType:
        {
          if (!this.currentTrack) break;
          const t = Mr(e, a);
          1 === t
            ? (this.currentTrack.info = {
                type: "video",
                width: -1,
                height: -1,
                rotation: 0,
                codec: null,
                codecDescription: null,
                colorSpace: null,
                alphaMode: !1,
              })
            : 2 === t &&
              (this.currentTrack.info = {
                type: "audio",
                numberOfChannels: -1,
                sampleRate: -1,
                bitDepth: -1,
                codec: null,
                codecDescription: null,
                aacCodecInfo: null,
              });
        }
        break;
      case Cr.FlagEnabled:
        if (!this.currentTrack) break;
        Mr(e, a) ||
          (this.currentSegment.tracks.pop(), (this.currentTrack = null));
        break;
      case Cr.FlagDefault:
        if (!this.currentTrack) break;
        this.currentTrack.disposition.default = !!Mr(e, a);
        break;
      case Cr.FlagForced:
        if (!this.currentTrack) break;
        this.currentTrack.disposition.forced = !!Mr(e, a);
        break;
      case Cr.FlagOriginal:
        if (!this.currentTrack) break;
        this.currentTrack.disposition.original = !!Mr(e, a);
        break;
      case Cr.FlagHearingImpaired:
        if (!this.currentTrack) break;
        this.currentTrack.disposition.hearingImpaired = !!Mr(e, a);
        break;
      case Cr.FlagVisualImpaired:
        if (!this.currentTrack) break;
        this.currentTrack.disposition.visuallyImpaired = !!Mr(e, a);
        break;
      case Cr.FlagCommentary:
        if (!this.currentTrack) break;
        this.currentTrack.disposition.commentary = !!Mr(e, a);
        break;
      case Cr.CodecID:
        if (!this.currentTrack) break;
        this.currentTrack.codecId = zr(e, a);
        break;
      case Cr.CodecPrivate:
        if (!this.currentTrack) break;
        this.currentTrack.codecPrivate = gs(e, a);
        break;
      case Cr.DefaultDuration:
        if (!this.currentTrack) break;
        this.currentTrack.defaultDuration =
          (this.currentTrack.segment.timestampFactor * Mr(e, a)) / 1e9;
        break;
      case Cr.Name:
        if (!this.currentTrack) break;
        this.currentTrack.name = Nr(e, a);
        break;
      case Cr.Language:
        if (!this.currentTrack) break;
        if (this.currentTrack.languageCode !== Re) break;
        ((this.currentTrack.languageCode = zr(e, a)),
          Le(this.currentTrack.languageCode) ||
            (this.currentTrack.languageCode = Re));
        break;
      case Cr.LanguageBCP47:
        {
          if (!this.currentTrack) break;
          const t = zr(e, a).split("-")[0];
          this.currentTrack.languageCode = t || Re;
        }
        break;
      case Cr.Video:
        if ("video" !== this.currentTrack?.info?.type) break;
        this.readContiguousElements(e.slice(s, a));
        break;
      case Cr.PixelWidth:
        if ("video" !== this.currentTrack?.info?.type) break;
        this.currentTrack.info.width = Mr(e, a);
        break;
      case Cr.PixelHeight:
        if ("video" !== this.currentTrack?.info?.type) break;
        this.currentTrack.info.height = Mr(e, a);
        break;
      case Cr.AlphaMode:
        if ("video" !== this.currentTrack?.info?.type) break;
        this.currentTrack.info.alphaMode = 1 === Mr(e, a);
        break;
      case Cr.Colour:
        if ("video" !== this.currentTrack?.info?.type) break;
        ((this.currentTrack.info.colorSpace = {}),
          this.readContiguousElements(e.slice(s, a)));
        break;
      case Cr.MatrixCoefficients:
        {
          if (
            "video" !== this.currentTrack?.info?.type ||
            !this.currentTrack.info.colorSpace
          )
            break;
          const t = Mr(e, a),
            i = we[t] ?? null;
          this.currentTrack.info.colorSpace.matrix = i;
        }
        break;
      case Cr.Range:
        if (
          "video" !== this.currentTrack?.info?.type ||
          !this.currentTrack.info.colorSpace
        )
          break;
        this.currentTrack.info.colorSpace.fullRange = 2 === Mr(e, a);
        break;
      case Cr.TransferCharacteristics:
        {
          if (
            "video" !== this.currentTrack?.info?.type ||
            !this.currentTrack.info.colorSpace
          )
            break;
          const t = Mr(e, a),
            i = ke[t] ?? null;
          this.currentTrack.info.colorSpace.transfer = i;
        }
        break;
      case Cr.Primaries:
        {
          if (
            "video" !== this.currentTrack?.info?.type ||
            !this.currentTrack.info.colorSpace
          )
            break;
          const t = Mr(e, a),
            i = fe[t] ?? null;
          this.currentTrack.info.colorSpace.primaries = i;
        }
        break;
      case Cr.Projection:
        if ("video" !== this.currentTrack?.info?.type) break;
        this.readContiguousElements(e.slice(s, a));
        break;
      case Cr.ProjectionPoseRoll:
        {
          if ("video" !== this.currentTrack?.info?.type) break;
          const t = -Ur(e, a);
          try {
            this.currentTrack.info.rotation = re(t);
          } catch {}
        }
        break;
      case Cr.Audio:
        if ("audio" !== this.currentTrack?.info?.type) break;
        this.readContiguousElements(e.slice(s, a));
        break;
      case Cr.SamplingFrequency:
        if ("audio" !== this.currentTrack?.info?.type) break;
        this.currentTrack.info.sampleRate = Ur(e, a);
        break;
      case Cr.Channels:
        if ("audio" !== this.currentTrack?.info?.type) break;
        this.currentTrack.info.numberOfChannels = Mr(e, a);
        break;
      case Cr.BitDepth:
        if ("audio" !== this.currentTrack?.info?.type) break;
        this.currentTrack.info.bitDepth = Mr(e, a);
        break;
      case Cr.CuePoint:
        if (!this.currentSegment) break;
        (this.readContiguousElements(e.slice(s, a)),
          (this.currentCueTime = null));
        break;
      case Cr.CueTime:
        this.currentCueTime = Mr(e, a);
        break;
      case Cr.CueTrackPositions:
        {
          if (null === this.currentCueTime) break;
          ie(this.currentSegment);
          const t = {
            time: this.currentCueTime,
            trackId: -1,
            clusterPosition: -1,
          };
          (this.currentSegment.cuePoints.push(t),
            this.readContiguousElements(e.slice(s, a)),
            (-1 !== t.trackId && -1 !== t.clusterPosition) ||
              this.currentSegment.cuePoints.pop());
        }
        break;
      case Cr.CueTrack:
        {
          const t =
            this.currentSegment?.cuePoints[
              this.currentSegment.cuePoints.length - 1
            ];
          if (!t) break;
          t.trackId = Mr(e, a);
        }
        break;
      case Cr.CueClusterPosition:
        {
          const t =
            this.currentSegment?.cuePoints[
              this.currentSegment.cuePoints.length - 1
            ];
          if (!t) break;
          (ie(this.currentSegment),
            (t.clusterPosition = this.currentSegment.dataStartPos + Mr(e, a)));
        }
        break;
      case Cr.Timestamp:
        if (!this.currentCluster) break;
        this.currentCluster.timestamp = Mr(e, a);
        break;
      case Cr.SimpleBlock:
        {
          if (!this.currentCluster) break;
          const t = Br(e);
          if (null === t) break;
          const i = this.getTrackDataInCluster(this.currentCluster, t);
          if (!i) break;
          const r = Ts(e),
            n = ks(e),
            o = (n >> 1) & 3;
          let c = !!(128 & n);
          "audio" === i.track.info?.type && i.track.info.codec && (c = !0);
          const l = gs(e, a - (e.filePos - s)),
            h = i.track.decodingInstructions.length > 0;
          i.blocks.push({
            timestamp: r,
            duration: 0,
            isKeyFrame: c,
            data: l,
            lacing: o,
            decoded: !h,
            mainAdditional: null,
          });
        }
        break;
      case Cr.BlockGroup:
        if (!this.currentCluster) break;
        (this.readContiguousElements(e.slice(s, a)),
          (this.currentBlock = null));
        break;
      case Cr.Block:
        {
          if (!this.currentCluster) break;
          const t = Br(e);
          if (null === t) break;
          const i = this.getTrackDataInCluster(this.currentCluster, t);
          if (!i) break;
          const r = Ts(e),
            n = (ks(e) >> 1) & 3,
            o = gs(e, a - (e.filePos - s)),
            c = i.track.decodingInstructions.length > 0;
          ((this.currentBlock = {
            timestamp: r,
            duration: 0,
            isKeyFrame: !0,
            data: o,
            lacing: n,
            decoded: !c,
            mainAdditional: null,
          }),
            i.blocks.push(this.currentBlock));
        }
        break;
      case Cr.BlockAdditions:
        this.readContiguousElements(e.slice(s, a));
        break;
      case Cr.BlockMore:
        if (!this.currentBlock) break;
        ((this.currentBlockAdditional = { addId: 1, data: null }),
          this.readContiguousElements(e.slice(s, a)),
          this.currentBlockAdditional.data &&
            1 === this.currentBlockAdditional.addId &&
            (this.currentBlock.mainAdditional =
              this.currentBlockAdditional.data),
          (this.currentBlockAdditional = null));
        break;
      case Cr.BlockAdditional:
        if (!this.currentBlockAdditional) break;
        this.currentBlockAdditional.data = gs(e, a);
        break;
      case Cr.BlockAddID:
        if (!this.currentBlockAdditional) break;
        this.currentBlockAdditional.addId = Mr(e, a);
        break;
      case Cr.BlockDuration:
        if (!this.currentBlock) break;
        this.currentBlock.duration = Mr(e, a);
        break;
      case Cr.ReferenceBlock:
        if (!this.currentBlock) break;
        this.currentBlock.isKeyFrame = !1;
        break;
      case Cr.Tag:
        ((this.currentTagTargetIsMovie = !0),
          this.readContiguousElements(e.slice(s, a)));
        break;
      case Cr.Targets:
        this.readContiguousElements(e.slice(s, a));
        break;
      case Cr.TargetTypeValue:
        50 !== Mr(e, a) && (this.currentTagTargetIsMovie = !1);
        break;
      case Cr.TagTrackUID:
      case Cr.TagEditionUID:
      case Cr.TagChapterUID:
      case Cr.TagAttachmentUID:
        this.currentTagTargetIsMovie = !1;
        break;
      case Cr.SimpleTag:
        if (!this.currentTagTargetIsMovie) break;
        ((this.currentSimpleTagName = null),
          this.readContiguousElements(e.slice(s, a)));
        break;
      case Cr.TagName:
        this.currentSimpleTagName = Nr(e, a);
        break;
      case Cr.TagString:
        {
          if (!this.currentSimpleTagName) break;
          const t = Nr(e, a);
          this.processTagValue(this.currentSimpleTagName, t);
        }
        break;
      case Cr.TagBinary:
        {
          if (!this.currentSimpleTagName) break;
          const t = gs(e, a);
          this.processTagValue(this.currentSimpleTagName, t);
        }
        break;
      case Cr.AttachedFile:
        {
          if (!this.currentSegment) break;
          ((this.currentAttachedFile = {
            fileUid: null,
            fileName: null,
            fileMediaType: null,
            fileData: null,
            fileDescription: null,
          }),
            this.readContiguousElements(e.slice(s, a)));
          const t = this.currentSegment.metadataTags;
          if (
            (this.currentAttachedFile.fileUid &&
              this.currentAttachedFile.fileData &&
              ((t.raw ??= {}),
              (t.raw[this.currentAttachedFile.fileUid.toString()] = new ot(
                this.currentAttachedFile.fileData,
                this.currentAttachedFile.fileMediaType ?? void 0,
                this.currentAttachedFile.fileName ?? void 0,
                this.currentAttachedFile.fileDescription ?? void 0,
              ))),
            this.currentAttachedFile.fileMediaType?.startsWith("image/") &&
              this.currentAttachedFile.fileData)
          ) {
            const e = this.currentAttachedFile.fileName;
            let i = "unknown";
            if (e) {
              const t = e.toLowerCase();
              t.startsWith("cover.")
                ? (i = "coverFront")
                : t.startsWith("back.") && (i = "coverBack");
            }
            ((t.images ??= []),
              t.images.push({
                data: this.currentAttachedFile.fileData,
                mimeType: this.currentAttachedFile.fileMediaType,
                kind: i,
                name: this.currentAttachedFile.fileName ?? void 0,
                description: this.currentAttachedFile.fileDescription ?? void 0,
              }));
          }
          this.currentAttachedFile = null;
        }
        break;
      case Cr.FileUID:
        if (!this.currentAttachedFile) break;
        this.currentAttachedFile.fileUid = ((e, t) => {
          if (t < 1) throw new Error("Bad unsigned int size " + t);
          let i = 0n;
          for (let r = 0; r < t; r++) ((i <<= 8n), (i += BigInt(ks(e))));
          return i;
        })(e, a);
        break;
      case Cr.FileName:
        if (!this.currentAttachedFile) break;
        this.currentAttachedFile.fileName = Nr(e, a);
        break;
      case Cr.FileMediaType:
        if (!this.currentAttachedFile) break;
        this.currentAttachedFile.fileMediaType = zr(e, a);
        break;
      case Cr.FileData:
        if (!this.currentAttachedFile) break;
        this.currentAttachedFile.fileData = gs(e, a);
        break;
      case Cr.FileDescription:
        if (!this.currentAttachedFile) break;
        this.currentAttachedFile.fileDescription = Nr(e, a);
        break;
      case Cr.ContentEncodings:
        if (!this.currentTrack) break;
        (this.readContiguousElements(e.slice(s, a)),
          this.currentTrack.decodingInstructions.sort(
            (e, t) => t.order - e.order,
          ));
        break;
      case Cr.ContentEncoding:
        ((this.currentDecodingInstruction = {
          order: 0,
          scope: qr.Block,
          data: null,
        }),
          this.readContiguousElements(e.slice(s, a)),
          this.currentDecodingInstruction.data &&
            this.currentTrack.decodingInstructions.push(
              this.currentDecodingInstruction,
            ),
          (this.currentDecodingInstruction = null));
        break;
      case Cr.ContentEncodingOrder:
        if (!this.currentDecodingInstruction) break;
        this.currentDecodingInstruction.order = Mr(e, a);
        break;
      case Cr.ContentEncodingScope:
        if (!this.currentDecodingInstruction) break;
        this.currentDecodingInstruction.scope = Mr(e, a);
        break;
      case Cr.ContentCompression:
        if (!this.currentDecodingInstruction) break;
        ((this.currentDecodingInstruction.data = {
          type: "decompress",
          algorithm: Kr.Zlib,
          settings: null,
        }),
          this.readContiguousElements(e.slice(s, a)));
        break;
      case Cr.ContentCompAlgo:
        if ("decompress" !== this.currentDecodingInstruction?.data?.type) break;
        this.currentDecodingInstruction.data.algorithm = Mr(e, a);
        break;
      case Cr.ContentCompSettings:
        if ("decompress" !== this.currentDecodingInstruction?.data?.type) break;
        this.currentDecodingInstruction.data.settings = gs(e, a);
        break;
      case Cr.ContentEncryption:
        if (!this.currentDecodingInstruction) break;
        this.currentDecodingInstruction.data = { type: "decrypt" };
    }
    return ((e.filePos = s + a), !0);
  }
  decodeBlockData(e, t) {
    ie(e.decodingInstructions.length > 0);
    let i = t;
    for (const r of e.decodingInstructions)
      if ((ie(r.data), "decompress" === r.data.type))
        if (r.data.algorithm === Kr.HeaderStripping)
          if (r.data.settings && r.data.settings.length > 0) {
            const e = r.data.settings,
              t = new Uint8Array(e.length + i.length);
            (t.set(e, 0), t.set(i, e.length), (i = t));
          }
    return i;
  }
  processTagValue(e, t) {
    if (!this.currentSegment?.metadataTags) return;
    const i = this.currentSegment.metadataTags;
    if (((i.raw ??= {}), (i.raw[e] ??= t), "string" == typeof t))
      switch (e.toLowerCase()) {
        case "title":
          i.title ??= t;
          break;
        case "description":
          i.description ??= t;
          break;
        case "artist":
          i.artist ??= t;
          break;
        case "album":
          i.album ??= t;
          break;
        case "album_artist":
          i.albumArtist ??= t;
          break;
        case "genre":
          i.genre ??= t;
          break;
        case "comment":
          i.comment ??= t;
          break;
        case "lyrics":
          i.lyrics ??= t;
          break;
        case "date":
          {
            const e = new Date(t);
            Number.isNaN(e.getTime()) || (i.date ??= e);
          }
          break;
        case "track_number":
        case "part_number":
          {
            const e = t.split("/"),
              r = Number.parseInt(e[0], 10),
              a = e[1] && Number.parseInt(e[1], 10);
            (Number.isInteger(r) && r > 0 && (i.trackNumber ??= r),
              a && Number.isInteger(a) && a > 0 && (i.tracksTotal ??= a));
          }
          break;
        case "disc_number":
        case "disc": {
          const e = t.split("/"),
            r = Number.parseInt(e[0], 10),
            a = e[1] && Number.parseInt(e[1], 10);
          (Number.isInteger(r) && r > 0 && (i.discNumber ??= r),
            a && Number.isInteger(a) && a > 0 && (i.discsTotal ??= a));
        }
      }
  }
}
class Yr {
  constructor(e) {
    ((this.internalTrack = e), (this.packetToClusterLocation = new WeakMap()));
  }
  getId() {
    return this.internalTrack.id;
  }
  getCodec() {
    throw new Error("Not implemented on base class.");
  }
  getInternalCodecId() {
    return this.internalTrack.codecId;
  }
  async computeDuration() {
    const e = await this.getPacket(1 / 0, { metadataOnly: !0 });
    return (e?.timestamp ?? 0) + (e?.duration ?? 0);
  }
  getName() {
    return this.internalTrack.name;
  }
  getLanguageCode() {
    return this.internalTrack.languageCode;
  }
  async getFirstTimestamp() {
    const e = await this.getFirstPacket({ metadataOnly: !0 });
    return e?.timestamp ?? 0;
  }
  getTimeResolution() {
    return this.internalTrack.segment.timestampFactor;
  }
  getDisposition() {
    return this.internalTrack.disposition;
  }
  async getFirstPacket(e) {
    return this.performClusterLookup(
      null,
      (e) =>
        e.trackData.get(this.internalTrack.id)
          ? { blockIndex: 0, correctBlockFound: !0 }
          : { blockIndex: -1, correctBlockFound: !1 },
      -1 / 0,
      1 / 0,
      e,
    );
  }
  intoTimescale(e) {
    return ze(e * this.internalTrack.segment.timestampFactor);
  }
  async getPacket(e, t) {
    const i = this.intoTimescale(e);
    return this.performClusterLookup(
      null,
      (e) => {
        const t = e.trackData.get(this.internalTrack.id);
        if (!t) return { blockIndex: -1, correctBlockFound: !1 };
        const r = Pe(t.presentationTimestamps, i, (e) => e.timestamp);
        return {
          blockIndex: -1 !== r ? t.presentationTimestamps[r].blockIndex : -1,
          correctBlockFound: -1 !== r && i < t.endTimestamp,
        };
      },
      i,
      i,
      t,
    );
  }
  async getNextPacket(e, t) {
    const i = this.packetToClusterLocation.get(e);
    if (void 0 === i)
      throw new Error("Packet was not created from this track.");
    return this.performClusterLookup(
      i.cluster,
      (e) => {
        if (e === i.cluster) {
          const t = e.trackData.get(this.internalTrack.id);
          if (i.blockIndex + 1 < t.blocks.length)
            return { blockIndex: i.blockIndex + 1, correctBlockFound: !0 };
        } else {
          if (e.trackData.get(this.internalTrack.id))
            return { blockIndex: 0, correctBlockFound: !0 };
        }
        return { blockIndex: -1, correctBlockFound: !1 };
      },
      -1 / 0,
      1 / 0,
      t,
    );
  }
  async getKeyPacket(e, t) {
    const i = this.intoTimescale(e);
    return this.performClusterLookup(
      null,
      (e) => {
        const t = e.trackData.get(this.internalTrack.id);
        if (!t) return { blockIndex: -1, correctBlockFound: !1 };
        const r = Ae(
          t.presentationTimestamps,
          (e) => t.blocks[e.blockIndex].isKeyFrame && e.timestamp <= i,
        );
        return {
          blockIndex: -1 !== r ? t.presentationTimestamps[r].blockIndex : -1,
          correctBlockFound: -1 !== r && i < t.endTimestamp,
        };
      },
      i,
      i,
      t,
    );
  }
  async getNextKeyPacket(e, t) {
    const i = this.packetToClusterLocation.get(e);
    if (void 0 === i)
      throw new Error("Packet was not created from this track.");
    return this.performClusterLookup(
      i.cluster,
      (e) => {
        if (e === i.cluster) {
          const t = e.trackData
            .get(this.internalTrack.id)
            .blocks.findIndex((e, t) => e.isKeyFrame && t > i.blockIndex);
          if (-1 !== t) return { blockIndex: t, correctBlockFound: !0 };
        } else {
          const t = e.trackData.get(this.internalTrack.id);
          if (t && null !== t.firstKeyFrameTimestamp) {
            const e = t.blocks.findIndex((e) => e.isKeyFrame);
            return (ie(-1 !== e), { blockIndex: e, correctBlockFound: !0 });
          }
        }
        return { blockIndex: -1, correctBlockFound: !1 };
      },
      -1 / 0,
      1 / 0,
      t,
    );
  }
  async fetchPacketInCluster(e, t, i) {
    if (-1 === t) return null;
    const r = e.trackData.get(this.internalTrack.id).blocks[t];
    (ie(r),
      r.decoded ||
        ((r.data = this.internalTrack.demuxer.decodeBlockData(
          this.internalTrack,
          r.data,
        )),
        (r.decoded = !0)));
    const a = i.metadataOnly ? Ci : r.data,
      s = r.timestamp / this.internalTrack.segment.timestampFactor,
      n = r.duration / this.internalTrack.segment.timestampFactor,
      o = {};
    r.mainAdditional &&
      "video" === this.internalTrack.info?.type &&
      this.internalTrack.info.alphaMode &&
      ((o.alpha = i.metadataOnly ? Ci : r.mainAdditional),
      (o.alphaByteLength = r.mainAdditional.byteLength));
    const c = new Si(
      a,
      r.isKeyFrame ? "key" : "delta",
      s,
      n,
      e.dataStartPos + t,
      r.data.byteLength,
      o,
    );
    return (
      this.packetToClusterLocation.set(c, { cluster: e, blockIndex: t }),
      c
    );
  }
  async performClusterLookup(e, t, i, r, a) {
    const { demuxer: s, segment: n } = this.internalTrack;
    let o = null,
      c = null,
      l = -1;
    if (e) {
      const { blockIndex: i, correctBlockFound: r } = t(e);
      if (r) return this.fetchPacketInCluster(e, i, a);
      -1 !== i && ((c = e), (l = i));
    }
    const h = Pe(this.internalTrack.cuePoints, i, (e) => e.time),
      d = -1 !== h ? this.internalTrack.cuePoints[h] : null,
      u = Pe(
        this.internalTrack.clusterPositionCache,
        i,
        (e) => e.startTimestamp,
      ),
      m = -1 !== u ? this.internalTrack.clusterPositionCache[u] : null,
      p = Math.max(d?.clusterPosition ?? 0, m?.elementStartPos ?? 0) || null;
    let f;
    for (
      e
        ? null === p || e.elementStartPos >= p
          ? ((f = e.elementEndPos), (o = e))
          : (f = p)
        : (f = p ?? n.clusterSeekStartPos);
      null === n.elementEndPos || f <= n.elementEndPos - 2;

    ) {
      if (o) {
        const e = o.trackData.get(this.internalTrack.id);
        if (e && e.startTimestamp > r) break;
      }
      let e = s.reader.requestSliceRange(f, 2, Ar);
      if ((e instanceof Promise && (e = await e), !e)) break;
      const i = f,
        h = Rr(e);
      if (!h || (!vr.includes(h.id) && h.id !== Cr.Void)) {
        const e = await Vr(
          s.reader,
          i,
          vr,
          Math.min(n.elementEndPos ?? 1 / 0, i + Xr),
        );
        if (e) {
          f = e;
          continue;
        }
        break;
      }
      const d = h.id;
      let u = h.size;
      const m = e.filePos;
      if (d === Cr.Cluster) {
        ((o = await s.readCluster(i, n)), (u = o.elementEndPos - m));
        const { blockIndex: e, correctBlockFound: r } = t(o);
        if (r) return this.fetchPacketInCluster(o, e, a);
        -1 !== e && ((c = o), (l = e));
      }
      if (null === u) {
        ie(d !== Cr.Cluster);
        u = (await Lr(s.reader, m, xr, n.elementEndPos)).pos - m;
      }
      const p = m + u;
      if (null === n.elementEndPos) {
        let e = s.reader.requestSliceRange(p, 2, Ar);
        if ((e instanceof Promise && (e = await e), !e)) break;
        if (Dr(e) === Cr.Segment) {
          n.elementEndPos = p;
          break;
        }
      }
      f = p;
    }
    if (d && (!c || c.elementStartPos < d.clusterPosition)) {
      const e = this.internalTrack.cuePoints[h - 1];
      ie(!e || e.time < d.time);
      const i = e?.time ?? -1 / 0;
      return this.performClusterLookup(null, t, i, r, a);
    }
    return c ? this.fetchPacketInCluster(c, l, a) : null;
  }
}
class Jr extends Yr {
  constructor(e) {
    (super(e), (this.decoderConfigPromise = null), (this.internalTrack = e));
  }
  getCodec() {
    return this.internalTrack.info.codec;
  }
  getCodedWidth() {
    return this.internalTrack.info.width;
  }
  getCodedHeight() {
    return this.internalTrack.info.height;
  }
  getRotation() {
    return this.internalTrack.info.rotation;
  }
  async getColorSpace() {
    return {
      primaries: this.internalTrack.info.colorSpace?.primaries,
      transfer: this.internalTrack.info.colorSpace?.transfer,
      matrix: this.internalTrack.info.colorSpace?.matrix,
      fullRange: this.internalTrack.info.colorSpace?.fullRange,
    };
  }
  async canBeTransparent() {
    return this.internalTrack.info.alphaMode;
  }
  async getDecoderConfig() {
    return this.internalTrack.info.codec
      ? (this.decoderConfigPromise ??= (async () => {
          let e = null;
          return (
            ("vp9" === this.internalTrack.info.codec ||
              "av1" === this.internalTrack.info.codec ||
              ("avc" === this.internalTrack.info.codec &&
                !this.internalTrack.info.codecDescription) ||
              ("hevc" === this.internalTrack.info.codec &&
                !this.internalTrack.info.codecDescription)) &&
              (e = await this.getFirstPacket({})),
            {
              codec: St({
                width: this.internalTrack.info.width,
                height: this.internalTrack.info.height,
                codec: this.internalTrack.info.codec,
                codecDescription: this.internalTrack.info.codecDescription,
                colorSpace: this.internalTrack.info.colorSpace,
                avcType: 1,
                avcCodecInfo:
                  "avc" === this.internalTrack.info.codec && e
                    ? Xt(e.data)
                    : null,
                hevcCodecInfo:
                  "hevc" === this.internalTrack.info.codec && e
                    ? Zt(e.data)
                    : null,
                vp9CodecInfo:
                  "vp9" === this.internalTrack.info.codec && e
                    ? oi(e.data)
                    : null,
                av1CodecInfo:
                  "av1" === this.internalTrack.info.codec && e
                    ? li(e.data)
                    : null,
              }),
              codedWidth: this.internalTrack.info.width,
              codedHeight: this.internalTrack.info.height,
              description: this.internalTrack.info.codecDescription ?? void 0,
              colorSpace: this.internalTrack.info.colorSpace ?? void 0,
            }
          );
        })())
      : null;
  }
}
class Zr extends Yr {
  constructor(e) {
    (super(e), (this.decoderConfig = null), (this.internalTrack = e));
  }
  getCodec() {
    return this.internalTrack.info.codec;
  }
  getNumberOfChannels() {
    return this.internalTrack.info.numberOfChannels;
  }
  getSampleRate() {
    return this.internalTrack.info.sampleRate;
  }
  async getDecoderConfig() {
    return this.internalTrack.info.codec
      ? (this.decoderConfig ??= {
          codec: xt({
            codec: this.internalTrack.info.codec,
            codecDescription: this.internalTrack.info.codecDescription,
            aacCodecInfo: this.internalTrack.info.aacCodecInfo,
          }),
          numberOfChannels: this.internalTrack.info.numberOfChannels,
          sampleRate: this.internalTrack.info.sampleRate,
          description: this.internalTrack.info.codecDescription ?? void 0,
        })
      : null;
  }
}
const ea = [44100, 48e3, 32e3],
  ta = [
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 32, 40,
    48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1, -1, 32, 48, 56,
    64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, -1, -1, 32, 64, 96, 128,
    160, 192, 224, 256, 288, 320, 352, 384, 416, 448, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 16, 24, 32, 40, 48, 56,
    64, 80, 96, 112, 128, 144, 160, -1, -1, 8, 16, 24, 32, 40, 48, 56, 64, 80,
    96, 112, 128, 144, 160, -1, -1, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160,
    176, 192, 224, 256, -1,
  ],
  ia = (e, t) => {
    const i = e >>> 24,
      r = (e >>> 16) & 255,
      a = (e >>> 8) & 255,
      s = 255 & e;
    if (255 !== i && 255 !== r && 255 !== a && 255 !== s)
      return { header: null, bytesAdvanced: 4 };
    if (255 !== i) return { header: null, bytesAdvanced: 1 };
    if (224 & ~r) return { header: null, bytesAdvanced: 1 };
    let n = 0,
      o = 0;
    16 & r ? (n = 8 & r ? 0 : 1) : ((n = 1), (o = 1));
    const c = (r >> 3) & 3,
      l = (r >> 1) & 3,
      h = ((a >> 2) & 3) % 3,
      d = (s >> 6) & 3,
      u = (s >> 4) & 3,
      m = (s >> 3) & 1,
      p = (s >> 2) & 1,
      f = 3 & s,
      g = ta[16 * n * 4 + 16 * l + ((a >> 4) & 15)];
    if (-1 === g) return { header: null, bytesAdvanced: 1 };
    const k = 1e3 * g,
      y = ea[h] >> (n + o),
      w = ((e, t, i, r, a) =>
        0 === t
          ? 0
          : 1 === t
            ? Math.floor((144 * i) / (r << e)) + a
            : 2 === t
              ? Math.floor((144 * i) / r) + a
              : 4 * (Math.floor((12 * i) / r) + a))(n, l, k, y, (a >> 1) & 1);
    if (null !== t && t < w) return { header: null, bytesAdvanced: 1 };
    let b;
    return (
      (b =
        3 === c
          ? 3 === l
            ? 384
            : 1152
          : 3 === l
            ? 384
            : 2 === l
              ? 1152
              : 576),
      {
        header: {
          totalSize: w,
          mpegVersionId: c,
          layer: l,
          bitrate: k,
          frequencyIndex: h,
          sampleRate: y,
          channel: d,
          modeExtension: u,
          copyright: m,
          original: p,
          emphasis: f,
          audioSamplesInFrame: b,
        },
        bytesAdvanced: 1,
      }
    );
  },
  ra = (e) => {
    let t = 2130706432,
      i = 0;
    for (; 0 !== t; ) ((i >>= 1), (i |= e & t), (t >>= 8));
    return i;
  };
var aa, sa;
(!(function (e) {
  ((e[(e.Unsynchronisation = 128)] = "Unsynchronisation"),
    (e[(e.ExtendedHeader = 64)] = "ExtendedHeader"),
    (e[(e.ExperimentalIndicator = 32)] = "ExperimentalIndicator"),
    (e[(e.Footer = 16)] = "Footer"));
})(aa || (aa = {})),
  (function (e) {
    ((e[(e.ISO_8859_1 = 0)] = "ISO_8859_1"),
      (e[(e.UTF_16_WITH_BOM = 1)] = "UTF_16_WITH_BOM"),
      (e[(e.UTF_16_BE_NO_BOM = 2)] = "UTF_16_BE_NO_BOM"),
      (e[(e.UTF_8 = 3)] = "UTF_8"));
  })(sa || (sa = {})));
const na = 128,
  oa = [
    "Blues",
    "Classic rock",
    "Country",
    "Dance",
    "Disco",
    "Funk",
    "Grunge",
    "Hip-hop",
    "Jazz",
    "Metal",
    "New age",
    "Oldies",
    "Other",
    "Pop",
    "Rhythm and blues",
    "Rap",
    "Reggae",
    "Rock",
    "Techno",
    "Industrial",
    "Alternative",
    "Ska",
    "Death metal",
    "Pranks",
    "Soundtrack",
    "Euro-techno",
    "Ambient",
    "Trip-hop",
    "Vocal",
    "Jazz & funk",
    "Fusion",
    "Trance",
    "Classical",
    "Instrumental",
    "Acid",
    "House",
    "Game",
    "Sound clip",
    "Gospel",
    "Noise",
    "Alternative rock",
    "Bass",
    "Soul",
    "Punk",
    "Space",
    "Meditative",
    "Instrumental pop",
    "Instrumental rock",
    "Ethnic",
    "Gothic",
    "Darkwave",
    "Techno-industrial",
    "Electronic",
    "Pop-folk",
    "Eurodance",
    "Dream",
    "Southern rock",
    "Comedy",
    "Cult",
    "Gangsta",
    "Top 40",
    "Christian rap",
    "Pop/funk",
    "Jungle music",
    "Native US",
    "Cabaret",
    "New wave",
    "Psychedelic",
    "Rave",
    "Showtunes",
    "Trailer",
    "Lo-fi",
    "Tribal",
    "Acid punk",
    "Acid jazz",
    "Polka",
    "Retro",
    "Musical",
    "Rock 'n' roll",
    "Hard rock",
    "Folk",
    "Folk rock",
    "National folk",
    "Swing",
    "Fast fusion",
    "Bebop",
    "Latin",
    "Revival",
    "Celtic",
    "Bluegrass",
    "Avantgarde",
    "Gothic rock",
    "Progressive rock",
    "Psychedelic rock",
    "Symphonic rock",
    "Slow rock",
    "Big band",
    "Chorus",
    "Easy listening",
    "Acoustic",
    "Humour",
    "Speech",
    "Chanson",
    "Opera",
    "Chamber music",
    "Sonata",
    "Symphony",
    "Booty bass",
    "Primus",
    "Porn groove",
    "Satire",
    "Slow jam",
    "Club",
    "Tango",
    "Samba",
    "Folklore",
    "Ballad",
    "Power ballad",
    "Rhythmic Soul",
    "Freestyle",
    "Duet",
    "Punk rock",
    "Drum solo",
    "A cappella",
    "Euro-house",
    "Dance hall",
    "Goa music",
    "Drum & bass",
    "Club-house",
    "Hardcore techno",
    "Terror",
    "Indie",
    "Britpop",
    "Negerpunk",
    "Polsk punk",
    "Beat",
    "Christian gangsta rap",
    "Heavy metal",
    "Black metal",
    "Crossover",
    "Contemporary Christian",
    "Christian rock",
    "Merengue",
    "Salsa",
    "Thrash metal",
    "Anime",
    "Jpop",
    "Synthpop",
    "Christmas",
    "Art rock",
    "Baroque",
    "Bhangra",
    "Big beat",
    "Breakbeat",
    "Chillout",
    "Downtempo",
    "Dub",
    "EBM",
    "Eclectic",
    "Electro",
    "Electroclash",
    "Emo",
    "Experimental",
    "Garage",
    "Global",
    "IDM",
    "Illbient",
    "Industro-Goth",
    "Jam Band",
    "Krautrock",
    "Leftfield",
    "Lounge",
    "Math rock",
    "New romantic",
    "Nu-breakz",
    "Post-punk",
    "Post-rock",
    "Psytrance",
    "Shoegaze",
    "Space rock",
    "Trop rock",
    "World music",
    "Neoclassical",
    "Audiobook",
    "Audio theatre",
    "Neue Deutsche Welle",
    "Podcast",
    "Indie rock",
    "G-Funk",
    "Dubstep",
    "Garage rock",
    "Psybient",
  ],
  ca = (e, t) => {
    const i = gs(e, t),
      r = Ye(i.indexOf(0), i.length),
      a = i.subarray(0, r);
    let s = "";
    for (let n = 0; n < a.length; n++) s += String.fromCharCode(a[n]);
    return s.trimEnd();
  },
  la = (e) => {
    const t = e.filePos,
      i = Bs(e, 3),
      r = ks(e),
      a = ks(e),
      s = ks(e),
      n = Ss(e);
    if ("ID3" !== i || 255 === r || 255 === a || 2155905152 & n)
      return ((e.filePos = t), null);
    return { majorVersion: r, revision: a, flags: s, size: ra(n) };
  },
  ha = (e, t, i) => {
    if (![2, 3, 4].includes(t.majorVersion))
      return void console.warn(
        `Unsupported ID3v2 major version: ${t.majorVersion}`,
      );
    const r = gs(e, t.size),
      a = new da(t, r);
    if (
      (t.flags & aa.Footer && a.removeFooter(),
      t.flags & aa.Unsynchronisation &&
        3 === t.majorVersion &&
        a.ununsynchronizeAll(),
      t.flags & aa.ExtendedHeader)
    ) {
      const e = a.readU32();
      3 === t.majorVersion ? (a.pos += e) : (a.pos += e - 4);
    }
    for (; a.pos <= a.bytes.length - a.frameHeaderSize(); ) {
      const e = a.readId3V2Frame();
      if (!e) break;
      const r = a.pos,
        s = a.pos + e.size;
      let n = !1,
        o = !1,
        c = !1;
      if (
        (3 === t.majorVersion
          ? ((n = !!(64 & e.flags)), (o = !!(128 & e.flags)))
          : 4 === t.majorVersion &&
            ((n = !!(4 & e.flags)),
            (o = !!(8 & e.flags)),
            (c = !!(2 & e.flags) || !!(t.flags & aa.Unsynchronisation))),
        n)
      )
        (console.warn(`Skipping encrypted ID3v2 frame ${e.id}`), (a.pos = s));
      else if (o)
        (console.warn(`Skipping compressed ID3v2 frame ${e.id}`), (a.pos = s));
      else {
        switch (
          (c && a.ununsynchronizeRegion(a.pos, s),
          (i.raw ??= {}),
          "T" === e.id[0]
            ? (i.raw[e.id] ??= a.readId3V2EncodingAndText(s))
            : (i.raw[e.id] ??= a.readBytes(e.size)),
          (a.pos = r),
          e.id)
        ) {
          case "TIT2":
          case "TT2":
            i.title ??= a.readId3V2EncodingAndText(s);
            break;
          case "TIT3":
          case "TT3":
            i.description ??= a.readId3V2EncodingAndText(s);
            break;
          case "TPE1":
          case "TP1":
            i.artist ??= a.readId3V2EncodingAndText(s);
            break;
          case "TALB":
          case "TAL":
            i.album ??= a.readId3V2EncodingAndText(s);
            break;
          case "TPE2":
          case "TP2":
            i.albumArtist ??= a.readId3V2EncodingAndText(s);
            break;
          case "TRCK":
          case "TRK":
            {
              const e = a.readId3V2EncodingAndText(s).split("/"),
                t = Number.parseInt(e[0], 10),
                r = e[1] && Number.parseInt(e[1], 10);
              (Number.isInteger(t) && t > 0 && (i.trackNumber ??= t),
                r && Number.isInteger(r) && r > 0 && (i.tracksTotal ??= r));
            }
            break;
          case "TPOS":
          case "TPA":
            {
              const e = a.readId3V2EncodingAndText(s).split("/"),
                t = Number.parseInt(e[0], 10),
                r = e[1] && Number.parseInt(e[1], 10);
              (Number.isInteger(t) && t > 0 && (i.discNumber ??= t),
                r && Number.isInteger(r) && r > 0 && (i.discsTotal ??= r));
            }
            break;
          case "TCON":
          case "TCO":
            {
              const e = a.readId3V2EncodingAndText(s);
              let t = /^\((\d+)\)/.exec(e);
              if (t) {
                const e = Number.parseInt(t[1]);
                if (void 0 !== oa[e]) {
                  i.genre ??= oa[e];
                  break;
                }
              }
              if (((t = /^\d+$/.exec(e)), t)) {
                const e = Number.parseInt(t[0]);
                if (void 0 !== oa[e]) {
                  i.genre ??= oa[e];
                  break;
                }
              }
              i.genre ??= e;
            }
            break;
          case "TDRC":
          case "TDAT":
            {
              const e = a.readId3V2EncodingAndText(s),
                t = new Date(e);
              Number.isNaN(t.getTime()) || (i.date ??= t);
            }
            break;
          case "TYER":
          case "TYE":
            {
              const e = a.readId3V2EncodingAndText(s),
                t = Number.parseInt(e, 10);
              Number.isInteger(t) && (i.date ??= new Date(t, 0, 1));
            }
            break;
          case "USLT":
          case "ULT":
            {
              const e = a.readU8();
              ((a.pos += 3),
                a.readId3V2Text(e, s),
                (i.lyrics ??= a.readId3V2Text(e, s)));
            }
            break;
          case "COMM":
          case "COM":
            {
              const e = a.readU8();
              ((a.pos += 3),
                a.readId3V2Text(e, s),
                (i.comment ??= a.readId3V2Text(e, s)));
            }
            break;
          case "APIC":
          case "PIC":
            {
              const e = a.readId3V2TextEncoding();
              let r;
              if (2 === t.majorVersion) {
                const e = a.readAscii(3);
                r =
                  "PNG" === e
                    ? "image/png"
                    : "JPG" === e
                      ? "image/jpeg"
                      : "image/*";
              } else r = a.readId3V2Text(e, s);
              const n = a.readU8(),
                o = a.readId3V2Text(e, s).trimEnd(),
                c = s - a.pos;
              if (c >= 0) {
                const e = a.readBytes(c);
                (i.images || (i.images = []),
                  i.images.push({
                    data: e,
                    mimeType: r,
                    kind:
                      3 === n
                        ? "coverFront"
                        : 4 === n
                          ? "coverBack"
                          : "unknown",
                    description: o,
                  }));
              }
            }
            break;
          default:
            a.pos += e.size;
        }
        a.pos = s;
      }
    }
  };
class da {
  constructor(e, t) {
    ((this.header = e),
      (this.bytes = t),
      (this.pos = 0),
      (this.view = new DataView(t.buffer, t.byteOffset, t.byteLength)));
  }
  frameHeaderSize() {
    return 2 === this.header.majorVersion ? 6 : 10;
  }
  ununsynchronizeAll() {
    const e = [];
    for (let t = 0; t < this.bytes.length; t++) {
      const i = this.bytes[t];
      if ((e.push(i), 255 === i && t !== this.bytes.length - 1)) {
        0 === this.bytes[t] && t++;
      }
    }
    ((this.bytes = new Uint8Array(e)),
      (this.view = new DataView(this.bytes.buffer)));
  }
  ununsynchronizeRegion(e, t) {
    const i = [];
    for (let s = e; s < t; s++) {
      const e = this.bytes[s];
      if ((i.push(e), 255 === e && s !== t - 1)) {
        0 === this.bytes[s + 1] && s++;
      }
    }
    const r = this.bytes.subarray(0, e),
      a = this.bytes.subarray(t);
    ((this.bytes = new Uint8Array(r.length + i.length + a.length)),
      this.bytes.set(r, 0),
      this.bytes.set(i, r.length),
      this.bytes.set(a, r.length + i.length),
      (this.view = new DataView(this.bytes.buffer)));
  }
  removeFooter() {
    ((this.bytes = this.bytes.subarray(0, this.bytes.length - 10)),
      (this.view = new DataView(this.bytes.buffer)));
  }
  readBytes(e) {
    const t = this.bytes.subarray(this.pos, this.pos + e);
    return ((this.pos += e), t);
  }
  readU8() {
    const e = this.view.getUint8(this.pos);
    return ((this.pos += 1), e);
  }
  readU16() {
    const e = this.view.getUint16(this.pos, !1);
    return ((this.pos += 2), e);
  }
  readU24() {
    const e = this.view.getUint16(this.pos, !1),
      t = this.view.getUint8(this.pos + 1);
    return ((this.pos += 3), 256 * e + t);
  }
  readU32() {
    const e = this.view.getUint32(this.pos, !1);
    return ((this.pos += 4), e);
  }
  readAscii(e) {
    let t = "";
    for (let i = 0; i < e; i++)
      t += String.fromCharCode(this.view.getUint8(this.pos + i));
    return ((this.pos += e), t);
  }
  readId3V2Frame() {
    if (2 === this.header.majorVersion) {
      const e = this.readAscii(3);
      if ("\0\0\0" === e) return null;
      return { id: e, size: this.readU24(), flags: 0 };
    }
    {
      const e = this.readAscii(4);
      if ("\0\0\0\0" === e) return null;
      const t = this.readU32();
      let i = 4 === this.header.majorVersion ? ra(t) : t;
      const r = this.readU16(),
        a = this.pos,
        s = (e) => {
          const t = this.pos + e;
          if (t > this.bytes.length) return !1;
          if (t <= this.bytes.length - this.frameHeaderSize()) {
            this.pos += e;
            const t = this.readAscii(4);
            if ("\0\0\0\0" !== t && !/[0-9A-Z]{4}/.test(t)) return !1;
          }
          return !0;
        };
      if (!s(i)) {
        const e = 4 === this.header.majorVersion ? t : ra(t);
        s(e) && (i = e);
      }
      return ((this.pos = a), { id: e, size: i, flags: r });
    }
  }
  readId3V2TextEncoding() {
    const e = this.readU8();
    if (e > 3) throw new Error(`Unsupported text encoding: ${e}`);
    return e;
  }
  readId3V2Text(e, t) {
    const i = this.pos,
      r = this.readBytes(t - this.pos);
    switch (e) {
      case sa.ISO_8859_1: {
        let e = "";
        for (let t = 0; t < r.length; t++) {
          const a = r[t];
          if (0 === a) {
            this.pos = i + t + 1;
            break;
          }
          e += String.fromCharCode(a);
        }
        return e;
      }
      case sa.UTF_16_WITH_BOM:
        if (255 === r[0] && 254 === r[1]) {
          const e = new TextDecoder("utf-16le"),
            t = Ye(
              r.findIndex((e, t) => 0 === e && 0 === r[t + 1] && t % 2 == 0),
              r.length,
            );
          return (
            (this.pos = i + Math.min(t + 2, r.length)),
            e.decode(r.subarray(2, t))
          );
        }
        if (254 === r[0] && 255 === r[1]) {
          const e = new TextDecoder("utf-16be"),
            t = Ye(
              r.findIndex((e, t) => 0 === e && 0 === r[t + 1] && t % 2 == 0),
              r.length,
            );
          return (
            (this.pos = i + Math.min(t + 2, r.length)),
            e.decode(r.subarray(2, t))
          );
        }
        {
          const e = Ye(
            r.findIndex((e) => 0 === e),
            r.length,
          );
          return (
            (this.pos = i + Math.min(e + 1, r.length)),
            de.decode(r.subarray(0, e))
          );
        }
      case sa.UTF_16_BE_NO_BOM: {
        const e = new TextDecoder("utf-16be"),
          t = Ye(
            r.findIndex((e, t) => 0 === e && 0 === r[t + 1] && t % 2 == 0),
            r.length,
          );
        return (
          (this.pos = i + Math.min(t + 2, r.length)),
          e.decode(r.subarray(0, t))
        );
      }
      case sa.UTF_8: {
        const e = Ye(
          r.findIndex((e) => 0 === e),
          r.length,
        );
        return (
          (this.pos = i + Math.min(e + 1, r.length)),
          de.decode(r.subarray(0, e))
        );
      }
    }
  }
  readId3V2EncodingAndText(e) {
    if (this.pos >= e) return "";
    const t = this.readId3V2TextEncoding();
    return this.readId3V2Text(t, e);
  }
}
const ua = async (e, t, i) => {
  let r = t;
  for (; null === i || r < i; ) {
    let t = e.requestSlice(r, 4);
    if ((t instanceof Promise && (t = await t), !t)) break;
    const i = Ss(t),
      a = ia(i, null !== e.fileSize ? e.fileSize - r : null);
    if (a.header) return { header: a.header, startPos: r };
    r += a.bytesAdvanced;
  }
  return null;
};
class ma extends ki {
  constructor(e) {
    (super(e),
      (this.metadataPromise = null),
      (this.firstFrameHeader = null),
      (this.loadedSamples = []),
      (this.metadataTags = null),
      (this.tracks = []),
      (this.readingMutex = new Ce()),
      (this.lastSampleLoaded = !1),
      (this.lastLoadedPos = 0),
      (this.nextTimestampInSamples = 0),
      (this.reader = e._reader));
  }
  async readMetadata() {
    return (this.metadataPromise ??= (async () => {
      for (; !this.firstFrameHeader && !this.lastSampleLoaded; )
        await this.advanceReader();
      if (!this.firstFrameHeader) throw new Error("No valid MP3 frame found.");
      this.tracks = [new Ji(this.input, new pa(this))];
    })());
  }
  async advanceReader() {
    if (0 === this.lastLoadedPos)
      for (;;) {
        let e = this.reader.requestSlice(this.lastLoadedPos, 10);
        if ((e instanceof Promise && (e = await e), !e))
          return void (this.lastSampleLoaded = !0);
        const t = la(e);
        if (!t) break;
        this.lastLoadedPos = e.filePos + t.size;
      }
    const e = await ua(this.reader, this.lastLoadedPos, this.reader.fileSize);
    if (!e) return void (this.lastSampleLoaded = !0);
    const t = e.header;
    this.lastLoadedPos = e.startPos + t.totalSize - 1;
    const i =
      ((r = t.mpegVersionId),
      (a = t.channel),
      3 === r ? (3 === a ? 21 : 36) : 3 === a ? 13 : 21);
    var r, a;
    let s = this.reader.requestSlice(e.startPos + i, 4);
    if ((s instanceof Promise && (s = await s), s)) {
      const e = Ss(s);
      if (1483304551 === e || 1231971951 === e) return;
    }
    (this.firstFrameHeader || (this.firstFrameHeader = t),
      t.sampleRate !== this.firstFrameHeader.sampleRate &&
        console.warn(
          `MP3 changed sample rate mid-file: ${this.firstFrameHeader.sampleRate} Hz to ${t.sampleRate} Hz. Might be a bug, so please report this file.`,
        ));
    const n = t.audioSamplesInFrame / this.firstFrameHeader.sampleRate,
      o = {
        timestamp:
          this.nextTimestampInSamples / this.firstFrameHeader.sampleRate,
        duration: n,
        dataStart: e.startPos,
        dataSize: t.totalSize,
      };
    (this.loadedSamples.push(o),
      (this.nextTimestampInSamples += t.audioSamplesInFrame));
  }
  async getMimeType() {
    return "audio/mpeg";
  }
  async getTracks() {
    return (await this.readMetadata(), this.tracks);
  }
  async computeDuration() {
    await this.readMetadata();
    const e = this.tracks[0];
    return (ie(e), e.computeDuration());
  }
  async getMetadataTags() {
    const e = await this.readingMutex.acquire();
    try {
      if ((await this.readMetadata(), this.metadataTags))
        return this.metadataTags;
      this.metadataTags = {};
      let e = 0,
        t = !1;
      for (;;) {
        let i = this.reader.requestSlice(e, 10);
        if ((i instanceof Promise && (i = await i), !i)) break;
        const r = la(i);
        if (!r) break;
        t = !0;
        let a = this.reader.requestSlice(i.filePos, r.size);
        if ((a instanceof Promise && (a = await a), !a)) break;
        (ha(a, r, this.metadataTags), (e = i.filePos + r.size));
      }
      if (!t && null !== this.reader.fileSize && this.reader.fileSize >= na) {
        let e = this.reader.requestSlice(this.reader.fileSize - na, na);
        (e instanceof Promise && (e = await e), ie(e));
        "TAG" === Bs(e, 3) &&
          ((e, t) => {
            const i = e.filePos;
            ((t.raw ??= {}), (t.raw.TAG ??= gs(e, 125)), (e.filePos = i));
            const r = ca(e, 30);
            r && (t.title ??= r);
            const a = ca(e, 30);
            a && (t.artist ??= a);
            const s = ca(e, 30);
            s && (t.album ??= s);
            const n = ca(e, 4),
              o = Number.parseInt(n, 10);
            Number.isInteger(o) && o > 0 && (t.date ??= new Date(o, 0, 1));
            const c = gs(e, 30);
            let l;
            if (0 === c[28] && 0 !== c[29]) {
              const i = c[29];
              (i > 0 && (t.trackNumber ??= i),
                e.skip(-30),
                (l = ca(e, 28)),
                e.skip(2));
            } else (e.skip(-30), (l = ca(e, 30)));
            l && (t.comment ??= l);
            const h = ks(e);
            h < oa.length && (t.genre ??= oa[h]);
          })(e, this.metadataTags);
      }
      return this.metadataTags;
    } finally {
      e();
    }
  }
}
class pa {
  constructor(e) {
    this.demuxer = e;
  }
  getId() {
    return 1;
  }
  async getFirstTimestamp() {
    return 0;
  }
  getTimeResolution() {
    return (
      ie(this.demuxer.firstFrameHeader),
      this.demuxer.firstFrameHeader.sampleRate /
        this.demuxer.firstFrameHeader.audioSamplesInFrame
    );
  }
  async computeDuration() {
    const e = await this.getPacket(1 / 0, { metadataOnly: !0 });
    return (e?.timestamp ?? 0) + (e?.duration ?? 0);
  }
  getName() {
    return null;
  }
  getLanguageCode() {
    return Re;
  }
  getCodec() {
    return "mp3";
  }
  getInternalCodecId() {
    return null;
  }
  getNumberOfChannels() {
    return (
      ie(this.demuxer.firstFrameHeader),
      3 === this.demuxer.firstFrameHeader.channel ? 1 : 2
    );
  }
  getSampleRate() {
    return (
      ie(this.demuxer.firstFrameHeader),
      this.demuxer.firstFrameHeader.sampleRate
    );
  }
  getDisposition() {
    return { ...ct };
  }
  async getDecoderConfig() {
    return (
      ie(this.demuxer.firstFrameHeader),
      {
        codec: "mp3",
        numberOfChannels: 3 === this.demuxer.firstFrameHeader.channel ? 1 : 2,
        sampleRate: this.demuxer.firstFrameHeader.sampleRate,
      }
    );
  }
  async getPacketAtIndex(e, t) {
    if (-1 === e) return null;
    const i = this.demuxer.loadedSamples[e];
    if (!i) return null;
    let r;
    if (t.metadataOnly) r = Ci;
    else {
      let e = this.demuxer.reader.requestSlice(i.dataStart, i.dataSize);
      if ((e instanceof Promise && (e = await e), !e)) return null;
      r = gs(e, i.dataSize);
    }
    return new Si(r, "key", i.timestamp, i.duration, e, i.dataSize);
  }
  getFirstPacket(e) {
    return this.getPacketAtIndex(0, e);
  }
  async getNextPacket(e, t) {
    const i = await this.demuxer.readingMutex.acquire();
    try {
      const i = xe(this.demuxer.loadedSamples, e.timestamp, (e) => e.timestamp);
      if (-1 === i) throw new Error("Packet was not created from this track.");
      const r = i + 1;
      for (
        ;
        r >= this.demuxer.loadedSamples.length &&
        !this.demuxer.lastSampleLoaded;

      )
        await this.demuxer.advanceReader();
      return this.getPacketAtIndex(r, t);
    } finally {
      i();
    }
  }
  async getPacket(e, t) {
    const i = await this.demuxer.readingMutex.acquire();
    try {
      for (;;) {
        const i = Pe(this.demuxer.loadedSamples, e, (e) => e.timestamp);
        if (-1 === i && this.demuxer.loadedSamples.length > 0) return null;
        if (this.demuxer.lastSampleLoaded) return this.getPacketAtIndex(i, t);
        if (i >= 0 && i + 1 < this.demuxer.loadedSamples.length)
          return this.getPacketAtIndex(i, t);
        await this.demuxer.advanceReader();
      }
    } finally {
      i();
    }
  }
  getKeyPacket(e, t) {
    return this.getPacket(e, t);
  }
  getNextKeyPacket(e, t) {
    return this.getNextPacket(e, t);
  }
}
const fa = 1399285583,
  ga = new Uint32Array(256);
for (let Zh = 0; Zh < 256; Zh++) {
  let e = Zh << 24;
  for (let t = 0; t < 8; t++) e = 2147483648 & e ? (e << 1) ^ 79764919 : e << 1;
  ga[Zh] = (e >>> 0) & 4294967295;
}
const ka = (e) => {
    const t = he(e),
      i = t.getUint32(22, !0);
    t.setUint32(22, 0, !0);
    let r = 0;
    for (let a = 0; a < e.length; a++) {
      const t = e[a];
      r = ((r << 8) ^ ga[(r >>> 24) ^ t]) >>> 0;
    }
    return (t.setUint32(22, i, !0), r);
  },
  ya = (e, t, i) => {
    let r = 0,
      a = null;
    if (e.length > 0)
      if ("vorbis" === t.codec) {
        ie(t.vorbisInfo);
        const s =
            ((1 <<
              ((e) => {
                let t = 0;
                for (; e; ) (t++, (e >>= 1));
                return t;
              })(t.vorbisInfo.modeBlockflags.length - 1)) -
              1) <<
            1,
          n = (e[0] & s) >> 1;
        if (n >= t.vorbisInfo.modeBlockflags.length)
          throw new Error("Invalid mode number.");
        let o = i;
        const c = t.vorbisInfo.modeBlockflags[n];
        if (((a = t.vorbisInfo.blocksizes[c]), 1 === c)) {
          const i = 1 + (1 | s),
            r = e[0] & i ? 1 : 0;
          o = t.vorbisInfo.blocksizes[r];
        }
        r = null !== o ? (o + a) >> 2 : 0;
      } else if ("opus" === t.codec) {
        r = ((e) => {
          const t = e[0] >> 3;
          return { durationInSamples: di[t] };
        })(e).durationInSamples;
      }
    return { durationInSamples: r, vorbisBlockSize: a };
  },
  wa = (e) => {
    let t = "audio/ogg";
    if (e.codecStrings) {
      t += `; codecs="${[...new Set(e.codecStrings)].join(", ")}"`;
    }
    return t;
  },
  ba = 27,
  Ta = 282,
  Ca = (e) => {
    const t = e.filePos;
    if (vs(e) !== fa) return null;
    e.skip(1);
    const i = ks(e),
      r = _s(e),
      a = vs(e),
      s = vs(e),
      n = vs(e),
      o = ks(e),
      c = new Uint8Array(o);
    for (let d = 0; d < o; d++) c[d] = ks(e);
    const l = 27 + o,
      h = c.reduce((e, t) => e + t, 0);
    return {
      headerStartPos: t,
      totalSize: l + h,
      dataStartPos: t + l,
      dataSize: h,
      headerType: i,
      granulePosition: r,
      serialNumber: a,
      sequenceNumber: s,
      checksum: n,
      lacingValues: c,
    };
  },
  Sa = (e, t) => {
    for (; e.filePos < t - 3; ) {
      const t = vs(e),
        i = 79;
      if (
        (255 & t) === i ||
        ((t >>> 8) & 255) === i ||
        ((t >>> 16) & 255) === i ||
        ((t >>> 24) & 255) === i
      ) {
        if ((e.skip(-4), t === fa)) return !0;
        e.skip(1);
      }
    }
    return !1;
  };
class va extends ki {
  constructor(e) {
    (super(e),
      (this.metadataPromise = null),
      (this.bitstreams = []),
      (this.tracks = []),
      (this.metadataTags = {}),
      (this.reader = e._reader));
  }
  async readMetadata() {
    return (this.metadataPromise ??= (async () => {
      let e = 0;
      for (;;) {
        let t = this.reader.requestSliceRange(e, ba, Ta);
        if ((t instanceof Promise && (t = await t), !t)) break;
        const i = Ca(t);
        if (!i) break;
        if (!!!(2 & i.headerType)) break;
        (this.bitstreams.push({
          serialNumber: i.serialNumber,
          bosPage: i,
          description: null,
          numberOfChannels: -1,
          sampleRate: -1,
          codecInfo: { codec: null, vorbisInfo: null, opusInfo: null },
          lastMetadataPacket: null,
        }),
          (e = i.headerStartPos + i.totalSize));
      }
      for (const t of this.bitstreams) {
        const e = await this.readPacket(t.bosPage, 0);
        e &&
          (e.data.byteLength >= 7 &&
          1 === e.data[0] &&
          118 === e.data[1] &&
          111 === e.data[2] &&
          114 === e.data[3] &&
          98 === e.data[4] &&
          105 === e.data[5] &&
          115 === e.data[6]
            ? await this.readVorbisMetadata(e, t)
            : e.data.byteLength >= 8 &&
              79 === e.data[0] &&
              112 === e.data[1] &&
              117 === e.data[2] &&
              115 === e.data[3] &&
              72 === e.data[4] &&
              101 === e.data[5] &&
              97 === e.data[6] &&
              100 === e.data[7] &&
              (await this.readOpusMetadata(e, t)),
          null !== t.codecInfo.codec &&
            this.tracks.push(new Ji(this.input, new xa(t, this))));
      }
    })());
  }
  async readVorbisMetadata(e, t) {
    let i = await this.findNextPacketStart(e);
    if (!i) return;
    const r = await this.readPacket(i.startPage, i.startSegmentIndex);
    if (!r) return;
    if (((i = await this.findNextPacketStart(r)), !i)) return;
    const a = await this.readPacket(i.startPage, i.startSegmentIndex);
    if (!a) return;
    if (3 !== r.data[0] || 5 !== a.data[0]) return;
    const s = [],
      n = (e) => {
        for (; s.push(Math.min(255, e)), !(e < 255); ) e -= 255;
      };
    (n(e.data.length), n(r.data.length));
    const o = new Uint8Array(
      1 + s.length + e.data.length + r.data.length + a.data.length,
    );
    ((o[0] = 2),
      o.set(s, 1),
      o.set(e.data, 1 + s.length),
      o.set(r.data, 1 + s.length + e.data.length),
      o.set(a.data, 1 + s.length + e.data.length + r.data.length),
      (t.codecInfo.codec = "vorbis"),
      (t.description = o),
      (t.lastMetadataPacket = a));
    const c = he(e.data);
    ((t.numberOfChannels = c.getUint8(11)),
      (t.sampleRate = c.getUint32(12, !0)));
    const l = c.getUint8(28);
    ((t.codecInfo.vorbisInfo = {
      blocksizes: [1 << (15 & l), 1 << (l >> 4)],
      modeBlockflags: ui(a.data).modeBlockflags,
    }),
      fi(r.data.subarray(7), this.metadataTags));
  }
  async readOpusMetadata(e, t) {
    const i = await this.findNextPacketStart(e);
    if (!i) return;
    const r = await this.readPacket(i.startPage, i.startSegmentIndex);
    if (!r) return;
    ((t.codecInfo.codec = "opus"),
      (t.description = e.data),
      (t.lastMetadataPacket = r));
    const a = hi(e.data);
    ((t.numberOfChannels = a.outputChannelCount),
      (t.sampleRate = _t),
      (t.codecInfo.opusInfo = { preSkip: a.preSkip }),
      fi(r.data.subarray(8), this.metadataTags));
  }
  async readPacket(e, t) {
    ie(t < e.lacingValues.length);
    let i = 0;
    for (let h = 0; h < t; h++) i += e.lacingValues[h];
    let r = e,
      a = i,
      s = t;
    const n = [];
    e: for (;;) {
      let t = this.reader.requestSlice(r.dataStartPos, r.dataSize);
      (t instanceof Promise && (t = await t), ie(t));
      const o = gs(t, r.dataSize);
      for (;;) {
        if (s === r.lacingValues.length) {
          n.push(o.subarray(i, a));
          break;
        }
        const e = r.lacingValues[s];
        if (((a += e), e < 255)) {
          n.push(o.subarray(i, a));
          break e;
        }
        s++;
      }
      let c = r.headerStartPos + r.totalSize;
      for (;;) {
        let t = this.reader.requestSliceRange(c, ba, Ta);
        if ((t instanceof Promise && (t = await t), !t)) return null;
        const i = Ca(t);
        if (!i) return null;
        if (((r = i), r.serialNumber === e.serialNumber)) break;
        c = r.headerStartPos + r.totalSize;
      }
      ((i = 0), (a = 0), (s = 0));
    }
    const o = n.reduce((e, t) => e + t.length, 0),
      c = new Uint8Array(o);
    let l = 0;
    for (let h = 0; h < n.length; h++) {
      const e = n[h];
      (c.set(e, l), (l += e.length));
    }
    return { data: c, endPage: r, endSegmentIndex: s };
  }
  async findNextPacketStart(e) {
    if (e.endSegmentIndex < e.endPage.lacingValues.length - 1)
      return { startPage: e.endPage, startSegmentIndex: e.endSegmentIndex + 1 };
    if (!!(4 & e.endPage.headerType)) return null;
    let t = e.endPage.headerStartPos + e.endPage.totalSize;
    for (;;) {
      let i = this.reader.requestSliceRange(t, ba, Ta);
      if ((i instanceof Promise && (i = await i), !i)) return null;
      const r = Ca(i);
      if (!r) return null;
      if (r.serialNumber === e.endPage.serialNumber)
        return { startPage: r, startSegmentIndex: 0 };
      t = r.headerStartPos + r.totalSize;
    }
  }
  async getMimeType() {
    await this.readMetadata();
    const e = await Promise.all(
      this.tracks.map((e) => e.getCodecParameterString()),
    );
    return wa({ codecStrings: e.filter(Boolean) });
  }
  async getTracks() {
    return (await this.readMetadata(), this.tracks);
  }
  async computeDuration() {
    const e = await this.getTracks(),
      t = await Promise.all(e.map((e) => e.computeDuration()));
    return Math.max(0, ...t);
  }
  async getMetadataTags() {
    return (await this.readMetadata(), this.metadataTags);
  }
}
class xa {
  constructor(e, t) {
    ((this.bitstream = e),
      (this.demuxer = t),
      (this.encodedPacketToMetadata = new WeakMap()),
      (this.sequentialScanCache = []),
      (this.sequentialScanMutex = new Ce()),
      (this.internalSampleRate =
        "opus" === e.codecInfo.codec ? _t : e.sampleRate));
  }
  getId() {
    return this.bitstream.serialNumber;
  }
  getNumberOfChannels() {
    return this.bitstream.numberOfChannels;
  }
  getSampleRate() {
    return this.bitstream.sampleRate;
  }
  getTimeResolution() {
    return this.bitstream.sampleRate;
  }
  getCodec() {
    return this.bitstream.codecInfo.codec;
  }
  getInternalCodecId() {
    return null;
  }
  async getDecoderConfig() {
    return (
      ie(this.bitstream.codecInfo.codec),
      {
        codec: this.bitstream.codecInfo.codec,
        numberOfChannels: this.bitstream.numberOfChannels,
        sampleRate: this.bitstream.sampleRate,
        description: this.bitstream.description ?? void 0,
      }
    );
  }
  getName() {
    return null;
  }
  getLanguageCode() {
    return Re;
  }
  getDisposition() {
    return { ...ct };
  }
  async getFirstTimestamp() {
    return 0;
  }
  async computeDuration() {
    const e = await this.getPacket(1 / 0, { metadataOnly: !0 });
    return (e?.timestamp ?? 0) + (e?.duration ?? 0);
  }
  granulePositionToTimestampInSamples(e) {
    return "opus" === this.bitstream.codecInfo.codec
      ? (ie(this.bitstream.codecInfo.opusInfo),
        e - this.bitstream.codecInfo.opusInfo.preSkip)
      : e;
  }
  createEncodedPacketFromOggPacket(e, t, i) {
    if (!e) return null;
    const { durationInSamples: r, vorbisBlockSize: a } = ya(
        e.data,
        this.bitstream.codecInfo,
        t.vorbisLastBlocksize,
      ),
      s = new Si(
        i.metadataOnly ? Ci : e.data,
        "key",
        Math.max(0, t.timestampInSamples) / this.internalSampleRate,
        r / this.internalSampleRate,
        e.endPage.headerStartPos + e.endSegmentIndex,
        e.data.byteLength,
      );
    return (
      this.encodedPacketToMetadata.set(s, {
        packet: e,
        timestampInSamples: t.timestampInSamples,
        durationInSamples: r,
        vorbisLastBlockSize: t.vorbisLastBlocksize,
        vorbisBlockSize: a,
      }),
      s
    );
  }
  async getFirstPacket(e) {
    ie(this.bitstream.lastMetadataPacket);
    const t = await this.demuxer.findNextPacketStart(
      this.bitstream.lastMetadataPacket,
    );
    if (!t) return null;
    let i = 0;
    "opus" === this.bitstream.codecInfo.codec &&
      (ie(this.bitstream.codecInfo.opusInfo),
      (i -= this.bitstream.codecInfo.opusInfo.preSkip));
    const r = await this.demuxer.readPacket(t.startPage, t.startSegmentIndex);
    return this.createEncodedPacketFromOggPacket(
      r,
      { timestampInSamples: i, vorbisLastBlocksize: null },
      e,
    );
  }
  async getNextPacket(e, t) {
    const i = this.encodedPacketToMetadata.get(e);
    if (!i) throw new Error("Packet was not created from this track.");
    const r = await this.demuxer.findNextPacketStart(i.packet);
    if (!r) return null;
    const a = i.timestampInSamples + i.durationInSamples,
      s = await this.demuxer.readPacket(r.startPage, r.startSegmentIndex);
    return this.createEncodedPacketFromOggPacket(
      s,
      { timestampInSamples: a, vorbisLastBlocksize: i.vorbisBlockSize },
      t,
    );
  }
  async getPacket(e, t) {
    if (null === this.demuxer.reader.fileSize)
      return this.getPacketSequential(e, t);
    const i = ze(e * this.internalSampleRate);
    if (0 === i) return this.getFirstPacket(t);
    if (i < 0) return null;
    ie(this.bitstream.lastMetadataPacket);
    const r = await this.demuxer.findNextPacketStart(
      this.bitstream.lastMetadataPacket,
    );
    if (!r) return null;
    let a = r.startPage,
      s = this.demuxer.reader.fileSize;
    const n = [a];
    e: for (; a.headerStartPos + a.totalSize < s; ) {
      const e = a.headerStartPos,
        t = Math.floor((e + s) / 2);
      let r = t;
      for (;;) {
        const e = Math.min(r + 65307, s - ba);
        let o = this.demuxer.reader.requestSlice(r, e - r);
        (o instanceof Promise && (o = await o), ie(o));
        if (!Sa(o, e)) {
          s = t + ba;
          continue e;
        }
        let c = this.demuxer.reader.requestSliceRange(o.filePos, ba, Ta);
        (c instanceof Promise && (c = await c), ie(c));
        const l = Ca(c);
        ie(l);
        let h = !1;
        if (l.serialNumber === this.bitstream.serialNumber) h = !0;
        else {
          let e = this.demuxer.reader.requestSlice(
            l.headerStartPos,
            l.totalSize,
          );
          (e instanceof Promise && (e = await e), ie(e));
          const t = gs(e, l.totalSize);
          h = ka(t) === l.checksum;
        }
        if (!h) {
          r = l.headerStartPos + 4;
          continue;
        }
        if (h && l.serialNumber !== this.bitstream.serialNumber) {
          r = l.headerStartPos + l.totalSize;
          continue;
        }
        if (!(-1 === l.granulePosition)) {
          this.granulePositionToTimestampInSamples(l.granulePosition) > i
            ? (s = l.headerStartPos)
            : ((a = l), n.push(l));
          continue e;
        }
        r = l.headerStartPos + l.totalSize;
      }
    }
    let o = r.startPage;
    for (const k of n) {
      if (k.granulePosition === a.granulePosition) break;
      (!o || k.headerStartPos > o.headerStartPos) && (o = k);
    }
    let c = o;
    const l = [c];
    for (
      ;
      c.serialNumber !== this.bitstream.serialNumber ||
      c.granulePosition !== a.granulePosition;

    ) {
      const e = c.headerStartPos + c.totalSize;
      let t = this.demuxer.reader.requestSliceRange(e, ba, Ta);
      (t instanceof Promise && (t = await t), ie(t));
      const i = Ca(t);
      (ie(i),
        (c = i),
        c.serialNumber === this.bitstream.serialNumber && l.push(c));
    }
    ie(-1 !== c.granulePosition);
    let h,
      d,
      u = null,
      m = c,
      p = 0;
    if (c.headerStartPos === r.startPage.headerStartPos)
      ((h = this.granulePositionToTimestampInSamples(0)), (d = !0), (u = 0));
    else {
      ((h = 0), (d = !1));
      for (let t = c.lacingValues.length - 1; t >= 0; t--) {
        if (c.lacingValues[t] < 255) {
          u = t + 1;
          break;
        }
      }
      if (null === u)
        throw new Error(
          "Invalid page with granule position: no packets end on this page.",
        );
      p = u - 1;
      const e = { data: Ci, endPage: m, endSegmentIndex: p };
      if (await this.demuxer.findNextPacketStart(e)) {
        const e = Ea(l, c, u);
        ie(e);
        const t = Pa(l, e.page, e.segmentIndex);
        t && ((c = t.page), (u = t.segmentIndex));
      } else
        for (;;) {
          const e = Ea(l, c, u);
          if (!e) break;
          const t = Pa(l, e.page, e.segmentIndex);
          if (!t) break;
          if (
            ((c = t.page),
            (u = t.segmentIndex),
            e.page.headerStartPos !== m.headerStartPos)
          ) {
            ((m = e.page), (p = e.segmentIndex));
            break;
          }
        }
    }
    let f = null,
      g = null;
    for (; null !== c; ) {
      ie(null !== u);
      const e = await this.demuxer.readPacket(c, u);
      if (!e) break;
      if (
        !(
          c.headerStartPos === r.startPage.headerStartPos &&
          u < r.startSegmentIndex
        )
      ) {
        let r = this.createEncodedPacketFromOggPacket(
          e,
          {
            timestampInSamples: h,
            vorbisLastBlocksize: g?.vorbisBlockSize ?? null,
          },
          t,
        );
        ie(r);
        let a = this.encodedPacketToMetadata.get(r);
        if (
          (ie(a),
          d ||
          e.endPage.headerStartPos !== m.headerStartPos ||
          e.endSegmentIndex !== p
            ? (h += a.durationInSamples)
            : ((h = this.granulePositionToTimestampInSamples(
                c.granulePosition,
              )),
              (d = !0),
              (r = this.createEncodedPacketFromOggPacket(
                e,
                {
                  timestampInSamples: h - a.durationInSamples,
                  vorbisLastBlocksize: g?.vorbisBlockSize ?? null,
                },
                t,
              )),
              ie(r),
              (a = this.encodedPacketToMetadata.get(r)),
              ie(a)),
          (f = r),
          (g = a),
          d && (Math.max(h, 0) > i || Math.max(a.timestampInSamples, 0) === i))
        )
          break;
      }
      const a = await this.demuxer.findNextPacketStart(e);
      if (!a) break;
      ((c = a.startPage), (u = a.startSegmentIndex));
    }
    return f;
  }
  async getPacketSequential(e, t) {
    const i = await this.sequentialScanMutex.acquire();
    try {
      const i = ze(e * this.internalSampleRate);
      e = i / this.internalSampleRate;
      const r = Pe(this.sequentialScanCache, i, (e) => e.timestampInSamples);
      let a;
      if (-1 !== r) {
        const e = this.sequentialScanCache[r];
        a = this.createEncodedPacketFromOggPacket(
          e.packet,
          {
            timestampInSamples: e.timestampInSamples,
            vorbisLastBlocksize: e.vorbisLastBlockSize,
          },
          t,
        );
      } else a = await this.getFirstPacket(t);
      let s = 0;
      for (; a && a.timestamp < e; ) {
        const i = await this.getNextPacket(a, t);
        if (!i || i.timestamp > e) break;
        if (((a = i), s++, 100 === s)) {
          s = 0;
          const e = this.encodedPacketToMetadata.get(a);
          (ie(e),
            this.sequentialScanCache.length > 0 &&
              ie(
                ae(this.sequentialScanCache).timestampInSamples <=
                  e.timestampInSamples,
              ),
            this.sequentialScanCache.push(e));
        }
      }
      return a;
    } finally {
      i();
    }
  }
  getKeyPacket(e, t) {
    return this.getPacket(e, t);
  }
  getNextKeyPacket(e, t) {
    return this.getNextPacket(e, t);
  }
}
const Pa = (e, t, i) => {
    let r = t,
      a = i;
    e: for (;;) {
      for (a--; a >= 0; a--) {
        if (r.lacingValues[a] < 255) {
          a++;
          break e;
        }
      }
      ie(-1 === a);
      if (!(1 & r.headerType)) {
        a = 0;
        break;
      }
      const t = _e(e, (e) => e.headerStartPos < r.headerStartPos);
      if (!t) return null;
      ((r = t), (a = r.lacingValues.length));
    }
    if ((ie(-1 !== a), a === r.lacingValues.length)) {
      const t = e[e.indexOf(r) + 1];
      (ie(t), (r = t), (a = 0));
    }
    return { page: r, segmentIndex: a };
  },
  Ea = (e, t, i) => {
    if (i > 0) return { page: t, segmentIndex: i - 1 };
    const r = _e(e, (e) => e.headerStartPos < t.headerStartPos);
    return r ? { page: r, segmentIndex: r.lacingValues.length - 1 } : null;
  };
var Ia;
!(function (e) {
  ((e[(e.PCM = 1)] = "PCM"),
    (e[(e.IEEE_FLOAT = 3)] = "IEEE_FLOAT"),
    (e[(e.ALAW = 6)] = "ALAW"),
    (e[(e.MULAW = 7)] = "MULAW"),
    (e[(e.EXTENSIBLE = 65534)] = "EXTENSIBLE"));
})(Ia || (Ia = {}));
class _a extends ki {
  constructor(e) {
    (super(e),
      (this.metadataPromise = null),
      (this.dataStart = -1),
      (this.dataSize = -1),
      (this.audioInfo = null),
      (this.tracks = []),
      (this.lastKnownPacketIndex = 0),
      (this.metadataTags = {}),
      (this.reader = e._reader));
  }
  async readMetadata() {
    return (this.metadataPromise ??= (async () => {
      let e = this.reader.requestSlice(0, 12);
      (e instanceof Promise && (e = await e), ie(e));
      const t = Bs(e, 4),
        i = "RIFX" !== t,
        r = "RF64" === t,
        a = Cs(e, i);
      let s = r
        ? this.reader.fileSize
        : Math.min(a + 8, this.reader.fileSize ?? 1 / 0);
      if ("WAVE" !== Bs(e, 4))
        throw new Error("Invalid WAVE file - wrong format");
      let n = 0,
        o = null,
        c = e.filePos;
      for (; null === s || c < s; ) {
        let e = this.reader.requestSlice(c, 8);
        if ((e instanceof Promise && (e = await e), !e)) break;
        const t = Bs(e, 4),
          a = Cs(e, i),
          l = e.filePos;
        if (r && 0 === n && "ds64" !== t)
          throw new Error('Invalid RF64 file: First chunk must be "ds64".');
        if ("fmt " === t) await this.parseFmtChunk(l, a, i);
        else if ("data" === t) {
          if (
            ((o ??= a),
            (this.dataStart = e.filePos),
            (this.dataSize = Math.min(o, (s ?? 1 / 0) - this.dataStart)),
            null === this.reader.fileSize)
          )
            break;
        } else if ("ds64" === t) {
          let e = this.reader.requestSlice(l, a);
          if ((e instanceof Promise && (e = await e), !e)) break;
          const t = Ps(e, i);
          ((o = Ps(e, i)),
            (s = Math.min(t + 8, this.reader.fileSize ?? 1 / 0)));
        } else
          "LIST" === t
            ? await this.parseListChunk(l, a, i)
            : ("ID3 " !== t && "id3 " !== t) ||
              (await this.parseId3Chunk(l, a));
        ((c = l + a + (1 & a)), n++);
      }
      if (!this.audioInfo)
        throw new Error('Invalid WAVE file - missing "fmt " chunk');
      if (-1 === this.dataStart)
        throw new Error('Invalid WAVE file - missing "data" chunk');
      const l = this.audioInfo.blockSizeInBytes;
      ((this.dataSize = Math.floor(this.dataSize / l) * l),
        this.tracks.push(new Ji(this.input, new Fa(this))));
    })());
  }
  async parseFmtChunk(e, t, i) {
    let r = this.reader.requestSlice(e, t);
    if ((r instanceof Promise && (r = await r), !r)) return;
    let a = ys(r, i);
    const s = ys(r, i),
      n = Cs(r, i);
    r.skip(4);
    const o = ys(r, i);
    let c;
    if (((c = 14 === t ? 8 : ys(r, i)), t >= 18 && 357 !== a)) {
      const e = ys(r, i),
        s = t - 18;
      if (Math.min(s, e) >= 22 && a === Ia.EXTENSIBLE) {
        r.skip(6);
        const e = gs(r, 16);
        a = e[0] | (e[1] << 8);
      }
    }
    ((a !== Ia.MULAW && a !== Ia.ALAW) || (c = 8),
      (this.audioInfo = {
        format: a,
        numberOfChannels: s,
        sampleRate: n,
        sampleSizeInBytes: Math.ceil(c / 8),
        blockSizeInBytes: o,
      }));
  }
  async parseListChunk(e, t, i) {
    let r = this.reader.requestSlice(e, t);
    if ((r instanceof Promise && (r = await r), !r)) return;
    const a = Bs(r, 4);
    if ("INFO" !== a && "INF0" !== a) return;
    let s = r.filePos;
    for (; s <= e + t - 8; ) {
      r.filePos = s;
      const e = Bs(r, 4),
        t = Cs(r, i),
        a = gs(r, t);
      let n = 0;
      for (let i = 0; i < a.length && 0 !== a[i]; i++) n++;
      const o = String.fromCharCode(...a.subarray(0, n));
      switch (
        ((this.metadataTags.raw ??= {}), (this.metadataTags.raw[e] = o), e)
      ) {
        case "INAM":
        case "TITL":
          this.metadataTags.title ??= o;
          break;
        case "TIT3":
          this.metadataTags.description ??= o;
          break;
        case "IART":
          this.metadataTags.artist ??= o;
          break;
        case "IPRD":
          this.metadataTags.album ??= o;
          break;
        case "IPRT":
        case "ITRK":
        case "TRCK":
          {
            const e = o.split("/"),
              t = Number.parseInt(e[0], 10),
              i = e[1] && Number.parseInt(e[1], 10);
            (Number.isInteger(t) &&
              t > 0 &&
              (this.metadataTags.trackNumber ??= t),
              i &&
                Number.isInteger(i) &&
                i > 0 &&
                (this.metadataTags.tracksTotal ??= i));
          }
          break;
        case "ICRD":
        case "IDIT":
          {
            const e = new Date(o);
            Number.isNaN(e.getTime()) || (this.metadataTags.date ??= e);
          }
          break;
        case "YEAR":
          {
            const e = Number.parseInt(o, 10);
            Number.isInteger(e) &&
              e > 0 &&
              (this.metadataTags.date ??= new Date(e, 0, 1));
          }
          break;
        case "IGNR":
        case "GENR":
          this.metadataTags.genre ??= o;
          break;
        case "ICMT":
        case "CMNT":
        case "COMM":
          this.metadataTags.comment ??= o;
      }
      s += 8 + t + (1 & t);
    }
  }
  async parseId3Chunk(e, t) {
    let i = this.reader.requestSlice(e, t);
    if ((i instanceof Promise && (i = await i), !i)) return;
    const r = la(i);
    if (r) {
      const t = i.slice(e + 10, r.size);
      ha(t, r, this.metadataTags);
    }
  }
  getCodec() {
    if ((ie(this.audioInfo), this.audioInfo.format === Ia.MULAW)) return "ulaw";
    if (this.audioInfo.format === Ia.ALAW) return "alaw";
    if (this.audioInfo.format === Ia.PCM) {
      if (1 === this.audioInfo.sampleSizeInBytes) return "pcm-u8";
      if (2 === this.audioInfo.sampleSizeInBytes) return "pcm-s16";
      if (3 === this.audioInfo.sampleSizeInBytes) return "pcm-s24";
      if (4 === this.audioInfo.sampleSizeInBytes) return "pcm-s32";
    }
    return this.audioInfo.format === Ia.IEEE_FLOAT &&
      4 === this.audioInfo.sampleSizeInBytes
      ? "pcm-f32"
      : null;
  }
  async getMimeType() {
    return "audio/wav";
  }
  async computeDuration() {
    await this.readMetadata();
    const e = this.tracks[0];
    return (ie(e), e.computeDuration());
  }
  async getTracks() {
    return (await this.readMetadata(), this.tracks);
  }
  async getMetadataTags() {
    return (await this.readMetadata(), this.metadataTags);
  }
}
const Aa = 2048;
class Fa {
  constructor(e) {
    this.demuxer = e;
  }
  getId() {
    return 1;
  }
  getCodec() {
    return this.demuxer.getCodec();
  }
  getInternalCodecId() {
    return (ie(this.demuxer.audioInfo), this.demuxer.audioInfo.format);
  }
  async getDecoderConfig() {
    const e = this.demuxer.getCodec();
    return e
      ? (ie(this.demuxer.audioInfo),
        {
          codec: e,
          numberOfChannels: this.demuxer.audioInfo.numberOfChannels,
          sampleRate: this.demuxer.audioInfo.sampleRate,
        })
      : null;
  }
  async computeDuration() {
    const e = await this.getPacket(1 / 0, { metadataOnly: !0 });
    return (e?.timestamp ?? 0) + (e?.duration ?? 0);
  }
  getNumberOfChannels() {
    return (
      ie(this.demuxer.audioInfo),
      this.demuxer.audioInfo.numberOfChannels
    );
  }
  getSampleRate() {
    return (ie(this.demuxer.audioInfo), this.demuxer.audioInfo.sampleRate);
  }
  getTimeResolution() {
    return (ie(this.demuxer.audioInfo), this.demuxer.audioInfo.sampleRate);
  }
  getName() {
    return null;
  }
  getLanguageCode() {
    return Re;
  }
  getDisposition() {
    return { ...ct };
  }
  async getFirstTimestamp() {
    return 0;
  }
  async getPacketAtIndex(e, t) {
    ie(this.demuxer.audioInfo);
    const i = e * Aa * this.demuxer.audioInfo.blockSizeInBytes;
    if (i >= this.demuxer.dataSize) return null;
    const r = Math.min(
      Aa * this.demuxer.audioInfo.blockSizeInBytes,
      this.demuxer.dataSize - i,
    );
    if (null === this.demuxer.reader.fileSize) {
      let e = this.demuxer.reader.requestSlice(this.demuxer.dataStart + i, r);
      if ((e instanceof Promise && (e = await e), !e)) return null;
    }
    let a;
    if (t.metadataOnly) a = Ci;
    else {
      let e = this.demuxer.reader.requestSlice(this.demuxer.dataStart + i, r);
      (e instanceof Promise && (e = await e), ie(e), (a = gs(e, r)));
    }
    const s = (e * Aa) / this.demuxer.audioInfo.sampleRate,
      n =
        r /
        this.demuxer.audioInfo.blockSizeInBytes /
        this.demuxer.audioInfo.sampleRate;
    return (
      (this.demuxer.lastKnownPacketIndex = Math.max(e, s)),
      new Si(a, "key", s, n, e, r)
    );
  }
  getFirstPacket(e) {
    return this.getPacketAtIndex(0, e);
  }
  async getPacket(e, t) {
    ie(this.demuxer.audioInfo);
    const i = Math.floor(
        Math.min(
          (e * this.demuxer.audioInfo.sampleRate) / Aa,
          (this.demuxer.dataSize - 1) /
            (Aa * this.demuxer.audioInfo.blockSizeInBytes),
        ),
      ),
      r = await this.getPacketAtIndex(i, t);
    if (r) return r;
    if (0 === i) return null;
    ie(null === this.demuxer.reader.fileSize);
    let a = await this.getPacketAtIndex(this.demuxer.lastKnownPacketIndex, t);
    for (; a; ) {
      const e = await this.getNextPacket(a, t);
      if (!e) break;
      a = e;
    }
    return a;
  }
  getNextPacket(e, t) {
    ie(this.demuxer.audioInfo);
    const i = Math.round(
      (e.timestamp * this.demuxer.audioInfo.sampleRate) / Aa,
    );
    return this.getPacketAtIndex(i + 1, t);
  }
  getKeyPacket(e, t) {
    return this.getPacket(e, t);
  }
  getNextKeyPacket(e, t) {
    return this.getNextPacket(e, t);
  }
}
const Ba = (e) => {
    const t = e.filePos,
      i = gs(e, 9),
      r = new ne(i);
    if (4095 !== r.readBits(12)) return null;
    r.skipBits(1);
    if (0 !== r.readBits(2)) return null;
    const a = r.readBits(1),
      s = r.readBits(2) + 1,
      n = r.readBits(4);
    if (15 === n) return null;
    r.skipBits(1);
    const o = r.readBits(3);
    if (0 === o)
      throw new Error(
        "ADTS frames with channel configuration 0 are not supported.",
      );
    (r.skipBits(1), r.skipBits(1), r.skipBits(1), r.skipBits(1));
    const c = r.readBits(13);
    r.skipBits(11);
    const l = r.readBits(2) + 1;
    if (1 !== l)
      throw new Error(
        "ADTS frames with more than one AAC frame are not supported.",
      );
    let h = null;
    return (
      1 === a ? (e.filePos -= 2) : (h = r.readBits(16)),
      {
        objectType: s,
        samplingFrequencyIndex: n,
        channelConfiguration: o,
        frameLength: c,
        numberOfAacFrames: l,
        crcCheck: h,
        startPos: t,
      }
    );
  },
  Ma = 1024;
class Da extends ki {
  constructor(e) {
    (super(e),
      (this.metadataPromise = null),
      (this.firstFrameHeader = null),
      (this.loadedSamples = []),
      (this.tracks = []),
      (this.readingMutex = new Ce()),
      (this.lastSampleLoaded = !1),
      (this.lastLoadedPos = 0),
      (this.nextTimestampInSamples = 0),
      (this.reader = e._reader));
  }
  async readMetadata() {
    return (this.metadataPromise ??= (async () => {
      for (; !this.firstFrameHeader && !this.lastSampleLoaded; )
        await this.advanceReader();
      (ie(this.firstFrameHeader),
        (this.tracks = [new Ji(this.input, new Oa(this))]));
    })());
  }
  async advanceReader() {
    let e = this.reader.requestSliceRange(this.lastLoadedPos, 7, 9);
    if ((e instanceof Promise && (e = await e), !e))
      return void (this.lastSampleLoaded = !0);
    const t = Ba(e);
    if (!t) return void (this.lastSampleLoaded = !0);
    if (
      null !== this.reader.fileSize &&
      t.startPos + t.frameLength > this.reader.fileSize
    )
      return void (this.lastSampleLoaded = !0);
    this.firstFrameHeader || (this.firstFrameHeader = t);
    const i = Pt[t.samplingFrequencyIndex];
    ie(void 0 !== i);
    const r = Ma / i,
      a = t.crcCheck ? 9 : 7,
      s = {
        timestamp: this.nextTimestampInSamples / i,
        duration: r,
        dataStart: t.startPos + a,
        dataSize: t.frameLength - a,
      };
    (this.loadedSamples.push(s),
      (this.nextTimestampInSamples += Ma),
      (this.lastLoadedPos = t.startPos + t.frameLength));
  }
  async getMimeType() {
    return "audio/aac";
  }
  async getTracks() {
    return (await this.readMetadata(), this.tracks);
  }
  async computeDuration() {
    await this.readMetadata();
    const e = this.tracks[0];
    return (ie(e), e.computeDuration());
  }
  async getMetadataTags() {
    return {};
  }
}
class Oa {
  constructor(e) {
    this.demuxer = e;
  }
  getId() {
    return 1;
  }
  async getFirstTimestamp() {
    return 0;
  }
  getTimeResolution() {
    return this.getSampleRate() / Ma;
  }
  async computeDuration() {
    const e = await this.getPacket(1 / 0, { metadataOnly: !0 });
    return (e?.timestamp ?? 0) + (e?.duration ?? 0);
  }
  getName() {
    return null;
  }
  getLanguageCode() {
    return Re;
  }
  getCodec() {
    return "aac";
  }
  getInternalCodecId() {
    return (
      ie(this.demuxer.firstFrameHeader),
      this.demuxer.firstFrameHeader.objectType
    );
  }
  getNumberOfChannels() {
    ie(this.demuxer.firstFrameHeader);
    const e = Et[this.demuxer.firstFrameHeader.channelConfiguration];
    return (ie(void 0 !== e), e);
  }
  getSampleRate() {
    ie(this.demuxer.firstFrameHeader);
    const e = Pt[this.demuxer.firstFrameHeader.samplingFrequencyIndex];
    return (ie(void 0 !== e), e);
  }
  getDisposition() {
    return { ...ct };
  }
  async getDecoderConfig() {
    ie(this.demuxer.firstFrameHeader);
    const e = new Uint8Array(3),
      t = new ne(e),
      {
        objectType: i,
        samplingFrequencyIndex: r,
        channelConfiguration: a,
      } = this.demuxer.firstFrameHeader;
    return (
      i > 31 ? (t.writeBits(5, 31), t.writeBits(6, i - 32)) : t.writeBits(5, i),
      t.writeBits(4, r),
      t.writeBits(4, a),
      {
        codec: `mp4a.40.${this.demuxer.firstFrameHeader.objectType}`,
        numberOfChannels: this.getNumberOfChannels(),
        sampleRate: this.getSampleRate(),
        description: e.subarray(0, Math.ceil((t.pos - 1) / 8)),
      }
    );
  }
  async getPacketAtIndex(e, t) {
    if (-1 === e) return null;
    const i = this.demuxer.loadedSamples[e];
    if (!i) return null;
    let r;
    if (t.metadataOnly) r = Ci;
    else {
      let e = this.demuxer.reader.requestSlice(i.dataStart, i.dataSize);
      if ((e instanceof Promise && (e = await e), !e)) return null;
      r = gs(e, i.dataSize);
    }
    return new Si(r, "key", i.timestamp, i.duration, e, i.dataSize);
  }
  getFirstPacket(e) {
    return this.getPacketAtIndex(0, e);
  }
  async getNextPacket(e, t) {
    const i = await this.demuxer.readingMutex.acquire();
    try {
      const i = xe(this.demuxer.loadedSamples, e.timestamp, (e) => e.timestamp);
      if (-1 === i) throw new Error("Packet was not created from this track.");
      const r = i + 1;
      for (
        ;
        r >= this.demuxer.loadedSamples.length &&
        !this.demuxer.lastSampleLoaded;

      )
        await this.demuxer.advanceReader();
      return this.getPacketAtIndex(r, t);
    } finally {
      i();
    }
  }
  async getPacket(e, t) {
    const i = await this.demuxer.readingMutex.acquire();
    try {
      for (;;) {
        const i = Pe(this.demuxer.loadedSamples, e, (e) => e.timestamp);
        if (-1 === i && this.demuxer.loadedSamples.length > 0) return null;
        if (this.demuxer.lastSampleLoaded) return this.getPacketAtIndex(i, t);
        if (i >= 0 && i + 1 < this.demuxer.loadedSamples.length)
          return this.getPacketAtIndex(i, t);
        await this.demuxer.advanceReader();
      }
    } finally {
      i();
    }
  }
  getKeyPacket(e, t) {
    return this.getPacket(e, t);
  }
  getNextKeyPacket(e, t) {
    return this.getNextPacket(e, t);
  }
}
class Ra extends ki {
  constructor(e) {
    (super(e),
      (this.loadedSamples = []),
      (this.metadataPromise = null),
      (this.track = null),
      (this.metadataTags = {}),
      (this.audioInfo = null),
      (this.lastLoadedPos = null),
      (this.blockingBit = null),
      (this.readingMutex = new Ce()),
      (this.lastSampleLoaded = !1),
      (this.reader = e._reader));
  }
  async computeDuration() {
    return (
      await this.readMetadata(),
      ie(this.track),
      this.track.computeDuration()
    );
  }
  async getMetadataTags() {
    return (await this.readMetadata(), this.metadataTags);
  }
  async getTracks() {
    return (await this.readMetadata(), ie(this.track), [this.track]);
  }
  async getMimeType() {
    return "audio/flac";
  }
  async readMetadata() {
    let e = 4;
    return (this.metadataPromise ??= (async () => {
      for (; null === this.reader.fileSize || e < this.reader.fileSize; ) {
        let t = this.reader.requestSlice(e, 4);
        if ((t instanceof Promise && (t = await t), (e += 4), null === t))
          throw new Error(
            `Metadata block at position ${e} is too small! Corrupted file.`,
          );
        ie(t);
        const i = ks(t),
          r = bs(t),
          a = !!(128 & i);
        switch (127 & i) {
          case pi.STREAMINFO: {
            let t = this.reader.requestSlice(e, r);
            if ((t instanceof Promise && (t = await t), ie(t), null === t))
              throw new Error(
                `StreamInfo block at position ${e} is too small! Corrupted file.`,
              );
            const i = gs(t, 34),
              a = new ne(i),
              s = a.readBits(16),
              n = a.readBits(16),
              o = a.readBits(24),
              c = a.readBits(24),
              l = a.readBits(20),
              h = a.readBits(3) + 1;
            a.readBits(5);
            const d = a.readBits(36);
            a.skipBits(128);
            const u = new Uint8Array(42);
            (u.set(new Uint8Array([102, 76, 97, 67]), 0),
              u.set(new Uint8Array([128, 0, 0, 34]), 4),
              u.set(i, 8),
              (this.audioInfo = {
                numberOfChannels: h,
                sampleRate: l,
                totalSamples: d,
                minimumBlockSize: s,
                maximumBlockSize: n,
                minimumFrameSize: o,
                maximumFrameSize: c,
                description: u,
              }),
              (this.track = new Ji(this.input, new za(this))));
            break;
          }
          case pi.VORBIS_COMMENT: {
            let t = this.reader.requestSlice(e, r);
            (t instanceof Promise && (t = await t),
              ie(t),
              fi(gs(t, r), this.metadataTags));
            break;
          }
          case pi.PICTURE: {
            let t = this.reader.requestSlice(e, r);
            (t instanceof Promise && (t = await t), ie(t));
            const i = Ss(t),
              a = Ss(t),
              s = de.decode(gs(t, a)),
              n = Ss(t),
              o = de.decode(gs(t, n));
            t.skip(16);
            const c = Ss(t),
              l = gs(t, c);
            ((this.metadataTags.images ??= []),
              this.metadataTags.images.push({
                data: l,
                mimeType: s,
                kind:
                  3 === i ? "coverFront" : 4 === i ? "coverBack" : "unknown",
                description: o,
              }));
            break;
          }
        }
        if (((e += r), a)) {
          this.lastLoadedPos = e;
          break;
        }
      }
    })());
  }
  async readNextFlacFrame({ startPos: e, isFirstPacket: t }) {
    ie(this.audioInfo);
    const i = this.audioInfo.maximumFrameSize + 16,
      r = await this.reader.requestSliceRange(
        e,
        this.audioInfo.minimumFrameSize,
        i,
      );
    if (!r) return null;
    const a = this.readFlacFrameHeader({ slice: r, isFirstPacket: t });
    if (!a) return null;
    for (r.filePos = e + this.audioInfo.minimumFrameSize; ; ) {
      if (r.filePos > r.end - 6)
        return {
          num: a.num,
          blockSize: a.blockSize,
          sampleRate: a.sampleRate,
          size: r.end - e,
          isLastFrame: !0,
        };
      if (255 === ks(r)) {
        const t = r.filePos;
        if (ks(r) !== (1 === this.blockingBit ? 249 : 248)) {
          r.filePos = t;
          continue;
        }
        r.skip(-2);
        const i = r.filePos - e,
          s = this.readFlacFrameHeader({ slice: r, isFirstPacket: !1 });
        if (!s) {
          r.filePos = t;
          continue;
        }
        if (0 === this.blockingBit) {
          if (s.num - a.num !== 1) {
            r.filePos = t;
            continue;
          }
        } else if (s.num - a.num !== a.blockSize) {
          r.filePos = t;
          continue;
        }
        return {
          num: a.num,
          blockSize: a.blockSize,
          sampleRate: a.sampleRate,
          size: i,
          isLastFrame: !1,
        };
      }
    }
  }
  readFlacFrameHeader({ slice: e, isFirstPacket: t }) {
    const i = e.filePos,
      r = gs(e, 4),
      a = new ne(r);
    if (32764 !== a.readBits(15)) return null;
    if (null === this.blockingBit) {
      ie(t);
      const e = a.readBits(1);
      this.blockingBit = e;
    } else if (1 === this.blockingBit) {
      ie(!t);
      if (1 !== a.readBits(1)) return null;
    } else {
      if (0 !== this.blockingBit) throw new Error("Invalid blocking bit");
      ie(!t);
      if (0 !== a.readBits(1)) return null;
    }
    const s = ((e) =>
      0 === e
        ? null
        : 1 === e
          ? 192
          : e >= 2 && e <= 5
            ? 144 * 2 ** e
            : 6 === e
              ? "uncommon-u8"
              : 7 === e
                ? "uncommon-u16"
                : e >= 8 && e <= 15
                  ? 2 ** e
                  : null)(a.readBits(4));
    if (!s) return null;
    ie(this.audioInfo);
    const n = ((e, t) => {
      switch (e) {
        case 0:
          return t;
        case 1:
          return 88200;
        case 2:
          return 176400;
        case 3:
          return 192e3;
        case 4:
          return 8e3;
        case 5:
          return 16e3;
        case 6:
          return 22050;
        case 7:
          return 24e3;
        case 8:
          return 32e3;
        case 9:
          return 44100;
        case 10:
          return 48e3;
        case 11:
          return 96e3;
        case 12:
          return "uncommon-u8";
        case 13:
          return "uncommon-u16";
        case 14:
          return "uncommon-u16-10";
        default:
          return null;
      }
    })(a.readBits(4), this.audioInfo.sampleRate);
    if (!n) return null;
    (a.readBits(4), a.readBits(3));
    if (0 !== a.readBits(1)) return null;
    const o = ((e) => {
        let t = 0;
        const i = new ne(gs(e, 1));
        for (; 1 === i.readBits(1); ) t++;
        if (0 === t) return i.readBits(7);
        const r = [],
          a = t - 1,
          s = new ne(gs(e, a)),
          n = 8 - t - 1;
        for (let o = 0; o < n; o++) r.unshift(i.readBits(1));
        for (let o = 0; o < a; o++)
          for (let e = 0; e < 8; e++) {
            const t = s.readBits(1);
            e < 2 || r.unshift(t);
          }
        return r.reduce((e, t, i) => e | (t << i), 0);
      })(e),
      c = ((e, t) =>
        "uncommon-u16" === t
          ? ws(e) + 1
          : "uncommon-u8" === t
            ? ks(e) + 1
            : "number" == typeof t
              ? t
              : (Fe(t), void ie(!1)))(e, s),
      l = ((e, t) =>
        "uncommon-u16" === t
          ? ws(e)
          : "uncommon-u16-10" === t
            ? 10 * ws(e)
            : "uncommon-u8" === t
              ? ks(e)
              : "number" == typeof t
                ? t
                : null)(e, n);
    if (null === l) return null;
    if (l !== this.audioInfo.sampleRate) return null;
    const h = e.filePos - i,
      d = ks(e);
    (e.skip(-h), e.skip(-1));
    const u = ((e) => {
      let t = 0;
      for (const i of e) {
        t ^= i;
        for (let e = 0; e < 8; e++)
          (128 & t ? (t = (t << 1) ^ 7) : (t <<= 1), (t &= 255));
      }
      return t;
    })(gs(e, h));
    return d !== u ? null : { num: o, blockSize: c, sampleRate: l };
  }
  async advanceReader() {
    (await this.readMetadata(),
      ie(null !== this.lastLoadedPos),
      ie(this.audioInfo));
    const e = this.lastLoadedPos,
      t = await this.readNextFlacFrame({
        startPos: e,
        isFirstPacket: 0 === this.loadedSamples.length,
      });
    if (!t) return void (this.lastSampleLoaded = !0);
    const i = this.loadedSamples[this.loadedSamples.length - 1],
      r = {
        blockOffset: i ? i.blockOffset + i.blockSize : 0,
        blockSize: t.blockSize,
        byteOffset: e,
        byteSize: t.size,
      };
    ((this.lastLoadedPos = this.lastLoadedPos + t.size),
      this.loadedSamples.push(r),
      t.isLastFrame && (this.lastSampleLoaded = !0));
  }
}
class za {
  constructor(e) {
    this.demuxer = e;
  }
  getId() {
    return 1;
  }
  getCodec() {
    return "flac";
  }
  getInternalCodecId() {
    return null;
  }
  getNumberOfChannels() {
    return (
      ie(this.demuxer.audioInfo),
      this.demuxer.audioInfo.numberOfChannels
    );
  }
  async computeDuration() {
    const e = await this.getPacket(1 / 0, { metadataOnly: !0 });
    return (e?.timestamp ?? 0) + (e?.duration ?? 0);
  }
  getSampleRate() {
    return (ie(this.demuxer.audioInfo), this.demuxer.audioInfo.sampleRate);
  }
  getName() {
    return null;
  }
  getLanguageCode() {
    return Re;
  }
  getTimeResolution() {
    return (ie(this.demuxer.audioInfo), this.demuxer.audioInfo.sampleRate);
  }
  getDisposition() {
    return { ...ct };
  }
  async getFirstTimestamp() {
    return 0;
  }
  async getDecoderConfig() {
    return (
      ie(this.demuxer.audioInfo),
      {
        codec: "flac",
        numberOfChannels: this.demuxer.audioInfo.numberOfChannels,
        sampleRate: this.demuxer.audioInfo.sampleRate,
        description: this.demuxer.audioInfo.description,
      }
    );
  }
  async getPacket(e, t) {
    if ((ie(this.demuxer.audioInfo), e < 0))
      throw new Error("Timestamp cannot be negative");
    const i = await this.demuxer.readingMutex.acquire();
    try {
      for (;;) {
        const i = Pe(
          this.demuxer.loadedSamples,
          e,
          (e) => e.blockOffset / this.demuxer.audioInfo.sampleRate,
        );
        if (-1 === i) {
          await this.demuxer.advanceReader();
          continue;
        }
        const r = this.demuxer.loadedSamples[i],
          a = r.blockOffset / this.demuxer.audioInfo.sampleRate;
        if (!(a + r.blockSize / this.demuxer.audioInfo.sampleRate <= e))
          return this.getPacketAtIndex(i, t);
        if (this.demuxer.lastSampleLoaded)
          return this.getPacketAtIndex(
            this.demuxer.loadedSamples.length - 1,
            t,
          );
        await this.demuxer.advanceReader();
      }
    } finally {
      i();
    }
  }
  async getNextPacket(e, t) {
    const i = await this.demuxer.readingMutex.acquire();
    try {
      const i = e.sequenceNumber + 1;
      if (
        this.demuxer.lastSampleLoaded &&
        i >= this.demuxer.loadedSamples.length
      )
        return null;
      for (
        ;
        i >= this.demuxer.loadedSamples.length &&
        !this.demuxer.lastSampleLoaded;

      )
        await this.demuxer.advanceReader();
      return this.getPacketAtIndex(i, t);
    } finally {
      i();
    }
  }
  getKeyPacket(e, t) {
    return this.getPacket(e, t);
  }
  getNextKeyPacket(e, t) {
    return this.getNextPacket(e, t);
  }
  async getPacketAtIndex(e, t) {
    const i = this.demuxer.loadedSamples[e];
    if (!i) return null;
    let r;
    if (t.metadataOnly) r = Ci;
    else {
      let e = this.demuxer.reader.requestSlice(i.byteOffset, i.byteSize);
      if ((e instanceof Promise && (e = await e), !e)) return null;
      r = gs(e, i.byteSize);
    }
    ie(this.demuxer.audioInfo);
    const a = i.blockOffset / this.demuxer.audioInfo.sampleRate,
      s = i.blockSize / this.demuxer.audioInfo.sampleRate;
    return new Si(r, "key", a, s, e, i.byteSize);
  }
  async getFirstPacket(e) {
    for (
      ;
      0 === this.demuxer.loadedSamples.length && !this.demuxer.lastSampleLoaded;

    )
      await this.demuxer.advanceReader();
    return this.getPacketAtIndex(0, e);
  }
}
class Na {}
class Ua extends Na {
  async _getMajorBrand(e) {
    let t = e._reader.requestSlice(0, 12);
    if ((t instanceof Promise && (t = await t), !t)) return null;
    t.skip(4);
    return "ftyp" !== Bs(t, 4) ? null : Bs(t, 4);
  }
  _createDemuxer(e) {
    return new or(e);
  }
}
class La extends Ua {
  async _canReadInput(e) {
    const t = await this._getMajorBrand(e);
    return !!t && "qt  " !== t;
  }
  get name() {
    return "MP4";
  }
  get mimeType() {
    return "video/mp4";
  }
}
class Va extends Ua {
  async _canReadInput(e) {
    return "qt  " === (await this._getMajorBrand(e));
  }
  get name() {
    return "QuickTime File Format";
  }
  get mimeType() {
    return "video/quicktime";
  }
}
class Wa extends Na {
  async isSupportedEBMLOfDocType(e, t) {
    let i = e._reader.requestSlice(0, Ar);
    if ((i instanceof Promise && (i = await i), !i)) return !1;
    const r = Fr(i);
    if (null === r) return !1;
    if (r < 1 || r > 8) return !1;
    if (Mr(i, r) !== Cr.EBML) return !1;
    const a = Or(i);
    if (null === a) return !1;
    let s = e._reader.requestSlice(i.filePos, a);
    if ((s instanceof Promise && (s = await s), !s)) return !1;
    const n = i.filePos;
    for (; s.filePos <= n + a - 2; ) {
      const e = Rr(s);
      if (!e) break;
      const { id: i, size: r } = e,
        a = s.filePos;
      if (null === r) return !1;
      switch (i) {
        case Cr.EBMLVersion:
          if (1 !== Mr(s, r)) return !1;
          break;
        case Cr.EBMLReadVersion:
          if (1 !== Mr(s, r)) return !1;
          break;
        case Cr.DocType:
          if (zr(s, r) !== t) return !1;
          break;
        case Cr.DocTypeVersion:
          if (Mr(s, r) > 4) return !1;
      }
      s.filePos = a + r;
    }
    return !0;
  }
  _canReadInput(e) {
    return this.isSupportedEBMLOfDocType(e, "matroska");
  }
  _createDemuxer(e) {
    return new Gr(e);
  }
  get name() {
    return "Matroska";
  }
  get mimeType() {
    return "video/x-matroska";
  }
}
class Ha extends Wa {
  _canReadInput(e) {
    return this.isSupportedEBMLOfDocType(e, "webm");
  }
  get name() {
    return "WebM";
  }
  get mimeType() {
    return "video/webm";
  }
}
class $a extends Na {
  async _canReadInput(e) {
    let t = e._reader.requestSlice(0, 10);
    if ((t instanceof Promise && (t = await t), !t)) return !1;
    let i = 0,
      r = !1;
    for (;;) {
      let t = e._reader.requestSlice(i, 10);
      if ((t instanceof Promise && (t = await t), !t)) break;
      const a = la(t);
      if (!a) break;
      ((r = !0), (i = t.filePos + a.size));
    }
    const a = await ua(e._reader, i, i + 4096);
    if (!a) return !1;
    if (r) return !0;
    i = a.startPos + a.header.totalSize;
    const s = await ua(e._reader, i, i + 4);
    if (!s) return !1;
    const n = a.header,
      o = s.header;
    return n.channel === o.channel && n.sampleRate === o.sampleRate;
  }
  _createDemuxer(e) {
    return new ma(e);
  }
  get name() {
    return "MP3";
  }
  get mimeType() {
    return "audio/mpeg";
  }
}
class ja extends Na {
  async _canReadInput(e) {
    let t = e._reader.requestSlice(0, 12);
    if ((t instanceof Promise && (t = await t), !t)) return !1;
    const i = Bs(t, 4);
    if ("RIFF" !== i && "RIFX" !== i && "RF64" !== i) return !1;
    t.skip(4);
    return "WAVE" === Bs(t, 4);
  }
  _createDemuxer(e) {
    return new _a(e);
  }
  get name() {
    return "WAVE";
  }
  get mimeType() {
    return "audio/wav";
  }
}
class qa extends Na {
  async _canReadInput(e) {
    let t = e._reader.requestSlice(0, 4);
    return (t instanceof Promise && (t = await t), !!t && "OggS" === Bs(t, 4));
  }
  _createDemuxer(e) {
    return new va(e);
  }
  get name() {
    return "Ogg";
  }
  get mimeType() {
    return "application/ogg";
  }
}
class Ka extends Na {
  async _canReadInput(e) {
    let t = e._reader.requestSlice(0, 4);
    return (t instanceof Promise && (t = await t), !!t && "fLaC" === Bs(t, 4));
  }
  get name() {
    return "FLAC";
  }
  get mimeType() {
    return "audio/flac";
  }
  _createDemuxer(e) {
    return new Ra(e);
  }
}
class Qa extends Na {
  async _canReadInput(e) {
    let t = e._reader.requestSliceRange(0, 7, 9);
    if ((t instanceof Promise && (t = await t), !t)) return !1;
    const i = Ba(t);
    if (!i) return !1;
    if (
      ((t = e._reader.requestSliceRange(i.frameLength, 7, 9)),
      t instanceof Promise && (t = await t),
      !t)
    )
      return !1;
    const r = Ba(t);
    return (
      !!r &&
      i.objectType === r.objectType &&
      i.samplingFrequencyIndex === r.samplingFrequencyIndex &&
      i.channelConfiguration === r.channelConfiguration
    );
  }
  _createDemuxer(e) {
    return new Da(e);
  }
  get name() {
    return "ADTS";
  }
  get mimeType() {
    return "audio/aac";
  }
}
const Xa = /* #__PURE__ */ new La(),
  Ga = /* #__PURE__ */ new Va(),
  Ya = /* #__PURE__ */ new Wa(),
  Ja = /* #__PURE__ */ new Ha(),
  Za = /* #__PURE__ */ new $a(),
  es = /* #__PURE__ */ new ja(),
  ts = /* #__PURE__ */ new qa(),
  is = /* #__PURE__ */ new Qa(),
  rs = [Xa, Ga, Ya, Ja, es, ts, /* #__PURE__ */ new Ka(), Za, is];
let as = class {
  constructor() {
    ((this._disposed = !1), (this._sizePromise = null), (this.onread = null));
  }
  async getSizeOrNull() {
    if (this._disposed) throw new us();
    return (this._sizePromise ??= Promise.resolve(this._retrieveSize()));
  }
  async getSize() {
    if (this._disposed) throw new us();
    const e = await this.getSizeOrNull();
    if (null === e)
      throw new Error("Cannot determine the size of an unsized source.");
    return e;
  }
};
class ss extends as {
  constructor(e, t = {}) {
    if (!(e instanceof Blob)) throw new TypeError("blob must be a Blob.");
    if (!t || "object" != typeof t)
      throw new TypeError("options must be an object.");
    if (
      void 0 !== t.maxCacheSize &&
      (!st(t.maxCacheSize) || t.maxCacheSize < 0)
    )
      throw new TypeError(
        "options.maxCacheSize, when provided, must be a non-negative number.",
      );
    (super(),
      (this._readers = new WeakMap()),
      (this._blob = e),
      (this._orchestrator = new hs({
        maxCacheSize: t.maxCacheSize ?? 8388608,
        maxWorkerCount: 4,
        runWorker: this._runWorker.bind(this),
        prefetchProfile: ls.fileSystem,
      })));
  }
  _retrieveSize() {
    const e = this._blob.size;
    return ((this._orchestrator.fileSize = e), e);
  }
  _read(e, t) {
    return this._orchestrator.read(e, t);
  }
  async _runWorker(e) {
    let t = this._readers.get(e);
    if (void 0 === t) {
      if ("stream" in this._blob && !Ke()) {
        t = this._blob.slice(e.currentPos).stream().getReader();
      } else t = null;
      this._readers.set(e, t);
    }
    for (; e.currentPos < e.targetPos && !e.aborted; )
      if (t) {
        const { done: i, value: r } = await t.read();
        if (i) {
          if ((this._orchestrator.forgetWorker(e), e.currentPos < e.targetPos))
            throw new Error(
              "Blob reader stopped unexpectedly before all requested data was read.",
            );
          break;
        }
        if (e.aborted) break;
        (this.onread?.(e.currentPos, e.currentPos + r.length),
          this._orchestrator.supplyWorkerData(e, r));
      } else {
        const t = await this._blob
          .slice(e.currentPos, e.targetPos)
          .arrayBuffer();
        if (e.aborted) break;
        (this.onread?.(e.currentPos, e.currentPos + t.byteLength),
          this._orchestrator.supplyWorkerData(e, new Uint8Array(t)));
      }
    e.running = !1;
  }
  _dispose() {
    this._orchestrator.dispose();
  }
}
const ns = 524288,
  os = (e, t, i) => {
    if (
      t instanceof Error &&
      (t.message.includes("Failed to fetch") ||
        t.message.includes("Load failed") ||
        t.message.includes("NetworkError when attempting to fetch resource"))
    ) {
      let e = null;
      try {
        "undefined" != typeof window &&
          void 0 !== window.location &&
          (e = new URL(i instanceof Request ? i.url : i, window.location.href)
            .origin);
      } catch {}
      if (
        ("undefined" == typeof navigator ||
          "boolean" != typeof navigator.onLine ||
          navigator.onLine) &&
        null !== e &&
        e !== window.location.origin
      )
        return null;
    }
    return Math.min(2 ** (e - 2), 16);
  };
class cs extends as {
  constructor(e, t = {}) {
    if (
      !(
        "string" == typeof e ||
        e instanceof URL ||
        ("undefined" != typeof Request && e instanceof Request)
      )
    )
      throw new TypeError("url must be a string, URL or Request.");
    if (!t || "object" != typeof t)
      throw new TypeError("options must be an object.");
    if (
      void 0 !== t.requestInit &&
      (!t.requestInit || "object" != typeof t.requestInit)
    )
      throw new TypeError(
        "options.requestInit, when provided, must be an object.",
      );
    if (void 0 !== t.getRetryDelay && "function" != typeof t.getRetryDelay)
      throw new TypeError(
        "options.getRetryDelay, when provided, must be a function.",
      );
    if (
      void 0 !== t.maxCacheSize &&
      (!st(t.maxCacheSize) || t.maxCacheSize < 0)
    )
      throw new TypeError(
        "options.maxCacheSize, when provided, must be a non-negative number.",
      );
    if (void 0 !== t.fetchFn && "function" != typeof t.fetchFn)
      throw new TypeError(
        "options.fetchFn, when provided, must be a function.",
      );
    (super(),
      (this._existingResponses = new WeakMap()),
      (this._url = e),
      (this._options = t),
      (this._getRetryDelay = t.getRetryDelay ?? os),
      (this._orchestrator = new hs({
        maxCacheSize: t.maxCacheSize ?? 67108864,
        maxWorkerCount: 2,
        runWorker: this._runWorker.bind(this),
        prefetchProfile: ls.network,
      })));
  }
  async _retrieveSize() {
    const e = new AbortController(),
      t = await $e(
        this._options.fetchFn ?? fetch,
        this._url,
        We(this._options.requestInit ?? {}, {
          headers: { Range: "bytes=0-" },
          signal: e.signal,
        }),
        this._getRetryDelay,
      );
    if (!t.ok)
      throw new Error(
        `Error fetching ${String(this._url)}: ${t.status} ${t.statusText}`,
      );
    let i, r;
    if (206 === t.status)
      ((r = this._getPartialLengthFromRangeResponse(t)),
        (i = this._orchestrator.createWorker(0, Math.min(r, ns))));
    else {
      const e = t.headers.get("Content-Length");
      if (!e)
        throw new Error(
          `HTTP response (status ${t.status}) must surface Content-Length header.`,
        );
      ((r = Number(e)),
        (i = this._orchestrator.createWorker(0, r)),
        (this._orchestrator.options.maxCacheSize = 1 / 0),
        console.warn(
          "HTTP server did not respond with 206 Partial Content, meaning the entire remote resource now has to be downloaded. For efficient media file streaming across a network, please make sure your server supports range requests.",
        ));
    }
    return (
      (this._orchestrator.fileSize = r),
      this._existingResponses.set(i, { response: t, abortController: e }),
      this._orchestrator.runWorker(i),
      r
    );
  }
  _read(e, t) {
    return this._orchestrator.read(e, t);
  }
  async _runWorker(e) {
    for (;;) {
      const i = this._existingResponses.get(e);
      this._existingResponses.delete(e);
      let r = i?.abortController,
        a = i?.response;
      if (
        (r ||
          ((r = new AbortController()),
          (a = await $e(
            this._options.fetchFn ?? fetch,
            this._url,
            We(this._options.requestInit ?? {}, {
              headers: { Range: `bytes=${e.currentPos}-` },
              signal: r.signal,
            }),
            this._getRetryDelay,
          ))),
        ie(a),
        !a.ok)
      )
        throw new Error(
          `Error fetching ${String(this._url)}: ${a.status} ${a.statusText}`,
        );
      if (e.currentPos > 0 && 206 !== a.status)
        throw new Error(
          "HTTP server did not respond with 206 Partial Content to a range request. To enable efficient media file streaming across a network, please make sure your server supports range requests.",
        );
      const s = this._getPartialLengthFromRangeResponse(a),
        n = e.targetPos - e.currentPos;
      if (s < n)
        throw new Error(
          `HTTP response unexpectedly too short: Needed at least ${n} bytes, got only ${s}.`,
        );
      if (!a.body)
        throw new Error(
          "Missing HTTP response body stream. The used fetch function must provide the response body as a ReadableStream.",
        );
      const o = a.body.getReader();
      for (;;) {
        if (e.currentPos >= e.targetPos || e.aborted)
          return (r.abort(), void (e.running = !1));
        let i;
        try {
          i = await o.read();
        } catch (t) {
          const e = this._getRetryDelay(1, t, this._url);
          if (null !== e) {
            (console.error(
              "Error while reading response stream. Attempting to resume.",
              t,
            ),
              await new Promise((t) => setTimeout(t, 1e3 * e)));
            break;
          }
          throw t;
        }
        if (e.aborted) break;
        const { done: a, value: s } = i;
        if (a) {
          if ((this._orchestrator.forgetWorker(e), e.currentPos < e.targetPos))
            throw new Error(
              "Response stream reader stopped unexpectedly before all requested data was read.",
            );
          return void (e.running = !1);
        }
        (this.onread?.(e.currentPos, e.currentPos + s.length),
          this._orchestrator.supplyWorkerData(e, s));
      }
      if (e.aborted) break;
    }
    e.running = !1;
  }
  _getPartialLengthFromRangeResponse(e) {
    const t = e.headers.get("Content-Range");
    if (t) {
      const e = /\/(\d+)/.exec(t);
      if (e) return Number(e[1]);
      throw new Error(`Invalid Content-Range header: ${t}`);
    }
    {
      const t = e.headers.get("Content-Length");
      if (t) return Number(t);
      throw new Error(
        "Partial HTTP response (status 206) must surface either Content-Range or Content-Length header.",
      );
    }
  }
  _dispose() {
    this._orchestrator.dispose();
  }
}
const ls = {
  fileSystem: (e, t) => {
    const i = 65536;
    return {
      start: (e = Math.floor((e - i) / i) * i),
      end: (t = Math.ceil((t + i) / i) * i),
    };
  },
  network: (e, t, i) => {
    const r = 65536;
    e = Math.max(0, Math.floor((e - r) / r) * r);
    for (const a of i) {
      const i = 8388608,
        r = Math.max((a.startPos + a.targetPos) / 2, a.targetPos - i);
      if (Je(e, t, r, a.targetPos)) {
        const e = a.targetPos - a.startPos,
          r = Math.ceil((e + 1) / i) * i,
          s = 2 ** Math.ceil(Math.log2(e + 1)),
          n = Math.min(s, r);
        t = Math.max(t, a.startPos + n);
      }
    }
    return { start: e, end: (t = Math.max(t, e + ns)) };
  },
};
class hs {
  constructor(e) {
    ((this.options = e),
      (this.fileSize = null),
      (this.nextAge = 0),
      (this.workers = []),
      (this.cache = []),
      (this.currentCacheSize = 0),
      (this.disposed = !1));
  }
  read(e, t) {
    ie(null !== this.fileSize);
    const i = this.options.prefetchProfile(e, t, this.workers),
      r = Math.max(i.start, 0),
      a = Math.min(i.end, this.fileSize);
    ie(r <= e && t <= a);
    let s = null;
    const n = Pe(this.cache, e, (e) => e.start),
      o = -1 !== n ? this.cache[n] : null;
    o &&
      o.start <= e &&
      t <= o.end &&
      ((o.age = this.nextAge++),
      (s = { bytes: o.bytes, view: o.view, offset: o.start }));
    const c = Pe(this.cache, r, (e) => e.start),
      l = s ? null : new Uint8Array(t - e);
    let h = 0,
      d = r;
    const u = [];
    if (-1 !== c) {
      for (let i = c; i < this.cache.length; i++) {
        const s = this.cache[i];
        if (s.start >= a) break;
        if (s.end <= r) continue;
        const n = Math.max(r, s.start),
          o = Math.min(a, s.end);
        if ((ie(n <= o), d < n && u.push({ start: d, end: n }), (d = o), l)) {
          const i = Math.max(e, s.start),
            r = Math.min(t, s.end);
          if (i < r) {
            const t = i - e;
            (l.set(s.bytes.subarray(i - s.start, r - s.start), t),
              t === h && (h = r - e));
          }
        }
        s.age = this.nextAge++;
      }
      d < a && u.push({ start: d, end: a });
    } else u.push({ start: r, end: a });
    if (
      (l && h >= l.length && (s = { bytes: l, view: he(l), offset: e }),
      0 === u.length)
    )
      return (ie(s), s);
    const { promise: m, resolve: p, reject: f } = Ie(),
      g = [];
    for (const k of u) {
      const i = Math.max(e, k.start),
        r = Math.min(t, k.end);
      i === k.start && r === k.end
        ? g.push(k)
        : i < r && g.push({ start: i, end: r });
    }
    for (const k of u) {
      const t = l && { start: e, bytes: l, holes: g, resolve: p, reject: f };
      let i = !1;
      for (const e of this.workers) {
        const r = 2 ** 17;
        if (Je(k.start - r, k.start, e.currentPos, e.targetPos)) {
          ((e.targetPos = Math.max(e.targetPos, k.end)),
            (i = !0),
            t && !e.pendingSlices.includes(t) && e.pendingSlices.push(t),
            e.running || this.runWorker(e));
          break;
        }
      }
      if (!i) {
        const e = this.createWorker(k.start, k.end);
        (t && (e.pendingSlices = [t]), this.runWorker(e));
      }
    }
    return (
      s || (ie(l), (s = m.then((t) => ({ bytes: t, view: he(t), offset: e })))),
      s
    );
  }
  createWorker(e, t) {
    const i = {
      startPos: e,
      currentPos: e,
      targetPos: t,
      running: !1,
      aborted: this.disposed,
      pendingSlices: [],
      age: this.nextAge++,
    };
    for (
      this.workers.push(i);
      this.workers.length > this.options.maxWorkerCount;

    ) {
      let e = 0,
        t = this.workers[0];
      for (let i = 1; i < this.workers.length; i++) {
        const r = this.workers[i];
        r.age < t.age && ((e = i), (t = r));
      }
      if (t.running && t.pendingSlices.length > 0) break;
      ((t.aborted = !0), this.workers.splice(e, 1));
    }
    return i;
  }
  runWorker(e) {
    (ie(!e.running),
      ie(e.currentPos < e.targetPos),
      (e.running = !0),
      (e.age = this.nextAge++),
      this.options.runWorker(e).catch((t) => {
        if (((e.running = !1), !(e.pendingSlices.length > 0))) throw t;
        (e.pendingSlices.forEach((e) => e.reject(t)),
          (e.pendingSlices.length = 0));
      }));
  }
  supplyWorkerData(e, t) {
    ie(!e.aborted);
    const i = e.currentPos,
      r = i + t.length;
    (this.insertIntoCache({
      start: i,
      end: r,
      bytes: t,
      view: he(t),
      age: this.nextAge++,
    }),
      (e.currentPos += t.length),
      (e.targetPos = Math.max(e.targetPos, e.currentPos)));
    for (let a = 0; a < e.pendingSlices.length; a++) {
      const s = e.pendingSlices[a],
        n = Math.max(i, s.start),
        o = Math.min(r, s.start + s.bytes.length);
      n < o && s.bytes.set(t.subarray(n - i, o - i), n - s.start);
      for (let e = 0; e < s.holes.length; e++) {
        const t = s.holes[e];
        (i <= t.start && r > t.start && (t.start = r),
          t.end <= t.start && (s.holes.splice(e, 1), e--));
      }
      0 === s.holes.length &&
        (s.resolve(s.bytes), e.pendingSlices.splice(a, 1), a--);
    }
    for (let a = 0; a < this.workers.length; a++) {
      const t = this.workers[a];
      e === t ||
        t.running ||
        (Je(i, r, t.currentPos, t.targetPos) &&
          (this.workers.splice(a, 1), a--));
    }
  }
  forgetWorker(e) {
    const t = this.workers.indexOf(e);
    (ie(-1 !== t), this.workers.splice(t, 1));
  }
  insertIntoCache(e) {
    if (0 === this.options.maxCacheSize) return;
    let t = Pe(this.cache, e.start, (e) => e.start) + 1;
    if (t > 0) {
      const i = this.cache[t - 1];
      if (i.end >= e.end) return;
      if (i.end > e.start) {
        const r = new Uint8Array(e.end - i.start);
        (r.set(i.bytes, 0),
          r.set(e.bytes, e.start - i.start),
          (this.currentCacheSize += e.end - i.end),
          (i.bytes = r),
          (i.view = he(r)),
          (i.end = e.end),
          t--,
          (e = i));
      } else
        (this.cache.splice(t, 0, e), (this.currentCacheSize += e.bytes.length));
    } else
      (this.cache.splice(t, 0, e), (this.currentCacheSize += e.bytes.length));
    for (let i = t + 1; i < this.cache.length; i++) {
      const t = this.cache[i];
      if (e.end <= t.start) break;
      if (e.end >= t.end) {
        (this.cache.splice(i, 1),
          (this.currentCacheSize -= t.bytes.length),
          i--);
        continue;
      }
      const r = new Uint8Array(t.end - e.start);
      (r.set(e.bytes, 0),
        r.set(t.bytes, t.start - e.start),
        (this.currentCacheSize -= e.end - t.start),
        (e.bytes = r),
        (e.view = he(r)),
        (e.end = t.end),
        this.cache.splice(i, 1));
      break;
    }
    for (; this.currentCacheSize > this.options.maxCacheSize; ) {
      let e = 0,
        t = this.cache[0];
      for (let i = 1; i < this.cache.length; i++) {
        const r = this.cache[i];
        r.age < t.age && ((e = i), (t = r));
      }
      if (this.currentCacheSize - t.bytes.length <= this.options.maxCacheSize)
        break;
      (this.cache.splice(e, 1), (this.currentCacheSize -= t.bytes.length));
    }
  }
  dispose() {
    for (const e of this.workers) e.aborted = !0;
    ((this.workers.length = 0), (this.cache.length = 0), (this.disposed = !0));
  }
}
at();
class ds {
  get disposed() {
    return this._disposed;
  }
  constructor(e) {
    if (
      ((this._demuxerPromise = null),
      (this._format = null),
      (this._disposed = !1),
      !e || "object" != typeof e)
    )
      throw new TypeError("options must be an object.");
    if (!Array.isArray(e.formats) || e.formats.some((e) => !(e instanceof Na)))
      throw new TypeError("options.formats must be an array of InputFormat.");
    if (!(e.source instanceof as))
      throw new TypeError("options.source must be a Source.");
    if (e.source._disposed)
      throw new Error("options.source must not be disposed.");
    ((this._formats = e.formats),
      (this._source = e.source),
      (this._reader = new ms(e.source)));
  }
  _getDemuxer() {
    return (this._demuxerPromise ??= (async () => {
      this._reader.fileSize = await this._source.getSizeOrNull();
      for (const e of this._formats) {
        if (await e._canReadInput(this))
          return ((this._format = e), e._createDemuxer(this));
      }
      throw new Error("Input has an unsupported or unrecognizable format.");
    })());
  }
  get source() {
    return this._source;
  }
  async getFormat() {
    return (await this._getDemuxer(), ie(this._format), this._format);
  }
  async computeDuration() {
    return (await this._getDemuxer()).computeDuration();
  }
  async getTracks() {
    return (await this._getDemuxer()).getTracks();
  }
  async getVideoTracks() {
    return (await this.getTracks()).filter((e) => e.isVideoTrack());
  }
  async getAudioTracks() {
    return (await this.getTracks()).filter((e) => e.isAudioTrack());
  }
  async getPrimaryVideoTrack() {
    return (await this.getTracks()).find((e) => e.isVideoTrack()) ?? null;
  }
  async getPrimaryAudioTrack() {
    return (await this.getTracks()).find((e) => e.isAudioTrack()) ?? null;
  }
  async getMimeType() {
    return (await this._getDemuxer()).getMimeType();
  }
  async getMetadataTags() {
    return (await this._getDemuxer()).getMetadataTags();
  }
  dispose() {
    this._disposed ||
      ((this._disposed = !0),
      (this._source._disposed = !0),
      this._source._dispose());
  }
  [Symbol.dispose]() {
    this.dispose();
  }
}
class us extends Error {
  constructor(e = "Input has been disposed.") {
    (super(e), (this.name = "InputDisposedError"));
  }
}
class ms {
  constructor(e) {
    this.source = e;
  }
  requestSlice(e, t) {
    if (this.source._disposed) throw new us();
    if (null !== this.fileSize && e + t > this.fileSize) return null;
    const i = e + t,
      r = this.source._read(e, i);
    return r instanceof Promise
      ? r.then((t) => (t ? new ps(t.bytes, t.view, t.offset, e, i) : null))
      : r
        ? new ps(r.bytes, r.view, r.offset, e, i)
        : null;
  }
  requestSliceRange(e, t, i) {
    if (this.source._disposed) throw new us();
    if (null !== this.fileSize)
      return this.requestSlice(e, Oe(this.fileSize - e, t, i));
    {
      const r = this.requestSlice(e, i),
        a = (r) => {
          if (r) return r;
          const a = (r) => (
              ie(null !== r),
              this.requestSlice(e, Oe(r - e, t, i))
            ),
            s = this.source._retrieveSize();
          return s instanceof Promise ? s.then(a) : a(s);
        };
      return r instanceof Promise ? r.then(a) : a(r);
    }
  }
}
class ps {
  constructor(e, t, i, r, a) {
    ((this.bytes = e),
      (this.view = t),
      (this.offset = i),
      (this.start = r),
      (this.end = a),
      (this.bufferPos = r - i));
  }
  static tempFromBytes(e) {
    return new ps(e, he(e), 0, 0, e.length);
  }
  get length() {
    return this.end - this.start;
  }
  get filePos() {
    return this.offset + this.bufferPos;
  }
  set filePos(e) {
    this.bufferPos = e - this.offset;
  }
  get remainingLength() {
    return Math.max(this.end - this.filePos, 0);
  }
  skip(e) {
    this.bufferPos += e;
  }
  slice(e, t = this.end - e) {
    if (e < this.start || e + t > this.end)
      throw new RangeError("Slicing outside of original slice.");
    return new ps(this.bytes, this.view, this.offset, e, e + t);
  }
}
const fs = (e, t) => {
    if (e.filePos < e.start || e.filePos + t > e.end)
      throw new RangeError(
        `Tried reading [${e.filePos}, ${e.filePos + t}), but slice is [${e.start}, ${e.end}). This is likely an internal error, please report it alongside the file that caused it.`,
      );
  },
  gs = (e, t) => {
    fs(e, t);
    const i = e.bytes.subarray(e.bufferPos, e.bufferPos + t);
    return ((e.bufferPos += t), i);
  },
  ks = (e) => (fs(e, 1), e.view.getUint8(e.bufferPos++)),
  ys = (e, t) => {
    fs(e, 2);
    const i = e.view.getUint16(e.bufferPos, t);
    return ((e.bufferPos += 2), i);
  },
  ws = (e) => {
    fs(e, 2);
    const t = e.view.getUint16(e.bufferPos, !1);
    return ((e.bufferPos += 2), t);
  },
  bs = (e) => {
    fs(e, 3);
    const t = Be(e.view, e.bufferPos, !1);
    return ((e.bufferPos += 3), t);
  },
  Ts = (e) => {
    fs(e, 2);
    const t = e.view.getInt16(e.bufferPos, !1);
    return ((e.bufferPos += 2), t);
  },
  Cs = (e, t) => {
    fs(e, 4);
    const i = e.view.getUint32(e.bufferPos, t);
    return ((e.bufferPos += 4), i);
  },
  Ss = (e) => {
    fs(e, 4);
    const t = e.view.getUint32(e.bufferPos, !1);
    return ((e.bufferPos += 4), t);
  },
  vs = (e) => {
    fs(e, 4);
    const t = e.view.getUint32(e.bufferPos, !0);
    return ((e.bufferPos += 4), t);
  },
  xs = (e) => {
    fs(e, 4);
    const t = e.view.getInt32(e.bufferPos, !1);
    return ((e.bufferPos += 4), t);
  },
  Ps = (e, t) => {
    let i, r;
    return (
      t
        ? ((i = Cs(e, !0)), (r = Cs(e, !0)))
        : ((r = Cs(e, !1)), (i = Cs(e, !1))),
      4294967296 * r + i
    );
  },
  Es = (e) => 4294967296 * Ss(e) + Ss(e),
  Is = (e) => 4294967296 * xs(e) + Ss(e),
  _s = (e) => {
    const t = vs(e),
      i = ((e) => {
        fs(e, 4);
        const t = e.view.getInt32(e.bufferPos, !0);
        return ((e.bufferPos += 4), t);
      })(e);
    return 4294967296 * i + t;
  },
  As = (e) => {
    fs(e, 4);
    const t = e.view.getFloat32(e.bufferPos, !1);
    return ((e.bufferPos += 4), t);
  },
  Fs = (e) => {
    fs(e, 8);
    const t = e.view.getFloat64(e.bufferPos, !1);
    return ((e.bufferPos += 8), t);
  },
  Bs = (e, t) => {
    fs(e, t);
    let i = "";
    for (let r = 0; r < t; r++)
      i += String.fromCharCode(e.bytes[e.bufferPos++]);
    return i;
  },
  Ms = /<(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})>/g,
  Ds = /(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})/,
  Os = (e) => {
    const t = Math.floor(e / 36e5),
      i = Math.floor((e % 36e5) / 6e4),
      r = Math.floor((e % 6e4) / 1e3),
      a = e % 1e3;
    return (
      t.toString().padStart(2, "0") +
      ":" +
      i.toString().padStart(2, "0") +
      ":" +
      r.toString().padStart(2, "0") +
      "." +
      a.toString().padStart(3, "0")
    );
  };
class Rs {
  constructor(e) {
    ((this.writer = e),
      (this.helper = new Uint8Array(8)),
      (this.helperView = new DataView(this.helper.buffer)),
      (this.offsets = new WeakMap()));
  }
  writeU32(e) {
    (this.helperView.setUint32(0, e, !1),
      this.writer.write(this.helper.subarray(0, 4)));
  }
  writeU64(e) {
    (this.helperView.setUint32(0, Math.floor(e / 2 ** 32), !1),
      this.helperView.setUint32(4, e, !1),
      this.writer.write(this.helper.subarray(0, 8)));
  }
  writeAscii(e) {
    for (let t = 0; t < e.length; t++)
      (this.helperView.setUint8(t % 8, e.charCodeAt(t)),
        t % 8 == 7 && this.writer.write(this.helper));
    e.length % 8 != 0 &&
      this.writer.write(this.helper.subarray(0, e.length % 8));
  }
  writeBox(e) {
    if ((this.offsets.set(e, this.writer.getPos()), e.contents && !e.children))
      (this.writeBoxHeader(e, e.size ?? e.contents.byteLength + 8),
        this.writer.write(e.contents));
    else {
      const t = this.writer.getPos();
      if (
        (this.writeBoxHeader(e, 0),
        e.contents && this.writer.write(e.contents),
        e.children)
      )
        for (const a of e.children) a && this.writeBox(a);
      const i = this.writer.getPos(),
        r = e.size ?? i - t;
      (this.writer.seek(t), this.writeBoxHeader(e, r), this.writer.seek(i));
    }
  }
  writeBoxHeader(e, t) {
    (this.writeU32(e.largeSize ? 1 : t),
      this.writeAscii(e.type),
      e.largeSize && this.writeU64(t));
  }
  measureBoxHeader(e) {
    return 8 + (e.largeSize ? 8 : 0);
  }
  patchBox(e) {
    const t = this.offsets.get(e);
    ie(void 0 !== t);
    const i = this.writer.getPos();
    (this.writer.seek(t), this.writeBox(e), this.writer.seek(i));
  }
  measureBox(e) {
    if (e.contents && !e.children) {
      return this.measureBoxHeader(e) + e.contents.byteLength;
    }
    {
      let t = this.measureBoxHeader(e);
      if ((e.contents && (t += e.contents.byteLength), e.children))
        for (const i of e.children) i && (t += this.measureBox(i));
      return t;
    }
  }
}
const zs = /* #__PURE__ */ new Uint8Array(8),
  Ns = /* #__PURE__ */ new DataView(zs.buffer),
  Us = (e) => [((e % 256) + 256) % 256],
  Ls = (e) => (Ns.setUint16(0, e, !1), [zs[0], zs[1]]),
  Vs = (e) => (Ns.setInt16(0, e, !1), [zs[0], zs[1]]),
  Ws = (e) => (Ns.setUint32(0, e, !1), [zs[1], zs[2], zs[3]]),
  Hs = (e) => (Ns.setUint32(0, e, !1), [zs[0], zs[1], zs[2], zs[3]]),
  $s = (e) => (Ns.setInt32(0, e, !1), [zs[0], zs[1], zs[2], zs[3]]),
  js = (e) => (
    Ns.setUint32(0, Math.floor(e / 2 ** 32), !1),
    Ns.setUint32(4, e, !1),
    [zs[0], zs[1], zs[2], zs[3], zs[4], zs[5], zs[6], zs[7]]
  ),
  qs = (e) => (Ns.setInt16(0, 256 * e, !1), [zs[0], zs[1]]),
  Ks = (e) => (Ns.setInt32(0, 65536 * e, !1), [zs[0], zs[1], zs[2], zs[3]]),
  Qs = (e) => (Ns.setInt32(0, 2 ** 30 * e, !1), [zs[0], zs[1], zs[2], zs[3]]),
  Xs = (e, t) => {
    const i = [];
    let r = e;
    do {
      let e = 127 & r;
      ((r >>= 7), i.length > 0 && (e |= 128), i.push(e));
    } while (r > 0 || t);
    return i.reverse();
  },
  Gs = (e, t = !1) => {
    const i = Array(e.length)
      .fill(null)
      .map((t, i) => e.charCodeAt(i));
    return (t && i.push(0), i);
  },
  Ys = (e) => {
    let t = null;
    for (const i of e) (!t || i.timestamp > t.timestamp) && (t = i);
    return t;
  },
  Js = (e) => {
    const t = e * (Math.PI / 180),
      i = Math.round(Math.cos(t)),
      r = Math.round(Math.sin(t));
    return [i, r, 0, -r, i, 0, 0, 0, 1];
  },
  Zs = /* #__PURE__ */ Js(0),
  en = (e) => [
    Ks(e[0]),
    Ks(e[1]),
    Qs(e[2]),
    Ks(e[3]),
    Ks(e[4]),
    Qs(e[5]),
    Ks(e[6]),
    Ks(e[7]),
    Qs(e[8]),
  ],
  tn = (e, t, i) => ({
    type: e,
    contents: t && new Uint8Array(t.flat(10)),
    children: i,
  }),
  rn = (e, t, i, r, a) => tn(e, [Us(t), Ws(i), r ?? []], a),
  an = (e) => ({ type: "mdat", largeSize: e }),
  sn = (e) =>
    tn("moov", void 0, [
      nn(e.creationTime, e.trackDatas),
      ...e.trackDatas.map((t) => on(t, e.creationTime)),
      e.isFragmented ? Ln(e.trackDatas) : null,
      eo(e),
    ]),
  nn = (e, t) => {
    const i = Po(
        Math.max(
          0,
          ...t
            .filter((e) => e.samples.length > 0)
            .map((e) => {
              const t = Ys(e.samples);
              return t.timestamp + t.duration;
            }),
        ),
        vo,
      ),
      r = Math.max(0, ...t.map((e) => e.track.id)) + 1,
      a = !se(e) || !se(i),
      s = a ? js : Hs;
    return rn("mvhd", +a, 0, [
      s(e),
      s(e),
      Hs(vo),
      s(i),
      Ks(1),
      qs(1),
      Array(10).fill(0),
      en(Zs),
      Array(24).fill(0),
      Hs(r),
    ]);
  },
  on = (e, t) => {
    const i = xo(e);
    return tn("trak", void 0, [
      cn(e, t),
      ln(e, t),
      void 0 !== i.name
        ? tn("udta", void 0, [tn("name", [...ue.encode(i.name)])])
        : null,
    ]);
  },
  cn = (e, t) => {
    const i = Ys(e.samples),
      r = Po(i ? i.timestamp + i.duration : 0, vo),
      a = !se(t) || !se(r),
      s = a ? js : Hs;
    let n;
    if ("video" === e.type) {
      const t = e.track.metadata.rotation;
      n = Js(t ?? 0);
    } else n = Zs;
    let o = 2;
    return (
      !1 !== e.track.metadata.disposition?.default && (o |= 1),
      rn("tkhd", +a, o, [
        s(t),
        s(t),
        Hs(e.track.id),
        Hs(0),
        s(r),
        Array(8).fill(0),
        Ls(0),
        Ls(e.track.id),
        qs("audio" === e.type ? 1 : 0),
        Ls(0),
        en(n),
        Ks("video" === e.type ? e.info.width : 0),
        Ks("video" === e.type ? e.info.height : 0),
      ])
    );
  },
  ln = (e, t) =>
    tn("mdia", void 0, [hn(e, t), mn(!0, dn[e.type], un[e.type]), pn(e)]),
  hn = (e, t) => {
    const i = Ys(e.samples),
      r = Po(i ? i.timestamp + i.duration : 0, e.timescale),
      a = !se(t) || !se(r),
      s = a ? js : Hs;
    return rn("mdhd", +a, 0, [
      s(t),
      s(t),
      Hs(e.timescale),
      s(r),
      Ls(fo(e.track.metadata.languageCode ?? Re)),
      Ls(0),
    ]);
  },
  dn = { video: "vide", audio: "soun", subtitle: "text" },
  un = {
    video: "MediabunnyVideoHandler",
    audio: "MediabunnySoundHandler",
    subtitle: "MediabunnyTextHandler",
  },
  mn = (e, t, i, r = "\0\0\0\0") =>
    rn("hdlr", 0, 0, [
      e ? Gs("mhlr") : Hs(0),
      Gs(t),
      Gs(r),
      Hs(0),
      Hs(0),
      Gs(i, !0),
    ]),
  pn = (e) => tn("minf", void 0, [fn[e.type](), gn(), wn(e)]),
  fn = {
    video: () => rn("vmhd", 0, 1, [Ls(0), Ls(0), Ls(0), Ls(0)]),
    audio: () => rn("smhd", 0, 0, [Ls(0), Ls(0)]),
    subtitle: () => rn("nmhd", 0, 0),
  },
  gn = () => tn("dinf", void 0, [kn()]),
  kn = () => rn("dref", 0, 0, [Hs(1)], [yn()]),
  yn = () => rn("url ", 0, 1),
  wn = (e) => {
    const t =
      e.compositionTimeOffsetTable.length > 1 ||
      e.compositionTimeOffsetTable.some(
        (e) => 0 !== e.sampleCompositionTimeOffset,
      );
    return tn("stbl", void 0, [
      bn(e),
      Mn(e),
      t ? Nn(e) : null,
      t ? Un(e) : null,
      On(e),
      Rn(e),
      zn(e),
      Dn(e),
    ]);
  },
  bn = (e) => {
    let t;
    if ("video" === e.type)
      t = Tn(co(e.track.source._codec, e.info.decoderConfig.codec), e);
    else if ("audio" === e.type) {
      const i = ho(e.track.source._codec, e.muxer.isQuickTime);
      (ie(i), (t = vn(i, e)));
    } else "subtitle" === e.type && (t = Bn(mo[e.track.source._codec], e));
    return (ie(t), rn("stsd", 0, 0, [Hs(1)], [t]));
  },
  Tn = (e, t) =>
    tn(
      e,
      [
        Array(6).fill(0),
        Ls(1),
        Ls(0),
        Ls(0),
        Array(12).fill(0),
        Ls(t.info.width),
        Ls(t.info.height),
        Hs(4718592),
        Hs(4718592),
        Hs(0),
        Ls(1),
        Array(32).fill(0),
        Ls(24),
        Vs(65535),
      ],
      [
        lo[t.track.source._codec](t),
        be(t.info.decoderConfig.colorSpace) ? Cn(t) : null,
      ],
    ),
  Cn = (e) =>
    tn("colr", [
      Gs("nclx"),
      Ls(pe[e.info.decoderConfig.colorSpace.primaries]),
      Ls(ge[e.info.decoderConfig.colorSpace.transfer]),
      Ls(ye[e.info.decoderConfig.colorSpace.matrix]),
      Us((e.info.decoderConfig.colorSpace.fullRange ? 1 : 0) << 7),
    ]),
  Sn = (e) => {
    if (!e.info.decoderConfig) return null;
    const t = e.info.decoderConfig,
      i = t.codec.split("."),
      r = Number(i[1]),
      a = Number(i[2]),
      s =
        (Number(i[3]) << 4) +
        ((i[4] ? Number(i[4]) : 1) << 1) +
        (i[8] ? Number(i[8]) : Number(t.colorSpace?.fullRange ?? 0)),
      n = i[5]
        ? Number(i[5])
        : t.colorSpace?.primaries
          ? pe[t.colorSpace.primaries]
          : 2,
      o = i[6]
        ? Number(i[6])
        : t.colorSpace?.transfer
          ? ge[t.colorSpace.transfer]
          : 2,
      c = i[7]
        ? Number(i[7])
        : t.colorSpace?.matrix
          ? ye[t.colorSpace.matrix]
          : 2;
    return rn("vpcC", 1, 0, [Us(r), Us(a), Us(s), Us(n), Us(o), Us(c), Ls(0)]);
  },
  vn = (e, t) => {
    let i,
      r = 0,
      a = 16;
    if (ht.includes(t.track.source._codec)) {
      const e = t.track.source._codec,
        { sampleSize: i } = Ft(e);
      ((a = 8 * i), a > 16 && (r = 1));
    }
    return (
      (i =
        0 === r
          ? [
              Array(6).fill(0),
              Ls(1),
              Ls(r),
              Ls(0),
              Hs(0),
              Ls(t.info.numberOfChannels),
              Ls(a),
              Ls(0),
              Ls(0),
              Ls(t.info.sampleRate < 65536 ? t.info.sampleRate : 0),
              Ls(0),
            ]
          : [
              Array(6).fill(0),
              Ls(1),
              Ls(r),
              Ls(0),
              Hs(0),
              Ls(t.info.numberOfChannels),
              Ls(Math.min(a, 16)),
              Ls(0),
              Ls(0),
              Ls(t.info.sampleRate < 65536 ? t.info.sampleRate : 0),
              Ls(0),
              Hs(1),
              Hs(a / 8),
              Hs((t.info.numberOfChannels * a) / 8),
              Hs(2),
            ]),
      tn(e, i, [uo(t.track.source._codec, t.muxer.isQuickTime)?.(t) ?? null])
    );
  },
  xn = (e) => {
    let t;
    switch (e.track.source._codec) {
      case "aac":
        t = 64;
        break;
      case "mp3":
        t = 107;
        break;
      case "vorbis":
        t = 221;
        break;
      default:
        throw new Error(`Unhandled audio codec: ${e.track.source._codec}`);
    }
    let i = [...Us(t), ...Us(21), ...Ws(0), ...Hs(0), ...Hs(0)];
    if (e.info.decoderConfig.description) {
      const t = le(e.info.decoderConfig.description);
      i = [...i, ...Us(5), ...Xs(t.byteLength), ...t];
    }
    return (
      (i = [
        ...Ls(1),
        ...Us(0),
        ...Us(4),
        ...Xs(i.length),
        ...i,
        ...Us(6),
        ...Us(1),
        ...Us(2),
      ]),
      (i = [...Us(3), ...Xs(i.length), ...i]),
      rn("esds", 0, 0, i)
    );
  },
  Pn = (e) => tn("wave", void 0, [En(e), In(e), tn("\0\0\0\0")]),
  En = (e) => tn("frma", [Gs(ho(e.track.source._codec, e.muxer.isQuickTime))]),
  In = (e) => {
    const { littleEndian: t } = Ft(e.track.source._codec);
    return tn("enda", [Ls(+t)]);
  },
  _n = (e) => {
    let t = e.info.numberOfChannels,
      i = 3840,
      r = e.info.sampleRate,
      a = 0,
      s = 0,
      n = new Uint8Array(0);
    const o = e.info.decoderConfig?.description;
    if (o) {
      ie(o.byteLength >= 18);
      const e = le(o),
        c = hi(e);
      ((t = c.outputChannelCount),
        (i = c.preSkip),
        (r = c.inputSampleRate),
        (a = c.outputGain),
        (s = c.channelMappingFamily),
        c.channelMappingTable && (n = c.channelMappingTable));
    }
    return tn("dOps", [Us(0), Us(t), Ls(i), Hs(r), Vs(a), Us(s), ...n]);
  },
  An = (e) => {
    const t = e.info.decoderConfig?.description;
    ie(t);
    const i = le(t);
    return rn("dfLa", 0, 0, [...i.subarray(4)]);
  },
  Fn = (e) => {
    const { littleEndian: t, sampleSize: i } = Ft(e.track.source._codec);
    return rn("pcmC", 0, 0, [Us(+t), Us(8 * i)]);
  },
  Bn = (e, t) =>
    tn(e, [Array(6).fill(0), Ls(1)], [po[t.track.source._codec](t)]),
  Mn = (e) =>
    rn("stts", 0, 0, [
      Hs(e.timeToSampleTable.length),
      e.timeToSampleTable.map((e) => [Hs(e.sampleCount), Hs(e.sampleDelta)]),
    ]),
  Dn = (e) => {
    if (e.samples.every((e) => "key" === e.type)) return null;
    const t = [...e.samples.entries()].filter(([, e]) => "key" === e.type);
    return rn("stss", 0, 0, [Hs(t.length), t.map(([e]) => Hs(e + 1))]);
  },
  On = (e) =>
    rn("stsc", 0, 0, [
      Hs(e.compactlyCodedChunkTable.length),
      e.compactlyCodedChunkTable.map((e) => [
        Hs(e.firstChunk),
        Hs(e.samplesPerChunk),
        Hs(1),
      ]),
    ]),
  Rn = (e) => {
    if ("audio" === e.type && e.info.requiresPcmTransformation) {
      const { sampleSize: t } = Ft(e.track.source._codec);
      return rn("stsz", 0, 0, [
        Hs(t * e.info.numberOfChannels),
        Hs(e.samples.reduce((t, i) => t + Po(i.duration, e.timescale), 0)),
      ]);
    }
    return rn("stsz", 0, 0, [
      Hs(0),
      Hs(e.samples.length),
      e.samples.map((e) => Hs(e.size)),
    ]);
  },
  zn = (e) =>
    e.finalizedChunks.length > 0 && ae(e.finalizedChunks).offset >= 2 ** 32
      ? rn("co64", 0, 0, [
          Hs(e.finalizedChunks.length),
          e.finalizedChunks.map((e) => js(e.offset)),
        ])
      : rn("stco", 0, 0, [
          Hs(e.finalizedChunks.length),
          e.finalizedChunks.map((e) => Hs(e.offset)),
        ]),
  Nn = (e) =>
    rn("ctts", 1, 0, [
      Hs(e.compositionTimeOffsetTable.length),
      e.compositionTimeOffsetTable.map((e) => [
        Hs(e.sampleCount),
        $s(e.sampleCompositionTimeOffset),
      ]),
    ]),
  Un = (e) => {
    let t = 1 / 0,
      i = -1 / 0,
      r = 1 / 0,
      a = -1 / 0;
    (ie(e.compositionTimeOffsetTable.length > 0), ie(e.samples.length > 0));
    for (let n = 0; n < e.compositionTimeOffsetTable.length; n++) {
      const r = e.compositionTimeOffsetTable[n];
      ((t = Math.min(t, r.sampleCompositionTimeOffset)),
        (i = Math.max(i, r.sampleCompositionTimeOffset)));
    }
    for (let n = 0; n < e.samples.length; n++) {
      const t = e.samples[n];
      ((r = Math.min(r, Po(t.timestamp, e.timescale))),
        (a = Math.max(a, Po(t.timestamp + t.duration, e.timescale))));
    }
    const s = Math.max(-t, 0);
    return a >= 2 ** 31
      ? null
      : rn("cslg", 0, 0, [$s(s), $s(t), $s(i), $s(r), $s(a)]);
  },
  Ln = (e) => tn("mvex", void 0, e.map(Vn)),
  Vn = (e) => rn("trex", 0, 0, [Hs(e.track.id), Hs(1), Hs(0), Hs(0), Hs(0)]),
  Wn = (e, t) => tn("moof", void 0, [Hn(e), ...t.map(jn)]),
  Hn = (e) => rn("mfhd", 0, 0, [Hs(e)]),
  $n = (e) => {
    let t = 0,
      i = 0;
    const r = "delta" === e.type;
    return ((i |= +r), (t |= r ? 1 : 2), (t << 24) | (i << 16));
  },
  jn = (e) => tn("traf", void 0, [qn(e), Kn(e), Qn(e)]),
  qn = (e) => {
    ie(e.currentChunk);
    let t = 0;
    ((t |= 8), (t |= 16), (t |= 32), (t |= 131072));
    const i = e.currentChunk.samples[1] ?? e.currentChunk.samples[0],
      r = {
        duration: i.timescaleUnitsToNextSample,
        size: i.size,
        flags: $n(i),
      };
    return rn("tfhd", 0, 131128, [
      Hs(e.track.id),
      Hs(r.duration),
      Hs(r.size),
      Hs(r.flags),
    ]);
  },
  Kn = (e) => (
    ie(e.currentChunk),
    rn("tfdt", 1, 0, [js(Po(e.currentChunk.startTimestamp, e.timescale))])
  ),
  Qn = (e) => {
    ie(e.currentChunk);
    const t = e.currentChunk.samples.map((e) => e.timescaleUnitsToNextSample),
      i = e.currentChunk.samples.map((e) => e.size),
      r = e.currentChunk.samples.map($n),
      a = e.currentChunk.samples.map((t) =>
        Po(t.timestamp - t.decodeTimestamp, e.timescale),
      ),
      s = new Set(t),
      n = new Set(i),
      o = new Set(r),
      c = new Set(a),
      l = 2 === o.size && r[0] !== r[1],
      h = s.size > 1,
      d = n.size > 1,
      u = !l && o.size > 1,
      m = c.size > 1 || [...c].some((e) => 0 !== e);
    let p = 0;
    return (
      (p |= 1),
      (p |= 4 * +l),
      (p |= 256 * +h),
      (p |= 512 * +d),
      (p |= 1024 * +u),
      (p |= 2048 * +m),
      rn("trun", 1, p, [
        Hs(e.currentChunk.samples.length),
        Hs(e.currentChunk.offset - e.currentChunk.moofOffset || 0),
        l ? Hs(r[0]) : [],
        e.currentChunk.samples.map((e, s) => [
          h ? Hs(t[s]) : [],
          d ? Hs(i[s]) : [],
          u ? Hs(r[s]) : [],
          m ? $s(a[s]) : [],
        ]),
      ])
    );
  },
  Xn = (e, t) =>
    rn("tfra", 1, 0, [
      Hs(e.track.id),
      Hs(63),
      Hs(e.finalizedChunks.length),
      e.finalizedChunks.map((i) => [
        js(Po(i.samples[0].timestamp, e.timescale)),
        js(i.moofOffset),
        Hs(t + 1),
        Hs(1),
        Hs(1),
      ]),
    ]),
  Gn = () => rn("mfro", 0, 0, [Hs(0)]),
  Yn = () => tn("vtte"),
  Jn = (e, t, i, r, a) =>
    tn("vttc", void 0, [
      null !== a ? tn("vsid", [$s(a)]) : null,
      null !== i ? tn("iden", [...ue.encode(i)]) : null,
      null !== t ? tn("ctim", [...ue.encode(Os(t))]) : null,
      null !== r ? tn("sttg", [...ue.encode(r)]) : null,
      tn("payl", [...ue.encode(e)]),
    ]),
  Zn = (e) => tn("vtta", [...ue.encode(e)]),
  eo = (e) => {
    const t = [],
      i = e.format._options.metadataFormat ?? "auto",
      r = e.output._metadataTags;
    if ("mdir" === i || ("auto" === i && !e.isQuickTime)) {
      const e = so(r);
      e && t.push(e);
    } else if ("mdta" === i) {
      const e = no(r);
      e && t.push(e);
    } else
      ("udta" === i || ("auto" === i && e.isQuickTime)) &&
        to(t, e.output._metadataTags);
    return 0 === t.length ? null : tn("udta", void 0, t);
  },
  to = (e, t) => {
    for (const { key: i, value: r } of Ze(t))
      switch (i) {
        case "title":
          e.push(io("©nam", r));
          break;
        case "description":
          e.push(io("©des", r));
          break;
        case "artist":
          e.push(io("©ART", r));
          break;
        case "album":
          e.push(io("©alb", r));
          break;
        case "albumArtist":
          e.push(io("albr", r));
          break;
        case "genre":
          e.push(io("©gen", r));
          break;
        case "date":
          e.push(io("©day", r.toISOString().slice(0, 10)));
          break;
        case "comment":
          e.push(io("©cmt", r));
          break;
        case "lyrics":
          e.push(io("©lyr", r));
          break;
        case "raw":
        case "discNumber":
        case "discsTotal":
        case "trackNumber":
        case "tracksTotal":
        case "images":
          break;
        default:
          Fe(i);
      }
    if (t.raw)
      for (const i in t.raw) {
        const r = t.raw[i];
        null == r ||
          4 !== i.length ||
          e.some((e) => e.type === i) ||
          ("string" == typeof r
            ? e.push(io(i, r))
            : r instanceof Uint8Array && e.push(tn(i, Array.from(r))));
      }
  },
  io = (e, t) => {
    const i = ue.encode(t);
    return tn(e, [Ls(i.length), Ls(fo("und")), Array.from(i)]);
  },
  ro = { "image/jpeg": 13, "image/png": 14, "image/bmp": 27 },
  ao = (e, t) => {
    const i = [];
    for (const { key: r, value: a } of Ze(e))
      switch (r) {
        case "title":
          i.push({ key: t ? "title" : "©nam", value: oo(a) });
          break;
        case "description":
          i.push({ key: t ? "description" : "©des", value: oo(a) });
          break;
        case "artist":
          i.push({ key: t ? "artist" : "©ART", value: oo(a) });
          break;
        case "album":
          i.push({ key: t ? "album" : "©alb", value: oo(a) });
          break;
        case "albumArtist":
          i.push({ key: t ? "album_artist" : "aART", value: oo(a) });
          break;
        case "comment":
          i.push({ key: t ? "comment" : "©cmt", value: oo(a) });
          break;
        case "genre":
          i.push({ key: t ? "genre" : "©gen", value: oo(a) });
          break;
        case "lyrics":
          i.push({ key: t ? "lyrics" : "©lyr", value: oo(a) });
          break;
        case "date":
          i.push({
            key: t ? "date" : "©day",
            value: oo(a.toISOString().slice(0, 10)),
          });
          break;
        case "images":
          for (const e of a)
            "coverFront" === e.kind &&
              i.push({
                key: "covr",
                value: tn("data", [
                  Hs(ro[e.mimeType] ?? 0),
                  Hs(0),
                  Array.from(e.data),
                ]),
              });
          break;
        case "trackNumber":
          if (t) {
            const t =
              void 0 !== e.tracksTotal ? `${a}/${e.tracksTotal}` : a.toString();
            i.push({ key: "track", value: oo(t) });
          } else
            i.push({
              key: "trkn",
              value: tn("data", [
                Hs(0),
                Hs(0),
                Ls(0),
                Ls(a),
                Ls(e.tracksTotal ?? 0),
                Ls(0),
              ]),
            });
          break;
        case "discNumber":
          t ||
            i.push({
              key: "disc",
              value: tn("data", [
                Hs(0),
                Hs(0),
                Ls(0),
                Ls(a),
                Ls(e.discsTotal ?? 0),
                Ls(0),
              ]),
            });
          break;
        case "tracksTotal":
        case "discsTotal":
        case "raw":
          break;
        default:
          Fe(r);
      }
    if (e.raw)
      for (const r in e.raw) {
        const a = e.raw[r];
        null == a ||
          (!t && 4 !== r.length) ||
          i.some((e) => e.key === r) ||
          ("string" == typeof a
            ? i.push({ key: r, value: oo(a) })
            : a instanceof Uint8Array
              ? i.push({
                  key: r,
                  value: tn("data", [Hs(0), Hs(0), Array.from(a)]),
                })
              : a instanceof nt &&
                i.push({
                  key: r,
                  value: tn("data", [
                    Hs(ro[a.mimeType] ?? 0),
                    Hs(0),
                    Array.from(a.data),
                  ]),
                }));
      }
    return i;
  },
  so = (e) => {
    const t = ao(e, !1);
    return 0 === t.length
      ? null
      : rn("meta", 0, 0, void 0, [
          mn(!1, "mdir", "", "appl"),
          tn(
            "ilst",
            void 0,
            t.map((e) => tn(e.key, void 0, [e.value])),
          ),
        ]);
  },
  no = (e) => {
    const t = ao(e, !0);
    return 0 === t.length
      ? null
      : tn("meta", void 0, [
          mn(!1, "mdta", ""),
          rn(
            "keys",
            0,
            0,
            [Hs(t.length)],
            t.map((e) => tn("mdta", [...ue.encode(e.key)])),
          ),
          tn(
            "ilst",
            void 0,
            t.map((e, t) => {
              const i = String.fromCharCode(...Hs(t + 1));
              return tn(i, void 0, [e.value]);
            }),
          ),
        ]);
  },
  oo = (e) => tn("data", [Hs(1), Hs(0), ...ue.encode(e)]),
  co = (e, t) => {
    switch (e) {
      case "avc":
        return t.startsWith("avc3") ? "avc3" : "avc1";
      case "hevc":
        return "hvc1";
      case "vp8":
        return "vp08";
      case "vp9":
        return "vp09";
      case "av1":
        return "av01";
    }
  },
  lo = {
    avc: (e) =>
      e.info.decoderConfig &&
      tn("avcC", [...le(e.info.decoderConfig.description)]),
    hevc: (e) =>
      e.info.decoderConfig &&
      tn("hvcC", [...le(e.info.decoderConfig.description)]),
    vp8: Sn,
    vp9: Sn,
    av1: (e) => tn("av1C", Ct(e.info.decoderConfig.codec)),
  },
  ho = (e, t) => {
    switch (e) {
      case "aac":
      case "mp3":
      case "vorbis":
        return "mp4a";
      case "opus":
        return "Opus";
      case "flac":
        return "fLaC";
      case "ulaw":
        return "ulaw";
      case "alaw":
        return "alaw";
      case "pcm-u8":
        return "raw ";
      case "pcm-s8":
        return "sowt";
    }
    if (t)
      switch (e) {
        case "pcm-s16":
          return "sowt";
        case "pcm-s16be":
          return "twos";
        case "pcm-s24":
        case "pcm-s24be":
          return "in24";
        case "pcm-s32":
        case "pcm-s32be":
          return "in32";
        case "pcm-f32":
        case "pcm-f32be":
          return "fl32";
        case "pcm-f64":
        case "pcm-f64be":
          return "fl64";
      }
    else
      switch (e) {
        case "pcm-s16":
        case "pcm-s16be":
        case "pcm-s24":
        case "pcm-s24be":
        case "pcm-s32":
        case "pcm-s32be":
          return "ipcm";
        case "pcm-f32":
        case "pcm-f32be":
        case "pcm-f64":
        case "pcm-f64be":
          return "fpcm";
      }
  },
  uo = (e, t) => {
    switch (e) {
      case "aac":
      case "mp3":
      case "vorbis":
        return xn;
      case "opus":
        return _n;
      case "flac":
        return An;
    }
    if (t)
      switch (e) {
        case "pcm-s24":
        case "pcm-s24be":
        case "pcm-s32":
        case "pcm-s32be":
        case "pcm-f32":
        case "pcm-f32be":
        case "pcm-f64":
        case "pcm-f64be":
          return Pn;
      }
    else
      switch (e) {
        case "pcm-s16":
        case "pcm-s16be":
        case "pcm-s24":
        case "pcm-s24be":
        case "pcm-s32":
        case "pcm-s32be":
        case "pcm-f32":
        case "pcm-f32be":
        case "pcm-f64":
        case "pcm-f64be":
          return Fn;
      }
    return null;
  },
  mo = { webvtt: "wvtt" },
  po = { webvtt: (e) => tn("vttC", [...ue.encode(e.info.config.description)]) },
  fo = (e) => {
    ie(3 === e.length);
    let t = 0;
    for (let i = 0; i < 3; i++) ((t <<= 5), (t += e.charCodeAt(i) - 96));
    return t;
  };
class go {
  constructor() {
    ((this.ensureMonotonicity = !1),
      (this.trackedWrites = null),
      (this.trackedStart = -1),
      (this.trackedEnd = -1));
  }
  start() {}
  maybeTrackWrites(e) {
    if (!this.trackedWrites) return;
    let t = this.getPos();
    if (t < this.trackedStart) {
      if (t + e.byteLength <= this.trackedStart) return;
      ((e = e.subarray(this.trackedStart - t)), (t = 0));
    }
    const i = t + e.byteLength - this.trackedStart;
    let r = this.trackedWrites.byteLength;
    for (; r < i; ) r *= 2;
    if (r !== this.trackedWrites.byteLength) {
      const e = new Uint8Array(r);
      (e.set(this.trackedWrites, 0), (this.trackedWrites = e));
    }
    (this.trackedWrites.set(e, t - this.trackedStart),
      (this.trackedEnd = Math.max(this.trackedEnd, t + e.byteLength)));
  }
  startTrackingWrites() {
    ((this.trackedWrites = new Uint8Array(1024)),
      (this.trackedStart = this.getPos()),
      (this.trackedEnd = this.trackedStart));
  }
  stopTrackingWrites() {
    if (!this.trackedWrites)
      throw new Error(
        "Internal error: Can't get tracked writes since nothing was tracked.",
      );
    const e = {
      data: this.trackedWrites.subarray(0, this.trackedEnd - this.trackedStart),
      start: this.trackedStart,
      end: this.trackedEnd,
    };
    return ((this.trackedWrites = null), e);
  }
}
const ko = 65536,
  yo = 2 ** 32;
class wo extends go {
  constructor(e) {
    if (
      (super(),
      (this.pos = 0),
      (this.maxPos = 0),
      (this.target = e),
      (this.supportsResize = "resize" in new ArrayBuffer(0)),
      this.supportsResize)
    )
      try {
        this.buffer = new ArrayBuffer(ko, { maxByteLength: yo });
      } catch {
        ((this.buffer = new ArrayBuffer(ko)), (this.supportsResize = !1));
      }
    else this.buffer = new ArrayBuffer(ko);
    this.bytes = new Uint8Array(this.buffer);
  }
  ensureSize(e) {
    let t = this.buffer.byteLength;
    for (; t < e; ) t *= 2;
    if (t !== this.buffer.byteLength) {
      if (t > yo)
        throw new Error(
          "ArrayBuffer exceeded maximum size of 4294967296 bytes. Please consider using another target.",
        );
      if (this.supportsResize) this.buffer.resize(t);
      else {
        const e = new ArrayBuffer(t),
          i = new Uint8Array(e);
        (i.set(this.bytes, 0), (this.buffer = e), (this.bytes = i));
      }
    }
  }
  write(e) {
    (this.maybeTrackWrites(e),
      this.ensureSize(this.pos + e.byteLength),
      this.bytes.set(e, this.pos),
      this.target.onwrite?.(this.pos, this.pos + e.byteLength),
      (this.pos += e.byteLength),
      (this.maxPos = Math.max(this.maxPos, this.pos)));
  }
  seek(e) {
    this.pos = e;
  }
  getPos() {
    return this.pos;
  }
  async flush() {}
  async finalize() {
    (this.ensureSize(this.pos),
      (this.target.buffer = this.buffer.slice(
        0,
        Math.max(this.maxPos, this.pos),
      )));
  }
  async close() {}
  getSlice(e, t) {
    return this.bytes.slice(e, t);
  }
}
class bo extends go {
  constructor(e) {
    (super(),
      (this.pos = 0),
      (this.sections = []),
      (this.lastWriteEnd = 0),
      (this.lastFlushEnd = 0),
      (this.writer = null),
      (this.chunks = []),
      (this.target = e),
      (this.chunked = e._options.chunked ?? !1),
      (this.chunkSize = e._options.chunkSize ?? 16777216));
  }
  start() {
    this.writer = this.target._writable.getWriter();
  }
  write(e) {
    if (this.pos > this.lastWriteEnd) {
      const e = this.pos - this.lastWriteEnd;
      ((this.pos = this.lastWriteEnd), this.write(new Uint8Array(e)));
    }
    (this.maybeTrackWrites(e),
      this.sections.push({ data: e.slice(), start: this.pos }),
      this.target.onwrite?.(this.pos, this.pos + e.byteLength),
      (this.pos += e.byteLength),
      (this.lastWriteEnd = Math.max(this.lastWriteEnd, this.pos)));
  }
  seek(e) {
    this.pos = e;
  }
  getPos() {
    return this.pos;
  }
  async flush() {
    if (this.pos > this.lastWriteEnd) {
      const e = this.pos - this.lastWriteEnd;
      ((this.pos = this.lastWriteEnd), this.write(new Uint8Array(e)));
    }
    if ((ie(this.writer), 0 === this.sections.length)) return;
    const e = [],
      t = [...this.sections].sort((e, t) => e.start - t.start);
    e.push({ start: t[0].start, size: t[0].data.byteLength });
    for (let i = 1; i < t.length; i++) {
      const r = e[e.length - 1],
        a = t[i];
      a.start <= r.start + r.size
        ? (r.size = Math.max(r.size, a.start + a.data.byteLength - r.start))
        : e.push({ start: a.start, size: a.data.byteLength });
    }
    for (const i of e) {
      i.data = new Uint8Array(i.size);
      for (const e of this.sections)
        i.start <= e.start &&
          e.start < i.start + i.size &&
          i.data.set(e.data, e.start - i.start);
      if (
        (null !== this.writer.desiredSize &&
          this.writer.desiredSize <= 0 &&
          (await this.writer.ready),
        this.chunked)
      )
        (this.writeDataIntoChunks(i.data, i.start), this.tryToFlushChunks());
      else {
        if (this.ensureMonotonicity && i.start !== this.lastFlushEnd)
          throw new Error("Internal error: Monotonicity violation.");
        (this.writer.write({ type: "write", data: i.data, position: i.start }),
          (this.lastFlushEnd = i.start + i.data.byteLength));
      }
    }
    this.sections.length = 0;
  }
  writeDataIntoChunks(e, t) {
    let i = this.chunks.findIndex(
      (e) => e.start <= t && t < e.start + this.chunkSize,
    );
    -1 === i && (i = this.createChunk(t));
    const r = this.chunks[i],
      a = t - r.start,
      s = e.subarray(0, Math.min(this.chunkSize - a, e.byteLength));
    r.data.set(s, a);
    const n = { start: a, end: a + s.byteLength };
    if (
      (this.insertSectionIntoChunk(r, n),
      0 === r.written[0].start &&
        r.written[0].end === this.chunkSize &&
        (r.shouldFlush = !0),
      this.chunks.length > 2)
    ) {
      for (let e = 0; e < this.chunks.length - 1; e++)
        this.chunks[e].shouldFlush = !0;
      this.tryToFlushChunks();
    }
    s.byteLength < e.byteLength &&
      this.writeDataIntoChunks(e.subarray(s.byteLength), t + s.byteLength);
  }
  insertSectionIntoChunk(e, t) {
    let i = 0,
      r = e.written.length - 1,
      a = -1;
    for (; i <= r; ) {
      const s = Math.floor(i + (r - i + 1) / 2);
      e.written[s].start <= t.start ? ((i = s + 1), (a = s)) : (r = s - 1);
    }
    for (
      e.written.splice(a + 1, 0, t),
        (-1 === a || e.written[a].end < t.start) && a++;
      a < e.written.length - 1 && e.written[a].end >= e.written[a + 1].start;

    )
      ((e.written[a].end = Math.max(e.written[a].end, e.written[a + 1].end)),
        e.written.splice(a + 1, 1));
  }
  createChunk(e) {
    const t = {
      start: Math.floor(e / this.chunkSize) * this.chunkSize,
      data: new Uint8Array(this.chunkSize),
      written: [],
      shouldFlush: !1,
    };
    return (
      this.chunks.push(t),
      this.chunks.sort((e, t) => e.start - t.start),
      this.chunks.indexOf(t)
    );
  }
  tryToFlushChunks(e = !1) {
    ie(this.writer);
    for (let t = 0; t < this.chunks.length; t++) {
      const i = this.chunks[t];
      if (i.shouldFlush || e) {
        for (const e of i.written) {
          const t = i.start + e.start;
          if (this.ensureMonotonicity && t !== this.lastFlushEnd)
            throw new Error("Internal error: Monotonicity violation.");
          (this.writer.write({
            type: "write",
            data: i.data.subarray(e.start, e.end),
            position: t,
          }),
            (this.lastFlushEnd = i.start + e.end));
        }
        this.chunks.splice(t--, 1);
      }
    }
  }
  finalize() {
    return (
      this.chunked && this.tryToFlushChunks(!0),
      ie(this.writer),
      this.writer.close()
    );
  }
  async close() {
    return this.writer?.close();
  }
}
class To {
  constructor() {
    ((this._output = null), (this.onwrite = null));
  }
}
class Co extends To {
  constructor() {
    (super(...arguments), (this.buffer = null));
  }
  _createWriter() {
    return new wo(this);
  }
}
class So extends To {
  constructor(e, t = {}) {
    if ((super(), !(e instanceof WritableStream)))
      throw new TypeError("StreamTarget requires a WritableStream instance.");
    if (null != t && "object" != typeof t)
      throw new TypeError(
        "StreamTarget options, when provided, must be an object.",
      );
    if (void 0 !== t.chunked && "boolean" != typeof t.chunked)
      throw new TypeError("options.chunked, when provided, must be a boolean.");
    if (
      void 0 !== t.chunkSize &&
      (!Number.isInteger(t.chunkSize) || t.chunkSize < 1024)
    )
      throw new TypeError(
        "options.chunkSize, when provided, must be an integer and not smaller than 1024.",
      );
    ((this._writable = e), (this._options = t));
  }
  _createWriter() {
    return new bo(this);
  }
}
const vo = 1e3,
  xo = (e) => {
    const t = {},
      i = e.track;
    return (void 0 !== i.metadata.name && (t.name = i.metadata.name), t);
  },
  Po = (e, t, i = !0) => {
    const r = e * t;
    return i ? Math.round(r) : r;
  };
class Eo extends Wt {
  constructor(e, t) {
    (super(e),
      (this.auxTarget = new Co()),
      (this.auxWriter = this.auxTarget._createWriter()),
      (this.auxBoxWriter = new Rs(this.auxWriter)),
      (this.mdat = null),
      (this.ftypSize = null),
      (this.trackDatas = []),
      (this.allTracksKnown = Ie()),
      (this.creationTime = Math.floor(Date.now() / 1e3) + 2082844800),
      (this.finalizedChunks = []),
      (this.nextFragmentNumber = 1),
      (this.maxWrittenTimestamp = -1 / 0),
      (this.format = t),
      (this.writer = e._writer),
      (this.boxWriter = new Rs(this.writer)),
      (this.isQuickTime = t instanceof Oo));
    const i = this.writer instanceof wo && "in-memory";
    ((this.fastStart = t._options.fastStart ?? i),
      (this.isFragmented = "fragmented" === this.fastStart),
      ("in-memory" === this.fastStart || this.isFragmented) &&
        (this.writer.ensureMonotonicity = !0),
      (this.minimumFragmentDuration = t._options.minimumFragmentDuration ?? 1));
  }
  async start() {
    const e = await this.mutex.acquire(),
      t = this.output._tracks.some(
        (e) => "video" === e.type && "avc" === e.source._codec,
      );
    if (
      (this.format._options.onFtyp && this.writer.startTrackingWrites(),
      this.boxWriter.writeBox(
        (i = {
          isQuickTime: this.isQuickTime,
          holdsAvc: t,
          fragmented: this.isFragmented,
        }).isQuickTime
          ? tn("ftyp", [Gs("qt  "), Hs(512), Gs("qt  ")])
          : i.fragmented
            ? tn("ftyp", [
                Gs("iso5"),
                Hs(512),
                Gs("iso5"),
                Gs("iso6"),
                Gs("mp41"),
              ])
            : tn("ftyp", [
                Gs("isom"),
                Hs(512),
                Gs("isom"),
                i.holdsAvc ? Gs("avc1") : [],
                Gs("mp41"),
              ]),
      ),
      this.format._options.onFtyp)
    ) {
      const { data: e, start: t } = this.writer.stopTrackingWrites();
      this.format._options.onFtyp(e, t);
    }
    var i;
    if (
      ((this.ftypSize = this.writer.getPos()), "in-memory" === this.fastStart)
    );
    else if ("reserve" === this.fastStart) {
      for (const r of this.output._tracks)
        if (void 0 === r.metadata.maximumPacketCount)
          throw new Error(
            "All tracks must specify maximumPacketCount in their metadata when using fastStart: 'reserve'.",
          );
    } else
      this.isFragmented ||
        (this.format._options.onMdat && this.writer.startTrackingWrites(),
        (this.mdat = an(!0)),
        this.boxWriter.writeBox(this.mdat));
    (await this.writer.flush(), e());
  }
  allTracksAreKnown() {
    for (const e of this.output._tracks)
      if (!e.source._closed && !this.trackDatas.some((t) => t.track === e))
        return !1;
    return !0;
  }
  async getMimeType() {
    await this.allTracksKnown.promise;
    const e = this.trackDatas.map((e) => {
      if ("video" === e.type) return e.info.decoderConfig.codec;
      if ("audio" === e.type) return e.info.decoderConfig.codec;
      return { webvtt: "wvtt" }[e.track.source._codec];
    });
    return Zi({
      isQuickTime: this.isQuickTime,
      hasVideo: this.trackDatas.some((e) => "video" === e.type),
      hasAudio: this.trackDatas.some((e) => "audio" === e.type),
      codecStrings: e,
    });
  }
  getVideoTrackData(e, t, i) {
    const r = this.trackDatas.find((t) => t.track === e);
    if (r) return r;
    (Nt(i), ie(i), ie(i.decoderConfig));
    const a = { ...i.decoderConfig };
    (ie(void 0 !== a.codedWidth), ie(void 0 !== a.codedHeight));
    let s = !1;
    if ("avc" !== e.source._codec || a.description) {
      if ("hevc" === e.source._codec && !a.description) {
        const e = Zt(t.data);
        if (!e)
          throw new Error(
            "Couldn't extract an HEVCDecoderConfigurationRecord from the HEVC packet. Make sure the packets are in Annex B format (as specified in ITU-T-REC-H.265) when not providing a description, or provide a description (must be an HEVCDecoderConfigurationRecord as specified in ISO 14496-15) and ensure the packets are in HEVC format.",
          );
        ((a.description = ((e) => {
          const t = [];
          (t.push(e.configurationVersion),
            t.push(
              ((3 & e.generalProfileSpace) << 6) |
                ((1 & e.generalTierFlag) << 5) |
                (31 & e.generalProfileIdc),
            ),
            t.push((e.generalProfileCompatibilityFlags >>> 24) & 255),
            t.push((e.generalProfileCompatibilityFlags >>> 16) & 255),
            t.push((e.generalProfileCompatibilityFlags >>> 8) & 255),
            t.push(255 & e.generalProfileCompatibilityFlags),
            t.push(...e.generalConstraintIndicatorFlags),
            t.push(255 & e.generalLevelIdc),
            t.push(240 | ((e.minSpatialSegmentationIdc >> 8) & 15)),
            t.push(255 & e.minSpatialSegmentationIdc),
            t.push(252 | (3 & e.parallelismType)),
            t.push(252 | (3 & e.chromaFormatIdc)),
            t.push(248 | (7 & e.bitDepthLumaMinus8)),
            t.push(248 | (7 & e.bitDepthChromaMinus8)),
            t.push((e.avgFrameRate >> 8) & 255),
            t.push(255 & e.avgFrameRate),
            t.push(
              ((3 & e.constantFrameRate) << 6) |
                ((7 & e.numTemporalLayers) << 3) |
                ((1 & e.temporalIdNested) << 2) |
                (3 & e.lengthSizeMinusOne),
            ),
            t.push(255 & e.arrays.length));
          for (const i of e.arrays) {
            (t.push(((1 & i.arrayCompleteness) << 7) | (63 & i.nalUnitType)),
              t.push((i.nalUnits.length >> 8) & 255),
              t.push(255 & i.nalUnits.length));
            for (const e of i.nalUnits) {
              (t.push((e.length >> 8) & 255), t.push(255 & e.length));
              for (let i = 0; i < e.length; i++) t.push(e[i]);
            }
          }
          return new Uint8Array(t);
        })(e)),
          (s = !0));
      }
    } else {
      const e = Xt(t.data);
      if (!e)
        throw new Error(
          "Couldn't extract an AVCDecoderConfigurationRecord from the AVC packet. Make sure the packets are in Annex B format (as specified in ITU-T-REC-H.264) when not providing a description, or provide a description (must be an AVCDecoderConfigurationRecord as specified in ISO 14496-15) and ensure the packets are in AVCC format.",
        );
      ((a.description = ((e) => {
        const t = [];
        (t.push(e.configurationVersion),
          t.push(e.avcProfileIndication),
          t.push(e.profileCompatibility),
          t.push(e.avcLevelIndication),
          t.push(252 | (3 & e.lengthSizeMinusOne)),
          t.push(224 | (31 & e.sequenceParameterSets.length)));
        for (const i of e.sequenceParameterSets) {
          const e = i.byteLength;
          (t.push(e >> 8), t.push(255 & e));
          for (let r = 0; r < e; r++) t.push(i[r]);
        }
        t.push(e.pictureParameterSets.length);
        for (const i of e.pictureParameterSets) {
          const e = i.byteLength;
          (t.push(e >> 8), t.push(255 & e));
          for (let r = 0; r < e; r++) t.push(i[r]);
        }
        if (
          100 === e.avcProfileIndication ||
          110 === e.avcProfileIndication ||
          122 === e.avcProfileIndication ||
          144 === e.avcProfileIndication
        ) {
          (ie(null !== e.chromaFormat),
            ie(null !== e.bitDepthLumaMinus8),
            ie(null !== e.bitDepthChromaMinus8),
            ie(null !== e.sequenceParameterSetExt),
            t.push(252 | (3 & e.chromaFormat)),
            t.push(248 | (7 & e.bitDepthLumaMinus8)),
            t.push(248 | (7 & e.bitDepthChromaMinus8)),
            t.push(e.sequenceParameterSetExt.length));
          for (const i of e.sequenceParameterSetExt) {
            const e = i.byteLength;
            (t.push(e >> 8), t.push(255 & e));
            for (let r = 0; r < e; r++) t.push(i[r]);
          }
        }
        return new Uint8Array(t);
      })(e)),
        (s = !0));
    }
    const n = ((e, t) => {
        const i = e < 0 ? -1 : 1;
        let r = 0,
          a = 1,
          s = 1,
          n = 0,
          o = (e = Math.abs(e));
        for (;;) {
          const e = Math.floor(o),
            c = e * s + r,
            l = e * n + a;
          if (l > t) return { numerator: i * s, denominator: n };
          if (
            ((r = s),
            (a = n),
            (s = c),
            (n = l),
            (o = 1 / (o - e)),
            !isFinite(o))
          )
            break;
        }
        return { numerator: i * s, denominator: n };
      })(1 / (e.metadata.frameRate ?? 57600), 1e6).denominator,
      o = {
        muxer: this,
        track: e,
        type: "video",
        info: {
          width: a.codedWidth,
          height: a.codedHeight,
          decoderConfig: a,
          requiresAnnexBTransformation: s,
        },
        timescale: n,
        samples: [],
        sampleQueue: [],
        timestampProcessingQueue: [],
        timeToSampleTable: [],
        compositionTimeOffsetTable: [],
        lastTimescaleUnits: null,
        lastSample: null,
        finalizedChunks: [],
        currentChunk: null,
        compactlyCodedChunkTable: [],
      };
    return (
      this.trackDatas.push(o),
      this.trackDatas.sort((e, t) => e.track.id - t.track.id),
      this.allTracksAreKnown() && this.allTracksKnown.resolve(),
      o
    );
  }
  getAudioTrackData(e, t) {
    const i = this.trackDatas.find((t) => t.track === e);
    if (i) return i;
    (Lt(t), ie(t), ie(t.decoderConfig));
    const r = {
      muxer: this,
      track: e,
      type: "audio",
      info: {
        numberOfChannels: t.decoderConfig.numberOfChannels,
        sampleRate: t.decoderConfig.sampleRate,
        decoderConfig: t.decoderConfig,
        requiresPcmTransformation:
          !this.isFragmented && ht.includes(e.source._codec),
      },
      timescale: t.decoderConfig.sampleRate,
      samples: [],
      sampleQueue: [],
      timestampProcessingQueue: [],
      timeToSampleTable: [],
      compositionTimeOffsetTable: [],
      lastTimescaleUnits: null,
      lastSample: null,
      finalizedChunks: [],
      currentChunk: null,
      compactlyCodedChunkTable: [],
    };
    return (
      this.trackDatas.push(r),
      this.trackDatas.sort((e, t) => e.track.id - t.track.id),
      this.allTracksAreKnown() && this.allTracksKnown.resolve(),
      r
    );
  }
  getSubtitleTrackData(e, t) {
    const i = this.trackDatas.find((t) => t.track === e);
    if (i) return i;
    (Vt(t), ie(t), ie(t.config));
    const r = {
      muxer: this,
      track: e,
      type: "subtitle",
      info: { config: t.config },
      timescale: 1e3,
      samples: [],
      sampleQueue: [],
      timestampProcessingQueue: [],
      timeToSampleTable: [],
      compositionTimeOffsetTable: [],
      lastTimescaleUnits: null,
      lastSample: null,
      finalizedChunks: [],
      currentChunk: null,
      compactlyCodedChunkTable: [],
      lastCueEndTimestamp: 0,
      cueQueue: [],
      nextSourceId: 0,
      cueToSourceId: new WeakMap(),
    };
    return (
      this.trackDatas.push(r),
      this.trackDatas.sort((e, t) => e.track.id - t.track.id),
      this.allTracksAreKnown() && this.allTracksKnown.resolve(),
      r
    );
  }
  async addEncodedVideoPacket(e, t, i) {
    const r = await this.mutex.acquire();
    try {
      const r = this.getVideoTrackData(e, t, i);
      let a = t.data;
      if (r.info.requiresAnnexBTransformation) {
        const e = ((e) => {
          const t = jt(e);
          if (0 === t.length) return null;
          let i = 0;
          for (const n of t) i += 4 + n.byteLength;
          const r = new Uint8Array(i),
            a = new DataView(r.buffer);
          let s = 0;
          for (const n of t) {
            const e = n.byteLength;
            (a.setUint32(s, e, !1), (s += 4), r.set(n, s), (s += n.byteLength));
          }
          return r;
        })(a);
        if (!e)
          throw new Error(
            "Failed to transform packet data. Make sure all packets are provided in Annex B format, as specified in ITU-T-REC-H.264 and ITU-T-REC-H.265.",
          );
        a = e;
      }
      const s = this.validateAndNormalizeTimestamp(
          r.track,
          t.timestamp,
          "key" === t.type,
        ),
        n = this.createSampleForTrack(r, a, s, t.duration, t.type);
      await this.registerSample(r, n);
    } finally {
      r();
    }
  }
  async addEncodedAudioPacket(e, t, i) {
    const r = await this.mutex.acquire();
    try {
      const r = this.getAudioTrackData(e, i),
        a = this.validateAndNormalizeTimestamp(
          r.track,
          t.timestamp,
          "key" === t.type,
        ),
        s = this.createSampleForTrack(r, t.data, a, t.duration, t.type);
      (r.info.requiresPcmTransformation &&
        (await this.maybePadWithSilence(r, a)),
        await this.registerSample(r, s));
    } finally {
      r();
    }
  }
  async maybePadWithSilence(e, t) {
    const i = ae(e.samples),
      r = i ? i.timestamp + i.duration : 0,
      a = t - r,
      s = Po(a, e.timescale);
    if (s > 0) {
      const { sampleSize: t, silentValue: i } = Ft(e.info.decoderConfig.codec),
        n = s * e.info.numberOfChannels,
        o = new Uint8Array(t * n).fill(i),
        c = this.createSampleForTrack(e, new Uint8Array(o.buffer), r, a, "key");
      await this.registerSample(e, c);
    }
  }
  async addSubtitleCue(e, t, i) {
    const r = await this.mutex.acquire();
    try {
      const r = this.getSubtitleTrackData(e, i);
      (this.validateAndNormalizeTimestamp(r.track, t.timestamp, !0),
        "webvtt" === e.source._codec &&
          (r.cueQueue.push(t), await this.processWebVTTCues(r, t.timestamp)));
    } finally {
      r();
    }
  }
  async processWebVTTCues(e, t) {
    for (; e.cueQueue.length > 0; ) {
      const i = new Set([]);
      for (const c of e.cueQueue)
        (ie(c.timestamp <= t),
          ie(e.lastCueEndTimestamp <= c.timestamp + c.duration),
          i.add(Math.max(c.timestamp, e.lastCueEndTimestamp)),
          i.add(c.timestamp + c.duration));
      const r = [...i].sort((e, t) => e - t),
        a = r[0],
        s = r[1] ?? a;
      if (t < s) break;
      if (e.lastCueEndTimestamp < a) {
        this.auxWriter.seek(0);
        const t = Yn();
        this.auxBoxWriter.writeBox(t);
        const i = this.auxWriter.getSlice(0, this.auxWriter.getPos()),
          r = this.createSampleForTrack(
            e,
            i,
            e.lastCueEndTimestamp,
            a - e.lastCueEndTimestamp,
            "key",
          );
        (await this.registerSample(e, r), (e.lastCueEndTimestamp = a));
      }
      this.auxWriter.seek(0);
      for (let t = 0; t < e.cueQueue.length; t++) {
        const i = e.cueQueue[t];
        if (i.timestamp >= s) break;
        Ms.lastIndex = 0;
        const r = Ms.test(i.text),
          n = i.timestamp + i.duration;
        let o = e.cueToSourceId.get(i);
        if (
          (void 0 === o &&
            s < n &&
            ((o = e.nextSourceId++), e.cueToSourceId.set(i, o)),
          i.notes)
        ) {
          const e = Zn(i.notes);
          this.auxBoxWriter.writeBox(e);
        }
        const c = Jn(
          i.text,
          r ? a : null,
          i.identifier ?? null,
          i.settings ?? null,
          o ?? null,
        );
        (this.auxBoxWriter.writeBox(c), n === s && e.cueQueue.splice(t--, 1));
      }
      const n = this.auxWriter.getSlice(0, this.auxWriter.getPos()),
        o = this.createSampleForTrack(e, n, a, s - a, "key");
      (await this.registerSample(e, o), (e.lastCueEndTimestamp = s));
    }
  }
  createSampleForTrack(e, t, i, r, a) {
    return {
      timestamp: i,
      decodeTimestamp: i,
      duration: r,
      data: t,
      size: t.byteLength,
      type: a,
      timescaleUnitsToNextSample: Po(r, e.timescale),
    };
  }
  processTimestamps(e, t) {
    if (0 === e.timestampProcessingQueue.length) return;
    if ("audio" === e.type && e.info.requiresPcmTransformation) {
      let t = 0;
      for (let i = 0; i < e.timestampProcessingQueue.length; i++) {
        const r = e.timestampProcessingQueue[i];
        t += Po(r.duration, e.timescale);
      }
      if (0 === e.timeToSampleTable.length)
        e.timeToSampleTable.push({ sampleCount: t, sampleDelta: 1 });
      else {
        ae(e.timeToSampleTable).sampleCount += t;
      }
      return void (e.timestampProcessingQueue.length = 0);
    }
    const i = e.timestampProcessingQueue
      .map((e) => e.timestamp)
      .sort((e, t) => e - t);
    for (let r = 0; r < e.timestampProcessingQueue.length; r++) {
      const t = e.timestampProcessingQueue[r];
      ((t.decodeTimestamp = i[r]),
        this.isFragmented ||
          null !== e.lastTimescaleUnits ||
          (t.decodeTimestamp = 0));
      const a = Po(t.timestamp - t.decodeTimestamp, e.timescale),
        s = Po(t.duration, e.timescale);
      if (null !== e.lastTimescaleUnits) {
        ie(e.lastSample);
        const i = Po(t.decodeTimestamp, e.timescale, !1),
          r = Math.round(i - e.lastTimescaleUnits);
        if (
          (ie(r >= 0),
          (e.lastTimescaleUnits += r),
          (e.lastSample.timescaleUnitsToNextSample = r),
          !this.isFragmented)
        ) {
          let t = ae(e.timeToSampleTable);
          if ((ie(t), 1 === t.sampleCount)) {
            t.sampleDelta = r;
            const i = e.timeToSampleTable[e.timeToSampleTable.length - 2];
            i &&
              i.sampleDelta === r &&
              (i.sampleCount++, e.timeToSampleTable.pop(), (t = i));
          } else
            t.sampleDelta !== r &&
              (t.sampleCount--,
              e.timeToSampleTable.push(
                (t = { sampleCount: 1, sampleDelta: r }),
              ));
          t.sampleDelta === s
            ? t.sampleCount++
            : e.timeToSampleTable.push({ sampleCount: 1, sampleDelta: s });
          const i = ae(e.compositionTimeOffsetTable);
          (ie(i),
            i.sampleCompositionTimeOffset === a
              ? i.sampleCount++
              : e.compositionTimeOffsetTable.push({
                  sampleCount: 1,
                  sampleCompositionTimeOffset: a,
                }));
        }
      } else
        ((e.lastTimescaleUnits = Po(t.decodeTimestamp, e.timescale, !1)),
          this.isFragmented ||
            (e.timeToSampleTable.push({ sampleCount: 1, sampleDelta: s }),
            e.compositionTimeOffsetTable.push({
              sampleCount: 1,
              sampleCompositionTimeOffset: a,
            })));
      e.lastSample = t;
    }
    if (
      ((e.timestampProcessingQueue.length = 0),
      ie(e.lastSample),
      ie(null !== e.lastTimescaleUnits),
      void 0 !== t && 0 === e.lastSample.timescaleUnitsToNextSample)
    ) {
      ie("key" === t.type);
      const i = Po(t.timestamp, e.timescale, !1),
        r = Math.round(i - e.lastTimescaleUnits);
      e.lastSample.timescaleUnitsToNextSample = r;
    }
  }
  async registerSample(e, t) {
    ("key" === t.type && this.processTimestamps(e, t),
      e.timestampProcessingQueue.push(t),
      this.isFragmented
        ? (e.sampleQueue.push(t), await this.interleaveSamples())
        : "reserve" === this.fastStart
          ? await this.registerSampleFastStartReserve(e, t)
          : await this.addSampleToTrack(e, t));
  }
  async addSampleToTrack(e, t) {
    if (
      !this.isFragmented &&
      (e.samples.push(t), "reserve" === this.fastStart)
    ) {
      const t = e.track.metadata.maximumPacketCount;
      if ((ie(void 0 !== t), e.samples.length > t))
        throw new Error(
          `Track #${e.track.id} has already reached the maximum packet count (${t}). Either add less packets or increase the maximum packet count.`,
        );
    }
    let i = !1;
    if (e.currentChunk) {
      e.currentChunk.startTimestamp = Math.min(
        e.currentChunk.startTimestamp,
        t.timestamp,
      );
      const r = t.timestamp - e.currentChunk.startTimestamp;
      if (this.isFragmented) {
        const a = this.trackDatas.every((i) => {
          if (e === i) return "key" === t.type;
          const r = i.sampleQueue[0];
          return r ? "key" === r.type : i.track.source._closed;
        });
        r >= this.minimumFragmentDuration &&
          a &&
          t.timestamp > this.maxWrittenTimestamp &&
          ((i = !0), await this.finalizeFragment());
      } else i = r >= 0.5;
    } else i = !0;
    (i &&
      (e.currentChunk && (await this.finalizeCurrentChunk(e)),
      (e.currentChunk = {
        startTimestamp: t.timestamp,
        samples: [],
        offset: null,
        moofOffset: null,
      })),
      ie(e.currentChunk),
      e.currentChunk.samples.push(t),
      this.isFragmented &&
        (this.maxWrittenTimestamp = Math.max(
          this.maxWrittenTimestamp,
          t.timestamp,
        )));
  }
  async finalizeCurrentChunk(e) {
    if ((ie(!this.isFragmented), !e.currentChunk)) return;
    (e.finalizedChunks.push(e.currentChunk),
      this.finalizedChunks.push(e.currentChunk));
    let t = e.currentChunk.samples.length;
    if (
      ("audio" === e.type &&
        e.info.requiresPcmTransformation &&
        (t = e.currentChunk.samples.reduce(
          (t, i) => t + Po(i.duration, e.timescale),
          0,
        )),
      (0 !== e.compactlyCodedChunkTable.length &&
        ae(e.compactlyCodedChunkTable).samplesPerChunk === t) ||
        e.compactlyCodedChunkTable.push({
          firstChunk: e.finalizedChunks.length,
          samplesPerChunk: t,
        }),
      "in-memory" !== this.fastStart)
    ) {
      e.currentChunk.offset = this.writer.getPos();
      for (const t of e.currentChunk.samples)
        (ie(t.data), this.writer.write(t.data), (t.data = null));
      await this.writer.flush();
    } else e.currentChunk.offset = 0;
  }
  async interleaveSamples(e = !1) {
    if ((ie(this.isFragmented), e || this.allTracksAreKnown()))
      e: for (;;) {
        let t = null,
          i = 1 / 0;
        for (const a of this.trackDatas) {
          if (!e && 0 === a.sampleQueue.length && !a.track.source._closed)
            break e;
          a.sampleQueue.length > 0 &&
            a.sampleQueue[0].timestamp < i &&
            ((t = a), (i = a.sampleQueue[0].timestamp));
        }
        if (!t) break;
        const r = t.sampleQueue.shift();
        await this.addSampleToTrack(t, r);
      }
  }
  async finalizeFragment(e = !0) {
    ie(this.isFragmented);
    const t = this.nextFragmentNumber++;
    if (1 === t) {
      this.format._options.onMoov && this.writer.startTrackingWrites();
      const e = sn(this);
      if ((this.boxWriter.writeBox(e), this.format._options.onMoov)) {
        const { data: e, start: t } = this.writer.stopTrackingWrites();
        this.format._options.onMoov(e, t);
      }
    }
    const i = this.trackDatas.filter((e) => e.currentChunk),
      r = Wn(t, i),
      a = this.writer.getPos(),
      s = a + this.boxWriter.measureBox(r);
    let n = s + 8,
      o = 1 / 0;
    for (const u of i) {
      ((u.currentChunk.offset = n), (u.currentChunk.moofOffset = a));
      for (const e of u.currentChunk.samples) n += e.size;
      o = Math.min(o, u.currentChunk.startTimestamp);
    }
    const c = n - s,
      l = c >= 2 ** 32;
    if (l) for (const u of i) u.currentChunk.offset += 8;
    this.format._options.onMoof && this.writer.startTrackingWrites();
    const h = Wn(t, i);
    if ((this.boxWriter.writeBox(h), this.format._options.onMoof)) {
      const { data: e, start: t } = this.writer.stopTrackingWrites();
      this.format._options.onMoof(e, t, o);
    }
    (ie(this.writer.getPos() === s),
      this.format._options.onMdat && this.writer.startTrackingWrites());
    const d = an(l);
    ((d.size = c),
      this.boxWriter.writeBox(d),
      this.writer.seek(s + (l ? er : 8)));
    for (const u of i)
      for (const e of u.currentChunk.samples)
        (this.writer.write(e.data), (e.data = null));
    if (this.format._options.onMdat) {
      const { data: e, start: t } = this.writer.stopTrackingWrites();
      this.format._options.onMdat(e, t);
    }
    for (const u of i)
      (u.finalizedChunks.push(u.currentChunk),
        this.finalizedChunks.push(u.currentChunk),
        (u.currentChunk = null));
    e && (await this.writer.flush());
  }
  async registerSampleFastStartReserve(e, t) {
    if (this.allTracksAreKnown()) {
      if (!this.mdat) {
        const e = sn(this),
          t =
            this.boxWriter.measureBox(e) +
            this.computeSampleTableSizeUpperBound() +
            4096;
        (ie(null !== this.ftypSize),
          this.writer.seek(this.ftypSize + t),
          this.format._options.onMdat && this.writer.startTrackingWrites(),
          (this.mdat = an(!0)),
          this.boxWriter.writeBox(this.mdat));
        for (const i of this.trackDatas) {
          for (const e of i.sampleQueue) await this.addSampleToTrack(i, e);
          i.sampleQueue.length = 0;
        }
      }
      await this.addSampleToTrack(e, t);
    } else e.sampleQueue.push(t);
  }
  computeSampleTableSizeUpperBound() {
    ie("reserve" === this.fastStart);
    let e = 0;
    for (const t of this.trackDatas) {
      const i = t.track.metadata.maximumPacketCount;
      (ie(void 0 !== i),
        (e += 8 * Math.ceil((2 / 3) * i)),
        (e += 4 * i),
        (e += 8 * Math.ceil((2 / 3) * i)),
        (e += 12 * Math.ceil((2 / 3) * i)),
        (e += 4 * i),
        (e += 8 * i));
    }
    return e;
  }
  async onTrackClose(e) {
    const t = await this.mutex.acquire();
    if ("subtitle" === e.type && "webvtt" === e.source._codec) {
      const t = this.trackDatas.find((t) => t.track === e);
      t && (await this.processWebVTTCues(t, 1 / 0));
    }
    (this.allTracksAreKnown() && this.allTracksKnown.resolve(),
      this.isFragmented && (await this.interleaveSamples()),
      t());
  }
  async finalize() {
    const e = await this.mutex.acquire();
    this.allTracksKnown.resolve();
    for (const i of this.trackDatas)
      "subtitle" === i.type &&
        "webvtt" === i.track.source._codec &&
        (await this.processWebVTTCues(i, 1 / 0));
    if (this.isFragmented) {
      await this.interleaveSamples(!0);
      for (const e of this.trackDatas) this.processTimestamps(e);
      await this.finalizeFragment(!1);
    } else
      for (const i of this.trackDatas)
        (this.processTimestamps(i), await this.finalizeCurrentChunk(i));
    if ("in-memory" === this.fastStart) {
      let e;
      this.mdat = an(!1);
      for (let i = 0; i < 2; i++) {
        const t = sn(this),
          i = this.boxWriter.measureBox(t);
        e = this.boxWriter.measureBox(this.mdat);
        let r = this.writer.getPos() + i + e;
        for (const a of this.finalizedChunks) {
          a.offset = r;
          for (const { data: t } of a.samples)
            (ie(t), (r += t.byteLength), (e += t.byteLength));
        }
        if (r < 2 ** 32) break;
        e >= 2 ** 32 && (this.mdat.largeSize = !0);
      }
      this.format._options.onMoov && this.writer.startTrackingWrites();
      const t = sn(this);
      if ((this.boxWriter.writeBox(t), this.format._options.onMoov)) {
        const { data: e, start: t } = this.writer.stopTrackingWrites();
        this.format._options.onMoov(e, t);
      }
      (this.format._options.onMdat && this.writer.startTrackingWrites(),
        (this.mdat.size = e),
        this.boxWriter.writeBox(this.mdat));
      for (const i of this.finalizedChunks)
        for (const e of i.samples)
          (ie(e.data), this.writer.write(e.data), (e.data = null));
      if (this.format._options.onMdat) {
        const { data: e, start: t } = this.writer.stopTrackingWrites();
        this.format._options.onMdat(e, t);
      }
    } else if (this.isFragmented) {
      const e = this.writer.getPos(),
        i = ((t = this.trackDatas), tn("mfra", void 0, [...t.map(Xn), Gn()]));
      this.boxWriter.writeBox(i);
      const r = this.writer.getPos() - e;
      (this.writer.seek(this.writer.getPos() - 4), this.boxWriter.writeU32(r));
    } else {
      ie(this.mdat);
      const e = this.boxWriter.offsets.get(this.mdat);
      ie(void 0 !== e);
      const t = this.writer.getPos() - e;
      if (
        ((this.mdat.size = t),
        (this.mdat.largeSize = t >= 2 ** 32),
        this.boxWriter.patchBox(this.mdat),
        this.format._options.onMdat)
      ) {
        const { data: e, start: t } = this.writer.stopTrackingWrites();
        this.format._options.onMdat(e, t);
      }
      const i = sn(this);
      if ("reserve" === this.fastStart) {
        (ie(null !== this.ftypSize),
          this.writer.seek(this.ftypSize),
          this.format._options.onMoov && this.writer.startTrackingWrites(),
          this.boxWriter.writeBox(i));
        const e = this.boxWriter.offsets.get(this.mdat) - this.writer.getPos();
        this.boxWriter.writeBox({ type: "free", size: e });
      } else
        (this.format._options.onMoov && this.writer.startTrackingWrites(),
          this.boxWriter.writeBox(i));
      if (this.format._options.onMoov) {
        const { data: e, start: t } = this.writer.stopTrackingWrites();
        this.format._options.onMoov(e, t);
      }
    }
    var t;
    e();
  }
}
const Io = "Mediabunny",
  _o = { video: 1, audio: 2, subtitle: 17 };
class Ao extends Wt {
  constructor(e, t) {
    (super(e),
      (this.trackDatas = []),
      (this.allTracksKnown = Ie()),
      (this.segment = null),
      (this.segmentInfo = null),
      (this.seekHead = null),
      (this.tracksElement = null),
      (this.tagsElement = null),
      (this.attachmentsElement = null),
      (this.segmentDuration = null),
      (this.cues = null),
      (this.currentCluster = null),
      (this.currentClusterStartMsTimestamp = null),
      (this.currentClusterMaxMsTimestamp = null),
      (this.trackDatasInCurrentCluster = new Map()),
      (this.duration = 0),
      (this.writer = e._writer),
      (this.format = t),
      (this.ebmlWriter = new _r(this.writer)),
      this.format._options.appendOnly && (this.writer.ensureMonotonicity = !0));
  }
  async start() {
    const e = await this.mutex.acquire();
    (this.writeEBMLHeader(),
      this.createSegmentInfo(),
      this.createCues(),
      await this.writer.flush(),
      e());
  }
  writeEBMLHeader() {
    this.format._options.onEbmlHeader && this.writer.startTrackingWrites();
    const e = {
      id: Cr.EBML,
      data: [
        { id: Cr.EBMLVersion, data: 1 },
        { id: Cr.EBMLReadVersion, data: 1 },
        { id: Cr.EBMLMaxIDLength, data: 4 },
        { id: Cr.EBMLMaxSizeLength, data: 8 },
        {
          id: Cr.DocType,
          data: this.format instanceof zo ? "webm" : "matroska",
        },
        { id: Cr.DocTypeVersion, data: 2 },
        { id: Cr.DocTypeReadVersion, data: 2 },
      ],
    };
    if ((this.ebmlWriter.writeEBML(e), this.format._options.onEbmlHeader)) {
      const { data: e, start: t } = this.writer.stopTrackingWrites();
      this.format._options.onEbmlHeader(e, t);
    }
  }
  maybeCreateSeekHead(e) {
    if (this.format._options.appendOnly) return;
    const t = new Uint8Array([28, 83, 187, 107]),
      i = new Uint8Array([21, 73, 169, 102]),
      r = new Uint8Array([22, 84, 174, 107]),
      a = new Uint8Array([25, 65, 164, 105]),
      s = new Uint8Array([18, 84, 195, 103]),
      n = {
        id: Cr.SeekHead,
        data: [
          {
            id: Cr.Seek,
            data: [
              { id: Cr.SeekID, data: t },
              {
                id: Cr.SeekPosition,
                size: 5,
                data: e
                  ? this.ebmlWriter.offsets.get(this.cues) -
                    this.segmentDataOffset
                  : 0,
              },
            ],
          },
          {
            id: Cr.Seek,
            data: [
              { id: Cr.SeekID, data: i },
              {
                id: Cr.SeekPosition,
                size: 5,
                data: e
                  ? this.ebmlWriter.offsets.get(this.segmentInfo) -
                    this.segmentDataOffset
                  : 0,
              },
            ],
          },
          {
            id: Cr.Seek,
            data: [
              { id: Cr.SeekID, data: r },
              {
                id: Cr.SeekPosition,
                size: 5,
                data: e
                  ? this.ebmlWriter.offsets.get(this.tracksElement) -
                    this.segmentDataOffset
                  : 0,
              },
            ],
          },
          this.attachmentsElement
            ? {
                id: Cr.Seek,
                data: [
                  { id: Cr.SeekID, data: a },
                  {
                    id: Cr.SeekPosition,
                    size: 5,
                    data: e
                      ? this.ebmlWriter.offsets.get(this.attachmentsElement) -
                        this.segmentDataOffset
                      : 0,
                  },
                ],
              }
            : null,
          this.tagsElement
            ? {
                id: Cr.Seek,
                data: [
                  { id: Cr.SeekID, data: s },
                  {
                    id: Cr.SeekPosition,
                    size: 5,
                    data: e
                      ? this.ebmlWriter.offsets.get(this.tagsElement) -
                        this.segmentDataOffset
                      : 0,
                  },
                ],
              }
            : null,
        ],
      };
    this.seekHead = n;
  }
  createSegmentInfo() {
    const e = { id: Cr.Duration, data: new wr(0) };
    this.segmentDuration = e;
    const t = {
      id: Cr.Info,
      data: [
        { id: Cr.TimestampScale, data: 1e6 },
        { id: Cr.MuxingApp, data: Io },
        { id: Cr.WritingApp, data: Io },
        this.format._options.appendOnly ? null : e,
      ],
    };
    this.segmentInfo = t;
  }
  createTracks() {
    const e = { id: Cr.Tracks, data: [] };
    this.tracksElement = e;
    for (const t of this.trackDatas) {
      const i = Wr[t.track.source._codec];
      ie(i);
      let r = 0;
      if ("audio" === t.type && "opus" === t.track.source._codec) {
        r = 8e7;
        const e = t.info.decoderConfig.description;
        if (e) {
          const t = le(e),
            i = hi(t);
          r = Math.round((i.preSkip / _t) * 1e9);
        }
      }
      e.data.push({
        id: Cr.TrackEntry,
        data: [
          { id: Cr.TrackNumber, data: t.track.id },
          { id: Cr.TrackUID, data: t.track.id },
          { id: Cr.TrackType, data: _o[t.type] },
          !1 === t.track.metadata.disposition?.default
            ? { id: Cr.FlagDefault, data: 0 }
            : null,
          t.track.metadata.disposition?.forced
            ? { id: Cr.FlagForced, data: 1 }
            : null,
          t.track.metadata.disposition?.hearingImpaired
            ? { id: Cr.FlagHearingImpaired, data: 1 }
            : null,
          t.track.metadata.disposition?.visuallyImpaired
            ? { id: Cr.FlagVisualImpaired, data: 1 }
            : null,
          t.track.metadata.disposition?.original
            ? { id: Cr.FlagOriginal, data: 1 }
            : null,
          t.track.metadata.disposition?.commentary
            ? { id: Cr.FlagCommentary, data: 1 }
            : null,
          { id: Cr.FlagLacing, data: 0 },
          { id: Cr.Language, data: t.track.metadata.languageCode ?? Re },
          { id: Cr.CodecID, data: i },
          { id: Cr.CodecDelay, data: 0 },
          { id: Cr.SeekPreRoll, data: r },
          void 0 !== t.track.metadata.name
            ? { id: Cr.Name, data: new Tr(t.track.metadata.name) }
            : null,
          "video" === t.type ? this.videoSpecificTrackInfo(t) : null,
          "audio" === t.type ? this.audioSpecificTrackInfo(t) : null,
          "subtitle" === t.type ? this.subtitleSpecificTrackInfo(t) : null,
        ],
      });
    }
  }
  videoSpecificTrackInfo(e) {
    const { frameRate: t, rotation: i } = e.track.metadata,
      r = [
        e.info.decoderConfig.description
          ? { id: Cr.CodecPrivate, data: le(e.info.decoderConfig.description) }
          : null,
        t ? { id: Cr.DefaultDuration, data: 1e9 / t } : null,
      ],
      a = i ? re(-i) : 0,
      s = e.info.decoderConfig.colorSpace,
      n = {
        id: Cr.Video,
        data: [
          { id: Cr.PixelWidth, data: e.info.width },
          { id: Cr.PixelHeight, data: e.info.height },
          e.info.alphaMode ? { id: Cr.AlphaMode, data: 1 } : null,
          be(s)
            ? {
                id: Cr.Colour,
                data: [
                  { id: Cr.MatrixCoefficients, data: ye[s.matrix] },
                  { id: Cr.TransferCharacteristics, data: ge[s.transfer] },
                  { id: Cr.Primaries, data: pe[s.primaries] },
                  { id: Cr.Range, data: s.fullRange ? 2 : 1 },
                ],
              }
            : null,
          a
            ? {
                id: Cr.Projection,
                data: [
                  { id: Cr.ProjectionType, data: 0 },
                  {
                    id: Cr.ProjectionPoseRoll,
                    data: new yr(((a + 180) % 360) - 180),
                  },
                ],
              }
            : null,
        ],
      };
    return (r.push(n), r);
  }
  audioSpecificTrackInfo(e) {
    const t = ht.includes(e.track.source._codec)
      ? Ft(e.track.source._codec)
      : null;
    return [
      e.info.decoderConfig.description
        ? { id: Cr.CodecPrivate, data: le(e.info.decoderConfig.description) }
        : null,
      {
        id: Cr.Audio,
        data: [
          { id: Cr.SamplingFrequency, data: new yr(e.info.sampleRate) },
          { id: Cr.Channels, data: e.info.numberOfChannels },
          t ? { id: Cr.BitDepth, data: 8 * t.sampleSize } : null,
        ],
      },
    ];
  }
  subtitleSpecificTrackInfo(e) {
    return [
      { id: Cr.CodecPrivate, data: ue.encode(e.info.config.description) },
    ];
  }
  maybeCreateTags() {
    const e = [],
      t = (t, i) => {
        e.push({
          id: Cr.SimpleTag,
          data: [
            { id: Cr.TagName, data: new Tr(t) },
            "string" == typeof i
              ? { id: Cr.TagString, data: new Tr(i) }
              : { id: Cr.TagBinary, data: i },
          ],
        });
      },
      i = this.output._metadataTags,
      r = new Set();
    for (const { key: a, value: s } of Ze(i))
      switch (a) {
        case "title":
          (t("TITLE", s), r.add("TITLE"));
          break;
        case "description":
          (t("DESCRIPTION", s), r.add("DESCRIPTION"));
          break;
        case "artist":
          (t("ARTIST", s), r.add("ARTIST"));
          break;
        case "album":
          (t("ALBUM", s), r.add("ALBUM"));
          break;
        case "albumArtist":
          (t("ALBUM_ARTIST", s), r.add("ALBUM_ARTIST"));
          break;
        case "genre":
          (t("GENRE", s), r.add("GENRE"));
          break;
        case "comment":
          (t("COMMENT", s), r.add("COMMENT"));
          break;
        case "lyrics":
          (t("LYRICS", s), r.add("LYRICS"));
          break;
        case "date":
          (t("DATE", s.toISOString().slice(0, 10)), r.add("DATE"));
          break;
        case "trackNumber":
          (t(
            "PART_NUMBER",
            void 0 !== i.tracksTotal ? `${s}/${i.tracksTotal}` : s.toString(),
          ),
            r.add("PART_NUMBER"));
          break;
        case "discNumber":
          (t(
            "DISC",
            void 0 !== i.discsTotal ? `${s}/${i.discsTotal}` : s.toString(),
          ),
            r.add("DISC"));
          break;
        case "tracksTotal":
        case "discsTotal":
        case "images":
        case "raw":
          break;
        default:
          Fe(a);
      }
    if (i.raw)
      for (const a in i.raw) {
        const e = i.raw[a];
        null == e ||
          r.has(a) ||
          (("string" == typeof e || e instanceof Uint8Array) && t(a, e));
      }
    0 !== e.length &&
      (this.tagsElement = {
        id: Cr.Tags,
        data: [
          {
            id: Cr.Tag,
            data: [
              {
                id: Cr.Targets,
                data: [
                  { id: Cr.TargetTypeValue, data: 50 },
                  { id: Cr.TargetType, data: "MOVIE" },
                ],
              },
              ...e,
            ],
          },
        ],
      });
  }
  maybeCreateAttachments() {
    const e = this.output._metadataTags,
      t = [],
      i = new Set(),
      r = e.images ?? [];
    for (const a of r) {
      let e,
        r = a.name;
      if (void 0 === r) {
        r =
          ("coverFront" === a.kind
            ? "cover"
            : "coverBack" === a.kind
              ? "back"
              : "image") + (et(a.mimeType) ?? "");
      }
      for (;;) {
        e = 0n;
        for (let t = 0; t < 8; t++)
          ((e <<= 8n), (e |= BigInt(Math.floor(256 * Math.random()))));
        if (0n !== e && !i.has(e)) break;
      }
      (i.add(e),
        t.push({
          id: Cr.AttachedFile,
          data: [
            void 0 !== a.description
              ? { id: Cr.FileDescription, data: new Tr(a.description) }
              : null,
            { id: Cr.FileName, data: new Tr(r) },
            { id: Cr.FileMediaType, data: a.mimeType },
            { id: Cr.FileData, data: a.data },
            { id: Cr.FileUID, data: e },
          ],
        }));
    }
    for (const [a, s] of Object.entries(e.raw ?? {})) {
      if (!(s instanceof ot)) continue;
      /^\d+$/.test(a) &&
        (r.find((e) => e.mimeType === s.mimeType && rt(e.data, s.data)) ||
          t.push({
            id: Cr.AttachedFile,
            data: [
              void 0 !== s.description
                ? { id: Cr.FileDescription, data: new Tr(s.description) }
                : null,
              { id: Cr.FileName, data: new Tr(s.name ?? "") },
              { id: Cr.FileMediaType, data: s.mimeType ?? "" },
              { id: Cr.FileData, data: s.data },
              { id: Cr.FileUID, data: BigInt(a) },
            ],
          }));
    }
    0 !== t.length &&
      (this.attachmentsElement = { id: Cr.Attachments, data: t });
  }
  createSegment() {
    (this.createTracks(),
      this.maybeCreateTags(),
      this.maybeCreateAttachments(),
      this.maybeCreateSeekHead(!1));
    const e = {
      id: Cr.Segment,
      size: this.format._options.appendOnly ? -1 : 6,
      data: [
        this.seekHead,
        this.segmentInfo,
        this.tracksElement,
        this.attachmentsElement,
        this.tagsElement,
      ],
    };
    if (
      ((this.segment = e),
      this.format._options.onSegmentHeader && this.writer.startTrackingWrites(),
      this.ebmlWriter.writeEBML(e),
      this.format._options.onSegmentHeader)
    ) {
      const { data: e, start: t } = this.writer.stopTrackingWrites();
      this.format._options.onSegmentHeader(e, t);
    }
  }
  createCues() {
    this.cues = { id: Cr.Cues, data: [] };
  }
  get segmentDataOffset() {
    return (ie(this.segment), this.ebmlWriter.dataOffsets.get(this.segment));
  }
  allTracksAreKnown() {
    for (const e of this.output._tracks)
      if (!e.source._closed && !this.trackDatas.some((t) => t.track === e))
        return !1;
    return !0;
  }
  async getMimeType() {
    await this.allTracksKnown.promise;
    const e = this.trackDatas.map((e) => {
      if ("video" === e.type) return e.info.decoderConfig.codec;
      if ("audio" === e.type) return e.info.decoderConfig.codec;
      return { webvtt: "wvtt" }[e.track.source._codec];
    });
    return $r({
      isWebM: this.format instanceof zo,
      hasVideo: this.trackDatas.some((e) => "video" === e.type),
      hasAudio: this.trackDatas.some((e) => "audio" === e.type),
      codecStrings: e,
    });
  }
  getVideoTrackData(e, t, i) {
    const r = this.trackDatas.find((t) => t.track === e);
    if (r) return r;
    (Nt(i),
      ie(i),
      ie(i.decoderConfig),
      ie(void 0 !== i.decoderConfig.codedWidth),
      ie(void 0 !== i.decoderConfig.codedHeight));
    const a = {
      track: e,
      type: "video",
      info: {
        width: i.decoderConfig.codedWidth,
        height: i.decoderConfig.codedHeight,
        decoderConfig: i.decoderConfig,
        alphaMode: !!t.sideData.alpha,
      },
      chunkQueue: [],
      lastWrittenMsTimestamp: null,
    };
    return (
      "vp9" === e.source._codec
        ? (a.info.decoderConfig = {
            ...a.info.decoderConfig,
            description: new Uint8Array(Tt(a.info.decoderConfig.codec)),
          })
        : "av1" === e.source._codec &&
          (a.info.decoderConfig = {
            ...a.info.decoderConfig,
            description: new Uint8Array(Ct(a.info.decoderConfig.codec)),
          }),
      this.trackDatas.push(a),
      this.trackDatas.sort((e, t) => e.track.id - t.track.id),
      this.allTracksAreKnown() && this.allTracksKnown.resolve(),
      a
    );
  }
  getAudioTrackData(e, t) {
    const i = this.trackDatas.find((t) => t.track === e);
    if (i) return i;
    (Lt(t), ie(t), ie(t.decoderConfig));
    const r = {
      track: e,
      type: "audio",
      info: {
        numberOfChannels: t.decoderConfig.numberOfChannels,
        sampleRate: t.decoderConfig.sampleRate,
        decoderConfig: t.decoderConfig,
      },
      chunkQueue: [],
      lastWrittenMsTimestamp: null,
    };
    return (
      this.trackDatas.push(r),
      this.trackDatas.sort((e, t) => e.track.id - t.track.id),
      this.allTracksAreKnown() && this.allTracksKnown.resolve(),
      r
    );
  }
  getSubtitleTrackData(e, t) {
    const i = this.trackDatas.find((t) => t.track === e);
    if (i) return i;
    (Vt(t), ie(t), ie(t.config));
    const r = {
      track: e,
      type: "subtitle",
      info: { config: t.config },
      chunkQueue: [],
      lastWrittenMsTimestamp: null,
    };
    return (
      this.trackDatas.push(r),
      this.trackDatas.sort((e, t) => e.track.id - t.track.id),
      this.allTracksAreKnown() && this.allTracksKnown.resolve(),
      r
    );
  }
  async addEncodedVideoPacket(e, t, i) {
    const r = await this.mutex.acquire();
    try {
      const r = this.getVideoTrackData(e, t, i),
        a = "key" === t.type;
      let s = this.validateAndNormalizeTimestamp(r.track, t.timestamp, a),
        n = t.duration;
      void 0 !== e.metadata.frameRate &&
        ((s = Ne(s, 1 / e.metadata.frameRate)),
        (n = Ne(n, 1 / e.metadata.frameRate)));
      const o = r.info.alphaMode ? (t.sideData.alpha ?? null) : null,
        c = this.createInternalChunk(t.data, s, n, t.type, o);
      ("vp9" === e.source._codec && this.fixVP9ColorSpace(r, c),
        r.chunkQueue.push(c),
        await this.interleaveChunks());
    } finally {
      r();
    }
  }
  async addEncodedAudioPacket(e, t, i) {
    const r = await this.mutex.acquire();
    try {
      const r = this.getAudioTrackData(e, i),
        a = "key" === t.type,
        s = this.validateAndNormalizeTimestamp(r.track, t.timestamp, a),
        n = this.createInternalChunk(t.data, s, t.duration, t.type);
      (r.chunkQueue.push(n), await this.interleaveChunks());
    } finally {
      r();
    }
  }
  async addSubtitleCue(e, t, i) {
    const r = await this.mutex.acquire();
    try {
      const r = this.getSubtitleTrackData(e, i),
        a = this.validateAndNormalizeTimestamp(r.track, t.timestamp, !0);
      let s = t.text;
      const n = Math.round(1e3 * a);
      ((Ms.lastIndex = 0),
        (s = s.replace(Ms, (e) => {
          const t = ((e) => {
            const t = Ds.exec(e);
            if (!t) throw new Error("Expected match.");
            return (
              36e5 * Number(t[1] || "0") +
              6e4 * Number(t[2]) +
              1e3 * Number(t[3]) +
              Number(t[4])
            );
          })(e.slice(1, -1));
          return `<${Os(t - n)}>`;
        })));
      const o = ue.encode(s),
        c = `${t.settings ?? ""}\n${t.identifier ?? ""}\n${t.notes ?? ""}`,
        l = this.createInternalChunk(
          o,
          a,
          t.duration,
          "key",
          c.trim() ? ue.encode(c) : null,
        );
      (r.chunkQueue.push(l), await this.interleaveChunks());
    } finally {
      r();
    }
  }
  async interleaveChunks(e = !1) {
    if (e || this.allTracksAreKnown()) {
      e: for (;;) {
        let t = null,
          i = 1 / 0;
        for (const a of this.trackDatas) {
          if (!e && 0 === a.chunkQueue.length && !a.track.source._closed)
            break e;
          a.chunkQueue.length > 0 &&
            a.chunkQueue[0].timestamp < i &&
            ((t = a), (i = a.chunkQueue[0].timestamp));
        }
        if (!t) break;
        const r = t.chunkQueue.shift();
        this.writeBlock(t, r);
      }
      e || (await this.writer.flush());
    }
  }
  fixVP9ColorSpace(e, t) {
    if ("key" !== t.type) return;
    if (
      !e.info.decoderConfig.colorSpace ||
      !e.info.decoderConfig.colorSpace.matrix
    )
      return;
    const i = new ne(t.data);
    i.skipBits(2);
    const r = i.readBits(1),
      a = (i.readBits(1) << 1) + r;
    3 === a && i.skipBits(1);
    if (i.readBits(1)) return;
    if (0 !== i.readBits(1)) return;
    i.skipBits(2);
    if (4817730 !== i.readBits(24)) return;
    a >= 2 && i.skipBits(1);
    const s = { rgb: 7, bt709: 2, bt470bg: 1, smpte170m: 3 }[
      e.info.decoderConfig.colorSpace.matrix
    ];
    ((e, t, i, r) => {
      for (let a = t; a < i; a++) {
        const t = Math.floor(a / 8);
        let s = e[t];
        const n = 7 - (7 & a);
        ((s &= ~(1 << n)),
          (s |= ((r & (1 << (i - a - 1))) >> (i - a - 1)) << n),
          (e[t] = s));
      }
    })(t.data, i.pos, i.pos + 3, s);
  }
  createInternalChunk(e, t, i, r, a = null) {
    return { data: e, type: r, timestamp: t, duration: i, additions: a };
  }
  writeBlock(e, t) {
    this.segment || this.createSegment();
    const i = Math.round(1e3 * t.timestamp),
      r = this.trackDatas.every((i) => {
        if (e === i) return "key" === t.type;
        const r = i.chunkQueue[0];
        return r ? "key" === r.type : i.track.source._closed;
      });
    let a = !1;
    if (this.currentCluster) {
      (ie(null !== this.currentClusterStartMsTimestamp),
        ie(null !== this.currentClusterMaxMsTimestamp));
      const e = i - this.currentClusterStartMsTimestamp;
      a =
        (r &&
          i > this.currentClusterMaxMsTimestamp &&
          e >= 1e3 * (this.format._options.minimumClusterDuration ?? 1)) ||
        e > 32767;
    } else a = !0;
    a && this.createNewCluster(i);
    const s = i - this.currentClusterStartMsTimestamp;
    if (s < -32768) return;
    const n = new Uint8Array(4),
      o = new DataView(n.buffer);
    (o.setUint8(0, 128 | e.track.id), o.setInt16(1, s, !1));
    const c = Math.round(1e3 * t.duration);
    if (t.additions) {
      const r = {
        id: Cr.BlockGroup,
        data: [
          { id: Cr.Block, data: [n, t.data] },
          "delta" === t.type
            ? {
                id: Cr.ReferenceBlock,
                data: new br(e.lastWrittenMsTimestamp - i),
              }
            : null,
          t.additions
            ? {
                id: Cr.BlockAdditions,
                data: [
                  {
                    id: Cr.BlockMore,
                    data: [
                      { id: Cr.BlockAddID, data: 1 },
                      { id: Cr.BlockAdditional, data: t.additions },
                    ],
                  },
                ],
              }
            : null,
          c > 0 ? { id: Cr.BlockDuration, data: c } : null,
        ],
      };
      this.ebmlWriter.writeEBML(r);
    } else {
      o.setUint8(3, Number("key" === t.type) << 7);
      const e = { id: Cr.SimpleBlock, data: [n, t.data] };
      this.ebmlWriter.writeEBML(e);
    }
    ((this.duration = Math.max(this.duration, i + c)),
      (e.lastWrittenMsTimestamp = i),
      this.trackDatasInCurrentCluster.has(e) ||
        this.trackDatasInCurrentCluster.set(e, { firstMsTimestamp: i }),
      (this.currentClusterMaxMsTimestamp = Math.max(
        this.currentClusterMaxMsTimestamp,
        i,
      )));
  }
  createNewCluster(e) {
    (this.currentCluster && this.finalizeCurrentCluster(),
      this.format._options.onCluster && this.writer.startTrackingWrites(),
      (this.currentCluster = {
        id: Cr.Cluster,
        size: this.format._options.appendOnly ? -1 : 5,
        data: [{ id: Cr.Timestamp, data: e }],
      }),
      this.ebmlWriter.writeEBML(this.currentCluster),
      (this.currentClusterStartMsTimestamp = e),
      (this.currentClusterMaxMsTimestamp = e),
      this.trackDatasInCurrentCluster.clear());
  }
  finalizeCurrentCluster() {
    if ((ie(this.currentCluster), !this.format._options.appendOnly)) {
      const e =
          this.writer.getPos() -
          this.ebmlWriter.dataOffsets.get(this.currentCluster),
        t = this.writer.getPos();
      (this.writer.seek(this.ebmlWriter.offsets.get(this.currentCluster) + 4),
        this.ebmlWriter.writeVarInt(e, 5),
        this.writer.seek(t));
    }
    if (this.format._options.onCluster) {
      ie(null !== this.currentClusterStartMsTimestamp);
      const { data: e, start: t } = this.writer.stopTrackingWrites();
      this.format._options.onCluster(
        e,
        t,
        this.currentClusterStartMsTimestamp / 1e3,
      );
    }
    const e =
        this.ebmlWriter.offsets.get(this.currentCluster) -
        this.segmentDataOffset,
      t = new Map();
    for (const [r, { firstMsTimestamp: a }] of this.trackDatasInCurrentCluster)
      (t.has(a) || t.set(a, []), t.get(a).push(r));
    const i = [...t.entries()].sort((e, t) => e[0] - t[0]);
    for (const [r, a] of i)
      (ie(this.cues),
        this.cues.data.push({
          id: Cr.CuePoint,
          data: [
            { id: Cr.CueTime, data: r },
            ...a.map((t) => ({
              id: Cr.CueTrackPositions,
              data: [
                { id: Cr.CueTrack, data: t.track.id },
                { id: Cr.CueClusterPosition, data: e },
              ],
            })),
          ],
        }));
  }
  async onTrackClose() {
    const e = await this.mutex.acquire();
    (this.allTracksAreKnown() && this.allTracksKnown.resolve(),
      await this.interleaveChunks(),
      e());
  }
  async finalize() {
    const e = await this.mutex.acquire();
    if (
      (this.allTracksKnown.resolve(),
      this.segment || this.createSegment(),
      await this.interleaveChunks(!0),
      this.currentCluster && this.finalizeCurrentCluster(),
      ie(this.cues),
      this.ebmlWriter.writeEBML(this.cues),
      !this.format._options.appendOnly)
    ) {
      const e = this.writer.getPos(),
        t = this.writer.getPos() - this.segmentDataOffset;
      (this.writer.seek(this.ebmlWriter.offsets.get(this.segment) + 4),
        this.ebmlWriter.writeVarInt(t, 6),
        (this.segmentDuration.data = new wr(this.duration)),
        this.writer.seek(this.ebmlWriter.offsets.get(this.segmentDuration)),
        this.ebmlWriter.writeEBML(this.segmentDuration),
        ie(this.seekHead),
        this.writer.seek(this.ebmlWriter.offsets.get(this.seekHead)),
        this.maybeCreateSeekHead(!0),
        this.ebmlWriter.writeEBML(this.seekHead),
        this.writer.seek(e));
    }
    e();
  }
}
class Fo extends Wt {
  constructor(e, t) {
    (super(e),
      (this.trackDatas = []),
      (this.bosPagesWritten = !1),
      (this.allTracksKnown = Ie()),
      (this.pageBytes = new Uint8Array(65307)),
      (this.pageView = new DataView(this.pageBytes.buffer)),
      (this.format = t),
      (this.writer = e._writer),
      (this.writer.ensureMonotonicity = !0));
  }
  async start() {}
  async getMimeType() {
    return (
      await this.allTracksKnown.promise,
      wa({ codecStrings: this.trackDatas.map((e) => e.codecInfo.codec) })
    );
  }
  addEncodedVideoPacket() {
    throw new Error("Video tracks are not supported.");
  }
  getTrackData(e, t) {
    const i = this.trackDatas.find((t) => t.track === e);
    if (i) return i;
    let r;
    do {
      r = Math.floor(2 ** 32 * Math.random());
    } while (this.trackDatas.some((e) => e.serialNumber === r));
    (ie("vorbis" === e.source._codec || "opus" === e.source._codec),
      Lt(t),
      ie(t),
      ie(t.decoderConfig));
    const a = {
      track: e,
      serialNumber: r,
      internalSampleRate:
        "opus" === e.source._codec ? _t : t.decoderConfig.sampleRate,
      codecInfo: { codec: e.source._codec, vorbisInfo: null, opusInfo: null },
      vorbisLastBlocksize: null,
      packetQueue: [],
      currentTimestampInSamples: 0,
      pagesWritten: 0,
      currentGranulePosition: 0,
      currentLacingValues: [],
      currentPageData: [],
      currentPageSize: 27,
      currentPageStartsWithFreshPacket: !0,
    };
    return (
      this.queueHeaderPackets(a, t),
      this.trackDatas.push(a),
      this.allTracksAreKnown() && this.allTracksKnown.resolve(),
      a
    );
  }
  queueHeaderPackets(e, t) {
    if ((ie(t.decoderConfig), "vorbis" === e.track.source._codec)) {
      ie(t.decoderConfig.description);
      const i = le(t.decoderConfig.description);
      if (2 !== i[0])
        throw new TypeError(
          "First byte of Vorbis decoder description must be 2.",
        );
      let r = 1;
      const a = () => {
          let e = 0;
          for (;;) {
            const t = i[r++];
            if (void 0 === t)
              throw new TypeError("Vorbis decoder description is too short.");
            if (((e += t), t < 255)) return e;
          }
        },
        s = a(),
        n = a();
      if (i.length - r <= 0)
        throw new TypeError("Vorbis decoder description is too short.");
      const o = i.subarray(r, (r += s));
      r += n;
      const c = i.subarray(r),
        l = new Uint8Array(7);
      ((l[0] = 3),
        (l[1] = 118),
        (l[2] = 111),
        (l[3] = 114),
        (l[4] = 98),
        (l[5] = 105),
        (l[6] = 115));
      const h = gi(l, this.output._metadataTags);
      e.packetQueue.push(
        { data: o, endGranulePosition: 0, timestamp: 0, forcePageFlush: !0 },
        { data: h, endGranulePosition: 0, timestamp: 0, forcePageFlush: !1 },
        { data: c, endGranulePosition: 0, timestamp: 0, forcePageFlush: !0 },
      );
      const d = he(o).getUint8(28);
      e.codecInfo.vorbisInfo = {
        blocksizes: [1 << (15 & d), 1 << (d >> 4)],
        modeBlockflags: ui(c).modeBlockflags,
      };
    } else if ("opus" === e.track.source._codec) {
      if (!t.decoderConfig.description)
        throw new TypeError("For Ogg, Opus decoder description is required.");
      const i = le(t.decoderConfig.description),
        r = new Uint8Array(8),
        a = he(r);
      (a.setUint32(0, 1332770163, !1), a.setUint32(4, 1415669619, !1));
      const s = gi(r, this.output._metadataTags);
      (e.packetQueue.push(
        { data: i, endGranulePosition: 0, timestamp: 0, forcePageFlush: !0 },
        { data: s, endGranulePosition: 0, timestamp: 0, forcePageFlush: !0 },
      ),
        (e.codecInfo.opusInfo = { preSkip: hi(i).preSkip }));
    }
  }
  async addEncodedAudioPacket(e, t, i) {
    const r = await this.mutex.acquire();
    try {
      const r = this.getTrackData(e, i);
      this.validateAndNormalizeTimestamp(
        r.track,
        t.timestamp,
        "key" === t.type,
      );
      const a = r.currentTimestampInSamples,
        { durationInSamples: s, vorbisBlockSize: n } = ya(
          t.data,
          r.codecInfo,
          r.vorbisLastBlocksize,
        );
      ((r.currentTimestampInSamples += s),
        (r.vorbisLastBlocksize = n),
        r.packetQueue.push({
          data: t.data,
          endGranulePosition: r.currentTimestampInSamples,
          timestamp: a / r.internalSampleRate,
          forcePageFlush: !1,
        }),
        await this.interleavePages());
    } finally {
      r();
    }
  }
  addSubtitleCue() {
    throw new Error("Subtitle tracks are not supported.");
  }
  allTracksAreKnown() {
    for (const e of this.output._tracks)
      if (!e.source._closed && !this.trackDatas.some((t) => t.track === e))
        return !1;
    return !0;
  }
  async interleavePages(e = !1) {
    if (!this.bosPagesWritten) {
      if (!this.allTracksAreKnown()) return;
      for (const e of this.trackDatas)
        for (; e.packetQueue.length > 0; ) {
          const t = e.packetQueue.shift();
          if ((this.writePacket(e, t, !1), t.forcePageFlush)) break;
        }
      this.bosPagesWritten = !0;
    }
    e: for (;;) {
      let t = null,
        i = 1 / 0;
      for (const s of this.trackDatas) {
        if (!e && s.packetQueue.length <= 1 && !s.track.source._closed) break e;
        s.packetQueue.length > 0 &&
          s.packetQueue[0].timestamp < i &&
          ((t = s), (i = s.packetQueue[0].timestamp));
      }
      if (!t) break;
      const r = t.packetQueue.shift(),
        a = 0 === t.packetQueue.length;
      this.writePacket(t, r, a);
    }
    e || (await this.writer.flush());
  }
  writePacket(e, t, i) {
    let r = t.data.length,
      a = 0,
      s = 0;
    for (;;) {
      0 === e.currentLacingValues.length &&
        a > 0 &&
        (e.currentPageStartsWithFreshPacket = !1);
      const n = Math.min(255, r);
      (e.currentLacingValues.push(n), e.currentPageSize++, (s += n));
      const o = r < 255;
      if (255 === e.currentLacingValues.length) {
        const r = t.data.subarray(a, s);
        if (
          ((a = s),
          e.currentPageData.push(r),
          (e.currentPageSize += r.length),
          this.writePage(e, i && o),
          o)
        )
          return;
      }
      if (o) break;
      r -= 255;
    }
    const n = t.data.subarray(a);
    (e.currentPageData.push(n),
      (e.currentPageSize += n.length),
      (e.currentGranulePosition = t.endGranulePosition),
      (e.currentPageSize >= 8192 || t.forcePageFlush) && this.writePage(e, i));
  }
  writePage(e, t) {
    (this.pageView.setUint32(0, fa, !0), this.pageView.setUint8(4, 0));
    let i = 0;
    (e.currentPageStartsWithFreshPacket || (i |= 1),
      0 === e.pagesWritten && (i |= 2),
      t && (i |= 4),
      this.pageView.setUint8(5, i));
    const r = e.currentLacingValues.every((e) => 255 === e)
      ? -1
      : e.currentGranulePosition;
    (((e, t, i) => {
      (e.setUint32(t + 0, i, !0),
        e.setInt32(t + 4, Math.floor(i / 2 ** 32), !0));
    })(this.pageView, 6, r),
      this.pageView.setUint32(14, e.serialNumber, !0),
      this.pageView.setUint32(18, e.pagesWritten, !0),
      this.pageView.setUint32(22, 0, !0),
      this.pageView.setUint8(26, e.currentLacingValues.length),
      this.pageBytes.set(e.currentLacingValues, 27));
    let a = 27 + e.currentLacingValues.length;
    for (const o of e.currentPageData)
      (this.pageBytes.set(o, a), (a += o.length));
    const s = this.pageBytes.subarray(0, a),
      n = ka(s);
    if (
      (this.pageView.setUint32(22, n, !0),
      e.pagesWritten++,
      (e.currentLacingValues.length = 0),
      (e.currentPageData.length = 0),
      (e.currentPageSize = 27),
      (e.currentPageStartsWithFreshPacket = !0),
      this.format._options.onPage && this.writer.startTrackingWrites(),
      this.writer.write(s),
      this.format._options.onPage)
    ) {
      const { data: t, start: i } = this.writer.stopTrackingWrites();
      this.format._options.onPage(t, i, e.track.source);
    }
  }
  async onTrackClose() {
    const e = await this.mutex.acquire();
    (this.allTracksAreKnown() && this.allTracksKnown.resolve(),
      await this.interleavePages(),
      e());
  }
  async finalize() {
    const e = await this.mutex.acquire();
    (this.allTracksKnown.resolve(), await this.interleavePages(!0));
    for (const t of this.trackDatas)
      t.currentLacingValues.length > 0 && this.writePage(t, !0);
    e();
  }
}
let Bo = class {
  getSupportedVideoCodecs() {
    return this.getSupportedCodecs().filter((e) => lt.includes(e));
  }
  getSupportedAudioCodecs() {
    return this.getSupportedCodecs().filter((e) => ut.includes(e));
  }
  getSupportedSubtitleCodecs() {
    return this.getSupportedCodecs().filter((e) => mt.includes(e));
  }
  _codecUnsupportedHint(e) {
    return "";
  }
};
class Mo extends Bo {
  constructor(e = {}) {
    if (!e || "object" != typeof e)
      throw new TypeError("options must be an object.");
    if (
      void 0 !== e.fastStart &&
      ![!1, "in-memory", "reserve", "fragmented"].includes(e.fastStart)
    )
      throw new TypeError(
        "options.fastStart, when provided, must be false, 'in-memory', 'reserve', or 'fragmented'.",
      );
    if (
      void 0 !== e.minimumFragmentDuration &&
      (!Number.isFinite(e.minimumFragmentDuration) ||
        e.minimumFragmentDuration < 0)
    )
      throw new TypeError(
        "options.minimumFragmentDuration, when provided, must be a non-negative number.",
      );
    if (void 0 !== e.onFtyp && "function" != typeof e.onFtyp)
      throw new TypeError("options.onFtyp, when provided, must be a function.");
    if (void 0 !== e.onMoov && "function" != typeof e.onMoov)
      throw new TypeError("options.onMoov, when provided, must be a function.");
    if (void 0 !== e.onMdat && "function" != typeof e.onMdat)
      throw new TypeError("options.onMdat, when provided, must be a function.");
    if (void 0 !== e.onMoof && "function" != typeof e.onMoof)
      throw new TypeError("options.onMoof, when provided, must be a function.");
    if (
      void 0 !== e.metadataFormat &&
      !["mdir", "mdta", "udta", "auto"].includes(e.metadataFormat)
    )
      throw new TypeError(
        "options.metadataFormat, when provided, must be either 'auto', 'mdir', 'mdta', or 'udta'.",
      );
    (super(), (this._options = e));
  }
  getSupportedTrackCounts() {
    return {
      video: { min: 0, max: 1 / 0 },
      audio: { min: 0, max: 1 / 0 },
      subtitle: { min: 0, max: 1 / 0 },
      total: { min: 1, max: 2 ** 32 - 1 },
    };
  }
  get supportsVideoRotationMetadata() {
    return !0;
  }
  _createMuxer(e) {
    return new Eo(e, this);
  }
}
class Do extends Mo {
  constructor(e) {
    super(e);
  }
  get _name() {
    return "MP4";
  }
  get fileExtension() {
    return ".mp4";
  }
  get mimeType() {
    return "video/mp4";
  }
  getSupportedCodecs() {
    return [
      ...lt,
      ...dt,
      "pcm-s16",
      "pcm-s16be",
      "pcm-s24",
      "pcm-s24be",
      "pcm-s32",
      "pcm-s32be",
      "pcm-f32",
      "pcm-f32be",
      "pcm-f64",
      "pcm-f64be",
      ...mt,
    ];
  }
  _codecUnsupportedHint(e) {
    return new Oo().getSupportedCodecs().includes(e)
      ? " Switching to MOV will grant support for this codec."
      : "";
  }
}
class Oo extends Mo {
  constructor(e) {
    super(e);
  }
  get _name() {
    return "MOV";
  }
  get fileExtension() {
    return ".mov";
  }
  get mimeType() {
    return "video/quicktime";
  }
  getSupportedCodecs() {
    return [...lt, ...ut];
  }
  _codecUnsupportedHint(e) {
    return new Do().getSupportedCodecs().includes(e)
      ? " Switching to MP4 will grant support for this codec."
      : "";
  }
}
class Ro extends Bo {
  constructor(e = {}) {
    if (!e || "object" != typeof e)
      throw new TypeError("options must be an object.");
    if (void 0 !== e.appendOnly && "boolean" != typeof e.appendOnly)
      throw new TypeError(
        "options.appendOnly, when provided, must be a boolean.",
      );
    if (
      void 0 !== e.minimumClusterDuration &&
      (!Number.isFinite(e.minimumClusterDuration) ||
        e.minimumClusterDuration < 0)
    )
      throw new TypeError(
        "options.minimumClusterDuration, when provided, must be a non-negative number.",
      );
    if (void 0 !== e.onEbmlHeader && "function" != typeof e.onEbmlHeader)
      throw new TypeError(
        "options.onEbmlHeader, when provided, must be a function.",
      );
    if (void 0 !== e.onSegmentHeader && "function" != typeof e.onSegmentHeader)
      throw new TypeError(
        "options.onHeader, when provided, must be a function.",
      );
    if (void 0 !== e.onCluster && "function" != typeof e.onCluster)
      throw new TypeError(
        "options.onCluster, when provided, must be a function.",
      );
    (super(), (this._options = e));
  }
  _createMuxer(e) {
    return new Ao(e, this);
  }
  get _name() {
    return "Matroska";
  }
  getSupportedTrackCounts() {
    return {
      video: { min: 0, max: 1 / 0 },
      audio: { min: 0, max: 1 / 0 },
      subtitle: { min: 0, max: 1 / 0 },
      total: { min: 1, max: 127 },
    };
  }
  get fileExtension() {
    return ".mkv";
  }
  get mimeType() {
    return "video/x-matroska";
  }
  getSupportedCodecs() {
    return [
      ...lt,
      ...dt,
      ...ht.filter(
        (e) =>
          !["pcm-s8", "pcm-f32be", "pcm-f64be", "ulaw", "alaw"].includes(e),
      ),
      ...mt,
    ];
  }
  get supportsVideoRotationMetadata() {
    return !1;
  }
}
class zo extends Ro {
  constructor(e) {
    super(e);
  }
  getSupportedCodecs() {
    return [
      ...lt.filter((e) => ["vp8", "vp9", "av1"].includes(e)),
      ...ut.filter((e) => ["opus", "vorbis"].includes(e)),
      ...mt,
    ];
  }
  get _name() {
    return "WebM";
  }
  get fileExtension() {
    return ".webm";
  }
  get mimeType() {
    return "video/webm";
  }
  _codecUnsupportedHint(e) {
    return new Ro().getSupportedCodecs().includes(e)
      ? " Switching to MKV will grant support for this codec."
      : "";
  }
}
class No extends Bo {
  constructor(e = {}) {
    if (!e || "object" != typeof e)
      throw new TypeError("options must be an object.");
    if (void 0 !== e.onPage && "function" != typeof e.onPage)
      throw new TypeError("options.onPage, when provided, must be a function.");
    (super(), (this._options = e));
  }
  _createMuxer(e) {
    return new Fo(e, this);
  }
  get _name() {
    return "Ogg";
  }
  getSupportedTrackCounts() {
    return {
      video: { min: 0, max: 0 },
      audio: { min: 0, max: 1 / 0 },
      subtitle: { min: 0, max: 0 },
      total: { min: 1, max: 2 ** 32 },
    };
  }
  get fileExtension() {
    return ".ogg";
  }
  get mimeType() {
    return "application/ogg";
  }
  getSupportedCodecs() {
    return [...ut.filter((e) => ["vorbis", "opus"].includes(e))];
  }
  get supportsVideoRotationMetadata() {
    return !1;
  }
}
const Uo = (e, t) => {
    if (!t || "object" != typeof t)
      throw new TypeError("Encoding options must be an object.");
    if (void 0 !== t.alpha && !["discard", "keep"].includes(t.alpha))
      throw new TypeError(
        "options.alpha, when provided, must be 'discard' or 'keep'.",
      );
    if (
      void 0 !== t.bitrateMode &&
      !["constant", "variable"].includes(t.bitrateMode)
    )
      throw new TypeError(
        "bitrateMode, when provided, must be 'constant' or 'variable'.",
      );
    if (
      void 0 !== t.latencyMode &&
      !["quality", "realtime"].includes(t.latencyMode)
    )
      throw new TypeError(
        "latencyMode, when provided, must be 'quality' or 'realtime'.",
      );
    if (void 0 !== t.fullCodecString && "string" != typeof t.fullCodecString)
      throw new TypeError("fullCodecString, when provided, must be a string.");
    if (void 0 !== t.fullCodecString && Bt(t.fullCodecString) !== e)
      throw new TypeError(
        `fullCodecString, when provided, must be a string that matches the specified codec (${e}).`,
      );
    if (
      void 0 !== t.hardwareAcceleration &&
      !["no-preference", "prefer-hardware", "prefer-software"].includes(
        t.hardwareAcceleration,
      )
    )
      throw new TypeError(
        "hardwareAcceleration, when provided, must be 'no-preference', 'prefer-hardware' or 'prefer-software'.",
      );
    if (void 0 !== t.scalabilityMode && "string" != typeof t.scalabilityMode)
      throw new TypeError("scalabilityMode, when provided, must be a string.");
    if (void 0 !== t.contentHint && "string" != typeof t.contentHint)
      throw new TypeError("contentHint, when provided, must be a string.");
  },
  Lo = (e) => {
    const t =
      e.bitrate instanceof Ho
        ? e.bitrate._toVideoBitrate(e.codec, e.width, e.height)
        : e.bitrate;
    return {
      codec: e.fullCodecString ?? bt(e.codec, e.width, e.height, t),
      width: e.width,
      height: e.height,
      bitrate: t,
      bitrateMode: e.bitrateMode,
      alpha: e.alpha ?? "discard",
      framerate: e.framerate,
      latencyMode: e.latencyMode,
      hardwareAcceleration: e.hardwareAcceleration,
      scalabilityMode: e.scalabilityMode,
      contentHint: e.contentHint,
      ...((i = e.codec),
      "avc" === i
        ? { avc: { format: "avc" } }
        : "hevc" === i
          ? { hevc: { format: "hevc" } }
          : {}),
    };
    var i;
  },
  Vo = (e, t) => {
    if (!t || "object" != typeof t)
      throw new TypeError("Encoding options must be an object.");
    if (
      void 0 !== t.bitrateMode &&
      !["constant", "variable"].includes(t.bitrateMode)
    )
      throw new TypeError(
        "bitrateMode, when provided, must be 'constant' or 'variable'.",
      );
    if (void 0 !== t.fullCodecString && "string" != typeof t.fullCodecString)
      throw new TypeError("fullCodecString, when provided, must be a string.");
    if (void 0 !== t.fullCodecString && Bt(t.fullCodecString) !== e)
      throw new TypeError(
        `fullCodecString, when provided, must be a string that matches the specified codec (${e}).`,
      );
  },
  Wo = (e) => {
    const t =
      e.bitrate instanceof Ho ? e.bitrate._toAudioBitrate(e.codec) : e.bitrate;
    return {
      codec: e.fullCodecString ?? vt(e.codec, e.numberOfChannels, e.sampleRate),
      numberOfChannels: e.numberOfChannels,
      sampleRate: e.sampleRate,
      bitrate: t,
      bitrateMode: e.bitrateMode,
      ...((i = e.codec),
      "aac" === i
        ? { aac: { format: "aac" } }
        : "opus" === i
          ? { opus: { format: "opus" } }
          : {}),
    };
    var i;
  };
class Ho {
  constructor(e) {
    this._factor = e;
  }
  _toVideoBitrate(e, t, i) {
    const r = t * i,
      a =
        3e6 *
        Math.pow(r / 2073600, 0.95) *
        { avc: 1, hevc: 0.6, vp9: 0.6, av1: 0.4, vp8: 1.2 }[e] *
        this._factor;
    return 1e3 * Math.ceil(a / 1e3);
  }
  _toAudioBitrate(e) {
    if (ht.includes(e) || "flac" === e) return;
    const t = { aac: 128e3, opus: 64e3, mp3: 16e4, vorbis: 64e3 }[e];
    if (!t) throw new Error(`Unhandled codec: ${e}`);
    let i = t * this._factor;
    if ("aac" === e) {
      i = [96e3, 128e3, 16e4, 192e3].reduce((e, t) =>
        Math.abs(t - i) < Math.abs(e - i) ? t : e,
      );
    } else if ("opus" === e || "vorbis" === e) i = Math.max(6e3, i);
    else if ("mp3" === e) {
      i = [
        8e3, 16e3, 24e3, 32e3, 4e4, 48e3, 64e3, 8e4, 96e3, 112e3, 128e3, 16e4,
        192e3, 224e3, 256e3, 32e4,
      ].reduce((e, t) => (Math.abs(t - i) < Math.abs(e - i) ? t : e));
    }
    return 1e3 * Math.round(i / 1e3);
  }
}
const $o = async (e, t = {}) => {
    const { width: i = 1280, height: r = 720, bitrate: a = 1e6, ...s } = t;
    if (!lt.includes(e)) return !1;
    if (!Number.isInteger(i) || i <= 0)
      throw new TypeError("width must be a positive integer.");
    if (!Number.isInteger(r) || r <= 0)
      throw new TypeError("height must be a positive integer.");
    if (!(a instanceof Ho) && (!Number.isInteger(a) || a <= 0))
      throw new TypeError("bitrate must be a positive integer or a quality.");
    Uo(e, s);
    let n = null;
    if (
      bi.length > 0 &&
      ((n ??= Lo({
        codec: e,
        width: i,
        height: r,
        bitrate: a,
        framerate: void 0,
        ...s,
      })),
      bi.some((t) => t.supports(e, n)))
    )
      return !0;
    if ("undefined" == typeof VideoEncoder) return !1;
    if ((i % 2 == 1 || r % 2 == 1) && ("avc" === e || "hevc" === e)) return !1;
    n ??= Lo({
      codec: e,
      width: i,
      height: r,
      bitrate: a,
      framerate: void 0,
      ...s,
      alpha: "discard",
    });
    return !0 === (await VideoEncoder.isConfigSupported(n)).supported;
  },
  jo = async (e, t = {}) => {
    const {
      numberOfChannels: i = 2,
      sampleRate: r = 48e3,
      bitrate: a = 128e3,
      ...s
    } = t;
    if (!ut.includes(e)) return !1;
    if (!Number.isInteger(i) || i <= 0)
      throw new TypeError("numberOfChannels must be a positive integer.");
    if (!Number.isInteger(r) || r <= 0)
      throw new TypeError("sampleRate must be a positive integer.");
    if (!(a instanceof Ho) && (!Number.isInteger(a) || a <= 0))
      throw new TypeError("bitrate must be a positive integer.");
    Vo(e, s);
    let n = null;
    if (
      Ti.length > 0 &&
      ((n ??= Wo({
        codec: e,
        numberOfChannels: i,
        sampleRate: r,
        bitrate: a,
        ...s,
      })),
      Ti.some((t) => t.supports(e, n)))
    )
      return !0;
    if (ht.includes(e)) return !0;
    if ("undefined" == typeof AudioEncoder) return !1;
    n ??= Wo({
      codec: e,
      numberOfChannels: i,
      sampleRate: r,
      bitrate: a,
      ...s,
    });
    return !0 === (await AudioEncoder.isConfigSupported(n)).supported;
  },
  qo = async (e) => !!mt.includes(e);
class Ko {
  constructor() {
    ((this._connectedTrack = null),
      (this._closingPromise = null),
      (this._closed = !1),
      (this._timestampOffset = 0));
  }
  _ensureValidAdd() {
    if (!this._connectedTrack)
      throw new Error("Source is not connected to an output track.");
    if ("canceled" === this._connectedTrack.output.state)
      throw new Error("Output has been canceled.");
    if (
      "finalizing" === this._connectedTrack.output.state ||
      "finalized" === this._connectedTrack.output.state
    )
      throw new Error("Output has been finalized.");
    if ("pending" === this._connectedTrack.output.state)
      throw new Error("Output has not started.");
    if (this._closed) throw new Error("Source is closed.");
  }
  async _start() {}
  async _flushAndClose(e) {}
  close() {
    if (this._closingPromise) return;
    const e = this._connectedTrack;
    if (!e)
      throw new Error(
        "Cannot call close without connecting the source to an output track.",
      );
    if ("pending" === e.output.state)
      throw new Error("Cannot call close before output has been started.");
    this._closingPromise = (async () => {
      (await this._flushAndClose(!1),
        (this._closed = !0),
        "finalizing" !== e.output.state &&
          "finalized" !== e.output.state &&
          e.output._muxer.onTrackClose(e));
    })();
  }
  async _flushOrWaitForOngoingClose(e) {
    return this._closingPromise ? this._closingPromise : this._flushAndClose(e);
  }
}
let Qo = class extends Ko {
  constructor(e) {
    if ((super(), (this._connectedTrack = null), !lt.includes(e)))
      throw new TypeError(
        `Invalid video codec '${e}'. Must be one of: ${lt.join(", ")}.`,
      );
    this._codec = e;
  }
};
class Xo {
  constructor(e, t) {
    ((this.source = e),
      (this.encodingConfig = t),
      (this.ensureEncoderPromise = null),
      (this.encoderInitialized = !1),
      (this.encoder = null),
      (this.muxer = null),
      (this.lastMultipleOfKeyFrameInterval = -1),
      (this.codedWidth = null),
      (this.codedHeight = null),
      (this.resizeCanvas = null),
      (this.customEncoder = null),
      (this.customEncoderCallSerializer = new je()),
      (this.customEncoderQueueSize = 0),
      (this.alphaEncoder = null),
      (this.splitter = null),
      (this.splitterCreationFailed = !1),
      (this.alphaFrameQueue = []),
      (this.error = null),
      (this.errorNeedsNewStack = !0));
  }
  async add(e, t, i) {
    try {
      if (
        (this.checkForEncoderError(),
        this.source._ensureValidAdd(),
        null !== this.codedWidth && null !== this.codedHeight)
      ) {
        if (
          e.codedWidth !== this.codedWidth ||
          e.codedHeight !== this.codedHeight
        ) {
          const i = this.encodingConfig.sizeChangeBehavior ?? "deny";
          if ("passThrough" === i);
          else {
            if ("deny" === i)
              throw new Error(
                `Video sample size must remain constant. Expected ${this.codedWidth}x${this.codedHeight}, got ${e.codedWidth}x${e.codedHeight}. To allow the sample size to change over time, set \`sizeChangeBehavior\` to a value other than 'strict' in the encoding options.`,
              );
            {
              let r = !1;
              this.resizeCanvas ||
                ("undefined" != typeof document
                  ? ((this.resizeCanvas = document.createElement("canvas")),
                    (this.resizeCanvas.width = this.codedWidth),
                    (this.resizeCanvas.height = this.codedHeight))
                  : (this.resizeCanvas = new OffscreenCanvas(
                      this.codedWidth,
                      this.codedHeight,
                    )),
                (r = !0));
              const a = this.resizeCanvas.getContext("2d", { alpha: Xe() });
              (ie(a),
                r ||
                  (Xe()
                    ? ((a.fillStyle = "black"),
                      a.fillRect(0, 0, this.codedWidth, this.codedHeight))
                    : a.clearRect(0, 0, this.codedWidth, this.codedHeight)),
                e.drawWithFit(a, { fit: i }),
                t && e.close(),
                (e = new vi(this.resizeCanvas, {
                  timestamp: e.timestamp,
                  duration: e.duration,
                  rotation: e.rotation,
                })),
                (t = !0));
            }
          }
        }
      } else
        ((this.codedWidth = e.codedWidth), (this.codedHeight = e.codedHeight));
      (this.encoderInitialized ||
        (this.ensureEncoderPromise || this.ensureEncoder(e),
        this.encoderInitialized || (await this.ensureEncoderPromise)),
        ie(this.encoderInitialized));
      const a = this.encodingConfig.keyFrameInterval ?? 5,
        s = Math.floor(e.timestamp / a),
        n = {
          ...i,
          keyFrame:
            i?.keyFrame || 0 === a || s !== this.lastMultipleOfKeyFrameInterval,
        };
      if (((this.lastMultipleOfKeyFrameInterval = s), this.customEncoder)) {
        this.customEncoderQueueSize++;
        const t = e.clone(),
          i = this.customEncoderCallSerializer
            .call(() => this.customEncoder.encode(t, n))
            .then(() => this.customEncoderQueueSize--)
            .catch((e) => (this.error ??= e))
            .finally(() => {
              t.close();
            });
        this.customEncoderQueueSize >= 4 && (await i);
      } else {
        ie(this.encoder);
        const i = e.toVideoFrame();
        if (this.alphaEncoder) {
          if (
            (!!i.format && !i.format.includes("A")) ||
            this.splitterCreationFailed
          )
            (this.alphaFrameQueue.push(null),
              this.encoder.encode(i, n),
              i.close());
          else {
            const e = i.displayWidth,
              t = i.displayHeight;
            if (!this.splitter)
              try {
                this.splitter = new Go(e, t);
              } catch (r) {
                (console.error(
                  "Due to an error, only color data will be encoded.",
                  r,
                ),
                  (this.splitterCreationFailed = !0),
                  this.alphaFrameQueue.push(null),
                  this.encoder.encode(i, n),
                  i.close());
              }
            if (this.splitter) {
              const e = this.splitter.extractColor(i),
                t = this.splitter.extractAlpha(i);
              (this.alphaFrameQueue.push(t),
                this.encoder.encode(e, n),
                e.close(),
                i.close());
            }
          }
        } else (this.encoder.encode(i, n), i.close());
        (t && e.close(),
          this.encoder.encodeQueueSize >= 4 &&
            (await new Promise((e) =>
              this.encoder.addEventListener("dequeue", e, { once: !0 }),
            )));
      }
      await this.muxer.mutex.currentPromise;
    } finally {
      t && e.close();
    }
  }
  ensureEncoder(e) {
    const t = new Error();
    this.ensureEncoderPromise = (async () => {
      const i = Lo({
        width: e.codedWidth,
        height: e.codedHeight,
        ...this.encodingConfig,
        framerate: this.source._connectedTrack?.metadata.frameRate,
      });
      this.encodingConfig.onEncoderConfig?.(i);
      const r = bi.find((e) => e.supports(this.encodingConfig.codec, i));
      if (r)
        ((this.customEncoder = new r()),
          (this.customEncoder.codec = this.encodingConfig.codec),
          (this.customEncoder.config = i),
          (this.customEncoder.onPacket = (e, t) => {
            if (!(e instanceof Si))
              throw new TypeError(
                "The first argument passed to onPacket must be an EncodedPacket.",
              );
            if (void 0 !== t && (!t || "object" != typeof t))
              throw new TypeError(
                "The second argument passed to onPacket must be an object or undefined.",
              );
            (this.encodingConfig.onEncodedPacket?.(e, t),
              this.muxer
                .addEncodedVideoPacket(this.source._connectedTrack, e, t)
                .catch((e) => {
                  ((this.error ??= e), (this.errorNeedsNewStack = !1));
                }));
          }),
          await this.customEncoder.init());
      else {
        if ("undefined" == typeof VideoEncoder)
          throw new Error("VideoEncoder is not supported by this browser.");
        ((i.alpha = "discard"),
          "keep" === this.encodingConfig.alpha && (i.latencyMode = "quality"));
        if (
          (i.width % 2 == 1 || i.height % 2 == 1) &&
          ("avc" === this.encodingConfig.codec ||
            "hevc" === this.encodingConfig.codec)
        )
          throw new Error(
            `The dimensions ${i.width}x${i.height} are not supported for codec '${this.encodingConfig.codec}'; both width and height must be even numbers. Make sure to round your dimensions to the nearest even number.`,
          );
        if (!(await VideoEncoder.isConfigSupported(i)).supported)
          throw new Error(
            `This specific encoder configuration (${i.codec}, ${i.bitrate} bps, ${i.width}x${i.height}, hardware acceleration: ${i.hardwareAcceleration ?? "no-preference"}) is not supported by this browser. Consider using another codec or changing your video parameters.`,
          );
        const e = [],
          r = [];
        let a = 0,
          s = 0;
        const n = (e, t, i) => {
          const r = {};
          if (t) {
            const e = new Uint8Array(t.byteLength);
            (t.copyTo(e), (r.alpha = e));
          }
          const a = Si.fromEncodedChunk(e, r);
          (this.encodingConfig.onEncodedPacket?.(a, i),
            this.muxer
              .addEncodedVideoPacket(this.source._connectedTrack, a, i)
              .catch((e) => {
                ((this.error ??= e), (this.errorNeedsNewStack = !1));
              }));
        };
        ((this.encoder = new VideoEncoder({
          output: (t, i) => {
            if (!this.alphaEncoder) return void n(t, null, i);
            const o = this.alphaFrameQueue.shift();
            (ie(void 0 !== o),
              o
                ? (this.alphaEncoder.encode(o, { keyFrame: "key" === t.type }),
                  s++,
                  o.close(),
                  e.push({ chunk: t, meta: i }))
                : 0 === s
                  ? n(t, null, i)
                  : (r.push(a + s), e.push({ chunk: t, meta: i })));
          },
          error: (e) => {
            ((e.stack = t.stack), (this.error ??= e));
          },
        })),
          this.encoder.configure(i),
          "keep" === this.encodingConfig.alpha &&
            ((this.alphaEncoder = new VideoEncoder({
              output: (t, i) => {
                s--;
                const o = e.shift();
                for (
                  ie(void 0 !== o), n(o.chunk, t, o.meta), a++;
                  r.length > 0 && r[0] === a;

                ) {
                  r.shift();
                  const t = e.shift();
                  (ie(void 0 !== t), n(t.chunk, null, t.meta));
                }
              },
              error: (e) => {
                ((e.stack = t.stack), (this.error ??= e));
              },
            })),
            this.alphaEncoder.configure(i)));
      }
      (ie(this.source._connectedTrack),
        (this.muxer = this.source._connectedTrack.output._muxer),
        (this.encoderInitialized = !0));
    })();
  }
  async flushAndClose(e) {
    (e || this.checkForEncoderError(),
      this.customEncoder
        ? (e ||
            this.customEncoderCallSerializer.call(() =>
              this.customEncoder.flush(),
            ),
          await this.customEncoderCallSerializer.call(() =>
            this.customEncoder.close(),
          ))
        : this.encoder &&
          (e || (await this.encoder.flush(), await this.alphaEncoder?.flush()),
          "closed" !== this.encoder.state && this.encoder.close(),
          this.alphaEncoder &&
            "closed" !== this.alphaEncoder.state &&
            this.alphaEncoder.close(),
          this.alphaFrameQueue.forEach((e) => e?.close()),
          this.splitter?.close()),
      e || this.checkForEncoderError());
  }
  getQueueSize() {
    return this.customEncoder
      ? this.customEncoderQueueSize
      : (this.encoder?.encodeQueueSize ?? 0);
  }
  checkForEncoderError() {
    if (this.error)
      throw (
        this.errorNeedsNewStack && (this.error.stack = new Error().stack),
        this.error
      );
  }
}
class Go {
  constructor(e, t) {
    ((this.lastFrame = null),
      "undefined" != typeof OffscreenCanvas
        ? (this.canvas = new OffscreenCanvas(e, t))
        : ((this.canvas = document.createElement("canvas")),
          (this.canvas.width = e),
          (this.canvas.height = t)));
    const i = this.canvas.getContext("webgl2", { alpha: !0 });
    if (!i) throw new Error("Couldn't acquire WebGL 2 context.");
    ((this.gl = i),
      (this.colorProgram = this.createColorProgram()),
      (this.alphaProgram = this.createAlphaProgram()),
      (this.vao = this.createVAO()),
      (this.sourceTexture = this.createTexture()),
      (this.alphaResolutionLocation = this.gl.getUniformLocation(
        this.alphaProgram,
        "u_resolution",
      )),
      this.gl.useProgram(this.colorProgram),
      this.gl.uniform1i(
        this.gl.getUniformLocation(this.colorProgram, "u_sourceTexture"),
        0,
      ),
      this.gl.useProgram(this.alphaProgram),
      this.gl.uniform1i(
        this.gl.getUniformLocation(this.alphaProgram, "u_sourceTexture"),
        0,
      ));
  }
  createVertexShader() {
    return this.createShader(
      this.gl.VERTEX_SHADER,
      "#version 300 es\n\t\t\tin vec2 a_position;\n\t\t\tin vec2 a_texCoord;\n\t\t\tout vec2 v_texCoord;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tgl_Position = vec4(a_position, 0.0, 1.0);\n\t\t\t\tv_texCoord = a_texCoord;\n\t\t\t}\n\t\t",
    );
  }
  createColorProgram() {
    const e = this.createVertexShader(),
      t = this.createShader(
        this.gl.FRAGMENT_SHADER,
        "#version 300 es\n\t\t\tprecision highp float;\n\t\t\t\n\t\t\tuniform sampler2D u_sourceTexture;\n\t\t\tin vec2 v_texCoord;\n\t\t\tout vec4 fragColor;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tvec4 source = texture(u_sourceTexture, v_texCoord);\n\t\t\t\tfragColor = vec4(source.rgb, 1.0);\n\t\t\t}\n\t\t",
      ),
      i = this.gl.createProgram();
    return (
      this.gl.attachShader(i, e),
      this.gl.attachShader(i, t),
      this.gl.linkProgram(i),
      i
    );
  }
  createAlphaProgram() {
    const e = this.createVertexShader(),
      t = this.createShader(
        this.gl.FRAGMENT_SHADER,
        "#version 300 es\n\t\t\tprecision highp float;\n\t\t\t\n\t\t\tuniform sampler2D u_sourceTexture;\n\t\t\tuniform vec2 u_resolution; // The width and height of the canvas\n\t\t\tin vec2 v_texCoord;\n\t\t\tout vec4 fragColor;\n\n\t\t\t// This function determines the value for a single byte in the YUV stream\n\t\t\tfloat getByteValue(float byteOffset) {\n\t\t\t\tfloat width = u_resolution.x;\n\t\t\t\tfloat height = u_resolution.y;\n\n\t\t\t\tfloat yPlaneSize = width * height;\n\n\t\t\t\tif (byteOffset < yPlaneSize) {\n\t\t\t\t\t// This byte is in the luma plane. Find the corresponding pixel coordinates to sample from\n\t\t\t\t\tfloat y = floor(byteOffset / width);\n\t\t\t\t\tfloat x = mod(byteOffset, width);\n\t\t\t\t\t\n\t\t\t\t\t// Add 0.5 to sample the center of the texel\n\t\t\t\t\tvec2 sampleCoord = (vec2(x, y) + 0.5) / u_resolution;\n\t\t\t\t\t\n\t\t\t\t\t// The luma value is the alpha from the source texture\n\t\t\t\t\treturn texture(u_sourceTexture, sampleCoord).a;\n\t\t\t\t} else {\n\t\t\t\t\t// Write a fixed value for chroma and beyond\n\t\t\t\t\treturn 128.0 / 255.0;\n\t\t\t\t}\n\t\t\t}\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\t// Each fragment writes 4 bytes (R, G, B, A)\n\t\t\t\tfloat pixelIndex = floor(gl_FragCoord.y) * u_resolution.x + floor(gl_FragCoord.x);\n\t\t\t\tfloat baseByteOffset = pixelIndex * 4.0;\n\n\t\t\t\tvec4 result;\n\t\t\t\tfor (int i = 0; i < 4; i++) {\n\t\t\t\t\tfloat currentByteOffset = baseByteOffset + float(i);\n\t\t\t\t\tresult[i] = getByteValue(currentByteOffset);\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\tfragColor = result;\n\t\t\t}\n\t\t",
      ),
      i = this.gl.createProgram();
    return (
      this.gl.attachShader(i, e),
      this.gl.attachShader(i, t),
      this.gl.linkProgram(i),
      i
    );
  }
  createShader(e, t) {
    const i = this.gl.createShader(e);
    return (
      this.gl.shaderSource(i, t),
      this.gl.compileShader(i),
      this.gl.getShaderParameter(i, this.gl.COMPILE_STATUS) ||
        console.error("Shader compile error:", this.gl.getShaderInfoLog(i)),
      i
    );
  }
  createVAO() {
    const e = this.gl.createVertexArray();
    this.gl.bindVertexArray(e);
    const t = new Float32Array([
        -1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, 1, 1, 1, 0,
      ]),
      i = this.gl.createBuffer();
    (this.gl.bindBuffer(this.gl.ARRAY_BUFFER, i),
      this.gl.bufferData(this.gl.ARRAY_BUFFER, t, this.gl.STATIC_DRAW));
    const r = this.gl.getAttribLocation(this.colorProgram, "a_position"),
      a = this.gl.getAttribLocation(this.colorProgram, "a_texCoord");
    return (
      this.gl.enableVertexAttribArray(r),
      this.gl.vertexAttribPointer(r, 2, this.gl.FLOAT, !1, 16, 0),
      this.gl.enableVertexAttribArray(a),
      this.gl.vertexAttribPointer(a, 2, this.gl.FLOAT, !1, 16, 8),
      e
    );
  }
  createTexture() {
    const e = this.gl.createTexture();
    return (
      this.gl.bindTexture(this.gl.TEXTURE_2D, e),
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_S,
        this.gl.CLAMP_TO_EDGE,
      ),
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_T,
        this.gl.CLAMP_TO_EDGE,
      ),
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER,
        this.gl.LINEAR,
      ),
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MAG_FILTER,
        this.gl.LINEAR,
      ),
      e
    );
  }
  updateTexture(e) {
    this.lastFrame !== e &&
      ((e.displayWidth === this.canvas.width &&
        e.displayHeight === this.canvas.height) ||
        ((this.canvas.width = e.displayWidth),
        (this.canvas.height = e.displayHeight)),
      this.gl.activeTexture(this.gl.TEXTURE0),
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.sourceTexture),
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        e,
      ),
      (this.lastFrame = e));
  }
  extractColor(e) {
    return (
      this.updateTexture(e),
      this.gl.useProgram(this.colorProgram),
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height),
      this.gl.clear(this.gl.COLOR_BUFFER_BIT),
      this.gl.bindVertexArray(this.vao),
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4),
      new VideoFrame(this.canvas, {
        timestamp: e.timestamp,
        duration: e.duration ?? void 0,
        alpha: "discard",
      })
    );
  }
  extractAlpha(e) {
    (this.updateTexture(e),
      this.gl.useProgram(this.alphaProgram),
      this.gl.uniform2f(
        this.alphaResolutionLocation,
        this.canvas.width,
        this.canvas.height,
      ),
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height),
      this.gl.clear(this.gl.COLOR_BUFFER_BIT),
      this.gl.bindVertexArray(this.vao),
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4));
    const { width: t, height: i } = this.canvas,
      r = t * i + 2 * (Math.ceil(t / 2) * Math.ceil(i / 2)),
      a = Math.ceil(r / (4 * t));
    let s = new Uint8Array(4 * t * a);
    (this.gl.readPixels(0, 0, t, a, this.gl.RGBA, this.gl.UNSIGNED_BYTE, s),
      (s = s.subarray(0, r)),
      ie(128 === s[t * i]),
      ie(128 === s[s.length - 1]));
    const n = {
      format: "I420",
      codedWidth: t,
      codedHeight: i,
      timestamp: e.timestamp,
      duration: e.duration ?? void 0,
      transfer: [s.buffer],
    };
    return new VideoFrame(s, n);
  }
  close() {
    (this.gl.getExtension("WEBGL_lose_context")?.loseContext(),
      (this.gl = null));
  }
}
class Yo extends Qo {
  constructor(e, t) {
    if (
      !(
        ("undefined" != typeof HTMLCanvasElement &&
          e instanceof HTMLCanvasElement) ||
        ("undefined" != typeof OffscreenCanvas && e instanceof OffscreenCanvas)
      )
    )
      throw new TypeError(
        "canvas must be an HTMLCanvasElement or OffscreenCanvas.",
      );
    (((e) => {
      if (!e || "object" != typeof e)
        throw new TypeError("Encoding config must be an object.");
      if (!lt.includes(e.codec))
        throw new TypeError(
          `Invalid video codec '${e.codec}'. Must be one of: ${lt.join(", ")}.`,
        );
      if (
        !(e.bitrate instanceof Ho) &&
        (!Number.isInteger(e.bitrate) || e.bitrate <= 0)
      )
        throw new TypeError(
          "config.bitrate must be a positive integer or a quality.",
        );
      if (
        void 0 !== e.keyFrameInterval &&
        (!Number.isFinite(e.keyFrameInterval) || e.keyFrameInterval < 0)
      )
        throw new TypeError(
          "config.keyFrameInterval, when provided, must be a non-negative number.",
        );
      if (
        void 0 !== e.sizeChangeBehavior &&
        !["deny", "passThrough", "fill", "contain", "cover"].includes(
          e.sizeChangeBehavior,
        )
      )
        throw new TypeError(
          "config.sizeChangeBehavior, when provided, must be 'deny', 'passThrough', 'fill', 'contain' or 'cover'.",
        );
      if (
        void 0 !== e.onEncodedPacket &&
        "function" != typeof e.onEncodedPacket
      )
        throw new TypeError(
          "config.onEncodedChunk, when provided, must be a function.",
        );
      if (
        void 0 !== e.onEncoderConfig &&
        "function" != typeof e.onEncoderConfig
      )
        throw new TypeError(
          "config.onEncoderConfig, when provided, must be a function.",
        );
      Uo(e.codec, e);
    })(t),
      super(t.codec),
      (this._encoder = new Xo(this, t)),
      (this._canvas = e));
  }
  add(e, t = 0, i) {
    if (!Number.isFinite(e) || e < 0)
      throw new TypeError("timestamp must be a non-negative number.");
    if (!Number.isFinite(t) || t < 0)
      throw new TypeError("duration must be a non-negative number.");
    const r = new vi(this._canvas, { timestamp: e, duration: t });
    return this._encoder.add(r, !0, i);
  }
  _flushAndClose(e) {
    return this._encoder.flushAndClose(e);
  }
}
let Jo = class extends Ko {
  constructor(e) {
    if ((super(), (this._connectedTrack = null), !ut.includes(e)))
      throw new TypeError(
        `Invalid audio codec '${e}'. Must be one of: ${ut.join(", ")}.`,
      );
    this._codec = e;
  }
};
class Zo {
  constructor(e, t) {
    ((this.source = e),
      (this.encodingConfig = t),
      (this.ensureEncoderPromise = null),
      (this.encoderInitialized = !1),
      (this.encoder = null),
      (this.muxer = null),
      (this.lastNumberOfChannels = null),
      (this.lastSampleRate = null),
      (this.isPcmEncoder = !1),
      (this.outputSampleSize = null),
      (this.writeOutputValue = null),
      (this.customEncoder = null),
      (this.customEncoderCallSerializer = new je()),
      (this.customEncoderQueueSize = 0),
      (this.lastEndSampleIndex = null),
      (this.error = null),
      (this.errorNeedsNewStack = !0));
  }
  async add(e, t) {
    try {
      if (
        (this.checkForEncoderError(),
        this.source._ensureValidAdd(),
        null !== this.lastNumberOfChannels && null !== this.lastSampleRate)
      ) {
        if (
          e.numberOfChannels !== this.lastNumberOfChannels ||
          e.sampleRate !== this.lastSampleRate
        )
          throw new Error(
            `Audio parameters must remain constant. Expected ${this.lastNumberOfChannels} channels at ${this.lastSampleRate} Hz, got ${e.numberOfChannels} channels at ${e.sampleRate} Hz.`,
          );
      } else
        ((this.lastNumberOfChannels = e.numberOfChannels),
          (this.lastSampleRate = e.sampleRate));
      (this.encoderInitialized ||
        (this.ensureEncoderPromise || this.ensureEncoder(e),
        this.encoderInitialized || (await this.ensureEncoderPromise)),
        ie(this.encoderInitialized));
      {
        const t = Math.round(e.timestamp * e.sampleRate),
          i = Math.round((e.timestamp + e.duration) * e.sampleRate);
        if (null !== this.lastEndSampleIndex && t > this.lastEndSampleIndex) {
          const i = t - this.lastEndSampleIndex,
            r = new _i({
              data: new Float32Array(i * e.numberOfChannels),
              format: "f32-planar",
              sampleRate: e.sampleRate,
              numberOfChannels: e.numberOfChannels,
              numberOfFrames: i,
              timestamp: this.lastEndSampleIndex / e.sampleRate,
            });
          await this.add(r, !0);
        }
        this.lastEndSampleIndex = i;
      }
      if (this.customEncoder) {
        this.customEncoderQueueSize++;
        const t = e.clone(),
          i = this.customEncoderCallSerializer
            .call(() => this.customEncoder.encode(t))
            .then(() => this.customEncoderQueueSize--)
            .catch((e) => (this.error ??= e))
            .finally(() => {
              t.close();
            });
        (this.customEncoderQueueSize >= 4 && (await i),
          await this.muxer.mutex.currentPromise);
      } else if (this.isPcmEncoder) await this.doPcmEncoding(e, t);
      else {
        ie(this.encoder);
        const i = e.toAudioData();
        (this.encoder.encode(i),
          i.close(),
          t && e.close(),
          this.encoder.encodeQueueSize >= 4 &&
            (await new Promise((e) =>
              this.encoder.addEventListener("dequeue", e, { once: !0 }),
            )),
          await this.muxer.mutex.currentPromise);
      }
    } finally {
      t && e.close();
    }
  }
  async doPcmEncoding(e, t) {
    (ie(this.outputSampleSize), ie(this.writeOutputValue));
    const {
        numberOfChannels: i,
        numberOfFrames: r,
        sampleRate: a,
        timestamp: s,
      } = e,
      n = 2048,
      o = [];
    for (let d = 0; d < r; d += n) {
      const t = Math.min(n, e.numberOfFrames - d),
        r = t * i * this.outputSampleSize,
        a = new ArrayBuffer(r),
        s = new DataView(a);
      o.push({ frameCount: t, view: s });
    }
    const c = e.allocationSize({ planeIndex: 0, format: "f32-planar" }),
      l = new Float32Array(c / Float32Array.BYTES_PER_ELEMENT);
    for (let d = 0; d < i; d++) {
      e.copyTo(l, { planeIndex: d, format: "f32-planar" });
      for (let e = 0; e < o.length; e++) {
        const { frameCount: t, view: r } = o[e];
        for (let a = 0; a < t; a++)
          this.writeOutputValue(
            r,
            (a * i + d) * this.outputSampleSize,
            l[e * n + a],
          );
      }
    }
    t && e.close();
    const h = {
      decoderConfig: {
        codec: this.encodingConfig.codec,
        numberOfChannels: i,
        sampleRate: a,
      },
    };
    for (let d = 0; d < o.length; d++) {
      const { frameCount: e, view: t } = o[d],
        i = t.buffer,
        r = d * n,
        c = new Si(new Uint8Array(i), "key", s + r / a, e / a);
      (this.encodingConfig.onEncodedPacket?.(c, h),
        await this.muxer.addEncodedAudioPacket(
          this.source._connectedTrack,
          c,
          h,
        ));
    }
  }
  ensureEncoder(e) {
    const t = new Error();
    this.ensureEncoderPromise = (async () => {
      const { numberOfChannels: i, sampleRate: r } = e,
        a = Wo({ numberOfChannels: i, sampleRate: r, ...this.encodingConfig });
      this.encodingConfig.onEncoderConfig?.(a);
      const s = Ti.find((e) => e.supports(this.encodingConfig.codec, a));
      if (s)
        ((this.customEncoder = new s()),
          (this.customEncoder.codec = this.encodingConfig.codec),
          (this.customEncoder.config = a),
          (this.customEncoder.onPacket = (e, t) => {
            if (!(e instanceof Si))
              throw new TypeError(
                "The first argument passed to onPacket must be an EncodedPacket.",
              );
            if (void 0 !== t && (!t || "object" != typeof t))
              throw new TypeError(
                "The second argument passed to onPacket must be an object or undefined.",
              );
            (this.encodingConfig.onEncodedPacket?.(e, t),
              this.muxer
                .addEncodedAudioPacket(this.source._connectedTrack, e, t)
                .catch((e) => {
                  ((this.error ??= e), (this.errorNeedsNewStack = !1));
                }));
          }),
          await this.customEncoder.init());
      else if (ht.includes(this.encodingConfig.codec)) this.initPcmEncoder();
      else {
        if ("undefined" == typeof AudioEncoder)
          throw new Error("AudioEncoder is not supported by this browser.");
        if (!(await AudioEncoder.isConfigSupported(a)).supported)
          throw new Error(
            `This specific encoder configuration (${a.codec}, ${a.bitrate} bps, ${a.numberOfChannels} channels, ${a.sampleRate} Hz) is not supported by this browser. Consider using another codec or changing your audio parameters.`,
          );
        ((this.encoder = new AudioEncoder({
          output: (e, t) => {
            if ("aac" === this.encodingConfig.codec && t?.decoderConfig) {
              let e = !1;
              if (
                !t.decoderConfig.description ||
                t.decoderConfig.description.byteLength < 2
              )
                e = !0;
              else {
                e = 0 === It(le(t.decoderConfig.description)).objectType;
              }
              if (e) {
                const e = Number(ae(a.codec.split(".")));
                t.decoderConfig.description = ((e) => {
                  let t = Pt.indexOf(e.sampleRate),
                    i = null;
                  -1 === t && ((t = 15), (i = e.sampleRate));
                  const r = Et.indexOf(e.numberOfChannels);
                  if (-1 === r)
                    throw new TypeError(
                      `Unsupported number of channels: ${e.numberOfChannels}`,
                    );
                  let a = 13;
                  (e.objectType >= 32 && (a += 6), 15 === t && (a += 24));
                  const s = Math.ceil(a / 8),
                    n = new Uint8Array(s),
                    o = new ne(n);
                  return (
                    e.objectType < 32
                      ? o.writeBits(5, e.objectType)
                      : (o.writeBits(5, 31), o.writeBits(6, e.objectType - 32)),
                    o.writeBits(4, t),
                    15 === t && o.writeBits(24, i),
                    o.writeBits(4, r),
                    n
                  );
                })({
                  objectType: e,
                  numberOfChannels: t.decoderConfig.numberOfChannels,
                  sampleRate: t.decoderConfig.sampleRate,
                });
              }
            }
            const i = Si.fromEncodedChunk(e);
            (this.encodingConfig.onEncodedPacket?.(i, t),
              this.muxer
                .addEncodedAudioPacket(this.source._connectedTrack, i, t)
                .catch((e) => {
                  ((this.error ??= e), (this.errorNeedsNewStack = !1));
                }));
          },
          error: (e) => {
            ((e.stack = t.stack), (this.error ??= e));
          },
        })),
          this.encoder.configure(a));
      }
      (ie(this.source._connectedTrack),
        (this.muxer = this.source._connectedTrack.output._muxer),
        (this.encoderInitialized = !0));
    })();
  }
  initPcmEncoder() {
    this.isPcmEncoder = !0;
    const e = this.encodingConfig.codec,
      { dataType: t, sampleSize: i, littleEndian: r } = Ft(e);
    switch (((this.outputSampleSize = i), i)) {
      case 1:
        "unsigned" === t
          ? (this.writeOutputValue = (e, t, i) =>
              e.setUint8(t, Oe(127.5 * (i + 1), 0, 255)))
          : "signed" === t
            ? (this.writeOutputValue = (e, t, i) => {
                e.setInt8(t, Oe(Math.round(128 * i), -128, 127));
              })
            : "ulaw" === t
              ? (this.writeOutputValue = (e, t, i) => {
                  const r = Oe(Math.floor(32767 * i), -32768, 32767);
                  e.setUint8(
                    t,
                    ((e) => {
                      let t = e,
                        i = 4096,
                        r = 0,
                        a = 12,
                        s = 0;
                      for (
                        t < 0 && ((t = -t), (r = 128)),
                          t += 33,
                          t > 8191 && (t = 8191);
                        (t & i) !== i && a >= 5;

                      )
                        ((i >>= 1), a--);
                      return (
                        (s = (t >> (a - 4)) & 15),
                        255 & ~(r | ((a - 5) << 4) | s)
                      );
                    })(r),
                  );
                })
              : "alaw" === t
                ? (this.writeOutputValue = (e, t, i) => {
                    const r = Oe(Math.floor(32767 * i), -32768, 32767);
                    e.setUint8(
                      t,
                      ((e) => {
                        let t = 2048,
                          i = 0,
                          r = 11,
                          a = 0,
                          s = e;
                        for (
                          s < 0 && ((s = -s), (i = 128)),
                            s > 4095 && (s = 4095);
                          (s & t) !== t && r >= 5;

                        )
                          ((t >>= 1), r--);
                        return (
                          (a = (s >> (4 === r ? 1 : r - 4)) & 15),
                          85 ^ (i | ((r - 4) << 4) | a)
                        );
                      })(r),
                    );
                  })
                : ie(!1);
        break;
      case 2:
        "unsigned" === t
          ? (this.writeOutputValue = (e, t, i) =>
              e.setUint16(t, Oe(32767.5 * (i + 1), 0, 65535), r))
          : "signed" === t
            ? (this.writeOutputValue = (e, t, i) =>
                e.setInt16(t, Oe(Math.round(32767 * i), -32768, 32767), r))
            : ie(!1);
        break;
      case 3:
        "unsigned" === t
          ? (this.writeOutputValue = (e, t, i) =>
              Me(e, t, Oe(8388607.5 * (i + 1), 0, 16777215), r))
          : "signed" === t
            ? (this.writeOutputValue = (e, t, i) =>
                ((e, t, i, r) => {
                  ((i = Oe(i, -8388608, 8388607)) < 0 &&
                    (i = (i + 16777216) & 16777215),
                    Me(e, t, i, r));
                })(e, t, Oe(Math.round(8388607 * i), -8388608, 8388607), r))
            : ie(!1);
        break;
      case 4:
        "unsigned" === t
          ? (this.writeOutputValue = (e, t, i) =>
              e.setUint32(t, Oe(2147483647.5 * (i + 1), 0, 4294967295), r))
          : "signed" === t
            ? (this.writeOutputValue = (e, t, i) =>
                e.setInt32(
                  t,
                  Oe(Math.round(2147483647 * i), -2147483648, 2147483647),
                  r,
                ))
            : "float" === t
              ? (this.writeOutputValue = (e, t, i) => e.setFloat32(t, i, r))
              : ie(!1);
        break;
      case 8:
        "float" === t
          ? (this.writeOutputValue = (e, t, i) => e.setFloat64(t, i, r))
          : ie(!1);
        break;
      default:
        (Fe(i), ie(!1));
    }
  }
  async flushAndClose(e) {
    (e || this.checkForEncoderError(),
      this.customEncoder
        ? (e ||
            this.customEncoderCallSerializer.call(() =>
              this.customEncoder.flush(),
            ),
          await this.customEncoderCallSerializer.call(() =>
            this.customEncoder.close(),
          ))
        : this.encoder &&
          (e || (await this.encoder.flush()),
          "closed" !== this.encoder.state && this.encoder.close()),
      e || this.checkForEncoderError());
  }
  getQueueSize() {
    return this.customEncoder
      ? this.customEncoderQueueSize
      : this.isPcmEncoder
        ? 0
        : (this.encoder?.encodeQueueSize ?? 0);
  }
  checkForEncoderError() {
    if (this.error)
      throw (
        this.errorNeedsNewStack && (this.error.stack = new Error().stack),
        this.error
      );
  }
}
class ec extends Jo {
  constructor(e) {
    (((e) => {
      if (!e || "object" != typeof e)
        throw new TypeError("Encoding config must be an object.");
      if (!ut.includes(e.codec))
        throw new TypeError(
          `Invalid audio codec '${e.codec}'. Must be one of: ${ut.join(", ")}.`,
        );
      if (void 0 === e.bitrate && (!ht.includes(e.codec) || "flac" === e.codec))
        throw new TypeError(
          "config.bitrate must be provided for compressed audio codecs.",
        );
      if (
        void 0 !== e.bitrate &&
        !(e.bitrate instanceof Ho) &&
        (!Number.isInteger(e.bitrate) || e.bitrate <= 0)
      )
        throw new TypeError(
          "config.bitrate, when provided, must be a positive integer or a quality.",
        );
      if (
        void 0 !== e.onEncodedPacket &&
        "function" != typeof e.onEncodedPacket
      )
        throw new TypeError(
          "config.onEncodedChunk, when provided, must be a function.",
        );
      if (
        void 0 !== e.onEncoderConfig &&
        "function" != typeof e.onEncoderConfig
      )
        throw new TypeError(
          "config.onEncoderConfig, when provided, must be a function.",
        );
      Vo(e.codec, e);
    })(e),
      super(e.codec),
      (this._encoder = new Zo(this, e)));
  }
  add(e) {
    if (!(e instanceof _i))
      throw new TypeError("audioSample must be an AudioSample.");
    return this._encoder.add(e, !1);
  }
  _flushAndClose(e) {
    return this._encoder.flushAndClose(e);
  }
}
class tc extends Ko {
  constructor(e) {
    if ((super(), (this._connectedTrack = null), !mt.includes(e)))
      throw new TypeError(
        `Invalid subtitle codec '${e}'. Must be one of: ${mt.join(", ")}.`,
      );
    this._codec = e;
  }
}
const ic = ["video", "audio", "subtitle"],
  rc = (e) => {
    if (!e || "object" != typeof e)
      throw new TypeError("metadata must be an object.");
    if (void 0 !== e.languageCode && !Le(e.languageCode))
      throw new TypeError(
        "metadata.languageCode, when provided, must be a three-letter, ISO 639-2/T language code.",
      );
    if (void 0 !== e.name && "string" != typeof e.name)
      throw new TypeError("metadata.name, when provided, must be a string.");
    if (
      (void 0 !== e.disposition &&
        ((e) => {
          if (!e || "object" != typeof e)
            throw new TypeError("disposition must be an object.");
          if (void 0 !== e.default && "boolean" != typeof e.default)
            throw new TypeError("disposition.default must be a boolean.");
          if (void 0 !== e.forced && "boolean" != typeof e.forced)
            throw new TypeError("disposition.forced must be a boolean.");
          if (void 0 !== e.original && "boolean" != typeof e.original)
            throw new TypeError("disposition.original must be a boolean.");
          if (void 0 !== e.commentary && "boolean" != typeof e.commentary)
            throw new TypeError("disposition.commentary must be a boolean.");
          if (
            void 0 !== e.hearingImpaired &&
            "boolean" != typeof e.hearingImpaired
          )
            throw new TypeError(
              "disposition.hearingImpaired must be a boolean.",
            );
          if (
            void 0 !== e.visuallyImpaired &&
            "boolean" != typeof e.visuallyImpaired
          )
            throw new TypeError(
              "disposition.visuallyImpaired must be a boolean.",
            );
        })(e.disposition),
      void 0 !== e.maximumPacketCount &&
        (!Number.isInteger(e.maximumPacketCount) || e.maximumPacketCount < 0))
    )
      throw new TypeError(
        "metadata.maximumPacketCount, when provided, must be a non-negative integer.",
      );
  };
class ac {
  constructor(e) {
    if (
      ((this.state = "pending"),
      (this._tracks = []),
      (this._startPromise = null),
      (this._cancelPromise = null),
      (this._finalizePromise = null),
      (this._mutex = new Ce()),
      (this._metadataTags = {}),
      !e || "object" != typeof e)
    )
      throw new TypeError("options must be an object.");
    if (!(e.format instanceof Bo))
      throw new TypeError("options.format must be an OutputFormat.");
    if (!(e.target instanceof To))
      throw new TypeError("options.target must be a Target.");
    if (e.target._output)
      throw new Error("Target is already used for another output.");
    ((e.target._output = this),
      (this.format = e.format),
      (this.target = e.target),
      (this._writer = e.target._createWriter()),
      (this._muxer = e.format._createMuxer(this)));
  }
  addVideoTrack(e, t = {}) {
    if (!(e instanceof Qo))
      throw new TypeError("source must be a VideoSource.");
    if (
      (rc(t), void 0 !== t.rotation && ![0, 90, 180, 270].includes(t.rotation))
    )
      throw new TypeError(
        `Invalid video rotation: ${t.rotation}. Has to be 0, 90, 180 or 270.`,
      );
    if (!this.format.supportsVideoRotationMetadata && t.rotation)
      throw new Error(
        `${this.format._name} does not support video rotation metadata.`,
      );
    if (
      void 0 !== t.frameRate &&
      (!Number.isFinite(t.frameRate) || t.frameRate <= 0)
    )
      throw new TypeError(
        `Invalid video frame rate: ${t.frameRate}. Must be a positive number.`,
      );
    this._addTrack("video", e, t);
  }
  addAudioTrack(e, t = {}) {
    if (!(e instanceof Jo))
      throw new TypeError("source must be an AudioSource.");
    (rc(t), this._addTrack("audio", e, t));
  }
  addSubtitleTrack(e, t = {}) {
    if (!(e instanceof tc))
      throw new TypeError("source must be a SubtitleSource.");
    (rc(t), this._addTrack("subtitle", e, t));
  }
  setMetadataTags(e) {
    if (
      (((e) => {
        if (!e || "object" != typeof e)
          throw new TypeError("tags must be an object.");
        if (void 0 !== e.title && "string" != typeof e.title)
          throw new TypeError("tags.title, when provided, must be a string.");
        if (void 0 !== e.description && "string" != typeof e.description)
          throw new TypeError(
            "tags.description, when provided, must be a string.",
          );
        if (void 0 !== e.artist && "string" != typeof e.artist)
          throw new TypeError("tags.artist, when provided, must be a string.");
        if (void 0 !== e.album && "string" != typeof e.album)
          throw new TypeError("tags.album, when provided, must be a string.");
        if (void 0 !== e.albumArtist && "string" != typeof e.albumArtist)
          throw new TypeError(
            "tags.albumArtist, when provided, must be a string.",
          );
        if (
          void 0 !== e.trackNumber &&
          (!Number.isInteger(e.trackNumber) || e.trackNumber <= 0)
        )
          throw new TypeError(
            "tags.trackNumber, when provided, must be a positive integer.",
          );
        if (
          void 0 !== e.tracksTotal &&
          (!Number.isInteger(e.tracksTotal) || e.tracksTotal <= 0)
        )
          throw new TypeError(
            "tags.tracksTotal, when provided, must be a positive integer.",
          );
        if (
          void 0 !== e.discNumber &&
          (!Number.isInteger(e.discNumber) || e.discNumber <= 0)
        )
          throw new TypeError(
            "tags.discNumber, when provided, must be a positive integer.",
          );
        if (
          void 0 !== e.discsTotal &&
          (!Number.isInteger(e.discsTotal) || e.discsTotal <= 0)
        )
          throw new TypeError(
            "tags.discsTotal, when provided, must be a positive integer.",
          );
        if (void 0 !== e.genre && "string" != typeof e.genre)
          throw new TypeError("tags.genre, when provided, must be a string.");
        if (
          void 0 !== e.date &&
          (!(e.date instanceof Date) || Number.isNaN(e.date.getTime()))
        )
          throw new TypeError(
            "tags.date, when provided, must be a valid Date.",
          );
        if (void 0 !== e.lyrics && "string" != typeof e.lyrics)
          throw new TypeError("tags.lyrics, when provided, must be a string.");
        if (void 0 !== e.images) {
          if (!Array.isArray(e.images))
            throw new TypeError(
              "tags.images, when provided, must be an array.",
            );
          for (const t of e.images) {
            if (!t || "object" != typeof t)
              throw new TypeError(
                "Each image in tags.images must be an object.",
              );
            if (!(t.data instanceof Uint8Array))
              throw new TypeError("Each image.data must be a Uint8Array.");
            if ("string" != typeof t.mimeType)
              throw new TypeError("Each image.mimeType must be a string.");
            if (!["coverFront", "coverBack", "unknown"].includes(t.kind))
              throw new TypeError(
                "Each image.kind must be 'coverFront', 'coverBack', or 'unknown'.",
              );
          }
        }
        if (void 0 !== e.comment && "string" != typeof e.comment)
          throw new TypeError("tags.comment, when provided, must be a string.");
        if (void 0 !== e.raw) {
          if (!e.raw || "object" != typeof e.raw)
            throw new TypeError("tags.raw, when provided, must be an object.");
          for (const t of Object.values(e.raw))
            if (
              !(
                null === t ||
                "string" == typeof t ||
                t instanceof Uint8Array ||
                t instanceof nt ||
                t instanceof ot
              )
            )
              throw new TypeError(
                "Each value in tags.raw must be a string, Uint8Array, RichImageData, AttachedFile, or null.",
              );
        }
      })(e),
      "pending" !== this.state)
    )
      throw new Error(
        "Cannot set metadata tags after output has been started or canceled.",
      );
    this._metadataTags = e;
  }
  _addTrack(e, t, i) {
    if ("pending" !== this.state)
      throw new Error(
        "Cannot add track after output has been started or canceled.",
      );
    if (t._connectedTrack)
      throw new Error("Source is already used for a track.");
    const r = this.format.getSupportedTrackCounts(),
      a = this._tracks.reduce((t, i) => t + (i.type === e ? 1 : 0), 0),
      s = r[e].max;
    if (a === s)
      throw new Error(
        0 === s
          ? `${this.format._name} does not support ${e} tracks.`
          : `${this.format._name} does not support more than ${s} ${e} track` +
            (1 === s ? "" : "s") +
            ".",
      );
    const n = r.total.max;
    if (this._tracks.length === n)
      throw new Error(
        `${this.format._name} does not support more than ${n} tracks` +
          (1 === n ? "" : "s") +
          " in total.",
      );
    const o = {
      id: this._tracks.length + 1,
      output: this,
      type: e,
      source: t,
      metadata: i,
    };
    if ("video" === o.type) {
      const e = this.format.getSupportedVideoCodecs();
      if (0 === e.length)
        throw new Error(
          `${this.format._name} does not support video tracks.` +
            this.format._codecUnsupportedHint(o.source._codec),
        );
      if (!e.includes(o.source._codec))
        throw new Error(
          `Codec '${o.source._codec}' cannot be contained within ${this.format._name}. Supported video codecs are: ${e.map((e) => `'${e}'`).join(", ")}.` +
            this.format._codecUnsupportedHint(o.source._codec),
        );
    } else if ("audio" === o.type) {
      const e = this.format.getSupportedAudioCodecs();
      if (0 === e.length)
        throw new Error(
          `${this.format._name} does not support audio tracks.` +
            this.format._codecUnsupportedHint(o.source._codec),
        );
      if (!e.includes(o.source._codec))
        throw new Error(
          `Codec '${o.source._codec}' cannot be contained within ${this.format._name}. Supported audio codecs are: ${e.map((e) => `'${e}'`).join(", ")}.` +
            this.format._codecUnsupportedHint(o.source._codec),
        );
    } else if ("subtitle" === o.type) {
      const e = this.format.getSupportedSubtitleCodecs();
      if (0 === e.length)
        throw new Error(
          `${this.format._name} does not support subtitle tracks.` +
            this.format._codecUnsupportedHint(o.source._codec),
        );
      if (!e.includes(o.source._codec))
        throw new Error(
          `Codec '${o.source._codec}' cannot be contained within ${this.format._name}. Supported subtitle codecs are: ${e.map((e) => `'${e}'`).join(", ")}.` +
            this.format._codecUnsupportedHint(o.source._codec),
        );
    }
    (this._tracks.push(o), (t._connectedTrack = o));
  }
  async start() {
    const e = this.format.getSupportedTrackCounts();
    for (const i of ic) {
      const t = this._tracks.reduce((e, t) => e + (t.type === i ? 1 : 0), 0),
        r = e[i].min;
      if (t < r)
        throw new Error(
          r === e[i].max
            ? `${this.format._name} requires exactly ${r} ${i} track${1 === r ? "" : "s"}.`
            : `${this.format._name} requires at least ${r} ${i} track${1 === r ? "" : "s"}.`,
        );
    }
    const t = e.total.min;
    if (this._tracks.length < t)
      throw new Error(
        t === e.total.max
          ? `${this.format._name} requires exactly ${t} track` +
            (1 === t ? "" : "s") +
            "."
          : `${this.format._name} requires at least ${t} track` +
            (1 === t ? "" : "s") +
            ".",
      );
    if ("canceled" === this.state) throw new Error("Output has been canceled.");
    return this._startPromise
      ? (console.warn("Output has already been started."), this._startPromise)
      : (this._startPromise = (async () => {
          ((this.state = "started"), this._writer.start());
          const e = await this._mutex.acquire();
          await this._muxer.start();
          const t = this._tracks.map((e) => e.source._start());
          (await Promise.all(t), e());
        })());
  }
  getMimeType() {
    return this._muxer.getMimeType();
  }
  async cancel() {
    return this._cancelPromise
      ? (console.warn("Output has already been canceled."), this._cancelPromise)
      : "finalizing" !== this.state && "finalized" !== this.state
        ? (this._cancelPromise = (async () => {
            this.state = "canceled";
            const e = await this._mutex.acquire(),
              t = this._tracks.map((e) =>
                e.source._flushOrWaitForOngoingClose(!0),
              );
            (await Promise.all(t), await this._writer.close(), e());
          })())
        : void console.warn("Output has already been finalized.");
  }
  async finalize() {
    if ("pending" === this.state)
      throw new Error("Cannot finalize before starting.");
    if ("canceled" === this.state)
      throw new Error("Cannot finalize after canceling.");
    return this._finalizePromise
      ? (console.warn("Output has already been finalized."),
        this._finalizePromise)
      : (this._finalizePromise = (async () => {
          this.state = "finalizing";
          const e = await this._mutex.acquire(),
            t = this._tracks.map((e) =>
              e.source._flushOrWaitForOngoingClose(!1),
            );
          (await Promise.all(t),
            await this._muxer.finalize(),
            await this._writer.flush(),
            await this._writer.finalize(),
            (this.state = "finalized"),
            e());
        })());
  }
}
async function sc(e) {
  let t = null;
  if (
    ((t =
      "string" == typeof e
        ? await nc(e)
        : e instanceof Blob
          ? e.type
          : (e = await e.getFile()).type),
    t?.startsWith("image/"))
  )
    return t;
  if (t?.startsWith("text/html")) return t;
  if (t?.startsWith("application/json")) return t;
  try {
    const i = new ds({
      formats: rs,
      source: "string" == typeof e ? new cs(e) : new ss(e),
    });
    t = await i.getMimeType();
  } catch (i) {}
  return t?.startsWith("audio/") || t?.startsWith("video/") ? t : null;
}
async function nc(e) {
  if (e.startsWith("<html>")) return "text/html";
  let t;
  try {
    t = await fetch(e, { method: "HEAD" });
  } catch (r) {
    const i = new AbortController();
    ((t = await fetch(e, { signal: i.signal })), i.abort());
  }
  if (!t.ok) return null;
  const i = t.headers.get("Content-Type");
  return i || null;
}
class oc extends (function () {
  return class extends j(class {}) {};
})() {
  input;
  buffers = /* @__PURE__ */ new Map();
  constructor(e) {
    (super(), (this.input = e));
  }
  async decode(e, t, i = !1) {
    let r,
      a = this.buffers.get(`${t}-${e}`);
    if (a) return a;
    if (
      ((r =
        e || t
          ? new OfflineAudioContext(e ?? 2, 1, t ?? 44100)
          : new AudioContext()),
      "string" == typeof this.input)
    ) {
      const e = await fetch(this.input),
        t = await e.arrayBuffer();
      a = await r.decodeAudioData(t);
    } else if (this.input instanceof Blob)
      a = await r.decodeAudioData(await this.input.arrayBuffer());
    else {
      const e = await this.input.getFile();
      a = await r.decodeAudioData(await e.arrayBuffer());
    }
    return (i && this.buffers.set(`${t}-${e}`, a), a);
  }
  async dispose() {
    this.buffers.clear();
  }
}
class cc extends X {
  decoder;
  duration;
  demuxer;
  audioTrack = null;
  sampleRate = 48e3;
  numberOfChannels = 2;
  constructor(e) {
    (super(e), (this.decoder = new oc(e.input)));
  }
  async init() {
    ((this.demuxer = new ds({
      formats: rs,
      source:
        "string" == typeof this.input
          ? new cs(this.input)
          : new ss(
              this.input instanceof Blob
                ? this.input
                : await this.input.getFile(),
            ),
    })),
      (this.duration = await this.demuxer.computeDuration()),
      (this.audioTrack = await this.demuxer.getPrimaryAudioTrack()),
      (this.sampleRate = this.audioTrack?.sampleRate ?? 48e3),
      (this.numberOfChannels = this.audioTrack?.numberOfChannels ?? 2));
  }
  async decode(e = 2, t = 48e3, i = !1) {
    return this.decoder.decode(e, t, i);
  }
  async silences(e = {}) {
    return (function (e, t = {}) {
      const {
          threshold: i = 0.02,
          hopSize: r = 1024,
          minDuration: a = 500,
        } = t,
        s = [],
        n = e.getChannelData(0),
        o = e.sampleRate,
        c = Math.floor((a / 1e3) * o);
      let l = null,
        h = 0;
      for (let d = 0; d < n.length; d += r) {
        let e = 0;
        const t = Math.min(d + r, n.length);
        for (let i = d; i < t; i++) e += n[i] * n[i];
        ((e = Math.sqrt(e / (t - d))),
          e < i
            ? ((h += r), null === l && (l = d))
            : (null !== l && h >= c && s.push({ start: l / o, end: d / o }),
              (l = null),
              (h = 0)));
      }
      return (
        null !== l && h >= c && s.push({ start: l / o, end: n.length / o }),
        s
      );
    })(await this.decode(1, 24e3), e);
  }
  async *samplesInRange({ start: e, end: t }) {
    if (!this.audioTrack) return;
    const i = new Qi(this.audioTrack);
    yield* i.samples(D(e), D(t));
  }
}
class lc extends G(cc) {
  videoTrack;
  fps = 30;
  bitrate = 0;
  async init() {
    await super.init();
    const e = await this.demuxer.getPrimaryVideoTrack();
    if (!e)
      throw new Error(
        "VideoSource must be backed by media with a video track.",
      );
    ((this.videoTrack = e),
      (this.height = e.displayHeight),
      (this.width = e.displayWidth));
    const t = await e.computePacketStats(50);
    ((this.fps = t.averagePacketRate), (this.bitrate = t.averageBitrate));
  }
  async *thumbnailsInRange(e) {
    const t = D(e.start),
      i = D(e.end),
      r = Array.from(
        { length: e.count },
        (r, a) => t + (a * (i - t)) / e.count,
      ),
      a = new ji(this.videoTrack, { ...e, fit: "cover" });
    yield* a.canvasesAtTimestamps(r);
  }
}
class hc extends G(X) {
  element = new Image();
  async init() {
    if ("string" == typeof this.input) {
      const e = await fetch(this.input);
      if (!e.ok) throw new Z("Failed to load image");
      this.element.src = URL.createObjectURL(await e.blob());
    } else
      this.input instanceof Blob
        ? (this.element.src = URL.createObjectURL(this.input))
        : (this.element.src = URL.createObjectURL(await this.input.getFile()));
    await new Promise((e, t) => {
      ((this.element.onload = () => {
        ((this.height = this.element.naturalHeight),
          (this.width = this.element.naturalWidth),
          e());
      }),
        (this.element.onerror = () => t(new Z("Failed to load image"))));
    });
  }
}
class dc extends G(X) {
  transcript = [];
  get duration() {
    return this.transcript.at(-1)?.words.at(-1)?.end ?? 0;
  }
  async init() {
    if ("string" == typeof this.input) {
      const e = await fetch(this.input);
      if (!e.ok) throw new Z("Failed to load image");
      this.transcript = await e.json();
    } else if (this.input instanceof Blob)
      this.transcript = JSON.parse(await this.input.text());
    else {
      const e = await this.input.getFile();
      this.transcript = JSON.parse(await e.text());
    }
    (m(Array.isArray(this.transcript), "Transcript must be an array"),
      m(
        this.transcript.every((e) => Array.isArray(e.words)),
        "Each group must have words",
      ),
      m(
        this.transcript.every((e) =>
          e.words.every(
            (e) =>
              "string" == typeof e.text &&
              "number" == typeof e.start &&
              "number" == typeof e.end,
          ),
        ),
        "Each word must have text, start, and end",
      ));
  }
  computeWpm() {
    const e = this.transcript.reduce((e, t) => e + t.words.length, 0),
      t = this.transcript.at(0)?.words.at(0)?.start ?? 0;
    return e / (((this.transcript.at(-1)?.words.at(-1)?.end ?? 0) - t) / 60);
  }
  groupBy(e) {
    const t = [[]];
    for (const i of this.transcript)
      for (const r of i.words) {
        const i = t[t.length - 1],
          a = i?.reduce((e, t) => e + t.text.length, 0) ?? 0,
          s = i?.reduce((e, t) => e + (t.end - t.start), 0) ?? 0;
        ((("count" in e && (i?.length ?? 0) + 1 > e.count) ||
          ("duration" in e && s + (r.end - r.start) > e.duration) ||
          ("length" in e && a + r.text.length > e.length)) &&
          t.push([]),
          t.at(-1)?.push(r));
      }
    return t.filter((e) => e.length > 0);
  }
  toSrt() {
    return z(this.transcript);
  }
  optimize() {
    const e = this.transcript.flatMap((e) => e.words);
    for (let t = 0; t < e.length - 1; t++) {
      const i = e[t],
        r = e[t + 1];
      r.start - i.end < 0
        ? (r.start = i.end + 1 / _)
        : (i.end = r.start - 1 / _);
    }
    return this;
  }
}
class uc {
  static async from(e, t = {}) {
    const i = t.mimeType ?? (await sc(e));
    let r;
    if (i?.startsWith("image/"))
      r = new hc({ input: e, mimeType: i, name: t.name });
    else if (i?.startsWith("application/json"))
      r = new dc({ input: e, mimeType: i, name: t.name });
    else if (i?.startsWith("audio/"))
      r = new cc({ input: e, mimeType: i, name: t.name });
    else {
      if (!i?.startsWith("video/")) throw new te("Unsupported file type");
      r = new lc({ input: e, mimeType: i, name: t.name });
    }
    return (await r.init(), r);
  }
  static async fromAsset(e) {
    const t = await uc.from(e.input, { mimeType: e.mimeType });
    return (t.fromJSON(e), t);
  }
}
function mc(e, t = "linear") {
  switch (t) {
    case "linear":
      return e;
    case "ease-in":
      return e * e;
    case "ease-out":
      return e * (2 - e);
    case "ease-in-out":
      return e < 0.5 ? 2 * e * e : (4 - 2 * e) * e - 1;
    case "ease-out-in":
      if (e < 0.5) {
        const t = 2 * e;
        return (t * (2 - t)) / 2;
      }
      {
        const t = 2 * (e - 0.5);
        return (t * t) / 2 + 0.5;
      }
    default:
      throw new Error(`Unhandled easing: ${t}`);
  }
}
function pc(e, t, i) {
  return e + (t - e) * i;
}
function fc(e) {
  const t = (function (e) {
    const t = e.startsWith("#") ? e.slice(1) : e,
      i = parseInt(t, 16);
    return { r: (i >> 16) & 255, g: (i >> 8) & 255, b: 255 & i };
  })(e);
  return (function (e, t, i) {
    ((e /= 255), (t /= 255), (i /= 255));
    const r = Math.max(e, t, i),
      a = Math.min(e, t, i);
    let s = 0,
      n = 0;
    const o = (r + a) / 2;
    if (r !== a) {
      const c = r - a;
      switch (((n = o > 0.5 ? c / (2 - r - a) : c / (r + a)), r)) {
        case e:
          s = (t - i) / c + (t < i ? 6 : 0);
          break;
        case t:
          s = (i - e) / c + 2;
          break;
        case i:
          s = (e - t) / c + 4;
      }
      s /= 6;
    }
    return {
      h: Math.round(360 * s),
      s: Math.round(100 * n),
      l: Math.round(100 * o),
    };
  })(t.r, t.g, t.b);
}
function gc(e, t, i) {
  function r(e, t, i) {
    return (
      i < 0 && (i += 1),
      i > 1 && (i -= 1),
      i < 1 / 6
        ? e + 6 * (t - e) * i
        : i < 0.5
          ? t
          : i < 2 / 3
            ? e + (t - e) * (2 / 3 - i) * 6
            : e
    );
  }
  t /= 100;
  const a = (i /= 100) < 0.5 ? i * (1 + t) : i + t - i * t,
    s = 2 * i - a,
    n = r(s, a, (e = (e + 360) % 360) / 360 + 1 / 3),
    o = r(s, a, e / 360),
    c = r(s, a, e / 360 - 1 / 3);
  return (function (e, t, i) {
    return `#${((1 << 24) + (Math.round(e) << 16) + (Math.round(t) << 8) + Math.round(i)).toString(16).slice(1)}`;
  })(Math.round(255 * n), Math.round(255 * o), Math.round(255 * c));
}
function kc(e, t) {
  const { frames: i, extrapolate: r = "clamp", easing: a } = e;
  if (t <= D(i[0].time)) return i[0].value;
  if (t >= D(i[i.length - 1].time)) return i[i.length - 1].value;
  let s, n;
  for (let u = 0; u < i.length - 1; u++)
    if (t >= D(i[u].time) && t <= D(i[u + 1].time)) {
      ((s = i[u]), (n = i[u + 1]));
      break;
    }
  if (!s || !n) throw new Error("Unexpected error in keyframe interpolation");
  const o = mc((t - D(s.time)) / (D(n.time) - D(s.time)), s.easing ?? a),
    c = fc(s.value),
    l = fc(n.value);
  let h = c.h,
    d = l.h;
  return (
    Math.abs(d - h) > 180 && (h < d ? (h += 360) : (d += 360)),
    gc(pc(h, d, o), pc(c.s, l.s, o), pc(c.l, l.l, o))
  );
}
function yc(e, t) {
  const { frames: i, extrapolate: r = "clamp", easing: a } = e;
  if (t <= D(i[0].time)) return i[0].value;
  if (t >= D(i[i.length - 1].time)) return i[i.length - 1].value;
  let s, n;
  for (let d = 0; d < i.length - 1; d++)
    if (D(i[d].time) <= t && t <= D(i[d + 1].time)) {
      ((s = i[d]), (n = i[d + 1]));
      break;
    }
  if (!s || !n) throw new Error("Unexpected error in keyframe interpolation");
  const o = (t - D(s.time)) / (D(n.time) - D(s.time)),
    c = "number" == typeof s.value ? s.value : wc(s.value),
    l = "number" == typeof n.value ? n.value : wc(n.value);
  let h;
  if ("log-linear" === a) {
    if (c <= 0 || l <= 0)
      throw new Error("Values for log-linear interpolation must be positive.");
    h = Math.exp(pc(Math.log(c), Math.log(l), o));
  } else {
    h = pc(c, l, mc(o, s.easing ?? a));
  }
  return "number" == typeof s.value ? h : `${h}%`;
}
function wc(e) {
  return "number" == typeof e ? e : Number(e.replace("%", ""));
}
function bc(e, t) {
  const { frames: i, extrapolate: r = "clamp" } = e;
  if (t <= D(i[0].time)) return i[0].value;
  if (t >= D(i[i.length - 1].time)) return i[i.length - 1].value;
  let a, s;
  for (let h = 0; h < i.length - 1; h++)
    if (t >= D(i[h].time) && t <= D(i[h + 1].time)) {
      ((a = i[h]), (s = i[h + 1]));
      break;
    }
  if (!a || !s) throw new Error("Unexpected error in keyframe interpolation");
  const n = mc((t - D(a.time)) / (D(s.time) - D(a.time)), a.easing),
    o = s.value,
    c = o.length,
    l = Math.floor(n * c);
  return o.slice(0, l);
}
var Tc = Object.defineProperty,
  Cc = Object.getOwnPropertyDescriptor,
  Sc = (e, t, i, r) => {
    for (
      var a, s = r > 1 ? void 0 : r ? Cc(t, i) : t, n = e.length - 1;
      n >= 0;
      n--
    )
      (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
    return (r && s && Tc(t, i, s), s);
  };
let vc = class extends e {
  id = `clip_${q()}`;
  _name;
  _delay = 0;
  _duration = D(16);
  data = {};
  initialized = !1;
  type = "BASE";
  source;
  createdAt = /* @__PURE__ */ new Date();
  disabled = !1;
  animations = [];
  layer;
  input;
  transition;
  get name() {
    return this._name ?? this.source?.name;
  }
  set name(e) {
    this._name = e;
  }
  get start() {
    return this._delay;
  }
  set start(e) {
    this.delay = e;
  }
  get end() {
    return this._delay + this._duration;
  }
  set end(e) {
    this.delay = D(e) - this._duration;
  }
  get delay() {
    return this._delay;
  }
  get duration() {
    return this._duration;
  }
  get index() {
    return this.layer?.clips.findIndex((e) => e.id == this.id) ?? -1;
  }
  set index(e) {
    (m(this.layer, "Clip must be attached to a layer"),
      m(
        "SEQUENTIAL" == this.layer.mode,
        "Clip must be attached to a layer with sequential mode",
      ),
      this.layer.relocate(this, void 0, e));
  }
  constructor(e = {}) {
    (super(), Object.assign(this, e));
  }
  containsAudio() {
    return "AUDIO" === this.type || "VIDEO" === this.type;
  }
  animate(e) {
    for (const t of this.animations) {
      const i = t?.frames[0].value;
      "number" == typeof i ||
      ("string" == typeof i && i.match(/^[0-9]+(\.[0-9]+)?%$/))
        ? (this[t.key] = yc(t, e - this.start))
        : "string" == typeof i && i.match(/^#[0-9abcdef]{3,8}$/i)
          ? (this[t.key] = kc(t, e - this.start))
          : "string" == typeof i && (this[t.key] = bc(t, e - this.start));
    }
    return this;
  }
  set delay(e) {
    ((this._delay = D(e)),
      this.layer?.verifyUpdate(this),
      this.containsAudio() && this.updateAudioRampingKeyframes());
  }
  set duration(e) {
    (m((e = D(e)) > 0, "Duration must be positive"),
      (this._duration = e),
      this.layer?.verifyUpdate(this),
      this.containsAudio() && this.updateAudioRampingKeyframes());
  }
  async init() {}
  async initRenderer(e) {}
  async deinitRenderer(e) {}
  async enter(e) {}
  async update(e) {}
  ambientUpdate(e) {}
  render(e) {}
  async exit(e) {}
  async seek(e) {}
  async play(e) {}
  async pause(e) {}
  layout(e) {}
  detach() {
    return (this.layer?.remove(this), this);
  }
  trim(e = this.start, t = this.end) {
    return (
      (e = D(e)),
      (t = D(t)),
      (this.delay = e),
      (this.duration = t - e),
      this.containsAudio() && this.updateAudioRampingKeyframes(),
      this
    );
  }
  async split(e) {
    (m(
      (e = D(e ?? this.layer?.composition?.renderer.playbackTime)) >
        this.start && e < this.end,
      "Cannot split clip at the specified time",
    ),
      m(this.layer, "Clip must be attached to a layer"));
    const t = this.animate(e).copy();
    ((this.duration = e - this.delay), t.trim(e), (t.animations = []));
    const i = this.layer.clips.findIndex((e) => e.id == this.id);
    return (await this.layer.add(t, i + 1), t);
  }
  copy() {
    const e = this.constructor.fromJSON(this.toJSON());
    return ((e.source = this.source), (e.id = `clip_${q()}`), e);
  }
  async createCheckpoint() {
    return this.toJSON();
  }
  async restoreCheckpoint(e, t) {
    (m("object" == typeof e), m(null != e));
    let i,
      r = e;
    if (
      ("source" in e &&
        (m("string" == typeof e.source, "Source must be a string"),
        ({ source: i, ...r } = e)),
      i && i !== this.source?.id)
    ) {
      const e = t.find((e) => e.id === i);
      (m(e, "Asset not found"),
        e instanceof X
          ? (this.source = e)
          : ((this.source = await uc.fromAsset(e)),
            (t = [this.source, ...t.filter((e) => e.id !== i)])));
    }
    return (
      this.fromJSON(r),
      this.containsAudio() && this.updateAudioRampingKeyframes(),
      this
    );
  }
};
(Sc([t()], vc.prototype, "id", 2),
  Sc([t(void 0, "name")], vc.prototype, "_name", 2),
  Sc([t(void 0, "delay")], vc.prototype, "_delay", 2),
  Sc([t(void 0, "duration")], vc.prototype, "_duration", 2),
  Sc([t()], vc.prototype, "data", 2),
  Sc([t()], vc.prototype, "type", 2),
  Sc([t()], vc.prototype, "source", 2),
  Sc([t(R)], vc.prototype, "createdAt", 2),
  Sc([t()], vc.prototype, "disabled", 2),
  Sc([t()], vc.prototype, "animations", 2),
  Sc([t()], vc.prototype, "transition", 2),
  (vc = Sc([i("Clip")], vc)));
class xc {
  static fromType(e) {
    switch (e.type) {
      case "VIDEO":
        return new hl();
      case "AUDIO":
        return new nl();
      case "IMAGE":
        return new Hc();
      case "TEXT":
        return new el();
      case "ELLIPSE":
        return new fl();
      case "RECT":
        return new wl();
      case "POLYGON":
        return new Sl();
      case "CAPTION":
        return new Sh();
      default:
        return new vc();
    }
  }
  static fromSource(e) {
    if (e instanceof lc) return new hl(e);
    if (e instanceof cc) return new nl(e);
    if (e instanceof hc) return new Hc(e);
    if (e instanceof dc) return new Sh(e);
    throw new Error("Unsupported source type");
  }
}
var Pc = Object.defineProperty,
  Ec = (e, t, i, r) => {
    for (var a, s = void 0, n = e.length - 1; n >= 0; n--)
      (a = e[n]) && (s = a(t, i, s) || s);
    return (s && Pc(t, i, s), s);
  };
class Ic extends e {
  id = `mask_${q()}`;
  type = "BASE";
  width = 100;
  height = 100;
  x = 0;
  y = 0;
  fillRule;
  animations = [];
  clip;
  renderer;
  constructor(e = {}) {
    (super(), Object.assign(this, e));
  }
  connect(e) {
    return ((this.clip = e), this);
  }
  draw(e) {
    return ((this.renderer = e), new Path2D());
  }
  animate(e) {
    for (const t of this.animations) {
      const i = t?.frames[0].value;
      "number" == typeof i && (this[t.key] = yc(t, e - this.start));
    }
    return this;
  }
  get start() {
    return this.clip?.start ?? 0;
  }
  get end() {
    return this.clip?.end ?? 0;
  }
  get size() {
    return { width: this.width, height: this.height };
  }
  get bounds() {
    const { width: e, height: t } = this.size;
    return [
      { x: 0, y: 0 },
      { x: e, y: 0 },
      { x: e, y: t },
      { x: 0, y: t },
    ];
  }
  detach() {
    return (
      this.clip && ((this.clip.mask = void 0), (this.clip = void 0)),
      this
    );
  }
}
(Ec([t()], Ic.prototype, "type"),
  Ec([t()], Ic.prototype, "width"),
  Ec([t()], Ic.prototype, "height"),
  Ec([t()], Ic.prototype, "x"),
  Ec([t()], Ic.prototype, "y"),
  Ec([t()], Ic.prototype, "fillRule"),
  Ec([t()], Ic.prototype, "animations"));
var _c = Object.defineProperty,
  Ac = (e, t, i, r) => {
    for (var a, s = void 0, n = e.length - 1; n >= 0; n--)
      (a = e[n]) && (s = a(t, i, s) || s);
    return (s && _c(t, i, s), s);
  };
class Fc extends Ic {
  type = "RECT";
  radius = 0;
  animations = [];
  constructor(e = {}) {
    (super(e), Object.assign(this, e));
  }
  draw(e) {
    const t = super.draw(e);
    if (this.radius) {
      const i = $(this.radius, Math.min(e.height, this.height) / 2);
      t.roundRect(
        ((this.x - this.width / 2) * e.resolution) | 0,
        ((this.y - this.height / 2) * e.resolution) | 0,
        (this.width * e.resolution) | 0,
        (this.height * e.resolution) | 0,
        (i * e.resolution) | 0,
      );
    } else
      t.rect(
        (this.x - (this.width / 2) * e.resolution) | 0,
        (this.y - (this.height / 2) * e.resolution) | 0,
        (this.width * e.resolution) | 0,
        (this.height * e.resolution) | 0,
      );
    return t;
  }
  get bounds() {
    const { width: e, height: t } = this.size;
    return [
      { x: this.x - e / 2, y: this.y - t / 2 },
      { x: this.x + e / 2, y: this.y - t / 2 },
      { x: this.x + e / 2, y: this.y + t / 2 },
      { x: this.x - e / 2, y: this.y + t / 2 },
    ];
  }
}
(Ac([t()], Fc.prototype, "type"), Ac([t()], Fc.prototype, "radius"));
class Bc {
  static fromJSON(e) {
    switch ((m("object" == typeof e), m(null != e), m("type" in e), e.type)) {
      case "RECT":
        return Fc.fromJSON(e);
      case "ELLIPSE":
        return Dc.fromJSON(e);
      default:
        return Ic.fromJSON(e);
    }
  }
}
var Mc = Object.defineProperty;
class Dc extends Ic {
  type = "ELLIPSE";
  animations = [];
  constructor(e = {}) {
    (super(e), Object.assign(this, e));
  }
  draw(e) {
    const t = super.draw(e);
    return (
      t.ellipse(
        this.x * e.resolution,
        this.y * e.resolution,
        this.width * e.resolution * 0.5,
        this.height * e.resolution * 0.5,
        0,
        0,
        2 * Math.PI,
      ),
      t
    );
  }
  get bounds() {
    const { width: e, height: t } = this.size,
      i = this.x - 0.5 * e,
      r = this.y - 0.5 * t;
    return [
      { x: i, y: r },
      { x: i + e, y: r },
      { x: i + e, y: r + t },
      { x: i, y: r + t },
    ];
  }
}
((e, t, i) => {
  for (var r, a = void 0, s = e.length - 1; s >= 0; s--)
    (r = e[s]) && (a = r(t, i, a) || a);
  a && Mc(t, i, a);
})([t()], Dc.prototype, "type");
var Oc = Object.defineProperty,
  Rc = Object.getOwnPropertyDescriptor,
  zc = (e, t, i, r) => {
    for (
      var a, s = r > 1 ? void 0 : r ? Rc(t, i) : t, n = e.length - 1;
      n >= 0;
      n--
    )
      (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
    return (r && s && Oc(t, i, s), s);
  };
const Nc = Symbol.for("VisualMixin");
function Uc(e) {
  class i extends e {
    static VISUAL_MIXIN = Nc;
    _position = { x: 0, y: 0 };
    _layoutCache = { width: 100, height: 100 };
    _height;
    _width;
    _aspectRatio;
    _keepAspectRatio = !1;
    _mask;
    constraints = { horizontal: "MIN", vertical: "MIN" };
    anchorX = 0;
    anchorY = 0;
    scaleX = 1;
    scaleY = 1;
    translateX = 0;
    translateY = 0;
    rotation = 0;
    opacity = 100;
    effects = [];
    blendMode;
    get x() {
      return this._position.x;
    }
    set x(e) {
      "string" == typeof e
        ? ((this._position.x = $(e, this._layoutCache.width)),
          (this.constraints.horizontal =
            "SCALE" == this.constraints.horizontal ? "SCALE" : "CENTER"))
        : (this._position.x = e);
    }
    get y() {
      return this._position.y;
    }
    set y(e) {
      "string" == typeof e
        ? ((this._position.y = $(e, this._layoutCache.height)),
          (this.constraints.vertical =
            "SCALE" == this.constraints.vertical ? "SCALE" : "CENTER"))
        : (this._position.y = e);
    }
    get filter() {
      return this.effects.length > 0
        ? this.effects
            .map((e) => {
              switch (e.type) {
                case "url":
                  return `url(${e.value})`;
                case "blur":
                  return `blur(${e.value}px)`;
                case "brightness":
                  return `brightness(${e.value}%)`;
                case "contrast":
                  return `contrast(${e.value}%)`;
                case "drop-shadow":
                  return `drop-shadow(${e.value.offsetX}px ${e.value.offsetY}px ${e.value.blur}px ${e.value.color})`;
                case "grayscale":
                  return `grayscale(${e.value}%)`;
                case "hue-rotate":
                  return `hue-rotate(${e.value}deg)`;
                case "invert":
                  return `invert(${e.value}%)`;
                case "opacity":
                  return `opacity(${e.value}%)`;
                case "saturate":
                  return `saturate(${e.value}%)`;
                case "sepia":
                  return `sepia(${e.value}%)`;
                default:
                  return "";
              }
            })
            .join(" ")
            .trim()
        : "none";
    }
    get translate() {
      return { x: this.translateX, y: this.translateY };
    }
    set translate(e) {
      "number" == typeof e
        ? ((this.translateX = e), (this.translateY = e))
        : ((this.translateX = e.x), (this.translateY = e.y));
    }
    get anchor() {
      return { x: this.anchorX, y: this.anchorY };
    }
    set anchor(e) {
      "number" == typeof e
        ? ((this.anchorX = e), (this.anchorY = e))
        : ((this.anchorX = e.x), (this.anchorY = e.y));
    }
    get scale() {
      return { x: this.scaleX, y: this.scaleY };
    }
    set scale(e) {
      "number" == typeof e
        ? ((this.scaleX = e), (this.scaleY = e))
        : ((this.scaleX = e.x), (this.scaleY = e.y));
    }
    get mask() {
      return this._mask;
    }
    set mask(e) {
      ((this._mask = e), this._mask?.connect(this));
    }
    get keepAspectRatio() {
      return this._keepAspectRatio;
    }
    set keepAspectRatio(e) {
      if (
        (((e || !this._keepAspectRatio || this._height) && this._width) ||
          ((this._height = this.height), (this._width = this.width)),
        e && !this._keepAspectRatio && this._height && this._width)
      ) {
        const { width: e, height: t } = this.size;
        this._aspectRatio = e / t;
      }
      this._keepAspectRatio = e;
    }
    get aspectRatio() {
      return this._aspectRatio ?? this.source?.aspectRatio ?? 1;
    }
    set aspectRatio(e) {
      this._aspectRatio = e;
    }
    get height() {
      return !this._height && this._width && this.keepAspectRatio
        ? this.width / this.aspectRatio
        : (this._height ?? this.source?.height ?? 0);
    }
    set height(e) {
      (null != e &&
        this._width &&
        this.keepAspectRatio &&
        (this._width = void 0),
        "string" == typeof e
          ? ((this.constraints.vertical = "SCALE"),
            (this._height = $(e, this._layoutCache.height)))
          : (this._height = e));
    }
    get width() {
      return !this._width && this._height && this.keepAspectRatio
        ? this.height * this.aspectRatio
        : (this._width ?? this.source?.width ?? 0);
    }
    set width(e) {
      (null != e &&
        this._height &&
        this.keepAspectRatio &&
        (this._height = void 0),
        "string" == typeof e
          ? ((this.constraints.horizontal = "SCALE"),
            (this._width = $(e, this._layoutCache.width)))
          : (this._width = e));
    }
    get position() {
      return { x: this.x, y: this.y };
    }
    set position(e) {
      if ("string" == typeof e)
        return (
          (this.x = 0.5 * this._layoutCache.width),
          (this.y = 0.5 * this._layoutCache.height),
          (this.anchor = 0.5),
          (this.constraints.horizontal =
            "SCALE" == this.constraints.horizontal ? "SCALE" : "CENTER"),
          void (this.constraints.vertical =
            "SCALE" == this.constraints.vertical ? "SCALE" : "CENTER")
        );
      ("string" == typeof e.x
        ? ((this.x = $(e.x, this._layoutCache.width)),
          (this.constraints.horizontal =
            "SCALE" == this.constraints.horizontal ? "SCALE" : "CENTER"))
        : (this.x = e.x),
        "string" == typeof e.y
          ? ((this.y = $(e.y, this._layoutCache.height)),
            (this.constraints.vertical =
              "SCALE" == this.constraints.vertical ? "SCALE" : "CENTER"))
          : (this.y = e.y));
    }
    animate(e) {
      return (super.animate(e), this.mask?.animate(e), this);
    }
    layout(e) {
      const { horizontal: t, vertical: i } = this.constraints,
        r = this._layoutCache;
      switch (t) {
        case "MIN":
          break;
        case "MAX":
          this.x = e.width - (r.width - this.x);
          break;
        case "CENTER":
          const t = this.x / r.width;
          this.x = t * e.width;
          break;
        case "SCALE":
          const i = this.width / r.width;
          ((this.x = this.x * (e.width / r.width)), (this.width = e.width * i));
          break;
        case "STRETCH":
          const a = this.x - this.width * this.anchorX,
            s = this.x + this.width * (1 - this.anchorX),
            n = a,
            o = r.width - s,
            c = e.width - n - o;
          ((this.width = c), (this.x = n + c * this.anchorX));
      }
      switch (i) {
        case "MIN":
          break;
        case "MAX":
          this.y = e.height - (r.height - this.y);
          break;
        case "CENTER":
          const t = this.y / r.height;
          this.y = t * e.height;
          break;
        case "SCALE":
          const i = this.height / r.height;
          ((this.y = this.y * (e.height / r.height)),
            (this.height = e.height * i));
          break;
        case "STRETCH":
          const a = this.y - this.height * this.anchorY,
            s = this.y + this.height * (1 - this.anchorY),
            n = a,
            o = r.height - s,
            c = e.height - n - o;
          ((this.height = c), (this.y = n + c * this.anchorY));
      }
      this._layoutCache = { width: e.width, height: e.height };
    }
    get size() {
      return { width: this.width, height: this.height };
    }
    get bounds() {
      let { width: e, height: t } = this.size;
      ((e *= this.scaleX), (t *= this.scaleY));
      const i = this.x + this.translateX,
        r = this.y + this.translateY,
        a = e * this.anchorX,
        s = t * this.anchorY,
        n = [
          { x: -a, y: -s },
          { x: e - a, y: -s },
          { x: e - a, y: t - s },
          { x: -a, y: t - s },
        ];
      if (0 !== this.rotation) {
        const e = (this.rotation * Math.PI) / 180,
          t = Math.cos(e),
          i = Math.sin(e);
        for (const r of n) {
          const e = r.x,
            a = r.y;
          ((r.x = e * t - a * i), (r.y = e * i + a * t));
        }
      }
      for (const o of n) ((o.x += i), (o.y += r));
      return n;
    }
  }
  return (
    zc([t(void 0, "layoutCache")], i.prototype, "_layoutCache", 2),
    zc([t(void 0, "height")], i.prototype, "_height", 2),
    zc([t(void 0, "width")], i.prototype, "_width", 2),
    zc([t(void 0, "aspectRatio")], i.prototype, "_aspectRatio", 2),
    zc([t(void 0, "keepAspectRatio")], i.prototype, "_keepAspectRatio", 2),
    zc([t(Bc, "mask")], i.prototype, "_mask", 2),
    zc([t()], i.prototype, "constraints", 2),
    zc([t()], i.prototype, "anchorX", 2),
    zc([t()], i.prototype, "anchorY", 2),
    zc([t()], i.prototype, "scaleX", 2),
    zc([t()], i.prototype, "scaleY", 2),
    zc([t()], i.prototype, "translateX", 2),
    zc([t()], i.prototype, "translateY", 2),
    zc([t()], i.prototype, "rotation", 2),
    zc([t()], i.prototype, "opacity", 2),
    zc([t()], i.prototype, "effects", 2),
    zc([t()], i.prototype, "blendMode", 2),
    zc([t()], i.prototype, "x", 1),
    zc([t()], i.prototype, "y", 1),
    i
  );
}
function Lc(e) {
  if (!e || "object" != typeof e) return !1;
  let t = e.constructor;
  for (; t; ) {
    if (t.VISUAL_MIXIN === Nc) return !0;
    t = Object.getPrototypeOf(t);
  }
  return !1;
}
function Vc(e) {
  return Lc(e);
}
var Wc = Object.getOwnPropertyDescriptor;
let Hc = class extends Uc(vc) {
  _keepAspectRatio = !0;
  type = "IMAGE";
  animations = [];
  constructor(e, t = {}) {
    (super(), (this.source = e), Object.assign(this, t));
  }
  async init() {
    this.input && !this.source && (this.source = await uc.from(this.input));
  }
  render(e) {
    if (!this.source) return;
    const { width: t, height: i } = this.size,
      r = e.videoCtx;
    (r.save(),
      this.mask && r.clip(this.mask.draw(e), this.mask.fillRule),
      (r.globalCompositeOperation = this.blendMode ?? "source-over"),
      (r.filter = this.filter ?? "none"),
      (r.globalAlpha *= this.opacity / 100),
      r.translate(0 | this.position.x, 0 | this.position.y),
      r.translate(0 | this.translate.x, 0 | this.translate.y),
      r.rotate((this.rotation * Math.PI) / 180),
      r.scale(this.scale.x, this.scale.y),
      r.drawImage(
        this.source.element,
        (-this.anchor.x * t) | 0,
        (-this.anchor.y * i) | 0,
        0 | t,
        0 | i,
      ),
      r.restore());
  }
};
function $c(e, t) {
  return "lower" == t
    ? e.toLocaleLowerCase()
    : "upper" == t
      ? e.toUpperCase()
      : e;
}
function jc(e) {
  return -1 === e.indexOf(" ") ? [e] : e.match(/[^]*? |[^]+$/g) || [e];
}
Hc = ((e, t, i, r) => {
  for (
    var a, s = r > 1 ? void 0 : r ? Wc(t, i) : t, n = e.length - 1;
    n >= 0;
    n--
  )
    (a = e[n]) && (s = a(s) || s);
  return s;
})([i("ImageClip")], Hc);
class qc {
  offset;
  chars;
  metrics;
  style;
  padding = { x: 0, y: 0 };
  line = { offsetX: 0, offsetY: 0, baseline: 0, height: 0 };
  constructor(e) {
    ((this.chars = e.chars),
      (this.offset = e.offset),
      (this.metrics = e.metrics),
      (this.style = e.style ?? {}));
  }
  get width() {
    return 0 | this.metrics.width;
  }
  get height() {
    return (
      (this.metrics.fontBoundingBoxAscent +
        this.metrics.fontBoundingBoxDescent) |
      0
    );
  }
  get x() {
    return (this.offset + this.padding.x + this.line.offsetX) | 0;
  }
  get y() {
    return (this.line.offsetY + this.line.baseline + this.padding.y) | 0;
  }
  get bounds() {
    return {
      top:
        (this.line.offsetY +
          this.padding.y +
          this.line.baseline -
          this.metrics.actualBoundingBoxAscent) |
        0,
      right:
        (this.offset +
          this.line.offsetX +
          this.padding.x +
          this.metrics.actualBoundingBoxRight) |
        0,
      bottom:
        (this.line.offsetY +
          this.padding.y +
          this.line.baseline +
          this.metrics.actualBoundingBoxDescent) |
        0,
      left:
        (this.offset +
          this.line.offsetX +
          this.padding.x -
          this.metrics.actualBoundingBoxLeft) |
        0,
    };
  }
}
class Kc {
  text = "";
  font = { family: "sans-serif", size: 16 };
  color = "#FFFFFF";
  maxWidth = Number.MAX_SAFE_INTEGER;
  resolution = 1;
  leading = 1;
  opacity = 100;
  casing;
  align = "left";
  baseline = "top";
  shadows = [];
  strokes = [];
  styles = [];
  glow;
}
class Qc extends Kc {
  isDirty = !0;
  canvas = document.createElement("canvas");
  ctx;
  padding = { x: 0, y: 0 };
  lines = [];
  constructor({ alpha: e = !0, willReadFrequently: t = !1, ...i } = {}) {
    (super(), Object.assign(this, i));
    const r = this.canvas.getContext("2d", { alpha: e, willReadFrequently: t });
    if (!r) throw new Error("Could not get 2D context for shared canvas");
    ((this.ctx = r),
      (this.ctx.imageSmoothingEnabled = !1),
      (this.ctx.textAlign = "left"));
    const a = Object.keys(new Kc());
    return new Proxy(this, {
      set: (e, t, i) => {
        if (a.includes(t.toString())) {
          const r = e[t];
          "object" == typeof i && null !== i
            ? (r && JSON.stringify(r) === JSON.stringify(i)) || (e.isDirty = !0)
            : r !== i && (e.isDirty = !0);
        }
        return ((e[t] = i), !0);
      },
    });
  }
  get width() {
    return this.canvas.width / this.resolution;
  }
  get height() {
    return this.canvas.height / this.resolution;
  }
  get fontSize() {
    return this.font.size;
  }
  set fontSize(e) {
    this.font.size = e;
  }
  render() {
    this.isDirty &&
      ((this.lines = this.getLines()),
      this.alignLines(this.lines),
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height),
      this.renderLines(this.lines),
      (this.isDirty = !1));
  }
  alignLines(e) {
    const t = e.map((e) => e.reduce((e, t) => e + t.width, 0)),
      i = e.map((e) => Math.max(...e.map((e) => e.height))),
      r = Math.max(...t),
      a = i.reduce(
        (e, t, r) => e + t * (r < i.length - 1 ? this.leading : 1),
        0,
      );
    let s = 0,
      n = 0,
      o = 0,
      c = 0,
      l = 0;
    (this.shadows.length &&
      ((s = Math.max(
        ...this.shadows.map((e) => (e?.blur ?? 8) * this.resolution),
        0,
      )),
      (n =
        Math.max(
          ...this.shadows.map((e) =>
            Math.abs((e?.offsetX ?? 0) * this.resolution),
          ),
          0,
        ) + s),
      (o =
        Math.max(
          ...this.shadows.map((e) =>
            Math.abs((e?.offsetY ?? 0) * this.resolution),
          ),
          0,
        ) + s)),
      this.strokes.length &&
        (c = Math.max(
          ...this.strokes.map(
            (e) => (e.width ?? 2) * this.resolution * 3 * 0.5,
          ),
          0,
        )),
      this.glow && (l = (this.glow?.radius ?? 10) * this.resolution * 2),
      (this.padding = {
        x: (2 + Math.max(n + c, l)) | 0,
        y: (2 + Math.max(o + c, l)) | 0,
      }));
    const h = (r + 2 * this.padding.x) | 0,
      d = (a + 2 * this.padding.y) | 0;
    (this.canvas.width === h && this.canvas.height === d) ||
      ((this.canvas.width = h),
      (this.canvas.height = d),
      (this.ctx.imageSmoothingEnabled = !1));
    const u = { offsetX: 0, offsetY: 0, baseline: 0, height: 0 };
    for (let m = 0; m < e.length; m++) {
      if (
        ((u.height = i[m]),
        "left" === this.align
          ? (u.offsetX = 0)
          : "center" === this.align
            ? (u.offsetX = (r - t[m]) / 2)
            : "right" === this.align && (u.offsetX = r - t[m]),
        "top" === this.baseline)
      )
        u.baseline = 0;
      else if ("middle" === this.baseline) u.baseline = i[m] / 2;
      else if ("bottom" === this.baseline) u.baseline = i[m];
      else if ("alphabetic" === this.baseline) {
        const t = Math.max(...e[m].map((e) => e.metrics.fontBoundingBoxAscent));
        u.baseline = t || 0.75 * i[m];
      }
      for (const t of e[m])
        ((t.line = { ...u }), (t.padding = { ...this.padding }));
      u.offsetY += i[m] * this.leading;
    }
  }
  renderLines(e) {
    const t = e.flat();
    this.ctx.save();
    for (const i of t) {
      this.applyFont({
        ...this.font,
        ...i.style?.font,
        fontSize: i.style?.fontSize,
        color: i.style?.color ?? this.color,
        opacity: i.style?.opacity ?? this.opacity,
      });
      const e = (i.style?.strokes ?? this.strokes).at(0);
      e && this.applyStroke(e);
      for (const t of i.style?.shadows ?? this.shadows)
        (this.applyShadow(t),
          (i.style?.strokes ?? this.strokes).length
            ? this.ctx.strokeText(i.chars, i.x, i.y)
            : this.ctx.fillText(i.chars, i.x, i.y));
    }
    (this.ctx.restore(), this.ctx.save());
    for (const i of t) {
      this.applyFont({
        ...this.font,
        ...i.style?.font,
        fontSize: i.style?.fontSize,
      });
      for (const e of i.style?.strokes ?? this.strokes)
        (this.applyStroke(e), this.ctx.strokeText(i.chars, i.x, i.y));
    }
    (this.ctx.restore(), this.ctx.save());
    for (const i of t)
      (this.applyFont({
        ...this.font,
        ...i.style?.font,
        fontSize: i.style?.fontSize,
        color: i.style?.color ?? this.color,
        opacity: i.style?.opacity ?? this.opacity,
      }),
        this.ctx.fillText(i.chars, i.x, i.y));
    (this.ctx.restore(), this.ctx.save());
    for (const i of t) {
      this.applyFont({
        ...this.font,
        ...i.style?.font,
        fontSize: i.style?.fontSize,
        color: i.style?.color ?? this.color,
        opacity: i.style?.opacity ?? this.opacity,
      });
      const e = i.style?.glow ?? this.glow;
      if (e) {
        this.applyGlow(e);
        for (let t = 0; t < (e.intensity ?? 1); t++)
          this.ctx.fillText(i.chars, i.x, i.y);
      }
    }
    this.ctx.restore();
  }
  getLines() {
    const e = [[]];
    let t = 0;
    for (const { words: i, style: r } of (function (e, t = []) {
      if (0 === t.length) return [{ words: jc(e) }];
      t.sort((e, t) => e.start - t.start);
      const i = [];
      let r = 0;
      for (const a of t) {
        if (a.start > r) {
          const t = e.slice(r, a.start);
          t && i.push({ words: jc(t) });
        }
        const t = a.end ?? e.length,
          s = e.slice(a.start, t);
        (s && i.push({ words: jc(s), style: a.style }), (r = t));
      }
      if (r < e.length) {
        const t = e.slice(r);
        t && i.push({ words: jc(t) });
      }
      return i;
    })(this.text, this.styles)) {
      this.applyFont({ ...this.font, ...r?.font, fontSize: r?.fontSize });
      for (const a of i) {
        const i = a.split("\n");
        for (let a = 0; a < i.length; a++) {
          const s = $c(i[a], r?.casing ?? this.casing),
            n = this.ctx.measureText(s);
          (t + n.width > this.maxWidth && t > 0 && (e.push([]), (t = 0)),
            e[e.length - 1].push(
              new qc({ chars: s, style: r, metrics: n, offset: t }),
            ),
            (t += n.width),
            a < i.length - 1 && (e.push([]), (t = 0)));
        }
      }
    }
    return e;
  }
  applyFont({
    style: e,
    weight: t,
    size: i,
    family: r,
    color: a,
    fontSize: s,
    opacity: n,
  }) {
    ((this.ctx.font =
      `${e ?? "normal"} ${t ?? "400"} ${3 * (s ?? i) * this.resolution}px ${r}`.trim()),
      (this.ctx.fillStyle = a ? H(a, n) : "transparent"),
      (this.ctx.textBaseline = this.baseline));
  }
  applyShadow({
    offsetX: e = 0,
    offsetY: t = 0,
    blur: i = 8,
    color: r = "#000000",
    opacity: a = 80,
  }) {
    ((this.ctx.shadowOffsetX = e * this.resolution),
      (this.ctx.shadowOffsetY = t * this.resolution),
      (this.ctx.shadowBlur = i * this.resolution),
      (this.ctx.shadowColor = H(r, a)));
  }
  applyStroke({
    width: e = 2,
    color: t = "#000000",
    lineCap: i = "butt",
    lineJoin: r = "miter",
    miterLimit: a = 2,
    opacity: s = 100,
  }) {
    ((this.ctx.lineWidth = e * this.resolution * 3),
      (this.ctx.lineCap = i),
      (this.ctx.lineJoin = r),
      (this.ctx.miterLimit = a),
      (this.ctx.strokeStyle = H(t, s)));
  }
  applyGlow({ radius: e = 10, opacity: t = 100 }) {
    ((this.ctx.filter = `blur(${e * this.resolution}px)`),
      (this.ctx.globalAlpha = t / 100),
      (this.ctx.globalCompositeOperation = "lighter"));
  }
}
const Xc = { center: 0.5, left: 0, right: 1 },
  Gc = { top: 0, middle: 0.5, alphabetic: 0.75, bottom: 1 };
var Yc = Object.defineProperty,
  Jc = Object.getOwnPropertyDescriptor,
  Zc = (e, t, i, r) => {
    for (
      var a, s = r > 1 ? void 0 : r ? Jc(t, i) : t, n = e.length - 1;
      n >= 0;
      n--
    )
      (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
    return (r && s && Yc(t, i, s), s);
  };
let el = class extends Uc(vc) {
  node = new Qc();
  type = "TEXT";
  animations = [];
  background;
  maxWidth;
  constructor(e = {}) {
    (super(), Object.assign(this, e));
  }
  get text() {
    return this.node.text;
  }
  set text(e) {
    this.node.text = e;
  }
  get color() {
    return this.node.color;
  }
  set color(e) {
    this.node.color = e;
  }
  get font() {
    return this.node.font;
  }
  set font(e) {
    this.node.font = e;
  }
  get casing() {
    return this.node.casing;
  }
  set casing(e) {
    this.node.casing = e;
  }
  get align() {
    return this.node.align;
  }
  set align(e) {
    ((this.anchor = { x: Xc[e], y: this.anchor.y }), (this.node.align = e));
  }
  get baseline() {
    return this.node.baseline;
  }
  set baseline(e) {
    ((this.anchor = { x: this.anchor.x, y: Gc[e] }), (this.node.baseline = e));
  }
  get strokes() {
    return this.node.strokes;
  }
  set strokes(e) {
    this.node.strokes = e;
  }
  get shadows() {
    return this.node.shadows;
  }
  set shadows(e) {
    this.node.shadows = e;
  }
  get leading() {
    return this.node.leading;
  }
  set leading(e) {
    this.node.leading = e;
  }
  get glow() {
    return this.node.glow;
  }
  set glow(e) {
    this.node.glow = e;
  }
  get styles() {
    return this.node.styles;
  }
  set styles(e) {
    this.node.styles = e;
  }
  render(e) {
    ((this.node.resolution = e.resolution),
      (this.node.maxWidth =
        this._width || $(this.maxWidth ?? Number.POSITIVE_INFINITY, e.width)),
      this.node.render());
    const t = this.node.height - 2 * this.node.padding.y,
      i = this.node.width - 2 * this.node.padding.x,
      r = e.videoCtx;
    if (
      (r.save(),
      this.mask && r.clip(this.mask.draw(e), this.mask.fillRule),
      (r.globalCompositeOperation = this.blendMode ?? "source-over"),
      (r.filter = this.filter ?? "none"),
      (r.globalAlpha *= this.opacity / 100),
      r.translate(0 | this.position.x, 0 | this.position.y),
      r.translate(0 | this.translate.x, 0 | this.translate.y),
      r.rotate((this.rotation * Math.PI) / 180),
      r.scale(this.scale.x, this.scale.y),
      this.background)
    ) {
      const e = this.background.padding ?? { x: 30, y: 20 };
      (r.save(),
        r.beginPath(),
        r.roundRect(
          (-this.anchor.x * i - e.x) | 0,
          (-this.anchor.y * t - e.y) | 0,
          (i + 2 * e.x) | 0,
          (0.95 * t + 2 * e.y) | 0,
          0 | (this.background.borderRadius ?? 20),
        ),
        r.closePath(),
        (r.globalAlpha *= (this.background.opacity ?? 100) / 100),
        (r.fillStyle = this.background.fill ?? "#000000"),
        r.fill(),
        r.restore());
    }
    (r.translate(
      (-this.anchor.x * i - this.node.padding.x) | 0,
      (-this.anchor.y * t - this.node.padding.y) | 0,
    ),
      r.drawImage(this.node.canvas, 0, 0, this.node.width, this.node.height),
      r.restore());
  }
  get width() {
    return Math.max(this._width ?? 0, this.node.width);
  }
  set width(e) {
    ((super.width = e), (this.maxWidth = e));
  }
  get height() {
    return this.node.height;
  }
  set height(e) {
    console.error("This method is not supported for text clips");
  }
  get fontSize() {
    return this.font.size;
  }
  set fontSize(e) {
    this.font.size = e;
  }
  get name() {
    return this.text;
  }
  get position() {
    return super.position;
  }
  set position(e) {
    ((super.position = e),
      "center" === e && ((this.align = "center"), (this.baseline = "middle")));
  }
  get lines() {
    return this.node.lines;
  }
};
(Zc([t()], el.prototype, "background", 2),
  Zc([t()], el.prototype, "maxWidth", 2),
  Zc([t()], el.prototype, "text", 1),
  Zc([t()], el.prototype, "color", 1),
  Zc([t()], el.prototype, "font", 1),
  Zc([t()], el.prototype, "casing", 1),
  Zc([t()], el.prototype, "align", 1),
  Zc([t()], el.prototype, "baseline", 1),
  Zc([t()], el.prototype, "strokes", 1),
  Zc([t()], el.prototype, "shadows", 1),
  Zc([t()], el.prototype, "leading", 1),
  Zc([t()], el.prototype, "glow", 1),
  Zc([t()], el.prototype, "styles", 1),
  (el = Zc([i("TextClip")], el)));
let tl = class {
  clip;
  context;
  gainNode;
  sink;
  iterator = null;
  mutex = new p();
  firstBuffer = null;
  lastBuffer = null;
  audioNodes = /* @__PURE__ */ new Set();
  nextTimestamp = 0;
  constructor(e) {
    this.clip = e;
  }
  async init(e, t) {
    (m(this.clip.source.audioTrack),
      (this.context = e),
      (this.sink = new Xi(this.clip.source.audioTrack)),
      (this.gainNode = e.createGain()),
      this.gainNode.connect(t));
  }
  async play(e, t, i) {
    ((t = d(t, this.clip.range[0], this.clip.range[1])),
      (i = d(i, this.clip.range[0], this.clip.range[1])));
    const r = await this.mutex.acquire();
    try {
      for (
        (!this.iterator ||
          (this.firstBuffer &&
            (t < this.firstBuffer.timestamp ||
              this.lastBuffer.timestamp < t - 1))) &&
        ((this.iterator = this.sink.buffers(t)),
        (this.firstBuffer = null),
        (this.lastBuffer = null));
        ;

      ) {
        const t = (await this.iterator.next()).value;
        if (!t) break;
        if (
          (this.firstBuffer || (this.nextTimestamp = t.timestamp),
          this.lastBuffer)
        ) {
          const i = Math.round(
            t.timestamp -
              (this.lastBuffer.timestamp + this.lastBuffer.duration),
          );
          i > 0 &&
            this.playAudio(
              e,
              Array(this.clip.source.audioTrack.numberOfChannels).fill(
                new Float32Array(i),
              ),
            );
        }
        ((this.firstBuffer ??= t), (this.lastBuffer = t));
        const r = [];
        for (let e = 0; e < t.buffer.numberOfChannels; e++) {
          const i = t.buffer.getChannelData(e);
          r.push(i);
        }
        if ((this.playAudio(e, r), t.timestamp >= i)) break;
      }
    } finally {
      r();
    }
  }
  playAudio(e, t) {
    if (!t) return;
    const i = new AudioBuffer({
      length: t[0].length,
      sampleRate: this.clip.source.audioTrack.sampleRate,
      numberOfChannels: t.length,
    });
    for (let h = 0; h < t.length; h++) i.copyToChannel(t[h], h);
    const r = this.nextTimestamp;
    this.nextTimestamp += i.duration;
    let a =
        (e.audioCtx instanceof OfflineAudioContext
          ? 0
          : e.hardwareOffset - e.playbackOffset) +
        this.clip.delay +
        r,
      s = 0,
      n = i.duration;
    const o = this.clip.end - this.clip.delay;
    r + n > o && (n = o - r);
    const c = this.clip.start - this.clip.delay;
    (r < c && ((a += c - r), (s += c - r)),
      a < this.context.currentTime &&
        ((s = this.context.currentTime - a), (a = this.context.currentTime)),
      (a += 0.5 / this.context.sampleRate),
      (n -= s),
      (n = Math.max(0, n)));
    const l = this.context.createBufferSource();
    ((l.buffer = i),
      l.connect(this.gainNode),
      l.start(a, s, n),
      this.audioNodes.add(l),
      (l.onended = () => this.audioNodes.delete(l)));
  }
  reset() {
    (this.iterator?.return(),
      (this.iterator = null),
      (this.firstBuffer = null),
      (this.lastBuffer = null));
    for (const e of this.audioNodes) e.stop();
    this.audioNodes.clear();
  }
};
function il(e, t) {
  return (
    (e.start >= t[0] && e.start <= t[1]) || (e.end <= t[1] && e.end >= t[0])
  );
}
var rl = Object.defineProperty,
  al = Object.getOwnPropertyDescriptor,
  sl = (e, t, i, r) => {
    for (
      var a, s = r > 1 ? void 0 : r ? al(t, i) : t, n = e.length - 1;
      n >= 0;
      n--
    )
      (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
    return (r && s && rl(t, i, s), s);
  };
let nl = class extends vc {
  _muted = !1;
  _baseVolume = 1;
  _volume = 1;
  _fadeInDurationSeconds = 0;
  _fadeOutDurationSeconds = 0;
  _range = [0, void 0];
  type = "AUDIO";
  audioDecoders = /* @__PURE__ */ new WeakMap();
  constructor(e, t = {}) {
    (super(),
      e && (this.source = e),
      Object.assign(this, t),
      Object.assign(this, { _duration: void 0 }));
  }
  async init(e) {
    ((this.source = e ?? this.source),
      m(this.source, "No source found for audio clip"),
      m(this.source.duration, "No duration found for source"),
      (!this._range[1] || this._range[1] > this.source.duration) &&
        (this._range[1] = D(this.source.duration)));
  }
  async initRenderer(e) {
    if (this.source.audioTrack) {
      const t = new tl(this);
      (await t.init(e.audioCtx, e.audioDestination),
        this.audioDecoders.set(e, t));
    }
  }
  async deinitRenderer(e) {
    if (this.source.audioTrack) {
      const t = this.audioDecoders.get(e);
      t?.reset();
    }
  }
  async pause(e) {
    const t = this.audioDecoders.get(e);
    t?.reset();
  }
  async update(e) {
    const t = this.audioDecoders.get(e);
    if (t) {
      if (e.audioCtx instanceof OfflineAudioContext) {
        const i = e.playbackTime - this.delay,
          r = i + 0.1;
        await t.play(e, i, r);
      }
    }
  }
  ambientUpdate(e) {
    const t = this.audioDecoders.get(e);
    if (
      t &&
      ((t.gainNode.gain.value = this._muted
        ? 0
        : this.baseVolume * this.volume),
      e.playing)
    ) {
      m(!(e.audioCtx instanceof OfflineAudioContext));
      const i = e.playbackTime - this.delay,
        r = i + 0.5;
      t.play(e, i, r);
    }
  }
  async exit(e) {
    await this.pause(e);
  }
  get range() {
    return void 0 === this._range[1]
      ? [this._range[0], D(this.source?.duration)]
      : this._range;
  }
  get start() {
    return this.delay + this.range[0];
  }
  set start(e) {
    this.delay = D(e) - this.range[0];
  }
  get end() {
    return this.delay + this.range[1];
  }
  set end(e) {
    this.delay = D(e) - this.range[1];
  }
  get duration() {
    return this.range[1] - this.range[0];
  }
  set duration(e) {
    const t = D(e),
      i = D(this.source?.duration ?? 0);
    (m(t > 0, "Duration must be positive"),
      (this._range[1] = this.range[0] + t),
      this.source?.duration && this._range[1] > i && (this._range[1] = i),
      this.layer?.verifyUpdate(this));
  }
  get baseVolume() {
    return this._baseVolume;
  }
  set baseVolume(e) {
    this._baseVolume = e;
  }
  get volume() {
    return this._volume;
  }
  set volume(e) {
    this._volume = Math.max(0, Math.min(1, e));
  }
  set range(e) {
    let t = D(e[0] ?? this.range[0]),
      i = D(e[1] ?? this.range[1]);
    (m(i > t, "Start can't lower than or equal the end"),
      (this._range = [
        Math.max(t, 0),
        Math.min(i, this.source?.duration ?? Number.POSITIVE_INFINITY),
      ]),
      this.layer?.verifyUpdate(this));
  }
  get muted() {
    return this._muted;
  }
  set muted(e) {
    this._muted = e;
  }
  get fadeInDurationSeconds() {
    return this._fadeInDurationSeconds;
  }
  set fadeInDurationSeconds(e) {
    ((this._fadeInDurationSeconds = d(
      e,
      0,
      this.duration - this.fadeOutDurationSeconds,
    )),
      this.updateAudioRampingKeyframes());
  }
  get fadeOutDurationSeconds() {
    return this._fadeOutDurationSeconds;
  }
  set fadeOutDurationSeconds(e) {
    ((this._fadeOutDurationSeconds = d(
      e,
      0,
      this.duration - this.fadeInDurationSeconds,
    )),
      this.updateAudioRampingKeyframes());
  }
  updateAudioRampingKeyframes() {
    if (
      ((this._fadeInDurationSeconds = Math.min(
        this.fadeInDurationSeconds,
        this.duration,
      )),
      (this._fadeOutDurationSeconds = Math.min(
        this.fadeOutDurationSeconds,
        this.duration,
      )),
      (this.animations = this.animations.filter((e) => "volume" !== e.key)),
      0 === this.fadeInDurationSeconds && 0 === this.fadeOutDurationSeconds)
    )
      return;
    const e = { key: "volume", easing: "log-linear", frames: [] };
    (this.animations.push(e),
      this.fadeInDurationSeconds > 0 &&
        e.frames.push(
          { time: 0, value: 0.001 },
          { time: this.fadeInDurationSeconds, value: 1 },
        ),
      this.fadeOutDurationSeconds > 0 &&
        e.frames.push(
          { time: this.duration - this.fadeOutDurationSeconds, value: 1 },
          { time: this.duration, value: 0.001 },
        ));
  }
  trim(e = this.start, t = this.end) {
    ((e = D(e)), (t = D(t)));
    const i = e - this.delay,
      r = t - this.delay;
    return ((this.range = [i, r]), this);
  }
  async split(e) {
    (m(
      (e = D(e ?? this.layer?.composition?.renderer.playbackTime)) >
        this.start && e < this.end,
      "Cannot split clip at the specified time",
    ),
      m(this.layer, "Layer must be attached to a layer"));
    const t = D(e - this.delay),
      i = this.animate(e).copy();
    ((this._range[1] = t), (i._range[0] = t), (i.animations = []));
    const r = this.layer.clips.findIndex((e) => e.id == this.id);
    return (await this.layer.add(i, r + 1), i);
  }
  async removeSilences(e = {}) {
    if (!this.source) return [this];
    const t = (await this.source.silences(e))
      .filter((e) => il(e, this.range))
      .sort((e, t) => e.start - t.start);
    if (0 == t.length) return [this];
    const i = e.padding ?? 0.5,
      r = [this];
    for (const a of t) {
      const e = r.at(-1);
      if (!e) break;
      if (!il(a, e.range)) continue;
      const t = Math.min(a.start + i, a.end);
      if (a.start > e.range[0] && a.end < e.range[1]) {
        const i = e.copy();
        ((e._range[1] = t), (i._range[0] = a.end), r.push(i));
      } else
        a.start <= e.range[0]
          ? (e._range[0] = a.end)
          : a.end >= e.range[1] && (e._range[1] = t);
    }
    if (this.layer) {
      let e = !1;
      ("SEQUENTIAL" == this.layer.mode &&
        ((e = !0), (this.layer.mode = "DEFAULT")),
        await Promise.all(
          r.map((e) => {
            if (!this.layer?.clips.some((t) => t.id == e.id))
              return this.layer?.add(e);
          }),
        ),
        e && (this.layer.mode = "SEQUENTIAL"));
    }
    return r;
  }
  getBufferRange(e) {
    let t;
    t =
      e.playbackTime > this.start
        ? e.playbackTime - this.delay
        : this.start < 0
          ? Math.abs(this.delay)
          : this.range[0];
    return [t, this.range[1]];
  }
};
(sl([t()], nl.prototype, "range", 1),
  sl([t()], nl.prototype, "baseVolume", 1),
  sl([t()], nl.prototype, "volume", 1),
  sl([t()], nl.prototype, "muted", 1),
  sl([t()], nl.prototype, "fadeInDurationSeconds", 1),
  sl([t()], nl.prototype, "fadeOutDurationSeconds", 1),
  (nl = sl([i("AudioClip")], nl)));
const ol = 331776;
let cl = class {
  constructor(e, t) {
    ((this.source = e),
      (this.hasCache = t),
      (this.canvasSink = new ji(e.videoTrack, { poolSize: 2, fit: "contain" })),
      (this.packetSink = new Ni(e.videoTrack)));
    const i = e.videoTrack.displayWidth * e.videoTrack.displayHeight;
    let r = 1;
    (i > ol && (r = Math.sqrt(ol / i)),
      (this.cacheCanvasWidth = Math.floor(e.videoTrack.displayWidth * r)),
      (this.cacheCanvasHeight = Math.floor(e.videoTrack.displayHeight * r)));
  }
  seeking = !1;
  canvasSink;
  packetSink;
  iterator = null;
  currentFrame = null;
  nextFrame = null;
  frameCache = [];
  cacheCanvasWidth;
  cacheCanvasHeight;
  nextKeyPacket = null;
  lastValue = null;
  frameRate;
  preseekTime;
  async init() {
    ((this.frameRate = (
      await this.source.videoTrack.computePacketStats(50)
    ).averagePacketRate),
      (this.preseekTime = 30 / this.frameRate));
  }
  getCacheEntryFor(e) {
    const t = f(this.frameCache, e, (e) => e.timestamp),
      i = this.frameCache[t];
    return i && e < i.timestamp + i.duration ? i : null;
  }
  async seekTo(e) {
    if (!this.seeking) {
      this.seeking = !0;
      try {
        const t = f(this.frameCache, e, (e) => e.timestamp);
        if (
          (-1 !== t && (this.frameCache.length = t + 1),
          null === this.iterator ||
            (this.currentFrame && this.currentFrame.timestamp > e) ||
            (this.nextKeyPacket &&
              e - this.nextKeyPacket.timestamp > this.preseekTime))
        ) {
          this.iterator && this.iterator.return();
          const t = await this.source.videoTrack.getFirstTimestamp(),
            i = await this.packetSink.getKeyPacket(
              Math.max(t, e - this.preseekTime),
              { metadataOnly: !0 },
            );
          if (!i) return;
          this.nextKeyPacket = await this.packetSink.getNextKeyPacket(i, {
            verifyKeyPackets: !0,
          });
          const r = this.canvasSink.canvases(i.timestamp);
          ((this.iterator = r), (this.nextFrame = null));
          const a = (await r.next())?.value ?? null;
          ((this.currentFrame = a),
            (this.nextFrame = (await r.next())?.value ?? null));
        }
        for (; this.nextFrame && this.nextFrame.timestamp <= e; ) {
          m(this.currentFrame);
          if (
            !this.getCacheEntryFor(
              this.currentFrame.timestamp + this.currentFrame.duration / 2,
            ) &&
            this.hasCache
          ) {
            const e = new OffscreenCanvas(
              this.cacheCanvasWidth,
              this.cacheCanvasHeight,
            );
            e.getContext("2d").drawImage(
              this.currentFrame.canvas,
              0,
              0,
              this.cacheCanvasWidth,
              this.cacheCanvasHeight,
            );
            const t = f(
              this.frameCache,
              this.currentFrame.timestamp,
              (e) => e.timestamp,
            );
            (this.frameCache.splice(t + 1, 0, {
              timestamp: this.currentFrame.timestamp,
              duration: this.currentFrame.duration,
              canvas: e,
            }),
              this.frameCache.length > 150 &&
                this.frameCache.splice(0, this.frameCache.length - 150));
          }
          ((this.currentFrame = this.nextFrame),
            (this.nextFrame = (await this.iterator.next())?.value ?? null));
          const e = await this.packetSink.getPacket(
            this.currentFrame.timestamp,
          );
          e &&
            (this.nextKeyPacket = await this.packetSink.getNextKeyPacket(e, {
              verifyKeyPackets: !0,
            }));
        }
      } finally {
        this.seeking = !1;
      }
    }
  }
  getBestFrameFor(e) {
    let t = null;
    if (
      this.currentFrame &&
      this.currentFrame.timestamp <= e &&
      e < this.currentFrame.timestamp + this.currentFrame.duration
    )
      t = this.currentFrame;
    else {
      const i = f(this.frameCache, e, (e) => e.timestamp),
        r = this.frameCache[i];
      this.currentFrame &&
      this.currentFrame.timestamp <= e &&
      (!r || r.timestamp < this.currentFrame.timestamp)
        ? (t = this.currentFrame)
        : r && (t = r.canvas);
    }
    return (t && (this.lastValue = t), this.lastValue);
  }
  reset() {
    (this.iterator?.return(),
      (this.iterator = null),
      (this.currentFrame = null),
      (this.nextFrame = null),
      (this.lastValue = null),
      (this.nextKeyPacket = null),
      (this.frameCache.length = 0));
  }
};
var ll = Object.getOwnPropertyDescriptor;
let hl = class extends Uc(nl) {
  _keepAspectRatio = !0;
  type = "VIDEO";
  videoDecoders = /* @__PURE__ */ new WeakMap();
  decoderPrimed = !1;
  animations = [];
  constructor(e, t = {}) {
    (super(),
      e && (this.source = e),
      Object.assign(this, t),
      Object.assign(this, { _duration: void 0 }));
  }
  async initRenderer(e) {
    await super.initRenderer(e);
    const t = !(e.audioCtx instanceof OfflineAudioContext),
      i = new cl(this.source, t);
    (await i.init(), this.videoDecoders.set(e, i));
  }
  async update(e) {
    await super.update(e);
    const t = this.videoDecoders.get(e);
    m(t);
    const i = e.playbackTime - this.delay,
      r = t.seekTo(i);
    this.decoderPrimed = !0;
    e.audioCtx instanceof OfflineAudioContext && (await r);
  }
  ambientUpdate(e) {
    super.ambientUpdate(e);
    if (
      !(e.audioCtx instanceof OfflineAudioContext) &&
      this.start - e.playbackTime < 0.5 &&
      this.end > e.playbackTime &&
      !this.decoderPrimed
    ) {
      const t = this.videoDecoders.get(e);
      (m(t), t.seekTo(this.range[0]), (this.decoderPrimed = !0));
    }
  }
  render(e) {
    const { width: t, height: i } = this.size,
      r = e.videoCtx,
      a = this.videoDecoders.get(e);
    m(a);
    const s = e.playbackTime - this.delay,
      n = a.getBestFrameFor(s);
    if (!n) return;
    (r.save(),
      this.mask && r.clip(this.mask.draw(e), this.mask.fillRule),
      (r.globalCompositeOperation = this.blendMode ?? "source-over"),
      (r.filter = this.filter ?? "none"),
      (r.globalAlpha *= this.opacity / 100),
      r.translate(0 | this.position.x, 0 | this.position.y),
      r.translate(0 | this.translate.x, 0 | this.translate.y),
      r.rotate((this.rotation * Math.PI) / 180),
      r.scale(this.scale.x, this.scale.y),
      r.translate((-this.anchor.x * t) | 0, (-this.anchor.y * i) | 0));
    const o = n instanceof OffscreenCanvas ? n : n.canvas;
    (r.drawImage(o, 0, 0, t, i), r.restore());
  }
  async exit(e) {
    await super.exit(e);
    const t = this.videoDecoders.get(e);
    (m(t), t.reset(), (this.decoderPrimed = !1));
  }
  async deinitRenderer(e) {
    super.deinitRenderer(e);
    const t = this.videoDecoders.get(e);
    t?.reset();
  }
};
hl = ((e, t, i, r) => {
  for (
    var a, s = r > 1 ? void 0 : r ? ll(t, i) : t, n = e.length - 1;
    n >= 0;
    n--
  )
    (a = e[n]) && (s = a(s) || s);
  return s;
})([i("VideoClip")], hl);
var dl = Object.defineProperty,
  ul = (e, t, i, r) => {
    for (var a, s = void 0, n = e.length - 1; n >= 0; n--)
      (a = e[n]) && (s = a(t, i, s) || s);
    return (s && dl(t, i, s), s);
  };
class ml extends Uc(vc) {
  fill = "#FFFFFF";
  strokes = [];
  constructor(e = {}) {
    (super(), Object.assign(this, e));
  }
}
(ul([t()], ml.prototype, "fill"), ul([t()], ml.prototype, "strokes"));
var pl = Object.getOwnPropertyDescriptor;
let fl = class extends ml {
  _keepAspectRatio = !0;
  type = "ELLIPSE";
  animations = [];
  constructor(e = {}) {
    (super(), Object.assign(this, { radius: 300, ...e }));
  }
  get radius() {
    const e = this.size;
    return 0.5 * Math.min(e.width, e.height);
  }
  set radius(e) {
    ((this.keepAspectRatio = !0),
      (this.aspectRatio = 1),
      (this.height =
        "number" == typeof e ? 2 * e : 2 * Number(e.replace("%", "")) + "%"));
  }
  get name() {
    return "Ellipse";
  }
  render(e) {
    const { width: t, height: i } = this.size,
      r = e.videoCtx;
    (r.save(),
      this.mask && r.clip(this.mask.draw(e), this.mask.fillRule),
      (r.globalCompositeOperation = this.blendMode ?? "source-over"),
      (r.filter = this.filter ?? "none"),
      (r.globalAlpha *= this.opacity / 100),
      r.translate(0 | this.position.x, 0 | this.position.y),
      r.translate(0 | this.translate.x, 0 | this.translate.y),
      r.rotate((this.rotation * Math.PI) / 180),
      r.scale(this.scale.x, this.scale.y),
      r.translate((-this.anchor.x * t) | 0, (-this.anchor.y * i) | 0),
      r.beginPath(),
      r.ellipse(
        (0.5 * t) | 0,
        (0.5 * i) | 0,
        (0.5 * t) | 0,
        (0.5 * i) | 0,
        0,
        0,
        2 * Math.PI,
      ),
      r.closePath(),
      (r.fillStyle = this.fill),
      r.fill());
    for (const a of this.strokes)
      ((r.strokeStyle = H(a.color, a.opacity)),
        (r.lineWidth = ((a.width ?? 1) * e.textScale) | 0),
        (r.lineCap = a.lineCap ?? "butt"),
        (r.lineJoin = a.lineJoin ?? "miter"),
        (r.miterLimit = 0 | (a.miterLimit ?? 10)),
        r.stroke());
    r.restore();
  }
};
fl = ((e, t, i, r) => {
  for (
    var a, s = r > 1 ? void 0 : r ? pl(t, i) : t, n = e.length - 1;
    n >= 0;
    n--
  )
    (a = e[n]) && (s = a(s) || s);
  return s;
})([i("EllipseClip")], fl);
var gl = Object.defineProperty,
  kl = Object.getOwnPropertyDescriptor,
  yl = (e, t, i, r) => {
    for (
      var a, s = r > 1 ? void 0 : r ? kl(t, i) : t, n = e.length - 1;
      n >= 0;
      n--
    )
      (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
    return (r && s && gl(t, i, s), s);
  };
let wl = class extends ml {
  type = "RECT";
  animations = [];
  radius;
  constructor(e = {}) {
    (super(), Object.assign(this, e));
  }
  get name() {
    return "Rectangle";
  }
  render(e) {
    const { width: t, height: i } = this.size,
      r = $(this.radius ?? 0, Math.min(t, i) / 2),
      a = e.videoCtx;
    (a.save(),
      this.mask && a.clip(this.mask.draw(e), this.mask.fillRule),
      (a.globalCompositeOperation = this.blendMode ?? "source-over"),
      (a.filter = this.filter ?? "none"),
      (a.globalAlpha *= this.opacity / 100),
      a.translate(0 | this.position.x, 0 | this.position.y),
      a.translate(0 | this.translate.x, 0 | this.translate.y),
      a.rotate((this.rotation * Math.PI) / 180),
      a.scale(this.scale.x, this.scale.y),
      a.beginPath(),
      a.roundRect(
        (-this.anchor.x * t) | 0,
        (-this.anchor.y * i) | 0,
        0 | t,
        0 | i,
        0 | r,
      ),
      a.closePath(),
      (a.fillStyle = this.fill),
      a.fill());
    for (const s of this.strokes)
      ((a.strokeStyle = H(s.color, s.opacity)),
        (a.lineWidth = ((s.width ?? 1) * e.textScale) | 0),
        (a.lineCap = s.lineCap ?? "butt"),
        (a.lineJoin = s.lineJoin ?? "miter"),
        a.stroke());
    a.restore();
  }
};
(yl([t()], wl.prototype, "radius", 2), (wl = yl([i("RectangleClip")], wl)));
var bl = Object.defineProperty,
  Tl = Object.getOwnPropertyDescriptor,
  Cl = (e, t, i, r) => {
    for (
      var a, s = r > 1 ? void 0 : r ? Tl(t, i) : t, n = e.length - 1;
      n >= 0;
      n--
    )
      (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
    return (r && s && bl(t, i, s), s);
  };
let Sl = class extends ml {
  type = "POLYGON";
  animations = [];
  sides = 6;
  constructor(e = {}) {
    (super(), Object.assign(this, e));
  }
  get name() {
    return "Polygon";
  }
  render(e) {
    const { width: t, height: i } = this.size,
      r = e.videoCtx;
    (r.save(),
      this.mask && r.clip(this.mask.draw(e), this.mask.fillRule),
      (r.globalCompositeOperation = this.blendMode ?? "source-over"),
      (r.filter = this.filter ?? "none"),
      (r.globalAlpha *= this.opacity / 100),
      r.translate(0 | this.position.x, 0 | this.position.y),
      r.translate(0 | this.translate.x, 0 | this.translate.y),
      r.rotate((this.rotation * Math.PI) / 180),
      r.scale(this.scale.x, this.scale.y),
      r.translate((-this.anchor.x * t) | 0, (-this.anchor.y * i) | 0));
    const a = (0.5 * t) | 0,
      s = (0.5 * i) | 0,
      n = Math.min(t, i) / 2;
    r.beginPath();
    for (let o = 0; o < this.sides; o++) {
      const e = (2 * o * Math.PI) / this.sides - Math.PI / 2,
        t = a + n * Math.cos(e),
        i = s + n * Math.sin(e);
      0 === o ? r.moveTo(t, i) : r.lineTo(t, i);
    }
    (r.closePath(), (r.fillStyle = this.fill), r.fill());
    for (const o of this.strokes)
      ((r.strokeStyle = H(o.color, o.opacity)),
        (r.lineWidth = ((o.width ?? 1) * e.textScale) | 0),
        (r.lineCap = o.lineCap ?? "butt"),
        (r.lineJoin = o.lineJoin ?? "miter"),
        r.stroke());
    r.restore();
  }
};
(Cl([t()], Sl.prototype, "sides", 2), (Sl = Cl([i("PolygonClip")], Sl)));
const vl = {
    "The Bold Font": {
      weights: ["500"],
      url: "https://diffusion-studio-public.s3.eu-central-1.amazonaws.com/fonts/the-bold-font.ttf",
    },
    "Komika Axis": {
      weights: ["400"],
      url: "https://diffusion-studio-public.s3.eu-central-1.amazonaws.com/fonts/komika-axis.ttf",
    },
    Geologica: {
      weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
      url: "https://fonts.gstatic.com/s/geologica/v1/oY1l8evIr7j9P3TN9YwNAdyjzUyDKkKdAGOJh1UlCDUIhAIdhCZOn1fLsig7jfvCCPHZckUWE1lELWNN-w.woff2",
    },
    Nunito: {
      weights: ["200", "300", "400", "500", "600", "700", "800", "900"],
      url: "https://fonts.gstatic.com/s/nunito/v26/XRXV3I6Li01BKofINeaBTMnFcQ.woff2",
    },
    Figtree: {
      weights: ["300", "400", "500", "600", "700", "800", "900"],
      url: "https://fonts.gstatic.com/s/figtree/v5/_Xms-HUzqDCFdgfMm4S9DaRvzig.woff2",
    },
    Urbanist: {
      weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
      url: "https://fonts.gstatic.com/s/urbanist/v15/L0x-DF02iFML4hGCyMqlbS1miXK2.woff2",
    },
    Montserrat: {
      weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
      url: "https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459WlhyyTh89Y.woff2",
    },
    Bangers: {
      weights: ["400"],
      url: "https://fonts.gstatic.com/s/bangers/v20/FeVQS0BTqb0h60ACH55Q2J5hm24.woff2",
    },
    Chewy: {
      weights: ["400"],
      url: "https://fonts.gstatic.com/s/chewy/v18/uK_94ruUb-k-wn52KjI9OPec.woff2",
    },
    "Source Code Pro": {
      weights: ["200", "300", "400", "500", "600", "700", "800", "900"],
      url: "https://fonts.gstatic.com/s/sourcecodepro/v22/HI_SiYsKILxRpg3hIP6sJ7fM7PqlPevWnsUnxg.woff2",
    },
  },
  xl = [
    "Helvetica",
    "Arial",
    "Arial Black",
    "Verdana",
    "Tahoma",
    "Trebuchet MS",
    "Impact",
    "Gill Sans",
    "Times New Roman",
    "Georgia",
    "Palatino",
    "Baskerville",
    "Andalé Mono",
    "Courier",
    "Lucida",
    "Monaco",
    "Bradley Hand",
    "Brush Script MT",
    "Luminari",
    "Comic Sans MS",
  ],
  Pl = {
    100: "Thin",
    200: "Extra Light",
    300: "Light",
    400: "Normal",
    500: "Medium",
    600: "Semi Bold",
    700: "Bold",
    800: "Extra Bold",
    900: "Black",
  };
async function El() {
  const e = {};
  "queryLocalFonts" in window ||
    Object.assign(window, { queryLocalFonts: () => [] });
  for (const t of await window.queryLocalFonts())
    t.family in e ? e[t.family].push(t) : (e[t.family] = [t]);
  return Object.keys(e).map((t) => ({
    family: t,
    variants: e[t].map((e) => ({
      family: t,
      style: Bl(e.style),
      weight: Ml(e.fullName),
      source: `local('${e.fullName}'), local('${e.postscriptName}')`,
    })),
  }));
}
function Il() {
  return Object.keys(vl).map((e) => ({
    family: e,
    variants: vl[e].weights.map((t) => ({
      family: e,
      source: `url(${vl[e].url})`,
      weight: t,
    })),
  }));
}
async function _l(e) {
  let t = "",
    i = 16,
    r = "normal";
  const a = e.weight ?? "400",
    s = e.family;
  ((t =
    "source" in e
      ? e.source.startsWith("https://")
        ? `url(${e.source})`
        : e.source
      : `url(${vl[e.family].url})`),
    "size" in e && void 0 !== e.size && (i = e.size),
    "style" in e && void 0 !== e.style && (r = e.style));
  const n = { source: t, family: s, weight: a, style: r, size: i };
  if (window.loadedFonts.some((e) => e.source === n.source)) return n;
  const o = new FontFace(s, t, { weight: a, style: r });
  return (
    await new Promise((e, t) => {
      o.load()
        .then((t) => {
          (document.fonts.add(t), e(null));
        })
        .catch((e) => {
          t(e);
        });
    }),
    window.loadedFonts.push(n),
    n
  );
}
async function Al(e) {
  for (const t of e) await _l(t);
}
function Fl() {
  return window.loadedFonts;
}
function Bl(e) {
  return `${e}`.match(/oblique/i)
    ? "oblique"
    : `${e}`.match(/italic/i)
      ? "italic"
      : "normal";
}
function Ml(e) {
  return `${e}`.match(/black|heavy/i)
    ? "900"
    : `${e}`.match(/extrabold|ultrabold/i)
      ? "800"
      : `${e}`.match(/bold|strong/i)
        ? "700"
        : `${e}`.match(/semibold|demibold/i)
          ? "600"
          : `${e}`.match(/medium/i)
            ? "500"
            : `${e}`.match(/normal|regular|book/i)
              ? "400"
              : `${e}`.match(/light/i)
                ? "300"
                : `${e}`.match(/extralight|ultralight/i)
                  ? "200"
                  : `${e}`.match(/thin|hairline/i)
                    ? "100"
                    : "400";
}
"undefined" != typeof window && Object.assign(window, { loadedFonts: [] });
var Dl = Object.defineProperty,
  Ol = Object.getOwnPropertyDescriptor;
const Rl = {
    easing: "ease-out",
    frames: [
      { value: 0.94, time: 0 },
      { value: 1, time: 0.25 },
    ],
  },
  zl = {
    easing: "ease-out",
    frames: [
      { value: 0, time: 0 },
      { value: 100, time: 0.134 },
    ],
  },
  Nl = class t extends e {
    static type = "CLASSIC";
    static colors = ["#FFFFFF", "#000000"];
    get type() {
      return t.type;
    }
    applied = !1;
    groups = [];
    init(e) {
      (m(e.source, "No source found for caption clip"),
        (this.groups = e.source.groupBy({ duration: 0.2 })));
    }
    async applyStyles(e) {
      ((e.state = new Kc()),
        (e.font = await _l({ family: "Figtree", weight: "600", size: 27 })),
        (e.position = "center"),
        (e.color = "#FFFFFF"),
        (e.align = "center"),
        (e.baseline = "middle"),
        (e.strokes = [
          { color: "#000000", width: 6, lineJoin: "round", lineCap: "round" },
        ]),
        (e.shadows = [
          { color: "#000000", blur: 0, offsetX: 2.4, offsetY: 3, opacity: 100 },
        ]),
        (e.casing = "lower"),
        (this.applied = !0));
    }
    render(e, t) {
      const i = t.videoCtx,
        r = t.playbackTime - e.delay,
        a = this.groups.find(
          (e) => r >= e[0].start && r <= (e.at(-1)?.end ?? 0),
        );
      if (!a) return;
      const s = r - a[0].start,
        n = a.map((e) => e.text).join(" ");
      ((n === e.currentText && e.node) ||
        ((e.node = new Qc({ ...e.state, text: n })), (e.currentText = n)),
        (e.node.resolution = t.resolution),
        e.node.render());
      const o = e.node.height - 2 * e.node.padding.y,
        c = e.node.width - 2 * e.node.padding.x;
      (i.save(), e.mask && i.clip(e.mask.draw(t)));
      const l = yc(Rl, s),
        h = yc(zl, s);
      ((i.globalCompositeOperation = e.blendMode ?? "source-over"),
        (i.filter = e.filter ?? "none"),
        (i.globalAlpha *= (h / 100) * (e.opacity / 100)),
        i.translate(0 | e.position.x, 0 | e.position.y),
        i.translate(0 | e.translate.x, 0 | e.translate.y),
        i.rotate(e.rotation),
        i.scale(e.scale.x * l, e.scale.y * l),
        i.translate(
          (-e.anchor.x * c - e.node.padding.x) | 0,
          (-e.anchor.y * o - e.node.padding.y) | 0,
        ),
        i.drawImage(e.node.canvas, 0, 0, e.node.width, e.node.height),
        i.restore());
    }
  };
((e, t, i) => {
  for (var r, a = Ol(t, i), s = e.length - 1; s >= 0; s--)
    (r = e[s]) && (a = r(t, i, a) || a);
  a && Dl(t, i, a);
})([t()], Nl.prototype, "type");
let Ul = Nl;
var Ll = Object.defineProperty,
  Vl = Object.getOwnPropertyDescriptor;
const Wl = class t extends e {
  static type = "CASCADE";
  static colors = ["#FFFFFF", "#000000"];
  get type() {
    return t.type;
  }
  applied = !1;
  groups = [];
  init(e) {
    (m(e.source, "No source found for caption clip"),
      (this.groups = e.source.groupBy({ duration: 1.4 })));
  }
  async applyStyles(e) {
    ((e.state = new Kc()),
      (e.font = await _l({ family: "Geologica", weight: "400", size: 20 })),
      (e.align = "left"),
      (e.baseline = "top"),
      (e.maxWidth = "70%"),
      (e.position = { x: "12%", y: "70%" }),
      (e.color = "#FFFFFF"),
      (e.strokes = [{ color: "#000000", width: 4, lineJoin: "round" }]),
      (e.leading = 1.2),
      (e.shadows = [
        {
          color: "#000000",
          blur: 3,
          opacity: 80,
          offsetX: 1.25,
          offsetY: 1.25,
        },
      ]),
      (this.applied = !0));
  }
  render(e, t) {
    const i = t.videoCtx,
      r = t.playbackTime - e.delay,
      a = this.groups.find((e) => r >= e[0].start && r <= (e.at(-1)?.end ?? 0)),
      s = $(e.maxWidth ?? Number.POSITIVE_INFINITY, t.width);
    if (!a) return;
    const n = a
      .filter((e) => e.start <= r)
      .map((e) => e.text)
      .join(" ");
    ((n === e.currentText && e.node) ||
      ((e.node = new Qc({ ...e.state, maxWidth: s, text: n })),
      (e.currentText = n)),
      (e.node.resolution = t.resolution),
      e.node.render());
    const o = e.node.height - 2 * e.node.padding.y,
      c = e.node.width - 2 * e.node.padding.x;
    (i.save(),
      e.mask && i.clip(e.mask.draw(t)),
      (i.globalCompositeOperation = e.blendMode ?? "source-over"),
      (i.filter = e.filter ?? "none"),
      (i.globalAlpha *= e.opacity / 100),
      i.translate(0 | e.position.x, 0 | e.position.y),
      i.translate(0 | e.translate.x, 0 | e.translate.y),
      i.rotate(e.rotation),
      i.scale(e.scale.x, e.scale.y),
      i.translate(
        (-e.anchor.x * c - e.node.padding.x) | 0,
        (-e.anchor.y * o - e.node.padding.y) | 0,
      ),
      i.drawImage(e.node.canvas, 0, 0, e.node.width, e.node.height),
      i.restore());
  }
};
((e, t, i) => {
  for (var r, a = Vl(t, i), s = e.length - 1; s >= 0; s--)
    (r = e[s]) && (a = r(t, i, a) || a);
  a && Ll(t, i, a);
})([t()], Wl.prototype, "type");
let Hl = Wl;
var $l = Object.defineProperty,
  jl = Object.getOwnPropertyDescriptor,
  ql = (e, t, i, r) => {
    for (
      var a, s = r > 1 ? void 0 : r ? jl(t, i) : t, n = e.length - 1;
      n >= 0;
      n--
    )
      (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
    return (r && s && $l(t, i, s), s);
  };
const Kl = class t extends e {
  static type = "GUINEA";
  static colors = ["#FFFFFF", "#000000", "#F55353", "#FEB139", "#F6F54D"];
  get type() {
    return t.type;
  }
  highlightColors = ["#F55353", "#FEB139", "#F6F54D"];
  applied = !1;
  groups = [];
  activeSplit = null;
  init(e) {
    (m(e.source, "No source found for caption clip"),
      (this.groups = e.source.groupBy({ length: 18 })));
  }
  async applyStyles(e) {
    ((e.state = new Kc()),
      (e.font = await _l({ family: "The Bold Font", weight: "500", size: 25 })),
      (e.position = "center"),
      (e.color = "#FFFFFF"),
      (e.align = "center"),
      (e.maxWidth = void 0),
      (e.baseline = "middle"),
      (e.strokes = [{ width: 6, color: "#000000" }]),
      (e.shadows = Array.from({ length: 3 }).map(() => ({
        color: "#000000",
        blur: 50,
        opacity: 70,
      }))),
      (e.glow = { radius: 30, opacity: 30 }),
      (e.casing = "upper"),
      (this.applied = !0));
  }
  render(e, t) {
    const i = t.videoCtx,
      r = t.playbackTime - e.delay,
      a = this.groups.find((e) => r >= e[0].start && r <= (e.at(-1)?.end ?? 0));
    if (!a) return;
    const [s, o] = this.splitSequence(a),
      c = s.map((e) => e.text).join(" "),
      l = `${c}\n${o.map((e) => e.text).join(" ")}`,
      h = r >= o[0].start ? "right" : "left";
    ((e.node && l === e.currentText && this.activeSplit === h) ||
      ((e.node = new Qc({
        ...e.state,
        text: l,
        styles: [
          {
            start: "left" === h ? 0 : c.length,
            end: "left" === h ? c.length : l.length,
            style: {
              fontSize: Math.round(1.1 * e.font.size),
              color: this.highlightColors[n(0, 2)],
            },
          },
        ],
      })),
      (e.currentText = l),
      (this.activeSplit = h)),
      (e.node.resolution = t.resolution),
      e.node.render());
    const d = e.node.height - 2 * e.node.padding.y,
      u = e.node.width - 2 * e.node.padding.x;
    (i.save(),
      e.mask && i.clip(e.mask.draw(t)),
      (i.globalCompositeOperation = e.blendMode ?? "source-over"),
      (i.filter = e.filter ?? "none"),
      (i.globalAlpha *= e.opacity / 100),
      i.translate(0 | e.position.x, 0 | e.position.y),
      i.translate(0 | e.translate.x, 0 | e.translate.y),
      i.rotate(e.rotation),
      i.scale(e.scale.x, e.scale.y),
      i.translate(
        (-e.anchor.x * u - e.node.padding.x) | 0,
        (-e.anchor.y * d - e.node.padding.y) | 0,
      ),
      i.drawImage(e.node.canvas, 0, 0, e.node.width, e.node.height),
      i.restore());
  }
  splitSequence(e) {
    const t = e.map((e) => e.text).join(" "),
      i = Math.ceil(t.length / 2);
    let r = t.length;
    for (let s = i, n = i; s > 0 && n < t.length - 1; s--, n++) {
      if (t[s].match(/ /)) {
        r = s;
        break;
      }
      if (t[n].match(/ /)) {
        r = n;
        break;
      }
    }
    const a = [...s(t, r).map((e) => e.trim())];
    return s(e, a[0].split(/ /).length);
  }
};
(ql([t()], Kl.prototype, "type", 1),
  ql([t()], Kl.prototype, "highlightColors", 2));
let Ql = Kl;
var Xl = Object.defineProperty,
  Gl = Object.getOwnPropertyDescriptor;
const Yl = class t extends e {
  static type = "PAPER";
  static colors = ["#FFFFFF", "#000000"];
  get type() {
    return t.type;
  }
  applied = !1;
  groups = [];
  activeSplit = null;
  secondaryFont = void 0;
  init(e) {
    (m(e.source, "No source found for caption clip"),
      (this.groups = e.source.groupBy({ length: 18 })));
  }
  async applyStyles(e) {
    ((e.state = new Kc()),
      (e.font = await _l({ family: "Montserrat", weight: "300", size: 20 })),
      (this.secondaryFont = await _l({
        family: "Montserrat",
        weight: "500",
        size: 20,
      })),
      (e.position = "center"),
      (e.color = "#FFFFFF"),
      (e.align = "center"),
      (e.maxWidth = void 0),
      (e.baseline = "middle"),
      (e.leading = 0.9),
      (e.shadows = [
        { color: "#000000", blur: 12, opacity: 60, offsetX: 2, offsetY: 2 },
      ]),
      (e.strokes = []),
      (e.casing = void 0),
      (this.applied = !0));
  }
  render(e, t) {
    const i = t.videoCtx,
      r = t.playbackTime - e.delay,
      a = this.groups.find((e) => r >= e[0].start && r <= (e.at(-1)?.end ?? 0));
    if (!a) return;
    const [s, n] = this.splitSequence(a),
      o = s.map((e) => e.text).join(" "),
      c = `${o}\n${n.map((e) => e.text).join(" ")}`,
      l = r >= n[0].start ? "right" : "left";
    (this.secondaryFont && (this.secondaryFont.size = e.font.size),
      (e.node && c === e.currentText && this.activeSplit === l) ||
        ((e.node = new Qc({
          ...e.state,
          text: c,
          styles: [
            {
              start: "left" === l ? 0 : o.length,
              end: "left" === l ? o.length : c.length,
              style: { font: this.secondaryFont },
            },
          ],
        })),
        (e.currentText = c),
        (this.activeSplit = l)),
      (e.node.resolution = t.resolution),
      e.node.render());
    const h = e.node.height - 2 * e.node.padding.y,
      d = e.node.width - 2 * e.node.padding.x;
    (i.save(),
      e.mask && i.clip(e.mask.draw(t)),
      (i.globalCompositeOperation = e.blendMode ?? "source-over"),
      (i.filter = e.filter ?? "none"),
      (i.globalAlpha *= e.opacity / 100),
      i.translate(0 | e.position.x, 0 | e.position.y),
      i.translate(0 | e.translate.x, 0 | e.translate.y),
      i.rotate(e.rotation),
      i.scale(e.scale.x, e.scale.y),
      i.translate(
        (-e.anchor.x * d - e.node.padding.x) | 0,
        (-e.anchor.y * h - e.node.padding.y) | 0,
      ),
      i.drawImage(e.node.canvas, 0, 0, e.node.width, e.node.height),
      i.restore());
  }
  splitSequence(e) {
    const t = e.map((e) => e.text).join(" "),
      i = Math.ceil(t.length / 2);
    let r = t.length;
    for (let s = i, n = i; s > 0 && n < t.length - 1; s--, n++) {
      if (t[s].match(/ /)) {
        r = s;
        break;
      }
      if (t[n].match(/ /)) {
        r = n;
        break;
      }
    }
    const a = [...s(t, r).map((e) => e.trim())];
    return s(e, a[0].split(/ /).length);
  }
};
((e, t, i) => {
  for (var r, a = Gl(t, i), s = e.length - 1; s >= 0; s--)
    (r = e[s]) && (a = r(t, i, a) || a);
  a && Xl(t, i, a);
})([t()], Yl.prototype, "type");
let Jl = Yl;
var Zl = Object.defineProperty,
  eh = Object.getOwnPropertyDescriptor;
const th = {
    easing: "ease-out",
    frames: [
      { value: 0.94, time: 0 },
      { value: 1, time: 0.25 },
    ],
  },
  ih = {
    easing: "ease-out",
    frames: [
      { value: 0, time: 0 },
      { value: 100, time: 0.134 },
    ],
  },
  rh = class t extends e {
    static type = "SOLAR";
    static colors = ["#fffe41", "#ab7a00"];
    get type() {
      return t.type;
    }
    applied = !1;
    groups = [];
    init(e) {
      (m(e.source, "No source found for caption clip"),
        (this.groups = e.source.groupBy({ duration: 0.2 })));
    }
    async applyStyles(e) {
      ((e.state = new Kc()),
        (e.font = await _l({ family: "Urbanist", weight: "800", size: 24 })),
        (e.position = "center"),
        (e.color = "#fffe41"),
        (e.align = "center"),
        (e.baseline = "middle"),
        (e.strokes = [{ color: "#ab7a00", width: 1 }]),
        (e.shadows = [
          { color: "#ab7a00", blur: 0, offsetX: 6, offsetY: 3, opacity: 100 },
          { color: "#ab7a00", blur: 0, offsetX: 4, offsetY: 2, opacity: 100 },
          { color: "#ab7a00", blur: 0, offsetX: 2, offsetY: 1, opacity: 100 },
        ]),
        (e.glow = { radius: 20, intensity: 2, opacity: 40 }),
        (e.casing = "upper"),
        (this.applied = !0));
    }
    render(e, t) {
      const i = t.videoCtx,
        r = t.playbackTime - e.delay,
        a = this.groups.find(
          (e) => r >= e[0].start && r <= (e.at(-1)?.end ?? 0),
        );
      if (!a) return;
      const s = r - a[0].start,
        n = a.map((e) => e.text).join(" ");
      ((n === e.currentText && e.node) ||
        ((e.node = new Qc({ ...e.state, text: n })), (e.currentText = n)),
        (e.node.resolution = t.resolution),
        e.node.render());
      const o = e.node.height - 2 * e.node.padding.y,
        c = e.node.width - 2 * e.node.padding.x;
      (i.save(), e.mask && i.clip(e.mask.draw(t)));
      const l = yc(th, s),
        h = yc(ih, s);
      ((i.globalCompositeOperation = e.blendMode ?? "source-over"),
        (i.filter = e.filter ?? "none"),
        (i.globalAlpha *= (h / 100) * (e.opacity / 100)),
        i.translate(0 | e.position.x, 0 | e.position.y),
        i.translate(0 | e.translate.x, 0 | e.translate.y),
        i.rotate(e.rotation),
        i.scale(e.scale.x * l, e.scale.y * l),
        i.translate(
          (-e.anchor.x * c - e.node.padding.x) | 0,
          (-e.anchor.y * o - e.node.padding.y) | 0,
        ),
        i.drawImage(e.node.canvas, 0, 0, e.node.width, e.node.height),
        i.restore());
    }
  };
((e, t, i) => {
  for (var r, a = eh(t, i), s = e.length - 1; s >= 0; s--)
    (r = e[s]) && (a = r(t, i, a) || a);
  a && Zl(t, i, a);
})([t()], rh.prototype, "type");
let ah = rh;
var sh = Object.defineProperty,
  nh = Object.getOwnPropertyDescriptor,
  oh = (e, t, i, r) => {
    for (
      var a, s = r > 1 ? void 0 : r ? nh(t, i) : t, n = e.length - 1;
      n >= 0;
      n--
    )
      (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
    return (r && s && sh(t, i, s), s);
  };
const ch = {
    easing: "ease-out",
    frames: [
      { value: 0.94, time: 0 },
      { value: 1, time: 0.25 },
    ],
  },
  lh = class t extends e {
    static type = "SPOTLIGHT";
    static colors = ["#FFFFFF", "#000000", "#24D5FF"];
    get type() {
      return t.type;
    }
    highlightColors = ["#24D5FF"];
    applied = !1;
    groups = [];
    currentIndex = null;
    init(e) {
      (m(e.source, "No source found for caption clip"),
        (this.groups = e.source.groupBy({ duration: 0.3 })));
    }
    async applyStyles(e) {
      ((e.state = new Kc()),
        (e.font = await _l({
          family: "The Bold Font",
          weight: "500",
          style: "italic",
          size: 28,
        })),
        (e.position = "center"),
        (e.color = "#FFFFFF"),
        (e.align = "center"),
        (e.baseline = "middle"),
        (e.strokes = [{ width: 6, color: "#000000", lineJoin: "miter" }]),
        (e.shadows = [
          { color: "#000000", blur: 13, opacity: 100, offsetX: 2, offsetY: 2 },
          { color: "#000000", blur: 13, opacity: 100, offsetX: 2, offsetY: 2 },
        ]),
        (e.glow = { radius: 15, intensity: 1, opacity: 45 }),
        (this.applied = !0));
    }
    render(e, t) {
      const i = t.videoCtx,
        r = t.playbackTime - e.delay,
        a = this.groups.find(
          (e) => r >= e[0].start && r <= (e.at(-1)?.end ?? 0),
        );
      if (!a) return;
      const s = r - a[0].start,
        n = a.findIndex((e) => r >= e.start && r <= e.end),
        o = a.map((e) => e.text).join(" ");
      ((o === e.currentText && e.node && n === this.currentIndex) ||
        ((e.node = new Qc({
          ...e.state,
          styles:
            a.length > 1
              ? [
                  {
                    style: { color: this.highlightColors[0] },
                    start: a
                      .slice(0, n)
                      .map((e) => e.text)
                      .join(" ").length,
                    end: a
                      .slice(0, n + 1)
                      .map((e) => e.text)
                      .join(" ").length,
                  },
                ]
              : void 0,
          text: o,
        })),
        (e.currentText = o),
        (this.currentIndex = n)),
        (e.node.resolution = t.resolution),
        e.node.render());
      const c = e.node.height - 2 * e.node.padding.y,
        l = e.node.width - 2 * e.node.padding.x;
      (i.save(), e.mask && i.clip(e.mask.draw(t)));
      const h = yc(ch, s);
      ((i.globalCompositeOperation = e.blendMode ?? "source-over"),
        (i.filter = e.filter ?? "none"),
        (i.globalAlpha *= e.opacity / 100),
        i.translate(0 | e.position.x, 0 | e.position.y),
        i.translate(0 | e.translate.x, 0 | e.translate.y),
        i.rotate(e.rotation),
        i.scale(e.scale.x * h, e.scale.y * h),
        i.translate(
          (-e.anchor.x * l - e.node.padding.x) | 0,
          (-e.anchor.y * c - e.node.padding.y) | 0,
        ),
        i.drawImage(e.node.canvas, 0, 0, e.node.width, e.node.height),
        i.restore());
    }
  };
(oh([t()], lh.prototype, "type", 1),
  oh([t()], lh.prototype, "highlightColors", 2));
let hh = lh;
var dh = Object.defineProperty,
  uh = Object.getOwnPropertyDescriptor,
  mh = (e, t, i, r) => {
    for (
      var a, s = r > 1 ? void 0 : r ? uh(t, i) : t, n = e.length - 1;
      n >= 0;
      n--
    )
      (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
    return (r && s && dh(t, i, s), s);
  };
const ph = {
    easing: "ease-out",
    frames: [
      { value: 34, time: 0 },
      { value: 0, time: 0.3 },
    ],
  },
  fh = {
    easing: "ease-out",
    frames: [
      { value: 0, time: 0.05 },
      { value: 100, time: 0.12 },
    ],
  },
  gh = class t extends e {
    static type = "WHISPER";
    static colors = ["#FFFFFF", "#000000", "#c4c4c4"];
    get type() {
      return t.type;
    }
    highlightColors = ["#c4c4c4"];
    background = {
      opacity: 50,
      padding: { x: 25, y: 15 },
      borderRadius: 20,
      fill: "#000000",
    };
    applied = !1;
    groups = [];
    currentIndex = null;
    init(e) {
      (m(e.source, "No source found for caption clip"),
        (this.groups = e.source.groupBy({ duration: 1 })));
    }
    async applyStyles(e) {
      ((e.state = new Kc()),
        (e.font = await _l({ family: "Montserrat", weight: "400", size: 16 })),
        (e.position = "center"),
        (e.color = "#FFFFFF"),
        (e.align = "center"),
        (e.baseline = "middle"),
        (e.strokes = []),
        (e.shadows = []),
        (e.maxWidth = "80%"),
        (e.leading = 1.4),
        (e.glow = void 0),
        (this.applied = !0));
    }
    render(e, t) {
      const i = t.videoCtx,
        r = t.playbackTime - e.delay,
        a = this.groups.find(
          (e) => r >= e[0].start && r <= (e.at(-1)?.end ?? 0),
        ),
        s = $(e.maxWidth ?? Number.POSITIVE_INFINITY, t.width);
      if (!a) return;
      const n = r - a[0].start,
        o = Math.max(
          a.findLastIndex((e) => r <= e.end),
          1,
        ),
        c = a.map((e) => e.text).join(" ");
      ((c === e.currentText && e.node && o === this.currentIndex) ||
        ((e.node = new Qc({
          ...e.state,
          text: c,
          styles:
            o != a.length - 1
              ? [
                  {
                    style: { color: this.highlightColors[0] },
                    start: a
                      .slice(0, o)
                      .map((e) => e.text)
                      .join(" ").length,
                    end: c.length,
                  },
                ]
              : void 0,
          maxWidth: s,
        })),
        (e.currentText = c)),
        (e.node.resolution = t.resolution),
        e.node.render());
      const l = e.node.height - 2 * e.node.padding.y,
        h = e.node.width - 2 * e.node.padding.x;
      (i.save(), e.mask && i.clip(e.mask.draw(t)));
      const d = yc(ph, n),
        u = yc(fh, n);
      ((i.globalCompositeOperation = e.blendMode ?? "source-over"),
        (i.filter = e.filter ?? "none"),
        (i.globalAlpha *= (u / 100) * (e.opacity / 100)),
        i.translate(0 | e.position.x, 0 | e.position.y),
        i.translate(0 | e.translate.x, (e.translate.y + d) | 0),
        i.rotate(e.rotation),
        i.scale(e.scale.x, e.scale.y));
      {
        i.save();
        const t = this.background.padding?.x ?? 30,
          r = this.background.padding?.y ?? 20,
          a = this.background.borderRadius ?? 20;
        (i.beginPath(),
          i.roundRect(
            (-e.anchor.x * h - t) | 0,
            (-e.anchor.y * l - r) | 0,
            (h + 2 * t) | 0,
            (0.95 * l + 2 * r) | 0,
            0 | a,
          ),
          (i.globalAlpha *= (this.background.opacity ?? 100) / 100),
          (i.fillStyle = this.background.fill ?? "#000000"),
          i.fill(),
          i.closePath(),
          i.restore());
      }
      (i.translate(
        (-e.anchor.x * h - e.node.padding.x) | 0,
        (-e.anchor.y * l - e.node.padding.y) | 0,
      ),
        i.drawImage(e.node.canvas, 0, 0, e.node.width, e.node.height),
        i.restore());
    }
  };
(mh([t()], gh.prototype, "type", 1),
  mh([t()], gh.prototype, "highlightColors", 2),
  mh([t()], gh.prototype, "background", 2));
let kh = gh;
const yh = /*#__PURE__*/ Object.freeze(
    /*#__PURE__*/ Object.defineProperty(
      {
        __proto__: null,
        CascadeCaptionPreset: Hl,
        ClassicCaptionPreset: Ul,
        GuineaCaptionPreset: Ql,
        PaperCaptionPreset: Jl,
        SolarCaptionPreset: ah,
        SpotlightCaptionPreset: hh,
        WhisperCaptionPreset: kh,
      },
      Symbol.toStringTag,
      { value: "Module" },
    ),
  ),
  wh = {
    fromJSON: (e) => {
      (m("object" == typeof e && null !== e, "Preset must be an object"),
        m("type" in e, "Preset must have a type"),
        m("string" == typeof e.type, "Preset type must be a string"));
      const t = Object.values(yh).find((t) => t.type === e.type);
      m(t, `Unknown preset type: ${e.type}`);
      const i = new t();
      return (i.fromJSON(e), (i.applied = !0), i);
    },
  };
var bh = Object.defineProperty,
  Th = Object.getOwnPropertyDescriptor,
  Ch = (e, t, i, r) => {
    for (
      var a, s = r > 1 ? void 0 : r ? Th(t, i) : t, n = e.length - 1;
      n >= 0;
      n--
    )
      (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
    return (r && s && bh(t, i, s), s);
  };
let Sh = class extends Uc(vc) {
  state = new Kc();
  type = "CAPTION";
  _range = [0, void 0];
  node = null;
  currentText = null;
  preset = new Ul();
  maxWidth;
  constructor(e, t = {}) {
    (super(),
      (this.source = e),
      Object.assign(this, t),
      Object.assign(this, { _duration: void 0 }));
  }
  async init(e) {
    ((this.source = e ?? this.source),
      m(this.source, "No source found for caption clip"),
      (!this._range[1] || this._range[1] > this.source.duration) &&
        (this._range[1] = D(this.source.duration)),
      this.preset.init(this),
      this.preset.applied || (await this.preset.applyStyles(this)));
  }
  get range() {
    return void 0 === this._range[1]
      ? [this._range[0], D(this.source?.duration)]
      : this._range;
  }
  set range(e) {
    let t = D(e[0] ?? this.range[0]),
      i = D(e[1] ?? this.range[1]);
    (m(i > t, "Start can't lower than or equal the end"),
      (this._range = [
        Math.max(t, 0),
        Math.min(i, this.source?.duration ?? Number.POSITIVE_INFINITY),
      ]),
      this.layer?.verifyUpdate(this));
  }
  get start() {
    return this.delay + this.range[0];
  }
  set start(e) {
    this.delay = D(e) - this.range[0];
  }
  get end() {
    return this.delay + this.range[1];
  }
  set end(e) {
    this.delay = D(e) - this.range[1];
  }
  get duration() {
    return this.range[1] - this.range[0];
  }
  get groups() {
    return this.preset?.groups ?? [];
  }
  set duration(e) {
    const t = D(e),
      i = D(this.source?.duration ?? 0);
    (m(t > 0, "Duration must be positive"),
      (this._range[1] = Math.min(this.range[0] + t, i)),
      this.layer?.verifyUpdate(this));
  }
  trim(e = this.start, t = this.end) {
    return ((this.range = [D(e) - this.delay, D(t) - this.delay]), this);
  }
  async split(e) {
    (m(
      (e = D(e ?? this.layer?.composition?.renderer.playbackTime)) >
        this.start && e < this.end,
      "Cannot split clip at the specified time",
    ),
      m(this.layer, "Layer must be attached to a layer"));
    const t = D(e - this.delay),
      i = this.animate(e).copy();
    ((this._range[1] = t), (i._range[0] = t), (i.animations = []));
    const r = this.layer.clips.findIndex((e) => e.id == this.id);
    return (await this.layer.add(i, r + 1), i);
  }
  get color() {
    return this.state.color;
  }
  set color(e) {
    ((this.state.color = e), this.clearCache());
  }
  get font() {
    return this.state.font;
  }
  set font(e) {
    ((this.state.font = e), this.clearCache());
  }
  get casing() {
    return this.state.casing;
  }
  set casing(e) {
    ((this.state.casing = e), this.clearCache());
  }
  get align() {
    return this.state.align;
  }
  set align(e) {
    ((this.anchor = { x: Xc[e], y: this.anchor.y }),
      (this.state.align = e),
      this.clearCache());
  }
  get baseline() {
    return this.state.baseline;
  }
  set baseline(e) {
    ((this.anchor = { x: this.anchor.x, y: Gc[e] }),
      (this.state.baseline = e),
      this.clearCache());
  }
  get strokes() {
    return this.state.strokes;
  }
  set strokes(e) {
    ((this.state.strokes = e), this.clearCache());
  }
  get shadows() {
    return this.state.shadows;
  }
  set shadows(e) {
    ((this.state.shadows = e), this.clearCache());
  }
  get leading() {
    return this.state.leading;
  }
  set leading(e) {
    ((this.state.leading = e), this.clearCache());
  }
  get glow() {
    return this.state.glow;
  }
  set glow(e) {
    ((this.state.glow = e), this.clearCache());
  }
  async loadPreset(e) {
    e !== this.preset?.type &&
      ((this.preset = wh.fromJSON({ type: e })),
      this.preset.init(this),
      await this.preset.applyStyles(this));
  }
  render(e) {
    this.preset?.render(this, e);
  }
  get width() {
    return Math.max(this._width ?? 0, this.node?.width ?? 0);
  }
  set width(e) {
    ((super.width = e), (this.maxWidth = e), this.clearCache());
  }
  get height() {
    return this.node?.height ?? 0;
  }
  set height(e) {
    console.error("This method is not supported for text clips");
  }
  get fontSize() {
    return this.font.size;
  }
  set fontSize(e) {
    ((this.font.size = e), this.clearCache());
  }
  get name() {
    const e = (this.preset?.type ?? "CLASSIC").toLowerCase();
    return e.charAt(0).toUpperCase() + e.slice(1) + " Preset";
  }
  get position() {
    return super.position;
  }
  set position(e) {
    ((super.position = e),
      "center" === e && ((this.align = "center"), (this.baseline = "middle")));
  }
  clearCache() {
    ((this.currentText = null), (this.node = null));
  }
};
(Ch([t(wh)], Sh.prototype, "preset", 2),
  Ch([t()], Sh.prototype, "maxWidth", 2),
  Ch([t()], Sh.prototype, "range", 1),
  Ch([t()], Sh.prototype, "color", 1),
  Ch([t()], Sh.prototype, "font", 1),
  Ch([t()], Sh.prototype, "casing", 1),
  Ch([t()], Sh.prototype, "align", 1),
  Ch([t()], Sh.prototype, "baseline", 1),
  Ch([t()], Sh.prototype, "strokes", 1),
  Ch([t()], Sh.prototype, "shadows", 1),
  Ch([t()], Sh.prototype, "leading", 1),
  Ch([t()], Sh.prototype, "glow", 1),
  (Sh = Ch([i("CaptionClip")], Sh)));
const vh = ["DEFAULT", "SEQUENTIAL"];
class xh {
  constructor(e) {
    this.layer = e;
  }
  mode = vh[0];
  isUpdating = !1;
  add(e) {
    if (!this.isUpdating)
      try {
        this.isUpdating = !0;
        for (const t of this.layer.clips) m(!Eh(e, t));
        (this.layer.clips.push(e),
          this.layer.clips.sort((e, t) => e.start - t.start));
      } finally {
        this.isUpdating = !1;
      }
  }
  update(e) {
    if (e && !this.isUpdating)
      try {
        this.isUpdating = !0;
        for (const t of this.layer.clips) m(!Eh(e, t));
        this.layer.clips.sort((e, t) => e.start - t.start);
      } finally {
        this.isUpdating = !1;
      }
  }
}
class Ph {
  constructor(e) {
    this.layer = e;
  }
  mode = vh[1];
  isUpdating = !1;
  add(e, t = void 0) {
    (this.layer.clips.splice(t ?? this.layer.clips.length, 0, e),
      this.update());
  }
  update() {
    if (!this.isUpdating)
      try {
        this.isUpdating = !0;
        let e = 0;
        for (const t of this.layer.clips)
          (B(t.start) != B(e) && (t.start = e), (e = t.end));
      } finally {
        this.isUpdating = !1;
      }
  }
}
function Eh(e, t) {
  return e.id != t.id && B(e.start) < B(t.end) && B(t.start) < B(e.end);
}
function Ih(e, t) {
  return (m(e.transition), Math.max(Math.floor((e.end + t.start) / 2), e.end));
}
function _h(e, t) {
  let i = Ih(e, t);
  return ((i -= D(e.transition?.duration ?? 1) / 2), i);
}
function Ah(e, t) {
  let i = Ih(e, t);
  return ((i += D(e.transition?.duration ?? 1) / 2), i);
}
var Fh = Object.defineProperty,
  Bh = Object.getOwnPropertyDescriptor,
  Mh = (e, t, i, r) => {
    for (
      var a, s = r > 1 ? void 0 : r ? Bh(t, i) : t, n = e.length - 1;
      n >= 0;
      n--
    )
      (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
    return (r && s && Fh(t, i, s), s);
  };
let Dh = class extends e {
  id = `layer_${q()}`;
  data = {};
  disabled = !1;
  clips = [];
  composition;
  createdAt = /* @__PURE__ */ new Date();
  get type() {
    return this.clips[0]?.type ?? "BASE";
  }
  currentMainClipIndex = -1;
  visibleClips = /* @__PURE__ */ new Set();
  strategy;
  constructor(e = {}) {
    (super(),
      (this.strategy = "SEQUENTIAL" === e.mode ? new Ph(this) : new xh(this)));
  }
  async init(e) {
    this.composition = e;
    for (const t of this.clips)
      t.initialized ||
        (t.layout(this.composition.settings),
        await t.initRenderer(this.composition.renderer),
        (t.initialized = !0));
  }
  get mode() {
    return this.strategy.mode;
  }
  set mode(e) {
    if (e === this.strategy.mode) return;
    const t = "SEQUENTIAL" === e ? Ph : xh;
    ((this.strategy = new t(this)),
      this.strategy.update(),
      this.composition?.update());
  }
  get index() {
    return (this.composition?.layers ?? []).findIndex((e) => e.id == this.id);
  }
  set index(e) {
    if (e === this.index) return;
    const t = this.composition?.layers ?? [],
      i = t.findIndex((e) => e.id == this.id),
      r = t.length - 1;
    if (-1 == i) return;
    let a = 0;
    ((a = "bottom" == e ? r : "top" == e || e < 0 ? 0 : e > r ? r : e),
      l(t, i, a));
  }
  async seek(e) {
    for (const t of this.clips) await t.seek(e);
  }
  async play(e) {
    for (const t of this.clips) await t.play(e);
  }
  async pause(e) {
    for (const t of this.clips) await t.pause(e);
  }
  async update(e) {
    const t = e.playbackTime;
    if (this.disabled) {
      for (const t of this.visibleClips) await t.exit(e);
      return this.visibleClips.clear();
    }
    for (const n of this.clips) n.ambientUpdate(e);
    let i,
      r,
      a = -1;
    for (let n = 0; n < this.clips.length; n++) {
      const e = this.clips[n],
        s = this.clips[n + 1];
      if (e.disabled) continue;
      const o = e.start,
        c = e.transition && s ? Ah(e, s) : e.end;
      if (o <= t && t <= c) {
        ((i = e), (a = n), (r = s));
        break;
      }
    }
    const s = /* @__PURE__ */ new Set();
    if (i && (s.add(i), i.transition && r)) {
      t >= _h(i, r) && s.add(r);
    }
    for (const n of this.visibleClips) s.has(n) || (await n.exit(e));
    for (const n of s) this.visibleClips.has(n) || (await n.enter(e));
    ((this.currentMainClipIndex = a), (this.visibleClips = s));
    for (const n of s) (n.animate(t), await n.update(e));
  }
  render(e) {
    if (-1 === this.currentMainClipIndex || this.disabled) return;
    const t = e.playbackTime,
      i = this.clips[this.currentMainClipIndex],
      r = this.clips[this.currentMainClipIndex + 1];
    if (i.transition && r) {
      const a = _h(i, r),
        s = t >= a,
        n = d((t - a) / D(i.transition?.duration ?? 1), 0, 1);
      if (s)
        return void (function (e, t, i, r) {
          m(e.transition);
          const a = r.videoCtx;
          switch (e.transition.type) {
            case "slide-from-right":
              (e.render(r),
                a.save(),
                a.translate(((1 - i) ** 2 * r.width) | 0, 0),
                t.render(r),
                a.restore());
              break;
            case "slide-from-left":
              (e.render(r),
                a.save(),
                a.translate(((1 - i) ** 2 * r.width * -1) | 0, 0),
                t.render(r),
                a.restore());
              break;
            case "fade-to-black":
              (i < 0.5 ? e.render(r) : t.render(r),
                a.save(),
                a.beginPath(),
                a.rect(0, 0, r.width, r.height),
                a.closePath(),
                (a.fillStyle = "#000000"),
                (a.globalAlpha = i < 0.5 ? 2 * i : 2 * (1 - i)),
                a.fill(),
                a.restore());
              break;
            case "fade-to-white":
              (i < 0.5 ? e.render(r) : t.render(r),
                a.save(),
                a.beginPath(),
                a.rect(0, 0, r.width, r.height),
                a.closePath(),
                (a.fillStyle = "#FFFFFF"),
                (a.globalAlpha = i < 0.5 ? 2 * i : 2 * (1 - i)),
                a.fill(),
                a.restore());
              break;
            default:
              (e.render(r),
                a.save(),
                (a.globalAlpha = i),
                t.render(r),
                a.restore());
          }
        })(i, r, n, e);
    }
    i.render(e);
  }
  async add(e, t) {
    (await e.init(),
      !e.initialized &&
        this.composition?.renderer &&
        (e.layout(this.composition.settings),
        await e.initRenderer(this.composition.renderer),
        (e.initialized = !0)));
    try {
      (this.strategy.add(e, t), (e.layer = this));
    } catch {
      this.relocate(e, this.composition?.createLayer(this.index));
    }
    return (this.composition?.update(), e);
  }
  verifyUpdate(e) {
    try {
      this.strategy.update(e);
    } catch {
      this.relocate(e, this.composition?.createLayer(this.index));
    }
    this.composition?.update();
  }
  relocate(e, t, i) {
    (e.detach(),
      t || (t = this),
      t.strategy.add(e, i),
      (e.layer = t),
      this.composition?.update());
  }
  remove(e, t = !0) {
    const i = this.clips.findIndex((t) => t.id == e.id);
    if (-1 != i)
      return (
        this.clips.splice(i, 1),
        this.strategy.update(),
        this.composition?.update(),
        (e.layer = void 0),
        0 === this.clips.length && t && this.detach(),
        e
      );
  }
  sequential(e = !0) {
    return ((this.mode = e ? "SEQUENTIAL" : "DEFAULT"), this);
  }
  get end() {
    return this.clips.at(-1)?.end ?? 0;
  }
  get start() {
    return this.clips.at(0)?.start ?? 0;
  }
  detach() {
    return (this.composition?.remove(this), this);
  }
  layout(e) {
    for (const t of this.clips) t.layout(e);
  }
  clear() {
    this.clips = [];
  }
  async createCheckpoint() {
    return this.toJSON();
  }
  async restoreCheckpoint(e, t) {
    (m("object" == typeof e),
      m(null != e),
      m("clips" in e),
      m(Array.isArray(e.clips)));
    const { clips: i, ...r } = e;
    this.fromJSON(r);
    for (const [s, n] of i.entries())
      if (
        (m("object" == typeof n),
        m(null != n),
        n?.id && n.id == this.clips.at(s)?.id)
      )
        await this.clips[s].restoreCheckpoint(n, t);
      else {
        this.clips.at(s) && this.remove(this.clips[s]);
        try {
          const e = xc.fromType(n);
          (await e.restoreCheckpoint(n, t), await this.add(e, s));
        } catch (a) {
          console.error(`Failed to restore clip ${n.id}: ${a}`);
        }
      }
    if (this.clips.length > i.length)
      for (const s of this.clips.slice(i.length)) this.remove(s);
    return this;
  }
};
(Mh([t()], Dh.prototype, "id", 2),
  Mh([t()], Dh.prototype, "data", 2),
  Mh([t()], Dh.prototype, "disabled", 2),
  Mh([t()], Dh.prototype, "clips", 2),
  Mh([t(R)], Dh.prototype, "createdAt", 2),
  Mh([t()], Dh.prototype, "mode", 1),
  Mh([t()], Dh.prototype, "index", 1),
  (Dh = Mh([i("Layer")], Dh)));
const Oh =
  "\n-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEDJp0jDi3mBPQgDoHmR5U6iZBCtMH\nfX5O4oVnkCrFGlAdOPEj0uTPZdAgU468e11wBiCMWrTXIlDBrawApwNgcQ==\n-----END PUBLIC KEY-----\n".trim();
function Rh() {
  const e = (function (e) {
    const t = e
        .replace(/-----BEGIN PUBLIC KEY-----/, "")
        .replace(/-----END PUBLIC KEY-----/, "")
        .replace(/\s+/g, ""),
      i = atob(t),
      r = new ArrayBuffer(i.length),
      a = new Uint8Array(r);
    for (let s = 0; s < i.length; s++) a[s] = i.charCodeAt(s);
    return r;
  })(Oh);
  return crypto.subtle.importKey(
    "spki",
    e,
    { name: "ECDSA", namedCurve: "P-256" },
    !1,
    ["verify"],
  );
}
function zh(e, t) {
  m(t < e.length, "Unexpected end of DER data");
  const i = e[t];
  if (!(128 & i)) return { length: i, newPos: t + 1 };
  const r = 127 & i;
  m(r > 0 && r <= 4, "Invalid DER length encoding");
  let a = 0;
  for (let s = 0; s < r; s++)
    (m(t + 1 + s < e.length, "Unexpected end of DER data"),
      (a = (a << 8) | e[t + 1 + s]));
  return { length: a, newPos: t + 1 + r };
}
function Nh(e, t) {
  if (t >= e.length || 2 !== e[t])
    throw new Error("Invalid DER: expected INTEGER (0x02)");
  t++;
  const { length: i, newPos: r } = zh(e, t);
  m((t = r) + i <= e.length, "Unexpected end of DER data");
  let a = t,
    s = i;
  i > 1 && 0 === e[a] && 128 & e[a + 1] && (a++, s--);
  return { value: e.slice(a, a + s), newPos: a + s };
}
async function Uh(e) {
  try {
    m("string" == typeof e);
    const [t, i] = e.split(".");
    if (!t || !i) return null;
    const r = await Rh(),
      a = new TextEncoder().encode(t),
      s = (function (e) {
        const t =
            e.replace(/-/g, "+").replace(/_/g, "/") +
            "===".slice((e.length + 3) % 4),
          i = atob(t),
          r = new Uint8Array(i.length);
        for (let a = 0; a < i.length; a++) r[a] = i.charCodeAt(a);
        return r;
      })(i),
      n = (function (e, t = 32) {
        if (0 === e.length || 48 !== e[0])
          throw new Error(
            "Invalid DER signature: must start with SEQUENCE (0x30)",
          );
        let i = 1;
        const { newPos: r } = zh(e, i);
        i = r;
        const a = Nh(e, i),
          s = a.value;
        i = a.newPos;
        const n = Nh(e, i).value,
          o = new ArrayBuffer(2 * t),
          c = new Uint8Array(o);
        return (
          m(
            s.length <= t,
            `r value too large: ${s.length} bytes, expected at most ${t}`,
          ),
          m(
            n.length <= t,
            `s value too large: ${n.length} bytes, expected at most ${t}`,
          ),
          c.set(s, t - s.length),
          c.set(n, 2 * t - n.length),
          c
        );
      })(s, 32);
    m(
      await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, r, n, a),
      "Signature verification failed",
    );
    const o = atob(
      t.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((t.length + 3) % 4),
    );
    return JSON.parse(o);
  } catch (t) {
    return null;
  }
}
var Lh = Object.defineProperty,
  Vh = Object.getOwnPropertyDescriptor,
  Wh = (e, t, i, r) => {
    for (
      var a, s = r > 1 ? void 0 : r ? Vh(t, i) : t, n = e.length - 1;
      n >= 0;
      n--
    )
      (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
    return (r && s && Lh(t, i, s), s);
  };
let Hh = class extends j(e) {
  _playheadTime = 0;
  id = `composition_${q()}`;
  renderer = new V({ callback: this.update.bind(this) });
  layers = [];
  markers = [];
  createdAt = /* @__PURE__ */ new Date();
  data = {};
  playbackEndBehavior = "stop";
  constructor({
    height: e = 1080,
    width: t = 1920,
    background: i = "#000000",
    playbackEndBehavior: r = "stop",
    licenseKey: a = null,
  } = {}) {
    (super(),
      this.renderer.resize(t, e),
      (this.renderer.background = i),
      (this.playbackEndBehavior = r),
      Object.assign(this, { licenseKey: a }),
      a
        ? Uh(a).then((e) => {
            e
              ? console.info(
                  `Diffusion Studio Core key accepted (${e.sub}). Operating in full access mode.`,
                )
              : console.info(
                  "Diffusion Studio Core key rejected due to invalid signature or format",
                );
          })
        : console.info(
            "No Diffusion Studio Core key provided. Rendering with watermark.",
          ));
  }
  get settings() {
    return {
      height: this.renderer.height,
      width: this.renderer.width,
      background: this.renderer.background,
      playbackEndBehavior: this.playbackEndBehavior,
    };
  }
  set settings(e) {
    ((this.renderer.background = e.background),
      this.renderer.resize(e.width, e.height),
      (this.playbackEndBehavior = e.playbackEndBehavior),
      this.emit("resize", void 0));
  }
  get playheadTime() {
    return this.playing ? this.currentTime : this._playheadTime;
  }
  set playheadTime(e) {
    this._playheadTime = D(e);
  }
  get playing() {
    return this.renderer.playing;
  }
  get width() {
    return this.renderer.width;
  }
  get height() {
    return this.renderer.height;
  }
  get duration() {
    const e = this.layers
      .filter((e) => !e.disabled)
      .map((e) => e.end)
      .filter((e) => Number.isFinite(e));
    return Math.max(0, ...(e.length ? e : [0]));
  }
  get currentTime() {
    return this.renderer.playbackTime;
  }
  set currentTime(e) {
    this.renderer.playbackOffset = D(e);
  }
  get clips() {
    return this.layers.flatMap((e) => e.clips);
  }
  resize(e, t) {
    this.renderer.resize(e, t);
    for (const i of this.layers) i.layout({ width: e, height: t });
    (this.update(), this.emit("resize", void 0));
  }
  mount(e) {
    (this.renderer.mount(e), this.renderer.start());
  }
  unmount() {
    (this.renderer.unmount(), this.renderer.stop());
  }
  async add(e, t = 0) {
    await e.init(this);
    const i = Math.max(0, Math.min(t, this.layers.length));
    return (
      this.layers.splice(i, 0, e),
      this.emit("layer:add", void 0),
      this.update(),
      e
    );
  }
  createLayer(e = 0) {
    const t = new Dh();
    return (
      (t.composition = this),
      this.layers.splice(Math.max(0, Math.min(e, this.layers.length)), 0, t),
      this.emit("layer:add", void 0),
      this.update(),
      t
    );
  }
  async update() {
    for (let e = this.layers.length - 1; e >= 0; e--)
      await this.layers[e].update(this.renderer);
    this.renderer.clear();
    for (let e = this.layers.length - 1; e >= 0; e--)
      this.layers[e].render(this.renderer);
    (this.emit("playback:time", this.renderer.playbackTime),
      this.renderer.playbackTime >= this.duration &&
        this.renderer.playing &&
        this.handlePlaybackEnd());
  }
  screenshot(e = "png", t = 1) {
    return this.renderer.canvas.toDataURL(`image/${e}`, t);
  }
  async seek(e = 0) {
    if (!this.renderer.stopped) {
      (this.renderer.playing && (await this.pause()),
        (this.renderer.playbackOffset = Math.max(0, D(e))));
      for (const e of this.layers) await e.seek(this.renderer);
      await this.update();
    }
  }
  async play(e) {
    ((e || this.renderer.playbackTime >= this.duration) && (await this.seek(e)),
      await this.renderer.play());
    for (const t of this.layers) await t.play(this.renderer);
    this.emit("playback:start", void 0);
  }
  async pause() {
    await this.renderer.pause();
    for (const e of this.layers) await e.pause(this.renderer);
    this.emit("playback:end", void 0);
  }
  clear() {
    ((this.layers = []), this.emit("layer:remove", void 0), this.update());
  }
  time(e) {
    const t = e?.hours ? 11 : 14,
      i = e?.milliseconds ? 23 : 19,
      r = this.renderer.playbackTime,
      a = this.duration,
      s = Number.isFinite(r) ? r : 0,
      n = Number.isFinite(a) ? a : 0;
    return (
      new Date(1e3 * s).toISOString().slice(t, i) +
      " / " +
      new Date(1e3 * n).toISOString().slice(t, i)
    );
  }
  remove(e) {
    Array.isArray(e) || (e = [e]);
    const t = [];
    for (const i of e) {
      const e = this.layers.findIndex((e) => e.id == i.id);
      -1 != e &&
        (this.layers.splice(e, 1),
        (i.composition = void 0),
        this.emit("layer:remove", void 0),
        t.push(i));
    }
    return t;
  }
  async handlePlaybackEnd() {
    "loop" == this.playbackEndBehavior
      ? (await this.seek(0), await this.play())
      : "reset" == this.playbackEndBehavior
        ? await this.seek(0)
        : await this.pause();
  }
  async createCheckpoint() {
    return this.toJSON();
  }
  async restoreCheckpoint(e, t) {
    (m("object" == typeof e),
      m(null != e),
      m("layers" in e),
      m(Array.isArray(e.layers)));
    const { layers: i, ...r } = e;
    this.fromJSON(r);
    for (const [a, s] of i.entries()) {
      if (
        (m("object" == typeof s),
        m(null != s),
        s?.id && s.id == this.layers.at(a)?.id)
      ) {
        await this.layers[a].restoreCheckpoint(s, t);
        continue;
      }
      this.layers.at(a) && this.remove(this.layers[a]);
      const e = new Dh();
      (await this.add(e, a), await e.restoreCheckpoint(s, t));
    }
    return (
      this.layers.length > i.length && this.remove(this.layers.slice(i.length)),
      this.emit("restored", void 0),
      this
    );
  }
  toString() {
    const e = (t, i) => (0 === i ? t : e(i, t % i)),
      t = e(this.settings.width, this.settings.height);
    let i = `# Composition with ${this.layers.length} layers and ${this.clips.length} clips\n`;
    ((i += `Dimensions: ${this.settings.width}x${this.settings.height};`),
      (i += ` Aspect Ratio: ${this.settings.width / t}:${this.settings.height / t};`),
      (i += ` Duration: ${this.duration}s;`),
      (i += ` Background: ${this.settings.background};`),
      (i += "\n\n"));
    for (let r = 0; r < this.layers.length; r++) {
      const e = this.layers[r];
      ((i += `## Layer ${r + 1} (Mode: ${e.mode}) with ${e.clips.length} clips:`),
        (i += "\n"));
      for (let t = 0; t < e.clips.length; t++) {
        const r = e.clips[t];
        if (
          ((i += `  ${r.type}`),
          (i += ` | Id: ${r.id.slice(0, 3)}...${r.id.at(-1)}`),
          (i += ` | Start: ${r.start}s`),
          (i += ` | Stop: ${r.end}s`),
          Vc(r))
        ) {
          const [e, t, a, s] = r.bounds;
          i += ` | Bounds: [(${e.x}x, ${e.y}y), (${t.x}x, ${t.y}y), (${a.x}x, ${a.y}y), (${s.x}x, ${s.y}y)]`;
        }
        i += "\n";
      }
      i += "\n";
    }
    return i;
  }
};
function $h(e, t, i) {
  const r =
    (/* @__PURE__ */ (new Date().getTime() - i) / ((a = e) < 1 ? 1 : a)) *
    (t - e);
  var a;
  return { remaining: new Date(r), progress: e, total: t };
}
(Wh([t()], Hh.prototype, "id", 2),
  Wh([t()], Hh.prototype, "layers", 2),
  Wh([t()], Hh.prototype, "markers", 2),
  Wh([t(R)], Hh.prototype, "createdAt", 2),
  Wh([t()], Hh.prototype, "data", 2),
  Wh([t()], Hh.prototype, "settings", 1),
  Wh([t()], Hh.prototype, "playheadTime", 1),
  Wh([t()], Hh.prototype, "currentTime", 1),
  (Hh = Wh([i("Composition")], Hh)));
class jh {
  target;
  fastStart;
  handle;
  constructor(e, t, i) {
    ((this.target = e), (this.fastStart = t), (this.handle = i));
  }
  static async create(e) {
    if ("string" == typeof e || !e) {
      const t = new Co();
      return new jh(t, "in-memory", e);
    }
    if ("function" == typeof e) {
      let t = 0;
      const i = new WritableStream({
        write(i) {
          (e(i, t), (t += i.length));
        },
      });
      return new jh(new So(i), !1, e);
    }
    if (e instanceof WritableStream) return new jh(new So(e), !1, e);
    const t = await e.createWritable();
    return new jh(new So(t, { chunked: !0 }), !1, e);
  }
  async close(e = "mp4") {
    if ("in-memory" === this.fastStart && this.target instanceof Co) {
      if (!this.target.buffer) return;
      const t = new Blob([this.target.buffer], { type: qh[e] });
      return "string" == typeof this.handle
        ? void (await x(t, this.handle))
        : t;
    }
  }
}
const qh = { mp4: "video/mp4", webm: "video/webm", ogg: "audio/ogg" },
  Kh = {
    enabled: !0,
    sampleRate: 48e3,
    numberOfChannels: 2,
    bitrate: 128e3,
    codec: "aac",
  },
  Qh = {
    enabled: !0,
    codec: "avc",
    bitrate: 1e7,
    fps: 30,
    resolution: 1,
    fullCodecString: "",
  };
class Xh {
  static create(e, t) {
    return "webm" == t
      ? new zo()
      : "ogg" == t
        ? new No()
        : new Do({ fastStart: e.fastStart });
  }
}
const Gh = new Path2D(
  "M52.166 28.6953C53.5062 28.6953 54.6068 29.0439 55.4678 29.7402C56.3361 30.429 56.7855 31.3725 56.8154 32.5703H54.5469C54.5394 31.9938 54.3223 31.5179 53.8955 31.1436C53.4688 30.7618 52.9037 30.5714 52.2002 30.5713C51.5264 30.5713 50.9906 30.7285 50.5938 31.043C50.1971 31.3574 49.999 31.7426 49.999 32.1992C49.999 32.6035 50.1488 32.9297 50.4482 33.1768C50.7552 33.4236 51.1748 33.6068 51.7061 33.7266L53.7275 34.1758C54.8803 34.4303 55.7299 34.824 56.2764 35.3555C56.8228 35.887 57.0967 36.5835 57.0967 37.4443C57.0966 38.2003 56.887 38.852 56.4678 39.3984C56.056 39.9375 55.4902 40.3568 54.7715 40.6562C54.0529 40.9481 53.2331 41.0937 52.3125 41.0938C51.4068 41.0938 50.5903 40.9481 49.8643 40.6562C49.1381 40.3643 48.5498 39.9299 48.1006 39.3535C47.6589 38.777 47.4118 38.0615 47.3594 37.208H49.6953C49.8301 38.5407 50.6878 39.207 52.2676 39.207C53.016 39.207 53.6078 39.054 54.042 38.7471C54.4835 38.4402 54.7039 38.0505 54.7041 37.5791C54.7041 37.1749 54.5467 36.8528 54.2324 36.6133C53.918 36.3662 53.5061 36.1865 52.9971 36.0742L51.0322 35.6357C48.7637 35.1416 47.6289 34.0111 47.6289 32.2441C47.6289 31.196 48.0449 30.3424 48.876 29.6836C49.7145 29.0249 50.811 28.6953 52.166 28.6953ZM69.3467 28.6836C70.4772 28.6836 71.4655 28.9499 72.3115 29.4814C73.1649 30.0055 73.8282 30.7351 74.2998 31.6709C74.7789 32.5992 75.0186 33.6775 75.0186 34.9053C75.0186 36.1181 74.7789 37.1888 74.2998 38.1172C73.8281 39.0456 73.165 39.7718 72.3115 40.2959C71.4655 40.82 70.4772 41.082 69.3467 41.082C68.2163 41.082 67.2245 40.8198 66.3711 40.2959C65.5176 39.7718 64.8512 39.0455 64.3721 38.1172C63.9004 37.1888 63.6641 36.1182 63.6641 34.9053C63.6641 33.6774 63.9004 32.5993 64.3721 31.6709C64.8512 30.7351 65.5176 30.0055 66.3711 29.4814C67.2246 28.9499 68.2162 28.6836 69.3467 28.6836ZM153.757 28.6836C154.887 28.6836 155.876 28.9499 156.722 29.4814C157.575 30.0055 158.238 30.7351 158.71 31.6709C159.189 32.5992 159.429 33.6775 159.429 34.9053C159.429 36.1181 159.189 37.1888 158.71 38.1172C158.238 39.0456 157.575 39.7718 156.722 40.2959C155.876 40.82 154.887 41.082 153.757 41.082C152.626 41.082 151.635 40.8198 150.781 40.2959C149.928 39.7718 149.261 39.0455 148.782 38.1172C148.311 37.1888 148.074 36.1182 148.074 34.9053C148.074 33.6774 148.311 32.5993 148.782 31.6709C149.261 30.7351 149.928 30.0055 150.781 29.4814C151.635 28.9499 152.626 28.6836 153.757 28.6836ZM101.277 23.8086C103.081 23.8087 104.515 24.2804 105.578 25.2236C106.649 26.167 107.21 27.4548 107.263 29.0869H104.849C104.789 28.1212 104.437 27.3649 103.793 26.8184C103.149 26.2643 102.299 25.9873 101.243 25.9873C100.232 25.9873 99.4056 26.2312 98.7617 26.7178C98.1178 27.1969 97.7959 27.8141 97.7959 28.5703C97.7959 29.1768 98.043 29.6709 98.5371 30.0527C99.0313 30.427 99.8508 30.7533 100.996 31.0303L102.805 31.457C104.481 31.8538 105.717 32.4262 106.511 33.1748C107.312 33.9235 107.712 34.8969 107.712 36.0947C107.712 37.0979 107.454 37.974 106.938 38.7227C106.421 39.4713 105.695 40.0521 104.759 40.4639C103.823 40.8756 102.722 41.081 101.457 41.0811C99.4507 41.0811 97.8665 40.576 96.7061 39.5654C95.5532 38.5473 94.9767 37.1544 94.9766 35.3877H97.4697C97.4773 36.488 97.8292 37.3494 98.5254 37.9707C99.2291 38.592 100.207 38.9023 101.457 38.9023C102.595 38.9023 103.504 38.6627 104.186 38.1836C104.874 37.6969 105.219 37.0456 105.219 36.2295C105.219 35.5857 104.972 35.0657 104.478 34.6689C103.991 34.2646 103.167 33.9235 102.007 33.6465L100.177 33.209C98.4851 32.8048 97.2494 32.2429 96.4707 31.5244C95.6997 30.7983 95.3136 29.8546 95.3135 28.6943C95.3135 27.7135 95.5605 26.8558 96.0547 26.1221C96.5488 25.3883 97.2419 24.8193 98.1328 24.415C99.0312 24.0109 100.08 23.8086 101.277 23.8086ZM37.4209 36.0508C37.4209 37.0016 37.6488 37.7204 38.1055 38.207C38.5622 38.6862 39.2028 38.9258 40.0264 38.9258C40.8273 38.9257 41.5014 38.6786 42.0479 38.1846C42.6017 37.6829 42.8789 36.8817 42.8789 35.7812V28.9531H45.248V40.8125H42.9238V39.0273C42.1152 40.3749 40.9205 41.0488 39.3408 41.0488C38.5324 41.0488 37.8026 40.8723 37.1514 40.5205C36.5076 40.1612 35.9941 39.6336 35.6123 38.9375C35.238 38.2412 35.0508 37.376 35.0508 36.3428V28.9531H37.4209V36.0508ZM119.851 36.0508C119.851 37.0016 120.078 37.7204 120.535 38.207C120.992 38.6862 121.632 38.9258 122.456 38.9258C123.257 38.9257 123.931 38.6786 124.478 38.1846C125.031 37.6829 125.309 36.8817 125.309 35.7812V28.9531H127.678V40.8125H125.354V39.0273C124.545 40.3749 123.35 41.0488 121.771 41.0488C120.962 41.0488 120.232 40.8723 119.581 40.5205C118.937 40.1612 118.424 39.6336 118.042 38.9375C117.668 38.2412 117.48 37.376 117.48 36.3428V28.9531H119.851V36.0508ZM140.933 40.8115H138.608V39.0039H138.586C138.189 39.6926 137.668 40.2051 137.024 40.542C136.388 40.8789 135.684 41.0479 134.913 41.0479C133.88 41.0479 132.978 40.7889 132.207 40.2725C131.436 39.7485 130.837 39.0261 130.41 38.1055C129.983 37.1771 129.77 36.1022 129.77 34.8818C129.77 33.6615 129.983 32.5908 130.41 31.6699C130.844 30.7417 131.447 30.0195 132.218 29.5029C132.989 28.9788 133.884 28.7168 134.902 28.7168C135.673 28.7169 136.377 28.8773 137.014 29.1992C137.65 29.5212 138.159 30.0122 138.541 30.6709H138.563V24.0781H140.933V40.8115ZM18.126 40.8125H15.7559V28.9531H18.126V40.8125ZM61.5674 40.8125H59.1973V28.9531H61.5674V40.8125ZM83.0283 28.7168C83.8444 28.7168 84.5749 28.8965 85.2188 29.2559C85.8699 29.6077 86.3826 30.132 86.7568 30.8281C87.1312 31.5244 87.3184 32.3896 87.3184 33.4229V40.8125H84.9492V33.7148C84.9492 32.764 84.7204 32.0485 84.2637 31.5693C83.807 31.0827 83.1706 30.8398 82.3545 30.8398C81.5459 30.8398 80.8646 31.0902 80.3105 31.5918C79.764 32.0859 79.4912 32.8838 79.4912 33.9844V40.8125H77.1211V28.9531H79.4463V30.7383C80.2549 29.3908 81.4487 28.7168 83.0283 28.7168ZM113.204 28.9531H115.607V30.9072H113.204V37.6797C113.204 38.1212 113.294 38.4284 113.474 38.6006C113.653 38.7726 113.98 38.8584 114.451 38.8584H115.607V40.8125H114.114C111.921 40.8125 110.823 39.8691 110.823 37.9824V30.9072H108.734V28.9531H110.823V25.7188H113.204V28.9531ZM145.974 40.8125H143.604V28.9531H145.974V40.8125ZM5.58203 24.0781C7.22147 24.0782 8.6326 24.4151 9.81543 25.0889C11.0059 25.7627 11.9193 26.7253 12.5557 27.9756C13.1919 29.2183 13.5107 30.701 13.5107 32.4229C13.5107 34.152 13.1887 35.6457 12.5449 36.9033C11.9085 38.1536 10.9834 39.1195 9.77051 39.8008C8.5651 40.4746 7.11263 40.8115 5.41309 40.8115H0V24.0781H5.58203ZM26.5596 26.0322H25.5146C25.0132 26.0322 24.6579 26.1372 24.4482 26.3467C24.2461 26.5563 24.1445 26.9124 24.1445 27.4141V28.9521H28.4707V27.0322C28.4707 26.0964 28.7627 25.3701 29.3467 24.8535C29.9381 24.3369 30.7692 24.0781 31.8398 24.0781H33.2549V26.0322H32.21C31.7085 26.0322 31.3532 26.1372 31.1436 26.3467C30.9414 26.5563 30.8398 26.9124 30.8398 27.4141V28.9521H33.2549V30.9062H30.8398V40.8115H28.4707V30.9062H24.1445V40.8115H21.7754V30.9062H19.6523V28.9521H21.7754V27.0322C21.7754 26.0964 22.0674 25.3701 22.6514 24.8535C23.2428 24.3369 24.0739 24.0781 25.1445 24.0781H26.5596V26.0322ZM69.3467 30.7275C68.3359 30.7275 67.5348 31.1061 66.9434 31.8623C66.3595 32.611 66.0674 33.6252 66.0674 34.9053C66.0674 36.1706 66.3594 37.1781 66.9434 37.9268C67.5273 38.6678 68.3286 39.0381 69.3467 39.0381C70.3649 39.0381 71.166 38.6637 71.75 37.915C72.334 37.1663 72.626 36.1631 72.626 34.9053C72.626 33.6328 72.3304 32.6184 71.7393 31.8623C71.1553 31.1061 70.3574 30.7275 69.3467 30.7275ZM153.757 30.7275C152.746 30.7275 151.945 31.1061 151.354 31.8623C150.77 32.611 150.478 33.6252 150.478 34.9053C150.478 36.1706 150.77 37.1781 151.354 37.9268C151.937 38.6678 152.739 39.0381 153.757 39.0381C154.775 39.0381 155.576 38.6637 156.16 37.915C156.744 37.1663 157.036 36.1631 157.036 34.9053C157.036 33.6328 156.741 32.6184 156.149 31.8623C155.565 31.1061 154.768 30.7275 153.757 30.7275ZM135.396 30.749C134.438 30.749 133.66 31.1051 133.061 31.8164C132.469 32.5202 132.173 33.5417 132.173 34.8818C132.173 36.222 132.469 37.2445 133.061 37.9482C133.659 38.6517 134.438 39.0039 135.396 39.0039C136.407 39.0038 137.212 38.6292 137.811 37.8809C138.417 37.1247 138.721 36.1247 138.721 34.8818C138.721 33.6317 138.417 32.6325 137.811 31.8838C137.212 31.1277 136.407 30.7491 135.396 30.749ZM2.49316 38.6445H5.25586C7.20996 38.6445 8.65495 38.0938 9.59082 36.9932C10.5341 35.8927 11.0058 34.3692 11.0059 32.4229C11.0059 30.4839 10.5415 28.9713 9.61328 27.8857C8.68498 26.7927 7.28882 26.2462 5.4248 26.2461H2.49316V38.6445ZM16.9355 24C17.3546 24.0001 17.7101 24.1424 18.002 24.4268C18.2939 24.7038 18.4404 25.0482 18.4404 25.46C18.4404 25.8643 18.2939 26.2087 18.002 26.4932C17.7101 26.7701 17.3546 26.9091 16.9355 26.9092C16.5163 26.9092 16.1602 26.7702 15.8682 26.4932C15.5837 26.2087 15.4414 25.8643 15.4414 25.46C15.4414 25.0482 15.5837 24.7038 15.8682 24.4268C16.1602 24.1423 16.5163 24 16.9355 24ZM60.377 24C60.796 24.0001 61.1515 24.1424 61.4434 24.4268C61.7354 24.7038 61.8818 25.0482 61.8818 25.46C61.8818 25.8643 61.7354 26.2087 61.4434 26.4932C61.1515 26.7701 60.796 26.9091 60.377 26.9092C59.9577 26.9092 59.6016 26.7702 59.3096 26.4932C59.0251 26.2087 58.8828 25.8643 58.8828 25.46C58.8828 25.0482 59.0251 24.7038 59.3096 24.4268C59.6016 24.1423 59.9577 24 60.377 24ZM144.783 24C145.202 24.0001 145.558 24.1424 145.85 24.4268C146.142 24.7038 146.288 25.0482 146.288 25.46C146.288 25.8643 146.142 26.2087 145.85 26.4932C145.558 26.7701 145.202 26.9091 144.783 26.9092C144.364 26.9092 144.008 26.7702 143.716 26.4932C143.431 26.2087 143.289 25.8643 143.289 25.46C143.289 25.0482 143.431 24.7038 143.716 24.4268C144.008 24.1423 144.364 24 144.783 24ZM50.1895 4.68359C51.3125 4.68359 52.2858 4.94564 53.1094 5.46973C53.9404 5.99382 54.5843 6.72428 55.041 7.66016C55.4976 8.58845 55.7266 9.66261 55.7266 10.8828V11.5234H47C47.045 12.5939 47.352 13.4584 47.9209 14.1172C48.4974 14.776 49.306 15.1055 50.3467 15.1055C51.1253 15.1055 51.766 14.93 52.2676 14.5781C52.769 14.2263 53.1019 13.7693 53.2666 13.208H55.5469C55.4046 13.9715 55.0859 14.6456 54.5918 15.2295C54.1052 15.8133 53.4911 16.2702 52.75 16.5996C52.0165 16.9214 51.2042 17.082 50.3135 17.082C49.1383 17.082 48.1272 16.8165 47.2812 16.2852C46.4427 15.7536 45.7946 15.0231 45.3379 14.0947C44.8887 13.1589 44.6641 12.0957 44.6641 10.9053C44.6641 9.69987 44.9004 8.62923 45.3721 7.69336C45.8437 6.75758 46.4952 6.02373 47.3262 5.49219C48.1571 4.95327 49.1115 4.68359 50.1895 4.68359ZM42.5732 16.8115H40.249V15.0039H40.2266C39.8298 15.6926 39.3089 16.2051 38.665 16.542C38.0286 16.8789 37.3249 17.0479 36.5537 17.0479C35.5207 17.0479 34.6187 16.7889 33.8477 16.2725C33.0767 15.7485 32.4775 15.0261 32.0508 14.1055C31.624 13.1771 31.4102 12.1022 31.4102 10.8818C31.4102 9.66146 31.624 8.59082 32.0508 7.66992C32.485 6.74172 33.0874 6.01949 33.8584 5.50293C34.6296 4.97884 35.5247 4.7168 36.543 4.7168C37.3139 4.71686 38.018 4.87735 38.6543 5.19922C39.2905 5.52116 39.7999 6.01218 40.1816 6.6709H40.2041V0.078125H42.5732V16.8115ZM24.6182 4.7168C26.0779 4.71688 27.227 5.07625 28.0654 5.79492C28.904 6.51367 29.3232 7.47624 29.3232 8.68164V16.8125H26.9873V15.1279H26.9424C26.6953 15.6069 26.3025 16.0415 25.7637 16.4307C25.2321 16.8125 24.4567 17.0029 23.4385 17.0029C22.2555 17.0029 21.2747 16.7035 20.4961 16.1045C19.7176 15.4981 19.3282 14.6036 19.3281 13.4209C19.3281 12.5225 19.5495 11.8337 19.9912 11.3545C20.4404 10.8678 21.0202 10.5192 21.7314 10.3096C22.4502 10.0999 23.2106 9.94694 24.0117 9.84961C24.7527 9.75979 25.3403 9.68488 25.7744 9.625C26.2085 9.56513 26.5156 9.47519 26.6953 9.35547C26.8825 9.23568 26.9766 9.0293 26.9766 8.7373V8.63672C26.9766 8.06046 26.7666 7.58848 26.3477 7.22168C25.9284 6.84733 25.3402 6.66016 24.584 6.66016C23.828 6.66016 23.2106 6.84326 22.7314 7.20996C22.2523 7.56934 21.9902 8.02279 21.9453 8.56934H19.6201C19.6725 7.4388 20.1484 6.51367 21.0469 5.79492C21.9453 5.07633 23.1359 4.7168 24.6182 4.7168ZM87.8213 16.8125H85.4512V4.95312H87.8213V16.8125ZM94.0205 4.95312H96.4238V6.90723H94.0205V13.6797C94.0206 14.1212 94.1104 14.4284 94.29 14.6006C94.4698 14.7726 94.7961 14.8584 95.2676 14.8584H96.4238V16.8125H94.9307C92.737 16.8125 91.6396 15.8691 91.6396 13.9824V6.90723H89.5508V4.95312H91.6396V1.71875H94.0205V4.95312ZM7.2666 9.88281C7.41631 10.3095 7.61111 10.8714 7.85059 11.5674C8.09009 12.256 8.30735 12.8927 8.50195 13.4766C8.68909 12.8927 8.90208 12.256 9.1416 11.5674C9.3811 10.8713 9.57587 10.3095 9.72559 9.88281L13.4209 0.078125H16.9473V16.8115H14.499V7.69238C14.499 7.09342 14.5065 6.39714 14.5215 5.60352C14.5365 4.80258 14.5547 4.00537 14.5771 3.21191C14.2702 4.11768 13.9781 4.97148 13.7012 5.77246C13.4317 6.57336 13.207 7.2133 13.0273 7.69238L9.50098 16.8115H7.45703L3.89746 7.69238C3.72529 7.23576 3.50384 6.63326 3.23438 5.88477C2.97233 5.12858 2.68783 4.31576 2.38086 3.44727C2.40332 4.21094 2.42253 4.96712 2.4375 5.71582C2.45247 6.46451 2.45996 7.12337 2.45996 7.69238V16.8115H0V0.078125H3.51562L7.2666 9.88281ZM67.1592 9.81543C67.3388 10.534 67.5078 11.2563 67.665 11.9824C67.8223 12.7011 67.9753 13.4242 68.125 14.1504C68.2747 13.4242 68.432 12.7012 68.5967 11.9824C68.7614 11.2563 68.9379 10.5341 69.125 9.81543L71.6631 0.078125H74.3916L76.9072 9.81543C77.2666 11.2378 77.6003 12.6639 77.9072 14.0938C78.057 13.3825 78.21 12.6712 78.3672 11.96C78.5319 11.2413 78.7009 10.5266 78.873 9.81543L81.332 0.078125H83.9375L79.3779 16.8115H76.5254L73.7744 6.58105C73.6396 6.06445 73.5081 5.53613 73.3809 4.99707C73.2611 4.4507 73.138 3.89303 73.0107 3.32422C72.891 3.89307 72.7711 4.45067 72.6514 4.99707C72.5316 5.53613 72.4001 6.06445 72.2578 6.58105L69.5293 16.8115H66.6426L62.1055 0.078125H64.7002L67.1592 9.81543ZM100.671 6.65918C101.487 5.36408 102.666 4.7168 104.208 4.7168C105.024 4.7168 105.755 4.89648 106.398 5.25586C107.05 5.60775 107.562 6.13204 107.937 6.82812C108.311 7.52435 108.498 8.38886 108.498 9.42188V16.8115H106.129V9.71387C106.129 8.76319 105.9 8.0485 105.443 7.56934C104.987 7.08268 104.35 6.83887 103.534 6.83887C102.726 6.83887 102.044 7.09017 101.49 7.5918C100.944 8.08595 100.671 8.88298 100.671 9.9834V16.8115H98.3008V0.078125H100.671V6.65918ZM26.9873 10.9834C26.8301 11.1106 26.4747 11.2272 25.9209 11.332C25.367 11.4293 24.7752 11.5225 24.1465 11.6123C23.4951 11.7096 22.9219 11.8936 22.4277 12.1631C21.9337 12.4326 21.6865 12.8669 21.6865 13.4658C21.6867 13.9747 21.8855 14.3751 22.2822 14.667C22.6865 14.9513 23.2333 15.0938 23.9219 15.0938C24.9698 15.0937 25.7413 14.8241 26.2354 14.2852C26.7368 13.7387 26.9873 13.1021 26.9873 12.376V10.9834ZM37.0371 6.74902C36.0788 6.74902 35.3001 7.10514 34.7012 7.81641C34.1097 8.52018 33.8135 9.5417 33.8135 10.8818C33.8135 12.222 34.1097 13.2445 34.7012 13.9482C35.3001 14.6517 36.079 15.0039 37.0371 15.0039C38.0475 15.0038 38.8523 14.6292 39.4512 13.8809C40.0576 13.1247 40.3613 12.1247 40.3613 10.8818C40.3613 9.63167 40.0575 8.63245 39.4512 7.88379C38.8523 7.12773 38.0476 6.74915 37.0371 6.74902ZM50.2119 6.66016C49.3135 6.66016 48.5798 6.93717 48.0107 7.49121C47.4492 8.03776 47.1198 8.7832 47.0225 9.72656H53.4131C53.3158 8.7832 52.9821 8.03776 52.4131 7.49121C51.8441 6.93717 51.1104 6.66016 50.2119 6.66016ZM86.6309 0C87.0499 0.000110408 87.4054 0.142363 87.6973 0.426758C87.9893 0.703776 88.1357 1.04818 88.1357 1.45996C88.1357 1.86426 87.9893 2.20866 87.6973 2.49316C87.4054 2.77007 87.0499 2.90907 86.6309 2.90918C86.2116 2.90918 85.8555 2.77018 85.5635 2.49316C85.279 2.20866 85.1367 1.86426 85.1367 1.45996C85.1367 1.04818 85.279 0.703776 85.5635 0.426758C85.8555 0.142253 86.2116 0 86.6309 0Z",
);
class Yh {
  composition;
  renderer;
  config;
  audioContext;
  sinkNode;
  audioWorkletUrl;
  onProgress;
  constructor(e, t = {}) {
    ((this.composition = e),
      (this.config = {
        ...t,
        video: { ...Qh, ...t?.video },
        audio: { ...Kh, ...t?.audio },
      }),
      "ogg" == this.config.format &&
        ((this.config.audio.enabled = !0), (this.config.video.enabled = !1)));
  }
  canceled = !1;
  cancel() {
    this.canceled = !0;
  }
  async render(e) {
    m(
      "licenseKey" in this.composition,
      "Composition must have a license key property",
    );
    const t = await Uh(this.composition.licenseKey);
    try {
      const i = this.composition.layers,
        r = D(this.config.range?.end ?? this.composition.duration);
      (this.log(`Preparing export ${r}s`),
        (await ((e) => {
          if (lt.includes(e)) return $o(e);
          if (ut.includes(e)) return jo(e);
          if (mt.includes(e)) return qo(e);
          throw new TypeError(`Unknown codec '${e}'.`);
        })(this.config.audio.codec)) ||
          (console.error(
            "Unsupported audio codec or api not available. Falling back to opus.",
          ),
          (this.config.audio.codec = "opus")),
        await this.composition.seek(0),
        this.composition.renderer.stop(),
        (this.audioContext = new OfflineAudioContext({
          numberOfChannels: this.config.audio.numberOfChannels,
          sampleRate: this.config.audio.sampleRate,
          length: Math.ceil(r * this.config.audio.sampleRate),
        })),
        (this.audioWorkletUrl = (function () {
          const e = new Blob([`(${Jh.toString()})()`], {
            type: "application/javascript",
          });
          return URL.createObjectURL(e);
        })()),
        await this.audioContext.audioWorklet.addModule(this.audioWorkletUrl));
      const a = new SharedArrayBuffer(4),
        s = new Uint32Array(a),
        n = this.audioContext.createGain();
      ((this.sinkNode = new AudioWorkletNode(this.audioContext, "sink", {
        channelCount: this.config.audio.numberOfChannels,
        channelCountMode: "explicit",
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [this.config.audio.numberOfChannels],
        processorOptions: { buffer: s },
      })),
        n.connect(this.sinkNode),
        this.sinkNode.connect(this.audioContext.destination));
      let o = 0,
        c = Promise.resolve();
      const l = Promise.withResolvers();
      ((this.sinkNode.port.onmessage = (e) => {
        if ("canceled" === g.state) return;
        const t = e.data;
        if (0 === t.length) return void l.resolve();
        const i = t.length / this.config.audio.numberOfChannels,
          r = new _i({
            data: t,
            format: "f32-planar",
            numberOfChannels: this.config.audio.numberOfChannels,
            sampleRate: this.config.audio.sampleRate,
            timestamp: o / this.config.audio.sampleRate,
          });
        ((c = u.add(r)), (o += i));
      }),
        (this.renderer = new V({
          ...this.composition.settings,
          resolution: this.config.video.resolution,
          context: this.audioContext,
          audioDestination: n,
          fps: this.config.video.fps,
        })));
      for (const e of this.composition.clips)
        await e.initRenderer(this.renderer);
      const h = this.config.video.fullCodecString.length
          ? this.config.video.fullCodecString
          : void 0,
        d = new Yo(this.renderer.canvas, {
          codec: this.config.video.codec,
          bitrate: this.config.video.bitrate,
          latencyMode: "quality",
          fullCodecString: h,
        }),
        u = new ec({
          codec: this.config.audio.codec,
          bitrate: this.config.audio.bitrate,
        }),
        p = await jh.create(e),
        f = Xh.create(p, this.config.format),
        g = new ac({ format: f, target: p.target });
      (this.config.audio.enabled && g.addAudioTrack(u),
        this.config.video.enabled && g.addVideoTrack(d),
        this.log("Configured dependencies"),
        await g.start());
      const k = performance.now(),
        y = /* @__PURE__ */ new Date().getTime(),
        w = Math.floor(r * this.config.video.fps);
      let b = -1 / 0,
        T = Promise.resolve();
      this.config.audio.enabled && (T = this.audioContext.startRendering());
      let C = 0;
      for (let e = 0; e < w; e++) {
        if (this.canceled)
          return (
            await g.cancel(),
            Atomics.store(s, 0, 2 ** 31 - 1),
            { type: "canceled" }
          );
        m("object" == typeof t);
        const r = !t?.features?.length,
          a = e / this.config.video.fps;
        this.renderer.playbackOffset = a;
        for (let e = i.length - 1; e >= 0; e--)
          await i[e].update(this.renderer);
        if (this.config.video.enabled) {
          this.renderer.clear();
          for (let r = i.length - 1; r >= 0; r--) i[r].render(this.renderer);
          const e = this.renderer.videoCtx;
          e.save();
          const t = r ? 1 : 0;
          ((e.fillStyle = "white"),
            (e.strokeStyle = "black"),
            (e.lineWidth = 4),
            (e.miterLimit = 3),
            (e.globalAlpha = t));
          const s = 28,
            n = 28,
            o = 1.5 * this.renderer.resolution * t;
          (e.translate(s, n),
            e.scale(o, o),
            e.stroke(Gh),
            e.fill(Gh),
            e.restore(),
            await d.add(a, 1 / this.config.video.fps));
        }
        if (this.config.audio.enabled) {
          for (await c; Atomics.load(s, 0) > this.audioContext.sampleRate; )
            await new Promise((e) => setTimeout(e, 0));
          const e = Math.floor(a * this.audioContext.sampleRate),
            t = e - C;
          (Atomics.add(s, 0, t), (C = e));
        }
        const n = performance.now();
        (n - b > 100 || e === w - 1) &&
          (this.onProgress?.($h(e, w, y)), (b = n));
      }
      return (
        this.log(
          `Encoded frames at ${((1e3 * w) / (performance.now() - k)).toFixed(2)}FPS`,
        ),
        this.config.audio.enabled &&
          (Atomics.add(
            s,
            0,
            this.audioContext.length + this.audioContext.sampleRate - C,
          ),
          await T,
          this.sinkNode.port.postMessage(null),
          await l.promise),
        this.log("Finalizing file"),
        await g.finalize(),
        this.log("Export complete"),
        { type: "success", data: await p.close(this.config.format) }
      );
    } catch (i) {
      return {
        type: "error",
        error: i instanceof Error ? i : new Error("Unknown error"),
      };
    } finally {
      if (this.renderer)
        for (const e of this.composition.clips)
          await e.deinitRenderer(this.renderer);
      (this.audioWorkletUrl && URL.revokeObjectURL(this.audioWorkletUrl),
        this.composition.renderer.start(),
        await this.composition.seek(0));
    }
  }
  async audioCodecs() {
    return await (async (e = ut, t) => {
      const i = await Promise.all(e.map((e) => jo(e, t)));
      return e.filter((e, t) => i[t]);
    })(void 0, {
      numberOfChannels: this.config.audio.numberOfChannels,
      sampleRate: this.config.audio.sampleRate,
      bitrate: this.config.audio.bitrate,
    });
  }
  async videoCodecs() {
    return await (async (e = lt, t) => {
      const i = await Promise.all(e.map((e) => $o(e, t)));
      return e.filter((e, t) => i[t]);
    })(void 0, {
      height: this.composition.height,
      width: this.composition.width,
      bitrate: this.config.video.bitrate,
    });
  }
  log(e) {
    this.config.debug && console.log(e);
  }
}
const Jh = () => {
  class e extends AudioWorkletProcessor {
    constructor(e) {
      (super(),
        (this.buffer = e.processorOptions.buffer),
        (this.port.onmessage = () => {
          this.port.postMessage(new Float32Array(0));
        }));
    }
    process(e, t) {
      const i = e[0],
        r = t[0],
        a = r[0].length;
      for (; Atomics.load(this.buffer, 0) < a; );
      const s = new Float32Array(r.length * r[0].length);
      for (let n = 0; n < Math.min(i.length, r.length); n++)
        s.set(i[n], n * r[0].length);
      return (
        this.port.postMessage(s, [s.buffer]),
        Atomics.sub(this.buffer, 0, a),
        !0
      );
    }
  }
  registerProcessor("sink", e);
};
export {
  E as AUDIO_LOOK_AHEAD,
  p as AsyncMutex,
  nl as AudioClip,
  cc as AudioSource,
  X as BaseSource,
  Sh as CaptionClip,
  dc as CaptionSource,
  Hl as CascadeCaptionPreset,
  Ul as ClassicCaptionPreset,
  vc as Clip,
  xc as ClipDeserializer,
  Hh as Composition,
  R as DateDeserializer,
  Y as DecoderError,
  fl as EllipseClip,
  Dc as EllipseMask,
  Yh as Encoder,
  J as EncoderError,
  Pl as FONT_WEIGHTS,
  I as FPS_INACTIVE,
  Ql as GuineaCaptionPreset,
  Z as IOError,
  Hc as ImageClip,
  hc as ImageSource,
  Dh as Layer,
  Ic as Mask,
  Bc as MaskDeserializer,
  Jl as PaperCaptionPreset,
  Sl as PolygonClip,
  wl as RectangleClip,
  Fc as RectangleMask,
  ee as ReferenceError,
  V as Renderer,
  xl as SAFE_BROSER_FONTS,
  e as Serializer,
  ml as ShapeClip,
  ah as SolarCaptionPreset,
  uc as Source,
  hh as SpotlightCaptionPreset,
  el as TextClip,
  te as ValidationError,
  hl as VideoClip,
  lc as VideoSource,
  Uc as VisualMixin,
  G as VisualSourceMixin,
  vl as WebFonts,
  kh as WhisperCaptionPreset,
  $ as abs,
  l as arraymove,
  m as assert,
  u as assertNever,
  w as audioBufferToWav,
  f as binarySearchLessOrEqual,
  C as blobToMonoBuffer,
  b as bufferToF32Planar,
  T as bufferToI16Interleaved,
  A as canonicalTimeBase,
  h as capitalize,
  d as clamp,
  c as debounce,
  sc as detectMimeType,
  i as displayName,
  x as downloadObject,
  F as env,
  B as f,
  nc as fetchMimeType,
  y as floatTo16BitPCM,
  Fl as getLoadedFonts,
  El as getLocalFonts,
  Il as getWebFonts,
  a as groupBy,
  Lc as hasVisualMixin,
  H as hexWithOpacity,
  g as interleave,
  Vc as isVisualMixinInstance,
  _l as loadFont,
  Bl as matchFontStyle,
  Ml as matchFontWeight,
  v as mimeTypeToExtension,
  D as parseTime,
  n as randInt,
  S as resampleBuffer,
  Al as restoreFonts,
  M as roundTimestamp,
  t as serializable,
  O as serializeSources,
  P as showFileDialog,
  o as sleep,
  s as splitAt,
  _ as timeBase,
  r as toHex,
  z as transcriptToSrt,
  W as transformText,
};
