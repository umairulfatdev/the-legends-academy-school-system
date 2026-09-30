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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// GET - single class
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const classRoom = await prisma.classRoom.findUnique({
      where: {
        id,
      },
      include: {
        classTeacher: {
          select: {
            id: true,
            teacherId: true,
            name: true,
          },
        },
        subjects: {
          include: {
            subject: true,
          },
        },
        sections: true,
      },
    });

    if (!classRoom) {
      return NextResponse.json(
        { error: "Class not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(classRoom);
  } catch (error) {
    console.error("GET class error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch class.",
      },
      { status: 500 }
    );
  }
}

// PUT - update class
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const {
      name,
      code,
      classTeacherId,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Class name is required." },
        { status: 400 }
      );
    }

    const existingClass = await prisma.classRoom.findUnique({
      where: {
        id,
      },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found." },
        { status: 404 }
      );
    }

    if (code) {
      const duplicateCode = await prisma.classRoom.findFirst({
        where: {
          code,
          NOT: {
            id,
          },
        },
      });

      if (duplicateCode) {
        return NextResponse.json(
          {
            error: "This class code already exists.",
          },
          { status: 409 }
        );
      }
    }

    if (classTeacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: {
          id: classTeacherId,
        },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: "Selected teacher was not found." },
          { status: 400 }
        );
      }
    }

    const updatedClass = await prisma.classRoom.update({
      where: {
        id,
      },
      data: {
        name: name.trim(),
        code: code?.trim() || null,
        classTeacherId: classTeacherId || null,
      },
      include: {
        classTeacher: {
          select: {
            id: true,
            teacherId: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("PUT class error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update class.",
      },
      { status: 500 }
    );
  }
}

// DELETE - delete class
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const existingClass = await prisma.classRoom.findUnique({
      where: {
        id,
      },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found." },
        { status: 404 }
      );
    }

    await prisma.classRoom.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Class deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE class error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete class.",
      },
      { status: 500 }
    );
  }
}