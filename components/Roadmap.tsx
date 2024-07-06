import { MxCell, roadmapData, RoadmapDetails } from '@/types/graph';
import dynamic from 'next/dynamic'
 
const RoadMapViewer = dynamic(() => import('@/components/RoadMapViewer'), { ssr: false })

interface Props {
    roadmapDetails: RoadmapDetails
    roadmapData: roadmapData
}

export function Roadmap(props: Props) {

    const roadmapDetails = props.roadmapDetails;
    const roadmapGraph = props.roadmapData;
    var allVertexCells : MxCell[] = [];
    var allCells = roadmapGraph.mxfile.diagram.mxGraphModel.root.mxCell;
    var vertexCells = allCells.filter(cell => cell._attributes.vertex );
    var objectCells = roadmapGraph.mxfile.diagram.mxGraphModel.root.object;
    var edgeCells= allCells.filter(cell => cell._attributes.edge);

    objectCells.forEach(cell => {
        var actualCellObject = cell.mxCell;
        var actualCellAttributed = cell._attributes;
        var updatedCellObject = {
            ...actualCellObject,
            _attributes : {...actualCellObject._attributes, ...actualCellAttributed, value: actualCellAttributed.label }
        }
        allVertexCells.push(updatedCellObject)
    });
    allVertexCells = allVertexCells.concat(vertexCells);

    // small fix
    allVertexCells.forEach(cell => {
        if (cell.mxGeometry && cell.mxGeometry._attributes["x"] == undefined) {
            cell.mxGeometry._attributes["x"] = (0).toString();
        }
    })

    return (
        <div style={{
            display: 'flex',
            justifyContent: roadmapDetails.float ? roadmapDetails.float : 'center'
        }}>
            <div style={{
                maxWidth: roadmapDetails.maxwidth,
                maxHeight: roadmapDetails.maxheight,
                overflow: 'hidden',
                cursor : 'default',
            }}>
                <div id='graph-container' ></div>
                <RoadMapViewer
                    roadmapId={roadmapDetails.id}
                    roadmapName={roadmapDetails.name}
                    vetexCells={allVertexCells}
                    edgeCells={edgeCells} 
                >
                </RoadMapViewer>
            </div>
        </div>
    )

  }