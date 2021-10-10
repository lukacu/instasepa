import jsQR from 'jsqr';

let inversionAttempts = 'dontInvert';
let grayscaleWeights = {
    // weights for quick luma integer approximation (https://en.wikipedia.org/wiki/YUV#Full_swing_for_BT.601)
    red: 77,
    green: 150,
    blue: 29,
    useIntegerApproximation: true,
};

let eci_encodings = {
    0: "cp437",
    2: "cp437",
    1: "ISO-8859-1", 
    3: "ISO-8859-1",
    4: "ISO-8859-2",
    5: "ISO-8859-3",
    6: "ISO-8859-4",
    7: "ISO-8859-5",
    8: "ISO-8859-6",
    9: "ISO-8859-7",
    10: "ISO-8859-8",
    11: "ISO-8859-9",
    12: "ISO-8859-10",
    13: "ISO-8859-11",
    15: "ISO-8859-13",
    16: "ISO-8859-14",
    21: "Windows-1250",
    22: "Windows-1251",
    23: "Windows-1252",
    24: "Windows-1256",
    25: "UTF-16",
    26: "UTF-8"
};

self.onmessage = event => {
    const type = event['data']['type'];
    const data = event['data']['data'];

    switch (type) {
        case 'decode':
            decode(data);
            break;
        case 'grayscaleWeights':
            setGrayscaleWeights(data);
            break;
        case 'inversionMode':
            setInversionMode(data);
            break;
        case 'close':
            // close after earlier messages in the event loop finished processing
            self.close();
            break;
    }
};

function decode(data) {
    const rgbaData = data['data'];
    const width = data['width'];
    const height = data['height'];
    const result = jsQR(rgbaData, width, height, {
        inversionAttempts: inversionAttempts,
        greyScaleWeights: grayscaleWeights,
    });
    
    let payload = null;
    
    if (result) {
        let encoding = 'utf-8';
        if (result.chunks.length == 2 && result.chunks[0].type == "eci") {
            encoding = eci_encodings[result.chunks[0].assignmentNumber];
            if (!encoding) throw new Error('Unknown ECI encoding type');
            if (result.chunks[1].type == "byte") {
                payload = new TextDecoder(encoding).decode(new Uint8Array(result.chunks[1].bytes));
            } else throw new Error('Illegal chunk order');
        } else if (result.chunks.length == 2 && result.chunks[0].type == "bytes") {
            payload = result.data;
        } else {
            console.log(result);
             throw new Error('Unable to decode data');
        }
    
    }
                
    self.postMessage({
        type: 'qrResult',
        data: payload,
    });
}

function setGrayscaleWeights(data) {
    // update grayscaleWeights in a closure compiler compatible fashion
    grayscaleWeights.red = data['red'];
    grayscaleWeights.green = data['green'];
    grayscaleWeights.blue = data['blue'];
    grayscaleWeights.useIntegerApproximation = data['useIntegerApproximation'];
}

function setInversionMode(inversionMode) {
    switch (inversionMode) {
        case 'original':
            inversionAttempts = 'dontInvert';
            break;
        case 'invert':
            inversionAttempts = 'onlyInvert';
            break;
        case 'both':
            inversionAttempts = 'attemptBoth';
            break;
        default:
            throw new Error('Invalid inversion mode');
    }
}
