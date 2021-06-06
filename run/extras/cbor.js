/**
 * The Concise Binary Object Representation (CBOR) data format (RFC 7049)
 * implemented in pure JavaScript for RUN.
 * 
 * This module currently ONLY implements the `decode()` function.
 * 
 * Original source:
 * 
 * * https://github.com/aaronhuggins/cbor-redux - Copyright (c) 2020-2021 Aaron Huggins - MIT License
 * * https://github.com/paroga/cbor-js - Copyright (c) 2014-2016 Patrick Gansterer - MIT License
 */
class CBOR {
  /**
   * Converts a Concise Binary Object Representation (CBOR) binary into a data object.
   * 
   * @param {Uint8Array} data A valid CBOR buffer
   * @param {Function} taggerFn A function that extracts tagged values
   * @param {Function} simpleFn A function that extracts simple values
   * @returns {any} The CBOR buffer converted to a JavaScript value
   */
  static decode(data, taggerFn, simpleFn) {
    const POW_2_24 = 5.960464477539063e-8
    const POW_2_32 = 4294967296
    const DECODE_CHUNK_SIZE = 8192

    let dataView = new DataView(data.buffer)
    let offset = 0

    const tagValueFunction = typeof taggerFn === 'function' ? taggerFn : (value, _tag) => value;
    const simpleValFunction = typeof simpleFn === 'function' ? simpleFn : (_value) => undefined;

    function commitRead(length, value) {
      offset += length
      return value
    }

    function readArrayBuffer(length) {
      return commitRead(length, new Uint8Array(data, offset, length))
    }

    function readFloat16() {
      let tempArrayBuffer = new ArrayBuffer(4)
      let tempDataView = new DataView(tempArrayBuffer)
      let value = readUint16()
      let sign = value & 0x8000
      let exponent = value & 0x7c00
      let fraction = value & 0x03ff
      if (exponent === 0x7c00) exponent = 0xff << 10;
      else if (exponent !== 0) exponent += (127 - 15) << 10;
      else if (fraction !== 0) return (sign ? -1 : 1) * fraction * POW_2_24;
      tempDataView.setUint32(0, (sign << 16) | (exponent << 13) | (fraction << 13))
      return tempDataView.getFloat32(0)
    }

    function readFloat32() {
      return commitRead(4, dataView.getFloat32(offset))
    }

    function readFloat64() {
      return commitRead(8, dataView.getFloat64(offset))
    }

    function readUint8() {
      return commitRead(1, data[offset])
    }

    function readUint16() {
      return commitRead(2, dataView.getUint16(offset))
    }

    function readUint32() {
      return commitRead(4, dataView.getUint32(offset))
    }

    function readUint64() {
      return readUint32() * POW_2_32 + readUint32()
    }

    function readBreak() {
      if (data[offset] !== 0xff) return false;
      offset += 1
      return true
    }

    function readLength(addInfo) {
      if (addInfo < 24)   return addInfo;
      if (addInfo === 24) return readUint8();
      if (addInfo === 25) return readUint16();
      if (addInfo === 26) return readUint32();
      if (addInfo === 27) return readUint64();
      if (addInfo === 31) return -1;
      throw new Error('Invalid length encoding')
    }

    function readIndefiniteStringLength(majorType) {
      let initialByte = readUint8()
      if (initialByte === 0xff) return -1;
      let length = readLength(initialByte & 0x1f)
      if (length < 0 || initialByte >> 5 !== majorType) {
        throw new Error('Invalid indefinite length element')
      }
      return length
    }

    function appendUtf16Data(utf16data, length) {
      for (let i = 0; i < length; ++i) {
        let value = readUint8()
        if (value & 0x80) {
          if (value < 0xe0) {
            value = ((value & 0x1f) << 6) | (readUint8() & 0x3f)
            length -= 1
          }
          else if (value < 0xf0) {
            value = ((value & 0x0f) << 12) | ((readUint8() & 0x3f) << 6) | (readUint8() & 0x3f)
            length -= 2
          }
          else {
            value = ((value & 0x0f) << 18) | ((readUint8() & 0x3f) << 12) | ((readUint8() & 0x3f) << 6) | (readUint8() & 0x3f)
            length -= 3
          }
        }
        if (value < 0x10000) {
          utf16data.push(value)
        }
        else {
          value -= 0x10000
          utf16data.push(0xd800 | (value >> 10))
          utf16data.push(0xdc00 | (value & 0x3ff))
        }
      }
    }

    function decodeItem() {
      let initialByte = readUint8();
      let majorType = initialByte >> 5;
      let addInfo = initialByte & 0x1f;
      let i;
      let length;
      if (majorType === 7) {
        switch (addInfo) {
          case 25:
            return readFloat16();
          case 26:
            return readFloat32();
          case 27:
            return readFloat64();
        }
      }
      length = readLength(addInfo);
      
      if (length < 0 && (majorType < 2 || 6 < majorType))
        throw new Error('Invalid length');

      switch (majorType) {
        case 0:
          return length;
        case 1:
          return -1 - length;
        case 2:
          if (length < 0) {
            let elements = [];
            let fullArrayLength = 0;
            while ((length = readIndefiniteStringLength(majorType)) >= 0) {
              fullArrayLength += length;
              elements.push(readArrayBuffer(length));
            }
            let fullArray = new Uint8Array(fullArrayLength);
            let fullArrayOffset = 0;
            for (i = 0; i < elements.length; ++i) {
              fullArray.set(elements[i], fullArrayOffset);
              fullArrayOffset += elements[i].length;
            }
            return fullArray;
          }
          return readArrayBuffer(length);
        case 3:
          let utf16data = [];
          if (length < 0) {
            while ((length = readIndefiniteStringLength(majorType)) >= 0)
              appendUtf16Data(utf16data, length);
          }
          else {
            appendUtf16Data(utf16data, length);
          }
          let string = '';
          for (i = 0; i < utf16data.length; i += DECODE_CHUNK_SIZE) {
            string += String.fromCharCode.apply(null, utf16data.slice(i, i + DECODE_CHUNK_SIZE));
          }
          return string;
        case 4:
          let retArray;
          if (length < 0) {
            retArray = [];
            while (!readBreak())
              retArray.push(decodeItem());
          }
          else {
            retArray = new Array(length);
            for (i = 0; i < length; ++i)
              retArray[i] = decodeItem();
          }
          return retArray;
        case 5:
          let retObject = {};
          for (i = 0; i < length || (length < 0 && !readBreak()); ++i) {
            let key = decodeItem();
            retObject[key] = decodeItem();
          }
          return retObject;
        case 6:
          return tagValueFunction(decodeItem(), length);
        case 7:
          switch (length) {
            case 20:
              return false;
            case 21:
              return true;
            case 22:
              return null;
            case 23:
              return undefined;
            default:
              return simpleValFunction(length);
          }
      }
    }

    const ret = decodeItem()
    if (offset !== data.byteLength) throw new Error('Remaining bytes');
    return ret
  }
}

CBOR.presets = {
  main: {
    location: '73c0da3d071389ec188ab9160ede4d8e929ce14ed793c117e17512276eca076d_o3',
    origin: '73c0da3d071389ec188ab9160ede4d8e929ce14ed793c117e17512276eca076d_o3',
    nonce: 1,
    owner: '1G6uiPUxTidmqDpzj9WQbt75vFDCeeSCJg',
    satoshis: 0
  }
}

export default CBOR