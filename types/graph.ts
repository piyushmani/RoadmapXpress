export interface RoadmapDetails {
    id: number;
    name: string;
    slug: string;
    maxwidth: number;
    maxheight: number;
    overflow: string;
    float?: string;
    json_file: string;
    others?: {};
}

interface MxfileAttributes {
    host: string;
    modified: string;
    agent: string;
    etag: string;
    version: string;
    type: string;
}

interface DiagramAttributes {
    name: string;
    id: string;
}

interface MxGraphModelAttributes {
    dx: string;
    dy: string;
    grid: string;
    gridSize: string;
    guides: string;
    tooltips: string;
    connect: string;
    arrows: string;
    fold: string;
    page: string;
    pageScale: string;
    pageWidth: string;
    pageHeight: string;
    background: string;
    math: string;
    shadow: string;
}

interface MxGeometryAttributes {
    relative?: string;
    as: string;
    x?: string;
    y?: string;
    width?: string;
    height?: string;
}

interface MxGeometry {
    _attributes: MxGeometryAttributes;
}

interface MxCellAttributes {
    id: string;
    parent?: string;
    value?: string;
    style?: string;
    vertex?: string;
    edge?: string;
    source?: string;
    target?: string;
}

export interface MxCell {
    _attributes: MxCellAttributes;
    mxGeometry?: MxGeometry;
}

interface ObjectAttributes {
    label: string;
    NonResource?: string;
    id: string;
}

interface ObjectNode {
    _attributes: ObjectAttributes;
    mxCell: MxCell;
}

interface Root {
    mxCell: MxCell[];
    object: ObjectNode[];
}

interface MxGraphModel {
    _attributes: MxGraphModelAttributes;
    root: Root;
}

interface Diagram {
    _attributes: DiagramAttributes;
    mxGraphModel: MxGraphModel;
}

interface Mxfile {
    _attributes: MxfileAttributes;
    diagram: Diagram;
}

export interface roadmapData {
    mxfile: Mxfile;
}