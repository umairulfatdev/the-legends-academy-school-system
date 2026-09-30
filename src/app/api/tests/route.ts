import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tests = await prisma.test.findMany({
      orderBy: {
        testDate: "desc",
      },
      include: {
        classRoom: {
          select: {
            name: true,
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
        teacher: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(tests);
  } catch (error) {
    console.error("GET tests error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load exams.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      type,
      classId,
      subjectId,
      teacherId,
      totalMarks,
      passingMarks,
      testDate,
      startTime,
      durationMinutes,
      isPublished,
    } = body;

    if (
      !title ||
      !classId ||
      !subjectId ||
      !teacherId ||
      totalMarks === undefined ||
      passingMarks === undefined ||
      !testDate
    ) {
      return NextResponse.json(
        {
          error: "Please fill all required exam information.",
        },
        { status: 400 }
      );
    }

    const total = Number(totalMarks);
    const passing = Number(passingMarks);

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        {
          error: "Total marks must be greater than 0.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(passing) || passing < 0) {
      return NextResponse.json(
        {
          error: "Passing marks cannot be negative.",
        },
        { status: 400 }
      );
    }

    if (passing > total) {
      return NextResponse.json(
        {
          error: "Passing marks cannot be greater than total marks.",
        },
        { status: 400 }
      );
    }

    const classRoom = await prisma.classRoom.findUnique({
      where: {
        id: classId,
      },
    });

    if (!classRoom) {
      return NextResponse.json(
        {
          error: "Selected class was not found.",
        },
        { status: 404 }
      );
    }

    const subject = await prisma.subject.findUnique({
      where: {
        id: subjectId,
      },
    });

    if (!subject) {
      return NextResponse.json(
        {
          error: "Selected subject was not found.",
        },
        { status: 404 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        {
          error: "Selected teacher was not found.",
        },
        { status: 404 }
      );
    }

    let session = await prisma.academicSession.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    if (!session) {
      session = await prisma.academicSession.findFirst({
        orderBy: {
          startDate: "desc",
        },
      });
    }

    if (!session) {
      const now = new Date();

      const startYear = now.getFullYear();
      const endYear = startYear + 1;

      session = await prisma.academicSession.create({
        data: {
          name: `${startYear}-${endYear}`,
          startDate: new Date(`${startYear}-04-01`),
          endDate: new Date(`${endYear}-03-31`),
          isActive: true,
        },
      });
    }

    const test = await prisma.test.create({
      data: {
        title,
        description: description || null,
        type: type || "EXAM",
        classId,
        subjectId,
        teacherId,
        sessionId: session.id,
        totalMarks: total,
        passingMarks: passing,
        testDate: new Date(testDate),
        startTime: startTime
          ? new Date(startTime)
          : null,
        durationMinutes:
          durationMinutes !== undefined &&
          durationMinutes !== ""
            ? Number(durationMinutes)
            : null,
        isPublished: Boolean(isPublished),
      },
      include: {
        classRoom: {
          select: {
            name: true,
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
        teacher: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(test, {
      status: 201,
    });
  } catch (error) {
    console.error("POST test error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create exam.",
      },
      { status: 500 }
    );
  }
}