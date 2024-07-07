// @ts-nocheck
"use client";
import GraphViewer from '@/lib/graphViewer';
import { useEffect, useState } from 'react';
import Resources from './Resources';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import ThemeSelector from './ui/theme-selector';
import { Palette } from 'lucide-react';
import { PopoverClose } from '@radix-ui/react-popover';
import { XCircle } from 'lucide-react';
import { MxCell } from '@/types/graph';

interface Props {
    vetexCells: MxCell[]
    edgeCells: MxCell[]
    roadmapId: number | undefined,
    roadmapName: string
}

export default function RoadMapViewer(props: Props) {

    const [resources, setResources] = useState({
        roadmapId: props.roadmapId,
        resourceId: undefined,
        open: false
    })
    const [theme, setTheme] = useState({});
    const [openThemeSetting, setOpenThemeSetting] = useState(false);

    const handleClick = (id: string) => {
        setResources({
            ...resources,
            open: true,
            resourceId: id
        })
    }

    const onClose = () => {
        setResources({ ...resources, open: false })
    }

    const openThemeSettingPopOver = () => {
        setOpenThemeSetting(!openThemeSetting)
    }

    const handleSelectTheme = (theme) => {
        localStorage.setItem('savedTheme', JSON.stringify(theme));
        setTheme(theme);
    };

    const drawRoadmapGraph = (overriddenVertexStyle?: Object, overriddenEdgeStyle?: Object) => {
        const graph = new GraphViewer(document.getElementById('graph-container'))
        graph.setName(props.roadmapName)
        graph.addvertices(props.vetexCells, overriddenVertexStyle);
        graph.addEdges(props.edgeCells, overriddenEdgeStyle);
        graph.addClickHandler(handleClick);
        graph.addMouseOverHandler()
    }

    useEffect(() => {
        const savedTheme = localStorage.getItem('savedTheme');
        if (savedTheme) {
            const themeStyle = JSON.parse(savedTheme);
            if (themeStyle.name == 'default') drawRoadmapGraph()
            else drawRoadmapGraph(themeStyle.vertex, themeStyle.edge)
        }
        else drawRoadmapGraph()
    }, []);

    useEffect(() => {
        if (Object.keys(theme).length) {
            document.getElementById('graph-container').innerHTML = '';
            if (theme.name == 'default') drawRoadmapGraph()
            else drawRoadmapGraph(theme.vertex, theme.edge)

        }

    }, [theme]);

    return (
        <>
            <Popover >
                <PopoverTrigger asChild>
                    <button onClick={openThemeSettingPopOver}
                        className="fixed bottom-4 right-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full shadow-md"
                    >
                        <Palette className="h-[1.5rem] w-[1.3rem] dark:hidden" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <PopoverClose asChild>
                        <div style={{ position: 'fixed', right: '7px', top: '3px' }}>
                            <XCircle size={16} />
                        </div>
                    </PopoverClose>
                    <div className="">
                        <ThemeSelector onSelectTheme={handleSelectTheme} />
                    </div>
                </PopoverContent>
            </Popover>

            <Resources open={resources.open} onClose={onClose}
                roadmapId={resources.roadmapId} resourceId={resources.resourceId} />
        </>

    )
}