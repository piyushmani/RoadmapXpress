
// @ts-nocheck
import { Graph, InternalEvent, Point, Rectangle, cloneUtils } from '@maxgraph/core';
import { checkIsSoucePoint, formatVertexStyle, formatEdgeStyle, createResourceIDs } from "@/lib/graphUtils";

function updateStyle(state, hover) {
    state.style.strokeWidth = hover ? '1.1' : '1';
    state.style.fontStyle = hover ? '1' : '0';
}

export default class GraphViewer {
    private graph;
    private vertexIds;
    private name;

    constructor(container) {
        this.graph = new Graph(container);
        this.graph.setHtmlLabels(true);
        this.vertexIds = {};
        this.graph.setEnabled(false);
    }

    addvertices(vertices, overridenStyle) {
        this.graph.batchUpdate(() => {
            const parent = this.getParent()
            vertices.map((vertex) => {
                try {
                    var vertex_id = `${vertex._attributes.id}`;
                    const vertx = this.graph.insertVertex(
                        parent,
                        createResourceIDs(vertex, this.name),
                        vertex._attributes.value,
                        parseInt(vertex.mxGeometry?._attributes.x),
                        parseInt(vertex.mxGeometry?._attributes.y),
                        parseInt(vertex.mxGeometry?._attributes.width),
                        parseInt(vertex.mxGeometry?._attributes.height),
                        formatVertexStyle(vertex._attributes.style, overridenStyle, vertex._attributes.legend)
                    );
                    this.vertexIds[vertex_id] = vertx;
                } catch (error) {
                    console.log(error)
                }
            })
        });
    }

    addEdges(edges, overriddenEdgeStyle) {
        const parent = this.getParent()
        this.graph.batchUpdate(() => {
            edges.map((edge, idx) => {
                var edge_id = `${edge._attributes.id}`;
                const new_edge = this.graph.insertEdge({
                    parent,
                    value: '',
                    source: this.vertexIds[edge._attributes.source],
                    target: this.vertexIds[edge._attributes.target],
                    style: formatEdgeStyle(edge._attributes.style, overriddenEdgeStyle)
                });
                if (edge.mxGeometry?.Array?.mxPoint) {
                    var intermediatePoints = edge.mxGeometry.Array.mxPoint;
                    var points_arry: Point[] = []
                    if (Array.isArray(intermediatePoints)) {
                        intermediatePoints.forEach(point =>
                            points_arry.push(new Point(parseInt(point._attributes.x), parseInt(point._attributes.y)))
                        )
                    }
                    else {
                        points_arry.push(new Point(parseInt(intermediatePoints._attributes.x), parseInt(intermediatePoints._attributes.y)))
                    }
                    new_edge.geometry.points = points_arry;
                }

                if (edge.mxGeometry?.mxPoint) {
                    if (Array.isArray(edge.mxGeometry.mxPoint)) {
                        new_edge.geometry.setTerminalPoint(
                            new Point(edge.mxGeometry.mxPoint[0]._attributes.x,
                                edge.mxGeometry.mxPoint[0]._attributes.y),
                            checkIsSoucePoint(edge.mxGeometry.mxPoint[0]));
                        new_edge.geometry.setTerminalPoint(
                            new Point(edge.mxGeometry.mxPoint[1]._attributes.x,
                                edge.mxGeometry.mxPoint[1]._attributes.y),
                            checkIsSoucePoint(edge.mxGeometry.mxPoint[1]));
                    }
                    else {
                        new_edge.geometry.setTerminalPoint(
                            new Point(edge.mxGeometry.mxPoint._attributes.x,
                                edge.mxGeometry.mxPoint._attributes.y),
                            checkIsSoucePoint(edge.mxGeometry.mxPoint)
                        );
                    }
                }
            })
        });
    }

    addClickHandler(callback) {
        this.graph.addListener(InternalEvent.CLICK, (sender, evt) => {
            const cell = evt.getProperty('cell');
            if (cell != null && cell.id.includes('RESOURCE_')) {
                callback(cell.id);
            }
        });
    }

    addMouseOverHandler() {
        const graph = this.graph;
        graph.addMouseListener({
            currentState: null,
            previousStyle: null,
            mouseDown(sender, me) {
                if (this.currentState != null) {
                    this.dragLeave(me.getEvent(), this.currentState);
                    this.currentState = null;
                }
            },
            mouseMove(sender, me) {
                if (this.currentState != null && me.getState() == this.currentState) {
                    return;
                }

                let tmp = graph.view.getState(me.getCell());

                // Ignores everything but vertices
                if (graph.isMouseDown || (tmp != null && !tmp.cell.id.includes('RESOURCE_'))) {
                    tmp = null;
                }

                if (tmp != this.currentState) {
                    if (this.currentState != null) {
                        this.dragLeave(me.getEvent(), this.currentState);
                    }

                    this.currentState = tmp;

                    if (this.currentState != null) {
                        this.dragEnter(me.getEvent(), this.currentState);
                    }
                }
            },
            mouseUp(sender, me) {
            },
            dragEnter(evt, state) {
                if (state != null) {
                    this.previousStyle = state.style;
                    state.style = cloneUtils.clone(state.style);
                    updateStyle(state, true);
                    state.shape.apply(state);
                    state.shape.redraw();

                    if (state.text != null) {
                        state.text.apply(state);
                        state.text.redraw();
                    }
                }
            },
            dragLeave(evt, state) {
                if (state != null) {
                    state.style = this.previousStyle;
                    updateStyle(state, false);
                    state.shape.apply(state);
                    state.shape.redraw();

                    if (state.text != null) {
                        state.text.apply(state);
                        state.text.redraw();
                    }
                }
            },
        });
    }

    setName(name: string) {
        this.name = name
    }

    private getParent() {
        return this.graph.getDefaultParent();
    }


}