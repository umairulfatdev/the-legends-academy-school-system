import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get("testId");

    if (!testId) {
      return NextResponse.json(
        { error: "Test ID is required." },
        { status: 400 }
      );
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: {
        id: true,
        title: true,
        classId: true,
        subjectId: true,
        totalMarks: true,
        passingMarks: true,
      },
    });

    if (!test) {
      return NextResponse.json(
        { error: "Exam not found." },
        { status: 404 }
      );
    }

    const students = await prisma.student.findMany({
      where: {
        enrollments: {
          some: {
            classId: test.classId,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        rollNumber: true,
      },
      orderBy: {
        fullName: "asc",
      },
    });

    const marks = await prisma.mark.findMany({
      where: {
        testId,
      },
      select: {
        id: true,
        studentId: true,
        subjectId: true,
        obtained: true,
        remarks: true,
      },
    });

    const markMap = new Map(
      marks.map((mark) => [
        mark.studentId,
        {
          id: mark.id,
          obtained: Number(mark.obtained),
          remarks: mark.remarks ?? "",
        },
      ])
    );

    const result = students.map((student) => {
      const mark = markMap.get(student.id);

      return {
        studentId: student.id,
        studentName: student.fullName,
        rollNumber: student.rollNumber ?? "",
        markId: mark?.id ?? null,
        obtained: mark?.obtained ?? "",
        remarks: mark?.remarks ?? "",
      };
    });

    return NextResponse.json({
      test,
      students: result,
    });
  } catch (error) {
    console.error("GET marks error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load marks.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { testId, results } = body;

    if (!testId || !Array.isArray(results)) {
      return NextResponse.json(
        {
          error: "Test ID and results are required.",
        },
        { status: 400 }
      );
    }

    const test = await prisma.test.findUnique({
      where: {
        id: testId,
      },
    });

    if (!test) {
      return NextResponse.json(
        {
          error: "Exam not found.",
        },
        { status: 404 }
      );
    }

    for (const result of results) {
      if (!result.studentId) {
        continue;
      }

      const obtained = Number(result.obtained);

      if (
        !Number.isFinite(obtained) ||
        obtained < 0 ||
        obtained > test.totalMarks
      ) {
        return NextResponse.json(
          {
            error: `Invalid marks for student ${result.studentId}.`,
          },
          { status: 400 }
        );
      }

      await prisma.mark.upsert({
        where: {
          testId_studentId: {
            testId,
            studentId: result.studentId,
          },
        },
        update: {
          subjectId: test.subjectId,
          obtained,
          remarks: result.remarks || null,
        },
        create: {
          testId,
          studentId: result.studentId,
          subjectId: test.subjectId,
          obtained,
          remarks: result.remarks || null,
        },
      });
    }

    return NextResponse.json({
      message: "Marks saved successfully.",
    });
  } catch (error) {
    console.error("POST marks error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save marks.",
      },
      { status: 500 }
    );
  }
}