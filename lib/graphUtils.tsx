// @ts-nocheck
export const defaultVertexStyle = {
    fontSize: 11,
    strokeColor: '#B3B3B3',
    fillColor: '#ffffffe0',
    fontColor: '#3C3D3B',
}

export const defaultEdgestyle = {
}

export function parseXml(xmlstr) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlstr, "text/xml");
    try {
        return xmlDoc.getElementsByTagName("font")[0].childNodes[0].nodeValue;
    } catch (error) {
        return xmlstr
    }
}

export function checkIsSoucePoint(mxPoint) {
    return mxPoint._attributes.as === "sourcePoint";
}

function formatStyleVal(val) {
    if (isNaN(val)) {
        return val;
    }
    else return parseFloat(val)
}

export function formatStyleStrToObject(style: string) {
    var styleObj: object = {};
    let styleValuesArr = style.split(";");
    var shapeobj = styleValuesArr[0];
    styleValuesArr = styleValuesArr.slice(1);
    let values = shapeobj.split("=");
    if (values[0] != 'shape') {
        styleObj['shape'] = values[0]
    }
    else {
        styleObj['shape'] = values[1]
    }
    styleValuesArr.forEach(function (value) {
        let values = value.split("=");
        if (values[1] != 'default')
            styleObj[values[0]] = values[1] ? formatStyleVal(values[1]) : true
    })
    return styleObj;
}

export function formatVertexStyle(vertexStyle: any, overriddenStyle?: any, isLegend?) {
    const formatedStyle = formatStyleStrToObject(vertexStyle);
    let mergedStyle;
    if (isLegend) {
        mergedStyle = { ...defaultVertexStyle, ...formatedStyle };
    }
    else {
        mergedStyle = { ...defaultVertexStyle, ...formatedStyle, ...overriddenStyle };
    }

    return mergedStyle;
}

export function formatEdgeStyle(edgeStyle: any, overriddenStyle?: any) {
    const formatedStyle = formatStyleStrToObject(edgeStyle);
    const mergedStyle = { ...defaultEdgestyle, ...formatedStyle, ...overriddenStyle };
    return mergedStyle;
}

export function createResourceIDs(vertx: any, name: string) {
    if (vertx._attributes.value && !vertx._attributes.NonResource) {
        return `RESOURCE_${name}_${vertx._attributes.id}`;
    }
    return null
}