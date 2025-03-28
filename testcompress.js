
import { atob, btoa } from "buffer"
import { deflateSync, inflateSync } from "fflate"

function zip_encode(str) {
    const ascii = encodeURIComponent(str)
    const array = new TextEncoder().encode(ascii)
    const zip = deflateSync(array, {level: 9})
    // return String.fromCharCode(...zip)
    return btoa(String.fromCharCode(...zip))
}

function zip_decode(base64) {
    const raw = atob(base64)
    const array = Uint8Array.from(raw, c => c.charCodeAt(0))
    const unzip = inflateSync(array)
    const ascii = new TextDecoder().decode(unzip)
    return decodeURIComponent(ascii)
}

// Example usage
const example = "Hello, this is a sample  icon! Hello, this is a sample  icon! Hello, this is a sample  icon! Hello, this is a sample  icon! Hello, this is a sample  icon! Hello, this is a sample  icon! Hello, this is a sample  icon! Hello, this is a sample  icon! Hello, this is a sample  icon! Hello, this is a sample  icon! Hello, this is a sample  icon! "
console.log("Original String:", example)
// Original String: Hello, this is a sample '😎' icon!

const compressed = zip_encode(example)
console.log("Compressed Data:", compressed)
// Compressed Data: 80jNyclXNXJWNTIoycgsBlJgIhGIixNzC3JSgQx1VTcDVUs3VUsLVQtXdZCS5Pw8RQA=

const example_decompressed = zip_decode(compressed)
console.log("Decompressed String:", example_decompressed)
// Decompressed String: Hello, this is a sample '😎' icon!