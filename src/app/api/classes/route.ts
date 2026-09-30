import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

// GET classes
export async function GET() {
  try {
    const classes = await prisma.classRoom.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        classTeacher: {
          select: {
            id: true,
            name: true,
          },
        },
        sections: {
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
    });

    return NextResponse.json({ classes });
  } catch (error) {
    console.error("GET classes error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch classes.",
      },
      { status: 500 }
    );
  }
}

// POST class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      code,
      classTeacherId,
    } = body;

    if (!name) {
      return NextResponse.json(
        {
          error: "Class name is required.",
        },
        { status: 400 }
      );
    }

    if (code) {
      const existingCode =
        await prisma.classRoom.findUnique({
          where: {
            code,
          },
        });

      if (existingCode) {
        return NextResponse.json(
          {
            error: "Class code already exists.",
          },
          { status: 409 }
        );
      }
    }

    const classRoom = await prisma.classRoom.create({
      data: {
        name,
        code: code || null,
        classTeacherId: classTeacherId || null,
      },
      include: {
        classTeacher: {
          select: {
            id: true,
            name: true,
          },
        },
        sections: true,
      },
    });

    return NextResponse.json(
      { classRoom },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST class error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create class.",
      },
      { status: 500 }
    );
  }
}