declare module 'heic-convert' {
  type InputBuffer = Buffer | ArrayBuffer | Uint8Array

  type ConvertOptions = {
    buffer: InputBuffer
    format: 'JPEG' | 'PNG'
    quality?: number
  }

  function convert(options: ConvertOptions): Promise<ArrayBuffer | Buffer | Uint8Array>

  export default convert
}
