export type ColorObject = {
    r: Number,
    g: Number,
    b: Number
};

function componentToHex(component: Number) {
    // @ts-ignore
    component = Math.floor(component *= 255);
    let hex = component.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(color: ColorObject) {
    return "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
}

export function convertPaintColor(paint) {
    return {
        type: paint.type,
        visible: paint.visible,
        opacity: paint.opacity,
        blendMode: paint.blendMode,
        color: rgbToHex(paint.color),
    }
}
