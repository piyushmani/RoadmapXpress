import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
  } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link";
import Image from 'next/image';
import Four0Four from '../assets/404.png';


interface Props {
    roadmapId: number
    resourceId: string | undefined
    open: boolean
    onClose: ()=>{}
}

interface Link {
  title: string;
  link: string;
}

interface ResourceData {
  title: string;
  description: string;
  links: Link[];
}

export default function Resources(props: Props) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [resource, setResource] = useState({roadmapId:props.roadmapId,
        resourceId: props.resourceId,
        open:props.open
    })

    const [resourceData, setResourceData] = useState({ title: '', description:'',
        links: [],
        userLinks:[]
    } as ResourceData)

    const setClose=()=>{
        setResource({...resource, open:true})
    }

    const fetchResource = async (roadmap_id:number, resource_id:string)=> {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`/api/roadmap/${roadmap_id}/resource?resourceId=${resource_id}`);
		    const data = await res.json();
        setResourceData({...resourceData, title:data.data.title, description: data.data.description, links:data.data.links})
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    useEffect(()=>{
      if(resource.resourceId && resource.resourceId) fetchResource(resource.roadmapId, resource.resourceId);
    },[resource.roadmapId, resource.resourceId])

    useEffect(()=>{
        setResource({...resource, ...props})
    },[props])


    return <Sheet open={resource.open} onOpenChange={()=>{setClose(); props.onClose()} } >
      <SheetContent className="w-[450px] sm:w-[450px] sm:max-w-none">
        {loading ? 
          <>
            <div className="flex items-start flex-col space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-6 w-[200px] bg-slate-400 rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-2 w-[300px] bg-slate-500 rounded-md" />
                <Skeleton className="h-2 w-[300px] bg-slate-500 rounded-md" />
                <Skeleton className="h-2 w-[300px] bg-slate-500 rounded-md" />
                <Skeleton className="h-2 w-[300px] bg-slate-500 rounded-md" />
                <Skeleton className="h-2 w-[300px] bg-slate-500 rounded-md" />
              </div>
            </div>
          </>
        : error ? (
            <>
              <SheetHeader>
                <SheetTitle>Oops! The Page Seems to Be Missing</SheetTitle>
              </SheetHeader>
              <Image className=" w-64"
                   src={Four0Four}
                  alt="Four0Four"
                />
            </>
        ) : (
          // Data loaded: Display content
          <>
            <SheetHeader>
              <SheetTitle>{resourceData.title}</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4" style={{ fontSize: '14px' }}>
              {resourceData.description}
            </div>
            <div className="grid gap-4 py-4">
              <Accordion type="single" collapsible defaultValue="public-item-1">
                <AccordionItem value="public-item-1">
                  <AccordionTrigger>Resources for further information and insights</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-start flex-col space-y-2">
                      {resourceData.links.map((link, index) => (
                        // Render the links
                        <Link key={index} className="!underline" href={link.link} rel="noopener noreferrer" target="_blank">
                          {link.title}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="private-item-2">
                  <AccordionTrigger>Your own saved Resources</AccordionTrigger>
                  <AccordionContent>
                    Coming soon !!!!
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </>
        )}    
      </SheetContent>
    </Sheet>
}