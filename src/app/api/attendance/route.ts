import { NextRequest, NextResponse } from "next/server";
import { AttendanceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// GET - attendance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const studentId = searchParams.get("studentId");

    const attendance = await prisma.attendance.findMany({
      where: {
        ...(date
          ? {
              date: new Date(date),
            }
          : {}),
        ...(studentId
          ? {
              studentId,
            }
          : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            rollNumber: true,
          },
        },
      },
      orderBy: [
        {
          date: "desc",
        },
        {
          student: {
            fullName: "asc",
          },
        },
      ],
    });

    return NextResponse.json({
      attendance,
    });
  } catch (error) {
    console.error("GET attendance error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load attendance.",
      },
      {
        status: 500,
      }
    );
  }
}

// POST - save attendance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      studentId,
      date,
      status,
      remarks,
    } = body;

    if (!studentId || !date || !status) {
      return NextResponse.json(
        {
          error:
            "Student, date and attendance status are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Object.values(AttendanceStatus).includes(
        status as AttendanceStatus
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid attendance status.",
        },
        {
          status: 400,
        }
      );
    }

    const attendanceDate = new Date(date);

    // Keep date consistent and avoid time differences
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance =
      await prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId,
            date: attendanceDate,
          },
        },
        update: {
          status: status as AttendanceStatus,
          remarks: remarks || null,
        },
        create: {
          studentId,
          date: attendanceDate,
          status: status as AttendanceStatus,
          remarks: remarks || null,
        },
        include: {
          student: {
            select: {
              id: true,
              studentId: true,
              fullName: true,
              rollNumber: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        attendance,
        message: "Attendance saved successfully.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST attendance error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save attendance.",
      },
      {
        status: 500,
      }
    );
  }
}