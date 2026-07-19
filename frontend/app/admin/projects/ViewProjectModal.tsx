import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function ViewProjectModal({ open, onOpenChange, project }: { open: boolean, onOpenChange: (open: boolean) => void, project: any }) {
    if (!project) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl">{project.title}</DialogTitle>
                        <Badge variant={project.isPublished ? "default" : "secondary"}>
                            {project.isPublished ? "Published" : "Draft"}
                        </Badge>
                    </div>
                    <DialogDescription>
                        {project.category}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Price</h4>
                            <p className="text-sm">₹{project.price}</p>
                        </div>
                        {project.originalPrice && (
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Original Price</h4>
                                <p className="text-sm line-through">₹{project.originalPrice}</p>
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Project Type</h4>
                            <p className="text-sm">{project.projectType}</p>
                        </div>
                    </div>

                    {project.techStack && project.techStack.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Tech Stack</h4>
                            <div className="flex flex-wrap gap-2">
                                {project.techStack.map((tech: string, i: number) => (
                                    <Badge key={i} variant="outline">{tech}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {project.features && project.features.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Features</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {project.features.map((feature: string, i: number) => (
                                    <li key={i}>{feature}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {project.demoLink && (
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Demo Link</h4>
                                <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">View Demo</a>
                            </div>
                        )}
                        {project.reportLink && (
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Report Link</h4>
                                <a href={project.reportLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">View Report</a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
