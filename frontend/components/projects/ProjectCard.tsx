"use client";

import { motion } from "framer-motion";
import { ArrowRight, Code2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import _Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
    id: string;
    title: string;
    description: string;
    price: string;
    originalPrice?: string;
    image: string;
    techStack: string[];
    category: string;
    index: number;
}

export function ProjectCard({ id: _id,
    title,
    description,
    price,
    originalPrice,
    image,
    techStack,
    category,
    index,
}: ProjectCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm transition-all hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1"
        >
            <div className="relative aspect-video overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 z-20">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-md border border-border/50">
                        {category}
                    </Badge>
                </div>
            </div>

            <div className="flex flex-col flex-1 p-6 relative z-20">
                <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                    {description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {techStack.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs bg-primary/5 border-primary/20">
                            {tech}
                        </Badge>
                    ))}
                    {techStack.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{techStack.length - 3}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground line-through">
                            {originalPrice}
                        </span>
                        <span className="text-lg font-bold text-primary">
                            {price}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-full">
                            <ShoppingCart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="rounded-full gap-1 group/btn">
                            Details
                            <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
