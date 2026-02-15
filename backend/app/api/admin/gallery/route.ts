import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const images = await prisma.galleryImage.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        return NextResponse.json(images);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        // Basic permissions check - adjust based on your Role enum
        if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { url, caption } = body;

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        const image = await prisma.galleryImage.create({
            data: {
                url,
                caption,
                order: 0, // Default order, can be managed later
            },
        });

        return NextResponse.json(image);
    } catch (error) {
        return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.galleryImage.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
}
