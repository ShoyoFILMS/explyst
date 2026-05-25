export function encodeState(statuses: number[], recommendations: number[], totalTitles: number): string {
    const numStatusBits = totalTitles * 2;
    const numRecBits = 5 * 13;
    const totalBits = numStatusBits + numRecBits;
    const totalBytes = Math.ceil(totalBits / 8);
    
    const buffer = new Uint8Array(totalBytes);
    
    let bitOffset = 0;
    
    function writeBits(value: number, bits: number) {
        for (let i = 0; i < bits; i++) {
            const bit = (value >> (bits - 1 - i)) & 1;
            if (bit) {
                const byteIndex = Math.floor(bitOffset / 8);
                const bitIndex = 7 - (bitOffset % 8);
                buffer[byteIndex] |= (1 << bitIndex);
            }
            bitOffset++;
        }
    }
    
    // Write statuses
    for (let i = 0; i < totalTitles; i++) {
        const status = statuses[i] || 0;
        writeBits(status, 2);
    }
    
    // Write recommendations
    for (let i = 0; i < 5; i++) {
        const recId = recommendations[i] !== undefined ? recommendations[i] : 8191; // 8191 means empty
        writeBits(recId, 13);
    }
    
    // Convert to Base64
    let binary = '';
    for (let i = 0; i < buffer.length; i++) {
        binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
}

export function decodeState(base64: string, totalTitles: number) {
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        buffer[i] = binary.charCodeAt(i);
    }
    
    let bitOffset = 0;
    
    function readBits(bits: number): number {
        let value = 0;
        for (let i = 0; i < bits; i++) {
            const byteIndex = Math.floor(bitOffset / 8);
            if (byteIndex >= buffer.length) break;
            const bitIndex = 7 - (bitOffset % 8);
            const bit = (buffer[byteIndex] >> bitIndex) & 1;
            value = (value << 1) | bit;
            bitOffset++;
        }
        return value;
    }
    
    const statuses: number[] = new Array(totalTitles).fill(0);
    for (let i = 0; i < totalTitles; i++) {
        statuses[i] = readBits(2);
    }
    
    const recommendations: number[] = [];
    for (let i = 0; i < 5; i++) {
        const recId = readBits(13);
        if (recId !== 8191 && recId < totalTitles) {
            recommendations.push(recId);
        }
    }
    
    return { statuses, recommendations };
}
