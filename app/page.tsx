import Link from "next/link";
import Image from 'next/image'
import hero_bg from '../assets/hero_back.svg';
import roadmap from '../assets/roadmap.png';
import resources from '../assets/resources.png';
import theme from '../assets/theme.jpg';

export default function IndexPage() {
  return (
    <>
      <section className="relative flex flex-col items-center justify-center py-12 bg-white bg-cover md:py-16 lg:py-24 min-w-screen tails-bg">
        <div className="flex flex-col-reverse items-center justify-center p-10 mx-auto lg:flex-row lg:max-w-6xl lg:p-0">
          <div className="container relative z-20 flex flex-col w-full px-5 pr-12 mb-16 text-2xl text-gray-700 lg:w-1/2 sm:px-0 md:px-10 sm:items-center lg:items-start lg:mb-0">
            <h1 className="relative z-20 font-sans text-4xl font-extrabold leading-none text-black sm:text-5xl xl:text-6xl sm:text-center lg:text-left">
              <span className="relative">
                <span className="absolute bottom-0 left-0 inline-block w-full h-4 mb-1 -ml-1 transform -skew-x-3 bg-hero"></span>
                <span className="relative">Your Learning Journey with,</span>
              </span>
              <span className="relative block text-hero">roadmapXpress.</span>
            </h1>
            <p className="relative z-20 block mt-6 text-base text-gray-500 xl:text-lg sm:text-center lg:text-left">Begin your learning path with roadmapXpress!  It'll guide you through any topic, providing free resources every step of the way.</p>
            <div className="relative flex items-center mt-10">
              <Link href="/roadmap/backend" className="relative text-2xl group">
                <span className="relative z-10 px-5 py-2 font-bold leading-tight text-black bg-white border-4 border-gray-900 rounded-lg group-hover:bg-hero group-hover:text-white">Backend Roadmap</span>
                <span className="absolute top-0 right-0 w-full h-14 -mt-2.5 -mr-0.5 bg-black rounded-lg"></span>
              </Link>
            </div>
          </div>
          <div className="relative w-full px-8 mb-12 rounded-lg cursor-pointer md:px-0 lg:mb-0 lg:pl-10 md:w-2/3 lg:w-1/2 group">
            <div className="relative rounded-md">
              <img src={hero_bg.src} className="z-10 object-cover w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-white pt-7 pb-7 md:pt-2 md:pb-10">
        <div className="box-border flex flex-col items-center content-center px-8 mx-auto leading-6 text-black border-0 border-gray-300 border-solid md:flex-row max-w-7xl lg:px-16">


          <div className="box-border relative w-full max-w-md px-4 mt-5 mb-2 -ml-5 text-center bg-no-repeat bg-contain border-solid md:ml-0 md:mt-0 md:max-w-none lg:mb-0 md:w-1/2 xl:pl-10">
          <Image
              src={roadmap.src}
              width={400}
              height={350}
              alt="Picture of the roadmap"
            />
          </div>


          <div className="box-border order-first w-full text-black border-solid md:w-1/2 md:pl-10 md:order-none">
            <h2 className="m-0 text-xl font-semibold leading-tight border-0 border-gray-300 lg:text-3xl md:text-2xl">
              Navigate Learning
            </h2>
            <p className="pt-4 pb-8 m-0 leading-7 text-gray-700 border-0 border-gray-300 sm:pr-12 xl:pr-32 lg:text-lg">
            Start Learning with Navigate Learning: Step-by-Step from Simple to Advanced Topics! Feel like you're on a clear path for each topic, starting from basics and moving smoothly to more complex concepts.
            </p>
          </div>
        </div>

        <div className="box-border flex flex-col items-center content-center pt-10 px-8 mx-auto mt-2 leading-6 text-black border-0 border-gray-300 border-solid md:mt-20 xl:mt-0 md:flex-row max-w-7xl lg:px-16">


          <div className="box-border w-full text-black border-solid md:w-1/2 md:pl-6 xl:pl-32">
            <h2 className="m-0 text-xl font-semibold leading-tight border-0 border-gray-300 lg:text-3xl md:text-2xl">
              Resources 
            </h2>
            <p className="pt-4 pb-8 m-0 leading-7 text-gray-700 border-0 border-gray-300 sm:pr-10 lg:text-lg">
              On each topic get short description and free resources.
            </p>
          </div>
          <div className="box-border relative w-full max-w-md px-4 mt-5 mb-2 -ml-5 text-center bg-no-repeat bg-contain border-solid md:ml-0 md:mt-0 md:max-w-none lg:mb-0 md:w-1/2 xl:pl-10">
            <Image
              src={resources.src}
              width={400}
              height={350}
              alt="Picture of the resource"
            />
          </div>
        </div>

        <div className="box-border flex flex-col items-center content-center pt-10 px-8 mx-auto leading-6 text-black border-0 border-gray-300 border-solid md:flex-row max-w-7xl lg:px-16">


          <div className="box-border relative w-full max-w-md px-4 mt-5 mb-2 -ml-5 text-center bg-no-repeat bg-contain border-solid md:ml-0 md:mt-0 md:max-w-none lg:mb-0 md:w-1/2 xl:pl-10">
          <Image
              src={theme.src}
              width={400}
              height={350}
              alt="Picture of the roadmap"
            />
          </div>


          <div className="box-border order-first w-full text-black border-solid md:w-1/2 md:pl-10 md:order-none">
            <h2 className="m-0 text-xl font-semibold leading-tight border-0 border-gray-300 lg:text-3xl md:text-2xl">
              Look and Feel
            </h2>
            <p className="pt-4 pb-8 m-0 leading-7 text-gray-700 border-0 border-gray-300 sm:pr-12 xl:pr-32 lg:text-lg">
              Handwritten Style with different theme color.
            </p>
          </div>
        </div>

      </section>

      <footer className="py-4 text-center text-black-300">
        <p>&copy; 2024 roadmapXpress. All rights reserved.</p>
      </footer>
    </>
  )
}
