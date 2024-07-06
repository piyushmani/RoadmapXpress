import * as React from "react"
import Link from "next/link"
import Image from 'next/image'

import { NavItem } from "@/types/nav"
import { cn } from "@/lib/utils"
import logo from '../assets/logo2.png';


interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
      <Image className=" w-8"
                   src={logo}
                  alt="logo"
                />
      <h1 className="font-heading text-2xl md:text-2xl font-semibold">RoadmapXpress</h1>
      </Link>
      {items?.length ? (
        <nav className="flex gap-6">
          {items?.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium text-muted-foreground",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  {item.title}
                </Link>
              )
          )}
        </nav>
      ) : null}
    </div>
  )
}
