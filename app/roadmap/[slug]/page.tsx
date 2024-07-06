import { notFound } from 'next/navigation';

import { adminClient } from '@/lib/db';
import { Roadmap } from '@/components/Roadmap';
import bg from '../../../assets/bg_1.png'
import { RoadmapDetails } from '@/types/graph';

export const revalidate = 5

export default async function Page({ params, }: { params: { slug: string }; }) {

    const getRoadmapDetails = async (slug: string) => {
        const { data, error } = await adminClient.from('roadmaps')
            .select().eq('slug', slug).single()
        if (error) {
            return notFound();
        }
        return data;
    }

    const getRoadmapJsonData = async (file: string) => {
        const { data, error } = await adminClient.storage.from('roadmaps').download(file);
        if (error) {
            return notFound();
        }
        return JSON.parse(new TextDecoder("utf-8").decode(await data.arrayBuffer()));
    }

    const roadmapDetails: RoadmapDetails = await getRoadmapDetails(params.slug);
    const roadmapJsonData = await getRoadmapJsonData(roadmapDetails.json_file);


    return <div style={{backgroundImage: `url(${bg.src})`}}>
        <Roadmap roadmapDetails={roadmapDetails} roadmapData={roadmapJsonData}></Roadmap>
    </div>

}

